import type { FastifyRequest, FastifyReply } from 'fastify';
import { createHash } from 'crypto';
import { eq, and, isNull, sql } from 'drizzle-orm';
import { db } from '../config/database.js';
import { apiKeys, organizations } from '../db/schema.js';

export interface ApiKeyContext {
  orgId: string;
  keyId: string;
  scopes: string[];
  kind: string;
}

function hashKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

/**
 * Core token validation, shared by the header-based REST path (resolveApiKey)
 * and the URL-path Remote MCP path (resolveMcpToken). Hashes the raw token,
 * looks it up by hash, checks revoke/expiry, bumps usage. Returns null on any
 * miss so callers can fail closed.
 */
export async function resolveTokenString(token: string | undefined | null): Promise<ApiKeyContext | null> {
  if (!token || !token.startsWith('otp_')) return null;

  const hash = hashKey(token);

  const [row] = await db
    .select({
      id: apiKeys.id,
      orgId: apiKeys.orgId,
      scopes: apiKeys.scopes,
      kind: apiKeys.kind,
      expiresAt: apiKeys.expiresAt,
    })
    .from(apiKeys)
    .where(and(eq(apiKeys.keyHash, hash), isNull(apiKeys.revokedAt)))
    .limit(1);

  if (!row) return null;

  // Check expiry
  if (row.expiresAt && row.expiresAt < new Date()) return null;

  // Update last_used_at + increment use_count (fire and forget)
  db.update(apiKeys)
    .set({ lastUsedAt: new Date(), useCount: sql`${apiKeys.useCount} + 1` })
    .where(eq(apiKeys.id, row.id))
    .execute()
    .catch(() => {});

  return {
    orgId: row.orgId,
    keyId: row.id,
    scopes: row.scopes || ['read'],
    kind: row.kind || 'api',
  };
}

/**
 * Resolve a Remote MCP token taken from the URL path (e.g. /api/mcp/:token).
 * The Claude/Cursor connector dialog has no header field, so MCP tokens travel
 * in the path. Same validation as a Bearer key.
 */
export async function resolveMcpToken(token: string | undefined | null): Promise<ApiKeyContext | null> {
  return resolveTokenString(token);
}

export function generateApiKey(): { key: string; prefix: string; hash: string } {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const key = 'otp_' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  const prefix = key.slice(0, 8);
  const hash = hashKey(key);
  return { key, prefix, hash };
}

export async function resolveApiKey(request: FastifyRequest): Promise<ApiKeyContext | null> {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;
  return resolveTokenString(authHeader.slice(7));
}

export function requireScope(ctx: { scopes: string[] }, requiredScope: string): boolean {
  return ctx.scopes.includes(requiredScope);
}

export async function requireApiKey(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<ApiKeyContext | null> {
  const ctx = await resolveApiKey(request);
  if (!ctx) {
    reply.status(401).send({
      error: {
        code: 'API_KEY_REQUIRED',
        message: 'Valid API key required. Get yours at https://orgtp.com/settings/api',
      },
    });
    return null;
  }
  return ctx;
}
