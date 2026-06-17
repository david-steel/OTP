/**
 * lab-features.ts (service) -- DB wiring for OTP Labs.
 *
 * The feature catalog + resolution rules are pure in shared/lab-features.ts.
 * This layer joins the catalog against org_lab_optins to answer:
 *   - is feature X enabled for org Y?  (isFeatureEnabledForOrg)
 *   - what's the full Labs state for org Y's settings page?  (getOrgLabState)
 *   - flip a beta feature on/off for org Y.  (setOrgLabOptin)
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';
import {
  LAB_FEATURES,
  getLabFeature,
  resolveLabEnabled,
  isLabToggleable,
  type LabFeature,
} from '../shared/lab-features.js';

export interface OrgLabFeatureState extends LabFeature {
  /** Resolved on/off for this org. */
  enabled: boolean;
  /** Whether the org has an explicit opt-in row (beta features only). */
  optedIn: boolean;
  /** Whether the org can flip this from the Labs UI. */
  toggleable: boolean;
}

/** This org's explicit Labs rows, split into opted-IN (on) and opted-OUT (off). */
async function getOrgOptinSets(orgId: string): Promise<{ on: Set<string>; off: Set<string> }> {
  const rows = (await db.execute(sql`
    SELECT feature_key, enabled FROM org_lab_optins WHERE org_id = ${orgId}
  `)) as any;
  const on = new Set<string>();
  const off = new Set<string>();
  for (const r of (rows.rows || [])) { (r.enabled ? on : off).add(r.feature_key as string); }
  return { on, off };
}

/**
 * Is a feature enabled for an org? `live` -> everyone; `beta` with defaultOn ->
 * on unless explicitly opted out; plain `beta` -> on iff opted in. A null org
 * (logged-out) sees `live` and defaultOn-beta features.
 */
export async function isFeatureEnabledForOrg(orgId: string | null | undefined, key: string): Promise<boolean> {
  const feature = getLabFeature(key);
  if (!feature) return false;
  if (feature.status === 'live') return true;
  if (!orgId) return resolveLabEnabled(feature, false, false);
  const { on, off } = await getOrgOptinSets(orgId);
  return resolveLabEnabled(feature, on.has(key), off.has(key));
}

export interface LabNavItem {
  href: string;
  label: string;
  iconKey: string;
}

/**
 * The left-rail nav items an org has unlocked via Labs: enabled features that
 * expose a navigable surface (surfaceUrl). Cheap single query; called per
 * authed page render from the server.ts preHandler.
 */
export async function getOrgLabNavItems(orgId: string): Promise<LabNavItem[]> {
  const { on, off } = await getOrgOptinSets(orgId);
  return LAB_FEATURES
    .filter((f) => !!f.surfaceUrl && resolveLabEnabled(f, on.has(f.key), off.has(f.key)))
    .map((f) => ({ href: f.surfaceUrl as string, label: f.navLabel || f.name, iconKey: f.navIcon || 'grid4' }));
}

/** Full Labs state for an org -- one entry per registered feature. */
export async function getOrgLabState(orgId: string): Promise<OrgLabFeatureState[]> {
  const { on, off } = await getOrgOptinSets(orgId);
  return LAB_FEATURES.map((f) => {
    // The Settings toggle should reflect the actual on/off state, so a defaultOn
    // feature reads ON even when there's no explicit opt-in row.
    const enabled = resolveLabEnabled(f, on.has(f.key), off.has(f.key));
    return { ...f, enabled, optedIn: enabled, toggleable: isLabToggleable(f) };
  });
}

/**
 * Flip a beta feature on/off for an org. Throws if the feature is unknown or
 * not toggleable (live / coming_soon). Upserts on (org, feature).
 */
export async function setOrgLabOptin(
  orgId: string,
  key: string,
  enabled: boolean,
  userId: string | null,
): Promise<void> {
  const feature = getLabFeature(key);
  if (!isLabToggleable(feature)) {
    throw new Error('Feature is not available to toggle');
  }
  await db.execute(sql`
    INSERT INTO org_lab_optins (org_id, feature_key, enabled, opted_in_by, opted_in_at, updated_at)
    VALUES (${orgId}, ${key}, ${enabled}, ${userId}, now(), now())
    ON CONFLICT (org_id, feature_key)
    DO UPDATE SET enabled = ${enabled}, opted_in_by = ${userId}, updated_at = now()
  `);
}
