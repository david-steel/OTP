/**
 * meetings.video_link -- Phase 0 of the meeting scheduler (manual paste path).
 *
 * A user-pasted video link (Google Meet / Microsoft Teams / Zoom) that the
 * "Add to calendar" panel surfaces in a copyable block. The user pastes the
 * block into a recurring calendar invite they create themselves in Google
 * Calendar or Microsoft 365 (Outlook). No OAuth, no provider calls -- this is
 * the no-integration path that ships before the connected-calendar build.
 *
 * Drizzle migrate is broken on this project (schema drift), so every schema
 * change self-heals on boot via an ensure-*.ts called from server.ts. This
 * mirrors ensure-meeting-headlines.ts.
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DDL: string[] = [
  `DO $$ BEGIN
     ALTER TABLE "meetings" ADD COLUMN "video_link" varchar(2048);
   EXCEPTION WHEN duplicate_column THEN null; END $$;`,
];

export async function ensureMeetingVideoLinkColumn(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }
}
