// src/services/portfolio-team.ts
// Portfolio TEAM: the people who sit on a Portfolio (super-org) so a portfolio
// meeting has attendees. Per the cross-org-membership rule, a portfolio team
// member must be drawn from the people in the portfolio's MEMBER (child) orgs --
// you cannot add an arbitrary user. Adding someone inserts an active org_members
// row in the portfolio org (role 'manager'); the portfolio meeting builder reads
// those rows as attendees (see routes/api/portfolios.ts POST /:id/meeting).
//
// Pure service: db + schema + drizzle + PortfolioError only. Routes live in
// routes/api/portfolio-team.ts.

import { and, eq, inArray } from 'drizzle-orm';
import { db } from '../config/database.js';
import { orgMembers, organizations, portfolioMembers } from '../db/schema.js';
import { PortfolioError } from './portfolios.js';

export interface PortfolioTeamMember {
  id: string;
  clerkUserId: string;
  displayName: string | null;
  email: string | null;
  role: string;
}

export interface PortfolioTeamCandidate {
  clerkUserId: string;
  displayName: string | null;
  email: string | null;
  sourceOrgs: string[]; // member-org names the person belongs to
}

/** Active member-org ids for a portfolio. */
async function activeMemberOrgIds(portfolioOrgId: string): Promise<string[]> {
  const rows = await db
    .select({ memberOrgId: portfolioMembers.memberOrgId })
    .from(portfolioMembers)
    .where(and(
      eq(portfolioMembers.portfolioOrgId, portfolioOrgId),
      eq(portfolioMembers.status, 'active'),
    ));
  return rows.map((r) => r.memberOrgId);
}

/** Current people on the portfolio (active org_members rows in the portfolio org). */
export async function listPortfolioTeam(portfolioOrgId: string): Promise<PortfolioTeamMember[]> {
  if (!portfolioOrgId) return [];
  const rows = await db
    .select({
      id: orgMembers.id,
      clerkUserId: orgMembers.clerkUserId,
      displayName: orgMembers.displayName,
      email: orgMembers.email,
      role: orgMembers.role,
    })
    .from(orgMembers)
    .where(and(eq(orgMembers.orgId, portfolioOrgId), eq(orgMembers.status, 'active')));
  return rows.map((r) => ({ ...r, role: r.role as string }));
}

/**
 * People in the portfolio's member orgs who are NOT yet on the portfolio team.
 * Deduped by clerkUserId, with the names of the member orgs they come from.
 */
export async function listMemberOrgCandidates(portfolioOrgId: string): Promise<PortfolioTeamCandidate[]> {
  if (!portfolioOrgId) return [];
  const memberOrgIds = await activeMemberOrgIds(portfolioOrgId);
  if (memberOrgIds.length === 0) return [];

  // Active people across the member orgs, with their source org name.
  const people = await db
    .select({
      clerkUserId: orgMembers.clerkUserId,
      displayName: orgMembers.displayName,
      email: orgMembers.email,
      orgName: organizations.name,
    })
    .from(orgMembers)
    .innerJoin(organizations, eq(organizations.id, orgMembers.orgId))
    .where(and(
      inArray(orgMembers.orgId, memberOrgIds),
      eq(orgMembers.status, 'active'),
    ));

  // Who is already on the portfolio team (exclude them).
  const existing = await db
    .select({ clerkUserId: orgMembers.clerkUserId })
    .from(orgMembers)
    .where(and(eq(orgMembers.orgId, portfolioOrgId), eq(orgMembers.status, 'active')));
  const onTeam = new Set(existing.map((e) => e.clerkUserId));

  const byUser = new Map<string, PortfolioTeamCandidate>();
  for (const p of people) {
    if (onTeam.has(p.clerkUserId)) continue;
    const c = byUser.get(p.clerkUserId);
    if (c) {
      if (p.orgName && !c.sourceOrgs.includes(p.orgName)) c.sourceOrgs.push(p.orgName);
      if (!c.displayName && p.displayName) c.displayName = p.displayName;
      if (!c.email && p.email) c.email = p.email;
    } else {
      byUser.set(p.clerkUserId, {
        clerkUserId: p.clerkUserId,
        displayName: p.displayName,
        email: p.email,
        sourceOrgs: p.orgName ? [p.orgName] : [],
      });
    }
  }
  return Array.from(byUser.values()).sort((a, b) =>
    (a.displayName || a.email || '').localeCompare(b.displayName || b.email || ''));
}

