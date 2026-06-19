/**
 * org-ai-keys.ts -- BYOK (Bring Your Own AI Key) management for the caller's org.
 *
 * Routes (register under /api/v1; wiring is done elsewhere -- NOT in this file):
 *   GET    /api/v1/org/ai-key   -> key META (any member) + encryptionConfigured flag
 *   POST   /api/v1/org/ai-key   -> store/rotate the org's key (owner/admin only)
 *   DELETE /api/v1/org/ai-key   -> revoke the org's active key (owner/admin only)
 *
 * Because a Portfolio is itself an org, this single org-scoped key applies to BOTH
 * a normal org AND a portfolio -- whichever is the caller's current active org.
 *
 * Org-scoped + settings-role gated, same gate as billing/labs. The plaintext key
 * is NEVER returned, logged, or echoed back -- only metadata (provider + last4).
 */
import type { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { getAuthOrg } from '../../middleware/auth-helpers.js';
import { canEditOrgSettings } from '../../middleware/permissions.js';
import type { Role } from '../../services/membership.js';
import { isEncryptionConfigured } from '../../services/secret-encryption.js';
import { PortfolioError } from '../../services/portfolios.js';
import {
  setOrgAiKey,
  getOrgAiKeyMeta,
  revokeOrgAiKey,
} from '../../services/org-ai-keys.js';

// Same owner/admin gate as billing/labs: a legacy founder (no member row) owns
// their own org and may edit settings; otherwise require a role that
// canEditOrgSettings.
function callerCanEditSettings(request: FastifyRequest): boolean {
  const member = (request as unknown as { orgMember?: { role?: string } | null }).orgMember;
  const role = (member?.role || '') as Role;
  if (canEditOrgSettings(role)) return true;
  if (!member?.role) return true;
  return false;
}

const setKeySchema = z.object({
  provider: z.enum(['anthropic', 'openai']),
  key: z.string().min(1, 'A non-empty API key is required'),
});

export default async function orgAiKeysRoutes(app: FastifyInstance) {
  // GET /api/v1/org/ai-key -- META only (never the key). Any member may read.
  app.get('/org/ai-key', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in required' } });

    const meta = await getOrgAiKeyMeta(org.id);
    return {
      ...meta,
      encryptionConfigured: isEncryptionConfigured(),
    };
  });

  // POST /api/v1/org/ai-key -- store/rotate the org's key. Owner/admin only.
  app.post('/org/ai-key', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in required' } });
    if (!callerCanEditSettings(request)) {
      return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Only org admins can change the AI key.' } });
    }

    const parsed = setKeySchema.safeParse(request.body || {});
    if (!parsed.success) {
      return reply.status(400).send({
        error: { code: 'INVALID_REQUEST', message: parsed.error.issues[0]?.message || 'Invalid request body' },
      });
    }

    try {
      await setOrgAiKey({ orgId: org.id, provider: parsed.data.provider, plaintextKey: parsed.data.key });
    } catch (err) {
      if (err instanceof PortfolioError) {
        return reply.status(err.httpStatus).send({ error: { code: err.code, message: err.message } });
      }
      throw err;
    }

    return { ok: true };
  });

  // DELETE /api/v1/org/ai-key -- revoke the org's active key. Owner/admin only.
  app.delete('/org/ai-key', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in required' } });
    if (!callerCanEditSettings(request)) {
      return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Only org admins can change the AI key.' } });
    }

    await revokeOrgAiKey(org.id);
    return { ok: true };
  });
}
