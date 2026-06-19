/**
 * enterprise.ts -- self-serve Enterprise plan status + checkout + cancel.
 * MONEY-SENSITIVE. Reads the org's live agent count + subscription row and
 * starts/cancels the Enterprise subscription via the guarded enterprise-billing
 * service. Never logs card/PII.
 *
 * Routes (register under /api/v1):
 *   GET  /api/v1/enterprise/status    -> any member: plan + price preview + sub
 *   POST /api/v1/enterprise/checkout  -> owner/admin: hosted Checkout URL (503 if off)
 *   POST /api/v1/enterprise/cancel    -> owner/admin: cancel the subscription
 *
 * Owner/admin gate + { error: { code, message } } envelope mirror billing.ts.
 * This file does NOT register itself in server.ts (separate task).
 */
import type { FastifyInstance, FastifyRequest } from 'fastify';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../config/database.js';
import { subscriptions } from '../../db/schema.js';
import { getAuthOrg } from '../../middleware/auth-helpers.js';
import { canEditOrgSettings } from '../../middleware/permissions.js';
import type { Role } from '../../services/membership.js';
import {
  isEnterpriseBillingEnabled,
  createEnterpriseCheckoutSession,
  cancelEnterpriseSubscription,
  countOrgAgents,
} from '../../services/enterprise-billing.js';
import { billedSeats, enterpriseMonthlyCents } from '../../shared/enterprise-pricing.js';

// Same owner/admin gate as billing.ts/labs.ts: a legacy founder (no member row)
// owns their own org and may edit settings; otherwise require a role that
// canEditOrgSettings. Returns true if allowed.
function callerCanEditSettings(request: FastifyRequest): boolean {
  const member = (request as unknown as { orgMember?: { role?: string } | null }).orgMember;
  const role = (member?.role || '') as Role;
  if (canEditOrgSettings(role)) return true;
  if (!member?.role) return true;
  return false;
}

const checkoutSchema = z.object({ withSupport: z.boolean().optional() });

export default async function enterpriseRoutes(app: FastifyInstance) {
  // GET /api/v1/enterprise/status -- any member of the org. Plan + price preview
  // + the org's current subscription (if any).
  app.get('/enterprise/status', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in required' } });

    const agentCount = await countOrgAgents(org.id);
    const seats = billedSeats(agentCount);

    const subRow = await db
      .select({ status: subscriptions.status, currentPeriodEnd: subscriptions.currentPeriodEnd })
      .from(subscriptions)
      .where(eq(subscriptions.orgId, org.id))
      .limit(1);
    const sub = subRow[0];

    return {
      billingEnabled: isEnterpriseBillingEnabled(),
      planTier: org.planTier,
      agentCount,
      billedSeats: seats,
      monthlyCents: enterpriseMonthlyCents(agentCount, false),
      monthlyWithSupportCents: enterpriseMonthlyCents(agentCount, true),
      subscription: sub
        ? { status: sub.status, currentPeriodEnd: sub.currentPeriodEnd }
        : null,
    };
  });

  // POST /api/v1/enterprise/checkout -- owner/admin only. 503 if the billing
  // surface is gated off; otherwise create a hosted Checkout session.
  app.post('/enterprise/checkout', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in required' } });
    if (!callerCanEditSettings(request)) {
      return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'You do not have permission to start a subscription.' } });
    }

    const parsed = checkoutSchema.safeParse(request.body || {});
    if (!parsed.success) {
      return reply.status(400).send({
        error: { code: 'INVALID_REQUEST', message: parsed.error.issues[0]?.message || 'Invalid request body' },
      });
    }

    if (!isEnterpriseBillingEnabled()) {
      return reply.status(503).send({ error: { code: 'BILLING_DISABLED', message: 'Enterprise billing is not enabled yet.' } });
    }

    try {
      const { url } = await createEnterpriseCheckoutSession({
        orgId: org.id,
        withSupport: !!parsed.data.withSupport,
      });
      return { url };
    } catch (err) {
      request.log.error({ err }, 'enterprise checkout failed');
      return reply.status(500).send({ error: { code: 'CHECKOUT_FAILED', message: 'Could not start checkout. Please try again.' } });
    }
  });

  // POST /api/v1/enterprise/cancel -- owner/admin only. Cancels the org's
  // Enterprise subscription; the Stripe webhook reconciles plan_tier back down.
  app.post('/enterprise/cancel', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in required' } });
    if (!callerCanEditSettings(request)) {
      return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'You do not have permission to cancel the subscription.' } });
    }

    try {
      await cancelEnterpriseSubscription(org.id);
      return { ok: true };
    } catch (err) {
      request.log.error({ err }, 'enterprise cancel failed');
      return reply.status(500).send({ error: { code: 'CANCEL_FAILED', message: 'Could not cancel the subscription. Please try again.' } });
    }
  });
}
