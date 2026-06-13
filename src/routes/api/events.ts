// Realtime sync (R1) -- the org-wide live event stream.
//
//   GET /api/v1/events/stream            (Server-Sent Events)
//   GET /api/v1/events/stream?topics=rock,kpi
//
// Holds an open text/event-stream connection scoped to the caller's org (via
// getAuthOrg -- same resolver as every other API, so it inherits Clerk session,
// API key, legacy-founder, AND impersonation paths). The browser's EventSource
// auto-reconnects and resends Last-Event-ID; on reconnect we replay missed
// events from the org_events outbox, or signal `resync` if the gap is too big.
//
// Frames:
//   event: ready    data: { lastEventId, topics }      -- sent once after replay
//   event: org-event id: <n> data: { id, topic, ... }  -- one per change
//   event: resync   data: { reason }                   -- do a full refetch
//   : keepalive ...                                     -- every 25s
//
// Gated by REALTIME_STREAM_ENABLED (default OFF -> the route 404s, so shipping
// it is inert). The meeting-bus + /l8/meeting/:id stream are untouched.

import type { FastifyInstance } from 'fastify';
import { getAuthOrg } from '../../middleware/auth-helpers.js';
import {
  subscribeToOrgEvents,
  parseTopicFilter,
  formatOrgEventFrame,
  orgSubscriberCount,
  totalSubscriberCount,
  type OrgEventEnvelope,
} from '../../services/event-bus.js';
import { getOrgEventsSince } from '../../services/org-events.js';

// Connection caps protect the single dyno from socket exhaustion. Tunable via
// env; node handles thousands of idle sockets but the pg pool (max 10) is the
// real ceiling -- the stream handler holds NO pg connection while idle, so the
// cap is generous.
const PER_ORG_CAP = Number(process.env.REALTIME_PER_ORG_CAP) || 50;
const GLOBAL_CAP = Number(process.env.REALTIME_GLOBAL_CAP) || 2000;
const REPLAY_LIMIT = 500;

export function isStreamEnabled(): boolean {
  return process.env.REALTIME_STREAM_ENABLED === 'true';
}

/** Extract a numeric Last-Event-ID from the header or ?lastEventId= query. */
export function parseLastEventId(
  header: string | string[] | undefined,
  query: string | undefined,
): number | null {
  const raw = (Array.isArray(header) ? header[0] : header) ?? query;
  if (raw == null || !/^\d+$/.test(String(raw))) return null;
  return Number(raw);
}

export default async function eventsRoutes(app: FastifyInstance) {
  app.get<{ Querystring: { topics?: string; lastEventId?: string } }>(
    '/events/stream',
    async (request, reply) => {
      if (!isStreamEnabled()) {
        return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Not found' } });
      }
      const org = await getAuthOrg(request);
      if (!org) {
        return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
      }

      if (totalSubscriberCount() >= GLOBAL_CAP || orgSubscriberCount(org.id) >= PER_ORG_CAP) {
        return reply.status(503).send({ error: { code: 'STREAM_BUSY', message: 'Too many live connections; retry shortly' } });
      }

      const topics = parseTopicFilter(request.query.topics);
      const sinceId = parseLastEventId(request.headers['last-event-id'], request.query.lastEventId);

      // Take over the raw socket (Fastify has no built-in SSE helper).
      reply.hijack();
      const raw = reply.raw;
      raw.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      });
      // Padding so some proxies start streaming immediately.
      raw.write(':' + ' '.repeat(2048) + '\n\n');
      raw.write('retry: 5000\n\n');

      let closed = false;
      function writeRaw(s: string): void {
        if (closed || raw.writableEnded) return;
        try { raw.write(s); } catch { /* ignore a dead socket */ }
      }

      // --- Replay-then-live with NO gap ---
      // Subscribe FIRST and buffer live events while we run the replay query,
      // then flush the buffer skipping any id already replayed. Without this, an
      // event landing between the replay SELECT and the subscribe() would be
      // lost.
      let replaying = true;
      const buffered: OrgEventEnvelope[] = [];
      let lastDeliveredId = sinceId ?? 0;

      const subscription = subscribeToOrgEvents({
        orgId: org.id,
        topics,
        send: (env) => {
          if (replaying) { buffered.push(env); return; }
          if (env.id <= lastDeliveredId) return; // dedupe vs replay/buffer
          lastDeliveredId = env.id;
          writeRaw(formatOrgEventFrame(env));
        },
      });

      try {
        if (sinceId != null) {
          const { events, overflow } = await getOrgEventsSince(org.id, sinceId, REPLAY_LIMIT, topics);
          if (overflow) {
            writeRaw('event: resync\ndata: {"reason":"gap_exceeds_window"}\n\n');
          } else {
            for (const env of events) {
              if (env.id <= lastDeliveredId) continue;
              lastDeliveredId = env.id;
              writeRaw(formatOrgEventFrame(env));
            }
          }
        }
      } catch {
        // A replay failure must not kill the live stream; tell the client to
        // refetch so it doesn't sit on a stale view.
        writeRaw('event: resync\ndata: {"reason":"replay_failed"}\n\n');
      }

      // Flush anything that arrived during replay, then go live.
      replaying = false;
      for (const env of buffered) {
        if (env.id <= lastDeliveredId) continue;
        lastDeliveredId = env.id;
        writeRaw(formatOrgEventFrame(env));
      }
      buffered.length = 0;

      writeRaw('event: ready\ndata: ' + JSON.stringify({
        lastEventId: lastDeliveredId,
        topics: topics ? [...topics] : null,
      }) + '\n\n');

      // Keepalive below Railway's ~30s idle cap.
      const keepalive = setInterval(() => {
        writeRaw(': keepalive ' + Date.now() + '\n\n');
      }, 25_000);
      keepalive.unref?.();

      const cleanup = () => {
        if (closed) return;
        closed = true;
        clearInterval(keepalive);
        subscription.unsubscribe();
        try { raw.end(); } catch { /* ignore */ }
      };
      request.raw.on('close', cleanup);
      request.raw.on('error', cleanup);
      // No return -- reply.hijack() handed us the socket; it stays open until
      // the client disconnects.
    },
  );
}
