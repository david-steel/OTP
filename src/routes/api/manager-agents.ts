/**
 * Manager Agents API.
 *
 * POST   /api/v1/manager-agents              upload an agent (multipart or JSON body with raw_md)
 * GET    /api/v1/manager-agents              list mine
 * GET    /api/v1/manager-agents/:id          get one (authoring user only)
 * PUT    /api/v1/manager-agents/:id          update raw_md / kpis / score
 * DELETE /api/v1/manager-agents/:id          soft-delete
 * POST   /api/v1/manager-agents/:id/score    trigger a (light) re-score
 *
 * Score is 0-8, Bassim-style. v1 uses a deterministic local score:
 *   - +2 if MCP is connected (any active api_key for the org used in 7d)
 *   - +2 if at least one KPI is declared on the agent
 *   - +1 per agent_run in the last 30 days, capped at 3
 *   - +1 if a description is present
 * The dashboard surfaces this score and the breakdown JSON.
 */
import type { FastifyInstance } from 'fastify';
import { getAuth } from '@clerk/fastify';
import { eq, and, isNull, desc, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../config/database.js';
import {
  managerAgents,
  organizations,
  orgMembers,
  apiKeys,
  auditLogs,
} from '../../db/schema.js';
import { resolveOrgForUser } from '../../services/membership.js';
import { createAuditEntry } from '../../services/audit-logger.js';
import { requireUuidParam } from '../../shared/param-validation.js';
import { createRateLimiter } from '../../shared/rate-limiter.js';

const rl = createRateLimiter({ windowMs: 60_000, maxRequests: 30 });

const createSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  externalId: z.string().max(120).optional(),
  rawMd: z.string().min(1).max(200_000),
  kpis: z.array(z.object({
    title: z.string().max(255),
    goal: z.string().max(120).optional(),
    unit: z.string().max(40).optional(),
  })).optional().default([]),
});

const updateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  externalId: z.string().max(120).optional(),
  rawMd: z.string().min(1).max(200_000).optional(),
  kpis: z.array(z.any()).optional(),
});

async function authedCtx(request: any, reply: any) {
  const auth = getAuth(request);
  if (!auth.userId) {
    reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in' } });
    return null;
  }
  const resolved = await resolveOrgForUser(auth.userId);
  if (!resolved) {
    const [legacy] = await db.select().from(organizations).where(eq(organizations.clerkOrgId, auth.userId)).limit(1);
    if (legacy) return { userId: auth.userId, org: legacy, memberId: null as string | null };
    reply.status(404).send({ error: { code: 'NO_ORG', message: 'No org for current user' } });
    return null;
  }
  const [m] = await db.select({ id: orgMembers.id })
    .from(orgMembers)
    .where(and(eq(orgMembers.orgId, resolved.org.id), eq(orgMembers.clerkUserId, auth.userId)))
    .limit(1);
  return { userId: auth.userId, org: resolved.org, memberId: m?.id || null };
}

/**
 * Parse minimal frontmatter and a name guess from raw markdown.
 * Looks for YAML frontmatter delimited by --- ... --- and the first H1.
 * Best-effort; never throws.
 */
