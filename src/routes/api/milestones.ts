// Milestones on Quarterly Priorities (rocks).
//
//   POST   /api/v1/rocks/:rockId/milestones     add (sort_order = max+1)
//   GET    /api/v1/rocks/:rockId/milestones     list + linked to-do summaries
//   PUT    /api/v1/milestones/:id               edit title / dueDate / sortOrder
//   POST   /api/v1/milestones/:id/complete      { completed } check / uncheck
//   DELETE /api/v1/milestones/:id               hard delete (to-dos survive,
//                                               milestone_id nulls via FK)
//
// Tenant safety: this repo has NO global org guard -- every query here
// enforces organization_id = caller's org and 404s on miss (mirrors
// attachments.ts, the current standard). Writes also gate read-only roles
// (observer/inactive/free).
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { eq, and, asc, sql, isNull, inArray } from 'drizzle-orm';
import { db } from '../../config/database.js';
import { rockMilestones, rocks, todos, auditLogs } from '../../db/schema.js';
import { getAuthOrg, gateReadOnlyRole } from '../../middleware/auth-helpers.js';
import { resolveApiKey, requireScope } from '../../middleware/api-key-auth.js';
import { createAuditEntry } from '../../services/audit-logger.js';
import { requireUuidParam } from '../../shared/param-validation.js';
import { createRateLimiter } from '../../shared/rate-limiter.js';
import {
  createMilestoneSchema,
  updateMilestoneSchema,
  completeMilestoneSchema,
  nextSortOrder,
} from '../../shared/milestones.js';

// Reads fan out per visible rock; writes are user-paced.
const checkReadRateLimit = createRateLimiter({ windowMs: 60_000, maxRequests: 240 });
const checkWriteRateLimit = createRateLimiter({ windowMs: 60_000, maxRequests: 60 });

async function authedOrFail(request: FastifyRequest, reply: FastifyReply) {
  const org = await getAuthOrg(request);
  if (!org) {
    reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    return null;
  }
  return org;
}

async function gateWriteScope(request: FastifyRequest, reply: FastifyReply): Promise<boolean> {
  const apiKeyCtx = await resolveApiKey(request);
  if (apiKeyCtx && !requireScope(apiKeyCtx, 'write')) {
    reply.status(403).send({ error: { code: 'INSUFFICIENT_SCOPE', message: "API key requires 'write' scope" } });
    return false;
  }
  // Read-only roles (observer/inactive/free) may not mutate milestones.
  return gateReadOnlyRole(request, reply);
}

/** The rock must exist IN THIS ORG and not be soft-deleted. 404s never leak
 *  whether another tenant's uuid exists. */
async function rockInOrg(orgId: string, rockId: string): Promise<boolean> {
  const [row] = await db.select({ id: rocks.id }).from(rocks)
    .where(and(eq(rocks.id, rockId), eq(rocks.organizationId, orgId), isNull(rocks.deletedAt)))
    .limit(1);
  return !!row;
}

