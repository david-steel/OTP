// Surgical: inject AGT_STEVE block from v19 raw_content into v20 raw_content,
// right before the `humans:` marker. Preserves all of v20's other edits.
// Idempotent: skips if Steve already present in v20.
//
// Also cleans up the phantom graph_nodes row from the prior failed attempt.

import pg from 'pg';

const url = process.env.DATABASE_URL!;
const orgId = process.env.SNEEZE_ORG_ID!;
const c = new pg.Client({ connectionString: url });

async function main() {
  await c.connect();

  // 1. Clean up the phantom graph_nodes Steve I inserted into v20 earlier --
  // it was a search-cache row that does nothing for chart rendering.
  const v20row = (await c.query(`SELECT id FROM oos_files WHERE org_id=$1 AND version=20`, [orgId])).rows[0];
  const phantom = await c.query(
    `DELETE FROM graph_nodes WHERE oos_file_id=$1 AND external_id='AGT_STEVE' RETURNING id`,
    [v20row.id]
  );
  console.log(`Cleaned ${phantom.rowCount} phantom graph_nodes row(s)`);

  // 2. Pull v19 + v20 rawContent
  const v19 = (await c.query(`SELECT id, raw_content FROM oos_files WHERE org_id=$1 AND version=19`, [orgId])).rows[0];
  const v20 = (await c.query(`SELECT id, raw_content FROM oos_files WHERE org_id=$1 AND version=20`, [orgId])).rows[0];

  if (/AGT_STEVE/.test(v20.raw_content)) {
    console.log('AGT_STEVE already in v20 raw_content. Nothing to do.');
    await c.end();
    return;
  }

  // 3. Extract Steve's block from v19. It starts at the line `    - id: AGT_STEVE`
  // and ends at the line just before `  humans:`.
  const v19lines: string[] = v19.raw_content.split('\n');
  const startIdx = v19lines.findIndex((l: string) => /^\s+- id:\s*AGT_STEVE\s*$/.test(l));
  if (startIdx === -1) throw new Error('AGT_STEVE not found in v19');
  // Find the next sibling block start. Steve's block is at indent "    - " (4 spaces),
  // so the next sibling is either another "    - id:" agent OR the `  humans:` line.
  let endIdx = -1;
  for (let i = startIdx + 1; i < v19lines.length; i++) {
    if (/^\s+- id:\s*\w/.test(v19lines[i]) || /^\s*humans\s*:/.test(v19lines[i])) {
      endIdx = i;
      break;
    }
  }
  if (endIdx === -1) throw new Error('Could not find end of Steve block in v19');
  const steveBlock = v19lines.slice(startIdx, endIdx).join('\n') + '\n';
  console.log(`Extracted Steve block: ${endIdx - startIdx} lines (${steveBlock.length} chars)`);

  // 4. Inject into v20 right before the `humans:` marker.
  const v20lines: string[] = v20.raw_content.split('\n');
  const humansIdx = v20lines.findIndex((l: string) => /^\s*humans\s*:/.test(l));
  if (humansIdx === -1) throw new Error('humans: marker not found in v20');

  const newV20Lines = [...v20lines.slice(0, humansIdx), ...steveBlock.split('\n').filter(Boolean), ...v20lines.slice(humansIdx)];
  const newV20Content = newV20Lines.join('\n');

  // 5. Write back to v20
  await c.query(
    `UPDATE oos_files SET raw_content=$1, updated_at=now() WHERE id=$2`,
    [newV20Content, v20.id]
  );
  console.log(`v20 raw_content patched: ${v20.raw_content.length} -> ${newV20Content.length} chars (+${newV20Content.length - v20.raw_content.length})`);
  console.log('Steve restored. Reload /dashboard/team to see him.');

  await c.end();
}

main().catch(e => { console.error('Patch failed:', e.message); process.exit(1); });
