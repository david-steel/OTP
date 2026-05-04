/**
 * Idempotent boot-time migration for the improvements table.
 * Same pattern as ensure-partner-signups.ts. Safe to run on every boot.
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DDL = [
  `DO $$ BEGIN
     CREATE TYPE "public"."improvement_status" AS ENUM('idea', 'in_progress', 'completed', 'wont_do');
   EXCEPTION
     WHEN duplicate_object THEN null;
   END $$;`,

  `DO $$ BEGIN
     CREATE TYPE "public"."improvement_priority" AS ENUM('low', 'medium', 'high');
   EXCEPTION
     WHEN duplicate_object THEN null;
   END $$;`,

  `CREATE TABLE IF NOT EXISTS "improvements" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
     "title" varchar(255) NOT NULL,
     "description" text,
     "notes" text,
     "status" "improvement_status" DEFAULT 'idea' NOT NULL,
     "priority" "improvement_priority" DEFAULT 'medium' NOT NULL,
     "source" varchar(120),
     "created_at" timestamp DEFAULT now() NOT NULL,
     "updated_at" timestamp DEFAULT now() NOT NULL,
     "completed_at" timestamp
   );`,

  `CREATE INDEX IF NOT EXISTS "imp_status_idx" ON "improvements" ("status");`,
  `CREATE INDEX IF NOT EXISTS "imp_priority_idx" ON "improvements" ("priority");`,
  `CREATE INDEX IF NOT EXISTS "imp_created_idx" ON "improvements" ("created_at");`,
];

export async function ensureImprovementsTable(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }
}
