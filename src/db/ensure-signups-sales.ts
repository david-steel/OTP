/**
 * Idempotent boot-time migration for the onboarding_sequence sales-queue columns.
 *
 * Same self-healing pattern as ensure-partner-signups.ts: the Drizzle migration
 * history has accumulated drift, so we ship the DDL as ADD COLUMN IF NOT EXISTS
 * statements that run once on boot and are no-ops thereafter.
 *
 * These columns power /admin/signups, the sales work queue Dawson uses to work
 * each new signup (new -> contacted -> booked / lost). Added 2026-06-16.
 *
 * Once the broader schema drift is reconciled, this file can be deleted and the
 * canonical Drizzle migration system can take over.
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DDL = [
  `ALTER TABLE "onboarding_sequence" ADD COLUMN IF NOT EXISTS "sales_status" varchar(20) DEFAULT 'new' NOT NULL;`,
  `ALTER TABLE "onboarding_sequence" ADD COLUMN IF NOT EXISTS "sales_status_at" timestamp;`,
  `ALTER TABLE "onboarding_sequence" ADD COLUMN IF NOT EXISTS "sales_notes" text;`,
  `CREATE INDEX IF NOT EXISTS "onb_sales_status_idx" ON "onboarding_sequence" ("sales_status");`,
];

export async function ensureSignupsSalesColumns(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }
}
