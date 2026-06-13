// Integration tests for the org_events outbox writer (realtime sync R0) +
// replay/live-bus wiring (R1). Exercises the REAL emit functions against a real
// (pglite) Postgres: the flag gate, a happy-path insert, best-effort error
// swallowing, same-tx rollback atomicity, retention pruning, the getOrgEventsSince
// replay query (cursor/limit/overflow/topic-filter/tenancy), and the
// emit -> live-bus publish relay.
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { sql } from 'drizzle-orm';

let stopDb: (() => Promise<void>) | undefined;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let db: any, schema: any, pool: any;
let emitOrgEvent: typeof import('./org-events.js').emitOrgEvent;
let emitOrgEventSafe: typeof import('./org-events.js').emitOrgEventSafe;
let getOrgEventsSince: typeof import('./org-events.js').getOrgEventsSince;
let pruneOrgEvents: typeof import('./org-events-retention.js').pruneOrgEvents;
let subscribeToOrgEvents: typeof import('./event-bus.js').subscribeToOrgEvents;
let orgId: string;
let orgBId: string;

async function countEvents(): Promise<number> {
  const r = await db.execute(sql`SELECT count(*)::int AS c FROM org_events`);
  return (r.rows as { c: number }[])[0]?.c ?? 0;
}

beforeAll(async () => {
  const { startTestDb } = await import('../test/pg-harness.js');
  const tdb = await startTestDb();
  stopDb = tdb.stop;
  process.env.DATABASE_URL = tdb.url;
  process.env.NODE_ENV = 'test';
  process.env.DB_POOL_MAX = '1';

  ({ db, pool } = await import('../config/database.js'));
  schema = await import('../db/schema.js');
  ({ emitOrgEvent, emitOrgEventSafe, getOrgEventsSince } = await import('./org-events.js'));
  ({ pruneOrgEvents } = await import('./org-events-retention.js'));
  ({ subscribeToOrgEvents } = await import('./event-bus.js'));

  const [org] = await db.insert(schema.organizations)
    .values({ name: 'Events Org', industry: 'x', size: 'small', clerkOrgId: 'clerk_ev_' + process.pid })
    .returning();
  orgId = org.id;
  const [orgB] = await db.insert(schema.organizations)
    .values({ name: 'Events Org B', industry: 'x', size: 'small', clerkOrgId: 'clerk_evb_' + process.pid })
    .returning();
  orgBId = orgB.id;
}, 120_000);

afterAll(async () => {
  delete process.env.ORG_EVENTS_ENABLED;
  await pool?.end?.();
  await stopDb?.();
});

beforeEach(async () => {
  await db.execute(sql`DELETE FROM org_events`);
  process.env.ORG_EVENTS_ENABLED = 'true';
});

describe('emitOrgEvent gating', () => {
  it('is a no-op when ORG_EVENTS_ENABLED is not "true"', async () => {
    process.env.ORG_EVENTS_ENABLED = 'false';
    await emitOrgEvent(db, { orgId, topic: 'rock', entityType: 'rock', entityId: 'r1', action: 'created' });
    expect(await countEvents()).toBe(0);
  });
});

