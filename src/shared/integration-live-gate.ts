/**
 * integration-live-gate.ts -- the ONE authoritative rule for whether an org may
 * run LIVE integration activity (anything that can spend money: a tool
 * execution or a KPI fetch through Composio).
 *
 * The rule, in one place so every spend path agrees:
 *   LIVE  iff  billing is live (Stripe configured)  AND  wallet balance is
 *              ABOVE the floor.
 *
 * The floor exists so activity stops with a BUFFER still in the wallet -- a
 * single operation costs far less than the floor, so blocking at the floor
 * guarantees the balance can never go negative. Default floor: $1.00 (100c).
 *
 * Pure + DB-free (env + numbers in, decision out) so every branch is unit-tested
 * without a database. The DB/Stripe wiring lives in services/integration-live-gate.ts.
 */

export type LiveGateReason = 'OK' | 'BILLING_NOT_LIVE' | 'LOW_BALANCE';

export interface LiveGateDecision {
  ok: boolean;
  reason: LiveGateReason;
  balanceCents: number;
  floorCents: number;
  /** Human-facing one-liner for the UI / API error. */
  message: string;
}

const DEFAULT_FLOOR_CENTS = 100; // $1.00

/**
 * The wallet floor in cents. Configurable via INTEGRATION_WALLET_FLOOR_CENTS,
 * but never below $1 -- a smaller buffer is rejected so a misconfig can't open
 * the door to a negative balance. Default $1.00.
 */
export function walletFloorCents(env: Record<string, string | undefined> = process.env): number {
  const raw = Number(env.INTEGRATION_WALLET_FLOOR_CENTS);
  if (Number.isFinite(raw) && raw >= DEFAULT_FLOOR_CENTS) return Math.floor(raw);
  return DEFAULT_FLOOR_CENTS;
}

export interface LiveGateInput {
  billingLive: boolean;
  balanceCents: number;
  floorCents: number;
}

/**
 * The decision. Billing first (the whole area is dormant until Stripe is live),
 * then the floor. STRICTLY GREATER than the floor is required, so a wallet
 * sitting exactly at the floor is already stopped.
 */
export function decideLiveGate(input: LiveGateInput): LiveGateDecision {
  const balanceCents = Math.max(0, Math.floor(input.balanceCents || 0));
  const floorCents = Math.max(DEFAULT_FLOOR_CENTS, Math.floor(input.floorCents || DEFAULT_FLOOR_CENTS));
  const base = { balanceCents, floorCents };

  if (!input.billingLive) {
    return { ok: false, reason: 'BILLING_NOT_LIVE', ...base, message: 'Integrations activate once billing is live.' };
  }
  if (!(balanceCents > floorCents)) {
    return {
      ok: false, reason: 'LOW_BALANCE', ...base,
      message: `Add funds to continue. Activity pauses at the $${(floorCents / 100).toFixed(2)} floor to protect your balance.`,
    };
  }
  return { ok: true, reason: 'OK', ...base, message: 'Live.' };
}
