// Team API -- editing surface for the org chart on /dashboard/team.
//
// PATCH /api/v1/team/entity   Edit one agent or human entity in the latest
//                             draft (creating one from latest published if
//                             none exists). Auth: Clerk session OR API key
//                             with 'write' scope.

import type { FastifyInstance, FastifyRequest } from 'fastify';
import { getAuth } from '@clerk/fastify';
import { z } from 'zod';
import { db } from '../../config/database.js';
import { organizations } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { resolveApiKey, requireScope } from '../../middleware/api-key-auth.js';
import { getAuthOrg } from '../../middleware/auth-helpers.js';
import { patchTeamEntity, deleteTeamEntity, createTeamEntity, bulkImportHumans, TeamMutationError, buildAgentContext, getOrgTeamGraph } from '../../services/team-graph.js';
import type { EntityType, ImportRow } from '../../services/team-graph.js';
import { computeEditableTiles } from '../../services/chart-permissions.js';
import {
  issueInvite,
  revokeInvite,
  listPendingInvites,
  listMembers,
  getRoleForUser,
  resolveOrgForUser,
  MembershipError,
} from '../../services/membership.js';
import { sendEmail } from '../../config/email.js';

const patchSchema = z.object({
  type: z.enum(['agent', 'human']),
  externalId: z.string().min(1).max(120),
  patch: z.object({
    name: z.string().min(1).max(255).optional(),
    role: z.string().min(1).max(255).optional(),
    mission: z.string().max(2000).optional(),
    authority_level: z.string().max(120).optional(),
    platform: z.string().max(120).optional(),
    status: z.string().max(120).optional(),
    job_description: z.string().max(2000).optional(),
    skills: z.array(z.string().min(1).max(80)).max(40).optional(),
    mcps: z.array(z.string().min(1).max(80)).max(40).optional(),
    maturity_level: z.number().int().min(1).max(8).nullable().optional(),
    escalates_to: z.string().max(120).nullable().optional(),
    reports_to: z.string().max(120).nullable().optional(),
    sops: z.array(z.object({
      id: z.string().min(1).max(80).optional(),
      title: z.string().min(1).max(200),
      trigger: z.string().max(500).optional(),
      steps: z.array(z.string().min(1).max(500)).max(40).optional(),
      outputs: z.array(z.string().min(1).max(300)).max(20).optional(),
      tools: z.array(z.string().min(1).max(120)).max(20).optional(),
      notes: z.string().max(2000).optional(),
    })).max(40).optional(),
    contact_email: z.string().email().max(200).nullable().optional(),
    contact_phone: z.string().max(40).nullable().optional(),
    slack_id: z.string().max(40).nullable().optional(),
    runtime_body: z.string().max(50000).nullable().optional(),
  }).refine(p => Object.keys(p).length > 0, { message: 'patch must contain at least one field' }),
});

async function checkScope(request: FastifyRequest, reply: any, requiredScope: string): Promise<boolean> {
  const auth = getAuth(request);
  if (auth.userId) return true;
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
    // Fallback to legacy direct match (covers any pre-membership orgs).
    const [row] = await db.select().from(organizations).where(eq(organizations.clerkOrgId, auth.userId)).limit(1);
    return row || null;
  }
  return await getAuthOrg(request);
}

/**
 * Phase 3: chart-edit permission gate. Returns true if the request is
 * allowed to mutate the given tile, false after writing a 403 reply if not.
 *
 * Logic:
 *  - API-key requests with write scope bypass per-tile checks (programmatic
 *    integrations stay simple). Already gated by checkScope upstream.
 *  - Clerk-authed requests must have an org_member row whose computed
 *    editable-tile set includes the targeted externalId.
 *  - If a Clerk user has no org_member row but does match the legacy
 *    organizations.clerkOrgId, treat them as an implicit owner (back-compat
 *    with single-user orgs from before the Phase 1 backfill).
 */
