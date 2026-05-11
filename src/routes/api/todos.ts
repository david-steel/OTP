import type { FastifyInstance } from 'fastify';
import { eq, and, desc, asc, isNull, isNotNull } from 'drizzle-orm';
import { z } from 'zod';
import { RRule } from 'rrule';
import { db } from '../../config/database.js';
import { todos, auditLogs, teams } from '../../db/schema.js';
import { getAuth } from '@clerk/fastify';
import { getAuthOrg } from '../../middleware/auth-helpers.js';
import { resolveApiKey, requireScope } from '../../middleware/api-key-auth.js';
import { createAuditEntry } from '../../services/audit-logger.js';
import { requireUuidParam } from '../../shared/param-validation.js';
import { createRateLimiter } from '../../shared/rate-limiter.js';

const checkRateLimit = createRateLimiter({ windowMs: 60_000, maxRequests: 60 });

const kindEnum = z.enum(['personal', 'l10']);
const priorityEnum = z.enum(['p1', 'p2', 'p3', 'p4']);

const createTodoSchema = z.object({
  // Defaults to 'personal' if omitted. /l8 sends 'l10' + teamId.
  kind: kindEnum.optional(),
  priority: priorityEnum.optional(),
  teamId: z.string().uuid().optional(),
  ownerEntityType: z.enum(['agent', 'human']),
  ownerExternalId: z.string().min(1).max(120),
  ownerName: z.string().max(255).optional(),
  title: z.string().min(3).max(500),
  description: z.string().optional(),
  dueAt: z.string().datetime().optional(),
  meetingId: z.string().uuid().optional(),
  // RRULE template: when this is set, the row IS the template -- it never
  // appears in user lists. Instances are auto-spawned on completion.
  recurrenceRule: z.string().max(500).optional(),
  // Subtasks: parent_todo_id links a child to its parent.
  parentTodoId: z.string().uuid().optional(),
  position: z.number().int().min(0).max(10_000).optional(),
});

const updateTodoSchema = z.object({
  title: z.string().min(3).max(500).optional(),
  description: z.string().optional(),
  priority: priorityEnum.optional(),
  ownerEntityType: z.enum(['agent', 'human']).optional(),
  ownerExternalId: z.string().max(120).optional(),
  ownerName: z.string().max(255).optional(),
  dueAt: z.string().datetime().nullable().optional(),
  done: z.boolean().optional(),
  recurrenceRule: z.string().max(500).nullable().optional(),
  parentTodoId: z.string().uuid().nullable().optional(),
  position: z.number().int().min(0).max(10_000).optional(),
});

const promoteSchema = z.object({
  teamId: z.string().uuid().optional(),
  meetingId: z.string().uuid().optional(),
});

/**
 * Parse an iCalendar RRULE and compute the next occurrence after `after`.
 * Returns null if the rule is invalid or has no future occurrences.
 */
function nextOccurrence(ruleText: string, after: Date): Date | null {
  try {
    const rule = RRule.fromString(ruleText);
    return rule.after(after, true);
  } catch {
    return null;
  }
}

async function authedOrFail(request: any, reply: any) {
  const org = await getAuthOrg(request);
  if (!org) {
    reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    return null;
  }
  return org;
}

async function gateWriteScope(request: any, reply: any): Promise<boolean> {
  const apiKeyCtx = await resolveApiKey(request);
  if (apiKeyCtx && !requireScope(apiKeyCtx, 'write')) {
    reply.status(403).send({ error: { code: 'INSUFFICIENT_SCOPE', message: "API key requires 'write' scope" } });
    return false;
  }
  return true;
}

