// src/routes/api/portfolio-team.ts
// REST API for the Portfolio TEAM -- the people on a portfolio (super-org) so a
// portfolio meeting has attendees. Team members are drawn from the portfolio's
// MEMBER (child) orgs (see services/portfolio-team.ts).
//
// Routes (register under /api/v1, mirroring portfolios.ts -- no prefix here):
//   GET    /portfolios/:id/team             current team + add-able candidates
//   POST   /portfolios/:id/team {clerkUserId}  add a person from a member org
//   DELETE /portfolios/:id/team/:memberId   remove a person from the team
//
// AuthZ: reads require an ACTIVE org_members row in the portfolio org; writes
// require role owner|admin. Same assertion style as portfolio-presets.ts.

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getAuth } from '@clerk/fastify';
import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import { db } from '../../config/database.js';
import { orgMembers } from '../../db/schema.js';
import { requireUuidParam } from '../../shared/param-validation.js';
import { PortfolioError } from '../../services/portfolios.js';
import {
  listPortfolioTeam,
  listMemberOrgCandidates,
  addPortfolioTeamMember,
  removePortfolioTeamMember,
} from '../../services/portfolio-team.js';

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

function sendPortfolioError(err: unknown, reply: FastifyReply, request: FastifyRequest, fallback: string) {
  if (err instanceof PortfolioError) {
    return reply.status(err.httpStatus || 400).send({ error: { code: err.code, message: err.message } });
  }
  request.log.error(err);
  return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: fallback } });
}

const addSchema = z.object({ clerkUserId: z.string().trim().min(1).max(255) });

export default async function portfolioTeamRoutes(app: FastifyInstance) {
  // GET /portfolios/:id/team -- current team + add-able candidates.
  app.get<{ Params: { id: string } }>('/portfolios/:id/team', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    if (!(await assertPortfolioMember(request, reply, id))) return;

    try {
      const [team, candidates] = await Promise.all([
        listPortfolioTeam(id),
        listMemberOrgCandidates(id),
      ]);
      return { team, candidates };
    } catch (e) {
      return sendPortfolioError(e, reply, request, 'Failed to load portfolio team');
    }
  });

  // POST /portfolios/:id/team { clerkUserId } -- add a person from a member org.
  app.post<{ Params: { id: string } }>('/portfolios/:id/team', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    if (!(await assertPortfolioOwnerOrAdmin(request, reply, id))) return;

    const body = addSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid input', details: body.error.issues } });
    }

    try {
      const member = await addPortfolioTeamMember(id, body.data.clerkUserId);
      return reply.status(201).send({ ok: true, member });
    } catch (e) {
      return sendPortfolioError(e, reply, request, 'Failed to add team member');
    }
  });

  // DELETE /portfolios/:id/team/:memberId -- remove a person from the team.
  app.delete<{ Params: { id: string; memberId: string } }>('/portfolios/:id/team/:memberId', async (request, reply) => {
    const id = requireUuidParam(request, reply, 'id');
    if (!id) return;
    const memberId = requireUuidParam(request, reply, 'memberId');
    if (!memberId) return;
    if (!(await assertPortfolioOwnerOrAdmin(request, reply, id))) return;

    try {
      await removePortfolioTeamMember(id, memberId);
      return { ok: true };
    } catch (e) {
      return sendPortfolioError(e, reply, request, 'Failed to remove team member');
    }
  });
}
