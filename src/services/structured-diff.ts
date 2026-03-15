// Structured Diff Engine -- compares two organizations at the entity level
// Detects differences in: agents, workflows, escalations, conflicts, dependencies, claims
// Produces a structured diff report, not just a claim-level comparison

import { computeClaimSimilarity } from './similarity.js';
import type { ParsedClaim } from '../shared/types.js';

// ---- Input Types ----

interface OrgEntities {
  agents: Array<{ id: string; name: string; role: string; authority_level: string; owns: string[]; escalates_to?: string; status?: string }>;
  humans: Array<{ id: string; role: string; authority_level: string; override_authority?: string[] }>;
  systems: Array<{ id: string; name: string; type: string; accessed_by?: string[] }>;
  workflows: Array<{ id: string; name: string; trigger: string; steps: Array<{ order: number; actor: string; action: string; handoff_to?: string }> }>;
  escalation_hierarchy?: { levels: Array<{ level: number; handler: string; trigger: string }> };
  conflict_protocols: Array<{ id: string; parties: string[]; resolution: string; winner?: string }>;
  override_rules: Array<{ id: string; overrider: string; overridden: string; condition: string }>;
  dependencies: Array<{ source: string; target: string; type: string; criticality?: string }>;
}

interface OrgSnapshot {
  orgId: string;
  orgName: string;
  entities: OrgEntities;
  claims: ParsedClaim[];
}

// ---- Output Types ----

export interface EntityDiffItem {
  category: string;
  classification: 'only_in_a' | 'only_in_b' | 'different' | 'similar';
  nameA: string | null;
  nameB: string | null;
  details: string;
  significance: 'high' | 'medium' | 'low';
}

export interface StructuredDiffReport {
  orgA: { id: string; name: string };
  orgB: { id: string; name: string };
  summary: {
    totalDifferences: number;
    highSignificance: number;
    mediumSignificance: number;
    lowSignificance: number;
  };
  sections: {
    agents: EntityDiffSection;
    workflows: EntityDiffSection;
    escalation: EntityDiffSection;
    conflicts: EntityDiffSection;
    overrides: EntityDiffSection;
    dependencies: EntityDiffSection;
    claims: EntityDiffSection;
  };
  recommendations: string[];
}

interface EntityDiffSection {
  title: string;
  items: EntityDiffItem[];
  countA: number;
  countB: number;
}

// ---- Core Diff Function ----

export function generateStructuredDiff(orgA: OrgSnapshot, orgB: OrgSnapshot): StructuredDiffReport {
  const agents = diffAgents(orgA.entities.agents, orgB.entities.agents);
  const workflows = diffWorkflows(orgA.entities.workflows, orgB.entities.workflows);
  const escalation = diffEscalation(orgA.entities.escalation_hierarchy, orgB.entities.escalation_hierarchy);
  const conflicts = diffConflicts(orgA.entities.conflict_protocols, orgB.entities.conflict_protocols);
  const overrides = diffOverrides(orgA.entities.override_rules, orgB.entities.override_rules);
  const dependencies = diffDependencies(orgA.entities.dependencies, orgB.entities.dependencies);
  const claimsDiff = diffClaims(orgA.claims, orgB.claims);

  const allItems = [
    ...agents.items, ...workflows.items, ...escalation.items,
    ...conflicts.items, ...overrides.items, ...dependencies.items, ...claimsDiff.items,
  ];

  const recommendations = generateRecommendations(agents, workflows, escalation, conflicts, orgA, orgB);

  return {
    orgA: { id: orgA.orgId, name: orgA.orgName },
    orgB: { id: orgB.orgId, name: orgB.orgName },
    summary: {
      totalDifferences: allItems.length,
      highSignificance: allItems.filter(i => i.significance === 'high').length,
      mediumSignificance: allItems.filter(i => i.significance === 'medium').length,
      lowSignificance: allItems.filter(i => i.significance === 'low').length,
    },
    sections: { agents, workflows, escalation, conflicts, overrides, dependencies, claims: claimsDiff },
    recommendations,
  };
}

// ---- Section Diff Functions ----

