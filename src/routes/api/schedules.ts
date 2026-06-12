/**
 * Schedule CRUD API (Processes Phase 2b -- autonomous scheduling).
 *
 * POST   /api/v1/agents/:externalId/schedules   -- create a schedule for a SOP
 * GET    /api/v1/agents/:externalId/schedules   -- list the agent's schedules
 * PATCH  /api/v1/schedules/:id                  -- enable/disable / change cadence
 * DELETE /api/v1/schedules/:id                  -- delete a schedule
 *
 * Every route is org-scoped: a schedule is only ever read/written when its
 * org_id matches the caller's resolved org. We NEVER touch another org's row.
 *
 * Auth: Clerk org member only. The secret-gated DEMO session may NOT create
 * schedules -- scheduling spends money on autopilot and is a real-customer
 * feature, so the demo org is blocked at the door (reads + writes).
 *
 * Writes (create / enable / edit cadence / delete) additionally require an
 * edit-capable role for the OWNING SEAT, reusing computeEditableTiles -- the
 * SAME gate /processes and /dashboard/team use, so a viewer can never schedule a
 * SOP on a seat outside their scope.
 *
 * SAFETY: create + enable run through the schedule gate (funded wallet + active
 * API key). The gate is RE-CHECKED at fire time by the runner. Even after a
 * schedule exists and is enabled, NOTHING fires unless the master kill switch
 * AGENT_SCHEDULER_ENABLED is truthy -- this route can ship and work while the
 * poller stays dormant.
 */
import type { FastifyInstance, FastifyRequest } from 'fastify';
import { getAuth } from '@clerk/fastify';
import { z } from 'zod';
import { sql } from 'drizzle-orm';
import { db } from '../../config/database.js';
import { organizations } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { resolveOrgForUser } from '../../services/membership.js';
import { getOrgTeamGraph } from '../../services/team-graph.js';
import { computeEditableTiles } from '../../services/chart-permissions.js';
import { resolveSopFromNode } from './agents.js';
import { canSchedule } from '../../services/schedule-gate.js';
import { cadenceToCron, nextRunAt, type Cadence } from '../../shared/schedule-cadence.js';

function validExternalId(id: string): boolean {
  return /^[A-Z0-9_-]{1,120}$/i.test(id);
}

function validUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

/**
 * Resolve the caller's org via Clerk ONLY (no demo). Schedules are a real-
 * customer feature: a no-Clerk demo visitor gets null -> 401. Returns the org
 * plus the viewer's role + claimed seat so we can run the edit-tile gate.
 */
async function getMemberOrg(request: FastifyRequest): Promise<
  | { org: { id: string; name: string | null }; role: string; claimedEntityId: string | null; viewerMember: unknown }
  | null
> {
  const auth = getAuth(request);
  if (!auth.userId) return null;
  const resolved = await resolveOrgForUser((request as any).impersonation?.as || auth.userId);
  if (resolved) {
    const viewerMember = (request as any).orgMember || {
      role: resolved.role,
      claimedEntityId: resolved.claimedEntityId || null,
    };
    return { org: resolved.org, role: resolved.role, claimedEntityId: resolved.claimedEntityId || null, viewerMember };
  }
  // Legacy founder fallback (no org_members row): org keyed by clerkOrgId.
  const [legacy] = await db.select().from(organizations).where(eq(organizations.clerkOrgId, auth.userId)).limit(1);
  if (!legacy) return null;
  return { org: legacy, role: 'owner', claimedEntityId: null, viewerMember: { role: 'owner', claimedEntityId: null } };
}

/** Map a gate reason to an HTTP status + client message. */
function gateError(reason: string | undefined): { status: number; code: string; message: string } {
  if (reason === 'NO_WALLET') {
    return { status: 402, code: 'NO_WALLET', message: 'Scheduling needs a funded wallet. Add funds in Billing to enable autonomous runs.' };
  }
  if (reason === 'NO_API_KEY') {
    return { status: 403, code: 'NO_API_KEY', message: 'Scheduling needs an active API key. Create one in API settings to enable autonomous runs.' };
  }
  return { status: 403, code: 'SCHEDULE_BLOCKED', message: 'Scheduling is not available for this organization yet.' };
}

const cadenceSchema = z.object({
  cadence: z.enum(['hourly', 'daily', 'weekly']),
  minute: z.number().int().min(0).max(59).optional(),
  hour: z.number().int().min(0).max(23).optional(),
  weekday: z.number().int().min(0).max(6).optional(),
  timezone: z.string().max(60).optional(),
  sopId: z.string().max(200).optional(),
  sopTitle: z.string().max(300).optional(),
  name: z.string().max(255).optional(),
});

