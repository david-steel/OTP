import pkg from 'rrule';
const { RRule } = pkg;

/**
 * Build an RRule from rule text, anchoring DTSTART to `fallbackStart` when the
 * rule omits one. The UI sends bare bodies (e.g. "FREQ=WEEKLY;BYDAY=MO,WE,FR")
 * with no DTSTART; without an anchor rrule defaults to construction time, which
 * makes interval-based cadences drift. Anchoring to the completed/seed date
 * keeps the series on its true grid.
 */
export function buildRule(ruleText: string, fallbackStart: Date) {
  const opts = RRule.parseString(ruleText);
  if (!opts.dtstart) opts.dtstart = fallbackStart;
  return new RRule(opts);
}

/**
 * Compute the next occurrence relative to `base`. `inclusive` returns `base`
 * itself when it is an occurrence (used to seed the first instance at/after
 * now); pass false to get the strictly-next occurrence (used when spawning the
 * follow-up from a just-completed instance whose dueAt IS an occurrence).
 * Returns null if the rule is invalid or the series is exhausted.
 */
export function nextOccurrence(ruleText: string, base: Date, inclusive: boolean): Date | null {
  try {
    return buildRule(ruleText, base).after(base, inclusive);
  } catch {
    return null;
  }
}

/** True if `ruleText` parses into a constructable RRULE. */
export function isValidRule(ruleText: string): boolean {
  try {
    buildRule(ruleText, new Date());
    return true;
  } catch {
    return false;
  }
}
