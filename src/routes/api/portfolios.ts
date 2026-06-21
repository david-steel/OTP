// src/routes/api/portfolios.ts
// REST API for Portfolios -- a super-org composed of other orgs (see
// services/portfolios.ts). A portfolio rolls up member-org KPIs into
// "super-metrics" and can host its own L8 meeting.
//
// Routes (register under /api/v1, mirroring labs.ts -- no prefix here):
//   POST   /portfolios                          create a portfolio
//   POST   /portfolios/:id/members              link a member org
//   DELETE /portfolios/:id/members/:memberOrgId unlink a member org
//   POST   /portfolios/:id/metrics              add a super-metric (+ recompute)
//   POST   /portfolios/:id/recompute            recompute every super-metric
//   POST   /portfolios/:id/meeting              recompute + create a portfolio meeting
//   GET    /portfolios/:id                       full portfolio detail
//
// AuthZ: creating a portfolio requires the caller's CURRENT org to have the
// 'portfolio' Lab feature on. Every per-portfolio route requires the caller to
// hold an ACTIVE org_members row in the portfolio org itself.

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getAuth } from '@clerk/fastify';
import { createClerkClient } from '@clerk/backend';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { db } from '../../config/database.js';
import { meetings, orgMembers } from '../../db/schema.js';
import { getAuthOrg } from '../../middleware/auth-helpers.js';
import { requireUuidParam, validateUuidParam } from '../../shared/param-validation.js';
import { isFeatureEnabledForOrg } from '../../services/lab-features.js';
import { ACTIVE_ORG_COOKIE_NAME } from '../../services/active-org.js';
import {
  createPortfolio,
  linkMemberOrg,
  unlinkMemberOrg,
  addSuperMetric,
  getPortfolioDetail,
  PortfolioError,
} from '../../services/portfolios.js';
import {
  recomputePortfolioMetric,
  recomputePortfolioOrg,
} from '../../services/portfolio-metrics.js';

// Best-effort lookup of the caller's primary email (mirror onboarding.ts).
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

const goalOperatorSchema = z.enum(['gte', 'lte', 'eq', 'gt', 'lt']);
const grainSchema = z.enum(['weekly', 'monthly', 'quarterly', 'annual']);

const createSchema = z.object({
  name: z.string().min(1).max(255),
});

const memberSchema = z.object({
  memberOrgId: z.string().uuid(),
});

const metricSchema = z.object({
  title: z.string().min(1).max(255),
  unit: z.string().max(40).nullable().optional(),
  goalOperator: goalOperatorSchema.nullable().optional(),
  goalValue: z.number().finite().nullable().optional(),
  timeGrain: grainSchema.optional(),
  ownerExternalId: z.string().min(1).max(120).optional(),
  sources: z.array(z.object({
    memberOrgId: z.string().uuid(),
    memberKpiId: z.string().uuid(),
    weight: z.number().finite(),
  })).max(200).default([]),
});

