// Org membership service (Phase 4.6).
//
// Two roles only: owner (full edit + invite + billing) and member (full edit
// inside the org except invite management and billing). One member per Clerk
// user per org. Members may claim a specific human entity tile on the team
// chart; the chart's "claimed by" badge reads from claimed_entity_id.
//
// Invitations are token-based. The plain token is sent in the email link; only
// a SHA-256 hash is stored. Default TTL: 30 days. Revocable by owner.

import { eq, and, lte, sql } from 'drizzle-orm';
import { randomBytes, createHash } from 'crypto';
import { db } from '../config/database.js';
import { orgMembers, orgInvitations, organizations } from '../db/schema.js';
import { reconcileChartClaimByEmail } from './chart-claim-reconcile.js';

export const INVITATION_TTL_DAYS = 30;

// Ninety-style role hierarchy. 'member' is a deprecated legacy value that
// remains in the DB enum until a future re-typing migration; new code paths
// should use 'managee' instead.
export type Role =
  | 'owner'
  | 'admin'
  | 'manager'
  | 'managee'
  | 'inactive'
  | 'observer'
  | 'implementer'
  | 'visionary'
  | 'integrator'
  | 'free'
  | 'member'; // deprecated

export class MembershipError extends Error {
  constructor(public code: string, message: string, public httpStatus = 400) {
    super(message);
  }
}

// ---- Token helpers ----

function generateToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString('base64url');
  const tokenHash = createHash('sha256').update(token).digest('hex');
  return { token, tokenHash };
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

// ---- Read-side: who is this user inside this org? ----

export async function getRoleForUser(orgId: string, clerkUserId: string): Promise<Role | null> {
  if (!orgId || !clerkUserId) return null;
  const [row] = await db
    .select({ role: orgMembers.role, status: orgMembers.status })
    .from(orgMembers)
    .where(and(eq(orgMembers.orgId, orgId), eq(orgMembers.clerkUserId, clerkUserId)))
    .limit(1);
  if (!row) return null;
  if (row.status !== 'active') return null;
  return row.role as Role;
}

/**
 * Resolve the org for a logged-in Clerk user. Tries (in order):
 *   1. org_members membership (covers both owners-via-seed and invited members).
 *   2. organizations.clerk_org_id direct match (legacy ownership).
 * Returns the full organizations row + role + claimed_entity_id for chart UI.
 */
export async function resolveOrgForUser(clerkUserId: string): Promise<{
  org: typeof organizations.$inferSelect;
  role: Role;
  claimedEntityId: string | null;
} | null> {
  if (!clerkUserId) return null;

  // Membership lookup wins (covers any user invited or seeded).
  const [memberRow] = await db
    .select({
      org: organizations,
      role: orgMembers.role,
      claimedEntityId: orgMembers.claimedEntityId,
      memberStatus: orgMembers.status,
    })
    .from(orgMembers)
    .innerJoin(organizations, eq(organizations.id, orgMembers.orgId))
    .where(and(eq(orgMembers.clerkUserId, clerkUserId), eq(orgMembers.status, 'active')))
    .limit(1);

  if (memberRow) {
    return { org: memberRow.org, role: memberRow.role as Role, claimedEntityId: memberRow.claimedEntityId };
  }

  // Fallback for any org row not yet seeded into org_members (defensive).
  const [legacy] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.clerkOrgId, clerkUserId))
    .limit(1);
  if (legacy) return { org: legacy, role: 'owner', claimedEntityId: null };

  return null;
}

export async function getOrgsForUser(clerkUserId: string): Promise<{ orgId: string; role: Role; claimedEntityId: string | null }[]> {
  if (!clerkUserId) return [];
  const rows = await db
    .select({
      orgId: orgMembers.orgId,
      role: orgMembers.role,
      claimedEntityId: orgMembers.claimedEntityId,
      status: orgMembers.status,
    })
    .from(orgMembers)
    .where(eq(orgMembers.clerkUserId, clerkUserId));
  return rows
    .filter(r => r.status === 'active')
    .map(r => ({ orgId: r.orgId, role: r.role as Role, claimedEntityId: r.claimedEntityId }));
}

export async function listMembers(orgId: string) {
  return await db
    .select()
    .from(orgMembers)
    .where(and(eq(orgMembers.orgId, orgId), eq(orgMembers.status, 'active')));
}

// ---- Invite issuance ----

