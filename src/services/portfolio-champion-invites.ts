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

import { eq, and, desc, or, gt, isNull } from 'drizzle-orm';
import { randomBytes } from 'crypto';
import { db } from '../config/database.js';
import {
  organizations,
  orgMembers,
  teams,
  teamMemberships,
  kpis,
  portfolioMembers,
  portfolioChampionInvites,
} from '../db/schema.js';
import { PortfolioError } from './portfolios.js';
import { getPortfolioPresets } from './portfolio-presets.js';
import { placeOwnerOnStarterChart } from './starter-chart.js';
import { reconcileChartClaimByEmail } from './chart-claim-reconcile.js';

/** A fresh URL-safe token. crypto.randomBytes (normal server code may use it;
 *  only workflow scripts ban Math.random/Date). 24 bytes -> 32 base64url chars. */
function freshToken(): string {
  return randomBytes(24).toString('base64url');
}

/** How long an invite link stays valid. */
const INVITE_EXPIRY_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

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
export interface CreatedChampionInvite {
  id: string;
  token: string;
  email: string;
  expiresAt: Date;
  portfolioName: string;
}

export async function createChampionInvite(
  input: CreateChampionInviteInput,
): Promise<CreatedChampionInvite> {
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
    .select({ kind: organizations.kind, name: organizations.name })
    .from(organizations)
    .where(eq(organizations.id, portfolioOrgId))
    .limit(1);
  if (!portfolio) throw new PortfolioError('PORTFOLIO_NOT_FOUND', 'Portfolio not found', 404);
  if (portfolio.kind !== 'portfolio') {
    throw new PortfolioError('NOT_A_PORTFOLIO', 'Org is not a portfolio');
  }

  const expiresAt = new Date(Date.now() + INVITE_EXPIRY_MS);
  const [row] = await db.insert(portfolioChampionInvites).values({
    portfolioOrgId,
    email,
    orgName,
    token: freshToken(),
    status: 'pending',
    invitedByUserId,
    expiresAt,
  }).returning({ id: portfolioChampionInvites.id, token: portfolioChampionInvites.token, email: portfolioChampionInvites.email });

  return { id: row.id, token: row.token, email: row.email, expiresAt, portfolioName: portfolio.name };
}

/**
 * Re-fire a pending invite: rotate to a fresh token + a new 14-day expiry, keep
 * the same row. Scoped to the portfolio so an inviteId from elsewhere can't be
 * resent here. Returns the data needed to re-send the email. Mirrors the team
 * invite resend flow.
 */
