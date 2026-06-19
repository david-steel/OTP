// Portfolio data-service.
//
// A Portfolio is an organizations row with kind='portfolio' and isPrivate=true
// (so it never appears in any cross-org browse/search surface). Its clerkOrgId
// is a synthetic `portfolio:<uuid>` value -- a portfolio has no real Clerk org.
//
// Member orgs link to the portfolio via portfolio_members. A "super-metric" is
// an ordinary kpis row in the portfolio org, fed by one-or-more member KPIs via
// portfolio_metric_sources. People belong to orgs via org_members; a portfolio
// member (person) must already belong to one of the linked member orgs.
//
// This layer is pure CRUD. It never imports or triggers the rollup aggregator --
// the API layer recomputes super-metrics separately after a mutation.

import { eq, and, inArray, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { db } from '../config/database.js';
import {
  organizations,
  orgMembers,
  portfolioMembers,
  portfolioMetricSources,
  kpis,
} from '../db/schema.js';

export class PortfolioError extends Error {
  constructor(public code: string, message: string, public httpStatus = 400) {
    super(message);
  }
}

// ---- Create ----

export interface CreatePortfolioInput {
  name: string;
  creatorClerkUserId: string;
  creatorEmail?: string | null;
}

/**
 * Create a portfolio org and seat the creator as its owner. The portfolio is
 * private (excluded from every cross-org read surface) and carries a synthetic
 * `portfolio:<uuid>` clerkOrgId since there is no real Clerk org behind it.
 */
export async function createPortfolio(
  input: CreatePortfolioInput,
): Promise<typeof organizations.$inferSelect> {
  const name = String(input.name || '').trim();
  if (!name) throw new PortfolioError('INVALID_NAME', 'A portfolio name is required');
  if (!input.creatorClerkUserId) {
    throw new PortfolioError('NOT_AUTHENTICATED', 'A creator is required', 401);
  }

  // Idempotency: if this creator already OWNS an active portfolio with the same
  // name (trimmed, case-insensitive), return it so a retried POST is a no-op.
  const [existing] = await db
    .select({ org: organizations })
    .from(orgMembers)
    .innerJoin(organizations, eq(organizations.id, orgMembers.orgId))
    .where(and(
      eq(orgMembers.clerkUserId, input.creatorClerkUserId),
      eq(orgMembers.role, 'owner'),
      eq(orgMembers.status, 'active'),
      eq(organizations.kind, 'portfolio'),
      sql`lower(${organizations.name}) = lower(${name})`,
    ))
    .limit(1);
  if (existing) return existing.org;

  const [portfolio] = await db.insert(organizations).values({
    name,
    kind: 'portfolio',
    isPrivate: true,
    clerkOrgId: `portfolio:${randomUUID()}`,
    // industry + size are NOT NULL with no default; portfolios carry sentinels.
    industry: 'Portfolio',
    size: 'small',
  }).returning();

  await db.insert(orgMembers).values({
    orgId: portfolio.id,
    clerkUserId: input.creatorClerkUserId,
    email: input.creatorEmail || null,
    role: 'owner',
    status: 'active',
  });

  return portfolio;
}

// ---- Member-org linking ----

/**
 * Link a member org into a portfolio. Validates that the portfolio is a real
 * portfolio, the member exists and is NOT itself a portfolio (no nesting), and
 * the two are distinct. Idempotent: a duplicate link is a no-op (the unique
 * index on (portfolio_org_id, member_org_id) backstops the catch).
 */
export async function linkMemberOrg(portfolioOrgId: string, memberOrgId: string): Promise<void> {
  if (portfolioOrgId === memberOrgId) {
    throw new PortfolioError('SELF_LINK', 'A portfolio cannot include itself');
  }

  const [portfolio] = await db
    .select({ kind: organizations.kind })
    .from(organizations)
    .where(eq(organizations.id, portfolioOrgId))
    .limit(1);
  if (!portfolio) throw new PortfolioError('PORTFOLIO_NOT_FOUND', 'Portfolio not found', 404);
  if (portfolio.kind !== 'portfolio') {
    throw new PortfolioError('NOT_A_PORTFOLIO', 'Target org is not a portfolio');
  }

  const [member] = await db
    .select({ kind: organizations.kind })
    .from(organizations)
    .where(eq(organizations.id, memberOrgId))
    .limit(1);
  if (!member) throw new PortfolioError('MEMBER_NOT_FOUND', 'Member org not found', 404);
  if (member.kind === 'portfolio') {
    throw new PortfolioError('CANNOT_NEST_PORTFOLIO', 'Portfolios cannot be nested');
  }

  try {
    await db.insert(portfolioMembers).values({
      portfolioOrgId,
      memberOrgId,
      status: 'active',
    });
  } catch {
    // Duplicate (portfolio_org_id, member_org_id) -- already linked. No-op.
  }
}

/**
 * Unlink a member org from a portfolio. No-op if the link does not exist.
 */
export async function unlinkMemberOrg(portfolioOrgId: string, memberOrgId: string): Promise<void> {
  await db
    .delete(portfolioMembers)
    .where(and(
      eq(portfolioMembers.portfolioOrgId, portfolioOrgId),
      eq(portfolioMembers.memberOrgId, memberOrgId),
    ));
}

// ---- Read: portfolios for a user ----

/**
 * List the portfolios a user owns/belongs to via an active org_members row.
 */
export async function listPortfoliosForUser(
  clerkUserId: string,
): Promise<Array<{ id: string; name: string; role: string }>> {
  if (!clerkUserId) return [];
  const rows = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      role: orgMembers.role,
    })
    .from(orgMembers)
    .innerJoin(organizations, eq(organizations.id, orgMembers.orgId))
    .where(and(
      eq(orgMembers.clerkUserId, clerkUserId),
      eq(orgMembers.status, 'active'),
      eq(organizations.kind, 'portfolio'),
    ));
  return rows.map(r => ({ id: r.id, name: r.name, role: r.role as string }));
}

