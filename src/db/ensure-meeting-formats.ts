/**
 * Idempotent boot-time migration for the meeting_formats table (custom meeting
 * formats). Same self-healing pattern as ensure-partner-signups.ts.
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DDL = [
  `CREATE TABLE IF NOT EXISTS "meeting_formats" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
     "org_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
     "created_by" varchar(255),
     "name" varchar(255) NOT NULL,
     "description" text,
     "structure" jsonb DEFAULT '[]'::jsonb NOT NULL,
     "visibility" varchar(20) DEFAULT 'org' NOT NULL,
     "source_listing_id" uuid,
     "created_at" timestamp DEFAULT now() NOT NULL,
     "updated_at" timestamp DEFAULT now() NOT NULL,
     "deleted_at" timestamp
   );`,
  `CREATE INDEX IF NOT EXISTS "meeting_formats_org_idx" ON "meeting_formats" ("org_id");`,
  `CREATE INDEX IF NOT EXISTS "meeting_formats_org_vis_idx" ON "meeting_formats" ("org_id","visibility");`,
];

export async function ensureMeetingFormatsTable(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }
}
