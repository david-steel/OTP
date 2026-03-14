// Graph Extractor -- converts an OOS file (entities + claims) into graph nodes and edges
// Called when an OOS is published. Populates graph_nodes and graph_edges tables.

import type { GraphNode, GraphEdge, NodeType, EdgeType } from './types.js';

interface OOSEntities {
  agents?: Array<Record<string, unknown>>;
  humans?: Array<Record<string, unknown>>;
  systems?: Array<Record<string, unknown>>;
  workflows?: Array<Record<string, unknown>>;
  escalation_hierarchy?: { levels: Array<Record<string, unknown>> };
  conflict_protocols?: Array<Record<string, unknown>>;
  override_rules?: Array<Record<string, unknown>>;
  decisions?: Array<Record<string, unknown>>;
  dependencies?: Array<Record<string, unknown>>;
}

interface OOSClaim {
  claim_id: string;
  section: string;
  rule: string;
  why: string;
  confidence: string;
  evidence: string;
  related_entities?: string[];
}

interface ExtractionResult {
  nodes: Omit<GraphNode, 'id'>[];
  edges: Omit<GraphEdge, 'id'>[];
}

export function extractGraph(
  oosFileId: string,
  orgId: string,
  entities: OOSEntities | null,
  claims: OOSClaim[],
  orgPseudonym: string
): ExtractionResult {
  const nodes: Omit<GraphNode, 'id'>[] = [];
  const edges: Omit<GraphEdge, 'id'>[] = [];

  // Node ID mapping: external_id -> we'll reference by external_id in edges
  // Actual UUID assignment happens at insert time

  // ---- Organization Node (always created) ----
  nodes.push({
    type: 'organization',
    label: orgPseudonym,
    properties: { oosFileId },
    oosFileId,
    orgId,
  });

  // ---- Claims as Knowledge Claim Nodes ----
  for (const claim of claims) {
    nodes.push({
      type: 'knowledge_claim',
      label: claim.rule.substring(0, 200),
      properties: {
        claimId: claim.claim_id,
        section: claim.section,
        rule: claim.rule,
        why: claim.why,
        confidence: claim.confidence,
        evidence: claim.evidence,
      },
      oosFileId,
      orgId,
    });

    // Claim is part_of the organization
    edges.push({
      sourceId: claim.claim_id,  // resolved to UUID at insert
      targetId: 'ORG',
      type: 'part_of',
      properties: { section: claim.section },
      oosFileId,
      weight: 1,
    });
  }

  if (!entities) return { nodes, edges };

  // ---- Agent Nodes ----
  for (const agent of entities.agents || []) {
    nodes.push({
      type: 'agent',
      label: agent.name as string,
      properties: {
        externalId: agent.id,
        role: agent.role,
        mission: agent.mission,
        authorityLevel: agent.authority_level,
        platform: agent.platform,
        status: agent.status,
        inputs: agent.inputs,
        outputs: agent.outputs,
        tools: agent.tools,
        owns: agent.owns,
        doesNotOwn: agent.does_not_own,
      },
      oosFileId,
      orgId,
    });

    // Agent is part_of organization
    edges.push({
      sourceId: agent.id as string,
      targetId: 'ORG',
      type: 'part_of',
      properties: {},
      oosFileId,
      weight: 1,
    });

    // Escalation edges
    if (agent.escalates_to) {
      edges.push({
        sourceId: agent.id as string,
        targetId: agent.escalates_to as string,
        type: 'escalates_to',
        properties: {},
        oosFileId,
        weight: 1,
      });
    }

    // Link agent to its related claims
    for (const claimId of (agent.related_claims || []) as string[]) {
      edges.push({
        sourceId: agent.id as string,
        targetId: claimId,
        type: 'part_of',
        properties: { relationship: 'referenced_in_claim' },
        oosFileId,
        weight: 0.5,
      });
    }

    // System access edges
    if (agent.tools) {
      // We'll link to systems by matching SYS IDs in the tools list or accessed_by
    }
  }

  // ---- Human Nodes ----
  for (const human of entities.humans || []) {
    nodes.push({
      type: 'human',
      label: human.role as string,
      properties: {
        externalId: human.id,
        authorityLevel: human.authority_level,
        approves: human.approves,
      },
      oosFileId,
      orgId,
    });

    // Human is part_of organization
    edges.push({
      sourceId: human.id as string,
      targetId: 'ORG',
      type: 'part_of',
      properties: {},
      oosFileId,
      weight: 1,
    });

    // Override authority edges
    for (const agentId of (human.override_authority || []) as string[]) {
      if (agentId === 'ALL') continue; // Skip wildcard
      edges.push({
        sourceId: human.id as string,
        targetId: agentId,
        type: 'overrides',
        properties: { scope: 'full_authority' },
        oosFileId,
        weight: 1,
      });
    }

    // Receives escalation edges
    for (const agentId of (human.receives_escalations_from || []) as string[]) {
      edges.push({
        sourceId: agentId,
        targetId: human.id as string,
        type: 'escalates_to',
        properties: {},
        oosFileId,
        weight: 1,
      });
    }
  }

  // ---- System Nodes ----
  for (const system of entities.systems || []) {
    nodes.push({
      type: 'system',
      label: system.name as string,
      properties: {
        externalId: system.id,
        systemType: system.type,
        accessMode: system.access_mode,
      },
      oosFileId,
      orgId,
    });

    // Access edges
    for (const agentId of (system.accessed_by || []) as string[]) {
      edges.push({
        sourceId: agentId,
        targetId: system.id as string,
        type: 'accesses',
        properties: { mode: system.access_mode },
        oosFileId,
        weight: 0.5,
      });
    }
  }

  // ---- Workflow Nodes and Step Edges ----
  for (const workflow of entities.workflows || []) {
    nodes.push({
      type: 'process',
      label: workflow.name as string,
      properties: {
        externalId: workflow.id,
        trigger: workflow.trigger,
        frequency: workflow.frequency,
        stepCount: (workflow.steps as unknown[]).length,
      },
      oosFileId,
      orgId,
    });

    const steps = workflow.steps as Array<Record<string, unknown>>;
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];

      // Actor participates in process
      edges.push({
        sourceId: step.actor as string,
        targetId: workflow.id as string,
        type: 'part_of',
        properties: { step: step.order, action: step.action },
        oosFileId,
        weight: 0.5,
      });

      // Handoff edges between sequential steps
      if (step.handoff_to) {
        edges.push({
          sourceId: step.actor as string,
          targetId: step.handoff_to as string,
          type: 'hands_off_to',
          properties: {
            workflow: workflow.id,
            step: step.order,
            output: step.output,
          },
          oosFileId,
          weight: 1,
        });
      }

      // Delegation: if an agent delegates a step output to another
      if (i < steps.length - 1) {
        const nextStep = steps[i + 1];
        if (step.actor !== nextStep.actor) {
          edges.push({
            sourceId: step.actor as string,
            targetId: nextStep.actor as string,
            type: 'delegates_to',
            properties: {
              workflow: workflow.id,
              fromStep: step.order,
              toStep: nextStep.order,
            },
            oosFileId,
            weight: 0.8,
          });
        }
      }
    }
  }

  // ---- Conflict Protocol Edges ----
  for (const conflict of entities.conflict_protocols || []) {
    const parties = conflict.parties as string[];
    if (parties.length >= 2) {
      edges.push({
        sourceId: parties[0],
        targetId: parties[1],
        type: 'conflicts_with',
        properties: {
          conflictId: conflict.id,
          conflictType: conflict.conflict_type,
          detection: conflict.detection,
          resolution: conflict.resolution,
          winner: conflict.winner,
          escalation: conflict.escalation,
        },
        oosFileId,
        weight: 1.5,
      });
    }
  }

  // ---- Override Rule Edges ----
  for (const override of entities.override_rules || []) {
    if ((override.overridden as string) === 'ALL') continue;
    edges.push({
      sourceId: override.overrider as string,
      targetId: override.overridden as string,
      type: 'overrides',
      properties: {
        overrideId: override.id,
        condition: override.condition,
        scope: override.scope,
        reversible: override.reversible,
      },
      oosFileId,
      weight: 1.5,
    });
  }

  // ---- Decision Nodes ----
  for (const decision of entities.decisions || []) {
    nodes.push({
      type: 'decision',
      label: decision.domain as string,
      properties: {
        externalId: decision.id,
        autonomyLevel: decision.autonomy_level,
      },
      oosFileId,
      orgId,
    });

    // Authority edge
    edges.push({
      sourceId: decision.authority as string,
      targetId: decision.id as string,
      type: 'delegates_to',
      properties: { autonomy: decision.autonomy_level },
      oosFileId,
      weight: 1,
    });

    // Approval edge
    if (decision.approval_required_from) {
      edges.push({
        sourceId: decision.approval_required_from as string,
        targetId: decision.id as string,
        type: 'approves',
        properties: {},
        oosFileId,
        weight: 1,
      });
    }
  }

  // ---- Dependency Edges ----
  for (const dep of entities.dependencies || []) {
    edges.push({
      sourceId: dep.source as string,
      targetId: dep.target as string,
      type: 'depends_on',
      properties: {
        dependencyType: dep.type,
        description: dep.description,
        criticality: dep.criticality,
      },
      oosFileId,
      weight: dep.criticality === 'critical' ? 2 : dep.criticality === 'important' ? 1 : 0.5,
    });
  }

  return { nodes, edges };
}
