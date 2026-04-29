// OOS Operating Plan — CRUD API.
// Phase 3 scope: read plan + sections + items, update plan metadata, update section content_json,
// create + update execution items. Auth: any org member can read/write their own plan.
// Push-to-OOS (foot-cannon write to load-bearing OOS) is super-admin gated; lives in admin.ts (Phase 6).

import type { FastifyInstance } from 'fastify';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../config/database.js';
import {
  oosOperatingPlans,
  oosOperatingPlanSections,
  oosExecutionItems,
} from '../../db/schema.js';
import { getAuthOrg } from '../../middleware/auth-helpers.js';
import { recalculateAssignments } from '../../services/oos-plan-assignment.js';

// Calendar quarter helper, mirrors the one in pages.ts.
function quarterLabel(d: Date): string {
  const q = Math.floor(d.getMonth() / 3) + 1;
  return `Q${q}-${d.getFullYear()}`;
}

const planUpdateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
});

const sectionUpdateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  contentJson: z.record(z.string(), z.unknown()).optional(),
  sortOrder: z.number().int().min(0).optional(),
});

const ownerTypeEnum = z.enum(['employee', 'agent', 'hybrid', 'unassigned']);
const itemBaseSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().nullable().optional(),
  outcome: z.string().nullable().optional(),
  priority: z.enum(['critical', 'high', 'medium', 'low']).optional(),
  status: z.enum(['proposed', 'accepted', 'in_progress', 'at_risk', 'completed', 'deferred']).optional(),
  dueDate: z.string().datetime().nullable().optional(),
  quarter: z.string().regex(/^Q[1-4]-\d{4}$/),
  assignedOwnerType: ownerTypeEnum.optional(),
  assignedOwnerId: z.string().max(255).nullable().optional(),
  assignedOwnerName: z.string().max(255).nullable().optional(),
  secondaryOwnerType: ownerTypeEnum.nullable().optional(),
  secondaryOwnerId: z.string().max(255).nullable().optional(),
  secondaryOwnerName: z.string().max(255).nullable().optional(),
  confidenceScore: z.number().min(0).max(100).nullable().optional(),
  assignmentReason: z.string().nullable().optional(),
  sourceReferencesJson: z.array(z.unknown()).optional(),
  createdByAi: z.boolean().optional(),
});
const itemCreateSchema = itemBaseSchema;
const itemUpdateSchema = itemBaseSchema.partial();

// Look up the plan and confirm it belongs to the requester's org.
// Returns the plan or null. Caller is responsible for the 404/403 response.
async function getPlanForOrg(planId: string, orgId: string) {
  const arr = await db
    .select()
    .from(oosOperatingPlans)
    .where(and(eq(oosOperatingPlans.id, planId), eq(oosOperatingPlans.organizationId, orgId)))
    .limit(1);
  return arr[0] || null;
}

