// Unit tests for the Process Library SOP barrel. DB-free by design: the
// sop-templates barrel + its category files import nothing that reaches
// config/database.ts, so this never touches DATABASE_URL.
import { describe, it, expect } from 'vitest';
import {
  SOP_TEMPLATES,
  SOP_CATEGORY_LABELS,
  SOP_CATEGORY_ORDER,
  SOP_TEMPLATE_GROUPS,
  getSopBySlug,
  sopSearchIndex,
} from './sop-templates.js';

describe('SOP_TEMPLATES', () => {
  it('has a solid initial set (>= 50 SOPs)', () => {
    expect(SOP_TEMPLATES.length).toBeGreaterThanOrEqual(50);
  });

  it('every slug is unique and matches the public-url charset', () => {
    const slugs = SOP_TEMPLATES.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9-]+$/);
  });

  it('every id is unique', () => {
    const ids = SOP_TEMPLATES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every SOP has a title, a known category, and at least one step', () => {
    for (const s of SOP_TEMPLATES) {
      expect(s.title.length).toBeGreaterThan(0);
      expect(SOP_CATEGORY_ORDER).toContain(s.category);
      expect(Array.isArray(s.steps)).toBe(true);
      expect(s.steps.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('every SOP carries the runtime fields (trigger + outputs + tools + keywords)', () => {
    for (const s of SOP_TEMPLATES) {
      expect(s.trigger.length).toBeGreaterThan(0);
      expect(s.outputs.length).toBeGreaterThanOrEqual(1);
      expect(s.tools.length).toBeGreaterThanOrEqual(1);
      expect(s.keywords.length).toBeGreaterThanOrEqual(1);
      expect(s.description.length).toBeGreaterThan(0);
      expect(s.whenToUse.length).toBeGreaterThan(0);
    }
  });
});

describe('getSopBySlug', () => {
  it('round-trips every SOP by slug', () => {
    for (const s of SOP_TEMPLATES) {
      expect(getSopBySlug(s.slug)).toBe(s);
    }
  });

  it('returns undefined for an unknown slug', () => {
    expect(getSopBySlug('not-a-real-slug')).toBeUndefined();
    expect(getSopBySlug('')).toBeUndefined();
  });
});

describe('sopSearchIndex', () => {
  it('covers every SOP, one slim entry each', () => {
    const index = sopSearchIndex();
    expect(index.length).toBe(SOP_TEMPLATES.length);
    const indexSlugs = new Set(index.map((e) => e.slug));
    for (const s of SOP_TEMPLATES) expect(indexSlugs.has(s.slug)).toBe(true);
  });

  it('search blob is lowercased and includes the title', () => {
    for (const e of sopSearchIndex()) {
      expect(e.search).toBe(e.search.toLowerCase());
      expect(e.search).toContain(e.title.toLowerCase());
      expect(e.stepCount).toBeGreaterThanOrEqual(1);
    }
  });
});

describe('categories', () => {
  it('every category in SOP_CATEGORY_ORDER has a label and at least one SOP', () => {
    for (const cat of SOP_CATEGORY_ORDER) {
      expect(SOP_CATEGORY_LABELS[cat]).toBeTruthy();
      const inCat = SOP_TEMPLATES.filter((s) => s.category === cat);
      expect(inCat.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('has a sensible breadth of categories (8-10)', () => {
    expect(SOP_CATEGORY_ORDER.length).toBeGreaterThanOrEqual(8);
    expect(SOP_CATEGORY_ORDER.length).toBeLessThanOrEqual(10);
  });
});

describe('SOP_TEMPLATE_GROUPS back-compat (consumed by /processes + /dashboard/team)', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(SOP_TEMPLATE_GROUPS)).toBe(true);
    expect(SOP_TEMPLATE_GROUPS.length).toBeGreaterThan(0);
  });

  it('every group has roleId + a non-empty templates array of { title, ... }', () => {
    for (const g of SOP_TEMPLATE_GROUPS) {
      expect(typeof g.roleId).toBe('string');
      expect(g.roleId.length).toBeGreaterThan(0);
      expect(typeof g.role).toBe('string');
      expect(Array.isArray(g.templates)).toBe(true);
      expect(g.templates.length).toBeGreaterThanOrEqual(1);
      for (const t of g.templates) {
        // The picker's applyTemplate() reads title/trigger/steps/outputs/tools/notes.
        expect(typeof t.id).toBe('string');
        expect(typeof t.title).toBe('string');
        expect(t.title.length).toBeGreaterThan(0);
      }
    }
  });

  it('preserves every library SOP as exactly one picker template', () => {
    const groupTemplateCount = SOP_TEMPLATE_GROUPS.reduce((n, g) => n + g.templates.length, 0);
    expect(groupTemplateCount).toBe(SOP_TEMPLATES.length);
  });
});
