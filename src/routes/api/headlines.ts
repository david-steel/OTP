/**
 * Meeting headlines API.
 *
 * POST   /api/v1/meetings/:id/headlines              add a headline (any attendee)
 * GET    /api/v1/meetings/:id/headlines              list headlines for a meeting
 * POST   /api/v1/meetings/:id/headlines/:hid/read    mark read (Integrator-only)
 * POST   /api/v1/meetings/:id/headlines/:hid/unread  un-mark read (Integrator-only)
 * PUT    /api/v1/meetings/:id/headlines/:hid         edit body (author or Integrator)
 * DELETE /api/v1/meetings/:id/headlines/:hid         delete (author or Integrator)
 *
 * The legacy meetings.headlines text field is unaffected. The L8 cascading
 * builder will eventually concatenate this table into the cascading message
 * preview.
 */
import type { FastifyInstance } from 'fastify';
import { getAuth } from '@clerk/fastify';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../config/database.js';
import {
  meetings,
  meetingHeadlines,
  organizations,
  orgMembers,
  auditLogs,
} from '../../db/schema.js';
import { resolveOrgForUser, type Role } from '../../services/membership.js';
import { canIntegrate } from '../../middleware/permissions.js';
import { createAuditEntry } from '../../services/audit-logger.js';
import { requireUuidParam } from '../../shared/param-validation.js';
import { createRateLimiter } from '../../shared/rate-limiter.js';

const rl = createRateLimiter({ windowMs: 60_000, maxRequests: 60 });

const createSchema = z.object({
  body: z.string().min(1).max(2000),
  kind: z.enum(['customer', 'employee', 'other']).optional().default('other'),
  teamId: z.string().uuid().nullable().optional(),
});

const updateSchema = z.object({
  body: z.string().min(1).max(2000).optional(),
  kind: z.enum(['customer', 'employee', 'other']).optional(),
});

async function authedMember(request: any, reply: any) {
  const auth = getAuth(request);
  if (!auth.userId) {
    reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in to manage headlines' } });
    return null;
  }
  const resolved = await resolveOrgForUser(auth.userId);
  if (!resolved) {
    // Try legacy
    const [legacy] = await db.select().from(organizations).where(eq(organizations.clerkOrgId, auth.userId)).limit(1);
    if (legacy) return { userId: auth.userId, org: legacy, role: 'owner' as Role, displayName: null as string | null };
    reply.status(404).send({ error: { code: 'NO_ORG', message: 'No org for current user' } });
    return null;
  }
  const [m] = await db.select({ displayName: orgMembers.displayName, email: orgMembers.email })
    .from(orgMembers)
    .where(and(eq(orgMembers.orgId, resolved.org.id), eq(orgMembers.clerkUserId, auth.userId)))
    .limit(1);
  return {
    userId: auth.userId,
    org: resolved.org,
    role: resolved.role,
    displayName: m?.displayName || m?.email || null,
  };
}

async function requireMeeting(orgId: string, meetingId: string, reply: any) {
  const [meeting] = await db.select().from(meetings)
    .where(and(eq(meetings.id, meetingId), eq(meetings.organizationId, orgId)))
    .limit(1);
  if (!meeting) {
    reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Meeting not found' } });
    return null;
  }
  return meeting;
}

