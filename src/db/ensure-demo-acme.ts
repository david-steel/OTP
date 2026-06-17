/**
 * Idempotent boot-time seed of the "Acme Corp" demo organization -- a fully
 * blown-out Looney Tunes cast for sales walkthroughs: accountability chart
 * (humans + AI agents WITH SOPs), scorecard KPIs, quarterly rocks, IDS issues,
 * to-dos, and a public consultant/expert profile. David impersonates the owner
 * (Wile E. Coyote) via /admin -> view-as.
 *
 * Versioned + self-healing: if the existing demo org predates the current
 * SEED_VERSION (detected by the absence of the v2 consultant profile), it is
 * wiped and re-seeded so the demo always matches this file. Whole body is
 * try/caught -- a hiccup can never crash boot.
 */
import { eq, sql } from 'drizzle-orm';
import { db } from '../config/database.js';
import {
  organizations, orgMembers, charts, oosFiles, teams, teamMemberships,
  kpis, rocks, tickets, todos, consultantProfiles,
  oosOperatingPlans, oosOperatingPlanSections,
} from './schema.js';

const DEMO_CLERK_ORG = 'demo_acme';
const DEMO_OWNER_CLERK = 'demo_acme_owner';
const PROFILE_SLUG = 'acme-corp';

const HUMANS: Record<string, unknown>[] = [
  { id: 'HUM_WILE', name: 'Wile E. Coyote', role: 'CEO / Visionary', authority_level: 'full', contact_email: 'wile@acme.example' },
  { id: 'HUM_BUGS', name: 'Bugs Bunny', role: 'Integrator / COO', authority_level: 'executive', reports_to: 'HUM_WILE', contact_email: 'bugs@acme.example' },
  { id: 'HUM_MARVIN', name: 'Marvin the Martian', role: 'Head of R&D (Rocket Division)', reports_to: 'HUM_WILE' },
  { id: 'HUM_ROADRUNNER', name: 'Road Runner', role: 'VP of Speed & Logistics', reports_to: 'HUM_BUGS' },
  { id: 'HUM_DAFFY', name: 'Daffy Duck', role: 'Director of Marketing', reports_to: 'HUM_BUGS' },
  { id: 'HUM_PORKY', name: 'Porky Pig', role: 'Director of Finance', reports_to: 'HUM_BUGS' },
  { id: 'HUM_ELMER', name: 'Elmer Fudd', role: 'Head of Security & Hunting Ops', reports_to: 'HUM_BUGS' },
  { id: 'HUM_GRANNY', name: 'Granny', role: 'Head of People', reports_to: 'HUM_BUGS' },
  { id: 'HUM_TWEETY', name: 'Tweety', role: 'Customer Success Lead', reports_to: 'HUM_DAFFY' },
  { id: 'HUM_SYLVESTER', name: 'Sylvester', role: 'Sales Lead', reports_to: 'HUM_DAFFY' },
];

const AGENTS: Record<string, unknown>[] = [
  {
    id: 'AGT_ANVIL', name: 'Anvil Ops Bot', role: 'Logistics Automation', escalates_to: 'HUM_ROADRUNNER', platform: 'OTP',
    mission: 'Get the right anvil to the right canyon at the right millisecond.',
    sops: [
      { title: 'Anvil Drop Sequence', trigger: 'Road Runner sighted on canyon road', steps: ['Confirm the coyote is clear of the drop zone', 'Calibrate release timing to target speed', 'Release anvil', 'Log outcome (historically: missed)'], tools: ['Acme Anvil Crane', 'Speed Radar'] },
      { title: 'Crate Restock', trigger: 'Anvil inventory < 10', steps: ['Auto-generate Acme purchase order', 'Notify Finance (Porky)'], tools: ['Acme Catalog'] },
    ],
  },
  {
    id: 'AGT_ROCKET', name: 'Rocket Telemetry AI', role: 'R&D Monitoring', escalates_to: 'HUM_MARVIN', platform: 'OTP',
    mission: 'Keep every rocket pointed away from the engineer.',
    sops: [
      { title: 'Pre-Launch Checklist', trigger: 'Rocket scheduled', steps: ['Verify fuel mix', 'Check fin alignment', 'Confirm abort channel', 'Green-light Marvin'], tools: ['Telemetry Console'] },
      { title: 'Abort & Recover', trigger: 'Trajectory deviation > 5°', steps: ['Trigger parachute', 'Notify R&D', 'File incident report'], tools: ['Abort Switch'] },
    ],
  },
  {
    id: 'AGT_TRAP', name: 'Trap Design Assistant', role: 'Trap Engineering', escalates_to: 'HUM_MARVIN', platform: 'OTP',
    mission: 'Catch the bird, not the boss.',
    sops: [
      { title: 'Trap Blueprint Review', trigger: 'New trap submitted', steps: ['Check for self-entrapment risk', 'Validate spring tension', 'Estimate Acme cost'], tools: ['CAD', 'Physics Sim'] },
    ],
  },
];

