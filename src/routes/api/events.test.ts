// Pure-helper tests for the SSE stream route (realtime sync R1). The socket
// handler itself isn't inject-testable (reply.hijack takes over the raw socket,
// like the meeting events endpoint), so we cover the pure decision helpers here
// and the delivery/replay logic in event-bus.test.ts + org-events.test.ts.
// events.ts transitively imports config/database.ts; a DATABASE_URL placeholder
// is safe since no query runs in these pure tests.
import { describe, it, expect, beforeAll } from 'vitest';

let parseLastEventId: (h: string | string[] | undefined, q: string | undefined) => number | null;
let isStreamEnabled: () => boolean;

beforeAll(async () => {
  process.env.DATABASE_URL ||= 'postgres://unused:unused@127.0.0.1:5/unused';
  ({ parseLastEventId, isStreamEnabled } = await import('./events.js'));
});

describe('parseLastEventId', () => {
  it('reads a numeric Last-Event-ID header', () => {
    expect(parseLastEventId('42', undefined)).toBe(42);
  });
  it('falls back to the query param when no header', () => {
    expect(parseLastEventId(undefined, '7')).toBe(7);
  });
  it('prefers the header over the query', () => {
    expect(parseLastEventId('5', '9')).toBe(5);
  });
  it('takes the first value of an array header', () => {
    expect(parseLastEventId(['3', '4'], undefined)).toBe(3);
  });
  it('returns null for missing or non-numeric values', () => {
    expect(parseLastEventId(undefined, undefined)).toBeNull();
    expect(parseLastEventId('abc', undefined)).toBeNull();
    expect(parseLastEventId('', '')).toBeNull();
    expect(parseLastEventId('12x', undefined)).toBeNull();
  });
});

describe('isStreamEnabled', () => {
  it('is true only when REALTIME_STREAM_ENABLED === "true"', () => {
    const prev = process.env.REALTIME_STREAM_ENABLED;
    process.env.REALTIME_STREAM_ENABLED = 'true';
    expect(isStreamEnabled()).toBe(true);
    process.env.REALTIME_STREAM_ENABLED = 'false';
    expect(isStreamEnabled()).toBe(false);
    delete process.env.REALTIME_STREAM_ENABLED;
    expect(isStreamEnabled()).toBe(false);
    if (prev !== undefined) process.env.REALTIME_STREAM_ENABLED = prev;
  });
});
