/**
 * composio.ts -- thin REST client for the Composio v3 API.
 *
 * Composio holds every customer's OAuth token in its own vault; OTP stores only
 * a reference (connection id) + status. The ONE platform API key lives in
 * COMPOSIO_API_KEY (env, Railway) -- same pattern as ANTHROPIC_API_KEY. Per-org
 * isolation is by `user_id` == OTP orgId.
 *
 * Endpoints + payload shapes were verified live on 2026-06-13:
 *   - POST /connected_accounts/link  {auth_config_id, user_id} -> {redirect_url, id}
 *     (NOTE: plain POST /connected_accounts is deprecated for managed/custom
 *      OAuth -- it errors with a suggested_fix pointing here.)
 *   - GET  /connected_accounts?user_ids=&auth_config_ids=  -> {items:[{id,status,...}]}
 *   - GET  /connected_accounts/:id   -> {status, ...}
 *   - DELETE /connected_accounts/:id -> {success:true}
 *
 * Read-only by construction: nothing here can write to a connected tool. Tool
 * EXECUTION (Inc 3) is a separate, metered path; this module only manages the
 * connection lifecycle.
 */

const BASE = 'https://backend.composio.dev/api/v3';

export class ComposioError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'ComposioError';
  }
}

/** Whether the platform Composio key is configured. Routes 503 when false. */
export function composioConfigured(env: Record<string, string | undefined> = process.env): boolean {
  return !!(env.COMPOSIO_API_KEY && env.COMPOSIO_API_KEY.trim());
}

function apiKey(): string {
  const k = (process.env.COMPOSIO_API_KEY || '').trim();
  if (!k) throw new ComposioError('Composio is not configured (COMPOSIO_API_KEY missing)', 503);
  return k;
}

async function call(method: string, path: string, body?: unknown): Promise<any> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'x-api-key': apiKey(),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* non-JSON error body */
  }
  if (!res.ok || json?.error) {
    const msg = json?.error?.message || json?.message || text || `Composio ${method} ${path} failed`;
    throw new ComposioError(String(msg).slice(0, 300), res.status);
  }
  return json;
}

export interface ConnectLink {
  connectionId: string | null;
  redirectUrl: string;
}

/**
 * Create a connection link for one org. Returns the OAuth consent URL the user
 * visits to approve, plus the pending connection id. The org connects through
 * the platform auth_config; the resulting token is vaulted by Composio under
 * `userId`.
 */
export async function createConnectLink(authConfigId: string, userId: string): Promise<ConnectLink> {
  const j = await call('POST', '/connected_accounts/link', { auth_config_id: authConfigId, user_id: userId });
  const redirectUrl = j?.redirect_url || j?.redirectUrl;
  if (!redirectUrl) throw new ComposioError('Composio did not return a redirect_url', 502);
  return { connectionId: j?.id || j?.connected_account_id || null, redirectUrl };
}

export interface ComposioConnection {
  id: string;
  status: string;
  toolkitSlug: string | null;
}

/** Look up the (single) connection for an org on a given auth_config. */
export async function findConnection(authConfigId: string, userId: string): Promise<ComposioConnection | null> {
  const qs = `?user_ids=${encodeURIComponent(userId)}&auth_config_ids=${encodeURIComponent(authConfigId)}&limit=1`;
  const j = await call('GET', `/connected_accounts${qs}`);
  const item = (j?.items || j?.data || [])[0];
  if (!item) return null;
  return { id: item.id, status: item.status, toolkitSlug: item.toolkit?.slug || item.toolkit || null };
}

/** Fetch one connection by id (for status polling). Null on 404. */
export async function getConnection(connectionId: string): Promise<ComposioConnection | null> {
  try {
    const j = await call('GET', `/connected_accounts/${encodeURIComponent(connectionId)}`);
    return { id: j.id || connectionId, status: j.status, toolkitSlug: j.toolkit?.slug || j.toolkit || null };
  } catch (e) {
    if (e instanceof ComposioError && e.status === 404) return null;
    throw e;
  }
}

/** Revoke/delete a connection in Composio. Idempotent: 404 is treated as done. */
export async function deleteConnection(connectionId: string): Promise<void> {
  try {
    await call('DELETE', `/connected_accounts/${encodeURIComponent(connectionId)}`);
  } catch (e) {
    if (e instanceof ComposioError && e.status === 404) return;
    throw e;
  }
}
