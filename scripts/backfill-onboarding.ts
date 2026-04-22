// scripts/backfill-onboarding.ts
// One-shot backfill: for every existing Clerk user not yet in onboarding_sequence,
// insert a row, send email #1, and mark email_1_sent_at. Safe to rerun.
//
// Usage: npx tsx scripts/backfill-onboarding.ts
//
// Requires env: CLERK_SECRET_KEY, RESEND_API_KEY, DATABASE_URL

import { createClerkClient } from '@clerk/backend';
import { eq } from 'drizzle-orm';
import { db } from '../src/config/database.js';
import { onboardingSequence } from '../src/db/schema.js';
import { sendOnboardingEmail1 } from '../src/routes/api/clerk-webhook.js';

async function run() {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    console.error('CLERK_SECRET_KEY not set');
    process.exit(1);
  }

  const clerk = createClerkClient({ secretKey });
  const { data: users } = await clerk.users.getUserList({ limit: 500 });
  console.log(`Found ${users.length} Clerk users`);

  let inserted = 0;
  let sent = 0;
  let skipped = 0;

  for (const user of users) {
    const primary = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId);
    const email = primary?.emailAddress || user.emailAddresses[0]?.emailAddress;
    if (!email) {
      console.warn(`User ${user.id} has no email, skipping`);
      continue;
    }

    const [existing] = await db
      .select()
      .from(onboardingSequence)
      .where(eq(onboardingSequence.clerkUserId, user.id))
      .limit(1);

    if (existing) {
      if (existing.email1SentAt) {
        console.log(`SKIP ${email} (already received email #1 at ${existing.email1SentAt.toISOString()})`);
        skipped++;
        continue;
      }
      const ok = await sendOnboardingEmail1(email);
      if (ok) {
        await db
          .update(onboardingSequence)
          .set({ email1SentAt: new Date() })
          .where(eq(onboardingSequence.id, existing.id));
        sent++;
        console.log(`RESENT #1 to ${email}`);
      }
      continue;
    }

    await db.insert(onboardingSequence).values({
      clerkUserId: user.id,
      email: email.toLowerCase(),
      signupAt: new Date(user.createdAt),
    });
    inserted++;

    const ok = await sendOnboardingEmail1(email);
    if (ok) {
      await db
        .update(onboardingSequence)
        .set({ email1SentAt: new Date() })
        .where(eq(onboardingSequence.clerkUserId, user.id));
      sent++;
      console.log(`NEW ${email} -- inserted + sent #1`);
    } else {
      console.error(`NEW ${email} -- inserted but send #1 failed`);
    }
  }

  console.log('\n--- Backfill complete ---');
  console.log(`Inserted: ${inserted}`);
  console.log(`Email #1 sent: ${sent}`);
  console.log(`Skipped (already received): ${skipped}`);
  process.exit(0);
}

run().catch(err => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
