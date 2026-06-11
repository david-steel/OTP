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

// Per-deploy cache-buster for /public/* (served immutable/1yr). Commit SHA
// when Railway provides it, else a per-boot token (a new container per deploy
// yields a new token). Computed ONCE at module load -- never per request, which
// would defeat caching by minting a fresh URL on every page view.
const ASSET_VERSION = (process.env.RAILWAY_GIT_COMMIT_SHA || process.env.GIT_COMMIT_SHA || ('t' + Date.now().toString(36))).slice(0, 12);

export async function renderV7(reply: any, page: string, data: Record<string, any> = {}) {
  const ctx = {
    clerkPubKey: V7_CLERK_PUB_KEY,
    clerkInstance: V7_CLERK_INSTANCE,
    assetVersion: ASSET_VERSION,
    ...data,
  };
  const body = await ejs.renderFile(`${V7_VIEWS}/pages/${page}.ejs`, ctx);
  const html = await ejs.renderFile(`${V7_VIEWS}/layouts/v7.ejs`, { ...ctx, body });
  return reply.type('text/html').send(html);
}

// Dual-rendering helper (GHL-style in-app rendering). Same URL, two shells:
// a signed-in viewer gets the page body inside the authed main layout (app
// nav, bell, What's New megaphone, Help panel preserved), a signed-out
// visitor gets the v7 marketing compose unchanged. The signal is
// request.authUserId, set best-effort by server.ts's preHandler.
//
// Locals contract: server.ts wraps reply.view to auto-inject authUserId /
// impersonation / currentPath / memberRole / isCoach / coachSlug, and the
// fastifyView defaultContext supplies clerkPubKey / clerkInstance /
// assetVersion -- so the main-layout path needs no extra locals beyond what
// the route already passes. Views detect "in shell" via
// `typeof authUserId !== 'undefined' && authUserId`: the v7 path never
// receives authUserId, so the check is false there by construction.
export async function renderInShell(request: any, reply: any, page: string, data: Record<string, any> = {}) {
  const userId = request && request.authUserId ? request.authUserId : null;
  if (userId) return reply.view('pages/' + page, data);
  return renderV7(reply, page, data);
}

export function escapeHtml(s: string): string {
  return String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}
