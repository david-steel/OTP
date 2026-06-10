// src/services/kpi-publish.ts
// Push KPI definitions into the org's OOS as structured claims (Phase 8).
// OOS-native: agents reading the OOS see the KPI definitions structurally
// and know what they (or their seat) are being measured on.
//
// Each KPI becomes one claim under section='kpis'. Claim values stay in the
// relational DB (kpi_values is high-cardinality time-series, not OOS-shaped).

import { db } from '../config/database.js';
import { kpis, oosFiles, claims } from '../db/schema.js';
import { and, eq, desc, isNull } from 'drizzle-orm';

export class KpiPublishError extends Error {
  constructor(public code: string, message: string, public httpStatus = 400) {
    super(message);
    this.name = 'KpiPublishError';
  }
}

const GOAL_OP_TEXT: Record<string, string> = {
  gte: '≥', lte: '≤', gt: '>', lt: '<', eq: '=',
};

function shortClaimIdFor(kpiId: string): string {
  // claims.claim_id is varchar(10). Use prefix 'k' + first 9 hex chars of the
  // KPI UUID (32 hex chars total). Collision risk negligible per-org.
  const hex = kpiId.replace(/-/g, '');
  return ('k' + hex.slice(0, 9)).slice(0, 10);
}

function buildRule(kpi: typeof kpis.$inferSelect): string {
  const parts: string[] = [];
  parts.push(kpi.title.trim());
  if (kpi.goalOperator && kpi.goalValue !== null && kpi.goalValue !== undefined) {
    const op = GOAL_OP_TEXT[kpi.goalOperator] || kpi.goalOperator;
    const unit = kpi.unit ? ` ${kpi.unit}` : '';
    parts.push(`Goal: ${op} ${kpi.goalValue}${unit}`);
  }
  parts.push(`Grain: ${kpi.timeGrain}`);
  if (kpi.formula) parts.push(`Formula: ${kpi.formula}`);
  return parts.join('. ') + '.';
}

function buildWhy(kpi: typeof kpis.$inferSelect): string {
  if (kpi.description && kpi.description.trim()) return kpi.description.trim();
  return `Success metric for the ${kpi.ownerEntityType} seat ${kpi.ownerExternalId}. Tracked at ${kpi.timeGrain} grain.`;
}

function buildFailureMode(kpi: typeof kpis.$inferSelect): string {
  if (kpi.goalOperator && kpi.goalValue !== null) {
    const op = GOAL_OP_TEXT[kpi.goalOperator] || kpi.goalOperator;
    const unit = kpi.unit ? ` ${kpi.unit}` : '';
    return `If this measurable drifts away from ${op} ${kpi.goalValue}${unit}, the seat ${kpi.ownerExternalId} is not delivering on its accountability for ${kpi.title}.`;
  }
  return `If this measurable is not tracked, the ${kpi.ownerExternalId} seat operates without a quantified accountability for ${kpi.title}.`;
}

async function getPublishedOosFileId(orgId: string): Promise<string | null> {
  const rows = await db
    .select({ id: oosFiles.id })
    .from(oosFiles)
    .where(and(eq(oosFiles.orgId, orgId), eq(oosFiles.status, 'published')))
    .orderBy(desc(oosFiles.createdAt))
    .limit(1);
  return rows[0]?.id ?? null;
}

export interface PublishKpiResult {
  kpiId: string;
  claimUuid: string;
  claimId: string;
  oosFileId: string;
  action: 'inserted' | 'updated';
}

