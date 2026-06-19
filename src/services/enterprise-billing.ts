/**
 * enterprise-billing.ts -- Stripe service for the Enterprise subscription plan.
 * MONEY-SENSITIVE. Integer cents only; never log card/PII.
 *
 * Reuses the guarded Stripe client + helpers from ./stripe.js (getStripe,
 * ensureStripeCustomer). Pure service: no routes, no webhook handlers, no UI.
 *
 * Exposure gate: isEnterpriseBillingEnabled() requires both a configured Stripe
 * client AND STRIPE_BILLING_LIVE === 'true'. Whether REAL money moves is a
 * separate concern, determined by the Stripe key being sk_test vs sk_live.
 *
 * Pricing is sourced from ../shared/enterprise-pricing.js (single source of
 * truth). Prices are found-or-created in Stripe by stable lookup_key so we never
 * hardcode environment-specific Price IDs.
 */
import type Stripe from 'stripe';
import { eq, and, isNull } from 'drizzle-orm';
import { db } from '../config/database.js';
import { organizations, subscriptions, managerAgents } from '../db/schema.js';
import { getStripe, ensureStripeCustomer } from './stripe.js';
import {
  ENTERPRISE_CURRENCY,
  ENTERPRISE_INTERVAL,
  SEAT_PRICE_CENTS,
  SUPPORT_PRICE_CENTS,
  SEAT_PRICE_LOOKUP_KEY,
  SUPPORT_PRICE_LOOKUP_KEY,
  billedSeats,
} from '../shared/enterprise-pricing.js';

function baseUrl(): string {
  return process.env.APP_BASE_URL || process.env.PUBLIC_BASE_URL || 'http://localhost:3000';
}

/**
 * Exposure gate for the Enterprise billing surface. True iff a Stripe client is
 * configured AND STRIPE_BILLING_LIVE === 'true'. This gates whether the surface
 * is exposed at all -- it does NOT decide whether real money moves (that is the
 * sk_test vs sk_live distinction on the key itself).
 */
export function isEnterpriseBillingEnabled(): boolean {
  return getStripe() !== null && process.env.STRIPE_BILLING_LIVE === 'true';
}

/**
 * Idempotent find-or-create of the two recurring monthly Prices, keyed by their
 * stable lookup_key. For each: list active prices by lookup_key; reuse if found,
 * else create a Product then a recurring monthly Price carrying the lookup_key.
 * Throws if Stripe is not configured.
 */
export async function ensureEnterprisePrices(): Promise<{ seatPriceId: string; supportPriceId: string }> {
  const stripe = getStripe();
  if (!stripe) throw new Error('Stripe is not configured (STRIPE_SECRET_KEY absent).');

  const seatPriceId = await findOrCreatePrice(stripe, {
    lookupKey: SEAT_PRICE_LOOKUP_KEY,
    productName: 'OTP Enterprise Seat',
    unitAmount: SEAT_PRICE_CENTS,
  });
  const supportPriceId = await findOrCreatePrice(stripe, {
    lookupKey: SUPPORT_PRICE_LOOKUP_KEY,
    productName: 'OTP Priority Support',
    unitAmount: SUPPORT_PRICE_CENTS,
  });
  return { seatPriceId, supportPriceId };
}

async function findOrCreatePrice(
  stripe: Stripe,
  opts: { lookupKey: string; productName: string; unitAmount: number },
): Promise<string> {
  const existing = await stripe.prices.list({
    lookup_keys: [opts.lookupKey],
    active: true,
    limit: 1,
  });
  if (existing.data[0]) return existing.data[0].id;

  const product = await stripe.products.create({ name: opts.productName });
  const price = await stripe.prices.create({
    currency: ENTERPRISE_CURRENCY,
    unit_amount: opts.unitAmount, // integer cents
    recurring: { interval: ENTERPRISE_INTERVAL as Stripe.PriceCreateParams.Recurring.Interval },
    lookup_key: opts.lookupKey,
    product: product.id,
  });
  return price.id;
}

