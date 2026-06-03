// 90-day lifecycle email scheduler (rungs 2-30 of the series).
//
// Cadence: weekdays only (M-F, no weekend sends). One email per signup per tick,
// in rung order. Rung 1 (welcome, day 0) is owned by the Clerk webhook, so this
// scheduler starts at rung 2.
//
// Skip-gate (per David 2026-06-03): before sending a rung whose milestone the
// user already hit, mark it skipped and advance to the next rung. Cheap indexed
// lookups only.
//
// SAFETY: sends are gated behind LIFECYCLE_EMAILS_LIVE=true. Without it the tick
// runs in DRY-RUN: it computes and logs what it WOULD send/skip but writes
// nothing and sends nothing. This keeps the go-live decision a deliberate flip,
// not a side effect of deploy. The old onboarding day-3/day-7 drip and the
// re-engagement nudges still run; coordinate retirement before going live.

import cron from 'node-cron';
import { and, eq, isNull, lte, sql } from 'drizzle-orm';
import { createClerkClient } from '@clerk/backend';
import { db } from '../config/database.js';
import {
  onboardingSequence,
  lifecycleSends,
  orgMembers,
  meetings,
  rocks,
  kpis,
} from '../db/schema.js';
import { sendEmail } from '../config/email.js';
import { EMAILS, type LifecycleEmail } from '../data/email-series.js';
import { renderLifecycleEmail } from './lifecycle-email.js';
import { isSuppressedRecipient } from './re-engagement.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const BATCH_LIMIT = 200;

function isLive(): boolean {
  return process.env.LIFECYCLE_EMAILS_LIVE === 'true';
}

let clerk: ReturnType<typeof createClerkClient> | null = null;
function getClerk(): ReturnType<typeof createClerkClient> | null {
  if (clerk) return clerk;
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) return null;
  clerk = createClerkClient({ secretKey });
  return clerk;
}

/** Real first name from Clerk for the greeting. Falls back to null (renders
 *  "Hi there,") if Clerk is unreachable or the name is unset. */
async function firstNameFor(clerkUserId: string): Promise<string | null> {
  const c = getClerk();
  if (!c) return null;
  try {
    const u = await c.users.getUser(clerkUserId);
    return (u.firstName && u.firstName.trim()) ? u.firstName.trim() : null;
  } catch {
    return null;
  }
}

async function orgIdForUser(clerkUserId: string): Promise<string | null> {
  const rows = await db
    .select({ orgId: orgMembers.orgId })
    .from(orgMembers)
    .where(eq(orgMembers.clerkUserId, clerkUserId))
    .limit(1);
  return rows[0]?.orgId ?? null;
}

async function countWhere(table: typeof meetings | typeof rocks | typeof kpis, orgId: string): Promise<number> {
  const rows = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(table)
    .where(eq((table as typeof meetings).organizationId, orgId))
    .limit(1);
  return rows[0]?.c ?? 0;
}

/** Returns true if the rung's skipIf milestone is already satisfied for this user. */
async function milestoneMet(skipIf: string | undefined, clerkUserId: string): Promise<boolean> {
  if (!skipIf) return false;
  const orgId = await orgIdForUser(clerkUserId);
  if (!orgId) return false; // no org yet -> nothing is done -> never skip
  switch (skipIf) {
    case 'members>1': {
      const rows = await db
        .select({ c: sql<number>`count(*)::int` })
        .from(orgMembers)
        .where(eq(orgMembers.orgId, orgId))
        .limit(1);
      return (rows[0]?.c ?? 0) > 1;
    }
    case 'meeting exists':
      return (await countWhere(meetings, orgId)) > 0;
    case 'goal exists':
      return (await countWhere(rocks, orgId)) > 0;
    case 'kpi exists':
      return (await countWhere(kpis, orgId)) > 0;
    default:
      // Unknown skip condition (e.g. "agent exists") -> never skip, send the email.
      return false;
  }
}

async function recordSend(clerkUserId: string, emailN: number, skipped: boolean): Promise<void> {
  await db
    .insert(lifecycleSends)
    .values({ clerkUserId, emailN, skipped })
    .onConflictDoNothing();
}

