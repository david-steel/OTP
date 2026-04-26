// Team Graph -- live derivation of team org chart from the latest OOS file.
//
// Source of truth is the OOS rawContent (markdown + YAML frontmatter).
// frontmatter.entities.agents and frontmatter.entities.humans are the canonical
// editable lists. Edges are derived from entity properties (escalates_to,
// override_authority, receives_escalations_from).
//
// Reading prefers the latest DRAFT, falling back to the latest PUBLISHED. This
// lets edits show up immediately on the team chart without waiting for publish.

import { eq, and, desc } from 'drizzle-orm';
import { parse as parseYAML, stringify as stringifyYAML } from 'yaml';
import { db } from '../config/database.js';
import { oosFiles } from '../db/schema.js';
import { parseOOS } from './claim-parser.js';
import type { TemplateType } from '../shared/enums.js';

export type EntityType = 'agent' | 'human';

export interface TeamNode {
  id: string;        // synthetic node id (externalId or 'ORG')
  externalId: string;
  type: 'agent' | 'human' | 'organization';
  label: string;
  properties: Record<string, unknown>;
}

export interface TeamEdge {
  sourceId: string;
  targetId: string;
  type: 'escalates_to' | 'overrides' | 'part_of' | 'reports_to';
  properties: Record<string, unknown>;
}

export interface TeamGraph {
  nodes: TeamNode[];
  edges: TeamEdge[];
  oosFileId: string | null;
  oosStatus: 'draft' | 'published' | null;
  oosVersion: number | null;
  hasDraft: boolean;
  hasPublished: boolean;
}

const FRONTMATTER_SPLIT = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;

export async function loadOrgTeamFiles(orgId: string): Promise<{
  draft: typeof oosFiles.$inferSelect | null;
  published: typeof oosFiles.$inferSelect | null;
}> {
  const rows = await db.select().from(oosFiles)
    .where(eq(oosFiles.orgId, orgId))
    .orderBy(desc(oosFiles.version));
  const draft = rows.find(r => r.status === 'draft') || null;
  const published = rows.find(r => r.status === 'published') || null;
  return { draft, published };
}

function entitiesFromFrontmatter(fm: any): { agents: any[]; humans: any[] } {
  const ents = (fm && fm.entities) || {};
  return {
    agents: Array.isArray(ents.agents) ? ents.agents : [],
    humans: Array.isArray(ents.humans) ? ents.humans : [],
  };
}

export function buildTeamGraph(
  orgLabel: string,
  fm: any
): { nodes: TeamNode[]; edges: TeamEdge[] } {
  const { agents, humans } = entitiesFromFrontmatter(fm);
  const nodes: TeamNode[] = [];
  const edges: TeamEdge[] = [];

  nodes.push({
    id: 'ORG',
    externalId: 'ORG',
    type: 'organization',
    label: orgLabel,
    properties: {},
  });

  for (const a of agents) {
    const id = String(a.id || a.external_id || a.name || '').trim();
    if (!id) continue;
    nodes.push({
      id,
      externalId: id,
      type: 'agent',
      label: String(a.name || id),
      properties: {
        role: a.role,
        mission: a.mission,
        authorityLevel: a.authority_level,
        platform: a.platform,
        status: a.status,
        tools: a.tools,
        owns: a.owns,
        doesNotOwn: a.does_not_own,
        skills: a.skills,
        escalatesTo: a.escalates_to,
      },
    });
    edges.push({ sourceId: id, targetId: 'ORG', type: 'part_of', properties: {} });
    if (a.escalates_to) {
      edges.push({
        sourceId: id,
        targetId: String(a.escalates_to),
        type: 'escalates_to',
        properties: {},
      });
    }
  }

  for (const h of humans) {
    const id = String(h.id || h.external_id || h.name || '').trim();
    if (!id) continue;
    nodes.push({
      id,
      externalId: id,
      type: 'human',
      label: String(h.name || h.role || id),
      properties: {
        role: h.role,
        authorityLevel: h.authority_level,
        approves: h.approves,
        overrideAuthority: h.override_authority,
        receivesEscalationsFrom: h.receives_escalations_from,
        jobDescription: h.job_description,
        skills: h.skills,
        reportsTo: h.reports_to,
      },
    });
    edges.push({ sourceId: id, targetId: 'ORG', type: 'part_of', properties: {} });
    if (h.reports_to) {
      edges.push({ sourceId: id, targetId: String(h.reports_to), type: 'reports_to', properties: {} });
    }
    for (const target of (h.override_authority || []) as string[]) {
      if (target === 'ALL') continue;
      edges.push({ sourceId: id, targetId: String(target), type: 'overrides', properties: {} });
    }
    for (const src of (h.receives_escalations_from || []) as string[]) {
      edges.push({ sourceId: String(src), targetId: id, type: 'escalates_to', properties: {} });
    }
  }

  return { nodes, edges };
}

