// Demo-presenter scoped access.
//
// A small allow-list of trusted non-admins (e.g. Dawson, who runs sales demos)
// may "view as" the canned demo orgs (Acme Corp) WITHOUT being granted full
// super-admin. The scope is deliberately tight: a demo presenter can only ever
// land in a demo org -- never a real customer org. The gate is enforced in two
// places that must agree:
//   1. issue point  -- /admin/view-as/:email (who may start the impersonation)
//   2. apply point  -- middleware/guards.ts  (which cookie may be applied)
//
// Keep this list short and obvious. Anyone who needs to see real customer data
// gets super-admin via super-admin.ts, not an entry here.

const DEMO_PRESENTER_EMAILS = new Set<string>([
  'dawson@juicedboxes.com',
]);

const DEMO_TARGET_ORG_CLERK_IDS = new Set<string>([
  'demo_acme',
]);

export function isDemoPresenterEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return DEMO_PRESENTER_EMAILS.has(email.trim().toLowerCase());
}

export function isDemoTargetOrg(clerkOrgId: string | null | undefined): boolean {
  if (!clerkOrgId) return false;
  return DEMO_TARGET_ORG_CLERK_IDS.has(clerkOrgId);
}

// ---------------------------------------------------------------------------
// Demo login (no-Clerk, secret-gated "view the Acme demo" session)
// ---------------------------------------------------------------------------
//
// A presenter can hit `/demo-login?key=<DEMO_LOGIN_SECRET>` and land in the
// Acme Corp demo org WITHOUT a Clerk session. This is intentionally NOT
// impersonation: it grants the privileges of a *normal Acme member*, scoped
// to Acme, and nothing more. It does NOT make the session a super-admin and
// it does NOT use the impersonation cookie/decoration.
//
// THE SAFETY MODEL (every invariant must hold; see demo-access.test.ts):
//   1. Forge-proof org binding. The org is ALWAYS resolved server-side by the
//      CONSTANT clerk_org_id below. The cookie carries NO org reference, so a
//      valid-but-forged cookie can still only ever become Acme. Resolvers add
//      a belt-and-suspenders assertion: if the loaded org's clerkOrgId !==
//      DEMO_LOGIN_ORG_CLERK_ID they set NOTHING and bail.
//   2. Inert without the secret. The entire feature is dead unless
//      DEMO_LOGIN_SECRET is set and non-empty (demoLoginEnabled()). Default
//      OFF: no secret => /demo-login 404s and the cookie is ignored everywhere.
//   3. HMAC-signed cookie. otp_demo = b64(JSON{v,iat,exp}) + '.' + HMAC-SHA256,
//      verified with timingSafeEqual. Tampered/wrong-sig/expired => ignored.
//      The cookie contains NO org reference (invariant 1).
//   6. Endpoint is unguessable + non-revealing. /demo-login 404s (never 403)
//      when the secret is unset or the key mismatches. The secret is never
//      logged.

import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * The ONE org a demo session may ever resolve to. Resolved entirely
 * server-side. The cookie/URL never carry an org id -- this constant is the
 * only source of the demo org binding (safety invariant 1).
 */
export const DEMO_LOGIN_ORG_CLERK_ID = 'demo_acme';

/** Cookie name for the demo session. Carries NO org reference. */
export const DEMO_COOKIE_NAME = 'otp_demo';

/** Demo session cookie lifetime. */
const DEMO_TTL_SECONDS = 12 * 60 * 60;

/**
 * The whole feature is OFF unless DEMO_LOGIN_SECRET is set and non-empty
 * (safety invariant 2). When this returns false, /demo-login 404s and every
 * resolver ignores the otp_demo cookie.
 */
export function demoLoginEnabled(): boolean {
  const s = process.env.DEMO_LOGIN_SECRET;
  return typeof s === 'string' && s.length > 0;
}

function demoSecret(): string | null {
  const s = process.env.DEMO_LOGIN_SECRET;
  return typeof s === 'string' && s.length > 0 ? s : null;
}

