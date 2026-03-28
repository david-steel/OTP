/**
 * Seeds a McFadyen Digital publisher profile in the OTP platform.
 * Creates the org (if needed), creates the consultant_profile (if needed),
 * and links all unlinked best_practices rows to the publisher.
 *
 * Usage: DATABASE_URL="..." npx tsx scripts/seed-mcfadyen-publisher.ts
 */

async function seed() {
  const { db } = await import('../src/config/database.js');
  const { organizations, consultantProfiles } = await import('../src/db/schema.js');
  const { eq, sql } = await import('drizzle-orm');

  // ---- Step 1: Organization ----
  const [existingOrg] = await db.select()
    .from(organizations)
    .where(eq(organizations.name, 'McFadyen Digital'))
    .limit(1);

  let orgId: string;

  if (existingOrg) {
    orgId = existingOrg.id;
    console.log(`Org already exists: ${orgId}`);
  } else {
    const [newOrg] = await db.insert(organizations).values({
      name: 'McFadyen Digital',
      industry: 'commerce_technology',
      size: 'large',
      clerkOrgId: 'publisher_mcfadyen_digital',
      badge: 'founding',
    }).returning();
    orgId = newOrg.id;
    console.log(`Created org: ${orgId}`);
  }

  // ---- Step 2: Publisher Profile ----
  const [existingProfile] = await db.select()
    .from(consultantProfiles)
    .where(eq(consultantProfiles.slug, 'mcfadyen-digital'))
    .limit(1);

  let profileId: string;

  if (existingProfile) {
    profileId = existingProfile.id;
    console.log(`Publisher profile already exists: ${profileId}`);
  } else {
    // Use raw SQL to ensure all columns (including those not yet in Drizzle typings at build time) are set
    const result = await db.execute(sql`
      INSERT INTO consultant_profiles (
        org_id,
        profile_type,
        slug,
        display_name,
        headline,
        bio,
        website,
        website_url,
        content_source_url,
        content_count,
        published,
        is_published,
        expertise_tags
      ) VALUES (
        ${orgId},
        'publisher',
        'mcfadyen-digital',
        'McFadyen Digital',
        'AI Best Practices for Commerce',
        'McFadyen Digital is a leading commerce transformation consultancy and the author of AI Best Practices for Commerce -- the authoritative reference covering 130+ use cases, 875+ AI tools, and 209 glossary terms for implementing AI across the commerce value chain.',
        'https://mcfadyen.com',
        'https://mcfadyen.com',
        'https://ai-best-practices-dev.mcfadyen-digital.workers.dev',
        209,
        true,
        true,
        ARRAY['AI', 'Commerce', 'Best Practices', 'Digital Transformation']
      )
      RETURNING id
    `);
    profileId = (result as any).rows[0].id;
    console.log(`Created publisher profile: ${profileId}`);
  }

  // ---- Step 3: Link unlinked best_practices ----
  const linkResult = await db.execute(sql`
    UPDATE best_practices
    SET publisher_profile_id = ${profileId},
        updated_at = NOW()
    WHERE publisher_profile_id IS NULL
  `);
  const linkedCount = (linkResult as any).rowCount ?? 0;
  console.log(`Linked ${linkedCount} best_practices rows to McFadyen Digital publisher profile`);

  // ---- Verify ----
  const verifyProfile = await db.execute(sql`
    SELECT id, display_name, profile_type, content_count, slug
    FROM consultant_profiles
    WHERE slug = 'mcfadyen-digital'
  `);
  console.log('\nPublisher profile:', (verifyProfile as any).rows[0]);

  const verifyBP = await db.execute(sql`
    SELECT COUNT(*) as total,
           COUNT(publisher_profile_id) as linked,
           COUNT(*) - COUNT(publisher_profile_id) as unlinked
    FROM best_practices
  `);
  console.log('Best practices:', (verifyBP as any).rows[0]);

  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
