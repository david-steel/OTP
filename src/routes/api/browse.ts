import type { FastifyInstance } from 'fastify';
import { sql } from 'drizzle-orm';
import { db } from '../../config/database.js';

// Intelligence browsing system -- search and filter across the full knowledge base
// Supports: industry, problem type, agent type, workflow, pattern, organization,
// confidence, evidence, publisher reputation

export default async function browseRoutes(app: FastifyInstance) {

  // GET /api/v1/intelligence/search -- Deep search across claims with rich filtering
  app.get<{
    Querystring: {
      q?: string;
      industry?: string;
      section?: string;       // core_operating_rules, failure_patterns, etc.
      confidence?: string;    // HIGH, MEDIUM, LOW
      evidence?: string;      // MEASURED_RESULT, OBSERVED_REPEATEDLY, etc.
      minQuality?: string;    // platinum, gold, silver, bronze
      template?: string;      // agent_army, value_chain, org_chart
      orgId?: string;
      page?: string;
      limit?: string;
    };
  }>('/intelligence/search', async (request) => {
    const {
      q, industry, section,
      confidence, evidence, minQuality, template, orgId,
    } = request.query;
    const page = parseInt(request.query.page || '1', 10);
    const limit = Math.min(parseInt(request.query.limit || '20', 10), 100);
    const offset = (page - 1) * limit;

    // Quality tier ordering for filtering
    const qualityOrder: Record<string, number> = { platinum: 1, gold: 2, silver: 3, bronze: 4 };
    const minQualityRank = minQuality ? qualityOrder[minQuality] || 4 : 4;

    const results = await db.execute(sql`
      SELECT
        c.id, c.claim_id, c.section, c.rule, c.why, c.failure_mode,
        c.confidence, c.evidence, c.scope,
        f.id AS oos_id, f.template, f.version,
        o.id AS org_id, o.name AS org_name, o.industry, o.size,
        o.badge, o.quality_tier,
        ${q ? sql`ts_rank(c.search_vector, plainto_tsquery('english', ${q}))` : sql`1`} AS rank
      FROM claims c
      JOIN oos_files f ON c.oos_file_id = f.id
      JOIN organizations o ON f.org_id = o.id
      WHERE f.status = 'published'
        ${q ? sql`AND c.search_vector @@ plainto_tsquery('english', ${q})` : sql``}
        ${industry ? sql`AND o.industry ILIKE ${'%' + industry + '%'}` : sql``}
        ${section ? sql`AND c.section = ${section}` : sql``}
        ${confidence ? sql`AND c.confidence = ${confidence}` : sql``}
        ${evidence ? sql`AND c.evidence = ${evidence}` : sql``}
        ${template ? sql`AND f.template = ${template}` : sql``}
        ${orgId ? sql`AND o.id = ${orgId}` : sql``}
        ${minQuality ? sql`AND (
          CASE o.quality_tier
            WHEN 'platinum' THEN 1
            WHEN 'gold' THEN 2
            WHEN 'silver' THEN 3
            WHEN 'bronze' THEN 4
            ELSE 5
          END
        ) <= ${minQualityRank}` : sql``}
      ORDER BY rank DESC, c.confidence ASC
      LIMIT ${limit} OFFSET ${offset}
    `);

    // Get available filter values for the current result set
    const facets = await db.execute(sql`
      SELECT
        'sections' AS facet_type,
        c.section AS facet_value,
        COUNT(*) AS count
      FROM claims c
      JOIN oos_files f ON c.oos_file_id = f.id
      WHERE f.status = 'published'
        ${q ? sql`AND c.search_vector @@ plainto_tsquery('english', ${q})` : sql``}
      GROUP BY c.section
      ORDER BY count DESC

      UNION ALL

      SELECT
        'industries',
        o.industry,
        COUNT(DISTINCT o.id)
      FROM claims c
      JOIN oos_files f ON c.oos_file_id = f.id
      JOIN organizations o ON f.org_id = o.id
      WHERE f.status = 'published'
        ${q ? sql`AND c.search_vector @@ plainto_tsquery('english', ${q})` : sql``}
      GROUP BY o.industry
      ORDER BY count DESC

      UNION ALL

      SELECT
        'confidence',
        c.confidence,
        COUNT(*)
      FROM claims c
      JOIN oos_files f ON c.oos_file_id = f.id
      WHERE f.status = 'published'
        ${q ? sql`AND c.search_vector @@ plainto_tsquery('english', ${q})` : sql``}
      GROUP BY c.confidence

      UNION ALL

      SELECT
        'evidence',
        c.evidence,
        COUNT(*)
      FROM claims c
      JOIN oos_files f ON c.oos_file_id = f.id
      WHERE f.status = 'published'
        ${q ? sql`AND c.search_vector @@ plainto_tsquery('english', ${q})` : sql``}
      GROUP BY c.evidence
    `);

    // Group facets
    const facetGroups: Record<string, Array<{ value: string; count: number }>> = {};
    for (const row of (facets.rows || []) as any[]) {
      if (!facetGroups[row.facet_type]) facetGroups[row.facet_type] = [];
      facetGroups[row.facet_type].push({ value: row.facet_value, count: parseInt(row.count, 10) });
    }

    // Get total count for pagination
    const countResult = await db.execute(sql`
      SELECT COUNT(*) AS total
      FROM claims c
      JOIN oos_files f ON c.oos_file_id = f.id
      JOIN organizations o ON f.org_id = o.id
      WHERE f.status = 'published'
        ${q ? sql`AND c.search_vector @@ plainto_tsquery('english', ${q})` : sql``}
        ${industry ? sql`AND o.industry ILIKE ${'%' + industry + '%'}` : sql``}
        ${section ? sql`AND c.section = ${section}` : sql``}
        ${confidence ? sql`AND c.confidence = ${confidence}` : sql``}
        ${evidence ? sql`AND c.evidence = ${evidence}` : sql``}
        ${template ? sql`AND f.template = ${template}` : sql``}
        ${orgId ? sql`AND o.id = ${orgId}` : sql``}
        ${minQuality ? sql`AND (
          CASE o.quality_tier
            WHEN 'platinum' THEN 1
            WHEN 'gold' THEN 2
            WHEN 'silver' THEN 3
            WHEN 'bronze' THEN 4
            ELSE 5
          END
        ) <= ${minQualityRank}` : sql``}
    `);
    const total = parseInt((countResult.rows as any[])[0]?.total || '0', 10);

    return {
      data: results.rows || [],
      facets: facetGroups,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  });

  // GET /api/v1/intelligence/patterns -- Cross-org coordination patterns
  app.get<{
    Querystring: { minOrgs?: string; industry?: string };
  }>('/intelligence/patterns', async (request) => {
    const minOrgs = parseInt(request.query.minOrgs || '2', 10);

    // Query the materialized view
    const patterns = await db.execute(sql`
      SELECT * FROM coordination_patterns
      WHERE org_count >= ${minOrgs}
      ${request.query.industry ? sql`AND ${request.query.industry} = ANY(industries)` : sql``}
      ORDER BY org_count DESC, instance_count DESC
      LIMIT 50
    `);

    return {
      patterns: (patterns.rows || []).map((p: any) => ({
        edgeType: p.edge_type,
        sourceType: p.source_type,
        targetType: p.target_type,
        sourceAuthority: p.source_authority,
        orgCount: p.org_count,
        instanceCount: p.instance_count,
        industries: p.industries,
      })),
      minOrganizations: minOrgs,
    };
  });

  // GET /api/v1/intelligence/sections -- List all available claim sections with counts
  app.get('/intelligence/sections', async () => {
    const sections = await db.execute(sql`
      SELECT c.section, COUNT(*) AS claim_count, COUNT(DISTINCT f.org_id) AS org_count
      FROM claims c
      JOIN oos_files f ON c.oos_file_id = f.id
      WHERE f.status = 'published'
      GROUP BY c.section
      ORDER BY claim_count DESC
    `);

    return { sections: sections.rows || [] };
  });

  // GET /api/v1/intelligence/publishers -- Browse publishers with reputation data
  app.get<{
    Querystring: { industry?: string; minQuality?: string; template?: string; page?: string; limit?: string };
  }>('/intelligence/publishers', async (request) => {
    const { industry, minQuality, template } = request.query;
    const page = parseInt(request.query.page || '1', 10);
    const limit = Math.min(parseInt(request.query.limit || '20', 10), 100);
    const offset = (page - 1) * limit;

    const qualityOrder: Record<string, number> = { platinum: 1, gold: 2, silver: 3, bronze: 4 };
    const minRank = minQuality ? qualityOrder[minQuality] || 4 : 4;

    const publishers = await db.execute(sql`
      SELECT
        o.id, o.name, o.industry, o.size, o.badge, o.quality_tier,
        o.created_at AS member_since,
        (o.clerk_org_id LIKE 'template_%') AS is_template,
        COUNT(DISTINCT f.id) AS oos_count,
        COALESCE(SUM(f.claim_count), 0) AS total_claims,
        MAX(f.published_at) AS last_published
      FROM organizations o
      JOIN oos_files f ON f.org_id = o.id AND f.status = 'published'
      WHERE TRUE
        ${industry ? sql`AND o.industry ILIKE ${'%' + industry + '%'}` : sql``}
        ${template ? sql`AND f.template = ${template}` : sql``}
        ${minQuality ? sql`AND (
          CASE o.quality_tier
            WHEN 'platinum' THEN 1 WHEN 'gold' THEN 2
            WHEN 'silver' THEN 3 WHEN 'bronze' THEN 4 ELSE 5
          END
        ) <= ${minRank}` : sql``}
      GROUP BY o.id
      ORDER BY
        CASE o.quality_tier
          WHEN 'platinum' THEN 1 WHEN 'gold' THEN 2
          WHEN 'silver' THEN 3 WHEN 'bronze' THEN 4 ELSE 5
        END ASC,
        total_claims DESC
      LIMIT ${limit} OFFSET ${offset}
    `);

    // Get total count for pagination
    const publisherCount = await db.execute(sql`
      SELECT COUNT(DISTINCT o.id) AS total
      FROM organizations o
      JOIN oos_files f ON f.org_id = o.id AND f.status = 'published'
      WHERE TRUE
        ${industry ? sql`AND o.industry ILIKE ${'%' + industry + '%'}` : sql``}
        ${template ? sql`AND f.template = ${template}` : sql``}
        ${minQuality ? sql`AND (
          CASE o.quality_tier
            WHEN 'platinum' THEN 1 WHEN 'gold' THEN 2
            WHEN 'silver' THEN 3 WHEN 'bronze' THEN 4 ELSE 5
          END
        ) <= ${minRank}` : sql``}
    `);
    const total = parseInt((publisherCount.rows as any[])[0]?.total || '0', 10);

    return {
      data: publishers.rows || [],
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  });
}
