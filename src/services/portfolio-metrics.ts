// src/services/portfolio-metrics.ts
// Super-metric aggregator for Portfolios (an org composed of other orgs).
//
// A portfolio super-metric is an ordinary kpis row living in the portfolio org.
// Its inputs are member-org KPIs, mapped via portfolio_metric_sources (with a
// per-source weight). This service recomputes a super-metric's value for the
// current period by summing weight * latest-member-value across its sources,
// then upserts a 'computed' kpiValue on the portfolio KPI.
//
// Pure service: no routes, no UI. Depends only on schema + period helper.

import { db } from '../config/database.js';
import { kpis, kpiValues, portfolioMetricSources } from '../db/schema.js';
import { and, eq, isNull, desc, inArray } from 'drizzle-orm';
import { periodFor, type KpiTimeGrain } from './kpi-periods.js';

export interface RecomputePortfolioMetricResult {
  value: number | null;
  sourcesUsed: number;
  sourcesSkipped: number;
}

// Recompute one portfolio super-metric for the CURRENT period.
export async function recomputePortfolioMetric(
  portfolioKpiId: string,
): Promise<RecomputePortfolioMetricResult> {
  // Load the portfolio KPI row (need its grain to derive the period + periodEnd).
  const [portfolioKpi] = await db
    .select()
    .from(kpis)
    .where(and(eq(kpis.id, portfolioKpiId), isNull(kpis.deletedAt)))
    .limit(1);
  if (!portfolioKpi) {
    return { value: null, sourcesUsed: 0, sourcesSkipped: 0 };
  }

  const grain = portfolioKpi.timeGrain as KpiTimeGrain;
  const period = periodFor(grain, new Date());

  // Load this super-metric's input sources.
  const sources = await db
    .select()
    .from(portfolioMetricSources)
    .where(eq(portfolioMetricSources.portfolioKpiId, portfolioKpiId));

  let sum = 0;
  let sourcesUsed = 0;
  let sourcesSkipped = 0;

  for (const source of sources) {
    // Load the member KPI. Skip if missing, soft-deleted, or rollup-excluded.
    const [memberKpi] = await db
      .select()
      .from(kpis)
      .where(and(eq(kpis.id, source.memberKpiId), isNull(kpis.deletedAt)))
      .limit(1);
    if (!memberKpi || memberKpi.rollupExcluded) {
      const reason = !memberKpi ? 'member KPI missing or soft-deleted' : 'rollupExcluded';
      console.warn(`[portfolio-metrics] skipped source for portfolioKpi ${portfolioKpiId} (memberOrg ${source.memberOrgId}, memberKpi ${source.memberKpiId}): ${reason}`);
      sourcesSkipped++;
      continue;
    }

    // Fetch the member KPI's LATEST value (most recent periodStart).
    const [latest] = await db
      .select({ value: kpiValues.value })
      .from(kpiValues)
      .where(eq(kpiValues.kpiId, memberKpi.id))
      .orderBy(desc(kpiValues.periodStart))
      .limit(1);
    if (!latest || latest.value === null) {
      const reason = !latest ? 'no values' : 'null latest value';
      console.warn(`[portfolio-metrics] skipped source for portfolioKpi ${portfolioKpiId} (memberOrg ${source.memberOrgId}, memberKpi ${source.memberKpiId}): ${reason}`);
      sourcesSkipped++;
      continue;
    }

    sum += source.weight * latest.value;
    sourcesUsed++;
  }

  const value = sourcesUsed === 0 ? null : sum;

  // Upsert a computed kpiValue on the portfolio KPI for the current period.
  // upsertComputedValue in services/kpi.ts is not exported, so we write
  // directly using the same upsert-on-(kpiId, periodStart) semantics the
  // file already uses (kpi_values_kpi_period_uk).
  await db
    .insert(kpiValues)
    .values({
      kpiId: portfolioKpi.id,
      periodStart: period.start,
      periodEnd: period.end,
      value,
      source: 'computed',
      enteredBy: 'portfolio-aggregator',
    })
    .onConflictDoUpdate({
      target: [kpiValues.kpiId, kpiValues.periodStart],
      set: {
        periodEnd: period.end,
        value,
        source: 'computed',
        enteredBy: 'portfolio-aggregator',
        enteredAt: new Date(),
      },
    });

  return { value, sourcesUsed, sourcesSkipped };
}

export interface RecomputePortfolioOrgResult {
  metrics: number;
}

// Recompute every super-metric in a portfolio org (i.e. each non-deleted KPI
// in that org that has at least one portfolio_metric_sources row).
export async function recomputePortfolioOrg(
  portfolioOrgId: string,
): Promise<RecomputePortfolioOrgResult> {
  // Candidate KPIs in this portfolio org (not deleted, not archived).
  const orgKpis = await db
    .select({ id: kpis.id })
    .from(kpis)
    .where(
      and(
        eq(kpis.organizationId, portfolioOrgId),
        isNull(kpis.deletedAt),
        isNull(kpis.archivedAt),
      ),
    );
  if (orgKpis.length === 0) return { metrics: 0 };

  // Keep only those that have at least one source row.
  const orgKpiIds = orgKpis.map((k) => k.id);
  const sourceRows = await db
    .select({ portfolioKpiId: portfolioMetricSources.portfolioKpiId })
    .from(portfolioMetricSources)
    .where(inArray(portfolioMetricSources.portfolioKpiId, orgKpiIds));
  const superMetricIds = [...new Set(sourceRows.map((r) => r.portfolioKpiId))];

  let metrics = 0;
  for (const id of superMetricIds) {
    await recomputePortfolioMetric(id);
    metrics++;
  }

  return { metrics };
}
