import { describe, it, expect } from 'vitest';
import { walletFloorCents, decideLiveGate } from './integration-live-gate.js';

describe('walletFloorCents', () => {
  it('defaults to $1.00 and never drops below it', () => {
    expect(walletFloorCents({})).toBe(100);
    expect(walletFloorCents({ INTEGRATION_WALLET_FLOOR_CENTS: '50' })).toBe(100); // below $1 -> clamped
    expect(walletFloorCents({ INTEGRATION_WALLET_FLOOR_CENTS: '0' })).toBe(100);
    expect(walletFloorCents({ INTEGRATION_WALLET_FLOOR_CENTS: 'abc' })).toBe(100);
  });
  it('honors a higher configured floor', () => {
    expect(walletFloorCents({ INTEGRATION_WALLET_FLOOR_CENTS: '500' })).toBe(500);
  });
});

describe('decideLiveGate', () => {
  const floor = 100;

  it('blocks when billing is not live, regardless of balance', () => {
    const d = decideLiveGate({ billingLive: false, balanceCents: 100000, floorCents: floor });
    expect(d.ok).toBe(false);
    expect(d.reason).toBe('BILLING_NOT_LIVE');
  });

  it('blocks when balance is at or below the floor (never negative)', () => {
    expect(decideLiveGate({ billingLive: true, balanceCents: 100, floorCents: floor }).reason).toBe('LOW_BALANCE');
    expect(decideLiveGate({ billingLive: true, balanceCents: 99, floorCents: floor }).reason).toBe('LOW_BALANCE');
    expect(decideLiveGate({ billingLive: true, balanceCents: 0, floorCents: floor }).reason).toBe('LOW_BALANCE');
    expect(decideLiveGate({ billingLive: true, balanceCents: 100, floorCents: floor }).ok).toBe(false);
  });

  it('allows only when billing live AND strictly above the floor', () => {
    const d = decideLiveGate({ billingLive: true, balanceCents: 101, floorCents: floor });
    expect(d.ok).toBe(true);
    expect(d.reason).toBe('OK');
  });

  it('clamps a negative/garbage balance to 0 (blocked)', () => {
    const d = decideLiveGate({ billingLive: true, balanceCents: -500, floorCents: floor });
    expect(d.balanceCents).toBe(0);
    expect(d.ok).toBe(false);
  });

  it('enforces the $1 minimum floor even if a smaller floor is passed', () => {
    // 60c balance with a (bogus) 50c floor: floor is clamped to 100, so blocked.
    const d = decideLiveGate({ billingLive: true, balanceCents: 60, floorCents: 50 });
    expect(d.floorCents).toBe(100);
    expect(d.ok).toBe(false);
  });
});
