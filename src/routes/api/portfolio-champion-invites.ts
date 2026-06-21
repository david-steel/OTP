// src/routes/api/portfolio-champion-invites.ts
// REST API for the Portfolio "champion invite" flow (see
// services/portfolio-champion-invites.ts). A portfolio owner invites ONE
// champion (a person, by email) and gets a shareable tokenized accept LINK.
// On accept, a brand-new org is created from the portfolio's template, the
// champion becomes its owner, and the new org is linked into the portfolio.
//
// Routes (register under /api/v1, mirroring portfolio-invites.ts -- no prefix):
//   POST   /portfolios/:id/champion-invites              create an invite
//   GET    /portfolios/:id/champion-invites              list invites (owner UI)
//   DELETE /portfolios/:id/champion-invites/:inviteId    revoke an invite
//   POST   /portfolio/invite/:token/accept               accept (any signed-in user)
//
// AuthZ: create/list/revoke require the caller to be an owner/admin of the
// portfolio (same assertPortfolioOwnerOrAdmin as portfolio-presets.ts /
// portfolio-team.ts). Accept is authenticated-only (any signed-in user).

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getAuth } from '@clerk/fastify';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../config/database.js';
import { orgMembers, onboardingSequence } from '../../db/schema.js';
import { requireUuidParam, validateUuidParam } from '../../shared/param-validation.js';
import { PortfolioError } from '../../services/portfolios.js';
import {
  createChampionInvite,
  listChampionInvites,
  revokeChampionInvite,
  acceptChampionInvite,
} from '../../services/portfolio-champion-invites.js';

// Public base URL for building shareable accept links. Mirrors the literal
// 'https://orgtp.com' used by membership.issueInvite / onboarding, with an env
// override for non-prod.
const BASE_URL = (process.env.PUBLIC_BASE_URL || process.env.APP_BASE_URL || 'https://orgtp.com').replace(/\/+$/, '');

/**
 * Stricter AuthZ for WRITE/owner routes. 401s if there is no authenticated
 * user, 403s if the caller's active org_members row in the portfolio org is not
 * role 'owner' or 'admin'. Returns the clerk userId on success, or null after
 * writing the reply. Copied from portfolio-presets.ts / portfolio-team.ts.
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

const createSchema = z.object({
  email: z.string().trim().email().max(200),
  orgName: z.string().trim().max(255).nullable().optional(),
});

const acceptSchema = z.object({
  orgName: z.string().trim().max(255).nullable().optional(),
});

export default async function portfolioChampionInviteRoutes(app: FastifyInstance) {
  // POST /portfolios/:id/champion-invites { email, orgName? } -- owner/admin.
  app.post<{ Params: { id: string } }>('/portfolios/:id/champion-invites', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    const userId = await assertPortfolioOwnerOrAdmin(request, reply, id);
    if (!userId) return;

    const body = createSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'A valid champion email is required', details: body.error.issues } });
    }

    try {
      const invite = await createChampionInvite({
        portfolioOrgId: id,
        email: body.data.email,
        orgName: body.data.orgName ?? null,
        invitedByUserId: userId,
      });
      const acceptUrl = `${BASE_URL}/portfolio/invite/${invite.token}`;
      return reply.status(201).send({ invite: { id: invite.id, token: invite.token, email: invite.email, acceptUrl } });
    } catch (e) {
      if (e instanceof PortfolioError) return reply.status(e.httpStatus).send({ error: { code: e.code, message: e.message } });
      request.log.error(e);
      return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create champion invite' } });
    }
  });

  // GET /portfolios/:id/champion-invites -- owner/admin; pending + accepted.
  app.get<{ Params: { id: string } }>('/portfolios/:id/champion-invites', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    const userId = await assertPortfolioOwnerOrAdmin(request, reply, id);
    if (!userId) return;

    try {
      const rows = await listChampionInvites(id);
      const invites = rows.map((r) => ({
        id: r.id,
        email: r.email,
        orgName: r.orgName,
        status: r.status,
        createdOrgId: r.createdOrgId,
        acceptUrl: `${BASE_URL}/portfolio/invite/${r.token}`,
      }));
      return { invites };
    } catch (e) {
      if (e instanceof PortfolioError) return reply.status(e.httpStatus).send({ error: { code: e.code, message: e.message } });
      request.log.error(e);
      return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Failed to load champion invites' } });
    }
  });

  // DELETE /portfolios/:id/champion-invites/:inviteId -- owner/admin; revoke.
  app.delete<{ Params: { id: string; inviteId: string } }>('/portfolios/:id/champion-invites/:inviteId', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    const inviteId = validateUuidParam(request.params.inviteId);
    if (!inviteId) {
      return reply.status(400).send({ error: { code: 'INVALID_PARAM', message: 'Invalid inviteId: must be a valid UUID' } });
    }
    const userId = await assertPortfolioOwnerOrAdmin(request, reply, id);
    if (!userId) return;

    try {
      await revokeChampionInvite(id, inviteId);
      return { ok: true };
    } catch (e) {
      if (e instanceof PortfolioError) return reply.status(e.httpStatus).send({ error: { code: e.code, message: e.message } });
      request.log.error(e);
      return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Failed to revoke champion invite' } });
    }
  });

  // POST /portfolio/invite/:token/accept { orgName? } -- any signed-in user.
  app.post<{ Params: { token: string } }>('/portfolio/invite/:token/accept', async (request, reply) => {
    const userId = getAuth(request).userId || null;
    if (!userId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const token = String(request.params.token || '').trim();
    if (!token || token.length > 64) {
      return reply.status(400).send({ error: { code: 'INVALID_PARAM', message: 'Invalid token' } });
    }

    const body = acceptSchema.safeParse(request.body || {});
    if (!body.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid input', details: body.error.issues } });
    }

    // The signed-in user's email, used as the owner email on the new org.
    // Pulled from the onboarding_sequence row the Clerk webhook wrote at
    // user.created -- the same proven source onboarding.ts uses. Best-effort;
    // acceptChampionInvite falls back to the invite email when this is null.
    let clerkEmail: string | null = null;
    try {
      const [onb] = await db.select({ email: onboardingSequence.email })
        .from(onboardingSequence).where(eq(onboardingSequence.clerkUserId, userId)).limit(1);
      clerkEmail = onb?.email || null;
    } catch { /* best-effort */ }

    try {
      const result = await acceptChampionInvite({
        token,
        clerkUserId: userId,
        clerkEmail,
        orgName: body.data.orgName ?? null,
      });
      return { orgId: result.orgId };
    } catch (e) {
      if (e instanceof PortfolioError) return reply.status(e.httpStatus).send({ error: { code: e.code, message: e.message } });
      request.log.error(e);
      return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Failed to accept invite' } });
    }
  });
}