export interface AccessToggles {
  feature?: Record<string, boolean>;
  data?: Record<string, boolean>;
  agent?: Record<string, boolean>;
}

export interface IssueInviteOptions {
  orgId: string;
  ownerUserId: string;        // Clerk user issuing the invite (must hold a role authorized to invite)
  email: string;
  claimedEntityId?: string | null;     // primary tile (back-compat with single-seat code paths)
  claimedEntityIds?: string[];          // all tiles this human holds; primary is the first element
  role?: Role;                // default 'managee'
  displayName?: string | null;
  access?: AccessToggles;     // pre-configured toggles, copied to org_members on accept
  teamIds?: string[];         // team UUIDs to add the new member to on accept
  ttlDays?: number;           // default INVITATION_TTL_DAYS
}

export interface IssuedInvite {
  invitationId: string;
  token: string;              // ONLY returned at issuance time, send via email then forget
  email: string;
  claimedEntityId: string | null;
  expiresAt: Date;
  acceptUrl: string;          // helper for the email template
}

export async function issueInvite(opts: IssueInviteOptions, baseUrl: string): Promise<IssuedInvite> {
  const role = opts.role || 'managee';
  const ttl = (opts.ttlDays ?? INVITATION_TTL_DAYS) * 24 * 60 * 60 * 1000;

  // Owner / admin / manager may issue invitations. Anything else is denied.
  // Mirrors permissions.canInviteMembers without importing it (services layer
  // stays free of middleware deps).
  const inviterRole = await getRoleForUser(opts.orgId, opts.ownerUserId);
  const allowedToInvite: Role[] = ['owner', 'admin', 'manager'];
  if (!inviterRole || !allowedToInvite.includes(inviterRole)) {
    throw new MembershipError(
      'CANNOT_INVITE',
      'Your role does not allow issuing invitations',
      403
    );
  }
  const email = String(opts.email || '').trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new MembershipError('INVALID_EMAIL', 'A valid email is required');
  }

  // If there is already an active pending invite for the same email/org/tile,
  // return that instead of creating a duplicate. Owner can revoke + reissue
  // explicitly if they want a new token.
  const [existing] = await db
    .select()
    .from(orgInvitations)
    .where(and(
      eq(orgInvitations.orgId, opts.orgId),
      eq(orgInvitations.email, email),
      eq(orgInvitations.status, 'pending')
    ))
    .limit(1);
  if (existing && existing.expiresAt > new Date()) {
    // Cannot return the original token (we hashed it). Revoke + reissue is the
    // explicit owner action. For now, return a new invite alongside, marking
    // the old one revoked so there is one live token.
    await db.update(orgInvitations).set({ status: 'revoked' }).where(eq(orgInvitations.id, existing.id));
  }

  const { token, tokenHash } = generateToken();
  const expiresAt = new Date(Date.now() + ttl);

  // Normalise the multi-seat list. If the caller only sent a single
  // claimedEntityId, treat it as a one-element list. If they sent a list,
  // the first element becomes the back-compat single field.
  const seatList = (opts.claimedEntityIds && opts.claimedEntityIds.length > 0)
    ? Array.from(new Set(opts.claimedEntityIds.filter(Boolean)))
    : (opts.claimedEntityId ? [opts.claimedEntityId] : []);
  const primarySeat = seatList[0] || opts.claimedEntityId || null;

  const teamList = (opts.teamIds && opts.teamIds.length > 0)
    ? Array.from(new Set(opts.teamIds.filter(Boolean)))
    : [];

  const [created] = await db.insert(orgInvitations).values({
    orgId: opts.orgId,
    email,
    role,
    claimedEntityId: primarySeat,
    claimedEntityIds: seatList,
    displayName: opts.displayName || null,
    featureAccess: opts.access?.feature || {},
    dataAccess: opts.access?.data || {},
    agentAccess: opts.access?.agent || {},
    teamIds: teamList,
    tokenHash,
    expiresAt,
    createdByUserId: opts.ownerUserId,
    status: 'pending',
  }).returning();

  const acceptUrl = `${baseUrl.replace(/\/$/, '')}/accept-invite?token=${token}`;

  return {
    invitationId: created.id,
    token,
    email,
    claimedEntityId: created.claimedEntityId,
    expiresAt,
    acceptUrl,
  };
}

// ---- Invite acceptance ----

export interface AcceptInviteResult {
  ok: true;
  orgId: string;
  role: Role;
  claimedEntityId: string | null;
  memberId: string;
}

