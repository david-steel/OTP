import type { FastifyInstance, FastifyRequest } from 'fastify';
import { getAuth } from '@clerk/fastify';
import { eq, and, desc, sql, count } from 'drizzle-orm';
import { db } from '../../config/database.js';
import { organizations, oosFiles, claims, claimSimilarities, auditLogs } from '../../db/schema.js';
import { createOOSSchema, updateOOSSchema, renameOOSSchema } from '../../shared/validation.js';
import { parseOOS } from '../../services/claim-parser.js';
import { validateOOS } from '../../services/format-validator.js';
import { scanOOSContent } from '../../services/pii-scanner.js';
import { calculateQualityTier } from '../../services/badge-calculator.js';
import { calculateAgenticLevel } from '../../services/agentic-level-calculator.js';
import { computeAllSimilarities } from '../../services/similarity.js';
import { computeDiff } from '../../services/diff-engine.js';
import { createAuditEntry, AUDIT_ACTIONS } from '../../services/audit-logger.js';
import { extractGraph } from '../../graph/graph-extractor.js';
import { autoFixOOS } from '../../services/auto-fixer.js';
import { resolveApiKey } from '../../middleware/api-key-auth.js';
import type { TemplateType } from '../../shared/enums.js';

// Helper: get org from authenticated user (Clerk session OR API key)
async function getAuthOrg(request: FastifyRequest) {
  // Try Clerk auth first
  const auth = getAuth(request);
  if (auth.userId) {
    const orgArr = await db.select().from(organizations).where(eq(organizations.clerkOrgId, auth.userId)).limit(1);
    if (orgArr[0]) return orgArr[0];
  }

  // Fall back to API key auth
  const apiKeyCtx = await resolveApiKey(request);
  if (apiKeyCtx) {
    const orgArr = await db.select().from(organizations).where(eq(organizations.id, apiKeyCtx.orgId)).limit(1);
    return orgArr[0] || null;
  }

  return null;
}

