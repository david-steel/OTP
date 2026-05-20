/**
 * Idempotent boot-time migration for the conversion_log table.
 *
 * Audit + retry trail for Google Ads server-side conversion uploads.
 * Every upload attempt (success / partial / failed / disabled) lands
 * here so that we can:
 *   - retry failed uploads later (Google accepts offline conversions
 *     for up to 90 days),
 *   - prove idempotency (one Clerk user = at most one successful SIGNUP
 *     conversion, enforced by checking this table before firing),
 *   - debug a polluted conversion number in Google Ads against the
 *     ground-truth Clerk user list.
 *
 * Self-healing on boot per memory feedback_otp_schema_must_self_heal.md;
 * the canonical drizzle schema mirror is in src/db/schema.ts.
 *
 * See: src/lib/google-ads-conversions.ts (the upload library)
 *      src/routes/pages/onboarding.ts (the firing point)
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DDL = [
  `CREATE TABLE IF NOT EXISTS "conversion_log" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
     "created_at" timestamp DEFAULT now() NOT NULL,
     "clerk_user_id" varchar(255) NOT NULL,
     "conversion_action_id" varchar(64) NOT NULL,
     "gclid" varchar(512),
     "gbraid" varchar(512),
     "wbraid" varchar(512),
     "value" real,
     "currency" varchar(8) DEFAULT 'USD',
     "status" varchar(24) NOT NULL,
     "error_message" text,
     "raw_response" jsonb
   );`,

  `CREATE INDEX IF NOT EXISTS "conversion_log_clerk_user_idx"
     ON "conversion_log" ("clerk_user_id");`,
  `CREATE INDEX IF NOT EXISTS "conversion_log_status_idx"
     ON "conversion_log" ("status");`,
  `CREATE INDEX IF NOT EXISTS "conversion_log_created_at_idx"
     ON "conversion_log" ("created_at");`,
];

export async function ensureConversionLogTable(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }
}
