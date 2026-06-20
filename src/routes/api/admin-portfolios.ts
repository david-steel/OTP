// src/routes/api/admin-portfolios.ts
// Super-admin tooling to bring EXISTING signed-up orgs into the portfolio model.
// This is the ADMIN path: no Lab-feature gate, no consent flow -- links are
// forced. EVERY route requires (request as any).isSuperAdmin === true, and a
// non-admin caller gets a 404 (we never leak the existence of these routes).
//
// Routes (register under /api/v1, mirroring labs.ts -- no prefix here):
//   POST   /admin/portfolios/create-above         create a parent portfolio above an existing org
//   POST   /admin/portfolios/promote              promote an existing org INTO a portfolio in place
//   POST   /admin/portfolios/:id/members          force-link a member org
//   DELETE /admin/portfolios/:id/members/:memberOrgId  unlink a member org
//   GET    /admin/portfolios                       list all portfolios + member counts
//
// The service layer (services/portfolios.ts) is pure CRUD; PortfolioError is
// surfaced as a 400 with the standard { error: { code, message } } envelope.

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getAuth } from '@clerk/fastify';
import { createClerkClient } from '@clerk/backend';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../../config/database.js';
import { organizations, portfolioMembers } from '../../db/schema.js';
import { requireUuidParam } from '../../shared/param-validation.js';
import {
  createPortfolioAboveOrg,
  promoteOrgToPortfolio,
  linkMemberOrg,
  unlinkMemberOrg,
  PortfolioError,
} from '../../services/portfolios.js';

// Best-effort lookup of the caller's primary email (mirror portfolios.ts).
// Non-blocking: a missing key or a Clerk error just yields null.
async function lookupPrimaryEmail(clerkUserId: string): Promise<string | null> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) return null;
  try {
    const clerk = createClerkClient({ secretKey });
    const u = await clerk.users.getUser(clerkUserId);
    return u.primaryEmailAddress?.emailAddress ?? null;
  } catch {
    return null;
  }
}

// Super-admin gate. Returns false after writing a 404 (never leak the route to
// non-admins). On success returns true and leaves the reply untouched.
function requireSuperAdminOr404(request: FastifyRequest, reply: FastifyReply): boolean {
  if ((request as any).isSuperAdmin === true) return true;
  reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Not found' } });
  return false;
}

// PortfolioError -> standard envelope at the error's own httpStatus (defaults
// to 400). Re-throws anything else for the framework's 500 handler.
function sendPortfolioError(err: unknown, reply: FastifyReply) {
  if (err instanceof PortfolioError) {
    return reply.status(err.httpStatus || 400).send({ error: { code: err.code, message: err.message } });
  }
  throw err;
}

const createAboveSchema = z.object({
  existingOrgId: z.string().uuid(),
  name: z.string().trim().min(1).max(255).optional(),
});

const promoteSchema = z.object({
  orgId: z.string().uuid(),
});

const linkMemberSchema = z.object({
  memberOrgId: z.string().uuid(),
});