// ---- Read: full portfolio detail ----

export interface PortfolioDetail {
  portfolio: typeof organizations.$inferSelect;
  memberOrgs: Array<{ id: string; name: string }>;
  superMetrics: Array<
    typeof kpis.$inferSelect & {
      sources: Array<typeof portfolioMetricSources.$inferSelect>;
    }
  >;
}

/**
 * Load a portfolio with its linked member orgs and its super-metrics (kpis rows
 * in the portfolio org that are not deleted/archived), each with their mapped
 * portfolio_metric_sources inputs.
 */
export async function getPortfolioDetail(portfolioOrgId: string): Promise<PortfolioDetail> {
  const [portfolio] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, portfolioOrgId))
    .limit(1);
  if (!portfolio) throw new PortfolioError('PORTFOLIO_NOT_FOUND', 'Portfolio not found', 404);

  const memberOrgs = await db
    .select({
      id: organizations.id,
      name: organizations.name,
    })
    .from(portfolioMembers)
    .innerJoin(organizations, eq(organizations.id, portfolioMembers.memberOrgId))
    .where(eq(portfolioMembers.portfolioOrgId, portfolioOrgId));

  const metricRows = await db
    .select()
    .from(kpis)
    .where(and(eq(kpis.organizationId, portfolioOrgId)));

  // Drop soft-deleted / archived super-metrics.
  const liveMetrics = metricRows.filter(k => !k.deletedAt && !k.archivedAt);

  const kpiIds = liveMetrics.map(k => k.id);
  const sources = kpiIds.length > 0
    ? await db
        .select()
        .from(portfolioMetricSources)
        .where(inArray(portfolioMetricSources.portfolioKpiId, kpiIds))
    : [];

  const sourcesByKpi = new Map<string, Array<typeof portfolioMetricSources.$inferSelect>>();
  for (const s of sources) {
    const list = sourcesByKpi.get(s.portfolioKpiId) || [];
    list.push(s);
    sourcesByKpi.set(s.portfolioKpiId, list);
  }

  const superMetrics = liveMetrics.map(k => ({
    ...k,
    sources: sourcesByKpi.get(k.id) || [],
  }));

  return { portfolio, memberOrgs, superMetrics };
}

// ---- Super-metrics ----

export interface SuperMetricDef {
  title: string;
  unit?: string | null;
  goalOperator?: 'gte' | 'lte' | 'eq' | 'gt' | 'lt' | null;
  goalValue?: number | null;
  timeGrain?: 'weekly' | 'monthly' | 'quarterly' | 'annual';
  ownerExternalId: string;
}

