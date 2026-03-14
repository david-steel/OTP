// Quick health check -- verifies database connection and table structure
// Usage: npx tsx scripts/healthcheck.ts

import pg from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL required');
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: DATABASE_URL });

async function check() {
  const client = await pool.connect();
  try {
    // Database connection
    const version = await client.query('SELECT version()');
    console.log('DB connected:', version.rows[0].version.split(',')[0]);

    // Tables
    const tables = await client.query(`SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`);
    console.log('Tables:', tables.rows.map(r => r.tablename).join(', '));

    // Counts
    const orgs = await client.query('SELECT COUNT(*) AS c FROM organizations');
    const oos = await client.query('SELECT COUNT(*) AS c FROM oos_files WHERE status = \'published\'');
    const cls = await client.query('SELECT COUNT(*) AS c FROM claims');

    console.log(`Data: ${orgs.rows[0].c} orgs, ${oos.rows[0].c} published OOS, ${cls.rows[0].c} claims`);

    // FTS check
    const fts = await client.query(`SELECT COUNT(*) AS c FROM claims WHERE search_vector IS NOT NULL`);
    console.log(`FTS indexed: ${fts.rows[0].c} claims`);

    console.log('\nHealth: OK');
  } catch (e) {
    console.error('Health check failed:', e);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

check();
