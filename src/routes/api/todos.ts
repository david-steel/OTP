import type { FastifyInstance } from 'fastify';
import { eq, and, or, desc, asc, isNull, isNotNull } from 'drizzle-orm';
import { z } from 'zod';
import { nextOccurrence, isValidRule } from './recurrence.js';
import { db } from '../../config/database.js';
import { todos, auditLogs, teams } from '../../db/schema.js';
import { getAuth } from '@clerk/fastify';
import { getAuthOrg, gateReadOnlyRole } from '../../middleware/auth-helpers.js';
import { resolveApiKey, requireScope } from '../../middleware/api-key-auth.js';
import { createAuditEntry } from '../../services/audit-logger.js';
import { notify, resolveMemberIdentity } from '../../services/notifications.js';
import { requireUuidParam } from '../../shared/param-validation.js';
import { createRateLimiter } from '../../shared/rate-limiter.js';

const checkRateLimit = createRateLimiter({ windowMs: 60_000, maxRequests: 60 });

const kindEnum = z.enum(['personal', 'l10']);
const priorityEnum = z.enum(['p1', 'p2', 'p3', 'p4']);

// Recurrence helpers (buildRule / nextOccurrence / isValidRule) live in
// ./recurrence.ts so the date math is unit-testable without pulling in the DB.

const createTodoSchema = z.object({
  // Defaults to 'personal' if omitted. /l8 sends 'l10' + teamId.
  kind: kindEnum.optional(),
  priority: priorityEnum.optional(),
  teamId: z.string().uuid().optional(),
  // Single-owner (back-compat). Either these OR `owners` must be provided.
  ownerEntityType: z.enum(['agent', 'human']).optional(),
  ownerExternalId: z.string().min(1).max(120).optional(),
  ownerName: z.string().max(255).optional(),
  // Multi-assignee: when present, the todo fans out into one independent record
  // per owner (same title/due/priority/recurrence, separately checked off).
  owners: z.array(z.object({
    ownerEntityType: z.enum(['agent', 'human']),
    ownerExternalId: z.string().min(1).max(120),
    ownerName: z.string().max(255).optional(),
  })).min(1).max(50).optional(),
  delegatorEntityType: z.enum(['agent', 'human']).optional(),
  delegatorExternalId: z.string().min(1).max(120).optional(),
  delegatorName: z.string().max(255).optional(),
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
}).refine(
  d => (d.owners && d.owners.length > 0) || (!!d.ownerEntityType && !!d.ownerExternalId),
  { message: 'Provide owners[] or ownerEntityType + ownerExternalId' },
);

const updateTodoSchema = z.object({
  title: z.string().min(3).max(500).optional(),
  description: z.string().optional(),
  priority: priorityEnum.optional(),
  ownerEntityType: z.enum(['agent', 'human']).optional(),
  ownerExternalId: z.string().max(120).optional(),
  ownerName: z.string().max(255).optional(),
  delegatorEntityType: z.enum(['agent', 'human']).nullable().optional(),
  delegatorExternalId: z.string().max(120).nullable().optional(),
  delegatorName: z.string().max(255).nullable().optional(),
  dueAt: z.string().datetime().nullable().optional(),
  done: z.boolean().optional(),
  verified: z.boolean().optional(),
  teamId: z.string().uuid().nullable().optional(),
  recurrenceRule: z.string().max(500).nullable().optional(),
  parentTodoId: z.string().uuid().nullable().optional(),
  position: z.number().int().min(0).max(10_000).optional(),
});