async function checkChartEdit(
  request: FastifyRequest,
  reply: any,
  orgId: string,
  externalId: string,
): Promise<boolean> {
  const auth = getAuth(request);

  // API-key path: rely on the scope already being validated by checkScope.
  if (!auth.userId) return true;

  const member = (request as any).orgMember as
    | { role: any; claimedEntityId?: string | null; claimedEntityIds?: string[] | null }
    | null;

  // No member row at all -- check the legacy "I created this org" fallback.
  if (!member) {
    const [legacy] = await db.select().from(organizations)
      .where(eq(organizations.id, orgId))
      .limit(1);
    if (legacy && legacy.clerkOrgId === auth.userId) return true;
    reply.status(403).send({ error: { code: 'NOT_A_MEMBER', message: 'You are not a member of this org' } });
    return false;
  }

  const team = await getOrgTeamGraph(orgId, '');
  const editable = computeEditableTiles(member, team);

  if (!editable.has(externalId)) {
    reply.status(403).send({
      error: {
        code: 'CHART_EDIT_DENIED',
        message: 'Your role does not allow editing this tile',
      },
    });
    return false;
  }
  return true;
}

/**
 * Phase 3: gate for creating NEW chart tiles.
 *  - owner / admin / implementer  -> always allowed
 *  - manager                      -> allowed only when reportsTo points
 *                                    at a tile inside their subtree
 *  - all other roles              -> denied
 */
async function checkChartCreate(
  request: FastifyRequest,
  reply: any,
  orgId: string,
  reportsTo: string | undefined,
): Promise<boolean> {
  const auth = getAuth(request);
  if (!auth.userId) return true; // API-key path

  const member = (request as any).orgMember as
    | { role: any; claimedEntityId?: string | null; claimedEntityIds?: string[] | null }
    | null;

  if (!member) {
    const [legacy] = await db.select().from(organizations)
      .where(eq(organizations.id, orgId)).limit(1);
    if (legacy && legacy.clerkOrgId === auth.userId) return true;
    reply.status(403).send({ error: { code: 'NOT_A_MEMBER', message: 'You are not a member of this org' } });
    return false;
  }

  if (member.role === 'owner' || member.role === 'admin' || member.role === 'implementer') {
    return true;
  }

  if (member.role === 'manager') {
    if (!reportsTo) {
      reply.status(403).send({
        error: {
          code: 'CHART_CREATE_NEEDS_PARENT',
          message: 'Managers must specify reportsTo when creating a tile',
        },
      });
      return false;
    }
    const team = await getOrgTeamGraph(orgId, '');
    const editable = computeEditableTiles(member, team);
    if (!editable.has(reportsTo)) {
      reply.status(403).send({
        error: {
          code: 'CHART_CREATE_OUT_OF_SCOPE',
          message: 'You can only create tiles under teams you manage',
        },
      });
      return false;
    }
    return true;
  }

  reply.status(403).send({
    error: {
      code: 'CHART_CREATE_DENIED',
      message: 'Your role does not allow creating chart tiles',
    },
  });
  return false;
}

