// scripts/scan-sneeze-it-pii.ts
// Runs the publish-time PII scanner against the latest Sneeze It draft so
// we can see exactly which 2 flags are blocking publish.

import { db } from '../src/config/database.js';
import { organizations, oosFiles } from '../src/db/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { scanOOSContent } from '../src/services/pii-scanner.js';

async function run() {
  const all = await db.select().from(organizations);
  const sneezeIt = all.find(o => o.name === 'Sneeze It');
  if (!sneezeIt) throw new Error('Sneeze It (exact match) org not found');
  console.log(`org: ${sneezeIt.name} (${sneezeIt.id})`);

  // Latest draft, OR latest published if no draft
  const drafts = await db
    .select()
    .from(oosFiles)
    .where(and(eq(oosFiles.orgId, sneezeIt.id), eq(oosFiles.status, 'draft')))
    .orderBy(desc(oosFiles.version))
    .limit(1);
  const target = drafts[0];
  if (!target) {
    console.log('No draft found.');
    return;
  }
  console.log(`Scanning OOS file ${target.id} v${target.version} (status=${target.status})`);
  console.log(`Raw content length: ${target.rawContent.length} chars`);

  const result = scanOOSContent(target.rawContent);
  console.log(`---`);
  console.log(`Clean: ${result.clean}`);
  console.log(`Flags: ${result.flags.length}`);
  for (const f of result.flags) {
    console.log(`  - type=${f.type} location=${f.location}`);
    console.log(`    text: ${JSON.stringify(f.text)}`);
    console.log(`    suggestion: ${JSON.stringify(f.suggestion)}`);
    if ('context' in f) console.log(`    context: ${JSON.stringify((f as any).context).slice(0, 240)}`);
  }
}

run().catch(e => { console.error(e); process.exit(1); });
