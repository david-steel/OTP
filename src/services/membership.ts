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
  claimedEntityId?: string | null;
  role?: Role;                // default 'managee'
  displayName?: string | null;
  access?: AccessToggles;     // pre-configured toggles, copied to org_members on accept
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

  const [created] = await db.insert(orgInvitations).values({
    orgId: opts.orgId,
    email,
    role,
    claimedEntityId: opts.claimedEntityId || null,
    displayName: opts.displayName || null,
    featureAccess: opts.access?.feature || {},
    dataAccess: opts.access?.data || {},
    agentAccess: opts.access?.agent || {},
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

  // Idempotency: if a member row already exists, just return it.
  const [existingMember] = await db
    .select()
    .from(orgMembers)
    .where(and(eq(orgMembers.orgId, inv.orgId), eq(orgMembers.clerkUserId, clerkUserId)))
    .limit(1);
  if (existingMember) {
    // Mark invite accepted, leave member row as is (do not downgrade owner -> member)
    await db.update(orgInvitations).set({
      status: 'accepted',
      acceptedAt: new Date(),
      acceptedByUserId: clerkUserId,
    }).where(eq(orgInvitations.id, inv.id));
    return {
      ok: true,
      orgId: inv.orgId,
      role: existingMember.role as Role,
      claimedEntityId: existingMember.claimedEntityId || inv.claimedEntityId,
      memberId: existingMember.id,
    };
  }

  const [member] = await db.insert(orgMembers).values({
    orgId: inv.orgId,
    clerkUserId,
    role: inv.role,
    claimedEntityId: inv.claimedEntityId,
    email: userEmail || inv.email,
    displayName: inv.displayName || null,
    featureAccess: (inv.featureAccess as Record<string, boolean>) || {},
    dataAccess: (inv.dataAccess as Record<string, boolean>) || {},
    agentAccess: (inv.agentAccess as Record<string, boolean>) || {},
    status: 'active',
    invitedByUserId: inv.createdByUserId,
  }).returning();

  await db.update(orgInvitations).set({
    status: 'accepted',
    acceptedAt: new Date(),
    acceptedByUserId: clerkUserId,
  }).where(eq(orgInvitations.id, inv.id));

  return {
    ok: true,
    orgId: inv.orgId,
    role: member.role as Role,
    claimedEntityId: member.claimedEntityId,
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
  if (role !== 'owner') throw new MembershipError('NOT_OWNER', 'Only the org owner can revoke invitations', 403);

  if (inv.status !== 'pending') return { ok: true, id: invitationId };
  await db.update(orgInvitations).set({ status: 'revoked' }).where(eq(orgInvitations.id, invitationId));
  return { ok: true, id: invitationId };
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
