-- Onboarding email sequence tracking
-- One row per Clerk signup. Records when each email in the 3-email drip has been sent.

CREATE TABLE IF NOT EXISTS onboarding_sequence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id varchar(255) NOT NULL UNIQUE,
  email varchar(255) NOT NULL,
  signup_at timestamp NOT NULL DEFAULT NOW(),
  email_1_sent_at timestamp,
  email_2_sent_at timestamp,
  email_3_sent_at timestamp,
  unsubscribed_at timestamp,
  created_at timestamp NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS onb_clerk_user_idx ON onboarding_sequence (clerk_user_id);
CREATE INDEX IF NOT EXISTS onb_email_idx ON onboarding_sequence (email);
CREATE INDEX IF NOT EXISTS onb_signup_idx ON onboarding_sequence (signup_at);
