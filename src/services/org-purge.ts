/**
 * Organization hard-delete (phase 2): permanently purge an org and ALL its data.
 *
 * Most org-scoped tables FK organizations.id with ON DELETE CASCADE, so deleting
 * the organizations row removes them automatically. A handful do NOT cascade --
 * deleting the org row while they still reference it would fail on a FK
 * constraint. Those are deleted explicitly FIRST, inside one transaction, so the
 * whole purge is atomic: if anything is wrong, it rolls back and the org stays
 * pending (logged) rather than half-deleted.
 *
 * This is the destructive end of the two-phase delete. The daily scheduler that
 * calls it is DORMANT unless ENABLE_ORG_PURGE=true (see server.ts) -- soft-delete
 * and restore work without it; the irreversible purge only runs once armed.
 */
import cron from 'node-cron';
import { and, isNotNull, lte, sql } from 'drizzle-orm';
import { db } from '../config/database.js';
import { organizations } from '../db/schema.js';
import { purgeCutoff } from '../shared/org-deletion.js';

// Org-scoped tables WITHOUT ON DELETE CASCADE (verified against schema.ts).
// Deleted explicitly before the org row. Children before parents: workspaces
// is last because workspace_members / source_documents may reference it.
const NON_CASCADING_DELETES = (orgId: string) => [
  sql`DELETE FROM "workspace_members" WHERE "org_id" = ${orgId}`,
  sql`DELETE FROM "source_documents" WHERE "org_id" = ${orgId}`,
  sql`DELETE FROM "coach_client_attribution" WHERE "client_org_id" = ${orgId} OR "coach_org_id" = ${orgId} OR "transferred_from_coach_org_id" = ${orgId}`,
  sql`DELETE FROM "coach_client_access" WHERE "client_org_id" = ${orgId} OR "coach_org_id" = ${orgId}`,
  sql`DELETE FROM "inquiries" WHERE "org_id" = ${orgId}`,
  sql`DELETE FROM "consultant_profiles" WHERE "org_id" = ${orgId}`,
  sql`DELETE FROM "tickets" WHERE "org_id" = ${orgId}`,
  sql`DELETE FROM "oos_files" WHERE "org_id" = ${orgId}`,
  sql`DELETE FROM "workspaces" WHERE "consultant_org_id" = ${orgId} OR "owner_id" = ${orgId}`,
];
// audit_logs is deliberately NOT in the list above: it is an append-only table
// (DO INSTEAD NOTHING rules on UPDATE/DELETE), so a plain DELETE is a silent
// no-op and the org row then fails its RESTRICT FK. It is handled separately in
// hardDeleteOrganization -- the audit trail is preserved, only unlinked.

/**
 * Permanently delete one organization and all its data. Atomic. Throws if the
 * delete fails (caller logs + leaves the org pending for the next sweep).
 */
export async function hardDeleteOrganization(orgId: string): Promise<void> {
  await db.transaction(async (tx) => {
    for (const stmt of NON_CASCADING_DELETES(orgId)) {
      await tx.execute(stmt);
    }
    // Unlink the immutable audit trail: audit_logs.org_id RESTRICTs the org
    // delete, but the table is append-only (audit_no_update DO INSTEAD NOTHING),
    // so a normal UPDATE can't null it. Lift the rule just long enough to set
    // org_id NULL, then restore it. This is transactional -- if the purge rolls
    // back, the rule is restored too, so audit can never be left mutable. The
    // audit rows survive (unlinked); only the org and its content are deleted.
    await tx.execute(sql`ALTER TABLE audit_logs DISABLE RULE audit_no_update`);
    await tx.execute(sql`UPDATE audit_logs SET org_id = NULL WHERE org_id = ${orgId}`);
    await tx.execute(sql`ALTER TABLE audit_logs ENABLE RULE audit_no_update`);
    // The org row delete cascades the ~34 tables that DO have ON DELETE CASCADE.
    await tx.execute(sql`DELETE FROM "organizations" WHERE "id" = ${orgId}`);
  });
  console.log(`[org-purge] hard-deleted organization ${orgId} and all its data`);
}

/**
 * Purge every org whose 7-day grace window has elapsed. Returns how many were
 * purged. Each org is independent: one failure is logged and does not stop the
 * rest.
 */
export async function purgeExpiredOrgs(now: Date = new Date()): Promise<number> {
  const cutoff = purgeCutoff(now);
  const due = await db.select({ id: organizations.id, name: organizations.name })
    .from(organizations)
    .where(and(isNotNull(organizations.deletionRequestedAt), lte(organizations.deletionRequestedAt, cutoff)));

  let purged = 0;
  for (const o of due) {
    try {
      await hardDeleteOrganization(o.id);
      purged++;
    } catch (err) {
      console.error(`[org-purge] FAILED to purge organization ${o.id} (${o.name}) -- left pending, will retry`, err);
    }
  }
  if (purged > 0) console.log(`[org-purge] purged ${purged} organization(s) past their grace window`);
  return purged;
}

let scheduled = false;
/**
 * Daily purge sweep (3:00 AM ET). Mirror of the other in-process schedulers.
 * Only starts when the caller decides (server.ts gates on ENABLE_ORG_PURGE), so
 * the irreversible job stays dormant until explicitly armed.
 */
export function startOrgPurgeScheduler(): void {
  if (scheduled) return;
  scheduled = true;
  cron.schedule('0 3 * * *', () => {
    void purgeExpiredOrgs().catch((err) => console.error('[org-purge] sweep failed', err));
  }, { timezone: 'America/New_York' });
  console.log('[org-purge] daily purge scheduler started (3:00 AM ET)');
}
