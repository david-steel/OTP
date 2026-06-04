import { describe, it, expect } from 'vitest';
import { planSeriesDeletion, isDeleteScope, stripSegueCheckins } from './meeting-series.js';

// A weekly series: anchor 6/04, then 6/11, 6/18, 6/25.
const SERIES = [
  { id: 'wk0', scheduledAt: '2026-06-04T14:00:00Z' },
  { id: 'wk1', scheduledAt: '2026-06-11T14:00:00Z' },
  { id: 'wk2', scheduledAt: '2026-06-18T14:00:00Z' },
  { id: 'wk3', scheduledAt: '2026-06-25T14:00:00Z' },
];

describe('planSeriesDeletion', () => {
  it('occurrence: deletes only the clicked one, series lives', () => {
    const p = planSeriesDeletion(SERIES, 'wk1', 'occurrence');
    expect(p.deleteIds).toEqual(['wk1']);
    expect(p.clearRuleIds).toEqual([]);
  });

  // David's case: delete THIS week, keep the following ones. Occurrence scope
  // must leave wk2/wk3 untouched and the rule intact so the series continues.
  it('occurrence on this week keeps every other occurrence', () => {
    const p = planSeriesDeletion(SERIES, 'wk1', 'occurrence');
    expect(p.deleteIds).not.toContain('wk2');
    expect(p.deleteIds).not.toContain('wk3');
  });

  it('following: deletes this + all later, clears rule on earlier survivors', () => {
    const p = planSeriesDeletion(SERIES, 'wk1', 'following');
    expect(p.deleteIds.sort()).toEqual(['wk1', 'wk2', 'wk3']);
    expect(p.clearRuleIds).toEqual(['wk0']); // survivor keeps data, loses rule
  });

  it('following from the anchor ends the whole series (no survivors)', () => {
    const p = planSeriesDeletion(SERIES, 'wk0', 'following');
    expect(p.deleteIds.sort()).toEqual(['wk0', 'wk1', 'wk2', 'wk3']);
    expect(p.clearRuleIds).toEqual([]);
  });

  it('series: deletes everything', () => {
    const p = planSeriesDeletion(SERIES, 'wk2', 'series');
    expect(p.deleteIds.sort()).toEqual(['wk0', 'wk1', 'wk2', 'wk3']);
    expect(p.clearRuleIds).toEqual([]);
  });

  it('isDeleteScope guards bad input', () => {
    expect(isDeleteScope('following')).toBe(true);
    expect(isDeleteScope('all')).toBe(false);
    expect(isDeleteScope(undefined)).toBe(false);
  });
});

describe('stripSegueCheckins (fresh segue each occurrence)', () => {
  // Regression: David 2026-06-04. A rolled recurring meeting opened with the
  // prior week's segue check-ins already filled in, because the roll copied
  // attendees verbatim. Identity must survive; check-in text must not.
  it('drops checkinText/checkinAt, keeps identity', () => {
    const out = stripSegueCheckins([
      { name: 'David Steel', memberId: 'm1', entityType: 'human', externalId: 'HUM_DAVIDSTEEL', checkinText: 'last week stuff', checkinAt: '2026-05-28T16:06:06Z' },
      { name: 'Janine', memberId: 'm2', entityType: 'human', externalId: 'HUM_JANINE', checkinText: "son's internship", checkinAt: '2026-05-28T16:08:16Z' },
    ]);
    expect(out).toEqual([
      { name: 'David Steel', memberId: 'm1', entityType: 'human', externalId: 'HUM_DAVIDSTEEL' },
      { name: 'Janine', memberId: 'm2', entityType: 'human', externalId: 'HUM_JANINE' },
    ]);
  });

  it('handles empty / non-array input', () => {
    expect(stripSegueCheckins([])).toEqual([]);
    expect(stripSegueCheckins(null)).toEqual([]);
    expect(stripSegueCheckins(undefined)).toEqual([]);
  });

  it('leaves an attendee with no check-in untouched', () => {
    expect(stripSegueCheckins([{ name: 'X', memberId: 'm3' }])).toEqual([{ name: 'X', memberId: 'm3' }]);
  });
});
