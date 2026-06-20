/**
 * oauth.ts -- OAuth 2.1 authorization-server logic for Remote MCP (Phase 2).
 *
 * Flow: a public MCP client (Claude/Cursor) does Dynamic Client Registration,
 * then the authorization-code + PKCE flow. The code is exchanged at /oauth/token
 * for a LONG-LIVED access token, which is an api_keys row (kind='mcp') -- no
 * refresh token (product decision 2026-06-20). Org isolation + the paid/Labs
 * gate are enforced at /authorize (org pick) and re-checked at /token.
 *
 * The PKCE helpers are pure + DB-free so they unit-test without a database.
 */
import { createHash, randomBytes } from 'crypto';
import { and, eq, isNull } from 'drizzle-orm';
import { db } from '../config/database.js';
import { oauthClients, oauthCodes, apiKeys } from '../db/schema.js';
import { generateApiKey } from '../middleware/api-key-auth.js';
import { verifyPkce } from '../shared/pkce.js';

const CODE_TTL_MS = 5 * 60 * 1000; // authorization codes live 5 minutes

// ---- Dynamic Client Registration (RFC 7591) -------------------------------

export interface OauthClient {
  clientId: string;
  clientName: string | null;
  redirectUris: string[];
  grantTypes: string[];
}

export async function registerClient(input: {
  clientName?: string | null;
  redirectUris: string[];
  grantTypes?: string[];
}): Promise<OauthClient> {
  const clientId = 'mcpc_' + randomBytes(16).toString('hex');
  const [row] = await db
    .insert(oauthClients)
    .values({
      clientId,
      clientName: input.clientName || null,
      redirectUris: input.redirectUris,
      grantTypes: input.grantTypes && input.grantTypes.length ? input.grantTypes : ['authorization_code'],
    })
    .returning();
  return {
    clientId: row.clientId,
    clientName: row.clientName,
    redirectUris: row.redirectUris,
    grantTypes: row.grantTypes,
  };
}

export async function getClient(clientId: string): Promise<OauthClient | null> {
  if (!clientId) return null;
  const [row] = await db.select().from(oauthClients).where(eq(oauthClients.clientId, clientId)).limit(1);
  if (!row) return null;
  return {
    clientId: row.clientId,
    clientName: row.clientName,
    redirectUris: row.redirectUris,
    grantTypes: row.grantTypes,
  };
}

/** Exact-match redirect_uri validation (no wildcards, no prefix matching). */
export function redirectUriAllowed(client: OauthClient, redirectUri: string): boolean {
  return !!redirectUri && client.redirectUris.includes(redirectUri);
}

// ---- Authorization codes --------------------------------------------------

function hashCode(code: string): string {
  return createHash('sha256').update(code).digest('hex');
}

export async function issueAuthCode(input: {
  clientId: string;
  orgId: string;
  userId: string;
  redirectUri: string;
  scopes: string[];
  codeChallenge: string;
  codeChallengeMethod: string;
  now: number;
}): Promise<string> {
  const code = 'otpc_' + randomBytes(32).toString('hex');
  await db.insert(oauthCodes).values({
    codeHash: hashCode(code),
    clientId: input.clientId,
    orgId: input.orgId,
    userId: input.userId,
    redirectUri: input.redirectUri,
    scopes: input.scopes,
    codeChallenge: input.codeChallenge,
    codeChallengeMethod: input.codeChallengeMethod || 'S256',
    expiresAt: new Date(input.now + CODE_TTL_MS),
  });
  return code;
}

export class OauthError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

/**
 * Validate + consume an authorization code (single use). Throws OauthError with
 * an RFC 6749 error code on any failure. Returns the bound grant on success.
 */
export async function consumeAuthCode(input: {
  code: string;
  clientId: string;
  redirectUri: string;
  codeVerifier: string;
  now: number;
}): Promise<{ orgId: string; userId: string; scopes: string[] }> {
  if (!input.code) throw new OauthError('invalid_request', 'Missing code.');
  const [row] = await db
    .select()
    .from(oauthCodes)
    .where(and(eq(oauthCodes.codeHash, hashCode(input.code)), isNull(oauthCodes.usedAt)))
    .limit(1);

  if (!row) throw new OauthError('invalid_grant', 'Authorization code not found or already used.');
  if (row.expiresAt.getTime() < input.now) throw new OauthError('invalid_grant', 'Authorization code expired.');
  if (row.clientId !== input.clientId) throw new OauthError('invalid_grant', 'Code was issued to a different client.');
  if (row.redirectUri !== input.redirectUri) throw new OauthError('invalid_grant', 'redirect_uri mismatch.');
  if (!verifyPkce(input.codeVerifier, row.codeChallenge, row.codeChallengeMethod)) {
    throw new OauthError('invalid_grant', 'PKCE verification failed.');
  }

  // Consume (single use). Best-effort guard against a race: only the update that
  // flips a still-NULL used_at wins.
  const consumed = await db
    .update(oauthCodes)
    .set({ usedAt: new Date(input.now) })
    .where(and(eq(oauthCodes.id, row.id), isNull(oauthCodes.usedAt)))
    .returning({ id: oauthCodes.id });
  if (!consumed.length) throw new OauthError('invalid_grant', 'Authorization code already used.');

  return { orgId: row.orgId, userId: row.userId, scopes: row.scopes };
}

/**
 * Mint the long-lived access token for a granted org. It is an api_keys row
 * (kind='mcp') so the existing resolveApiKey/resolveMcpToken path validates it
 * and /settings/api lists + revokes it like any connection. Returns plaintext.
 */
export async function issueMcpAccessToken(input: {
  orgId: string;
  scopes: string[];
  clientName?: string | null;
}): Promise<string> {
  const { key, prefix, hash } = generateApiKey();
  const name = input.clientName ? `MCP: ${input.clientName}`.slice(0, 255) : 'Remote MCP connection';
  await db.insert(apiKeys).values({
    orgId: input.orgId,
    name,
    kind: 'mcp',
    keyPrefix: prefix,
    keyHash: hash,
    scopes: input.scopes && input.scopes.length ? input.scopes : ['read', 'write'],
  });
  return key;
}
