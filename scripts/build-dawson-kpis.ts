/**
 * build-dawson-kpis.ts -- create the sales scoreboard KPIs on Dawson's seat,
 * and de-orphan the existing "Qualified Sales Calls" KPI.
 *
 * Idempotent: skips any KPI whose title already exists for Dawson.
 * Run: railway run npx tsx scripts/build-dawson-kpis.ts [--fix]
 *   (no --fix = dry run / plan only)
 */
import { sql } from 'drizzle-orm';
import { db } from '../src/config/database.js';
import { createKpi, updateKpi, listKpis } from '../src/services/kpi.js';
import { getOrgTeamGraph } from '../src/services/team-graph.js';

const EMAIL = 'dawson@orgtp.com';
const DO_FIX = process.argv.includes('--fix');

// goalValue null = "set your own goal in the UI". Only Calls has a hard target (150/wk).
const KPIS = [
  { title: 'Calls made',        goalOperator: 'gte', goalValue: 150,  unit: 'calls', desc: 'Dials per week. Target 150/week per caller (30/day).' },
  { title: 'Conversations',     goalOperator: 'gte', goalValue: null, unit: 'calls', desc: 'Calls that connected (a real conversation).' },
  { title: 'Demos booked',      goalOperator: 'gte', goalValue: null, unit: 'demos', desc: 'Demos scheduled from outreach.' },
  { title: 'Demos run',         goalOperator: 'gte', goalValue: null, unit: 'demos', desc: 'Demos actually delivered.' },
  { title: 'Active / Using',    goalOperator: 'gte', goalValue: null, unit: 'orgs',  desc: 'Orgs that reached the Active/Using stage. The core win.' },
  { title: 'Closed Won',        goalOperator: 'gte', goalValue: null, unit: 'orgs',  desc: 'Paid. The second finish line.' },
] as const;

async function main() {
  const mem = (await db.execute(sql`
    SELECT org_id, claimed_entity_id FROM org_members WHERE lower(email) = ${EMAIL}
  `)) as any;
  const m = (mem.rows || [])[0];
  if (!m) { console.error(`No member row for ${EMAIL}`); process.exit(1); }
  const orgId = m.org_id as string;
  const seat = m.claimed_entity_id as string;
  if (!seat) { console.error('Dawson has no claimed seat. Run seat-dawson.ts --fix first.'); process.exit(1); }
  console.log(`Org ${orgId}, Dawson seat = ${seat}`);

  // Leadership / default team for scorecard placement (optional; service may default).
  const teamRows = (await db.execute(sql`
    SELECT id, name, is_default FROM teams WHERE org_id = ${orgId}
    ORDER BY is_default DESC, (lower(name) LIKE '%leadership%') DESC LIMIT 1
  `)) as any;
  const teamId = (teamRows.rows || [])[0]?.id || undefined;
  console.log('Team for KPIs:', teamId || '(service default)');

  const existing = await listKpis(orgId, { ownerExternalId: seat } as any);
  const existingTitles = new Set((existing || []).map((k: any) => String(k.title).toLowerCase()));

  console.log('\nKPIs to create:');
  for (const k of KPIS) {
    const skip = existingTitles.has(k.title.toLowerCase());
    console.log(`  ${skip ? '[skip exists]' : '[create]'} ${k.title}  goal=${k.goalValue ?? '(open)'} ${k.unit}`);
  }

  // De-orphan check: KPIs whose owner doesn't resolve to ANY current chart seat.
  // (Creating Dawson's seat already fixes any KPI owned by HUM_DAWSONSIERADZKY.)
  const graph: any = await getOrgTeamGraph(orgId);
  const seatIds = new Set<string>((graph.nodes || []).map((n: any) => String(n.externalId)));
  const allKpis = await listKpis(orgId, {} as any);
  const orphans = (allKpis || []).filter((k: any) => !seatIds.has(String(k.ownerExternalId)));
  console.log('\nOrphaned KPIs (owner resolves to no chart seat):',
    orphans.map((o: any) => `${o.title} (owner ${o.ownerExternalId})`).join(' | ') || '(none)');

  if (!DO_FIX) { console.log('\nDRY RUN. Re-run with --fix to create the KPIs and de-orphan.'); return; }

  for (const k of KPIS) {
    if (existingTitles.has(k.title.toLowerCase())) continue;
    const kpi = await createKpi(orgId, {
      ownerEntityType: 'human', ownerExternalId: seat,
      title: k.title, description: k.desc, groupName: 'Sales',
      goalOperator: (k.goalValue == null ? null : k.goalOperator) as any, goalValue: k.goalValue,
      unit: k.unit, timeGrain: 'weekly', aggregationMethod: 'sum',
      ...(teamId ? { teamId } : {}),
    } as any, 'HUM_DAVIDSTEEL');
    console.log(`  created KPI ${kpi.id}: ${k.title}`);
  }

  // De-orphan: reassign any "Qualified Sales Calls" KPI to David's seat.
  for (const o of orphans) {
    if (o.ownerExternalId === 'HUM_DAVIDSTEEL') continue;
    await updateKpi(orgId, o.id, { ownerEntityType: 'human', ownerExternalId: 'HUM_DAVIDSTEEL' } as any);
    console.log(`  de-orphaned "${o.title}" -> HUM_DAVIDSTEEL`);
  }

  console.log('\nDONE. Dawson\'s sales scoreboard is live. Set goals for the open ones in the KPIs UI.');
}

main().catch((err) => { console.error(err); process.exit(1); });
