// One-off: confirm Jake Wells takedown ticket exists and report profile state.
// Run: railway run --service otp-platform npx tsx scripts/check-jake-takedown.ts
import { db } from '../src/config/database.js';
import { tickets, consultantProfiles } from '../src/db/schema.js';
import { eq, or, ilike, sql } from 'drizzle-orm';

async function main() {
  const ticketRows = await db.select().from(tickets).where(
    or(
      ilike(tickets.title, '%jake-wells%'),
      ilike(tickets.title, '%Jake Wells%'),
      ilike(tickets.description, '%jake-wells%'),
      ilike(tickets.description, '%Jake Wells%')
    )
  );
  console.log(`Tickets matching jake-wells: ${ticketRows.length}`);
  for (const t of ticketRows) {
    console.log(`  ${t.id} | priority=${t.priority} | status=${t.status} | created=${new Date(t.createdAt as any).toISOString()}`);
    console.log(`     title: ${t.title}`);
    console.log(`     reporter: ${t.reporterEmail || '(none)'}`);
    console.log(`     description: ${(t.description || '').substring(0, 400)}`);
  }

  console.log('\nProfile state:');
  const profile = await db.select().from(consultantProfiles).where(eq(consultantProfiles.slug, 'jake-wells'));
  if (profile.length === 0) {
    console.log('  NOT FOUND');
  } else {
    const p = profile[0] as any;
    console.log(`  slug:         ${p.slug}`);
    console.log(`  displayName:  ${p.displayName}`);
    console.log(`  published:    ${p.published}`);
    console.log(`  isPublished:  ${p.isPublished}`);
    console.log(`  claimed:      ${p.claimed}`);
  }

  // Recent takedown-priority-high tickets so we see if anyone else also requested
  console.log('\nRecent high-priority tickets (last 36h):');
  const recent = await db.execute(sql`
    SELECT id, title, status, created_at
    FROM tickets
    WHERE priority='high' AND created_at > NOW() - INTERVAL '36 hours'
    ORDER BY created_at DESC
    LIMIT 15
  `) as any;
  for (const r of (recent.rows || [])) {
    console.log(`  ${r.id} | ${r.created_at} | ${r.status} | ${r.title}`);
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
