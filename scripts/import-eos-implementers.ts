/**
 * Idempotent importer: data/eos-implementers.json -> consultant_profiles.
 *
 *  - Each record becomes a row in consultant_profiles, anchored to the seed
 *    "OTP Coach Directory" org (clerk_org_id='directory_root').
 *  - Marked claimed=false, directory_source='eosworldwide', published=true
 *    so they appear at /experts and in the dynamic sitemap.
 *  - Records with hide_from_directory=true are skipped.
 *  - Re-running the script updates existing rows (UPSERT on directory_source +
 *    directory_source_id), but never overwrites a CLAIMED profile.
 *
 * Usage:
 *   DATABASE_URL=... npx tsx scripts/import-eos-implementers.ts
 *   DATABASE_URL=... npx tsx scripts/import-eos-implementers.ts --dry-run
 *   DATABASE_URL=... npx tsx scripts/import-eos-implementers.ts --limit 10
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IN_PATH = path.join(__dirname, '..', 'data', 'eos-implementers.json');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable required');
  process.exit(1);
}

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const LIMIT = (() => {
  const i = args.indexOf('--limit');
  return i >= 0 && args[i + 1] ? parseInt(args[i + 1], 10) : null;
})();

interface ImplementerRow {
  source: string;
  source_id: string;
  slug: string;
  name: string;
  profile_url: string;
  email: string | null;
  phone: string | null;
  photo_url: string | null;
  tagline: string | null;
  bio: string | null;
  bio_text: string | null;
  tier: string | null;
  designation_id: number | null;
  geo_city: string | null;
  geo_state: string | null;
  geo_country: string | null;
  linkedin_url: string | null;
  website_url: string | null;
  key_points: string[];
  intro_video_url: string | null;
  hide_from_directory: boolean;
  modified: string | null;
}

function bioForStorage(row: ImplementerRow): string | null {
  // Use plain text from bio_text for storage. Per Layer 2 design notes:
  // we attribute (link back to the source profile_url) but do not republish
  // long-form copyrighted bios verbatim. Keep first ~280 chars (a tweet's
  // worth) as a teaser; the full bio link is on the profile page.
  if (!row.bio_text) return row.tagline || null;
  const max = 280;
  if (row.bio_text.length <= max) return row.bio_text;
  // Trim on word boundary
  const cut = row.bio_text.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 200 ? cut.slice(0, lastSpace) : cut) + '...';
}

async function main() {
  if (!fs.existsSync(IN_PATH)) {
    console.error(`Missing ${IN_PATH}. Run: npx tsx scripts/scrape-eos-implementers.ts`);
    process.exit(1);
  }
  const records: ImplementerRow[] = JSON.parse(fs.readFileSync(IN_PATH, 'utf8'));
  const visible = records.filter((r) => !r.hide_from_directory);
  const skipped = records.length - visible.length;
  const subset = LIMIT ? visible.slice(0, LIMIT) : visible;
  console.log(`Loaded ${records.length} records (${skipped} hidden, ${visible.length} importable, ${subset.length} to process${DRY_RUN ? ', DRY RUN' : ''})`);

  const pool = new pg.Pool({ connectionString: DATABASE_URL });
  const client = await pool.connect();
  try {
    // Resolve directory org id
    const orgRes = await client.query(
      `SELECT id FROM organizations WHERE clerk_org_id = 'directory_root' LIMIT 1`,
    );
    if (!orgRes.rows[0]) {
      console.error(`Directory org missing. Run server boot once (it runs ensureCoachDirectory) or create it manually.`);
      process.exit(1);
    }
    const directoryOrgId = orgRes.rows[0].id as string;
    console.log(`Directory org id: ${directoryOrgId}`);

    if (DRY_RUN) {
      console.log('DRY RUN: would upsert', subset.length, 'profiles. Sample:');
      for (const r of subset.slice(0, 5)) {
        console.log(' -', r.slug, '|', r.name, '|', r.geo_city || '(no city)', '|', r.email || '(no email)');
      }
      return;
    }

    let inserted = 0;
    let updated = 0;
    let skippedClaimed = 0;
    let conflictedSlug = 0;

    for (const r of subset) {
      // First check: does a row already exist with this directory_source_id?
      const existing = await client.query(
        `SELECT id, claimed, slug FROM consultant_profiles
         WHERE directory_source = $1 AND directory_source_id = $2 LIMIT 1`,
        [r.source, r.source_id],
      );
      const slugForRow = await ensureUniqueSlug(client, r.slug, existing.rows[0]?.id);

      if (existing.rows[0]) {
        if (existing.rows[0].claimed) {
          skippedClaimed++;
          continue; // Never overwrite a claimed profile
        }
        // Update everything except claim status / publish status / org_id
        await client.query(
          `UPDATE consultant_profiles SET
             slug = $1,
             display_name = $2,
             headline = $3,
             bio = $4,
             expertise_tags = $5,
             contact_email = $6,
             linkedin_url = $7,
             photo_url = $8,
             avatar_url = $8,
             phone = $9,
             tier = $10,
             geo_city = $11,
             geo_state = $12,
             geo_country = $13,
             content_source_url = $14,
             last_synced_at = now(),
             updated_at = now()
           WHERE id = $15`,
          [
            slugForRow,
            r.name,
            r.tagline,
            bioForStorage(r),
            r.key_points,
            r.email,
            r.linkedin_url,
            r.photo_url,
            r.phone,
            r.tier,
            r.geo_city,
            r.geo_state,
            r.geo_country,
            r.profile_url,
            existing.rows[0].id,
          ],
        );
        updated++;
      } else {
        try {
          await client.query(
            `INSERT INTO consultant_profiles (
              org_id, slug, display_name, headline, bio, expertise_tags,
              contact_email, linkedin_url, photo_url, avatar_url,
              phone, tier, geo_city, geo_state, geo_country,
              content_source_url, profile_type,
              published, is_published,
              claimed, directory_source, directory_source_id,
              last_synced_at
            ) VALUES (
              $1, $2, $3, $4, $5, $6,
              $7, $8, $9, $9,
              $10, $11, $12, $13, $14,
              $15, 'consultant',
              true, true,
              false, $16, $17,
              now()
            )`,
            [
              directoryOrgId,
              slugForRow,
              r.name,
              r.tagline,
              bioForStorage(r),
              r.key_points,
              r.email,
              r.linkedin_url,
              r.photo_url,
              r.phone,
              r.tier,
              r.geo_city,
              r.geo_state,
              r.geo_country,
              r.profile_url,
              r.source,
              r.source_id,
            ],
          );
          inserted++;
        } catch (err: any) {
          if (err?.code === '23505') {
            // Slug uniqueness collision -- shouldn't happen because of ensureUniqueSlug,
            // but log and skip.
            conflictedSlug++;
            console.warn(`  slug conflict on ${r.slug} (source_id=${r.source_id})`);
          } else {
            throw err;
          }
        }
      }

      if ((inserted + updated) % 50 === 0 && (inserted + updated) > 0) {
        console.log(`  ...${inserted} inserted, ${updated} updated, ${skippedClaimed} skipped (claimed)`);
      }
    }

    console.log(`
=== Import Complete ===
Inserted:        ${inserted}
Updated:         ${updated}
Skipped claimed: ${skippedClaimed}
Slug conflicts:  ${conflictedSlug}
Total processed: ${inserted + updated + skippedClaimed + conflictedSlug}
`);
  } finally {
    client.release();
    await pool.end();
  }
}

/**
 * Returns an unused slug. If the desired slug is free, returns it.
 * Otherwise appends -2, -3, etc. until it finds a free one.
 * Skips checking the row we're updating (self-check via excludeId).
 */
async function ensureUniqueSlug(client: pg.PoolClient, base: string, excludeId?: string): Promise<string> {
  const safe = base.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  let candidate = safe;
  let n = 2;
  while (true) {
    const r = await client.query(
      `SELECT id FROM consultant_profiles WHERE slug = $1 ${excludeId ? 'AND id <> $2' : ''} LIMIT 1`,
      excludeId ? [candidate, excludeId] : [candidate],
    );
    if (r.rows.length === 0) return candidate;
    candidate = `${safe}-${n++}`;
    if (n > 50) throw new Error(`Could not generate unique slug for base ${base}`);
  }
}

main().catch((e) => {
  console.error('IMPORT FAILED:', e);
  process.exit(1);
});
