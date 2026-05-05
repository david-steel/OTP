/**
 * Idempotent boot-time migration for teams and team_memberships.
 * Same pattern as ensure-org-members.ts.
 *
 * A "team" in Ninety/OTP terms is a meeting+scorecard group inside an org
 * (e.g. Leadership Team, Web Team, Call Center Team). Members can belong
 * to multiple teams. Meetings, rocks, todos, and IDS items will eventually
 * be scoped to a team in addition to the org (Phase 4).
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DDL = [
  `DO $$ BEGIN
     CREATE TYPE "public"."team_type" AS ENUM (
       'leadership', 'department', 'project', 'other'
     );
   EXCEPTION
     WHEN duplicate_object THEN null;
   END $$;`,

  `DO $$ BEGIN
     CREATE TYPE "public"."team_role" AS ENUM ('leader', 'member');
   EXCEPTION
     WHEN duplicate_object THEN null;
   END $$;`,

  `CREATE TABLE IF NOT EXISTS "teams" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
     "org_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
     "name" varchar(255) NOT NULL,
     "slug" varchar(255) NOT NULL,
     "type" "team_type" NOT NULL DEFAULT 'department',
     "description" text,
     "is_default" boolean NOT NULL DEFAULT false,
     "created_at" timestamp NOT NULL DEFAULT now(),
     "updated_at" timestamp NOT NULL DEFAULT now()
   );`,

  `CREATE UNIQUE INDEX IF NOT EXISTS "teams_org_slug_uidx" ON "teams" ("org_id", "slug");`,
  `CREATE INDEX IF NOT EXISTS "teams_org_idx" ON "teams" ("org_id");`,
  `CREATE INDEX IF NOT EXISTS "teams_type_idx" ON "teams" ("org_id", "type");`,

  `CREATE TABLE IF NOT EXISTS "team_memberships" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
     "team_id" uuid NOT NULL REFERENCES "teams"("id") ON DELETE CASCADE,
     "member_id" uuid NOT NULL REFERENCES "org_members"("id") ON DELETE CASCADE,
     "role_on_team" "team_role" NOT NULL DEFAULT 'member',
     "created_at" timestamp NOT NULL DEFAULT now()
   );`,

  `CREATE UNIQUE INDEX IF NOT EXISTS "tm_team_member_uidx" ON "team_memberships" ("team_id", "member_id");`,
  `CREATE INDEX IF NOT EXISTS "tm_team_idx" ON "team_memberships" ("team_id");`,
  `CREATE INDEX IF NOT EXISTS "tm_member_idx" ON "team_memberships" ("member_id");`,

  // Backfill: every existing organization gets a default Leadership Team
  // with the Owner as its team leader. This gives Phase 4 meetings a place
  // to attach without breaking existing single-user orgs.
  `INSERT INTO "teams" ("org_id", "name", "slug", "type", "is_default")
   SELECT o."id", 'Leadership Team', 'leadership', 'leadership', true
   FROM "organizations" o
   WHERE NOT EXISTS (
     SELECT 1 FROM "teams" t
     WHERE t."org_id" = o."id" AND t."slug" = 'leadership'
   );`,

  `INSERT INTO "team_memberships" ("team_id", "member_id", "role_on_team")
   SELECT t."id", m."id", 'leader'
   FROM "teams" t
   JOIN "org_members" m ON m."org_id" = t."org_id" AND m."role" = 'owner'
   WHERE t."slug" = 'leadership'
     AND NOT EXISTS (
       SELECT 1 FROM "team_memberships" tm
       WHERE tm."team_id" = t."id" AND tm."member_id" = m."id"
     );`,
];

export async function ensureTeamsTables(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }
}
