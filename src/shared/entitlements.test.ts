// Pure unit tests for the entitlements chokepoint. Plan tier rank, addon
// membership, feature-flag override, free default / fail-closed.
import { describe, it, expect } from 'vitest';
import { hasEntitlement } from './entitlements.js';

describe('hasEntitlement -- plan tier', () => {
  it('grants a tier-unlocked feature at the required tier', () => {
    expect(hasEntitlement({ planTier: 'private' }, 'private_network')).toBe(true);
    expect(hasEntitlement({ planTier: 'premium' }, 'premium_support')).toBe(true);
  });
  it('grants lower-tier features to a higher tier (rank inheritance)', () => {
    // premium (rank 2) >= private_network's required rank (1).
    expect(hasEntitlement({ planTier: 'premium' }, 'private_network')).toBe(true);
  });
  it('denies a higher-tier feature to a lower tier', () => {
    expect(hasEntitlement({ planTier: 'private' }, 'premium_support')).toBe(false);
    expect(hasEntitlement({ planTier: 'free' }, 'private_network')).toBe(false);
  });
  it('treats an unknown tier as free (fail closed)', () => {
    expect(hasEntitlement({ planTier: 'galaxy-brain' }, 'private_network')).toBe(false);
  });
});

describe('hasEntitlement -- addons', () => {
  it('grants a feature present in the addons array regardless of tier', () => {
    expect(hasEntitlement({ planTier: 'free', addons: ['ai_assist'] }, 'ai_assist')).toBe(true);
  });
  it('denies a feature not in the addons array (and not tier/flag granted)', () => {
    expect(hasEntitlement({ planTier: 'free', addons: ['something_else'] }, 'ai_assist')).toBe(false);
  });
});

describe('hasEntitlement -- feature flags', () => {
  it('grants when an explicit flag is true', () => {
    expect(hasEntitlement({ planTier: 'free', featureFlags: { beta_thing: true } }, 'beta_thing')).toBe(true);
  });
  it('does NOT grant for a falsy / non-true flag value', () => {
    expect(hasEntitlement({ featureFlags: { beta_thing: false } }, 'beta_thing')).toBe(false);
    expect(hasEntitlement({ featureFlags: { beta_thing: 'true' } }, 'beta_thing')).toBe(false);
    expect(hasEntitlement({ featureFlags: { beta_thing: 1 } }, 'beta_thing')).toBe(false);
  });
});

describe('hasEntitlement -- defaults / guards', () => {
  it('free default org has no paid feature', () => {
    expect(hasEntitlement({ planTier: 'free' }, 'ai_assist')).toBe(false);
    expect(hasEntitlement({}, 'ai_assist')).toBe(false);
  });
  it('null/undefined entitlement or key fails closed', () => {
    expect(hasEntitlement(null, 'ai_assist')).toBe(false);
    expect(hasEntitlement(undefined, 'ai_assist')).toBe(false);
    expect(hasEntitlement({ planTier: 'premium' }, '')).toBe(false);
  });
});
