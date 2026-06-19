import { bucketPeriods } from '../src/services/kpi-periods.js';
const now = new Date();
const from = new Date(now.getTime() - 13 * 7 * 86400000);
const buckets = bucketPeriods('weekly', from, now);
console.log('Bucket period_starts the scoreboard expects:');
for (const b of buckets) console.log('  ' + b.start.toISOString());