const KPI_DEFS = [
  { owner: 'HUM_ROADRUNNER', title: 'Road Runner Catch Rate %', goal: 5, unit: '%' },
  { owner: 'HUM_BUGS', title: 'Anvils Deployed (weekly)', goal: 50, unit: 'anvils' },
  { owner: 'HUM_MARVIN', title: 'Rockets Launched (weekly)', goal: 12, unit: 'rockets' },
  { owner: 'HUM_GRANNY', title: 'Coyote Survival Rate %', goal: 95, unit: '%' },
  { owner: 'HUM_PORKY', title: 'Birdseed Inventory (lbs)', goal: 500, unit: 'lbs' },
  { owner: 'HUM_TWEETY', title: 'Customer Beep-Beeps Resolved', goal: 30, unit: 'tickets' },
];

const ROCK_DEFS = [
  { owner: 'HUM_WILE', name: 'Wile E. Coyote', title: 'Finally catch the Road Runner', onTrack: false },
  { owner: 'HUM_MARVIN', name: 'Marvin the Martian', title: 'Launch Acme Rocket Skates v2', onTrack: true },
  { owner: 'HUM_BUGS', name: 'Bugs Bunny', title: 'Open 3 new desert-canyon territories', onTrack: true },
  { owner: 'HUM_DAFFY', name: 'Daffy Duck', title: 'Ship the Acme Earthquake Pills product line', onTrack: true },
  { owner: 'HUM_ELMER', name: 'Elmer Fudd', title: 'Cut anvil-related workplace incidents 20%', onTrack: false },
];

const TICKET_DEFS = [
  { title: 'Rocket skates keep launching in the wrong direction', desc: 'Three field tests, three cliffs. R&D suspects reversed thrust polarity.', priority: 'high' as const, category: 'bug' as const, owner: 'HUM_MARVIN', name: 'Marvin the Martian' },
  { title: 'The painted-on tunnel is fooling our own delivery trucks', desc: 'Two Acme trucks drove into the rock this week. Road Runner went through fine.', priority: 'high' as const, category: 'bug' as const, owner: 'HUM_ROADRUNNER', name: 'Road Runner' },
  { title: 'Birdseed supplier raised prices 40%', desc: 'Margin on the Bird Seed product line is now negative. Renegotiate or switch.', priority: 'medium' as const, category: 'other' as const, owner: 'HUM_PORKY', name: 'Porky Pig' },
  { title: 'Should we pivot from anvils to giant magnets?', desc: 'Strategic question for the leadership team. Anvil catch rate remains 0%.', priority: 'medium' as const, category: 'question' as const, owner: 'HUM_WILE', name: 'Wile E. Coyote' },
  { title: 'Customers want a money-back guarantee on traps', desc: 'Top support request this quarter. Feature ask from Customer Success.', priority: 'low' as const, category: 'feature' as const, owner: 'HUM_TWEETY', name: 'Tweety' },
];

const TODO_DEFS = [
  { owner: 'HUM_WILE', name: 'Wile E. Coyote', title: 'Repaint the fake tunnel (again)' },
  { owner: 'HUM_BUGS', name: 'Bugs Bunny', title: 'Order 500 more anvils from the Acme catalog' },
  { owner: 'HUM_MARVIN', name: 'Marvin the Martian', title: 'Schedule the rocket-skates retest at Dry Gulch' },
  { owner: 'HUM_GRANNY', name: 'Granny', title: 'Follow up with Road Runner re: catch-rate review' },
  { owner: 'HUM_PORKY', name: 'Porky Pig', title: 'Renew Acme liability insurance before Friday' },
];

