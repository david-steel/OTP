import type { FastifyInstance, FastifyRequest } from 'fastify';
import { getAuth } from '@clerk/fastify';
import { eq, sql, desc } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../config/database.js';
import { oosFiles, auditLogs, newsletterSubscribers } from '../../db/schema.js';
import { renameOOSSchema } from '../../shared/validation.js';
import { createAuditEntry, AUDIT_ACTIONS } from '../../services/audit-logger.js';
import { isSuperAdmin } from '../../middleware/super-admin.js';
import { requireUuidParam } from '../../shared/param-validation.js';
import { addContactToAudience } from '../../services/resend-audience.js';

const founderAddSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().max(200).optional(),
  notes: z.string().max(2000).optional(),
  source: z.string().max(50).default('founder-add'),
});

function requireSuperAdmin(request: FastifyRequest) {
  return isSuperAdmin(request);
}

// Allow EITHER Clerk super-admin auth OR the shared query-key used by /admin/leads.
// Lets shell CLIs and dashboard pages share endpoints without two parallel routes.
function requireAdminOrKey(request: FastifyRequest): boolean {
  if (isSuperAdmin(request)) return true;
  const key = (request.query as { key?: string } | undefined)?.key;
  return key === 'otp-founding-2026';
}

export default async function adminRoutes(app: FastifyInstance) {

  // ============================================================
  // GET /api/v1/admin/oos -- List all OOS files (super admin only)
  // ============================================================
  app.get('/admin/oos', async (request, reply) => {
    if (!requireSuperAdmin(request)) {
      return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Super admin access required' } });
    }

    const result = await db.execute(sql`
      SELECT f.*, o.name AS org_name
      FROM oos_files f JOIN organizations o ON f.org_id = o.id
      ORDER BY f.created_at DESC
    `);

    return { oosFiles: result.rows || [] };
  });

  // ============================================================
  // DELETE /api/v1/admin/oos/:id -- Admin delete (no ownership check)
  // ============================================================
  app.delete<{ Params: { id: string } }>('/admin/oos/:id', async (request, reply) => {
    if (!requireSuperAdmin(request)) {
      return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Super admin access required' } });
    }

    const id = requireUuidParam(request, reply);
    if (!id) return;
    const [oosFile] = await db.select().from(oosFiles).where(eq(oosFiles.id, id)).limit(1);
    if (!oosFile) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'OOS file not found' } });

    // Delete graph data (not managed by Drizzle cascade)
    await db.execute(sql`DELETE FROM graph_edges WHERE oos_file_id = ${id}`);
    await db.execute(sql`DELETE FROM graph_nodes WHERE oos_file_id = ${id}`);

    // Delete OOS file (claims + claim_similarities cascade via FK)
    await db.delete(oosFiles).where(eq(oosFiles.id, id));

    const auth = getAuth(request);
    await db.insert(auditLogs).values(
      createAuditEntry(AUDIT_ACTIONS.OOS_DELETED, 'oos_file', {
        orgId: oosFile.orgId, entityId: id,
        details: { adminAction: true, adminUserId: auth.userId, version: oosFile.version, template: oosFile.template, status: oosFile.status },
      })
    );

    return { deleted: true, id };
  });

  // ============================================================
  // PATCH /api/v1/admin/oos/:id/rename -- Admin rename (no ownership check)
  // ============================================================
  app.patch<{ Params: { id: string } }>('/admin/oos/:id/rename', async (request, reply) => {
    if (!requireSuperAdmin(request)) {
      return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Super admin access required' } });
    }

    const id = requireUuidParam(request, reply);
    if (!id) return;
    const body = renameOOSSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid name', details: body.error.issues } });
    }

    const [oosFile] = await db.select().from(oosFiles).where(eq(oosFiles.id, id)).limit(1);
    if (!oosFile) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'OOS file not found' } });

    const [updated] = await db.update(oosFiles)
      .set({ name: body.data.name, updatedAt: new Date() })
      .where(eq(oosFiles.id, id))
      .returning();

    const auth = getAuth(request);
    await db.insert(auditLogs).values(
      createAuditEntry(AUDIT_ACTIONS.OOS_RENAMED, 'oos_file', {
        orgId: oosFile.orgId, entityId: id,
        details: { adminAction: true, adminUserId: auth.userId, oldName: oosFile.name, newName: body.data.name },
      })
    );

    return { oosFile: updated };
  });

  // ============================================================
  // GET /api/v1/admin/subscribers -- list newsletter subscribers + conversion stats
  // ============================================================
  app.get('/admin/subscribers', async (request, reply) => {
    if (!requireAdminOrKey(request)) {
      return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Super admin access required' } });
    }

    const subs = await db
      .select()
      .from(newsletterSubscribers)
      .orderBy(desc(newsletterSubscribers.subscribedAt));

    const total = subs.length;
    const converted = subs.filter(s => s.convertedAt !== null).length;
    const unsubscribed = subs.filter(s => s.unsubscribedAt !== null).length;
    const active = total - unsubscribed;
    const conversionRate = active > 0 ? Math.round((converted / active) * 1000) / 10 : 0;

    const bySource = new Map<string, { count: number; converted: number }>();
    for (const s of subs) {
      const bucket = bySource.get(s.source) ?? { count: 0, converted: 0 };
      bucket.count += 1;
      if (s.convertedAt) bucket.converted += 1;
      bySource.set(s.source, bucket);
    }

    return {
      stats: {
        total,
        active,
        converted,
        unsubscribed,
        conversionRate,
        bySource: Object.fromEntries(bySource),
      },
      subscribers: subs,
    };
  });

  // ============================================================
  // POST /api/v1/admin/subscribers -- founder-add a contact (someone you met)
  // ============================================================
  app.post('/admin/subscribers', async (request, reply) => {
    if (!requireAdminOrKey(request)) {
      return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Super admin access required' } });
    }

    const parsed = founderAddSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: { code: 'INVALID_INPUT', message: 'Invalid input', details: parsed.error.issues },
      });
    }

    const { email, name, notes, source } = parsed.data;
    const lowered = email.toLowerCase();

    const [existing] = await db
      .select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, lowered))
      .limit(1);

    if (existing) {
      // Refresh name/notes if provided, do not change source/subscribedAt.
      const patch: Partial<typeof newsletterSubscribers.$inferInsert> = {};
      if (name !== undefined) patch.name = name;
      if (notes !== undefined) patch.notes = notes;
      if (existing.unsubscribedAt) patch.unsubscribedAt = null;

      const [updated] = Object.keys(patch).length > 0
        ? await db
            .update(newsletterSubscribers)
            .set(patch)
            .where(eq(newsletterSubscribers.id, existing.id))
            .returning()
        : [existing];

      const resendId = await addContactToAudience({ email: lowered, name: updated.name });
      if (resendId && resendId !== existing.resendContactId) {
        await db
          .update(newsletterSubscribers)
          .set({ resendContactId: resendId })
          .where(eq(newsletterSubscribers.id, existing.id));
      }

      return { subscriber: updated, status: 'updated', alreadyConverted: existing.convertedAt !== null };
    }

    const [inserted] = await db
      .insert(newsletterSubscribers)
      .values({
        email: lowered,
        name: name ?? null,
        notes: notes ?? null,
        source,
        doubleOptInConfirmed: true,
      })
      .returning();

    const resendId = await addContactToAudience({ email: lowered, name: inserted.name });
    if (resendId) {
      await db
        .update(newsletterSubscribers)
        .set({ resendContactId: resendId })
        .where(eq(newsletterSubscribers.id, inserted.id));
      inserted.resendContactId = resendId;
    }

    return { subscriber: inserted, status: 'created' };
  });
}
