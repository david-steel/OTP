-- API Keys table for MCP and programmatic access
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL DEFAULT 'Default',
  key_prefix VARCHAR(8) NOT NULL,
  key_hash VARCHAR(64) NOT NULL,
  scopes TEXT[] NOT NULL DEFAULT ARRAY['read'],
  last_used_at TIMESTAMP,
  expires_at TIMESTAMP,
  revoked_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_api_keys_hash ON api_keys(key_hash) WHERE revoked_at IS NULL;
CREATE INDEX idx_api_keys_org ON api_keys(org_id);
