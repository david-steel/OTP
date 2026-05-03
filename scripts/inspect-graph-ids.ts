// READ-ONLY: list every external_id in graph_nodes for the given org so we know
// what IDs to use when remapping rocks/todos/kpis/meetings.attendees.
import pg from 'pg';
const url = process.env.DATABASE_URL!;
const orgId = process.env.SNEEZE_ORG_ID!;
const c = new pg.Client({ connectionString: url });
async function main() {
  await c.connect();
  const cols = await c.query(`SELECT column_name FROM information_schema.columns WHERE table_name='graph_nodes' ORDER BY ordinal_position`);
  console.log('graph_nodes columns:', cols.rows.map((r: any) => r.column_name).join(', '));
  const orgCol = cols.rows.find((r: any) => r.column_name.includes('org') || r.column_name === 'organization_id')?.column_name || 'org_id';
  console.log(`Using org column: ${orgCol}`);
  const r = await c.query(`SELECT external_id, type, label FROM graph_nodes WHERE ${orgCol}=$1 ORDER BY type, external_id`, [orgId]);
  console.log(`\nTotal graph_nodes for org: ${r.rows.length}`);
  for (const row of r.rows) console.log(`  [${row.type}] ${row.external_id} -- ${row.label}`);
  await c.end();
}
main().catch(e => { console.error(e.message); process.exit(1); });
