// Shared meeting view-data resolver (meeting-runner convergence, Inc 2a).
//
// Extracted VERBATIM from the /l8/meeting handler (pages.ts) so the built-in
// runner and the gated custom runner resolve identical, tenant-scoped section
// data from ONE implementation -- no divergent reimplementation that could
// leak one team's KPIs/rocks/issues/todos into another team's meeting. Every
// query filters by meeting.teamId; the scorecard snapshot semantics (incl. the
// 2026-06-04 team-filter fix) are preserved exactly.
//
// Pure data resolution only: the access gate and lazy attendee self-heal stay
// in each route. Returns the locals bundle both runners pass to their views.
import type { FastifyRequest } from 'fastify';
import { eq, and, desc, asc, sql, inArray, or, isNull, isNotNull } from 'drizzle-orm';
import { db } from '../config/database.js';
import { kpis, kpiValues, rocks, tickets, todos, teamMemberships, orgMembers, teams, meetingHeadlines, oosOperatingPlans, oosOperatingPlanSections, oosExecutionItems, rockMilestones } from '../db/schema.js';
import { useScorecardSnapshot, belongsToMeetingTeam } from './meeting-snapshot.js';

export async function resolveMeetingViewData(request: FastifyRequest, org: any, meeting: any) {
    const orgKpis = await db.select().from(kpis)
      .where(and(
        eq(kpis.organizationId, org.id),
        meeting.teamId ? eq(kpis.teamId, meeting.teamId) : isNull(kpis.teamId),
        isNull(kpis.deletedAt),
        isNull(kpis.archivedAt),
      ));
    const latestValues: Record<string, any> = {};
    const previousValues: Record<string, any> = {};
    for (const k of orgKpis) {
      const recentRows = await db.select().from(kpiValues)
        .where(eq(kpiValues.kpiId, k.id))
        .orderBy(desc(kpiValues.periodStart))
        .limit(2);
      const latest = recentRows[0];
      const previous = recentRows[1];
      if (latest) latestValues[k.id] = { value: latest.value, periodStart: latest.periodStart, periodEnd: latest.periodEnd };
      if (previous) previousValues[k.id] = { value: previous.value, periodStart: previous.periodStart, periodEnd: previous.periodEnd };
    }
    // Snapshot lifecycle: a meeting can carry frozen scorecard/rocks JSON
    // from a previous /start. EOS wants the discussion anchored to what
    // was true at meeting start, so we honor the snapshot during
    // in_progress and completed states. But for a SCHEDULED meeting,
    // edits should flow through live -- David flagged 2026-05-25 that
    // updating a rock or KPI before the meeting didn't refresh.
    const _useSnapshot = useScorecardSnapshot(meeting.status);
    let scorecard: any;
    if (_useSnapshot && meeting.scorecardSnapshot && (meeting.scorecardSnapshot as any).kpis) {
      // Snapshots were historically captured org-wide, so an older one can
      // carry other teams' KPIs. The scorecard is team-scoped, so filter the
      // snapshot to this meeting's team -- fixes the 2026-06-04 leak where the
      // AI Army KPI "OTP -- Real signups" surfaced on the Leadership Meeting.
      const _snap = meeting.scorecardSnapshot as any;
      const _kpisScoped = (_snap.kpis || []).filter((k: any) => belongsToMeetingTeam(k.teamId, meeting.teamId));
      scorecard = { ..._snap, kpis: _kpisScoped, kpiCount: _kpisScoped.length };
    } else {
      scorecard = { kpis: orgKpis, latestValues, previousValues, kpiCount: orgKpis.length };
    }

    // Quarterly Priorities hides completed + archived rocks by default; ?rocks=all
    // reveals them (rendered at the bottom with a Reopen button).
    const _showHiddenRocks = (request.query as any)?.rocks === 'all';
    const _rockConds = [
      eq(rocks.organizationId, org.id),
      meeting.teamId ? eq(rocks.teamId, meeting.teamId) : isNull(rocks.teamId),
      isNull(rocks.deletedAt),
    ];
    if (!_showHiddenRocks) {
      _rockConds.push(isNull(rocks.completedAt), isNull(rocks.archivedAt));
    }
    const orgRocks = await db.select().from(rocks)
      .where(and(..._rockConds))
      .orderBy(sql`${rocks.position} asc nulls last`, asc(rocks.dueDate));
    // Count of human-owned completed-or-archived rocks for the toggle label
    // (mirrors the EJS agent-rock filter so the count matches what renders).
    const _hiddenRows = await db.select({ oet: rocks.ownerEntityType, oeid: rocks.ownerExternalId }).from(rocks)
      .where(and(
        eq(rocks.organizationId, org.id),
        meeting.teamId ? eq(rocks.teamId, meeting.teamId) : isNull(rocks.teamId),
        isNull(rocks.deletedAt),
        or(isNotNull(rocks.completedAt), isNotNull(rocks.archivedAt)),
      ));
    const hiddenRocksCount = _hiddenRows.filter(
      (r) => r.oet !== 'agent' && !(typeof r.oeid === 'string' && r.oeid.startsWith('AGT_')),
    ).length;
    // Rocks ALWAYS render live (current state), for scheduled / in_progress /
    // completed alike. Unlike the scorecard (which freezes a weekly KPI reading
    // as-of meeting start), rocks are current-state objects edited DURING the
    // meeting (the Quarterly Priorities). Snapshotting them caused the 2026-06-04 bugs:
    // live edits looked unsaved, and the org-wide snapshot leaked other teams'
    // rocks. The /start rocksSnapshot is retained ONLY as the baseline for the
    // "changed this meeting" diff below, never as a render source.
    let rocksData: any = { rocks: orgRocks, count: orgRocks.length };

    // "Changed this meeting" provenance. During a LIVE meeting, diff each rock
    // against the /start baseline snapshot so a status change reads as
    // decided-in-this-meeting, not a silent overwrite (David, 2026-06-04).
    // rockChanges[id] = the transition; rockBaseline[id] = on-track-at-start so
    // the client On/Off toggle can recompute the label without a reload.
    const rockChanges: Record<string, { kind: 'flip' | 'completed' | 'archived'; from?: boolean; to?: boolean }> = {};
    const rockBaseline: Record<string, boolean> = {};
    if (meeting.status === 'in_progress' && meeting.rocksSnapshot && (meeting.rocksSnapshot as any).rocks) {
      const _baseline = new Map<string, any>();
      for (const br of (meeting.rocksSnapshot as any).rocks as any[]) {
        if (belongsToMeetingTeam(br.teamId, meeting.teamId)) {
          _baseline.set(br.id, br);
          rockBaseline[br.id] = !!br.onTrack;
        }
      }
      // Rocks active at start but completed/archived DURING this meeting have
      // left the live active list -- pull them back so they stay visible with
      // a "Completed/Archived this meeting" note instead of silently vanishing.
      const _baseIds = [..._baseline.keys()];
      if (_baseIds.length) {
        const _leftActive = await db.select().from(rocks).where(and(
          eq(rocks.organizationId, org.id),
          inArray(rocks.id, _baseIds),
          isNull(rocks.deletedAt),
          or(isNotNull(rocks.completedAt), isNotNull(rocks.archivedAt)),
        ));
        const _byId = new Map<string, any>((rocksData.rocks as any[]).map((r: any) => [r.id, r]));
        for (const r of _leftActive) if (!_byId.has(r.id)) _byId.set(r.id, r);
        const _merged = [..._byId.values()];
        rocksData = { rocks: _merged, count: _merged.length };
      }
      for (const r of rocksData.rocks as any[]) {
        const b = _baseline.get(r.id);
        if (!b) continue; // added this meeting -- status-change provenance only
        if (r.completedAt) rockChanges[r.id] = { kind: 'completed' };
        else if (r.archivedAt) rockChanges[r.id] = { kind: 'archived' };
        else if (!!b.onTrack !== !!r.onTrack) rockChanges[r.id] = { kind: 'flip', from: !!b.onTrack, to: !!r.onTrack };
      }
    }

    // Team-scoped issues. Strict match on meeting.team_id so a Leadership
    // Leadership Meeting never sees issues that another team (e.g. "David x Dan") owns.
    // Tickets with team_id IS NULL are hidden -- post-backfill they should
    // be impossible, but if one slips through it can be assigned via the
    // issue card's team selector.
    const orgIssues = await db.select().from(tickets)
      .where(and(
        eq(tickets.orgId, org.id),
        meeting.teamId ? eq(tickets.teamId, meeting.teamId) : isNull(tickets.teamId),
        isNull(tickets.deletedAt),
      ))
      .orderBy(desc(tickets.createdAt))
      .limit(100);

    // Full team roster for this meeting's team -- the set of members on
    // meeting.team_id. Empty when the meeting has a NULL team_id.
    let teamMembers: any[] = [];
    if (meeting.teamId) {
      teamMembers = await db.select({
        memberId: orgMembers.id,
        name: orgMembers.displayName,
        email: orgMembers.email,
        role: orgMembers.role,
      })
        .from(teamMemberships)
        .innerJoin(orgMembers, eq(teamMemberships.memberId, orgMembers.id))
        .where(eq(teamMemberships.teamId, meeting.teamId));
    }

    // Leadership Meeting todos only -- filter by kind='l10' AND the meeting's team so
    // personal todos from /me/todos can never leak into a leadership Leadership Meeting.
    // Recurrence templates hidden by default; only instances appear.
    // OPEN ONLY: EOS Leadership Meeting convention is that completed to-dos drop off
    // and only carry-forward open ones surface. David flagged 2026-05-25
    // that done items lingered with strikethrough -- killed.
    const orgTodos = await db.select().from(todos)
      .where(and(
        eq(todos.organizationId, org.id),
        eq(todos.kind, 'l10'),
        meeting.teamId ? eq(todos.teamId, meeting.teamId) : isNull(todos.teamId),
        isNull(todos.deletedAt),
        isNull(todos.doneAt),
        isNull(todos.recurrenceRule),
      ))
      .orderBy(desc(todos.createdAt))
      .limit(100);

    // Build the full roster for owner dropdowns. The template was previously
    // restricting owner selection to meeting.attendees, which excluded the
    // meeting creator (David ran the Leadership Meeting but never added himself as an
    // attendee) and made it impossible to assign to-dos to people outside
    // the room (delegating to a Crystal/Pulse/etc. that isn't there).
    //
    // availableOwners = every human + every agent in the org's primary
    // chart, with isAttendee flag for the UI to badge the in-room subset.
    const { getOrgTeamGraph } = await import('./team-graph.js');
    const teamGraph = await getOrgTeamGraph(org.id, org.name);
    // Build attendee keys from every shape an attendee row can take. The
    // auto-populate uses { type:'human', memberId, externalIds:[...] } while
    // the editor uses { entityType, externalId }. Match against all of them
    // so chart nodes light up as "in room" whether they were claimed via a
    // chart tile, added by memberId, or added directly by externalId.
    const attendeeKeys = new Set<string>();
    for (const _a of ((meeting.attendees || []) as Array<Record<string, unknown>>)) {
      if (!_a) continue;
      const _t = (typeof _a.entityType === 'string' && _a.entityType)
        || (typeof _a.type === 'string' && _a.type)
        || '';
      if (!_t) continue;
      if (typeof _a.externalId === 'string' && _a.externalId) {
        attendeeKeys.add(`${_t}:${_a.externalId}`);
      }
      const _xids = (_a as any).externalIds;
      if (Array.isArray(_xids)) {
        for (const _x of _xids) {
          if (typeof _x === 'string' && _x) attendeeKeys.add(`${_t}:${_x}`);
        }
      }
      if (typeof (_a as any).memberId === 'string' && (_a as any).memberId) {
        attendeeKeys.add(`${_t}:${(_a as any).memberId}`);
      }
    }
    const availableOwners = teamGraph.nodes
      .filter((n) => n.type === 'agent' || n.type === 'human')
      .map((n) => ({
        entityType: n.type,
        externalId: n.externalId,
        name: n.label,
        isAttendee: attendeeKeys.has(`${n.type}:${n.externalId}`),
      }))
      .sort((a, b) => {
        // Humans first, then agents; in-room first within each group.
        if (a.entityType !== b.entityType) return a.entityType === 'human' ? -1 : 1;
        if (a.isAttendee !== b.isAttendee) return a.isAttendee ? -1 : 1;
        return a.name.localeCompare(b.name);
      });

    // Carry the dev orgId through so client-side fetches keep the same auth context locally.
    const devOrgIdParam = (request.query as any)?.orgId || (request.query as any)?.org || '';

    // Org teams for the issue "move to team" dropdown.
    const orgTeamsList = await db
      .select({ id: teams.id, name: teams.name, slug: teams.slug, isDefault: teams.isDefault })
      .from(teams)
      .where(eq(teams.orgId, org.id))
      .orderBy(desc(teams.isDefault), asc(teams.name));

    // Agent last-run data: for every agent attendee, surface its most recent
    // run so the UI can badge each agent with status + last-run time. The
    // agent_runs table is created via raw DDL (ensure-agent-runtime.ts) and
    // has no Drizzle table object, so this uses raw SQL. The whole block is
    // best-effort -- if agent_runs is missing or errors, agentRuns is {}.
    const agentRuns: Record<string, { status: string; lastRunAt: string | null }> = {};
    const agentExternalIds = Array.from(new Set(
      ((meeting.attendees || []) as Array<Record<string, unknown>>)
        .filter((a) => a && typeof a === 'object' && (a.entityType === 'agent' || a.type === 'agent'))
        .map((a) => (typeof a.externalId === 'string' ? a.externalId : ''))
        .filter((x): x is string => x.length > 0)
    ));
    if (agentExternalIds.length > 0) {
      try {
        for (const agentId of agentExternalIds) {
          const res = await db.execute(sql`
            SELECT DISTINCT ON (agent_external_id)
              agent_external_id, status, started_at, completed_at, created_at
            FROM agent_runs
            WHERE org_id = ${org.id} AND agent_external_id = ${agentId}
            ORDER BY agent_external_id, created_at DESC
          `);
          const row = (res as any).rows?.[0];
          if (row) {
            agentRuns[row.agent_external_id] = {
              status: row.status,
              lastRunAt: row.completed_at || row.started_at || row.created_at || null,
            };
          }
        }
      } catch {
        // agent_runs unavailable -- leave agentRuns empty.
      }
    }

    // Structured headline items so the page can render and flag them.
    // Headlines now carry a teamId: a team's headlines surface in that
    // team's meeting -- the team's unaddressed (unread) headlines plus any
    // already addressed in THIS meeting. Teamless meetings fall back to the
    // legacy meetingId scoping so they still work.
    const headlineItems = meeting.teamId
      ? await db.select().from(meetingHeadlines)
          .where(and(
            eq(meetingHeadlines.teamId, meeting.teamId),
            or(
              isNull(meetingHeadlines.readAt),
              eq(meetingHeadlines.meetingId, meeting.id),
            ),
          ))
          .orderBy(desc(meetingHeadlines.createdAt))
          .limit(100)
      : await db.select().from(meetingHeadlines)
          .where(eq(meetingHeadlines.meetingId, meeting.id))
          .orderBy(desc(meetingHeadlines.createdAt));

    // 90-day execution items for the org's active operating plan -- powers
    // the Rock -> plan picker. Graceful: if the plan model yields nothing,
    // default to an empty list rather than crashing the page.
    let executionItems: Array<{ id: string; label: string }> = [];
    let planDirection: { threeYear: string; threeYearYear: string; tenYear: string; annualObjective: string } | null = null;
    try {
      const [activePlan] = await db.select().from(oosOperatingPlans)
        .where(and(
          eq(oosOperatingPlans.organizationId, org.id),
          eq(oosOperatingPlans.status, 'active'),
        ))
        .orderBy(desc(oosOperatingPlans.createdAt))
        .limit(1);
      if (activePlan) {
        const items = await db.select().from(oosExecutionItems)
          .where(eq(oosExecutionItems.planId, activePlan.id))
          .orderBy(desc(oosExecutionItems.createdAt));
        executionItems = items.map((i) => ({ id: i.id, label: i.title }));
        // Plan direction -- frames the meeting with where the company is headed.
        const planSecRows = await db.select().from(oosOperatingPlanSections)
          .where(eq(oosOperatingPlanSections.planId, activePlan.id));
        const _secBy: Record<string, any> = {};
        for (const s of planSecRows) {
          _secBy[s.sectionKey] = (s.contentJson && typeof s.contentJson === 'object') ? s.contentJson : {};
        }
        const _dest = _secBy['destination'] || {};
        const _annual = _secBy['annual_game_plan'] || {};
        const _str = (v: unknown) => (v === null || v === undefined) ? '' : String(v).trim();
        planDirection = {
          threeYear: _str(_dest.year_target),
          threeYearYear: _str(_dest.year_target_year),
          tenYear: _str(_dest.ten_year_target),
          annualObjective: _str(_annual.primary_objective),
        };
      }
    } catch {
      executionItems = [];
    }

    // ---- Milestones for the rocks on this meeting (+ linked to-do
    // summaries), keyed by rock id. Server-side so the Quarterly Priorities paints
    // with milestones on first render; the in-meeting checkbox toggles via
    // /api/v1/milestones/:id/complete.
    const rockMilestonesMap: Record<string, any[]> = {};
    try {
      const _msRockIds = ((rocksData.rocks as any[]) || []).map((r: any) => r.id);
      if (_msRockIds.length > 0) {
        const _msRows = await db.select().from(rockMilestones)
          .where(and(eq(rockMilestones.organizationId, org.id), inArray(rockMilestones.rockId, _msRockIds)))
          .orderBy(asc(rockMilestones.sortOrder), asc(rockMilestones.createdAt));
        const _msIds = _msRows.map((m) => m.id);
        const _msTodosBy: Record<string, any[]> = {};
        if (_msIds.length > 0) {
          const _msTodos = await db.select({
            id: todos.id,
            title: todos.title,
            ownerName: todos.ownerName,
            ownerExternalId: todos.ownerExternalId,
            doneAt: todos.doneAt,
            milestoneId: todos.milestoneId,
          }).from(todos)
            .where(and(
              eq(todos.organizationId, org.id),
              inArray(todos.milestoneId, _msIds),
              isNull(todos.deletedAt),
            ))
            .orderBy(asc(todos.createdAt));
          for (const t of _msTodos) {
            if (!t.milestoneId) continue;
            (_msTodosBy[t.milestoneId] ||= []).push(t);
          }
        }
        for (const m of _msRows) {
          (rockMilestonesMap[m.rockId] ||= []).push({ ...m, todos: _msTodosBy[m.id] || [] });
        }
      }
    } catch (err) {
      request.log.warn({ err }, 'rock milestones load failed -- rendering Quarterly Priorities without them');
    }

  return {
    scorecard, rocksData, rockMilestonesMap, rockChanges, rockBaseline,
    showHiddenRocks: _showHiddenRocks, hiddenRocksCount, orgIssues, orgTodos,
    headlineItems, executionItems, planDirection, teamMembers, availableOwners,
    orgTeamsList, agentRuns, devOrgIdParam,
  };
}
