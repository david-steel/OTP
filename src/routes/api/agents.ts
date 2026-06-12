/**
 * Agent runtime API.
 *
 * POST /api/v1/agents/:externalId/run    -- fire the agent now (manual trigger)
 * GET  /api/v1/agents/:externalId/runs   -- list recent runs for that agent
 *
 * Auth: Clerk-authed members of the org. Eventually we'll gate run authority
 * on member role + agent_access toggles; v1 lets any active member fire any
 * agent on their org.
 */
import type { FastifyInstance, FastifyRequest } from 'fastify';
import { getAuth } from '@clerk/fastify';
import { z } from 'zod';
import { db } from '../../config/database.js';
import { organizations } from '../../db/schema.js';
import { eq, sql } from 'drizzle-orm';
import { resolveOrgForUser } from '../../services/membership.js';
import { runAgent, runAgentStream, listAgentRuns, type RunAgentSop } from '../../services/agent-runtime.js';
import { getOrgTeamGraph } from '../../services/team-graph.js';
import { createRateLimiter } from '../../shared/rate-limiter.js';
import { resolveDemoPageContext } from '../../middleware/demo-access.js';
import { renderAgentMarkdown } from '../../shared/agent-markdown.js';

// Agent runs spend money (tokens, and the wallet when metering is on), so the
// run endpoint is rate-limited per IP on top of the signed-in-member auth.
const checkRunRateLimit = createRateLimiter({ windowMs: 60_000, maxRequests: 10 });

// Cost guard for the secret-gated demo session: a no-Clerk demo visitor may run
// agents on the Acme demo org, but only this many runs per rolling 24h (on top
// of the per-IP rate limit) so a shared demo link can't run up real AI spend.
const DEMO_RUN_DAILY_CAP = 20;

async function getOrg(request: FastifyRequest) {
  const auth = getAuth(request);
  if (!auth.userId) {
    // No Clerk session: honor the secret-gated demo session ONLY. Resolves to
    // the Acme demo org (forge-proof by the demo_acme constant + assert inside
    // resolveDemoPageContext); returns null for any non-demo no-auth request.
    const demo = await resolveDemoPageContext(request);
    return demo?.org || null;
  }
  const resolved = await resolveOrgForUser(auth.userId);
  if (resolved) return resolved.org;
  const [legacy] = await db.select().from(organizations).where(eq(organizations.clerkOrgId, auth.userId)).limit(1);
  return legacy || null;
}

function validExternalId(id: string): boolean {
  return /^[A-Z0-9_-]{1,120}$/i.test(id);
}

// True when the caller asked for an SSE stream via the Accept header. Used to
// content-negotiate the run endpoint: stream the run live for the hub UI, or
// keep the back-compat JSON response for API callers + existing tests. Exported
// for unit testing (proves JSON callers never accidentally hit the stream path).
export function wantsEventStream(accept: unknown): boolean {
  return typeof accept === 'string' && accept.toLowerCase().includes('text/event-stream');
}

// Format one SSE frame: `data: <json>\n\n`. Pure + exported so the wire format
// is unit-testable without a socket. Mirrors ask-ai.ts's frame shape exactly.
export function sseFrame(payload: unknown): string {
  return `data: ${JSON.stringify(payload)}\n\n`;
}

// Structural type for reply.raw -- avoids the NodeJS global namespace (which the
// lint env doesn't register under no-undef) while matching how we use it. Mirror
// of ask-ai.ts's sseWrite.
function sseWrite(raw: { write: (chunk: string) => unknown }, payload: unknown) {
  raw.write(sseFrame(payload));
}

/**
 * Pure SOP resolver: given an agent node's sops[] and a wanted sopId/sopTitle,
 * return the matching SOP shaped for the runtime, or null if no match. Match by
 * id first (preferred), then by case-insensitive title. DB-free + exported so
 * the 404 paths are unit-testable without a Fastify app or Anthropic.
 */
