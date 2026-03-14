// Merge Preview Engine -- READ ONLY
// Shows what WOULD happen if a user imported patterns from another organization.
// No database writes. No actual merge execution. Preview only.
// Merge execution ships in Phase 2. This preview ships in Phase 1 MVP.

import type { ParsedClaim, DiffResult } from '../shared/types.js';
import type { Confidence } from '../shared/enums.js';
import { computeClaimSimilarity } from './similarity.js';

// ---- Types ----

export type MergeAction = 'import' | 'skip' | 'conflict' | 'adapt';
export type UserDecision = 'accept' | 'reject' | 'adapt' | 'pending';

export interface MergeCandidate {
  id: string;                          // Unique candidate ID for UI tracking
  category: 'claim' | 'agent' | 'workflow' | 'escalation' | 'conflict_protocol' | 'override' | 'dependency';
  suggestedAction: MergeAction;
  userDecision: UserDecision;          // Starts as 'pending', user sets via UI

  // The item being considered for import
  source: {
    label: string;                     // Human-readable name
    type: string;                      // Entity type or claim section
    content: Record<string, unknown>;  // Full entity/claim data
    confidence: Confidence | null;
    evidence: string | null;
  };

  // What it conflicts with in the target (if any)
  conflictsWith: {
    label: string;
    type: string;
    content: Record<string, unknown>;
    similarityScore: number;
  } | null;

  // Impact analysis
  impact: {
    changes: string[];                 // What changes if imported
    risks: string[];                   // What could break
    dependencies: string[];            // What else needs to change
    overrideAffected: string[];        // What override rules are affected
  };

  // Merge protocol notes
  reason: string;
  adaptSuggestion: string | null;      // How to adapt instead of importing verbatim
}

export interface MergePreviewResult {
  // Metadata
  sourceOrg: { id: string; name: string };
  targetOrg: { id: string; name: string };
  previewOnly: true;                   // Always true -- no execution in Phase 1

  // Candidates by category
  candidates: MergeCandidate[];

  // Summary
  summary: {
    total: number;
    byCategory: Record<string, number>;
    importable: number;
    conflicts: number;
    skipped: number;
    adaptable: number;
  };

  // Constraints
  budget: {
    currentWordCount: number;
    maxWordCount: number;              // 2x current per merge protocol
    projectedWordCount: number;
    remaining: number;
  };

  // Warnings and recommendations
  warnings: string[];
  recommendations: string[];
}

// ---- Entity Types for Preview ----

interface OrgEntities {
  agents?: Array<Record<string, unknown>>;
  humans?: Array<Record<string, unknown>>;
  workflows?: Array<Record<string, unknown>>;
  escalation_hierarchy?: { levels: Array<Record<string, unknown>> };
  conflict_protocols?: Array<Record<string, unknown>>;
  override_rules?: Array<Record<string, unknown>>;
  dependencies?: Array<Record<string, unknown>>;
}

interface OrgSnapshot {
  id: string;
  name: string;
  wordCount: number;
  entities: OrgEntities | null;
  claims: ParsedClaim[];
}

// ---- Main Preview Generator ----

