/**
 * organizations.is_private -- Private-plan enforcement (2026-06-11).
 *
 * Hard, additive cross-org exclusion. When true, the org's data never appears
 * in any cross-org read surface (browse, search, /org/:id, graph, intelligence,
 * recommendations, public best-practices, MCP). Distinct from `public`:
 *   - `public`     = opt-IN to public listing (existing).
 *   - `is_private` = opt-OUT of the entire network (new, this column).
 *
 * NOT NULL DEFAULT false => existing orgs are unaffected (the network does not
 * empty out). The enforcement chokepoint and the full call-site registry live
 * in src/shared/org-visibility.ts.
 *
 * Drizzle migrate is broken on this project (schema drift), so the column +
 * index self-heal on boot. Mirrors ensure-rock-milestones.ts.
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DDL: string[] = [
  `ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "is_private" boolean NOT NULL DEFAULT false;`,
  // Hot path: every cross-org query ANDs `is_private = false`.
  `CREATE INDEX IF NOT EXISTS "org_is_private_idx" ON "organizations" ("is_private");`,
];

// The coordination_patterns materialized view (migration 0002) pre-dates
// is_private and aggregates cross-org -- a private org's edges would otherwise
// be baked into the public pattern counts with no per-row org to filter at read
// time. Rebuild the view definition to exclude private orgs. Idempotent: only
// fires when the view exists AND its current definition lacks the filter. The
// view is refreshed on every publish (oos.ts), so the next publish repopulates
// it; we also REFRESH here so the exclusion takes effect immediately.
const REBUILD_COORDINATION_PATTERNS = `
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname = 'coordination_patterns')
     AND pg_get_viewdef('coordination_patterns'::regclass) NOT ILIKE '%is_private%' THEN
    DROP MATERIALIZED VIEW coordination_patterns;
    CREATE MATERIALIZED VIEW coordination_patterns AS
    SELECT
      ge.type AS edge_type,
      sn.type AS source_type,
      tn.type AS target_type,
      sn.properties->>'authority_level' AS source_authority,
      COUNT(DISTINCT ge.oos_file_id) AS org_count,
      COUNT(*) AS instance_count,
      ARRAY_AGG(DISTINCT o.industry) AS industries
    FROM graph_edges ge
    JOIN graph_nodes sn ON ge.source_id = sn.id
    JOIN graph_nodes tn ON ge.target_id = tn.id
    JOIN oos_files f ON ge.oos_file_id = f.id
    JOIN organizations o ON f.org_id = o.id
    WHERE f.status = 'published'
      AND o.is_private IS NOT TRUE
    GROUP BY ge.type, sn.type, tn.type, sn.properties->>'authority_level'
    HAVING COUNT(DISTINCT ge.oos_file_id) >= 2;
    CREATE UNIQUE INDEX cp_pattern_idx
      ON coordination_patterns(edge_type, source_type, target_type, source_authority);
  END IF;
END $$;`;

export async function ensureOrgPrivacy(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }
  // Rebuild the matview separately -- if graph tables don't exist on this
  // deployment (e.g. a fresh DB that never ran migration 0002), the guard's
  // EXISTS check short-circuits and this is a no-op.
  await db.execute(sql.raw(REBUILD_COORDINATION_PATTERNS));
}
