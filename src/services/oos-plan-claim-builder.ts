// Builds proposed OOS claims from OOS Operating Plan execution items.
//
// The output shape matches the existing claims table: claimId / section / rule /
// why / failureMode / confidence / evidence / scope / source / agentName.
// Source is set to 'operating_plan' so OOS claims pushed via this path are
// always identifiable and selectively reverteable.
//
// Phase 5 (preview): builds claims and returns them for the user to review.
// Phase 6 (push): same builder, written through to claims table.
//
// Quarterly preservation: section name encodes the quarter, so Q1 claims land
// in 'execution_q1_2026' and Q2 claims land in 'execution_q2_2026'. New quarter
// = new section, never overwriting prior quarter content.

import { eq, and, desc } from 'drizzle-orm';
import { db } from '../config/database.js';
import { oosFiles, claims, oosOperatingPlans, oosExecutionItems } from '../db/schema.js';

type ExecutionItem = typeof oosExecutionItems.$inferSelect;
type OosPlan = typeof oosOperatingPlans.$inferSelect;

export interface ProposedClaim {
  claimId: string;            // 'OP-XXXXXX' (max 10 chars)
  section: string;            // 'execution_q1_2026' etc.
  rule: string;               // human-readable rule statement (title + outcome)
  why: string;                // assignment reason / strategic context
  failureMode: string;        // what happens if this initiative drifts
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  evidence: 'HUMAN_DEFINED_RULE' | 'OBSERVED_ONCE' | 'OBSERVED_REPEATEDLY' | 'MEASURED_RESULT' | 'INFERENCE' | 'SPECULATION';
  scope: string;              // owner authority statement + review-by date
  source: 'operating_plan';
  agentName: string | null;   // populated when assigned owner is an agent
  // Diff metadata (not written to claims table; for preview UI only):
  proposedAction: 'add' | 'update';
  matchedClaimId: string | null;          // if update, the existing claims.id (uuid)
  matchedClaimDbValue: typeof claims.$inferSelect | null;
  sourceItemId: string;                   // execution_items.id for traceability
  reviewByDate: string;                   // ISO date, 90 days out from build time
}

const QUARTER_SECTION_PREFIX = 'execution_';

function quarterSectionName(quarter: string): string {
  // 'Q1-2026' -> 'execution_q1_2026'
  return QUARTER_SECTION_PREFIX + quarter.toLowerCase().replace('-', '_');
}

function buildClaimId(itemId: string): string {
  // First 6 hex chars of the item UUID, prefixed.
  // Drizzle UUIDs are 36 chars with dashes; strip and take 6.
  const hex = itemId.replace(/-/g, '').slice(0, 6).toUpperCase();
  return `OP-${hex}`;
}

function mapConfidence(score: number | null): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (score === null || score === undefined) return 'LOW';
  if (score >= 80) return 'HIGH';
  if (score >= 50) return 'MEDIUM';
  return 'LOW';
}

function reviewByDateIso(daysOut = 90): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysOut);
  return d.toISOString().slice(0, 10);
}

function buildScope(item: ExecutionItem): string {
  if (item.assignedOwnerType === 'unassigned' || !item.assignedOwnerName) {
    return `Applies to: this initiative. Authority: unassigned. Review by: ${reviewByDateIso(90)}.`;
  }
  if (item.assignedOwnerType === 'hybrid' && item.secondaryOwnerName) {
    return `Applies to: ${item.assignedOwnerName} (primary), ${item.secondaryOwnerName} (secondary). Authority: ${item.assignedOwnerName} unless secondary explicitly accepts handoff. Review by: ${reviewByDateIso(90)}.`;
  }
  return `Applies to: ${item.assignedOwnerName}. Authority: ${item.assignedOwnerName}. Review by: ${reviewByDateIso(90)}.`;
}

function buildRule(item: ExecutionItem): string {
  if (item.outcome) return `${item.title}. Desired outcome: ${item.outcome}`;
  return item.title;
}

function buildWhy(item: ExecutionItem): string {
  const reason = item.assignmentReason?.trim();
  if (reason) return reason;
  if (item.description) return item.description;
  return 'Strategic initiative committed by the operator in the OOS Operating Plan.';
}

