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
import { oosFiles, charts } from '../db/schema.js';
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

// ---------- Chart resolution ----------

/**
 * Resolve the primary chart for an org. Every org has exactly one primary
 * chart after the ensure-charts.ts backfill — if this returns null, the
 * backfill hasn't run or the org was deleted mid-flight.
 */
export async function getPrimaryChartId(orgId: string): Promise<string | null> {
  const [row] = await db.select({ id: charts.id }).from(charts)
    .where(and(eq(charts.orgId, orgId), eq(charts.isPrimary, true)))
    .limit(1);
  return row?.id || null;
}

/**
 * Confirm a chart belongs to an org. Used as a security check before any
 * chart-scoped mutation — prevents a caller authed for org A from editing
 * org B's chart by passing a foreign chartId.
 */
export async function chartBelongsToOrg(chartId: string, orgId: string): Promise<boolean> {
  const [row] = await db.select({ id: charts.id }).from(charts)
    .where(and(eq(charts.id, chartId), eq(charts.orgId, orgId)))
    .limit(1);
  return !!row;
}

// ---------- OOS file loaders ----------

/**
 * Load draft+published OOS files for a specific chart. During the transition
 * window, legacy files with NULL chart_id are treated as belonging to the
 * org's primary chart (matches the ensure-charts.ts backfill semantics).
 */
export async function loadChartTeamFiles(chartId: string): Promise<{
  draft: typeof oosFiles.$inferSelect | null;
  published: typeof oosFiles.$inferSelect | null;
}> {
  const rows = await db.select().from(oosFiles)
    .where(eq(oosFiles.chartId, chartId))
    .orderBy(desc(oosFiles.version));
  const draft = rows.find(r => r.status === 'draft') || null;
  const published = rows.find(r => r.status === 'published') || null;
  return { draft, published };
}

/**
 * Back-compat shim: resolve the org's primary chart and load its files.
 * Callers that don't yet know about multi-chart (OTP's own /dashboard/team)
 * keep working unchanged.
 */
