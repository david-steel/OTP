// Final fix: kill the redundant seed:l10 anchors (they duplicate the latest
// seed:l10-history value), then shift all seed:l10-history values +4 hours so
// they EXACTLY match the bucket lookup pg+Drizzle is using.
//
// Empirical: the 04:00-UTC stored Tally value at 2026-04-27 IS matching the
// "2026-04-27T00:00:00.000Z" bucket key. The 00:00-UTC stored values are NOT
// matching. Storing values at 04:00 UTC is the format that round-trips.

import pg from 'pg';

const url = process.env.DATABASE_URL!;
const orgId = process.env.SNEEZE_ORG_ID!;
const c = new pg.Client({ connectionString: url });

async function main() {
  await c.connect();

  // 1. Delete redundant seed:l10 anchors (one per KPI; the seed:l10-history
  // series already contains a value for the latest week).
  const del = await c.query(
    `DELETE FROM kpi_values WHERE entered_by='seed:l10'
       AND kpi_id IN (SELECT id FROM kpis WHERE organization_id=$1)`,
    [orgId]
  );
  console.log(`Deleted ${del.rowCount} seed:l10 anchor rows.`);

  // 2. Shift seed:l10-history +4 hours to match the offset that round-trips
  const shift = await c.query(
    `UPDATE kpi_values
       SET period_start = period_start + INTERVAL '4 hours',
           period_end   = period_end   + INTERVAL '4 hours'
     WHERE entered_by='seed:l10-history'
       AND kpi_id IN (SELECT id FROM kpis WHERE organization_id=$1)`,
    [orgId]
  );
  console.log(`Shifted ${shift.rowCount} seed:l10-history rows +4 hours.`);

  // Verify Dirk
  const r = await c.query(
    `SELECT v.period_start, v.value FROM kpi_values v JOIN kpis k ON k.id=v.kpi_id
     WHERE k.organization_id=$1 AND k.title='Dirk -- Cold emails sent'
     ORDER BY v.period_start DESC LIMIT 5`,
    [orgId]
  );
  console.log('\nDirk after fix (latest 5):');
  for (const row of r.rows) console.log('  ' + row.period_start.toISOString() + '  v=' + row.value);

  await c.end();
}
main().catch(e => { console.error(e.message); process.exit(1); });
