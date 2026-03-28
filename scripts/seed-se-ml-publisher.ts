/**
 * Seeds SE-ML Engineering Best Practices for Machine Learning into the OTP platform.
 * Creates the org, publisher profile, and inserts all 46 practices.
 *
 * Usage: DATABASE_URL="..." npx tsx scripts/seed-se-ml-publisher.ts
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = resolve(__dirname, '../data/se-ml-practices.json');

async function seed() {
  const { db } = await import('../src/config/database.js');
  const { bestPractices, consultantProfiles, organizations } = await import('../src/db/schema.js');
  const { eq, sql } = await import('drizzle-orm');

  console.log('Loading SE-ML practices data...');
  const data = JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
  console.log(`Found ${data.termCount} practices from ${data.source.publisher}`);
  console.log(`Categories: ${data.categories.join(', ')}`);

  // ---- Step 1: Organization ----
  const [existingOrg] = await db.select()
    .from(organizations)
    .where(eq(organizations.name, 'SE-ML'))
    .limit(1);

  let orgId: string;

  if (existingOrg) {
    orgId = existingOrg.id;
    console.log(`Org already exists: ${orgId}`);
  } else {
    const [newOrg] = await db.insert(organizations).values({
      name: 'SE-ML',
      industry: 'technology',
      size: 'small',
      clerkOrgId: 'publisher_se_ml',
      badge: 'founding',
    }).returning();
    orgId = newOrg.id;
    console.log(`Created org: ${orgId}`);
  }

  // ---- Step 2: Publisher Profile ----
  const [existingProfile] = await db.select()
    .from(consultantProfiles)
    .where(eq(consultantProfiles.slug, 'se-ml'))
    .limit(1);

  let profileId: string;

  if (existingProfile) {
    profileId = existingProfile.id;
    console.log(`Publisher profile already exists: ${profileId}`);
  } else {
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
        'se-ml',
        'SE-ML',
        'Engineering Best Practices for Machine Learning',
        'SE-ML is a research initiative cataloging engineering best practices for machine learning systems. Their framework covers 46 practices across 6 categories: Data, Training, Coding, Deployment, Team, and Governance -- providing actionable guidance for building production-quality ML systems.',
        'https://se-ml.github.io',
        'https://se-ml.github.io',
        'https://se-ml.github.io/practices/',
        ${data.termCount},
        true,
        true,
        ARRAY['Machine Learning', 'Engineering', 'Best Practices', 'MLOps', 'AI Governance']
      )
      RETURNING id
    `);
    profileId = (result as any).rows[0].id;
    console.log(`Created publisher profile: ${profileId}`);
  }

  // ---- Step 3: Clear existing SE-ML best practices ----
  const deleteResult = await db.execute(sql`
    DELETE FROM best_practices
    WHERE publisher_profile_id = ${profileId}
  `);
  const deletedCount = (deleteResult as any).rowCount ?? 0;
  console.log(`Cleared ${deletedCount} existing SE-ML best practices`);

  // ---- Step 4: Insert all practices ----
  const batchSize = 50;
  let inserted = 0;

  for (let i = 0; i < data.terms.length; i += batchSize) {
    const batch = data.terms.slice(i, i + batchSize);

    await db.insert(bestPractices).values(
      batch.map((t: any) => ({
        publisherProfileId: profileId,
        slug: t.slug,
        term: t.term,
        definition: t.definition,
        category: t.category,
        relatedTerms: [],
        sourceUrl: t.sourceUrl,
        canonicalUrl: t.sourceUrl,
        lastUpdatedAt: null,
        metadata: {
          scrapedAt: data.scrapedAt,
          source: data.source.name,
          publisher: data.source.publisher,
        },
      }))
    );

    inserted += batch.length;
    console.log(`  Inserted ${inserted}/${data.terms.length}`);
  }

  // ---- Step 5: Update publisher content count ----
  await db.execute(sql`
    UPDATE consultant_profiles
    SET content_count = ${inserted},
        last_synced_at = NOW(),
        updated_at = NOW()
    WHERE id = ${profileId}
  `);

  // ---- Verify ----
  const verifyProfile = await db.execute(sql`
    SELECT id, display_name, profile_type, content_count, slug
    FROM consultant_profiles
    WHERE slug = 'se-ml'
  `);
  console.log('\nPublisher profile:', (verifyProfile as any).rows[0]);

  const verifyBP = await db.execute(sql`
    SELECT category, COUNT(*) as count
    FROM best_practices
    WHERE publisher_profile_id = ${profileId}
    GROUP BY category
    ORDER BY category
  `);
  console.log('\nPractices by category:');
  for (const row of (verifyBP as any).rows) {
    console.log(`  ${row.category}: ${row.count}`);
  }

  const verifyTotal = await db.execute(sql`
    SELECT COUNT(*) as total
    FROM best_practices
    WHERE publisher_profile_id = ${profileId}
  `);
  console.log(`\nTotal SE-ML practices seeded: ${(verifyTotal as any).rows[0].total}`);

  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
