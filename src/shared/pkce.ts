/**
 * pkce.ts -- RFC 7636 PKCE helpers for the Remote MCP OAuth flow.
 *
 * Pure + DB-free (only `crypto`) so the verification logic unit-tests without a
 * database. The DB-touching OAuth flow (services/oauth.ts) imports these.
 */
import { createHash } from 'crypto';

/** RFC 7636 S256 transform: base64url(SHA256(verifier)). */
export function pkceChallengeFromVerifier(verifier: string): string {
  return createHash('sha256').update(verifier).digest('base64url');
}

/** Verify a code_verifier against a stored challenge. Only S256 is accepted. */
export function verifyPkce(verifier: string, challenge: string, method: string): boolean {
  if (!verifier || !challenge) return false;
  if (method !== 'S256') return false;
  const computed = pkceChallengeFromVerifier(verifier);
  return computed.length === challenge.length && computed === challenge;
}
