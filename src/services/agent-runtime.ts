/**
 * Agent runtime: fires an agent on demand (manual trigger) and logs the
 * run to agent_runs. Pulls the agent's chart context (mission, role,
 * SOPs, slash commands) and feeds it as a system prompt to Anthropic.
 *
 * v1 scope:
 *   - Manual trigger only. Scheduled runs land in a follow-up commit
 *     once the cron tick + scheduling UI ship.
 *   - Single ANTHROPIC_API_KEY env var (the platform's). BYO key per
 *     org is on the roadmap.
 *   - Tool use (Inc 3): when AGENT_TOOLS_ENABLED is on AND the org has active
 *     Composio connections, the run executes a bounded Claude<->tool loop over
 *     the org's read-only connected tools (see composio-tools.ts). Off/unconnected
 *     => zero tools passed => byte-identical single-shot behavior as before.
 *   - Output is a plain string (Claude's final text response).
 *
 * Reads the published OOS chart for the agent's properties, so an agent
 * has to be on the chart before it can run. If the chart entry is in a
 * draft state, the runtime still finds it via getOrgTeamGraph (which
 * prefers draft over published).
 */
import Anthropic from '@anthropic-ai/sdk';
import { db } from '../config/database.js';
import { sql } from 'drizzle-orm';
import { getOrgTeamGraph } from './team-graph.js';
import { getBalanceCents, debitWallet } from './wallet.js';
import { computeDebitCents, markupMultipleFromEnv } from '../shared/ai-pricing.js';
import { getOrgTools, executeOrgTool, type OrgToolset } from './composio-tools.js';
import { walletFloorCents } from './integration-live-gate.js';

// Default to Sonnet -- ~10x cheaper than Opus and plenty capable for the
// agent-runtime use case. Override with OTP_AGENT_MODEL env var per-org.
const DEFAULT_MODEL = process.env.OTP_AGENT_MODEL || 'claude-sonnet-4-6';
const DEFAULT_MAX_TOKENS = 4096;

// Inc 3: max Claude<->tool round-trips before we stop looping. The agent gets
// this many chances to call tools + reason over results before producing final
// text. Bounds both latency and token spend. 6 is plenty for read-only KPI work.
const MAX_TOOL_ITERATIONS = 6;

// Smallest balance we require before starting a metered agent run -- the shared
// wallet floor ($1 by default). A run is refused at/below the floor so the
// balance always keeps a buffer larger than any single run's cost and can never
// go negative. Read at call time (see prepareRun) so the env stays authoritative.

/**
 * One SOP, as authored on a seat (node.properties.sops[i]). When passed to
 * runAgent the runtime builds the user prompt from this instead of the generic
 * dry-run prompt, asking the agent to actually produce the SOP's work-product.
 */
export interface RunAgentSop {
  title: string;
  trigger?: string;
  steps?: string[];
  outputs?: string[];
  tools?: string[];
  notes?: string;
}

export interface RunAgentOptions {
  orgId: string;
  externalId: string;
  promptOverride?: string | null;
  sop?: RunAgentSop | null;
  triggeredByUserId?: string | null;
  scheduleId?: string | null;
  trigger?: 'manual' | 'scheduled' | 'webhook' | 'api';
}

/**
 * Wallet metering is OFF by default. When the env flag is falsy the whole
 * metering path in runAgent is inert: agent runs stay FREE (no balance check,
 * no debit, cost_cents stays null) -- byte-identical to today's behavior.
 * Exported so the gate is unit-testable (mirrors ask-ai.meteringEnabled).
 */
export function meteringEnabled(): boolean {
  const v = process.env.WALLET_METERING_ENABLED;
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
}

/**
 * Pure, DB-free SOP -> user-prompt builder. Given a SOP, produce the user
 * message that asks the agent to execute it NOW and produce its real
 * work-product. Honest framing: the runtime has no live tool access, so where a
 * step needs an external action the agent produces exactly what it WOULD do
 * (the draft / analysis / message), not a real side effect. Handles missing
 * fields (no steps / no outputs / no tools / no trigger / no notes) gracefully.
 * Exported for unit testing.
 */
