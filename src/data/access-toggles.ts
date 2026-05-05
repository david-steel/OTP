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
