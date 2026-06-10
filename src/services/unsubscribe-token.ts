// Signed one-click unsubscribe links.
//
// GET /api/v1/newsletter/unsubscribe/:email used to take the raw email with no
// proof the request came from the recipient -- anyone (or any link-prefetching
// bot) could unsubscribe anyone. New emails carry ?t=<hmac> so the one-click
// path only works from a real email link; legacy links (no token) fall back to
// a confirm page instead of mutating on GET.
//
// Tokens are stateless (recomputed, never stored), so links keep working
// forever as long as the secret is stable.

import { createHmac, timingSafeEqual } from 'crypto';

// Dedicated env var preferred; fall back to the Clerk secret so prod works
// without a new Railway var. Changing the secret invalidates old links (they
// degrade to the confirm page, not a dead end).
function secret(): string {
  return process.env.UNSUBSCRIBE_SECRET || process.env.CLERK_SECRET_KEY || 'otp-unsubscribe-dev';
}

export function unsubscribeToken(email: string): string {
  return createHmac('sha256', secret())
    .update(email.trim().toLowerCase())
    .digest('hex')
    .slice(0, 32);
}

export function verifyUnsubscribeToken(email: string, token: string | null | undefined): boolean {
  if (!token) return false;
  try {
    const expected = Buffer.from(unsubscribeToken(email));
    const got = Buffer.from(String(token));
    return expected.length === got.length && timingSafeEqual(expected, got);
  } catch {
    return false;
  }
}

export function unsubscribeUrl(email: string): string {
  const e = email.trim().toLowerCase();
  return `https://orgtp.com/api/v1/newsletter/unsubscribe/${encodeURIComponent(e)}?t=${unsubscribeToken(e)}`;
}
