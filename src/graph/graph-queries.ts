// Graph Query Engine -- PostgreSQL-based queries against the Intelligence Graph
// All queries use SQL. No graph database dependency.
// In Phase 4+, these could be migrated to Cypher/Gremlin if a graph DB is adopted.

import { sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type {
  ConflictResult,
  EscalationPath,
  CoordinationPattern,
  OrgComparison,
  GraphNode,
  GraphEdge,
  GraphPath,
  NodeType,
  EdgeType,
} from './types.js';

type DB = NodePgDatabase<any>;

// ---- Query 1: Find Agent Conflicts ----
// Returns all conflict_with edges within an org or across all orgs

export async function findAgentConflicts(
  db: DB,
  orgId?: string
): Promise<ConflictResult[]> {
  const orgFilter = orgId
    ? sql`AND gn_a.org_id = ${orgId}`
    : sql``;

  const rows = await db.execute(sql`
    SELECT
      gn_a.id AS agent_a_id,
      gn_a.label AS agent_a_name,
      gn_a.properties AS agent_a_props,
      gn_b.id AS agent_b_id,
      gn_b.label AS agent_b_name,
      gn_b.properties AS agent_b_props,
      ge.id AS edge_id,
      ge.properties AS edge_props,
      ge.weight,
      o.name AS org_name
    FROM graph_edges ge
    JOIN graph_nodes gn_a ON ge.source_id = gn_a.id
    JOIN graph_nodes gn_b ON ge.target_id = gn_b.id
    JOIN oos_files f ON ge.oos_file_id = f.id
    JOIN organizations o ON f.org_id = o.id
    WHERE ge.type = 'conflicts_with'
      AND f.status = 'published'
      ${orgFilter}
    ORDER BY ge.weight DESC
  `);

  return (rows.rows || []).map((row: any) => ({
    agentA: {
      id: row.agent_a_id,
      type: 'agent' as NodeType,
      label: row.agent_a_name,
      properties: row.agent_a_props,
      oosFileId: '',
      orgId: '',
    },
    agentB: {
      id: row.agent_b_id,
      type: 'agent' as NodeType,
      label: row.agent_b_name,
      properties: row.agent_b_props,
      oosFileId: '',
      orgId: '',
    },
    conflictEdge: {
      id: row.edge_id,
      sourceId: row.agent_a_id,
      targetId: row.agent_b_id,
      type: 'conflicts_with' as EdgeType,
      properties: row.edge_props,
      oosFileId: '',
      weight: row.weight,
    },
    resolution: row.edge_props?.resolution || null,
    winner: row.edge_props?.winner || null,
    relatedClaims: [],
  }));
}

// ---- Query 2: Find Escalation Paths ----
// Traces the escalation chain from a starting agent to the terminal authority

export async function findEscalationPath(
  db: DB,
  startNodeId: string,
  maxDepth: number = 10
): Promise<EscalationPath> {
  // Recursive CTE to follow escalates_to edges
  const rows = await db.execute(sql`
    WITH RECURSIVE escalation_chain AS (
      -- Base case: starting node
      SELECT
        gn.id,
        gn.label,
        gn.type,
        gn.properties,
        1 AS depth,
        ARRAY[gn.id] AS path
      FROM graph_nodes gn
      WHERE gn.id = ${startNodeId}

      UNION ALL

      -- Recursive case: follow escalates_to edges
      SELECT
        target.id,
        target.label,
        target.type,
        target.properties,
        ec.depth + 1,
        ec.path || target.id
      FROM escalation_chain ec
      JOIN graph_edges ge ON ge.source_id = ec.id AND ge.type = 'escalates_to'
      JOIN graph_nodes target ON ge.target_id = target.id
      WHERE ec.depth < ${maxDepth}
        AND NOT target.id = ANY(ec.path)  -- prevent cycles
    )
    SELECT id, label, type, properties, depth
    FROM escalation_chain
    ORDER BY depth ASC
  `);

  const levels = (rows.rows || []).map((row: any, index: number) => ({
    level: index + 1,
    handler: {
      id: row.id,
      type: row.type as NodeType,
      label: row.label,
      properties: row.properties,
      oosFileId: '',
      orgId: '',
    },
    trigger: index === 0 ? 'Starting point' : `Escalated from level ${index}`,
    responseTime: row.properties?.responseTime || null,
  }));

  return {
    levels,
    terminalAuthority: levels.length > 0 ? levels[levels.length - 1].handler : null as any,
  };
}

// ---- Query 3: Compare Two Organizations ----
// Structural comparison of two org's graph topology

export async function compareOrganizations(
  db: DB,
  orgAId: string,
  orgBId: string
): Promise<OrgComparison> {
  // Get node counts and types for both orgs
  const [nodesA, nodesB, edgesA, edgesB, crossEdges] = await Promise.all([
    db.execute(sql`
      SELECT type, label, properties, id
      FROM graph_nodes WHERE org_id = ${orgAId}
      ORDER BY type, label
    `),
    db.execute(sql`
      SELECT type, label, properties, id
      FROM graph_nodes WHERE org_id = ${orgBId}
      ORDER BY type, label
    `),
    db.execute(sql`
      SELECT ge.type, COUNT(*) as count
      FROM graph_edges ge
      JOIN graph_nodes gn ON ge.source_id = gn.id
      WHERE gn.org_id = ${orgAId}
      GROUP BY ge.type
    `),
    db.execute(sql`
      SELECT ge.type, COUNT(*) as count
      FROM graph_edges ge
      JOIN graph_nodes gn ON ge.source_id = gn.id
      WHERE gn.org_id = ${orgBId}
      GROUP BY ge.type
    `),
    // Cross-org similarity edges
    db.execute(sql`
      SELECT
        coe.similarity_score,
        sn.label AS source_label, sn.type AS source_type,
        tn.label AS target_label, tn.type AS target_type,
        coe.properties
      FROM cross_org_edges coe
      JOIN graph_nodes sn ON coe.source_node_id = sn.id
      JOIN graph_nodes tn ON coe.target_node_id = tn.id
      WHERE (coe.source_org_id = ${orgAId} AND coe.target_org_id = ${orgBId})
         OR (coe.source_org_id = ${orgBId} AND coe.target_org_id = ${orgAId})
      ORDER BY coe.similarity_score DESC
      LIMIT 20
    `),
  ]);

  // Compute structural similarity
  const nodeTypesA = new Set((nodesA.rows || []).map((r: any) => `${r.type}:${r.properties?.authorityLevel || 'unknown'}`));
  const nodeTypesB = new Set((nodesB.rows || []).map((r: any) => `${r.type}:${r.properties?.authorityLevel || 'unknown'}`));

  const intersection = [...nodeTypesA].filter(t => nodeTypesB.has(t)).length;
  const union = new Set([...nodeTypesA, ...nodeTypesB]).size;
  const structuralSimilarity = union > 0 ? intersection / union : 0;

  // Find unique nodes (by type -- nodes that exist in A but not B, and vice versa)
  const typesInA = new Set((nodesA.rows || []).map((r: any) => r.type));
  const typesInB = new Set((nodesB.rows || []).map((r: any) => r.type));

  const uniqueToA = (nodesA.rows || [])
    .filter((r: any) => !typesInB.has(r.type))
    .map(rowToNode);

  const uniqueToB = (nodesB.rows || [])
    .filter((r: any) => !typesInA.has(r.type))
    .map(rowToNode);

  // Generate recommendations
  const recommendations: string[] = [];

  // Check for missing edge types
  const edgeTypesA = new Set((edgesA.rows || []).map((r: any) => r.type));
  const edgeTypesB = new Set((edgesB.rows || []).map((r: any) => r.type));

  if (edgeTypesA.has('conflicts_with') && !edgeTypesB.has('conflicts_with')) {
    recommendations.push('Organization B has no documented conflict protocols. Consider reviewing Organization A\'s conflict patterns.');
  }
  if (edgeTypesB.has('conflicts_with') && !edgeTypesA.has('conflicts_with')) {
    recommendations.push('Organization A has no documented conflict protocols. Consider reviewing Organization B\'s conflict patterns.');
  }
  if (!edgeTypesA.has('escalates_to')) {
    recommendations.push('Organization A has no escalation paths defined. This may indicate flat authority structure or missing documentation.');
  }
  if (!edgeTypesB.has('escalates_to')) {
    recommendations.push('Organization B has no escalation paths defined.');
  }

  const agentCountA = (nodesA.rows || []).filter((r: any) => r.type === 'agent').length;
  const agentCountB = (nodesB.rows || []).filter((r: any) => r.type === 'agent').length;

  if (agentCountA > agentCountB * 2) {
    recommendations.push(`Organization A has ${agentCountA} agents vs B's ${agentCountB}. Larger teams typically need more explicit coordination protocols.`);
  }

  return {
    orgA: {
      id: orgAId,
      name: 'Organization A',
      nodeCount: (nodesA.rows || []).length,
      edgeCount: (edgesA.rows || []).reduce((sum: number, r: any) => sum + parseInt(r.count), 0),
    },
    orgB: {
      id: orgBId,
      name: 'Organization B',
      nodeCount: (nodesB.rows || []).length,
      edgeCount: (edgesB.rows || []).reduce((sum: number, r: any) => sum + parseInt(r.count), 0),
    },
    sharedPatterns: [],
    uniqueToA,
    uniqueToB,
    structuralSimilarity,
    recommendations,
  };
}

// ---- Query 4: Extract Coordination Patterns ----
// Finds recurring structural patterns across multiple organizations

export async function extractCoordinationPatterns(
  db: DB,
  minOrgCount: number = 2
): Promise<CoordinationPattern[]> {
  // Query the materialized view
  const rows = await db.execute(sql`
    SELECT
      edge_type,
      source_type,
      target_type,
      source_authority,
      org_count,
      instance_count,
      industries
    FROM coordination_patterns
    WHERE org_count >= ${minOrgCount}
    ORDER BY org_count DESC, instance_count DESC
    LIMIT 50
  `);

  return (rows.rows || []).map((row: any, index: number) => {
    const name = generatePatternName(row.edge_type, row.source_type, row.target_type);
    const description = generatePatternDescription(
      row.edge_type, row.source_type, row.target_type,
      row.source_authority, row.org_count
    );

    return {
      patternId: `PAT-${String(index + 1).padStart(3, '0')}`,
      name,
      description,
      frequency: row.org_count,
      organizations: [], // privacy: don't expose org IDs
      representativeNodes: [],
      representativeEdges: [],
      confidence: Math.min(row.org_count / 10, 1), // scales 0-1, 10+ orgs = 1.0
    };
  });
}

// ---- Query 5: Subgraph for a Single Organization ----
// Returns complete graph for one org (for visualization)

export async function getOrgSubgraph(
  db: DB,
  orgId: string
): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }> {
  const [nodeRows, edgeRows] = await Promise.all([
    db.execute(sql`
      SELECT id, external_id, type, label, properties, oos_file_id, org_id
      FROM graph_nodes WHERE org_id = ${orgId}
      ORDER BY type, label
    `),
    db.execute(sql`
      SELECT ge.id, ge.source_id, ge.target_id, ge.type, ge.properties, ge.oos_file_id, ge.weight
      FROM graph_edges ge
      JOIN graph_nodes gn ON ge.source_id = gn.id
      WHERE gn.org_id = ${orgId}
      ORDER BY ge.type
    `),
  ]);

  const nodes = (nodeRows.rows || []).map(rowToNode);
  const edges = (edgeRows.rows || []).map(rowToEdge);

  return { nodes, edges };
}

