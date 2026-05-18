/**
 * Shared KPI support -- adds kpis.shared_group_id.
 *
 * A shared KPI is one metric assigned to several people: each person has
 * their own kpis row (own owner, own goal, own values), and every member
 * of the same shared KPI carries the same shared_group_id. The scorecard
 * sums the members into one rolled-up line. NULL = an ordinary KPI.
 *
 * Idempotent ADD COLUMN -- drizzle migrate is not used.
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DDL: string[] = [
  `ALTER TABLE "kpis" ADD COLUMN IF NOT EXISTS "shared_group_id" uuid;`,
  `CREATE INDEX IF NOT EXISTS "kpis_shared_group_idx" ON "kpis" ("organization_id", "shared_group_id");`,
];

export async function ensureKpiSharedGroupColumn(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }
}
