// Pragmatic re-seed for demo: insert one value per Sneeze It KPI at the LATEST
// bucket position. Use Drizzle directly so the value round-trips through the
// same code path getScoreboard reads with. Skip if the KPI already has a value
// at that period_start.

import { db } from '../src/config/database.js';
import { kpis, kpiValues } from '../src/db/schema.js';
import { eq, and, isNull } from 'drizzle-orm';
import { bucketPeriods } from '../src/services/kpi-periods.js';

const orgId = process.env.SNEEZE_ORG_ID!;

// Latest realistic value per KPI title (matches the goal-aligned anchors I seeded earlier).
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

async function main() {
  const now = new Date();
  const from = new Date(now.getTime() - 13 * 7 * 86400000);
  const buckets = bucketPeriods('weekly', from, now);
  const latestBucket = buckets[buckets.length - 1];
  console.log('Latest bucket start:', latestBucket.start.toISOString(), 'end:', latestBucket.end.toISOString());

  const allKpis = await db.select().from(kpis).where(and(eq(kpis.organizationId, orgId), isNull(kpis.deletedAt)));
  console.log(`Found ${allKpis.length} KPIs.`);

  let inserted = 0;
  let skipped = 0;
  for (const k of allKpis) {
    const target = LATEST[k.title];
    if (target == null) { console.log(`  skip ${k.title}: no LATEST entry`); skipped++; continue; }

    // Skip if already a value at this exact period_start
    const existing = await db.select().from(kpiValues).where(and(
      eq(kpiValues.kpiId, k.id),
      eq(kpiValues.periodStart, latestBucket.start),
    )).limit(1);
    if (existing.length > 0) { console.log(`  skip ${k.title}: value already at latest bucket (v=${existing[0].value})`); skipped++; continue; }

    await db.insert(kpiValues).values({
      kpiId: k.id,
      periodStart: latestBucket.start,
      periodEnd: latestBucket.end,
      value: target,
      source: 'manual',
      enteredBy: 'seed:demo-latest',
      notes: 'Re-seed for /dashboard/kpis demo',
    });
    console.log(`  insert ${k.title}: v=${target}`);
    inserted++;
  }
  console.log(`\nDone. ${inserted} inserted, ${skipped} skipped.`);
  process.exit(0);
}
main().catch(e => { console.error(e.message); process.exit(1); });
