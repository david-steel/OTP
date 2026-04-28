// scripts/resend-audience-setup.ts
// One-time setup: creates the Resend Audience for OTP pre-signup contacts.
// Prints the audience ID -- copy it into your env as OTP_RESEND_AUDIENCE_ID.
//
// Usage:
//   RESEND_API_KEY=re_xxx npx tsx scripts/resend-audience-setup.ts
//   railway run --service otp-platform npx tsx scripts/resend-audience-setup.ts
//
// Idempotent: if an audience with the chosen name already exists, returns the existing ID.

import { Resend } from 'resend';

const AUDIENCE_NAME = process.env.OTP_RESEND_AUDIENCE_NAME || 'OTP Pre-Signup Interest';

async function run() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY not set');
    process.exit(1);
  }

  const client = new Resend(apiKey);

  // List first; only create if not present.
  const existing = await client.audiences.list();
  if (existing.error) {
    console.error('Failed to list audiences:', existing.error);
    process.exit(1);
  }

  const match = existing.data?.data?.find(a => a.name === AUDIENCE_NAME);
  if (match) {
    console.log(`Audience already exists: "${AUDIENCE_NAME}"`);
    console.log(`  id: ${match.id}`);
    console.log('');
    console.log('Add to your env:');
    console.log(`  OTP_RESEND_AUDIENCE_ID=${match.id}`);
    return;
  }

  const created = await client.audiences.create({ name: AUDIENCE_NAME });
  if (created.error || !created.data) {
    console.error('Failed to create audience:', created.error);
    process.exit(1);
  }

  console.log(`Created audience: "${AUDIENCE_NAME}"`);
  console.log(`  id: ${created.data.id}`);
  console.log('');
  console.log('Add to your env:');
  console.log(`  OTP_RESEND_AUDIENCE_ID=${created.data.id}`);
}

run().catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});
