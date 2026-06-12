/**
 * org-visibility.ts -- the SINGLE chokepoint for private-plan enforcement.
 *
 * A private org's data must NEVER appear in any CROSS-org read surface. This
 * module is the one place that decides what "private" means, so every surface
 * enforces it identically. AND `excludePrivateOrgs(organizations)` into the
 * WHERE of every query that joins `organizations` for a cross-org read, or
 * filter rows in code with `isCrossOrgVisible(org)`.
 *
 * DB-free: imports only the schema (column refs) + drizzle-orm operators, never
 * config/database. Keeps it unit-testable and importable from tests.
 *
 * Semantics:
 *   - is_private = false (or NULL, pre-backfill) => visible cross-org.
 *   - is_private = true                          => excluded cross-org.
 * Null-safety: `is_private` is NOT NULL DEFAULT false, but we use IS NOT TRUE /
 * `!== true` so a stray NULL (e.g. a row created before the boot DDL ran on a
 * fresh replica) still defaults to VISIBLE rather than silently disappearing.
 *
 * NOTE: this blocks CROSS-org exposure only. Authed members of the org itself
 * still read their own data through the authenticated/owner-scoped paths --
 * none of those join through this predicate.
 *
 * ============================================================================
 * ENFORCEMENT REGISTRY -- every cross-org call site that MUST use this.
 * When you add a new cross-org surface, add the predicate AND add a line here.
 * ----------------------------------------------------------------------------
 *  [x] src/routes/api/search.ts        GET /search          (claims search)
 *  [x] src/routes/api/search.ts        GET /browse          (published OOS)
 *  [x] src/routes/api/search.ts        GET /org/:id         (org profile lookup)
 *  [x] src/routes/api/browse.ts        GET /intelligence/search
 *  [x] src/routes/api/browse.ts        GET /intelligence/search (facets)
 *  [x] src/routes/api/browse.ts        GET /intelligence/sections
 *  [x] src/routes/api/browse.ts        GET /intelligence/publishers
 *  [x] src/routes/api/browse.ts        GET /intelligence/patterns (matview read)
 *  [x] src/routes/api/graph.ts         GET /graph           (nodes + edges + claims)
 *  [x] src/graph/graph-queries.ts      findAgentConflicts   (GET /graph/conflicts)
 *  [x] src/graph/graph-queries.ts      compareOrganizations (GET /graph/compare)
 *  [x] src/graph/graph-queries.ts      getOrgSubgraph       (GET /graph/org/:id)
 *  [x] src/graph/graph-queries.ts      getAuthorityMap      (GET /graph/authority/:id)
 *  [x] src/services/recommendation-engine.ts  discoverRecommendations
 *  [x] src/routes/api/oos.ts           GET /oos/:id/compare/:otherId
 *  [x] src/routes/api/best-practices.ts GET /best-practices/:slug/implementing-orgs
 *  [x] mcp-server/src/index.ts         (HTTP wrapper -- inherits route fixes; no DB)
 *
 *  Already safe (filter `public = true`, which a private org will not have, but
 *  we still AND is_private for defense in depth where the join exists):
 *  [-] src/routes/api/public/orgs.ts   /publishers, /orgs/:slug, /orgs/:slug/chart
 *  [-] src/routes/api/claims-public.ts /public/learnings, /rules, /patterns
 *  [-] src/routes/api/public/kpis.ts   /public/kpis
 * ============================================================================
 */
import { sql } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import { organizations } from '../db/schema.js';

/**
 * Drizzle predicate to AND into a cross-org query's WHERE. Drops private orgs.
 *
 * Compiles to `<is_private> IS NOT TRUE`, which is TRUE for both `false` and
 * NULL and FALSE only for `true`. That is the NULL-safe direction we want: a
 * stray NULL (row created before the boot DDL backfilled the column) stays
 * VISIBLE rather than silently vanishing. `ne()` alone would treat NULL as
 * unknown and drop those rows -- so we use the explicit IS NOT TRUE form.
 *
 * Pass a table/alias object whose `isPrivate` is the column ref bound to the
 * right alias when the query joins `organizations` under an alias.
 */
export function excludePrivateOrgs(
  orgsTable: { isPrivate: typeof organizations.isPrivate } = organizations,
): SQL {
  return sql`${orgsTable.isPrivate} IS NOT TRUE`;
}

/**
 * Pure predicate for in-code row filtering and tests.
 * Returns true if the org may be exposed in cross-org surfaces.
 */
export function isCrossOrgVisible(org: { isPrivate?: boolean | null } | null | undefined): boolean {
  if (!org) return false;
  return org.isPrivate !== true;
}

/**
 * Raw SQL fragment for hand-written `db.execute(sql\`...\`)` queries that can't
 * use the drizzle query builder. AND this into the WHERE. `alias` is the table
 * alias used for `organizations` in the query (e.g. 'o'). Produces:
 *   AND <alias>.is_private IS NOT TRUE
 * which keeps NULL/false visible and drops only true.
 */
export function privateExclusionClauseFor(alias: string): string {
  // alias is developer-supplied (not user input); keep it simple + safe.
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(alias)) {
    throw new Error(`privateExclusionClauseFor: invalid SQL alias '${alias}'`);
  }
  return `${alias}.is_private IS NOT TRUE`;
}
