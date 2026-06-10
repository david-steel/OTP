// In-app notifications for the nav alert bell.
//
// Recipients are CHART SEATS (external ids like HUM_DAVIDSTEEL), not user
// accounts: every work object (todo, rock, KPI) is owned by a seat, so
// emitting to the seat needs no user lookup at write time. At read time the
// signed-in user's claimed seats (org_members.claimed_entity_ids) determine
// which notifications are theirs.
//
// Emission is best-effort: callers wrap notify() in try/catch so a
// notification failure can never break the operation that triggered it.
import { and, eq, desc, isNull, inArray, sql } from 'drizzle-orm';
import { db } from '../config/database.js';
import { notifications, orgMembers } from '../db/schema.js';

export interface NotifyInput {
  type: string;            // e.g. 'todo.assigned' | 'todo.completed' | 'todo.closed_out'
  title: string;
  href?: string | null;
  actorName?: string | null;
}

export async function notify(orgId: string, recipientExternalId: string, input: NotifyInput) {
  if (!recipientExternalId) return;
  await db.insert(notifications).values({
    organizationId: orgId,
    recipientExternalId,
    type: input.type,
    title: input.title.slice(0, 500),
    href: input.href || null,
    actorName: input.actorName || null,
  });
}

// The signed-in user's identity inside one org: their claimed seats plus a
// display name usable as the actor label on notifications they generate.
export async function resolveMemberIdentity(orgId: string, clerkUserId: string | null | undefined): Promise<{ seats: string[]; displayName: string | null }> {
  if (!clerkUserId) return { seats: [], displayName: null };
  const [m] = await db
    .select({ claimedEntityId: orgMembers.claimedEntityId, claimedEntityIds: orgMembers.claimedEntityIds, displayName: orgMembers.displayName })
    .from(orgMembers)
    .where(and(eq(orgMembers.orgId, orgId), eq(orgMembers.clerkUserId, clerkUserId)))
    .limit(1);
  if (!m) return { seats: [], displayName: null };
  const seats = new Set<string>();
  if (Array.isArray(m.claimedEntityIds)) for (const id of m.claimedEntityIds) if (typeof id === 'string' && id) seats.add(id);
  if (m.claimedEntityId) seats.add(m.claimedEntityId);
  return { seats: Array.from(seats), displayName: m.displayName || null };
}

export async function listNotifications(orgId: string, seatIds: string[], limit = 20) {
  if (seatIds.length === 0) return [];
  return await db
    .select()
    .from(notifications)
    .where(and(eq(notifications.organizationId, orgId), inArray(notifications.recipientExternalId, seatIds)))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function unreadCount(orgId: string, seatIds: string[]): Promise<number> {
  if (seatIds.length === 0) return 0;
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(notifications)
    .where(and(
      eq(notifications.organizationId, orgId),
      inArray(notifications.recipientExternalId, seatIds),
      isNull(notifications.readAt),
    ));
  return row?.n ?? 0;
}

export async function markAllRead(orgId: string, seatIds: string[]) {
  if (seatIds.length === 0) return;
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(
      eq(notifications.organizationId, orgId),
      inArray(notifications.recipientExternalId, seatIds),
      isNull(notifications.readAt),
    ));
}
