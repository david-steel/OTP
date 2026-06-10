// Regression test for the unauthenticated /api/v1/merge/preview hole
// (2026-06-10 audit, fix in this commit). Before the fix the handler did ZERO
// auth: anyone with two published OOS UUIDs could read both orgs' full claim
// sets and write audit-log rows attributed to an arbitrary org.
//
// Rules under test (mirrors /merge/decisions semantics):
//  - no auth         -> 401
//  - target not mine -> 403 NOT_OWNER (source may be any published OOS)
//  - source other org, target mine -> 200 (cross-org merge is the feature)
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import Fastify, { type FastifyInstance } from 'fastify';
import { createHash } from 'node:crypto';

// Force the API-key auth path (no Clerk plugin registered in the harness).
vi.mock('@clerk/fastify', () => ({ getAuth: () => ({ userId: null }) }));

const sha = (k: string) => createHash('sha256').update(k).digest('hex');
const KEY_A = 'otp_' + 'a'.repeat(60);
const bearer = (k: string) => ({ authorization: 'Bearer ' + k, 'content-type': 'application/json' });

let stopDb: (() => Promise<void>) | undefined;
let app: FastifyInstance;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let db: any, schema: any, pool: any;
let oosA: string, oosB: string;

async function makePublishedOos(orgId: string, name: string) {
  const [oos] = await db.insert(schema.oosFiles).values({
    orgId,
    name,
    template: 'agent_army',
    status: 'published',
    wordCount: 100,
    rawContent: `# ${name}`,
    frontmatter: {},
    publishedAt: new Date(),
  }).returning();
  await db.insert(schema.claims).values({
    oosFileId: oos.id,
    claimId: 'C001',
    section: 'ops',
    displayOrder: 1,
    rule: `${name} secret rule`,
    why: 'because',
    failureMode: 'leaks',
    confidence: 'HIGH',
    evidence: 'HUMAN_DEFINED_RULE',
    scope: 'org',
  });
  return oos.id as string;
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
  const mergeRoutes = (await import('./merge.js')).default;

  app = Fastify();
  await app.register(mergeRoutes, { prefix: '/api/v1' });
  await app.ready();

  const [a] = await db.insert(schema.organizations)
    .values({ name: 'Org A', industry: 'x', size: 'small', clerkOrgId: 'clerk_ma_' + process.pid })
    .returning();
  const [b] = await db.insert(schema.organizations)
    .values({ name: 'Org B', industry: 'x', size: 'small', clerkOrgId: 'clerk_mb_' + process.pid })
    .returning();
  await db.insert(schema.apiKeys).values({ orgId: a.id, keyPrefix: KEY_A.slice(0, 8), keyHash: sha(KEY_A), scopes: ['read', 'write'] });

  oosA = await makePublishedOos(a.id, 'A OOS');
  oosB = await makePublishedOos(b.id, 'B OOS');
}, 120_000);

afterAll(async () => {
  await app?.close();
  await pool?.end().catch(() => {});
  await stopDb?.();
});

describe('merge endpoints authorization (unauthenticated-preview regression)', () => {
  it('unauthenticated /merge/preview -> 401, no claim content in body', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/merge/preview',
      headers: { 'content-type': 'application/json' },
      payload: JSON.stringify({ sourceOosId: oosA, targetOosId: oosB }),
    });
    expect(res.statusCode).toBe(401);
    expect(res.body).not.toContain('secret rule');
  });

  it('unauthenticated /merge/decisions -> 401', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/merge/decisions',
      headers: { 'content-type': 'application/json' },
      payload: JSON.stringify({
        sourceOosId: oosA,
        targetOosId: oosB,
        decisions: [{ candidateId: 'x', decision: 'accept' }],
      }),
    });
    expect(res.statusCode).toBe(401);
  });

  it("Org A CANNOT preview into Org B's OOS as target -> 403 NOT_OWNER", async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/merge/preview',
      headers: bearer(KEY_A),
      payload: JSON.stringify({ sourceOosId: oosA, targetOosId: oosB }),
    });
    expect(res.statusCode).toBe(403);
    expect(res.json().error.code).toBe('NOT_OWNER');
    expect(res.body).not.toContain('B OOS secret rule');
  });

  it("Org A CAN preview Org B's published OOS as SOURCE into its own target", async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/merge/preview',
      headers: bearer(KEY_A),
      payload: JSON.stringify({ sourceOosId: oosB, targetOosId: oosA }),
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().summary).toBeDefined();
  });
});
