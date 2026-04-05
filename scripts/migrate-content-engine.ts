/**
 * Content Engine migration: adds industry column, newsletter_subscribers, practice_votes
 * Usage: npx tsx scripts/migrate-content-engine.ts
 */
import pg from 'pg';
const { Pool } = pg;

async function migrate() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  console.log('Running Content Engine migration...');

  await pool.query(`
    ALTER TABLE best_practices ADD COLUMN IF NOT EXISTS industry VARCHAR(100);
    ALTER TABLE best_practices ADD COLUMN IF NOT EXISTS is_original BOOLEAN DEFAULT false;
    CREATE INDEX IF NOT EXISTS bp_industry_idx ON best_practices(industry);
  `);
  console.log('  best_practices: industry + is_original columns added');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) NOT NULL UNIQUE,
      source VARCHAR(50) NOT NULL DEFAULT 'homepage',
      double_opt_in_confirmed BOOLEAN NOT NULL DEFAULT false,
      confirm_token VARCHAR(64),
      token_expires_at TIMESTAMP,
      subscribed_at TIMESTAMP NOT NULL DEFAULT NOW(),
      unsubscribed_at TIMESTAMP
    );
  `);
  console.log('  newsletter_subscribers: table created');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS practice_votes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      best_practice_id UUID NOT NULL REFERENCES best_practices(id) ON DELETE CASCADE,
      voter_ip VARCHAR(45) NOT NULL,
      vote INTEGER NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
    CREATE UNIQUE INDEX IF NOT EXISTS pv_practice_idx ON practice_votes(best_practice_id, voter_ip);
  `);
  console.log('  practice_votes: table created');

  console.log('Migration complete!');
  await pool.end();
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
