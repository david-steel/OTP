/**
 * GET /settings/danger -- owner self-serve "Danger zone": delete your own
 * organization, or restore it while a deletion is pending.
 *
 * Uses resolveRequestOrg (NOT the deletion-gated getAuthOrg), so a pending org
 * still renders this page for its owner to restore from. Owner-gated in the
 * view; the delete/restore APIs re-check ownership server-side.
 */
import type { FastifyInstance } from 'fastify';
import { getAuth } from '@clerk/fastify';
import { resolveRequestOrg } from './pages.js';

export default async function orgDangerPage(app: FastifyInstance) {
  app.get('/settings/danger', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId && !(request as any).orgMember) {
      return reply.view('pages/settings-danger', { title: 'Delete organization - OTP', noindex: true, authState: 'unauthenticated' });
    }
    const org = await resolveRequestOrg(request);
    if (!org) {
      return reply.view('pages/settings-danger', { title: 'Delete organization - OTP', noindex: true, authState: 'no_org' });
    }
    const m = (request as any).orgMember as { role?: string } | null;
    const isOwner = (!!auth.userId && org.clerkOrgId === auth.userId) || m?.role === 'owner';
    return reply.view('pages/settings-danger', {
      title: 'Delete organization - OTP',
      noindex: true,
      authState: 'authenticated',
      orgName: org.name,
      isOwner: !!isOwner,
      pending: !!org.deletionRequestedAt,
      deletionRequestedAt: org.deletionRequestedAt ? new Date(org.deletionRequestedAt).toISOString() : null,
    });
  });
}