async function processSignup(row: {
  clerkUserId: string;
  email: string;
  signupAt: Date;
}): Promise<'sent' | 'skipped-only' | 'none'> {
  const daysSince = Math.floor((Date.now() - row.signupAt.getTime()) / DAY_MS);

  const sent = await db
    .select({ emailN: lifecycleSends.emailN })
    .from(lifecycleSends)
    .where(eq(lifecycleSends.clerkUserId, row.clerkUserId));
  const done = new Set(sent.map(r => r.emailN));

  // Rungs 2..30 that are due (day <= daysSince) and not yet acted on, in order.
  const due = EMAILS
    .filter(e => Number(e.n) >= 2 && Number(e.day) <= daysSince && !done.has(Number(e.n)))
    .sort((a, b) => Number(a.n) - Number(b.n));

  let skippedAny = false;
  for (const e of due) {
    const n = Number(e.n);
    if (await milestoneMet(e.skipIf, row.clerkUserId)) {
      if (isLive()) await recordSend(row.clerkUserId, n, true);
      console.log(`[lifecycle] ${isLive() ? 'SKIP' : 'DRY-RUN skip'} rung ${n} (${e.skipIf}) for ${row.email}`);
      skippedAny = true;
      continue;
    }
    // First non-skipped due rung: personalize, then send exactly one and stop.
    const firstName = await firstNameFor(row.clerkUserId);
    if (!isLive()) {
      console.log(`[lifecycle] DRY-RUN: would send rung ${n} "${e.subject}" to ${row.email} (Hi ${firstName || 'there'})`);
      return 'sent';
    }
    const ok = await sendOne(e, row.email, firstName);
    if (ok) {
      await recordSend(row.clerkUserId, n, false);
      console.log(`[lifecycle] sent rung ${n} "${e.subject}" to ${row.email}`);
      return 'sent';
    }
    // send failed: leave unrecorded so it retries next tick.
    return 'none';
  }
  return skippedAny ? 'skipped-only' : 'none';
}

async function sendOne(e: LifecycleEmail, email: string, firstName: string | null): Promise<boolean> {
  try {
    const html = renderLifecycleEmail(e, firstName, email);
    const id = await sendEmail({
      to: email,
      subject: e.subject,
      html,
      from: 'David Steel <notifications@mail.orgtp.com>',
      replyTo: 'dsteel@sneeze.it',
      tags: [
        { name: 'campaign', value: 'lifecycle_90d' },
        { name: 'rung', value: String(e.n) },
      ],
    });
    return !!id;
  } catch (err) {
    console.error(`[lifecycle] render/send failed for rung ${e.n} -> ${email}:`, err);
    return false;
  }
}

export async function runLifecycleTick(): Promise<void> {
  try {
    const rows = await db
      .select({
        clerkUserId: onboardingSequence.clerkUserId,
        email: onboardingSequence.email,
        signupAt: onboardingSequence.signupAt,
      })
      .from(onboardingSequence)
      .where(
        and(
          isNull(onboardingSequence.unsubscribedAt),
          lte(onboardingSequence.signupAt, new Date(Date.now() - 2 * DAY_MS)),
        ),
      )
      .limit(BATCH_LIMIT);

    let sent = 0;
    let suppressed = 0;
    for (const row of rows) {
      // Never send lifecycle mail to internal staff, the demo org, or test
      // aliases. Same suppression list the re-engagement service uses.
      if (isSuppressedRecipient(row.email)) { suppressed++; continue; }
      const r = await processSignup(row);
      if (r === 'sent') sent++;
    }
    if (rows.length > 0) {
      console.log(`[lifecycle] tick complete (${isLive() ? 'LIVE' : 'DRY-RUN'}). scanned=${rows.length} sent=${sent} suppressed=${suppressed}`);
    }
  } catch (err) {
    console.error('[lifecycle] tick failed:', err);
  }
}

let scheduled = false;
export function startLifecycleScheduler(): void {
  if (scheduled) return;
  scheduled = true;

  // Weekdays only (Mon-Fri), 10:00 AM America/New_York. One run per weekday.
  cron.schedule(
    '0 10 * * 1-5',
    () => {
      void runLifecycleTick();
    },
    { timezone: 'America/New_York' },
  );

  console.log(`[lifecycle] scheduler started (weekdays 10:00 AM ET, ${isLive() ? 'LIVE' : 'DRY-RUN'})`);
}