export function buildSopRunPrompt(sop: RunAgentSop): string {
  const title = (sop?.title || '').trim() || 'Untitled process';
  const steps = Array.isArray(sop?.steps) ? sop.steps.map(s => String(s).trim()).filter(Boolean) : [];
  const outputs = Array.isArray(sop?.outputs) ? sop.outputs.map(s => String(s).trim()).filter(Boolean) : [];
  const tools = Array.isArray(sop?.tools) ? sop.tools.map(s => String(s).trim()).filter(Boolean) : [];
  const trigger = (sop?.trigger || '').trim();
  const notes = (sop?.notes || '').trim();

  const lines: string[] = [];
  lines.push('Execute this Standard Operating Procedure now and produce its real work-product.');
  lines.push('');
  lines.push(`SOP: **${title}**.`);
  if (trigger) lines.push(`Trigger: ${trigger}.`);
  if (steps.length > 0) {
    lines.push('');
    lines.push('Work through these steps in order:');
    steps.forEach((s, i) => lines.push(`${i + 1}) ${s}`));
  }
  if (outputs.length > 0) {
    lines.push('');
    lines.push(`Produce these outputs: ${outputs.join('; ')}.`);
  }
  if (tools.length > 0) {
    lines.push(`Tools you may use: ${tools.join(', ')}.`);
  }
  if (notes) {
    lines.push('');
    lines.push(`Notes: ${notes}`);
  }
  lines.push('');
  lines.push(
    'You do not have live tool access in this runtime, so where a step needs an ' +
    'external action, produce exactly what you WOULD send or do (the draft, the ' +
    'analysis, the message). Finish with the output(s) the SOP calls for.',
  );
  return lines.join('\n');
}

export interface RunAgentResult {
  runId: string;
  status: 'succeeded' | 'failed';
  output: string | null;
  error: string | null;
  tokensInput: number | null;
  tokensOutput: number | null;
  /** Wallet debit for this run in cents. Null when metering is OFF or on failure. */
  costCents?: number | null;
  sopTitle?: string | null;
  model: string;
  startedAt: Date;
  completedAt: Date;
}

/**
 * Build the agent's system prompt from its chart node properties. The
 * goal is to recreate the same context an operator would hand-type when
 * asking "act as <agent name> and do X."
 */
function buildSystemPrompt(node: {
  label: string;
  externalId: string;
  properties: Record<string, unknown>;
}): string {
  const p = node.properties as Record<string, any>;
  const lines: string[] = [];
  lines.push(`You are ${node.label} (${node.externalId}), an AI agent on this organization's chart.`);
  if (p.role) lines.push(`Role: ${String(p.role)}`);
  if (p.mission) lines.push(`Mission: ${String(p.mission)}`);
  if (p.authorityLevel) lines.push(`Authority: ${String(p.authorityLevel)}`);
  if (p.platform) lines.push(`Platform: ${String(p.platform)}`);

  const skills = Array.isArray(p.skills) ? p.skills : (typeof p.skills === 'string' ? p.skills.split(/[,;\n]/).map((s: string) => s.trim()).filter(Boolean) : []);
  if (skills.length > 0) lines.push(`Skills: ${skills.join(', ')}`);

  const tools = Array.isArray(p.tools) ? p.tools : (typeof p.tools === 'string' ? p.tools.split(/[,;\n]/).map((s: string) => s.trim()).filter(Boolean) : []);
  if (tools.length > 0) lines.push(`Tools available: ${tools.join(', ')}`);

  const owns = Array.isArray(p.owns) ? p.owns : (typeof p.owns === 'string' ? p.owns.split(/[,;\n]/).map((s: string) => s.trim()).filter(Boolean) : []);
  if (owns.length > 0) lines.push(`Owns: ${owns.join(', ')}`);

  const sops = Array.isArray(p.sops) ? p.sops : [];
  if (sops.length > 0) {
    lines.push('');
    lines.push('Standard Operating Procedures:');
    for (const sop of sops as any[]) {
      if (sop?.title) lines.push(`- ${sop.title}${sop.trigger ? ` (trigger: ${sop.trigger})` : ''}`);
      if (Array.isArray(sop?.steps)) {
        for (const step of sop.steps) lines.push(`    * ${String(step)}`);
      }
    }
  }

  if (p.runtimeBody) {
    lines.push('');
    lines.push('Runtime instructions (from CLAUDE.md / agent definition):');
    lines.push(String(p.runtimeBody));
  }

  return lines.join('\n');
}

