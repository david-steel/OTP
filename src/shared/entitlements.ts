/**
 * entitlements.ts -- the SINGLE chokepoint for "what is this org allowed to do?"
 *
 * Mirrors the org-visibility.ts pattern: one place decides what a plan tier /
 * addon / feature flag grants, so every paid surface gates identically. The
 * pure `hasEntitlement()` is DB-free and unit-tested; `getOrgEntitlements()` is
 * the service loader that reads (and lazily creates) the org_entitlements row.
 *
 * ============================================================================
 * ENTITLEMENT CHOKEPOINT REGISTRY -- every paid surface that MUST gate on this.
 * When you add a new paid surface, gate it with hasEntitlement() AND add a line.
 * ----------------------------------------------------------------------------
 *  [x] (Phase 3) src/routes/api/rock-ai.ts  POST /rocks/:id/ai/draft     -> PAID
 *  [x] (Phase 3) src/routes/api/rock-ai.ts  POST /rocks/:id/ai/critique  -> PAID
 *      NOTE: Rock AI assist is PAID via the WALLET (pre-check balance >= floor +
 *      debit from real usage), the same metering model as Ask AI -- NOT via
 *      hasEntitlement('ai_assist'). It is additionally gated behind the
 *      AI_ROCK_ASSIST_LIVE launch flag (default OFF = "coming soon"). If we later
 *      want a plan-tier entitlement on top of pay-per-use, add hasEntitlement
 *      here and a line above.
 *  [-] Ask AI (src/routes/api/ask-ai.ts) is FREE today and gated only by the
 *      WALLET metering flag (balance), NOT by hasEntitlement. Do not add a
 *      hasEntitlement gate there without an explicit product decision.
 * ============================================================================
 *
 * Rule precedence (any ONE granting path returns true):
 *   1. featureFlags[key] === true                 -- explicit per-org override
 *   2. addons includes key                        -- subscribed add-on product
 *   3. the key is unlocked by the org's plan tier  -- PLAN_TIER_FEATURES rank
 *
 * Plan tiers are RANK-ORDERED: a higher tier inherits everything a lower tier
 * grants. 'free' < 'private' < 'premium'. Unknown tiers rank as 'free' (fail
 * closed to the least-privileged tier).
 */

export type EntitlementInput = {
  planTier?: string | null;
  addons?: string[] | null;
  featureFlags?: Record<string, unknown> | null;
};

// Tier rank. Higher number = more access. Keep contiguous and ordered.
export const PLAN_TIER_RANK: Record<string, number> = {
  free: 0,
  private: 1,
  premium: 2,
};

// The minimum tier RANK that unlocks a given feature key. A feature absent from
// this map is NOT granted by any tier (only by an addon or an explicit flag).
export const PLAN_TIER_FEATURES: Record<string, number> = {
  // Private-plan network opt-out (the is_private surface) is a Private+ feature.
  private_network: PLAN_TIER_RANK.private,
  // Premium-only surfaces.
  premium_support: PLAN_TIER_RANK.premium,
};

function tierRank(planTier?: string | null): number {
  if (!planTier) return PLAN_TIER_RANK.free;
  const r = PLAN_TIER_RANK[planTier];
  return typeof r === 'number' ? r : PLAN_TIER_RANK.free; // unknown => free (fail closed)
}

/**
 * Pure entitlement check. DB-free + unit-testable.
 * Returns true if the org (described by ent) is entitled to `key`.
 */
export function hasEntitlement(ent: EntitlementInput | null | undefined, key: string): boolean {
  if (!ent || !key) return false;

  // 1. Explicit per-org feature flag override (boolean true only).
  const flags = ent.featureFlags;
  if (flags && typeof flags === 'object' && flags[key] === true) return true;

  // 2. Subscribed add-on product.
  const addons = ent.addons;
  if (Array.isArray(addons) && addons.includes(key)) return true;

  // 3. Plan-tier unlock: org's tier rank must meet or exceed the feature's
  //    required rank. Features not in the map are never tier-granted.
  const required = PLAN_TIER_FEATURES[key];
  if (typeof required === 'number' && tierRank(ent.planTier) >= required) return true;

  return false;
}
