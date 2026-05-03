import { db } from '../src/config/database.js';
import { onboardingSequence } from '../src/db/schema.js';

async function main() {
  const rows = await db.select().from(onboardingSequence);
  console.log(`onboarding_sequence has ${rows.length} rows:`);
  for (const r of rows) {
    console.log(`  ${r.email.padEnd(32)} | signup=${r.signupAt.toISOString().slice(0, 19)} | email_1_sent=${r.email1SentAt?.toISOString().slice(0, 19) || 'NULL'} | email_2_sent=${r.email2SentAt?.toISOString().slice(0, 19) || 'NULL'} | email_3_sent=${r.email3SentAt?.toISOString().slice(0, 19) || 'NULL'}`);
  }
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
