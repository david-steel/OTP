import { sql } from 'drizzle-orm';
import { eq } from 'drizzle-orm';
import { createClerkClient } from '@clerk/backend';
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../config/database.js';
import { organizations, oosFiles, claims, claimSimilarities } from '../db/schema.js';
import { sendEmail } from '../config/email.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MATCH_SCORE_THRESHOLD = 0.4;
const MAX_MATCHES = 10;
const MAX_GROUPS = 5;

interface MatchedClaim {
  rule: string;
  section: string;
  confidence: string;
  orgName: string;
  orgId: string;
}

interface MatchGroup {
  orgName: string;
  matches: Array<{ rule: string; section: string; confidence: string }>;
}

/**
 * Find high-quality claim matches from other orgs for a newly published OOS.
 * Uses the pre-computed claim_similarities table.
 */
async function findMatchesForOos(oosFileId: string, orgId: string): Promise<MatchedClaim[]> {
  // Query claim_similarities where this OOS is on either side of the pair,
  // and the OTHER claim comes from a different org.
  const rows = await db.execute(sql`
    SELECT
      c.rule,
      c.section,
      c.confidence,
      o.id AS org_id,
      COALESCE(o.pseudonym, o.name) AS org_name,
      cs.similarity_score
    FROM claim_similarities cs
    JOIN claims c ON (
      CASE
        WHEN cs.oos_a_id = ${oosFileId} THEN cs.claim_b_id
        ELSE cs.claim_a_id
      END = c.id
    )
    JOIN oos_files f ON c.oos_file_id = f.id
    JOIN organizations o ON f.org_id = o.id
    WHERE (cs.oos_a_id = ${oosFileId} OR cs.oos_b_id = ${oosFileId})
      AND f.org_id != ${orgId}
      AND f.status = 'published'
      AND cs.similarity_score >= ${MATCH_SCORE_THRESHOLD}
    ORDER BY cs.similarity_score DESC
    LIMIT ${MAX_MATCHES}
  `);

  return (rows.rows as Array<{
    rule: string;
    section: string;
    confidence: string;
    org_id: string;
    org_name: string;
    similarity_score: number;
  }>).map(row => ({
    rule: row.rule,
    section: row.section,
    confidence: row.confidence,
    orgName: row.org_name,
    orgId: row.org_id,
  }));
}

/**
 * Group matches by source org for the email template.
 */
function groupByOrg(matches: MatchedClaim[]): MatchGroup[] {
  const grouped = new Map<string, MatchGroup>();

  for (const match of matches) {
    const key = match.orgId;
    if (!grouped.has(key)) {
      grouped.set(key, { orgName: match.orgName, matches: [] });
    }
    grouped.get(key)!.matches.push({
      rule: match.rule,
      section: match.section,
      confidence: match.confidence,
    });
  }

  // Sort groups by match count descending, cap at MAX_GROUPS
  return Array.from(grouped.values())
    .sort((a, b) => b.matches.length - a.matches.length)
    .slice(0, MAX_GROUPS);
}

/**
 * Get the user's email from Clerk using their userId (stored as clerkOrgId).
 */
async function getUserEmail(clerkUserId: string): Promise<string | null> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    console.warn('[notification] CLERK_SECRET_KEY not set -- cannot look up user email');
    return null;
  }

  try {
    const clerk = createClerkClient({ secretKey });
    const user = await clerk.users.getUser(clerkUserId);
    const primary = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId);
    return primary?.emailAddress || user.emailAddresses[0]?.emailAddress || null;
  } catch (err) {
    console.error('[notification] Failed to fetch user email from Clerk:', err);
    return null;
  }
}

/**
 * Render the match notification email HTML.
 */
async function renderEmailHtml(matchGroups: MatchGroup[], totalMatches: number): Promise<string> {
  const templatePath = path.resolve(__dirname, '../templates/emails/new-matches.ejs');
  const ctaUrl = 'https://orgtp.com/dashboard';

  return ejs.renderFile(templatePath, {
    matchGroups,
    totalMatches,
    ctaUrl,
  });
}

/**
 * Send a notification email to a newly published OOS author about matching
 * skills/claims from other organizations on the network.
 *
 * This is fire-and-forget. Errors are logged but never thrown.
 */
export async function notifyNewPublisher(orgId: string, oosFileId: string): Promise<void> {
  try {
    // Step 1: Find matches
    const matches = await findMatchesForOos(oosFileId, orgId);
    if (matches.length === 0) {
      console.log(`[notification] No matches found for OOS ${oosFileId} -- skipping email`);
      return;
    }

    // Step 2: Get the org to look up the Clerk user ID
    const [org] = await db.select().from(organizations).where(eq(organizations.id, orgId)).limit(1);
    if (!org) {
      console.error(`[notification] Org ${orgId} not found`);
      return;
    }

    // Step 3: Get user email from Clerk
    const email = await getUserEmail(org.clerkOrgId);
    if (!email) {
      console.warn(`[notification] No email found for org ${orgId} (clerk user ${org.clerkOrgId}) -- skipping`);
      return;
    }

    // Step 4: Group matches and render email
    const matchGroups = groupByOrg(matches);
    const totalMatches = matches.length;
    const html = await renderEmailHtml(matchGroups, totalMatches);

    // Step 5: Send
    const subject = `${totalMatches} skill${totalMatches === 1 ? '' : 's'} on the OTP network match your operations`;
    const sent = await sendEmail({ to: email, subject, html });

    if (sent) {
      console.log(`[notification] Match email sent to ${email} for OOS ${oosFileId} (${totalMatches} matches)`);
    } else {
      console.warn(`[notification] Match email failed for OOS ${oosFileId}`);
    }
  } catch (err) {
    console.error(`[notification] Error in notifyNewPublisher for OOS ${oosFileId}:`, err);
  }
}
