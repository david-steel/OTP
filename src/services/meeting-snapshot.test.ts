import { describe, it, expect } from 'vitest';
import { useScorecardSnapshot, belongsToMeetingTeam } from './meeting-snapshot.js';

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

  // Rocks intentionally have no snapshot selector: they always render live
  // (current state) regardless of meeting status. The /start rocksSnapshot is
  // a baseline for "changed this meeting", not a render source. See
  // meeting-snapshot.ts for why (2026-06-04 bug class).

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