/**
 * Build the user prompt for a run. A SOP run produces the SOP's real
 * work-product; an explicit promptOverride takes priority; otherwise a generic
 * dry-run. Pure -- shared by runAgent + runAgentStream so both paths build the
 * IDENTICAL prompt.
 */
function buildUserPrompt(opts: RunAgentOptions): string {
  if (opts.sop && opts.sop.title) return buildSopRunPrompt(opts.sop);
  if (opts.promptOverride && opts.promptOverride.trim().length > 0) return opts.promptOverride.trim();
  return `Run your standard work for now. Summarize what you would do, what data you would touch, and what output you would produce. Treat this as a dry-run unless explicitly told otherwise.`;
}

/**
 * Shared run lifecycle setup: build prompts, insert the queued/running
 * agent_runs row, run the metering pre-check, resolve the system prompt, and
 * verify the ANTHROPIC key. Returns either a `ready` shape (caller proceeds to
 * call Claude) or a `failed` shape (caller returns the failed RunAgentResult
 * WITHOUT calling Claude). The agent_runs row is already written to its terminal
 * 'failed' state in the failed case. Used by BOTH runAgent (non-streaming) and
 * runAgentStream so the agent_runs lifecycle + metering are identical.
 */
async function prepareRun(opts: RunAgentOptions, startedAt: Date): Promise<
  | { ready: true; runId: string; systemPrompt: string; userPrompt: string; sopTitle: string | null; metering: boolean }
  | { ready: false; result: RunAgentResult }
> {
  const trigger = opts.trigger || 'manual';
  const sopTitle = opts.sop?.title ? String(opts.sop.title).trim() : null;
  const metering = meteringEnabled();
  const userPrompt = buildUserPrompt(opts);

  // Insert a queued/running row up front so even crashes leave a record.
  const [queuedRow] = await db.execute(sql`
    INSERT INTO agent_runs (org_id, agent_external_id, schedule_id, trigger, prompt, sop_title, status, started_at, triggered_by_user_id)
    VALUES (
      ${opts.orgId},
      ${opts.externalId},
      ${opts.scheduleId || null},
      ${trigger},
      ${opts.promptOverride || (opts.sop ? userPrompt : null)},
      ${sopTitle},
      'running',
      ${startedAt},
      ${opts.triggeredByUserId || null}
    )
    RETURNING id
  `).then(r => r.rows as { id: string }[]);
  const runId = queuedRow.id;

  const failWith = async (error: string): Promise<{ ready: false; result: RunAgentResult }> => {
    const completedAt = new Date();
    await db.execute(sql`
      UPDATE agent_runs
      SET status = 'failed', error = ${error}, completed_at = ${completedAt}
      WHERE id = ${runId}
    `);
    return {
      ready: false,
      result: {
        runId, status: 'failed', output: null, error,
        tokensInput: null, tokensOutput: null, costCents: null, sopTitle,
        model: DEFAULT_MODEL, startedAt, completedAt,
      },
    };
  };

  // --- Wallet metering pre-check (GATED). When metering is OFF this block is a
  // no-op and runs stay free. When ON, fail closed BEFORE spending any tokens if
  // the org's balance is below the floor -- never stream what you can't bill.
  if (metering) {
    const balanceCents = await getBalanceCents(opts.orgId);
    if (balanceCents <= walletFloorCents()) {
      return failWith('INSUFFICIENT_BALANCE');
    }
  }

  // Resolve the agent's chart node so we can build the system prompt.
  let systemPrompt = `You are agent ${opts.externalId}.`;
  try {
    const graph = await getOrgTeamGraph(opts.orgId, '');
    const node = graph.nodes.find(n => n.externalId === opts.externalId && n.type === 'agent');
    if (node) systemPrompt = buildSystemPrompt(node);
  } catch { /* fall back to generic prompt */ }

  if (!process.env.ANTHROPIC_API_KEY) {
    return failWith('ANTHROPIC_API_KEY env var is not set on the server');
  }

  return { ready: true, runId, systemPrompt, userPrompt, sopTitle, metering };
}

