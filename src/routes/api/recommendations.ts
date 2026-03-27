import type { FastifyInstance } from 'fastify';
import { eq, and, sql } from 'drizzle-orm';
import { db } from '../../config/database.js';
import { resolveApiKey, requireScope } from '../../middleware/api-key-auth.js';
import { getAuthOrg } from '../../middleware/auth-helpers.js';
import { discoverRecommendations } from '../../services/recommendation-engine.js';
import { requireUuidParam } from '../../shared/param-validation.js';
import { z } from 'zod';

export default async function recommendationRoutes(app: FastifyInstance) {

  // ============================================================
  // POST /api/v1/recommendations/discover -- Run the scout
  // ============================================================
  app.post('/recommendations/discover', async (request, reply) => {
    // Check API key scope for write operations
    const discoverApiCtx = await resolveApiKey(request);
    if (discoverApiCtx && !requireScope(discoverApiCtx, 'write')) {
      return reply.status(403).send({ error: { code: 'INSUFFICIENT_SCOPE', message: "API key requires 'write' scope for this operation" } });
    }

    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const discoverSchema = z.object({
      limit: z.number().int().positive().max(100).optional().default(20),
    });
    const discoverBody = discoverSchema.safeParse(request.body || {});
    if (!discoverBody.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_ERROR', message: 'Invalid request body', details: discoverBody.error.issues } });
    }
    const maxResults = discoverBody.data.limit;

    // Run recommendation engine
    const candidates = await discoverRecommendations(org.id, maxResults);

    // Insert new recommendations, skipping duplicates (same source_claim_id for this org)
    let discovered = 0;
    for (const c of candidates) {
      // Check if this claim was already recommended for this org
      const existing = await db.execute(sql`
        SELECT id FROM recommendations
        WHERE org_id = ${org.id} AND source_claim_id = ${c.sourceClaimId}
        LIMIT 1
      `);

      if ((existing.rows as any[]).length > 0) {
        continue;
      }

      await db.execute(sql`
        INSERT INTO recommendations (
          org_id, source_claim_id, source_oos_id, source_org_name,
          status, source, relevance_score, reason, section,
          rule_text, why_text, failure_mode_text,
          confidence, evidence, scope_text
        ) VALUES (
          ${org.id}, ${c.sourceClaimId}, ${c.sourceOosId}, ${c.sourceOrgName},
          'pending', ${c.source}::recommendation_source, ${c.relevanceScore}, ${c.reason}, ${c.section},
          ${c.ruleText}, ${c.whyText}, ${c.failureModeText},
          ${c.confidence}, ${c.evidence}, ${c.scopeText}
        )
      `);
      discovered++;
    }

    // Get total pending count
    const pendingResult = await db.execute(sql`
      SELECT COUNT(*) AS cnt FROM recommendations
      WHERE org_id = ${org.id} AND status = 'pending'
    `);
    const totalPending = parseInt((pendingResult.rows as any[])[0]?.cnt || '0', 10);

    // Return the newly discovered + existing pending
    const allPending = await db.execute(sql`
      SELECT * FROM recommendations
      WHERE org_id = ${org.id} AND status = 'pending'
      ORDER BY relevance_score DESC
      LIMIT 50
    `);

    return {
      discovered,
      total_pending: totalPending,
      recommendations: (allPending.rows as any[]),
    };
  });

  // ============================================================
  // GET /api/v1/recommendations -- Get inbox
  // ============================================================
  app.get('/recommendations', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const query = request.query as {
      status?: string;
      section?: string;
      limit?: string;
      offset?: string;
    };

    const status = query.status || 'pending';
    const section = query.section;
    const limit = Math.min(parseInt(query.limit || '20', 10), 100);
    const offset = parseInt(query.offset || '0', 10);

    let whereClause = sql`org_id = ${org.id} AND status = ${status}::recommendation_status`;
    if (section) {
      whereClause = sql`${whereClause} AND section = ${section}`;
    }

    const result = await db.execute(sql`
      SELECT * FROM recommendations
      WHERE ${whereClause}
      ORDER BY relevance_score DESC, created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `);

    const countResult = await db.execute(sql`
      SELECT COUNT(*) AS cnt FROM recommendations
      WHERE ${whereClause}
    `);
    const total = parseInt((countResult.rows as any[])[0]?.cnt || '0', 10);

    return {
      recommendations: (result.rows as any[]),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  });

  // ============================================================
  // POST /api/v1/recommendations/:id/review -- Accept/reject/adapt
  // ============================================================
  app.post<{ Params: { id: string } }>('/recommendations/:id/review', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;

    // Check API key scope for write operations
    const reviewApiCtx = await resolveApiKey(request);
    if (reviewApiCtx && !requireScope(reviewApiCtx, 'write')) {
      return reply.status(403).send({ error: { code: 'INSUFFICIENT_SCOPE', message: "API key requires 'write' scope for this operation" } });
    }

    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const reviewSchema = z.object({
      action: z.enum(['accept', 'reject', 'adapt']),
      notes: z.string().max(2000).optional(),
      adapted_rule: z.string().max(2000).optional(),
      adapted_why: z.string().max(2000).optional(),
    });
    const reviewBody = reviewSchema.safeParse(request.body);
    if (!reviewBody.success) {
      return reply.status(400).send({
        error: { code: 'VALIDATION_ERROR', message: 'Invalid request body', details: reviewBody.error.issues },
      });
    }
    const body = reviewBody.data;

    // Verify the recommendation belongs to this org
    const existing = await db.execute(sql`
      SELECT id, status FROM recommendations
      WHERE id = ${id} AND org_id = ${org.id}
      LIMIT 1
    `);

    if ((existing.rows as any[]).length === 0) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Recommendation not found' } });
    }

    // Map action to status
    const statusMap: Record<string, string> = {
      accept: 'accepted',
      reject: 'rejected',
      adapt: 'adapted',
    };
    const newStatus = statusMap[body.action];

    const now = new Date().toISOString();

    await db.execute(sql`
      UPDATE recommendations
      SET
        status = ${newStatus}::recommendation_status,
        reviewed_at = ${now}::timestamptz,
        reviewed_by = 'api',
        review_notes = ${body.notes || null},
        adapted_rule = ${body.adapted_rule || null},
        adapted_why = ${body.adapted_why || null}
      WHERE id = ${id}
    `);

    // Return updated recommendation
    const updated = await db.execute(sql`
      SELECT * FROM recommendations WHERE id = ${id}
    `);

    return { recommendation: (updated.rows as any[])[0] };
  });

  // ============================================================
  // GET /api/v1/recommendations/stats -- Inbox stats
  // ============================================================
  app.get('/recommendations/stats', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const statusCounts = await db.execute(sql`
      SELECT status, COUNT(*) AS cnt
      FROM recommendations
      WHERE org_id = ${org.id}
      GROUP BY status
    `);

    const counts: Record<string, number> = { pending: 0, accepted: 0, rejected: 0, adapted: 0 };
    for (const row of (statusCounts.rows as any[])) {
      counts[row.status] = parseInt(row.cnt, 10);
    }

    const topSections = await db.execute(sql`
      SELECT section, COUNT(*) AS cnt
      FROM recommendations
      WHERE org_id = ${org.id} AND status = 'pending'
      GROUP BY section
      ORDER BY cnt DESC
      LIMIT 5
    `);

    const avgRelevance = await db.execute(sql`
      SELECT AVG(relevance_score) AS avg_score
      FROM recommendations
      WHERE org_id = ${org.id} AND status = 'pending'
    `);

    return {
      pending: counts.pending,
      accepted: counts.accepted,
      rejected: counts.rejected,
      adapted: counts.adapted,
      top_sections: (topSections.rows as any[]).map(r => ({
        section: r.section,
        count: parseInt(r.cnt, 10),
      })),
      avg_relevance: parseFloat((avgRelevance.rows as any[])[0]?.avg_score || '0'),
    };
  });
}
