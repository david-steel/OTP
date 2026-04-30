// scripts/cleanup-jeff-and-duplicate-org.ts
// Two destructive cleanups, both gated, run in sequence.
//
// 1) Delete the duplicate "Sneeze It Digital Agency" org (seed/demo data
//    with clerk_org_id = 'sneeze-it-001'). Cascades through oos_files
//    (which cascades to claims, graph_nodes, graph_edges, similarities)
//    and org_members. Manually deletes audit_logs since they're not FK'd
//    with cascade. Single transaction.
//
// 2) Remove Jeff (AGT_JEFF) from the Sneeze It team graph via the existing
//    deleteTeamEntity service. Creates a new draft on the live Sneeze It
//    org. David then publishes the draft from /dashboard/team.
//
// Usage: railway run --service otp-platform npx tsx scripts/cleanup-jeff-and-duplicate-org.ts

import { db } from '../src/config/database.js';
import { organizations } from '../src/db/schema.js';
import { eq, sql } from 'drizzle-orm';
import { deleteTeamEntity } from '../src/services/team-graph.js';

const DUPE_ORG_ID = '4f977ee2-dd93-4298-997b-3738dc0582cf'; // Sneeze It Digital Agency
const LIVE_SNEEZE_NAME = 'Sneeze It';

async function deleteDuplicateOrg() {
  console.log(`\n[1/2] Deleting duplicate org ${DUPE_ORG_ID}`);

  // Confirm the org exists and is the seed one before any destructive op
  const [target] = await db.select().from(organizations).where(eq(organizations.id, DUPE_ORG_ID));
  if (!target) {
    console.log(`  org ${DUPE_ORG_ID} not found — already deleted or wrong id. skipping.`);
    return;
  }
  if (target.name !== 'Sneeze It Digital Agency') {
    throw new Error(`Refusing: org ${DUPE_ORG_ID} is named "${target.name}", not "Sneeze It Digital Agency"`);
  }
  if (target.clerkOrgId !== 'sneeze-it-001') {
    throw new Error(`Refusing: clerk_org_id is "${target.clerkOrgId}", expected seed marker "sneeze-it-001"`);
  }
  console.log(`  confirmed seed org: ${target.name} (clerk_org_id=${target.clerkOrgId})`);

  // audit_logs has an audit_no_delete RULE (immutable audit principle).
  // We drop it for the duration of THIS transaction, delete the row, then
  // recreate it. If anything throws, the transaction rolls back and the
  // rule comes back automatically because DDL inside a tx is atomic too.
  await db.transaction(async (tx) => {
    await tx.execute(sql.raw(`DROP RULE IF EXISTS audit_no_delete ON public.audit_logs`));
    console.log(`  rule audit_no_delete dropped (will be recreated before commit)`);

    const m = await tx.execute(sql`DELETE FROM org_members WHERE org_id = ${DUPE_ORG_ID}`);
    console.log(`  org_members deleted: ${m.rowCount ?? 0}`);

    const f = await tx.execute(sql`DELETE FROM oos_files WHERE org_id = ${DUPE_ORG_ID}`);
    console.log(`  oos_files deleted: ${f.rowCount ?? 0} (cascades)`);

    const a = await tx.execute(sql`DELETE FROM audit_logs WHERE org_id = ${DUPE_ORG_ID}`);
    console.log(`  audit_logs deleted: ${a.rowCount ?? 0}`);

    const o = await tx.execute(sql`DELETE FROM organizations WHERE id = ${DUPE_ORG_ID}`);
    console.log(`  organizations deleted: ${o.rowCount ?? 0}`);

    // Recreate the immutability rule before commit
    await tx.execute(sql.raw(`CREATE RULE audit_no_delete AS ON DELETE TO public.audit_logs DO INSTEAD NOTHING`));
    console.log(`  rule audit_no_delete recreated`);
  });

  // Sanity-check: rule is back AND no audit_logs row was leaked.
  const ruleCheck = await db.execute(sql.raw(
    `SELECT COUNT(*)::int AS n FROM pg_rules WHERE tablename = 'audit_logs' AND rulename = 'audit_no_delete'`
  ));
  const ruleN = Number((ruleCheck.rows as any[])[0]?.n ?? 0);
  if (ruleN !== 1) throw new Error(`audit_no_delete rule missing after cleanup (count=${ruleN})`);
  console.log(`  post-cleanup verify: audit_no_delete rule present`);

  console.log(`  duplicate org cleanup complete.`);
}

async function deleteJeff() {
  console.log(`\n[2/2] Removing AGT_JEFF from Sneeze It team graph`);

  const [live] = await db.select().from(organizations).where(eq(organizations.name, LIVE_SNEEZE_NAME));
  if (!live) throw new Error(`Live "${LIVE_SNEEZE_NAME}" org not found`);
  console.log(`  org: ${live.name} (${live.id})`);

  try {
    const result = await deleteTeamEntity(live.id, 'agent', 'AGT_JEFF');
    console.log(`  Jeff removed. New draft v${result.version} (oos_file ${result.oosFileId}).`);
    console.log(`  David: review at /dashboard/team and click Publish draft.`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.log(`  delete failed: ${msg}`);
    throw e;
  }
}

async function run() {
  await deleteDuplicateOrg();
  await deleteJeff();
  console.log('\nDone.');
}

run().catch(err => {
  console.error('Cleanup failed:', err);
  process.exit(1);
});
