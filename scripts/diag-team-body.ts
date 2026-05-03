/**
 * Print rawContent first 1500 chars of the latest archived OOS for the user-org
 * "Sneeze It" so we can see whether agents live in the markdown body.
 *
 * Usage: railway run -- npx tsx scripts/diag-team-body.ts
 */

import { db } from '../src/config/database.js';
import { oosFiles, organizations, claims } from '../src/db/schema.js';
import { eq, desc, sql } from 'drizzle-orm';

async function main() {
  const orgs = await db.select().from(organizations).where(eq(organizations.clerkOrgId, 'user_3CgTpExyG1730EwxutGzeZnjfO3'));
  if (orgs.length === 0) { console.log('no org found'); process.exit(0); }
  const org = orgs[0];
  console.log(`Org: ${org.name} (id=${org.id})\n`);

  const files = await db.select().from(oosFiles).where(eq(oosFiles.orgId, org.id)).orderBy(desc(oosFiles.version)).limit(1);
  if (files.length === 0) { console.log('no oos'); process.exit(0); }
  const f = files[0];

  console.log(`Latest: v${f.version} status=${f.status} template=${f.template}`);
  console.log(`wordCount=${f.wordCount} claimCount=${f.claimCount}`);
  console.log('\n=== rawContent (first 1500 chars) ===');
  console.log(f.rawContent.slice(0, 1500));

  console.log('\n=== claim sections (distinct, count) ===');
  const sections = await db.execute(sql`
    SELECT section, COUNT(*) as count FROM claims WHERE oos_file_id = ${f.id} GROUP BY section ORDER BY count DESC
  `);
  for (const r of sections.rows as any[]) {
    console.log(`  ${r.section}  ×${r.count}`);
  }

  console.log('\n=== first 3 claims (any section) with their content ===');
  const sample = await db.select().from(claims).where(eq(claims.oosFileId, f.id)).limit(3);
  for (const c of sample) {
    console.log(`  [${c.claimId}] section=${c.section}`);
    console.log(`     rule: ${c.rule.slice(0, 120)}`);
  }

  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