export async function loadOrgTeamFiles(orgId: string): Promise<{
  draft: typeof oosFiles.$inferSelect | null;
  published: typeof oosFiles.$inferSelect | null;
}> {
  const chartId = await getPrimaryChartId(orgId);
  if (!chartId) return { draft: null, published: null };
  return loadChartTeamFiles(chartId);
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
        mcps: a.mcps,
        maturityLevel: typeof a.maturity_level === 'number' ? a.maturity_level : null,
        escalatesTo: a.escalates_to,
        sops: Array.isArray(a.sops) ? a.sops : [],
        slashCommands: Array.isArray(a.slash_commands) ? a.slash_commands : [],
        runtimeBody: a.runtime_body || null,
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
        mcps: h.mcps,
        maturityLevel: typeof h.maturity_level === 'number' ? h.maturity_level : null,
        reportsTo: h.reports_to,
        sops: Array.isArray(h.sops) ? h.sops : [],
        status: h.status,
        contactEmail: h.contact_email,
        contactPhone: h.contact_phone,
        slackId: h.slack_id,
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

// ---------- Comparison pairs: same-role agents within an org ----------
//
// Cheap heuristic: normalize the role string, take the first two words,
// group agents by that key. Any group with 2+ agents becomes pairs. This
// surfaces the "two of these agents are doing similar work" signal that
// David asked for as dotted comparison lines on the chart.

export interface ComparisonPair {
  a: string;          // node id (externalId)
  b: string;          // node id
  reason: string;     // short label, e.g. "shared role: customer success"
  score: number;      // 0..1, currently 1.0 for word-key match
}

function normalizeRoleKey(role: string | undefined | null): string | null {
  if (!role) return null;
  const cleaned = String(role).toLowerCase().replace(/[^\w\s]/g, ' ').trim().replace(/\s+/g, ' ');
  if (!cleaned) return null;
  const words = cleaned.split(' ').filter(w => w.length > 1); // drop single-letter noise
  if (words.length === 0) return null;
  // First two words (or one if only one) -- captures "customer success", "outbound sales"
  return words.slice(0, 2).join(' ');
}

export function computeAgentComparisonPairs(nodes: TeamNode[]): ComparisonPair[] {
  const agents = nodes.filter(n => n.type === 'agent');
  const groups = new Map<string, TeamNode[]>();
  for (const a of agents) {
    const key = normalizeRoleKey((a.properties as any).role);
    if (!key) continue;
    const list = groups.get(key) || [];
    list.push(a);
    groups.set(key, list);
  }
  const pairs: ComparisonPair[] = [];
  for (const [key, group] of groups.entries()) {
    if (group.length < 2) continue;
    // pair every combination within the group; cap groups at 4 to avoid an
    // O(n^2) line explosion on large charts
    const capped = group.slice(0, 4);
    for (let i = 0; i < capped.length; i++) {
      for (let j = i + 1; j < capped.length; j++) {
        pairs.push({
          a: capped[i].id,
          b: capped[j].id,
          reason: `shared role: ${key}`,
          score: 1.0,
        });
      }
    }
  }
  return pairs;
}

// ---------- Agent context: compile own SOPs + inherited SOPs into markdown ----------
//
// Supports multiple output formats so users on different agent platforms can
// pick the convention they want. The body content is essentially identical
// across formats; the differences are in the title, frontmatter, and the
// suggested filename in Content-Disposition.

export type AgentContextFormat = 'agents-md' | 'claude-md' | 'cursor' | 'generic';

interface AgentContextOptions {
  orgName: string;
  format?: AgentContextFormat;
}

export interface AgentContextResult {
  agentName: string;
  agentRole: string;
  ownSopCount: number;
  inheritedFromName: string | null;
  inheritedSopCount: number;
  markdown: string;
  format: AgentContextFormat;
  filename: string;
}

function renderSopMarkdown(sop: any, prefix: string): string {
  const lines: string[] = [];
  lines.push(`${prefix} ${sop.title || '(untitled SOP)'}`);
  if (sop.trigger) lines.push(`**Trigger:** ${sop.trigger}`);
  if (Array.isArray(sop.steps) && sop.steps.length) {
    lines.push('**Steps:**');
    sop.steps.forEach((s: string, i: number) => lines.push(`${i + 1}. ${s}`));
  }
  if (Array.isArray(sop.outputs) && sop.outputs.length) {
    lines.push('**Outputs:**');
    sop.outputs.forEach((o: string) => lines.push(`- ${o}`));
  }
  if (Array.isArray(sop.tools) && sop.tools.length) {
    lines.push(`**Tools:** ${sop.tools.join(', ')}`);
  }
  if (sop.notes) lines.push(sop.notes);
  return lines.join('\n');
}

export async function buildAgentContext(
  orgId: string,
  agentExternalId: string,
  opts: AgentContextOptions
): Promise<AgentContextResult | null> {
  const { draft, published } = await loadOrgTeamFiles(orgId);
  const source = draft || published;
  if (!source) return null;

  const fm: any = source.frontmatter || {};
  const ents = (fm && fm.entities) || {};
  const agents: any[] = Array.isArray(ents.agents) ? ents.agents : [];
  const humans: any[] = Array.isArray(ents.humans) ? ents.humans : [];

  const agent = agents.find(a => String(a.id || a.external_id || '') === agentExternalId);
  if (!agent) return null;

  // Resolve inheritance: look at escalates_to and follow the chain until we
  // hit a human or run out. Inherit only the immediate-target's SOPs for
  // MVP -- multi-level chain inheritance can come later.
  let parent: any = null;
  let parentType: 'agent' | 'human' | null = null;
  if (agent.escalates_to) {
    parent = humans.find(h => String(h.id || h.external_id || '') === agent.escalates_to);
    if (parent) parentType = 'human';
    else {
      parent = agents.find(a => String(a.id || a.external_id || '') === agent.escalates_to);
      if (parent) parentType = 'agent';
    }
  }
  const ownSops: any[] = Array.isArray(agent.sops) ? agent.sops : [];
  const inheritedSops: any[] = parent && Array.isArray(parent.sops) ? parent.sops : [];

  const format: AgentContextFormat = opts.format || 'agents-md';
  const agentSlug = String(agent.name || agentExternalId).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'agent';
  const filenameByFormat: Record<AgentContextFormat, string> = {
    'agents-md': 'AGENTS.md',
    'claude-md': 'CLAUDE.md',
    'cursor':    `.cursorrules`,
    'generic':   `${agentSlug}-context.md`,
  };

  const lines: string[] = [];

  // Header varies by format. AGENTS.md uses a frontmatter-style block plus a
  // platform-neutral title. CLAUDE.md uses the prior single-title shape.
  if (format === 'agents-md') {
    lines.push('---');
    lines.push(`agent: ${agent.name || agentExternalId}`);
    if (agent.role) lines.push(`role: ${agent.role}`);
    lines.push(`organization: ${opts.orgName}`);
    if (parent) lines.push(`reports_to: ${parent.name || agent.escalates_to}`);
    lines.push(`source: OTP team chart`);
    lines.push('---');
    lines.push('');
    lines.push(`# ${agent.name || agentExternalId}`);
  } else if (format === 'cursor') {
    lines.push(`# Cursor rules for ${agent.name || agentExternalId}`);
  } else if (format === 'generic') {
    lines.push(`# ${agent.name || agentExternalId} -- system prompt`);
  } else {
    // claude-md (legacy default)
    lines.push(`# ${agent.name || agentExternalId} -- agent context`);
  }
  lines.push('');

  if (format !== 'agents-md') {
    lines.push(`**Organization:** ${opts.orgName}`);
    if (agent.role) lines.push(`**Role:** ${agent.role}`);
  }
  if (agent.mission) lines.push(`**Mission:** ${agent.mission}`);
  if (agent.authority_level) lines.push(`**Authority:** ${agent.authority_level}`);
  if (agent.platform) lines.push(`**Platform:** ${agent.platform}`);
  if (agent.status) lines.push(`**Status:** ${agent.status}`);
  if (Array.isArray(agent.skills) && agent.skills.length) lines.push(`**Skills:** ${agent.skills.join(', ')}`);
  if (Array.isArray(agent.mcps) && agent.mcps.length) lines.push(`**MCPs:** ${agent.mcps.join(', ')}`);
  if (typeof agent.maturity_level === 'number') lines.push(`**Maturity:** L${agent.maturity_level} / 8`);
  if (parent && format !== 'agents-md') lines.push(`**Reports to:** ${parent.name || agent.escalates_to} (${parentType})`);
  lines.push('');

  // Connected runtime body (the operator's own CLAUDE.md / system prompt
  // pasted into this agent's tile). Lands first so the org-level frame above
  // gives it scope, but the body's own structure stays intact below.
  if (agent.runtime_body && String(agent.runtime_body).trim()) {
    lines.push('## Connected runtime body');
    lines.push('');
    lines.push('*This block is the runtime body the operator pasted into this agent. It runs alongside the inherited SOPs below.*');
    lines.push('');
    lines.push(String(agent.runtime_body).trim());
    lines.push('');
  }

  if (ownSops.length > 0) {
    lines.push('## Own SOPs');
    lines.push('');
    for (const sop of ownSops) {
      lines.push(renderSopMarkdown(sop, '###'));
      lines.push('');
    }
  }

  if (inheritedSops.length > 0 && parent) {
    lines.push(`## Inherited SOPs from ${parent.name || agent.escalates_to}`);
    lines.push('');
    lines.push(`*These SOPs come from your reporting parent. When the parent updates them, you inherit the change automatically. Follow them unless explicitly overridden.*`);
    lines.push('');
    for (const sop of inheritedSops) {
      lines.push(renderSopMarkdown(sop, '###'));
      lines.push('');
    }
  }

  if (ownSops.length === 0 && inheritedSops.length === 0) {
    lines.push('_No SOPs authored yet for this agent or its parent. Add some via /dashboard/team._');
    lines.push('');
  }

  lines.push('---');
  lines.push('_Generated from OTP team chart. Source of truth: the org\'s OOS draft._');

  return {
    agentName: agent.name || agentExternalId,
    agentRole: agent.role || '',
    ownSopCount: ownSops.length,
    inheritedFromName: parent ? (parent.name || agent.escalates_to) : null,
    inheritedSopCount: inheritedSops.length,
    markdown: lines.join('\n'),
    format,
    filename: filenameByFormat[format],
  };
}

/**
 * Build the team graph for a specific chart. Prefers the latest draft over
 * the latest published — same semantics as the legacy org-scoped getter,
 * just scoped to one chart instead of the org's primary.
 */
export async function getChartTeamGraph(chartId: string, orgLabel: string): Promise<TeamGraph> {
  const { draft, published } = await loadChartTeamFiles(chartId);
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

/**
 * Back-compat shim — resolves the org's primary chart and returns its graph.
 * OTP's /dashboard/team and the original /api/v1/team/graph (no chartId)
 * both go through here.
 */
export async function getOrgTeamGraph(orgId: string, orgLabel: string): Promise<TeamGraph> {
  const chartId = await getPrimaryChartId(orgId);
  if (!chartId) {
    return {
      nodes: [{ id: 'ORG', externalId: 'ORG', type: 'organization', label: orgLabel, properties: {} }],
      edges: [],
      oosFileId: null,
      oosStatus: null,
      oosVersion: null,
      hasDraft: false,
      hasPublished: false,
    };
  }
  return getChartTeamGraph(chartId, orgLabel);
}

// ---------- Mutation: edit one entity in the latest editable OOS ----------

export interface SOPDef {
  id?: string;
  title: string;
  trigger?: string;
  steps?: string[];
  outputs?: string[];
  tools?: string[];
  notes?: string;
}

export interface EntityPatch {
  name?: string;
  role?: string;
  mission?: string;
  authority_level?: string;
  platform?: string;
  status?: string;
  job_description?: string;
  skills?: string[];
  mcps?: string[];
  maturity_level?: number | null;
  escalates_to?: string | null;
  reports_to?: string | null;
  sops?: SOPDef[];
  contact_email?: string | null;
  contact_phone?: string | null;
  slack_id?: string | null;
  runtime_body?: string | null;  // raw CLAUDE.md / system-prompt for an agent
}

const PATCHABLE_AGENT_KEYS: (keyof EntityPatch)[] = ['name', 'role', 'mission', 'authority_level', 'platform', 'status', 'skills', 'mcps', 'maturity_level', 'escalates_to', 'sops', 'runtime_body'];
const PATCHABLE_HUMAN_KEYS: (keyof EntityPatch)[] = ['name', 'role', 'authority_level', 'status', 'job_description', 'skills', 'mcps', 'maturity_level', 'reports_to', 'sops', 'contact_email', 'contact_phone', 'slack_id'];

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

/**
 * Chart-scoped variant: find the latest draft for this chart, or roll forward
 * the latest published into a new draft. The new draft is tagged with the
 * chartId so future loads stay scoped correctly.
 */
async function getOrCreateEditableDraftForChart(
  orgId: string,
  chartId: string,
): Promise<typeof oosFiles.$inferSelect> {
  const { draft, published } = await loadChartTeamFiles(chartId);
  if (draft) return draft;
  if (!published) {
    throw new TeamMutationError('NO_OOS', 'Publish an OOS before editing the team chart', 409);
  }
  // Version numbers are scoped to the org (legacy uniqueIndex on
  // org_id + version), so we still max across the whole org, not just the
  // chart, to avoid collisions with sibling charts.
  return await db.transaction(async (tx) => {
    const rows = await tx.select().from(oosFiles).where(eq(oosFiles.orgId, orgId)).orderBy(desc(oosFiles.version));
    const maxVersion = rows.length ? rows[0].version : 0;
    const [created] = await tx.insert(oosFiles).values({
      orgId,
      chartId,
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

/**
 * Back-compat wrapper: resolves the primary chart for the org and delegates.
 * Pre-Phase-C callers (CSV import endpoints, OTP-internal flows) all enter
 * through here without needing to know about chart_id.
 */
async function getOrCreateEditableDraft(orgId: string): Promise<typeof oosFiles.$inferSelect> {
  const chartId = await getPrimaryChartId(orgId);
  if (!chartId) {
    throw new TeamMutationError('NO_PRIMARY_CHART', 'Org has no primary chart (ensure-charts.ts backfill missing)', 500);
  }
  return getOrCreateEditableDraftForChart(orgId, chartId);
}

/**
 * Shared mutation entry point: resolves the right draft based on whether an
 * explicit chartId was supplied. When supplied, verifies it belongs to the
 * org (security gate). When omitted, falls through to the org's primary
 * chart for back-compat with pre-Phase-C callers.
 */
async function resolveEditableDraft(
  orgId: string,
  chartId?: string,
): Promise<typeof oosFiles.$inferSelect> {
  if (!chartId) return getOrCreateEditableDraft(orgId);
  if (!(await chartBelongsToOrg(chartId, orgId))) {
    throw new TeamMutationError('CHART_NOT_IN_ORG', 'Chart does not belong to this org', 403);
  }
  return getOrCreateEditableDraftForChart(orgId, chartId);
}

export interface CreateEntityInput {
  type: EntityType;
  name: string;
  role?: string;
  contactEmail?: string;
  reportsTo?: string;     // for human
  escalatesTo?: string;   // for agent
  authorityLevel?: string;
}

export async function createTeamEntity(
  orgId: string,
  input: CreateEntityInput,
  chartId?: string,
): Promise<{ ok: true; externalId: string; oosFileId: string; type: EntityType }> {
  if (input.type !== 'agent' && input.type !== 'human') {
    throw new TeamMutationError('INVALID_TYPE', 'Type must be "agent" or "human"');
  }
  const name = String(input.name || '').trim();
  if (!name) throw new TeamMutationError('MISSING_NAME', 'Name is required');

  const draft = await resolveEditableDraft(orgId, chartId);
  const { fmText, body } = splitFrontmatter(draft.rawContent);
  const fm: any = parseYAML(fmText) || {};
  fm.entities = fm.entities || {};
  const listKey = input.type === 'agent' ? 'agents' : 'humans';
  if (!Array.isArray(fm.entities[listKey])) fm.entities[listKey] = [];

  const prefix = input.type === 'agent' ? 'AGT_' : 'HUM_';
  const slug = name.replace(/[^A-Za-z0-9]/g, '').toUpperCase() || 'TILE';
  let externalId = prefix + slug;
  let suffix = 0;
  // Check uniqueness across BOTH lists since externalIds reference each other
  const allIds = new Set<string>([
    ...((fm.entities.agents || []).map((e: any) => String(e.id || ''))),
    ...((fm.entities.humans || []).map((e: any) => String(e.id || ''))),
  ]);
  while (allIds.has(externalId)) {
    suffix++;
    externalId = `${prefix}${slug}_${suffix}`;
  }

  const newEntity: any = { id: externalId, name };
  if (input.role) newEntity.role = String(input.role).trim();
  if (input.authorityLevel) newEntity.authority_level = String(input.authorityLevel).trim();
  if (input.contactEmail && input.type === 'human') newEntity.contact_email = String(input.contactEmail).trim().toLowerCase();
  if (input.reportsTo && input.type === 'human') newEntity.reports_to = input.reportsTo;
  if (input.escalatesTo && input.type === 'agent') newEntity.escalates_to = input.escalatesTo;

  fm.entities[listKey].push(newEntity);

  const newRaw = reassembleRaw(fm, body);
  const parsed = parseOOS(newRaw, draft.template as TemplateType);
  if (parsed.errors.length > 0) {
    const blocking = parsed.errors.find(e => e.code === 'MISSING_FRONTMATTER' || e.code === 'FRONTMATTER_PARSE_ERROR');
    if (blocking) throw new TeamMutationError('REASSEMBLE_FAILED', `OOS no longer parses: ${blocking.message}`, 500);
  }

  await db.update(oosFiles).set({
    rawContent: newRaw,
    frontmatter: fm as any,
    wordCount: parsed.wordCount,
    claimCount: parsed.claims.length,
    updatedAt: new Date(),
  }).where(and(eq(oosFiles.id, draft.id), eq(oosFiles.orgId, orgId)));

  return { ok: true, externalId, oosFileId: draft.id, type: input.type };
}

export async function deleteTeamEntity(
  orgId: string,
  entityType: EntityType,
  externalId: string,
  chartId?: string,
): Promise<{ ok: true; oosFileId: string; status: 'draft'; version: number; removedEntityId: string }> {
  if (entityType !== 'agent' && entityType !== 'human') {
    throw new TeamMutationError('INVALID_TYPE', 'Type must be "agent" or "human"');
  }
  if (!externalId) throw new TeamMutationError('MISSING_ID', 'externalId is required');

  const draft = await resolveEditableDraft(orgId, chartId);
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
  list.splice(idx, 1);
  fm.entities[listKey] = list;

  // Also clean up any escalates_to or reports_to references that pointed at the
  // removed entity, so the chart doesn't dangle.
  for (const a of (fm.entities.agents || [])) {
    if (a.escalates_to === externalId) delete a.escalates_to;
  }
  for (const h of (fm.entities.humans || [])) {
    if (h.reports_to === externalId) delete h.reports_to;
    if (Array.isArray(h.override_authority)) {
      h.override_authority = h.override_authority.filter((id: string) => id !== externalId);
      if (h.override_authority.length === 0) delete h.override_authority;
    }
    if (Array.isArray(h.receives_escalations_from)) {
      h.receives_escalations_from = h.receives_escalations_from.filter((id: string) => id !== externalId);
      if (h.receives_escalations_from.length === 0) delete h.receives_escalations_from;
    }
  }

  const newRaw = reassembleRaw(fm, body);
  const parsed = parseOOS(newRaw, draft.template as TemplateType);
  if (parsed.errors.length > 0) {
    const blocking = parsed.errors.find(e => e.code === 'MISSING_FRONTMATTER' || e.code === 'FRONTMATTER_PARSE_ERROR');
    if (blocking) throw new TeamMutationError('REASSEMBLE_FAILED', `OOS no longer parses after delete: ${blocking.message}`, 500);
  }

  await db.update(oosFiles).set({
    rawContent: newRaw,
    frontmatter: fm as any,
    wordCount: parsed.wordCount,
    claimCount: parsed.claims.length,
    updatedAt: new Date(),
  }).where(and(eq(oosFiles.id, draft.id), eq(oosFiles.orgId, orgId)));

  return { ok: true, oosFileId: draft.id, status: 'draft', version: draft.version, removedEntityId: externalId };
}

export async function patchTeamEntity(
  orgId: string,
  entityType: EntityType,
  externalId: string,
  rawPatch: Partial<EntityPatch>,
  chartId?: string,
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

  const draft = await resolveEditableDraft(orgId, chartId);
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

// ============================================================
// CSV import: bulk upsert humans (and in 'overwrite' mode, delete absent ones)
// ============================================================

export interface ImportRow {
  name: string;
  role?: string;
  contact_email?: string;
  contact_phone?: string;
  slack_id?: string;
  reports_to?: string;       // name OR externalId
  job_description?: string;
  authority_level?: string;
  skills?: string;           // comma-separated
  mcps?: string;             // comma-separated
  status?: string;
}

export interface ImportWarning {
  rowIndex: number;          // 0-based row index (excluding header)
  field: string;
  message: string;
}

export interface ImportResult {
  ok: true;
  created: number;
  updated: number;
  deleted: number;
  warnings: ImportWarning[];
  oosFileId: string;
}

const HUMAN_ID_PATTERN = /^[A-Z0-9_-]{2,120}$/i;

function lc(v: any): string { return String(v || '').trim().toLowerCase(); }

function applyRowToEntity(entity: any, row: ImportRow): void {
  // Name + role + authority always set (allow overwriting on update)
  entity.name = String(row.name).trim();
  if (row.role !== undefined) entity.role = String(row.role).trim() || undefined;
  if (row.authority_level !== undefined) entity.authority_level = String(row.authority_level).trim() || undefined;
  if (row.contact_email !== undefined) {
    const v = String(row.contact_email).trim().toLowerCase();
    if (v) entity.contact_email = v; else delete entity.contact_email;
  }
  if (row.contact_phone !== undefined) {
    const v = String(row.contact_phone).trim();
    if (v) entity.contact_phone = v; else delete entity.contact_phone;
  }
  if (row.slack_id !== undefined) {
    const v = String(row.slack_id).trim();
    if (v) entity.slack_id = v; else delete entity.slack_id;
  }
  if (row.job_description !== undefined) {
    const v = String(row.job_description).trim();
    if (v) entity.job_description = v; else delete entity.job_description;
  }
  if (row.status !== undefined) {
    const v = String(row.status).trim();
    if (v) entity.status = v; else delete entity.status;
  }
  if (row.skills !== undefined) {
    const arr = String(row.skills).split(',').map(s => s.trim()).filter(Boolean);
    entity.skills = arr;
  }
  if (row.mcps !== undefined) {
    const arr = String(row.mcps).split(',').map(s => s.trim()).filter(Boolean);
    entity.mcps = arr;
  }
}

export async function bulkImportHumans(
  orgId: string,
  rows: ImportRow[],
  mode: 'overwrite' | 'addition',
  chartId?: string,
): Promise<ImportResult> {
  if (mode !== 'overwrite' && mode !== 'addition') {
    throw new TeamMutationError('INVALID_MODE', 'mode must be "overwrite" or "addition"');
  }
  if (!Array.isArray(rows)) {
    throw new TeamMutationError('INVALID_ROWS', 'rows must be an array');
  }

  const draft = await resolveEditableDraft(orgId, chartId);
  const { fmText, body } = splitFrontmatter(draft.rawContent);
  const fm: any = parseYAML(fmText) || {};
  fm.entities = fm.entities || {};
  if (!Array.isArray(fm.entities.humans)) fm.entities.humans = [];
  if (!Array.isArray(fm.entities.agents)) fm.entities.agents = [];

  const humans: any[] = fm.entities.humans;
  const agents: any[] = fm.entities.agents;

  // Lookup tables for matching
  const byNameLc = new Map<string, any>();
  const byExternalId = new Map<string, any>();
  for (const h of humans) {
    if (h && h.name) byNameLc.set(lc(h.name), h);
    if (h && h.id) byExternalId.set(String(h.id), h);
  }

  const allUsedIds = new Set<string>([
    ...humans.map(h => String(h?.id || '')),
    ...agents.map(a => String(a?.id || '')),
  ]);

  const warnings: ImportWarning[] = [];
  let created = 0;
  let updated = 0;

  // Track which existing humans the import "claimed" (kept), so we can delete the rest in overwrite mode.
  const seenExistingExternalIds = new Set<string>();

  // First pass: validate names + collect new-row names so reports_to can resolve to siblings in the same batch.
  const validRows: { row: ImportRow; idx: number; nameLc: string }[] = [];
  const batchNameLcSet = new Set<string>();
  rows.forEach((row, idx) => {
    const name = String(row?.name || '').trim();
    if (!name) {
      warnings.push({ rowIndex: idx, field: 'name', message: 'Row skipped: name is required' });
      return;
    }
    const nameLc = lc(name);
    if (batchNameLcSet.has(nameLc)) {
      warnings.push({ rowIndex: idx, field: 'name', message: `Row skipped: duplicate name "${name}" in import` });
      return;
    }
    batchNameLcSet.add(nameLc);
    validRows.push({ row: { ...row, name }, idx, nameLc });
  });

  // Second pass: upsert each row.
  // We resolve reports_to AFTER all upserts so a row can reference another row created in the same batch.
  // To do that, we first do create/update without reports_to, collecting (rowIndex, target) pairs, then resolve.
  type PendingParent = { entity: any; rawValue: string; rowIndex: number };
  const pendingParents: PendingParent[] = [];

  for (const { row, idx, nameLc } of validRows) {
    const existing = byNameLc.get(nameLc);
    if (existing) {
      // Update in place
      applyRowToEntity(existing, row);
      seenExistingExternalIds.add(String(existing.id));
      updated++;
      if (row.reports_to !== undefined) {
        pendingParents.push({ entity: existing, rawValue: String(row.reports_to || '').trim(), rowIndex: idx });
      }
    } else {
      // Create new
      const slug = row.name.replace(/[^A-Za-z0-9]/g, '').toUpperCase() || 'TILE';
      let externalId = 'HUM_' + slug;
      let suffix = 0;
      while (allUsedIds.has(externalId)) {
        suffix++;
        externalId = `HUM_${slug}_${suffix}`;
      }
      allUsedIds.add(externalId);
      const newEntity: any = { id: externalId, name: row.name };
      applyRowToEntity(newEntity, row);
      humans.push(newEntity);
      byNameLc.set(nameLc, newEntity);
      byExternalId.set(externalId, newEntity);
      seenExistingExternalIds.add(externalId);
      created++;
      if (row.reports_to !== undefined) {
        pendingParents.push({ entity: newEntity, rawValue: String(row.reports_to || '').trim(), rowIndex: idx });
      }
    }
  }

  // Resolve reports_to references now that all create/updates are done.
  for (const p of pendingParents) {
    if (!p.rawValue) {
      // Empty -> clear any existing parent
      delete p.entity.reports_to;
      continue;
    }
    // Try name match (existing + batch-created)
    const byName = byNameLc.get(lc(p.rawValue));
    if (byName && byName !== p.entity) {
      p.entity.reports_to = String(byName.id);
      continue;
    }
    // Try externalId
    if (HUMAN_ID_PATTERN.test(p.rawValue)) {
      const byId = byExternalId.get(p.rawValue);
      if (byId && byId !== p.entity) {
        p.entity.reports_to = String(byId.id);
        continue;
      }
    }
    // Self-reference is invalid
    if (byName === p.entity) {
      warnings.push({ rowIndex: p.rowIndex, field: 'reports_to', message: `"${p.rawValue}" refers to the same row -- self-reference ignored` });
      delete p.entity.reports_to;
      continue;
    }
    // Could not resolve
    warnings.push({ rowIndex: p.rowIndex, field: 'reports_to', message: `Could not match "${p.rawValue}" to any human; leaving parent unset` });
    delete p.entity.reports_to;
  }

  // Overwrite mode: delete humans not seen in the import.
  let deleted = 0;
  if (mode === 'overwrite') {
    const removed: string[] = [];
    fm.entities.humans = humans.filter(h => {
      const id = String(h?.id || '');
      if (id && !seenExistingExternalIds.has(id)) {
        removed.push(id);
        return false;
      }
      return true;
    });
    deleted = removed.length;
    // Cascade-clear references from agents (escalates_to) and other humans (reports_to)
    if (removed.length > 0) {
      const removedSet = new Set(removed);
      for (const a of agents) {
        if (a && a.escalates_to && removedSet.has(String(a.escalates_to))) {
          delete a.escalates_to;
        }
      }
      for (const h of fm.entities.humans) {
        if (h && h.reports_to && removedSet.has(String(h.reports_to))) {
          delete h.reports_to;
        }
      }
    }
  }

  // Persist
  const newRaw = reassembleRaw(fm, body);
  const parsed = parseOOS(newRaw, draft.template as TemplateType);
  if (parsed.errors.length > 0) {
    const blocking = parsed.errors.find(e => e.code === 'MISSING_FRONTMATTER' || e.code === 'FRONTMATTER_PARSE_ERROR');
    if (blocking) throw new TeamMutationError('REASSEMBLE_FAILED', `Imported OOS no longer parses: ${blocking.message}`, 500);
  }
  await db.update(oosFiles).set({
    rawContent: newRaw,
    frontmatter: fm as any,
    wordCount: parsed.wordCount,
    claimCount: parsed.claims.length,
    updatedAt: new Date(),
  }).where(and(eq(oosFiles.id, draft.id), eq(oosFiles.orgId, orgId)));

  return {
    ok: true,
    created,
    updated,
    deleted,
    warnings,
    oosFileId: draft.id,
  };
}
