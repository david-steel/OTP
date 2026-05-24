// =====================================================================
// Starter-chart service -- places the owner on the chart at signup
// =====================================================================
// Called by the onboarding profile API right after the organization +
// owner org_member rows are created. Idempotent: safe to re-run on the
// same org without producing duplicates.
//
// Three things happen here, in order:
//
//   1. Ensure the org has a published starter OOS file. team-graph.ts
//      requires a published OOS to exist before it will clone a draft for
//      mutations; pre-this-service, brand-new orgs had no OOS and any
//      chart write throw NO_OOS. We seed a minimal valid one if missing.
//   2. Place the owner as a HUM_ entity on the chart with their chosen
//      role.
//   3. If the role triggers any extra seeding (Integrator -> vacant
//      Visionary above, Solo Operator -> empty agent army underneath),
//      do that.
//
// Why this lives in its own file:
//   - The same logic is needed by both /api/v1/onboarding/profile and the
//     scripts/backfill-chart-placement.ts one-shot.
//   - Tests get a single boundary to mock.

import { and, eq } from 'drizzle-orm';
import { db } from '../config/database.js';
import { charts, oosFiles } from '../db/schema.js';
import { ensureChartsTable } from '../db/ensure-charts.js';
import { createTeamEntity, getPrimaryChartId } from './team-graph.js';
import { getRole, SOLO_AGENT_SLOTS, type OnboardingRole } from '../data/onboarding-roles.js';

const STARTER_OOS_VERSION = 1;

function isoNow(): string {
  return new Date().toISOString();
}

