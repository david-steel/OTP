import type { FastifyInstance } from 'fastify';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../config/database.js';
import { seatResponsibilities, auditLogs } from '../../db/schema.js';
import { getAuth } from '@clerk/fastify';
import { getAuthOrg } from '../../middleware/auth-helpers.js';
import { resolveApiKey, requireScope } from '../../middleware/api-key-auth.js';
import { createAuditEntry } from '../../services/audit-logger.js';
import { createRateLimiter } from '../../shared/rate-limiter.js';

const checkRateLimit = createRateLimiter({ windowMs: 60_000, maxRequests: 30 });

const updateResponsibilitiesSchema = z.object({
  responsibilities: z.array(z.string().min(1).max(300)).max(25),
});

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
}
