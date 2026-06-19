// One-shot restore: copy AGT_STEVE node + his edges from v19 (published, intact)
// into v20 (current draft, where he was accidentally deleted). Surgical so any
// other edits in v20 are preserved.
//
// Edges are remapped by external_id -> v20-side node id, so they wire to the
// right v20 nodes (not v19's UUIDs).
//
// Usage: SNEEZE_ORG_ID=<uuid> railway run npx tsx scripts/restore-steve.ts

import pg from 'pg';

const url = process.env.DATABASE_URL!;
const orgId = process.env.SNEEZE_ORG_ID!;

const c = new pg.Client({ connectionString: url });

async function main() {
  await c.connect();

  const v19 = (await c.query(`SELECT id FROM oos_files WHERE org_id=$1 AND version=19`, [orgId])).rows[0];
  const v20 = (await c.query(`SELECT id FROM oos_files WHERE org_id=$1 AND version=20`, [orgId])).rows[0];
  if (!v19 || !v20) throw new Error('v19 or v20 missing');

  const steve19 = (await c.query(
    `SELECT * FROM graph_nodes WHERE oos_file_id=$1 AND external_id='AGT_STEVE'`,
    [v19.id]
  )).rows[0];
  if (!steve19) throw new Error('Steve missing in v19');

  // Sanity: ensure Steve does not already exist in v20 (idempotency)
  const existing = await c.query(
    `SELECT id FROM graph_nodes WHERE oos_file_id=$1 AND external_id='AGT_STEVE'`,
    [v20.id]
  );
  if (existing.rowCount && existing.rowCount > 0) {
    console.log('Steve already in v20. Nothing to do.');
    await c.end();
    return;
  }

  // 1. Insert Steve into v20 (new id, same external_id + properties + label + type)
  const inserted = await c.query(
    `INSERT INTO graph_nodes (external_id, type, label, properties, oos_file_id, org_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [steve19.external_id, steve19.type, steve19.label, steve19.properties, v20.id, steve19.org_id]
  );
  const newSteveId = inserted.rows[0].id;
  console.log(`Inserted Steve into v20: id=${newSteveId}`);

  // 2. Find every edge in v19 where Steve is source OR target.
  //    For each, find the other endpoint's external_id, look that up in v20, and
  //    create a new edge in v20 between newSteveId and the v20 endpoint.
  const edges19 = await c.query(
    `SELECT e.*, ns.external_id AS source_ext, nt.external_id AS target_ext
     FROM graph_edges e
     JOIN graph_nodes ns ON ns.id = e.source_id
     JOIN graph_nodes nt ON nt.id = e.target_id
     WHERE e.oos_file_id = $1
       AND (ns.external_id = 'AGT_STEVE' OR nt.external_id = 'AGT_STEVE')`,
    [v19.id]
  );
  console.log(`Found ${edges19.rowCount} edges involving Steve in v19`);

  let inserted_edges = 0;
  for (const e of edges19.rows) {
    const isSource = e.source_ext === 'AGT_STEVE';
    const otherExt = isSource ? e.target_ext : e.source_ext;
    const otherV20 = (await c.query(
      `SELECT id FROM graph_nodes WHERE oos_file_id=$1 AND external_id=$2`,
      [v20.id, otherExt]
    )).rows[0];
    if (!otherV20) {
      console.log(`  skip edge ${e.type}: other endpoint ${otherExt} not in v20`);
      continue;
    }
    const newSrc = isSource ? newSteveId : otherV20.id;
    const newTgt = isSource ? otherV20.id : newSteveId;
    await c.query(
      `INSERT INTO graph_edges (source_id, target_id, type, properties, oos_file_id, weight)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [newSrc, newTgt, e.type, e.properties, v20.id, e.weight]
    );
    inserted_edges++;
    console.log(`  edge restored: ${isSource ? 'AGT_STEVE' : otherExt} -[${e.type}]-> ${isSource ? otherExt : 'AGT_STEVE'}`);
  }

  console.log(`\nDone. 1 node + ${inserted_edges} edges restored to v20 draft.`);
  await c.end();
}

main().catch(e => { console.error('Restore failed:', e.message); process.exit(1); });
