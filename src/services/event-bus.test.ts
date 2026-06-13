// DB-free unit tests for the org event bus (realtime sync R1). No DATABASE_URL
// needed -- event-bus.ts is pure in-process state.
import { describe, it, expect } from 'vitest';
import {
  subscribeToOrgEvents,
  publishOrgEvent,
  parseTopicFilter,
  topicMatches,
  formatOrgEventFrame,
  orgSubscriberCount,
  totalSubscriberCount,
  type OrgEventEnvelope,
} from './event-bus.js';

function env(over: Partial<OrgEventEnvelope> & { id: number; orgId: string; topic: string }): OrgEventEnvelope {
  return {
    teamId: null, entityType: 'rock', entityId: 'e1', action: 'created', at: '2026-06-13T00:00:00.000Z',
    ...over,
  };
}

describe('parseTopicFilter / topicMatches', () => {
  it('returns null (all topics) for empty input', () => {
    expect(parseTopicFilter(undefined)).toBeNull();
    expect(parseTopicFilter('')).toBeNull();
    expect(parseTopicFilter('  ,  ')).toBeNull();
  });
  it('parses a csv filter and trims', () => {
    const f = parseTopicFilter(' rock , kpi ');
    expect([...(f as Set<string>)].sort()).toEqual(['kpi', 'rock']);
  });
  it('topicMatches: null filter matches everything; set filters', () => {
    expect(topicMatches(null, 'anything')).toBe(true);
    expect(topicMatches(new Set(['rock']), 'rock')).toBe(true);
    expect(topicMatches(new Set(['rock']), 'kpi')).toBe(false);
  });
});

describe('subscribe / publish', () => {
  it('delivers an event to a matching subscriber', () => {
    const got: OrgEventEnvelope[] = [];
    const sub = subscribeToOrgEvents({ orgId: 'A', topics: null, send: (e) => got.push(e) });
    publishOrgEvent(env({ id: 1, orgId: 'A', topic: 'rock' }));
    expect(got).toHaveLength(1);
    expect(got[0].id).toBe(1);
    sub.unsubscribe();
  });

  it('TENANCY: a subscriber for org A never receives org B events', () => {
    const a: OrgEventEnvelope[] = [];
    const b: OrgEventEnvelope[] = [];
    const subA = subscribeToOrgEvents({ orgId: 'A', topics: null, send: (e) => a.push(e) });
    const subB = subscribeToOrgEvents({ orgId: 'B', topics: null, send: (e) => b.push(e) });
    publishOrgEvent(env({ id: 10, orgId: 'A', topic: 'rock' }));
    publishOrgEvent(env({ id: 11, orgId: 'B', topic: 'kpi' }));
    expect(a.map((e) => e.id)).toEqual([10]);
    expect(b.map((e) => e.id)).toEqual([11]);
    subA.unsubscribe();
    subB.unsubscribe();
  });

  it('respects a topic filter', () => {
    const got: OrgEventEnvelope[] = [];
    const sub = subscribeToOrgEvents({ orgId: 'A', topics: new Set(['kpi']), send: (e) => got.push(e) });
    publishOrgEvent(env({ id: 1, orgId: 'A', topic: 'rock' })); // filtered out
    publishOrgEvent(env({ id: 2, orgId: 'A', topic: 'kpi' }));  // delivered
    expect(got.map((e) => e.id)).toEqual([2]);
    sub.unsubscribe();
  });

  it('stops delivering after unsubscribe (idempotent)', () => {
    const got: OrgEventEnvelope[] = [];
    const sub = subscribeToOrgEvents({ orgId: 'A', topics: null, send: (e) => got.push(e) });
    sub.unsubscribe();
    sub.unsubscribe(); // no throw, no double-decrement
    publishOrgEvent(env({ id: 1, orgId: 'A', topic: 'rock' }));
    expect(got).toHaveLength(0);
  });

  it('one dead subscriber does not break the fan-out to others', () => {
    const got: OrgEventEnvelope[] = [];
    const bad = subscribeToOrgEvents({ orgId: 'A', topics: null, send: () => { throw new Error('dead socket'); } });
    const good = subscribeToOrgEvents({ orgId: 'A', topics: null, send: (e) => got.push(e) });
    expect(() => publishOrgEvent(env({ id: 1, orgId: 'A', topic: 'rock' }))).not.toThrow();
    expect(got).toHaveLength(1);
    bad.unsubscribe();
    good.unsubscribe();
  });

  it('publish to an org with no subscribers is a no-op', () => {
    expect(() => publishOrgEvent(env({ id: 1, orgId: 'EMPTY', topic: 'rock' }))).not.toThrow();
  });
});

describe('subscriber counts', () => {
  it('tracks per-org and global counts, returning to zero on unsubscribe', () => {
    const base = totalSubscriberCount();
    const s1 = subscribeToOrgEvents({ orgId: 'CNT', topics: null, send: () => {} });
    const s2 = subscribeToOrgEvents({ orgId: 'CNT', topics: null, send: () => {} });
    expect(orgSubscriberCount('CNT')).toBe(2);
    expect(totalSubscriberCount()).toBe(base + 2);
    s1.unsubscribe();
    s2.unsubscribe();
    expect(orgSubscriberCount('CNT')).toBe(0);
    expect(totalSubscriberCount()).toBe(base);
  });
});

describe('formatOrgEventFrame', () => {
  it('emits an id: line (Last-Event-ID cursor) + org-event + json data', () => {
    const frame = formatOrgEventFrame(env({ id: 7, orgId: 'A', topic: 'kpi', action: 'value_recorded' }));
    expect(frame).toMatch(/^id: 7\n/);
    expect(frame).toContain('event: org-event\n');
    const dataLine = frame.split('\n').find((l) => l.startsWith('data: '))!;
    const parsed = JSON.parse(dataLine.slice('data: '.length));
    expect(parsed).toMatchObject({ id: 7, orgId: 'A', topic: 'kpi', action: 'value_recorded' });
    expect(frame.endsWith('\n\n')).toBe(true);
  });
});
