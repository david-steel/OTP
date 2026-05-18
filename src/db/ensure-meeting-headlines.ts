/**
 * meeting_headlines -- structured headlines per meeting per author.
 *
 * The legacy `meetings.headlines` text field stays as the meeting-wide
 * cascading preview. This table replaces the "I just type my headline into
 * a shared blob" pattern with one row per author so the Integrator can
 * mark each headline read independently and so the dashboard can show
 * "your unread headlines" per attendee.
 *
 * read_at / read_by_user_id are set when the Integrator clicks the
 * read checkbox; null = unread. Author may delete their own headline
 * before it is marked read.
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DDL: string[] = [
  `DO $$ BEGIN
     CREATE TYPE "public"."meeting_headline_kind" AS ENUM ('customer', 'employee', 'other');
   EXCEPTION
     WHEN duplicate_object THEN null;
   END $$;`,

  `CREATE TABLE IF NOT EXISTS "meeting_headlines" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
     "meeting_id" uuid NOT NULL REFERENCES "meetings"("id") ON DELETE CASCADE,
     "org_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
     "author_user_id" varchar(255) NOT NULL,
     "author_name" varchar(255),
     "kind" "meeting_headline_kind" NOT NULL DEFAULT 'other',
     "body" text NOT NULL,
     "read_at" timestamp,
     "read_by_user_id" varchar(255),
     "created_at" timestamp NOT NULL DEFAULT now(),
     "updated_at" timestamp NOT NULL DEFAULT now()
   );`,

  `CREATE INDEX IF NOT EXISTS "mhl_meeting_idx" ON "meeting_headlines" ("meeting_id", "created_at" DESC);`,
  `CREATE INDEX IF NOT EXISTS "mhl_author_idx" ON "meeting_headlines" ("org_id", "author_user_id");`,
  `CREATE INDEX IF NOT EXISTS "mhl_unread_idx" ON "meeting_headlines" ("meeting_id", "read_at");`,

  // A headline is fundamentally team-scoped; the meeting link is optional.
  `DO $$ BEGIN
     ALTER TABLE "meeting_headlines" ADD COLUMN "team_id" uuid;
   EXCEPTION WHEN duplicate_column THEN null; END $$;`,

  `ALTER TABLE "meeting_headlines" ALTER COLUMN "meeting_id" DROP NOT NULL;`,

  `UPDATE "meeting_headlines" mh
   SET "team_id" = m."team_id"
   FROM "meetings" m
   WHERE mh."meeting_id" = m."id"
     AND mh."team_id" IS NULL;`,

  `CREATE INDEX IF NOT EXISTS "mhl_team_idx" ON "meeting_headlines" ("team_id");`,
];

export async function ensureMeetingHeadlinesTable(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }
}
