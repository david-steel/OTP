import type { FastifyInstance } from 'fastify';
import { eq, sql, desc, and, ilike } from 'drizzle-orm';
import { db } from '../../config/database.js';
import {
  bestPractices,
  oosBestPracticeMatches,
  oosFiles,
  claims,
  consultantProfiles,
} from '../../db/schema.js';
import { getAuthOrg } from '../../middleware/auth-helpers.js';

export default async function bestPracticesRoutes(app: FastifyInstance) {

  // ============================================================
  // GET /api/v1/best-practices -- Browse best practices (auth required)
  // ============================================================
  app.get<{
    Querystring: {
      page?: string;
      limit?: string;
      category?: string;
      q?: string;
      publisher?: string;
    };
  }>('/best-practices', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) {
      return reply.status(401).send({
        error: { code: 'AUTH_REQUIRED', message: 'Sign in to access best practices' },
      });
    }

    const page = Math.max(1, parseInt(request.query.page || '1', 10));
    const limit = Math.min(Math.max(1, parseInt(request.query.limit || '50', 10)), 200);
    const offset = (page - 1) * limit;
    const { category, q, publisher } = request.query;

    const conditions: any[] = [];

    if (category) {
      conditions.push(eq(bestPractices.category, category));
    }

    if (publisher) {
      conditions.push(eq(bestPractices.publisherProfileId, publisher));
    }

    if (q) {
      conditions.push(
        sql`${bestPractices.term} ILIKE ${'%' + q + '%'} OR ${bestPractices.definition} ILIKE ${'%' + q + '%'}`
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await db.select({
      id: bestPractices.id,
      slug: bestPractices.slug,
      term: bestPractices.term,
      definition: bestPractices.definition,
      category: bestPractices.category,
      relatedTerms: bestPractices.relatedTerms,
      sourceUrl: bestPractices.sourceUrl,
      canonicalUrl: bestPractices.canonicalUrl,
      publisherProfileId: bestPractices.publisherProfileId,
    })
      .from(bestPractices)
      .where(whereClause)
      .orderBy(bestPractices.term)
      .limit(limit)
      .offset(offset);

    const [countResult] = await db.select({ total: sql<number>`COUNT(*)` })
      .from(bestPractices)
      .where(whereClause);

    // Get categories for filtering
    const categoriesResult = await db.select({
      category: bestPractices.category,
      count: sql<number>`COUNT(*)`,
    })
      .from(bestPractices)
      .groupBy(bestPractices.category)
      .orderBy(desc(sql`COUNT(*)`));

    return {
      practices: rows,
      categories: categoriesResult,
      pagination: {
        page,
        limit,
        total: Number(countResult?.total || 0),
        totalPages: Math.ceil(Number(countResult?.total || 0) / limit),
      },
    };
  });

  // ============================================================
  // GET /api/v1/best-practices/:slug -- Single best practice detail
  // ============================================================
  app.get<{ Params: { slug: string } }>('/best-practices/:slug', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) {
      return reply.status(401).send({
        error: { code: 'AUTH_REQUIRED', message: 'Sign in to access best practices' },
      });
    }

    const [practice] = await db.select()
      .from(bestPractices)
      .where(eq(bestPractices.slug, request.params.slug))
      .limit(1);

    if (!practice) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Best practice not found' } });
    }

    // Get publisher info if linked
    let publisher = null;
    if (practice.publisherProfileId) {
      const [p] = await db.select({
        displayName: consultantProfiles.displayName,
        slug: consultantProfiles.slug,
        headline: consultantProfiles.headline,
        website: consultantProfiles.website,
        avatarUrl: consultantProfiles.avatarUrl,
      })
        .from(consultantProfiles)
        .where(eq(consultantProfiles.id, practice.publisherProfileId))
        .limit(1);
      publisher = p || null;
    }

    return { practice, publisher };
  });

  // ============================================================
  // GET /api/v1/best-practices/for-oos/:oosId -- Best practices relevant to an OOS
  // ============================================================
  app.get<{ Params: { oosId: string }; Querystring: { min_score?: string } }>(
    '/best-practices/for-oos/:oosId',
    async (request, reply) => {
      const org = await getAuthOrg(request);
      if (!org) {
        return reply.status(401).send({
          error: { code: 'AUTH_REQUIRED', message: 'Sign in to access best practices' },
        });
      }

      const { oosId } = request.params;
      const minScore = parseFloat(request.query.min_score || '0.1');

      // Check OOS belongs to this org
      const [oos] = await db.select({ id: oosFiles.id, orgId: oosFiles.orgId })
        .from(oosFiles)
        .where(eq(oosFiles.id, oosId))
        .limit(1);

      if (!oos || oos.orgId !== org.id) {
        return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'OOS not found' } });
      }

      // Get pre-computed matches
      const matches = await db.select({
        bestPracticeId: oosBestPracticeMatches.bestPracticeId,
        relevanceScore: oosBestPracticeMatches.relevanceScore,
        matchedClaims: oosBestPracticeMatches.matchedClaims,
        term: bestPractices.term,
        slug: bestPractices.slug,
        definition: bestPractices.definition,
        category: bestPractices.category,
        sourceUrl: bestPractices.sourceUrl,
        canonicalUrl: bestPractices.canonicalUrl,
      })
        .from(oosBestPracticeMatches)
        .innerJoin(bestPractices, eq(oosBestPracticeMatches.bestPracticeId, bestPractices.id))
        .where(
          and(
            eq(oosBestPracticeMatches.oosFileId, oosId),
            sql`${oosBestPracticeMatches.relevanceScore} >= ${minScore}`
          )
        )
        .orderBy(desc(oosBestPracticeMatches.relevanceScore))
        .limit(50);

      return {
        oosId,
        matchCount: matches.length,
        matches,
      };
    }
  );

  // ============================================================
  // POST /api/v1/best-practices/compute-matches/:oosId -- Compute relevance matches
  // ============================================================
  app.post<{ Params: { oosId: string } }>(
    '/best-practices/compute-matches/:oosId',
    async (request, reply) => {
      const org = await getAuthOrg(request);
      if (!org) {
        return reply.status(401).send({
          error: { code: 'AUTH_REQUIRED', message: 'Authentication required' },
        });
      }

      const { oosId } = request.params;

      // Check OOS belongs to this org
      const [oos] = await db.select({ id: oosFiles.id, orgId: oosFiles.orgId })
        .from(oosFiles)
        .where(eq(oosFiles.id, oosId))
        .limit(1);

      if (!oos || oos.orgId !== org.id) {
        return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'OOS not found' } });
      }

      // Get all claims for this OOS
      const oosClaims = await db.select({
        claimId: claims.claimId,
        section: claims.section,
        rule: claims.rule,
      })
        .from(claims)
        .where(eq(claims.oosFileId, oosId));

      // Get all best practices
      const allPractices = await db.select({
        id: bestPractices.id,
        term: bestPractices.term,
        definition: bestPractices.definition,
        category: bestPractices.category,
      }).from(bestPractices);

      // Keyword-based relevance matching
      const matches: Array<{
        bestPracticeId: string;
        relevanceScore: number;
        matchedClaims: string[];
      }> = [];

      for (const practice of allPractices) {
        const termWords = practice.term.toLowerCase().split(/\s+/);
        const defWords = practice.definition.toLowerCase().split(/\s+/).slice(0, 50);
        const practiceKeywords = new Set([...termWords, ...defWords].filter(w => w.length > 3));

        let totalScore = 0;
        const matched: string[] = [];

        for (const claim of oosClaims) {
          const claimText = `${claim.section} ${claim.rule}`.toLowerCase();
          let claimScore = 0;

          // Term name match (high weight)
          if (claimText.includes(practice.term.toLowerCase())) {
            claimScore += 0.5;
          }

          // Keyword overlap
          let keywordHits = 0;
          for (const kw of practiceKeywords) {
            if (claimText.includes(kw)) keywordHits++;
          }
          if (practiceKeywords.size > 0) {
            claimScore += (keywordHits / practiceKeywords.size) * 0.5;
          }

          if (claimScore > 0.1) {
            totalScore += claimScore;
            matched.push(claim.claimId);
          }
        }

        // Normalize score to 0-1 range
        const normalizedScore = Math.min(1, totalScore / Math.max(1, oosClaims.length * 0.3));

        if (normalizedScore > 0.05 && matched.length > 0) {
          matches.push({
            bestPracticeId: practice.id,
            relevanceScore: Math.round(normalizedScore * 1000) / 1000,
            matchedClaims: matched.slice(0, 10),
          });
        }
      }

      // Clear old matches and insert new ones
      await db.delete(oosBestPracticeMatches)
        .where(eq(oosBestPracticeMatches.oosFileId, oosId));

      if (matches.length > 0) {
        await db.insert(oosBestPracticeMatches).values(
          matches.map(m => ({
            oosFileId: oosId,
            bestPracticeId: m.bestPracticeId,
            relevanceScore: m.relevanceScore,
            matchedClaims: m.matchedClaims,
          }))
        );
      }

      return {
        oosId,
        matchesComputed: matches.length,
        topMatches: matches
          .sort((a, b) => b.relevanceScore - a.relevanceScore)
          .slice(0, 10),
      };
    }
  );

  // ============================================================
  // GET /api/v1/best-practices/graph -- Best practices data for graph overlay
  // ============================================================
  app.get('/best-practices/graph', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) {
      return reply.status(401).send({
        error: { code: 'AUTH_REQUIRED', message: 'Sign in to view best practices graph' },
      });
    }

    // Get all best practices with category grouping
    const practices = await db.select({
      id: bestPractices.id,
      term: bestPractices.term,
      slug: bestPractices.slug,
      category: bestPractices.category,
      sourceUrl: bestPractices.sourceUrl,
      canonicalUrl: bestPractices.canonicalUrl,
    }).from(bestPractices);

    // Get user's OOS files
    const userOosFiles = await db.select({
      id: oosFiles.id,
      name: oosFiles.name,
      claimCount: oosFiles.claimCount,
    })
      .from(oosFiles)
      .where(and(eq(oosFiles.orgId, org.id), eq(oosFiles.status, 'published')));

    // Get all matches for user's OOS files
    const oosIds = userOosFiles.map(f => f.id);
    let matchRows: any[] = [];

    if (oosIds.length > 0) {
      matchRows = await db.select({
        oosFileId: oosBestPracticeMatches.oosFileId,
        bestPracticeId: oosBestPracticeMatches.bestPracticeId,
        relevanceScore: oosBestPracticeMatches.relevanceScore,
      })
        .from(oosBestPracticeMatches)
        .where(sql`${oosBestPracticeMatches.oosFileId} IN (${sql.join(oosIds.map(id => sql`${id}`), sql`, `)})`);
    }

    // Build graph nodes for best practices (grouped by category)
    const categoryNodes = [...new Set(practices.map(p => p.category))].map(cat => ({
      id: `bp-cat-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      label: cat,
      type: 'bp-category' as const,
      count: practices.filter(p => p.category === cat).length,
    }));

    const practiceNodes = practices.map(p => ({
      id: `bp-${p.id}`,
      label: p.term,
      type: 'best-practice' as const,
      category: p.category,
      slug: p.slug,
      sourceUrl: p.sourceUrl,
      canonicalUrl: p.canonicalUrl,
    }));

    // Build edges: OOS -> best practice (relevance)
    const matchEdges = matchRows.map(m => ({
      source: m.oosFileId,
      target: `bp-${m.bestPracticeId}`,
      weight: m.relevanceScore,
      type: 'relevance' as const,
    }));

    // Build edges: category -> practice
    const categoryEdges = practices.map(p => ({
      source: `bp-cat-${p.category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      target: `bp-${p.id}`,
      type: 'contains' as const,
      weight: 1,
    }));

    return {
      nodes: {
        categories: categoryNodes,
        practices: practiceNodes,
        userOos: userOosFiles,
      },
      edges: {
        matches: matchEdges,
        categories: categoryEdges,
      },
      stats: {
        totalPractices: practices.length,
        categories: categoryNodes.length,
        matchedToUser: matchRows.length,
        userOosCount: userOosFiles.length,
      },
    };
  });
}
