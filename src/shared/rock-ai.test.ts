// Pure unit tests for the Rock AI assist module (DB-free).
import { describe, it, expect } from 'vitest';
import {
  rockAiDraftRequestSchema,
  rockAiDraftResponseSchema,
  rockAiCritiqueResponseSchema,
  buildDraftSystemPrompt,
  buildCritiqueSystemPrompt,
  buildDraftUserMessage,
  buildCritiqueUserMessage,
  extractJson,
} from './rock-ai.js';

describe('rock-ai prompt builders', () => {
  it('draft + critique system prompts are non-empty and distinct', () => {
    const d = buildDraftSystemPrompt();
    const c = buildCritiqueSystemPrompt();
    expect(d.length).toBeGreaterThan(200);
    expect(c.length).toBeGreaterThan(200);
    expect(d).not.toBe(c);
  });

  it('system prompts are byte-stable across calls (prompt-cache prefix)', () => {
    expect(buildDraftSystemPrompt()).toBe(buildDraftSystemPrompt());
    expect(buildCritiqueSystemPrompt()).toBe(buildCritiqueSystemPrompt());
  });

  it('draft prompt teaches the SMART framework + gold example', () => {
    const d = buildDraftSystemPrompt();
    for (const f of ['specific', 'measurable', 'attainable', 'relevant', 'timeFramed', 'finishLine']) {
      expect(d).toContain(f);
    }
    expect(d).toContain('GOLD EXAMPLE');
    expect(d).toMatch(/JSON/);
  });

  it('buildDraftUserMessage includes the sentence and optional context', () => {
    const m1 = buildDraftUserMessage({ sentence: 'Lift close rate to 20% by Q3' });
    expect(m1).toContain('Lift close rate to 20% by Q3');
    const m2 = buildDraftUserMessage({ sentence: 'Lift close rate', context: 'B2B SaaS, 5 reps' });
    expect(m2).toContain('B2B SaaS, 5 reps');
  });

  it('buildCritiqueUserMessage serializes the stored rock fields', () => {
    const m = buildCritiqueUserMessage({
      description: 'Grow revenue',
      smartData: { measurable: '12% -> 20%', finishLine: 'dashboard reads 20%' },
    });
    expect(m).toContain('Grow revenue');
    expect(m).toContain('12% -> 20%');
    expect(m).toContain('dashboard reads 20%');
  });

  it('buildCritiqueUserMessage tolerates null/empty inputs', () => {
    const m = buildCritiqueUserMessage({ description: null, smartData: null });
    expect(typeof m).toBe('string');
    expect(m.length).toBeGreaterThan(0);
  });
});

describe('rockAiDraftRequestSchema', () => {
  it('accepts a valid sentence', () => {
    expect(rockAiDraftRequestSchema.safeParse({ sentence: 'Ship the thing by Q3' }).success).toBe(true);
  });
  it('accepts sentence + context', () => {
    const r = rockAiDraftRequestSchema.safeParse({ sentence: 'Ship the thing by Q3', context: 'small team' });
    expect(r.success).toBe(true);
  });
  it('rejects too-short sentence (< 8 chars)', () => {
    expect(rockAiDraftRequestSchema.safeParse({ sentence: 'short' }).success).toBe(false);
  });
  it('rejects too-long sentence (> 500 chars)', () => {
    expect(rockAiDraftRequestSchema.safeParse({ sentence: 'x'.repeat(501) }).success).toBe(false);
  });
  it('rejects unknown keys (strict)', () => {
    expect(rockAiDraftRequestSchema.safeParse({ sentence: 'valid sentence here', evil: 1 }).success).toBe(false);
  });
  it('rejects missing sentence', () => {
    expect(rockAiDraftRequestSchema.safeParse({}).success).toBe(false);
  });
});

const VALID_DRAFT = {
  title: 'Lift close rate to 20% by Q3',
  description: 'Raise close rate from 12% to 20% this quarter.',
  specific: 'Increase qualified-lead to closed-won rate from 12% to 20%.',
  measurable: 'Baseline 12%, target 20% by Sept 30, tracked weekly.',
  attainable: 'Lead volume stable; gain comes from process not headcount.',
  relevant: 'Revenue growth is the #1 annual goal.',
  timeFramed: 'Checklist wk2, script wk5, sequence wk8, final Sept 30.',
  finishLine: 'Trailing-4-week close rate reads 20%+ on Sept 30.',
  milestones: [
    { title: 'Qualification checklist live', dueDate: '2026-07-14' },
    { title: 'Discovery script in use' },
  ],
};

