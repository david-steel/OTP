// Foundation Score -- instant critical-fixes triage on upload
// Surfaces the structural issues that need fixing RIGHT NOW
// before the deeper coordination analysis kicks in.
//
// Not nuanced best practices -- red flags. The stuff that's obviously broken.

import type { FoundationCheck, FoundationScoreResult } from '../shared/types.js';

interface FoundationInput {
  text: string;
  agentCount: number;
  hasWorkflows: boolean;
  hasOversight: boolean;
  hasEscalation: boolean;
}

export function calculateFoundationScore(text: string): FoundationScoreResult {
  const lower = text.toLowerCase();

  const input: FoundationInput = {
    text,
    agentCount: countAgents(text),
    hasWorkflows: /workflow|pipeline|sequence|process|step\s*\d/i.test(text),
    hasOversight: /oversight|approval|review|human.*check|sign.off|gate/i.test(text),
    hasEscalation: /escalat|fallback|error.*handl|when.*fail|if.*wrong|override/i.test(text),
  };

  const checks: FoundationCheck[] = [];

  // ── CRITICAL CHECKS (these block everything) ──

  // F-01: No agents defined
  checks.push(checkAgentsDefined(input));

  // F-02: No human override authority
  checks.push(checkHumanOverride(input, lower));

  // F-03: No escalation paths
  checks.push(checkEscalationPaths(input, lower));

  // F-04: No error handling
  checks.push(checkErrorHandling(lower));

  // F-05: Agents with no clear responsibilities
  checks.push(checkAgentResponsibilities(text));

  // ── WARNING CHECKS (should fix before scaling) ──

  // F-06: Overlapping agent responsibilities
  checks.push(checkOverlappingResponsibilities(text));

  // F-07: No approval gates for external actions
  checks.push(checkApprovalGates(lower));

  // F-08: No data flow architecture
  checks.push(checkDataFlow(lower));

  // F-09: Missing communication protocol
  checks.push(checkCommunicationProtocol(lower));

  // F-10: No security/PII handling
  checks.push(checkSecurityPolicy(lower));

  // F-11: No monitoring/observability
  checks.push(checkMonitoring(lower));

  // F-12: Single point of failure risk
  checks.push(checkSinglePointOfFailure(text, input));

  // ── INFO CHECKS (nice to have) ──

  // F-13: No versioning/changelog
  checks.push(checkVersioning(lower));

  // F-14: No learning/improvement loop
  checks.push(checkLearningLoop(lower));

  // F-15: No testing/validation
  checks.push(checkTesting(lower));

  // Calculate score
  const criticalCount = checks.filter(c => !c.passed && c.severity === 'critical').length;
  const warningCount = checks.filter(c => !c.passed && c.severity === 'warning').length;
  const passedCount = checks.filter(c => c.passed).length;
  const totalChecks = checks.length;

  // Scoring: start at 100, deduct per failure
  let score = 100;
  for (const check of checks) {
    if (!check.passed) {
      if (check.severity === 'critical') score -= 15;
      else if (check.severity === 'warning') score -= 7;
      else score -= 3;
    }
  }
  score = Math.max(0, Math.min(100, score));

  // Critical failures cap the score
  if (criticalCount >= 3) score = Math.min(score, 25);
  else if (criticalCount >= 2) score = Math.min(score, 40);
  else if (criticalCount >= 1) score = Math.min(score, 60);

  const grade = score >= 80 ? 'A' : score >= 65 ? 'B' : score >= 50 ? 'C' : score >= 35 ? 'D' : 'F';

  return { score, grade, checks, criticalCount, warningCount, passedCount };
}

// ── Individual Check Functions ──

function checkAgentsDefined(input: FoundationInput): FoundationCheck {
  return {
    id: 'F-01',
    name: 'Agents defined',
    passed: input.agentCount >= 1,
    severity: 'critical',
    message: input.agentCount >= 1
      ? `${input.agentCount} agent(s) detected.`
      : 'No AI agents detected in your system prompt. OTP needs to see how your agents are structured.',
    fix: 'Define your agents with clear names, roles, and responsibilities. Use headers like "### AGENT_NAME - Role".',
  };
}

function checkHumanOverride(input: FoundationInput, lower: string): FoundationCheck {
  const hasOverride = /override.*authority|human.*override|final.*authority|can.*override|kill\s*switch|emergency.*stop/i.test(lower)
    || /owner|founder|ceo/i.test(lower) && /override|authority|decision|approval/i.test(lower);
  return {
    id: 'F-02',
    name: 'Human override authority',
    passed: hasOverride,
    severity: 'critical',
    message: hasOverride
      ? 'Human override authority detected.'
      : 'No human override authority defined. If an agent makes a harmful decision, nobody can stop it.',
    fix: 'Designate a person (e.g., CEO, Founder) with explicit override authority over all AI agents.',
  };
}

