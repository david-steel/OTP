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

export interface ComposioToolkit {
  slug: string;
  name: string;
  description: string;
  logo: string | null;
  toolsCount: number;
}

/**
 * Browse the Composio toolkit catalog (searchable). Powers the integrations
 * page "Available" grid -- the ENTIRE Composio catalog (1000+ apps), not one
 * page. Returns [] on total failure so the page degrades rather than 500ing.
 */

function mapToolkit(t: any): ComposioToolkit | null {
  if (!t?.slug || t.is_local_toolkit) return null;
  return {
    slug: String(t.slug),
    name: String(t.name || t.slug),
    description: String(t.meta?.description || '').slice(0, 240),
    logo: t.meta?.logo || null,
    toolsCount: Number(t.meta?.tools_count || 0),
  };
}

// In-process cache of the full catalog. Composio paginates ~1000 toolkits over
// several pages; fetching them on every request would be wasteful, so we cache
// the assembled list for an hour. Cleared implicitly on process restart.
let _toolkitCache: { at: number; items: ComposioToolkit[] } | null = null;
const TOOLKIT_TTL_MS = 60 * 60 * 1000;

/** Fetch EVERY toolkit by following Composio's cursor pagination (safety-capped). */
async function fetchAllToolkits(): Promise<ComposioToolkit[]> {
  const all: ComposioToolkit[] = [];
  let cursor: string | null = null;
  for (let page = 0; page < 12; page++) { // 12 * 200 = 2400, well above the ~1000 total
    const qs = new URLSearchParams({ limit: '200' });
    if (cursor) qs.set('cursor', cursor);
    const j = await call('GET', `/toolkits?${qs.toString()}`);
    for (const t of (j?.items || j?.data || [])) {
      const m = mapToolkit(t);
      if (m) all.push(m);
    }
    cursor = j?.next_cursor || null;
    if (!cursor) break;
  }
  return all;
}

/**
 * The full catalog, filtered by `search` (substring on slug/name/description).
 * Served from the hour-long cache; on a fetch error we fall back to the last
 * good cache (or []), so a transient Composio blip never empties the page.
 */
export async function listToolkits(search = ''): Promise<ComposioToolkit[]> {
  let catalog: ComposioToolkit[];
  try {
    if (_toolkitCache && Date.now() - _toolkitCache.at < TOOLKIT_TTL_MS) {
      catalog = _toolkitCache.items;
    } else {
      catalog = await fetchAllToolkits();
      if (catalog.length) _toolkitCache = { at: Date.now(), items: catalog };
    }
  } catch {
    catalog = _toolkitCache?.items || [];
  }
  const q = search.trim().toLowerCase();
  if (!q) return catalog;
  return catalog.filter(
    (t) => t.slug.toLowerCase().includes(q) || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q),
  );
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
