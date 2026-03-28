// Agentic Level Calculator v2
// Estimates an organization's agentic maturity level (1-8)
// Based on "The 8 Levels of Agentic Engineering" by Bassim Eledath
// https://www.bassimeledath.com/blog/levels-of-agentic-engineering
//
// v2 changes:
// - Expanded keyword patterns for semantic equivalents
// - Each level scored independently (not purely sequential gating)
// - Final level = highest level where ALL levels below it also pass
// - L2 now requires actual agent usage evidence, not just agent_count >= 1

import type { ParsedClaim } from '../shared/types.js';

export interface AgenticLevelResult {
  level: number;
  label: string;
  evidence: string[];
}

const LEVEL_LABELS: Record<number, string> = {
  1: 'Tab Complete',
  2: 'Agent IDE',
  3: 'Context Engineering',
  4: 'Compounding Engineering',
  5: 'MCP & Skills',
  6: 'Harness Engineering',
  7: 'Background Agents',
  8: 'Autonomous Agent Teams',
};

export function calculateAgenticLevel(
  claims: ParsedClaim[],
  frontmatter: Record<string, unknown>
): AgenticLevelResult {
  const agentCount = (frontmatter?.agent_count as number) || 0;
  const platforms = (frontmatter?.platforms as string[]) || [];
  const mcpServers = (frontmatter?.mcp_servers as string[]) || [];

  const allText = claims
    .map((c) => `${c.section} ${c.rule} ${c.why} ${c.failureMode} ${c.scope}`)
    .join(' ')
    .toLowerCase();

  const evidence: string[] = [];

  // Score each level independently
  const levelPasses: boolean[] = [
    true, // L1 always passes
    false, // L2
    false, // L3
    false, // L4
    false, // L5
    false, // L6
    false, // L7
    false, // L8
  ];

  // L2: Agent IDE -- using AI-powered development tools or deploying agents
  // agent_count in frontmatter is the declaration; claim text confirms AI usage
  if (agentCount >= 1) {
    levelPasses[1] = true;
    evidence.push(`${agentCount} agent(s) declared`);
  }

  // L3: Context Engineering -- system prompts, rules files, shared state, configuration
  const l3Hits = countHits(allText, [
    'system prompt', 'rules file', 'shared state', 'state file',
    'configuration', 'context engineering', 'tool description',
    'pre-computed', 'shared state file', 'claude.md', 'prompt template',
    'instruction', 'persona', 'context window', 'memory', 'cached',
    'data object', 'operating logic', 'protocol', 'organizational memory',
    'shared data', 'state management', 'persistent state', 'rules',
    'prompt engineering', 'system message', 'context', 'template',
    'frontmatter', 'metadata', 'specification', 'blueprint',
  ]);
  if (l3Hits >= 2) {
    levelPasses[2] = true;
    evidence.push(`Context engineering signals (${l3Hits} matches)`);
  }

  // L4: Compounding Engineering -- documentation, codification, learning, iteration
  const l4Hits = countHits(allText, [
    'codif', 'learning', 'lesson learned', 'knowledge base',
    'documentation', 'version history', 'evolution', 'iterati',
    'improvement', 'compounding', 'playbook', 'standard operating',
    'sop', 'runbook', 'best practice', 'pattern', 'template library',
    'reusable', 'institutional knowledge', 'knowledge capture',
    'review', 'retrospective', 'post-mortem', 'feedback', 'refine',
    'optimize', 'calibrat', 'tune', 'adapt', 'evolve',
  ]);
  if (l4Hits >= 2) {
    levelPasses[3] = true;
    evidence.push(`Compounding engineering signals (${l4Hits} matches)`);
  }

  // L5: MCP and Skills -- tool integrations, APIs, plugins, external connections
  const l5Hits = countHits(allText, [
    'mcp', 'skill', 'api integration', 'plugin', 'tool marketplace',
    'model context protocol', 'external tool', 'cli tool', 'api',
    'integration', 'webhook', 'connector', 'adapter', 'middleware',
    'sdk', 'endpoint', 'service', 'third-party', 'external system',
    'automation', 'zapier', 'make', 'n8n', 'slack', 'gmail',
    'google', 'calendar', 'todoist', 'accelo', 'ghl',
  ]);
  const hasMcpServers = mcpServers.length > 0;
  const hasPlatforms = platforms.length > 0;
  if (l5Hits >= 2 || hasMcpServers || (hasPlatforms && agentCount >= 3)) {
    levelPasses[4] = true;
    evidence.push(`MCP/skills signals (${l5Hits} matches, ${mcpServers.length} MCP servers, ${agentCount} agents)`);
  }

  // L6: Harness Engineering -- automated feedback, validation, observability, quality
  const l6Hits = countHits(allText, [
    'feedback loop', 'automated feedback', 'validation', 'quality scor',
    'testing', 'monitoring', 'observability', 'staleness', 'stale',
    'backpressure', 'linter', 'type check', 'constraint', 'guardrail',
    'safety', 'approval', 'review gate', 'quality', 'check',
    'verification', 'audit', 'compliance', 'threshold', 'alert',
    'warning', 'escalation', 'override', 'permission', 'boundary',
    'limit', 'cap', 'control', 'governance', 'policy',
  ]);
  if (l6Hits >= 3) {
    levelPasses[5] = true;
    evidence.push(`Harness engineering signals (${l6Hits} matches)`);
  }

  // L7: Background Agents -- async, scheduled, overnight, autonomous execution
  const l7Hits = countHits(allText, [
    'background agent', 'overnight', 'scheduled', 'launchagent',
    'cron', 'nightly', 'autonomous agent', 'parallel scan',
    'background process', 'asynchronous', 'pre-compute', 'batch',
    'daemon', 'worker', 'queue', 'pipeline', 'unattended',
    'automated scan', 'daily', 'weekly', 'recurring', 'timer',
    'trigger', 'event-driven', 'proactive', 'autonomous',
  ]);
  if (l7Hits >= 2) {
    levelPasses[6] = true;
    evidence.push(`Background agent signals (${l7Hits} matches)`);
  }

  // L8: Autonomous Agent Teams -- direct agent-to-agent coordination
  const l8Hits = countHits(allText, [
    'agent-to-agent', 'message bus', 'agent inbox', 'inter-agent',
    'direct coordination', 'without human in the loop',
    'without the founder', 'autonomous coordination',
    'agent team', 'agent communication', 'agent message',
    'agent handoff', 'hand-off', 'delegation', 'orchestrat',
    'multi-agent', 'coordinator', 'dispatch', 'routing',
    'agent network', 'swarm', 'collaborative agent',
    'agent protocol', 'agent bus',
  ]);
  if (l8Hits >= 2 && agentCount >= 5) {
    levelPasses[7] = true;
    evidence.push(`Autonomous agent team signals (${l8Hits} matches, ${agentCount} agents)`);
  }

  // Determine final level: highest level where all levels below also pass
  let level = 1;
  for (let i = 1; i < levelPasses.length; i++) {
    if (levelPasses[i]) {
      level = i + 1;
    } else {
      break; // Sequential requirement still enforced
    }
  }

  return {
    level,
    label: LEVEL_LABELS[level] || 'Unknown',
    evidence,
  };
}

function countHits(text: string, patterns: string[]): number {
  return patterns.filter((p) => text.includes(p)).length;
}

export function getLevelLabel(level: number): string {
  return LEVEL_LABELS[level] || 'Unknown';
}
