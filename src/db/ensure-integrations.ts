/**
 * Idempotent boot-time migration for the Integrations tables (Composio).
 *
 * integration_connections -- one row per (org, provider) connection. Stores only
 *   a REFERENCE to the Composio-vaulted connection (composio_connection_id) plus
 *   status -- never an OAuth token or secret. Read-only scope is enforced on the
 *   Composio auth_config, not here. Unique on (org_id, provider) so an org has at
 *   most one live connection per provider (re-connect replaces).
 *
 * kpi_sources -- maps a scorecard KPI to a connection + a concrete read (e.g. a
 *   Google Sheet id + range) on a cadence. Inc 1 ships the storage; Tally owns
 *   the actual pull in Inc 2 (a new tally.py source handler), so this table is
 *   created now but not yet written by the app.
 *
 * Mirrors ensure-agent-runtime.ts: raw idempotent DDL run at boot (Drizzle
 * migrate is not used in this repo for app tables).
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DDL: string[] = [
  `DO $$ BEGIN
     CREATE TYPE "public"."integration_status" AS ENUM ('pending', 'active', 'error', 'revoked');
   EXCEPTION
     WHEN duplicate_object THEN null;
   END $$;`,

  `CREATE TABLE IF NOT EXISTS "integration_connections" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
     "org_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
     "provider" varchar(80) NOT NULL,
     "composio_connection_id" varchar(120),
     "composio_auth_config_id" varchar(120),
     "status" "integration_status" NOT NULL DEFAULT 'pending',
     "label" varchar(255),
     "scopes" text,
     "connected_by_user_id" varchar(255),
     "last_used_at" timestamp,
     "last_error" text,
     "created_at" timestamp NOT NULL DEFAULT now(),
     "updated_at" timestamp NOT NULL DEFAULT now()
   );`,
  // One live connection per (org, provider). Re-connecting upserts this row.
  `CREATE UNIQUE INDEX IF NOT EXISTS "integration_connections_org_provider_uk" ON "integration_connections" ("org_id", "provider");`,
  `CREATE INDEX IF NOT EXISTS "integration_connections_org_idx" ON "integration_connections" ("org_id");`,

  `CREATE TABLE IF NOT EXISTS "kpi_sources" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
     "org_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
     "kpi_id" uuid NOT NULL,
     "connection_id" uuid NOT NULL REFERENCES "integration_connections"("id") ON DELETE CASCADE,
     "provider" varchar(80) NOT NULL,
     "action" varchar(160) NOT NULL,
     "params" jsonb NOT NULL DEFAULT '{}'::jsonb,
     "transform" text,
     "cadence" varchar(120),
     "last_value" real,
     "last_pulled_at" timestamp,
     "last_error" text,
     "created_by_user_id" varchar(255),
     "created_at" timestamp NOT NULL DEFAULT now(),
     "updated_at" timestamp NOT NULL DEFAULT now()
   );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "kpi_sources_kpi_uk" ON "kpi_sources" ("kpi_id");`,
  `CREATE INDEX IF NOT EXISTS "kpi_sources_org_idx" ON "kpi_sources" ("org_id");`,
  `CREATE INDEX IF NOT EXISTS "kpi_sources_conn_idx" ON "kpi_sources" ("connection_id");`,
];

export async function ensureIntegrationsTables(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }
}
