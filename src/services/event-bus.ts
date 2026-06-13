// Org-scoped in-process event bus for the live SSE stream (realtime sync R1).
//
// Pure in-process pub/sub: NO database import, so it's unit-testable without
// DATABASE_URL (the hard repo constraint) and safe to import anywhere. The R0
// outbox writer (services/org-events.ts) calls publishOrgEvent() after each
// committed insert; the stream route (routes/api/events.ts) subscribes per
// connection and writes frames to the socket.
//
// SINGLE-INSTANCE ONLY. Railway runs OTP on one dyno today. R4 puts a Postgres
// LISTEN/NOTIFY backplane UNDER this same publish/subscribe surface so a client
// on instance A receives events emitted on instance B -- keep the public
// surface (publishOrgEvent / subscribeToOrgEvents) stable so that swap is
// mechanical.
//
// DISTINCT from services/meeting-bus.ts on purpose: that bus is the per-meeting
// room + presence channel powering /l8/meeting/:id and stays untouched. This
// bus is the org-wide, topic-filtered firehose for dashboards/bell/etc.

// What a subscriber receives and what the SSE frame carries. THIN by design --
// ids + hints only; clients refetch through the normal authorized GET, so the
// channel can never leak more than the REST API already allows.
export interface OrgEventEnvelope {
  id: number;            // org_events.id -- monotonic; doubles as the SSE id:/Last-Event-ID cursor
  orgId: string;
  topic: string;
  teamId: string | null;
  entityType: string;
  entityId: string | null;
  action: string;
  at: string;            // ISO timestamp
}

interface OrgSubscriber {
  id: string;
  orgId: string;
  topics: Set<string> | null; // null = all topics for this org
  send: (env: OrgEventEnvelope) => void;
}

const byOrg = new Map<string, Set<OrgSubscriber>>();
let totalSubscribers = 0;

/** Parse a `?topics=rock,kpi` filter into a Set, or null for "all topics". */
export function parseTopicFilter(raw: string | string[] | undefined | null): Set<string> | null {
  if (!raw) return null;
  const str = Array.isArray(raw) ? raw.join(',') : String(raw);
  const parts = str.split(',').map((s) => s.trim()).filter(Boolean);
  return parts.length ? new Set(parts) : null;
}

export function topicMatches(filter: Set<string> | null, topic: string): boolean {
  return filter === null || filter.has(topic);
}

export function orgSubscriberCount(orgId: string): number {
  return byOrg.get(orgId)?.size ?? 0;
}

export function totalSubscriberCount(): number {
  return totalSubscribers;
}

export function subscribeToOrgEvents(opts: {
  orgId: string;
  topics: Set<string> | null;
  send: (env: OrgEventEnvelope) => void;
}): { id: string; unsubscribe: () => void } {
  const id = 'osub_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  const sub: OrgSubscriber = { id, orgId: opts.orgId, topics: opts.topics, send: opts.send };
  let set = byOrg.get(opts.orgId);
  if (!set) { set = new Set(); byOrg.set(opts.orgId, set); }
  set.add(sub);
  totalSubscribers++;
  return {
    id,
    unsubscribe: () => {
      const s = byOrg.get(opts.orgId);
      if (!s || !s.has(sub)) return; // idempotent
      s.delete(sub);
      totalSubscribers--;
      if (s.size === 0) byOrg.delete(opts.orgId);
    },
  };
}

/**
 * Fan an event out to every subscriber of THIS org whose topic filter matches.
 * Tenancy is enforced here by construction: we only ever look at byOrg.get(
 * env.orgId), so a subscriber for org A can never be handed an org B event.
 */
export function publishOrgEvent(env: OrgEventEnvelope): void {
  const set = byOrg.get(env.orgId);
  if (!set || set.size === 0) return;
  for (const sub of set) {
    if (!topicMatches(sub.topics, env.topic)) continue;
    try { sub.send(env); } catch { /* a dead socket must not break the fan-out */ }
  }
}

/** SSE frame WITH an `id:` line so the browser resends it as Last-Event-ID. */
export function formatOrgEventFrame(env: OrgEventEnvelope): string {
  return `id: ${env.id}\nevent: org-event\ndata: ${JSON.stringify(env)}\n\n`;
}
