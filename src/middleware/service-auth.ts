/**
 * Service-to-service auth for OTP-family products (orger-next, future SDKs).
 *
 * Flow:
 *   1. Caller proves trust with X-OTP-Service-Key matching env OTP_SERVICE_KEY
 *      (constant-time compared; rotated via env).
 *   2. Caller declares which Clerk user it's acting on behalf of via
 *      X-OTP-Act-As-Clerk-User. That user MUST have an active org_members row.
 *   3. We resolve their org_member and the downstream gates (checkChartEdit /
 *      checkChartCreate) enforce the act-as user's role exactly as if they
 *      were Clerk-authed.
 *
 * The service key authorizes the bridge; the act-as user authorizes the
 * action. A compromised bridge host cannot escalate beyond a real user's tile
 * permissions, but it CAN act as any Clerk user it knows the ID for. Rotate
 * the key on suspected leak.
 */
import type { FastifyRequest } from 'fastify';
import { timingSafeEqual } from 'crypto';
import { eq, and } from 'drizzle-orm';
import { db } from '../config/database.js';
import { orgMembers } from '../db/schema.js';
import type { CurrentMember } from './guards.js';
import type { Role } from '../services/membership.js';

const SERVICE_KEY_HEADER = 'x-otp-service-key';
const ACT_AS_HEADER = 'x-otp-act-as-clerk-user';

export interface ServiceAuthContext {
  clerkUserId: string;
  member: CurrentMember;
}

function constantTimeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export async function resolveServiceAuth(
  request: FastifyRequest,
): Promise<ServiceAuthContext | null> {
  const expected = process.env.OTP_SERVICE_KEY;
  if (!expected || expected.length < 32) return null;

  const provided = request.headers[SERVICE_KEY_HEADER];
  if (typeof provided !== 'string' || !provided) return null;
  if (!constantTimeEqual(provided, expected)) return null;

  const actAs = request.headers[ACT_AS_HEADER];
  if (typeof actAs !== 'string' || !actAs.startsWith('user_')) return null;

  const [row] = await db.select({
    id: orgMembers.id,
    orgId: orgMembers.orgId,
    clerkUserId: orgMembers.clerkUserId,
    role: orgMembers.role,
    status: orgMembers.status,
    email: orgMembers.email,
    displayName: orgMembers.displayName,
    featureAccess: orgMembers.featureAccess,
    dataAccess: orgMembers.dataAccess,
    agentAccess: orgMembers.agentAccess,
    preferences: orgMembers.preferences,
  })
    .from(orgMembers)
    .where(and(
      eq(orgMembers.clerkUserId, actAs),
      eq(orgMembers.status, 'active'),
    ))
    .limit(1);

  if (!row) return null;

  return {
    clerkUserId: actAs,
    member: {
      id: row.id,
      orgId: row.orgId,
      clerkUserId: row.clerkUserId!,
      role: row.role as Role,
      status: row.status,
      email: row.email,
      displayName: row.displayName,
      featureAccess: (row.featureAccess as Record<string, boolean>) || {},
      dataAccess: (row.dataAccess as Record<string, boolean>) || {},
      agentAccess: (row.agentAccess as Record<string, boolean>) || {},
      preferences: (row.preferences as Record<string, unknown>) || {},
    },
  };
}
