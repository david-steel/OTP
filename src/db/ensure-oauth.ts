/**
 * Idempotent boot-time migration: OAuth 2.1 storage for Remote MCP.
 *
 * oauth_clients -- Dynamic Client Registration records (RFC 7591).
 * oauth_codes   -- short-lived single-use authorization codes (PKCE flow).
 *
 * The long-lived access token issued at /oauth/token is an api_keys row
 * (kind='mcp'), so there is no token table here. Safe to run on every boot.
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DDL = [
  `CREATE TABLE IF NOT EXISTS "oauth_clients" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "client_id" varchar(64) NOT NULL UNIQUE,
      "client_name" varchar(255),
      "redirect_uris" text[] NOT NULL,
      "grant_types" text[] NOT NULL DEFAULT '{authorization_code}',
      "created_at" timestamp NOT NULL DEFAULT now()
   );`,
  `CREATE INDEX IF NOT EXISTS "idx_oauth_clients_client_id" ON "oauth_clients" ("client_id");`,
  `CREATE TABLE IF NOT EXISTS "oauth_codes" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "code_hash" varchar(64) NOT NULL,
      "client_id" varchar(64) NOT NULL,
      "org_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
      "user_id" varchar(255) NOT NULL,
      "redirect_uri" text NOT NULL,
      "scopes" text[] NOT NULL,
      "code_challenge" varchar(255) NOT NULL,
      "code_challenge_method" varchar(16) NOT NULL DEFAULT 'S256',
      "expires_at" timestamp NOT NULL,
      "used_at" timestamp,
      "created_at" timestamp NOT NULL DEFAULT now()
   );`,
  `CREATE INDEX IF NOT EXISTS "idx_oauth_codes_code_hash" ON "oauth_codes" ("code_hash");`,
];

export async function ensureOauthTables(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }
}