export async function getOrgTeamGraph(orgId: string, orgLabel: string): Promise<TeamGraph> {
  const { draft, published } = await loadOrgTeamFiles(orgId);
  const source = draft || published;
  if (!source) {
    return {
      nodes: [{ id: 'ORG', externalId: 'ORG', type: 'organization', label: orgLabel, properties: {} }],
      edges: [],
      oosFileId: null,
      oosStatus: null,
      oosVersion: null,
      hasDraft: false,
      hasPublished: !!published,
    };
  }
  const { nodes, edges } = buildTeamGraph(orgLabel, source.frontmatter);
  return {
    nodes,
    edges,
    oosFileId: source.id,
    oosStatus: source.status as 'draft' | 'published',
    oosVersion: source.version,
    hasDraft: !!draft,
    hasPublished: !!published,
  };
}

// ---------- Mutation: edit one entity in the latest editable OOS ----------

export interface EntityPatch {
  name?: string;
  role?: string;
  mission?: string;
  authority_level?: string;
  platform?: string;
  status?: string;
  job_description?: string;
  skills?: string[];
  escalates_to?: string | null;
  reports_to?: string | null;
}

const PATCHABLE_AGENT_KEYS: (keyof EntityPatch)[] = ['name', 'role', 'mission', 'authority_level', 'platform', 'status', 'skills', 'escalates_to'];
const PATCHABLE_HUMAN_KEYS: (keyof EntityPatch)[] = ['name', 'role', 'authority_level', 'job_description', 'skills', 'reports_to'];

export interface MutationResult {
  ok: true;
  oosFileId: string;
  status: 'draft';
  version: number;
  matchedEntityId: string;
}

export class TeamMutationError extends Error {
  constructor(public code: string, message: string, public httpStatus = 400) {
    super(message);
  }
}

function splitFrontmatter(raw: string): { fmText: string; body: string } {
  const m = raw.match(FRONTMATTER_SPLIT);
  if (!m) throw new TeamMutationError('NO_FRONTMATTER', 'OOS rawContent missing YAML frontmatter');
  return { fmText: m[1], body: m[2] };
}

function reassembleRaw(fmObject: any, body: string): string {
  const fmText = stringifyYAML(fmObject, { lineWidth: 0, defaultStringType: 'PLAIN' as any });
  return `---\n${fmText.trimEnd()}\n---\n${body}`;
}

