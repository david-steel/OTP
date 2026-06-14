/**
 * Idempotent boot-time migration for the kpi_groups table (KPI group order).
 * Same self-healing pattern as ensure-partner-signups.ts.
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DDL = [
  `CREATE TABLE IF NOT EXISTS "kpi_groups" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
     "org_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
     "name" varchar(120) NOT NULL,
     "sort_order" integer DEFAULT 0 NOT NULL,
     "created_at" timestamp DEFAULT now() NOT NULL,
     "updated_at" timestamp DEFAULT now() NOT NULL
   );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "kpi_groups_org_name_idx" ON "kpi_groups" ("org_id","name");`,
  `CREATE INDEX IF NOT EXISTS "kpi_groups_org_idx" ON "kpi_groups" ("org_id");`,
];

export async function ensureKpiGroupsTable(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }
}