/**
 * Post-run wallet debit (GATED, success-only). Shared by both run paths. When
 * metering is OFF this returns null (runs free, cost_cents stays null). When ON,
 * debit actual cost x markup; a debit failure AFTER a served run logs loudly but
 * does NOT throw (the user was served), idempotency-keyed per run so a retry
 * can't double-charge. Returns the cost in cents (or null).
 */
async function debitRun(opts: RunAgentOptions, runId: string, runModel: string, tokensInput: number | null, tokensOutput: number | null, sopTitle: string | null): Promise<number | null> {
  let costCents: number | null = null;
  try {
    costCents = computeDebitCents(
      { model: runModel, inputTokens: tokensInput ?? 0, outputTokens: tokensOutput ?? 0 },
      markupMultipleFromEnv(),
    );
    const result = await debitWallet(opts.orgId, costCents, 'ai_usage', {
      idempotencyKey: `agent-run_${runId}`,
      metadata: { feature: 'agent-run', agentExternalId: opts.externalId, sopTitle, tokensInput, tokensOutput, model: runModel },
      createdBy: 'agent-run',
    });
    if (!result.ok) {
      // eslint-disable-next-line no-console
      console.error('[agent-runtime] post-run wallet debit failed (user already served)', { orgId: opts.orgId, runId, costCents, code: result.code });
    }
  } catch (debitErr) {
    // eslint-disable-next-line no-console
    console.error('[agent-runtime] post-run wallet debit threw (user already served)', { orgId: opts.orgId, runId, err: debitErr });
  }
  return costCents;
}

interface ToolLoopResult {
  output: string;
  tokensInput: number;
  tokensOutput: number;
  model: string;
  toolCalls: number;
}

/**
 * The Claude<->tool round-trip loop (Inc 3). Runs up to MAX_TOOL_ITERATIONS
 * turns: call Claude, and while it asks for tools, execute them (read-only, via
 * Composio) and feed the results back, until it produces final text. Token usage
 * is SUMMED across every turn so the caller debits the whole run once.
 *
 * When `toolset.tools` is empty (the default: feature off, no Composio, or no
 * active connections) the loop makes exactly ONE Claude call with NO tools param
 * -- byte-identical to the pre-Inc-3 single-shot behavior. So this is safe to put
 * on the hot path unconditionally; tools only ever engage when explicitly armed.
 */