function diffAgents(
  agentsA: OrgEntities['agents'],
  agentsB: OrgEntities['agents']
): EntityDiffSection {
  const items: EntityDiffItem[] = [];

  // Match agents by role similarity (not by ID -- IDs are org-specific)
  const matchedB = new Set<number>();

  for (const agentA of agentsA) {
    let bestMatch: { index: number; agent: typeof agentsB[0]; score: number } | null = null;

    for (let i = 0; i < agentsB.length; i++) {
      if (matchedB.has(i)) continue;
      const agentB = agentsB[i];
      const roleScore = stringSimilarity(agentA.role, agentB.role);
      const nameScore = stringSimilarity(agentA.name, agentB.name);
      const score = roleScore * 0.7 + nameScore * 0.3;

      if (score > 0.4 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { index: i, agent: agentB, score };
      }
    }

    if (bestMatch) {
      matchedB.add(bestMatch.index);
      const agentB = bestMatch.agent;

      // Compare matched agents
      if (agentA.authority_level !== agentB.authority_level) {
        items.push({
          category: 'Agent Authority',
          classification: 'different',
          nameA: `${agentA.name} (${agentA.authority_level})`,
          nameB: `${agentB.name} (${agentB.authority_level})`,
          details: `Similar role "${agentA.role}" has different authority levels`,
          significance: 'high',
        });
      }

      const ownsA = new Set(agentA.owns || []);
      const ownsB = new Set((bestMatch.agent as any).owns || []);
      const uniqueOwnsA = [...ownsA].filter(o => !ownsB.has(o));
      const uniqueOwnsB = [...ownsB].filter(o => !ownsA.has(o));

      if (uniqueOwnsA.length > 0 || uniqueOwnsB.length > 0) {
        items.push({
          category: 'Agent Ownership',
          classification: 'different',
          nameA: `${agentA.name} owns: ${uniqueOwnsA.join(', ') || '(none unique)'}`,
          nameB: `${agentB.name} owns: ${uniqueOwnsB.join(', ') || '(none unique)'}`,
          details: `Similar agents have different ownership domains`,
          significance: 'medium',
        });
      }
    } else {
      // Agent exists only in A
      items.push({
        category: 'Agent',
        classification: 'only_in_a',
        nameA: `${agentA.name} -- ${agentA.role}`,
        nameB: null,
        details: `No matching agent role found in Organization B`,
        significance: agentA.authority_level === 'autonomous' ? 'high' : 'medium',
      });
    }
  }

  // Agents only in B
  for (let i = 0; i < agentsB.length; i++) {
    if (matchedB.has(i)) continue;
    const agentB = agentsB[i];
    items.push({
      category: 'Agent',
      classification: 'only_in_b',
      nameA: null,
      nameB: `${agentB.name} -- ${agentB.role}`,
      details: `No matching agent role found in Organization A`,
      significance: agentB.authority_level === 'autonomous' ? 'high' : 'medium',
    });
  }

  return { title: 'Agent Differences', items, countA: agentsA.length, countB: agentsB.length };
}

function diffWorkflows(
  workflowsA: OrgEntities['workflows'],
  workflowsB: OrgEntities['workflows']
): EntityDiffSection {
  const items: EntityDiffItem[] = [];
  const matchedB = new Set<number>();

  for (const wfA of workflowsA) {
    let bestMatch: { index: number; wf: typeof workflowsB[0]; score: number } | null = null;

    for (let i = 0; i < workflowsB.length; i++) {
      if (matchedB.has(i)) continue;
      const score = stringSimilarity(wfA.name, workflowsB[i].name);
      if (score > 0.4 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { index: i, wf: workflowsB[i], score };
      }
    }

    if (bestMatch) {
      matchedB.add(bestMatch.index);
      const wfB = bestMatch.wf;

      // Compare step counts
      if (wfA.steps.length !== wfB.steps.length) {
        items.push({
          category: 'Workflow Steps',
          classification: 'different',
          nameA: `${wfA.name}: ${wfA.steps.length} steps`,
          nameB: `${wfB.name}: ${wfB.steps.length} steps`,
          details: `Similar workflow has different complexity`,
          significance: 'medium',
        });
      }

      // Compare handoff patterns
      const handoffsA = wfA.steps.filter(s => s.handoff_to).map(s => `${s.actor}->${s.handoff_to}`);
      const handoffsB = wfB.steps.filter(s => s.handoff_to).map(s => `${s.actor}->${s.handoff_to}`);

      if (handoffsA.length !== handoffsB.length) {
        items.push({
          category: 'Workflow Handoffs',
          classification: 'different',
          nameA: `${wfA.name}: ${handoffsA.length} handoffs`,
          nameB: `${wfB.name}: ${handoffsB.length} handoffs`,
          details: `Different handoff complexity in similar workflows`,
          significance: 'medium',
        });
      }
    } else {
      items.push({
        category: 'Workflow',
        classification: 'only_in_a',
        nameA: `${wfA.name} (${wfA.steps.length} steps, trigger: ${wfA.trigger})`,
        nameB: null,
        details: `No matching workflow found in Organization B`,
        significance: 'high',
      });
    }
  }

  for (let i = 0; i < workflowsB.length; i++) {
    if (matchedB.has(i)) continue;
    const wfB = workflowsB[i];
    items.push({
      category: 'Workflow',
      classification: 'only_in_b',
      nameA: null,
      nameB: `${wfB.name} (${wfB.steps.length} steps, trigger: ${wfB.trigger})`,
      details: `No matching workflow found in Organization A`,
      significance: 'high',
    });
  }

  return { title: 'Workflow Differences', items, countA: workflowsA.length, countB: workflowsB.length };
}

