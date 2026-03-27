import type { FastifyInstance } from 'fastify';
import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../../config/database.js';
import { consultantProfiles, inquiries } from '../../db/schema.js';
import { getAuthOrg } from '../../middleware/auth-helpers.js';
import { createAuditEntry } from '../../services/audit-logger.js';
import { requireUuidParam } from '../../shared/param-validation.js';
import { z } from 'zod';

const createInquirySchema = z.object({
  consultantProfileId: z.string().uuid(),
  senderName: z.string().min(1).max(255),
  senderEmail: z.string().email(),
  senderCompany: z.string().max(255).optional(),
  subject: z.string().min(2).max(500),
  message: z.string().min(10).max(5000),
});

const updateInquirySchema = z.object({
  status: z.enum(['new', 'read', 'replied', 'closed']),
  notes: z.string().max(2000).optional(),
});

// Simple in-memory rate limiter for public inquiry submission
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 10; // 10 inquiries per hour per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

// Periodically clean up expired rate limit entries
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000).unref(); // Clean up every 5 minutes

export default async function inquiryRoutes(app: FastifyInstance) {

  // ============================================================
  // POST /api/v1/inquiries -- Public (rate-limited), submit inquiry to consultant
  // ============================================================
  app.post('/inquiries', async (request, reply) => {
    // Rate limit by IP
    const clientIp = request.ip || 'unknown';
    if (!checkRateLimit(clientIp)) {
      return reply.status(429).send({
        error: { code: 'RATE_LIMITED', message: 'Too many inquiries. Please try again later.' },
      });
    }

    const body = createInquirySchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({
        error: { code: 'VALIDATION_FAILED', message: 'Invalid inquiry data', details: body.error.issues },
      });
    }

    // Verify the consultant profile exists and is published
    const [profile] = await db.select()
      .from(consultantProfiles)
      .where(and(eq(consultantProfiles.id, body.data.consultantProfileId), eq(consultantProfiles.published, true)))
      .limit(1);

    if (!profile) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Consultant not found or profile is not published' } });
    }

    const [inquiry] = await db.insert(inquiries).values({
      consultantProfileId: body.data.consultantProfileId,
      orgId: profile.orgId,
      senderName: body.data.senderName,
      senderEmail: body.data.senderEmail,
      senderCompany: body.data.senderCompany || null,
      subject: body.data.subject,
      message: body.data.message,
      status: 'new',
    }).returning();

    await db.insert((await import('../../db/schema.js')).auditLogs).values(
      createAuditEntry('inquiry.submitted', 'inquiry', {
        orgId: profile.orgId,
        entityId: inquiry.id,
        details: {
          senderEmail: body.data.senderEmail,
          consultantProfileId: body.data.consultantProfileId,
          subject: body.data.subject,
        },
      })
    );

    return reply.status(201).send({
      inquiry: {
        id: inquiry.id,
        status: inquiry.status,
        createdAt: inquiry.createdAt,
      },
      message: 'Inquiry submitted successfully. The consultant will be notified.',
    });
  });

  // ============================================================
  // GET /api/v1/inquiries -- Consultant only, list received inquiries
  // ============================================================
  app.get<{ Querystring: { status?: string; limit?: string; page?: string } }>(
    '/inquiries',
    async (request, reply) => {
      const org = await getAuthOrg(request);
      if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

      // Verify this org has a consultant profile
      const [profile] = await db.select().from(consultantProfiles).where(eq(consultantProfiles.orgId, org.id)).limit(1);
      if (!profile) {
        return reply.status(403).send({ error: { code: 'CONSULTANT_REQUIRED', message: 'You must have a consultant profile to view inquiries.' } });
      }

      const page = Math.max(1, parseInt(request.query.page || '1', 10));
      const limit = Math.min(Math.max(1, parseInt(request.query.limit || '20', 10)), 100);
      const offset = (page - 1) * limit;
      const { status } = request.query;

      const conditions = [eq(inquiries.orgId, org.id)];
      if (status) {
        conditions.push(eq(inquiries.status, status as 'new' | 'read' | 'replied' | 'closed'));
      }

      const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);

      const inquiryList = await db.select()
        .from(inquiries)
        .where(whereClause)
        .orderBy(desc(inquiries.createdAt))
        .limit(limit)
        .offset(offset);

      const [countResult] = await db.select({ total: sql<number>`COUNT(*)` })
        .from(inquiries)
        .where(whereClause);

      const total = Number(countResult?.total || 0);

      // Count by status for quick summary
      const statusCounts = await db.select({
        status: inquiries.status,
        count: sql<number>`COUNT(*)`,
      })
        .from(inquiries)
        .where(eq(inquiries.orgId, org.id))
        .groupBy(inquiries.status);

      const summary: Record<string, number> = {};
      for (const row of statusCounts) {
        summary[row.status] = Number(row.count);
      }

      return {
        inquiries: inquiryList,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        summary,
      };
    }
  );

  // ============================================================
  // PUT /api/v1/inquiries/:id -- Update status (new/read/replied/closed)
  // ============================================================
  app.put<{ Params: { id: string } }>('/inquiries/:id', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const id = requireUuidParam(request, reply);
    if (!id) return;

    const body = updateInquirySchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid data', details: body.error.issues } });
    }

    // Find the inquiry and verify ownership
    const [existing] = await db.select()
      .from(inquiries)
      .where(and(eq(inquiries.id, id), eq(inquiries.orgId, org.id)))
      .limit(1);

    if (!existing) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Inquiry not found' } });
    }

    const updates: Record<string, unknown> = {
      status: body.data.status,
      updatedAt: new Date(),
    };

    if (body.data.notes !== undefined) {
      updates.notes = body.data.notes;
    }

    // Set readAt on first read
    if (body.data.status === 'read' && !existing.readAt) {
      updates.readAt = new Date();
    }

    // Set repliedAt on first reply
    if (body.data.status === 'replied' && !existing.repliedAt) {
      updates.repliedAt = new Date();
    }

    const [updated] = await db.update(inquiries)
      .set(updates)
      .where(eq(inquiries.id, id))
      .returning();

    await db.insert((await import('../../db/schema.js')).auditLogs).values(
      createAuditEntry('inquiry.updated', 'inquiry', {
        orgId: org.id,
        entityId: id,
        details: { previousStatus: existing.status, newStatus: body.data.status },
      })
    );

    return { inquiry: updated };
  });
}
