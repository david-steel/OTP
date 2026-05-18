/**
 * Idempotent boot-time migration for Todos v2.
 *
 * Adds:
 *   - todo_kind enum (personal | l10) + default 'personal'
 *   - todo_priority enum (p1 | p2 | p3 | p4) + default 'p3'
 *   - team_id FK (nullable; only set for l10 todos)
 *   - recurrence_rule text (iCalendar RRULE), recurrence_parent_id FK
 *   - parent_todo_id FK, position int (subtask tree)
 *
 * Backfill:
 *   - Every existing todo gets kind='personal', priority='p3'
 *   - Todos with a meeting_id pointing at a leadership-team meeting are
 *     promoted to kind='l10' with team_id copied from the meeting
 *
 * Safe to run on every boot.
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DDL = [
  `DO $$ BEGIN
     CREATE TYPE "public"."todo_kind" AS ENUM ('personal', 'l10');
   EXCEPTION
     WHEN duplicate_object THEN null;
   END $$;`,

  `DO $$ BEGIN
     CREATE TYPE "public"."todo_priority" AS ENUM ('p1', 'p2', 'p3', 'p4');
   EXCEPTION
     WHEN duplicate_object THEN null;
   END $$;`,

  // kind + priority columns (nullable at first so the backfill can run)
  `DO $$ BEGIN
     ALTER TABLE "todos" ADD COLUMN "kind" "todo_kind";
   EXCEPTION WHEN duplicate_column THEN null; END $$;`,

  `DO $$ BEGIN
     ALTER TABLE "todos" ADD COLUMN "priority" "todo_priority";
   EXCEPTION WHEN duplicate_column THEN null; END $$;`,

  `DO $$ BEGIN
     ALTER TABLE "todos" ADD COLUMN "team_id" uuid REFERENCES "teams"("id") ON DELETE SET NULL;
   EXCEPTION WHEN duplicate_column THEN null; END $$;`,

  `DO $$ BEGIN
     ALTER TABLE "todos" ADD COLUMN "recurrence_rule" text;
   EXCEPTION WHEN duplicate_column THEN null; END $$;`,

  `DO $$ BEGIN
     ALTER TABLE "todos" ADD COLUMN "recurrence_parent_id" uuid REFERENCES "todos"("id") ON DELETE SET NULL;
   EXCEPTION WHEN duplicate_column THEN null; END $$;`,

  `DO $$ BEGIN
     ALTER TABLE "todos" ADD COLUMN "parent_todo_id" uuid REFERENCES "todos"("id") ON DELETE CASCADE;
   EXCEPTION WHEN duplicate_column THEN null; END $$;`,

  `DO $$ BEGIN
     ALTER TABLE "todos" ADD COLUMN "position" integer NOT NULL DEFAULT 0;
   EXCEPTION WHEN duplicate_column THEN null; END $$;`,

  // Delegation / verification columns (all nullable; normal todos leave null).
  `DO $$ BEGIN
     ALTER TABLE "todos" ADD COLUMN "delegator_entity_type" "owner_entity_type";
   EXCEPTION WHEN duplicate_column THEN null; END $$;`,

  `DO $$ BEGIN
     ALTER TABLE "todos" ADD COLUMN "delegator_external_id" varchar(120);
   EXCEPTION WHEN duplicate_column THEN null; END $$;`,

  `DO $$ BEGIN
     ALTER TABLE "todos" ADD COLUMN "delegator_name" varchar(255);
   EXCEPTION WHEN duplicate_column THEN null; END $$;`,

  `DO $$ BEGIN
     ALTER TABLE "todos" ADD COLUMN "verified_at" timestamp;
   EXCEPTION WHEN duplicate_column THEN null; END $$;`,

  `DO $$ BEGIN
     ALTER TABLE "todos" ADD COLUMN "verified_by" varchar(255);
   EXCEPTION WHEN duplicate_column THEN null; END $$;`,

  // Backfill kind: anything tied to a leadership-team meeting becomes l10.
  // Everything else defaults to personal. Idempotent on the WHERE clause.
  `UPDATE "todos" t SET "kind" = 'l10', "team_id" = m."team_id"
     FROM "meetings" m JOIN "teams" tm ON tm."id" = m."team_id"
     WHERE t."kind" IS NULL
       AND t."meeting_id" = m."id"
       AND tm."slug" = 'leadership';`,

  `UPDATE "todos" SET "kind" = 'personal' WHERE "kind" IS NULL;`,
  `UPDATE "todos" SET "priority" = 'p3' WHERE "priority" IS NULL;`,

  // Now that every row has a value, tighten constraints.
  `ALTER TABLE "todos" ALTER COLUMN "kind" SET NOT NULL;`,
  `ALTER TABLE "todos" ALTER COLUMN "kind" SET DEFAULT 'personal';`,
  `ALTER TABLE "todos" ALTER COLUMN "priority" SET NOT NULL;`,
  `ALTER TABLE "todos" ALTER COLUMN "priority" SET DEFAULT 'p3';`,

  // Indexes for the new query patterns.
  `CREATE INDEX IF NOT EXISTS "todos_kind_owner_idx"
     ON "todos" ("organization_id", "kind", "owner_external_id");`,
  `CREATE INDEX IF NOT EXISTS "todos_kind_team_idx"
     ON "todos" ("organization_id", "kind", "team_id");`,
  `CREATE INDEX IF NOT EXISTS "todos_parent_idx"
     ON "todos" ("parent_todo_id", "position");`,
  `CREATE INDEX IF NOT EXISTS "todos_recurrence_parent_idx"
     ON "todos" ("recurrence_parent_id");`,
  `CREATE INDEX IF NOT EXISTS "todos_delegator_idx"
     ON "todos" ("organization_id", "delegator_external_id");`,
];

export async function ensureTodosV2(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }
}
