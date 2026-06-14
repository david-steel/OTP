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
  ComposioError,
} from '../../services/composio.js';

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

  // ---- CONNECT (start OAuth) ----
  app.post<{ Params: { provider: string } }>('/integrations/:provider/connect', async (request, reply) => {
    const ctx = await getMemberOrg(request);
    if (!ctx) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in to connect integrations' } });
    if (!composioConfigured()) return reply.status(503).send({ error: { code: 'NOT_CONFIGURED', message: 'Integrations are not configured yet.' } });

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
}
