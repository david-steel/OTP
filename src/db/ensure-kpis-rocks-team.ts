/**
 * Idempotent boot-time migration: add team_id to kpis and rocks, backfill.
 *
 * Same shape as ensure-tickets-team.ts. After this, the L10 scorecard +
 * rocks section filter by meeting.team_id strictly, so a Leadership L10
 * sees only Leadership KPIs/Rocks (not "David x Dan" private ones).
 *
 * Backfill rule: every existing KPI and rock is tagged to the org's
 * leadership team. Users can then move specific items to other teams
 * via PATCH /kpis/:id { teamId } and PATCH /rocks/:id { teamId }.
 *
 * Safe to run on every boot.
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DDL = [
  // kpis
  `DO $$ BEGIN
     ALTER TABLE "kpis"
       ADD COLUMN "team_id" uuid REFERENCES "teams"("id") ON DELETE SET NULL;
   EXCEPTION WHEN duplicate_column THEN null; END $$;`,

  `CREATE INDEX IF NOT EXISTS "kpis_team_idx"
     ON "kpis" ("organization_id", "team_id");`,

  `UPDATE "kpis" k
   SET "team_id" = lt."id"
   FROM "teams" lt
   WHERE k."team_id" IS NULL
     AND lt."org_id" = k."organization_id"
     AND lt."slug" = 'leadership';`,

  // rocks
  `DO $$ BEGIN
     ALTER TABLE "rocks"
       ADD COLUMN "team_id" uuid REFERENCES "teams"("id") ON DELETE SET NULL;
   EXCEPTION WHEN duplicate_column THEN null; END $$;`,

  `CREATE INDEX IF NOT EXISTS "rocks_team_idx"
     ON "rocks" ("organization_id", "team_id");`,

  `UPDATE "rocks" r
   SET "team_id" = lt."id"
   FROM "teams" lt
   WHERE r."team_id" IS NULL
     AND lt."org_id" = r."organization_id"
     AND lt."slug" = 'leadership';`,

  // rocks -> OOS operating plan links (mirror of kpis.plan_section_id /
  // kpis.execution_item_id). Plain uuid columns -- no FK constraint in raw
  // SQL, matching how nullable cross-refs are handled here.
  `DO $$ BEGIN
     ALTER TABLE "rocks"
       ADD COLUMN "plan_section_id" uuid;
   EXCEPTION WHEN duplicate_column THEN null; END $$;`,

  `DO $$ BEGIN
     ALTER TABLE "rocks"
       ADD COLUMN "execution_item_id" uuid;
   EXCEPTION WHEN duplicate_column THEN null; END $$;`,
];

export async function ensureKpisRocksTeam(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }
}
