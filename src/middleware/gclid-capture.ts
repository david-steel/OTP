/**
 * Capture Google Ads click identifiers from inbound landing URLs.
 *
 * On any GET request that arrives with ?gclid= (and/or ?gbraid=, ?wbraid=
 * for iOS/SKAN attribution), this hook stashes the values in 90-day
 * cookies. On signup, src/routes/pages/onboarding.ts copies the cookie
 * value into Clerk's user.publicMetadata and fires a server-side
 * conversion via src/lib/google-ads-conversions.
 *
 * Wired in src/server.ts as a global onRequest hook AFTER @fastify/cookie
 * but BEFORE any route handlers. Multi-touch policy: most recent click
 * wins (newer cookie overwrites older).
 */
import type { FastifyRequest, FastifyReply } from 'fastify';

const NINETY_DAYS_S = 90 * 24 * 60 * 60;

function cookieOpts() {
  return {
    path: '/',
    maxAge: NINETY_DAYS_S,
    sameSite: 'lax' as const,
    // Not httpOnly -- the value is opaque, safe to expose to JS for
    // future client-side enhancements (e.g. cross-domain reflection).
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
  };
}

export async function gclidCaptureHook(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  if (request.method !== 'GET') return;

  const q = (request.query ?? {}) as Record<string, unknown>;
  const gclid = typeof q.gclid === 'string' ? q.gclid : undefined;
  const gbraid = typeof q.gbraid === 'string' ? q.gbraid : undefined;
  const wbraid = typeof q.wbraid === 'string' ? q.wbraid : undefined;

  if (!gclid && !gbraid && !wbraid) return;

  const opts = cookieOpts();
  if (gclid) {
    reply.setCookie('otp_gclid', gclid, opts);
    reply.setCookie('otp_click_ts', new Date().toISOString(), opts);
  }
  if (gbraid) reply.setCookie('otp_gbraid', gbraid, opts);
  if (wbraid) reply.setCookie('otp_wbraid', wbraid, opts);
}
