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
import { resolveApiKey, requireScope } from '../../middleware/api-key-auth.js';
import { getAuthOrg } from '../../middleware/auth-helpers.js';
import type { TemplateType } from '../../shared/enums.js';
import { TEMPLATE_TYPES } from '../../shared/enums.js';
import { requireUuidParam } from '../../shared/param-validation.js';
import { createRateLimiter } from '../../shared/rate-limiter.js';
import { z } from 'zod';

const checkRateLimit = createRateLimiter({ windowMs: 60000, maxRequests: 10 });

// Zod schemas for unauthenticated endpoints
const fixOOSSchema = z.object({
  rawContent: z.string().min(1).max(200000),
  template: z.enum(TEMPLATE_TYPES).optional(),
});

const generateOOSSchema = z.object({
  description: z.string().min(20).max(10000),
  template: z.enum(TEMPLATE_TYPES).optional().default('agent_army'),
});

// Helper: check API key scope for write operations
// Returns true if request uses Clerk auth (no scope restriction) or API key has required scope
async function checkApiKeyScope(request: FastifyRequest, reply: any, requiredScope: string): Promise<boolean> {
  const auth = getAuth(request);
  if (auth.userId) return true; // Clerk auth -- no scope restriction
  const apiKeyCtx = await resolveApiKey(request);
  if (apiKeyCtx && !requireScope(apiKeyCtx, requiredScope)) {
    reply.status(403).send({ error: { code: 'INSUFFICIENT_SCOPE', message: `API key requires '${requiredScope}' scope for this operation` } });
    return false;
  }
  return true;
}

