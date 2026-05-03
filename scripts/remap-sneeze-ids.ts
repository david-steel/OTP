// One-time remap: rewrite the lowercase external IDs my initial seed used
// to the HUM_*/AGT_* convention used by the org chart so /team/:externalId
// pages and the drawer accountability block resolve correctly.
//
// Affects: rocks, kpis, todos, tickets (owner_*), and meetings.attendees jsonb.
// Idempotent: each UPDATE is keyed on the OLD id, so re-running is a no-op.
//
// Usage: SNEEZE_ORG_ID=<uuid> railway run npx tsx scripts/remap-sneeze-ids.ts

import pg from 'pg';

const url = process.env.DATABASE_URL;
const orgId = process.env.SNEEZE_ORG_ID;
if (!url || !orgId) {
  console.error('Need DATABASE_URL and SNEEZE_ORG_ID in env.');
  process.exit(1);
}

// old_id -> new_id (graph_nodes external_id convention).
// Crafter/Aio/Listener/Tally are NOT in the graph chart for this org yet, so
// their KPIs simply stay on the lowercase id and won't link from a chart node
// until those agents get added to the chart. Acceptable; not blocking for L10.
const REMAP: Record<string, string> = {
  // humans
  dsteel: 'HUM_DAVIDSTEEL',
  bogdan: 'HUM_BOGDANTABAKA',
  kristen: 'HUM_KRISTENGIESSUEBEL',
  nate: 'HUM_NATEFOSS',
  janine: 'HUM_JANINE',
  // agents already on chart
  dirk: 'AGT_DIRK',
  pepper: 'AGT_PEPPER',
  dan: 'AGT_DAN',
};

const client = new pg.Client({ connectionString: url });

async function main() {
  await client.connect();
  console.log(`Org: ${orgId}`);
  console.log(`Remap entries: ${Object.keys(REMAP).length}`);

  let totalRows = 0;

  for (const [oldId, newId] of Object.entries(REMAP)) {
    // rocks
    const r = await client.query(
      `UPDATE rocks SET owner_external_id=$1, updated_at=now()
       WHERE organization_id=$2 AND owner_external_id=$3 AND deleted_at IS NULL`,
      [newId, orgId, oldId]
    );
    if (r.rowCount) console.log(`  rocks ${oldId} -> ${newId}: ${r.rowCount}`);
    totalRows += r.rowCount || 0;

    // kpis
    const k = await client.query(
      `UPDATE kpis SET owner_external_id=$1, updated_at=now()
       WHERE organization_id=$2 AND owner_external_id=$3 AND deleted_at IS NULL`,
      [newId, orgId, oldId]
    );
    if (k.rowCount) console.log(`  kpis  ${oldId} -> ${newId}: ${k.rowCount}`);
    totalRows += k.rowCount || 0;

    // todos
    const t = await client.query(
      `UPDATE todos SET owner_external_id=$1, updated_at=now()
       WHERE organization_id=$2 AND owner_external_id=$3 AND deleted_at IS NULL`,
      [newId, orgId, oldId]
    );
    if (t.rowCount) console.log(`  todos ${oldId} -> ${newId}: ${t.rowCount}`);
    totalRows += t.rowCount || 0;

    // tickets
    const ti = await client.query(
      `UPDATE tickets SET owner_external_id=$1, updated_at=now()
       WHERE org_id=$2 AND owner_external_id=$3 AND deleted_at IS NULL`,
      [newId, orgId, oldId]
    );
    if (ti.rowCount) console.log(`  tckts ${oldId} -> ${newId}: ${ti.rowCount}`);
    totalRows += ti.rowCount || 0;
  }

  // meetings.attendees jsonb -- rewrite externalId field per attendee
  console.log(`\n  rewriting meetings.attendees jsonb...`);
  const meetings = await client.query(
    `SELECT id, attendees FROM meetings WHERE organization_id=$1 AND deleted_at IS NULL`,
    [orgId]
  );
  for (const m of meetings.rows) {
    const attendees: any[] = Array.isArray(m.attendees) ? m.attendees : [];
    let changed = false;
    const next = attendees.map(a => {
      if (a && a.externalId && REMAP[a.externalId]) {
        changed = true;
        return { ...a, externalId: REMAP[a.externalId] };
      }
      return a;
    });
    if (changed) {
      await client.query(`UPDATE meetings SET attendees=$1, updated_at=now() WHERE id=$2`, [JSON.stringify(next), m.id]);
      console.log(`  meeting ${m.id}: attendees rewritten`);
      totalRows++;
    }
  }

  console.log(`\nDone. Total rows updated: ${totalRows}`);
  await client.end();
}

main().catch(e => { console.error('Remap failed:', e.message); process.exit(1); });
