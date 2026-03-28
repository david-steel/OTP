/**
 * Recalculates agentic levels for all published OOS files using the v2 calculator.
 * Updates the organizations table with new levels.
 *
 * Usage: DATABASE_URL=... npx tsx scripts/recalculate-agentic-levels.ts
 */

import { db } from '../src/config/database.js';
import { organizations, oosFiles, claims } from '../src/db/schema.js';
import { calculateAgenticLevel } from '../src/services/agentic-level-calculator.js';
import { eq, and, desc, sql } from 'drizzle-orm';
import type { ParsedClaim } from '../src/shared/types.js';

async function recalculate() {
  // Get all published OOS files with their org info
  const published = await db.select({
    oosId: oosFiles.id,
    orgId: oosFiles.orgId,
    orgName: organizations.name,
    oldLevel: organizations.agenticLevel,
    frontmatter: oosFiles.frontmatter,
    claimCount: oosFiles.claimCount,
  })
    .from(oosFiles)
    .innerJoin(organizations, eq(oosFiles.orgId, organizations.id))
    .where(eq(oosFiles.status, 'published'))
    .orderBy(organizations.name, desc(oosFiles.version));

  // Deduplicate -- take latest published per org
  const seen = new Set<string>();
  const toProcess = published.filter(f => {
    if (seen.has(f.orgId)) return false;
    seen.add(f.orgId);
    return true;
  });

  console.log(`Recalculating agentic levels for ${toProcess.length} organizations\n`);
  console.log('Org'.padEnd(35) + 'Old'.padEnd(6) + 'New'.padEnd(6) + 'Evidence');
  console.log('-'.repeat(90));

  for (const oos of toProcess) {
    // Get claims
    const oosClaims = await db.select({
      claimId: claims.claimId,
      section: claims.section,
      displayOrder: claims.displayOrder,
      rule: claims.rule,
      why: claims.why,
      failureMode: claims.failureMode,
      confidence: claims.confidence,
      evidence: claims.evidence,
      scope: claims.scope,
    })
      .from(claims)
      .where(eq(claims.oosFileId, oos.oosId));

    const parsedClaims: ParsedClaim[] = oosClaims.map(c => ({
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

    const result = calculateAgenticLevel(parsedClaims, oos.frontmatter as Record<string, unknown>);

    const changed = result.level !== oos.oldLevel;
    const arrow = changed ? ' <--' : '';

    console.log(
      oos.orgName.padEnd(35) +
      `L${oos.oldLevel || '?'}`.padEnd(6) +
      `L${result.level}`.padEnd(6) +
      result.evidence.join('; ') +
      arrow
    );

    // Update the org
    await db.update(organizations)
      .set({ agenticLevel: result.level, updatedAt: new Date() })
      .where(eq(organizations.id, oos.orgId));
  }

  console.log('\nDone! All levels updated.');
  process.exit(0);
}

recalculate().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
