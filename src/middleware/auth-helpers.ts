import type { FastifyRequest } from 'fastify';
import { getAuth } from '@clerk/fastify';
import { eq } from 'drizzle-orm';
import { db } from '../config/database.js';
import { organizations } from '../db/schema.js';
import { resolveApiKey } from './api-key-auth.js';
import { resolveServiceAuth } from './service-auth.js';

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