export default async function todoRoutes(app: FastifyInstance) {
  // POST /api/v1/todos
  app.post('/todos', async (request, reply) => {
    if (!checkRateLimit(request.ip)) {
      return reply.status(429).send({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } });
    }
    if (!(await gateWriteScope(request, reply))) return;
    const org = await authedOrFail(request, reply);
    if (!org) return;

    const body = createTodoSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid todo data', details: body.error.issues } });
    }

    const createdBy = getAuth(request).userId || 'api_key';
    const d = body.data;

    // Default kind: l10 if teamId or meetingId is set (and ties to a team),
    // otherwise personal. Explicit kind always wins.
    const kind = d.kind ?? (d.teamId || d.meetingId ? 'l10' : 'personal');

    // Validate recurrence rule at create time so a bad template can't be saved.
    if (d.recurrenceRule) {
      try { RRule.fromString(d.recurrenceRule); }
      catch { return reply.status(400).send({ error: { code: 'INVALID_RRULE', message: 'recurrenceRule is not a parseable iCalendar RRULE' } }); }
    }

    const [todo] = await db.insert(todos).values({
      organizationId: org.id,
      kind,
      priority: d.priority ?? 'p3',
      teamId: d.teamId || null,
      meetingId: d.meetingId || null,
      ownerEntityType: d.ownerEntityType,
      ownerExternalId: d.ownerExternalId,
      ownerName: d.ownerName,
      title: d.title,
      description: d.description,
      dueAt: d.dueAt ? new Date(d.dueAt) : null,
      recurrenceRule: d.recurrenceRule || null,
      parentTodoId: d.parentTodoId || null,
      position: d.position ?? 0,
      createdBy,
    }).returning();

    await db.insert(auditLogs).values(createAuditEntry('todo.created', 'todo', {
      orgId: org.id, entityId: todo.id, details: { title: todo.title, kind, priority: todo.priority },
    }));

    return reply.status(201).send({ todo });
  });

  // GET /api/v1/todos?open=&meetingId=&ownerExternalId=&kind=&teamId=&parentTodoId=&includeTemplates=
  // Default behavior hides recurrence templates (rows with recurrence_rule
  // set AND no due date) from user lists. Pass includeTemplates=true to see
  // them in admin/listing UIs.
  app.get<{ Querystring: { open?: string; meetingId?: string; ownerExternalId?: string; kind?: string; teamId?: string; parentTodoId?: string; includeTemplates?: string } }>('/todos', async (request, reply) => {
    const org = await authedOrFail(request, reply);
    if (!org) return;

    const q = request.query;
    const conditions = [eq(todos.organizationId, org.id), isNull(todos.deletedAt)];
    if (q.open === 'true') conditions.push(isNull(todos.doneAt));
    if (q.meetingId) conditions.push(eq(todos.meetingId, q.meetingId));
    if (q.ownerExternalId) conditions.push(eq(todos.ownerExternalId, q.ownerExternalId));
    if (q.kind === 'personal' || q.kind === 'l10') conditions.push(eq(todos.kind, q.kind));
    if (q.teamId) conditions.push(eq(todos.teamId, q.teamId));
    if (q.parentTodoId === 'null') {
      conditions.push(isNull(todos.parentTodoId));
    } else if (q.parentTodoId) {
      conditions.push(eq(todos.parentTodoId, q.parentTodoId));
    }
    if (q.includeTemplates !== 'true') {
      // A recurrence template is a row that has a rule AND no due_at (the
      // template itself is never assigned a date; only instances are).
      // Exclude them from default listings.
      conditions.push(isNull(todos.recurrenceRule));
    }

    // Sort: priority asc (p1 first) → due_at asc nulls last → created desc.
    // Postgres sorts enums by declared order, so p1<p2<p3<p4 works out.
    const results = await db.select().from(todos)
      .where(and(...conditions))
      .orderBy(asc(todos.priority), asc(todos.dueAt), desc(todos.createdAt));
    return { todos: results, total: results.length };
  });

  // GET /api/v1/todos/:id
  app.get<{ Params: { id: string } }>('/todos/:id', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    const org = await authedOrFail(request, reply);
    if (!org) return;

    const [todo] = await db.select().from(todos).where(and(eq(todos.id, id), eq(todos.organizationId, org.id))).limit(1);
    if (!todo) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Todo not found' } });
    return { todo };
  });

  // PUT /api/v1/todos/:id
  app.put<{ Params: { id: string } }>('/todos/:id', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    if (!(await gateWriteScope(request, reply))) return;
    const org = await authedOrFail(request, reply);
    if (!org) return;

    const body = updateTodoSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid data', details: body.error.issues } });
    }

    // Load the existing row first so we can spot recurrence-on-complete.
    const [existing] = await db.select().from(todos)
      .where(and(eq(todos.id, id), eq(todos.organizationId, org.id))).limit(1);
    if (!existing) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Todo not found' } });

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    const d = body.data;
    if (d.title !== undefined) updates.title = d.title;
    if (d.description !== undefined) updates.description = d.description;
    if (d.priority !== undefined) updates.priority = d.priority;
    if (d.ownerEntityType !== undefined) updates.ownerEntityType = d.ownerEntityType;
    if (d.ownerExternalId !== undefined) updates.ownerExternalId = d.ownerExternalId;
    if (d.ownerName !== undefined) updates.ownerName = d.ownerName;
    if (d.dueAt !== undefined) updates.dueAt = d.dueAt ? new Date(d.dueAt) : null;
    if (d.done === true) updates.doneAt = new Date();
    if (d.done === false) updates.doneAt = null;
    if (d.parentTodoId !== undefined) updates.parentTodoId = d.parentTodoId;
    if (d.position !== undefined) updates.position = d.position;
    if (d.recurrenceRule !== undefined) {
      if (d.recurrenceRule) {
        try { RRule.fromString(d.recurrenceRule); }
        catch { return reply.status(400).send({ error: { code: 'INVALID_RRULE', message: 'recurrenceRule is not a parseable iCalendar RRULE' } }); }
      }
      updates.recurrenceRule = d.recurrenceRule;
    }

    const [updated] = await db.update(todos)
      .set(updates)
      .where(and(eq(todos.id, id), eq(todos.organizationId, org.id)))
      .returning();
    if (!updated) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Todo not found' } });

    // Recurrence spawn: when a todo with a recurrenceRule is marked done,
    // immediately create the next instance, linked back via
    // recurrence_parent_id. Skip if the todo is itself a child instance --
    // only the template (or a one-off recurring todo) spawns. Skip if rule
    // produces no future occurrence (finite series exhausted).
    if (d.done === true && updated.recurrenceRule && !updated.recurrenceParentId) {
      const base = updated.dueAt ?? new Date();
      const next = nextOccurrence(updated.recurrenceRule, base);
      if (next) {
        await db.insert(todos).values({
          organizationId: org.id,
          kind: updated.kind,
          priority: updated.priority,
          teamId: updated.teamId,
          meetingId: updated.meetingId,
          ownerEntityType: updated.ownerEntityType,
          ownerExternalId: updated.ownerExternalId,
          ownerName: updated.ownerName,
          title: updated.title,
          description: updated.description,
          dueAt: next,
          // Do NOT carry the rule forward -- only the originating template
          // owns it. Instances are one-off and don't spawn further children.
          recurrenceRule: null,
          recurrenceParentId: updated.id,
          parentTodoId: updated.parentTodoId,
          position: updated.position,
          createdBy: updated.createdBy,
        });
      }
    }

    await db.insert(auditLogs).values(createAuditEntry('todo.updated', 'todo', {
      orgId: org.id, entityId: id, details: updates,
    }));

    return { todo: updated };
  });

  // DELETE /api/v1/todos/:id (soft)
  app.delete<{ Params: { id: string } }>('/todos/:id', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    if (!(await gateWriteScope(request, reply))) return;
    const org = await authedOrFail(request, reply);
    if (!org) return;

    const [deleted] = await db.update(todos)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(todos.id, id), eq(todos.organizationId, org.id)))
      .returning();
    if (!deleted) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Todo not found' } });

    await db.insert(auditLogs).values(createAuditEntry('todo.deleted', 'todo', {
      orgId: org.id, entityId: id,
    }));
    return { ok: true };
  });

  // ---------- Subtasks ----------
  // GET /api/v1/todos/:id/subtasks -- list children of a todo, ordered by
  // position then created_at. Used by /me/todos and /l8 to expand a parent.
  app.get<{ Params: { id: string } }>('/todos/:id/subtasks', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    const org = await authedOrFail(request, reply);
    if (!org) return;

    const subtasks = await db.select().from(todos)
      .where(and(
        eq(todos.organizationId, org.id),
        eq(todos.parentTodoId, id),
        isNull(todos.deletedAt),
      ))
      .orderBy(asc(todos.position), asc(todos.createdAt));
    return { subtasks, total: subtasks.length };
  });

  // ---------- Kind transitions ----------
  // POST /api/v1/todos/:id/promote -- personal → l10. Optionally bind to a
  // specific team (defaults to the org's leadership team) and/or meeting.
  app.post<{ Params: { id: string } }>('/todos/:id/promote', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    if (!(await gateWriteScope(request, reply))) return;
    const org = await authedOrFail(request, reply);
    if (!org) return;

    const body = promoteSchema.safeParse(request.body ?? {});
    if (!body.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid promote payload', details: body.error.issues } });
    }

    // Resolve target team: explicit > existing team_id > org's leadership team.
    let targetTeamId: string | null = body.data.teamId ?? null;
    if (!targetTeamId) {
      const [defaultTeam] = await db.select({ id: teams.id }).from(teams)
        .where(and(eq(teams.orgId, org.id), eq(teams.slug, 'leadership'))).limit(1);
      targetTeamId = defaultTeam?.id ?? null;
    }
    if (!targetTeamId) {
      return reply.status(400).send({ error: { code: 'NO_LEADERSHIP_TEAM', message: 'Org has no leadership team to promote to' } });
    }

    const [promoted] = await db.update(todos)
      .set({
        kind: 'l10',
        teamId: targetTeamId,
        meetingId: body.data.meetingId ?? null,
        updatedAt: new Date(),
      })
      .where(and(eq(todos.id, id), eq(todos.organizationId, org.id)))
      .returning();
    if (!promoted) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Todo not found' } });

    await db.insert(auditLogs).values(createAuditEntry('todo.promoted', 'todo', {
      orgId: org.id, entityId: id, details: { teamId: targetTeamId, meetingId: body.data.meetingId ?? null },
    }));
    return { todo: promoted };
  });

  // POST /api/v1/todos/:id/demote -- l10 → personal. Strips team_id and
  // meeting_id, making the todo private to its owner again.
  app.post<{ Params: { id: string } }>('/todos/:id/demote', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    if (!(await gateWriteScope(request, reply))) return;
    const org = await authedOrFail(request, reply);
    if (!org) return;

    const [demoted] = await db.update(todos)
      .set({ kind: 'personal', teamId: null, meetingId: null, updatedAt: new Date() })
      .where(and(eq(todos.id, id), eq(todos.organizationId, org.id)))
      .returning();
    if (!demoted) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Todo not found' } });

    await db.insert(auditLogs).values(createAuditEntry('todo.demoted', 'todo', {
      orgId: org.id, entityId: id,
    }));
    return { todo: demoted };
  });
}