export default async function portfolioRoutes(app: FastifyInstance) {
  // POST /portfolios -- create a portfolio. Gated on the CURRENT org having the
  // 'portfolio' Lab feature enabled (else 404, so the feature stays invisible).
  app.post('/portfolios', async (request, reply) => {
    const userId = getAuth(request).userId || null;
    if (!userId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const org = await getAuthOrg(request);
    if (!org || !(await isFeatureEnabledForOrg(org.id, 'portfolio'))) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Not found' } });
    }

    const body = createSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid input', details: body.error.issues } });
    }

    try {
      const email = await lookupPrimaryEmail(userId);
      const portfolio = await createPortfolio({
        name: body.data.name,
        creatorClerkUserId: userId,
        creatorEmail: email,
      });
      return reply.status(201).send({ id: portfolio.id, name: portfolio.name });
    } catch (e) {
      if (e instanceof PortfolioError) return reply.status(e.httpStatus).send({ error: { code: e.code, message: e.message } });
      request.log.error(e);
      return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create portfolio' } });
    }
  });

  // POST /portfolios/:id/members { memberOrgId } -- link a member org.
  app.post<{ Params: { id: string } }>('/portfolios/:id/members', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    if (!(await assertPortfolioMember(request, reply, id))) return;

    const body = memberSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid input', details: body.error.issues } });
    }

    try {
      await linkMemberOrg(id, body.data.memberOrgId);
      return { ok: true };
    } catch (e) {
      if (e instanceof PortfolioError) return reply.status(400).send({ error: { code: e.code, message: e.message } });
      request.log.error(e);
      return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Failed to link member org' } });
    }
  });

  // DELETE /portfolios/:id/members/:memberOrgId -- unlink a member org.
  app.delete<{ Params: { id: string; memberOrgId: string } }>('/portfolios/:id/members/:memberOrgId', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    const memberOrgId = validateUuidParam(request.params.memberOrgId);
    if (!memberOrgId) {
      return reply.status(400).send({ error: { code: 'INVALID_PARAM', message: 'Invalid memberOrgId: must be a valid UUID' } });
    }
    if (!(await assertPortfolioMember(request, reply, id))) return;

    try {
      await unlinkMemberOrg(id, memberOrgId);
      return { ok: true };
    } catch (e) {
      if (e instanceof PortfolioError) return reply.status(400).send({ error: { code: e.code, message: e.message } });
      request.log.error(e);
      return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Failed to unlink member org' } });
    }
  });

  // POST /portfolios/:id/metrics -- add a super-metric, then recompute it.
  app.post<{ Params: { id: string } }>('/portfolios/:id/metrics', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    const userId = await assertPortfolioMember(request, reply, id);
    if (!userId) return;

    const body = metricSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid input', details: body.error.issues } });
    }

    try {
      const { kpiId } = await addSuperMetric(
        id,
        {
          title: body.data.title,
          unit: body.data.unit ?? null,
          goalOperator: body.data.goalOperator ?? null,
          goalValue: body.data.goalValue ?? null,
          timeGrain: body.data.timeGrain,
          // Default the super-metric owner to the creator when not supplied.
          ownerExternalId: body.data.ownerExternalId || userId,
        },
        body.data.sources,
      );
      const result = await recomputePortfolioMetric(kpiId);
      return reply.status(201).send({ kpiId, value: result.value });
    } catch (e) {
      if (e instanceof PortfolioError) return reply.status(e.httpStatus).send({ error: { code: e.code, message: e.message } });
      request.log.error(e);
      return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Failed to add super-metric' } });
    }
  });

  // POST /portfolios/:id/recompute -- recompute every super-metric.
  app.post<{ Params: { id: string } }>('/portfolios/:id/recompute', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    if (!(await assertPortfolioMember(request, reply, id))) return;

    try {
      return await recomputePortfolioOrg(id);
    } catch (e) {
      if (e instanceof PortfolioError) return reply.status(e.httpStatus).send({ error: { code: e.code, message: e.message } });
      request.log.error(e);
      return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Failed to recompute' } });
    }
  });

  // POST /portfolios/:id/meeting -- refresh super-metric values, then create an
  // L8-style meeting in the portfolio org so the UI can link to
  // /l8/meeting/:meetingId.
  app.post<{ Params: { id: string } }>('/portfolios/:id/meeting', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    const userId = await assertPortfolioMember(request, reply, id);
    if (!userId) return;

    try {
      // Freshen super-metric values first so the meeting's scorecard snapshot
      // reflects the latest rollups.
      await recomputePortfolioOrg(id);

      // Attendees: the portfolio's active org members, in the jsonb shape the
      // meetings page reads (type/memberId/name/role).
      const members = await db
        .select({
          memberId: orgMembers.id,
          displayName: orgMembers.displayName,
          email: orgMembers.email,
          role: orgMembers.role,
          claimedEntityIds: orgMembers.claimedEntityIds,
        })
        .from(orgMembers)
        .where(and(eq(orgMembers.orgId, id), eq(orgMembers.status, 'active')));

      const attendees = members.map((m) => ({
        type: 'human',
        memberId: m.memberId,
        name: m.displayName || m.email || 'member',
        externalIds: (m.claimedEntityIds as string[]) || [],
        role: m.role,
      }));

      const [meeting] = await db.insert(meetings).values({
        organizationId: id,
        teamId: null,
        meetingType: 'leadership',
        title: 'Portfolio Meeting',
        status: 'scheduled',
        scheduledAt: new Date(),
        attendees,
        createdBy: userId,
      }).returning();

      // Pin the active org to the portfolio so the /l8/meeting/:id loader
      // (l8ResolveOrg -> resolveSwitchedOrgRow) resolves THIS portfolio and finds
      // the meeting we just created. Without this, the meeting lives in the
      // portfolio org while l8ResolveOrg returns the caller's normal active org,
      // and the page 404s with "Meeting not found". assertPortfolioMember above
      // already validated active membership, so this mirrors the switcher's
      // validated-switch semantics (services/active-org.ts invariant 1).
      reply.setCookie(ACTIVE_ORG_COOKIE_NAME, id, {
        path: '/', httpOnly: true, sameSite: 'lax', secure: true,
        maxAge: 60 * 60 * 24 * 365,
      });

      return reply.status(201).send({ meetingId: meeting.id });
    } catch (e) {
      if (e instanceof PortfolioError) return reply.status(e.httpStatus).send({ error: { code: e.code, message: e.message } });
      request.log.error(e);
      return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create portfolio meeting' } });
    }
  });

  // GET /portfolios/:id -- full portfolio detail.
  app.get<{ Params: { id: string } }>('/portfolios/:id', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    if (!(await assertPortfolioMember(request, reply, id))) return;

    try {
      return await getPortfolioDetail(id);
    } catch (e) {
      if (e instanceof PortfolioError) return reply.status(e.httpStatus).send({ error: { code: e.code, message: e.message } });
      request.log.error(e);
      return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Failed to load portfolio' } });
    }
  });
}
