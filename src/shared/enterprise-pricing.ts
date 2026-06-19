// Enterprise plan pricing -- single source of truth.
//
// 25 agent seats at $10/seat/mo (a 25-seat floor => $250/mo base), each
// additional seat $10/mo, optional Priority Support $199/mo. The customer
// brings their own AI key (BYOK); their data is never used to train or teach.
//
// Amounts are integer cents. The Stripe-facing seat model is a single licensed
// recurring price of $10/seat with a minimum billed quantity of INCLUDED_SEATS,
// so quantity = max(agentCount, INCLUDED_SEATS). Support is a separate flat
// subscription item.

export const ENTERPRISE_CURRENCY = 'usd';
export const ENTERPRISE_INTERVAL = 'month';

export const INCLUDED_SEATS = 25;
export const SEAT_PRICE_CENTS = 1000; // $10 / seat / month
export const SUPPORT_PRICE_CENTS = 19900; // $199 / month, optional

// Stripe Price lookup_keys -- stable identifiers used to find-or-create the
// Price objects so we never hardcode environment-specific Price IDs.
export const SEAT_PRICE_LOOKUP_KEY = 'enterprise_seat_monthly_v1';
export const SUPPORT_PRICE_LOOKUP_KEY = 'enterprise_support_monthly_v1';

// What gets used to train/teach -- surfaced in plan copy + legal.
export const ENTERPRISE_DATA_COMMITMENT =
  'Customer data and prompts are never used to train or teach any model.';

/** Billed seat quantity for a given live agent count (enforces the 25 floor). */
export function billedSeats(agentCount: number): number {
  const n = Number.isFinite(agentCount) ? Math.floor(agentCount) : 0;
  return Math.max(n, INCLUDED_SEATS);
}

/** Total monthly charge in cents for an agent count, optionally with support. */
export function enterpriseMonthlyCents(agentCount: number, withSupport: boolean): number {
  return billedSeats(agentCount) * SEAT_PRICE_CENTS + (withSupport ? SUPPORT_PRICE_CENTS : 0);
}

/** Format integer cents as a USD string, e.g. 25000 -> "$250.00". */
export function formatUsd(cents: number): string {
  const v = (Math.round(cents) / 100).toFixed(2);
  return `$${v}`;
}