function checkEscalationPaths(input: FoundationInput, lower: string): FoundationCheck {
  const hasEscalation = /escalat|when.*uncertain|if.*unsure|fallback|human.*review|ask.*david|check.*with|flag.*for/i.test(lower);
  return {
    id: 'F-03',
    name: 'Escalation paths defined',
    passed: hasEscalation,
    severity: 'critical',
    message: hasEscalation
      ? 'Escalation paths detected.'
      : 'No escalation paths found. When agents encounter uncertainty or errors, they have nowhere to go.',
    fix: 'Define what happens when an agent is uncertain, encounters an error, or produces conflicting output. Example: "When in doubt, escalate to [person]."',
  };
}

function checkErrorHandling(lower: string): FoundationCheck {
  const hasErrorHandling = /error.*handl|when.*fail|if.*fail|retry|fallback|graceful|recover|catch.*error|error.*log/i.test(lower);
  return {
    id: 'F-04',
    name: 'Error handling defined',
    passed: hasErrorHandling,
    severity: 'critical',
    message: hasErrorHandling
      ? 'Error handling patterns detected.'
      : 'No error handling defined. When something breaks, your agents have no recovery plan.',
    fix: 'Define what happens when tools fail, APIs timeout, or agents produce bad output. Include retry logic, fallback procedures, and error logging.',
  };
}

