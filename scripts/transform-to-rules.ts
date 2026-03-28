/**
 * Transform best practice definitions into actionable rules.
 *
 * Reads definitions from the database, uses Claude to generate
 * prescriptive rules in OOS claim format, updates the database.
 *
 * Usage: DATABASE_URL=... ANTHROPIC_API_KEY=... npx tsx scripts/transform-to-rules.ts
 *        DATABASE_URL=... ANTHROPIC_API_KEY=... npx tsx scripts/transform-to-rules.ts --limit 50
 *        DATABASE_URL=... ANTHROPIC_API_KEY=... npx tsx scripts/transform-to-rules.ts --publisher "Google"
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();
const BATCH_SIZE = 10; // Process 10 at a time
const MODEL = 'claude-sonnet-4-6';

interface BestPractice {
  id: string;
  term: string;
  definition: string;
  category: string;
}

interface TransformedRule {
  rule: string;
  why: string;
  failureMode: string;
}

async function transformBatch(practices: BestPractice[]): Promise<Map<string, TransformedRule>> {
  const results = new Map<string, TransformedRule>();

  const practiceList = practices.map((p, i) =>
    `[${i + 1}] Term: ${p.term}\nCategory: ${p.category}\nDefinition: ${p.definition.substring(0, 500)}`
  ).join('\n\n');

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `You are converting AI glossary definitions into actionable best practice rules for organizations building AI agent systems.

For each definition below, generate ONE prescriptive rule in this exact format:

[N] RULE: [Imperative statement -- what to do or not do. Start with a verb. Be specific and actionable.]
WHY: [One sentence explaining the business/operational reason.]
FAIL: [One sentence describing what goes wrong if you don't follow this rule.]

Guidelines:
- Rules must be actionable directives, not definitions. "Implement X when Y" not "X is a concept that..."
- Use imperative voice: "Always...", "Never...", "Use X to...", "Monitor Y for..."
- Be specific to AI/agent operations, not generic business advice
- If the term is a tool/product name, the rule should be about when/how to use that category of tool
- Keep each part to 1-2 sentences max

${practiceList}

Output ONLY the numbered rules in the exact format above. No preamble, no commentary.`
    }],
  });

  const text = (response.content[0] as any).text || '';

  // Parse response
  const ruleRegex = /\[(\d+)\]\s*RULE:\s*([\s\S]*?)(?=WHY:)\s*WHY:\s*([\s\S]*?)(?=FAIL:)\s*FAIL:\s*([\s\S]*?)(?=\[\d+\]|$)/gi;
  let match;
  while ((match = ruleRegex.exec(text)) !== null) {
    const idx = parseInt(match[1]) - 1;
    if (idx >= 0 && idx < practices.length) {
      results.set(practices[idx].id, {
        rule: match[2].trim(),
        why: match[3].trim(),
        failureMode: match[4].trim(),
      });
    }
  }

  return results;
}

async function main() {
  const { db } = await import('../src/config/database.js');
  const { bestPractices } = await import('../src/db/schema.js');
  const { eq, sql, desc, and, isNull } = await import('drizzle-orm');

  const args = process.argv.slice(2);
  const limitArg = args.indexOf('--limit');
  const limit = limitArg >= 0 ? parseInt(args[limitArg + 1]) : 99999;
  const publisherArg = args.indexOf('--publisher');
  const publisherFilter = publisherArg >= 0 ? args[publisherArg + 1] : null;

  // Get practices that haven't been transformed yet
  // We'll use metadata to track transformation
  let query = `
    SELECT bp.id, bp.term, bp.definition, bp.category
    FROM best_practices bp
    WHERE bp.definition NOT LIKE 'RULE:%'
      AND bp.definition NOT LIKE 'Always %'
      AND bp.definition NOT LIKE 'Never %'
      AND bp.definition NOT LIKE 'Use %to%'
      AND bp.definition NOT LIKE 'Implement %'
      AND bp.definition NOT LIKE 'Monitor %'
      AND LENGTH(bp.definition) > 30
  `;

  if (publisherFilter) {
    query += ` AND bp.publisher_profile_id IN (SELECT id FROM consultant_profiles WHERE display_name = '${publisherFilter.replace(/'/g, "''")}')`;
  }

  query += ` ORDER BY bp.term LIMIT ${limit}`;

  const { Client } = await import('pg');
  const c = new Client(process.env.DATABASE_URL);
  await c.connect();

  const result = await c.query(query);
  const practices: BestPractice[] = result.rows.map(r => ({
    id: r.id,
    term: r.term,
    definition: r.definition,
    category: r.category,
  }));

  console.log(`Found ${practices.length} practices to transform\n`);

  let transformed = 0;
  let failed = 0;

  for (let i = 0; i < practices.length; i += BATCH_SIZE) {
    const batch = practices.slice(i, i + BATCH_SIZE);
    try {
      const results = await transformBatch(batch);

      for (const [id, rule] of results) {
        const newDefinition = `${rule.rule}\n\nWhy: ${rule.why}\n\nFailure mode: ${rule.failureMode}`;
        await c.query(
          'UPDATE best_practices SET definition = $1, updated_at = NOW() WHERE id = $2',
          [newDefinition, id]
        );
        transformed++;
      }

      // Track which ones didn't get transformed
      for (const p of batch) {
        if (!results.has(p.id)) failed++;
      }
    } catch (err: any) {
      console.error(`  Batch error at ${i}: ${err.message}`);
      failed += batch.length;
    }

    const done = Math.min(i + BATCH_SIZE, practices.length);
    const pct = Math.round((done / practices.length) * 100);
    process.stdout.write(`\r  Transformed ${transformed}/${practices.length} (${pct}%) [${failed} failed]`);

    // Small delay to respect rate limits
    if (i + BATCH_SIZE < practices.length) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  console.log(`\n\nDone! Transformed: ${transformed}, Failed: ${failed}`);

  // Show a sample
  const sample = await c.query("SELECT term, definition FROM best_practices WHERE definition LIKE '%Why:%' ORDER BY random() LIMIT 3");
  console.log('\nSample transformed:');
  sample.rows.forEach(r => {
    console.log(`\n  ${r.term}:`);
    console.log(`  ${r.definition.substring(0, 200)}...`);
  });

  await c.end();
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
