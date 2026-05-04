/**
 * Idempotent boot-time migration for the partner_signups table.
 *
 * The Drizzle migration history has accumulated schema drift between
 * schema.ts and the live DB, so `npm run db:migrate` is unreliable here
 * (it tries to add columns that already exist on api_keys, etc.).
 *
 * This file ships the partner program DDL as a self-healing block that
 * runs once on server boot. Every statement uses IF NOT EXISTS or
 * duplicate_object exception handling so it is safe to run on every
 * deploy without effect after the first time.
 *
 * Once the broader schema drift is reconciled, this file can be deleted
 * and the canonical Drizzle migration system can take over.
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DDL = [
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

export async function ensurePartnerSignupsTable(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }
}
