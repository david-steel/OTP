/**
 * Remote MCP HTTP endpoint -- /api/mcp/:token
 *
 * Lets any org connect OTP to Claude (desktop/web), Cursor, Windsurf, Cline, etc.
 * with a single hosted URL and no install. The Anthropic "Add custom connector"
 * dialog has no header field, so the connection token rides in the URL path.
 *
 * Per request:
 *   1. resolveMcpToken(:token)            -> { orgId, scopes, kind }  (401 if invalid)
 *   2. checkMcpRemoteAccess(orgId)        -> paid plan AND mcp_remote Labs opt-in (403)
 *   3. build a per-request McpServer with the 38 OTP tools, bound to an otpFetch
 *      that loops back to this server's /api/v1 carrying the org's token as Bearer
 *   4. hand the request to a stateless StreamableHTTPServerTransport
 *
 * Stateless: a fresh server + transport per request (sessionIdGenerator: undefined),
 * which is all our request/response tools need -- no server->client streaming.
 * Org isolation comes entirely from the validated token's orgId; tool arguments
 * never choose the org.
 */
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { resolveMcpToken } from '../../middleware/api-key-auth.js';
import { checkMcpRemoteAccess } from '../../services/mcp-gate.js';
import { registerOtpTools, makeOtpFetch } from '../../mcp/otp-tools.js';

const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || 'https://orgtp.com';
// otpFetch loops back to THIS server's REST API. Localhost avoids a public round
// trip and any egress/DNS hairpin; the org's token rides as the Bearer, so the
// existing /api/v1 auth + org-scoping enforce isolation exactly as for any key.
const LOOPBACK_BASE_URL = `http://127.0.0.1:${process.env.PORT || 3000}`;

function jsonRpcError(code: number, message: string) {
  return { jsonrpc: '2.0', error: { code, message }, id: null };
}

export default async function mcpRoutes(app: FastifyInstance) {
  // GET/DELETE are only meaningful for stateful (session) transports; we are
  // stateless, so the spec's "method not allowed" response is correct.
  const methodNotAllowed = async (_req: FastifyRequest, reply: FastifyReply) => {
    reply
      .status(405)
      .header('Allow', 'POST')
      .send(jsonRpcError(-32000, 'Method not allowed. This MCP endpoint is stateless; use POST.'));
  };
  app.get('/mcp/:token', methodNotAllowed);
  app.delete('/mcp/:token', methodNotAllowed);

  app.post<{ Params: { token: string } }>('/mcp/:token', async (request, reply) => {
    // 1. Authenticate the connection token (from the URL path).
    const ctx = await resolveMcpToken(request.params.token);
    if (!ctx) {
      return reply.status(401).send(jsonRpcError(-32001, 'Invalid or revoked MCP token.'));
    }

    // 2. Gate: paid plan AND mcp_remote Labs opt-in.
    const access = await checkMcpRemoteAccess(ctx.orgId);
    if (!access.allowed) {
      const message =
        access.reason === 'not_paid'
          ? 'Remote MCP requires a paid OTP plan. Upgrade at ' + PUBLIC_BASE_URL + '/settings/billing'
          : 'Remote MCP is off for this organization. Enable it in Labs at ' + PUBLIC_BASE_URL + '/settings/labs';
      return reply.status(403).send(jsonRpcError(-32002, message));
    }

    // 3. Build a per-request MCP server bound to THIS org's token.
    const server = new McpServer({ name: 'otp', version: '0.3.0' });
    registerOtpTools(server, {
      otpFetch: makeOtpFetch({ baseUrl: LOOPBACK_BASE_URL, apiKey: request.params.token }),
      OTP_API_KEY: request.params.token, // truthy -> write tools are unlocked (scope is still enforced by /api/v1)
      OTP_BASE_URL: PUBLIC_BASE_URL, // shareable links in tool output use the public host
    });

    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

    // Hand the raw response to the transport; Fastify must not also reply.
    reply.hijack();
    reply.raw.on('close', () => {
      transport.close().catch(() => {});
      server.close().catch(() => {});
    });

    try {
      await server.connect(transport);
      await transport.handleRequest(request.raw, reply.raw, request.body);
    } catch (err) {
      app.log.error({ err, orgId: ctx.orgId }, 'MCP request failed');
      if (!reply.raw.headersSent) {
        reply.raw.writeHead(500, { 'Content-Type': 'application/json' });
        reply.raw.end(JSON.stringify(jsonRpcError(-32603, 'Internal MCP error.')));
      }
    }
  });
}
