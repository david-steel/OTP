/**
 * schedule-cadence.ts -- pure, DB-free cadence math for autonomous schedules.
 *
 * We deliberately do NOT expose raw cron to users (a malformed cron on a
 * money-spending autopilot is a foot-gun). Instead we support a small, correct
 * cadence set -- Hourly / Daily / Weekly -- and canonicalize each to a cron
 * string stored in agent_schedules.cron. The runner never parses arbitrary
 * cron; it only ever computes nextRunAt for these three shapes, which keeps the
 * timezone math tractable and exhaustively testable.
 *
 * No external dep (cron-parser is NOT available). All timezone handling is via
 * Intl/toLocaleString: we read the wall-clock fields of `after` in the target
 * IANA zone, advance the wall clock to the next matching slot, then convert that
 * wall-clock back to a real UTC Date. This is DST-correct because we resolve the
 * zone offset for the *candidate* instant, not the source instant.
 */

export type Cadence = 'hourly' | 'daily' | 'weekly';

export interface CadenceSpec {
  cadence: Cadence;
  /** minute 0-59. Required for hourly/daily/weekly. */
  minute?: number;
  /** hour 0-23. Required for daily/weekly. Ignored for hourly. */
  hour?: number;
  /** weekday 0-6 (0 = Sunday). Required for weekly. Ignored otherwise. */
  weekday?: number;
}

function intOr(v: unknown, fallback: number): number {
  const n = typeof v === 'number' ? v : parseInt(String(v ?? ''), 10);
  return Number.isFinite(n) ? n : fallback;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

/**
 * Normalize a (possibly partial / out-of-range) cadence spec to clamped,
 * defaulted fields. Defaults: minute 0, hour 9 (daily/weekly), weekday 1 (Mon).
 */
export function normalizeCadence(spec: CadenceSpec): Required<CadenceSpec> {
  const cadence = spec.cadence;
  const minute = clamp(intOr(spec.minute, 0), 0, 59);
  const hour = clamp(intOr(spec.hour, 9), 0, 23);
  const weekday = clamp(intOr(spec.weekday, 1), 0, 6);
  return { cadence, minute, hour, weekday };
}

/**
 * Canonical cron string for a cadence. We store this in the `cron` column so the
 * row is self-describing and the cadence is recoverable. Format: standard
 * 5-field cron (minute hour day-of-month month day-of-week).
 *   hourly  M -> `M * * * *`
 *   daily   H:M -> `M H * * *`
 *   weekly  D H:M -> `M H * * D`
 */
export function cadenceToCron(spec: CadenceSpec): string {
  const n = normalizeCadence(spec);
  if (n.cadence === 'hourly') return `${n.minute} * * * *`;
  if (n.cadence === 'daily') return `${n.minute} ${n.hour} * * *`;
  return `${n.minute} ${n.hour} * * ${n.weekday}`;
}

/**
 * Parse one of OUR canonical cron strings back into a CadenceSpec. Returns null
 * for anything we did not author (the runner uses this defensively -- it will
 * never run a schedule whose cron it cannot interpret as a known cadence).
 */
export function cronToCadence(cron: string): Required<CadenceSpec> | null {
  const parts = String(cron || '').trim().split(/\s+/);
  if (parts.length !== 5) return null;
  const [min, hr, dom, mon, dow] = parts;
  if (dom !== '*' || mon !== '*') return null;

  const minute = parseInt(min, 10);
  if (!Number.isInteger(minute) || minute < 0 || minute > 59) return null;

  // hourly: `M * * * *`
  if (hr === '*' && dow === '*') {
    return { cadence: 'hourly', minute, hour: 0, weekday: 1 };
  }
  const hour = parseInt(hr, 10);
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) return null;

  // daily: `M H * * *`
  if (dow === '*') {
    return { cadence: 'daily', minute, hour, weekday: 1 };
  }
  // weekly: `M H * * D`
  const weekday = parseInt(dow, 10);
  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) return null;
  return { cadence: 'weekly', minute, hour, weekday };
}

// ---- Timezone helpers (Intl-based, no external dep) ----

/**
 * Read the wall-clock fields of an instant in a given IANA timezone.
 * Returns the broken-out local time the way a clock on the wall in `tz` shows it.
 */
function wallClockInZone(instant: Date, tz: string): {
  year: number; month: number; day: number; hour: number; minute: number; second: number; weekday: number;
} {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false, weekday: 'short',
  });
  const parts = fmt.formatToParts(instant);
  const get = (t: string) => parts.find(p => p.type === t)?.value || '';
  const wkMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  let hour = parseInt(get('hour'), 10);
  // Intl can emit '24' for midnight in hour12:false on some engines; normalize.
  if (hour === 24) hour = 0;
  return {
    year: parseInt(get('year'), 10),
    month: parseInt(get('month'), 10),
    day: parseInt(get('day'), 10),
    hour,
    minute: parseInt(get('minute'), 10),
    second: parseInt(get('second'), 10),
    weekday: wkMap[get('weekday')] ?? 0,
  };
}

