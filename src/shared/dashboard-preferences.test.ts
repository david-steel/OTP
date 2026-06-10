import { describe, it, expect } from 'vitest';
// DB-free by design: this import chain must never reach config/database.ts
// (which throws at load time without DATABASE_URL). If someone adds a DB
// import to dashboard-preferences.ts, this whole file fails at collection.
import {
  dashboardPreferencesSchema,
  mergeDashboardPreferences,
  type DashboardPreferences,
} from './dashboard-preferences.js';

describe('dashboardPreferencesSchema', () => {
  it('accepts a valid full object', () => {
    const full: DashboardPreferences = {
      hiddenTiles: ['todos', 'kpi-summary'],
      tileOrder: {
        left: ['rocks', 'issues'],
        right: ['scorecard', 'meeting-prep'],
      },
      fontSize: 'lg',
    };
    const result = dashboardPreferencesSchema.safeParse(full);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toEqual(full);
  });

  it('accepts an empty object (everything optional)', () => {
    expect(dashboardPreferencesSchema.safeParse({}).success).toBe(true);
  });

  it('rejects unknown top-level keys (.strict())', () => {
    expect(
      dashboardPreferencesSchema.safeParse({ fontSize: 'sm', theme: 'dark' }).success,
    ).toBe(false);
  });

  it('rejects an uppercase tile id', () => {
    expect(
      dashboardPreferencesSchema.safeParse({ hiddenTiles: ['Todos'] }).success,
    ).toBe(false);
  });

  it('rejects a tile id longer than 40 chars', () => {
    expect(
      dashboardPreferencesSchema.safeParse({ hiddenTiles: ['a'.repeat(41)] }).success,
    ).toBe(false);
    // boundary: exactly 40 is fine
    expect(
      dashboardPreferencesSchema.safeParse({ hiddenTiles: ['a'.repeat(40)] }).success,
    ).toBe(true);
  });

  it('rejects an empty-string tile id', () => {
    expect(
      dashboardPreferencesSchema.safeParse({ hiddenTiles: [''] }).success,
    ).toBe(false);
  });

  it('rejects more than 30 entries in hiddenTiles', () => {
    const ids = Array.from({ length: 31 }, (_, i) => `tile-${i}`);
    expect(
      dashboardPreferencesSchema.safeParse({ hiddenTiles: ids }).success,
    ).toBe(false);
    // boundary: exactly 30 is fine
    expect(
      dashboardPreferencesSchema.safeParse({ hiddenTiles: ids.slice(0, 30) }).success,
    ).toBe(true);
  });

  it('rejects more than 30 entries in a tileOrder column', () => {
    const ids = Array.from({ length: 31 }, (_, i) => `tile-${i}`);
    expect(
      dashboardPreferencesSchema.safeParse({ tileOrder: { left: ids } }).success,
    ).toBe(false);
  });

  it('rejects a bad fontSize', () => {
    expect(dashboardPreferencesSchema.safeParse({ fontSize: 'xl' }).success).toBe(false);
    expect(dashboardPreferencesSchema.safeParse({ fontSize: '' }).success).toBe(false);
  });

  it('accepts tileOrder with only left', () => {
    expect(
      dashboardPreferencesSchema.safeParse({ tileOrder: { left: ['rocks'] } }).success,
    ).toBe(true);
  });

  it('rejects unknown keys inside tileOrder (.strict())', () => {
    expect(
      dashboardPreferencesSchema.safeParse({
        tileOrder: { left: ['rocks'], middle: ['issues'] },
      }).success,
    ).toBe(false);
  });
});

describe('mergeDashboardPreferences', () => {
  it('merges into an empty existing object', () => {
    expect(mergeDashboardPreferences({}, { fontSize: 'sm' })).toEqual({ fontSize: 'sm' });
  });

  it('replaces only the provided keys (existing fontSize survives a tileOrder-only update)', () => {
    const existing = { fontSize: 'lg', hiddenTiles: ['todos'] };
    const merged = mergeDashboardPreferences(existing, {
      tileOrder: { left: ['rocks'] },
    });
    expect(merged).toEqual({
      fontSize: 'lg',
      hiddenTiles: ['todos'],
      tileOrder: { left: ['rocks'] },
    });
  });

  it('does not let explicitly-undefined incoming keys erase existing values', () => {
    const existing = { fontSize: 'lg', hiddenTiles: ['todos'] };
    const merged = mergeDashboardPreferences(existing, {
      fontSize: undefined,
      hiddenTiles: ['kpi-summary'],
    });
    expect(merged).toEqual({ fontSize: 'lg', hiddenTiles: ['kpi-summary'] });
  });

  it('does not mutate the existing object', () => {
    const existing = { fontSize: 'lg' };
    mergeDashboardPreferences(existing, { fontSize: 'sm' });
    expect(existing).toEqual({ fontSize: 'lg' });
  });

  it('treats null existing as empty', () => {
    expect(mergeDashboardPreferences(null, { fontSize: 'base' })).toEqual({
      fontSize: 'base',
    });
  });

  it('treats string existing as empty', () => {
    expect(mergeDashboardPreferences('corrupt', { fontSize: 'base' })).toEqual({
      fontSize: 'base',
    });
  });

  it('treats array existing as empty (does not spread indices)', () => {
    expect(mergeDashboardPreferences(['todos'], { fontSize: 'base' })).toEqual({
      fontSize: 'base',
    });
  });

  it('treats undefined existing as empty', () => {
    expect(mergeDashboardPreferences(undefined, {})).toEqual({});
  });
});