describe('rockAiDraftResponseSchema', () => {
  it('accepts a valid full draft', () => {
    expect(rockAiDraftResponseSchema.safeParse(VALID_DRAFT).success).toBe(true);
  });
  it('defaults milestones to [] when omitted', () => {
    const { milestones, ...noMs } = VALID_DRAFT;
    void milestones;
    const r = rockAiDraftResponseSchema.safeParse(noMs);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.milestones).toEqual([]);
  });
  it('rejects a missing required SMART field (specific)', () => {
    const { specific, ...bad } = VALID_DRAFT;
    void specific;
    expect(rockAiDraftResponseSchema.safeParse(bad).success).toBe(false);
  });
  it('rejects a too-short title', () => {
    expect(rockAiDraftResponseSchema.safeParse({ ...VALID_DRAFT, title: 'ab' }).success).toBe(false);
  });
  it('rejects a wrong type (measurable as number)', () => {
    expect(rockAiDraftResponseSchema.safeParse({ ...VALID_DRAFT, measurable: 42 }).success).toBe(false);
  });
  it('rejects a milestone with a malformed dueDate', () => {
    const bad = { ...VALID_DRAFT, milestones: [{ title: 'X', dueDate: 'July 4th' }] };
    expect(rockAiDraftResponseSchema.safeParse(bad).success).toBe(false);
  });
  it('rejects unknown top-level keys (strict / injection guard)', () => {
    expect(rockAiDraftResponseSchema.safeParse({ ...VALID_DRAFT, evil: 'x' }).success).toBe(false);
  });
});

const VALID_CRITIQUE = {
  critiques: [
    { field: 'measurable', severity: 'weak', issue: 'No number given.', suggestion: 'Add a baseline and target.' },
    { field: 'finishLine', severity: 'missing', issue: 'No finish line.', suggestion: 'Describe the done state.' },
    { field: 'specific', severity: 'ok', issue: 'Clear and concrete.', suggestion: 'Keep it.' },
  ],
  overall: 'Tighten the Measurable and add a finish line.',
};

describe('rockAiCritiqueResponseSchema', () => {
  it('accepts a valid critique', () => {
    expect(rockAiCritiqueResponseSchema.safeParse(VALID_CRITIQUE).success).toBe(true);
  });
  it('rejects an invalid severity', () => {
    const bad = { ...VALID_CRITIQUE, critiques: [{ field: 'measurable', severity: 'terrible', issue: 'x', suggestion: 'y' }] };
    expect(rockAiCritiqueResponseSchema.safeParse(bad).success).toBe(false);
  });
  it('rejects an invalid field name', () => {
    const bad = { ...VALID_CRITIQUE, critiques: [{ field: 'vibes', severity: 'weak', issue: 'x', suggestion: 'y' }] };
    expect(rockAiCritiqueResponseSchema.safeParse(bad).success).toBe(false);
  });
  it('rejects a missing overall', () => {
    const { overall, ...bad } = VALID_CRITIQUE;
    void overall;
    expect(rockAiCritiqueResponseSchema.safeParse(bad).success).toBe(false);
  });
  it('rejects unknown keys (strict)', () => {
    expect(rockAiCritiqueResponseSchema.safeParse({ ...VALID_CRITIQUE, evil: 1 }).success).toBe(false);
  });
});

describe('extractJson', () => {
  it('parses clean JSON', () => {
    expect(extractJson('{"a":1}')).toEqual({ a: 1 });
  });
  it('extracts a JSON object wrapped in prose / fences', () => {
    expect(extractJson('Here you go:\n```json\n{"a":2}\n```\nThanks!')).toEqual({ a: 2 });
  });
  it('returns null for non-JSON', () => {
    expect(extractJson('no json here')).toBeNull();
  });
  it('returns null for empty input', () => {
    expect(extractJson('')).toBeNull();
  });
});
