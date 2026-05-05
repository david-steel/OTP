/**
 * Catalog of feature, data, and agent access toggles surfaced in the
 * admin invite form. Stored on org_invitations and copied into
 * org_members on accept (each as a JSONB Record<string, boolean>).
 *
 * Adding a toggle:
 *   1. Add the entry below.
 *   2. The invite form picks it up automatically -- no DB migration
 *      needed (JSONB stays free-form).
 *   3. Wire any new gate site to read member.featureAccess[key] etc.
 *
 * Owners and admins bypass these toggles entirely (see permissions.ts
 * canEditOrgSettings); the toggles are for managee, observer, and
 * other team-scoped roles.
 */

export interface AccessToggle {
  key: string;
  label: string;
  description: string;
  defaultOn?: boolean;   // pre-checked in the invite form
}

export const FEATURE_TOGGLES: AccessToggle[] = [
  { key: 'view_scorecard',  label: 'See the Scorecard',           description: 'Read weekly KPI values and on-track / off-track status.', defaultOn: true },
  { key: 'view_kpis',       label: 'See KPI dashboards',          description: 'Open /dashboard/kpis and per-KPI history charts.', defaultOn: true },
  { key: 'view_oos',        label: 'See published OOS files',     description: 'Read this org\'s coordination intelligence.', defaultOn: true },
  { key: 'view_rocks',      label: 'See Quarterly Rocks',         description: 'Read the rock list. Owning rocks is gated separately by role.', defaultOn: true },
  { key: 'view_todos',      label: 'See open To-Dos',             description: 'Read the to-do list across the org or assigned teams.', defaultOn: true },
  { key: 'view_issues',     label: 'See the Issues list',         description: 'Read the IDS / issues queue.', defaultOn: true },
  { key: 'run_l8',          label: 'Run L8 Meetings',             description: 'Open the L8 meeting tool. Required to start a weekly leadership meeting.', defaultOn: false },
  { key: 'run_one_on_one',  label: 'Run 1:1 Meetings',            description: 'Open the 1:1 meeting tool with their direct reports.', defaultOn: false },
];

export const DATA_TOGGLES: AccessToggle[] = [
  { key: 'view_admin_dashboard', label: 'See the admin dashboard',  description: 'Read the publisher-side dashboard (OOS, claims, network).', defaultOn: false },
  { key: 'view_team_chart',      label: 'See the org chart',         description: 'Read the accountability chart at /dashboard/team.', defaultOn: true },
  { key: 'view_partners',        label: 'See partner records',       description: 'Read partner applications and tier info.', defaultOn: false },
  { key: 'view_consultants',     label: 'See consultant ecosystem',  description: 'Read consultant profiles and workspaces.', defaultOn: false },
];

/**
 * Per-role default toggle map. The invite form uses this to pre-fill the
 * checkboxes when an admin picks a role from the dropdown. Keys are toggle
 * keys (must exist in FEATURE_TOGGLES or DATA_TOGGLES); values are the
 * default ON state.
 *
 * Owners / admins / implementers don't need toggle defaults -- they bypass
 * gates entirely (see permissions.canEditOrgSettings). The defaults below
 * shape what a manager / managee / observer / free seat sees on day one.
 */
export const ROLE_DEFAULT_TOGGLES: Record<string, Record<string, boolean>> = {
  // Full access. Pre-check everything so the form reflects "they can do
  // anything"; these roles bypass gates anyway, this is just visual.
  owner:       { view_scorecard: true, view_kpis: true, view_oos: true, view_rocks: true, view_todos: true, view_issues: true, run_l8: true,  run_one_on_one: true,
                 view_admin_dashboard: true,  view_team_chart: true, view_partners: true,  view_consultants: true },
  admin:       { view_scorecard: true, view_kpis: true, view_oos: true, view_rocks: true, view_todos: true, view_issues: true, run_l8: true,  run_one_on_one: true,
                 view_admin_dashboard: true,  view_team_chart: true, view_partners: true,  view_consultants: true },
  implementer: { view_scorecard: true, view_kpis: true, view_oos: true, view_rocks: true, view_todos: true, view_issues: true, run_l8: true,  run_one_on_one: true,
                 view_admin_dashboard: true,  view_team_chart: true, view_partners: false, view_consultants: false },

  // Manager: runs their team, can run meetings.
  manager:     { view_scorecard: true, view_kpis: true, view_oos: true, view_rocks: true, view_todos: true, view_issues: true, run_l8: true,  run_one_on_one: true,
                 view_admin_dashboard: false, view_team_chart: true, view_partners: false, view_consultants: false },

  // Managee: in the meeting, but doesn't run it.
  managee:     { view_scorecard: true, view_kpis: true, view_oos: true, view_rocks: true, view_todos: true, view_issues: true, run_l8: false, run_one_on_one: false,
                 view_admin_dashboard: false, view_team_chart: true, view_partners: false, view_consultants: false },

  // Observer: read-only across the board. No "run" toggles.
  observer:    { view_scorecard: true, view_kpis: true, view_oos: true, view_rocks: true, view_todos: true, view_issues: true, run_l8: false, run_one_on_one: false,
                 view_admin_dashboard: false, view_team_chart: true, view_partners: false, view_consultants: false },

  // Free: minimal. They can see the chart and read OOS, nothing else.
  free:        { view_scorecard: false, view_kpis: false, view_oos: true, view_rocks: false, view_todos: false, view_issues: false, run_l8: false, run_one_on_one: false,
                 view_admin_dashboard: false, view_team_chart: true, view_partners: false, view_consultants: false },

  // Inactive: chart-only. Everything off.
  inactive:    { view_scorecard: false, view_kpis: false, view_oos: false, view_rocks: false, view_todos: false, view_issues: false, run_l8: false, run_one_on_one: false,
                 view_admin_dashboard: false, view_team_chart: false, view_partners: false, view_consultants: false },

  // Legacy alias for managee.
  member:      { view_scorecard: true, view_kpis: true, view_oos: true, view_rocks: true, view_todos: true, view_issues: true, run_l8: false, run_one_on_one: false,
                 view_admin_dashboard: false, view_team_chart: true, view_partners: false, view_consultants: false },
};
