import type { FastifyInstance } from 'fastify';
import { eq, and, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../config/database.js';
import { organizations, oosFiles, claims, auditLogs } from '../../db/schema.js';
import { generateMergePreview } from '../../services/merge-preview.js';
import { buildImportedClaims, distribution, type AcceptedSourceClaim } from '../../services/merge-execute.js';
import { createAuditEntry, AUDIT_ACTIONS } from '../../services/audit-logger.js';
import { getAuthOrg } from '../../middleware/auth-helpers.js';
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

const adaptedContentSchema = z.object({
  section: z.string().min(1).optional(),
  rule: z.string().min(1).optional(),
  why: z.string().min(1).optional(),
  failureMode: z.string().min(1).optional(),
  scope: z.string().min(1).optional(),
});

const mergeDecisionsSchema = z.object({
  sourceOosId: z.string().uuid(),
  targetOosId: z.string().uuid(),
  decisions: z.array(z.object({
    candidateId: z.string(),
    decision: z.enum(['accept', 'reject', 'adapt']),
    // Optional edited content for 'adapt' decisions. Ignored for accept/reject.
    adapted: adaptedContentSchema.optional(),
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

  // POST /api/v1/merge/decisions -- EXECUTE a merge.
  // Imports the accepted claims from the source OOS into a NEW DRAFT version of
  // the caller's (target) OOS. The draft is reviewable and must be published by
  // the user -- merge never auto-publishes another org's claims into a live OOS.
  // Imported claims land at LOW confidence with full provenance (merge protocol).
  app.post<{
    Body: {
      sourceOosId: string;
      targetOosId: string;
      decisions: Array<{
        candidateId: string;
        decision: 'accept' | 'reject' | 'adapt';
        adapted?: { section?: string; rule?: string; why?: string; failureMode?: string; scope?: string };
      }>;
    };
  }>('/merge/decisions', async (request, reply) => {
    const parsed = mergeDecisionsSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: { code: 'VALIDATION_ERROR', message: 'Invalid request body', details: parsed.error.issues },
      });
    }
    const { sourceOosId, targetOosId, decisions } = parsed.data;

    if (sourceOosId === targetOosId) {
      return reply.status(400).send({ error: { code: 'SAME_FILE', message: 'Cannot merge an OOS with itself' } });
    }

    // -- Auth: caller must OWN the target. Source can be any published OOS. ----
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const [sourceOos] = await db.select().from(oosFiles).where(eq(oosFiles.id, sourceOosId)).limit(1);
    const [targetOos] = await db.select().from(oosFiles).where(eq(oosFiles.id, targetOosId)).limit(1);
    if (!sourceOos || !targetOos) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'One or both OOS files not found' } });
    }
    if (targetOos.orgId !== org.id) {
      return reply.status(403).send({ error: { code: 'NOT_OWNER', message: 'You can only merge into your own OOS' } });
    }
    if (sourceOos.status !== 'published' || targetOos.status !== 'published') {
      return reply.status(400).send({ error: { code: 'NOT_PUBLISHED', message: 'Both OOS files must be published' } });
    }

    const [sourceOrg] = await db.select().from(organizations).where(eq(organizations.id, sourceOos.orgId)).limit(1);

    // -- Load claims for both sides. -----------------------------------------
    const sourceClaimRows = await db.select().from(claims).where(eq(claims.oosFileId, sourceOosId)).orderBy(claims.displayOrder);
    const targetClaimRows = await db.select().from(claims).where(eq(claims.oosFileId, targetOosId)).orderBy(claims.displayOrder);

    // -- Re-run the (deterministic) preview to map candidateId -> source claim.
    const preview = generateMergePreview(
      { id: sourceOosId, name: sourceOrg?.name || 'Unknown', wordCount: sourceOos.wordCount,
        entities: (sourceOos.frontmatter as any)?.entities || null, claims: sourceClaimRows.map(dbClaimToParsed) },
      { id: targetOosId, name: org.name, wordCount: targetOos.wordCount,
        entities: (targetOos.frontmatter as any)?.entities || null, claims: targetClaimRows.map(dbClaimToParsed) },
    );
    const candidateById = new Map(preview.candidates.map(c => [c.id, c]));
    const sourceRowByClaimId = new Map(sourceClaimRows.map(r => [r.claimId, r]));

    // -- Resolve decisions into accepted CLAIM candidates. -------------------
    // Entity candidates (agent/workflow/escalation/etc.) are not claims and are
    // not imported here -- they require manual structural review. Reported, not dropped.
    const accepted: AcceptedSourceClaim[] = [];
    let unsupportedEntity = 0;
    let unknownCandidate = 0;
    let rejected = 0;

    for (const d of decisions) {
      if (d.decision === 'reject') { rejected++; continue; }
      const cand = candidateById.get(d.candidateId);
      if (!cand) { unknownCandidate++; continue; }
      if (cand.category !== 'claim') { unsupportedEntity++; continue; }
      const srcClaimId = String((cand.source.content as any)?.claimId || '');
      const row = sourceRowByClaimId.get(srcClaimId);
      if (!row) { unknownCandidate++; continue; }
      accepted.push({
        dbId: row.id,
        claimId: row.claimId,
        section: row.section,
        rule: row.rule,
        why: row.why,
        failureMode: row.failureMode,
        confidence: row.confidence as AcceptedSourceClaim['confidence'],
        evidence: row.evidence as AcceptedSourceClaim['evidence'],
        scope: row.scope,
        decision: d.decision,
        similarityScore: cand.conflictsWith?.similarityScore ?? null,
        adapted: d.adapted || null,
      });
    }

    if (accepted.length === 0) {
      return reply.status(400).send({
        error: {
          code: 'NOTHING_TO_IMPORT',
          message: 'No importable claim candidates in the accepted decisions.',
          details: { rejected, unsupportedEntity, unknownCandidate },
        },
      });
    }

    // -- Build imported claim records (renumber, downgrade, provenance). ------
    const startDisplayOrder = targetClaimRows.reduce((m, c) => Math.max(m, c.displayOrder), 0);
    const { imported, stats } = buildImportedClaims({
      accepted,
      sourceOrgId: sourceOos.orgId,
      sourceOrgName: sourceOrg?.name || 'Unknown',
      sourceOosId,
      startDisplayOrder,
      existingClaimIds: targetClaimRows.map(c => c.claimId),
      alreadyImportedSourceClaimIds: targetClaimRows
        .map(c => c.sourceClaimId).filter((v): v is string => !!v),
      mergedAtIso: new Date().toISOString(),
    });

    if (imported.length === 0) {
      return reply.status(409).send({
        error: { code: 'ALREADY_IMPORTED', message: 'All accepted claims were already imported from this source.', details: stats },
      });
    }

    // -- Compute the new draft's rollups from (carried-forward + imported). ---
    const finalConfidences = [...targetClaimRows.map(c => c.confidence), ...imported.map(c => c.confidence)];
    const finalEvidence = [...targetClaimRows.map(c => c.evidence), ...imported.map(c => c.evidence)];
    const newRawContent = targetOos.rawContent + imported.map(c => c.markdown).join('');
    const newClaimCount = targetClaimRows.length + imported.length;

    // -- Write: new DRAFT version (max+1 for org) with all claims. ------------
    let draft: typeof oosFiles.$inferSelect | undefined;
    let retries = 3;
    while (retries > 0) {
      try {
        draft = await db.transaction(async (tx) => {
          const [latest] = await tx.select({ maxVersion: sql<number>`MAX(${oosFiles.version})` })
            .from(oosFiles).where(eq(oosFiles.orgId, org.id));
          const nextVersion = (latest?.maxVersion || 0) + 1;

          const [created] = await tx.insert(oosFiles).values({
            orgId: org.id,
            chartId: targetOos.chartId,
            name: targetOos.name,
            template: targetOos.template,
            version: nextVersion,
            status: 'draft',
            visibilityDefault: targetOos.visibilityDefault,
            wordCount: newRawContent.split(/\s+/).filter(Boolean).length,
            claimCount: newClaimCount,
            rawContent: newRawContent,
            frontmatter: targetOos.frontmatter as any,
            confidenceDistribution: distribution(finalConfidences) as any,
            evidenceDistribution: distribution(finalEvidence) as any,
          }).returning();

          // Carry the org's existing claims forward (preserve any prior provenance).
          if (targetClaimRows.length > 0) {
            await tx.insert(claims).values(targetClaimRows.map(c => ({
              oosFileId: created.id,
              claimId: c.claimId, section: c.section, displayOrder: c.displayOrder,
              rule: c.rule, why: c.why, failureMode: c.failureMode,
              confidence: c.confidence, evidence: c.evidence, scope: c.scope,
              visibilityOverride: c.visibilityOverride, isCanonical: c.isCanonical,
              source: c.source, sourceUrl: c.sourceUrl, agentName: c.agentName,
              sourceOrgId: c.sourceOrgId, sourceClaimId: c.sourceClaimId,
              sourceOosId: c.sourceOosId, provenance: c.provenance,
              public: c.public, roles: c.roles,
            })));
          }

          // Insert the newly imported claims.
          await tx.insert(claims).values(imported.map(c => ({
            oosFileId: created.id,
            claimId: c.claimId, section: c.section, displayOrder: c.displayOrder,
            rule: c.rule, why: c.why, failureMode: c.failureMode,
            confidence: c.confidence, evidence: c.evidence, scope: c.scope,
            source: c.source,
            sourceOrgId: c.sourceOrgId, sourceClaimId: c.sourceClaimId,
            sourceOosId: c.sourceOosId, provenance: c.provenance as any,
          })));

          await tx.insert(auditLogs).values(
            createAuditEntry(AUDIT_ACTIONS.MERGE_APPLIED, 'oos_file', {
              orgId: org.id, entityId: created.id,
              details: {
                sourceOosId, sourceOrgId: sourceOos.orgId, targetOosId,
                draftVersion: nextVersion, imported: imported.length,
                skippedDuplicate: stats.skippedDuplicate,
                unsupportedEntity, rejected,
              },
            })
          );

          return created;
        });
        break;
      } catch (err: any) {
        if (err.code === '23505' && retries > 1) { retries--; continue; }
        throw err;
      }
    }

    return reply.status(201).send({
      status: 'merged_to_draft',
      message: `Imported ${imported.length} claim(s) into a new draft (v${draft!.version}). Review and publish to make them live. Imported claims are LOW confidence until you validate them.`,
      draft: { id: draft!.id, version: draft!.version, status: draft!.status, claimCount: newClaimCount },
      summary: {
        imported: imported.length,
        rejected,
        skippedDuplicate: stats.skippedDuplicate,
        unsupportedEntityCandidates: unsupportedEntity,
        unknownCandidate,
      },
      nextStep: `Open the draft to review, then publish to compute cross-org similarities and go live.`,
    });
  });
}
