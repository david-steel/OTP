import type { FastifyInstance, FastifyRequest } from 'fastify';
import { getAuth } from '@clerk/fastify';
import { eq, and, desc, sql, ilike } from 'drizzle-orm';
import { db } from '../../config/database.js';
import { organizations, oosFiles, consultantProfiles } from '../../db/schema.js';
import { resolveApiKey } from '../../middleware/api-key-auth.js';
import { createAuditEntry } from '../../services/audit-logger.js';
import { z } from 'zod';

const createProfileSchema = z.object({
  displayName: z.string().min(2).max(255),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens only'),
  bio: z.string().max(2000).optional(),
  headline: z.string().max(255).optional(),
  expertiseTags: z.array(z.string().max(50)).max(20).optional().default([]),
  contactEmail: z.string().email().optional(),
  website: z.string().url().optional(),
  linkedinUrl: z.string().url().optional(),
  avatarUrl: z.string().url().optional(),
  published: z.boolean().optional().default(false),
});

const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(255).optional(),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens only').optional(),
  bio: z.string().max(2000).optional(),
  headline: z.string().max(255).optional(),
  expertiseTags: z.array(z.string().max(50)).max(20).optional(),
  website: z.string().url().nullable().optional(),
  linkedinUrl: z.string().url().nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  published: z.boolean().optional(),
});

// Helper: get org from authenticated user (Clerk session OR API key)
async function getAuthOrg(request: FastifyRequest) {
  const auth = getAuth(request);
  if (auth.userId) {
    const orgArr = await db.select().from(organizations).where(eq(organizations.clerkOrgId, auth.userId)).limit(1);
    if (orgArr[0]) return orgArr[0];
  }

  const apiKeyCtx = await resolveApiKey(request);
  if (apiKeyCtx) {
    const orgArr = await db.select().from(organizations).where(eq(organizations.id, apiKeyCtx.orgId)).limit(1);
    return orgArr[0] || null;
  }

  return null;
}

