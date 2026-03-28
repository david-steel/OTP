-- Best Practices & Publisher Expert Ecosystem Migration
-- Adds publisher profiles, best practices library, and OOS-to-best-practice relevance matching

-- Expert type enum for consultant_profiles (consultant vs publisher)
ALTER TABLE consultant_profiles ADD COLUMN profile_type VARCHAR(20) NOT NULL DEFAULT 'consultant';
CREATE INDEX cp_profile_type_idx ON consultant_profiles(profile_type);

-- Publisher-specific fields
ALTER TABLE consultant_profiles ADD COLUMN content_source_url TEXT;
ALTER TABLE consultant_profiles ADD COLUMN content_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE consultant_profiles ADD COLUMN publisher_description TEXT;
ALTER TABLE consultant_profiles ADD COLUMN last_synced_at TIMESTAMPTZ;

-- Best Practices table
CREATE TABLE best_practices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publisher_profile_id UUID REFERENCES consultant_profiles(id) ON DELETE CASCADE,
  slug VARCHAR(255) NOT NULL,
  term VARCHAR(500) NOT NULL,
  definition TEXT NOT NULL,
  category VARCHAR(255) NOT NULL DEFAULT 'General',
  related_terms TEXT[] DEFAULT '{}',
  source_url TEXT NOT NULL,
  canonical_url TEXT,
  last_updated_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(publisher_profile_id, slug)
);

CREATE INDEX bp_publisher_idx ON best_practices(publisher_profile_id);
CREATE INDEX bp_category_idx ON best_practices(category);
CREATE INDEX bp_term_idx ON best_practices(term);

-- Full-text search on best practices
ALTER TABLE best_practices ADD COLUMN search_vector tsvector;
CREATE INDEX bp_search_idx ON best_practices USING GIN(search_vector);

CREATE OR REPLACE FUNCTION bp_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.term, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.category, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.definition, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bp_search_vector_trigger
  BEFORE INSERT OR UPDATE ON best_practices
  FOR EACH ROW EXECUTE FUNCTION bp_search_vector_update();

-- OOS-to-Best-Practice relevance mapping (computed matches)
CREATE TABLE oos_best_practice_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oos_file_id UUID NOT NULL REFERENCES oos_files(id) ON DELETE CASCADE,
  best_practice_id UUID NOT NULL REFERENCES best_practices(id) ON DELETE CASCADE,
  relevance_score REAL NOT NULL DEFAULT 0,
  matched_claims TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(oos_file_id, best_practice_id)
);

CREATE INDEX obpm_oos_idx ON oos_best_practice_matches(oos_file_id);
CREATE INDEX obpm_bp_idx ON oos_best_practice_matches(best_practice_id);
CREATE INDEX obpm_score_idx ON oos_best_practice_matches(relevance_score);
