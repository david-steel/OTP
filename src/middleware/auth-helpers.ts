import type { FastifyRequest } from 'fastify';
import { getAuth } from '@clerk/fastify';
import { eq, and } from 'drizzle-orm';
import { db } from '../config/database.js';
import { organizations, orgMembers } from '../db/schema.js';
import { resolveApiKey } from './api-key-auth.js';
import { resolveServiceAuth } from './service-auth.js';
import { readActiveOrgCookie } from '../services/active-org.js';

// Roles that may never mutate org data (same set meetings.ts enforces).
const READ_ONLY_ROLES = new Set(['observer', 'inactive', 'free']);

/**
 * Block read-only roles from write endpoints. Mirrors checkMeetingEdit's
 * role rules so rocks/KPIs/todos/values/seats agree with meetings:
 *  - API-key / service requests: pass (scope gates handle them upstream).
 *  - Legacy founder acting in their own org: always allowed, checked BEFORE
 *    the member-role check (the 6/1 "Start button does nothing" lesson: a
 *    founder may also carry a non-privileged org_members row).
 *  - observer / inactive / free members: 403.
 * Returns true if the write may proceed, false after sending the reply.
 */
export async function gateReadOnlyRole(request: FastifyRequest, reply: any): Promise<boolean> {
  const auth = getAuth(request);
  if (!auth.userId) return true; // API-key / service path

  const member = (request as any).orgMember as { orgId?: string; role?: string } | null;

  const [ownerOrg] = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.clerkOrgId, auth.userId))
    .limit(1);
  if (ownerOrg && (!member?.orgId || member.orgId === ownerOrg.id)) return true;

  if (member?.role && READ_ONLY_ROLES.has(member.role)) {
    reply.status(403).send({
      error: { code: 'READ_ONLY_ROLE', message: 'Your role is read-only' },
    });
    return false;
  }
  return true;
}

/**
 * Get the organization for the authenticated user.
 * Tries Clerk session first, then falls back to API key auth.
 * Returns the org row or null if unauthenticated.
 */
export async function getAuthOrg(request: FastifyRequest) {
  const org = await resolveAuthOrg(request);
  // An org pending hard-delete is hidden/blocked everywhere -- normal in-org
  // access resolves to null (member is locked out). Super-admins act on it by
  // id through the /admin delete & restore endpoints, which do NOT use
  // getAuthOrg, so this gate does not block restoring it.
  if (org && org.deletionRequestedAt) return null;
  return org;
}

