// src/routes/api/kpis.ts
// REST API for KPI definitions. Phase 2 of the scorecard build.
//
// POST   /api/v1/kpis           Create a KPI
// GET    /api/v1/kpis           List KPIs (filterable by owner, group, grain)
// GET    /api/v1/kpis/:id       Get one KPI
// PATCH  /api/v1/kpis/:id       Update a KPI
// DELETE /api/v1/kpis/:id       Soft-delete a KPI
//
// Auth: Clerk session OR API key with 'write' scope (mirrors team API).

import type { FastifyInstance, FastifyRequest } from 'fastify';
import { getAuth } from '@clerk/fastify';
import { z } from 'zod';
import { db } from '../../config/database.js';
import { organizations } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { resolveApiKey, requireScope } from '../../middleware/api-key-auth.js';
import { getAuthOrg } from '../../middleware/auth-helpers.js';
import { resolveOrgForUser } from '../../services/membership.js';
import {
  createKpi,
  updateKpi,
  deleteKpi,
  getKpi,
  listKpis,
  KpiError,
} from '../../services/kpi.js';

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
    const resolved = await resolveOrgForUser(auth.userId);
    if (resolved) return resolved.org;
    const [row] = await db.select().from(organizations).where(eq(organizations.clerkOrgId, auth.userId)).limit(1);
    return row || null;
  }
  return await getAuthOrg(request);
}

function getCreatedBy(request: FastifyRequest): string {
  const auth = getAuth(request);
  if (auth.userId) return auth.userId;
  return 'api-key';
}

const goalOperatorSchema = z.enum(['gte', 'lte', 'eq', 'gt', 'lt']);
const ownerTypeSchema = z.enum(['agent', 'human']);
const grainSchema = z.enum(['weekly', 'monthly', 'quarterly', 'annual']);
const aggSchema = z.enum(['sum', 'avg', 'last', 'first', 'min', 'max']);

const createSchema = z.object({
  ownerEntityType: ownerTypeSchema,
  ownerExternalId: z.string().min(1).max(120),
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  groupName: z.string().max(120).optional(),
  goalOperator: goalOperatorSchema.nullable().optional(),
  goalValue: z.number().finite().nullable().optional(),
  unit: z.string().max(40).nullable().optional(),
  timeGrain: grainSchema.optional(),
  formula: z.string().max(2000).nullable().optional(),
  aggregationMethod: aggSchema.optional(),
  planSectionId: z.string().uuid().nullable().optional(),
  executionItemId: z.string().uuid().nullable().optional(),
});

const updateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).nullable().optional(),
  groupName: z.string().max(120).nullable().optional(),
  goalOperator: goalOperatorSchema.nullable().optional(),
  goalValue: z.number().finite().nullable().optional(),
  unit: z.string().max(40).nullable().optional(),
  timeGrain: grainSchema.optional(),
  formula: z.string().max(2000).nullable().optional(),
  aggregationMethod: aggSchema.optional(),
  planSectionId: z.string().uuid().nullable().optional(),
  executionItemId: z.string().uuid().nullable().optional(),
}).refine((p) => Object.keys(p).length > 0, { message: 'patch must contain at least one field' });

const listQuerySchema = z.object({
  ownerEntityType: ownerTypeSchema.optional(),
  ownerExternalId: z.string().max(120).optional(),
  groupName: z.string().max(120).optional(),
  timeGrain: grainSchema.optional(),
});

export default async function kpiRoutes(app: FastifyInstance) {
  app.post('/kpis', async (request, reply) => {
    if (!(await checkScope(request, reply, 'write'))) return;
    const org = await getOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const body = createSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid input', details: body.error.issues } });
    }

    try {
      const kpi = await createKpi(org.id, body.data, getCreatedBy(request));
      return reply.status(201).send(kpi);
    } catch (e) {
      if (e instanceof KpiError) return reply.status(e.httpStatus).send({ error: { code: e.code, message: e.message } });
      request.log.error(e);
      return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create KPI' } });
    }
  });

  app.get('/kpis', async (request, reply) => {
    const org = await getOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const q = listQuerySchema.safeParse(request.query);
    if (!q.success) return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid query', details: q.error.issues } });

    const rows = await listKpis(org.id, q.data);
    return { kpis: rows };
  });

  app.get<{ Params: { id: string } }>('/kpis/:id', async (request, reply) => {
    const org = await getOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    try {
      return await getKpi(org.id, request.params.id);
    } catch (e) {
      if (e instanceof KpiError) return reply.status(e.httpStatus).send({ error: { code: e.code, message: e.message } });
      throw e;
    }
  });

  app.patch<{ Params: { id: string } }>('/kpis/:id', async (request, reply) => {
    if (!(await checkScope(request, reply, 'write'))) return;
    const org = await getOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const body = updateSchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid input', details: body.error.issues } });

    try {
      return await updateKpi(org.id, request.params.id, body.data);
    } catch (e) {
      if (e instanceof KpiError) return reply.status(e.httpStatus).send({ error: { code: e.code, message: e.message } });
      request.log.error(e);
      return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Failed to update KPI' } });
    }
  });

  app.delete<{ Params: { id: string } }>('/kpis/:id', async (request, reply) => {
    if (!(await checkScope(request, reply, 'write'))) return;
    const org = await getOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    try {
      return await deleteKpi(org.id, request.params.id);
    } catch (e) {
      if (e instanceof KpiError) return reply.status(e.httpStatus).send({ error: { code: e.code, message: e.message } });
      request.log.error(e);
      return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Failed to delete KPI' } });
    }
  });
}
