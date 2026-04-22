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
