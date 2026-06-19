// One-off: verify Joel Swanson's claim state + confirm the new code worked.
import { db } from '../src/config/database.js';
import { consultantProfiles, organizations } from '../src/db/schema.js';
import { eq, sql } from 'drizzle-orm';

async function main() {
  const rows = await db
    .select({
      slug: consultantProfiles.slug,
      displayName: consultantProfiles.displayName,
      claimed: consultantProfiles.claimed,
      published: consultantProfiles.published,
      isPublished: consultantProfiles.isPublished,
      contactEmail: consultantProfiles.contactEmail,
      orgId: consultantProfiles.orgId,
      updatedAt: consultantProfiles.updatedAt,
      clerkOrgId: organizations.clerkOrgId,
      orgName: organizations.name,
    })
    .from(consultantProfiles)
    .leftJoin(organizations, eq(organizations.id, consultantProfiles.orgId))
    .where(eq(consultantProfiles.slug, 'joel-swanson'));

  if (rows.length === 0) {
    console.log('joel-swanson NOT FOUND in consultant_profiles');
    return;
  }
  const p = rows[0] as any;
  console.log('=== Joel Swanson profile state ===');
  console.log(`  slug:         ${p.slug}`);
  console.log(`  displayName:  ${p.displayName}`);
  console.log(`  claimed:      ${p.claimed}        ← should be TRUE`);
  console.log(`  published:    ${p.published}        ← should be TRUE (auto-publish fix)`);
  console.log(`  isPublished:  ${p.isPublished}        ← should be TRUE (auto-publish fix)`);
  console.log(`  contactEmail: ${p.contactEmail}  ← should be his Clerk email`);
  console.log(`  org:          ${p.orgName}`);
  console.log(`  clerkOrgId:   ${p.clerkOrgId}`);
  console.log(`  updatedAt:    ${p.updatedAt}`);

  // Also count all claimed coach profiles now
  const claimed = await db.execute(sql`
    SELECT slug, display_name, claimed, published, contact_email, updated_at
    FROM consultant_profiles
    WHERE claimed = true AND directory_source IS NOT NULL
    ORDER BY updated_at DESC
  `) as any;
  console.log(`\n=== All claimed coach-directory profiles: ${(claimed.rows || []).length} ===`);
  for (const r of (claimed.rows || [])) {
    console.log(`  ${r.slug.padEnd(30)} pub=${r.published} email=${r.contact_email || '(none)'} updated=${r.updated_at}`);
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
