// scripts/run-re-engagement.ts
// Daily runner for the re-engagement nudge system.
//
// Pulls Clerk users + pre-signups, filters to >3-day-stale, applies the
// frequency cap (max 4 nudges per 30 days, >=7 days between), segments by
// account state, sends a personalized template per segment, logs to
// user_engagement_log.
//
// Run manually until we wire a Railway scheduled job (the service is the
// thing; the trigger is just timing).
//
// Flags:
//   --dry-run         Resolve candidates and segment them, do NOT send
//   --limit N         Process only the first N eligible candidates
//   --to email@x.com  Send only to this address (use for self-test)
//
// Usage:
//   railway run --service otp-platform npx tsx scripts/run-re-engagement.ts --dry-run
//   railway run --service otp-platform npx tsx scripts/run-re-engagement.ts --to dsteel@sneeze.it
//   railway run --service otp-platform npx tsx scripts/run-re-engagement.ts          # SEND FOR REAL

import { runReEngagement } from '../src/services/re-engagement.js';

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

async function run() {
  const args = parseArgs();
  console.log('[reengage] args:', args);

  const result = await runReEngagement({
    dryRun: args.dryRun,
    limit: args.limit,
    toEmail: args.to,
  });

  console.log('---');
  console.log(`[reengage] Candidates found:  ${result.candidatesFound}`);
  console.log(`[reengage] Capped (skipped):  ${result.capped}`);
  console.log(`[reengage] Attempted:         ${result.attempted}`);
  console.log(`[reengage] Sent:              ${result.sent}${args.dryRun ? ' (dry-run, not actually sent)' : ''}`);
  console.log(`[reengage] Failed:            ${result.failed}`);
  console.log('[reengage] By segment:');
  for (const [seg, count] of Object.entries(result.bySegment)) {
    console.log(`  ${seg}: ${count}`);
  }

  if (result.details.length > 0) {
    console.log('---');
    console.log('[reengage] Per-recipient details (first 30):');
    for (const d of result.details.slice(0, 30)) {
      const tail = d.reason ? `  reason: ${d.reason}` : '';
      console.log(`  ${d.status.toUpperCase().padEnd(7)} ${d.email.padEnd(40)} ${d.segment.padEnd(18)} stale=${d.staleDays}d${tail}`);
    }
    if (result.details.length > 30) console.log(`  ...and ${result.details.length - 30} more`);
  }

  if (result.failures.length > 0) {
    console.log('---');
    console.log('[reengage] Failures:');
    for (const f of result.failures) console.log(`  ${f.email}: ${f.error}`);
  }

  console.log('[reengage] Done.');
}

run().catch(err => {
  console.error('[reengage] Fatal:', err);
  process.exit(1);
});
