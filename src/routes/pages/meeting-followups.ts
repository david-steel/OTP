/**
 * GET /l8/meeting/:id/followups -- focused post-meeting page: attach the
 * transcript + recording and generate AI follow-ups (to-dos, issues, headlines,
 * summary). Reached from a button on the Meetings list (/l8), NOT embedded in
 * the live meeting runner -- the transcript usually isn't ready until after the
 * meeting ends, so this is where you finish a meeting up afterward.
 *
 * Self-contained: resolves the meeting record + the owner list itself (via the
 * shared team graph) so it doesn't depend on the meeting-runner's view-data
 * plumbing. The transcript/extract/followups APIs re-check access server-side.
 */
import type { FastifyInstance } from 'fastify';
import { getAuth } from '@clerk/fastify';
import { and, eq, isNull } from 'drizzle-orm';
import { db } from '../../config/database.js';
import { meetings } from '../../db/schema.js';
import { resolveRequestOrg } from './pages.js';
import { isFeatureEnabledForOrg } from '../../services/lab-features.js';
import { getOrgTeamGraph } from '../../services/team-graph.js';

export default async function meetingFollowupsPage(app: FastifyInstance) {
  app.get<{ Params: { id: string } }>('/l8/meeting/:id/followups', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId && !(request as any).orgMember) {
      return reply.redirect('/sign-in?redirect=' + encodeURIComponent(request.url));
    }
    const org = await resolveRequestOrg(request);
    if (!org) return reply.redirect('/l8');

    const [meeting] = await db.select({
      id: meetings.id,
      title: meetings.title,
      teamId: meetings.teamId,
      status: meetings.status,
      transcript: meetings.transcript,
      recordingUrl: meetings.recordingUrl,
      aiSummary: meetings.aiSummary,
    }).from(meetings)
      .where(and(eq(meetings.id, request.params.id), eq(meetings.organizationId, org.id), isNull(meetings.deletedAt)))
      .limit(1);
    if (!meeting) return reply.redirect('/l8');

    const meetingAiEnabled = await isFeatureEnabledForOrg(org.id, 'meeting_ai_followups');

    // Owner list for the review step's owner dropdown -- every human + agent on
    // the chart. Best-effort: an empty list just means to-dos are created with
    // no owner. Mirrors meeting-view-data.ts's availableOwners (minus the
    // in-room badging, which this page doesn't need).
    let availableOwners: Array<{ entityType: string; externalId: string; name: string }> = [];
    try {
      const teamGraph = await getOrgTeamGraph(org.id, org.name);
      availableOwners = teamGraph.nodes
        .filter((n) => n.type === 'agent' || n.type === 'human')
        .map((n) => ({ entityType: n.type, externalId: n.externalId, name: n.label }));
    } catch (err) {
      request.log.debug({ err }, 'followups page: owner graph failed');
    }

    return reply.view('pages/meeting-followups', {
      title: meeting.title + ' - Follow-ups - OTP',
      noindex: true,
      meeting,
      availableOwners,
      meetingAiEnabled,
    });
  });
}
