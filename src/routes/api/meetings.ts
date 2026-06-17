import type { FastifyInstance } from 'fastify';
import { eq, and, desc, asc, sql, isNull, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../config/database.js';
import { meetings, rocks, kpis, kpiValues, tickets, todos, auditLogs, organizations } from '../../db/schema.js';
import { getAuth } from '@clerk/fastify';
import { getAuthOrg } from '../../middleware/auth-helpers.js';
import { resolveApiKey, requireScope } from '../../middleware/api-key-auth.js';
import { createAuditEntry } from '../../services/audit-logger.js';
import { emitOrgEventSafe } from '../../services/org-events.js';
import { requireUuidParam } from '../../shared/param-validation.js';
import { createRateLimiter } from '../../shared/rate-limiter.js';
import { isAttendee } from '../../services/meeting-access.js';
import { deliverToAgentInbox } from '../../services/agent-inbox.js';
import { subscribeToMeeting, publishMeetingUpdate, setMeetingTimer } from '../../services/meeting-bus.js';
import { defaultMeetingTitle } from '../../services/meeting-recurrence.js';
import { planSeriesDeletion, isDeleteScope } from '../../services/meeting-series.js';
import { buildScorecardSnapshot } from '../../services/meeting-resnapshot.js';
import { endMeetingCore } from '../../services/meeting-lifecycle.js';
import { computeAutoEndAt, isMeetingLocked } from '../../shared/meeting-timing.js';

const checkRateLimit = createRateLimiter({ windowMs: 60_000, maxRequests: 30 });

const attendeeSchema = z.object({
  entityType: z.enum(['agent', 'human']),
  externalId: z.string().min(1).max(120),
  name: z.string().max(255).optional(),
});

const createMeetingSchema = z.object({
  meetingType: z.string().max(60).optional().default('leadership'),
  // Title is optional as of 2026-06-10: a blank/omitted title is generated
  // server-side as "{Type label} — {Team name}" (see defaultMeetingTitle).
  // When provided, anything non-empty goes -- a user can type "L8" or "1:1".
  title: z.string().max(255).optional(),
  scheduledAt: z.string().datetime(),
  attendees: z.array(attendeeSchema).optional().default([]),
  teamId: z.string().uuid().optional(),
});

const segmentNotesSchema = z.object({
  define_issue: z.object({ issue: z.string().max(20000) }).partial().strict().optional(),
  reality_check: z.object({ internal: z.string().max(20000), external: z.string().max(20000) }).partial().strict().optional(),
  future_consequences: z.object({ in_12_months: z.string().max(20000), in_36_months: z.string().max(20000) }).partial().strict().optional(),
  strategic_options: z.object({ options: z.string().max(20000) }).partial().strict().optional(),
  debate_decide: z.object({ believe_true: z.string().max(20000), stop_doing: z.string().max(20000), start_doing: z.string().max(20000), single_focus: z.string().max(20000) }).partial().strict().optional(),
  strategic_commitment: z.object({ biggest_challenge: z.string().max(20000), strategic_focus: z.string().max(20000), top_priority_90d: z.string().max(20000), to_win_we_must: z.string().max(20000), we_will_stop: z.string().max(20000) }).partial().strict().optional(),
  define_success: z.object({ criteria: z.string().max(20000) }).partial().strict().optional(),
}).strict();

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
  ratings: z.record(z.union([z.number().min(1).max(10), z.literal('absent')])).optional(),
  teamId: z.string().uuid().nullable().optional(),
  // Phase 0 meeting scheduler (manual paste path): a user-pasted video link.
  // Empty string clears it. Loose URL cap at 2048 to match the column; we
  // accept any string (a user might paste a Teams/Zoom/Meet URL of any shape).
  videoLink: z.string().max(2048).optional(),
  // Recurrence (OTP owns the series). An iCal RRULE subset (FREQ=WEEKLY etc),
  // empty string clears it back to one-time. The UI only sends the four
  // RECURRENCE_OPTIONS values; we accept any short string defensively.
  recurrenceRule: z.string().max(255).optional(),
  segmentNotes: segmentNotesSchema.optional(),
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
  opts: { allowLocked?: boolean } = {},
): Promise<boolean> {
  const auth = getAuth(request);
  if (!auth.userId) return true; // API-key path

  // Lock gate: a future-dated, not-yet-started meeting is "locked" so people
  // cannot enter data into next week's recurring occurrence by mistake instead
  // of the current one. Applies to everyone (founder included) -- it is about
  // editing the WRONG meeting, not about permissions. /start opts out
  // (allowLocked) so a meeting can still be deliberately opened early; once
  // started it is no longer locked.
  if (!opts.allowLocked) {
    const [lockRow] = await db.select({
      status: meetings.status,
      scheduledAt: meetings.scheduledAt,
      recurrenceRule: meetings.recurrenceRule,
      recurrenceParentId: meetings.recurrenceParentId,
    })
      .from(meetings)
      .where(and(eq(meetings.id, meetingId), eq(meetings.organizationId, orgId)))
      .limit(1);
    if (lockRow && isMeetingLocked(lockRow)) {
      reply.status(423).send({ error: { code: 'MEETING_LOCKED', message: 'This meeting is scheduled for the future. Start it to begin, or wait until its date arrives.' } });
      return false;
    }
  }

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

// buildScorecardSnapshot moved to services/meeting-resnapshot.ts (imported
// above) so the meeting routes and the auto-resnapshot path share one snapshot
// definition.

async function buildRocksSnapshot(orgId: string, teamId: string | null) {
  // Team-scoped, mirroring buildScorecardSnapshot (see note there).
  const orgRocks = await db.select().from(rocks)
    .where(and(
      eq(rocks.organizationId, orgId),
      teamId ? eq(rocks.teamId, teamId) : isNull(rocks.teamId),
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
    // Resolve the team NAME too when the title is blank -- it's generated as
    // "{Type label} — {Team name}" (date-free by design; the recurrence roller
    // copies titles forward and the date renders as data everywhere).
    const trimmedTitle = (body.data.title || '').trim();
    let resolvedTeamId: string | null = body.data.teamId || null;
    let resolvedTeamName: string | null = null;
    const { teams } = await import('../../db/schema.js');
    if (!resolvedTeamId) {
      const [defaultTeam] = await db.select({ id: teams.id, name: teams.name })
        .from(teams)
        .where(and(eq(teams.orgId, org.id), eq(teams.slug, 'leadership')))
        .limit(1);
      resolvedTeamId = defaultTeam?.id || null;
      resolvedTeamName = defaultTeam?.name || null;
    } else if (!trimmedTitle) {
      const [t] = await db.select({ name: teams.name })
        .from(teams)
        .where(and(eq(teams.id, resolvedTeamId), eq(teams.orgId, org.id)))
        .limit(1);
      resolvedTeamName = t?.name || null;
    }
    const resolvedTitle = trimmedTitle || defaultMeetingTitle(body.data.meetingType, resolvedTeamName);

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
      title: resolvedTitle,
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
    // allowLocked: starting IS the act of opening a future meeting early.
    if (!(await checkMeetingEdit(request, reply, org.id, id, { allowLocked: true }))) return;

    // Snapshots are team-scoped to this meeting's team.
    const [_startMeeting] = await db.select({ teamId: meetings.teamId }).from(meetings)
      .where(and(eq(meetings.id, id), eq(meetings.organizationId, org.id))).limit(1);
    if (!_startMeeting) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Meeting not found' } });
    const [scorecardSnapshot, rocksSnapshot] = await Promise.all([
      buildScorecardSnapshot(org.id, _startMeeting.teamId),
      buildRocksSnapshot(org.id, _startMeeting.teamId),
    ]);

    const _startedAt = new Date();
    const [updated] = await db.update(meetings)
      .set({
        status: 'in_progress',
        startedAt: _startedAt,
        // Arm the 1-hour auto-end safety net. "Extend" pushes this out.
        autoEndAt: computeAutoEndAt(_startedAt),
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
    {
      const actor = getAuth(request).userId;
      await emitOrgEventSafe({
        orgId: org.id, topic: 'meeting', entityType: 'meeting', entityId: id, action: 'started',
        teamId: updated.teamId, actorType: actor ? 'user' : 'agent', actorId: actor || 'api_key',
      });
    }
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
      buildScorecardSnapshot(org.id, meeting.teamId),
      buildRocksSnapshot(org.id, meeting.teamId),
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
    {
      const actor = getAuth(request).userId;
      await emitOrgEventSafe({
        orgId: org.id, topic: 'meeting', entityType: 'meeting', entityId: id, action: 'scorecard_refreshed',
        teamId: updated.teamId, actorType: actor ? 'user' : 'agent', actorId: actor || 'api_key',
      });
    }
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

    // Ending is centralized in endMeetingCore (services/meeting-lifecycle.ts):
    // it re-snapshots the scorecard so the record keeps the FINAL reviewed KPI
    // values, stamps endedAt, rolls the next recurrence, and emits audit +
    // realtime events. The auto-end safety net calls the same path, so a
    // meeting ends identically whether a person or the net ends it.
    const result = await endMeetingCore(org.id, id, { reason: 'manual', actorId: getAuth(request).userId || null });
    if (!result) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Meeting not found' } });
    return { meeting: result.meeting, nextOccurrence: result.nextOccurrence };
  });

  // POST /api/v1/meetings/:id/extend  (push the 1-hour auto-end deadline out)
  app.post<{ Params: { id: string } }>('/meetings/:id/extend', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    if (!(await gateWriteScope(request, reply))) return;
    const org = await authedOrFail(request, reply);
    if (!org) return;
    if (!(await checkMeetingEdit(request, reply, org.id, id))) return;

    // Only an in-progress meeting has a live deadline to extend. Reset it to a
    // fresh full window from now so the meeting keeps running.
    const [updated] = await db.update(meetings)
      .set({ autoEndAt: computeAutoEndAt(new Date()), updatedAt: new Date() })
      .where(and(eq(meetings.id, id), eq(meetings.organizationId, org.id), eq(meetings.status, 'in_progress')))
      .returning();
    if (!updated) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'No in-progress meeting to extend' } });
    return { meeting: updated, autoEndAt: updated.autoEndAt };
  });

  // POST /api/v1/meetings/:id/timer  (shared meeting stopwatch)
  // Whoever starts/pauses or changes section drives the clock for the whole
  // room: this caches the state in the meeting bus and broadcasts a kind:'timer'
  // event to every connected attendee. Ephemeral (in-memory), member-gated.
  app.post<{ Params: { id: string } }>('/meetings/:id/timer', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    if (!(await gateWriteScope(request, reply))) return;
    const org = await authedOrFail(request, reply);
    if (!org) return;
    if (!(await checkMeetingEdit(request, reply, org.id, id))) return;

    const b = (request.body || {}) as Record<string, unknown>;
    const rawTimes = (b.sectionTimes && typeof b.sectionTimes === 'object') ? b.sectionTimes as Record<string, unknown> : {};
    const sectionTimes: Record<string, number> = {};
    let n = 0;
    for (const k in rawTimes) {
      if (n++ > 50) break; // bound: a meeting has a handful of sections
      const v = Number(rawTimes[k]);
      if (Number.isFinite(v)) sectionTimes[String(k)] = Math.max(0, Math.floor(v));
    }
    setMeetingTimer(id, {
      running: !!b.running,
      sectionIdx: Number.isFinite(Number(b.sectionIdx)) ? Math.max(0, Math.floor(Number(b.sectionIdx))) : 0,
      elapsed: Number.isFinite(Number(b.elapsed)) ? Math.max(0, Math.floor(Number(b.elapsed))) : 0,
      sectionTimes,
    });
    return { ok: true };
  });

  // DELETE /api/v1/meetings/:id  (soft-delete -- any status is deletable)
  app.delete<{ Params: { id: string } }>('/meetings/:id', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    if (!(await gateWriteScope(request, reply))) return;
    const org = await authedOrFail(request, reply);
    if (!org) return;
    if (!(await checkMeetingEdit(request, reply, org.id, id))) return;

    const [target] = await db.select({
      id: meetings.id,
      scheduledAt: meetings.scheduledAt,
      recurrenceRule: meetings.recurrenceRule,
      recurrenceParentId: meetings.recurrenceParentId,
    }).from(meetings)
      .where(and(eq(meetings.id, id), eq(meetings.organizationId, org.id), isNull(meetings.deletedAt)))
      .limit(1);
    if (!target) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Meeting not found' } });

    const _isRecurring = !!(target.recurrenceRule || target.recurrenceParentId);
    const _scopeRaw = (request.body as any)?.scope;
    // Non-recurring meetings (or an unspecified scope) always delete just the
    // one row -- unchanged behavior. Scope only matters for a series.
    const scope = _isRecurring && isDeleteScope(_scopeRaw) ? _scopeRaw : 'occurrence';

    if (!_isRecurring || scope === 'occurrence') {
      await db.update(meetings)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(and(eq(meetings.id, id), eq(meetings.organizationId, org.id), isNull(meetings.deletedAt)));
      await db.insert(auditLogs).values(createAuditEntry('meeting.deleted', 'meeting', {
        orgId: org.id, entityId: id, details: { scope: 'occurrence', recurring: _isRecurring },
      }));
      return { deleted: true, scope: 'occurrence', count: 1 };
    }

    // Series-aware delete. Load every live row in the series (anchor + its
    // occurrences), decide what to delete and which survivors must lose their
    // recurrence rule (so ensureUpcomingForOrg won't resurrect the series),
    // then apply both in one pass.
    const anchor = target.recurrenceParentId || target.id;
    const seriesRows = await db.select({ id: meetings.id, scheduledAt: meetings.scheduledAt })
      .from(meetings)
      .where(and(
        eq(meetings.organizationId, org.id),
        isNull(meetings.deletedAt),
        sql`(${meetings.id} = ${anchor} OR ${meetings.recurrenceParentId} = ${anchor})`,
      ));
    const plan = planSeriesDeletion(seriesRows, id, scope);

    if (plan.deleteIds.length) {
      await db.update(meetings)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(and(eq(meetings.organizationId, org.id), inArray(meetings.id, plan.deleteIds), isNull(meetings.deletedAt)));
    }
    if (plan.clearRuleIds.length) {
      await db.update(meetings)
        .set({ recurrenceRule: null, updatedAt: new Date() })
        .where(and(eq(meetings.organizationId, org.id), inArray(meetings.id, plan.clearRuleIds)));
    }

    await db.insert(auditLogs).values(createAuditEntry('meeting.deleted', 'meeting', {
      orgId: org.id, entityId: id,
      details: { scope, deletedCount: plan.deleteIds.length, ruleClearedCount: plan.clearRuleIds.length },
    }));

    return { deleted: true, scope, count: plan.deleteIds.length };
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
    if (d.segmentNotes !== undefined) {
      const [current] = await db.select({ segmentNotes: meetings.segmentNotes })
        .from(meetings)
        .where(and(eq(meetings.id, id), eq(meetings.organizationId, org.id)))
        .limit(1);
      if (!current) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Meeting not found' } });
      const existing = (current.segmentNotes as Record<string, Record<string, string>>) ?? {};
      const merged: Record<string, Record<string, string>> = { ...existing };
      for (const [key, fields] of Object.entries(d.segmentNotes)) {
        if (fields !== undefined) {
          merged[key] = { ...(existing[key] ?? {}), ...fields };
        }
      }
      updates.segmentNotes = merged;
    }

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
    {
      const actor = getAuth(request).userId;
      await emitOrgEventSafe({
        orgId: org.id, topic: 'meeting', entityType: 'meeting', entityId: id, action: 'updated',
        teamId: updated.teamId, actorType: actor ? 'user' : 'agent', actorId: actor || 'api_key',
        payload: { fields: Object.keys(updates) },
      });
    }

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
      meeting.scorecardSnapshot ? Promise.resolve(meeting.scorecardSnapshot) : buildScorecardSnapshot(org.id, meeting.teamId),
      meeting.rocksSnapshot ? Promise.resolve(meeting.rocksSnapshot) : buildRocksSnapshot(org.id, meeting.teamId),
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
      // The creator can always access a meeting they made (mirrors the
      // /l8/meeting/:id page gate) so a brand-new owner isn't 404'd from
      // their own meeting's live stream before the page self-heals attendees.
      const _creatorUserId = getAuth(request).userId;
      const isCreator = !!_creatorUserId && meeting.createdBy === _creatorUserId;
      const allowed = onTeam || isAttendee(fullMember, meeting) || isCreator;
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