async function runToolLoop(
  client: Anthropic,
  systemPrompt: string,
  userPrompt: string,
  toolset: OrgToolset,
  orgId: string,
): Promise<ToolLoopResult> {
  const hasTools = toolset.tools.length > 0;
  const messages: any[] = [{ role: 'user', content: userPrompt }];
  let tokensInput = 0;
  let tokensOutput = 0;
  let model = DEFAULT_MODEL;
  let toolCalls = 0;
  let finalText = '';

  for (let iter = 0; iter < MAX_TOOL_ITERATIONS; iter++) {
    const response = await client.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: DEFAULT_MAX_TOKENS,
      system: systemPrompt,
      messages,
      ...(hasTools ? { tools: toolset.tools as any } : {}),
    });
    tokensInput += response.usage?.input_tokens ?? 0;
    tokensOutput += response.usage?.output_tokens ?? 0;
    model = response.model || model;

    const textPart = response.content
      .filter((c: any) => c.type === 'text')
      .map((c: any) => c.text)
      .join('\n');
    if (textPart) finalText = textPart;

    if (response.stop_reason !== 'tool_use') break;

    const toolUses = response.content.filter((c: any) => c.type === 'tool_use');
    if (!toolUses.length) break;

    // Echo the assistant's tool-call turn back, then answer each tool_use.
    messages.push({ role: 'assistant', content: response.content });
    const toolResults: any[] = [];
    for (const tu of toolUses as any[]) {
      toolCalls++;
      const result = await executeOrgTool(orgId, tu.name, tu.input);
      toolResults.push({
        type: 'tool_result',
        tool_use_id: tu.id,
        content: JSON.stringify(result).slice(0, 8000),
        ...(result.successful ? {} : { is_error: true }),
      });
    }
    messages.push({ role: 'user', content: toolResults });
  }

  if (!finalText) finalText = '(no text output -- tool iteration limit reached)';
  return { output: finalText, tokensInput, tokensOutput, model, toolCalls };
}

export async function runAgent(opts: RunAgentOptions): Promise<RunAgentResult> {
  const startedAt = new Date();
  const prep = await prepareRun(opts, startedAt);
  if (!prep.ready) return prep.result;
  const { runId, systemPrompt, userPrompt, sopTitle, metering } = prep;

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    // Inc 3: resolve the org's read-only tools (empty unless armed + connected),
    // then run the bounded tool loop. With no tools this is one Claude call.
    const toolset = await getOrgTools(opts.orgId);
    const loop = await runToolLoop(client, systemPrompt, userPrompt, toolset, opts.orgId);

    const completedAt = new Date();
    const textContent = loop.output;
    const tokensInput = loop.tokensInput;
    const tokensOutput = loop.tokensOutput;
    const runModel = loop.model;

    const costCents = metering ? await debitRun(opts, runId, runModel, tokensInput, tokensOutput, sopTitle) : null;

    await db.execute(sql`
      UPDATE agent_runs
      SET status = 'succeeded',
          output = ${textContent},
          model = ${runModel},
          tokens_input = ${tokensInput},
          tokens_output = ${tokensOutput},
          cost_cents = ${costCents},
          completed_at = ${completedAt}
      WHERE id = ${runId}
    `);

    return {
      runId, status: 'succeeded', output: textContent, error: null,
      tokensInput, tokensOutput, costCents, sopTitle,
      model: runModel, startedAt, completedAt,
    };
  } catch (e: any) {
    const completedAt = new Date();
    const errMsg = e?.message || String(e);
    await db.execute(sql`
      UPDATE agent_runs
      SET status = 'failed', error = ${errMsg}, model = ${DEFAULT_MODEL}, completed_at = ${completedAt}
      WHERE id = ${runId}
    `);
    return {
      runId, status: 'failed', output: null, error: errMsg,
      tokensInput: null, tokensOutput: null, costCents: null, sopTitle,
      model: DEFAULT_MODEL, startedAt, completedAt,
    };
  }
}

/**
 * Streaming sibling of runAgent. Builds the SAME system+user prompt, writes the
 * SAME agent_runs lifecycle (running -> succeeded/failed), and runs the SAME
 * gated metering pre-check + post-run debit -- the ONLY difference is it streams
 * Claude's text via `onDelta(text)` per delta so the caller can pipe each chunk
 * out over SSE. Resolves with the final RunAgentResult (so the route can emit a
 * final event). Never throws for an API/stream error: it marks the row failed
 * and returns a failed result, mirroring runAgent's contract.
 *
 * The metering pre-check runs in prepareRun BEFORE Claude is called, so an
 * insufficient-balance org gets a failed result without a single streamed token.
 */
