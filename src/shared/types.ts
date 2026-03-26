import type { Confidence, EvidenceType, TemplateType, OrgSize, Visibility, QualityTier, BadgeType } from './enums.js';

// ---- Protocol Types (match OOS Schema Draft) ----

export interface OOSFrontmatter {
  oos_version: string;
  org_id?: string;
  org_pseudonym: string;
  industry: string;
  org_size: OrgSize;
  template: TemplateType;
  agent_count: number;
  platforms: string[];
  mcp_servers?: string[];
  generated_at: string;
  version: number;
  parent_version: number | null;
  word_count: number;
  claim_count: number;
  confidence_distribution: {
    high: number;
    medium: number;
    low: number;
  };
  evidence_distribution: Record<string, number>;
}

export interface ParsedClaim {
  claimId: string;
  section: string;
  displayOrder: number;
  rule: string;
  why: string;
  failureMode: string;
  confidence: Confidence;
  evidence: EvidenceType;
  scope: string;
  tokenCost?: number;
}

export interface ParseResult {
  frontmatter: OOSFrontmatter;
  claims: ParsedClaim[];
  wordCount: number;
  errors: ValidationError[];
}

// ---- Validation Types ----

export interface ValidationError {
  code: string;
  field: string;
  message: string;
  value?: unknown;
  expected?: unknown;
}

export interface ValidationWarning {
  code: string;
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

// ---- PII Types ----

export interface PIIFlag {
  type: 'email' | 'phone' | 'name' | 'company' | 'pricing' | 'url' | 'account_id';
  text: string;
  location: string;
  confidence: number;
  suggestion: string;
}

export interface PIIScanResult {
  clean: boolean;
  flags: PIIFlag[];
}

// ---- Diff Types ----

export type DiffClassification = 'UNIQUE_TO_A' | 'UNIQUE_TO_B' | 'SIMILAR' | 'DUPLICATE';

export interface DiffClaim {
  classification: DiffClassification;
  claimA: ParsedClaim | null;
  claimB: ParsedClaim | null;
  similarityScore: number | null;
  sectionMatch: boolean;
}

export interface DiffResult {
  oosA: { id: string; orgName: string; claimCount: number };
  oosB: { id: string; orgName: string; claimCount: number };
  summary: {
    uniqueToA: number;
    uniqueToB: number;
    similar: number;
    duplicate: number;
  };
  claims: DiffClaim[];
}

// ---- Graph Types ----

export interface GraphNode {
  id: string;
  orgId: string;
  orgName: string;
  template: TemplateType;
  industry: string;
  claimCount: number;
  qualityTier: QualityTier | null;
  badge: BadgeType | null;
}

export interface GraphEdge {
  source: string;
  target: string;
  weight: number;
  topClaims: Array<{
    claimA: string;
    claimB: string;
    score: number;
  }>;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// ---- API Response Types ----

export interface APIError {
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; issue: string; value?: unknown; expected?: unknown }>;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
