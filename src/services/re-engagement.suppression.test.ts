// Guards the lifecycle/re-engagement suppression list. A regression here
// ships automated drip emails to people David handles personally -- most
// importantly Victor (first paying customer, hard-guarded per 2026-06-03
// go-live decision; enforced in code 2026-06-10).
import { describe, it, expect, beforeAll } from 'vitest';

let isSuppressedRecipient: (email: string) => boolean;

beforeAll(async () => {
  // re-engagement.ts transitively imports config/database.ts, which throws at
  // load when DATABASE_URL is unset. The pool never connects unless queried,
  // so a placeholder URL is safe for these pure-function tests.
  process.env.DATABASE_URL ||= 'postgres://unused:unused@127.0.0.1:5/unused';
  ({ isSuppressedRecipient } = await import('./re-engagement.js'));
});

describe('isSuppressedRecipient', () => {
  it('suppresses Victor (first paying customer -- David handles personally)', () => {
    expect(isSuppressedRecipient('victorliu@clearskiestitle.com')).toBe(true);
    expect(isSuppressedRecipient('VictorLiu@ClearSkiesTitle.com')).toBe(true);
  });

  it('suppresses internal domains and aliases', () => {
    expect(isSuppressedRecipient('dsteel@sneeze.it')).toBe(true);
    expect(isSuppressedRecipient('dsteel+test@sneeze.it')).toBe(true);
    expect(isSuppressedRecipient('anyone@orgtp.com')).toBe(true);
  });

  it('suppresses the personally-handled EO relationship', () => {
    expect(isSuppressedRecipient('krisg@jointher3volution.com')).toBe(true);
  });

  it('does NOT suppress ordinary external signups', () => {
    expect(isSuppressedRecipient('founder@some-company.com')).toBe(false);
  });

  it('treats blank/malformed addresses as suppressed (never send)', () => {
    expect(isSuppressedRecipient('')).toBe(true);
    expect(isSuppressedRecipient('not-an-email')).toBe(true);
  });
});
