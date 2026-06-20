/**
 * OAuth 2.1 authorization server for Remote MCP (Phase 2).
 *
 * Endpoints (registered at root, AFTER the Clerk plugin so /authorize can read
 * the session). Wildcard CORS is applied via onSend so MCP clients can fetch the
 * discovery + token endpoints cross-origin.
 *
 *   GET  /.well-known/oauth-protected-resource   RFC 9728 resource metadata
 *   GET  /.well-known/oauth-authorization-server RFC 8414 AS metadata
 *   POST /oauth/register                         RFC 7591 dynamic client registration
 *   GET  /oauth/authorize                        login bounce -> org pick + consent
 *   POST /oauth/consent                          issue auth code, redirect back
 *   POST /oauth/token                            code + PKCE -> long-lived token
 *
 * Same gate as Phase 1: only orgs with a paid plan AND the mcp_remote Labs opt-in
 * can be connected. The access token is an api_keys row (kind='mcp').
 */
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getAuth } from '@clerk/fastify';
import { inArray } from 'drizzle-orm';
import { db } from '../config/database.js';
import { organizations } from '../db/schema.js';
import { getOrgsForUser } from '../services/membership.js';
import { checkMcpRemoteAccess } from '../services/mcp-gate.js';
import {
  registerClient,
  getClient,
  redirectUriAllowed,
  issueAuthCode,
  consumeAuthCode,
  issueMcpAccessToken,
  OauthError,
} from '../services/oauth.js';

const BASE = (process.env.PUBLIC_BASE_URL || 'https://orgtp.com').replace(/\/$/, '');
const MCP_RESOURCE = `${BASE}/api/mcp`;

