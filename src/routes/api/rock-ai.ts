// Rock AI assist v1 -- the PAID SMART Rock builder upsell (monetization Phase 3).
//   POST /api/v1/rocks/:id/ai/draft      body {sentence, context?}
//   POST /api/v1/rocks/:id/ai/critique
//
// Billing is platform-key only, via token-metering.ts (the shared 2x platform
// multiplier). Every call: resolve the AI key/source -> wallet pre-check ONLY
// when shouldMeterPlatform(source) (BYOK / metering-off skip it, never blocked)
// -> Claude (non-streaming structured JSON) -> validate -> debit via
// debitPlatformTokens (no-ops for BYOK; idempotent on a deterministic per-request
// key). Mirrors ask-ai.ts's lazy client, NOT_CONFIGURED 503, rate limiter, and
// "user-already-served => still return on debit failure" philosophy. Org-scoped
// to the rock exactly like rocks.ts (eq(organizationId) + 404), role-gated for
// edit via gateReadOnlyRole.
//
// LAUNCH GATE: this whole feature ships OFF (coming soon). aiRockAssistLive()
// reads AI_ROCK_ASSIST_LIVE; when falsy BOTH endpoints refuse with COMING_SOON
// (the backend is gated, not just the UI) and the UI shows a "coming soon"
// panel. Flip the env to truthy to go live.
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { eq, and, isNull } from 'drizzle-orm';
import Anthropic from '@anthropic-ai/sdk';
import { db } from '../../config/database.js';
import { rocks } from '../../db/schema.js';
import { getAuthOrg, gateReadOnlyRole } from '../../middleware/auth-helpers.js';
import { requireUuidParam } from '../../shared/param-validation.js';
import { createRateLimiter } from '../../shared/rate-limiter.js';
import { resolveAiKey } from '../../services/org-ai-keys.js';
import {
  shouldMeterPlatform,
  platformPrecheck,
  debitPlatformTokens,
} from '../../services/token-metering.js';
import {
  rockAiDraftRequestSchema,
  buildDraftSystemPrompt,
  buildCritiqueSystemPrompt,
  buildDraftUserMessage,
  buildCritiqueUserMessage,
  rockAiDraftResponseSchema,
  rockAiCritiqueResponseSchema,
  extractJson,
  type RockAiDraftResponse,
  type RockAiCritiqueResponse,
} from '../../shared/rock-ai.js';

// ---------------------------------------------------------------------------
// LAUNCH GATE. Default OFF = "coming soon". Exported so it's unit-testable
// (mirrors ask-ai.ts meteringEnabled()). Truthy values flip the feature live.
// ---------------------------------------------------------------------------
export function aiRockAssistLive(): boolean {
  const v = process.env.AI_ROCK_ASSIST_LIVE;
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
}

// Structured JSON, not a chat stream: bounded output.
const MAX_TOKENS = 2000;

const checkRateLimit = createRateLimiter({ windowMs: 60_000, maxRequests: 15 });

// Built once -- byte-identical across requests (prompt-cache prefixes).
const DRAFT_SYSTEM_PROMPT = buildDraftSystemPrompt();
const CRITIQUE_SYSTEM_PROMPT = buildCritiqueSystemPrompt();

// The Anthropic client is built PER-REQUEST from the org's resolved BYOK key
// (resolveAiKey, threaded into runStructured). When the org has no org/portfolio
// key, resolveAiKey returns the platform ANTHROPIC_API_KEY, so behavior is
// identical to the old env-only singleton. Mirrors ask-ai.ts.

function model(): string {
  return process.env.ASK_AI_MODEL || 'claude-opus-4-8';
}

// Loose shape for the Anthropic message response usage block.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Usage = any;

/** Pull the concatenated text out of a non-streaming Messages response. */
function textOf(message: { content?: Array<{ type: string; text?: string }> }): string {
  if (!message || !Array.isArray(message.content)) return '';
  return message.content
    .filter((b) => b.type === 'text' && typeof b.text === 'string')
    .map((b) => b.text as string)
    .join('');
}

