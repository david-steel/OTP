// Archive non-coordination best practices using the coordination filter service.
// Runs isCoordinationIntelligence() against every row and sets is_coordination accordingly.
// Usage: DATABASE_URL="..." npx tsx scripts/archive-non-coordination.ts

import pg from 'pg';
import { isCoordinationIntelligence } from '../src/services/coordination-filter.js';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL required');
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: DATABASE_URL });

async function run() {
  const client = await pool.connect();
  try {
    // Step 0: Ensure column exists (idempotent)
    await client.query('ALTER TABLE best_practices ADD COLUMN IF NOT EXISTS is_coordination BOOLEAN');
    await client.query('CREATE INDEX IF NOT EXISTS bp_is_coordination_idx ON best_practices(is_coordination)');
    console.log('Column is_coordination ensured.\n');

    // Step 1: Fetch all best practices
    const { rows } = await client.query<{ id: string; term: string; definition: string }>(
      'SELECT id, term, definition FROM best_practices ORDER BY term'
    );
    console.log(`Total best practices: ${rows.length}\n`);

    let coordCount = 0;
    let notCoordCount = 0;

    // Step 2: Run filter against each practice and batch update
    for (const row of rows) {
      const result = isCoordinationIntelligence(row.term, row.definition);
      const flag = result.passes;

      await client.query(
        'UPDATE best_practices SET is_coordination = $1 WHERE id = $2',
        [flag, row.id]
      );

      if (flag) {
        coordCount++;
      } else {
        notCoordCount++;
        // Log rejected terms for visibility
        console.log(`  REJECT [${result.score.toFixed(2)}] ${row.term}`);
        console.log(`         ${result.reason}\n`);
      }
    }

    // Step 3: Report final counts
    console.log('\n--- FINAL COUNTS ---');
    console.log(`Total:            ${rows.length}`);
    console.log(`Coordination:     ${coordCount}`);
    console.log(`Not coordination: ${notCoordCount}`);
    console.log(`Pass rate:        ${((coordCount / rows.length) * 100).toFixed(1)}%`);
    console.log('\nDone.');
  } catch (e) {
    console.error('Failed:', e);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
