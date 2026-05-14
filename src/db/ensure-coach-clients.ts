/**
 * Idempotent boot-time migration for the coach-client ecosystem (Phase 2).
 *
 *   1. Adds `invite_token` column to consultant_profiles so each claimed
 *      coach gets a stable shareable link they can send their clients.
 *
 *   2. Creates `coach_client_attribution` -- IMMUTABLE record of which
 *      coach earns commission on a given client org. Survives access
 *      revocation. Like GHL's agency attribution model: client can fire
 *      the coach but the coach keeps the commission line in perpetuity.
 *
 *   3. Creates `coach_client_access` -- REVOCABLE permission for coach
 *      to view a client's workspace. Client can flip this off at any
 *      time. Different lifecycle from attribution.
 *
 * Same pattern as ensure-coach-directory.ts. Safe to run on every boot.
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DDL = [
  // -- Per-coach shareable invite token on consultant_profiles -----------
  `ALTER TABLE "consultant_profiles" ADD COLUMN IF NOT EXISTS "invite_token" varchar(64);`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "cp_invite_token_idx" ON "consultant_profiles" ("invite_token") WHERE "invite_token" IS NOT NULL;`,

  // -- coach_client_attribution: who gets paid commission, immutable -----
  `CREATE TABLE IF NOT EXISTS "coach_client_attribution" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "client_org_id" uuid NOT NULL REFERENCES "organizations"("id"),
    "coach_org_id" uuid NOT NULL REFERENCES "organizations"("id"),
    "coach_profile_id" uuid REFERENCES "consultant_profiles"("id"),
    "attributed_at" timestamp NOT NULL DEFAULT NOW(),
    "attribution_source" varchar(64) NOT NULL DEFAULT 'invite_link',
    "invite_token_used" varchar(64),
    "transferred_from_coach_org_id" uuid REFERENCES "organizations"("id"),
    "transferred_at" timestamp,
    "transferred_by_admin_id" varchar(255),
    "notes" text
  );`,
  // One client = one current attribution. Transfer creates a new row, old
  // row is kept for audit via transferred_from_coach_org_id reference.
  `CREATE UNIQUE INDEX IF NOT EXISTS "cca_client_current_idx" ON "coach_client_attribution" ("client_org_id") WHERE "transferred_at" IS NULL;`,
  `CREATE INDEX IF NOT EXISTS "cca_coach_idx" ON "coach_client_attribution" ("coach_org_id");`,
  `CREATE INDEX IF NOT EXISTS "cca_coach_active_idx" ON "coach_client_attribution" ("coach_org_id") WHERE "transferred_at" IS NULL;`,

  // -- coach_client_access: revocable viewer permission ------------------
  `CREATE TABLE IF NOT EXISTS "coach_client_access" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "client_org_id" uuid NOT NULL REFERENCES "organizations"("id"),
    "coach_org_id" uuid NOT NULL REFERENCES "organizations"("id"),
    "permission_level" varchar(32) NOT NULL DEFAULT 'full_visibility',
    "granted_at" timestamp NOT NULL DEFAULT NOW(),
    "revoked_at" timestamp,
    "revoked_by_user_id" varchar(255)
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "cca_access_pair_idx" ON "coach_client_access" ("client_org_id", "coach_org_id");`,
  `CREATE INDEX IF NOT EXISTS "cca_access_coach_active_idx" ON "coach_client_access" ("coach_org_id") WHERE "revoked_at" IS NULL;`,
];

export async function ensureCoachClientTables(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }
}
