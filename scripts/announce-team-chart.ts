/**
 * Announce the new Team Chart feature to all real Clerk users.
 *
 * Usage:
 *   railway run -- npx tsx scripts/announce-team-chart.ts --dry-run    # list recipients only
 *   railway run -- npx tsx scripts/announce-team-chart.ts              # send for real
 *
 * Pulls users from Clerk Backend API. Sends via existing sendEmail (Resend).
 * From: David Steel <notifications@mail.orgtp.com>. No em dashes per voice rules.
 */

import { createClerkClient } from '@clerk/backend';
import { sendEmail } from '../src/config/email.js';

const DRY_RUN = process.argv.includes('--dry-run');

const SUBJECT = 'New on OTP: visual team chart with drag-and-drop editing';
const FROM = 'David Steel <notifications@mail.orgtp.com>';

function htmlBody(firstName: string | null) {
  const greeting = firstName ? `Hey ${firstName},` : 'Hey,';
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0; padding:0; background:#f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#1f2937;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f8fafc; padding: 32px 0;">
    <tr><td align="center">
      <table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" style="background:#ffffff; border-radius:12px; border:1px solid #e5e7eb;">
        <tr><td style="padding: 28px 32px 8px 32px;">
          <div style="font-size:14px; color:#6b7280; margin-bottom: 4px;">OTP product update</div>
          <h1 style="font-size:22px; line-height:1.3; font-weight:800; margin: 4px 0 16px 0; color:#0f172a;">Visual team chart, drag-and-drop hierarchy</h1>
        </td></tr>
        <tr><td style="padding: 0 32px 24px 32px; font-size:15px; line-height:1.65; color:#1f2937;">
          <p style="margin: 0 0 14px 0;">${greeting}</p>
          <p style="margin: 0 0 14px 0;">Quick update. The dashboard now has a visual org chart of your agents and humans.</p>
          <p style="margin: 0 0 14px 0;">After signing in, open <a href="https://orgtp.com/dashboard/team" style="color:#0369a1; text-decoration: underline;">orgtp.com/dashboard/team</a>. Your published OOS renders as a top-down hierarchy with rounded boxes for every agent and human, and lines for escalation and reporting.</p>
          <p style="margin: 0 0 14px 0;">Click any box to edit name, role, mission or job description, authority level, skills, and who they report to. Drag any box onto another to restructure. Edits save to a draft until you republish, so your published OOS stays untouched until you say so.</p>
          <p style="margin: 0 0 14px 0;">If your OOS does not have <code style="background:#f3f4f6; padding:1px 4px; border-radius:4px; font-size:13px;">entities.agents</code> or <code style="background:#f3f4f6; padding:1px 4px; border-radius:4px; font-size:13px;">entities.humans</code> populated yet, the chart will look empty. Reply to this email and I will help you migrate.</p>
          <p style="margin: 0 0 14px 0;">Next on the list: skills taxonomy, mobile polish, add and delete nodes.</p>
          <p style="margin: 24px 0 4px 0;">David<br><span style="color:#6b7280; font-size:13px;">Founder, OTP</span></p>
        </td></tr>
        <tr><td style="padding: 16px 32px 24px 32px; border-top: 1px solid #f3f4f6;">
          <a href="https://orgtp.com/whats-new" style="display:inline-block; padding: 10px 16px; background:#0ea5e9; color:#ffffff; text-decoration:none; border-radius:8px; font-weight:600; font-size:14px;">See full changelog</a>
        </td></tr>
      </table>
      <div style="margin-top: 16px; font-size: 11px; color:#9ca3af; text-align:center;">
        Sent because you have an OTP account. Reply to opt out and I will remove you.
      </div>
    </td></tr>
  </table>
</body></html>`;
}

async function listUsers() {
  const sk = process.env.CLERK_SECRET_KEY;
  if (!sk) throw new Error('CLERK_SECRET_KEY not set in env');
  const clerk = createClerkClient({ secretKey: sk });
  const users = await clerk.users.getUserList({ limit: 200 });
  // Clerk SDK returns { data, totalCount } in newer versions; tolerate both
  const list = Array.isArray((users as any).data) ? (users as any).data : (users as any);
  return list.map((u: any) => {
    const primaryEmail = u.emailAddresses?.find((e: any) => e.id === u.primaryEmailAddressId)?.emailAddress
      || u.emailAddresses?.[0]?.emailAddress
      || null;
    return {
      id: u.id,
      email: primaryEmail,
      firstName: u.firstName || null,
      createdAt: u.createdAt,
    };
  }).filter((u: any) => !!u.email);
}

async function main() {
  console.log('Mode:', DRY_RUN ? 'DRY-RUN (no send)' : 'LIVE SEND');
  console.log('Subject:', SUBJECT);
  console.log('From:', FROM);
  console.log('');

  const users = await listUsers();
  console.log(`Recipients (${users.length}):`);
  for (const u of users) {
    console.log(`  ${u.email}  (${u.firstName || '(no first name)'}, clerk_id=${u.id})`);
  }
  console.log('');

  if (DRY_RUN) {
    console.log('DRY-RUN done. Re-run without --dry-run to send.');
    process.exit(0);
  }

  let sent = 0, failed = 0;
  for (const u of users) {
    const ok = await sendEmail({
      to: u.email,
      subject: SUBJECT,
      html: htmlBody(u.firstName),
      from: FROM,
    });
    if (ok) { sent++; console.log(`  ✓ ${u.email}`); }
    else    { failed++; console.log(`  ✗ ${u.email}`); }
  }
  console.log(`\nDone. sent=${sent} failed=${failed}`);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
