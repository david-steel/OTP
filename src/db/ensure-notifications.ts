// In-app notifications (the nav alert bell). Created at boot because
// Drizzle migrate is broken in this repo; schema self-heals (same pattern
// as ensure-kpis-rocks-team.ts). Recipients are chart seats
// (recipient_external_id), resolved to signed-in users via
// org_members.claimed_entity_ids at read time.
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DDL = [
  `CREATE TABLE IF NOT EXISTS "notifications" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
     "recipient_external_id" varchar(120) NOT NULL,
     "type" varchar(60) NOT NULL,
     "title" varchar(500) NOT NULL,
     "href" varchar(500),
     "actor_name" varchar(255),
     "read_at" timestamp,
     "created_at" timestamp NOT NULL DEFAULT now()
   );`,
  `CREATE INDEX IF NOT EXISTS "notif_recipient_idx"
     ON "notifications" ("organization_id", "recipient_external_id", "read_at");`,
  `CREATE INDEX IF NOT EXISTS "notif_created_idx"
     ON "notifications" ("organization_id", "created_at");`,
];

export async function ensureNotifications(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }
}
