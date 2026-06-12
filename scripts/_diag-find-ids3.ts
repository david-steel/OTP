// Read-only: scan jsonb/text columns for the two id prefixes.
import { sql } from 'drizzle-orm';
import { db } from '../src/config/database.js';

const cols = await db.execute(sql.raw(`
  SELECT table_name, column_name, data_type FROM information_schema.columns
  WHERE table_schema = 'public' AND data_type IN ('jsonb', 'json', 'text', 'character varying')`));
for (const p of ['34c442d0', 'bee3b10f']) {
  let found = false;
  for (const c of cols.rows as any[]) {
    try {
      const r = await db.execute(sql.raw(
        `SELECT 1 FROM "${c.table_name}" WHERE "${c.column_name}"::text LIKE '%${p}%' LIMIT 1`));
      if ((r.rows as any[]).length) { console.log(`${p} -> ${c.table_name}.${c.column_name} (${c.data_type})`); found = true; }
    } catch { /* skip */ }
  }
  if (!found) console.log(`${p} -> nowhere in jsonb/text either`);
}
process.exit(0);
