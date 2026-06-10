/**
 * meetings.segment_notes -- per-segment scratch pad for the Strategy Reset
 * meeting type.
 *
 * A JSONB map keyed by segment identifier (e.g. "vision", "traction",
 * "issues") storing freeform notes captured during each section of the
 * meeting. Defaults to an empty object so callers can safely merge without
 * null-checks.
 *
 * Drizzle migrate is broken on this project (schema drift), so the column
 * self-heals on boot. Mirrors ensure-meeting-video-link.ts.
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DDL: string[] = [
  `DO $$ BEGIN
     ALTER TABLE "meetings" ADD COLUMN "segment_notes" jsonb NOT NULL DEFAULT '{}'::jsonb;
   EXCEPTION WHEN duplicate_column THEN null; END $$;`,
];

export async function ensureStrategyResetColumns(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }
}
