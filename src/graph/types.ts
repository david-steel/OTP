// Organizational Intelligence Graph -- Type Definitions
// The graph is stored in PostgreSQL (Phase 1-3) and computed from
// OOS entities + claims + similarity data. No separate graph DB.

// ---- Node Types ----

export const NODE_TYPES = [
  'agent',
  'human',
  'role',
  'system',
  'task',
  'process',
  'decision',
  'knowledge_claim',
  'organization',
] as const;

export type NodeType = (typeof NODE_TYPES)[number];

export interface GraphNode {
  id: string;
  type: NodeType;
  label: string;
  properties: Record<string, unknown>;
  oosFileId: string;
  orgId: string;
}

// ---- Edge Types ----

export const EDGE_TYPES = [
  'delegates_to',
  'depends_on',
  'conflicts_with',
  'overrides',
  'escalates_to',
  'part_of',
  'learns_from',
  'similar_to',
  'hands_off_to',
  'approves',
  'accesses',
  'produces',
  'consumes',
] as const;

export type EdgeType = (typeof EDGE_TYPES)[number];

export interface GraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
  type: EdgeType;
  properties: Record<string, unknown>;
  oosFileId: string;
  weight: number;
}

// ---- Query Types ----

export interface GraphQuery {
  startNodeId?: string;
  startNodeType?: NodeType;
  edgeType?: EdgeType;
  targetNodeType?: NodeType;
  maxDepth?: number;
  orgId?: string;
  crossOrg?: boolean;
}

export interface GraphPath {
  nodes: GraphNode[];
  edges: GraphEdge[];
  depth: number;
}

export interface ConflictResult {
  agentA: GraphNode;
  agentB: GraphNode;
  conflictEdge: GraphEdge;
  resolution: string | null;
  winner: string | null;
  relatedClaims: GraphNode[];
}

export interface EscalationPath {
  levels: Array<{
    level: number;
    handler: GraphNode;
    trigger: string;
    responseTime: string | null;
  }>;
  terminalAuthority: GraphNode;
}

export interface CoordinationPattern {
  patternId: string;
  name: string;
  description: string;
  frequency: number;
  organizations: string[];
  representativeNodes: GraphNode[];
  representativeEdges: GraphEdge[];
  confidence: number;
}

export interface OrgComparison {
  orgA: { id: string; name: string; nodeCount: number; edgeCount: number };
  orgB: { id: string; name: string; nodeCount: number; edgeCount: number };
  sharedPatterns: CoordinationPattern[];
  uniqueToA: GraphNode[];
  uniqueToB: GraphNode[];
  structuralSimilarity: number;
  recommendations: string[];
}
