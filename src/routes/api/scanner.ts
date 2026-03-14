import type { FastifyInstance } from 'fastify';
import { db } from '../../config/database.js';
import { auditLogs } from '../../db/schema.js';
import { runScan, type ScannerInput } from '../../services/scanner.js';
import { createAuditEntry } from '../../services/audit-logger.js';

export default async function scannerRoutes(app: FastifyInstance) {

  // POST /api/v1/scanner/scan -- Run the Agent Coordination Scanner
  app.post<{ Body: ScannerInput }>('/scanner/scan', async (request, reply) => {
    const input = request.body as ScannerInput;

    // Basic validation
    if (!input.orgName || !input.roles || input.roles.length === 0) {
      return reply.status(400).send({
        error: {
          code: 'INVALID_INPUT',
          message: 'At minimum, orgName and at least one role are required.',
        },
      });
    }

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
    const body = request.body as Partial<ScannerInput>;

    if (!body.orgName || !body.roles || body.roles.length === 0) {
      return reply.status(400).send({
        error: {
          code: 'INVALID_INPUT',
          message: 'orgName and at least one role required for quick scan.',
        },
      });
    }

    // Fill in defaults for missing fields
    const input: ScannerInput = {
      orgName: body.orgName,
      industry: body.industry || 'unknown',
      orgSize: body.orgSize || 'small',
      systems: body.systems || [],
      roles: body.roles,
      workflows: body.workflows || [],
      oversight: body.oversight || {
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
