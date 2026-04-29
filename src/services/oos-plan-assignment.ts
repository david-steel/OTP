// Owner-assignment recommender for OOS Operating Plan execution items.
//
// Deterministic-first per locked design (no LLM in this layer): keyword-overlap
// score across the item (title + outcome + description) and each candidate
// (role + mission + inputs + outputs). Load-balance penalty when a candidate
// is already carrying many active items. Hybrid detection when top two
// candidates score close and one is an agent, one is a human.
//
// Confidence < 70 maps to needs_human_assignment per the spec.
// Sole tiebreak source: data already in OOS frontmatter.entities. We never
// fabricate a candidate that isn't on the org's team graph.

import { eq, and, ne, inArray } from 'drizzle-orm';
import { db } from '../config/database.js';
import { oosExecutionItems } from '../db/schema.js';
import { getOrgTeamGraph } from './team-graph.js';

export interface AssignmentCandidate {
  ownerType: 'employee' | 'agent';
  ownerId: string;          // team-graph externalId (AGT-001 / HUM-001)
  ownerName: string;
  role?: string;
  mission?: string;
  haystack: string;         // pre-tokenized lowercase blob for matching
  authorityLevel?: string;  // for agents only
  currentLoadCount: number; // active items already assigned this quarter
}

export interface AssignmentSourceRef {
  type: 'agent' | 'human';
  id: string;
  matched: string[];
}

export interface AssignmentResult {
  ownerType: 'employee' | 'agent' | 'hybrid' | 'unassigned';
  ownerId: string | null;
  ownerName: string | null;
  secondaryOwnerType?: 'employee' | 'agent' | null;
  secondaryOwnerId?: string | null;
  secondaryOwnerName?: string | null;
  confidence: number;      // 0..100
  reason: string;
  sourceReferences: AssignmentSourceRef[];
  conflicts: string[];
  needsHumanAssignment: boolean;
}

// ---------------------------------------------------------------------------
// Tokenization
// ---------------------------------------------------------------------------

const STOPWORDS = new Set([
  'a','an','and','are','as','at','be','by','for','from','has','have','i','in',
  'is','it','of','on','or','that','the','this','to','was','were','will','with',
  'we','our','you','your','their','they','his','her','its','do','done',
]);

function tokenize(input: string | null | undefined): Set<string> {
  if (!input) return new Set();
  const cleaned = input.toLowerCase().replace(/[^a-z0-9\s_/-]+/g, ' ');
  const out = new Set<string>();
  for (const tok of cleaned.split(/\s+/)) {
    if (tok.length < 3) continue;
    if (STOPWORDS.has(tok)) continue;
    out.add(tok);
  }
  return out;
}

function intersect(a: Set<string>, b: Set<string>): string[] {
  const out: string[] = [];
  for (const x of a) if (b.has(x)) out.push(x);
  return out;
}

// ---------------------------------------------------------------------------
// Candidate loading
// ---------------------------------------------------------------------------

