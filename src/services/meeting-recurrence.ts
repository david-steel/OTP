/**
 * Meeting recurrence -- OTP owns the series.
 *
 * A meeting can carry an iCal RRULE (a small subset: weekly / biweekly /
 * monthly). When a recurring meeting ends, or when the dashboard loads, we
 * make sure the series has exactly one UPCOMING occurrence: a real meeting row
 * inheriting the series' title-base / type / team / attendees / video link /
 * rule, pointing back at the series anchor via recurrenceParentId. Missed past
 * occurrences are skipped (no backfill) -- we only ever roll forward to the
 * next future date.
 *
 * No cron: generation is lazy (end-hook + dashboard-load sweep), which fits the
 * "all scheduled jobs disabled" setup.
 */
import { and, eq, isNull, ne, sql } from 'drizzle-orm';
import { db } from '../config/database.js';
import { meetings } from '../db/schema.js';
import { stripSegueCheckins } from './meeting-series.js';

type MeetingRow = typeof meetings.$inferSelect;

export interface RecurrenceOption { value: string; label: string; }

// The cadences the UI offers. Empty value = does not repeat.
export const RECURRENCE_OPTIONS: RecurrenceOption[] = [
  { value: '', label: 'Does not repeat' },
  { value: 'FREQ=WEEKLY', label: 'Weekly' },
  { value: 'FREQ=WEEKLY;INTERVAL=2', label: 'Every 2 weeks' },
  { value: 'FREQ=MONTHLY', label: 'Monthly' },
];

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Display labels for meeting types -- mirrors meetingTypeLabels in
// l8-list.ejs, except `other` reads as plain "Meeting" so a generated
// title is never "Other — Team".
const MEETING_TYPE_TITLE_LABELS: Record<string, string> = {
  leadership: 'Leadership Meeting',
  departmental: 'Departmental Meeting',
  quarterly: 'Quarterly Session',
  annual: 'Annual Planning',
  same_page: 'Same Page Meeting',
  '1on1': 'One-on-One',
  strategy_reset: 'Strategy Reset',
  other: 'Meeting',
};

/**
 * Default title for a meeting created with a blank title:
 * "{Type label} — {Team name}", or just the type label when no team resolves.
 *
 * Deliberately date-free: the date already renders as data everywhere, and
 * the recurrence roller carries titles forward across occurrences. Separator
 * is the em dash the product UI already uses (e.g. the l8-list page header),
 * NOT " -- " -- rebaseTitle() below treats " -- <rest>" as a date suffix and
 * would strip the team name when rolling the next occurrence.
 */
export function defaultMeetingTitle(meetingType: string | null | undefined, teamName?: string | null): string {
  const label = MEETING_TYPE_TITLE_LABELS[meetingType || ''] || MEETING_TYPE_TITLE_LABELS.other;
  return teamName ? `${label} — ${teamName}` : label;
}

