/**
 * stripe.ts -- guarded Stripe client + money helpers. MONEY-SENSITIVE.
 *
 * UNTESTED WITHOUT KEYS. The whole money path is structurally complete but
 * cannot be live-verified without STRIPE_SECRET_KEY (+ a test-mode pass).
 * getStripe() returns null when STRIPE_SECRET_KEY is absent; every caller MUST
 * treat null as "not configured" and 503 (mirroring ask-ai.ts NOT_CONFIGURED).
 *
 * Env:
 *   STRIPE_SECRET_KEY      -- enables the client. Absent => null (503s).
 *   STRIPE_WEBHOOK_SECRET  -- required to verify webhook signatures.
 *   APP_BASE_URL           -- success/cancel redirect base (default localhost).
 */
import Stripe from 'stripe';

let cachedClient: Stripe | null = null;
let initialized = false;

/** Guarded singleton. Returns null if STRIPE_SECRET_KEY is not set. */
export function getStripe(): Stripe | null {
  if (initialized) return cachedClient;
  initialized = true;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    cachedClient = null;
    return null;
  }
  // Pin an explicit apiVersion so behavior is reproducible across deploys.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cachedClient = new Stripe(key, { apiVersion: '2025-08-27.basil' as any });
  return cachedClient;
}

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

function baseUrl(): string {
  return process.env.APP_BASE_URL || process.env.PUBLIC_BASE_URL || 'http://localhost:3000';
}

/**
 * Ensure the org has a Stripe customer; create + persist one if missing.
 * Returns the customer id. Caller is responsible for saving it onto the wallet
 * row (we pass it back rather than reaching into the DB here).
 */
export async function ensureStripeCustomer(
  stripe: Stripe,
  opts: { orgId: string; orgName?: string | null; existingCustomerId?: string | null },
): Promise<string> {
  if (opts.existingCustomerId) return opts.existingCustomerId;
  const customer = await stripe.customers.create({
    name: opts.orgName || undefined,
    metadata: { orgId: opts.orgId },
  });
  return customer.id;
}

/**
 * Create a Checkout Session that funds the wallet by `amountCents`. The session
 * metadata carries { orgId, kind:'wallet_topup', amountCents } so the webhook
 * can credit the right wallet idempotently (by session id). Returns the hosted
 * checkout URL.
 */
export async function createWalletTopupCheckout(
  stripe: Stripe,
  opts: { orgId: string; customerId: string; amountCents: number; currency?: string },
): Promise<{ url: string | null; sessionId: string }> {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer: opts.customerId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: opts.currency || 'usd',
          unit_amount: opts.amountCents, // integer cents
          product_data: { name: 'OTP wallet credit' },
        },
      },
    ],
    metadata: { orgId: opts.orgId, kind: 'wallet_topup', amountCents: String(opts.amountCents) },
    // Also stamp the PaymentIntent so future reconciliation can find it.
    payment_intent_data: {
      metadata: { orgId: opts.orgId, kind: 'wallet_topup', amountCents: String(opts.amountCents) },
      setup_future_usage: 'off_session', // save the card for auto-recharge later
    },
    success_url: `${baseUrl()}/settings/billing?topup=success`,
    cancel_url: `${baseUrl()}/settings/billing?topup=cancelled`,
  });
  return { url: session.url, sessionId: session.id };
}

/**
 * Verify + construct a Stripe webhook event from the RAW request body + the
 * `stripe-signature` header. Throws if the signature doesn't verify. Returns
 * null (rather than throwing) if no webhook secret is configured.
 */
export function constructWebhookEvent(
  stripe: Stripe,
  rawBody: string | Buffer,
  signature: string | undefined,
): Stripe.Event | null {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !signature) return null;
  return stripe.webhooks.constructEvent(rawBody, signature, secret);
}

/**
 * chargeAutoRecharge -- off-session top-up when a wallet drops below threshold.
 *
 * NOT WIRED TO A LIVE CRON. This is the structural implementation only; nothing
 * calls it automatically. Wiring a scheduler that moves real money REQUIRES a
 * Stripe test-mode verification pass first (saved-card off_session flow, SCA
 * decline handling, idempotency). Flagged in the build report.
 *
 * It creates an off-session PaymentIntent against the saved customer/payment
 * method; the resulting payment_intent.succeeded webhook is what actually
 * credits the wallet (same idempotent crediting path as a Checkout top-up),
 * so this function does NOT credit directly.
 */
export async function chargeAutoRecharge(
  stripe: Stripe,
  opts: { orgId: string; customerId: string; amountCents: number; currency?: string },
): Promise<{ paymentIntentId: string; status: string }> {
  const pi = await stripe.paymentIntents.create({
    amount: opts.amountCents,
    currency: opts.currency || 'usd',
    customer: opts.customerId,
    off_session: true,
    confirm: true,
    metadata: { orgId: opts.orgId, kind: 'wallet_topup', amountCents: String(opts.amountCents), source: 'auto_recharge' },
  });
  return { paymentIntentId: pi.id, status: pi.status };
}
