import type { GraphData, GraphNode, GraphEdge } from '../shared/types.js';

// Graph builder computes the Intelligence Graph from database data
// In Phase 1, this is called on demand (GET /api/v1/graph)
// In Phase 2+, this may be pre-computed and cached

interface OOSRecord {
  id: string;
  orgId: string;
  orgName: string;
  template: string;
  industry: string;
  claimCount: number;
  qualityTier: string | null;
  badge: string | null;
}

interface SimilarityRecord {
  oosAId: string;
  oosBId: string;
  claimARule: string;
  claimBRule: string;
  score: number;
}

export function buildGraph(
  oosFiles: OOSRecord[],
  similarities: SimilarityRecord[]
): GraphData {
  // Nodes: one per published OOS file
  const nodes: GraphNode[] = oosFiles.map(oos => ({
    id: oos.id,
    orgId: oos.orgId,
    orgName: oos.orgName,
    template: oos.template as GraphNode['template'],
    industry: oos.industry,
    claimCount: oos.claimCount,
    qualityTier: oos.qualityTier as GraphNode['qualityTier'],
    badge: oos.badge as GraphNode['badge'],
  }));

  // Edges: aggregate similarities between OOS file pairs
  const edgeMap = new Map<string, {
    source: string;
    target: string;
    pairs: Array<{ claimA: string; claimB: string; score: number }>;
  }>();

  for (const sim of similarities) {
    // Create consistent edge key (alphabetical order to avoid duplicates)
    const key = [sim.oosAId, sim.oosBId].sort().join(':');

    if (!edgeMap.has(key)) {
      edgeMap.set(key, {
        source: sim.oosAId,
        target: sim.oosBId,
        pairs: [],
      });
    }

    edgeMap.get(key)!.pairs.push({
      claimA: sim.claimARule,
      claimB: sim.claimBRule,
      score: sim.score,
    });
  }

  // Convert to edges, filtering for minimum 1 similar claim
  const edges: GraphEdge[] = [];
  for (const [, edge] of edgeMap) {
    if (edge.pairs.length < 1) continue;

    // Sort pairs by score descending, take top 3 for tooltip
    const sortedPairs = edge.pairs.sort((a, b) => b.score - a.score);

    edges.push({
      source: edge.source,
      target: edge.target,
      weight: edge.pairs.length,
      topClaims: sortedPairs.slice(0, 3),
    });
  }

  return { nodes, edges };
}
