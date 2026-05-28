// Shared helpers for page route modules. Anything imported by more than one
// section file under sections/ lives here.
import ejs from 'ejs';
import { fileURLToPath } from 'node:url';

export const BASE_URL = 'https://orgtp.com';

export function bc(...items: Array<{ name: string; url: string }>) {
  return [{ name: 'Home', url: BASE_URL + '/' }, ...items];
}

// v7 pages render page view + layouts/v7.ejs manually. @fastify/view's layout
// feature throws if a per-route layout is passed while a global layout is
// configured, so v7 routes call renderV7 instead of reply.view.
const V7_VIEWS = fileURLToPath(new URL('../../views', import.meta.url));

// Clerk env (publishable key + derived frontend instance domain) threaded
// into the v7 layout so opt-in pages (loadClerk:true) can mount Clerk widgets
// without falling back to main.ejs. Mirrors server.ts derivation.
const V7_CLERK_PUB_KEY = process.env.CLERK_PUBLISHABLE_KEY || '';
const V7_CLERK_INSTANCE = V7_CLERK_PUB_KEY.startsWith('pk_')
  ? Buffer.from(V7_CLERK_PUB_KEY.split('_').slice(2).join('_'), 'base64').toString().replace(/\$$/, '')
  : '';

export async function renderV7(reply: any, page: string, data: Record<string, any> = {}) {
  const ctx = {
    clerkPubKey: V7_CLERK_PUB_KEY,
    clerkInstance: V7_CLERK_INSTANCE,
    // Per-deploy cache-buster for /public/* (served immutable/1yr).
    assetVersion: (process.env.RAILWAY_GIT_COMMIT_SHA || process.env.GIT_COMMIT_SHA || 'dev').slice(0, 12),
    ...data,
  };
  const body = await ejs.renderFile(`${V7_VIEWS}/pages/${page}.ejs`, ctx);
  const html = await ejs.renderFile(`${V7_VIEWS}/layouts/v7.ejs`, { ...ctx, body });
  return reply.type('text/html').send(html);
}

export function escapeHtml(s: string): string {
  return String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}
