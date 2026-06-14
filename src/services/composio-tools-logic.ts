/**
 * composio-tools-logic.ts -- PURE, DB-free helpers for the Composio tool layer.
 *
 * Split out from composio-tools.ts (which imports config/database.ts and so
 * can't be imported by unit tests -- it throws at load without DATABASE_URL).
 * See feedback_otp_pure_logic_needs_db_free_module. Everything here is
 * side-effect-free and unit-tested.
 */

export interface AnthropicTool {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

// Slugs matching a write/mutation shape are excluded from an org's toolset.
// Read-only OAuth scope already blocks writes at the provider; this keeps them
// out of the prompt too (less token bloat, no dead tools the model can call).
const WRITE_SHAPED =
  /(^|_)(ADD|CREATE|UPDATE|DELETE|CLEAR|APPEND|INSERT|REMOVE|WRITE|SET|MOVE|COPY|DUPLICATE|SEND|BATCH_UPDATE|RENAME|REPLACE|UPLOAD|ARCHIVE|MERGE|TRASH)(_|$)/i;

/** True if a tool slug looks like a write/mutation -- excluded from the toolset. */
export function isWriteShapedSlug(slug: string): boolean {
  return WRITE_SHAPED.test(slug);
}

/** Master arming flag for tool EXECUTION. Off by default -> zero tools exposed. */
export function agentToolsEnabled(env: Record<string, string | undefined> = process.env): boolean {
  const v = env.AGENT_TOOLS_ENABLED;
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
}

/** Anthropic requires input_schema to be an object schema. Coerce defensively. */
export function toInputSchema(raw: unknown): Record<string, unknown> {
  if (raw && typeof raw === 'object' && (raw as any).type === 'object') {
    return raw as Record<string, unknown>;
  }
  return { type: 'object', properties: {} };
}

/**
 * Turn raw Composio /tools items into read-only Anthropic tools: drop deprecated
 * + write-shaped + slug-less items, cap the count, and map to {name, description,
 * input_schema}. Pure -- the network fetch lives in composio-tools.ts.
 */
export function buildReadTools(items: any[], maxPerProvider: number): AnthropicTool[] {
  return (Array.isArray(items) ? items : [])
    .filter((t) => t?.slug && !t.is_deprecated && !isWriteShapedSlug(t.slug))
    .slice(0, maxPerProvider)
    .map((t) => ({
      name: String(t.slug),
      description: String(t.description || t.human_description || t.name || t.slug).slice(0, 1000),
      input_schema: toInputSchema(t.input_parameters),
    }));
}
