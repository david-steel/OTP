/**
 * Idempotent boot-time migration for the Portfolio feature.
 *
 * A portfolio is itself an organizations row marked kind='portfolio'. Member
 * orgs link to it via portfolio_members. Portfolio super-metrics are ordinary
 * kpis rows in the portfolio org, fed from member-org KPIs via
 * portfolio_metric_sources. A member org can opt a KPI out of rollup with
 * kpis.rollup_excluded. Same pattern as ensure-teams.ts.
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DDL = [
  `ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "kind" varchar(20) NOT NULL DEFAULT 'standard';`,

  `ALTER TABLE "kpis" ADD COLUMN IF NOT EXISTS "rollup_excluded" boolean NOT NULL DEFAULT false;`,

  `CREATE TABLE IF NOT EXISTS "portfolio_members" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
     "portfolio_org_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
     "member_org_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
     "status" varchar(20) NOT NULL DEFAULT 'active',
     "created_at" timestamp NOT NULL DEFAULT now()
   );`,

  `CREATE UNIQUE INDEX IF NOT EXISTS "portfolio_members_uk" ON "portfolio_members" ("portfolio_org_id", "member_org_id");`,
  `CREATE INDEX IF NOT EXISTS "portfolio_members_portfolio_idx" ON "portfolio_members" ("portfolio_org_id");`,

  `CREATE TABLE IF NOT EXISTS "portfolio_metric_sources" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
     "portfolio_kpi_id" uuid NOT NULL REFERENCES "kpis"("id") ON DELETE CASCADE,
     "member_org_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
     "member_kpi_id" uuid NOT NULL REFERENCES "kpis"("id") ON DELETE CASCADE,
     "weight" real NOT NULL DEFAULT 1,
     "created_at" timestamp NOT NULL DEFAULT now()
   );`,

  `CREATE UNIQUE INDEX IF NOT EXISTS "portfolio_metric_sources_uk" ON "portfolio_metric_sources" ("portfolio_kpi_id", "member_org_id", "member_kpi_id");`,
  `CREATE INDEX IF NOT EXISTS "portfolio_metric_sources_kpi_idx" ON "portfolio_metric_sources" ("portfolio_kpi_id");`,
];

export async function ensurePortfolioSchema(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }
}