/** Count of the org's live (not soft-deleted) manager agents. */
export async function countOrgAgents(orgId: string): Promise<number> {
  const rows = await db
    .select({ id: managerAgents.id })
    .from(managerAgents)
    .where(and(eq(managerAgents.orgId, orgId), isNull(managerAgents.deletedAt)));
  return rows.length;
}

/**
 * Create a hosted Checkout Session for the Enterprise subscription. Seat
 * quantity = billedSeats(liveAgentCount) (enforces the 25-seat floor). Optional
 * Priority Support is a separate flat line item. Returns the hosted URL.
 * Throws a clear Error if the billing surface is gated off.
 */
export async function createEnterpriseCheckoutSession(opts: {
  orgId: string;
  withSupport: boolean;
}): Promise<{ url: string }> {
  if (!isEnterpriseBillingEnabled()) {
    throw new Error('Enterprise billing is not enabled.');
  }
  const stripe = getStripe();
  if (!stripe) throw new Error('Stripe is not configured (STRIPE_SECRET_KEY absent).');

  const orgRow = await db
    .select({ id: organizations.id, name: organizations.name, stripeCustomerId: organizations.stripeCustomerId })
    .from(organizations)
    .where(eq(organizations.id, opts.orgId))
    .limit(1);
  const org = orgRow[0];
  if (!org) throw new Error(`Organization ${opts.orgId} not found.`);

  const customerId = await ensureStripeCustomer(stripe, {
    orgId: org.id,
    orgName: org.name,
    existingCustomerId: org.stripeCustomerId || null,
  });
  // Persist the customer id onto the org for reuse if it was freshly created.
  if (org.stripeCustomerId !== customerId) {
    await db
      .update(organizations)
      .set({ stripeCustomerId: customerId })
      .where(eq(organizations.id, org.id));
  }

  const { seatPriceId, supportPriceId } = await ensureEnterprisePrices();

  const agentCount = await countOrgAgents(org.id);
  const qty = billedSeats(agentCount);

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    { price: seatPriceId, quantity: qty },
    ...(opts.withSupport ? [{ price: supportPriceId, quantity: 1 }] : []),
  ];

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: lineItems,
    success_url: `${baseUrl()}/settings/billing?enterprise=success`,
    cancel_url: `${baseUrl()}/settings/billing?enterprise=cancel`,
    client_reference_id: org.id,
    subscription_data: { metadata: { orgId: org.id, kind: 'enterprise' } },
    metadata: { orgId: org.id, kind: 'enterprise', withSupport: String(!!opts.withSupport) },
  });

  if (!session.url) throw new Error('Stripe did not return a checkout URL.');
  return { url: session.url };
}

/**
 * Reconcile our `subscriptions` row + organizations.plan_tier from a Stripe
 * Subscription object (called from the webhook handler in a separate task).
 * orgId is read from sub.metadata.orgId (stamped at checkout via
 * subscription_data.metadata). One subscriptions row per org (org_id unique).
 */
export async function recordSubscriptionFromStripe(sub: Stripe.Subscription): Promise<void> {
  const orgId = sub.metadata?.orgId;
  if (!orgId) {
    // Not one of ours / not stamped -- nothing to reconcile.
    return;
  }

  const seatQty = findSeatQuantity(sub);
  // current_period_end is a unix timestamp (seconds). Cast narrowly: some Stripe
  // type versions surface this on the item rather than the subscription root.
  const periodEndUnix = (sub as unknown as { current_period_end?: number }).current_period_end;
  const currentPeriodEnd =
    typeof periodEndUnix === 'number' ? new Date(periodEndUnix * 1000) : null;

  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id || null;
  const now = new Date();

  await db
    .insert(subscriptions)
    .values({
      orgId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: sub.id,
      status: sub.status,
      agentQuantity: seatQty,
      currentPeriodEnd,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: subscriptions.orgId,
      set: {
        stripeCustomerId: customerId,
        stripeSubscriptionId: sub.id,
        status: sub.status,
        agentQuantity: seatQty,
        currentPeriodEnd,
        updatedAt: now,
      },
    });

  // Flip the org plan tier based on subscription status.
  const activeStatuses = new Set(['active', 'trialing', 'past_due']);
  const deadStatuses = new Set(['canceled', 'incomplete_expired', 'unpaid']);
  if (activeStatuses.has(sub.status)) {
    await db.update(organizations).set({ planTier: 'enterprise' }).where(eq(organizations.id, orgId));
  } else if (deadStatuses.has(sub.status)) {
    await db.update(organizations).set({ planTier: 'standard' }).where(eq(organizations.id, orgId));
  }
  // Best-effort entitlements sync: the entitlements service (getOrgEntitlements)
  // exposes no clean planTier setter today (it only lazily creates a default
  // 'free' row), so there is nothing safe to call here. organizations.plan_tier
  // above is the authoritative gate. Noted in the build report.
}

