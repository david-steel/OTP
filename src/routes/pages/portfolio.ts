/**
 * Portfolio SSR pages.
 *
 * A Portfolio is a private "super-org" (organizations.kind='portfolio') that
 * rolls KPIs up across several member orgs. The whole surface is gated behind
 * the 'portfolio' Labs feature (surfaceUrl '/portfolio'); when the flag is off
 * the index page renders a tasteful "enable in Labs" state.
 *
 * Pattern mirrors /settings/danger + /dashboard/meeting-formats: render the
 * authenticated main.ejs shell via reply.view('pages/<name>', {...}) with an
 * authState string, gate with isFeatureEnabledForOrg, and authZ the detail
 * page against an active org_members row in the portfolio org.
 *
 * NOTE: routes are NOT registered here -- a later task wires this plugin into
 * server.ts.
 */
import type { FastifyInstance } from 'fastify';
import { getAuth } from '@clerk/fastify';
import { and, eq, desc } from 'drizzle-orm';
import { db } from '../../config/database.js';
import { orgMembers, kpiValues } from '../../db/schema.js';
import { resolveRequestOrg } from './pages.js';
import { isFeatureEnabledForOrg } from '../../services/lab-features.js';
import { validateUuidParam } from '../../shared/param-validation.js';
import {
  listPortfoliosForUser,
  getPortfolioDetail,
} from '../../services/portfolios.js';
import { listPendingInvitesForUser } from '../../services/portfolio-invites.js';
import { getPortfolioMemberStats } from '../../services/portfolio-member-stats.js';
import { getChampionInviteByToken } from '../../services/portfolio-champion-invites.js';

export default async function portfolioPages(app: FastifyInstance) {

  // GET /portfolio/invite/:token -- the champion accept page. A signed-in user
  // who opens the link sees "You've been invited to <portfolio>" + an org-name
  // input and an Accept button (which POSTs to the accept API, then redirects
  // to the new org). Not-signed-in -> sign-in with redirect back. Invalid/used
  // token -> a tasteful not-found state.
  app.get<{ Params: { token: string } }>('/portfolio/invite/:token', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) {
      return reply.redirect('/sign-in?redirect=' + encodeURIComponent(request.url));
    }

    const token = String(request.params.token || '').trim();
    let invite = token && token.length <= 64 ? await getChampionInviteByToken(token) : null;
    if (!invite || invite.status !== 'pending') {
      return reply.status(404).view('pages/portfolio-invite-accept', {
        title: 'Invite - OTP',
        noindex: true,
        authState: 'not_found',
      });
    }

    return reply.view('pages/portfolio-invite-accept', {
      title: 'Join ' + invite.portfolioName + ' - OTP',
      noindex: true,
      authState: 'authenticated',
      token,
      portfolioName: invite.portfolioName,
      suggestedOrgName: invite.orgName || '',
    });
  });
  // GET /portfolio -- list the viewer's portfolios (or the Labs-gate state).
  app.get('/portfolio', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId && !(request as any).orgMember) {
      return reply.view('pages/portfolio', {
        title: 'Portfolios - OTP',
        noindex: true,
        authState: 'unauthenticated',
        featureEnabled: false,
        portfolios: [],
      });
    }

    const org = await resolveRequestOrg(request);
    if (!org) {
      return reply.view('pages/portfolio', {
        title: 'Portfolios - OTP',
        noindex: true,
        authState: 'no_org',
        featureEnabled: false,
        portfolios: [],
      });
    }

    const featureEnabled = await isFeatureEnabledForOrg(org.id, 'portfolio');
    if (!featureEnabled) {
      return reply.view('pages/portfolio', {
        title: 'Portfolios - OTP',
        noindex: true,
        authState: 'authenticated',
        featureEnabled: false,
        portfolios: [],
      });
    }

    const portfolios = auth.userId
      ? await listPortfoliosForUser(auth.userId)
      : [];

    const pendingInvites = auth.userId
      ? await listPendingInvitesForUser(auth.userId)
      : [];

    return reply.view('pages/portfolio', {
      title: 'Portfolios - OTP',
      noindex: true,
      authState: 'authenticated',
      featureEnabled: true,
      portfolios,
      pendingInvites,
    });
  });

  // GET /portfolio/:id -- one portfolio with members + super-metrics.
  app.get<{ Params: { id: string } }>('/portfolio/:id', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) {
      return reply.redirect('/sign-in?redirect=' + encodeURIComponent(request.url));
    }

    const portfolioId = validateUuidParam(request.params.id);
    if (!portfolioId) {
      return reply.view('pages/portfolio-detail', {
        title: 'Portfolio - OTP',
        noindex: true,
        authState: 'not_found',
      });
    }

    // AuthZ: the caller must hold an active org_members row in this portfolio
    // org. Anything else (no row, inactive, or a non-portfolio id) is a 404 so
    // we never confirm a portfolio the viewer can't see.
    const [membership] = await db
      .select({ id: orgMembers.id })
      .from(orgMembers)
      .where(and(
        eq(orgMembers.orgId, portfolioId),
        eq(orgMembers.clerkUserId, auth.userId),
        eq(orgMembers.status, 'active'),
      ))
      .limit(1);
    if (!membership) {
      return reply.status(404).view('pages/portfolio-detail', {
        title: 'Portfolio - OTP',
        noindex: true,
        authState: 'not_found',
      });
    }

    // Active membership in the portfolio org (checked above) is the gate for
    // viewing a portfolio you belong to. We do NOT require the Labs flag on the
    // portfolio org itself -- it never carries that flag (the flag lives on the
    // member orgs that opted into the feature), so checking it here locked an
    // owner out of their own portfolio.

    let detail;
    try {
      detail = await getPortfolioDetail(portfolioId);
    } catch {
      return reply.status(404).view('pages/portfolio-detail', {
        title: 'Portfolio - OTP',
        noindex: true,
        authState: 'not_found',
      });
    }

    // Latest computed rollup value per super-metric (most recent period).
    const latestByKpi: Record<string, number | null> = {};
    for (const sm of detail.superMetrics) {
      try {
        const [latest] = await db
          .select({ value: kpiValues.value })
          .from(kpiValues)
          .where(eq(kpiValues.kpiId, sm.id))
          .orderBy(desc(kpiValues.periodStart))
          .limit(1);
        latestByKpi[sm.id] = latest ? latest.value : null;
      } catch (err) {
        request.log.warn({ err, kpiId: sm.id }, 'portfolio detail: latest value lookup failed');
        latestByKpi[sm.id] = null;
      }
    }

    // Member-org name lookup so source rows can show a label, not a raw id.
    const memberNameById: Record<string, string> = {};
    for (const m of detail.memberOrgs) memberNameById[m.id] = m.name;

    // Per-member stats (humans / agents / KPIs) for the org-chart cards.
    // Best-effort: a stats failure must not blank the whole portfolio page.
    let memberStats: Awaited<ReturnType<typeof getPortfolioMemberStats>> = [];
    try {
      memberStats = await getPortfolioMemberStats(portfolioId);
    } catch (err) {
      request.log.warn({ err, portfolioId }, 'portfolio detail: member stats lookup failed');
    }

    return reply.view('pages/portfolio-detail', {
      title: (detail.portfolio.name || 'Portfolio') + ' - OTP',
      noindex: true,
      authState: 'authenticated',
      portfolio: detail.portfolio,
      memberOrgs: detail.memberOrgs,
      superMetrics: detail.superMetrics,
      latestByKpi,
      memberNameById,
      memberStats,
    });
  });
}
