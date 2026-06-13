// DB-free unit tests for the org_events builder. Imports nothing that reaches
// config/database.ts, so it runs without DATABASE_URL.
import { describe, it, expect } from 'vitest';
import { buildOrgEvent, isKnownTopic, ORG_EVENT_TOPICS } from './org-event-types.js';

describe('buildOrgEvent', () => {
  it('builds a normalized row from a full input', () => {
    const { row, error } = buildOrgEvent({
      orgId: 'org-1', topic: 'rock', entityType: 'rock', entityId: 'r-1', action: 'created',
      teamId: 'team-1', actorType: 'user', actorId: 'user-1', payload: { title: 'X' },
    });
    expect(error).toBeNull();
    expect(row).toEqual({
      orgId: 'org-1', topic: 'rock', teamId: 'team-1', entityType: 'rock', entityId: 'r-1',
      action: 'created', actorType: 'user', actorId: 'user-1', payload: { title: 'X' },
    });
  });

  it('defaults teamId/actorId/payload to null and actorType to system', () => {
    const { row } = buildOrgEvent({ orgId: 'o', topic: 'claim', entityType: 'claim', action: 'captured' });
    expect(row).toMatchObject({ teamId: null, actorId: null, payload: null, actorType: 'system', entityId: null });
  });

  it('rejects missing required fields with an error and null row', () => {
    expect(buildOrgEvent({ orgId: '', topic: 'rock', entityType: 'rock', action: 'created' }).error).toMatch(/orgId/);
    expect(buildOrgEvent({ orgId: 'o', topic: '' as 'rock', entityType: 'rock', action: 'created' }).error).toMatch(/topic/);
    expect(buildOrgEvent({ orgId: 'o', topic: 'rock', entityType: '', action: 'created' }).error).toMatch(/entityType/);
    expect(buildOrgEvent({ orgId: 'o', topic: 'rock', entityType: 'rock', action: '' }).error).toMatch(/action/);
    expect(buildOrgEvent({ orgId: '', topic: 'rock', entityType: 'rock', action: 'created' }).row).toBeNull();
  });

  it('trims whitespace on required fields', () => {
    const { row } = buildOrgEvent({ orgId: '  o  ', topic: 'rock', entityType: 'rock', action: '  created  ' });
    expect(row?.orgId).toBe('o');
    expect(row?.action).toBe('created');
  });

  it('truncates an over-long entityId to 120 chars (column limit)', () => {
    const long = 'x'.repeat(200);
    const { row } = buildOrgEvent({ orgId: 'o', topic: 'claim', entityType: 'claim', entityId: long, action: 'captured' });
    expect(row?.entityId).toHaveLength(120);
  });

  it('isKnownTopic recognizes the canonical topic set', () => {
    for (const t of ORG_EVENT_TOPICS) expect(isKnownTopic(t)).toBe(true);
    expect(isKnownTopic('bogus')).toBe(false);
  });
});
