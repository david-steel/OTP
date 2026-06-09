import { describe, it, expect } from 'vitest';
import { buildImportedClaims, nextMergeNumber, distribution, type AcceptedSourceClaim } from './merge-execute.js';

const baseSrc = (over: Partial<AcceptedSourceClaim> = {}): AcceptedSourceClaim => ({
  dbId: 'src-1',
  claimId: 'C003',
  section: 'core_operating_rules',
  rule: 'Always do X',
  why: 'because Y',
  failureMode: 'Z breaks',
  confidence: 'HIGH',
  evidence: 'MEASURED_RESULT',
  scope: 'all agents',
  decision: 'accept',
  ...over,
});

const MERGED_AT = '2026-06-08T00:00:00.000Z';

describe('nextMergeNumber', () => {
  it('starts at 1 when there are no merge ids', () => {
    expect(nextMergeNumber(['C001', 'C002', 'L001'])).toBe(1);
  });
  it('continues after the highest existing M-id (re-merge safe)', () => {
    expect(nextMergeNumber(['C001', 'M001', 'M003', 'L002'])).toBe(4);
  });
  it('handles an empty list', () => {
    expect(nextMergeNumber([])).toBe(1);
  });
});

describe('buildImportedClaims', () => {
  it('renumbers into the target M-namespace, appends displayOrder', () => {
    const { imported } = buildImportedClaims({
      accepted: [baseSrc({ dbId: 'a' }), baseSrc({ dbId: 'b', claimId: 'C004' })],
      sourceOrgId: 'org-src', sourceOrgName: 'Acme', sourceOosId: 'oos-src',
      startDisplayOrder: 18, existingClaimIds: ['C001', 'C002'], mergedAtIso: MERGED_AT,
    });
    expect(imported.map(c => c.claimId)).toEqual(['M001', 'M002']);
    expect(imported.map(c => c.displayOrder)).toEqual([19, 20]);
  });

  it('forces LOW confidence but preserves evidence and records the original', () => {
    const { imported } = buildImportedClaims({
      accepted: [baseSrc({ confidence: 'HIGH', evidence: 'MEASURED_RESULT' })],
      sourceOrgId: 'org-src', sourceOrgName: 'Acme', sourceOosId: 'oos-src',
      startDisplayOrder: 0, existingClaimIds: [], mergedAtIso: MERGED_AT,
    });
    const c = imported[0];
    expect(c.confidence).toBe('LOW');
    expect(c.evidence).toBe('MEASURED_RESULT');
    expect(c.provenance.original_confidence).toBe('HIGH');
    expect(c.provenance.original_claim_id).toBe('C003');
    expect(c.provenance.source_org_name).toBe('Acme');
    expect(c.provenance.merged_at).toBe(MERGED_AT);
    expect(c.provenance.adapted).toBe(false);
  });

  it('stamps provenance soft-ref columns', () => {
    const { imported } = buildImportedClaims({
      accepted: [baseSrc({ dbId: 'src-row-9' })],
      sourceOrgId: 'org-src', sourceOrgName: 'Acme', sourceOosId: 'oos-src-v2',
      startDisplayOrder: 0, existingClaimIds: [], mergedAtIso: MERGED_AT,
    });
    const c = imported[0];
    expect(c.source).toBe('merge');
    expect(c.sourceOrgId).toBe('org-src');
    expect(c.sourceClaimId).toBe('src-row-9');
    expect(c.sourceOosId).toBe('oos-src-v2');
  });

  it('applies adapt-with-edits and flags it in provenance', () => {
    const { imported } = buildImportedClaims({
      accepted: [baseSrc({ decision: 'adapt', adapted: { rule: 'Adapted rule', scope: 'my agents only' } })],
      sourceOrgId: 'org-src', sourceOrgName: 'Acme', sourceOosId: 'oos-src',
      startDisplayOrder: 0, existingClaimIds: [], mergedAtIso: MERGED_AT,
    });
    const c = imported[0];
    expect(c.rule).toBe('Adapted rule');
    expect(c.scope).toBe('my agents only');
    expect(c.why).toBe('because Y');           // untouched fields fall back to source
    expect(c.provenance.adapted).toBe(true);
    expect(c.provenance.decision).toBe('adapt');
  });

  it("treats decision='adapt' with no edits as verbatim import (not adapted)", () => {
    const { imported } = buildImportedClaims({
      accepted: [baseSrc({ decision: 'adapt', adapted: null })],
      sourceOrgId: 'org-src', sourceOrgName: 'Acme', sourceOosId: 'oos-src',
      startDisplayOrder: 0, existingClaimIds: [], mergedAtIso: MERGED_AT,
    });
    expect(imported[0].rule).toBe('Always do X');
    expect(imported[0].provenance.adapted).toBe(false);
  });

  it('is idempotent: skips claims already imported from the same source row', () => {
    const { imported, stats } = buildImportedClaims({
      accepted: [baseSrc({ dbId: 'already' }), baseSrc({ dbId: 'fresh', claimId: 'C005' })],
      sourceOrgId: 'org-src', sourceOrgName: 'Acme', sourceOosId: 'oos-src',
      startDisplayOrder: 5, existingClaimIds: ['C001', 'M001'],
      alreadyImportedSourceClaimIds: ['already'], mergedAtIso: MERGED_AT,
    });
    expect(imported).toHaveLength(1);
    expect(imported[0].sourceClaimId).toBe('fresh');
    expect(imported[0].claimId).toBe('M002');   // continues after existing M001
    expect(stats).toEqual({ requested: 2, imported: 1, skippedDuplicate: 1 });
  });

  it('markdown carries the new id and a provenance source line', () => {
    const { imported } = buildImportedClaims({
      accepted: [baseSrc()],
      sourceOrgId: 'org-src', sourceOrgName: 'Acme', sourceOosId: 'oos-src',
      startDisplayOrder: 0, existingClaimIds: [], mergedAtIso: MERGED_AT,
    });
    expect(imported[0].markdown).toContain('### M001');
    expect(imported[0].markdown).toContain('**Confidence:** LOW');
    expect(imported[0].markdown).toContain('Acme (C003, was HIGH)');
  });
});

describe('distribution', () => {
  it('counts lowercased keys', () => {
    expect(distribution(['HIGH', 'LOW', 'LOW'])).toEqual({ high: 1, low: 2 });
  });
});
