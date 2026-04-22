-- Track MCP usage count per api key. Incremented by api-key-auth middleware on every resolve.

ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS use_count integer NOT NULL DEFAULT 0;
