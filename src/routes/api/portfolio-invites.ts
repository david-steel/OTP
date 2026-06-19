// src/routes/api/portfolio-invites.ts
// REST API for the Portfolio invite + consent flow (see
// services/portfolio-invites.ts). A portfolio owner invites an existing org to
// attach itself; an active owner of that member org then accepts or declines.
//
// Routes (register under /api/v1, mirroring portfolios.ts -- no prefix here):
//   POST /portfolios/:id/invite                          invite a member org
//   GET  /portfolios/invites/pending                     my pending invites
//   POST /portfolios/:id/invites/:memberOrgId/accept     accept an invite
//   POST /portfolios/:id/invites/:memberOrgId/decline    decline an invite
//   GET  /portfolios/:id/invites                          portfolio-owner view
//
// AuthZ: inviting and the owner-view both require the caller to hold an ACTIVE
// org_members row in the portfolio org (same assertion as portfolios.ts). The
// pending-list route is auth-only (invites TO orgs the user owns). Accept and
// decline enforce AuthZ inside the service (actor must own the member org).

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getAuth } from '@clerk/fastify';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../config/database.js';
import { orgMembers } from '../../db/schema.js';
import { requireUuidParam, validateUuidParam } from '../../shared/param-validation.js';
import { PortfolioError } from '../../services/portfolios.js';
import {
  invitePortfolioMemberOrg,
  listPendingInvitesForUser,
  acceptPortfolioInvite,
  declinePortfolioInvite,
  listPortfolioInvitesForPortfolio,
} from '../../services/portfolio-invites.js';

/**
 * AuthZ for the per-portfolio routes. 401s if there is no authenticated user,
 * 403s if the user does not hold an ACTIVE org_members row in this portfolio
 * org. Returns the clerk userId on success, or null after writing the reply.
 */
async function assertPortfolioMember(
  request: FastifyRequest,
  reply: FastifyReply,
  portfolioId: string,
): Promise<string | null> {
  const userId = getAuth(request).userId || null;
  if (!userId) {
    reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    return null;
  }
  const [member] = await db
    .select({ id: orgMembers.id })
    .from(orgMembers)
    .where(and(
      eq(orgMembers.clerkUserId, userId),
      eq(orgMembers.orgId, portfolioId),
      eq(orgMembers.status, 'active'),
    ))
    .limit(1);
  if (!member) {
    reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'You are not a member of this portfolio' } });
    return null;
  }
  return userId;
}

/**
 * Stricter AuthZ for WRITE routes. Behaves like assertPortfolioMember but the
 * caller's active org_members row in the portfolio org must have role
 * 'owner' or 'admin'. 401/403s and returns null after writing the reply.
 */
async function assertPortfolioOwnerOrAdmin(
  request: FastifyRequest,
  reply: FastifyReply,
  portfolioId: string,
): Promise<string | null> {
  const userId = getAuth(request).userId || null;
  if (!userId) {
    reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    return null;
  }
  const [member] = await db
    .select({ role: orgMembers.role })
    .from(orgMembers)
    .where(and(
      eq(orgMembers.clerkUserId, userId),
      eq(orgMembers.orgId, portfolioId),
      eq(orgMembers.status, 'active'),
    ))
    .limit(1);
  if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
    reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'You must be a portfolio owner or admin' } });
    return null;
  }
  return userId;
}

const inviteSchema = z.object({
  memberOrgId: z.string().uuid(),
  invitedEmail: z.string().email().nullable().optional(),
});

export default async function portfolioInviteRoutes(app: FastifyInstance) {
  // POST /portfolios/:id/invite { memberOrgId, invitedEmail? } -- invite a
  // member org. Caller must be an active member of the portfolio.
  app.post<{ Params: { id: string } }>('/portfolios/:id/invite', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    const userId = await assertPortfolioOwnerOrAdmin(request, reply, id);
    if (!userId) return;

    const body = inviteSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid input', details: body.error.issues } });
    }

    try {
      await invitePortfolioMemberOrg({
        portfolioOrgId: id,
        memberOrgId: body.data.memberOrgId,
        invitedByUserId: userId,
        invitedEmail: body.data.invitedEmail ?? null,
      });
      return reply.status(201).send({ ok: true });
    } catch (e) {
      if (e instanceof PortfolioError) return reply.status(e.httpStatus).send({ error: { code: e.code, message: e.message } });
      request.log.error(e);
      return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Failed to invite member org' } });
    }
  });

  // GET /portfolios/invites/pending -- the current user's pending invites
  // (invites TO orgs they own). Auth only; no portfolio membership needed.
  app.get('/portfolios/invites/pending', async (request, reply) => {
    const userId = getAuth(request).userId || null;
    if (!userId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    try {
      const invites = await listPendingInvitesForUser(userId);
      return { invites };
    } catch (e) {
      if (e instanceof PortfolioError) return reply.status(e.httpStatus).send({ error: { code: e.code, message: e.message } });
      request.log.error(e);
      return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Failed to load pending invites' } });
    }
  });

  // POST /portfolios/:id/invites/:memberOrgId/accept -- accept a pending invite.
  // AuthZ is enforced inside the service (actor must own the member org).
  app.post<{ Params: { id: string; memberOrgId: string } }>('/portfolios/:id/invites/:memberOrgId/accept', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    const memberOrgId = validateUuidParam(request.params.memberOrgId);
    if (!memberOrgId) {
      return reply.status(400).send({ error: { code: 'INVALID_PARAM', message: 'Invalid memberOrgId: must be a valid UUID' } });
    }
    const userId = getAuth(request).userId || null;
    if (!userId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    try {
      await acceptPortfolioInvite({ portfolioOrgId: id, memberOrgId, actorClerkUserId: userId });
      return { ok: true };
    } catch (e) {
      if (e instanceof PortfolioError) return reply.status(e.httpStatus).send({ error: { code: e.code, message: e.message } });
      request.log.error(e);
      return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Failed to accept invite' } });
    }
  });

  // POST /portfolios/:id/invites/:memberOrgId/decline -- decline a pending
  // invite. AuthZ is enforced inside the service (actor must own the member org).
  app.post<{ Params: { id: string; memberOrgId: string } }>('/portfolios/:id/invites/:memberOrgId/decline', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    const memberOrgId = validateUuidParam(request.params.memberOrgId);
    if (!memberOrgId) {
      return reply.status(400).send({ error: { code: 'INVALID_PARAM', message: 'Invalid memberOrgId: must be a valid UUID' } });
    }
    const userId = getAuth(request).userId || null;
    if (!userId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    try {
      await declinePortfolioInvite({ portfolioOrgId: id, memberOrgId, actorClerkUserId: userId });
      return { ok: true };
    } catch (e) {
      if (e instanceof PortfolioError) return reply.status(e.httpStatus).send({ error: { code: e.code, message: e.message } });
      request.log.error(e);
      return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Failed to decline invite' } });
    }
  });

  // GET /portfolios/:id/invites -- portfolio-owner view of this portfolio's
  // pending/declined invites. Caller must be an active portfolio member.
  app.get<{ Params: { id: string } }>('/portfolios/:id/invites', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    if (!(await assertPortfolioMember(request, reply, id))) return;

    try {
      const invites = await listPortfolioInvitesForPortfolio(id);
      return { invites };
    } catch (e) {
      if (e instanceof PortfolioError) return reply.status(e.httpStatus).send({ error: { code: e.code, message: e.message } });
      request.log.error(e);
      return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Failed to load portfolio invites' } });
    }
  });
}
