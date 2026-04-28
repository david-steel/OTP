// scripts/apply-migration-0010.ts
// Applies 0010_subscriber_conversion: extends newsletter_subscribers with name, notes,
// converted_at, converted_clerk_user_id, resend_contact_id columns. Idempotent.
// Usage: railway run --service otp-platform npx tsx scripts/apply-migration-0010.ts

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
  const sqlPath = path.resolve(__dirname, '..', 'src', 'db', 'migrations', '0010_subscriber_conversion.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const client = await pool.connect();
  try {
    console.log('Applying 0010_subscriber_conversion.sql...');
    await client.query(sql);
    console.log('OK: migration applied (idempotent)');

    const result = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'newsletter_subscribers'
        AND column_name IN ('name','notes','converted_at','converted_clerk_user_id','resend_contact_id')
      ORDER BY column_name
    `);
    if (result.rows.length === 5) {
      console.log('Verified: 5 new columns present');
      for (const row of result.rows) console.log(`  - ${row.column_name} (${row.data_type})`);
    } else {
      console.error(`Expected 5 columns, found ${result.rows.length}`);
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
