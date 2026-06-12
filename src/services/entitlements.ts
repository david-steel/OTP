/**
 * entitlements service loader (DB-touching). The pure hasEntitlement() + the
 * chokepoint registry live in src/shared/entitlements.ts. This module loads /
 * lazily creates the org_entitlements row, so callers can do:
 *
 *   const ent = await getOrgEntitlements(org.id);
 *   if (!hasEntitlement(ent, 'ai_assist')) return reply.status(402)...
 */
import { eq } from 'drizzle-orm';
import { db } from '../config/database.js';
import { orgEntitlements } from '../db/schema.js';
import type { EntitlementInput } from '../shared/entitlements.js';

export type OrgEntitlements = EntitlementInput & {
  planTier: string;
  addons: string[];
  featureFlags: Record<string, unknown>;
};

/**
 * Load the org's entitlements, creating a default 'free' row if missing.
 * The create is race-safe via ON CONFLICT DO NOTHING (the unique org_id index).
 */
export async function getOrgEntitlements(orgId: string): Promise<OrgEntitlements> {
  const existing = await db
    .select()
    .from(orgEntitlements)
    .where(eq(orgEntitlements.orgId, orgId))
    .limit(1);

  if (existing[0]) return normalize(existing[0]);

  // Create default free row; ignore the conflict if a concurrent request won.
  await db
    .insert(orgEntitlements)
    .values({ orgId, planTier: 'free' })
    .onConflictDoNothing({ target: orgEntitlements.orgId });

  const after = await db
    .select()
    .from(orgEntitlements)
    .where(eq(orgEntitlements.orgId, orgId))
    .limit(1);

  if (after[0]) return normalize(after[0]);
  // Should be unreachable, but never throw a paid-surface gate into a 500.
  return { planTier: 'free', addons: [], featureFlags: {} };
}

function normalize(row: typeof orgEntitlements.$inferSelect): OrgEntitlements {
  return {
    planTier: row.planTier || 'free',
    addons: Array.isArray(row.addons) ? (row.addons as string[]) : [],
    featureFlags:
      row.featureFlags && typeof row.featureFlags === 'object'
        ? (row.featureFlags as Record<string, unknown>)
        : {},
  };
}
