// scripts/apply-migration-0013.ts
// Applies 0013_kpis: 3 tables (kpis, kpi_values, kpi_dependencies) + 5 enums. Idempotent.
// Usage: railway run --service otp-platform npx tsx scripts/apply-migration-0013.ts

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
  const sqlPath = path.resolve(__dirname, '..', 'src', 'db', 'migrations', '0013_kpis.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const client = await pool.connect();
  try {
    console.log('Applying 0013_kpis.sql...');
    await client.query(sql);
    console.log('OK: migration applied (idempotent)');

    for (const tbl of ['kpis', 'kpi_values', 'kpi_dependencies']) {
      const r = await client.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position`,
        [tbl],
      );
      console.log(`Verified: ${tbl} has ${r.rows.length} columns`);
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
