// src/services/kpi-periods.ts
// Period bucket math for KPI time grains. UTC-based for v1; Phase 5 can add tz support.
//
// Conventions:
//   weekly    = ISO week Mon 00:00:00 -> Sun 23:59:59
//   monthly   = first of month 00:00:00 -> last of month 23:59:59
//   quarterly = Jan/Apr/Jul/Oct 1st 00:00:00 -> Mar/Jun/Sep/Dec last 23:59:59
//   annual    = Jan 1 00:00:00 -> Dec 31 23:59:59

export type KpiTimeGrain = 'weekly' | 'monthly' | 'quarterly' | 'annual';

export interface Period {
  start: Date;
  end: Date;
}

function startOfDay(d: Date): Date {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
  return x;
}

function endOfDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999));
}

function startOfMonday(d: Date): Date {
  // getUTCDay: 0=Sun, 1=Mon, ..., 6=Sat. Shift so Monday=0.
  const dow = d.getUTCDay();
  const daysFromMon = (dow + 6) % 7;
  const x = new Date(d);
  x.setUTCDate(d.getUTCDate() - daysFromMon);
  return startOfDay(x);
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setUTCDate(d.getUTCDate() + n);
  return x;
}

function startOfMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0, 0));
}

function endOfMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0, 23, 59, 59, 999));
}

function quarterStart(d: Date): Date {
  const q = Math.floor(d.getUTCMonth() / 3); // 0..3
  return new Date(Date.UTC(d.getUTCFullYear(), q * 3, 1, 0, 0, 0, 0));
}

function quarterEnd(d: Date): Date {
  const q = Math.floor(d.getUTCMonth() / 3);
  return new Date(Date.UTC(d.getUTCFullYear(), q * 3 + 3, 0, 23, 59, 59, 999));
}

export function periodFor(grain: KpiTimeGrain, anchor: Date): Period {
  if (grain === 'weekly') {
    const start = startOfMonday(anchor);
    return { start, end: endOfDay(addDays(start, 6)) };
  }
  if (grain === 'monthly') {
    return { start: startOfMonth(anchor), end: endOfMonth(anchor) };
  }
  if (grain === 'quarterly') {
    return { start: quarterStart(anchor), end: quarterEnd(anchor) };
  }
  if (grain === 'annual') {
    return {
      start: new Date(Date.UTC(anchor.getUTCFullYear(), 0, 1, 0, 0, 0, 0)),
      end: new Date(Date.UTC(anchor.getUTCFullYear(), 11, 31, 23, 59, 59, 999)),
    };
  }
  throw new Error(`unknown grain: ${grain}`);
}

export function nextPeriod(grain: KpiTimeGrain, p: Period): Period {
  if (grain === 'weekly') return periodFor('weekly', addDays(p.end, 1));
  if (grain === 'monthly') return periodFor('monthly', addDays(p.end, 1));
  if (grain === 'quarterly') return periodFor('quarterly', addDays(p.end, 1));
  if (grain === 'annual') return periodFor('annual', addDays(p.end, 1));
  throw new Error(`unknown grain: ${grain}`);
}

export function bucketPeriods(grain: KpiTimeGrain, from: Date, to: Date): Period[] {
  const out: Period[] = [];
  let cur = periodFor(grain, from);
  // include any period whose start is <= to
  while (cur.start <= to) {
    out.push(cur);
    cur = nextPeriod(grain, cur);
    if (out.length > 520) break; // safety: ~10 years of weeks
  }
  return out;
}

export function formatPeriodLabel(grain: KpiTimeGrain, p: Period): string {
  const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  if (grain === 'weekly') {
    const s = p.start, e = p.end;
    const sM = m[s.getUTCMonth()], sD = s.getUTCDate();
    const eM = m[e.getUTCMonth()], eD = e.getUTCDate();
    if (s.getUTCMonth() === e.getUTCMonth()) return `${sM} ${sD}-${eD}`;
    return `${sM} ${sD} - ${eM} ${eD}`;
  }
  if (grain === 'monthly') return `${m[p.start.getUTCMonth()]} ${p.start.getUTCFullYear()}`;
  if (grain === 'quarterly') {
    const q = Math.floor(p.start.getUTCMonth() / 3) + 1;
    return `Q${q} ${p.start.getUTCFullYear()}`;
  }
  if (grain === 'annual') return String(p.start.getUTCFullYear());
  return '';
}
