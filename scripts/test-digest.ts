// Test weekly digest email
// Run with: node --env-file=.env --import tsx scripts/test-digest.ts
import { sendWeeklyDigest } from '../src/services/weekly-digest.js';

console.log('Testing weekly digest...');

try {
  const result = await sendWeeklyDigest();
  console.log('Result:', JSON.stringify(result, null, 2));

  if (result.noActivity) {
    console.log('No activity this week -- no emails sent.');
  } else {
    console.log(`Sent: ${result.sent}, Skipped: ${result.skipped}`);
  }
} catch (err) {
  console.error('Failed:', err);
}

process.exit(0);
