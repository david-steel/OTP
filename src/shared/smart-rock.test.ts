// Unit tests for the SMART Rock enrichment schema + hasSmartData helper.
// DB-free: imports only the pure module (no config/database.ts in the chain).
import { describe, it, expect } from 'vitest';
import { smartDataSchema, hasSmartData } from './smart-rock.js';

describe('smartDataSchema', () => {
  it('accepts a full valid object', () => {
    const r = smartDataSchema.safeParse({
      specific: 'Close 20% of qualified leads',
      measurable: 'Track close rate weekly in the CRM',
      attainable: 'Yes, with the new SDR',
      relevant: 'Ladders to the revenue 1-year plan',
      timeFramed: 'By end of Q3; checkpoint mid-quarter',
      finishLine: 'Three months at 20%+',
      resources: ['SDR hire', 'CRM report'],
      obstacles: ['Hiring lag'],
    });
    expect(r.success).toBe(true);
  });

  it('accepts an empty object (all fields optional)', () => {
    expect(smartDataSchema.safeParse({}).success).toBe(true);
  });

  it('accepts a partial object', () => {
    const r = smartDataSchema.safeParse({ specific: 'just this one' });
    expect(r.success).toBe(true);
  });

  it('rejects an unknown key via .strict()', () => {
    const r = smartDataSchema.safeParse({ specific: 'ok', bogus: 'nope' });
    expect(r.success).toBe(false);
  });

  it('rejects a SMART answer over the 4000-char cap', () => {
    const r = smartDataSchema.safeParse({ specific: 'x'.repeat(4001) });
    expect(r.success).toBe(false);
  });

  it('rejects a finishLine over the 2000-char cap', () => {
    const r = smartDataSchema.safeParse({ finishLine: 'x'.repeat(2001) });
    expect(r.success).toBe(false);
  });

  it('rejects a resources array over the 30-item cap', () => {
    const r = smartDataSchema.safeParse({ resources: Array(31).fill('a') });
    expect(r.success).toBe(false);
  });

  it('rejects an obstacles array over the 30-item cap', () => {
    const r = smartDataSchema.safeParse({ obstacles: Array(31).fill('a') });
    expect(r.success).toBe(false);
  });

  it('rejects a list entry over the 500-char cap', () => {
    const r = smartDataSchema.safeParse({ resources: ['x'.repeat(501)] });
    expect(r.success).toBe(false);
  });

  it('rejects a non-string SMART field', () => {
    const r = smartDataSchema.safeParse({ specific: 123 as unknown as string });
    expect(r.success).toBe(false);
  });
});

describe('hasSmartData', () => {
  it('is false for null / undefined / empty', () => {
    expect(hasSmartData(null)).toBe(false);
    expect(hasSmartData(undefined)).toBe(false);
    expect(hasSmartData({})).toBe(false);
  });

  it('is true when any SMART text field is set', () => {
    expect(hasSmartData({ measurable: 'tracked weekly' })).toBe(true);
    expect(hasSmartData({ finishLine: 'done when X' })).toBe(true);
  });

  it('is false for empty / whitespace-only lists, true for real entries', () => {
    expect(hasSmartData({ resources: [] })).toBe(false);
    expect(hasSmartData({ resources: ['   '] })).toBe(false);
    expect(hasSmartData({ resources: ['SDR hire'] })).toBe(true);
    expect(hasSmartData({ obstacles: ['Hiring lag'] })).toBe(true);
  });
});
