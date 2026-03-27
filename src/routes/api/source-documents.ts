import type { FastifyInstance } from 'fastify';
import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../../config/database.js';
import { oosFiles, sourceDocuments } from '../../db/schema.js';
import { getAuthOrg } from '../../middleware/auth-helpers.js';
import { createAuditEntry } from '../../services/audit-logger.js';
import { requireUuidParam } from '../../shared/param-validation.js';
import { z } from 'zod';

const createSourceDocSchema = z.object({
  title: z.string().min(1).max(500),
  content: z.string().min(10),
  template: z.enum(['agent_army', 'value_chain', 'org_chart']).optional().default('agent_army'),
  autoSplit: z.boolean().optional().default(true),
});

/**
 * Split source document content by H2 headings.
 * Each H2 section becomes a separate OOS draft.
 * Returns an array of { title, content } objects.
 */
function splitByH2(content: string): Array<{ title: string; content: string }> {
  const lines = content.split('\n');
  const sections: Array<{ title: string; content: string }> = [];
  let currentTitle = '';
  let currentLines: string[] = [];
  let foundFirstH2 = false;

  for (const line of lines) {
    const h2Match = line.match(/^##\s+(.+)$/);
    if (h2Match) {
      // Save previous section if it has content
      if (foundFirstH2 && currentLines.length > 0) {
        const sectionContent = currentLines.join('\n').trim();
        if (sectionContent.length > 0) {
          sections.push({ title: currentTitle, content: sectionContent });
        }
      }
      currentTitle = h2Match[1].trim();
      currentLines = [line]; // Include the H2 heading in the content
      foundFirstH2 = true;
    } else if (foundFirstH2) {
      currentLines.push(line);
    } else {
      // Content before the first H2 -- include as preamble if substantial
      currentLines.push(line);
    }
  }

  // Handle content before first H2 (preamble)
  if (!foundFirstH2 && currentLines.length > 0) {
    const preamble = currentLines.join('\n').trim();
    if (preamble.length > 0) {
      sections.push({ title: 'Untitled Section', content: preamble });
    }
  }

  // Save last section
  if (foundFirstH2 && currentLines.length > 0) {
    const sectionContent = currentLines.join('\n').trim();
    if (sectionContent.length > 0) {
      sections.push({ title: currentTitle, content: sectionContent });
    }
  }

  // If no H2s found, return entire content as one section
  if (sections.length === 0) {
    sections.push({ title: 'Full Document', content: content.trim() });
  }

  return sections;
}

export default async function sourceDocumentRoutes(app: FastifyInstance) {

  // ============================================================
  // POST /api/v1/source-documents -- Upload text content, split into OOS drafts
  // ============================================================
  app.post('/source-documents', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const body = createSourceDocSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({
        error: { code: 'VALIDATION_FAILED', message: 'Invalid source document data', details: body.error.issues },
      });
    }

    // Create the source document record
    const wordCount = body.data.content.split(/\s+/).filter(w => w.length > 0).length;

    const [sourceDoc] = await db.insert(sourceDocuments).values({
      orgId: org.id,
      title: body.data.title,
      rawContent: body.data.content,
      wordCount,
      status: 'processed',
    }).returning();

    const createdOosFiles: Array<{ id: string; title: string; wordCount: number }> = [];

    if (body.data.autoSplit) {
      // Split by H2 headings and create OOS drafts
      const sections = splitByH2(body.data.content);

      for (const section of sections) {
        const sectionWordCount = section.content.split(/\s+/).filter(w => w.length > 0).length;

        // Get next version number and insert atomically to avoid race conditions
        let oosFile: typeof oosFiles.$inferSelect = undefined as any;
        let retries = 3;
        while (retries > 0) {
          try {
            oosFile = await db.transaction(async (tx) => {
              const [latestVersion] = await tx.select({ maxVersion: sql<number>`MAX(${oosFiles.version})` })
                .from(oosFiles)
                .where(eq(oosFiles.orgId, org.id));
              const nextVersion = (latestVersion?.maxVersion || 0) + 1;

              const [created] = await tx.insert(oosFiles).values({
                orgId: org.id,
                template: body.data.template,
                version: nextVersion,
                status: 'draft',
                visibilityDefault: 'free',
                wordCount: sectionWordCount,
                claimCount: 0,
                rawContent: section.content,
                frontmatter: { title: section.title, sourceDocumentId: sourceDoc.id } as any,
              }).returning();
              return created;
            });
            break;
          } catch (err: any) {
            if (err.code === '23505' && retries > 1) {
              retries--;
              continue;
            }
            throw err;
          }
        }

        createdOosFiles.push({
          id: oosFile!.id,
          title: section.title,
          wordCount: sectionWordCount,
        });
      }
    }

    await db.insert((await import('../../db/schema.js')).auditLogs).values(
      createAuditEntry('source_document.created', 'source_document', {
        orgId: org.id,
        entityId: sourceDoc.id,
        details: {
          title: body.data.title,
          wordCount,
          autoSplit: body.data.autoSplit,
          oosDraftsCreated: createdOosFiles.length,
        },
      })
    );

    return reply.status(201).send({
      sourceDocument: sourceDoc,
      oosDrafts: createdOosFiles,
      splitCount: createdOosFiles.length,
    });
  });

  // ============================================================
  // GET /api/v1/source-documents -- List source docs for current org
  // ============================================================
  app.get<{ Querystring: { limit?: string } }>('/source-documents', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const limit = Math.min(parseInt(request.query.limit || '50', 10), 100);

    const docs = await db.select()
      .from(sourceDocuments)
      .where(eq(sourceDocuments.orgId, org.id))
      .orderBy(desc(sourceDocuments.createdAt))
      .limit(limit);

    return { sourceDocuments: docs, total: docs.length };
  });

  // ============================================================
  // GET /api/v1/source-documents/:id -- Get source doc + linked OOS files
  // ============================================================
  app.get<{ Params: { id: string } }>('/source-documents/:id', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const id = requireUuidParam(request, reply);
    if (!id) return;

    const [sourceDoc] = await db.select()
      .from(sourceDocuments)
      .where(and(eq(sourceDocuments.id, id), eq(sourceDocuments.orgId, org.id)))
      .limit(1);

    if (!sourceDoc) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Source document not found' } });
    }

    // Find OOS files that were created from this source document
    // They have sourceDocumentId in their frontmatter
    const linkedOos = await db.select({
      id: oosFiles.id,
      template: oosFiles.template,
      version: oosFiles.version,
      status: oosFiles.status,
      wordCount: oosFiles.wordCount,
      claimCount: oosFiles.claimCount,
      frontmatter: oosFiles.frontmatter,
      publishedAt: oosFiles.publishedAt,
      createdAt: oosFiles.createdAt,
    })
      .from(oosFiles)
      .where(
        and(
          eq(oosFiles.orgId, org.id),
          sql`${oosFiles.frontmatter}->>'sourceDocumentId' = ${id}`
        )
      )
      .orderBy(oosFiles.version);

    return {
      sourceDocument: sourceDoc,
      linkedOosFiles: linkedOos,
      linkedCount: linkedOos.length,
    };
  });
}