function diffEscalation(
  hierA: OrgEntities['escalation_hierarchy'] | undefined,
  hierB: OrgEntities['escalation_hierarchy'] | undefined
): EntityDiffSection {
  const items: EntityDiffItem[] = [];

  if (!hierA && !hierB) {
    return { title: 'Escalation Differences', items: [], countA: 0, countB: 0 };
  }

  if (!hierA && hierB) {
    items.push({
      category: 'Escalation Hierarchy',
      classification: 'only_in_b',
      nameA: null,
      nameB: `${hierB.levels.length}-level hierarchy`,
      details: 'Organization A has no defined escalation hierarchy. Organization B has explicit escalation levels.',
      significance: 'high',
    });
    return { title: 'Escalation Differences', items, countA: 0, countB: hierB.levels.length };
  }

  if (hierA && !hierB) {
    items.push({
      category: 'Escalation Hierarchy',
      classification: 'only_in_a',
      nameA: `${hierA.levels.length}-level hierarchy`,
      nameB: null,
      details: 'Organization B has no defined escalation hierarchy. Organization A has explicit escalation levels.',
      significance: 'high',
    });
    return { title: 'Escalation Differences', items, countA: hierA.levels.length, countB: 0 };
  }

  // Both exist -- compare depth and handler types
  const levelsA = hierA!.levels;
  const levelsB = hierB!.levels;

  if (levelsA.length !== levelsB.length) {
    items.push({
      category: 'Escalation Depth',
      classification: 'different',
      nameA: `${levelsA.length} levels`,
      nameB: `${levelsB.length} levels`,
      details: `Different escalation depth. ${levelsA.length > levelsB.length ? 'A' : 'B'} has more granular escalation.`,
      significance: 'medium',
    });
  }

  // Compare terminal authority
  const terminalA = levelsA[levelsA.length - 1];
  const terminalB = levelsB[levelsB.length - 1];

  if (terminalA && terminalB && terminalA.handler !== terminalB.handler) {
    items.push({
      category: 'Terminal Authority',
      classification: 'different',
      nameA: terminalA.handler,
      nameB: terminalB.handler,
      details: 'Different terminal escalation authority',
      significance: 'low',
    });
  }

  return { title: 'Escalation Differences', items, countA: levelsA.length, countB: levelsB.length };
}

function diffConflicts(
  conflictsA: OrgEntities['conflict_protocols'],
  conflictsB: OrgEntities['conflict_protocols']
): EntityDiffSection {
  const items: EntityDiffItem[] = [];

  if (conflictsA.length === 0 && conflictsB.length > 0) {
    items.push({
      category: 'Conflict Protocols',
      classification: 'only_in_b',
      nameA: null,
      nameB: `${conflictsB.length} conflict protocol(s)`,
      details: 'Organization A has no defined conflict protocols. Organization B has explicit conflict handling.',
      significance: 'high',
    });
  } else if (conflictsA.length > 0 && conflictsB.length === 0) {
    items.push({
      category: 'Conflict Protocols',
      classification: 'only_in_a',
      nameA: `${conflictsA.length} conflict protocol(s)`,
      nameB: null,
      details: 'Organization B has no defined conflict protocols. Organization A has explicit conflict handling.',
      significance: 'high',
    });
  } else if (conflictsA.length !== conflictsB.length) {
    items.push({
      category: 'Conflict Protocol Count',
      classification: 'different',
      nameA: `${conflictsA.length} protocols`,
      nameB: `${conflictsB.length} protocols`,
      details: 'Different number of defined conflict protocols',
      significance: 'medium',
    });
  }

  // Compare resolution approaches
  const hasWinnerA = conflictsA.some(c => c.winner);
  const hasWinnerB = conflictsB.some(c => c.winner);

  if (hasWinnerA && !hasWinnerB) {
    items.push({
      category: 'Conflict Resolution',
      classification: 'different',
      nameA: 'Has default-winner protocols',
      nameB: 'No default-winner protocols',
      details: 'A defines which agent wins conflicts by default. B requires manual resolution for all conflicts.',
      significance: 'medium',
    });
  }

  return { title: 'Conflict Handling Differences', items, countA: conflictsA.length, countB: conflictsB.length };
}

