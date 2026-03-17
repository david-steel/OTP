import type { FastifyInstance, FastifyRequest } from 'fastify';
import { getAuth } from '@clerk/fastify';
import { eq, desc, sql, and } from 'drizzle-orm';
import { db } from '../../config/database.js';
import { organizations, tickets, auditLogs } from '../../db/schema.js';
import { resolveApiKey } from '../../middleware/api-key-auth.js';
import { createAuditEntry } from '../../services/audit-logger.js';
import { z } from 'zod';

const createTicketSchema = z.object({
  title: z.string().min(5).max(500),
  description: z.string().min(10),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional().default('medium'),
  category: z.enum(['bug', 'feature', 'question', 'other']).optional().default('bug'),
  reporterEmail: z.string().email().optional(),
});

const updateTicketSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  resolution: z.string().optional(),
  agentNotes: z.string().optional(),
});

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

export default async function ticketRoutes(app: FastifyInstance) {

  // POST /api/v1/tickets -- Create a ticket (auth optional)
  app.post('/tickets', async (request, reply) => {
    const body = createTicketSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({
        error: { code: 'VALIDATION_FAILED', message: 'Invalid ticket data', details: body.error.issues },
      });
    }

    const org = await getAuthOrg(request);

    const [ticket] = await db.insert(tickets).values({
      orgId: org?.id || null,
      title: body.data.title,
      description: body.data.description,
      priority: body.data.priority,
      category: body.data.category,
      reporterEmail: body.data.reporterEmail || null,
    }).returning();

    await db.insert(auditLogs).values(
      createAuditEntry('ticket.created', 'ticket', {
        orgId: org?.id,
        entityId: ticket.id,
        details: { title: body.data.title, category: body.data.category, priority: body.data.priority },
      })
    );

    return reply.status(201).send({ ticket });
  });

  // GET /api/v1/tickets -- List tickets
  app.get<{ Querystring: { status?: string; category?: string; limit?: string } }>(
    '/tickets',
    async (request, reply) => {
      const { status, category, limit: limitStr } = request.query;
      const limit = Math.min(parseInt(limitStr || '50', 10), 100);

      let results = await db.select().from(tickets).orderBy(desc(tickets.createdAt)).limit(limit);

      if (status) results = results.filter(t => t.status === status);
      if (category) results = results.filter(t => t.category === category);

      return { tickets: results, total: results.length };
    }
  );

  // GET /api/v1/tickets/:id -- Get single ticket
  app.get<{ Params: { id: string } }>('/tickets/:id', async (request, reply) => {
    const { id } = request.params;
    const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id)).limit(1);
    if (!ticket) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Ticket not found' } });
    return { ticket };
  });

  // PUT /api/v1/tickets/:id -- Update ticket (admin/agent)
  app.put<{ Params: { id: string } }>('/tickets/:id', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const { id } = request.params;
    const body = updateTicketSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid data', details: body.error.issues } });
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (body.data.status) updates.status = body.data.status;
    if (body.data.priority) updates.priority = body.data.priority;
    if (body.data.resolution !== undefined) updates.resolution = body.data.resolution;
    if (body.data.agentNotes !== undefined) updates.agentNotes = body.data.agentNotes;

    const [updated] = await db.update(tickets)
      .set(updates)
      .where(eq(tickets.id, id))
      .returning();

    if (!updated) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Ticket not found' } });

    await db.insert(auditLogs).values(
      createAuditEntry('ticket.updated', 'ticket', {
        orgId: org.id,
        entityId: id,
        details: updates,
      })
    );

    return { ticket: updated };
  });

  // GET /api/v1/tickets/stats -- Ticket stats
  app.get('/tickets/stats', async (request, reply) => {
    const stats = await db.execute(sql`
      SELECT
        COUNT(*) FILTER (WHERE status = 'open') AS open_count,
        COUNT(*) FILTER (WHERE status = 'in_progress') AS in_progress_count,
        COUNT(*) FILTER (WHERE status = 'resolved') AS resolved_count,
        COUNT(*) FILTER (WHERE status = 'closed') AS closed_count,
        COUNT(*) AS total
      FROM tickets
    `);

    return { stats: (stats.rows as any[])[0] || {} };
  });
}
