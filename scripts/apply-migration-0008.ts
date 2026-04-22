// scripts/apply-migration-0008.ts
// Applies only the 0008_onboarding_sequence migration, idempotently.
// Usage: railway run --service otp-platform npx tsx scripts/apply-migration-0008.ts

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
  const sqlPath = path.resolve(__dirname, '..', 'src', 'db', 'migrations', '0008_onboarding_sequence.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const client = await pool.connect();
  try {
    console.log('Applying 0008_onboarding_sequence.sql...');
    await client.query(sql);
    console.log('OK: migration applied');

    const result = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'onboarding_sequence'
      ORDER BY ordinal_position
    `);
    console.log(`\nVerified table onboarding_sequence has ${result.rows.length} columns:`);
    for (const row of result.rows) {
      console.log(`  - ${row.column_name} (${row.data_type})`);
    }
  } catch (err) {
    const e = err as Error;
    if (e.message.includes('already exists')) {
      console.log('SKIP: table already exists (migration already applied)');
    } else {
      throw e;
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
