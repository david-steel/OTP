// Shared render engine for THE OLLIE WEEKLY (the customer-facing weekly
// product email). Single source of truth for the email's locals so the two
// senders -- scripts/send-orgy-weekly.ts (explicit list) and
// scripts/send-whats-new-broadcast.ts (all-users) -- can never drift apart.
//
// Drift is exactly what bit us: the template was rewritten to the green Ollie
// design while the broadcast script kept feeding the old locals, so a broadcast
// would have rendered a broken email. Both now call buildOllieWeekly().
//
// Mascot image files are still named orgy-*.png on disk (the brand rename to
// Ollie did not rename the assets); the visible name is "Ollie" everywhere.
import path from 'path';
import { fileURLToPath } from 'url';
import ejs from 'ejs';
import { changelog, type ChangelogEntry } from '../data/changelog.js';

const BASE_URL = 'https://orgtp.com';
const WHY_HEADLINE =
  'You put your people and your AI on one chart so the week runs itself and you get your time back.';

// PNG poses only (Gmail does not reliably render webp). Rotated by week index.
const HERO_POSES = ['orgy-present.png', 'orgy-idle.png', 'orgy-celebrate.png', 'orgy-cut.png'];
const NUDGE_POSES = ['orgy-celebrate.png', 'orgy-present.png'];
const PEEK_POSES = ['orgy-clean.png', 'orgy-idle.png'];
// orgy-cut.png / orgy-clean.png live at /public root, not /public/images.
const ROOT_POSES = new Set(['orgy-cut.png', 'orgy-clean.png']);
const resolvePose = (file: string) =>
  ROOT_POSES.has(file) ? `${BASE_URL}/public/${file}` : `${BASE_URL}/public/images/${file}`;

const ctaPathForTags = (tags: string[]): string => {
  const t = tags.join(' ').toLowerCase();
  if (t.includes('template')) return '/templates';
  if (t.includes('rock')) return '/rocks';
  if (t.includes('privacy') || t.includes('security')) return '/settings/configuration';
  if (t.includes('meeting')) return '/l8';
  if (t.includes('search') || t.includes('help')) return '/guide';
  if (t.includes('kpi')) return '/dashboard/kpis';
  return '/dashboard';
};

const abs = (url: string) => (url.startsWith('http') ? url : BASE_URL + url);

function toCard(entry: ChangelogEntry, isPick: boolean) {
  return {
    title: entry.title,
    summary: entry.summary,
    why: entry.why || null,
    tags: entry.tags,
    ctaText: entry.cta?.text || (isPick ? 'Check it out' : 'See it'),
    ctaUrl: entry.cta ? abs(entry.cta.url) : abs(ctaPathForTags(entry.tags)),
  };
}

export interface OllieWeeklyLocals {
  issueLabel: string;
  streakBadge: string | null;
  dropCount: number;
  heroPose: string;
  nudgePose: string;
  peekPose: string;
  pick: ReturnType<typeof toCard>;
  haul: ReturnType<typeof toCard>[];
  baseUrl: string;
  whyHeadline: string;
}

export interface OllieWeeklyBuild {
  locals: OllieWeeklyLocals;
  subject: string;
  windowEntries: ChangelogEntry[];
}

export interface BuildOptions {
  now: Date;
  days?: number;
  /** Override the issue number; defaults to the streak count. */
  issue?: string;
  /** Override the ship-streak; defaults to the real auto-incrementing count. */
  streak?: string;
  /** Override the subject line. */
  subject?: string;
}

/**
 * Build the locals + subject for the Ollie Weekly from the last N days of
 * changelog entries. Returns windowEntries so callers can detect an empty week.
 * unsubscribeUrl is intentionally NOT included -- it is per-recipient and is
 * supplied at render time by renderOllieWeekly().
 */
export function buildOllieWeekly(opts: BuildOptions): OllieWeeklyBuild {
  const days = opts.days ?? 7;
  const now = opts.now;
  const cutoff = new Date(now.getTime() - days * 864e5);

  const windowEntries = [...changelog]
    .filter((e) => new Date(e.date + 'T12:00:00Z') >= cutoff)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  // Pick = first 'Major' that isn't only a Fix; else the newest. Haul = next 4
  // non-pick, de-prioritizing pure Fixes (they fall off the bottom).
  const isFixOnly = (e: ChangelogEntry) => e.tags.length === 2 && e.tags.includes('Fixes');
  const pickEntry =
    windowEntries.find((e) => e.tags.includes('Major') && !isFixOnly(e)) || windowEntries[0];
  const rest = windowEntries.filter((e) => e !== pickEntry);
  rest.sort((a, b) => (isFixOnly(a) === isFixOnly(b) ? 0 : isFixOnly(a) ? 1 : -1));
  const haul = rest.slice(0, 4).map((e) => toCard(e, false));
  const pick = pickEntry ? toCard(pickEntry, true) : toCard(windowEntries[0], true);

  // Pose rotation: deterministic per ISO week.
  const weekIndex = Math.floor(now.getTime() / (7 * 864e5));
  const heroPose = resolvePose(HERO_POSES[weekIndex % HERO_POSES.length]);
  const nudgePose = resolvePose(NUDGE_POSES[weekIndex % NUDGE_POSES.length]);
  const peekPose = resolvePose(PEEK_POSES[weekIndex % PEEK_POSES.length]);

  // Real, auto-incrementing ship streak. Anchored at issue #24 = Mon 2026-06-15.
  const STREAK_ANCHOR_MONDAY = Date.parse('2026-06-15T00:00:00Z');
  const STREAK_ANCHOR_VALUE = 24;
  const streak = opts.streak
    ? parseInt(opts.streak, 10)
    : STREAK_ANCHOR_VALUE + Math.max(0, Math.round((now.getTime() - STREAK_ANCHOR_MONDAY) / (7 * 864e5)));
  const issueMonday = new Date(STREAK_ANCHOR_MONDAY + (streak - STREAK_ANCHOR_VALUE) * 7 * 864e5);
  const weekOf = issueMonday.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  });
  const issueNum = opts.issue || String(streak);
  const issueLabel = `Issue #${issueNum} · ${weekOf}`;
  const streakBadge = `🔥 ${streak} weeks deep in the swamp`;

  const dropCount = windowEntries.length;
  const subject = opts.subject || `Fresh from the swamp: ${dropCount} new thing${dropCount === 1 ? '' : 's'} this week 🚀`;

  return {
    locals: {
      issueLabel, streakBadge, dropCount, heroPose, nudgePose, peekPose,
      pick, haul, baseUrl: BASE_URL, whyHeadline: WHY_HEADLINE,
    },
    subject,
    windowEntries,
  };
}

const TEMPLATE_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../templates/emails/weekly-digest.ejs',
);

/**
 * Render the email HTML. Pass the recipient's signed unsubscribe URL so the
 * CAN-SPAM one-click link is real and per-recipient; pass null for previews.
 */
export async function renderOllieWeekly(
  locals: OllieWeeklyLocals,
  unsubscribeUrlValue: string | null,
): Promise<string> {
  return (await ejs.renderFile(TEMPLATE_PATH, {
    ...locals,
    unsubscribeUrl: unsubscribeUrlValue,
  })) as string;
}
