import { describe, it, expect } from 'vitest';
import { jaccardSimilarity, computeClaimSimilarity, computeAllSimilarities } from './similarity.js';
import type { ParsedClaim } from '../shared/types.js';

const claim = (over: Partial<ParsedClaim> = {}): ParsedClaim => ({
  claimId: 'C001',
  section: 'core_operating_rules',
  displayOrder: 1,
  rule: 'Every agent writes to its own shared state file',
  why: 'shared state makes coordination visible and auditable',
  failureMode: 'agent acts on stale data',
  confidence: 'HIGH',
  evidence: 'HUMAN_DEFINED_RULE',
  scope: 'all agents',
  ...over,
});

describe('jaccardSimilarity', () => {
  it('is 1 for identical token sets', () => {
    expect(jaccardSimilarity(['a', 'b', 'c'], ['a', 'b', 'c'])).toBe(1);
  });
  it('is 0 for disjoint token sets', () => {
    expect(jaccardSimilarity(['a', 'b'], ['x', 'y'])).toBe(0);
  });
  it('is 0 for two empty sets', () => {
    expect(jaccardSimilarity([], [])).toBe(0);
  });
  it('computes partial overlap', () => {
    // {a,b} ∩ {b,c} = {b}; union = {a,b,c} => 1/3
    expect(jaccardSimilarity(['a', 'b'], ['b', 'c'])).toBeCloseTo(1 / 3, 5);
  });
});

describe('computeClaimSimilarity', () => {
  it('scores identical claims high with a section match', () => {
    const { score, sectionMatch } = computeClaimSimilarity(claim(), claim());
    expect(score).toBeGreaterThanOrEqual(0.6);
    expect(sectionMatch).toBe(true);
  });

  it('scores unrelated claims well below identical ones', () => {
    const other = claim({
      claimId: 'C9',
      section: 'failure_patterns',
      rule: 'Pineapple belongs on pizza according to nobody',
      why: 'culinary chaos ensues otherwise',
      scope: 'kitchen only',
    });
    const { score: same } = computeClaimSimilarity(claim(), claim());
    const { score: diff } = computeClaimSimilarity(claim(), other);
    expect(diff).toBeLessThan(0.3);
    expect(diff).toBeLessThan(same);
  });

  it('maps conceptually equivalent sections to a section match', () => {
    // value_chain_stages -> 'core', same bucket as core_operating_rules
    const { sectionMatch } = computeClaimSimilarity(
      claim({ section: 'core_operating_rules' }),
      claim({ section: 'value_chain_stages' }),
    );
    expect(sectionMatch).toBe(true);
  });
});

describe('computeAllSimilarities', () => {
  const newClaims = [{ ...claim({ claimId: 'C001' }), dbId: 'new-1' }];

  it('emits a cross-OOS pair above threshold with correct ids', () => {
    const existing = [{ ...claim({ claimId: 'C001' }), dbId: 'old-1', oosFileId: 'oos-other' }];
    const pairs = computeAllSimilarities(newClaims, 'oos-new', existing, 0.12);
    expect(pairs).toHaveLength(1);
    expect(pairs[0]).toMatchObject({
      claimAId: 'new-1', claimBId: 'old-1', oosAId: 'oos-new', oosBId: 'oos-other',
    });
    expect(pairs[0].score).toBeGreaterThanOrEqual(0.12);
  });

  it('skips claims from the same OOS file', () => {
    const sameFile = [{ ...claim({ claimId: 'C001' }), dbId: 'self', oosFileId: 'oos-new' }];
    expect(computeAllSimilarities(newClaims, 'oos-new', sameFile, 0.12)).toHaveLength(0);
  });

  it('filters pairs below the threshold', () => {
    const unrelated = [{
      ...claim({ claimId: 'C9', rule: 'totally unrelated nonsense', why: 'random', scope: 'nowhere' }),
      dbId: 'old-2', oosFileId: 'oos-other',
    }];
    expect(computeAllSimilarities(newClaims, 'oos-new', unrelated, 0.95)).toHaveLength(0);
  });
});
