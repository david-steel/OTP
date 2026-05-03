/**
 * Diagnostic: print the shape of every org's latest OOS frontmatter so we can
 * see whether entities.agents / entities.humans is populated, and what the
 * raw structure looks like.
 *
 * Usage: DATABASE_URL=... npx tsx scripts/diag-team.ts [orgNameSubstring]
 */

import { db } from '../src/config/database.js';
import { oosFiles, organizations } from '../src/db/schema.js';
import { eq, desc, ilike } from 'drizzle-orm';

async function main() {
  const filter = process.argv[2];
  const orgs = filter
    ? await db.select().from(organizations).where(ilike(organizations.name, `%${filter}%`))
    : await db.select().from(organizations);

  console.log(`Inspecting ${orgs.length} org(s)${filter ? ` matching "${filter}"` : ''}\n`);

  for (const org of orgs) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Org: ${org.name}  (id=${org.id}  clerkOrgId=${org.clerkOrgId})`);
    const files = await db.select().from(oosFiles)
      .where(eq(oosFiles.orgId, org.id))
      .orderBy(desc(oosFiles.version))
      .limit(5);

    if (files.length === 0) {
      console.log('  no OOS files');
      continue;
    }

    for (const f of files) {
      const fm: any = f.frontmatter || {};
      const ents = fm.entities || {};
      const agents = Array.isArray(ents.agents) ? ents.agents : [];
      const humans = Array.isArray(ents.humans) ? ents.humans : [];
      console.log(`  v${f.version}  status=${f.status}  template=${f.template}  name=${f.name || '(unnamed)'}`);
      console.log(`     entities.agents = ${agents.length}, entities.humans = ${humans.length}`);
      const fmKeys = Object.keys(fm).slice(0, 12);
      console.log(`     frontmatter top-level keys: ${fmKeys.join(', ')}`);
      if (fm.entities) {
        const eKeys = Object.keys(fm.entities);
        console.log(`     entities sub-keys: ${eKeys.join(', ') || '(empty object)'}`);
      } else {
        console.log(`     entities: <missing>`);
      }
      if (agents.length > 0) {
        const a0 = agents[0];
        console.log(`     sample agent: id=${a0.id || a0.external_id || '?'} name=${a0.name || '?'} role=${a0.role || '?'}`);
      }
      if (humans.length > 0) {
        const h0 = humans[0];
        console.log(`     sample human: id=${h0.id || h0.external_id || '?'} name=${h0.name || '?'} role=${h0.role || '?'}`);
      }
    }
  }

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