export async function acceptInvite(token: string, clerkUserId: string, userEmail: string | null): Promise<AcceptInviteResult> {
  if (!token) throw new MembershipError('MISSING_TOKEN', 'Token is required');
  if (!clerkUserId) throw new MembershipError('NOT_AUTHENTICATED', 'You must sign in to accept', 401);

  const tokenHash = hashToken(token);
  const [inv] = await db
    .select()
    .from(orgInvitations)
    .where(eq(orgInvitations.tokenHash, tokenHash))
    .limit(1);
  if (!inv) throw new MembershipError('INVALID_TOKEN', 'Invitation token is invalid', 404);
  if (inv.status !== 'pending') {
    throw new MembershipError(
      `INVITATION_${inv.status.toUpperCase()}`,
      `This invitation has already been ${inv.status}`,
      410
    );
  }
  if (inv.expiresAt < new Date()) {
    await db.update(orgInvitations).set({ status: 'expired' }).where(eq(orgInvitations.id, inv.id));
    throw new MembershipError('INVITATION_EXPIRED', 'This invitation has expired', 410);
  }

  // Soft email check: if the invitee email and the Clerk-account email mismatch,
  // log it but still accept (owner-controlled invitation flow). If you want
  // strict email-match, return an error here instead.
  // (Per Q6-A: auto-link existing users without friction.)

  // Idempotency: if a member row already exists, reactivate it if it was
  // revoked / suspended / inactive, and apply the new invitation's role +
  // toggles + claimed tiles + display name. This is the path David hit when
  // re-inviting a previously-revoked teammate -- without the reactivation,
  // the existing row stayed status='revoked' and the decorator skipped them,
  // sending /dashboard down the founder publisher-profile branch.
  const [existingMember] = await db
    .select()
    .from(orgMembers)
    .where(and(eq(orgMembers.orgId, inv.orgId), eq(orgMembers.clerkUserId, clerkUserId)))
    .limit(1);
  if (existingMember) {
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    // Never downgrade an existing owner -- preserve their role.
    if (existingMember.role !== 'owner') {
      updates.role = inv.role;
      updates.claimedEntityId = inv.claimedEntityId;
      updates.claimedEntityIds = ((inv.claimedEntityIds as string[]) || []);
      updates.featureAccess = (inv.featureAccess as Record<string, boolean>) || {};
      updates.dataAccess = (inv.dataAccess as Record<string, boolean>) || {};
      updates.agentAccess = (inv.agentAccess as Record<string, boolean>) || {};
      if (inv.displayName) updates.displayName = inv.displayName;
    }
    if (userEmail || inv.email) updates.email = userEmail || inv.email;
    // Always reactivate (revoked / suspended / inactive -> active).
    updates.status = 'active';

    const [reactivated] = await db.update(orgMembers).set(updates as any)
      .where(eq(orgMembers.id, existingMember.id))
      .returning();

    // Re-add team memberships from the invite (duplicate-safe).
    const teamIdsRe = (inv.teamIds as string[]) || [];
    if (teamIdsRe.length > 0) {
      const { teamMemberships } = await import('../db/schema.js');
      try {
        await db.insert(teamMemberships).values(
          teamIdsRe.map(tid => ({ teamId: tid, memberId: reactivated.id, roleOnTeam: 'member' as const }))
        );
      } catch { /* duplicate -- ignore */ }
    }

    await db.update(orgInvitations).set({
      status: 'accepted',
      acceptedAt: new Date(),
      acceptedByUserId: clerkUserId,
    }).where(eq(orgInvitations.id, inv.id));

    // Final reconcile by email -- catches stubs the invite-specified
    // claim set didn't, and fixes wrong primary claims by matching the
    // member's email against chart human contact_email values.
    try { await reconcileChartClaimByEmail(inv.orgId, reactivated.id); } catch { /* best-effort */ }

    const [reread] = await db.select().from(orgMembers).where(eq(orgMembers.id, reactivated.id)).limit(1);

    return {
      ok: true,
      orgId: inv.orgId,
      role: (reread?.role || reactivated.role) as Role,
      claimedEntityId: reread?.claimedEntityId || reactivated.claimedEntityId || inv.claimedEntityId,
      memberId: reactivated.id,
    };
  }

  const [member] = await db.insert(orgMembers).values({
    orgId: inv.orgId,
    clerkUserId,
    role: inv.role,
    claimedEntityId: inv.claimedEntityId,
    claimedEntityIds: ((inv.claimedEntityIds as string[]) || []),
    email: userEmail || inv.email,
    displayName: inv.displayName || null,
    featureAccess: (inv.featureAccess as Record<string, boolean>) || {},
    dataAccess: (inv.dataAccess as Record<string, boolean>) || {},
    agentAccess: (inv.agentAccess as Record<string, boolean>) || {},
    status: 'active',
    invitedByUserId: inv.createdByUserId,
  }).returning();

  // Reconcile any pre-existing chart stubs claiming the same tile(s).
  // When an admin pre-adds a chart human (e.g. HUM_BOGDANTABAKA) to a team
  // before the real person accepts an invite, the team_membership attaches
  // to a stub row (clerk_user_id LIKE 'chart:%', status='inactive'). On
  // accept, transfer that stub's team_memberships to the freshly-created
  // real member and delete the stub so we don't carry ghost rows.
  const claimSet = new Set<string>([
    ...((inv.claimedEntityIds as string[]) || []),
    ...(inv.claimedEntityId ? [inv.claimedEntityId] : []),
  ].filter(Boolean));
  if (claimSet.size > 0) {
    const { teamMemberships } = await import('../db/schema.js');
    const stubs = (await db.select().from(orgMembers).where(and(
      eq(orgMembers.orgId, inv.orgId),
      eq(orgMembers.status, 'inactive'),
    ))).filter(s => {
      if (!s.clerkUserId?.startsWith('chart:')) return false;
      if (s.claimedEntityId && claimSet.has(s.claimedEntityId)) return true;
      const ids = (s.claimedEntityIds as unknown) as string[] | null;
      return Array.isArray(ids) && ids.some(x => claimSet.has(x));
    });
    for (const stub of stubs) {
      // Move every team_membership from stub.id → member.id, swallowing the
      // unique-index conflict if the real member is already on that team.
      const stubMemberships = await db.select().from(teamMemberships).where(eq(teamMemberships.memberId, stub.id));
      for (const tm of stubMemberships) {
        try {
          await db.update(teamMemberships)
            .set({ memberId: member.id })
            .where(eq(teamMemberships.id, tm.id));
        } catch {
          // Duplicate (team_id, member_id) -- the real account is already
          // on this team. Drop the stub's row.
          await db.delete(teamMemberships).where(eq(teamMemberships.id, tm.id));
        }
      }
      await db.delete(orgMembers).where(eq(orgMembers.id, stub.id));
    }
  }

  // Phase 4: drop the new member into any pre-assigned teams.
  const teamIds = (inv.teamIds as string[]) || [];
  if (teamIds.length > 0) {
    const { teamMemberships } = await import('../db/schema.js');
    const rows = teamIds.map(tid => ({
      teamId: tid,
      memberId: member.id,
      roleOnTeam: 'member' as const,
    }));
    // onConflictDoNothing isn't critical here -- the unique index on
    // (team_id, member_id) makes this safe; we just swallow duplicate errors.
    try {
      await db.insert(teamMemberships).values(rows);
    } catch { /* race / duplicate -- ignore */ }
  }

  await db.update(orgInvitations).set({
    status: 'accepted',
    acceptedAt: new Date(),
    acceptedByUserId: clerkUserId,
  }).where(eq(orgInvitations.id, inv.id));

  // Phase 4: auto-populate the chart tile's contact_email when empty so the
  // new member's accountability tile carries their actual email after accept.
  // Walks every claimed tile across the org's draft OOS file and patches any
  // human entity whose contact_email is missing.
  const allClaimedTiles: string[] = Array.from(new Set([
    ...(((inv.claimedEntityIds as string[]) || [])),
    ...(inv.claimedEntityId ? [inv.claimedEntityId] : []),
  ].filter(Boolean)));
  if (allClaimedTiles.length > 0 && (userEmail || inv.email)) {
    const fillEmail = userEmail || inv.email;
    try {
      const { patchTeamEntity } = await import('./team-graph.js');
      for (const tile of allClaimedTiles) {
        // patchTeamEntity is tolerant: it merges the patch onto the latest
        // editable OOS draft, so we can pass just contactEmail. The chart
        // service does its own "do not overwrite if non-empty" check by
        // virtue of how merges work; but we also pass displayName here to
        // sync the human label with the invitee's name when given.
        try {
          await patchTeamEntity(inv.orgId, 'human', tile, {
            contactEmail: fillEmail,
            ...(inv.displayName ? { name: inv.displayName } : {}),
          } as any);
        } catch { /* tile may be agent or already filled -- skip */ }
      }
    } catch { /* import failure -- skip auto-populate */ }
  }

  // Final reconcile by email -- catches stubs the invite-specified
  // claim set didn't, and fixes wrong primary claims by matching the
  // member's email against chart human contact_email values.
  try { await reconcileChartClaimByEmail(inv.orgId, member.id); } catch { /* best-effort */ }

  const [reread] = await db.select().from(orgMembers).where(eq(orgMembers.id, member.id)).limit(1);

  return {
    ok: true,
    orgId: inv.orgId,
    role: (reread?.role || member.role) as Role,
    claimedEntityId: reread?.claimedEntityId || member.claimedEntityId,
    memberId: member.id,
  };
}