describe('emitOrgEvent insert', () => {
  it('persists a row with the normalized fields', async () => {
    await emitOrgEvent(db, {
      orgId, topic: 'kpi', entityType: 'kpi_value', entityId: 'k1', action: 'value_recorded',
      teamId: null, actorType: 'agent', actorId: 'Tally', payload: { value: 42 },
    });
    const r = await db.execute(sql`SELECT * FROM org_events ORDER BY id DESC LIMIT 1`);
    const row = (r.rows as Record<string, unknown>[])[0];
    expect(row).toMatchObject({
      org_id: orgId, topic: 'kpi', entity_type: 'kpi_value', entity_id: 'k1',
      action: 'value_recorded', actor_type: 'agent', actor_id: 'Tally',
    });
    expect(row.payload).toEqual({ value: 42 });
  });

  it('assigns strictly increasing ids (the replay cursor)', async () => {
    await emitOrgEvent(db, { orgId, topic: 'todo', entityType: 'todo', entityId: 't1', action: 'created' });
    await emitOrgEvent(db, { orgId, topic: 'todo', entityType: 'todo', entityId: 't2', action: 'created' });
    const r = await db.execute(sql`SELECT id FROM org_events ORDER BY id ASC`);
    const ids = (r.rows as { id: number }[]).map((x) => Number(x.id));
    expect(ids).toHaveLength(2);
    expect(ids[1]).toBeGreaterThan(ids[0]);
  });

  it('drops a malformed event (missing orgId) without inserting', async () => {
    await emitOrgEvent(db, { orgId: '', topic: 'rock', entityType: 'rock', action: 'created' });
    expect(await countEvents()).toBe(0);
  });
});

describe('emitOrgEventSafe', () => {
  it('swallows an insert error and never throws (mutation unaffected)', async () => {
    // Stub executor whose insert rejects -- proves the try/catch contract
    // without depending on a real constraint violation (pglite resets its
    // single socket on FK errors under parallel load, which is a harness
    // artifact, not the behaviour under test).
    // Matches the .insert().values().returning() chain so the rejected promise
    // is actually awaited (and caught), not orphaned.
    const throwingExecutor = {
      insert: () => ({ values: () => ({ returning: () => Promise.reject(new Error('boom')) }) }),
    };
    await expect(
      emitOrgEventSafe(
        { orgId, topic: 'rock', entityType: 'rock', entityId: 'r1', action: 'created' },
        throwingExecutor,
      ),
    ).resolves.toBeUndefined();
  });

  it('inserts on the happy path', async () => {
    await emitOrgEventSafe({ orgId, topic: 'issue', entityType: 'ticket', entityId: 'i1', action: 'created' });
    expect(await countEvents()).toBe(1);
  });
});

describe('same-transaction rollback', () => {
  it('does not persist the event when the surrounding tx rolls back', async () => {
    await expect(
      db.transaction(async (tx: typeof db) => {
        await emitOrgEvent(tx, { orgId, topic: 'claim', entityType: 'oos_file', entityId: 'o1', action: 'published' });
        // Force the whole tx (event included) to roll back.
        throw new Error('mutation failed after emit');
      }),
    ).rejects.toThrow('mutation failed after emit');
    expect(await countEvents()).toBe(0);
  });
});

describe('retention prune', () => {
  it('removes events older than the window and keeps recent ones', async () => {
    // One fresh, one 40 days old (override created_at on insert).
    await emitOrgEvent(db, { orgId, topic: 'rock', entityType: 'rock', entityId: 'fresh', action: 'created' });
    await db.execute(sql`
      INSERT INTO org_events (org_id, topic, entity_type, entity_id, action, created_at)
      VALUES (${orgId}, 'rock', 'rock', 'stale', 'created', now() - interval '40 days')
    `);
    expect(await countEvents()).toBe(2);

    const removed = await pruneOrgEvents(30);
    expect(removed).toBe(1);
    const r = await db.execute(sql`SELECT entity_id FROM org_events`);
    const remaining = (r.rows as { entity_id: string }[]).map((x) => x.entity_id);
    expect(remaining).toEqual(['fresh']);
  });
});

// ---- R1: live-bus relay + replay ----

