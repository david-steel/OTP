import { describe, it, expect } from 'vitest';
import {
  isWriteShapedSlug,
  agentToolsEnabled,
  toInputSchema,
  buildReadTools,
} from './composio-tools-logic.js';

describe('agentToolsEnabled', () => {
  it('is OFF by default, ON for truthy strings', () => {
    expect(agentToolsEnabled({})).toBe(false);
    expect(agentToolsEnabled({ AGENT_TOOLS_ENABLED: 'false' })).toBe(false);
    for (const v of ['1', 'true', 'yes', 'on']) {
      expect(agentToolsEnabled({ AGENT_TOOLS_ENABLED: v })).toBe(true);
    }
  });
});

describe('isWriteShapedSlug', () => {
  it('flags write/mutation tools', () => {
    for (const s of [
      'GOOGLESHEETS_ADD_SHEET', 'GOOGLESHEETS_BATCH_UPDATE', 'GMAIL_SEND_EMAIL',
      'GOOGLESHEETS_CLEAR_VALUES', 'HIGHLEVEL_CREATE_CONTACT', 'GOOGLESHEETS_DELETE_DIMENSION',
      'SHEETS_UPDATE_ROW', 'DRIVE_MOVE_FILE',
    ]) {
      expect(isWriteShapedSlug(s)).toBe(true);
    }
  });

  it('allows read tools', () => {
    for (const s of [
      'GOOGLESHEETS_BATCH_GET', 'GOOGLESHEETS_GET_SHEET_NAMES', 'GOOGLESHEETS_SEARCH_SPREADSHEETS',
      'GMAIL_FETCH_EMAILS', 'HIGHLEVEL_LIST_CONTACTS', 'GOOGLESHEETS_LOOKUP_SPREADSHEET_ROW',
    ]) {
      expect(isWriteShapedSlug(s)).toBe(false);
    }
  });
});

describe('toInputSchema', () => {
  it('passes through an object schema', () => {
    const s = { type: 'object', properties: { a: { type: 'string' } }, required: ['a'] };
    expect(toInputSchema(s)).toBe(s);
  });
  it('coerces non-object/garbage to an empty object schema', () => {
    expect(toInputSchema(null)).toEqual({ type: 'object', properties: {} });
    expect(toInputSchema({ type: 'array' })).toEqual({ type: 'object', properties: {} });
    expect(toInputSchema('nope')).toEqual({ type: 'object', properties: {} });
  });
});

describe('buildReadTools', () => {
  const items = [
    { slug: 'X_BATCH_GET', description: 'read', input_parameters: { type: 'object', properties: {} } },
    { slug: 'X_ADD_SHEET', description: 'write', input_parameters: { type: 'object', properties: {} } },
    { slug: 'X_GET_INFO', human_description: 'info', input_parameters: { type: 'object', properties: {} } },
    { slug: 'X_DEPRECATED_GET', is_deprecated: true, input_parameters: { type: 'object' } },
    { description: 'no slug' },
  ];

  it('keeps only read, non-deprecated, slugged tools and maps them', () => {
    const out = buildReadTools(items, 10);
    expect(out.map((t) => t.name)).toEqual(['X_BATCH_GET', 'X_GET_INFO']);
    expect(out[0]).toMatchObject({ name: 'X_BATCH_GET', description: 'read' });
    expect(out[0].input_schema).toEqual({ type: 'object', properties: {} });
    // falls back to human_description when description absent
    expect(out[1].description).toBe('info');
  });

  it('caps the count and tolerates junk input', () => {
    expect(buildReadTools(items, 1).map((t) => t.name)).toEqual(['X_BATCH_GET']);
    expect(buildReadTools(null as any, 10)).toEqual([]);
    expect(buildReadTools([], 10)).toEqual([]);
  });
});
