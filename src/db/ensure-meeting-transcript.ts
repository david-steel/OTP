/**
 * Idempotent boot-time migration: post-meeting record columns on meetings.
 * Same self-healing pattern as ensure-meeting-auto-end.ts (Drizzle migrate is
 * broken in this repo). Safe to run on every boot.
 *
 * transcript    -- pasted/uploaded transcript text (the AI follow-ups wizard reads this)
 * recording_url -- link to the recording (any source)
 * ai_summary    -- the wizard's short meeting summary
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DDL = [
  `ALTER TABLE "meetings" ADD COLUMN IF NOT EXISTS "transcript" text;`,
  `ALTER TABLE "meetings" ADD COLUMN IF NOT EXISTS "recording_url" varchar(2048);`,
  `ALTER TABLE "meetings" ADD COLUMN IF NOT EXISTS "ai_summary" text;`,
];

export async function ensureMeetingTranscriptColumns(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }
}
