// =====================================================================
// Onboarding flow -- page routes  (7-step post-signup wizard)
// =====================================================================
// GET routes only. Each renders one standalone wizard screen with the
// onboarding layout (no site nav/footer). Forms POST client-side to
// /api/v1/onboarding/* (see routes/api/onboarding.ts) and to the proven
// /api/v1/team/invite pipeline, then navigate to the next step.
//
// Step 1 (profile) is reachable without an org -- it CREATES the org.
// Steps 2-7 require an org; a user without one is bounced back to step 1.
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { fileURLToPath } from 'node:url';
import ejs from 'ejs';
import { getAuth } from '@clerk/fastify';
import { createClerkClient } from '@clerk/backend';
import { eq, and, isNull, desc, inArray } from 'drizzle-orm';
import { db } from '../../config/database.js';
import {
  organizations, orgMembers, orgInvitations,
  teams, teamMemberships, rocks, kpis, managerAgents,
  conversionLog,
} from '../../db/schema.js';
import { uploadSignupConversion } from '../../lib/google-ads-conversions.js';
import { ONBOARDING_ROLES } from '../../data/onboarding-roles.js';

// renderOnboarding mirrors renderV7 in routes/pages/pages.ts: @fastify/view
// throws "A layout can either be set globally or on render, not both" when a
// per-route layout is passed while a global layout is configured (server.ts
// registers layouts/main globally). Manually composing page + layout via
// ejs.renderFile bypasses that machinery and lets the onboarding flow use
// its standalone wizard chrome. Caught 2026-05-21 by a real mobile signup
// test that hit /onboarding/profile and got served raw JSON 500 -- every
// signup since the regression was bouncing here, root cause of the
// 0/50 founding-spots gap.
const O_VIEWS = fileURLToPath(new URL('../../views', import.meta.url));

// Clerk client config for the onboarding layout. Without these the layout
// never loads clerk.browser.js, so the __session cookie is never refreshed and
// every write (goal/kpi/agent) 401s once the ~60s session token lapses -- the
// "Sign in required" mid-onboarding bug. Derivation mirrors pages.ts / server.ts.
const ONB_CLERK_PUB_KEY = process.env.CLERK_PUBLISHABLE_KEY || '';
const ONB_CLERK_INSTANCE = ONB_CLERK_PUB_KEY.startsWith('pk_')
  ? Buffer.from(ONB_CLERK_PUB_KEY.split('_').slice(2).join('_'), 'base64').toString().replace(/\$$/, '')
  : '';
async function renderOnboarding(reply: FastifyReply, page: string, data: Record<string, any> = {}) {
  const body = await ejs.renderFile(`${O_VIEWS}/pages/${page}.ejs`, data);
  const html = await ejs.renderFile(`${O_VIEWS}/layouts/onboarding.ejs`, {
    clerkPubKey: ONB_CLERK_PUB_KEY, clerkInstance: ONB_CLERK_INSTANCE, ...data, body,
  });
  return reply.type('text/html').send(html);
}

