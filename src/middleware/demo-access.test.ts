// Pure unit tests for the secret-gated demo-login machinery. No DB: the
// demo-access module only imports node:crypto, so these prove the safety
// invariants without spinning up Postgres or Clerk.
//
// Invariants under test (see demo-access.ts header):
//   1. Forge-proof org binding -- verify returns a boolean ONLY, never an org.
//   2. Inert without the secret -- demoLoginEnabled()/verify dead when unset.
//   3. HMAC-signed cookie -- round-trip + reject tamper/wrong-sig/expired/garbage.
//   6. (route-level) /demo-login 404s; covered by a focused boot test elsewhere,
//      but demoKeyMatches is unit-tested here.
import { describe, it, expect, afterEach } from 'vitest';
import {
  demoLoginEnabled,
  encodeDemoCookie,
  verifyDemoCookie,
  demoKeyMatches,
  DEMO_LOGIN_ORG_CLERK_ID,
  DEMO_COOKIE_NAME,
} from './demo-access.js';
import { createHmac } from 'node:crypto';

const SECRET = 'unit-test-demo-secret-abc123';

// Set DEMO_LOGIN_SECRET for the duration of fn, restoring whatever was there.
function withSecret<T>(value: string | undefined, fn: () => T): T {
  const prev = process.env.DEMO_LOGIN_SECRET;
  try {
    if (value === undefined) delete process.env.DEMO_LOGIN_SECRET;
    else process.env.DEMO_LOGIN_SECRET = value;
    return fn();
  } finally {
    if (prev === undefined) delete process.env.DEMO_LOGIN_SECRET;
    else process.env.DEMO_LOGIN_SECRET = prev;
  }
}

afterEach(() => {
  // Belt-and-suspenders: never leak the secret across tests.
  delete process.env.DEMO_LOGIN_SECRET;
});

describe('constants', () => {
  it('binds the demo org to the demo_acme constant and names the cookie otp_demo', () => {
    expect(DEMO_LOGIN_ORG_CLERK_ID).toBe('demo_acme');
    expect(DEMO_COOKIE_NAME).toBe('otp_demo');
  });
});

describe('demoLoginEnabled (invariant 2: inert without the secret)', () => {
  it('is false when DEMO_LOGIN_SECRET is unset', () => {
    withSecret(undefined, () => expect(demoLoginEnabled()).toBe(false));
  });
  it('is false when DEMO_LOGIN_SECRET is empty', () => {
    withSecret('', () => expect(demoLoginEnabled()).toBe(false));
  });
  it('is true when DEMO_LOGIN_SECRET is set and non-empty', () => {
    withSecret(SECRET, () => expect(demoLoginEnabled()).toBe(true));
  });
});

describe('encodeDemoCookie / verifyDemoCookie round-trip (invariant 3)', () => {
  it('a freshly minted cookie verifies under the same secret', () => {
    withSecret(SECRET, () => {
      const cookie = encodeDemoCookie();
      expect(cookie).toContain('.');
      expect(verifyDemoCookie(cookie)).toBe(true);
    });
  });

  it('encodeDemoCookie returns empty string when the feature is disabled', () => {
    withSecret(undefined, () => {
      expect(encodeDemoCookie()).toBe('');
    });
  });
});

