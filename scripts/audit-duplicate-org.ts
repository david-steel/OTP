// scripts/audit-duplicate-org.ts
// Pre-delete audit: enumerate everything attached to "Sneeze It Digital Agency"
// (id 4f977ee2-...). If results show any non-empty, meaningful data, halt.

import { db } from '../src/config/database.js';
import { sql } from 'drizzle-orm';

const TARGET_ID = '4f977ee2-dd93-4298-997b-3738dc0582cf';

async function count(table: string, col: string): Promise<number> {
  const r = await db.execute(sql.raw(`SELECT COUNT(*)::int AS n FROM ${table} WHERE ${col} = '${TARGET_ID}'`));
  return Number((r.rows as any[])[0]?.n ?? 0);
}

async function run() {
  console.log(`Auditing org ${TARGET_ID} (Sneeze It Digital Agency)`);

  const checks: Array<[string, string]> = [
    ['oos_files', 'org_id'],
    ['workspaces', 'org_id'],
    ['org_members', 'org_id'],
    ['org_invitations', 'org_id'],
    ['api_keys', 'org_id'],
    ['kpis', 'organization_id'],
    ['oos_operating_plans', 'organization_id'],
    ['inquiries', 'org_id'],
    ['tickets', 'org_id'],
    ['audit_logs', 'org_id'],
  ];

  let total = 0;
  for (const [tbl, col] of checks) {
    try {
      const n = await count(tbl, col);
      total += n;
      console.log(`  ${tbl.padEnd(25)} ${n}`);
    } catch (e) {
      console.log(`  ${tbl.padEnd(25)} (table/col missing — skipped)`);
    }
  }

  console.log(`---`);
  console.log(`Total attached rows: ${total}`);
  console.log(total === 0
    ? 'CLEAN — safe to delete.'
    : 'NOT CLEAN — review before deletion.');
}

run().catch(e => { console.error(e); process.exit(1); });
