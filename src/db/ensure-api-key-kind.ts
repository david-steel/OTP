/**
 * Idempotent boot-time migration: api_keys.kind.
 *
 * Distinguishes a manually-minted REST/MCP API key ('api') from a token minted
 * for a Remote MCP connection ('mcp'), so /settings/api can list and revoke MCP
 * connections separately from raw API keys. Existing rows default to 'api'.
 *
 * Safe to run on every boot.
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

export async function ensureApiKeyKindColumn(): Promise<void> {
  await db.execute(
    sql.raw(
      `ALTER TABLE "api_keys" ADD COLUMN IF NOT EXISTS "kind" varchar(16) NOT NULL DEFAULT 'api';`
    )
  );
}
