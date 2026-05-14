// Coach-client invite routes (Phase 2 -- ecosystem).
//
//   GET /join/:token   -> coach-branded invite landing. Anonymous visitors
//                         see "Joel Swanson invited you to OTP" framing.
//                         Signed-in visitors get a one-click "Accept" CTA.
//   POST /join/:token  -> claim the invite. Creates the client's org if
//                         needed, then writes the attribution + access
//                         records that tie this client to the coach.
//                         Attribution is immutable (commission); access is
//                         revocable (visibility).
import type { FastifyInstance } from 'fastify';
import { getAuth } from '@clerk/fastify';
import { createClerkClient } from '@clerk/backend';
import { eq, and, isNull, sql } from 'drizzle-orm';
import { db } from '../../config/database.js';
import {
  organizations,
  consultantProfiles,
  coachClientAttribution,
  coachClientAccess,
} from '../../db/schema.js';
import { sendEmail } from '../../config/email.js';

const BASE_URL = 'https://orgtp.com';
const DAVID_EMAIL = 'dsteel@sneeze.it';

async function fetchClerkPrimaryEmail(clerkUserId: string): Promise<string | null> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey || !clerkUserId.startsWith('user_')) return null;
  try {
    const clerk = createClerkClient({ secretKey });
    const user = await clerk.users.getUser(clerkUserId);
    const primary = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId);
    return primary?.emailAddress || user.emailAddresses[0]?.emailAddress || null;
  } catch {
    return null;
  }
}

