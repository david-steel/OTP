import type { FastifyInstance } from 'fastify';
import { eq, and, desc, asc, sql, isNull } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../config/database.js';
import { meetings, rocks, kpis, kpiValues, tickets, todos, auditLogs, organizations } from '../../db/schema.js';
import { getAuth } from '@clerk/fastify';
import { getAuthOrg } from '../../middleware/auth-helpers.js';
import { resolveApiKey, requireScope } from '../../middleware/api-key-auth.js';
import { createAuditEntry } from '../../services/audit-logger.js';
import { requireUuidParam } from '../../shared/param-validation.js';
import { createRateLimiter } from '../../shared/rate-limiter.js';
import { isAttendee } from '../../services/meeting-access.js';
import { deliverToAgentInbox } from '../../services/agent-inbox.js';
import { subscribeToMeeting, publishMeetingUpdate } from '../../services/meeting-bus.js';
import { ensureNextOccurrence } from '../../services/meeting-recurrence.js';

const checkRateLimit = createRateLimiter({ windowMs: 60_000, maxRequests: 30 });

const attendeeSchema = z.object({
  entityType: z.enum(['agent', 'human']),
  externalId: z.string().min(1).max(120),
  name: z.string().max(255).optional(),
});

const createMeetingSchema = z.object({
  meetingType: z.string().max(60).optional().default('leadership'),
  // Meeting create form at l8-list.ejs uses `required` only -- a user can
  // type "L8" or "1:1" and submit. Relaxed from min(3) to min(1) on
  // 2026-05-27 to match the UI promise. The form's prefilled default
  // ("Leadership Meeting -- {date}") is the common case anyway.
  title: z.string().min(1).max(255),
  scheduledAt: z.string().datetime(),
  attendees: z.array(attendeeSchema).optional().default([]),
  teamId: z.string().uuid().optional(),
});

