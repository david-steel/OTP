// Web push delivery for the alert bell.
//
// Feature-flagged by env: VAPID_PUBLIC_KEY + VAPID_PRIVATE_KEY (generated
// once with `npx web-push generate-vapid-keys`, set on Railway). With the
// keys absent, pushEnabled is false and everything degrades to the in-app
// bell only -- no errors, no broken subscribe button.
//
// Delivery is per chart seat: notifications.notify() emits to a seat;
// here the seat is resolved to org members whose claimed tiles include it,
// then to each member's browser subscriptions. Dead endpoints (404/410
// from the push service) are pruned on the spot.
import webpush from 'web-push';
import { and, eq, inArray, or, sql } from 'drizzle-orm';
import { db } from '../config/database.js';
import { orgMembers, pushSubscriptions } from '../db/schema.js';

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:dsteel@sneeze.it';

export const pushEnabled = !!(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);

if (pushEnabled) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

export function getVapidPublicKey(): string {
  return VAPID_PUBLIC_KEY;
}

export interface PushPayload {
  title: string;
  body: string;
  href?: string | null;
}

export async function sendPushToSeat(orgId: string, seatExternalId: string, payload: PushPayload): Promise<void> {
  if (!pushEnabled || !seatExternalId) return;

  // Seat -> users: members whose primary claim or claim list includes the seat.
  const members = await db
    .select({ clerkUserId: orgMembers.clerkUserId })
    .from(orgMembers)
    .where(and(
      eq(orgMembers.orgId, orgId),
      or(
        eq(orgMembers.claimedEntityId, seatExternalId),
        sql`${orgMembers.claimedEntityIds} @> ${JSON.stringify([seatExternalId])}::jsonb`,
      ),
    ));
  const userIds = Array.from(new Set(members.map(m => m.clerkUserId).filter(Boolean)));
  if (userIds.length === 0) return;

  const subs = await db
    .select()
    .from(pushSubscriptions)
    .where(and(eq(pushSubscriptions.organizationId, orgId), inArray(pushSubscriptions.clerkUserId, userIds)));
  if (subs.length === 0) return;

  const body = JSON.stringify({
    title: payload.title,
    body: payload.body,
    href: payload.href || '/dashboard',
  });

  await Promise.all(subs.map(async (s) => {
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        body,
        { TTL: 60 * 60 * 24 },
      );
      await db.update(pushSubscriptions)
        .set({ lastUsedAt: new Date() })
        .where(eq(pushSubscriptions.id, s.id));
    } catch (err: any) {
      // 404/410 = the browser unsubscribed or the endpoint expired.
      if (err && (err.statusCode === 404 || err.statusCode === 410)) {
        try { await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, s.id)); } catch { /* already gone */ }
      }
      // Anything else (throttling, transient network) is dropped silently:
      // push is best-effort on top of the in-app bell.
    }
  }));
}

export async function saveSubscription(orgId: string, clerkUserId: string, sub: { endpoint: string; keys: { p256dh: string; auth: string } }, userAgent?: string | null) {
  await db.insert(pushSubscriptions)
    .values({
      organizationId: orgId,
      clerkUserId,
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
      userAgent: (userAgent || '').slice(0, 500) || null,
    })
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: {
        organizationId: orgId,
        clerkUserId,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
        lastUsedAt: new Date(),
      },
    });
}

export async function deleteSubscription(clerkUserId: string, endpoint: string) {
  await db.delete(pushSubscriptions)
    .where(and(eq(pushSubscriptions.clerkUserId, clerkUserId), eq(pushSubscriptions.endpoint, endpoint)));
}
