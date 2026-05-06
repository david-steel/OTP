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
 *   - No tool use. The agent's "tools" + "mcps" entries are passed as
 *     descriptive context only. Real MCP wiring is Stage 3.
 *   - Output is a plain string (Claude's text response).
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

const DEFAULT_MODEL = process.env.OTP_AGENT_MODEL || 'claude-opus-4-5';
const DEFAULT_MAX_TOKENS = 4096;

export interface RunAgentOptions {
  orgId: string;
  externalId: string;
  promptOverride?: string | null;
  triggeredByUserId?: string | null;
  scheduleId?: string | null;
  trigger?: 'manual' | 'scheduled' | 'webhook' | 'api';
}

export interface RunAgentResult {
  runId: string;
  status: 'succeeded' | 'failed';
  output: string | null;
  error: string | null;
  tokensInput: number | null;
  tokensOutput: number | null;
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

export async function runAgent(opts: RunAgentOptions): Promise<RunAgentResult> {
  const startedAt = new Date();
  const trigger = opts.trigger || 'manual';

  // Insert a queued row up front so even crashes leave a record.
  const [queuedRow] = await db.execute(sql`
    INSERT INTO agent_runs (org_id, agent_external_id, schedule_id, trigger, prompt, status, started_at, triggered_by_user_id)
    VALUES (
      ${opts.orgId},
      ${opts.externalId},
      ${opts.scheduleId || null},
      ${trigger},
      ${opts.promptOverride || null},
      'running',
      ${startedAt},
      ${opts.triggeredByUserId || null}
    )
    RETURNING id
  `).then(r => r.rows as { id: string }[]);
  const runId = queuedRow.id;

  // Resolve the agent's chart node so we can build the system prompt.
  let systemPrompt = `You are agent ${opts.externalId}.`;
  let agentLabel = opts.externalId;
  try {
    const graph = await getOrgTeamGraph(opts.orgId, '');
    const node = graph.nodes.find(n => n.externalId === opts.externalId && n.type === 'agent');
    if (node) {
      agentLabel = node.label;
      systemPrompt = buildSystemPrompt(node);
    }
  } catch { /* fall back to generic prompt */ }

  const userPrompt = opts.promptOverride && opts.promptOverride.trim().length > 0
    ? opts.promptOverride.trim()
    : `Run your standard work for now. Summarize what you would do, what data you would touch, and what output you would produce. Treat this as a dry-run unless explicitly told otherwise.`;

  if (!process.env.ANTHROPIC_API_KEY) {
    const completedAt = new Date();
    await db.execute(sql`
      UPDATE agent_runs
      SET status = 'failed',
          error = 'ANTHROPIC_API_KEY env var is not set on the server',
          completed_at = ${completedAt}
      WHERE id = ${runId}
    `);
    return {
      runId,
      status: 'failed',
      output: null,
      error: 'ANTHROPIC_API_KEY env var is not set on the server',
      tokensInput: null,
      tokensOutput: null,
      model: DEFAULT_MODEL,
      startedAt,
      completedAt,
    };
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const response = await client.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: DEFAULT_MAX_TOKENS,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const completedAt = new Date();
    const textContent = response.content
      .filter((c: any) => c.type === 'text')
      .map((c: any) => c.text)
      .join('\n');
    const tokensInput = response.usage?.input_tokens ?? null;
    const tokensOutput = response.usage?.output_tokens ?? null;

    await db.execute(sql`
      UPDATE agent_runs
      SET status = 'succeeded',
          output = ${textContent},
          model = ${response.model || DEFAULT_MODEL},
          tokens_input = ${tokensInput},
          tokens_output = ${tokensOutput},
          completed_at = ${completedAt}
      WHERE id = ${runId}
    `);

    return {
      runId,
      status: 'succeeded',
      output: textContent,
      error: null,
      tokensInput,
      tokensOutput,
      model: response.model || DEFAULT_MODEL,
      startedAt,
      completedAt,
    };
  } catch (e: any) {
    const completedAt = new Date();
    const errMsg = e?.message || String(e);
    await db.execute(sql`
      UPDATE agent_runs
      SET status = 'failed',
          error = ${errMsg},
          model = ${DEFAULT_MODEL},
          completed_at = ${completedAt}
      WHERE id = ${runId}
    `);
    return {
      runId,
      status: 'failed',
      output: null,
      error: errMsg,
      tokensInput: null,
      tokensOutput: null,
      model: DEFAULT_MODEL,
      startedAt,
      completedAt,
    };
  }
}

export async function listAgentRuns(orgId: string, externalId: string, limit = 25) {
  const result = await db.execute(sql`
    SELECT id, agent_external_id, schedule_id, trigger, prompt, output, model,
           tokens_input, tokens_output, status, error,
           started_at, completed_at, triggered_by_user_id, created_at
    FROM agent_runs
    WHERE org_id = ${orgId} AND agent_external_id = ${externalId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `);
  return result.rows;
}
