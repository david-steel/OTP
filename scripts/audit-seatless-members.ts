/**
 * audit-seatless-members.ts -- find active members with no chart seat across ALL orgs.
 *
 * A member with no Team-chart seat can't own a KPI and renders orphaned. This is
 * the same bug that hit Dawson (swallowed invite-time seat creation). The
 * acceptInvite self-heal (commit 8d85b07) fixes FUTURE accepts; this audit finds
 * members who already accepted before the fix.
 *
 * READ-ONLY. It reports; it does not modify any org's chart. (Backfilling another
 * customer's chart is a deliberate decision, not an automatic one.) To fix a
 * specific person, use scripts/seat-dawson.ts with their email.
 *
 * Run: railway run npx tsx scripts/audit-seatless-members.ts
 */
import { sql } from 'drizzle-orm';
import { db } from '../src/config/database.js';
import { getOrgTeamGraph } from '../src/services/team-graph.js';

function norm(s: unknown) { return String(s || '').trim().toLowerCase(); }

async function main() {
  const rows = (await db.execute(sql`
    SELECT m.org_id, o.name AS org_name, m.email, m.display_name, m.role,
           m.claimed_entity_id, m.claimed_entity_ids
    FROM org_members m
    JOIN organizations o ON o.id = m.org_id
    WHERE m.status = 'active' AND m.clerk_user_id NOT LIKE 'chart:%'
    ORDER BY o.name, m.email
  `)) as any;
  const members = rows.rows || [];

  // Group by org.
  const byOrg = new Map<string, any[]>();
  for (const m of members) {
    if (!byOrg.has(m.org_id)) byOrg.set(m.org_id, []);
    byOrg.get(m.org_id)!.push(m);
  }

  console.log(`Scanning ${members.length} active members across ${byOrg.size} orgs...\n`);

  let totalSeatless = 0;
  const seatlessByOrg: Array<{ org: string; orgId: string; people: string[] }> = [];

  for (const [orgId, mems] of byOrg) {
    let humans: any[] = [];
    try {
      const graph: any = await getOrgTeamGraph(orgId);
      humans = (graph.nodes || []).filter((n: any) => String(n.externalId || '').startsWith('HUM_'));
    } catch {
      humans = []; // no chart/OOS at all -> everyone is seatless
    }
    const seatIds = new Set(humans.map((n: any) => String(n.externalId)));
    const seatEmails = new Set(humans.map((n: any) => norm(n.contactEmail || n.contact_email)).filter(Boolean));

    const seatless: string[] = [];
    for (const m of mems) {
      const claimed = [m.claimed_entity_id, ...((m.claimed_entity_ids as string[]) || [])].filter(Boolean);
      const hasClaim = claimed.some((c: string) => seatIds.has(c)) || claimed.length > 0;
      const hasEmailSeat = m.email && seatEmails.has(norm(m.email));
      if (!hasClaim && !hasEmailSeat) {
        seatless.push(`${m.display_name || '(no name)'} <${m.email || 'no-email'}> [${m.role}]`);
      }
    }
    if (seatless.length) {
      totalSeatless += seatless.length;
      seatlessByOrg.push({ org: mems[0].org_name || '(unnamed)', orgId, people: seatless });
    }
  }

  if (!seatlessByOrg.length) {
    console.log('All active members have a chart seat. Nothing to backfill.');
    return;
  }

  console.log(`Found ${totalSeatless} seatless active member(s) in ${seatlessByOrg.length} org(s):\n`);
  for (const o of seatlessByOrg) {
    console.log(`ORG: ${o.org}  (${o.orgId})`);
    for (const p of o.people) console.log(`   - ${p}`);
    console.log('');
  }
  console.log('READ-ONLY audit. To seat someone, run seat-dawson.ts with their email,');
  console.log('or tell me which orgs to backfill.');
}

main().catch((err) => { console.error(err); process.exit(1); });