function esc(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Append query params to a redirect_uri, preserving any it already has. */
function redirectWith(redirectUri: string, params: Record<string, string>): string {
  const u = new URL(redirectUri);
  for (const [k, v] of Object.entries(params)) if (v != null) u.searchParams.set(k, v);
  return u.toString();
}

function consentPage(opts: {
  clientName: string;
  hidden: Record<string, string>;
  eligible: { id: string; name: string }[];
  ineligibleCount: number;
}): string {
  const hiddenInputs = Object.entries(opts.hidden)
    .map(([k, v]) => `<input type="hidden" name="${esc(k)}" value="${esc(v)}">`)
    .join('\n        ');
  const orgOptions = opts.eligible
    .map(
      (o, i) =>
        `<label class="org"><input type="radio" name="org_id" value="${esc(o.id)}"${i === 0 ? ' checked' : ''}> <span>${esc(o.name)}</span></label>`
    )
    .join('\n          ');

  const body = opts.eligible.length
    ? `<form method="POST" action="/oauth/consent">
        ${hiddenInputs}
        <p class="lead"><strong>${esc(opts.clientName)}</strong> wants to connect to your OrgTP organization and act with your access (read and write your chart, scorecard, rocks, to-dos, and coordination graph).</p>
        <p class="pick">Connect this organization:</p>
        <div class="orgs">
          ${orgOptions}
        </div>
        <div class="actions">
          <button class="primary" name="decision" value="allow" type="submit">Authorize</button>
          <button class="ghost" name="decision" value="deny" type="submit">Cancel</button>
        </div>
      </form>`
    : `<p class="lead"><strong>${esc(opts.clientName)}</strong> wants to connect to OrgTP, but none of your organizations are eligible yet.</p>
       <p class="note">Remote MCP is a paid feature in early access. Turn on <em>Remote MCP connection</em> under Settings &rarr; Labs and make sure the organization is on a paid plan, then try connecting again.</p>
       <div class="actions"><a class="ghost" href="/settings/labs">Open Labs</a></div>`;

  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Connect to OrgTP</title>
<style>
  :root{--bg:#F5F7FA;--ink:#14271a;--mute:#5b6b60;--line:rgba(20,39,26,.12);--blue:#2563EB;--blue-deep:#1d4ed8}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.6 Inter,system-ui,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px}
  .card{background:#fff;border:1px solid var(--line);border-radius:16px;box-shadow:0 1px 2px rgba(20,39,26,.04);max-width:460px;width:100%;padding:28px}
  h1{font-size:18px;font-weight:800;margin:0 0 4px}
  .eyebrow{font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--mute);margin-bottom:14px}
  .lead{margin:0 0 16px} .pick{font-weight:600;margin:0 0 8px} .note{color:var(--mute)}
  .orgs{display:flex;flex-direction:column;gap:8px;margin-bottom:20px}
  .org{display:flex;align-items:center;gap:10px;border:1px solid var(--line);border-radius:10px;padding:12px 14px;cursor:pointer}
  .org input{accent-color:var(--blue)}
  .actions{display:flex;gap:10px;align-items:center}
  button,a.ghost{font:inherit;font-weight:600;border-radius:10px;padding:10px 18px;cursor:pointer;border:1px solid transparent;text-decoration:none}
  .primary{background:var(--blue);color:#fff} .primary:hover{background:var(--blue-deep)}
  .ghost{background:#fff;border-color:var(--line);color:var(--ink)}
</style></head>
<body><div class="card">
  <div class="eyebrow">OrgTP &middot; Connect an app</div>
  <h1>Authorize connection</h1>
  ${body}
</div></body></html>`;
}

export default async function oauthRoutes(app: FastifyInstance) {
  // Wildcard CORS for the discovery + token endpoints (fetched cross-origin by
  // MCP clients). Encapsulated to this router only.
  app.addHook('onSend', async (_req: FastifyRequest, reply: FastifyReply, payload) => {
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    reply.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    return payload;
  });

  // ---- Discovery ----------------------------------------------------------

  app.get('/.well-known/oauth-protected-resource', async (_req, reply) => {
    return reply.type('application/json').send({
      resource: MCP_RESOURCE,
      authorization_servers: [BASE],
      bearer_methods_supported: ['header'],
    });
  });

  app.get('/.well-known/oauth-authorization-server', async (_req, reply) => {
    return reply.type('application/json').send({
      issuer: BASE,
      authorization_endpoint: `${BASE}/oauth/authorize`,
      token_endpoint: `${BASE}/oauth/token`,
      registration_endpoint: `${BASE}/oauth/register`,
      response_types_supported: ['code'],
      grant_types_supported: ['authorization_code'],
      code_challenge_methods_supported: ['S256'],
      token_endpoint_auth_methods_supported: ['none'],
      scopes_supported: ['read', 'write'],
    });
  });

  // ---- Dynamic Client Registration (RFC 7591) -----------------------------

  app.post('/oauth/register', async (request, reply) => {
    const body = (request.body || {}) as any;
    const redirectUris: unknown = body.redirect_uris;
    if (!Array.isArray(redirectUris) || redirectUris.length === 0 || !redirectUris.every((u) => typeof u === 'string')) {
      return reply.status(400).send({ error: 'invalid_redirect_uri', error_description: 'redirect_uris (array) is required.' });
    }
    const client = await registerClient({
      clientName: typeof body.client_name === 'string' ? body.client_name : null,
      redirectUris: redirectUris as string[],
      grantTypes: Array.isArray(body.grant_types) ? body.grant_types : ['authorization_code'],
    });
    return reply.status(201).send({
      client_id: client.clientId,
      client_name: client.clientName || undefined,
      redirect_uris: client.redirectUris,
      grant_types: client.grantTypes,
      token_endpoint_auth_method: 'none',
    });
  });

  // ---- Authorization endpoint --------------------------------------------

  app.get('/oauth/authorize', async (request, reply) => {
    const q = request.query as Record<string, string>;
    const clientId = q.client_id || '';
    const redirectUri = q.redirect_uri || '';
    const client = await getClient(clientId);

    // If the client or redirect_uri is invalid we must NOT redirect (open-redirect
    // / spoofing guard) -- render an error instead.
    if (!client || !redirectUriAllowed(client, redirectUri)) {
      return reply.status(400).type('text/html').send(
        `<!doctype html><meta charset="utf-8"><body style="font:15px Inter,system-ui;padding:40px;color:#14271a">Invalid <code>client_id</code> or <code>redirect_uri</code>. Re-register this connection and try again.</body>`
      );
    }

    // From here, errors redirect back to the client with an error code.
    if (q.response_type !== 'code') {
      return reply.redirect(redirectWith(redirectUri, { error: 'unsupported_response_type', state: q.state }));
    }
    if (!q.code_challenge || (q.code_challenge_method || 'S256') !== 'S256') {
      return reply.redirect(redirectWith(redirectUri, { error: 'invalid_request', error_description: 'PKCE S256 required', state: q.state }));
    }

    // Require a logged-in OrgTP user; bounce through sign-in and come back here.
    const auth = getAuth(request);
    if (!auth.userId) {
      return reply.redirect('/sign-in?redirect=' + encodeURIComponent(request.url));
    }

    // Which of the user's orgs are eligible (paid + Labs on)?
    const memberships = await getOrgsForUser(auth.userId);
    const eligible: { id: string; name: string }[] = [];
    if (memberships.length) {
      const ids = memberships.map((m) => m.orgId);
      const names = await db.select({ id: organizations.id, name: organizations.name }).from(organizations).where(inArray(organizations.id, ids));
      const nameById = new Map(names.map((n) => [n.id, n.name]));
      for (const id of ids) {
        const access = await checkMcpRemoteAccess(id);
        if (access.allowed) eligible.push({ id, name: nameById.get(id) || 'Your organization' });
      }
    }

    return reply.type('text/html').send(
      consentPage({
        clientName: client.clientName || 'An MCP client',
        hidden: {
          client_id: clientId,
          redirect_uri: redirectUri,
          code_challenge: q.code_challenge,
          code_challenge_method: q.code_challenge_method || 'S256',
          state: q.state || '',
          scope: q.scope || '',
        },
        eligible,
        ineligibleCount: memberships.length - eligible.length,
      })
    );
  });

  app.post('/oauth/consent', async (request, reply) => {
    const b = (request.body || {}) as Record<string, string>;
    const auth = getAuth(request);
    if (!auth.userId) return reply.redirect('/sign-in?redirect=' + encodeURIComponent('/oauth/authorize'));

    const client = await getClient(b.client_id || '');
    if (!client || !redirectUriAllowed(client, b.redirect_uri || '')) {
      return reply.status(400).send('Invalid client or redirect_uri.');
    }
    if (b.decision !== 'allow') {
      return reply.redirect(redirectWith(b.redirect_uri, { error: 'access_denied', state: b.state }));
    }

    // The chosen org must belong to the user AND still pass the gate.
    const memberships = await getOrgsForUser(auth.userId);
    const orgId = b.org_id || '';
    if (!memberships.some((m) => m.orgId === orgId)) {
      return reply.redirect(redirectWith(b.redirect_uri, { error: 'access_denied', error_description: 'not a member of that org', state: b.state }));
    }
    const access = await checkMcpRemoteAccess(orgId);
    if (!access.allowed) {
      return reply.redirect(redirectWith(b.redirect_uri, { error: 'access_denied', error_description: 'org not eligible', state: b.state }));
    }

    const code = await issueAuthCode({
      clientId: client.clientId,
      orgId,
      userId: auth.userId,
      redirectUri: b.redirect_uri,
      scopes: ['read', 'write'],
      codeChallenge: b.code_challenge,
      codeChallengeMethod: b.code_challenge_method || 'S256',
      now: Date.now(),
    });
    return reply.redirect(redirectWith(b.redirect_uri, { code, state: b.state }));
  });

  // ---- Token endpoint -----------------------------------------------------

  app.post('/oauth/token', async (request, reply) => {
    const b = (request.body || {}) as Record<string, string>;
    if (b.grant_type !== 'authorization_code') {
      return reply.status(400).send({ error: 'unsupported_grant_type' });
    }
    try {
      const grant = await consumeAuthCode({
        code: b.code,
        clientId: b.client_id || '',
        redirectUri: b.redirect_uri || '',
        codeVerifier: b.code_verifier || '',
        now: Date.now(),
      });
      // Re-check the gate at exchange time (plan could have lapsed since /authorize).
      const access = await checkMcpRemoteAccess(grant.orgId);
      if (!access.allowed) {
        return reply.status(400).send({ error: 'invalid_grant', error_description: 'Organization is no longer eligible for Remote MCP.' });
      }
      const client = await getClient(b.client_id || '');
      const token = await issueMcpAccessToken({ orgId: grant.orgId, scopes: grant.scopes, clientName: client?.clientName || null });
      return reply.type('application/json').send({
        access_token: token,
        token_type: 'Bearer',
        scope: grant.scopes.join(' '),
      });
    } catch (err) {
      if (err instanceof OauthError) {
        return reply.status(400).send({ error: err.code, error_description: err.message });
      }
      app.log.error({ err }, 'oauth token exchange failed');
      return reply.status(500).send({ error: 'server_error' });
    }
  });
}