// ---- Query 6: Find All Paths Between Two Nodes ----
// BFS traversal up to maxDepth

export async function findPaths(
  db: DB,
  sourceId: string,
  targetId: string,
  maxDepth: number = 5
): Promise<GraphPath[]> {
  const rows = await db.execute(sql`
    WITH RECURSIVE paths AS (
      SELECT
        ge.target_id AS current_node,
        ARRAY[ge.source_id, ge.target_id] AS node_path,
        ARRAY[ge.id] AS edge_path,
        1 AS depth
      FROM graph_edges ge
      WHERE ge.source_id = ${sourceId}

      UNION ALL

      SELECT
        ge.target_id,
        p.node_path || ge.target_id,
        p.edge_path || ge.id,
        p.depth + 1
      FROM paths p
      JOIN graph_edges ge ON ge.source_id = p.current_node
      WHERE p.depth < ${maxDepth}
        AND NOT ge.target_id = ANY(p.node_path)
    )
    SELECT node_path, edge_path, depth
    FROM paths
    WHERE current_node = ${targetId}
    ORDER BY depth ASC
    LIMIT 10
  `);

  return (rows.rows || []).map((row: any) => ({
    nodes: [], // Would need to fetch full node data
    edges: [], // Would need to fetch full edge data
    depth: row.depth,
  }));
}

