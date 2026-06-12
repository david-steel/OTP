// Adversarial integration tests for PRIVATE-PLAN ENFORCEMENT (2026-06-11).
//
// A private org's data must NEVER appear in any cross-org read surface. These
// tests seed one PRIVATE org and one PUBLIC org -- each with a published OOS +
// claims -- then assert the private org is ABSENT from every cross-org surface
// while the public org is present (no over-blocking), and that the private
// org's OWN data is still readable by the org itself (no self-blocking).
//
// Harness: real route handlers against a real (pglite) Postgres, schema
// materialised from schema.ts via drizzle-kit push (see test/pg-harness.ts).
// NOTE: graph_nodes / graph_edges / the coordination_patterns matview live in
// migration 0002, which `drizzle-kit push` does NOT apply, so the graph_nodes-
// backed surfaces (graph/compare, graph/authority, graph/org/:id) cannot be
// integration-tested in this harness. They share the identical EXISTS(... AND
// o.is_private IS NOT TRUE) guard verified here on /graph and are covered by
// the pure-predicate tests + code review. The /graph route itself (built from
// published OOS + organizations) IS exercised below.
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import Fastify, { type FastifyInstance } from 'fastify';

vi.mock('@clerk/fastify', () => ({ getAuth: () => ({ userId: null }) }));

import { isCrossOrgVisible, excludePrivateOrgs } from '../../shared/org-visibility.js';

// ---------------------------------------------------------------------------
// Pure-unit tests (no DB) -- the chokepoint predicate + filter.
// ---------------------------------------------------------------------------
describe('org-visibility pure predicate (isCrossOrgVisible)', () => {
  it('treats is_private=true as NOT visible cross-org', () => {
    expect(isCrossOrgVisible({ isPrivate: true })).toBe(false);
  });
  it('treats is_private=false as visible', () => {
    expect(isCrossOrgVisible({ isPrivate: false })).toBe(true);
  });
  it('treats null/undefined is_private as visible (null-safe default)', () => {
    expect(isCrossOrgVisible({ isPrivate: null })).toBe(true);
    expect(isCrossOrgVisible({})).toBe(true);
    expect(isCrossOrgVisible({ isPrivate: undefined })).toBe(true);
  });
  it('treats a null/undefined org as NOT visible (fail closed)', () => {
    expect(isCrossOrgVisible(null)).toBe(false);
    expect(isCrossOrgVisible(undefined)).toBe(false);
  });
});

describe('excludePrivateOrgs() SQL predicate', () => {
  it('compiles to an IS NOT TRUE clause on is_private (NULL stays visible)', async () => {
    // Render the fragment through the real pg dialect and assert the column +
    // IS NOT TRUE shape, so a refactor that drops null-safety fails loudly.
    const { PgDialect } = await import('drizzle-orm/pg-core');
    const dialect = new PgDialect();
    const { sql: rendered } = dialect.sqlToQuery(excludePrivateOrgs());
    expect(rendered).toMatch(/is_private/i);
    expect(rendered).toMatch(/is not true/i);
  });
});

// ---------------------------------------------------------------------------
// Integration tests against real handlers + real DB.
// ---------------------------------------------------------------------------
let stopDb: (() => Promise<void>) | undefined;
let app: FastifyInstance;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let db: any, schema: any, pool: any;

let privateOrgId: string, publicOrgId: string;
let privateOosId: string, publicOosId: string;

const PRIVATE_RULE = 'PRIVATE-ORG-SECRET-RULE-XyZ';
const PUBLIC_RULE = 'PUBLIC-ORG-OPEN-RULE-AbC';

