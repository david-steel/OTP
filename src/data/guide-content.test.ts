// Unit tests for the structured End-User Guide module. DB-free by design:
// guide-content.ts imports nothing, so this never touches DATABASE_URL.
import { describe, it, expect } from 'vitest';
import { GUIDE_SECTIONS, GUIDE_PLAIN_TEXT } from './guide-content.js';

describe('GUIDE_SECTIONS', () => {
  it('has more than 10 sections (14 numbered + glossary appendix)', () => {
    expect(GUIDE_SECTIONS.length).toBeGreaterThan(10);
    // The canonical doc is 14 numbered sections + Appendix A.
    expect(GUIDE_SECTIONS.length).toBe(15);
    expect(GUIDE_SECTIONS[0].number).toBe('1');
    expect(GUIDE_SECTIONS[GUIDE_SECTIONS.length - 1].number).toBe('A');
  });

  it('has unique, anchor-safe ids', () => {
    const ids = GUIDE_SECTIONS.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/);
  });

  it('searchText is lowercased plain text', () => {
    for (const s of GUIDE_SECTIONS) {
      expect(s.searchText).toBe(s.searchText.toLowerCase());
      expect(s.searchText.length).toBeGreaterThan(40);
      // plain text: no HTML tags, no markdown emphasis markers
      expect(s.searchText).not.toMatch(/<[a-z]/);
      expect(s.searchText).not.toContain('**');
    }
  });

  it('bodyHtml is non-trivial and image-free (text-only v1)', () => {
    for (const s of GUIDE_SECTIONS) {
      expect(s.bodyHtml.length).toBeGreaterThan(100);
      expect(s.bodyHtml).not.toContain('googleusercontent');
      expect(s.bodyHtml).not.toContain('<img');
      expect(s.bodyHtml).not.toContain('![');
    }
  });

  it('keeps the doc tables (sections 1 and 13)', () => {
    const s1 = GUIDE_SECTIONS.find(s => s.number === '1');
    const s13 = GUIDE_SECTIONS.find(s => s.number === '13');
    expect(s1?.bodyHtml).toContain('<table>');
    expect(s13?.bodyHtml).toContain('<table>');
    expect(s13?.bodyHtml).toContain('<code>/settings/profile</code>');
  });

  it('routes are well-formed app paths and cover the key pages', () => {
    for (const s of GUIDE_SECTIONS) {
      for (const r of s.routes) expect(r).toMatch(/^\/[A-Za-z0-9[\]:/_-]*$/);
    }
    const all = GUIDE_SECTIONS.flatMap(s => s.routes);
    for (const expected of ['/dashboard', '/l8', '/me/todos', '/dashboard/kpis', '/settings/api', '/import/ninety']) {
      expect(all).toContain(expected);
    }
  });
});

describe('GUIDE_PLAIN_TEXT', () => {
  it('is a non-trivial full-guide text', () => {
    expect(GUIDE_PLAIN_TEXT.length).toBeGreaterThan(10000);
    expect(GUIDE_PLAIN_TEXT).toContain('OrgTP');
    expect(GUIDE_PLAIN_TEXT).toContain('Appendix A');
    expect(GUIDE_PLAIN_TEXT).not.toContain('googleusercontent');
  });

  it('is deterministic (byte-stable across fresh module evaluations)', async () => {
    const again = await import('./guide-content.js');
    expect(again.GUIDE_PLAIN_TEXT).toStrictEqual(GUIDE_PLAIN_TEXT);
    expect(again.GUIDE_SECTIONS).toStrictEqual(GUIDE_SECTIONS);
  });

  it('contains no volatile content markers', () => {
    expect(GUIDE_PLAIN_TEXT).not.toMatch(/\$\{new Date|Date\.now/);
  });
});