function parseAgentMd(raw: string, fallbackName: string | undefined): {
  name: string;
  description: string | null;
  frontmatter: Record<string, unknown>;
} {
  let frontmatter: Record<string, unknown> = {};
  let body = raw;
  const fm = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (fm) {
    const [, yamlText, rest] = fm;
    body = rest;
    for (const line of yamlText.split('\n')) {
      const m = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.+?)\s*$/);
      if (m) {
        const [, key, val] = m;
        frontmatter[key] = val.replace(/^["']|["']$/g, '');
      }
    }
  }
  let name = fallbackName || (frontmatter.name as string | undefined) || '';
  if (!name) {
    const h1 = body.match(/^#\s+(.+?)\s*$/m);
    if (h1) name = h1[1].trim();
  }
  if (!name) name = 'Untitled Agent';

  const desc =
    (frontmatter.description as string | undefined) ||
    (body.split('\n').find(l => l.trim().length > 0 && !l.startsWith('#')) || '').trim() ||
    null;

  return { name, description: desc, frontmatter };
}

async function computeScore(orgId: string, agentId: string): Promise<{
  score: number;
  breakdown: Record<string, number>;
  mcpConnectedAt: Date | null;
  lastRunAt: Date | null;
  runCount: number;
}> {
  const [agent] = await db.select().from(managerAgents).where(eq(managerAgents.id, agentId)).limit(1);
  if (!agent) return { score: 0, breakdown: {}, mcpConnectedAt: null, lastRunAt: null, runCount: 0 };

  // MCP: any api_key on this org that was used in the last 7 days.
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentKeys = await db.select().from(apiKeys)
    .where(and(eq(apiKeys.orgId, orgId), isNull(apiKeys.revokedAt)))
    .limit(50);
  const mcpKey = recentKeys.find(k => k.lastUsedAt && k.lastUsedAt >= sevenDaysAgo);
  const mcpConnectedAt = mcpKey?.lastUsedAt || null;

  // Recent runs from agent_runs keyed on external_id (if set).
  let runCount = 0;
  let lastRunAt: Date | null = null;
  if (agent.externalId) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const r = await db.execute<{ count: number; last_run: Date | null }>(sql`
      SELECT COUNT(*)::int AS count, MAX(created_at) AS last_run
      FROM agent_runs
      WHERE org_id = ${orgId}
        AND agent_external_id = ${agent.externalId}
        AND created_at >= ${thirtyDaysAgo}
    `);
    const row = (r.rows && r.rows[0]) || (Array.isArray(r) ? (r as any)[0] : null);
    if (row) {
      runCount = Number(row.count) || 0;
      lastRunAt = row.last_run ? new Date(row.last_run) : null;
    }
  }

  const breakdown: Record<string, number> = {
    mcp_connected: mcpConnectedAt ? 2 : 0,
    has_kpis: Array.isArray(agent.kpis) && (agent.kpis as unknown[]).length > 0 ? 2 : 0,
    recent_runs: Math.min(3, runCount),
    has_description: agent.description && agent.description.length > 0 ? 1 : 0,
  };
  const score = Object.values(breakdown).reduce((a, b) => a + b, 0);
  return { score, breakdown, mcpConnectedAt, lastRunAt, runCount };
}

