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

// Per-row column patterns for the dashboard layout engine. Each pattern maps
// to 12-col grid spans: '12' one column, '4-8' 1/3+2/3, '8-4' 2/3+1/3,
// '6-6' half/half, '4-4-4' thirds. Column count = number of dash-separated
// segments ('12'.split('-') -> 1 column).
export const DASHBOARD_LAYOUT_PATTERNS = ['12', '4-8', '8-4', '6-6', '4-4-4'] as const;
export type DashboardLayoutPattern = (typeof DASHBOARD_LAYOUT_PATTERNS)[number];

export function patternColumnCount(pattern: DashboardLayoutPattern): number {
  return pattern.split('-').length;
}

const layoutRow = z.object({
  pattern: z.enum(DASHBOARD_LAYOUT_PATTERNS),
  // One tile-id stack per column; cells.length must match the pattern.
  cells: z.array(z.array(tileId).max(30)),
}).strict().refine(
  (row) => row.cells.length === patternColumnCount(row.pattern),
  { message: 'cells length must match the pattern column count' },
);

export const dashboardPreferencesSchema = z.object({
  hiddenTiles: z.array(tileId).max(30).optional(),
  // Legacy two-column order. Superseded by `layout` but kept valid so old
  // saved prefs (and old clients) keep working.
  tileOrder: z.object({
    left: z.array(tileId).max(30).optional(),
    right: z.array(tileId).max(30).optional(),
  }).strict().optional(),
  // Row-based layout engine: a sequence of rows, each with a column pattern
  // and a stack of tile ids per cell. When absent the view renders the
  // built-in default (and honors legacy tileOrder).
  layout: z.array(layoutRow).max(8).optional(),
  fontSize: z.enum(['sm', 'base', 'lg', 'xl', 'xxl', 'xxxl']).optional(),
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
