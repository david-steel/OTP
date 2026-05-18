// Meeting attendee matching -- pure, no-DB helper.
//
// A meeting's `attendees` jsonb array and the `team_memberships` table are
// unconnected. To grant page/edit access to a human who shows up as a meeting
// attendee, we need to decide whether a given org member matches any HUMAN
// attendee entry on a meeting.
//
// Attendee entries come in two shapes that both exist in production:
//   - Editor shape (see attendeeSchema in routes/api/meetings.ts):
//       { entityType: 'human' | 'agent', externalId: string, name?: string }
//   - Auto-populate shape (see auto-populate block in routes/api/meetings.ts):
//       { type: 'human' | 'agent', memberId?: string, externalIds?: string[],
//         name?: string, role?: string }
//
// This module imports nothing from the project on purpose -- it is a pure
// function with no side effects and throws no exceptions.

export interface AttendeeMatchMember {
  id: string;
  email?: string | null;
  displayName?: string | null;
  claimedEntityIds?: string[] | null;
}

/**
 * Returns true if `member` matches any human attendee entry on `meeting`.
 *
 * Defensive by design: missing/empty inputs, non-array `attendees`, and null
 * or non-object entries all yield a safe `false` (or are skipped) rather than
 * throwing.
 */
export function isAttendee(
  member: AttendeeMatchMember | null | undefined,
  meeting: { attendees?: unknown } | null | undefined,
): boolean {
  if (!member || !meeting) return false;

  const attendees = meeting.attendees;
  if (!Array.isArray(attendees) || attendees.length === 0) return false;

  const memberEmail =
    typeof member.email === 'string' && member.email.length > 0
      ? member.email.toLowerCase()
      : null;

  const memberDisplayName =
    typeof member.displayName === 'string' && member.displayName.length > 0
      ? member.displayName
      : null;

  const memberClaimedIds = new Set<string>();
  if (Array.isArray(member.claimedEntityIds)) {
    for (const id of member.claimedEntityIds) {
      if (typeof id === 'string' && id.length > 0) memberClaimedIds.add(id);
    }
  }

  for (const entry of attendees) {
    if (!entry || typeof entry !== 'object') continue;
    const a = entry as Record<string, unknown>;

    // Confirm the attendee is a human; skip agents and anything else.
    const isHuman = a.entityType === 'human' || a.type === 'human';
    if (!isHuman) continue;

    // 1. Direct memberId match (auto-populate shape).
    if (typeof a.memberId === 'string' && a.memberId === member.id) {
      return true;
    }

    // 2. Email match (case-insensitive) against `email` or `externalId`.
    if (memberEmail) {
      const attendeeEmail =
        typeof a.email === 'string' ? a.email.toLowerCase() : null;
      const attendeeExternalId =
        typeof a.externalId === 'string' ? a.externalId.toLowerCase() : null;
      if (
        (attendeeEmail && attendeeEmail === memberEmail) ||
        (attendeeExternalId && attendeeExternalId === memberEmail)
      ) {
        return true;
      }
    }

    // 3. Claimed-entity-id overlap. The attendee's id set is `externalId`
    //    plus every item of the `externalIds` array.
    if (memberClaimedIds.size > 0) {
      if (
        typeof a.externalId === 'string' &&
        a.externalId.length > 0 &&
        memberClaimedIds.has(a.externalId)
      ) {
        return true;
      }
      if (Array.isArray(a.externalIds)) {
        for (const id of a.externalIds) {
          if (typeof id === 'string' && id.length > 0 && memberClaimedIds.has(id)) {
            return true;
          }
        }
      }
    }

    // 4. Last-resort exact display-name match.
    if (
      memberDisplayName &&
      typeof a.name === 'string' &&
      a.name === memberDisplayName
    ) {
      return true;
    }
  }

  return false;
}