/**
 * The offset (in minutes) between UTC and `tz` at a given instant.
 * offsetMinutes = (wallClock-as-if-UTC) - actualUTC.
 */
function tzOffsetMinutes(instant: Date, tz: string): number {
  const wc = wallClockInZone(instant, tz);
  const asUtc = Date.UTC(wc.year, wc.month - 1, wc.day, wc.hour, wc.minute, wc.second);
  return Math.round((asUtc - instant.getTime()) / 60000);
}

/**
 * Convert a wall-clock time IN `tz` to the real UTC instant. DST-correct: we
 * estimate the offset, build a candidate, then re-resolve the offset AT the
 * candidate and correct once (handles the spring-forward/fall-back edges).
 */
function zonedWallClockToUtc(
  y: number, mo: number, d: number, h: number, mi: number, tz: string,
): Date {
  const naiveUtc = Date.UTC(y, mo - 1, d, h, mi, 0);
  let offset = tzOffsetMinutes(new Date(naiveUtc), tz);
  let candidate = new Date(naiveUtc - offset * 60000);
  // Re-resolve at the candidate instant; if the offset changed (DST boundary),
  // correct once. A second pass is mathematically sufficient for IANA zones.
  const offset2 = tzOffsetMinutes(candidate, tz);
  if (offset2 !== offset) {
    offset = offset2;
    candidate = new Date(naiveUtc - offset * 60000);
  }
  return candidate;
}

/**
 * Compute the next occurrence of a cadence cron string, in the given IANA
 * timezone, strictly AFTER `after`.
 *
 * Strategy: walk forward over candidate wall-clock slots in `tz` and return the
 * first whose real UTC instant is > after. The candidate set per cadence is
 * small and bounded, so this terminates quickly:
 *   hourly  -> next minute-M slot within this hour, else next hour(s)
 *   daily   -> today at H:M if still future, else following days
 *   weekly  -> next matching weekday at H:M
 *
 * Returns a Date (UTC instant). Falls back to a +1h advance if the cron is not
 * one of our canonical shapes (defensive; the runner also guards on this).
 */
export function nextRunAt(cron: string, timezone: string, after: Date): Date {
  const spec = cronToCadence(cron);
  const tz = timezone || 'America/New_York';
  if (!spec) {
    // Unknown cron: never silently fire on a guess -- push an hour out so the
    // caller/runner has a chance to disable it. (Runner treats unknown cron as a
    // disable condition.)
    return new Date(after.getTime() + 3600_000);
  }

  // Start from the wall clock one second after `after` (strictly-after semantics
  // are enforced by the > comparison below; we begin scanning from `after`'s day).
  const base = wallClockInZone(after, tz);

  const tryBuild = (y: number, mo: number, d: number, h: number, mi: number): Date =>
    zonedWallClockToUtc(y, mo, d, h, mi, tz);

  if (spec.cadence === 'hourly') {
    // Candidate this hour at minute M; if not strictly after, advance hours.
    for (let addHours = 0; addHours <= 48; addHours++) {
      // Build "base day/hour + addHours" then set minute M. To advance hours
      // safely across day boundaries we lean on a UTC scratch date in tz wall
      // clock: construct from base wall clock, add hours, re-read.
      const scratch = tryBuild(base.year, base.month, base.day, base.hour, spec.minute);
      const candWall = wallClockInZone(new Date(scratch.getTime() + addHours * 3600_000), tz);
      const cand = tryBuild(candWall.year, candWall.month, candWall.day, candWall.hour, spec.minute);
      if (cand.getTime() > after.getTime()) return cand;
    }
    // Exhausted (shouldn't happen): fall back.
    return new Date(after.getTime() + 3600_000);
  }

  if (spec.cadence === 'daily') {
    for (let addDays = 0; addDays <= 8; addDays++) {
      const dayWall = wallClockInZone(
        new Date(tryBuild(base.year, base.month, base.day, spec.hour, spec.minute).getTime() + addDays * 86400_000),
        tz,
      );
      const cand = tryBuild(dayWall.year, dayWall.month, dayWall.day, spec.hour, spec.minute);
      if (cand.getTime() > after.getTime()) return cand;
    }
    return new Date(after.getTime() + 86400_000);
  }

  // weekly
  for (let addDays = 0; addDays <= 14; addDays++) {
    const dayMidnight = tryBuild(base.year, base.month, base.day, spec.hour, spec.minute);
    const dayWall = wallClockInZone(new Date(dayMidnight.getTime() + addDays * 86400_000), tz);
    if (dayWall.weekday !== spec.weekday) continue;
    const cand = tryBuild(dayWall.year, dayWall.month, dayWall.day, spec.hour, spec.minute);
    if (cand.getTime() > after.getTime()) return cand;
  }
  return new Date(after.getTime() + 7 * 86400_000);
}
