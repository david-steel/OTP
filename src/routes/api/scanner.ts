import type { FastifyInstance } from 'fastify';
import { db } from '../../config/database.js';
import { auditLogs } from '../../db/schema.js';
import { runScan, type ScannerInput, type GeneratedClaim } from '../../services/scanner.js';
import { createAuditEntry } from '../../services/audit-logger.js';
import { createRateLimiter } from '../../shared/rate-limiter.js';
import { z } from 'zod';
import type { Confidence, EvidenceType } from '../../shared/enums.js';

const checkRateLimit = createRateLimiter({ windowMs: 60000, maxRequests: 10 });

const scannerInputSchema = z.object({
  orgName: z.string().min(1).max(200),
  industry: z.string().max(100).optional().default('unknown'),
  orgSize: z.enum(['solo', 'small', 'medium', 'large', 'enterprise']).optional().default('small'),
  systems: z.array(z.object({
    name: z.string().min(1).max(100),
    category: z.enum(['ai_model', 'automation', 'saas_platform', 'internal_tool', 'communication', 'database']),
    description: z.string().max(500).optional(),
  })).max(50).optional().default([]),
  roles: z.array(z.object({
    name: z.string().min(1).max(100),
    type: z.enum(['ai_agent', 'automation', 'human_operator', 'human_decision_maker']),
    system: z.string().max(100).optional(),
    responsibilities: z.array(z.string().max(300)).max(20),
    authority: z.enum(['autonomous', 'semi_autonomous', 'supervised', 'advisory']),
  })).min(1).max(50),
  workflows: z.array(z.object({
    name: z.string().min(1).max(200),
    trigger: z.string().max(200),
    steps: z.array(z.object({
      actor: z.string().max(100),
      action: z.string().max(500),
      handoff_to: z.string().max(100).optional(),
    })).max(30),
  })).max(20).optional().default([]),
  oversight: z.object({
    uncertainty_handler: z.string().max(200),
    error_handler: z.string().max(200),
    override_authority: z.string().max(200),
    review_frequency: z.enum(['real_time', 'daily', 'weekly', 'none']),
    human_approval_required: z.array(z.string().max(200)).max(20),
  }).optional().default({
    uncertainty_handler: '',
    error_handler: '',
    override_authority: '',
    review_frequency: 'none',
    human_approval_required: [],
  }),
});

