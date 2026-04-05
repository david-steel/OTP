import { sql } from 'drizzle-orm';
import { createClerkClient } from '@clerk/backend';
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../config/database.js';
import { organizations, oosFiles, claims, claimSimilarities, bestPractices } from '../db/schema.js';
import { sendEmail } from '../config/email.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---- Types ----

interface WeeklyDigestResult {
  sent: number;
  skipped: number;
  noActivity: boolean;
}

interface NewOrg {
  name: string;
  industry: string;
  badge: string | null;
}

interface NewOOS {
  orgName: string;
  template: string;
  claimCount: number;
}

interface TrendingClaim {
  rule: string;
  orgName: string;
  matchCount: number;
}

interface DigestData {
  dateRangeStart: string;
  dateRangeEnd: string;
  newOrgCount: number;
  newOOSCount: number;
  newBestPracticeCount: number;
  newClaimCount: number;
  newOrgs: NewOrg[];
  newOOSFiles: NewOOS[];
  trendingClaims: TrendingClaim[];
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

async function gatherWeeklyActivity(): Promise<DigestData> {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const dateRangeStart = weekAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const dateRangeEnd = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // New organizations (last 7 days)
  const newOrgRows = await db.execute(sql`
    SELECT name, industry, badge
    FROM organizations
    WHERE created_at >= ${weekAgo}
    ORDER BY created_at DESC
  `);
  const newOrgs = (newOrgRows.rows as Array<{ name: string; industry: string; badge: string | null }>).map(row => ({
    name: row.name,
    industry: row.industry,
    badge: row.badge,
  }));

  // New OOS files published (last 7 days)
  const newOOSRows = await db.execute(sql`
    SELECT o.name AS org_name, f.template, f.claim_count
    FROM oos_files f
    JOIN organizations o ON f.org_id = o.id
    WHERE f.status = 'published'
      AND f.published_at >= ${weekAgo}
    ORDER BY f.published_at DESC
    LIMIT 5
  `);
  const newOOSFiles = (newOOSRows.rows as Array<{ org_name: string; template: string; claim_count: number }>).map(row => ({
    orgName: row.org_name,
    template: row.template,
    claimCount: row.claim_count,
  }));

  // Total new OOS count (may be more than 5)
  const newOOSCountRows = await db.execute(sql`
    SELECT COUNT(*) AS cnt
    FROM oos_files
    WHERE status = 'published'
      AND published_at >= ${weekAgo}
  `);
  const newOOSCount = parseInt((newOOSCountRows.rows as any[])?.[0]?.cnt || '0', 10);

  // New claims count
  const newClaimRows = await db.execute(sql`
    SELECT COUNT(*) AS cnt
    FROM claims
    WHERE created_at >= ${weekAgo}
  `);
  const newClaimCount = parseInt((newClaimRows.rows as any[])?.[0]?.cnt || '0', 10);

  // New best practices count
  const newBPRows = await db.execute(sql`
    SELECT COUNT(*) AS cnt
    FROM best_practices
    WHERE created_at >= ${weekAgo}
  `);
  const newBestPracticeCount = parseInt((newBPRows.rows as any[])?.[0]?.cnt || '0', 10);

  // Top 3 most-connected claims this week (highest match count from new similarities)
  const trendingRows = await db.execute(sql`
    SELECT
      c.rule,
      COALESCE(o.pseudonym, o.name) AS org_name,
      COUNT(*) AS match_count
    FROM claim_similarities cs
    JOIN claims c ON c.id = cs.claim_a_id
    JOIN oos_files f ON c.oos_file_id = f.id
    JOIN organizations o ON f.org_id = o.id
    WHERE cs.created_at >= ${weekAgo}
      AND f.status = 'published'
    GROUP BY c.id, c.rule, o.pseudonym, o.name
    ORDER BY match_count DESC
    LIMIT 3
  `);
  const trendingClaims = (trendingRows.rows as Array<{ rule: string; org_name: string; match_count: string }>).map(row => ({
    rule: row.rule,
    orgName: row.org_name,
    matchCount: parseInt(row.match_count, 10),
  }));

  return {
    dateRangeStart,
    dateRangeEnd,
    newOrgCount: newOrgs.length,
    newOOSCount,
    newBestPracticeCount,
    newClaimCount,
    newOrgs,
    newOOSFiles,
    trendingClaims,
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

    // Step 1: Gather activity
    const data = await gatherWeeklyActivity();
    console.log(`[digest] Activity: ${data.newOrgCount} new orgs, ${data.newOOSCount} new OOS, ${data.newBestPracticeCount} new best practices, ${data.newClaimCount} new claims`);

    // Step 2: Check if there's anything to report
    if (data.newOrgCount === 0 && data.newOOSCount === 0 && data.newBestPracticeCount === 0) {
      console.log('[digest] No new activity this week -- skipping');
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
    const subject = `This week on OTP -- ${data.newOOSCount} new skill${data.newOOSCount === 1 ? '' : 's'}, ${data.newOrgCount} new org${data.newOrgCount === 1 ? '' : 's'}`;

    // Step 5: Send to each publisher
    let sent = 0;
    let skipped = 0;

    for (const publisher of publishers) {
      try {
        const success = await sendEmail({
          to: publisher.email,
          subject,
          html,
          from: 'OTP <notifications@orgtp.com>',
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
