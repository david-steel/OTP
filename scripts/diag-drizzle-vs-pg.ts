// Compare what raw pg.Client returns vs what Drizzle returns for the same kpi_values rows.
import pg from 'pg';
import { db } from '../src/config/database.js';
import { kpiValues, kpis } from '../src/db/schema.js';
import { eq, desc } from 'drizzle-orm';

async function main() {
  const orgId = process.env.SNEEZE_ORG_ID!;

  const c = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  const dirkRow = await c.query(`SELECT id FROM kpis WHERE organization_id=$1 AND title='Dirk -- Cold emails sent' LIMIT 1`, [orgId]);
  const kpiId = dirkRow.rows[0].id;

  console.log('--- raw pg.Client (10 rows) ---');
  const raw = await c.query(`SELECT period_start, value FROM kpi_values WHERE kpi_id=$1 ORDER BY period_start DESC LIMIT 10`, [kpiId]);
  for (const r of raw.rows) console.log('  ' + r.period_start.toISOString() + '  v=' + r.value);
  await c.end();

  console.log('\n--- Drizzle (10 rows) ---');
  const drz = await db.select().from(kpiValues).where(eq(kpiValues.kpiId, kpiId)).orderBy(desc(kpiValues.periodStart)).limit(10);
  for (const r of drz) console.log('  ' + r.periodStart.toISOString() + '  v=' + r.value);

  process.exit(0);
}
main().catch(e => { console.error(e.message); process.exit(1); });
