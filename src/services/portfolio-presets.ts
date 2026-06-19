// Portfolio preset resolver + setter.
//
// A Portfolio (organizations.kind='portfolio') can define preset defaults that
// its MEMBER orgs inherit. Presets cover two groups -- 'sidebar' and 'settings'
// -- and the portfolio carries a `locked` list of group keys it ENFORCES.
//
// Resolution per group:
//   - If the parent portfolio LOCKS the group, the effective value is the
//     portfolio's preset (the member's own override is ignored).
//   - Otherwise the effective value is the member's own override if set, else
//     the portfolio default if set, else null (inherited-but-overridable).
//
// This file is the pure resolver + setter only. Wiring the resolved presets into
// the sidebar render happens in a later task. It mirrors portfolios.ts: same db,
// schema, drizzle helpers, .js extensions, and PortfolioError.

import { eq, and, asc } from 'drizzle-orm';
import { db } from '../config/database.js';
import { organizations, portfolioMembers } from '../db/schema.js';
import { PortfolioError } from './portfolios.js';

// The intended shape of organizations.portfolioPresets (nullable jsonb).
export interface PortfolioPresets {
  sidebar?: any;
  settings?: any;
  locked?: string[];
}

const PRESET_GROUPS = ['sidebar', 'settings'] as const;
type PresetGroup = (typeof PRESET_GROUPS)[number];

/** Coerce an unknown jsonb value into a defensive PortfolioPresets object. */
function normalizePresets(raw: unknown): { sidebar: any; settings: any; locked: string[] } {
  const p = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const lockedRaw = Array.isArray(p.locked) ? p.locked : [];
  const locked = lockedRaw.filter((g): g is string => typeof g === 'string');
  return {
    sidebar: p.sidebar ?? null,
    settings: p.settings ?? null,
    locked,
  };
}

/**
 * The portfolio org that has an ACTIVE portfolioMembers link to `orgId`. If the
 * org belongs to more than one portfolio, pick the OLDEST link (portfolioMembers
 * .createdAt ascending). Null if the org is not an active member of any portfolio.
 */
export async function getParentPortfolioForOrg(
  orgId: string,
): Promise<{ id: string; name: string; portfolioPresets: PortfolioPresets | null } | null> {
  if (!orgId) return null;

  const [row] = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      portfolioPresets: organizations.portfolioPresets,
    })
    .from(portfolioMembers)
    .innerJoin(organizations, eq(organizations.id, portfolioMembers.portfolioOrgId))
    .where(and(
      eq(portfolioMembers.memberOrgId, orgId),
      eq(portfolioMembers.status, 'active'),
    ))
    .orderBy(asc(portfolioMembers.createdAt))
    .limit(1);

  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    portfolioPresets: (row.portfolioPresets ?? null) as PortfolioPresets | null,
  };
}

/**
 * Compute the effective presets for a member org, merging its own overrides with
 * its parent portfolio's presets and honoring locked groups.
 *
 *   source = 'own'      => no parent, or every group resolved to the member's own value
 *   source = 'portfolio'=> every group resolved to a portfolio/locked value
 *   source = 'mixed'    => groups came from a mix of own + portfolio
 *
 * Best-effort: groups that resolve to null don't shift the source classification.
 */
export async function resolveEffectivePresets(
  orgId: string,
): Promise<{ sidebar: any; settings: any; locked: string[]; source: 'portfolio' | 'own' | 'mixed' }> {
  // The org's OWN values. sidebarConfig is the org's own sidebar override; there
  // is no dedicated settings column, so own-settings is null unless one appears.
  const [own] = orgId
    ? await db
        .select({ sidebarConfig: organizations.sidebarConfig })
        .from(organizations)
        .where(eq(organizations.id, orgId))
        .limit(1)
    : [];

  const ownByGroup: Record<PresetGroup, any> = {
    sidebar: own?.sidebarConfig ?? null,
    settings: null,
  };

  const parent = await getParentPortfolioForOrg(orgId);

  // No parent portfolio -> just the org's own values, source 'own'.
  if (!parent) {
    return {
      sidebar: ownByGroup.sidebar,
      settings: ownByGroup.settings,
      locked: [],
      source: 'own',
    };
  }

  const presets = normalizePresets(parent.portfolioPresets);
  const lockedSet = new Set(presets.locked);
  const portfolioByGroup: Record<PresetGroup, any> = {
    sidebar: presets.sidebar ?? null,
    settings: presets.settings ?? null,
  };

  const effective: Record<PresetGroup, any> = { sidebar: null, settings: null };
  let sawOwn = false;
  let sawPortfolio = false;

  for (const group of PRESET_GROUPS) {
    if (lockedSet.has(group)) {
      // Locked: portfolio value enforced, member override ignored.
      effective[group] = portfolioByGroup[group];
      if (effective[group] != null) sawPortfolio = true;
    } else if (ownByGroup[group] != null) {
      // Inherited-but-overridable: member's own override wins.
      effective[group] = ownByGroup[group];
      sawOwn = true;
    } else if (portfolioByGroup[group] != null) {
      // No member override: fall back to portfolio default.
      effective[group] = portfolioByGroup[group];
      sawPortfolio = true;
    } else {
      effective[group] = null;
    }
  }

  let source: 'portfolio' | 'own' | 'mixed';
  if (sawOwn && sawPortfolio) source = 'mixed';
  else if (sawPortfolio) source = 'portfolio';
  else source = 'own';

  return {
    sidebar: effective.sidebar,
    settings: effective.settings,
    locked: presets.locked,
    source,
  };
}

/**
 * Write a portfolio's preset defaults. Validates the org is kind='portfolio'.
 * The stored value is the provided presets object (locked normalized to a
 * string[]).
 */
export async function setPortfolioPresets(
  portfolioOrgId: string,
  presets: { sidebar?: any; settings?: any; locked?: string[] },
): Promise<void> {
  if (!portfolioOrgId) {
    throw new PortfolioError('INVALID_ORG', 'A portfolio org is required');
  }

  const [org] = await db
    .select({ kind: organizations.kind })
    .from(organizations)
    .where(eq(organizations.id, portfolioOrgId))
    .limit(1);
  if (!org) throw new PortfolioError('PORTFOLIO_NOT_FOUND', 'Portfolio not found', 404);
  if (org.kind !== 'portfolio') {
    throw new PortfolioError('NOT_A_PORTFOLIO', 'Org is not a portfolio');
  }

  const toStore: PortfolioPresets = {
    sidebar: presets?.sidebar ?? null,
    settings: presets?.settings ?? null,
    locked: Array.isArray(presets?.locked)
      ? presets.locked.filter((g): g is string => typeof g === 'string')
      : [],
  };

  await db
    .update(organizations)
    .set({ portfolioPresets: toStore })
    .where(eq(organizations.id, portfolioOrgId));
}

/**
 * Read a portfolio's preset defaults back (for the editor UI). Null if the org
 * has no presets stored. Returns a defensively-normalized shape otherwise.
 */
export async function getPortfolioPresets(
  portfolioOrgId: string,
): Promise<{ sidebar: any; settings: any; locked: string[] } | null> {
  if (!portfolioOrgId) return null;

  const [org] = await db
    .select({ portfolioPresets: organizations.portfolioPresets })
    .from(organizations)
    .where(eq(organizations.id, portfolioOrgId))
    .limit(1);

  if (!org || org.portfolioPresets == null) return null;
  return normalizePresets(org.portfolioPresets);
}
