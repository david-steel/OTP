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
  /** Beta features only: ON by default for every org, but still toggleable -- an
   *  org can opt OUT from /settings/labs. (Plain beta is OFF until opted in.) */
  defaultOn?: boolean;
  /** ISO date (YYYY-MM-DD) the feature is expected to go fully live, if known. */
  targetLiveDate?: string;
  /** Display date a feature launched, shown on the Labs card (e.g. "6-17-26"). */
  launchedOn?: string;
  /** The reason to turn it on now instead of waiting (early-access value +
   *  honest caveat). Shown as the "Why turn it on now" line on the Labs card. */
  whyNow?: string;
  /** Where the org lands once the feature is on (shown as an "Open" link). */
  surfaceUrl?: string;
  /**
   * If set (with surfaceUrl), an ENABLED feature gets a left-rail nav item.
   * navLabel defaults to `name`; navIcon is a key into the rail's icon set
   * (src/views/layouts/main.ejs `_sbI`), falling back to a generic grid icon.
   */
  navLabel?: string;
  navIcon?: string;
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
      'Stop building everything yourself. Plug in agents, integrations, and ready-made operating-system playbooks that other teams have already proven, each landing on your chart with a seat and a scorecard.',
    whyNow:
      'Switch it on to get first pick of new add-ons and help shape what partners build, before it opens to everyone. It is early, so the catalog is small today and growing fast.',
    status: 'beta',
    surfaceUrl: '/marketplace',
    navLabel: 'Marketplace',
    navIcon: 'store',
  },
  {
    key: 'meeting_formats',
    name: 'Custom meeting formats',
    description:
      'Make every recurring meeting yours. Design an agenda once, with your own sections and timeboxes, then run it live with timers, shared notes, and your real scorecard and rocks pulled right in.',
    whyNow:
      'Switch it on to build and run your own formats now and tell us what is missing while it still bends to your feedback. Still in testing, so expect a few rough edges.',
    status: 'beta',
    // No surfaceUrl on purpose: reached via a button on the Meetings page, not the
    // left rail. (surfaceUrl would inject a rail item when enabled.)
  },
  {
    key: 'dashboard_clean',
    name: 'Clean dashboard',
    description:
      'A calmer Daily dashboard. The same panels and data, with less chrome: no per-card mascots or help icons, quiet row actions, and the focus on your work instead of the decoration around it.',
    whyNow:
      'Switch it on to try the cleaner look and tell us if anything reads better or worse before it becomes the default. Still polishing, so a few panels are calmer than others.',
    status: 'beta',
    // No surfaceUrl: this is a skin on /dashboard, not a new nav destination.
  },
  {
    key: 'meetings_broken_out',
    name: 'Run meetings step by step',
    description:
      'A guided run mode for your L8 meeting. Instead of one long page, step through the agenda one section at a time -- segue, scorecard, rocks, headlines, to-dos, IDS, conclude -- with the timebox and your real data in front of you, and the agenda as a stepper down the side.',
    whyNow:
      'The default way to run your L8 meeting: one agenda section at a time, with the timebox and your real data in front of you, the agenda as a stepper down the side, a shared timer, and in-meeting Add/Tools. On for every org by default -- turn it off here if you prefer the classic one-page meeting.',
    status: 'beta',
    defaultOn: true,
    launchedOn: '6-17-26',
    // Step-mode layer over the existing l8-leadership sections (#segue ... #conclude).
    // 2026-06-17: default-ON for all current + future orgs, still toggleable (opt-out).
  },
  {
    key: 'sidebar_customize',
    name: 'Customize the sidebar',
    description:
      'Let the account owner decide which left-rail items everyone sees, and in what order. Hide what your team does not use and reorder the rest from one panel.',
    whyNow:
      'Turn it on to give owners a "Customize sidebar" panel: toggle items on/off and drag to reorder. The choice applies org-wide. Off by default.',
    status: 'beta',
    // Reads/writes organizations.sidebar_config; applied in layouts/main.ejs.
  },
];

export function getLabFeature(key: string): LabFeature | undefined {
  return LAB_FEATURES.find((f) => f.key === key);
}

/**
 * Is the feature ON for an org, given its explicit opt-in / opt-out rows?
 *   live              -> on for everyone (opt-in irrelevant)
 *   beta + defaultOn  -> on UNLESS the org explicitly opted out (toggleable)
 *   beta              -> on iff the org opted in
 *   coming_soon       -> always off (not toggleable yet)
 */
export function resolveLabEnabled(feature: LabFeature | undefined, optedIn: boolean, optedOut = false): boolean {
  if (!feature) return false;
  if (feature.status === 'live') return true;
  if (feature.status === 'beta') return feature.defaultOn ? !optedOut : optedIn;
  return false;
}

/** Can an org turn this on/off from the Labs UI? Only beta features. */
export function isLabToggleable(feature: LabFeature | undefined): boolean {
  return !!feature && feature.status === 'beta';
}
