/**
 * Idempotent boot-time migration that connects meetings to teams.
 *
 * Phase 4: a single org runs multiple L8 meetings -- Leadership Team's
 * weekly, the CC team's weekly, etc. Today meetings.organizationId scopes
 * to the org but doesn't differentiate which team is meeting. We add a
 * nullable team_id column and backfill existing meetings to the org's
 * default Leadership Team so list filters and per-team scorecards work
 * without breaking historical data.
 *
 * Nullable: legacy or "company-wide" meetings without a team stay null
 * and render under the default team in the UI.
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const STATIC_DDL: string[] = [
  `ALTER TABLE "meetings" ADD COLUMN IF NOT EXISTS "team_id" uuid
     REFERENCES "teams"("id") ON DELETE SET NULL;`,

  `CREATE INDEX IF NOT EXISTS "meetings_team_idx"
     ON "meetings" ("organization_id", "team_id");`,

  // Backfill: any meeting still missing a team_id gets assigned to its
  // org's default Leadership Team (created by ensure-teams.ts).
  `UPDATE "meetings" m
   SET "team_id" = t."id"
   FROM "teams" t
   WHERE m."team_id" IS NULL
     AND t."org_id" = m."organization_id"
     AND t."slug" = 'leadership';`,
];

export async function ensureMeetingTeamColumn(): Promise<void> {
  for (const stmt of STATIC_DDL) {
    await db.execute(sql.raw(stmt));
  }
}
