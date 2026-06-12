// Render harnesses for the help-center work: guide.ejs on both dual-render
// paths, blog.ejs's search wiring, and the main-layout Help panel input.
// All DB-free -- templates are rendered/compiled directly with ejs, no
// Fastify, no DATABASE_URL.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import ejs from 'ejs';
import { GUIDE_SECTIONS } from '../data/guide-content.js';

const VIEWS = fileURLToPath(new URL('.', import.meta.url));
const GUIDE = `${VIEWS}pages/guide.ejs`;
const BLOG = `${VIEWS}pages/blog.ejs`;
const MAIN = `${VIEWS}layouts/main.ejs`;
const V7 = `${VIEWS}layouts/v7.ejs`;

const baseLocals = {
  title: 'OrgTP User Guide - OTP',
  description: 'desc',
  canonical: 'https://orgtp.com/guide',
  breadcrumbs: [{ name: 'Home', url: 'https://orgtp.com/' }, { name: 'User Guide', url: 'https://orgtp.com/guide' }],
  guideSections: GUIDE_SECTIONS,
};

describe('guide.ejs (help center)', () => {
  it('renders the v7 signed-out compose (page body + v7 layout)', async () => {
    // Mirrors renderV7 in routes/pages/_shared.ts.
    const ctx = { clerkPubKey: '', clerkInstance: '', assetVersion: 'test', ...baseLocals };
    const body = await ejs.renderFile(GUIDE, ctx);
    const html = await ejs.renderFile(V7, { ...ctx, body });
    expect(html).toContain('OrgTP User Guide');
    expect(html).toContain('id="gd-search"');
    // signed-out path keeps the v7 nav-clearing padding (no in-shell trim)
    expect(body).not.toContain('style="padding-top:56px;"');
  });

  it('renders the authed in-shell body with the nav-pad trim and TOC sidebar', async () => {
    const body = await ejs.renderFile(GUIDE, { ...baseLocals, authUserId: 'user_test' });
    // in-shell trim marker (main layout already clears the fixed nav)
    expect(body).toContain('style="padding-top:56px;"');
    // sticky TOC sidebar with one link per section
    expect(body).toContain('gd-toc');
    for (const s of GUIDE_SECTIONS) {
      expect(body).toContain(`href="#${s.id}"`);
      expect(body).toContain(`id="${s.id}"`);
    }
  });

  it('renders every section body and the search/highlight/?q machinery', async () => {
    const body = await ejs.renderFile(GUIDE, { ...baseLocals, authUserId: 'user_test' });
    // section content actually lands on the page (search is client-side)
    expect(body).toContain('The five things you'); // section 1 table intro
    expect(body).toContain('<table>');
    // match-count + clear + deep-link handling
    expect(body).toContain('sections match');
    expect(body).toContain("get('q')");
    // highlighting is text-node based: mark elements created via
    // createElement/textContent, never innerHTML of the query
    expect(body).toContain("document.createElement('mark')");
    expect(body).toContain('createTreeWalker');
    expect(body).not.toMatch(/innerHTML\s*[+]?=/);
  });
});

describe('blog.ejs (index search)', () => {
  const blogLocals = {
    clerkPubKey: '', clerkInstance: '', assetVersion: 'test',
    title: 'Blog - OTP', description: 'd', canonical: 'https://orgtp.com/blog',
    conatusPosts: [{ slug: 'a-post', title: 'A Post', date: '2026-06-01', author: 'Conatus', type: 'essay', filename: 'x.md', description: 'About scorecards.' }],
    founderPosts: [{ slug: 'b-post', title: 'B Post', date: '2026-06-02', author: 'David Steel', type: 'note', filename: 'y.md', description: 'About rocks.' }],
    conatusTotal: 1, founderTotal: 1, showAll: false,
    blogSearchIndex: [
      { slug: 'a-post', title: 'A Post', summary: 'About scorecards.', tags: ['Conatus', 'essay'] },
      // adversarial entry: must not be able to close the script context
      { slug: 'evil', title: '</script><script>alert(1)</script>', summary: 's', tags: [] },
    ],
  };

  it('renders the search box, count element, and ?q deep-link handling', async () => {
    const body = await ejs.renderFile(BLOG, blogLocals);
    expect(body).toContain('id="bs-search"');
    expect(body).toContain('id="bs-count"');
    expect(body).toContain('posts match');
    expect(body).toContain("get('q')");
  });

  it('embeds the search index via jsonForScript (no </script> breakout)', async () => {
    const body = await ejs.renderFile(BLOG, blogLocals);
    expect(body).toContain('var INDEX =');
    // the adversarial title must arrive unicode-escaped, not as a real tag
    expect(body).toContain('\\u003c/script\\u003e');
    const scriptBody = body.slice(body.indexOf('var INDEX ='));
    expect(scriptBody).not.toContain('</script><script>alert(1)');
  });
});

describe('layouts/main.ejs (Help panel)', () => {
  it('compiles and carries the guide search input wired to /guide?q=', () => {
    const src = readFileSync(MAIN, 'utf8');
    // compile-only: executing main.ejs needs the full authed-locals contract,
    // but a parse error (the May 28 class of 500) is caught right here.
    expect(() => ejs.compile(src, { filename: MAIN })).not.toThrow();
    expect(src).toContain('id="otp-help-search"');
    expect(src).toContain('action="/guide"');
    expect(src).toContain('name="q"');
    expect(src).toContain('Search the guide and articles');
  });
});
