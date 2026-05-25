/**
 * Reconciles an org_members row against the chart, by email.
 *
 * Two bugs this service exists to close:
 *
 *  1. Synthetic chart stubs (clerk_user_id LIKE 'chart:%') are created
 *     by team-membership add when an admin pre-attaches a chart human
 *     to a team before that person has signed up. When the real person
 *     later signs up via Clerk, nothing merges the two rows. Today,
 *     acceptInvite() reconciles them but only when the invite carries
 *     an explicit claimed_entity_id. Direct Clerk signups, or invites
 *     without a pre-set claim, leave the stub orphaned forever.
 *
 *  2. Owner signups go through /onboarding/profile, which inserts the
 *     org_members row with claimed_entity_id = null, then calls
 *     placeOwnerOnStarterChart. That function builds the chart entity
 *     and writes the owner's email onto it, but never links back to the
 *     org_members row -- so the owner shows up on the chart but their
 *     own org_members row stays unclaimed.
 *
 * The reconciler does one thing: for a given member, find every chart
 * human whose contact_email matches that member's email, merge any
 * other rows pointing at those tiles into this member, and update the
 * member's claimed tiles. It is idempotent and safe to call from any
 * signup or invite-accept path.
 *
 * David flagged both bugs 2026-05-24 after the Sneeze It chart drifted
 * (Bogdan's Clerk row claimed HUM_DAVIDSTEEL; David's claimed nothing).
 */

import { and, eq } from 'drizzle-orm';
import { db } from '../config/database.js';
import { orgMembers, oosFiles, teamMemberships } from '../db/schema.js';

interface ChartHuman {
  id?: string;
  name?: string;
  contact_email?: string | null;
}

export interface ReconcileResult {
  // Tiles now claimed by this member (after the merge).
  claims: string[];
  // Count of stub rows that were merged into this member.
  stubsMerged: number;
  // Count of team_memberships moved from stubs to this member.
  membershipsMoved: number;
  // Tiles that match this member's email on the chart.
  matchedTiles: string[];
}

const EMPTY: ReconcileResult = { claims: [], stubsMerged: 0, membershipsMoved: 0, matchedTiles: [] };

function normalizeEmail(s: string | null | undefined): string | null {
  if (!s) return null;
  const trimmed = String(s).trim().toLowerCase();
  return trimmed || null;
}

/**
 * Read the latest non-archived chart's humans for an org. Charts live
 * in oos_files (jsonb frontmatter, entities.humans). We pick the most
 * recently updated file that isn't archived -- the draft if there is
 * one, otherwise the published version.
 */
async function loadChartHumans(orgId: string): Promise<ChartHuman[]> {
  const rows = await db
    .select({
      id: oosFiles.id,
      status: oosFiles.status,
      updatedAt: oosFiles.updatedAt,
      frontmatter: oosFiles.frontmatter,
    })
    .from(oosFiles)
    .where(eq(oosFiles.orgId, orgId));

  const live = rows.filter(r => r.status !== 'archived');
  if (live.length === 0) return [];
  live.sort((a, b) => (b.updatedAt?.getTime() ?? 0) - (a.updatedAt?.getTime() ?? 0));

  const fm = (live[0].frontmatter as Record<string, unknown>) || {};
  const ents = (fm.entities as Record<string, unknown>) || {};
  const humans = (ents.humans as ChartHuman[]) || [];
  return Array.isArray(humans) ? humans : [];
}

export async function reconcileChartClaimByEmail(
  orgId: string,
  memberId: string,
): Promise<ReconcileResult> {
  const [me] = await db
    .select()
    .from(orgMembers)
    .where(and(eq(orgMembers.orgId, orgId), eq(orgMembers.id, memberId)))
    .limit(1);
  if (!me) return EMPTY;

  const myEmail = normalizeEmail(me.email);
  if (!myEmail) return EMPTY;
  // Stubs have synthetic clerk ids -- never reconcile a stub onto itself.
  if (me.clerkUserId?.startsWith('chart:')) return EMPTY;

  const humans = await loadChartHumans(orgId);
  const matched = humans
    .filter(h => h && h.id && normalizeEmail(h.contact_email) === myEmail)
    .map(h => String(h.id));
  if (matched.length === 0) return EMPTY;

  // For each matched tile, look for other org_members in this org that
  // already point at it. Merge stubs in (move team_memberships, delete
  // the stub row). For real users with the same claim, leave them alone
  // -- auto-merging two real Clerk accounts is too risky to do silently.
  const others = (await db.select().from(orgMembers).where(eq(orgMembers.orgId, orgId)))
    .filter(o => o.id !== memberId)
    .filter(o => {
      const ids = ((o.claimedEntityIds as unknown) as string[] | null) || [];
      const all = new Set<string>([...(ids || []), ...(o.claimedEntityId ? [o.claimedEntityId] : [])]);
      return matched.some(t => all.has(t));
    });

  let stubsMerged = 0;
  let membershipsMoved = 0;
  for (const other of others) {
    if (!other.clerkUserId?.startsWith('chart:')) {
      // Real user with conflicting claim. Don't touch -- needs human review.
      continue;
    }
    const stubMemberships = await db
      .select()
      .from(teamMemberships)
      .where(eq(teamMemberships.memberId, other.id));
    for (const tm of stubMemberships) {
      try {
        await db
          .update(teamMemberships)
          .set({ memberId })
          .where(eq(teamMemberships.id, tm.id));
        membershipsMoved += 1;
      } catch {
        // Unique (team_id, member_id) collision -- the real member is
        // already on this team. Drop the stub's duplicate.
        await db.delete(teamMemberships).where(eq(teamMemberships.id, tm.id));
      }
    }
    await db.delete(orgMembers).where(eq(orgMembers.id, other.id));
    stubsMerged += 1;
  }

  // Replace the member's claims with the email-matched tiles. If their
  // existing primary claim happens to be one of the matched tiles, keep
  // it as primary (preserves user intent in the common case); otherwise
  // promote the first matched tile. This wipes out wrong claims like
  // Bogdan's pre-existing HUM_DAVIDSTEEL while still letting a user
  // legitimately hold multiple email-matched tiles.
  const primary =
    me.claimedEntityId && matched.includes(me.claimedEntityId)
      ? me.claimedEntityId
      : matched[0];

  await db
    .update(orgMembers)
    .set({
      claimedEntityId: primary,
      claimedEntityIds: matched as unknown as string[],
      updatedAt: new Date(),
    })
    .where(eq(orgMembers.id, memberId));

  return {
    claims: matched,
    stubsMerged,
    membershipsMoved,
    matchedTiles: matched,
  };
}
