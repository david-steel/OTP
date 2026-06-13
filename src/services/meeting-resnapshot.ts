// Auto re-snapshot of in-progress meeting scorecards (realtime sync R2.8).
//
// An in-progress L8 meeting renders a FROZEN scorecard snapshot (captured at
// /start). KPI values written afterward -- by the in-meeting edit cell OR by an
// agent/Tally push through POST /kpis/:id/values -- don't appear until the
// snapshot is rebuilt. The in-meeting cell already calls /refresh-scorecard;
// this closes the gap for EVERY value write, so a number an agent pushes during
// a live L10 shows up on everyone's scorecard within ~1s (paired with the R2.5
// client-side scorecard live-swap, which fires on the kind:'kpi' meeting event
// published below).
//
// buildScorecardSnapshot lives here (moved out of routes/api/meetings.ts) so the
// meeting routes and this auto path share one definition -- the snapshot shape
// the L8 view renders must not drift between /start and the auto path.

import { and, desc, eq, isNull } from 'drizzle-orm';
import { db } from '../config/database.js';
import { kpis, kpiValues, meetings } from '../db/schema.js';
import { publishMeetingUpdate } from './meeting-bus.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRec = Record<string, any>;
export interface ScorecardSnapshot {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  kpis: any[];
  latestValues: AnyRec;
  previousValues: AnyRec;
  capturedAt: string;
  kpiCount: number;
}

/**
 * Build the team-scoped scorecard snapshot for a meeting. teamId null = an
 * org-level meeting, which owns only unteamed KPIs (a team meeting carries only
 * its own team's KPIs -- before 2026-06-04 this was org-wide and leaked KPIs
 * across L10s).
 */
export async function buildScorecardSnapshot(orgId: string, teamId: string | null): Promise<ScorecardSnapshot> {
  const orgKpis = await db.select().from(kpis).where(and(
    eq(kpis.organizationId, orgId),
    teamId ? eq(kpis.teamId, teamId) : isNull(kpis.teamId),
    isNull(kpis.deletedAt),
    isNull(kpis.archivedAt),
  ));
  const kpiIds = orgKpis.map(k => k.id);
  const latestValues: AnyRec = {};
  const previousValues: AnyRec = {};
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

/**
 * Re-snapshot the frozen scorecard of every IN-PROGRESS meeting for a team and
 * publish a kind:'kpi' meeting event so live viewers' scorecard re-renders with
 * the new value. teamId null targets org-level meetings (unteamed KPIs). Returns
 * the count re-snapshotted. Best-effort: never throws into the caller's write
 * path; a re-snapshot failure must not break a KPI value save. Cheap when idle
 * (one indexed query that returns nothing -> early exit).
 */
export async function resnapshotInProgressMeetingsForTeam(orgId: string, teamId: string | null): Promise<number> {
  try {
    const live = await db.select({ id: meetings.id, teamId: meetings.teamId })
      .from(meetings)
      .where(and(
        eq(meetings.organizationId, orgId),
        eq(meetings.status, 'in_progress'),
        teamId ? eq(meetings.teamId, teamId) : isNull(meetings.teamId),
        isNull(meetings.deletedAt),
      ));
    if (live.length === 0) return 0;
    for (const m of live) {
      const snapshot = await buildScorecardSnapshot(orgId, m.teamId);
      await db.update(meetings)
        .set({ scorecardSnapshot: snapshot, updatedAt: new Date() })
        .where(eq(meetings.id, m.id));
      // Targeted to the specific meeting (not publishToTeamMeetings) so an
      // org-level KPI never fans out to unrelated meetings.
      publishMeetingUpdate(m.id, { kind: 'kpi', action: 'autosnapshot' });
    }
    return live.length;
  } catch (err) {
    console.error('[meeting-resnapshot] failed (KPI write unaffected):', (err as Error)?.message);
    return 0;
  }
}

/** Resolve a KPI's team, then re-snapshot that team's in-progress meetings. */
export async function resnapshotMeetingsForKpi(orgId: string, kpiId: string): Promise<number> {
  try {
    const [kpi] = await db.select({ teamId: kpis.teamId }).from(kpis)
      .where(and(eq(kpis.id, kpiId), eq(kpis.organizationId, orgId)))
      .limit(1);
    if (!kpi) return 0;
    return await resnapshotInProgressMeetingsForTeam(orgId, kpi.teamId);
  } catch (err) {
    console.error('[meeting-resnapshot] kpi lookup failed:', (err as Error)?.message);
    return 0;
  }
}
