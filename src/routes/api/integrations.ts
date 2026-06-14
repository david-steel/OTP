/**
 * Integrations API (Composio connection lifecycle) -- Inc 1.
 *
 * GET    /integrations                     -- list this org's connections
 * POST   /integrations/:provider/connect   -- start OAuth: returns a consent URL
 * POST   /integrations/:provider/sync      -- refresh status from Composio
 * DELETE /integrations/:provider           -- revoke + forget the connection
 *
 * Every route is org-scoped (user_id == orgId in Composio) and gated by the
 * INTEGRATIONS_ENABLED master flag: while OFF, the whole surface 404s so the
 * branch can ship dark. A provider is only connectable when its platform
 * auth_config id is present (COMPOSIO_AUTHCFG_<SLUG>). We store only a reference
 * to the Composio-vaulted token -- never a secret. Read-only is enforced on the
 * Composio auth_config (e.g. spreadsheets.readonly), proven 2026-06-13.
 *
 * Auth mirrors schedules.ts getMemberOrg: Clerk org member only, no demo.
 */
import type { FastifyInstance, FastifyRequest } from 'fastify';
import { getAuth } from '@clerk/fastify';
import { sql, eq } from 'drizzle-orm';
import { db } from '../../config/database.js';
import { organizations } from '../../db/schema.js';
import { resolveOrgForUser } from '../../services/membership.js';
import {
  integrationsEnabled,
  authConfigIdFor,
  providerBySlug,
  isConnectable,
} from '../../shared/integrations-catalog.js';
import {
  composioConfigured,
  createConnectLink,
  findConnection,
  deleteConnection,
  listToolkits,
  ComposioError,
} from '../../services/composio.js';
import { z } from 'zod';
import { KpiError } from '../../services/kpi.js';
import { isBillingLive, canRunLive } from '../../services/integration-live-gate.js';
import {
  upsertKpiSource,
  getKpiSource,
  deleteKpiSource,
  refreshKpiSource,
  KpiSourceError,
} from '../../services/kpi-source-puller.js';

const extractSchema = z.object({
  mode: z.enum(['cell', 'sum_column', 'count_rows', 'sum_column_since']),
  row: z.number().int().optional(),
  column: z.number().int().optional(),
  skip_header: z.boolean().optional(),
  nonempty_column: z.number().int().optional(),
  date_column: z.number().int().optional(),
  value_column: z.number().int().optional(),
  since: z.string().max(60).optional(),
}).passthrough();

const kpiSourceSchema = z.object({
  connectionId: z.string().min(1).max(120),
  action: z.string().min(1).max(160),
  params: z.record(z.unknown()).default({}),
  extract: extractSchema,
  cadence: z.string().max(120).nullish(),
});

/** Map a thrown error to {status, code, message} for the KPI-source routes. */
function kpiSourceErr(e: unknown): { status: number; code: string; message: string } {
  if (e instanceof KpiSourceError) return { status: e.httpStatus, code: e.code, message: e.message };
  if (e instanceof KpiError) return { status: e.httpStatus, code: e.code, message: e.message };
  return { status: 500, code: 'INTERNAL_ERROR', message: 'KPI source operation failed' };
}

async function getMemberOrg(
  request: FastifyRequest,
): Promise<{ org: { id: string; name: string | null }; userId: string } | null> {
  const auth = getAuth(request);
  if (!auth.userId) return null;
  const resolved = await resolveOrgForUser((request as any).impersonation?.as || auth.userId);
  if (resolved) return { org: resolved.org, userId: auth.userId };
  const [legacy] = await db.select().from(organizations).where(eq(organizations.clerkOrgId, auth.userId)).limit(1);
  if (!legacy) return null;
  return { org: legacy, userId: auth.userId };
}

function mapComposioStatus(s: string | undefined): 'pending' | 'active' | 'error' | 'revoked' {
  const v = (s || '').toUpperCase();
  if (v === 'ACTIVE') return 'active';
  if (v === 'FAILED' || v === 'ERROR' || v === 'EXPIRED') return 'error';
  if (v === 'DELETED' || v === 'REVOKED') return 'revoked';
  return 'pending';
}

