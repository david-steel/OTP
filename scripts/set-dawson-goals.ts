import { sql } from 'drizzle-orm';
import { db } from '../src/config/database.js';
import { updateKpi, listKpis } from '../src/services/kpi.js';
const GOALS: Record<string, number> = {
  'conversations': 30, 'demos booked': 5, 'demos run': 4, 'active / using': 2, 'closed won': 1,
};
const mem = (await db.execute(sql`SELECT org_id, claimed_entity_id FROM org_members WHERE lower(email)='dawson@orgtp.com'`)) as any;
const { org_id: orgId, claimed_entity_id: seat } = (mem.rows||[])[0];
const kpis = await listKpis(orgId, { ownerExternalId: seat } as any);
for (const k of kpis as any[]) {
  const g = GOALS[String(k.title).toLowerCase()];
  if (g == null) continue;
  await updateKpi(orgId, k.id, { goalOperator: 'gte', goalValue: g } as any);
  console.log(`set ${k.title} -> gte ${g}`);
}
console.log('done');
