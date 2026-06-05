// Unit tests for the recurring-todo date math that drives both the POST seed
// path and the spawn-on-complete path (committed e0d2953). The DB wiring
// (template resolution, dedupe guard, insert) is not exercised here -- there is
// no test database harness in this repo yet, and prod-DB access is gated. What
// IS covered is the occurrence computation that determines WHICH date the next
// instance lands on, which is where the spec's two regressions live:
//   1. bare UI rules ("FREQ=WEEKLY") with no DTSTART must anchor to the base
//      date, or interval cadences silently drift to construction time;
//   2. the inclusive flag must distinguish seeding the first instance (returns
//      base when base is an occurrence) from spawning the next one (strictly
//      after the just-completed instance's due date).
import { describe, it, expect } from 'vitest';
import { nextOccurrence, isValidRule } from './recurrence.js';

describe('nextOccurrence — seed vs spawn boundary', () => {
  // POST seeds with inclusive=true and base=now; the anchored DTSTART makes now
  // an occurrence, so the first instance is due now.
  it('inclusive returns base itself when base is an occurrence (seed path)', () => {
    const base = new Date('2026-06-01T09:00:00.000Z');
    const got = nextOccurrence('FREQ=WEEKLY', base, true);
    expect(got?.toISOString()).toBe('2026-06-01T09:00:00.000Z');
  });

  // PUT-complete spawns with inclusive=false and base=the completed instance's
  // dueAt; the next instance must land strictly after, not on the same date.
  it('strict skips base and returns the following occurrence (spawn path)', () => {
    const base = new Date('2026-06-01T09:00:00.000Z');
    const got = nextOccurrence('FREQ=WEEKLY', base, false);
    expect(got?.toISOString()).toBe('2026-06-08T09:00:00.000Z');
  });

  it('the only difference between seed and spawn on the same input is one period', () => {
    const base = new Date('2026-06-01T09:00:00.000Z');
    const seed = nextOccurrence('FREQ=DAILY', base, true);
    const spawn = nextOccurrence('FREQ=DAILY', base, false);
    expect(seed?.toISOString()).toBe('2026-06-01T09:00:00.000Z');
    expect(spawn?.toISOString()).toBe('2026-06-02T09:00:00.000Z');
  });
});

describe('nextOccurrence — DTSTART anchoring', () => {
  // Bare UI rules carry no DTSTART. Without anchoring, rrule defaults the start
  // to construction time and interval cadences drift off their grid.
  it('anchors a bare rule to the base date', () => {
    const base = new Date('2026-03-15T14:30:00.000Z');
    const got = nextOccurrence('FREQ=WEEKLY', base, false);
    expect(got?.toISOString()).toBe('2026-03-22T14:30:00.000Z');
  });

  // When the rule DOES carry a DTSTART, anchoring must not clobber it: the
  // series stays on the rule's own grid (Thursdays 12:00Z here), independent of
  // the base's weekday/time.
  it('honors an explicit DTSTART instead of overriding it', () => {
    const rule = 'DTSTART:20260101T120000Z\nRRULE:FREQ=WEEKLY';
    const base = new Date('2026-06-03T00:00:00.000Z'); // a Wednesday at midnight
    const got = nextOccurrence(rule, base, false);
    expect(got?.toISOString()).toBe('2026-06-04T12:00:00.000Z'); // next Thu 12:00Z
  });
});

describe('nextOccurrence — exhaustion and invalid input', () => {
  // A finite series that has produced its last occurrence must not spawn again.
  it('returns null when the series is exhausted', () => {
    const base = new Date('2026-06-01T09:00:00.000Z');
    expect(nextOccurrence('FREQ=DAILY;COUNT=1', base, false)).toBeNull();
  });

  it('returns null for an unparseable rule rather than throwing', () => {
    const base = new Date('2026-06-01T09:00:00.000Z');
    expect(nextOccurrence('this is not an rrule', base, false)).toBeNull();
  });
});

describe('isValidRule', () => {
  it('accepts a bare UI rule body', () => {
    expect(isValidRule('FREQ=WEEKLY;BYDAY=MO,WE,FR')).toBe(true);
  });

  it('rejects garbage', () => {
    expect(isValidRule('not a rule')).toBe(false);
  });
});

// Regression: converting a one-off to recurring used to leave the row carrying
// BOTH a recurrence_rule and a due_at. The Daily dashboard query hides any row
// with a rule (recurrence_rule IS NULL), so the to-do silently vanished from
// the Daily view even though it still showed on /me/todos. (David, 2026-06-05.)
//
// These predicates mirror the two live filters:
//   - API list   (todos.ts):      recurrence_rule IS NULL OR due_at IS NOT NULL
//   - Daily query (dashboard.ts):  recurrence_rule IS NULL
// The invariant the fix restores: a row meant to be VISIBLE must satisfy BOTH.
// The only Daily-visible recurring shape is an instance (rule cleared, due set,
// parent -> hidden template), never a rule-bearing row.
describe('todo visibility invariant — Daily vs API filters', () => {
  type Row = { recurrenceRule: string | null; dueAt: Date | null; recurrenceParentId: string | null };
  const visibleInApiList = (r: Row) => r.recurrenceRule === null || r.dueAt !== null;
  const visibleOnDaily = (r: Row) => r.recurrenceRule === null;

  const plainOneOff: Row = { recurrenceRule: null, dueAt: new Date('2026-07-05T17:00:00Z'), recurrenceParentId: null };
  const hiddenTemplate: Row = { recurrenceRule: 'FREQ=MONTHLY', dueAt: null, recurrenceParentId: null };
  // What both the POST-recurring path and the fixed convert-to-recurring path
  // now produce as the user-facing row:
  const recurringInstance: Row = { recurrenceRule: null, dueAt: new Date('2026-07-05T17:00:00Z'), recurrenceParentId: 'template-id' };
  // The malformed row the OLD edit handler produced (the bug):
  const malformedHybrid: Row = { recurrenceRule: 'FREQ=MONTHLY', dueAt: new Date('2026-07-05T17:00:00Z'), recurrenceParentId: null };

  it('a plain one-off shows on both Daily and the API list', () => {
    expect(visibleOnDaily(plainOneOff)).toBe(true);
    expect(visibleInApiList(plainOneOff)).toBe(true);
  });

  it('the hidden template is hidden on both surfaces', () => {
    expect(visibleOnDaily(hiddenTemplate)).toBe(false);
    expect(visibleInApiList(hiddenTemplate)).toBe(false);
  });

  it('the fixed convert-to-recurring shape (instance) stays visible on Daily', () => {
    expect(visibleOnDaily(recurringInstance)).toBe(true);
    expect(visibleInApiList(recurringInstance)).toBe(true);
  });

  it('the old malformed hybrid is exactly what vanished from Daily (the bug)', () => {
    // Still in the API list (due_at set) ...
    expect(visibleInApiList(malformedHybrid)).toBe(true);
    // ... but gone from Daily. The fix must never produce this shape.
    expect(visibleOnDaily(malformedHybrid)).toBe(false);
  });
});
