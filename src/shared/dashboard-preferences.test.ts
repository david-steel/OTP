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
      sidebarCollapsed: true,
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
    expect(dashboardPreferencesSchema.safeParse({ fontSize: 'huge' }).success).toBe(false);
    expect(dashboardPreferencesSchema.safeParse({ fontSize: '' }).success).toBe(false);
  });

  it('accepts the extended font sizes xl / xxl / xxxl', () => {
    for (const fontSize of ['xl', 'xxl', 'xxxl']) {
      expect(dashboardPreferencesSchema.safeParse({ fontSize }).success).toBe(true);
    }
  });

  it('accepts sidebarCollapsed true and false', () => {
    expect(dashboardPreferencesSchema.safeParse({ sidebarCollapsed: true }).success).toBe(true);
    expect(dashboardPreferencesSchema.safeParse({ sidebarCollapsed: false }).success).toBe(true);
  });

  it('rejects non-boolean sidebarCollapsed', () => {
    expect(dashboardPreferencesSchema.safeParse({ sidebarCollapsed: 'true' }).success).toBe(false);
    expect(dashboardPreferencesSchema.safeParse({ sidebarCollapsed: 1 }).success).toBe(false);
    expect(dashboardPreferencesSchema.safeParse({ sidebarCollapsed: null }).success).toBe(false);
  });

  it('still rejects unknown keys alongside sidebarCollapsed (.strict())', () => {
    expect(
      dashboardPreferencesSchema.safeParse({ sidebarCollapsed: true, sidebarWidth: 230 }).success,
    ).toBe(false);
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

  describe('layout (row-based layout engine)', () => {
    it('accepts every pattern with a matching cell count', () => {
      const layout = [
        { pattern: '12', cells: [['cascading']] },
        { pattern: '4-8', cells: [['meetings', 'headlines'], ['todos']] },
        { pattern: '8-4', cells: [['kpis'], ['rocks']] },
        { pattern: '6-6', cells: [['issues'], ['agents']] },
        { pattern: '4-4-4', cells: [['insights'], [], ['todos']] },
      ];
      const result = dashboardPreferencesSchema.safeParse({ layout });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.layout).toEqual(layout);
    });

    it('accepts the default layout shape (reproduces today\'s dashboard)', () => {
      expect(dashboardPreferencesSchema.safeParse({
        layout: [
          { pattern: '4-8', cells: [['meetings', 'headlines', 'rocks'], ['todos', 'kpis', 'issues']] },
          { pattern: '4-8', cells: [['agents'], ['insights']] },
          { pattern: '12', cells: [['cascading']] },
        ],
      }).success).toBe(true);
    });

    it('rejects a cell count that does not match the pattern', () => {
      // '4-8' is two columns; one cell is too few, three is too many.
      expect(dashboardPreferencesSchema.safeParse({
        layout: [{ pattern: '4-8', cells: [['meetings']] }],
      }).success).toBe(false);
      expect(dashboardPreferencesSchema.safeParse({
        layout: [{ pattern: '4-8', cells: [['a'], ['b'], ['c']] }],
      }).success).toBe(false);
      // '12' is one column; two cells is too many.
      expect(dashboardPreferencesSchema.safeParse({
        layout: [{ pattern: '12', cells: [['a'], ['b']] }],
      }).success).toBe(false);
      // '4-4-4' is three columns; two cells is too few.
      expect(dashboardPreferencesSchema.safeParse({
        layout: [{ pattern: '4-4-4', cells: [['a'], ['b']] }],
      }).success).toBe(false);
    });

    it('rejects more than 8 rows', () => {
      const row = { pattern: '12', cells: [['todos']] };
      expect(dashboardPreferencesSchema.safeParse({
        layout: Array.from({ length: 9 }, () => row),
      }).success).toBe(false);
      // boundary: exactly 8 is fine
      expect(dashboardPreferencesSchema.safeParse({
        layout: Array.from({ length: 8 }, () => row),
      }).success).toBe(true);
    });

    it('rejects a bad pattern', () => {
      expect(dashboardPreferencesSchema.safeParse({
        layout: [{ pattern: '3-9', cells: [['a'], ['b']] }],
      }).success).toBe(false);
      expect(dashboardPreferencesSchema.safeParse({
        layout: [{ pattern: '', cells: [[]] }],
      }).success).toBe(false);
    });

    it('rejects a bad tile id inside a cell', () => {
      expect(dashboardPreferencesSchema.safeParse({
        layout: [{ pattern: '12', cells: [['Bad_Tile']] }],
      }).success).toBe(false);
      expect(dashboardPreferencesSchema.safeParse({
        layout: [{ pattern: '12', cells: [['a'.repeat(41)]] }],
      }).success).toBe(false);
    });

    it('rejects more than 30 tile ids in one cell', () => {
      const ids = Array.from({ length: 31 }, (_, i) => `tile-${i}`);
      expect(dashboardPreferencesSchema.safeParse({
        layout: [{ pattern: '12', cells: [ids] }],
      }).success).toBe(false);
    });

    it('rejects unknown keys inside a layout row (.strict())', () => {
      expect(dashboardPreferencesSchema.safeParse({
        layout: [{ pattern: '12', cells: [['todos']], gap: 4 }],
      }).success).toBe(false);
    });

    it('legacy body without layout is still valid', () => {
      expect(dashboardPreferencesSchema.safeParse({
        hiddenTiles: ['headlines'],
        tileOrder: { left: ['rocks', 'meetings'], right: ['issues'] },
        fontSize: 'lg',
      }).success).toBe(true);
    });
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

  it('merges layout without disturbing sibling keys (and vice versa)', () => {
    const layout = [{ pattern: '6-6', cells: [['meetings'], ['todos']] }];
    // layout arrives, existing fontSize/hiddenTiles survive
    expect(mergeDashboardPreferences(
      { fontSize: 'xxl', hiddenTiles: ['headlines'] },
      { layout } as DashboardPreferences,
    )).toEqual({ fontSize: 'xxl', hiddenTiles: ['headlines'], layout });
    // fontSize arrives, existing layout survives
    expect(mergeDashboardPreferences(
      { layout },
      { fontSize: 'xl' },
    )).toEqual({ layout, fontSize: 'xl' });
  });

  it('merges sidebarCollapsed without disturbing other keys', () => {
    const existing = { fontSize: 'lg', hiddenTiles: ['todos'] };
    expect(mergeDashboardPreferences(existing, { sidebarCollapsed: true })).toEqual({
      fontSize: 'lg',
      hiddenTiles: ['todos'],
      sidebarCollapsed: true,
    });
    // ...and false overwrites true (falsy values are still applied).
    expect(mergeDashboardPreferences({ sidebarCollapsed: true }, { sidebarCollapsed: false })).toEqual({
      sidebarCollapsed: false,
    });
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
