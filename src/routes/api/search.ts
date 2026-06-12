import type { FastifyInstance } from 'fastify';
import { eq, sql, and, desc } from 'drizzle-orm';
import { db } from '../../config/database.js';
import { claims, oosFiles, organizations, auditLogs } from '../../db/schema.js';
import { searchQuerySchema, browseQuerySchema } from '../../shared/validation.js';
import { createAuditEntry, AUDIT_ACTIONS } from '../../services/audit-logger.js';
import { excludePrivateOrgs } from '../../shared/org-visibility.js';

export default async function searchRoutes(app: FastifyInstance) {

  // GET /api/v1/search -- Full-text search across published claims
  app.get('/search', async (request, reply) => {
    const params = searchQuerySchema.safeParse(request.query);
    if (!params.success) {
      return reply.status(400).send({ error: { code: 'INVALID_QUERY', message: 'Invalid search parameters' } });
    }

    const { q, template, industry, size, confidence, evidence, page, limit } = params.data;
    const offset = (page - 1) * limit;

    // Build the search query using ts_rank
    const results = await db.execute(sql`
      SELECT
        c.id AS claim_id,
        c.claim_id AS claim_ref,
        c.section,
        c.rule,
        c.why,
        c.failure_mode,
        c.confidence,
        c.evidence,
        c.scope,
        f.id AS oos_file_id,
        f.template,
        o.id AS org_id,
        o.name AS org_name,
        o.industry,
        o.size,
        o.badge,
        o.quality_tier,
        ts_rank(c.search_vector, plainto_tsquery('english', ${q})) AS rank
      FROM claims c
      JOIN oos_files f ON c.oos_file_id = f.id
      JOIN organizations o ON f.org_id = o.id
      WHERE f.status = 'published'
        AND o.is_private IS NOT TRUE
        AND c.search_vector @@ plainto_tsquery('english', ${q})
        ${template ? sql`AND f.template = ${template}` : sql``}
        ${industry ? sql`AND o.industry ILIKE ${'%' + industry + '%'}` : sql``}
        ${size ? sql`AND o.size = ${size}` : sql``}
        ${confidence ? sql`AND c.confidence = ${confidence}` : sql``}
        ${evidence ? sql`AND c.evidence = ${evidence}` : sql``}
      ORDER BY rank DESC
      LIMIT ${limit} OFFSET ${offset}
    `);

    // Count total results
    const countRes = await db.execute(sql`
      SELECT COUNT(*) AS total
      FROM claims c
      JOIN oos_files f ON c.oos_file_id = f.id
      JOIN organizations o ON f.org_id = o.id
      WHERE f.status = 'published'
        AND o.is_private IS NOT TRUE
        AND c.search_vector @@ plainto_tsquery('english', ${q})
        ${template ? sql`AND f.template = ${template}` : sql``}
        ${industry ? sql`AND o.industry ILIKE ${'%' + industry + '%'}` : sql``}
        ${size ? sql`AND o.size = ${size}` : sql``}
        ${confidence ? sql`AND c.confidence = ${confidence}` : sql``}
        ${evidence ? sql`AND c.evidence = ${evidence}` : sql``}
    `) as any;

    const total = parseInt((countRes.rows as any[])?.[0]?.total || '0', 10);

    // Audit
    await db.insert(auditLogs).values(
      createAuditEntry(AUDIT_ACTIONS.SEARCH_EXECUTED, 'search', {
        details: { query: q, resultCount: total, filters: { template, industry, size, confidence, evidence } },
      })
    );

    return {
      data: results.rows || [],
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  });

  // GET /api/v1/browse -- Browse all published OOS files
  app.get('/browse', async (request, reply) => {
    const params = browseQuerySchema.safeParse(request.query);
    if (!params.success) {
      return reply.status(400).send({ error: { code: 'INVALID_QUERY', message: 'Invalid browse parameters' } });
    }

    const { template, industry, size, sort, page, limit } = params.data;
    const offset = (page - 1) * limit;

    const orderClause =
      sort === 'claims' ? sql`f.claim_count DESC` :
      sort === 'quality' ? sql`o.quality_tier ASC NULLS LAST, f.claim_count DESC` :
      sql`f.published_at DESC NULLS LAST`;

    const results = await db.execute(sql`
      SELECT
        f.id, f.template, f.version, f.claim_count, f.word_count,
        f.confidence_distribution, f.evidence_distribution, f.published_at,
        o.id AS org_id, o.name AS org_name, o.industry, o.size, o.badge, o.quality_tier,
        (o.clerk_org_id LIKE 'template_%') AS is_template
      FROM oos_files f
      JOIN organizations o ON f.org_id = o.id
      WHERE f.status = 'published'
        AND o.is_private IS NOT TRUE
        ${template ? sql`AND f.template = ${template}` : sql``}
        ${industry ? sql`AND o.industry ILIKE ${'%' + industry + '%'}` : sql``}
        ${size ? sql`AND o.size = ${size}` : sql``}
      ORDER BY ${orderClause}
      LIMIT ${limit} OFFSET ${offset}
    `);

    const countRes = await db.execute(sql`
      SELECT COUNT(*) AS total
      FROM oos_files f
      JOIN organizations o ON f.org_id = o.id
      WHERE f.status = 'published'
        AND o.is_private IS NOT TRUE
        ${template ? sql`AND f.template = ${template}` : sql``}
        ${industry ? sql`AND o.industry ILIKE ${'%' + industry + '%'}` : sql``}
        ${size ? sql`AND o.size = ${size}` : sql``}
    `) as any;

    const total = parseInt((countRes.rows as any[])?.[0]?.total || '0', 10);

    return {
      data: results.rows || [],
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  });

  // GET /api/v1/org/:id -- Public org profile
  app.get<{ Params: { id: string } }>('/org/:id', async (request, reply) => {
    const { id } = request.params;

    // Private-plan enforcement: a private org requested directly by id returns
    // the SAME 404 as a missing org -- never a "this org is private" message
    // (that would itself leak existence). excludePrivateOrgs() is the chokepoint.
    const [org] = await db.select().from(organizations)
      .where(and(eq(organizations.id, id), excludePrivateOrgs()))
      .limit(1);
    if (!org) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Organization not found' } });

    const publishedFiles = await db.select({
      id: oosFiles.id,
      template: oosFiles.template,
      version: oosFiles.version,
      claimCount: oosFiles.claimCount,
      wordCount: oosFiles.wordCount,
      confidenceDistribution: oosFiles.confidenceDistribution,
      evidenceDistribution: oosFiles.evidenceDistribution,
      publishedAt: oosFiles.publishedAt,
    })
      .from(oosFiles)
      .where(and(eq(oosFiles.orgId, id), eq(oosFiles.status, 'published')))
      .orderBy(desc(oosFiles.publishedAt));

    const totalClaims = publishedFiles.reduce((sum, f) => sum + f.claimCount, 0);

    return {
      org: {
        id: org.id,
        name: org.name,
        industry: org.industry,
        size: org.size,
        badge: org.badge,
        qualityTier: org.qualityTier,
        memberSince: org.createdAt,
        isTemplate: typeof org.clerkOrgId === 'string' && org.clerkOrgId.startsWith('template_'),
      },
      stats: {
        publishedFiles: publishedFiles.length,
        totalClaims,
        latestVersion: publishedFiles[0]?.version || 0,
        latestPublish: publishedFiles[0]?.publishedAt || null,
      },
      oosFiles: publishedFiles,
    };
  });
}
