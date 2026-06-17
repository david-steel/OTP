import Fastify from 'fastify';
import fastifyView from '@fastify/view';
import fastifyStatic from '@fastify/static';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifyCors from '@fastify/cors';
import fastifyCookie from '@fastify/cookie';
import { clerkPlugin } from '@clerk/fastify';
import path from 'path';
import { fileURLToPath } from 'url';
import { gclidCaptureHook } from './middleware/gclid-capture.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = Fastify({
  logger: true,
  ignoreTrailingSlash: true,
});

// Rate limiting
await app.register(fastifyRateLimit, {
  max: 100,
  timeWindow: '1 minute',
});

// Cookies (super-admin impersonation, future: session prefs)
await app.register(fastifyCookie, {
  secret: process.env.IMPERSONATION_SECRET || process.env.CLERK_SECRET_KEY || 'dev-cookie-secret',
});

// Capture Google Ads click identifiers (gclid/gbraid/wbraid) from
// landing URLs into 90-day cookies. Required for server-side SIGNUP
// conversions fired from /onboarding/profile -- see
// src/middleware/gclid-capture.ts and src/lib/google-ads-conversions.ts.
// Registered after @fastify/cookie so reply.setCookie is available.
app.addHook('onRequest', gclidCaptureHook);

// Replace Fastify's default body parsers wholesale so we control both:
//   - x-www-form-urlencoded forms (default Fastify rejects these 415), and
//   - empty-body application/json (default 400s "Body cannot be empty...").
// removeAllContentTypeParsers() clears the built-ins; we re-add the two the
// app actually uses below. (addContentTypeParser('application/json',...) alone
// throws "already present" because the built-in JSON parser is registered.)
app.removeAllContentTypeParsers();

// Accept application/x-www-form-urlencoded bodies for plain HTML form posts
// (impersonation buttons, /l8/create form, accept-invite, etc).
app.addContentTypeParser('application/x-www-form-urlencoded', { parseAs: 'string' }, (_req, body, done) => {
  try {
    const parsed: Record<string, string> = {};
    if (typeof body === 'string' && body.length > 0) {
      const params = new URLSearchParams(body);
      for (const [k, v] of params.entries()) parsed[k] = v;
    }
    done(null, parsed);
  } catch (err) {
    done(err as Error, undefined);
  }
});

// Tolerate EMPTY-body application/json requests. Many client api() calls set
// Content-Type: application/json even on bodyless DELETE/POST (e.g. delete a
// team, remove a member) -- Fastify's default JSON parser 400s those with
// "Body cannot be empty when content-type is set to 'application/json'".
// Parse an empty body to {} instead. Reported 2026-06-02 (delete team /
// remove member). See feedback_fastify_empty_body_post.
app.addContentTypeParser('application/json', { parseAs: 'string' }, (req, body, done) => {
  const raw = typeof body === 'string' ? body : '';
  // Preserve the exact raw body for routes that need it (Clerk/Svix webhook
  // HMAC signature verification). This is the single global JSON parser; the
  // webhook plugin relies on this rawBody rather than its own parser.
  (req as unknown as { rawBody: string }).rawBody = raw;
  if (raw.trim() === '') { done(null, {}); return; }
  try {
    done(null, JSON.parse(raw));
  } catch (err) {
    (err as any).statusCode = 400;
    done(err as Error, undefined);
  }
});

