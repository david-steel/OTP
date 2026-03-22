import type { ParsedClaim } from '../shared/types.js';
import type { SimilarityClass } from '../shared/enums.js';

// Stop words to exclude from similarity comparison
const STOP_WORDS = new Set([
  'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in',
  'with', 'to', 'for', 'of', 'not', 'no', 'can', 'will', 'do', 'does',
  'should', 'must', 'this', 'that', 'it', 'its', 'are', 'was', 'were',
  'be', 'been', 'being', 'have', 'has', 'had', 'having', 'from', 'by',
  'all', 'each', 'every', 'any', 'if', 'when', 'than', 'then', 'into',
  'also', 'only', 'very', 'just', 'about', 'such', 'through', 'after',
  'before', 'between', 'both', 'same', 'other', 'more', 'most', 'some',
]);

// Concept synonyms: words that mean the same thing across domains.
// A consulting methodology uses different words than an agent army,
// but the concepts are the same. This maps domain-specific terms
// to shared concept tokens so Jaccard catches conceptual overlap.
const CONCEPT_GROUPS: Record<string, string> = {
  // Human oversight
  'human': 'human_review', 'review': 'human_review', 'approval': 'human_review',
  'approve': 'human_review', 'gate': 'human_review', 'oversight': 'human_review',
  'escalation': 'human_review', 'escalate': 'human_review', 'override': 'human_review',
  'manual': 'human_review', 'verify': 'human_review', 'validate': 'human_review',
  'validation': 'human_review', 'confirm': 'human_review', 'confirmation': 'human_review',

  // Authority / ownership
  'authority': 'authority_boundary', 'boundary': 'authority_boundary',
  'owner': 'authority_boundary', 'ownership': 'authority_boundary',
  'responsible': 'authority_boundary', 'responsibility': 'authority_boundary',
  'permission': 'authority_boundary', 'autonomous': 'authority_boundary',
  'autonomy': 'authority_boundary', 'scope': 'authority_boundary',

  // Shared state / coordination
  'shared': 'shared_state', 'state': 'shared_state', 'file': 'shared_state',
  'document': 'shared_state', 'prd': 'shared_state', 'living': 'shared_state',
  'source': 'shared_state', 'truth': 'shared_state', 'record': 'shared_state',
  'log': 'shared_state', 'audit': 'shared_state', 'trail': 'shared_state',

  // Iteration / feedback
  'iteration': 'iteration_loop', 'iterate': 'iteration_loop', 'loop': 'iteration_loop',
  'feedback': 'iteration_loop', 'cycle': 'iteration_loop', 'backtrack': 'iteration_loop',
  'backtracking': 'iteration_loop', 'discovery': 'iteration_loop',
  'refine': 'iteration_loop', 'refinement': 'iteration_loop',

  // AI generation
  'generate': 'ai_generates', 'generates': 'ai_generates', 'generated': 'ai_generates',
  'artifact': 'ai_generates', 'artifacts': 'ai_generates', 'output': 'ai_generates',
  'draft': 'ai_generates', 'drafts': 'ai_generates', 'produce': 'ai_generates',

  // Agent / system
  'agent': 'ai_system', 'agents': 'ai_system', 'system': 'ai_system',
  'bot': 'ai_system', 'automation': 'ai_system', 'automated': 'ai_system',

  // Failure / error
  'failure': 'failure_pattern', 'error': 'failure_pattern', 'fail': 'failure_pattern',
  'broke': 'failure_pattern', 'broken': 'failure_pattern', 'wrong': 'failure_pattern',
  'mistake': 'failure_pattern', 'risk': 'failure_pattern', 'corrupt': 'failure_pattern',
  'corruption': 'failure_pattern', 'conflict': 'failure_pattern',

  // One thing at a time
  'focus': 'single_focus', 'single': 'single_focus', 'one': 'single_focus',
  'bite': 'single_focus', 'slice': 'single_focus', 'stakeholder': 'single_focus',

  // Testing / validation
  'test': 'testing', 'testing': 'testing', 'hypothesis': 'testing',
  'criteria': 'testing', 'measure': 'testing', 'measurable': 'testing',
  'metric': 'testing', 'pass': 'testing',

  // External communication
  'email': 'external_comms', 'send': 'external_comms', 'publish': 'external_comms',
  'external': 'external_comms', 'communication': 'external_comms',
  'client': 'external_comms', 'customer': 'external_comms',
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(t => t.length > 2)
    .filter(t => !STOP_WORDS.has(t));
}

