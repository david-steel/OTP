// Re-parse oos_files.raw_content for v20 (Sneeze It) and overwrite the
// oos_files.frontmatter JSON column to match. This is needed because the team
// chart reads from frontmatter (a snapshot), not raw_content. Direct raw_content
// edits (Steve restore, SOPs seed) bypassed the normal write path that keeps
// both in sync.
//
// Usage: SNEEZE_ORG_ID=<uuid> railway run npx tsx scripts/sync-frontmatter-from-raw.ts

import pg from 'pg';
import * as YAML from 'yaml';

const url = process.env.DATABASE_URL!;
const orgId = process.env.SNEEZE_ORG_ID!;
const c = new pg.Client({ connectionString: url });

async function main() {
  await c.connect();
  const v20 = (await c.query(`SELECT id, raw_content, frontmatter FROM oos_files WHERE org_id=$1 AND version=20`, [orgId])).rows[0];
  if (!v20) throw new Error('v20 not found');

  // OOS files have YAML frontmatter delimited by --- ... --- followed by markdown body.
  // Extract the frontmatter section and parse it.
  const raw: string = v20.raw_content;
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!fmMatch) throw new Error('No --- frontmatter delimiters found in raw_content');
  const fmText = fmMatch[1];
  const parsed: any = YAML.parse(fmText);

  // Sanity: confirm sops are in the parsed object
  const ents = parsed?.entities || {};
  const agents = Array.isArray(ents.agents) ? ents.agents : [];
  const radar = agents.find((a: any) => a.id === 'AGT_RADAR');
  const tally = agents.find((a: any) => a.id === 'AGT_TALLY');
  const steve = agents.find((a: any) => a.id === 'AGT_STEVE');
  console.log('parsed agents count:', agents.length);
  console.log('Radar sops:', Array.isArray(radar?.sops) ? `array(${radar.sops.length})` : typeof radar?.sops);
  console.log('Tally sops:', Array.isArray(tally?.sops) ? `array(${tally.sops.length})` : typeof tally?.sops);
  console.log('Steve present:', !!steve, steve?.sops ? `with ${steve.sops.length} sops` : 'no sops');

  // Compare to existing frontmatter to show diff at a glance
  const currentEnts = (v20.frontmatter as any)?.entities || {};
  const currentAgents = Array.isArray(currentEnts.agents) ? currentEnts.agents : [];
  console.log(`current frontmatter agents count: ${currentAgents.length} -> new: ${agents.length}`);

  await c.query(
    `UPDATE oos_files SET frontmatter=$1, updated_at=now() WHERE id=$2`,
    [JSON.stringify(parsed), v20.id]
  );
  console.log('frontmatter column synced. Reload /dashboard/team -- click any agent -- SOPs should appear.');

  await c.end();
}

main().catch(e => { console.error('Sync failed:', e.message); process.exit(1); });
