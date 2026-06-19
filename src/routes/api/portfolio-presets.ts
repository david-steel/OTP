// src/routes/api/portfolio-presets.ts
// REST API for Portfolio PRESETS -- a portfolio org's preset defaults (sidebar /
// settings) that its MEMBER orgs inherit (see services/portfolio-presets.ts).
//
// Routes (register under /api/v1, mirroring portfolios.ts -- no prefix here):
//   GET  /portfolios/:id/presets   read the portfolio's preset defaults
//   POST /portfolios/:id/presets   write the portfolio's preset defaults
//
// AuthZ: every route requires the caller to hold an ACTIVE org_members row in
// the portfolio org itself (same membership-assertion style as portfolios.ts).

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getAuth } from '@clerk/fastify';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { db } from '../../config/database.js';
import { orgMembers } from '../../db/schema.js';
import { requireUuidParam } from '../../shared/param-validation.js';
import { PortfolioError } from '../../services/portfolios.js';
import {
  getPortfolioPresets,
  setPortfolioPresets,
} from '../../services/portfolio-presets.js';

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

const presetsSchema = z.object({
  sidebar: z.any().optional(),
  settings: z.any().optional(),
  locked: z.array(z.string()).max(20).optional(),
});

export default async function portfolioPresetRoutes(app: FastifyInstance) {
  // GET /portfolios/:id/presets -- read the portfolio's preset defaults.
  app.get<{ Params: { id: string } }>('/portfolios/:id/presets', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    if (!(await assertPortfolioMember(request, reply, id))) return;

    try {
      return await getPortfolioPresets(id);
    } catch (e) {
      if (e instanceof PortfolioError) return reply.status(e.httpStatus).send({ error: { code: e.code, message: e.message } });
      request.log.error(e);
      return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Failed to load presets' } });
    }
  });

  // POST /portfolios/:id/presets { sidebar?, settings?, locked? } -- write the
  // portfolio's preset defaults.
  app.post<{ Params: { id: string } }>('/portfolios/:id/presets', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    if (!(await assertPortfolioOwnerOrAdmin(request, reply, id))) return;

    const body = presetsSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid input', details: body.error.issues } });
    }

    try {
      await setPortfolioPresets(id, {
        sidebar: body.data.sidebar,
        settings: body.data.settings,
        locked: body.data.locked,
      });
      return { ok: true };
    } catch (e) {
      if (e instanceof PortfolioError) return reply.status(e.httpStatus).send({ error: { code: e.code, message: e.message } });
      request.log.error(e);
      return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Failed to save presets' } });
    }
  });
}
