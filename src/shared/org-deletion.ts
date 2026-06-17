/**
 * Organization deletion timing -- PURE logic, no DB import (unit-testable).
 *
 * Two-phase hard delete: an org is soft-deleted (deletionRequestedAt set),
 * restorable for DELETION_GRACE_DAYS, then permanently purged.
 */

export const DELETION_GRACE_DAYS = 7;

const DAY_MS = 24 * 60 * 60 * 1000;

/** A deletion requested at or before this instant is past its grace window. */
export function purgeCutoff(now: Date = new Date(), graceDays: number = DELETION_GRACE_DAYS): Date {
  return new Date(now.getTime() - graceDays * DAY_MS);
}

/** True once the grace window has elapsed and the org should be purged. */
export function isPurgeDue(
  deletionRequestedAt: Date | string | null | undefined,
  now: Date = new Date(),
  graceDays: number = DELETION_GRACE_DAYS,
): boolean {
  if (!deletionRequestedAt) return false;
  return new Date(deletionRequestedAt).getTime() <= now.getTime() - graceDays * DAY_MS;
}

/** Whole days remaining before purge (0 = due now). null if not pending delete. */
export function daysUntilPurge(
  deletionRequestedAt: Date | string | null | undefined,
  now: Date = new Date(),
  graceDays: number = DELETION_GRACE_DAYS,
): number | null {
  if (!deletionRequestedAt) return null;
  const purgeAt = new Date(deletionRequestedAt).getTime() + graceDays * DAY_MS;
  return Math.max(0, Math.ceil((purgeAt - now.getTime()) / DAY_MS));
}
