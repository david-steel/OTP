// Integration regression test for the "ratings lost on End meeting" bug
// (confirmed 2026-06-08: a completed L10 had ratings={} despite the user
// entering and "saving" them). Root cause: ratings only persisted via the
// separate "Save ratings" PUT; POST /meetings/:id/end ignored the request body,
// so ending a meeting never captured what was in the rating inputs.
//
// Fix: /end now reads an optional { ratings } body and folds it into the same
// update that sets status=completed -- but only when non-empty, so ending can
// never CLEAR already-saved ratings. These tests exercise the REAL meetingRoutes
// handlers against a real (pglite) Postgres via the API-key auth path.
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import Fastify, { type FastifyInstance } from 'fastify';
import { createHash } from 'node:crypto';
import { eq } from 'drizzle-orm';

// Force the API-key auth path (no Clerk session) -- this is the path
// checkMeetingEdit short-circuits as allowed (meetings.ts:102), so we can drive
// the handlers with a write-scoped key like the rest of the API tests.
vi.mock('@clerk/fastify', () => ({ getAuth: () => ({ userId: null }) }));

const sha = (k: string) => createHash('sha256').update(k).digest('hex');
const KEY = 'otp_' + 'e'.repeat(60);
const bearer = (k: string) => ({ authorization: 'Bearer ' + k, 'content-type': 'application/json' });

let stopDb: (() => Promise<void>) | undefined;
let app: FastifyInstance;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let db: any, schema: any, pool: any;
let orgId: string;

async function makeMeeting(ratings: Record<string, number> = {}): Promise<string> {
  const [m] = await db.insert(schema.meetings)
    .values({
      organizationId: orgId,
      title: 'Dan L10',
      meetingType: 'leadership',
      status: 'in_progress',
      scheduledAt: new Date('2026-06-08T12:00:00.000Z'),
      attendees: [
        { externalId: 'AGT_DAN', entityType: 'human', name: 'Dan' },
        { externalId: 'HUM_DAVIDSTEEL', entityType: 'human', name: 'David Steel' },
      ],
      ratings,
      createdBy: 'test',
    })
    .returning();
  return m.id;
}

async function endMeeting(id: string, body: unknown) {
  return app.inject({
    method: 'POST',
    url: '/api/v1/meetings/' + id + '/end',
    headers: bearer(KEY),
    payload: JSON.stringify(body),
  });
}

async function readRow(id: string) {
  const [row] = await db.select({ status: schema.meetings.status, ratings: schema.meetings.ratings })
    .from(schema.meetings).where(eq(schema.meetings.id, id)).limit(1);
  return row;
}

beforeAll(async () => {
  const { startTestDb } = await import('../../test/pg-harness.js');
  const tdb = await startTestDb();
  stopDb = tdb.stop;
  process.env.DATABASE_URL = tdb.url;
  process.env.NODE_ENV = 'test';
  process.env.DB_POOL_MAX = '1';

  ({ db, pool } = await import('../../config/database.js'));
  schema = await import('../../db/schema.js');
  const meetingRoutes = (await import('./meetings.js')).default;

  app = Fastify();
  app.decorateRequest('orgMember', null);
  await app.register(meetingRoutes, { prefix: '/api/v1' });
  await app.ready();

  const [o] = await db.insert(schema.organizations)
    .values({ name: 'Org E', industry: 'x', size: 'small', clerkOrgId: 'clerk_e_' + process.pid })
    .returning();
  orgId = o.id;
  await db.insert(schema.apiKeys)
    .values({ orgId, keyPrefix: KEY.slice(0, 8), keyHash: sha(KEY), scopes: ['read', 'write'] });
}, 120_000);

afterAll(async () => {
  // Close the fastify app + pg pool BEFORE stopping pglite, else idle clients
  // emit an unhandled "Connection terminated unexpectedly" on teardown.
  await app?.close().catch(() => {});
  await pool?.end().catch(() => {});
  await stopDb?.();
});

describe('POST /meetings/:id/end -- ratings flush', () => {
  it('persists ratings sent with the end request (the bug: they were dropped)', async () => {
    const id = await makeMeeting();
    const res = await endMeeting(id, { ratings: { AGT_DAN: 8, HUM_DAVIDSTEEL: 9 } });
    expect(res.statusCode).toBe(200);
    const row = await readRow(id);
    expect(row.status).toBe('completed');
    expect(row.ratings).toEqual({ AGT_DAN: 8, HUM_DAVIDSTEEL: 9 });
  });

  it('does NOT clear already-saved ratings when ended with an empty body', async () => {
    const id = await makeMeeting({ HUM_DAVIDSTEEL: 7 });
    const res = await endMeeting(id, {});
    expect(res.statusCode).toBe(200);
    const row = await readRow(id);
    expect(row.status).toBe('completed');
    expect(row.ratings).toEqual({ HUM_DAVIDSTEEL: 7 });
  });

  it('ignores out-of-range ratings rather than blocking the end or clobbering', async () => {
    const id = await makeMeeting({ HUM_DAVIDSTEEL: 6 });
    const res = await endMeeting(id, { ratings: { AGT_DAN: 99 } });
    expect(res.statusCode).toBe(200);
    const row = await readRow(id);
    expect(row.status).toBe('completed');
    expect(row.ratings).toEqual({ HUM_DAVIDSTEEL: 6 });
  });
});
