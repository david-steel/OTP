// scripts/find-pii-context.ts
// Locates the offending PII string in the latest Sneeze It draft and prints
// the surrounding lines so we can identify which entity / field carries it.

import { db } from '../src/config/database.js';
import { organizations, oosFiles } from '../src/db/schema.js';
import { eq, and, desc } from 'drizzle-orm';

const NEEDLE = '$2,000/mo';

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
  if (!draft) { console.log('no draft'); return; }

  const lines = draft.rawContent.split('\n');
  console.log(`Searching ${lines.length} lines for ${JSON.stringify(NEEDLE)}`);
  console.log('---');
  let count = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(NEEDLE)) {
      count += 1;
      const start = Math.max(0, i - 6);
      const end = Math.min(lines.length, i + 2);
      console.log(`Match at line ${i + 1}:`);
      for (let j = start; j < end; j++) {
        const marker = j === i ? '>> ' : '   ';
        console.log(`${marker}${j + 1}: ${lines[j]}`);
      }
      console.log('');
    }
  }
  console.log(`Total matches: ${count}`);
}

run().catch(e => { console.error(e); process.exit(1); });
