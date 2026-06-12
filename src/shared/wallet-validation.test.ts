// Pure unit tests for the wallet Zod schemas. MONEY-SENSITIVE: integer cents,
// strict min/max, no float, no extra keys, conditional required fields.
import { describe, it, expect } from 'vitest';
import { topupSchema, autoRechargeSchema, TOPUP_MIN_CENTS, TOPUP_MAX_CENTS } from './wallet-validation.js';

describe('topupSchema', () => {
  it('accepts a valid integer-cent amount within bounds', () => {
    expect(topupSchema.safeParse({ amountCents: 2500 }).success).toBe(true);
    expect(topupSchema.safeParse({ amountCents: TOPUP_MIN_CENTS }).success).toBe(true);
    expect(topupSchema.safeParse({ amountCents: TOPUP_MAX_CENTS }).success).toBe(true);
  });
  it('rejects below min and above max', () => {
    expect(topupSchema.safeParse({ amountCents: TOPUP_MIN_CENTS - 1 }).success).toBe(false);
    expect(topupSchema.safeParse({ amountCents: TOPUP_MAX_CENTS + 1 }).success).toBe(false);
  });
  it('rejects a non-integer (float) amount', () => {
    expect(topupSchema.safeParse({ amountCents: 1000.5 }).success).toBe(false);
  });
  it('rejects missing / non-number amount', () => {
    expect(topupSchema.safeParse({}).success).toBe(false);
    expect(topupSchema.safeParse({ amountCents: '1000' }).success).toBe(false);
  });
  it('rejects extra keys (strict)', () => {
    expect(topupSchema.safeParse({ amountCents: 2500, sneaky: true }).success).toBe(false);
  });
});

describe('autoRechargeSchema', () => {
  it('accepts enabled=false with no threshold/amount', () => {
    expect(autoRechargeSchema.safeParse({ enabled: false }).success).toBe(true);
  });
  it('requires threshold + amount when enabled=true', () => {
    expect(autoRechargeSchema.safeParse({ enabled: true }).success).toBe(false);
    expect(autoRechargeSchema.safeParse({ enabled: true, thresholdCents: 1000 }).success).toBe(false);
    expect(autoRechargeSchema.safeParse({ enabled: true, thresholdCents: 1000, amountCents: 5000 }).success).toBe(true);
  });
  it('enforces integer cents + bounds on amount when enabled', () => {
    expect(autoRechargeSchema.safeParse({ enabled: true, thresholdCents: 1000, amountCents: 100 }).success).toBe(false); // below min
    expect(autoRechargeSchema.safeParse({ enabled: true, thresholdCents: 1000, amountCents: 5000.5 }).success).toBe(false); // float
  });
  it('rejects extra keys (strict)', () => {
    expect(autoRechargeSchema.safeParse({ enabled: false, x: 1 }).success).toBe(false);
  });
});
