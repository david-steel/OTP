// scripts/send-launch-announcement.ts
// One-time launch announcement for the OOS Operating Plan.
// Recipients: Clerk users + newsletter_subscribers (deduped, unsubscribed filtered).
//
// Flags:
//   --dry-run         List recipients, render template once, do NOT send
//   --limit N         Only process the first N deduped recipients
//   --to email@x.com  Send only to this address (use for self-test)
//
// Usage:
//   railway run --service otp-platform npx tsx scripts/send-launch-announcement.ts --to dsteel@sneeze.it
//   railway run --service otp-platform npx tsx scripts/send-launch-announcement.ts --dry-run
//   railway run --service otp-platform npx tsx scripts/send-launch-announcement.ts          # SEND FOR REAL

import path from 'path';
import { fileURLToPath } from 'url';
import ejs from 'ejs';
import { createClerkClient } from '@clerk/backend';
import { isNull } from 'drizzle-orm';
import { db } from '../src/config/database.js';
import { newsletterSubscribers } from '../src/db/schema.js';
import { sendEmail } from '../src/config/email.js';
import { unsubscribeUrl } from '../src/services/unsubscribe-token.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Args {
  dryRun: boolean;
  limit: number | null;
  to: string | null;
}

function parseArgs(): Args {
  const out: Args = { dryRun: false, limit: null, to: null };
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') out.dryRun = true;
    else if (a === '--limit') {
      const n = parseInt(argv[++i], 10);
      if (Number.isFinite(n) && n > 0) out.limit = n;
    } else if (a === '--to') {
      const e = argv[++i];
      if (e && e.includes('@')) out.to = e.toLowerCase();
    }
  }
  return out;
}

interface Recipient {
  email: string;
  source: 'clerk' | 'pre_signup';
  firstName?: string | null;
}

async function pullClerkUsers(): Promise<Recipient[]> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    console.warn('[launch] CLERK_SECRET_KEY not set; skipping Clerk users');
    return [];
  }
  const clerk = createClerkClient({ secretKey });
  const out: Recipient[] = [];
  let offset = 0;
  const pageSize = 100;
  // Paginate the full user list. Most installs have <1000 users; we cap at 5000 here.
  for (let page = 0; page < 50; page++) {
    const { data } = await clerk.users.getUserList({ limit: pageSize, offset });
    if (!data || data.length === 0) break;
    for (const u of data) {
      const primary = u.emailAddresses.find(e => e.id === u.primaryEmailAddressId)?.emailAddress
        || u.emailAddresses[0]?.emailAddress
        || null;
      if (!primary) continue;
      out.push({
        email: primary.toLowerCase(),
        source: 'clerk',
        firstName: u.firstName || null,
      });
    }
    if (data.length < pageSize) break;
    offset += pageSize;
  }
  return out;
}

async function pullPreSignups(): Promise<Recipient[]> {
  const rows = await db
    .select()
    .from(newsletterSubscribers)
    .where(isNull(newsletterSubscribers.unsubscribedAt));
  return rows.map(r => ({
    email: r.email.toLowerCase(),
    source: 'pre_signup' as const,
    firstName: r.name?.split(/\s+/)[0] || null,
  }));
}

function dedupe(lists: Recipient[][]): Recipient[] {
  const byEmail = new Map<string, Recipient>();
  for (const list of lists) {
    for (const r of list) {
      // Clerk wins over pre-signup if both present (active user > pre-signup).
      const existing = byEmail.get(r.email);
      if (!existing) byEmail.set(r.email, r);
      else if (existing.source === 'pre_signup' && r.source === 'clerk') byEmail.set(r.email, r);
    }
  }
  return Array.from(byEmail.values()).sort((a, b) => a.email.localeCompare(b.email));
}

async function renderTemplate(email: string): Promise<string> {
  const templatePath = path.resolve(__dirname, '..', 'src', 'templates', 'emails', 'launch-oos-operating-plan.ejs');
  return await ejs.renderFile(templatePath, { email, unsubUrl: unsubscribeUrl(email) });
}

async function run() {
  const args = parseArgs();
  console.log('[launch] args:', args);

  const clerkUsers = await pullClerkUsers();
  const preSignups = await pullPreSignups();
  console.log(`[launch] Clerk users: ${clerkUsers.length}`);
  console.log(`[launch] Pre-signups (not unsubscribed): ${preSignups.length}`);

  let recipients = dedupe([clerkUsers, preSignups]);
  console.log(`[launch] Deduped total: ${recipients.length}`);

  // --to filter beats everything.
  if (args.to) {
    recipients = recipients.filter(r => r.email === args.to);
    if (recipients.length === 0) {
      // Allow --to to send to an arbitrary address even if not in the list (self-test).
      recipients = [{ email: args.to, source: 'pre_signup', firstName: null }];
      console.log(`[launch] --to ${args.to} not in list; sending to it directly anyway`);
    } else {
      console.log(`[launch] --to ${args.to}: 1 recipient`);
    }
  }

  if (args.limit !== null) {
    recipients = recipients.slice(0, args.limit);
    console.log(`[launch] --limit ${args.limit}: ${recipients.length} recipients`);
  }

  console.log('[launch] First 10 recipients:');
  for (const r of recipients.slice(0, 10)) {
    console.log(`  ${r.email}  (${r.source}${r.firstName ? `, ${r.firstName}` : ''})`);
  }
  if (recipients.length > 10) console.log(`  ...and ${recipients.length - 10} more`);

  if (args.dryRun) {
    console.log('[launch] --dry-run: rendering template once for preview, NOT sending');
    const html = await renderTemplate(recipients[0]?.email || 'preview@example.com');
    console.log('---TEMPLATE PREVIEW (first 800 chars)---');
    console.log(html.slice(0, 800));
    console.log('---END PREVIEW---');
    console.log(`[launch] Dry run done. Would have sent to ${recipients.length} recipients.`);
    return;
  }

  const subject = 'We just shipped the OOS Operating Plan';
  // notifications@mail.orgtp.com is the verified Resend sender per
  // feedback_otp_email_from_mail_subdomain memory rule.
  const from = 'David Steel <notifications@mail.orgtp.com>';

  let sent = 0;
  let failed = 0;
  const failures: Array<{ email: string; error: string }> = [];

  // Throttle to stay under Resend's 5-req/sec cap. 250ms between sends = max 4/sec.
  const THROTTLE_MS = 250;
  const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

  for (let i = 0; i < recipients.length; i++) {
    const r = recipients[i];
    try {
      const html = await renderTemplate(r.email);
      const ok = await sendEmail({ to: r.email, subject, html, from });
      if (ok) {
        sent += 1;
        if (sent % 10 === 0) console.log(`[launch] sent ${sent}/${recipients.length}...`);
      } else {
        failed += 1;
        failures.push({ email: r.email, error: 'sendEmail returned false' });
      }
    } catch (err) {
      failed += 1;
      const msg = err instanceof Error ? err.message : String(err);
      failures.push({ email: r.email, error: msg });
    }
    if (i < recipients.length - 1) await sleep(THROTTLE_MS);
  }

  console.log('---');
  console.log(`[launch] Sent: ${sent}`);
  console.log(`[launch] Failed: ${failed}`);
  if (failures.length > 0) {
    console.log('[launch] Failures:');
    for (const f of failures) console.log(`  ${f.email}: ${f.error}`);
  }
  console.log('[launch] Done.');
}

run().catch(err => {
  console.error('[launch] Fatal:', err);
  process.exit(1);
});
