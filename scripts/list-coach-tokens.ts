import { db } from '../src/config/database.js';
import { sql } from 'drizzle-orm';
(async () => {
  const r = await db.execute(sql`
    SELECT slug, display_name, claimed, invite_token, updated_at
    FROM consultant_profiles
    WHERE claimed = true AND directory_source IS NOT NULL
    ORDER BY updated_at DESC
  `) as any;
  console.log('Claimed coach profiles:');
  for (const row of (r.rows || [])) {
    const tok = row.invite_token || '(none — visit /claim/<slug>/done to generate)';
    console.log(`  ${row.slug.padEnd(28)} token=${tok}`);
  }
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