// CORS
await app.register(fastifyCors, {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://orgtp.com', 'https://orger.ai']
    : ['https://orgtp.com', 'https://orger.ai', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
});

// Multipart file uploads (Ninety.io importer at /import/ninety). Adds a parser
// for multipart/form-data only -- JSON/urlencoded handlers are untouched.
// Handlers opt in via request.parts()/request.file(). Caps keep a stray big
// upload from exhausting memory; the importer parses buffers in-memory and
// persists nothing.
await app.register(import('@fastify/multipart'), {
  limits: { fileSize: 8 * 1024 * 1024, files: 12, fieldSize: 1024 * 1024 },
});

// Healthcheck — registered BEFORE Clerk plugin so Clerk's global preHandler
// does not run on /health. Otherwise, if Clerk rejects the key
// ("Publishable key not valid"), every request including /health returns 500
// and Railway rolls back the deploy.
app.get('/health', async () => {
  return {
    status: 'ok',
    version: '0.1.0',
    phase: 'mvp',
    commitSha: process.env.RAILWAY_GIT_COMMIT_SHA || process.env.GIT_COMMIT_SHA || 'unknown',
    branch: process.env.RAILWAY_GIT_BRANCH || 'unknown',
    deployedAt: process.env.RAILWAY_DEPLOYMENT_ID ? new Date().toISOString() : 'unknown',
  };
});

// Public API v1 — encapsulated scope, wide CORS, tighter rate limit.
// Wave 2 will register route files here. Wave 1 just proves the scope works.
// Note: @fastify/cors is registered at root scope above (fastify-plugin breaks
// encapsulation), so we set the public-API CORS headers via an onSend hook
// rather than re-registering the plugin (which would throw FST_ERR_DEC_ALREADY_PRESENT).
const ENABLE_PUBLIC_API = process.env.ENABLE_PUBLIC_API === 'true';
if (ENABLE_PUBLIC_API) {
  await app.register(async (fastify) => {
    fastify.addHook('onSend', async (_req, reply) => {
      reply.header('Access-Control-Allow-Origin', '*');
      reply.header('Access-Control-Allow-Credentials', 'false');
    });
    await fastify.register(fastifyRateLimit, { max: 60, timeWindow: '1 minute' });
    fastify.get('/_status', async () => ({ status: 'ok', api: 'v1', mode: 'public' }));
    await fastify.register(import('./routes/api/public/orgs.js'));
    await fastify.register(import('./routes/api/public/best-practices.js'));
    await fastify.register(import('./routes/api/public/claims-public.js'));
    await fastify.register(import('./routes/api/public/kpis.js'));
  }, { prefix: '/api/v1' });
  console.log('[startup][public-api] enabled at /api/v1');
} else {
  console.log('[startup][public-api] disabled (set ENABLE_PUBLIC_API=true to enable)');
}

// Clerk authentication — boot-resilient. Clerk uses fastify-plugin which
// breaks encapsulation, so its preHandler hook runs on EVERY route (including
// /health). If the publishable key is malformed, Clerk throws "Publishable key
// not valid" on every request → healthcheck fails → Railway rolls back.
// We pre-validate the key format before registering so a bad key skips
// Clerk entirely rather than taking down the whole site.
{
  const pkRaw = process.env.CLERK_PUBLISHABLE_KEY || '';
  const skRaw = process.env.CLERK_SECRET_KEY || '';
  const pk = pkRaw.trim();
  const sk = skRaw.trim();
  console.log('[startup][clerk] pk present:', !!pk, 'prefix:', pk.slice(0, 8), 'len:', pk.length, 'raw_len:', pkRaw.length);
  console.log('[startup][clerk] sk present:', !!sk, 'prefix:', sk.slice(0, 8), 'len:', sk.length, 'raw_len:', skRaw.length);

  const isValidPk = (k: string): boolean => {
    try {
      if (!k.startsWith('pk_live_') && !k.startsWith('pk_test_')) return false;
      const parts = k.split('_');
      if (parts.length !== 3 || !parts[2]) return false;
      const decoded = Buffer.from(parts[2], 'base64').toString();
      if (!decoded.endsWith('$')) return false;
      const domain = decoded.slice(0, -1);
      return domain.includes('.') && !domain.includes('$');
    } catch {
      return false;
    }
  };

  if (!isValidPk(pk)) {
    console.error('[startup][clerk] Publishable key failed format validation — SKIPPING clerkPlugin registration. Auth disabled until fixed.');
  } else {
    try {
      await Promise.race([
        app.register(clerkPlugin, { publishableKey: pk, secretKey: sk }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Clerk plugin register timeout 10s')), 10000)),
      ]);
      console.log('[startup][clerk] plugin registered OK');
    } catch (err) {
      console.error('[startup][clerk] FAILED to register Clerk plugin — server will boot without auth:', err);
    }
  }
}

// Static files (1 year cache for immutable assets)
await app.register(fastifyStatic, {
  root: path.join(__dirname, '..', 'public'),
  prefix: '/public/',
  maxAge: 31536000000,
  immutable: true,
});

// Orger static assets — separate prefix, decorateReply: false to coexist with /public/
await app.register(fastifyStatic, {
  root: path.join(__dirname, '..', 'orger', 'public'),
  prefix: '/orger/public/',
  maxAge: 31536000000,
  immutable: true,
  decorateReply: false,
});

// Conventional favicon path. Pages declare /public/favicon-orgy.png, but old
// crawlers, RSS readers, and link unfurlers request /favicon.ico directly and
// were getting the 404 page.
app.get('/favicon.ico', async (_request, reply) => {
  return reply
    .header('cache-control', 'public, max-age=86400')
    .type('image/png')
    .sendFile('favicon-orgy.png');
});

// Derive Clerk frontend API domain from publishable key
const clerkPubKey = process.env.CLERK_PUBLISHABLE_KEY || '';
const clerkInstance = clerkPubKey.startsWith('pk_')
  ? Buffer.from(clerkPubKey.split('_').slice(2).join('_'), 'base64').toString().replace(/\$$/, '')
  : '';

// EJS templates
await app.register(fastifyView, {
  engine: { ejs: await import('ejs') },
  root: path.join(__dirname, 'views'),
  layout: 'layouts/main',
  defaultContext: {
    clerkPubKey,
    clerkInstance,
    // Per-deploy cache-buster for /public/* assets. They are served
    // immutable/max-age=1yr, so without a versioned URL a new styles.css is
    // never picked up at the edge. The commit SHA changes every deploy.
    assetVersion: (process.env.RAILWAY_GIT_COMMIT_SHA || process.env.GIT_COMMIT_SHA || ('t' + Date.now().toString(36))).slice(0, 12),
  },
});

// Super admin detection -- makes isSuperAdmin available to all page routes
import { isSuperAdmin, isSignupsViewer } from './middleware/super-admin.js';
import { getAuth } from '@clerk/fastify';
app.decorateRequest('isSuperAdmin', false);
app.decorateRequest('isSignupsViewer', false);
app.decorateRequest('authUserId', null as string | null);
app.addHook('preHandler', async (request, reply) => {
  (request as any).isSuperAdmin = isSuperAdmin(request);
  (request as any).isSignupsViewer = isSignupsViewer(request);
  // Server-side auth state for nav rendering. Best-effort: getAuth throws if
  // Clerk plugin didn't register, in which case we treat the user as logged out.
  let userId: string | null = null;
  try { userId = getAuth(request).userId || null; } catch { userId = null; }
  (request as any).authUserId = userId;
  // Demo session (no-Clerk, otp_demo cookie). The layout treats this as "in app"
  // so the left rail renders for a /demo-login visitor (else the menu vanishes).
  let demoSession = false;
  if (!userId) {
    try {
      const { verifyDemoCookie, DEMO_COOKIE_NAME } = await import('./middleware/demo-access.js');
      demoSession = verifyDemoCookie((request as any).cookies?.[DEMO_COOKIE_NAME]);
    } catch { demoSession = false; }
  }
  (request as any).demoSession = demoSession;
  // Auto-inject authUserId + impersonation context into every reply.view
  // call so layout can render auth-aware nav and the impersonation banner
  // without each route needing to remember to pass them.
  const origView = (reply as any).view.bind(reply);
  (reply as any).view = function (template: string, data?: any, opts?: any) {
    const imp = (request as any).impersonation || null;
    // Auto-inject currentPath + memberRole so partials/dashboard-tabs.ejs
    // can render the dashboard tab strip + global Dashboard dropdown
    // without every route re-passing the same locals.
    const om = (request as any).orgMember || null;
    const currentPath = (request.url || '').split('?')[0];
    const memberRole: string | null = om ? om.role : null;
    const isCoach = !!(request as any).isCoach;
    const coachSlug = (request as any).coachSlug || null;
    // Server-rendered initial state for the app sidebar so the collapsed rail
    // doesn't flash open on load. Defensive chaining: preferences is a jsonb
    // column and may be null/corrupt; a missing member (legacy founder with no
    // org_members row) simply defaults to expanded.
    const sidebarCollapsed = !!(om?.preferences as any)?.dashboard?.sidebarCollapsed;
    // Realtime sync (R2): the client only opens the live SSE stream when this
    // is true (server flag + an authed viewer). Default false -> inert.
    const realtimeStreamEnabled = process.env.REALTIME_STREAM_ENABLED === 'true';
    return origView(template, {
      ...(data || {}),
      authUserId: userId,
      impersonation: imp,
      currentPath,
      memberRole,
      isCoach,
      coachSlug,
      sidebarCollapsed,
      realtimeStreamEnabled,
      labNavItems: (request as any).labNavItems || [],
      demoSession: (request as any).demoSession || false,
      sidebarCustomizeOn: (request as any).sidebarCustomizeOn || false,
      sidebarConfig: (request as any).sidebarConfig || null,
    }, opts);
  };
});

// Org member decorator -- attaches the current user's org_members row to
// every request as request.orgMember. Fail-soft: a DB hiccup leaves it null
// rather than 500-ing the whole site. Per-route guards in middleware/guards.ts
// read this decoration to enforce role + access gates.
import { registerOrgMemberDecorator } from './middleware/guards.js';
registerOrgMemberDecorator(app);

// Coach-status decorator: once per request, check whether the current org has
// a claimed consultant_profile and stash isCoach + coachInviteToken on the
// request. The wrapped reply.view above reads these onto every view's locals
// so partials/dashboard-tabs.ejs can decide whether to show the "My Practice"
// tab without each route remembering to pass it. Fail-soft: any error leaves
// isCoach=false (worst case: the tab just doesn't appear).
app.addHook('preHandler', async (request) => {
  const om = (request as any).orgMember;
  if (!om || !om.orgId) return;
  try {
    const { sql } = await import('drizzle-orm');
    const { db } = await import('./config/database.js');
    const r = await db.execute(sql`
      SELECT slug, invite_token
      FROM consultant_profiles
      WHERE org_id = ${om.orgId} AND claimed = true
      LIMIT 1
    `) as any;
    const row = (r.rows || [])[0];
    if (row) {
      (request as any).isCoach = true;
      (request as any).coachSlug = row.slug || null;
      (request as any).coachInviteToken = row.invite_token || null;
    } else {
      (request as any).isCoach = false;
    }
  } catch (err) {
    (request as any).isCoach = false;
    request.log.debug({ err }, 'isCoach decorator failed');
  }
});

// Labs nav decorator: stash the org's unlocked Labs nav items (enabled features
// with a navigable surface) on the request so the layout rail can render them.
// Fail-soft: any error leaves an empty list (the rail just shows core items).
app.addHook('preHandler', async (request) => {
  const om = (request as any).orgMember;
  if (!om || !om.orgId) return;
  try {
    const labMod = await import('./services/lab-features.js');
    (request as any).labNavItems = await labMod.getOrgLabNavItems(om.orgId);
    // Owner-controlled sidebar customization (Labs: sidebar_customize). Only
    // load the org's saved config when the lab is on for this org.
    const sbOn = await labMod.isFeatureEnabledForOrg(om.orgId, 'sidebar_customize');
    (request as any).sidebarCustomizeOn = sbOn;
    if (sbOn) {
      const { db } = await import('./config/database.js');
      const { organizations } = await import('./db/schema.js');
      const { eq } = await import('drizzle-orm');
      const [o] = await db.select({ sidebarConfig: organizations.sidebarConfig })
        .from(organizations).where(eq(organizations.id, om.orgId)).limit(1);
      (request as any).sidebarConfig = (o && o.sidebarConfig) || null;
    }
  } catch (err) {
    (request as any).labNavItems = [];
    request.log.debug({ err }, 'labNavItems decorator failed');
  }
});

// Redirect www to apex domain
app.addHook('onRequest', async (request, reply) => {
  const host = request.hostname;
  if (host === 'www.orgtp.com') {
    const url = `https://orgtp.com${request.url}`;
    return reply.status(301).redirect(url);
  }
});

// Security headers
app.addHook('onSend', async (request, reply) => {
  reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  reply.header('X-Content-Type-Options', 'nosniff');
  reply.header('X-Frame-Options', 'SAMEORIGIN');
  reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  reply.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  // Google Ads conversion + remarketing needs three extra origins beyond
  // googletagmanager.com: the gtag library's view-through pixel loads from
  // googleads.g.doubleclick.net (script), and ccm/collect + rmkt/collect
  // requests go to www.google.com (connect). Without these, the gtag
  // library loads but every conversion fetch is CSP-blocked, so /sign-up
  // pageviews and the post-signup PURCHASE_1 event never reach Google Ads.
  // Diagnosed 2026-05-21 from a live /sign-up audit -- 5 CSP errors per
  // pageload, all of them ads attribution.
  reply.header(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://googleads.g.doubleclick.net https://www.google.com https://cdn.tailwindcss.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.orgtp.com https://d3js.org https://challenges.cloudflare.com https://hcaptcha.com https://*.hcaptcha.com https://assets.calendly.com; worker-src 'self' blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://hcaptcha.com https://*.hcaptcha.com https://assets.calendly.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.clerk.dev https://*.clerk.com https://*.clerk.accounts.dev https://clerk.orgtp.com https://www.google-analytics.com https://www.google.com https://googleads.g.doubleclick.net https://orgtp.com https://challenges.cloudflare.com https://hcaptcha.com https://*.hcaptcha.com https://calendly.com; frame-src 'self' https://*.clerk.accounts.dev https://*.clerk.com https://clerk.orgtp.com https://www.youtube.com https://challenges.cloudflare.com https://hcaptcha.com https://*.hcaptcha.com https://calendly.com;"
  );
  // Suppress Clerk internal headers from public responses
  reply.removeHeader('x-clerk-auth-status');
  reply.removeHeader('x-clerk-auth-reason');
});

// UI styleguide / kitchen sink (public). Verifiable proof surface for the
// design-system foundation -- renders the Orgy tokens + component partials with
// no auth, so it can be screenshotted (Clerk-gated pages can't be visually verified).
app.get('/styleguide', async (request, reply) => {
  return reply.view('pages/styleguide', { title: 'UI Styleguide' });
});

// install.sh at root -- one-line installer for Claude Code
app.get('/install.sh', async (request, reply) => {
  reply.header('Content-Type', 'text/plain; charset=utf-8');
  return reply.sendFile('install.sh');
});

// robots.txt at root
app.get('/robots.txt', async (request, reply) => {
  return reply.sendFile('robots.txt');
});

// Bing Webmaster Tools site verification at root
app.get('/BingSiteAuth.xml', async (request, reply) => {
  reply.type('application/xml');
  return reply.sendFile('BingSiteAuth.xml');
});

// llms.txt at root
app.get('/llms.txt', async (request, reply) => {
  return reply.sendFile('llms.txt');
});

// llms-full.txt -- comprehensive content for AI systems
app.get('/llms-full.txt', async (request, reply) => {
  const { db: database } = await import('./config/database.js');
  const { sql } = await import('drizzle-orm');

  let publisherCount = 0;
  let claimCount = 0;
  let claimSections = '';
  try {
    const pc = await database.execute(sql`SELECT COUNT(DISTINCT org_id) AS c FROM oos_files WHERE status = 'published'`) as any;
    publisherCount = parseInt((pc.rows as any[])?.[0]?.c || '0', 10);
    const cc = await database.execute(sql`SELECT COUNT(*) AS c FROM claims WHERE oos_file_id IN (SELECT id FROM oos_files WHERE status = 'published')`) as any;
    claimCount = parseInt((cc.rows as any[])?.[0]?.c || '0', 10);
    const sections = await database.execute(sql`
      SELECT section, COUNT(*) AS cnt FROM claims
      WHERE oos_file_id IN (SELECT id FROM oos_files WHERE status = 'published')
      GROUP BY section ORDER BY cnt DESC
    `) as any;
    claimSections = (sections.rows || []).map((r: any) => `- ${r.section} (${r.cnt} claims)`).join('\n');
  } catch { /* DB unavailable */ }

  const content = `# OTP - Organization Transport Protocol
# Full Documentation for AI Systems
# https://orgtp.com

> The coordination intelligence layer for AI-native organizations.
> MCP is agent-to-tool. A2A is agent-to-agent. OTP is organization-to-intelligence.

## What Is OTP?

OTP (Organization Transport Protocol) is a platform and protocol where organizations publish, compare, and learn from Organizational Operating Systems (OOS). An OOS is a structured document that captures how an organization's AI agents coordinate. OTP occupies the organizational coordination intelligence layer -- above MCP (Model Context Protocol, which connects agents to tools) and A2A (Agent-to-Agent protocol, which connects agents to each other). OTP connects organizations to collective coordination intelligence.

The platform is live at https://orgtp.com with ${publisherCount} publishers and ${claimCount} knowledge claims.

## Glossary of Terms

### Coordination Intelligence
The collective knowledge of how AI agents within and across organizations should coordinate. Coordination intelligence is captured in structured OOS files, compared across organizations, and surfaced through the Intelligence Graph. It is the organizational equivalent of what training data is to a model -- except it encodes operational coordination patterns rather than language patterns.

### Organizational Operating System (OOS)
A structured artifact that encodes how AI agents in an organization coordinate. An OOS contains knowledge claims organized into sections, each with confidence ratings (HIGH/MEDIUM/LOW), evidence types, failure modes, and reasoning. The OOS format uses YAML frontmatter with Markdown-structured claims.

### Knowledge Claim
An individual operational rule extracted from an OOS. Each claim has: a claim ID (e.g., C001), a section (e.g., core_operating_rules), the rule itself, reasoning (why this rule exists), a documented failure mode (what happens when violated), a confidence level, an evidence type, and a scope.

### Intelligence Graph
A network visualization showing how coordination patterns connect across published OOS files. When two organizations share similar claims, those claims are linked. The graph reveals shared operational truths, unique approaches, and conflicting strategies across the ecosystem.

### Agentic Maturity Levels
An 8-level framework measuring how sophisticated an organization's AI agent coordination is:
- L1: Tab Complete (basic autocomplete)
- L2: Chat Assistant (interactive Q&A)
- L3: Tool User (agents use external tools)
- L4: Workflow Agent (multi-step task execution)
- L5: Autonomous Specialist (domain-expert agents)
- L6: Multi-Agent System (multiple specialized agents)
- L7: Orchestrated Agent Team (coordinated agent fleet with shared state)
- L8: Autonomous Agent Teams (agents coordinate with each other without human mediation)
Based on the framework by Bassim Eledath.

### Confidence Levels
How certain an organization is about a knowledge claim:
- HIGH: Validated through measurement or extensive observation
- MEDIUM: Observed pattern with reasonable supporting evidence
- LOW: Inference, speculation, or newly adopted rule

### Evidence Types
How a knowledge claim was established:
- MEASURED_RESULT: Quantified through data or experiment
- OBSERVED_REPEATEDLY: Seen multiple times in practice
- OBSERVED_ONCE: Seen in practice at least once
- HUMAN_DEFINED_RULE: Established by human decision
- INFERENCE: Derived logically from other claims
- SPECULATION: Hypothesized but not yet validated

### Publisher Badges
Quality tiers assigned to organizations based on OOS completeness, confidence distribution, and evidence quality:
- Founding: One of the first 50 publishers (permanent)
- Platinum: Highest quality tier
- Gold: Strong quality
- Silver: Moderate quality
- Bronze: Entry-level quality

### OOS Templates
Structured formats for different organizational models:
- Agent Army: For organizations with multiple specialized AI agents
- Value Chain: For organizations structured around business process flows
- Org Chart: For traditional hierarchical organizations augmenting with AI

### Claim Sections
Standard categories within an OOS:
${claimSections || '- core_operating_rules\n- agent_roles_and_authority\n- coordination_patterns\n- operational_heuristics\n- failure_patterns\n- human_ai_boundary_conditions'}

## How OTP Works

1. **Publish**: Organizations generate an OOS capturing their AI coordination intelligence -- rules, confidence levels, evidence types, and failure modes.
2. **Compare**: The diff engine shows what is unique, similar, and conflicting between any two OOS files.
3. **Learn**: The Intelligence Graph surfaces coordination patterns that no single organization could discover alone.

## The Three-Layer AI Coordination Stack

| Layer | Protocol | Scope | Example |
|-------|----------|-------|---------|
| Tool Layer | MCP (Model Context Protocol) | Agent-to-Tool | Claude reads a database via MCP |
| Agent Layer | A2A (Agent-to-Agent) | Agent-to-Agent | Two agents negotiate a handoff |
| Organization Layer | OTP (Organization Transport Protocol) | Org-to-Intelligence | 14 agents coordinate via shared operational rules |

OTP is the only protocol that operates at the organizational layer.

## Blog Content Summaries

### The Hard Problem in AI Isn't Intelligence. It's Coordination.
URL: https://orgtp.com/blog/why-we-built-otp
The founding essay. Draws from Feynman's "one sentence" thought experiment to argue that the hardest problem in enterprise AI is not building one good agent but getting multiple agents to coordinate without conflict. Introduces the concept of the "cataclysm code" -- a single artifact containing enough operational intelligence to rebuild how your AI team works.

### What Is an Organizational Operating System?
URL: https://orgtp.com/blog/what-is-an-oos
Deep dive into the OOS format: structured claims with confidence ratings, evidence types, and failure modes. Explains why traditional documentation fails for AI coordination and how the OOS format makes operational knowledge machine-readable, comparable, and improvable.

### We Built This Platform in 48 Hours
URL: https://orgtp.com/blog/built-in-48-hours
Building-in-public narrative of constructing the OTP platform using the same AI agent coordination system the platform measures. Demonstrates recursive credibility -- the system works because it was built by the system.

### Jensen Huang Just Made the Case for OTP
URL: https://orgtp.com/blog/nvidia-made-the-case
Analysis of Jensen Huang's GTC 2026 keynote, where he stated "every company needs an agent strategy." Connects NVIDIA's vision of agentic AI to OTP's thesis that organizations need a coordination intelligence layer.

### Bain Called It Code Red. OTP Solves It.
URL: https://orgtp.com/blog/bain-code-red
Analysis of Bain & Company's report describing enterprise multi-agent coordination as a "Code Red" problem. Maps Bain's identified gaps directly to OTP's solutions.

### Agentic Maturity Levels on OTP
URL: https://orgtp.com/blog/agentic-levels
Explains why OTP added the 8 Levels of Agentic Engineering framework (by Bassim Eledath) as a measurement dimension. Organizations can now see not just what they know, but how mature their coordination is.

### What Is Coordination Intelligence?
URL: https://orgtp.com/blog/what-is-coordination-intelligence
Defines the new category: coordination intelligence is the collective knowledge of how AI agents should coordinate within and across organizations. Distinguishes it from agent orchestration (technical plumbing) and positions the three-layer stack: MCP, A2A, OTP.

### How We Coordinate 14 AI Agents Without Them Stepping on Each Other
URL: https://orgtp.com/blog/how-we-coordinate-14-agents
Practitioner tutorial from running 14 specialized AI agents in production at a digital agency. Covers: pre-computed shared state, one seat/one owner, escalation over autonomy, agent message bus, and the failure patterns encountered along the way.

### Tokens Are the New Currency. Your OOS Is the Budget.
URL: https://orgtp.com/blog/tokens-are-the-new-currency
Explores the token economy of AI-native organizations. Every rule in an OOS costs tokens to load. The Token Efficiency Ratio measures whether each rule earns back more than it spends. Introduces token budgets as the new resource allocation lever and the OOS as a financial plan for AI workforces.

## API

OTP provides a REST API at https://orgtp.com/api/v1/ for programmatic access:
- POST /api/v1/oos -- Publish an OOS file
- GET /api/v1/browse -- List published OOS files
- GET /api/v1/search?q= -- Full-text search across claims
- GET /api/v1/graph -- Intelligence Graph data
- GET /api/v1/oos/:id/claims -- Get claims for an OOS file
- POST /api/v1/merge -- Preview a merge between two OOS files

Authentication via API key (Bearer token). Publishers can generate keys from their dashboard.

## About

OTP was created by David Steel, CEO of Sneeze It, a digital agency that runs 14 AI agents in production. The platform was built using the same agent coordination system it measures -- a recursive proof of concept. The team includes agents named Radar (Chief of Staff), Dan (Strategic Co-Founder), Dash (Performance Analyst), Pepper (Executive Assistant), Crystal (Project Manager), Dirk (Revenue Operator), Jeff (Chief Information Officer), Neil (Chief Learning Officer), and more.

## Contact
- Website: https://orgtp.com
- Creator: David Steel, david@orgtp.com
`;

  reply.header('Content-Type', 'text/plain; charset=utf-8');
  return reply.send(content);
});

// Dynamic sitemap
app.get('/sitemap.xml', async (request, reply) => {
  const { db: database } = await import('./config/database.js');
  const { sql } = await import('drizzle-orm');

  const BASE = 'https://orgtp.com';

  // Static pages
  const staticPages = [
    { loc: '/', priority: '1.0', changefreq: 'daily' },
    { loc: '/protocol', priority: '0.95', changefreq: 'monthly' },
    { loc: '/what-is-otp', priority: '0.95', changefreq: 'weekly' },
    { loc: '/why-otp', priority: '0.95', changefreq: 'weekly' },
    { loc: '/tools', priority: '0.9', changefreq: 'weekly' },
    { loc: '/start-here', priority: '0.9', changefreq: 'monthly' },
    { loc: '/browse', priority: '0.9', changefreq: 'daily' },
    { loc: '/search', priority: '0.8', changefreq: 'daily' },
    { loc: '/graph', priority: '0.8', changefreq: 'weekly' },
    { loc: '/guide', priority: '0.7', changefreq: 'monthly' },
    { loc: '/blog', priority: '0.8', changefreq: 'weekly' },
    { loc: '/publish', priority: '0.7', changefreq: 'monthly' },
    { loc: '/pricing', priority: '0.8', changefreq: 'monthly' },
    { loc: '/trust', priority: '0.7', changefreq: 'monthly' },
    { loc: '/investors', priority: '0.5', changefreq: 'monthly' },
    { loc: '/tickets', priority: '0.4', changefreq: 'weekly' },
    { loc: '/blog/why-we-built-otp', priority: '0.7', changefreq: 'monthly' },
    { loc: '/blog/what-is-an-oos', priority: '0.7', changefreq: 'monthly' },
    { loc: '/blog/built-in-48-hours', priority: '0.7', changefreq: 'monthly' },
    { loc: '/blog/nvidia-made-the-case', priority: '0.7', changefreq: 'monthly' },
    { loc: '/blog/bain-code-red', priority: '0.7', changefreq: 'monthly' },
    { loc: '/blog/agentic-levels', priority: '0.7', changefreq: 'monthly' },
    { loc: '/blog/what-is-coordination-intelligence', priority: '0.8', changefreq: 'monthly' },
    { loc: '/blog/how-we-coordinate-14-agents', priority: '0.8', changefreq: 'monthly' },
    { loc: '/blog/tokens-are-the-new-currency', priority: '0.7', changefreq: 'monthly' },
    { loc: '/blog/otp-vs-crewai-vs-a2a-vs-mcp', priority: '0.8', changefreq: 'monthly' },
    { loc: '/blog/8-levels-of-agentic-maturity', priority: '0.8', changefreq: 'monthly' },
    { loc: '/blog/what-is-an-oos-file', priority: '0.7', changefreq: 'monthly' },
    { loc: '/blog/gas-town-vs-otp', priority: '0.7', changefreq: 'monthly' },
    { loc: '/blog/moltbook-vs-otp', priority: '0.7', changefreq: 'monthly' },
    { loc: '/blog/ai-coordination-stack', priority: '0.8', changefreq: 'monthly' },
    { loc: '/blog/gartner-40-percent-will-fail', priority: '0.8', changefreq: 'monthly' },
    { loc: '/blog/351k-skills-zero-standards', priority: '0.8', changefreq: 'monthly' },
    { loc: '/blog/1500-percent-more-tokens', priority: '0.7', changefreq: 'monthly' },
    { loc: '/blog/the-last-mile-just-got-shorter', priority: '0.8', changefreq: 'monthly' },
    { loc: '/blog/defining-rules-vs-enforcing-them', priority: '0.8', changefreq: 'monthly' },
    { loc: '/blog/personal-ai-revolution-knowledge-layer', priority: '0.8', changefreq: 'monthly' },
    { loc: '/blog/your-ai-is-learning-alone', priority: '0.8', changefreq: 'monthly' },
    { loc: '/blog/coach-dilemma-ai-frameworks', priority: '0.8', changefreq: 'monthly' },
    { loc: '/blog/asaas-desktop-ai-coaching', priority: '0.8', changefreq: 'monthly' },
    { loc: '/blog/unlock-20-years-coaching-experience', priority: '0.8', changefreq: 'monthly' },
    { loc: '/blog/agent-onboarding', priority: '0.8', changefreq: 'monthly' },
    { loc: '/blog/machine-commerce', priority: '0.8', changefreq: 'monthly' },
    { loc: '/blog/mcp-everything', priority: '0.8', changefreq: 'monthly' },
    { loc: '/blog/machine-micropayments', priority: '0.8', changefreq: 'monthly' },
    { loc: '/blog/connected-member', priority: '0.8', changefreq: 'monthly' },
    { loc: '/blog/blessed-path-documentation', priority: '0.8', changefreq: 'monthly' },
    { loc: '/blog/operating-system-agent-onboarding', priority: '0.8', changefreq: 'monthly' },
    { loc: '/blog/activation-energy-bottleneck', priority: '0.8', changefreq: 'monthly' },
    { loc: '/blog/system-prompt-simpler', priority: '0.8', changefreq: 'monthly' },
    { loc: '/blog/coordination-cost-kills', priority: '0.8', changefreq: 'monthly' },
    { loc: '/blog/everyone-ships-code', priority: '0.8', changefreq: 'monthly' },
    { loc: '/blog/one-agent-never-enough', priority: '0.8', changefreq: 'monthly' },
    { loc: '/blog/sandboxed-operations', priority: '0.8', changefreq: 'monthly' },
    { loc: '/blog/ai-team-budget', priority: '0.8', changefreq: 'monthly' },
    { loc: '/blog/api-first-agent-consumers', priority: '0.8', changefreq: 'monthly' },
    { loc: '/blog/agents-are-the-customer', priority: '0.8', changefreq: 'monthly' },
    { loc: '/blog/who-reviews-robots-work', priority: '0.8', changefreq: 'monthly' },
    { loc: '/blog/the-weight-is-wrong-without-it', priority: '0.9', changefreq: 'monthly' },
    { loc: '/claims', priority: '0.8', changefreq: 'weekly' },
    { loc: '/claims/core_operating_rules', priority: '0.7', changefreq: 'weekly' },
    { loc: '/claims/agent_roles_and_authority', priority: '0.7', changefreq: 'weekly' },
    { loc: '/claims/coordination_patterns', priority: '0.7', changefreq: 'weekly' },
    { loc: '/claims/operational_heuristics', priority: '0.7', changefreq: 'weekly' },
    { loc: '/claims/failure_patterns', priority: '0.7', changefreq: 'weekly' },
    { loc: '/claims/human_ai_boundary_conditions', priority: '0.7', changefreq: 'weekly' },
    { loc: '/practices', priority: '0.9', changefreq: 'weekly' },
    { loc: '/agent-builder', priority: '0.9', changefreq: 'weekly' },
    { loc: '/generate', priority: '0.8', changefreq: 'monthly' },
    { loc: '/industries', priority: '0.7', changefreq: 'weekly' },
    { loc: '/experts', priority: '0.8', changefreq: 'weekly' },
    { loc: '/meet-radar', priority: '0.95', changefreq: 'weekly' },
    { loc: '/otp-vs-ninety-eos-one', priority: '0.9', changefreq: 'monthly' },
    { loc: '/import/ninety', priority: '0.85', changefreq: 'monthly' },
    { loc: '/import/bloom', priority: '0.6', changefreq: 'monthly' },
    { loc: '/plan', priority: '0.7', changefreq: 'monthly' },
    { loc: '/glossary', priority: '0.9', changefreq: 'weekly' },
    { loc: '/faq', priority: '0.8', changefreq: 'monthly' },
    { loc: '/answers', priority: '0.9', changefreq: 'weekly' },
    { loc: '/answers/ai-coordination-platform', priority: '0.85', changefreq: 'monthly' },
    { loc: '/answers/organizational-operating-system', priority: '0.85', changefreq: 'monthly' },
    { loc: '/answers/knowledge-sharing-network', priority: '0.85', changefreq: 'monthly' },
    { loc: '/answers/ai-governance-compliance', priority: '0.85', changefreq: 'monthly' },
    { loc: '/answers/ai-playbooks-orchestration', priority: '0.85', changefreq: 'monthly' },
    { loc: '/answers/ai-agent-collaboration', priority: '0.85', changefreq: 'monthly' },
    { loc: '/about', priority: '0.6', changefreq: 'monthly' },
    { loc: '/whats-new', priority: '0.7', changefreq: 'weekly' },
    { loc: '/templates', priority: '0.8', changefreq: 'monthly' },
    { loc: '/process-templates', priority: '0.8', changefreq: 'monthly' },
    { loc: '/premium-support', priority: '0.8', changefreq: 'monthly' },
    { loc: '/guide/connect-your-agent', priority: '0.7', changefreq: 'monthly' },
  ];

  const today = new Date().toISOString().split('T')[0];

  // Dynamic pages: industry practice packs, published OOS files, org profiles
  let dynamicUrls = '';
  try {
    // Industry practice pages (high priority -- these are the Content Engine)
    const industryRows = await database.execute(sql`
      SELECT industry, COUNT(*) AS count, MAX(created_at) AS latest
      FROM best_practices
      WHERE industry IS NOT NULL AND is_original = true AND is_coordination = true
      GROUP BY industry
      ORDER BY count DESC
    `) as any;

    for (const row of (industryRows.rows || [])) {
      const lastmod = row.latest ? new Date(row.latest).toISOString().split('T')[0] : today;
      dynamicUrls += `  <url><loc>${BASE}/practices/${row.industry}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>\n`;
    }

    // Published OOS files and org profiles
    const oosRows = await database.execute(sql`
      SELECT f.id AS oos_id, o.id AS org_id, f.published_at
      FROM oos_files f JOIN organizations o ON f.org_id = o.id
      WHERE f.status = 'published'
      ORDER BY f.published_at DESC
    `) as any;

    const seenOrgs = new Set<string>();
    for (const row of (oosRows.rows || [])) {
      const lastmod = row.published_at ? new Date(row.published_at).toISOString().split('T')[0] : '';
      dynamicUrls += `  <url><loc>${BASE}/oos/${row.oos_id}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}<changefreq>weekly</changefreq><priority>0.6</priority></url>\n`;
      if (!seenOrgs.has(row.org_id)) {
        seenOrgs.add(row.org_id);
        dynamicUrls += `  <url><loc>${BASE}/org/${row.org_id}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}<changefreq>weekly</changefreq><priority>0.5</priority></url>\n`;
      }
    }

    // Published expert (consultant) profiles
    const expertRows = await database.execute(sql`
      SELECT slug, updated_at FROM consultant_profiles WHERE published = true ORDER BY created_at DESC
    `) as any;
    for (const row of (expertRows.rows || [])) {
      if (!row.slug) continue;
      const lastmod = row.updated_at ? new Date(row.updated_at).toISOString().split('T')[0] : today;
      dynamicUrls += `  <url><loc>${BASE}/expert/${row.slug}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>\n`;
    }

    // Industry detail pages -- one per distinct industry with published OOS files
    const industryDetailRows = await database.execute(sql`
      SELECT DISTINCT o.industry
      FROM organizations o
      JOIN oos_files f ON f.org_id = o.id
      WHERE f.status = 'published' AND o.industry IS NOT NULL AND o.industry != ''
    `) as any;
    for (const row of (industryDetailRows.rows || [])) {
      if (!row.industry) continue;
      const encoded = encodeURIComponent(row.industry);
      dynamicUrls += `  <url><loc>${BASE}/industry/${encoded}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>\n`;
    }

    // Glossary term pages -- one per public glossary term
    const glossaryRows = await database.execute(sql`
      SELECT slug, updated_at FROM glossary_terms WHERE public = true ORDER BY name ASC
    `) as any;
    for (const row of (glossaryRows.rows || [])) {
      if (!row.slug) continue;
      const lastmod = row.updated_at ? new Date(row.updated_at).toISOString().split('T')[0] : today;
      dynamicUrls += `  <url><loc>${BASE}/glossary/${row.slug}</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>\n`;
    }
  } catch {
    // If DB unavailable, serve static pages only
  }

  // Conatus blog posts (markdown in content/conatus-posts/)
  try {
    const { listConatusPosts } = await import('./services/conatus-posts.js');
    for (const p of listConatusPosts()) {
      const lastmod = p.date || today;
      dynamicUrls += `  <url><loc>${BASE}/blog/${p.slug}</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n`;
    }
  } catch {
    // If posts dir missing, skip
  }

  // Meeting templates (authored, byte-stable; one /templates/<slug> per item).
  // lastmod is a fixed build date -- the content does not change per request,
  // so we don't want Date.now churning the file on every crawl.
  try {
    const { MEETING_TEMPLATES } = await import('./data/meeting-templates.js');
    const TEMPLATES_LASTMOD = '2026-06-12';
    for (const t of MEETING_TEMPLATES) {
      dynamicUrls += `  <url><loc>${BASE}/templates/${t.slug}</loc><lastmod>${TEMPLATES_LASTMOD}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>\n`;
    }
  } catch {
    // If the templates barrel fails to load, skip
  }

  // Process Library SOPs (authored, byte-stable; one /process-templates/<slug>
  // per SOP). Same fixed-lastmod discipline as the meeting templates above.
  try {
    const { SOP_TEMPLATES } = await import('./data/sop-templates.js');
    const SOPS_LASTMOD = '2026-06-12';
    for (const s of SOP_TEMPLATES) {
      dynamicUrls += `  <url><loc>${BASE}/process-templates/${s.slug}</loc><lastmod>${SOPS_LASTMOD}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>\n`;
    }
  } catch {
    // If the SOP barrel fails to load, skip
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(p => `  <url><loc>${BASE}${p.loc}</loc><lastmod>${today}</lastmod><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`).join('\n')}
${dynamicUrls}</urlset>`;

  reply.header('Content-Type', 'application/xml');
  return reply.send(xml);
});

// ---- API Routes ----
await app.register(import('./routes/api/auth.js'), { prefix: '/api/v1/auth' });
await app.register(import('./routes/api/oos.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/search.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/browse.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/graph.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/team.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/charts.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/teams.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/agents.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/schedules.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/integrations.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/kpis.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/merge.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/scanner.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/api-keys.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/recommendations.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/tickets.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/rocks.js'), { prefix: '/api/v1' });
// Rock AI assist -- PAID SMART-Rock builder upsell (monetization Phase 3).
// Ships gated OFF behind AI_ROCK_ASSIST_LIVE (default = "coming soon").
await app.register(import('./routes/api/rock-ai.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/milestones.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/seats.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/values.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/todos.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/attachments.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/notifications.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/dashboard-preferences.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/whats-new.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/ask-ai.js'), { prefix: '/api/v1' });
// Wallet top-up + auto-recharge config (monetization Phase 2). The Stripe
// webhook is registered SEPARATELY at root scope below so no auth gate blocks
// Stripe and the raw body survives for signature verification.
await app.register(import('./routes/api/billing.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/labs.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/meeting-formats.js'), { prefix: '/api/v1' });
{
  const { stripeWebhookRoutes } = await import('./routes/api/billing.js');
  await app.register(stripeWebhookRoutes);
}
await app.register(import('./routes/api/push.js'), { prefix: '/api/v1' });
// Realtime sync (R1): org-wide live event stream (SSE). Route 404s unless
// REALTIME_STREAM_ENABLED=true, so registering it is inert until flipped.
await app.register(import('./routes/api/events.js'), { prefix: '/api/v1' });

// Service worker at the ORIGIN ROOT (scope '/'), with no-cache so updates
// propagate. Do NOT move this under /public/* -- that path is
// immutable-cached for a year, which would strand old workers.
app.get('/sw.js', async (_request, reply) => {
  const { readFile } = await import('node:fs/promises');
  const path = await import('node:path');
  const swPath = path.join(process.cwd(), 'public', 'sw.js');
  const body = await readFile(swPath, 'utf8');
  reply.header('Cache-Control', 'no-cache');
  reply.type('application/javascript; charset=utf-8');
  return reply.send(body);
});
await app.register(import('./routes/api/meetings.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/headlines.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/manager-agents.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/team-profile.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/consultants.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/workspaces.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/source-documents.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/inquiries.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/admin.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/org-deletion.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/best-practices.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/digest.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/newsletter.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/partner-signup.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/lead-signup.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/oos-operating-plan.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/clerk-webhook.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/onboarding.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/ninety-import.js'), { prefix: '/api/v1' });

// ---- Page Routes (SSR) ----
await app.register(import('./routes/pages/pages.js'));
await app.register(import('./routes/pages/org-danger.js'));
await app.register(import('./routes/pages/sections/blog.js'));
await app.register(import('./routes/pages/sections/templates.js'));
await app.register(import('./routes/pages/sections/sop-library.js'));
await app.register(import('./routes/pages/sections/dashboard.js'));
await app.register(import('./routes/pages/coach-claim.js'));
await app.register(import('./routes/pages/coach-invite.js'));
await app.register(import('./routes/pages/onboarding.js'));

// Custom 404 handler -- return HTML instead of Fastify's default JSON.
// Uses renderV7 (light v7 layout) instead of reply.view (which wraps the
// 404 view in layouts/main.ejs, the OLD dark/heavy nav). Caught
// 2026-05-22 by David hitting /admin while logged-out -- he saw the
// old "protocol for AI agent coordination" content because main.ejs
// + pages/home.ejs was rendering as the 404 fallback.
app.setNotFoundHandler(async (request, reply) => {
  const { renderV7 } = await import('./routes/pages/pages.js');
  return renderV7(reply.status(404), '404', {
    title: 'Page Not Found - OTP',
    description: 'The page you are looking for does not exist.',
    canonical: 'https://orgtp.com/',
    noindex: true,
  });
});

// Custom error handler -- friendly HTML 500 for page routes, JSON for API routes.
app.setErrorHandler(async (err, request, reply) => {
  const error = err as { statusCode?: number; code?: string; message?: string };
  const status = error.statusCode && error.statusCode >= 400 && error.statusCode < 600
    ? error.statusCode
    : 500;
  request.log.error({ err, url: request.url }, 'request error');
  // API routes stay machine-readable.
  if (request.url.startsWith('/api/')) {
    return reply.status(status).send({
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: status >= 500 ? 'Internal server error' : (error.message || 'Error'),
      },
    });
  }
  // Page routes get the friendly 500 view for server errors.
  if (status >= 500) {
    return reply.status(500).view('pages/500', {
      title: 'Something went wrong - OTP',
      description: 'An unexpected error occurred.',
      canonical: 'https://orgtp.com/',
      noindex: true,
    });
  }
  return reply.status(status).send(error.message || 'Error');
});

// Boot-time idempotent migrations.
// Drizzle's migration history has accumulated drift, so we self-heal
// targeted feature tables on startup rather than running db:migrate.
try {
  const { ensurePartnerSignupsTable } = await import('./db/ensure-partner-signups.js');
  await ensurePartnerSignupsTable();
  app.log.info('partner_signups table is ready');
} catch (err) {
  app.log.error({ err }, 'ensurePartnerSignupsTable failed -- /partners and /admin/partners may 500 until resolved');
}

try {
  const { ensureSignupsSalesColumns } = await import('./db/ensure-signups-sales.js');
  await ensureSignupsSalesColumns();
  app.log.info('onboarding_sequence sales columns are ready');
} catch (err) {
  app.log.error({ err }, 'ensureSignupsSalesColumns failed -- /admin/signups may 500 until resolved');
}

try {
  const { ensureMarketplaceTables } = await import('./db/ensure-marketplace.js');
  await ensureMarketplaceTables();
  app.log.info('marketplace tables are ready');
} catch (err) {
  app.log.error({ err }, 'ensureMarketplaceTables failed -- /marketplace may 500 until resolved (gated off by default)');
}

try {
  const { ensureLabOptinsTable } = await import('./db/ensure-lab-optins.js');
  await ensureLabOptinsTable();
  app.log.info('org_lab_optins table is ready');
} catch (err) {
  app.log.error({ err }, 'ensureLabOptinsTable failed -- /settings/labs may 500 until resolved');
}

try {
  const { ensureKpiGroupsTable } = await import('./db/ensure-kpi-groups.js');
  await ensureKpiGroupsTable();
  app.log.info('kpi_groups table is ready');
} catch (err) {
  app.log.error({ err }, 'ensureKpiGroupsTable failed -- KPI group ordering may fall back to alphabetical');
}

try {
  const { ensureMeetingFormatsTable } = await import('./db/ensure-meeting-formats.js');
  await ensureMeetingFormatsTable();
  app.log.info('meeting_formats table is ready');
} catch (err) {
  app.log.error({ err }, 'ensureMeetingFormatsTable failed -- custom meeting formats may 500 until resolved');
}

try {
  const { ensureMeetingAgendaColumns } = await import('./db/ensure-meeting-agenda.js');
  await ensureMeetingAgendaColumns();
  app.log.info('meetings agenda columns are ready');
} catch (err) {
  app.log.error({ err }, 'ensureMeetingAgendaColumns failed -- running a custom format may 500 until resolved');
}

try {
  const { ensureMeetingAutoEndColumn } = await import('./db/ensure-meeting-auto-end.js');
  await ensureMeetingAutoEndColumn();
  app.log.info('meetings.auto_end_at column is ready');
} catch (err) {
  app.log.error({ err }, 'ensureMeetingAutoEndColumn failed -- the 1-hour auto-end safety net will not fire until resolved');
}

try {
  const { ensureMeetingTranscriptColumns } = await import('./db/ensure-meeting-transcript.js');
  await ensureMeetingTranscriptColumns();
  app.log.info('meetings transcript/recording columns are ready');
} catch (err) {
  app.log.error({ err }, 'ensureMeetingTranscriptColumns failed -- post-meeting transcript/recording will not save until resolved');
}

try {
  const { ensureOrgDeletionColumns } = await import('./db/ensure-org-deletion.js');
  await ensureOrgDeletionColumns();
  app.log.info('organizations deletion columns are ready');
} catch (err) {
  app.log.error({ err }, 'ensureOrgDeletionColumns failed -- org delete/restore will not work until resolved');
}

try {
  const { ensureOrgSidebarColumn } = await import('./db/ensure-org-sidebar.js');
  await ensureOrgSidebarColumn();
  app.log.info('organizations.sidebar_config column is ready');
} catch (err) {
  app.log.error({ err }, 'ensureOrgSidebarColumn failed -- Customize sidebar (Labs) will not persist until resolved');
}

try {
  const { ensureConversionLogTable } = await import('./db/ensure-conversion-log.js');
  await ensureConversionLogTable();
  app.log.info('conversion_log table is ready');
} catch (err) {
  app.log.error({ err }, 'ensureConversionLogTable failed -- Google Ads server-side conversions will fail to log until resolved');
}

try {
  const { ensureImprovementsTable } = await import('./db/ensure-improvements.js');
  await ensureImprovementsTable();
  app.log.info('improvements table is ready');
} catch (err) {
  app.log.error({ err }, 'ensureImprovementsTable failed -- /admin/improvements may 500 until resolved');
}

try {
  const { ensureOrgMembersTable } = await import('./db/ensure-org-members.js');
  await ensureOrgMembersTable();
  const { ensureOrgMemberPreferencesTable } = await import('./db/ensure-org-member-preferences.js');
  await ensureOrgMemberPreferencesTable();
  const { ensureSubscriptionsTable } = await import('./db/ensure-subscriptions.js');
  await ensureSubscriptionsTable();
  app.log.info('org_members table is ready');
} catch (err) {
  app.log.error({ err }, 'ensureOrgMembersTable failed -- employee/role features will not work until resolved');
}

try {
  const { ensureOosFilesName } = await import('./db/ensure-oos-files-name.js');
  await ensureOosFilesName();
  app.log.info('oos_files.name column is ready');
} catch (err) {
  app.log.error({ err }, 'ensureOosFilesName failed -- chart edits on published-no-draft orgs will 500 until resolved');
}

try {
  const { ensureTeamsTables } = await import('./db/ensure-teams.js');
  await ensureTeamsTables();
  app.log.info('teams + team_memberships tables are ready');
} catch (err) {
  app.log.error({ err }, 'ensureTeamsTables failed -- team-scoped features will not work until resolved');
}

try {
  const { ensureOrgInvitationsExtensions } = await import('./db/ensure-org-invitations.js');
  await ensureOrgInvitationsExtensions();
  app.log.info('org_invitations toggle columns are ready');
} catch (err) {
  app.log.error({ err }, 'ensureOrgInvitationsExtensions failed -- invite toggles will not persist until resolved');
}

try {
  const { ensureMeetingTeamColumn } = await import('./db/ensure-meeting-teams.js');
  await ensureMeetingTeamColumn();
  app.log.info('meetings.team_id column is ready');
} catch (err) {
  app.log.error({ err }, 'ensureMeetingTeamColumn failed -- per-team meeting scoping will not work until resolved');
}

try {
  const { ensureAgentRuntimeTables } = await import('./db/ensure-agent-runtime.js');
  await ensureAgentRuntimeTables();
  app.log.info('agent_runs + agent_schedules tables are ready');

  // Autonomous schedule poller (Processes Phase 2b). This spends an org's wallet
  // on autopilot, so it is DORMANT behind the master kill switch
  // AGENT_SCHEDULER_ENABLED (default OFF). startScheduleRunner is a NO-OP when
  // the flag is falsy -- no interval, no query, no fire -- and logs that it did
  // not start. Schedule CRUD + UI ship and work regardless; only this flag arms
  // the actual firing. The runner re-checks the wallet/key gate at every fire.
  const { startScheduleRunner } = await import('./services/schedule-runner.js');
  startScheduleRunner(app);
} catch (err) {
  app.log.error({ err }, 'ensureAgentRuntimeTables failed -- agent runtime will not work until resolved');
}

try {
  const { ensureIntegrationsTables } = await import('./db/ensure-integrations.js');
  await ensureIntegrationsTables();
  app.log.info('integration_connections + kpi_sources tables are ready');
} catch (err) {
  app.log.error({ err }, 'ensureIntegrationsTables failed -- integrations (Composio) will not work until resolved');
}

try {
  const { ensureMeetingHeadlinesTable } = await import('./db/ensure-meeting-headlines.js');
  await ensureMeetingHeadlinesTable();
  app.log.info('meeting_headlines table is ready');
} catch (err) {
  app.log.error({ err }, 'ensureMeetingHeadlinesTable failed -- daily dashboard headlines will not persist until resolved');
}

try {
  const { ensureLifecycleSendsTable } = await import('./db/ensure-lifecycle-sends.js');
  await ensureLifecycleSendsTable();
  app.log.info('lifecycle_sends table is ready');
} catch (err) {
  app.log.error({ err }, 'ensureLifecycleSendsTable failed -- 90-day lifecycle email scheduler will not run until resolved');
}

try {
  const { ensureMeetingVideoLinkColumn } = await import('./db/ensure-meeting-video-link.js');
  await ensureMeetingVideoLinkColumn();
  app.log.info('meetings.video_link column is ready');
} catch (err) {
  app.log.error({ err }, 'ensureMeetingVideoLinkColumn failed -- "Add to calendar" video link will not persist until resolved');
}

try {
  const { ensureMeetingRecurrenceColumns } = await import('./db/ensure-meeting-recurrence.js');
  await ensureMeetingRecurrenceColumns();
  app.log.info('meetings recurrence columns are ready');
} catch (err) {
  app.log.error({ err }, 'ensureMeetingRecurrenceColumns failed -- recurring meetings will not work until resolved');
}

try {
  const { ensureStrategyResetColumns } = await import('./db/ensure-strategy-reset.js');
  await ensureStrategyResetColumns();
  app.log.info('meetings.segment_notes column is ready');
} catch (err) {
  app.log.error({ err }, 'ensureStrategyResetColumns failed -- Strategy Reset segment notes will not persist until resolved');
}

try {
  const { ensureSeatResponsibilitiesTable } = await import('./db/ensure-seat-responsibilities.js');
  await ensureSeatResponsibilitiesTable();
  app.log.info('seat_responsibilities table is ready');
} catch (err) {
  app.log.error({ err }, 'ensureSeatResponsibilitiesTable failed -- seat responsibilities will not persist until resolved');
}

try {
  const { ensurePeopleReviewTables } = await import('./db/ensure-people-review.js');
  await ensurePeopleReviewTables();
  app.log.info('people review tables are ready');
} catch (err) {
  app.log.error({ err }, 'ensurePeopleReviewTables failed -- seat fit / values / people review will not persist until resolved');
}

try {
  const { ensureKpiSharedGroupColumn } = await import('./db/ensure-kpi-shared-group.js');
  await ensureKpiSharedGroupColumn();
  app.log.info('kpis.shared_group_id is ready');
} catch (err) {
  app.log.error({ err }, 'ensureKpiSharedGroupColumn failed -- shared KPIs will not work until resolved');
}

try {
  const { ensureManagerAgentsTable } = await import('./db/ensure-manager-agents.js');
  await ensureManagerAgentsTable();
  app.log.info('manager_agents table is ready');
} catch (err) {
  app.log.error({ err }, 'ensureManagerAgentsTable failed -- manager agent uploads on the dashboard will not persist until resolved');
}

try {
  const { ensureNextActionColumns } = await import('./db/ensure-next-actions.js');
  await ensureNextActionColumns();
  app.log.info('rocks/tickets next_action columns are ready');
} catch (err) {
  app.log.error({ err }, 'ensureNextActionColumns failed -- GTD Next Action layer will not persist until resolved');
}

try {
  const { ensureChartsTable } = await import('./db/ensure-charts.js');
  await ensureChartsTable();
  app.log.info('charts table is ready (multi-chart Phase C)');
} catch (err) {
  app.log.error({ err }, 'ensureChartsTable failed -- multi-chart support and orger-next chart UI will not work until resolved');
}

try {
  const { ensureTodosV2 } = await import('./db/ensure-todos-v2.js');
  await ensureTodosV2();
  app.log.info('todos v2 columns are ready (kind, priority, recurrence, subtasks)');
} catch (err) {
  app.log.error({ err }, 'ensureTodosV2 failed -- /me/todos and /l8 todo separation will not work until resolved');
}

try {
  const { ensureAttachmentTables } = await import('./db/ensure-attachments.js');
  await ensureAttachmentTables();
  app.log.info('attachments + attachment_links tables are ready');
} catch (err) {
  app.log.error({ err }, 'ensureAttachmentTables failed -- to-do/issue/rock file attachments will not persist until resolved');
}

try {
  const { ensureRockMilestones } = await import('./db/ensure-rock-milestones.js');
  await ensureRockMilestones();
  app.log.info('rock_milestones table + todos.milestone_id are ready (quarterly priority milestones)');
} catch (err) {
  app.log.error({ err }, 'ensureRockMilestones failed -- rock milestones will not persist until resolved');
}

try {
  const { ensureSmartRocksColumn } = await import('./db/ensure-smart-rocks.js');
  await ensureSmartRocksColumn();
  app.log.info('rocks.smart_data is ready (SMART Rock enrichment, free Phase 1)');
} catch (err) {
  app.log.error({ err }, 'ensureSmartRocksColumn failed -- SMART Rock enrichment will not persist until resolved');
}

try {
  const { ensureOrgPrivacy } = await import('./db/ensure-org-privacy.js');
  await ensureOrgPrivacy();
  app.log.info('organizations.is_private is ready (private-plan cross-org enforcement)');
} catch (err) {
  app.log.error({ err }, 'ensureOrgPrivacy failed -- private-plan enforcement will not work until resolved');
}

try {
  const { ensureWalletsTables } = await import('./db/ensure-wallets.js');
  await ensureWalletsTables();
  app.log.info('org_wallets + wallet_ledger + org_entitlements tables are ready (monetization Phase 2)');
} catch (err) {
  app.log.error({ err }, 'ensureWalletsTables failed -- wallet/entitlements/billing will not work until resolved');
}

try {
  const { ensureTicketsTeam } = await import('./db/ensure-tickets-team.js');
  await ensureTicketsTeam();
  app.log.info('tickets.team_id is ready (team-scoped L10 issues)');
} catch (err) {
  app.log.error({ err }, 'ensureTicketsTeam failed -- /l8 issue filtering by team will not work until resolved');
}

try {
  const { ensureKpisRocksTeam } = await import('./db/ensure-kpis-rocks-team.js');
  await ensureKpisRocksTeam();
  app.log.info('kpis.team_id + rocks.team_id are ready (team-scoped L10 scorecard + rocks)');
} catch (err) {
  app.log.error({ err }, 'ensureKpisRocksTeam failed -- /l8 KPI/Rocks filtering by team will not work until resolved');
}

try {
  const { ensureNotifications } = await import('./db/ensure-notifications.js');
  await ensureNotifications();
  app.log.info('notifications table is ready (nav alert bell)');
} catch (err) {
  app.log.error({ err }, 'ensureNotifications failed -- the alert bell will not work until resolved');
}

try {
  const { ensurePushSubscriptions } = await import('./db/ensure-push-subscriptions.js');
  await ensurePushSubscriptions();
  app.log.info('push_subscriptions table is ready (web push)');
} catch (err) {
  app.log.error({ err }, 'ensurePushSubscriptions failed -- web push will not work until resolved');
}

try {
  const { ensureOrgEvents } = await import('./db/ensure-org-events.js');
  await ensureOrgEvents();
  app.log.info('org_events table is ready (realtime sync outbox; emit gated by ORG_EVENTS_ENABLED)');
} catch (err) {
  app.log.error({ err }, 'ensureOrgEvents failed -- realtime sync outbox will not persist until resolved');
}

try {
  const { ensureGlossaryTermsTable } = await import('./db/ensure-glossary-terms.js');
  await ensureGlossaryTermsTable();
  app.log.info('glossary_terms table is ready and seeded');
} catch (err) {
  app.log.error({ err }, 'ensureGlossaryTermsTable failed -- /glossary and /glossary/:slug may 500 until resolved');
}

try {
  const { ensureCoachDirectory } = await import('./db/ensure-coach-directory.js');
  await ensureCoachDirectory();
  app.log.info('coach directory columns + seed Directory org are ready');
} catch (err) {
  app.log.error({ err }, 'ensureCoachDirectory failed -- /experts and /expert/:slug may behave incorrectly until resolved');
}

try {
  // Demo org for sales walkthroughs (Acme Corp / Looney Tunes). Idempotent +
  // self-guarding; needs charts + teams ensures above to have run first.
  const { ensureDemoAcme } = await import('./db/ensure-demo-acme.js');
  await ensureDemoAcme();
  app.log.info('Acme Corp demo org is ready (impersonate Wile E. Coyote to demo)');
} catch (err) {
  app.log.error({ err }, 'ensureDemoAcme failed (non-fatal) -- demo org may be missing');
}

try {
  const { ensureCoachClientTables } = await import('./db/ensure-coach-clients.js');
  await ensureCoachClientTables();
  app.log.info('coach-client ecosystem tables ready (invite_token, attribution, access)');
} catch (err) {
  app.log.error({ err }, 'ensureCoachClientTables failed -- /join/:token and coach dashboard will not work until resolved');
}

// Orger — sibling product, mounted at /orger prefix until orger.ai vhost is configured.
// Wrapped in try/catch so a registration failure does not prevent OTP boot.
try {
  const { orgerRoutes } = await import('./orger/routes/orger.js');
  await app.register(orgerRoutes, { prefix: '/orger' });
  app.log.info('[startup][orger] mounted at /orger');
} catch (err) {
  app.log.error({ err }, '[startup][orger] registration failed — /orger routes will 404');
}

// Start server
const port = parseInt(process.env.PORT || '3000', 10);
const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';

try {
  await app.listen({ port, host });
  app.log.info(`OTP Platform running at http://${host}:${port}`);

  if (process.env.NODE_ENV === 'production' || process.env.ENABLE_ONBOARDING_SCHEDULER === 'true') {
    const { startOnboardingScheduler } = await import('./services/onboarding-scheduler.js');
    startOnboardingScheduler();
  }

  if (process.env.NODE_ENV === 'production' || process.env.ENABLE_REENGAGEMENT_SCHEDULER === 'true') {
    const { startReEngagementScheduler } = await import('./services/re-engagement-scheduler.js');
    startReEngagementScheduler();
  }

  // 90-day lifecycle series. Starts in prod (and via ENABLE flag) but runs in
  // DRY-RUN until LIFECYCLE_EMAILS_LIVE=true -- it logs intended sends without
  // delivering, so deploying this never blasts real signups by accident.
  if (process.env.NODE_ENV === 'production' || process.env.ENABLE_LIFECYCLE_SCHEDULER === 'true') {
    const { startLifecycleScheduler } = await import('./services/lifecycle-scheduler.js');
    startLifecycleScheduler();
  }

  // Realtime sync outbox retention. Safe to run regardless of ORG_EVENTS_ENABLED
  // (no-op DELETE when the table is empty); prunes events older than 30 days.
  if (process.env.NODE_ENV === 'production' || process.env.ENABLE_ORG_EVENTS_RETENTION === 'true') {
    const { startOrgEventsRetention } = await import('./services/org-events-retention.js');
    startOrgEventsRetention();
  }

  // 1-hour auto-end safety net (backstop). The lazy page-load sweep handles the
  // common case; this catches a meeting nobody loads a page for. No wallet/email
  // side effects, so it is safe to run everywhere (gate only to disable in
  // local dev if noisy). Lazy sweeps still fire regardless of this scheduler.
  if (process.env.NODE_ENV === 'production' || process.env.ENABLE_MEETING_AUTO_END === 'true') {
    const { startMeetingAutoEndScheduler } = await import('./services/meeting-lifecycle.js');
    startMeetingAutoEndScheduler();
  }

  // Organization hard-delete purge sweep. DESTRUCTIVE and DORMANT by design:
  // it only starts when explicitly armed with ENABLE_ORG_PURGE=true (NOT on by
  // default, not even in production). Soft-delete and restore work without it;
  // arm it only once the purge has been validated on a real pending org.
  if (process.env.ENABLE_ORG_PURGE === 'true') {
    const { startOrgPurgeScheduler } = await import('./services/org-purge.js');
    startOrgPurgeScheduler();
  }
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

// Last-resort guards: log instead of dying on stray async errors (e.g. a
// rejected promise inside a scheduler tick, or socket errors surfaced outside
// any request). Fastify's setErrorHandler only covers in-request errors.
process.on('unhandledRejection', (reason) => {
  app.log.error({ reason }, 'unhandledRejection (recovering)');
});
process.on('uncaughtException', (err) => {
  // Truly unknown state -- log loudly. Railway restarts us on exit.
  app.log.fatal({ err }, 'uncaughtException -- exiting for clean restart');
  process.exit(1);
});
