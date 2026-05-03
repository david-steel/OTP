/**
 * Repair: for any OOS file whose rawContent YAML contains entities.agents or
 * entities.humans but whose frontmatter JSONB column is missing them (because
 * an earlier patchTeamEntity stripped them via Zod), re-parse the YAML and
 * rewrite the frontmatter column with the full object.
 *
 * Idempotent. Safe to run multiple times. Read-only on rawContent.
 *
 * Usage: railway run -- npx tsx scripts/repair-team-frontmatter.ts
 */

import { parse as parseYAML } from 'yaml';
import { db } from '../src/config/database.js';
import { oosFiles } from '../src/db/schema.js';
import { eq } from 'drizzle-orm';

const FM_SPLIT = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;

async function main() {
  const all = await db.select().from(oosFiles);
  console.log(`Scanning ${all.length} OOS files…\n`);

  let repaired = 0;
  let skipped = 0;
  let badFm = 0;

  for (const f of all) {
    const m = f.rawContent.match(FM_SPLIT);
    if (!m) { badFm++; continue; }
    let fm: any;
    try { fm = parseYAML(m[1]) || {}; } catch { badFm++; continue; }
    const rawHasEntities = fm && fm.entities && (
      (Array.isArray(fm.entities.agents) && fm.entities.agents.length > 0) ||
      (Array.isArray(fm.entities.humans) && fm.entities.humans.length > 0)
    );
    if (!rawHasEntities) { skipped++; continue; }

    const colFm: any = f.frontmatter || {};
    const colHasEntities = colFm && colFm.entities && (
      (Array.isArray(colFm.entities.agents) && colFm.entities.agents.length > 0) ||
      (Array.isArray(colFm.entities.humans) && colFm.entities.humans.length > 0)
    );

    if (colHasEntities) { skipped++; continue; }

    await db.update(oosFiles).set({ frontmatter: fm as any, updatedAt: new Date() }).where(eq(oosFiles.id, f.id));
    repaired++;
    const a = fm.entities.agents?.length || 0;
    const h = fm.entities.humans?.length || 0;
    console.log(`  repaired ${f.id} (org=${f.orgId} v${f.version} status=${f.status}): restored ${a} agents, ${h} humans`);
  }

  console.log(`\nDone. repaired=${repaired} skipped=${skipped} badFrontmatter=${badFm} total=${all.length}`);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
