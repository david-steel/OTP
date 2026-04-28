-- Pre-signup subscriber tracking: founder-added contacts and conversion to real users
-- Extends newsletter_subscribers with name, notes, and Clerk-conversion fields.

ALTER TABLE newsletter_subscribers
  ADD COLUMN IF NOT EXISTS name varchar(200),
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS converted_at timestamp,
  ADD COLUMN IF NOT EXISTS converted_clerk_user_id varchar(255),
  ADD COLUMN IF NOT EXISTS resend_contact_id varchar(64);

CREATE INDEX IF NOT EXISTS ns_converted_idx ON newsletter_subscribers (converted_at);
CREATE INDEX IF NOT EXISTS ns_source_idx ON newsletter_subscribers (source);
