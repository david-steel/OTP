/**
 * Teams API -- create/rename/delete teams and manage memberships.
 *
 * /api/v1/teams                  GET (list), POST (create)
 * /api/v1/teams/:id              GET, PATCH, DELETE
 * /api/v1/teams/:id/members      GET (list), POST (add by org_member id)
 * /api/v1/teams/:id/members/:m   DELETE (remove)
 *
 * Auth: Clerk session, API key (write scope for mutations), or service auth.
 * The leadership team (slug='leadership', is_default=true) is special: it
 * can be renamed but cannot be deleted, because it's the back-compat home
 * for legacy untagged tickets / L10s.
 */
import type { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { eq, and, asc, desc } from 'drizzle-orm';
import { getAuth } from '@clerk/fastify';
import { db } from '../../config/database.js';
import { teams, teamMemberships, orgMembers, organizations } from '../../db/schema.js';
import { resolveApiKey, requireScope } from '../../middleware/api-key-auth.js';
import { getAuthOrg } from '../../middleware/auth-helpers.js';
import { resolveOrgForUser, resolveOrgForRequest } from '../../services/membership.js';
import { requireUuidParam } from '../../shared/param-validation.js';

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

async function checkScope(request: FastifyRequest, reply: any): Promise<boolean> {
  const auth = getAuth(request);
  if (auth.userId) return true;
  if ((request as any).serviceAuth) return true;
  const apiKeyCtx = await resolveApiKey(request);
  if (apiKeyCtx && !requireScope(apiKeyCtx, 'write')) {
    reply.status(403).send({ error: { code: 'INSUFFICIENT_SCOPE', message: "API key requires 'write' scope" } });
    return false;
  }
  return true;
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'team';
}

const teamCreateSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(60).optional(),
  type: z.enum(['leadership', 'department', 'project', 'other']).optional().default('department'),
  description: z.string().max(2000).optional(),
});

const teamUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(60).optional(),
  type: z.enum(['leadership', 'department', 'project', 'other']).optional(),
  description: z.string().max(2000).nullable().optional(),
});

const addMemberSchema = z.object({
  // Either memberId (existing org_members.id) OR externalId (chart human
  // like HUM_DAN) -- if externalId is provided and no matching org_member
  // exists yet, a stub row is auto-created so the chart person can be on
  // a team without needing a Clerk account first.
  memberId: z.string().uuid().optional(),
  externalId: z.string().max(120).optional(),
  displayName: z.string().max(255).optional(),
  roleOnTeam: z.enum(['leader', 'member']).optional().default('member'),
}).refine(d => d.memberId || d.externalId, {
  message: 'Either memberId or externalId is required',
});

