// src/services/kpi.ts
// CRUD + listing for KPI definitions. Phase 2 of the scorecard build.
//
// Phase 4 will add: formula parse + cycle detection + recompute.
// Phase 3 will add: kpi_values writes (manual entry). For now we just persist
// the definition.

import { db } from '../config/database.js';
import { kpis, kpiValues } from '../db/schema.js';
import { and, eq, isNull, desc, sql, gte, lte, inArray } from 'drizzle-orm';
import { periodFor, bucketPeriods, type KpiTimeGrain as PeriodGrain } from './kpi-periods.js';

export type KpiOwnerEntityType = 'agent' | 'human';
export type KpiGoalOperator = 'gte' | 'lte' | 'eq' | 'gt' | 'lt';
export type KpiTimeGrain = 'weekly' | 'monthly' | 'quarterly' | 'annual';
export type KpiAggregation = 'sum' | 'avg' | 'last' | 'first' | 'min' | 'max';

export class KpiError extends Error {
  constructor(public code: string, message: string, public httpStatus = 400) {
    super(message);
    this.name = 'KpiError';
  }
}

export interface CreateKpiInput {
  ownerEntityType: KpiOwnerEntityType;
  ownerExternalId: string;
  title: string;
  description?: string;
  groupName?: string;
  goalOperator?: KpiGoalOperator | null;
  goalValue?: number | null;
  unit?: string | null;
  timeGrain?: KpiTimeGrain;
  formula?: string | null;
  aggregationMethod?: KpiAggregation;
  planSectionId?: string | null;
  executionItemId?: string | null;
}

export interface UpdateKpiInput {
  title?: string;
  description?: string | null;
  groupName?: string | null;
  goalOperator?: KpiGoalOperator | null;
  goalValue?: number | null;
  unit?: string | null;
  timeGrain?: KpiTimeGrain;
  formula?: string | null;
  aggregationMethod?: KpiAggregation;
  planSectionId?: string | null;
  executionItemId?: string | null;
}

export interface KpiListFilters {
  ownerEntityType?: KpiOwnerEntityType;
  ownerExternalId?: string;
  groupName?: string;
  timeGrain?: KpiTimeGrain;
}

function validateGoalPair(operator: KpiGoalOperator | null | undefined, value: number | null | undefined): void {
  const opSet = operator !== null && operator !== undefined;
  const valSet = value !== null && value !== undefined;
  if (opSet !== valSet) {
    throw new KpiError(
      'INVALID_GOAL',
      'goalOperator and goalValue must both be set or both null',
    );
  }
}

export async function createKpi(orgId: string, input: CreateKpiInput, createdBy: string) {
  if (!input.title.trim()) throw new KpiError('INVALID_TITLE', 'title is required');
  if (!input.ownerExternalId.trim()) throw new KpiError('INVALID_OWNER', 'ownerExternalId is required');
  validateGoalPair(input.goalOperator, input.goalValue);

  const [row] = await db
    .insert(kpis)
    .values({
      organizationId: orgId,
      ownerEntityType: input.ownerEntityType,
      ownerExternalId: input.ownerExternalId,
      title: input.title.trim(),
      description: input.description ?? null,
      groupName: input.groupName ?? null,
      goalOperator: input.goalOperator ?? null,
      goalValue: input.goalValue ?? null,
      unit: input.unit ?? null,
      timeGrain: input.timeGrain ?? 'weekly',
      formula: input.formula ?? null,
      aggregationMethod: input.aggregationMethod ?? 'sum',
      planSectionId: input.planSectionId ?? null,
      executionItemId: input.executionItemId ?? null,
      createdBy,
    })
    .returning();
  return row;
}