function parseRule(rule: string): { freq: 'WEEKLY' | 'MONTHLY' | null; interval: number } {
  if (!rule) return { freq: null, interval: 1 };
  const parts: Record<string, string> = {};
  for (const p of rule.split(';')) {
    const [k, v] = p.split('=');
    if (k) parts[k.trim().toUpperCase()] = (v || '').trim().toUpperCase();
  }
  const freq = parts.FREQ === 'WEEKLY' ? 'WEEKLY' : parts.FREQ === 'MONTHLY' ? 'MONTHLY' : null;
  const interval = Math.max(1, parseInt(parts.INTERVAL || '1', 10) || 1);
  return { freq, interval };
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** Human label anchored to the meeting's weekday / day-of-month. */
export function ruleToLabel(rule: string | null | undefined, scheduledAt: Date | string): string {
  if (!rule) return 'Does not repeat';
  const d = scheduledAt instanceof Date ? scheduledAt : new Date(scheduledAt);
  const { freq, interval } = parseRule(rule);
  if (freq === 'WEEKLY') {
    const day = WEEKDAYS[d.getDay()];
    return interval >= 2 ? `Every other ${day}` : `Every ${day}`;
  }
  if (freq === 'MONTHLY') return `Monthly on the ${ordinal(d.getDate())}`;
  return 'Repeats';
}

/**
 * Next occurrence strictly after `from`, applying the interval to `base`
 * repeatedly until it passes `from`. Preserves time-of-day; weekly preserves
 * weekday (whole weeks added); monthly preserves day-of-month.
 */
export function nextOccurrenceDate(rule: string, base: Date, from: Date): Date | null {
  const { freq, interval } = parseRule(rule);
  if (!freq) return null;
  const next = new Date(base.getTime());
  let guard = 0;
  do {
    if (freq === 'WEEKLY') next.setDate(next.getDate() + 7 * interval);
    else next.setMonth(next.getMonth() + interval);
    guard++;
  } while (next <= from && guard < 600);
  return next;
}

/** YYYY-MM-DD in America/New_York (matches the existing "Title -- 2026-05-05" convention). */
function ymd(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(d);
}

/** Strip a trailing " -- <date>" segment then re-append the new occurrence's date. */
function rebaseTitle(title: string, when: Date): string {
  const base = title.replace(/\s+--\s+.*$/, '').trim() || title.trim();
  return `${base} -- ${ymd(when)}`;
}

/**
 * Ensure the series this meeting belongs to has one upcoming (scheduledAt >=
 * now, not cancelled) occurrence. Creates it if missing. Idempotent: a second
 * call once a future occurrence exists is a no-op. Returns the created row or
 * null.
 */
export async function ensureNextOccurrence(meeting: MeetingRow): Promise<MeetingRow | null> {
  if (!meeting.recurrenceRule) return null;
  const anchor = meeting.recurrenceParentId || meeting.id;
  const now = new Date();

  const rows = await db.select().from(meetings)
    .where(and(
      eq(meetings.organizationId, meeting.organizationId),
      isNull(meetings.deletedAt),
      ne(meetings.status, 'cancelled'),
      sql`(${meetings.id} = ${anchor} OR ${meetings.recurrenceParentId} = ${anchor})`,
    ));
  if (rows.length === 0) return null;

  // A future occurrence already exists -> nothing to roll. A *completed* row
  // does not count as "upcoming" even if its scheduledAt is in the future:
  // ending a future-dated instance early must still roll the next one, or the
  // series looks finished with nothing on the calendar. (Bug: completing the
  // June-4 Bogdan 1:1 on May 29 left the series with no upcoming meeting.)
  if (rows.some(r => r.status !== 'completed' && new Date(r.scheduledAt) >= now)) return null;

  const latest = rows.reduce((a, b) => (new Date(a.scheduledAt) >= new Date(b.scheduledAt) ? a : b));
  const next = nextOccurrenceDate(meeting.recurrenceRule, new Date(latest.scheduledAt), now);
  if (!next) return null;

  const [created] = await db.insert(meetings).values({
    organizationId: latest.organizationId,
    teamId: latest.teamId,
    meetingType: latest.meetingType,
    title: rebaseTitle(latest.title, next),
    scheduledAt: next,
    // Carry attendee identity forward, but NOT their prior-week segue check-in
    // text -- the segue starts blank each occurrence (see stripSegueCheckins).
    attendees: stripSegueCheckins(latest.attendees),
    videoLink: latest.videoLink,
    recurrenceRule: meeting.recurrenceRule,
    recurrenceParentId: anchor,
    createdBy: latest.createdBy || 'recurrence',
  }).returning();
  return created || null;
}

/**
 * Sweep all recurring series in an org and ensure each has an upcoming
 * occurrence. Called on dashboard load. Returns how many were created.
 */
export async function ensureUpcomingForOrg(organizationId: string): Promise<number> {
  const rows = await db.select().from(meetings)
    .where(and(
      eq(meetings.organizationId, organizationId),
      isNull(meetings.deletedAt),
      ne(meetings.status, 'cancelled'),
      sql`${meetings.recurrenceRule} IS NOT NULL`,
    ));
  if (rows.length === 0) return 0;

  // One representative (latest occurrence) per series anchor.
  const bySeries = new Map<string, MeetingRow>();
  for (const r of rows) {
    const a = r.recurrenceParentId || r.id;
    const cur = bySeries.get(a);
    if (!cur || new Date(r.scheduledAt) > new Date(cur.scheduledAt)) bySeries.set(a, r);
  }

  let created = 0;
  for (const rep of bySeries.values()) {
    if (await ensureNextOccurrence(rep)) created++;
  }
  return created;
}