export default async function teamRoutes(app: FastifyInstance) {
  // ============================================================
  // PATCH /api/v1/team/entity -- Edit one agent or human entity
  // ============================================================
  app.patch('/team/entity', async (request, reply) => {
    if (!(await checkScope(request, reply, 'write'))) return;

    const org = await getOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const body = patchSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid input', details: body.error.issues } });
    }

    if (!(await checkChartEdit(request, reply, org.id, body.data.externalId))) return;

    try {
      const result = await patchTeamEntity(
        org.id,
        body.data.type as EntityType,
        body.data.externalId,
        body.data.patch
      );
      return result;
    } catch (e) {
      if (e instanceof TeamMutationError) {
        return reply.status(e.httpStatus).send({ error: { code: e.code, message: e.message } });
      }
      request.log.error(e);
      return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Failed to patch entity' } });
    }
  });

  // ============================================================
  // POST /api/v1/team/entity -- create a new agent or human in the latest draft
  // ============================================================
  app.post('/team/entity', async (request, reply) => {
    if (!(await checkScope(request, reply, 'write'))) return;
    const org = await getOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const createSchema = z.object({
      type: z.enum(['agent', 'human']),
      name: z.string().min(1).max(255),
      role: z.string().min(1).max(255).optional(),
      contactEmail: z.string().email().max(200).optional(),
      reportsTo: z.string().max(120).optional(),
      escalatesTo: z.string().max(120).optional(),
      authorityLevel: z.string().max(120).optional(),
    });
    const body = createSchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid input', details: body.error.issues } });

    if (!(await checkChartCreate(request, reply, org.id, body.data.reportsTo))) return;

    try {
      return await createTeamEntity(org.id, body.data);
    } catch (e) {
      if (e instanceof TeamMutationError) return reply.status(e.httpStatus).send({ error: { code: e.code, message: e.message } });
      request.log.error(e);
      return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create entity' } });
    }
  });

  // ============================================================
  // DELETE /api/v1/team/entity -- remove an agent or human from the latest draft
  // ============================================================
  app.delete<{ Querystring: { type?: string; externalId?: string } }>(
    '/team/entity',
    async (request, reply) => {
      if (!(await checkScope(request, reply, 'write'))) return;

      const org = await getOrg(request);
      if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

      const type = request.query.type;
      const externalId = request.query.externalId;
      if (type !== 'agent' && type !== 'human') {
        return reply.status(400).send({ error: { code: 'INVALID_TYPE', message: 'type must be agent or human' } });
      }
      if (!externalId || !/^[A-Z0-9_\-]{1,120}$/i.test(externalId)) {
        return reply.status(400).send({ error: { code: 'INVALID_ID', message: 'Invalid externalId' } });
      }

      if (!(await checkChartEdit(request, reply, org.id, externalId))) return;

      try {
        return await deleteTeamEntity(org.id, type as EntityType, externalId);
      } catch (e) {
        if (e instanceof TeamMutationError) {
          return reply.status(e.httpStatus).send({ error: { code: e.code, message: e.message } });
        }
        request.log.error(e);
        return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Failed to delete entity' } });
      }
    }
  );

  // ============================================================
  // GET /api/v1/team/agent/:externalId/context -- compiled CLAUDE.md context
  // ============================================================
  // Returns markdown that combines an agent's own SOPs with SOPs inherited
  // from its escalation parent. Drop into a system prompt or CLAUDE.md.
  // Auth: Clerk session OR API key. Format: ?format=md (default) or json.
  app.get<{ Params: { externalId: string }; Querystring: { format?: string } }>(
    '/team/agent/:externalId/context',
    async (request, reply) => {
      // Read scope is implicit: any signed-in member of the org can fetch
      // their own org's agent context. We rely on getAuth for session and
      // fall back to API key resolution for programmatic access.
      const org = await getOrg(request);
      if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

      const { externalId } = request.params;
      if (!/^[A-Z0-9_\-]{1,120}$/i.test(externalId)) {
        return reply.status(400).send({ error: { code: 'INVALID_ID', message: 'Invalid externalId' } });
      }

      const fmtQuery = String(request.query.format || '').toLowerCase();
      const wantsJson = fmtQuery === 'json';
      const validFormats = ['agents-md', 'claude-md', 'cursor', 'generic'];
      const format = (validFormats.includes(fmtQuery) ? fmtQuery : 'agents-md') as
        'agents-md' | 'claude-md' | 'cursor' | 'generic';

      const ctx = await buildAgentContext(org.id, externalId, { orgName: org.name, format });
      if (!ctx) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Agent not found in your latest OOS' } });

      if (wantsJson) return ctx;
      reply.header('Content-Type', 'text/markdown; charset=utf-8');
      reply.header('Content-Disposition', `inline; filename="${ctx.filename}"`);
      reply.header('X-OTP-Filename', ctx.filename);
      return ctx.markdown;
    }
  );

  // ============================================================
  // POST /api/v1/team/import -- bulk import humans from CSV
  // body: { mode: 'overwrite' | 'addition', rows: ImportRow[] }
  // ============================================================
  app.post('/team/import', async (request, reply) => {
    if (!(await checkScope(request, reply, 'write'))) return;
    const org = await getOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const importSchema = z.object({
      mode: z.enum(['overwrite', 'addition']),
      rows: z.array(z.object({
        name: z.string().min(1).max(255),
        role: z.string().max(255).optional(),
        contact_email: z.string().max(200).optional(),
        contact_phone: z.string().max(60).optional(),
        slack_id: z.string().max(60).optional(),
        reports_to: z.string().max(255).optional(),
        job_description: z.string().max(5000).optional(),
        authority_level: z.string().max(120).optional(),
        skills: z.string().max(2000).optional(),
        mcps: z.string().max(2000).optional(),
        status: z.string().max(60).optional(),
      })).min(1).max(500),
    });
    const parsed = importSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid import payload', details: parsed.error.issues } });
    }

    try {
      const result = await bulkImportHumans(org.id, parsed.data.rows as ImportRow[], parsed.data.mode);
      return result;
    } catch (e) {
      if (e instanceof TeamMutationError) return reply.status(e.httpStatus).send({ error: { code: e.code, message: e.message } });
      request.log.error(e);
      return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Import failed' } });
    }
  });

  // ============================================================
  // GET /api/v1/team/import/template/:variant -- CSV template download
  // variant = 'simple' | 'full'
  // ============================================================
  app.get<{ Params: { variant: string } }>('/team/import/template/:variant', async (request, reply) => {
    const variant = request.params.variant;
    let csv = '';
    let filename = 'otp-humans-template.csv';
    if (variant === 'simple') {
      filename = 'otp-humans-simple.csv';
      csv = [
        'name,role,reports_to',
        'Jane Doe,CEO,',
        'John Smith,COO,Jane Doe',
        'Sarah Lee,Marketing Lead,John Smith',
      ].join('\n') + '\n';
    } else if (variant === 'full') {
      filename = 'otp-humans-full.csv';
      csv = [
        'name,role,contact_email,contact_phone,slack_id,reports_to,job_description,authority_level,skills,mcps,status',
        'Jane Doe,CEO,jane@example.com,+1 555 0100,U01ABC,,Sets vision and runs the L8,autonomous,"strategy,leadership","gmail,slack",active',
        'John Smith,COO,john@example.com,,U02DEF,Jane Doe,Owns ops scorecard and weekly L8,execute-with-approval,"operations,EOS","accelo,todoist",active',
        'Sarah Lee,Marketing Lead,sarah@example.com,,U03GHI,John Smith,Owns brand and demand gen,recommend,"copywriting,paid-ads","ga4,hubspot",active',
      ].join('\n') + '\n';
    } else {
      return reply.status(400).send({ error: { code: 'INVALID_VARIANT', message: 'variant must be "simple" or "full"' } });
    }
    reply.header('Content-Type', 'text/csv; charset=utf-8');
    reply.header('Content-Disposition', `attachment; filename="${filename}"`);
    return csv;
  });

  // ============================================================
  // POST /api/v1/team/invite -- owner invites someone to claim a tile
  // ============================================================
  app.post('/team/invite', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in to issue invitations' } });

    const org = await getOrg(request);
    if (!org) return reply.status(404).send({ error: { code: 'NO_ORG', message: 'No org found for current user' } });

    const inviterRole = await getRoleForUser(org.id, auth.userId);
    const ALLOWED: ('owner' | 'admin' | 'manager')[] = ['owner', 'admin', 'manager'];
    if (!inviterRole || !ALLOWED.includes(inviterRole as any)) {
      return reply.status(403).send({ error: { code: 'CANNOT_INVITE', message: 'Your role does not allow issuing invitations' } });
    }

    const accessSchema = z.record(z.string(), z.boolean()).optional();
    const inviteSchema = z.object({
      email: z.string().email().max(200),
      displayName: z.string().max(200).optional(),
      claimedEntityId: z.string().max(120).optional(),
      claimedEntityIds: z.array(z.string().max(120)).max(50).optional(),
      role: z.enum([
        'owner', 'admin', 'manager', 'managee',
        'inactive', 'observer', 'implementer', 'free',
        'member', // legacy alias accepted for back-compat
      ]).optional(),
      featureAccess: accessSchema,
      dataAccess: accessSchema,
      agentAccess: accessSchema,
      teamIds: z.array(z.string().uuid()).max(50).optional(),
    });
    const body = inviteSchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid input', details: body.error.issues } });

    // Inviters cannot grant a role above their own. Owner > admin > manager.
    const RANK: Record<string, number> = { owner: 4, admin: 3, manager: 2, managee: 1, member: 1, observer: 1, implementer: 3, free: 1, inactive: 0 };
    const requestedRole = body.data.role || 'managee';
    if ((RANK[requestedRole] || 0) > (RANK[inviterRole] || 0)) {
      return reply.status(403).send({ error: { code: 'ROLE_TOO_HIGH', message: 'You cannot invite someone to a role above your own' } });
    }

    try {
      const baseUrl = `${request.protocol}://${request.hostname}`;
      const issued = await issueInvite({
        orgId: org.id,
        ownerUserId: auth.userId,
        email: body.data.email,
        displayName: body.data.displayName || null,
        claimedEntityId: body.data.claimedEntityId || null,
        claimedEntityIds: body.data.claimedEntityIds,
        role: requestedRole,
        access: {
          feature: body.data.featureAccess || {},
          data: body.data.dataAccess || {},
          agent: body.data.agentAccess || {},
        },
        teamIds: body.data.teamIds,
      }, baseUrl.includes('localhost') ? 'https://orgtp.com' : baseUrl);

      // Fire-and-forget the email; do not fail the API if Resend is down.
      const ownerName = (org as any).name || 'OTP';
      const tileLabel = body.data.claimedEntityId || 'a tile on the team chart';
      const subject = `${ownerName} invited you to OTP`;
      const html = renderInviteEmail({
        orgName: ownerName,
        acceptUrl: issued.acceptUrl,
        tileLabel,
        expiresAt: issued.expiresAt,
      });
      sendEmail({
        to: issued.email,
        subject,
        html,
        from: 'OTP Invitations <notifications@mail.orgtp.com>',
      }).catch(err => request.log.error('[invite] email send failed:', err));

      // Never return the token over a non-creator surface; the email carries it.
      return {
        ok: true,
        invitationId: issued.invitationId,
        email: issued.email,
        claimedEntityId: issued.claimedEntityId,
        expiresAt: issued.expiresAt,
      };
    } catch (e) {
      if (e instanceof MembershipError) return reply.status(e.httpStatus).send({ error: { code: e.code, message: e.message } });
      request.log.error(e);
      return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Failed to issue invitation' } });
    }
  });

  // ============================================================
  // GET /api/v1/team/invitations -- owner lists pending invites
  // ============================================================
  app.get('/team/invitations', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in' } });
    const org = await getOrg(request);
    if (!org) return reply.status(404).send({ error: { code: 'NO_ORG', message: 'No org' } });
    const role = await getRoleForUser(org.id, auth.userId);
    if (role !== 'owner') return reply.status(403).send({ error: { code: 'NOT_OWNER', message: 'Only owners see pending invitations' } });
    const invites = await listPendingInvites(org.id);
    return { data: invites };
  });

  // ============================================================
  // DELETE /api/v1/team/invitations/:id -- owner revokes
  // ============================================================
  app.delete<{ Params: { id: string } }>('/team/invitations/:id', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in' } });
    if (!/^[0-9a-f-]{36}$/i.test(request.params.id)) return reply.status(400).send({ error: { code: 'INVALID_ID', message: 'Invalid invitation id' } });
    try {
      return await revokeInvite(request.params.id, auth.userId);
    } catch (e) {
      if (e instanceof MembershipError) return reply.status(e.httpStatus).send({ error: { code: e.code, message: e.message } });
      throw e;
    }
  });

  // ============================================================
  // GET /api/v1/team/members -- list active members of the current org
  // ============================================================
  app.get('/team/members', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in' } });
    const org = await getOrg(request);
    if (!org) return reply.status(404).send({ error: { code: 'NO_ORG', message: 'No org' } });
    const role = await getRoleForUser(org.id, auth.userId);
    if (!role) return reply.status(403).send({ error: { code: 'NOT_MEMBER', message: 'Not a member of this org' } });
    const members = await listMembers(org.id);
    return { data: members, viewerRole: role };
  });

  // ============================================================
  // PATCH /api/v1/team/members/:id -- edit a member's role / status /
  // claimed tiles / access toggles / teams. Owner / admin / implementer.
  // ============================================================
  app.patch<{ Params: { id: string } }>('/team/members/:id', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in' } });
    if (!/^[0-9a-f-]{36}$/i.test(request.params.id)) {
      return reply.status(400).send({ error: { code: 'INVALID_ID', message: 'Invalid member id' } });
    }

    const accessSchema = z.record(z.string(), z.boolean()).optional();
    const updateSchema = z.object({
      role: z.enum([
        'owner', 'admin', 'manager', 'managee',
        'inactive', 'observer', 'implementer', 'free',
        'member',
      ]).optional(),
      status: z.enum(['active', 'suspended', 'inactive', 'revoked']).optional(),
      displayName: z.string().max(200).nullable().optional(),
      claimedEntityId: z.string().max(120).nullable().optional(),
      claimedEntityIds: z.array(z.string().max(120)).max(50).optional(),
      featureAccess: accessSchema,
      dataAccess: accessSchema,
      agentAccess: accessSchema,
      teamIds: z.array(z.string().uuid()).max(50).optional(),
    });
    const body = updateSchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid input', details: body.error.issues } });

    try {
      const { updateMember } = await import('../../services/membership.js');
      return await updateMember(request.params.id, auth.userId, body.data as any);
    } catch (e) {
      if (e instanceof MembershipError) {
        return reply.status(e.httpStatus).send({ error: { code: e.code, message: e.message } });
      }
      throw e;
    }
  });

  // ============================================================
  // DELETE /api/v1/team/members/:id -- revoke an active member
  // (soft delete: status -> 'revoked', row stays for audit + tile-claim history)
  // ============================================================
  app.delete<{ Params: { id: string } }>('/team/members/:id', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in' } });
    if (!/^[0-9a-f-]{36}$/i.test(request.params.id)) {
      return reply.status(400).send({ error: { code: 'INVALID_ID', message: 'Invalid member id' } });
    }
    try {
      const { removeMember } = await import('../../services/membership.js');
      return await removeMember(request.params.id, auth.userId);
    } catch (e) {
      if (e instanceof MembershipError) {
        return reply.status(e.httpStatus).send({ error: { code: e.code, message: e.message } });
      }
      throw e;
    }
  });
}

