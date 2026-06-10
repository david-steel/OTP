// =====================================================================
// Onboarding write API  (registered under /api/v1)
// =====================================================================
// Every write the 7-step post-signup onboarding flow performs lands here,
// in ONE file, so field mapping is auditable in a single place:
//
//   POST /api/v1/onboarding/profile  -> organizations + owner org_members
//   POST /api/v1/onboarding/invite   -> org_invitations + Resend email
//   POST /api/v1/onboarding/goal     -> rocks
//   POST /api/v1/onboarding/kpi      -> kpis
//   POST /api/v1/onboarding/agent    -> manager_agents
//   POST /api/v1/onboarding/team     -> teams + team_memberships
//
// Invites reuse the proven membership.issueInvite() service + the same
// Resend sendEmail() the rest of the app uses. Everything else is a thin,
// explicit insert so the column mapping is impossible to misread.
import type { FastifyInstance, FastifyRequest } from 'fastify';
import { getAuth } from '@clerk/fastify';
import { eq, and, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../config/database.js';
import {
  organizations, orgMembers, orgInvitations, onboardingSequence,
  teams, teamMemberships, rocks, kpis, managerAgents,
} from '../../db/schema.js';
import { ORG_SIZES } from '../../shared/enums.js';
import { issueInvite, MembershipError, type Role } from '../../services/membership.js';
import { sendEmail } from '../../config/email.js';
import { ONBOARDING_ROLE_KEYS } from '../../data/onboarding-roles.js';
import { placeOwnerOnStarterChart } from '../../services/starter-chart.js';
import { reconcileChartClaimByEmail } from '../../services/chart-claim-reconcile.js';

// ---- helpers --------------------------------------------------------

/** Resolve the org for the current Clerk user. Tries the request.orgMember
 *  decoration first (covers owners + invited members), then a direct
 *  clerk_org_id match (covers an org created moments ago before the
 *  decorator preHandler re-ran). Returns null when the user has no org. */
async function resolveOrg(request: FastifyRequest, userId: string) {
  const decorated = (request as any).orgMember as { orgId: string } | null;
  if (decorated?.orgId) {
    const [o] = await db.select().from(organizations).where(eq(organizations.id, decorated.orgId)).limit(1);
    if (o) return o;
  }
  const [o] = await db.select().from(organizations).where(eq(organizations.clerkOrgId, userId)).limit(1);
  return o || null;
}

/** The active org_members row for this Clerk user in this org. */
async function getMember(orgId: string, userId: string) {
  const [m] = await db.select().from(orgMembers)
    .where(and(eq(orgMembers.orgId, orgId), eq(orgMembers.clerkUserId, userId)))
    .limit(1);
  return m || null;
}

/** The org's default team (ensure-teams.ts backfills one "Leadership Team"
 *  per org with is_default=true). Goals + KPIs land on this team so they
 *  show on the leadership scorecard. Null is acceptable (column is nullable). */
async function defaultTeamId(orgId: string): Promise<string | null> {
  const [t] = await db.select({ id: teams.id }).from(teams)
    .where(and(eq(teams.orgId, orgId), eq(teams.isDefault, true)))
    .limit(1);
  return t?.id || null;
}

function slugify(s: string): string {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'team';
}

/** Current quarter as YYYY-QN, or Q4 of the current year for annual goals. */
function quarterFor(timeframe: 'quarter' | 'year', now = new Date()): string {
  const y = now.getFullYear();
  const q = timeframe === 'year' ? 4 : Math.floor(now.getMonth() / 3) + 1;
  return `${y}-Q${q}`;
}

/** Last calendar day of a YYYY-QN quarter, as a Date. */
function quarterEnd(quarter: string): Date {
  const m = /^(\d{4})-Q([1-4])$/.exec(quarter);
  const y = m ? Number(m[1]) : new Date().getFullYear();
  const q = m ? Number(m[2]) : 1;
  return new Date(y, q * 3, 0, 23, 59, 59); // day 0 of next quarter-start month = last day of this quarter
}

function escapeHtml(s: string): string {
  return String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as Record<string, string>
  )[c]);
}

