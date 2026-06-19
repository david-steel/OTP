# Live Updates on the Meeting Dashboard — Build Spec

**Goal:** When anyone edits a meeting (KPI value, headline, todo, attendee, scorecard) all other viewers of `/l8/meeting/:id` see the change without refreshing.

**Approach:** Two phases. Ship Phase 1 to validate the transport and broadcast plumbing on Railway. Upgrade to Phase 2 once stable.

---

## Stack assumptions (already in repo)

- Fastify 5
- Clerk Fastify 3.1.2 (session validation already wired)
- Drizzle + Postgres (`pg` driver) on Railway
- EJS server-rendered views, no client framework
- Single Railway instance today

No Redis. No socket library yet. No client framework.

---

## Shared design (both phases)

### Broadcast bus: Postgres LISTEN/NOTIFY

Use Postgres `NOTIFY` as the broadcast bus from day one. This unlocks three things:

1. Multi-instance scaling later (free).
2. Background jobs (`otp-cascade-pull.py`, scheduled tasks, agent inboxes) can broadcast by issuing one SQL statement — no need to import Node modules.
3. The transport layer (SSE today, Socket.io tomorrow) becomes a thin subscriber on top.

**Channel name:** `meeting_events`
**Payload shape (JSON, kept under 8KB Postgres NOTIFY limit):**
```json
{
  "meeting_id": "uuid",
  "type": "kpi_value | headline_added | headline_addressed | todo_added | todo_updated | attendee_changed | scorecard_refreshed | meeting_deleted",
  "actor": { "external_id": "...", "name": "..." },
  "data": { "...": "type-specific minimal payload" },
  "ts": "2026-05-25T19:50:00.000Z",
  "seq": 12847
}
```

`seq` is a monotonic bigint from a new `event_seq` Postgres sequence. Clients use it for reconnect-replay.

### New table: `meeting_events`

Persist every event for reconnect-replay and audit.

```sql
CREATE TABLE meeting_events (
  seq        bigserial PRIMARY KEY,
  meeting_id uuid NOT NULL,
  type       text NOT NULL,
  actor_id   text,
  actor_name text,
  data       jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX meeting_events_meeting_seq_idx ON meeting_events (meeting_id, seq);
```

Self-heal in `src/db/ensure-meeting-events.ts` matching the existing `ensure-*.ts` pattern.

### Broadcast helper

`src/services/meeting-events.ts`:

```ts
export async function emitMeetingEvent(input: {
  meetingId: string;
  type: MeetingEventType;
  actor: { externalId: string; name: string };
  data: Record<string, unknown>;
}) {
  // 1. INSERT into meeting_events RETURNING seq
  // 2. pg_notify('meeting_events', JSON.stringify({...input, seq, ts}))
  // Both inside one transaction so seq order matches NOTIFY order.
}
```

Every meeting-mutating route handler calls `emitMeetingEvent` after a successful write. Wire into existing routes (paths below already exist from prior rounds):

- `PUT /api/v1/meetings/:id/kpi-values` → `kpi_value`
- `POST /api/v1/meetings/:id/headlines` → `headline_added`
- `POST /api/v1/meetings/:id/headlines/:hid/address` → `headline_addressed`
- `POST /api/v1/todos` (when `meeting_id` present) → `todo_added`
- `PUT /api/v1/todos/:id` → `todo_updated`
- `POST /api/v1/meetings/:id/refresh-scorecard` → `scorecard_refreshed`
- `DELETE /api/v1/meetings/:id` → `meeting_deleted`
- Attendee picker save → `attendee_changed`

### Auth

Both phases use Clerk session validation on connect. Reject connection if:
- No valid Clerk session, OR
- User not in `attendees` jsonb AND not in `team_memberships` for the meeting's team. (Reuse `isAttendee()` from `src/services/meeting-access.ts`.)

---

## Phase 1 — SSE (half day)

**Why first:** Zero new dependencies. Fastify 5 supports SSE via raw response writes. Railway proxy handles SSE reliably. Proves the broadcast bus works before adding a socket library.

### New endpoint

`GET /api/v1/meetings/:id/stream`

