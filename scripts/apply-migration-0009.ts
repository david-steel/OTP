// scripts/apply-migration-0009.ts
// Applies the 0009_api_keys_use_count migration, idempotently.
// Usage: railway run --service otp-platform npx tsx scripts/apply-migration-0009.ts

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
  const sqlPath = path.resolve(__dirname, '..', 'src', 'db', 'migrations', '0009_api_keys_use_count.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const client = await pool.connect();
  try {
    console.log('Applying 0009_api_keys_use_count.sql...');
    await client.query(sql);
    console.log('OK: migration applied (or column already existed -- idempotent)');

    const result = await client.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'api_keys' AND column_name = 'use_count'
    `);
    if (result.rows.length > 0) {
      console.log(`Verified: api_keys.use_count (${result.rows[0].data_type}, default ${result.rows[0].column_default})`);
    } else {
      console.error('Column not found after migration -- something went wrong');
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
