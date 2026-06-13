import { describe, it, expect } from 'vitest';
import { parseNumber, parseDate, sinceDate, values2d, extractValue } from './kpi-extract.js';

describe('parseNumber', () => {
  it('parses numbers and currency/percent/commas, rejects junk', () => {
    expect(parseNumber('7')).toBe(7);
    expect(parseNumber('1,234')).toBe(1234);
    expect(parseNumber('$50')).toBe(50);
    expect(parseNumber('12%')).toBe(12);
    expect(parseNumber('')).toBeNull();
    expect(parseNumber('abc')).toBeNull();
    expect(parseNumber(null)).toBeNull();
  });
});

describe('parseDate', () => {
  it('handles ISO and US dates', () => {
    expect(parseDate('2026-01-01')?.toISOString().slice(0, 10)).toBe('2026-01-01');
    expect(parseDate('2026-06-08T00:00:00')?.toISOString().slice(0, 10)).toBe('2026-06-08');
    expect(parseDate('6/8/2026')?.toISOString().slice(0, 10)).toBe('2026-06-08');
    expect(parseDate('1/1/26')?.toISOString().slice(0, 10)).toBe('2026-01-01');
    expect(parseDate('not a date')).toBeNull();
  });
});

describe('sinceDate', () => {
  // 2026-06-13 is a Saturday; Monday of that ISO week is 2026-06-08.
  const sat = new Date('2026-06-13T18:00:00Z');
  it('monday_of_week_et returns the Monday', () => {
    expect(sinceDate('monday_of_week_et', sat)?.toISOString().slice(0, 10)).toBe('2026-06-08');
  });
  it('first_of_month_et / today_et', () => {
    expect(sinceDate('first_of_month_et', sat)?.toISOString().slice(0, 10)).toBe('2026-06-01');
    expect(sinceDate('today_et', sat)?.toISOString().slice(0, 10)).toBe('2026-06-13');
  });
  it('unknown label -> null', () => {
    expect(sinceDate('nope', sat)).toBeNull();
  });
});

describe('values2d', () => {
  it('reads Sheets batch-get shape and falls back to .values', () => {
    expect(values2d({ valueRanges: [{ values: [['a'], ['b']] }] })).toEqual([['a'], ['b']]);
    expect(values2d({ values: [['x']] })).toEqual([['x']]);
    expect(values2d({})).toEqual([]);
  });
});

describe('extractValue', () => {
  const now = new Date('2026-06-13T18:00:00Z');
  const sheet = {
    valueRanges: [{
      values: [
        ['Date', 'Project', 'New Leads', 'Dials'],
        ['2026-06-02', 'A', '5', '10'], // before this week
        ['2026-06-08', 'B', '7', '12'], // this week (Mon)
        ['2026-06-10', 'C', '3', '4'],  // this week
      ],
    }],
  };

  it('cell', () => {
    expect(extractValue(sheet, { mode: 'cell', row: 1, column: 2 }, now).value).toBe(5);
  });
  it('sum_column with header skip', () => {
    expect(extractValue(sheet, { mode: 'sum_column', column: 2, skip_header: true }, now).value).toBe(15);
  });
  it('count_rows with header skip', () => {
    expect(extractValue(sheet, { mode: 'count_rows', skip_header: true }, now).value).toBe(3);
  });
  it('sum_column_since sums only the current ISO week', () => {
    const r = extractValue(
      sheet,
      { mode: 'sum_column_since', date_column: 0, value_column: 2, since: 'monday_of_week_et', skip_header: true },
      now,
    );
    expect(r.value).toBe(10); // 7 + 3, the 2026-06-02 row excluded
    expect(r.note).toContain('2026-06-08');
  });
  it('empty data and unknown mode', () => {
    expect(extractValue({}, { mode: 'sum_column' }, now).value).toBeNull();
    expect(extractValue(sheet, { mode: 'bogus' as any }, now).value).toBeNull();
  });
});
