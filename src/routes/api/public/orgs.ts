// GET /publishers  GET /orgs/:slug  GET /orgs/:slug/chart — unauthenticated public surface
import type { FastifyInstance } from 'fastify';
import { db } from '../../../config/database.js';
import { organizations } from '../../../db/schema.js';
import { and, eq } from 'drizzle-orm';
import { errorEnvelope, listEnvelope, clampLimit, normalizeSlug } from './_shared.js';

type ChartData = {
  leader?: { type?: string } | null;
  seats?: { type?: string }[];
  note?: string;
};

export default async function orgsPublicRoutes(fastify: FastifyInstance) {
  // GET /publishers
  fastify.get<{ Querystring: { limit?: string } }>('/publishers', async (req, reply) => {
    const limit = clampLimit(req.query.limit, 25, 100);
    const rows = await db
      .select({
        slug: organizations.slug,
        name: organizations.name,
        description: organizations.description,
        website: organizations.website,
        public: organizations.public,
      })
      .from(organizations)
      .where(eq(organizations.public, true))
      .orderBy(organizations.name)
      .limit(limit);

    return reply.send(
      listEnvelope(
        rows.map((row) => ({
          slug: row.slug ?? '',
          name: row.name,
          description: row.description ?? '',
          publish_count: 0,
          last_published_at: null,
          url: row.website ?? '',
          verified: true,
          tracks: ['TEAM'],
        })),
      ),
    );
  });

  // GET /orgs/:slug
  fastify.get<{ Params: { slug: string } }>('/orgs/:slug', async (req, reply) => {
    const slug = normalizeSlug(req.params.slug);
    if (!slug) return errorEnvelope(reply, 400, 'invalid_slug', 'Slug must be a valid kebab-case identifier.');

    const [row] = await db
      .select()
      .from(organizations)
      .where(and(eq(organizations.slug, slug), eq(organizations.public, true)))
      .limit(1);

    if (!row) return errorEnvelope(reply, 404, 'not_found', `No publisher with slug '${slug}'`);

    const chart = row.chart as ChartData | null;
    return reply.send({
      slug: row.slug,
      name: row.name,
      description: row.description ?? '',
      website: row.website ?? '',
      publish_count: 0,
      member_since: row.createdAt ? row.createdAt.toISOString().slice(0, 10) : null,
      verified: true,
      tracks: ['TEAM'],
      agent_count: chart?.seats?.filter((s) => s.type === 'agent').length ?? 0,
      human_count: (chart?.seats?.filter((s) => s.type === 'human').length ?? 0) + (chart?.leader ? 1 : 0),
    });
  });

  // GET /orgs/:slug/chart
  fastify.get<{ Params: { slug: string } }>('/orgs/:slug/chart', async (req, reply) => {
    const slug = normalizeSlug(req.params.slug);
    if (!slug) return errorEnvelope(reply, 400, 'invalid_slug', 'Slug must be a valid kebab-case identifier.');

    const [row] = await db
      .select({ slug: organizations.slug, chart: organizations.chart })
      .from(organizations)
      .where(and(eq(organizations.slug, slug), eq(organizations.public, true)))
      .limit(1);

    if (!row) return errorEnvelope(reply, 404, 'not_found', `No publisher with slug '${slug}'`);

    const chart = row.chart as ChartData | null;
    if (!chart || (Object.keys(chart).length === 0)) {
      return errorEnvelope(reply, 404, 'no_chart', 'This publisher has not exposed a public chart.');
    }

    return reply.send({
      slug: row.slug,
      leader: chart.leader ?? null,
      seats: chart.seats ?? [],
      ...(chart.note !== undefined ? { note: chart.note } : {}),
    });
  });
}
