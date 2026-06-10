// Notification bell API.
//   GET  /api/v1/notifications           -> { unread, items } for the signed-in viewer
//   POST /api/v1/notifications/read-all  -> marks the viewer's notifications read
//
// Viewer identity follows the tenant-safety rule: resolve the signed-in
// user's claimed seats via org_members (NEVER trust client-supplied seat
// ids). Impersonation-aware: an admin "viewing as" someone sees that
// person's bell, matching every other dashboard surface.
import type { FastifyInstance } from 'fastify';
import { getAuth } from '@clerk/fastify';
import { getAuthOrg } from '../../middleware/auth-helpers.js';
import { listNotifications, markAllRead, resolveMemberIdentity, unreadCount } from '../../services/notifications.js';
import { createRateLimiter } from '../../shared/rate-limiter.js';

const checkRateLimit = createRateLimiter({ windowMs: 60_000, maxRequests: 120 });

export default async function notificationRoutes(app: FastifyInstance) {
  app.get('/notifications', async (request, reply) => {
    if (!checkRateLimit(request.ip)) {
      return reply.status(429).send({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } });
    }
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const effectiveUserId = (request as any).impersonation?.as || getAuth(request).userId;
    const { seats } = await resolveMemberIdentity(org.id, effectiveUserId);
    const [items, unread] = await Promise.all([
      listNotifications(org.id, seats, 20),
      unreadCount(org.id, seats),
    ]);
    return { unread, items };
  });

  app.post('/notifications/read-all', async (request, reply) => {
    if (!checkRateLimit(request.ip)) {
      return reply.status(429).send({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } });
    }
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const effectiveUserId = (request as any).impersonation?.as || getAuth(request).userId;
    const { seats } = await resolveMemberIdentity(org.id, effectiveUserId);
    await markAllRead(org.id, seats);
    return { ok: true };
  });
}
