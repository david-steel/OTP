/**
 * integrations-catalog.ts -- the source of truth for which third-party tools OTP
 * can connect, and the read-only feature flag + per-provider enablement.
 *
 * DB-free + side-effect-free on purpose (mirrors schedule-gate-logic.ts): unit
 * tests import this without touching config/database.ts. All env reads are
 * funnelled through small exported helpers so tests can drive them.
 *
 * Connection model (proven 2026-06-13): there is ONE platform OAuth app per
 * provider, registered in Composio as an auth_config. Its id lives in an env var
 * (COMPOSIO_AUTHCFG_<SLUG>), NOT in code or the DB -- so adding a provider is
 * "create the Composio auth_config + set the env var", no deploy of the catalog.
 * A provider is "connectable" only when its auth_config id is present; otherwise
 * it renders as "coming soon". Each ORG then creates its own connection (token)
 * through that one app, isolated by org id. Read-only is enforced at the OAuth
 * scope layer on the auth_config (e.g. spreadsheets.readonly), not here.
 */

export type IntegrationCategory =
  | 'workspace'
  | 'crm'
  | 'finance'
  | 'marketing'
  | 'ops'
  | 'support';

export interface IntegrationProvider {
  /** Composio toolkit slug -- the canonical id used in every Composio call. */
  slug: string;
  name: string;
  category: IntegrationCategory;
  /** One-line description shown on the card. */
  blurb: string;
  /**
   * Composio toolkit slug verified to exist 2026-06-13. Kept explicit so a typo
   * in `slug` is caught against this list in a test rather than at runtime.
   */
  verified: boolean;
}

export const CATEGORY_LABELS: Record<IntegrationCategory, string> = {
  workspace: 'Workspace & Productivity',
  crm: 'CRM & Sales',
  finance: 'Finance',
  marketing: 'Marketing & Ads',
  ops: 'Project & Ops',
  support: 'Scheduling & Support',
};

/**
 * The standard catalog. Every slug here was confirmed present in Composio's live
 * catalog on 2026-06-13 (see project memory). Calendly is intentionally absent
 * (not in Composio -- it surfaces Cal.com instead); it is the Custom-connector
 * case. Add a provider by appending a row + creating its Composio auth_config.
 */
export const INTEGRATION_CATALOG: IntegrationProvider[] = [
  // Workspace
  { slug: 'googlesheets', name: 'Google Sheets', category: 'workspace', blurb: 'Pull KPIs straight from your sheets into the scorecard.', verified: true },
  { slug: 'gmail', name: 'Gmail', category: 'workspace', blurb: 'Give agents email context and let processes draft replies.', verified: true },
  { slug: 'googlecalendar', name: 'Google Calendar', category: 'workspace', blurb: 'Meeting and availability context for scheduling work.', verified: true },
  { slug: 'outlook', name: 'Outlook', category: 'workspace', blurb: 'Microsoft 365 mail and calendar context for agents.', verified: true },
  { slug: 'excel', name: 'Microsoft Excel', category: 'workspace', blurb: 'Read KPIs from Excel Online workbooks.', verified: true },
  { slug: 'slack', name: 'Slack', category: 'workspace', blurb: 'Push standups and agent updates into channels.', verified: true },
  // CRM
  { slug: 'highlevel', name: 'GoHighLevel', category: 'crm', blurb: 'Pipeline value, opportunities, and appointments as live KPIs.', verified: true },
  { slug: 'hubspot', name: 'HubSpot', category: 'crm', blurb: 'Deals, contacts, and pipeline metrics for the scorecard.', verified: true },
  { slug: 'salesforce', name: 'Salesforce', category: 'crm', blurb: 'Opportunity and revenue metrics from your CRM.', verified: true },
  // Finance
  { slug: 'stripe', name: 'Stripe', category: 'finance', blurb: 'MRR, new revenue, and churn straight onto the scorecard.', verified: true },
  { slug: 'quickbooks', name: 'QuickBooks', category: 'finance', blurb: 'Cash, P&L lines, and AR/AP as tracked numbers.', verified: true },
  { slug: 'xero', name: 'Xero', category: 'finance', blurb: 'Accounting KPIs from your Xero ledger.', verified: true },
  // Marketing
  { slug: 'googleads', name: 'Google Ads', category: 'marketing', blurb: 'Spend, leads, and CPL as live performance KPIs.', verified: true },
  { slug: 'metaads', name: 'Meta Ads', category: 'marketing', blurb: 'Facebook and Instagram ad performance metrics.', verified: true },
  { slug: 'google_analytics', name: 'Google Analytics (GA4)', category: 'marketing', blurb: 'Traffic and conversion KPIs from GA4.', verified: true },
  // Ops
  { slug: 'notion', name: 'Notion', category: 'ops', blurb: 'Pull structured data from Notion databases.', verified: true },
  { slug: 'asana', name: 'Asana', category: 'ops', blurb: 'Project and task throughput as KPIs.', verified: true },
  // Support
  { slug: 'zendesk', name: 'Zendesk', category: 'support', blurb: 'Ticket volume and resolution-time metrics.', verified: true },
];

/** Look up a catalog provider by slug. Null when unknown. */
export function providerBySlug(slug: string): IntegrationProvider | null {
  return INTEGRATION_CATALOG.find((p) => p.slug === slug) || null;
}

/**
 * Master kill switch. The whole Integrations surface (page sections + API
 * writes) stays inert until this is truthy, so the branch can ship while the
 * live page keeps showing "Coming soon". Mirrors AGENT_SCHEDULER_ENABLED.
 */
export function integrationsEnabled(env: Record<string, string | undefined> = process.env): boolean {
  const v = env.INTEGRATIONS_ENABLED;
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
}

/**
 * The Composio auth_config id for a provider, read from COMPOSIO_AUTHCFG_<SLUG>.
 * Empty/absent => the provider is not yet connectable (shown as coming soon).
 * The id is the ONLY per-provider config; the client_id/secret live in Composio.
 */
export function authConfigIdFor(slug: string, env: Record<string, string | undefined> = process.env): string | null {
  const key = `COMPOSIO_AUTHCFG_${slug.toUpperCase()}`;
  const v = (env[key] || '').trim();
  return v.length > 0 ? v : null;
}

/** A provider is connectable when the flag is on AND its auth_config exists. */
export function isConnectable(slug: string, env: Record<string, string | undefined> = process.env): boolean {
  return integrationsEnabled(env) && authConfigIdFor(slug, env) !== null;
}

export interface CatalogView {
  provider: IntegrationProvider;
  connectable: boolean;
}

/** The catalog annotated with per-provider connectability, grouped for the page. */
export function catalogView(env: Record<string, string | undefined> = process.env): CatalogView[] {
  return INTEGRATION_CATALOG.map((provider) => ({
    provider,
    connectable: isConnectable(provider.slug, env),
  }));
}
