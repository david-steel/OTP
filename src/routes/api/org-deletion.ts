/**
 * Owner self-serve organization deletion (phase 1) + restore.
 *
 * Same two-phase lifecycle as the super-admin surface (routes/api/admin.ts):
 * soft-delete -> restorable for 7 days -> dormant purge. The difference is the
 * gate: here the requester must be the OWNER of their OWN org. resolveRequestOrg
 * is NOT subject to the getAuthOrg deletion gate, so an owner can still reach the
 * restore endpoint while the org is pending.
 */
import type { FastifyInstance, FastifyRequest } from 'fastify';
import { getAuth } from '@clerk/fastify';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../config/database.js';
import { organizations, auditLogs } from '../../db/schema.js';
import { createAuditEntry } from '../../services/audit-logger.js';
import { resolveRequestOrg } from '../pages/pages.js';

// Both boxes checked AND the word exactly "DELETE" (case-sensitive).
const confirmSchema = z.object({
  ackAuthority: z.literal(true),
  ackIrreversible: z.literal(true),
  confirm: z.literal('DELETE'),
});

function isOwnerOf(request: FastifyRequest, org: { clerkOrgId: string }): boolean {
  const auth = getAuth(request);
  if (auth.userId && org.clerkOrgId === auth.userId) return true; // legacy founder = owner
  const m = (request as any).orgMember as { role?: string } | null;
  return m?.role === 'owner';
}

export default async function orgDeletionRoutes(app: FastifyInstance) {
  // POST /api/v1/org/request-deletion -- the owner soft-deletes their own org.
  app.post('/org/request-deletion', async (request, reply) => {
    const org = await resolveRequestOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in to your organization first.' } });
    if (!isOwnerOf(request, org)) return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Only the organization owner can delete it.' } });
    const parsed = confirmSchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: { code: 'CONFIRM_REQUIRED', message: 'Check both boxes and type DELETE (capitalized) to confirm.' } });
    if (org.deletionRequestedAt) return reply.status(409).send({ error: { code: 'ALREADY_PENDING', message: 'This organization is already scheduled for deletion.' } });
    const actor = getAuth(request).userId || 'owner';
    await db.update(organizations)
      .set({ deletionRequestedAt: new Date(), deletionRequestedBy: actor, updatedAt: new Date() })
      .where(eq(organizations.id, org.id));
    await db.insert(auditLogs).values(createAuditEntry('org.deletion.requested', 'organization', {
      orgId: org.id, entityId: org.id, details: { by: actor, self: true, name: org.name },
    }));
    return { ok: true, scheduledPurgeInDays: 7 };
  });

  // POST /api/v1/org/restore-deletion -- the owner cancels a pending deletion of
  // their own org, any time in the 7-day window.
  app.post('/org/restore-deletion', async (request, reply) => {
    const org = await resolveRequestOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in first.' } });
    if (!isOwnerOf(request, org)) return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Only the organization owner can restore it.' } });
    if (!org.deletionRequestedAt) return reply.status(409).send({ error: { code: 'NOT_PENDING', message: 'This organization is not scheduled for deletion.' } });
    const actor = getAuth(request).userId || 'owner';
    await db.update(organizations)
      .set({ deletionRequestedAt: null, deletionRequestedBy: null, updatedAt: new Date() })
      .where(eq(organizations.id, org.id));
    await db.insert(auditLogs).values(createAuditEntry('org.deletion.restored', 'organization', {
      orgId: org.id, entityId: org.id, details: { by: actor, self: true },
    }));
    return { ok: true };
  });
}
