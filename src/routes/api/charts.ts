// Charts API -- multi-chart support for orger-next Phase C.
//
// GET    /api/v1/team/charts          list charts for the caller's org
// POST   /api/v1/team/charts          create a new chart (name, optional from-template)
// PATCH  /api/v1/team/charts/:id      rename a chart, toggle is_primary
// DELETE /api/v1/team/charts/:id      delete a non-primary chart (and all its oos_files)
//
// Auth: Clerk session, API key (write scope for mutations), or service auth.
// Same auth pipeline as team.ts -- relies on getOrg() to resolve the caller's
// org and on checkScope() for API-key scope gating.

import type { FastifyInstance, FastifyRequest } from 'fastify';
import { getAuth } from '@clerk/fastify';
import { z } from 'zod';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../../config/database.js';
import { charts, organizations, oosFiles } from '../../db/schema.js';
import { resolveApiKey, requireScope } from '../../middleware/api-key-auth.js';
import { getAuthOrg } from '../../middleware/auth-helpers.js';
import { resolveOrgForUser, resolveOrgForRequest } from '../../services/membership.js';

async function getOrg(request: FastifyRequest) {
  const auth = getAuth(request);
  if (auth.userId) {
    const resolved = await resolveOrgForRequest(request);
    if (resolved) return resolved.org;
    const [row] = await db.select().from(organizations).where(eq(organizations.clerkOrgId, auth.userId)).limit(1);
    return row || null;
  }
  return await getAuthOrg(request);
}

async function checkScope(request: FastifyRequest, reply: any, requiredScope: string): Promise<boolean> {
  const auth = getAuth(request);
  if (auth.userId) return true;
  if ((request as any).serviceAuth) return true;
  const apiKeyCtx = await resolveApiKey(request);
  if (apiKeyCtx && !requireScope(apiKeyCtx, requiredScope)) {
    reply.status(403).send({ error: { code: 'INSUFFICIENT_SCOPE', message: `API key requires '${requiredScope}' scope` } });
    return false;
  }
  return true;
}

