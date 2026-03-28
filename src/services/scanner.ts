// Agent Coordination Scanner -- "X-Ray for AI Organizations"
// The primary wedge product for OTP.
// User flow: 5 steps, under 5 minutes, immediate insight.
// Phase 2 activation. Architecture built now.

import type { ParsedClaim } from '../shared/types.js';
import type { Confidence, EvidenceType, TemplateType } from '../shared/enums.js';

// ---- Scanner Input Types ----

export interface ScannerInput {
  // Step 1: AI Systems
  systems: Array<{
    name: string;                    // e.g., "Claude", "Zapier", "CRM"
    category: 'ai_model' | 'automation' | 'saas_platform' | 'internal_tool' | 'communication' | 'database';
    description?: string;
  }>;

  // Step 2: Key Roles
  roles: Array<{
    name: string;                    // e.g., "Lead Research Agent", "CEO"
    type: 'ai_agent' | 'automation' | 'human_operator' | 'human_decision_maker';
    system?: string;                 // Which system powers this role
    responsibilities: string[];
    authority: 'autonomous' | 'semi_autonomous' | 'supervised' | 'advisory';
  }>;

  // Step 3: Core Workflows
  workflows: Array<{
    name: string;                    // e.g., "Lead Generation Pipeline"
    trigger: string;                 // "daily schedule", "incoming lead", "manual"
    steps: Array<{
      actor: string;                 // Role name
      action: string;
      handoff_to?: string;           // Next role name
    }>;
  }>;

  // Step 4: Escalation and Oversight
  oversight: {
    uncertainty_handler: string;     // Who handles AI uncertainty
    error_handler: string;           // Who handles AI errors
    override_authority: string;      // Who can override any AI decision
    review_frequency: 'real_time' | 'daily' | 'weekly' | 'none';
    human_approval_required: string[]; // What actions require human approval
  };

  // Metadata
  orgName: string;
  industry: string;
  orgSize: 'solo' | 'small' | 'medium' | 'large' | 'enterprise';
}

// ---- Scanner Output Types ----

export interface ScanResult {
  // Generated OOS
  oos: {
    template: TemplateType;
    frontmatter: Record<string, unknown>;
    claims: GeneratedClaim[];
    rawMarkdown: string;
  };

  // Coordination Score
  score: CoordinationScore;

  // Coordination Insights
  insights: CoordinationInsight[];

  // Graph Data (for visualization)
  graph: {
    nodes: Array<{ id: string; type: string; label: string; properties: Record<string, unknown> }>;
    edges: Array<{ source: string; target: string; type: string; label: string }>;
  };

  // Metadata
  scanDuration: number;
  timestamp: string;
}

export interface GeneratedClaim {
  claimId: string;
  section: string;
  rule: string;
  why: string;
  failureMode: string;
  confidence: Confidence;
  evidence: EvidenceType;
  scope: string;
}

