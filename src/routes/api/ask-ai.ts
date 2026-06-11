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
import type { FastifyInstance } from 'fastify';
import Anthropic from '@anthropic-ai/sdk';
import { getAuthOrg } from '../../middleware/auth-helpers.js';
import { createRateLimiter } from '../../shared/rate-limiter.js';
import { askAiRequestSchema, buildSystemPrompt } from '../../shared/ask-ai.js';
import { ASK_AI_CORPUS } from '../../data/ask-ai-corpus.js';

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

function sseWrite(raw: NodeJS.WritableStream, payload: unknown) {
  raw.write(`data: ${JSON.stringify(payload)}\n\n`);
}

export default async function askAiRoutes(app: FastifyInstance) {
  app.post('/ask-ai', async (request, reply) => {
    if (!checkRateLimit(request.ip)) {
      return reply.status(429).send({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } });
    }
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const parsed = askAiRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: { code: 'INVALID_REQUEST', message: parsed.error.issues[0]?.message || 'Invalid request body' },
      });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return reply.status(503).send({ error: { code: 'NOT_CONFIGURED', message: "Ask AI isn't configured yet." } });
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
      const stream = getClient().messages.stream({
        model: process.env.ASK_AI_MODEL || 'claude-opus-4-8',
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
