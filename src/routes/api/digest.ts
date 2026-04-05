import type { FastifyInstance } from 'fastify';
import { isSuperAdmin } from '../../middleware/super-admin.js';
import { sendWeeklyDigest } from '../../services/weekly-digest.js';

export default async function digestRoutes(app: FastifyInstance) {

  // ============================================================
  // POST /api/v1/digest/send -- Trigger weekly digest (super admin only)
  // ============================================================
  app.post('/digest/send', async (request, reply) => {
    if (!isSuperAdmin(request)) {
      return reply.status(403).send({
        error: { code: 'FORBIDDEN', message: 'Super admin access required' },
      });
    }

    try {
      const result = await sendWeeklyDigest();
      return {
        success: true,
        ...result,
      };
    } catch (err) {
      console.error('[digest] API error:', err);
      return reply.status(500).send({
        error: { code: 'DIGEST_FAILED', message: 'Failed to send weekly digest' },
      });
    }
  });
}