export default async function scannerRoutes(app: FastifyInstance) {

  // POST /api/v1/scanner/scan -- Run the Agent Coordination Scanner
  app.post<{ Body: ScannerInput }>('/scanner/scan', async (request, reply) => {
    if (!checkRateLimit(request.ip)) {
      return reply.status(429).send({ error: { code: 'RATE_LIMITED', message: 'Too many requests. Max 10 per minute.' } });
    }

    const parsed = scannerInputSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Invalid scanner input',
          details: parsed.error.issues,
        },
      });
    }

    const input = parsed.data as ScannerInput;

    // Run the scan
    const result = runScan(input);

    // Audit log (anonymous -- no auth required for scanning)
    await db.insert(auditLogs).values(
      createAuditEntry('scanner.scan', 'scanner', {
        actorType: 'user',
        details: {
          orgName: input.orgName,
          roleCount: input.roles.length,
          workflowCount: input.workflows.length,
          systemCount: input.systems.length,
          score: result.score.overall,
          insightCount: result.insights.length,
          claimCount: result.oos.claims.length,
          duration: result.scanDuration,
        },
      })
    );

    return result;
  });

  // POST /api/v1/scanner/from-text -- Parse raw CLAUDE.md or OOS markdown into a scan
  // Extracts agents, systems, workflows, oversight from unstructured text
  app.post('/scanner/from-text', async (request, reply) => {
    const body = request.body as any;
    const text = body.text || '';
    if (!text || text.length < 50) {
      return reply.status(400).send({ error: { code: 'TOO_SHORT', message: 'Text must be at least 50 characters' } });
    }

    const lower = text.toLowerCase();

    // Extract org name from frontmatter or first heading
    let orgName = 'Unknown Organization';
    const orgMatch = text.match(/org_pseudonym:\s*"?([^"\n]+)/i) || text.match(/^#\s+(.+)/m);
    if (orgMatch) orgName = orgMatch[1].trim().replace(/"/g, '');

    // Extract agents from patterns like "### AGENT_NAME" or "**Agent Name** - Role"
    const roles: any[] = [];
    const agentPatterns = [
      /###\s+([A-Z][A-Z\s]+)\s*[-–]\s*(.+)/g,  // ### RADAR - Chief of Staff
      /\*\*([A-Z][a-zA-Z\s]+)\*\*\s*[-–]\s*(.+)/g,  // **Radar** - Chief of Staff
      /\|\s*\*\*([A-Za-z]+)\*\*\s*\|\s*([^|]+)/g,  // | **Agent** | Role |
    ];
    const seenAgents = new Set<string>();
    for (const pattern of agentPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const name = match[1].trim();
        if (name.length > 1 && name.length < 30 && !seenAgents.has(name.toLowerCase())) {
          seenAgents.add(name.toLowerCase());
          const desc = match[2]?.trim() || '';
          const isHuman = /ceo|coo|founder|owner|manager|director|human/i.test(desc);
          roles.push({
            name,
            type: isHuman ? 'human_decision_maker' : 'ai_agent',
            responsibilities: [desc.substring(0, 200)],
            authority: /autonomous|auto/i.test(lower) && !isHuman ? 'autonomous' :
                       /supervised|approval/i.test(desc) ? 'supervised' : 'semi_autonomous',
          });
        }
      }
    }

    // If no agents found from patterns, look for "agent_count:" in frontmatter
    if (roles.length === 0) {
      const countMatch = text.match(/agent_count:\s*(\d+)/i);
      const agentCount = countMatch ? parseInt(countMatch[1]) : 1;
      for (let i = 0; i < Math.min(agentCount, 5); i++) {
        roles.push({
          name: `Agent ${i + 1}`,
          type: 'ai_agent',
          responsibilities: ['AI agent operations'],
          authority: 'semi_autonomous',
        });
      }
      // Add a human
      roles.push({
        name: 'Founder',
        type: 'human_decision_maker',
        responsibilities: ['Strategic decisions', 'Override authority'],
        authority: 'autonomous',
      });
    }

    // Extract systems/platforms
    const systems: any[] = [];
    const knownPlatforms: Record<string, string> = {
      'claude': 'ai_model', 'gpt': 'ai_model', 'gemini': 'ai_model',
      'slack': 'communication', 'gmail': 'communication', 'email': 'communication',
      'todoist': 'saas_platform', 'accelo': 'saas_platform', 'ghl': 'saas_platform',
      'google ads': 'saas_platform', 'meta ads': 'saas_platform',
      'obsidian': 'internal_tool', 'github': 'internal_tool',
      'zapier': 'automation', 'make': 'automation', 'n8n': 'automation',
    };
    const seenSystems = new Set<string>();
    for (const [keyword, category] of Object.entries(knownPlatforms)) {
      if (lower.includes(keyword) && !seenSystems.has(keyword)) {
        seenSystems.add(keyword);
        systems.push({ name: keyword.charAt(0).toUpperCase() + keyword.slice(1), category });
      }
    }
    if (systems.length === 0) {
      systems.push({ name: 'Claude', category: 'ai_model' });
    }

    // Extract oversight patterns
    const hasApproval = /approval|approve|human.*(review|check|sign.off)/i.test(text);
    const hasEscalation = /escalat|override|fallback/i.test(text);
    const hasMonitoring = /monitor|alert|staleness|stale/i.test(text);

    const oversight = {
      uncertainty_handler: hasEscalation ? 'Escalate to human decision maker' : '',
      error_handler: hasMonitoring ? 'Log error and alert' : 'Manual review',
      override_authority: roles.find(r => r.type === 'human_decision_maker')?.name || 'Founder',
      review_frequency: (hasMonitoring ? 'daily' : hasApproval ? 'weekly' : 'none') as 'daily' | 'weekly' | 'none',
      human_approval_required: hasApproval ? ['External communications', 'Strategic decisions'] : [],
    };

    // Extract workflows from patterns
    const workflows: any[] = [];
    const wfMatch = text.match(/briefing|pipeline|workflow|daily.*scan|morning/gi);
    if (wfMatch && roles.length >= 2) {
      workflows.push({
        name: 'Primary Workflow',
        trigger: 'daily schedule',
        steps: roles.slice(0, 3).map((r, i) => ({
          actor: r.name,
          action: r.responsibilities[0] || 'Process',
          handoff_to: roles[i + 1]?.name,
        })).filter(s => s.actor),
      });
    }

    // Determine industry and size
    const industry = text.match(/industry:\s*"?([^"\n]+)/i)?.[1]?.trim() || 'technology';
    const sizeMatch = text.match(/org_size:\s*"?([^"\n]+)/i)?.[1]?.trim();
    const orgSize = (sizeMatch as any) || 'small';

    const input: ScannerInput = { orgName, industry, orgSize, systems, roles, workflows, oversight };
    const result = runScan(input);

    return {
      score: result.score,
      insights: result.insights,
      graph: result.graph,
      oos: result.oos,
      extracted: {
        orgName,
        agentCount: roles.filter(r => r.type === 'ai_agent').length,
        humanCount: roles.filter(r => r.type.includes('human')).length,
        systemCount: systems.length,
        workflowCount: workflows.length,
      },
    };
  });

  // POST /api/v1/scanner/quick -- Minimal scan for fastest possible insight
  // Only requires: orgName, systems, and roles. No workflows or oversight needed.
  app.post('/scanner/quick', async (request, reply) => {
    if (!checkRateLimit(request.ip)) {
      return reply.status(429).send({ error: { code: 'RATE_LIMITED', message: 'Too many requests. Max 10 per minute.' } });
    }

    const quickScanSchema = z.object({
      orgName: z.string().min(1).max(200),
      industry: z.string().max(100).optional(),
      orgSize: z.enum(['solo', 'small', 'medium', 'large', 'enterprise']).optional(),
      systems: z.array(z.object({
        name: z.string().min(1).max(100),
        category: z.enum(['ai_model', 'automation', 'saas_platform', 'internal_tool', 'communication', 'database']),
        description: z.string().max(500).optional(),
      })).max(50).optional(),
      roles: z.array(z.object({
        name: z.string().min(1).max(100),
        type: z.enum(['ai_agent', 'automation', 'human_operator', 'human_decision_maker']),
        system: z.string().max(100).optional(),
        responsibilities: z.array(z.string().max(300)).max(20),
        authority: z.enum(['autonomous', 'semi_autonomous', 'supervised', 'advisory']),
      })).min(1).max(50),
      workflows: z.array(z.object({
        name: z.string().min(1).max(200),
        trigger: z.string().max(200),
        steps: z.array(z.object({
          actor: z.string().max(100),
          action: z.string().max(500),
          handoff_to: z.string().max(100).optional(),
        })).max(30),
      })).max(20).optional(),
      oversight: z.object({
        uncertainty_handler: z.string().max(200),
        error_handler: z.string().max(200),
        override_authority: z.string().max(200),
        review_frequency: z.enum(['real_time', 'daily', 'weekly', 'none']),
        human_approval_required: z.array(z.string().max(200)).max(20),
      }).optional(),
    });

    const parsed = quickScanSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Invalid quick scan input',
          details: parsed.error.issues,
        },
      });
    }

    // Fill in defaults for missing fields
    const input: ScannerInput = {
      orgName: parsed.data.orgName,
      industry: parsed.data.industry || 'unknown',
      orgSize: parsed.data.orgSize || 'small',
      systems: parsed.data.systems || [],
      roles: parsed.data.roles,
      workflows: parsed.data.workflows || [],
      oversight: parsed.data.oversight || {
        uncertainty_handler: '',
        error_handler: '',
        override_authority: '',
        review_frequency: 'none',
        human_approval_required: [],
      },
    };

    const result = runScan(input);

    return {
      score: result.score,
      insights: result.insights.filter(i => i.severity === 'critical' || i.severity === 'warning'),
      graph: result.graph,
      claimCount: result.oos.claims.length,
      message: 'Quick scan complete. Run a full scan with workflows and oversight data for deeper analysis.',
    };
  });

  // POST /api/v1/scanner/resolve-insight -- Generate a new claim from an insight resolution
  const resolveInsightSchema = z.object({
    insight_id: z.string().min(1).max(50),
    insight_title: z.string().min(1).max(500),
    insight_description: z.string().max(2000).optional().default(''),
    resolution: z.string().min(1).max(2000),
    oos_content: z.string().max(500000),
  });

  app.post('/scanner/resolve-insight', async (request, reply) => {
    if (!checkRateLimit(request.ip)) {
      return reply.status(429).send({ error: { code: 'RATE_LIMITED', message: 'Too many requests. Max 10 per minute.' } });
    }

    const parsed = resolveInsightSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Invalid resolve-insight input',
          details: parsed.error.issues,
        },
      });
    }

    const { insight_id, insight_title, insight_description, resolution, oos_content } = parsed.data;

    // Infer the section from the insight title keywords
    const section = inferSectionFromInsight(insight_title);

    // Generate a claim ID by finding the highest existing claim number and incrementing
    const claimIdMatch = oos_content.match(/\[C(\d+)\]/g);
    let nextNum = 1;
    if (claimIdMatch) {
      const nums = claimIdMatch.map(m => parseInt(m.replace('[C', '').replace(']', ''), 10));
      nextNum = Math.max(...nums) + 1;
    }
    const claimId = `C${String(nextNum).padStart(3, '0')}`;

    // Build the failure mode from the insight context
    const failureMode = insight_description
      ? `Without this rule: ${insight_description}`
      : `Without this rule, the issue identified by ${insight_id} remains unresolved and may cause coordination failures.`;

    const newClaim: GeneratedClaim = {
      claimId,
      section,
      rule: resolution,
      why: `Resolves ${insight_id}: ${insight_title}`,
      failureMode,
      confidence: 'MEDIUM' as Confidence,
      evidence: 'HUMAN_DEFINED_RULE' as EvidenceType,
      scope: `Addresses insight ${insight_id}.`,
    };

    // Format the claim as markdown
    const claimMarkdown = formatClaimMarkdown(newClaim);

    // Append to the OOS content
    // Try to find the matching section header and append there
    const sectionTitle = section.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    let updatedContent: string;

    const sectionHeaderRegex = new RegExp(`^## ${escapeRegex(sectionTitle)}\\s*$`, 'm');
    if (sectionHeaderRegex.test(oos_content)) {
      // Find the section and append the claim at the end of that section (before the next ## or end of file)
      const sectionIdx = oos_content.search(sectionHeaderRegex);
      const afterSection = oos_content.slice(sectionIdx);
      const nextSectionMatch = afterSection.match(/\n## (?!.*$)/m);

      if (nextSectionMatch && nextSectionMatch.index !== undefined) {
        // Insert before the next section
        const insertPoint = sectionIdx + nextSectionMatch.index;
        updatedContent = oos_content.slice(0, insertPoint) + claimMarkdown + '\n' + oos_content.slice(insertPoint);
      } else {
        // Append at the end
        updatedContent = oos_content + '\n' + claimMarkdown;
      }
    } else {
      // Section does not exist -- create it and append at the end
      updatedContent = oos_content + `\n## ${sectionTitle}\n\n` + claimMarkdown;
    }

    // Audit log
    await db.insert(auditLogs).values(
      createAuditEntry('scanner.resolve_insight', 'scanner', {
        actorType: 'user',
        details: {
          insightId: insight_id,
          insightTitle: insight_title,
          claimId: newClaim.claimId,
          section: newClaim.section,
        },
      })
    );

    return {
      claim: newClaim,
      claimMarkdown,
      updatedOosContent: updatedContent,
      section,
      sectionTitle,
    };
  });
}

