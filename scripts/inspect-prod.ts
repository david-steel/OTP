// READ-ONLY production database inspection.
// Reports: which L10 tables exist, which ticket columns exist, Sneeze It org row,
// KPI count for Sneeze It. Nothing is created, modified, or deleted.
//
// Usage: railway run npx tsx scripts/inspect-prod.ts

import pg from 'pg';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL not in env. Run via: railway run npx tsx scripts/inspect-prod.ts');
  process.exit(1);
}

// Safety: verify we are NOT pointed at localhost (we want prod here)
const safeHost = url.replace(/postgresql:\/\/[^@]+@/, 'postgresql://<redacted>@').replace(/:\d+\/.*/, ':****/****');
console.log('DATABASE_URL host:', safeHost);

const client = new pg.Client({ connectionString: url });

async function main() {
  await client.connect();

  console.log('\n=== L10 tables present? ===');
  const t = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema='public' AND table_name = ANY($1)
    ORDER BY table_name
  `, [['rocks', 'todos', 'meetings']]);
  console.log('Found:', t.rows.map(r => r.table_name).join(', ') || '(none)');
  const missing = ['rocks', 'todos', 'meetings'].filter(n => !t.rows.find(r => r.table_name === n));
  if (missing.length > 0) console.log('MISSING:', missing.join(', '));

  console.log('\n=== L10 columns on tickets? ===');
  const c = await client.query(`
    SELECT column_name, data_type FROM information_schema.columns
    WHERE table_schema='public' AND table_name='tickets' AND column_name = ANY($1)
    ORDER BY column_name
  `, [['ids_status', 'priority_rank', 'solved_in_meeting_id', 'owner_entity_type', 'owner_external_id', 'owner_name', 'deleted_at']]);
  for (const r of c.rows) console.log(`  ${r.column_name}: ${r.data_type}`);
  const expectedCols = ['ids_status', 'priority_rank', 'solved_in_meeting_id', 'owner_entity_type', 'owner_external_id', 'owner_name', 'deleted_at'];
  const missingCols = expectedCols.filter(n => !c.rows.find(r => r.column_name === n));
  if (missingCols.length > 0) console.log('MISSING columns:', missingCols.join(', '));

  console.log('\n=== organizations.agentic_level present? ===');
  const al = await client.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema='public' AND table_name='organizations' AND column_name='agentic_level'
  `);
  console.log(al.rows.length > 0 ? '  yes' : '  MISSING');

  console.log('\n=== Sneeze It org row(s) ===');
  const o = await client.query(`
    SELECT id, name, clerk_org_id, created_at FROM organizations
    WHERE name ILIKE '%sneeze%'
    ORDER BY created_at DESC
  `);
  if (o.rows.length === 0) {
    console.log('  No org matching "sneeze". You will need to create one (or rename existing).');
  } else {
    for (const r of o.rows) console.log(`  ${r.id} | ${r.name} | clerk_org_id=${r.clerk_org_id} | created=${r.created_at?.toISOString?.() || r.created_at}`);
  }

  console.log('\n=== Recent organizations (any name, last 10) for context ===');
  const recent = await client.query(`SELECT id, name, clerk_org_id FROM organizations ORDER BY created_at DESC LIMIT 10`);
  for (const r of recent.rows) console.log(`  ${r.name} | clerk_org_id=${r.clerk_org_id}`);

  console.log('\n=== Existing KPI count per org (top 5 by count) ===');
  const k = await client.query(`
    SELECT o.name, count(k.*) AS kpi_count
    FROM organizations o LEFT JOIN kpis k ON k.organization_id = o.id AND k.deleted_at IS NULL
    GROUP BY o.id, o.name ORDER BY kpi_count DESC, o.name LIMIT 5
  `);
  for (const r of k.rows) console.log(`  ${r.name}: ${r.kpi_count} KPIs`);

  console.log('\n=== ids_status enum present? ===');
  const e = await client.query(`SELECT typname FROM pg_type WHERE typname IN ('ids_status','owner_entity_type','meeting_status') ORDER BY typname`);
  console.log('  enums found:', e.rows.map(r => r.typname).join(', ') || '(none)');

  await client.end();
  console.log('\n--- DONE (read-only, nothing changed) ---');
}

main().catch(err => {
  console.error('Inspection failed:', err.message);
  process.exit(1);
});
