/**
 * Monetization Phase 2 boot DDL: org_wallets + wallet_ledger + org_entitlements.
 *
 * MONEY-SENSITIVE. All amounts are integer CENTS. Idempotent, safe to run on
 * every boot. Drizzle migrate is broken on this project (schema drift), so the
 * three tables self-heal on boot, mirroring ensure-subscriptions.ts /
 * ensure-org-privacy.ts. Keep the raw DDL here in sync with the pgTable defs in
 * schema.ts (orgWallets / walletLedger / orgEntitlements).
 *
 *  - org_wallets:      prepaid balance + auto-recharge config, 1 row per org.
 *  - wallet_ledger:    append-only credit/debit log. amount_cents is always
 *                      positive; `direction` conveys sign. balance_after_cents
 *                      stamped per row. idempotency_key UNIQUE (nullable) so a
 *                      retried credit/debit returns the prior result, never
 *                      double-applies.
 *  - org_entitlements: plan_tier + addons + feature_flags (the hasEntitlement
 *                      chokepoint reads this).
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DDL: string[] = [
  `CREATE TABLE IF NOT EXISTS "org_wallets" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "org_id" uuid NOT NULL UNIQUE REFERENCES "organizations"("id") ON DELETE CASCADE,
      "balance_cents" integer NOT NULL DEFAULT 0,
      "currency" varchar(3) NOT NULL DEFAULT 'usd',
      "auto_recharge_enabled" boolean NOT NULL DEFAULT false,
      "auto_recharge_amount_cents" integer,
      "auto_recharge_threshold_cents" integer,
      "stripe_customer_id" varchar(255),
      "created_at" timestamp NOT NULL DEFAULT now(),
      "updated_at" timestamp NOT NULL DEFAULT now()
   );`,
  `CREATE INDEX IF NOT EXISTS "org_wallets_org_idx" ON "org_wallets" ("org_id");`,

  `CREATE TABLE IF NOT EXISTS "wallet_ledger" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "org_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
      "direction" varchar(8) NOT NULL,
      "amount_cents" integer NOT NULL,
      "balance_after_cents" integer NOT NULL,
      "reason" varchar(32) NOT NULL,
      "idempotency_key" varchar(120) UNIQUE,
      "metadata" jsonb,
      "created_by" varchar(255),
      "created_at" timestamp NOT NULL DEFAULT now()
   );`,
  `CREATE INDEX IF NOT EXISTS "wallet_ledger_org_time_idx" ON "wallet_ledger" ("org_id", "created_at" DESC);`,

  `CREATE TABLE IF NOT EXISTS "org_entitlements" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "org_id" uuid NOT NULL UNIQUE REFERENCES "organizations"("id") ON DELETE CASCADE,
      "plan_tier" varchar(32) NOT NULL DEFAULT 'free',
      "addons" jsonb NOT NULL DEFAULT '[]'::jsonb,
      "feature_flags" jsonb NOT NULL DEFAULT '{}'::jsonb,
      "created_at" timestamp NOT NULL DEFAULT now(),
      "updated_at" timestamp NOT NULL DEFAULT now()
   );`,
  `CREATE INDEX IF NOT EXISTS "org_entitlements_org_idx" ON "org_entitlements" ("org_id");`,
];

export async function ensureWalletsTables(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }
}
