import { describe, it, expect } from 'vitest';
import { DELETION_GRACE_DAYS, isPurgeDue, daysUntilPurge, purgeCutoff } from './org-deletion.js';

const NOW = new Date('2026-06-17T12:00:00Z');
const daysAgo = (d: number) => new Date(NOW.getTime() - d * 24 * 60 * 60 * 1000);

describe('org-deletion timing', () => {
  it('grace window is 7 days', () => {
    expect(DELETION_GRACE_DAYS).toBe(7);
  });

  it('isPurgeDue: false within the window, true once 7 days pass', () => {
    expect(isPurgeDue(null, NOW)).toBe(false);
    expect(isPurgeDue(daysAgo(0), NOW)).toBe(false);
    expect(isPurgeDue(daysAgo(6), NOW)).toBe(false);
    expect(isPurgeDue(daysAgo(7), NOW)).toBe(true);
    expect(isPurgeDue(daysAgo(8), NOW)).toBe(true);
  });

  it('isPurgeDue accepts string timestamps', () => {
    expect(isPurgeDue(daysAgo(8).toISOString(), NOW)).toBe(true);
  });

  it('daysUntilPurge counts down to 0', () => {
    expect(daysUntilPurge(null, NOW)).toBeNull();
    expect(daysUntilPurge(daysAgo(0), NOW)).toBe(7);
    expect(daysUntilPurge(daysAgo(6), NOW)).toBe(1);
    expect(daysUntilPurge(daysAgo(7), NOW)).toBe(0);
    expect(daysUntilPurge(daysAgo(30), NOW)).toBe(0);
  });

  it('purgeCutoff is now minus the grace window', () => {
    expect(purgeCutoff(NOW).getTime()).toBe(daysAgo(7).getTime());
  });
});