// ---- Query 7: Agent Authority Map ----
// Returns who delegates to whom, who overrides whom, who escalates to whom

export async function getAuthorityMap(
  db: DB,
  orgId: string
): Promise<{
  delegations: GraphEdge[];
  overrides: GraphEdge[];
  escalations: GraphEdge[];
  approvals: GraphEdge[];
}> {
  const rows = await db.execute(sql`
    SELECT
      ge.id, ge.source_id, ge.target_id, ge.type, ge.properties, ge.weight, ge.oos_file_id,
      sn.label AS source_label, sn.type AS source_type,
      tn.label AS target_label, tn.type AS target_type
    FROM graph_edges ge
    JOIN graph_nodes sn ON ge.source_id = sn.id
    JOIN graph_nodes tn ON ge.target_id = tn.id
    WHERE sn.org_id = ${orgId}
      AND ge.type IN ('delegates_to', 'overrides', 'escalates_to', 'approves')
    ORDER BY ge.type, ge.weight DESC
  `);

  const allEdges = (rows.rows || []).map((row: any) => ({
    ...rowToEdge(row),
    _sourceLabel: row.source_label,
    _targetLabel: row.target_label,
  }));

  return {
    delegations: allEdges.filter(e => e.type === 'delegates_to'),
    overrides: allEdges.filter(e => e.type === 'overrides'),
    escalations: allEdges.filter(e => e.type === 'escalates_to'),
    approvals: allEdges.filter(e => e.type === 'approves'),
  };
}

