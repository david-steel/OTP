// GET /api/v1/public/kpis — unauthenticated KPI listing across public orgs
import type { FastifyInstance } from 'fastify';
import { eq, and, ilike, desc, sql } from 'drizzle-orm';
import { db } from '../../../config/database.js';
import { kpis, kpiValues, organizations } from '../../../db/schema.js';
import { listEnvelope, clampLimit } from './_shared.js';
import { excludePrivateOrgs } from '../../../shared/org-visibility.js';

export default async function publicKpisRoutes(app: FastifyInstance) {
  app.get<{
    Querystring: { category?: string; limit?: string; publisher?: string };
  }>('/public/kpis', async (request, reply) => {
    const { category, publisher } = request.query;
    const limit = clampLimit(request.query.limit, 20, 100);

    const conditions = [
      eq(kpis.public, true),
      eq(organizations.public, true),
      // Private-plan enforcement (defense in depth).
      excludePrivateOrgs(),
    ];

    if (category && typeof category === 'string' && category.trim().length > 0) {
      const cat = category.trim().slice(0, 50);
      conditions.push(ilike(kpis.groupName, `%${cat}%`));
    }

    if (publisher && typeof publisher === 'string') {
      conditions.push(eq(organizations.slug, publisher));
    }

    const rows = await db
      .select({
        id: kpis.id,
        title: kpis.title,
        groupName: kpis.groupName,
        timeGrain: kpis.timeGrain,
        goalValue: kpis.goalValue,
        unit: kpis.unit,
        orgSlug: organizations.slug,
      })
      .from(kpis)
      .innerJoin(organizations, eq(kpis.organizationId, organizations.id))
      .where(and(...conditions))
      .orderBy(kpis.title)
      .limit(limit);

    if (rows.length === 0) {
      return reply.send(listEnvelope([], {}));
    }

    // Latest kpiValues per kpi — one query using selectDistinctOn + ANY()
    const kpiIds = rows.map((r) => r.id);
    const latestValues = await db
      .selectDistinctOn([kpiValues.kpiId], {
        kpiId: kpiValues.kpiId,
        value: kpiValues.value,
      })
      .from(kpiValues)
      .where(sql`${kpiValues.kpiId} = ANY(${kpiIds})`)
      .orderBy(kpiValues.kpiId, desc(kpiValues.periodStart));

    const valueMap = new Map<string, number | null>();
    for (const v of latestValues) {
      valueMap.set(v.kpiId, v.value ?? null);
    }

    const results = rows.map((row) => ({
      name: row.title,
      category: row.groupName ?? row.timeGrain ?? 'general',
      publisher: row.orgSlug ?? null,
      target: row.goalValue ?? null,
      current: valueMap.get(row.id) ?? null,
      unit: row.unit ?? null,
    }));

    return reply.send(listEnvelope(results, {}));
  });
}
