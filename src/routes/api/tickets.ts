import type { FastifyInstance } from 'fastify';
import { eq, desc, sql, and, isNull } from 'drizzle-orm';
import { db } from '../../config/database.js';
import { tickets, todos, meetings, auditLogs } from '../../db/schema.js';
import { resolveApiKey, requireScope } from '../../middleware/api-key-auth.js';
import { getAuthOrg } from '../../middleware/auth-helpers.js';
import { createAuditEntry } from '../../services/audit-logger.js';
import { requireUuidParam } from '../../shared/param-validation.js';
import { createRateLimiter } from '../../shared/rate-limiter.js';
import { z } from 'zod';

const checkRateLimit = createRateLimiter({ windowMs: 60000, maxRequests: 10 });

// Title/description lower bounds intentionally permissive (min 1). The L10
// meeting "Add Issue" UI promises "title required, description optional"
// (placeholder text on l8-leadership.ejs:707) and pre-fills a default
// description when blank. Stricter min-char rules here broke that contract:
// 2026-05-26 Kristen tried to add an issue mid-meeting with a short title
// and got "Add failed: invalid ticket data" because the server required
// title>=5 / description>=10. Spam control lives in the rate limiter
// (10 req/min per IP), not in min-length validation.
const createTicketSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().min(1).max(10000),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional().default('medium'),
  category: z.enum(['bug', 'feature', 'question', 'other']).optional().default('bug'),
  reporterEmail: z.string().email().optional(),
  teamId: z.string().uuid().nullable().optional(),
  ownerEntityType: z.enum(['agent', 'human']).optional(),
  ownerExternalId: z.string().max(120).optional(),
  ownerName: z.string().max(255).optional(),
});

const updateTicketSchema = z.object({
  title: z.string().min(3).max(500).optional(),
  description: z.string().min(1).optional(),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  resolution: z.string().optional(),
  agentNotes: z.string().optional(),
  // EOS IDS extension -- separate lifecycle from triage status
  idsStatus: z.enum(['open', 'identified', 'discussed', 'solved']).optional(),
  priorityRank: z.number().int().nullable().optional(),
  solvedInMeetingId: z.string().uuid().nullable().optional(),
  ownerEntityType: z.enum(['agent', 'human']).nullable().optional(),
  ownerExternalId: z.string().max(120).nullable().optional(),
  ownerName: z.string().max(255).nullable().optional(),
  teamId: z.string().uuid().nullable().optional(),
  // GTD Next Action layer (added 2026-05-25). Pass null to clear.
  // Server stamps nextActionSetAt = now whenever this field changes
  // so the L8 weekly review can flag stale Next Actions.
  nextAction: z.string().max(500).nullable().optional(),
});

const solveTicketSchema = z.object({
  resolution: z.string().min(3, 'Resolution is required'),
  meetingId: z.string().uuid().optional(),
  followUp: z.object({
    title: z.string().min(3).max(500),
    ownerEntityType: z.enum(['agent', 'human']),
    ownerExternalId: z.string().min(1).max(120),
    ownerName: z.string().max(255).optional(),
    dueAt: z.string().datetime().optional(),
  }).optional(),
});

