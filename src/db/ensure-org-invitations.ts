/**
 * Idempotent boot-time migration that EXTENDS the existing org_invitations
 * table (Phase 4.6) with the access-toggle columns Phase 1 added to
 * org_members. When an invitation is accepted, these JSONB blobs copy
 * straight into the new member row, so admins can pre-configure a new
 * employee's feature/data/agent access at invite time.
 *
 * Adds:
 *   display_name    -- pre-fill for org_members.display_name
 *   feature_access  -- JSONB toggle map ({ "view_kpis": true, ... })
 *   data_access     -- JSONB toggle map
 *   agent_access    -- JSONB toggle map (which AI agents the invitee can run)
 *
 * The org_member_role enum was already extended in ensure-org-members.ts,
 * so no enum work needed here.
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const STATIC_DDL: string[] = [
  `ALTER TABLE "org_invitations" ADD COLUMN IF NOT EXISTS "display_name" varchar(255);`,
  `ALTER TABLE "org_invitations" ADD COLUMN IF NOT EXISTS "feature_access" jsonb NOT NULL DEFAULT '{}'::jsonb;`,
  `ALTER TABLE "org_invitations" ADD COLUMN IF NOT EXISTS "data_access" jsonb NOT NULL DEFAULT '{}'::jsonb;`,
  `ALTER TABLE "org_invitations" ADD COLUMN IF NOT EXISTS "agent_access" jsonb NOT NULL DEFAULT '{}'::jsonb;`,
  // Multi-seat: a single human can hold multiple tiles on the org chart.
  // The original claimed_entity_id stays as the "primary" seat for back-compat;
  // claimed_entity_ids carries the full set (including the primary).
  `ALTER TABLE "org_invitations" ADD COLUMN IF NOT EXISTS "claimed_entity_ids" jsonb NOT NULL DEFAULT '[]'::jsonb;`,
  `ALTER TABLE "org_members"     ADD COLUMN IF NOT EXISTS "claimed_entity_ids" jsonb NOT NULL DEFAULT '[]'::jsonb;`,
  // Backfill: any member or invite with a single primary seat gets it
  // mirrored into the array (idempotent: only populate empty arrays).
  `UPDATE "org_members" SET "claimed_entity_ids" = jsonb_build_array("claimed_entity_id")
     WHERE "claimed_entity_id" IS NOT NULL
       AND ("claimed_entity_ids" = '[]'::jsonb OR "claimed_entity_ids" IS NULL);`,
  `UPDATE "org_invitations" SET "claimed_entity_ids" = jsonb_build_array("claimed_entity_id")
     WHERE "claimed_entity_id" IS NOT NULL
       AND ("claimed_entity_ids" = '[]'::jsonb OR "claimed_entity_ids" IS NULL);`,
  // Phase 4: pre-assign teams at invite time. The list of team UUIDs to drop
  // the new member into on accept. Empty array means "no teams" (rare).
  `ALTER TABLE "org_invitations" ADD COLUMN IF NOT EXISTS "team_ids" jsonb NOT NULL DEFAULT '[]'::jsonb;`,
];

export async function ensureOrgInvitationsExtensions(): Promise<void> {
  for (const stmt of STATIC_DDL) {
    await db.execute(sql.raw(stmt));
  }
}
