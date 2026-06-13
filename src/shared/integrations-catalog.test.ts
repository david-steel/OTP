import { describe, it, expect } from 'vitest';
import {
  INTEGRATION_CATALOG,
  CATEGORY_LABELS,
  providerBySlug,
  integrationsEnabled,
  authConfigIdFor,
  isConnectable,
  catalogView,
} from './integrations-catalog.js';

describe('integrations catalog', () => {
  it('has unique, non-empty slugs and known categories', () => {
    const slugs = INTEGRATION_CATALOG.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const p of INTEGRATION_CATALOG) {
      expect(p.slug).toMatch(/^[a-z0-9_]+$/);
      expect(p.name.length).toBeGreaterThan(0);
      expect(CATEGORY_LABELS[p.category]).toBeTruthy();
    }
  });

  it('includes the verified KPI-bearing providers (GHL slug is "highlevel")', () => {
    const slugs = INTEGRATION_CATALOG.map((p) => p.slug);
    expect(slugs).toContain('highlevel'); // NOT "gohighlevel"
    expect(slugs).toContain('googlesheets');
    expect(slugs).toContain('stripe');
    expect(slugs).not.toContain('calendly'); // not in Composio -> Custom connector
  });

  it('providerBySlug resolves and rejects', () => {
    expect(providerBySlug('googlesheets')?.name).toBe('Google Sheets');
    expect(providerBySlug('nope')).toBeNull();
  });
});

describe('flag + per-provider enablement', () => {
  it('flag is OFF by default and accepts truthy strings', () => {
    expect(integrationsEnabled({})).toBe(false);
    expect(integrationsEnabled({ INTEGRATIONS_ENABLED: 'false' })).toBe(false);
    for (const v of ['1', 'true', 'yes', 'on']) {
      expect(integrationsEnabled({ INTEGRATIONS_ENABLED: v })).toBe(true);
    }
  });

  it('authConfigIdFor reads COMPOSIO_AUTHCFG_<SLUG>', () => {
    expect(authConfigIdFor('googlesheets', {})).toBeNull();
    expect(authConfigIdFor('googlesheets', { COMPOSIO_AUTHCFG_GOOGLESHEETS: 'ac_x' })).toBe('ac_x');
    expect(authConfigIdFor('googlesheets', { COMPOSIO_AUTHCFG_GOOGLESHEETS: '  ' })).toBeNull();
  });

  it('isConnectable requires BOTH flag on AND auth_config present', () => {
    expect(isConnectable('googlesheets', { COMPOSIO_AUTHCFG_GOOGLESHEETS: 'ac_x' })).toBe(false); // flag off
    expect(isConnectable('googlesheets', { INTEGRATIONS_ENABLED: '1' })).toBe(false); // no auth_config
    expect(isConnectable('googlesheets', { INTEGRATIONS_ENABLED: '1', COMPOSIO_AUTHCFG_GOOGLESHEETS: 'ac_x' })).toBe(true);
  });

  it('catalogView marks only configured providers connectable', () => {
    const view = catalogView({ INTEGRATIONS_ENABLED: '1', COMPOSIO_AUTHCFG_GOOGLESHEETS: 'ac_x' });
    const gs = view.find((v) => v.provider.slug === 'googlesheets');
    const stripe = view.find((v) => v.provider.slug === 'stripe');
    expect(gs?.connectable).toBe(true);
    expect(stripe?.connectable).toBe(false);
  });
});