export default async function ticketRoutes(app: FastifyInstance) {

  // POST /api/v1/tickets -- Create a ticket (auth optional)
  app.post('/tickets', async (request, reply) => {
    if (!checkRateLimit(request.ip)) {
      return reply.status(429).send({ error: { code: 'RATE_LIMITED', message: 'Too many requests. Max 10 per minute.' } });
    }

    const body = createTicketSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({
        error: { code: 'VALIDATION_FAILED', message: 'Invalid ticket data', details: body.error.issues },
      });
    }

    const org = await getAuthOrg(request);

    const [ticket] = await db.insert(tickets).values({
      orgId: org?.id || null,
      teamId: body.data.teamId || null,
      title: body.data.title,
      description: body.data.description,
      priority: body.data.priority,
      category: body.data.category,
      reporterEmail: body.data.reporterEmail || null,
      ownerEntityType: body.data.ownerEntityType || null,
      ownerExternalId: body.data.ownerExternalId || null,
      ownerName: body.data.ownerName || null,
    }).returning();

    await db.insert(auditLogs).values(
      createAuditEntry('ticket.created', 'ticket', {
        orgId: org?.id,
        entityId: ticket.id,
        details: { title: body.data.title, category: body.data.category, priority: body.data.priority },
      })
    );

    const { publishToTeamMeetings } = await import('../../services/meeting-bus.js');
    publishToTeamMeetings(ticket.teamId, { kind: 'issue', action: 'created', entityId: ticket.id });

    return reply.status(201).send({ ticket });
  });

  // Strip sensitive fields from ticket for unauthenticated access
  function stripSensitiveFields(ticket: Record<string, unknown>) {
    const { agentNotes, reporterEmail, ...safe } = ticket;
    return safe;
  }

  // GET /api/v1/tickets -- List tickets (requires authentication, scoped to org)
  app.get<{ Querystring: { status?: string; category?: string; limit?: string; page?: string } }>(
    '/tickets',
    async (request, reply) => {
      const org = await getAuthOrg(request);
      if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required to list tickets' } });

      const { status, category, limit: limitStr, page: pageStr } = request.query;
      const limit = Math.min(parseInt(limitStr || '50', 10), 100);
      const page = Math.max(1, parseInt(pageStr || '1', 10));

      const conditions = [eq(tickets.orgId, org.id), isNull(tickets.deletedAt)];
      if (status) conditions.push(eq(tickets.status, status as 'open' | 'in_progress' | 'resolved' | 'closed'));
      if (category) conditions.push(eq(tickets.category, category as 'bug' | 'feature' | 'question' | 'other'));

      const whereClause = and(...conditions);

      const results = await db.select().from(tickets)
        .where(whereClause)
        .orderBy(desc(tickets.createdAt))
        .limit(limit)
        .offset((page - 1) * limit);

      const [countResult] = await db.select({ total: sql<number>`cast(count(*) as int)` })
        .from(tickets)
        .where(whereClause);

      const total = countResult?.total || 0;

      return { tickets: results, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
  );

  // GET /api/v1/tickets/:id -- Get single ticket
  app.get<{ Params: { id: string } }>('/tickets/:id', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    const org = await getAuthOrg(request);
    const isAuthed = !!org;

    const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id)).limit(1);
    if (!ticket) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Ticket not found' } });
    return { ticket: isAuthed ? ticket : stripSensitiveFields(ticket as unknown as Record<string, unknown>) };
  });

  // PUT /api/v1/tickets/:id -- Update ticket (admin/agent)
  app.put<{ Params: { id: string } }>('/tickets/:id', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;

    // Check API key scope for write operations
    const apiKeyCtx = await resolveApiKey(request);
    if (apiKeyCtx && !requireScope(apiKeyCtx, 'write')) {
      return reply.status(403).send({ error: { code: 'INSUFFICIENT_SCOPE', message: "API key requires 'write' scope for this operation" } });
    }

    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    const body = updateTicketSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid data', details: body.error.issues } });
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (body.data.title) updates.title = body.data.title;
    if (body.data.description !== undefined) updates.description = body.data.description;
    if (body.data.status) updates.status = body.data.status;
    if (body.data.priority) updates.priority = body.data.priority;
    if (body.data.resolution !== undefined) updates.resolution = body.data.resolution;
    if (body.data.agentNotes !== undefined) updates.agentNotes = body.data.agentNotes;
    if (body.data.idsStatus !== undefined) updates.idsStatus = body.data.idsStatus;
    if (body.data.priorityRank !== undefined) updates.priorityRank = body.data.priorityRank;
    if (body.data.solvedInMeetingId !== undefined) updates.solvedInMeetingId = body.data.solvedInMeetingId;
    if (body.data.ownerEntityType !== undefined) updates.ownerEntityType = body.data.ownerEntityType;
    if (body.data.ownerExternalId !== undefined) updates.ownerExternalId = body.data.ownerExternalId;
    if (body.data.ownerName !== undefined) updates.ownerName = body.data.ownerName;
    if (body.data.teamId !== undefined) updates.teamId = body.data.teamId;
    // Stamp next_action_set_at whenever next_action changes (including
    // being cleared). The L8 weekly review uses this to age out stale
    // Next Actions (>14 days old prompts "still right?").
    if (body.data.nextAction !== undefined) {
      updates.nextAction = body.data.nextAction;
      updates.nextActionSetAt = body.data.nextAction ? new Date() : null;
    }

    const [updated] = await db.update(tickets)
      .set(updates)
      .where(eq(tickets.id, id))
      .returning();

    if (!updated) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Ticket not found' } });

    await db.insert(auditLogs).values(
      createAuditEntry('ticket.updated', 'ticket', {
        orgId: org.id,
        entityId: id,
        details: updates,
      })
    );

    const { publishToTeamMeetings } = await import('../../services/meeting-bus.js');
    publishToTeamMeetings(updated.teamId, { kind: 'issue', action: 'updated', entityId: id });

    return { ticket: updated };
  });

  // GET /api/v1/tickets/stats -- Ticket stats (excludes soft-deleted)
  app.get('/tickets/stats', async (request, reply) => {
    const stats = await db.execute(sql`
      SELECT
        COUNT(*) FILTER (WHERE status = 'open') AS open_count,
        COUNT(*) FILTER (WHERE status = 'in_progress') AS in_progress_count,
        COUNT(*) FILTER (WHERE status = 'resolved') AS resolved_count,
        COUNT(*) FILTER (WHERE status = 'closed') AS closed_count,
        COUNT(*) AS total
      FROM tickets
      WHERE deleted_at IS NULL
    `);

    return { stats: (stats.rows as any[])[0] || {} };
  });

  // DELETE /api/v1/tickets/:id -- soft delete (used by L8 to remove issues
  // and by super admins on /tickets to clean up the public issue tracker).
  app.delete<{ Params: { id: string } }>('/tickets/:id', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const apiKeyCtx = await resolveApiKey(request);
    if (apiKeyCtx && !requireScope(apiKeyCtx, 'write')) {
      return reply.status(403).send({ error: { code: 'INSUFFICIENT_SCOPE', message: "API key requires 'write' scope" } });
    }

    // Super admins can delete tickets from any org (or anonymous reports);
    // org owners can only delete their own org's tickets.
    const isSuperAdmin = !!(request as any).isSuperAdmin;
    const whereClause = isSuperAdmin
      ? eq(tickets.id, id)
      : and(eq(tickets.id, id), eq(tickets.orgId, org.id));

    const [deleted] = await db.update(tickets)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(whereClause)
      .returning();
    if (!deleted) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Ticket not found' } });

    await db.insert(auditLogs).values(createAuditEntry('ticket.deleted', 'ticket', {
      orgId: org.id, entityId: id,
    }));
    return { ok: true };
  });

  // POST /api/v1/tickets/:id/solve -- atomic solve with optional follow-up to-do.
  // Captures resolution, marks idsStatus=solved, links solvedInMeetingId, optionally
  // creates a 7-day follow-up to-do owned by someone, and appends the resolution to
  // the meeting's cascading message so the rest of the team can see what was decided.
  app.post<{ Params: { id: string } }>('/tickets/:id/solve', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const apiKeyCtx = await resolveApiKey(request);
    if (apiKeyCtx && !requireScope(apiKeyCtx, 'write')) {
      return reply.status(403).send({ error: { code: 'INSUFFICIENT_SCOPE', message: "API key requires 'write' scope" } });
    }

    const body = solveTicketSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid solve payload', details: body.error.issues } });
    }

    const [ticket] = await db.update(tickets)
      .set({
        idsStatus: 'solved',
        status: 'resolved',
        resolution: body.data.resolution,
        solvedInMeetingId: body.data.meetingId || null,
        updatedAt: new Date(),
      })
      .where(and(eq(tickets.id, id), eq(tickets.orgId, org.id)))
      .returning();
    if (!ticket) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Ticket not found' } });

    // Optional: spawn a follow-up to-do owned by a specific person.
    let createdTodo = null;
    if (body.data.followUp) {
      const dueAt = body.data.followUp.dueAt
        ? new Date(body.data.followUp.dueAt)
        : new Date(Date.now() + 7 * 86400000);
      // Tag the follow-up as kind='l10' scoped to the meeting's team so it
      // surfaces on /l8 and not /me/todos. If no meeting context is present
      // (shouldn't happen from the L8 UI but possible from API), fall back
      // to personal so the row isn't orphaned.
      let followKind: 'personal' | 'l10' = 'personal';
      let followTeamId: string | null = null;
      if (body.data.meetingId) {
        const [solvedMeeting] = await db.select().from(meetings)
          .where(and(eq(meetings.id, body.data.meetingId), eq(meetings.organizationId, org.id)))
          .limit(1);
        if (solvedMeeting?.teamId) {
          followKind = 'l10';
          followTeamId = solvedMeeting.teamId;
        }
      }
      const [t] = await db.insert(todos).values({
        organizationId: org.id,
        kind: followKind,
        teamId: followTeamId,
        meetingId: body.data.meetingId || null,
        ownerEntityType: body.data.followUp.ownerEntityType,
        ownerExternalId: body.data.followUp.ownerExternalId,
        ownerName: body.data.followUp.ownerName,
        title: body.data.followUp.title,
        description: `Follow-up from solved issue: "${ticket.title}". Resolution: ${body.data.resolution}`,
        dueAt,
        createdBy: 'l10:solve',
      }).returning();
      createdTodo = t;
    }

    // Append a one-liner to the meeting's cascadingMessage so it broadcasts
    // out of the meeting record. Atomic-ish: best-effort, do not fail the solve.
    if (body.data.meetingId) {
      try {
        const [m] = await db.select().from(meetings)
          .where(and(eq(meetings.id, body.data.meetingId), eq(meetings.organizationId, org.id)))
          .limit(1);
        if (m) {
          const prev = m.cascadingMessage || '';
          const ownerLine = createdTodo
            ? ` -> follow-up assigned to ${createdTodo.ownerName || createdTodo.ownerExternalId}`
            : '';
          const line = `- SOLVED: ${ticket.title} :: ${body.data.resolution}${ownerLine}`;
          const next = prev ? `${prev}\n${line}` : line;
          await db.update(meetings)
            .set({ cascadingMessage: next, updatedAt: new Date() })
            .where(eq(meetings.id, m.id));
        }
      } catch (e) {
        request.log.warn({ err: e }, 'cascading message append failed');
      }
    }

    await db.insert(auditLogs).values(createAuditEntry('ticket.solved', 'ticket', {
      orgId: org.id, entityId: id,
      details: { resolution: body.data.resolution, followUpTodoId: createdTodo?.id, meetingId: body.data.meetingId },
    }));

    return { ticket, todo: createdTodo };
  });
}
