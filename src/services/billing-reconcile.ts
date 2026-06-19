/**
 * billing-reconcile.ts -- keep each active subscription's seat quantity in sync
 * with the agent count on the org's chart. MONEY-SENSITIVE.
 *
 * The subscription quantity is set at checkout from the agent count; agents added
 * or removed later would drift, so the org would be over/under-billed. This
 * reconciles: for every active subscription, recompute the agent count and, if it
 * differs, update the Stripe subscription (prorated) + the subscriptions row.
 *
 * Idempotent and cheap: only calls Stripe when the count actually drifted.
 * Self-gating: no-ops without Stripe configured or BILLING_ENABLED.
 */
import cron from 'node-cron';
import { eq } from 'drizzle-orm';
import { db } from '../config/database.js';
import { subscriptions, organizations } from '../db/schema.js';
import { getStripe } from './stripe.js';
import { getOrgTeamGraph } from './team-graph.js';

function billingOn(): boolean {
  return (process.env.BILLING_ENABLED || '').trim().toLowerCase() === 'true';
}

/**
 * Reconcile one org's subscription seat quantity to its current agent count.
 * Returns a status describing what happened (no throw on the normal paths).
 */
export async function reconcileSubscriptionQuantity(
  orgId: string,
  orgName?: string | null,
): Promise<{ status: string; from?: number | null; to?: number }> {
  const stripe = getStripe();
  if (!stripe) return { status: 'no_stripe' };

  const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.orgId, orgId)).limit(1);
  if (!sub || sub.status !== 'active' || !sub.stripeSubscriptionId) return { status: 'no_active_sub' };

  let agents = 0;
  try {
    const team = await getOrgTeamGraph(orgId, orgName || 'Organization');
    agents = team.nodes.filter((n) => n.type === 'agent').length;
  } catch {
    return { status: 'chart_error' };
  }
  const want = Math.max(1, agents);
  if (want === sub.agentQuantity) return { status: 'unchanged', to: want };

  // Drift -> update Stripe (prorate the difference), then mirror locally. The
  // resulting customer.subscription.updated webhook also upserts the row, so this
  // local write is just for immediacy.
  const stripeSub = await stripe.subscriptions.retrieve(sub.stripeSubscriptionId);
  const itemId = stripeSub.items?.data?.[0]?.id;
  if (!itemId) return { status: 'no_item' };
  await stripe.subscriptions.update(sub.stripeSubscriptionId, {
    items: [{ id: itemId, quantity: want }],
    proration_behavior: 'create_prorations',
  });
  await db.update(subscriptions)
    .set({ agentQuantity: want, updatedAt: new Date() })
    .where(eq(subscriptions.orgId, orgId));
  return { status: 'updated', from: sub.agentQuantity, to: want };
}

/** Reconcile every active subscription. Best-effort per org; never throws. */
export async function runBillingReconcileTick(): Promise<void> {
  if (!billingOn() || !getStripe()) return;
  let rows: Array<{ orgId: string; name: string | null }>;
  try {
    rows = await db
      .select({ orgId: subscriptions.orgId, name: organizations.name })
      .from(subscriptions)
      .leftJoin(organizations, eq(organizations.id, subscriptions.orgId))
      .where(eq(subscriptions.status, 'active'));
  } catch (err) {
    console.error('[billing-reconcile] query failed:', err);
    return;
  }
  let changed = 0;
  for (const r of rows) {
    try {
      const res = await reconcileSubscriptionQuantity(r.orgId, r.name);
      if (res.status === 'updated') {
        changed++;
        console.log(`[billing-reconcile] org ${r.orgId}: ${res.from} -> ${res.to} seats`);
      }
    } catch (err) {
      console.error(`[billing-reconcile] org ${r.orgId} failed:`, err);
    }
  }
  if (rows.length > 0) console.log(`[billing-reconcile] tick complete. active=${rows.length} changed=${changed}`);
}

let scheduled = false;
export function startBillingReconcileScheduler(): void {
  if (scheduled) return;
  scheduled = true;
  // Hourly at :17. Stripe invoices monthly, so an hourly sync is more than ample;
  // the tick self-gates (BILLING_ENABLED + Stripe) so it's a no-op until live.
  cron.schedule('17 * * * *', () => {
    void runBillingReconcileTick();
  });
  console.log('[billing-reconcile] scheduler started (hourly)');
}
