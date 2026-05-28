// Dashboard + settings SSR routes -- extracted from pages.ts in the second
// pass of the god-router split. Every route here was lifted verbatim. The
// only structural changes:
//   - resolveRequestOrg and quarterLabel are imported from pages.ts rather
//     than closed over inside pageRoutes()
//   - BASE_URL / bc / renderV7 / escapeHtml come from _shared
//   - everything else (drizzle, schema, services) is imported just like
//     pages.ts so the route bodies can stay untouched
//
// The 17 routes registered here cover the entire authenticated app surface
// (org admin, CEO scoreboard, OOS operating plan, source documents, team
// review). They share the same /dashboard or /settings URL prefix; no
// /dashboard route remains in pages.ts after this commit.
import type { FastifyInstance } from 'fastify';
import { getAuth } from '@clerk/fastify';
import { eq, and, desc, asc, sql, inArray, or, isNull, isNotNull } from 'drizzle-orm';
import { db } from '../../../config/database.js';
import { organizations, oosFiles, claims, claimSimilarities, apiKeys, bestPractices, oosBestPracticeMatches, consultantProfiles, practiceVotes, newsletterSubscribers, oosOperatingPlans, oosOperatingPlanSections, oosExecutionItems, meetings, rocks, todos, tickets, kpis, kpiValues, partnerSignups, improvements, orgMembers, teams, teamMemberships, meetingHeadlines, managerAgents, seatResponsibilities, seatFitReviews, orgValues, valueReviews } from '../../../db/schema.js';
import { hasOrgWideView, canEditOrgSettings, capabilitiesFor, canIntegrate } from '../../../middleware/permissions.js';
import type { Role } from '../../../services/membership.js';
import { getOrgsForUser, resolveOrgForUser, acceptInvite, MembershipError } from '../../../services/membership.js';
import { computeDiff } from '../../../services/diff-engine.js';
import { generateMergePreview } from '../../../services/merge-preview.js';
import type { ParsedClaim } from '../../../shared/types.js';
import { AGENTIC_LEVEL_LABELS } from '../../../shared/enums.js';
import { validateUuidParam } from '../../../shared/param-validation.js';
import { currentPeriod } from '../../../shared/period.js';
import { renderDescription } from '../../../shared/markdown-lite.js';
import { annotateOosStaleness } from '../../../services/oos-staleness.js';
import { getOrgTeamGraph, computeAgentComparisonPairs } from '../../../services/team-graph.js';
import { calculateCheckup, QUESTIONS as CHECKUP_QUESTIONS, LEVEL_LABELS as CHECKUP_LEVEL_LABELS } from '../../../services/checkup-scoring.js';
import { sendEmail } from '../../../config/email.js';
import { createHash } from 'crypto';
import { aeoClusters } from '../../../data/aeo-clusters.js';
import { isAttendee } from '../../../services/meeting-access.js';
import { ensureUpcomingForOrg, ruleToLabel } from '../../../services/meeting-recurrence.js';
import { BASE_URL, bc, renderV7, escapeHtml } from '../_shared.js';
import { resolveRequestOrg, quarterLabel } from '../pages.js';

// Re-derived inside this module since the original lived inside pageRoutes()
// and is used by a handful of routes here. Same shape as the pages.ts one.
function toParsedClaim(c: any): ParsedClaim {
  return { claimId: c.claimId, section: c.section, displayOrder: c.displayOrder, rule: c.rule, why: c.why, failureMode: c.failureMode, confidence: c.confidence, evidence: c.evidence, scope: c.scope };
}

