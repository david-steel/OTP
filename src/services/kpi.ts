// src/services/kpi.ts
// CRUD + listing for KPI definitions. Phase 2 of the scorecard build.
//
// Phase 4 will add: formula parse + cycle detection + recompute.
// Phase 3 will add: kpi_values writes (manual entry). For now we just persist
// the definition.

import { db } from '../config/database.js';
import { kpis, kpiValues, kpiDependencies } from '../db/schema.js';
import { and, eq, isNull, desc, sql, gte, lte, inArray } from 'drizzle-orm';
import { periodFor, bucketPeriods, type KpiTimeGrain as PeriodGrain } from './kpi-periods.js';
import { parseFormula, extractRefs, evaluate, detectCycle, FormulaError, type Ast } from './kpi-formula.js';

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
  teamId?: string | null;
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
  teamId?: string | null;
  ownerEntityType?: KpiOwnerEntityType;
  ownerExternalId?: string;
}

export interface KpiListFilters {
  ownerEntityType?: KpiOwnerEntityType;
  ownerExternalId?: string;
  groupName?: string;
  timeGrain?: KpiTimeGrain;
  teamId?: string;
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
      teamId: input.teamId ?? null,
      createdBy,
    })
    .returning();

  if (input.formula && input.formula.trim()) {
    await syncKpiFormulaDeps(orgId, row.id, input.formula);
  }

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
  if (patch.teamId !== undefined) update.teamId = patch.teamId;
  if (patch.ownerEntityType !== undefined) update.ownerEntityType = patch.ownerEntityType;
  if (patch.ownerExternalId !== undefined) update.ownerExternalId = patch.ownerExternalId;

  const [row] = await db
    .update(kpis)
    .set(update)
    .where(and(eq(kpis.id, kpiId), eq(kpis.organizationId, orgId), isNull(kpis.deletedAt)))
    .returning();
  if (!row) throw new KpiError('NOT_FOUND', 'KPI not found', 404);

  // If the formula changed, re-sync deps and recompute existing periods.
  if (patch.formula !== undefined) {
    if (row.formula && row.formula.trim()) {
      await syncKpiFormulaDeps(orgId, row.id, row.formula);
      await rebuildComputedValues(orgId, row.id);
    } else {
      // Formula cleared: remove deps and any prior computed values.
      await db.delete(kpiDependencies).where(eq(kpiDependencies.kpiId, row.id));
      await db.delete(kpiValues).where(and(eq(kpiValues.kpiId, row.id), eq(kpiValues.source, 'computed')));
    }
  }
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
  if (filters.teamId) conditions.push(eq(kpis.teamId, filters.teamId));

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

  // Cascade: recompute every formula KPI that depends on this one for the
  // same period. Recursion is bounded by the DAG (cycle detection at save).
  await recomputeDownstreamForPeriod(orgId, kpi.id, period.start);

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

// ---- Formula sync + cycle detection -------------------------------------

// Parses a formula, validates referenced KPIs exist in the same org and
// share the same time grain, checks for cycles, and replaces the
// kpi_dependencies rows for this KPI. Throws KpiError on any failure.
export async function syncKpiFormulaDeps(orgId: string, kpiId: string, formula: string) {
  let ast: Ast;
  try {
    ast = parseFormula(formula);
  } catch (e) {
    if (e instanceof FormulaError) {
      throw new KpiError('FORMULA_PARSE', `Formula error (${e.code}): ${e.message}`);
    }
    throw e;
  }

  const refs = extractRefs(ast);

  // The formula KPI itself must be loaded so we can compare grain.
  const [self] = await db
    .select()
    .from(kpis)
    .where(and(eq(kpis.id, kpiId), eq(kpis.organizationId, orgId), isNull(kpis.deletedAt)))
    .limit(1);
  if (!self) throw new KpiError('NOT_FOUND', 'KPI not found', 404);

  if (refs.length === 0) {
    // Formula has no refs; just clear deps.
    await db.delete(kpiDependencies).where(eq(kpiDependencies.kpiId, kpiId));
    return;
  }

  if (refs.includes(kpiId)) {
    throw new KpiError('CYCLE_SELF', 'Formula cannot reference itself');
  }

  // Verify each referenced KPI exists in this org and has the same grain.
  const refRows = await db
    .select({ id: kpis.id, grain: kpis.timeGrain })
    .from(kpis)
    .where(
      and(
        eq(kpis.organizationId, orgId),
        isNull(kpis.deletedAt),
        inArray(kpis.id, refs),
      ),
    );
  const found = new Set(refRows.map(r => r.id));
  const missing = refs.filter(r => !found.has(r));
  if (missing.length > 0) {
    throw new KpiError('REF_NOT_FOUND', `Referenced KPI(s) not found: ${missing.join(', ')}`);
  }
  const wrongGrain = refRows.filter(r => r.grain !== self.timeGrain).map(r => r.id);
  if (wrongGrain.length > 0) {
    throw new KpiError('REF_WRONG_GRAIN', `Referenced KPI(s) must share time grain ${self.timeGrain}: ${wrongGrain.join(', ')}`);
  }

  // Cycle check across the whole org's existing dependency graph.
  const orgKpiIds = (
    await db.select({ id: kpis.id }).from(kpis).where(and(eq(kpis.organizationId, orgId), isNull(kpis.deletedAt)))
  ).map(r => r.id);
  const existingEdges = orgKpiIds.length === 0
    ? []
    : await db
        .select({ kpiId: kpiDependencies.kpiId, dependsOn: kpiDependencies.dependsOnKpiId })
        .from(kpiDependencies)
        .where(inArray(kpiDependencies.kpiId, orgKpiIds));
  const cyclePath = detectCycle(kpiId, refs, existingEdges);
  if (cyclePath) {
    throw new KpiError('CYCLE', `Formula creates a cycle: ${cyclePath.join(' -> ')}`);
  }

  // Replace dependency rows.
  await db.delete(kpiDependencies).where(eq(kpiDependencies.kpiId, kpiId));
  if (refs.length > 0) {
    await db.insert(kpiDependencies).values(refs.map(r => ({ kpiId, dependsOnKpiId: r })));
  }
}

