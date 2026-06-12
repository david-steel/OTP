// Pure unit tests for AI cost computation. MONEY-SENSITIVE: rate math, markup,
// unknown-model fallback, cache multipliers, round-up >= 1.
import { describe, it, expect } from 'vitest';
import { computeDebitCents, rateForModel, MODEL_RATES, DEFAULT_MODEL_RATE, markupMultipleFromEnv } from './ai-pricing.js';

describe('rateForModel', () => {
  it('returns the exact rate for known models', () => {
    expect(rateForModel('claude-opus-4-8')).toEqual(MODEL_RATES['claude-opus-4-8']);
    expect(rateForModel('claude-sonnet-4-6')).toEqual(MODEL_RATES['claude-sonnet-4-6']);
    expect(rateForModel('claude-haiku-4-5')).toEqual(MODEL_RATES['claude-haiku-4-5']);
  });
  it('falls back to the opus-4-8 default rate for unknown / null models', () => {
    expect(rateForModel('some-future-model')).toEqual(DEFAULT_MODEL_RATE);
    expect(rateForModel(null)).toEqual(DEFAULT_MODEL_RATE);
    expect(rateForModel(undefined)).toEqual(DEFAULT_MODEL_RATE);
  });
});

describe('computeDebitCents', () => {
  it('computes raw cost x markup for opus (1M in + 1M out, 1x markup)', () => {
    // opus: 500c/MTok in, 2500c/MTok out. 1M in + 1M out = 500 + 2500 = 3000c.
    const cents = computeDebitCents({ model: 'claude-opus-4-8', inputTokens: 1_000_000, outputTokens: 1_000_000 }, 1);
    expect(cents).toBe(3000);
  });

  it('applies the markup multiple', () => {
    // Same as above x 2.0 markup = 6000c.
    const cents = computeDebitCents({ model: 'claude-opus-4-8', inputTokens: 1_000_000, outputTokens: 1_000_000 }, 2);
    expect(cents).toBe(6000);
  });

  it('rounds UP to a whole cent and never returns 0 for a billable call', () => {
    // Tiny usage -> fractional cents -> must round up to at least 1.
    const cents = computeDebitCents({ model: 'claude-haiku-4-5', inputTokens: 1, outputTokens: 1 }, 1);
    expect(cents).toBe(1);
  });

  it('uses the opus default rate for an unknown model (never under-charges)', () => {
    const unknown = computeDebitCents({ model: 'mystery-model', inputTokens: 1_000_000, outputTokens: 0 }, 1);
    const opus = computeDebitCents({ model: 'claude-opus-4-8', inputTokens: 1_000_000, outputTokens: 0 }, 1);
    expect(unknown).toBe(opus);
    expect(unknown).toBe(500);
  });

  it('prices cache reads at ~0.1x input and cache writes at ~1.25x input', () => {
    // sonnet input rate = 300c/MTok. 1M cache read = 300 * 0.1 = 30c.
    const read = computeDebitCents({ model: 'claude-sonnet-4-6', inputTokens: 0, outputTokens: 0, cacheReadTokens: 1_000_000 }, 1);
    expect(read).toBe(30);
    // 1M cache write = 300 * 1.25 = 375c.
    const write = computeDebitCents({ model: 'claude-sonnet-4-6', inputTokens: 0, outputTokens: 0, cacheWriteTokens: 1_000_000 }, 1);
    expect(write).toBe(375);
  });

  it('clamps negative / non-finite token counts to 0 (min 1 floor still applies)', () => {
    const cents = computeDebitCents({ model: 'claude-opus-4-8', inputTokens: -5, outputTokens: NaN as unknown as number }, 1);
    expect(cents).toBe(1);
  });

  it('treats a non-positive markup as 1x (never zeroes the charge)', () => {
    const cents = computeDebitCents({ model: 'claude-opus-4-8', inputTokens: 1_000_000, outputTokens: 0 }, 0);
    expect(cents).toBe(500);
  });
});

describe('markupMultipleFromEnv', () => {
  it('defaults to 2.0 when unset or invalid', () => {
    delete process.env.WALLET_AI_MARKUP_MULTIPLE;
    expect(markupMultipleFromEnv()).toBe(2.0);
    process.env.WALLET_AI_MARKUP_MULTIPLE = 'nonsense';
    expect(markupMultipleFromEnv()).toBe(2.0);
    process.env.WALLET_AI_MARKUP_MULTIPLE = '-3';
    expect(markupMultipleFromEnv()).toBe(2.0);
  });
  it('honors a valid positive override', () => {
    process.env.WALLET_AI_MARKUP_MULTIPLE = '3.5';
    expect(markupMultipleFromEnv()).toBe(3.5);
    delete process.env.WALLET_AI_MARKUP_MULTIPLE;
  });
});