describe('emitOrgEvent return value', () => {
  it('returns the inserted envelope (id + ISO at) for the caller to publish', async () => {
    const env = await emitOrgEvent(db, {
      orgId, topic: 'rock', entityType: 'rock', entityId: 'r9', action: 'created', teamId: null,
    });
    expect(env).not.toBeNull();
    expect(typeof env!.id).toBe('number');
    expect(env!.orgId).toBe(orgId);
    expect(env!.topic).toBe('rock');
    expect(env!.at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('returns null when the flag is off (no publish)', async () => {
    process.env.ORG_EVENTS_ENABLED = 'false';
    const env = await emitOrgEvent(db, { orgId, topic: 'rock', entityType: 'rock', entityId: 'x', action: 'created' });
    expect(env).toBeNull();
  });
});

describe('emitOrgEventSafe -> live bus', () => {
  it('publishes the committed event to a matching org subscriber', async () => {
    const got: { id: number; topic: string }[] = [];
    const sub = subscribeToOrgEvents({ orgId, topics: null, send: (e) => got.push({ id: e.id, topic: e.topic }) });
    try {
      await emitOrgEventSafe({ orgId, topic: 'kpi', entityType: 'kpi_value', entityId: 'k1', action: 'value_recorded' });
      expect(got).toHaveLength(1);
      expect(got[0].topic).toBe('kpi');
    } finally {
      sub.unsubscribe();
    }
  });

  it('does NOT publish to a different org subscriber (tenancy)', async () => {
    const a: number[] = [];
    const b: number[] = [];
    const subA = subscribeToOrgEvents({ orgId, topics: null, send: (e) => a.push(e.id) });
    const subB = subscribeToOrgEvents({ orgId: orgBId, topics: null, send: (e) => b.push(e.id) });
    try {
      await emitOrgEventSafe({ orgId, topic: 'rock', entityType: 'rock', entityId: 'r1', action: 'created' });
      expect(a).toHaveLength(1);
      expect(b).toHaveLength(0);
    } finally {
      subA.unsubscribe();
      subB.unsubscribe();
    }
  });
});

describe('getOrgEventsSince (replay)', () => {
  it('returns this org\'s events after the cursor, in id order', async () => {
    const e1 = await emitOrgEvent(db, { orgId, topic: 'rock', entityType: 'rock', entityId: 'a', action: 'created' });
    const e2 = await emitOrgEvent(db, { orgId, topic: 'todo', entityType: 'todo', entityId: 'b', action: 'created' });
    const e3 = await emitOrgEvent(db, { orgId, topic: 'kpi', entityType: 'kpi', entityId: 'c', action: 'created' });

    const all = await getOrgEventsSince(orgId, 0, 100);
    expect(all.overflow).toBe(false);
    expect(all.events.map((e) => e.id)).toEqual([e1!.id, e2!.id, e3!.id]);

    const sinceE1 = await getOrgEventsSince(orgId, e1!.id, 100);
    expect(sinceE1.events.map((e) => e.entityId)).toEqual(['b', 'c']);
  });

  it('does not leak another org\'s events (tenancy)', async () => {
    await emitOrgEvent(db, { orgId, topic: 'rock', entityType: 'rock', entityId: 'mine', action: 'created' });
    await emitOrgEvent(db, { orgId: orgBId, topic: 'rock', entityType: 'rock', entityId: 'theirs', action: 'created' });
    const mine = await getOrgEventsSince(orgId, 0, 100);
    expect(mine.events.every((e) => e.orgId === orgId)).toBe(true);
    expect(mine.events.map((e) => e.entityId)).toEqual(['mine']);
  });

  it('filters by topic when provided', async () => {
    await emitOrgEvent(db, { orgId, topic: 'rock', entityType: 'rock', entityId: 'r', action: 'created' });
    await emitOrgEvent(db, { orgId, topic: 'kpi', entityType: 'kpi', entityId: 'k', action: 'created' });
    const onlyKpi = await getOrgEventsSince(orgId, 0, 100, new Set(['kpi']));
    expect(onlyKpi.events.map((e) => e.entityId)).toEqual(['k']);
  });

  it('signals overflow (and returns no events) when more than `limit` are pending', async () => {
    for (let i = 0; i < 5; i++) {
      await emitOrgEvent(db, { orgId, topic: 'rock', entityType: 'rock', entityId: 'n' + i, action: 'created' });
    }
    const over = await getOrgEventsSince(orgId, 0, 3);
    expect(over.overflow).toBe(true);
    expect(over.events).toHaveLength(0);
  });
});
