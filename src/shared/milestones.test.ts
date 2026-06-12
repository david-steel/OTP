import { describe, it, expect } from 'vitest';
import {
  milestoneDueDateSchema,
  createMilestoneSchema,
  updateMilestoneSchema,
  completeMilestoneSchema,
  localDateString,
  isMilestoneOverdue,
  milestoneProgress,
  nextSortOrder,
} from './milestones.js';

describe('milestoneDueDateSchema', () => {
  it('accepts a normal calendar date', () => {
    expect(milestoneDueDateSchema.safeParse('2026-06-11').success).toBe(true);
  });
  it('accepts leap day on a leap year', () => {
    expect(milestoneDueDateSchema.safeParse('2028-02-29').success).toBe(true);
  });
  it('rejects leap day on a non-leap year', () => {
    expect(milestoneDueDateSchema.safeParse('2026-02-29').success).toBe(false);
  });
  it('rejects impossible month/day values', () => {
    expect(milestoneDueDateSchema.safeParse('2026-13-01').success).toBe(false);
    expect(milestoneDueDateSchema.safeParse('2026-06-40').success).toBe(false);
  });
  it('rejects ISO datetimes and other shapes', () => {
    expect(milestoneDueDateSchema.safeParse('2026-06-11T00:00:00Z').success).toBe(false);
    expect(milestoneDueDateSchema.safeParse('06/11/2026').success).toBe(false);
    expect(milestoneDueDateSchema.safeParse('').success).toBe(false);
  });
});

describe('createMilestoneSchema', () => {
  it('accepts title only', () => {
    expect(createMilestoneSchema.safeParse({ title: 'Ship phase 1' }).success).toBe(true);
  });
  it('accepts title + dueDate', () => {
    expect(createMilestoneSchema.safeParse({ title: 'Ship phase 1', dueDate: '2026-07-01' }).success).toBe(true);
  });
  it('rejects empty title', () => {
    expect(createMilestoneSchema.safeParse({ title: '' }).success).toBe(false);
  });
  it('rejects title over 255 chars', () => {
    expect(createMilestoneSchema.safeParse({ title: 'x'.repeat(256) }).success).toBe(false);
  });
  it('is strict: unknown keys rejected', () => {
    expect(createMilestoneSchema.safeParse({ title: 'ok', rockId: 'sneaky' }).success).toBe(false);
  });
});

describe('updateMilestoneSchema', () => {
  it('accepts a title-only update', () => {
    expect(updateMilestoneSchema.safeParse({ title: 'Renamed' }).success).toBe(true);
  });
  it('accepts dueDate null to clear', () => {
    const r = updateMilestoneSchema.safeParse({ dueDate: null });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.dueDate).toBeNull();
  });
  it('accepts sortOrder', () => {
    expect(updateMilestoneSchema.safeParse({ sortOrder: 3 }).success).toBe(true);
  });
  it('rejects an empty update', () => {
    expect(updateMilestoneSchema.safeParse({}).success).toBe(false);
  });
  it('rejects non-integer / negative sortOrder', () => {
    expect(updateMilestoneSchema.safeParse({ sortOrder: 1.5 }).success).toBe(false);
    expect(updateMilestoneSchema.safeParse({ sortOrder: -1 }).success).toBe(false);
  });
  it('is strict: unknown keys rejected', () => {
    expect(updateMilestoneSchema.safeParse({ title: 'ok', completedAt: 'now' }).success).toBe(false);
  });
});

describe('completeMilestoneSchema', () => {
  it('requires a boolean completed', () => {
    expect(completeMilestoneSchema.safeParse({ completed: true }).success).toBe(true);
    expect(completeMilestoneSchema.safeParse({ completed: false }).success).toBe(true);
    expect(completeMilestoneSchema.safeParse({ completed: 'yes' }).success).toBe(false);
    expect(completeMilestoneSchema.safeParse({}).success).toBe(false);
  });
});

describe('localDateString', () => {
  it('formats as YYYY-MM-DD with zero padding', () => {
    expect(localDateString(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(localDateString(new Date(2026, 11, 31))).toBe('2026-12-31');
  });
});

describe('isMilestoneOverdue', () => {
  const today = '2026-06-11';
  it('true for a past due date, incomplete', () => {
    expect(isMilestoneOverdue({ dueDate: '2026-06-10', completedAt: null }, today)).toBe(true);
  });
  it('false on the due date itself', () => {
    expect(isMilestoneOverdue({ dueDate: '2026-06-11', completedAt: null }, today)).toBe(false);
  });
  it('false for a future due date', () => {
    expect(isMilestoneOverdue({ dueDate: '2026-06-12', completedAt: null }, today)).toBe(false);
  });
  it('false when completed, even if past due', () => {
    expect(isMilestoneOverdue({ dueDate: '2020-01-01', completedAt: new Date() }, today)).toBe(false);
  });
  it('false with no due date', () => {
    expect(isMilestoneOverdue({ dueDate: null, completedAt: null }, today)).toBe(false);
  });
  it('tolerates a Date-typed dueDate from the driver', () => {
    expect(isMilestoneOverdue({ dueDate: new Date(2026, 5, 10) as unknown as string, completedAt: null }, today)).toBe(true);
  });
});

describe('milestoneProgress', () => {
  it('counts done vs total', () => {
    expect(milestoneProgress([
      { dueDate: null, completedAt: new Date() },
      { dueDate: null, completedAt: null },
      { dueDate: null, completedAt: '2026-06-01T00:00:00Z' },
    ])).toEqual({ done: 2, total: 3 });
  });
  it('handles an empty list', () => {
    expect(milestoneProgress([])).toEqual({ done: 0, total: 0 });
  });
});

describe('nextSortOrder', () => {
  it('starts at 0 for an empty rock', () => {
    expect(nextSortOrder(null)).toBe(0);
    expect(nextSortOrder(undefined)).toBe(0);
  });
  it('appends after the current max', () => {
    expect(nextSortOrder(0)).toBe(1);
    expect(nextSortOrder(4)).toBe(5);
  });
  it('never goes negative', () => {
    expect(nextSortOrder(-5)).toBe(0);
  });
});
