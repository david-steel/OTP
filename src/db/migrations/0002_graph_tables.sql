-- OTP Graph Layer Migration
-- Stores the Organizational Intelligence Graph as nodes and edges in PostgreSQL
-- Phase 1-3: PostgreSQL. Phase 4+: evaluate Neo4j migration if query complexity justifies.

CREATE TYPE graph_node_type AS ENUM (
  'agent', 'human', 'role', 'system', 'task',
  'process', 'decision', 'knowledge_claim', 'organization'
);

CREATE TYPE graph_edge_type AS ENUM (
  'delegates_to', 'depends_on', 'conflicts_with', 'overrides',
  'escalates_to', 'part_of', 'learns_from', 'similar_to',
  'hands_off_to', 'approves', 'accesses', 'produces', 'consumes'
);

-- Graph Nodes
CREATE TABLE graph_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id VARCHAR(20) NOT NULL,      -- AGT-001, HMN-001, SYS-001, C001, etc.
  type graph_node_type NOT NULL,
  label VARCHAR(500) NOT NULL,            -- Display name
  properties JSONB NOT NULL DEFAULT '{}', -- All entity properties stored here
  oos_file_id UUID NOT NULL REFERENCES oos_files(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX gn_type_idx ON graph_nodes(type);
CREATE INDEX gn_oos_idx ON graph_nodes(oos_file_id);
CREATE INDEX gn_org_idx ON graph_nodes(org_id);
CREATE INDEX gn_external_idx ON graph_nodes(external_id);
CREATE UNIQUE INDEX gn_oos_external_idx ON graph_nodes(oos_file_id, external_id);

-- Full-text search on node labels and properties
ALTER TABLE graph_nodes ADD COLUMN search_vector TSVECTOR;

CREATE OR REPLACE FUNCTION graph_nodes_search_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.label, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.properties->>'role', '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.properties->>'mission', '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER graph_nodes_search_trigger
  BEFORE INSERT OR UPDATE ON graph_nodes
  FOR EACH ROW EXECUTE FUNCTION graph_nodes_search_update();

CREATE INDEX gn_search_idx ON graph_nodes USING GIN(search_vector);

-- Graph Edges
CREATE TABLE graph_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES graph_nodes(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES graph_nodes(id) ON DELETE CASCADE,
  type graph_edge_type NOT NULL,
  properties JSONB NOT NULL DEFAULT '{}',
  oos_file_id UUID NOT NULL REFERENCES oos_files(id) ON DELETE CASCADE,
  weight REAL NOT NULL DEFAULT 1.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ge_source_idx ON graph_edges(source_id);
CREATE INDEX ge_target_idx ON graph_edges(target_id);
CREATE INDEX ge_type_idx ON graph_edges(type);
CREATE INDEX ge_oos_idx ON graph_edges(oos_file_id);
CREATE INDEX ge_source_type_idx ON graph_edges(source_id, type);

-- Cross-org similarity edges (computed by similarity detector)
-- These connect nodes from DIFFERENT organizations
CREATE TABLE cross_org_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_node_id UUID NOT NULL REFERENCES graph_nodes(id) ON DELETE CASCADE,
  target_node_id UUID NOT NULL REFERENCES graph_nodes(id) ON DELETE CASCADE,
  source_org_id UUID NOT NULL REFERENCES organizations(id),
  target_org_id UUID NOT NULL REFERENCES organizations(id),
  type graph_edge_type NOT NULL DEFAULT 'similar_to',
  similarity_score REAL NOT NULL,
  properties JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT cross_org_check CHECK (source_org_id != target_org_id)
);

CREATE INDEX coe_source_org_idx ON cross_org_edges(source_org_id);
CREATE INDEX coe_target_org_idx ON cross_org_edges(target_org_id);
CREATE INDEX coe_score_idx ON cross_org_edges(similarity_score);

-- Materialized view for pattern detection (refreshed periodically)
CREATE MATERIALIZED VIEW coordination_patterns AS
SELECT
  ge.type AS edge_type,
  sn.type AS source_type,
  tn.type AS target_type,
  sn.properties->>'authority_level' AS source_authority,
  COUNT(DISTINCT ge.oos_file_id) AS org_count,
  COUNT(*) AS instance_count,
  ARRAY_AGG(DISTINCT o.industry) AS industries
FROM graph_edges ge
JOIN graph_nodes sn ON ge.source_id = sn.id
JOIN graph_nodes tn ON ge.target_id = tn.id
JOIN oos_files f ON ge.oos_file_id = f.id
JOIN organizations o ON f.org_id = o.id
WHERE f.status = 'published'
  -- Private-plan enforcement: private orgs never contribute to cross-org
  -- coordination patterns. The view is refreshed on every publish (oos.ts),
  -- and the boot DDL (ensure-org-privacy.ts) rebuilds it with this filter on
  -- existing databases where this column post-dates the view.
  AND o.is_private IS NOT TRUE
GROUP BY ge.type, sn.type, tn.type, sn.properties->>'authority_level'
HAVING COUNT(DISTINCT ge.oos_file_id) >= 2;

CREATE UNIQUE INDEX cp_pattern_idx ON coordination_patterns(edge_type, source_type, target_type, source_authority);
