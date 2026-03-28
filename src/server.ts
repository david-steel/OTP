import Fastify from 'fastify';
import fastifyView from '@fastify/view';
import fastifyStatic from '@fastify/static';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifyCors from '@fastify/cors';
import { clerkPlugin } from '@clerk/fastify';
import path from 'path';
import { fileURLToPath } from 'url';

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

// CORS
await app.register(fastifyCors, {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://orgtp.com']
    : ['https://orgtp.com', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
});

// Clerk authentication
await app.register(clerkPlugin, {
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
});

// Static files
await app.register(fastifyStatic, {
  root: path.join(__dirname, '..', 'public'),
  prefix: '/public/',
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
  },
});

// Super admin detection -- makes isSuperAdmin available to all page routes
import { isSuperAdmin } from './middleware/super-admin.js';
app.decorateRequest('isSuperAdmin', false);
app.addHook('preHandler', async (request) => {
  (request as any).isSuperAdmin = isSuperAdmin(request);
});

// Security headers
app.addHook('onSend', async (request, reply) => {
  reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  reply.header('X-Content-Type-Options', 'nosniff');
  reply.header('X-Frame-Options', 'SAMEORIGIN');
  reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  reply.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  reply.header(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://*.clerk.accounts.dev https://*.clerk.com https://d3js.org; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.clerk.dev https://*.clerk.com https://www.google-analytics.com https://orgtp.com; frame-src https://*.clerk.accounts.dev https://*.clerk.com;"
  );
  // Suppress Clerk internal headers from public responses
  reply.removeHeader('x-clerk-auth-status');
  reply.removeHeader('x-clerk-auth-reason');
});

// Health check
app.get('/health', async () => {
  return { status: 'ok', version: '0.1.0', phase: 'mvp' };
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
- Creator: David Steel, dsteel@sneeze.it
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
    { loc: '/browse', priority: '0.9', changefreq: 'daily' },
    { loc: '/search', priority: '0.8', changefreq: 'daily' },
    { loc: '/graph', priority: '0.8', changefreq: 'weekly' },
    { loc: '/guide', priority: '0.7', changefreq: 'monthly' },
    { loc: '/blog', priority: '0.8', changefreq: 'weekly' },
    { loc: '/publish', priority: '0.7', changefreq: 'monthly' },
    { loc: '/pricing', priority: '0.8', changefreq: 'monthly' },
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
    { loc: '/claims', priority: '0.8', changefreq: 'weekly' },
    { loc: '/claims/core_operating_rules', priority: '0.7', changefreq: 'weekly' },
    { loc: '/claims/agent_roles_and_authority', priority: '0.7', changefreq: 'weekly' },
    { loc: '/claims/coordination_patterns', priority: '0.7', changefreq: 'weekly' },
    { loc: '/claims/operational_heuristics', priority: '0.7', changefreq: 'weekly' },
    { loc: '/claims/failure_patterns', priority: '0.7', changefreq: 'weekly' },
    { loc: '/claims/human_ai_boundary_conditions', priority: '0.7', changefreq: 'weekly' },
    { loc: '/industries', priority: '0.7', changefreq: 'weekly' },
    { loc: '/glossary', priority: '0.9', changefreq: 'weekly' },
    { loc: '/faq', priority: '0.8', changefreq: 'monthly' },
    { loc: '/about', priority: '0.6', changefreq: 'monthly' },
  ];

  // Dynamic pages: published OOS files and org profiles
  let dynamicUrls = '';
  try {
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
  } catch {
    // If DB unavailable, serve static pages only
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(p => `  <url><loc>${BASE}${p.loc}</loc><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`).join('\n')}
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
await app.register(import('./routes/api/merge.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/scanner.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/api-keys.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/recommendations.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/tickets.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/consultants.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/workspaces.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/source-documents.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/inquiries.js'), { prefix: '/api/v1' });
await app.register(import('./routes/api/admin.js'), { prefix: '/api/v1' });

// ---- Page Routes (SSR) ----
await app.register(import('./routes/pages/pages.js'));

// Custom 404 handler -- return HTML instead of Fastify's default JSON
app.setNotFoundHandler(async (request, reply) => {
  reply.status(404);
  return reply.view('pages/home', {
    title: 'Page Not Found - OTP',
    description: 'The page you are looking for does not exist.',
    canonical: 'https://orgtp.com/',
    noindex: true,
  });
});

// Start server
const port = parseInt(process.env.PORT || '3000', 10);
const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';

try {
  await app.listen({ port, host });
  app.log.info(`OTP Platform running at http://${host}:${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
