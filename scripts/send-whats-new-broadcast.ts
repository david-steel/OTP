// One-off: send "What's New on OTP" digest to union of (newsletter subscribers) + (real Clerk users).
// Bypasses sendWeeklyDigest() because that function only mails publishers WITH a published OOS
// and never reads newsletter_subscribers. This script ships to everyone with a resolvable email.

import { sql } from 'drizzle-orm';
import { createClerkClient } from '@clerk/backend';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../src/config/database.js';
import { sendEmail } from '../src/config/email.js';
import { buildOllieWeekly, renderOllieWeekly } from '../src/services/ollie-weekly.js';
import { unsubscribeUrl } from '../src/services/unsubscribe-token.js';
import { isSuppressedRecipient } from '../src/services/re-engagement.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Recipient {
  email: string;
  name: string | null;
  source: 'subscriber' | 'clerk-user' | 'partner-signup';
  ref: string;
}

async function gatherSubscribers(): Promise<Recipient[]> {
  const rows = await db.execute(sql`
    SELECT email, name
    FROM newsletter_subscribers
    WHERE unsubscribed_at IS NULL
      AND double_opt_in_confirmed = true
  `);
  return (rows.rows as Array<{ email: string; name: string | null }>).map(r => ({
    email: r.email.toLowerCase(),
    name: r.name,
    source: 'subscriber' as const,
    ref: 'newsletter_subscribers',
  }));
}

async function gatherClerkUsers(): Promise<Recipient[]> {
  // Enumerate every Clerk user directly. Do NOT derive the audience from the
  // organizations table -- not every signed-up user has an org row, and that
  // gap silently dropped real users from the 2026-05-11 broadcast (4 of 7
  // missed). clerk.users.getUserList() is the ground truth for signups.
  const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });
  const out: Recipient[] = [];
  const pageSize = 100;
  let offset = 0;
  for (;;) {
    const page = await clerk.users.getUserList({ limit: pageSize, offset });
    for (const u of page.data) {
      const primary = u.emailAddresses.find(e => e.id === u.primaryEmailAddressId);
      const email = primary?.emailAddress || u.emailAddresses[0]?.emailAddress;
      if (!email) continue;
      const fullName = [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || null;
      out.push({ email: email.toLowerCase(), name: fullName, source: 'clerk-user', ref: u.id });
    }
    if (page.data.length < pageSize) break;
    offset += pageSize;
  }
  return out;
}

async function gatherPartnerSignups(): Promise<Recipient[]> {
  // partner_signups holds BOTH partner applications and lightweight lead /
  // pre-signup captures -- lead-signup.ts and partner-signup.ts both write here.
  const rows = await db.execute(sql`
    SELECT email, full_name
    FROM partner_signups
    WHERE email IS NOT NULL
  `);
  return (rows.rows as Array<{ email: string; full_name: string | null }>).map(r => ({
    email: r.email.toLowerCase(),
    name: r.full_name,
    source: 'partner-signup' as const,
    ref: 'partner_signups',
  }));
}

