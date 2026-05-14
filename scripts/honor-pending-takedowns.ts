// One-time: honor outstanding takedown tickets by unpublishing the profile and
// resolving the ticket. Run after the auto-unpublish handler fix ships.
//
// Usage:
//   railway run --service otp-platform npx tsx scripts/honor-pending-takedowns.ts           # dry-run
//   railway run --service otp-platform npx tsx scripts/honor-pending-takedowns.ts --apply
import { db } from '../src/config/database.js';
import { tickets, consultantProfiles } from '../src/db/schema.js';
import { eq, and, ilike, sql } from 'drizzle-orm';

const APPLY = process.argv.includes('--apply');

async function main() {
  // Open takedown tickets
  const pending = await db.execute(sql`
    SELECT id, title, description, status
    FROM tickets
    WHERE title ILIKE '[TAKEDOWN]%' AND status = 'open'
    ORDER BY created_at ASC
  `) as any;

  const rows = pending.rows || [];
  console.log(`Open takedown tickets: ${rows.length}\n`);

  for (const t of rows) {
    // Title shape: "[TAKEDOWN] Jake Wells (jake-wells)"
    const m = String(t.title).match(/\(([a-z0-9-]+)\)\s*$/);
    if (!m) {
      console.log(`  [skip-noslug]  ${t.title}`);
      continue;
    }
    const slug = m[1];
    const profile = await db.select().from(consultantProfiles).where(eq(consultantProfiles.slug, slug));
    if (profile.length === 0) {
      console.log(`  [skip-noprofile] ticket=${t.id} slug=${slug}`);
      continue;
    }
    const p = profile[0] as any;
    const needsUnpublish = p.published || p.isPublished;
    if (!needsUnpublish) {
      console.log(`  [skip-already-unpublished] ${slug}`);
    } else {
      console.log(`  [${APPLY ? 'APPLY' : 'plan'}] unpublish ${slug.padEnd(28)} (ticket ${t.id})`);
      if (APPLY) {
        await db.update(consultantProfiles)
          .set({ published: false, isPublished: false })
          .where(eq(consultantProfiles.id, p.id));
      }
    }
    if (APPLY) {
      await db.execute(sql`UPDATE tickets SET status = 'resolved', resolution = 'Profile unpublished via honor-pending-takedowns.ts' WHERE id = ${t.id}`);
    }
  }

  console.log(`\nMode: ${APPLY ? 'APPLIED' : 'DRY-RUN'}`);
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
