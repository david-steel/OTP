// Standard (non-Enterprise) pricing -- single source of truth.
//
// - Agent seat: $16/agent/mo (flat, every agent).
// - Priority Support: $199/mo add-on (same rate as Enterprise; single-sourced).
// - "Learning off" (Private): $99/mo to turn off cross-org learning.
// - Platform tokens: billed at 2x, drawn from the prepaid wallet. (BYOK orgs use
//   their own AI key, so platform token billing does not apply to them.)
//
// All amounts are integer cents. The 2x token multiplier is DEFINED + DISPLAYED
// here; wiring it into the live wallet-debit/metering path is a separate,
// money-reviewed follow-up.

import { SUPPORT_PRICE_CENTS, formatUsd } from './enterprise-pricing.js';

export { SUPPORT_PRICE_CENTS, formatUsd };

export const AGENT_PRICE_CENTS = 1600; // $16 / agent / month (flat)
export const PRIVATE_LEARNING_OFF_CENTS = 9900; // $99 / month -- turns off cross-org learning
export const PLATFORM_TOKEN_MULTIPLIER = 2; // platform-key token usage billed at 2x, wallet-drawn

export const STANDARD_DATA_NOTE =
  'Platform-key token usage is billed at 2x and drawn from your wallet. Bring your own key (BYOK) to use your own AI account instead.';

/** Total recurring monthly charge in cents for the standard plan. */
export function standardMonthlyCents(opts: {
  agentCount: number;
  withSupport?: boolean;
  learningOff?: boolean;
}): number {
  const agents = Math.max(0, Math.floor(Number(opts.agentCount) || 0));
  return (
    agents * AGENT_PRICE_CENTS +
    (opts.withSupport ? SUPPORT_PRICE_CENTS : 0) +
    (opts.learningOff ? PRIVATE_LEARNING_OFF_CENTS : 0)
  );
}
