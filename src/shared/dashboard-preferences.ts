/**
 * Dashboard preference contract + pure merge logic.
 *
 * DB-free on purpose: unit tests import this module directly, and any import
 * chain that reaches config/database.ts throws at load time without
 * DATABASE_URL. The route file (routes/api/dashboard-preferences.ts) owns
 * all DB access.
 */
import { z } from 'zod';

const tileId = z.string().regex(/^[a-z0-9-]{1,40}$/);

export const dashboardPreferencesSchema = z.object({
  hiddenTiles: z.array(tileId).max(30).optional(),
  tileOrder: z.object({
    left: z.array(tileId).max(30).optional(),
    right: z.array(tileId).max(30).optional(),
  }).strict().optional(),
  fontSize: z.enum(['sm', 'base', 'lg']).optional(),
  // App-shell left sidebar collapsed state (true = 56px icon rail).
  sidebarCollapsed: z.boolean().optional(),
}).strict();

export type DashboardPreferences = z.infer<typeof dashboardPreferencesSchema>;

/**
 * Shallow-merge incoming dashboard prefs over the existing ones: only keys
 * present in `incoming` are replaced. `existing` is whatever currently sits
 * under preferences.dashboard in the jsonb column, so treat anything
 * non-object as empty.
 */
export function mergeDashboardPreferences(
  existing: unknown,
  incoming: DashboardPreferences,
): DashboardPreferences {
  const base = (existing && typeof existing === 'object' && !Array.isArray(existing))
    ? (existing as Record<string, unknown>)
    : {};
  const merged: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(incoming)) {
    if (value !== undefined) merged[key] = value;
  }
  return merged as DashboardPreferences;
}
