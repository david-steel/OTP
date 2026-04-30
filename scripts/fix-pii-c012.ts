// scripts/fix-pii-c012.ts
// Replaces a specific dollar-amount phrase in Sneeze It's latest draft so
// the publish PII gate clears. Re-parses to verify before writing.
//
// Original:    "above $2,000/month spend"
// Replacement: "above the base monthly spend tier"

import { db } from '../src/config/database.js';
import { organizations, oosFiles } from '../src/db/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { parseOOS } from '../src/services/claim-parser.js';
import { scanOOSContent } from '../src/services/pii-scanner.js';

const FIND = 'above $2,000/month spend';
const REPLACE = 'above the base monthly spend tier';

async function run() {
  const all = await db.select().from(organizations);
  const sneezeIt = all.find(o => o.name === 'Sneeze It');
  if (!sneezeIt) throw new Error('Sneeze It not found');

  const [draft] = await db
    .select()
    .from(oosFiles)
    .where(and(eq(oosFiles.orgId, sneezeIt.id), eq(oosFiles.status, 'draft')))
    .orderBy(desc(oosFiles.version))
    .limit(1);
  if (!draft) throw new Error('no draft');

  const before = draft.rawContent;
  const occurrences = (before.match(new RegExp(FIND.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  console.log(`Occurrences of ${JSON.stringify(FIND)}: ${occurrences}`);
  if (occurrences === 0) {
    console.log('Nothing to do — phrase not present.');
    return;
  }

  const after = before.split(FIND).join(REPLACE);
  console.log(`Char delta: ${after.length - before.length} (${after.length} chars total)`);

  // Safety: parse the new content, refuse if it breaks
  const parsed = parseOOS(after, draft.template as any);
  const blocking = parsed.errors.find((e: any) => e.code === 'MISSING_FRONTMATTER' || e.code === 'FRONTMATTER_PARSE_ERROR');
  if (blocking) throw new Error(`Replacement broke parse: ${blocking.message}`);

  // Confirm PII gate now clean
  const pii = scanOOSContent(after);
  console.log(`PII clean after replacement: ${pii.clean} (${pii.flags.length} flags)`);
  if (!pii.clean) {
    console.log('Remaining flags:');
    for (const f of pii.flags) console.log(`  - ${f.type}: ${JSON.stringify(f.text)}`);
  }

  await db
    .update(oosFiles)
    .set({
      rawContent: after,
      wordCount: parsed.wordCount,
      claimCount: parsed.claims.length,
      updatedAt: new Date(),
    })
    .where(eq(oosFiles.id, draft.id));
  console.log(`Draft ${draft.id} v${draft.version} updated. Try Publish again.`);
}

run().catch(e => { console.error(e); process.exit(1); });
