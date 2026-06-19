// Surgical: remove the SECOND sops: block from Neil's agent entry in v20
// raw_content. The first sops: block (the authored 5-item one) is preserved.
// Then re-sync the frontmatter column.
//
// Root cause: prior seed pass missed Neil's existing sops with its regex and
// inserted a new sops block, leaving Neil with two sibling sops: keys and an
// invalid YAML block.

import pg from 'pg';
import * as YAML from 'yaml';

const url = process.env.DATABASE_URL!;
const orgId = process.env.SNEEZE_ORG_ID!;
const c = new pg.Client({ connectionString: url });

async function main() {
  await c.connect();
  const v20 = (await c.query(`SELECT id, raw_content FROM oos_files WHERE org_id=$1 AND version=20`, [orgId])).rows[0];
  if (!v20) throw new Error('v20 not found');
  const lines: string[] = v20.raw_content.split('\n');

  // Locate Neil block bounds
  const neilIdx = lines.findIndex(l => /^\s+- id:\s*AGT_NEIL\b/.test(l));
  if (neilIdx === -1) throw new Error('AGT_NEIL not found');
  let neilEnd = lines.length;
  for (let i = neilIdx + 1; i < lines.length; i++) {
    if (/^\s+- id:/.test(lines[i]) || /^\s*humans\s*:/.test(lines[i])) { neilEnd = i; break; }
  }

  // Find sops: lines within Neil's block
  const sopsLineIdxs: number[] = [];
  for (let i = neilIdx; i < neilEnd; i++) {
    if (/^\s{6}sops\s*:/.test(lines[i])) sopsLineIdxs.push(i);
  }
  console.log(`Neil block spans lines ${neilIdx + 1}..${neilEnd}, sops: at lines [${sopsLineIdxs.map(i => i + 1).join(', ')}]`);

  if (sopsLineIdxs.length < 2) {
    console.log('No duplicate to fix.');
    await c.end();
    return;
  }

  // Keep the FIRST sops block (the new authored one). Remove the SECOND.
  const secondSopsStart = sopsLineIdxs[1];
  // The second sops block ends at the next 6-space-indented field key OR at neilEnd.
  let secondSopsEnd = neilEnd;
  for (let i = secondSopsStart + 1; i < neilEnd; i++) {
    if (/^\s{6}[a-z_]+\s*:/.test(lines[i])) { secondSopsEnd = i; break; }
  }
  console.log(`Removing second sops block: lines ${secondSopsStart + 1}..${secondSopsEnd} (${secondSopsEnd - secondSopsStart} lines)`);

  // Print the lines being removed for transparency
  console.log('--- removing ---');
  for (let i = secondSopsStart; i < Math.min(secondSopsEnd, secondSopsStart + 8); i++) {
    console.log(`  L${(i + 1).toString().padStart(4)}: ${lines[i]}`);
  }
  if (secondSopsEnd - secondSopsStart > 8) console.log(`  ...and ${secondSopsEnd - secondSopsStart - 8} more lines`);

  const newLines = [...lines.slice(0, secondSopsStart), ...lines.slice(secondSopsEnd)];
  const newContent = newLines.join('\n');
  console.log(`v20 raw_content: ${v20.raw_content.length} -> ${newContent.length} (delta ${newContent.length - v20.raw_content.length})`);

  await c.query(`UPDATE oos_files SET raw_content=$1, updated_at=now() WHERE id=$2`, [newContent, v20.id]);

  // Re-sync frontmatter
  const fmMatch = newContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!fmMatch) throw new Error('No frontmatter delimiters found');
  const parsed: any = YAML.parse(fmMatch[1]);
  await c.query(`UPDATE oos_files SET frontmatter=$1 WHERE id=$2`, [JSON.stringify(parsed), v20.id]);

  // Verify all 13 agents have sops and counts
  const agents = (parsed?.entities?.agents || []) as any[];
  console.log('\nFinal SOP count per agent:');
  for (const a of agents) console.log(`  ${a.id}: ${Array.isArray(a.sops) ? a.sops.length : 0} sops`);

  await c.end();
  console.log('\nDone.');
}

main().catch(e => { console.error('Fix failed:', e.message); process.exit(1); });