async function main() {
  console.log('[broadcast] gathering audience...');
  const subs = await gatherSubscribers();
  const clerkUsers = await gatherClerkUsers();
  const partners = await gatherPartnerSignups();

  // Dedupe by lowercased email; prefer first occurrence.
  const byEmail = new Map<string, Recipient>();
  for (const r of [...subs, ...clerkUsers, ...partners]) {
    if (!byEmail.has(r.email)) byEmail.set(r.email, r);
  }
  let recipients = [...byEmail.values()];
  // --only=a@x.com,b@y.com restricts the send to specific addresses (e.g. to
  // retry just the ones that failed a prior run, without re-mailing everyone).
  const onlyArg = process.argv.find(a => a.startsWith('--only='));
  if (onlyArg) {
    const onlySet = new Set(
      onlyArg.slice('--only='.length).split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
    );
    recipients = recipients.filter(r => onlySet.has(r.email));
    console.log(`[broadcast] --only filter active: ${recipients.length} recipient(s)`);
  }
  // --exclude=a@x.com,b@y.com drops specific addresses from the gathered
  // audience (e.g. test/sandbox/smoke mailboxes that would hard-bounce and
  // hurt sender reputation). Safer than re-typing the whole include list.
  const excludeArg = process.argv.find(a => a.startsWith('--exclude='));
  if (excludeArg) {
    const excludeSet = new Set(
      excludeArg.slice('--exclude='.length).split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
    );
    const before = recipients.length;
    recipients = recipients.filter(r => !excludeSet.has(r.email));
    console.log(`[broadcast] --exclude active: dropped ${before - recipients.length}, ${recipients.length} remain`);
  }
  // --to=a@x.com,b@y.com sends to an explicit list, bypassing the DB/Clerk
  // gather entirely (used when the audience is sourced out-of-band, e.g. from
  // the prod admin endpoints because the local .env DB is not prod).
  const toArg = process.argv.find(a => a.startsWith('--to='));
  if (toArg) {
    const emails = toArg.slice('--to='.length).split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    recipients = emails.map(e => ({ email: e, name: null, source: 'partner-signup' as const, ref: 'manual' }));
    console.log(`[broadcast] --to override: ${recipients.length} explicit recipient(s)`);
  }

  // Hard suppression: never mass-mail internal/relationship addresses. Same
  // guard the re-engagement engine uses -- includes Victor (first paying
  // customer, David handles personally) and suppressed domains. Applies even to
  // --to overrides so a guarded address can never be blasted by accident.
  const suppressed = recipients.filter(r => isSuppressedRecipient(r.email));
  if (suppressed.length) {
    recipients = recipients.filter(r => !isSuppressedRecipient(r.email));
    console.log(`[broadcast] suppressed ${suppressed.length} guarded address(es): ${suppressed.map(s => s.email).join(', ')}`);
  }

  console.log(`[broadcast] subscribers: ${subs.length}, clerk users: ${clerkUsers.length}, partner signups: ${partners.length}, unique: ${recipients.length}`);
  console.log('[broadcast] final audience:');
  for (const r of recipients) console.log(`  - ${r.email} | ${r.name || '(no name)'} | via ${r.source} | ${r.ref}`);

  // Build the Ollie Weekly from the same shared engine the explicit-list sender
  // uses (scripts/send-orgy-weekly.ts), so the broadcast can never drift from
  // the live template again. unsubscribeUrl is supplied per-recipient at render.
  const now = new Date();
  const { locals, subject, windowEntries } = buildOllieWeekly({ now, days: 7 });
  console.log(`[broadcast] changelog entries (last 7d): ${windowEntries.length}`);
  if (windowEntries.length === 0) {
    console.log('[broadcast] no entries; aborting.');
    process.exit(0);
  }

  console.log(`[broadcast] subject: ${subject}`);

  if (process.argv.includes('--dry-run')) {
    const fs = await import('fs');
    const previewPath = path.resolve(__dirname, 'whats-new-preview.html');
    // Preview with a real (sample) unsubscribe link so the footer renders true.
    const sampleUnsub = recipients[0] ? unsubscribeUrl(recipients[0].email) : null;
    const html = await renderOllieWeekly(locals, sampleUnsub);
    fs.writeFileSync(previewPath, html);
    console.log('\n[broadcast] ===== DRY RUN -- nothing sent =====');
    console.log(`would send to ${recipients.length} recipients`);
    console.log(`email HTML written to ${previewPath}`);
    process.exit(0);
  }

  console.log(`[broadcast] sending to ${recipients.length} recipients...`);

  const sent: string[] = [];
  const failed: Array<{ email: string; err: string }> = [];

  for (const r of recipients) {
    try {
      // Render per recipient so the one-click unsubscribe link is theirs (signed).
      const html = await renderOllieWeekly(locals, unsubscribeUrl(r.email));
      const ok = await sendEmail({
        to: r.email,
        subject,
        html,
        from: 'Ollie at OTP <notifications@mail.orgtp.com>',
      });
      if (ok) {
        sent.push(r.email);
        console.log(`[broadcast]  sent  -> ${r.email}`);
      } else {
        failed.push({ email: r.email, err: 'sendEmail returned false' });
        console.warn(`[broadcast]  FAIL  -> ${r.email}`);
      }
    } catch (e: any) {
      failed.push({ email: r.email, err: e.message });
      console.error(`[broadcast]  ERR   -> ${r.email}: ${e.message}`);
    }
    // Pace sends to stay under Resend's rate limit (~2 requests/second).
    await new Promise(res => setTimeout(res, 700));
  }

  console.log('\n[broadcast] ===== RESULT =====');
  console.log(`sent: ${sent.length}`);
  console.log(`failed: ${failed.length}`);
  if (sent.length) console.log('sent list:', sent.join(', '));
  if (failed.length) console.log('failures:', JSON.stringify(failed, null, 2));

  process.exit(0);
}

main().catch(err => { console.error('FATAL', err); process.exit(1); });
