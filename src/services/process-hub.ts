// Process Hub -- aggregates every SOP across an org's team chart into one flat,
// searchable list. The chart/OOS graph is the SINGLE SOURCE OF TRUTH: this
// service only READS the TeamGraph (built by team-graph.ts) and never persists
// anything of its own. Writes go through the existing PATCH /api/v1/team/entity
// route (mutate the owning seat's sops[] and PATCH it back), exactly like the
// /dashboard/team chart edit panel.
//
// SOPs live embedded per-seat in node.properties.sops. An agent also inherits
// its escalation parent's SOPs at runtime (see buildAgentContext in
// team-graph.ts ~337). For the hub we keep v1 simple: each SOP is listed on its
// OWNING seat (own SOPs only), and we surface "who inherits this" as a derived
// note so users understand the propagation without seeing the same SOP twice.

import type { TeamGraph, TeamNode } from './team-graph.js';

export interface HubSop {
  id?: string;
  title: string;
  trigger?: string;
  steps?: string[];
  outputs?: string[];
  tools?: string[];
  notes?: string;
}

export interface HubSopEntry {
  seatExternalId: string;
  seatName: string;
  seatRole: string;
  seatType: 'human' | 'agent';
  sop: HubSop;
  /**
   * False for v1 -- every entry here is a seat's OWN sop. Kept on the shape so
   * the page/template can stay forward-compatible if we later choose to also
   * list inherited copies. De-dupe logic below relies on this staying own-only.
   */
  inherited: boolean;
  /**
   * Names of agent seats that inherit this SOP from this seat via escalates_to.
   * Empty when nobody inherits. Derived, read-only -- a UX note, not a 2nd copy.
   */
  inheritedBy: string[];
  /** Stable index within the owning seat's sops[] array (for edit/delete). */
  sopIndex: number;
}

function nodeName(n: TeamNode): string {
  return String(n.label || n.externalId || '');
}
function nodeRole(n: TeamNode): string {
  const r = (n.properties as any)?.role;
  return r ? String(r) : '';
}
function nodeSops(n: TeamNode): HubSop[] {
  const s = (n.properties as any)?.sops;
  return Array.isArray(s) ? (s as HubSop[]) : [];
}

/**
 * Flatten a TeamGraph into one list of every SOP across every human/agent seat.
 * Seats with no sops contribute nothing. The organization node is skipped.
 *
 * Inheritance: for each agent we record which parent (escalates_to) it inherits
 * from, then annotate each parent SOP entry with the list of inheriting agent
 * names. We do NOT emit a separate inherited copy -- the SOP shows once on its
 * owner with an "inherited by" note. This matches the runtime inheritance in
 * buildAgentContext (immediate escalation parent only) without double-listing.
 */
export function aggregateSops(graph: TeamGraph): HubSopEntry[] {
  const seats = (graph?.nodes || []).filter(
    n => n.type === 'human' || n.type === 'agent',
  );

  // Map seat externalId -> the agent names that escalate to it (immediate only).
  const inheritorsBySeat = new Map<string, string[]>();
  for (const n of seats) {
    if (n.type !== 'agent') continue;
    const parentId = (n.properties as any)?.escalatesTo;
    if (!parentId) continue;
    const list = inheritorsBySeat.get(String(parentId)) || [];
    list.push(nodeName(n));
    inheritorsBySeat.set(String(parentId), list);
  }

  const entries: HubSopEntry[] = [];
  for (const n of seats) {
    const sops = nodeSops(n);
    if (sops.length === 0) continue;
    const inheritedBy = inheritorsBySeat.get(n.externalId) || [];
    sops.forEach((sop, i) => {
      if (!sop || typeof sop !== 'object') return;
      entries.push({
        seatExternalId: n.externalId,
        seatName: nodeName(n),
        seatRole: nodeRole(n),
        seatType: n.type as 'human' | 'agent',
        sop,
        inherited: false,
        // Only meaningful for SOPs on a seat that other agents escalate to.
        inheritedBy: inheritedBy.slice(),
        sopIndex: i,
      });
    });
  }
  return entries;
}

export type ProcessFacet = 'all' | 'humans' | 'agents' | 'has-trigger' | string;

export interface ProcessFilter {
  query?: string;
  /**
   * 'all' | 'humans' | 'agents' | 'has-trigger' | a specific seat externalId.
   * Anything that isn't one of the four reserved tokens is treated as a seat
   * externalId filter.
   */
  facet?: ProcessFacet;
}

const RESERVED_FACETS = new Set(['all', 'humans', 'agents', 'has-trigger']);

function matchesQuery(entry: HubSopEntry, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  const sop = entry.sop;
  const hay: string[] = [
    sop.title || '',
    entry.seatName || '',
    entry.seatRole || '',
    sop.trigger || '',
    ...(Array.isArray(sop.tools) ? sop.tools : []),
  ];
  return hay.some(h => String(h).toLowerCase().includes(needle));
}

function matchesFacet(entry: HubSopEntry, facet: ProcessFacet | undefined): boolean {
  if (!facet || facet === 'all') return true;
  if (facet === 'humans') return entry.seatType === 'human';
  if (facet === 'agents') return entry.seatType === 'agent';
  if (facet === 'has-trigger') return !!(entry.sop.trigger && String(entry.sop.trigger).trim());
  // Anything else: treat as a specific seat externalId.
  return entry.seatExternalId === facet;
}

/**
 * Pure, unit-testable filter over an already-aggregated list. Matches the query
 * against SOP title / seat name / seat role / trigger / tool, and applies the
 * facet. Returns a new array; never mutates the input.
 */
export function filterSops(entries: HubSopEntry[], filter: ProcessFilter = {}): HubSopEntry[] {
  const q = filter.query || '';
  return (entries || []).filter(e => matchesQuery(e, q) && matchesFacet(e, filter.facet));
}

export { RESERVED_FACETS };

/**
 * Convenience: distinct list of seats that own at least one SOP, for building
 * the "by seat" facet dropdown. Sorted humans-first then alphabetical by name.
 */
export interface SeatFacet {
  externalId: string;
  name: string;
  role: string;
  type: 'human' | 'agent';
  count: number;
}

export function seatsWithSops(entries: HubSopEntry[]): SeatFacet[] {
  const by = new Map<string, SeatFacet>();
  for (const e of entries) {
    const existing = by.get(e.seatExternalId);
    if (existing) {
      existing.count += 1;
    } else {
      by.set(e.seatExternalId, {
        externalId: e.seatExternalId,
        name: e.seatName,
        role: e.seatRole,
        type: e.seatType,
        count: 1,
      });
    }
  }
  return Array.from(by.values()).sort((a, b) =>
    a.type !== b.type
      ? (a.type === 'human' ? -1 : 1)
      : a.name.localeCompare(b.name),
  );
}

/**
 * All seats (whether or not they own a SOP) for the "+ New Process" owning-seat
 * picker. Humans first, then agents, each alphabetical.
 */
export function pickableSeats(graph: TeamGraph): SeatFacet[] {
  const seats = (graph?.nodes || [])
    .filter(n => n.type === 'human' || n.type === 'agent')
    .map(n => ({
      externalId: n.externalId,
      name: nodeName(n),
      role: nodeRole(n),
      type: n.type as 'human' | 'agent',
      count: nodeSops(n).length,
    }));
  return seats.sort((a, b) =>
    a.type !== b.type
      ? (a.type === 'human' ? -1 : 1)
      : a.name.localeCompare(b.name),
  );
}