```ts
fastify.get('/api/v1/meetings/:id/stream', async (req, reply) => {
  // 1. Validate Clerk session (preHandler)
  // 2. Validate meeting access (isAttendee)
  // 3. Set SSE headers
  reply.raw.setHeader('Content-Type', 'text/event-stream');
  reply.raw.setHeader('Cache-Control', 'no-cache, no-transform');
  reply.raw.setHeader('Connection', 'keep-alive');
  reply.raw.setHeader('X-Accel-Buffering', 'no'); // Railway/nginx
  reply.raw.flushHeaders();

  // 4. Optional replay: if ?since=<seq>, fetch meeting_events WHERE seq > since
  //    AND meeting_id = :id ORDER BY seq, write each as `data: {...}\n\n`
  // 5. Subscribe to internal EventEmitter for this meeting_id
  // 6. On each emitted event: reply.raw.write(`id: ${seq}\ndata: ${json}\n\n`)
  // 7. Heartbeat every 25s: reply.raw.write(`: ping\n\n`)
  // 8. On client disconnect (`req.raw.on('close')`): unsubscribe, clear heartbeat
});
```

### Internal pub/sub bridge

One singleton in `src/services/meeting-events.ts`:

- On boot, open a dedicated `pg` client, run `LISTEN meeting_events`.
- On `notification` event, parse payload, emit on a Node `EventEmitter` keyed by `meeting_id`.
- SSE endpoints subscribe to that emitter for their `meeting_id`.

### Client

Add `src/views/partials/meeting-live.ejs` (included once at the bottom of `meeting.ejs`):

```html
<script>
(function() {
  const meetingId = '<%= meeting.id %>';
  let lastSeq = Number(document.body.dataset.lastSeq || 0);
  let es;

  function connect() {
    es = new EventSource(`/api/v1/meetings/${meetingId}/stream?since=${lastSeq}`);
    es.onmessage = (e) => {
      const evt = JSON.parse(e.data);
      lastSeq = evt.seq;
      applyEvent(evt); // dispatch on evt.type
    };
    es.onerror = () => {
      es.close();
      setTimeout(connect, 2000); // simple backoff
    };
  }

  function applyEvent(evt) {
    // Phase 1: reload the affected section by fetching an HTML fragment
    // GET /l8/meeting/:id/fragment/{scorecard|headlines|todos|attendees}
    // Swap into document via innerHTML on the matching <section data-live="...">
    const map = {
      kpi_value: 'scorecard',
      scorecard_refreshed: 'scorecard',
      headline_added: 'headlines',
      headline_addressed: 'headlines',
      todo_added: 'todos',
      todo_updated: 'todos',
      attendee_changed: 'attendees',
      meeting_deleted: null,
    };
    const section = map[evt.type];
    if (section === null) { window.location.href = '/dashboard'; return; }
    if (!section) return;
    fetch(`/l8/meeting/${meetingId}/fragment/${section}`)
      .then(r => r.text())
      .then(html => {
        const target = document.querySelector(`section[data-live="${section}"]`);
        if (target) target.outerHTML = html;
      });
  }

  connect();
})();
</script>
```

### New fragment routes

Each meeting section gets a fragment endpoint that returns just the rendered HTML for that section:

- `GET /l8/meeting/:id/fragment/scorecard`
- `GET /l8/meeting/:id/fragment/headlines`
- `GET /l8/meeting/:id/fragment/todos`
- `GET /l8/meeting/:id/fragment/attendees`

Each renders the same EJS partial the full page renders (extract from `meeting.ejs` into `partials/meeting-scorecard.ejs` etc.) so there is one source of truth for markup.

### Acceptance criteria (Phase 1)

1. Two browsers on the same meeting. User A edits a KPI value → User B sees it update within 2 seconds, no manual refresh.
2. User B's tab sleeps for 5 minutes, then wakes. On reconnect, all events missed during sleep are replayed (verified by `data-last-seq` advancing).
3. Background script issues `SELECT pg_notify('meeting_events', '{...}')` directly in SQL → all connected browsers receive it.
4. Delete the meeting → all viewers bounced to `/dashboard`.
5. Unauthorized user gets 403 on `/stream`.
6. Heartbeat every 25s, no Railway proxy drops within a 30-minute idle session.

### Phase 1 estimated effort: 4–8 hours
- Schema + helper: 1h
- SSE endpoint + pub/sub bridge: 2h
- Fragment routes + EJS partial extraction: 2h
- Client script: 1h
- Wire `emitMeetingEvent` into existing routes: 1h
- Manual two-browser test + Railway smoke: 1h

---

## Phase 2 — Socket.io upgrade (2–3 days)

**Trigger to upgrade:** Phase 1 works in prod for 1 week with no Railway proxy issues, AND we want either (a) finer-grained DOM patches without fragment refetches, or (b) bidirectional UI signals like "Dan is editing this KPI right now."

### Changes

