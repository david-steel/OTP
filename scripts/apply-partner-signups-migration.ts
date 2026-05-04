/**
 * One-shot migration script for partner_signups.
 *
 * The schema has months of accumulated drift between schema.ts and the live DB,
 * which means `drizzle-kit migrate` rolls everything up and fails on pre-existing
 * columns (e.g. api_keys.use_count). This script applies ONLY the partner-related
 * DDL so the partners feature can ship without touching unrelated drift.
 *
 * Run with: npx tsx scripts/apply-partner-signups-migration.ts
 */
import { db } from '../src/config/database.js';
import { sql } from 'drizzle-orm';

const statements = [
  `DO $$ BEGIN
     CREATE TYPE "public"."partner_status" AS ENUM('pending', 'reviewing', 'approved', 'declined', 'onboarded');
   EXCEPTION
     WHEN duplicate_object THEN null;
   END $$;`,

  `DO $$ BEGIN
     CREATE TYPE "public"."partner_tier" AS ENUM('founding_partner', 'certified_integrator', 'master_integrator');
   EXCEPTION
     WHEN duplicate_object THEN null;
   END $$;`,

  `CREATE TABLE IF NOT EXISTS "partner_signups" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
     "company_name" varchar(255) NOT NULL,
     "full_name" varchar(200) NOT NULL,
     "email" varchar(255) NOT NULL,
     "title" varchar(255),
     "linkedin_url" varchar(500),
     "channels" jsonb DEFAULT '[]'::jsonb NOT NULL,
     "other_channel" varchar(500),
     "client_count_range" varchar(50),
     "fit_note" text,
     "source" varchar(50) DEFAULT 'partners-page' NOT NULL,
     "status" "partner_status" DEFAULT 'pending' NOT NULL,
     "tier" "partner_tier",
     "reviewed_at" timestamp,
     "approved_at" timestamp,
     "declined_at" timestamp,
     "onboarded_at" timestamp,
     "admin_notes" text,
     "created_at" timestamp DEFAULT now() NOT NULL,
     "updated_at" timestamp DEFAULT now() NOT NULL
   );`,

  `CREATE UNIQUE INDEX IF NOT EXISTS "ps_email_company_idx" ON "partner_signups" ("email","company_name");`,
  `CREATE INDEX IF NOT EXISTS "ps_email_idx" ON "partner_signups" ("email");`,
  `CREATE INDEX IF NOT EXISTS "ps_status_idx" ON "partner_signups" ("status");`,
  `CREATE INDEX IF NOT EXISTS "ps_tier_idx" ON "partner_signups" ("tier");`,
  `CREATE INDEX IF NOT EXISTS "ps_created_idx" ON "partner_signups" ("created_at");`,
  `CREATE INDEX IF NOT EXISTS "ps_source_idx" ON "partner_signups" ("source");`,
];

(async () => {
  console.log('[partner_signups] Applying migration...');
  for (const stmt of statements) {
    const preview = stmt.split('\n')[0]?.slice(0, 80) ?? '';
    console.log('  ->', preview);
    await db.execute(sql.raw(stmt));
  }
  console.log('[partner_signups] Done.');
  process.exit(0);
})().catch((err) => {
  console.error('[partner_signups] FAILED:', err);
  process.exit(1);
});