export default async function adminPortfoliosRoutes(app: FastifyInstance) {
  // ============================================================
  // POST /api/v1/admin/portfolios/create-above
  // PE case: create a parent portfolio above an org that already signed up.
  // ============================================================
  app.post('/admin/portfolios/create-above', async (request, reply) => {
    if (!requireSuperAdminOr404(request, reply)) return;

    const parsed = createAboveSchema.safeParse(request.body || {});
    if (!parsed.success) {
      return reply.status(400).send({ error: { code: 'INVALID_REQUEST', message: parsed.error.issues[0]?.message || 'Invalid request body' } });
    }

    const actorClerkUserId = getAuth(request).userId;
    if (!actorClerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in required' } });
    }
    const actorEmail = await lookupPrimaryEmail(actorClerkUserId);

    try {
      const result = await createPortfolioAboveOrg({
        existingOrgId: parsed.data.existingOrgId,
        actorClerkUserId,
        actorEmail,
        name: parsed.data.name ?? null,
      });
      return { id: result.id, name: result.name };
    } catch (err) {
      return sendPortfolioError(err, reply);
    }
  });

  // ============================================================
  // POST /api/v1/admin/portfolios/promote
  // Holdco case: turn an existing org INTO a portfolio in place.
  // ============================================================
  app.post('/admin/portfolios/promote', async (request, reply) => {
    if (!requireSuperAdminOr404(request, reply)) return;

    const parsed = promoteSchema.safeParse(request.body || {});
    if (!parsed.success) {
      return reply.status(400).send({ error: { code: 'INVALID_REQUEST', message: parsed.error.issues[0]?.message || 'Invalid request body' } });
    }

    const actorClerkUserId = getAuth(request).userId;
    if (!actorClerkUserId) {
      return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in required' } });
    }

    try {
      const result = await promoteOrgToPortfolio({
        orgId: parsed.data.orgId,
        actorClerkUserId,
      });
      return { id: result.id, name: result.name };
    } catch (err) {
      return sendPortfolioError(err, reply);
    }
  });

  // ============================================================
  // POST /api/v1/admin/portfolios/:id/members  -- force-link a member org.
  // ============================================================
  app.post<{ Params: { id: string } }>('/admin/portfolios/:id/members', async (request, reply) => {
    if (!requireSuperAdminOr404(request, reply)) return;

    const portfolioOrgId = requireUuidParam(request, reply, 'id');
    if (!portfolioOrgId) return;

    const parsed = linkMemberSchema.safeParse(request.body || {});
    if (!parsed.success) {
      return reply.status(400).send({ error: { code: 'INVALID_REQUEST', message: parsed.error.issues[0]?.message || 'Invalid request body' } });
    }

    try {
      await linkMemberOrg(portfolioOrgId, parsed.data.memberOrgId);
      return { ok: true };
    } catch (err) {
      return sendPortfolioError(err, reply);
    }
  });

  // ============================================================
  // DELETE /api/v1/admin/portfolios/:id/members/:memberOrgId  -- unlink.
  // ============================================================
  app.delete<{ Params: { id: string; memberOrgId: string } }>('/admin/portfolios/:id/members/:memberOrgId', async (request, reply) => {
    if (!requireSuperAdminOr404(request, reply)) return;

    const portfolioOrgId = requireUuidParam(request, reply, 'id');
    if (!portfolioOrgId) return;
    const memberOrgId = requireUuidParam(request, reply, 'memberOrgId');
    if (!memberOrgId) return;

    try {
      await unlinkMemberOrg(portfolioOrgId, memberOrgId);
      return { ok: true };
    } catch (err) {
      return sendPortfolioError(err, reply);
    }
  });

  // ============================================================
  // GET /api/v1/admin/portfolios  -- list every portfolio org with its active
  // member count + member-org names.
  // ============================================================
  app.get('/admin/portfolios', async (request, reply) => {
    if (!requireSuperAdminOr404(request, reply)) return;

    const portfolioRows = await db
      .select({ id: organizations.id, name: organizations.name, createdAt: organizations.createdAt })
      .from(organizations)
      .where(eq(organizations.kind, 'portfolio'));

    // Active member rows joined to their org names, for every portfolio.
    const memberRows = await db
      .select({
        portfolioOrgId: portfolioMembers.portfolioOrgId,
        memberOrgId: portfolioMembers.memberOrgId,
        memberName: organizations.name,
      })
      .from(portfolioMembers)
      .innerJoin(organizations, eq(organizations.id, portfolioMembers.memberOrgId))
      .where(eq(portfolioMembers.status, 'active'));

    const membersByPortfolio = new Map<string, Array<{ id: string; name: string }>>();
    for (const m of memberRows) {
      const list = membersByPortfolio.get(m.portfolioOrgId) || [];
      list.push({ id: m.memberOrgId, name: m.memberName });
      membersByPortfolio.set(m.portfolioOrgId, list);
    }

    const portfolios = portfolioRows.map(p => {
      const members = membersByPortfolio.get(p.id) || [];
      return {
        id: p.id,
        name: p.name,
        createdAt: p.createdAt,
        memberCount: members.length,
        members,
      };
    });

    return { portfolios };
  });

  // All orgs (id + name + kind + tier) so the admin UI can resolve a name to a
  // UUID to paste into the create-above / link forms. Super-admin only.
  app.get('/admin/orgs', async (request, reply) => {
    if (!requireSuperAdminOr404(request, reply)) return;
    const orgs = await db
      .select({
        id: organizations.id,
        name: organizations.name,
        kind: organizations.kind,
        planTier: organizations.planTier,
      })
      .from(organizations)
      .orderBy(organizations.name);
    return { orgs };
  });
}