export function generateMergePreview(
  source: OrgSnapshot,
  target: OrgSnapshot
): MergePreviewResult {
  const candidates: MergeCandidate[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let candidateCounter = 0;

  const maxWords = target.wordCount * 2;
  let projectedWords = target.wordCount;

  // ---- 1. Claim-Level Candidates ----
  for (const sourceClaim of source.claims) {
    // Find best match in target
    let bestMatch: { claim: ParsedClaim; score: number } | null = null;
    for (const targetClaim of target.claims) {
      const { score } = computeClaimSimilarity(sourceClaim, targetClaim);
      if (score > 0.3 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { claim: targetClaim, score };
      }
    }

    const estimatedWords = countClaimWords(sourceClaim);
    const id = `MC-${String(++candidateCounter).padStart(3, '0')}`;

    if (bestMatch && bestMatch.score >= 0.8) {
      // DUPLICATE -- skip silently, don't show as candidate
      continue;
    }

    if (bestMatch && bestMatch.score >= 0.3) {
      // SIMILAR -- conflict candidate
      const adaptSuggestion = generateClaimAdaptation(sourceClaim, bestMatch.claim);

      candidates.push({
        id,
        category: 'claim',
        suggestedAction: 'conflict',
        userDecision: 'pending',
        source: {
          label: `[${sourceClaim.claimId}] ${sourceClaim.rule.substring(0, 80)}...`,
          type: sourceClaim.section,
          content: sourceClaim as unknown as Record<string, unknown>,
          confidence: sourceClaim.confidence,
          evidence: sourceClaim.evidence,
        },
        conflictsWith: {
          label: `[${bestMatch.claim.claimId}] ${bestMatch.claim.rule.substring(0, 80)}...`,
          type: bestMatch.claim.section,
          content: bestMatch.claim as unknown as Record<string, unknown>,
          similarityScore: bestMatch.score,
        },
        impact: {
          changes: [`Would modify or replace your claim ${bestMatch.claim.claimId}`],
          risks: [
            bestMatch.claim.confidence === 'HIGH' && sourceClaim.confidence !== 'HIGH'
              ? `Your existing claim has HIGH confidence. The source claim has ${sourceClaim.confidence}. Importing could weaken your intelligence.`
              : 'Review both versions carefully before deciding.',
          ],
          dependencies: findClaimDependencies(bestMatch.claim, target.claims),
          overrideAffected: [],
        },
        reason: `${Math.round(bestMatch.score * 100)}% overlap with your claim ${bestMatch.claim.claimId}. Different enough to review, similar enough to conflict.`,
        adaptSuggestion,
      });
    } else {
      // UNIQUE -- import candidate
      if (sourceClaim.confidence === 'LOW') {
        candidates.push({
          id,
          category: 'claim',
          suggestedAction: 'skip',
          userDecision: 'pending',
          source: {
            label: `[${sourceClaim.claimId}] ${sourceClaim.rule.substring(0, 80)}...`,
            type: sourceClaim.section,
            content: sourceClaim as unknown as Record<string, unknown>,
            confidence: sourceClaim.confidence,
            evidence: sourceClaim.evidence,
          },
          conflictsWith: null,
          impact: {
            changes: ['Would add a new LOW confidence claim to your OOS'],
            risks: ['LOW confidence claims are skipped by default per merge protocol. Opt in if you believe this is valuable.'],
            dependencies: [],
            overrideAffected: [],
          },
          reason: 'Source claim has LOW confidence. Skipped by default per merge protocol rule 2.',
          adaptSuggestion: null,
        });
        continue;
      }

      if (projectedWords + estimatedWords > maxWords) {
        candidates.push({
          id,
          category: 'claim',
          suggestedAction: 'skip',
          userDecision: 'pending',
          source: {
            label: `[${sourceClaim.claimId}] ${sourceClaim.rule.substring(0, 80)}...`,
            type: sourceClaim.section,
            content: sourceClaim as unknown as Record<string, unknown>,
            confidence: sourceClaim.confidence,
            evidence: sourceClaim.evidence,
          },
          conflictsWith: null,
          impact: {
            changes: [],
            risks: [`Importing would exceed size budget (${projectedWords + estimatedWords} > ${maxWords} words)`],
            dependencies: [],
            overrideAffected: [],
          },
          reason: 'Size budget exceeded. Remove or shorten existing claims to make room.',
          adaptSuggestion: null,
        });
        continue;
      }

      candidates.push({
        id,
        category: 'claim',
        suggestedAction: 'import',
        userDecision: 'pending',
        source: {
          label: `[${sourceClaim.claimId}] ${sourceClaim.rule.substring(0, 80)}...`,
          type: sourceClaim.section,
          content: sourceClaim as unknown as Record<string, unknown>,
          confidence: sourceClaim.confidence,
          evidence: sourceClaim.evidence,
        },
        conflictsWith: null,
        impact: {
          changes: [`Adds new claim to your "${sourceClaim.section}" section`],
          risks: ['Imported claims default to LOW confidence until you validate locally.'],
          dependencies: [],
          overrideAffected: [],
        },
        reason: 'Unique to source organization. No matching pattern in your OOS.',
        adaptSuggestion: null,
      });

      projectedWords += estimatedWords;
    }
  }

  // ---- 2. Agent Candidates (if entities exist) ----
  if (source.entities?.agents && target.entities?.agents) {
    const targetAgentRoles = new Set(
      target.entities.agents.map(a => String(a.role || '').toLowerCase())
    );

    for (const sourceAgent of source.entities.agents) {
      const role = String(sourceAgent.role || '').toLowerCase();
      const name = String(sourceAgent.name || 'Unknown');

      // Check if target has a similar role
      let hasMatch = false;
      let matchDetails: Record<string, unknown> | null = null;

      for (const targetAgent of target.entities.agents) {
        const targetRole = String(targetAgent.role || '').toLowerCase();
        const similarity = jaccardWords(role, targetRole);
        if (similarity > 0.3) {
          hasMatch = true;
          matchDetails = targetAgent;
          break;
        }
      }

      if (!hasMatch) {
        const id = `MC-${String(++candidateCounter).padStart(3, '0')}`;
        candidates.push({
          id,
          category: 'agent',
          suggestedAction: 'adapt',
          userDecision: 'pending',
          source: {
            label: `${name} -- ${sourceAgent.role}`,
            type: String(sourceAgent.authority_level || 'unknown'),
            content: sourceAgent,
            confidence: null,
            evidence: null,
          },
          conflictsWith: null,
          impact: {
            changes: [`Would add a new agent role: "${sourceAgent.role}"`],
            risks: [
              'Adding an agent requires defining authority boundaries, escalation paths, and coordination with existing agents.',
              'Adopting an agent pattern without the supporting coordination rules may create more problems than it solves.',
            ],
            dependencies: findAgentDependencies(sourceAgent, source.entities),
            overrideAffected: findAffectedOverrides(String(sourceAgent.id || ''), source.entities),
          },
          reason: `Source organization has a "${sourceAgent.role}" agent that you don't. Consider whether this capability gap matters for your operations.`,
          adaptSuggestion: `Instead of copying this agent exactly, consider: (1) Can an existing agent absorb this function? (2) Do you need this capability at your current scale? (3) What coordination rules would you need to add?`,
        });
      } else if (matchDetails) {
        // Matched -- check for meaningful differences
        const sourceAuth = String(sourceAgent.authority_level || '');
        const targetAuth = String(matchDetails.authority_level || '');

        if (sourceAuth !== targetAuth) {
          const id = `MC-${String(++candidateCounter).padStart(3, '0')}`;
          candidates.push({
            id,
            category: 'agent',
            suggestedAction: 'conflict',
            userDecision: 'pending',
            source: {
              label: `${name} (${sourceAuth})`,
              type: 'authority_level',
              content: sourceAgent,
              confidence: null,
              evidence: null,
            },
            conflictsWith: {
              label: `${matchDetails.name} (${targetAuth})`,
              type: 'authority_level',
              content: matchDetails,
              similarityScore: 0.7,
            },
            impact: {
              changes: [`Would change authority level from "${targetAuth}" to "${sourceAuth}"`],
              risks: [
                sourceAuth === 'autonomous' && targetAuth !== 'autonomous'
                  ? 'Upgrading to autonomous authority reduces human oversight. Ensure escalation paths exist.'
                  : 'Authority level change affects decision flow and oversight requirements.',
              ],
              dependencies: [],
              overrideAffected: findAffectedOverrides(String(matchDetails.id || ''), target.entities),
            },
            reason: `Similar agent role but different authority levels. Source org gives this role "${sourceAuth}" authority vs your "${targetAuth}".`,
            adaptSuggestion: `Review why the source org chose "${sourceAuth}" authority. Their context may differ from yours. Consider a gradual upgrade with additional safeguards.`,
          });
        }
      }
    }
  }

  // ---- 3. Workflow Candidates ----
  if (source.entities?.workflows && target.entities) {
    const targetWorkflowNames = new Set(
      (target.entities.workflows || []).map(w => String(w.name || '').toLowerCase())
    );

    for (const sourceWf of source.entities.workflows) {
      const name = String(sourceWf.name || 'Unknown');
      const hasMatch = [...targetWorkflowNames].some(
        twn => jaccardWords(name.toLowerCase(), twn) > 0.4
      );

      if (!hasMatch) {
        const steps = (sourceWf.steps as Array<Record<string, unknown>>) || [];
        const id = `MC-${String(++candidateCounter).padStart(3, '0')}`;

        candidates.push({
          id,
          category: 'workflow',
          suggestedAction: 'adapt',
          userDecision: 'pending',
          source: {
            label: `${name} (${steps.length} steps)`,
            type: String(sourceWf.trigger || 'unknown trigger'),
            content: sourceWf,
            confidence: null,
            evidence: null,
          },
          conflictsWith: null,
          impact: {
            changes: [`Would add new workflow: "${name}" with ${steps.length} steps`],
            risks: [
              'Workflows reference specific agents. You may not have all agents this workflow requires.',
              'Adapting the workflow to your agent team is safer than importing verbatim.',
            ],
            dependencies: steps.map(s => String(s.actor || 'unknown')).filter((v, i, a) => a.indexOf(v) === i),
            overrideAffected: [],
          },
          reason: `Source organization has a "${name}" workflow that you don't.`,
          adaptSuggestion: `Map the workflow steps to your existing agents. Replace source agent references with your equivalents. Add failure handling for your context.`,
        });
      }
    }
  }

  // ---- 4. Escalation Hierarchy Candidates ----
  if (source.entities?.escalation_hierarchy && target.entities) {
    const sourceEsc = source.entities.escalation_hierarchy;
    const targetEsc = target.entities.escalation_hierarchy;

    if (!targetEsc && sourceEsc) {
      const id = `MC-${String(++candidateCounter).padStart(3, '0')}`;
      candidates.push({
        id,
        category: 'escalation',
        suggestedAction: 'import',
        userDecision: 'pending',
        source: {
          label: `${sourceEsc.levels.length}-level escalation hierarchy`,
          type: 'escalation_hierarchy',
          content: sourceEsc as unknown as Record<string, unknown>,
          confidence: null,
          evidence: null,
        },
        conflictsWith: null,
        impact: {
          changes: ['Would add a defined escalation hierarchy to your operations'],
          risks: ['You have no escalation hierarchy. This is a significant structural addition. Review each level carefully.'],
          dependencies: sourceEsc.levels.map(l => String(l.handler || '')),
          overrideAffected: [],
        },
        reason: 'You have no defined escalation hierarchy. Source organization has explicit escalation levels. This is a high-priority gap.',
        adaptSuggestion: 'Map escalation handlers to your team. Replace source handler references with your agents/humans. Adjust response times to your context.',
      });

      warnings.push('You have no escalation hierarchy. This is a significant coordination gap. Consider importing or building one.');
    } else if (targetEsc && sourceEsc && sourceEsc.levels.length > targetEsc.levels.length) {
      const id = `MC-${String(++candidateCounter).padStart(3, '0')}`;
      candidates.push({
        id,
        category: 'escalation',
        suggestedAction: 'adapt',
        userDecision: 'pending',
        source: {
          label: `${sourceEsc.levels.length}-level hierarchy (you have ${targetEsc.levels.length})`,
          type: 'escalation_depth',
          content: sourceEsc as unknown as Record<string, unknown>,
          confidence: null,
          evidence: null,
        },
        conflictsWith: {
          label: `Your ${targetEsc.levels.length}-level hierarchy`,
          type: 'escalation_hierarchy',
          content: targetEsc as unknown as Record<string, unknown>,
          similarityScore: 0.5,
        },
        impact: {
          changes: [`Would increase escalation depth from ${targetEsc.levels.length} to ${sourceEsc.levels.length} levels`],
          risks: ['More escalation levels can mean slower resolution. Only add levels where the intermediate authority adds value.'],
          dependencies: [],
          overrideAffected: [],
        },
        reason: `Source org has deeper escalation (${sourceEsc.levels.length} vs ${targetEsc.levels.length} levels). More granular escalation may reduce founder bottleneck.`,
        adaptSuggestion: 'Review the additional levels. Add only the ones where an intermediate handler can actually resolve issues that would otherwise reach the top.',
      });
    }
  }

  // ---- 5. Conflict Protocol Candidates ----
  if (source.entities?.conflict_protocols) {
    const targetConflicts = target.entities?.conflict_protocols || [];
    const targetPartyPairs = new Set(
      targetConflicts.map(c => (c.parties as string[]).sort().join(':'))
    );

    for (const sourceConflict of source.entities.conflict_protocols) {
      const parties = (sourceConflict.parties as string[]).sort().join(':');
      if (!targetPartyPairs.has(parties)) {
        const id = `MC-${String(++candidateCounter).padStart(3, '0')}`;
        candidates.push({
          id,
          category: 'conflict_protocol',
          suggestedAction: 'adapt',
          userDecision: 'pending',
          source: {
            label: `Conflict: ${(sourceConflict.parties as string[]).join(' vs ')}`,
            type: String(sourceConflict.conflict_type || 'untyped'),
            content: sourceConflict,
            confidence: null,
            evidence: null,
          },
          conflictsWith: null,
          impact: {
            changes: [`Would add conflict protocol between ${(sourceConflict.parties as string[]).join(' and ')}`],
            risks: [
              'Conflict protocols reference specific agents. Verify these agent roles exist in your organization.',
              sourceConflict.winner ? `Source org designates "${sourceConflict.winner}" as default winner. This may not match your priority structure.` : '',
            ].filter(Boolean),
            dependencies: sourceConflict.parties as string[],
            overrideAffected: [],
          },
          reason: `Source org has a defined conflict protocol for this agent pair that you don't.`,
          adaptSuggestion: `Map the conflicting parties to your agent equivalents. Review the resolution logic and winner designation for your context.`,
        });
      }
    }
  }

  // ---- 6. Override Rule Candidates ----
  if (source.entities?.override_rules) {
    const targetOverrides = target.entities?.override_rules || [];
    const targetOverridePairs = new Set(
      targetOverrides.map(o => `${o.overrider}:${o.overridden}`)
    );

    for (const sourceOverride of source.entities.override_rules) {
      const pair = `${sourceOverride.overrider}:${sourceOverride.overridden}`;
      if (!targetOverridePairs.has(pair)) {
        const id = `MC-${String(++candidateCounter).padStart(3, '0')}`;
        candidates.push({
          id,
          category: 'override',
          suggestedAction: 'adapt',
          userDecision: 'pending',
          source: {
            label: `${sourceOverride.overrider} overrides ${sourceOverride.overridden}`,
            type: 'override_rule',
            content: sourceOverride,
            confidence: null,
            evidence: null,
          },
          conflictsWith: null,
          impact: {
            changes: [`Would add override: ${sourceOverride.overrider} can override ${sourceOverride.overridden} when "${sourceOverride.condition}"`],
            risks: [
              'Override rules change the authority hierarchy. Ensure this aligns with your escalation structure.',
              sourceOverride.reversible === false ? 'This is a non-reversible override in the source org. Consider making it reversible in your context.' : '',
            ].filter(Boolean),
            dependencies: [String(sourceOverride.overrider), String(sourceOverride.overridden)],
            overrideAffected: [],
          },
          reason: `Source org has an override rule you don't: "${sourceOverride.overrider}" overrides "${sourceOverride.overridden}" when ${sourceOverride.condition}.`,
          adaptSuggestion: `Map the overrider and overridden to your agents. Review the condition -- does this scenario apply to your operations?`,
        });
      }
    }
  }

  // ---- 7. Dependency Candidates ----
  if (source.entities?.dependencies) {
    const targetDeps = target.entities?.dependencies || [];
    const targetDepKeys = new Set(
      targetDeps.map(d => `${d.type}:${d.source}:${d.target}`)
    );

    const criticalSourceDeps = (source.entities.dependencies as Array<Record<string, unknown>>)
      .filter(d => d.criticality === 'critical');

    for (const dep of criticalSourceDeps) {
      // Only surface critical dependencies the target doesn't have
      const key = `${dep.type}:${dep.source}:${dep.target}`;
      if (!targetDepKeys.has(key)) {
        const id = `MC-${String(++candidateCounter).padStart(3, '0')}`;
        candidates.push({
          id,
          category: 'dependency',
          suggestedAction: 'adapt',
          userDecision: 'pending',
          source: {
            label: `${dep.source} ${dep.type} ${dep.target}`,
            type: String(dep.criticality || 'unknown'),
            content: dep,
            confidence: null,
            evidence: null,
          },
          conflictsWith: null,
          impact: {
            changes: [`Would document a critical dependency: ${dep.source} -> ${dep.target}`],
            risks: ['This is marked critical in the source org. If this dependency exists in your org but is undocumented, it may be a blind spot.'],
            dependencies: [String(dep.source), String(dep.target)],
            overrideAffected: [],
          },
          reason: `Source org has a critical dependency you haven't documented. This may be a blind spot.`,
          adaptSuggestion: 'Check if this dependency exists in your organization. If yes, document it. If no, it may indicate a different architecture.',
        });
      }
    }
  }

  // ---- Generate Recommendations ----
  const claimCandidates = candidates.filter(c => c.category === 'claim');
  const entityCandidates = candidates.filter(c => c.category !== 'claim');

  if (entityCandidates.filter(c => c.category === 'agent').length > 0) {
    recommendations.push('New agent patterns detected. Before importing agent roles, ensure your coordination rules and escalation paths can accommodate them.');
  }

  if (candidates.filter(c => c.category === 'escalation').length > 0) {
    recommendations.push('Escalation differences found. Escalation structure affects every other coordination pattern. Review this first.');
  }

  const highConfidenceImports = claimCandidates.filter(
    c => c.suggestedAction === 'import' && c.source.confidence === 'HIGH'
  );
  if (highConfidenceImports.length > 0) {
    recommendations.push(`${highConfidenceImports.length} high-confidence claims available for import. These are the strongest candidates.`);
  }

  const conflictCount = candidates.filter(c => c.suggestedAction === 'conflict').length;
  if (conflictCount > 5) {
    recommendations.push(`${conflictCount} conflicts detected. This many conflicts may indicate fundamentally different operational philosophies. Consider adapting patterns rather than importing.`);
  }

  // Budget warning
  if (projectedWords > maxWords * 0.9) {
    warnings.push(`Approaching size budget limit. ${maxWords - projectedWords} words remaining of ${maxWords} max.`);
  }

  // Disclaimer
  warnings.push('This is a preview only. No changes have been made to your OOS. Accept, reject, or adapt each item, then apply the merge in Phase 2.');

  // ---- Assemble Result ----
  const byCategory: Record<string, number> = {};
  for (const c of candidates) {
    byCategory[c.category] = (byCategory[c.category] || 0) + 1;
  }

  return {
    sourceOrg: { id: source.id, name: source.name },
    targetOrg: { id: target.id, name: target.name },
    previewOnly: true,
    candidates,
    summary: {
      total: candidates.length,
      byCategory,
      importable: candidates.filter(c => c.suggestedAction === 'import').length,
      conflicts: candidates.filter(c => c.suggestedAction === 'conflict').length,
      skipped: candidates.filter(c => c.suggestedAction === 'skip').length,
      adaptable: candidates.filter(c => c.suggestedAction === 'adapt').length,
    },
    budget: {
      currentWordCount: target.wordCount,
      maxWordCount: maxWords,
      projectedWordCount: projectedWords,
      remaining: maxWords - projectedWords,
    },
    warnings,
    recommendations,
  };
}

// ---- Helper Functions ----

function countClaimWords(claim: ParsedClaim): number {
  const text = `${claim.rule} ${claim.why} ${claim.failureMode} ${claim.scope}`;
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

function jaccardWords(a: string, b: string): number {
  const tokensA = new Set(a.toLowerCase().split(/\s+/).filter(t => t.length > 2));
  const tokensB = new Set(b.toLowerCase().split(/\s+/).filter(t => t.length > 2));
  if (tokensA.size === 0 && tokensB.size === 0) return 0;
  const intersection = [...tokensA].filter(t => tokensB.has(t)).length;
  const union = new Set([...tokensA, ...tokensB]).size;
  return union > 0 ? intersection / union : 0;
}

function findClaimDependencies(claim: ParsedClaim, allClaims: ParsedClaim[]): string[] {
  // Find other claims in the same section that might be affected
  return allClaims
    .filter(c => c.section === claim.section && c.claimId !== claim.claimId)
    .map(c => `${c.claimId}: ${c.rule.substring(0, 60)}...`)
    .slice(0, 3);
}

function findAgentDependencies(agent: Record<string, unknown>, entities: OrgEntities): string[] {
  const deps: string[] = [];
  const agentId = String(agent.id || '');

  // Check workflows that reference this agent
  for (const wf of entities.workflows || []) {
    const steps = (wf.steps as Array<Record<string, unknown>>) || [];
    if (steps.some(s => s.actor === agentId)) {
      deps.push(`Workflow "${wf.name}" (${steps.length} steps)`);
    }
  }

  // Check override rules
  for (const ovr of entities.override_rules || []) {
    if (ovr.overrider === agentId || ovr.overridden === agentId) {
      deps.push(`Override: ${ovr.overrider} -> ${ovr.overridden}`);
    }
  }

  return deps;
}

function findAffectedOverrides(entityId: string, entities: OrgEntities | null): string[] {
  if (!entities?.override_rules) return [];
  return (entities.override_rules as Array<Record<string, unknown>>)
    .filter(o => o.overrider === entityId || o.overridden === entityId)
    .map(o => `${o.overrider} overrides ${o.overridden}: ${o.condition}`);
}

function generateClaimAdaptation(source: ParsedClaim, target: ParsedClaim): string {
  if (source.confidence === 'HIGH' && target.confidence !== 'HIGH') {
    return `Source claim has higher confidence (${source.confidence} vs ${target.confidence}). Consider upgrading your claim's evidence to match, rather than replacing it.`;
  }
  if (source.evidence === 'MEASURED_RESULT' && target.evidence !== 'MEASURED_RESULT') {
    return `Source claim is backed by measured results. Consider running your own measurement to validate your version, rather than importing theirs.`;
  }
  return `Both claims address the same topic differently. Consider merging the strongest elements of each into a single claim that reflects your operational context.`;
}
