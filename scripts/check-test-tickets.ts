// Verify tickets and profile state after end-to-end testing.
import { db } from '../src/config/database';
import { tickets, consultantProfiles } from '../src/db/schema';
import { sql, eq, desc } from 'drizzle-orm';

(async () => {
  console.log('=== Recent tickets (last 5) ===');
  const recent = await db
    .select({ id: tickets.id, title: tickets.title, priority: tickets.priority, category: tickets.category, createdAt: tickets.createdAt })
    .from(tickets)
    .orderBy(desc(tickets.createdAt))
    .limit(5);
  for (const t of recent) {
    console.log(`  [${t.priority}/${t.category}] ${t.title}  (${t.createdAt})`);
  }

  console.log('\n=== Brock profile state ===');
  const [p] = await db.select().from(consultantProfiles).where(eq(consultantProfiles.slug, 'brock-beiersdoerfer')).limit(1);
  if (p) {
    console.log(`  claimed=${p.claimed}  orgId=${p.orgId}  displayName=${p.displayName}`);
  } else {
    console.log('  PROFILE NOT FOUND');
  }

  process.exit(0);
})().catch(err => { console.error(err); process.exit(1); });
