// In-memory event bus + presence tracker for live meetings.
//
// Holds an open SSE subscriber set per meeting id, lets routes publish
// change events ("rock", "todo", "checkin", ...) to everyone watching
// that meeting, and tracks who's currently viewing so the UI can show
// presence dots.
//
// Single-instance only. Railway currently runs OTP on one dyno; if we
// scale to multiple, this needs a Redis pub/sub layer underneath. Keep
// the public surface (publishMeetingUpdate / subscribeToMeeting) so the
// swap is mechanical.

export type MeetingUpdateKind =
  | 'rock'
  | 'kpi'
  | 'todo'
  | 'issue'
  | 'headline'
  | 'checkin'
  | 'attendees'
  | 'meeting'
  | 'rating';

export interface MeetingUpdate {
  kind: MeetingUpdateKind;
  action?: string;
  entityId?: string;
}

export interface PresenceInfo {
  subscriberId: string;
  name: string;
  externalId: string | null;
  joinedAt: number;
  lastSeen: number;
}

interface Subscriber {
  id: string;
  meetingId: string;
  presence: PresenceInfo;
  send: (event: string, data: unknown) => void;
  close: () => void;
}

const PRESENCE_TTL_MS = 35_000;

const byMeeting = new Map<string, Set<Subscriber>>();
// Track each subscribed meeting's teamId so mutations on team-scoped
// data (todos, rocks, issues, headlines) can fan out to live meetings
// of that team without a DB lookup.
const meetingTeamId = new Map<string, string | null>();
let cleanupTimer: NodeJS.Timeout | null = null;

function ensureCleanupTimer() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => sweepStalePresence(), 10_000);
  cleanupTimer.unref?.();
}

function sweepStalePresence() {
  const now = Date.now();
  for (const [meetingId, subs] of byMeeting) {
    let changed = false;
    for (const s of [...subs]) {
      if (now - s.presence.lastSeen > PRESENCE_TTL_MS) {
        subs.delete(s);
        try { s.close(); } catch { /* ignore */ }
        changed = true;
      }
    }
    if (changed) broadcastPresence(meetingId);
    if (subs.size === 0) byMeeting.delete(meetingId);
  }
}

function presenceListFor(meetingId: string): PresenceInfo[] {
  const subs = byMeeting.get(meetingId);
  if (!subs) return [];
  return [...subs].map((s) => ({ ...s.presence }));
}

function broadcastPresence(meetingId: string) {
  const subs = byMeeting.get(meetingId);
  if (!subs) return;
  const payload = { meetingId, presence: presenceListFor(meetingId) };
  for (const s of subs) {
    try { s.send('presence', payload); } catch { /* ignore */ }
  }
}

export function subscribeToMeeting(opts: {
  meetingId: string;
  teamId: string | null;
  name: string;
  externalId: string | null;
  send: (event: string, data: unknown) => void;
  close: () => void;
}): { subscriberId: string; unsubscribe: () => void; touch: () => void } {
  ensureCleanupTimer();
  const id = 'sub_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  const now = Date.now();
  const sub: Subscriber = {
    id,
    meetingId: opts.meetingId,
    presence: {
      subscriberId: id,
      name: opts.name,
      externalId: opts.externalId,
      joinedAt: now,
      lastSeen: now,
    },
    send: opts.send,
    close: opts.close,
  };
  let subs = byMeeting.get(opts.meetingId);
  if (!subs) {
    subs = new Set();
    byMeeting.set(opts.meetingId, subs);
  }
  subs.add(sub);
  meetingTeamId.set(opts.meetingId, opts.teamId);
  // Push initial presence to the new subscriber and announce to the room.
  try { sub.send('presence', { meetingId: opts.meetingId, presence: presenceListFor(opts.meetingId) }); } catch { /* ignore */ }
  broadcastPresence(opts.meetingId);
  return {
    subscriberId: id,
    touch: () => {
      sub.presence.lastSeen = Date.now();
    },
    unsubscribe: () => {
      const set = byMeeting.get(opts.meetingId);
      if (!set) return;
      set.delete(sub);
      if (set.size === 0) {
        byMeeting.delete(opts.meetingId);
        meetingTeamId.delete(opts.meetingId);
      } else broadcastPresence(opts.meetingId);
    },
  };
}

// Fan a single update out to every live meeting belonging to a team.
// Used by mutation endpoints that don't know which meeting(s) are
// affected (e.g. POST /todos with kind='l10' + teamId=X -- could be
// relevant to any in-progress L10 for that team).
export function publishToTeamMeetings(teamId: string | null, update: MeetingUpdate): void {
  if (!teamId) {
    // Unscoped data: publish to every live meeting (cheap; only delivers
    // to subscribers, and the L8 view will refetch its own scope).
    for (const id of byMeeting.keys()) publishMeetingUpdate(id, update);
    return;
  }
  for (const [meetingId, mTeam] of meetingTeamId) {
    if (mTeam === teamId) publishMeetingUpdate(meetingId, update);
  }
}

// Routes call this after they mutate something tied to a meeting. The
// payload is intentionally minimal -- the client decides how to react
// (currently: hard reload). Future: include enough detail to refresh
// just the relevant section without reloading.
export function publishMeetingUpdate(meetingId: string, update: MeetingUpdate): void {
  const subs = byMeeting.get(meetingId);
  if (!subs || subs.size === 0) return;
  const payload = { meetingId, ...update, at: new Date().toISOString() };
  for (const s of subs) {
    try { s.send('meeting-updated', payload); } catch { /* ignore */ }
  }
}

// For debugging / admin: snapshot of who's in each meeting.
export function meetingBusSnapshot(): Array<{ meetingId: string; subscribers: PresenceInfo[] }> {
  return [...byMeeting.entries()].map(([meetingId, subs]) => ({
    meetingId,
    subscribers: [...subs].map((s) => ({ ...s.presence })),
  }));
}
