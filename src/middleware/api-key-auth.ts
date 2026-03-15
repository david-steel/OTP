import type { FastifyRequest, FastifyReply } from 'fastify';
import { createHash } from 'crypto';
import { eq, and, isNull } from 'drizzle-orm';
import { db } from '../config/database.js';
import { apiKeys, organizations } from '../db/schema.js';

export interface ApiKeyContext {
  orgId: string;
  keyId: string;
  scopes: string[];
}

function hashKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
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

  const token = authHeader.slice(7);
  if (!token.startsWith('otp_')) return null;

  const hash = hashKey(token);

  const [row] = await db
    .select({
      id: apiKeys.id,
      orgId: apiKeys.orgId,
      scopes: apiKeys.scopes,
      expiresAt: apiKeys.expiresAt,
    })
    .from(apiKeys)
    .where(and(eq(apiKeys.keyHash, hash), isNull(apiKeys.revokedAt)))
    .limit(1);

  if (!row) return null;

  // Check expiry
  if (row.expiresAt && row.expiresAt < new Date()) return null;

  // Update last_used_at (fire and forget)
  db.update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, row.id))
    .execute()
    .catch(() => {});

  return {
    orgId: row.orgId,
    keyId: row.id,
    scopes: row.scopes || ['read'],
  };
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
