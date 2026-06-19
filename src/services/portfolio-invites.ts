// Portfolio invite + consent flow.
//
// Distinct from super-admin forced linking (linkMemberOrg in portfolios.ts).
// Here, a portfolio owner *invites* an existing standard org to attach itself,
// and an active owner of that member org must accept before the link goes live.
//
// The flow rides on the same portfolio_members table: a 'pending' row is the
// outstanding invite, 'active' is an accepted (live) link, 'declined' is a
// rejected invite. The unique index on (portfolio_org_id, member_org_id) means
// there is at most one row per pair, so invites are upserts.
//
// This layer is pure CRUD/AuthZ. It never recomputes rollups.

import { eq, and, inArray, ne } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { db } from '../config/database.js';
import { organizations, orgMembers, portfolioMembers } from '../db/schema.js';
import { PortfolioError } from './portfolios.js';

// Aliased reference to organizations so listPendingInvitesForUser can join it
// twice in one query (once for the portfolio name, once for the member name).
const memberOrgs = alias(organizations, 'member_orgs');

// ---- Invite ----

export interface InvitePortfolioMemberOrgInput {
  portfolioOrgId: string;
  memberOrgId: string;
  invitedByUserId: string;
  invitedEmail?: string | null;
}

/**
 * Invite an existing org to attach itself to a portfolio. Validates the
 * portfolio is a real portfolio, the member exists and is NOT itself a portfolio
 * (no nesting), and the two are distinct. If an ACTIVE link already exists this
 * throws (already a member). Otherwise it upserts a 'pending' row: a fresh
 * pending invite, or a previously declined/pending pair flipped back to pending.
 */
export async function invitePortfolioMemberOrg(
  input: InvitePortfolioMemberOrgInput,
): Promise<void> {
  const { portfolioOrgId, memberOrgId, invitedByUserId } = input;
  const invitedEmail = input.invitedEmail ?? null;

  if (portfolioOrgId === memberOrgId) {
    throw new PortfolioError('SELF_LINK', 'A portfolio cannot include itself');
  }
  if (!invitedByUserId) {
    throw new PortfolioError('NOT_AUTHENTICATED', 'An inviter is required', 401);
  }

  const [portfolio] = await db
    .select({ kind: organizations.kind })
    .from(organizations)
    .where(eq(organizations.id, portfolioOrgId))
    .limit(1);
  if (!portfolio) throw new PortfolioError('PORTFOLIO_NOT_FOUND', 'Portfolio not found', 404);
  if (portfolio.kind !== 'portfolio') {
    throw new PortfolioError('NOT_A_PORTFOLIO', 'Target org is not a portfolio');
  }

  const [member] = await db
    .select({ kind: organizations.kind })
    .from(organizations)
    .where(eq(organizations.id, memberOrgId))
    .limit(1);
  if (!member) throw new PortfolioError('MEMBER_NOT_FOUND', 'Member org not found', 404);
  if (member.kind === 'portfolio') {
    throw new PortfolioError('CANNOT_NEST_PORTFOLIO', 'Portfolios cannot be nested');
  }

  // Existing link for this pair? (unique index => at most one)
  const [existing] = await db
    .select({ id: portfolioMembers.id, status: portfolioMembers.status })
    .from(portfolioMembers)
    .where(and(
      eq(portfolioMembers.portfolioOrgId, portfolioOrgId),
      eq(portfolioMembers.memberOrgId, memberOrgId),
    ))
    .limit(1);

  if (existing && existing.status === 'active') {
    throw new PortfolioError('ALREADY_MEMBER', 'already a member');
  }

  if (existing) {
    // Re-invite: flip a pending/declined row back to pending.
    await db
      .update(portfolioMembers)
      .set({ status: 'pending', invitedByUserId, invitedEmail })
      .where(eq(portfolioMembers.id, existing.id));
    return;
  }

  await db.insert(portfolioMembers).values({
    portfolioOrgId,
    memberOrgId,
    status: 'pending',
    invitedByUserId,
    invitedEmail,
  });
}

// ---- Read: pending invites for a user ----

export interface PendingInvite {
  portfolioOrgId: string;
  portfolioName: string;
  memberOrgId: string;
  memberOrgName: string;
  invitedEmail: string | null;
}

/**
 * Pending portfolio invites the user can act on: those targeting an org the
 * user is an active OWNER of. Joins organizations for both portfolio and member
 * names.
 */
