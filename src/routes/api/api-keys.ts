import type { FastifyInstance } from 'fastify';
import { eq, and, isNull, desc } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../config/database.js';
import { apiKeys, auditLogs } from '../../db/schema.js';
import { generateApiKey } from '../../middleware/api-key-auth.js';
import { getAuthOrg } from '../../middleware/auth-helpers.js';
import { createAuditEntry } from '../../services/audit-logger.js';
import { requireUuidParam } from '../../shared/param-validation.js';

export default async function apiKeyRoutes(app: FastifyInstance) {

  // GET /api/v1/api-keys -- List active API keys (masked)
  app.get('/api-keys', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in required' } });

    const keys = await db
      .select({
        id: apiKeys.id,
        name: apiKeys.name,
        keyPrefix: apiKeys.keyPrefix,
        scopes: apiKeys.scopes,
        lastUsedAt: apiKeys.lastUsedAt,
        expiresAt: apiKeys.expiresAt,
        createdAt: apiKeys.createdAt,
      })
      .from(apiKeys)
      .where(and(eq(apiKeys.orgId, org.id), isNull(apiKeys.revokedAt)))
      .orderBy(desc(apiKeys.createdAt));

    return { keys };
  });

  // POST /api/v1/api-keys -- Generate a new API key
  app.post('/api-keys', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in required' } });

    const createKeySchema = z.object({
      name: z.string().min(1).max(100).optional().default('Default'),
      scopes: z.array(z.enum(['read', 'write'])).min(1).optional().default(['read', 'write']),
    });
    const parsed = createKeySchema.safeParse(request.body || {});
    if (!parsed.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_ERROR', message: 'Invalid request body', details: parsed.error.issues } });
    }
    const name = parsed.data.name;
    const scopes = parsed.data.scopes;

    // Limit to 5 active keys per org
    const activeKeys = await db
      .select({ id: apiKeys.id })
      .from(apiKeys)
      .where(and(eq(apiKeys.orgId, org.id), isNull(apiKeys.revokedAt)));

    if (activeKeys.length >= 5) {
      return reply.status(400).send({
        error: { code: 'KEY_LIMIT', message: 'Maximum 5 active API keys per organization. Revoke an existing key first.' },
      });
    }

    const { key, prefix, hash } = generateApiKey();

    const [created] = await db.insert(apiKeys).values({
      orgId: org.id,
      name,
      keyPrefix: prefix,
      keyHash: hash,
      scopes,
    }).returning();

    await db.insert(auditLogs).values(
      createAuditEntry('api_key.created', 'api_key', {
        orgId: org.id,
        entityId: created.id,
        details: { name, scopes, keyPrefix: prefix },
      })
    );

    // Return the full key ONLY on creation -- never shown again
    return reply.status(201).send({
      key,
      id: created.id,
      name: created.name,
      prefix: created.keyPrefix,
      scopes: created.scopes,
      created_at: created.createdAt,
      warning: 'Save this key now. It will not be shown again.',
    });
  });

  // DELETE /api/v1/api-keys/:id -- Revoke an API key
  app.delete<{ Params: { id: string } }>('/api-keys/:id', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;

    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in required' } });

    const [existing] = await db
      .select()
      .from(apiKeys)
      .where(and(eq(apiKeys.id, id), eq(apiKeys.orgId, org.id), isNull(apiKeys.revokedAt)))
      .limit(1);

    if (!existing) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'API key not found' } });
    }

    await db.update(apiKeys)
      .set({ revokedAt: new Date() })
      .where(eq(apiKeys.id, id));

    await db.insert(auditLogs).values(
      createAuditEntry('api_key.revoked', 'api_key', {
        orgId: org.id,
        entityId: id,
        details: { name: existing.name, keyPrefix: existing.keyPrefix },
      })
    );

    return { status: 'revoked', id };
  });
}
