/**
 * Fastify-style route guards built on top of org_members + permissions.ts.
 *
 * Two-layer model:
 *   1. A preHandler (registerOrgMemberDecorator) attaches the current
 *      user's org_member row to every request as `request.orgMember`.
 *      Mirror of how `isSuperAdmin` is decorated in server.ts.
 *   2. Per-route guards (requireOrgMember, requireRole, requireFeatureAccess)
 *      read that decoration and short-circuit with redirect/404 when access
 *      is denied. Existing routes opt in by calling the guard inside the
 *      handler -- no global behavior change.
 *
 * The decorator preHandler MUST fail-soft: a DB outage or missing table
 * sets `request.orgMember = null` and lets the request continue. Auth gates
 * are still enforced by the guards themselves; we just don't 500 the entire
 * site if the membership lookup hiccups.
 */
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getAuth } from '@clerk/fastify';
import { eq, and } from 'drizzle-orm';
import { db } from '../config/database.js';
import { orgMembers, organizations } from '../db/schema.js';
import type { Role } from '../services/membership.js';
import {
  canInviteMembers,
  canCreateTeams,
  canEditOrgSettings,
  canAccessApp,
} from './permissions.js';

export interface CurrentMember {
  id: string;
  orgId: string;
  clerkUserId: string;
  role: Role;
  status: string;
  email: string | null;
  displayName: string | null;
  featureAccess: Record<string, boolean>;
  dataAccess: Record<string, boolean>;
  agentAccess: Record<string, boolean>;
  preferences: Record<string, unknown>;
}

declare module 'fastify' {
  interface FastifyRequest {
    orgMember: CurrentMember | null;
    impersonation: {
      active: boolean;
      targetName: string;
      targetMemberId: string;
      bySuperAdmin: string;
    } | null;
    serviceAuth: { actAsClerkUserId: string } | null;
  }
}

// ---------- Decorator: attach current member to every request ----------

export function registerOrgMemberDecorator(app: FastifyInstance): void {
  app.decorateRequest('orgMember', null);
  app.decorateRequest('impersonation', null);
  app.decorateRequest('serviceAuth', null);

  app.addHook('preHandler', async (request) => {
    try {
      const auth = getAuth(request);
      const userId = auth?.userId;
      if (!userId) {
        // No Clerk session. Try service-to-service auth (orger-next, SDKs).
        // Populates request.orgMember from the act-as user so per-tile gates
        // (checkChartEdit / checkChartCreate) work unchanged.
        const { resolveServiceAuth } = await import('./service-auth.js');
        const svc = await resolveServiceAuth(request);
        if (svc) {
          (request as any).orgMember = svc.member;
          (request as any).serviceAuth = { actAsClerkUserId: svc.clerkUserId };
        }
        return;
      }

      // Phase 5: super-admin impersonation. If a valid impersonation cookie
      // is present AND the caller is the super admin who set it, swap the
      // routing context to the target member. The Clerk session stays as
      // the super admin's, so any writes audit-log under their userId.
      const { decodeImpersonationCookie, resolveImpersonatedContext } =
        await import('./impersonation.js');
      const { isSuperAdmin } = await import('./super-admin.js');
      const { isDemoTargetOrg } = await import('./demo-access.js');
      const cookieRaw = (request as any).cookies?.otp_impersonation as string | undefined;
      const payload = decodeImpersonationCookie(cookieRaw);
      if (payload) {
        // resolveImpersonatedContext enforces payload.by === userId, so a
        // signed cookie only applies for the session it was issued to.
        const ctx = await resolveImpersonatedContext(payload, userId);
        // Super admins may impersonate anyone. Allow-listed demo presenters
        // (Dawson) may land ONLY in a canned demo org (Acme) -- never a real
        // customer. The presenter gate itself lives at the issue point in
        // /admin/view-as; this is the apply-time safety net.
        if (ctx && (isSuperAdmin(request) || isDemoTargetOrg(ctx.org.clerkOrgId))) {
          (request as any).orgMember = {
            id: ctx.member.id,
            orgId: ctx.member.orgId,
            clerkUserId: ctx.member.clerkUserId!,
            role: ctx.member.role as Role,
            status: ctx.member.status,
            email: ctx.member.email,
            displayName: ctx.member.displayName,
            featureAccess: (ctx.member.featureAccess as Record<string, boolean>) || {},
            dataAccess: (ctx.member.dataAccess as Record<string, boolean>) || {},
            agentAccess: (ctx.member.agentAccess as Record<string, boolean>) || {},
            // Chart-claim fields are required by computeViewableTiles /
            // computeEditableTiles in services/chart-permissions.ts.
            // Without them the chart, member list, and any other
            // scoping helper sees an empty tile set and renders nothing
            // (the "no humans or agents on the chart yet" symptom David
            // reported 2026-05-27 while impersonating Kristen).
            claimedEntityId: ctx.member.claimedEntityId || null,
            claimedEntityIds: (ctx.member.claimedEntityIds as string[] | null) || null,
          };
          (request as any).impersonation = {
            active: true,
            targetName: payload.name,
            targetMemberId: payload.memberId,
            bySuperAdmin: payload.by,
            // The impersonated target's Clerk user ID. Downstream code (e.g.
            // dashboard.ts legacy-founder check) needs this to evaluate
            // "is the EFFECTIVE viewer the founder?" using Kristen's
            // identity, not the super-admin session's auth.userId. Without
            // exposing `as` here, the founder check evaluates against the
            // admin's userId, which matches org.clerkOrgId for the founder,
            // and the HUM_DAVIDSTEEL fallback leaks under impersonation.
            // Caught 2026-05-27 via /api/v1/_debug/dashboard-state diagnostic.
            as: payload.as,
          };
          return;
        }
      }

      // Active member of any org. We currently scope to the first hit; a
      // multi-org user sees one org at a time. When org-switching ships,
      // this resolution will read a session preference.
      const [row] = await db.select({
        id: orgMembers.id,
        orgId: orgMembers.orgId,
        clerkUserId: orgMembers.clerkUserId,
        role: orgMembers.role,
        status: orgMembers.status,
        email: orgMembers.email,
        displayName: orgMembers.displayName,
        featureAccess: orgMembers.featureAccess,
        dataAccess: orgMembers.dataAccess,
        agentAccess: orgMembers.agentAccess,
        preferences: orgMembers.preferences,
        // Chart-claim fields required by chart-permissions.ts helpers
        // (computeViewableTiles, computeEditableTiles, canViewTile).
        // Added 2026-05-27 -- without these the chart was rendering
        // empty under impersonation because the decorated member had
        // no tile context to derive a subtree from.
        claimedEntityId: orgMembers.claimedEntityId,
        claimedEntityIds: orgMembers.claimedEntityIds,
      })
        .from(orgMembers)
        .where(and(
          eq(orgMembers.clerkUserId, userId),
          eq(orgMembers.status, 'active'),
        ))
        .limit(1);

      if (!row) return;

      (request as any).orgMember = {
        id: row.id,
        orgId: row.orgId,
        clerkUserId: row.clerkUserId!,
        role: row.role as Role,
        status: row.status,
        email: row.email,
        displayName: row.displayName,
        featureAccess: (row.featureAccess as Record<string, boolean>) || {},
        dataAccess: (row.dataAccess as Record<string, boolean>) || {},
        agentAccess: (row.agentAccess as Record<string, boolean>) || {},
        preferences: (row.preferences as Record<string, unknown>) || {},
        claimedEntityId: row.claimedEntityId || null,
        claimedEntityIds: (row.claimedEntityIds as string[] | null) || null,
      };
    } catch (err) {
      // Fail-soft. Auth gates run independently; we just leave orgMember null.
      request.log.debug({ err }, 'orgMember decorator preHandler failed');
    }
  });
}