export async function updateKpi(orgId: string, kpiId: string, patch: UpdateKpiInput) {
  if (Object.keys(patch).length === 0) {
    throw new KpiError('EMPTY_PATCH', 'patch must contain at least one field');
  }
  if ('goalOperator' in patch || 'goalValue' in patch) {
    validateGoalPair(patch.goalOperator, patch.goalValue);
  }

  const update: Record<string, unknown> = { updatedAt: new Date() };
  if (patch.title !== undefined) update.title = patch.title.trim();
  if (patch.description !== undefined) update.description = patch.description;
  if (patch.groupName !== undefined) update.groupName = patch.groupName;
  if (patch.goalOperator !== undefined) update.goalOperator = patch.goalOperator;
  if (patch.goalValue !== undefined) update.goalValue = patch.goalValue;
  if (patch.unit !== undefined) update.unit = patch.unit;
  if (patch.timeGrain !== undefined) update.timeGrain = patch.timeGrain;
  if (patch.formula !== undefined) update.formula = patch.formula;
  if (patch.aggregationMethod !== undefined) update.aggregationMethod = patch.aggregationMethod;
  if (patch.planSectionId !== undefined) update.planSectionId = patch.planSectionId;
  if (patch.executionItemId !== undefined) update.executionItemId = patch.executionItemId;

  const [row] = await db
    .update(kpis)
    .set(update)
    .where(and(eq(kpis.id, kpiId), eq(kpis.organizationId, orgId), isNull(kpis.deletedAt)))
    .returning();
  if (!row) throw new KpiError('NOT_FOUND', 'KPI not found', 404);
  return row;
}

export async function deleteKpi(orgId: string, kpiId: string) {
  const [row] = await db
    .update(kpis)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(kpis.id, kpiId), eq(kpis.organizationId, orgId), isNull(kpis.deletedAt)))
    .returning({ id: kpis.id });
  if (!row) throw new KpiError('NOT_FOUND', 'KPI not found', 404);
  return { id: row.id, deleted: true };
}

export async function getKpi(orgId: string, kpiId: string) {
  const [row] = await db
    .select()
    .from(kpis)
    .where(and(eq(kpis.id, kpiId), eq(kpis.organizationId, orgId), isNull(kpis.deletedAt)))
    .limit(1);
  if (!row) throw new KpiError('NOT_FOUND', 'KPI not found', 404);
  return row;
}

export async function listKpis(orgId: string, filters: KpiListFilters = {}) {
  const conditions = [eq(kpis.organizationId, orgId), isNull(kpis.deletedAt)];
  if (filters.ownerEntityType) conditions.push(eq(kpis.ownerEntityType, filters.ownerEntityType));
  if (filters.ownerExternalId) conditions.push(eq(kpis.ownerExternalId, filters.ownerExternalId));
  if (filters.groupName) conditions.push(eq(kpis.groupName, filters.groupName));
  if (filters.timeGrain) conditions.push(eq(kpis.timeGrain, filters.timeGrain));

  return await db
    .select()
    .from(kpis)
    .where(and(...conditions))
    .orderBy(sql`coalesce(${kpis.groupName}, '~zzz')`, desc(kpis.createdAt));
}

// ---- Value entry --------------------------------------------------------

export type KpiValueSource = 'manual' | 'api' | 'computed';

export interface WriteKpiValueInput {
  periodStart: Date;
  value: number | null;
  source?: KpiValueSource;
  notes?: string | null;
}

export async function writeKpiValue(
  orgId: string,
  kpiId: string,
  input: WriteKpiValueInput,
  enteredBy: string,
) {
  // Look up the KPI to (a) confirm it belongs to the org and (b) compute
  // periodEnd from the KPI's grain. We refuse on mismatched org or missing.
  const kpi = await getKpi(orgId, kpiId);
  const grain = kpi.timeGrain as PeriodGrain;
  const period = periodFor(grain, input.periodStart);
  const source = input.source ?? 'manual';

  // UPSERT on (kpi_id, period_start)
  const [row] = await db
    .insert(kpiValues)
    .values({
      kpiId: kpi.id,
      periodStart: period.start,
      periodEnd: period.end,
      value: input.value,
      source,
      enteredBy,
      notes: input.notes ?? null,
    })
    .onConflictDoUpdate({
      target: [kpiValues.kpiId, kpiValues.periodStart],
      set: {
        periodEnd: period.end,
        value: input.value,
        source,
        enteredBy,
        notes: input.notes ?? null,
        enteredAt: new Date(),
      },
    })
    .returning();
  return row;
}

