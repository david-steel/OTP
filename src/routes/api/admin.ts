import type { FastifyInstance, FastifyRequest } from 'fastify';
import { getAuth } from '@clerk/fastify';
import { eq, sql } from 'drizzle-orm';
import { db } from '../../config/database.js';
import { oosFiles, auditLogs } from '../../db/schema.js';
import { renameOOSSchema } from '../../shared/validation.js';
import { createAuditEntry, AUDIT_ACTIONS } from '../../services/audit-logger.js';
import { isSuperAdmin } from '../../middleware/super-admin.js';
import { requireUuidParam } from '../../shared/param-validation.js';

function requireSuperAdmin(request: FastifyRequest) {
  return isSuperAdmin(request);
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
}
