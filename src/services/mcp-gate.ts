/**
 * mcp-gate.ts -- the access decision for the Remote MCP endpoint and its UI.
 *
 * Two independent gates, both required:
 *   1. Labs opt-in  -- the `mcp_remote` beta feature is ON for the org
 *      (early-access switch the org flips at /settings/labs).
 *   2. Paid plan     -- the org is on any non-free entitlement tier.
 *
 * Why a direct planTier check and not hasEntitlement(): the entitlement rank
 * map (shared/entitlements.ts) only ranks free < private < premium, so paying
 * 'standard'/'enterprise' tiers would fail closed to free under the rank path.
 * "Paid accounts only" is exactly planTier !== 'free'. A per-org comp escape
 * hatch (featureFlags.mcp_remote === true) bypasses the paid check only -- used
 * to dogfood on our own (free) org without faking a subscription.
 */
import { getOrgEntitlements } from './entitlements.js';
import { isFeatureEnabledForOrg } from './lab-features.js';

export type McpDenyReason = 'lab_off' | 'not_paid';

export interface McpAccess {
  allowed: boolean;
  reason?: McpDenyReason;
  planTier: string;
  labOn: boolean;
}

export async function checkMcpRemoteAccess(orgId: string | null | undefined): Promise<McpAccess> {
  if (!orgId) return { allowed: false, reason: 'lab_off', planTier: 'free', labOn: false };

  const [labOn, ent] = await Promise.all([
    isFeatureEnabledForOrg(orgId, 'mcp_remote'),
    getOrgEntitlements(orgId),
  ]);

  const planTier = ent.planTier || 'free';
  const comped = ent.featureFlags?.mcp_remote === true;
  const paid = comped || planTier !== 'free';

  if (!labOn) return { allowed: false, reason: 'lab_off', planTier, labOn };
  if (!paid) return { allowed: false, reason: 'not_paid', planTier, labOn };
  return { allowed: true, planTier, labOn };
}
