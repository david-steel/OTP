// scripts/apply-migration-0014.ts
// Widens graph_nodes.external_id from varchar(20) to varchar(120). Idempotent.

import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) { console.error('DATABASE_URL not set'); process.exit(1); }

  const pool = new Pool({ connectionString });
  const sqlPath = path.resolve(__dirname, '..', 'src', 'db', 'migrations', '0014_graph_nodes_external_id_widen.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const client = await pool.connect();
  try {
    console.log('Applying 0014_graph_nodes_external_id_widen.sql...');
    await client.query(sql);
    console.log('OK: migration applied (idempotent)');

    const r = await client.query(
      `SELECT character_maximum_length FROM information_schema.columns
       WHERE table_name='graph_nodes' AND column_name='external_id'`
    );
    console.log(`Verified: graph_nodes.external_id length is now ${r.rows[0]?.character_maximum_length}`);
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(err => { console.error('Failed:', err); process.exit(1); });
