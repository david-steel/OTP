/**
 * Meeting lifecycle -- shared end path + the 1-hour auto-end safety net.
 *
 * endMeetingCore is the single place a meeting transitions to `completed`:
 * it re-snapshots the scorecard, stamps endedAt, rolls the next recurrence,
 * and emits audit + realtime events. The API POST /meetings/:id/end and the
 * auto-end sweep both call it, so a meeting ends the same way no matter who
 * (or what) ends it. Ending is non-destructive -- everything entered stays on
 * the row; only status/endedAt/scorecardSnapshot change.
 *
 * The auto-end sweep completes meetings left in_progress past their auto_end_at
 * deadline. It runs lazily (on meeting/list page loads) and via a periodic cron
 * backstop, so a meeting someone forgot to end does not linger forever.
 */
import { and, eq, isNull, isNotNull, lte } from 'drizzle-orm';
import cron from 'node-cron';
import { db } from '../config/database.js';
import { meetings, auditLogs } from '../db/schema.js';
import { createAuditEntry } from './audit-logger.js';
import { emitOrgEventSafe } from './org-events.js';
import { publishMeetingUpdate } from './meeting-bus.js';
import { ensureNextOccurrence } from './meeting-recurrence.js';
import { buildScorecardSnapshot } from './meeting-resnapshot.js';

type MeetingRow = typeof meetings.$inferSelect;

export interface EndMeetingResult {
  meeting: MeetingRow;
  nextOccurrence: MeetingRow | null;
}

/**
 * Complete a meeting. Idempotent: a meeting already `completed` is left
 * untouched and returns null (so a manual End racing the auto-end sweep, or a
 * double-click, is harmless). Returns null if the meeting does not exist.
 *
 * @param opts.reason  'manual' (a person pressed End) or 'auto' (the safety net).
 * @param opts.at      The end timestamp to record. Auto-end passes the deadline
 *                     (auto_end_at) so endedAt reflects when it *should* have
 *                     ended, not when a late sweep happened to notice.
 * @param opts.actorId Clerk user id of the person ending it, when known.
 */
export async function endMeetingCore(
  orgId: string,
  meetingId: string,
  opts: { reason: 'manual' | 'auto'; at?: Date; actorId?: string | null } = { reason: 'manual' },
): Promise<EndMeetingResult | null> {
  const at = opts.at ?? new Date();

  const [existing] = await db.select({ teamId: meetings.teamId, status: meetings.status })
    .from(meetings)
    .where(and(eq(meetings.id, meetingId), eq(meetings.organizationId, orgId)))
    .limit(1);
  if (!existing) return null;
  if (existing.status === 'completed') return null;

  // Re-snapshot the scorecard so the completed record preserves the FINAL
  // reviewed KPI values. Rocks deliberately render live (meeting-snapshot.ts).
  const scorecardSnapshot = await buildScorecardSnapshot(orgId, existing.teamId);

  const [updated] = await db.update(meetings)
    .set({ status: 'completed', endedAt: at, scorecardSnapshot, updatedAt: new Date() })
    .where(and(
      eq(meetings.id, meetingId),
      eq(meetings.organizationId, orgId),
      // Guard against a race: only the call that actually flips it off
      // 'completed' proceeds; a loser sees 0 rows and bails below.
      isNull(meetings.deletedAt),
    ))
    .returning();
  if (!updated || updated.status !== 'completed') return null;

  await db.insert(auditLogs).values(createAuditEntry('meeting.ended', 'meeting', {
    orgId, entityId: meetingId, details: { reason: opts.reason },
  }));

  // Roll the next occurrence forward so a recurring series always has an
  // upcoming meeting. Best-effort: a recurrence failure must not break ending.
  let nextOccurrence: MeetingRow | null = null;
  if (updated.recurrenceRule) {
    try {
      nextOccurrence = await ensureNextOccurrence(updated);
      if (nextOccurrence) {
        await db.insert(auditLogs).values(createAuditEntry('meeting.recurrence.rolled', 'meeting', {
          orgId, entityId: nextOccurrence.id, details: { fromMeetingId: meetingId, scheduledAt: nextOccurrence.scheduledAt },
        }));
      }
    } catch (err) {
      console.error('[meeting-lifecycle] ensureNextOccurrence failed', { meetingId, err });
    }
  }

  publishMeetingUpdate(meetingId, { kind: 'meeting', action: 'ended' });
  await emitOrgEventSafe({
    orgId, topic: 'meeting', entityType: 'meeting', entityId: meetingId, action: 'ended',
    teamId: updated.teamId,
    actorType: opts.actorId ? 'user' : 'agent',
    actorId: opts.actorId || (opts.reason === 'auto' ? 'auto_end' : 'api_key'),
  });

  return { meeting: updated, nextOccurrence };
}

/**
 * Complete every meeting left in_progress past its auto_end_at deadline.
 * Scoped to one org when `orgId` is given (the lazy page-load path), or the
 * whole platform when omitted (the cron backstop). Returns how many ended.
 */
export async function autoEndStaleMeetings(orgId?: string): Promise<number> {
  const now = new Date();
  const conditions = [
    eq(meetings.status, 'in_progress'),
    isNotNull(meetings.autoEndAt),
    lte(meetings.autoEndAt, now),
    isNull(meetings.deletedAt),
  ];
  if (orgId) conditions.push(eq(meetings.organizationId, orgId));

  const stale = await db.select({
    id: meetings.id, organizationId: meetings.organizationId, autoEndAt: meetings.autoEndAt,
  }).from(meetings).where(and(...conditions));

  let ended = 0;
  for (const m of stale) {
    try {
      const res = await endMeetingCore(m.organizationId, m.id, { reason: 'auto', at: m.autoEndAt ?? now });
      if (res) ended++;
    } catch (err) {
      console.error('[meeting-lifecycle] auto-end failed for meeting', { meetingId: m.id, err });
    }
  }
  return ended;
}

let scheduled = false;
/**
 * Periodic backstop for the auto-end net. The lazy page-load sweep handles the
 * common case; this catches a meeting nobody loads a page for. Every 5 minutes,
 * platform-wide. Idempotent and cheap (a no-op when nothing is stale).
 */
export function startMeetingAutoEndScheduler(): void {
  if (scheduled) return;
  scheduled = true;
  cron.schedule('*/5 * * * *', () => {
    void autoEndStaleMeetings().then((n) => {
      if (n > 0) console.log(`[meeting-lifecycle] auto-ended ${n} stale meeting(s)`);
    }).catch((err) => console.error('[meeting-lifecycle] backstop tick failed', err));
  });
  console.log('[meeting-lifecycle] auto-end backstop started (every 5 min)');
}