export async function deleteKpiValue(orgId: string, kpiId: string, periodStart: Date) {
  const kpi = await getKpi(orgId, kpiId); // org check
  const grain = kpi.timeGrain as PeriodGrain;
  const p = periodFor(grain, periodStart);
  const result = await db
    .delete(kpiValues)
    .where(and(eq(kpiValues.kpiId, kpi.id), eq(kpiValues.periodStart, p.start)));
  return { deleted: result.rowCount ?? 0 };
}

// ---- Scoreboard query --------------------------------------------------

export interface ScoreboardOptions {
  timeGrain: PeriodGrain;
  from: Date;
  to: Date;
  ownerEntityType?: 'agent' | 'human';
  ownerExternalId?: string;
  groupName?: string;
}

export interface ScoreboardPeriodCell {
  periodStart: string;
  periodEnd: string;
  value: number | null;
  source: KpiValueSource | null;
}

export interface ScoreboardRow {
  kpi: typeof kpis.$inferSelect;
  periods: ScoreboardPeriodCell[];
}

export interface ScoreboardResponse {
  timeGrain: PeriodGrain;
  from: string;
  to: string;
  periods: { start: string; end: string }[];
  rows: ScoreboardRow[];
}

export async function getScoreboard(orgId: string, opts: ScoreboardOptions): Promise<ScoreboardResponse> {
  const buckets = bucketPeriods(opts.timeGrain, opts.from, opts.to);

  // Fetch KPIs filtered by grain (+ optional owner/group)
  const kpiConds = [
    eq(kpis.organizationId, orgId),
    isNull(kpis.deletedAt),
    eq(kpis.timeGrain, opts.timeGrain),
  ];
  if (opts.ownerEntityType) kpiConds.push(eq(kpis.ownerEntityType, opts.ownerEntityType));
  if (opts.ownerExternalId) kpiConds.push(eq(kpis.ownerExternalId, opts.ownerExternalId));
  if (opts.groupName) kpiConds.push(eq(kpis.groupName, opts.groupName));

  const kpiRows = await db
    .select()
    .from(kpis)
    .where(and(...kpiConds))
    .orderBy(sql`coalesce(${kpis.groupName}, '~zzz')`, desc(kpis.createdAt));

  if (kpiRows.length === 0) {
    return {
      timeGrain: opts.timeGrain,
      from: opts.from.toISOString(),
      to: opts.to.toISOString(),
      periods: buckets.map(b => ({ start: b.start.toISOString(), end: b.end.toISOString() })),
      rows: [],
    };
  }

  // Pull all values for these KPIs in the date range
  const kpiIds = kpiRows.map(k => k.id);
  const valueRows = await db
    .select()
    .from(kpiValues)
    .where(
      and(
        inArray(kpiValues.kpiId, kpiIds),
        gte(kpiValues.periodStart, buckets[0].start),
        lte(kpiValues.periodStart, buckets[buckets.length - 1].start),
      ),
    );

  // Index: kpiId -> Map<periodStartISO, valueRow>
  const byKpi = new Map<string, Map<string, typeof valueRows[number]>>();
  for (const v of valueRows) {
    let m = byKpi.get(v.kpiId);
    if (!m) { m = new Map(); byKpi.set(v.kpiId, m); }
    m.set(v.periodStart.toISOString(), v);
  }

  const rows: ScoreboardRow[] = kpiRows.map(kpi => {
    const m = byKpi.get(kpi.id) ?? new Map();
    const periods: ScoreboardPeriodCell[] = buckets.map(b => {
      const v = m.get(b.start.toISOString());
      return {
        periodStart: b.start.toISOString(),
        periodEnd: b.end.toISOString(),
        value: v?.value ?? null,
        source: (v?.source as KpiValueSource | undefined) ?? null,
      };
    });
    return { kpi, periods };
  });

  return {
    timeGrain: opts.timeGrain,
    from: opts.from.toISOString(),
    to: opts.to.toISOString(),
    periods: buckets.map(b => ({ start: b.start.toISOString(), end: b.end.toISOString() })),
    rows,
  };
}
