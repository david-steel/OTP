/**
 * Announce the OTP pivot to all real Clerk users.
 *
 * Usage:
 *   railway run -- npx tsx scripts/announce-pivot.ts --dry-run
 *   railway run -- npx tsx scripts/announce-pivot.ts
 *
 * Pulls users from Clerk Backend API. Sends via existing sendEmail (Resend).
 * From: David Steel <notifications@mail.orgtp.com>. No em dashes.
 */

import { createClerkClient } from '@clerk/backend';
import { sendEmail } from '../src/config/email.js';

const DRY_RUN = process.argv.includes('--dry-run');

const SUBJECT = 'OTP just got bigger: humans, agents, and the SOPs they share';
const FROM = 'David Steel <notifications@mail.orgtp.com>';

function htmlBody(firstName: string | null) {
  const greeting = firstName ? `Hey ${firstName},` : 'Hey,';
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0; padding:0; background:#f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#1f2937;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f8fafc; padding: 32px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background:#ffffff; border-radius:12px; border:1px solid #e5e7eb;">
        <tr><td style="padding: 28px 32px 8px 32px;">
          <div style="font-size:13px; color:#6b7280; margin-bottom: 4px;">OTP product update</div>
          <h1 style="font-size:24px; line-height:1.3; font-weight:800; margin: 4px 0 12px 0; color:#0f172a;">OTP just became the Organization Operating System</h1>
        </td></tr>
        <tr><td style="padding: 0 32px 24px 32px; font-size:15px; line-height:1.65; color:#1f2937;">
          <p style="margin: 0 0 14px 0;">${greeting}</p>
          <p style="margin: 0 0 14px 0;">Quick update from OTP. Today is the pivot.</p>
          <p style="margin: 0 0 14px 0;">OTP started as the coordination protocol for AI agents. Today it became the Organization Operating System: humans, AI agents, and the SOPs they share, all on one chart.</p>

          <p style="margin: 18px 0 6px 0; font-weight: 700; color:#0f172a;">What is new</p>
          <ul style="margin: 0 0 14px 18px; padding: 0;">
            <li style="margin-bottom: 8px;"><strong>Visual team chart</strong> at <a href="https://orgtp.com/dashboard/team" style="color:#0369a1;">orgtp.com/dashboard/team</a> -- humans, AI agents, and the org wired by reporting and escalation lines.</li>
            <li style="margin-bottom: 8px;"><strong>SOPs you author once.</strong> Title, trigger, steps, outputs. Five Founder/CEO templates seeded in the editor (daily inbox triage, weekly L10, monthly stakeholder update, founder-led discovery call, quarterly Rocks-setting).</li>
            <li style="margin-bottom: 8px;"><strong>AI agents inherit SOPs from the human they escalate to.</strong> One-click "Copy as CLAUDE.md" compiles own + inherited SOPs into a runtime context file. Drop it into your system prompt and the agent runs on the org's latest accountability state.</li>
            <li style="margin-bottom: 8px;"><strong>Invite your team.</strong> Click any human tile, or the "+ Invite new member" button in the chart header. They claim the tile on signup, become a member, edit their own tile and the AI agents under them.</li>
            <li style="margin-bottom: 8px;"><strong>Drag-and-drop hierarchy.</strong> Drag any tile onto another to reset who reports to whom.</li>
            <li style="margin-bottom: 0;"><strong>Skills taxonomy</strong> with autocomplete, custom-skill add, and a curated catalog across nine categories.</li>
          </ul>

          <p style="margin: 0 0 14px 0;">The full pivot post: <a href="https://orgtp.com/blog/otp-was-never-only-for-agents" style="color:#0369a1;">orgtp.com/blog/otp-was-never-only-for-agents</a></p>
          <p style="margin: 0 0 14px 0;">The complete changelog: <a href="https://orgtp.com/whats-new" style="color:#0369a1;">orgtp.com/whats-new</a></p>

          <p style="margin: 0 0 14px 0;">If your OOS does not yet have <code style="background:#f3f4f6; padding:1px 4px; border-radius:4px; font-size:13px;">entities.agents</code> or <code style="background:#f3f4f6; padding:1px 4px; border-radius:4px; font-size:13px;">entities.humans</code> populated, the chart will look empty. Reply to this email and I will help you migrate.</p>

          <p style="margin: 24px 0 4px 0;">David<br><span style="color:#6b7280; font-size:13px;">Founder, OTP</span></p>
        </td></tr>
        <tr><td style="padding: 16px 32px 24px 32px; border-top: 1px solid #f3f4f6; text-align: center;">
          <a href="https://orgtp.com/dashboard/team" style="display:inline-block; padding: 12px 20px; background:#0ea5e9; color:#ffffff; text-decoration:none; border-radius:8px; font-weight:600; font-size:15px;">Open the team chart</a>
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
  const list = Array.isArray((users as any).data) ? (users as any).data : (users as any);
  return list.map((u: any) => {
    const primaryEmail = u.emailAddresses?.find((e: any) => e.id === u.primaryEmailAddressId)?.emailAddress
      || u.emailAddresses?.[0]?.emailAddress
      || null;
    return { id: u.id, email: primaryEmail, firstName: u.firstName || null };
  }).filter((u: any) => !!u.email);
}

async function main() {
  console.log('Mode:', DRY_RUN ? 'DRY-RUN (no send)' : 'LIVE SEND');
  console.log('Subject:', SUBJECT);
  console.log('From:', FROM);
  console.log('');

  const users = await listUsers();
  console.log(`Recipients (${users.length}):`);
  for (const u of users) console.log(`  ${u.email}  (${u.firstName || '(no first name)'}, ${u.id})`);
  console.log('');

  if (DRY_RUN) { console.log('DRY-RUN done.'); process.exit(0); }

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
