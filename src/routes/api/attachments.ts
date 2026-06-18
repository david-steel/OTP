// File attachments on to-dos, carryable onto Issues (tickets) and
// Quarterly Priorities (rocks).
//
//   POST   /api/v1/attachments                    upload + link in one shot
//   POST   /api/v1/attachments/:id/links          carry onto another entity
//   DELETE /api/v1/attachments/:id/links          unlink (last link deletes blob)
//   GET    /api/v1/attachments/by-entity          list for one entity (no blob)
//   GET    /api/v1/attachments/:id/download       stream the blob
//
// Tenant safety: this repo has NO global org guard -- every query here
// enforces organization_id = caller's org and 404s on miss (mirrors
// tickets.ts post-IDOR patterns). Writes also gate read-only roles
// (observer/inactive/free) like dashboard-preferences does.
//
// Serve-safety: downloads are ALWAYS Content-Disposition: attachment with
// X-Content-Type-Options: nosniff, and any mime that isn't a known-safe
// image/pdf is served as application/octet-stream -- an uploaded .html
// can never execute in the app's origin (stored-XSS guard).
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { eq, and, sql, isNull, inArray } from 'drizzle-orm';
import { getAuth } from '@clerk/fastify';
import { db } from '../../config/database.js';
import { attachments, attachmentLinks, todos, tickets, rocks, meetings, auditLogs } from '../../db/schema.js';
import { getAuthOrg, gateReadOnlyRole } from '../../middleware/auth-helpers.js';
import { resolveApiKey, requireScope } from '../../middleware/api-key-auth.js';
import { createAuditEntry } from '../../services/audit-logger.js';
import { requireUuidParam } from '../../shared/param-validation.js';
import { createRateLimiter } from '../../shared/rate-limiter.js';
import {
  MAX_ATTACHMENT_BYTES,
  createAttachmentSchema,
  linkAttachmentSchema,
  attachmentEntityTypeSchema,
  decodedBase64Size,
  sanitizeFilename,
  responseMimeFor,
  contentDispositionFor,
  type AttachmentEntityType,
} from '../../shared/attachments.js';
import { z } from 'zod';

// Generous: the dashboard fans out one count-fetch per visible todo/issue/rock.
const checkReadRateLimit = createRateLimiter({ windowMs: 60_000, maxRequests: 240 });
// Uploads are heavier; keep the write budget tighter.
const checkWriteRateLimit = createRateLimiter({ windowMs: 60_000, maxRequests: 30 });

// 5 MB decoded ~= 6.84 MB base64 + JSON envelope. Fastify's default
// bodyLimit (1 MB) would reject every real upload, so the upload route
// carries its own limit. Applies to that route only.
const UPLOAD_BODY_LIMIT = 8 * 1024 * 1024;

const byEntityQuerySchema = z.object({
  entityType: attachmentEntityTypeSchema,
  entityId: z.string().uuid(),
});

async function authedOrFail(request: FastifyRequest, reply: FastifyReply) {
  const org = await getAuthOrg(request);
  if (!org) {
    reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    return null;
  }
  return org;
}

async function gateWriteScope(request: FastifyRequest, reply: FastifyReply): Promise<boolean> {
  const apiKeyCtx = await resolveApiKey(request);
  if (apiKeyCtx && !requireScope(apiKeyCtx, 'write')) {
    reply.status(403).send({ error: { code: 'INSUFFICIENT_SCOPE', message: "API key requires 'write' scope" } });
    return false;
  }
  // Read-only roles (observer/inactive/free) may not mutate attachments.
  return gateReadOnlyRole(request, reply);
}

/**
 * Verify the link target exists IN THIS ORG (and isn't soft-deleted).
 * 'issue' rows live in the tickets table. Returns false on miss -- callers
 * 404 so the response doesn't leak whether another tenant's uuid exists.
 */
async function entityExistsInOrg(orgId: string, entityType: AttachmentEntityType, entityId: string): Promise<boolean> {
  if (entityType === 'todo') {
    const [row] = await db.select({ id: todos.id }).from(todos)
      .where(and(eq(todos.id, entityId), eq(todos.organizationId, orgId), isNull(todos.deletedAt)))
      .limit(1);
    return !!row;
  }
  if (entityType === 'issue') {
    const [row] = await db.select({ id: tickets.id }).from(tickets)
      .where(and(eq(tickets.id, entityId), eq(tickets.orgId, orgId), isNull(tickets.deletedAt)))
      .limit(1);
    return !!row;
  }
  if (entityType === 'meeting') {
    const [row] = await db.select({ id: meetings.id }).from(meetings)
      .where(and(eq(meetings.id, entityId), eq(meetings.organizationId, orgId), isNull(meetings.deletedAt)))
      .limit(1);
    return !!row;
  }
  const [row] = await db.select({ id: rocks.id }).from(rocks)
    .where(and(eq(rocks.id, entityId), eq(rocks.organizationId, orgId), isNull(rocks.deletedAt)))
    .limit(1);
  return !!row;
}

