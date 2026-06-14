import { describe, it, expect } from 'vitest';
import { resolveLabEnabled, isLabToggleable, getLabFeature, LAB_FEATURES, type LabFeature } from './lab-features.js';

const make = (status: LabFeature['status']): LabFeature => ({
  key: 'x', name: 'X', description: '', status,
});

describe('resolveLabEnabled', () => {
  it('live is on for everyone, opt-in irrelevant', () => {
    expect(resolveLabEnabled(make('live'), false)).toBe(true);
    expect(resolveLabEnabled(make('live'), true)).toBe(true);
  });
  it('beta is on only when the org opted in', () => {
    expect(resolveLabEnabled(make('beta'), false)).toBe(false);
    expect(resolveLabEnabled(make('beta'), true)).toBe(true);
  });
  it('coming_soon is always off', () => {
    expect(resolveLabEnabled(make('coming_soon'), false)).toBe(false);
    expect(resolveLabEnabled(make('coming_soon'), true)).toBe(false);
  });
  it('unknown feature is off', () => {
    expect(resolveLabEnabled(undefined, true)).toBe(false);
  });
});

describe('isLabToggleable', () => {
  it('only beta features are toggleable', () => {
    expect(isLabToggleable(make('beta'))).toBe(true);
    expect(isLabToggleable(make('live'))).toBe(false);
    expect(isLabToggleable(make('coming_soon'))).toBe(false);
    expect(isLabToggleable(undefined)).toBe(false);
  });
});

describe('registry', () => {
  it('keys are unique', () => {
    const keys = LAB_FEATURES.map((f) => f.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
  it('ships marketplace as the first beta feature', () => {
    const m = getLabFeature('marketplace');
    expect(m).toBeDefined();
    expect(m!.status).toBe('beta');
  });
});