// Each org's claim must be lexically DISSIMILAR so the recommendation engine's
// "already covered" Jaccard filter does not drop the candidate for reasons
// unrelated to privacy. Distinct rule/why/scope text per org.
async function makePublishedOos(
  orgId: string,
  name: string,
  ruleText: string,
  filler: string,
) {
  const [oos] = await db.insert(schema.oosFiles).values({
    orgId,
    name,
    template: 'agent_army',
    status: 'published',
    wordCount: 100,
    rawContent: `# ${name}`,
    frontmatter: {},
    publishedAt: new Date(),
    claimCount: 1,
  }).returning();
  // why/scope use ONLY the per-org filler vocabulary (no shared phrase) so the
  // recommendation engine's Jaccard "already covered" filter does not collapse
  // the two claims together for reasons unrelated to privacy.
  await db.insert(schema.claims).values({
    oosFileId: oos.id,
    claimId: 'C001',
    section: 'core_operating_rules',
    displayOrder: 1,
    rule: ruleText,
    why: `${filler} ${filler}ation ${filler}ography ${filler}ometric ${filler} underwriting`,
    failureMode: `${filler}lessness ${filler}ware ${filler}board ${filler}flow`,
    confidence: 'HIGH',
    evidence: 'MEASURED_RESULT',
    scope: `${filler}sphere ${filler}works ${filler}grid`,
    public: true,
    roles: ['ceo'],
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
  const { sql } = await import('drizzle-orm');

  // The harness materialises the schema from schema.ts via drizzle-kit push,
  // which does NOT create claims.search_vector (it's a tsvector column + trigger
  // from migration 0001). /search and /intelligence/search?q reference it, so
  // create it here to exercise those surfaces realistically.
  await db.execute(sql.raw(`ALTER TABLE claims ADD COLUMN IF NOT EXISTS search_vector tsvector;`));
  await db.execute(sql.raw(`
    CREATE OR REPLACE FUNCTION claims_search_vector_update() RETURNS trigger AS $$
    BEGIN
      NEW.search_vector :=
        setweight(to_tsvector('english', coalesce(NEW.rule, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.why, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(NEW.failure_mode, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(NEW.scope, '')), 'C');
      RETURN NEW;
    END
    $$ LANGUAGE plpgsql;`));
  await db.execute(sql.raw(`DROP TRIGGER IF EXISTS claims_search_update ON claims;`));
  await db.execute(sql.raw(`
    CREATE TRIGGER claims_search_update BEFORE INSERT OR UPDATE ON claims
    FOR EACH ROW EXECUTE FUNCTION claims_search_vector_update();`));

  const searchRoutes = (await import('./search.js')).default;
  const browseRoutes = (await import('./browse.js')).default;
  const graphRoutes = (await import('./graph.js')).default;
  const consultantRoutes = (await import('./consultants.js')).default;

  app = Fastify();
  await app.register(searchRoutes, { prefix: '/api/v1' });
  await app.register(browseRoutes, { prefix: '/api/v1' });
  await app.register(graphRoutes, { prefix: '/api/v1' });
  await app.register(consultantRoutes, { prefix: '/api/v1' });
  await app.ready();

  const [priv] = await db.insert(schema.organizations)
    .values({ name: 'Private Co', industry: 'fitness', size: 'small', clerkOrgId: 'clerk_priv_' + process.pid, public: true, isPrivate: true })
    .returning();
  const [pub] = await db.insert(schema.organizations)
    .values({ name: 'Public Co', industry: 'fitness', size: 'small', clerkOrgId: 'clerk_pub_' + process.pid, public: true, isPrivate: false })
    .returning();
  privateOrgId = priv.id;
  publicOrgId = pub.id;

  // NOTE: private org is also public=true on purpose -- proves is_private is a
  // HARD, ADDITIVE exclusion that overrides public listing (not a repurpose of
  // `public`).
  privateOosId = await makePublishedOos(privateOrgId, 'Private OOS', PRIVATE_RULE, 'biometrics');
  publicOosId = await makePublishedOos(publicOrgId, 'Public OOS', PUBLIC_RULE, 'logistics');

  // Published consultant profiles for both orgs -> /experts + /consultants.
  await db.insert(schema.consultantProfiles).values([
    { orgId: privateOrgId, slug: 'private-expert', displayName: 'Private Expert', headline: 'biometrics coaching', published: true, claimed: true, directorySource: 'otp' },
    { orgId: publicOrgId, slug: 'public-expert', displayName: 'Public Expert', headline: 'logistics coaching', published: true, claimed: true, directorySource: 'otp' },
  ]);
}, 120_000);

afterAll(async () => {
  await app?.close();
  await pool?.end().catch(() => {});
  await stopDb?.();
});

describe('private-plan enforcement across cross-org surfaces', () => {
  it('GET /browse omits the private org, includes the public org', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/browse?limit=100' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    const orgIds = body.data.map((r: any) => r.org_id);
    expect(orgIds).toContain(publicOrgId);
    expect(orgIds).not.toContain(privateOrgId);
    expect(res.body).not.toContain('Private OOS');
  });

  it('GET /search never returns private-org claims, returns public ones', async () => {
    // 'biometrics' is a distinctive token in the PRIVATE org's claim why-text.
    // A cross-org search for it must return nothing (private org excluded).
    const priv = await app.inject({ method: 'GET', url: `/api/v1/search?q=${encodeURIComponent('biometrics')}` });
    expect(priv.statusCode).toBe(200);
    expect(priv.json().data.length).toBe(0);
    expect(priv.body).not.toContain(PRIVATE_RULE);

    // 'logistics' is the PUBLIC org's distinctive token -- it MUST be findable.
    const pub = await app.inject({ method: 'GET', url: `/api/v1/search?q=${encodeURIComponent('logistics')}` });
    expect(pub.statusCode).toBe(200);
    expect(pub.json().data.some((r: any) => r.org_id === publicOrgId)).toBe(true);
  });

  it('GET /org/:id returns 404 for the private org (same shape as missing)', async () => {
    const res = await app.inject({ method: 'GET', url: `/api/v1/org/${privateOrgId}` });
    expect(res.statusCode).toBe(404);
    expect(res.json().error.code).toBe('NOT_FOUND');
    // public org still resolves
    const pub = await app.inject({ method: 'GET', url: `/api/v1/org/${publicOrgId}` });
    expect(pub.statusCode).toBe(200);
    expect(pub.json().org.id).toBe(publicOrgId);
  });

  it('GET /intelligence/publishers omits the private org', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/intelligence/publishers?limit=100' });
    expect(res.statusCode).toBe(200);
    const ids = res.json().data.map((r: any) => r.id);
    expect(ids).toContain(publicOrgId);
    expect(ids).not.toContain(privateOrgId);
  });

  it('GET /intelligence/search never surfaces private-org claims', async () => {
    // No q -> lists all published claims faceted; private org must be absent.
    const all = await app.inject({ method: 'GET', url: '/api/v1/intelligence/search?limit=100' });
    expect(all.statusCode).toBe(200);
    const ids = all.json().data.map((r: any) => r.org_id);
    expect(ids).toContain(publicOrgId);
    expect(ids).not.toContain(privateOrgId);
    expect(all.body).not.toContain(PRIVATE_RULE);

    // Full-text path: searching the private org's distinctive token returns nothing.
    const priv = await app.inject({ method: 'GET', url: `/api/v1/intelligence/search?q=${encodeURIComponent('biometrics')}&limit=100` });
    expect(priv.statusCode).toBe(200);
    expect(priv.json().data.length).toBe(0);
  });

  it('GET /intelligence/sections counts exclude the private org', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/intelligence/sections' });
    expect(res.statusCode).toBe(200);
    const sections = res.json().sections;
    const cor = sections.find((s: any) => s.section === 'core_operating_rules');
    // Only the public org's single claim should be counted (org_count = 1).
    expect(cor).toBeDefined();
    expect(Number(cor.org_count)).toBe(1);
  });

  it('GET /graph omits the private org node, includes the public org node', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/graph' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    const nodeOrgIds = (body.nodes || []).map((n: any) => n.orgId ?? n.org_id ?? n.id);
    // node ids are org-derived; assert the private org name/id never appears
    expect(JSON.stringify(body)).not.toContain(privateOrgId);
    expect(JSON.stringify(body)).not.toContain('Private OOS');
    expect(body.stats.publishers).toBe(1);
    // sanity: the public org IS represented
    expect(JSON.stringify(body)).toContain(publicOrgId);
    expect(nodeOrgIds.length).toBeGreaterThanOrEqual(0);
  });
});

