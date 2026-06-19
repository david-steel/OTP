/**
 * Active-org selection (org-switching) shared helper.
 *
 * A multi-org user -- including a member of a Portfolio org -- may belong to
 * more than one org via org_members. By default the membership resolvers pick
 * the FIRST active membership (oldest hit). This module lets the user pin which
 * org they're operating in via a cookie named `otp_active_org` whose value is
 * an org UUID.
 *
 * SECURITY INVARIANTS (read before touching the call sites):
 *   1. The cookie is a PREFERENCE, never an authority. It only selects among
 *      orgs the user is ALREADY an active member of. Every consumer MUST
 *      validate the cookie value against an ACTIVE org_members row for that
 *      exact orgId before honoring it. Never load an org by the cookie value
 *      alone (that would be the forge-able-cookie footgun the demo path
 *      guards against in demo-access.ts).
 *   2. The cookie MUST NOT override impersonation. Impersonation is resolved
 *      FIRST in both guards.ts and auth-helpers.ts; this preference is only
 *      consulted on the plain "active member of any org" tiebreak path.
 *   3. It does not grant access -- it only chooses among already-granted
 *      memberships. If the cookie names an org the user isn't an active member
 *      of, consumers fall back to the existing behavior unchanged.
 *
 * The SET / CLEAR side is a later task. To set: issue
 *   Set-Cookie: otp_active_org=<orgUuid>; Path=/; HttpOnly; SameSite=Lax; Secure
 * via reply.setCookie(ACTIVE_ORG_COOKIE_NAME, orgId, { path: '/', httpOnly: true, sameSite: 'lax', secure: true }).
 * To clear (return to default first-membership behavior):
 *   reply.clearCookie(ACTIVE_ORG_COOKIE_NAME, { path: '/' }).
 * That future switch endpoint should call readActiveOrgCookie() to read the
 * current selection and must itself re-validate membership before writing the
 * cookie.
 */
import type { FastifyRequest } from 'fastify';

/** Name of the active-org preference cookie. Value = an org UUID. */
export const ACTIVE_ORG_COOKIE_NAME = 'otp_active_org';

// Matches the 36-char UUID shape already used for the dev orgId override in
// auth-helpers.ts. A malformed value is treated as "no preference".
const UUID_RE = /^[0-9a-f-]{36}$/i;

/**
 * Read the active-org preference from the request cookie. Returns the org UUID
 * string if a syntactically valid one is present, else null. This performs NO
 * membership validation -- callers MUST validate the returned id against an
 * active org_members row before resolving to that org (invariant 1).
 *
 * @fastify/cookie is registered in server.ts, so request.cookies is populated;
 * we read it the same defensive way the demo/impersonation paths do.
 */
export function readActiveOrgCookie(request: FastifyRequest): string | null {
  const raw = (request as any).cookies?.[ACTIVE_ORG_COOKIE_NAME] as string | undefined;
  if (!raw) return null;
  return UUID_RE.test(raw) ? raw : null;
}
