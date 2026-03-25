import { z } from 'zod';
import { CONFIDENCE_LEVELS, EVIDENCE_TYPES, TEMPLATE_TYPES, ORG_SIZES, VISIBILITY_LEVELS } from './enums.js';

// ---- API Input Schemas ----

export const createOrgSchema = z.object({
  name: z.string().min(1).max(255),
  industry: z.string().min(1).max(255),
  size: z.enum(ORG_SIZES),
});

export const createOOSSchema = z.object({
  template: z.enum(TEMPLATE_TYPES),
  rawContent: z.string().min(100),
});

export const updateOOSSchema = z.object({
  rawContent: z.string().min(100),
});

export const renameOOSSchema = z.object({
  name: z.string().min(1).max(255),
});

export const searchQuerySchema = z.object({
  q: z.string().min(1).max(500),
  template: z.enum(TEMPLATE_TYPES).optional(),
  industry: z.string().optional(),
  size: z.enum(ORG_SIZES).optional(),
  confidence: z.enum(CONFIDENCE_LEVELS).optional(),
  evidence: z.enum(EVIDENCE_TYPES).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const browseQuerySchema = z.object({
  template: z.enum(TEMPLATE_TYPES).optional(),
  industry: z.string().optional(),
  size: z.enum(ORG_SIZES).optional(),
  sort: z.enum(['newest', 'claims', 'quality']).default('newest'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// ---- OOS Frontmatter Schema ----

export const oosFrontmatterSchema = z.object({
  oos_version: z.string().regex(/^\d+\.\d+$/),
  org_id: z.string().uuid().optional(),
  org_pseudonym: z.string().min(1),
  industry: z.string().min(1),
  org_size: z.enum(ORG_SIZES),
  template: z.enum(TEMPLATE_TYPES),
  agent_count: z.number().int().positive(),
  platforms: z.array(z.string()).min(1),
  generated_at: z.string().refine((val) => !isNaN(new Date(val).getTime()), { message: 'Invalid date. Use ISO 8601 format (e.g. 2026-03-16T12:00:00Z)' }),
  version: z.number().int().positive(),
  parent_version: z.number().int().positive().nullable(),
  word_count: z.number().int().min(0),
  claim_count: z.number().int().min(0),
  confidence_distribution: z.object({
    high: z.number().int().min(0),
    medium: z.number().int().min(0),
    low: z.number().int().min(0),
  }),
  evidence_distribution: z.record(z.string(), z.number().int().min(0)),
});

// ---- Claim Schema ----

export const claimSchema = z.object({
  claimId: z.string().regex(/^C\d+$/),
  section: z.string().min(1),
  displayOrder: z.number().int().min(0),
  rule: z.string().min(1),
  why: z.string().min(1),
  failureMode: z.string().min(1),
  confidence: z.enum(CONFIDENCE_LEVELS),
  evidence: z.enum(EVIDENCE_TYPES),
  scope: z.string().min(1),
});

// ---- Template Section Definitions ----

export const UNIVERSAL_SECTIONS = [
  'purpose',
  'prime_directives',
  'system_identity',
  'core_operating_rules',
  'failure_patterns',
  'human_ai_boundary_conditions',
  'confidence_map',
  'merge_protocol',
  'update_protocol',
  'summary',
] as const;

export const AGENT_ARMY_SECTIONS = [
  'agent_roles_and_authority',
  'coordination_patterns',
  'operational_heuristics',
] as const;

export const VALUE_CHAIN_SECTIONS = [
  'value_chain_stages',
  'stage_handoffs',
  'operational_heuristics',
] as const;

export const ORG_CHART_SECTIONS = [
  'department_ai_capabilities',
  'cross_department_interfaces',
  'operational_heuristics',
] as const;

// Sections that allow claims (not prose-only)
export const CLAIM_SECTIONS = [
  'core_operating_rules',
  'failure_patterns',
  'human_ai_boundary_conditions',
  'agent_roles_and_authority',
  'coordination_patterns',
  'operational_heuristics',
  'value_chain_stages',
  'stage_handoffs',
  'department_ai_capabilities',
  'cross_department_interfaces',
] as const;

// Max claims per section
export const SECTION_CLAIM_LIMITS: Record<string, number> = {
  core_operating_rules: 10,
  failure_patterns: 10,
  human_ai_boundary_conditions: 5,
  agent_roles_and_authority: 15,
  coordination_patterns: 10,
  operational_heuristics: 15,
  value_chain_stages: 15,
  stage_handoffs: 10,
  department_ai_capabilities: 15,
  cross_department_interfaces: 10,
};
