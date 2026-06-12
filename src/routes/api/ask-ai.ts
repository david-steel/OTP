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
import { getBalanceCents, debitWallet } from '../../services/wallet.js';
import { computeDebitCents, markupMultipleFromEnv } from '../../shared/ai-pricing.js';

// Wallet metering is OFF by default. When the env flag is falsy this whole
// feature is inert: zero behavior change to Ask AI (no balance check, no debit).
// Ask AI is FREE today -- do NOT flip this on without a product decision.
// Exported so the gate is unit-testable (proves OFF = no metering branch).
export function meteringEnabled(): boolean {
  const v = process.env.WALLET_METERING_ENABLED;
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
}

// Smallest balance we require before starting a metered stream. The real cost is
// debited from actual token counts after the stream; this is just a fail-closed
// floor so a near-empty wallet can't start a call it can't pay for.
const METERING_FLOOR_CENTS = 1;

const checkRateLimit = createRateLimiter({ windowMs: 60_000, maxRequests: 20 });

// Built once -- must be byte-identical across requests (prompt cache prefix).
const SYSTEM_PROMPT = buildSystemPrompt(ASK_AI_CORPUS);

// Module-level singleton, constructed lazily so booting without
// ANTHROPIC_API_KEY never throws (the route 503s instead).
let anthropicClient: Anthropic | null = null;
function getClient(): Anthropic {
  if (!anthropicClient) anthropicClient = new Anthropic(); // reads ANTHROPIC_API_KEY
  return anthropicClient;
}

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

    // --- Wallet metering pre-check (GATED). When disabled this block is a
    // no-op and Ask AI behaves exactly as before. When enabled, fail closed if
    // the org's balance is below the floor (mirrors the NOT_CONFIGURED shape).
    const metering = meteringEnabled();
    if (metering) {
      const balanceCents = await getBalanceCents(org.id);
      if (balanceCents < METERING_FLOOR_CENTS) {
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
      const stream = getClient().messages.stream({
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

      // --- Wallet metering debit (GATED). After the stream completes, read the
      // real token usage and debit the wallet from actual cost x markup. If the
      // debit fails we log loudly but do NOT crash the response -- the user
      // already received their answer. Idempotency-keyed per request so a retry
      // can't double-charge. No-op entirely when metering is disabled.
      if (metering) {
        try {
          const final = await stream.finalMessage();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const usage = (final?.usage || {}) as any;
          const debitCents = computeDebitCents(
            {
              model,
              inputTokens: Number(usage.input_tokens) || 0,
              outputTokens: Number(usage.output_tokens) || 0,
              cacheReadTokens: Number(usage.cache_read_input_tokens) || 0,
              cacheWriteTokens: Number(usage.cache_creation_input_tokens) || 0,
            },
            markupMultipleFromEnv(),
          );
          const result = await debitWallet(org.id, debitCents, 'ai_usage', {
            idempotencyKey: `ask-ai_${requestId}`,
            metadata: {
              model,
              inputTokens: Number(usage.input_tokens) || 0,
              outputTokens: Number(usage.output_tokens) || 0,
              cacheReadTokens: Number(usage.cache_read_input_tokens) || 0,
              cacheWriteTokens: Number(usage.cache_creation_input_tokens) || 0,
              feature: 'ask-ai',
            },
            createdBy: 'ask-ai',
          });
          if (!result.ok) {
            request.log.error({ orgId: org.id, debitCents, code: result.code }, 'ask-ai post-stream wallet debit failed (user already served)');
          }
        } catch (debitErr) {
          request.log.error({ err: debitErr, orgId: org.id }, 'ask-ai post-stream wallet debit threw (user already served)');
        }
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
