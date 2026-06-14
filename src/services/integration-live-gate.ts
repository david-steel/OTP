/**
 * integration-live-gate.ts -- DB/Stripe wiring for the live-activity gate.
 *
 * canRunLive(orgId) is the SINGLE function every spend path calls before doing
 * anything that could cost money (tool execution, KPI fetch). It composes:
 *   - billing live  = Stripe configured (isStripeConfigured)
 *   - wallet > floor = getBalanceCents(org) strictly above the $1 floor
 *
 * The pure decision is in shared/integration-live-gate.ts; this only supplies the
 * real lookups. NOTHING runs live until Stripe is live AND the wallet is funded.
 */
import { isStripeConfigured } from './stripe.js';
import { getBalanceCents } from './wallet.js';
import { decideLiveGate, walletFloorCents } from '../shared/integration-live-gate.js';

export type { LiveGateDecision, LiveGateReason } from '../shared/integration-live-gate.js';
export { walletFloorCents } from '../shared/integration-live-gate.js';

/** Platform billing live? The connect-time gate (no balance needed to connect). */
export function isBillingLive(): boolean {
  return isStripeConfigured();
}

/**
 * The authoritative spend gate for one org. Returns the full decision (ok +
 * reason + balance + floor + message) so callers can block AND surface why.
 * Short-circuits the balance read when billing isn't live.
 */
export async function canRunLive(orgId: string) {
  const billingLive = isStripeConfigured();
  const balanceCents = billingLive ? await getBalanceCents(orgId) : 0;
  return decideLiveGate({ billingLive, balanceCents, floorCents: walletFloorCents() });
}
