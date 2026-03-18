import Fastify from 'fastify';
import fastifyView from '@fastify/view';
import fastifyStatic from '@fastify/static';
import fastifyRateLimit from '@fastify/rate-limit';
import { clerkPlugin } from '@clerk/fastify';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = Fastify({
  logger: true,
});

// Rate limiting
await app.register(fastifyRateLimit, {
  max: 100,
  timeWindow: '1 minute',
});

// Clerk authentication
await app.register(clerkPlugin, {
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
});

// Static files
await app.register(fastifyStatic, {
  root: path.join(__dirname, '..', 'public'),
  prefix: '/public/',
});

// Derive Clerk frontend API domain from publishable key
const clerkPubKey = process.env.CLERK_PUBLISHABLE_KEY || '';
const clerkInstance = clerkPubKey.startsWith('pk_')
  ? Buffer.from(clerkPubKey.split('_').slice(2).join('_'), 'base64').toString().replace(/\$$/, '')
  : '';

// EJS templates
await app.register(fastifyView, {
  engine: { ejs: await import('ejs') },
  root: path.join(__dirname, 'views'),
  layout: 'layouts/main',
  defaultContext: {
    clerkPubKey,
    clerkInstance,
  },
});

// Health check
app.get('/health', async () => {
  return { status: 'ok', version: '0.1.0', phase: 'mvp' };
});

// robots.txt at root
app.get('/robots.txt', async (request, reply) => {
  return reply.sendFile('robots.txt');
});

// llms.txt at root
app.get('/llms.txt', async (request, reply) => {
  return reply.sendFile('llms.txt');
});

// Dynamic sitemap
app.get('/sitemap.xml', async (request, reply) => {
  const { db: database } = await import('./config/database.js');
  const { sql } = await import('drizzle-orm');

  const BASE = 'https://orgtp.com';

  // Static pages
  const staticPages = [
    { loc: '/', priority: '1.0', changefreq: 'daily' },
    { loc: '/browse', priority: '0.9', changefreq: 'daily' },
    { loc: '/search', priority: '0.8', changefreq: 'daily' },
    { loc: '/graph', priority: '0.8', changefreq: 'weekly' },
    { loc: '/guide', priority: '0.7', changefreq: 'monthly' },
    { loc: '/blog', priority: '0.8', changefreq: 'weekly' },
    { loc: '/publish', priority: '0.7', changefreq: 'monthly' },
    { loc: '/investors', priority: '0.5', changefreq: 'monthly' },
    { loc: '/tickets', priority: '0.4', changefreq: 'weekly' },
    { loc: '/blog/why-we-built-otp', priority: '0.7', changefreq: 'monthly' },
    { loc: '/blog/what-is-an-oos', priority: '0.7', changefreq: 'monthly' },
    { loc: '/blog/built-in-48-hours', priority: '0.7', changefreq: 'monthly' },
    { loc: '/blog/nvidia-made-the-case', priority: '0.7', changefreq: 'monthly' },
    { loc: '/blog/bain-code-red', priority: '0.7', changefreq: 'monthly' },
    { loc: '/blog/agentic-levels', priority: '0.7', changefreq: 'monthly' },
  ];

  // Dynamic pages: published OOS files and org profiles
  let dynamicUrls = '';
  try {
    const oosRows = await database.execute(sql`
      SELECT f.id AS oos_id, o.id AS org_id, f.published_at
      FROM oos_files f JOIN organizations o ON f.org_id = o.id
      WHERE f.status = 'published'
      ORDER BY f.published_at DESC
    `) as any;

    const seenOrgs = new Set<string>();
    for (const row of (oosRows.rows || [])) {
      const lastmod = row.published_at ? new Date(row.published_at).toISOString().split('T')[0] : '';
      dynamicUrls += `  <url><loc>${BASE}/oos/${row.oos_id}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}<changefreq>weekly</changefreq><priority>0.6</priority></url>\n`;
      if (!seenOrgs.has(row.org_id)) {
        seenOrgs.add(row.org_id);
        dynamicUrls += `  <url><loc>${BASE}/org/${row.org_id}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}<changefreq>weekly</changefreq><priority>0.5</priority></url>\n`;
      }
    }
  } catch {
    // If DB unavailable, serve static pages only
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(p => `  <url><loc>${BASE}${p.loc}</loc><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`).join('\n')}
${dynamicUrls}</urlset>`;

  reply.header('Content-Type', 'application/xml');
  return reply.send(xml);
});

// ---- API Routes ----
await app.register(import('./routes/api/auth.js'), { prefix: '/api/v1/auth' });
await app.register(import('./routes/api/oos.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/search.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/browse.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/graph.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/merge.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/scanner.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/api-keys.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/recommendations.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/tickets.js'), { prefix: '/api/v1' });

// ---- Page Routes (SSR) ----
await app.register(import('./routes/pages/pages.js'));

// Start server
const port = parseInt(process.env.PORT || '3000', 10);
const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';

try {
  await app.listen({ port, host });
  app.log.info(`OTP Platform running at http://${host}:${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
