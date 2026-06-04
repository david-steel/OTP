// Recurring-meeting deletion scope -- pure, no DB import (unit-testable).
//
// Deleting a recurring meeting asks the user a scope, like every calendar app:
//   occurrence -> just this one
//   following  -> this one and every later one in the series
//   series     -> the whole thing
//
// "following" and "series" must also END the recurrence: ensureUpcomingForOrg
// re-rolls a next occurrence whenever a series has no upcoming meeting, so any
// survivor rows must have their recurrenceRule cleared or the sweep would
// silently resurrect the series the user just deleted.

export type DeleteScope = 'occurrence' | 'following' | 'series';

export function isDeleteScope(v: unknown): v is DeleteScope {
  return v === 'occurrence' || v === 'following' || v === 'series';
}

export interface SeriesDeletionPlan {
  /** Soft-delete these meeting ids. */
  deleteIds: string[];
  /** Survivors: null out recurrenceRule so the sweep won't roll a new one. */
  clearRuleIds: string[];
}

/**
 * Decide which rows to delete and which survivors must lose their recurrence
 * rule, given the full set of non-deleted rows in a series, the occurrence the
 * user clicked, and the chosen scope.
 */
export function planSeriesDeletion(
  rows: Array<{ id: string; scheduledAt: Date | string }>,
  targetId: string,
  scope: DeleteScope,
): SeriesDeletionPlan {
  const target = rows.find((r) => r.id === targetId);

  // Occurrence (or a target we somehow can't find): just this row, series lives.
  if (scope === 'occurrence' || !target) {
    return { deleteIds: [targetId], clearRuleIds: [] };
  }

  if (scope === 'series') {
    return { deleteIds: rows.map((r) => r.id), clearRuleIds: [] };
  }

  // following: this occurrence + every later one. Earlier survivors keep their
  // data but lose the rule, so the series ends at the cut point.
  const cutoff = new Date(target.scheduledAt).getTime();
  const deleteIds: string[] = [];
  const clearRuleIds: string[] = [];
  for (const r of rows) {
    if (new Date(r.scheduledAt).getTime() >= cutoff) deleteIds.push(r.id);
    else clearRuleIds.push(r.id);
  }
  return { deleteIds, clearRuleIds };
}
