/**
 * lab-features.ts -- the registry + pure resolution rules for OTP Labs.
 *
 * Labs is OTP's per-organization early-access program (the GHL "Labs" pattern):
 * a feature we're still building sits in `beta`, and any org can flip it on
 * early from /settings/labs. When it's ready for everyone we move it to `live`;
 * before it's toggleable it sits in `coming_soon`.
 *
 * This file is the SINGLE source of truth for what features exist. Adding a new
 * in-progress feature = one entry here. Per-org opt-in is stored in
 * org_lab_optins; the join + DB wiring lives in services/lab-features.ts.
 *
 * Pure + DB-free (registry + resolution only) so the rules are unit-tested
 * without a database -- mirrors integration-live-gate.ts / marketplace-gate.ts.
 */

export type LabFeatureStatus =
  | 'coming_soon' // visible in Labs but not yet toggleable
  | 'beta'        // opt-in available per org
  | 'live';       // shipped to everyone; the Labs toggle no longer gates it

export interface LabFeature {
  /** Stable key, also the org_lab_optins.feature_key value. */
  key: string;
  name: string;
  description: string;
  status: LabFeatureStatus;
  /** ISO date (YYYY-MM-DD) the feature is expected to go fully live, if known. */
  targetLiveDate?: string;
  /** Where the org lands once the feature is on (shown as an "Open" link). */
  surfaceUrl?: string;
}

/**
 * THE REGISTRY. One entry per in-progress feature.
 * Keep keys stable -- they're persisted in org_lab_optins.
 */
export const LAB_FEATURES: LabFeature[] = [
  {
    key: 'marketplace',
    name: 'Marketplace',
    description:
      'Install partner-built agents, integrations, and operating-system content packs directly into your workspace. Each add-on gets a seat, an SOP, and a scorecard on your org chart.',
    status: 'beta',
    surfaceUrl: '/marketplace',
  },
];

export function getLabFeature(key: string): LabFeature | undefined {
  return LAB_FEATURES.find((f) => f.key === key);
}

/**
 * Is the feature ON for an org, given whether that org has opted in?
 *   live        -> on for everyone (opt-in irrelevant)
 *   beta        -> on iff the org opted in
 *   coming_soon -> always off (not toggleable yet)
 */
export function resolveLabEnabled(feature: LabFeature | undefined, optedIn: boolean): boolean {
  if (!feature) return false;
  if (feature.status === 'live') return true;
  if (feature.status === 'beta') return optedIn;
  return false;
}

/** Can an org turn this on/off from the Labs UI? Only beta features. */
export function isLabToggleable(feature: LabFeature | undefined): boolean {
  return !!feature && feature.status === 'beta';
}
