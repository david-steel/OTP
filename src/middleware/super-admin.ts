import { getAuth } from '@clerk/fastify';
import type { FastifyRequest } from 'fastify';

// David Steel's Clerk user IDs (dev + production instances)
const HARDCODED_ADMINS = [
  'user_3B5XYd7laFLLTmE6JILmBHTnV2G',  // David Steel (Sneeze It, dev Clerk)
  'user_3CgTpExyG1730EwxutGzeZnjfO3',  // David Steel (Sneeze It, prod Clerk)
];

// Additional admins from env var (comma-separated Clerk user IDs)
const ENV_ADMINS = (process.env.SUPER_ADMIN_USER_IDS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const SUPER_ADMIN_IDS = new Set<string>([...HARDCODED_ADMINS, ...ENV_ADMINS]);

export function isSuperAdmin(request: FastifyRequest): boolean {
  try {
    const auth = getAuth(request);
    return auth.userId ? SUPER_ADMIN_IDS.has(auth.userId) : false;
  } catch {
    return false;
  }
}

// Narrow, signups-only access for the sales queue at /admin/signups.
// Distinct from super-admin: someone in SIGNUPS_VIEWERS (comma-separated Clerk
// user IDs) can work the new-signup queue WITHOUT getting impersonation, the
// health dashboard, subscribers, or any other admin surface. Super-admins are
// always included. Added 2026-06-16 to give Dawson least-privilege access.
const SIGNUPS_VIEWER_IDS = new Set<string>(
  (process.env.SIGNUPS_VIEWERS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean),
);

export function isSignupsViewer(request: FastifyRequest): boolean {
  try {
    const auth = getAuth(request);
    if (!auth.userId) return false;
    return SIGNUPS_VIEWER_IDS.has(auth.userId) || SUPER_ADMIN_IDS.has(auth.userId);
  } catch {
    return false;
  }
}
