/**
 * Phase 4.6: create org_members and org_invitations tables.
 * Idempotent (uses IF NOT EXISTS).
 *
 * Usage: railway run -- npx tsx scripts/apply-membership-tables.ts
 */

import { db } from '../src/config/database.js';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Creating membership enums and tables...\n');

  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE org_member_role AS ENUM ('owner', 'member');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `);
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE org_member_status AS ENUM ('active', 'revoked');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `);
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE org_invitation_status AS ENUM ('pending', 'accepted', 'revoked', 'expired');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS org_members (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      clerk_user_id varchar(255) NOT NULL,
      role org_member_role NOT NULL DEFAULT 'member',
      claimed_entity_id varchar(120),
      status org_member_status NOT NULL DEFAULT 'active',
      invited_by_user_id varchar(255),
      joined_at timestamp NOT NULL DEFAULT now(),
      created_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS org_members_org_user_idx ON org_members(org_id, clerk_user_id)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS org_members_org_idx ON org_members(org_id)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS org_members_user_idx ON org_members(clerk_user_id)`);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS org_invitations (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      email varchar(200) NOT NULL,
      role org_member_role NOT NULL DEFAULT 'member',
      claimed_entity_id varchar(120),
      token_hash varchar(100) NOT NULL,
      expires_at timestamp NOT NULL,
      created_by_user_id varchar(255) NOT NULL,
      status org_invitation_status NOT NULL DEFAULT 'pending',
      accepted_at timestamp,
      accepted_by_user_id varchar(255),
      created_at timestamp NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS org_invitations_token_idx ON org_invitations(token_hash)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS org_invitations_org_idx ON org_invitations(org_id)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS org_invitations_status_idx ON org_invitations(status)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS org_invitations_email_idx ON org_invitations(email)`);

  // Seed: every org's clerkOrgId becomes the owner row in org_members so existing
  // owners do not lose access when permissions middleware switches over.
  const orgs = await db.execute(sql`SELECT id, clerk_org_id FROM organizations WHERE clerk_org_id IS NOT NULL`);
  let seeded = 0;
  for (const row of (orgs.rows as any[])) {
    if (!row.clerk_org_id) continue;
    if (String(row.clerk_org_id).startsWith('template_') || String(row.clerk_org_id).startsWith('seed_')) continue;
    const inserted = await db.execute(sql`
      INSERT INTO org_members (org_id, clerk_user_id, role, status)
      VALUES (${row.id}, ${row.clerk_org_id}, 'owner', 'active')
      ON CONFLICT (org_id, clerk_user_id) DO NOTHING
      RETURNING id
    `);
    if ((inserted.rows as any[]).length > 0) seeded++;
  }
  console.log(`Seeded ${seeded} owner row(s) into org_members.`);

  console.log('Done.');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