// The shared front-of-handler gates: launch gate, API key, auth, rock load +
// org-scope, role gate. Returns the loaded rock (and the resolved org id) or
// null after having sent the reply.
async function gateAndLoadRock(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<{ org: { id: string }; rock: typeof rocks.$inferSelect } | null> {
  if (!checkRateLimit(request.ip)) {
    reply.status(429).send({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } });
    return null;
  }

  // 1. Launch gate -- backend refuses pre-launch (not just the UI).
  if (!aiRockAssistLive()) {
    reply.status(503).send({ error: { code: 'COMING_SOON', message: 'AI Rock assist is coming soon.' } });
    return null;
  }

  // 2. Not configured (no API key) -- mirror ask-ai.ts.
  if (!process.env.ANTHROPIC_API_KEY) {
    reply.status(503).send({ error: { code: 'NOT_CONFIGURED', message: "AI Rock assist isn't configured yet." } });
    return null;
  }

  const id = requireUuidParam(request, reply);
  if (!id) return null;

  const org = await getAuthOrg(request);
  if (!org) {
    reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    return null;
  }

  // Role gate: read-only roles (observer/inactive/free) may not use the edit
  // tool. Same chokepoint rocks.ts uses for writes.
  if (!(await gateReadOnlyRole(request, reply))) return null;

  // Org-scope the rock exactly like rocks.ts (404 on miss -- never leaks
  // another tenant's uuid).
  const [rock] = await db
    .select()
    .from(rocks)
    .where(and(eq(rocks.id, id), eq(rocks.organizationId, org.id), isNull(rocks.deletedAt)))
    .limit(1);
  if (!rock) {
    reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Rock not found' } });
    return null;
  }

  return { org, rock };
}

// Wallet pre-check. Runs ONLY for platform-metered calls (shouldMeterPlatform):
// BYOK orgs (source 'org'/'portfolio') and metering-off draw on their own key
// and are NEVER blocked here. Returns true to proceed, false after having sent
// the 503 INSUFFICIENT_BALANCE reply.
async function checkBalance(orgId: string, source: string, reply: FastifyReply): Promise<boolean> {
  if (!shouldMeterPlatform(source)) return true;
  const { ok } = await platformPrecheck(orgId);
  if (!ok) {
    reply.status(503).send({ error: { code: 'INSUFFICIENT_BALANCE', message: 'Add credits to use AI assist.' } });
    return false;
  }
  return true;
}

// Call Claude non-streaming, parse + validate against the given zod schema,
// retry ONCE on invalid JSON, then give up. Returns { value, usage } on success
// or null on bad output (caller 502s). The usage from the LAST call is always
// returned for billing even when the parsed value is good.
async function runStructured<T>(args: {
  client: Anthropic;
  system: string;
  userMessage: string;
  parse: (v: unknown) => { success: true; data: T } | { success: false };
  log: FastifyRequest['log'];
}): Promise<{ value: T; usage: Usage } | { value: null; usage: Usage }> {
  let lastUsage: Usage = {};
  for (let attempt = 0; attempt < 2; attempt++) {
    const message = await args.client.messages.create({
      model: model(),
      max_tokens: MAX_TOKENS,
      thinking: { type: 'adaptive' },
      system: [{ type: 'text', text: args.system, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: args.userMessage }],
    });
    lastUsage = message.usage;
    const parsed = args.parse(extractJson(textOf(message)));
    if (parsed.success) return { value: parsed.data, usage: lastUsage };
    args.log.warn({ attempt }, 'rock-ai: model returned invalid JSON, retrying');
  }
  return { value: null, usage: lastUsage };
}

// Debit the wallet for PLATFORM-key usage from REAL token counts. Routes through
// debitPlatformTokens, which no-ops for BYOK (source 'org'/'portfolio') and for
// metering-off, and bills at the standard 2x platform multiplier otherwise.
//
// IDEMPOTENCY: the key is DETERMINISTIC per request+operation --
// `rock-ai_${feature}_${requestId}` -- so a client retry of the SAME request
// can't double-charge. The two operations (draft vs critique) carry distinct
// `feature` values, so their keys never collide within one request.
//
// On a debit failure AFTER a successful AI call we never throw (debitPlatformTokens
// swallows + logs internally) -- the user was already served. Returns the cents
// debited (0 when not metered) so the response can echo costCents.
async function debitForUsage(
  orgId: string,
  source: string,
  usage: Usage,
  feature: 'rock-ai-draft' | 'rock-ai-critique',
  idempotencyKey: string,
): Promise<number> {
  const { cents } = await debitPlatformTokens({
    orgId,
    source,
    model: model(),
    inputTokens: Number(usage?.input_tokens) || 0,
    outputTokens: Number(usage?.output_tokens) || 0,
    cacheReadTokens: Number(usage?.cache_read_input_tokens) || 0,
    cacheWriteTokens: Number(usage?.cache_creation_input_tokens) || 0,
    idempotencyKey,
    feature,
  });
  return cents ?? 0;
}

