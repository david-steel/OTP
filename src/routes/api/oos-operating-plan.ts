// OOS Operating Plan — CRUD API.
// Phase 3 scope: read plan + sections + items, update plan metadata, update section content_json,
// create + update execution items. Auth: any org member can read/write their own plan.
// Push-to-OOS (foot-cannon write to load-bearing OOS) is super-admin gated; lives in admin.ts (Phase 6).

import type { FastifyInstance } from 'fastify';
import { eq, and, desc, sql, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../config/database.js';
import {
  oosOperatingPlans,
  oosOperatingPlanSections,
  oosExecutionItems,
  oosPlanSyncEvents,
  claims,
} from '../../db/schema.js';
import { getAuthOrg } from '../../middleware/auth-helpers.js';
import { recalculateAssignments } from '../../services/oos-plan-assignment.js';
import { buildPreview } from '../../services/oos-plan-claim-builder.js';
import { isSuperAdmin } from '../../middleware/super-admin.js';
import { getAuth } from '@clerk/fastify';

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

  // ============================================================
  // POST /api/v1/oos-operating-plan/:planId/preview-sync
  // Reads execution items (current quarter, status >= 'accepted' by default,
  // or explicit itemIds), builds proposed OOS claims, finds matches in the
  // org's published OOS for diff, saves a sync_event with type='preview',
  // and returns the diff so the UI can show it. NO write to claims yet.
  // ============================================================
  const previewSyncSchema = z.object({
    itemIds: z.array(z.string().uuid()).optional(),
    quarter: z.string().regex(/^Q[1-4]-\d{4}$/).optional(),
    includeProposed: z.boolean().optional(), // include status='proposed' items (default: false)
  });

  app.post<{ Params: { planId: string } }>('/oos-operating-plan/:planId/preview-sync', async (request, reply) => {
    const auth = getAuth(request);
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in required' } });

    const plan = await getPlanForOrg(request.params.planId, org.id);
    if (!plan) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Plan not found' } });

    const parsed = previewSyncSchema.safeParse(request.body ?? {});
    if (!parsed.success) {
      return reply.status(400).send({ error: { code: 'INVALID_INPUT', details: parsed.error.issues } });
    }
    const { itemIds, quarter, includeProposed } = parsed.data;
    const targetQuarter = quarter ?? quarterLabel(new Date());

    // Resolve which items to preview.
    let items: typeof oosExecutionItems.$inferSelect[];
    if (itemIds && itemIds.length > 0) {
      items = await db
        .select()
        .from(oosExecutionItems)
        .where(and(eq(oosExecutionItems.planId, plan.id)));
      items = items.filter(i => itemIds.includes(i.id));
    } else {
      items = await db
        .select()
        .from(oosExecutionItems)
        .where(and(eq(oosExecutionItems.planId, plan.id), eq(oosExecutionItems.quarter, targetQuarter)));
      // Default: only items the operator has actively committed to (accepted/in_progress/at_risk).
      // Pass includeProposed=true to also preview proposed items.
      const allowedStatuses = includeProposed
        ? new Set(['proposed', 'accepted', 'in_progress', 'at_risk'])
        : new Set(['accepted', 'in_progress', 'at_risk']);
      items = items.filter(i => allowedStatuses.has(i.status));
    }

    try {
      const preview = await buildPreview(org.id, plan, items);

      // Persist the preview as a sync_event for audit + UI traceability.
      // Strip the matchedClaimDbValue (full row) before snapshot so the JSON stays small.
      const claimsForSnapshot = preview.proposedClaims.map(c => {
        const { matchedClaimDbValue: _omit, ...rest } = c;
        return rest;
      });
      const [event] = await db
        .insert(oosPlanSyncEvents)
        .values({
          planId: plan.id,
          organizationId: org.id,
          syncType: 'preview',
          pushedBy: auth.userId ?? 'unknown',
          beforeSnapshotJson: { quarter: targetQuarter, itemCount: items.length },
          afterSnapshotJson: { proposedClaims: claimsForSnapshot, summary: preview.summary, oosFileId: preview.oosFileId },
          claimIdsJson: preview.proposedClaims.map(c => c.claimId),
        })
        .returning();

      return {
        syncEventId: event.id,
        quarter: targetQuarter,
        itemsPreviewed: items.length,
        oosFileId: preview.oosFileId,
        summary: preview.summary,
        proposedClaims: claimsForSnapshot,
      };
    } catch (err) {
      request.log.error({ err }, '[oos-plan] preview-sync failed');
      return reply.status(500).send({
        error: { code: 'PREVIEW_FAILED', message: err instanceof Error ? err.message : 'unknown' },
      });
    }
  });

  // ============================================================
  // POST /api/v1/oos-operating-plan/:planId/push-to-oos
  // SUPER-ADMIN GATE — this writes to the OOS, which is load-bearing.
  // Per Nitay-trim discipline: load-bearing writes get the strictest gate.
  // ============================================================
  app.post<{ Params: { planId: string } }>('/oos-operating-plan/:planId/push-to-oos', async (request, reply) => {
    if (!isSuperAdmin(request)) {
      return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Push to OOS requires super-admin authorization (load-bearing write).' } });
    }
    const auth = getAuth(request);
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in required' } });

    const plan = await getPlanForOrg(request.params.planId, org.id);
    if (!plan) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Plan not found' } });

    const parsed = previewSyncSchema.safeParse(request.body ?? {});
    if (!parsed.success) {
      return reply.status(400).send({ error: { code: 'INVALID_INPUT', details: parsed.error.issues } });
    }
    const { itemIds, quarter, includeProposed } = parsed.data;
    const targetQuarter = quarter ?? quarterLabel(new Date());

    let items: typeof oosExecutionItems.$inferSelect[];
    if (itemIds && itemIds.length > 0) {
      const all = await db
        .select()
        .from(oosExecutionItems)
        .where(eq(oosExecutionItems.planId, plan.id));
      items = all.filter(i => itemIds.includes(i.id));
    } else {
      const all = await db
        .select()
        .from(oosExecutionItems)
        .where(and(eq(oosExecutionItems.planId, plan.id), eq(oosExecutionItems.quarter, targetQuarter)));
      const allowedStatuses = includeProposed
        ? new Set(['proposed', 'accepted', 'in_progress', 'at_risk'])
        : new Set(['accepted', 'in_progress', 'at_risk']);
      items = all.filter(i => allowedStatuses.has(i.status));
    }

    try {
      const preview = await buildPreview(org.id, plan, items);
      if (!preview.oosFileId) {
        return reply.status(409).send({
          error: {
            code: 'NO_OOS_FILE',
            message: 'This org has no published OOS file yet. Publish an OOS first; push-to-plan claims attach under it.',
          },
        });
      }
      const oosFileId = preview.oosFileId;

      // Build a beforeSnapshot of the claims we're about to touch (existing rows for updates).
      const updatesById = new Map<string, typeof claims.$inferSelect>();
      for (const p of preview.proposedClaims) {
        if (p.matchedClaimDbValue) updatesById.set(p.matchedClaimDbValue.id, p.matchedClaimDbValue);
      }
      const beforeSnapshot = {
        oosFileId,
        quarter: targetQuarter,
        existingClaimsTouched: Array.from(updatesById.values()),
      };

      // Transaction: per-claim insert/update plus per-item pushedClaimIdsJson update.
      const result = await db.transaction(async (tx) => {
        const createdIds: string[] = [];
        const updatedIds: string[] = [];

        // Resolve next displayOrder per section.
        const sectionMaxDisplayOrder = new Map<string, number>();
        for (const p of preview.proposedClaims) {
          if (sectionMaxDisplayOrder.has(p.section)) continue;
          const maxRes = await tx
            .select({ max: sql<number>`COALESCE(MAX(${claims.displayOrder}), 0)` })
            .from(claims)
            .where(and(eq(claims.oosFileId, oosFileId), eq(claims.section, p.section)));
          sectionMaxDisplayOrder.set(p.section, Number(maxRes[0]?.max ?? 0));
        }

        for (const p of preview.proposedClaims) {
          if (p.proposedAction === 'update' && p.matchedClaimDbValue) {
            await tx
              .update(claims)
              .set({
                rule: p.rule,
                why: p.why,
                failureMode: p.failureMode,
                confidence: p.confidence,
                evidence: p.evidence,
                scope: p.scope,
                source: p.source,
                agentName: p.agentName,
                updatedAt: new Date(),
              })
              .where(eq(claims.id, p.matchedClaimDbValue.id));
            updatedIds.push(p.matchedClaimDbValue.id);

            // Mirror onto the source execution item's pushedClaimIdsJson.
            const item = items.find(i => i.id === p.sourceItemId);
            if (item) {
              const existing = Array.isArray(item.pushedClaimIdsJson) ? item.pushedClaimIdsJson as string[] : [];
              if (!existing.includes(p.matchedClaimDbValue.id)) {
                await tx.update(oosExecutionItems)
                  .set({
                    pushedClaimIdsJson: [...existing, p.matchedClaimDbValue.id],
                    updatedAt: new Date(),
                  })
                  .where(eq(oosExecutionItems.id, item.id));
              }
            }
          } else {
            // Insert
            const nextOrder = (sectionMaxDisplayOrder.get(p.section) ?? 0) + 1;
            sectionMaxDisplayOrder.set(p.section, nextOrder);
            const [inserted] = await tx
              .insert(claims)
              .values({
                oosFileId,
                claimId: p.claimId,
                section: p.section,
                displayOrder: nextOrder,
                rule: p.rule,
                why: p.why,
                failureMode: p.failureMode,
                confidence: p.confidence,
                evidence: p.evidence,
                scope: p.scope,
                source: p.source,
                agentName: p.agentName,
              })
              .returning({ id: claims.id });
            createdIds.push(inserted.id);

            const item = items.find(i => i.id === p.sourceItemId);
            if (item) {
              const existing = Array.isArray(item.pushedClaimIdsJson) ? item.pushedClaimIdsJson as string[] : [];
              await tx.update(oosExecutionItems)
                .set({
                  pushedClaimIdsJson: [...existing, inserted.id],
                  updatedAt: new Date(),
                })
                .where(eq(oosExecutionItems.id, item.id));
            }
          }
        }

        await tx
          .update(oosOperatingPlans)
          .set({ lastSyncedToOosAt: new Date(), updatedAt: new Date() })
          .where(eq(oosOperatingPlans.id, plan.id));

        return { createdIds, updatedIds };
      });

      const allClaimIds = [...result.createdIds, ...result.updatedIds];
      const claimsForSnapshot = preview.proposedClaims.map(c => {
        const { matchedClaimDbValue: _omit, ...rest } = c;
        return rest;
      });
      const [event] = await db
        .insert(oosPlanSyncEvents)
        .values({
          planId: plan.id,
          organizationId: org.id,
          syncType: 'push_to_oos',
          pushedBy: auth.userId ?? 'unknown',
          beforeSnapshotJson: beforeSnapshot,
          afterSnapshotJson: { proposedClaims: claimsForSnapshot, summary: preview.summary, oosFileId },
          claimIdsJson: allClaimIds,
        })
        .returning();

      return {
        syncEventId: event.id,
        oosFileId,
        claimsCreated: result.createdIds.length,
        claimsUpdated: result.updatedIds.length,
        claimUuids: allClaimIds,
      };
    } catch (err) {
      request.log.error({ err }, '[oos-plan] push-to-oos failed');
      return reply.status(500).send({
        error: { code: 'PUSH_FAILED', message: err instanceof Error ? err.message : 'unknown' },
      });
    }
  });

  // ============================================================
  // POST /api/v1/oos-operating-plan/:planId/revert
  // Claim-by-claim selective revert. SUPER-ADMIN gate.
  // Body: { claimIds: string[] } where each is the claims.id (uuid).
  // Hard-deletes the claim rows; saves sync_event with the deleted rows in
  // beforeSnapshotJson for full audit.
  // ============================================================
  const revertSchema = z.object({
    claimIds: z.array(z.string().uuid()).min(1),
  });

  app.post<{ Params: { planId: string } }>('/oos-operating-plan/:planId/revert', async (request, reply) => {
    if (!isSuperAdmin(request)) {
      return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Revert requires super-admin authorization.' } });
    }
    const auth = getAuth(request);
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in required' } });

    const plan = await getPlanForOrg(request.params.planId, org.id);
    if (!plan) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Plan not found' } });

    const parsed = revertSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: { code: 'INVALID_INPUT', details: parsed.error.issues } });
    }
    const { claimIds } = parsed.data;

    try {
      // Fetch the claims we're about to delete (for audit snapshot + safety check).
      const targetClaims = await db.select().from(claims).where(inArray(claims.id, claimIds));
      const targetIds = new Set(targetClaims.map(c => c.id));

      // Confirm every target was actually pushed by this plan (defense-in-depth: never
      // delete a claim that wasn't sourced from this operating plan).
      const sourceCheck = targetClaims.filter(c => c.source !== 'operating_plan');
      if (sourceCheck.length > 0) {
        return reply.status(403).send({
          error: {
            code: 'NOT_PLAN_SOURCED',
            message: `Refusing to revert ${sourceCheck.length} claim(s) not sourced from operating_plan. Only OOS Operating Plan claims can be reverted via this endpoint.`,
          },
        });
      }

      const result = await db.transaction(async (tx) => {
        // Pull the source items and unwire the claim ids from pushedClaimIdsJson.
        const items = await tx.select().from(oosExecutionItems).where(eq(oosExecutionItems.planId, plan.id));
        for (const item of items) {
          const existing = Array.isArray(item.pushedClaimIdsJson) ? item.pushedClaimIdsJson as string[] : [];
          const filtered = existing.filter((cid: string) => !targetIds.has(cid));
          if (filtered.length !== existing.length) {
            await tx
              .update(oosExecutionItems)
              .set({ pushedClaimIdsJson: filtered, updatedAt: new Date() })
              .where(eq(oosExecutionItems.id, item.id));
          }
        }

        // Hard-delete the claims.
        await tx.delete(claims).where(inArray(claims.id, claimIds));

        return { deleted: claimIds.length };
      });

      const [event] = await db
        .insert(oosPlanSyncEvents)
        .values({
          planId: plan.id,
          organizationId: org.id,
          syncType: 'rollback',
          pushedBy: auth.userId ?? 'unknown',
          beforeSnapshotJson: { deletedClaims: targetClaims },
          afterSnapshotJson: { count: result.deleted },
          claimIdsJson: claimIds,
        })
        .returning();

      return { syncEventId: event.id, claimsReverted: result.deleted };
    } catch (err) {
      request.log.error({ err }, '[oos-plan] revert failed');
      return reply.status(500).send({
        error: { code: 'REVERT_FAILED', message: err instanceof Error ? err.message : 'unknown' },
      });
    }
  });

  // ============================================================
  // GET /api/v1/oos-operating-plan/:planId/agent-context
  // Read-only context surface for agents querying the operating plan.
  // Optional ?agentId=AGT-XXX filters items-assigned-to-me to that agent's
  // externalId. Returns:
  //   - currentQuarter
  //   - quarterlyPriorities: current-quarter items grouped by priority
  //   - blockedAtRisk: items with status='at_risk'
  //   - itemsAssignedToMe: items assigned to the caller (if agentId given)
  //   - relevantRules: existing OOS claims under any execution_* section
  //
  // No LLM. Pure read. Cheap to call repeatedly.
  // ============================================================
  app.get<{ Params: { planId: string }; Querystring: { agentId?: string; quarter?: string } }>(
    '/oos-operating-plan/:planId/agent-context',
    async (request, reply) => {
      const org = await getAuthOrg(request);
      if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in required' } });

      const plan = await getPlanForOrg(request.params.planId, org.id);
      if (!plan) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Plan not found' } });

      const targetQuarter = request.query.quarter ?? quarterLabel(new Date());
      const agentId = request.query.agentId;

      const items = await db
        .select()
        .from(oosExecutionItems)
        .where(and(eq(oosExecutionItems.planId, plan.id), eq(oosExecutionItems.quarter, targetQuarter)));

      const byPriority: Record<string, typeof items> = { critical: [], high: [], medium: [], low: [] };
      const blockedAtRisk: typeof items = [];
      const itemsAssignedToMe: typeof items = [];

      for (const it of items) {
        (byPriority[it.priority] ??= []).push(it);
        if (it.status === 'at_risk') blockedAtRisk.push(it);
        if (agentId) {
          const primary = it.assignedOwnerType === 'agent' && it.assignedOwnerId === agentId;
          const secondary = it.secondaryOwnerType === 'agent' && it.secondaryOwnerId === agentId;
          if (primary || secondary) itemsAssignedToMe.push(it);
        }
      }

      // Pull relevant claims: any claim under an execution_* section in the org's
      // most recent published OOS file. These are the cross-session rules the agent
      // should respect alongside its assigned items.
      let relevantRules: typeof claims.$inferSelect[] = [];
      const fileRes = await db.execute(sql`
        SELECT id FROM oos_files WHERE org_id = ${org.id} AND status = 'published'
        ORDER BY created_at DESC LIMIT 1
      `) as { rows: Array<{ id: string }> };
      const oosFileId = fileRes.rows?.[0]?.id ?? null;
      if (oosFileId) {
        relevantRules = await db
          .select()
          .from(claims)
          .where(and(
            eq(claims.oosFileId, oosFileId),
            sql`${claims.section} LIKE 'execution_%'`,
          ));
      }

      return {
        plan: {
          id: plan.id,
          title: plan.title,
          status: plan.status,
          lastSyncedToOosAt: plan.lastSyncedToOosAt,
        },
        currentQuarter: targetQuarter,
        agentId: agentId ?? null,
        quarterlyPriorities: byPriority,
        blockedAtRisk,
        itemsAssignedToMe,
        relevantRules: relevantRules.map(c => ({
          claimId: c.claimId,
          section: c.section,
          rule: c.rule,
          why: c.why,
          confidence: c.confidence,
          scope: c.scope,
          agentName: c.agentName,
        })),
        oosFileId,
      };
    },
  );

}