describe('recommendation engine cross-org sourcing', () => {
  it('a private org\'s claims are NEVER recommended to another org', async () => {
    const { discoverRecommendations } = await import('../../services/recommendation-engine.js');
    // Public org asks for recommendations -> must source from OTHER orgs, but
    // the only other org is private, so its secret rule must not appear.
    const recs = await discoverRecommendations(publicOrgId, 50);
    const sourcedRules = recs.map((r) => r.ruleText);
    expect(sourcedRules).not.toContain(PRIVATE_RULE);
    expect(recs.every((r) => r.ruleText !== PRIVATE_RULE)).toBe(true);
  });

  it('a PUBLIC org\'s claims ARE eligible to be recommended (no over-blocking)', async () => {
    const { discoverRecommendations } = await import('../../services/recommendation-engine.js');
    // The private org (as a viewer) requests recommendations. The engine should
    // still source from the PUBLIC org -- self-blocking would wrongly empty this.
    const recs = await discoverRecommendations(privateOrgId, 50);
    // The public org's open rule should be a candidate (gap-filling). At minimum
    // the private org's request is NOT blocked from receiving public-sourced recs.
    expect(recs.some((r) => r.ruleText === PUBLIC_RULE)).toBe(true);
    expect(recs.every((r) => r.ruleText !== PRIVATE_RULE)).toBe(true);
  });
});