// Map an Anthropic SDK error to a safe status + body. Mirrors ask-ai's branch.
function sendAiError(reply: FastifyReply, err: unknown, log: FastifyRequest['log']) {
  log.error({ err }, 'rock-ai Claude call failed');
  if (err instanceof Anthropic.AuthenticationError) {
    return reply.status(503).send({ error: { code: 'NOT_CONFIGURED', message: "AI Rock assist isn't configured correctly." } });
  }
  if (err instanceof Anthropic.RateLimitError) {
    return reply.status(503).send({ error: { code: 'AI_BUSY', message: 'AI assist is busy right now. Please try again in a moment.' } });
  }
  if (err instanceof Anthropic.APIError && err.status === 529) {
    return reply.status(503).send({ error: { code: 'AI_BUSY', message: 'AI assist is busy right now. Please try again in a moment.' } });
  }
  return reply.status(502).send({ error: { code: 'AI_ERROR', message: 'AI assist failed. Please try again.' } });
}

export default async function rockAiRoutes(app: FastifyInstance) {
  // POST /api/v1/rocks/:id/ai/draft -- one-sentence goal -> full SMART Rock.
  app.post<{ Params: { id: string } }>('/rocks/:id/ai/draft', async (request, reply) => {
    const loaded = await gateAndLoadRock(request, reply);
    if (!loaded) return;

    const parsedReq = rockAiDraftRequestSchema.safeParse(request.body);
    if (!parsedReq.success) {
      return reply.status(400).send({
        error: { code: 'INVALID_REQUEST', message: parsedReq.error.issues[0]?.message || 'Invalid request body' },
      });
    }

    // Resolve the org's BYOK key (falls back to the platform key) per request,
    // BEFORE the balance pre-check: only platform-key usage is metered/blocked.
    const ai = await resolveAiKey(loaded.org.id);
    const client = new Anthropic({ apiKey: ai.key });

    if (!(await checkBalance(loaded.org.id, ai.source, reply))) return;

    let out: { value: RockAiDraftResponse | null; usage: Usage };
    try {
      out = await runStructured<RockAiDraftResponse>({
        client,
        system: DRAFT_SYSTEM_PROMPT,
        userMessage: buildDraftUserMessage(parsedReq.data),
        parse: (v) => rockAiDraftResponseSchema.safeParse(v) as { success: true; data: RockAiDraftResponse } | { success: false },
        log: request.log,
      });
    } catch (err) {
      return sendAiError(reply, err, request.log);
    }

    // Debit from REAL usage regardless of parse outcome (the tokens were spent).
    // Deterministic idempotency key: stable across retries of THIS request.
    const costCents = await debitForUsage(
      loaded.org.id,
      ai.source,
      out.usage,
      'rock-ai-draft',
      `rock-ai_rock-ai-draft_${request.id}`,
    );

    if (!out.value) {
      return reply.status(502).send({ error: { code: 'AI_BAD_OUTPUT', message: 'AI returned an unreadable draft. Please try again.' } });
    }

    // Does NOT auto-save: the UI fills the form; the user reviews + saves via
    // the existing PUT /rocks/:id.
    return reply.send({ draft: out.value, costCents });
  });

  // POST /api/v1/rocks/:id/ai/critique -- critique the stored Rock field by field.
  app.post<{ Params: { id: string } }>('/rocks/:id/ai/critique', async (request, reply) => {
    const loaded = await gateAndLoadRock(request, reply);
    if (!loaded) return;

    // Resolve the org's BYOK key (falls back to the platform key) per request,
    // BEFORE the balance pre-check: only platform-key usage is metered/blocked.
    const ai = await resolveAiKey(loaded.org.id);
    const client = new Anthropic({ apiKey: ai.key });

    if (!(await checkBalance(loaded.org.id, ai.source, reply))) return;

    const userMessage = buildCritiqueUserMessage({
      description: loaded.rock.description,
      // smartData is the persisted jsonb slice; shape matches smartDataSchema.
      smartData: loaded.rock.smartData as Parameters<typeof buildCritiqueUserMessage>[0]['smartData'],
    });

    let out: { value: RockAiCritiqueResponse | null; usage: Usage };
    try {
      out = await runStructured<RockAiCritiqueResponse>({
        client,
        system: CRITIQUE_SYSTEM_PROMPT,
        userMessage,
        parse: (v) => rockAiCritiqueResponseSchema.safeParse(v) as { success: true; data: RockAiCritiqueResponse } | { success: false },
        log: request.log,
      });
    } catch (err) {
      return sendAiError(reply, err, request.log);
    }

    // Deterministic idempotency key: stable across retries of THIS request,
    // distinct from the draft op via the feature segment.
    const costCents = await debitForUsage(
      loaded.org.id,
      ai.source,
      out.usage,
      'rock-ai-critique',
      `rock-ai_rock-ai-critique_${request.id}`,
    );

    if (!out.value) {
      return reply.status(502).send({ error: { code: 'AI_BAD_OUTPUT', message: 'AI returned an unreadable critique. Please try again.' } });
    }

    return reply.send({ critique: out.value, costCents });
  });
}
