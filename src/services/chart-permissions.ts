/**
 * Computes which org-chart tiles a given member is allowed to edit.
 *
 * Rules:
 *   owner / admin / implementer  -> every tile
 *   manager                      -> their own tiles + everyone in the
 *                                   reports_to subtree below them
 *   managee                      -> only their own claimed tiles
 *   observer / inactive / free   -> no edit rights
 *
 * "Their own tiles" means every entry in member.claimedEntityIds, plus
 * the legacy single member.claimedEntityId if present.
 *
 * The whole chart stays visible to everyone -- this helper only governs
 * EDIT rights. View gating is per-feature (data_access toggles, role).
 */
import type { TeamGraph } from './team-graph.js';
import type { Role } from './membership.js';

interface MemberLike {
  role: Role;
  claimedEntityId?: string | null;
  claimedEntityIds?: string[] | null;
}

/**
 * Walk reports_to edges downward from each starting tile, returning the
 * set of every tile reachable -- including the starts themselves. The
 * walk is breadth-first with a visited guard so cycles are safe.
 */
function reportsSubtree(graph: TeamGraph, startIds: string[]): Set<string> {
  const out = new Set<string>(startIds);
  const queue = [...startIds];
  while (queue.length > 0) {
    const node = queue.shift()!;
    for (const edge of graph.edges) {
      if (edge.type !== 'reports_to') continue;
      // edge.sourceId reports_to edge.targetId. We want everyone reporting
      // INTO our current node, then their reports, recursively.
      if (edge.targetId === node && !out.has(edge.sourceId)) {
        out.add(edge.sourceId);
        queue.push(edge.sourceId);
      }
    }
  }
  return out;
}

export function computeEditableTiles(
  member: MemberLike | null,
  graph: TeamGraph,
): Set<string> {
  if (!member) return new Set();

  // Roles with org-wide edit rights bypass chain-of-command.
  if (
    member.role === 'owner' ||
    member.role === 'admin' ||
    member.role === 'implementer'
  ) {
    return new Set(graph.nodes.map(n => n.externalId));
  }

  // Roles with no edit rights at all.
  if (
    member.role === 'observer' ||
    member.role === 'inactive' ||
    member.role === 'free'
  ) {
    return new Set();
  }

  // Collect the member's claimed seats (multi-seat aware).
  const myTiles: string[] = [];
  if (member.claimedEntityIds && Array.isArray(member.claimedEntityIds)) {
    for (const id of member.claimedEntityIds) {
      if (id) myTiles.push(id);
    }
  }
  if (member.claimedEntityId && !myTiles.includes(member.claimedEntityId)) {
    myTiles.push(member.claimedEntityId);
  }

  if (myTiles.length === 0) return new Set();

  // Manager: walks the reports_to subtree from their own seats.
  if (member.role === 'manager') {
    return reportsSubtree(graph, myTiles);
  }

  // Managee / member (legacy): only their own seats. No chain walk.
  return new Set(myTiles);
}

export function canEditTile(
  member: MemberLike | null,
  graph: TeamGraph,
  externalId: string,
): boolean {
  return computeEditableTiles(member, graph).has(externalId);
}
