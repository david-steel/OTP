import { describe, it, expect } from 'vitest';
import { pkceChallengeFromVerifier, verifyPkce } from './pkce.js';

// RFC 7636 Appendix B test vector.
const VERIFIER = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
const CHALLENGE = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM';

describe('PKCE S256', () => {
  it('derives the RFC 7636 reference challenge', () => {
    expect(pkceChallengeFromVerifier(VERIFIER)).toBe(CHALLENGE);
  });

  it('accepts the matching verifier', () => {
    expect(verifyPkce(VERIFIER, CHALLENGE, 'S256')).toBe(true);
  });

  it('rejects a wrong verifier', () => {
    expect(verifyPkce('not-the-verifier', CHALLENGE, 'S256')).toBe(false);
  });

  it('rejects the plain method (S256 only)', () => {
    expect(verifyPkce(VERIFIER, VERIFIER, 'plain')).toBe(false);
  });

  it('rejects empty inputs', () => {
    expect(verifyPkce('', CHALLENGE, 'S256')).toBe(false);
    expect(verifyPkce(VERIFIER, '', 'S256')).toBe(false);
  });
});
