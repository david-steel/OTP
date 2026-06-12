// Read-only: scan EVERY uuid column in prod for the two ids.
import { sql } from 'drizzle-orm';
import { db } from '../src/config/database.js';

const cols = await db.execute(sql.raw(`
  SELECT table_name, column_name FROM information_schema.columns
  WHERE table_schema = 'public' AND data_type = 'uuid'`));
let hits = 0;
for (const p of ['34c442d0', 'bee3b10f']) {
  for (const c of cols.rows as any[]) {
    try {
      const r = await db.execute(sql.raw(
        `SELECT '${p}' AS needle FROM "${c.table_name}" WHERE "${c.column_name}"::text LIKE '${p}%' LIMIT 1`));
      if ((r.rows as any[]).length) { console.log(`${p} -> ${c.table_name}.${c.column_name}`); hits++; }
    } catch { /* skip */ }
  }
}
console.log(`scan done, ${hits} hits across ${ (cols.rows as any[]).length } uuid columns`);
process.exit(0);
