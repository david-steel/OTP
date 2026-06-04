import { describe, it, expect } from 'vitest';
import { useScorecardSnapshot, useRockSnapshot, belongsToMeetingTeam } from './meeting-snapshot.js';

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

  describe('belongsToMeetingTeam (cross-team leak guard)', () => {
    const LEADERSHIP = 'team-leadership';
    const AI_ARMY = 'team-ai-army';

    it('keeps an entity on its own team', () => {
      expect(belongsToMeetingTeam(LEADERSHIP, LEADERSHIP)).toBe(true);
    });

    // Regression: David 2026-06-04. The AI Army KPI "OTP -- Real signups"
    // leaked onto the Leadership L10 because the org-wide snapshot was rendered
    // unfiltered. A KPI/rock from another team must NOT appear.
    it('rejects another team’s entity', () => {
      expect(belongsToMeetingTeam(AI_ARMY, LEADERSHIP)).toBe(false);
    });

    it('an org-level meeting (no team) owns only unteamed entities', () => {
      expect(belongsToMeetingTeam(null, null)).toBe(true);
      expect(belongsToMeetingTeam(undefined, null)).toBe(true);
      expect(belongsToMeetingTeam(LEADERSHIP, null)).toBe(false);
    });

    it('a team meeting does not pick up unteamed entities', () => {
      expect(belongsToMeetingTeam(null, LEADERSHIP)).toBe(false);
    });
  });
});
