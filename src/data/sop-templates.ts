// Barrel for the free Process Library (/process-templates) AND the
// back-compat insert-from-template picker on /processes + /dashboard/team.
//
// This file used to define SOP_TEMPLATE_GROUPS inline. It is now a BARREL over
// ./sop-templates/* category files. It still exports SOP_TEMPLATE_GROUPS with
// the SAME shape its existing consumers depend on
// (pages.ts /processes -> templateGroups; dashboard.ts /dashboard/team ->
//  sopTemplateGroups; processes-hub.ejs + dashboard-team.ejs read the groups),
// derived from the categorized data so nothing is lost.
//
// All content is AUTHORED + ORIGINAL and BYTE-STABLE (no Date.now/randomness),
// safe to cache + diff.

import type { SopTemplate, SopSearchEntry } from './sop-templates/_types.js';
import { sopSearchText } from './sop-templates/_types.js';
import { SALES_SOPS } from './sop-templates/sales.js';
import { MARKETING_SOPS } from './sop-templates/marketing.js';
import { CUSTOMER_SUCCESS_SOPS } from './sop-templates/customer-success.js';
import { OPERATIONS_SOPS } from './sop-templates/operations.js';
import { FINANCE_SOPS } from './sop-templates/finance.js';
import { HR_PEOPLE_SOPS } from './sop-templates/hr-people.js';
import { PRODUCT_ENG_SOPS } from './sop-templates/product-eng.js';
import { IT_SECURITY_SOPS } from './sop-templates/it-security.js';
import { EXEC_FOUNDER_SOPS } from './sop-templates/exec-founder.js';
import { ADMIN_SOPS } from './sop-templates/admin.js';

export type { SopTemplate, SopSearchEntry } from './sop-templates/_types.js';
export { sopSearchText } from './sop-templates/_types.js';

// Display label + ordering for the category filter chips on /process-templates.
export const SOP_CATEGORY_LABELS: Record<string, string> = {
  'exec-founder': 'Executive & Founder',
  sales: 'Sales',
  marketing: 'Marketing',
  'customer-success': 'Customer Success',
  operations: 'Operations',
  finance: 'Finance',
  'hr-people': 'HR & People',
  'product-eng': 'Product & Engineering',
  'it-security': 'IT & Security',
  admin: 'Admin & Office',
};

export const SOP_CATEGORY_ORDER: string[] = [
  'exec-founder', 'sales', 'marketing', 'customer-success', 'operations',
  'finance', 'hr-people', 'product-eng', 'it-security', 'admin',
];

// The flat library: every SOP, concatenated in category order.
export const SOP_TEMPLATES: SopTemplate[] = [
  ...EXEC_FOUNDER_SOPS,
  ...SALES_SOPS,
  ...MARKETING_SOPS,
  ...CUSTOMER_SUCCESS_SOPS,
  ...OPERATIONS_SOPS,
  ...FINANCE_SOPS,
  ...HR_PEOPLE_SOPS,
  ...PRODUCT_ENG_SOPS,
  ...IT_SECURITY_SOPS,
  ...ADMIN_SOPS,
];

export function getSopBySlug(slug: string): SopTemplate | undefined {
  return SOP_TEMPLATES.find((s) => s.slug === slug);
}

// Slim projection per SOP, for the index cards + the embedded client search
// on /process-templates.
export function sopSearchIndex(): SopSearchEntry[] {
  return SOP_TEMPLATES.map((s) => ({
    slug: s.slug,
    title: s.title,
    shortName: s.shortName || s.title,
    description: s.description,
    category: s.category,
    stepCount: s.steps.length,
    trigger: s.trigger,
    search: sopSearchText(s),
  }));
}

// ---------------------------------------------------------------------------
// BACK-COMPAT: SOP_TEMPLATE_GROUPS
//
// The /processes hub and /dashboard/team picker consume a role-grouped array
// of the shape { role, roleId, description, templates:[{id,title,trigger,
// steps,outputs,tools,notes?}] }. We DERIVE that shape from the categorized
// library so there is a single source of truth and nothing is lost. Each
// library category becomes one group; each SOP becomes one picker template
// projected down to exactly the fields the picker uses (the picker's
// applyTemplate() reads title/trigger/steps/outputs/tools/notes by index).
// ---------------------------------------------------------------------------

export interface SOPTemplate {
  id: string;
  title: string;
  trigger?: string;
  steps?: string[];
  outputs?: string[];
  tools?: string[];
  notes?: string;
}

export interface SOPTemplateGroup {
  role: string;
  roleId: string;
  description: string;
  templates: SOPTemplate[];
}

// Human-facing group label + blurb per category, for the picker UI.
const GROUP_META: Record<string, { role: string; description: string }> = {
  'exec-founder': {
    role: 'Executive & Founder',
    description: 'Operating cadences for founders and leadership: meetings, planning, decisions, and stakeholder updates.',
  },
  sales: {
    role: 'Sales',
    description: 'Pipeline-first sales processes: prospecting, qualification, proposals, and win/loss review. No spray-and-pray.',
  },
  marketing: {
    role: 'Marketing',
    description: 'Operator-led content and demand processes: planning, distribution, SEO/GEO, and campaign launches.',
  },
  'customer-success': {
    role: 'Customer Success',
    description: 'Retention-first customer processes: health scans, QBRs, expansion, onboarding, and offboarding.',
  },
  operations: {
    role: 'Operations',
    description: 'Operational cadences: metrics reviews, vendor onboarding, incident response, and capacity planning.',
  },
  finance: {
    role: 'Finance',
    description: 'Finance processes: monthly close, invoicing, collections, approvals, and cash-flow forecasting.',
  },
  'hr-people': {
    role: 'HR & People',
    description: 'People processes: hiring, onboarding, reviews, one-on-ones, improvement plans, and offboarding.',
  },
  'product-eng': {
    role: 'Product & Engineering',
    description: 'Build processes: code review, deploys, bug triage, sprint planning, specs, and retrospectives.',
  },
  'it-security': {
    role: 'IT & Security',
    description: 'Security and IT processes: access provisioning and review, incident response, backups, and patching.',
  },
  admin: {
    role: 'Admin & Office',
    description: 'Administrative processes: inbox triage, scheduling, travel, filing, expenses, and meeting notes.',
  },
};

function toPickerTemplate(s: SopTemplate): SOPTemplate {
  const t: SOPTemplate = { id: s.id, title: s.title };
  if (s.trigger) t.trigger = s.trigger;
  if (s.steps && s.steps.length) t.steps = s.steps;
  if (s.outputs && s.outputs.length) t.outputs = s.outputs;
  if (s.tools && s.tools.length) t.tools = s.tools;
  if (s.notes) t.notes = s.notes;
  return t;
}

export const SOP_TEMPLATE_GROUPS: SOPTemplateGroup[] = SOP_CATEGORY_ORDER.map((cat) => {
  const meta = GROUP_META[cat] || { role: SOP_CATEGORY_LABELS[cat] || cat, description: '' };
  return {
    role: meta.role,
    roleId: cat.replace(/-/g, '_'),
    description: meta.description,
    templates: SOP_TEMPLATES.filter((s) => s.category === cat).map(toPickerTemplate),
  };
});