async function resolveAuthOrg(request: FastifyRequest) {
  // Try Clerk auth first
  const auth = getAuth(request);
  if (auth.userId) {
    // Impersonation MUST win over the legacy-founder path. Under super-admin
    // "view as <user>", guards.ts swaps request.orgMember to the target's
    // row -- resolve to THEIR org. Without this a founder (auth.userId ==
    // their org.clerkOrgId) always resolves to their own org even while
    // impersonating, so meetings/members/KPIs render the admin's data, not
    // the impersonated user's. (2026-06-02, Victor / Open Skies leak.)
    const _imp = (request as any).impersonation as { active?: boolean } | null;
    const _impMember = (request as any).orgMember as { orgId?: string } | null;
    if (_imp?.active && _impMember?.orgId) {
      const impArr = await db.select().from(organizations).where(eq(organizations.id, _impMember.orgId)).limit(1);
      if (impArr[0]) return impArr[0];
    }

    // Org-switching for ANY user (INCLUDING founders): if the user pinned an
    // `otp_active_org` preference AND holds an ACTIVE org_members row for that
    // exact org, resolve to THAT org. This MUST run before the legacy-founder
    // path below: a founder's auth.userId == their own org.clerkOrgId, so Path
    // 1 would short-circuit to their home org and silently ignore a switch INTO
    // another org they belong to. Without this the switcher only ever worked
    // for invited members, never founders (caught 2026-06-20: David switched to
    // OTP but API writes still resolved to Sneeze It -> "does not belong to your
    // org"). Runs AFTER impersonation so it never overrides "view as". The
    // cookie is validated against org_members every time -- never trusted alone
    // (services/active-org.ts invariant 1).
    const activeOrgPref = readActiveOrgCookie(request);
    if (activeOrgPref) {
      const [prefMembership] = await db.select({ orgId: orgMembers.orgId })
        .from(orgMembers)
        .where(and(
          eq(orgMembers.clerkUserId, auth.userId),
          eq(orgMembers.status, 'active'),
          eq(orgMembers.orgId, activeOrgPref),
        ))
        .limit(1);
      if (prefMembership) {
        const prefOrgArr = await db.select().from(organizations).where(eq(organizations.id, prefMembership.orgId)).limit(1);
        if (prefOrgArr[0]) return prefOrgArr[0];
      }
    }

    // Path 1: legacy founder -- their Clerk user ID is stored as
    // organizations.clerkOrgId (single-tenant founder pattern).
    const orgArr = await db.select().from(organizations).where(eq(organizations.clerkOrgId, auth.userId)).limit(1);
    if (orgArr[0]) return orgArr[0];

    // Path 2: team-member invite. The user joined an existing org via
    // org_members and the guards middleware resolves their active membership
    // onto request.orgMember. Without this path, invited members are
    // implicitly read-only against every API write -- which is exactly
    // why Kristen got "Authentication required" trying to edit her segue
    // mid-meeting on 2026-05-26 while still being able to see the page
    // (the page route's l8ResolveOrg already honored this path; the API
    // gate didn't). The two resolvers must agree. See also
    // checkMeetingEdit in routes/api/meetings.ts which already handles
    // the team-membership-or-attendee rule once the org is resolved.
    // Path 2: team-member invite. The user joined an existing org via
    // org_members; guards.ts resolved their active membership onto
    // request.orgMember (already honoring the active-org cookie). The validated
    // active-org switch is handled above for everyone, so here we just resolve
    // the membership's org. Without this path invited members are implicitly
    // read-only against every API write (the 2026-05-26 Kristen segue bug).
    const member = (request as any).orgMember as { orgId: string } | null;
    if (member?.orgId) {
      const memberOrgArr = await db.select().from(organizations).where(eq(organizations.id, member.orgId)).limit(1);
      if (memberOrgArr[0]) return memberOrgArr[0];
    }
  }

  // Fall back to API key auth
  const apiKeyCtx = await resolveApiKey(request);
  if (apiKeyCtx) {
    const orgArr = await db.select().from(organizations).where(eq(organizations.id, apiKeyCtx.orgId)).limit(1);
    return orgArr[0] || null;
  }

  // Service-to-service auth (orger-next, future SDKs). Resolves to the org
  // tied to the act-as Clerk user's org_members row.
  const svc = await resolveServiceAuth(request);
  if (svc) {
    const orgArr = await db.select().from(organizations).where(eq(organizations.id, svc.member.orgId)).limit(1);
    return orgArr[0] || null;
  }

  // Secret-gated demo login (no Clerk). When enabled AND a valid signed
  // otp_demo cookie is present, API writes resolve to the Acme demo org. The
  // org is loaded SOLELY by the constant DEMO_LOGIN_ORG_CLERK_ID (forge-proof
  // org binding, invariant 1) with a belt-and-suspenders clerkOrgId assert.
  // gateReadOnlyRole returns true for !userId, so the demo session may write --
  // fine, it's hard-scoped to the non-private Acme org.
  {
    const { demoLoginEnabled, verifyDemoCookie, DEMO_COOKIE_NAME, DEMO_LOGIN_ORG_CLERK_ID } =
      await import('./demo-access.js');
    if (demoLoginEnabled()) {
      const demoRaw = (request as any).cookies?.[DEMO_COOKIE_NAME] as string | undefined;
      if (verifyDemoCookie(demoRaw)) {
        const orgArr = await db.select().from(organizations)
          .where(eq(organizations.clerkOrgId, DEMO_LOGIN_ORG_CLERK_ID)).limit(1);
        if (orgArr[0] && orgArr[0].clerkOrgId === DEMO_LOGIN_ORG_CLERK_ID) return orgArr[0];
      }
    }
  }

  // Dev-only override: ?orgId=<uuid|clerkOrgId> -- never enabled in production.
  // Lets the L8 page work end-to-end on localhost without Clerk session.
  if (process.env.NODE_ENV !== 'production') {
    const q = (request.query || {}) as Record<string, string | undefined>;
    const orgIdParam = q.orgId || q.org;
    if (orgIdParam) {
      const isUuid = /^[0-9a-f-]{36}$/i.test(orgIdParam);
      const orgArr = isUuid
        ? await db.select().from(organizations).where(eq(organizations.id, orgIdParam)).limit(1)
        : await db.select().from(organizations).where(eq(organizations.clerkOrgId, orgIdParam)).limit(1);
      if (orgArr[0]) return orgArr[0];
    }
    const headerOrg = (request.headers['x-dev-org'] as string | undefined);
    if (headerOrg) {
      const isUuid = /^[0-9a-f-]{36}$/i.test(headerOrg);
      const orgArr = isUuid
        ? await db.select().from(organizations).where(eq(organizations.id, headerOrg)).limit(1)
        : await db.select().from(organizations).where(eq(organizations.clerkOrgId, headerOrg)).limit(1);
      if (orgArr[0]) return orgArr[0];
    }
  }

  return null;
}
