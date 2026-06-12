import { describe, it, expect } from 'vitest';
import { valueWriteSchema } from './kpi-value-schema.js';

// Regression guard for the 2026-06-10 live-L10 bug report ("I had 0 sales and
// 0 close rate and it would not update"). The falsy-zero bug class -- any
// `if (!value)` / `value || null` creeping into the KPI value write path --
// must never reject or drop a 0. 0 sales is real data.
describe('KPI value write schema (POST /api/v1/kpis/:id/values)', () => {
  const PERIOD = '2026-06-08T00:00:00.000Z';

  it('accepts 0 as a value -- zero is a measurement, not "no value"', () => {
    const r = valueWriteSchema.safeParse({ periodStart: PERIOD, value: 0 });
    expect(r.success).toBe(true);
    if (r.success) {
      // Must survive parsing as exactly 0 -- not coerced to null/undefined.
      expect(r.data.value).toBe(0);
    }
  });

  it('accepts the exact body the L8 meeting runner sends for a 0 entry', () => {
    // l8-leadership.ejs: JSON.stringify({ periodStart, value }) with value=parseFloat('0')
    const body = JSON.parse(JSON.stringify({ periodStart: new Date().toISOString(), value: parseFloat('0') }));
    const r = valueWriteSchema.safeParse(body);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.value).toBe(0);
  });

  it('accepts negative and decimal values', () => {
    expect(valueWriteSchema.safeParse({ periodStart: PERIOD, value: -3 }).success).toBe(true);
    expect(valueWriteSchema.safeParse({ periodStart: PERIOD, value: 0.25 }).success).toBe(true);
  });

  it('accepts null to clear a period', () => {
    const r = valueWriteSchema.safeParse({ periodStart: PERIOD, value: null });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.value).toBeNull();
  });

  it('rejects non-numeric values rather than silently coercing', () => {
    expect(valueWriteSchema.safeParse({ periodStart: PERIOD, value: '0' }).success).toBe(false);
    expect(valueWriteSchema.safeParse({ periodStart: PERIOD, value: NaN }).success).toBe(false);
    expect(valueWriteSchema.safeParse({ periodStart: PERIOD, value: Infinity }).success).toBe(false);
    expect(valueWriteSchema.safeParse({ periodStart: PERIOD }).success).toBe(false);
  });

  it('rejects a missing/short periodStart', () => {
    expect(valueWriteSchema.safeParse({ value: 0 }).success).toBe(false);
    expect(valueWriteSchema.safeParse({ periodStart: '2026', value: 0 }).success).toBe(false);
  });
});