export default async function oosOperatingPlanRoutes(app: FastifyInstance) {

  // ============================================================
  // GET /api/v1/oos-operating-plan/current — current org's active plan + sections + current-quarter items
  // ============================================================
  app.get('/oos-operating-plan/current', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in required' } });

    const planArr = await db
      .select()
      .from(oosOperatingPlans)
      .where(and(eq(oosOperatingPlans.organizationId, org.id), eq(oosOperatingPlans.status, 'active')))
      .orderBy(desc(oosOperatingPlans.createdAt))
      .limit(1);
    const plan = planArr[0] || null;
    if (!plan) return { plan: null, sections: [], executionItems: [] };

    const sections = await db
      .select()
      .from(oosOperatingPlanSections)
      .where(eq(oosOperatingPlanSections.planId, plan.id))
      .orderBy(oosOperatingPlanSections.sortOrder);

    const currentQuarter = quarterLabel(new Date());
    const executionItems = await db
      .select()
      .from(oosExecutionItems)
      .where(and(eq(oosExecutionItems.planId, plan.id), eq(oosExecutionItems.quarter, currentQuarter)))
      .orderBy(desc(oosExecutionItems.createdAt));

    return { plan, sections, executionItems, currentQuarter };
  });

  // ============================================================
  // PATCH /api/v1/oos-operating-plan/:planId — update plan title/status
  // ============================================================
  app.patch<{ Params: { planId: string } }>('/oos-operating-plan/:planId', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in required' } });

    const plan = await getPlanForOrg(request.params.planId, org.id);
    if (!plan) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Plan not found' } });

    const parsed = planUpdateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: { code: 'INVALID_INPUT', details: parsed.error.issues } });
    }
    if (Object.keys(parsed.data).length === 0) return { plan };

    const [updated] = await db
      .update(oosOperatingPlans)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(oosOperatingPlans.id, plan.id))
      .returning();

    return { plan: updated };
  });

  // ============================================================
  // PATCH /api/v1/oos-operating-plan/sections/:sectionId — update section content
  // ============================================================
  app.patch<{ Params: { sectionId: string } }>('/oos-operating-plan/sections/:sectionId', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in required' } });

    const sectionArr = await db
      .select()
      .from(oosOperatingPlanSections)
      .where(eq(oosOperatingPlanSections.id, request.params.sectionId))
      .limit(1);
    const section = sectionArr[0];
    if (!section) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Section not found' } });

    const plan = await getPlanForOrg(section.planId, org.id);
    if (!plan) return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Section does not belong to your org' } });

    const parsed = sectionUpdateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: { code: 'INVALID_INPUT', details: parsed.error.issues } });
    }
    if (Object.keys(parsed.data).length === 0) return { section };

    const [updated] = await db
      .update(oosOperatingPlanSections)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(oosOperatingPlanSections.id, section.id))
      .returning();

    // Mark the parent plan updated so dashboards refresh cleanly.
    await db
      .update(oosOperatingPlans)
      .set({ updatedAt: new Date() })
      .where(eq(oosOperatingPlans.id, plan.id));

    return { section: updated };
  });

  // ============================================================
  // GET /api/v1/oos-operating-plan/:planId/items — list execution items (optional quarter filter)
  // ============================================================
  app.get<{ Params: { planId: string }; Querystring: { quarter?: string } }>('/oos-operating-plan/:planId/items', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in required' } });

    const plan = await getPlanForOrg(request.params.planId, org.id);
    if (!plan) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Plan not found' } });

    const quarter = request.query.quarter;
    const where = quarter
      ? and(eq(oosExecutionItems.planId, plan.id), eq(oosExecutionItems.quarter, quarter))
      : eq(oosExecutionItems.planId, plan.id);
    const items = await db.select().from(oosExecutionItems).where(where).orderBy(desc(oosExecutionItems.createdAt));

    return { items, count: items.length };
  });

  // ============================================================
  // POST /api/v1/oos-operating-plan/:planId/items — create execution item
  // ============================================================
  app.post<{ Params: { planId: string } }>('/oos-operating-plan/:planId/items', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in required' } });

    const plan = await getPlanForOrg(request.params.planId, org.id);
    if (!plan) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Plan not found' } });

    const parsed = itemCreateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: { code: 'INVALID_INPUT', details: parsed.error.issues } });
    }

    const data = parsed.data;
    const [inserted] = await db
      .insert(oosExecutionItems)
      .values({
        planId: plan.id,
        title: data.title,
        description: data.description ?? null,
        outcome: data.outcome ?? null,
        priority: data.priority ?? 'medium',
        status: data.status ?? 'proposed',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        quarter: data.quarter,
        assignedOwnerType: data.assignedOwnerType ?? 'unassigned',
        assignedOwnerId: data.assignedOwnerId ?? null,
        assignedOwnerName: data.assignedOwnerName ?? null,
        secondaryOwnerType: data.secondaryOwnerType ?? null,
        secondaryOwnerId: data.secondaryOwnerId ?? null,
        secondaryOwnerName: data.secondaryOwnerName ?? null,
        confidenceScore: data.confidenceScore ?? null,
        assignmentReason: data.assignmentReason ?? null,
        sourceReferencesJson: data.sourceReferencesJson ?? [],
        createdByAi: data.createdByAi ?? false,
        userModified: true,
      })
      .returning();

    return reply.status(201).send({ item: inserted });
  });

  // ============================================================
  // PATCH /api/v1/oos-operating-plan/items/:itemId — update execution item
  // ============================================================
  app.patch<{ Params: { itemId: string } }>('/oos-operating-plan/items/:itemId', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in required' } });

    const itemArr = await db
      .select()
      .from(oosExecutionItems)
      .where(eq(oosExecutionItems.id, request.params.itemId))
      .limit(1);
    const item = itemArr[0];
    if (!item) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Item not found' } });

    const plan = await getPlanForOrg(item.planId, org.id);
    if (!plan) return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Item does not belong to your org' } });

    const parsed = itemUpdateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: { code: 'INVALID_INPUT', details: parsed.error.issues } });
    }
    if (Object.keys(parsed.data).length === 0) return { item };

    const data = parsed.data;
    const patch: Partial<typeof oosExecutionItems.$inferInsert> = {
      userModified: true,
      updatedAt: new Date(),
    };
    if (data.title !== undefined) patch.title = data.title;
    if (data.description !== undefined) patch.description = data.description ?? null;
    if (data.outcome !== undefined) patch.outcome = data.outcome ?? null;
    if (data.priority !== undefined) patch.priority = data.priority;
    if (data.status !== undefined) patch.status = data.status;
    if (data.dueDate !== undefined) patch.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    if (data.quarter !== undefined) patch.quarter = data.quarter;
    if (data.assignedOwnerType !== undefined) patch.assignedOwnerType = data.assignedOwnerType;
    if (data.assignedOwnerId !== undefined) patch.assignedOwnerId = data.assignedOwnerId ?? null;
    if (data.assignedOwnerName !== undefined) patch.assignedOwnerName = data.assignedOwnerName ?? null;
    if (data.secondaryOwnerType !== undefined) patch.secondaryOwnerType = data.secondaryOwnerType ?? null;
    if (data.secondaryOwnerId !== undefined) patch.secondaryOwnerId = data.secondaryOwnerId ?? null;
    if (data.secondaryOwnerName !== undefined) patch.secondaryOwnerName = data.secondaryOwnerName ?? null;
    if (data.confidenceScore !== undefined) patch.confidenceScore = data.confidenceScore ?? null;
    if (data.assignmentReason !== undefined) patch.assignmentReason = data.assignmentReason ?? null;
    if (data.sourceReferencesJson !== undefined) patch.sourceReferencesJson = data.sourceReferencesJson;

    const [updated] = await db
      .update(oosExecutionItems)
      .set(patch)
      .where(eq(oosExecutionItems.id, item.id))
      .returning();

    return { item: updated };
  });

  // ============================================================
  // POST /api/v1/oos-operating-plan/:planId/recalculate-assignments
  // Re-runs the deterministic owner recommender across all eligible
  // current-quarter items. Items the user has explicitly modified are skipped
  // (per spec: every auto-assignment must be editable, and once edited, must
  // not be overwritten silently).
  // ============================================================
  app.post<{ Params: { planId: string }; Querystring: { quarter?: string } }>(
    '/oos-operating-plan/:planId/recalculate-assignments',
    async (request, reply) => {
      const org = await getAuthOrg(request);
      if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in required' } });

      const plan = await getPlanForOrg(request.params.planId, org.id);
      if (!plan) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Plan not found' } });

      const quarter = request.query.quarter ?? quarterLabel(new Date());
      try {
        const result = await recalculateAssignments(org.id, org.name, plan.id, quarter);
        return { quarter, ...result };
      } catch (err) {
        request.log.error({ err }, '[oos-plan] recalculate-assignments failed');
        return reply.status(500).send({
          error: { code: 'RECALCULATE_FAILED', message: err instanceof Error ? err.message : 'unknown' },
        });
      }
    },
  );

}
