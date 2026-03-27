import type { FastifyRequest } from 'fastify';
import { getAuth } from '@clerk/fastify';
import { eq } from 'drizzle-orm';
import { db } from '../config/database.js';
import { organizations } from '../db/schema.js';
import { resolveApiKey } from './api-key-auth.js';

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

  return null;
}
