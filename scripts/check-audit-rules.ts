import { db } from '../src/config/database.js';
import { sql } from 'drizzle-orm';

async function run() {
  const rules = await db.execute(sql.raw(`SELECT rulename, definition FROM pg_rules WHERE tablename = 'audit_logs'`));
  console.log(`pg_rules on audit_logs: ${(rules.rows as any[]).length}`);
  for (const r of rules.rows as any[]) console.log(JSON.stringify(r, null, 2));

  // Also check the relrowsecurity flag
  const rls = await db.execute(sql.raw(`SELECT relrowsecurity, relforcerowsecurity FROM pg_class WHERE relname = 'audit_logs'`));
  console.log('row security flags:', JSON.stringify((rls.rows as any[])[0]));

  // Also check what ROLE / USER we're connected as
  const who = await db.execute(sql.raw(`SELECT current_user, current_database(), current_setting('search_path')`));
  console.log('connection identity:', JSON.stringify((who.rows as any[])[0]));

  // Permissions on audit_logs for current user
  const perms = await db.execute(sql.raw(`
    SELECT privilege_type FROM information_schema.table_privileges
    WHERE table_name = 'audit_logs' AND grantee = current_user
  `));
  console.log('table privileges for current user:');
  for (const r of perms.rows as any[]) console.log('  -', r.privilege_type);
}

run().catch(e => { console.error(e); process.exit(1); });
