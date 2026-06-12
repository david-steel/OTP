/**
 * rock_milestones -- milestones (with due dates + check-off) on Quarterly
 * Priorities (rocks), plus todos.milestone_id so to-dos can be assigned to
 * people under a specific milestone.
 *
 * FK choices:
 *   - rock_milestones.rock_id -> rocks(id) ON DELETE CASCADE: rocks are
 *     soft-deleted in the app (deleted_at), so the cascade only fires on a
 *     true hard delete -- but when it does, orphan milestones go with it.
 *   - todos.milestone_id -> rock_milestones(id) ON DELETE SET NULL: deleting
 *     a milestone keeps its to-dos alive as plain to-dos (same convention as
 *     todos.team_id / todos.meeting_id).
 *
 * Drizzle migrate is broken on this project (schema drift), so the table and
 * column self-heal on boot. Mirrors ensure-attachments.ts.
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DDL: string[] = [
  `CREATE TABLE IF NOT EXISTS "rock_milestones" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
     "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
     "rock_id" uuid NOT NULL REFERENCES "rocks"("id") ON DELETE CASCADE,
     "title" varchar(255) NOT NULL,
     "due_date" date,
     "completed_at" timestamp,
     "sort_order" integer NOT NULL DEFAULT 0,
     "created_at" timestamp NOT NULL DEFAULT now()
   );`,

  `CREATE INDEX IF NOT EXISTS "rock_milestones_org_idx" ON "rock_milestones" ("organization_id");`,
  `CREATE INDEX IF NOT EXISTS "rock_milestones_rock_idx" ON "rock_milestones" ("rock_id");`,

  // To-dos can hang off a milestone. SET NULL on milestone delete -- the
  // to-do survives as a normal to-do.
  `ALTER TABLE "todos" ADD COLUMN IF NOT EXISTS "milestone_id" uuid;`,

  `DO $$ BEGIN
     ALTER TABLE "todos" ADD CONSTRAINT "todos_milestone_id_rock_milestones_id_fk"
       FOREIGN KEY ("milestone_id") REFERENCES "rock_milestones"("id") ON DELETE SET NULL;
   EXCEPTION WHEN duplicate_object THEN null; END $$;`,

  `CREATE INDEX IF NOT EXISTS "todos_milestone_idx" ON "todos" ("milestone_id");`,
];

export async function ensureRockMilestones(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }
}
