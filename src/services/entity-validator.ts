import { z } from 'zod';

// ---- Entity Validation Schemas ----
// These validate the entities extension of the OOS format.
// Entities are optional -- the core OOS works without them.
// When present, they must be well-formed.

const agentSchema = z.object({
  id: z.string().regex(/^AGT-\d{3}$/),
  name: z.string().min(1),
  role: z.string().min(1),
  mission: z.string().optional(),
  authority_level: z.enum(['autonomous', 'semi_autonomous', 'supervised', 'advisory']),
  inputs: z.array(z.string()).min(1),
  outputs: z.array(z.string()).min(1),
  tools: z.array(z.string()).optional(),
  owns: z.array(z.string()).optional(),
  does_not_own: z.array(z.string()).optional(),
  escalates_to: z.string().optional(),
  platform: z.string().optional(),
  status: z.enum(['active', 'planned', 'deprecated']).optional(),
  related_claims: z.array(z.string().regex(/^C\d{1,4}$/)).optional(),
});

const humanSchema = z.object({
  id: z.string().regex(/^HMN-\d{3}$/),
  role: z.string().min(1),
  authority_level: z.enum(['executive', 'manager', 'operator', 'reviewer']),
  override_authority: z.array(z.string()).optional(),
  receives_escalations_from: z.array(z.string()).optional(),
  approves: z.array(z.string()).optional(),
  related_claims: z.array(z.string().regex(/^C\d{1,4}$/)).optional(),
});

const systemSchema = z.object({
  id: z.string().regex(/^SYS-\d{3}$/),
  name: z.string().min(1),
  type: z.enum(['database', 'api', 'saas_platform', 'communication', 'storage', 'analytics', 'automation', 'custom']),
  accessed_by: z.array(z.string()).optional(),
  access_mode: z.enum(['read_only', 'read_write', 'write_only']).optional(),
});

const workflowStepSchema = z.object({
  order: z.number().int().positive(),
  actor: z.string().min(1),
  action: z.string().min(1),
  output: z.string().optional(),
  handoff_to: z.string().optional(),
  failure_action: z.string().optional(),
});

const workflowSchema = z.object({
  id: z.string().regex(/^WFL-\d{3}$/),
  name: z.string().min(1),
  trigger: z.string().min(1),
  frequency: z.string().optional(),
  steps: z.array(workflowStepSchema).min(2),
  related_claims: z.array(z.string().regex(/^C\d{1,4}$/)).optional(),
});

const escalationLevelSchema = z.object({
  level: z.number().int().positive(),
  handler: z.string().min(1),
  trigger: z.string().min(1),
  response_time: z.string().optional(),
  authority: z.string().optional(),
});

const escalationHierarchySchema = z.object({
  levels: z.array(escalationLevelSchema).min(2),
  default_escalation_timeout: z.string().optional(),
});

const conflictProtocolSchema = z.object({
  id: z.string().regex(/^CFT-\d{3}$/),
  parties: z.array(z.string()).min(2),
  conflict_type: z.enum(['priority', 'scope', 'resource', 'data', 'strategic']).optional(),
  detection: z.string().optional(),
  resolution: z.string().min(1),
  winner: z.string().optional(),
  escalation: z.string().optional(),
  related_claims: z.array(z.string().regex(/^C\d{1,4}$/)).optional(),
});

const overrideRuleSchema = z.object({
  id: z.string().regex(/^OVR-\d{3}$/),
  overrider: z.string().min(1),
  overridden: z.string().min(1),
  condition: z.string().min(1),
  scope: z.string().optional(),
  reversible: z.boolean().optional(),
  related_claims: z.array(z.string().regex(/^C\d{1,4}$/)).optional(),
});

const decisionSchema = z.object({
  id: z.string().regex(/^DEC-\d{3}$/),
  domain: z.string().min(1),
  authority: z.string().min(1),
  autonomy_level: z.enum(['fully_autonomous', 'semi_autonomous', 'human_required']).optional(),
  approval_required_from: z.string().nullable().optional(),
  escalation_if_uncertain: z.string().nullable().optional(),
});

const dependencySchema = z.object({
  source: z.string().min(1),
  target: z.string().min(1),
  type: z.enum(['data_flow', 'approval', 'trigger', 'shared_resource', 'sequential']),
  description: z.string().optional(),
  criticality: z.enum(['critical', 'important', 'optional']).optional(),
});

