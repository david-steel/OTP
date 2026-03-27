import type { FastifyInstance } from 'fastify';
import { eq, and, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../config/database.js';
import { organizations, oosFiles, claims, auditLogs } from '../../db/schema.js';
import { generateMergePreview } from '../../services/merge-preview.js';
import { createAuditEntry, AUDIT_ACTIONS } from '../../services/audit-logger.js';
import type { ParsedClaim } from '../../shared/types.js';

// Helper to convert DB claim rows to ParsedClaim
function dbClaimToParsed(c: any): ParsedClaim {
  return {
    claimId: c.claimId,
    section: c.section,
    displayOrder: c.displayOrder,
    rule: c.rule,
    why: c.why,
    failureMode: c.failureMode,
    confidence: c.confidence,
    evidence: c.evidence,
    scope: c.scope,
  };
}

const mergePreviewSchema = z.object({
  sourceOosId: z.string().uuid(),
  targetOosId: z.string().uuid(),
});

const mergeDecisionsSchema = z.object({
  sourceOosId: z.string().uuid(),
  targetOosId: z.string().uuid(),
  decisions: z.array(z.object({
    candidateId: z.string(),
    decision: z.enum(['accept', 'reject', 'adapt']),
  })).min(1),
});

export default async function mergeRoutes(app: FastifyInstance) {

  // POST /api/v1/merge/preview -- Generate merge preview (READ ONLY)
  app.post<{
    Body: { sourceOosId: string; targetOosId: string };
  }>('/merge/preview', async (request, reply) => {
    const parsed = mergePreviewSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: { code: 'VALIDATION_ERROR', message: 'Invalid request body', details: parsed.error.issues },
      });
    }
    const { sourceOosId, targetOosId } = parsed.data;

    if (sourceOosId === targetOosId) {
      return reply.status(400).send({
        error: { code: 'SAME_FILE', message: 'Cannot merge an OOS with itself' },
      });
    }

    // Fetch both OOS files
    const [sourceOos] = await db.select().from(oosFiles).where(eq(oosFiles.id, sourceOosId)).limit(1);
    const [targetOos] = await db.select().from(oosFiles).where(eq(oosFiles.id, targetOosId)).limit(1);

    if (!sourceOos || !targetOos) {
      return reply.status(404).send({
        error: { code: 'NOT_FOUND', message: 'One or both OOS files not found' },
      });
    }

    if (sourceOos.status !== 'published' || targetOos.status !== 'published') {
      return reply.status(400).send({
        error: { code: 'NOT_PUBLISHED', message: 'Both OOS files must be published' },
      });
    }

    // Fetch org names
    const [sourceOrg] = await db.select().from(organizations).where(eq(organizations.id, sourceOos.orgId)).limit(1);
    const [targetOrg] = await db.select().from(organizations).where(eq(organizations.id, targetOos.orgId)).limit(1);

    // Fetch claims
    const sourceClaims = (await db.select().from(claims).where(eq(claims.oosFileId, sourceOosId)).orderBy(claims.displayOrder)).map(dbClaimToParsed);
    const targetClaims = (await db.select().from(claims).where(eq(claims.oosFileId, targetOosId)).orderBy(claims.displayOrder)).map(dbClaimToParsed);

    // Extract entities from frontmatter if present
    const sourceEntities = (sourceOos.frontmatter as any)?.entities || null;
    const targetEntities = (targetOos.frontmatter as any)?.entities || null;

    // Generate preview
    const preview = generateMergePreview(
      {
        id: sourceOosId,
        name: sourceOrg?.name || 'Unknown',
        wordCount: sourceOos.wordCount,
        entities: sourceEntities,
        claims: sourceClaims,
      },
      {
        id: targetOosId,
        name: targetOrg?.name || 'Unknown',
        wordCount: targetOos.wordCount,
        entities: targetEntities,
        claims: targetClaims,
      }
    );

    // Audit log
    await db.insert(auditLogs).values(
      createAuditEntry(AUDIT_ACTIONS.MERGE_PREVIEWED, 'oos_file', {
        orgId: targetOrg?.id,
        details: {
          sourceOosId,
          targetOosId,
          candidateCount: preview.summary.total,
          importable: preview.summary.importable,
          conflicts: preview.summary.conflicts,
        },
      })
    );

    return preview;
  });

  // POST /api/v1/merge/decisions -- Save user decisions on merge candidates (Phase 1: persists in session, no DB write)
  app.post<{
    Body: {
      sourceOosId: string;
      targetOosId: string;
      decisions: Array<{ candidateId: string; decision: 'accept' | 'reject' | 'adapt' }>;
    };
  }>('/merge/decisions', async (request, reply) => {
    // Phase 1: This endpoint records decisions but does NOT execute the merge.
    // It returns a summary of what would happen if the merge were applied.
    // Actual merge execution ships in Phase 2.

    const parsed = mergeDecisionsSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: { code: 'VALIDATION_ERROR', message: 'Invalid request body', details: parsed.error.issues },
      });
    }
    const { sourceOosId, targetOosId, decisions } = parsed.data;

    const accepted = decisions.filter(d => d.decision === 'accept').length;
    const rejected = decisions.filter(d => d.decision === 'reject').length;
    const adapted = decisions.filter(d => d.decision === 'adapt').length;

    return {
      status: 'preview_only',
      message: 'Merge execution is not available in Phase 1. Your decisions have been recorded for when merge launches.',
      summary: {
        total: decisions.length,
        accepted,
        rejected,
        adapted,
      },
      nextStep: 'Merge execution will be available in Phase 2. For now, use these decisions as a guide for manual updates to your OOS.',
    };
  });
}
