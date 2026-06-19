// Print every kpi_value's period_start.toISOString() for Dirk Cold emails,
// alongside every bucket.start.toISOString(), so we can see exactly which
// strings the matcher compares.

import pg from 'pg';
import { bucketPeriods } from '../src/services/kpi-periods.js';

async function main() {
  const c = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  const orgId = process.env.SNEEZE_ORG_ID!;

  const r = await c.query(
    `SELECT v.period_start, v.value FROM kpi_values v JOIN kpis k ON k.id=v.kpi_id
     WHERE k.organization_id=$1 AND k.title='Dirk -- Cold emails sent'
     ORDER BY v.period_start`,
    [orgId]
  );
  console.log('Dirk values .toISOString() (raw from pg):');
  for (const row of r.rows) console.log('  ' + row.period_start.toISOString() + '  v=' + row.value);

  const now = new Date();
  const from = new Date(now.getTime() - 13 * 7 * 86400000);
  const buckets = bucketPeriods('weekly', from, now);
  console.log('\nBuckets .start.toISOString():');
  for (const b of buckets) console.log('  ' + b.start.toISOString());

  // Try matching like getScoreboard does
  const m = new Map<string, number>();
  for (const row of r.rows) m.set(row.period_start.toISOString(), Number(row.value));

  console.log('\nPer-bucket match attempt:');
  for (const b of buckets) {
    const key = b.start.toISOString();
    console.log('  ' + key + ' -> ' + (m.has(key) ? `MATCH v=${m.get(key)}` : 'no match'));
  }

  await c.end();
}
main().catch(e => { console.error(e.message); process.exit(1); });