function checkAgentResponsibilities(text: string): FoundationCheck {
  // Look for agents that have no responsibilities listed
  const agentHeaders = text.match(/###?\s+[A-Z][A-Z\s]+-/g) || [];
  const hasResponsibilities = /responsibilit|owns?:|does not own|role:|duties/i.test(text);
  const passed = agentHeaders.length === 0 || hasResponsibilities;
  return {
    id: 'F-05',
    name: 'Agent responsibilities defined',
    passed,
    severity: 'critical',
    message: passed
      ? 'Agent responsibilities are defined.'
      : `${agentHeaders.length} agent(s) detected but no clear responsibility definitions found.`,
    fix: 'For each agent, define: what it owns, what it does NOT own, and what tools it has access to.',
  };
}

function checkOverlappingResponsibilities(text: string): FoundationCheck {
  // Look for multiple agents claiming the same domain
  const domains = ['email', 'slack', 'calendar', 'task', 'pipeline', 'billing', 'client comm'];
  const overlaps: string[] = [];

  for (const domain of domains) {
    const regex = new RegExp(`(?:owns|responsible|manages?).*${domain}`, 'gi');
    const matches = text.match(regex);
    if (matches && matches.length >= 2) {
      overlaps.push(domain);
    }
  }

  return {
    id: 'F-06',
    name: 'No overlapping responsibilities',
    passed: overlaps.length === 0,
    severity: 'warning',
    message: overlaps.length === 0
      ? 'No obvious responsibility overlaps detected.'
      : `Potential overlap detected in: ${overlaps.join(', ')}. Multiple agents may own the same domain.`,
    fix: 'Ensure one agent owns each domain. Use "Does NOT own" sections to create clear boundaries.',
  };
}

function checkApprovalGates(lower: string): FoundationCheck {
  const hasApproval = /approval|approve|human.*review|david.*approv|require.*permission|gate|sign.off|never.*without/i.test(lower);
  return {
    id: 'F-07',
    name: 'Approval gates for external actions',
    passed: hasApproval,
    severity: 'warning',
    message: hasApproval
      ? 'Human approval gates detected.'
      : 'No approval gates found. Agents may take external actions (send emails, post messages, spend money) without human review.',
    fix: 'Define which actions require human approval before execution. At minimum: sending external comms, spending money, deleting data.',
  };
}

function checkDataFlow(lower: string): FoundationCheck {
  const hasDataFlow = /shared state|data flow|writes to|reads from|state file|handoff|pipeline|feeds.*into|output.*to/i.test(lower);
  return {
    id: 'F-08',
    name: 'Data flow architecture',
    passed: hasDataFlow,
    severity: 'warning',
    message: hasDataFlow
      ? 'Data flow patterns detected.'
      : 'No data flow architecture defined. Agents cannot share information reliably without explicit data paths.',
    fix: 'Define how agents share data: shared files, message buses, APIs, or databases. Example: "Agent A writes to state.md. Agent B reads state.md."',
  };
}

function checkCommunicationProtocol(lower: string): FoundationCheck {
  const hasComms = /communication.*protocol|message.*bus|inbox|channel|notify|alert|flag|report.*to|post.*to/i.test(lower);
  return {
    id: 'F-09',
    name: 'Communication protocol',
    passed: hasComms,
    severity: 'warning',
    message: hasComms
      ? 'Communication protocols detected.'
      : 'No inter-agent or agent-human communication protocol defined.',
    fix: 'Define how agents communicate: where they post updates, how they flag issues, and how they reach humans.',
  };
}

function checkSecurityPolicy(lower: string): FoundationCheck {
  const hasSecurity = /security|pii|sensitive|encrypt|permission|access control|do.not.contact|compliance|gdpr|never.*delete|read.only/i.test(lower);
  return {
    id: 'F-10',
    name: 'Security and data handling policy',
    passed: hasSecurity,
    severity: 'warning',
    message: hasSecurity
      ? 'Security/data handling policies detected.'
      : 'No security or data handling policies found. Agents may expose sensitive data or take destructive actions.',
    fix: 'Define data handling rules: what agents can read vs write, PII handling, read-only systems, and destructive action prevention.',
  };
}

function checkMonitoring(lower: string): FoundationCheck {
  const hasMonitoring = /monitor|observ|stale|staleness|alert|threshold|flag.*stale|log|audit|track/i.test(lower);
  return {
    id: 'F-11',
    name: 'Monitoring and observability',
    passed: hasMonitoring,
    severity: 'warning',
    message: hasMonitoring
      ? 'Monitoring/observability patterns detected.'
      : 'No monitoring or observability defined. You cannot detect when agents fail silently.',
    fix: 'Add staleness checks, audit logging, alert thresholds, and health monitoring for agent outputs.',
  };
}

function checkSinglePointOfFailure(text: string, input: FoundationInput): FoundationCheck {
  // If only one AI model powers everything and there are 3+ agents
  const models = new Set<string>();
  for (const model of ['claude', 'gpt', 'gemini', 'llama', 'mistral']) {
    if (text.toLowerCase().includes(model)) models.add(model);
  }
  const singleModel = models.size === 1 && input.agentCount >= 3;

  return {
    id: 'F-12',
    name: 'No single point of failure',
    passed: !singleModel,
    severity: 'warning',
    message: singleModel
      ? `All ${input.agentCount} agents appear to depend on one AI model. If it goes down, everything stops.`
      : 'No obvious single point of failure detected.',
    fix: 'Document fallback procedures for when your primary AI model is unavailable. Consider which operations can degrade gracefully.',
  };
}

function checkVersioning(lower: string): FoundationCheck {
  const hasVersioning = /version|changelog|history|v\d+\.\d+|roadmap|phase\s*\d/i.test(lower);
  return {
    id: 'F-13',
    name: 'Versioning or roadmap',
    passed: hasVersioning,
    severity: 'info',
    message: hasVersioning
      ? 'Versioning/roadmap detected.'
      : 'No version tracking or roadmap found.',
    fix: 'Track versions of your system prompt so you can rollback if changes break things.',
  };
}

function checkLearningLoop(lower: string): FoundationCheck {
  const hasLearning = /learning|feedback|correct|improv|lesson|retro|post.mortem|capture.*learn|knowledge|otp/i.test(lower);
  return {
    id: 'F-14',
    name: 'Learning and improvement loop',
    passed: hasLearning,
    severity: 'info',
    message: hasLearning
      ? 'Learning/improvement patterns detected.'
      : 'No learning loop defined. Mistakes will repeat without a correction capture mechanism.',
    fix: 'Define how corrections and learnings are captured, stored, and fed back to agents.',
  };
}

function checkTesting(lower: string): FoundationCheck {
  const hasTesting = /test|validat|verify|check|qa|quality|review.*output|dry.run/i.test(lower);
  return {
    id: 'F-15',
    name: 'Testing or validation',
    passed: hasTesting,
    severity: 'info',
    message: hasTesting
      ? 'Testing/validation patterns detected.'
      : 'No testing or validation procedures defined.',
    fix: 'Define how you validate agent outputs before they go live. Even simple spot-checks count.',
  };
}

// ── Helpers ──

function countAgents(text: string): number {
  // Count from patterns like "### AGENT_NAME - Role" or "**Agent** - Role"
  const headerAgents = text.match(/###?\s+[A-Z][A-Z\s]{2,}[-\u2013]/g) || [];
  const boldAgents = text.match(/\*\*[A-Z][a-zA-Z\s]+\*\*\s*[-\u2013]\s*(?:AI|Agent|Chief|Manager|Director|Analyst|Assistant|Engine|Scout)/g) || [];
  const frontmatterCount = text.match(/agent_count:\s*(\d+)/i);

  const patternCount = new Set([
    ...headerAgents.map(h => h.replace(/###?\s+/, '').replace(/[-\u2013].*/, '').trim()),
    ...boldAgents.map(b => b.replace(/\*\*/g, '').replace(/[-\u2013].*/, '').trim()),
  ]).size;

  const fmCount = frontmatterCount ? parseInt(frontmatterCount[1]) : 0;

  return Math.max(patternCount, fmCount);
}
