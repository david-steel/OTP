// Coach claim + takedown routes.
// These power the Founding 25 email campaign CTAs.
// GET /claim/:slug         — show profile + claim CTA (sign-in if needed, confirm if signed in)
// POST /claim/:slug         — bind profile to authed user's org, mark claimed=true
// GET /takedown/:slug       — show removal confirm form
// POST /takedown/:slug      — create takedown ticket, redirect to confirmation
// GET /claim/:slug/done     — post-claim confirmation
// GET /takedown/:slug/done  — post-takedown confirmation

import type { FastifyInstance } from 'fastify';
import { getAuth } from '@clerk/fastify';
import { eq } from 'drizzle-orm';
import { db } from '../../config/database.js';
import { organizations, consultantProfiles, tickets } from '../../db/schema.js';
import { sendEmail } from '../../config/email.js';

const BASE_URL = 'https://orgtp.com';
const DAVID_EMAIL = 'dsteel@sneeze.it';

export default async function coachClaimRoutes(app: FastifyInstance) {

  // ───── GET /claim/:slug ───────────────────────────────────────
  app.get<{ Params: { slug: string } }>('/claim/:slug', async (request, reply) => {
    const { slug } = request.params;

    const [profile] = await db
      .select()
      .from(consultantProfiles)
      .where(eq(consultantProfiles.slug, slug))
      .limit(1);

    if (!profile) {
      return reply.status(404).view('pages/home', {
        title: 'Profile not found - OTP',
        description: 'This coaching profile does not exist on OTP.',
      });
    }

    const auth = getAuth(request);
    const isSignedIn = !!auth.userId;

    // If already claimed (by whoever), short-circuit to a "this is already claimed" state.
    // We'll still let the rightful coach take it over if they reach out, but the UI flow is closed.
    const alreadyClaimed = profile.claimed === true;

    return reply.view('pages/claim-coach', {
      title: `Claim your OTP profile - ${profile.displayName}`,
      description: `Claim ${profile.displayName}'s OTP coaching profile. Free for you and your clients as part of the Founding 25 coach cohort.`,
      noindex: true,
      profile,
      isSignedIn,
      alreadyClaimed,
      signInUrl: `/sign-in?redirect=${encodeURIComponent('/claim/' + slug)}`,
      signUpUrl: `/sign-up?redirect=${encodeURIComponent('/claim/' + slug)}`,
      takedownUrl: `/takedown/${slug}`,
      publicProfileUrl: `${BASE_URL}/expert/${slug}`,
    });
  });

  // ───── POST /claim/:slug ──────────────────────────────────────
  app.post<{ Params: { slug: string } }>('/claim/:slug', async (request, reply) => {
    const { slug } = request.params;
    const auth = getAuth(request);

    if (!auth.userId) {
      return reply.redirect('/sign-in?redirect=' + encodeURIComponent('/claim/' + slug));
    }

    const [profile] = await db
      .select()
      .from(consultantProfiles)
      .where(eq(consultantProfiles.slug, slug))
      .limit(1);

    if (!profile) {
      return reply.status(404).send({ error: 'Profile not found' });
    }
    if (profile.claimed === true) {
      return reply.redirect(`/claim/${slug}/done?status=already_claimed`);
    }

    // Resolve or create an org for the authed user.
    // We point clerkOrgId to the user-id (matches the pattern used elsewhere in the codebase).
    let [userOrg] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.clerkOrgId, auth.userId))
      .limit(1);

    if (!userOrg) {
      const orgName = `${profile.displayName}'s Practice`;
      const [created] = await db
        .insert(organizations)
        .values({
          clerkOrgId: auth.userId,
          name: orgName,
          industry: 'coaching',
          size: 'solo',
        })
        .returning();
      userOrg = created;
    }

    // Bind the profile to the user's org and flip claimed=true.
    await db
      .update(consultantProfiles)
      .set({
        orgId: userOrg.id,
        claimed: true,
      })
      .where(eq(consultantProfiles.id, profile.id));

    // Fire-and-forget notification to David. Wrap in try/catch so a notify failure
    // never blocks the claim itself.
    try {
      await sendEmail({
        to: DAVID_EMAIL,
        subject: `[OTP Founding 25] ${profile.displayName} just claimed their profile`,
        html: `<p><strong>${escapeHtml(profile.displayName)}</strong> just claimed their OTP profile.</p>
<p>Slug: <a href="${BASE_URL}/expert/${escapeHtml(slug)}">/expert/${escapeHtml(slug)}</a><br/>
Directory source: ${escapeHtml(profile.directorySource || 'unknown')}<br/>
Tier: ${escapeHtml(profile.tier || 'n/a')}<br/>
Clerk user id: ${escapeHtml(auth.userId)}<br/>
Org id: ${escapeHtml(userOrg.id)}</p>
<p>Count check this against the running Founding 25 total.</p>`,
        from: 'OTP Founding 25 <notifications@mail.orgtp.com>',
      });
    } catch (err) {
      console.warn('[claim] David notification failed:', err);
    }

    return reply.redirect(`/claim/${slug}/done`);
  });

  // ───── GET /claim/:slug/done ──────────────────────────────────
  app.get<{ Params: { slug: string }; Querystring: { status?: string } }>(
    '/claim/:slug/done',
    async (request, reply) => {
      const { slug } = request.params;
      const status = request.query.status === 'already_claimed' ? 'already_claimed' : 'success';

      const [profile] = await db
        .select()
        .from(consultantProfiles)
        .where(eq(consultantProfiles.slug, slug))
        .limit(1);

      return reply.view('pages/claim-coach-done', {
        title: `Profile claimed - OTP`,
        description: `Your OTP coaching profile has been claimed.`,
        noindex: true,
        profile,
        slug,
        status,
        publicProfileUrl: `${BASE_URL}/expert/${slug}`,
        dashboardUrl: '/dashboard/consultant',
      });
    },
  );

  // ───── GET /takedown/:slug ────────────────────────────────────
  app.get<{ Params: { slug: string } }>('/takedown/:slug', async (request, reply) => {
    const { slug } = request.params;

    const [profile] = await db
      .select()
      .from(consultantProfiles)
      .where(eq(consultantProfiles.slug, slug))
      .limit(1);

    if (!profile) {
      return reply.status(404).view('pages/home', {
        title: 'Profile not found - OTP',
      });
    }

    return reply.view('pages/takedown-coach', {
      title: `Request removal - ${profile.displayName}`,
      description: 'Request removal of this profile from the OTP coach directory.',
      noindex: true,
      profile,
      slug,
      submitUrl: `/takedown/${slug}`,
    });
  });

  // ───── POST /takedown/:slug ───────────────────────────────────
  app.post<{ Params: { slug: string }; Body: { email?: string; reason?: string } }>(
    '/takedown/:slug',
    async (request, reply) => {
      const { slug } = request.params;
      const body = request.body || {};
      const reporterEmail = (body.email || '').trim().slice(0, 255) || null;
      const reason = (body.reason || '').trim().slice(0, 2000);

      const [profile] = await db
        .select()
        .from(consultantProfiles)
        .where(eq(consultantProfiles.slug, slug))
        .limit(1);

      if (!profile) {
        return reply.status(404).send({ error: 'Profile not found' });
      }

      const title = `[TAKEDOWN] ${profile.displayName} (${slug})`;
      const description = [
        `Coach has requested removal from the OTP coach directory.`,
        ``,
        `Profile: ${profile.displayName}`,
        `Slug: ${slug}`,
        `Directory source: ${profile.directorySource || 'unknown'}`,
        `Source URL: ${profile.contentSourceUrl || 'n/a'}`,
        ``,
        `Reporter email: ${reporterEmail || '(not provided)'}`,
        ``,
        `Reason:`,
        reason || '(not provided)',
      ].join('\n');

      await db.insert(tickets).values({
        orgId: profile.orgId,
        title,
        description,
        priority: 'high',
        category: 'other',
        reporterEmail,
      });

      // Notify David — takedowns need eyes
      try {
        await sendEmail({
          to: DAVID_EMAIL,
          subject: `[OTP] Takedown requested: ${profile.displayName}`,
          html: `<p><strong>${escapeHtml(profile.displayName)}</strong> requested removal from the OTP coach directory.</p>
<p>Slug: <code>${escapeHtml(slug)}</code><br/>
Reporter email: ${escapeHtml(reporterEmail || '(not provided)')}<br/>
Reason: ${escapeHtml(reason || '(not provided)')}</p>
<p>Ticket has been created. Action required: unpublish profile or contact the coach.</p>`,
          from: 'OTP Notifications <notifications@mail.orgtp.com>',
        });
      } catch (err) {
        console.warn('[takedown] David notification failed:', err);
      }

      return reply.redirect(`/takedown/${slug}/done`);
    },
  );

  // ───── GET /takedown/:slug/done ───────────────────────────────
  app.get<{ Params: { slug: string } }>('/takedown/:slug/done', async (request, reply) => {
    const { slug } = request.params;
    const [profile] = await db
      .select()
      .from(consultantProfiles)
      .where(eq(consultantProfiles.slug, slug))
      .limit(1);

    return reply.view('pages/takedown-coach-done', {
      title: 'Removal request received - OTP',
      description: 'Your removal request has been logged.',
      noindex: true,
      profile,
    });
  });

  // ───── GET /plan ──────────────────────────────────────────────
  // Read-only Plan page preview. Static Sneeze It data for now; future
  // pass adds per-workspace plan data, edit modals, and DB schema.
  app.get('/plan', async (_request, reply) => {
    return reply.view('pages/plan', {
      title: 'Plan - OTP',
      description: 'OTP Plan page — Core Values, Core Focus, 10-Year Target, 3-Year, and 1-Year measurables.',
      noindex: true,
    });
  });

  // ───── GET /meet-radar ────────────────────────────────────────
  // Positioning page for LinkedIn EOS audiences. Audience: operators
  // running EOS at their own company (Ninety / Bloom / EOS One users).
  // Single CTA: /sign-up. Coach play lives on /coach as a separate track.
  app.get('/meet-radar', async (_request, reply) => {
    return reply.view('pages/meet-radar', {
      title: 'Meet Radar — the AI Chief of Staff for EOS companies | OTP',
      description: 'Meeting software ran the meeting. Radar runs everything between them. The operating layer for EOS companies. Free for your whole team.',
      canonical: 'https://orgtp.com/meet-radar',
    });
  });

  // ───── GET /unsubscribe?slug=... ──────────────────────────────
  // One-click unsubscribe. Creates an UNSUBSCRIBE ticket so the send script
  // can skip this slug on future sends. Shows a confirmation page that also
  // offers full takedown if they want to remove the directory listing entirely.
  app.get<{ Querystring: { slug?: string } }>('/unsubscribe', async (request, reply) => {
    const slug = (request.query.slug || '').trim().slice(0, 255);

    if (!slug) {
      return reply.view('pages/unsubscribe-coach', {
        title: 'Unsubscribed - OTP',
        description: 'You have been unsubscribed from OTP emails.',
        noindex: true,
        profile: null,
        slug: '',
        takedownUrl: '',
      });
    }

    const [profile] = await db
      .select()
      .from(consultantProfiles)
      .where(eq(consultantProfiles.slug, slug))
      .limit(1);

    // Always create the ticket even if profile is missing — we want the audit trail
    const title = `[UNSUBSCRIBE] ${profile ? profile.displayName : slug}`;
    const description = [
      `Coach requested unsubscribe from OTP email campaigns.`,
      ``,
      `Slug: ${slug}`,
      `Profile found: ${profile ? 'yes' : 'no'}`,
      profile ? `Display name: ${profile.displayName}` : '',
      profile ? `Directory source: ${profile.directorySource || 'unknown'}` : '',
      ``,
      `Profile remains LISTED in the directory unless they also request takedown.`,
    ].filter(Boolean).join('\n');

    await db.insert(tickets).values({
      orgId: profile?.orgId || null,
      title,
      description,
      priority: 'medium',
      category: 'other',
      reporterEmail: null,
    });

    try {
      await sendEmail({
        to: DAVID_EMAIL,
        subject: `[OTP] Unsubscribe: ${profile?.displayName || slug}`,
        html: `<p><strong>${escapeHtml(profile?.displayName || slug)}</strong> unsubscribed from OTP email campaigns.</p>
<p>Slug: <code>${escapeHtml(slug)}</code><br/>
Directory listing remains active (they did not request takedown).</p>
<p>Send script must skip this slug on future blasts. Ticket logged.</p>`,
        from: 'OTP Notifications <notifications@mail.orgtp.com>',
      });
    } catch (err) {
      console.warn('[unsubscribe] David notification failed:', err);
    }

    return reply.view('pages/unsubscribe-coach', {
      title: 'Unsubscribed - OTP',
      description: 'You have been unsubscribed from OTP emails.',
      noindex: true,
      profile,
      slug,
      takedownUrl: `${BASE_URL}/takedown/${slug}`,
    });
  });
}

function escapeHtml(s: string): string {
  return String(s || '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c] as string));
}