export default async function teamsRoutes(app: FastifyInstance) {
  // ============================================================
  // GET /api/v1/teams -- list teams for the caller's org
  // ============================================================
  app.get('/teams', async (request, reply) => {
    const org = await getOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const rows = await db.select({
      id: teams.id, name: teams.name, slug: teams.slug, type: teams.type,
      description: teams.description, isDefault: teams.isDefault,
      createdAt: teams.createdAt, updatedAt: teams.updatedAt,
    }).from(teams).where(eq(teams.orgId, org.id))
      .orderBy(desc(teams.isDefault), asc(teams.name));

    // Counts of members per team -- handy for the listing UI.
    const counts: Record<string, number> = {};
    if (rows.length > 0) {
      const memberCountRows = await db
        .select({ teamId: teamMemberships.teamId, memberId: teamMemberships.memberId })
        .from(teamMemberships);
      for (const r of memberCountRows) counts[r.teamId] = (counts[r.teamId] || 0) + 1;
    }
    return {
      count: rows.length,
      teams: rows.map(r => ({ ...r, memberCount: counts[r.id] || 0 })),
    };
  });

  // ============================================================
  // POST /api/v1/teams -- create a new team
  // ============================================================
  app.post('/teams', async (request, reply) => {
    if (!(await checkScope(request, reply))) return;
    const org = await getOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const body = teamCreateSchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid input', details: body.error.issues } });

    const slug = body.data.slug || slugify(body.data.name);
    // Guard against duplicate slugs in the same org (unique index on org_id+slug
    // exists in ensure-teams.ts).
    const [existing] = await db.select({ id: teams.id }).from(teams)
      .where(and(eq(teams.orgId, org.id), eq(teams.slug, slug))).limit(1);
    if (existing) {
      return reply.status(409).send({ error: { code: 'SLUG_TAKEN', message: 'A team with that slug already exists in this org' } });
    }

    const [created] = await db.insert(teams).values({
      orgId: org.id,
      name: body.data.name.trim(),
      slug,
      type: body.data.type,
      description: body.data.description || null,
      isDefault: false,
    }).returning();
    return reply.status(201).send(created);
  });

  // ============================================================
  // GET /api/v1/teams/:id -- team + member roster
  // ============================================================
  app.get<{ Params: { id: string } }>('/teams/:id', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    const org = await getOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const [team] = await db.select().from(teams)
      .where(and(eq(teams.id, id), eq(teams.orgId, org.id))).limit(1);
    if (!team) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Team not found in your org' } });

    const members = await db
      .select({
        membershipId: teamMemberships.id,
        roleOnTeam: teamMemberships.roleOnTeam,
        memberId: orgMembers.id,
        displayName: orgMembers.displayName,
        email: orgMembers.email,
        clerkUserId: orgMembers.clerkUserId,
        orgRole: orgMembers.role,
      })
      .from(teamMemberships)
      .innerJoin(orgMembers, eq(orgMembers.id, teamMemberships.memberId))
      .where(eq(teamMemberships.teamId, id))
      .orderBy(desc(teamMemberships.roleOnTeam), asc(orgMembers.displayName));

    return { team, members };
  });

  // ============================================================
  // PATCH /api/v1/teams/:id -- rename / retype
  // ============================================================
  app.patch<{ Params: { id: string } }>('/teams/:id', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    if (!(await checkScope(request, reply))) return;
    const org = await getOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const body = teamUpdateSchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid input', details: body.error.issues } });

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (body.data.name !== undefined) updates.name = body.data.name.trim();
    if (body.data.slug !== undefined) updates.slug = body.data.slug;
    if (body.data.type !== undefined) updates.type = body.data.type;
    if (body.data.description !== undefined) updates.description = body.data.description;

    const [updated] = await db.update(teams).set(updates)
      .where(and(eq(teams.id, id), eq(teams.orgId, org.id)))
      .returning();
    if (!updated) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Team not found in your org' } });
    return updated;
  });

  // ============================================================
  // DELETE /api/v1/teams/:id -- delete a non-default team
  // ============================================================
  app.delete<{ Params: { id: string } }>('/teams/:id', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    if (!(await checkScope(request, reply))) return;
    const org = await getOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const [existing] = await db.select().from(teams)
      .where(and(eq(teams.id, id), eq(teams.orgId, org.id))).limit(1);
    if (!existing) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Team not found' } });
    if (existing.isDefault) {
      return reply.status(400).send({ error: { code: 'CANNOT_DELETE_DEFAULT', message: 'The default team cannot be deleted. Mark another team default first.' } });
    }

    await db.delete(teams).where(and(eq(teams.id, id), eq(teams.orgId, org.id)));
    return { ok: true, deletedTeamId: id };
  });

  // ============================================================
  // POST /api/v1/teams/:id/members -- add an org_member to a team
  // ============================================================
  app.post<{ Params: { id: string } }>('/teams/:id/members', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    if (!(await checkScope(request, reply))) return;
    const org = await getOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const body = addMemberSchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid input', details: body.error.issues } });

    // Verify the team belongs to this org -- prevents cross-org leakage.
    const [team] = await db.select().from(teams)
      .where(and(eq(teams.id, id), eq(teams.orgId, org.id))).limit(1);
    if (!team) return reply.status(404).send({ error: { code: 'TEAM_NOT_FOUND', message: 'Team not found in your org' } });

    // Resolve the org_members.id we'll attach. Three paths:
    //   1) memberId passed → look up that row (must belong to org)
    //   2) externalId passed → find org_member already claiming that tile
    //   3) externalId passed but no claimant → auto-create a stub row so
    //      the chart person can be on a team without needing a Clerk
    //      account first
    let resolvedMemberId: string | null = null;

    if (body.data.memberId) {
      const [m] = await db.select().from(orgMembers)
        .where(and(eq(orgMembers.id, body.data.memberId), eq(orgMembers.orgId, org.id))).limit(1);
      if (!m) return reply.status(404).send({ error: { code: 'MEMBER_NOT_FOUND', message: 'Org member not found in your org' } });
      resolvedMemberId = m.id;
    } else if (body.data.externalId) {
      const ext = body.data.externalId;
      // Try to find an existing claimant via claimedEntityId or claimedEntityIds JSONB.
      const candidates = await db.select().from(orgMembers).where(eq(orgMembers.orgId, org.id));
      const claimed = candidates.find(m =>
        m.claimedEntityId === ext ||
        (Array.isArray((m.claimedEntityIds as unknown) as string[]) &&
         ((m.claimedEntityIds as unknown) as string[]).includes(ext))
      );
      if (claimed) {
        resolvedMemberId = claimed.id;
      } else {
        // Auto-create a stub. clerk_user_id is non-null in the schema, so
        // we use a `chart:<external_id>` sentinel that can never collide
        // with a real Clerk user (those start with `user_`). When the
        // chart person eventually signs in to Clerk, a follow-up flow
        // can reconcile by matching claimed_entity_id and merging.
        const [stub] = await db.insert(orgMembers).values({
          orgId: org.id,
          clerkUserId: `chart:${ext}`,
          email: null,
          displayName: body.data.displayName || ext,
          role: 'managee',
          status: 'inactive',
          claimedEntityId: ext,
          claimedEntityIds: [ext],
        }).returning();
        resolvedMemberId = stub.id;
      }
    }
    if (!resolvedMemberId) return reply.status(400).send({ error: { code: 'BAD_TARGET', message: 'Could not resolve member or external id' } });

    // Idempotent: if already a member, just update the role.
    const [existing] = await db.select().from(teamMemberships)
      .where(and(eq(teamMemberships.teamId, id), eq(teamMemberships.memberId, resolvedMemberId)))
      .limit(1);
    if (existing) {
      const [updated] = await db.update(teamMemberships)
        .set({ roleOnTeam: body.data.roleOnTeam })
        .where(eq(teamMemberships.id, existing.id))
        .returning();
      return updated;
    }
    const [created] = await db.insert(teamMemberships).values({
      teamId: id,
      memberId: resolvedMemberId,
      roleOnTeam: body.data.roleOnTeam,
    }).returning();
    return reply.status(201).send(created);
  });

  // ============================================================
  // DELETE /api/v1/teams/:id/members/:memberId -- remove a member
  // ============================================================
  app.delete<{ Params: { id: string; memberId: string } }>('/teams/:id/members/:memberId', async (request, reply) => {
    if (!(await checkScope(request, reply))) return;
    const org = await getOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    if (!/^[0-9a-f-]{36}$/i.test(request.params.id) || !/^[0-9a-f-]{36}$/i.test(request.params.memberId)) {
      return reply.status(400).send({ error: { code: 'INVALID_ID', message: 'Bad UUID' } });
    }
    const [team] = await db.select().from(teams)
      .where(and(eq(teams.id, request.params.id), eq(teams.orgId, org.id))).limit(1);
    if (!team) return reply.status(404).send({ error: { code: 'TEAM_NOT_FOUND', message: 'Team not found in your org' } });

    await db.delete(teamMemberships)
      .where(and(
        eq(teamMemberships.teamId, request.params.id),
        eq(teamMemberships.memberId, request.params.memberId),
      ));
    return { ok: true };
  });
}
