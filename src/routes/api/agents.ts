/**
 * Agent runtime API.
 *
 * POST /api/v1/agents/:externalId/run    -- fire the agent now (manual trigger)
 * GET  /api/v1/agents/:externalId/runs   -- list recent runs for that agent
 *
 * Auth: Clerk-authed members of the org. Eventually we'll gate run authority
 * on member role + agent_access toggles; v1 lets any active member fire any
 * agent on their org.
 */
import type { FastifyInstance, FastifyRequest } from 'fastify';
import { getAuth } from '@clerk/fastify';
import { z } from 'zod';
import { db } from '../../config/database.js';
import { organizations } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { resolveOrgForUser } from '../../services/membership.js';
import { runAgent, listAgentRuns } from '../../services/agent-runtime.js';

async function getOrg(request: FastifyRequest) {
  const auth = getAuth(request);
  if (!auth.userId) return null;
  const resolved = await resolveOrgForUser(auth.userId);
  if (resolved) return resolved.org;
  const [legacy] = await db.select().from(organizations).where(eq(organizations.clerkOrgId, auth.userId)).limit(1);
  return legacy || null;
}

function validExternalId(id: string): boolean {
  return /^[A-Z0-9_\-]{1,120}$/i.test(id);
}

export default async function agentRoutes(app: FastifyInstance) {
  // POST /api/v1/agents/:externalId/run
  app.post<{ Params: { externalId: string }; Body: { prompt?: string } }>('/agents/:externalId/run', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in to run agents' } });

    const externalId = request.params.externalId;
    if (!validExternalId(externalId)) return reply.status(400).send({ error: { code: 'INVALID_ID', message: 'Invalid agent externalId' } });

    const org = await getOrg(request);
    if (!org) return reply.status(404).send({ error: { code: 'NO_ORG', message: 'No org for current user' } });

    const bodySchema = z.object({ prompt: z.string().max(4000).optional() });
    const body = bodySchema.safeParse(request.body || {});
    if (!body.success) return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid prompt' } });

    const result = await runAgent({
      orgId: org.id,
      externalId,
      promptOverride: body.data.prompt || null,
      triggeredByUserId: auth.userId,
      trigger: 'manual',
    });

    return reply.send(result);
  });

  // GET /api/v1/agents/:externalId/runs?limit=25
  app.get<{ Params: { externalId: string }; Querystring: { limit?: string } }>('/agents/:externalId/runs', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in' } });

    const externalId = request.params.externalId;
    if (!validExternalId(externalId)) return reply.status(400).send({ error: { code: 'INVALID_ID', message: 'Invalid agent externalId' } });

    const org = await getOrg(request);
    if (!org) return reply.status(404).send({ error: { code: 'NO_ORG', message: 'No org for current user' } });

    const limit = Math.min(100, Math.max(1, parseInt(request.query.limit || '25', 10) || 25));
    const runs = await listAgentRuns(org.id, externalId, limit);
    return reply.send({ runs });
  });
}