function starterFrontmatterYAML(orgName: string, industry: string | null, orgSize: string | null): string {
  // Hand-rolled YAML so we don't pull in a dump dependency just for this.
  // All values are escaped with double quotes; orgName is sanitised below.
  const safe = (s: string) => String(s ?? '').replace(/"/g, '\\"');
  const lines = [
    'oos_version: "1.0"',
    `org_pseudonym: "${safe(orgName)}"`,
    industry ? `industry: "${safe(industry)}"` : null,
    orgSize ? `org_size: "${safe(orgSize)}"` : null,
    'template: "org_chart"',
    `generated_at: "${isoNow()}"`,
    `version: ${STARTER_OOS_VERSION}`,
    'parent_version: null',
    'word_count: 0',
    'claim_count: 0',
    'entities:',
    '  humans: []',
    '  agents: []',
  ].filter(Boolean);
  return lines.join('\n');
}

function starterRawContent(orgName: string, industry: string | null, orgSize: string | null): string {
  const fm = starterFrontmatterYAML(orgName, industry, orgSize);
  const body = [
    `# ${orgName} -- Accountability Chart`,
    '',
    'This chart was started during onboarding. Edit any seat, invite teammates, or add agents from the team dashboard.',
    '',
  ].join('\n');
  return `---\n${fm}\n---\n\n${body}`;
}

async function getPrimaryChartIdOrCreate(orgId: string): Promise<string> {
  // ensure-charts.ts backfills primary charts for all orgs at boot, but on
  // a brand-new org created mid-request we still want to be defensive.
  let id = await getPrimaryChartId(orgId);
  if (id) return id;
  await ensureChartsTable(); // re-runs the backfill INSERT for any org without a primary
  id = await getPrimaryChartId(orgId);
  if (id) return id;
  // Last resort: create one directly. ensureChartsTable's backfill should
  // have caught it, but races + retries should not 500 the user.
  const [row] = await db.insert(charts).values({
    orgId,
    name: 'Main',
    isPrimary: true,
  }).returning();
  return row.id;
}

async function ensureStarterOOS(
  orgId: string,
  chartId: string,
  orgName: string,
  industry: string | null,
  orgSize: string | null,
): Promise<void> {
  // If ANY oos file exists on this chart, we don't seed -- team-graph.ts
  // already has what it needs.
  const existing = await db.select({ id: oosFiles.id })
    .from(oosFiles)
    .where(and(eq(oosFiles.orgId, orgId), eq(oosFiles.chartId, chartId)))
    .limit(1);
  if (existing.length > 0) return;

  const raw = starterRawContent(orgName, industry, orgSize);
  // Minimal valid frontmatter the parser accepts. wordCount + claimCount
  // are required NOT NULL columns; 0 is fine for an empty starter.
  await db.insert(oosFiles).values({
    orgId,
    chartId,
    name: `${orgName} Starter Chart`,
    template: 'org_chart',
    version: STARTER_OOS_VERSION,
    status: 'published',
    visibilityDefault: 'free',
    wordCount: 0,
    claimCount: 0,
    rawContent: raw,
    frontmatter: {
      oos_version: '1.0',
      org_pseudonym: orgName,
      industry: industry || undefined,
      org_size: orgSize || undefined,
      template: 'org_chart',
      generated_at: isoNow(),
      version: STARTER_OOS_VERSION,
      parent_version: null,
      word_count: 0,
      claim_count: 0,
      entities: { humans: [], agents: [] },
    } as Record<string, unknown>,
    publishedAt: new Date(),
  });
}

export interface PlaceStarterInput {
  orgId: string;
  orgName: string;
  industry?: string | null;
  orgSize?: string | null;
  ownerDisplayName: string;
  ownerEmail?: string | null;
  roleKey: string; // validated upstream against ONBOARDING_ROLE_KEYS
}

export interface PlaceStarterResult {
  ok: true;
  ownerExternalId: string;
  visionaryExternalId: string | null;
  agentExternalIds: string[];
  skipped: boolean; // true if the owner was already on the chart
}

/**
 * Place the owner on the starter chart per their chosen role.
 *
 * Idempotent: if a human entity with the same contact_email already exists
 * on this org's chart, we skip the placement (and skip any role-driven
 * extras) so re-runs are safe.
 */
export async function placeOwnerOnStarterChart(input: PlaceStarterInput): Promise<PlaceStarterResult> {
  const role: OnboardingRole | null = getRole(input.roleKey);
  if (!role) {
    throw new Error(`Unknown onboarding role: ${input.roleKey}`);
  }

  const chartId = await getPrimaryChartIdOrCreate(input.orgId);
  await ensureStarterOOS(
    input.orgId,
    chartId,
    input.orgName,
    input.industry ?? null,
    input.orgSize ?? null,
  );

  // Idempotency check: don't duplicate a human that's already on the chart.
  // Email match is strongest. When the existing entity has NO contact_email
  // (common for hand-built charts or earlier ad-hoc imports), fall back to
  // a case-insensitive, whitespace-collapsed name match -- otherwise the
  // owner gets a "<Name>_1" duplicate every re-run. Caught 2026-05-24 on
  // Sneeze It's chart where the original HUM_DAVIDSTEEL had no email and
  // the backfill created HUM_DAVIDSTEEL_1.
  const normalizeName = (s: unknown) => String(s ?? '').toLowerCase().trim().replace(/\s+/g, ' ');
  const targetEmail = input.ownerEmail?.toLowerCase() || null;
  const targetName = normalizeName(input.ownerDisplayName);

  const [existing] = await db.select({ frontmatter: oosFiles.frontmatter })
    .from(oosFiles)
    .where(and(eq(oosFiles.orgId, input.orgId), eq(oosFiles.chartId, chartId)))
    .limit(1);
  const humans = ((existing?.frontmatter as any)?.entities?.humans || []) as any[];
  const match = humans.find((h) => {
    const existingEmail = String(h?.contact_email || '').toLowerCase();
    const existingName = normalizeName(h?.name);
    // Strong match: emails on both sides agree.
    if (targetEmail && existingEmail && existingEmail === targetEmail) return true;
    // Soft match: existing entity has no email, name matches. This treats a
    // pre-existing entity that was never linked to an email as the same
    // person, on the assumption that two distinct people with the same
    // name on the same chart with no contact info is rare enough that the
    // (very recoverable) false positive is preferable to a duplicate seat.
    if (!existingEmail && targetName && existingName === targetName) return true;
    return false;
  });
  if (match) {
    return {
      ok: true,
      ownerExternalId: String(match.id || ''),
      visionaryExternalId: null,
      agentExternalIds: [],
      skipped: true,
    };
  }

  // 1) Visionary FIRST (if Integrator picked this role), so we have its
  //    externalId to set as the Integrator's reports_to.
  let visionaryExternalId: string | null = null;
  if (role.createsVisionaryAbove) {
    const v = await createTeamEntity(input.orgId, {
      type: 'human',
      name: 'Visionary (vacant)',
      role: 'Visionary',
    }, chartId);
    visionaryExternalId = v.externalId;
  }

  // 2) The owner.
  const owner = await createTeamEntity(input.orgId, {
    type: 'human',
    name: input.ownerDisplayName,
    role: role.chartRole,
    contactEmail: input.ownerEmail || undefined,
    reportsTo: visionaryExternalId || undefined,
  }, chartId);

  // 3) Solo Operator AI army (each agent escalates to the owner).
  const agentExternalIds: string[] = [];
  if (role.isSolo) {
    for (const slot of SOLO_AGENT_SLOTS) {
      const a = await createTeamEntity(input.orgId, {
        type: 'agent',
        name: slot.name,
        role: slot.role,
        escalatesTo: owner.externalId,
      }, chartId);
      agentExternalIds.push(a.externalId);
    }
  }

  return {
    ok: true,
    ownerExternalId: owner.externalId,
    visionaryExternalId,
    agentExternalIds,
    skipped: false,
  };
}
