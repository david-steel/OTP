-- user_engagement_log: tracks every re-engagement nudge sent to a user or pre-signup.
-- Frequency cap: max 4 nudges per trailing 30 days, with at least 7 days between nudges.
-- This is NOT for product-update broadcasts (those are one-shot launch sends).
-- Pre-signups have clerk_user_id NULL; Clerk users always have it set.

CREATE TABLE IF NOT EXISTS user_engagement_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email varchar(255) NOT NULL,
  clerk_user_id varchar(255),                    -- NULL for pre-signups
  last_sign_in_at_at_send timestamp,             -- snapshot of user's last_sign_in_at when nudge fired (NULL for pre-signups)
  segment varchar(50) NOT NULL,                  -- 'pre_signup' / 'clerk_pre_oos' / 'clerk_post_oos'
  template_key varchar(100) NOT NULL,            -- which template was rendered
  sent_at timestamp NOT NULL DEFAULT NOW(),
  send_status varchar(20) NOT NULL DEFAULT 'sent',  -- 'sent' / 'failed'
  send_error text,
  created_at timestamp NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS uel_email_idx ON user_engagement_log (user_email);
CREATE INDEX IF NOT EXISTS uel_email_sent_idx ON user_engagement_log (user_email, sent_at);
CREATE INDEX IF NOT EXISTS uel_clerk_user_idx ON user_engagement_log (clerk_user_id);
CREATE INDEX IF NOT EXISTS uel_segment_idx ON user_engagement_log (segment);
CREATE INDEX IF NOT EXISTS uel_sent_at_idx ON user_engagement_log (sent_at);
