// Portfolio "champion invite" + seed-a-new-org-from-the-template service.
//
// A portfolio owner invites ONE champion (a person, by email). They get a
// shareable tokenized accept LINK to send the champion (no email infra here).
// On ACCEPT, a BRAND-NEW org is created from the portfolio's template, the
// champion becomes its owner, the template's starter KPIs are seeded into it,
// and the new org is auto-linked into the portfolio as an active member.
//
// Distinct from portfolio-invites.ts (which links EXISTING orgs via consent).
// Mirrors portfolios.ts / portfolio-invites.ts: same db, schema, drizzle
// helpers, .js extensions, and PortfolioError envelope.

import { eq, and, desc } from 'drizzle-orm';
import { randomBytes } from 'crypto';
import { db } from '../config/database.js';
import {
  organizations,
  orgMembers,
  teams,
  teamMemberships,
  kpis,
  portfolioChampionInvites,
} from '../db/schema.js';
import { PortfolioError } from './portfolios.js';
import { linkMemberOrg } from './portfolios.js';
import { getPortfolioPresets } from './portfolio-presets.js';
import { placeOwnerOnStarterChart } from './starter-chart.js';
import { reconcileChartClaimByEmail } from './chart-claim-reconcile.js';

/** A fresh URL-safe token. crypto.randomBytes (normal server code may use it;
 *  only workflow scripts ban Math.random/Date). 24 bytes -> 32 base64url chars. */
function freshToken(): string {
  return randomBytes(24).toString('base64url');
}

// ---- Create ----

export interface CreateChampionInviteInput {
  portfolioOrgId: string;
  email: string;
  orgName?: string | null;
  invitedByUserId: string;
}

/**
 * Create a pending champion invite for a portfolio. Validates the org is a real
 * portfolio. Returns the new invite's id, token, and email.
 */
export async function createChampionInvite(
  input: CreateChampionInviteInput,
): Promise<{ id: string; token: string; email: string }> {
  const { portfolioOrgId, invitedByUserId } = input;
  const email = String(input.email || '').trim().toLowerCase();
  const orgName = input.orgName ? String(input.orgName).trim().slice(0, 255) : null;

  if (!portfolioOrgId) {
    throw new PortfolioError('INVALID_ORG', 'A portfolio org is required');
  }
  if (!invitedByUserId) {
    throw new PortfolioError('NOT_AUTHENTICATED', 'An inviter is required', 401);
  }
  if (!email) {
    throw new PortfolioError('INVALID_EMAIL', 'A champion email is required');
  }

  const [portfolio] = await db
    .select({ kind: organizations.kind })
    .from(organizations)
    .where(eq(organizations.id, portfolioOrgId))
    .limit(1);
  if (!portfolio) throw new PortfolioError('PORTFOLIO_NOT_FOUND', 'Portfolio not found', 404);
  if (portfolio.kind !== 'portfolio') {
    throw new PortfolioError('NOT_A_PORTFOLIO', 'Org is not a portfolio');
  }

  const [row] = await db.insert(portfolioChampionInvites).values({
    portfolioOrgId,
    email,
    orgName,
    token: freshToken(),
    status: 'pending',
    invitedByUserId,
  }).returning({ id: portfolioChampionInvites.id, token: portfolioChampionInvites.token, email: portfolioChampionInvites.email });

  return { id: row.id, token: row.token, email: row.email };
}

// ---- Read: invites for a portfolio (owner UI) ----

export interface ChampionInviteRow {
  id: string;
  email: string;
  orgName: string | null;
  token: string;
  status: string;
  createdOrgId: string | null;
  createdAt: Date;
}

/** Pending + accepted champion invites for a portfolio (for the owner UI). */
export async function listChampionInvites(
  portfolioOrgId: string,
): Promise<ChampionInviteRow[]> {
  if (!portfolioOrgId) return [];
  const rows = await db
    .select({
      id: portfolioChampionInvites.id,
      email: portfolioChampionInvites.email,
      orgName: portfolioChampionInvites.orgName,
      token: portfolioChampionInvites.token,
      status: portfolioChampionInvites.status,
      createdOrgId: portfolioChampionInvites.createdOrgId,
      createdAt: portfolioChampionInvites.createdAt,
    })
    .from(portfolioChampionInvites)
    .where(and(
      eq(portfolioChampionInvites.portfolioOrgId, portfolioOrgId),
      // pending + accepted (drop revoked from the list)
    ))
    .orderBy(desc(portfolioChampionInvites.createdAt));

  return rows
    .filter(r => r.status === 'pending' || r.status === 'accepted')
    .map(r => ({
      id: r.id,
      email: r.email,
      orgName: r.orgName ?? null,
      token: r.token,
      status: r.status as string,
      createdOrgId: r.createdOrgId ?? null,
      createdAt: r.createdAt,
    }));
}

