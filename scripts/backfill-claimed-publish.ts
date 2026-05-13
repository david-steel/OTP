// One-time backfill for the Founding 25 post-claim UX fix.
//
// Brings already-claimed coach profiles in line with the new behavior shipped
// in `coach-claim.ts`: claimed profiles should be published=true with a
// contact_email populated from their Clerk primary email.
//
// Safe to re-run. Idempotent:
//   - Only sets `published`/`is_published` to true when currently false
//   - Only sets `contact_email` when currently NULL or empty
//   - Skips orgs whose `clerk_org_id` is a seed/template (not user_ or org_ prefix)
//
// Usage:
//   npx tsx scripts/backfill-claimed-publish.ts            # dry-run (default)
//   npx tsx scripts/backfill-claimed-publish.ts --apply    # write changes

import { createClerkClient } from '@clerk/backend';
import { eq, sql } from 'drizzle-orm';
import { db } from '../src/config/database.js';
import { consultantProfiles, organizations } from '../src/db/schema.js';

const APPLY = process.argv.includes('--apply');

async function fetchClerkPrimaryEmail(clerkUserId: string, clerk: ReturnType<typeof createClerkClient>): Promise<string | null> {
  if (!clerkUserId.startsWith('user_')) return null;
  try {
    const user = await clerk.users.getUser(clerkUserId);
    const primary = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId);
    return primary?.emailAddress || user.emailAddresses[0]?.emailAddress || null;
  } catch (err) {
    return null;
  }
}

async function main() {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    console.error('CLERK_SECRET_KEY missing in env');
    process.exit(1);
  }
  const clerk = createClerkClient({ secretKey });

  console.log(`\n=== Backfill claimed-publish ${APPLY ? '(APPLY)' : '(DRY RUN — pass --apply to write)'} ===\n`);

  // All claimed profiles joined to their org to read clerkOrgId
  const rows = await db
    .select({
      profileId: consultantProfiles.id,
      slug: consultantProfiles.slug,
      displayName: consultantProfiles.displayName,
      published: consultantProfiles.published,
      isPublished: consultantProfiles.isPublished,
      contactEmail: consultantProfiles.contactEmail,
      orgId: consultantProfiles.orgId,
      clerkOrgId: organizations.clerkOrgId,
    })
    .from(consultantProfiles)
    .leftJoin(organizations, eq(organizations.id, consultantProfiles.orgId))
    .where(eq(consultantProfiles.claimed, true));

  console.log(`Claimed profiles found: ${rows.length}\n`);

  let publishUpdates = 0;
  let emailUpdates = 0;
  let skippedSeed = 0;
  let skippedNoChange = 0;

  for (const row of rows) {
    const needsPublish = row.published !== true || row.isPublished !== true;
    const needsEmail = !row.contactEmail || row.contactEmail.trim() === '';

    if (!needsPublish && !needsEmail) {
      skippedNoChange += 1;
      console.log(`  [skip-noop]   ${row.slug.padEnd(32)} already published, has contactEmail`);
      continue;
    }

    let clerkEmail: string | null = null;
    if (needsEmail && row.clerkOrgId) {
      if (!row.clerkOrgId.startsWith('user_')) {
        skippedSeed += 1;
        console.log(`  [skip-seed]   ${row.slug.padEnd(32)} clerkOrgId=${row.clerkOrgId} (not a Clerk user)`);
        continue;
      }
      clerkEmail = await fetchClerkPrimaryEmail(row.clerkOrgId, clerk);
    }

    const updates: Record<string, unknown> = {};
    if (needsPublish) {
      updates.published = true;
      updates.isPublished = true;
    }
    if (needsEmail && clerkEmail) {
      updates.contactEmail = clerkEmail;
    }

    const summary = [
      needsPublish ? 'publish=true' : null,
      needsEmail && clerkEmail ? `contactEmail=${clerkEmail}` : null,
      needsEmail && !clerkEmail ? 'contactEmail-skip(no-clerk-email)' : null,
    ].filter(Boolean).join(', ');

    console.log(`  [${APPLY ? 'APPLY' : 'plan '}]      ${row.slug.padEnd(32)} ${summary}`);

    if (Object.keys(updates).length > 0 && APPLY) {
      await db.update(consultantProfiles).set(updates).where(eq(consultantProfiles.id, row.profileId));
    }
    if (needsPublish) publishUpdates += 1;
    if (needsEmail && clerkEmail) emailUpdates += 1;
  }

  console.log(`\n=== Summary ===`);
  console.log(`  Claimed profiles:        ${rows.length}`);
  console.log(`  Would-publish:           ${publishUpdates}`);
  console.log(`  Would-set contactEmail:  ${emailUpdates}`);
  console.log(`  Skipped (seed org):      ${skippedSeed}`);
  console.log(`  Skipped (no-op):         ${skippedNoChange}`);
  console.log(`  Mode: ${APPLY ? 'APPLIED' : 'DRY-RUN'}\n`);

  // Drizzle/pg pool — force-exit so the script returns cleanly
  process.exit(0);
}

main().catch(err => { console.error('FATAL:', err); process.exit(1); });
