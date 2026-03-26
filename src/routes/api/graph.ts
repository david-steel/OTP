import type { FastifyInstance } from 'fastify';
import { eq, sql } from 'drizzle-orm';
import { db } from '../../config/database.js';
import { oosFiles, organizations, claimSimilarities, claims } from '../../db/schema.js';
import {
  findAgentConflicts,
  findEscalationPath,
  compareOrganizations,
  extractCoordinationPatterns,
  getOrgSubgraph,
  getAuthorityMap,
} from '../../graph/graph-queries.js';
import { buildGraph } from '../../graph/graph-builder.js';

export default async function graphRoutes(app: FastifyInstance) {

  // GET /api/v1/graph -- Full Intelligence Graph (nodes + edges + claims for visualization)
  app.get<{ Querystring: { min_score?: string } }>('/graph', async (request, reply) => {
    const minScore = parseFloat(request.query.min_score || '0');
    const publishedFiles = await db.select({
      id: oosFiles.id,
      orgId: oosFiles.orgId,
      orgName: organizations.name,
      template: oosFiles.template,
      industry: organizations.industry,
      claimCount: oosFiles.claimCount,
      qualityTier: organizations.qualityTier,
      badge: organizations.badge,
      frontmatter: oosFiles.frontmatter,
    })
      .from(oosFiles)
      .innerJoin(organizations, eq(oosFiles.orgId, organizations.id))
      .where(eq(oosFiles.status, 'published'));

    const similarities = await db.execute(sql`
      SELECT cs.oos_a_id, cs.oos_b_id,
             ca.rule AS claim_a_rule, cb.rule AS claim_b_rule,
             cs.similarity_score AS score
      FROM claim_similarities cs
      JOIN claims ca ON cs.claim_a_id = ca.id
      JOIN claims cb ON cs.claim_b_id = cb.id
    `);

    const simRows = (similarities.rows || []).map((r: any) => ({
      oosAId: r.oos_a_id,
      oosBId: r.oos_b_id,
      claimARule: r.claim_a_rule,
      claimBRule: r.claim_b_rule,
      score: parseFloat(r.score),
    }));

    // Apply min_score filter if provided
    const filteredSims = minScore > 0
      ? simRows.filter(s => s.score >= minScore)
      : simRows;

    const graph = buildGraph(publishedFiles, filteredSims);

    // Fetch claim-level data for all published OOS files (for layer controls)
    const oosIds = publishedFiles.map(f => f.id);
    const claimsMap: Record<string, Array<{
      claimId: string;
      section: string;
      confidence: string;
      evidence: string;
      rule: string;
    }>> = {};

    if (oosIds.length > 0) {
      const allClaims = await db.select({
        oosFileId: claims.oosFileId,
        claimId: claims.claimId,
        section: claims.section,
        confidence: claims.confidence,
        evidence: claims.evidence,
        rule: claims.rule,
      })
        .from(claims)
        .where(sql`${claims.oosFileId} IN (${sql.join(oosIds.map(id => sql`${id}`), sql`, `)})`);

      for (const c of allClaims) {
        if (!claimsMap[c.oosFileId]) claimsMap[c.oosFileId] = [];
        claimsMap[c.oosFileId].push({
          claimId: c.claimId,
          section: c.section,
          confidence: c.confidence,
          evidence: c.evidence,
          rule: c.rule,
        });
      }
    }

    // Compute stats
    const totalClaims = publishedFiles.reduce((sum, f) => sum + f.claimCount, 0);

    // Count cross-org patterns from coordination_patterns materialized view
    let patternCount = 0;
    try {
      const patternResult = await db.execute(sql`SELECT COUNT(*) AS cnt FROM coordination_patterns`);
      patternCount = parseInt((patternResult.rows as any[])[0]?.cnt || '0', 10);
    } catch {
      // Materialized view may not be refreshed yet
    }

    // Extract platform + MCP server data from frontmatter for Infrastructure mode
    const AI_PLATFORMS = new Set(['claude', 'gpt', 'chatgpt', 'openai', 'gemini', 'google gemini', 'custom']);
    const nodePlatforms: Record<string, { platforms: string[]; mcpServers: string[] }> = {};
    const platformOrgMap: Record<string, Set<string>> = {};
    const mcpOrgMap: Record<string, Set<string>> = {};
    let totalConnections = 0;

    for (const f of publishedFiles) {
      const fm = f.frontmatter as any;
      const platforms: string[] = (fm?.platforms && Array.isArray(fm.platforms)) ? fm.platforms : [];
      const mcpServers: string[] = (fm?.mcp_servers && Array.isArray(fm.mcp_servers)) ? fm.mcp_servers : [];
      nodePlatforms[f.id] = { platforms, mcpServers };

      for (const p of platforms) {
        const pLower = p.toLowerCase();
        if (!platformOrgMap[pLower]) platformOrgMap[pLower] = new Set();
        platformOrgMap[pLower].add(f.orgId);
        totalConnections++;
      }
      for (const m of mcpServers) {
        const mLower = m.toLowerCase();
        if (!mcpOrgMap[mLower]) mcpOrgMap[mLower] = new Set();
        mcpOrgMap[mLower].add(f.orgId);
        totalConnections++;
      }
    }

    const platformStats = [
      ...Object.entries(platformOrgMap)
        .map(([name, orgs]) => ({ name, type: 'platform' as const, orgCount: orgs.size })),
      ...Object.entries(mcpOrgMap)
        .map(([name, orgs]) => ({ name, type: 'mcp' as const, orgCount: orgs.size })),
    ].sort((a, b) => b.orgCount - a.orgCount);

    const platformStatsResponse = {
      platforms: platformStats,
      totalConnections,
      aiPlatformCount: Object.keys(platformOrgMap).length,
      mcpServerCount: Object.keys(mcpOrgMap).length,
    };

    return {
      nodes: graph.nodes,
      edges: graph.edges,
      claims: claimsMap,
      similarities: simRows,
      nodePlatforms,
      platformStats: platformStatsResponse,
      stats: {
        publishers: publishedFiles.length,
        totalClaims,
        connections: graph.edges.length,
        patterns: patternCount,
      },
    };
  });

  // GET /api/v1/graph/org/:orgId -- Subgraph for a single organization
  app.get<{ Params: { orgId: string } }>('/graph/org/:orgId', async (request) => {
    const { orgId } = request.params;
    const subgraph = await getOrgSubgraph(db, orgId);
    return subgraph;
  });

  // GET /api/v1/graph/conflicts -- Find all agent conflict protocols
  app.get<{ Querystring: { orgId?: string } }>('/graph/conflicts', async (request) => {
    const { orgId } = request.query;
    const conflicts = await findAgentConflicts(db, orgId);
    return {
      count: conflicts.length,
      conflicts,
    };
  });

  // GET /api/v1/graph/escalation/:nodeId -- Find escalation path from a node
  app.get<{ Params: { nodeId: string }; Querystring: { maxDepth?: string } }>(
    '/graph/escalation/:nodeId',
    async (request) => {
      const { nodeId } = request.params;
      const maxDepth = parseInt(request.query.maxDepth || '10', 10);
      const path = await findEscalationPath(db, nodeId, maxDepth);
      return path;
    }
  );

  // GET /api/v1/graph/compare -- Compare two organizations
  app.get<{ Querystring: { orgA: string; orgB: string } }>(
    '/graph/compare',
    async (request, reply) => {
      const { orgA, orgB } = request.query;
      if (!orgA || !orgB) {
        return reply.status(400).send({
          error: { code: 'MISSING_PARAMS', message: 'Both orgA and orgB query params required' },
        });
      }
      const comparison = await compareOrganizations(db, orgA, orgB);
      return comparison;
    }
  );

  // GET /api/v1/graph/patterns -- Extract coordination patterns across orgs
  app.get<{ Querystring: { minOrgs?: string } }>('/graph/patterns', async (request) => {
    const minOrgs = parseInt(request.query.minOrgs || '2', 10);
    const patterns = await extractCoordinationPatterns(db, minOrgs);
    return {
      count: patterns.length,
      minOrganizations: minOrgs,
      patterns,
    };
  });

  // GET /api/v1/graph/authority/:orgId -- Authority map for an organization
  app.get<{ Params: { orgId: string } }>('/graph/authority/:orgId', async (request) => {
    const { orgId } = request.params;
    const authority = await getAuthorityMap(db, orgId);
    return authority;
  });
}
