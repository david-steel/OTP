/**
 * One-time backfill: reconcile every real org_member against the
 * chart by email. Catches stubs that were never merged, and fixes
 * wrong primary claims (Bogdan-claims-HUM_DAVIDSTEEL pattern).
 *
 * Usage (dry-run, just print what would change):
 *   railway run -- npx tsx scripts/reconcile-chart-claims.ts
 *
 * Usage (apply -- runs the reconciler, prints a summary):
 *   railway run -- npx tsx scripts/reconcile-chart-claims.ts --apply
 *
 * The reconciler itself is idempotent and safe to re-run.
 */

import { db } from '../src/config/database.js';
import { organizations, orgMembers } from '../src/db/schema.js';
import { eq } from 'drizzle-orm';
import { reconcileChartClaimByEmail } from '../src/services/chart-claim-reconcile.js';

async function main() {
  const apply = process.argv.includes('--apply');
  if (!apply) {
    console.log('[reconcile] DRY-RUN -- pass --apply to actually run the merge logic.');
  }

  const orgs = await db.select({ id: organizations.id, name: organizations.name }).from(organizations);
  console.log(`[reconcile] ${orgs.length} orgs total`);

  let totals = { membersTouched: 0, stubsMerged: 0, membershipsMoved: 0, claimsSet: 0 };

  for (const org of orgs) {
    const members = await db
      .select({ id: orgMembers.id, email: orgMembers.email, displayName: orgMembers.displayName, clerkUserId: orgMembers.clerkUserId })
      .from(orgMembers)
      .where(eq(orgMembers.orgId, org.id));

    const real = members.filter(m => m.email && !m.clerkUserId?.startsWith('chart:'));
    if (real.length === 0) continue;

    console.log(`\n[reconcile] org ${org.name} (${org.id}) -- ${real.length} real members`);
    for (const m of real) {
      if (!apply) {
        console.log(`  would reconcile ${m.displayName} <${m.email}>`);
        continue;
      }
      const r = await reconcileChartClaimByEmail(org.id, m.id);
      if (r.matchedTiles.length > 0) {
        totals.membersTouched += 1;
        totals.stubsMerged += r.stubsMerged;
        totals.membershipsMoved += r.membershipsMoved;
        totals.claimsSet += r.claims.length;
        console.log(
          `  ${m.displayName} <${m.email}> -> claims=${JSON.stringify(r.claims)}` +
          ` stubsMerged=${r.stubsMerged} membershipsMoved=${r.membershipsMoved}`
        );
      }
    }
  }

  if (apply) {
    console.log('\n[reconcile] SUMMARY');
    console.log(`  members touched   : ${totals.membersTouched}`);
    console.log(`  stubs merged      : ${totals.stubsMerged}`);
    console.log(`  memberships moved : ${totals.membershipsMoved}`);
    console.log(`  claims set        : ${totals.claimsSet}`);
  }

  process.exit(0);
}

main().catch(err => {
  console.error('[reconcile] FAILED:', err);
  process.exit(1);
});
