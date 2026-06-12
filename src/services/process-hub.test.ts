import { describe, it, expect } from 'vitest';
import {
  aggregateSops,
  filterSops,
  seatsWithSops,
  pickableSeats,
  type HubSopEntry,
} from './process-hub.js';
import type { TeamGraph, TeamNode } from './team-graph.js';

// ---- Fixtures ----------------------------------------------------------

function node(
  externalId: string,
  type: 'human' | 'agent' | 'organization',
  label: string,
  props: Record<string, unknown> = {},
): TeamNode {
  return { id: externalId, externalId, type, label, properties: props };
}

function graph(nodes: TeamNode[]): TeamGraph {
  return {
    nodes,
    edges: [],
    oosFileId: 'f1',
    oosStatus: 'draft',
    oosVersion: 1,
    hasDraft: true,
    hasPublished: false,
  };
}

const SAMPLE = graph([
  node('ORG', 'organization', 'Acme'),
  node('HUM_DAVID', 'human', 'David Steel', {
    role: 'CEO',
    sops: [
      { title: 'Weekly L8', trigger: 'Tuesday 9am', steps: ['Segue', 'Scorecard'], tools: ['Scorecard sheet'] },
      { title: 'Monthly stakeholder update', steps: ['Pull revenue'] },
    ],
  }),
  // Agent that escalates to David -> inherits his SOPs at runtime.
  node('AGT_RADAR', 'agent', 'Radar', {
    role: 'Chief of Staff',
    escalatesTo: 'HUM_DAVID',
    sops: [
      { title: 'Morning briefing', trigger: 'Every weekday 7am', tools: ['Slack', 'Google Calendar'] },
    ],
  }),
  // Agent with NO sops -> contributes nothing.
  node('AGT_DASH', 'agent', 'Dash', { role: 'Analyst', escalatesTo: 'HUM_DAVID', sops: [] }),
  // Human with no sops key at all -> contributes nothing.
  node('HUM_JANINE', 'human', 'Janine', { role: 'Accounting' }),
]);

// ---- aggregateSops -----------------------------------------------------

describe('aggregateSops', () => {
  it('flattens every SOP across human and agent seats', () => {
    const out = aggregateSops(SAMPLE);
    expect(out).toHaveLength(3); // 2 David + 1 Radar
    const titles = out.map(e => e.sop.title).sort();
    expect(titles).toEqual(['Monthly stakeholder update', 'Morning briefing', 'Weekly L8']);
  });

  it('tags seat type, name, role, and a stable sopIndex', () => {
    const out = aggregateSops(SAMPLE);
    const radar = out.find(e => e.seatExternalId === 'AGT_RADAR')!;
    expect(radar.seatType).toBe('agent');
    expect(radar.seatName).toBe('Radar');
    expect(radar.seatRole).toBe('Chief of Staff');
    expect(radar.sopIndex).toBe(0);

    const davidSops = out.filter(e => e.seatExternalId === 'HUM_DAVID');
    expect(davidSops.map(e => e.sopIndex).sort()).toEqual([0, 1]);
    expect(davidSops.every(e => e.seatType === 'human')).toBe(true);
  });

  it('annotates owning-seat SOPs with the agents that inherit them', () => {
    const out = aggregateSops(SAMPLE);
    // David's seat is escalated-to by Radar AND Dash -> both inherit.
    const david = out.filter(e => e.seatExternalId === 'HUM_DAVID');
    expect(david.length).toBeGreaterThan(0);
    for (const e of david) {
      expect(e.inheritedBy.sort()).toEqual(['Dash', 'Radar']);
    }
    // Radar inherits, but nobody escalates to Radar -> empty inheritedBy.
    const radar = out.find(e => e.seatExternalId === 'AGT_RADAR')!;
    expect(radar.inheritedBy).toEqual([]);
  });

  it('marks all aggregated entries as own (not inherited copies)', () => {
    const out = aggregateSops(SAMPLE);
    expect(out.every(e => e.inherited === false)).toBe(true);
  });

  it('produces nothing for seats with empty or missing sops', () => {
    const out = aggregateSops(SAMPLE);
    expect(out.some(e => e.seatExternalId === 'AGT_DASH')).toBe(false);
    expect(out.some(e => e.seatExternalId === 'HUM_JANINE')).toBe(false);
    expect(out.some(e => e.seatExternalId === 'ORG')).toBe(false);
  });

  it('returns an empty list for an empty graph', () => {
    expect(aggregateSops(graph([node('ORG', 'organization', 'Acme')]))).toEqual([]);
    expect(aggregateSops(graph([]))).toEqual([]);
  });
});