function sign(b64: string, secret: string): string {
  return createHmac('sha256', secret).update(b64).digest('hex');
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

/** The demo cookie payload. Deliberately carries NO org id/name/email. */
interface DemoCookiePayload {
  v: 1;
  iat: number;
  exp: number;
}

/**
 * Build a fresh signed otp_demo cookie value. exp ~12h out. Returns '' if the
 * feature is disabled (no secret) so callers never mint an unsigned cookie.
 */
export function encodeDemoCookie(): string {
  const secret = demoSecret();
  if (!secret) return '';
  const now = Date.now();
  const payload: DemoCookiePayload = {
    v: 1,
    iat: now,
    exp: now + DEMO_TTL_SECONDS * 1000,
  };
  const b64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${b64}.${sign(b64, secret)}`;
}

/**
 * Verify an otp_demo cookie. Returns a boolean ONLY -- never an org or any
 * caller-controlled field (safety invariant 1: the verify result type carries
 * no org). False when: feature disabled, empty/garbage input, bad signature,
 * tampered payload, or expired. A forged payload that smuggles an org field
 * verifies only on the signature and the org is never read from it.
 */
export function verifyDemoCookie(raw: string | undefined | null): boolean {
  const secret = demoSecret();
  if (!secret) return false; // invariant 2: dead without the secret
  if (!raw) return false;
  const dot = raw.indexOf('.');
  if (dot <= 0 || dot === raw.length - 1) return false;
  const b64 = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  if (!safeEqual(sig, sign(b64, secret))) return false;
  try {
    const payload = JSON.parse(Buffer.from(b64, 'base64url').toString('utf8')) as DemoCookiePayload;
    if (payload.v !== 1) return false;
    if (typeof payload.exp !== 'number' || payload.exp < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Constant-time comparison of a presented key against DEMO_LOGIN_SECRET.
 * Returns false when the feature is disabled. Used by the /demo-login route to
 * gate (and 404, never 403) without leaking timing or the secret itself
 * (safety invariant 6).
 */
export function demoKeyMatches(presented: string | undefined | null): boolean {
  const secret = demoSecret();
  if (!secret) return false;
  if (typeof presented !== 'string' || presented.length === 0) return false;
  return safeEqual(presented, secret);
}

// ---------------------------------------------------------------------------
// Shared page-route demo context resolver
// ---------------------------------------------------------------------------
//
// resolveOrgForUser(clerkUserId) in services/membership.ts needs a Clerk user,
// so it cannot serve the no-Clerk demo session. Page routes that gate on
// `!auth.userId` therefore need a single, demo-aware resolution path that
// returns the SAME shape resolveOrgForUser returns ({ org, role,
// claimedEntityId }) so call sites can destructure identically.
//
// This is the ONLY new resolution path the demo extension adds, and it can
// ONLY ever return the Acme org. NO request/cookie/URL value influences which
// org is loaded -- the org is loaded purely by the DEMO_LOGIN_ORG_CLERK_ID
// constant, with a belt-and-suspenders assert (safety invariant 1).

/** Shape returned by resolveOrgForUser -- mirrored so call sites match. */
export interface DemoPageContext {
  org: any;
  role: string;
  claimedEntityId: string | null;
}

/**
 * Load the Acme demo org SOLELY by the constant clerk_org_id, asserting the
 * loaded row's clerkOrgId === the constant before returning it. Injectable so
 * the pure guard logic in resolveDemoPageContext can be unit-tested without a
 * DB (the demo-access module otherwise stays DB-free per
 * feedback_otp_pure_logic_needs_db_free_module). Returns null on any mismatch.
 */
export type DemoOrgLoader = () => Promise<{ clerkOrgId: string | null } | null>;

async function defaultDemoOrgLoader(): Promise<{ clerkOrgId: string | null } | null> {
  // Imported lazily so importing this module for the pure helpers above does
  // not pull in config/database.ts (which throws without DATABASE_URL).
  const { db } = await import('../config/database.js');
  const { organizations } = await import('../db/schema.js');
  const { eq } = await import('drizzle-orm');
  const [org] = await db.select()
    .from(organizations)
    .where(eq(organizations.clerkOrgId, DEMO_LOGIN_ORG_CLERK_ID))
    .limit(1);
  return org || null;
}

/**
 * Resolve the page-route context for a no-Clerk demo session.
 *
 * Returns null UNLESS request.demoSession.active is true -- and that flag is
 * set ONLY in guards.ts, ONLY after demoLoginEnabled() (secret present) AND a
 * valid signed otp_demo cookie (invariants 2 + 3 enforced upstream). So this
 * helper is fully inert when the feature is off.
 *
 * When active, it loads the Acme org by the DEMO_LOGIN_ORG_CLERK_ID constant
 * and returns null unless the loaded org's clerkOrgId === that constant
 * (invariant 1: forge-proof, belt-and-suspenders -- the org is NEVER read from
 * the cookie or request). role/claimedEntityId come from request.orgMember
 * (the Acme member guards.ts already resolved), defaulting role to 'owner' and
 * claimedEntityId to null.
 *
 * This is the ONLY new resolution path. It can ONLY ever return Acme. No
 * request/cookie value influences which org is selected.
 */
export async function resolveDemoPageContext(
  request: any,
  loadDemoOrg: DemoOrgLoader = defaultDemoOrgLoader,
): Promise<DemoPageContext | null> {
  // Inert unless guards.ts set an active demo session (which itself requires
  // demoLoginEnabled() + a valid otp_demo cookie -- invariants 2 + 3).
  if (!request?.demoSession?.active) return null;

  const org = await loadDemoOrg();
  // Invariant 1 belt-and-suspenders: never proceed unless the loaded org is
  // EXACTLY the demo org. Defends against a misconfigured/renamed org row.
  if (!org || org.clerkOrgId !== DEMO_LOGIN_ORG_CLERK_ID) return null;

  const member = (request?.orgMember as { role?: string; claimedEntityId?: string | null } | null) || null;
  return {
    org,
    role: member?.role || 'owner',
    claimedEntityId: member?.claimedEntityId ?? null,
  };
}
