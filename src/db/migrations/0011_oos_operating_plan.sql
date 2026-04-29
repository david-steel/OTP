-- OOS Operating Plan — strategic plan that pushes selected items into the OOS as structured claims.
-- Four tables per spec. Section content is jsonb (discriminated union per section_key).
-- Execution items keep a pushed_claim_ids_json array so claim-by-claim revert works without a junction table.
-- department_id is nullable now; departmental plans are a future release.

DO $$ BEGIN CREATE TYPE oos_plan_status AS ENUM ('draft', 'active', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE oos_plan_section_key AS ENUM (
  'foundation',
  'market_command',
  'destination',
  'annual_game_plan',
  'ninety_day_engine',
  'performance_scorecard',
  'constraints_leverage',
  'alignment_accountability'
);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE oos_item_priority AS ENUM ('critical', 'high', 'medium', 'low');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE oos_item_status AS ENUM ('proposed', 'accepted', 'in_progress', 'at_risk', 'completed', 'deferred');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE oos_owner_type AS ENUM ('employee', 'agent', 'hybrid', 'unassigned');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE oos_sync_type AS ENUM ('preview', 'push_to_oos', 'rollback');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 1) oos_operating_plans -------------------------------------------------------

CREATE TABLE IF NOT EXISTS oos_operating_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  department_id uuid,                          -- nullable for MVP; departmental plans = future release
  title varchar(255) NOT NULL,
  status oos_plan_status NOT NULL DEFAULT 'draft',
  created_by varchar(255) NOT NULL,            -- clerk_user_id
  created_at timestamp NOT NULL DEFAULT NOW(),
  updated_at timestamp NOT NULL DEFAULT NOW(),
  last_synced_to_oos_at timestamp
);

CREATE INDEX IF NOT EXISTS oop_org_idx ON oos_operating_plans (organization_id);
CREATE INDEX IF NOT EXISTS oop_dept_idx ON oos_operating_plans (department_id);
CREATE INDEX IF NOT EXISTS oop_status_idx ON oos_operating_plans (status);

-- 2) oos_operating_plan_sections -----------------------------------------------

CREATE TABLE IF NOT EXISTS oos_operating_plan_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES oos_operating_plans(id) ON DELETE CASCADE,
  section_key oos_plan_section_key NOT NULL,
  title varchar(255) NOT NULL,
  content_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamp NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS oops_plan_section_idx ON oos_operating_plan_sections (plan_id, section_key);
CREATE INDEX IF NOT EXISTS oops_sort_idx ON oos_operating_plan_sections (plan_id, sort_order);

-- 3) oos_execution_items -------------------------------------------------------
-- Items live forever (never deleted at quarter end). Status moves to completed/deferred,
-- new quarter generates new items. Quarter format: 'Q1-2026', 'Q2-2026', etc.
-- Hybrid ownership = primary + secondary. pushed_claim_ids_json holds OOS claim IDs
-- created from this item, supporting claim-by-claim selective revert.

CREATE TABLE IF NOT EXISTS oos_execution_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES oos_operating_plans(id) ON DELETE CASCADE,
  title varchar(500) NOT NULL,
  description text,
  outcome text,                                -- the desired outcome statement
  priority oos_item_priority NOT NULL DEFAULT 'medium',
  status oos_item_status NOT NULL DEFAULT 'proposed',
  due_date timestamp,
  quarter varchar(12) NOT NULL,                -- 'Q1-2026' format
  assigned_owner_type oos_owner_type NOT NULL DEFAULT 'unassigned',
  assigned_owner_id varchar(255),              -- clerk_user_id for employee, agent name for agent
  assigned_owner_name varchar(255),            -- display name
  secondary_owner_type oos_owner_type,         -- non-null only when primary type = 'hybrid'
  secondary_owner_id varchar(255),
  secondary_owner_name varchar(255),
  confidence_score real,                       -- 0..100; below 70 = needs human assignment
  assignment_reason text,
  source_references_json jsonb DEFAULT '[]'::jsonb,
  pushed_claim_ids_json jsonb DEFAULT '[]'::jsonb,  -- OOS claim IDs created from this item
  created_by_ai boolean NOT NULL DEFAULT false,
  user_modified boolean NOT NULL DEFAULT false,
  created_at timestamp NOT NULL DEFAULT NOW(),
  updated_at timestamp NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ooei_plan_idx ON oos_execution_items (plan_id);
CREATE INDEX IF NOT EXISTS ooei_quarter_idx ON oos_execution_items (plan_id, quarter);
CREATE INDEX IF NOT EXISTS ooei_status_idx ON oos_execution_items (status);
CREATE INDEX IF NOT EXISTS ooei_owner_idx ON oos_execution_items (assigned_owner_type, assigned_owner_id);
CREATE INDEX IF NOT EXISTS ooei_priority_idx ON oos_execution_items (priority);

-- 4) oos_plan_sync_events ------------------------------------------------------
-- Audit trail for every preview / push / rollback. before/after snapshots support
-- full-batch revert. claim_ids_json + pushed_claim_ids_json on items support claim-by-claim revert.

CREATE TABLE IF NOT EXISTS oos_plan_sync_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES oos_operating_plans(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  sync_type oos_sync_type NOT NULL,
  pushed_by varchar(255) NOT NULL,             -- clerk_user_id
  before_snapshot_json jsonb DEFAULT '{}'::jsonb,
  after_snapshot_json jsonb DEFAULT '{}'::jsonb,
  claim_ids_json jsonb DEFAULT '[]'::jsonb,    -- OOS claim IDs touched in this sync
  created_at timestamp NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS oopse_plan_idx ON oos_plan_sync_events (plan_id);
CREATE INDEX IF NOT EXISTS oopse_org_idx ON oos_plan_sync_events (organization_id);
CREATE INDEX IF NOT EXISTS oopse_type_idx ON oos_plan_sync_events (sync_type);
CREATE INDEX IF NOT EXISTS oopse_created_idx ON oos_plan_sync_events (created_at);