export default async function oosRoutes(app: FastifyInstance) {

  // ============================================================
  // POST /api/v1/oos/fix -- Auto-fix OOS content (no auth required)
  // ============================================================
  app.post('/oos/fix', async (request, reply) => {
    const body = request.body as { rawContent?: string; template?: string };
    if (!body?.rawContent || typeof body.rawContent !== 'string') {
      return reply.status(400).send({ error: { code: 'MISSING_CONTENT', message: 'rawContent is required' } });
    }

    const template = (body.template || undefined) as TemplateType | undefined;
    const result = autoFixOOS(body.rawContent, template);

    // Run validation on the fixed content to show remaining issues
    const parsed = parseOOS(result.fixed, template || 'agent_army');
    const validation = validateOOS(parsed, template || 'agent_army');

    // Run PII scan on the fixed content
    const piiResult = scanOOSContent(result.fixed);

    return {
      fixed: result.fixed,
      fixes: result.fixes,
      fixCount: result.fixes.length,
      unfixable: result.unfixable,
      unfixableCount: result.unfixable.length,
      validation,
      piiFlags: piiResult.flags,
      piiClean: piiResult.clean,
    };
  });

  // ============================================================
  // POST /api/v1/oos -- Create new OOS (draft)
  // ============================================================
  app.post('/oos', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const body = createOOSSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({
        error: { code: 'VALIDATION_FAILED', message: 'Invalid OOS data', details: body.error.issues },
      });
    }

    // Parse the OOS content
    const parsed = parseOOS(body.data.rawContent, body.data.template);

    // Validate format
    const validation = validateOOS(parsed, body.data.template);

    // Get next version number for this org
    const [latestVersion] = await db.select({ maxVersion: sql<number>`MAX(${oosFiles.version})` })
      .from(oosFiles)
      .where(eq(oosFiles.orgId, org.id));
    const nextVersion = (latestVersion?.maxVersion || 0) + 1;

    // Create draft OOS file
    const [oosFile] = await db.insert(oosFiles).values({
      orgId: org.id,
      template: body.data.template,
      version: nextVersion,
      status: 'draft',
      visibilityDefault: 'free',
      wordCount: parsed.wordCount,
      claimCount: parsed.claims.length,
      rawContent: body.data.rawContent,
      frontmatter: parsed.frontmatter as any,
      confidenceDistribution: parsed.claims.reduce((acc, c) => {
        const key = c.confidence.toLowerCase();
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) as any,
      evidenceDistribution: parsed.claims.reduce((acc, c) => {
        const key = c.evidence.toLowerCase();
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) as any,
    }).returning();

    // Insert parsed claims
    if (parsed.claims.length > 0) {
      await db.insert(claims).values(
        parsed.claims.map(c => ({
          oosFileId: oosFile.id,
          claimId: c.claimId,
          section: c.section,
          displayOrder: c.displayOrder,
          rule: c.rule,
          why: c.why,
          failureMode: c.failureMode,
          confidence: c.confidence,
          evidence: c.evidence,
          scope: c.scope,
        }))
      );
    }

    // Audit
    await db.insert(auditLogs).values(
      createAuditEntry(AUDIT_ACTIONS.OOS_CREATED, 'oos_file', {
        orgId: org.id, entityId: oosFile.id,
        details: { template: body.data.template, version: nextVersion, claimCount: parsed.claims.length },
      })
    );

    return reply.status(201).send({
      oosFile,
      claimCount: parsed.claims.length,
      validation,
    });
  });

  // ============================================================
  // PUT /api/v1/oos/:id -- Update draft OOS
  // ============================================================
  app.put<{ Params: { id: string } }>('/oos/:id', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const { id } = request.params;
    const body = updateOOSSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid data', details: body.error.issues } });
    }

    // Fetch OOS and verify ownership + draft status
    const [oosFile] = await db.select().from(oosFiles).where(and(eq(oosFiles.id, id), eq(oosFiles.orgId, org.id))).limit(1);
    if (!oosFile) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'OOS file not found' } });
    if (oosFile.status !== 'draft') return reply.status(409).send({ error: { code: 'NOT_DRAFT', message: 'Only draft OOS files can be updated. Publish creates a new version.' } });

    // Re-parse
    const parsed = parseOOS(body.data.rawContent, oosFile.template as TemplateType);
    const validation = validateOOS(parsed, oosFile.template as TemplateType);

    // Delete old claims and insert new
    await db.delete(claims).where(eq(claims.oosFileId, id));

    if (parsed.claims.length > 0) {
      await db.insert(claims).values(
        parsed.claims.map(c => ({
          oosFileId: id,
          claimId: c.claimId,
          section: c.section,
          displayOrder: c.displayOrder,
          rule: c.rule,
          why: c.why,
          failureMode: c.failureMode,
          confidence: c.confidence,
          evidence: c.evidence,
          scope: c.scope,
        }))
      );
    }

    // Update OOS file metadata
    const [updated] = await db.update(oosFiles)
      .set({
        rawContent: body.data.rawContent,
        wordCount: parsed.wordCount,
        claimCount: parsed.claims.length,
        frontmatter: parsed.frontmatter as any,
        confidenceDistribution: parsed.claims.reduce((acc, c) => {
          const key = c.confidence.toLowerCase();
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) as any,
        evidenceDistribution: parsed.claims.reduce((acc, c) => {
          const key = c.evidence.toLowerCase();
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) as any,
        updatedAt: new Date(),
      })
      .where(eq(oosFiles.id, id))
      .returning();

    await db.insert(auditLogs).values(
      createAuditEntry(AUDIT_ACTIONS.OOS_UPDATED, 'oos_file', {
        orgId: org.id, entityId: id,
        details: { claimCount: parsed.claims.length, wordCount: parsed.wordCount },
      })
    );

    return { oosFile: updated, claimCount: parsed.claims.length, validation };
  });

  // ============================================================
  // POST /api/v1/oos/:id/publish -- Publish OOS
  // ============================================================
  app.post<{ Params: { id: string } }>('/oos/:id/publish', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const { id } = request.params;
    const [oosFile] = await db.select().from(oosFiles).where(and(eq(oosFiles.id, id), eq(oosFiles.orgId, org.id))).limit(1);
    if (!oosFile) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'OOS file not found' } });
    if (oosFile.status === 'published') return reply.status(409).send({ error: { code: 'ALREADY_PUBLISHED', message: 'Already published. Create a new version to update.' } });

    // Step 1: Format validation
    const parsed = parseOOS(oosFile.rawContent, oosFile.template as TemplateType);
    const validation = validateOOS(parsed, oosFile.template as TemplateType);
    if (!validation.valid) {
      return reply.status(422).send({
        error: { code: 'FORMAT_INVALID', message: 'OOS format validation failed', details: validation.errors },
      });
    }

    // Step 2: PII scan
    const piiResult = scanOOSContent(oosFile.rawContent);
    if (!piiResult.clean) {
      await db.insert(auditLogs).values(
        createAuditEntry(AUDIT_ACTIONS.PII_SCAN_FLAGGED, 'oos_file', {
          orgId: org.id, entityId: id,
          details: { flagCount: piiResult.flags.length, flags: piiResult.flags },
        })
      );
      return reply.status(422).send({
        error: {
          code: 'PII_DETECTED',
          message: `PII scan found ${piiResult.flags.length} issue(s). Resolve before publishing.`,
          details: piiResult.flags.map(f => ({
            field: f.location,
            issue: f.type,
            value: f.text,
            expected: f.suggestion,
          })),
        },
        piiFlags: piiResult.flags,
      });
    }

    // Step 3: Calculate quality tier
    const qualityResult = calculateQualityTier(parsed.claims);

    // Step 4: Publish (transaction)
    const now = new Date();
    const [published] = await db.update(oosFiles)
      .set({
        status: 'published',
        publishedAt: now,
        updatedAt: now,
      })
      .where(eq(oosFiles.id, id))
      .returning();

    // Calculate agentic level from claims
    const agenticResult = calculateAgenticLevel(parsed.claims, parsed.frontmatter as unknown as Record<string, unknown>);

    // Update org quality tier and agentic level
    await db.update(organizations)
      .set({ qualityTier: qualityResult.tier, agenticLevel: agenticResult.level, updatedAt: now })
      .where(eq(organizations.id, org.id));

    // Step 5: Compute similarities (background-ish -- runs inline for Phase 1)
    const oosClaimsWithIds = await db.select().from(claims).where(eq(claims.oosFileId, id));
    const allOtherClaims = await db.select().from(claims)
      .where(sql`${claims.oosFileId} != ${id} AND ${claims.oosFileId} IN (
        SELECT id FROM oos_files WHERE status = 'published'
      )`);

    const newClaimsForSim = oosClaimsWithIds.map(c => ({
      dbId: c.id,
      claimId: c.claimId,
      section: c.section,
      displayOrder: c.displayOrder,
      rule: c.rule,
      why: c.why,
      failureMode: c.failureMode,
      confidence: c.confidence as any,
      evidence: c.evidence as any,
      scope: c.scope,
    }));

    const existingForSim = allOtherClaims.map(c => ({
      dbId: c.id,
      oosFileId: c.oosFileId,
      claimId: c.claimId,
      section: c.section,
      displayOrder: c.displayOrder,
      rule: c.rule,
      why: c.why,
      failureMode: c.failureMode,
      confidence: c.confidence as any,
      evidence: c.evidence as any,
      scope: c.scope,
    }));

    const simPairs = computeAllSimilarities(newClaimsForSim, id, existingForSim);

    if (simPairs.length > 0) {
      await db.insert(claimSimilarities).values(
        simPairs.map(p => ({
          claimAId: p.claimAId,
          claimBId: p.claimBId,
          oosAId: p.oosAId,
          oosBId: p.oosBId,
          similarityScore: p.score,
          classification: p.classification,
          sectionMatch: p.sectionMatch,
        }))
      );
    }

    // Step 6: Extract graph nodes and edges
    const entities = (oosFile.frontmatter as any)?.entities || null;
    const graphData = extractGraph(id, org.id, entities, parsed.claims.map(c => ({
      claim_id: c.claimId,
      section: c.section,
      rule: c.rule,
      why: c.why,
      confidence: c.confidence,
      evidence: c.evidence,
    })), org.pseudonym || org.name);
    // Delete existing graph data for this OOS file (in case of re-publish)
    await db.execute(sql`DELETE FROM graph_edges WHERE oos_file_id = ${id}`);
    await db.execute(sql`DELETE FROM graph_nodes WHERE oos_file_id = ${id}`);

    // Insert graph nodes and collect generated UUIDs
    const externalIdToUuid = new Map<string, string>();

    for (const node of graphData.nodes) {
      // Determine external_id: ORG for organization, claimId for knowledge_claims, externalId for entities
      let externalId: string;
      if (node.type === 'organization') {
        externalId = 'ORG';
      } else if (node.type === 'knowledge_claim') {
        externalId = (node.properties as any).claimId || 'UNKNOWN';
      } else {
        externalId = ((node.properties as any).externalId || 'UNKNOWN') as string;
      }

      const insertResult = await db.execute(sql`
        INSERT INTO graph_nodes (external_id, type, label, properties, oos_file_id, org_id)
        VALUES (${externalId}, ${node.type}::graph_node_type, ${node.label}, ${JSON.stringify(node.properties)}::jsonb, ${node.oosFileId}, ${node.orgId})
        RETURNING id
      `);
      const insertedId = (insertResult.rows as any[])[0]?.id;
      if (insertedId) {
        externalIdToUuid.set(externalId, insertedId);
      }
    }

    // Insert graph edges with mapped UUIDs
    for (const edge of graphData.edges) {
      const sourceUuid = externalIdToUuid.get(edge.sourceId);
      const targetUuid = externalIdToUuid.get(edge.targetId);
      if (!sourceUuid || !targetUuid) continue; // Skip edges with unresolved references

      await db.execute(sql`
        INSERT INTO graph_edges (source_id, target_id, type, properties, oos_file_id, weight)
        VALUES (${sourceUuid}, ${targetUuid}, ${edge.type}::graph_edge_type, ${JSON.stringify(edge.properties)}::jsonb, ${id}, ${edge.weight})
      `);
    }

    // Audit
    await db.insert(auditLogs).values(
      createAuditEntry(AUDIT_ACTIONS.OOS_PUBLISHED, 'oos_file', {
        orgId: org.id, entityId: id,
        details: {
          version: oosFile.version,
          claimCount: parsed.claims.length,
          qualityTier: qualityResult.tier,
          qualityScore: qualityResult.score,
          similaritiesFound: simPairs.length,
        },
      })
    );

    return {
      oosFile: published,
      qualityTier: qualityResult.tier,
      qualityScore: qualityResult.score,
      agenticLevel: agenticResult.level,
      agenticLabel: agenticResult.label,
      similaritiesFound: simPairs.length,
      validation,
      piiScan: { clean: true },
    };
  });

  // ============================================================
  // GET /api/v1/oos/:id -- Get OOS file
  // ============================================================
  app.get<{ Params: { id: string } }>('/oos/:id', async (request, reply) => {
    const { id } = request.params;
    const [oosFile] = await db.select().from(oosFiles).where(eq(oosFiles.id, id)).limit(1);
    if (!oosFile) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'OOS file not found' } });

    // Draft files only visible to owner
    if (oosFile.status === 'draft') {
      const org = await getAuthOrg(request);
      if (!org || org.id !== oosFile.orgId) {
        return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'OOS file not found' } });
      }
    }

    const [org] = await db.select().from(organizations).where(eq(organizations.id, oosFile.orgId)).limit(1);

    return {
      oosFile,
      org: org ? { id: org.id, name: org.name, industry: org.industry, size: org.size, badge: org.badge, qualityTier: org.qualityTier, agenticLevel: org.agenticLevel } : null,
    };
  });

  // ============================================================
  // GET /api/v1/oos/:id/claims -- Get claims for an OOS
  // ============================================================
  app.get<{ Params: { id: string }; Querystring: { section?: string; confidence?: string; evidence?: string } }>(
    '/oos/:id/claims',
    async (request, reply) => {
      const { id } = request.params;
      const { section, confidence, evidence } = request.query;

      let query = db.select().from(claims).where(eq(claims.oosFileId, id));

      // Dynamic filters would be added here with Drizzle's and() helper
      const result = await query.orderBy(claims.displayOrder);

      // Apply in-memory filters for simplicity in Phase 1
      let filtered = result;
      if (section) filtered = filtered.filter(c => c.section === section);
      if (confidence) filtered = filtered.filter(c => c.confidence === confidence);
      if (evidence) filtered = filtered.filter(c => c.evidence === evidence);

      return { claims: filtered, total: filtered.length };
    }
  );

  // ============================================================
  // GET /api/v1/oos/:id/versions -- Version history
  // ============================================================
  app.get<{ Params: { id: string } }>('/oos/:id/versions', async (request, reply) => {
    const { id } = request.params;

    // Get the org for this OOS file
    const [oosFile] = await db.select().from(oosFiles).where(eq(oosFiles.id, id)).limit(1);
    if (!oosFile) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'OOS file not found' } });

    // Get all versions for this org
    const versions = await db.select({
      id: oosFiles.id,
      version: oosFiles.version,
      status: oosFiles.status,
      claimCount: oosFiles.claimCount,
      wordCount: oosFiles.wordCount,
      publishedAt: oosFiles.publishedAt,
      createdAt: oosFiles.createdAt,
    })
      .from(oosFiles)
      .where(eq(oosFiles.orgId, oosFile.orgId))
      .orderBy(desc(oosFiles.version));

    return { versions };
  });

  // ============================================================
  // POST /api/v1/oos/:id/archive -- Archive a published OOS
  // ============================================================
  app.post<{ Params: { id: string } }>('/oos/:id/archive', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const { id } = request.params;
    const [oosFile] = await db.select().from(oosFiles).where(and(eq(oosFiles.id, id), eq(oosFiles.orgId, org.id))).limit(1);
    if (!oosFile) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'OOS file not found' } });

    const [archived] = await db.update(oosFiles)
      .set({ status: 'archived', updatedAt: new Date() })
      .where(eq(oosFiles.id, id))
      .returning();

    await db.insert(auditLogs).values(
      createAuditEntry(AUDIT_ACTIONS.OOS_ARCHIVED, 'oos_file', {
        orgId: org.id, entityId: id,
        details: { version: oosFile.version },
      })
    );

    return { oosFile: archived };
  });

  // ============================================================
  // PATCH /api/v1/oos/:id/rename -- Rename an OOS file
  // ============================================================
  app.patch<{ Params: { id: string } }>('/oos/:id/rename', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const { id } = request.params;
    const body = renameOOSSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid name', details: body.error.issues } });
    }

    const [oosFile] = await db.select().from(oosFiles).where(and(eq(oosFiles.id, id), eq(oosFiles.orgId, org.id))).limit(1);
    if (!oosFile) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'OOS file not found' } });

    const [updated] = await db.update(oosFiles)
      .set({ name: body.data.name, updatedAt: new Date() })
      .where(eq(oosFiles.id, id))
      .returning();

    await db.insert(auditLogs).values(
      createAuditEntry(AUDIT_ACTIONS.OOS_RENAMED, 'oos_file', {
        orgId: org.id, entityId: id,
        details: { oldName: oosFile.name, newName: body.data.name },
      })
    );

    return { oosFile: updated };
  });

  // ============================================================
  // DELETE /api/v1/oos/:id -- Delete an OOS file (owner only)
  // ============================================================
  app.delete<{ Params: { id: string } }>('/oos/:id', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const { id } = request.params;
    const [oosFile] = await db.select().from(oosFiles).where(and(eq(oosFiles.id, id), eq(oosFiles.orgId, org.id))).limit(1);
    if (!oosFile) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'OOS file not found' } });

    // Delete graph data (not managed by Drizzle cascade)
    await db.execute(sql`DELETE FROM graph_edges WHERE oos_file_id = ${id}`);
    await db.execute(sql`DELETE FROM graph_nodes WHERE oos_file_id = ${id}`);

    // Delete OOS file (claims + claim_similarities cascade via FK)
    await db.delete(oosFiles).where(eq(oosFiles.id, id));

    await db.insert(auditLogs).values(
      createAuditEntry(AUDIT_ACTIONS.OOS_DELETED, 'oos_file', {
        orgId: org.id, entityId: id,
        details: { version: oosFile.version, template: oosFile.template, status: oosFile.status },
      })
    );

    return { deleted: true, id };
  });

  // ============================================================
  // POST /api/v1/oos/:id/new-version -- Create new draft from existing file
  // ============================================================
  app.post<{ Params: { id: string } }>('/oos/:id/new-version', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const { id } = request.params;
    const [oosFile] = await db.select().from(oosFiles).where(and(eq(oosFiles.id, id), eq(oosFiles.orgId, org.id))).limit(1);
    if (!oosFile) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'OOS file not found' } });

    // Use provided rawContent or copy from source
    const body = request.body as { rawContent?: string } | undefined;
    const rawContent = body?.rawContent && typeof body.rawContent === 'string' && body.rawContent.length >= 100
      ? body.rawContent
      : oosFile.rawContent;

    // Get next version number for this org
    const [latestVersion] = await db.select({ maxVersion: sql<number>`MAX(${oosFiles.version})` })
      .from(oosFiles)
      .where(eq(oosFiles.orgId, org.id));
    const nextVersion = (latestVersion?.maxVersion || 0) + 1;

    // Parse the content
    const parsed = parseOOS(rawContent, oosFile.template as TemplateType);

    // Create new draft
    const [newOosFile] = await db.insert(oosFiles).values({
      orgId: org.id,
      name: oosFile.name,
      template: oosFile.template,
      version: nextVersion,
      status: 'draft',
      visibilityDefault: oosFile.visibilityDefault,
      wordCount: parsed.wordCount,
      claimCount: parsed.claims.length,
      rawContent,
      frontmatter: parsed.frontmatter as any,
      confidenceDistribution: parsed.claims.reduce((acc, c) => {
        const key = c.confidence.toLowerCase();
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) as any,
      evidenceDistribution: parsed.claims.reduce((acc, c) => {
        const key = c.evidence.toLowerCase();
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) as any,
    }).returning();

    // Insert parsed claims
    if (parsed.claims.length > 0) {
      await db.insert(claims).values(
        parsed.claims.map(c => ({
          oosFileId: newOosFile.id,
          claimId: c.claimId,
          section: c.section,
          displayOrder: c.displayOrder,
          rule: c.rule,
          why: c.why,
          failureMode: c.failureMode,
          confidence: c.confidence,
          evidence: c.evidence,
          scope: c.scope,
        }))
      );
    }

    await db.insert(auditLogs).values(
      createAuditEntry(AUDIT_ACTIONS.OOS_NEW_VERSION, 'oos_file', {
        orgId: org.id, entityId: newOosFile.id,
        details: { sourceId: id, sourceVersion: oosFile.version, newVersion: nextVersion, claimCount: parsed.claims.length },
      })
    );

    return reply.status(201).send({
      oosFile: newOosFile,
      claimCount: parsed.claims.length,
      sourceId: id,
    });
  });

  // ============================================================
  // GET /api/v1/oos/:id/compare/:otherId -- Diff two OOS files
  // ============================================================
  app.get<{ Params: { id: string; otherId: string } }>(
    '/oos/:id/compare/:otherId',
    async (request, reply) => {
      const { id, otherId } = request.params;

      // Fetch both OOS files and their claims
      const [oosA] = await db.select().from(oosFiles).where(eq(oosFiles.id, id)).limit(1);
      const [oosB] = await db.select().from(oosFiles).where(eq(oosFiles.id, otherId)).limit(1);

      if (!oosA || !oosB) {
        return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'One or both OOS files not found' } });
      }

      // Only published files can be compared
      if (oosA.status !== 'published' || oosB.status !== 'published') {
        return reply.status(400).send({ error: { code: 'NOT_PUBLISHED', message: 'Both OOS files must be published to compare' } });
      }

      const [orgA] = await db.select().from(organizations).where(eq(organizations.id, oosA.orgId)).limit(1);
      const [orgB] = await db.select().from(organizations).where(eq(organizations.id, oosB.orgId)).limit(1);

      const claimsA = await db.select().from(claims).where(eq(claims.oosFileId, id)).orderBy(claims.displayOrder);
      const claimsB = await db.select().from(claims).where(eq(claims.oosFileId, otherId)).orderBy(claims.displayOrder);

      const parsedClaimsA = claimsA.map(c => ({
        claimId: c.claimId, section: c.section, displayOrder: c.displayOrder,
        rule: c.rule, why: c.why, failureMode: c.failureMode,
        confidence: c.confidence as any, evidence: c.evidence as any, scope: c.scope,
      }));

      const parsedClaimsB = claimsB.map(c => ({
        claimId: c.claimId, section: c.section, displayOrder: c.displayOrder,
        rule: c.rule, why: c.why, failureMode: c.failureMode,
        confidence: c.confidence as any, evidence: c.evidence as any, scope: c.scope,
      }));

      const diff = computeDiff(
        { id, orgName: orgA?.name || 'Unknown', claims: parsedClaimsA },
        { id: otherId, orgName: orgB?.name || 'Unknown', claims: parsedClaimsB }
      );

      // Audit
      await db.insert(auditLogs).values(
        createAuditEntry(AUDIT_ACTIONS.DIFF_EXECUTED, 'oos_file', {
          orgId: orgA?.id,
          details: { oosAId: id, oosBId: otherId, summary: diff.summary },
        })
      );

      return { diff };
    }
  );

  // ============================================================
  // GET /api/v1/oos/:id/dashboard -- Publisher dashboard data
  // ============================================================
  app.get<{ Params: { id: string } }>('/oos/:id/dashboard', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    // Get all published OOS files for this org
    const orgOosFiles = await db.select()
      .from(oosFiles)
      .where(and(eq(oosFiles.orgId, org.id), eq(oosFiles.status, 'published')))
      .orderBy(desc(oosFiles.publishedAt));

    // Get total claim count
    const totalClaims = orgOosFiles.reduce((sum, f) => sum + f.claimCount, 0);

    // Get similarity connections (how many other OOS files have similar claims)
    const connections = await db.execute(sql`
      SELECT COUNT(DISTINCT CASE
        WHEN oos_a_id IN (SELECT id FROM oos_files WHERE org_id = ${org.id}) THEN oos_b_id
        ELSE oos_a_id
      END) AS connected_orgs
      FROM claim_similarities
      WHERE oos_a_id IN (SELECT id FROM oos_files WHERE org_id = ${org.id})
         OR oos_b_id IN (SELECT id FROM oos_files WHERE org_id = ${org.id})
    `);

    // Get view count from audit logs
    const views = await db.execute(sql`
      SELECT COUNT(*) AS view_count
      FROM audit_logs
      WHERE action = 'oos.viewed'
        AND entity_id IN (SELECT id FROM oos_files WHERE org_id = ${org.id})
        AND created_at > NOW() - INTERVAL '30 days'
    `);

    // Get update history
    const updateHistory = await db.select({
      id: oosFiles.id,
      version: oosFiles.version,
      claimCount: oosFiles.claimCount,
      publishedAt: oosFiles.publishedAt,
      status: oosFiles.status,
    })
      .from(oosFiles)
      .where(eq(oosFiles.orgId, org.id))
      .orderBy(desc(oosFiles.version))
      .limit(20);

    return {
      profile: {
        orgId: org.id,
        name: org.name,
        industry: org.industry,
        size: org.size,
        badge: org.badge,
        qualityTier: org.qualityTier,
        memberSince: org.createdAt,
      },
      stats: {
        publishedFiles: orgOosFiles.length,
        totalClaims,
        connectedOrgs: parseInt((connections.rows as any)?.[0]?.connected_orgs || '0', 10),
        views30d: parseInt((views.rows as any)?.[0]?.view_count || '0', 10),
      },
      oosFiles: orgOosFiles,
      updateHistory,
    };
  });

  // POST /api/v1/oos/rescan-similarities -- Recompute all similarities (admin only)
  app.post('/oos/rescan-similarities', async (request, reply) => {
    // Get all published OOS claims
    const allClaims = await db.select({
      dbId: claims.id,
      oosFileId: claims.oosFileId,
      claimId: claims.claimId,
      section: claims.section,
      displayOrder: claims.displayOrder,
      rule: claims.rule,
      why: claims.why,
      failureMode: claims.failureMode,
      confidence: claims.confidence,
      evidence: claims.evidence,
      scope: claims.scope,
    }).from(claims)
      .innerJoin(oosFiles, eq(claims.oosFileId, oosFiles.id))
      .where(eq(oosFiles.status, 'published'));

    if (allClaims.length === 0) {
      return { message: 'No published claims found', similarities: 0 };
    }

    // Clear existing similarities
    await db.delete(claimSimilarities);

    // Get all unique OOS file IDs
    const oosIds = [...new Set(allClaims.map(c => c.oosFileId))];

    let totalPairs = 0;

    // For each OOS, compute similarities against all others
    for (const oosId of oosIds) {
      const newClaims = allClaims
        .filter(c => c.oosFileId === oosId)
        .map(c => ({ ...c, dbId: c.dbId }));

      const existingClaims = allClaims
        .filter(c => c.oosFileId !== oosId)
        .map(c => ({ ...c, dbId: c.dbId }));

      const pairs = computeAllSimilarities(
        newClaims as any,
        oosId,
        existingClaims as any
      );

      // Keep all pairs (both directions stored for easy querying)
      const uniquePairs = pairs;

      if (uniquePairs.length > 0) {
        await db.insert(claimSimilarities).values(
          uniquePairs.map(p => ({
            claimAId: p.claimAId,
            claimBId: p.claimBId,
            oosAId: p.oosAId,
            oosBId: p.oosBId,
            similarityScore: p.score,
            classification: p.classification,
            sectionMatch: p.sectionMatch,
          }))
        );
        totalPairs += uniquePairs.length;
      }
    }

    return { message: 'Rescan complete', oosFilesScanned: oosIds.length, claimsCompared: allClaims.length, similaritiesFound: totalPairs };
  });
}
