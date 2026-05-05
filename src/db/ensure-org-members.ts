/**
 * Idempotent boot-time migration that EXTENDS the existing org_members table
 * (created in Phase 4.6) to support Ninety-style roles and access toggles.
 *
 * What it does, all idempotent:
 *   1. Adds new values to org_member_role:
 *        admin, manager, managee, inactive, observer, implementer, free
 *      (existing values 'owner' and 'member' stay; 'member' is deprecated.)
 *   2. Adds new values to org_member_status: invited, suspended, inactive
 *      (existing 'active' and 'revoked' stay.)
 *   3. Adds columns to org_members: email, display_name,
 *        feature_access jsonb, data_access jsonb, agent_access jsonb
 *   4. Adds the (org_id, role) index to speed role-scoped lookups.
 *   5. Backfills: every organization that does not yet have an Owner row
 *      gets one for organizations.clerk_org_id (the seed user).
 *
 * NOTE: Postgres does not support removing values from an enum, so 'member'
 * stays in the type. New code paths default to 'managee'; legacy data is
 * left untouched until a separate migration retypes it.
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const NEW_ROLE_VALUES = [
  'admin', 'manager', 'managee',
  'inactive', 'observer', 'implementer', 'free',
];

const NEW_STATUS_VALUES = ['invited', 'suspended', 'inactive'];

const STATIC_DDL: string[] = [
  // ---- column additions ----
  `ALTER TABLE "org_members" ADD COLUMN IF NOT EXISTS "email" varchar(255);`,
  `ALTER TABLE "org_members" ADD COLUMN IF NOT EXISTS "display_name" varchar(255);`,
  `ALTER TABLE "org_members" ADD COLUMN IF NOT EXISTS "feature_access" jsonb NOT NULL DEFAULT '{}'::jsonb;`,
  `ALTER TABLE "org_members" ADD COLUMN IF NOT EXISTS "data_access" jsonb NOT NULL DEFAULT '{}'::jsonb;`,
  `ALTER TABLE "org_members" ADD COLUMN IF NOT EXISTS "agent_access" jsonb NOT NULL DEFAULT '{}'::jsonb;`,

  // ---- indexes ----
  `CREATE INDEX IF NOT EXISTS "org_members_role_idx" ON "org_members" ("org_id", "role");`,

  // ---- backfill: ensure every org has an Owner row ----
  // Existing orgs created in single-user mode have no org_members row yet;
  // create one for the seed user (organizations.clerk_org_id) as Owner.
  `INSERT INTO "org_members" ("org_id", "clerk_user_id", "role", "status", "joined_at")
   SELECT o."id", o."clerk_org_id", 'owner', 'active', o."created_at"
   FROM "organizations" o
   WHERE NOT EXISTS (
     SELECT 1 FROM "org_members" m
     WHERE m."org_id" = o."id" AND m."role" = 'owner'
   );`,
];

export async function ensureOrgMembersTable(): Promise<void> {
  // Add new role enum values one at a time. Use ADD VALUE IF NOT EXISTS which
  // is supported on Postgres 12+ and is itself idempotent. Each ALTER TYPE
  // must run in its own transaction (Postgres restriction), and node-postgres
  // wraps each db.execute in its own implicit transaction, so this is safe.
  for (const v of NEW_ROLE_VALUES) {
    await db.execute(sql.raw(
      `ALTER TYPE "public"."org_member_role" ADD VALUE IF NOT EXISTS '${v}';`
    ));
  }

  for (const v of NEW_STATUS_VALUES) {
    await db.execute(sql.raw(
      `ALTER TYPE "public"."org_member_status" ADD VALUE IF NOT EXISTS '${v}';`
    ));
  }

  for (const stmt of STATIC_DDL) {
    await db.execute(sql.raw(stmt));
  }
}
