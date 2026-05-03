-- L10 (weekly leadership meeting layer) production migration.
-- Idempotent: safe to re-run. Only adds new objects, never drops or modifies existing data.
-- Tested locally. Reviewed before prod execution.

BEGIN;

-- ----- Enums -----
DO $$ BEGIN
  CREATE TYPE "public"."ids_status" AS ENUM ('open', 'identified', 'discussed', 'solved');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "public"."owner_entity_type" AS ENUM ('agent', 'human');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "public"."meeting_status" AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ----- meetings -----
CREATE TABLE IF NOT EXISTS "meetings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "meeting_type" varchar(60) NOT NULL DEFAULT 'leadership',
  "title" varchar(255) NOT NULL,
  "status" "meeting_status" NOT NULL DEFAULT 'scheduled',
  "scheduled_at" timestamp NOT NULL,
  "started_at" timestamp,
  "ended_at" timestamp,
  "attendees" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "segue_notes" text,
  "headlines" text,
  "cascading_message" text,
  "ratings" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "scorecard_snapshot" jsonb,
  "rocks_snapshot" jsonb,
  "created_by" varchar(255) NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  "deleted_at" timestamp
);
CREATE INDEX IF NOT EXISTS "meetings_org_idx" ON "meetings" ("organization_id");
CREATE INDEX IF NOT EXISTS "meetings_scheduled_idx" ON "meetings" ("organization_id", "scheduled_at");
CREATE INDEX IF NOT EXISTS "meetings_type_idx" ON "meetings" ("organization_id", "meeting_type");

-- ----- rocks -----
CREATE TABLE IF NOT EXISTS "rocks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "owner_entity_type" "owner_entity_type" NOT NULL,
  "owner_external_id" varchar(120) NOT NULL,
  "owner_name" varchar(255),
  "title" varchar(500) NOT NULL,
  "description" text,
  "quarter" varchar(10) NOT NULL,
  "due_date" timestamp NOT NULL,
  "on_track" boolean NOT NULL DEFAULT true,
  "status_note" text,
  "status_updated_at" timestamp,
  "completed_at" timestamp,
  "created_by" varchar(255) NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  "deleted_at" timestamp
);
CREATE INDEX IF NOT EXISTS "rocks_org_idx" ON "rocks" ("organization_id");
CREATE INDEX IF NOT EXISTS "rocks_owner_idx" ON "rocks" ("organization_id", "owner_entity_type", "owner_external_id");
CREATE INDEX IF NOT EXISTS "rocks_quarter_idx" ON "rocks" ("organization_id", "quarter");

-- ----- todos -----
CREATE TABLE IF NOT EXISTS "todos" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE,
  "meeting_id" uuid REFERENCES "meetings"("id") ON DELETE SET NULL,
  "owner_entity_type" "owner_entity_type" NOT NULL,
  "owner_external_id" varchar(120) NOT NULL,
  "owner_name" varchar(255),
  "title" varchar(500) NOT NULL,
  "description" text,
  "due_at" timestamp,
  "done_at" timestamp,
  "created_by" varchar(255) NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  "deleted_at" timestamp
);
CREATE INDEX IF NOT EXISTS "todos_org_idx" ON "todos" ("organization_id");
CREATE INDEX IF NOT EXISTS "todos_meeting_idx" ON "todos" ("meeting_id");
CREATE INDEX IF NOT EXISTS "todos_owner_idx" ON "todos" ("organization_id", "owner_entity_type", "owner_external_id");
CREATE INDEX IF NOT EXISTS "todos_open_idx" ON "todos" ("organization_id", "done_at");

-- ----- tickets: IDS extension columns -----
ALTER TABLE "tickets" ADD COLUMN IF NOT EXISTS "ids_status" "ids_status" NOT NULL DEFAULT 'open';
ALTER TABLE "tickets" ADD COLUMN IF NOT EXISTS "priority_rank" integer;
ALTER TABLE "tickets" ADD COLUMN IF NOT EXISTS "solved_in_meeting_id" uuid REFERENCES "meetings"("id") ON DELETE SET NULL;
ALTER TABLE "tickets" ADD COLUMN IF NOT EXISTS "owner_entity_type" "owner_entity_type";
ALTER TABLE "tickets" ADD COLUMN IF NOT EXISTS "owner_external_id" varchar(120);
ALTER TABLE "tickets" ADD COLUMN IF NOT EXISTS "owner_name" varchar(255);
ALTER TABLE "tickets" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;
CREATE INDEX IF NOT EXISTS "ticket_ids_status_idx" ON "tickets" ("org_id", "ids_status");

COMMIT;
