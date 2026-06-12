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

export type { MeetingTemplate, TemplateStep } from './meeting-templates/_types.js';
export { templateSearchText } from './meeting-templates/_types.js';

// Display label + ordering for the category filter chips on /templates.
export const CATEGORY_LABELS: Record<string, string> = {
  eos: 'EOS',
  'scaling-up': 'Scaling Up',
  agile: 'Agile / Scrum',
  retrospectives: 'Retrospectives',
  'one-on-ones': '1:1s & People',
  planning: 'Planning & Strategy',
  'team-ops': 'Team Operations',
  customer: 'Customer & External',
  innovation: 'Innovation & Facilitation',
};

export const CATEGORY_ORDER: string[] = [
  'eos', 'scaling-up', 'agile', 'planning', 'one-on-ones',
  'team-ops', 'retrospectives', 'customer', 'innovation',
];

export const MEETING_TEMPLATES: MeetingTemplate[] = [
  ...EOS_TEMPLATES,
  ...SCALING_UP_TEMPLATES,
  ...AGILE_SCRUM_TEMPLATES,
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
