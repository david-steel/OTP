// Integration tests for the org_events outbox writer (realtime sync R0).
// Exercises the REAL emit functions against a real (pglite) Postgres: the flag
// gate, a happy-path insert, best-effort error swallowing, same-tx rollback
// atomicity, and retention pruning.
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { sql } from 'drizzle-orm';

let stopDb: (() => Promise<void>) | undefined;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let db: any, schema: any, pool: any;
let emitOrgEvent: typeof import('./org-events.js').emitOrgEvent;
let emitOrgEventSafe: typeof import('./org-events.js').emitOrgEventSafe;
let pruneOrgEvents: typeof import('./org-events-retention.js').pruneOrgEvents;
let orgId: string;

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
  ({ emitOrgEvent, emitOrgEventSafe } = await import('./org-events.js'));
  ({ pruneOrgEvents } = await import('./org-events-retention.js'));

  const [org] = await db.insert(schema.organizations)
    .values({ name: 'Events Org', industry: 'x', size: 'small', clerkOrgId: 'clerk_ev_' + process.pid })
    .returning();
  orgId = org.id;
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
    const throwingExecutor = {
      insert: () => ({ values: () => Promise.reject(new Error('boom')) }),
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