export default async function onboardingPageRoutes(app: FastifyInstance) {

  // Bare entry -- resume at the right step.
  app.get('/onboarding', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) return reply.redirect('/sign-in?redirect=' + encodeURIComponent('/onboarding'));
    const member = (request as any).orgMember;
    return reply.redirect(member?.orgId ? '/onboarding/team' : '/onboarding/profile');
  });

  // ---- Step 1: profile (org gets created here) -----------------------
  app.get('/onboarding/profile', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) return reply.redirect('/sign-in?redirect=' + encodeURIComponent('/onboarding/profile'));
    const member = (request as any).orgMember;
    let org: any = null;
    if (member?.orgId) {
      [org] = await db.select().from(organizations).where(eq(organizations.id, member.orgId)).limit(1);
    }
    if (!org) {
      [org] = await db.select().from(organizations).where(eq(organizations.clerkOrgId, auth.userId)).limit(1);
    }

    // ---- Server-side Google Ads SIGNUP conversion -------------------
    // Fires once per Clerk user, only when (a) this is a brand-new user
    // (no org yet) and (b) we captured a gclid from the landing URL.
    // Idempotent via conversion_log. Wrapped tight: this branch never
    // breaks the page render. Replaces the page-view tag that lived in
    // pages/onboarding-profile.ejs and over-counted on 2026-05-19.
    if (!org && auth.userId) {
      try {
        const cookies = (request as unknown as { cookies?: Record<string, string> }).cookies ?? {};
        const gclid = typeof cookies.otp_gclid === 'string' ? cookies.otp_gclid : undefined;
        if (gclid) {
          const [already] = await db
            .select({ id: conversionLog.id })
            .from(conversionLog)
            .where(
              and(
                eq(conversionLog.clerkUserId, auth.userId),
                inArray(conversionLog.status, ['success', 'partial']),
              ),
            )
            .limit(1);
          if (!already) {
            let email: string | null = null;
            const secretKey = process.env.CLERK_SECRET_KEY;
            if (secretKey) {
              try {
                const clerk = createClerkClient({ secretKey });
                const u = await clerk.users.getUser(auth.userId);
                email = u.primaryEmailAddress?.emailAddress ?? null;
                const existingMeta =
                  (u.publicMetadata as Record<string, unknown> | null) ?? {};
                if (!existingMeta.gclid) {
                  await clerk.users.updateUser(auth.userId, {
                    publicMetadata: {
                      ...existingMeta,
                      gclid,
                      clickTs: cookies.otp_click_ts ?? new Date().toISOString(),
                    },
                  });
                }
              } catch (err) {
                request.log.warn(
                  { err },
                  'gclid -> Clerk publicMetadata bridge failed (non-blocking)',
                );
              }
            }

            const result = await uploadSignupConversion({
              gclid,
              email,
              when: new Date(),
            });
            await db.insert(conversionLog).values({
              clerkUserId: auth.userId,
              conversionActionId:
                process.env.GOOGLE_ADS_SIGNUP_CONVERSION_ACTION_ID ?? 'unknown',
              gclid,
              status: result.status,
              errorMessage: result.errorMessage ?? null,
              rawResponse: (result.raw as Record<string, unknown> | undefined) ?? null,
            });
            request.log.info(
              { userId: auth.userId, status: result.status },
              'google-ads conversion attempt',
            );
          }
        }
      } catch (err) {
        request.log.error(
          { err },
          'google-ads server-side conversion failed (non-blocking; page render continues)',
        );
      }
    }

    return renderOnboarding(reply, 'onboarding-profile', {
      title: 'Set up your seat · OTP',
      org: org || null,
      member: member || null,
      roles: ONBOARDING_ROLES,
    });
  });

  // Steps 2-7 share this guard: authed + has an org, else bounce to step 1.
  async function requireOrg(request: FastifyRequest, reply: FastifyReply, slug: string) {
    const auth = getAuth(request);
    if (!auth.userId) {
      reply.redirect('/sign-in?redirect=' + encodeURIComponent('/onboarding/' + slug));
      return null;
    }
    const member = (request as any).orgMember;
    if (!member?.orgId) { reply.redirect('/onboarding/profile'); return null; }
    const [org] = await db.select().from(organizations).where(eq(organizations.id, member.orgId)).limit(1);
    if (!org) { reply.redirect('/onboarding/profile'); return null; }
    return { auth, member, org };
  }

  async function activeMembers(orgId: string) {
    return db.select({
      id: orgMembers.id,
      displayName: orgMembers.displayName,
      role: orgMembers.role,
      clerkUserId: orgMembers.clerkUserId,
    }).from(orgMembers)
      .where(and(eq(orgMembers.orgId, orgId), eq(orgMembers.status, 'active')))
      .orderBy(orgMembers.createdAt);
  }

  // Owner dropdown options for goals/KPIs: active members PLUS pending invitees,
  // so you can assign to a teammate you just invited. Invitees are keyed by
  // their invitation id; the goal/KPI API resolves that to their chart tile and
  // it transfers to their member record on accept.
  async function ownerOptions(orgId: string) {
    const members = await activeMembers(orgId);
    const invites = await db.select().from(orgInvitations)
      .where(and(eq(orgInvitations.orgId, orgId), eq(orgInvitations.status, 'pending')))
      .orderBy(desc(orgInvitations.createdAt));
    const inviteOpts = invites.map((i) => ({
      id: i.id,
      displayName: ((i.displayName || i.email) + ' (invited)'),
      role: i.role,
      clerkUserId: null as string | null,
    }));
    return [...members, ...inviteOpts];
  }

  // ---- Step 2: team --------------------------------------------------
  app.get('/onboarding/team', async (request, reply) => {
    const c = await requireOrg(request, reply, 'team'); if (!c) return;
    const members = await activeMembers(c.org.id);
    const invites = await db.select().from(orgInvitations)
      .where(and(eq(orgInvitations.orgId, c.org.id), eq(orgInvitations.status, 'pending')))
      .orderBy(desc(orgInvitations.createdAt));
    return renderOnboarding(reply, 'onboarding-team', {
      title: 'Add your team · OTP', org: c.org, members, invites,
      currentUserId: c.auth.userId,
    });
  });

  // ---- Step 3: goals -------------------------------------------------
  app.get('/onboarding/goals', async (request, reply) => {
    const c = await requireOrg(request, reply, 'goals'); if (!c) return;
    const members = await ownerOptions(c.org.id);
    const goals = await db.select().from(rocks)
      .where(and(eq(rocks.organizationId, c.org.id), isNull(rocks.deletedAt)))
      .orderBy(desc(rocks.createdAt));
    return renderOnboarding(reply, 'onboarding-goals', {
      title: 'Set your goals · OTP', org: c.org, members, goals,
      currentUserId: c.auth.userId,
    });
  });

  // ---- Step 4: kpis --------------------------------------------------
  app.get('/onboarding/kpis', async (request, reply) => {
    const c = await requireOrg(request, reply, 'kpis'); if (!c) return;
    const members = await ownerOptions(c.org.id);
    const rows = await db.select().from(kpis)
      .where(and(eq(kpis.organizationId, c.org.id), isNull(kpis.deletedAt)))
      .orderBy(desc(kpis.createdAt));
    return renderOnboarding(reply, 'onboarding-kpis', {
      title: 'Set your KPIs · OTP', org: c.org, members, kpis: rows,
      currentUserId: c.auth.userId,
    });
  });

  // ---- Step 5: agents ------------------------------------------------
  app.get('/onboarding/agents', async (request, reply) => {
    const c = await requireOrg(request, reply, 'agents'); if (!c) return;
    const members = await activeMembers(c.org.id);
    const rows = await db.select().from(managerAgents)
      .where(and(eq(managerAgents.orgId, c.org.id), isNull(managerAgents.deletedAt)))
      .orderBy(desc(managerAgents.createdAt));
    return renderOnboarding(reply, 'onboarding-agents', {
      title: 'Add your agents · OTP', org: c.org, members, agents: rows,
      currentUserId: c.auth.userId,
    });
  });

  // ---- Step 6: teams -------------------------------------------------
  app.get('/onboarding/teams', async (request, reply) => {
    const c = await requireOrg(request, reply, 'teams'); if (!c) return;
    const members = await activeMembers(c.org.id);
    const teamRows = await db.select().from(teams)
      .where(eq(teams.orgId, c.org.id))
      .orderBy(desc(teams.createdAt));
    // Attach each team's members so the team cards can render avatar stacks.
    let withMembers: any[] = teamRows.map((t) => ({ ...t, members: [] as any[] }));
    if (teamRows.length > 0) {
      const tmRows = await db.select({
        teamId: teamMemberships.teamId,
        displayName: orgMembers.displayName,
      }).from(teamMemberships)
        .innerJoin(orgMembers, eq(orgMembers.id, teamMemberships.memberId))
        .where(inArray(teamMemberships.teamId, teamRows.map((t) => t.id)));
      withMembers = teamRows.map((t) => ({
        ...t,
        members: tmRows.filter((r) => r.teamId === t.id),
      }));
    }
    return renderOnboarding(reply, 'onboarding-teams', {
      title: 'Set up your teams · OTP', org: c.org, members, teams: withMembers,
      currentUserId: c.auth.userId,
    });
  });

  // ---- Step 7: first meeting (finale) --------------------------------
  app.get('/onboarding/first-meeting', async (request, reply) => {
    const c = await requireOrg(request, reply, 'first-meeting'); if (!c) return;
    const members = await activeMembers(c.org.id);
    const [goals, kpiRows, agentRows, teamRows] = await Promise.all([
      db.select({ id: rocks.id }).from(rocks).where(and(eq(rocks.organizationId, c.org.id), isNull(rocks.deletedAt))),
      db.select({ id: kpis.id }).from(kpis).where(and(eq(kpis.organizationId, c.org.id), isNull(kpis.deletedAt))),
      db.select({ id: managerAgents.id }).from(managerAgents).where(and(eq(managerAgents.orgId, c.org.id), isNull(managerAgents.deletedAt))),
      db.select({ id: teams.id, name: teams.name, isDefault: teams.isDefault }).from(teams).where(eq(teams.orgId, c.org.id)),
    ]);
    const leadTeam = teamRows.find((t) => t.isDefault) || teamRows[0] || null;
    return renderOnboarding(reply, 'onboarding-meeting', {
      title: 'Your first meeting · OTP',
      org: c.org,
      members,
      teamName: leadTeam?.name || `${c.org.name} Leadership Team`,
      counts: {
        seats: members.length,
        goals: goals.length,
        kpis: kpiRows.length,
        agents: agentRows.length,
        teams: teamRows.length,
      },
    });
  });
}