// ---- Revoke ----

/** Set a pending invite to 'revoked'. Scoped to the portfolio so an inviteId
 *  from another portfolio can't be revoked here. No-op if not found/already
 *  acted on. */
export async function revokeChampionInvite(
  portfolioOrgId: string,
  inviteId: string,
): Promise<void> {
  if (!portfolioOrgId || !inviteId) return;
  await db
    .update(portfolioChampionInvites)
    .set({ status: 'revoked' })
    .where(and(
      eq(portfolioChampionInvites.id, inviteId),
      eq(portfolioChampionInvites.portfolioOrgId, portfolioOrgId),
      eq(portfolioChampionInvites.status, 'pending'),
    ));
}

// ---- Read: invite by token (accept page) ----

export interface ChampionInviteByToken {
  id: string;
  portfolioOrgId: string;
  portfolioName: string;
  email: string;
  orgName: string | null;
  status: string;
}

/** Load a champion invite by token (for the accept page), or null. */
export async function getChampionInviteByToken(
  token: string,
): Promise<ChampionInviteByToken | null> {
  if (!token) return null;
  const [row] = await db
    .select({
      id: portfolioChampionInvites.id,
      portfolioOrgId: portfolioChampionInvites.portfolioOrgId,
      portfolioName: organizations.name,
      email: portfolioChampionInvites.email,
      orgName: portfolioChampionInvites.orgName,
      status: portfolioChampionInvites.status,
    })
    .from(portfolioChampionInvites)
    .innerJoin(organizations, eq(organizations.id, portfolioChampionInvites.portfolioOrgId))
    .where(eq(portfolioChampionInvites.token, token))
    .limit(1);

  if (!row) return null;
  return {
    id: row.id,
    portfolioOrgId: row.portfolioOrgId,
    portfolioName: row.portfolioName,
    email: row.email,
    orgName: row.orgName ?? null,
    status: row.status as string,
  };
}

// ---- Accept: seed a new org from the template ----

export interface AcceptChampionInviteInput {
  token: string;
  clerkUserId: string;
  clerkEmail?: string | null;
  orgName?: string | null;
}

/**
 * Accept a champion invite. Loads the pending invite by token, creates a
 * brand-new standard org seeded from the portfolio's template, makes the
 * champion its owner, seeds the template's starter KPIs, links the new org into
 * the portfolio, and marks the invite accepted. Returns the new orgId.
 */