// ---- Owner-side admin: list + revoke ----

export async function listPendingInvites(orgId: string) {
  return await db
    .select()
    .from(orgInvitations)
    .where(and(eq(orgInvitations.orgId, orgId), eq(orgInvitations.status, 'pending')));
}

export async function revokeInvite(invitationId: string, ownerUserId: string): Promise<{ ok: true; id: string }> {
  const [inv] = await db.select().from(orgInvitations).where(eq(orgInvitations.id, invitationId)).limit(1);
  if (!inv) throw new MembershipError('NOT_FOUND', 'Invitation not found', 404);

  const role = await getRoleForUser(inv.orgId, ownerUserId);
  // Phase 4: widened from owner-only to owner|admin|implementer.
  if (!role || (role !== 'owner' && role !== 'admin' && role !== 'implementer')) {
    throw new MembershipError('CANNOT_REVOKE', 'Your role does not allow revoking invitations', 403);
  }

  if (inv.status !== 'pending') return { ok: true, id: invitationId };
  await db.update(orgInvitations).set({ status: 'revoked' }).where(eq(orgInvitations.id, invitationId));
  return { ok: true, id: invitationId };
}

/**
 * Resend a pending invitation. Rotates the token (the old one is hashed and
 * unrecoverable anyway) and refreshes expires_at so the recipient gets a
 * fresh working link. The invitation row id stays the same so the pending-
 * invites drawer entry doesn't churn.
 *
 * Returns the new acceptUrl so the caller can re-fire the email.
 */
