// GET /api/v1/public/best-practices/search — unauthenticated best-practice search
import type { FastifyInstance } from 'fastify';
import { eq, and, or, ilike, sql } from 'drizzle-orm';
import { db } from '../../../config/database.js';
import { bestPractices, consultantProfiles } from '../../../db/schema.js';
import { errorEnvelope, listEnvelope, clampLimit } from './_shared.js';

export default async function publicBestPracticesRoutes(app: FastifyInstance) {
  app.get<{
    Querystring: { q?: string; limit?: string; publisher?: string; tag?: string };
  }>('/best-practices/search', async (request, reply) => {
    const { q, publisher, tag } = request.query;

    if (!q || typeof q !== 'string' || q.trim().length === 0 || q.length > 200) {
      return errorEnvelope(
        reply,
        400,
        'invalid_query',
        'Query parameter q is required and must be ≤200 chars.',
      );
    }

    const limit = clampLimit(request.query.limit, 10, 50);
    const pattern = '%' + q + '%';

    const conditions = [
      eq(bestPractices.public, true),
      or(
        ilike(bestPractices.term, pattern),
        ilike(bestPractices.category, pattern),
      )!,
    ];

    if (publisher) {
      conditions.push(eq(consultantProfiles.slug, publisher));
    }

    if (tag) {
      conditions.push(sql`${tag} = ANY(${bestPractices.relatedTerms})`);
    }

    const rows = await db
      .select({
        id: bestPractices.id,
        title: bestPractices.term,
        publisherSlug: consultantProfiles.slug,
        definition: bestPractices.definition,
        relatedTerms: bestPractices.relatedTerms,
        createdAt: bestPractices.createdAt,
      })
      .from(bestPractices)
      .leftJoin(consultantProfiles, eq(bestPractices.publisherProfileId, consultantProfiles.id))
      .where(and(...conditions))
      .orderBy(bestPractices.term)
      .limit(limit);

    const results = rows.map((row) => ({
      id: row.id,
      title: row.title,
      publisher: row.publisherSlug ?? null,
      summary: row.definition,
      tags: row.relatedTerms ?? [],
      published_at: row.createdAt?.toISOString().slice(0, 10) ?? null,
      verified_outcomes: 0,
      url: '',
    }));

    return reply.send(listEnvelope(results, { query: q }));
  });
}
