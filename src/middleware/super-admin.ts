import { getAuth } from '@clerk/fastify';
import type { FastifyRequest } from 'fastify';

// David Steel's Clerk user IDs
const SUPER_ADMIN_IDS = new Set([
  'user_3B5XYd7laFLLTmE6JILmBHTnV2G',  // David Steel (Sneeze It)
]);

export function isSuperAdmin(request: FastifyRequest): boolean {
  try {
    const auth = getAuth(request);
    return auth.userId ? SUPER_ADMIN_IDS.has(auth.userId) : false;
  } catch {
    return false;
  }
}
