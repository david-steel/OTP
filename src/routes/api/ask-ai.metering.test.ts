// CRITICAL SAFETY TEST: Ask AI is FREE today. The wallet metering hook must be
// fully gated behind WALLET_METERING_ENABLED (default OFF). With the flag unset,
// the handler must NOT touch the wallet -- no balance check, no debit. This test
// proves the gate predicate is OFF by default and ON only for explicit truthy
// values, which is the single branch guarding every metering side effect.
import { describe, it, expect, beforeAll, afterEach } from 'vitest';

let meteringEnabled: () => boolean;

beforeAll(async () => {
  // ask-ai.ts transitively imports config/database.ts (via wallet.ts), which
  // throws at load without DATABASE_URL. The pool never connects unless a query
  // runs, so a placeholder is safe for this pure-gate test.
  process.env.DATABASE_URL ||= 'postgres://unused:unused@127.0.0.1:5/unused';
  ({ meteringEnabled } = await import('./ask-ai.js'));
});

afterEach(() => {
  delete process.env.WALLET_METERING_ENABLED;
});

describe('Ask AI wallet-metering gate (default OFF)', () => {
  it('is OFF when the env flag is unset (Ask AI stays free, no metering)', () => {
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
