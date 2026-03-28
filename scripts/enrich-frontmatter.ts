/**
 * Re-runs the auto-fixer's platform/MCP server detection on all published OOS files.
 * Updates frontmatter with detected tools without changing claim content.
 *
 * Usage: DATABASE_URL=... npx tsx scripts/enrich-frontmatter.ts
 */

import { db } from '../src/config/database.js';
import { oosFiles, organizations } from '../src/db/schema.js';
import { eq, sql, desc } from 'drizzle-orm';
import { autoFixOOS } from '../src/services/auto-fixer.js';
import yaml from 'js-yaml';

function parseFrontmatter(content: string): Record<string, any> {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  try { return yaml.load(match[1]) as any || {}; } catch { return {}; }
}

async function enrich() {
  const published = await db.select({
    id: oosFiles.id,
    orgName: organizations.name,
    rawContent: oosFiles.rawContent,
    frontmatter: oosFiles.frontmatter,
    version: oosFiles.version,
  })
    .from(oosFiles)
    .innerJoin(organizations, eq(oosFiles.orgId, organizations.id))
    .where(eq(oosFiles.status, 'published'))
    .orderBy(organizations.name, desc(oosFiles.version));

  console.log(`Processing ${published.length} published OOS files\n`);

  for (const oos of published) {
    const result = autoFixOOS(oos.rawContent);
    // Parse the frontmatter from the fixed content
    const newFm = parseFrontmatter(result.fixed);
    const oldFm = oos.frontmatter as any;

    const oldPlatforms = oldFm?.platforms || [];
    const newPlatforms = newFm?.platforms || [];
    const oldMcp = oldFm?.mcp_servers || [];
    const newMcp = newFm?.mcp_servers || [];

    const platformsChanged = JSON.stringify(oldPlatforms.sort()) !== JSON.stringify(newPlatforms.sort());
    const mcpChanged = newMcp.length > 0 && JSON.stringify(oldMcp.sort()) !== JSON.stringify(newMcp.sort());

    if (platformsChanged || mcpChanged) {
      const updatedFm = { ...oldFm, platforms: newPlatforms, mcp_servers: newMcp };
      await db.update(oosFiles)
        .set({ frontmatter: updatedFm, rawContent: result.fixed, updatedAt: new Date() })
        .where(eq(oosFiles.id, oos.id));

      console.log(`${oos.orgName} (v${oos.version}):`);
      if (platformsChanged) console.log(`  Platforms: ${JSON.stringify(oldPlatforms)} -> ${JSON.stringify(newPlatforms)}`);
      if (mcpChanged) console.log(`  MCP Servers: ${JSON.stringify(oldMcp)} -> ${JSON.stringify(newMcp)}`);
    } else {
      console.log(`${oos.orgName} (v${oos.version}): no changes`);
    }
  }

  console.log('\nDone!');
  process.exit(0);
}

enrich().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
