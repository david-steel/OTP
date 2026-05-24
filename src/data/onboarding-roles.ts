// =====================================================================
// Onboarding role catalog + chart-placement rules
// =====================================================================
// Step 1 of the onboarding wizard asks the new user which seat they hold
// in their company. The role they pick drives where they land on the
// accountability chart and what else gets seeded with them.
//
// One place to edit when adding/renaming roles. Both the dropdown UI
// (views/pages/onboarding-profile.ejs) and the placement logic
// (services/starter-chart.ts) read from this file.

export type OnboardingRoleKey =
  | 'visionary'
  | 'integrator'
  | 'ceo_founder'
  | 'coo_president'
  | 'sales_lead'
  | 'marketing_lead'
  | 'ops_lead'
  | 'finance_lead'
  | 'tech_lead'
  | 'coach'
  | 'solo_operator'
  | 'other';

export interface OnboardingRole {
  key: OnboardingRoleKey;
  /** Dropdown label the user sees. */
  label: string;
  /** What gets written into the chart entity's `role` field. */
  chartRole: string;
  /** Integrator triggers an auto-created vacant Visionary seat above. */
  createsVisionaryAbove?: boolean;
  /** Solo Operator triggers the starter agent-army seed underneath. */
  isSolo?: boolean;
  /** Top-of-chart roles get no `reports_to` set. */
  isTopOfChart?: boolean;
}

export const ONBOARDING_ROLES: OnboardingRole[] = [
  { key: 'visionary',       label: 'Visionary',                       chartRole: 'Visionary',         isTopOfChart: true },
  { key: 'integrator',      label: 'Integrator',                      chartRole: 'Integrator',        createsVisionaryAbove: true },
  { key: 'ceo_founder',     label: 'CEO / Founder',                   chartRole: 'CEO',               isTopOfChart: true },
  { key: 'coo_president',   label: 'COO / President',                 chartRole: 'COO' },
  { key: 'sales_lead',      label: 'Sales Lead',                      chartRole: 'Sales Lead' },
  { key: 'marketing_lead',  label: 'Marketing Lead',                  chartRole: 'Marketing Lead' },
  { key: 'ops_lead',        label: 'Operations Lead',                 chartRole: 'Operations Lead' },
  { key: 'finance_lead',    label: 'Finance Lead',                    chartRole: 'Finance Lead' },
  { key: 'tech_lead',       label: 'Tech Lead',                       chartRole: 'Tech Lead' },
  { key: 'coach',           label: 'EOS® Implementer® / Coach',       chartRole: 'Coach' },
  { key: 'solo_operator',   label: 'Solo Operator (just me)',         chartRole: 'Solo Operator',     isSolo: true, isTopOfChart: true },
  { key: 'other',           label: 'Other',                           chartRole: 'Team Member' },
];

/** Empty-slot agent army seeded under a Solo Operator. User can rename or
 * delete any/all in step 5 of the wizard. */
export interface SoloAgentSlot {
  name: string;
  role: string;
  mission: string;
}

export const SOLO_AGENT_SLOTS: SoloAgentSlot[] = [
  { name: 'Chief of Staff', role: 'Chief of Staff',  mission: 'Daily briefing, calendar awareness, task orchestration.' },
  { name: 'Inbox',          role: 'Inbox Triage',    mission: 'Email triage and draft responses.' },
  { name: 'Pipeline',       role: 'Sales Pipeline',  mission: 'Pipeline health, stale-deal flags, follow-up drafts.' },
  { name: 'Customer',       role: 'Customer Success',mission: 'Customer signal synthesis, at-risk flagging.' },
  { name: 'Analyst',        role: 'Analyst',         mission: 'KPI / Scorecard data pulls, weekly briefings.' },
  { name: 'Content',        role: 'Content',         mission: 'Drafts in your voice for marketing, newsletters, social.' },
];

export function getRole(key: string): OnboardingRole | null {
  return ONBOARDING_ROLES.find((r) => r.key === key) || null;
}

export const ONBOARDING_ROLE_KEYS: OnboardingRoleKey[] = ONBOARDING_ROLES.map((r) => r.key);
