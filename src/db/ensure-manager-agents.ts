/**
 * manager_agents -- the dashboard's "my agents" surface.
 *
 * Lets a manager upload their own CLAUDE.md / Agent.md file. The agent gets
 * scored, gets KPIs, and shows MCP-connection status on the dashboard. If
 * the user has not connected an OTP MCP key yet, the dashboard nudges them
 * here -- this is the conversion moment from passive viewer to active user.
 *
 * Distinct from the org-chart agents that come from a published OOS file.
 * Those are org-wide, declared by the Visionary/Integrator. These are
 * personal: any member can upload their own without touching the chart.
 *
 * score (0-8 scale, Bassim-style) is computed by a worker; here we just
 * persist the latest value + the breakdown JSON.
 *
 * mcp_connected_at is a denormalized "last seen via MCP" timestamp; the
 * scorer rolls up agent_runs + api_keys + last activity into it so the
 * dashboard does not have to join four tables to render the status pill.
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DDL: string[] = [
  `CREATE TABLE IF NOT EXISTS "manager_agents" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
     "org_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
     "owner_user_id" varchar(255) NOT NULL,
     "owner_member_id" uuid REFERENCES "org_members"("id") ON DELETE CASCADE,
     "name" varchar(255) NOT NULL,
     "external_id" varchar(120),
     "description" text,
     "raw_md" text NOT NULL,
     "frontmatter" jsonb NOT NULL DEFAULT '{}'::jsonb,
     "kpis" jsonb NOT NULL DEFAULT '[]'::jsonb,
     "score" real,
     "score_breakdown" jsonb,
     "mcp_connected_at" timestamp,
     "last_run_at" timestamp,
     "run_count" integer NOT NULL DEFAULT 0,
     "created_at" timestamp NOT NULL DEFAULT now(),
     "updated_at" timestamp NOT NULL DEFAULT now(),
     "deleted_at" timestamp
   );`,

  `CREATE INDEX IF NOT EXISTS "mga_org_idx" ON "manager_agents" ("org_id");`,
  `CREATE INDEX IF NOT EXISTS "mga_owner_idx" ON "manager_agents" ("org_id", "owner_user_id");`,
  `CREATE INDEX IF NOT EXISTS "mga_external_idx" ON "manager_agents" ("org_id", "external_id");`,
];

export async function ensureManagerAgentsTable(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }
}
