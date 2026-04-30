// scripts/inspect-duplicate-org.ts
// Show actual rows attached to the duplicate org so we can decide.

import { db } from '../src/config/database.js';
import { sql } from 'drizzle-orm';

const TARGET_ID = '4f977ee2-dd93-4298-997b-3738dc0582cf';

async function dump(label: string, query: string) {
  console.log(`\n${label}`);
  console.log('-'.repeat(label.length));
  const r = await db.execute(sql.raw(query));
  for (const row of r.rows as any[]) console.log(JSON.stringify(row, null, 2));
}

async function run() {
  await dump(
    'organizations row',
    `SELECT id, name, clerk_org_id, created_at, updated_at FROM organizations WHERE id = '${TARGET_ID}'`,
  );
  await dump(
    'oos_files',
    `SELECT id, version, status, claim_count, created_at FROM oos_files WHERE org_id = '${TARGET_ID}'`,
  );
  await dump(
    'org_members',
    `SELECT id, clerk_user_id, role, claimed_entity_id, created_at FROM org_members WHERE org_id = '${TARGET_ID}'`,
  );
  await dump(
    'audit_logs',
    `SELECT id, action, actor_type, actor_id, created_at FROM audit_logs WHERE org_id = '${TARGET_ID}' LIMIT 5`,
  );
}

run().catch(e => { console.error(e); process.exit(1); });
