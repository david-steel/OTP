// Milestone validation + pure helpers, shared by the milestones API, the
// dashboard/L8 views' server-side prep, and unit tests.
//
// DB-free by design: nothing in this module's import chain may reach
// config/database.ts (which throws at load time without DATABASE_URL).
// See attachments.ts / dashboard-preferences.ts for the same pattern.
import { z } from 'zod';

/**
 * A milestone due date travels as a plain calendar date string (YYYY-MM-DD),
 * matching the Postgres `date` column -- no timezone math, no midnight-UTC
 * rollback bugs. Rejects shapes like 2026-13-40 by round-tripping through
 * Date.UTC.
 */
export const milestoneDueDateSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
  .refine((s) => {
    const [y, m, d] = s.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
  }, 'Not a real calendar date');

export const createMilestoneSchema = z.object({
  title: z.string().min(1).max(255),
  dueDate: milestoneDueDateSchema.optional(),
}).strict();

export const updateMilestoneSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  // null clears the due date.
  dueDate: milestoneDueDateSchema.nullable().optional(),
  sortOrder: z.number().int().min(0).max(100_000).optional(),
}).strict().refine(
  (d) => d.title !== undefined || d.dueDate !== undefined || d.sortOrder !== undefined,
  { message: 'Provide at least one of title, dueDate, sortOrder' },
);

export const completeMilestoneSchema = z.object({
  completed: z.boolean(),
}).strict();

/** Minimal shape the pure helpers need. dueDate tolerates a Date because
 *  pg drivers vary in how they hydrate `date` columns. */
export interface MilestoneLike {
  dueDate: string | Date | null;
  completedAt: Date | string | null;
}

/**
 * Local calendar date (YYYY-MM-DD) for "today". Uses the runtime's local
 * timezone on purpose -- a milestone due "2026-06-11" should turn red when
 * June 11 ends where the viewer's server lives, not at UTC midnight.
 */
export function localDateString(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Overdue = has a due date strictly before "today" AND is not completed.
 * Plain string comparison works because both sides are YYYY-MM-DD.
 * Tolerates a Date-typed dueDate (drizzle drivers vary) by normalizing.
 */
export function isMilestoneOverdue(m: MilestoneLike, todayStr: string = localDateString()): boolean {
  if (!m.dueDate || m.completedAt) return false;
  const due = m.dueDate instanceof Date ? localDateString(m.dueDate) : String(m.dueDate).slice(0, 10);
  return due < todayStr;
}

/**
 * Progress over a milestone list: { done, total } for the "2/5" chip.
 */
export function milestoneProgress(list: ReadonlyArray<MilestoneLike>): { done: number; total: number } {
  let done = 0;
  for (const m of list) if (m.completedAt) done += 1;
  return { done, total: list.length };
}

/**
 * Next sort_order for an append. `maxExisting` is the current MAX(sort_order)
 * for the rock, or null/undefined when the rock has no milestones yet.
 */
export function nextSortOrder(maxExisting: number | null | undefined): number {
  if (maxExisting === null || maxExisting === undefined || Number.isNaN(maxExisting)) return 0;
  return Math.max(0, Math.floor(maxExisting) + 1);
}