export interface ResentInvite {
  invitationId: string;
  email: string;
  claimedEntityId: string | null;
  displayName: string | null;
  expiresAt: Date;
  acceptUrl: string;
}

export async function resendInvite(
  invitationId: string,
  requesterUserId: string,
  baseUrl: string,
  ttlDays: number = INVITATION_TTL_DAYS,
): Promise<ResentInvite> {
  const [inv] = await db.select().from(orgInvitations).where(eq(orgInvitations.id, invitationId)).limit(1);
  if (!inv) throw new MembershipError('NOT_FOUND', 'Invitation not found', 404);

  const role = await getRoleForUser(inv.orgId, requesterUserId);
  const allowedToResend: Role[] = ['owner', 'admin', 'manager'];
  if (!role || !allowedToResend.includes(role)) {
    throw new MembershipError('CANNOT_RESEND', 'Your role does not allow resending invitations', 403);
  }
  if (inv.status !== 'pending') {
    throw new MembershipError(
      `INVITATION_${inv.status.toUpperCase()}`,
      `Cannot resend a ${inv.status} invitation. Issue a new one instead.`,
      410,
    );
  }

  const { token, tokenHash } = generateToken();
  const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);
  await db.update(orgInvitations)
    .set({ tokenHash, expiresAt })
    .where(eq(orgInvitations.id, invitationId));

  const acceptUrl = `${baseUrl.replace(/\/$/, '')}/accept-invite?token=${token}`;
  return {
    invitationId: inv.id,
    email: inv.email,
    claimedEntityId: inv.claimedEntityId,
    displayName: inv.displayName,
    expiresAt,
    acceptUrl,
  };
}

/**
 * Update a member's role, status, claimed tiles, access toggles, display
 * name, or team memberships. Owner / admin / implementer only. Owners are
 * protected -- their role cannot be changed via this path; ownership
 * transfer is a separate, deliberate flow.
 */
