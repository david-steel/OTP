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
import { jaccardSimilarity } from '../../services/similarity.js';

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

      // --- Semantic matching using Jaccard + concept synonyms ---
      // Same approach as OTP's claim similarity engine

      const STOP_WORDS = new Set([
        'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in',
        'with', 'to', 'for', 'of', 'not', 'no', 'can', 'will', 'do', 'does',
        'should', 'must', 'this', 'that', 'it', 'its', 'are', 'was', 'were',
        'be', 'been', 'being', 'have', 'has', 'had', 'having', 'from', 'by',
        'all', 'each', 'every', 'any', 'if', 'when', 'than', 'then', 'into',
        'also', 'only', 'very', 'just', 'about', 'such', 'through', 'after',
        'before', 'between', 'both', 'same', 'other', 'more', 'most', 'some',
        'used', 'describe', 'important', 'concept', 'within', 'high', 'level',
        'refers', 'how', 'organizations', 'make', 'technology', 'more', 'useful',
        'term', 'glossary', 'meaning', 'generally', 'represents', 'building',
        'block', 'helps', 'teams', 'understand', 'designed', 'managed', 'applied',
        'real', 'world', 'settings', 'context', 'especially', 'relevant', 'because',
        'modern', 'expected', 'rather', 'merely', 'therefore', 'closely', 'tied',
      ]);

      const CONCEPT_GROUPS: Record<string, string> = {
        'human': 'human_review', 'review': 'human_review', 'approval': 'human_review',
        'approve': 'human_review', 'gate': 'human_review', 'oversight': 'human_review',
        'escalation': 'human_review', 'override': 'human_review', 'validate': 'human_review',
        'authority': 'authority_boundary', 'boundary': 'authority_boundary',
        'owner': 'authority_boundary', 'ownership': 'authority_boundary',
        'permission': 'authority_boundary', 'autonomous': 'authority_boundary',
        'scope': 'authority_boundary', 'responsible': 'authority_boundary',
        'shared': 'shared_state', 'state': 'shared_state', 'file': 'shared_state',
        'source': 'shared_state', 'truth': 'shared_state', 'record': 'shared_state',
        'audit': 'shared_state', 'trail': 'shared_state', 'log': 'shared_state',
        'iteration': 'iteration_loop', 'iterate': 'iteration_loop', 'loop': 'iteration_loop',
        'feedback': 'iteration_loop', 'cycle': 'iteration_loop', 'refine': 'iteration_loop',
        'agent': 'ai_system', 'agents': 'ai_system', 'system': 'ai_system',
        'bot': 'ai_system', 'automation': 'ai_system', 'automated': 'ai_system',
        'failure': 'failure_pattern', 'error': 'failure_pattern', 'fail': 'failure_pattern',
        'risk': 'failure_pattern', 'conflict': 'failure_pattern',
        'test': 'testing', 'testing': 'testing', 'hypothesis': 'testing',
        'criteria': 'testing', 'measure': 'testing',
        'email': 'external_comms', 'send': 'external_comms', 'publish': 'external_comms',
        'client': 'external_comms', 'customer': 'external_comms',
        'generate': 'ai_generates', 'output': 'ai_generates', 'draft': 'ai_generates',
        'data': 'data_ops', 'database': 'data_ops', 'analytics': 'data_ops',
        'pipeline': 'data_ops', 'warehouse': 'data_ops', 'query': 'data_ops',
        'security': 'security', 'privacy': 'security', 'encryption': 'security',
        'compliance': 'security', 'governance': 'security', 'access': 'security',
        'prompt': 'prompt_eng', 'prompting': 'prompt_eng', 'instruction': 'prompt_eng',
        'template': 'prompt_eng', 'context': 'prompt_eng',
        'model': 'ml_model', 'training': 'ml_model', 'inference': 'ml_model',
        'prediction': 'ml_model', 'learning': 'ml_model', 'neural': 'ml_model',
        'deploy': 'deployment', 'deployment': 'deployment', 'production': 'deployment',
        'staging': 'deployment', 'release': 'deployment', 'rollout': 'deployment',
        'monitor': 'observability', 'monitoring': 'observability', 'observability': 'observability',
        'alert': 'observability', 'dashboard': 'observability', 'metric': 'observability',
        'schedule': 'scheduling', 'scheduled': 'scheduling', 'cron': 'scheduling',
        'nightly': 'scheduling', 'daily': 'scheduling', 'recurring': 'scheduling',
        'coordinate': 'coordination', 'coordination': 'coordination', 'orchestrate': 'coordination',
        'orchestration': 'coordination', 'handoff': 'coordination', 'delegation': 'coordination',
      };

      function tokenize(text: string): string[] {
        return text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/)
          .filter(t => t.length > 2).filter(t => !STOP_WORDS.has(t));
      }

      function expandWithConcepts(tokens: string[]): string[] {
        const expanded = [...tokens];
        const added = new Set<string>();
        for (const t of tokens) {
          const c = CONCEPT_GROUPS[t];
          if (c && !added.has(c)) { expanded.push('__' + c); added.add(c); }
        }
        return expanded;
      }

      // Pre-tokenize all OOS claims
      const claimTokenSets = oosClaims.map(c => ({
        claimId: c.claimId,
        tokens: expandWithConcepts(tokenize(`${c.section} ${c.rule}`)),
      }));

      const matches: Array<{
        bestPracticeId: string;
        relevanceScore: number;
        matchedClaims: string[];
      }> = [];

      for (const practice of allPractices) {
        // Tokenize the best practice (term weighted 3x by repetition)
        const practiceText = `${practice.term} ${practice.term} ${practice.term} ${practice.definition}`;
        const practiceTokens = expandWithConcepts(tokenize(practiceText));

        if (practiceTokens.length === 0) continue;

        // Score against each OOS claim, keep the best matches
        const claimScores: Array<{ claimId: string; score: number }> = [];

        for (const cs of claimTokenSets) {
          if (cs.tokens.length === 0) continue;
          const score = jaccardSimilarity(practiceTokens, cs.tokens);
          if (score > 0.05) {
            claimScores.push({ claimId: cs.claimId, score });
          }
        }

        if (claimScores.length === 0) continue;

        // Sort by score descending
        claimScores.sort((a, b) => b.score - a.score);

        // Overall relevance = best claim match (60%) + breadth bonus (40%)
        // Breadth: how many claims connect (normalized)
        const bestScore = claimScores[0].score;
        const breadth = Math.min(claimScores.length / Math.max(oosClaims.length * 0.2, 1), 1);
        const relevanceScore = bestScore * 0.6 + breadth * 0.4;

        if (relevanceScore > 0.06) {
          matches.push({
            bestPracticeId: practice.id,
            relevanceScore: Math.round(relevanceScore * 1000) / 1000,
            matchedClaims: claimScores.slice(0, 10).map(cs => cs.claimId),
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
