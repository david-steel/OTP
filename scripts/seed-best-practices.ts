/**
 * Seeds the best_practices table from scraped JSON data.
 * Also creates a publisher profile for McFadyen Digital if one doesn't exist.
 *
 * Usage: npx tsx scripts/seed-best-practices.ts
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = resolve(__dirname, '../data/best-practices.json');

async function seed() {
  // Dynamic import to respect env vars
  const { db } = await import('../src/config/database.js');
  const { bestPractices, consultantProfiles, organizations } = await import('../src/db/schema.js');
  const { eq, sql } = await import('drizzle-orm');

  console.log('Loading scraped data...');
  const data = JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
  console.log(`Found ${data.termCount} terms from ${data.source.publisher}`);

  // Find or create a publisher profile for McFadyen Digital
  // First, check if there's already a publisher org
  let publisherProfileId: string | null = null;

  const [existingPublisher] = await db.select()
    .from(consultantProfiles)
    .where(eq(consultantProfiles.slug, 'mcfadyen-digital'))
    .limit(1);

  if (existingPublisher) {
    publisherProfileId = existingPublisher.id;
    console.log(`Found existing publisher profile: ${existingPublisher.displayName}`);
  } else {
    console.log('No publisher profile found for McFadyen Digital.');
    console.log('Best practices will be loaded without a publisher link.');
    console.log('Create a publisher profile later and link it.');
  }

  // Clear existing best practices from this publisher (or unlinked)
  if (publisherProfileId) {
    const deleted = await db.delete(bestPractices)
      .where(eq(bestPractices.publisherProfileId, publisherProfileId));
    console.log('Cleared existing best practices for publisher');
  } else {
    // Clear all unlinked best practices
    const deleted = await db.delete(bestPractices)
      .where(sql`${bestPractices.publisherProfileId} IS NULL`);
    console.log('Cleared existing unlinked best practices');
  }

  // Insert all terms
  const batchSize = 50;
  let inserted = 0;

  for (let i = 0; i < data.terms.length; i += batchSize) {
    const batch = data.terms.slice(i, i + batchSize);

    await db.insert(bestPractices).values(
      batch.map((t: any) => ({
        publisherProfileId,
        slug: t.slug,
        term: t.term,
        definition: t.definition,
        category: t.category.replace(/&amp;/g, '&'),
        relatedTerms: t.relatedTerms || [],
        sourceUrl: t.sourceUrl,
        canonicalUrl: t.canonicalUrl,
        lastUpdatedAt: t.lastUpdated ? new Date(t.lastUpdated) : null,
        metadata: {
          scrapedAt: t.scrapedAt,
          source: data.source.name,
        },
      }))
    );

    inserted += batch.length;
    console.log(`  Inserted ${inserted}/${data.terms.length}`);
  }

  // Update publisher content count if linked
  if (publisherProfileId) {
    await db.execute(sql`
      UPDATE consultant_profiles
      SET content_count = ${inserted},
          last_synced_at = NOW(),
          updated_at = NOW()
      WHERE id = ${publisherProfileId}
    `);
  }

  console.log(`\nDone! ${inserted} best practices seeded.`);
  console.log(`Categories: ${data.categories.join(', ')}`);

  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