function buildFailureMode(item: ExecutionItem): string {
  // Synthesize a default failure mode. Operator can edit downstream.
  const owner = item.assignedOwnerName ? `${item.assignedOwnerName}` : 'no clear owner';
  const horizon = item.dueDate ? `the ${new Date(item.dueDate).toISOString().slice(0, 10)} deadline` : 'the quarter';
  return `Initiative drifts past ${horizon} without ${owner} actively progressing it. Quarter ends with proposed status unchanged, signaling either misassigned ownership or wrong priority.`;
}

function mapEvidence(item: ExecutionItem): ProposedClaim['evidence'] {
  if (item.createdByAi && !item.userModified) return 'INFERENCE';
  return 'HUMAN_DEFINED_RULE';
}

// ---------------------------------------------------------------------------
// Per-item builder
// ---------------------------------------------------------------------------

export function buildProposedClaim(
  item: ExecutionItem,
  plan: OosPlan,
  matchedClaim: typeof claims.$inferSelect | null,
): ProposedClaim {
  const claimId = buildClaimId(item.id);
  const section = quarterSectionName(item.quarter);
  const agentName = item.assignedOwnerType === 'agent' ? item.assignedOwnerName ?? null : null;

  return {
    claimId,
    section,
    rule: buildRule(item),
    why: buildWhy(item),
    failureMode: buildFailureMode(item),
    confidence: mapConfidence(item.confidenceScore),
    evidence: mapEvidence(item),
    scope: buildScope(item),
    source: 'operating_plan',
    agentName,
    proposedAction: matchedClaim ? 'update' : 'add',
    matchedClaimId: matchedClaim ? matchedClaim.id : null,
    matchedClaimDbValue: matchedClaim,
    sourceItemId: item.id,
    reviewByDate: reviewByDateIso(90),
  };
}

// ---------------------------------------------------------------------------
// Bulk preview: build claims for a list of items, find matches in OOS for diff
// ---------------------------------------------------------------------------

export interface PreviewResult {
  proposedClaims: ProposedClaim[];
  oosFileId: string | null;       // the OOS file we'd push into (or null if none yet)
  summary: {
    total: number;
    add: number;
    update: number;
    lowConfidence: number;
    unassigned: number;
    bySection: Record<string, number>;
  };
}

// Given an org's most-recent published OOS file, find an existing claim whose
// claimId matches a proposed claimId. Returns null if no match (= 'add').
async function findMatchedClaim(
  oosFileId: string,
  proposedClaimId: string,
): Promise<typeof claims.$inferSelect | null> {
  const arr = await db
    .select()
    .from(claims)
    .where(and(eq(claims.oosFileId, oosFileId), eq(claims.claimId, proposedClaimId)))
    .limit(1);
  return arr[0] || null;
}

// Resolve the OOS file we'd push into. Prefers the latest PUBLISHED file for
// the org. If none exists, returns null and Phase 6 will need to create one
// (or refuse the push). For Phase 5 preview, null is acceptable: every
// proposed claim is treated as 'add'.
async function resolveTargetOosFileId(orgId: string): Promise<string | null> {
  const arr = await db
    .select()
    .from(oosFiles)
    .where(and(eq(oosFiles.orgId, orgId), eq(oosFiles.status, 'published')))
    .orderBy(desc(oosFiles.createdAt))
    .limit(1);
  return arr[0]?.id ?? null;
}

export async function buildPreview(
  orgId: string,
  plan: OosPlan,
  itemsToPush: ExecutionItem[],
): Promise<PreviewResult> {
  const oosFileId = await resolveTargetOosFileId(orgId);
  const proposedClaims: ProposedClaim[] = [];
  let add = 0;
  let update = 0;
  let lowConfidence = 0;
  let unassigned = 0;
  const bySection: Record<string, number> = {};

  for (const item of itemsToPush) {
    const proposedId = buildClaimId(item.id);
    const matched = oosFileId ? await findMatchedClaim(oosFileId, proposedId) : null;
    const proposed = buildProposedClaim(item, plan, matched);
    proposedClaims.push(proposed);

    if (proposed.proposedAction === 'add') add += 1;
    else update += 1;
    if (proposed.confidence === 'LOW') lowConfidence += 1;
    if (item.assignedOwnerType === 'unassigned') unassigned += 1;
    bySection[proposed.section] = (bySection[proposed.section] ?? 0) + 1;
  }

  return {
    proposedClaims,
    oosFileId,
    summary: {
      total: proposedClaims.length,
      add,
      update,
      lowConfidence,
      unassigned,
      bySection,
    },
  };
}