describe('verifyDemoCookie rejects bad input (invariant 3)', () => {
  it('rejects when the secret is unset, even for a once-valid cookie', () => {
    const cookie = withSecret(SECRET, () => encodeDemoCookie());
    withSecret(undefined, () => expect(verifyDemoCookie(cookie)).toBe(false));
  });

  it('rejects a tampered payload (same sig, mutated b64)', () => {
    withSecret(SECRET, () => {
      const cookie = encodeDemoCookie();
      const [b64, sig] = cookie.split('.');
      // Flip a character in the payload; signature no longer matches.
      const mutated = (b64[0] === 'A' ? 'B' : 'A') + b64.slice(1);
      expect(verifyDemoCookie(`${mutated}.${sig}`)).toBe(false);
    });
  });

  it('rejects a tampered signature', () => {
    withSecret(SECRET, () => {
      const cookie = encodeDemoCookie();
      const [b64, sig] = cookie.split('.');
      const badSig = (sig[0] === 'a' ? 'b' : 'a') + sig.slice(1);
      expect(verifyDemoCookie(`${b64}.${badSig}`)).toBe(false);
    });
  });

  it('rejects a cookie signed with a different secret', () => {
    const cookie = withSecret('some-other-secret', () => encodeDemoCookie());
    withSecret(SECRET, () => expect(verifyDemoCookie(cookie)).toBe(false));
  });

  it('rejects an expired cookie (exp in the past)', () => {
    withSecret(SECRET, () => {
      const past = Date.now() - 1000;
      const payload = { v: 1, iat: past - 1000, exp: past };
      const b64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
      const sig = createHmac('sha256', SECRET).update(b64).digest('hex');
      expect(verifyDemoCookie(`${b64}.${sig}`)).toBe(false);
    });
  });

  it('rejects empty / garbage / malformed input', () => {
    withSecret(SECRET, () => {
      expect(verifyDemoCookie('')).toBe(false);
      expect(verifyDemoCookie(undefined)).toBe(false);
      expect(verifyDemoCookie(null)).toBe(false);
      expect(verifyDemoCookie('not-a-cookie')).toBe(false);
      expect(verifyDemoCookie('.')).toBe(false);
      expect(verifyDemoCookie('abc.')).toBe(false);
      expect(verifyDemoCookie('.abc')).toBe(false);
      expect(verifyDemoCookie('!!!.!!!')).toBe(false);
    });
  });
});

describe('forge-proofing (invariant 1: no org ever flows from the cookie)', () => {
  it('a forged payload smuggling an org field still only verifies on the sig, and verify returns a boolean (carries no org)', () => {
    withSecret(SECRET, () => {
      // Attacker-built payload that tries to smuggle a target org. We sign it
      // correctly so it passes HMAC -- proving that even a *validly signed*
      // attacker cookie cannot carry an org into the system, because verify's
      // return type is boolean and the resolvers ignore the payload body.
      const payload = {
        v: 1,
        iat: Date.now(),
        exp: Date.now() + 60_000,
        orgId: 'victim-org-uuid',
        clerkOrgId: 'victor_private_org',
        email: 'owner@victim.example',
      };
      const b64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
      const sig = createHmac('sha256', SECRET).update(b64).digest('hex');
      const result = verifyDemoCookie(`${b64}.${sig}`);
      // It verifies (sig is valid) ...
      expect(result).toBe(true);
      // ... but the result is a plain boolean -- there is no org/email field
      // anywhere on it. The org binding lives only in the resolvers via the
      // DEMO_LOGIN_ORG_CLERK_ID constant.
      expect(typeof result).toBe('boolean');
      expect((result as unknown as Record<string, unknown>).orgId).toBeUndefined();
      expect((result as unknown as Record<string, unknown>).clerkOrgId).toBeUndefined();
    });
  });
});

describe('demoKeyMatches (invariant 6: constant-time key gate)', () => {
  it('is false when the feature is disabled, regardless of key', () => {
    withSecret(undefined, () => {
      expect(demoKeyMatches('anything')).toBe(false);
      expect(demoKeyMatches(SECRET)).toBe(false);
    });
  });
  it('is false for a missing or wrong key', () => {
    withSecret(SECRET, () => {
      expect(demoKeyMatches(undefined)).toBe(false);
      expect(demoKeyMatches(null)).toBe(false);
      expect(demoKeyMatches('')).toBe(false);
      expect(demoKeyMatches('wrong')).toBe(false);
      expect(demoKeyMatches(SECRET + 'x')).toBe(false);
    });
  });
  it('is true only for the exact secret', () => {
    withSecret(SECRET, () => {
      expect(demoKeyMatches(SECRET)).toBe(true);
    });
  });
});
