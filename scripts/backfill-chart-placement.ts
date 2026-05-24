/**
 * One-shot backfill: place existing org members on their accountability
 * chart. Catches anyone who signed up before the auto-placement code in
 * placeOwnerOnStarterChart() shipped (the bug was found on Dawson's test
 * signup, 2026-05-24).
 *
 * Behavior per org:
 *   - Find the owner org_member row (role='owner', status='active'). Bail
 *     if there isn't exactly one. We deliberately do NOT guess for orgs
 *     with multiple owners or none.
 *   - Compute a default role key for the placement based on org.size:
 *       size='solo'  -> 'solo_operator' (gets the 6 AI army slots)
 *       anything else -> 'other'
 *   - Call placeOwnerOnStarterChart. If the owner is already on the
 *     chart (matched by contact_email), it skips. Idempotent.
 *
 * Usage:
 *   npx tsx --env-file=.env scripts/backfill-chart-placement.ts            # dry run
 *   npx tsx --env-file=.env scripts/backfill-chart-placement.ts --apply    # actually place
 *   npx tsx --env-file=.env scripts/backfill-chart-placement.ts --org <id> # one org only
 *
 * Requires env: DATABASE_URL
 */
import { and, eq } from 'drizzle-orm';
import { db } from '../src/config/database.js';
import { organizations, orgMembers } from '../src/db/schema.js';
import { placeOwnerOnStarterChart } from '../src/services/starter-chart.js';

interface BackfillRow {
  orgId: string;
  orgName: string;
  industry: string | null;
  size: string | null;
  memberId: string;
  ownerDisplayName: string;
  ownerEmail: string | null;
  roleKey: string;
}

function defaultRoleForSize(size: string | null): string {
  if (size === 'solo') return 'solo_operator';
  return 'other';
}

async function gather(filterOrgId: string | null): Promise<BackfillRow[]> {
  const orgs = filterOrgId
    ? await db.select().from(organizations).where(eq(organizations.id, filterOrgId))
    : await db.select().from(organizations);

  const out: BackfillRow[] = [];
  for (const org of orgs) {
    const owners = await db.select().from(orgMembers).where(and(
      eq(orgMembers.orgId, org.id),
      eq(orgMembers.role, 'owner'),
      eq(orgMembers.status, 'active'),
    ));
    if (owners.length !== 1) continue;
    const owner = owners[0];
    if (!owner.displayName) continue;
    out.push({
      orgId: org.id,
      orgName: org.name || 'Untitled Org',
      industry: org.industry || null,
      size: org.size || null,
      memberId: owner.id,
      ownerDisplayName: owner.displayName,
      ownerEmail: owner.email || null,
      roleKey: defaultRoleForSize(org.size || null),
    });
  }
  return out;
}

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes('--apply');
  const orgIdx = args.indexOf('--org');
  const filterOrgId = orgIdx >= 0 ? args[orgIdx + 1] : null;

  const rows = await gather(filterOrgId);
  // eslint-disable-next-line no-console
  console.log(`Found ${rows.length} owner(s) to evaluate${apply ? ' (APPLY mode)' : ' (DRY RUN -- pass --apply to commit)'}.`);

  let placed = 0;
  let skipped = 0;
  let failed = 0;
  for (const r of rows) {
    const tag = `[${r.orgId.slice(0, 8)} ${r.orgName.slice(0, 32)}] role=${r.roleKey} owner=${r.ownerEmail || r.ownerDisplayName}`;
    if (!apply) {
      // eslint-disable-next-line no-console
      console.log(`  would place: ${tag}`);
      continue;
    }
    try {
      const result = await placeOwnerOnStarterChart({
        orgId: r.orgId,
        orgName: r.orgName,
        industry: r.industry,
        orgSize: r.size,
        ownerDisplayName: r.ownerDisplayName,
        ownerEmail: r.ownerEmail,
        roleKey: r.roleKey,
      });
      if (result.skipped) {
        skipped++;
        // eslint-disable-next-line no-console
        console.log(`  skipped (already on chart): ${tag}`);
      } else {
        placed++;
        // eslint-disable-next-line no-console
        console.log(`  placed: ${tag} -> owner=${result.ownerExternalId}${result.visionaryExternalId ? `, visionary=${result.visionaryExternalId}` : ''}${result.agentExternalIds.length ? `, agents=${result.agentExternalIds.length}` : ''}`);
      }
    } catch (err) {
      failed++;
      // eslint-disable-next-line no-console
      console.error(`  FAILED: ${tag} ::`, err instanceof Error ? err.message : err);
    }
  }

  // eslint-disable-next-line no-console
  console.log(`Done. placed=${placed} skipped=${skipped} failed=${failed} total=${rows.length}`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