export default async function managerAgentRoutes(app: FastifyInstance) {
  // POST /api/v1/manager-agents
  app.post('/manager-agents', async (request, reply) => {
    if (!rl(request.ip)) return reply.status(429).send({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } });
    const ctx = await authedCtx(request, reply);
    if (!ctx) return;

    const body = createSchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid agent', details: body.error.issues } });

    const parsed = parseAgentMd(body.data.rawMd, body.data.name);
    const externalId = body.data.externalId
      || parsed.name.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 120);

    const [created] = await db.insert(managerAgents).values({
      orgId: ctx.org.id,
      ownerUserId: ctx.userId,
      ownerMemberId: ctx.memberId,
      name: parsed.name,
      externalId,
      description: parsed.description,
      rawMd: body.data.rawMd,
      frontmatter: parsed.frontmatter,
      kpis: body.data.kpis,
    }).returning();

    // Score immediately so the dashboard renders something useful.
    const s = await computeScore(ctx.org.id, created.id);
    await db.update(managerAgents).set({
      score: s.score,
      scoreBreakdown: s.breakdown,
      mcpConnectedAt: s.mcpConnectedAt,
      lastRunAt: s.lastRunAt,
      runCount: s.runCount,
      updatedAt: new Date(),
    }).where(eq(managerAgents.id, created.id));

    await db.insert(auditLogs).values(createAuditEntry('manager_agent.created', 'manager_agent', {
      orgId: ctx.org.id, entityId: created.id, details: { name: parsed.name, externalId },
    }));

    return reply.status(201).send({ agent: { ...created, score: s.score, scoreBreakdown: s.breakdown } });
  });

  // GET /api/v1/manager-agents
  app.get('/manager-agents', async (request, reply) => {
    const ctx = await authedCtx(request, reply);
    if (!ctx) return;
    const rows = await db.select().from(managerAgents)
      .where(and(
        eq(managerAgents.orgId, ctx.org.id),
        eq(managerAgents.ownerUserId, ctx.userId),
        isNull(managerAgents.deletedAt),
      ))
      .orderBy(desc(managerAgents.updatedAt));
    return { agents: rows, total: rows.length };
  });

  // GET /api/v1/manager-agents/:id
  app.get<{ Params: { id: string } }>('/manager-agents/:id', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    const ctx = await authedCtx(request, reply);
    if (!ctx) return;
    const [row] = await db.select().from(managerAgents)
      .where(and(
        eq(managerAgents.id, id),
        eq(managerAgents.orgId, ctx.org.id),
        eq(managerAgents.ownerUserId, ctx.userId),
        isNull(managerAgents.deletedAt),
      ))
      .limit(1);
    if (!row) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Agent not found' } });
    return { agent: row };
  });

  // PUT /api/v1/manager-agents/:id
  app.put<{ Params: { id: string } }>('/manager-agents/:id', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    const ctx = await authedCtx(request, reply);
    if (!ctx) return;
    const body = updateSchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid update', details: body.error.issues } });

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    const d = body.data;
    if (d.name !== undefined) updates.name = d.name;
    if (d.externalId !== undefined) updates.externalId = d.externalId;
    if (d.kpis !== undefined) updates.kpis = d.kpis;
    if (d.rawMd !== undefined) {
      const parsed = parseAgentMd(d.rawMd, d.name);
      updates.rawMd = d.rawMd;
      updates.frontmatter = parsed.frontmatter;
      if (d.name === undefined) updates.name = parsed.name;
      updates.description = parsed.description;
    }

    const [updated] = await db.update(managerAgents).set(updates)
      .where(and(
        eq(managerAgents.id, id),
        eq(managerAgents.orgId, ctx.org.id),
        eq(managerAgents.ownerUserId, ctx.userId),
      ))
      .returning();
    if (!updated) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Agent not found' } });

    return { agent: updated };
  });

  // DELETE /api/v1/manager-agents/:id  (soft)
  app.delete<{ Params: { id: string } }>('/manager-agents/:id', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    const ctx = await authedCtx(request, reply);
    if (!ctx) return;
    const [deleted] = await db.update(managerAgents)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(
        eq(managerAgents.id, id),
        eq(managerAgents.orgId, ctx.org.id),
        eq(managerAgents.ownerUserId, ctx.userId),
      ))
      .returning();
    if (!deleted) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Agent not found' } });
    return { ok: true };
  });

  // POST /api/v1/manager-agents/:id/score
  app.post<{ Params: { id: string } }>('/manager-agents/:id/score', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    const ctx = await authedCtx(request, reply);
    if (!ctx) return;
    const [agent] = await db.select().from(managerAgents)
      .where(and(eq(managerAgents.id, id), eq(managerAgents.orgId, ctx.org.id), eq(managerAgents.ownerUserId, ctx.userId)))
      .limit(1);
    if (!agent) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Agent not found' } });

    const s = await computeScore(ctx.org.id, id);
    const [updated] = await db.update(managerAgents).set({
      score: s.score,
      scoreBreakdown: s.breakdown,
      mcpConnectedAt: s.mcpConnectedAt,
      lastRunAt: s.lastRunAt,
      runCount: s.runCount,
      updatedAt: new Date(),
    }).where(eq(managerAgents.id, id)).returning();
    return { agent: updated };
  });
}