export async function acceptChampionInvite(
  input: AcceptChampionInviteInput,
): Promise<{ orgId: string }> {
  const { token, clerkUserId } = input;
  const clerkEmail = input.clerkEmail ? String(input.clerkEmail).trim() : null;

  if (!token) throw new PortfolioError('INVALID_TOKEN', 'An invite token is required');
  if (!clerkUserId) throw new PortfolioError('NOT_AUTHENTICATED', 'Sign in required', 401);

  // 1. Load pending invite by token.
  const [invite] = await db
    .select()
    .from(portfolioChampionInvites)
    .where(eq(portfolioChampionInvites.token, token))
    .limit(1);
  if (!invite) throw new PortfolioError('INVITE_NOT_FOUND', 'Invite not found', 404);
  if (invite.status !== 'pending') {
    throw new PortfolioError('INVITE_NOT_PENDING', 'This invite has already been used or revoked', 409);
  }

  const orgName = (input.orgName && String(input.orgName).trim())
    || invite.orgName
    || `${invite.email}'s organization`;

  // 2. Create the new standard org. Mirror createPortfolioAboveOrg's org insert
  //    for the required fields: clerkOrgId is synthetic (no real Clerk org yet),
  //    industry + size are NOT NULL with no default so they carry sentinels.
  const [newOrg] = await db.insert(organizations).values({
    name: orgName.slice(0, 255),
    kind: 'standard',
    clerkOrgId: `champion:${invite.id}`,
    industry: 'Unspecified',
    size: 'small',
  }).returning();

  // 3. Owner org_members row for the champion.
  const [ownerMember] = await db.insert(orgMembers).values({
    orgId: newOrg.id,
    clerkUserId,
    email: clerkEmail || invite.email,
    role: 'owner',
    status: 'active',
  }).returning({ id: orgMembers.id });

  // 4. Default Leadership Team + owner on chart. Best-effort -- a chart/team
  //    hiccup must not fail the whole accept (mirrors createPortfolio's
  //    markOrgEnterprise try/catch and onboarding's non-blocking provisioning).
  let teamId: string | null = null;
  try {
    let [leadTeam] = await db.select({ id: teams.id })
      .from(teams)
      .where(and(eq(teams.orgId, newOrg.id), eq(teams.slug, 'leadership')))
      .limit(1);
    if (!leadTeam) {
      try {
        [leadTeam] = await db.insert(teams)
          .values({ orgId: newOrg.id, name: 'Leadership Team', slug: 'leadership', type: 'leadership', isDefault: true })
          .returning({ id: teams.id });
      } catch { /* concurrent create -- re-read */ }
      if (!leadTeam) {
        [leadTeam] = await db.select({ id: teams.id })
          .from(teams)
          .where(and(eq(teams.orgId, newOrg.id), eq(teams.slug, 'leadership')))
          .limit(1);
      }
    }
    if (leadTeam) {
      teamId = leadTeam.id;
      try {
        await db.insert(teamMemberships)
          .values({ teamId: leadTeam.id, memberId: ownerMember.id, roleOnTeam: 'leader' });
      } catch { /* unique (team_id, member_id) -- already on the team */ }
    }
  } catch {
    // ignore -- team provisioning is secondary to the org/owner creation.
  }

  try {
    await placeOwnerOnStarterChart({
      orgId: newOrg.id,
      orgName,
      industry: 'Unspecified',
      orgSize: 'small',
      ownerDisplayName: clerkEmail || invite.email,
      ownerEmail: clerkEmail || invite.email,
      roleKey: 'other',
    });
    // Link the owner's org_members row to the chart tile carrying their email.
    await reconcileChartClaimByEmail(newOrg.id, ownerMember.id);
  } catch {
    // ignore -- chart placement is non-blocking, same as onboarding.
  }

  // 5. Seed the template's starter KPIs into the new org. Owner semantics mirror
  //    onboarding's POST /onboarding/kpi for a human owner: ownerEntityType
  //    'human' + ownerExternalId = the owner's org_members.id (the only valid
  //    entity in a brand-new org). A template KPI tagged ownerType 'agent' maps
  //    to ownerEntityType 'agent' but is still anchored to the owner member id.
  try {
    const presets = await getPortfolioPresets(invite.portfolioOrgId);
    const templateKpis = presets?.kpis ?? [];
    if (templateKpis.length > 0) {
      await db.insert(kpis).values(
        templateKpis.map((k) => ({
          organizationId: newOrg.id,
          teamId,
          ownerEntityType: (k.ownerType === 'agent' ? 'agent' : 'human') as 'agent' | 'human',
          ownerExternalId: ownerMember.id,
          title: k.title,
          goalOperator: k.goalOperator ?? null,
          goalValue: k.goalValue ?? null,
          unit: k.unit ?? null,
          timeGrain: (k.timeGrain ?? 'weekly') as 'weekly' | 'monthly' | 'quarterly',
          aggregationMethod: 'sum' as const,
          createdBy: clerkUserId,
        })),
      );
    }
  } catch {
    // ignore -- a KPI seeding hiccup must not abort the accept. The org exists
    // and is linked; the champion can add KPIs manually.
  }

  // 6. Link the new org into the portfolio as an active member.
  await linkMemberOrg(invite.portfolioOrgId, newOrg.id);

  // 7. Mark the invite accepted.
  await db
    .update(portfolioChampionInvites)
    .set({ status: 'accepted', acceptedAt: new Date(), createdOrgId: newOrg.id })
    .where(eq(portfolioChampionInvites.id, invite.id));

  return { orgId: newOrg.id };
}
