/**
 * Idempotent boot-time migration: subscriptions storage.
 *
 * Scaffolding for per-agent Stripe billing (humans free; $12/agent/mo, $16 if
 * the org has API keys). Rows are populated by a future Stripe webhook and are
 * unused at runtime until BILLING_ENABLED.
 *
 * Safe to run on every boot.
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DDL = [
  `CREATE TABLE IF NOT EXISTS "subscriptions" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "org_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
      "stripe_customer_id" varchar(255),
      "stripe_subscription_id" varchar(255),
      "status" varchar(40) NOT NULL DEFAULT 'none',
      "plan_rate" integer,
      "agent_quantity" integer,
      "current_period_end" timestamp,
      "created_at" timestamp NOT NULL DEFAULT now(),
      "updated_at" timestamp NOT NULL DEFAULT now()
   );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "subscriptions_org_idx" ON "subscriptions" ("org_id");`,
  `CREATE INDEX IF NOT EXISTS "subscriptions_stripe_sub_idx" ON "subscriptions" ("stripe_subscription_id");`,
];

export async function ensureSubscriptionsTable(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }
}