/**
 * Add a person from a member org to the portfolio team. Validates the user is an
 * ACTIVE member of at least one of the portfolio's member orgs (you can only pull
 * people who belong to a child org), then upserts an active 'manager' row in the
 * portfolio org. Idempotent: re-adding reactivates the existing row.
 */
export async function addPortfolioTeamMember(
  portfolioOrgId: string,
  clerkUserId: string,
): Promise<PortfolioTeamMember> {
  if (!portfolioOrgId) throw new PortfolioError('INVALID_ORG', 'A portfolio org is required');
  if (!clerkUserId) throw new PortfolioError('INVALID_USER', 'A user is required');

  const memberOrgIds = await activeMemberOrgIds(portfolioOrgId);
  if (memberOrgIds.length === 0) {
    throw new PortfolioError('NO_MEMBER_ORGS', 'This portfolio has no member organizations yet');
  }

  // The candidate must be an active member of one of the member orgs. Pull their
  // name/email from that row so the portfolio team member is labeled.
  const [source] = await db
    .select({ displayName: orgMembers.displayName, email: orgMembers.email })
    .from(orgMembers)
    .where(and(
      eq(orgMembers.clerkUserId, clerkUserId),
      inArray(orgMembers.orgId, memberOrgIds),
      eq(orgMembers.status, 'active'),
    ))
    .limit(1);
  if (!source) {
    throw new PortfolioError('NOT_IN_MEMBER_ORG', 'That person is not in one of this portfolio\'s member organizations');
  }

  const [row] = await db
    .insert(orgMembers)
    .values({
      orgId: portfolioOrgId,
      clerkUserId,
      displayName: source.displayName ?? null,
      email: source.email ?? null,
      role: 'manager',
      status: 'active',
    })
    .onConflictDoUpdate({
      target: [orgMembers.orgId, orgMembers.clerkUserId],
      set: {
        status: 'active',
        role: 'manager',
        displayName: source.displayName ?? null,
        email: source.email ?? null,
        updatedAt: new Date(),
      },
    })
    .returning({
      id: orgMembers.id,
      clerkUserId: orgMembers.clerkUserId,
      displayName: orgMembers.displayName,
      email: orgMembers.email,
      role: orgMembers.role,
    });

  return { ...row, role: row.role as string };
}

/**
 * Remove a person from the portfolio team. The row must belong to this portfolio
 * org and must not be the portfolio OWNER (you can't remove the owner from their
 * own portfolio). Hard-deletes the org_members row.
 */
export async function removePortfolioTeamMember(
  portfolioOrgId: string,
  memberId: string,
): Promise<void> {
  if (!portfolioOrgId || !memberId) {
    throw new PortfolioError('INVALID_REQUEST', 'Portfolio and member are required');
  }
  const [row] = await db
    .select({ id: orgMembers.id, role: orgMembers.role })
    .from(orgMembers)
    .where(and(eq(orgMembers.id, memberId), eq(orgMembers.orgId, portfolioOrgId)))
    .limit(1);
  if (!row) throw new PortfolioError('MEMBER_NOT_FOUND', 'Team member not found', 404);
  if (row.role === 'owner') {
    throw new PortfolioError('CANNOT_REMOVE_OWNER', 'The portfolio owner cannot be removed');
  }
  await db.delete(orgMembers).where(and(eq(orgMembers.id, memberId), eq(orgMembers.orgId, portfolioOrgId)));
}