export default async function headlineRoutes(app: FastifyInstance) {
  // POST /api/v1/meetings/:id/headlines
  app.post<{ Params: { id: string } }>('/meetings/:id/headlines', async (request, reply) => {
    if (!rl(request.ip)) return reply.status(429).send({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } });
    const id = requireUuidParam(request, reply);
    if (!id) return;
    const ctx = await authedMember(request, reply);
    if (!ctx) return;
    const meeting = await requireMeeting(ctx.org.id, id, reply);
    if (!meeting) return;

    const body = createSchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid headline', details: body.error.issues } });

    const [created] = await db.insert(meetingHeadlines).values({
      meetingId: id,
      orgId: ctx.org.id,
      teamId: body.data.teamId !== undefined ? body.data.teamId : meeting.teamId,
      authorUserId: ctx.userId,
      authorName: ctx.displayName,
      kind: body.data.kind,
      body: body.data.body,
    }).returning();

    await db.insert(auditLogs).values(createAuditEntry('headline.created', 'meeting_headline', {
      orgId: ctx.org.id, entityId: created.id, details: { meetingId: id, kind: body.data.kind },
    }));

    return reply.status(201).send({ headline: created });
  });

  // GET /api/v1/meetings/:id/headlines?unreadOnly=true
  app.get<{ Params: { id: string }; Querystring: { unreadOnly?: string } }>('/meetings/:id/headlines', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    const ctx = await authedMember(request, reply);
    if (!ctx) return;

    const conditions = [eq(meetingHeadlines.meetingId, id), eq(meetingHeadlines.orgId, ctx.org.id)];
    const rows = await db.select().from(meetingHeadlines)
      .where(and(...conditions))
      .orderBy(desc(meetingHeadlines.createdAt));
    const filtered = request.query.unreadOnly === 'true'
      ? rows.filter(r => !r.readAt)
      : rows;
    return { headlines: filtered, total: filtered.length };
  });

  // POST /api/v1/meetings/:id/headlines/:hid/read   -- Integrator-only
  app.post<{ Params: { id: string; hid: string } }>('/meetings/:id/headlines/:hid/read', async (request, reply) => {
    const id = request.params.id;
    const hid = request.params.hid;
    if (!/^[0-9a-f-]{36}$/i.test(id) || !/^[0-9a-f-]{36}$/i.test(hid)) {
      return reply.status(400).send({ error: { code: 'INVALID_PARAM', message: 'Invalid id' } });
    }
    const ctx = await authedMember(request, reply);
    if (!ctx) return;
    if (!canIntegrate(ctx.role)) {
      return reply.status(403).send({ error: { code: 'NOT_INTEGRATOR', message: 'Only the Integrator can mark headlines read' } });
    }

    const [updated] = await db.update(meetingHeadlines)
      .set({ readAt: new Date(), readByUserId: ctx.userId, updatedAt: new Date() })
      .where(and(
        eq(meetingHeadlines.id, hid),
        eq(meetingHeadlines.meetingId, id),
        eq(meetingHeadlines.orgId, ctx.org.id),
      ))
      .returning();
    if (!updated) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Headline not found' } });

    await db.insert(auditLogs).values(createAuditEntry('headline.read', 'meeting_headline', {
      orgId: ctx.org.id, entityId: hid, details: { meetingId: id, readBy: ctx.userId },
    }));
    return { headline: updated };
  });

  // POST /api/v1/meetings/:id/headlines/:hid/unread  -- Integrator-only
  app.post<{ Params: { id: string; hid: string } }>('/meetings/:id/headlines/:hid/unread', async (request, reply) => {
    const { id, hid } = request.params;
    if (!/^[0-9a-f-]{36}$/i.test(id) || !/^[0-9a-f-]{36}$/i.test(hid)) {
      return reply.status(400).send({ error: { code: 'INVALID_PARAM', message: 'Invalid id' } });
    }
    const ctx = await authedMember(request, reply);
    if (!ctx) return;
    if (!canIntegrate(ctx.role)) {
      return reply.status(403).send({ error: { code: 'NOT_INTEGRATOR', message: 'Only the Integrator can change read state' } });
    }

    const [updated] = await db.update(meetingHeadlines)
      .set({ readAt: null, readByUserId: null, updatedAt: new Date() })
      .where(and(
        eq(meetingHeadlines.id, hid),
        eq(meetingHeadlines.meetingId, id),
        eq(meetingHeadlines.orgId, ctx.org.id),
      ))
      .returning();
    if (!updated) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Headline not found' } });
    return { headline: updated };
  });

  // PUT /api/v1/meetings/:id/headlines/:hid  -- author or Integrator
  app.put<{ Params: { id: string; hid: string } }>('/meetings/:id/headlines/:hid', async (request, reply) => {
    const { id, hid } = request.params;
    if (!/^[0-9a-f-]{36}$/i.test(id) || !/^[0-9a-f-]{36}$/i.test(hid)) {
      return reply.status(400).send({ error: { code: 'INVALID_PARAM', message: 'Invalid id' } });
    }
    const ctx = await authedMember(request, reply);
    if (!ctx) return;

    const body = updateSchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid update', details: body.error.issues } });

    const [existing] = await db.select().from(meetingHeadlines)
      .where(and(eq(meetingHeadlines.id, hid), eq(meetingHeadlines.orgId, ctx.org.id)))
      .limit(1);
    if (!existing) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Headline not found' } });

    const isAuthor = existing.authorUserId === ctx.userId;
    if (!isAuthor && !canIntegrate(ctx.role)) {
      return reply.status(403).send({ error: { code: 'NOT_AUTHOR', message: 'Only the author or Integrator may edit this headline' } });
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (body.data.body !== undefined) updates.body = body.data.body;
    if (body.data.kind !== undefined) updates.kind = body.data.kind;

    const [updated] = await db.update(meetingHeadlines).set(updates)
      .where(eq(meetingHeadlines.id, hid))
      .returning();

    return { headline: updated };
  });

  // DELETE /api/v1/meetings/:id/headlines/:hid  -- author or Integrator
  app.delete<{ Params: { id: string; hid: string } }>('/meetings/:id/headlines/:hid', async (request, reply) => {
    const { id, hid } = request.params;
    if (!/^[0-9a-f-]{36}$/i.test(id) || !/^[0-9a-f-]{36}$/i.test(hid)) {
      return reply.status(400).send({ error: { code: 'INVALID_PARAM', message: 'Invalid id' } });
    }
    const ctx = await authedMember(request, reply);
    if (!ctx) return;

    const [existing] = await db.select().from(meetingHeadlines)
      .where(and(eq(meetingHeadlines.id, hid), eq(meetingHeadlines.orgId, ctx.org.id)))
      .limit(1);
    if (!existing) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Headline not found' } });

    const isAuthor = existing.authorUserId === ctx.userId;
    if (!isAuthor && !canIntegrate(ctx.role)) {
      return reply.status(403).send({ error: { code: 'NOT_AUTHOR', message: 'Only the author or Integrator may delete this headline' } });
    }

    await db.delete(meetingHeadlines).where(eq(meetingHeadlines.id, hid));
    await db.insert(auditLogs).values(createAuditEntry('headline.deleted', 'meeting_headline', {
      orgId: ctx.org.id, entityId: hid, details: { meetingId: id },
    }));
    return { ok: true };
  });
}
