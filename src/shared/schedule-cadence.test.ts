import { describe, it, expect } from 'vitest';
import {
  cadenceToCron,
  cronToCadence,
  normalizeCadence,
  nextRunAt,
  cadenceLabel,
} from './schedule-cadence.js';

describe('cadenceLabel', () => {
  it('labels hourly with the minute', () => {
    expect(cadenceLabel('0 * * * *')).toBe('Hourly · :00');
    expect(cadenceLabel('30 * * * *')).toBe('Hourly · :30');
  });
  it('labels daily with 12h clock', () => {
    expect(cadenceLabel('0 8 * * *')).toBe('Daily · 8:00 AM');
    expect(cadenceLabel('0 0 * * *')).toBe('Daily · 12:00 AM');
    expect(cadenceLabel('30 13 * * *')).toBe('Daily · 1:30 PM');
  });
  it('labels weekly with weekday + clock', () => {
    expect(cadenceLabel('0 8 * * 1')).toBe('Weekly · Mon 8:00 AM');
    expect(cadenceLabel('0 17 * * 0')).toBe('Weekly · Sun 5:00 PM');
  });
  it('falls back to Scheduled for foreign/invalid cron', () => {
    expect(cadenceLabel('*/5 * * * *')).toBe('Scheduled');
    expect(cadenceLabel('garbage')).toBe('Scheduled');
  });
});

describe('cadenceToCron', () => {
  it('builds canonical cron for hourly', () => {
    expect(cadenceToCron({ cadence: 'hourly', minute: 15 })).toBe('15 * * * *');
    expect(cadenceToCron({ cadence: 'hourly' })).toBe('0 * * * *');
  });
  it('builds canonical cron for daily', () => {
    expect(cadenceToCron({ cadence: 'daily', hour: 8, minute: 0 })).toBe('0 8 * * *');
    expect(cadenceToCron({ cadence: 'daily', hour: 17, minute: 30 })).toBe('30 17 * * *');
  });
  it('builds canonical cron for weekly (Mon 08:00)', () => {
    expect(cadenceToCron({ cadence: 'weekly', weekday: 1, hour: 8, minute: 0 })).toBe('0 8 * * 1');
    expect(cadenceToCron({ cadence: 'weekly', weekday: 0, hour: 23, minute: 59 })).toBe('59 23 * * 0');
  });
  it('clamps out-of-range fields', () => {
    expect(cadenceToCron({ cadence: 'daily', hour: 99, minute: -5 })).toBe('0 23 * * *');
    expect(cadenceToCron({ cadence: 'weekly', weekday: 12, hour: 8, minute: 0 })).toBe('0 8 * * 6');
  });
});

describe('cronToCadence (round-trip + reject foreign cron)', () => {
  it('round-trips our canonical strings', () => {
    expect(cronToCadence('15 * * * *')).toMatchObject({ cadence: 'hourly', minute: 15 });
    expect(cronToCadence('0 8 * * *')).toMatchObject({ cadence: 'daily', minute: 0, hour: 8 });
    expect(cronToCadence('0 8 * * 1')).toMatchObject({ cadence: 'weekly', minute: 0, hour: 8, weekday: 1 });
  });
  it('rejects non-canonical / dangerous cron', () => {
    expect(cronToCadence('*/5 * * * *')).toBeNull();      // step
    expect(cronToCadence('0 8 1 * *')).toBeNull();        // day-of-month set
    expect(cronToCadence('0 8 * 6 *')).toBeNull();        // month set
    expect(cronToCadence('0 8 * *')).toBeNull();          // 4 fields
    expect(cronToCadence('99 8 * * *')).toBeNull();       // bad minute
    expect(cronToCadence('')).toBeNull();
  });
});

describe('normalizeCadence', () => {
  it('applies defaults', () => {
    expect(normalizeCadence({ cadence: 'weekly' })).toEqual({ cadence: 'weekly', minute: 0, hour: 9, weekday: 1 });
  });
});

