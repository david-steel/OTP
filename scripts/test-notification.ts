// Quick test: trigger notification for Sneeze It's latest OOS
// Run with: node --env-file=.env --import tsx scripts/test-notification.ts
import { notifyNewPublisher } from '../src/services/notification-engine.js';

const ORG_ID = '48aff0f9-f364-4308-84df-01613213865b';  // Sneeze It
const OOS_ID = 'f941a13d-6717-4bc0-a115-d7ee23b0d672';  // Version 1 (25 claims)

console.log('Testing notification for Sneeze It...');
console.log(`Org: ${ORG_ID}`);
console.log(`OOS: ${OOS_ID}`);

try {
  await notifyNewPublisher(ORG_ID, OOS_ID);
  console.log('Done! Check dsteel@sneeze.it for the email.');
} catch (err) {
  console.error('Failed:', err);
}

process.exit(0);
