/**
 * Idempotent boot-time migration for the Agent Runtime tables.
 *
 * agent_runs       -- log of every agent execution (manual or scheduled).
 *                     One row per run with the prompt, output, token usage,
 *                     status, and timing. Surfaces in the chart tile so an
 *                     agent's recent activity is visible without log diving.
 *
 * agent_schedules  -- cron expression per agent. Future: an in-process tick
 *                     polls due schedules and fires them. v1 ships the
 *                     storage layer + a manual "Run now" button; the tick
 *                     itself lands in a follow-up commit.
 *
 * Both tables index on (org_id, agent_external_id) for the chart-tile
 * lookup pattern that dominates reads.
 */
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';

const DDL: string[] = [
  `DO $$ BEGIN
     CREATE TYPE "public"."agent_run_status" AS ENUM ('queued', 'running', 'succeeded', 'failed', 'cancelled');
   EXCEPTION
     WHEN duplicate_object THEN null;
   END $$;`,

  `CREATE TABLE IF NOT EXISTS "agent_runs" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
     "org_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
     "agent_external_id" varchar(120) NOT NULL,
     "schedule_id" uuid,
     "trigger" varchar(40) NOT NULL DEFAULT 'manual',
     "prompt" text,
     "output" text,
     "model" varchar(120),
     "tokens_input" integer,
     "tokens_output" integer,
     "status" "agent_run_status" NOT NULL DEFAULT 'queued',
     "error" text,
     "started_at" timestamp,
     "completed_at" timestamp,
     "triggered_by_user_id" varchar(255),
     "created_at" timestamp NOT NULL DEFAULT now()
   );`,
  `CREATE INDEX IF NOT EXISTS "agent_runs_agent_idx" ON "agent_runs" ("org_id", "agent_external_id", "created_at" DESC);`,
  `CREATE INDEX IF NOT EXISTS "agent_runs_schedule_idx" ON "agent_runs" ("schedule_id");`,
  `CREATE INDEX IF NOT EXISTS "agent_runs_status_idx" ON "agent_runs" ("status");`,

  // Phase 2 (SOP execution + wallet metering): record which SOP a run executed
  // and the wallet debit (cents) charged for it. Additive + idempotent.
  `ALTER TABLE agent_runs ADD COLUMN IF NOT EXISTS sop_title text;`,
  `ALTER TABLE agent_runs ADD COLUMN IF NOT EXISTS cost_cents integer;`,

  `CREATE TABLE IF NOT EXISTS "agent_schedules" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
     "org_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
     "agent_external_id" varchar(120) NOT NULL,
     "name" varchar(255),
     "cron" varchar(120) NOT NULL,
     "timezone" varchar(60) NOT NULL DEFAULT 'America/New_York',
     "prompt" text NOT NULL,
     "enabled" boolean NOT NULL DEFAULT true,
     "last_run_at" timestamp,
     "next_run_at" timestamp,
     "created_by_user_id" varchar(255),
     "created_at" timestamp NOT NULL DEFAULT now(),
     "updated_at" timestamp NOT NULL DEFAULT now()
   );`,
  `CREATE INDEX IF NOT EXISTS "agent_schedules_agent_idx" ON "agent_schedules" ("org_id", "agent_external_id");`,
  `CREATE INDEX IF NOT EXISTS "agent_schedules_due_idx" ON "agent_schedules" ("enabled", "next_run_at");`,

  // Phase 2b (autonomous scheduling): link a schedule to a specific SOP, the
  // same way agent_runs records sop_title. The runner resolves the SOP from the
  // chart at fire time using these; the existing NOT NULL `prompt` column is set
  // to the SOP title (or a derived description) on insert so the constraint
  // holds. Additive + idempotent.
  `ALTER TABLE agent_schedules ADD COLUMN IF NOT EXISTS sop_id text;`,
  `ALTER TABLE agent_schedules ADD COLUMN IF NOT EXISTS sop_title text;`,
];

export async function ensureAgentRuntimeTables(): Promise<void> {
  for (const stmt of DDL) {
    await db.execute(sql.raw(stmt));
  }
}