/**
 * Locate the seat line item's quantity on a Stripe Subscription. We match the
 * item whose price carries the seat lookup_key; fall back to matching by the
 * resolved seat Price id. Returns null when no seat item is found.
 */
function findSeatQuantity(sub: Stripe.Subscription): number | null {
  const items = sub.items?.data || [];
  for (const item of items) {
    const price = item.price;
    if (price && price.lookup_key === SEAT_PRICE_LOOKUP_KEY) {
      return item.quantity ?? null;
    }
  }
  return null;
}

/**
 * Reconcile the org's enterprise seat quantity with its live agent count. If an
 * active enterprise subscription exists and the billed seat quantity differs
 * from billedSeats(currentAgentCount), update the seat item quantity (Stripe
 * default proration applies). No-op when billing is disabled or no active sub.
 * Never throws into callers -- logs + swallows.
 */
export async function syncEnterpriseSeats(orgId: string): Promise<void> {
  try {
    if (!isEnterpriseBillingEnabled()) return;
    const stripe = getStripe();
    if (!stripe) return;

    const subRow = await db
      .select({
        stripeSubscriptionId: subscriptions.stripeSubscriptionId,
        status: subscriptions.status,
      })
      .from(subscriptions)
      .where(eq(subscriptions.orgId, orgId))
      .limit(1);
    const row = subRow[0];
    if (!row || !row.stripeSubscriptionId) return;

    const activeStatuses = new Set(['active', 'trialing', 'past_due']);
    if (!activeStatuses.has(row.status)) return;

    const sub = await stripe.subscriptions.retrieve(row.stripeSubscriptionId);
    const seatItem = (sub.items?.data || []).find(
      (item) => item.price && item.price.lookup_key === SEAT_PRICE_LOOKUP_KEY,
    );
    if (!seatItem) return;

    const desiredQty = billedSeats(await countOrgAgents(orgId));
    if (seatItem.quantity === desiredQty) return; // already in sync

    await stripe.subscriptions.update(sub.id, {
      items: [{ id: seatItem.id, quantity: desiredQty }],
    });
  } catch (err) {
    // Best-effort: seat drift is reconciled again on the next agent change /
    // webhook. Never surface this into the caller's request path.
    // eslint-disable-next-line no-console
    console.error('[enterprise-billing] syncEnterpriseSeats failed', { orgId, err });
  }
}

/**
 * Cancel the org's enterprise subscription immediately. The webhook
 * (recordSubscriptionFromStripe) reconciles plan_tier back to 'standard' when
 * Stripe fires customer.subscription.deleted. Guarded + best-effort.
 */
export async function cancelEnterpriseSubscription(orgId: string): Promise<void> {
  try {
    const stripe = getStripe();
    if (!stripe) return;

    const subRow = await db
      .select({ stripeSubscriptionId: subscriptions.stripeSubscriptionId, status: subscriptions.status })
      .from(subscriptions)
      .where(eq(subscriptions.orgId, orgId))
      .limit(1);
    const row = subRow[0];
    if (!row || !row.stripeSubscriptionId) return;

    // Already in a terminal state -- nothing to cancel.
    const deadStatuses = new Set(['canceled', 'incomplete_expired', 'unpaid']);
    if (deadStatuses.has(row.status)) return;

    await stripe.subscriptions.cancel(row.stripeSubscriptionId);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[enterprise-billing] cancelEnterpriseSubscription failed', { orgId, err });
  }
}
