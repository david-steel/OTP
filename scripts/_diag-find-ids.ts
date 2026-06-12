// Read-only: which table holds these two uuids? (publish failure diag)
import { sql } from 'drizzle-orm';
import { db } from '../src/config/database.js';

const tables = ['charts','oos_files','claims','tickets','source_documents','oos_operating_plans','oos_operating_plan_sections','oos_execution_items','rocks','meetings','todos','kpis','kpi_values','manager_agents','seat_responsibilities','org_values'];
for (const p of ['34c442d0','bee3b10f']) {
  for (const t of tables) {
    try {
      const r = await db.execute(sql.raw(`SELECT id FROM "${t}" WHERE id::text LIKE '${p}%' LIMIT 1`));
      if ((r.rows as any[]).length) {
        console.log(`${p} -> table "${t}" id=${(r.rows as any[])[0].id}`);
        const full = await db.execute(sql.raw(`SELECT * FROM "${t}" WHERE id::text LIKE '${p}%' LIMIT 1`));
        const row = (full.rows as any[])[0];
        const brief: Record<string, unknown> = {};
        for (const k of Object.keys(row)) {
          const v = row[k];
          brief[k] = typeof v === 'string' && v.length > 80 ? v.slice(0, 80) + '...' : v;
        }
        console.log('  ', JSON.stringify(brief).slice(0, 700));
      }
    } catch { /* table may lack id::uuid */ }
  }
}
process.exit(0);
