// Merge Execution -- pure transform logic (NO database, NO io).
//
// Turns a set of accepted source claims into the claim records that get
// written into the target org's NEW DRAFT version. Everything risky and
// fiddly lives here so it can be unit-tested without a database:
//   - claim-id renumbering into the target namespace (M001, M002, ...)
//   - confidence downgrade to LOW (merge protocol: "incoming claims default
//     to LOW confidence until validated locally")
//   - provenance stamping (where each imported claim came from)
//   - idempotency (re-merging the same source does not duplicate)
//   - adapt-with-edits (user-edited content overrides the source verbatim)
//
// The route layer (routes/api/merge.ts) handles auth, db reads/writes, the
// draft-version transaction, and copying the org's existing claims forward.

import type { Confidence, EvidenceType } from '../shared/enums.js';

export type MergeDecisionKind = 'accept' | 'adapt';

/** Edited fields supplied when the user chose 'adapt' instead of verbatim import. */
export interface AdaptedClaimContent {
  section?: string;
  rule?: string;
  why?: string;
  failureMode?: string;
  scope?: string;
}

/** A source claim the user accepted, resolved to its DB row. */
export interface AcceptedSourceClaim {
  dbId: string;              // source claim row uuid (-> source_claim_id)
  claimId: string;           // source-namespace id, e.g. 'C003'
  section: string;
  rule: string;
  why: string;
  failureMode: string;
  confidence: Confidence;    // original confidence (preserved in provenance)
  evidence: EvidenceType;
  scope: string;
  decision: MergeDecisionKind;
  similarityScore?: number | null;
  adapted?: AdaptedClaimContent | null;
}

export interface ClaimProvenance {
  original_claim_id: string;
  original_confidence: Confidence;
  original_evidence: EvidenceType;
  source_org_name: string;
  similarity_score: number | null;
  decision: MergeDecisionKind;
  adapted: boolean;
  merged_at: string;
}

/** A claim ready to be inserted into the new draft, plus its markdown line. */
export interface ImportedClaimRecord {
  claimId: string;           // target-namespace id, e.g. 'M001'
  section: string;
  displayOrder: number;
  rule: string;
  why: string;
  failureMode: string;
  confidence: Confidence;    // always 'LOW'
  evidence: EvidenceType;
  scope: string;
  source: 'merge';
  sourceOrgId: string;
  sourceClaimId: string;
  sourceOosId: string;
  provenance: ClaimProvenance;
  markdown: string;
}

export interface BuildImportedClaimsInput {
  accepted: AcceptedSourceClaim[];
  sourceOrgId: string;
  sourceOrgName: string;
  sourceOosId: string;
  /** Highest displayOrder among the target's existing claims (imports append after). */
  startDisplayOrder: number;
  /** All claimIds already in the target draft -- used to pick the next free M-number. */
  existingClaimIds: string[];
  /** source_claim_id values already imported into the target -- skipped (idempotency). */
  alreadyImportedSourceClaimIds?: string[];
  /** Injected timestamp (this module must stay pure -- no Date.now()). */
  mergedAtIso: string;
}

export interface BuildImportedClaimsResult {
  imported: ImportedClaimRecord[];
  stats: {
    requested: number;
    imported: number;
    skippedDuplicate: number;   // already imported from this source claim
  };
}

const MERGE_ID_RE = /^M(\d+)$/;

/** Next free M-number given the claimIds already present (handles re-merges). */
export function nextMergeNumber(existingClaimIds: string[]): number {
  let max = 0;
  for (const id of existingClaimIds) {
    const m = MERGE_ID_RE.exec(id);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return max + 1;
}

function mergeIdFor(n: number): string {
  return 'M' + String(n).padStart(3, '0');
}

function claimMarkdown(c: ImportedClaimRecord): string {
  return `\n\n### ${c.claimId}\n- **Confidence:** ${c.confidence}\n- **Evidence:** ${c.evidence}\n- **Section:** ${c.section}\n- **Rule:** ${c.rule}\n- **Why:** ${c.why}\n- **Failure mode:** ${c.failureMode}\n- **Scope:** ${c.scope}\n- **Source:** ${c.provenance.source_org_name} (${c.provenance.original_claim_id}, was ${c.provenance.original_confidence})`;
}

/**
 * Build the imported claim records for a merge. Pure: same input -> same output.
 * Imported claims are always LOW confidence with full provenance; evidence type
 * is preserved (it describes the source's basis, recorded honestly in provenance).
 */
export function buildImportedClaims(input: BuildImportedClaimsInput): BuildImportedClaimsResult {
  const alreadyImported = new Set(input.alreadyImportedSourceClaimIds ?? []);
  const imported: ImportedClaimRecord[] = [];

  let nextNum = nextMergeNumber(input.existingClaimIds);
  let displayOrder = input.startDisplayOrder;
  let skippedDuplicate = 0;

  for (const src of input.accepted) {
    if (alreadyImported.has(src.dbId)) {
      skippedDuplicate++;
      continue;
    }

    const adapted = src.decision === 'adapt' && src.adapted ? src.adapted : null;
    const claimId = mergeIdFor(nextNum++);
    displayOrder++;

    const record: ImportedClaimRecord = {
      claimId,
      section: adapted?.section ?? src.section,
      displayOrder,
      rule: adapted?.rule ?? src.rule,
      why: adapted?.why ?? src.why,
      failureMode: adapted?.failureMode ?? src.failureMode,
      confidence: 'LOW',
      evidence: src.evidence,
      scope: adapted?.scope ?? src.scope,
      source: 'merge',
      sourceOrgId: input.sourceOrgId,
      sourceClaimId: src.dbId,
      sourceOosId: input.sourceOosId,
      provenance: {
        original_claim_id: src.claimId,
        original_confidence: src.confidence,
        original_evidence: src.evidence,
        source_org_name: input.sourceOrgName,
        similarity_score: src.similarityScore ?? null,
        decision: src.decision,
        adapted: !!adapted,
        merged_at: input.mergedAtIso,
      },
      markdown: '',
    };
    record.markdown = claimMarkdown(record);
    imported.push(record);
  }

  return {
    imported,
    stats: {
      requested: input.accepted.length,
      imported: imported.length,
      skippedDuplicate,
    },
  };
}

/** Recompute a confidence/evidence distribution from a set of claims. */
export function distribution<T extends string>(values: T[]): Record<string, number> {
  return values.reduce((acc, v) => {
    const key = v.toLowerCase();
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}