function inviteEmailHtml(opts: { orgName: string; inviterName: string; acceptUrl: string; expiresAt: Date }): string {
  const expires = opts.expiresAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#14161c;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f8fafc;padding:32px 0;">
    <tr><td align="center">
      <table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" style="background:#ffffff;border-radius:14px;border:1px solid #e5e7eb;">
        <tr><td style="padding:30px 34px 6px 34px;">
          <div style="font-size:13px;color:#6b7280;margin-bottom:6px;">${escapeHtml(opts.inviterName)} invited you</div>
          <h1 style="font-size:23px;line-height:1.3;font-weight:800;margin:2px 0 16px 0;color:#0f172a;">Join ${escapeHtml(opts.orgName)} on OTP</h1>
        </td></tr>
        <tr><td style="padding:0 34px 26px 34px;font-size:15px;line-height:1.65;color:#14161c;">
          <p style="margin:0 0 14px 0;">${escapeHtml(opts.inviterName)} is setting up ${escapeHtml(opts.orgName)} on OTP, one shared chart with every person and AI agent on it, one scoreboard, one weekly meeting. They saved a seat for you.</p>
          <p style="margin:0 0 14px 0;">Accept to claim your seat. You will set up your own profile and can be on it in about a minute.</p>
          <p style="margin:24px 0;">
            <a href="${opts.acceptUrl}" style="display:inline-block;padding:13px 22px;background:#0a9d63;color:#ffffff;text-decoration:none;border-radius:9px;font-weight:700;font-size:15px;">Accept your invitation</a>
          </p>
          <p style="margin:0;font-size:12px;color:#9ca3af;">This link expires ${expires}. If you were not expecting this, you can ignore this email.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

// ---- routes ---------------------------------------------------------

export default async function onboardingApiRoutes(app: FastifyInstance) {

  // ---- STEP 1: profile -> organization + owner member ----------------
  // `role` is the closed-list dropdown from data/onboarding-roles.ts. It
  // drives chart placement (see services/starter-chart.ts). The legacy
  // free-text `title` field is accepted for backward-compat with any
  // cached client JS but ignored by the placement logic.
  const profileSchema = z.object({
    company: z.string().trim().min(1).max(255),
    industry: z.string().trim().min(1).max(255),
    size: z.enum(ORG_SIZES),
    displayName: z.string().trim().min(1).max(200),
    role: z.enum(ONBOARDING_ROLE_KEYS as [string, ...string[]]).optional(),
    title: z.string().trim().max(200).optional(),
  });

  app.post('/onboarding/profile', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in required' } });

    const parsed = profileSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Check the highlighted fields', details: parsed.error.issues } });
    }
    const { company, industry, size, displayName } = parsed.data;

    // Email: pulled from the onboarding_sequence row the Clerk webhook wrote
    // at user.created -- no extra Clerk API call needed.
    let email: string | null = null;
    try {
      const [onb] = await db.select({ email: onboardingSequence.email })
        .from(onboardingSequence).where(eq(onboardingSequence.clerkUserId, auth.userId)).limit(1);
      email = onb?.email || null;
    } catch { /* best-effort */ }

    let org = await resolveOrg(request, auth.userId);

    if (org) {
      await db.update(organizations)
        .set({ name: company, industry, size, updatedAt: new Date() })
        .where(eq(organizations.id, org.id));
    } else {
      const [{ count }] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(organizations);
      const badge = count < 50 ? ('founding' as const) : count < 200 ? ('early' as const) : null;
      [org] = await db.insert(organizations)
        .values({ name: company, industry, size, clerkOrgId: auth.userId, badge })
        .returning();
    }

    // Ensure the owner org_members row exists so getRoleForUser() returns
    // 'owner' -- required for Step 2 (issuing invitations).
    const existing = await getMember(org.id, auth.userId);
    let ownerMemberId: string;
    if (existing) {
      await db.update(orgMembers)
        .set({ displayName, email: email || existing.email, status: 'active', updatedAt: new Date() })
        .where(eq(orgMembers.id, existing.id));
      ownerMemberId = existing.id;
    } else {
      const [created] = await db.insert(orgMembers).values({
        orgId: org.id,
        clerkUserId: auth.userId,
        role: 'owner',
        status: 'active',
        email,
        displayName,
      }).returning({ id: orgMembers.id });
      ownerMemberId = created.id;
    }

    // Put the owner on their org's Leadership Team NOW, at signup -- don't wait
    // for the boot-time ensure-teams backfill. Without this a brand-new owner
    // has no team membership, so meetings auto-populate with no attendees and
    // the access gate 404s them from their own first meeting (Open Skies,
    // 2026-06-02). Mirrors ensure-teams.ts (leadership team + owner as leader).
    // Idempotent and non-blocking -- a hiccup here must not 500 the profile submit.
    try {
      const { teams, teamMemberships } = await import('../../db/schema.js');
      let [leadTeam] = await db.select({ id: teams.id })
        .from(teams)
        .where(and(eq(teams.orgId, org.id), eq(teams.slug, 'leadership')))
        .limit(1);
      if (!leadTeam) {
        try {
          [leadTeam] = await db.insert(teams)
            .values({ orgId: org.id, name: 'Leadership Team', slug: 'leadership', type: 'leadership', isDefault: true })
            .returning({ id: teams.id });
        } catch { /* concurrent create -- re-read */ }
        if (!leadTeam) {
          [leadTeam] = await db.select({ id: teams.id })
            .from(teams)
            .where(and(eq(teams.orgId, org.id), eq(teams.slug, 'leadership')))
            .limit(1);
        }
      }
      if (leadTeam) {
        try {
          await db.insert(teamMemberships)
            .values({ teamId: leadTeam.id, memberId: ownerMemberId, roleOnTeam: 'leader' });
        } catch { /* unique (team_id, member_id) -- already on the team */ }
      }
    } catch (err) {
      request.log.error({ err, orgId: org.id }, 'leadership-team membership provisioning failed (non-blocking)');
    }

    // Auto-place the owner on the accountability chart per their role.
    // Wrapped tight: a chart-placement hiccup must not 500 the profile
    // submit. The user can be backfilled later via
    // scripts/backfill-chart-placement.ts and they will at least make it
    // to step 2. Tracked 2026-05-24 (first solo-operator signup, Dawson).
    try {
      const roleKey = parsed.data.role || 'other';
      await placeOwnerOnStarterChart({
        orgId: org.id,
        orgName: company,
        industry,
        orgSize: size,
        ownerDisplayName: displayName,
        ownerEmail: email,
        roleKey,
      });
    } catch (err) {
      request.log.error({ err, orgId: org.id }, 'starter chart placement failed (non-blocking)');
    }

    // Link the owner's org_members row to the chart tile that now
    // carries their email. Without this the owner shows up on the chart
    // but their org_members.claimed_entity_id stays null, which makes
    // /team/review (which filters by reports_to from your claimed tile)
    // think you're not on the chart at all. Best-effort -- a stale
    // claim won't block onboarding.
    try {
      const m = await getMember(org.id, auth.userId);
      if (m) await reconcileChartClaimByEmail(org.id, m.id);
    } catch (err) {
      request.log.error({ err, orgId: org.id }, 'chart claim reconcile failed (non-blocking)');
    }

    return { ok: true, orgId: org.id };
  });

  // ---- STEP 2: invite -> org_invitations + Resend email --------------
  const inviteSchema = z.object({
    email: z.string().trim().email().max(200),
    displayName: z.string().trim().max(200).optional(),
    role: z.enum(['admin', 'manager', 'managee', 'observer']).optional(),
  });

  app.post('/onboarding/invite', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in required' } });

    const parsed = inviteSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'A valid email is required', details: parsed.error.issues } });
    }
    const org = await resolveOrg(request, auth.userId);
    if (!org) return reply.status(404).send({ error: { code: 'NO_ORG', message: 'Finish step 1 first' } });

    try {
      // issueInvite enforces inviter-role (owner/admin/manager) internally.
      const issued = await issueInvite({
        orgId: org.id,
        ownerUserId: auth.userId,
        email: parsed.data.email,
        displayName: parsed.data.displayName || null,
        role: (parsed.data.role || 'managee') as Role,
      }, 'https://orgtp.com');

      // Fire-and-forget the email. A Resend hiccup must not fail the invite;
      // the owner can resend from the team page.
      const inviterName = ((request as any).orgMember?.displayName) || (org as any).name || 'Your teammate';
      sendEmail({
        to: issued.email,
        subject: `${(org as any).name || 'A team'} invited you to OTP`,
        html: inviteEmailHtml({
          orgName: (org as any).name || 'OTP',
          inviterName,
          acceptUrl: issued.acceptUrl,
          expiresAt: issued.expiresAt,
        }),
        from: 'OTP Invitations <notifications@mail.orgtp.com>',
      }).catch((err) => request.log.error({ err }, '[onboarding] invite email failed'));

      return { ok: true, invitationId: issued.invitationId, email: issued.email };
    } catch (e) {
      if (e instanceof MembershipError) {
        return reply.status(e.httpStatus).send({ error: { code: e.code, message: e.message } });
      }
      request.log.error(e);
      return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Could not send the invitation' } });
    }
  });

  // ---- STEP 3: goal -> rocks -----------------------------------------
  const goalSchema = z.object({
    title: z.string().trim().min(3).max(500),
    timeframe: z.enum(['quarter', 'year']),
    ownerMemberId: z.string().uuid(),
  });

  // Resolve a goal/KPI owner id to {ownerExternalId, ownerName}. Active members
  // own by member id; pending invitees own by invitation id, stored against
  // their chart-tile externalId so the chart/scoreboard resolve the name (and
  // reconcileChartClaimByEmail transfers it to the member on accept). Null if
  // the id matches neither.
  async function resolveOnboardingOwner(orgId: string, ownerId: string) {
    const [m] = await db.select().from(orgMembers)
      .where(and(eq(orgMembers.id, ownerId), eq(orgMembers.orgId, orgId))).limit(1);
    if (m) return { ownerExternalId: m.id, ownerName: m.displayName || null };
    const [inv] = await db.select().from(orgInvitations)
      .where(and(eq(orgInvitations.id, ownerId), eq(orgInvitations.orgId, orgId), eq(orgInvitations.status, 'pending'))).limit(1);
    if (inv) return { ownerExternalId: inv.claimedEntityId || inv.id, ownerName: inv.displayName || inv.email };
    return null;
  }

  app.post('/onboarding/goal', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in required' } });

    const parsed = goalSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Give the goal a name (3+ characters)', details: parsed.error.issues } });
    }
    const org = await resolveOrg(request, auth.userId);
    if (!org) return reply.status(404).send({ error: { code: 'NO_ORG', message: 'Finish step 1 first' } });

    const owner = await resolveOnboardingOwner(org.id, parsed.data.ownerMemberId);
    if (!owner) return reply.status(400).send({ error: { code: 'BAD_OWNER', message: 'Pick a valid owner' } });

    const quarter = quarterFor(parsed.data.timeframe);
    const [rock] = await db.insert(rocks).values({
      organizationId: org.id,
      teamId: await defaultTeamId(org.id),
      ownerEntityType: 'human',
      ownerExternalId: owner.ownerExternalId,
      ownerName: owner.ownerName,
      title: parsed.data.title,
      quarter,
      dueDate: quarterEnd(quarter),
      onTrack: true,
      createdBy: auth.userId,
    }).returning();

    return { ok: true, id: rock.id };
  });

  // ---- STEP 4: kpi -> kpis -------------------------------------------
  const kpiSchema = z.object({
    title: z.string().trim().min(1).max(255),
    target: z.string().trim().max(40).optional(),
    cadence: z.enum(['weekly', 'monthly']),
    ownerMemberId: z.string().uuid(),
  });

  app.post('/onboarding/kpi', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in required' } });

    const parsed = kpiSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Give the KPI a name', details: parsed.error.issues } });
    }
    const org = await resolveOrg(request, auth.userId);
    if (!org) return reply.status(404).send({ error: { code: 'NO_ORG', message: 'Finish step 1 first' } });

    const owner = await resolveOnboardingOwner(org.id, parsed.data.ownerMemberId);
    if (!owner) return reply.status(400).send({ error: { code: 'BAD_OWNER', message: 'Pick a valid owner' } });

    // Parse "20" / "25%" / "$2,000" into a numeric goal + unit.
    const rawTarget = parsed.data.target || '';
    const numeric = parseFloat(rawTarget.replace(/[^0-9.-]/g, ''));
    const goalValue = Number.isFinite(numeric) ? numeric : null;
    const unit = /%/.test(rawTarget) ? '%' : (/^\s*\$/.test(rawTarget) ? '$' : null);

    const [kpi] = await db.insert(kpis).values({
      organizationId: org.id,
      teamId: await defaultTeamId(org.id),
      ownerEntityType: 'human',
      ownerExternalId: owner.ownerExternalId,
      title: parsed.data.title,
      goalOperator: 'gte',
      goalValue,
      unit,
      timeGrain: parsed.data.cadence,
      createdBy: auth.userId,
    }).returning();

    return { ok: true, id: kpi.id };
  });

  // ---- STEP 5: agent -> manager_agents -------------------------------
  const agentSchema = z.object({
    name: z.string().trim().min(1).max(255),
    description: z.string().trim().max(500).optional(),
    runtime: z.string().trim().max(80).optional(),
    ownerMemberId: z.string().uuid(),
  });

  app.post('/onboarding/agent', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in required' } });

    const parsed = agentSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Give the agent a name', details: parsed.error.issues } });
    }
    const org = await resolveOrg(request, auth.userId);
    if (!org) return reply.status(404).send({ error: { code: 'NO_ORG', message: 'Finish step 1 first' } });

    const [owner] = await db.select().from(orgMembers)
      .where(and(eq(orgMembers.id, parsed.data.ownerMemberId), eq(orgMembers.orgId, org.id))).limit(1);
    if (!owner) return reply.status(400).send({ error: { code: 'BAD_OWNER', message: 'Pick a valid owner' } });

    const desc = parsed.data.description || '';
    const runtime = parsed.data.runtime || '';
    // manager_agents.raw_md is NOT NULL: seed a starter doc the user can flesh
    // out later from the agent builder.
    const rawMd = [
      `# ${parsed.data.name}`,
      '',
      desc || '_What this agent does, to be filled in._',
      '',
      runtime ? `**Runtime:** ${runtime}` : '',
      `**Owner:** ${owner.displayName || 'Unassigned'}`,
      '',
      '_Created during OTP onboarding._',
    ].filter((l) => l !== undefined).join('\n');

    const [agent] = await db.insert(managerAgents).values({
      orgId: org.id,
      ownerUserId: owner.clerkUserId || auth.userId,
      ownerMemberId: owner.id,
      name: parsed.data.name,
      externalId: `AGT_${slugify(parsed.data.name).toUpperCase().replace(/-/g, '_')}`,
      description: desc || null,
      rawMd,
      frontmatter: runtime ? { runtime } : {},
    }).returning();

    return { ok: true, id: agent.id };
  });

  // ---- STEP 6: team -> teams + team_memberships ----------------------
  const teamSchema = z.object({
    name: z.string().trim().min(1).max(255),
    memberIds: z.array(z.string().uuid()).max(50).optional(),
  });

  app.post('/onboarding/team', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in required' } });

    const parsed = teamSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: { code: 'VALIDATION_FAILED', message: 'Give the team a name', details: parsed.error.issues } });
    }
    const org = await resolveOrg(request, auth.userId);
    if (!org) return reply.status(404).send({ error: { code: 'NO_ORG', message: 'Finish step 1 first' } });

    const [team] = await db.insert(teams).values({
      orgId: org.id,
      name: parsed.data.name,
      slug: `${slugify(parsed.data.name)}-${Math.random().toString(36).slice(2, 6)}`,
      type: 'department',
    }).returning();

    // Attach selected members. Only members that genuinely belong to this org
    // are added; the creator (if selected) leads the team.
    const wanted = Array.from(new Set(parsed.data.memberIds || []));
    if (wanted.length > 0) {
      const rows = await db.select().from(orgMembers)
        .where(and(eq(orgMembers.orgId, org.id), eq(orgMembers.status, 'active')));
      const valid = rows.filter((m) => wanted.includes(m.id));
      if (valid.length > 0) {
        await db.insert(teamMemberships).values(
          valid.map((m) => ({
            teamId: team.id,
            memberId: m.id,
            roleOnTeam: (m.clerkUserId === auth.userId ? 'leader' : 'member') as 'leader' | 'member',
          })),
        ).onConflictDoNothing();
      }
    }

    return { ok: true, id: team.id };
  });
}
