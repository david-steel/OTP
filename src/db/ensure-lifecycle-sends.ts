/**
 * Idempotent boot-time migration for the lifecycle_sends table.
 *
 * One row per (signup, rung) the 90-day lifecycle scheduler has acted on.
 * The unique index on (clerk_user_id, email_n) makes sends idempotent: a rung
 * is never delivered twice to the same user. Skipped rungs are recorded with
 * skipped=true so the scheduler advances past a milestone the user already hit.
 *
 * Self-healing on boot per memory feedback_otp_schema_must_self_heal.md;
 * the canonical drizzle schema mirror is in src/db/schema.ts (lifecycleSends).
 *
 * See: src/services/lifecycle-scheduler.ts (the sender)
 *      src/data/email-series.ts (the 30-rung curriculum)
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DDL = [
  `CREATE TABLE IF NOT EXISTS "lifecycle_sends" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
     "clerk_user_id" varchar(255) NOT NULL,
     "email_n" integer NOT NULL,
     "skipped" boolean DEFAULT false NOT NULL,
     "sent_at" timestamp DEFAULT now() NOT NULL
   );`,

  `CREATE UNIQUE INDEX IF NOT EXISTS "lifecycle_sends_user_rung_idx"
     ON "lifecycle_sends" ("clerk_user_id", "email_n");`,
  `CREATE INDEX IF NOT EXISTS "lifecycle_sends_user_idx"
     ON "lifecycle_sends" ("clerk_user_id");`,
];

export async function ensureLifecycleSendsTable(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }
}
