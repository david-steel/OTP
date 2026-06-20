/**
 * token-metering.ts -- centralized platform-key token billing. MONEY-SENSITIVE.
 *
 * One place that owns the "should I bill the wallet for this AI call, and how
 * much?" decision for PLATFORM-key token usage. BYOK orgs (source 'org' /
 * 'portfolio') use their own AI key and are NEVER metered here -- only
 * source === 'platform' draws from the prepaid wallet, billed at exactly the
 * standard 2x multiplier (PLATFORM_TOKEN_MULTIPLIER).
 *
 * This module reuses -- never reimplements -- the existing pricing + wallet
 * primitives:
 *   - computeDebitCents() from ai-pricing.ts (pure, ceil-to-cent, min 1).
 *   - debitWallet() / getBalanceCents() from wallet.ts (atomic, idempotent).
 *   - walletFloorCents() from integration-live-gate.ts (the shared floor).
 *
 * The metering gate mirrors agent-runtime.meteringEnabled() / ask-ai exactly so
 * callers can import the gate from one place.
 */
import { debitWallet, getBalanceCents } from './wallet.js';
import { walletFloorCents } from './integration-live-gate.js';
import { computeDebitCents } from '../shared/ai-pricing.js';
import { PLATFORM_TOKEN_MULTIPLIER } from '../shared/standard-pricing.js';

/**
 * Is wallet metering turned on? Mirrors agent-runtime.meteringEnabled() and the
 * ask-ai route gate exactly. Re-derived here so callers have one import site.
 */
export function meteringEnabled(): boolean {
  const v = process.env.WALLET_METERING_ENABLED;
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
}

/**
 * Should THIS source be metered? Only platform-key usage is billed, and only
 * when metering is on. BYOK orgs (source 'org' / 'portfolio') are never metered.
 */
export function shouldMeterPlatform(source: string): boolean {
  return meteringEnabled() && source === 'platform';
}

/**
 * Pre-flight balance check for a platform-key call. Read the org's balance and
 * report whether it clears the shared wallet floor. Callers invoke this ONLY
 * when shouldMeterPlatform() is true. `ok` = balance >= floor.
 */
export async function platformPrecheck(orgId: string): Promise<{ ok: boolean; balanceCents: number }> {
  const balanceCents = await getBalanceCents(orgId);
  return { ok: balanceCents >= walletFloorCents(), balanceCents };
}

/**
 * Debit the wallet for one platform-key AI call. Computes the cost via the
 * shared pricing helper at the 2x platform multiplier, then debits the wallet
 * idempotently. Never throws on a normal debit failure (e.g. insufficient
 * balance) -- returns the result and lets the caller log -- so an AI response is
 * never lost to a metering bug.
 *
 *   - source not 'platform' (or metering off) -> { debited: false }, no wallet touch.
 *   - otherwise -> compute cents at PLATFORM_TOKEN_MULTIPLIER, debitWallet(),
 *     return { debited: true, cents, result }.
 *   - unexpected error -> caught, logged (no PII), { debited: false }.
 */
export async function debitPlatformTokens(args: {
  orgId: string;
  source: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens?: number;
  cacheWriteTokens?: number;
  idempotencyKey: string;
  feature: string;
}): Promise<{ debited: boolean; cents?: number; result?: unknown }> {
  if (!shouldMeterPlatform(args.source)) {
    return { debited: false };
  }

  try {
    const cents = computeDebitCents(
      {
        model: args.model,
        inputTokens: args.inputTokens,
        outputTokens: args.outputTokens,
        cacheReadTokens: args.cacheReadTokens,
        cacheWriteTokens: args.cacheWriteTokens,
      },
      PLATFORM_TOKEN_MULTIPLIER,
    );

    const result = await debitWallet(args.orgId, cents, 'ai_usage', {
      idempotencyKey: args.idempotencyKey,
      metadata: {
        model: args.model,
        inputTokens: args.inputTokens,
        outputTokens: args.outputTokens,
        feature: args.feature,
        source: 'platform',
        multiplier: PLATFORM_TOKEN_MULTIPLIER,
      },
    });

    return { debited: true, cents, result };
  } catch (err) {
    // Never let a metering bug lose a served AI response. Log without PII --
    // orgId + feature only, plus the error message.
    // eslint-disable-next-line no-console
    console.error('[token-metering] debitPlatformTokens unexpected error (response already served)', {
      orgId: args.orgId,
      feature: args.feature,
      error: err instanceof Error ? err.message : String(err),
    });
    return { debited: false };
  }
}
