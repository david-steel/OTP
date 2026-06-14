/**
 * composio-tools.ts -- exposes an org's connected Composio tools to the agent
 * runtime as Anthropic-format tools, and executes a tool call.
 *
 * Inc 3. Strictly additive + gated: getOrgTools returns [] (so the runtime is
 * byte-identical to pre-Inc-3) unless ALL of: AGENT_TOOLS_ENABLED is on, the
 * Composio key is configured, and the org has >=1 ACTIVE connection. Tool
 * EXECUTION spends tokens (multi-turn) and is metered by the runtime through the
 * existing wallet path -- this module only resolves + runs tools.
 *
 * Read-only by default: our connections are scoped read-only at the OAuth layer
 * (e.g. spreadsheets.readonly), and we additionally filter out write-shaped tool
 * slugs here so the model isn't handed tools that would fail at the provider and
 * so we don't bloat the prompt. user_id == orgId (matches the Inc 1 connect route).
 */
import { db } from '../config/database.js';
import { sql } from 'drizzle-orm';
import { composioConfigured } from './composio.js';
import { canRunLive } from './integration-live-gate.js';
import { agentToolsEnabled, buildReadTools, type AnthropicTool } from './composio-tools-logic.js';

export { agentToolsEnabled } from './composio-tools-logic.js';
export type { AnthropicTool } from './composio-tools-logic.js';

const BASE = 'https://backend.composio.dev/api/v3';
const MAX_TOOLS_PER_PROVIDER = 12;
const MAX_TOOLS_TOTAL = 32;

export interface OrgToolset {
  tools: AnthropicTool[];
  /** tool name -> the provider it belongs to (for logging / future per-tool gates). */
  providerByTool: Map<string, string>;
}

const EMPTY: OrgToolset = { tools: [], providerByTool: new Map() };

function key(): string {
  return (process.env.COMPOSIO_API_KEY || '').trim();
}

async function composioGet(path: string): Promise<any> {
  const res = await fetch(`${BASE}${path}`, { headers: { 'x-api-key': key() } });
  if (!res.ok) throw new Error(`Composio GET ${path} -> ${res.status}`);
  return res.json();
}

async function fetchReadToolsFor(providerSlug: string): Promise<AnthropicTool[]> {
  const j = await composioGet(`/tools?toolkit_slug=${encodeURIComponent(providerSlug)}&limit=100`);
  return buildReadTools(j?.items || j?.data || [], MAX_TOOLS_PER_PROVIDER);
}

/**
 * Resolve the read-only tools available to an org from its ACTIVE connections.
 * Returns EMPTY (no tools) whenever the feature is off, Composio is unconfigured,
 * the org has no active connections, or any lookup fails -- the runtime then
 * behaves exactly as it did before Inc 3. Never throws.
 */
export async function getOrgTools(orgId: string): Promise<OrgToolset> {
  if (!agentToolsEnabled() || !composioConfigured()) return EMPTY;
  // Money-safety: no tools => no execution unless billing is live AND the wallet
  // is above the floor. The SAME live gate the KPI fetch uses.
  if (!(await canRunLive(orgId)).ok) return EMPTY;
  try {
    const rows = (await db.execute(sql`
      SELECT DISTINCT provider FROM integration_connections
      WHERE org_id = ${orgId} AND status = 'active'
    `)).rows as Array<{ provider: string }>;
    if (!rows.length) return EMPTY;

    const tools: AnthropicTool[] = [];
    const providerByTool = new Map<string, string>();
    for (const { provider } of rows) {
      if (tools.length >= MAX_TOOLS_TOTAL) break;
      let provTools: AnthropicTool[] = [];
      try {
        provTools = await fetchReadToolsFor(provider);
      } catch {
        continue; // a bad provider fetch must not kill the whole run
      }
      for (const t of provTools) {
        if (tools.length >= MAX_TOOLS_TOTAL) break;
        if (providerByTool.has(t.name)) continue;
        tools.push(t);
        providerByTool.set(t.name, provider);
      }
    }
    return { tools, providerByTool };
  } catch {
    return EMPTY;
  }
}

export interface ToolExecResult {
  successful: boolean;
  data?: unknown;
  error?: string;
}

/**
 * Execute one tool call for an org (user_id == orgId). Read-only by scope. Never
 * throws -- returns {successful:false, error} so the loop can feed the failure
 * back to the model as a tool_result rather than aborting the whole run.
 */
export async function executeOrgTool(orgId: string, toolName: string, input: unknown): Promise<ToolExecResult> {
  try {
    const res = await fetch(`${BASE}/tools/execute/${encodeURIComponent(toolName)}`, {
      method: 'POST',
      headers: { 'x-api-key': key(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: orgId, arguments: input || {} }),
    });
    const j: any = await res.json().catch(() => ({}));
    if (!res.ok) return { successful: false, error: `HTTP ${res.status}` };
    if (j?.successful === false) return { successful: false, error: String(j?.error || 'tool failed').slice(0, 300) };
    return { successful: true, data: j?.data };
  } catch (e) {
    return { successful: false, error: e instanceof Error ? e.message : 'execute failed' };
  }
}
