/**
 * seat-dawson.ts -- diagnose + fix: a member with no chart seat.
 *
 * Context: KPIs in OTP are owned by Team-chart seats (OOS human entities), not
 * members. On invite, membership.ts is supposed to call createTeamEntity to put
 * a human tile on the chart, but that call is best-effort and SWALLOWS errors
 * (membership.ts ~276-288). When Dawson was invited (6/9, brand-new org) the OOS
 * draft likely didn't exist yet, so the tile creation threw and was eaten. He
 * got a member row, no seat, and never became KPI-ownable.
 *
 * Run:
 *   railway run npx tsx scripts/seat-dawson.ts            # diagnose only
 *   railway run npx tsx scripts/seat-dawson.ts --fix      # create his seat + claim it
 */
import { sql } from 'drizzle-orm';
import { db } from '../src/config/database.js';
import { getOrgTeamGraph, createTeamEntity } from '../src/services/team-graph.js';

const EMAIL = 'dawson@orgtp.com';
const DO_FIX = process.argv.includes('--fix');

function norm(s: unknown) { return String(s || '').trim().toLowerCase(); }

async function main() {
  // 1. Dawson's member row(s)
  const mem = (await db.execute(sql`
    SELECT org_id, role, status, clerk_user_id, email, display_name,
           claimed_entity_id, claimed_entity_ids
    FROM org_members WHERE lower(email) = ${EMAIL}
  `)) as any;
  const rows = mem.rows || [];
  if (!rows.length) { console.error(`No org_members row for ${EMAIL}`); process.exit(1); }
  console.log(`Found ${rows.length} member row(s) for ${EMAIL}:`);
  for (const r of rows) {
    console.log(`  org=${r.org_id} role=${r.role} status=${r.status} claimed=${r.claimed_entity_id || '(none)'} claimedList=${JSON.stringify(r.claimed_entity_ids)}`);
  }
  const m = rows[0];
  const orgId = m.org_id;

  // 2. Current chart humans for that org
  const graph: any = await getOrgTeamGraph(orgId);
  const humans = (graph.nodes || []).filter((n: any) => n.type === 'human' || n.entityType === 'human' || (n.externalId || '').startsWith('HUM_'));
  console.log(`\nChart humans in org ${orgId}:`);
  for (const n of humans) {
    console.log(`  ${n.externalId}  "${n.label || n.name || ''}"  ${n.contactEmail || n.contact_email || ''}`);
  }

  // 3. Does Dawson already have a seat? (by claimed id or matching email)
  const claimed = new Set<string>([m.claimed_entity_id, ...((m.claimed_entity_ids as string[]) || [])].filter(Boolean));
  const seatByEmail = humans.find((n: any) => norm(n.contactEmail || n.contact_email) === EMAIL);
  const seatByClaim = humans.find((n: any) => claimed.has(n.externalId));
  const dawsonSeat = seatByClaim || seatByEmail;
  console.log(`\nDawson seat present? ${dawsonSeat ? 'YES -> ' + dawsonSeat.externalId : 'NO'}`);

  // Diagnosis
  if (!dawsonSeat) {
    console.log('\nDIAGNOSIS: Dawson is a member with NO chart seat. The invite-time');
    console.log('createTeamEntity call (membership.ts) was swallowed (likely no OOS draft');
    console.log('existed when he was invited to the new org). This is why he is not in the');
    console.log('KPI owner picker and cannot own KPIs.');
  } else {
    console.log('\nDIAGNOSIS: Dawson already has a seat. If the picker still hides him, the issue is elsewhere.');
  }

  if (!DO_FIX) { console.log('\n(diagnose only -- rerun with --fix to create his seat)'); return; }
  if (dawsonSeat) { console.log('\nNothing to fix -- seat exists.'); return; }

  // 4. Fix: create Dawson's human seat, reporting to David, then claim it on his member row.
  const david = humans.find((n: any) => norm(n.contactEmail || n.contact_email) === 'david@orgtp.com')
            || humans.find((n: any) => /david/i.test(n.label || n.name || ''));
  const reportsTo = david ? david.externalId : undefined;
  console.log(`\nFIX: creating human seat for Dawson${reportsTo ? `, reporting to ${reportsTo}` : ''}...`);
  const ent = await createTeamEntity(orgId, {
    type: 'human',
    name: m.display_name || 'Dawson Sieradzky',
    role: 'Sales',
    contactEmail: EMAIL,
    reportsTo,
  } as any);
  console.log(`  created seat ${ent.externalId} (oosFile ${ent.oosFileId})`);

  await db.execute(sql`
    UPDATE org_members
    SET claimed_entity_id = ${ent.externalId},
        claimed_entity_ids = ${JSON.stringify([ent.externalId])}::jsonb,
        updated_at = now()
    WHERE org_id = ${orgId} AND lower(email) = ${EMAIL}
  `);
  console.log(`  claimed ${ent.externalId} on Dawson's member row.`);
  console.log('\nDONE. Dawson now has a chart seat and should appear in the KPI owner picker.');
  console.log('His seat externalId (use as KPI ownerExternalId):', ent.externalId);
}

main().catch((err) => { console.error(err); process.exit(1); });
