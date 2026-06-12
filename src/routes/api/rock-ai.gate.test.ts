// LAUNCH GATE TEST: the PAID Rock AI assist ships OFF (coming soon). The master
// switch aiRockAssistLive() must be OFF by default and ON only for explicit
// truthy env values. This is the single branch that makes BOTH endpoints refuse
// with COMING_SOON pre-launch (mirrors ask-ai.metering.test.ts).
import { describe, it, expect, beforeAll, afterEach } from 'vitest';

let aiRockAssistLive: () => boolean;

beforeAll(async () => {
  // rock-ai.ts transitively imports config/database.ts (via wallet.ts), which
  // throws at load without DATABASE_URL. The pool never connects unless a query
  // runs, so a placeholder is safe for this pure-gate test.
  process.env.DATABASE_URL ||= 'postgres://unused:unused@127.0.0.1:5/unused';
  ({ aiRockAssistLive } = await import('./rock-ai.js'));
});

afterEach(() => {
  delete process.env.AI_ROCK_ASSIST_LIVE;
});

describe('Rock AI assist launch gate (default OFF = coming soon)', () => {
  it('is OFF when the env flag is unset (ships coming-soon)', () => {
    delete process.env.AI_ROCK_ASSIST_LIVE;
    expect(aiRockAssistLive()).toBe(false);
  });

  it('is OFF for falsy / unrecognized values', () => {
    for (const v of ['', '0', 'false', 'no', 'off', 'soon', 'maybe']) {
      process.env.AI_ROCK_ASSIST_LIVE = v;
      expect(aiRockAssistLive()).toBe(false);
    }
  });

  it('is ON only for explicit truthy values', () => {
    for (const v of ['1', 'true', 'yes', 'on']) {
      process.env.AI_ROCK_ASSIST_LIVE = v;
      expect(aiRockAssistLive()).toBe(true);
    }
  });
});
