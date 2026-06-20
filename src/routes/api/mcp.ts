/**
 * Remote MCP HTTP endpoint -- two ways to authenticate, same transport:
 *
 *   POST /api/mcp           Phase 2 (OAuth): Authorization: Bearer <token>.
 *                           No/invalid token -> 401 + WWW-Authenticate so the
 *                           client discovers the OAuth flow (.well-known) and
 *                           connects with a one-click login. Token is minted at
 *                           /oauth/token and is an api_keys row (kind='mcp').
 *   POST /api/mcp/:token    Phase 1: the token rides in the URL path (for the
 *                           Anthropic connector dialog, which has no header field).
 *
 * Both resolve the token -> org, enforce the paid + Labs gate, then serve a
 * stateless StreamableHTTPServerTransport with the 38 OTP tools bound to that
 * org. Org isolation comes only from the validated token; tool args never choose
 * the org.
 */
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { resolveTokenString } from '../../middleware/api-key-auth.js';
import { checkMcpRemoteAccess } from '../../services/mcp-gate.js';
import { registerOtpTools, makeOtpFetch } from '../../mcp/otp-tools.js';

const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || 'https://orgtp.com';
const LOOPBACK_BASE_URL = `http://127.0.0.1:${process.env.PORT || 3000}`;
const RESOURCE_METADATA = `${PUBLIC_BASE_URL}/.well-known/oauth-protected-resource`;

function jsonRpcError(code: number, message: string) {
  return { jsonrpc: '2.0', error: { code, message }, id: null };
}

/** Build a per-request MCP server bound to this org's token and serve the request. */
async function serveMcp(app: FastifyInstance, request: FastifyRequest, reply: FastifyReply, token: string) {
  const server = new McpServer({ name: 'otp', version: '0.3.0' });
  registerOtpTools(server, {
    otpFetch: makeOtpFetch({ baseUrl: LOOPBACK_BASE_URL, apiKey: token }),
    OTP_API_KEY: token, // truthy -> write tools unlocked (scope still enforced by /api/v1)
    OTP_BASE_URL: PUBLIC_BASE_URL,
  });

  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  reply.hijack();
  reply.raw.on('close', () => {
    transport.close().catch(() => {});
    server.close().catch(() => {});
  });
  try {
    await server.connect(transport);
    await transport.handleRequest(request.raw, reply.raw, request.body);
  } catch (err) {
    app.log.error({ err }, 'MCP request failed');
    if (!reply.raw.headersSent) {
      reply.raw.writeHead(500, { 'Content-Type': 'application/json' });
      reply.raw.end(JSON.stringify(jsonRpcError(-32603, 'Internal MCP error.')));
    }
  }
}

/** Resolve token -> gate -> serve. `wwwAuth` emits the OAuth discovery hint on 401. */
async function authorizeAndServe(
  app: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply,
  token: string | undefined,
  wwwAuth: boolean
) {
  const ctx = await resolveTokenString(token);
  if (!ctx) {
    if (wwwAuth) {
      reply.header('WWW-Authenticate', `Bearer resource_metadata="${RESOURCE_METADATA}"`);
    }
    return reply.status(401).send(jsonRpcError(-32001, 'Authentication required.'));
  }
  const access = await checkMcpRemoteAccess(ctx.orgId);
  if (!access.allowed) {
    const message =
      access.reason === 'not_paid'
        ? 'Remote MCP requires a paid OTP plan.'
        : 'Remote MCP is off for this organization. Enable it in Labs at ' + PUBLIC_BASE_URL + '/settings/labs';
    return reply.status(403).send(jsonRpcError(-32002, message));
  }
  return serveMcp(app, request, reply, token as string);
}

export default async function mcpRoutes(app: FastifyInstance) {
  const methodNotAllowed = async (_req: FastifyRequest, reply: FastifyReply) => {
    reply.status(405).header('Allow', 'POST').send(jsonRpcError(-32000, 'Method not allowed. This MCP endpoint is stateless; use POST.'));
  };

  // Phase 2 -- OAuth bearer (token-less URL). 401 here triggers OAuth discovery.
  app.post('/mcp', async (request, reply) => {
    const authHeader = request.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    return authorizeAndServe(app, request, reply, token, true);
  });
  app.get('/mcp', methodNotAllowed);
  app.delete('/mcp', methodNotAllowed);

  // Phase 1 -- token in the URL path.
  app.get('/mcp/:token', methodNotAllowed);
  app.delete('/mcp/:token', methodNotAllowed);
  app.post<{ Params: { token: string } }>('/mcp/:token', async (request, reply) => {
    return authorizeAndServe(app, request, reply, request.params.token, false);
  });
}
