// Dump the audit_logs row(s) referencing the dupe org to see the actual data
// and any hidden constraints.

import { db } from '../src/config/database.js';
import { sql } from 'drizzle-orm';

const DUPE = '4f977ee2-dd93-4298-997b-3738dc0582cf';

async function run() {
  const r = await db.execute(sql.raw(`SELECT * FROM audit_logs WHERE org_id = '${DUPE}'`));
  console.log('row(s):');
  for (const row of r.rows as any[]) console.log(JSON.stringify(row, null, 2));

  // Try DELETE outside any transaction with literal id
  const d = await db.execute(sql.raw(`DELETE FROM audit_logs WHERE org_id = '${DUPE}'`));
  console.log(`literal DELETE rowCount: ${d.rowCount ?? 'undef'}`);

  // Verify
  const after = await db.execute(sql.raw(`SELECT COUNT(*)::int AS n FROM audit_logs WHERE org_id = '${DUPE}'`));
  console.log(`after literal DELETE, count = ${(after.rows as any[])[0]?.n}`);

  // Check for RLS / policies
  const policies = await db.execute(sql.raw(`SELECT * FROM pg_policies WHERE tablename = 'audit_logs'`));
  console.log(`policies on audit_logs: ${(policies.rows as any[]).length}`);
  for (const p of policies.rows as any[]) console.log(JSON.stringify(p));
}

run().catch(e => { console.error(e); process.exit(1); });
