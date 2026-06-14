/**
 * Idempotent boot-time migration for the org_lab_optins table (OTP Labs).
 *
 * Same self-healing pattern as ensure-partner-signups.ts. Records which orgs
 * have opted into which beta feature early. The feature catalog itself is in
 * code (shared/lab-features.ts), so nothing here needs to know the feature set.
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DDL = [
  `CREATE TABLE IF NOT EXISTS "org_lab_optins" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
     "org_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
     "feature_key" varchar(80) NOT NULL,
     "enabled" boolean DEFAULT true NOT NULL,
     "opted_in_by" varchar(255),
     "opted_in_at" timestamp DEFAULT now() NOT NULL,
     "updated_at" timestamp DEFAULT now() NOT NULL
   );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "olo_org_feature_idx" ON "org_lab_optins" ("org_id","feature_key");`,
  `CREATE INDEX IF NOT EXISTS "olo_org_idx" ON "org_lab_optins" ("org_id");`,
];

export async function ensureLabOptinsTable(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }
}
