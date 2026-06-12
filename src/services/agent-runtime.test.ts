// Pure-unit tests for the agent runtime's SOP execution + wallet-metering gate.
// No DB, no Anthropic. Like ask-ai.metering.test.ts, agent-runtime.ts
// transitively imports config/database.ts (via wallet.ts), which throws at load
// without DATABASE_URL -- the pool never connects unless a query runs, so a
// placeholder is safe for these pure tests.
import { describe, it, expect, beforeAll, afterEach } from 'vitest';

let buildSopRunPrompt: (sop: any) => string;
let meteringEnabled: () => boolean;

beforeAll(async () => {
  process.env.DATABASE_URL ||= 'postgres://unused:unused@127.0.0.1:5/unused';
  ({ buildSopRunPrompt, meteringEnabled } = await import('./agent-runtime.js'));
});

afterEach(() => {
  delete process.env.WALLET_METERING_ENABLED;
});

describe('buildSopRunPrompt', () => {
  it('includes title, all steps (numbered, in order), outputs, and tools', () => {
    const p = buildSopRunPrompt({
      title: 'Daily inbox triage',
      trigger: 'Every weekday at 8 AM',
      steps: ['Open the inbox', 'Sort by sender', 'Draft replies'],
      outputs: ['A triage summary', 'Drafted replies'],
      tools: ['Gmail', 'Slack'],
      notes: 'Be concise.',
    });
    expect(p).toContain('Daily inbox triage');
    expect(p).toContain('Every weekday at 8 AM');
    expect(p).toContain('1) Open the inbox');
    expect(p).toContain('2) Sort by sender');
    expect(p).toContain('3) Draft replies');
    expect(p).toContain('A triage summary; Drafted replies');
    expect(p).toContain('Gmail, Slack');
    expect(p).toContain('Be concise.');
    // Step order is preserved.
    expect(p.indexOf('1) Open the inbox')).toBeLessThan(p.indexOf('2) Sort by sender'));
    expect(p.indexOf('2) Sort by sender')).toBeLessThan(p.indexOf('3) Draft replies'));
    // Honest framing about no live tool access is always present.
    expect(p).toMatch(/do not have live tool access/i);
  });

  it('handles a minimal SOP with only a title (no steps/outputs/tools/trigger/notes)', () => {
    const p = buildSopRunPrompt({ title: 'Just a title' });
    expect(p).toContain('Just a title');
    expect(p).not.toContain('Trigger:');
    expect(p).not.toContain('Produce these outputs:');
    expect(p).not.toContain('Tools you may use:');
    expect(p).not.toContain('Work through these steps');
    // Still asks for the work-product.
    expect(p).toMatch(/Execute this Standard Operating Procedure/i);
  });

  it('falls back to a placeholder title and ignores blank/whitespace fields', () => {
    const p = buildSopRunPrompt({ title: '   ', steps: ['', '   ', 'Real step'], outputs: [], tools: [''] });
    expect(p).toContain('Untitled process');
    expect(p).toContain('1) Real step');
    expect(p).not.toContain('Produce these outputs:');
    expect(p).not.toContain('Tools you may use:');
  });
});

describe('agent-runtime wallet-metering gate (default OFF -> free runs)', () => {
  it('is OFF when the env flag is unset (agent runs stay free, no metering)', () => {
    delete process.env.WALLET_METERING_ENABLED;
    expect(meteringEnabled()).toBe(false);
  });

  it('is OFF for falsy / unrecognized values', () => {
    for (const v of ['', '0', 'false', 'no', 'off', 'maybe']) {
      process.env.WALLET_METERING_ENABLED = v;
      expect(meteringEnabled()).toBe(false);
    }
  });

  it('is ON only for explicit truthy values', () => {
    for (const v of ['1', 'true', 'yes', 'on']) {
      process.env.WALLET_METERING_ENABLED = v;
      expect(meteringEnabled()).toBe(true);
    }
  });
});
