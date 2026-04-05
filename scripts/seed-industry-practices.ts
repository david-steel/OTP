/**
 * Seeds original industry practice packs into the best_practices table.
 * These are NOT scraped content -- they are original OTP coordination intelligence.
 *
 * Usage: npx tsx scripts/seed-industry-practices.ts [--industry agency]
 */

import { AGENCY_PRACTICES, AGENCY_INDUSTRY_META } from '../src/data/industry-practices-agency.js';
import { FITNESS_PRACTICES, FITNESS_INDUSTRY_META } from '../src/data/industry-practices-fitness.js';
import { HEALTHCARE_PRACTICES, HEALTHCARE_INDUSTRY_META } from '../src/data/industry-practices-healthcare.js';
import { SAAS_PRACTICES, SAAS_INDUSTRY_META } from '../src/data/industry-practices-saas.js';
import { PROFESSIONAL_SERVICES_PRACTICES, PROFESSIONAL_SERVICES_INDUSTRY_META } from '../src/data/industry-practices-professional-services.js';
import { ECOMMERCE_PRACTICES, ECOMMERCE_INDUSTRY_META } from '../src/data/industry-practices-ecommerce.js';

function slugify(term: string): string {
  return term
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function seed(industryFilter?: string) {
  const { db } = await import('../src/config/database.js');
  const { bestPractices, consultantProfiles } = await import('../src/db/schema.js');
  const { eq, sql } = await import('drizzle-orm');

  // Find OTP's publisher profile (the platform itself is the publisher for original content)
  let publisherProfileId: string | null = null;
  const [otpPublisher] = await db.select()
    .from(consultantProfiles)
    .where(eq(consultantProfiles.slug, 'otp'))
    .limit(1);

  if (otpPublisher) {
    publisherProfileId = otpPublisher.id;
    console.log(`Using OTP publisher profile: ${otpPublisher.displayName}`);
  } else {
    console.log('No OTP publisher profile found. Practices will be loaded without publisher link.');
  }

  const industries = [
    { meta: AGENCY_INDUSTRY_META, practices: AGENCY_PRACTICES },
    { meta: FITNESS_INDUSTRY_META, practices: FITNESS_PRACTICES },
    { meta: HEALTHCARE_INDUSTRY_META, practices: HEALTHCARE_PRACTICES },
    { meta: SAAS_INDUSTRY_META, practices: SAAS_PRACTICES },
    { meta: PROFESSIONAL_SERVICES_INDUSTRY_META, practices: PROFESSIONAL_SERVICES_PRACTICES },
    { meta: ECOMMERCE_INDUSTRY_META, practices: ECOMMERCE_PRACTICES },
  ];

  for (const { meta, practices } of industries) {
    if (industryFilter && meta.slug !== industryFilter) continue;

    console.log(`\nSeeding ${meta.name} (${practices.length} practices)...`);

    let inserted = 0;
    let skipped = 0;

    for (const practice of practices) {
      const slug = `${meta.slug}-${slugify(practice.term)}`;

      // Check if already exists
      const existing = await db.select({ id: bestPractices.id })
        .from(bestPractices)
        .where(eq(bestPractices.slug, slug))
        .limit(1);

      if (existing.length > 0) {
        skipped++;
        continue;
      }

      await db.insert(bestPractices).values({
        publisherProfileId,
        slug,
        term: practice.term,
        definition: practice.definition,
        category: practice.category,
        industry: meta.slug,
        isOriginal: true,
        isCoordination: true,
        sourceUrl: `https://orgtp.com/practices/${meta.slug}`,
        metadata: {
          failureMode: practice.failureMode,
          evidence: practice.evidence,
          industryMeta: {
            name: meta.name,
            description: meta.description,
          },
        },
      });
      inserted++;
    }

    console.log(`  Inserted: ${inserted}, Skipped (existing): ${skipped}`);
  }

  // Update counts
  const countResult = await db.execute(sql`
    SELECT industry, COUNT(*) as count
    FROM best_practices
    WHERE industry IS NOT NULL AND is_original = true
    GROUP BY industry
  `) as any;

  console.log('\nIndustry practice counts:');
  for (const row of (countResult.rows || [])) {
    console.log(`  ${row.industry}: ${row.count}`);
  }

  console.log('\nDone!');
  process.exit(0);
}

const industryArg = process.argv.find(a => a.startsWith('--industry='))?.split('=')[1]
  || (process.argv.includes('--industry') ? process.argv[process.argv.indexOf('--industry') + 1] : undefined);

seed(industryArg).catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
