import { describe, it, expect } from 'vitest';
import { normalizeStructure, totalMinutes, isValidSectionType } from './meeting-sections.js';

describe('isValidSectionType', () => {
  it('accepts known types, rejects junk', () => {
    expect(isValidSectionType('scorecard')).toBe(true);
    expect(isValidSectionType('issues')).toBe(true);
    expect(isValidSectionType('nope')).toBe(false);
    expect(isValidSectionType(123)).toBe(false);
  });
});

describe('normalizeStructure', () => {
  it('returns [] for non-arrays', () => {
    expect(normalizeStructure(null)).toEqual([]);
    expect(normalizeStructure('x' as unknown)).toEqual([]);
  });
  it('drops invalid section types', () => {
    const out = normalizeStructure([{ type: 'bogus', title: 'x' }, { type: 'segue' }]);
    expect(out).toHaveLength(1);
    expect(out[0].type).toBe('segue');
  });
  it('falls back to the type label when title is blank', () => {
    expect(normalizeStructure([{ type: 'scorecard' }])[0].title).toBe('Scorecard review');
  });
  it('keeps a custom title and notes, clamps minutes', () => {
    const out = normalizeStructure([{ type: 'notes', title: 'Pipeline review', minutes: 12, notes: 'walk the funnel' }]);
    expect(out[0]).toMatchObject({ type: 'notes', title: 'Pipeline review', minutes: 12, notes: 'walk the funnel' });
  });
  it('defaults minutes when missing/invalid', () => {
    expect(normalizeStructure([{ type: 'issues', minutes: 'abc' }])[0].minutes).toBe(30);
    expect(normalizeStructure([{ type: 'segue', minutes: -4 }])[0].minutes).toBe(5);
  });
  it('caps section count at 40', () => {
    const big = Array.from({ length: 60 }, () => ({ type: 'notes' }));
    expect(normalizeStructure(big)).toHaveLength(40);
  });
});

describe('totalMinutes', () => {
  it('sums the timeboxes', () => {
    const s = normalizeStructure([{ type: 'segue', minutes: 5 }, { type: 'issues', minutes: 30 }]);
    expect(totalMinutes(s)).toBe(35);
  });
});
