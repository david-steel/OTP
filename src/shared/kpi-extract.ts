/**
 * kpi-extract.ts -- PURE, DB-free reduction of a Composio tool response to one
 * KPI number. The server-side twin of Tally's _extract_value (Python); ported
 * faithfully so Sneeze It (Tally) and customers (server-side) compute identically.
 *
 * Side-effect-free + `now` injected, so every branch is unit-testable. No imports
 * that reach config/database.ts (see feedback_otp_pure_logic_needs_db_free_module).
 */

export type ExtractMode = 'cell' | 'sum_column' | 'count_rows' | 'sum_column_since';

export interface ExtractSpec {
  mode: ExtractMode;
  // cell
  row?: number;
  column?: number;
  // sum_column / count_rows
  skip_header?: boolean;
  nonempty_column?: number;
  // sum_column_since
  date_column?: number;
  value_column?: number;
  since?: string; // monday_of_week_et | today_et | first_of_month_et
}

export interface ExtractResult {
  value: number | null;
  note: string;
}

/** Parse a sheet cell into a number, tolerating $ , % and whitespace. */
export function parseNumber(x: unknown): number | null {
  if (x === null || x === undefined) return null;
  const s = String(x).trim().replace(/[,$%]/g, '');
  if (s === '') return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** Parse a cell into a UTC-midnight Date. Handles ISO and US (M/D/Y). Null if bad. */
export function parseDate(x: unknown): Date | null {
  const s = String(x ?? '').trim();
  if (!s) return null;
  const iso = s.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [y, m, d] = iso.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    return Number.isNaN(dt.getTime()) ? null : dt;
  }
  const us = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (us) {
    let [, mm, dd, yy] = us;
    let year = Number(yy);
    if (year < 100) year += 2000;
    const dt = new Date(Date.UTC(year, Number(mm) - 1, Number(dd)));
    return Number.isNaN(dt.getTime()) ? null : dt;
  }
  return null;
}

function etYMD(now: Date): { y: number; m: number; d: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return { y: get('year'), m: get('month'), d: get('day') };
}

/** Cutoff date (UTC-midnight) for a window label, evaluated in America/New_York. */
export function sinceDate(label: string, now: Date): Date | null {
  const { y, m, d } = etYMD(now);
  const today = new Date(Date.UTC(y, m - 1, d));
  if (label === 'today_et') return today;
  if (label === 'first_of_month_et') return new Date(Date.UTC(y, m - 1, 1));
  if (label === 'monday_of_week_et') {
    const delta = (today.getUTCDay() + 6) % 7; // days since Monday (Mon=0)
    return new Date(today.getTime() - delta * 86400000);
  }
  return null;
}

/** Pull a 2D values array out of a Composio response (Sheets batch-get style). */
export function values2d(data: any): any[][] {
  for (const key of ['valueRanges', 'value_ranges']) {
    const ranges = data?.[key];
    if (Array.isArray(ranges) && ranges.length) {
      const vals = ranges[0]?.values;
      if (Array.isArray(vals)) return vals;
    }
  }
  return Array.isArray(data?.values) ? data.values : [];
}

/** Reduce a Composio response to one number per the extract spec. */
export function extractValue(data: any, extract: ExtractSpec, now: Date): ExtractResult {
  const mode = extract?.mode || 'cell';
  const rows = values2d(data);
  if (!rows.length) return { value: null, note: 'no values returned' };
  const skip = extract.skip_header ? 1 : 0;
  const body = rows.slice(skip);

  if (mode === 'cell') {
    const r = Number(extract.row ?? 0);
    const c = Number(extract.column ?? 0);
    const v = parseNumber(rows[r]?.[c]);
    return v === null ? { value: null, note: 'cell not numeric / out of range' } : { value: v, note: `cell[${r}][${c}]=${v}` };
  }

  if (mode === 'sum_column') {
    const c = Number(extract.column ?? 0);
    const nums = body.map((row) => parseNumber(row?.[c])).filter((n): n is number => n !== null);
    return { value: nums.reduce((a, b) => a + b, 0), note: `sum of ${nums.length} cells in col ${c}` };
  }

  if (mode === 'count_rows') {
    const nc = extract.nonempty_column;
    const n = nc === undefined
      ? body.filter((row) => row.some((x) => String(x).trim())).length
      : body.filter((row) => row.length > Number(nc) && String(row[Number(nc)]).trim()).length;
    return { value: n, note: `counted ${n} rows` };
  }

  if (mode === 'sum_column_since') {
    const dc = Number(extract.date_column ?? 0);
    const vc = Number(extract.value_column ?? 1);
    const since = sinceDate(extract.since || '', now);
    if (!since) return { value: null, note: `unknown since label: ${extract.since}` };
    let total = 0, matched = 0;
    for (const row of body) {
      if (row.length <= Math.max(dc, vc)) continue;
      const dt = parseDate(row[dc]);
      if (!dt || dt.getTime() < since.getTime()) continue;
      const n = parseNumber(row[vc]);
      if (n === null) continue;
      total += n; matched += 1;
    }
    return { value: total, note: `sum of ${matched} rows on/after ${since.toISOString().slice(0, 10)}` };
  }

  return { value: null, note: `unknown extract mode: ${mode}` };
}
