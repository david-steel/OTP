// Realtime sync (R0) -- org_events outbox table, created at boot.
// Drizzle migrate is broken in this repo; schema self-heals (same pattern as
// ensure-notifications.ts). The Drizzle def in schema.ts mirrors this DDL so
// the test harness (drizzle-kit push) and typed queries see the same table.
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DDL = [
  `CREATE TABLE IF NOT EXISTS "org_events" (
     "id" bigserial PRIMARY KEY,
     "org_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
     "topic" varchar(40) NOT NULL,
     "team_id" uuid,
     "entity_type" varchar(50) NOT NULL,
     "entity_id" varchar(120),
     "action" varchar(60) NOT NULL,
     "actor_type" varchar(20) NOT NULL DEFAULT 'system',
     "actor_id" varchar(255),
     "payload" jsonb,
     "created_at" timestamp NOT NULL DEFAULT now()
   );`,
  // Replay cursor: WHERE org_id = $ AND id > $last ORDER BY id.
  `CREATE INDEX IF NOT EXISTS "org_events_org_cursor_idx"
     ON "org_events" ("org_id", "id");`,
  // Retention prune scans by age.
  `CREATE INDEX IF NOT EXISTS "org_events_created_idx"
     ON "org_events" ("created_at");`,
];

export async function ensureOrgEvents(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }
}