describe('nextRunAt - daily', () => {
  const tz = 'America/New_York';
  it('returns today if the slot is still in the future (same day)', () => {
    // 2026-03-20 is EDT (UTC-4). 08:00 EDT = 12:00 UTC.
    const after = new Date('2026-03-20T10:00:00Z'); // 06:00 EDT, before 08:00 slot
    const next = nextRunAt('0 8 * * *', tz, after);
    expect(next.toISOString()).toBe('2026-03-20T12:00:00.000Z');
  });
  it('rolls to the next day when the slot already passed today', () => {
    const after = new Date('2026-03-20T13:00:00Z'); // 09:00 EDT, after 08:00 slot
    const next = nextRunAt('0 8 * * *', tz, after);
    expect(next.toISOString()).toBe('2026-03-21T12:00:00.000Z');
  });
});

describe('nextRunAt - hourly', () => {
  const tz = 'America/New_York';
  it('returns the next minute-M slot this hour', () => {
    const after = new Date('2026-03-20T13:10:00Z'); // minute 10
    const next = nextRunAt('30 * * * *', tz, after); // minute 30
    expect(next.toISOString()).toBe('2026-03-20T13:30:00.000Z');
  });
  it('rolls to next hour when the minute already passed', () => {
    const after = new Date('2026-03-20T13:45:00Z');
    const next = nextRunAt('30 * * * *', tz, after);
    expect(next.toISOString()).toBe('2026-03-20T14:30:00.000Z');
  });
});

describe('nextRunAt - weekly', () => {
  const tz = 'America/New_York';
  it('advances to the next Monday at 08:00 local', () => {
    // 2026-03-20 is a Friday. Next Monday is 2026-03-23. 08:00 EDT = 12:00 UTC.
    const after = new Date('2026-03-20T13:00:00Z');
    const next = nextRunAt('0 8 * * 1', tz, after);
    expect(next.toISOString()).toBe('2026-03-23T12:00:00.000Z');
  });
  it('returns same day if today is the weekday and slot is still future', () => {
    // 2026-03-23 is a Monday. after = 05:00 EDT, slot 08:00 EDT.
    const after = new Date('2026-03-23T09:00:00Z'); // 05:00 EDT
    const next = nextRunAt('0 8 * * 1', tz, after);
    expect(next.toISOString()).toBe('2026-03-23T12:00:00.000Z');
  });
});

describe('nextRunAt - timezone offset correctness', () => {
  it('daily 08:00 in a non-US zone resolves to the right UTC instant', () => {
    // Asia/Tokyo is UTC+9, no DST. 08:00 JST = 23:00 prior-day UTC.
    const after = new Date('2026-06-01T00:00:00Z'); // 09:00 JST Jun 1, after 08:00
    const next = nextRunAt('0 8 * * *', 'Asia/Tokyo', after);
    // Next 08:00 JST is Jun 2 08:00 JST = Jun 1 23:00 UTC.
    expect(next.toISOString()).toBe('2026-06-01T23:00:00.000Z');
  });
});

describe('nextRunAt - DST transition (spring forward)', () => {
  it('daily 08:00 before/after US spring-forward stays at 08:00 local', () => {
    const tz = 'America/New_York';
    // US DST 2026 begins Sun Mar 8. Before: EST (UTC-5) -> 08:00 = 13:00 UTC.
    const beforeDst = new Date('2026-03-06T14:00:00Z'); // Mar 6 09:00 EST
    const n1 = nextRunAt('0 8 * * *', tz, beforeDst);
    expect(n1.toISOString()).toBe('2026-03-07T13:00:00.000Z'); // 08:00 EST

    // After the switch (Mar 9): EDT (UTC-4) -> 08:00 = 12:00 UTC.
    const afterDst = new Date('2026-03-09T14:00:00Z'); // Mar 9 10:00 EDT
    const n2 = nextRunAt('0 8 * * *', tz, afterDst);
    expect(n2.toISOString()).toBe('2026-03-10T12:00:00.000Z'); // 08:00 EDT
  });
});

describe('nextRunAt - defensive on unknown cron', () => {
  it('pushes ~1h out rather than guessing a fire time', () => {
    const after = new Date('2026-03-20T13:00:00Z');
    const next = nextRunAt('*/5 * * * *', 'America/New_York', after);
    expect(next.getTime()).toBe(after.getTime() + 3600_000);
  });
});
