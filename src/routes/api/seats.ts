import type { FastifyInstance } from 'fastify';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../config/database.js';
import { seatResponsibilities, seatFitReviews, auditLogs } from '../../db/schema.js';
import { getAuth } from '@clerk/fastify';
import { getAuthOrg } from '../../middleware/auth-helpers.js';
import { resolveApiKey, requireScope } from '../../middleware/api-key-auth.js';
import { createAuditEntry } from '../../services/audit-logger.js';
import { createRateLimiter } from '../../shared/rate-limiter.js';
import { currentPeriod } from '../../shared/period.js';

const checkRateLimit = createRateLimiter({ windowMs: 60_000, maxRequests: 30 });

const updateResponsibilitiesSchema = z.object({
  responsibilities: z.array(z.string().min(1).max(300)).max(25),
});

const fitRatingSchema = z.enum(['yes', 'partial', 'no']).nullable();
const updateFitSchema = z.object({
  understands: fitRatingSchema.optional(),
  wants: fitRatingSchema.optional(),
  capacity: fitRatingSchema.optional(),
  note: z.string().max(2000).nullable().optional(),
}).refine((p) => Object.keys(p).length > 0, { message: 'patch must contain at least one field' });

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
  return true;
}

export default async function seatRoutes(app: FastifyInstance) {
  // GET /api/v1/seats/:externalId/responsibilities
  app.get<{ Params: { externalId: string } }>('/seats/:externalId/responsibilities', async (request, reply) => {
    const externalId = (request.params.externalId || '').trim();
    if (!externalId) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'externalId is required' } });
    }
    const org = await authedOrFail(request, reply);
    if (!org) return;

    const [row] = await db.select().from(seatResponsibilities)
      .where(and(eq(seatResponsibilities.orgId, org.id), eq(seatResponsibilities.seatExternalId, externalId)))
      .limit(1);

    return { responsibilities: row?.responsibilities ?? [] };
  });

  // PUT /api/v1/seats/:externalId/responsibilities
  app.put<{ Params: { externalId: string } }>('/seats/:externalId/responsibilities', async (request, reply) => {
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

    const body = updateResponsibilitiesSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid responsibilities data', details: body.error.issues } });
    }

    const updatedBy = getAuth(request).userId || 'api_key';
    const responsibilities = body.data.responsibilities;

    const [existing] = await db.select().from(seatResponsibilities)
      .where(and(eq(seatResponsibilities.orgId, org.id), eq(seatResponsibilities.seatExternalId, externalId)))
      .limit(1);

    if (existing) {
      await db.update(seatResponsibilities)
        .set({ responsibilities, updatedBy, updatedAt: new Date() })
        .where(eq(seatResponsibilities.id, existing.id));
    } else {
      await db.insert(seatResponsibilities).values({
        orgId: org.id,
        seatExternalId: externalId,
        responsibilities,
        updatedBy,
      });
    }

    await db.insert(auditLogs).values(createAuditEntry('seat.responsibilities.updated', 'seat', {
      orgId: org.id, entityId: externalId, details: { count: responsibilities.length },
    }));

    return { responsibilities };
  });

  // GET /api/v1/seats/:externalId/fit
  app.get<{ Params: { externalId: string } }>('/seats/:externalId/fit', async (request, reply) => {
    const externalId = (request.params.externalId || '').trim();
    if (!externalId) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'externalId is required' } });
    }
    const org = await authedOrFail(request, reply);
    if (!org) return;

    const period = currentPeriod();
    const [row] = await db.select().from(seatFitReviews)
      .where(and(
        eq(seatFitReviews.orgId, org.id),
        eq(seatFitReviews.seatExternalId, externalId),
        eq(seatFitReviews.period, period),
      ))
      .limit(1);

    return {
      period,
      understands: row?.understands ?? null,
      wants: row?.wants ?? null,
      capacity: row?.capacity ?? null,
      note: row?.note ?? null,
    };
  });

  // PUT /api/v1/seats/:externalId/fit -- upsert this seat's fit for the current period
  app.put<{ Params: { externalId: string } }>('/seats/:externalId/fit', async (request, reply) => {
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

    const body = updateFitSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid seat fit data', details: body.error.issues } });
    }

    const ratedBy = getAuth(request).userId || 'api_key';
    const period = currentPeriod();
    const d = body.data;

    const [existing] = await db.select().from(seatFitReviews)
      .where(and(
        eq(seatFitReviews.orgId, org.id),
        eq(seatFitReviews.seatExternalId, externalId),
        eq(seatFitReviews.period, period),
      ))
      .limit(1);

    if (existing) {
      const patch: Record<string, unknown> = { ratedBy, updatedAt: new Date() };
      if (d.understands !== undefined) patch.understands = d.understands;
      if (d.wants !== undefined) patch.wants = d.wants;
      if (d.capacity !== undefined) patch.capacity = d.capacity;
      if (d.note !== undefined) patch.note = d.note;
      await db.update(seatFitReviews).set(patch).where(eq(seatFitReviews.id, existing.id));
    } else {
      await db.insert(seatFitReviews).values({
        orgId: org.id,
        seatExternalId: externalId,
        period,
        understands: d.understands ?? null,
        wants: d.wants ?? null,
        capacity: d.capacity ?? null,
        note: d.note ?? null,
        ratedBy,
      });
    }

    await db.insert(auditLogs).values(createAuditEntry('seat.fit.updated', 'seat', {
      orgId: org.id, entityId: externalId, details: { period },
    }));

    const [row] = await db.select().from(seatFitReviews)
      .where(and(
        eq(seatFitReviews.orgId, org.id),
        eq(seatFitReviews.seatExternalId, externalId),
        eq(seatFitReviews.period, period),
      ))
      .limit(1);

    return {
      period,
      understands: row?.understands ?? null,
      wants: row?.wants ?? null,
      capacity: row?.capacity ?? null,
      note: row?.note ?? null,
    };
  });
}
