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

  // GET /api/v1/graph -- Full Intelligence Graph (nodes + edges for visualization)
  app.get('/graph', async (request, reply) => {
    const publishedFiles = await db.select({
      id: oosFiles.id,
      orgName: organizations.name,
      template: oosFiles.template,
      industry: organizations.industry,
      claimCount: oosFiles.claimCount,
      qualityTier: organizations.qualityTier,
      badge: organizations.badge,
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

    const graph = buildGraph(publishedFiles, simRows);
    return graph;
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
