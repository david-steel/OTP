// Run getScoreboard's WHERE clause manually to see how many values come back.
// If standalone test shows 13 matches but getScoreboard shows 1, the SQL is
// filtering them out.

import pg from 'pg';
import { bucketPeriods } from '../src/services/kpi-periods.js';

async function main() {
  const c = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  const orgId = process.env.SNEEZE_ORG_ID!;

  const dirkKpi = await c.query(`SELECT id FROM kpis WHERE organization_id=$1 AND title='Dirk -- Cold emails sent' LIMIT 1`, [orgId]);
  const kpiId = dirkKpi.rows[0].id;

  const now = new Date();
  const from = new Date(now.getTime() - 13 * 7 * 86400000);
  const buckets = bucketPeriods('weekly', from, now);
  const fromBucket = buckets[0].start;
  const toBucket = buckets[buckets.length - 1].start;

  console.log(`Filter: kpi_id=${kpiId}, period_start gte ${fromBucket.toISOString()} AND lte ${toBucket.toISOString()}`);
  console.log(`fromBucket as Date: ${fromBucket}`);
  console.log(`toBucket as Date: ${toBucket}`);

  const r = await c.query(
    `SELECT period_start, value FROM kpi_values WHERE kpi_id=$1 AND period_start >= $2 AND period_start <= $3 ORDER BY period_start`,
    [kpiId, fromBucket, toBucket]
  );
  console.log(`Rows returned: ${r.rowCount}`);
  for (const row of r.rows) console.log('  ' + row.period_start.toISOString() + '  v=' + row.value);
  await c.end();
}
main().catch(e => { console.error(e.message); process.exit(1); });
