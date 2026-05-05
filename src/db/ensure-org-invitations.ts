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
];

export async function ensureOrgInvitationsExtensions(): Promise<void> {
  for (const stmt of STATIC_DDL) {
    await db.execute(sql.raw(stmt));
  }
}
