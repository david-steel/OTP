// scripts/apply-migration-0012.ts
// Applies 0012_user_engagement_log: 1 table for re-engagement nudge tracking. Idempotent.
// Usage: railway run --service otp-platform npx tsx scripts/apply-migration-0012.ts

import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const pool = new Pool({ connectionString });
  const sqlPath = path.resolve(__dirname, '..', 'src', 'db', 'migrations', '0012_user_engagement_log.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const client = await pool.connect();
  try {
    console.log('Applying 0012_user_engagement_log.sql...');
    await client.query(sql);
    console.log('OK: migration applied (idempotent)');

    const result = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'user_engagement_log'
      ORDER BY ordinal_position
    `);
    if (result.rows.length >= 10) {
      console.log(`Verified: user_engagement_log has ${result.rows.length} columns`);
      for (const row of result.rows) console.log(`  - ${row.column_name} (${row.data_type})`);
    } else {
      console.error(`Expected >=10 columns, found ${result.rows.length}`);
      process.exit(1);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});
