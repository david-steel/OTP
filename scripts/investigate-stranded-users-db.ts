/**
 * scripts/investigate-stranded-users-db.ts
 *
 * DB-only investigator (local Clerk secret was invalid). Pulls everything
 * the database knows about the two flagged users so David can decide
 * spam-vs-stranded-real-user without needing Clerk API access.
 *
 * Run: pnpm tsx --env-file=.env scripts/investigate-stranded-users-db.ts
 */
import { db } from '../src/config/database.js';
import { sql } from 'drizzle-orm';

const TARGET_EMAILS = [
  'khantkhant2213579@gmail.com',
  '312440num@gmail.com',
];

function ageStr(d: Date | string | null | undefined): string {
  if (!d) return 'unknown';
  const ms = Date.now() - new Date(d).getTime();
  const days = Math.floor(ms / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return '1 day ago';
  return `${days}d ago`;
}

function botSignalsFromEmail(email: string): string[] {
  const flags: string[] = [];
  const local = email.split('@')[0] || '';
  if (/^\d+/.test(local) && /\d{4,}/.test(local)) flags.push('local part starts with 4+ digits');
  if (local.length > 18 && !/\./.test(local)) flags.push('long undelimited local part');
  if (/([a-z])\1{3,}/i.test(local)) flags.push('repeated chars in local');
  // common gibberish pattern: word doubled (khantkhant)
  const half = Math.floor(local.length / 2);
  if (half >= 3 && local.slice(0, half) === local.slice(half, half * 2)) flags.push('local part is a doubled string');
  // pure digits or near-pure digits
  const digits = (local.match(/\d/g) || []).length;
  if (digits / local.length > 0.5) flags.push(`>50% of local part is digits (${digits}/${local.length})`);
  return flags;
}

async function main() {
  for (const email of TARGET_EMAILS) {
    console.log('\n' + '='.repeat(80));
    console.log(`TARGET: ${email}`);
    console.log('='.repeat(80));

    // onboarding_sequence has clerk_user_id + email -- this is our bridge
    // because Clerk's user.created webhook writes here.
    const seq = await db.execute(sql`
      SELECT clerk_user_id, email, signup_at, created_at,
             email_1_sent_at, email_2_sent_at, email_3_sent_at,
             unsubscribed_at
      FROM onboarding_sequence
      WHERE LOWER(email) = LOWER(${email})
      LIMIT 1
    `);

    const seqRow = (seq.rows || [])[0] as any;
    if (!seqRow) {
      console.log(`  onboarding_sequence: NO ROW (user might not exist in Clerk either)`);
      continue;
    }

    const clerkId: string = seqRow.clerk_user_id;
    console.log(`\n  ONBOARDING_SEQUENCE`);
    console.log(`    clerk_user_id:  ${clerkId}`);
    console.log(`    email:          ${seqRow.email}`);
    console.log(`    signup_at:      ${seqRow.signup_at}  (${ageStr(seqRow.signup_at)})`);
    console.log(`    email_1_sent:   ${seqRow.email_1_sent_at ? new Date(seqRow.email_1_sent_at).toISOString() + ' (' + ageStr(seqRow.email_1_sent_at) + ')' : 'never'}`);
    console.log(`    email_2_sent:   ${seqRow.email_2_sent_at ? new Date(seqRow.email_2_sent_at).toISOString() + ' (' + ageStr(seqRow.email_2_sent_at) + ')' : 'never'}`);
    console.log(`    email_3_sent:   ${seqRow.email_3_sent_at ? new Date(seqRow.email_3_sent_at).toISOString() + ' (' + ageStr(seqRow.email_3_sent_at) + ')' : 'never'}`);
    console.log(`    unsubscribed:   ${seqRow.unsubscribed_at ? 'YES at ' + new Date(seqRow.unsubscribed_at).toISOString() : 'no'}`);

    // conversion_log: did Google Ads conversion ever fire?
    const conv = await db.execute(sql`
      SELECT status, conversion_action_id, gclid, error_message, created_at
      FROM conversion_log
      WHERE clerk_user_id = ${clerkId}
      ORDER BY created_at DESC
      LIMIT 3
    `);
    console.log(`\n  CONVERSION_LOG`);
    if ((conv.rows || []).length === 0) {
      console.log(`    no rows (signup conversion never attempted)`);
    } else {
      for (const r of conv.rows as any[]) {
        console.log(`    - ${r.created_at}: ${r.status}  action=${r.conversion_action_id || 'none'}  gclid=${r.gclid ? 'yes' : 'no'}${r.error_message ? '  error=' + r.error_message : ''}`);
      }
    }

    // org_members: are they in any org?
    const mem = await db.execute(sql`
      SELECT m.id, m.org_id, m.role, m.status, o.name AS org_name
      FROM org_members m
      LEFT JOIN organizations o ON o.id = m.org_id
      WHERE m.clerk_user_id = ${clerkId}
    `);
    console.log(`\n  ORG_MEMBERS`);
    console.log(`    ${(mem.rows || []).length} row(s)`);
    for (const r of (mem.rows || []) as any[]) {
      console.log(`    - org=${r.org_name || r.org_id} role=${r.role} status=${r.status}`);
    }

    // organizations: did they create one (legacy founder path stores Clerk user_id as clerk_org_id)
    const orgs = await db.execute(sql`
      SELECT id, name, badge, created_at
      FROM organizations
      WHERE clerk_org_id = ${clerkId}
    `);
    console.log(`\n  ORGANIZATIONS (legacy clerk_org_id = user.id path)`);
    console.log(`    ${(orgs.rows || []).length} row(s)`);
    for (const r of (orgs.rows || []) as any[]) {
      console.log(`    - ${r.name} (id=${r.id}, badge=${r.badge || 'none'}, ${ageStr(r.created_at)})`);
    }

    // invitations: did anyone invite them?
    const inv = await db.execute(sql`
      SELECT i.id, i.org_id, o.name AS org_name, i.status, i.created_at
      FROM org_invitations i
      LEFT JOIN organizations o ON o.id = i.org_id
      WHERE LOWER(i.email) = LOWER(${email})
      ORDER BY i.created_at DESC
      LIMIT 5
    `);
    console.log(`\n  ORG_INVITATIONS (sent to this email)`);
    console.log(`    ${(inv.rows || []).length} row(s)`);
    for (const r of (inv.rows || []) as any[]) {
      console.log(`    - org=${r.org_name || r.org_id} status=${r.status} ${ageStr(r.created_at)}`);
    }

    // Bot signals from the email shape
    const botFlags = botSignalsFromEmail(email);
    console.log(`\n  BOT SIGNALS FROM EMAIL`);
    if (botFlags.length === 0) console.log(`    (none)`);
    else for (const f of botFlags) console.log(`    - ${f}`);

    // Verdict
    const noConversion = (conv.rows || []).length === 0;
    const noOrg = (mem.rows || []).length === 0 && (orgs.rows || []).length === 0;
    const noInvite = (inv.rows || []).length === 0;
    const hasGclid = (conv.rows || []).some((r: any) => r.gclid);
    const botLikely = botFlags.length >= 2 && noOrg && noInvite && !hasGclid;

    console.log(`\n  VERDICT`);
    console.log(`    no org:          ${noOrg ? 'YES' : 'NO'}`);
    console.log(`    no conversion:   ${noConversion ? 'YES' : 'NO'}`);
    console.log(`    no invite:       ${noInvite ? 'YES' : 'NO'}`);
    console.log(`    came via ad:     ${hasGclid ? 'YES (has gclid)' : 'no'}`);
    console.log(`    bot signals:     ${botFlags.length}`);
    console.log(`    -> ${botLikely ? '⚠️  BOT-LIKELY (safe to delete from Clerk)' : 'AMBIGUOUS (review manually)'}`);
  }
}

main().then(() => process.exit(0)).catch((err) => {
  console.error('FAILED:', err);
  process.exit(1);
});
