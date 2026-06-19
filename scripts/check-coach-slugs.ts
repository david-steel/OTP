// Quick DB probe: what consultant profile slugs exist locally?
import { db } from '../src/config/database';
import { consultantProfiles } from '../src/db/schema';
import { sql } from 'drizzle-orm';

(async () => {
  const rows = await db.execute(sql`
    SELECT slug, display_name, claimed, directory_source
    FROM consultant_profiles
    ORDER BY created_at DESC
    LIMIT 10
  `) as any;
  console.log(`Local DB consultant_profiles (latest 10 of total):`);
  for (const r of rows.rows) {
    console.log(`  slug=${r.slug}  name=${r.display_name}  claimed=${r.claimed}  src=${r.directory_source}`);
  }
  const count = await db.execute(sql`SELECT COUNT(*)::int AS n FROM consultant_profiles`) as any;
  console.log(`\nTotal rows: ${count.rows[0].n}`);
  process.exit(0);
})().catch(err => { console.error(err); process.exit(1); });
