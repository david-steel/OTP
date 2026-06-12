import type { FastifyInstance } from 'fastify';
import { BASE_URL, bc, renderInShell } from '../_shared.js';
import {
  SOP_TEMPLATES,
  SOP_CATEGORY_LABELS,
  SOP_CATEGORY_ORDER,
  getSopBySlug,
  sopSearchIndex,
} from '../../../data/sop-templates.js';
import type { SopTemplate } from '../../../data/sop-templates.js';

// Free Process Library (/process-templates). Mirrors sections/templates.ts:
// the content barrel (src/data/sop-templates.ts) drives an index route, a
// :slug detail route, and a :slug/download route. All content is authored +
// public -- no auth, safe to cache the download. Each SOP is agent-runnable
// (it carries trigger/steps/outputs/tools) and the detail page funnels into
// the app via "Use in OTP" -> /processes?insert=<slug>.

// Build the clean .md a visitor downloads. Authored content only (no user
// data), so plain string assembly is safe.
function sopToMarkdown(s: SopTemplate): string {
  const lines: string[] = [];
  lines.push('# ' + s.title);
  lines.push('');
  lines.push('> ' + s.description);
  lines.push('');
  lines.push('**Category:** ' + (SOP_CATEGORY_LABELS[s.category] || s.category));
  lines.push('');
  lines.push('**When to use:** ' + s.whenToUse);
  lines.push('');
  lines.push('**Trigger:** ' + s.trigger);
  lines.push('');
  lines.push('## Steps');
  lines.push('');
  s.steps.forEach((step, i) => lines.push(`${i + 1}. ${step}`));
  lines.push('');
  if (s.outputs && s.outputs.length) {
    lines.push('## Outputs');
    lines.push('');
    s.outputs.forEach((o) => lines.push('- ' + o));
    lines.push('');
  }
  if (s.tools && s.tools.length) {
    lines.push('## Tools');
    lines.push('');
    s.tools.forEach((t) => lines.push('- ' + t));
    lines.push('');
  }
  if (s.tips && s.tips.length) {
    lines.push('## Tips');
    lines.push('');
    s.tips.forEach((t) => lines.push('- ' + t));
    lines.push('');
  }
  if (s.notes) {
    lines.push('## Notes');
    lines.push('');
    lines.push(s.notes);
    lines.push('');
  }
  lines.push('---');
  lines.push('');
  lines.push('Free SOP from the OrgTP Process Library — ' + BASE_URL + '/process-templates/' + s.slug);
  lines.push('Run it live with your humans and AI agents at ' + BASE_URL + '.');
  lines.push('');
  return lines.join('\n');
}

export default async function sopLibraryRoutes(app: FastifyInstance) {
  // /process-templates -- the library index. Embeds the search index for the
  // client-side filter (serialized with jsonForScript in the view).
  app.get<{ Querystring: { category?: string; q?: string } }>('/process-templates', async (request, reply) => {
    const index = sopSearchIndex();
    return renderInShell(request, reply, 'sop-library', {
      title: 'Free SOP & Process Templates Library - OTP',
      description:
        'A free library of original, ready-to-run SOPs and process templates for sales, marketing, customer success, operations, finance, HR, engineering, and more. Download as Markdown or run them live with your AI agents in OrgTP.',
      canonical: BASE_URL + '/process-templates',
      breadcrumbs: bc({ name: 'Process Library', url: BASE_URL + '/process-templates' }),
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Free SOP & Process Templates Library',
        description:
          'A free library of original SOPs and process templates across every business function, each agent-runnable and downloadable as Markdown.',
        url: BASE_URL + '/process-templates',
        isAccessibleForFree: true,
      },
      sops: index,
      categoryLabels: SOP_CATEGORY_LABELS,
      categoryOrder: SOP_CATEGORY_ORDER,
      sopSearchIndex: index,
    });
  });

  // /process-templates/:slug -- a single SOP detail page. HowTo JSON-LD built
  // from the numbered steps.
  app.get<{ Params: { slug: string } }>('/process-templates/:slug', async (request, reply) => {
    const slug = request.params.slug;
    if (!/^[a-z0-9-]+$/.test(slug)) return reply.callNotFound();
    const sop = getSopBySlug(slug);
    if (!sop) return reply.callNotFound();

    // Related: same category, exclude self, cap 4.
    const related = SOP_TEMPLATES.filter(
      (s) => s.category === sop.category && s.slug !== sop.slug,
    ).slice(0, 4);

    return renderInShell(request, reply, 'sop-detail', {
      title: sop.title + ' SOP - OTP',
      description: sop.description,
      canonical: BASE_URL + '/process-templates/' + slug,
      ogType: 'article',
      breadcrumbs: bc(
        { name: 'Process Library', url: BASE_URL + '/process-templates' },
        { name: sop.shortName || sop.title, url: BASE_URL + '/process-templates/' + slug },
      ),
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: sop.title,
        description: sop.description,
        url: BASE_URL + '/process-templates/' + slug,
        isAccessibleForFree: true,
        step: sop.steps.map((text, i) => ({
          '@type': 'HowToStep',
          position: i + 1,
          name: 'Step ' + (i + 1),
          text,
        })),
      },
      sop,
      categoryLabel: SOP_CATEGORY_LABELS[sop.category] || sop.category,
      related,
    });
  });

  // /process-templates/:slug/download -- serve the authored Markdown as a file.
  app.get<{ Params: { slug: string } }>('/process-templates/:slug/download', async (request, reply) => {
    const slug = request.params.slug;
    if (!/^[a-z0-9-]+$/.test(slug)) return reply.callNotFound();
    const sop = getSopBySlug(slug);
    if (!sop) return reply.callNotFound();
    return reply
      .header('Content-Disposition', `attachment; filename="${slug}.md"`)
      .header('X-Content-Type-Options', 'nosniff')
      .header('Cache-Control', 'public, max-age=3600')
      .type('text/markdown; charset=utf-8')
      .send(sopToMarkdown(sop));
  });
}
