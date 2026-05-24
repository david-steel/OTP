/**
 * One-shot: finish onboarding for Dawson Sieradzky (dawson@juicedboxes.com)
 * by inserting realistic solo-operator seed data into Juiced Boxes LLC.
 *
 * This mirrors what would happen if Dawson clicked through steps 3-6 of
 * the wizard manually. Step 1 (profile) already ran. The starter chart
 * backfill 2026-05-24 already placed him + his 6 agent slots on the
 * accountability chart.
 *
 * What this script does (each step idempotent):
 *   - Ensures Dawson has a team_memberships row in the default Leadership
 *     Team as leader (ensure-teams.ts created the Team row at backfill).
 *   - Inserts 3 Quarterly Rocks (Q2 2026) if no rocks exist.
 *   - Inserts 4 weekly KPIs if no KPIs exist.
 *   - Inserts 6 manager_agents mirroring the chart-agent slots if none
 *     exist (so step 5 of the wizard and the dashboard agent widget show
 *     the same army that's already on the chart).
 *
 * Usage:
 *   railway run -- npx tsx scripts/finish-onboarding-dawson.ts
 *   railway run -- npx tsx scripts/finish-onboarding-dawson.ts --apply
 */
import { and, eq, isNull } from 'drizzle-orm';
import { db } from '../src/config/database.js';
import {
  organizations,
  orgMembers,
  teams,
  teamMemberships,
  rocks,
  kpis,
  managerAgents,
} from '../src/db/schema.js';
import { SOLO_AGENT_SLOTS } from '../src/data/onboarding-roles.js';

const DAWSON_EMAIL = 'dawson@juicedboxes.com';
const QUARTER = '2026-Q2';
// Last day of Q2 = Jun 30 23:59:59
const QUARTER_END = new Date(2026, 6, 0, 23, 59, 59);

interface SeedRock {
  title: string;
  description?: string;
}
const ROCKS: SeedRock[] = [
  { title: 'Hit $5K MRR by Jun 30', description: 'Stand up the subscription pricing page, push Q2 acquisition through paid + organic, hold gross monthly subscription revenue at $5K by quarter close.' },
  { title: 'Ship the Tropical SKU line by Jun 15', description: 'Source ingredients, finalize three Tropical recipes, produce launch run, write launch comms. In market by Father\'s Day weekend.' },
  { title: 'Document the production-day SOP', description: 'Capture every step from receipt-of-ingredients through cold-chain handoff in a single agent-readable SOP. Goal: a substitute can run a production day on it in under 60 minutes of prep.' },
];

interface SeedKPI {
  title: string;
  target: string; // raw target string the API parses ("20" / "25%" / "$2,000")
  cadence: 'weekly' | 'monthly';
}
const KPIS: SeedKPI[] = [
  { title: 'New subscribers / week',          target: '12',     cadence: 'weekly' },
  { title: 'Net subscription growth / week',  target: '8',      cadence: 'weekly' },
  { title: 'Active subscriptions',            target: '120',    cadence: 'weekly' },
  { title: 'Customer NPS',                    target: '50',     cadence: 'monthly' },
];

function parseTarget(raw: string): { goalValue: number | null; unit: string | null } {
  const numeric = parseFloat(raw.replace(/[^0-9.\-]/g, ''));
  const goalValue = Number.isFinite(numeric) ? numeric : null;
  const unit = /%/.test(raw) ? '%' : (/^\s*\$/.test(raw) ? '$' : null);
  return { goalValue, unit };
}

function slugifyForAgentId(s: string): string {
  return String(s).replace(/[^A-Za-z0-9]/g, '').toUpperCase() || 'AGENT';
}

