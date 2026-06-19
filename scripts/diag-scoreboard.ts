import { getScoreboard } from '../src/services/kpi.js';

async function main() {
  const orgId = process.env.SNEEZE_ORG_ID!;
  const now = new Date();
  const from = new Date(now.getTime() - 13 * 7 * 86400000);
  const sb = await getScoreboard(orgId, { timeGrain: 'weekly', from, to: now });
  const dirk = sb.rows.find((r: any) => r.kpi.title === 'Dirk -- Cold emails sent');
  if (!dirk) { console.log('Dirk not found'); process.exit(0); }
  console.log('Dirk periods array (each cell):');
  for (const p of (dirk as any).periods) {
    console.log('  ' + p.periodStart + '  v=' + (p.value === null ? 'null' : p.value));
  }
  process.exit(0);
}
main().catch(e => { console.error(e.message); process.exit(1); });
