/**
 * labs.ts -- toggle OTP Labs (per-org early access) feature opt-ins.
 *
 * Route (registers under /api/v1):
 *   POST /api/v1/labs/:key  { enabled: boolean }  -> opt this org in/out of a beta feature
 *
 * Org-scoped + settings-role gated (same gate as billing): only owners/admins
 * (or a legacy founder) can flip features for the whole org. The feature catalog
 * + toggleability rules live in shared/lab-features.ts; the DB write is in
 * services/lab-features.ts.
 */
import type { FastifyInstance, FastifyRequest } from 'fastify';
import { getAuth } from '@clerk/fastify';
import { z } from 'zod';
import { getAuthOrg } from '../../middleware/auth-helpers.js';
import { canEditOrgSettings } from '../../middleware/permissions.js';
import type { Role } from '../../services/membership.js';
import { setOrgLabOptin } from '../../services/lab-features.js';
import { getLabFeature, isLabToggleable } from '../../shared/lab-features.js';
import { markOrgEnterprise } from '../../services/portfolios.js';

const toggleSchema = z.object({ enabled: z.boolean() });

// Same owner/admin gate as billing: a legacy founder (no member row) owns their
// own org and may edit settings; otherwise require a role that canEditOrgSettings.
function callerCanEditSettings(request: FastifyRequest): boolean {
  const member = (request as unknown as { orgMember?: { role?: string } | null }).orgMember;
  const role = (member?.role || '') as Role;
  if (canEditOrgSettings(role)) return true;
  if (!member?.role) return true;
  return false;
}

export default async function labsRoutes(app: FastifyInstance) {
  app.post('/labs/:key', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in required' } });
    if (!callerCanEditSettings(request)) {
      return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Only org admins can change Labs features.' } });
    }

    const key = (request.params as { key: string }).key;
    const feature = getLabFeature(key);
    if (!feature) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Unknown feature.' } });
    }
    if (!isLabToggleable(feature)) {
      return reply.status(409).send({ error: { code: 'NOT_TOGGLEABLE', message: 'This feature is not available to toggle yet.' } });
    }

    const parsed = toggleSchema.safeParse(request.body || {});
    if (!parsed.success) {
      return reply.status(400).send({ error: { code: 'INVALID_REQUEST', message: parsed.error.issues[0]?.message || 'Invalid request body' } });
    }

    const userId = getAuth(request).userId || null;
    await setOrgLabOptin(org.id, key, parsed.data.enabled, userId);

    // Turning the Portfolio feature on flips the org to enterprise. One-way for
    // now: disabling it does NOT downgrade the tier. Best-effort -- never let the
    // tier flag break the toggle response.
    if (key === 'portfolio' && parsed.data.enabled) {
      try {
        await markOrgEnterprise(org.id);
      } catch {
        // ignore -- tier flag is secondary to the toggle.
      }
    }

    return { ok: true, key, enabled: parsed.data.enabled };
  });
}
