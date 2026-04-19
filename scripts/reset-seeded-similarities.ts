/**
 * Wipes all similarities for seeded template orgs, then recomputes them all.
 * This ensures every seeded org is compared against every other org (not just the first few).
 *
 * Usage: DATABASE_URL="..." npx tsx scripts/reset-seeded-similarities.ts
 */

import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, sql, inArray } from 'drizzle-orm';

async function run() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  const { claims, claimSimilarities, oosFiles, organizations } = await import('../src/db/schema.js');
  const { computeAllSimilarities } = await import('../src/services/similarity.js');

  // Step 1: Find all seeded org OOS IDs
  const seededOrgs = await db.execute(sql`
    SELECT o.id as org_id, o.name, f.id as oos_id
    FROM organizations o
    JOIN oos_files f ON f.org_id = o.id AND f.status = 'published'
    WHERE o.clerk_org_id LIKE 'template_%'
    ORDER BY o.name
  `);

  const seededOosIds = (seededOrgs.rows as any[]).map(r => r.oos_id);
  console.log(`Found ${seededOosIds.length} seeded OOS files to reprocess`);

  // Step 2: Delete all existing similarities involving seeded orgs
  const idsLiteral = seededOosIds.map((id: string) => `'${id}'`).join(',');
  const deleted = await db.execute(sql.raw(`
    DELETE FROM claim_similarities
    WHERE oos_a_id IN (${idsLiteral})
       OR oos_b_id IN (${idsLiteral})
  `));
  console.log(`Deleted ${(deleted as any).rowCount || 'unknown'} old similarity pairs`);

  // Step 3: Get ALL claims (seeded + original)
  const allClaims = await db.select().from(claims)
    .where(sql`${claims.oosFileId} IN (SELECT id FROM oos_files WHERE status = 'published')`);
  console.log(`Total published claims: ${allClaims.length}`);

  // Step 4: Recompute similarities for each seeded org
  let totalPairs = 0;
  const BATCH_SIZE = 500;

  for (const row of seededOrgs.rows as any[]) {
    const oosId = row.oos_id;
    const orgName = row.name;

    const oosClaims = allClaims.filter(c => c.oosFileId === oosId);
    if (oosClaims.length === 0) {
      console.log(`SKIP: ${orgName} -- no claims`);
      continue;
    }

    const newClaims = oosClaims.map(c => ({
      dbId: c.id,
      claimId: c.claimId,
      section: c.section,
      displayOrder: c.displayOrder,
      rule: c.rule,
      why: c.why,
      failureMode: c.failureMode,
      confidence: c.confidence as any,
      evidence: c.evidence as any,
      scope: c.scope,
    }));

    const otherClaims = allClaims
      .filter(c => c.oosFileId !== oosId)
      .map(c => ({
        dbId: c.id,
        oosFileId: c.oosFileId,
        claimId: c.claimId,
        section: c.section,
        displayOrder: c.displayOrder,
        rule: c.rule,
        why: c.why,
        failureMode: c.failureMode,
        confidence: c.confidence as any,
        evidence: c.evidence as any,
        scope: c.scope,
      }));

    const simPairs = computeAllSimilarities(newClaims, oosId, otherClaims);

    if (simPairs.length > 0) {
      // Batch insert
      for (let i = 0; i < simPairs.length; i += BATCH_SIZE) {
        const batch = simPairs.slice(i, i + BATCH_SIZE);
        await db.insert(claimSimilarities).values(
          batch.map((p: any) => ({
            claimAId: p.claimAId,
            claimBId: p.claimBId,
            oosAId: p.oosAId,
            oosBId: p.oosBId,
            similarityScore: p.score,
            classification: p.classification,
            sectionMatch: p.sectionMatch,
          }))
        );
      }
      totalPairs += simPairs.length;
      console.log(`OK: ${orgName} -- ${simPairs.length} pairs`);
    } else {
      console.log(`OK: ${orgName} -- 0 pairs`);
    }
  }

  console.log(`\nDone. Total similarity pairs created: ${totalPairs}`);
  await pool.end();
}

run().catch(err => { console.error(err); process.exit(1); });
