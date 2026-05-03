// Backfill 13 weeks of weekly historical KPI values for the Sneeze It org so
// the /dashboard/kpis scoreboard renders with trend, not a single data point.
// Each value is plausible: progresses toward (or away from) the goal across the
// 13 weeks, with small per-week variance. Marked source='manual', entered_by=
// 'seed:l10-history' so the seed data is identifiable later.
//
// Idempotent: skips a week if a value already exists for that KPI + period.
//
// Usage: SNEEZE_ORG_ID=<uuid> railway run npx tsx scripts/backfill-kpi-history.ts

import pg from 'pg';

const url = process.env.DATABASE_URL!;
const orgId = process.env.SNEEZE_ORG_ID!;
const c = new pg.Client({ connectionString: url });

// Per-KPI seed shape: where we started 13 weeks ago, plus a deterministic
// per-week noise factor. Latest week reflects the value already seeded.
function plan(latest: number, weeks: number, goal: number | null, direction: 'up' | 'flat' | 'down' = 'up'): number[] {
  // Build a series so latest = current real number, week 0 (oldest) = a worse-or-similar version.
  // For "up" direction: oldest is ~60% of latest, with bumpy progression.
  // For "down": oldest is ~140% (we are improving downward).
  // For "flat": oldest is ~85% with noise.
  const startMul = direction === 'up' ? 0.6 : direction === 'down' ? 1.4 : 0.85;
  const start = Math.max(1, latest * startMul);
  const values: number[] = [];
  for (let i = 0; i < weeks; i++) {
    const t = i / (weeks - 1); // 0 .. 1
    const trend = start + (latest - start) * t;
    // Deterministic pseudo-noise: +/- 12 percent of the trend value, modulated by week index
    const noise = (Math.sin(i * 1.7) + Math.cos(i * 2.3)) * 0.12;
    const v = Math.max(0, trend * (1 + noise));
    values.push(Number.isInteger(latest) ? Math.round(v) : Math.round(v * 100) / 100);
  }
  return values;
}

async function main() {
  await c.connect();

  // Pull every KPI for Sneeze It with its latest seeded value (the row we put in
  // earlier this session) so we can use it as the anchor point for "this week."
  const kpis = (await c.query(
    `SELECT k.id, k.title, k.goal_value, k.goal_operator, k.unit, k.aggregation_method,
            (SELECT v.value FROM kpi_values v WHERE v.kpi_id=k.id ORDER BY v.period_start DESC LIMIT 1) AS latest
     FROM kpis k
     WHERE k.organization_id=$1 AND k.deleted_at IS NULL
     ORDER BY k.title`,
    [orgId]
  )).rows;

  console.log(`Backfilling 13 weeks of history for ${kpis.length} KPIs.`);

  // Build the 13 weekly periods (Sunday-anchored) ending with this week.
  const now = new Date();
  const thisSunday = new Date(now);
  thisSunday.setUTCHours(0, 0, 0, 0);
  thisSunday.setUTCDate(thisSunday.getUTCDate() - thisSunday.getUTCDay());

  const periods: { start: Date; end: Date }[] = [];
  for (let i = 12; i >= 0; i--) {
    const start = new Date(thisSunday);
    start.setUTCDate(start.getUTCDate() - 7 * i);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 6);
    end.setUTCHours(23, 59, 59, 999);
    periods.push({ start, end });
  }

  let totalInserted = 0;
  let totalSkipped = 0;

  for (const k of kpis) {
    if (k.latest == null) {
      console.log(`  SKIP ${k.title}: no latest anchor value`);
      continue;
    }
    const direction: 'up' | 'flat' | 'down' = k.goal_operator === 'lte' || k.goal_operator === 'lt' ? 'down' : 'up';
    const series = plan(Number(k.latest), 13, k.goal_value != null ? Number(k.goal_value) : null, direction);

    let inserted = 0;
    let skipped = 0;
    for (let i = 0; i < periods.length; i++) {
      const { start, end } = periods[i];
      // Idempotency check
      const existing = await c.query(
        `SELECT id FROM kpi_values WHERE kpi_id=$1 AND period_start=$2 LIMIT 1`,
        [k.id, start]
      );
      if (existing.rowCount && existing.rowCount > 0) { skipped++; continue; }
      await c.query(
        `INSERT INTO kpi_values (kpi_id, period_start, period_end, value, source, entered_by, notes)
         VALUES ($1, $2, $3, $4, 'manual', 'seed:l10-history', 'Backfilled for /dashboard/kpis trend display')`,
        [k.id, start, end, series[i]]
      );
      inserted++;
    }
    totalInserted += inserted;
    totalSkipped += skipped;
    console.log(`  ${k.title.padEnd(48)}: +${inserted}  (skipped ${skipped})  series=[${series.slice(0, 3).join(', ')}, ..., ${series[series.length - 1]}]`);
  }

  console.log(`\nDone. ${totalInserted} values inserted, ${totalSkipped} skipped.`);
  await c.end();
}

main().catch(e => { console.error('Backfill failed:', e.message); process.exit(1); });
