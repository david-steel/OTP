import type { ParsedClaim, DiffResult, DiffClaim } from '../shared/types.js';
import { computeClaimSimilarity } from './similarity.js';

interface OOSSummary {
  id: string;
  orgName: string;
  claims: ParsedClaim[];
}

export function computeDiff(oosA: OOSSummary, oosB: OOSSummary): DiffResult {
  const matched = new Set<string>(); // Track matched claims from both sides
  const diffClaims: DiffClaim[] = [];

  // For each claim in A, find best match in B
  const aMatches = new Map<string, { bClaimId: string; score: number; sectionMatch: boolean }>();
  const bMatches = new Map<string, { aClaimId: string; score: number; sectionMatch: boolean }>();

  for (const claimA of oosA.claims) {
    let bestMatch: { claim: ParsedClaim; score: number; sectionMatch: boolean } | null = null;

    for (const claimB of oosB.claims) {
      const { score, sectionMatch } = computeClaimSimilarity(claimA, claimB);

      if (score >= 0.3 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { claim: claimB, score, sectionMatch };
      }
    }

    if (bestMatch) {
      aMatches.set(claimA.claimId, {
        bClaimId: bestMatch.claim.claimId,
        score: bestMatch.score,
        sectionMatch: bestMatch.sectionMatch,
      });
    }
  }

  // Reverse: for each claim in B, find best match in A
  for (const claimB of oosB.claims) {
    let bestMatch: { claim: ParsedClaim; score: number; sectionMatch: boolean } | null = null;

    for (const claimA of oosA.claims) {
      const { score, sectionMatch } = computeClaimSimilarity(claimB, claimA);

      if (score >= 0.3 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { claim: claimA, score, sectionMatch };
      }
    }

    if (bestMatch) {
      bMatches.set(claimB.claimId, {
        aClaimId: bestMatch.claim.claimId,
        score: bestMatch.score,
        sectionMatch: bestMatch.sectionMatch,
      });
    }
  }

  // Build mutual matches (both sides agree on the pairing)
  const mutualPairs = new Set<string>();

  for (const [aId, aMatch] of aMatches) {
    const bMatch = bMatches.get(aMatch.bClaimId);
    if (bMatch && bMatch.aClaimId === aId) {
      // Mutual match
      const claimA = oosA.claims.find(c => c.claimId === aId)!;
      const claimB = oosB.claims.find(c => c.claimId === aMatch.bClaimId)!;

      diffClaims.push({
        classification: aMatch.score >= 0.8 ? 'DUPLICATE' : 'SIMILAR',
        claimA,
        claimB,
        similarityScore: aMatch.score,
        sectionMatch: aMatch.sectionMatch,
      });

      matched.add(aId);
      matched.add(`B:${aMatch.bClaimId}`);
      mutualPairs.add(`${aId}:${aMatch.bClaimId}`);
    }
  }

  // Unmatched claims from A = UNIQUE_TO_A
  for (const claimA of oosA.claims) {
    if (!matched.has(claimA.claimId)) {
      diffClaims.push({
        classification: 'UNIQUE_TO_A',
        claimA,
        claimB: null,
        similarityScore: null,
        sectionMatch: false,
      });
    }
  }

  // Unmatched claims from B = UNIQUE_TO_B
  for (const claimB of oosB.claims) {
    if (!matched.has(`B:${claimB.claimId}`)) {
      diffClaims.push({
        classification: 'UNIQUE_TO_B',
        claimA: null,
        claimB: claimB,
        similarityScore: null,
        sectionMatch: false,
      });
    }
  }

  // Sort: UNIQUE_TO_B first (highest value), then SIMILAR, then UNIQUE_TO_A, then DUPLICATE
  const sortOrder: Record<string, number> = {
    UNIQUE_TO_B: 0,
    SIMILAR: 1,
    UNIQUE_TO_A: 2,
    DUPLICATE: 3,
  };
  diffClaims.sort((a, b) => sortOrder[a.classification] - sortOrder[b.classification]);

  const summary = {
    uniqueToA: diffClaims.filter(c => c.classification === 'UNIQUE_TO_A').length,
    uniqueToB: diffClaims.filter(c => c.classification === 'UNIQUE_TO_B').length,
    similar: diffClaims.filter(c => c.classification === 'SIMILAR').length,
    duplicate: diffClaims.filter(c => c.classification === 'DUPLICATE').length,
  };

  return {
    oosA: { id: oosA.id, orgName: oosA.orgName, claimCount: oosA.claims.length },
    oosB: { id: oosB.id, orgName: oosB.orgName, claimCount: oosB.claims.length },
    summary,
    claims: diffClaims,
  };
}
