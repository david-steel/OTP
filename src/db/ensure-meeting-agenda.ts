/**
 * Idempotent boot-time migration: agenda columns on meetings for custom formats.
 * Same self-healing pattern as ensure-partner-signups.ts (Drizzle migrate is
 * broken in this repo). Safe to run on every boot.
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DDL = [
  `ALTER TABLE "meetings" ADD COLUMN IF NOT EXISTS "agenda" jsonb;`,
  `ALTER TABLE "meetings" ADD COLUMN IF NOT EXISTS "format_id" uuid;`,
  `ALTER TABLE "meetings" ADD COLUMN IF NOT EXISTS "run_state" jsonb;`,
];

export async function ensureMeetingAgendaColumns(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }
}
