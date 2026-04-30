// Find triggers / FKs that touch audit_logs and might explain why the
// org delete keeps tripping on audit_logs_org_id_fkey.

import { db } from '../src/config/database.js';
import { sql } from 'drizzle-orm';

async function dump(label: string, q: string) {
  console.log(`\n${label}\n${'-'.repeat(label.length)}`);
  const r = await db.execute(sql.raw(q));
  for (const row of r.rows as any[]) console.log(JSON.stringify(row));
}

async function run() {
  // FK constraints into audit_logs
  await dump(
    'FKs from audit_logs',
    `SELECT conname, pg_get_constraintdef(oid) AS def
     FROM pg_constraint
     WHERE conrelid = 'audit_logs'::regclass AND contype = 'f'`
  );

  // FKs FROM audit_logs (already know about org_id_fkey)
  // Triggers on audit_logs
  await dump(
    'triggers on audit_logs',
    `SELECT tgname, pg_get_triggerdef(oid) AS def
     FROM pg_trigger
     WHERE tgrelid = 'audit_logs'::regclass AND NOT tgisinternal`
  );

  // Triggers on organizations / oos_files / claims that may insert into audit_logs
  for (const t of ['organizations', 'oos_files', 'claims', 'graph_nodes', 'graph_edges']) {
    await dump(
      `triggers on ${t}`,
      `SELECT tgname, pg_get_triggerdef(oid) AS def
       FROM pg_trigger
       WHERE tgrelid = '${t}'::regclass AND NOT tgisinternal`
    );
  }

  // Show FK definition that's failing so we know if it's deferrable
  await dump(
    'audit_logs_org_id_fkey detail',
    `SELECT conname, pg_get_constraintdef(oid) AS def, condeferrable, condeferred
     FROM pg_constraint
     WHERE conname = 'audit_logs_org_id_fkey'`
  );

  // Count audit_logs for the dupe org RIGHT NOW (outside transaction)
  await dump(
    'current audit_logs count for dupe org',
    `SELECT COUNT(*) AS n FROM audit_logs WHERE org_id = '4f977ee2-dd93-4298-997b-3738dc0582cf'`
  );
}

run().catch(e => { console.error(e); process.exit(1); });