function diffOverrides(
  overridesA: OrgEntities['override_rules'],
  overridesB: OrgEntities['override_rules']
): EntityDiffSection {
  const items: EntityDiffItem[] = [];

  if (overridesA.length !== overridesB.length) {
    items.push({
      category: 'Override Rules',
      classification: 'different',
      nameA: `${overridesA.length} override rule(s)`,
      nameB: `${overridesB.length} override rule(s)`,
      details: 'Different number of agent override rules defined',
      significance: overridesA.length === 0 || overridesB.length === 0 ? 'high' : 'medium',
    });
  }

  return { title: 'Override Differences', items, countA: overridesA.length, countB: overridesB.length };
}

function diffDependencies(
  depsA: OrgEntities['dependencies'],
  depsB: OrgEntities['dependencies']
): EntityDiffSection {
  const items: EntityDiffItem[] = [];

  const criticalA = depsA.filter(d => d.criticality === 'critical').length;
  const criticalB = depsB.filter(d => d.criticality === 'critical').length;

  if (criticalA !== criticalB) {
    items.push({
      category: 'Critical Dependencies',
      classification: 'different',
      nameA: `${criticalA} critical dependencies`,
      nameB: `${criticalB} critical dependencies`,
      details: 'Different number of critical dependencies. More critical dependencies = higher coordination risk.',
      significance: 'medium',
    });
  }

  // Compare dependency types
  const typesA = new Set(depsA.map(d => d.type));
  const typesB = new Set(depsB.map(d => d.type));
  const onlyInA = [...typesA].filter(t => !typesB.has(t));
  const onlyInB = [...typesB].filter(t => !typesA.has(t));

  if (onlyInA.length > 0) {
    items.push({
      category: 'Dependency Types',
      classification: 'only_in_a',
      nameA: `Types: ${onlyInA.join(', ')}`,
      nameB: null,
      details: 'Dependency types present in A but not B',
      significance: 'low',
    });
  }

  if (onlyInB.length > 0) {
    items.push({
      category: 'Dependency Types',
      classification: 'only_in_b',
      nameA: null,
      nameB: `Types: ${onlyInB.join(', ')}`,
      details: 'Dependency types present in B but not A',
      significance: 'low',
    });
  }

  return { title: 'Dependency Differences', items, countA: depsA.length, countB: depsB.length };
}

