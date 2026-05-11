/**
 * Idempotent boot-time migration: add team_id to tickets and backfill.
 *
 * Issues (tickets) need team scoping so a Leadership L10 doesn't surface
 * private issues that another team is working on. Backfill rule:
 *   - Every existing ticket gets the org's leadership team (the team
 *     created by ensure-teams.ts with slug='leadership').
 *   - Users can then move specific tickets to other teams via the UI.
 *
 * After this migration, /l8 filters tickets strictly by meeting.team_id =
 * tickets.team_id. Tickets with team_id IS NULL are hidden from all L10s
 * (admin can find them with includeUntagged=true on the API).
 *
 * Safe to run on every boot.
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DDL = [
  `DO $$ BEGIN
     ALTER TABLE "tickets"
       ADD COLUMN "team_id" uuid REFERENCES "teams"("id") ON DELETE SET NULL;
   EXCEPTION WHEN duplicate_column THEN null; END $$;`,

  `CREATE INDEX IF NOT EXISTS "tickets_team_idx"
     ON "tickets" ("org_id", "team_id");`,

  // Backfill: untagged tickets → org's leadership team. Idempotent on the
  // IS NULL guard. If an org has no leadership team yet (shouldn't happen
  // post-ensure-teams.ts) the tickets stay NULL and are hidden from L10s.
  `UPDATE "tickets" t
   SET "team_id" = lt."id"
   FROM "teams" lt
   WHERE t."team_id" IS NULL
     AND lt."org_id" = t."org_id"
     AND lt."slug" = 'leadership';`,
];

export async function ensureTicketsTeam(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }
}
