import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';
import { claims, oosFiles, organizations } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { jaccardSimilarity } from './similarity.js';
import { EVIDENCE_STRENGTH } from '../shared/enums.js';
import type { EvidenceType, Confidence } from '../shared/enums.js';
import { CLAIM_SECTIONS } from '../shared/validation.js';

// Confidence weight for scoring
const CONFIDENCE_WEIGHT: Record<string, number> = {
  HIGH: 1.0,
  MEDIUM: 0.6,
  LOW: 0.3,
};

// Jaccard threshold above which a candidate is considered "already covered"
const ALREADY_COVERED_THRESHOLD = 0.4;

// Minimum relevance score to include in recommendations
const MIN_RELEVANCE_SCORE = 0.15;

export interface RecommendationCandidate {
  sourceClaimId: string;
  sourceOosId: string;
  sourceOrgName: string;
  source: 'gap_analysis' | 'similarity' | 'trending' | 'manual';
  relevanceScore: number;
  reason: string;
  section: string;
  ruleText: string;
  whyText: string;
  failureModeText: string;
  confidence: string;
  evidence: string;
  scopeText: string;
}

function tokenize(text: string): string[] {
  const STOP_WORDS = new Set([
    'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in',
    'with', 'to', 'for', 'of', 'not', 'no', 'can', 'will', 'do', 'does',
    'should', 'must', 'this', 'that', 'it', 'its', 'are', 'was', 'were',
    'be', 'been', 'being', 'have', 'has', 'had', 'having', 'from', 'by',
    'all', 'each', 'every', 'any', 'if', 'when', 'than', 'then', 'into',
    'also', 'only', 'very', 'just', 'about', 'such', 'through', 'after',
    'before', 'between', 'both', 'same', 'other', 'more', 'most', 'some',
  ]);
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(t => t.length > 2)
    .filter(t => !STOP_WORDS.has(t));
}

function claimText(rule: string, why: string, scope: string): string[] {
  return tokenize(`${rule} ${why} ${scope}`);
}

function isAlreadyCovered(
  candidateTokens: string[],
  orgClaimTokenSets: string[][]
): boolean {
  for (const existingTokens of orgClaimTokenSets) {
    const score = jaccardSimilarity(candidateTokens, existingTokens);
    if (score > ALREADY_COVERED_THRESHOLD) {
      return true;
    }
  }
  return false;
}

function evidenceStrength(evidence: string): number {
  return (EVIDENCE_STRENGTH as Record<string, number>)[evidence] || 1;
}

function formatEvidenceLabel(evidence: string): string {
  return evidence.toLowerCase().replace(/_/g, ' ');
}

export async function discoverRecommendations(
  orgId: string,
  maxResults: number = 20
): Promise<RecommendationCandidate[]> {
  // Step 1: Get this org's latest published OOS and its claims
  const [latestOos] = await db
    .select()
    .from(oosFiles)
    .where(and(eq(oosFiles.orgId, orgId), eq(oosFiles.status, 'published')))
    .orderBy(sql`${oosFiles.publishedAt} DESC`)
    .limit(1);

  if (!latestOos) {
    return [];
  }

  const orgClaims = await db
    .select()
    .from(claims)
    .where(eq(claims.oosFileId, latestOos.id));

  // Build section counts and token sets for the org's existing claims
  const sectionCounts: Record<string, number> = {};
  const orgClaimTokenSets: string[][] = [];

  for (const c of orgClaims) {
    sectionCounts[c.section] = (sectionCounts[c.section] || 0) + 1;
    orgClaimTokenSets.push(claimText(c.rule, c.why, c.scope));
  }

  // Identify gap sections (fewer than 2 claims)
  const gapSections = new Set<string>();
  for (const section of CLAIM_SECTIONS) {
    if ((sectionCounts[section] || 0) < 2) {
      gapSections.add(section);
    }
  }

  // Step 2: Get all claims from OTHER orgs' published OOS files
  const otherClaims = await db.execute(sql`
    SELECT
      c.id AS claim_id,
      c.section,
      c.rule,
      c.why,
      c.failure_mode,
      c.confidence,
      c.evidence,
      c.scope,
      c.oos_file_id,
      o.name AS org_name,
      o.pseudonym AS org_pseudonym
    FROM claims c
    JOIN oos_files f ON c.oos_file_id = f.id
    JOIN organizations o ON f.org_id = o.id
    WHERE f.status = 'published'
      AND f.org_id != ${orgId}
    ORDER BY c.evidence DESC, c.confidence ASC
  `);

  const rows = otherClaims.rows as Array<{
    claim_id: string;
    section: string;
    rule: string;
    why: string;
    failure_mode: string;
    confidence: string;
    evidence: string;
    scope: string;
    oos_file_id: string;
    org_name: string;
    org_pseudonym: string | null;
  }>;

  // Step 3: Score and filter candidates
  const candidates: RecommendationCandidate[] = [];

  for (const row of rows) {
    const candidateTokens = claimText(row.rule, row.why, row.scope);

    // Skip if already covered by an existing org claim
    if (isAlreadyCovered(candidateTokens, orgClaimTokenSets)) {
      continue;
    }

    const isGap = gapSections.has(row.section);
    const evStrength = evidenceStrength(row.evidence) / 6; // normalize to 0-1
    const confWeight = CONFIDENCE_WEIGHT[row.confidence] || 0.3;
    const gapBonus = isGap ? 1.0 : 0.0;

    const relevanceScore = (evStrength * 0.4) + (confWeight * 0.3) + (gapBonus * 0.3);

    if (relevanceScore < MIN_RELEVANCE_SCORE) {
      continue;
    }

    const displayOrgName = row.org_pseudonym || row.org_name;
    const source: 'gap_analysis' | 'similarity' = isGap ? 'gap_analysis' : 'similarity';

    let reason: string;
    if (isGap) {
      const claimCount = sectionCounts[row.section] || 0;
      reason = `Your OOS has ${claimCount === 0 ? 'no' : 'only ' + claimCount} ${row.section} claim${claimCount === 1 ? '' : 's'}. This ${row.confidence} confidence claim from ${displayOrgName} documents a real-world insight with ${formatEvidenceLabel(row.evidence)} evidence.`;
    } else {
      reason = `${row.confidence} confidence claim from ${displayOrgName} with ${formatEvidenceLabel(row.evidence)} evidence covers a pattern not present in your OOS.`;
    }

    candidates.push({
      sourceClaimId: row.claim_id,
      sourceOosId: row.oos_file_id,
      sourceOrgName: displayOrgName,
      source,
      relevanceScore: Math.round(relevanceScore * 1000) / 1000,
      reason,
      section: row.section,
      ruleText: row.rule,
      whyText: row.why,
      failureModeText: row.failure_mode,
      confidence: row.confidence,
      evidence: row.evidence,
      scopeText: row.scope,
    });
  }

  // Sort by relevance score descending, take top N
  candidates.sort((a, b) => b.relevanceScore - a.relevanceScore);
  return candidates.slice(0, maxResults);
}
