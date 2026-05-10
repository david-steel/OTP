/**
 * Idempotent boot-time migration for the coach directory.
 *
 *   1. Adds 7 columns to consultant_profiles for unclaimed/scraped directory entries:
 *        - claimed (boolean)             - has the coach claimed this profile?
 *        - directory_source (varchar)    - e.g. "eosworldwide"
 *        - directory_source_id (varchar) - original ID on the source (e.g. WP post id)
 *        - phone (varchar)
 *        - tier (varchar)                - Expert / Professional / Base
 *        - geo_city, geo_state, geo_country (varchar)
 *
 *   2. Creates the seed "Directory" organization that anchors unclaimed profiles.
 *      Its clerk_org_id is synthetic ('directory_root') because no Clerk org backs it.
 *      When a coach claims their profile, we re-parent it to a fresh org.
 *
 * Same pattern as ensure-improvements.ts. Safe to run on every boot.
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DDL = [
  `ALTER TABLE "consultant_profiles" ADD COLUMN IF NOT EXISTS "claimed" boolean NOT NULL DEFAULT false;`,
  `ALTER TABLE "consultant_profiles" ADD COLUMN IF NOT EXISTS "directory_source" varchar(80);`,
  `ALTER TABLE "consultant_profiles" ADD COLUMN IF NOT EXISTS "directory_source_id" varchar(120);`,
  `ALTER TABLE "consultant_profiles" ADD COLUMN IF NOT EXISTS "phone" varchar(60);`,
  `ALTER TABLE "consultant_profiles" ADD COLUMN IF NOT EXISTS "tier" varchar(60);`,
  `ALTER TABLE "consultant_profiles" ADD COLUMN IF NOT EXISTS "geo_city" varchar(120);`,
  `ALTER TABLE "consultant_profiles" ADD COLUMN IF NOT EXISTS "geo_state" varchar(120);`,
  `ALTER TABLE "consultant_profiles" ADD COLUMN IF NOT EXISTS "geo_country" varchar(120);`,

  `CREATE INDEX IF NOT EXISTS "cp_claimed_idx" ON "consultant_profiles" ("claimed");`,
  `CREATE INDEX IF NOT EXISTS "cp_directory_source_idx" ON "consultant_profiles" ("directory_source");`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "cp_directory_source_id_uniq" ON "consultant_profiles" ("directory_source", "directory_source_id") WHERE "directory_source" IS NOT NULL AND "directory_source_id" IS NOT NULL;`,
  `CREATE INDEX IF NOT EXISTS "cp_geo_city_idx" ON "consultant_profiles" ("geo_city");`,
  `CREATE INDEX IF NOT EXISTS "cp_geo_country_idx" ON "consultant_profiles" ("geo_country");`,
];

const DIRECTORY_CLERK_ID = 'directory_root';

export async function ensureCoachDirectory(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }

  // Seed the umbrella Directory org if missing.
  await db.execute(sql`
    INSERT INTO organizations (name, industry, size, clerk_org_id, public, description)
    VALUES (
      'OTP Coach Directory',
      'Consulting',
      'large',
      ${DIRECTORY_CLERK_ID},
      false,
      'Umbrella organization for unclaimed coach profiles seeded from public directories. When a coach claims their profile, it is re-parented to a fresh org owned by them.'
    )
    ON CONFLICT (clerk_org_id) DO NOTHING
  `);
}

export async function getDirectoryOrgId(): Promise<string> {
  const res = await db.execute(sql`
    SELECT id FROM organizations WHERE clerk_org_id = ${DIRECTORY_CLERK_ID} LIMIT 1
  `) as any;
  const row = (res.rows || [])[0];
  if (!row) throw new Error('Directory org not seeded -- run ensureCoachDirectory() first');
  return row.id as string;
}