1. Add `socket.io` server, mount on `/socket.io` path. Keep SSE endpoint running in parallel for one release in case of rollback.
2. Each meeting gets a room: `meeting:{id}`.
3. Auth via Clerk session token passed in `socket.handshake.auth.token`. Server validates with Clerk SDK (same logic as SSE preHandler).
4. The Postgres LISTEN bridge stays. Instead of writing to SSE response, it does `io.to('meeting:' + id).emit(evt.type, evt)`.
5. Client switches from `EventSource` to `io()` connection, subscribes to event types, applies targeted DOM patches instead of fragment refetch:
   - `kpi_value` → find `<tr data-kpi-id="...">`, update `<td data-col="latest">`, flash highlight
   - `headline_added` → prepend `<li>` to headlines list with templated markup
   - `todo_updated` → patch the matching row in place
6. Add presence: on connect, broadcast `viewer_joined { name }`; render small avatar stack in the meeting header. Use socket disconnect to broadcast `viewer_left`.
7. Add "typing/editing" hints (optional): when a user focuses an editable field, emit `editing_started { field, user }`; show a soft lock indicator to others.

### What to keep, what to delete

- Keep: `meeting_events` table, `emitMeetingEvent` helper, Postgres LISTEN bridge.
- Delete after one release: SSE endpoint, `EventSource` client code, fragment routes (or keep fragment routes for non-JS fallback).

### Phase 2 estimated effort: 16–24 hours
- Socket.io install + auth handshake: 3h
- Postgres-bridge → socket emit: 1h
- Targeted DOM patchers per event type: 6h
- Presence (avatar stack, join/leave): 3h
- Editing locks (optional): 3h
- Railway WebSocket validation + heartbeat tuning: 2h
- Cross-browser test + cleanup: 2h

---

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Railway WS proxy timeouts | Phase 1 uses SSE (proven on Railway). Phase 2 only after Phase 1 is stable. |
| Clerk session not on socket connection | Pass session token in `EventSource` URL (SSE) and `socket.handshake.auth` (WS). Validate server-side identically to HTTP routes. |
| DOM drift between server EJS and client patcher | Phase 1 reuses server-rendered fragments (no duplication). Phase 2 patchers are scoped to a small number of event types — write them as small dedicated modules with unit tests. |
| Reconnect = stale state | `?since=<seq>` query on Phase 1, `socket.handshake.auth.lastSeq` on Phase 2. Server replays from `meeting_events`. |
| Multi-instance broadcast | Postgres LISTEN/NOTIFY works across instances out of the box. No code change needed when OTP scales to N pods. |
| Background jobs need to broadcast | Issue `SELECT pg_notify('meeting_events', json_build_object(...)::text)` from Python/SQL. No Node import required. |
| Lost edits on simultaneous writes | Out of scope. Display the latest value as authoritative; add "this changed under you" toast in Phase 2. |
| Memory leak from unclosed subscribers | `req.raw.on('close')` for SSE, `socket.on('disconnect')` for WS — both unsubscribe and clear heartbeat timer. Add a test. |
| 8KB NOTIFY payload limit | Keep `data` minimal. For large payloads, NOTIFY just signals "fetch full state" and client refetches the section. |
| Local dev parity with Railway | Document `npm run dev` + open two browsers test in this file. Add a `scripts/test-live-updates.sh` that issues a `pg_notify` and confirms an attached client receives it. |

---

## Out of scope

- Yjs / CRDT / true co-editing of a single text field.
- Presence cursors inside a single input.
- Conflict resolution beyond last-write-wins.
- Live updates on pages other than `/l8/meeting/:id` (dashboard, team views) — same pattern would extend, but ship meeting first.

---

## Verify & deploy

Standard OTP deploy (manual GitHub Action `deploy.yml`). After deploy:

1. Hit `/api/v1/meetings/<known-id>/stream` with `curl -N` and confirm headers + heartbeat.
2. Open two browser tabs to the same meeting as two different Clerk users, edit a KPI in tab A, watch tab B.
3. `psql $DATABASE_URL -c "SELECT pg_notify('meeting_events', '{\"meeting_id\":\"<id>\",\"type\":\"scorecard_refreshed\",\"data\":{},\"seq\":99999,\"ts\":\"2026-05-25T20:00:00Z\"}')"` and confirm both tabs react.
4. Watch Railway logs for 5 minutes idle, confirm no connection drops.

---

## Open questions for David

1. **Scope of "everyone sees changes" — does this include the `/dashboard` page** (rocks, KPIs, todos summary) or only the meeting detail page? Spec covers meeting only. Dashboard extension is the same pattern.
2. **Presence indicators in Phase 2** — show "Dan is viewing this meeting" avatar stack? Default: yes.
3. **Editing locks in Phase 2** — soft lock when someone is editing a field? Default: no, ship without it, add if asked.

---

See [[project_otp_meeting_rework]], [[project_otp_platform]], [[project_otp_deploy_manual]].
