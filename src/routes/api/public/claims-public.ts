// GET /api/v1/public/learnings  — captured corrections (failureMode set)
// GET /api/v1/public/rules       — section='core_operating_rules', filtered by role
// GET /api/v1/public/patterns    — section='coordination_patterns'
import type { FastifyInstance } from 'fastify';
import { eq, and, or, ilike, desc, ne, sql } from 'drizzle-orm';
import { db } from '../../../config/database.js';
import { claims, oosFiles, organizations } from '../../../db/schema.js';
import { errorEnvelope, listEnvelope, clampLimit, normalizeSlug } from './_shared.js';
import { excludePrivateOrgs } from '../../../shared/org-visibility.js';

// ---- shared JOIN helper ----
// Returns a base select with org slug attached, filtered to public claims+orgs.
// Callers push additional conditions into `extraConditions`.
function baseSelect(extraConditions: Parameters<typeof and>[0][]) {
  return db
    .select({
      id: claims.id,
      rule: claims.rule,
      why: claims.why,
      failureMode: claims.failureMode,
      agentName: claims.agentName,
      sourceUrl: claims.sourceUrl,
      section: claims.section,
      roles: claims.roles,
      createdAt: claims.createdAt,
      orgSlug: organizations.slug,
    })
    .from(claims)
    .innerJoin(oosFiles, eq(claims.oosFileId, oosFiles.id))
    .innerJoin(organizations, eq(oosFiles.orgId, organizations.id))
    .where(
      and(
        eq(claims.public, true),
        eq(organizations.public, true),
        // Private-plan enforcement (defense in depth): a private org should
        // never be public, but enforce the hard exclusion regardless.
        excludePrivateOrgs(),
        ...extraConditions,
      ),
    );
}

export default async function publicClaimsRoutes(app: FastifyInstance) {

  // =================================================================
  // GET /learnings
  // =================================================================
  app.get<{
    Querystring: {
      since_days?: string;
      limit?: string;
      publisher?: string;
      agent?: string;
      q?: string;
    };
  }>('/learnings', async (request, reply) => {
    const { publisher, agent, q } = request.query;

    if (q !== undefined && q.length > 200) {
      return errorEnvelope(reply, 400, 'invalid_query', 'q must be ≤200 chars.');
    }

    const sinceDays = (() => {
      const raw = parseInt(request.query.since_days ?? '7', 10);
      if (!Number.isFinite(raw) || raw <= 0) return 7;
      return Math.min(raw, 365);
    })();

    const limit = clampLimit(request.query.limit, 20, 100);

    const conditions: Parameters<typeof and>[0][] = [
      // "learning" = a correction was captured — failureMode is nonempty
      ne(claims.failureMode, ''),
      sql`${claims.createdAt} >= NOW() - (${sinceDays}::int || ' days')::interval`,
    ];

    if (publisher) {
      const slug = normalizeSlug(publisher);
      if (!slug) return errorEnvelope(reply, 400, 'invalid_publisher', 'Invalid publisher slug.');
      conditions.push(eq(organizations.slug, slug));
    }

    if (agent) {
      conditions.push(eq(claims.agentName, agent));
    }

    if (q) {
      const pattern = '%' + q + '%';
      conditions.push(
        or(
          ilike(claims.rule, pattern),
          ilike(claims.why, pattern),
          ilike(claims.failureMode, pattern),
        )!,
      );
    }

    const rows = await baseSelect(conditions).orderBy(desc(claims.createdAt)).limit(limit);

    const results = rows.map((row) => ({
      id: row.id,
      publisher: row.orgSlug ?? null,
      agent: row.agentName ?? 'system',
      what_failed: row.failureMode ?? '',
      what_to_do: row.rule ?? '',
      why: row.why ?? '',
      source_url: row.sourceUrl ?? null,
      captured_at: row.createdAt.toISOString(),
    }));

    return reply.send(listEnvelope(results, { since_days: sinceDays }));
  });

  // =================================================================
  // GET /rules
  // =================================================================
  app.get<{
    Querystring: {
      role: string;
      limit?: string;
      publisher?: string;
    };
  }>('/rules', async (request, reply) => {
    const { role, publisher } = request.query;

    if (!role || typeof role !== 'string' || role.trim().length === 0 || role.length > 100) {
      return errorEnvelope(reply, 400, 'missing_role', 'Query parameter role is required and must be ≤100 chars.');
    }

    const limit = clampLimit(request.query.limit, 25, 100);

    const conditions: Parameters<typeof and>[0][] = [
      eq(claims.section, 'core_operating_rules'),
      sql`${role} = ANY(${claims.roles})`,
    ];

    if (publisher) {
      const slug = normalizeSlug(publisher);
      if (!slug) return errorEnvelope(reply, 400, 'invalid_publisher', 'Invalid publisher slug.');
      conditions.push(eq(organizations.slug, slug));
    }

    const rows = await baseSelect(conditions).orderBy(desc(claims.createdAt)).limit(limit);

    const results = rows.map((row) => ({
      rule: row.rule,
      source: (row.orgSlug ?? 'unknown') + '/' + (row.agentName ?? 'system'),
      tags: [] as string[],
      captured_at: row.createdAt.toISOString().slice(0, 10),
    }));

    return reply.send(listEnvelope(results, { role }));
  });

  // =================================================================
  // GET /patterns
  // =================================================================
  app.get<{
    Querystring: {
      topic?: string;
      limit?: string;
      min_orgs?: string;
    };
  }>('/patterns', async (request, reply) => {
    const { topic } = request.query;
    const limit = clampLimit(request.query.limit, 15, 50);
    const minOrgs = clampLimit(request.query.min_orgs, 2, 10); // v1: included in response, not enforced

    const conditions: Parameters<typeof and>[0][] = [
      eq(claims.section, 'coordination_patterns'),
    ];

    if (topic) {
      const pattern = '%' + topic + '%';
      conditions.push(
        or(
          ilike(claims.rule, pattern),
          ilike(claims.why, pattern),
        )!,
      );
    }

    const rows = await baseSelect(conditions).orderBy(desc(claims.createdAt)).limit(limit);

    const results = rows.map((row) => ({
      id: row.id,
      title: row.rule.slice(0, 100),
      orgs_observed: 1, // v1 placeholder — real clustering in v0.3
      min_orgs_requested: minOrgs,
      summary: row.why || row.rule,
      tags: [] as string[],
      example_publishers: [row.orgSlug ?? 'unknown'],
      first_observed_at: row.createdAt.toISOString().slice(0, 10),
    }));

    return reply.send(listEnvelope(results, {}));
  });
}
