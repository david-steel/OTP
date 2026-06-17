import { describe, it, expect } from 'vitest';
import { parseFollowups, buildFollowupsUserMessage } from './meeting-followups.js';

const full = {
  summary: 'We reviewed the scorecard and committed to two fixes.',
  todos: [{ title: 'Send the proposal', owner: 'David' }, { title: 'Fix the funnel' }],
  issues: [{ title: 'CPL is climbing', description: 'Meta CPL up 30% week over week.' }],
  headlines: [{ body: 'Closed Acme', kind: 'customer' }],
};

describe('parseFollowups', () => {
  it('parses a clean JSON object', () => {
    const r = parseFollowups(JSON.stringify(full));
    expect(r.todos).toHaveLength(2);
    expect(r.todos[0].owner).toBe('David');
    expect(r.issues[0].title).toContain('CPL');
    expect(r.headlines[0].kind).toBe('customer');
  });
  it('strips a ```json code fence', () => {
    const r = parseFollowups('```json\n' + JSON.stringify(full) + '\n```');
    expect(r.summary).toContain('scorecard');
  });
  it('extracts JSON embedded in surrounding prose', () => {
    const r = parseFollowups('Here are the follow-ups:\n' + JSON.stringify(full) + '\nHope that helps.');
    expect(r.todos).toHaveLength(2);
  });
  it('applies defaults for missing arrays and headline kind', () => {
    const r = parseFollowups(JSON.stringify({ summary: 's', headlines: [{ body: 'win' }] }));
    expect(r.todos).toEqual([]);
    expect(r.issues).toEqual([]);
    expect(r.headlines[0].kind).toBe('other');
  });
  it('throws on non-JSON', () => {
    expect(() => parseFollowups('the model refused')).toThrow();
  });
  it('rejects a todo with an empty title', () => {
    expect(() => parseFollowups(JSON.stringify({ todos: [{ title: '' }] }))).toThrow();
  });
});

describe('buildFollowupsUserMessage', () => {
  it('includes title + attendees when given', () => {
    const m = buildFollowupsUserMessage({ transcript: 'hello', meetingTitle: 'L10', attendees: ['Dan', 'Kristen'] });
    expect(m).toContain('Meeting: L10');
    expect(m).toContain('Attendees: Dan, Kristen');
    expect(m).toContain('hello');
  });
  it('omits the header when no title/attendees', () => {
    const m = buildFollowupsUserMessage({ transcript: 'body only' });
    expect(m.startsWith('Transcript:')).toBe(true);
  });
});
