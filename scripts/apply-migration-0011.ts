// scripts/apply-migration-0011.ts
// Applies 0011_oos_operating_plan: 4 tables + 6 enums for the OOS Operating Plan feature.
// Idempotent (CREATE TYPE wrapped in DO blocks; CREATE TABLE IF NOT EXISTS).
// Usage: railway run --service otp-platform npx tsx scripts/apply-migration-0011.ts

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
  const sqlPath = path.resolve(__dirname, '..', 'src', 'db', 'migrations', '0011_oos_operating_plan.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const client = await pool.connect();
  try {
    console.log('Applying 0011_oos_operating_plan.sql...');
    await client.query(sql);
    console.log('OK: migration applied (idempotent)');

    const tableResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN (
          'oos_operating_plans',
          'oos_operating_plan_sections',
          'oos_execution_items',
          'oos_plan_sync_events'
        )
      ORDER BY table_name
    `);
    if (tableResult.rows.length === 4) {
      console.log('Verified: 4 tables present');
      for (const row of tableResult.rows) console.log(`  - ${row.table_name}`);
    } else {
      console.error(`Expected 4 tables, found ${tableResult.rows.length}`);
      process.exit(1);
    }

    const enumResult = await client.query(`
      SELECT typname
      FROM pg_type
      WHERE typname IN (
        'oos_plan_status',
        'oos_plan_section_key',
        'oos_item_priority',
        'oos_item_status',
        'oos_owner_type',
        'oos_sync_type'
      )
      ORDER BY typname
    `);
    if (enumResult.rows.length === 6) {
      console.log('Verified: 6 enum types present');
      for (const row of enumResult.rows) console.log(`  - ${row.typname}`);
    } else {
      console.error(`Expected 6 enums, found ${enumResult.rows.length}`);
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
