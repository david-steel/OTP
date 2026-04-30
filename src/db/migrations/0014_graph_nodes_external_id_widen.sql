-- Widen graph_nodes.external_id to match the team-graph patch schema (varchar(120)).
-- Original column was varchar(20), sized for the early "AGT-001 / HMN-001 / C001"
-- short-id convention. Real-world publishers generate names like
-- AGT_ANASTASIIAMEDIANYK (22 chars), so the publish flow 500'd on graph node
-- insert AFTER the OOS status had already flipped to 'published' (no transaction
-- around the post-publish graph rebuild).
--
-- Idempotent: ALTER TYPE is a no-op if the column is already wider.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'graph_nodes'
      AND column_name = 'external_id'
      AND character_maximum_length < 120
  ) THEN
    ALTER TABLE graph_nodes ALTER COLUMN external_id TYPE VARCHAR(120);
  END IF;
END $$;
