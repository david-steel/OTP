import type { FastifyInstance } from 'fastify';
import { eq, and, desc, isNull } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../config/database.js';
import { meetings, rocks, kpis, kpiValues, tickets, todos, auditLogs } from '../../db/schema.js';
import { getAuth } from '@clerk/fastify';
import { getAuthOrg } from '../../middleware/auth-helpers.js';
import { resolveApiKey, requireScope } from '../../middleware/api-key-auth.js';
import { createAuditEntry } from '../../services/audit-logger.js';
import { requireUuidParam } from '../../shared/param-validation.js';
import { createRateLimiter } from '../../shared/rate-limiter.js';

const checkRateLimit = createRateLimiter({ windowMs: 60_000, maxRequests: 30 });

const attendeeSchema = z.object({
  entityType: z.enum(['agent', 'human']),
  externalId: z.string().min(1).max(120),
  name: z.string().max(255).optional(),
});

const createMeetingSchema = z.object({
  meetingType: z.string().max(60).optional().default('leadership'),
  title: z.string().min(3).max(255),
  scheduledAt: z.string().datetime(),
  attendees: z.array(attendeeSchema).optional().default([]),
});

const updateMeetingSchema = z.object({
  title: z.string().min(3).max(255).optional(),
  meetingType: z.string().max(60).optional(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
  scheduledAt: z.string().datetime().optional(),
  attendees: z.array(attendeeSchema).optional(),
  segueNotes: z.string().optional(),
  headlines: z.string().optional(),
  cascadingMessage: z.string().optional(),
  ratings: z.record(z.number().min(1).max(10)).optional(),
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
  return true;
}

async function buildScorecardSnapshot(orgId: string) {
  const orgKpis = await db.select().from(kpis).where(and(eq(kpis.organizationId, orgId), isNull(kpis.deletedAt)));
  const kpiIds = orgKpis.map(k => k.id);
  const latestValues: Record<string, any> = {};
  for (const k of orgKpis) {
    const [latest] = await db.select().from(kpiValues)
      .where(eq(kpiValues.kpiId, k.id))
      .orderBy(desc(kpiValues.periodStart))
      .limit(1);
    if (latest) latestValues[k.id] = { value: latest.value, periodStart: latest.periodStart, periodEnd: latest.periodEnd };
  }
  return { kpis: orgKpis, latestValues, capturedAt: new Date().toISOString(), kpiCount: kpiIds.length };
}

async function buildRocksSnapshot(orgId: string) {
  const orgRocks = await db.select().from(rocks)
    .where(and(eq(rocks.organizationId, orgId), isNull(rocks.deletedAt)))
    .orderBy(desc(rocks.dueDate));
  return { rocks: orgRocks, capturedAt: new Date().toISOString(), count: orgRocks.length };
}

export default async function meetingRoutes(app: FastifyInstance) {
  // POST /api/v1/meetings
  app.post('/meetings', async (request, reply) => {
    if (!checkRateLimit(request.ip)) {
      return reply.status(429).send({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } });
    }
    if (!(await gateWriteScope(request, reply))) return;
    const org = await authedOrFail(request, reply);
    if (!org) return;

    const body = createMeetingSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid meeting data', details: body.error.issues } });
    }

    const createdBy = getAuth(request).userId || 'api_key';
    const [meeting] = await db.insert(meetings).values({
      organizationId: org.id,
      meetingType: body.data.meetingType,
      title: body.data.title,
      scheduledAt: new Date(body.data.scheduledAt),
      attendees: body.data.attendees,
      createdBy,
    }).returning();

    await db.insert(auditLogs).values(createAuditEntry('meeting.created', 'meeting', {
      orgId: org.id, entityId: meeting.id, details: { title: meeting.title, scheduledAt: body.data.scheduledAt },
    }));

    return reply.status(201).send({ meeting });
  });

  // GET /api/v1/meetings?meetingType=leadership&upcoming=true
  app.get<{ Querystring: { meetingType?: string; status?: string; upcoming?: string } }>('/meetings', async (request, reply) => {
    const org = await authedOrFail(request, reply);
    if (!org) return;

    const conditions = [eq(meetings.organizationId, org.id), isNull(meetings.deletedAt)];
    if (request.query.meetingType) conditions.push(eq(meetings.meetingType, request.query.meetingType));
    if (request.query.status) conditions.push(eq(meetings.status, request.query.status as any));

    const results = await db.select().from(meetings).where(and(...conditions)).orderBy(desc(meetings.scheduledAt));
    return { meetings: results, total: results.length };
  });

  // GET /api/v1/meetings/:id
  app.get<{ Params: { id: string } }>('/meetings/:id', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    const org = await authedOrFail(request, reply);
    if (!org) return;

    const [meeting] = await db.select().from(meetings).where(and(eq(meetings.id, id), eq(meetings.organizationId, org.id))).limit(1);
    if (!meeting) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Meeting not found' } });
    return { meeting };
  });

  // POST /api/v1/meetings/:id/start  (snapshot scorecard + rocks at meeting start)
  app.post<{ Params: { id: string } }>('/meetings/:id/start', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    if (!(await gateWriteScope(request, reply))) return;
    const org = await authedOrFail(request, reply);
    if (!org) return;

    const [scorecardSnapshot, rocksSnapshot] = await Promise.all([
      buildScorecardSnapshot(org.id),
      buildRocksSnapshot(org.id),
    ]);

    const [updated] = await db.update(meetings)
      .set({
        status: 'in_progress',
        startedAt: new Date(),
        scorecardSnapshot,
        rocksSnapshot,
        updatedAt: new Date(),
      })
      .where(and(eq(meetings.id, id), eq(meetings.organizationId, org.id)))
      .returning();
    if (!updated) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Meeting not found' } });

    await db.insert(auditLogs).values(createAuditEntry('meeting.started', 'meeting', {
      orgId: org.id, entityId: id,
      details: { kpiCount: scorecardSnapshot.kpiCount, rockCount: rocksSnapshot.count },
    }));

    return { meeting: updated };
  });

  // POST /api/v1/meetings/:id/end
  app.post<{ Params: { id: string } }>('/meetings/:id/end', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    if (!(await gateWriteScope(request, reply))) return;
    const org = await authedOrFail(request, reply);
    if (!org) return;

    const [updated] = await db.update(meetings)
      .set({ status: 'completed', endedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(meetings.id, id), eq(meetings.organizationId, org.id)))
      .returning();
    if (!updated) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Meeting not found' } });

    await db.insert(auditLogs).values(createAuditEntry('meeting.ended', 'meeting', {
      orgId: org.id, entityId: id,
    }));

    return { meeting: updated };
  });

  // PUT /api/v1/meetings/:id  (update notes/headlines/ratings/etc)
  app.put<{ Params: { id: string } }>('/meetings/:id', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    if (!(await gateWriteScope(request, reply))) return;
    const org = await authedOrFail(request, reply);
    if (!org) return;

    const body = updateMeetingSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid data', details: body.error.issues } });
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    const d = body.data;
    if (d.title !== undefined) updates.title = d.title;
    if (d.meetingType !== undefined) updates.meetingType = d.meetingType;
    if (d.status !== undefined) updates.status = d.status;
    if (d.scheduledAt !== undefined) updates.scheduledAt = new Date(d.scheduledAt);
    if (d.attendees !== undefined) updates.attendees = d.attendees;
    if (d.segueNotes !== undefined) updates.segueNotes = d.segueNotes;
    if (d.headlines !== undefined) updates.headlines = d.headlines;
    if (d.cascadingMessage !== undefined) updates.cascadingMessage = d.cascadingMessage;
    if (d.ratings !== undefined) updates.ratings = d.ratings;

    const [updated] = await db.update(meetings)
      .set(updates)
      .where(and(eq(meetings.id, id), eq(meetings.organizationId, org.id)))
      .returning();
    if (!updated) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Meeting not found' } });

    await db.insert(auditLogs).values(createAuditEntry('meeting.updated', 'meeting', {
      orgId: org.id, entityId: id, details: { fields: Object.keys(updates) },
    }));

    return { meeting: updated };
  });

  // POST /api/v1/meetings/:id/rebuild-cascading
  // Regenerates the cascading message from current meeting state: headlines,
  // every solved-this-meeting issue with its resolution, and every to-do
  // created in this meeting. Replaces the existing cascadingMessage. Returns
  // the new value so the client can swap the textarea inline.
  app.post<{ Params: { id: string } }>('/meetings/:id/rebuild-cascading', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    if (!(await gateWriteScope(request, reply))) return;
    const org = await authedOrFail(request, reply);
    if (!org) return;

    const [meeting] = await db.select().from(meetings)
      .where(and(eq(meetings.id, id), eq(meetings.organizationId, org.id)))
      .limit(1);
    if (!meeting) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Meeting not found' } });

    const [solved, fresh] = await Promise.all([
      db.select().from(tickets)
        .where(and(eq(tickets.orgId, org.id), eq(tickets.solvedInMeetingId, id), isNull(tickets.deletedAt))),
      db.select().from(todos)
        .where(and(eq(todos.organizationId, org.id), eq(todos.meetingId, id), isNull(todos.deletedAt))),
    ]);

    const lines: string[] = [];
    lines.push(`# ${meeting.title}`);
    lines.push(`Date: ${new Date(meeting.scheduledAt).toLocaleDateString()}`);
    if (Array.isArray(meeting.attendees) && (meeting.attendees as any[]).length > 0) {
      const names = (meeting.attendees as any[]).map((a: any) => a.name || a.externalId).join(', ');
      lines.push(`Attendees: ${names}`);
    }
    lines.push('');

    if (meeting.headlines && meeting.headlines.trim()) {
      lines.push('## Headlines');
      lines.push(meeting.headlines.trim());
      lines.push('');
    }

    if (solved.length > 0) {
      lines.push('## Solved Issues');
      for (const t of solved) {
        lines.push(`- ${t.title}`);
        if (t.resolution) lines.push(`  Resolution: ${t.resolution}`);
      }
      lines.push('');
    }

    if (fresh.length > 0) {
      lines.push('## New To-Dos (7-day commitments)');
      for (const t of fresh) {
        const owner = t.ownerName || t.ownerExternalId;
        const due = t.dueAt ? new Date(t.dueAt).toLocaleDateString() : 'no due date';
        lines.push(`- [${owner}, due ${due}] ${t.title}`);
      }
      lines.push('');
    }

    if (solved.length === 0 && fresh.length === 0 && !meeting.headlines) {
      lines.push('_(Nothing to cascade yet -- solve issues, capture headlines, or create to-dos and rebuild.)_');
    }

    const cascadingMessage = lines.join('\n').trim();
    const [updated] = await db.update(meetings)
      .set({ cascadingMessage, updatedAt: new Date() })
      .where(eq(meetings.id, id))
      .returning();

    await db.insert(auditLogs).values(createAuditEntry('meeting.cascading.rebuilt', 'meeting', {
      orgId: org.id, entityId: id, details: { solvedCount: solved.length, todoCount: fresh.length },
    }));

    return { meeting: updated, cascadingMessage };
  });

  // GET /api/v1/meetings/:id/agenda  (pulls everything the L8 page needs in one call)
  app.get<{ Params: { id: string } }>('/meetings/:id/agenda', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    const org = await authedOrFail(request, reply);
    if (!org) return;

    const [meeting] = await db.select().from(meetings).where(and(eq(meetings.id, id), eq(meetings.organizationId, org.id))).limit(1);
    if (!meeting) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Meeting not found' } });

    const [scorecard, rocksList, openTickets, openTodos] = await Promise.all([
      meeting.scorecardSnapshot ? Promise.resolve(meeting.scorecardSnapshot) : buildScorecardSnapshot(org.id),
      meeting.rocksSnapshot ? Promise.resolve(meeting.rocksSnapshot) : buildRocksSnapshot(org.id),
      db.select().from(tickets)
        .where(and(eq(tickets.orgId, org.id), isNull(tickets.deletedAt)))
        .orderBy(desc(tickets.priorityRank), desc(tickets.createdAt)),
      db.select().from(todos)
        .where(and(eq(todos.organizationId, org.id), isNull(todos.deletedAt)))
        .orderBy(desc(todos.createdAt)),
    ]);

    return { meeting, scorecard, rocks: rocksList, issues: openTickets, todos: openTodos };
  });
}