async function getOrCreateEditableDraft(orgId: string): Promise<typeof oosFiles.$inferSelect> {
  const { draft, published } = await loadOrgTeamFiles(orgId);
  if (draft) return draft;
  if (!published) {
    throw new TeamMutationError('NO_OOS', 'Publish an OOS before editing the team chart', 409);
  }
  // Create new draft from latest published, copying rawContent and frontmatter
  return await db.transaction(async (tx) => {
    const rows = await tx.select().from(oosFiles).where(eq(oosFiles.orgId, orgId)).orderBy(desc(oosFiles.version));
    const maxVersion = rows.length ? rows[0].version : 0;
    const [created] = await tx.insert(oosFiles).values({
      orgId,
      name: published.name,
      template: published.template,
      version: maxVersion + 1,
      status: 'draft',
      visibilityDefault: published.visibilityDefault,
      wordCount: published.wordCount,
      claimCount: published.claimCount,
      rawContent: published.rawContent,
      frontmatter: published.frontmatter as any,
      confidenceDistribution: published.confidenceDistribution as any,
      evidenceDistribution: published.evidenceDistribution as any,
      sourceDocumentId: published.sourceDocumentId,
      workspaceId: published.workspaceId,
    }).returning();
    return created;
  });
}

export async function patchTeamEntity(
  orgId: string,
  entityType: EntityType,
  externalId: string,
  rawPatch: Partial<EntityPatch>
): Promise<MutationResult> {
  if (entityType !== 'agent' && entityType !== 'human') {
    throw new TeamMutationError('INVALID_TYPE', 'Type must be "agent" or "human"');
  }
  if (!externalId) throw new TeamMutationError('MISSING_ID', 'externalId is required');

  const allowedKeys = entityType === 'agent' ? PATCHABLE_AGENT_KEYS : PATCHABLE_HUMAN_KEYS;
  const patch: any = {};
  for (const k of allowedKeys) {
    if (k in rawPatch) patch[k] = (rawPatch as any)[k];
  }
  if (Object.keys(patch).length === 0) {
    throw new TeamMutationError('EMPTY_PATCH', 'No editable fields supplied');
  }

  const draft = await getOrCreateEditableDraft(orgId);
  const { fmText, body } = splitFrontmatter(draft.rawContent);
  const fm: any = parseYAML(fmText) || {};
  fm.entities = fm.entities || {};
  const listKey = entityType === 'agent' ? 'agents' : 'humans';
  if (!Array.isArray(fm.entities[listKey])) fm.entities[listKey] = [];

  const list: any[] = fm.entities[listKey];
  const idx = list.findIndex((e: any) => String(e.id || e.external_id || '') === externalId);
  if (idx === -1) {
    throw new TeamMutationError('ENTITY_NOT_FOUND', `${entityType} ${externalId} not in latest draft`, 404);
  }

  const target = list[idx];
  for (const [k, v] of Object.entries(patch)) {
    if (v === null || v === undefined || v === '') {
      delete target[k];
    } else {
      target[k] = v;
    }
  }
  list[idx] = target;
  fm.entities[listKey] = list;

  const newRaw = reassembleRaw(fm, body);
  const parsed = parseOOS(newRaw, draft.template as TemplateType);
  if (parsed.errors.length > 0) {
    const blocking = parsed.errors.find(e => e.code === 'MISSING_FRONTMATTER' || e.code === 'FRONTMATTER_PARSE_ERROR');
    if (blocking) throw new TeamMutationError('REASSEMBLE_FAILED', `Patched OOS no longer parses: ${blocking.message}`, 500);
  }

  // IMPORTANT: parsed.frontmatter is Zod-stripped (oosFrontmatterSchema does
  // not declare `entities`), so using it as the JSONB column would erase the
  // very fields the team chart reads. We persist the YAML-parsed object we
  // mutated directly. wordCount + claimCount still come from parsed since
  // those are derived from the body, not the frontmatter.
  await db.update(oosFiles).set({
    rawContent: newRaw,
    frontmatter: fm as any,
    wordCount: parsed.wordCount,
    claimCount: parsed.claims.length,
    updatedAt: new Date(),
  }).where(and(eq(oosFiles.id, draft.id), eq(oosFiles.orgId, orgId)));

  return {
    ok: true,
    oosFileId: draft.id,
    status: 'draft',
    version: draft.version,
    matchedEntityId: externalId,
  };
}