export default async function consultantRoutes(app: FastifyInstance) {

  // ============================================================
  // POST /api/v1/consultants/profile -- Create consultant profile
  // ============================================================
  app.post('/consultants/profile', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const body = createProfileSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({
        error: { code: 'VALIDATION_FAILED', message: 'Invalid profile data', details: body.error.issues },
      });
    }

    // Check if profile already exists for this org
    const [existing] = await db.select().from(consultantProfiles).where(eq(consultantProfiles.orgId, org.id)).limit(1);
    if (existing) {
      return reply.status(409).send({ error: { code: 'PROFILE_EXISTS', message: 'Consultant profile already exists for this organization. Use PUT to update.' } });
    }

    // Check slug uniqueness
    const [slugTaken] = await db.select({ id: consultantProfiles.id }).from(consultantProfiles).where(eq(consultantProfiles.slug, body.data.slug)).limit(1);
    if (slugTaken) {
      return reply.status(409).send({ error: { code: 'SLUG_TAKEN', message: 'This slug is already in use. Choose a different one.' } });
    }

    const [profile] = await db.insert(consultantProfiles).values({
      orgId: org.id,
      displayName: body.data.displayName,
      slug: body.data.slug,
      bio: body.data.bio || null,
      headline: body.data.headline || null,
      expertiseTags: body.data.expertiseTags as any,
      contactEmail: body.data.contactEmail || null,
      website: body.data.website || null,
      linkedinUrl: body.data.linkedinUrl || null,
      avatarUrl: body.data.avatarUrl || null,
      published: body.data.published,
    }).returning();

    await db.insert((await import('../../db/schema.js')).auditLogs).values(
      createAuditEntry('consultant.profile.created', 'consultant_profile', {
        orgId: org.id,
        entityId: profile.id,
        details: { displayName: body.data.displayName, slug: body.data.slug },
      })
    );

    return reply.status(201).send({ profile });
  });

  // ============================================================
  // PUT /api/v1/consultants/profile -- Update consultant profile
  // ============================================================
  app.put('/consultants/profile', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const body = updateProfileSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid data', details: body.error.issues } });
    }

    const [existing] = await db.select().from(consultantProfiles).where(eq(consultantProfiles.orgId, org.id)).limit(1);
    if (!existing) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'No consultant profile found. Create one first with POST.' } });
    }

    // If slug is being changed, check uniqueness
    if (body.data.slug && body.data.slug !== existing.slug) {
      const [slugTaken] = await db.select({ id: consultantProfiles.id }).from(consultantProfiles).where(eq(consultantProfiles.slug, body.data.slug)).limit(1);
      if (slugTaken) {
        return reply.status(409).send({ error: { code: 'SLUG_TAKEN', message: 'This slug is already in use. Choose a different one.' } });
      }
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (body.data.displayName !== undefined) updates.displayName = body.data.displayName;
    if (body.data.slug !== undefined) updates.slug = body.data.slug;
    if (body.data.bio !== undefined) updates.bio = body.data.bio;
    if (body.data.headline !== undefined) updates.headline = body.data.headline;
    if (body.data.expertiseTags !== undefined) updates.expertiseTags = body.data.expertiseTags;
    if (body.data.website !== undefined) updates.website = body.data.website;
    if (body.data.linkedinUrl !== undefined) updates.linkedinUrl = body.data.linkedinUrl;
    if (body.data.avatarUrl !== undefined) updates.avatarUrl = body.data.avatarUrl;
    if (body.data.published !== undefined) updates.published = body.data.published;

    const [updated] = await db.update(consultantProfiles)
      .set(updates)
      .where(eq(consultantProfiles.orgId, org.id))
      .returning();

    await db.insert((await import('../../db/schema.js')).auditLogs).values(
      createAuditEntry('consultant.profile.updated', 'consultant_profile', {
        orgId: org.id,
        entityId: updated.id,
        details: updates,
      })
    );

    return { profile: updated };
  });

  // ============================================================
  // GET /api/v1/consultants/profile -- Get own profile
  // ============================================================
  app.get('/consultants/profile', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const [profile] = await db.select().from(consultantProfiles).where(eq(consultantProfiles.orgId, org.id)).limit(1);
    if (!profile) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'No consultant profile found. Create one with POST /consultants/profile.' } });
    }

    return { profile };
  });

  // ============================================================
  // GET /api/v1/consultants/browse -- Public, list published profiles
  // ============================================================
  app.get<{ Querystring: { page?: string; limit?: string; tag?: string; q?: string } }>(
    '/consultants/browse',
    async (request, reply) => {
      const page = Math.max(1, parseInt(request.query.page || '1', 10));
      const limit = Math.min(Math.max(1, parseInt(request.query.limit || '20', 10)), 100);
      const offset = (page - 1) * limit;
      const { tag, q } = request.query;

      // Build conditions
      const conditions = [eq(consultantProfiles.published, true)];

      // Filter by expertise tag (check if tag is contained in the jsonb array)
      if (tag) {
        conditions.push(sql`${consultantProfiles.expertiseTags}::jsonb @> ${JSON.stringify([tag])}::jsonb`);
      }

      // Text search on displayName or headline
      if (q) {
        conditions.push(
          sql`(${consultantProfiles.displayName} ILIKE ${'%' + q + '%'} OR ${consultantProfiles.headline} ILIKE ${'%' + q + '%'})`
        );
      }

      const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);

      const profiles = await db.select({
        id: consultantProfiles.id,
        displayName: consultantProfiles.displayName,
        slug: consultantProfiles.slug,
        headline: consultantProfiles.headline,
        expertiseTags: consultantProfiles.expertiseTags,
        avatarUrl: consultantProfiles.avatarUrl,
        createdAt: consultantProfiles.createdAt,
      })
        .from(consultantProfiles)
        .where(whereClause)
        .orderBy(desc(consultantProfiles.createdAt))
        .limit(limit)
        .offset(offset);

      // Get total count for pagination
      const [countResult] = await db.select({ total: sql<number>`COUNT(*)` })
        .from(consultantProfiles)
        .where(whereClause);

      const total = Number(countResult?.total || 0);

      return {
        profiles,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }
  );

  // ============================================================
  // GET /api/v1/consultants/:slug -- Public, get profile by slug + published OOS
  // ============================================================
  app.get<{ Params: { slug: string } }>('/consultants/:slug', async (request, reply) => {
    const { slug } = request.params;

    const [profile] = await db.select()
      .from(consultantProfiles)
      .where(and(eq(consultantProfiles.slug, slug), eq(consultantProfiles.published, true)))
      .limit(1);

    if (!profile) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Consultant profile not found' } });
    }

    // Get their published OOS files
    const publishedOos = await db.select({
      id: oosFiles.id,
      template: oosFiles.template,
      version: oosFiles.version,
      wordCount: oosFiles.wordCount,
      claimCount: oosFiles.claimCount,
      frontmatter: oosFiles.frontmatter,
      confidenceDistribution: oosFiles.confidenceDistribution,
      publishedAt: oosFiles.publishedAt,
    })
      .from(oosFiles)
      .where(and(eq(oosFiles.orgId, profile.orgId), eq(oosFiles.status, 'published')))
      .orderBy(desc(oosFiles.publishedAt));

    // Get org info (public fields only)
    const [org] = await db.select({
      id: organizations.id,
      name: organizations.name,
      industry: organizations.industry,
      size: organizations.size,
      badge: organizations.badge,
      qualityTier: organizations.qualityTier,
      agenticLevel: organizations.agenticLevel,
    })
      .from(organizations)
      .where(eq(organizations.id, profile.orgId))
      .limit(1);

    return {
      profile: {
        id: profile.id,
        displayName: profile.displayName,
        slug: profile.slug,
        bio: profile.bio,
        headline: profile.headline,
        expertiseTags: profile.expertiseTags,
        website: profile.website,
        linkedinUrl: profile.linkedinUrl,
        avatarUrl: profile.avatarUrl,
        createdAt: profile.createdAt,
      },
      org: org || null,
      oosFiles: publishedOos,
    };
  });
}
