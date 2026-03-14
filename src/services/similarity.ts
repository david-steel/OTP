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

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(t => t.length > 2)
    .filter(t => !STOP_WORDS.has(t));
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
  // Combine rule + why + scope for comparison (not failure_mode -- too varied)
  const textA = `${claimA.rule} ${claimA.why} ${claimA.scope}`;
  const textB = `${claimB.rule} ${claimB.why} ${claimB.scope}`;

  const tokensA = tokenize(textA);
  const tokensB = tokenize(textB);

  const score = jaccardSimilarity(tokensA, tokensB);
  const sectionMatch = claimA.section === claimB.section;

  let classification: SimilarityClass;
  if (score >= 0.8) {
    classification = 'DUPLICATE';
  } else {
    classification = 'SIMILAR';
  }

  return { score, classification, sectionMatch };
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
  threshold: number = 0.3
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
