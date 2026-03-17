// Agentic Level Calculator
// Estimates an organization's agentic maturity level (1-8)
// Based on "The 8 Levels of Agentic Engineering" by Bassim Eledath
// https://www.bassimeledath.com/blog/levels-of-agentic-engineering
//
// L1: Tab Complete
// L2: Agent IDE
// L3: Context Engineering
// L4: Compounding Engineering
// L5: MCP and Skills
// L6: Harness Engineering & Automated Feedback Loops
// L7: Background Agents
// L8: Autonomous Agent Teams

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
  const allText = claims
    .map((c) => `${c.rule} ${c.why} ${c.failureMode} ${c.scope}`)
    .join(' ')
    .toLowerCase();

  const evidence: string[] = [];
  let level = 1;

  // L2: Using AI assistants / AI IDE
  if (agentCount >= 1) {
    level = 2;
    evidence.push(`${agentCount} AI agent(s) in production`);
  }

  // L3: Context Engineering - system prompts, rules files, shared state
  const l3Hits = countHits(allText, [
    'system prompt', 'rules file', 'shared state', 'state file',
    'configuration', 'context engineering', 'tool description',
    'pre-computed', 'shared state file',
  ]);
  if (l3Hits >= 2) {
    level = 3;
    evidence.push(`Context engineering signals (${l3Hits} matches)`);
  }

  // L4: Compounding Engineering - documentation, codification, learning loops
  const l4Hits = countHits(allText, [
    'codif', 'learning', 'lesson learned', 'knowledge base',
    'documentation', 'version history', 'evolution', 'iterati',
    'improvement', 'compounding',
  ]);
  if (l4Hits >= 2 && level >= 3) {
    level = 4;
    evidence.push(`Compounding engineering signals (${l4Hits} matches)`);
  }

  // L5: MCP and Skills - tool integrations, APIs, plugins
  const l5Hits = countHits(allText, [
    'mcp', 'skill', 'api integration', 'plugin', 'tool marketplace',
    'model context protocol', 'external tool', 'cli tool',
  ]);
  if ((l5Hits >= 1 || agentCount >= 3) && level >= 4) {
    level = 5;
    evidence.push(`MCP/skills signals (${l5Hits} matches, ${agentCount} agents)`);
  }

  // L6: Harness Engineering - automated feedback, validation, observability
  const l6Hits = countHits(allText, [
    'feedback loop', 'automated feedback', 'validation', 'quality scor',
    'testing', 'monitoring', 'observability', 'staleness', 'stale',
    'backpressure', 'linter', 'type check', 'constraint',
  ]);
  if (l6Hits >= 2 && level >= 5) {
    level = 6;
    evidence.push(`Harness engineering signals (${l6Hits} matches)`);
  }

  // L7: Background Agents - async, scheduled, overnight
  const l7Hits = countHits(allText, [
    'background agent', 'overnight', 'scheduled', 'launchagent',
    'cron', 'nightly', 'autonomous agent', 'parallel scan',
    'background process', 'asynchronous', 'pre-compute',
  ]);
  if (l7Hits >= 2 && level >= 6) {
    level = 7;
    evidence.push(`Background agent signals (${l7Hits} matches)`);
  }

  // L8: Autonomous Agent Teams - direct agent coordination
  const l8Hits = countHits(allText, [
    'agent-to-agent', 'message bus', 'agent inbox', 'inter-agent',
    'direct coordination', 'without human in the loop',
    'without the founder', 'autonomous coordination',
    'agent team', 'agent communication',
  ]);
  if (l8Hits >= 2 && agentCount >= 5 && level >= 7) {
    level = 8;
    evidence.push(`Autonomous agent team signals (${l8Hits} matches)`);
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
