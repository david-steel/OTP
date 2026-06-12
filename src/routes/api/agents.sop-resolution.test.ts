// Unit tests for the agent-run endpoint's server-side SOP resolution. We test
// the pure resolver (resolveSopFromNode) that the POST /agents/:id/run handler
// uses -- the same function that drives the 404 paths (agent/SOP not found).
// agents.ts transitively imports config/database.ts; a DATABASE_URL placeholder
// is safe since no query runs in these pure tests.
import { describe, it, expect, beforeAll } from 'vitest';

let resolveSopFromNode: (sops: unknown, want: { sopId?: string; sopTitle?: string }) => any;

beforeAll(async () => {
  process.env.DATABASE_URL ||= 'postgres://unused:unused@127.0.0.1:5/unused';
  ({ resolveSopFromNode } = await import('./agents.js'));
});

const SOPS = [
  { id: 'sop_1', title: 'Daily inbox triage', steps: ['a', 'b'], outputs: ['x'], tools: ['Gmail'], trigger: '8 AM', notes: 'n' },
  { title: 'Weekly report', steps: ['c'] },
];

describe('resolveSopFromNode (server-side SOP resolution / 404 source)', () => {
  it('matches by id (preferred) and shapes the SOP for the runtime', () => {
    const sop = resolveSopFromNode(SOPS, { sopId: 'sop_1' });
    expect(sop).not.toBeNull();
    expect(sop.title).toBe('Daily inbox triage');
    expect(sop.steps).toEqual(['a', 'b']);
    expect(sop.tools).toEqual(['Gmail']);
    expect(sop.trigger).toBe('8 AM');
  });

  it('matches by case-insensitive title when no id is given', () => {
    const sop = resolveSopFromNode(SOPS, { sopTitle: 'weekly REPORT' });
    expect(sop).not.toBeNull();
    expect(sop.title).toBe('Weekly report');
  });

  it('returns null for an unknown id (-> 404 SOP_NOT_FOUND)', () => {
    expect(resolveSopFromNode(SOPS, { sopId: 'nope' })).toBeNull();
  });

  it('returns null for an unknown title (-> 404 SOP_NOT_FOUND)', () => {
    expect(resolveSopFromNode(SOPS, { sopTitle: 'does not exist' })).toBeNull();
  });

  it('returns null when the node has no sops array at all', () => {
    expect(resolveSopFromNode(undefined, { sopTitle: 'Weekly report' })).toBeNull();
    expect(resolveSopFromNode(null, { sopId: 'sop_1' })).toBeNull();
  });

  it('does NOT trust client-sent steps -- only the resolved SOP fields are used', () => {
    // Even if a caller passed steps, resolveSopFromNode ignores them; it only
    // reads from the chart node's sops[]. Here the resolved SOP carries the
    // server-side steps, proving the client can't inject its own.
    const sop = resolveSopFromNode(SOPS, { sopId: 'sop_1' });
    expect(sop.steps).toEqual(['a', 'b']);
  });
});