export interface UpdateMemberPatch {
  role?: Role;
  status?: 'active' | 'suspended' | 'inactive' | 'revoked';
  displayName?: string | null;
  claimedEntityId?: string | null;
  claimedEntityIds?: string[];
  featureAccess?: Record<string, boolean>;
  dataAccess?: Record<string, boolean>;
  agentAccess?: Record<string, boolean>;
  teamIds?: string[]; // when provided, replaces the member's team set
}

export async function updateMember(
  memberId: string,
  requesterUserId: string,
  patch: UpdateMemberPatch,
): Promise<{ ok: true; id: string }> {
  const [target] = await db.select().from(orgMembers).where(eq(orgMembers.id, memberId)).limit(1);
  if (!target) throw new MembershipError('NOT_FOUND', 'Member not found', 404);

  const requesterRole = await getRoleForUser(target.orgId, requesterUserId);
  if (!requesterRole || (requesterRole !== 'owner' && requesterRole !== 'admin' && requesterRole !== 'implementer')) {
    throw new MembershipError('CANNOT_EDIT_MEMBER', 'Your role does not allow editing members', 403);
  }
  if (target.role === 'owner' && patch.role && patch.role !== 'owner') {
    throw new MembershipError('CANNOT_DEMOTE_OWNER', 'Owners cannot be demoted via this path. Transfer ownership first.', 403);
  }

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (patch.role !== undefined && target.role !== 'owner') updates.role = patch.role;
  if (patch.status !== undefined) updates.status = patch.status;
  if (patch.displayName !== undefined) updates.displayName = patch.displayName;
  if (patch.claimedEntityId !== undefined) updates.claimedEntityId = patch.claimedEntityId;
  if (patch.claimedEntityIds !== undefined) updates.claimedEntityIds = patch.claimedEntityIds;
  if (patch.featureAccess !== undefined) updates.featureAccess = patch.featureAccess;
  if (patch.dataAccess !== undefined) updates.dataAccess = patch.dataAccess;
  if (patch.agentAccess !== undefined) updates.agentAccess = patch.agentAccess;

  if (Object.keys(updates).length > 1) {
    await db.update(orgMembers).set(updates as any).where(eq(orgMembers.id, memberId));
  }

  // Replace team memberships when provided. Atomic: clear, then re-add.
  if (patch.teamIds !== undefined) {
    const { teamMemberships } = await import('../db/schema.js');
    await db.delete(teamMemberships).where(eq(teamMemberships.memberId, memberId));
    if (patch.teamIds.length > 0) {
      const fresh = patch.teamIds.map(tid => ({
        teamId: tid,
        memberId,
        roleOnTeam: 'member' as const,
      }));
      try {
        await db.insert(teamMemberships).values(fresh);
      } catch { /* duplicate -- ignore */ }
    }
  }

  return { ok: true, id: memberId };
}

/**
 * Remove a member from the org by flipping their status to 'revoked'.
 * Soft-delete: the row stays so the audit trail and any tile claim
 * lookups still resolve historically. Owner / admin / implementer only;
 * cannot revoke an owner.
 */
export async function removeMember(
  memberId: string,
  requesterUserId: string,
): Promise<{ ok: true; id: string }> {
  const [target] = await db.select().from(orgMembers).where(eq(orgMembers.id, memberId)).limit(1);
  if (!target) throw new MembershipError('NOT_FOUND', 'Member not found', 404);

  const requesterRole = await getRoleForUser(target.orgId, requesterUserId);
  if (!requesterRole || (requesterRole !== 'owner' && requesterRole !== 'admin' && requesterRole !== 'implementer')) {
    throw new MembershipError('CANNOT_REVOKE_MEMBER', 'Your role does not allow removing members', 403);
  }
  if (target.role === 'owner') {
    throw new MembershipError('CANNOT_REVOKE_OWNER', 'Owners cannot be revoked. Transfer ownership first.', 403);
  }
  if (target.clerkUserId === requesterUserId) {
    throw new MembershipError('CANNOT_REVOKE_SELF', 'You cannot revoke yourself.', 403);
  }

  await db.update(orgMembers)
    .set({ status: 'revoked', updatedAt: new Date() })
    .where(eq(orgMembers.id, memberId));
  return { ok: true, id: memberId };
}

// ---- Maintenance: expire old pending invites (call from cron) ----

export async function expireOldInvites(): Promise<number> {
  const result = await db
    .update(orgInvitations)
    .set({ status: 'expired' })
    .where(and(eq(orgInvitations.status, 'pending'), lte(orgInvitations.expiresAt, sql`NOW()`)))
    .returning();
  return result.length;
}