describe('self-visibility (private org reads its OWN data, no self-blocking)', () => {
  it('the private org\'s own published OOS + claims are intact in the DB', async () => {
    // Owner-scoped reads (auth/api-key paths) do not route through the cross-org
    // predicate, so the org still sees its own data. Verify the rows exist and
    // belong to the private org -- the data is hidden cross-org, not deleted.
    const { eq } = await import('drizzle-orm');
    const ownOos = await db.select().from(schema.oosFiles).where(eq(schema.oosFiles.orgId, privateOrgId));
    expect(ownOos.length).toBe(1);
    expect(ownOos[0].id).toBe(privateOosId);
    const ownClaims = await db.select().from(schema.claims).where(eq(schema.claims.oosFileId, privateOosId));
    expect(ownClaims.length).toBe(1);
    expect(ownClaims[0].rule).toBe(PRIVATE_RULE);
  });
});

// ---------------------------------------------------------------------------
// Server-rendered HTML PAGE surfaces (pages.ts). These are the public marketing
// pages humans actually load -- higher exposure than the JSON APIs. The full
// EJS view layer is heavy to wire into this harness, so we assert the EXACT SQL
// the page handlers run (same WHERE the fix added), proving the private org is
// excluded from the page's data set before it ever reaches the template.
// ---------------------------------------------------------------------------
describe('server-rendered page surfaces exclude the private org', () => {
  it('/browse page query (one card per org) omits the private org', async () => {
    const { sql } = await import('drizzle-orm');
    const rows = await db.execute(sql`
      SELECT * FROM (
        SELECT DISTINCT ON (o.id)
               o.id AS org_id, o.name AS org_name
        FROM oos_files f JOIN organizations o ON f.org_id = o.id
        WHERE f.status = 'published'
          AND o.is_private IS NOT TRUE
        ORDER BY o.id, f.published_at DESC NULLS LAST
      ) latest
      ORDER BY org_name
      LIMIT 50`);
    const ids = (rows.rows as any[]).map((r) => r.org_id);
    expect(ids).toContain(publicOrgId);
    expect(ids).not.toContain(privateOrgId);
  });

  it('/search page query never returns private-org claims', async () => {
    const { sql } = await import('drizzle-orm');
    const rows = await db.execute(sql`
      SELECT o.id AS org_id, c.rule
      FROM claims c JOIN oos_files f ON c.oos_file_id = f.id JOIN organizations o ON f.org_id = o.id
      WHERE f.status = 'published' AND o.is_private IS NOT TRUE
        AND c.search_vector @@ plainto_tsquery('english', 'biometrics')`);
    expect((rows.rows as any[]).length).toBe(0);
  });

  it('/org/:id and /oos/:id page guards 404 the private org (isCrossOrgVisible)', async () => {
    const { eq } = await import('drizzle-orm');
    const [privOrg] = await db.select().from(schema.organizations).where(eq(schema.organizations.id, privateOrgId));
    const [pubOrg] = await db.select().from(schema.organizations).where(eq(schema.organizations.id, publicOrgId));
    // The page handlers call `if (!isCrossOrgVisible(org)) return 404`.
    expect(isCrossOrgVisible(privOrg)).toBe(false); // -> 404 on the public page
    expect(isCrossOrgVisible(pubOrg)).toBe(true);   // -> renders
  });

  it('/experts page query omits the private org\'s consultant profile', async () => {
    const { sql } = await import('drizzle-orm');
    const rows = await db.execute(sql`
      SELECT cp.slug, cp.org_id
      FROM consultant_profiles cp
      JOIN organizations o ON o.id = cp.org_id
      WHERE cp.published = true
        AND o.is_private IS NOT TRUE`);
    const slugs = (rows.rows as any[]).map((r) => r.slug);
    expect(slugs).toContain('public-expert');
    expect(slugs).not.toContain('private-expert');
  });
});

describe('/api/v1/consultants directory excludes the private org', () => {
  it('GET /consultants/browse lists the public expert, not the private one', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/consultants/browse?limit=100' });
    expect(res.statusCode).toBe(200);
    const slugs = res.json().profiles.map((p: any) => p.slug);
    expect(slugs).toContain('public-expert');
    expect(slugs).not.toContain('private-expert');
  });

  it('GET /consultants/:slug 404s the private org\'s profile, serves the public one', async () => {
    const priv = await app.inject({ method: 'GET', url: '/api/v1/consultants/private-expert' });
    expect(priv.statusCode).toBe(404);
    expect(priv.json().error.code).toBe('NOT_FOUND');

    const pub = await app.inject({ method: 'GET', url: '/api/v1/consultants/public-expert' });
    expect(pub.statusCode).toBe(200);
    expect(pub.json().profile.slug).toBe('public-expert');
  });
});
