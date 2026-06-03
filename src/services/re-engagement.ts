// Re-engagement nudge service.
//
// Per David 2026-04-29:
// - Trigger: >3 days since last login (or, for pre-signups, >3 days since signup)
// - Frequency cap: max 4 nudges per trailing 30 days, with >=7 days between nudges
// - Pre-signups (no Clerk account) get the same cadence with a different template
// - This is NOT a product-update channel. Templates focus on what the user
//   CAN do on OTP, not on what we shipped.
//
// Segments:
// - pre_signup       : in newsletter_subscribers, no Clerk account with same email
// - clerk_pre_oos    : Clerk user, no published OOS file for their org
// - clerk_post_oos   : Clerk user, has at least one published OOS file
//
// All sends route through Resend via the existing sendEmail() helper.
// Every send (success or failure) is recorded in user_engagement_log.

import path from 'path';
import { fileURLToPath } from 'url';
import ejs from 'ejs';
import { eq, and, isNull, gte, sql } from 'drizzle-orm';
import { createClerkClient } from '@clerk/backend';
import { db } from '../config/database.js';
import { newsletterSubscribers, organizations, oosFiles, userEngagementLog } from '../db/schema.js';
import { sendEmail } from '../config/email.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export type Segment = 'pre_signup' | 'clerk_pre_oos' | 'clerk_post_oos';

const STALE_DAYS = 3;
const COOLDOWN_DAYS = 7;
const CAP_PER_30_DAYS = 4;

const TEMPLATE_BY_SEGMENT: Record<Segment, string> = {
  pre_signup: 'reengage-pre-signup',
  clerk_pre_oos: 'reengage-clerk-pre-oos',
  clerk_post_oos: 'reengage-clerk-post-oos',
};

const SUBJECT_BY_SEGMENT: Record<Segment, string> = {
  pre_signup: 'A nudge from OTP',
  clerk_pre_oos: 'Your OTP account is waiting on you',
  clerk_post_oos: 'Your agents are still reading your OOS',
};

// Accounts that must NEVER receive an automated re-engagement nudge: internal
// staff, the demo org, test aliases, and specific relationships David handles
// personally. Domain entries suppress the whole domain (so dsteel+...@sneeze.it
// aliases are caught too); address entries suppress a single inbox. Matched
// case-insensitively. Keep this list short and obvious.
const SUPPRESSED_DOMAINS = new Set<string>([
  'sneeze.it',
  'orgtp.com',
  'acme.example',
  'juicedboxes.com',
  'example.com',
]);
const SUPPRESSED_EMAILS = new Set<string>([
  'krisg@jointher3volution.com', // EO relationship -- David reaches out personally
]);

export function isSuppressedRecipient(email: string): boolean {
  const e = (email || '').trim().toLowerCase();
  if (!e) return true;
  if (SUPPRESSED_EMAILS.has(e)) return true;
  const at = e.lastIndexOf('@');
  if (at === -1) return true;
  return SUPPRESSED_DOMAINS.has(e.slice(at + 1));
}

export interface Candidate {
  email: string;
  firstName: string | null;
  segment: Segment;
  clerkUserId: string | null;
  lastSignInAt: Date | null;     // null for pre_signup
  staleDays: number;             // since last_sign_in_at OR since signup for pre-signups
  publishedOosName: string | null; // for clerk_post_oos copy
}

// ---------------------------------------------------------------------------
// Candidate collection
// ---------------------------------------------------------------------------

async function pullClerkCandidates(): Promise<Candidate[]> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    console.warn('[reengage] CLERK_SECRET_KEY not set; skipping Clerk candidates');
    return [];
  }
  const clerk = createClerkClient({ secretKey });
  const out: Candidate[] = [];
  const now = Date.now();
  const staleCutoffMs = now - STALE_DAYS * 24 * 60 * 60 * 1000;

  let offset = 0;
  const pageSize = 100;
  for (let page = 0; page < 50; page++) {
    const { data } = await clerk.users.getUserList({ limit: pageSize, offset });
    if (!data || data.length === 0) break;
    for (const u of data) {
      const primary = u.emailAddresses.find(e => e.id === u.primaryEmailAddressId)?.emailAddress
        || u.emailAddresses[0]?.emailAddress
        || null;
      if (!primary) continue;

      // Stale gate: last_sign_in_at older than STALE_DAYS, or never signed in but
      // account is older than STALE_DAYS (treat that as the same shape).
      const lastSignInMs = u.lastSignInAt ?? u.createdAt;
      if (lastSignInMs > staleCutoffMs) continue; // not stale yet, skip

      const staleDays = Math.floor((now - lastSignInMs) / (24 * 60 * 60 * 1000));

      // Resolve org + published-OOS state to pick segment.
      let segment: Segment = 'clerk_pre_oos';
      let publishedOosName: string | null = null;
      const orgArr = await db
        .select()
        .from(organizations)
        .where(eq(organizations.clerkOrgId, u.id))
        .limit(1);
      const org = orgArr[0];
      if (org) {
        const pubArr = await db
          .select()
          .from(oosFiles)
          .where(and(eq(oosFiles.orgId, org.id), eq(oosFiles.status, 'published')))
          .limit(1);
        if (pubArr[0]) {
          segment = 'clerk_post_oos';
          publishedOosName = pubArr[0].name || null;
        }
      }

      out.push({
        email: primary.toLowerCase(),
        firstName: u.firstName || null,
        segment,
        clerkUserId: u.id,
        lastSignInAt: new Date(lastSignInMs),
        staleDays,
        publishedOosName,
      });
    }
    if (data.length < pageSize) break;
    offset += pageSize;
  }
  return out;
}

