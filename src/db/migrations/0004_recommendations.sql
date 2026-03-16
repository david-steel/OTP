-- Recommendations table for the intelligence inbox / scout system
CREATE TYPE recommendation_status AS ENUM ('pending', 'accepted', 'rejected', 'adapted');
CREATE TYPE recommendation_source AS ENUM ('gap_analysis', 'similarity', 'trending', 'manual');

CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  source_claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  source_oos_id UUID NOT NULL REFERENCES oos_files(id) ON DELETE CASCADE,
  source_org_name VARCHAR(255) NOT NULL,
  status recommendation_status NOT NULL DEFAULT 'pending',
  source recommendation_source NOT NULL DEFAULT 'gap_analysis',
  relevance_score REAL NOT NULL DEFAULT 0,
  reason TEXT NOT NULL,
  section VARCHAR(100) NOT NULL,
  rule_text TEXT NOT NULL,
  why_text TEXT NOT NULL,
  failure_mode_text TEXT NOT NULL,
  confidence VARCHAR(10) NOT NULL,
  evidence VARCHAR(30) NOT NULL,
  scope_text TEXT NOT NULL,
  adapted_rule TEXT,
  adapted_why TEXT,
  review_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX rec_org_status_idx ON recommendations(org_id, status);
CREATE INDEX rec_org_created_idx ON recommendations(org_id, created_at DESC);
CREATE INDEX rec_source_claim_idx ON recommendations(source_claim_id);
