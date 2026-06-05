// Integration regression test for the cross-tenant ticket IDOR fixed in
// commit 7d32930. Exercises the REAL ticketRoutes handlers against a real
// (pglite) Postgres with real API-key auth, asserting org isolation.
//
// Before the fix: PUT /tickets/:id filtered only on ticket id, so any
// authenticated org could rewrite another tenant's ticket; GET /:id leaked the
// full record (agentNotes, reporterEmail) cross-tenant. These tests would have
// caught both.
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import Fastify, { type FastifyInstance } from 'fastify';
import { createHash } from 'node:crypto';
import { eq } from 'drizzle-orm';

// Force the API-key auth path: with no Clerk plugin registered, getAuth() would
// throw. Mock it to "no Clerk session" so getAuthOrg() falls through to the API
// key, which is how we authenticate the two tenants below.
vi.mock('@clerk/fastify', () => ({ getAuth: () => ({ userId: null }) }));

const sha = (k: string) => createHash('sha256').update(k).digest('hex');
const KEY_A = 'otp_' + 'a'.repeat(60);
const KEY_B = 'otp_' + 'b'.repeat(60);
const bearer = (k: string) => ({ authorization: 'Bearer ' + k, 'content-type': 'application/json' });

let stopDb: (() => Promise<void>) | undefined;
let app: FastifyInstance;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let db: any, schema: any, pool: any;
let ticketB: string;

beforeAll(async () => {
  const { startTestDb } = await import('../../test/pg-harness.js');
  const tdb = await startTestDb();
  stopDb = tdb.stop;
  // config/database.ts reads DATABASE_URL at import time -- set it FIRST, then
  // import any app module that touches the DB.
  process.env.DATABASE_URL = tdb.url;
  process.env.NODE_ENV = 'test';
  process.env.DB_POOL_MAX = '1'; // pglite socket serves one connection at a time

  ({ db, pool } = await import('../../config/database.js'));
  schema = await import('../../db/schema.js');
  const ticketRoutes = (await import('./tickets.js')).default;

  app = Fastify();
  // The handlers read (request as any).isSuperAdmin (set by a global preHandler
  // in server.ts). Mirror it; default non-super-admin (the IDOR-relevant case).
  app.decorateRequest('isSuperAdmin', false);
  app.addHook('preHandler', async (req) => {
    (req as unknown as { isSuperAdmin: boolean }).isSuperAdmin =
      req.headers['x-test-superadmin'] === '1';
  });
  await app.register(ticketRoutes, { prefix: '/api/v1' });
  await app.ready();

  // Two tenants, each with a write-scoped API key.
  const [a] = await db.insert(schema.organizations)
    .values({ name: 'Org A', industry: 'x', size: 'small', clerkOrgId: 'clerk_a_' + process.pid })
    .returning();
  const [b] = await db.insert(schema.organizations)
    .values({ name: 'Org B', industry: 'x', size: 'small', clerkOrgId: 'clerk_b_' + process.pid })
    .returning();
  await db.insert(schema.apiKeys).values({ orgId: a.id, keyPrefix: KEY_A.slice(0, 8), keyHash: sha(KEY_A), scopes: ['read', 'write'] });
  await db.insert(schema.apiKeys).values({ orgId: b.id, keyPrefix: KEY_B.slice(0, 8), keyHash: sha(KEY_B), scopes: ['read', 'write'] });

  // A private ticket owned by Org B.
  const [t] = await db.insert(schema.tickets)
    .values({ orgId: b.id, title: 'B secret', description: 'private', agentNotes: 'INTERNAL', reporterEmail: 'reporter@b.com' })
    .returning();
  ticketB = t.id;
}, 120_000);

afterAll(async () => {
  await app?.close();
  // Close the pg pool BEFORE stopping pglite, else idle clients emit an
  // uncaught "Connection terminated unexpectedly" when the socket dies.
  await pool?.end().catch(() => {});
  await stopDb?.();
});

describe('tickets cross-tenant authorization (IDOR regression)', () => {
  it('Org A CANNOT update Org B ticket: PUT returns 404 and the row is unchanged', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: `/api/v1/tickets/${ticketB}`,
      headers: bearer(KEY_A),
      payload: JSON.stringify({ status: 'closed', title: 'HACKED', agentNotes: 'pwned' }),
    });
    expect(res.statusCode).toBe(404);
    const [row] = await db.select().from(schema.tickets).where(eq(schema.tickets.id, ticketB));
    expect(row.title).toBe('B secret');
    expect(row.status).toBe('open');
    expect(row.agentNotes).toBe('INTERNAL');
  });

  it('Org A CANNOT read Org B private fields: GET returns the stripped public view', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/v1/tickets/${ticketB}`, headers: bearer(KEY_A) });
    expect(res.statusCode).toBe(200);
    const t = res.json().ticket;
    expect(t.agentNotes ?? null).toBeNull();
    expect(t.reporterEmail ?? null).toBeNull();
  });

  it('Org B (owner) CAN update its own ticket', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: `/api/v1/tickets/${ticketB}`,
      headers: bearer(KEY_B),
      payload: JSON.stringify({ status: 'closed' }),
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().ticket.status).toBe('closed');
  });

  it('Org B (owner) sees the full record including private fields', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/v1/tickets/${ticketB}`, headers: bearer(KEY_B) });
    expect(res.statusCode).toBe(200);
    expect(res.json().ticket.agentNotes).toBe('INTERNAL');
    expect(res.json().ticket.reporterEmail).toBe('reporter@b.com');
  });
});
