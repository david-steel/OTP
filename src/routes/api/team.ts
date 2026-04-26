// Team API -- editing surface for the org chart on /dashboard/team.
//
// PATCH /api/v1/team/entity   Edit one agent or human entity in the latest
//                             draft (creating one from latest published if
//                             none exists). Auth: Clerk session OR API key
//                             with 'write' scope.

import type { FastifyInstance, FastifyRequest } from 'fastify';
import { getAuth } from '@clerk/fastify';
import { z } from 'zod';
import { db } from '../../config/database.js';
import { organizations } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { resolveApiKey, requireScope } from '../../middleware/api-key-auth.js';
import { getAuthOrg } from '../../middleware/auth-helpers.js';
import { patchTeamEntity, TeamMutationError, buildAgentContext } from '../../services/team-graph.js';
import type { EntityType } from '../../services/team-graph.js';

const patchSchema = z.object({
  type: z.enum(['agent', 'human']),
  externalId: z.string().min(1).max(120),
  patch: z.object({
    name: z.string().min(1).max(255).optional(),
    role: z.string().min(1).max(255).optional(),
    mission: z.string().max(2000).optional(),
    authority_level: z.string().max(120).optional(),
    platform: z.string().max(120).optional(),
    status: z.string().max(120).optional(),
    job_description: z.string().max(2000).optional(),
    skills: z.array(z.string().min(1).max(80)).max(40).optional(),
    escalates_to: z.string().max(120).nullable().optional(),
    reports_to: z.string().max(120).nullable().optional(),
    sops: z.array(z.object({
      id: z.string().min(1).max(80).optional(),
      title: z.string().min(1).max(200),
      trigger: z.string().max(500).optional(),
      steps: z.array(z.string().min(1).max(500)).max(40).optional(),
      outputs: z.array(z.string().min(1).max(300)).max(20).optional(),
      tools: z.array(z.string().min(1).max(120)).max(20).optional(),
      notes: z.string().max(2000).optional(),
    })).max(40).optional(),
  }).refine(p => Object.keys(p).length > 0, { message: 'patch must contain at least one field' }),
});

async function checkScope(request: FastifyRequest, reply: any, requiredScope: string): Promise<boolean> {
  const auth = getAuth(request);
  if (auth.userId) return true;
  const apiKeyCtx = await resolveApiKey(request);
  if (apiKeyCtx && !requireScope(apiKeyCtx, requiredScope)) {
    reply.status(403).send({ error: { code: 'INSUFFICIENT_SCOPE', message: `API key requires '${requiredScope}' scope` } });
    return false;
  }
  return true;
}

async function getOrg(request: FastifyRequest) {
  const auth = getAuth(request);
  if (auth.userId) {
    const [row] = await db.select().from(organizations).where(eq(organizations.clerkOrgId, auth.userId)).limit(1);
    return row || null;
  }
  return await getAuthOrg(request);
}

export default async function teamRoutes(app: FastifyInstance) {
  // ============================================================
  // PATCH /api/v1/team/entity -- Edit one agent or human entity
  // ============================================================
  app.patch('/team/entity', async (request, reply) => {
    if (!(await checkScope(request, reply, 'write'))) return;

    const org = await getOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const body = patchSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid input', details: body.error.issues } });
    }

    try {
      const result = await patchTeamEntity(
        org.id,
        body.data.type as EntityType,
        body.data.externalId,
        body.data.patch
      );
      return result;
    } catch (e) {
      if (e instanceof TeamMutationError) {
        return reply.status(e.httpStatus).send({ error: { code: e.code, message: e.message } });
      }
      request.log.error(e);
      return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Failed to patch entity' } });
    }
  });

  // ============================================================
  // GET /api/v1/team/agent/:externalId/context -- compiled CLAUDE.md context
  // ============================================================
  // Returns markdown that combines an agent's own SOPs with SOPs inherited
  // from its escalation parent. Drop into a system prompt or CLAUDE.md.
  // Auth: Clerk session OR API key. Format: ?format=md (default) or json.
  app.get<{ Params: { externalId: string }; Querystring: { format?: string } }>(
    '/team/agent/:externalId/context',
    async (request, reply) => {
      // Read scope is implicit: any signed-in member of the org can fetch
      // their own org's agent context. We rely on getAuth for session and
      // fall back to API key resolution for programmatic access.
      const org = await getOrg(request);
      if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

      const { externalId } = request.params;
      if (!/^[A-Z0-9_\-]{1,120}$/i.test(externalId)) {
        return reply.status(400).send({ error: { code: 'INVALID_ID', message: 'Invalid externalId' } });
      }

      const ctx = await buildAgentContext(org.id, externalId, { orgName: org.name });
      if (!ctx) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Agent not found in your latest OOS' } });

      const format = request.query.format === 'json' ? 'json' : 'md';
      if (format === 'json') return ctx;
      reply.header('Content-Type', 'text/markdown; charset=utf-8');
      return ctx.markdown;
    }
  );
}
