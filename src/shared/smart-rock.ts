// SMART Rock enrichment validation, shared by the rocks API (PUT /rocks/:id)
// and unit tests. The five SMART criteria are free-text answers (not booleans):
// each is the user's written response to a SMART prompt on David's SMART ROCK
// Planner form. finishLine is the "describe your finish line" answer.
// resources / obstacles are user-managed string lists.
//
// DB-free by design: nothing in this module's import chain may reach
// config/database.ts (which throws at load time without DATABASE_URL).
// Mirrors shared/milestones.ts and shared/dashboard-preferences.ts -- pure
// schema split out of the route so it is unit-testable without a DB.
import { z } from 'zod';

/**
 * The SMART enrichment object persisted to rocks.smart_data (jsonb).
 * Every field optional so a rock can carry a partial planner. .strict()
 * rejects unknown keys (stored-XSS / schema-drift guard). Arrays are capped
 * at 30 entries, each entry capped at 500 chars, to bound the jsonb size.
 */
export const smartDataSchema = z.object({
  specific: z.string().max(4000).optional(),
  measurable: z.string().max(4000).optional(),
  attainable: z.string().max(4000).optional(),
  relevant: z.string().max(4000).optional(),
  timeFramed: z.string().max(4000).optional(),
  finishLine: z.string().max(2000).optional(),
  resources: z.array(z.string().max(500)).max(30).optional(),
  obstacles: z.array(z.string().max(500)).max(30).optional(),
}).strict();

export type SmartData = z.infer<typeof smartDataSchema>;

/**
 * Is there any SMART enrichment worth showing a badge / brief for?
 * True when at least one SMART field, the finish line, or a non-empty
 * resources / obstacles list is populated. Pure -- used by views and tests.
 */
export function hasSmartData(d: SmartData | null | undefined): boolean {
  if (!d || typeof d !== 'object') return false;
  if (d.specific || d.measurable || d.attainable || d.relevant || d.timeFramed) return true;
  if (d.finishLine) return true;
  if (Array.isArray(d.resources) && d.resources.some((s) => s && s.trim())) return true;
  if (Array.isArray(d.obstacles) && d.obstacles.some((s) => s && s.trim())) return true;
  return false;
}
