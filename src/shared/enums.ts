// Core protocol enums -- these match the OOS Schema Draft exactly

export const CONFIDENCE_LEVELS = ['HIGH', 'MEDIUM', 'LOW'] as const;
export type Confidence = (typeof CONFIDENCE_LEVELS)[number];

export const EVIDENCE_TYPES = [
  'HUMAN_DEFINED_RULE',
  'OBSERVED_ONCE',
  'OBSERVED_REPEATEDLY',
  'MEASURED_RESULT',
  'INFERENCE',
  'SPECULATION',
] as const;
export type EvidenceType = (typeof EVIDENCE_TYPES)[number];

export const TEMPLATE_TYPES = ['agent_army', 'value_chain', 'org_chart'] as const;
export type TemplateType = (typeof TEMPLATE_TYPES)[number];

export const ORG_SIZES = ['solo', 'small', 'medium', 'large', 'enterprise'] as const;
export type OrgSize = (typeof ORG_SIZES)[number];

export const VISIBILITY_LEVELS = ['free', 'paid', 'premium'] as const;
export type Visibility = (typeof VISIBILITY_LEVELS)[number];

export const BADGE_TYPES = ['founding', 'early'] as const;
export type BadgeType = (typeof BADGE_TYPES)[number];

export const QUALITY_TIERS = ['platinum', 'gold', 'silver', 'bronze'] as const;
export type QualityTier = (typeof QUALITY_TIERS)[number];

export const SIMILARITY_CLASSES = ['SIMILAR', 'DUPLICATE'] as const;
export type SimilarityClass = (typeof SIMILARITY_CLASSES)[number];

export const ACTOR_TYPES = ['user', 'system', 'agent'] as const;
export type ActorType = (typeof ACTOR_TYPES)[number];

// Evidence strength ordering (for quality scoring)
export const EVIDENCE_STRENGTH: Record<EvidenceType, number> = {
  MEASURED_RESULT: 6,
  OBSERVED_REPEATEDLY: 5,
  OBSERVED_ONCE: 4,
  HUMAN_DEFINED_RULE: 3,
  INFERENCE: 2,
  SPECULATION: 1,
};

// Agentic Level labels (Bassim Eledath's 8 Levels of Agentic Engineering)
export const AGENTIC_LEVEL_LABELS: Record<number, string> = {
  1: 'Tab Complete',
  2: 'Agent IDE',
  3: 'Context Engineering',
  4: 'Compounding Engineering',
  5: 'MCP & Skills',
  6: 'Harness Engineering',
  7: 'Background Agents',
  8: 'Autonomous Agent Teams',
};
