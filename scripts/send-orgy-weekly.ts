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
import fs from 'node:fs';
import { sendEmail } from '../src/config/email.js';
import { buildOllieWeekly, renderOllieWeekly } from '../src/services/ollie-weekly.js';
import { unsubscribeUrl } from '../src/services/unsubscribe-token.js';

function arg(name: string, def = ''): string {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split('=').slice(1).join('=') : def;
}
const hasFlag = (name: string) => process.argv.includes(`--${name}`);

async function main() {
  const days = parseInt(arg('days', '7'), 10);
  const now = new Date();

  // All render logic lives in the shared engine so this sender and the
  // all-users broadcast can never drift from the live template.
  const { locals, subject, windowEntries } = buildOllieWeekly({
    now,
    days,
    issue: arg('issue') || undefined,
    streak: arg('streak') || undefined,
    subject: arg('subject') || undefined,
  });

  if (windowEntries.length === 0) {
    console.error(`No changelog entries in the last ${days} days. Nothing to send.`);
    process.exit(1);
  }

  const to = arg('to').split(',').map((s) => s.trim()).filter(Boolean);
  // Signed per-recipient unsubscribe when sending to one address; null otherwise.
  const html = await renderOllieWeekly(locals, to.length === 1 ? unsubscribeUrl(to[0]) : null);

  console.log('--- IN THE SWAMP (OTP weekly) ---');
  console.log('Subject :', subject);
  console.log('Window  :', `${days} days, ${locals.dropCount} entries`);
  console.log('Pick    :', locals.pick.title);
  console.log('Haul    :', locals.haul.map((h) => h.title).join(' | '));
  console.log('Hero    :', locals.heroPose);
  console.log('Issue   :', locals.issueLabel, '| streak:', locals.streakBadge || '(hidden)');

  if (hasFlag('dry-run') || to.length === 0) {
    const out = '/tmp/orgy-weekly.html';
    fs.writeFileSync(out, html);
    console.log(`\nDRY RUN: no email sent. Rendered HTML -> ${out}`);
    if (to.length === 0) console.log('(pass --to=addr to actually send)');
    return;
  }

  const scheduledAt = arg('scheduled-at') || undefined;
  const id = await sendEmail({
    to,
    subject,
    html,
    from: arg('from') || 'Ollie at OTP <notifications@mail.orgtp.com>',
    replyTo: arg('reply-to') || 'dawson@orgtp.com',
    tags: [{ name: 'campaign', value: arg('tag') || 'ollie-weekly' }],
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