export default async function milestoneRoutes(app: FastifyInstance) {

  // POST /api/v1/rocks/:rockId/milestones
  app.post<{ Params: { rockId: string } }>('/rocks/:rockId/milestones', async (request, reply) => {
    if (!checkWriteRateLimit(request.ip)) {
      return reply.status(429).send({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } });
    }
    const rockId = requireUuidParam(request, reply, 'rockId');
    if (!rockId) return;
    if (!(await gateWriteScope(request, reply))) return;
    const org = await authedOrFail(request, reply);
    if (!org) return;

    const body = createMilestoneSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid milestone data', details: body.error.issues } });
    }

    if (!(await rockInOrg(org.id, rockId))) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Rock not found' } });
    }

    const [maxRow] = await db.select({ max: sql<number | null>`max(${rockMilestones.sortOrder})` })
      .from(rockMilestones)
      .where(and(eq(rockMilestones.rockId, rockId), eq(rockMilestones.organizationId, org.id)));

    const [milestone] = await db.insert(rockMilestones).values({
      organizationId: org.id,
      rockId,
      title: body.data.title,
      dueDate: body.data.dueDate ?? null,
      sortOrder: nextSortOrder(maxRow?.max),
    }).returning();

    await db.insert(auditLogs).values(createAuditEntry('milestone.created', 'milestone', {
      orgId: org.id, entityId: milestone.id, details: { rockId, title: milestone.title, dueDate: milestone.dueDate },
    }));

    return reply.status(201).send({ milestone });
  });

  // GET /api/v1/rocks/:rockId/milestones -- ordered list with a linked-todo
  // summary per milestone (id, title, ownerName, doneAt).
  app.get<{ Params: { rockId: string } }>('/rocks/:rockId/milestones', async (request, reply) => {
    if (!checkReadRateLimit(request.ip)) {
      return reply.status(429).send({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } });
    }
    const rockId = requireUuidParam(request, reply, 'rockId');
    if (!rockId) return;
    const org = await authedOrFail(request, reply);
    if (!org) return;

    if (!(await rockInOrg(org.id, rockId))) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Rock not found' } });
    }

    const milestones = await db.select().from(rockMilestones)
      .where(and(eq(rockMilestones.rockId, rockId), eq(rockMilestones.organizationId, org.id)))
      .orderBy(asc(rockMilestones.sortOrder), asc(rockMilestones.createdAt));

    // Linked to-dos, org-scoped, batched in one query then grouped.
    const msIds = milestones.map((m) => m.id);
    const todosByMilestone: Record<string, Array<{ id: string; title: string; ownerName: string | null; ownerExternalId: string; doneAt: Date | null }>> = {};
    if (msIds.length > 0) {
      const linked = await db.select({
        id: todos.id,
        title: todos.title,
        ownerName: todos.ownerName,
        ownerExternalId: todos.ownerExternalId,
        doneAt: todos.doneAt,
        milestoneId: todos.milestoneId,
      }).from(todos)
        .where(and(
          eq(todos.organizationId, org.id),
          inArray(todos.milestoneId, msIds),
          isNull(todos.deletedAt),
        ))
        .orderBy(asc(todos.createdAt));
      for (const t of linked) {
        if (!t.milestoneId) continue;
        (todosByMilestone[t.milestoneId] ||= []).push({
          id: t.id, title: t.title, ownerName: t.ownerName, ownerExternalId: t.ownerExternalId, doneAt: t.doneAt,
        });
      }
    }

    return {
      milestones: milestones.map((m) => ({ ...m, todos: todosByMilestone[m.id] || [] })),
      total: milestones.length,
    };
  });

  // PUT /api/v1/milestones/:id
  app.put<{ Params: { id: string } }>('/milestones/:id', async (request, reply) => {
    if (!checkWriteRateLimit(request.ip)) {
      return reply.status(429).send({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } });
    }
    const id = requireUuidParam(request, reply);
    if (!id) return;
    if (!(await gateWriteScope(request, reply))) return;
    const org = await authedOrFail(request, reply);
    if (!org) return;

    const body = updateMilestoneSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid data', details: body.error.issues } });
    }

    const updates: Record<string, unknown> = {};
    if (body.data.title !== undefined) updates.title = body.data.title;
    if (body.data.dueDate !== undefined) updates.dueDate = body.data.dueDate; // null clears
    if (body.data.sortOrder !== undefined) updates.sortOrder = body.data.sortOrder;

    const [updated] = await db.update(rockMilestones)
      .set(updates)
      .where(and(eq(rockMilestones.id, id), eq(rockMilestones.organizationId, org.id)))
      .returning();
    if (!updated) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Milestone not found' } });

    await db.insert(auditLogs).values(createAuditEntry('milestone.updated', 'milestone', {
      orgId: org.id, entityId: id, details: updates,
    }));

    return { milestone: updated };
  });

  // POST /api/v1/milestones/:id/complete -- { completed: boolean }
  app.post<{ Params: { id: string } }>('/milestones/:id/complete', async (request, reply) => {
    if (!checkWriteRateLimit(request.ip)) {
      return reply.status(429).send({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } });
    }
    const id = requireUuidParam(request, reply);
    if (!id) return;
    if (!(await gateWriteScope(request, reply))) return;
    const org = await authedOrFail(request, reply);
    if (!org) return;

    const body = completeMilestoneSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'completed (boolean) is required', details: body.error.issues } });
    }

    const [updated] = await db.update(rockMilestones)
      .set({ completedAt: body.data.completed ? new Date() : null })
      .where(and(eq(rockMilestones.id, id), eq(rockMilestones.organizationId, org.id)))
      .returning();
    if (!updated) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Milestone not found' } });

    await db.insert(auditLogs).values(createAuditEntry(
      body.data.completed ? 'milestone.completed' : 'milestone.reopened', 'milestone',
      { orgId: org.id, entityId: id, details: { title: updated.title } },
    ));

    return { milestone: updated };
  });

  // DELETE /api/v1/milestones/:id -- hard delete. Linked to-dos survive:
  // the todos.milestone_id FK is ON DELETE SET NULL (see
  // ensure-rock-milestones.ts), so Postgres unlinks them atomically.
  app.delete<{ Params: { id: string } }>('/milestones/:id', async (request, reply) => {
    if (!checkWriteRateLimit(request.ip)) {
      return reply.status(429).send({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } });
    }
    const id = requireUuidParam(request, reply);
    if (!id) return;
    if (!(await gateWriteScope(request, reply))) return;
    const org = await authedOrFail(request, reply);
    if (!org) return;

    const [deleted] = await db.delete(rockMilestones)
      .where(and(eq(rockMilestones.id, id), eq(rockMilestones.organizationId, org.id)))
      .returning({ id: rockMilestones.id, title: rockMilestones.title, rockId: rockMilestones.rockId });
    if (!deleted) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Milestone not found' } });

    await db.insert(auditLogs).values(createAuditEntry('milestone.deleted', 'milestone', {
      orgId: org.id, entityId: id, details: { title: deleted.title, rockId: deleted.rockId },
    }));

    return { ok: true };
  });
}
