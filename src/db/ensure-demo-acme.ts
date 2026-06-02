/**
 * Idempotent boot-time seed of the "Acme Corp" demo organization -- a
 * Looney Tunes cast you can impersonate to show prospects a fully-populated
 * OTP org (accountability chart with humans + AI agents, scorecard KPIs,
 * quarterly rocks). David impersonates the owner (Wile E. Coyote) via
 * /admin -> view-as.
 *
 * Idempotent: gated on the org existing (clerk_org_id = 'demo_acme'). Wrapped
 * in try/catch so a seeding hiccup can never crash boot.
 */
import { eq } from 'drizzle-orm';
import { db } from '../config/database.js';
import {
  organizations, orgMembers, charts, oosFiles, teams, teamMemberships, kpis, rocks,
} from './schema.js';

const DEMO_CLERK_ORG = 'demo_acme';
const DEMO_OWNER_CLERK = 'demo_acme_owner';

// The cast. Humans carry reports_to to build the hierarchy; the owner (Wile)
// sits at the top. Agents escalate_to a human so they hang under their boss.
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
  { id: 'AGT_ANVIL', name: 'Anvil Ops Bot', role: 'Logistics Automation', escalates_to: 'HUM_ROADRUNNER', platform: 'OTP' },
  { id: 'AGT_ROCKET', name: 'Rocket Telemetry AI', role: 'R&D Monitoring', escalates_to: 'HUM_MARVIN', platform: 'OTP' },
  { id: 'AGT_TRAP', name: 'Trap Design Assistant', role: 'Trap Engineering', escalates_to: 'HUM_MARVIN', platform: 'OTP' },
];

export async function ensureDemoAcme(): Promise<void> {
  try {
    const [existing] = await db.select({ id: organizations.id })
      .from(organizations).where(eq(organizations.clerkOrgId, DEMO_CLERK_ORG)).limit(1);
    if (existing) return; // already seeded

    const [org] = await db.insert(organizations).values({
      name: 'Acme Corp',
      industry: 'manufacturing',
      size: 'medium',
      clerkOrgId: DEMO_CLERK_ORG,
      public: false,
    }).returning();

    const [owner] = await db.insert(orgMembers).values({
      orgId: org.id,
      clerkUserId: DEMO_OWNER_CLERK,
      email: 'wile@acme.example',
      displayName: 'Wile E. Coyote',
      role: 'owner',
      status: 'active',
      claimedEntityId: 'HUM_WILE',
      claimedEntityIds: ['HUM_WILE'],
    }).returning();

    const [chart] = await db.insert(charts).values({
      orgId: org.id, name: 'Main', isPrimary: true,
    }).returning();

    await db.insert(oosFiles).values({
      orgId: org.id,
      chartId: chart.id,
      name: 'Acme Corp Chart',
      template: 'org_chart',
      version: 1,
      status: 'published',
      visibilityDefault: 'free',
      wordCount: 0,
      claimCount: 0,
      rawContent: '---\n---\n\n# Acme Corp -- Accountability Chart\n',
      frontmatter: {
        oos_version: '1.0',
        org_pseudonym: 'Acme Corp',
        industry: 'manufacturing',
        org_size: 'medium',
        template: 'org_chart',
        generated_at: new Date().toISOString(),
        version: 1,
        parent_version: null,
        word_count: 0,
        claim_count: 0,
        entities: { humans: HUMANS, agents: AGENTS },
      } as Record<string, unknown>,
      publishedAt: new Date(),
    });

    const [team] = await db.insert(teams).values({
      orgId: org.id, name: 'Leadership Team', slug: 'leadership', type: 'leadership', isDefault: true,
    }).returning();
    await db.insert(teamMemberships).values({ teamId: team.id, memberId: owner.id, roleOnTeam: 'leader' });

    // Scorecard
    const KPIS = [
      { owner: 'HUM_ROADRUNNER', title: 'Road Runner Catch Rate %', goal: 5, unit: '%' },
      { owner: 'HUM_BUGS', title: 'Anvils Deployed', goal: 50, unit: 'anvils' },
      { owner: 'HUM_MARVIN', title: 'Rockets Launched', goal: 12, unit: 'rockets' },
      { owner: 'HUM_TWEETY', title: 'Customer Beep-Beeps Resolved', goal: 30, unit: 'tickets' },
    ];
    for (const k of KPIS) {
      await db.insert(kpis).values({
        organizationId: org.id, teamId: team.id,
        ownerEntityType: 'human', ownerExternalId: k.owner,
        title: k.title, goalOperator: 'gte', goalValue: k.goal, unit: k.unit,
        timeGrain: 'weekly', createdBy: DEMO_OWNER_CLERK,
      });
    }

    // Quarterly priorities
    const now = new Date();
    const quarter = `${now.getFullYear()}-Q${Math.floor(now.getMonth() / 3) + 1}`;
    const dueDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 0);
    const ROCKS = [
      { owner: 'HUM_WILE', name: 'Wile E. Coyote', title: 'Finally catch the Road Runner', onTrack: false },
      { owner: 'HUM_MARVIN', name: 'Marvin the Martian', title: 'Launch Acme Rocket Skates v2', onTrack: true },
      { owner: 'HUM_BUGS', name: 'Bugs Bunny', title: 'Open 3 new desert-canyon territories', onTrack: true },
      { owner: 'HUM_ELMER', name: 'Elmer Fudd', title: 'Cut anvil-related workplace incidents 20%', onTrack: false },
    ];
    for (const r of ROCKS) {
      await db.insert(rocks).values({
        organizationId: org.id, teamId: team.id,
        ownerEntityType: 'human', ownerExternalId: r.owner, ownerName: r.name,
        title: r.title, quarter, dueDate, onTrack: r.onTrack, createdBy: DEMO_OWNER_CLERK,
      });
    }

    console.log('[demo] Acme Corp demo org seeded -- impersonate Wile E. Coyote (/admin -> view-as) to demo.');
  } catch (err) {
    console.error('[demo] ensureDemoAcme failed (non-fatal):', err);
  }
}