// ---- Full Entities Schema ----

export const entitiesSchema = z.object({
  agents: z.array(agentSchema).optional(),
  humans: z.array(humanSchema).optional(),
  systems: z.array(systemSchema).optional(),
  workflows: z.array(workflowSchema).optional(),
  escalation_hierarchy: escalationHierarchySchema.optional(),
  conflict_protocols: z.array(conflictProtocolSchema).optional(),
  override_rules: z.array(overrideRuleSchema).optional(),
  decisions: z.array(decisionSchema).optional(),
  dependencies: z.array(dependencySchema).optional(),
});

// ---- Cross-Reference Validation ----

interface EntityValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateEntityReferences(entities: z.infer<typeof entitiesSchema>): EntityValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Collect all known entity IDs
  const knownIds = new Set<string>();
  for (const agent of entities.agents || []) knownIds.add(agent.id);
  for (const human of entities.humans || []) knownIds.add(human.id);
  for (const system of entities.systems || []) knownIds.add(system.id);
  for (const workflow of entities.workflows || []) knownIds.add(workflow.id);

  // Check all references point to known entities
  for (const agent of entities.agents || []) {
    if (agent.escalates_to && !knownIds.has(agent.escalates_to)) {
      errors.push(`Agent ${agent.id} escalates to unknown entity: ${agent.escalates_to}`);
    }
  }

  for (const human of entities.humans || []) {
    for (const agentId of human.override_authority || []) {
      if (agentId !== 'ALL' && !knownIds.has(agentId)) {
        warnings.push(`Human ${human.id} has override authority for unknown entity: ${agentId}`);
      }
    }
  }

  for (const system of entities.systems || []) {
    for (const agentId of system.accessed_by || []) {
      if (!knownIds.has(agentId)) {
        warnings.push(`System ${system.id} accessed by unknown entity: ${agentId}`);
      }
    }
  }

  for (const workflow of entities.workflows || []) {
    for (const step of workflow.steps) {
      if (!knownIds.has(step.actor)) {
        errors.push(`Workflow ${workflow.id} step ${step.order} references unknown actor: ${step.actor}`);
      }
      if (step.handoff_to && !knownIds.has(step.handoff_to)) {
        warnings.push(`Workflow ${workflow.id} step ${step.order} hands off to unknown entity: ${step.handoff_to}`);
      }
    }
  }

  for (const conflict of entities.conflict_protocols || []) {
    for (const party of conflict.parties) {
      if (!knownIds.has(party)) {
        warnings.push(`Conflict ${conflict.id} references unknown party: ${party}`);
      }
    }
  }

  for (const override of entities.override_rules || []) {
    if (override.overrider !== 'ALL' && !knownIds.has(override.overrider)) {
      errors.push(`Override ${override.id} overrider is unknown: ${override.overrider}`);
    }
    if (override.overridden !== 'ALL' && !knownIds.has(override.overridden)) {
      errors.push(`Override ${override.id} overridden is unknown: ${override.overridden}`);
    }
  }

  for (const dep of entities.dependencies || []) {
    if (!knownIds.has(dep.source)) {
      warnings.push(`Dependency source is unknown: ${dep.source}`);
    }
    if (!knownIds.has(dep.target)) {
      warnings.push(`Dependency target is unknown: ${dep.target}`);
    }
  }

  // Check for orphaned agents (no escalation path, no workflow participation)
  const workflowActors = new Set<string>();
  for (const workflow of entities.workflows || []) {
    for (const step of workflow.steps) {
      workflowActors.add(step.actor);
    }
  }

  for (const agent of entities.agents || []) {
    if (!agent.escalates_to && agent.authority_level !== 'autonomous') {
      warnings.push(`Agent ${agent.id} has no escalation path but is not fully autonomous`);
    }
    if (!workflowActors.has(agent.id)) {
      warnings.push(`Agent ${agent.id} does not participate in any workflow`);
    }
  }

  // Check unique IDs
  const allIds = [
    ...(entities.agents || []).map(a => a.id),
    ...(entities.humans || []).map(h => h.id),
    ...(entities.systems || []).map(s => s.id),
    ...(entities.workflows || []).map(w => w.id),
  ];
  const dupes = allIds.filter((id, i) => allIds.indexOf(id) !== i);
  if (dupes.length > 0) {
    errors.push(`Duplicate entity IDs: ${[...new Set(dupes)].join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
