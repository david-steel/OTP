/**
 * meeting-sections.ts -- the section vocabulary for custom meeting formats.
 *
 * A meeting FORMAT is an ordered list of SECTIONS. Each section has a type (what
 * it does), a title, a timebox, and facilitator notes. Some types are
 * "data-linked": when the runner executes them it can surface the org's live
 * scorecard / rocks / issues / to-dos. Others are plain facilitation blocks.
 *
 * Pure + DB-free so the builder, the runner, and the API all validate against
 * one source of truth, and normalizeStructure is unit-tested without a DB.
 */

export interface MeetingSectionType {
  key: string;
  label: string;
  description: string;
  /** When true, the runner can embed/deep-link the org's live data for this section. */
  dataLinked: boolean;
  defaultMinutes: number;
}

export const MEETING_SECTION_TYPES: MeetingSectionType[] = [
  { key: 'segue',     label: 'Check-in / Segue',          description: 'Personal and business good news to open the meeting.', dataLinked: false, defaultMinutes: 5 },
  { key: 'scorecard', label: 'Scorecard review',          description: 'Walk the KPIs against goal; flag anything off-track to Issues.', dataLinked: true,  defaultMinutes: 5 },
  { key: 'rocks',     label: 'Quarterly priorities (Rocks)', description: 'On-track / off-track on each Rock.', dataLinked: true,  defaultMinutes: 5 },
  { key: 'headlines', label: 'Headlines',                 description: 'Customer and people headlines.', dataLinked: false, defaultMinutes: 5 },
  { key: 'todos',     label: 'To-do review',              description: "Last period's to-dos: done or not done.", dataLinked: true,  defaultMinutes: 5 },
  { key: 'issues',    label: 'Issues (IDS)',              description: 'Identify, discuss, solve the most important issues.', dataLinked: true,  defaultMinutes: 30 },
  { key: 'notes',     label: 'Discussion / custom',       description: 'A free discussion block with shared notes.', dataLinked: false, defaultMinutes: 10 },
  { key: 'conclude',  label: 'Conclude',                  description: 'Recap to-dos, cascading messages, rate the meeting.', dataLinked: false, defaultMinutes: 5 },
];

const TYPE_BY_KEY = new Map(MEETING_SECTION_TYPES.map((t) => [t.key, t]));
export const SECTION_TYPE_KEYS = MEETING_SECTION_TYPES.map((t) => t.key);
export function isValidSectionType(key: unknown): boolean {
  return typeof key === 'string' && TYPE_BY_KEY.has(key);
}
export function sectionTypeLabel(key: string): string {
  return TYPE_BY_KEY.get(key)?.label || 'Section';
}

export interface MeetingSection {
  type: string;
  title: string;
  minutes: number;
  notes: string;
}

const MAX_SECTIONS = 40;
const MAX_TITLE = 120;
const MAX_NOTES = 2000;

/**
 * Validate + clean a raw structure (from the builder or the API) into a safe,
 * canonical MeetingSection[]. Drops invalid section types, clamps lengths and
 * minutes, caps the count. Never throws -- bad input degrades to a clean list.
 */
export function normalizeStructure(input: unknown): MeetingSection[] {
  if (!Array.isArray(input)) return [];
  const out: MeetingSection[] = [];
  for (const raw of input) {
    if (out.length >= MAX_SECTIONS) break;
    if (!raw || typeof raw !== 'object') continue;
    const r = raw as Record<string, unknown>;
    const type = typeof r.type === 'string' ? r.type : '';
    if (!isValidSectionType(type)) continue;
    const def = TYPE_BY_KEY.get(type)!;
    const titleRaw = typeof r.title === 'string' ? r.title.trim() : '';
    const minutesRaw = Number(r.minutes);
    const notesRaw = typeof r.notes === 'string' ? r.notes : '';
    out.push({
      type,
      title: (titleRaw || def.label).slice(0, MAX_TITLE),
      minutes: Number.isFinite(minutesRaw) && minutesRaw >= 0 ? Math.min(600, Math.round(minutesRaw)) : def.defaultMinutes,
      notes: notesRaw.slice(0, MAX_NOTES),
    });
  }
  return out;
}

/** Total timebox of a format, in minutes. */
export function totalMinutes(structure: MeetingSection[]): number {
  return structure.reduce((sum, s) => sum + (s.minutes || 0), 0);
}
