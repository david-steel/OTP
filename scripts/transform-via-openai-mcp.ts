/**
 * Reads a pre-transformed results file and updates the database.
 * Input: JSON array of { id, definition } objects.
 *
 * Usage: DATABASE_URL=... npx tsx scripts/transform-via-openai-mcp.ts results-0.json results-1.json ...
 */

async function main() {
  const { readFileSync } = await import('fs');
  const { Client } = await import('pg');

  const files = process.argv.slice(2);
  if (files.length === 0) { console.error('Provide result file paths'); process.exit(1); }

  const c = new Client(process.env.DATABASE_URL);
  await c.connect();

  let totalUpdated = 0;

  for (const file of files) {
    const rules: Array<{ id: string; definition: string }> = JSON.parse(readFileSync(file, 'utf-8'));
    let updated = 0;
    for (const rule of rules) {
      if (rule.id && rule.definition) {
        await c.query('UPDATE best_practices SET definition = $1, updated_at = NOW() WHERE id = $2', [rule.definition, rule.id]);
        updated++;
      }
    }
    console.log(`${file}: updated ${updated}`);
    totalUpdated += updated;
  }

  console.log(`Total updated: ${totalUpdated}`);
  await c.end();
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
