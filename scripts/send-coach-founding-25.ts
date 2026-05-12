// Send the Founding 25 coach blast.
//
// Driven by a JSON input file (recipients list) and emits a JSON results file.
// Claude orchestrates the Google Sheet read/filter/writeback via MCP; this
// script just renders + sends. That keeps it portable and dependency-light.
//
// USAGE:
//   npx tsx scripts/send-coach-founding-25.ts \
//     --input /tmp/coach-batch.json \
//     --output /tmp/coach-results.json \
//     [--dry-run] [--from "Name <email>"] [--reply-to "Name <email>"]
//
// Reply-To defaults to David Steel <dsteel@sneeze.it> so coach replies route
// to David's real inbox (the From address mail.orgtp.com has no MX, so reply
// without Reply-To would bounce).
//
// INPUT JSON SHAPE:
//   {
//     "recipients": [
//       { "email": "brock.tbg@gmail.com", "firstName": "Brock", "lastName": "Beiersdoerfer", "slug": "brock-beiersdoerfer", "rowIndex": 2 },
//       ...
//     ]
//   }
//
// OUTPUT JSON SHAPE:
//   {
//     "summary": { "total": N, "sent": M, "failed": K, "dryRun": false },
//     "results": [
//       { "email": "...", "slug": "...", "rowIndex": 2, "sent": true, "messageId": "...", "sentAt": "..." },
//       { "email": "...", "slug": "...", "rowIndex": 7, "sent": false, "error": "..." }
//     ]
//   }
import * as fs from 'fs';
import * as path from 'path';
import { renderCoachFoundingEmail } from '../templates/emails/coach-founding-25/template';
import { sendEmail } from '../src/config/email';

interface Recipient {
  email: string;
  firstName: string;
  lastName: string;
  slug: string;
  rowIndex?: number;
}

interface Result {
  email: string;
  slug: string;
  rowIndex?: number;
  sent: boolean;
  messageId?: string;
  sentAt?: string;
  error?: string;
}

const DEFAULT_REPLY_TO = 'David Steel <dsteel@sneeze.it>';

function parseArgs(): { input: string; output: string; dryRun: boolean; from?: string; replyTo: string } {
  const argv = process.argv.slice(2);
  let input = '', output = '', dryRun = false, from: string | undefined;
  let replyTo = DEFAULT_REPLY_TO;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--input') input = argv[++i];
    else if (a === '--output') output = argv[++i];
    else if (a === '--dry-run') dryRun = true;
    else if (a === '--from') from = argv[++i];
    else if (a === '--reply-to') replyTo = argv[++i];
  }
  if (!input) throw new Error('Missing --input <path-to-recipients.json>');
  if (!output) throw new Error('Missing --output <path-to-results.json>');
  return { input, output, dryRun, from, replyTo };
}

async function main() {
  const args = parseArgs();
  const raw = fs.readFileSync(args.input, 'utf8');
  const data = JSON.parse(raw) as { recipients: Recipient[] };
  const recipients = data.recipients || [];

  console.log(`\n=== Coach Founding 25 ${args.dryRun ? 'DRY-RUN' : 'SEND'} ===`);
  console.log(`Recipients: ${recipients.length}`);
  console.log(`Input:    ${path.resolve(args.input)}`);
  console.log(`Output:   ${path.resolve(args.output)}`);
  if (args.from) console.log(`From:     ${args.from}`);
  console.log(`Reply-To: ${args.replyTo}`);
  console.log();

  const results: Result[] = [];
  let sentCount = 0;
  let failedCount = 0;

  for (let i = 0; i < recipients.length; i++) {
    const r = recipients[i];
    const idx = `[${String(i + 1).padStart(2, ' ')}/${recipients.length}]`;
    const slug = r.slug;
    const email = r.email;

    // Validate
    if (!email || !slug || !r.firstName) {
      results.push({ email: email || '?', slug: slug || '?', rowIndex: r.rowIndex, sent: false, error: 'Missing email/slug/firstName' });
      failedCount++;
      console.log(`${idx} ✗ ${email} (skipped — missing data)`);
      continue;
    }

    // Render
    let rendered;
    try {
      rendered = renderCoachFoundingEmail({
        firstName: r.firstName,
        lastName: r.lastName,
        profileSlug: slug,
      });
    } catch (err) {
      results.push({ email, slug, rowIndex: r.rowIndex, sent: false, error: `Render failed: ${err instanceof Error ? err.message : String(err)}` });
      failedCount++;
      console.log(`${idx} ✗ ${email} render failed`);
      continue;
    }

    if (args.dryRun) {
      console.log(`${idx} DRY-RUN  to=${email}  slug=${slug}`);
      console.log(`        subject: ${rendered.subject}`);
      results.push({ email, slug, rowIndex: r.rowIndex, sent: false, error: 'dry-run (not sent)' });
      continue;
    }

    // Live send — Resend tags let us filter by campaign + per-coach in the dashboard
    try {
      const messageId = await sendEmail({
        to: email,
        subject: rendered.subject,
        html: rendered.html,
        from: args.from,
        replyTo: args.replyTo,
        tags: [
          { name: 'campaign', value: 'founding_25_coach' },
          { name: 'slug', value: slug.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 80) },
        ],
      });
      if (messageId) {
        const sentAt = new Date().toISOString();
        results.push({ email, slug, rowIndex: r.rowIndex, sent: true, messageId, sentAt });
        sentCount++;
        console.log(`${idx} ✓ ${email}  (id=${messageId})`);
      } else {
        results.push({ email, slug, rowIndex: r.rowIndex, sent: false, error: 'sendEmail returned null (check Resend config)' });
        failedCount++;
        console.log(`${idx} ✗ ${email} (sendEmail null)`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({ email, slug, rowIndex: r.rowIndex, sent: false, error: msg });
      failedCount++;
      console.log(`${idx} ✗ ${email} (${msg})`);
    }

    // Pace ~1 send/second to be polite to Resend rate limits
    if (!args.dryRun && i + 1 < recipients.length) {
      await new Promise(res => setTimeout(res, 1000));
    }
  }

  const output = {
    summary: {
      total: recipients.length,
      sent: sentCount,
      failed: failedCount,
      dryRun: args.dryRun,
      runAt: new Date().toISOString(),
    },
    results,
  };

  fs.writeFileSync(args.output, JSON.stringify(output, null, 2));
  console.log(`\n=== Summary ===`);
  console.log(`Total:  ${recipients.length}`);
  console.log(`Sent:   ${sentCount}`);
  console.log(`Failed: ${failedCount}`);
  console.log(`Dry run: ${args.dryRun ? 'YES' : 'no'}`);
  console.log(`\nResults written to ${args.output}`);
  process.exit(0);
}

main().catch(err => { console.error('FATAL:', err); process.exit(1); });
