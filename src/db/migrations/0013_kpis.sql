-- KPI feature: scorecard measurables attached to org-chart entities (agents or humans).
-- Three tables: definitions (kpis), time-series values (kpi_values), formula DAG (kpi_dependencies).
-- KPI definitions are designed to be OOS-native: published as structured claims via Phase 8.
-- Values stay in the relational DB (high-cardinality time-series, not OOS-shaped).

DO $$ BEGIN CREATE TYPE kpi_owner_entity_type AS ENUM ('agent', 'human');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE kpi_goal_operator AS ENUM ('gte', 'lte', 'eq', 'gt', 'lt');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE kpi_time_grain AS ENUM ('weekly', 'monthly', 'quarterly', 'annual');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE kpi_aggregation AS ENUM ('sum', 'avg', 'last', 'first', 'min', 'max');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE kpi_value_source AS ENUM ('manual', 'api', 'computed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 1) kpis -------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS kpis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  owner_entity_type kpi_owner_entity_type NOT NULL,
  owner_external_id varchar(120) NOT NULL,           -- team graph entity id; no FK (lives in OOS body)
  title varchar(255) NOT NULL,
  description text,
  group_name varchar(120),                            -- 'Winning Scoreboard' etc.
  goal_operator kpi_goal_operator,
  goal_value real,
  unit varchar(40),
  time_grain kpi_time_grain NOT NULL DEFAULT 'weekly',
  formula text,                                       -- nullable; if set, this KPI is computed
  aggregation_method kpi_aggregation NOT NULL DEFAULT 'sum',
  plan_section_id uuid REFERENCES oos_operating_plan_sections(id) ON DELETE SET NULL,
  execution_item_id uuid REFERENCES oos_execution_items(id) ON DELETE SET NULL,
  claim_id uuid,
  is_published boolean NOT NULL DEFAULT false,
  created_by varchar(255) NOT NULL,
  created_at timestamp NOT NULL DEFAULT NOW(),
  updated_at timestamp NOT NULL DEFAULT NOW(),
  deleted_at timestamp
);

CREATE INDEX IF NOT EXISTS kpis_org_idx ON kpis (organization_id);
CREATE INDEX IF NOT EXISTS kpis_owner_idx ON kpis (organization_id, owner_entity_type, owner_external_id);
CREATE INDEX IF NOT EXISTS kpis_group_idx ON kpis (organization_id, group_name);
CREATE INDEX IF NOT EXISTS kpis_grain_idx ON kpis (organization_id, time_grain);
CREATE INDEX IF NOT EXISTS kpis_section_idx ON kpis (plan_section_id);
CREATE INDEX IF NOT EXISTS kpis_exec_item_idx ON kpis (execution_item_id);
CREATE INDEX IF NOT EXISTS kpis_active_idx ON kpis (organization_id) WHERE deleted_at IS NULL;

-- 2) kpi_values --------------------------------------------------------------

CREATE TABLE IF NOT EXISTS kpi_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_id uuid NOT NULL REFERENCES kpis(id) ON DELETE CASCADE,
  period_start timestamp NOT NULL,
  period_end timestamp NOT NULL,
  value real,                                         -- nullable: explicit NULL = no data this period
  source kpi_value_source NOT NULL,
  entered_by varchar(255),                            -- clerk_user_id or api_key_id
  entered_at timestamp NOT NULL DEFAULT NOW(),
  notes text,
  created_at timestamp NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS kpi_values_kpi_period_uk ON kpi_values (kpi_id, period_start);
CREATE INDEX IF NOT EXISTS kpi_values_period_idx ON kpi_values (kpi_id, period_start, period_end);
CREATE INDEX IF NOT EXISTS kpi_values_source_idx ON kpi_values (source);

-- 3) kpi_dependencies (formula DAG, used for cycle detection + recompute) -----

CREATE TABLE IF NOT EXISTS kpi_dependencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_id uuid NOT NULL REFERENCES kpis(id) ON DELETE CASCADE,
  depends_on_kpi_id uuid NOT NULL REFERENCES kpis(id) ON DELETE CASCADE,
  created_at timestamp NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS kpi_deps_uk ON kpi_dependencies (kpi_id, depends_on_kpi_id);
CREATE INDEX IF NOT EXISTS kpi_deps_depends_on_idx ON kpi_dependencies (depends_on_kpi_id);
