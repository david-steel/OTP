/**
 * marketplace-gate.ts -- the ONE authoritative rule for whether the marketplace
 * (partner channel) is live.
 *
 * The whole surface is dormant until two things are true:
 *   1. MARKETPLACE_LIVE === 'true'  -- the master switch (off until we have users)
 *   2. Stripe is configured         -- partners are paid via Stripe Connect, so
 *                                      no money can move without it.
 *
 * While dormant:
 *   - the public /marketplace catalog renders a coming-soon state
 *   - listing creation / submission / install endpoints fail closed
 *
 * Pure + DB-free (env in, decision out) so every branch is unit-tested without a
 * database -- mirrors integration-live-gate.ts. The DB/Stripe wiring lives in the
 * routes that consume this.
 */

export type MarketplaceGateReason = 'OK' | 'MARKETPLACE_OFF' | 'BILLING_NOT_LIVE';

export interface MarketplaceGateDecision {
  /** Catalog may render listings + accept installs. */
  live: boolean;
  reason: MarketplaceGateReason;
  /** Human-facing one-liner for the coming-soon UI / API error. */
  message: string;
}

export interface MarketplaceGateInput {
  /** MARKETPLACE_LIVE === 'true' */
  marketplaceLive: boolean;
  /** Stripe configured (isStripeConfigured()). Needed for Connect payouts. */
  billingLive: boolean;
}

/** Read the raw master switch from env. Defaults OFF unless explicitly 'true'. */
export function marketplaceLiveFlag(env: Record<string, string | undefined> = process.env): boolean {
  return env.MARKETPLACE_LIVE === 'true';
}

/**
 * The decision. Master switch first (the whole area is hidden until we flip it),
 * then billing (partners can't be paid without Stripe). Both must hold.
 */
export function decideMarketplaceGate(input: MarketplaceGateInput): MarketplaceGateDecision {
  if (!input.marketplaceLive) {
    return {
      live: false,
      reason: 'MARKETPLACE_OFF',
      message: 'The OTP Marketplace is coming soon.',
    };
  }
  if (!input.billingLive) {
    return {
      live: false,
      reason: 'BILLING_NOT_LIVE',
      message: 'The marketplace activates once billing is live.',
    };
  }
  return { live: true, reason: 'OK', message: 'Live.' };
}