function escapeHtml(s: string): string {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

export default async function coachInviteRoutes(app: FastifyInstance) {

  // ───── GET /join/:token ───────────────────────────────────────
  app.get<{ Params: { token: string } }>('/join/:token', async (request, reply) => {
    const { token } = request.params;

    const [coach] = await db
      .select()
      .from(consultantProfiles)
      .where(eq(consultantProfiles.inviteToken, token))
      .limit(1);

    if (!coach) {
      return reply.status(404).view('pages/home', {
        title: 'Invite not found - OTP',
        description: 'This invite link is not valid.',
      });
    }

    const auth = getAuth(request);
    const isSignedIn = !!auth.userId;

    // Has this signed-in user already accepted this coach's invite?
    let alreadyLinked = false;
    if (isSignedIn) {
      const [userOrg] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.clerkOrgId, auth.userId))
        .limit(1);
      if (userOrg) {
        const existing = await db
          .select()
          .from(coachClientAccess)
          .where(and(
            eq(coachClientAccess.clientOrgId, userOrg.id),
            eq(coachClientAccess.coachOrgId, coach.orgId),
            isNull(coachClientAccess.revokedAt),
          ))
          .limit(1);
        alreadyLinked = existing.length > 0;
      }
    }

    return reply.view('pages/coach-invite', {
      title: `${coach.displayName} invited you to OTP`,
      description: `${coach.displayName} is a Founding 25 coach on OTP. Join their ecosystem and get the operating layer for your AI-augmented team.`,
      noindex: true,
      coach,
      token,
      isSignedIn,
      alreadyLinked,
      signInUrl: `/sign-in?redirect=${encodeURIComponent('/join/' + token)}`,
      signUpUrl: `/sign-up?redirect=${encodeURIComponent('/join/' + token)}`,
      coachPublicUrl: `${BASE_URL}/expert/${coach.slug}`,
    });
  });

  // ───── POST /join/:token ──────────────────────────────────────
  app.post<{ Params: { token: string } }>('/join/:token', async (request, reply) => {
    const { token } = request.params;
    const auth = getAuth(request);

    if (!auth.userId) {
      return reply.redirect('/sign-in?redirect=' + encodeURIComponent('/join/' + token));
    }

    const [coach] = await db
      .select()
      .from(consultantProfiles)
      .where(eq(consultantProfiles.inviteToken, token))
      .limit(1);

    if (!coach) {
      return reply.status(404).send({ error: 'Invite not found' });
    }

    // Resolve or create the client's org (matches the coach-claim pattern --
    // clerkOrgId points at the user's Clerk user-id for a solo org).
    let [clientOrg] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.clerkOrgId, auth.userId))
      .limit(1);

    if (!clientOrg) {
      const clerkEmail = await fetchClerkPrimaryEmail(auth.userId);
      const guessName = clerkEmail ? clerkEmail.split('@')[0] : 'New';
      const [created] = await db
        .insert(organizations)
        .values({
          clerkOrgId: auth.userId,
          name: `${guessName}'s Workspace`,
          industry: 'unspecified',
          size: 'small',
        })
        .returning();
      clientOrg = created;
    }

    // Guardrail: a coach cannot invite themselves as their own client.
    if (clientOrg.id === coach.orgId) {
      return reply.redirect(`/join/${token}?error=self`);
    }

    // 1. Attribution (immutable). Only insert if no current attribution
    //    exists for this client. If they're already attributed to another
    //    coach we leave that record alone -- transfers require admin.
    const [existingAttribution] = await db
      .select()
      .from(coachClientAttribution)
      .where(and(
        eq(coachClientAttribution.clientOrgId, clientOrg.id),
        isNull(coachClientAttribution.transferredAt),
      ))
      .limit(1);

    if (!existingAttribution) {
      await db.insert(coachClientAttribution).values({
        clientOrgId: clientOrg.id,
        coachOrgId: coach.orgId,
        coachProfileId: coach.id,
        attributionSource: 'invite_link',
        inviteTokenUsed: token,
      });
    }

    // 2. Access (revocable). Upsert -- if a previous revoked access row
    //    exists for this pair, re-grant by clearing revokedAt rather than
    //    inserting a duplicate (the (client, coach) pair is unique).
    const [existingAccess] = await db
      .select()
      .from(coachClientAccess)
      .where(and(
        eq(coachClientAccess.clientOrgId, clientOrg.id),
        eq(coachClientAccess.coachOrgId, coach.orgId),
      ))
      .limit(1);

    if (!existingAccess) {
      await db.insert(coachClientAccess).values({
        clientOrgId: clientOrg.id,
        coachOrgId: coach.orgId,
        permissionLevel: 'full_visibility',
      });
    } else if (existingAccess.revokedAt !== null) {
      await db
        .update(coachClientAccess)
        .set({ revokedAt: null, revokedByUserId: null, grantedAt: new Date() })
        .where(eq(coachClientAccess.id, existingAccess.id));
    }

    // Notify David + the coach. Wrap in try/catch -- failures don't block.
    try {
      await sendEmail({
        to: DAVID_EMAIL,
        subject: `[OTP Coach Ecosystem] New client joined ${coach.displayName}'s practice`,
        html: `<p>A new client just joined <strong>${escapeHtml(coach.displayName)}</strong>'s OTP ecosystem via their invite link.</p>
<p>Coach: ${escapeHtml(coach.displayName)} (${escapeHtml(coach.slug)})<br/>
Client org id: ${escapeHtml(clientOrg.id)}<br/>
Client clerk user: ${escapeHtml(auth.userId)}<br/>
Attribution: ${existingAttribution ? 'pre-existing (not changed)' : 'NEW -- attributed to this coach'}<br/>
Access: ${existingAccess ? (existingAccess.revokedAt ? 're-granted' : 'pre-existing') : 'NEW -- full_visibility'}</p>`,
        from: 'OTP Notifications <notifications@mail.orgtp.com>',
      });
    } catch (err) {
      console.warn('[invite] David notification failed:', err);
    }

    if (coach.contactEmail && coach.contactEmail.toLowerCase() !== DAVID_EMAIL.toLowerCase()) {
      try {
        await sendEmail({
          to: coach.contactEmail,
          subject: `New client joined your OTP ecosystem`,
          html: `<p>Hi ${escapeHtml((coach.displayName || '').split(' ')[0])},</p>
<p>A new client just joined your OTP ecosystem via your invite link. You'll see them in your coach view as soon as the dashboard rolls out this week.</p>
<p>— David</p>`,
          from: 'David Steel <david@mail.orgtp.com>',
          replyTo: 'David Steel <dsteel@sneeze.it>',
        });
      } catch (err) {
        console.warn('[invite] coach notification failed:', err);
      }
    }

    return reply.redirect(`/join/${token}/done`);
  });

  // ───── GET /join/:token/done ──────────────────────────────────
  app.get<{ Params: { token: string } }>('/join/:token/done', async (request, reply) => {
    const { token } = request.params;
    const [coach] = await db
      .select()
      .from(consultantProfiles)
      .where(eq(consultantProfiles.inviteToken, token))
      .limit(1);
    return reply.view('pages/coach-invite-done', {
      title: 'You\'re in - OTP',
      description: 'You\'ve joined the OTP ecosystem.',
      noindex: true,
      coach,
      dashboardUrl: '/dashboard',
    });
  });
}