export function resolveSopFromNode(
  sops: unknown,
  want: { sopId?: string; sopTitle?: string },
): RunAgentSop | null {
  const list: any[] = Array.isArray(sops) ? sops : [];
  const wantId = want.sopId;
  const wantTitle = (want.sopTitle || '').trim().toLowerCase();
  const match = list.find(s => {
    if (wantId && s && s.id === wantId) return true;
    if (!wantId && wantTitle && s && String(s.title || '').trim().toLowerCase() === wantTitle) return true;
    return false;
  });
  if (!match) return null;
  return {
    title: String(match.title || ''),
    trigger: match.trigger ? String(match.trigger) : undefined,
    steps: Array.isArray(match.steps) ? match.steps.map((s: unknown) => String(s)) : undefined,
    outputs: Array.isArray(match.outputs) ? match.outputs.map((o: unknown) => String(o)) : undefined,
    tools: Array.isArray(match.tools) ? match.tools.map((t: unknown) => String(t)) : undefined,
    notes: match.notes ? String(match.notes) : undefined,
  };
}

export default async function agentRoutes(app: FastifyInstance) {
  // POST /api/v1/agents/:externalId/run
  // Body: { prompt? } OR { sopId? , sopTitle? }. When a sopId/sopTitle is given
  // we RESOLVE the SOP server-side from the org's team graph (never trust client-
  // sent steps) and run that SOP's work-product. 404 if the agent or SOP isn't
  // found. Rate-limited per IP since runs spend money.
  app.post<{ Params: { externalId: string }; Body: { prompt?: string; sopId?: string; sopTitle?: string } }>('/agents/:externalId/run', async (request, reply) => {
    const auth = getAuth(request);

    if (!checkRunRateLimit(request.ip)) {
      return reply.status(429).send({ error: { code: 'RATE_LIMITED', message: 'Too many runs. Try again in a minute.' } });
    }

    const externalId = request.params.externalId;
    if (!validExternalId(externalId)) return reply.status(400).send({ error: { code: 'INVALID_ID', message: 'Invalid agent externalId' } });

    // Org resolves via Clerk OR the secret-gated demo session (Acme only).
    const org = await getOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in to run agents' } });

    // Demo session (no Clerk user): enforce the per-day run cap on top of the
    // IP rate limit, so a shared demo link can't run up real AI spend.
    const isDemo = !auth.userId;
    if (isDemo) {
      const capRows = (await db.execute(sql`
        SELECT count(*)::int AS c FROM agent_runs
        WHERE org_id = ${org.id} AND created_at > now() - interval '24 hours'
      `)).rows as { c: number }[];
      if ((capRows[0]?.c ?? 0) >= DEMO_RUN_DAILY_CAP) {
        return reply.status(429).send({ error: { code: 'DEMO_RUN_LIMIT', message: 'Demo run limit reached for today. Sign up to run more.' } });
      }
    }

    const bodySchema = z.object({
      prompt: z.string().max(4000).optional(),
      sopId: z.string().max(200).optional(),
      sopTitle: z.string().max(300).optional(),
    });
    const body = bodySchema.safeParse(request.body || {});
    if (!body.success) return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Invalid run request' } });

    // SOP run path: resolve the SOP from the chart graph server-side.
    let sop: RunAgentSop | null = null;
    if (body.data.sopId || body.data.sopTitle) {
      const graph = await getOrgTeamGraph(org.id, org.name || 'Organization');
      const node = graph.nodes.find(n => n.externalId === externalId && n.type === 'agent');
      if (!node) return reply.status(404).send({ error: { code: 'AGENT_NOT_FOUND', message: 'No such agent on this org chart' } });

      sop = resolveSopFromNode((node.properties as any)?.sops, { sopId: body.data.sopId, sopTitle: body.data.sopTitle });
      if (!sop) return reply.status(404).send({ error: { code: 'SOP_NOT_FOUND', message: 'No matching SOP on this agent' } });
    }

    const runOpts = {
      orgId: org.id,
      externalId,
      promptOverride: sop ? null : (body.data.prompt || null),
      sop,
      triggeredByUserId: auth.userId || null,
      trigger: 'manual' as const,
    };

    // --- Content negotiation. If the client asked for SSE, stream the run live
    // (fixes the ~30s single-request gateway 502 + lets the UI watch the agent
    // type). Otherwise keep the original JSON behavior (back-compat for API
    // callers + existing tests). ALL pre-checks above (rate limit, org/demo,
    // demo cap, body parse, SOP resolution) have already run, so any failure so
    // far returned a normal JSON error -- nothing fails mid-stream.
    if (wantsEventStream(request.headers.accept)) {
      // One last pre-check BEFORE hijacking: if the key is missing, the run will
      // fail instantly anyway -- surface it as a clean JSON 503, not mid-stream.
      if (!process.env.ANTHROPIC_API_KEY) {
        return reply.status(503).send({ error: { code: 'NOT_CONFIGURED', message: 'Agent runtime is not configured yet.' } });
      }

      // Take over the raw socket: from here Fastify must not touch the reply.
      reply.hijack();
      const raw = reply.raw;
      raw.writeHead(200, {
        'content-type': 'text/event-stream',
        'cache-control': 'no-cache',
        connection: 'keep-alive',
      });

      let clientGone = false;
      request.raw.on('close', () => { clientGone = true; });

      try {
        const result = await runAgentStream(runOpts, (t) => {
          if (!clientGone) sseWrite(raw, { t });
        });
        if (!clientGone) {
          // Final event carries the terminal status + the nice rendered HTML so
          // the client can swap the live transcript for the formatted document.
          sseWrite(raw, {
            done: true,
            runId: result.runId,
            status: result.status,
            error: result.error,
            tokensInput: result.tokensInput,
            tokensOutput: result.tokensOutput,
            costCents: result.costCents ?? null,
            model: result.model,
            startedAt: result.startedAt,
            completedAt: result.completedAt,
            sopTitle: result.sopTitle ?? null,
            outputHtml: renderAgentMarkdown(result.output || ''),
          });
        }
      } catch (err) {
        request.log.error({ err }, 'agent run stream failed');
        if (!clientGone) sseWrite(raw, { error: 'Something went wrong. Please try again.' });
      } finally {
        try { raw.end(); } catch { /* socket already closed */ }
      }
      return;
    }

    // Non-stream JSON path (unchanged): run, then render the agent's markdown
    // output to server-SANITIZED HTML so the client can innerHTML it directly
    // (renderAgentMarkdown is the XSS chokepoint).
    const result = await runAgent(runOpts);
    return reply.send({ ...result, outputHtml: renderAgentMarkdown(result.output || '') });
  });

  // GET /api/v1/agents/:externalId/runs?limit=25
  app.get<{ Params: { externalId: string }; Querystring: { limit?: string } }>('/agents/:externalId/runs', async (request, reply) => {
    const externalId = request.params.externalId;
    if (!validExternalId(externalId)) return reply.status(400).send({ error: { code: 'INVALID_ID', message: 'Invalid agent externalId' } });

    // Org resolves via Clerk OR the secret-gated demo session (Acme only).
    const org = await getOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in' } });

    const limit = Math.min(100, Math.max(1, parseInt(request.query.limit || '25', 10) || 25));
    const rows = await listAgentRuns(org.id, externalId, limit);
    // Attach server-SANITIZED HTML per row so the client renders each run's
    // output as a document, never as raw markdown source (renderAgentMarkdown
    // is the XSS chokepoint -- outputHtml is safe to innerHTML on the client).
    const runs = rows.map((r: any) => ({ ...r, outputHtml: renderAgentMarkdown(typeof r?.output === 'string' ? r.output : '') }));
    return reply.send({ runs });
  });
}
