/**
 * scripts/investigate-stranded-users.ts
 *
 * Pulls full Clerk + DB footprint for users David flagged as suspicious /
 * stuck (no org_members row, so admin impersonator throws NO_MEMBER_ROW).
 *
 * Run: pnpm tsx --env-file=.env scripts/investigate-stranded-users.ts
 *
 * For each email it reports:
 *   - Clerk: id, created_at, last_sign_in_at, primary email verified,
 *     public/private metadata, has gclid (came from an ad?)
 *   - DB: any onboarding_sequence row, any conversion_log row, any
 *     org_invitations targeting them
 *   - Verdict heuristic: bot-like vs stranded-real-user signals
 *
 * Writes nothing. Read-only investigator.
 */
import { db } from '../src/config/database.js';
import { sql } from 'drizzle-orm';
import { createClerkClient } from '@clerk/backend';

const TARGET_EMAILS = [
  'khantkhant2213579@gmail.com',
  '312440num@gmail.com',
];

function ageDays(iso: string | null | undefined): string {
  if (!iso) return 'never';
  const ms = Date.now() - new Date(iso).getTime();
  const d = Math.floor(ms / (1000 * 60 * 60 * 24));
  if (d === 0) return 'today';
  if (d === 1) return '1 day ago';
  return `${d} days ago`;
}

function botSignals(u: any): string[] {
  const flags: string[] = [];
  const email = u.emailAddresses?.[0]?.emailAddress || '';
  // Local part is mostly digits or random alphanumeric
  const localPart = email.split('@')[0] || '';
  if (/^\d+/.test(localPart) && /\d{4,}/.test(localPart)) flags.push('email starts with digits');
  if (localPart.length > 18 && !/\./.test(localPart)) flags.push('long undelimited local part');
  if (/([a-z])\1{3,}/i.test(localPart)) flags.push('repeated chars in local part');
  // Never signed in after signup (created and abandoned)
  if (u.createdAt && u.lastSignInAt && u.createdAt === u.lastSignInAt) flags.push('never signed in again after signup');
  if (u.createdAt && !u.lastSignInAt) flags.push('never signed in after signup');
  // No first/last name (Clerk's signup form has them as optional, but real humans usually fill them)
  if (!u.firstName && !u.lastName) flags.push('no first/last name provided');
  return flags;
}

async function main() {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    console.error('CLERK_SECRET_KEY missing');
    process.exit(1);
  }
  const clerk = createClerkClient({ secretKey });

  for (const email of TARGET_EMAILS) {
    console.log('\n' + '='.repeat(80));
    console.log(`TARGET: ${email}`);
    console.log('='.repeat(80));

    // Clerk lookup
    let user: any = null;
    try {
      const { data } = await clerk.users.getUserList({ emailAddress: [email], limit: 1 });
      user = data[0];
    } catch (err) {
      console.error('[clerk] getUserList failed:', err);
      continue;
    }

    if (!user) {
      console.log('  Clerk: NO USER FOUND with this email');
      continue;
    }

    const createdAt = user.createdAt ? new Date(user.createdAt).toISOString() : 'unknown';
    const lastSignIn = user.lastSignInAt ? new Date(user.lastSignInAt).toISOString() : 'never';
    const primary = user.emailAddresses?.find((e: any) => e.id === user.primaryEmailAddressId);
    const verified = primary?.verification?.status === 'verified';

    console.log(`\n  CLERK`);
    console.log(`    user_id:        ${user.id}`);
    console.log(`    created_at:     ${createdAt} (${ageDays(String(user.createdAt))})`);
    console.log(`    last_sign_in:   ${lastSignIn} (${ageDays(String(user.lastSignInAt))})`);
    console.log(`    name:           ${user.firstName || '(none)'} ${user.lastName || ''}`.trim());
    console.log(`    email_verified: ${verified}`);
    console.log(`    public_meta:    ${JSON.stringify(user.publicMetadata || {})}`);
    console.log(`    has_gclid:      ${user.publicMetadata?.gclid ? 'YES (from Google Ad)' : 'no'}`);

    // DB lookups
    console.log(`\n  DATABASE`);

    const onb = await db.execute(sql`
      SELECT email, created_at, step
      FROM onboarding_sequence
      WHERE clerk_user_id = ${user.id}
      LIMIT 1
    `);
    if ((onb.rows || []).length > 0) {
      const row = onb.rows[0] as any;
      console.log(`    onboarding_sequence: yes (step=${row.step}, created ${row.created_at})`);
    } else {
      console.log(`    onboarding_sequence: no row`);
    }

    const conv = await db.execute(sql`
      SELECT status, conversion_action_id, gclid, created_at
      FROM conversion_log
      WHERE clerk_user_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT 3
    `);
    if ((conv.rows || []).length > 0) {
      console.log(`    conversion_log:`);
      for (const r of conv.rows as any[]) {
        console.log(`       - ${r.created_at}: status=${r.status} action=${r.conversion_action_id || 'none'} gclid=${r.gclid ? 'yes' : 'no'}`);
      }
    } else {
      console.log(`    conversion_log:      no rows (signup conversion never fired)`);
    }

    const mem = await db.execute(sql`
      SELECT id, org_id, role, status
      FROM org_members
      WHERE clerk_user_id = ${user.id}
    `);
    console.log(`    org_members:         ${(mem.rows || []).length} row(s)`);

    const inv = await db.execute(sql`
      SELECT id, org_id, status, created_at
      FROM org_invitations
      WHERE LOWER(email) = LOWER(${email})
      ORDER BY created_at DESC
      LIMIT 5
    `);
    console.log(`    org_invitations:     ${(inv.rows || []).length} row(s) targeting this email`);

    // Bot signals
    const flags = botSignals(user);
    console.log(`\n  BOT SIGNALS (${flags.length})`);
    if (flags.length === 0) {
      console.log(`    (none -- looks like a real-but-stranded user)`);
    } else {
      for (const f of flags) console.log(`    - ${f}`);
    }

    // Verdict heuristic
    const isBotLikely = flags.length >= 2 && !user.publicMetadata?.gclid && (mem.rows || []).length === 0;
    console.log(`\n  VERDICT: ${isBotLikely ? 'BOT-LIKELY (safe to delete)' : 'AMBIGUOUS (verify manually)'}`);
  }
}

main().then(() => process.exit(0)).catch((err) => {
  console.error('FAILED:', err);
  process.exit(1);
});