// ---- Helpers for resolve-insight ----

function inferSectionFromInsight(title: string): string {
  const lower = title.toLowerCase();

  // Map keywords to OOS sections
  if (lower.includes('conflict') || lower.includes('priority') || lower.includes('competing')) {
    return 'core_operating_rules';
  }
  if (lower.includes('escalation') || lower.includes('handoff') || lower.includes('dead-end')) {
    return 'coordination_patterns';
  }
  if (lower.includes('oversight') || lower.includes('human') || lower.includes('approval') || lower.includes('override')) {
    return 'human_ai_boundary_conditions';
  }
  if (lower.includes('single point') || lower.includes('failure') || lower.includes('redundancy')) {
    return 'failure_patterns';
  }
  if (lower.includes('authority') || lower.includes('autonomous') || lower.includes('role')) {
    return 'agent_roles_and_authority';
  }
  if (lower.includes('workflow') || lower.includes('trigger') || lower.includes('sequence')) {
    return 'coordination_patterns';
  }

  // Default to core operating rules for anything that doesn't match
  return 'core_operating_rules';
}

function formatClaimMarkdown(claim: GeneratedClaim): string {
  const lines: string[] = [];
  lines.push(`**[${claim.claimId}]** ${claim.section}`);
  lines.push(`- **Rule:** ${claim.rule}`);
  lines.push(`- **Why:** ${claim.why}`);
  lines.push(`- **Failure mode:** ${claim.failureMode}`);
  lines.push(`- **Confidence:** ${claim.confidence}`);
  lines.push(`- **Evidence:** ${claim.evidence}`);
  lines.push(`- **Scope:** ${claim.scope}`);
  lines.push('');
  return lines.join('\n');
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
