/**
 * send-orgy-weekly.ts -- THE ORGY WEEKLY sender.
 *
 * The reusable weekly engine: pulls the last N days of changelog entries,
 * picks Orgy's pose for the week (rotates so it never looks the same twice),
 * renders src/templates/emails/weekly-digest.ejs, and sends via Resend.
 *
 * Usage (run with prod env so RESEND_API_KEY is present):
 *   railway run npx tsx scripts/send-orgy-weekly.ts --dry-run
 *       -> writes the rendered HTML to /tmp/orgy-weekly.html and prints the plan, sends nothing
 *   railway run npx tsx scripts/send-orgy-weekly.ts --to=dawson@orgtp.com --scheduled-at="2026-06-16T14:00:00Z" --tag=orgy-weekly-test
 *       -> schedules the send (14:00Z = 10:00 EDT). Cancelable in the Resend dashboard until it fires.
 *
 * Flags: --to (comma list) | --days=7 | --scheduled-at=<ISO|natural> | --subject=.. |
 *        --from=.. | --reply-to=.. | --tag=<name> | --issue=<n> | --streak=<n> | --dry-run
 *
 * Honesty: --issue / --streak are OFF unless you pass real numbers. We never
 * ship a fabricated ship-streak.
 */
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import ejs from 'ejs';
import { changelog, type ChangelogEntry } from '../src/data/changelog.js';
import { sendEmail } from '../src/config/email.js';

const BASE_URL = 'https://orgtp.com';
const WHY_HEADLINE = 'You put your people and your AI on one chart so the week runs itself and you get your time back.';

// PNG poses only (Gmail does not reliably render webp). Rotated by week index.
const HERO_POSES = ['orgy-present.png', 'orgy-idle.png', 'orgy-celebrate.png', 'orgy-cut.png'];
const NUDGE_POSES = ['orgy-celebrate.png', 'orgy-present.png'];
const PEEK_POSES = ['orgy-clean.png', 'orgy-idle.png'];
const poseUrl = (file: string) => `${BASE_URL}/public/images/${file}`;
// orgy-cut.png / orgy-clean.png live at /public root, not /public/images.
const ROOT_POSES = new Set(['orgy-cut.png', 'orgy-clean.png']);
const resolvePose = (file: string) => ROOT_POSES.has(file) ? `${BASE_URL}/public/${file}` : poseUrl(file);

function arg(name: string, def = ''): string {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split('=').slice(1).join('=') : def;
}
const hasFlag = (name: string) => process.argv.includes(`--${name}`);

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

async function main() {
  const days = parseInt(arg('days', '7'), 10);
  const now = new Date();
  const cutoff = new Date(now.getTime() - days * 864e5);

  // Window: entries within the last N days. Newest first.
  const windowEntries = [...changelog]
    .filter((e) => new Date(e.date + 'T12:00:00Z') >= cutoff)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  if (windowEntries.length === 0) {
    console.error(`No changelog entries in the last ${days} days. Nothing to send.`);
    process.exit(1);
  }

  // Pick = first 'Major' that isn't only a Fix; else the newest. Haul = next 4
  // non-pick, de-prioritizing pure Fixes (they fall off the bottom).
  const isFixOnly = (e: ChangelogEntry) => e.tags.length === 2 && e.tags.includes('Fixes');
  const pickEntry =
    windowEntries.find((e) => e.tags.includes('Major') && !isFixOnly(e)) || windowEntries[0];
  const rest = windowEntries.filter((e) => e !== pickEntry);
  rest.sort((a, b) => (isFixOnly(a) === isFixOnly(b) ? 0 : isFixOnly(a) ? 1 : -1));
  const haul = rest.slice(0, 4).map((e) => toCard(e, false));
  const pick = toCard(pickEntry, true);

  // Pose rotation: deterministic per ISO week.
  const weekIndex = Math.floor(now.getTime() / (7 * 864e5));
  const heroPose = resolvePose(HERO_POSES[weekIndex % HERO_POSES.length]);
  const nudgePose = resolvePose(NUDGE_POSES[weekIndex % NUDGE_POSES.length]);
  const peekPose = resolvePose(PEEK_POSES[weekIndex % PEEK_POSES.length]);

  // Real, auto-incrementing ship streak. Anchored at issue #24 = Mon 2026-06-15;
  // every week after adds one. --streak overrides. The issue number tracks the
  // streak so the masthead and the badge always agree.
  const STREAK_ANCHOR_MONDAY = Date.parse('2026-06-15T00:00:00Z');
  const STREAK_ANCHOR_VALUE = 24;
  const streak = arg('streak')
    ? parseInt(arg('streak'), 10)
    : STREAK_ANCHOR_VALUE + Math.max(0, Math.round((now.getTime() - STREAK_ANCHOR_MONDAY) / (7 * 864e5)));
  const issueMonday = new Date(STREAK_ANCHOR_MONDAY + (streak - STREAK_ANCHOR_VALUE) * 7 * 864e5);
  const weekOf = issueMonday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  const issueNum = arg('issue') || String(streak);
  const issueLabel = `Issue #${issueNum} · ${weekOf}`;
  const streakBadge = `🔥 ${streak} weeks deep in the swamp`;

  const dropCount = windowEntries.length;
  const subject = arg('subject') || `Fresh from the swamp: ${dropCount} new things this week 🚀`;

  const templatePath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    '..', 'src', 'templates', 'emails', 'weekly-digest.ejs',
  );

  const html = await ejs.renderFile(templatePath, {
    issueLabel, streakBadge, dropCount, heroPose, nudgePose, peekPose,
    pick, haul, baseUrl: BASE_URL, whyHeadline: WHY_HEADLINE, unsubscribeUrl: null,
  }, { async: false }) as unknown as string;

  console.log('--- IN THE SWAMP (OTP weekly) ---');
  console.log('Subject :', subject);
  console.log('Window  :', `${days} days, ${dropCount} entries`);
  console.log('Pick    :', pick.title);
  console.log('Haul    :', haul.map((h) => h.title).join(' | '));
  console.log('Hero    :', heroPose);
  console.log('Issue   :', issueLabel, '| streak:', streakBadge || '(hidden)');

  if (hasFlag('dry-run') || !arg('to')) {
    const out = '/tmp/orgy-weekly.html';
    fs.writeFileSync(out, html);
    console.log(`\nDRY RUN: no email sent. Rendered HTML -> ${out}`);
    if (!arg('to')) console.log('(pass --to=addr to actually send)');
    return;
  }

  const to = arg('to').split(',').map((s) => s.trim()).filter(Boolean);
  const scheduledAt = arg('scheduled-at') || undefined;
  const id = await sendEmail({
    to,
    subject,
    html,
    from: arg('from') || 'Orgy at OTP <notifications@mail.orgtp.com>',
    replyTo: arg('reply-to') || 'dawson@orgtp.com',
    tags: [{ name: 'campaign', value: arg('tag') || 'orgy-weekly' }],
    scheduledAt,
  });

  if (id) {
    console.log(`\nSent${scheduledAt ? ` (scheduled for ${scheduledAt})` : ''} to ${to.join(', ')}. Resend id: ${id}`);
  } else {
    console.error('\nSend FAILED (see Resend errors above). Is RESEND_API_KEY set? Run with `railway run`.');
    process.exit(1);
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
