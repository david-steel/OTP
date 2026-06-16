/**
 * Idempotent boot-time migration: auto_end_at column on meetings.
 * Same self-healing pattern as ensure-meeting-agenda.ts (Drizzle migrate is
 * broken in this repo). Safe to run on every boot.
 *
 * auto_end_at backs the 1-hour auto-end safety net: a meeting started but never
 * ended is auto-completed once it passes this deadline. See
 * services/meeting-lifecycle.ts.
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DDL = [
  `ALTER TABLE "meetings" ADD COLUMN IF NOT EXISTS "auto_end_at" timestamp;`,
];

export async function ensureMeetingAutoEndColumn(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }
}
