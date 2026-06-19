/**
 * billing.ts -- wallet top-up + auto-recharge config + Stripe webhook.
 * MONEY-SENSITIVE. Stripe money paths are GUARDED + UNTESTED-without-keys.
 *
 * Routes (the first three register under /api/v1; the webhook registers at root
 * so no auth/CORS gate blocks Stripe and the raw body survives for signature
 * verification):
 *   POST /api/v1/wallet/topup          -> Stripe Checkout session (503 if no key)
 *   PUT  /api/v1/wallet/auto-recharge   -> persist auto-recharge config
 *   GET  /api/v1/wallet                  -> balance + config (convenience read)
 *   POST /webhooks/stripe               -> credit wallet on checkout.session.completed
 *
 * Without STRIPE_SECRET_KEY, the topup endpoint returns 503 NOT_CONFIGURED,
 * mirroring ask-ai.ts. The webhook 400s on a bad/absent signature.
 */
import type Stripe from 'stripe';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import { eq } from 'drizzle-orm';
import { db } from '../../config/database.js';
import { orgWallets } from '../../db/schema.js';
import { getAuthOrg } from '../../middleware/auth-helpers.js';
import { canEditOrgSettings } from '../../middleware/permissions.js';
import type { Role } from '../../services/membership.js';
import { creditWallet, getOrCreateWallet } from '../../services/wallet.js';
import {
  getStripe,
  ensureStripeCustomer,
  createWalletTopupCheckout,
  constructWebhookEvent,
} from '../../services/stripe.js';
import { topupSchema, autoRechargeSchema } from '../../shared/wallet-validation.js';
import { recordSubscriptionFromStripe } from '../../services/enterprise-billing.js';

// Owner/admin-style gate. A legacy founder (no member row, owns the org via
// clerkOrgId) is treated as able to edit settings; otherwise require a role that
// canEditOrgSettings. Returns true if allowed.
function callerCanEditSettings(request: FastifyRequest, org: { clerkOrgId?: string }): boolean {
  const member = (request as unknown as { orgMember?: { role?: string } | null }).orgMember;
  const role = (member?.role || '') as Role;
  if (canEditOrgSettings(role)) return true;
  // Legacy founder: no privileged member row but owns the org.
  // getAuthOrg already resolved this org for them; if there's no member role at
  // all, treat them as the owner of their own org.
  if (!member?.role) return true;
  return false;
}

export default async function billingRoutes(app: FastifyInstance) {
  // GET /api/v1/wallet -- balance + auto-recharge config for the caller's org.
  app.get('/wallet', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in required' } });
    const wallet = await getOrCreateWallet(org.id);
    return {
      balanceCents: wallet?.balanceCents ?? 0,
      currency: wallet?.currency ?? 'usd',
      autoRecharge: {
        enabled: wallet?.autoRechargeEnabled ?? false,
        thresholdCents: wallet?.autoRechargeThresholdCents ?? null,
        amountCents: wallet?.autoRechargeAmountCents ?? null,
      },
      stripeConfigured: !!getStripe(),
    };
  });

  // POST /api/v1/wallet/topup -- create a Stripe Checkout session to fund the
  // wallet. Role-gated. 503 NOT_CONFIGURED when Stripe isn't set up.
  app.post('/wallet/topup', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in required' } });
    if (!callerCanEditSettings(request, org)) {
      return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'You do not have permission to add credits.' } });
    }

    const parsed = topupSchema.safeParse(request.body || {});
    if (!parsed.success) {
      return reply.status(400).send({
        error: { code: 'INVALID_REQUEST', message: parsed.error.issues[0]?.message || 'Invalid request body' },
      });
    }

    const stripe = getStripe();
    if (!stripe) {
      return reply.status(503).send({ error: { code: 'NOT_CONFIGURED', message: "Billing isn't set up yet." } });
    }

    try {
      const wallet = await getOrCreateWallet(org.id);
      const customerId = await ensureStripeCustomer(stripe, {
        orgId: org.id,
        orgName: org.name,
        existingCustomerId: wallet?.stripeCustomerId || org.stripeCustomerId || null,
      });
      // Persist the customer id onto the wallet for reuse + future auto-recharge.
      if (wallet && wallet.stripeCustomerId !== customerId) {
        await db.update(orgWallets).set({ stripeCustomerId: customerId, updatedAt: new Date() }).where(eq(orgWallets.orgId, org.id));
      }

      const { url } = await createWalletTopupCheckout(stripe, {
        orgId: org.id,
        customerId,
        amountCents: parsed.data.amountCents,
        currency: wallet?.currency || 'usd',
      });
      if (!url) {
        return reply.status(502).send({ error: { code: 'CHECKOUT_FAILED', message: 'Stripe did not return a checkout URL.' } });
      }
      return { url };
    } catch (err) {
      request.log.error({ err }, 'wallet topup checkout failed');
      return reply.status(502).send({ error: { code: 'CHECKOUT_FAILED', message: 'Could not start checkout. Please try again.' } });
    }
  });

  // PUT /api/v1/wallet/auto-recharge -- persist auto-recharge config. Role-gated.
  app.put('/wallet/auto-recharge', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in required' } });
    if (!callerCanEditSettings(request, org)) {
      return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'You do not have permission to change billing settings.' } });
    }

    const parsed = autoRechargeSchema.safeParse(request.body || {});
    if (!parsed.success) {
      return reply.status(400).send({
        error: { code: 'INVALID_REQUEST', message: parsed.error.issues[0]?.message || 'Invalid request body' },
      });
    }

    await getOrCreateWallet(org.id);
    await db
      .update(orgWallets)
      .set({
        autoRechargeEnabled: parsed.data.enabled,
        autoRechargeThresholdCents: parsed.data.enabled ? parsed.data.thresholdCents ?? null : null,
        autoRechargeAmountCents: parsed.data.enabled ? parsed.data.amountCents ?? null : null,
        updatedAt: new Date(),
      })
      .where(eq(orgWallets.orgId, org.id));

    return {
      ok: true,
      autoRecharge: {
        enabled: parsed.data.enabled,
        thresholdCents: parsed.data.enabled ? parsed.data.thresholdCents ?? null : null,
        amountCents: parsed.data.enabled ? parsed.data.amountCents ?? null : null,
      },
    };
  });
}