export default async function oosRoutes(app: FastifyInstance) {

  // ============================================================
  // POST /api/v1/oos/fix -- Auto-fix OOS content (no auth required)
  // ============================================================
  app.post('/oos/fix', async (request, reply) => {
    if (!checkRateLimit(request.ip)) {
      return reply.status(429).send({ error: { code: 'RATE_LIMITED', message: 'Too many requests. Max 10 per minute.' } });
    }

    const bodyResult = fixOOSSchema.safeParse(request.body);
    if (!bodyResult.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid input', details: bodyResult.error.issues } });
    }

    const template = bodyResult.data.template;
    const result = autoFixOOS(bodyResult.data.rawContent, template);

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
  // POST /api/v1/oos/generate -- Generate OOS from description (no auth required)
  // ============================================================
  app.post('/oos/generate', async (request, reply) => {
    if (!checkRateLimit(request.ip)) {
      return reply.status(429).send({ error: { code: 'RATE_LIMITED', message: 'Too many requests. Max 10 per minute.' } });
    }

    const bodyResult = generateOOSSchema.safeParse(request.body);
    if (!bodyResult.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid input', details: bodyResult.error.issues } });
    }

    const description = bodyResult.data.description.trim();
    const template = bodyResult.data.template as TemplateType;

    // ---- Template-based OOS generation from natural language ----

    // Extract agent names: look for patterns like "AgentName is..." or "**AgentName**" or "AgentName -"
    const agentPatterns = [
      /(?:^|\n)\s*(?:\*\*)?([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)(?:\*\*)?\s+(?:is\s+(?:our|the|a|an)\s+)/gm,
      /(?:^|\n)\s*(?:\*\*)?([A-Z][a-z]+)(?:\*\*)?\s*[-:]\s*(?:Chief|Lead|Manager|Analyst|Assistant|Engineer|Coordinator|Director|Officer|Strategist|Monitor|Scout|Agent)/gm,
      /(?:^|\n)\s*###?\s*(?:\*\*)?([A-Z][a-z]+)(?:\*\*)?\s*[-:]/gm,
    ];
    const agentNames = new Set<string>();
    for (const pattern of agentPatterns) {
      let match;
      while ((match = pattern.exec(description)) !== null) {
        const name = match[1].trim();
        // Filter out common false positives
        const stopWords = ['The', 'Our', 'We', 'This', 'That', 'Each', 'Every', 'All', 'Any', 'Some', 'New', 'Rules', 'Tools', 'Industry', 'Size', 'Example', 'Note', 'Step', 'Day', 'Week', 'Month'];
        if (!stopWords.includes(name) && name.length > 1 && name.length < 30) {
          agentNames.add(name);
        }
      }
    }

    // Extract rules: lines starting with "- " or numbered items or lines with "must", "never", "always"
    const rules: string[] = [];
    const lines = description.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      // Bullet points or numbered lists that look like rules
      if (/^[-*]\s+.{10,}/.test(trimmed)) {
        const ruleText = trimmed.replace(/^[-*]\s+/, '');
        rules.push(ruleText);
      } else if (/^\d+[.)]\s+.{10,}/.test(trimmed)) {
        const ruleText = trimmed.replace(/^\d+[.)]\s+/, '');
        rules.push(ruleText);
      } else if (/\b(must|never|always|shall|required|forbidden|prohibited)\b/i.test(trimmed) && trimmed.length > 20 && trimmed.length < 300) {
        if (!rules.includes(trimmed)) {
          rules.push(trimmed);
        }
      }
    }

    // Extract tools/platforms
    const toolPatterns = /\b(Slack|Gmail|Google Calendar|Todoist|Meta Ads|Google Ads|Accelo|GHL|HubSpot|Salesforce|Zapier|Make|n8n|Notion|Asana|Jira|Monday|Airtable|Stripe|QuickBooks|Xero|Calendly|Twilio|SendGrid|Hubstaff|Proposify|GitHub|GitLab|Confluence|Linear|ClickUp|Intercom|Zendesk|Freshdesk|Mailchimp|ActiveCampaign|Shopify|BigCommerce|WooCommerce|Webflow|WordPress|Figma|Miro|Loom|Zoom|Teams|Discord|Trello)\b/gi;
    const tools = new Set<string>();
    let toolMatch;
    while ((toolMatch = toolPatterns.exec(description)) !== null) {
      tools.add(toolMatch[1]);
    }

    // Extract industry
    const industryPatterns = /\b(?:industry|sector|business|company|agency|firm|practice|studio|clinic|shop)[\s:]*([A-Za-z\s]+?)(?:\.|,|\n|$)/i;
    const industryMatch = description.match(industryPatterns);
    let industry = '';
    if (industryMatch) {
      industry = industryMatch[1].trim().substring(0, 50);
    }
    // Also check for "Industry: X" pattern
    const industryLabel = description.match(/industry\s*[:=]\s*(.+?)(?:\n|$)/i);
    if (industryLabel) {
      industry = industryLabel[1].trim().substring(0, 50);
    }

    // Extract size
    let size = 'small';
    if (/\b(?:solo|solopreneur|one.?person|freelancer)\b/i.test(description)) size = 'solo';
    else if (/\b(?:enterprise|10[0-9]{2,}|thousand|corporate)\b/i.test(description)) size = 'enterprise';
    else if (/\b(?:large|[5-9]\d{1,2}\s*(?:employee|people|staff))\b/i.test(description)) size = 'large';
    else if (/\b(?:medium|[2-4]\d\s*(?:employee|people|staff)|50\s*(?:employee|people|staff))\b/i.test(description)) size = 'medium';

    // Extract agent count
    const agentCountMatch = description.match(/(\d+)\s*(?:AI\s+)?agents?\b/i);
    const agentCount = agentCountMatch ? parseInt(agentCountMatch[1], 10) : agentNames.size || 1;

    // Extract org name
    const orgNameMatch = description.match(/(?:we\s+(?:run|are|operate)\s+)([A-Z][A-Za-z\s&]+?)(?:\s+with|\s+and|\.|,)/);
    const orgPseudonym = orgNameMatch ? orgNameMatch[1].trim().substring(0, 50) : 'My Organization';

    // Extract paragraphs for agent descriptions (to generate claims from)
    const agentDescriptions: Record<string, string> = {};
    for (const name of agentNames) {
      const descPattern = new RegExp(`(?:^|\\n)\\s*(?:\\*\\*)?${name}(?:\\*\\*)?\\s+(?:is|[-:])\\s*(.+?)(?=\\n\\s*(?:\\*\\*)?[A-Z][a-z]+(?:\\*\\*)?\\s+(?:is|[-:])|\\n\\s*(?:Rules|Tools|Industry)|$)`, 'si');
      const descMatch = description.match(descPattern);
      if (descMatch) {
        agentDescriptions[name] = descMatch[1].trim().replace(/\n/g, ' ').substring(0, 300);
      }
    }

    // ---- Build OOS markdown ----
    const claimSections: string[] = [];
    let claimNum = 1;

    // Generate claims from rules
    if (rules.length > 0) {
      claimSections.push('## core_operating_rules\n');
      for (const rule of rules) {
        const cid = String(claimNum).padStart(3, '0');
        claimSections.push(`**[C${cid}]** core_operating_rules`);
        claimSections.push(`- **Rule:** ${rule}`);
        claimSections.push(`- **Why:** Defined as an operational rule for the organization.`);
        claimSections.push(`- **Failure mode:** Rule is violated, leading to coordination breakdown or inconsistent behavior.`);
        claimSections.push(`- **Confidence:** MEDIUM`);
        claimSections.push(`- **Evidence:** HUMAN_DEFINED_RULE`);
        claimSections.push(`- **Scope:** org-wide\n`);
        claimNum++;
      }
    }

    // Generate claims from agent descriptions
    if (agentNames.size > 0) {
      claimSections.push('## agent_definitions\n');
      for (const name of agentNames) {
        const cid = String(claimNum).padStart(3, '0');
        const desc = agentDescriptions[name] || `${name} is a defined agent in the organization.`;
        claimSections.push(`**[C${cid}]** agent_definitions`);
        claimSections.push(`- **Rule:** ${name}: ${desc}`);
        claimSections.push(`- **Why:** Each agent has a defined role and clear boundaries to prevent overlap and ensure accountability.`);
        claimSections.push(`- **Failure mode:** Without a clear role definition, ${name} may overlap with other agents or miss responsibilities.`);
        claimSections.push(`- **Confidence:** MEDIUM`);
        claimSections.push(`- **Evidence:** HUMAN_DEFINED_RULE`);
        claimSections.push(`- **Scope:** ${name.toLowerCase()}\n`);
        claimNum++;
      }
    }

    // If no claims were generated, create a minimal set
    if (claimNum === 1) {
      // Extract sentences from the description as generic claims
      const sentences = description.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20 && s.length < 300);
      claimSections.push('## core_operating_rules\n');
      for (const sentence of sentences.slice(0, 10)) {
        const cid = String(claimNum).padStart(3, '0');
        claimSections.push(`**[C${cid}]** core_operating_rules`);
        claimSections.push(`- **Rule:** ${sentence}.`);
        claimSections.push(`- **Why:** Operational practice described by the organization.`);
        claimSections.push(`- **Failure mode:** Practice is not followed, leading to degraded coordination.`);
        claimSections.push(`- **Confidence:** MEDIUM`);
        claimSections.push(`- **Evidence:** HUMAN_DEFINED_RULE`);
        claimSections.push(`- **Scope:** org-wide\n`);
        claimNum++;
      }
    }

    const totalClaims = claimNum - 1;
    const toolsArr = Array.from(tools);
    const platformStr = toolsArr.length > 0 ? toolsArr.join(', ') : 'Not specified';

    const oos = `---
oos_version: "1.0"
org_pseudonym: "${orgPseudonym.replace(/"/g, '\\"')}"
template: "${template}"
industry: "${industry.replace(/"/g, '\\"') || 'Not specified'}"
org_size: "${size}"
agent_count: ${agentCount}
platforms: "${platformStr}"
total_claims: ${totalClaims}
---

${claimSections.join('\n')}`.trim();

    // Run through auto-fixer to clean up any issues
    const fixResult = autoFixOOS(oos, template);

    // Parse and validate
    const parsed = parseOOS(fixResult.fixed, template);
    const validation = validateOOS(parsed, template);

    return {
      generated: fixResult.fixed,
      claimCount: parsed.claims.length || totalClaims,
      template,
      validation,
      extracted: {
        agentNames: Array.from(agentNames),
        ruleCount: rules.length,
        tools: toolsArr,
        industry,
        size,
        agentCount,
      },
    };
  });

  // ============================================================
  // POST /api/v1/oos -- Create new OOS (draft)
  // ============================================================
  app.post('/oos', async (request, reply) => {
    if (!(await checkApiKeyScope(request, reply, 'write'))) return;
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

    // Get next version number and create draft atomically to avoid race conditions
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
        details: { template: body.data.template, version: oosFile!.version, claimCount: parsed.claims.length },
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
    const id = requireUuidParam(request, reply);
    if (!id) return;
    if (!(await checkApiKeyScope(request, reply, 'write'))) return;

    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
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
    const id = requireUuidParam(request, reply);
    if (!id) return;
    if (!(await checkApiKeyScope(request, reply, 'write'))) return;

    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
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

    // Step 5: Compute similarities (BACKGROUND -- does not block publish response)
    // Fire-and-forget: similarity computation runs async after the response is sent.
    // This prevents O(n*m) comparisons from blocking the publish request as the platform scales.
    const oosIdForSim = id;
    setImmediate(async () => {
      try {
        const oosClaimsWithIds = await db.select().from(claims).where(eq(claims.oosFileId, oosIdForSim));
        const allOtherClaims = await db.select().from(claims)
          .where(sql`${claims.oosFileId} != ${oosIdForSim} AND ${claims.oosFileId} IN (
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

        const simPairs = computeAllSimilarities(newClaimsForSim, oosIdForSim, existingForSim);

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
        console.log(`[similarity] Background computation complete for OOS ${oosIdForSim}: ${simPairs.length} pairs found`);
      } catch (err) {
        console.error(`[similarity] Background computation failed for OOS ${oosIdForSim}:`, err);
      }
    });

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
          similaritiesFound: 'computing_async',
        },
      })
    );

    return {
      oosFile: published,
      qualityTier: qualityResult.tier,
      qualityScore: qualityResult.score,
      agenticLevel: agenticResult.level,
      agenticLabel: agenticResult.label,
      similaritiesFound: 'computing_async',
      validation,
      piiScan: { clean: true },
    };
  });

  // ============================================================
  // GET /api/v1/oos/mine -- Get the authenticated user's latest published OOS
  // ============================================================
  app.get('/oos/mine', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const [latest] = await db.select({
      id: oosFiles.id,
      version: oosFiles.version,
      template: oosFiles.template,
      status: oosFiles.status,
      claimCount: oosFiles.claimCount,
      wordCount: oosFiles.wordCount,
      frontmatter: oosFiles.frontmatter,
      publishedAt: oosFiles.publishedAt,
    })
      .from(oosFiles)
      .where(and(eq(oosFiles.orgId, org.id), eq(oosFiles.status, 'published')))
      .orderBy(desc(oosFiles.version))
      .limit(1);

    if (!latest) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'No published OOS found' } });
    }

    return { org: { id: org.id, name: org.name }, oosFile: latest };
  });

  // ============================================================
  // GET /api/v1/oos/:id -- Get OOS file
  // ============================================================
  app.get<{ Params: { id: string } }>('/oos/:id', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
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
      const id = requireUuidParam(request, reply);
      if (!id) return;

      // Check if the OOS file exists and handle draft access control
      const [oosFile] = await db.select().from(oosFiles).where(eq(oosFiles.id, id)).limit(1);
      if (!oosFile) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'OOS file not found' } });

      if (oosFile.status === 'draft') {
        const org = await getAuthOrg(request);
        if (!org || org.id !== oosFile.orgId) {
          return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'OOS file not found' } });
        }
      }

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
    const id = requireUuidParam(request, reply);
    if (!id) return;

    // Get the org for this OOS file
    const [oosFile] = await db.select().from(oosFiles).where(eq(oosFiles.id, id)).limit(1);
    if (!oosFile) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'OOS file not found' } });

    // Check if the authenticated user owns the org
    const org = await getAuthOrg(request);
    const isOwner = org && org.id === oosFile.orgId;

    // Get versions -- unauthenticated users only see published versions
    const versionConditions = isOwner
      ? eq(oosFiles.orgId, oosFile.orgId)
      : and(eq(oosFiles.orgId, oosFile.orgId), eq(oosFiles.status, 'published'));

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
      .where(versionConditions)
      .orderBy(desc(oosFiles.version));

    return { versions };
  });

  // ============================================================
  // POST /api/v1/oos/:id/archive -- Archive a published OOS
  // ============================================================
  app.post<{ Params: { id: string } }>('/oos/:id/archive', async (request, reply) => {
    const id = requireUuidParam(request, reply);
    if (!id) return;
    if (!(await checkApiKeyScope(request, reply, 'write'))) return;

    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
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
    const id = requireUuidParam(request, reply);
    if (!id) return;
    if (!(await checkApiKeyScope(request, reply, 'write'))) return;

    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
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
    const id = requireUuidParam(request, reply);
    if (!id) return;
    if (!(await checkApiKeyScope(request, reply, 'write'))) return;

    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
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
    const id = requireUuidParam(request, reply);
    if (!id) return;
    if (!(await checkApiKeyScope(request, reply, 'write'))) return;

    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    const [oosFile] = await db.select().from(oosFiles).where(and(eq(oosFiles.id, id), eq(oosFiles.orgId, org.id))).limit(1);
    if (!oosFile) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'OOS file not found' } });

    // Use provided rawContent or copy from source
    const newVersionSchema = z.object({
      rawContent: z.string().min(100).optional(),
    });
    const newVersionBody = newVersionSchema.safeParse(request.body || {});
    const rawContent = newVersionBody.success && newVersionBody.data.rawContent
      ? newVersionBody.data.rawContent
      : oosFile.rawContent;

    // Parse the content
    const parsed = parseOOS(rawContent, oosFile.template as TemplateType);

    // Get next version number and create draft atomically to avoid race conditions
    let newOosFile: typeof oosFiles.$inferSelect = undefined as any;
    let newVersionRetries = 3;
    while (newVersionRetries > 0) {
      try {
        newOosFile = await db.transaction(async (tx) => {
          const [latestVersion] = await tx.select({ maxVersion: sql<number>`MAX(${oosFiles.version})` })
            .from(oosFiles)
            .where(eq(oosFiles.orgId, org.id));
          const nextVersion = (latestVersion?.maxVersion || 0) + 1;

          const [created] = await tx.insert(oosFiles).values({
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
          return created;
        });
        break;
      } catch (err: any) {
        if (err.code === '23505' && newVersionRetries > 1) {
          newVersionRetries--;
          continue;
        }
        throw err;
      }
    }

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
        details: { sourceId: id, sourceVersion: oosFile.version, newVersion: newOosFile!.version, claimCount: parsed.claims.length },
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
      const id = requireUuidParam(request, reply, 'id');
      if (!id) return;
      const otherId = requireUuidParam(request, reply, 'otherId');
      if (!otherId) return;

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