export default async function chartRoutes(app: FastifyInstance) {
  // ============================================================
  // GET /api/v1/team/charts -- list charts for the caller's org
  // ============================================================
  app.get('/team/charts', async (request, reply) => {
    const org = await getOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const rows = await db.select({
      id: charts.id,
      name: charts.name,
      isPrimary: charts.isPrimary,
      shareToken: charts.shareToken,
      createdAt: charts.createdAt,
      updatedAt: charts.updatedAt,
    }).from(charts)
      .where(eq(charts.orgId, org.id))
      .orderBy(desc(charts.isPrimary), desc(charts.updatedAt));

    return { count: rows.length, charts: rows };
  });

  // ============================================================
  // POST /api/v1/team/charts -- create a new chart
  // ============================================================
  // Creates a chart with no OOS file. The first time someone edits a tile
  // in it, getOrCreateEditableDraftForChart throws NO_OOS until they seed
  // the chart with at least one published OOS. This matches OTP's own flow.
  app.post('/team/charts', async (request, reply) => {
    if (!(await checkScope(request, reply, 'write'))) return;
    const org = await getOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const schema = z.object({
      name: z.string().min(1).max(255),
      makePrimary: z.boolean().optional().default(false),
    });
    const body = schema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid input', details: body.error.issues } });
    }

    const auth = getAuth(request);
    const createdBy =
      auth.userId ||
      (request as any).serviceAuth?.actAsClerkUserId ||
      null;

    // If makePrimary, demote the existing primary in the same transaction so
    // the partial unique index on (org_id) WHERE is_primary stays satisfied.
    const result = await db.transaction(async (tx) => {
      if (body.data.makePrimary) {
        await tx.update(charts)
          .set({ isPrimary: false, updatedAt: new Date() })
          .where(and(eq(charts.orgId, org.id), eq(charts.isPrimary, true)));
      }
      const [created] = await tx.insert(charts).values({
        orgId: org.id,
        name: body.data.name.trim(),
        isPrimary: body.data.makePrimary,
        createdByClerkUserId: createdBy,
      }).returning();
      return created;
    });

    return reply.status(201).send(result);
  });

  // ============================================================
  // PATCH /api/v1/team/charts/:id -- rename + toggle primary
  // ============================================================
  app.patch<{ Params: { id: string } }>('/team/charts/:id', async (request, reply) => {
    if (!(await checkScope(request, reply, 'write'))) return;
    const org = await getOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const { id } = request.params;
    if (!/^[0-9a-f-]{36}$/i.test(id)) {
      return reply.status(400).send({ error: { code: 'INVALID_CHART_ID', message: 'chart id must be a UUID' } });
    }

    const schema = z.object({
      name: z.string().min(1).max(255).optional(),
      makePrimary: z.boolean().optional(),
    }).refine(d => d.name !== undefined || d.makePrimary !== undefined, {
      message: 'patch must include name or makePrimary',
    });
    const body = schema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid input', details: body.error.issues } });
    }

    // Ownership check: the chart must belong to the caller's org.
    const [existing] = await db.select().from(charts)
      .where(and(eq(charts.id, id), eq(charts.orgId, org.id))).limit(1);
    if (!existing) {
      return reply.status(404).send({ error: { code: 'CHART_NOT_FOUND', message: 'Chart not found in your org' } });
    }

    const updated = await db.transaction(async (tx) => {
      if (body.data.makePrimary === true && !existing.isPrimary) {
        await tx.update(charts)
          .set({ isPrimary: false, updatedAt: new Date() })
          .where(and(eq(charts.orgId, org.id), eq(charts.isPrimary, true)));
      }
      const updates: Record<string, unknown> = { updatedAt: new Date() };
      if (body.data.name !== undefined) updates.name = body.data.name.trim();
      if (body.data.makePrimary !== undefined) updates.isPrimary = body.data.makePrimary;
      const [row] = await tx.update(charts)
        .set(updates)
        .where(and(eq(charts.id, id), eq(charts.orgId, org.id)))
        .returning();
      return row;
    });

    return updated;
  });

  // ============================================================
  // DELETE /api/v1/team/charts/:id -- delete a non-primary chart
  // ============================================================
  // Cascades to all oos_files attached to this chart via the FK ON DELETE
  // CASCADE. The primary chart can never be deleted -- it's the org's
  // back-compat root, and OTP's /dashboard/team still expects it to exist.
  app.delete<{ Params: { id: string } }>('/team/charts/:id', async (request, reply) => {
    if (!(await checkScope(request, reply, 'write'))) return;
    const org = await getOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const { id } = request.params;
    if (!/^[0-9a-f-]{36}$/i.test(id)) {
      return reply.status(400).send({ error: { code: 'INVALID_CHART_ID', message: 'chart id must be a UUID' } });
    }

    const [existing] = await db.select().from(charts)
      .where(and(eq(charts.id, id), eq(charts.orgId, org.id))).limit(1);
    if (!existing) {
      return reply.status(404).send({ error: { code: 'CHART_NOT_FOUND', message: 'Chart not found in your org' } });
    }
    if (existing.isPrimary) {
      return reply.status(400).send({ error: { code: 'CANNOT_DELETE_PRIMARY', message: 'Cannot delete the primary chart. Mark another as primary first.' } });
    }

    // Count attached oos_files so the response tells the caller what just got
    // cascaded away (auditable, no surprises).
    const attached = await db.select({ id: oosFiles.id }).from(oosFiles).where(eq(oosFiles.chartId, id));
    await db.delete(charts).where(and(eq(charts.id, id), eq(charts.orgId, org.id)));

    return { ok: true, deletedChartId: id, deletedOosFiles: attached.length };
  });
}