/**
 * The Stripe webhook. Registered SEPARATELY at the root scope (no /api/v1
 * prefix, no auth) so Stripe can reach it and the raw body (preserved as
 * request.rawBody by the global JSON parser in server.ts) verifies. Credits the
 * wallet idempotently keyed by the Checkout session / PaymentIntent id, so
 * Stripe retries never double-credit.
 */
export async function stripeWebhookRoutes(app: FastifyInstance) {
  app.post('/webhooks/stripe', async (request, reply) => {
    const stripe = getStripe();
    if (!stripe) {
      // Not configured: acknowledge so Stripe doesn't hammer retries, but do
      // nothing. (In practice the webhook isn't registered with Stripe until
      // keys exist; this is defense in depth.)
      return reply.status(503).send({ error: { code: 'NOT_CONFIGURED' } });
    }

    const signature = request.headers['stripe-signature'] as string | undefined;
    const rawBody = (request as unknown as { rawBody?: string }).rawBody ?? '';

    let event;
    try {
      event = constructWebhookEvent(stripe, rawBody, signature);
    } catch (err) {
      request.log.error({ err }, 'stripe webhook signature verification failed');
      return reply.status(400).send({ error: { code: 'BAD_SIGNATURE', message: 'Signature verification failed' } });
    }
    if (!event) {
      // No webhook secret configured, or no signature header.
      return reply.status(400).send({ error: { code: 'BAD_SIGNATURE', message: 'Missing webhook secret or signature' } });
    }

    try {
      if (event.type === 'checkout.session.completed') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const session = event.data.object as any;
        const md = (session.metadata || {}) as Record<string, string>;
        if (session.mode === 'subscription' || md.kind === 'enterprise') {
          // Enterprise subscription checkout: do NOT credit the wallet. Retrieve
          // the subscription and reconcile our subscriptions row + plan_tier.
          const subId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
          if (subId) {
            const sub = await stripe.subscriptions.retrieve(subId);
            await recordSubscriptionFromStripe(sub);
          }
        } else if (md.kind === 'wallet_topup' && md.orgId) {
          // Wallet top-up (mode='payment') only. Idempotent on the session id: a
          // retried webhook returns the prior result rather than crediting twice.
          const amountCents = Number(md.amountCents);
          if (Number.isInteger(amountCents) && amountCents > 0) {
            await creditWallet(md.orgId, amountCents, 'topup', {
              idempotencyKey: `stripe_checkout_${session.id}`,
              metadata: { stripeSessionId: session.id, source: 'checkout' },
              createdBy: 'stripe_webhook',
            });
          }
        }
      } else if (
        event.type === 'customer.subscription.created' ||
        event.type === 'customer.subscription.updated' ||
        event.type === 'customer.subscription.deleted'
      ) {
        // The event payload IS a Stripe.Subscription. Reconcile our row +
        // plan_tier (recordSubscriptionFromStripe no-ops if it's not one of ours).
        await recordSubscriptionFromStripe(event.data.object as Stripe.Subscription);
      } else if (event.type === 'invoice.payment_failed') {
        // Best-effort: the matching customer.subscription.updated event carries
        // the new (e.g. past_due) status, so we only log here. No PII.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const invoice = event.data.object as any;
        request.log.warn(
          { invoiceId: invoice.id, subscriptionId: invoice.subscription ?? null },
          'stripe invoice payment failed',
        );
      } else if (event.type === 'payment_intent.succeeded') {
        // Auto-recharge path (off-session PaymentIntent). Same idempotent credit.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pi = event.data.object as any;
        const md = (pi.metadata || {}) as Record<string, string>;
        if (md.kind === 'wallet_topup' && md.orgId && md.source === 'auto_recharge') {
          const amountCents = Number(md.amountCents);
          if (Number.isInteger(amountCents) && amountCents > 0) {
            await creditWallet(md.orgId, amountCents, 'topup', {
              idempotencyKey: `stripe_pi_${pi.id}`,
              metadata: { stripePaymentIntentId: pi.id, source: 'auto_recharge' },
              createdBy: 'stripe_webhook',
            });
          }
        }
      }
    } catch (err) {
      // Log but still 200 so Stripe doesn't retry a poison event forever; the
      // credit is idempotent so a manual replay is safe.
      request.log.error({ err, type: event.type }, 'stripe webhook handler error');
    }

    return reply.status(200).send({ received: true });
  });
}