// ---------- Per-route guards ----------

/**
 * Require an authenticated user with an active org_members row. If there is
 * no Clerk session, redirects to /sign-in?redirect=. If the user is signed
 * in but not yet a member of any org, returns 404 (admin pattern).
 *
 * Returns the CurrentMember on success, null after writing the redirect or
 * status. Callers must check for null and bail.
 */
export async function requireOrgMember(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<CurrentMember | null> {
  const auth = getAuth(request);
  if (!auth?.userId) {
    reply.redirect('/sign-in?redirect=' + encodeURIComponent(request.url));
    return null;
  }

  const member = (request as any).orgMember as CurrentMember | null;
  if (!member) {
    // Authed but not a member -- could mean invite-pending or expired session
    // mismatch. Send to sign-in so Clerk can refresh; if Clerk says signed
    // in, the page will show the no-org register prompt.
    reply.redirect('/sign-in?redirect=' + encodeURIComponent(request.url));
    return null;
  }

  if (!canAccessApp(member.role)) {
    // Inactive seat: on the chart only.
    reply.status(404).view('pages/home', { title: 'Not Found', noindex: true });
    return null;
  }

  return member;
}

/**
 * Require the current member to hold one of the given roles. Returns the
 * CurrentMember on success, or 404s with the home view on denial (matches
 * /admin/* security-by-obscurity pattern).
 */
export async function requireRole(
  request: FastifyRequest,
  reply: FastifyReply,
  roles: Role[],
): Promise<CurrentMember | null> {
  const member = await requireOrgMember(request, reply);
  if (!member) return null;

  if (!roles.includes(member.role)) {
    reply.status(404).view('pages/home', { title: 'Not Found', noindex: true });
    return null;
  }
  return member;
}

/**
 * Require the current member to hold a specific feature toggle. Reads
 * `member.featureAccess[key]`. Owners and admins bypass the check (they
 * can access everything regardless of toggle state).
 */
export async function requireFeatureAccess(
  request: FastifyRequest,
  reply: FastifyReply,
  featureKey: string,
): Promise<CurrentMember | null> {
  const member = await requireOrgMember(request, reply);
  if (!member) return null;

  if (canEditOrgSettings(member.role)) return member;

  if (member.featureAccess[featureKey] !== true) {
    reply.status(404).view('pages/home', { title: 'Not Found', noindex: true });
    return null;
  }
  return member;
}

// ---------- Convenience wrappers ----------

export async function requireCanInvite(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<CurrentMember | null> {
  const member = await requireOrgMember(request, reply);
  if (!member) return null;
  if (!canInviteMembers(member.role)) {
    reply.status(404).view('pages/home', { title: 'Not Found', noindex: true });
    return null;
  }
  return member;
}

export async function requireCanCreateTeams(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<CurrentMember | null> {
  const member = await requireOrgMember(request, reply);
  if (!member) return null;
  if (!canCreateTeams(member.role)) {
    reply.status(404).view('pages/home', { title: 'Not Found', noindex: true });
    return null;
  }
  return member;
}

/**
 * Resolve the organization row tied to the current member. Returns null if
 * the member or org cannot be loaded.
 */
export async function getCurrentOrg(member: CurrentMember) {
  const [org] = await db.select()
    .from(organizations)
    .where(eq(organizations.id, member.orgId))
    .limit(1);
  return org || null;
}