export interface CoordinationScore {
  overall: number;               // 0-100
  breakdown: {
    conflictManagement: number;  // 0-100
    escalationStructure: number;
    workflowClarity: number;
    humanOversight: number;
    systemRedundancy: number;
    authorityBoundaries: number;
  };
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface CoordinationInsight {
  id: string;
  severity: 'critical' | 'warning' | 'info' | 'positive';
  title: string;
  description: string;
  recommendation: string;
  affectedEntities: string[];
}

// ---- Scanner Engine ----

export function runScan(input: ScannerInput): ScanResult {
  const startTime = Date.now();

  // Analyze the input
  const insights = generateInsights(input);
  const score = calculateCoordinationScore(input, insights);
  const graph = buildScannerGraph(input);
  const claims = generateClaims(input, insights);
  const template = inferTemplate(input);
  const rawMarkdown = generateOOSMarkdown(input, claims, template);

  return {
    oos: {
      template,
      frontmatter: buildFrontmatter(input, claims, template),
      claims,
      rawMarkdown,
    },
    score,
    insights,
    graph,
    scanDuration: Date.now() - startTime,
    timestamp: new Date().toISOString(),
  };
}

// ---- Insight Generation ----

function generateInsights(input: ScannerInput): CoordinationInsight[] {
  const insights: CoordinationInsight[] = [];
  let insightCounter = 0;

  const aiRoles = input.roles.filter(r => r.type === 'ai_agent' || r.type === 'automation');
  const humanRoles = input.roles.filter(r => r.type === 'human_operator' || r.type === 'human_decision_maker');

  // ---- Conflict Detection ----

  // Check for agents in same workflow without conflict protocol
  for (const wf of input.workflows) {
    const aiActors = wf.steps
      .map(s => input.roles.find(r => r.name === s.actor))
      .filter(r => r && (r.type === 'ai_agent' || r.type === 'automation'));

    if (aiActors.length >= 2) {
      const autonomousActors = aiActors.filter(r => r?.authority === 'autonomous');
      if (autonomousActors.length >= 2) {
        insights.push({
          id: `INS-${String(++insightCounter).padStart(3, '0')}`,
          severity: 'critical',
          title: `Two autonomous agents in "${wf.name}" without conflict protocol`,
          description: `${autonomousActors.map(a => a?.name).join(' and ')} both operate autonomously in the "${wf.name}" workflow. If they produce conflicting outputs, there is no defined resolution mechanism.`,
          recommendation: 'Define which agent takes priority, or add a conflict resolution step to the workflow.',
          affectedEntities: autonomousActors.map(a => a?.name || ''),
        });
      }
    }
  }

  // ---- Escalation Gaps ----

  // Check for agents without escalation paths
  for (const role of aiRoles) {
    if (role.authority === 'autonomous' || role.authority === 'semi_autonomous') {
      const isInWorkflow = input.workflows.some(wf =>
        wf.steps.some(s => s.actor === role.name && s.handoff_to)
      );
      const hasEscalation = input.oversight.uncertainty_handler || input.oversight.error_handler;

      if (!isInWorkflow && !hasEscalation) {
        insights.push({
          id: `INS-${String(++insightCounter).padStart(3, '0')}`,
          severity: 'warning',
          title: `"${role.name}" has no escalation path`,
          description: `This ${role.type} operates with ${role.authority} authority but has no defined path to escalate when it encounters uncertainty or errors.`,
          recommendation: 'Define an escalation handler for this role or add it to a workflow with handoff steps.',
          affectedEntities: [role.name],
        });
      }
    }
  }

  // No human escalation in any workflow
  const workflowsWithHumans = input.workflows.filter(wf =>
    wf.steps.some(s => {
      const role = input.roles.find(r => r.name === s.actor);
      return role && (role.type === 'human_operator' || role.type === 'human_decision_maker');
    })
  );

  if (input.workflows.length > 0 && workflowsWithHumans.length === 0) {
    insights.push({
      id: `INS-${String(++insightCounter).padStart(3, '0')}`,
      severity: 'critical',
      title: 'No workflows include human oversight steps',
      description: `All ${input.workflows.length} workflows are fully automated with no human checkpoints. If AI produces errors, there is no in-workflow mechanism to catch them.`,
      recommendation: 'Add human review steps to at least your highest-risk workflows.',
      affectedEntities: input.workflows.map(wf => wf.name),
    });
  }

  // ---- Single Point of Failure ----

  // Check for systems used by multiple workflows
  const systemUsage: Record<string, string[]> = {};
  for (const wf of input.workflows) {
    for (const step of wf.steps) {
      const role = input.roles.find(r => r.name === step.actor);
      if (role?.system) {
        if (!systemUsage[role.system]) systemUsage[role.system] = [];
        systemUsage[role.system].push(wf.name);
      }
    }
  }

  for (const [system, workflows] of Object.entries(systemUsage)) {
    if (workflows.length >= 3) {
      insights.push({
        id: `INS-${String(++insightCounter).padStart(3, '0')}`,
        severity: 'warning',
        title: `"${system}" is a single point of failure for ${workflows.length} workflows`,
        description: `${workflows.join(', ')} all depend on "${system}". If this system goes down, all these workflows fail simultaneously.`,
        recommendation: 'Consider fallback options or manual procedures for when this system is unavailable.',
        affectedEntities: [system, ...workflows],
      });
    }
  }

  // ---- Authority Gaps ----

  // Agents with autonomous authority but no human can override
  if (!input.oversight.override_authority) {
    const autonomousAgents = aiRoles.filter(r => r.authority === 'autonomous');
    if (autonomousAgents.length > 0) {
      insights.push({
        id: `INS-${String(++insightCounter).padStart(3, '0')}`,
        severity: 'critical',
        title: 'No human override authority defined',
        description: `${autonomousAgents.length} AI agents operate autonomously, but no human has been designated with override authority. If an agent makes a harmful decision, there is no defined way to stop it.`,
        recommendation: 'Designate at least one person with unlimited override authority over all AI agents.',
        affectedEntities: autonomousAgents.map(a => a.name),
      });
    }
  }

  // ---- Workflow Gaps ----

  // Dead-end steps (no handoff, not the last step)
  for (const wf of input.workflows) {
    for (let i = 0; i < wf.steps.length - 1; i++) {
      if (!wf.steps[i].handoff_to) {
        insights.push({
          id: `INS-${String(++insightCounter).padStart(3, '0')}`,
          severity: 'info',
          title: `Dead-end step in "${wf.name}"`,
          description: `Step ${i + 1} (${wf.steps[i].actor}: ${wf.steps[i].action}) has no handoff to the next step. The workflow may stall here.`,
          recommendation: 'Add a handoff_to or make this step explicitly terminal.',
          affectedEntities: [wf.name, wf.steps[i].actor],
        });
      }
    }
  }

  // ---- Positive Findings ----

  if (input.oversight.review_frequency === 'real_time') {
    insights.push({
      id: `INS-${String(++insightCounter).padStart(3, '0')}`,
      severity: 'positive',
      title: 'Real-time human review in place',
      description: 'Your organization reviews AI output in real-time. This is the strongest oversight model.',
      recommendation: 'Maintain this practice. Consider documenting which outputs are reviewed and by whom.',
      affectedEntities: [],
    });
  }

  if (input.oversight.human_approval_required.length > 0) {
    insights.push({
      id: `INS-${String(++insightCounter).padStart(3, '0')}`,
      severity: 'positive',
      title: `${input.oversight.human_approval_required.length} actions require human approval`,
      description: `You've defined explicit human approval gates for: ${input.oversight.human_approval_required.join(', ')}.`,
      recommendation: 'Good practice. Consider documenting these as formal claims in your OOS.',
      affectedEntities: [],
    });
  }

  return insights;
}

// ---- Coordination Score ----

function calculateCoordinationScore(input: ScannerInput, insights: CoordinationInsight[]): CoordinationScore {
  const criticalCount = insights.filter(i => i.severity === 'critical').length;
  const warningCount = insights.filter(i => i.severity === 'warning').length;
  const positiveCount = insights.filter(i => i.severity === 'positive').length;

  const aiRoles = input.roles.filter(r => r.type === 'ai_agent' || r.type === 'automation');

  // Conflict Management (0-100)
  const autonomousAgents = aiRoles.filter(r => r.authority === 'autonomous').length;
  const conflictInsights = insights.filter(i => i.title.toLowerCase().includes('conflict')).length;
  const conflictManagement = Math.max(0, 100 - (conflictInsights * 30) - (autonomousAgents > 3 ? 20 : 0));

  // Escalation Structure (0-100)
  const hasEscalation = input.oversight.uncertainty_handler ? 30 : 0;
  const hasErrorHandler = input.oversight.error_handler ? 30 : 0;
  const hasOverride = input.oversight.override_authority ? 20 : 0;
  const escalationGaps = insights.filter(i => i.title.toLowerCase().includes('escalation')).length;
  const escalationStructure = Math.min(100, hasEscalation + hasErrorHandler + hasOverride + 20 - (escalationGaps * 15));

  // Workflow Clarity (0-100)
  const totalSteps = input.workflows.reduce((sum, wf) => sum + wf.steps.length, 0);
  const handoffSteps = input.workflows.reduce((sum, wf) => sum + wf.steps.filter(s => s.handoff_to).length, 0);
  const handoffRatio = totalSteps > 0 ? handoffSteps / totalSteps : 0;
  const workflowClarity = Math.round(
    (input.workflows.length > 0 ? 40 : 0) +
    (handoffRatio * 40) +
    (input.workflows.length >= 3 ? 20 : input.workflows.length * 7)
  );

  // Human Oversight (0-100)
  const reviewScore = { real_time: 40, daily: 30, weekly: 15, none: 0 }[input.oversight.review_frequency] || 0;
  const approvalScore = Math.min(30, input.oversight.human_approval_required.length * 10);
  const humanOversight = Math.min(100, reviewScore + approvalScore + (hasOverride ? 30 : 0));

  // System Redundancy (0-100)
  const spofInsights = insights.filter(i => i.title.toLowerCase().includes('single point')).length;
  const systemRedundancy = Math.max(0, 100 - (spofInsights * 25));

  // Authority Boundaries (0-100)
  const rolesWithAuthority = input.roles.filter(r => r.authority).length;
  const authorityRatio = input.roles.length > 0 ? rolesWithAuthority / input.roles.length : 0;
  const authorityBoundaries = Math.round(authorityRatio * 70 + (positiveCount * 10));

  const overall = Math.round(
    conflictManagement * 0.20 +
    escalationStructure * 0.25 +
    workflowClarity * 0.15 +
    humanOversight * 0.20 +
    systemRedundancy * 0.10 +
    authorityBoundaries * 0.10
  );

  const grade = overall >= 80 ? 'A' : overall >= 65 ? 'B' : overall >= 50 ? 'C' : overall >= 35 ? 'D' : 'F';

  return {
    overall,
    breakdown: {
      conflictManagement,
      escalationStructure,
      workflowClarity,
      humanOversight,
      systemRedundancy,
      authorityBoundaries,
    },
    grade,
  };
}

// ---- Graph Builder ----

function buildScannerGraph(input: ScannerInput) {
  const nodes: Array<{ id: string; type: string; label: string; properties: Record<string, unknown> }> = [];
  const edges: Array<{ source: string; target: string; type: string; label: string }> = [];

  // Add role nodes
  for (const role of input.roles) {
    const nodeType = role.type === 'ai_agent' ? 'agent' :
                     role.type === 'automation' ? 'system' :
                     'human';
    nodes.push({
      id: role.name,
      type: nodeType,
      label: role.name,
      properties: { authority: role.authority, system: role.system, type: role.type },
    });
  }

  // Add system nodes
  for (const system of input.systems) {
    if (!nodes.find(n => n.id === system.name)) {
      nodes.push({
        id: system.name,
        type: 'system',
        label: system.name,
        properties: { category: system.category },
      });
    }
  }

  // Add workflow edges
  for (const wf of input.workflows) {
    for (const step of wf.steps) {
      if (step.handoff_to) {
        edges.push({
          source: step.actor,
          target: step.handoff_to,
          type: 'hands_off_to',
          label: `${wf.name}: ${step.action}`,
        });
      }
    }
  }

  // Add system access edges
  for (const role of input.roles) {
    if (role.system) {
      edges.push({
        source: role.name,
        target: role.system,
        type: 'accesses',
        label: 'powered by',
      });
    }
  }

  // Add escalation edges
  if (input.oversight.uncertainty_handler) {
    for (const role of input.roles.filter(r => r.type === 'ai_agent')) {
      edges.push({
        source: role.name,
        target: input.oversight.uncertainty_handler,
        type: 'escalates_to',
        label: 'when uncertain',
      });
    }
  }

  // Add override edges
  if (input.oversight.override_authority) {
    for (const role of input.roles.filter(r => r.type === 'ai_agent' && r.authority === 'autonomous')) {
      edges.push({
        source: input.oversight.override_authority,
        target: role.name,
        type: 'overrides',
        label: 'can override',
      });
    }
  }

  return { nodes, edges };
}

// ---- OOS Generation ----

function inferTemplate(input: ScannerInput): TemplateType {
  const aiRoles = input.roles.filter(r => r.type === 'ai_agent');
  if (aiRoles.length >= 3) return 'agent_army';
  if (input.workflows.length >= 3) return 'value_chain';
  return 'org_chart';
}

function generateClaims(input: ScannerInput, insights: CoordinationInsight[]): GeneratedClaim[] {
  const claims: GeneratedClaim[] = [];
  let claimCounter = 0;

  // Generate claims from roles (authority boundaries)
  for (const role of input.roles) {
    if (role.type === 'ai_agent' || role.type === 'automation') {
      claims.push({
        claimId: `C${String(++claimCounter).padStart(3, '0')}`,
        section: 'agent_roles_and_authority',
        rule: `"${role.name}" operates at ${role.authority} authority level with responsibilities: ${role.responsibilities.join(', ')}.`,
        why: `Authority level defines what this ${role.type} can do without human approval.`,
        failureMode: role.authority === 'autonomous'
          ? `If "${role.name}" makes a wrong decision, there may be no immediate catch unless escalation is defined.`
          : `If "${role.name}" exceeds its authority level, coordination breaks down.`,
        confidence: 'MEDIUM',
        evidence: 'INFERENCE',
        scope: `Applies to "${role.name}" in all workflows it participates in.`,
      });
    }
  }

  // Generate claims from oversight rules
  if (input.oversight.human_approval_required.length > 0) {
    claims.push({
      claimId: `C${String(++claimCounter).padStart(3, '0')}`,
      section: 'human_ai_boundary_conditions',
      rule: `Human approval is required for: ${input.oversight.human_approval_required.join(', ')}.`,
      why: 'These actions have consequences that AI cannot fully assess.',
      failureMode: 'If AI executes these actions without approval, it may cause harm to operations, clients, or finances.',
      confidence: 'MEDIUM',
      evidence: 'HUMAN_DEFINED_RULE',
      scope: 'All agents and automations. No exceptions.',
    });
  }

  if (input.oversight.override_authority) {
    claims.push({
      claimId: `C${String(++claimCounter).padStart(3, '0')}`,
      section: 'human_ai_boundary_conditions',
      rule: `"${input.oversight.override_authority}" has unlimited override authority over all AI agents.`,
      why: 'A human must always be able to stop or reverse any AI decision.',
      failureMode: 'Without override authority, harmful AI actions cannot be stopped.',
      confidence: 'MEDIUM',
      evidence: 'HUMAN_DEFINED_RULE',
      scope: 'All AI agents and automations.',
    });
  }

  // Generate claims from insights (critical findings become failure pattern claims)
  for (const insight of insights.filter(i => i.severity === 'critical')) {
    claims.push({
      claimId: `C${String(++claimCounter).padStart(3, '0')}`,
      section: 'failure_patterns',
      rule: `RISK: ${insight.title}`,
      why: insight.description,
      failureMode: insight.recommendation,
      confidence: 'LOW',
      evidence: 'INFERENCE',
      scope: `Affects: ${insight.affectedEntities.join(', ')}`,
    });
  }

  // Generate claims from workflows (coordination patterns)
  for (const wf of input.workflows) {
    if (wf.steps.length >= 2) {
      const actors = [...new Set(wf.steps.map(s => s.actor))];
      claims.push({
        claimId: `C${String(++claimCounter).padStart(3, '0')}`,
        section: 'coordination_patterns',
        rule: `The "${wf.name}" workflow involves ${wf.steps.length} steps across ${actors.length} actors, triggered by "${wf.trigger}".`,
        why: `Workflow coordination requires clear handoffs between actors.`,
        failureMode: `If any step fails without a defined failure action, the workflow stalls.`,
        confidence: 'MEDIUM',
        evidence: 'INFERENCE',
        scope: `Applies to the "${wf.name}" workflow. Actors: ${actors.join(', ')}.`,
      });
    }
  }

  return claims;
}

function buildFrontmatter(input: ScannerInput, claims: GeneratedClaim[], template: TemplateType): Record<string, unknown> {
  const confDist = { high: 0, medium: 0, low: 0 };
  const evidDist: Record<string, number> = {};

  for (const claim of claims) {
    confDist[claim.confidence.toLowerCase() as keyof typeof confDist]++;
    const evKey = claim.evidence.toLowerCase();
    evidDist[evKey] = (evidDist[evKey] || 0) + 1;
  }

  return {
    oos_version: '1.0',
    org_pseudonym: input.orgName,
    industry: input.industry,
    org_size: input.orgSize,
    template,
    agent_count: input.roles.filter(r => r.type === 'ai_agent').length,
    platforms: [...new Set(input.systems.filter(s => s.category === 'ai_model').map(s => s.name))],
    mcp_servers: [...new Set(input.systems.filter(s => s.category !== 'ai_model').map(s => s.name))],
    generated_at: new Date().toISOString(),
    version: 1,
    parent_version: null,
    word_count: 0, // calculated after markdown generation
    claim_count: claims.length,
    confidence_distribution: confDist,
    evidence_distribution: evidDist,
    scanner_generated: true,
  };
}

function generateOOSMarkdown(input: ScannerInput, claims: GeneratedClaim[], template: TemplateType): string {
  const lines: string[] = [];

  // Frontmatter will be prepended by the caller with accurate word count
  lines.push('## Purpose');
  lines.push('');
  lines.push(`${input.orgName} is a ${input.orgSize} ${input.industry} organization running ${input.roles.filter(r => r.type === 'ai_agent').length} AI agents and ${input.roles.filter(r => r.type === 'automation').length} automation systems. This OOS was generated by the OTP Agent Coordination Scanner.`);
  lines.push('');

  lines.push('## Prime Directives');
  lines.push('');
  if (input.oversight.override_authority) {
    lines.push(`1. ${input.oversight.override_authority} has final authority over all AI decisions.`);
  }
  if (input.oversight.human_approval_required.length > 0) {
    lines.push(`2. Human approval required for: ${input.oversight.human_approval_required.join(', ')}.`);
  }
  lines.push(`3. All AI output should be auditable and traceable.`);
  lines.push('');

  lines.push('## System Identity');
  lines.push('');
  lines.push(`A ${input.industry} organization using AI and automation for operational workflows. The system combines ${input.roles.length} roles across ${input.workflows.length} workflows.`);
  lines.push('');

  // Group claims by section and render
  const sections = [...new Set(claims.map(c => c.section))];
  for (const section of sections) {
    const sectionTitle = section.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    lines.push(`## ${sectionTitle}`);
    lines.push('');

    for (const claim of claims.filter(c => c.section === section)) {
      lines.push(`**[${claim.claimId}]** ${section}`);
      lines.push(`- **Rule:** ${claim.rule}`);
      lines.push(`- **Why:** ${claim.why}`);
      lines.push(`- **Failure mode:** ${claim.failureMode}`);
      lines.push(`- **Confidence:** ${claim.confidence}`);
      lines.push(`- **Evidence:** ${claim.evidence}`);
      lines.push(`- **Scope:** ${claim.scope}`);
      lines.push('');
    }
  }

  return lines.join('\n');
}