const promoteSchema = z.object({
  teamId: z.string().uuid().optional(),
  meetingId: z.string().uuid().optional(),
});

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
  // Read-only roles (observer/inactive/free) may not mutate todos.
  return gateReadOnlyRole(request, reply);
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
    if (d.recurrenceRule && !isValidRule(d.recurrenceRule)) {
      return reply.status(400).send({ error: { code: 'INVALID_RRULE', message: 'recurrenceRule is not a parseable iCalendar RRULE' } });
    }

    // Multi-assignee fan-out: `owners[]` creates one independent record per
    // person (each separately owned and checked off). Falls back to the single
    // ownerEntityType/ownerExternalId for back-compat. The refine guarantees at
    // least one source exists.
    const targets = (d.owners && d.owners.length > 0)
      ? d.owners
      : [{ ownerEntityType: d.ownerEntityType!, ownerExternalId: d.ownerExternalId!, ownerName: d.ownerName }];

    // Fields shared across every fanned-out copy (and, per copy, its recurrence
    // template + first instance). Owner fields are layered in per target below.
    const sharedBase = {
      organizationId: org.id,
      kind,
      priority: d.priority ?? 'p3',
      teamId: d.teamId || null,
      meetingId: d.meetingId || null,
      delegatorEntityType: d.delegatorEntityType,
      delegatorExternalId: d.delegatorExternalId,
      delegatorName: d.delegatorName,
      title: d.title,
      description: d.description,
      parentTodoId: d.parentTodoId || null,
      position: d.position ?? 0,
      createdBy,
    };

    const created: typeof todos.$inferSelect[] = [];
    for (const target of targets) {
      const shared = {
        ...sharedBase,
        ownerEntityType: target.ownerEntityType,
        ownerExternalId: target.ownerExternalId,
        ownerName: target.ownerName,
      };

      let todo;
      if (d.recurrenceRule) {
        // Recurring: the rule lives on a hidden template (rule set, no due_at);
        // the user only ever sees generated instances. Seed the first instance
        // now -- at the caller's due date if given (e.g. "due today"), otherwise
        // the next occurrence at/after now -- so the series is immediately
        // visible and self-perpetuates as each instance is completed.
        const [template] = await db.insert(todos).values({
          ...shared,
          dueAt: null,
          recurrenceRule: d.recurrenceRule,
          recurrenceParentId: null,
        }).returning();

        const firstDue = d.dueAt ? new Date(d.dueAt) : nextOccurrence(d.recurrenceRule, new Date(), true);
        if (firstDue) {
          const [instance] = await db.insert(todos).values({
            ...shared,
            dueAt: firstDue,
            recurrenceRule: null,
            recurrenceParentId: template.id,
          }).returning();
          todo = instance;
        } else {
          // Rule has no future occurrence -- return the template so the caller
          // still gets a 201 rather than a confusing empty success.
          todo = template;
        }
      } else {
        const [plain] = await db.insert(todos).values({
          ...shared,
          dueAt: d.dueAt ? new Date(d.dueAt) : null,
          recurrenceRule: null,
        }).returning();
        todo = plain;
      }

      await db.insert(auditLogs).values(createAuditEntry('todo.created', 'todo', {
        orgId: org.id, entityId: todo.id, details: { title: todo.title, kind, priority: todo.priority },
      }));

      if (todo.kind === 'l10') {
        const { publishToTeamMeetings } = await import('../../services/meeting-bus.js');
        publishToTeamMeetings(todo.teamId, { kind: 'todo', action: 'created', entityId: todo.id });
      }

      created.push(todo);
    }

    // Alert bell: tell each assignee about their new to-do -- unless they
    // assigned it to themselves. Best-effort: a bell failure never fails
    // the create.
    try {
      const actor = await resolveMemberIdentity(org.id, getAuth(request).userId);
      const actorLabel = d.delegatorName || actor.displayName || null;
      for (const t of created) {
        if (!t.ownerExternalId || actor.seats.includes(t.ownerExternalId)) continue;
        await notify(org.id, t.ownerExternalId, {
          type: 'todo.assigned',
          title: (actorLabel ? actorLabel + ' assigned you a to-do: ' : 'New to-do: ') + t.title,
          href: '/me/todos',
          actorName: actorLabel,
        });
      }
    } catch (err) {
      request.log.warn({ err }, 'todo.assigned notification failed');
    }

    // Back-compat: `todo` is the first (or only) record; `todos` is the full set.
    return reply.status(201).send({ todo: created[0], todos: created });
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
      // Exclude THOSE from default listings. A row with a rule AND a due_at
      // is just a recurring task with a next-occurrence anchor — show it.
      conditions.push(or(isNull(todos.recurrenceRule), isNotNull(todos.dueAt))!);
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
    if (d.teamId !== undefined) {
      updates.teamId = d.teamId;
      updates.kind = d.teamId ? 'l10' : 'personal';
    }
    if (d.dueAt !== undefined) {
      const newDue = d.dueAt ? new Date(d.dueAt) : null;
      updates.dueAt = newDue;
      // Track date changes: append to dueAtHistory only when the resolved
      // value actually differs from the current value (null vs a date
      // counts as a difference). No-op edits don't pollute the history.
      const currentDue = existing.dueAt ? new Date(existing.dueAt) : null;
      const currentIso = currentDue ? currentDue.toISOString() : null;
      const newIso = newDue ? newDue.toISOString() : null;
      if (currentIso !== newIso) {
        const record = {
          from: currentIso,
          to: newIso,
          at: new Date().toISOString(),
          by: getAuth(request).userId || 'api_key',
        };
        const priorHistory = Array.isArray(existing.dueAtHistory) ? existing.dueAtHistory : [];
        updates.dueAtHistory = [...priorHistory, record];
      }
    }
    if (d.done === true) updates.doneAt = new Date();
    if (d.done === false) {
      updates.doneAt = null;
      updates.verifiedAt = null;
      updates.verifiedBy = null;
    }
    if (d.verified === true) {
      updates.verifiedAt = new Date();
      updates.verifiedBy = getAuth(request).userId || 'api_key';
    }
    if (d.verified === false) {
      updates.verifiedAt = null;
      updates.verifiedBy = null;
    }
    if (d.delegatorEntityType !== undefined) updates.delegatorEntityType = d.delegatorEntityType || null;
    if (d.delegatorExternalId !== undefined) updates.delegatorExternalId = d.delegatorExternalId || null;
    if (d.delegatorName !== undefined) updates.delegatorName = d.delegatorName || null;
    if (d.parentTodoId !== undefined) updates.parentTodoId = d.parentTodoId;
    if (d.position !== undefined) updates.position = d.position;
    // Recurrence edit. Three cases:
    //  - clear (rule is '' / null): drop the rule on this row.
    //  - in-series change (this row already carries a rule, or is an instance
    //    of a series): update the rule in place.
    //  - convert a plain one-off INTO a series: mirror the POST /todos path.
    //    Setting the rule directly on the row would leave it carrying BOTH a
    //    rule and a due_at, which the Daily dashboard query (recurrence_rule
    //    IS NULL) hides -- the to-do silently vanishes. Instead we spin off a
    //    hidden template below and keep THIS row as the visible dated instance.
    let convertToRecurring = false;
    if (d.recurrenceRule !== undefined) {
      if (d.recurrenceRule && !isValidRule(d.recurrenceRule)) {
        return reply.status(400).send({ error: { code: 'INVALID_RRULE', message: 'recurrenceRule is not a parseable iCalendar RRULE' } });
      }
      const isPlainOneOff = !existing.recurrenceParentId && !existing.recurrenceRule;
      if (d.recurrenceRule && isPlainOneOff) {
        convertToRecurring = true; // handled after the row update, see below
      } else {
        updates.recurrenceRule = d.recurrenceRule;
      }
    }

    const [updated] = await db.update(todos)
      .set(updates)
      .where(and(eq(todos.id, id), eq(todos.organizationId, org.id)))
      .returning();
    if (!updated) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Todo not found' } });

    // Alert bell on state transitions. Three signals, each skipped when the
    // actor is the would-be recipient (no self-notifications):
    //  - owner finished a delegated to-do  -> tell the delegator
    //  - someone closed out / verified the owner's to-do -> tell the owner
    // Best-effort: a bell failure never fails the update.
    try {
      const actor = await resolveMemberIdentity(org.id, getAuth(request).userId);
      const actorLabel = actor.displayName || null;
      const justDone = d.done === true && !existing.doneAt;
      const justVerified = d.verified === true && !existing.verifiedAt;
      if (justDone && existing.delegatorExternalId && !actor.seats.includes(existing.delegatorExternalId)) {
        await notify(org.id, existing.delegatorExternalId, {
          type: 'todo.completed',
          title: (updated.ownerName || actorLabel || 'Someone') + ' finished: ' + updated.title,
          href: '/me/todos',
          actorName: actorLabel,
        });
      }
      if ((justDone || justVerified) && updated.ownerExternalId && !actor.seats.includes(updated.ownerExternalId)) {
        const closedOut = justDone && d.verified === true;
        await notify(org.id, updated.ownerExternalId, {
          type: closedOut ? 'todo.closed_out' : (justVerified ? 'todo.verified' : 'todo.completed'),
          title: (actorLabel || 'A teammate')
            + (closedOut ? ' closed out your to-do: ' : (justVerified ? ' verified your to-do: ' : ' marked your to-do done: '))
            + updated.title,
          href: '/me/todos',
          actorName: actorLabel,
        });
      }
    } catch (err) {
      request.log.warn({ err }, 'todo transition notification failed');
    }

    // Recurrence spawn: completing a recurring instance generates the next one.
    // The RRULE lives on a hidden template; each visible instance links to it
    // via recurrence_parent_id. On the null->done transition we resolve the
    // governing template (the parent, or this row itself if it carries the
    // rule directly), compute the next occurrence strictly after this
    // instance's due date, and create the follow-up instance. Gating on the
    // transition (was-open -> now-done) means re-toggling a todo can't
    // double-spawn, and a per-(series,date) dedupe guards the rest.
    if (d.done === true && !existing.doneAt) {
      let ruleText: string | null = null;
      let template = updated;
      if (updated.recurrenceParentId) {
        const [parent] = await db.select().from(todos)
          .where(and(eq(todos.id, updated.recurrenceParentId), eq(todos.organizationId, org.id))).limit(1);
        if (parent) { template = parent; ruleText = parent.recurrenceRule; }
      } else if (updated.recurrenceRule) {
        ruleText = updated.recurrenceRule;
      }

      if (ruleText) {
        const next = nextOccurrence(ruleText, updated.dueAt ?? new Date(), false);
        if (next) {
          const [dupe] = await db.select({ id: todos.id }).from(todos)
            .where(and(
              eq(todos.organizationId, org.id),
              eq(todos.recurrenceParentId, template.id),
              eq(todos.dueAt, next),
              isNull(todos.deletedAt),
            )).limit(1);
          if (!dupe) {
            await db.insert(todos).values({
              organizationId: org.id,
              kind: template.kind,
              priority: template.priority,
              teamId: template.teamId,
              meetingId: template.meetingId,
              ownerEntityType: template.ownerEntityType,
              ownerExternalId: template.ownerExternalId,
              ownerName: template.ownerName,
              delegatorEntityType: template.delegatorEntityType,
              delegatorExternalId: template.delegatorExternalId,
              delegatorName: template.delegatorName,
              title: template.title,
              description: template.description,
              dueAt: next,
              recurrenceRule: null,
              recurrenceParentId: template.id,
              parentTodoId: template.parentTodoId,
              position: template.position,
              createdBy: template.createdBy,
            });
          }
        }
      }
    }

    // Convert-to-recurring: now that `updated` carries the latest field values,
    // fan out a hidden template (rule set, no due_at) and re-link this row as
    // its first instance (rule cleared, recurrence_parent_id -> template). The
    // row keeps its due_at and id, so it stays visible everywhere and the
    // existing complete -> spawn-next logic takes over from here. Mirrors the
    // recurring branch of POST /todos.
    let responseTodo = updated;
    if (convertToRecurring) {
      const [template] = await db.insert(todos).values({
        organizationId: org.id,
        kind: updated.kind,
        priority: updated.priority,
        teamId: updated.teamId,
        meetingId: updated.meetingId,
        ownerEntityType: updated.ownerEntityType,
        ownerExternalId: updated.ownerExternalId,
        ownerName: updated.ownerName,
        delegatorEntityType: updated.delegatorEntityType,
        delegatorExternalId: updated.delegatorExternalId,
        delegatorName: updated.delegatorName,
        title: updated.title,
        description: updated.description,
        dueAt: null,
        recurrenceRule: d.recurrenceRule,
        recurrenceParentId: null,
        parentTodoId: updated.parentTodoId,
        position: updated.position,
        createdBy: updated.createdBy,
      }).returning();
      const [relinked] = await db.update(todos)
        .set({ recurrenceParentId: template.id, updatedAt: new Date() })
        .where(and(eq(todos.id, updated.id), eq(todos.organizationId, org.id)))
        .returning();
      if (relinked) responseTodo = relinked;
    }

    await db.insert(auditLogs).values(createAuditEntry('todo.updated', 'todo', {
      orgId: org.id, entityId: id, details: updates,
    }));

    if (updated.kind === 'l10') {
      const { publishToTeamMeetings } = await import('../../services/meeting-bus.js');
      publishToTeamMeetings(updated.teamId, { kind: 'todo', action: 'updated', entityId: id });
    }

    return { todo: responseTodo };
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

    if (deleted.kind === 'l10') {
      const { publishToTeamMeetings } = await import('../../services/meeting-bus.js');
      publishToTeamMeetings(deleted.teamId, { kind: 'todo', action: 'deleted', entityId: id });
    }

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
