// Shift seeded kpi_values for Sneeze It from Sunday-anchored to Monday-anchored
// timestamps so they EXACT-match the bucket boundaries getScoreboard uses
// (Monday 00:00 UTC). Affects rows with entered_by IN ('seed:l10', 'seed:l10-history').
//
// Each row's period_start and period_end shift back by 6 days.
//
// Usage: SNEEZE_ORG_ID=<uuid> railway run npx tsx scripts/realign-kpi-periods.ts

import pg from 'pg';

const url = process.env.DATABASE_URL!;
const orgId = process.env.SNEEZE_ORG_ID!;
const c = new pg.Client({ connectionString: url });

async function main() {
  await c.connect();

  // Pre-flight: count what we are about to touch
  const pre = await c.query(
    `SELECT v.entered_by, count(*)::int AS n
     FROM kpi_values v JOIN kpis k ON k.id=v.kpi_id
     WHERE k.organization_id=$1 AND v.entered_by IN ('seed:l10', 'seed:l10-history')
     GROUP BY v.entered_by`,
    [orgId]
  );
  console.log('Rows to shift -6 days:');
  for (const r of pre.rows) console.log(`  entered_by=${r.entered_by}: ${r.n}`);

  // Verify the target Monday timestamps will not collide with existing rows.
  // For each row, the new period_start = period_start - 6 days. If a row already
  // exists for the same (kpi_id, new period_start), the unique constraint will
  // throw. Detect collisions first.
  const collisions = await c.query(
    `SELECT k.title, v.period_start, v.entered_by
     FROM kpi_values v JOIN kpis k ON k.id=v.kpi_id
     WHERE k.organization_id=$1 AND v.entered_by IN ('seed:l10', 'seed:l10-history')
       AND EXISTS (
         SELECT 1 FROM kpi_values v2
         WHERE v2.kpi_id=v.kpi_id AND v2.period_start = v.period_start - INTERVAL '6 days'
       )
     LIMIT 20`,
    [orgId]
  );
  if (collisions.rows.length > 0) {
    console.log('\nCollisions detected (would violate unique index after shift):');
    for (const r of collisions.rows) console.log(`  ${r.title} @ ${r.period_start.toISOString()} (${r.entered_by})`);
    console.log('Aborting. Resolve collisions before re-running.');
    await c.end();
    return;
  }

  // Shift in a single UPDATE
  const upd = await c.query(
    `UPDATE kpi_values
     SET period_start = period_start - INTERVAL '6 days',
         period_end   = period_end   - INTERVAL '6 days'
     WHERE entered_by IN ('seed:l10', 'seed:l10-history')
       AND kpi_id IN (SELECT id FROM kpis WHERE organization_id=$1)`,
    [orgId]
  );
  console.log(`\nShifted ${upd.rowCount} rows back 6 days.`);

  // Verify a sample
  const sample = await c.query(
    `SELECT k.title, v.period_start
     FROM kpi_values v JOIN kpis k ON k.id=v.kpi_id
     WHERE k.organization_id=$1 AND v.entered_by IN ('seed:l10', 'seed:l10-history')
       AND k.title='Dirk -- Cold emails sent'
     ORDER BY v.period_start DESC LIMIT 3`,
    [orgId]
  );
  console.log('\nSample after shift (Dirk Cold emails -- latest 3):');
  for (const r of sample.rows) console.log('  ' + r.period_start.toISOString());

  await c.end();
}

main().catch(e => { console.error('Realign failed:', e.message); process.exit(1); });
