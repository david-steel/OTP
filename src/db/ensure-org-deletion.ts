/**
 * Idempotent boot-time migration: two-phase hard-delete columns on organizations.
 * Same self-healing pattern as ensure-meeting-auto-end.ts (Drizzle migrate is
 * broken in this repo). Safe to run on every boot.
 *
 * deletion_requested_at -- when a delete was initiated; null = active org.
 * deletion_requested_by -- Clerk user id of whoever initiated it.
 * Index on deletion_requested_at so the daily purge sweep is cheap.
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DDL = [
  `ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "deletion_requested_at" timestamp;`,
  `ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "deletion_requested_by" varchar(255);`,
  `CREATE INDEX IF NOT EXISTS "org_deletion_requested_idx" ON "organizations" ("deletion_requested_at");`,
];

export async function ensureOrgDeletionColumns(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }
}