export default async function dashboardRoutes(app: FastifyInstance) {
  // SUPER-ADMIN DEBUG ENDPOINT (added 2026-05-27 to diagnose Kristen
  // impersonation leak). Returns the resolved state for the current
  // request so we can see what the server actually sees vs what the
  // dashboard handler computes. SAFE to leave in -- super-admin gated
  // so non-admins get 404. Remove after the leak is closed.
  app.get('/api/v1/_debug/dashboard-state', async (request, reply) => {
    const { isSuperAdmin } = await import('../../../middleware/super-admin.js');
    const auth = getAuth(request);
    if (!auth.userId) return reply.status(404).send({ error: 'not found' });
    if (!isSuperAdmin(request)) return reply.status(404).send({ error: 'not found' });

    const imp = (request as any).impersonation || null;
    const orgMember = (request as any).orgMember || null;

    // Resolve org the same way the dashboard does.
    let org: any = null;
    if (orgMember?.orgId) {
      const [m] = await db.select().from(organizations).where(eq(organizations.id, orgMember.orgId)).limit(1);
      if (m) org = m;
    }
    if (!org && auth.userId) {
      const [legacy] = await db.select().from(organizations).where(eq(organizations.clerkOrgId, auth.userId)).limit(1);
      if (legacy) org = legacy;
    }

    // Pull the FULL org_members row for whoever we're effectively viewing as
    // (impersonation target if active, else the session user).
    const effectiveClerkId = imp?.as || auth.userId;
    const [fullRow] = effectiveClerkId
      ? await db.select().from(orgMembers).where(eq(orgMembers.clerkUserId, effectiveClerkId)).limit(1)
      : [null as any];

    // Replicate the dashboard's owner resolution to see what it computes.
    const member = orgMember as any;
    const isLegacyFounder = !!(effectiveClerkId && org && (org as any).clerkOrgId === effectiveClerkId);
    const rawClaimedIds = (member?.claimedEntityIds as string[] | undefined) || [];
    const claimedIds = isLegacyFounder
      ? rawClaimedIds
      : rawClaimedIds.filter((id: string) => id !== 'HUM_DAVIDSTEEL');
    const myExternalId = claimedIds[0] || (member?.email || '');
    const ownerCandidates = Array.from(new Set([
      ...claimedIds,
      ...(member?.email ? [member.email] : []),
      ...(isLegacyFounder ? ['HUM_DAVIDSTEEL'] : []),
    ].filter(Boolean) as string[]));

    // Run the actual myTodos query and return the first 5 with their owners
    // so we can see what's being returned.
    let firstTodos: any[] = [];
    if (ownerCandidates.length > 0 && org) {
      firstTodos = await db.select({
        id: todos.id,
        title: todos.title,
        ownerEntityType: todos.ownerEntityType,
        ownerExternalId: todos.ownerExternalId,
        ownerName: todos.ownerName,
        kind: todos.kind,
        dueAt: todos.dueAt,
        doneAt: todos.doneAt,
      })
        .from(todos)
        .where(and(
          eq(todos.organizationId, org.id),
          isNull(todos.deletedAt),
          inArray(todos.ownerExternalId, ownerCandidates),
          isNull(todos.doneAt),
          isNull(todos.parentTodoId),
          isNull(todos.recurrenceRule),
        ))
        .limit(5);
    }

    // Chart graph diagnostic for the People Review empty-page question.
    // Returns node/edge counts and specifically any reports_to edge whose
    // target is one of the viewer's claimed tiles -- that's the set People
    // Review walks UP from. If that array is empty, the page IS empty
    // because no one's tile reports to the viewer's tile.
    let graphDiagnostic: any = null;
    if (org) {
      try {
        const { getOrgTeamGraph } = await import('../../../services/team-graph.js');
        const _graph = await getOrgTeamGraph(org.id, org.name || '');
        const edgesByType: Record<string, number> = {};
        for (const e of _graph.edges) {
          const t = (e as any).type || 'unknown';
          edgesByType[t] = (edgesByType[t] || 0) + 1;
        }
        const myTileSet = new Set([...rawClaimedIds, ...(fullRow?.claimedEntityId ? [fullRow.claimedEntityId] : [])]);
        const reportsToMe = _graph.edges
          .filter((e: any) => e.type === 'reports_to' && myTileSet.has(e.targetId))
          .map((e: any) => ({ sourceId: e.sourceId, targetId: e.targetId }));
        const sampleReportsToEdges = _graph.edges
          .filter((e: any) => e.type === 'reports_to')
          .slice(0, 10)
          .map((e: any) => ({ sourceId: e.sourceId, targetId: e.targetId }));
        const myTileNodes = _graph.nodes
          .filter((n: any) => myTileSet.has(n.externalId))
          .map((n: any) => ({ externalId: n.externalId, type: n.type, label: n.label }));
        graphDiagnostic = {
          nodeCount: _graph.nodes.length,
          edgeCount: _graph.edges.length,
          edgesByType,
          myTiles: Array.from(myTileSet),
          myTileNodesFoundOnChart: myTileNodes,
          reportsToMyTilesCount: reportsToMe.length,
          reportsToMyTilesSample: reportsToMe.slice(0, 20),
          sampleAnyReportsToEdges: sampleReportsToEdges,
        };
      } catch (e) {
        graphDiagnostic = { error: String((e as Error).message || e) };
      }
    }

    return reply.send({
      session: {
        clerkUserId: auth.userId,
        isSuperAdmin: true,
      },
      impersonation: imp,
      effectiveClerkId,
      orgMemberDecoration: orgMember,
      orgMemberFromDB: fullRow ? {
        id: fullRow.id,
        clerkUserId: fullRow.clerkUserId,
        email: fullRow.email,
        displayName: fullRow.displayName,
        role: fullRow.role,
        claimedEntityId: fullRow.claimedEntityId,
        claimedEntityIds: fullRow.claimedEntityIds,
      } : null,
      org: org ? {
        id: org.id,
        clerkOrgId: org.clerkOrgId,
        name: org.name,
      } : null,
      resolved: {
        isLegacyFounder,
        rawClaimedIds,
        claimedIdsAfterScrub: claimedIds,
        myExternalId,
        ownerCandidates,
      },
      firstTodosReturned: firstTodos,
      graphDiagnostic,
    });
  });

  app.get('/dashboard/members', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) return reply.redirect('/sign-in?redirect=' + encodeURIComponent(request.url));
    const resolved = await resolveOrgForUser(auth.userId);
    if (!resolved) return reply.redirect('/dashboard');
    const { org } = resolved;

    // Impersonation-aware role read (see feedback_otp_orgmember_not_resolveorgforuser).
    // resolveOrgForUser is session-only; orgMember is what guards.ts swaps
    // to the impersonated user's row under "view as <user>".
    const _viewerMembers = (request as any).orgMember as { role?: Role; id?: string; claimedEntityId?: string | null; claimedEntityIds?: string[] | null } | null;
    const viewerRole: Role = (_viewerMembers?.role || resolved.role) as Role;

    const ALLOWED: Role[] = ['owner', 'admin', 'manager', 'integrator', 'visionary', 'implementer'];
    if (!ALLOWED.includes(viewerRole)) {
      return renderV7(reply.status(404), '404', { title: 'Page Not Found - OTP', noindex: true });
    }

    const { listMembers, listPendingInvites } = await import('../../../services/membership.js');
    let members = await listMembers(org.id);
    let invitations = await listPendingInvites(org.id);

    // Non-admin scoping (added 2026-05-27 per David's spec: members should
    // only show her + her direct reports). Tier matches the canonical
    // chart-permissions.ts authority: only owner/admin/implementer are
    // "see-all". Manager/integrator/visionary/managee/member/observer all
    // get scoped to their reports_to subtree. Caught 2026-05-27 when
    // Bogdan (integrator) was incorrectly seeing all teams/members because
    // an earlier sweep widened the skip list to include EOS roles.
    const isAdminLikeMembers = viewerRole === 'owner' || viewerRole === 'admin' || viewerRole === 'implementer';
    if (!isAdminLikeMembers) {
      const { reportsSubtree } = await import('../../../services/chart-permissions.js');
      const { getOrgTeamGraph: _getGraphM } = await import('../../../services/team-graph.js');
      const _graphM = await _getGraphM(org.id, org.name || 'Organization');
      const _myTilesM: string[] = [];
      if (_viewerMembers?.claimedEntityIds && Array.isArray(_viewerMembers.claimedEntityIds)) {
        for (const id of _viewerMembers.claimedEntityIds) if (id) _myTilesM.push(id);
      }
      if (_viewerMembers?.claimedEntityId && !_myTilesM.includes(_viewerMembers.claimedEntityId)) {
        _myTilesM.push(_viewerMembers.claimedEntityId);
      }
      // Defense-in-depth: strip HUM_DAVIDSTEEL for non-founders.
      const _impM = (request as any).impersonation as { as?: string } | null;
      const _effIdM = _impM?.as || auth.userId;
      const _isLegacyM = !!(_effIdM && (org as any).clerkOrgId === _effIdM);
      const _myTilesScrubbedM = _isLegacyM ? _myTilesM : _myTilesM.filter(t => t !== 'HUM_DAVIDSTEEL');
      const _subtreeM = _myTilesScrubbedM.length > 0
        ? reportsSubtree(_graphM, _myTilesScrubbedM)
        : new Set<string>();
      // Always include the viewer's OWN claimed tile in the visible set.
      for (const t of _myTilesScrubbedM) _subtreeM.add(t);

      members = members.filter(m => {
        if (!m.claimedEntityId) return false;
        return _subtreeM.has(m.claimedEntityId);
      });
      invitations = invitations.filter(inv => {
        if (!inv.claimedEntityId) return false;
        return _subtreeM.has(inv.claimedEntityId);
      });
    }
    const { FEATURE_TOGGLES, DATA_TOGGLES, ROLE_DEFAULT_TOGGLES } = await import('../../../data/access-toggles.js');

    // Pull team memberships for every member so the edit modal can pre-fill.
    const memberIds = members.map(m => m.id);
    const memberTeams: Record<string, string[]> = {};
    if (memberIds.length > 0) {
      const tmRows = await db.select({
        memberId: teamMemberships.memberId,
        teamId: teamMemberships.teamId,
      }).from(teamMemberships).where(inArray(teamMemberships.memberId, memberIds));
      for (const r of tmRows) {
        if (!memberTeams[r.memberId]) memberTeams[r.memberId] = [];
        memberTeams[r.memberId].push(r.teamId);
      }
    }

    // Pull the org chart so the inviter can match the new member to a
    // specific accountability tile (HUM_X / AI_X). Filter to human + agent
    // tiles (skip the synthetic ORG root), and flag which are already
    // claimed by an active member or pending invite.
    const team = await getOrgTeamGraph(org.id, org.name || 'Organization');
    const claimedByMember: Record<string, { displayName: string | null; email: string | null; role: string }> = {};
    for (const m of members) {
      if (m.claimedEntityId) {
        claimedByMember[m.claimedEntityId] = {
          displayName: (m as any).displayName || null,
          email: (m as any).email || null,
          role: m.role,
        };
      }
    }
    const claimedByInvite: Record<string, { email: string }> = {};
    for (const inv of invitations) {
      if (inv.claimedEntityId) claimedByInvite[inv.claimedEntityId] = { email: inv.email };
    }
    const chartPositions = team.nodes
      .filter(n => n.type === 'human' || n.type === 'agent')
      .map(n => ({
        externalId: n.externalId,
        label: n.label,
        type: n.type,
        claimedBy: claimedByMember[n.externalId] || null,
        pendingInvite: claimedByInvite[n.externalId] || null,
      }))
      .sort((a, b) => {
        // Humans first, then agents; alpha by label inside each group.
        if (a.type !== b.type) return a.type === 'human' ? -1 : 1;
        return a.label.localeCompare(b.label);
      });

    // Inviters can issue at-or-below their own rank.
    const RANK: Record<Role, number> = {
      owner: 4, visionary: 4, integrator: 4, implementer: 3, admin: 3,
      manager: 2, managee: 1, member: 1, observer: 1, free: 1, inactive: 0,
    };
    const ROLE_LABELS: Record<Role, string> = {
      owner: 'Owner -- full access + can delete the company',
      visionary: 'Visionary -- EOS Visionary (CEO), full access',
      integrator: 'Integrator -- EOS Integrator (operating partner), full access + runs L10',
      admin: 'Admin -- full access except delete',
      manager: 'Manager -- assigned teams, can invite + create teams',
      managee: 'Managee -- assigned teams, edit own items',
      observer: 'Observer -- view-only, cannot own rocks/issues/todos',
      implementer: 'Implementer -- entire company view+edit (cannot own items)',
      free: 'Free -- placeholder seat',
      inactive: 'Inactive -- on the chart only, no app access',
      member: 'Member (legacy)',
    };
    const inviterRank = RANK[viewerRole as Role] ?? 0;
    const PRESENT_ROLES: Role[] = ['owner', 'visionary', 'integrator', 'admin', 'manager', 'managee', 'observer', 'implementer', 'free', 'inactive'];
    const availableRoles = PRESENT_ROLES
      .filter(r => (RANK[r] ?? 0) <= inviterRank)
      .map(r => ({ value: r, label: ROLE_LABELS[r] }));

    const member = (request as any).orgMember;

    // Phase 4: list teams so the invite form can pre-assign team membership.
    const orgTeams = await db.select({
      id: teams.id, name: teams.name, slug: teams.slug, type: teams.type,
    })
      .from(teams)
      .where(eq(teams.orgId, org.id))
      .orderBy(desc(teams.isDefault), teams.name);

    return reply.view('pages/dashboard-members', {
      title: 'Members - Dashboard - OTP',
      description: 'Invite teammates and configure their access.',
      noindex: true,
      org,
      member: member || { role: viewerRole },
      members,
      invitations,
      featureToggles: FEATURE_TOGGLES,
      dataToggles: DATA_TOGGLES,
      availableRoles,
      chartPositions,
      roleDefaults: ROLE_DEFAULT_TOGGLES,
      orgTeams,
      memberTeams,
      isSuperAdmin: (request as any).isSuperAdmin === true,
    });
  });

  // /dashboard/ids -- admin-only cross-team Issues (IDS) view.
  // Lists every open issue across the whole org with a team chip per row
  // and an admin-only mover. Restricted to owner/admin/manager so the
  // private-team data ('David x Dan' issues) doesn't leak to managee
  // viewers who shouldn't see it.
  app.get<{ Querystring: { teamId?: string; idsStatus?: string } }>('/dashboard/ids', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) return reply.redirect('/sign-in?redirect=' + encodeURIComponent(request.url));
    const resolved = await resolveOrgForUser(auth.userId);
    if (!resolved) return reply.redirect('/dashboard');
    const { org } = resolved;
    // Impersonation-aware role read.
    const _viewerIds = (request as any).orgMember as { role?: Role } | null;
    const viewerRole: Role = (_viewerIds?.role || resolved.role) as Role;

    const ALLOWED: Role[] = ['owner', 'admin', 'manager', 'integrator', 'visionary', 'implementer'];
    if (!ALLOWED.includes(viewerRole)) {
      return renderV7(reply.status(404), '404', { title: 'Page Not Found - OTP', noindex: true });
    }

    const filterTeamId = (request.query.teamId || '').toString();
    const filterIdsStatus = (request.query.idsStatus || '').toString();

    const orgTeams = await db
      .select({ id: teams.id, name: teams.name, slug: teams.slug, isDefault: teams.isDefault })
      .from(teams).where(eq(teams.orgId, org.id))
      .orderBy(desc(teams.isDefault), asc(teams.name));

    const conditions = [eq(tickets.orgId, org.id), isNull(tickets.deletedAt)];
    if (filterTeamId && /^[0-9a-f-]{36}$/i.test(filterTeamId)) {
      conditions.push(eq(tickets.teamId, filterTeamId));
    }
    if (['open', 'identified', 'discussed', 'solved'].includes(filterIdsStatus)) {
      conditions.push(eq(tickets.idsStatus, filterIdsStatus as 'open' | 'identified' | 'discussed' | 'solved'));
    } else {
      // Default: open ones (anything not yet solved).
      conditions.push(sql`${tickets.idsStatus} IN ('open', 'identified', 'discussed')`);
    }

    const orgIssues = await db
      .select({
        id: tickets.id,
        title: tickets.title,
        description: tickets.description,
        idsStatus: tickets.idsStatus,
        priority: tickets.priority,
        priorityRank: tickets.priorityRank,
        ownerEntityType: tickets.ownerEntityType,
        ownerExternalId: tickets.ownerExternalId,
        ownerName: tickets.ownerName,
        teamId: tickets.teamId,
        teamName: teams.name,
        createdAt: tickets.createdAt,
      })
      .from(tickets)
      .leftJoin(teams, eq(teams.id, tickets.teamId))
      .where(and(...conditions))
      .orderBy(desc(tickets.createdAt))
      .limit(500);

    return reply.view('pages/dashboard-ids', {
      title: 'Issues (IDS) - Dashboard - OTP',
      noindex: true,
      org,
      viewerRole,
      orgTeams,
      issues: orgIssues,
      filterTeamId,
      filterIdsStatus,
    });
  });

  // /dashboard/teams -- manage teams (create, rename, delete, members)
  app.get('/dashboard/teams', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) return reply.redirect('/sign-in?redirect=' + encodeURIComponent(request.url));
    const resolved = await resolveOrgForUser(auth.userId);
    if (!resolved) return reply.redirect('/dashboard');
    const { org } = resolved;
    // Impersonation-aware role read.
    const _viewerTeams = (request as any).orgMember as { role?: Role; id?: string } | null;
    const viewerRole: Role = (_viewerTeams?.role || resolved.role) as Role;

    const ALLOWED: Role[] = ['owner', 'admin', 'manager', 'integrator', 'visionary', 'implementer'];
    if (!ALLOWED.includes(viewerRole)) {
      return renderV7(reply.status(404), '404', { title: 'Page Not Found - OTP', noindex: true });
    }

    // Non-admin scoping (added 2026-05-27 per David's spec: teams should
    // only show teams the viewer is part of). Tier matches
    // chart-permissions.ts: only owner/admin/implementer skip the
    // scope. Integrator/visionary/manager/etc are scoped to their
    // team_memberships.
    const isAdminLikeTeams = viewerRole === 'owner' || viewerRole === 'admin' || viewerRole === 'implementer';
    let myTeamIdsForFilter: string[] | null = null;
    if (!isAdminLikeTeams && _viewerTeams?.id) {
      const rows = await db.select({ teamId: teamMemberships.teamId })
        .from(teamMemberships)
        .where(eq(teamMemberships.memberId, _viewerTeams.id));
      myTeamIdsForFilter = rows.map(r => r.teamId);
    }

    const orgTeams = myTeamIdsForFilter !== null
      ? (myTeamIdsForFilter.length === 0 ? [] : await db.select().from(teams)
          .where(and(eq(teams.orgId, org.id), inArray(teams.id, myTeamIdsForFilter)))
          .orderBy(desc(teams.isDefault), asc(teams.name)))
      : await db.select().from(teams)
          .where(eq(teams.orgId, org.id))
          .orderBy(desc(teams.isDefault), asc(teams.name));

    // Membership counts + members per team (one round trip, grouped client-side).
    const tmRows = orgTeams.length === 0 ? [] : await db
      .select({
        teamId: teamMemberships.teamId,
        roleOnTeam: teamMemberships.roleOnTeam,
        memberId: orgMembers.id,
        clerkUserId: orgMembers.clerkUserId,
        displayName: orgMembers.displayName,
        email: orgMembers.email,
        orgRole: orgMembers.role,
        status: orgMembers.status,
      })
      .from(teamMemberships)
      .innerJoin(orgMembers, eq(orgMembers.id, teamMemberships.memberId))
      .where(eq(orgMembers.orgId, org.id));

    const { listMembers } = await import('../../../services/membership.js');
    const allMembers = await listMembers(org.id);

    // ----- Enrich names from Clerk for org_members with null display_name -----
    // The team picker showed UUID prefixes (e.g. '1a834f3c') for any member
    // whose org_members row was created without a display_name -- the org
    // owner is the classic case. We hit Clerk to get the real name, fall
    // back to the legacy display, and write back so subsequent loads
    // don't re-fetch.
    const needsClerkLookup = [...allMembers, ...tmRows].some(m =>
      !(m as any).displayName && !(m as any).email && (m as any).clerkUserId?.startsWith('user_')
    );
    const clerkNameByUserId: Record<string, string> = {};
    if (needsClerkLookup) {
      try {
        const { createClerkClient } = await import('@clerk/backend');
        const secretKey = process.env.CLERK_SECRET_KEY!;
        const clerk = createClerkClient({ secretKey });
        const candidates = Array.from(new Set(
          [...allMembers, ...tmRows]
            .map((m: any) => m.clerkUserId)
            .filter((u: string | null) => u && u.startsWith('user_'))
        )) as string[];
        for (const clerkUserId of candidates) {
          try {
            const u = await clerk.users.getUser(clerkUserId);
            const name = [u.firstName, u.lastName].filter(Boolean).join(' ').trim()
              || u.username
              || u.primaryEmailAddress?.emailAddress
              || null;
            const email = u.primaryEmailAddress?.emailAddress || null;
            if (name) clerkNameByUserId[clerkUserId] = name;
            // Write back to org_members so future loads don't need Clerk.
            if (name || email) {
              await db.update(orgMembers)
                .set({
                  displayName: name || undefined,
                  email: email || undefined,
                  updatedAt: new Date(),
                })
                .where(and(
                  eq(orgMembers.clerkUserId, clerkUserId),
                  eq(orgMembers.orgId, org.id),
                ));
            }
          } catch (e) {
            request.log.warn({ clerkUserId, err: (e as Error).message }, 'Failed to fetch Clerk user');
          }
        }
      } catch (err) {
        request.log.warn({ err }, 'Clerk client unavailable -- names will fall back to UUID');
      }
    }

    // Apply enrichment to the rows we'll render.
    function enrich<T extends { displayName?: string | null; clerkUserId?: string | null }>(m: T): T {
      if (!m.displayName && m.clerkUserId && clerkNameByUserId[m.clerkUserId]) {
        return { ...m, displayName: clerkNameByUserId[m.clerkUserId] };
      }
      return m;
    }
    const tmEnriched = tmRows.map(enrich);
    const allMembersEnriched = allMembers.map(enrich);

    const teamsWithMembers = orgTeams.map(t => ({
      ...t,
      members: tmEnriched.filter(r => r.teamId === t.id),
    }));

    // ----- Load chart humans for the picker -----
    // So users can add a chart-only person (no Clerk account yet) to a
    // team. The POST /teams/:id/members handler auto-creates a stub
    // org_members row when given a chart externalId.
    const { getOrgTeamGraph } = await import('../../../services/team-graph.js');
    const teamGraph = await getOrgTeamGraph(org.id, org.name || 'Organization');
    const memberClaimedIds = new Set<string>();
    for (const m of allMembersEnriched) {
      if ((m as any).claimedEntityId) memberClaimedIds.add((m as any).claimedEntityId);
      const ids = (m as any).claimedEntityIds;
      if (Array.isArray(ids)) for (const id of ids) memberClaimedIds.add(id);
    }
    // Include both humans and agents from the chart so AI-agent teams
    // (like an "AI Army" team) can include their agents directly.
    const chartHumans = teamGraph.nodes
      .filter(n => n.type === 'human' && !memberClaimedIds.has(n.externalId))
      .map(n => ({
        externalId: n.externalId,
        label: n.label,
        role: (n.properties as any)?.role || null,
      }));
    const chartAgents = teamGraph.nodes
      .filter(n => n.type === 'agent' && !memberClaimedIds.has(n.externalId))
      .map(n => ({
        externalId: n.externalId,
        label: n.label,
        role: (n.properties as any)?.role || null,
      }));

    return reply.view('pages/dashboard-teams', {
      title: 'Teams - OTP',
      noindex: true,
      org,
      viewerRole,
      teams: teamsWithMembers,
      allMembers: allMembersEnriched,
      chartHumans,
      chartAgents,
    });
  });

  app.get<{ Querystring: { highlightSkill?: string; highlightCommand?: string } }>('/dashboard/team', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) return reply.redirect('/sign-in?redirect=' + encodeURIComponent(request.url));
    const resolved = await resolveOrgForUser(auth.userId);
    if (!resolved) return reply.redirect('/dashboard');
    const { org, role, claimedEntityId } = resolved;
    const highlightSkill = (request.query.highlightSkill || '').toString().slice(0, 120);
    const highlightCommand = (request.query.highlightCommand || '').toString().slice(0, 120);

    let team = await getOrgTeamGraph(org.id, org.name || 'Organization');
    const { SOP_TEMPLATE_GROUPS } = await import('../../../data/sop-templates.js');
    const { SKILLS_CATALOG } = await import('../../../data/skills-catalog.js');
    const { listMembers, listPendingInvites } = await import('../../../services/membership.js');
    const members = await listMembers(org.id);
    const pendingInvites = role === 'owner' ? await listPendingInvites(org.id) : [];

    // claimedTileMap: externalId -> { name, role } for "claimed by" badges
    const claimedTileMap: Record<string, { clerkUserId: string; role: string }> = {};
    for (const m of members) {
      if (m.claimedEntityId) {
        claimedTileMap[m.claimedEntityId] = { clerkUserId: m.clerkUserId, role: m.role };
      }
    }

    // tileTeamsMap: externalId -> [{ teamId, teamName, roleOnTeam }]
    // For each human/agent tile, list the teams it's on so the chart edit
    // panel can render team chips. Walks every claim path: claimedEntityId
    // direct hit, claimedEntityIds array, plus chart-stub members
    // (clerk_user_id LIKE 'chart:<externalId>') that the team-picker
    // auto-created.
    const tileTeamsMap: Record<string, Array<{ teamId: string; teamName: string; roleOnTeam: string }>> = {};
    {
      const tmRows = await db
        .select({
          memberId: orgMembers.id,
          clerkUserId: orgMembers.clerkUserId,
          claimedEntityId: orgMembers.claimedEntityId,
          claimedEntityIds: orgMembers.claimedEntityIds,
          teamId: teamMemberships.teamId,
          teamName: teams.name,
          roleOnTeam: teamMemberships.roleOnTeam,
        })
        .from(teamMemberships)
        .innerJoin(orgMembers, eq(orgMembers.id, teamMemberships.memberId))
        .innerJoin(teams, eq(teams.id, teamMemberships.teamId))
        .where(eq(orgMembers.orgId, org.id));
      for (const row of tmRows) {
        const externalIds = new Set<string>();
        if (row.claimedEntityId) externalIds.add(row.claimedEntityId);
        const ids = (row.claimedEntityIds as unknown) as string[] | null;
        if (Array.isArray(ids)) for (const id of ids) externalIds.add(id);
        // Stub member created by the team-picker: clerk_user_id = 'chart:<EXT>'
        if (row.clerkUserId?.startsWith('chart:')) {
          externalIds.add(row.clerkUserId.slice('chart:'.length));
        }
        for (const ext of externalIds) {
          if (!tileTeamsMap[ext]) tileTeamsMap[ext] = [];
          // Dedupe (claimedEntityId + claimedEntityIds can overlap).
          if (!tileTeamsMap[ext].find(t => t.teamId === row.teamId)) {
            tileTeamsMap[ext].push({ teamId: row.teamId, teamName: row.teamName, roleOnTeam: row.roleOnTeam });
          }
        }
      }
    }

    // pendingInviteByTile: externalId -> { email } so the chart edit panel
    // can show 'invite sent' instead of an active Invite button.
    const pendingInviteByTile: Record<string, { email: string }> = {};
    for (const inv of pendingInvites) {
      if (inv.claimedEntityId) {
        pendingInviteByTile[inv.claimedEntityId] = { email: inv.email };
      }
    }

    // Phase 3 (edit gating) + Phase 4 (view gating, 2026-05-26).
    //   editable: which tiles this viewer can mutate (button states, drag
    //             handles, API write checks). Unchanged from Phase 3.
    //   viewable: which tiles this viewer can SEE at all. Phase 4 flipped
    //             the prior "whole chart visible to everyone" design after
    //             Kristen surfaced that she could see every agent under
    //             David on her first L8. New rules per David: owner/admin/
    //             implementer see all; manager sees own + reports_to
    //             subtree; managee/observer/inactive/free see only own
    //             claimed tiles. Filter applied to BOTH nodes AND edges
    //             before the graph reaches the view.
    const { computeEditableTiles, computeViewableTiles } = await import('../../../services/chart-permissions.js');
    // Resolve viewer's chart-permission context. Legacy founders may not
    // have a row in org_members (their identity comes from organizations.
    // clerkOrgId matching their Clerk user ID); resolveOrgForUser already
    // synthesized their role as 'owner' on `resolved`. Fall back to that
    // synthesized shape so owner gets the full set instead of an empty one.
    const viewerMember = (request as any).orgMember || {
      role: role,
      claimedEntityId: claimedEntityId || null,
    };
    const editableTilesSet = computeEditableTiles(viewerMember, team);
    const editableTiles = Array.from(editableTilesSet);
    const viewableTilesSet = computeViewableTiles(viewerMember, team);

    // Apply view scoping to the graph. Owner/admin/implementer roles get
    // every tile in viewableTilesSet, so they see the unfiltered chart.
    // Lower roles get a strict subset; edges are filtered so dangling
    // arrows don't point off the visible chart.
    const fullNodeCount = team.nodes.length;
    if (viewableTilesSet.size < fullNodeCount) {
      team = {
        ...team,
        nodes: team.nodes.filter(n => viewableTilesSet.has(n.externalId)),
        edges: team.edges.filter(e =>
          viewableTilesSet.has(e.sourceId) && viewableTilesSet.has(e.targetId)
        ),
      };
    }

    return reply.view('pages/dashboard-team', {
      title: 'Team - Dashboard - OTP',
      description: 'Visual org chart of your AI agents and humans. Edit live; changes save to a draft until you publish.',
      noindex: true,
      org,
      viewerRole: role,
      viewerClaimedEntityId: claimedEntityId,
      viewerClaimedEntityIds: viewerMember ? (viewerMember.claimedEntityIds || []) : [],
      editableTiles,
      teamNodes: team.nodes,
      teamEdges: team.edges,
      teamMeta: {
        oosFileId: team.oosFileId,
        oosStatus: team.oosStatus,
        oosVersion: team.oosVersion,
        hasDraft: team.hasDraft,
        hasPublished: team.hasPublished,
      },
      counts: {
        agents: team.nodes.filter(n => n.type === 'agent').length,
        humans: team.nodes.filter(n => n.type === 'human').length,
      },
      sopTemplateGroups: SOP_TEMPLATE_GROUPS,
      skillsCatalog: SKILLS_CATALOG,
      claimedTileMap,
      tileTeamsMap,
      pendingInviteByTile,
      pendingInvites,
      memberCount: members.length,
      comparisonPairs: computeAgentComparisonPairs(team.nodes),
      highlightSkill,
      highlightCommand,
    });
  });

  // Dashboard: KPI Scoreboard (Phase 3 + Phase 5)
  app.get<{ Querystring: { grain?: string; view?: string } }>('/dashboard/kpis', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) return reply.redirect('/sign-in?redirect=' + encodeURIComponent(request.url));
    const resolved = await resolveOrgForUser(auth.userId);
    if (!resolved) return reply.redirect('/dashboard');
    // resolveOrgForUser uses auth.userId and is impersonation-BLIND -- under
    // super-admin "view as <user>" it returns the admin's role, not the
    // impersonated user's. The admin-bypass check below MUST read from
    // request.orgMember (guards.ts swaps that to the impersonated row).
    // See feedback_otp_orgmember_not_resolveorgforuser.md for the rule.
    const { org } = resolved;
    const _viewerKpiMember = (request as any).orgMember as { role?: Role } | null;
    const role: Role = (_viewerKpiMember?.role || resolved.role) as Role;

    const team = await getOrgTeamGraph(org.id, org.name || 'Organization');
    const { listKpis, getScoreboard } = await import('../../../services/kpi.js');
    const { formatPeriodLabel } = await import('../../../services/kpi-periods.js');

    let allKpis = await listKpis(org.id, {});

    // Scope KPIs to the viewer (added 2026-05-27).
    //   owner / admin / implementer  -> full org KPI list
    //   manager / managee / member   -> KPIs they own (by claimed tile)
    //                                   UNION KPIs on teams they belong to
    // Without this, every invited member saw the entire org's scorecard.
    // Same impersonation-aware founder check as the dashboard handler:
    // when an admin "views as Kristen", the founder fallback must NOT
    // fire against the admin's session.
    const isAdminLikeKpis = role === 'owner' || role === 'admin' || role === 'implementer';
    if (!isAdminLikeKpis) {
      const viewerMemberKpis = (request as any).orgMember as { id?: string; claimedEntityId?: string | null; claimedEntityIds?: string[] | null } | null;
      const impKpis = (request as any).impersonation as { as?: string } | null;
      const effectiveClerkIdKpis = impKpis?.as || auth.userId;
      const isLegacyFounderKpis = !!(effectiveClerkIdKpis && (org as any).clerkOrgId === effectiveClerkIdKpis);

      const rawClaimsKpis: string[] = [];
      if (viewerMemberKpis?.claimedEntityIds && Array.isArray(viewerMemberKpis.claimedEntityIds)) {
        for (const id of viewerMemberKpis.claimedEntityIds) if (typeof id === 'string' && id) rawClaimsKpis.push(id);
      }
      if (viewerMemberKpis?.claimedEntityId && !rawClaimsKpis.includes(viewerMemberKpis.claimedEntityId)) {
        rawClaimsKpis.push(viewerMemberKpis.claimedEntityId);
      }
      const claimedSetKpis = new Set(
        isLegacyFounderKpis
          ? rawClaimsKpis
          : rawClaimsKpis.filter(id => id !== 'HUM_DAVIDSTEEL'),
      );

      const myTeamRowsKpis = viewerMemberKpis?.id
        ? await db.select({ teamId: teamMemberships.teamId })
            .from(teamMemberships)
            .where(eq(teamMemberships.memberId, viewerMemberKpis.id))
        : [];
      const myTeamIdsKpis = new Set(myTeamRowsKpis.map(r => r.teamId));

      allKpis = allKpis.filter(k =>
        (k.ownerExternalId && claimedSetKpis.has(k.ownerExternalId))
        || (k.teamId && myTeamIdsKpis.has(k.teamId)),
      );
    }

    const groupNames = Array.from(new Set(allKpis.map(k => k.groupName).filter((g): g is string => !!g)));

    const grainQ = String(request.query.grain || 'weekly').toLowerCase();
    const grain = (['weekly', 'monthly', 'quarterly', 'annual'].includes(grainQ) ? grainQ : 'weekly') as
      'weekly' | 'monthly' | 'quarterly' | 'annual';
    const viewQ = String(request.query.view || 'grid').toLowerCase();
    const view = viewQ === 'trends' ? 'trends' : 'grid';

    // Default date range per grain
    const now = new Date();
    let from: Date;
    if (grain === 'weekly') from = new Date(now.getTime() - 13 * 7 * 86400000);
    else if (grain === 'monthly') from = new Date(now.getUTCFullYear(), now.getUTCMonth() - 11, 1);
    else if (grain === 'quarterly') from = new Date(now.getUTCFullYear() - 2, now.getUTCMonth(), 1);
    else from = new Date(now.getUTCFullYear() - 4, 0, 1);

    const scoreboard = await getScoreboard(org.id, { timeGrain: grain, from, to: now });

    // Mirror the allKpis scoping onto the scoreboard rows. allKpis above is
    // the source of truth for "what this viewer can see"; the scoreboard
    // pulled the full org list (the kpi service doesn't take an ID array
    // filter today), so drop rows whose kpiId isn't in the visible set.
    if (!isAdminLikeKpis && Array.isArray((scoreboard as any).rows)) {
      const visibleKpiIdSet = new Set(allKpis.map(k => k.id));
      (scoreboard as any).rows = (scoreboard as any).rows.filter((r: any) =>
        r && typeof r.kpiId === 'string' && visibleKpiIdSet.has(r.kpiId),
      );
    }

    // Render with latest period on the LEFT (most recent first). Reverse both
    // the periods array and each row's per-period values so indices stay aligned.
    scoreboard.periods.reverse();
    if (Array.isArray((scoreboard as any).rows)) {
      for (const row of (scoreboard as any).rows) {
        if (Array.isArray(row.periods)) row.periods.reverse();
      }
    }
    const periodLabels = scoreboard.periods.map(p =>
      formatPeriodLabel(grain, { start: new Date(p.start), end: new Date(p.end) }),
    );

    // Pass org teams so the view can render team chips + an admin-only
    // 'move to team' dropdown on each KPI row.
    const orgTeamsKpi = await db
      .select({ id: teams.id, name: teams.name, slug: teams.slug, isDefault: teams.isDefault })
      .from(teams)
      .where(eq(teams.orgId, org.id))
      .orderBy(desc(teams.isDefault), asc(teams.name));

    // Shared KPIs: members carry the same sharedGroupId -- roll them up so
    // the scorecard can show one line with the summed goal + summed actual.
    const sharedRollups: Array<{
      groupId: string; title: string; unit: string | null; goalOperator: string | null;
      goalSum: number | null; latestSum: number | null; memberCount: number;
      members: { kpiId: string; ownerExternalId: string; ownerName: string; goalValue: number | null; latestValue: number | null }[];
    }> = [];
    try {
      const sharedKpis = allKpis.filter(k => k.sharedGroupId);
      if (sharedKpis.length > 0) {
        const memberIds = sharedKpis.map(k => k.id);
        const valRows = await db.select({ kpiId: kpiValues.kpiId, value: kpiValues.value, periodStart: kpiValues.periodStart })
          .from(kpiValues)
          .where(inArray(kpiValues.kpiId, memberIds))
          .orderBy(desc(kpiValues.periodStart));
        const latestByKpi = new Map<string, number | null>();
        for (const v of valRows) {
          if (!latestByKpi.has(v.kpiId)) latestByKpi.set(v.kpiId, v.value);
        }
        const ownerLabel = (ext: string) => {
          const n = team.nodes.find(nn => nn.externalId === ext);
          return n ? n.label : ext;
        };
        const groups = new Map<string, typeof sharedKpis>();
        for (const k of sharedKpis) {
          const arr = groups.get(k.sharedGroupId as string) || [];
          arr.push(k);
          groups.set(k.sharedGroupId as string, arr);
        }
        groups.forEach((members, groupId) => {
          let goalSum = 0, anyGoal = false, latestSum = 0, anyLatest = false;
          const memberOut = members.map(m => {
            const lv = latestByKpi.get(m.id) ?? null;
            if (m.goalValue != null) { goalSum += m.goalValue; anyGoal = true; }
            if (lv != null) { latestSum += lv; anyLatest = true; }
            return { kpiId: m.id, ownerExternalId: m.ownerExternalId, ownerName: ownerLabel(m.ownerExternalId), goalValue: m.goalValue, latestValue: lv };
          });
          sharedRollups.push({
            groupId,
            title: members[0].title,
            unit: members[0].unit,
            goalOperator: members[0].goalOperator,
            goalSum: anyGoal ? goalSum : null,
            latestSum: anyLatest ? latestSum : null,
            memberCount: members.length,
            members: memberOut,
          });
        });
        sharedRollups.sort((a, b) => a.title.localeCompare(b.title));
      }
    } catch { /* best-effort: the scorecard still renders without rollups */ }

    return reply.view('pages/dashboard-kpis', {
      title: 'KPIs - Dashboard - OTP',
      description: 'Scoreboard view of every measurable on your org chart.',
      noindex: true,
      org,
      viewerRole: role,
      teamNodes: team.nodes,
      groupNames,
      scoreboard,
      periodLabels,
      grain,
      view,
      orgTeams: orgTeamsKpi,
      sharedRollups,
      isSuperAdmin: (request as any).isSuperAdmin,
    });
  });

  // Accept-invite landing page
  app.get<{ Querystring: { token?: string } }>('/accept-invite', async (request, reply) => {
    const token = String(request.query.token || '').trim();
    if (!token || !/^[A-Za-z0-9_\-]{16,128}$/.test(token)) {
      return renderV7(reply, 'accept-invite', {
        loadClerk: true,
        navVariant: 'minimal',
        navAltLabel: 'Sign in',
        navAltHref: '/sign-in',
        canonical: BASE_URL + '/accept-invite',
        title: 'Accept invitation - OTP',
        noindex: true,
        state: 'invalid',
        message: 'This invitation link is missing or malformed.',
      });
    }
    const auth = getAuth(request);
    // Look up the invitation (read-only) so the page can show context BEFORE acceptance.
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const invRows = await db.execute(sql`
      SELECT i.email, i.claimed_entity_id, i.expires_at, i.status, o.name AS org_name
      FROM org_invitations i
      JOIN organizations o ON o.id = i.org_id
      WHERE i.token_hash = ${tokenHash}
      LIMIT 1
    `);
    const invRow = (invRows.rows || [])[0] as any;
    if (!invRow) {
      return renderV7(reply, 'accept-invite', {
        loadClerk: true,
        navVariant: 'minimal',
        navAltLabel: 'Sign in',
        navAltHref: '/sign-in',
        canonical: BASE_URL + '/accept-invite',
        title: 'Accept invitation - OTP',
        noindex: true,
        state: 'invalid',
        message: 'This invitation could not be found. It may have already been accepted or revoked.',
      });
    }
    if (invRow.status !== 'pending') {
      return renderV7(reply, 'accept-invite', {
        loadClerk: true,
        navVariant: 'minimal',
        navAltLabel: 'Sign in',
        navAltHref: '/sign-in',
        canonical: BASE_URL + '/accept-invite',
        title: 'Accept invitation - OTP',
        noindex: true,
        state: invRow.status,
        message: `This invitation has already been ${invRow.status}.`,
        invitedEmail: invRow.email,
        orgName: invRow.org_name,
      });
    }
    if (new Date(invRow.expires_at) < new Date()) {
      return renderV7(reply, 'accept-invite', {
        loadClerk: true,
        navVariant: 'minimal',
        navAltLabel: 'Sign in',
        navAltHref: '/sign-in',
        canonical: BASE_URL + '/accept-invite',
        title: 'Accept invitation - OTP',
        noindex: true,
        state: 'expired',
        message: 'This invitation has expired. Ask the org owner to resend it.',
        invitedEmail: invRow.email,
        orgName: invRow.org_name,
      });
    }

    if (auth.userId) {
      try {
        // Pull the Clerk user's primary email so acceptInvite can populate
        // the chart tile's contact_email when claimed.
        let clerkEmail: string | null = null;
        try {
          const secretKey = process.env.CLERK_SECRET_KEY;
          if (secretKey) {
            const { createClerkClient } = await import('@clerk/backend');
            const clerk = createClerkClient({ secretKey });
            const u = await clerk.users.getUser(auth.userId);
            clerkEmail = u.emailAddresses.find(e => e.id === u.primaryEmailAddressId)?.emailAddress
              || u.emailAddresses[0]?.emailAddress
              || null;
          }
        } catch { /* Clerk lookup failed -- fall back to invite email */ }

        await acceptInvite(token, auth.userId, clerkEmail);
        // Skip the "Welcome aboard" interstitial -- David wants new
        // members landing straight on their dashboard. The /dashboard
        // route resolves their org via the request.orgMember decorator
        // (now correctly populated since acceptInvite just set
        // status='active') and routes them to admin or employee view.
        return reply.redirect('/dashboard');
      } catch (e) {
        if (e instanceof MembershipError) {
          return renderV7(reply, 'accept-invite', {
        loadClerk: true,
        navVariant: 'minimal',
        navAltLabel: 'Sign in',
        navAltHref: '/sign-in',
        canonical: BASE_URL + '/accept-invite',
            title: 'Accept invitation - OTP',
            noindex: true,
            state: 'error',
            message: e.message,
            orgName: invRow.org_name,
          });
        }
        throw e;
      }
    }

    // Not logged in: render the landing page with sign-in / sign-up CTAs that
    // preserve the token in the redirect.
    return renderV7(reply, 'accept-invite', {
      loadClerk: true,
      navVariant: 'minimal',
      navAltLabel: 'Sign in',
      navAltHref: '/sign-in',
      canonical: BASE_URL + '/accept-invite',
      title: 'Accept invitation - OTP',
      noindex: true,
      state: 'pending',
      orgName: invRow.org_name,
      invitedEmail: invRow.email,
      claimedEntityId: invRow.claimed_entity_id,
      expiresAt: invRow.expires_at,
      token,
    });
  });

  // Dashboard: Consultant profile management
  app.get('/dashboard/consultant', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) return reply.redirect('/sign-in?redirect=' + encodeURIComponent(request.url));
    const org = await resolveRequestOrg(request);
    if (!org) return reply.redirect('/dashboard');

    const isAdmin = (request as any).isSuperAdmin;
    const profileRows = isAdmin
      ? await db.execute(sql`SELECT cp.*, o.name as org_name FROM consultant_profiles cp JOIN organizations o ON o.id = cp.org_id ORDER BY cp.created_at DESC`) as any
      : await db.execute(sql`SELECT * FROM consultant_profiles WHERE org_id = ${org.id}`) as any;
    return reply.view('pages/dashboard-consultant', {
      title: 'Consultant Profile - Dashboard - OTP',
      description: 'Manage your consultant profile on OTP.',
      noindex: true,
      profile: (profileRows.rows || [])[0] || null,
      allProfiles: isAdmin ? (profileRows.rows || []) : null,
      isSuperAdmin: isAdmin,
    });
  });

  // Dashboard: My Practice -- coach view across all attributed/linked clients.
  // Phase 2 v0.2. The page renders 3 distinct states:
  //   1. User is not a claimed coach -> intro + claim CTA
  //   2. Claimed coach with 0 clients -> share-link command center
  //   3. Claimed coach with clients   -> client list + recent activity
  app.get<{ Querystring: { invite?: string; to?: string } }>('/dashboard/practice', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) return reply.redirect('/sign-in?redirect=' + encodeURIComponent(request.url));
    const org = await resolveRequestOrg(request);
    if (!org) return reply.redirect('/dashboard');

    // 1. Is this user a claimed coach? Look for any consultant_profile under
    //    this org that has claimed=true (a coach can only have one such row).
    const coachRows = await db.execute(sql`
      SELECT id, slug, display_name, invite_token, avatar_url, photo_url, claimed, published
      FROM consultant_profiles
      WHERE org_id = ${org.id} AND claimed = true
      LIMIT 1
    `) as any;
    const coachProfile = (coachRows.rows || [])[0] || null;

    // 2. Clients attributed to this coach (current attribution, not transferred-out).
    //    Join: attribution -> client org. Include access state via LEFT JOIN
    //    so we can show "access revoked" for clients who fired the coach but
    //    are still attributed for commission.
    let clients: any[] = [];
    if (coachProfile) {
      const clientRows = await db.execute(sql`
        SELECT
          att.id              AS attribution_id,
          att.attributed_at   AS attributed_at,
          att.attribution_source AS attribution_source,
          o.id                AS client_org_id,
          o.name              AS client_name,
          o.industry          AS client_industry,
          acc.id              AS access_id,
          acc.permission_level AS permission_level,
          acc.granted_at      AS granted_at,
          acc.revoked_at      AS revoked_at
        FROM coach_client_attribution att
        JOIN organizations o ON o.id = att.client_org_id
        LEFT JOIN coach_client_access acc
          ON acc.client_org_id = att.client_org_id
         AND acc.coach_org_id  = att.coach_org_id
        WHERE att.coach_org_id = ${org.id}
          AND att.transferred_at IS NULL
        ORDER BY att.attributed_at DESC
      `) as any;
      clients = clientRows.rows || [];
    }

    const BASE_URL = 'https://orgtp.com';
    const inviteUrl = coachProfile?.invite_token ? `${BASE_URL}/join/${coachProfile.invite_token}` : null;

    return reply.view('pages/dashboard-practice', {
      title: 'My Practice - Dashboard - OTP',
      description: 'Your coach view across all client orgs on OTP.',
      noindex: true,
      coachProfile,
      clients,
      inviteUrl,
      inviteStatus: request.query.invite || null,
      inviteToEmail: request.query.to || null,
      stats: {
        totalClients: clients.length,
        activeAccess: clients.filter(c => !c.revoked_at).length,
        revokedAccess: clients.filter(c => c.revoked_at).length,
      },
    });
  });

  // POST /dashboard/practice/send-invite -- coach-fires invite directly
  // from the Practice dashboard. Saves the copy-link-then-paste-into-email
  // friction. Reply-To is the coach's contact email so any reply lands in
  // their inbox and they own the relationship.
  app.post<{ Body: { email?: string; firstName?: string } }>('/dashboard/practice/send-invite', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) return reply.status(401).send({ error: 'Not signed in' });
    const coachOrg = await resolveRequestOrg(request);
    if (!coachOrg) return reply.redirect('/dashboard');

    const body = (request.body || {}) as { email?: string; firstName?: string };
    const recipientEmail = String(body.email || '').trim().toLowerCase();
    const recipientFirstName = String(body.firstName || '').trim().slice(0, 80);

    // Basic email shape guard. Browser already enforces `type=email`; this is
    // a server-side belt-and-suspenders so we never paste garbage into Resend.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      return reply.redirect('/dashboard/practice?invite=bad_email');
    }

    // Coach must have a claimed profile + invite token to use this.
    const [coach] = await db.execute(sql`
      SELECT slug, display_name, invite_token, contact_email
      FROM consultant_profiles
      WHERE org_id = ${coachOrg.id} AND claimed = true
      LIMIT 1
    `).then((r: any) => r.rows || []);
    if (!coach || !coach.invite_token) {
      return reply.redirect('/dashboard/practice?invite=no_token');
    }

    const coachFirst = String(coach.display_name || 'Your coach').split(' ')[0];
    const inviteUrl = `${BASE_URL}/join/${coach.invite_token}`;
    const replyTo = coach.contact_email
      ? `${coach.display_name} <${coach.contact_email}>`
      : 'David Steel <dsteel@sneeze.it>';
    const greeting = recipientFirstName ? `Hi ${recipientFirstName} — ` : 'Hi — ';

    try {
      const { sendEmail } = await import('../../../config/email.js');
      await sendEmail({
        to: recipientEmail,
        subject: `${coachFirst} invited you to OTP`,
        from: 'David Steel <david@mail.orgtp.com>',
        replyTo,
        tags: [
          { name: 'campaign', value: 'coach_direct_invite' },
          { name: 'coach_slug', value: String(coach.slug || '').replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 80) },
        ],
        html: `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;max-width:640px;margin:0;padding:24px;line-height:1.55;font-size:15px;">

<p>${greeting}<strong>${coachFirst}</strong> just set up an OTP workspace for you.</p>

<p>OTP is an operating chart that puts AI agents and humans on the same accountability layer. Each seat has a name, a role, a KPI, and an SOP. Your team's chart. Your team's numbers. Free during ${coachFirst}'s Founder Certified Coach cohort.</p>

<p>One-click to claim your workspace:</p>

<p><a href="${inviteUrl}" style="display:inline-block;padding:12px 22px;background:#1f2937;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;">Accept invite →</a></p>

<p style="margin-top:18px;color:#6b7280;font-size:13px;">Or paste this URL: <span style="font-family:monospace;">${inviteUrl}</span></p>

<p style="margin-top:24px;">Questions? Reply to this email — it lands directly in ${coachFirst}'s inbox.</p>

<p>— David Steel<br/>
Founder, OTP</p>

</body></html>`,
      });
    } catch (err) {
      request.log.warn({ err }, 'direct-invite send failed');
      return reply.redirect('/dashboard/practice?invite=fail&to=' + encodeURIComponent(recipientEmail));
    }

    return reply.redirect('/dashboard/practice?invite=sent&to=' + encodeURIComponent(recipientEmail));
  });

  // POST /dashboard/practice/client/:clientOrgId/nudge -- coach-triggered
  // activation email to the client. Designed for the empty-state on the
  // client detail page ("Nothing here yet" -> coach hits Nudge -> client
  // gets a templated email with a concrete first-step CTA).
  //
  // Email is from David's mail.orgtp.com address but reply-to is the
  // coach's own contact email, so any reply lands in the coach's inbox
  // and they own the relationship. Coach attribution stays intact.
  app.post<{ Params: { clientOrgId: string } }>('/dashboard/practice/client/:clientOrgId/nudge', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) return reply.status(401).send({ error: 'Not signed in' });
    const coachOrg = await resolveRequestOrg(request);
    if (!coachOrg) return reply.status(403).send({ error: 'No org' });

    const { clientOrgId } = request.params;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clientOrgId)) {
      return reply.status(404).send({ error: 'Bad client id' });
    }

    // Verify ACTIVE coach access. Revoked coaches cannot nudge.
    const access = await db.execute(sql`
      SELECT acc.id FROM coach_client_access acc
      WHERE acc.coach_org_id = ${coachOrg.id}
        AND acc.client_org_id = ${clientOrgId}::uuid
        AND acc.revoked_at IS NULL
      LIMIT 1
    `).then((r: any) => r.rows || []);
    if (!access[0]) return reply.status(403).send({ error: 'No active access to this client' });

    // Pull the coach's display info + the client org's Clerk user id (which
    // for solo orgs is the clerk_org_id field).
    const [coachProfile] = await db.execute(sql`
      SELECT display_name, slug, contact_email FROM consultant_profiles
      WHERE org_id = ${coachOrg.id} AND claimed = true LIMIT 1
    `).then((r: any) => r.rows || []);
    if (!coachProfile) return reply.status(403).send({ error: 'Caller is not a claimed coach' });

    const [clientOrg] = await db.execute(sql`
      SELECT id, name, clerk_org_id FROM organizations WHERE id = ${clientOrgId}::uuid LIMIT 1
    `).then((r: any) => r.rows || []);
    if (!clientOrg) return reply.status(404).send({ error: 'Client org not found' });

    // Look up the client's primary email via Clerk.
    let clientEmail: string | null = null;
    if (clientOrg.clerk_org_id && String(clientOrg.clerk_org_id).startsWith('user_')) {
      const secretKey = process.env.CLERK_SECRET_KEY;
      if (secretKey) {
        try {
          const { createClerkClient } = await import('@clerk/backend');
          const clerk = createClerkClient({ secretKey });
          const user = await clerk.users.getUser(clientOrg.clerk_org_id);
          const primary = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId);
          clientEmail = primary?.emailAddress || user.emailAddresses[0]?.emailAddress || null;
        } catch (err) {
          request.log.warn({ err }, 'Clerk lookup failed during nudge');
        }
      }
    }
    if (!clientEmail) {
      return reply.redirect(`/dashboard/practice/client/${clientOrgId}?nudge=no_email`);
    }

    const coachFirst = String(coachProfile.display_name || 'Your coach').split(' ')[0];
    const replyTo = coachProfile.contact_email
      ? `${coachProfile.display_name} <${coachProfile.contact_email}>`
      : 'David Steel <dsteel@sneeze.it>';

    try {
      const { sendEmail } = await import('../../../config/email.js');
      await sendEmail({
        to: clientEmail,
        subject: `Quick start: map your first 3 seats on OTP`,
        replyTo,
        from: 'David Steel <david@mail.orgtp.com>',
        tags: [
          { name: 'campaign', value: 'coach_nudge_to_client' },
          { name: 'coach_slug', value: String(coachProfile.slug || '').replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 80) },
        ],
        html: `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;max-width:640px;margin:0;padding:24px;line-height:1.55;font-size:15px;">

<p>Hi — quick nudge from <strong>${coachFirst}</strong>.</p>

<p>Your OTP workspace is set up but empty. The fastest way to get value is to map three seats on your chart — even if it takes you ten minutes today, it gives ${coachFirst} something concrete to work with in your next conversation.</p>

<p><strong>Three seats to start with:</strong></p>
<ol style="margin:8px 0 12px 20px;padding:0;">
  <li>The seat you sit in (CEO / Visionary / Integrator — whatever you call it)</li>
  <li>One human direct report</li>
  <li>One AI tool you already use (ChatGPT, Claude, a Zap — anything)</li>
</ol>

<p>That third seat is the unlock. Most operating systems don't have a place for AI yet. OTP gives it a seat next to the humans so accountability stops drifting.</p>

<p><a href="https://orgtp.com/dashboard" style="display:inline-block;padding:12px 22px;background:#1f2937;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;">Open my dashboard →</a></p>

<p style="margin-top:18px;font-size:13px;color:#6b7280;">Reply to this email if you want ${coachFirst}'s help — it'll land in their inbox.</p>

<p>— David Steel<br/>
Founder, OTP</p>

</body></html>`,
      });
    } catch (err) {
      request.log.warn({ err }, 'nudge email send failed');
      return reply.redirect(`/dashboard/practice/client/${clientOrgId}?nudge=fail`);
    }

    return reply.redirect(`/dashboard/practice/client/${clientOrgId}?nudge=sent`);
  });

  // /dashboard/practice/client/:client_org_id -- read-only coach-view of a
  // single linked client. Auth gate: current user's org must have active
  // coach_client_access into the target client_org_id. No active-org
  // switching (which would risk write-path leakage) -- this is a dedicated
  // read-only summary route. Phase 2 v0.4.
  app.get<{ Params: { clientOrgId: string }; Querystring: { nudge?: string } }>('/dashboard/practice/client/:clientOrgId', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) return reply.redirect('/sign-in?redirect=' + encodeURIComponent(request.url));
    const coachOrg = await resolveRequestOrg(request);
    if (!coachOrg) return reply.redirect('/dashboard');

    const { clientOrgId } = request.params;
    // UUID-shape guard so a malformed param can't reach the DB layer.
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clientOrgId)) {
      return reply.status(404).view('pages/404', { title: 'Client not found - OTP' });
    }

    // Verify ACTIVE coach access from this user's org into the target client.
    // Attribution alone is not sufficient -- access can be revoked while
    // attribution lives on for commission. View paths require active access.
    const accessCheck = await db.execute(sql`
      SELECT acc.id, acc.permission_level, acc.granted_at
      FROM coach_client_access acc
      WHERE acc.coach_org_id  = ${coachOrg.id}
        AND acc.client_org_id = ${clientOrgId}::uuid
        AND acc.revoked_at IS NULL
      LIMIT 1
    `) as any;
    if (!(accessCheck.rows || [])[0]) {
      return reply.status(403).view('pages/404', { title: 'No access - OTP', description: 'You do not have active coach access to this client.' });
    }

    // Client org core info + attribution data so the coach can see when
    // the client joined and via what path.
    const [clientOrg] = await db.execute(sql`
      SELECT id, name, industry, size, created_at
      FROM organizations WHERE id = ${clientOrgId}::uuid LIMIT 1
    `).then((r: any) => r.rows || []);
    if (!clientOrg) {
      return reply.status(404).view('pages/404', { title: 'Client not found - OTP' });
    }

    const [attribution] = await db.execute(sql`
      SELECT attributed_at, attribution_source
      FROM coach_client_attribution
      WHERE coach_org_id = ${coachOrg.id}
        AND client_org_id = ${clientOrgId}::uuid
        AND transferred_at IS NULL
      LIMIT 1
    `).then((r: any) => r.rows || []);

    // Summary counts. Wrap each in try/catch so a missing/legacy table
    // never 500s this page -- we show 0 instead of breaking.
    async function safeCount(query: any): Promise<number> {
      try {
        const r = await db.execute(query) as any;
        return Number((r.rows || [])[0]?.c || 0);
      } catch { return 0; }
    }
    const cid = clientOrgId;
    const [memberCount, teamCount, kpiCount, oosCount, chartCount, agentCount] = await Promise.all([
      safeCount(sql`SELECT COUNT(*) AS c FROM org_members WHERE org_id = ${cid}::uuid`),
      safeCount(sql`SELECT COUNT(*) AS c FROM teams WHERE org_id = ${cid}::uuid`),
      safeCount(sql`SELECT COUNT(*) AS c FROM kpis WHERE org_id = ${cid}::uuid`),
      safeCount(sql`SELECT COUNT(*) AS c FROM oos_files WHERE org_id = ${cid}::uuid AND status = 'published'`),
      safeCount(sql`SELECT COUNT(*) AS c FROM charts WHERE org_id = ${cid}::uuid`),
      safeCount(sql`SELECT COUNT(*) AS c FROM manager_agents WHERE org_id = ${cid}::uuid`),
    ]);

    // Meeting cadence -- the coach's core accountability signal: is the client
    // actually running their weekly L10? Drizzle query so the column mapping
    // is handled, and best-effort so a legacy schema never 500s this page.
    let meetingCount = 0;
    let lastMeetingAt: string | null = null;
    try {
      const _mtgs = await db.select({ scheduledAt: meetings.scheduledAt })
        .from(meetings)
        .where(and(eq(meetings.organizationId, clientOrgId), isNull(meetings.deletedAt)))
        .orderBy(desc(meetings.scheduledAt));
      meetingCount = _mtgs.length;
      lastMeetingAt = _mtgs[0]?.scheduledAt ? new Date(_mtgs[0].scheduledAt).toISOString() : null;
    } catch { meetingCount = 0; lastMeetingAt = null; }

    return reply.view('pages/dashboard-practice-client', {
      title: `${clientOrg.name} - Coach View - OTP`,
      description: `Coach-view summary of ${clientOrg.name}.`,
      noindex: true,
      client: clientOrg,
      attribution,
      nudgeStatus: request.query.nudge || null,
      stats: {
        members: memberCount,
        teams: teamCount,
        kpis: kpiCount,
        oosFiles: oosCount,
        charts: chartCount,
        agents: agentCount,
        empty: memberCount + teamCount + kpiCount + oosCount + chartCount + agentCount + meetingCount === 0,
      },
      cadence: { meetingCount, lastMeetingAt },
    });
  });

  // Settings: My Coaches -- client-side view of all coaches who have
  // access to this org's workspace. Lets the client revoke access at any
  // time. Phase 2 v0.3. Permission split locked in
  // [[project_otp_coach_revenue_model]]: client can revoke ACCESS;
  // attribution stays attached for commission purposes.
  app.get('/settings/coaches', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) return reply.redirect('/sign-in?redirect=' + encodeURIComponent(request.url));
    const org = await resolveRequestOrg(request);
    if (!org) return reply.redirect('/dashboard');

    // Pull all coaches (active + revoked) who have ever had access to this org.
    const rows = await db.execute(sql`
      SELECT
        acc.id              AS access_id,
        acc.permission_level AS permission_level,
        acc.granted_at      AS granted_at,
        acc.revoked_at      AS revoked_at,
        cp.id               AS coach_profile_id,
        cp.slug             AS coach_slug,
        cp.display_name     AS coach_name,
        cp.avatar_url       AS coach_avatar,
        cp.photo_url        AS coach_photo,
        cp.bio              AS coach_bio,
        cp.contact_email    AS coach_email,
        coach_org.id        AS coach_org_id,
        coach_org.name      AS coach_org_name
      FROM coach_client_access acc
      JOIN organizations coach_org ON coach_org.id = acc.coach_org_id
      LEFT JOIN consultant_profiles cp ON cp.org_id = acc.coach_org_id AND cp.claimed = true
      WHERE acc.client_org_id = ${org.id}
      ORDER BY acc.revoked_at NULLS FIRST, acc.granted_at DESC
    `) as any;

    return reply.view('pages/settings-coaches', {
      title: 'My Coaches - Settings - OTP',
      description: 'Manage coach access to your OTP workspace.',
      noindex: true,
      coaches: rows.rows || [],
    });
  });

  // POST /settings/coaches/:accessId/revoke -- client fires a coach.
  // Sets revoked_at on the access row. Attribution is INTENTIONALLY left
  // untouched -- coach still earns commission per the perpetuity model.
  app.post<{ Params: { accessId: string } }>('/settings/coaches/:accessId/revoke', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) return reply.status(401).send({ error: 'Not signed in' });
    const org = await resolveRequestOrg(request);
    if (!org) return reply.status(403).send({ error: 'No org' });

    const { accessId } = request.params;
    // Verify this access row belongs to the current user's org before revoking.
    const [row] = await db.execute(sql`
      SELECT client_org_id, revoked_at FROM coach_client_access WHERE id = ${accessId}::uuid LIMIT 1
    `).then((r: any) => r.rows || []);
    if (!row) return reply.status(404).send({ error: 'Access record not found' });
    if (row.client_org_id !== org.id) return reply.status(403).send({ error: 'Not your access record' });
    if (row.revoked_at) return reply.redirect('/settings/coaches'); // already revoked, no-op

    await db.execute(sql`
      UPDATE coach_client_access
      SET revoked_at = NOW(), revoked_by_user_id = ${auth.userId}
      WHERE id = ${accessId}::uuid
    `);

    return reply.redirect('/settings/coaches');
  });

  // POST /settings/coaches/:accessId/restore -- undo revocation. Re-grants
  // access by clearing revoked_at.
  app.post<{ Params: { accessId: string } }>('/settings/coaches/:accessId/restore', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) return reply.status(401).send({ error: 'Not signed in' });
    const org = await resolveRequestOrg(request);
    if (!org) return reply.status(403).send({ error: 'No org' });

    const { accessId } = request.params;
    const [row] = await db.execute(sql`
      SELECT client_org_id FROM coach_client_access WHERE id = ${accessId}::uuid LIMIT 1
    `).then((r: any) => r.rows || []);
    if (!row) return reply.status(404).send({ error: 'Access record not found' });
    if (row.client_org_id !== org.id) return reply.status(403).send({ error: 'Not your access record' });

    await db.execute(sql`
      UPDATE coach_client_access
      SET revoked_at = NULL, revoked_by_user_id = NULL, granted_at = NOW()
      WHERE id = ${accessId}::uuid
    `);
    return reply.redirect('/settings/coaches');
  });

  // Dashboard: Workspaces
  app.get('/dashboard/workspaces', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) return reply.redirect('/sign-in?redirect=' + encodeURIComponent(request.url));
    const org = await resolveRequestOrg(request);
    if (!org) return reply.redirect('/dashboard');

    const wsRows = await db.execute(sql`
      SELECT w.*, wm.role,
        (SELECT COUNT(*) FROM workspace_members WHERE workspace_id = w.id) as member_count,
        (SELECT COUNT(*) FROM oos_files WHERE workspace_id = w.id) as oos_count
      FROM workspaces w
      JOIN workspace_members wm ON wm.workspace_id = w.id AND wm.org_id = ${org.id}
      ORDER BY w.created_at DESC
    `) as any;

    return reply.view('pages/dashboard-workspaces', {
      title: 'Workspaces - Dashboard - OTP',
      description: 'Manage your OTP workspaces and team collaboration.',
      noindex: true,
      workspaces: wsRows.rows || [],
    });
  });

  // Dashboard: OOS Operating Plan (strategy -> structured OOS claims)
  // Page-level access: any authed org member. Push-to-OOS is super-admin gated at the API endpoint (Phase 6).
  app.get('/dashboard/oos-operating-plan', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) return reply.redirect('/sign-in?redirect=' + encodeURIComponent(request.url));
    const org = await resolveRequestOrg(request);
    if (!org) return reply.redirect('/dashboard');

    // One active plan per org (MVP). Future: departmental plans via departmentId.
    const planArr = await db
      .select()
      .from(oosOperatingPlans)
      .where(and(eq(oosOperatingPlans.organizationId, org.id), eq(oosOperatingPlans.status, 'active')))
      .orderBy(desc(oosOperatingPlans.createdAt))
      .limit(1);
    const plan = planArr[0] || null;

    let sections: typeof oosOperatingPlanSections.$inferSelect[] = [];
    let executionItems: typeof oosExecutionItems.$inferSelect[] = [];

    if (plan) {
      sections = await db
        .select()
        .from(oosOperatingPlanSections)
        .where(eq(oosOperatingPlanSections.planId, plan.id))
        .orderBy(oosOperatingPlanSections.sortOrder);

      const currentQuarter = quarterLabel(new Date());
      executionItems = await db
        .select()
        .from(oosExecutionItems)
        .where(and(eq(oosExecutionItems.planId, plan.id), eq(oosExecutionItems.quarter, currentQuarter)))
        .orderBy(desc(oosExecutionItems.createdAt));
    }

    // KPIs attached to these execution items, plus the latest value for each.
    const kpisByItemId: Record<string, Array<{
      id: string;
      title: string;
      goalOperator: string | null;
      goalValue: number | null;
      unit: string | null;
      timeGrain: string;
      latestValue: number | null;
      latestPeriodStart: string | null;
      meetsGoal: boolean | null;
    }>> = {};
    if (executionItems.length > 0) {
      const { kpis: kpisTable, kpiValues: kpiValuesTable } = await import('../../../db/schema.js');
      const itemIds = executionItems.map(i => i.id);
      const kpiRows = await db
        .select()
        .from(kpisTable)
        .where(and(
          inArray(kpisTable.executionItemId, itemIds),
          isNull(kpisTable.deletedAt),
        ));
      const kpiIds = kpiRows.map(k => k.id);
      let latestByKpi = new Map<string, { value: number | null; periodStart: Date }>();
      if (kpiIds.length > 0) {
        const valueRows = await db
          .select()
          .from(kpiValuesTable)
          .where(inArray(kpiValuesTable.kpiId, kpiIds))
          .orderBy(desc(kpiValuesTable.periodStart));
        for (const v of valueRows) {
          if (!latestByKpi.has(v.kpiId)) {
            latestByKpi.set(v.kpiId, { value: v.value, periodStart: v.periodStart });
          }
        }
      }
      function meets(value: number | null, op: string | null, target: number | null): boolean | null {
        if (value === null || op === null || target === null) return null;
        if (op === 'gte') return value >= target;
        if (op === 'lte') return value <= target;
        if (op === 'gt')  return value > target;
        if (op === 'lt')  return value < target;
        if (op === 'eq')  return value === target;
        return null;
      }
      for (const k of kpiRows) {
        if (!k.executionItemId) continue;
        const latest = latestByKpi.get(k.id);
        const arr = kpisByItemId[k.executionItemId] || (kpisByItemId[k.executionItemId] = []);
        arr.push({
          id: k.id,
          title: k.title,
          goalOperator: k.goalOperator,
          goalValue: k.goalValue,
          unit: k.unit,
          timeGrain: k.timeGrain,
          latestValue: latest?.value ?? null,
          latestPeriodStart: latest?.periodStart ? latest.periodStart.toISOString() : null,
          meetsGoal: meets(latest?.value ?? null, k.goalOperator, k.goalValue),
        });
      }
    }

    return reply.view('pages/oos-operating-plan', {
      title: 'OOS Operating Plan - Dashboard - OTP',
      description: 'Turn strategy into accountable execution across humans, agents, and operating rules.',
      noindex: true,
      org,
      plan,
      sections,
      executionItems,
      kpisByItemId,
      currentQuarter: quarterLabel(new Date()),
      isSuperAdmin: (request as any).isSuperAdmin,
    });
  });

  // Dashboard: CEO Dashboard — the whole-company cockpit.
  // Synthesizes four sources into one steering view: the Operating Plan
  // (direction — 3-year, annual, this quarter), the KPI scoreboard, the
  // current quarter's execution items, and the org chart (seats: humans and
  // agents). The Operating Plan feeds this page; this page reads, never writes.
  // Page-level access: org owner OR EOS Visionary only. Integrators (COO
  // role), managers, implementers don't see it. David flagged 2026-05-25
  // that the page was leaking to non-CEO roles via direct URL.
  app.get('/dashboard/ceo', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) return reply.redirect('/sign-in?redirect=' + encodeURIComponent(request.url));
    const org = await resolveRequestOrg(request);
    if (!org) return reply.redirect('/dashboard');

    // Role gate -- bounce non-CEOs back to the Daily dashboard.
    // orgMember is attached by registerOrgMemberDecorator middleware.
    const memberRole = ((request as any).orgMember?.role || '').toString();
    if (memberRole !== 'owner' && memberRole !== 'visionary') {
      return reply.redirect('/dashboard');
    }

    const currentQuarter = quarterLabel(new Date());

    // --- Operating Plan: direction sections + current-quarter execution items ---
    const planArr = await db
      .select()
      .from(oosOperatingPlans)
      .where(and(eq(oosOperatingPlans.organizationId, org.id), eq(oosOperatingPlans.status, 'active')))
      .orderBy(desc(oosOperatingPlans.createdAt))
      .limit(1);
    const plan = planArr[0] || null;

    let sections: typeof oosOperatingPlanSections.$inferSelect[] = [];
    let executionItems: typeof oosExecutionItems.$inferSelect[] = [];
    if (plan) {
      sections = await db
        .select()
        .from(oosOperatingPlanSections)
        .where(eq(oosOperatingPlanSections.planId, plan.id))
        .orderBy(oosOperatingPlanSections.sortOrder);
      executionItems = await db
        .select()
        .from(oosExecutionItems)
        .where(and(eq(oosExecutionItems.planId, plan.id), eq(oosExecutionItems.quarter, currentQuarter)))
        .orderBy(desc(oosExecutionItems.createdAt));
    }

    // --- Org chart: the seats (humans + agents) ---
    const team = await getOrgTeamGraph(org.id, org.name || 'Organization');
    const seats = team.nodes
      .filter((n) => n.type === 'agent' || n.type === 'human')
      .map((n) => ({
        externalId: n.externalId,
        type: n.type,
        label: n.label,
        role: ((n.properties as any) && (n.properties as any).role) ? String((n.properties as any).role) : '',
      }));

    // --- KPI scoreboard: latest value per KPI, then on-goal / off-goal ---
    function meetsGoalFn(value: number | null, op: string | null, target: number | null): boolean | null {
      if (value === null || op === null || target === null) return null;
      if (op === 'gte') return value >= target;
      if (op === 'lte') return value <= target;
      if (op === 'gt') return value > target;
      if (op === 'lt') return value < target;
      if (op === 'eq') return value === target;
      return null;
    }
    const { listKpis } = await import('../../../services/kpi.js');
    const allKpis = await listKpis(org.id, {});
    const kpiIds = allKpis.map((k: any) => k.id as string);
    const latestByKpi = new Map<string, number | null>();
    if (kpiIds.length > 0) {
      const valRows = await db
        .select({ kpiId: kpiValues.kpiId, value: kpiValues.value, periodStart: kpiValues.periodStart })
        .from(kpiValues)
        .where(inArray(kpiValues.kpiId, kpiIds))
        .orderBy(desc(kpiValues.periodStart));
      for (const v of valRows) {
        if (!latestByKpi.has(v.kpiId)) latestByKpi.set(v.kpiId, v.value);
      }
    }
    const nodeLabel = new Map(team.nodes.map((n) => [n.externalId, n.label] as [string, string]));
    const kpis = allKpis.map((k: any) => {
      const latest = latestByKpi.has(k.id) ? (latestByKpi.get(k.id) ?? null) : null;
      return {
        id: k.id as string,
        title: k.title as string,
        groupName: (k.groupName ?? null) as string | null,
        ownerName: (nodeLabel.get(k.ownerExternalId) ?? k.ownerExternalId ?? '') as string,
        ownerType: (k.ownerEntityType ?? null) as string | null,
        unit: (k.unit ?? null) as string | null,
        goalOperator: (k.goalOperator ?? null) as string | null,
        goalValue: (k.goalValue ?? null) as number | null,
        latestValue: latest,
        meetsGoal: meetsGoalFn(latest, k.goalOperator ?? null, k.goalValue ?? null),
      };
    });
    const kpiSummary = {
      total: kpis.length,
      onGoal: kpis.filter((k) => k.meetsGoal === true).length,
      offGoal: kpis.filter((k) => k.meetsGoal === false).length,
      noData: kpis.filter((k) => k.meetsGoal === null).length,
    };

    return reply.view('pages/dashboard-ceo', {
      title: 'CEO Dashboard - OTP',
      description: 'The whole company in one view: direction, scoreboard, seats, and this quarter.',
      noindex: true,
      org,
      plan,
      sections,
      executionItems,
      currentQuarter,
      seats,
      seatCounts: {
        humans: seats.filter((s) => s.type === 'human').length,
        agents: seats.filter((s) => s.type === 'agent').length,
      },
      kpis,
      kpiSummary,
    });
  });

  // Create the org's first OOS Operating Plan (idempotent: returns existing if present).
  // Seeds the 8 standard sections so the UI has something to render.
  app.post('/dashboard/oos-operating-plan/create', async (request, reply) => {
    const auth = getAuth(request);
    // Form-style POST: bounce to sign-in if the session expired between page
    // load and submit, so the user lands back on the operating-plan page.
    if (!auth.userId) return reply.redirect('/sign-in?redirect=/dashboard/oos-operating-plan');
    const org = await resolveRequestOrg(request);
    if (!org) return reply.status(403).send({ error: { code: 'NO_ORG', message: 'You need an organization first' } });

    // Reuse existing active plan if one already exists.
    const existingArr = await db
      .select()
      .from(oosOperatingPlans)
      .where(and(eq(oosOperatingPlans.organizationId, org.id), eq(oosOperatingPlans.status, 'active')))
      .limit(1);
    if (existingArr[0]) return reply.redirect('/dashboard/oos-operating-plan');

    const [newPlan] = await db
      .insert(oosOperatingPlans)
      .values({
        organizationId: org.id,
        title: org.name + ' Operating Plan',
        status: 'active',
        createdBy: auth.userId,
      })
      .returning();

    const defaultSections: Array<{ key: typeof oosOperatingPlanSections.$inferInsert['sectionKey']; title: string; sort: number }> = [
      { key: 'foundation', title: 'Core Foundation', sort: 1 },
      { key: 'market_command', title: 'Market Command', sort: 2 },
      { key: 'destination', title: 'Destination', sort: 3 },
      { key: 'annual_game_plan', title: 'Annual Game Plan', sort: 4 },
      { key: 'ninety_day_engine', title: '90-Day Execution Engine', sort: 5 },
      { key: 'performance_scorecard', title: 'Performance Scorecard', sort: 6 },
      { key: 'constraints_leverage', title: 'Constraints & Leverage Points', sort: 7 },
      { key: 'alignment_accountability', title: 'Alignment & Accountability', sort: 8 },
    ];
    await db.insert(oosOperatingPlanSections).values(
      defaultSections.map(s => ({
        planId: newPlan.id,
        sectionKey: s.key,
        title: s.title,
        contentJson: {},
        sortOrder: s.sort,
      })),
    );

    return reply.redirect('/dashboard/oos-operating-plan');
  });

  // Copy the active plan forward to next year.
  // - Archives the current active plan (status='archived')
  // - Creates a new active plan with title carrying year+1
  // - Duplicates all 8 sections + their contentJson into the new plan
  // - Returns the new plan id (client reloads /dashboard/oos-operating-plan)
  app.post('/dashboard/oos-operating-plan/copy-forward', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in required' } });
    const org = await resolveRequestOrg(request);
    if (!org) return reply.status(403).send({ error: { code: 'NO_ORG', message: 'You need an organization first' } });

    const [currentPlan] = await db
      .select()
      .from(oosOperatingPlans)
      .where(and(eq(oosOperatingPlans.organizationId, org.id), eq(oosOperatingPlans.status, 'active')))
      .limit(1);
    if (!currentPlan) return reply.status(404).send({ error: { code: 'NO_PLAN', message: 'No active plan to copy' } });

    // Pull next year from the title if present, else current+1.
    const titleYearMatch = (currentPlan.title || '').match(/(20\d{2})/);
    const currentYear = titleYearMatch ? parseInt(titleYearMatch[1], 10) : new Date(currentPlan.createdAt).getFullYear();
    const nextYear = currentYear + 1;

    await db
      .update(oosOperatingPlans)
      .set({ status: 'archived', updatedAt: new Date() })
      .where(eq(oosOperatingPlans.id, currentPlan.id));

    const newTitle = titleYearMatch
      ? currentPlan.title.replace(/20\d{2}/, String(nextYear))
      : `${org.name} Operating Plan ${nextYear}`;
    const [newPlan] = await db
      .insert(oosOperatingPlans)
      .values({
        organizationId: org.id,
        title: newTitle,
        status: 'active',
        createdBy: auth.userId,
      })
      .returning();

    const existingSections = await db
      .select()
      .from(oosOperatingPlanSections)
      .where(eq(oosOperatingPlanSections.planId, currentPlan.id))
      .orderBy(oosOperatingPlanSections.sortOrder);
    if (existingSections.length > 0) {
      await db.insert(oosOperatingPlanSections).values(
        existingSections.map(s => ({
          planId: newPlan.id,
          sectionKey: s.sectionKey,
          title: s.title,
          contentJson: s.contentJson,
          sortOrder: s.sortOrder,
        })),
      );
    }

    // Execution items deliberately NOT copied — new year means new quarterly execution.
    return reply.send({ ok: true, planId: newPlan.id, newYear: nextYear, archivedPlanId: currentPlan.id });
  });

  // Seed the active plan's 4 strategic sections with example Sneeze It content
  // (the same content shown on the public /plan preview, mapped to OOS field keys).
  // Super-admin gated. Refuses if any of the 4 strategic sections already has content.
  app.post('/dashboard/oos-operating-plan/seed-example', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) return reply.status(401).send({ error: { code: 'AUTH_REQUIRED', message: 'Sign in required' } });
    if (!(request as any).isSuperAdmin) return reply.status(403).send({ error: { code: 'SUPER_ADMIN_ONLY', message: 'Super admin only' } });

    const org = await resolveRequestOrg(request);
    if (!org) return reply.status(403).send({ error: { code: 'NO_ORG', message: 'You need an organization first' } });

    const [currentPlan] = await db
      .select()
      .from(oosOperatingPlans)
      .where(and(eq(oosOperatingPlans.organizationId, org.id), eq(oosOperatingPlans.status, 'active')))
      .limit(1);
    if (!currentPlan) return reply.status(404).send({ error: { code: 'NO_PLAN', message: 'No active plan to seed' } });

    const strategicKeys = ['foundation', 'market_command', 'destination', 'annual_game_plan'] as const;
    const existing = await db
      .select()
      .from(oosOperatingPlanSections)
      .where(eq(oosOperatingPlanSections.planId, currentPlan.id));

    // Refuse if ANY strategic section already has content.
    for (const s of existing) {
      if (!strategicKeys.includes(s.sectionKey as typeof strategicKeys[number])) continue;
      const c = (s.contentJson || {}) as Record<string, unknown>;
      const hasContent = Object.values(c).some(v => v !== null && v !== undefined && String(v).trim() !== '');
      if (hasContent) {
        return reply.status(409).send({
          error: { code: 'ALREADY_HAS_CONTENT', message: `Section "${s.sectionKey}" already has content. Seed refuses to overwrite. Clear those fields first or edit manually.` },
        });
      }
    }

    // Sneeze It example content, mapped from /plan's Ninety V/TO labels to OOS field keys.
    const sneezeItContent: Record<typeof strategicKeys[number], Record<string, string>> = {
      foundation: {
        purpose: 'PROFIT!',
        mission: 'Deliver qualified appointments that fuel growth for membership and retention-driven businesses.',
        values: [
          'CHAMPS:',
          '• Communicate With Courage — Speak truthfully, listen actively, and create clarity, even when it\'s hard.',
          '• Heart In The Game — Show up with passion, energy, and emotional buy-in. Play with purpose.',
          '• Make Each Other Better — Elevate your teammates. Give, receive, and seek feedback. Protect the culture.',
          '• Push For Greatness — Pursue excellence relentlessly. Improve constantly. Raise the bar.',
          '• Stay Resilient — Adapt under pressure. Show grit in the face of challenges. Bounce back stronger. Be the calm in the chaos.',
        ].join('\n'),
        ideal_customer: 'Multi-location membership and retention brands (fitness, wellness, hospitality) with $1M-$50M revenue, an installed call center, and an executive team that already runs an operating system.',
      },
      market_command: {
        category: 'AI-native operating layer for membership and retention brands.',
        unique_advantage: [
          '1) Agency-funded operating platform — clients run free.',
          '2) AI agents that hold the org\'s other agents accountable.',
          '3) Per-client playbook compounds across the entire book of business.',
        ].join('\n'),
        brand_promise: 'Qualified appointments delivered on a per-location basis or your money back.',
        proof_points: [
          'Capture, Core, Clarity, Call Center — the proven 4C process.',
          'Multi-location WOA franchises in production.',
          'HiTone Fitness, Villa Sport, Cellebration Wellness, exhale, South Coast MedSpa.',
          'Founding 25 EOS coach cohort launching 2026.',
        ].join('\n'),
      },
      destination: {
        year_target: 'Reach $6M revenue with 10% Net Operating Income, 95% target-market clients, strong sales process, and successful expansion into new markets. Founding 25 coaches active on OTP.',
        year_target_year: '2029',
        ten_year_target: 'Create a million shown appointments for membership and retention brands worldwide.',
        ten_year_target_year: '2036',
        revenue_goal: '$6M by 2029 (3-Year). Aspirational scale beyond that.',
        profit_goal: '10% Net Operating Income.',
        defining_metric: 'Shown appointments delivered per client per month.',
      },
      annual_game_plan: {
        primary_objective: 'Ship the Founding 25 coach cohort, scale Sneeze It to $2M ARR, complete the Accelo → Trello migration.',
        strategic_initiatives: [
          '1) Founding 25 coach campaign — claim, onboard, prove value.',
          '2) WOA 4C franchise expansion toward 50 locations.',
          '3) Accelo → Trello migration with the PM bot in place.',
          '4) OTP coordination intelligence loops live (claims, OOS sync).',
          '5) AI-agent accountability layer established as the product moat.',
        ].join('\n'),
        key_outcomes: [
          '50 OTP signups by Sep 30.',
          '$2M Sneeze It ARR by Dec 31.',
          '50 WOA locations on 4C.',
          '25 founding coaches with at least one onboarded client each.',
        ].join('\n'),
      },
    };

    // Update each strategic section's contentJson. Sections are seeded at plan-creation
    // time so they exist already — we update, not insert.
    let updated = 0;
    for (const key of strategicKeys) {
      const section = existing.find(s => s.sectionKey === key);
      if (!section) continue;
      await db
        .update(oosOperatingPlanSections)
        .set({ contentJson: sneezeItContent[key], updatedAt: new Date() })
        .where(eq(oosOperatingPlanSections.id, section.id));
      updated++;
    }

    return reply.send({ ok: true, planId: currentPlan.id, sectionsUpdated: updated });
  });

  // Dashboard: Workspace detail
  app.get('/dashboard/workspace/:id', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) return reply.redirect('/sign-in?redirect=' + encodeURIComponent(request.url));
    const org = await resolveRequestOrg(request);
    if (!org) return reply.redirect('/dashboard');
    const { id } = request.params as { id: string };

    const wsRows = await db.execute(sql`SELECT w.* FROM workspaces w JOIN workspace_members wm ON wm.workspace_id = w.id AND wm.org_id = ${org.id} WHERE w.id = ${id}`) as any;
    const workspace = (wsRows.rows || [])[0];
    if (!workspace) return renderV7(reply.status(404), '404', { title: 'Workspace Not Found' });

    const memberRows = await db.execute(sql`SELECT * FROM workspace_members WHERE workspace_id = ${id} ORDER BY invited_at`) as any;
    const oosRows = await db.execute(sql`SELECT f.*, o.name as org_name FROM oos_files f JOIN organizations o ON o.id = f.org_id WHERE f.workspace_id = ${id} ORDER BY f.created_at DESC`) as any;

    return reply.view('pages/dashboard-workspace-detail', {
      title: workspace.name + ' - Workspace - OTP',
      description: 'Workspace details and members on OTP.',
      noindex: true,
      workspace,
      members: memberRows.rows || [],
      oosFiles: oosRows.rows || [],
    });
  });

  // Dashboard: Source documents
  app.get('/dashboard/source-documents', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) return reply.redirect('/sign-in?redirect=' + encodeURIComponent(request.url));
    const org = await resolveRequestOrg(request);
    if (!org) return reply.redirect('/dashboard');

    const docRows = await db.execute(sql`SELECT * FROM source_documents WHERE org_id = ${org.id} ORDER BY created_at DESC`) as any;
    return reply.view('pages/dashboard-source-docs', {
      title: 'Source Documents - Dashboard - OTP',
      description: 'Manage your uploaded source documents on OTP.',
      noindex: true,
      documents: docRows.rows || [],
    });
  });

  // Dashboard: Source document detail
  app.get('/dashboard/source-documents/:id', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) return reply.redirect('/sign-in?redirect=' + encodeURIComponent(request.url));
    const org = await resolveRequestOrg(request);
    if (!org) return reply.redirect('/dashboard');
    const { id } = request.params as { id: string };

    const docRows = await db.execute(sql`SELECT * FROM source_documents WHERE id = ${id} AND org_id = ${org.id}`) as any;
    const document = (docRows.rows || [])[0];
    if (!document) return renderV7(reply.status(404), '404', { title: 'Document Not Found' });

    const oosRows = await db.execute(sql`SELECT f.* FROM oos_files f WHERE f.source_document_id = ${id} ORDER BY f.created_at DESC`) as any;
    return reply.view('pages/dashboard-source-doc-detail', {
      title: document.title + ' - Source Document - OTP',
      description: 'Source document details and generated OOS files on OTP.',
      noindex: true,
      document,
      oosFiles: oosRows.rows || [],
    });
  });

  // Dashboard: Inquiries
  app.get('/dashboard/inquiries', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) return reply.redirect('/sign-in?redirect=' + encodeURIComponent(request.url));
    const org = await resolveRequestOrg(request);
    if (!org) return reply.redirect('/dashboard');

    const profileRows = await db.execute(sql`SELECT id FROM consultant_profiles WHERE org_id = ${org.id}`) as any;
    const profile = (profileRows.rows || [])[0];
    if (!profile) return reply.redirect('/dashboard/consultant');

    const inqRows = await db.execute(sql`SELECT * FROM inquiries WHERE consultant_profile_id = ${profile.id} ORDER BY created_at DESC`) as any;
    return reply.view('pages/dashboard-inquiries', {
      title: 'Inquiries - Dashboard - OTP',
      description: 'View and manage client inquiries on OTP.',
      noindex: true,
      inquiries: inqRows.rows || [],
    });
  });

  // Investors page

  app.get('/settings/api', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) {
      return reply.view('pages/settings-api', { title: 'API Keys - OTP', noindex: true, authState: 'unauthenticated', keys: [] });
    }

    const org = await resolveRequestOrg(request);
    if (!org) {
      return reply.view('pages/settings-api', { title: 'API Keys - OTP', noindex: true, authState: 'no_org', keys: [] });
    }

    const keys = await db
      .select({
        id: apiKeys.id,
        name: apiKeys.name,
        keyPrefix: apiKeys.keyPrefix,
        scopes: apiKeys.scopes,
        lastUsedAt: apiKeys.lastUsedAt,
        createdAt: apiKeys.createdAt,
      })
      .from(apiKeys)
      .where(and(eq(apiKeys.orgId, org.id), isNull(apiKeys.revokedAt)))
      .orderBy(desc(apiKeys.createdAt));

    return reply.view('pages/settings-api', { title: 'API Keys - OTP', noindex: true, authState: 'authenticated', keys });
  });


  app.get('/dashboard', async (request, reply) => {
    const auth = getAuth(request);

    if (!auth.userId) {
      // Not signed in -- show prompt to sign in (handled client-side by Clerk JS)
      return reply.view('pages/dashboard-admin', {
        title: 'Publisher Dashboard - OTP',
        description: 'Manage your OOS files, track publisher stats, and monitor your coordination intelligence on OTP.',
        ogImage: BASE_URL + '/public/og-image.png',
        noindex: true,
        authState: 'unauthenticated',
        dashboard: {
          profile: { name: '', industry: '', size: '', badge: null, qualityTier: null },
          stats: { publishedFiles: 0, totalClaims: 0, connectedOrgs: 0, views30d: 0 },
          oosFiles: [],
          updateHistory: [],
        },
      });
    }

    // Phase 1+: invited members are tied to their org via org_members, not
    // organizations.clerkOrgId. Resolve the org from the request.orgMember
    // decoration first so an invited member never sees the founder-style
    // "Complete Publisher Profile" form by mistake.
    const memberDecoration = (request as any).orgMember as { orgId: string } | null;
    let org: any = null;
    if (memberDecoration?.orgId) {
      const [m] = await db.select().from(organizations).where(eq(organizations.id, memberDecoration.orgId)).limit(1);
      if (m) org = m;
    }
    if (!org) {
      // Fallback to legacy "I founded this org" lookup.
      const [legacy] = await db.select().from(organizations)
        .where(eq(organizations.clerkOrgId, auth.userId)).limit(1);
      if (legacy) org = legacy;
    }

    if (!org) {
      // Truly no org for this user (not invited, not a founder) -- show
      // the publisher registration form.
      return reply.view('pages/register', {
        title: 'Complete Your Profile - OTP',
        description: 'Complete your publisher profile to start publishing coordination intelligence on OTP.',
        noindex: true,
      });
    }

    // Daily Manager Dashboard: every authed user with an org sees the same
    // page now -- the EOS-style daily home. Owners/admins keep the legacy
    // publisher view at /dashboard/publisher (linked from the daily footer).
    const member = (request as any).orgMember as { role: Role; id: string; displayName: string | null; email: string | null; agentAccess: Record<string, boolean>; featureAccess: Record<string, boolean>; dataAccess: Record<string, boolean>; claimedEntityIds?: string[]; } | null;
    const VALID_ROLES: Role[] = ['owner', 'admin', 'manager', 'managee', 'inactive', 'observer', 'implementer', 'visionary', 'integrator', 'free', 'member'];
    const previewParam = (request.query as any)?.previewRole as string | undefined;
    const isOwnerLike = !!(member && canEditOrgSettings(member.role));
    const previewActive = !!(isOwnerLike && previewParam && VALID_ROLES.includes(previewParam as Role));
    const effectiveRole: Role = previewActive
      ? (previewParam as Role)
      : (member ? member.role : 'owner');

    // ---- Multi-org awareness ----
    const userOrgs = await getOrgsForUser(auth.userId);
    const orgListBasic: { id: string; name: string }[] = [];
    if (userOrgs.length > 0) {
      const ids = userOrgs.map(u => u.orgId);
      const rows = await db.select({ id: organizations.id, name: organizations.name })
        .from(organizations).where(inArray(organizations.id, ids));
      for (const r of rows) orgListBasic.push({ id: r.id, name: r.name });
    } else {
      orgListBasic.push({ id: org.id, name: org.name });
    }

    // ---- Optional team filter ----
    // When a real teamId is supplied, every list below is additionally
    // scoped to that team. '' or 'all' means no filter (byte-for-byte
    // unchanged behavior). orgTeams powers the selector dropdown.
    const selectedTeamIdRaw = (request.query as any)?.teamId || '';
    const selectedTeamId = (selectedTeamIdRaw === 'all') ? '' : selectedTeamIdRaw;
    const teamFilterActive = !!selectedTeamId;
    const orgTeams = await db
      .select({ id: teams.id, name: teams.name, slug: teams.slug })
      .from(teams)
      .where(eq(teams.orgId, org.id))
      .orderBy(asc(teams.name));

    // ---- Meetings ----
    // Strict team-membership scope: a member only sees meetings on teams
    // they belong to. Private teams (e.g. "David x Dan") never leak to
    // anyone outside them, regardless of role. Meetings with NULL team_id
    // are treated as unassigned and stay invisible until backfilled to a
    // team. To restore visibility, add the user to the relevant team.
    // Roll recurring series forward so an upcoming occurrence always exists.
    // Lazy + idempotent (no cron): the first dashboard load of the day creates
    // any missing next occurrence; later loads are no-ops. Best-effort.
    try {
      await ensureUpcomingForOrg(org.id);
    } catch (err) {
      request.log.error({ err, orgId: org.id }, 'ensureUpcomingForOrg failed on dashboard load');
    }

    const myTeamIdRows = member
      ? await db.select({ teamId: teamMemberships.teamId })
          .from(teamMemberships)
          .where(eq(teamMemberships.memberId, member.id))
      : [];
    const myTeamIds = myTeamIdRows.map(r => r.teamId);
    const meetingsList = myTeamIds.length === 0
      ? []
      : await db.select().from(meetings)
          .where(and(
            eq(meetings.organizationId, org.id),
            isNull(meetings.deletedAt),
            inArray(meetings.teamId, myTeamIds),
            ...(teamFilterActive ? [eq(meetings.teamId, selectedTeamId)] : []),
          ))
          .orderBy(desc(meetings.scheduledAt))
          .limit(50);

    // Split for the dashboard list: upcoming (soonest first) on top, past
    // (most recent first) on the bottom. A meeting counts as past once it is
    // completed/cancelled OR its scheduled time has passed. Each row carries a
    // recurrence label for display.
    const _now = Date.now();
    const _withLabel = (m: typeof meetingsList[number]) => ({
      ...m,
      recurrenceLabel: ruleToLabel(m.recurrenceRule, m.scheduledAt),
    });
    const upcomingMeetings = meetingsList
      .filter(m => m.status !== 'completed' && m.status !== 'cancelled' && new Date(m.scheduledAt).getTime() >= _now)
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
      .map(_withLabel);
    const pastMeetings = meetingsList
      .filter(m => !(m.status !== 'completed' && m.status !== 'cancelled' && new Date(m.scheduledAt).getTime() >= _now))
      .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
      .map(_withLabel);

    let selectedMeetingId = (request.query as any)?.meetingId as string | undefined;
    if (!selectedMeetingId || !meetingsList.find(m => m.id === selectedMeetingId)) {
      // Default to the next upcoming meeting; fall back to the most recent.
      const now = new Date();
      const upcoming = meetingsList
        .filter(m => new Date(m.scheduledAt) >= now)
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];
      selectedMeetingId = upcoming?.id || meetingsList[0]?.id || '';
    }

    // ---- Headlines ----
    // When a team filter is active, scope headlines to that team. Otherwise
    // keep the legacy behavior: headlines for the selected meeting.
    let headlinesList: any[] = [];
    if (teamFilterActive) {
      headlinesList = await db.select().from(meetingHeadlines)
        .where(and(eq(meetingHeadlines.teamId, selectedTeamId), eq(meetingHeadlines.orgId, org.id), isNull(meetingHeadlines.readAt)))
        .orderBy(desc(meetingHeadlines.createdAt));
    } else if (selectedMeetingId) {
      headlinesList = await db.select().from(meetingHeadlines)
        .where(and(eq(meetingHeadlines.meetingId, selectedMeetingId), eq(meetingHeadlines.orgId, org.id), isNull(meetingHeadlines.readAt)))
        .orderBy(desc(meetingHeadlines.createdAt));
    }

    // ---- Quarter ----
    const now = new Date();
    const q = Math.floor(now.getMonth() / 3) + 1;
    const currentQuarter = `${now.getFullYear()}-Q${q}`;

    // ---- Owner identity for "my" filtering ----
    // Resolve legacy-founder context first so we can scrub claimed IDs.
    // Defense-in-depth: HUM_DAVIDSTEEL must NEVER appear in a non-founder's
    // claimedEntityIds. The chart-claim-reconcile path has a known drift
    // pattern (Bogdan's row claimed HUM_DAVIDSTEEL via email-match) that
    // can put the founder's canonical tile into someone else's claims. If
    // that happens, every downstream "my X" query (myRocks, myKpis,
    // myTodos, delegated*) starts returning the founder's data. Strip
    // HUM_DAVIDSTEEL out for non-founders regardless of DB state.
    // Caught 2026-05-27 when Kristen still saw David's todos on
    // /dashboard despite the c874f7fd founder-only union fix -- the leak
    // was upstream, in claimedIds itself.
    const { getAuth: _getAuthForClaim } = await import('@clerk/fastify');
    const _authForClaim = _getAuthForClaim(request);
    // Under super-admin impersonation, Clerk auth.userId stays as the admin
    // (David) while request.impersonation.as is the impersonated user's
    // (Kristen's) Clerk ID. The legacy-founder check must use the EFFECTIVE
    // viewer -- otherwise an admin "view as Kristen" still treats the
    // session as the founder, the HUM_DAVIDSTEEL fallback fires, and
    // David's todos leak into the impersonated view. Caught 2026-05-27
    // after the morning hotfix's auth.userId check was still bypassed
    // by impersonation.
    const _imp = (request as any).impersonation as { as?: string } | null;
    const _effectiveClerkId = _imp?.as || _authForClaim.userId;
    const _isLegacyFounder = !!(_effectiveClerkId && (org as any).clerkOrgId === _effectiveClerkId);
    const _rawClaimedIds = ((member as any)?.claimedEntityIds as string[] | undefined) || [];
    const claimedIds = _isLegacyFounder
      ? _rawClaimedIds
      : _rawClaimedIds.filter((id: string) => id !== 'HUM_DAVIDSTEEL');
    const myExternalId = claimedIds[0] || (member?.email || '');

    // ---- My Rocks ----
    let myRocks: any[] = [];
    if (myExternalId) {
      myRocks = await db.select().from(rocks)
        .where(and(
          eq(rocks.organizationId, org.id),
          isNull(rocks.deletedAt),
          eq(rocks.quarter, currentQuarter),
          eq(rocks.ownerExternalId, myExternalId),
          ...(teamFilterActive ? [eq(rocks.teamId, selectedTeamId)] : []),
        ))
        .orderBy(desc(rocks.dueDate));
    }

    // ---- My KPIs ----
    let myKpis: any[] = [];
    let kpiValuesMap: Record<string, { value: number | null; periodStart: Date; periodEnd: Date }> = {};
    if (myExternalId) {
      myKpis = await db.select().from(kpis)
        .where(and(
          eq(kpis.organizationId, org.id),
          isNull(kpis.deletedAt),
          eq(kpis.ownerExternalId, myExternalId),
          ...(teamFilterActive ? [eq(kpis.teamId, selectedTeamId)] : []),
        ))
        .orderBy(kpis.title);
      for (const k of myKpis) {
        const [latest] = await db.select().from(kpiValues)
          .where(eq(kpiValues.kpiId, k.id))
          .orderBy(desc(kpiValues.periodStart))
          .limit(1);
        if (latest) kpiValuesMap[k.id] = { value: latest.value, periodStart: latest.periodStart, periodEnd: latest.periodEnd };
      }
    }

    // ---- My To-Dos (open) ----
    // Owner resolution accepts ANY of the user's known external IDs:
    //   - claimedEntityIds (agent and human tiles this member has claimed)
    //   - email (legacy fallback when no chart claim exists)
    //   - canonical human tile (HUM_DAVIDSTEEL etc) — ONLY for the legacy
    //     founder, so the agents that push to that tile by id still surface
    //     on the founder's dashboard. For any non-founder member this
    //     branch is skipped; otherwise we would leak the founder's
    //     agent-pushed todos onto every invited member's /dashboard.
    // Fixed 2026-05-27 (commit 874f7fd) after the security audit caught
    // the same V1 placeholder pattern we fixed in /me/todos on 2026-05-26.
    // _isLegacyFounder is computed above where claimedIds is built.
    const ownerCandidates = Array.from(new Set([
      ...claimedIds,
      ...(member?.email ? [member.email] : []),
      ...(_isLegacyFounder ? ['HUM_DAVIDSTEEL'] : []),
    ].filter(Boolean) as string[]));
    // Enriched todos: include the meeting title + team name so the view
    // can show a source label per todo (Personal / From <meeting>).
    // Recurrence templates are hidden -- only their instances appear in
    // user-facing lists.
    let myTodos: any[] = [];
    if (ownerCandidates.length > 0) {
      myTodos = await db
        .select({
          id: todos.id,
          title: todos.title,
          description: todos.description,
          dueAt: todos.dueAt,
          dueAtHistory: todos.dueAtHistory,
          doneAt: todos.doneAt,
          kind: todos.kind,
          priority: todos.priority,
          recurrenceRule: todos.recurrenceRule,
          recurrenceParentId: todos.recurrenceParentId,
          meetingId: todos.meetingId,
          teamId: todos.teamId,
          createdAt: todos.createdAt,
          createdBy: todos.createdBy,
          ownerEntityType: todos.ownerEntityType,
          ownerExternalId: todos.ownerExternalId,
          meetingTitle: meetings.title,
          teamName: teams.name,
        })
        .from(todos)
        .leftJoin(meetings, eq(meetings.id, todos.meetingId))
        .leftJoin(teams, eq(teams.id, todos.teamId))
        .where(and(
          eq(todos.organizationId, org.id),
          isNull(todos.deletedAt),
          isNull(todos.doneAt),
          isNull(todos.parentTodoId),
          isNull(todos.recurrenceRule),
          inArray(todos.ownerExternalId, ownerCandidates),
          ...(teamFilterActive ? [eq(todos.teamId, selectedTeamId)] : []),
        ))
        .orderBy(asc(todos.priority), asc(todos.dueAt), desc(todos.createdAt))
        .limit(100);
    }

    // ---- Delegated To-Dos ----
    // Todos this user delegated to someone else. Owned by the assignee, but
    // the delegator* columns point back to the current user.
    //   delegatedWaiting -- still in progress (assignee hasn't finished).
    //   delegatedVerify  -- assignee marked done, delegator hasn't verified.
    let delegatedWaiting: any[] = [];
    let delegatedVerify: any[] = [];
    if (ownerCandidates.length > 0) {
      delegatedWaiting = await db
        .select({
          id: todos.id,
          title: todos.title,
          description: todos.description,
          dueAt: todos.dueAt,
          dueAtHistory: todos.dueAtHistory,
          doneAt: todos.doneAt,
          kind: todos.kind,
          priority: todos.priority,
          ownerEntityType: todos.ownerEntityType,
          ownerExternalId: todos.ownerExternalId,
          ownerName: todos.ownerName,
          createdAt: todos.createdAt,
          verifiedAt: todos.verifiedAt,
          delegatorName: todos.delegatorName,
        })
        .from(todos)
        .where(and(
          eq(todos.organizationId, org.id),
          isNull(todos.deletedAt),
          inArray(todos.delegatorExternalId, ownerCandidates),
          isNull(todos.doneAt),
          isNull(todos.recurrenceRule),
          ...(teamFilterActive ? [eq(todos.teamId, selectedTeamId)] : []),
        ))
        .orderBy(asc(todos.priority), asc(todos.dueAt), desc(todos.createdAt))
        .limit(100);

      delegatedVerify = await db
        .select({
          id: todos.id,
          title: todos.title,
          description: todos.description,
          dueAt: todos.dueAt,
          dueAtHistory: todos.dueAtHistory,
          doneAt: todos.doneAt,
          kind: todos.kind,
          priority: todos.priority,
          ownerEntityType: todos.ownerEntityType,
          ownerExternalId: todos.ownerExternalId,
          ownerName: todos.ownerName,
          createdAt: todos.createdAt,
          verifiedAt: todos.verifiedAt,
          delegatorName: todos.delegatorName,
        })
        .from(todos)
        .where(and(
          eq(todos.organizationId, org.id),
          isNull(todos.deletedAt),
          inArray(todos.delegatorExternalId, ownerCandidates),
          isNotNull(todos.doneAt),
          isNull(todos.verifiedAt),
          isNull(todos.recurrenceRule),
          ...(teamFilterActive ? [eq(todos.teamId, selectedTeamId)] : []),
        ))
        .orderBy(asc(todos.priority), asc(todos.dueAt), desc(todos.createdAt))
        .limit(100);
    }

    // ---- My Issues (open IDS) ----
    let myIssues: any[] = [];
    if (myExternalId) {
      myIssues = await db.select().from(tickets)
        .where(and(
          eq(tickets.orgId, org.id),
          isNull(tickets.deletedAt),
          eq(tickets.ownerExternalId, myExternalId),
          sql`${tickets.idsStatus} IN ('open', 'identified', 'discussed')`,
          ...(teamFilterActive ? [eq(tickets.teamId, selectedTeamId)] : []),
        ))
        .orderBy(desc(tickets.createdAt))
        .limit(50);
    } else {
      // No claimed tile yet -- show the org-wide open IDS list so the user
      // is not staring at an empty page.
      myIssues = await db.select().from(tickets)
        .where(and(
          eq(tickets.orgId, org.id),
          isNull(tickets.deletedAt),
          sql`${tickets.idsStatus} IN ('open', 'identified', 'discussed')`,
          ...(teamFilterActive ? [eq(tickets.teamId, selectedTeamId)] : []),
        ))
        .orderBy(desc(tickets.createdAt))
        .limit(20);
    }

    // ---- My Agents ----
    // Source from the team graph (the org chart's truth) rather than the
    // manager_agents upload table. The chart at /dashboard/team is what
    // operators actually maintain. Score comes from maturity_level if set
    // (Bassim writes this); KPI count from kpis table joined on external id.
    const teamGraphForAgents = await getOrgTeamGraph(org.id, org.name || 'Organization');
    const allAgentNodes = teamGraphForAgents.nodes.filter(n => n.type === 'agent');
    const ownedAgentNodes = claimedIds.length > 0
      ? allAgentNodes.filter(n => claimedIds.includes(n.externalId))
      : allAgentNodes;
    const orgKpisForAgents = await db.select({ ownerExternalId: kpis.ownerExternalId })
      .from(kpis)
      .where(eq(kpis.organizationId, org.id));
    const kpiCountByExt: Record<string, number> = {};
    for (const k of orgKpisForAgents) {
      if (k.ownerExternalId) kpiCountByExt[k.ownerExternalId] = (kpiCountByExt[k.ownerExternalId] || 0) + 1;
    }
    const myAgents = ownedAgentNodes.map(n => {
      const props = n.properties as any;
      const score = typeof props.maturityLevel === 'number' ? props.maturityLevel : 0;
      const kpiCount = kpiCountByExt[n.externalId] || 0;
      return {
        id: n.id,
        externalId: n.externalId,
        name: n.label,
        description: props.role || props.mission || '',
        score,
        kpiCount,
        runCount: 0,
        mcpConnectedAt: null,
        kpis: [] as any[],
      };
    }).sort((a, b) => (b.score || 0) - (a.score || 0));

    // ---- Assignable people (for delegating todos) ----
    // Humans + agents from the org chart graph, humans first then agents,
    // alphabetical within each group.
    const assignablePeople = teamGraphForAgents.nodes
      .filter(n => n.type === 'human' || n.type === 'agent')
      .map(n => ({ entityType: n.type, externalId: n.externalId, name: n.label }))
      .sort((a, b) => a.entityType !== b.entityType
        ? (a.entityType === 'human' ? -1 : 1)
        : a.name.localeCompare(b.name));

    // ---- Delegator identity (current user as the one delegating) ----
    const meExternalId = ownerCandidates[0] || '';
    const meName = member?.displayName || org.name;
    const meEntityType = 'human';

    // ---- MCP status ----
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const orgKeys = await db.select().from(apiKeys)
      .where(and(eq(apiKeys.orgId, org.id), isNull(apiKeys.revokedAt)))
      .limit(20);
    const liveKey = orgKeys.find(k => k.lastUsedAt && k.lastUsedAt >= sevenDaysAgo);
    const mcpStatus = {
      connected: !!liveKey,
      hasKey: orgKeys.length > 0,
      lastUsedAt: liveKey?.lastUsedAt || null,
      keyPrefix: liveKey?.keyPrefix || (orgKeys[0]?.keyPrefix || null),
    };

    // ---- Chart <-> work reconciliation ----
    // Cross-check the org chart (the seats) against the work attached to
    // those seats (KPIs, rocks, open issues). Surfaces three gaps:
    //   - seats with no measurable (no KPI, no rock)
    //   - work owned by an external id that has no seat on the chart
    //   - agents that escalate/report to nobody human
    let accountabilityGaps: {
      seatsNoMeasurable: { externalId: string; label: string; type: string; reportsTo: string | null }[];
      orphanedWork: { recordId: string; kind: 'kpi' | 'rock' | 'issue'; label: string; ownerExternalId: string }[];
      agentsNoHuman: { externalId: string; label: string; reportsTo: string | null }[];
    } = { seatsNoMeasurable: [], orphanedWork: [], agentsNoHuman: [] };
    try {
      const seatNodes = teamGraphForAgents.nodes.filter(n => n.type === 'human' || n.type === 'agent');
      const seatIds = new Set(seatNodes.map(n => n.externalId));

      // Node lookup + "which seat does this node report to" (external id of the manager).
      const nodeById = new Map(teamGraphForAgents.nodes.map(n => [n.id, n]));
      const reportsToOf = (nodeId: string): string | null => {
        const e = teamGraphForAgents.edges.find(ed => ed.type === 'reports_to' && ed.sourceId === nodeId);
        if (!e) return null;
        const tgt = nodeById.get(e.targetId);
        return tgt ? tgt.externalId : null;
      };

      // Every KPI / rock / open issue as an individual record, with its owner.
      const [kpiRows, rockRows, ticketRows] = await Promise.all([
        db.select({ id: kpis.id, title: kpis.title, owner: kpis.ownerExternalId })
          .from(kpis)
          .where(and(eq(kpis.organizationId, org.id), isNull(kpis.deletedAt))),
        db.select({ id: rocks.id, title: rocks.title, owner: rocks.ownerExternalId })
          .from(rocks)
          .where(and(eq(rocks.organizationId, org.id), isNull(rocks.deletedAt))),
        db.select({ id: tickets.id, title: tickets.title, owner: tickets.ownerExternalId })
          .from(tickets)
          .where(and(
            eq(tickets.orgId, org.id),
            isNull(tickets.deletedAt),
            sql`${tickets.idsStatus} IN ('open', 'identified', 'discussed')`,
          )),
      ]);
      const kpiOwners = new Set(kpiRows.map(r => r.owner).filter(Boolean) as string[]);
      const rockOwners = new Set(rockRows.map(r => r.owner).filter(Boolean) as string[]);

      // Seats carrying no measurable: not a KPI owner AND not a rock owner.
      accountabilityGaps.seatsNoMeasurable = seatNodes
        .filter(n => !kpiOwners.has(n.externalId) && !rockOwners.has(n.externalId))
        .map(n => ({ externalId: n.externalId, label: n.label, type: n.type, reportsTo: reportsToOf(n.id) }));

      // Each work record whose owner is not a seat on the chart.
      const orphanedWork: { recordId: string; kind: 'kpi' | 'rock' | 'issue'; label: string; ownerExternalId: string }[] = [];
      const collectOrphans = (
        rows: { id: string; title: string; owner: string | null }[],
        kind: 'kpi' | 'rock' | 'issue',
      ) => {
        for (const row of rows) {
          if (!row.owner || seatIds.has(row.owner)) continue;
          orphanedWork.push({ recordId: row.id, kind, label: row.title, ownerExternalId: row.owner });
        }
      };
      collectOrphans(kpiRows, 'kpi');
      collectOrphans(rockRows, 'rock');
      collectOrphans(ticketRows, 'issue');
      accountabilityGaps.orphanedWork = orphanedWork;

      // Agents that never reach a human by walking reports_to/escalates_to upward.
      const upwardEdges = teamGraphForAgents.edges.filter(
        e => e.type === 'reports_to' || e.type === 'escalates_to',
      );
      const reachesHuman = (startId: string): boolean => {
        const visited = new Set<string>([startId]);
        let frontier = [startId];
        while (frontier.length > 0) {
          const next: string[] = [];
          for (const id of frontier) {
            for (const e of upwardEdges) {
              if (e.sourceId !== id || visited.has(e.targetId)) continue;
              const tgt = nodeById.get(e.targetId);
              if (tgt && tgt.type === 'human') return true;
              visited.add(e.targetId);
              next.push(e.targetId);
            }
          }
          frontier = next;
        }
        return false;
      };
      accountabilityGaps.agentsNoHuman = teamGraphForAgents.nodes
        .filter(n => n.type === 'agent' && !reachesHuman(n.id))
        .map(n => ({ externalId: n.externalId, label: n.label, reportsTo: reportsToOf(n.id) }));
    } catch {
      accountabilityGaps = { seatsNoMeasurable: [], orphanedWork: [], agentsNoHuman: [] };
    }

    // ---- Delegate-and-Elevate: owners carrying a heavy recurring load that
    // could be handed to a lower seat or an agent. ----
    let delegateElevate: { externalId: string; name: string; count: number; oldestTitle: string; oldestDays: number }[] = [];
    try {
      const recurringRows = await db.select({
        owner: todos.ownerExternalId,
        ownerName: todos.ownerName,
        title: todos.title,
        createdAt: todos.createdAt,
      }).from(todos).where(and(
        eq(todos.organizationId, org.id),
        isNull(todos.deletedAt),
        sql`${todos.recurrenceRule} IS NOT NULL`,
      ));
      const byOwner = new Map<string, { name: string; items: { title: string; createdAt: Date }[] }>();
      for (const r of recurringRows) {
        if (!r.owner) continue;
        const entry = byOwner.get(r.owner) || { name: r.ownerName || r.owner, items: [] };
        entry.items.push({ title: r.title, createdAt: r.createdAt });
        byOwner.set(r.owner, entry);
      }
      const nowMs = Date.now();
      const HANDOFF_MIN_COUNT = 3;
      const HANDOFF_AGE_DAYS = 90;
      byOwner.forEach((entry, externalId) => {
        const oldest = entry.items.reduce((a, b) => (a.createdAt <= b.createdAt ? a : b));
        const oldestDays = Math.floor((nowMs - oldest.createdAt.getTime()) / 86400000);
        if (entry.items.length >= HANDOFF_MIN_COUNT || oldestDays >= HANDOFF_AGE_DAYS) {
          delegateElevate.push({
            externalId,
            name: entry.name,
            count: entry.items.length,
            oldestTitle: oldest.title,
            oldestDays,
          });
        }
      });
      delegateElevate.sort((a, b) => b.count - a.count);
    } catch {
      delegateElevate = [];
    }

    // ---- Founder-Dependency: share of open work owned by the top human
    // seat (the chart's CEO -- a human with nobody above). ----
    let founderDependency: {
      hasTopSeat: boolean; pct: number; ownedByTop: number; totalOpen: number; topNames: string[];
    } = { hasTopSeat: false, pct: 0, ownedByTop: 0, totalOpen: 0, topNames: [] };
    try {
      const reportsToSources = new Set(
        teamGraphForAgents.edges.filter(e => e.type === 'reports_to').map(e => e.sourceId),
      );
      const topHumans = teamGraphForAgents.nodes.filter(
        n => n.type === 'human' && !reportsToSources.has(n.id),
      );
      if (topHumans.length > 0) {
        const topIds = new Set(topHumans.map(n => n.externalId));
        const [fdRocks, fdKpis, fdTickets, fdTodos] = await Promise.all([
          db.select({ owner: rocks.ownerExternalId }).from(rocks)
            .where(and(eq(rocks.organizationId, org.id), isNull(rocks.deletedAt))),
          db.select({ owner: kpis.ownerExternalId }).from(kpis)
            .where(and(eq(kpis.organizationId, org.id), isNull(kpis.deletedAt))),
          db.select({ owner: tickets.ownerExternalId }).from(tickets)
            .where(and(
              eq(tickets.orgId, org.id),
              isNull(tickets.deletedAt),
              sql`${tickets.idsStatus} IN ('open', 'identified', 'discussed')`,
            )),
          db.select({ owner: todos.ownerExternalId }).from(todos)
            .where(and(
              eq(todos.organizationId, org.id),
              isNull(todos.deletedAt),
              isNull(todos.doneAt),
              sql`${todos.recurrenceRule} IS NULL`,
            )),
        ]);
        const allOpen = [...fdRocks, ...fdKpis, ...fdTickets, ...fdTodos];
        const totalOpen = allOpen.length;
        const ownedByTop = allOpen.filter(r => r.owner && topIds.has(r.owner)).length;
        founderDependency = {
          hasTopSeat: true,
          pct: totalOpen > 0 ? Math.round((ownedByTop / totalOpen) * 100) : 0,
          ownedByTop,
          totalOpen,
          topNames: topHumans.map(n => n.label),
        };
      }
    } catch {
      founderDependency = { hasTopSeat: false, pct: 0, ownedByTop: 0, totalOpen: 0, topNames: [] };
    }

    return reply.view('pages/dashboard-daily', {
      title: 'Dashboard - OTP',
      description: 'Your daily manager dashboard -- run your meeting, track rocks, push KPIs, manage your agents.',
      renderDescription,
      ogImage: BASE_URL + '/public/og-image.png',
      noindex: true,
      org,
      orgs: orgListBasic,
      member: member ? { ...member, role: effectiveRole } : { role: effectiveRole, displayName: null, email: null, agentAccess: {}, featureAccess: {}, dataAccess: {} },
      memberClaimedEntityIds: claimedIds,
      capabilities: capabilitiesFor(effectiveRole),
      isIntegrator: canIntegrate(effectiveRole),
      meetings: meetingsList,
      upcomingMeetings,
      pastMeetings,
      selectedMeetingId,
      headlines: headlinesList,
      currentQuarter,
      myRocks,
      myKpis,
      kpiValues: kpiValuesMap,
      myTodos,
      delegatedWaiting,
      delegatedVerify,
      assignablePeople,
      meExternalId,
      meName,
      meEntityType,
      myIssues,
      myAgents,
      mcpStatus,
      accountabilityGaps,
      delegateElevate,
      founderDependency,
      orgTeams,
      selectedTeamId,
      previewRole: previewActive ? previewParam : '',
    });
  });

  // Legacy publisher dashboard (OOS files, claims, network learnings).
  // Linked from the daily dashboard footer for owners/admins.
  app.get('/dashboard/publisher', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) return reply.redirect('/sign-in?redirect=/dashboard/publisher');

    const memberDecoration = (request as any).orgMember as { orgId: string } | null;
    let org: any = null;
    if (memberDecoration?.orgId) {
      const [m] = await db.select().from(organizations).where(eq(organizations.id, memberDecoration.orgId)).limit(1);
      if (m) org = m;
    }
    if (!org) {
      const [legacy] = await db.select().from(organizations)
        .where(eq(organizations.clerkOrgId, auth.userId)).limit(1);
      if (legacy) org = legacy;
    }
    if (!org) return reply.redirect('/dashboard');

    // Same publisher data as the original /dashboard owner branch.
    // Signed in + has org -- show real dashboard
    const orgOosFiles = await db.select()
      .from(oosFiles)
      .where(eq(oosFiles.orgId, org.id))
      .orderBy(desc(oosFiles.publishedAt));

    const totalClaims = orgOosFiles.filter(f => f.status === 'published').reduce((sum, f) => sum + f.claimCount, 0);

    const connections = await db.execute(sql`
      SELECT COUNT(DISTINCT CASE
        WHEN oos_a_id IN (SELECT id FROM oos_files WHERE org_id = ${org.id}) THEN oos_b_id
        ELSE oos_a_id
      END) AS connected_orgs
      FROM claim_similarities
      WHERE oos_a_id IN (SELECT id FROM oos_files WHERE org_id = ${org.id})
         OR oos_b_id IN (SELECT id FROM oos_files WHERE org_id = ${org.id})
    `);

    // Get Coordination Score from latest published OOS frontmatter
    const latestPublished = orgOosFiles.find(f => f.status === 'published');
    const coordinationScore = latestPublished?.frontmatter ? (latestPublished.frontmatter as any).coordination_score : null;

    // Get best practice matches count
    let bestPracticeMatchCount = 0;
    if (latestPublished) {
      const [bpCount] = await db.select({ count: sql<number>`COUNT(*)` })
        .from(oosBestPracticeMatches)
        .where(eq(oosBestPracticeMatches.oosFileId, latestPublished.id));
      bestPracticeMatchCount = Number(bpCount?.count || 0);
    }

    // Get learnings count (claims with source='learning')
    let learningsCount = 0;
    if (latestPublished) {
      const [lCount] = await db.select({ count: sql<number>`COUNT(*)` })
        .from(claims)
        .where(and(eq(claims.oosFileId, latestPublished.id), eq(claims.source, 'learning')));
      learningsCount = Number(lCount?.count || 0);
    }

    const annotatedOos = annotateOosStaleness(orgOosFiles);

    // Get network learnings (from other orgs)
    let networkLearnings: any[] = [];
    try {
      const nlResult = await db.execute(sql`
        SELECT c.rule, c.why, c.failure_mode, c.agent_name, o.name as org_name,
               c.created_at
        FROM claims c
        JOIN oos_files f ON c.oos_file_id = f.id
        JOIN organizations o ON f.org_id = o.id
        WHERE c.source = 'learning' AND f.status = 'published' AND f.org_id != ${org.id}
        ORDER BY c.created_at DESC LIMIT 5
      `);
      networkLearnings = (nlResult.rows as any[]) || [];
    } catch {}

    return reply.view('pages/dashboard-admin', {
      title: 'Publisher Dashboard - OTP',
      description: 'Manage your OOS files, track publisher stats, and monitor your coordination intelligence on OTP.',
      ogImage: BASE_URL + '/public/og-image.png',
      noindex: true,
      authState: 'authenticated',
      dashboard: {
        profile: { name: org.name, industry: org.industry, size: org.size, badge: org.badge, qualityTier: org.qualityTier, agenticLevel: org.agenticLevel, agenticLabel: org.agenticLevel ? AGENTIC_LEVEL_LABELS[org.agenticLevel] || '' : '' },
        stats: {
          publishedFiles: orgOosFiles.filter(f => f.status === 'published').length,
          totalClaims,
          connectedOrgs: parseInt((connections.rows as any)?.[0]?.connected_orgs || '0', 10),
          views30d: 0,
        },
        oosFiles: annotatedOos,
        staleDraftCount: annotatedOos.filter(f => f.isStale).length,
        updateHistory: orgOosFiles,
        coordinationScore,
        bestPracticeMatchCount,
        learningsCount,
        networkLearnings,
        latestOos: latestPublished || null,
      },
    });
  });
}
