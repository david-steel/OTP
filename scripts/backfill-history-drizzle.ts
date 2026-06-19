// Re-do the 13-week historical backfill via Drizzle (the path that round-trips
// timestamps cleanly). Earlier raw-pg backfill stored values that pg+Drizzle
// could not match against bucket keys; that mess is left orphan in the DB
// (entered_by='seed:l10-history') and should be ignored or cleaned up later.
//
// This script writes 13 historical weekly values per KPI at the EXACT bucket
// timestamps bucketPeriods produces. Idempotent.

import { db } from '../src/config/database.js';
import { kpis, kpiValues } from '../src/db/schema.js';
import { eq, and, isNull } from 'drizzle-orm';
import { bucketPeriods } from '../src/services/kpi-periods.js';

const orgId = process.env.SNEEZE_ORG_ID!;

const LATEST: Record<string, number> = {
  'Aio -- AI-search visibility content shipped': 4,
  'Crafter -- Personalized outreach sent': 38,
  'Crystal active projects': 35,
  'Dirk -- Cold emails sent': 95,
  'Dirk -- Real live proposals (closable)': 7,
  'Lead-to-Client Conversion %': 14,
  'Listener -- Mentions/replies surfaced': 18,
  'OTP -- Real signups': 3,
  'Pepper -- Email drafts produced': 41,
  'Qualified Sales Calls': 3,
  'Recurring Monthly Revenue (closed in 30d)': 18500,
  'Sneeze It cold emails sent (week-to-date)': 88,
  'Tally -- KPI pushes to scorecard': 22,
};

function plan(latest: number, weeks: number, direction: 'up' | 'down' | 'flat' = 'up'): number[] {
  const startMul = direction === 'up' ? 0.6 : direction === 'down' ? 1.4 : 0.85;
  const start = Math.max(1, latest * startMul);
  const out: number[] = [];
  for (let i = 0; i < weeks; i++) {
    const t = i / (weeks - 1);
    const trend = start + (latest - start) * t;
    const noise = (Math.sin(i * 1.7) + Math.cos(i * 2.3)) * 0.10;
    const v = Math.max(0, trend * (1 + noise));
    out.push(Number.isInteger(latest) ? Math.round(v) : Math.round(v * 100) / 100);
  }
  return out;
}

async function main() {
  const now = new Date();
  const from = new Date(now.getTime() - 13 * 7 * 86400000);
  const buckets = bucketPeriods('weekly', from, now);
  console.log(`Buckets: ${buckets.length} (${buckets[0].start.toISOString()} .. ${buckets[buckets.length - 1].start.toISOString()})`);

  const allKpis = await db.select().from(kpis).where(and(eq(kpis.organizationId, orgId), isNull(kpis.deletedAt)));

  let totalInserted = 0;
  let totalSkipped = 0;

  for (const k of allKpis) {
    const target = LATEST[k.title];
    if (target == null) continue;
    const goalOp = (k as any).goalOperator;
    const direction: 'up' | 'down' | 'flat' = goalOp === 'lte' || goalOp === 'lt' ? 'down' : 'up';
    const series = plan(target, buckets.length, direction);

    let kpiInserted = 0;
    let kpiSkipped = 0;
    for (let i = 0; i < buckets.length; i++) {
      const b = buckets[i];
      const existing = await db.select().from(kpiValues).where(and(
        eq(kpiValues.kpiId, k.id),
        eq(kpiValues.periodStart, b.start),
      )).limit(1);
      if (existing.length > 0) { kpiSkipped++; continue; }
      await db.insert(kpiValues).values({
        kpiId: k.id,
        periodStart: b.start,
        periodEnd: b.end,
        value: series[i],
        source: 'manual',
        enteredBy: 'seed:demo-history-v2',
        notes: 'Drizzle-roundtrip backfill for /dashboard/kpis demo',
      });
      kpiInserted++;
    }
    totalInserted += kpiInserted;
    totalSkipped += kpiSkipped;
    console.log(`  ${k.title.padEnd(48)} +${kpiInserted}  skipped=${kpiSkipped}`);
  }

  console.log(`\nTotal: ${totalInserted} inserted, ${totalSkipped} skipped.`);
  process.exit(0);
}
main().catch(e => { console.error(e.message); process.exit(1); });
