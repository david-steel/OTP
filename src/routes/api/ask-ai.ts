// Ask AI v1 -- streaming product-help chat.
//   POST /api/v1/ask-ai  -> SSE stream of Claude text deltas
//
// v1 scope: answers about how to use OTP from a static corpus only. No org
// data, no tools. Auth follows the notifications.ts pattern (getAuthOrg ->
// 401 JSON error shape). The corpus + rules system prompt is byte-identical
// across requests and marked with cache_control so Anthropic prompt-caches
// the prefix.
//
// Wire format (SSE over reply.raw after reply.hijack()):
//   data: {"t":"<text delta>"}\n\n     -- repeated, one per text delta
//   data: {"done":true}\n\n            -- on successful completion
//   data: {"error":"<message>"}\n\n    -- on API failure, then end
import { randomUUID } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import Anthropic from '@anthropic-ai/sdk';
import { getAuthOrg } from '../../middleware/auth-helpers.js';
import { createRateLimiter } from '../../shared/rate-limiter.js';
import { askAiRequestSchema, buildSystemPrompt } from '../../shared/ask-ai.js';
import { ASK_AI_CORPUS } from '../../data/ask-ai-corpus.js';
import { resolveAiKey } from '../../services/org-ai-keys.js';
import { shouldMeterPlatform, platformPrecheck, debitPlatformTokens } from '../../services/token-metering.js';

// Wallet metering is OFF by default. When the env flag is falsy this whole
// feature is inert: zero behavior change to Ask AI (no balance check, no debit).
// Ask AI is FREE today -- do NOT flip this on without a product decision.
// Exported so the gate is unit-testable (proves OFF = no metering branch).
export function meteringEnabled(): boolean {
  const v = process.env.WALLET_METERING_ENABLED;
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
}

const checkRateLimit = createRateLimiter({ windowMs: 60_000, maxRequests: 20 });

// Built once -- must be byte-identical across requests (prompt cache prefix).
const SYSTEM_PROMPT = buildSystemPrompt(ASK_AI_CORPUS);

// The Anthropic client is built PER-REQUEST from the org's resolved BYOK key
// (resolveAiKey). When the org has no org/portfolio key, resolveAiKey returns
// the platform ANTHROPIC_API_KEY, so behavior is identical to the old env-only
// singleton. Constructing per request is cheap.

// Structural type for reply.raw -- avoids the NodeJS global namespace (which
// the lint env doesn't register under no-undef) while matching how we use it.
function sseWrite(raw: { write: (chunk: string) => unknown }, payload: unknown) {
  raw.write(`data: ${JSON.stringify(payload)}\n\n`);
}

export default async function askAiRoutes(app: FastifyInstance) {
  app.post('/ask-ai', async (request, reply) => {
    if (!checkRateLimit(request.ip)) {
      return reply.status(429).send({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } });
    }
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    // Stable per-request id used as the wallet-debit idempotency key (metering).
    const requestId = randomUUID();

    const parsed = askAiRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: { code: 'INVALID_REQUEST', message: parsed.error.issues[0]?.message || 'Invalid request body' },
      });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return reply.status(503).send({ error: { code: 'NOT_CONFIGURED', message: "Ask AI isn't configured yet." } });
    }

    // Resolve the org's AI key/source BEFORE any metering pre-check. BYOK orgs
    // (source 'org' / 'portfolio') use their own key and must NEVER be blocked
    // by the platform wallet -- only platform-key usage draws from the wallet.
    const ai = await resolveAiKey(org.id);

    // --- Wallet metering pre-check (GATED, platform-key only). Runs ONLY when
    // metering is on AND this call uses the platform key. For BYOK or
    // metering-off, this is skipped entirely (never blocks). Fail closed if the
    // org's balance is below the shared wallet floor.
    if (shouldMeterPlatform(ai.source)) {
      const { ok } = await platformPrecheck(org.id);
      if (!ok) {
        return reply.status(503).send({ error: { code: 'INSUFFICIENT_BALANCE', message: 'Add credits to use Ask AI.' } });
      }
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

    const model = process.env.ASK_AI_MODEL || 'claude-opus-4-8';
    try {
      // Build a per-request client from the already-resolved key (resolved
      // before the metering pre-check above).
      const client = new Anthropic({ apiKey: ai.key });
      const stream = client.messages.stream({
        model,
        max_tokens: 4000,
        thinking: { type: 'adaptive' },
        system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
        messages: parsed.data.messages,
      });

      request.raw.on('close', () => {
        try { stream.abort(); } catch { /* already done */ }
      });

      for await (const event of stream) {
        if (clientGone) break;
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          sseWrite(raw, { t: event.delta.text });
        }
      }
      if (!clientGone) sseWrite(raw, { done: true });

      // --- Platform-key token metering debit. After the stream completes, read
      // the real token usage and hand it to the centralized helper, which
      // debits the wallet at the 2x platform multiplier ONLY for platform-key
      // usage (BYOK / metering-off are no-ops inside the helper). Idempotency-
      // keyed per request so a retry can't double-charge. The helper never
      // throws on a normal debit failure -- the user already received their
      // answer -- so a metering bug can't lose a served response.
      try {
        const final = await stream.finalMessage();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const usage = (final?.usage || {}) as any;
        await debitPlatformTokens({
          orgId: org.id,
          source: ai.source,
          model,
          inputTokens: Number(usage.input_tokens) || 0,
          outputTokens: Number(usage.output_tokens) || 0,
          cacheReadTokens: Number(usage.cache_read_input_tokens) || 0,
          cacheWriteTokens: Number(usage.cache_creation_input_tokens) || 0,
          idempotencyKey: `ask-ai_${requestId}`,
          feature: 'ask_ai',
        });
      } catch (debitErr) {
        request.log.error({ err: debitErr, orgId: org.id }, 'ask-ai post-stream metering threw (user already served)');
      }
    } catch (err) {
      request.log.error({ err }, 'ask-ai stream failed');
      if (!clientGone) {
        let message = 'Something went wrong. Please try again.';
        if (err instanceof Anthropic.APIUserAbortError) {
          message = ''; // we aborted because the client disconnected; nothing to report
        } else if (err instanceof Anthropic.RateLimitError) {
          message = 'Ask AI is busy right now. Please try again in a moment.';
        } else if (err instanceof Anthropic.AuthenticationError) {
          message = "Ask AI isn't configured correctly. Please raise a ticket at /tickets.";
        } else if (err instanceof Anthropic.APIError && err.status === 529) {
          // overloaded_error -- 0.80.0 has no OverloadedError class
          message = 'Ask AI is busy right now. Please try again in a moment.';
        }
        if (message) sseWrite(raw, { error: message });
      }
    } finally {
      try { raw.end(); } catch { /* socket already closed */ }
    }
  });
}
