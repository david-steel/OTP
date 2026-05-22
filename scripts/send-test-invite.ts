/**
 * scripts/send-test-invite.ts
 *
 * One-shot: fires a REAL team invitation email through the live
 * issueInvite + sendEmail pipeline. Used 2026-05-21 to look at the
 * invite email design and walk through the /accept-invite pending
 * state with a real token.
 *
 * Run: pnpm tsx scripts/send-test-invite.ts
 * Env required: DATABASE_URL, RESEND_API_KEY, CLERK_SECRET_KEY (in .env)
 *
 * Writes:
 *   - One row to org_invitations (real, status='pending', expires in 7d)
 *   - Sends one email via Resend to TARGET_EMAIL
 *
 * Targets the first org owner found whose org name matches OWNER_ORG_PATTERN.
 * If none found, aborts loudly.
 */
// Env loaded via `tsx --env-file=.env`. No dotenv import needed.
import { db } from '../src/config/database.js';
import { sql } from 'drizzle-orm';
import { issueInvite } from '../src/services/membership.js';
import { sendEmail } from '../src/config/email.js';

const TARGET_EMAIL = 'dsteel+invite-test-2026-05-21@sneeze.it';
const BASE_URL = 'https://orgtp.com';
const OWNER_ORG_PATTERN = '%sneeze%'; // ILIKE pattern, case-insensitive

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as Record<string, string>
  )[c]);
}

function inviteEmailHtml(opts: { orgName: string; inviterName: string; acceptUrl: string; expiresAt: Date }): string {
  const expires = opts.expiresAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#14161c;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f8fafc;padding:32px 0;">
    <tr><td align="center">
      <table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" style="background:#ffffff;border-radius:14px;border:1px solid #e5e7eb;">
        <tr><td style="padding:30px 34px 6px 34px;">
          <div style="font-size:13px;color:#6b7280;margin-bottom:6px;">${escapeHtml(opts.inviterName)} invited you</div>
          <h1 style="font-size:23px;line-height:1.3;font-weight:800;margin:2px 0 16px 0;color:#0f172a;">Join ${escapeHtml(opts.orgName)} on OTP</h1>
        </td></tr>
        <tr><td style="padding:0 34px 26px 34px;font-size:15px;line-height:1.65;color:#14161c;">
          <p style="margin:0 0 14px 0;">${escapeHtml(opts.inviterName)} is setting up ${escapeHtml(opts.orgName)} on OTP, one shared chart with every person and AI agent on it, one scoreboard, one weekly meeting. They saved a seat for you.</p>
          <p style="margin:0 0 14px 0;">Accept to claim your seat. You will set up your own profile and can be on it in about a minute.</p>
          <p style="margin:24px 0;">
            <a href="${opts.acceptUrl}" style="display:inline-block;padding:13px 22px;background:#0a9d63;color:#ffffff;text-decoration:none;border-radius:9px;font-weight:700;font-size:15px;">Accept your invitation</a>
          </p>
          <p style="margin:0;font-size:12px;color:#9ca3af;">This link expires ${expires}. If you were not expecting this, you can ignore this email.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

async function main() {
  console.log(`[send-test-invite] Looking for an org owner where org name ILIKE ${OWNER_ORG_PATTERN}...`);

  // Find org + an owner of it
  const rows = await db.execute(sql`
    SELECT
      o.id AS org_id,
      o.name AS org_name,
      o.clerk_org_id,
      m.clerk_user_id AS owner_user_id,
      m.display_name AS owner_name
    FROM organizations o
    JOIN org_members m ON m.org_id = o.id
    WHERE o.name ILIKE ${OWNER_ORG_PATTERN}
      AND m.role = 'owner'
      AND m.status = 'active'
    ORDER BY o.created_at DESC
    LIMIT 5
  `);

  if (!rows.rows || rows.rows.length === 0) {
    console.error(`[send-test-invite] No owner found in any org matching '${OWNER_ORG_PATTERN}'. Aborting.`);
    process.exit(1);
  }

  console.log(`[send-test-invite] Found ${rows.rows.length} candidate orgs:`);
  for (const r of rows.rows as any[]) {
    console.log(`  - ${r.org_name} (${r.org_id}) -- owner=${r.owner_name || 'unnamed'} (${r.owner_user_id})`);
  }

  const target = rows.rows[0] as any;
  console.log(`\n[send-test-invite] Using: ${target.org_name}`);
  console.log(`[send-test-invite] Inviter: ${target.owner_name || target.owner_user_id}`);
  console.log(`[send-test-invite] Inviting: ${TARGET_EMAIL}`);

  const issued = await issueInvite({
    orgId: target.org_id,
    ownerUserId: target.owner_user_id,
    email: TARGET_EMAIL,
    displayName: 'Invite Email Test',
    role: 'managee',
  }, BASE_URL);

  console.log(`\n[send-test-invite] Invite issued:`);
  console.log(`  invitationId: ${issued.invitationId}`);
  console.log(`  expires:      ${issued.expiresAt.toISOString()}`);
  console.log(`  acceptUrl:    ${issued.acceptUrl}`);

  const html = inviteEmailHtml({
    orgName: target.org_name,
    inviterName: target.owner_name || target.org_name,
    acceptUrl: issued.acceptUrl,
    expiresAt: issued.expiresAt,
  });

  const sent = await sendEmail({
    to: TARGET_EMAIL,
    subject: `${target.org_name} invited you to OTP`,
    html,
    from: 'OTP Invitations <notifications@mail.orgtp.com>',
  });

  if (sent) {
    console.log(`\n[send-test-invite] Resend accepted the message. Resend message id: ${sent}`);
    console.log(`[send-test-invite] Check inbox: ${TARGET_EMAIL}`);
  } else {
    console.error(`\n[send-test-invite] Resend send returned null -- check RESEND_API_KEY and Resend domain status.`);
    process.exit(1);
  }
}

main().then(() => process.exit(0)).catch((err) => {
  console.error('[send-test-invite] FAILED:', err);
  process.exit(1);
});
