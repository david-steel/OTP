import type { FastifyInstance } from 'fastify';
import { eq, and, desc, isNull } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../config/database.js';
import { rocks, auditLogs } from '../../db/schema.js';
import { getAuth } from '@clerk/fastify';
import { getAuthOrg } from '../../middleware/auth-helpers.js';
import { resolveApiKey, requireScope } from '../../middleware/api-key-auth.js';
import { createAuditEntry } from '../../services/audit-logger.js';
import { requireUuidParam } from '../../shared/param-validation.js';
import { createRateLimiter } from '../../shared/rate-limiter.js';

const checkRateLimit = createRateLimiter({ windowMs: 60_000, maxRequests: 30 });

const createRockSchema = z.object({
  ownerEntityType: z.enum(['agent', 'human']),
  ownerExternalId: z.string().min(1).max(120),
  ownerName: z.string().max(255).optional(),
  title: z.string().min(3).max(500),
  description: z.string().optional(),
  quarter: z.string().regex(/^\d{4}-Q[1-4]$/, 'Use YYYY-QN format'),
  dueDate: z.string().datetime(),
  onTrack: z.boolean().optional().default(true),
  statusNote: z.string().optional(),
  teamId: z.string().uuid().nullable().optional(),
});

const updateRockSchema = z.object({
  title: z.string().min(3).max(500).optional(),
  description: z.string().optional(),
  ownerEntityType: z.enum(['agent', 'human']).optional(),
  ownerExternalId: z.string().max(120).optional(),
  ownerName: z.string().max(255).optional(),
  quarter: z.string().regex(/^\d{4}-Q[1-4]$/).optional(),
  dueDate: z.string().datetime().optional(),
  onTrack: z.boolean().optional(),
  statusNote: z.string().optional(),
  completed: z.boolean().optional(),
  teamId: z.string().uuid().nullable().optional(),
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

export default async function rockRoutes(app: FastifyInstance) {
  // POST /api/v1/rocks
  app.post('/rocks', async (request, reply) => {
    if (!checkRateLimit(request.ip)) {
      return reply.status(429).send({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } });
    }
    if (!(await gateWriteScope(request, reply))) return;
    const org = await authedOrFail(request, reply);
    if (!org) return;

    const body = createRockSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid rock data', details: body.error.issues } });
    }

    const createdBy = getAuth(request).userId || 'api_key';
    const [rock] = await db.insert(rocks).values({
      organizationId: org.id,
      ownerEntityType: body.data.ownerEntityType,
      ownerExternalId: body.data.ownerExternalId,
      ownerName: body.data.ownerName,
      title: body.data.title,
      description: body.data.description,
      quarter: body.data.quarter,
      dueDate: new Date(body.data.dueDate),
      onTrack: body.data.onTrack ?? true,
      statusNote: body.data.statusNote,
      statusUpdatedAt: body.data.statusNote ? new Date() : null,
      teamId: body.data.teamId || null,
      createdBy,
    }).returning();

    await db.insert(auditLogs).values(createAuditEntry('rock.created', 'rock', {
      orgId: org.id, entityId: rock.id, details: { title: rock.title, quarter: rock.quarter },
    }));

    return reply.status(201).send({ rock });
  });

  // GET /api/v1/rocks?quarter=2026-Q2
  app.get<{ Querystring: { quarter?: string; ownerExternalId?: string; onTrack?: string; teamId?: string } }>('/rocks', async (request, reply) => {
    const org = await authedOrFail(request, reply);
    if (!org) return;

    const conditions = [eq(rocks.organizationId, org.id), isNull(rocks.deletedAt)];
    if (request.query.quarter) conditions.push(eq(rocks.quarter, request.query.quarter));
    if (request.query.ownerExternalId) conditions.push(eq(rocks.ownerExternalId, request.query.ownerExternalId));
    if (request.query.onTrack === 'true') conditions.push(eq(rocks.onTrack, true));
    if (request.query.onTrack === 'false') conditions.push(eq(rocks.onTrack, false));
    if (request.query.teamId && /^[0-9a-f-]{36}$/i.test(request.query.teamId)) {
      conditions.push(eq(rocks.teamId, request.query.teamId));
    }

    const results = await db.select().from(rocks).where(and(...conditions)).orderBy(desc(rocks.dueDate));
    return { rocks: results, total: results.length };
  });

  // GET /api/v1/rocks/:id
  app.get<{ Params: { id: string } }>('/rocks/:id', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    const org = await authedOrFail(request, reply);
    if (!org) return;

    const [rock] = await db.select().from(rocks).where(and(eq(rocks.id, id), eq(rocks.organizationId, org.id))).limit(1);
    if (!rock) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Rock not found' } });
    return { rock };
  });

  // PUT /api/v1/rocks/:id
  app.put<{ Params: { id: string } }>('/rocks/:id', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    if (!(await gateWriteScope(request, reply))) return;
    const org = await authedOrFail(request, reply);
    if (!org) return;

    const body = updateRockSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid data', details: body.error.issues } });
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    const d = body.data;
    if (d.title !== undefined) updates.title = d.title;
    if (d.description !== undefined) updates.description = d.description;
    if (d.ownerEntityType !== undefined) updates.ownerEntityType = d.ownerEntityType;
    if (d.ownerExternalId !== undefined) updates.ownerExternalId = d.ownerExternalId;
    if (d.ownerName !== undefined) updates.ownerName = d.ownerName;
    if (d.quarter !== undefined) updates.quarter = d.quarter;
    if (d.dueDate !== undefined) updates.dueDate = new Date(d.dueDate);
    if (d.onTrack !== undefined) updates.onTrack = d.onTrack;
    if (d.statusNote !== undefined) {
      updates.statusNote = d.statusNote;
      updates.statusUpdatedAt = new Date();
    }
    if (d.completed === true) updates.completedAt = new Date();
    if (d.completed === false) updates.completedAt = null;
    if (d.teamId !== undefined) updates.teamId = d.teamId;

    const [updated] = await db.update(rocks)
      .set(updates)
      .where(and(eq(rocks.id, id), eq(rocks.organizationId, org.id)))
      .returning();
    if (!updated) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Rock not found' } });

    await db.insert(auditLogs).values(createAuditEntry('rock.updated', 'rock', {
      orgId: org.id, entityId: id, details: updates,
    }));

    return { rock: updated };
  });

  // DELETE /api/v1/rocks/:id  (soft delete)
  app.delete<{ Params: { id: string } }>('/rocks/:id', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    if (!(await gateWriteScope(request, reply))) return;
    const org = await authedOrFail(request, reply);
    if (!org) return;

    const [deleted] = await db.update(rocks)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(rocks.id, id), eq(rocks.organizationId, org.id)))
      .returning();
    if (!deleted) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Rock not found' } });

    await db.insert(auditLogs).values(createAuditEntry('rock.deleted', 'rock', {
      orgId: org.id, entityId: id,
    }));
    return { ok: true };
  });
}
