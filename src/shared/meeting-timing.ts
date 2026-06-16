/**
 * Meeting timing + visibility rules -- PURE logic, no DB import.
 *
 * Kept DB-free so it is unit-testable: any module whose import chain reaches
 * config/database.ts throws at load without DATABASE_URL, so the testable
 * predicates live here and the DB service (services/meeting-lifecycle.ts)
 * imports them.
 */

/** A meeting started but never ended auto-completes this many minutes later. */
export const AUTO_END_MINUTES = 60;

/** The auto-end deadline for a meeting started at `startedAt`. */
export function computeAutoEndAt(startedAt: Date, minutes: number = AUTO_END_MINUTES): Date {
  return new Date(startedAt.getTime() + minutes * 60_000);
}

/**
 * A meeting is LOCKED (a future occurrence that should not yet be opened or
 * edited) when it is still merely scheduled AND its scheduled time is in the
 * future. It unlocks the moment ANY of David's three conditions holds:
 *   - it has been started   -> status is no longer 'scheduled'
 *   - its date has arrived  -> scheduledAt <= now
 *   - it is completed       -> status is no longer 'scheduled'
 * A cancelled meeting is never "locked" (it is just gone).
 */
export function isMeetingLocked(
  m: { status: string | null; scheduledAt: Date | string },
  now: Date = new Date(),
): boolean {
  if (m.status !== 'scheduled') return false;
  return new Date(m.scheduledAt).getTime() > now.getTime();
}

/**
 * A meeting is STALE (eligible for the 1-hour auto-end) when it is in progress
 * and has passed its auto-end deadline. A null deadline (legacy row, never
 * started) is never stale.
 */
export function isMeetingStale(
  m: { status: string | null; autoEndAt: Date | string | null },
  now: Date = new Date(),
): boolean {
  if (m.status !== 'in_progress') return false;
  if (!m.autoEndAt) return false;
  return new Date(m.autoEndAt).getTime() <= now.getTime();
}