async function wipeAcme(orgId: string): Promise<void> {
  await db.execute(sql`DELETE FROM rocks WHERE organization_id = ${orgId}`);
  await db.execute(sql`DELETE FROM kpis WHERE organization_id = ${orgId}`);
  await db.execute(sql`DELETE FROM tickets WHERE org_id = ${orgId}`);
  await db.execute(sql`DELETE FROM todos WHERE organization_id = ${orgId}`);
  await db.execute(sql`DELETE FROM consultant_profiles WHERE org_id = ${orgId}`);
  await db.execute(sql`DELETE FROM oos_operating_plans WHERE organization_id = ${orgId}`);
  await db.execute(sql`DELETE FROM team_memberships WHERE team_id IN (SELECT id FROM teams WHERE org_id = ${orgId})`);
  await db.execute(sql`DELETE FROM teams WHERE org_id = ${orgId}`);
  await db.execute(sql`DELETE FROM oos_files WHERE org_id = ${orgId}`);
  await db.execute(sql`DELETE FROM charts WHERE org_id = ${orgId}`);
  await db.execute(sql`DELETE FROM org_members WHERE org_id = ${orgId}`);
  await db.execute(sql`DELETE FROM organizations WHERE id = ${orgId}`);
}

export async function ensureDemoAcme(): Promise<void> {
  try {
    const [existing] = await db.select({ id: organizations.id })
      .from(organizations).where(eq(organizations.clerkOrgId, DEMO_CLERK_ORG)).limit(1);
    if (existing) {
      // v3 marker: the operating plan. Present => demo is current; absent =>
      // an older seed, so wipe and rebuild to the latest content.
      const [plan] = await db.select({ id: oosOperatingPlans.id })
        .from(oosOperatingPlans).where(eq(oosOperatingPlans.organizationId, existing.id)).limit(1);
      if (plan) return;
      await wipeAcme(existing.id);
    }

    const [org] = await db.insert(organizations).values({
      name: 'Acme Corp', industry: 'manufacturing', size: 'medium',
      clerkOrgId: DEMO_CLERK_ORG, public: false,
    }).returning();

    const [owner] = await db.insert(orgMembers).values({
      orgId: org.id, clerkUserId: DEMO_OWNER_CLERK, email: 'wile@acme.example',
      displayName: 'Wile E. Coyote', role: 'owner', status: 'active',
      claimedEntityId: 'HUM_WILE', claimedEntityIds: ['HUM_WILE'],
    }).returning();

    const [chart] = await db.insert(charts).values({ orgId: org.id, name: 'Main', isPrimary: true }).returning();

    await db.insert(oosFiles).values({
      orgId: org.id, chartId: chart.id, name: 'Acme Corp Chart', template: 'org_chart',
      version: 1, status: 'published', visibilityDefault: 'free', wordCount: 0, claimCount: 0,
      rawContent: '---\n---\n\n# Acme Corp -- Accountability Map\n',
      frontmatter: {
        oos_version: '1.0', org_pseudonym: 'Acme Corp', industry: 'manufacturing', org_size: 'medium',
        template: 'org_chart', generated_at: new Date().toISOString(), version: 1, parent_version: null,
        word_count: 0, claim_count: 0, entities: { humans: HUMANS, agents: AGENTS },
      } as Record<string, unknown>,
      publishedAt: new Date(),
    });

    const [team] = await db.insert(teams).values({
      orgId: org.id, name: 'Leadership Team', slug: 'leadership', type: 'leadership', isDefault: true,
    }).returning();
    await db.insert(teamMemberships).values({ teamId: team.id, memberId: owner.id, roleOnTeam: 'leader' });

    for (const k of KPI_DEFS) {
      await db.insert(kpis).values({
        organizationId: org.id, teamId: team.id, ownerEntityType: 'human', ownerExternalId: k.owner,
        title: k.title, goalOperator: 'gte', goalValue: k.goal, unit: k.unit, timeGrain: 'weekly',
        createdBy: DEMO_OWNER_CLERK,
      });
    }

    const now = new Date();
    const quarter = `${now.getFullYear()}-Q${Math.floor(now.getMonth() / 3) + 1}`;
    const dueDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 0);
    for (const r of ROCK_DEFS) {
      await db.insert(rocks).values({
        organizationId: org.id, teamId: team.id, ownerEntityType: 'human', ownerExternalId: r.owner,
        ownerName: r.name, title: r.title, quarter, dueDate, onTrack: r.onTrack, createdBy: DEMO_OWNER_CLERK,
      });
    }

    for (const t of TICKET_DEFS) {
      await db.insert(tickets).values({
        orgId: org.id, teamId: team.id, title: t.title, description: t.desc,
        status: 'open', priority: t.priority, category: t.category, idsStatus: 'open',
        ownerEntityType: 'human', ownerExternalId: t.owner, ownerName: t.name,
      });
    }

    const todoDue = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3);
    for (const td of TODO_DEFS) {
      await db.insert(todos).values({
        organizationId: org.id, teamId: team.id, kind: 'l10', ownerEntityType: 'human',
        ownerExternalId: td.owner, ownerName: td.name, title: td.title, dueAt: todoDue,
        createdBy: DEMO_OWNER_CLERK,
      });
    }

    await db.insert(consultantProfiles).values({
      orgId: org.id, slug: PROFILE_SLUG, displayName: 'Wile E. Coyote',
      headline: 'Chief Executive & Visionary, Acme Corp',
      bio: 'Super Genius. 30+ years pioneering rocket-propelled footwear, precision anvil logistics, and relentless pursuit strategy. I help ambitious teams move fast, iterate without fear, and never, ever give up -- no matter how many times the plan explodes. Currently scaling Acme Corp R&D and go-to-market across the American Southwest.',
      expertiseTags: ['Rocket Propulsion', 'Anvil Logistics', 'Relentless Persistence', 'Desert GTM', 'Trap Engineering', 'Rapid Prototyping'],
      contactEmail: 'wile@acme.example', published: true, isPublished: true,
    });

    // Operating plan (V/TO) -- 4 strategic sections filled with Acme flavor,
    // the rest created empty (ready to fill on screen during a demo).
    const [plan] = await db.insert(oosOperatingPlans).values({
      organizationId: org.id, title: 'Acme Corp Operating Plan', status: 'active', createdBy: DEMO_OWNER_CLERK,
    }).returning();
    const PLAN_SECTIONS: Array<{ key: any; title: string; sort: number; content: Record<string, unknown> }> = [
      { key: 'foundation', title: 'Core Foundation', sort: 1, content: {
        purpose: 'Catch the Road Runner.',
        mission: 'Engineer ingenious solutions for high-speed desert pursuit -- and supply the world with everything from anvils to rocket skates.',
        values: ['CHASE:', '• Cunning over brute force', '• Hustle relentlessly', '• Always iterate (the next plan WILL work)', '• Safety third', '• Embrace the boom'].join('\n'),
        ideal_customer: 'Ambitious predators with a recurring quarry, a generous gadget budget, and zero fear of failure.',
      } },
      { key: 'market_command', title: 'Market Command', sort: 2, content: {
        category: 'Premium pursuit hardware & rocket-propelled logistics.',
        unique_advantage: ['1) Next-day anvil delivery to any canyon.', '2) In-house rocket R&D division.', '3) The only catalog shipping giant magnets, earthquake pills, and portable holes.'].join('\n'),
        brand_promise: 'It works every time -- or your canyon back.',
        proof_points: ['Over 9,000 traps shipped.', 'Rocket Skates v1 reached Mach 2 (briefly).', 'Trusted by coyotes across the American Southwest.'].join('\n'),
      } },
      { key: 'destination', title: 'Destination', sort: 3, content: {
        year_target: 'Catch the Road Runner at least once. Hit $50M in anvil + rocket revenue. Open 3 new canyon territories.',
        year_target_year: '2029',
        ten_year_target: 'A successful catch on every continent, and an Acme product in every garage.',
        ten_year_target_year: '2036',
        revenue_goal: '$50M by 2029.',
        profit_goal: '15% (after anvil insurance).',
        defining_metric: 'Successful catches per quarter (current: 0).',
      } },
      { key: 'annual_game_plan', title: 'Annual Game Plan', sort: 4, content: {
        primary_objective: 'Ship Rocket Skates v2, cut anvil-related incidents 20%, and finally catch the Road Runner.',
        strategic_initiatives: ['Launch the Earthquake Pills product line', 'Open 3 desert-canyon territories', 'Stand up the Rocket Telemetry AI', 'Renegotiate the birdseed supply contract'],
      } },
      { key: 'ninety_day_engine', title: '90-Day Execution Engine', sort: 5, content: {} },
      { key: 'performance_scorecard', title: 'Performance Scorecard', sort: 6, content: {} },
      { key: 'constraints_leverage', title: 'Constraints & Leverage Points', sort: 7, content: {} },
      { key: 'alignment_accountability', title: 'Alignment & Accountability', sort: 8, content: {} },
    ];
    for (const s of PLAN_SECTIONS) {
      await db.insert(oosOperatingPlanSections).values({
        planId: plan.id, sectionKey: s.key, title: s.title, contentJson: s.content as Record<string, unknown>, sortOrder: s.sort,
      });
    }

    console.log('[demo] Acme Corp demo org seeded (v3, +operating plan) -- impersonate Wile E. Coyote via /admin.');
  } catch (err) {
    console.error('[demo] ensureDemoAcme failed (non-fatal):', err);
  }
}
