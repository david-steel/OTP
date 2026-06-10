// Web push subscription API.
//   GET    /api/v1/push/public-key      -> { enabled, publicKey } (the VAPID public key is public)
//   POST   /api/v1/push/subscriptions   -> save/refresh the caller's browser subscription
//   DELETE /api/v1/push/subscriptions   -> remove one of the caller's subscriptions
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getAuth } from '@clerk/fastify';
import { getAuthOrg } from '../../middleware/auth-helpers.js';
import { deleteSubscription, getVapidPublicKey, pushEnabled, saveSubscription } from '../../services/push.js';
import { createRateLimiter } from '../../shared/rate-limiter.js';

const checkRateLimit = createRateLimiter({ windowMs: 60_000, maxRequests: 30 });

const subscriptionSchema = z.object({
  endpoint: z.string().url().max(2048),
  keys: z.object({
    p256dh: z.string().min(1).max(255),
    auth: z.string().min(1).max(255),
  }),
});

const deleteSchema = z.object({
  endpoint: z.string().url().max(2048),
});

export default async function pushRoutes(app: FastifyInstance) {
  app.get('/push/public-key', async () => {
    return { enabled: pushEnabled, publicKey: pushEnabled ? getVapidPublicKey() : null };
  });

  app.post('/push/subscriptions', async (request, reply) => {
    if (!checkRateLimit(request.ip)) {
      return reply.status(429).send({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } });
    }
    if (!pushEnabled) return reply.status(503).send({ error: { code: 'PUSH_DISABLED', message: 'Web push is not configured' } });
    const org = await getAuthOrg(request);
    const userId = getAuth(request).userId;
    if (!org || !userId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const body = subscriptionSchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid subscription', details: body.error.issues } });

    await saveSubscription(org.id, userId, body.data, request.headers['user-agent']);
    return { ok: true };
  });

  app.delete('/push/subscriptions', async (request, reply) => {
    if (!checkRateLimit(request.ip)) {
      return reply.status(429).send({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } });
    }
    const org = await getAuthOrg(request);
    const userId = getAuth(request).userId;
    if (!org || !userId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const body = deleteSchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid input', details: body.error.issues } });

    await deleteSubscription(userId, body.data.endpoint);
    return { ok: true };
  });
}
