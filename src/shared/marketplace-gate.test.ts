import { describe, it, expect } from 'vitest';
import { decideMarketplaceGate, marketplaceLiveFlag } from './marketplace-gate.js';

describe('marketplaceLiveFlag', () => {
  it('is off by default / when unset', () => {
    expect(marketplaceLiveFlag({})).toBe(false);
  });
  it('is off for any value other than the exact string "true"', () => {
    expect(marketplaceLiveFlag({ MARKETPLACE_LIVE: 'false' })).toBe(false);
    expect(marketplaceLiveFlag({ MARKETPLACE_LIVE: '1' })).toBe(false);
    expect(marketplaceLiveFlag({ MARKETPLACE_LIVE: 'TRUE' })).toBe(false);
  });
  it('is on only for "true"', () => {
    expect(marketplaceLiveFlag({ MARKETPLACE_LIVE: 'true' })).toBe(true);
  });
});

describe('decideMarketplaceGate', () => {
  it('is dormant when the master switch is off, regardless of billing', () => {
    expect(decideMarketplaceGate({ marketplaceLive: false, billingLive: true }))
      .toMatchObject({ live: false, reason: 'MARKETPLACE_OFF' });
    expect(decideMarketplaceGate({ marketplaceLive: false, billingLive: false }))
      .toMatchObject({ live: false, reason: 'MARKETPLACE_OFF' });
  });

  it('is dormant when on but billing is not live (partners cannot be paid)', () => {
    expect(decideMarketplaceGate({ marketplaceLive: true, billingLive: false }))
      .toMatchObject({ live: false, reason: 'BILLING_NOT_LIVE' });
  });

  it('is live only when the switch is on AND billing is live', () => {
    expect(decideMarketplaceGate({ marketplaceLive: true, billingLive: true }))
      .toMatchObject({ live: true, reason: 'OK' });
  });
});
