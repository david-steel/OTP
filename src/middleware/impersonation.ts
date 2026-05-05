/**
 * Super-admin impersonation. Lets a super admin "View as <user>" so they
 * can debug what a real customer sees without screen-sharing.
 *
 * Path (a) implementation -- signed cookie that overrides the org_member
 * decorator's lookup for routing purposes only. The actual Clerk session
 * stays as the super admin's, so any write paths (PATCH/DELETE/POST) are
 * authored by them, not the impersonated user. Banner makes the active
 * impersonation visible on every page; "Exit" clears the cookie.
 *
 * Audit log entries are written every time impersonation starts and ends
 * so the trail exists.
 *
 * Owner role check is applied at the route level (super-admin gate from
 * existing admin routes -- isSuperAdmin from middleware/super-admin.ts).
 */
import { createHmac, timingSafeEqual } from 'node:crypto';
import { db } from '../config/database.js';
import { orgMembers, organizations, auditLogs } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { createAuditEntry } from '../services/audit-logger.js';

const COOKIE_NAME = 'otp_impersonation';
const TTL_HOURS = 4;

function getSecret(): string {
  return process.env.IMPERSONATION_SECRET
    || process.env.CLERK_SECRET_KEY
    || 'dev-impersonation-secret-do-not-use-in-prod';
}

function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('hex');
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

export interface ImpersonationPayload {
  /** Clerk user id of the super admin who initiated impersonation. */
  by: string;
  /** Clerk user id of the target user being impersonated. */
  as: string;
  /** Target org_members.id (cached for fast lookup). */
  memberId: string;
  /** Target org id. */
  orgId: string;
  /** Target display name (cached for the banner). */
  name: string;
  /** Expiry epoch millis. */
  exp: number;
}

export function encodeImpersonationCookie(payload: ImpersonationPayload): string {
  const json = JSON.stringify(payload);
  const b64 = Buffer.from(json).toString('base64url');
  const sig = sign(b64);
  return `${b64}.${sig}`;
}

export function decodeImpersonationCookie(value: string | undefined | null): ImpersonationPayload | null {
  if (!value) return null;
  const [b64, sig] = value.split('.');
  if (!b64 || !sig) return null;
  const expected = sign(b64);
  if (!safeEqual(sig, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(b64, 'base64url').toString('utf8')) as ImpersonationPayload;
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export const IMPERSONATION_COOKIE_NAME = COOKIE_NAME;

export interface StartImpersonationOpts {
  /** Clerk user id of the super admin (verified upstream). */
  byClerkUserId: string;
  /** Target org_members.id to view as. */
  targetMemberId: string;
}

export interface StartedImpersonation {
  cookieValue: string;
  cookieMaxAgeSec: number;
  payload: ImpersonationPayload;
}

export async function startImpersonation(opts: StartImpersonationOpts): Promise<StartedImpersonation> {
  const [m] = await db.select().from(orgMembers).where(eq(orgMembers.id, opts.targetMemberId)).limit(1);
  if (!m) throw new Error('NOT_FOUND: target member not found');
  if (!m.clerkUserId) throw new Error('TARGET_HAS_NO_CLERK_USER: cannot impersonate a placeholder member row');

  const ttlMs = TTL_HOURS * 60 * 60 * 1000;
  const payload: ImpersonationPayload = {
    by: opts.byClerkUserId,
    as: m.clerkUserId,
    memberId: m.id,
    orgId: m.orgId,
    name: m.displayName || m.email || 'member',
    exp: Date.now() + ttlMs,
  };

  // Audit log: impersonation started.
  await db.insert(auditLogs).values(createAuditEntry('impersonation.started', 'org_member', {
    orgId: m.orgId,
    entityId: m.id,
    actorType: 'user',
    details: {
      by_clerk_user_id: opts.byClerkUserId,
      target_clerk_user_id: m.clerkUserId,
      target_name: payload.name,
      ttl_hours: TTL_HOURS,
    },
  }));

  return {
    cookieValue: encodeImpersonationCookie(payload),
    cookieMaxAgeSec: Math.floor(ttlMs / 1000),
    payload,
  };
}

export async function endImpersonation(payload: ImpersonationPayload): Promise<void> {
  await db.insert(auditLogs).values(createAuditEntry('impersonation.ended', 'org_member', {
    orgId: payload.orgId,
    entityId: payload.memberId,
    actorType: 'user',
    details: {
      by_clerk_user_id: payload.by,
      target_clerk_user_id: payload.as,
      target_name: payload.name,
    },
  }));
}

/**
 * Resolve the impersonated org member. Returns the FULL member row + their
 * org so the caller can swap routing context. Validates that the calling
 * super-admin's clerk userId matches the cookie's `by` field (defence in
 * depth: cookie tampering already prevented by HMAC, but this stops a
 * super-admin from being impersonated by another super-admin's stale cookie).
 */
export async function resolveImpersonatedContext(
  payload: ImpersonationPayload,
  callerClerkUserId: string,
): Promise<{
  member: typeof orgMembers.$inferSelect;
  org: typeof organizations.$inferSelect;
} | null> {
  if (payload.by !== callerClerkUserId) return null;
  const [member] = await db.select().from(orgMembers).where(eq(orgMembers.id, payload.memberId)).limit(1);
  if (!member) return null;
  const [org] = await db.select().from(organizations).where(eq(organizations.id, member.orgId)).limit(1);
  if (!org) return null;
  return { member, org };
}
