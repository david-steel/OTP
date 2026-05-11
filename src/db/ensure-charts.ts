/**
 * Idempotent boot-time migration for charts (Phase C / B1).
 *
 * OTP today: 1 org = 1 chart, derived from the latest oos_file. orger-next
 * Phase C wants 1 org = N charts, each backed by its own oos_file lineage.
 *
 * Migration shape:
 *   1. CREATE TABLE charts -- one row per chart, with a primary marker
 *   2. ALTER TABLE oos_files ADD chart_id (nullable for the backfill window)
 *   3. Backfill:
 *      a. Every org gets a "Main" chart with is_primary=true if missing
 *      b. Every oos_file with NULL chart_id is linked to its org's primary chart
 *
 * Safe to run on every boot. The team-graph service later prefers a chartId
 * when given, falling back to "the org's primary chart" for back-compat with
 * OTP's own /dashboard/team (which only knows about one chart per org).
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DDL = [
  `CREATE TABLE IF NOT EXISTS "charts" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
     "org_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
     "name" varchar(255) NOT NULL,
     "is_primary" boolean NOT NULL DEFAULT false,
     "created_by_clerk_user_id" varchar(255),
     "share_token" varchar(64),
     "created_at" timestamp NOT NULL DEFAULT now(),
     "updated_at" timestamp NOT NULL DEFAULT now()
   );`,

  // Only one primary chart per org. Partial unique index lets non-primary
  // charts coexist freely while the primary slot stays single.
  `CREATE UNIQUE INDEX IF NOT EXISTS "charts_org_primary_uidx"
     ON "charts" ("org_id") WHERE "is_primary" = true;`,

  `CREATE INDEX IF NOT EXISTS "charts_org_idx" ON "charts" ("org_id");`,

  `CREATE UNIQUE INDEX IF NOT EXISTS "charts_share_token_uidx"
     ON "charts" ("share_token") WHERE "share_token" IS NOT NULL;`,

  // Add the FK column to oos_files. Nullable so the backfill below can run
  // without violating constraints; the team-graph service treats NULL as
  // "belongs to the org's primary chart" during the transition.
  `DO $$ BEGIN
     ALTER TABLE "oos_files"
       ADD COLUMN "chart_id" uuid REFERENCES "charts"("id") ON DELETE CASCADE;
   EXCEPTION
     WHEN duplicate_column THEN null;
   END $$;`,

  `CREATE INDEX IF NOT EXISTS "oos_files_chart_idx" ON "oos_files" ("chart_id");`,

  // Backfill 1: every org without a primary chart gets a "Main" one.
  // Idempotent thanks to the WHERE NOT EXISTS guard plus the partial unique
  // index on (org_id) WHERE is_primary.
  `INSERT INTO "charts" ("org_id", "name", "is_primary")
   SELECT o."id", 'Main', true
   FROM "organizations" o
   WHERE NOT EXISTS (
     SELECT 1 FROM "charts" c
     WHERE c."org_id" = o."id" AND c."is_primary" = true
   );`,

  // Backfill 2: every oos_file with a NULL chart_id gets linked to its
  // org's primary chart. Safe to re-run -- only NULLs are touched.
  `UPDATE "oos_files" f
   SET "chart_id" = c."id"
   FROM "charts" c
   WHERE f."chart_id" IS NULL
     AND c."org_id" = f."org_id"
     AND c."is_primary" = true;`,
];

export async function ensureChartsTable(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }
}