// ---- Email template (inline so we do not add another file for one email) ----
function renderInviteEmail(opts: { orgName: string; acceptUrl: string; tileLabel: string; expiresAt: Date }) {
  const expires = opts.expiresAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0; padding:0; background:#f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#1f2937;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f8fafc; padding: 32px 0;">
    <tr><td align="center">
      <table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" style="background:#ffffff; border-radius:12px; border:1px solid #e5e7eb;">
        <tr><td style="padding: 28px 32px 8px 32px;">
          <div style="font-size:13px; color:#6b7280; margin-bottom: 4px;">${escapeHtmlSafe(opts.orgName)} invited you</div>
          <h1 style="font-size:22px; line-height:1.3; font-weight:800; margin: 4px 0 16px 0; color:#0f172a;">Claim your tile on the OTP team chart</h1>
        </td></tr>
        <tr><td style="padding: 0 32px 24px 32px; font-size:15px; line-height:1.65; color:#1f2937;">
          <p style="margin: 0 0 14px 0;">${escapeHtmlSafe(opts.orgName)} added you to their team chart on OTP and held a specific tile (${escapeHtmlSafe(opts.tileLabel)}) for you to claim.</p>
          <p style="margin: 0 0 14px 0;">When you accept, you become a member of the org. You can edit your own tile, author SOPs that any AI agent under you inherits at runtime, and connect your own AI instances to the chart.</p>
          <p style="margin: 24px 0;">
            <a href="${opts.acceptUrl}" style="display:inline-block; padding: 12px 20px; background:#0ea5e9; color:#ffffff; text-decoration:none; border-radius:8px; font-weight:600; font-size:15px;">Accept invitation</a>
          </p>
          <p style="margin: 0; font-size:12px; color:#9ca3af;">This link expires ${expires}. If you did not expect this email, you can ignore it.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function escapeHtmlSafe(s: string): string {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as Record<string, string>)[c]);
}
