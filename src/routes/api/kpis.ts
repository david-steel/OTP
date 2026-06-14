// src/routes/api/kpis.ts
// REST API for KPI definitions. Phase 2 of the scorecard build.
//
// POST   /api/v1/kpis           Create a KPI
// GET    /api/v1/kpis           List KPIs (filterable by owner, group, grain)
// GET    /api/v1/kpis/:id       Get one KPI
// PATCH  /api/v1/kpis/:id       Update a KPI
// DELETE /api/v1/kpis/:id       Soft-delete a KPI
//
// Auth: Clerk session OR API key with 'write' scope (mirrors team API).

import type { FastifyInstance, FastifyRequest } from 'fastify';
import { getAuth } from '@clerk/fastify';
import { z } from 'zod';
import { db } from '../../config/database.js';
import { organizations } from '../../db/schema.js';
import { eq, sql } from 'drizzle-orm';
import { resolveApiKey, requireScope } from '../../middleware/api-key-auth.js';
import { getAuthOrg, gateReadOnlyRole } from '../../middleware/auth-helpers.js';
import { emitOrgEventSafe } from '../../services/org-events.js';
import { resnapshotMeetingsForKpi } from '../../services/meeting-resnapshot.js';
import { resolveOrgForUser } from '../../services/membership.js';
import {
  createKpi,
  updateKpi,
  deleteKpi,
  getKpi,
  listKpis,
  writeKpiValue,
  deleteKpiValue,
  getScoreboard,
  recomputeKpi,
  assignKpiToOwner,
  unshareKpi,
  KpiError,
} from '../../services/kpi.js';
import {
  publishKpiToOos,
  unpublishKpiFromOos,
  publishAllKpisForOrg,
  KpiPublishError,
} from '../../services/kpi-publish.js';
import { isSuperAdmin } from '../../middleware/super-admin.js';
import { valueWriteSchema } from './kpi-value-schema.js';

async function checkScope(request: FastifyRequest, reply: any, requiredScope: string): Promise<boolean> {
  const auth = getAuth(request);
  if (auth.userId) {
    // Read-only roles (observer/inactive/free) may not mutate KPIs.
    if (requiredScope === 'write') return gateReadOnlyRole(request, reply);
    return true;
  }
  const apiKeyCtx = await resolveApiKey(request);
  if (apiKeyCtx && !requireScope(apiKeyCtx, requiredScope)) {
    reply.status(403).send({ error: { code: 'INSUFFICIENT_SCOPE', message: `API key requires '${requiredScope}' scope` } });
    return false;
  }
  return true;
}

async function getOrg(request: FastifyRequest) {
  const auth = getAuth(request);
  if (auth.userId) {
    const resolved = await resolveOrgForUser(auth.userId);
    if (resolved) return resolved.org;
    const [row] = await db.select().from(organizations).where(eq(organizations.clerkOrgId, auth.userId)).limit(1);
    return row || null;
  }
  return await getAuthOrg(request);
}

function getCreatedBy(request: FastifyRequest): string {
  const auth = getAuth(request);
  if (auth.userId) return auth.userId;
  return 'api-key';
}

function isApiKeyAuth(request: FastifyRequest): boolean {
  const auth = getAuth(request);
  return !auth.userId;
}

const goalOperatorSchema = z.enum(['gte', 'lte', 'eq', 'gt', 'lt']);
const ownerTypeSchema = z.enum(['agent', 'human']);
const grainSchema = z.enum(['weekly', 'monthly', 'quarterly', 'annual']);
const aggSchema = z.enum(['sum', 'avg', 'last', 'first', 'min', 'max']);

const createSchema = z.object({
  ownerEntityType: ownerTypeSchema,
  ownerExternalId: z.string().min(1).max(120),
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  groupName: z.string().max(120).optional(),
  goalOperator: goalOperatorSchema.nullable().optional(),
  goalValue: z.number().finite().nullable().optional(),
  unit: z.string().max(40).nullable().optional(),
  timeGrain: grainSchema.optional(),
  formula: z.string().max(2000).nullable().optional(),
  aggregationMethod: aggSchema.optional(),
  planSectionId: z.string().uuid().nullable().optional(),
  executionItemId: z.string().uuid().nullable().optional(),
  teamId: z.string().uuid().nullable().optional(),
});

const updateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).nullable().optional(),
  groupName: z.string().max(120).nullable().optional(),
  goalOperator: goalOperatorSchema.nullable().optional(),
  goalValue: z.number().finite().nullable().optional(),
  unit: z.string().max(40).nullable().optional(),
  timeGrain: grainSchema.optional(),
  formula: z.string().max(2000).nullable().optional(),
  aggregationMethod: aggSchema.optional(),
  planSectionId: z.string().uuid().nullable().optional(),
  executionItemId: z.string().uuid().nullable().optional(),
  teamId: z.string().uuid().nullable().optional(),
  ownerEntityType: ownerTypeSchema.optional(),
  ownerExternalId: z.string().min(1).max(120).optional(),
  // Soft archive: true hides the KPI from default lists/scoreboards,
  // false restores it. Never a delete -- history is preserved.
  archived: z.boolean().optional(),
}).refine((p) => Object.keys(p).length > 0, { message: 'patch must contain at least one field' });

const listQuerySchema = z.object({
  ownerEntityType: ownerTypeSchema.optional(),
  ownerExternalId: z.string().max(120).optional(),
  groupName: z.string().max(120).optional(),
  timeGrain: grainSchema.optional(),
  teamId: z.string().uuid().optional(),
});

export default async function kpiRoutes(app: FastifyInstance) {
  // ---- KPI groups: persisted display order + add/rename/delete ----
  // Groups are the group_name string on each KPI; kpi_groups persists a custom
  // order and lets a group exist independent of its KPIs.
  const groupNameSchema = z.object({ name: z.string().trim().min(1).max(120) });

  // GET /api/v1/kpi-groups -- ordered groups (registry UNION live KPI groups) + counts.
  app.get('/kpi-groups', async (request, reply) => {
    const org = await getOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    const reg = (await db.execute(sql`SELECT name, sort_order FROM kpi_groups WHERE org_id = ${org.id} ORDER BY sort_order, name`)) as any;
    const live = (await db.execute(sql`SELECT group_name AS name, COUNT(*)::int AS cnt FROM kpis WHERE organization_id = ${org.id} AND deleted_at IS NULL AND group_name IS NOT NULL GROUP BY group_name`)) as any;
    const counts = new Map<string, number>((live.rows || []).map((r: any) => [r.name, Number(r.cnt)]));
    const ordered: Array<{ name: string; sortOrder: number; kpiCount: number }> = [];
    const seen = new Set<string>();
    for (const r of (reg.rows || [])) { ordered.push({ name: r.name, sortOrder: r.sort_order, kpiCount: counts.get(r.name) || 0 }); seen.add(r.name); }
    // Live groups not yet in the registry, appended alphabetically.
    for (const name of Array.from(counts.keys()).sort()) { if (!seen.has(name)) ordered.push({ name, sortOrder: 9999, kpiCount: counts.get(name) || 0 }); }
    return { groups: ordered };
  });

  // POST /api/v1/kpi-groups { name } -- create an (empty) group at the end.
  app.post('/kpi-groups', async (request, reply) => {
    if (!(await checkScope(request, reply, 'write'))) return;
    const org = await getOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    const body = groupNameSchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'A group name is required' } });
    await db.execute(sql`
      INSERT INTO kpi_groups (org_id, name, sort_order)
      VALUES (${org.id}, ${body.data.name}, COALESCE((SELECT MAX(sort_order) + 1 FROM kpi_groups WHERE org_id = ${org.id}), 0))
      ON CONFLICT (org_id, name) DO NOTHING`);
    return { ok: true };
  });

  // PATCH /api/v1/kpi-groups/reorder { names: [...] } -- set order by index.
  app.patch('/kpi-groups/reorder', async (request, reply) => {
    if (!(await checkScope(request, reply, 'write'))) return;
    const org = await getOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    const parsed = z.object({ names: z.array(z.string().trim().min(1).max(120)).max(200) }).safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'names[] required' } });
    let i = 0;
    for (const name of parsed.data.names) {
      await db.execute(sql`
        INSERT INTO kpi_groups (org_id, name, sort_order) VALUES (${org.id}, ${name}, ${i})
        ON CONFLICT (org_id, name) DO UPDATE SET sort_order = ${i}, updated_at = now()`);
      i++;
    }
    return { ok: true };
  });

  // PATCH /api/v1/kpi-groups/rename { from, to } -- rename group + move its KPIs.
  app.patch('/kpi-groups/rename', async (request, reply) => {
    if (!(await checkScope(request, reply, 'write'))) return;
    const org = await getOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    const parsed = z.object({ from: z.string().trim().min(1).max(120), to: z.string().trim().min(1).max(120) }).safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'from + to required' } });
    const { from, to } = parsed.data;
    await db.execute(sql`UPDATE kpis SET group_name = ${to}, updated_at = now() WHERE organization_id = ${org.id} AND group_name = ${from}`);
    await db.execute(sql`
      INSERT INTO kpi_groups (org_id, name, sort_order)
      VALUES (${org.id}, ${to}, COALESCE((SELECT sort_order FROM kpi_groups WHERE org_id = ${org.id} AND name = ${from}), 9999))
      ON CONFLICT (org_id, name) DO NOTHING`);
    await db.execute(sql`DELETE FROM kpi_groups WHERE org_id = ${org.id} AND name = ${from}`);
    return { ok: true };
  });

  // DELETE /api/v1/kpi-groups { name } -- remove the group; its KPIs become ungrouped.
  app.delete('/kpi-groups', async (request, reply) => {
    if (!(await checkScope(request, reply, 'write'))) return;
    const org = await getOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    const body = groupNameSchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'A group name is required' } });
    await db.execute(sql`UPDATE kpis SET group_name = NULL, updated_at = now() WHERE organization_id = ${org.id} AND group_name = ${body.data.name}`);
    await db.execute(sql`DELETE FROM kpi_groups WHERE org_id = ${org.id} AND name = ${body.data.name}`);
    return { ok: true };
  });

  app.post('/kpis', async (request, reply) => {
    if (!(await checkScope(request, reply, 'write'))) return;
    const org = await getOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const body = createSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid input', details: body.error.issues } });
    }

    try {
      const kpi = await createKpi(org.id, body.data, getCreatedBy(request));
      await emitOrgEventSafe({
        orgId: org.id, topic: 'kpi', entityType: 'kpi', entityId: kpi.id, action: 'created',
        actorType: isApiKeyAuth(request) ? 'agent' : 'user', actorId: getCreatedBy(request),
        payload: { title: kpi.title },
      });
      return reply.status(201).send(kpi);
    } catch (e) {
      if (e instanceof KpiError) return reply.status(e.httpStatus).send({ error: { code: e.code, message: e.message } });
      request.log.error(e);
      return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create KPI' } });
    }
  });

  app.get('/kpis', async (request, reply) => {
    const org = await getOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const q = listQuerySchema.safeParse(request.query);
    if (!q.success) return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid query', details: q.error.issues } });

    const rows = await listKpis(org.id, q.data);
    return { kpis: rows };
  });

  app.get<{ Params: { id: string } }>('/kpis/:id', async (request, reply) => {
    const org = await getOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    try {
      return await getKpi(org.id, request.params.id);
    } catch (e) {
      if (e instanceof KpiError) return reply.status(e.httpStatus).send({ error: { code: e.code, message: e.message } });
      throw e;
    }
  });

  app.patch<{ Params: { id: string } }>('/kpis/:id', async (request, reply) => {
    if (!(await checkScope(request, reply, 'write'))) return;
    const org = await getOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const body = updateSchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid input', details: body.error.issues } });

    try {
      return await updateKpi(org.id, request.params.id, body.data);
    } catch (e) {
      if (e instanceof KpiError) return reply.status(e.httpStatus).send({ error: { code: e.code, message: e.message } });
      request.log.error(e);
      return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Failed to update KPI' } });
    }
  });

  app.delete<{ Params: { id: string } }>('/kpis/:id', async (request, reply) => {
    if (!(await checkScope(request, reply, 'write'))) return;
    const org = await getOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    try {
      return await deleteKpi(org.id, request.params.id);
    } catch (e) {
      if (e instanceof KpiError) return reply.status(e.httpStatus).send({ error: { code: e.code, message: e.message } });
      request.log.error(e);
      return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Failed to delete KPI' } });
    }
  });

  // ---- Shared KPIs ------------------------------------------------------
  const assignSchema = z.object({
    ownerEntityType: ownerTypeSchema,
    ownerExternalId: z.string().min(1).max(120),
    ownerName: z.string().max(255).nullable().optional(),
    goalValue: z.number().finite().nullable().optional(),
  });

  // POST /api/v1/kpis/:id/assign -- add another person to this KPI
  app.post<{ Params: { id: string } }>('/kpis/:id/assign', async (request, reply) => {
    if (!(await checkScope(request, reply, 'write'))) return;
    const org = await getOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const body = assignSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid input', details: body.error.issues } });
    }
    try {
      const result = await assignKpiToOwner(org.id, request.params.id, body.data, getCreatedBy(request));
      return reply.status(201).send(result);
    } catch (e) {
      if (e instanceof KpiError) return reply.status(e.httpStatus).send({ error: { code: e.code, message: e.message } });
      request.log.error(e);
      return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Failed to assign KPI' } });
    }
  });

  // POST /api/v1/kpis/:id/unshare -- remove this KPI from its shared group
  app.post<{ Params: { id: string } }>('/kpis/:id/unshare', async (request, reply) => {
    if (!(await checkScope(request, reply, 'write'))) return;
    const org = await getOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    try {
      return await unshareKpi(org.id, request.params.id);
    } catch (e) {
      if (e instanceof KpiError) return reply.status(e.httpStatus).send({ error: { code: e.code, message: e.message } });
      request.log.error(e);
      return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Failed to unshare KPI' } });
    }
  });

  // ---- Value entry ------------------------------------------------------
  // Schema lives in kpi-value-schema.ts (DB-free) so the falsy-zero
  // regression test can import it without a DATABASE_URL.

  app.post<{ Params: { id: string } }>('/kpis/:id/values', async (request, reply) => {
    if (!(await checkScope(request, reply, 'write'))) return;
    const org = await getOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const body = valueWriteSchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid input', details: body.error.issues } });

    const periodStart = new Date(body.data.periodStart);
    if (isNaN(periodStart.getTime())) {
      return reply.status(400).send({ error: { code: 'INVALID_DATE', message: 'periodStart must be a valid ISO date' } });
    }

    try {
      const source = isApiKeyAuth(request) ? 'api' : 'manual';
      const row = await writeKpiValue(
        org.id,
        request.params.id,
        { periodStart, value: body.data.value, notes: body.data.notes ?? null, source },
        getCreatedBy(request),
      );
      await emitOrgEventSafe({
        orgId: org.id, topic: 'kpi', entityType: 'kpi_value', entityId: request.params.id, action: 'value_recorded',
        actorType: source === 'api' ? 'agent' : 'user', actorId: getCreatedBy(request),
        payload: { periodStart: periodStart.toISOString(), value: body.data.value },
      });
      // If this KPI's team has a live L8 meeting, re-snapshot its frozen
      // scorecard so the value shows up on everyone's screen now -- not just on
      // the in-meeting edit path. Best-effort + cheap when no meeting is live.
      await resnapshotMeetingsForKpi(org.id, request.params.id);
      return reply.status(201).send(row);
    } catch (e) {
      if (e instanceof KpiError) return reply.status(e.httpStatus).send({ error: { code: e.code, message: e.message } });
      request.log.error(e);
      return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Failed to write value' } });
    }
  });

  app.delete<{ Params: { id: string }; Querystring: { periodStart?: string } }>(
    '/kpis/:id/values',
    async (request, reply) => {
      if (!(await checkScope(request, reply, 'write'))) return;
      const org = await getOrg(request);
      if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

      const ps = request.query.periodStart;
      if (!ps) return reply.status(400).send({ error: { code: 'INVALID_QUERY', message: 'periodStart required' } });
      const periodStart = new Date(ps);
      if (isNaN(periodStart.getTime())) {
        return reply.status(400).send({ error: { code: 'INVALID_DATE', message: 'periodStart must be a valid ISO date' } });
      }
      try {
        return await deleteKpiValue(org.id, request.params.id, periodStart);
      } catch (e) {
        if (e instanceof KpiError) return reply.status(e.httpStatus).send({ error: { code: e.code, message: e.message } });
        request.log.error(e);
        return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Failed to delete value' } });
      }
    },
  );

  // ---- Scoreboard query -------------------------------------------------
  const scoreQuerySchema = z.object({
    timeGrain: grainSchema.optional(),
    from: z.string().min(8).max(40).optional(),
    to: z.string().min(8).max(40).optional(),
    ownerEntityType: ownerTypeSchema.optional(),
    ownerExternalId: z.string().max(120).optional(),
    groupName: z.string().max(120).optional(),
  });

  // Force-recompute every period for a formula KPI. Useful after a bulk
  // import or to clear stale computed values.
  app.post<{ Params: { id: string } }>('/kpis/:id/recompute', async (request, reply) => {
    if (!(await checkScope(request, reply, 'write'))) return;
    const org = await getOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    try {
      await recomputeKpi(org.id, request.params.id);
      return { ok: true };
    } catch (e) {
      if (e instanceof KpiError) return reply.status(e.httpStatus).send({ error: { code: e.code, message: e.message } });
      request.log.error(e);
      return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Failed to recompute' } });
    }
  });

  // ---- OOS publish (Phase 8) -------------------------------------------
  // Load-bearing writes -> super-admin gate, mirrors Operating Plan push.
  app.post<{ Params: { id: string } }>('/kpis/:id/publish', async (request, reply) => {
    if (!isSuperAdmin(request as any)) {
      return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Publishing KPIs to OOS requires super-admin authorization (load-bearing write).' } });
    }
    const org = await getOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    try {
      const result = await publishKpiToOos(org.id, request.params.id);
      return result;
    } catch (e) {
      if (e instanceof KpiPublishError) return reply.status(e.httpStatus).send({ error: { code: e.code, message: e.message } });
      request.log.error(e);
      return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Failed to publish KPI' } });
    }
  });

  app.post<{ Params: { id: string } }>('/kpis/:id/unpublish', async (request, reply) => {
    if (!isSuperAdmin(request as any)) {
      return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Removing KPI claims from OOS requires super-admin authorization.' } });
    }
    const org = await getOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    try {
      return await unpublishKpiFromOos(org.id, request.params.id);
    } catch (e) {
      if (e instanceof KpiPublishError) return reply.status(e.httpStatus).send({ error: { code: e.code, message: e.message } });
      request.log.error(e);
      return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Failed to unpublish KPI' } });
    }
  });

  app.post('/kpis/publish-all', async (request, reply) => {
    if (!isSuperAdmin(request as any)) {
      return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Publishing all KPIs requires super-admin authorization.' } });
    }
    const org = await getOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    try {
      return await publishAllKpisForOrg(org.id);
    } catch (e) {
      request.log.error(e);
      return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'publish-all failed' } });
    }
  });

  app.get('/kpis/scoreboard', async (request, reply) => {
    const org = await getOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const q = scoreQuerySchema.safeParse(request.query);
    if (!q.success) return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid query', details: q.error.issues } });

    const grain = q.data.timeGrain ?? 'weekly';
    const now = new Date();
    let from = q.data.from ? new Date(q.data.from) : new Date(now);
    let to = q.data.to ? new Date(q.data.to) : new Date(now);
    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      return reply.status(400).send({ error: { code: 'INVALID_DATE', message: 'from/to must be valid ISO dates' } });
    }
    // Default range: last 13 weeks (matches Ninety scorecard default)
    if (!q.data.from) from = new Date(now.getTime() - 13 * 7 * 86400000);

    const data = await getScoreboard(org.id, {
      timeGrain: grain,
      from,
      to,
      ownerEntityType: q.data.ownerEntityType,
      ownerExternalId: q.data.ownerExternalId,
      groupName: q.data.groupName,
    });
    return data;
  });
}