export async function runAgentStream(
  opts: RunAgentOptions,
  onDelta: (text: string) => void,
): Promise<RunAgentResult> {
  const startedAt = new Date();
  const prep = await prepareRun(opts, startedAt);
  if (!prep.ready) return prep.result;
  const { runId, systemPrompt, userPrompt, sopTitle, metering } = prep;

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    // Inc 3: if the org has armed, connected tools, run the (non-streaming) tool
    // loop and emit the final text in one delta. Tool round-trips don't interleave
    // cleanly with token streaming, so we trade live streaming for real tool use
    // ONLY when tools are present. The common no-tools path streams as before.
    const toolset = await getOrgTools(opts.orgId);
    if (toolset.tools.length > 0) {
      const loop = await runToolLoop(client, systemPrompt, userPrompt, toolset, opts.orgId);
      try { onDelta(loop.output); } catch { /* consumer (SSE socket) gone */ }
      const completedAt = new Date();
      const costCents = metering ? await debitRun(opts, runId, loop.model, loop.tokensInput, loop.tokensOutput, sopTitle) : null;
      await db.execute(sql`
        UPDATE agent_runs
        SET status = 'succeeded', output = ${loop.output}, model = ${loop.model},
            tokens_input = ${loop.tokensInput}, tokens_output = ${loop.tokensOutput},
            cost_cents = ${costCents}, completed_at = ${completedAt}
        WHERE id = ${runId}
      `);
      return {
        runId, status: 'succeeded', output: loop.output, error: null,
        tokensInput: loop.tokensInput, tokensOutput: loop.tokensOutput, costCents, sopTitle,
        model: loop.model, startedAt, completedAt,
      };
    }

    const stream = client.messages.stream({
      model: DEFAULT_MODEL,
      max_tokens: DEFAULT_MAX_TOKENS,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    let textContent = '';
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        const text = event.delta.text;
        textContent += text;
        try { onDelta(text); } catch { /* consumer (SSE socket) gone; keep accumulating for the DB row */ }
      }
    }

    const final = await stream.finalMessage();
    const completedAt = new Date();
    // Prefer the final message's assembled text; fall back to our accumulation.
    const finalText = Array.isArray(final?.content)
      ? final.content.filter((c: any) => c.type === 'text').map((c: any) => c.text).join('\n')
      : textContent;
    const output = finalText || textContent;
    const tokensInput = final?.usage?.input_tokens ?? null;
    const tokensOutput = final?.usage?.output_tokens ?? null;
    const runModel = final?.model || DEFAULT_MODEL;

    const costCents = metering ? await debitRun(opts, runId, runModel, tokensInput, tokensOutput, sopTitle) : null;

    await db.execute(sql`
      UPDATE agent_runs
      SET status = 'succeeded',
          output = ${output},
          model = ${runModel},
          tokens_input = ${tokensInput},
          tokens_output = ${tokensOutput},
          cost_cents = ${costCents},
          completed_at = ${completedAt}
      WHERE id = ${runId}
    `);

    return {
      runId, status: 'succeeded', output, error: null,
      tokensInput, tokensOutput, costCents, sopTitle,
      model: runModel, startedAt, completedAt,
    };
  } catch (e: any) {
    const completedAt = new Date();
    const errMsg = e?.message || String(e);
    await db.execute(sql`
      UPDATE agent_runs
      SET status = 'failed', error = ${errMsg}, model = ${DEFAULT_MODEL}, completed_at = ${completedAt}
      WHERE id = ${runId}
    `);
    return {
      runId, status: 'failed', output: null, error: errMsg,
      tokensInput: null, tokensOutput: null, costCents: null, sopTitle,
      model: DEFAULT_MODEL, startedAt, completedAt,
    };
  }
}

export async function listAgentRuns(orgId: string, externalId: string, limit = 25) {
  const result = await db.execute(sql`
    SELECT id, agent_external_id, schedule_id, trigger, prompt, output, model,
           tokens_input, tokens_output, sop_title, cost_cents, status, error,
           started_at, completed_at, triggered_by_user_id, created_at
    FROM agent_runs
    WHERE org_id = ${orgId} AND agent_external_id = ${externalId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `);
  return result.rows;
}
