// Seed a single test coach profile (Brock Beiersdoerfer) into the local DB
// so we can walk through the claim/takedown/unsubscribe flows end-to-end.
// Idempotent — safe to run multiple times.
import { db } from '../src/config/database';
import { organizations, consultantProfiles } from '../src/db/schema';
import { sql, eq } from 'drizzle-orm';

(async () => {
  const slug = 'brock-beiersdoerfer';

  // Check if already seeded
  const [existing] = await db.select().from(consultantProfiles).where(eq(consultantProfiles.slug, slug)).limit(1);
  if (existing) {
    console.log(`✓ Profile already seeded for ${slug} (claimed=${existing.claimed})`);
    console.log(`  id=${existing.id}  orgId=${existing.orgId}`);
    process.exit(0);
  }

  // Create a shell org first (the profile's orgId is required + foreign key)
  const [org] = await db
    .insert(organizations)
    .values({
      name: 'Brock Beiersdoerfer (seeded shell org)',
      industry: 'coaching',
      size: 'solo',
      clerkOrgId: `seed_brock_beiersdoerfer_${Date.now()}`,
    })
    .returning();
  console.log(`✓ Created shell org ${org.id}`);

  // Insert the profile
  const [profile] = await db
    .insert(consultantProfiles)
    .values({
      orgId: org.id,
      slug,
      displayName: 'Brock Beiersdoerfer',
      headline: 'Guiding leadership teams through overcoming inefficiencies, improving processes, and achieving their vision with clarity.',
      published: true,
      isPublished: true,
      profileType: 'consultant',
      claimed: false,
      directorySource: 'eosworldwide',
      directorySourceId: 'brock-beiersdoerfer',
      contentSourceUrl: 'https://implementer.eosworldwide.com/brock-beiersdoerfer/',
      contactEmail: 'brock.beiersdoerfer@eosworldwide.com',
      tier: 'Professional',
      geoCity: 'Birmingham',
      geoState: 'Alabama',
      geoCountry: 'United States',
    })
    .returning();
  console.log(`✓ Seeded profile ${slug} (id=${profile.id})`);
  console.log(`  Local test URLs:`);
  console.log(`    http://localhost:3000/expert/${slug}`);
  console.log(`    http://localhost:3000/claim/${slug}`);
  console.log(`    http://localhost:3000/takedown/${slug}`);
  console.log(`    http://localhost:3000/unsubscribe?slug=${slug}`);
  process.exit(0);
})().catch(err => { console.error('SEED FAILED:', err); process.exit(1); });
