/**
 * meeting-formats.ts -- CRUD for custom meeting formats (Phase 1 foundation).
 *
 * A format is a reusable, user-authored agenda (ordered sections). visibility
 * 'private' = creator only; 'org' = everyone in the org can see/run it.
 *
 * Routes (register under /api/v1):
 *   GET    /meeting-formats          list (own private + org-shared)
 *   GET    /meeting-formats/:id      one
 *   POST   /meeting-formats          create (any member)
 *   PATCH  /meeting-formats/:id      update (creator or admin)
 *   DELETE /meeting-formats/:id      soft-delete (creator or admin)
 */
import type { FastifyInstance, FastifyRequest } from 'fastify';
import { getAuth } from '@clerk/fastify';
import { z } from 'zod';
import { sql } from 'drizzle-orm';
import { db } from '../../config/database.js';
import { getAuthOrg } from '../../middleware/auth-helpers.js';
import { canEditOrgSettings } from '../../middleware/permissions.js';
import type { Role } from '../../services/membership.js';
import { normalizeStructure } from '../../shared/meeting-sections.js';
import { isFeatureEnabledForOrg } from '../../services/lab-features.js';
import { getTemplateBySlug } from '../../data/meeting-templates.js';

const upsertSchema = z.object({
  name: z.string().trim().min(1).max(255),
  description: z.string().max(2000).nullable().optional(),
  structure: z.array(z.any()).max(60).optional().default([]),
  visibility: z.enum(['private', 'org']).optional().default('org'),
});

function userId(request: FastifyRequest): string {
  try { return getAuth(request).userId || ''; } catch { return ''; }
}
// Creator OR an org-admin role (legacy founder with no member row counts as admin of their own org).
function isAdmin(request: FastifyRequest): boolean {
  const member = (request as unknown as { orgMember?: { role?: string } | null }).orgMember;
  if (!member?.role) return true;
  return canEditOrgSettings(member.role as Role);
}

export default async function meetingFormatsRoutes(app: FastifyInstance) {
  app.get('/meeting-formats', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in required' } });
    if (!(await isFeatureEnabledForOrg(org.id, 'meeting_formats'))) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Not available' } });
    const uid = userId(request);
    const rows = (await db.execute(sql`
      SELECT id, name, description, structure, visibility, created_by, updated_at
      FROM meeting_formats
      WHERE org_id = ${org.id} AND deleted_at IS NULL AND (visibility = 'org' OR created_by = ${uid})
      ORDER BY name`)) as any;
    return { formats: rows.rows || [] };
  });

  // GET /meeting-formats/template/:slug -- convert a library template into a
  // draft format structure (each template step becomes a 'notes' section). The
  // builder loads this as a starting point. Static segment, so it never clashes
  // with /:id below.
  app.get<{ Params: { slug: string } }>('/meeting-formats/template/:slug', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in required' } });
    if (!(await isFeatureEnabledForOrg(org.id, 'meeting_formats'))) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Not available' } });
    const tpl = getTemplateBySlug(request.params.slug);
    if (!tpl) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Template not found' } });
    const structure = normalizeStructure((tpl.steps || []).map((s) => ({
      type: 'notes', title: s.name, minutes: s.minutes, notes: s.text,
    })));
    return { name: tpl.shortName || tpl.title, description: tpl.description || '', structure };
  });

  app.get<{ Params: { id: string } }>('/meeting-formats/:id', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in required' } });
    if (!(await isFeatureEnabledForOrg(org.id, 'meeting_formats'))) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Not available' } });
    const uid = userId(request);
    const rows = (await db.execute(sql`
      SELECT id, name, description, structure, visibility, created_by, updated_at
      FROM meeting_formats
      WHERE id = ${request.params.id} AND org_id = ${org.id} AND deleted_at IS NULL
        AND (visibility = 'org' OR created_by = ${uid})
      LIMIT 1`)) as any;
    const row = (rows.rows || [])[0];
    if (!row) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Format not found' } });
    return row;
  });

  app.post('/meeting-formats', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in required' } });
    if (!(await isFeatureEnabledForOrg(org.id, 'meeting_formats'))) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Not available' } });
    const body = upsertSchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: body.error.issues[0]?.message || 'Invalid format' } });
    const structure = normalizeStructure(body.data.structure);
    const rows = (await db.execute(sql`
      INSERT INTO meeting_formats (org_id, created_by, name, description, structure, visibility)
      VALUES (${org.id}, ${userId(request)}, ${body.data.name}, ${body.data.description ?? null}, ${JSON.stringify(structure)}::jsonb, ${body.data.visibility})
      RETURNING id`)) as any;
    return reply.status(201).send({ id: (rows.rows || [])[0]?.id, structure });
  });

  app.patch<{ Params: { id: string } }>('/meeting-formats/:id', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in required' } });
    if (!(await isFeatureEnabledForOrg(org.id, 'meeting_formats'))) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Not available' } });
    const existing = (await db.execute(sql`SELECT created_by FROM meeting_formats WHERE id = ${request.params.id} AND org_id = ${org.id} AND deleted_at IS NULL LIMIT 1`)) as any;
    const row = (existing.rows || [])[0];
    if (!row) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Format not found' } });
    if (row.created_by !== userId(request) && !isAdmin(request)) {
      return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Only the creator or an admin can edit this format.' } });
    }
    const body = upsertSchema.safeParse(request.body);
    if (!body.success) return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: body.error.issues[0]?.message || 'Invalid format' } });
    const structure = normalizeStructure(body.data.structure);
    await db.execute(sql`
      UPDATE meeting_formats
      SET name = ${body.data.name}, description = ${body.data.description ?? null},
          structure = ${JSON.stringify(structure)}::jsonb, visibility = ${body.data.visibility}, updated_at = now()
      WHERE id = ${request.params.id} AND org_id = ${org.id}`);
    return { ok: true, structure };
  });

  app.delete<{ Params: { id: string } }>('/meeting-formats/:id', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in required' } });
    if (!(await isFeatureEnabledForOrg(org.id, 'meeting_formats'))) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Not available' } });
    const existing = (await db.execute(sql`SELECT created_by FROM meeting_formats WHERE id = ${request.params.id} AND org_id = ${org.id} AND deleted_at IS NULL LIMIT 1`)) as any;
    const row = (existing.rows || [])[0];
    if (!row) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Format not found' } });
    if (row.created_by !== userId(request) && !isAdmin(request)) {
      return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Only the creator or an admin can delete this format.' } });
    }
    await db.execute(sql`UPDATE meeting_formats SET deleted_at = now() WHERE id = ${request.params.id} AND org_id = ${org.id}`);
    return { ok: true };
  });
}
