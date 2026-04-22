// Diagnostic: understand the data map between Clerk users, organizations,
// onboarding_sequence, api_keys, and oos_files so we can build the admin Users panel.

import { sql } from 'drizzle-orm';
import { createClerkClient } from '@clerk/backend';
import { db } from '../src/config/database.js';

async function main() {
  const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });
  const { data: users } = await clerk.users.getUserList({ limit: 50 });

  console.log(`Clerk users (${users.length}):`);
  for (const u of users) {
    const email = u.emailAddresses.find(e => e.id === u.primaryEmailAddressId)?.emailAddress || 'no-email';
    console.log(`  ${u.id} | ${email.padEnd(32)} | signUp=${new Date(u.createdAt).toISOString().slice(0, 19)} | lastSignIn=${u.lastSignInAt ? new Date(u.lastSignInAt).toISOString().slice(0, 19) : 'NEVER'}`);
  }

  console.log('\nOrganizations:');
  const orgs = await db.execute(sql`SELECT id, clerk_org_id, name, created_at FROM organizations ORDER BY created_at DESC LIMIT 20`);
  for (const row of orgs.rows as any[]) {
    console.log(`  ${row.id} | clerk_org_id=${row.clerk_org_id?.padEnd(40)} | ${row.name}`);
  }

  console.log('\nAPI keys with last-used:');
  const keys = await db.execute(sql`SELECT org_id, name, key_prefix, last_used_at, created_at FROM api_keys WHERE revoked_at IS NULL ORDER BY COALESCE(last_used_at, created_at) DESC LIMIT 20`);
  for (const row of keys.rows as any[]) {
    console.log(`  org=${row.org_id} | ${row.name.padEnd(20)} | ${row.key_prefix} | last_used=${row.last_used_at?.toISOString?.().slice(0, 19) || 'NEVER'}`);
  }

  console.log('\nPublished OOS counts per org:');
  const oos = await db.execute(sql`SELECT org_id, COUNT(*) as n FROM oos_files WHERE status='published' GROUP BY org_id ORDER BY n DESC`);
  for (const row of oos.rows as any[]) {
    console.log(`  org=${row.org_id} | published=${row.n}`);
  }

  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
