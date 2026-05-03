// READ-ONLY: list Sneeze It's existing KPIs, tickets, rocks, todos, meetings
// in whatever DB is in env. Helps avoid duplicates before running the seed.
import pg from 'pg';

const url = process.env.DATABASE_URL;
const orgId = process.env.SNEEZE_ORG_ID || '';
if (!url || !orgId) {
  console.error('Need DATABASE_URL and SNEEZE_ORG_ID in env.');
  process.exit(1);
}

const client = new pg.Client({ connectionString: url });
async function main() {
  await client.connect();
  const k = await client.query(`SELECT title, group_name, owner_entity_type, owner_external_id FROM kpis WHERE organization_id=$1 AND deleted_at IS NULL ORDER BY group_name, title`, [orgId]);
  console.log(`\n=== Existing KPIs (${k.rows.length}) ===`);
  for (const r of k.rows) console.log(`  [${r.group_name || '-'}] ${r.title} (${r.owner_entity_type}:${r.owner_external_id})`);

  const t = await client.query(`SELECT count(*)::int AS n FROM tickets WHERE org_id=$1 AND (deleted_at IS NULL)`, [orgId]);
  console.log(`\n=== Existing non-deleted tickets for Sneeze It: ${t.rows[0].n} ===`);
  if (t.rows[0].n > 0) {
    const sample = await client.query(`SELECT title, ids_status, status FROM tickets WHERE org_id=$1 AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 10`, [orgId]);
    for (const r of sample.rows) console.log(`  [${r.ids_status}/${r.status}] ${r.title}`);
  }

  const r = await client.query(`SELECT count(*)::int AS n FROM rocks WHERE organization_id=$1 AND deleted_at IS NULL`, [orgId]);
  console.log(`\nRocks: ${r.rows[0].n}`);
  const m = await client.query(`SELECT count(*)::int AS n FROM meetings WHERE organization_id=$1 AND deleted_at IS NULL`, [orgId]);
  console.log(`Meetings: ${m.rows[0].n}`);
  const td = await client.query(`SELECT count(*)::int AS n FROM todos WHERE organization_id=$1 AND deleted_at IS NULL`, [orgId]);
  console.log(`Todos: ${td.rows[0].n}`);

  await client.end();
}
main().catch(e => { console.error(e.message); process.exit(1); });
