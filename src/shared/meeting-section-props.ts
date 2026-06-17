/**
 * meeting-section-props.ts -- the props contract for the shared meeting-section
 * partials (`src/views/partials/meeting/<type>.ejs`).
 *
 * Inc 1 of the meeting-runner convergence (see docs/meeting-runner-convergence.md).
 * The section partials were extracted verbatim from l8-leadership.ejs, so each
 * one references a fixed set of EJS render locals. EJS includes do NOT inherit
 * the parent template's ad-hoc `<% var %>` scope -- they only see the locals
 * passed to the include -- so any runner that renders these partials MUST supply
 * exactly the locals listed here, or the partial throws "x is not defined" at
 * render time (compile-clean but undefined-at-runtime). This file is the single
 * source of truth for that contract, shared by the built-in runner
 * (l8-leadership, Inc 5) and the gated custom runner (meeting-run, Inc 2).
 *
 * Pure + DB-free (mirrors meeting-sections.ts) so it is unit-testable and
 * importable from routes and tests without a database.
 *
 * Derived locals (NOT passed by the route, computed here so both runners agree):
 *   - normalizedAttendees: required by `segue` and `conclude`. Pure function of
 *     meeting.attendees. (humanAttendees + savedRatings derive from it INSIDE
 *     conclude.ejs, so they are not part of this contract.)
 *   - rocks' `_rockChanges` / `_rockBaseline` / `_rockMs` aliases are declared
 *     INSIDE rocks.ejs with typeof guards -- not part of this contract.
 */

import type { MeetingSection } from './meeting-sections.js';

/** The eight section type keys (meeting-sections.ts vocabulary). */
export type SectionTypeKey =
  | 'segue' | 'scorecard' | 'rocks' | 'headlines'
  | 'todos' | 'issues' | 'notes' | 'conclude';

/**
 * Which render locals each built-in section partial references. Verified by
 * identifier scan against the verbatim extracts (2026-06-17). 'normalized-
 * Attendees' is a DERIVED local (see normalizeAttendees below); everything else
 * is a route-resolved render local.
 *
 * 'notes' has no built-in partial -- it is the custom-only discussion block,
 * rendered generically by the custom runner (folded into the partial set in
 * Inc 2). Listed here for completeness with an empty contract.
 */
export const SECTION_REQUIRED_LOCALS: Record<SectionTypeKey, string[]> = {
  segue:     ['meeting', 'normalizedAttendees'],
  scorecard: ['meeting', 'org', 'scorecard', 'availableOwners'],
  rocks:     ['meeting', 'rocks', 'rockMilestones', 'rockChanges', 'rockBaseline',
              'rocksFilter', 'hiddenRocksCount', 'executionItems', 'availableOwners',
              'orgTeams', 'todos', 'devOrgIdParam'],
  headlines: ['meeting', 'headlineItems'],
  todos:     ['meeting', 'todos', 'availableOwners', 'renderDescription'],
  issues:    ['meeting', 'issues', 'availableOwners', 'orgTeams'],
  notes:     [],
  conclude:  ['meeting', 'normalizedAttendees', 'issues', 'todos'],
};

/** Section types whose contract requires the route to resolve LIVE org data
 * (KPIs / rocks / issues / todos) before rendering. The custom runner currently
 * deep-links these; Inc 2 makes it resolve + pass them so the partial embeds the
 * real component. Mirrors `dataLinked` in meeting-sections.ts. */
export const DATA_LINKED_SECTIONS: SectionTypeKey[] = ['scorecard', 'rocks', 'todos', 'issues'];

/** Path (relative to a page in src/views/pages) to a section partial. Returns
 * null for 'notes' (no dedicated built-in partial; rendered generically). */
export function sectionPartialPath(typeKey: string): string | null {
  if (typeKey === 'notes') return null;
  if ((SECTION_REQUIRED_LOCALS as Record<string, string[]>)[typeKey] === undefined) return null;
  return `../partials/meeting/${typeKey}`;
}

/** Minimal shape of a normalized attendee (matches l8-leadership.ejs 191-205). */
export interface NormalizedAttendee {
  entityType: string;
  externalId: string;
  name: string;
  memberId: string;
  checkinText: string;
  checkinAt: string | null;
}

/**
 * Collapse the two stored attendee shapes -- the editor shape
 * { entityType, externalId, name } and the auto-populate shape
 * { type, memberId, externalIds, name } -- into one canonical list. Verbatim
 * port of the l8-leadership.ejs preamble (lines 191-205) so the built-in and
 * custom runners produce byte-identical `normalizedAttendees`. Pure.
 */
export function normalizeAttendees(meeting: { attendees?: unknown } | null | undefined): NormalizedAttendee[] {
  const raw = (meeting && Array.isArray((meeting as any).attendees)) ? (meeting as any).attendees as any[] : [];
  return raw
    .map((a) => {
      const entityType = a.entityType || a.type;
      const externalId = a.externalId || (Array.isArray(a.externalIds) && a.externalIds[0]) || a.memberId || '';
      const name = a.name || a.externalId || '';
      return {
        entityType,
        externalId,
        name,
        memberId: a.memberId || '',
        checkinText: a.checkinText || '',
        checkinAt: a.checkinAt || null,
      } as NormalizedAttendee;
    })
    .filter((a) => !!a.externalId);
}

/** Validate that a locals object satisfies a section's contract. Returns the
 * list of MISSING local keys (empty = satisfied). Used by the runner (and tests)
 * to fail loud in dev instead of throwing a bare ReferenceError in the view. */
export function missingLocalsForSection(typeKey: string, provided: Record<string, unknown>): string[] {
  const required = (SECTION_REQUIRED_LOCALS as Record<string, string[]>)[typeKey];
  if (!required) return [];
  return required.filter((k) => !(k in provided));
}

/** Convenience: the section types this meeting's agenda will actually render,
 * deduped, in agenda order. Lets a route resolve only the data it needs. */
export function sectionTypesInAgenda(agenda: MeetingSection[]): SectionTypeKey[] {
  const seen = new Set<string>();
  const out: SectionTypeKey[] = [];
  for (const s of agenda) {
    if (!seen.has(s.type) && (s.type in SECTION_REQUIRED_LOCALS)) {
      seen.add(s.type);
      out.push(s.type as SectionTypeKey);
    }
  }
  return out;
}
