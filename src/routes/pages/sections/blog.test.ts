// Integration tests for the blog section -- the first real tests in the OTP
// codebase. These exist to catch the four regressions that have actually
// shipped to prod in the last 60 days: registry drift, broken templates,
// crashing render paths, and silent 404 fallbacks.
import { describe, it, expect, beforeAll } from 'vitest';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import Fastify, { type FastifyInstance } from 'fastify';
import blogRoutes, { listHardcodedBlogPosts } from './blog.js';

const VIEWS_DIR = fileURLToPath(new URL('../../../views/pages', import.meta.url));

async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });
  await app.register(blogRoutes);
  return app;
}

describe('blog registry', () => {
  it('has no duplicate slugs', () => {
    const slugs = listHardcodedBlogPosts().map(p => p.slug);
    const unique = new Set(slugs);
    expect(unique.size).toBe(slugs.length);
  });

  it('every template file exists on disk', () => {
    const missing = listHardcodedBlogPosts()
      .map(p => p.template)
      .filter(t => !existsSync(`${VIEWS_DIR}/${t}.ejs`));
    expect(missing).toEqual([]);
  });
});

describe('blog routes', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  it('renders a hardcoded post (regression: silent template breakage)', async () => {
    const res = await app.inject({ method: 'GET', url: '/blog/why-we-built-otp' });
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/html/);
    // H1 from blog-post-1.ejs -- if the template ever silently renames or
    // breaks, this assertion fails before prod sees it.
    expect(res.body).toContain('The Hard Problem in AI');
    // BlogPosting JSON-LD must be emitted; the May 21 signup-500 class of
    // failure was a missing field on a critical page.
    expect(res.body).toContain('"@type":"BlogPosting"');
  });

  it('returns 404 for unknown blog slugs', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/blog/this-slug-deliberately-does-not-exist-xyz',
    });
    expect(res.statusCode).toBe(404);
  });

  it('emits the custom Article schema for the dark-matter post', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/blog/the-weight-is-wrong-without-it',
    });
    expect(res.statusCode).toBe(200);
    // Dark-matter post is Claude-authored and uses an Article schema rather
    // than the default BlogPosting; if the registry's customJsonLd path ever
    // breaks, this asserts before we ship a wrong-attribution page.
    expect(res.body).toContain('"@type":"Article"');
    expect(res.body).toContain('"name":"Claude"');
  });
});
