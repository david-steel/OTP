// Web push subscriptions (browser endpoints for the alert bell's native
// notifications). Boot DDL, same pattern as ensure-notifications.ts.
// One row per browser endpoint; a user can hold several (laptop, phone).
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DDL = [
  `CREATE TABLE IF NOT EXISTS "push_subscriptions" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
     "clerk_user_id" varchar(255) NOT NULL,
     "endpoint" text NOT NULL,
     "p256dh" varchar(255) NOT NULL,
     "auth" varchar(255) NOT NULL,
     "user_agent" varchar(500),
     "created_at" timestamp NOT NULL DEFAULT now(),
     "last_used_at" timestamp
   );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "push_subs_endpoint_uk"
     ON "push_subscriptions" ("endpoint");`,
  `CREATE INDEX IF NOT EXISTS "push_subs_org_user_idx"
     ON "push_subscriptions" ("organization_id", "clerk_user_id");`,
];

export async function ensurePushSubscriptions(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }
}
