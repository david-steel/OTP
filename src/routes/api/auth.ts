import type { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import { db } from '../../config/database.js';
import { organizations } from '../../db/schema.js';
import { createOrgSchema } from '../../shared/validation.js';
import { createAuditEntry, AUDIT_ACTIONS } from '../../services/audit-logger.js';
import { auditLogs } from '../../db/schema.js';

export default async function authRoutes(app: FastifyInstance) {

  // POST /api/v1/auth/register -- Create organization profile
  app.post('/register', async (request, reply) => {
    const body = createOrgSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Invalid registration data',
          details: body.error.issues.map(i => ({
            field: i.path.join('.'),
            issue: i.message,
          })),
        },
      });
    }

    // Get Clerk org ID from auth context
    // In production, this comes from Clerk JWT middleware
    const clerkOrgId = (request as any).auth?.orgId || request.headers['x-clerk-org-id'] as string;
    if (!clerkOrgId) {
      return reply.status(401).send({
        error: { code: 'AUTH_REQUIRED', message: 'Clerk organization ID required' },
      });
    }

    // Check if org already exists
    const existing = await db.select()
      .from(organizations)
      .where(eq(organizations.clerkOrgId, clerkOrgId))
      .limit(1);

    if (existing.length > 0) {
      return reply.status(409).send({
        error: { code: 'ORG_EXISTS', message: 'Organization already registered' },
      });
    }

    // Determine badge (founding for first 50)
    const orgCount = await db.select().from(organizations);
    const badge = orgCount.length < 50 ? 'founding' as const : null;

    // Create organization
    const [org] = await db.insert(organizations).values({
      name: body.data.name,
      industry: body.data.industry,
      size: body.data.size,
      clerkOrgId,
      badge,
    }).returning();

    // Audit log
    await db.insert(auditLogs).values(
      createAuditEntry(AUDIT_ACTIONS.ORG_REGISTERED, 'organization', {
        orgId: org.id,
        actorType: 'user',
        entityId: org.id,
        details: { name: org.name, industry: org.industry, badge },
      })
    );

    return reply.status(201).send({ org });
  });

  // GET /api/v1/auth/me -- Get current org profile
  app.get('/me', async (request, reply) => {
    const clerkOrgId = (request as any).auth?.orgId || request.headers['x-clerk-org-id'] as string;
    if (!clerkOrgId) {
      return reply.status(401).send({
        error: { code: 'AUTH_REQUIRED', message: 'Authentication required' },
      });
    }

    const [org] = await db.select()
      .from(organizations)
      .where(eq(organizations.clerkOrgId, clerkOrgId))
      .limit(1);

    if (!org) {
      return reply.status(404).send({
        error: { code: 'ORG_NOT_FOUND', message: 'Organization not registered' },
      });
    }

    return { org };
  });
}