export async function listPendingInvitesForUser(
  clerkUserId: string,
): Promise<PendingInvite[]> {
  if (!clerkUserId) return [];

  // Orgs this user actively owns.
  const ownedOrgs = await db
    .select({ orgId: orgMembers.orgId })
    .from(orgMembers)
    .where(and(
      eq(orgMembers.clerkUserId, clerkUserId),
      eq(orgMembers.role, 'owner'),
      eq(orgMembers.status, 'active'),
    ));
  const ownedOrgIds = ownedOrgs.map(o => o.orgId);
  if (ownedOrgIds.length === 0) return [];

  const rows = await db
    .select({
      portfolioOrgId: portfolioMembers.portfolioOrgId,
      portfolioName: organizations.name,
      memberOrgId: portfolioMembers.memberOrgId,
      memberOrgName: memberOrgs.name,
      invitedEmail: portfolioMembers.invitedEmail,
    })
    .from(portfolioMembers)
    .innerJoin(organizations, eq(organizations.id, portfolioMembers.portfolioOrgId))
    .innerJoin(memberOrgs, eq(memberOrgs.id, portfolioMembers.memberOrgId))
    .where(and(
      eq(portfolioMembers.status, 'pending'),
      inArray(portfolioMembers.memberOrgId, ownedOrgIds),
    ));

  return rows.map(r => ({
    portfolioOrgId: r.portfolioOrgId,
    portfolioName: r.portfolioName,
    memberOrgId: r.memberOrgId,
    memberOrgName: r.memberOrgName,
    invitedEmail: r.invitedEmail ?? null,
  }));
}

// ---- Accept / Decline ----

export interface InviteActionInput {
  portfolioOrgId: string;
  memberOrgId: string;
  actorClerkUserId: string;
}

/**
 * Accept a pending invite: flips the pending row to 'active'. The actor must be
 * an active owner of the member org.
 */
export async function acceptPortfolioInvite(input: InviteActionInput): Promise<void> {
  await setInviteStatus(input, 'active');
}

/**
 * Decline a pending invite: flips the pending row to 'declined'. The actor must
 * be an active owner of the member org.
 */
export async function declinePortfolioInvite(input: InviteActionInput): Promise<void> {
  await setInviteStatus(input, 'declined');
}

async function setInviteStatus(
  input: InviteActionInput,
  nextStatus: 'active' | 'declined',
): Promise<void> {
  const { portfolioOrgId, memberOrgId, actorClerkUserId } = input;

  // AuthZ: actor must actively own the member org.
  const [owner] = await db
    .select({ id: orgMembers.id })
    .from(orgMembers)
    .where(and(
      eq(orgMembers.orgId, memberOrgId),
      eq(orgMembers.clerkUserId, actorClerkUserId),
      eq(orgMembers.role, 'owner'),
      eq(orgMembers.status, 'active'),
    ))
    .limit(1);
  if (!owner) {
    throw new PortfolioError('NOT_AUTHORIZED', 'Not an owner of this org', 403);
  }

  const [pending] = await db
    .select({ id: portfolioMembers.id })
    .from(portfolioMembers)
    .where(and(
      eq(portfolioMembers.portfolioOrgId, portfolioOrgId),
      eq(portfolioMembers.memberOrgId, memberOrgId),
      eq(portfolioMembers.status, 'pending'),
    ))
    .limit(1);
  if (!pending) {
    throw new PortfolioError('INVITE_NOT_FOUND', 'No pending invite for this org', 404);
  }

  await db
    .update(portfolioMembers)
    .set({ status: nextStatus })
    .where(eq(portfolioMembers.id, pending.id));
}

// ---- Read: invites for a portfolio (owner UI) ----

export interface PortfolioInviteRow {
  memberOrgId: string;
  memberOrgName: string;
  status: string;
  invitedEmail: string | null;
}

/**
 * All non-active link rows (pending/declined) for a portfolio, for the
 * portfolio owner's invite-management UI. Active (live) members are listed
 * elsewhere via getPortfolioDetail.
 */
export async function listPortfolioInvitesForPortfolio(
  portfolioOrgId: string,
): Promise<PortfolioInviteRow[]> {
  const rows = await db
    .select({
      memberOrgId: portfolioMembers.memberOrgId,
      memberOrgName: organizations.name,
      status: portfolioMembers.status,
      invitedEmail: portfolioMembers.invitedEmail,
    })
    .from(portfolioMembers)
    .innerJoin(organizations, eq(organizations.id, portfolioMembers.memberOrgId))
    .where(and(
      eq(portfolioMembers.portfolioOrgId, portfolioOrgId),
      ne(portfolioMembers.status, 'active'),
    ));

  return rows.map(r => ({
    memberOrgId: r.memberOrgId,
    memberOrgName: r.memberOrgName,
    status: r.status as string,
    invitedEmail: r.invitedEmail ?? null,
  }));
}