export default async function attachmentRoutes(app: FastifyInstance) {

  // POST /api/v1/attachments -- upload a file and link it to one entity.
  app.post('/attachments', { bodyLimit: UPLOAD_BODY_LIMIT }, async (request, reply) => {
    if (!checkWriteRateLimit(request.ip)) {
      return reply.status(429).send({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } });
    }
    if (!(await gateWriteScope(request, reply))) return;
    const org = await authedOrFail(request, reply);
    if (!org) return;

    const body = createAttachmentSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid attachment data', details: body.error.issues } });
    }
    const d = body.data;

    // Size gate BEFORE decoding so an oversized payload never allocates 5MB+.
    const decodedSize = decodedBase64Size(d.dataBase64);
    if (decodedSize < 0) {
      return reply.status(400).send({ error: { code: 'INVALID_BASE64', message: 'dataBase64 is not valid base64' } });
    }
    if (decodedSize === 0) {
      return reply.status(400).send({ error: { code: 'EMPTY_FILE', message: 'Attachment is empty' } });
    }
    if (decodedSize > MAX_ATTACHMENT_BYTES) {
      return reply.status(413).send({ error: { code: 'TOO_LARGE', message: `Attachment exceeds the ${Math.floor(MAX_ATTACHMENT_BYTES / (1024 * 1024))} MB limit` } });
    }

    // Org-scope the link target BEFORE writing anything.
    if (!(await entityExistsInOrg(org.id, d.link.entityType, d.link.entityId))) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Link target not found' } });
    }

    const data = Buffer.from(d.dataBase64.replace(/\s+/g, ''), 'base64');
    const filename = sanitizeFilename(d.filename);
    const uploadedBy = getAuth(request).userId || 'api_key';

    // Attachment + first link are atomic: an attachment row must never
    // exist without at least one link (the unlink route relies on this).
    const created = await db.transaction(async (tx) => {
      const [attachment] = await tx.insert(attachments).values({
        organizationId: org.id,
        filename,
        mimeType: d.mimeType,
        sizeBytes: data.length,
        data,
        uploadedBy,
      }).returning({
        id: attachments.id,
        filename: attachments.filename,
        mimeType: attachments.mimeType,
        sizeBytes: attachments.sizeBytes,
        createdAt: attachments.createdAt,
      });
      await tx.insert(attachmentLinks).values({
        organizationId: org.id,
        attachmentId: attachment.id,
        entityType: d.link.entityType,
        entityId: d.link.entityId,
      });
      return attachment;
    });

    await db.insert(auditLogs).values(createAuditEntry('attachment.created', 'attachment', {
      orgId: org.id, entityId: created.id,
      details: { filename, sizeBytes: data.length, linkedTo: d.link },
    }));

    return reply.status(201).send({ attachment: created });
  });

  // POST /api/v1/attachments/:id/links -- carry an existing attachment onto
  // another entity. No blob copy; duplicates are upsert-ignored.
  app.post<{ Params: { id: string } }>('/attachments/:id/links', async (request, reply) => {
    if (!checkWriteRateLimit(request.ip)) {
      return reply.status(429).send({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } });
    }
    const id = requireUuidParam(request, reply);
    if (!id) return;
    if (!(await gateWriteScope(request, reply))) return;
    const org = await authedOrFail(request, reply);
    if (!org) return;

    const body = linkAttachmentSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid link data', details: body.error.issues } });
    }

    // Org-scope BOTH sides: the attachment and the target entity.
    const [attachment] = await db.select({ id: attachments.id }).from(attachments)
      .where(and(eq(attachments.id, id), eq(attachments.organizationId, org.id)))
      .limit(1);
    if (!attachment) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Attachment not found' } });

    if (!(await entityExistsInOrg(org.id, body.data.entityType, body.data.entityId))) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Link target not found' } });
    }

    const [link] = await db.insert(attachmentLinks).values({
      organizationId: org.id,
      attachmentId: id,
      entityType: body.data.entityType,
      entityId: body.data.entityId,
    }).onConflictDoNothing().returning();

    if (link) {
      await db.insert(auditLogs).values(createAuditEntry('attachment.linked', 'attachment', {
        orgId: org.id, entityId: id, details: { entityType: body.data.entityType, entityId: body.data.entityId },
      }));
    }

    // link === undefined means the row already existed -- still a success.
    return reply.status(201).send({ ok: true, created: !!link });
  });

  // DELETE /api/v1/attachments/:id/links -- unlink from one entity. When the
  // last link goes, the attachment row goes with it (no orphan blobs).
  app.delete<{ Params: { id: string } }>('/attachments/:id/links', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    if (!(await gateWriteScope(request, reply))) return;
    const org = await authedOrFail(request, reply);
    if (!org) return;

    const body = linkAttachmentSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid link data', details: body.error.issues } });
    }

    // Unlink + orphan cleanup in one transaction so a concurrent carry
    // can't race the "was that the last link?" check.
    const result = await db.transaction(async (tx) => {
      const [removed] = await tx.delete(attachmentLinks)
        .where(and(
          eq(attachmentLinks.attachmentId, id),
          eq(attachmentLinks.organizationId, org.id),
          eq(attachmentLinks.entityType, body.data.entityType),
          eq(attachmentLinks.entityId, body.data.entityId),
        )).returning({ id: attachmentLinks.id });
      if (!removed) return { found: false, attachmentDeleted: false };

      const [remaining] = await tx.select({ count: sql<number>`cast(count(*) as int)` })
        .from(attachmentLinks)
        .where(and(eq(attachmentLinks.attachmentId, id), eq(attachmentLinks.organizationId, org.id)));
      if ((remaining?.count || 0) === 0) {
        await tx.delete(attachments)
          .where(and(eq(attachments.id, id), eq(attachments.organizationId, org.id)));
        return { found: true, attachmentDeleted: true };
      }
      return { found: true, attachmentDeleted: false };
    });

    if (!result.found) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Attachment link not found' } });

    await db.insert(auditLogs).values(createAuditEntry('attachment.unlinked', 'attachment', {
      orgId: org.id, entityId: id,
      details: { entityType: body.data.entityType, entityId: body.data.entityId, attachmentDeleted: result.attachmentDeleted },
    }));

    return { ok: true, attachmentDeleted: result.attachmentDeleted };
  });

  // GET /api/v1/attachments/by-entity?entityType=&entityId= -- metadata list
  // for one entity (never the blob). Org scoping rides on the link rows.
  app.get<{ Querystring: { entityType?: string; entityId?: string } }>('/attachments/by-entity', async (request, reply) => {
    if (!checkReadRateLimit(request.ip)) {
      return reply.status(429).send({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } });
    }
    const org = await authedOrFail(request, reply);
    if (!org) return;

    const q = byEntityQuerySchema.safeParse(request.query);
    if (!q.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'entityType and entityId (uuid) are required', details: q.error.issues } });
    }

    const rows = await db.select({
      id: attachments.id,
      filename: attachments.filename,
      mimeType: attachments.mimeType,
      sizeBytes: attachments.sizeBytes,
      createdAt: attachments.createdAt,
    })
      .from(attachmentLinks)
      .innerJoin(attachments, eq(attachmentLinks.attachmentId, attachments.id))
      .where(and(
        eq(attachmentLinks.organizationId, org.id),
        eq(attachments.organizationId, org.id),
        eq(attachmentLinks.entityType, q.data.entityType),
        eq(attachmentLinks.entityId, q.data.entityId),
      ))
      .orderBy(attachments.createdAt);

    return { attachments: rows, total: rows.length };
  });

  // GET /api/v1/attachments/:id/download -- stream the blob. Org-scoped 404.
  app.get<{ Params: { id: string } }>('/attachments/:id/download', async (request, reply) => {
    if (!checkReadRateLimit(request.ip)) {
      return reply.status(429).send({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } });
    }
    const id = requireUuidParam(request, reply);
    if (!id) return;
    const org = await authedOrFail(request, reply);
    if (!org) return;

    const [row] = await db.select().from(attachments)
      .where(and(eq(attachments.id, id), eq(attachments.organizationId, org.id)))
      .limit(1);
    if (!row) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Attachment not found' } });

    // Always a download, never a page: attachment disposition + nosniff +
    // octet-stream for anything not on the safe-inline allowlist means an
    // uploaded HTML/SVG/JS file cannot run in the app's origin.
    return reply
      .header('Content-Disposition', contentDispositionFor(row.filename))
      .header('X-Content-Type-Options', 'nosniff')
      .header('Cache-Control', 'private, max-age=0')
      .type(responseMimeFor(row.mimeType))
      .send(Buffer.isBuffer(row.data) ? row.data : Buffer.from(row.data));
  });

  // GET /api/v1/attachments/counts?entityType=&entityIds=a,b,c -- batched
  // counts so list views can show the paperclip badge without N requests.
  app.get<{ Querystring: { entityType?: string; entityIds?: string } }>('/attachments/counts', async (request, reply) => {
    if (!checkReadRateLimit(request.ip)) {
      return reply.status(429).send({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } });
    }
    const org = await authedOrFail(request, reply);
    if (!org) return;

    const typeParsed = attachmentEntityTypeSchema.safeParse(request.query.entityType);
    const ids = String(request.query.entityIds || '')
      .split(',').map((s) => s.trim()).filter((s) => /^[0-9a-f-]{36}$/i.test(s))
      .slice(0, 200);
    if (!typeParsed.success || ids.length === 0) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'entityType and entityIds (comma-separated uuids) are required' } });
    }

    const rows = await db.select({
      entityId: attachmentLinks.entityId,
      count: sql<number>`cast(count(*) as int)`,
    })
      .from(attachmentLinks)
      .where(and(
        eq(attachmentLinks.organizationId, org.id),
        eq(attachmentLinks.entityType, typeParsed.data),
        inArray(attachmentLinks.entityId, ids),
      ))
      .groupBy(attachmentLinks.entityId);

    const counts: Record<string, number> = {};
    for (const r of rows) counts[r.entityId] = r.count;
    return { counts };
  });
}
