import type { FastifyInstance } from 'fastify';
import { eq, and, desc, sql, or } from 'drizzle-orm';
import { db } from '../../config/database.js';
import { oosFiles, consultantProfiles, workspaces, workspaceMembers } from '../../db/schema.js';
import { getAuthOrg } from '../../middleware/auth-helpers.js';
import { createAuditEntry } from '../../services/audit-logger.js';
import { z } from 'zod';

const createWorkspaceSchema = z.object({
  name: z.string().min(2).max(255),
  description: z.string().max(2000).optional(),
});

const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['consultant', 'viewer']).optional().default('consultant'),
});

// Helper: check if org has a consultant profile
async function getConsultantProfile(orgId: string) {
  const [profile] = await db.select().from(consultantProfiles).where(eq(consultantProfiles.orgId, orgId)).limit(1);
  return profile || null;
}

// Helper: check if org is a member of a workspace
async function getWorkspaceMembership(workspaceId: string, orgId: string) {
  const [member] = await db.select()
    .from(workspaceMembers)
    .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.orgId, orgId)))
    .limit(1);
  return member || null;
}

export default async function workspaceRoutes(app: FastifyInstance) {

  // ============================================================
  // POST /api/v1/workspaces -- Create workspace (must be a consultant)
  // ============================================================
  app.post('/workspaces', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const profile = await getConsultantProfile(org.id);
    if (!profile) {
      return reply.status(403).send({ error: { code: 'CONSULTANT_REQUIRED', message: 'You must create a consultant profile before creating a workspace.' } });
    }

    const body = createWorkspaceSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({
        error: { code: 'VALIDATION_FAILED', message: 'Invalid workspace data', details: body.error.issues },
      });
    }

    // Generate workspace slug
    const { generateSlug, ensureUniqueSlug } = await import('../../services/slug-generator.js');
    const baseSlug = generateSlug(body.data.name);
    const slug = await ensureUniqueSlug(baseSlug, 'workspaces');

    // Create workspace
    const [workspace] = await db.insert(workspaces).values({
      name: body.data.name,
      slug,
      consultantOrgId: org.id,
      description: body.data.description || null,
      ownerId: org.id,
    }).returning();

    // Add creator as owner member
    await db.insert(workspaceMembers).values({
      workspaceId: workspace.id,
      orgId: org.id,
      email: profile.contactEmail || org.clerkOrgId || 'owner',
      role: 'owner',
    });

    await db.insert((await import('../../db/schema.js')).auditLogs).values(
      createAuditEntry('workspace.created', 'workspace', {
        orgId: org.id,
        entityId: workspace.id,
        details: { name: body.data.name },
      })
    );

    return reply.status(201).send({ workspace });
  });

  // ============================================================
  // GET /api/v1/workspaces -- List workspaces (owned or member of)
  // ============================================================
  app.get('/workspaces', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    // Find all workspaces where this org is a member
    const memberships = await db.select({
      workspaceId: workspaceMembers.workspaceId,
      role: workspaceMembers.role,
      joinedAt: workspaceMembers.joinedAt,
    })
      .from(workspaceMembers)
      .where(eq(workspaceMembers.orgId, org.id));

    if (memberships.length === 0) {
      return { workspaces: [] };
    }

    const workspaceIds = memberships.map(m => m.workspaceId);

    const workspaceList = await db.select()
      .from(workspaces)
      .where(sql`${workspaces.id} IN (${sql.join(workspaceIds.map(id => sql`${id}`), sql`, `)})`)
      .orderBy(desc(workspaces.createdAt));

    // Attach role info
    const result = workspaceList.map(ws => ({
      ...ws,
      myRole: memberships.find(m => m.workspaceId === ws.id)?.role || null,
    }));

    return { workspaces: result };
  });

  // ============================================================
  // GET /api/v1/workspaces/:id -- Get workspace detail (must be member)
  // ============================================================
  app.get<{ Params: { id: string } }>('/workspaces/:id', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const { id } = request.params;

    // Verify membership
    const membership = await getWorkspaceMembership(id, org.id);
    if (!membership) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Workspace not found or you are not a member' } });
    }

    const [workspace] = await db.select().from(workspaces).where(eq(workspaces.id, id)).limit(1);
    if (!workspace) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Workspace not found' } });
    }

    // Get all members with their profile info
    const members = await db.select({
      id: workspaceMembers.id,
      orgId: workspaceMembers.orgId,
      role: workspaceMembers.role,
      joinedAt: workspaceMembers.joinedAt,
      displayName: consultantProfiles.displayName,
      slug: consultantProfiles.slug,
      avatarUrl: consultantProfiles.avatarUrl,
    })
      .from(workspaceMembers)
      .leftJoin(consultantProfiles, eq(workspaceMembers.orgId, consultantProfiles.orgId))
      .where(eq(workspaceMembers.workspaceId, id));

    return {
      workspace,
      myRole: membership.role,
      members,
    };
  });

  // ============================================================
  // POST /api/v1/workspaces/:id/invite -- Invite by email (must be workspace consultant/owner)
  // ============================================================
  app.post<{ Params: { id: string } }>('/workspaces/:id/invite', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const { id } = request.params;

    // Verify caller is owner or consultant in this workspace
    const membership = await getWorkspaceMembership(id, org.id);
    if (!membership || (membership.role !== 'owner' && membership.role !== 'consultant')) {
      return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Only workspace owners and consultants can invite members' } });
    }

    const body = inviteMemberSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid invite data', details: body.error.issues } });
    }

    // Find the org by email (look up Clerk org -- for now, search by matching org name or stored email)
    // In v1, we match against the consultant profile or org record
    // For simplicity, we store the invite with the email and resolve on acceptance
    // Check if there is already a consultant with this org email by checking organizations table
    // This is a simplified approach -- in production, Clerk user lookup would be used
    const inviteEmail = body.data.email;

    // Check if already a member by looking up org with matching clerkOrgId pattern
    // For v1, we just record the invite -- the invited user accepts by joining
    const [workspace] = await db.select().from(workspaces).where(eq(workspaces.id, id)).limit(1);
    if (!workspace) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Workspace not found' } });
    }

    await db.insert((await import('../../db/schema.js')).auditLogs).values(
      createAuditEntry('workspace.member.invited', 'workspace', {
        orgId: org.id,
        entityId: id,
        details: { invitedEmail: inviteEmail, role: body.data.role },
      })
    );

    // In a full implementation, this would send an email invitation
    // For v1, we return the invite details for the caller to share
    return reply.status(201).send({
      invite: {
        workspaceId: id,
        workspaceName: workspace.name,
        email: inviteEmail,
        role: body.data.role,
        status: 'pending',
      },
      message: 'Invite recorded. In v1, share the workspace link with the invitee directly.',
    });
  });

  // ============================================================
  // DELETE /api/v1/workspaces/:id/members/:memberId -- Remove member
  // ============================================================
  app.delete<{ Params: { id: string; memberId: string } }>('/workspaces/:id/members/:memberId', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const { id, memberId } = request.params;

    // Verify caller is owner of this workspace
    const membership = await getWorkspaceMembership(id, org.id);
    if (!membership || membership.role !== 'owner') {
      return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Only workspace owners can remove members' } });
    }

    // Find the member to remove
    const [targetMember] = await db.select()
      .from(workspaceMembers)
      .where(and(eq(workspaceMembers.id, memberId), eq(workspaceMembers.workspaceId, id)))
      .limit(1);

    if (!targetMember) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Member not found in this workspace' } });
    }

    // Cannot remove yourself as owner
    if (targetMember.orgId === org.id && targetMember.role === 'owner') {
      return reply.status(400).send({ error: { code: 'CANNOT_REMOVE_SELF', message: 'Cannot remove yourself as the workspace owner. Transfer ownership first.' } });
    }

    await db.delete(workspaceMembers)
      .where(eq(workspaceMembers.id, memberId));

    await db.insert((await import('../../db/schema.js')).auditLogs).values(
      createAuditEntry('workspace.member.removed', 'workspace', {
        orgId: org.id,
        entityId: id,
        details: { removedMemberId: memberId, removedOrgId: targetMember.orgId },
      })
    );

    return { success: true, message: 'Member removed from workspace' };
  });

  // ============================================================
  // GET /api/v1/workspaces/:id/oos -- List OOS files in workspace
  // ============================================================
  app.get<{ Params: { id: string }; Querystring: { status?: string } }>('/workspaces/:id/oos', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const { id } = request.params;
    const { status } = request.query;

    // Verify membership
    const membership = await getWorkspaceMembership(id, org.id);
    if (!membership) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Workspace not found or you are not a member' } });
    }

    // Get all member org IDs in this workspace
    const members = await db.select({ orgId: workspaceMembers.orgId })
      .from(workspaceMembers)
      .where(eq(workspaceMembers.workspaceId, id));

    const memberOrgIds = members.map(m => m.orgId);

    if (memberOrgIds.length === 0) {
      return { oosFiles: [] };
    }

    // Get OOS files from all workspace members
    const conditions = [
      sql`${oosFiles.orgId} IN (${sql.join(memberOrgIds.map(oid => sql`${oid}`), sql`, `)})`,
    ];

    if (status) {
      conditions.push(eq(oosFiles.status, status as 'draft' | 'published' | 'archived'));
    } else {
      // Default to published files only for non-owners
      conditions.push(eq(oosFiles.status, 'published'));
    }

    const files = await db.select({
      id: oosFiles.id,
      orgId: oosFiles.orgId,
      template: oosFiles.template,
      version: oosFiles.version,
      status: oosFiles.status,
      wordCount: oosFiles.wordCount,
      claimCount: oosFiles.claimCount,
      frontmatter: oosFiles.frontmatter,
      publishedAt: oosFiles.publishedAt,
      createdAt: oosFiles.createdAt,
    })
      .from(oosFiles)
      .where(and(...conditions))
      .orderBy(desc(oosFiles.publishedAt));

    // Attach consultant display names
    const profiles = await db.select({
      orgId: consultantProfiles.orgId,
      displayName: consultantProfiles.displayName,
      slug: consultantProfiles.slug,
    })
      .from(consultantProfiles)
      .where(sql`${consultantProfiles.orgId} IN (${sql.join(memberOrgIds.map(oid => sql`${oid}`), sql`, `)})`);

    const profileMap = new Map(profiles.map(p => [p.orgId, p]));

    const filesWithAuthors = files.map(f => ({
      ...f,
      author: profileMap.get(f.orgId) || null,
    }));

    return { oosFiles: filesWithAuthors };
  });
}
