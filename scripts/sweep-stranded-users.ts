/**
 * scripts/sweep-stranded-users.ts
 * Sweep every email-indexed table for the two flagged users.
 * Run: pnpm tsx --env-file=.env scripts/sweep-stranded-users.ts
 */
import { db } from '../src/config/database.js';
import { sql } from 'drizzle-orm';

const EMAILS = ['khantkhant2213579@gmail.com', '312440num@gmail.com'];

async function safeCount(label: string, q: any) {
  try {
    const r = await db.execute(q);
    return `${label}: ${(r.rows || []).length} row(s)`;
  } catch (e: any) {
    const msg = (e.message || '').split('\n')[0].slice(0, 80);
    return `${label}: skip (${msg})`;
  }
}

async function main() {
  for (const email of EMAILS) {
    console.log('\n=== ' + email + ' ===');
    console.log('  ' + await safeCount('onboarding_sequence', sql`SELECT 1 FROM onboarding_sequence WHERE LOWER(email) = LOWER(${email})`));
    console.log('  ' + await safeCount('org_invitations    ', sql`SELECT 1 FROM org_invitations WHERE LOWER(email) = LOWER(${email})`));
    console.log('  ' + await safeCount('org_members        ', sql`SELECT 1 FROM org_members WHERE LOWER(email) = LOWER(${email})`));
    console.log('  ' + await safeCount('coach_directory    ', sql`SELECT 1 FROM coach_directory WHERE LOWER(email) = LOWER(${email})`));
    console.log('  ' + await safeCount('coach_invitations  ', sql`SELECT 1 FROM coach_invitations WHERE LOWER(email) = LOWER(${email})`));
    console.log('  ' + await safeCount('workspace_members  ', sql`SELECT 1 FROM workspace_members WHERE LOWER(email) = LOWER(${email})`));
    console.log('  ' + await safeCount('user_feedback      ', sql`SELECT 1 FROM user_feedback WHERE LOWER(email) = LOWER(${email})`));
  }
}

main().then(() => process.exit(0)).catch((e) => { console.error('FAILED:', e); process.exit(1); });
