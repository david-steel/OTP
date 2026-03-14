-- OTP Initial Schema Migration
-- Generated: 2026-03-14

-- Enums
CREATE TYPE org_size AS ENUM ('solo', 'small', 'medium', 'large', 'enterprise');
CREATE TYPE template_type AS ENUM ('agent_army', 'value_chain', 'org_chart');
CREATE TYPE oos_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE visibility AS ENUM ('free', 'paid', 'premium');
CREATE TYPE badge_type AS ENUM ('founding', 'early');
CREATE TYPE quality_tier AS ENUM ('platinum', 'gold', 'silver', 'bronze');
CREATE TYPE confidence_level AS ENUM ('HIGH', 'MEDIUM', 'LOW');
CREATE TYPE evidence_type AS ENUM (
  'HUMAN_DEFINED_RULE', 'OBSERVED_ONCE', 'OBSERVED_REPEATEDLY',
  'MEASURED_RESULT', 'INFERENCE', 'SPECULATION'
);
CREATE TYPE similarity_class AS ENUM ('SIMILAR', 'DUPLICATE');
CREATE TYPE actor_type AS ENUM ('user', 'system', 'agent');

-- Organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  pseudonym VARCHAR(255),
  industry VARCHAR(255) NOT NULL,
  size org_size NOT NULL,
  clerk_org_id VARCHAR(255) NOT NULL UNIQUE,
  stripe_customer_id VARCHAR(255),
  badge badge_type,
  quality_tier quality_tier,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- OOS Files
CREATE TABLE oos_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  template template_type NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  status oos_status NOT NULL DEFAULT 'draft',
  visibility_default visibility NOT NULL DEFAULT 'free',
  word_count INTEGER NOT NULL,
  claim_count INTEGER NOT NULL DEFAULT 0,
  raw_content TEXT NOT NULL,
  frontmatter JSONB NOT NULL,
  confidence_distribution JSONB,
  evidence_distribution JSONB,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, version)
);

CREATE INDEX oos_status_idx ON oos_files(status);

-- Claims
CREATE TABLE claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oos_file_id UUID NOT NULL REFERENCES oos_files(id) ON DELETE CASCADE,
  claim_id VARCHAR(10) NOT NULL,
  section VARCHAR(100) NOT NULL,
  display_order INTEGER NOT NULL,
  rule TEXT NOT NULL,
  why TEXT NOT NULL,
  failure_mode TEXT NOT NULL,
  confidence confidence_level NOT NULL,
  evidence evidence_type NOT NULL,
  scope TEXT NOT NULL,
  visibility_override visibility,
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(oos_file_id, claim_id)
);

CREATE INDEX claim_oos_order_idx ON claims(oos_file_id, display_order);
CREATE INDEX claim_confidence_idx ON claims(confidence);
CREATE INDEX claim_evidence_idx ON claims(evidence);
CREATE INDEX claim_search_idx ON claims USING GIN(search_vector);

-- Search vector trigger
CREATE OR REPLACE FUNCTION claims_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.rule, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.why, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.failure_mode, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.scope, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER claims_search_update
  BEFORE INSERT OR UPDATE ON claims
  FOR EACH ROW EXECUTE FUNCTION claims_search_vector_update();

-- Claim Similarities (for diff engine and Intelligence Graph)
CREATE TABLE claim_similarities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_a_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  claim_b_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  oos_a_id UUID NOT NULL REFERENCES oos_files(id) ON DELETE CASCADE,
  oos_b_id UUID NOT NULL REFERENCES oos_files(id) ON DELETE CASCADE,
  similarity_score REAL NOT NULL,
  classification similarity_class NOT NULL,
  section_match BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX sim_oos_pair_idx ON claim_similarities(oos_a_id, oos_b_id);
CREATE INDEX sim_score_idx ON claim_similarities(similarity_score);

-- Audit Logs (append-only)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  actor_type actor_type NOT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX audit_org_time_idx ON audit_logs(org_id, created_at);

-- Prevent deletes on audit logs
CREATE OR REPLACE RULE audit_no_delete AS ON DELETE TO audit_logs DO INSTEAD NOTHING;
CREATE OR REPLACE RULE audit_no_update AS ON UPDATE TO audit_logs DO INSTEAD NOTHING;
