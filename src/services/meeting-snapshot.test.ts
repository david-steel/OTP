import { describe, it, expect } from 'vitest';
import { useScorecardSnapshot, useRockSnapshot } from './meeting-snapshot.js';

describe('meeting snapshot selection', () => {
  describe('scorecard', () => {
    it('renders live while scheduled', () => {
      expect(useScorecardSnapshot('scheduled')).toBe(false);
    });
    it('freezes once the meeting is live so KPIs read as-of start', () => {
      expect(useScorecardSnapshot('in_progress')).toBe(true);
      expect(useScorecardSnapshot('completed')).toBe(true);
    });
  });

  describe('rocks', () => {
    it('renders live while scheduled', () => {
      expect(useRockSnapshot('scheduled')).toBe(false);
    });

    // Regression: David 2026-06-04. Marking a rock On Track / Completed during
    // a LIVE meeting persisted to the DB but did not appear, because the page
    // rendered the frozen /start snapshot. Rocks MUST be live in_progress --
    // the Rock Review is where status is set.
    it('renders live during in_progress (Rock Review edits must show)', () => {
      expect(useRockSnapshot('in_progress')).toBe(false);
    });

    it('uses the snapshot only for a completed (frozen) meeting', () => {
      expect(useRockSnapshot('completed')).toBe(true);
    });
  });
});
