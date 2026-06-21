/**
 * Idempotent boot-time migration for the Portfolio "champion invite" flow.
 *
 * A portfolio owner invites ONE champion (a person, by email). On accept, a
 * BRAND-NEW org is created from the portfolio's template, the champion becomes
 * its owner, and the new org is auto-linked into the portfolio. The outstanding
 * tokenized invite lives in portfolio_champion_invites.
 *
 * Distinct from portfolio_members (which links existing orgs). Same
 * CREATE TABLE IF NOT EXISTS idiom as ensure-portfolio.ts / ensure-teams.ts
 * (Drizzle migrate is broken; new tables are created by an ensure-*.ts run at
 * boot from server.ts).
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DDL = [
  `CREATE TABLE IF NOT EXISTS "portfolio_champion_invites" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
     "portfolio_org_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
     "email" varchar(200) NOT NULL,
     "org_name" varchar(255),
     "token" varchar(64) NOT NULL,
     "status" varchar(20) NOT NULL DEFAULT 'pending',
     "invited_by_user_id" varchar(255),
     "created_org_id" uuid REFERENCES "organizations"("id") ON DELETE SET NULL,
     "created_at" timestamp NOT NULL DEFAULT now(),
     "accepted_at" timestamp,
     "expires_at" timestamp,
     "message" text
   );`,

  // Backfill for tables created before these columns existed (idempotent).
  `ALTER TABLE "portfolio_champion_invites" ADD COLUMN IF NOT EXISTS "expires_at" timestamp;`,
  `ALTER TABLE "portfolio_champion_invites" ADD COLUMN IF NOT EXISTS "message" text;`,

  `CREATE UNIQUE INDEX IF NOT EXISTS "portfolio_champion_invites_token_uk" ON "portfolio_champion_invites" ("token");`,
  `CREATE INDEX IF NOT EXISTS "portfolio_champion_invites_portfolio_idx" ON "portfolio_champion_invites" ("portfolio_org_id");`,
];

export async function ensurePortfolioChampionInvitesSchema(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }
}
