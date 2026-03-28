/**
 * Batch transformer -- reads a JSON file of OpenAI-transformed rules
 * and updates the database.
 *
 * Usage: DATABASE_URL=... npx tsx scripts/transform-batch.ts data/transformed-rules.json
 *
 * The JSON file should be: [{ id: "uuid", rule: "...", why: "...", fail: "..." }, ...]
 */

async function main() {
  const { readFileSync } = await import('fs');
  const { Client } = await import('pg');

  const filePath = process.argv[2];
  if (!filePath) { console.error('Provide path to transformed rules JSON'); process.exit(1); }

  const rules: Array<{ id: string; definition: string }> = JSON.parse(readFileSync(filePath, 'utf-8'));
  console.log(`Loaded ${rules.length} transformed rules`);

  const c = new Client(process.env.DATABASE_URL);
  await c.connect();

  let updated = 0;
  for (const rule of rules) {
    await c.query('UPDATE best_practices SET definition = $1, updated_at = NOW() WHERE id = $2', [rule.definition, rule.id]);
    updated++;
  }

  console.log(`Updated ${updated} practices`);
  await c.end();
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