const updateMeetingSchema = z.object({
  // Match createMeetingSchema.title -- the in-place title editor on the
  // L8 page must accept the same values the create form does.
  title: z.string().min(1).max(255).optional(),
  meetingType: z.string().max(60).optional(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
  scheduledAt: z.string().datetime().optional(),
  // Relaxed for the per-attendee check-in feature: attendee rows now carry
  // extra fields (checkinText, checkinAt, memberId, externalIds[], type)
  // that the strict attendeeSchema does not allow. The frontend manages the
  // shape; the column is jsonb, so we accept any object.
  attendees: z.array(z.record(z.string(), z.unknown())).optional(),
  segueNotes: z.string().optional(),
  headlines: z.string().optional(),
  cascadingMessage: z.string().optional(),
  ratings: z.record(z.number().min(1).max(10)).optional(),
  teamId: z.string().uuid().nullable().optional(),
  // Phase 0 meeting scheduler (manual paste path): a user-pasted video link.
  // Empty string clears it. Loose URL cap at 2048 to match the column; we
  // accept any string (a user might paste a Teams/Zoom/Meet URL of any shape).
  videoLink: z.string().max(2048).optional(),
  // Recurrence (OTP owns the series). An iCal RRULE subset (FREQ=WEEKLY etc),
  // empty string clears it back to one-time. The UI only sends the four
  // RECURRENCE_OPTIONS values; we accept any short string defensively.
  recurrenceRule: z.string().max(255).optional(),
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

/**
 * Phase 4: gate edits to a meeting on role + team membership.
 * Returns true if the request may mutate this meeting, false after writing
 * a 403 reply.
 *
 * Rules:
 *  - API-key request: rely on gateWriteScope (already validated upstream).
 *  - Org-wide roles (owner/admin/implementer): always allowed.
 *  - Observer/inactive/free: never allowed (read-only).
 *  - Manager/managee: allowed only if they belong to the meeting's team
 *    (via team_memberships) and their role can edit assigned items.
 */
async function checkMeetingEdit(
  request: any,
  reply: any,
  orgId: string,
  meetingId: string,
): Promise<boolean> {
  const auth = getAuth(request);
  if (!auth.userId) return true; // API-key path

  // Legacy founder: their Clerk user id is stored as organizations.clerkOrgId
  // (the same identity getAuthOrg Path 1 uses to resolve the org). They own
  // this org and may always edit its meetings -- regardless of whether an
  // org_members row exists or what role it carries. This MUST run before the
  // member/role checks below, or a founder who also has a non-privileged
  // org_members row gets wrongly blocked (the 6/1 "Start button does nothing"
  // bug: the page resolver honored this identity but the API gate did not).
  const [ownerOrg] = await db.select({ clerkOrgId: organizations.clerkOrgId })
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);
  if (ownerOrg && (ownerOrg as any).clerkOrgId === auth.userId) return true;

  const member = (request as any).orgMember as
    | { id: string; role: any }
    | null;

  if (!member) {
    reply.status(403).send({ error: { code: 'NOT_A_MEMBER', message: 'You are not a member of this org' } });
    return false;
  }

  if (member.role === 'owner' || member.role === 'admin' || member.role === 'implementer') {
    return true;
  }
  if (member.role === 'observer' || member.role === 'inactive' || member.role === 'free') {
    reply.status(403).send({ error: { code: 'MEETING_READ_ONLY', message: 'Your role is read-only for meetings' } });
    return false;
  }

  // manager / managee / member: must belong to the meeting's team.
  const [m] = await db.select({ teamId: meetings.teamId, attendees: meetings.attendees })
    .from(meetings)
    .where(and(eq(meetings.id, meetingId), eq(meetings.organizationId, orgId)))
    .limit(1);
  if (!m) {
    reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Meeting not found' } });
    return false;
  }
  if (!m.teamId) return true; // company-wide / unscoped meeting -- allow

  const { teamMemberships } = await import('../../db/schema.js');
  const [tm] = await db.select()
    .from(teamMemberships)
    .where(and(eq(teamMemberships.teamId, m.teamId), eq(teamMemberships.memberId, member.id)))
    .limit(1);
  if (!tm) {
    // Not on the meeting's team -- still allow if the requester is a human
    // attendee of the meeting itself.
    const { orgMembers } = await import('../../db/schema.js');
    const [fullMember] = await db.select({
      id: orgMembers.id,
      email: orgMembers.email,
      displayName: orgMembers.displayName,
      claimedEntityIds: orgMembers.claimedEntityIds,
    })
      .from(orgMembers)
      .where(eq(orgMembers.id, member.id))
      .limit(1);
    if (fullMember && isAttendee(fullMember, { attendees: m.attendees })) {
      return true;
    }
    reply.status(403).send({ error: { code: 'NOT_ON_TEAM', message: 'You are not on this meeting\'s team' } });
    return false;
  }
  return true;
}

async function buildScorecardSnapshot(orgId: string) {
  const orgKpis = await db.select().from(kpis).where(and(eq(kpis.organizationId, orgId), isNull(kpis.deletedAt)));
  const kpiIds = orgKpis.map(k => k.id);
  const latestValues: Record<string, any> = {};
  const previousValues: Record<string, any> = {};
  for (const k of orgKpis) {
    const rows = await db.select().from(kpiValues)
      .where(eq(kpiValues.kpiId, k.id))
      .orderBy(desc(kpiValues.periodStart))
      .limit(2);
    const latest = rows[0];
    const previous = rows[1];
    if (latest) latestValues[k.id] = { value: latest.value, periodStart: latest.periodStart, periodEnd: latest.periodEnd };
    if (previous) previousValues[k.id] = { value: previous.value, periodStart: previous.periodStart, periodEnd: previous.periodEnd };
  }
  return { kpis: orgKpis, latestValues, previousValues, capturedAt: new Date().toISOString(), kpiCount: kpiIds.length };
}

async function buildRocksSnapshot(orgId: string) {
  const orgRocks = await db.select().from(rocks)
    .where(and(
      eq(rocks.organizationId, orgId),
      isNull(rocks.deletedAt),
      isNull(rocks.completedAt),
      isNull(rocks.archivedAt),
    ))
    .orderBy(sql`${rocks.position} asc nulls last`, asc(rocks.dueDate));
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

    // Phase 4: a meeting is scoped to a team. If the caller didn't pick one,
    // fall back to the org's default Leadership Team (created by ensure-teams.ts).
    let resolvedTeamId: string | null = body.data.teamId || null;
    if (!resolvedTeamId) {
      const { teams } = await import('../../db/schema.js');
      const [defaultTeam] = await db.select({ id: teams.id })
        .from(teams)
        .where(and(eq(teams.orgId, org.id), eq(teams.slug, 'leadership')))
        .limit(1);
      resolvedTeamId = defaultTeam?.id || null;
    }

    // Phase 4: auto-populate attendees from team_memberships if the caller
    // didn't provide an explicit attendee list. Humans on the team come
    // first; agents reporting to any of those humans (via reports_to walk
    // on the published OOS chart) come next, so an L8 attendee list mirrors
    // who actually shows up on Zoom plus their AI agents.
    let resolvedAttendees: any[] = (body.data.attendees as any[]) || [];
    if (resolvedAttendees.length === 0 && resolvedTeamId) {
      const { teamMemberships, orgMembers: orgMembersTable } =
        await import('../../db/schema.js');
      const teamHumans = await db
        .select({
          memberId: orgMembersTable.id,
          displayName: orgMembersTable.displayName,
          email: orgMembersTable.email,
          role: orgMembersTable.role,
          claimedEntityIds: orgMembersTable.claimedEntityIds,
        })
        .from(teamMemberships)
        .innerJoin(orgMembersTable, eq(teamMemberships.memberId, orgMembersTable.id))
        .where(eq(teamMemberships.teamId, resolvedTeamId));

      const humanTileIds: string[] = [];
      for (const h of teamHumans) {
        const tiles = (h.claimedEntityIds as string[]) || [];
        for (const t of tiles) if (t) humanTileIds.push(t);
        resolvedAttendees.push({
          type: 'human',
          memberId: h.memberId,
          name: h.displayName || h.email || 'member',
          externalIds: tiles,
          role: h.role,
        });
      }

      // Walk the chart to find agents reporting (transitively) to any of
      // these humans' tiles. If the chart isn't published or the team has
      // no claimed humans, this list is empty -- not an error.
      // Auto-add humans only. EOS leadership meetings are humans-only by
      // convention; agents under those humans get tracked through their
      // own KPIs/rocks/issues/todos. To bring an agent into a specific
      // meeting, the user adds it explicitly via the attendee editor.
      // David flagged 2026-05-25 that auto-adding Dirk was wrong.
      void humanTileIds; // referenced above for human auto-populate only
    }

    const createdBy = getAuth(request).userId || 'api_key';
    const [meeting] = await db.insert(meetings).values({
      organizationId: org.id,
      teamId: resolvedTeamId,
      meetingType: body.data.meetingType,
      title: body.data.title,
      scheduledAt: new Date(body.data.scheduledAt),
      attendees: resolvedAttendees,
      createdBy,
    }).returning();

    await db.insert(auditLogs).values(createAuditEntry('meeting.created', 'meeting', {
      orgId: org.id, entityId: meeting.id, details: { title: meeting.title, scheduledAt: body.data.scheduledAt },
    }));

    return reply.status(201).send({ meeting });
  });

  // GET /api/v1/meetings?meetingType=leadership&upcoming=true&teamId=<uuid>
  app.get<{ Querystring: { meetingType?: string; status?: string; upcoming?: string; teamId?: string } }>('/meetings', async (request, reply) => {
    const org = await authedOrFail(request, reply);
    if (!org) return;

    const conditions = [eq(meetings.organizationId, org.id), isNull(meetings.deletedAt)];
    if (request.query.meetingType) conditions.push(eq(meetings.meetingType, request.query.meetingType));
    if (request.query.status) conditions.push(eq(meetings.status, request.query.status as any));
    if (request.query.teamId) conditions.push(eq(meetings.teamId, request.query.teamId));

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
    if (!(await checkMeetingEdit(request, reply, org.id, id))) return;

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

    publishMeetingUpdate(id, { kind: 'meeting', action: 'started' });
    return { meeting: updated };
  });

  // POST /api/v1/meetings/:id/refresh-scorecard
  // Re-snapshots scorecard + rocks for an in-progress meeting so the user can
  // pull fresh KPI values (e.g. after an agent ran) without restarting the
  // meeting. Unlike /start, this does not touch status or startedAt.
  app.post<{ Params: { id: string } }>('/meetings/:id/refresh-scorecard', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    if (!(await gateWriteScope(request, reply))) return;
    const org = await authedOrFail(request, reply);
    if (!org) return;
    if (!(await checkMeetingEdit(request, reply, org.id, id))) return;

    const [meeting] = await db.select().from(meetings)
      .where(and(eq(meetings.id, id), eq(meetings.organizationId, org.id)))
      .limit(1);
    if (!meeting) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Meeting not found' } });

    const [scorecardSnapshot, rocksSnapshot] = await Promise.all([
      buildScorecardSnapshot(org.id),
      buildRocksSnapshot(org.id),
    ]);

    const [updated] = await db.update(meetings)
      .set({ scorecardSnapshot, rocksSnapshot, updatedAt: new Date() })
      .where(and(eq(meetings.id, id), eq(meetings.organizationId, org.id)))
      .returning();
    if (!updated) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Meeting not found' } });

    await db.insert(auditLogs).values(createAuditEntry('meeting.scorecard.refreshed', 'meeting', {
      orgId: org.id, entityId: id, details: { kpiCount: scorecardSnapshot.kpiCount },
    }));

    publishMeetingUpdate(id, { kind: 'kpi', action: 'refreshed' });
    return { meeting: updated };
  });

  // POST /api/v1/meetings/:id/end
  app.post<{ Params: { id: string } }>('/meetings/:id/end', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    if (!(await gateWriteScope(request, reply))) return;
    const org = await authedOrFail(request, reply);
    if (!org) return;
    if (!(await checkMeetingEdit(request, reply, org.id, id))) return;

    const [updated] = await db.update(meetings)
      .set({ status: 'completed', endedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(meetings.id, id), eq(meetings.organizationId, org.id)))
      .returning();
    if (!updated) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Meeting not found' } });

    await db.insert(auditLogs).values(createAuditEntry('meeting.ended', 'meeting', {
      orgId: org.id, entityId: id,
    }));

    // If this meeting is part of a recurring series, roll the next occurrence
    // forward so an upcoming meeting always exists. Best-effort: a recurrence
    // failure must not block ending the meeting.
    let nextOccurrence: typeof updated | null = null;
    if (updated.recurrenceRule) {
      try {
        nextOccurrence = await ensureNextOccurrence(updated);
        if (nextOccurrence) {
          await db.insert(auditLogs).values(createAuditEntry('meeting.recurrence.rolled', 'meeting', {
            orgId: org.id, entityId: nextOccurrence.id, details: { fromMeetingId: id, scheduledAt: nextOccurrence.scheduledAt },
          }));
        }
      } catch (err) {
        request.log.error({ err, meetingId: id }, 'ensureNextOccurrence failed on meeting end');
      }
    }

    publishMeetingUpdate(id, { kind: 'meeting', action: 'ended' });
    return { meeting: updated, nextOccurrence };
  });

  // DELETE /api/v1/meetings/:id  (soft-delete -- any status is deletable)
  app.delete<{ Params: { id: string } }>('/meetings/:id', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    if (!(await gateWriteScope(request, reply))) return;
    const org = await authedOrFail(request, reply);
    if (!org) return;
    if (!(await checkMeetingEdit(request, reply, org.id, id))) return;

    const [deleted] = await db.update(meetings)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(meetings.id, id), eq(meetings.organizationId, org.id), isNull(meetings.deletedAt)))
      .returning();
    if (!deleted) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Meeting not found' } });

    await db.insert(auditLogs).values(createAuditEntry('meeting.deleted', 'meeting', {
      orgId: org.id, entityId: id,
    }));

    return { deleted: true };
  });

  // PUT /api/v1/meetings/:id  (update notes/headlines/ratings/etc)
  app.put<{ Params: { id: string } }>('/meetings/:id', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    if (!(await gateWriteScope(request, reply))) return;
    const org = await authedOrFail(request, reply);
    if (!org) return;
    if (!(await checkMeetingEdit(request, reply, org.id, id))) return;

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
    // Trim then store; empty string clears the link.
    if (d.videoLink !== undefined) updates.videoLink = d.videoLink.trim() || null;
    // Empty string clears recurrence back to one-time.
    if (d.recurrenceRule !== undefined) updates.recurrenceRule = d.recurrenceRule.trim() || null;

    const [updated] = await db.update(meetings)
      .set(updates)
      .where(and(eq(meetings.id, id), eq(meetings.organizationId, org.id)))
      .returning();
    if (!updated) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Meeting not found' } });

    await db.insert(auditLogs).values(createAuditEntry('meeting.updated', 'meeting', {
      orgId: org.id, entityId: id, details: { fields: Object.keys(updates) },
    }));

    // Real-time fan-out: any open SSE subscribers on this meeting get a
    // "meeting-updated" event so their view refreshes. Covers segue
    // saves (attendees jsonb), attendee edits, rating, status changes.
    publishMeetingUpdate(id, {
      kind: 'attendees' in updates ? 'attendees' : 'meeting',
      action: 'updated',
    });

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
    if (!(await checkMeetingEdit(request, reply, org.id, id))) return;

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

  // POST /api/v1/meetings/:id/cascade
  // Delivers the meeting's cascading message into the local L8 agent message
  // bus -- one INFORM block per agent attendee. Requires the cascading
  // message to already exist (rebuild it first).
  app.post<{ Params: { id: string } }>('/meetings/:id/cascade', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    if (!(await gateWriteScope(request, reply))) return;
    const org = await authedOrFail(request, reply);
    if (!org) return;
    if (!(await checkMeetingEdit(request, reply, org.id, id))) return;

    const [meeting] = await db.select().from(meetings)
      .where(and(eq(meetings.id, id), eq(meetings.organizationId, org.id)))
      .limit(1);
    if (!meeting) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Meeting not found' } });

    if (!meeting.cascadingMessage || !meeting.cascadingMessage.trim()) {
      return reply.status(400).send({ error: { code: 'NOTHING_TO_CASCADE', message: 'Cascading message is empty -- rebuild it first.' } });
    }

    const attendees = Array.isArray(meeting.attendees) ? (meeting.attendees as any[]) : [];
    const deliveries: { agent: string; delivered: boolean }[] = [];
    for (const a of attendees) {
      if (!a || (a.entityType !== 'agent' && a.type !== 'agent')) continue;
      if (typeof a.externalId !== 'string' || !a.externalId.trim()) {
        deliveries.push({ agent: String(a.externalId ?? ''), delivered: false });
        continue;
      }
      const result = await deliverToAgentInbox(a.externalId, meeting.title, meeting.cascadingMessage);
      deliveries.push({ agent: a.externalId, delivered: result.delivered });
    }

    const deliveredCount = deliveries.filter(d => d.delivered).length;
    await db.insert(auditLogs).values(createAuditEntry('meeting.cascaded', 'meeting', {
      orgId: org.id, entityId: id, details: { agentCount: deliveries.length, deliveredCount },
    }));

    return { cascaded: true, deliveries };
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

  // GET /api/v1/meetings/:id/events  (Server-Sent Events stream)
  //
  // Holds an open text/event-stream connection. The client subscribes
  // when it loads /l8/meeting/:id and listens for two event types:
  //
  //   event: presence
  //   data: { meetingId, presence: [{ subscriberId, name, externalId, ... }] }
  //
  //   event: meeting-updated
  //   data: { meetingId, kind: 'rock'|'kpi'|'todo'|'issue'|'headline'|'checkin'|'attendees'|'meeting'|'rating', at }
  //
  // Plus periodic ":keepalive" comments so proxies don't drop the
  // connection. The connection itself is the heartbeat for presence --
  // when the client closes the EventSource, the server removes it from
  // the presence set.
  app.get<{ Params: { id: string } }>('/meetings/:id/events', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    const org = await authedOrFail(request, reply);
    if (!org) return;

    const [meeting] = await db.select().from(meetings)
      .where(and(eq(meetings.id, id), eq(meetings.organizationId, org.id)))
      .limit(1);
    if (!meeting) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Meeting not found' } });

    // Same access rule as /l8/meeting/:id: on the meeting's team OR a
    // listed human attendee. Read-only stream, so observers/managees
    // are allowed.
    const member = (request as any).orgMember as { id: string } | null;
    let presenceName = 'Viewer';
    let presenceExternalId: string | null = null;
    if (member) {
      let onTeam = false;
      if (meeting.teamId) {
        const { teamMemberships } = await import('../../db/schema.js');
        const [tm] = await db.select({ teamId: teamMemberships.teamId })
          .from(teamMemberships)
          .where(and(
            eq(teamMemberships.memberId, member.id),
            eq(teamMemberships.teamId, meeting.teamId),
          ))
          .limit(1);
        onTeam = !!tm;
      }
      const { orgMembers } = await import('../../db/schema.js');
      const [fullMember] = await db.select({
        id: orgMembers.id,
        email: orgMembers.email,
        displayName: orgMembers.displayName,
        claimedEntityIds: orgMembers.claimedEntityIds,
      }).from(orgMembers).where(eq(orgMembers.id, member.id)).limit(1);
      const allowed = onTeam || isAttendee(fullMember, meeting);
      if (!allowed) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Meeting not found' } });
      if (fullMember) {
        presenceName = fullMember.displayName || fullMember.email || 'Viewer';
        const tiles = (fullMember.claimedEntityIds as string[] | null) || [];
        presenceExternalId = tiles[0] || null;
      }
    }

    // Take over the raw socket. Fastify doesn't have a built-in SSE
    // helper, so we write the headers and chunks manually. hijack() tells
    // Fastify not to try to send its own response afterward.
    reply.hijack();
    const raw = reply.raw;
    raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    // Padding so some proxies start streaming immediately.
    raw.write(':' + ' '.repeat(2048) + '\n\n');
    raw.write('retry: 5000\n\n');

    function sseSend(event: string, data: unknown) {
      if (raw.writableEnded) return;
      raw.write('event: ' + event + '\n');
      raw.write('data: ' + JSON.stringify(data) + '\n\n');
    }

    const subscription = subscribeToMeeting({
      meetingId: id,
      teamId: meeting.teamId,
      name: presenceName,
      externalId: presenceExternalId,
      send: sseSend,
      close: () => { try { raw.end(); } catch { /* ignore */ } },
    });

    // Keepalive ping every 25s -- below Heroku/Railway's 30s idle cap.
    const keepalive = setInterval(() => {
      if (raw.writableEnded) return;
      try {
        raw.write(': keepalive ' + Date.now() + '\n\n');
        subscription.touch();
      } catch { /* ignore */ }
    }, 25_000);
    keepalive.unref?.();

    // Cleanup on client disconnect.
    const cleanup = () => {
      clearInterval(keepalive);
      subscription.unsubscribe();
    };
    request.raw.on('close', cleanup);
    request.raw.on('error', cleanup);
    // No return -- reply.hijack() above told Fastify we're handling
    // the response. The raw stream stays open until the client closes.
  });
}

// Re-export for routes that need to publish meeting updates without
// importing the bus directly.
export { publishMeetingUpdate, publishToTeamMeetings } from '../../services/meeting-bus.js';