// ---- Helper Functions ----

function rowToNode(row: any): GraphNode {
  return {
    id: row.id,
    type: row.type as NodeType,
    label: row.label,
    properties: row.properties || {},
    oosFileId: row.oos_file_id || '',
    orgId: row.org_id || '',
  };
}

function rowToEdge(row: any): GraphEdge {
  return {
    id: row.id,
    sourceId: row.source_id,
    targetId: row.target_id,
    type: row.type as EdgeType,
    properties: row.properties || {},
    oosFileId: row.oos_file_id || '',
    weight: row.weight || 1,
  };
}

function generatePatternName(edgeType: string, sourceType: string, targetType: string): string {
  const patterns: Record<string, string> = {
    'escalates_to:agent:human': 'Agent-to-Human Escalation',
    'escalates_to:agent:agent': 'Agent-to-Agent Escalation',
    'overrides:human:agent': 'Human Override of Agent',
    'overrides:agent:agent': 'Agent Override Pattern',
    'conflicts_with:agent:agent': 'Agent Conflict Protocol',
    'delegates_to:human:agent': 'Human-to-Agent Delegation',
    'delegates_to:agent:agent': 'Agent-to-Agent Delegation',
    'depends_on:agent:system': 'Agent-System Dependency',
    'hands_off_to:agent:agent': 'Agent Handoff Pattern',
    'accesses:agent:system': 'Agent System Access',
  };

  return patterns[`${edgeType}:${sourceType}:${targetType}`]
    || `${sourceType} ${edgeType.replace(/_/g, ' ')} ${targetType}`;
}

function generatePatternDescription(
  edgeType: string, sourceType: string, targetType: string,
  sourceAuthority: string | null, orgCount: number
): string {
  const base = generatePatternName(edgeType, sourceType, targetType);
  const authorityNote = sourceAuthority ? ` (${sourceAuthority} authority)` : '';
  return `${base}${authorityNote} -- observed across ${orgCount} organization${orgCount > 1 ? 's' : ''}`;
}