// Expand tokens with concept synonyms. Original tokens are kept,
// and concept tokens are added so claims that use different words
// for the same idea get credit for the overlap.
function expandWithConcepts(tokens: string[]): string[] {
  const expanded = [...tokens];
  const conceptsAdded = new Set<string>();
  for (const token of tokens) {
    const concept = CONCEPT_GROUPS[token];
    if (concept && !conceptsAdded.has(concept)) {
      expanded.push('__' + concept); // prefix to avoid collision with real words
      conceptsAdded.add(concept);
    }
  }
  return expanded;
}

export function jaccardSimilarity(tokensA: string[], tokensB: string[]): number {
  if (tokensA.length === 0 && tokensB.length === 0) return 0;

  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);

  return intersection.size / union.size;
}

export function computeClaimSimilarity(
  claimA: ParsedClaim,
  claimB: ParsedClaim
): { score: number; classification: SimilarityClass; sectionMatch: boolean } {
  // Combine rule + why + scope for comparison (not failure_mode, too varied)
  const textA = `${claimA.rule} ${claimA.why} ${claimA.scope}`;
  const textB = `${claimB.rule} ${claimB.why} ${claimB.scope}`;

  const rawTokensA = tokenize(textA);
  const rawTokensB = tokenize(textB);
  const tokensA = expandWithConcepts(rawTokensA);
  const tokensB = expandWithConcepts(rawTokensB);

  // Word-level Jaccard
  const wordScore = jaccardSimilarity(tokensA, tokensB);

  // Concept-level overlap: how many concept groups do both claims touch?
  const conceptsA = new Set<string>();
  const conceptsB = new Set<string>();
  for (const t of rawTokensA) { const c = CONCEPT_GROUPS[t]; if (c) conceptsA.add(c); }
  for (const t of rawTokensB) { const c = CONCEPT_GROUPS[t]; if (c) conceptsB.add(c); }
  const sharedConcepts = [...conceptsA].filter(c => conceptsB.has(c));
  const conceptScore = conceptsA.size > 0 && conceptsB.size > 0
    ? sharedConcepts.length / Math.max(conceptsA.size, conceptsB.size)
    : 0;

  // Blend: 60% word overlap + 40% concept overlap
  const score = wordScore * 0.6 + conceptScore * 0.4;

  // Cross-section mapping: some sections are conceptually equivalent
  const sectionMap: Record<string, string> = {
    'core_operating_rules': 'core',
    'agent_roles_and_authority': 'authority',
    'coordination_patterns': 'coordination',
    'operational_heuristics': 'heuristics',
    'failure_patterns': 'failure',
    'human_ai_boundary_conditions': 'boundary',
    'value_chain_stages': 'core',
    'stage_handoffs': 'coordination',
  };
  const sectionA = sectionMap[claimA.section] || claimA.section;
  const sectionB = sectionMap[claimB.section] || claimB.section;
  const sectionMatch = sectionA === sectionB;

  // Boost score slightly for section match
  const adjustedScore = sectionMatch ? Math.min(score * 1.15, 1.0) : score;

  let classification: SimilarityClass;
  if (adjustedScore >= 0.7) {
    classification = 'DUPLICATE';
  } else {
    classification = 'SIMILAR';
  }

  return { score: adjustedScore, classification, sectionMatch };
}

export interface SimilarityPair {
  claimAId: string;
  claimBId: string;
  oosAId: string;
  oosBId: string;
  score: number;
  classification: SimilarityClass;
  sectionMatch: boolean;
}

export function computeAllSimilarities(
  newClaims: Array<ParsedClaim & { dbId: string }>,
  newOosId: string,
  existingClaims: Array<ParsedClaim & { dbId: string; oosFileId: string }>,
  threshold: number = 0.12
): SimilarityPair[] {
  const pairs: SimilarityPair[] = [];

  for (const newClaim of newClaims) {
    for (const existingClaim of existingClaims) {
      // Skip claims from the same OOS file
      if (existingClaim.oosFileId === newOosId) continue;

      const { score, classification, sectionMatch } = computeClaimSimilarity(newClaim, existingClaim);

      if (score >= threshold) {
        pairs.push({
          claimAId: newClaim.dbId,
          claimBId: existingClaim.dbId,
          oosAId: newOosId,
          oosBId: existingClaim.oosFileId,
          score,
          classification,
          sectionMatch,
        });
      }
    }
  }

  return pairs;
}
