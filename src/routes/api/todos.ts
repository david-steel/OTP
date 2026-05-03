import type { FastifyInstance } from 'fastify';
import { eq, and, desc, isNull } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../config/database.js';
import { todos, auditLogs } from '../../db/schema.js';
import { getAuth } from '@clerk/fastify';
import { getAuthOrg } from '../../middleware/auth-helpers.js';
import { resolveApiKey, requireScope } from '../../middleware/api-key-auth.js';
import { createAuditEntry } from '../../services/audit-logger.js';
import { requireUuidParam } from '../../shared/param-validation.js';
import { createRateLimiter } from '../../shared/rate-limiter.js';

const checkRateLimit = createRateLimiter({ windowMs: 60_000, maxRequests: 60 });

const createTodoSchema = z.object({
  ownerEntityType: z.enum(['agent', 'human']),
  ownerExternalId: z.string().min(1).max(120),
  ownerName: z.string().max(255).optional(),
  title: z.string().min(3).max(500),
  description: z.string().optional(),
  dueAt: z.string().datetime().optional(),
  meetingId: z.string().uuid().optional(),
});

const updateTodoSchema = z.object({
  title: z.string().min(3).max(500).optional(),
  description: z.string().optional(),
  ownerEntityType: z.enum(['agent', 'human']).optional(),
  ownerExternalId: z.string().max(120).optional(),
  ownerName: z.string().max(255).optional(),
  dueAt: z.string().datetime().nullable().optional(),
  done: z.boolean().optional(),
});

async function authedOrFail(request: any, reply: any) {
  const org = await getAuthOrg(request);
  if (!org) {
    reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    return null;
  }
  return org;
}

async function gateWriteScope(request: any, reply: any): Promise<boolean> {
  const apiKeyCtx = await resolveApiKey(request);
  if (apiKeyCtx && !requireScope(apiKeyCtx, 'write')) {
    reply.status(403).send({ error: { code: 'INSUFFICIENT_SCOPE', message: "API key requires 'write' scope" } });
    return false;
  }
  return true;
}

export default async function todoRoutes(app: FastifyInstance) {
  // POST /api/v1/todos
  app.post('/todos', async (request, reply) => {
    if (!checkRateLimit(request.ip)) {
      return reply.status(429).send({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } });
    }
    if (!(await gateWriteScope(request, reply))) return;
    const org = await authedOrFail(request, reply);
    if (!org) return;

    const body = createTodoSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid todo data', details: body.error.issues } });
    }

    const createdBy = getAuth(request).userId || 'api_key';
    const [todo] = await db.insert(todos).values({
      organizationId: org.id,
      meetingId: body.data.meetingId || null,
      ownerEntityType: body.data.ownerEntityType,
      ownerExternalId: body.data.ownerExternalId,
      ownerName: body.data.ownerName,
      title: body.data.title,
      description: body.data.description,
      dueAt: body.data.dueAt ? new Date(body.data.dueAt) : null,
      createdBy,
    }).returning();

    await db.insert(auditLogs).values(createAuditEntry('todo.created', 'todo', {
      orgId: org.id, entityId: todo.id, details: { title: todo.title },
    }));

    return reply.status(201).send({ todo });
  });

  // GET /api/v1/todos?open=true&meetingId=&ownerExternalId=
  app.get<{ Querystring: { open?: string; meetingId?: string; ownerExternalId?: string } }>('/todos', async (request, reply) => {
    const org = await authedOrFail(request, reply);
    if (!org) return;

    const conditions = [eq(todos.organizationId, org.id), isNull(todos.deletedAt)];
    if (request.query.open === 'true') conditions.push(isNull(todos.doneAt));
    if (request.query.meetingId) conditions.push(eq(todos.meetingId, request.query.meetingId));
    if (request.query.ownerExternalId) conditions.push(eq(todos.ownerExternalId, request.query.ownerExternalId));

    const results = await db.select().from(todos).where(and(...conditions)).orderBy(desc(todos.createdAt));
    return { todos: results, total: results.length };
  });

  // GET /api/v1/todos/:id
  app.get<{ Params: { id: string } }>('/todos/:id', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    const org = await authedOrFail(request, reply);
    if (!org) return;

    const [todo] = await db.select().from(todos).where(and(eq(todos.id, id), eq(todos.organizationId, org.id))).limit(1);
    if (!todo) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Todo not found' } });
    return { todo };
  });

  // PUT /api/v1/todos/:id
  app.put<{ Params: { id: string } }>('/todos/:id', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    if (!(await gateWriteScope(request, reply))) return;
    const org = await authedOrFail(request, reply);
    if (!org) return;

    const body = updateTodoSchema.safeParse(request.body);
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
    if (d.dueAt !== undefined) updates.dueAt = d.dueAt ? new Date(d.dueAt) : null;
    if (d.done === true) updates.doneAt = new Date();
    if (d.done === false) updates.doneAt = null;

    const [updated] = await db.update(todos)
      .set(updates)
      .where(and(eq(todos.id, id), eq(todos.organizationId, org.id)))
      .returning();
    if (!updated) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Todo not found' } });

    await db.insert(auditLogs).values(createAuditEntry('todo.updated', 'todo', {
      orgId: org.id, entityId: id, details: updates,
    }));

    return { todo: updated };
  });

  // DELETE /api/v1/todos/:id (soft)
  app.delete<{ Params: { id: string } }>('/todos/:id', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    if (!(await gateWriteScope(request, reply))) return;
    const org = await authedOrFail(request, reply);
    if (!org) return;

    const [deleted] = await db.update(todos)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(todos.id, id), eq(todos.organizationId, org.id)))
      .returning();
    if (!deleted) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Todo not found' } });

    await db.insert(auditLogs).values(createAuditEntry('todo.deleted', 'todo', {
      orgId: org.id, entityId: id,
    }));
    return { ok: true };
  });
}