async function main() {
  const apply = process.argv.includes('--apply');

  // ---- 1. Look up Dawson + Juiced Boxes ----------------------------
  const [member] = await db.select().from(orgMembers).where(eq(orgMembers.email, DAWSON_EMAIL)).limit(1);
  if (!member) throw new Error(`No org_members row for ${DAWSON_EMAIL}. Did Dawson finish step 1?`);
  if (!member.clerkUserId) throw new Error(`org_member ${member.id} has no clerk_user_id`);

  const [org] = await db.select().from(organizations).where(eq(organizations.id, member.orgId)).limit(1);
  if (!org) throw new Error(`Org ${member.orgId} missing for member ${member.id}`);

  // eslint-disable-next-line no-console
  console.log(`Org: ${org.name} (${org.id})`);
  // eslint-disable-next-line no-console
  console.log(`Owner: ${member.displayName} <${member.email}> member=${member.id} clerk=${member.clerkUserId}`);

  // ---- 2. Default Leadership Team ----------------------------------
  let [defaultTeam] = await db.select().from(teams)
    .where(and(eq(teams.orgId, org.id), eq(teams.isDefault, true)))
    .limit(1);
  if (!defaultTeam) {
    [defaultTeam] = await db.select().from(teams)
      .where(eq(teams.orgId, org.id))
      .limit(1);
  }
  if (!defaultTeam) throw new Error(`No team found for org ${org.id}. ensure-teams.ts should have created one.`);
  // eslint-disable-next-line no-console
  console.log(`Team: ${defaultTeam.name} (${defaultTeam.id})`);

  // Membership in that team -- promote Dawson to leader if not already.
  const [existingMembership] = await db.select().from(teamMemberships)
    .where(and(eq(teamMemberships.teamId, defaultTeam.id), eq(teamMemberships.memberId, member.id)))
    .limit(1);
  const needMembership = !existingMembership;
  const needPromote = !!existingMembership && existingMembership.roleOnTeam !== 'leader';

  // ---- 3. Inspect current counts -----------------------------------
  const [existingRocks, existingKpis, existingAgents] = await Promise.all([
    db.select({ id: rocks.id }).from(rocks).where(and(eq(rocks.organizationId, org.id), isNull(rocks.deletedAt))),
    db.select({ id: kpis.id }).from(kpis).where(and(eq(kpis.organizationId, org.id), isNull(kpis.deletedAt))),
    db.select({ id: managerAgents.id }).from(managerAgents).where(and(eq(managerAgents.orgId, org.id), isNull(managerAgents.deletedAt))),
  ]);

  const plan = {
    addMembership: needMembership,
    promoteToLeader: needPromote,
    addRocks: existingRocks.length === 0 ? ROCKS.length : 0,
    addKpis: existingKpis.length === 0 ? KPIS.length : 0,
    addAgents: existingAgents.length === 0 ? SOLO_AGENT_SLOTS.length : 0,
    existingCounts: { rocks: existingRocks.length, kpis: existingKpis.length, agents: existingAgents.length },
  };
  // eslint-disable-next-line no-console
  console.log('Plan:', plan);

  if (!apply) {
    // eslint-disable-next-line no-console
    console.log('DRY RUN -- pass --apply to commit.');
    process.exit(0);
  }

  // ---- 4. APPLY -----------------------------------------------------
  if (plan.addMembership) {
    await db.insert(teamMemberships).values({
      teamId: defaultTeam.id,
      memberId: member.id,
      roleOnTeam: 'leader',
    });
    // eslint-disable-next-line no-console
    console.log(`  added team_memberships row (leader)`);
  } else if (plan.promoteToLeader && existingMembership) {
    await db.update(teamMemberships)
      .set({ roleOnTeam: 'leader' })
      .where(eq(teamMemberships.id, existingMembership.id));
    // eslint-disable-next-line no-console
    console.log(`  promoted existing team_memberships row to leader`);
  } else {
    // eslint-disable-next-line no-console
    console.log(`  team membership already leader, skipped`);
  }

  if (plan.addRocks > 0) {
    for (const r of ROCKS) {
      await db.insert(rocks).values({
        organizationId: org.id,
        teamId: defaultTeam.id,
        ownerEntityType: 'human',
        ownerExternalId: member.id,
        ownerName: member.displayName || null,
        title: r.title,
        description: r.description ?? null,
        quarter: QUARTER,
        dueDate: QUARTER_END,
        onTrack: true,
        createdBy: member.clerkUserId,
      });
      // eslint-disable-next-line no-console
      console.log(`  rock: ${r.title}`);
    }
  } else {
    // eslint-disable-next-line no-console
    console.log(`  rocks already exist (${existingRocks.length}), skipped`);
  }

  if (plan.addKpis > 0) {
    for (const k of KPIS) {
      const { goalValue, unit } = parseTarget(k.target);
      await db.insert(kpis).values({
        organizationId: org.id,
        teamId: defaultTeam.id,
        ownerEntityType: 'human',
        ownerExternalId: member.id,
        title: k.title,
        goalOperator: 'gte',
        goalValue,
        unit,
        timeGrain: k.cadence,
        createdBy: member.clerkUserId,
      });
      // eslint-disable-next-line no-console
      console.log(`  kpi: ${k.title} (target ${k.target}, ${k.cadence})`);
    }
  } else {
    // eslint-disable-next-line no-console
    console.log(`  kpis already exist (${existingKpis.length}), skipped`);
  }

  if (plan.addAgents > 0) {
    for (const slot of SOLO_AGENT_SLOTS) {
      const externalId = `AGT_${slugifyForAgentId(slot.name)}`;
      const rawMd = [
        `# ${slot.name}`,
        '',
        slot.mission,
        '',
        `**Role:** ${slot.role}`,
        `**Owner:** ${member.displayName || 'Dawson'}`,
        '',
        '_Seeded with the starter Solo Operator chart on 2026-05-24._',
      ].join('\n');
      await db.insert(managerAgents).values({
        orgId: org.id,
        ownerUserId: member.clerkUserId,
        ownerMemberId: member.id,
        name: slot.name,
        externalId,
        description: slot.mission,
        rawMd,
        frontmatter: { role: slot.role },
      }).onConflictDoNothing();
      // eslint-disable-next-line no-console
      console.log(`  agent: ${slot.name} (${externalId})`);
    }
  } else {
    // eslint-disable-next-line no-console
    console.log(`  manager_agents already exist (${existingAgents.length}), skipped`);
  }

  // ---- 5. Final state -----------------------------------------------
  const [finalRocks, finalKpis, finalAgents] = await Promise.all([
    db.select({ id: rocks.id }).from(rocks).where(and(eq(rocks.organizationId, org.id), isNull(rocks.deletedAt))),
    db.select({ id: kpis.id }).from(kpis).where(and(eq(kpis.organizationId, org.id), isNull(kpis.deletedAt))),
    db.select({ id: managerAgents.id }).from(managerAgents).where(and(eq(managerAgents.orgId, org.id), isNull(managerAgents.deletedAt))),
  ]);
  // eslint-disable-next-line no-console
  console.log('Done. Final counts:', { rocks: finalRocks.length, kpis: finalKpis.length, agents: finalAgents.length });
  process.exit(0);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
