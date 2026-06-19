// Org-scoped BYOK AI key data-service.
//
// Each org may store ONE active AI provider key (Anthropic or OpenAI), encrypted
// at rest via secret-encryption.ts. The orgAiKeys table's partial unique index
// enforces one active key per org; this layer also revokes-then-inserts so the
// invariant holds even if the index were absent.
//
// Mirrors portfolios.ts / portfolio-presets.ts: same db, schema, drizzle helpers
// (and/eq/desc), .js extensions, and PortfolioError for thrown errors.
//
// SECURITY: plaintext keys are NEVER logged, returned by metadata reads, or
// included in error messages. resolveAiKey() degrades to the platform key rather
// than throwing so AI features never 500 on a bad/undecryptable org key.

import { and, eq, desc } from 'drizzle-orm';
import { db } from '../config/database.js';
import { orgAiKeys } from '../db/schema.js';
import { PortfolioError } from './portfolios.js';
import {
  encryptSecret,
  decryptSecret,
  last4,
  isEncryptionConfigured,
} from './secret-encryption.js';
import { getParentPortfolioForOrg } from './portfolio-presets.js';

const VALID_PROVIDERS = ['anthropic', 'openai'] as const;
type AiProvider = (typeof VALID_PROVIDERS)[number];

function isValidProvider(p: string): p is AiProvider {
  return (VALID_PROVIDERS as readonly string[]).includes(p);
}

export interface SetOrgAiKeyInput {
  orgId: string;
  provider: string;
  plaintextKey: string;
}

/**
 * Store (or rotate) an org's AI key. Encrypts the key, stores only the last 4 for
 * masked display, and enforces "one active key per org" by revoking any existing
 * active row before inserting the new active row.
 *
 * @throws PortfolioError if encryption is not configured, the provider is
 *   unsupported, or the key is empty.
 */
export async function setOrgAiKey(input: SetOrgAiKeyInput): Promise<void> {
  const { orgId } = input;
  if (!orgId) {
    throw new PortfolioError('INVALID_ORG', 'An org is required');
  }
  if (!isEncryptionConfigured()) {
    throw new PortfolioError(
      'ENCRYPTION_NOT_CONFIGURED',
      'Key encryption is not configured; cannot store AI keys',
    );
  }

  const provider = String(input.provider || '').trim();
  if (!isValidProvider(provider)) {
    throw new PortfolioError('INVALID_PROVIDER', "provider must be 'anthropic' or 'openai'");
  }

  const plaintextKey = String(input.plaintextKey || '');
  if (!plaintextKey.trim()) {
    throw new PortfolioError('INVALID_KEY', 'A non-empty API key is required');
  }

  const encryptedKey = encryptSecret(plaintextKey);
  const keyLast4 = last4(plaintextKey);

  // Revoke any existing active key for this org, then insert the new active one.
  await db
    .update(orgAiKeys)
    .set({ status: 'revoked', updatedAt: new Date() })
    .where(and(eq(orgAiKeys.orgId, orgId), eq(orgAiKeys.status, 'active')));

  await db.insert(orgAiKeys).values({
    orgId,
    provider,
    encryptedKey,
    keyLast4,
    status: 'active',
    lastRotatedAt: new Date(),
  });
}

/**
 * Metadata for an org's active AI key. NEVER returns or decrypts the key itself.
 * configured=false when the org has no active key row.
 */
export async function getOrgAiKeyMeta(
  orgId: string,
): Promise<{ configured: boolean; provider?: string; last4?: string; lastRotatedAt?: Date | null }> {
  if (!orgId) return { configured: false };

  const [row] = await db
    .select({
      provider: orgAiKeys.provider,
      keyLast4: orgAiKeys.keyLast4,
      lastRotatedAt: orgAiKeys.lastRotatedAt,
    })
    .from(orgAiKeys)
    .where(and(eq(orgAiKeys.orgId, orgId), eq(orgAiKeys.status, 'active')))
    .orderBy(desc(orgAiKeys.createdAt))
    .limit(1);

  if (!row) return { configured: false };

  return {
    configured: true,
    provider: row.provider,
    last4: row.keyLast4 ?? undefined,
    lastRotatedAt: row.lastRotatedAt ?? null,
  };
}

/**
 * Revoke an org's active AI key (status='active' -> 'revoked'). No-op if none.
 */
export async function revokeOrgAiKey(orgId: string): Promise<void> {
  if (!orgId) return;
  await db
    .update(orgAiKeys)
    .set({ status: 'revoked', updatedAt: new Date() })
    .where(and(eq(orgAiKeys.orgId, orgId), eq(orgAiKeys.status, 'active')));
}

/**
 * Internal: fetch + decrypt the active key for a single org. Returns null when
 * the org has no active key OR when decryption fails (logged, no secrets) so the
 * caller can fall through to the next tier instead of throwing.
 */
async function tryResolveOrgKey(
  orgId: string,
): Promise<{ key: string; provider: string } | null> {
  if (!orgId) return null;

  const [row] = await db
    .select({
      provider: orgAiKeys.provider,
      encryptedKey: orgAiKeys.encryptedKey,
    })
    .from(orgAiKeys)
    .where(and(eq(orgAiKeys.orgId, orgId), eq(orgAiKeys.status, 'active')))
    .orderBy(desc(orgAiKeys.createdAt))
    .limit(1);

  if (!row) return null;

  try {
    const key = decryptSecret(row.encryptedKey);
    return { key, provider: row.provider };
  } catch {
    // Undecryptable (bad/rotated master key, corruption). Never log the key or
    // ciphertext; fall through to the next resolution tier.
    console.warn(`[org-ai-keys] failed to decrypt active AI key for org ${orgId}; falling through`);
    return null;
  }
}

/**
 * Resolve the AI key an AI call site should use, in precedence order:
 *   1. org      -- the org's own active key
 *   2. portfolio-- the org's parent portfolio's active key
 *   3. platform -- the ANTHROPIC_API_KEY platform default
 *
 * Decryption failures degrade to the next tier rather than throwing, so AI
 * features never 500 on a bad org/portfolio key.
 */
export async function resolveAiKey(
  orgId: string,
): Promise<{ key: string; provider: string; source: 'org' | 'portfolio' | 'platform' }> {
  // Tier 1: the org's own key.
  const orgKey = await tryResolveOrgKey(orgId);
  if (orgKey) {
    return { key: orgKey.key, provider: orgKey.provider, source: 'org' };
  }

  // Tier 2: the parent portfolio's key.
  const parent = await getParentPortfolioForOrg(orgId);
  if (parent) {
    const portfolioKey = await tryResolveOrgKey(parent.id);
    if (portfolioKey) {
      return { key: portfolioKey.key, provider: portfolioKey.provider, source: 'portfolio' };
    }
  }

  // Tier 3: platform default.
  return {
    key: process.env.ANTHROPIC_API_KEY || '',
    provider: 'anthropic',
    source: 'platform',
  };
}