export async function resendChampionInvite(
  portfolioOrgId: string,
  inviteId: string,
): Promise<{ token: string; email: string; expiresAt: Date; portfolioName: string }> {
  if (!portfolioOrgId || !inviteId) {
    throw new PortfolioError('INVALID_REQUEST', 'Portfolio and invite are required');
  }
  const [invite] = await db
    .select({ id: portfolioChampionInvites.id, email: portfolioChampionInvites.email, status: portfolioChampionInvites.status })
    .from(portfolioChampionInvites)
    .where(and(
      eq(portfolioChampionInvites.id, inviteId),
      eq(portfolioChampionInvites.portfolioOrgId, portfolioOrgId),
    ))
    .limit(1);
  if (!invite) throw new PortfolioError('INVITE_NOT_FOUND', 'Invite not found', 404);
  if (invite.status !== 'pending') {
    throw new PortfolioError('INVITE_NOT_PENDING', 'Only a pending invite can be resent', 409);
  }

  const [portfolio] = await db
    .select({ name: organizations.name })
    .from(organizations)
    .where(eq(organizations.id, portfolioOrgId))
    .limit(1);

  const token = freshToken();
  const expiresAt = new Date(Date.now() + INVITE_EXPIRY_MS);
  await db
    .update(portfolioChampionInvites)
    .set({ token, expiresAt })
    .where(eq(portfolioChampionInvites.id, inviteId));

  return { token, email: invite.email, expiresAt, portfolioName: portfolio?.name || 'Portfolio' };
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
  expiresAt: Date | null;
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
      expiresAt: portfolioChampionInvites.expiresAt,
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
    expiresAt: row.expiresAt ?? null,
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
 * Accept a champion invite. HARDENED:
 *  - The must-be-atomic CORE (atomically claim the pending invite, create the org
 *    + owner, link into the portfolio, record createdOrgId) runs in ONE
 *    transaction. The atomic claim (UPDATE ... WHERE status='pending' ...
 *    RETURNING) makes accept exactly-once: a double-click or concurrent accept
 *    finds no pending row and 409s -- never a duplicate org. If any core step
 *    throws, the whole transaction rolls back, so a failed accept leaves the
 *    invite pending (retryable) and NEVER a half-created / unlinked org.
 *  - Expired invites are rejected (both an early check for a clean error and the
 *    claim's WHERE clause as defense-in-depth).
 *  - Best-effort ENRICHMENT (default team, starter-KPI seeding, chart placement)
 *    runs AFTER commit. It must stay outside the transaction: in Postgres a
 *    single failed statement poisons the whole tx, so a swallowed error inside it
 *    would abort everything. Post-commit, each piece is isolated -- a seeding
 *    hiccup can't undo the org/owner/link.
 * Returns the new orgId.
 */
export async function acceptChampionInvite(
  input: AcceptChampionInviteInput,
): Promise<{ orgId: string }> {
  const { token, clerkUserId } = input;
  const clerkEmail = input.clerkEmail ? String(input.clerkEmail).trim() : null;

  if (!token) throw new PortfolioError('INVALID_TOKEN', 'An invite token is required');
  if (!clerkUserId) throw new PortfolioError('NOT_AUTHENTICATED', 'Sign in required', 401);

  // Early read for clean, specific errors (the tx claim is the real guard).
  const [invite] = await db
    .select()
    .from(portfolioChampionInvites)
    .where(eq(portfolioChampionInvites.token, token))
    .limit(1);
  if (!invite) throw new PortfolioError('INVITE_NOT_FOUND', 'Invite not found', 404);
  if (invite.status !== 'pending') {
    throw new PortfolioError('INVITE_NOT_PENDING', 'This invite has already been used or revoked', 409);
  }
  if (invite.expiresAt && invite.expiresAt.getTime() < Date.now()) {
    throw new PortfolioError('INVITE_EXPIRED', 'This invite link has expired', 410);
  }

  const orgName = (input.orgName && String(input.orgName).trim())
    || invite.orgName
    || `${invite.email}'s organization`;
  const ownerEmail = clerkEmail || invite.email;

  // Read the template (portfolio presets) BEFORE the tx -- it's pre-existing data.
  let templateKpis: NonNullable<Awaited<ReturnType<typeof getPortfolioPresets>>>['kpis'] = [];
  try {
    const presets = await getPortfolioPresets(invite.portfolioOrgId);
    templateKpis = presets?.kpis ?? [];
  } catch {
    templateKpis = [];
  }

  // ---- Atomic core, all-or-nothing ----
  const now = new Date();
  const core = await db.transaction(async (tx) => {
    // Atomic claim: flip pending -> accepted. WHERE also re-checks expiry so an
    // invite that lapsed between the read and here can't slip through. If 0 rows
    // come back, another accept won the race (or it lapsed) -> 409.
    const claimed = await tx
      .update(portfolioChampionInvites)
      .set({ status: 'accepted', acceptedAt: now })
      .where(and(
        eq(portfolioChampionInvites.id, invite.id),
        eq(portfolioChampionInvites.status, 'pending'),
        or(isNull(portfolioChampionInvites.expiresAt), gt(portfolioChampionInvites.expiresAt, now)),
      ))
      .returning({ id: portfolioChampionInvites.id });
    if (claimed.length === 0) {
      throw new PortfolioError('INVITE_NOT_PENDING', 'This invite has already been used, revoked, or expired', 409);
    }

    // New standard org (synthetic clerkOrgId; industry/size are NOT NULL sentinels).
    const [newOrg] = await tx.insert(organizations).values({
      name: orgName.slice(0, 255),
      kind: 'standard',
      clerkOrgId: `champion:${invite.id}`,
      industry: 'Unspecified',
      size: 'small',
    }).returning({ id: organizations.id });

    // Owner org_members row for the champion.
    const [ownerMember] = await tx.insert(orgMembers).values({
      orgId: newOrg.id,
      clerkUserId,
      email: ownerEmail,
      role: 'owner',
      status: 'active',
    }).returning({ id: orgMembers.id });

    // Link the new org into the portfolio (inline so it's part of the tx; mirrors
    // linkMemberOrg's insert). onConflictDoNothing for the (portfolio, member) uk.
    await tx.insert(portfolioMembers)
      .values({ portfolioOrgId: invite.portfolioOrgId, memberOrgId: newOrg.id, status: 'active' })
      .onConflictDoNothing();

    // Record which org this invite produced.
    await tx.update(portfolioChampionInvites)
      .set({ createdOrgId: newOrg.id })
      .where(eq(portfolioChampionInvites.id, invite.id));

    return { orgId: newOrg.id, ownerMemberId: ownerMember.id };
  });

  // ---- Best-effort enrichment, post-commit (each isolated) ----
  // Default Leadership Team + owner membership.
  let teamId: string | null = null;
  try {
    let [leadTeam] = await db.select({ id: teams.id })
      .from(teams)
      .where(and(eq(teams.orgId, core.orgId), eq(teams.slug, 'leadership')))
      .limit(1);
    if (!leadTeam) {
      try {
        [leadTeam] = await db.insert(teams)
          .values({ orgId: core.orgId, name: 'Leadership Team', slug: 'leadership', type: 'leadership', isDefault: true })
          .returning({ id: teams.id });
      } catch { /* concurrent create -- re-read */ }
      if (!leadTeam) {
        [leadTeam] = await db.select({ id: teams.id })
          .from(teams)
          .where(and(eq(teams.orgId, core.orgId), eq(teams.slug, 'leadership')))
          .limit(1);
      }
    }
    if (leadTeam) {
      teamId = leadTeam.id;
      try {
        await db.insert(teamMemberships)
          .values({ teamId: leadTeam.id, memberId: core.ownerMemberId, roleOnTeam: 'leader' });
      } catch { /* unique (team_id, member_id) -- already on the team */ }
    }
  } catch {
    // ignore -- team provisioning is secondary; the org exists and is linked.
  }

  // Seed the template's starter KPIs. Owner semantics mirror onboarding's
  // human-owned KPI: ownerEntityType from the template, ownerExternalId = the
  // owner's org_members.id (the only valid entity in a brand-new org).
  try {
    if (templateKpis.length > 0) {
      await db.insert(kpis).values(
        templateKpis.map((k) => ({
          organizationId: core.orgId,
          teamId,
          ownerEntityType: (k.ownerType === 'agent' ? 'agent' : 'human') as 'agent' | 'human',
          ownerExternalId: core.ownerMemberId,
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
    // ignore -- a KPI seeding hiccup must not matter; the champion can add KPIs.
  }

  // Place the owner on the starter org chart.
  try {
    await placeOwnerOnStarterChart({
      orgId: core.orgId,
      orgName,
      industry: 'Unspecified',
      orgSize: 'small',
      ownerDisplayName: ownerEmail,
      ownerEmail,
      roleKey: 'other',
    });
    await reconcileChartClaimByEmail(core.orgId, core.ownerMemberId);
  } catch {
    // ignore -- chart placement is non-blocking, same as onboarding.
  }

  return { orgId: core.orgId };
}