async function pullPreSignupCandidates(clerkEmails: Set<string>): Promise<Candidate[]> {
  const now = Date.now();
  const staleCutoff = new Date(now - STALE_DAYS * 24 * 60 * 60 * 1000);
  const rows = await db
    .select()
    .from(newsletterSubscribers)
    .where(and(
      isNull(newsletterSubscribers.unsubscribedAt),
      isNull(newsletterSubscribers.convertedAt),    // converted users are tracked via Clerk
      sql`${newsletterSubscribers.subscribedAt} <= ${staleCutoff.toISOString()}`,
    ));
  const out: Candidate[] = [];
  for (const r of rows) {
    if (clerkEmails.has(r.email.toLowerCase())) continue; // they have a Clerk account, handled there
    const staleDays = Math.floor((now - new Date(r.subscribedAt).getTime()) / (24 * 60 * 60 * 1000));
    out.push({
      email: r.email.toLowerCase(),
      firstName: r.name?.split(/\s+/)[0] || null,
      segment: 'pre_signup',
      clerkUserId: null,
      lastSignInAt: null,
      staleDays,
      publishedOosName: null,
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Frequency cap
// ---------------------------------------------------------------------------

interface NudgeHistory {
  totalLast30: number;
  daysSinceLastNudge: number | null;
}

async function loadHistoryByEmail(emails: string[]): Promise<Map<string, NudgeHistory>> {
  const out = new Map<string, NudgeHistory>();
  if (emails.length === 0) return out;

  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const rows = await db
    .select()
    .from(userEngagementLog)
    .where(and(
      eq(userEngagementLog.sendStatus, 'sent'),
      gte(userEngagementLog.sentAt, cutoff),
    ));

  for (const email of emails) {
    const lower = email.toLowerCase();
    const recent = rows.filter(r => r.userEmail.toLowerCase() === lower);
    if (recent.length === 0) {
      out.set(lower, { totalLast30: 0, daysSinceLastNudge: null });
      continue;
    }
    const lastSentAt = recent.reduce((max, r) => r.sentAt > max ? r.sentAt : max, recent[0].sentAt);
    const daysSinceLast = Math.floor((Date.now() - lastSentAt.getTime()) / (24 * 60 * 60 * 1000));
    out.set(lower, { totalLast30: recent.length, daysSinceLastNudge: daysSinceLast });
  }
  return out;
}

function passesCap(history: NudgeHistory): boolean {
  if (history.totalLast30 >= CAP_PER_30_DAYS) return false;
  if (history.daysSinceLastNudge !== null && history.daysSinceLastNudge < COOLDOWN_DAYS) return false;
  return true;
}

// ---------------------------------------------------------------------------
// Render + send
// ---------------------------------------------------------------------------

async function renderTemplate(segment: Segment, candidate: Candidate): Promise<string> {
  const file = TEMPLATE_BY_SEGMENT[segment] + '.ejs';
  const templatePath = path.resolve(__dirname, '..', 'templates', 'emails', file);
  return await ejs.renderFile(templatePath, {
    email: candidate.email,
    firstName: candidate.firstName || 'there',
    staleDays: candidate.staleDays,
    publishedOosName: candidate.publishedOosName,
  });
}

async function logNudge(
  candidate: Candidate,
  templateKey: string,
  status: 'sent' | 'failed',
  error: string | null,
): Promise<void> {
  await db.insert(userEngagementLog).values({
    userEmail: candidate.email,
    clerkUserId: candidate.clerkUserId,
    lastSignInAtAtSend: candidate.lastSignInAt,
    segment: candidate.segment,
    templateKey,
    sendStatus: status,
    sendError: error,
  });
}

// ---------------------------------------------------------------------------
// Public runner
// ---------------------------------------------------------------------------

export interface RunOptions {
  dryRun?: boolean;
  limit?: number | null;
  toEmail?: string | null;     // redirect ALL sends to this address (self-test). Candidate data still rendered normally.
  throttleMs?: number;
}

export interface RunResult {
  candidatesFound: number;
  suppressed: number;
  capped: number;
  attempted: number;
  sent: number;
  failed: number;
  bySegment: Record<Segment, number>;
  failures: Array<{ email: string; error: string }>;
  details: Array<{ email: string; segment: Segment; staleDays: number; status: 'sent' | 'failed' | 'skipped'; reason?: string }>;
}

export async function runReEngagement(opts: RunOptions = {}): Promise<RunResult> {
  const dryRun = opts.dryRun ?? false;
  const throttleMs = opts.throttleMs ?? 250;
  const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

  const result: RunResult = {
    candidatesFound: 0,
    suppressed: 0,
    capped: 0,
    attempted: 0,
    sent: 0,
    failed: 0,
    bySegment: { pre_signup: 0, clerk_pre_oos: 0, clerk_post_oos: 0 },
    failures: [],
    details: [],
  };

  // 1. Collect candidates
  const clerkCandidates = await pullClerkCandidates();
  const clerkEmails = new Set(clerkCandidates.map(c => c.email));
  const preSignupCandidates = await pullPreSignupCandidates(clerkEmails);
  let candidates: Candidate[] = [...clerkCandidates, ...preSignupCandidates];
  result.candidatesFound = candidates.length;

  // Suppression: never nudge internal staff, the demo org, test aliases, or
  // hand-managed relationships. Runs before the cap/sample/limit stages so a
  // suppressed address can never consume a send slot.
  const suppressed = candidates.filter(c => isSuppressedRecipient(c.email));
  if (suppressed.length) {
    candidates = candidates.filter(c => !isSuppressedRecipient(c.email));
    result.suppressed = suppressed.length;
    for (const c of suppressed) {
      result.details.push({ email: c.email, segment: c.segment, staleDays: c.staleDays, status: 'skipped', reason: 'suppressed (internal/relationship)' });
    }
  }

  // Self-test: when toEmail is set, deliver one sample of each unique segment
  // to the override address so the operator can preview rendering.
  if (opts.toEmail) {
    const seen = new Set<Segment>();
    candidates = candidates.filter(c => {
      if (seen.has(c.segment)) return false;
      seen.add(c.segment);
      return true;
    });
  }
  if (opts.limit !== undefined && opts.limit !== null) {
    candidates = candidates.slice(0, opts.limit);
  }

  // 2. Apply frequency cap
  const history = await loadHistoryByEmail(candidates.map(c => c.email));
  const eligible: Candidate[] = [];
  for (const c of candidates) {
    const h = history.get(c.email) ?? { totalLast30: 0, daysSinceLastNudge: null };
    if (!passesCap(h)) {
      result.capped += 1;
      result.details.push({
        email: c.email,
        segment: c.segment,
        staleDays: c.staleDays,
        status: 'skipped',
        reason: h.totalLast30 >= CAP_PER_30_DAYS
          ? `at cap (${h.totalLast30}/${CAP_PER_30_DAYS} in last 30d)`
          : `cooldown (${h.daysSinceLastNudge}d since last; need ${COOLDOWN_DAYS}d)`,
      });
      continue;
    }
    eligible.push(c);
  }
  result.attempted = eligible.length;

  // 3. Send
  for (let i = 0; i < eligible.length; i++) {
    const c = eligible[i];
    result.bySegment[c.segment] += 1;
    const templateKey = TEMPLATE_BY_SEGMENT[c.segment];

    if (dryRun) {
      result.details.push({ email: c.email, segment: c.segment, staleDays: c.staleDays, status: 'sent', reason: 'dry-run' });
      result.sent += 1;
      continue;
    }

    try {
      const html = await renderTemplate(c.segment, c);
      const deliverTo = opts.toEmail ?? c.email;
      const subject = opts.toEmail
        ? `[TEST -> ${c.email}] ${SUBJECT_BY_SEGMENT[c.segment]}`
        : SUBJECT_BY_SEGMENT[c.segment];
      const ok = await sendEmail({
        to: deliverTo,
        subject,
        html,
        from: 'David Steel <notifications@mail.orgtp.com>',
      });
      if (ok) {
        if (!opts.toEmail) await logNudge(c, templateKey, 'sent', null);
        result.sent += 1;
        result.details.push({ email: c.email, segment: c.segment, staleDays: c.staleDays, status: 'sent' });
      } else {
        if (!opts.toEmail) await logNudge(c, templateKey, 'failed', 'sendEmail returned false');
        result.failed += 1;
        result.failures.push({ email: c.email, error: 'sendEmail returned false' });
        result.details.push({ email: c.email, segment: c.segment, staleDays: c.staleDays, status: 'failed' });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!opts.toEmail) await logNudge(c, templateKey, 'failed', msg).catch(() => undefined);
      result.failed += 1;
      result.failures.push({ email: c.email, error: msg });
      result.details.push({ email: c.email, segment: c.segment, staleDays: c.staleDays, status: 'failed' });
    }

    if (i < eligible.length - 1) await sleep(throttleMs);
  }

  return result;
}
