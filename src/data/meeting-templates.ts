// Barrel for the meeting-template library (/templates).
// Concatenates every category file under ./meeting-templates/ into one
// MEETING_TEMPLATES array, and exposes category metadata + lookups.
// Content is authored + byte-stable; safe to cache and diff.

import type { MeetingTemplate } from './meeting-templates/_types.js';
import { templateSearchText } from './meeting-templates/_types.js';
import { EOS_TEMPLATES } from './meeting-templates/eos.js';
import { SCALING_UP_TEMPLATES } from './meeting-templates/scaling-up.js';
import { AGILE_SCRUM_TEMPLATES } from './meeting-templates/agile-scrum.js';
import { RETROSPECTIVE_TEMPLATES } from './meeting-templates/retrospectives.js';
import { ONE_ON_ONE_TEMPLATES } from './meeting-templates/one-on-ones.js';
import { PLANNING_STRATEGY_TEMPLATES } from './meeting-templates/planning-strategy.js';
import { TEAM_OPERATIONS_TEMPLATES } from './meeting-templates/team-operations.js';
import { CUSTOMER_EXTERNAL_TEMPLATES } from './meeting-templates/customer-external.js';
import { INNOVATION_TEMPLATES } from './meeting-templates/innovation-facilitation.js';
import { PINNACLE_TEMPLATES } from './meeting-templates/pinnacle.js';
import { AOS_TEMPLATES } from './meeting-templates/aos.js';
import { OKR_TEMPLATES } from './meeting-templates/okr.js';
import { METRONOMICS_TEMPLATES } from './meeting-templates/metronomics.js';
import { FOUR_DX_TEMPLATES } from './meeting-templates/four-dx.js';
import { HOLACRACY_TEMPLATES } from './meeting-templates/holacracy.js';
import { HOSHIN_LEAN_TEMPLATES } from './meeting-templates/hoshin-lean.js';
import { V2MOM_OGSM_TEMPLATES } from './meeting-templates/v2mom-ogsm.js';
import { BALANCED_SCORECARD_TEMPLATES } from './meeting-templates/balanced-scorecard.js';

export type { MeetingTemplate, TemplateStep } from './meeting-templates/_types.js';
export { templateSearchText } from './meeting-templates/_types.js';

// Display label + ordering for the category filter chips on /templates.
export const CATEGORY_LABELS: Record<string, string> = {
  eos: 'EOS',
  'scaling-up': 'Scaling Up',
  pinnacle: 'Pinnacle',
  aos: 'Accelerate (AOS)',
  metronomics: 'Metronomics',
  okr: 'OKR',
  '4dx': '4DX',
  agile: 'Agile / Scrum',
  holacracy: 'Holacracy',
  hoshin: 'Hoshin Kanri / Lean',
  'v2mom-ogsm': 'V2MOM & OGSM',
  'balanced-scorecard': 'Balanced Scorecard',
  planning: 'Planning & Strategy',
  'one-on-ones': '1:1s & People',
  'team-ops': 'Team Operations',
  retrospectives: 'Retrospectives',
  customer: 'Customer & External',
  innovation: 'Innovation & Facilitation',
};

export const CATEGORY_ORDER: string[] = [
  'eos', 'scaling-up', 'pinnacle', 'aos', 'metronomics', 'okr', '4dx',
  'agile', 'holacracy', 'hoshin', 'v2mom-ogsm', 'balanced-scorecard',
  'planning', 'one-on-ones', 'team-ops', 'retrospectives', 'customer', 'innovation',
];

export const MEETING_TEMPLATES: MeetingTemplate[] = [
  ...EOS_TEMPLATES,
  ...SCALING_UP_TEMPLATES,
  ...PINNACLE_TEMPLATES,
  ...AOS_TEMPLATES,
  ...METRONOMICS_TEMPLATES,
  ...OKR_TEMPLATES,
  ...FOUR_DX_TEMPLATES,
  ...AGILE_SCRUM_TEMPLATES,
  ...HOLACRACY_TEMPLATES,
  ...HOSHIN_LEAN_TEMPLATES,
  ...V2MOM_OGSM_TEMPLATES,
  ...BALANCED_SCORECARD_TEMPLATES,
  ...PLANNING_STRATEGY_TEMPLATES,
  ...ONE_ON_ONE_TEMPLATES,
  ...TEAM_OPERATIONS_TEMPLATES,
  ...RETROSPECTIVE_TEMPLATES,
  ...CUSTOMER_EXTERNAL_TEMPLATES,
  ...INNOVATION_TEMPLATES,
];

export function getTemplateBySlug(slug: string): MeetingTemplate | undefined {
  return MEETING_TEMPLATES.find((t) => t.slug === slug);
}

// Lowercased search blob per slug, for the client-side filter on /templates.
export function templateSearchIndex(): Array<{ slug: string; title: string; shortName: string; description: string; category: string; methodology: string; minutes: number; cadence: string; search: string }> {
  return MEETING_TEMPLATES.map((t) => ({
    slug: t.slug,
    title: t.title,
    shortName: t.shortName,
    description: t.description,
    category: t.category,
    methodology: t.methodology,
    minutes: t.minutes,
    cadence: t.cadence,
    search: templateSearchText(t),
  }));
}
