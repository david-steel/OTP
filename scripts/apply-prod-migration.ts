// Applies scripts/prod-migrate-l10.sql to the database the env is currently pointed at.
// SAFETY: The SQL is wrapped in BEGIN/COMMIT, so a failure rolls back. All
// statements use IF NOT EXISTS / duplicate_object guards.
//
// Usage: railway run npx tsx scripts/apply-prod-migration.ts

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL not in env. Run via: railway run npx tsx scripts/apply-prod-migration.ts');
  process.exit(1);
}

const sqlPath = path.join(__dirname, 'prod-migrate-l10.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

const safeHost = url.replace(/postgresql:\/\/[^@]+@/, 'postgresql://<redacted>@').replace(/:\d+\/.*/, ':****/****');
console.log('Applying migration to:', safeHost);
console.log(`SQL: ${sqlPath} (${sql.length} bytes)`);

const client = new pg.Client({ connectionString: url });

async function main() {
  await client.connect();
  console.log('\n--- BEGIN ---');
  await client.query(sql);
  console.log('--- COMMIT (migration applied) ---\n');
  await client.end();
}

main().catch(async err => {
  console.error('\n!! Migration failed:', err.message);
  console.error('   Detail:', (err as any).detail || '(no detail)');
  console.error('   Hint  :', (err as any).hint || '(no hint)');
  console.error('   Where :', (err as any).where || '(no where)');
  console.error('\nThe BEGIN/COMMIT wrapper means nothing was committed. Prod is unchanged.');
  try { await client.end(); } catch {}
  process.exit(1);
});
