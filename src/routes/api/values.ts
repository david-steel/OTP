import type { FastifyInstance } from 'fastify';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../config/database.js';
import { orgValues, valueReviews, auditLogs } from '../../db/schema.js';
import { getAuth } from '@clerk/fastify';
import { getAuthOrg, gateReadOnlyRole } from '../../middleware/auth-helpers.js';
import { resolveApiKey, requireScope } from '../../middleware/api-key-auth.js';
import { createAuditEntry } from '../../services/audit-logger.js';
import { createRateLimiter } from '../../shared/rate-limiter.js';
import { currentPeriod } from '../../shared/period.js';

const checkRateLimit = createRateLimiter({ windowMs: 60_000, maxRequests: 60 });

const createValueSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(2000).nullable().optional(),
});

const updateValueSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(2000).nullable().optional(),
  position: z.number().int().min(0).max(999).optional(),
}).refine((p) => Object.keys(p).length > 0, { message: 'patch must contain at least one field' });

const writeReviewSchema = z.object({
  valueId: z.string().uuid(),
  rating: z.enum(['yes', 'partial', 'no']).nullable(),
  note: z.string().max(2000).nullable().optional(),
});

const uuidParam = z.string().uuid();

function authedOrFail(request: any, reply: any) {
  return getAuthOrg(request).then((org) => {
    if (!org) {
      reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
      return null;
    }
    return org;
  });
}

async function gateWriteScope(request: any, reply: any): Promise<boolean> {
  const apiKeyCtx = await resolveApiKey(request);
  if (apiKeyCtx && !requireScope(apiKeyCtx, 'write')) {
    reply.status(403).send({ error: { code: 'INSUFFICIENT_SCOPE', message: "API key requires 'write' scope" } });
    return false;
  }
  // Read-only roles (observer/inactive/free) may not mutate values.
  return gateReadOnlyRole(request, reply);
}

export default async function valueRoutes(app: FastifyInstance) {
  // GET /api/v1/values -- the organization's value list
  app.get('/values', async (request, reply) => {
    const org = await authedOrFail(request, reply);
    if (!org) return;
    const rows = await db.select().from(orgValues)
      .where(eq(orgValues.orgId, org.id))
      .orderBy(orgValues.position);
    return { values: rows };
  });

  // POST /api/v1/values
  app.post('/values', async (request, reply) => {
    if (!checkRateLimit(request.ip)) {
      return reply.status(429).send({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } });
    }
    if (!(await gateWriteScope(request, reply))) return;
    const org = await authedOrFail(request, reply);
    if (!org) return;

    const body = createValueSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid value data', details: body.error.issues } });
    }

    const existing = await db.select().from(orgValues).where(eq(orgValues.orgId, org.id));
    const [row] = await db.insert(orgValues).values({
      orgId: org.id,
      name: body.data.name,
      description: body.data.description ?? null,
      position: existing.length,
    }).returning();

    await db.insert(auditLogs).values(createAuditEntry('org_value.created', 'org_value', {
      orgId: org.id, entityId: row.id, details: { name: row.name },
    }));

    return reply.status(201).send({ value: row });
  });

  // PUT /api/v1/values/:id
  app.put<{ Params: { id: string } }>('/values/:id', async (request, reply) => {
    if (!checkRateLimit(request.ip)) {
      return reply.status(429).send({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } });
    }
    if (!(await gateWriteScope(request, reply))) return;
    const org = await authedOrFail(request, reply);
    if (!org) return;

    const idParse = uuidParam.safeParse(request.params.id);
    if (!idParse.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid value id' } });
    }
    const body = updateValueSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid value data', details: body.error.issues } });
    }

    const patch: Record<string, unknown> = {};
    if (body.data.name !== undefined) patch.name = body.data.name;
    if (body.data.description !== undefined) patch.description = body.data.description;
    if (body.data.position !== undefined) patch.position = body.data.position;

    const [row] = await db.update(orgValues)
      .set(patch)
      .where(and(eq(orgValues.id, idParse.data), eq(orgValues.orgId, org.id)))
      .returning();
    if (!row) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Value not found' } });
    }
    return { value: row };
  });

  // DELETE /api/v1/values/:id -- cascades to its value_reviews
  app.delete<{ Params: { id: string } }>('/values/:id', async (request, reply) => {
    if (!(await gateWriteScope(request, reply))) return;
    const org = await authedOrFail(request, reply);
    if (!org) return;

    const idParse = uuidParam.safeParse(request.params.id);
    if (!idParse.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid value id' } });
    }
    const [row] = await db.delete(orgValues)
      .where(and(eq(orgValues.id, idParse.data), eq(orgValues.orgId, org.id)))
      .returning();
    if (!row) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Value not found' } });
    }
    await db.insert(auditLogs).values(createAuditEntry('org_value.deleted', 'org_value', {
      orgId: org.id, entityId: row.id, details: { name: row.name },
    }));
    return { deleted: true };
  });

  // GET /api/v1/seats/:externalId/value-reviews -- this seat's ratings, current period
  app.get<{ Params: { externalId: string } }>('/seats/:externalId/value-reviews', async (request, reply) => {
    const externalId = (request.params.externalId || '').trim();
    if (!externalId) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'externalId is required' } });
    }
    const org = await authedOrFail(request, reply);
    if (!org) return;

    const period = currentPeriod();
    const rows = await db.select().from(valueReviews)
      .where(and(
        eq(valueReviews.orgId, org.id),
        eq(valueReviews.seatExternalId, externalId),
        eq(valueReviews.period, period),
      ));
    return {
      period,
      reviews: rows.map(r => ({ valueId: r.valueId, rating: r.rating, note: r.note })),
    };
  });

  // PUT /api/v1/seats/:externalId/value-reviews -- upsert one rating cell
  app.put<{ Params: { externalId: string } }>('/seats/:externalId/value-reviews', async (request, reply) => {
    if (!checkRateLimit(request.ip)) {
      return reply.status(429).send({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } });
    }
    const externalId = (request.params.externalId || '').trim();
    if (!externalId) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'externalId is required' } });
    }
    if (!(await gateWriteScope(request, reply))) return;
    const org = await authedOrFail(request, reply);
    if (!org) return;

    const body = writeReviewSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid review data', details: body.error.issues } });
    }

    // The value must belong to this org.
    const [value] = await db.select().from(orgValues)
      .where(and(eq(orgValues.id, body.data.valueId), eq(orgValues.orgId, org.id)))
      .limit(1);
    if (!value) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Value not found' } });
    }

    const ratedBy = getAuth(request).userId || 'api_key';
    const period = currentPeriod();

    const [existing] = await db.select().from(valueReviews)
      .where(and(
        eq(valueReviews.orgId, org.id),
        eq(valueReviews.seatExternalId, externalId),
        eq(valueReviews.valueId, body.data.valueId),
        eq(valueReviews.period, period),
      ))
      .limit(1);

    if (existing) {
      const patch: Record<string, unknown> = { rating: body.data.rating, ratedBy };
      if (body.data.note !== undefined) patch.note = body.data.note;
      await db.update(valueReviews).set(patch).where(eq(valueReviews.id, existing.id));
    } else {
      await db.insert(valueReviews).values({
        orgId: org.id,
        seatExternalId: externalId,
        valueId: body.data.valueId,
        period,
        rating: body.data.rating,
        note: body.data.note ?? null,
        ratedBy,
      });
    }

    return { valueId: body.data.valueId, rating: body.data.rating, period };
  });
}
