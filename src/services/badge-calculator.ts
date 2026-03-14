import type { QualityTier } from '../shared/enums.js';
import { EVIDENCE_STRENGTH } from '../shared/enums.js';
import type { ParsedClaim } from '../shared/types.js';

interface QualityScore {
  tier: QualityTier;
  score: number; // 0-4
  breakdown: {
    claimCount: number;
    evidenceQuality: number;
    failureModes: number;
    confidenceMix: number;
  };
}

export function calculateQualityTier(claims: ParsedClaim[]): QualityScore {
  const breakdown = {
    claimCount: scoreClaimCount(claims.length),
    evidenceQuality: scoreEvidenceQuality(claims),
    failureModes: scoreFailureModes(claims),
    confidenceMix: scoreConfidenceMix(claims),
  };

  // Weighted score
  const score =
    breakdown.claimCount * 0.15 +
    breakdown.evidenceQuality * 0.25 +
    breakdown.failureModes * 0.20 +
    breakdown.confidenceMix * 0.10;

  // Normalize to 0-4 scale (weights sum to 0.7, max raw = 2.8, normalize)
  const normalized = (score / 0.7);

  let tier: QualityTier;
  if (normalized >= 3.5) tier = 'platinum';
  else if (normalized >= 2.5) tier = 'gold';
  else if (normalized >= 1.5) tier = 'silver';
  else tier = 'bronze';

  return { tier, score: normalized, breakdown };
}

function scoreClaimCount(count: number): number {
  if (count >= 40) return 4;
  if (count >= 26) return 3;
  if (count >= 16) return 2;
  return 1;
}

function scoreEvidenceQuality(claims: ParsedClaim[]): number {
  if (claims.length === 0) return 0;

  const strongEvidence = claims.filter(c =>
    c.evidence === 'MEASURED_RESULT' || c.evidence === 'OBSERVED_REPEATEDLY'
  ).length;

  const ratio = strongEvidence / claims.length;
  if (ratio >= 0.5) return 4;
  if (ratio >= 0.3) return 3;
  if (ratio >= 0.15) return 2;
  return 1;
}

function scoreFailureModes(claims: ParsedClaim[]): number {
  const failureClaims = claims.filter(c => c.section === 'failure_patterns').length;
  if (failureClaims >= 10) return 4;
  if (failureClaims >= 6) return 3;
  if (failureClaims >= 3) return 2;
  if (failureClaims >= 1) return 1;
  return 0;
}

function scoreConfidenceMix(claims: ParsedClaim[]): number {
  const high = claims.filter(c => c.confidence === 'HIGH').length;
  const medium = claims.filter(c => c.confidence === 'MEDIUM').length;
  const low = claims.filter(c => c.confidence === 'LOW').length;

  // Healthy mix = all three present
  const present = [high > 0, medium > 0, low > 0].filter(Boolean).length;
  if (present === 3) return 4;
  if (present === 2) return 2;
  return 1; // All one level is suspicious
}
