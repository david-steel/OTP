/**
 * Idempotent boot-time migration: scorecard_status column on meetings.
 * Same self-healing pattern as ensure-meeting-auto-end.ts (Drizzle migrate is
 * broken in this repo). Safe to run on every boot.
 *
 * scorecard_status = manual on/off-track overrides keyed by KPI id:
 * { [kpiId]: 'ontrack' | 'offtrack' }. See partials/meeting/scorecard.ejs.
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DDL = [
  `ALTER TABLE "meetings" ADD COLUMN IF NOT EXISTS "scorecard_status" jsonb NOT NULL DEFAULT '{}'::jsonb;`,
];

export async function ensureMeetingScorecardStatusColumn(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }
}
