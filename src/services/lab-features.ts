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

/** The set of feature keys this org has explicitly enabled. */
async function getOrgOptins(orgId: string): Promise<Set<string>> {
  const rows = (await db.execute(sql`
    SELECT feature_key FROM org_lab_optins
    WHERE org_id = ${orgId} AND enabled = true
  `)) as any;
  return new Set((rows.rows || []).map((r: any) => r.feature_key as string));
}

/**
 * Is a feature enabled for an org? `live` features are on regardless of org;
 * `beta` features require an opt-in; a null org (logged-out / no org) only ever
 * sees `live` features.
 */
export async function isFeatureEnabledForOrg(orgId: string | null | undefined, key: string): Promise<boolean> {
  const feature = getLabFeature(key);
  if (!feature) return false;
  if (feature.status === 'live') return true;
  if (!orgId) return false;
  const optins = await getOrgOptins(orgId);
  return resolveLabEnabled(feature, optins.has(key));
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
  const optins = await getOrgOptins(orgId);
  return LAB_FEATURES
    .filter((f) => !!f.surfaceUrl && resolveLabEnabled(f, optins.has(f.key)))
    .map((f) => ({ href: f.surfaceUrl as string, label: f.navLabel || f.name, iconKey: f.navIcon || 'grid4' }));
}

/** Full Labs state for an org -- one entry per registered feature. */
export async function getOrgLabState(orgId: string): Promise<OrgLabFeatureState[]> {
  const optins = await getOrgOptins(orgId);
  return LAB_FEATURES.map((f) => ({
    ...f,
    enabled: resolveLabEnabled(f, optins.has(f.key)),
    optedIn: optins.has(f.key),
    toggleable: isLabToggleable(f),
  }));
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
