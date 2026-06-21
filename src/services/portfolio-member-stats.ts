// src/services/portfolio-member-stats.ts
// Per-member-org stats for the portfolio "org chart" view: how many humans,
// agents, and live KPIs each member org has. One grouped query per metric over
// all the portfolio's active member orgs (no N+1). Read-only; counts only.

import { and, eq, inArray, isNull, sql } from 'drizzle-orm';
import { db } from '../config/database.js';
import { organizations, orgMembers, portfolioMembers, kpis, managerAgents } from '../db/schema.js';

export interface PortfolioMemberStat {
  id: string;
  name: string;
  humanCount: number;
  agentCount: number;
  kpiCount: number;
}

/**
 * Stats for every ACTIVE member org of a portfolio. Returns [] if the portfolio
 * has no member orgs. Each count defaults to 0 when a member has no rows.
 */
export async function getPortfolioMemberStats(portfolioOrgId: string): Promise<PortfolioMemberStat[]> {
  if (!portfolioOrgId) return [];

  // Active member orgs (id + name), oldest link first for a stable order.
  const members = await db
    .select({ id: organizations.id, name: organizations.name })
    .from(portfolioMembers)
    .innerJoin(organizations, eq(organizations.id, portfolioMembers.memberOrgId))
    .where(and(
      eq(portfolioMembers.portfolioOrgId, portfolioOrgId),
      eq(portfolioMembers.status, 'active'),
    ));

  const ids = members.map((m) => m.id);
  if (ids.length === 0) return [];

  // Grouped counts. inArray with a non-empty list (guarded above).
  const [humans, agents, kpiRows] = await Promise.all([
    db
      .select({ orgId: orgMembers.orgId, n: sql<number>`count(*)::int` })
      .from(orgMembers)
      .where(and(inArray(orgMembers.orgId, ids), eq(orgMembers.status, 'active')))
      .groupBy(orgMembers.orgId),
    db
      .select({ orgId: managerAgents.orgId, n: sql<number>`count(*)::int` })
      .from(managerAgents)
      .where(and(inArray(managerAgents.orgId, ids), isNull(managerAgents.deletedAt)))
      .groupBy(managerAgents.orgId),
    db
      .select({ orgId: kpis.organizationId, n: sql<number>`count(*)::int` })
      .from(kpis)
      .where(and(inArray(kpis.organizationId, ids), isNull(kpis.deletedAt), isNull(kpis.archivedAt)))
      .groupBy(kpis.organizationId),
  ]);

  const humanBy = new Map(humans.map((r) => [r.orgId, Number(r.n) || 0]));
  const agentBy = new Map(agents.map((r) => [r.orgId, Number(r.n) || 0]));
  const kpiBy = new Map(kpiRows.map((r) => [r.orgId, Number(r.n) || 0]));

  return members.map((m) => ({
    id: m.id,
    name: m.name,
    humanCount: humanBy.get(m.id) ?? 0,
    agentCount: agentBy.get(m.id) ?? 0,
    kpiCount: kpiBy.get(m.id) ?? 0,
  }));
}
