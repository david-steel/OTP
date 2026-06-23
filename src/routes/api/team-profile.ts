// GET /api/v1/team/:externalId/profile
// Aggregate accountability profile for a single team member (agent or human).
// Returns: identity guess, current ownership counts, full meeting timeline with
// per-meeting contribution counts (rocks owned, todos owned, issues solved).
// One round-trip for both the org-chart drawer and the /team/:externalId page.

import type { FastifyInstance } from 'fastify';
import { eq, and, isNull, sql, desc, asc, gte, lt } from 'drizzle-orm';
import { db } from '../../config/database.js';
import { rocks, todos, tickets, meetings } from '../../db/schema.js';
import { noShadowRocks } from '../../shared/rock-visibility.js';
import { getAuthOrg } from '../../middleware/auth-helpers.js';

export default async function teamProfileRoutes(app: FastifyInstance) {
  app.get<{ Params: { externalId: string } }>('/team/:externalId/profile', async (request, reply) => {
    const org = await getAuthOrg(request);
    if (!org) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });

    const externalId = decodeURIComponent(request.params.externalId);
    if (!externalId || externalId.length > 120) {
      return reply.status(400).send({ error: { code: 'INVALID_PARAM', message: 'externalId required' } });
    }

    // Visibility gate (added 2026-05-27 after audit found this endpoint
    // returned ANY tile's rocks/todos/tickets to any authenticated
    // org_member). Mirrors the chart-scoping rules from commit 2d9358b:
    // owner/admin/implementer see all, manager sees own + reports_to
    // subtree, managee/observer see own tiles only. 404 (not 403) to
    // avoid confirming the tile exists.
    const { computeViewableTiles } = await import('../../services/chart-permissions.js');
    const { getOrgTeamGraph } = await import('../../services/team-graph.js');
    const { getAuth } = await import('@clerk/fastify');
    const team = await getOrgTeamGraph(org.id, org.name || '');
    const _auth = getAuth(request);
    let viewerMember = (request as any).orgMember as { role?: string; claimedEntityId?: string | null; claimedEntityIds?: string[] | null } | null;
    if (!viewerMember && _auth.userId && (org as any).clerkOrgId === _auth.userId) {
      viewerMember = { role: 'owner', claimedEntityId: null, claimedEntityIds: null };
    }
    const viewable = computeViewableTiles(viewerMember as any, team);
    if (!viewable.has(externalId)) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Profile not found' } });
    }

    // ---- Currently owns: rocks, open todos, open issues ----
    const [ownedRocks, ownedTodos, ownedTickets] = await Promise.all([
      db.select().from(rocks).where(and(
        eq(rocks.organizationId, org.id),
        eq(rocks.ownerExternalId, externalId),
        isNull(rocks.deletedAt),
        noShadowRocks(), // never expose someone's shadow rocks on a profile view
      )).orderBy(desc(rocks.dueDate)),
      db.select().from(todos).where(and(
        eq(todos.organizationId, org.id),
        eq(todos.ownerExternalId, externalId),
        isNull(todos.deletedAt),
      )).orderBy(desc(todos.createdAt)),
      db.select().from(tickets).where(and(
        eq(tickets.orgId, org.id),
        eq(tickets.ownerExternalId, externalId),
        isNull(tickets.deletedAt),
      )).orderBy(desc(tickets.createdAt)),
    ]);

    // ---- Meetings timeline: every meeting where this externalId is in attendees ----
    // attendees is jsonb [{entityType, externalId, name}, ...]
    const attendedMeetings = await db.execute(sql`
      SELECT m.* FROM meetings m
      WHERE m.organization_id = ${org.id}
        AND m.deleted_at IS NULL
        AND EXISTS (
          SELECT 1 FROM jsonb_array_elements(m.attendees) AS a
          WHERE a->>'externalId' = ${externalId}
        )
      ORDER BY m.scheduled_at DESC
    `);

    const meetingRows = (attendedMeetings.rows || []) as any[];

    // ---- Per-meeting contribution counts ----
    // For each meeting, count how many todos this person owned (created in that
    // meeting) and how many issues this person owned that got solved in that
    // meeting. Done in two batched group-by queries.
    const meetingIds = meetingRows.map(m => m.id);
    let todosByMeeting: Record<string, number> = {};
    let solvedByMeeting: Record<string, number> = {};

    if (meetingIds.length > 0) {
      const tRes = await db.execute(sql`
        SELECT meeting_id, count(*)::int AS n FROM todos
        WHERE organization_id = ${org.id}
          AND owner_external_id = ${externalId}
          AND deleted_at IS NULL
          AND meeting_id IS NOT NULL
        GROUP BY meeting_id
      `);
      for (const r of (tRes.rows as any[])) todosByMeeting[r.meeting_id] = r.n;

      const sRes = await db.execute(sql`
        SELECT solved_in_meeting_id AS meeting_id, count(*)::int AS n FROM tickets
        WHERE org_id = ${org.id}
          AND owner_external_id = ${externalId}
          AND deleted_at IS NULL
          AND solved_in_meeting_id IS NOT NULL
          AND ids_status = 'solved'
        GROUP BY solved_in_meeting_id
      `);
      for (const r of (sRes.rows as any[])) solvedByMeeting[r.meeting_id] = r.n;
    }

    const now = Date.now();
    const upcoming: any[] = [];
    const past: any[] = [];
    let firstName: string | null = null;
    let entityType: 'agent' | 'human' | null = null;

    for (const m of meetingRows) {
      const isPast = m.status === 'completed' || (m.scheduled_at && new Date(m.scheduled_at).getTime() < now);
      const enriched = {
        id: m.id,
        title: m.title,
        meetingType: m.meeting_type,
        status: m.status,
        scheduledAt: m.scheduled_at,
        startedAt: m.started_at,
        endedAt: m.ended_at,
        contribution: {
          todosOwned: todosByMeeting[m.id] || 0,
          issuesSolved: solvedByMeeting[m.id] || 0,
        },
      };
      if (isPast) past.push(enriched); else upcoming.push(enriched);
      // Pull display name + entityType from the attendees array.
      if (!firstName && Array.isArray(m.attendees)) {
        const me = m.attendees.find((a: any) => a.externalId === externalId);
        if (me) {
          firstName = me.name || externalId;
          entityType = me.entityType || null;
        }
      }
    }

    // If no meetings at all, fall back to checking owned items for entityType + name.
    if (!firstName) {
      const fromRock = ownedRocks.find(r => r.ownerName);
      const fromTodo = ownedTodos.find(t => t.ownerName);
      const fromTicket = ownedTickets.find(t => t.ownerName);
      firstName = fromRock?.ownerName || fromTodo?.ownerName || fromTicket?.ownerName || externalId;
      entityType = fromRock?.ownerEntityType || fromTodo?.ownerEntityType || fromTicket?.ownerEntityType || null;
    }

    upcoming.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
    past.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

    const openTodos = ownedTodos.filter(t => !t.doneAt);
    const openIssues = ownedTickets.filter(t => t.idsStatus !== 'solved');
    const solvedIssues = ownedTickets.filter(t => t.idsStatus === 'solved');

    return {
      profile: {
        externalId,
        name: firstName,
        entityType,
      },
      summary: {
        rocksOwned: ownedRocks.length,
        rocksOnTrack: ownedRocks.filter(r => r.onTrack).length,
        openTodos: openTodos.length,
        completedTodos: ownedTodos.length - openTodos.length,
        openIssues: openIssues.length,
        solvedIssues: solvedIssues.length,
        meetingsUpcoming: upcoming.length,
        meetingsAttended: past.length,
      },
      rocks: ownedRocks,
      todos: ownedTodos,
      tickets: ownedTickets,
      meetings: { upcoming, past },
    };
  });
}