// ---- Recompute pipeline -------------------------------------------------

// Look up downstream formula KPIs (those that depend on changedKpiId) and
// re-evaluate each for a single period. Cascades: if a downstream KPI's new
// computed value lands, its own downstream KPIs get re-evaluated too.
async function recomputeDownstreamForPeriod(orgId: string, changedKpiId: string, periodStart: Date) {
  const visited = new Set<string>();
  const queue: string[] = [changedKpiId];

  while (queue.length > 0) {
    const cur = queue.shift()!;
    if (visited.has(cur)) continue;
    visited.add(cur);

    const downstream = await db
      .select({ kpiId: kpiDependencies.kpiId })
      .from(kpiDependencies)
      .where(eq(kpiDependencies.dependsOnKpiId, cur));

    for (const { kpiId: dKpiId } of downstream) {
      const newValue = await evaluateFormulaKpiForPeriod(orgId, dKpiId, periodStart);
      // Write computed result (or null) so the cell shows '—' if inputs are missing.
      await upsertComputedValue(dKpiId, periodStart, newValue);
      queue.push(dKpiId);
    }
  }
}

async function evaluateFormulaKpiForPeriod(
  orgId: string,
  formulaKpiId: string,
  periodStart: Date,
): Promise<number | null> {
  const [k] = await db
    .select()
    .from(kpis)
    .where(and(eq(kpis.id, formulaKpiId), eq(kpis.organizationId, orgId), isNull(kpis.deletedAt)))
    .limit(1);
  if (!k || !k.formula) return null;

  let ast: Ast;
  try { ast = parseFormula(k.formula); } catch { return null; }

  const refs = extractRefs(ast);
  if (refs.length === 0) return evaluate(ast, () => null);

  // Resolve each ref's value for the same periodStart.
  const refValueRows = await db
    .select({ kpiId: kpiValues.kpiId, value: kpiValues.value })
    .from(kpiValues)
    .where(and(inArray(kpiValues.kpiId, refs), eq(kpiValues.periodStart, periodStart)));
  const valueByRef = new Map<string, number | null>();
  for (const r of refValueRows) valueByRef.set(r.kpiId, r.value);

  return evaluate(ast, (id) => (valueByRef.has(id) ? valueByRef.get(id)! : null));
}

async function upsertComputedValue(kpiId: string, periodStart: Date, value: number | null) {
  // Use the KPI's grain to set periodEnd.
  const [k] = await db.select().from(kpis).where(eq(kpis.id, kpiId)).limit(1);
  if (!k) return;
  const period = periodFor(k.timeGrain as PeriodGrain, periodStart);
  await db
    .insert(kpiValues)
    .values({
      kpiId,
      periodStart: period.start,
      periodEnd: period.end,
      value,
      source: 'computed',
      enteredBy: 'formula-engine',
    })
    .onConflictDoUpdate({
      target: [kpiValues.kpiId, kpiValues.periodStart],
      set: {
        periodEnd: period.end,
        value,
        source: 'computed',
        enteredBy: 'formula-engine',
        enteredAt: new Date(),
      },
    });
}

// Wipe all 'computed' values for a KPI and re-evaluate every period that
// has at least one input value present. Used when a formula changes.
export async function rebuildComputedValues(orgId: string, formulaKpiId: string) {
  await db
    .delete(kpiValues)
    .where(and(eq(kpiValues.kpiId, formulaKpiId), eq(kpiValues.source, 'computed')));

  const [k] = await db
    .select()
    .from(kpis)
    .where(and(eq(kpis.id, formulaKpiId), eq(kpis.organizationId, orgId), isNull(kpis.deletedAt)))
    .limit(1);
  if (!k || !k.formula) return;

  let ast: Ast;
  try { ast = parseFormula(k.formula); } catch { return; }
  const refs = extractRefs(ast);
  if (refs.length === 0) return;

  // Find every period_start where at least one input KPI has a value.
  const periodsRows = await db
    .selectDistinct({ periodStart: kpiValues.periodStart })
    .from(kpiValues)
    .where(inArray(kpiValues.kpiId, refs));

  for (const { periodStart } of periodsRows) {
    const v = await evaluateFormulaKpiForPeriod(orgId, formulaKpiId, periodStart);
    await upsertComputedValue(formulaKpiId, periodStart, v);
  }
}

// Public: force-recompute every period for a formula KPI. Used by the
// recompute endpoint and tests.
export async function recomputeKpi(orgId: string, kpiId: string) {
  await rebuildComputedValues(orgId, kpiId);
}
