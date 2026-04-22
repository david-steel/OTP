import { sql } from 'drizzle-orm';
import { createClerkClient } from '@clerk/backend';
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../config/database.js';
import { sendEmail } from '../config/email.js';
import { getRecentEntries } from '../data/changelog.js';
import type { ChangelogEntry } from '../data/changelog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---- Types ----

interface WeeklyDigestResult {
  sent: number;
  skipped: number;
  noActivity: boolean;
}

interface NetworkStats {
  totalOrgs: number;
  totalClaims: number;
}

interface DigestData {
  dateRangeStart: string;
  dateRangeEnd: string;
  entries: ChangelogEntry[];
  networkStats: NetworkStats;
}

// ---- Clerk email lookup (same pattern as notification-engine.ts) ----

async function getUserEmail(clerkOrgId: string): Promise<string | null> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    console.warn('[digest] CLERK_SECRET_KEY not set -- cannot look up user email');
    return null;
  }

  // Seed/publisher orgs don't have real Clerk accounts
  if (!clerkOrgId.startsWith('user_') && !clerkOrgId.startsWith('org_')) {
    return null;
  }

  try {
    const clerk = createClerkClient({ secretKey });

    if (clerkOrgId.startsWith('user_')) {
      const user = await clerk.users.getUser(clerkOrgId);
      const primary = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId);
      return primary?.emailAddress || user.emailAddresses[0]?.emailAddress || null;
    }

    const members = await clerk.organizations.getOrganizationMembershipList({
      organizationId: clerkOrgId,
      limit: 10,
    });
    const admin = members.data.find(m => m.role === 'org:admin') || members.data[0];
    if (!admin?.publicUserData?.userId) return null;

    const user = await clerk.users.getUser(admin.publicUserData.userId);
    const primary = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId);
    return primary?.emailAddress || user.emailAddresses[0]?.emailAddress || null;
  } catch (err) {
    console.error(`[digest] Failed to fetch email for Clerk ID "${clerkOrgId}":`, err);
    return null;
  }
}

// ---- Data gathering ----

async function gatherDigestData(): Promise<DigestData> {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const dateRangeStart = weekAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const dateRangeEnd = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Get changelog entries from the last 7 days
  const entries = getRecentEntries(7);

  // Network stats for the footer
  const orgCountRes = await db.execute(sql`
    SELECT COUNT(DISTINCT org_id) AS cnt
    FROM oos_files
    WHERE status = 'published'
  `);
  const totalOrgs = parseInt((orgCountRes.rows as any[])?.[0]?.cnt || '0', 10);

  const claimCountRes = await db.execute(sql`
    SELECT COUNT(*) AS cnt
    FROM claims
    WHERE oos_file_id IN (SELECT id FROM oos_files WHERE status = 'published')
  `);
  const totalClaims = parseInt((claimCountRes.rows as any[])?.[0]?.cnt || '0', 10);

  return {
    dateRangeStart,
    dateRangeEnd,
    entries,
    networkStats: { totalOrgs, totalClaims },
  };
}

// ---- Publisher resolution ----

interface PublisherEmail {
  orgId: string;
  email: string;
}

async function getPublisherEmails(): Promise<PublisherEmail[]> {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // All orgs with at least 1 published OOS, excluding those created in the last 24 hours
  const rows = await db.execute(sql`
    SELECT DISTINCT o.id, o.clerk_org_id
    FROM organizations o
    JOIN oos_files f ON f.org_id = o.id
    WHERE f.status = 'published'
      AND o.created_at < ${oneDayAgo}
  `);

  const publishers: PublisherEmail[] = [];
  for (const row of (rows.rows as Array<{ id: string; clerk_org_id: string }>)) {
    const email = await getUserEmail(row.clerk_org_id);
    if (email) {
      publishers.push({ orgId: row.id, email });
    } else {
      console.log(`[digest] Skipping org ${row.id} (clerk: ${row.clerk_org_id}) -- no email resolved`);
    }
  }

  return publishers;
}

// ---- Rendering ----

async function renderDigestHtml(data: DigestData): Promise<string> {
  const templatePath = path.resolve(__dirname, '../templates/emails/weekly-digest.ejs');
  return ejs.renderFile(templatePath, data);
}

// ---- Main export ----

export async function sendWeeklyDigest(): Promise<WeeklyDigestResult> {
  try {
    console.log('[digest] Starting weekly digest...');

    // Step 1: Gather data
    const data = await gatherDigestData();
    console.log(`[digest] Found ${data.entries.length} changelog entries, network: ${data.networkStats.totalOrgs} orgs, ${data.networkStats.totalClaims} claims`);

    // Step 2: Check if there's anything to report
    if (data.entries.length === 0) {
      console.log('[digest] No new changelog entries this week -- skipping');
      return { sent: 0, skipped: 0, noActivity: true };
    }

    // Step 3: Get publisher emails
    const publishers = await getPublisherEmails();
    console.log(`[digest] Found ${publishers.length} publishers with resolved emails`);

    if (publishers.length === 0) {
      console.log('[digest] No publisher emails resolved -- skipping');
      return { sent: 0, skipped: 0, noActivity: false };
    }

    // Step 4: Render email
    const html = await renderDigestHtml(data);
    const subject = `What's New on OTP -- ${data.entries.length} update${data.entries.length === 1 ? '' : 's'} this week`;

    // Step 5: Send to each publisher
    let sent = 0;
    let skipped = 0;

    for (const publisher of publishers) {
      try {
        const success = await sendEmail({
          to: publisher.email,
          subject,
          html,
          from: 'OTP <notifications@mail.orgtp.com>',
        });

        if (success) {
          sent++;
          console.log(`[digest] Sent to ${publisher.email}`);
        } else {
          skipped++;
          console.warn(`[digest] Failed to send to ${publisher.email}`);
        }
      } catch (err) {
        skipped++;
        console.error(`[digest] Error sending to ${publisher.email}:`, err);
      }
    }

    console.log(`[digest] Complete: ${sent} sent, ${skipped} skipped`);
    return { sent, skipped, noActivity: false };
  } catch (err) {
    console.error('[digest] Fatal error in sendWeeklyDigest:', err);
    return { sent: 0, skipped: 0, noActivity: false };
  }
}