export default async function integrationRoutes(app: FastifyInstance) {
  // All routes hidden while the flag is OFF.
  app.addHook('onRequest', async (request, reply) => {
    if (!integrationsEnabled()) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Integrations are not enabled' } });
    }
  });

  // ---- LIST ----
  app.get('/integrations', async (request, reply) => {
    const ctx = await getMemberOrg(request);
    if (!ctx) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in to view integrations' } });

    const rows = (await db.execute(sql`
      SELECT provider, status, label, composio_connection_id, connected_by_user_id, last_used_at, updated_at
      FROM integration_connections
      WHERE org_id = ${ctx.org.id}
      ORDER BY updated_at DESC
    `)).rows;
    return reply.send({ connections: rows });
  });

  // ---- STATUS: the live-gate state for this org (drives the UI banner) ----
  app.get('/integrations/status', async (request, reply) => {
    const ctx = await getMemberOrg(request);
    if (!ctx) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in' } });
    const gate = await canRunLive(ctx.org.id);
    return reply.send({
      billingLive: isBillingLive(),
      live: gate.ok,
      reason: gate.reason,
      message: gate.message,
      balanceCents: gate.balanceCents,
      floorCents: gate.floorCents,
    });
  });

  // ---- CATALOG: ALL Composio apps, searchable (?search=). connectable = an ----
  // auth_config is configured for that provider (COMPOSIO_AUTHCFG_<slug>).
  app.get('/integrations/catalog', async (request, reply) => {
    const ctx = await getMemberOrg(request);
    if (!ctx) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in' } });
    const search = String((request.query as any)?.search || '').slice(0, 80);
    const toolkits = await listToolkits(search);
    const items = toolkits.map((t) => ({ ...t, connectable: authConfigIdFor(t.slug) !== null }));
    return reply.send({ items, query: search });
  });

  // ---- CONNECT (start OAuth) ----
  app.post<{ Params: { provider: string } }>('/integrations/:provider/connect', async (request, reply) => {
    const ctx = await getMemberOrg(request);
    if (!ctx) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in to connect integrations' } });
    if (!composioConfigured()) return reply.status(503).send({ error: { code: 'NOT_CONFIGURED', message: 'Integrations are not configured yet.' } });
    if (!isBillingLive()) return reply.status(402).send({ error: { code: 'BILLING_NOT_LIVE', message: 'Integrations activate once billing is live.' } });

    const provider = request.params.provider;
    if (!providerBySlug(provider)) return reply.status(404).send({ error: { code: 'UNKNOWN_PROVIDER', message: 'No such integration' } });
    if (!isConnectable(provider)) return reply.status(409).send({ error: { code: 'NOT_CONNECTABLE', message: 'This integration is coming soon.' } });

    const authConfigId = authConfigIdFor(provider)!; // non-null: isConnectable checked it
    try {
      const link = await createConnectLink(authConfigId, ctx.org.id);
      await db.execute(sql`
        INSERT INTO integration_connections
          (org_id, provider, composio_auth_config_id, composio_connection_id, status, connected_by_user_id, updated_at)
        VALUES (${ctx.org.id}, ${provider}, ${authConfigId}, ${link.connectionId}, 'pending', ${ctx.userId}, now())
        ON CONFLICT (org_id, provider) DO UPDATE SET
          composio_auth_config_id = EXCLUDED.composio_auth_config_id,
          composio_connection_id  = EXCLUDED.composio_connection_id,
          status = 'pending',
          last_error = NULL,
          connected_by_user_id = EXCLUDED.connected_by_user_id,
          updated_at = now()
      `);
      return reply.send({ redirectUrl: link.redirectUrl });
    } catch (e) {
      const status = e instanceof ComposioError ? e.status : 502;
      return reply.status(status >= 400 && status < 600 ? status : 502)
        .send({ error: { code: 'COMPOSIO_ERROR', message: e instanceof Error ? e.message : 'Connect failed' } });
    }
  });

  // ---- SYNC (refresh status after the user returns from OAuth) ----
  app.post<{ Params: { provider: string } }>('/integrations/:provider/sync', async (request, reply) => {
    const ctx = await getMemberOrg(request);
    if (!ctx) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in' } });

    const provider = request.params.provider;
    const authConfigId = authConfigIdFor(provider);
    if (!authConfigId) return reply.status(409).send({ error: { code: 'NOT_CONNECTABLE', message: 'Coming soon' } });

    try {
      const conn = await findConnection(authConfigId, ctx.org.id);
      const status = mapComposioStatus(conn?.status);
      await db.execute(sql`
        UPDATE integration_connections
        SET status = ${status}, composio_connection_id = COALESCE(${conn?.id || null}, composio_connection_id), updated_at = now()
        WHERE org_id = ${ctx.org.id} AND provider = ${provider}
      `);
      return reply.send({ status, connected: status === 'active' });
    } catch (e) {
      const code = e instanceof ComposioError ? e.status : 502;
      return reply.status(code >= 400 && code < 600 ? code : 502)
        .send({ error: { code: 'COMPOSIO_ERROR', message: e instanceof Error ? e.message : 'Sync failed' } });
    }
  });

  // ---- DISCONNECT ----
  app.delete<{ Params: { provider: string } }>('/integrations/:provider', async (request, reply) => {
    const ctx = await getMemberOrg(request);
    if (!ctx) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in' } });

    const provider = request.params.provider;
    const [row] = (await db.execute(sql`
      SELECT composio_connection_id FROM integration_connections
      WHERE org_id = ${ctx.org.id} AND provider = ${provider} LIMIT 1
    `)).rows as Array<{ composio_connection_id: string | null }>;
    if (!row) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'No such connection' } });

    try {
      if (row.composio_connection_id) await deleteConnection(row.composio_connection_id);
    } catch (e) {
      // Log-and-continue: if Composio already lost it, we still forget locally.
      request.log.warn({ err: e }, 'composio deleteConnection failed during disconnect');
    }
    await db.execute(sql`
      DELETE FROM integration_connections WHERE org_id = ${ctx.org.id} AND provider = ${provider}
    `);
    return reply.send({ disconnected: true });
  });

  // ===== KPI sources: map a scorecard KPI to a connected tool (Inc 4) =====

  // GET the source mapping for a KPI (null if none).
  app.get<{ Params: { id: string } }>('/kpis/:id/source', async (request, reply) => {
    const ctx = await getMemberOrg(request);
    if (!ctx) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in' } });
    const source = await getKpiSource(ctx.org.id, request.params.id);
    return reply.send({ source });
  });

  // PUT (create/replace) the source mapping for a KPI.
  app.put<{ Params: { id: string }; Body: unknown }>('/kpis/:id/source', async (request, reply) => {
    const ctx = await getMemberOrg(request);
    if (!ctx) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in' } });
    if (!composioConfigured()) return reply.status(503).send({ error: { code: 'NOT_CONFIGURED', message: 'Integrations are not configured yet.' } });
    if (!isBillingLive()) return reply.status(402).send({ error: { code: 'BILLING_NOT_LIVE', message: 'Integrations activate once billing is live.' } });

    const parsed = kpiSourceSchema.safeParse(request.body || {});
    if (!parsed.success) return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid source mapping' } });

    try {
      const row = await upsertKpiSource(
        ctx.org.id, request.params.id,
        { connectionId: parsed.data.connectionId, action: parsed.data.action, params: parsed.data.params, extract: parsed.data.extract as any, cadence: parsed.data.cadence ?? null },
        ctx.userId,
      );
      return reply.status(201).send({ source: row });
    } catch (e) {
      const m = kpiSourceErr(e);
      return reply.status(m.status).send({ error: { code: m.code, message: m.message } });
    }
  });

  // DELETE the source mapping (the KPI keeps its recorded values).
  app.delete<{ Params: { id: string } }>('/kpis/:id/source', async (request, reply) => {
    const ctx = await getMemberOrg(request);
    if (!ctx) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in' } });
    const removed = await deleteKpiSource(ctx.org.id, request.params.id);
    if (!removed) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'No source on this KPI' } });
    return reply.send({ deleted: true });
  });

  // POST refresh: pull the mapped source now and write the value to the scorecard.
  app.post<{ Params: { id: string } }>('/kpis/:id/source/refresh', async (request, reply) => {
    const ctx = await getMemberOrg(request);
    if (!ctx) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in' } });
    if (!composioConfigured()) return reply.status(503).send({ error: { code: 'NOT_CONFIGURED', message: 'Integrations are not configured yet.' } });
    try {
      const result = await refreshKpiSource(ctx.org.id, request.params.id);
      return reply.send(result);
    } catch (e) {
      const m = kpiSourceErr(e);
      return reply.status(m.status).send({ error: { code: m.code, message: m.message } });
    }
  });
}