export interface SuperMetricSource {
  memberOrgId: string;
  memberKpiId: string;
  weight: number;
}

/**
 * Add a super-metric: a kpis row in the portfolio org, plus one
 * portfolio_metric_sources row per input. Does NOT recompute the rollup -- the
 * API layer triggers the aggregator separately. Returns the new kpiId.
 */
export async function addSuperMetric(
  portfolioOrgId: string,
  def: SuperMetricDef,
  sources: SuperMetricSource[],
): Promise<{ kpiId: string }> {
  const title = String(def.title || '').trim();
  if (!title) throw new PortfolioError('INVALID_TITLE', 'A super-metric title is required');
  if (!def.ownerExternalId) {
    throw new PortfolioError('INVALID_OWNER', 'A super-metric owner is required');
  }

  if (sources.length > 0) {
    const sourceOrgIds = [...new Set(sources.map(s => s.memberOrgId))];
    const sourceKpiIds = [...new Set(sources.map(s => s.memberKpiId))];

    const activeLinks = await db
      .select({ memberOrgId: portfolioMembers.memberOrgId })
      .from(portfolioMembers)
      .where(and(
        eq(portfolioMembers.portfolioOrgId, portfolioOrgId),
        inArray(portfolioMembers.memberOrgId, sourceOrgIds),
        eq(portfolioMembers.status, 'active'),
      ));
    const activeOrgIds = new Set(activeLinks.map(l => l.memberOrgId));

    const memberKpis = await db
      .select({ id: kpis.id, organizationId: kpis.organizationId })
      .from(kpis)
      .where(inArray(kpis.id, sourceKpiIds));
    const kpiOrgById = new Map(memberKpis.map(k => [k.id, k.organizationId]));

    for (const s of sources) {
      if (!activeOrgIds.has(s.memberOrgId)) {
        throw new PortfolioError('SOURCE_ORG_NOT_MEMBER', 'source org not a member of this portfolio');
      }
      const kpiOrgId = kpiOrgById.get(s.memberKpiId);
      if (!kpiOrgId || kpiOrgId !== s.memberOrgId) {
        throw new PortfolioError('SOURCE_KPI_INVALID', 'source KPI does not belong to the member org');
      }
    }
  }

  const [kpi] = await db.insert(kpis).values({
    organizationId: portfolioOrgId,
    teamId: null,
    ownerEntityType: 'human',
    ownerExternalId: def.ownerExternalId,
    title,
    unit: def.unit ?? null,
    goalOperator: def.goalOperator ?? null,
    goalValue: def.goalValue ?? null,
    timeGrain: def.timeGrain ?? 'weekly',
    createdBy: def.ownerExternalId,
  }).returning();

  if (sources.length > 0) {
    await db.insert(portfolioMetricSources).values(
      sources.map(s => ({
        portfolioKpiId: kpi.id,
        memberOrgId: s.memberOrgId,
        memberKpiId: s.memberKpiId,
        weight: s.weight,
      })),
    );
  }

  return { kpiId: kpi.id };
}

// ---- Membership rule helper ----

/**
 * True if the user holds an active org_members row in ANY org linked to this
 * portfolio. Used to enforce the rule that a portfolio (super-org) member must
 * already belong to one of the linked member orgs.
 */
export async function isUserInAnyMemberOrg(
  portfolioOrgId: string,
  clerkUserId: string,
): Promise<boolean> {
  if (!portfolioOrgId || !clerkUserId) return false;

  const links = await db
    .select({ memberOrgId: portfolioMembers.memberOrgId })
    .from(portfolioMembers)
    .where(eq(portfolioMembers.portfolioOrgId, portfolioOrgId));
  const memberOrgIds = links.map(l => l.memberOrgId);
  if (memberOrgIds.length === 0) return false;

  const [hit] = await db
    .select({ id: orgMembers.id })
    .from(orgMembers)
    .where(and(
      eq(orgMembers.clerkUserId, clerkUserId),
      eq(orgMembers.status, 'active'),
      inArray(orgMembers.orgId, memberOrgIds),
    ))
    .limit(1);

  return !!hit;
}