function diffClaims(claimsA: ParsedClaim[], claimsB: ParsedClaim[]): EntityDiffSection {
  const items: EntityDiffItem[] = [];

  // Section coverage comparison
  const sectionsA = new Set(claimsA.map(c => c.section));
  const sectionsB = new Set(claimsB.map(c => c.section));

  const onlyInA = [...sectionsA].filter(s => !sectionsB.has(s));
  const onlyInB = [...sectionsB].filter(s => !sectionsA.has(s));

  for (const section of onlyInA) {
    const count = claimsA.filter(c => c.section === section).length;
    items.push({
      category: 'Claim Section',
      classification: 'only_in_a',
      nameA: `${section} (${count} claims)`,
      nameB: null,
      details: `Organization B has no claims in the "${section}" section`,
      significance: section === 'failure_patterns' ? 'high' : 'medium',
    });
  }

  for (const section of onlyInB) {
    const count = claimsB.filter(c => c.section === section).length;
    items.push({
      category: 'Claim Section',
      classification: 'only_in_b',
      nameA: null,
      nameB: `${section} (${count} claims)`,
      details: `Organization A has no claims in the "${section}" section`,
      significance: section === 'failure_patterns' ? 'high' : 'medium',
    });
  }

  // Evidence quality comparison
  const measuredA = claimsA.filter(c => c.evidence === 'MEASURED_RESULT').length;
  const measuredB = claimsB.filter(c => c.evidence === 'MEASURED_RESULT').length;
  const ratioA = claimsA.length > 0 ? measuredA / claimsA.length : 0;
  const ratioB = claimsB.length > 0 ? measuredB / claimsB.length : 0;

  if (Math.abs(ratioA - ratioB) > 0.15) {
    items.push({
      category: 'Evidence Quality',
      classification: 'different',
      nameA: `${Math.round(ratioA * 100)}% measured results`,
      nameB: `${Math.round(ratioB * 100)}% measured results`,
      details: `${ratioA > ratioB ? 'A' : 'B'} has stronger evidence backing for its claims`,
      significance: 'medium',
    });
  }

  // Find highest-value unique claims (HIGH confidence, strong evidence, in B but not A)
  for (const claimB of claimsB) {
    if (claimB.confidence !== 'HIGH') continue;
    if (claimB.evidence !== 'MEASURED_RESULT' && claimB.evidence !== 'OBSERVED_REPEATEDLY') continue;

    const hasMatch = claimsA.some(claimA => {
      const { score } = computeClaimSimilarity(claimA, claimB);
      return score > 0.3;
    });

    if (!hasMatch) {
      items.push({
        category: 'High-Value Claim',
        classification: 'only_in_b',
        nameA: null,
        nameB: `[${claimB.claimId}] ${claimB.rule.substring(0, 100)}...`,
        details: `HIGH confidence, ${claimB.evidence} claim unique to B. High transfer value.`,
        significance: 'high',
      });
    }
  }

  return { title: 'Knowledge Claim Differences', items, countA: claimsA.length, countB: claimsB.length };
}

// ---- Recommendation Generator ----

function generateRecommendations(
  agents: EntityDiffSection,
  workflows: EntityDiffSection,
  escalation: EntityDiffSection,
  conflicts: EntityDiffSection,
  orgA: OrgSnapshot,
  orgB: OrgSnapshot
): string[] {
  const recs: string[] = [];

  // Missing conflict protocols
  if (orgA.entities.conflict_protocols.length === 0 && orgB.entities.conflict_protocols.length > 0) {
    recs.push(`Organization A has no conflict protocols. Organization B defines ${orgB.entities.conflict_protocols.length}. Consider adopting conflict handling patterns.`);
  }

  // Missing escalation
  if (!orgA.entities.escalation_hierarchy && orgB.entities.escalation_hierarchy) {
    recs.push('Organization A has no escalation hierarchy. Without defined escalation paths, issues may go unresolved.');
  }

  // Agent count disparity
  if (orgA.entities.agents.length > orgB.entities.agents.length * 1.5) {
    recs.push(`Organization A has ${orgA.entities.agents.length} agents vs B's ${orgB.entities.agents.length}. Larger agent teams need more explicit coordination -- review B's coordination patterns for simplicity insights.`);
  }

  // Failure mode gap
  const failureClaimsA = orgA.claims.filter(c => c.section === 'failure_patterns').length;
  const failureClaimsB = orgB.claims.filter(c => c.section === 'failure_patterns').length;

  if (failureClaimsA === 0 && failureClaimsB > 0) {
    recs.push(`Organization A has no documented failure modes. Organization B has ${failureClaimsB}. Failure patterns are the highest-value transferable intelligence.`);
  }

  // High-value claims available
  const highValueB = orgB.claims.filter(c =>
    c.confidence === 'HIGH' && (c.evidence === 'MEASURED_RESULT' || c.evidence === 'OBSERVED_REPEATEDLY')
  ).length;

  if (highValueB > 3) {
    recs.push(`Organization B has ${highValueB} high-confidence, evidence-backed claims. These are strong candidates for import.`);
  }

  if (recs.length === 0) {
    recs.push('Both organizations have comparable coordination maturity. Review the detailed diff for nuanced differences.');
  }

  return recs;
}

// ---- String Similarity Helper ----

function stringSimilarity(a: string, b: string): number {
  const tokensA = a.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  const tokensB = b.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  if (tokensA.length === 0 && tokensB.length === 0) return 0;

  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  const intersection = [...setA].filter(t => setB.has(t)).length;
  const union = new Set([...setA, ...setB]).size;

  return union > 0 ? intersection / union : 0;
}
