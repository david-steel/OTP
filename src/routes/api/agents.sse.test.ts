// Unit tests for the run endpoint's SSE content-negotiation + wire format.
// Pure helpers only -- no Fastify app, no Anthropic, no socket. agents.ts
// transitively imports config/database.ts; a DATABASE_URL placeholder is safe
// since no query runs in these pure tests.
import { describe, it, expect, beforeAll } from 'vitest';

let wantsEventStream: (accept: unknown) => boolean;
let sseFrame: (payload: unknown) => string;

beforeAll(async () => {
  process.env.DATABASE_URL ||= 'postgres://unused:unused@127.0.0.1:5/unused';
  ({ wantsEventStream, sseFrame } = await import('./agents.js'));
});

describe('wantsEventStream (content negotiation: stream vs JSON)', () => {
  it('is TRUE when Accept includes text/event-stream', () => {
    expect(wantsEventStream('text/event-stream')).toBe(true);
    expect(wantsEventStream('text/event-stream, */*')).toBe(true);
    expect(wantsEventStream('TEXT/EVENT-STREAM')).toBe(true);
  });

  it('is FALSE for JSON / wildcard / missing Accept (back-compat JSON path)', () => {
    expect(wantsEventStream('application/json')).toBe(false);
    expect(wantsEventStream('*/*')).toBe(false);
    expect(wantsEventStream('')).toBe(false);
    expect(wantsEventStream(undefined)).toBe(false);
    expect(wantsEventStream(null)).toBe(false);
    expect(wantsEventStream(['text/event-stream'])).toBe(false); // non-string -> JSON path
  });
});

describe('sseFrame (SSE wire format)', () => {
  it('formats a delta frame as `data: <json>\\n\\n`', () => {
    expect(sseFrame({ t: 'hello' })).toBe('data: {"t":"hello"}\n\n');
  });

  it('formats the final done frame with the run metadata', () => {
    const frame = sseFrame({ done: true, runId: 'r1', status: 'succeeded', outputHtml: '<p>hi</p>' });
    expect(frame.startsWith('data: ')).toBe(true);
    expect(frame.endsWith('\n\n')).toBe(true);
    const parsed = JSON.parse(frame.slice('data: '.length).trim());
    expect(parsed.done).toBe(true);
    expect(parsed.status).toBe('succeeded');
    expect(parsed.outputHtml).toBe('<p>hi</p>');
  });

  it('formats an error frame', () => {
    expect(sseFrame({ error: 'boom' })).toBe('data: {"error":"boom"}\n\n');
  });
});
