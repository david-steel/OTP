/**
 * Idempotent boot-time migration for the marketplace (partner channel) tables.
 *
 * Same self-healing pattern as ensure-partner-signups.ts: the Drizzle migration
 * history has drift, so the marketplace DDL ships as a block that runs on every
 * boot. Every statement is IF NOT EXISTS or duplicate_object-guarded, so it is a
 * no-op after the first successful run.
 *
 * Tables:
 *   marketplace_partners  -- a seller's payout identity (Stripe Connect account)
 *   marketplace_listings  -- sellable agents / integrations / content packs
 *   marketplace_installs  -- one org adopting one listing (subscription + provision)
 *
 * The whole surface is gated OFF behind MARKETPLACE_LIVE (shared/marketplace-gate.ts)
 * until there are users and Connect onboarding is wired. Creating the tables early
 * is harmless -- they stay empty and unreferenced while the flag is off.
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DDL = [
  // ---- enums ----
  `DO $$ BEGIN
     CREATE TYPE "public"."marketplace_listing_type" AS ENUM('agent', 'integration', 'content_pack');
   EXCEPTION WHEN duplicate_object THEN null; END $$;`,

  `DO $$ BEGIN
     CREATE TYPE "public"."marketplace_listing_status" AS ENUM('draft', 'submitted', 'approved', 'published', 'rejected', 'suspended');
   EXCEPTION WHEN duplicate_object THEN null; END $$;`,

  `DO $$ BEGIN
     CREATE TYPE "public"."marketplace_pricing_model" AS ENUM('free', 'subscription');
   EXCEPTION WHEN duplicate_object THEN null; END $$;`,

  `DO $$ BEGIN
     CREATE TYPE "public"."marketplace_connect_status" AS ENUM('not_started', 'onboarding', 'active', 'restricted');
   EXCEPTION WHEN duplicate_object THEN null; END $$;`,

  // ---- marketplace_partners ----
  `CREATE TABLE IF NOT EXISTS "marketplace_partners" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
     "org_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
     "display_name" varchar(255),
     "support_email" varchar(255),
     "website_url" text,
     "stripe_connect_account_id" varchar(255),
     "connect_status" "marketplace_connect_status" DEFAULT 'not_started' NOT NULL,
     "payouts_enabled" boolean DEFAULT false NOT NULL,
     "created_at" timestamp DEFAULT now() NOT NULL,
     "updated_at" timestamp DEFAULT now() NOT NULL
   );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "mkp_partner_org_idx" ON "marketplace_partners" ("org_id");`,
  `CREATE INDEX IF NOT EXISTS "mkp_partner_connect_idx" ON "marketplace_partners" ("stripe_connect_account_id");`,

  // ---- marketplace_listings ----
  `CREATE TABLE IF NOT EXISTS "marketplace_listings" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
     "partner_org_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
     "slug" varchar(255) NOT NULL UNIQUE,
     "name" varchar(255) NOT NULL,
     "tagline" varchar(255),
     "description" text,
     "listing_type" "marketplace_listing_type" NOT NULL,
     "status" "marketplace_listing_status" DEFAULT 'draft' NOT NULL,
     "icon_url" text,
     "expertise_tags" text[],
     "pricing_model" "marketplace_pricing_model" DEFAULT 'subscription' NOT NULL,
     "price_monthly_cents" integer,
     "price_yearly_cents" integer,
     "currency" varchar(3) DEFAULT 'usd' NOT NULL,
     "stripe_product_id" varchar(255),
     "stripe_price_monthly_id" varchar(255),
     "stripe_price_yearly_id" varchar(255),
     "agent_template_md" text,
     "mcp_endpoint_url" text,
     "content_payload" jsonb,
     "frontmatter" jsonb DEFAULT '{}'::jsonb NOT NULL,
     "install_count" integer DEFAULT 0 NOT NULL,
     "admin_notes" text,
     "submitted_at" timestamp,
     "approved_at" timestamp,
     "rejected_at" timestamp,
     "published_at" timestamp,
     "created_at" timestamp DEFAULT now() NOT NULL,
     "updated_at" timestamp DEFAULT now() NOT NULL,
     "deleted_at" timestamp
   );`,
  `CREATE INDEX IF NOT EXISTS "mkl_partner_idx" ON "marketplace_listings" ("partner_org_id");`,
  `CREATE INDEX IF NOT EXISTS "mkl_status_idx" ON "marketplace_listings" ("status");`,
  `CREATE INDEX IF NOT EXISTS "mkl_type_idx" ON "marketplace_listings" ("listing_type");`,
  `CREATE INDEX IF NOT EXISTS "mkl_published_idx" ON "marketplace_listings" ("status","published_at");`,

  // ---- marketplace_installs ----
  `CREATE TABLE IF NOT EXISTS "marketplace_installs" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
     "listing_id" uuid NOT NULL REFERENCES "marketplace_listings"("id") ON DELETE CASCADE,
     "org_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
     "installed_by_user_id" varchar(255),
     "status" varchar(20) DEFAULT 'active' NOT NULL,
     "stripe_subscription_id" varchar(255),
     "provisioned_agent_id" uuid REFERENCES "manager_agents"("id") ON DELETE SET NULL,
     "installed_at" timestamp DEFAULT now() NOT NULL,
     "cancelled_at" timestamp,
     "created_at" timestamp DEFAULT now() NOT NULL,
     "updated_at" timestamp DEFAULT now() NOT NULL
   );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "mki_listing_org_idx" ON "marketplace_installs" ("listing_id","org_id");`,
  `CREATE INDEX IF NOT EXISTS "mki_org_idx" ON "marketplace_installs" ("org_id");`,
  `CREATE INDEX IF NOT EXISTS "mki_listing_idx" ON "marketplace_installs" ("listing_id");`,
];

export async function ensureMarketplaceTables(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }
}
