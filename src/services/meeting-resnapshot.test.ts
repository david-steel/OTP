// Integration tests for the auto scorecard re-snapshot (realtime sync R2.8).
// Real pglite Postgres. Uses org-level (teamId null) KPIs/meetings so no teams
// FK setup is needed; the team-scoped branch is the symmetric eq() of the same
// `teamId ? eq : isNull` condition exercised here.
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { eq, sql } from 'drizzle-orm';

let stopDb: (() => Promise<void>) | undefined;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let db: any, schema: any, pool: any;
let buildScorecardSnapshot: typeof import('./meeting-resnapshot.js').buildScorecardSnapshot;
let resnapshotInProgressMeetingsForTeam: typeof import('./meeting-resnapshot.js').resnapshotInProgressMeetingsForTeam;
let resnapshotMeetingsForKpi: typeof import('./meeting-resnapshot.js').resnapshotMeetingsForKpi;
let orgId: string;

beforeAll(async () => {
  const { startTestDb } = await import('../test/pg-harness.js');
  const tdb = await startTestDb();
  stopDb = tdb.stop;
  process.env.DATABASE_URL = tdb.url;
  process.env.NODE_ENV = 'test';
  process.env.DB_POOL_MAX = '1';

  ({ db, pool } = await import('../config/database.js'));
  schema = await import('../db/schema.js');
  ({ buildScorecardSnapshot, resnapshotInProgressMeetingsForTeam, resnapshotMeetingsForKpi } =
    await import('./meeting-resnapshot.js'));

  const [org] = await db.insert(schema.organizations)
    .values({ name: 'RS Org', industry: 'x', size: 'small', clerkOrgId: 'clerk_rs_' + process.pid })
    .returning();
  orgId = org.id;
}, 120_000);

afterAll(async () => {
  await pool?.end?.();
  await stopDb?.();
});

beforeEach(async () => {
  await db.execute(sql`DELETE FROM kpi_values`);
  await db.execute(sql`DELETE FROM kpis`);
  await db.execute(sql`DELETE FROM meetings`);
});

async function makeKpi(): Promise<{ id: string }> {
  const [kpi] = await db.insert(schema.kpis).values({
    organizationId: orgId, teamId: null,
    ownerEntityType: 'human', ownerExternalId: 'HMN-1', title: 'Sales', createdBy: 'test',
  }).returning();
  return kpi;
}
async function writeValue(kpiId: string, value: number, when: Date) {
  await db.insert(schema.kpiValues).values({ kpiId, periodStart: when, periodEnd: when, value, source: 'manual', enteredBy: 'test' });
}
async function makeMeeting(status: string, snapshot: unknown): Promise<{ id: string }> {
  const [m] = await db.insert(schema.meetings).values({
    organizationId: orgId, teamId: null, title: 'L10', status, scheduledAt: new Date(),
    scorecardSnapshot: snapshot ?? null, createdBy: 'test',
  }).returning();
  return m;
}
async function meetingSnapshot(id: string) {
  const [m] = await db.select().from(schema.meetings).where(eq(schema.meetings.id, id));
  return m.scorecardSnapshot;
}

describe('buildScorecardSnapshot', () => {
  it('captures the latest value per org-level KPI', async () => {
    const kpi = await makeKpi();
    await writeValue(kpi.id, 10, new Date(Date.now() - 1000));
    await writeValue(kpi.id, 42, new Date());
    const snap = await buildScorecardSnapshot(orgId, null);
    expect(snap.kpis.some((k: { id: string }) => k.id === kpi.id)).toBe(true);
    expect(snap.latestValues[kpi.id].value).toBe(42);
    expect(snap.previousValues[kpi.id].value).toBe(10);
  });
});

describe('resnapshotInProgressMeetingsForTeam', () => {
  it('re-snapshots an in-progress meeting so a newly written value appears', async () => {
    const kpi = await makeKpi();
    await writeValue(kpi.id, 10, new Date(Date.now() - 1000));
    // Meeting started with a stale snapshot (value 10 frozen).
    const stale = await buildScorecardSnapshot(orgId, null);
    const meeting = await makeMeeting('in_progress', stale);
    // Agent pushes a fresh value AFTER /start.
    await writeValue(kpi.id, 99, new Date());

    const n = await resnapshotInProgressMeetingsForTeam(orgId, null);
    expect(n).toBe(1);
    const snap = await meetingSnapshot(meeting.id);
    expect(snap.latestValues[kpi.id].value).toBe(99);
  });

  it('returns 0 and changes nothing when no meeting is in progress', async () => {
    const kpi = await makeKpi();
    await writeValue(kpi.id, 5, new Date());
    const scheduled = await makeMeeting('scheduled', null);
    const n = await resnapshotInProgressMeetingsForTeam(orgId, null);
    expect(n).toBe(0);
    expect(await meetingSnapshot(scheduled.id)).toBeNull();
  });
});

describe('resnapshotMeetingsForKpi', () => {
  it('resolves the KPI team and re-snapshots its in-progress meeting', async () => {
    const kpi = await makeKpi();
    await writeValue(kpi.id, 7, new Date());
    const meeting = await makeMeeting('in_progress', null);
    const n = await resnapshotMeetingsForKpi(orgId, kpi.id);
    expect(n).toBe(1);
    const snap = await meetingSnapshot(meeting.id);
    expect(snap.latestValues[kpi.id].value).toBe(7);
  });

  it('returns 0 for an unknown KPI', async () => {
    const n = await resnapshotMeetingsForKpi(orgId, '00000000-0000-0000-0000-000000000000');
    expect(n).toBe(0);
  });
});
