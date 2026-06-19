// Inspect unsubscribe + takedown tickets in the DB to verify campaign opt-outs.
import { db } from '../src/config/database';
import { tickets, consultantProfiles } from '../src/db/schema';
import { sql, desc, eq } from 'drizzle-orm';

(async () => {
  console.log('=== Recent [UNSUBSCRIBE] tickets ===');
  const unsubs = await db.execute(sql`
    SELECT id, title, description, reporter_email, created_at
    FROM tickets
    WHERE title LIKE '[UNSUBSCRIBE]%'
    ORDER BY created_at DESC
    LIMIT 10
  `) as any;
  for (const t of unsubs.rows) {
    console.log(`\n  ${t.title}`);
    console.log(`    id: ${t.id}`);
    console.log(`    created: ${t.created_at}`);
    console.log(`    reporter: ${t.reporter_email || '(none)'}`);
    console.log(`    body excerpt: ${(t.description || '').split('\n').slice(0, 3).join(' | ')}`);
  }

  console.log('\n=== Recent [TAKEDOWN] tickets ===');
  const takedowns = await db.execute(sql`
    SELECT id, title, created_at
    FROM tickets
    WHERE title LIKE '[TAKEDOWN]%'
    ORDER BY created_at DESC
    LIMIT 10
  `) as any;
  for (const t of takedowns.rows) {
    console.log(`  ${t.title}  (${t.created_at})`);
  }

  console.log('\n=== Lee Handley profile state ===');
  const [lee] = await db.select().from(consultantProfiles).where(eq(consultantProfiles.slug, 'lee-handley')).limit(1);
  if (lee) {
    console.log(`  found: claimed=${lee.claimed}  published=${lee.published}  orgId=${lee.orgId}`);
    console.log(`  display: ${lee.displayName}`);
    console.log(`  Note: consultant_profiles has NO do_not_email flag yet —`);
    console.log(`  blocking future sends relies on either the Sheet's Outreach Status`);
    console.log(`  column or querying [UNSUBSCRIBE] tickets at send time.`);
  } else {
    console.log('  NOT FOUND in this DB. Either prod-only or wrong slug.');
  }

  process.exit(0);
})().catch(err => { console.error(err); process.exit(1); });