const patchSchema = z.object({
  enabled: z.boolean().optional(),
  cadence: z.enum(['hourly', 'daily', 'weekly']).optional(),
  minute: z.number().int().min(0).max(59).optional(),
  hour: z.number().int().min(0).max(23).optional(),
  weekday: z.number().int().min(0).max(6).optional(),
  timezone: z.string().max(60).optional(),
});

function isValidTimezone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export default async function scheduleRoutes(app: FastifyInstance) {
  // ---- CREATE: POST /agents/:externalId/schedules ----
  app.post<{ Params: { externalId: string }; Body: unknown }>('/agents/:externalId/schedules', async (request, reply) => {
    const externalId = request.params.externalId;
    if (!validExternalId(externalId)) return reply.status(400).send({ error: { code: 'INVALID_ID', message: 'Invalid agent externalId' } });

    const ctx = await getMemberOrg(request);
    if (!ctx) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in to schedule agents' } });

    const parsed = cadenceSchema.safeParse(request.body || {});
    if (!parsed.success) return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid schedule request' } });
    const body = parsed.data;
    if (!body.sopId && !body.sopTitle) {
      return reply.status(400).send({ error: { code: 'SOP_REQUIRED', message: 'A schedule must target a SOP (sopId or sopTitle)' } });
    }
    const timezone = body.timezone && isValidTimezone(body.timezone) ? body.timezone : 'America/New_York';

    // Resolve the agent node + SOP server-side (never trust client steps), and
    // enforce edit rights on the OWNING SEAT.
    const graph = await getOrgTeamGraph(ctx.org.id, ctx.org.name || 'Organization');
    const node = graph.nodes.find(n => n.externalId === externalId && n.type === 'agent');
    if (!node) return reply.status(404).send({ error: { code: 'AGENT_NOT_FOUND', message: 'No such agent on this org chart' } });

    const editable = computeEditableTiles(ctx.viewerMember as any, graph);
    if (!editable.has(externalId)) {
      return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'You do not have edit rights on this seat' } });
    }

    const sop = resolveSopFromNode((node.properties as any)?.sops, { sopId: body.sopId, sopTitle: body.sopTitle });
    if (!sop) return reply.status(404).send({ error: { code: 'SOP_NOT_FOUND', message: 'No matching SOP on this agent' } });

    // SAFETY GATE: funded wallet + active API key. 402/403 with the reason.
    const gate = await canSchedule(ctx.org.id);
    if (!gate.ok) {
      const e = gateError(gate.reason);
      return reply.status(e.status).send({ error: { code: e.code, message: e.message } });
    }

    const cron = cadenceToCron({ cadence: body.cadence as Cadence, minute: body.minute, hour: body.hour, weekday: body.weekday });
    const next = nextRunAt(cron, timezone, new Date());
    const name = (body.name || '').trim() || sop.title;
    // The existing `prompt` column is NOT NULL; set it to the SOP title so the
    // constraint holds. The runner resolves the live SOP from sop_id/sop_title.
    const promptForConstraint = sop.title;

    const inserted = (await db.execute(sql`
      INSERT INTO agent_schedules
        (org_id, agent_external_id, name, cron, timezone, prompt, sop_id, sop_title, enabled, next_run_at, created_by_user_id, updated_at)
      VALUES (
        ${ctx.org.id}, ${externalId}, ${name}, ${cron}, ${timezone}, ${promptForConstraint},
        ${body.sopId || null}, ${sop.title}, true, ${next}, ${getAuth(request).userId || null}, now()
      )
      RETURNING id, agent_external_id, name, cron, timezone, sop_id, sop_title, enabled, last_run_at, next_run_at, created_at
    `)).rows[0];

    return reply.status(201).send({ schedule: inserted });
  });

  // ---- LIST: GET /agents/:externalId/schedules ----
  app.get<{ Params: { externalId: string } }>('/agents/:externalId/schedules', async (request, reply) => {
    const externalId = request.params.externalId;
    if (!validExternalId(externalId)) return reply.status(400).send({ error: { code: 'INVALID_ID', message: 'Invalid agent externalId' } });

    const ctx = await getMemberOrg(request);
    if (!ctx) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in' } });

    const rows = (await db.execute(sql`
      SELECT id, agent_external_id, name, cron, timezone, sop_id, sop_title, enabled, last_run_at, next_run_at, created_at
      FROM agent_schedules
      WHERE org_id = ${ctx.org.id} AND agent_external_id = ${externalId}
      ORDER BY created_at DESC
    `)).rows;
    return reply.send({ schedules: rows });
  });

  // ---- PATCH: /schedules/:id (enable/disable, change cadence) ----
  app.patch<{ Params: { id: string }; Body: unknown }>('/schedules/:id', async (request, reply) => {
    const id = request.params.id;
    if (!validUuid(id)) return reply.status(400).send({ error: { code: 'INVALID_ID', message: 'Invalid schedule id' } });

    const ctx = await getMemberOrg(request);
    if (!ctx) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in' } });

    const parsed = patchSchema.safeParse(request.body || {});
    if (!parsed.success) return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid update' } });
    const body = parsed.data;

    // Org-scoped fetch (404 if not this org's schedule -- never leak existence).
    const existing = (await db.execute(sql`
      SELECT id, agent_external_id, cron, timezone, enabled, next_run_at
      FROM agent_schedules
      WHERE id = ${id} AND org_id = ${ctx.org.id}
      LIMIT 1
    `)).rows[0] as { id: string; agent_external_id: string; cron: string; timezone: string; enabled: boolean; next_run_at: Date | null } | undefined;
    if (!existing) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Schedule not found' } });

    // Edit rights on the owning seat (same gate as create).
    const graph = await getOrgTeamGraph(ctx.org.id, ctx.org.name || 'Organization');
    const editable = computeEditableTiles(ctx.viewerMember as any, graph);
    if (!editable.has(existing.agent_external_id)) {
      return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'You do not have edit rights on this seat' } });
    }

    // Compute the new cron/timezone if cadence fields changed.
    let cron = existing.cron;
    let timezone = existing.timezone;
    const cadenceChanged = body.cadence !== undefined || body.minute !== undefined || body.hour !== undefined || body.weekday !== undefined || body.timezone !== undefined;
    if (cadenceChanged) {
      // Re-derive from existing cron for any unspecified field so a partial
      // PATCH (e.g. just the hour) preserves the rest of the cadence.
      const { cronToCadence } = await import('../../shared/schedule-cadence.js');
      const prior = cronToCadence(existing.cron) || { cadence: 'daily' as Cadence, minute: 0, hour: 9, weekday: 1 };
      const merged = {
        cadence: (body.cadence as Cadence) || prior.cadence,
        minute: body.minute ?? prior.minute,
        hour: body.hour ?? prior.hour,
        weekday: body.weekday ?? prior.weekday,
      };
      cron = cadenceToCron(merged);
      if (body.timezone !== undefined) {
        timezone = isValidTimezone(body.timezone) ? body.timezone : timezone;
      }
    }

    // RE-GATE on enable: turning a schedule ON arms autopilot spend.
    const enabling = body.enabled === true && !existing.enabled;
    if (enabling) {
      const gate = await canSchedule(ctx.org.id);
      if (!gate.ok) {
        const e = gateError(gate.reason);
        return reply.status(e.status).send({ error: { code: e.code, message: e.message } });
      }
    }

    const newEnabled = body.enabled === undefined ? existing.enabled : body.enabled;
    // Recompute next_run_at when cadence changed OR when (re)enabling; otherwise
    // keep the existing value. Always SET it (no conditional SQL fragments) so
    // the UPDATE statement is structurally fixed.
    const recompute = cadenceChanged || enabling;
    const next = recompute ? nextRunAt(cron, timezone, new Date()) : (existing.next_run_at ?? null);

    const updated = (await db.execute(sql`
      UPDATE agent_schedules
      SET enabled = ${newEnabled},
          cron = ${cron},
          timezone = ${timezone},
          next_run_at = ${next},
          updated_at = now()
      WHERE id = ${id} AND org_id = ${ctx.org.id}
      RETURNING id, agent_external_id, name, cron, timezone, sop_id, sop_title, enabled, last_run_at, next_run_at, created_at
    `)).rows[0];

    return reply.send({ schedule: updated });
  });

  // ---- DELETE: /schedules/:id (org-scoped hard delete) ----
  app.delete<{ Params: { id: string } }>('/schedules/:id', async (request, reply) => {
    const id = request.params.id;
    if (!validUuid(id)) return reply.status(400).send({ error: { code: 'INVALID_ID', message: 'Invalid schedule id' } });

    const ctx = await getMemberOrg(request);
    if (!ctx) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in' } });

    const existing = (await db.execute(sql`
      SELECT id, agent_external_id FROM agent_schedules
      WHERE id = ${id} AND org_id = ${ctx.org.id} LIMIT 1
    `)).rows[0] as { id: string; agent_external_id: string } | undefined;
    if (!existing) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Schedule not found' } });

    const graph = await getOrgTeamGraph(ctx.org.id, ctx.org.name || 'Organization');
    const editable = computeEditableTiles(ctx.viewerMember as any, graph);
    if (!editable.has(existing.agent_external_id)) {
      return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'You do not have edit rights on this seat' } });
    }

    await db.execute(sql`DELETE FROM agent_schedules WHERE id = ${id} AND org_id = ${ctx.org.id}`);
    return reply.status(204).send();
  });
}
