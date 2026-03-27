import type { FastifyInstance } from 'fastify';
import { db } from '../../config/database.js';
import { auditLogs } from '../../db/schema.js';
import { runScan, type ScannerInput } from '../../services/scanner.js';
import { createAuditEntry } from '../../services/audit-logger.js';
import { z } from 'zod';

// Simple per-IP rate limiter for unauthenticated endpoints
const ipLimiter = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(ip: string, maxPerMin: number): boolean {
  const now = Date.now();
  const entry = ipLimiter.get(ip);
  if (!entry || now > entry.resetAt) {
    ipLimiter.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }
  if (entry.count >= maxPerMin) return false;
  entry.count++;
  return true;
}

// Cleanup expired rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of ipLimiter.entries()) {
    if (now > value.resetAt) {
      ipLimiter.delete(key);
    }
  }
}, 5 * 60 * 1000).unref();

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
    if (!checkRateLimit(request.ip, 10)) {
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

  // POST /api/v1/scanner/quick -- Minimal scan for fastest possible insight
  // Only requires: orgName, systems, and roles. No workflows or oversight needed.
  app.post('/scanner/quick', async (request, reply) => {
    if (!checkRateLimit(request.ip, 10)) {
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
}