export async function publishKpiToOos(orgId: string, kpiId: string): Promise<PublishKpiResult> {
  const [kpi] = await db
    .select()
    .from(kpis)
    .where(and(eq(kpis.id, kpiId), eq(kpis.organizationId, orgId), isNull(kpis.deletedAt)))
    .limit(1);
  if (!kpi) throw new KpiPublishError('NOT_FOUND', 'KPI not found', 404);

  const oosFileId = await getPublishedOosFileId(orgId);
  if (!oosFileId) {
    throw new KpiPublishError(
      'NO_OOS_FILE',
      'No published OOS file. Publish your OOS first; KPI claims attach under it.',
      409,
    );
  }

  const claimIdShort = shortClaimIdFor(kpi.id);
  const rule = buildRule(kpi);
  const why = buildWhy(kpi);
  const failureMode = buildFailureMode(kpi);

  const [existing] = await db
    .select()
    .from(claims)
    .where(and(eq(claims.oosFileId, oosFileId), eq(claims.claimId, claimIdShort)))
    .limit(1);

  if (existing) {
    await db
      .update(claims)
      .set({
        rule,
        why,
        failureMode,
        agentName: kpi.ownerExternalId,
        section: 'kpis',
        source: 'kpi_publish',
        updatedAt: new Date(),
      })
      .where(eq(claims.id, existing.id));
    await db
      .update(kpis)
      .set({ claimId: existing.id, isPublished: true, updatedAt: new Date() })
      .where(eq(kpis.id, kpi.id));
    return { kpiId: kpi.id, claimUuid: existing.id, claimId: claimIdShort, oosFileId, action: 'updated' };
  }

  // Insert: pick next displayOrder for this section
  const max = await db
    .select({ id: claims.id, displayOrder: claims.displayOrder })
    .from(claims)
    .where(and(eq(claims.oosFileId, oosFileId), eq(claims.section, 'kpis')))
    .orderBy(desc(claims.displayOrder))
    .limit(1);
  const nextOrder = (max[0]?.displayOrder ?? 0) + 1;

  const [inserted] = await db
    .insert(claims)
    .values({
      oosFileId,
      claimId: claimIdShort,
      section: 'kpis',
      displayOrder: nextOrder,
      rule,
      why,
      failureMode,
      confidence: 'HIGH',
      evidence: 'HUMAN_DEFINED_RULE',
      scope: `seat:${kpi.ownerExternalId}`,
      source: 'kpi_publish',
      agentName: kpi.ownerExternalId,
    })
    .returning({ id: claims.id });
  await db
    .update(kpis)
    .set({ claimId: inserted.id, isPublished: true, updatedAt: new Date() })
    .where(eq(kpis.id, kpi.id));
  return { kpiId: kpi.id, claimUuid: inserted.id, claimId: claimIdShort, oosFileId, action: 'inserted' };
}

export async function unpublishKpiFromOos(orgId: string, kpiId: string): Promise<{ removed: boolean }> {
  const [kpi] = await db
    .select()
    .from(kpis)
    .where(and(eq(kpis.id, kpiId), eq(kpis.organizationId, orgId)))
    .limit(1);
  if (!kpi) throw new KpiPublishError('NOT_FOUND', 'KPI not found', 404);
  if (!kpi.claimId) {
    return { removed: false };
  }
  // Defense-in-depth: only delete claims whose source is 'kpi_publish'.
  const [c] = await db.select().from(claims).where(eq(claims.id, kpi.claimId)).limit(1);
  if (!c) {
    await db.update(kpis).set({ claimId: null, isPublished: false, updatedAt: new Date() }).where(eq(kpis.id, kpi.id));
    return { removed: false };
  }
  if (c.source !== 'kpi_publish') {
    throw new KpiPublishError('REFUSE_DELETE', 'Refusing to delete a claim whose source is not kpi_publish', 409);
  }
  await db.delete(claims).where(eq(claims.id, c.id));
  await db.update(kpis).set({ claimId: null, isPublished: false, updatedAt: new Date() }).where(eq(kpis.id, kpi.id));
  return { removed: true };
}

export async function publishAllKpisForOrg(orgId: string): Promise<{ published: number; failed: Array<{ kpiId: string; error: string }> }> {
  const all = await db
    .select({ id: kpis.id })
    .from(kpis)
    .where(and(eq(kpis.organizationId, orgId), isNull(kpis.deletedAt), isNull(kpis.archivedAt)));
  let published = 0;
  const failed: Array<{ kpiId: string; error: string }> = [];
  for (const { id } of all) {
    try {
      await publishKpiToOos(orgId, id);
      published += 1;
    } catch (e) {
      failed.push({ kpiId: id, error: e instanceof Error ? e.message : String(e) });
    }
  }
  return { published, failed };
}
