-- Coordination Intelligence Content Filter Migration
-- Tags existing best practices with is_coordination flag.
-- OTP's identity: "Where Agents Learn to Work as a Team."
-- Only coordination-related practices belong in the default view.

ALTER TABLE best_practices ADD COLUMN is_coordination BOOLEAN;

-- Index for filtering by coordination flag
CREATE INDEX bp_is_coordination_idx ON best_practices(is_coordination);
