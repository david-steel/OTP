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

export default async function portfolioPages(app: FastifyInstance) {
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

    return reply.view('pages/portfolio', {
      title: 'Portfolios - OTP',
      noindex: true,
      authState: 'authenticated',
      featureEnabled: true,
      portfolios,
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

    // The whole surface is Labs-gated; check the portfolio org's own flag.
    const featureEnabled = await isFeatureEnabledForOrg(portfolioId, 'portfolio');
    if (!featureEnabled) {
      return reply.view('pages/portfolio-detail', {
        title: 'Portfolio - OTP',
        noindex: true,
        authState: 'feature_off',
      });
    }

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

    return reply.view('pages/portfolio-detail', {
      title: (detail.portfolio.name || 'Portfolio') + ' - OTP',
      noindex: true,
      authState: 'authenticated',
      portfolio: detail.portfolio,
      memberOrgs: detail.memberOrgs,
      superMetrics: detail.superMetrics,
      latestByKpi,
      memberNameById,
    });
  });
}
