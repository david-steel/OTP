/**
 * One-time go-live guard for the 90-day lifecycle series.
 *
 * Rule (David 2026-06-03): only DORMANT existing signups (no login in >7 days)
 * should flow into the lifecycle journey at go-live. ACTIVE signups (logged in
 * within 7 days) must NOT be flooded with the "getting started" backlog.
 *
 * So for each existing, non-unsubscribed, non-suppressed signup:
 *   - last login <= 7 days ago (ACTIVE)  -> guard: insert a skipped row for
 *     every rung already due (day <= days-since-signup), so the scheduler never
 *     back-sends the overdue backlog. Future rungs still flow at natural cadence.
 *   - last login > 7 days ago, or never  -> leave untouched: the scheduler will
 *     start them at rung 2 (re-activation).
 *
 * Idempotent (onConflictDoNothing). Safe to re-run. Reversible by deleting the
 * skipped rows. MUST run against prod: `railway run npx tsx scripts/backfill-lifecycle-guard.ts`
 */
import { isNull } from 'drizzle-orm';
import { createClerkClient } from '@clerk/backend';
import { db } from '../src/config/database.js';
import { onboardingSequence, lifecycleSends } from '../src/db/schema.js';
import { EMAILS } from '../src/data/email-series.js';
import { isSuppressedRecipient } from '../src/services/re-engagement.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const ACTIVE_WINDOW_DAYS = 7;
const RUNGS = EMAILS.map(e => ({ n: Number(e.n), day: Number(e.day) })).filter(r => r.n >= 2);

async function main() {
  const dry = process.argv.includes('--dry');
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) throw new Error('CLERK_SECRET_KEY required (run via `railway run`)');
  const clerk = createClerkClient({ secretKey });

  const rows = await db
    .select({
      clerkUserId: onboardingSequence.clerkUserId,
      email: onboardingSequence.email,
      signupAt: onboardingSequence.signupAt,
    })
    .from(onboardingSequence)
    .where(isNull(onboardingSequence.unsubscribedAt));

  let guardedUsers = 0, guardedRungs = 0, dormant = 0, suppressed = 0, unknown = 0;
  const now = Date.now();

  for (const row of rows) {
    if (isSuppressedRecipient(row.email)) { suppressed++; continue; }

    let lastSignInMs: number | null = null;
    try {
      const u = await clerk.users.getUser(row.clerkUserId);
      lastSignInMs = u.lastSignInAt ?? u.createdAt ?? null;
    } catch {
      unknown++; // user not resolvable -> treat as dormant, leave untouched
      continue;
    }
    if (lastSignInMs == null) { dormant++; continue; }

    const daysSinceLogin = Math.floor((now - lastSignInMs) / DAY_MS);
    if (daysSinceLogin > ACTIVE_WINDOW_DAYS) {
      dormant++;
      console.log(`ENROLL ${row.email} (dormant ${daysSinceLogin}d since login)`);
      continue;
    } // re-activation: enroll

    // ACTIVE: guard the overdue backlog (rungs already due as of today).
    const daysSinceSignup = Math.floor((now - row.signupAt.getTime()) / DAY_MS);
    const dueRungs = RUNGS.filter(r => r.day <= daysSinceSignup);
    if (dueRungs.length === 0) continue;
    guardedUsers++;
    for (const r of dueRungs) {
      guardedRungs++;
      if (!dry) {
        await db.insert(lifecycleSends)
          .values({ clerkUserId: row.clerkUserId, emailN: r.n, skipped: true })
          .onConflictDoNothing();
      }
    }
    console.log(`${dry ? '[dry] ' : ''}GUARD ${row.email} (active ${daysSinceLogin}d) -> ${dueRungs.length} rungs skipped`);
  }

  console.log(`\n=== backfill ${dry ? 'DRY-RUN ' : ''}summary ===`);
  console.log(`total signups scanned : ${rows.length}`);
  console.log(`suppressed (internal) : ${suppressed}`);
  console.log(`ACTIVE guarded users  : ${guardedUsers} (${guardedRungs} skip rows)`);
  console.log(`DORMANT/never (enroll): ${dormant}`);
  console.log(`unknown (enroll)      : ${unknown}`);
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
