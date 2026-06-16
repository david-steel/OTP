import { describe, it, expect } from 'vitest';
import { AUTO_END_MINUTES, computeAutoEndAt, isMeetingLocked, isMeetingStale } from './meeting-timing.js';

const NOW = new Date('2026-06-16T15:00:00Z');
const future = (mins: number) => new Date(NOW.getTime() + mins * 60_000);
const past = (mins: number) => new Date(NOW.getTime() - mins * 60_000);

describe('computeAutoEndAt', () => {
  it('adds AUTO_END_MINUTES (60) to startedAt by default', () => {
    expect(computeAutoEndAt(NOW).getTime()).toBe(NOW.getTime() + 60 * 60_000);
    expect(AUTO_END_MINUTES).toBe(60);
  });
  it('honors a custom minute window (an extend)', () => {
    expect(computeAutoEndAt(NOW, 30).getTime()).toBe(NOW.getTime() + 30 * 60_000);
  });
});

describe('isMeetingLocked', () => {
  it('locks a future-dated scheduled meeting', () => {
    expect(isMeetingLocked({ status: 'scheduled', scheduledAt: future(60) }, NOW)).toBe(true);
  });
  it('unlocks once the date has arrived/passed', () => {
    expect(isMeetingLocked({ status: 'scheduled', scheduledAt: past(1) }, NOW)).toBe(false);
    expect(isMeetingLocked({ status: 'scheduled', scheduledAt: NOW }, NOW)).toBe(false);
  });
  it('unlocks once started or completed regardless of date', () => {
    expect(isMeetingLocked({ status: 'in_progress', scheduledAt: future(60) }, NOW)).toBe(false);
    expect(isMeetingLocked({ status: 'completed', scheduledAt: future(60) }, NOW)).toBe(false);
  });
  it('never locks a cancelled meeting', () => {
    expect(isMeetingLocked({ status: 'cancelled', scheduledAt: future(60) }, NOW)).toBe(false);
  });
  it('accepts string timestamps', () => {
    expect(isMeetingLocked({ status: 'scheduled', scheduledAt: future(60).toISOString() }, NOW)).toBe(true);
  });
});

describe('isMeetingStale', () => {
  it('is stale when in_progress past the auto-end deadline', () => {
    expect(isMeetingStale({ status: 'in_progress', autoEndAt: past(1) }, NOW)).toBe(true);
    expect(isMeetingStale({ status: 'in_progress', autoEndAt: NOW }, NOW)).toBe(true);
  });
  it('is not stale before the deadline', () => {
    expect(isMeetingStale({ status: 'in_progress', autoEndAt: future(5) }, NOW)).toBe(false);
  });
  it('is never stale when not in progress, or with no deadline', () => {
    expect(isMeetingStale({ status: 'scheduled', autoEndAt: past(60) }, NOW)).toBe(false);
    expect(isMeetingStale({ status: 'completed', autoEndAt: past(60) }, NOW)).toBe(false);
    expect(isMeetingStale({ status: 'in_progress', autoEndAt: null }, NOW)).toBe(false);
  });
});
