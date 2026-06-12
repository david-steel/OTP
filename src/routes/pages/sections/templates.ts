import type { FastifyInstance } from 'fastify';
import { BASE_URL, bc, renderInShell } from '../_shared.js';
import {
  MEETING_TEMPLATES,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  getTemplateBySlug,
  templateSearchIndex,
} from '../../../data/meeting-templates.js';

// Free meeting-template library (/templates). Mirrors sections/blog.ts:
// a content barrel (src/data/meeting-templates.ts) drives an index route, a
// :slug detail route, and a :slug/download route. All content is authored +
// public -- no auth, safe to cache the download.

// ISO 8601 duration from a minute count, for HowTo.totalTime (e.g. PT90M).
function isoDuration(minutes: number): string {
  if (!minutes || minutes <= 0) return 'PT0M';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return 'PT' + (h ? h + 'H' : '') + (m ? m + 'M' : (h ? '' : '0M'));
}

export default async function templateRoutes(app: FastifyInstance) {
  // /templates -- the library index. Embeds the search index for the
  // client-side filter (via jsonForScript in the view, never raw stringify).
  app.get<{ Querystring: { category?: string; q?: string } }>('/templates', async (request, reply) => {
    // Slim projection for the cards + client search. templateSearchIndex()
    // already carries slug/title/shortName/description/category/methodology/
    // minutes/cadence + the lowercased search blob.
    const index = templateSearchIndex();
    return renderInShell(request, reply, 'templates', {
      title: 'Free Meeting Templates & Agendas - OTP',
      description:
        'Free meeting templates and agendas for EOS Level 10, Scaling Up, Agile sprints, retrospectives, 1:1s, and more. Download as Markdown or run them live in OrgTP.',
      canonical: BASE_URL + '/templates',
      breadcrumbs: bc({ name: 'Templates', url: BASE_URL + '/templates' }),
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Free Meeting Templates & Agendas',
        description:
          'A free library of meeting templates and agendas for EOS, Scaling Up, Agile, retrospectives, 1:1s, and team operations.',
        url: BASE_URL + '/templates',
        isAccessibleForFree: true,
      },
      templates: index,
      categoryLabels: CATEGORY_LABELS,
      categoryOrder: CATEGORY_ORDER,
      templateSearchIndex: index,
    });
  });

  // /templates/:slug -- a single template detail page. HowTo JSON-LD built
  // from the timeboxed steps.
  app.get<{ Params: { slug: string } }>('/templates/:slug', async (request, reply) => {
    const slug = request.params.slug;
    if (!/^[a-z0-9-]+$/.test(slug)) return reply.callNotFound();
    const template = getTemplateBySlug(slug);
    if (!template) return reply.callNotFound();

    // Related: same category, exclude self, cap 4.
    const related = MEETING_TEMPLATES.filter(
      (t) => t.category === template.category && t.slug !== template.slug,
    ).slice(0, 4);

    return renderInShell(request, reply, 'template-detail', {
      title: template.title + ' - OTP',
      description: template.description,
      canonical: BASE_URL + '/templates/' + slug,
      ogType: 'article',
      breadcrumbs: bc(
        { name: 'Templates', url: BASE_URL + '/templates' },
        { name: template.shortName, url: BASE_URL + '/templates/' + slug },
      ),
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: template.title.replace(/ - OTP$/, ''),
        description: template.description,
        url: BASE_URL + '/templates/' + slug,
        totalTime: isoDuration(template.minutes),
        isAccessibleForFree: true,
        step: template.steps.map((s, i) => ({
          '@type': 'HowToStep',
          position: i + 1,
          name: s.name,
          text: s.text,
        })),
      },
      template,
      related,
    });
  });

  // /templates/:slug/download -- serve the authored Markdown as a file.
  // Public + static content, so caching is fine (mirrors the attachments
  // download header discipline, minus the private cache control).
  app.get<{ Params: { slug: string } }>('/templates/:slug/download', async (request, reply) => {
    const slug = request.params.slug;
    if (!/^[a-z0-9-]+$/.test(slug)) return reply.callNotFound();
    const template = getTemplateBySlug(slug);
    if (!template) return reply.callNotFound();
    return reply
      .header('Content-Disposition', `attachment; filename="${slug}.md"`)
      .header('X-Content-Type-Options', 'nosniff')
      .header('Cache-Control', 'public, max-age=3600')
      .type('text/markdown; charset=utf-8')
      .send(template.downloadMarkdown);
  });
}
