// Snapshot-vs-live selection for the L8 meeting view.
//
// A meeting captures a frozen scorecard + rocks snapshot at /start. Whether the
// page renders that snapshot or live data depends on BOTH the meeting status
// and WHICH section it is:
//
//   Scorecard (KPIs): freeze once the meeting is live so the team reviews the
//   numbers as-of meeting start. Live only while still scheduled.
//
//   Rocks: do NOT freeze during a live meeting. The Rock Review segment is
//   exactly where owners set on-track/off-track and mark rocks complete, so
//   those edits must render live. Freezing them made live edits invisible
//   until a manual scorecard refresh -- David flagged 2026-06-04 that marking
//   a rock On Track / Completed mid-meeting "did not save" (it saved to the
//   rocks table fine; the page just kept rendering the /start snapshot). Only
//   a completed (frozen, read-only) meeting renders the rock snapshot, for the
//   historical record.
//
// Pure functions, no DB import -- unit-testable in isolation.

export type MeetingStatus =
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | (string & {});

export function useScorecardSnapshot(status: MeetingStatus): boolean {
  return status === 'in_progress' || status === 'completed';
}

export function useRockSnapshot(status: MeetingStatus): boolean {
  return status === 'completed';
}

// Whether a team-scoped entity (KPI or rock) belongs on a given meeting.
//
// The meeting scorecard/rocks are team-scoped, but the /start snapshot was
// historically built org-wide (buildScorecardSnapshot / buildRocksSnapshot had
// no team filter), so an older snapshot can carry other teams' rows. The L8
// page filters the snapshot through this at render so a KPI on the AI Army team
// ("OTP -- Real signups") never surfaces on the Leadership L10 -- the leak
// David flagged 2026-06-04. An org-level meeting (teamId null) owns only
// unteamed entities.
export function belongsToMeetingTeam(
  entityTeamId: string | null | undefined,
  meetingTeamId: string | null | undefined,
): boolean {
  return meetingTeamId
    ? entityTeamId === meetingTeamId
    : entityTeamId === null || entityTeamId === undefined;
}
