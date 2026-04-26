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
import { patchTeamEntity, deleteTeamEntity, TeamMutationError, buildAgentContext } from '../../services/team-graph.js';
import type { EntityType } from '../../services/team-graph.js';
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

      const ctx = await buildAgentContext(org.id, externalId, { orgName: org.name });
      if (!ctx) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Agent not found in your latest OOS' } });

      const format = request.query.format === 'json' ? 'json' : 'md';
      if (format === 'json') return ctx;
      reply.header('Content-Type', 'text/markdown; charset=utf-8');
      return ctx.markdown;
    }
  );

  // ============================================================
  // POST /api/v1/team/invite -- owner invites someone to claim a tile
  // ============================================================
  app.post('/team/invite', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in to issue invitations' } });

    const org = await getOrg(request);
    if (!org) return reply.status(404).send({ error: { code: 'NO_ORG', message: 'No org found for current user' } });

    const role = await getRoleForUser(org.id, auth.userId);
    if (role !== 'owner') return reply.status(403).send({ error: { code: 'NOT_OWNER', message: 'Only the org owner can issue invitations' } });

    const inviteSchema = z.object({
      email: z.string().email().max(200),
      claimedEntityId: z.string().max(120).optional(),
      role: z.enum(['member', 'owner']).optional(),
    });
    const body = inviteSchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid input', details: body.error.issues } });

    try {
      const baseUrl = `${request.protocol}://${request.hostname}`;
      const issued = await issueInvite({
        orgId: org.id,
        ownerUserId: auth.userId,
        email: body.data.email,
        claimedEntityId: body.data.claimedEntityId || null,
        role: body.data.role || 'member',
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
