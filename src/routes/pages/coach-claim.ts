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
import { createClerkClient } from '@clerk/backend';
import { eq } from 'drizzle-orm';
import { randomBytes } from 'crypto';
import { db } from '../../config/database.js';
import { organizations, consultantProfiles, tickets } from '../../db/schema.js';
import { sendEmail } from '../../config/email.js';

// Coach-client invite token: 24 random bytes → ~32-char base64url string.
// Stable per coach (generated once on first claim, reused forever) so the
// coach can hand the same link to every client.
function generateInviteToken(): string {
  return randomBytes(24).toString('base64url');
}

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
  } catch (err) {
    console.warn('[claim] Clerk email lookup failed for', clerkUserId, err);
    return null;
  }
}

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

    // Bind the profile to the user's org, flip claimed=true, auto-publish, and
    // pre-fill contactEmail from Clerk if the row doesn't have one yet. This
    // removes three small post-claim friction points so the coach lands on a
    // working public profile immediately rather than an unchecked publish toggle
    // and a blank required-field.
    const clerkEmail = await fetchClerkPrimaryEmail(auth.userId);
    const updates: Record<string, unknown> = {
      orgId: userOrg.id,
      claimed: true,
      published: true,
      isPublished: true,
    };
    if (!profile.contactEmail && clerkEmail) {
      updates.contactEmail = clerkEmail;
    }
    // Generate the coach's invite token on first claim if they don't have one.
    // Stable per coach so they can hand the same link to every client.
    if (!(profile as any).inviteToken) {
      updates.inviteToken = generateInviteToken();
    }
    await db
      .update(consultantProfiles)
      .set(updates)
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

    // Welcome email to the coach who just claimed. The previous behavior
    // emailed only David, which left coaches in silence right after they
    // signed up -- Joel Swanson had to cold-email asking "who are you?"
    // because the platform never followed up. This sends the answer to his
    // question before he asks it.
    //
    // Sourced from Joel's first inbound: WHO / WHAT / WHY in plain English,
    // plus the share link, the badge, and a 15-min-call CTA.
    const coachEmail = updates.contactEmail as string | undefined ?? profile.contactEmail ?? clerkEmail ?? null;
    const finalInviteToken = (updates.inviteToken as string | undefined) ?? (profile as any).inviteToken ?? null;
    if (coachEmail && coachEmail.toLowerCase() !== DAVID_EMAIL.toLowerCase()) {
      try {
        const firstName = (profile.displayName || '').split(' ')[0] || 'there';
        const inviteUrl = finalInviteToken ? `${BASE_URL}/join/${finalInviteToken}` : null;
        const calendlyUrl = 'https://calendly.com/dawson-orgtp/30min';
        await sendEmail({
          to: coachEmail,
          subject: `Welcome to the Founding 25, ${firstName}`,
          replyTo: 'David Steel <dsteel@sneeze.it>',
          from: 'David Steel <david@mail.orgtp.com>',
          tags: [
            { name: 'campaign', value: 'founding_25_coach_welcome' },
            { name: 'slug', value: slug.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 80) },
          ],
          html: `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;max-width:640px;margin:0;padding:24px;line-height:1.55;font-size:15px;">

<p>${escapeHtml(firstName)} — welcome. You just claimed your Founder Certified Coach profile on OTP. Real quick, since most coaches who land here have the same three questions:</p>

<p><strong>WHERE THIS CAME FROM</strong><br/>
OTP started inside a real, running operating system — 14 AI agents working alongside 12 humans, every Tuesday in the same L10, every seat with a name, a KPI, and an SOP. Once the pattern proved out, we opened the protocol up. EOS coaches were a natural fit because the structure your clients already use (accountability chart, scorecard, SOPs, L10) is exactly the structure OTP runs on. I'm David Steel, the founder — I read every Founding 25 reply personally.</p>

<p><strong>WHAT OTP IS</strong><br/>
At the surface: an accountability chart with AI seats sitting next to human seats. Each seat — AI or human — has a name, a role, a KPI, and an SOP. Click an AI seat: you see what it does, the number it hits, who it reports to. Click a human seat: same.</p>

<p>Under the hood it does more (carries SOPs into the AI runtime so they don't drift, lets agents talk to each other without you in the middle), but the surface is the chart.</p>

<p><strong>WHY THIS MATTERS FOR YOUR CLIENTS</strong><br/>
Your clients are starting to add AI to their teams. Right now it lives scattered across Notion docs, Zaps, ChatGPT tabs, and Mike-the-IT-guy's head. It's becoming a People &amp; Process issue — except the EOS toolkit doesn't have a seat type for "AI agent" yet.</p>

<p>OTP fills that gap using tools your clients already speak fluently. We just add the AI seats.</p>

${inviteUrl ? `
<p><strong>YOUR SHAREABLE CLIENT LINK</strong><br/>
This is your personal invite URL. Send it to any leadership team you work with — they join under your roof, you get the coach view across all of them. Every client is yours in perpetuity, GHL-style (you keep earning even if they later pay OTP directly).</p>

<p style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px;font-family:monospace;font-size:13px;word-break:break-all;">
  <a href="${inviteUrl}" style="color:#92400e;text-decoration:none;">${inviteUrl}</a>
</p>

<p>See all your clients side-by-side in your new Practice dashboard:<br/>
<a href="${BASE_URL}/dashboard/practice" style="color:#1f2937;font-weight:600;">${BASE_URL}/dashboard/practice →</a></p>
` : ''}

<p><strong>YOUR FOUNDER CERTIFIED COACH BADGE</strong><br/>
Yours to use on your website, in your email signature, or anywhere else. Download:<br/>
<a href="${BASE_URL}/public/images/founder-coach-badge.png" style="color:#1f2937;font-weight:600;">${BASE_URL}/public/images/founder-coach-badge.png →</a></p>

<p><strong>WHAT'S NEXT</strong><br/>
Three ways to go from here, in escalating effort:</p>
<ul style="margin:8px 0 12px 20px;padding:0;">
  <li>Reply to this email — I read everything personally during Founding 25.</li>
  <li>Book a 15-min call: <a href="${calendlyUrl}" style="color:#1f2937;">${calendlyUrl}</a></li>
  <li>Send your client link to one leadership team this week. The Practice dashboard will populate as they accept.</li>
</ul>

<p>Glad you're in.</p>

<p>— David</p>

</body></html>`,
        });
      } catch (err) {
        console.warn('[claim] coach welcome email failed:', err);
      }
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

      // Build the coach's shareable client-invite URL. If the token is
      // somehow missing on a claimed profile (legacy data), generate one
      // now so the page never falls back to "no link available."
      let inviteToken = (profile as any)?.inviteToken as string | null | undefined;
      if (profile && profile.claimed && !inviteToken) {
        inviteToken = generateInviteToken();
        await db
          .update(consultantProfiles)
          .set({ inviteToken })
          .where(eq(consultantProfiles.id, profile.id));
      }
      const inviteUrl = inviteToken ? `${BASE_URL}/join/${inviteToken}` : null;

      return reply.view('pages/claim-coach-done', {
        title: `Profile claimed - OTP`,
        description: `Your OTP coaching profile has been claimed.`,
        noindex: true,
        profile,
        slug,
        status,
        publicProfileUrl: `${BASE_URL}/expert/${slug}`,
        dashboardUrl: '/dashboard/consultant',
        inviteUrl,
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

      // Honor the takedown immediately. The email + claim page promise
      // "One-click. Removed from public directory and search." -- so unpublish
      // the profile now, not "when David gets to the ticket." The ticket and
      // notification email still fire so a human can follow up if needed.
      await db
        .update(consultantProfiles)
        .set({ published: false, isPublished: false })
        .where(eq(consultantProfiles.id, profile.id));

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
      ogImage: 'https://orgtp.com/public/images/og-meet-radar.png',
      googleAdsId: 'AW-18159119434',
      minimalNav: true,
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