// Load all candidates (agents + humans) from the org's team graph and join
// against existing-load counts so we can apply a load-balance penalty.
export async function loadCandidates(
  orgId: string,
  orgLabel: string,
  planId: string,
  quarter: string,
): Promise<AssignmentCandidate[]> {
  const graph = await getOrgTeamGraph(orgId, orgLabel);
  const candidates: AssignmentCandidate[] = [];

  // Active-item load per owner externalId for the current quarter.
  const activeStatuses: Array<typeof oosExecutionItems.$inferSelect.status> = [
    'proposed', 'accepted', 'in_progress', 'at_risk',
  ];
  const activeItems = await db
    .select()
    .from(oosExecutionItems)
    .where(and(
      eq(oosExecutionItems.planId, planId),
      eq(oosExecutionItems.quarter, quarter),
      inArray(oosExecutionItems.status, activeStatuses),
      ne(oosExecutionItems.assignedOwnerType, 'unassigned'),
    ));
  const loadByOwner = new Map<string, number>();
  for (const item of activeItems) {
    if (!item.assignedOwnerId) continue;
    loadByOwner.set(item.assignedOwnerId, (loadByOwner.get(item.assignedOwnerId) ?? 0) + 1);
  }

  for (const node of graph.nodes) {
    if (node.type !== 'agent' && node.type !== 'human') continue;
    const props = (node.properties || {}) as Record<string, unknown>;
    const role = typeof props.role === 'string' ? props.role : undefined;
    const mission = typeof props.mission === 'string' ? props.mission : undefined;
    const authority = typeof props.authority_level === 'string' ? props.authority_level : undefined;
    const inputs = Array.isArray(props.inputs) ? (props.inputs as string[]).join(' ') : '';
    const outputs = Array.isArray(props.outputs) ? (props.outputs as string[]).join(' ') : '';
    const respons = Array.isArray(props.responsibilities) ? (props.responsibilities as string[]).join(' ') : '';
    const haystack = [node.label, role, mission, inputs, outputs, respons].filter(Boolean).join(' ').toLowerCase();

    candidates.push({
      ownerType: node.type === 'agent' ? 'agent' : 'employee',
      ownerId: node.externalId,
      ownerName: node.label,
      role,
      mission,
      haystack,
      authorityLevel: authority,
      currentLoadCount: loadByOwner.get(node.externalId) ?? 0,
    });
  }

  return candidates;
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

interface ScoredCandidate {
  candidate: AssignmentCandidate;
  rawOverlap: number;       // count of matched tokens
  matched: string[];
  loadPenalty: number;      // 0..0.4
  authorityBoost: number;   // 0..0.15
  finalScore: number;       // 0..100
}

function scoreCandidate(
  itemTokens: Set<string>,
  candidate: AssignmentCandidate,
  itemPriority: string,
): ScoredCandidate {
  const candidateTokens = tokenize(candidate.haystack);
  const matched = intersect(itemTokens, candidateTokens);
  const rawOverlap = matched.length;

  // Base score: scale overlap. ~5 matched tokens = strong signal.
  const base = Math.min(rawOverlap / 5, 1) * 80;

  // Load penalty: each active item over 3 reduces score up to 40%.
  const overload = Math.max(candidate.currentLoadCount - 3, 0);
  const loadPenalty = Math.min(overload * 0.1, 0.4);

  // Authority boost for agents on critical/high items.
  let authorityBoost = 0;
  if (candidate.ownerType === 'agent' && candidate.authorityLevel) {
    if ((itemPriority === 'critical' || itemPriority === 'high')
        && (candidate.authorityLevel === 'autonomous' || candidate.authorityLevel === 'semi_autonomous')) {
      authorityBoost = 0.15;
    }
  }

  let finalScore = base * (1 - loadPenalty) * (1 + authorityBoost);
  // Floor at small positive when there's any overlap so 'unknown but matched' isn't 0.
  if (rawOverlap > 0 && finalScore < 10) finalScore = 10;
  finalScore = Math.max(0, Math.min(100, Math.round(finalScore)));

  return { candidate, rawOverlap, matched, loadPenalty, authorityBoost, finalScore };
}

// ---------------------------------------------------------------------------
// Public recommender
// ---------------------------------------------------------------------------

export interface RecommenderInput {
  title: string;
  description?: string | null;
  outcome?: string | null;
  priority: string;          // 'critical' | 'high' | 'medium' | 'low'
}

export function recommendOwner(
  item: RecommenderInput,
  candidates: AssignmentCandidate[],
): AssignmentResult {
  if (candidates.length === 0) {
    return {
      ownerType: 'unassigned',
      ownerId: null,
      ownerName: null,
      confidence: 0,
      reason: 'No agents or humans found in this org\'s team graph. Define entities in the OOS first.',
      sourceReferences: [],
      conflicts: [],
      needsHumanAssignment: true,
    };
  }

  const itemTokens = tokenize([item.title, item.outcome, item.description].filter(Boolean).join(' '));
  const scored = candidates
    .map(c => scoreCandidate(itemTokens, c, item.priority))
    .sort((a, b) => b.finalScore - a.finalScore);

  const top = scored[0];
  const second = scored[1];

  if (top.finalScore === 0) {
    return {
      ownerType: 'unassigned',
      ownerId: null,
      ownerName: null,
      confidence: 0,
      reason: 'No keyword overlap between this initiative and any team-graph entity.',
      sourceReferences: [],
      conflicts: [],
      needsHumanAssignment: true,
    };
  }

  // Hybrid detection: top is agent, second is human (or vice versa) and within 10 points.
  const closeRunnerUp = second && (top.finalScore - second.finalScore) <= 10 && second.finalScore >= 50;
  const crossType = closeRunnerUp && top.candidate.ownerType !== second!.candidate.ownerType;

  const conflicts: string[] = [];
  if (top.candidate.currentLoadCount >= 5) {
    conflicts.push(`${top.candidate.ownerName} already has ${top.candidate.currentLoadCount} active items this quarter (one-seat-one-owner pressure).`);
  }
  if (closeRunnerUp && !crossType) {
    conflicts.push(`Two ${top.candidate.ownerType}s scored within 10 points (${top.candidate.ownerName} and ${second!.candidate.ownerName}); pick by hand.`);
  }

  const sourceReferences: AssignmentSourceRef[] = [
    { type: top.candidate.ownerType === 'agent' ? 'agent' : 'human', id: top.candidate.ownerId, matched: top.matched },
  ];

  let reason = `Keyword overlap with ${top.candidate.ownerType === 'agent' ? 'agent' : 'role'} "${top.candidate.ownerName}"`;
  if (top.candidate.role) reason += ` (${top.candidate.role})`;
  reason += ` on ${top.matched.length} term${top.matched.length === 1 ? '' : 's'}: ${top.matched.slice(0, 6).join(', ')}.`;
  if (top.authorityBoost > 0) reason += ' Authority boost applied for autonomous/semi-autonomous handling of critical work.';
  if (top.loadPenalty > 0) reason += ` Score reduced ${Math.round(top.loadPenalty * 100)}% for current quarter load.`;

  if (crossType) {
    sourceReferences.push({
      type: second!.candidate.ownerType === 'agent' ? 'agent' : 'human',
      id: second!.candidate.ownerId,
      matched: second!.matched,
    });
    reason += ` Hybrid suggested: ${second!.candidate.ownerName} (${second!.candidate.ownerType}) scored ${second!.finalScore}, within 10 of primary.`;
    return {
      ownerType: 'hybrid',
      ownerId: top.candidate.ownerId,
      ownerName: top.candidate.ownerName,
      secondaryOwnerType: second!.candidate.ownerType,
      secondaryOwnerId: second!.candidate.ownerId,
      secondaryOwnerName: second!.candidate.ownerName,
      confidence: top.finalScore,
      reason,
      sourceReferences,
      conflicts,
      needsHumanAssignment: top.finalScore < 70,
    };
  }

  return {
    ownerType: top.candidate.ownerType,
    ownerId: top.candidate.ownerId,
    ownerName: top.candidate.ownerName,
    confidence: top.finalScore,
    reason,
    sourceReferences,
    conflicts,
    needsHumanAssignment: top.finalScore < 70,
  };
}

// ---------------------------------------------------------------------------
// Bulk recalculate (used by /recalculate-assignments endpoint)
// ---------------------------------------------------------------------------

export interface RecalculateResult {
  itemsConsidered: number;
  recommended: number;
  lowConfidence: number;
  unassigned: number;
  details: Array<{ itemId: string; result: AssignmentResult }>;
}

// Recalculate assignments for all eligible current-quarter items: those that are
// currently unassigned, OR were AI-generated and the user has not modified them.
// Items the user explicitly edited are left alone (per spec: every auto-assignment
// must be editable, and once edited, must not be overwritten).
export async function recalculateAssignments(
  orgId: string,
  orgLabel: string,
  planId: string,
  quarter: string,
): Promise<RecalculateResult> {
  const candidates = await loadCandidates(orgId, orgLabel, planId, quarter);

  const eligibleItems = await db
    .select()
    .from(oosExecutionItems)
    .where(and(
      eq(oosExecutionItems.planId, planId),
      eq(oosExecutionItems.quarter, quarter),
    ));

  const details: Array<{ itemId: string; result: AssignmentResult }> = [];
  let recommended = 0;
  let lowConfidence = 0;
  let unassigned = 0;

  for (const item of eligibleItems) {
    const isUnassigned = item.assignedOwnerType === 'unassigned';
    const isFreshAi = item.createdByAi && !item.userModified;
    if (!isUnassigned && !isFreshAi) continue; // user-modified item: leave alone

    const result = recommendOwner(
      {
        title: item.title,
        description: item.description,
        outcome: item.outcome,
        priority: item.priority,
      },
      candidates,
    );

    await db.update(oosExecutionItems).set({
      assignedOwnerType: result.ownerType,
      assignedOwnerId: result.ownerId,
      assignedOwnerName: result.ownerName,
      secondaryOwnerType: result.secondaryOwnerType ?? null,
      secondaryOwnerId: result.secondaryOwnerId ?? null,
      secondaryOwnerName: result.secondaryOwnerName ?? null,
      confidenceScore: result.confidence,
      assignmentReason: result.reason,
      sourceReferencesJson: result.sourceReferences,
      updatedAt: new Date(),
    }).where(eq(oosExecutionItems.id, item.id));

    details.push({ itemId: item.id, result });
    if (result.ownerType === 'unassigned') unassigned += 1;
    else if (result.needsHumanAssignment) lowConfidence += 1;
    else recommended += 1;
  }

  return {
    itemsConsidered: eligibleItems.length,
    recommended,
    lowConfidence,
    unassigned,
    details,
  };
}
