/**
 * meetings recurrence columns -- OTP-owned recurring meeting series.
 *
 *   recurrence_rule       iCal RRULE (FREQ=WEEKLY;BYDAY=TU, etc). null = one-time.
 *   recurrence_parent_id  FK back to the series anchor meeting on every
 *                         generated occurrence. The anchor's is null.
 *
 * When a recurring meeting ends (or on dashboard load), the recurrence service
 * generates the next occurrence: a real meeting row inheriting the series'
 * title-base / type / team / attendees / video link / rule, with
 * recurrence_parent_id pointing at the anchor. So "upcoming meetings" actually
 * exist and the dashboard can list them.
 *
 * Drizzle migrate is broken on this project, so the columns self-heal on boot.
 * Mirrors ensure-meeting-video-link.ts.
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DDL: string[] = [
  `DO $$ BEGIN
     ALTER TABLE "meetings" ADD COLUMN "recurrence_rule" varchar(255);
   EXCEPTION WHEN duplicate_column THEN null; END $$;`,

  `DO $$ BEGIN
     ALTER TABLE "meetings" ADD COLUMN "recurrence_parent_id" uuid;
   EXCEPTION WHEN duplicate_column THEN null; END $$;`,

  // Find a series' occurrences fast (group by anchor).
  `CREATE INDEX IF NOT EXISTS "meetings_recurrence_parent_idx"
     ON "meetings" ("recurrence_parent_id");`,
];

export async function ensureMeetingRecurrenceColumns(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }
}
