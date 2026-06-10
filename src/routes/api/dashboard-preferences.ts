// Per-member dashboard preferences API.
//   GET /api/v1/dashboard-preferences  -> { ok, data } current member's dashboard prefs
//   PUT /api/v1/dashboard-preferences  -> shallow-merges body into preferences.dashboard
//
// Identity follows the tenant-safety rule: the write targets
// request.orgMember.id (impersonation-aware, set by guards.ts), NEVER
// auth.userId / resolveOrgForUser. A legacy founder with no org_members row
// gets defaults on GET and a 403 on PUT (there is no row to write to).
import type { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import { db } from '../../config/database.js';
import { orgMembers } from '../../db/schema.js';
import { getAuthOrg, gateReadOnlyRole } from '../../middleware/auth-helpers.js';
import { createRateLimiter } from '../../shared/rate-limiter.js';
import { dashboardPreferencesSchema, mergeDashboardPreferences } from '../../shared/dashboard-preferences.js';

const checkRateLimit = createRateLimiter({ windowMs: 60_000, maxRequests: 120 });

function dashboardSlice(preferences: unknown): Record<string, unknown> {
  if (!preferences || typeof preferences !== 'object' || Array.isArray(preferences)) return {};
  const dashboard = (preferences as Record<string, unknown>).dashboard;
  if (!dashboard || typeof dashboard !== 'object' || Array.isArray(dashboard)) return {};
  return dashboard as Record<string, unknown>;
}

export default async function dashboardPreferenceRoutes(app: FastifyInstance) {
  app.get('/dashboard-preferences', async (request, reply) => {
    if (!checkRateLimit(request.ip)) {
      return reply.status(429).send({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } });
    }
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const member = request.orgMember;
    if (!member) return { ok: true, data: {} };
    return { ok: true, data: dashboardSlice(member.preferences) };
  });

  app.put('/dashboard-preferences', async (request, reply) => {
    if (!checkRateLimit(request.ip)) {
      return reply.status(429).send({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } });
    }
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    if (!(await gateReadOnlyRole(request, reply))) return;

    const member = request.orgMember;
    if (!member) {
      return reply.status(403).send({ error: { code: 'NO_MEMBER', message: 'No member row for current user; dashboard preferences require an org membership' } });
    }

    const parsed = dashboardPreferencesSchema.safeParse(request.body ?? {});
    if (!parsed.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid dashboard preferences', details: parsed.error.issues } });
    }

    // Re-read the row so a concurrent update between the decorator's load and
    // this write doesn't get clobbered with stale prefs.
    const [row] = await db.select({ preferences: orgMembers.preferences })
      .from(orgMembers)
      .where(eq(orgMembers.id, member.id))
      .limit(1);
    if (!row) {
      return reply.status(403).send({ error: { code: 'NO_MEMBER', message: 'Member row not found' } });
    }

    const currentPreferences = (row.preferences && typeof row.preferences === 'object' && !Array.isArray(row.preferences))
      ? (row.preferences as Record<string, unknown>)
      : {};
    const mergedDashboard = mergeDashboardPreferences(dashboardSlice(currentPreferences), parsed.data);

    await db.update(orgMembers)
      .set({ preferences: { ...currentPreferences, dashboard: mergedDashboard }, updatedAt: new Date() })
      .where(eq(orgMembers.id, member.id));

    return { ok: true, data: mergedDashboard };
  });
}