// ---- filterSops --------------------------------------------------------

describe('filterSops', () => {
  const entries = aggregateSops(SAMPLE);

  it('returns all entries with no filter', () => {
    expect(filterSops(entries)).toHaveLength(3);
    expect(filterSops(entries, { facet: 'all' })).toHaveLength(3);
  });

  it('matches the query against the SOP title', () => {
    const out = filterSops(entries, { query: 'briefing' });
    expect(out).toHaveLength(1);
    expect(out[0].sop.title).toBe('Morning briefing');
  });

  it('matches the query against the seat name', () => {
    const out = filterSops(entries, { query: 'david' });
    expect(out).toHaveLength(2);
    expect(out.every(e => e.seatExternalId === 'HUM_DAVID')).toBe(true);
  });

  it('matches the query against the trigger', () => {
    const out = filterSops(entries, { query: 'tuesday' });
    expect(out).toHaveLength(1);
    expect(out[0].sop.title).toBe('Weekly L8');
  });

  it('matches the query against a tool', () => {
    const out = filterSops(entries, { query: 'slack' });
    expect(out).toHaveLength(1);
    expect(out[0].seatExternalId).toBe('AGT_RADAR');
  });

  it('query is case-insensitive', () => {
    expect(filterSops(entries, { query: 'BRIEFING' })).toHaveLength(1);
  });

  it('facet humans returns only human-owned SOPs', () => {
    const out = filterSops(entries, { facet: 'humans' });
    expect(out).toHaveLength(2);
    expect(out.every(e => e.seatType === 'human')).toBe(true);
  });

  it('facet agents returns only agent-owned SOPs', () => {
    const out = filterSops(entries, { facet: 'agents' });
    expect(out).toHaveLength(1);
    expect(out[0].seatType).toBe('agent');
  });

  it('facet has-trigger returns only SOPs with a trigger', () => {
    const out = filterSops(entries, { facet: 'has-trigger' });
    // Weekly L8 (trigger) + Morning briefing (trigger); stakeholder update has none.
    expect(out).toHaveLength(2);
    expect(out.every(e => !!e.sop.trigger)).toBe(true);
  });

  it('facet of a specific seat externalId returns only that seat', () => {
    const out = filterSops(entries, { facet: 'HUM_DAVID' });
    expect(out).toHaveLength(2);
    expect(out.every(e => e.seatExternalId === 'HUM_DAVID')).toBe(true);
  });

  it('combines query and facet (AND)', () => {
    const out = filterSops(entries, { query: 'update', facet: 'humans' });
    expect(out).toHaveLength(1);
    expect(out[0].sop.title).toBe('Monthly stakeholder update');
    // Same query under the agents facet yields nothing.
    expect(filterSops(entries, { query: 'update', facet: 'agents' })).toHaveLength(0);
  });

  it('does not mutate the input array', () => {
    const before = entries.length;
    filterSops(entries, { facet: 'agents' });
    expect(entries.length).toBe(before);
  });

  it('empty input -> empty output', () => {
    expect(filterSops([] as HubSopEntry[], { query: 'x' })).toEqual([]);
  });
});

// ---- seatsWithSops / pickableSeats -------------------------------------

describe('seatsWithSops', () => {
  it('lists distinct SOP-owning seats with counts, humans first', () => {
    const out = seatsWithSops(aggregateSops(SAMPLE));
    expect(out.map(s => s.externalId)).toEqual(['HUM_DAVID', 'AGT_RADAR']);
    expect(out.find(s => s.externalId === 'HUM_DAVID')!.count).toBe(2);
    expect(out.find(s => s.externalId === 'AGT_RADAR')!.count).toBe(1);
  });
});

describe('pickableSeats', () => {
  it('includes every human/agent seat (even sop-less) for the owner picker', () => {
    const out = pickableSeats(SAMPLE);
    const ids = out.map(s => s.externalId).sort();
    expect(ids).toEqual(['AGT_DASH', 'AGT_RADAR', 'HUM_DAVID', 'HUM_JANINE']);
    // Humans sort before agents.
    expect(out[0].type).toBe('human');
    expect(out[out.length - 1].type).toBe('agent');
    // ORG node excluded.
    expect(out.some(s => s.externalId === 'ORG')).toBe(false);
  });
});
