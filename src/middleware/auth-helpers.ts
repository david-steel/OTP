import type { FastifyRequest } from 'fastify';
import { getAuth } from '@clerk/fastify';
import { eq } from 'drizzle-orm';
import { db } from '../config/database.js';
import { organizations } from '../db/schema.js';
import { resolveApiKey } from './api-key-auth.js';
import { resolveServiceAuth } from './service-auth.js';

/**
 * Get the organization for the authenticated user.
 * Tries Clerk session first, then falls back to API key auth.
 * Returns the org row or null if unauthenticated.
 */
export async function getAuthOrg(request: FastifyRequest) {
  // Try Clerk auth first
  const auth = getAuth(request);
  if (auth.userId) {
    const orgArr = await db.select().from(organizations).where(eq(organizations.clerkOrgId, auth.userId)).limit(1);
    if (orgArr[0]) return orgArr[0];
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
