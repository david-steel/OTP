/**
 * Idempotent boot-time migration: per-member preferences storage.
 *
 * Adds:
 *   - preferences jsonb NOT NULL DEFAULT '{}' on org_members
 *
 * Lets each org_members row carry arbitrary per-user preferences (UI toggles,
 * notification settings, etc.) without a schema change per preference.
 *
 * Safe to run on every boot.
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DDL = [
  `ALTER TABLE "org_members" ADD COLUMN IF NOT EXISTS "preferences" jsonb NOT NULL DEFAULT '{}'::jsonb;`,
];

export async function ensureOrgMemberPreferencesTable(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }
}
