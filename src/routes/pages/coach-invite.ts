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
      ogImage: `${BASE_URL}/public/images/og-join.png`,
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
        const coachFirstName = escapeHtml((coach.displayName || '').split(' ')[0] || 'there');
        await sendEmail({
          to: coach.contactEmail,
          subject: `New client joined your OTP practice`,
          html: `<p>Hi ${coachFirstName},</p>
<p>A new client just joined your OTP ecosystem via your invite link. They've been attributed to you (perpetuity per the Founder Certified Coach agreement) and you have full coach-view access to their workspace.</p>
<p>See them in your practice dashboard now:<br/>
<a href="${BASE_URL}/dashboard/practice" style="color:#1f2937;font-weight:600;">${BASE_URL}/dashboard/practice →</a></p>
<p>— David</p>`,
          from: 'David Steel <david@mail.orgtp.com>',
          replyTo: 'David Steel <dsteel@sneeze.it>',
          tags: [
            { name: 'campaign', value: 'coach_new_client_notify' },
            { name: 'slug', value: coach.slug.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 80) },
          ],
        });
      } catch (err) {
        console.warn('[invite] coach notification failed:', err);
      }
    }

    // Client welcome email -- the equivalent of the coach welcome that we
    // added to coach-claim.ts. When a client accepts a coach invite they
    // previously got NOTHING from the platform (same silence gap that hurt
    // Joel). This sends them the basics: what OTP is, who their coach is,
    // what to do next, and clear control language ('you can fire your coach
    // anytime') for trust.
    const clientEmail = await fetchClerkPrimaryEmail(auth.userId);
    if (clientEmail && clientEmail.toLowerCase() !== DAVID_EMAIL.toLowerCase()) {
      try {
        const coachFirst = escapeHtml((coach.displayName || 'Your coach').split(' ')[0]);
        const coachName = escapeHtml(coach.displayName || 'your coach');
        await sendEmail({
          to: clientEmail,
          subject: `Welcome to OTP — ${coachFirst} set you up`,
          replyTo: 'David Steel <dsteel@sneeze.it>',
          from: 'David Steel <david@mail.orgtp.com>',
          tags: [
            { name: 'campaign', value: 'client_welcome_via_coach_invite' },
            { name: 'coach_slug', value: coach.slug.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 80) },
          ],
          html: `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;max-width:640px;margin:0;padding:24px;line-height:1.55;font-size:15px;">

<p>Welcome to OTP. ${coachFirst} just brought you into their practice on our platform — a few quick things so you know what you've signed up for.</p>

<p><strong>WHAT OTP IS</strong><br/>
It's the operating layer your team — humans and AI agents — runs on. One accountability chart. Each seat has a name, a role, a KPI, and an SOP. When you click an AI seat you see what it's doing, the number it's hitting, who it reports to. When you click a human seat: same.</p>

<p>Underneath it does more (carries SOPs into the AI's runtime so they don't drift, lets agents talk to each other without you in the middle) but the surface is the chart.</p>

<p><strong>WHAT YOU JUST GOT</strong><br/>
A private workspace for your team. Yours. Your data, your chart, your KPIs. Free during ${coachFirst}'s Founder Certified Coach cohort — no card, no trial timer.</p>

<p><strong>WHAT YOUR COACH SEES</strong><br/>
${coachName} has a coach-view of your workspace so they can support you across all their clients. Same as a CPA seeing your books, or a fractional COO seeing your ops dashboard. You're in control:</p>
<ul style="margin:8px 0 12px 20px;padding:0;">
  <li>You can revoke their access from settings at any time: <a href="${BASE_URL}/settings/coaches" style="color:#1f2937;">${BASE_URL}/settings/coaches →</a></li>
  <li>Your data stays in your workspace — it doesn't get shared with their other clients.</li>
</ul>

<p><strong>WHAT TO DO FIRST</strong><br/>
Head to your dashboard and start mapping your team — even just three or four seats. The chart fills in as you build:<br/>
<a href="${BASE_URL}/dashboard" style="color:#1f2937;font-weight:600;">${BASE_URL}/dashboard →</a></p>

<p>Questions? Reply to this email — I read everything during the Founding cohort.</p>

<p>— David Steel<br/>
Founder, OTP</p>

</body></html>`,
        });
      } catch (err) {
        console.warn('[invite] client welcome email failed:', err);
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
      ogImage: `${BASE_URL}/public/images/og-join.png`,
      coach,
      dashboardUrl: '/dashboard',
    });
  });
}
