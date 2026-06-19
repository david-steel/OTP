/**
 * active-org.ts -- the org/portfolio switcher endpoints.
 *
 * Routes (register under /api/v1):
 *   POST   /api/v1/active-org           { orgId }  -> pin the active-org cookie
 *   DELETE /api/v1/active-org                      -> clear it (back to default)
 *   GET    /api/v1/active-org/options              -> orgs + portfolios + current
 *
 * The active-org cookie (services/active-org.ts) is a PREFERENCE, never an
 * authority: it only selects among orgs the user is ALREADY an active member of.
 * Per that module's invariant 1, the POST handler re-validates membership before
 * writing the cookie -- it queries for an ACTIVE org_members row matching the
 * caller's Clerk userId + the requested orgId, and 403s if there is none.
 *
 * This is a nav primitive available to every signed-in user; it is NOT gated by
 * any lab flag. Registration in server.ts is a separate task -- do not add it here.
 */
import type { FastifyInstance } from 'fastify';
import { getAuth } from '@clerk/fastify';
import { z } from 'zod';
import { and, eq, ne } from 'drizzle-orm';
import { db } from '../../config/database.js';
import { orgMembers, organizations } from '../../db/schema.js';
import { listPortfoliosForUser } from '../../services/portfolios.js';
import { ACTIVE_ORG_COOKIE_NAME, readActiveOrgCookie } from '../../services/active-org.js';

const switchSchema = z.object({ orgId: z.string().min(1) });

// One year. Matches the "pin until they change it" intent of a preference cookie.
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export default async function activeOrgRoutes(app: FastifyInstance) {
  // Pin the active org. Re-validates membership before honoring the request.
  app.post('/active-org', async (request, reply) => {
    const userId = getAuth(request).userId || null;
    if (!userId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in required' } });
    }

    const parsed = switchSchema.safeParse(request.body || {});
    if (!parsed.success) {
      return reply.status(400).send({ error: { code: 'INVALID_REQUEST', message: parsed.error.issues[0]?.message || 'Invalid request body' } });
    }
    const { orgId } = parsed.data;

    // Invariant 1: the cookie only selects among orgs the user is ALREADY an
    // active member of. Validate against an active org_members row for this exact
    // (clerkUserId, orgId) before writing the cookie.
    const [member] = await db
      .select({ id: orgMembers.id })
      .from(orgMembers)
      .where(and(
        eq(orgMembers.clerkUserId, userId),
        eq(orgMembers.orgId, orgId),
        eq(orgMembers.status, 'active'),
      ))
      .limit(1);
    if (!member) {
      return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'You are not a member of that organization.' } });
    }

    reply.setCookie(ACTIVE_ORG_COOKIE_NAME, orgId, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      maxAge: COOKIE_MAX_AGE,
    });
    return { ok: true, orgId };
  });

  // Clear the preference -> back to default first-membership resolution.
  app.delete('/active-org', async (request, reply) => {
    const userId = getAuth(request).userId || null;
    if (!userId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in required' } });
    }
    reply.clearCookie(ACTIVE_ORG_COOKIE_NAME, { path: '/' });
    return { ok: true };
  });

  // Hydrate the switcher: the user's orgs, portfolios, and current selection.
  app.get('/active-org/options', async (request, reply) => {
    const userId = getAuth(request).userId || null;
    if (!userId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in required' } });
    }
    // Real orgs the user is an active member of (id + name + role). Exclude
    // portfolio-kind orgs here -- they're surfaced separately under portfolios.
    const [orgRows, portfolios] = await Promise.all([
      db
        .select({ id: organizations.id, name: organizations.name, role: orgMembers.role })
        .from(orgMembers)
        .innerJoin(organizations, eq(organizations.id, orgMembers.orgId))
        .where(and(
          eq(orgMembers.clerkUserId, userId),
          eq(orgMembers.status, 'active'),
          ne(organizations.kind, 'portfolio'),
        )),
      listPortfoliosForUser(userId),
    ]);
    return {
      orgs: orgRows.map(o => ({ id: o.id, name: o.name, role: o.role as string })),
      portfolios: portfolios.map(p => ({ id: p.id, name: p.name, role: p.role })),
      activeOrgId: readActiveOrgCookie(request),
    };
  });
}
