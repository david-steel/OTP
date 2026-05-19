import type { FastifyInstance } from 'fastify';
import ejs from 'ejs';
import { fileURLToPath } from 'node:url';
import { getAuth } from '@clerk/fastify';
import { eq, and, desc, asc, sql, inArray, or } from 'drizzle-orm';
import { db } from '../../config/database.js';
import { organizations, oosFiles, claims, claimSimilarities, apiKeys, bestPractices, oosBestPracticeMatches, consultantProfiles, practiceVotes, newsletterSubscribers, oosOperatingPlans, oosOperatingPlanSections, oosExecutionItems, meetings, rocks, todos, tickets, kpis, kpiValues, partnerSignups, improvements, orgMembers, teams, teamMemberships, meetingHeadlines, managerAgents, seatResponsibilities, seatFitReviews, orgValues, valueReviews } from '../../db/schema.js';
import { hasOrgWideView, canEditOrgSettings, capabilitiesFor, canIntegrate } from '../../middleware/permissions.js';
import type { Role } from '../../services/membership.js';
import { getOrgsForUser } from '../../services/membership.js';
import { isNull, isNotNull } from 'drizzle-orm';
import { computeDiff } from '../../services/diff-engine.js';
import { generateMergePreview } from '../../services/merge-preview.js';
import type { ParsedClaim } from '../../shared/types.js';
import { AGENTIC_LEVEL_LABELS } from '../../shared/enums.js';
import { validateUuidParam } from '../../shared/param-validation.js';
import { currentPeriod } from '../../shared/period.js';
import { annotateOosStaleness } from '../../services/oos-staleness.js';
import { listConatusPosts, getConatusPost } from '../../services/conatus-posts.js';
import { getOrgTeamGraph, computeAgentComparisonPairs } from '../../services/team-graph.js';
import { resolveOrgForUser, acceptInvite, MembershipError } from '../../services/membership.js';
import { calculateCheckup, QUESTIONS as CHECKUP_QUESTIONS, LEVEL_LABELS as CHECKUP_LEVEL_LABELS } from '../../services/checkup-scoring.js';
import { sendEmail } from '../../config/email.js';
import { createHash } from 'crypto';
import { aeoClusters } from '../../data/aeo-clusters.js';
import { isAttendee } from '../../services/meeting-access.js';

function toParsedClaim(c: any): ParsedClaim {
  return { claimId: c.claimId, section: c.section, displayOrder: c.displayOrder, rule: c.rule, why: c.why, failureMode: c.failureMode, confidence: c.confidence, evidence: c.evidence, scope: c.scope };
}

const BASE_URL = 'https://orgtp.com';

function bc(...items: Array<{ name: string; url: string }>) {
  return [{ name: 'Home', url: BASE_URL + '/' }, ...items];
}

// Calendar-quarter label for OOS execution items: 'Q1-2026', 'Q2-2026', etc.
function quarterLabel(d: Date): string {
  const q = Math.floor(d.getMonth() / 3) + 1;
  return `Q${q}-${d.getFullYear()}`;
}

// People Review verdict from one person's ratings (Understands / Wants /
// Capacity plus each value). null = unrated.
function peopleReviewVerdict(
  ratings: (string | null)[],
): 'solid' | 'needs-conversation' | 'wrong-seat' | 'unrated' {
  if (ratings.every(r => r == null)) return 'unrated';
  if (ratings.some(r => r === 'no')) return 'wrong-seat';
  if (ratings.some(r => r === 'partial' || r == null)) return 'needs-conversation';
  return 'solid';
}

// v7 pages render the page view + layouts/v7.ejs manually. @fastify/view's
// layout feature throws if a per-route layout is passed while a global layout
// is configured, so v7 routes call renderV7 instead of reply.view.
const V7_VIEWS = fileURLToPath(new URL('../../views', import.meta.url));

async function renderV7(reply: any, page: string, data: Record<string, any> = {}) {
  const body = await ejs.renderFile(`${V7_VIEWS}/pages/${page}.ejs`, data);
  const html = await ejs.renderFile(`${V7_VIEWS}/layouts/v7.ejs`, { ...data, body });
  return reply.type('text/html').send(html);
}

export default async function pageRoutes(app: FastifyInstance) {

  // Resolve the requesting user's org. Team-member path first (org_members
  // populated by guards middleware), then legacy founder fallback where the
  // user's clerk_user_id is stored as organizations.clerk_org_id. Returns
  // null when neither hits.
  async function resolveRequestOrg(request: any) {
    const auth = getAuth(request);
    if (!auth?.userId) return null;
    const member = (request as any).orgMember as { orgId: string } | null;
    if (member?.orgId) {
      const [m] = await db.select().from(organizations).where(eq(organizations.id, member.orgId)).limit(1);
      if (m) return m;
    }
    const [legacy] = await db.select().from(organizations).where(eq(organizations.clerkOrgId, auth.userId)).limit(1);
    return legacy || null;
  }

  // Homepage v7 -- verbiage-corrected redesign, served as a standalone static
  // document (no layout, no DB). Reads the deployed file from public/ so the
  // /public/ image paths resolve. /home-v7 and /public/home-v7.html match.
  app.get('/home-v7', async (request, reply) => {
    const { readFile } = await import('node:fs/promises');
    const { fileURLToPath } = await import('node:url');
    const p = fileURLToPath(new URL('../../../public/home-v7.html', import.meta.url));
    const html = await readFile(p, 'utf8');
    return reply.type('text/html').send(html);
  });

  // /meet-radar-b -- v7-light styled variant of /meet-radar, built for a
  // Google Ads A/B split test against the dark /meet-radar page. Standalone
  // static document (compiled CSS + gtag conversion tracking inlined).
  app.get('/meet-radar-b', async (request, reply) => {
    const { readFile } = await import('node:fs/promises');
    const { fileURLToPath } = await import('node:url');
    const p = fileURLToPath(new URL('../../../public/meet-radar-b.html', import.meta.url));
    const html = await readFile(p, 'utf8');
    return reply.type('text/html').send(html);
  });

  // Homepage. Serves the v7 redesign (public/home-v7.html) as a standalone
  // static document -- compiled CSS, SEO meta + JSON-LD, and GA baked into the
  // file's head. No layout, no DB. /home-v7 and /public/home-v7.html match.
  app.get('/', async (request, reply) => {
    const { readFile } = await import('node:fs/promises');
    const { fileURLToPath } = await import('node:url');
    const p = fileURLToPath(new URL('../../../public/home-v7.html', import.meta.url));
    const html = await readFile(p, 'utf8');
    return reply.type('text/html').send(html);
  });

  // Browse
  app.get('/browse', async (request, reply) => {
    // One card per organization: the most recent published OOS file per org.
    // Without DISTINCT ON, an org that has re-published several times shows
    // once per file (e.g. Sneeze It appearing 7x).
    const rows = await db.execute(sql`
      SELECT * FROM (
        SELECT DISTINCT ON (o.id)
               f.id, f.template, f.version, f.claim_count, f.word_count,
               f.confidence_distribution, f.evidence_distribution, f.published_at,
               o.id AS org_id, o.name AS org_name, o.industry, o.size, o.badge, o.quality_tier, o.agentic_level
        FROM oos_files f JOIN organizations o ON f.org_id = o.id
        WHERE f.status = 'published'
        ORDER BY o.id, f.published_at DESC NULLS LAST
      ) latest
      ORDER BY published_at DESC NULLS LAST
      LIMIT 50
    `);
    return renderV7(reply, 'browse', { title: 'Browse Intelligence - OTP', description: 'Browse published Organizational Operating Systems. See how organizations coordinate their AI agent teams.', canonical: BASE_URL + '/browse', breadcrumbs: bc({ name: 'Browse', url: BASE_URL + '/browse' }), jsonLd: { '@context': 'https://schema.org', '@type': 'DataCatalog', name: 'OTP Intelligence Catalog', description: 'Published Organizational Operating Systems with coordination intelligence.', url: BASE_URL + '/browse' }, oosFiles: rows.rows || [] });
  });

  // Search
  app.get<{ Querystring: { q?: string; confidence?: string; evidence?: string; template?: string; industry?: string } }>(
    '/search', async (request, reply) => {
      const { q, confidence, evidence, template, industry } = request.query;
      let results: any[] = [];
      let pagination = { total: 0 };

      if (q) {
        const resp = await db.execute(sql`
          SELECT c.id AS claim_id, c.claim_id AS claim_ref, c.section, c.rule, c.why, c.failure_mode,
                 c.confidence, c.evidence, c.scope, f.id AS oos_file_id, f.template,
                 o.name AS org_name, o.industry, o.badge,
                 ts_rank(c.search_vector, plainto_tsquery('english', ${q})) AS rank
          FROM claims c JOIN oos_files f ON c.oos_file_id = f.id JOIN organizations o ON f.org_id = o.id
          WHERE f.status = 'published' AND c.search_vector @@ plainto_tsquery('english', ${q})
          ${confidence ? sql`AND c.confidence = ${confidence}` : sql``}
          ${evidence ? sql`AND c.evidence = ${evidence}` : sql``}
          ${template ? sql`AND f.template = ${template}` : sql``}
          ${industry ? sql`AND o.industry ILIKE ${'%' + industry + '%'}` : sql``}
          ORDER BY rank DESC LIMIT 50
        `);
        results = resp.rows || [];
        pagination.total = results.length;
      }

      return reply.view('pages/search', { title: q ? `"${q}" - Search - OTP` : 'Search - OTP', description: q ? `Search results for "${q}" across organizational intelligence claims on OTP.` : 'Search across organizational intelligence claims. Find proven coordination patterns, agent roles, and operational rules from real AI teams.', canonical: BASE_URL + '/search', breadcrumbs: bc({ name: 'Search', url: BASE_URL + '/search' }), q, confidence, evidence, template, industry, results, pagination });
    }
  );

  // OOS Detail
  app.get<{ Params: { id: string } }>('/oos/:id', async (request, reply) => {
    const id = validateUuidParam(request.params.id);
    if (!id) return reply.status(404).view('pages/home', { title: 'Not Found', noindex: true });
    const [oosFile] = await db.select().from(oosFiles).where(eq(oosFiles.id, id)).limit(1);
    if (!oosFile) return reply.status(404).view('pages/home', { title: 'Not Found', noindex: true });

    const [org] = await db.select().from(organizations).where(eq(organizations.id, oosFile.orgId)).limit(1);
    const claimRows = await db.select().from(claims).where(eq(claims.oosFileId, id)).orderBy(claims.displayOrder);

    const orgData = org ? { ...org, agenticLabel: org.agenticLevel ? AGENTIC_LEVEL_LABELS[org.agenticLevel] || '' : '' } : {};

    const bpMatches = await db.select({
      term: bestPractices.term,
      slug: bestPractices.slug,
      category: bestPractices.category,
      sourceUrl: bestPractices.sourceUrl,
      relevanceScore: oosBestPracticeMatches.relevanceScore,
      publisherName: consultantProfiles.displayName,
      publisherSlug: consultantProfiles.slug,
    })
      .from(oosBestPracticeMatches)
      .innerJoin(bestPractices, eq(oosBestPracticeMatches.bestPracticeId, bestPractices.id))
      .leftJoin(consultantProfiles, eq(bestPractices.publisherProfileId, consultantProfiles.id))
      .where(eq(oosBestPracticeMatches.oosFileId, id))
      .orderBy(desc(oosBestPracticeMatches.relevanceScore))
      .limit(12);

    return reply.view('pages/oos-detail', { title: `${org?.name || 'OOS'} - OTP`, description: `View the Organizational Operating System published by ${org?.name || 'this organization'} on OTP. ${oosFile.claimCount} coordination claims.`, canonical: BASE_URL + '/oos/' + id, oosFile, org: orgData, claims: claimRows, bestPracticeMatches: bpMatches });
  });

  // Compare
  app.get<{ Params: { idA: string; idB: string } }>('/compare/:idA/:idB', async (request, reply) => {
    const idA = validateUuidParam(request.params.idA);
    const idB = validateUuidParam(request.params.idB);
    if (!idA || !idB) return reply.status(404).view('pages/home', { title: 'Not Found', noindex: true });
    const [oosA] = await db.select().from(oosFiles).where(eq(oosFiles.id, idA)).limit(1);
    const [oosB] = await db.select().from(oosFiles).where(eq(oosFiles.id, idB)).limit(1);
    if (!oosA || !oosB) return reply.status(404).view('pages/home', { title: 'Not Found', noindex: true });

    const [orgA] = await db.select().from(organizations).where(eq(organizations.id, oosA.orgId)).limit(1);
    const [orgB] = await db.select().from(organizations).where(eq(organizations.id, oosB.orgId)).limit(1);

    const claimsA = (await db.select().from(claims).where(eq(claims.oosFileId, idA)).orderBy(claims.displayOrder)).map(toParsedClaim);
    const claimsB = (await db.select().from(claims).where(eq(claims.oosFileId, idB)).orderBy(claims.displayOrder)).map(toParsedClaim);

    const diff = computeDiff(
      { id: idA, orgName: orgA?.name || 'A', claims: claimsA },
      { id: idB, orgName: orgB?.name || 'B', claims: claimsB }
    );

    return reply.view('pages/compare', { title: `Compare ${orgA?.name || 'A'} vs ${orgB?.name || 'B'} - OTP`, description: `Side-by-side comparison of coordination intelligence between ${orgA?.name || 'Organization A'} and ${orgB?.name || 'Organization B'} on OTP.`, canonical: BASE_URL + '/compare/' + idA + '/' + idB, noindex: true, diff });
  });

  // Merge Preview
  app.get<{ Params: { sourceId: string; targetId: string } }>('/merge/:sourceId/:targetId', async (request, reply) => {
    const sourceId = validateUuidParam(request.params.sourceId);
    const targetId = validateUuidParam(request.params.targetId);
    if (!sourceId || !targetId) return reply.status(404).view('pages/home', { title: 'Not Found', noindex: true });
    const [sourceOos] = await db.select().from(oosFiles).where(eq(oosFiles.id, sourceId)).limit(1);
    const [targetOos] = await db.select().from(oosFiles).where(eq(oosFiles.id, targetId)).limit(1);
    if (!sourceOos || !targetOos) return reply.status(404).view('pages/home', { title: 'Not Found', noindex: true });

    const [sourceOrg] = await db.select().from(organizations).where(eq(organizations.id, sourceOos.orgId)).limit(1);
    const [targetOrg] = await db.select().from(organizations).where(eq(organizations.id, targetOos.orgId)).limit(1);

    const sourceClaims = (await db.select().from(claims).where(eq(claims.oosFileId, sourceId)).orderBy(claims.displayOrder)).map(toParsedClaim);
    const targetClaims = (await db.select().from(claims).where(eq(claims.oosFileId, targetId)).orderBy(claims.displayOrder)).map(toParsedClaim);

    const preview = generateMergePreview(
      { id: sourceId, name: sourceOrg?.name || 'Source', wordCount: sourceOos.wordCount, entities: (sourceOos.frontmatter as any)?.entities || null, claims: sourceClaims },
      { id: targetId, name: targetOrg?.name || 'Target', wordCount: targetOos.wordCount, entities: (targetOos.frontmatter as any)?.entities || null, claims: targetClaims }
    );

    return reply.view('pages/merge-preview', { title: 'Merge Preview - OTP', description: 'Preview a merge of two Organizational Operating Systems on OTP.', canonical: BASE_URL + '/merge/' + sourceId + '/' + targetId, noindex: true, preview });
  });

  // Org Profile
  app.get<{ Params: { id: string } }>('/org/:id', async (request, reply) => {
    const id = validateUuidParam(request.params.id);
    if (!id) return reply.status(404).view('pages/home', { title: 'Not Found', noindex: true });
    const [org] = await db.select().from(organizations).where(eq(organizations.id, id)).limit(1);
    if (!org) return reply.status(404).view('pages/home', { title: 'Not Found', noindex: true });

    const pubFiles = await db.select().from(oosFiles).where(and(eq(oosFiles.orgId, id), eq(oosFiles.status, 'published'))).orderBy(desc(oosFiles.publishedAt));
    const totalClaims = pubFiles.reduce((s, f) => s + f.claimCount, 0);

    return reply.view('pages/org-profile', {
      title: `${org.name} - OTP`,
      description: `${org.name} on OTP. ${org.industry || 'Organization'} with published coordination intelligence.`,
      canonical: BASE_URL + '/org/' + id,
      org: { ...org, memberSince: org.createdAt, agenticLabel: org.agenticLevel ? AGENTIC_LEVEL_LABELS[org.agenticLevel] || '' : '' },
      stats: { publishedFiles: pubFiles.length, totalClaims, latestVersion: pubFiles[0]?.version || 0, latestPublish: pubFiles[0]?.publishedAt },
      oosFiles: pubFiles,
    });
  });

  // Graph page
  app.get('/graph', async (request, reply) => {
    return reply.view('pages/graph', { title: 'Intelligence Graph - OTP', description: 'Explore the OTP intelligence network. Visualize how AI organizations connect through shared coordination patterns, operational claims, and unique approaches.', canonical: BASE_URL + '/graph', ogImage: BASE_URL + '/public/og-image.png', breadcrumbs: bc({ name: 'Graph', url: BASE_URL + '/graph' }) });
  });

  // Guide page
  app.get('/guide', async (request, reply) => {
    return renderV7(reply, 'guide', { title: 'How to Generate Your OOS - OTP', description: 'Learn how to create and publish your organizational operating system. A step-by-step guide to documenting your AI team\'s coordination intelligence on OTP.', canonical: BASE_URL + '/guide', breadcrumbs: bc({ name: 'Guide', url: BASE_URL + '/guide' }) });
  });

  // Why OTP -- the persuasion page (frustrations + outcomes + objections)
  // Start Here -- the 30-min founder intro page (Calendly embed)
  app.get('/start-here', async (request, reply) => {
    return renderV7(reply, 'start-here', {
      title: 'Start Here - Schedule a 30-Minute Intro with the Founder of OTP',
      description: 'A free 30-minute conversation with David Steel, founder of OTP. We map your AI footprint, find the coordination gaps, and decide together whether OTP is the right next move.',
      canonical: BASE_URL + '/start-here',
      ogImage: BASE_URL + '/public/og-image.png',
      breadcrumbs: bc({ name: 'Start Here', url: BASE_URL + '/start-here' }),
    });
  });

  app.get('/foundation', async (request, reply) => {
    return renderV7(reply, 'foundation', {
      title: 'Build the Foundation - OTP Track 1 (Zero Agents)',
      description: 'OTP onboarding Track 1 for organizations that do not have agents yet. Map your org chart, define your operating system, set your KPIs, document your SOPs. The foundation your first agent will land on.',
      canonical: BASE_URL + '/foundation',
      ogImage: BASE_URL + '/public/og-image.png',
      breadcrumbs: bc({ name: 'Build the Foundation', url: BASE_URL + '/foundation' }),
    });
  });

  app.get('/deploy', async (request, reply) => {
    return renderV7(reply, 'deploy', {
      title: 'Bring Your Agents In - OTP Track 2 (Solo Operator)',
      description: 'OTP onboarding Track 2 for solo operators already running agents. Register your existing agents, place each on the chart, assign KPIs, and put them on a runtime that does not die when your credits run out.',
      canonical: BASE_URL + '/deploy',
      ogImage: BASE_URL + '/public/og-image.png',
      breadcrumbs: bc({ name: 'Bring Your Agents In', url: BASE_URL + '/deploy' }),
    });
  });

  app.get('/teams', async (request, reply) => {
    return renderV7(reply, 'teams', {
      title: 'Coordinate Your Team - OTP Track 3 (Multi-User Agent Operations)',
      description: 'OTP onboarding Track 3 for teams running agents at scale. Multi-user role permissions, cross-agent registry, inter-agent message bus, Bassim L8 maturity scoring across the org.',
      canonical: BASE_URL + '/teams',
      ogImage: BASE_URL + '/public/og-image.png',
      breadcrumbs: bc({ name: 'Coordinate Your Team', url: BASE_URL + '/teams' }),
    });
  });

  app.get('/partners', async (request, reply) => {
    return renderV7(reply, 'partners', {
      title: 'OTP Partner Program - Become a Certified OTP Integrator',
      description: 'OTP Partner Program for trusted advisors -- EOS Implementers, Scaling Up coaches, fractional CXOs, MSPs, AI consultancies, agent builders. Three tiers, recurring revenue share, multi-tenant dashboard, Founding Partner cohort limited to 50.',
      canonical: BASE_URL + '/partners',
      ogImage: BASE_URL + '/public/og-image.png',
      breadcrumbs: bc({ name: 'Partner Program', url: BASE_URL + '/partners' }),
    });
  });

  app.get('/why-otp', async (request, reply) => {
    return renderV7(reply, 'why-otp', {
      title: 'Why OTP - There Is No Shadow IT Problem. There Is an Org Chart Problem.',
      description: 'Every AI tool in your stack is doing work that used to require a human seat. None of them have one. OTP gives every agent a seat, an SOP, and a scorecard, on the same chart as your humans.',
      canonical: BASE_URL + '/why-otp',
      ogImage: BASE_URL + '/public/og-image.png',
      breadcrumbs: bc({ name: 'Why OTP', url: BASE_URL + '/why-otp' }),
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: 'Why OTP - There Is No Shadow IT Problem. There Is an Org Chart Problem.',
        description: 'Five frustrations every AI-using organization hits, the three outcomes when AI joins the chart, and six honest objections answered.',
        url: BASE_URL + '/why-otp',
      },
    });
  });

  // Tools -- the OTP toolbox (5 foundational tools + extended catalog)
  app.get('/tools', async (request, reply) => {
    return renderV7(reply, 'tools', {
      title: 'The OTP Toolbox - Free Tools for Augmented Human Organizations',
      description: 'Five foundational tools plus the rest of the OTP toolbox. OOS Starter Template, the live Org Chart Builder, the CLAUDE.md Compiler, the Agent Builder, and the Coordination Checkup. Free. Use whether you sign up or not.',
      canonical: BASE_URL + '/tools',
      ogImage: BASE_URL + '/public/og-image.png',
      breadcrumbs: bc({ name: 'Tools', url: BASE_URL + '/tools' }),
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'The OTP Toolbox',
        description: 'Free tools for building and running augmented human organizations on OTP.',
        url: BASE_URL + '/tools',
      },
    });
  });

  // What is OTP -- deep explainer page (model + components + process + FAQ)
  app.get('/what-is-otp', async (request, reply) => {
    return renderV7(reply, 'what-is-otp', {
      title: 'What is OTP - The Operating Layer for the Augmented Human Organization',
      description: 'OTP is a model, a protocol, a network, and a SaaS for organizations where humans and AI agents share seats, share SOPs, and share one scoreboard. Six components, two-week implementation, open file format.',
      canonical: BASE_URL + '/what-is-otp',
      ogImage: BASE_URL + '/public/og-image.png',
      breadcrumbs: bc({ name: 'What is OTP', url: BASE_URL + '/what-is-otp' }),
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: 'What is OTP - The Operating Layer for the Augmented Human Organization',
        description: 'OTP is a model, a protocol, a network, and a SaaS for organizations where humans and AI agents share seats, share SOPs, and share one scoreboard.',
        url: BASE_URL + '/what-is-otp',
      },
    });
  });

  // Coach landing -- conversion page for coaches, consultants, advisors with clients
  app.get('/coach', async (request, reply) => {
    return renderV7(reply, 'coach', {
      title: 'OTP for Coaches, Consultants & Operators - Your Playbook. Your Clients. One Protocol.',
      description: 'MIT 2025: 95% of enterprise AI pilots fail. Not because the AI is bad - because it is overlaid on the org instead of integrated into it. OTP is the operating protocol your clients run on, with your playbook defining the layer. An infrastructure of learning across your whole book of business.',
      canonical: BASE_URL + '/coach',
      ogImage: BASE_URL + '/public/images/og-coach.png',
      breadcrumbs: bc({ name: 'For Coaches', url: BASE_URL + '/coach' }),
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'OTP for Coaches, Consultants & Operators',
        description: 'Your playbook defines the protocol. One operating layer per client. An infrastructure of learning across your whole book of business.',
        url: BASE_URL + '/coach',
      },
    });
  });

  // Protocol page (the canonical "OTP is a protocol, not a service" page)
  app.get('/protocol', async (request, reply) => {
    return renderV7(reply, 'protocol', {
      title: 'For the first time, your strategy is an artifact your agents can read',
      description: "An OOS file is where your team's plan and your agents' rules live together. Humans read it. Agents query it. No translation layer between the boardroom and the bot.",
      canonical: BASE_URL + '/protocol',
      ogImage: BASE_URL + '/public/og-image.png',
      breadcrumbs: bc({ name: 'Protocol', url: BASE_URL + '/protocol' }),
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: 'For the first time, your strategy is an artifact your agents can read',
        description: "The OOS file format: where your team's plan and your agents' rules live together. Humans read it, agents query it, no translation layer.",
        url: BASE_URL + '/protocol',
      },
    });
  });

  // Protocol spec files: serve src/protocol/* with correct content types
  // These are the canonical OOS schema and example artifacts.
  {
    const fs = await import('fs/promises');
    const pathMod = await import('path');
    const { fileURLToPath } = await import('url');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = pathMod.dirname(__filename);
    const protocolDir = pathMod.resolve(__dirname, '../../protocol');

    const specFiles: Array<{ name: string; type: string }> = [
      { name: 'example.oos.md', type: 'text/markdown; charset=utf-8' },
      { name: 'example-full.oos.json', type: 'application/json; charset=utf-8' },
      { name: 'oos-schema.json', type: 'application/json; charset=utf-8' },
      { name: 'oos-entities-schema.json', type: 'application/json; charset=utf-8' },
      { name: 'graph-schema.json', type: 'application/json; charset=utf-8' },
      { name: 'otp-self.oos.md', type: 'text/markdown; charset=utf-8' },
      { name: 'sneeze-it.oos.md', type: 'text/markdown; charset=utf-8' },
    ];

    for (const file of specFiles) {
      app.get(`/spec/${file.name}`, async (_request, reply) => {
        try {
          const content = await fs.readFile(pathMod.join(protocolDir, file.name), 'utf-8');
          return reply.type(file.type).header('Cache-Control', 'public, max-age=300').send(content);
        } catch (err) {
          return reply.status(404).send('Not Found');
        }
      });
    }
  }

  // Blog index
  app.get('/blog', async (request, reply) => {
    const allDynamicPosts = listConatusPosts();
    const conatusPosts = allDynamicPosts.filter(p => p.author.toLowerCase() === 'conatus');
    const founderPosts = allDynamicPosts.filter(p => p.author.toLowerCase() !== 'conatus');
    return renderV7(reply, 'blog', { title: 'Blog - OTP', description: 'Building in public. Lessons from running 14 AI agents in production at a digital agency.', canonical: BASE_URL + '/blog', breadcrumbs: bc({ name: 'Blog', url: BASE_URL + '/blog' }), jsonLd: { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'OTP Blog', description: 'Building in public. Lessons from running 14 AI agents in production.', url: BASE_URL + '/blog' }, conatusPosts, founderPosts });
  });

  // Enriched blog post schema helper
  function blogJsonLd(headline: string, slug: string, datePublished: string, wordCount: number) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline,
      author: { '@type': 'Person', name: 'David Steel', url: BASE_URL + '/about', jobTitle: 'Founder', worksFor: { '@type': 'Organization', name: 'OTP' } },
      datePublished,
      dateModified: datePublished,
      publisher: { '@type': 'Organization', name: 'OTP', url: BASE_URL, logo: { '@type': 'ImageObject', url: BASE_URL + '/public/favicon-192x192.png' } },
      url: BASE_URL + '/blog/' + slug,
      mainEntityOfPage: { '@type': 'WebPage', '@id': BASE_URL + '/blog/' + slug },
      image: BASE_URL + '/public/og-image.png',
      wordCount,
    };
  }

  // Blog post 1
  app.get('/blog/why-we-built-otp', async (request, reply) => {
    return renderV7(reply, 'blog-post-1', {
      title: 'The Hard Problem in AI Isn\'t Intelligence. It\'s Coordination. - OTP',
      description: 'The hard problem in AI is not building one good agent. It is getting twelve of them to coordinate without stepping on each other. Why we built OTP.',
      canonical: BASE_URL + '/blog/why-we-built-otp',
      ogType: 'article',
      datePublished: '2026-03-01',
      jsonLd: blogJsonLd('The Hard Problem in AI Isn\'t Intelligence. It\'s Coordination.', 'why-we-built-otp', '2026-03-01', 2000)
    });
  });

  // Blog post 2
  app.get('/blog/what-is-an-oos', async (request, reply) => {
    return renderV7(reply, 'blog-post-2', {
      title: 'What Is an Organizational Operating System? - OTP',
      description: 'An Organizational Operating System captures how your AI agents coordinate. Learn the structure, claims, confidence ratings, and evidence model.',
      canonical: BASE_URL + '/blog/what-is-an-oos',
      ogType: 'article',
      datePublished: '2026-03-01',
      jsonLd: blogJsonLd('What Is an Organizational Operating System?', 'what-is-an-oos', '2026-03-01', 1800)
    });
  });

  // Blog post 3
  app.get('/blog/built-in-48-hours', async (request, reply) => {
    return renderV7(reply, 'blog-post-3', {
      title: 'We Built This Platform in 48 Hours. With the System It\'s Designed to Measure. - OTP',
      description: 'How we built the OTP platform in 48 hours using the same AI agent coordination system the platform is designed to measure.',
      canonical: BASE_URL + '/blog/built-in-48-hours',
      ogType: 'article',
      datePublished: '2026-03-15',
      jsonLd: blogJsonLd('We Built This Platform in 48 Hours. With the System It\'s Designed to Measure.', 'built-in-48-hours', '2026-03-15', 1500)
    });
  });

  // Blog post 4
  app.get('/blog/nvidia-made-the-case', async (request, reply) => {
    return renderV7(reply, 'blog-post-4', {
      title: 'Jensen Huang Just Made the Case for OTP. He Didn\'t Know It. - OTP',
      description: 'Jensen Huang told the world every company needs an agent strategy. OTP is the coordination layer that makes multi-agent strategy work.',
      canonical: BASE_URL + '/blog/nvidia-made-the-case',
      ogType: 'article',
      datePublished: '2026-03-17',
      jsonLd: blogJsonLd('Jensen Huang Just Made the Case for OTP. He Didn\'t Know It.', 'nvidia-made-the-case', '2026-03-17', 2200)
    });
  });

  // Blog post 5
  app.get('/blog/bain-code-red', async (request, reply) => {
    return renderV7(reply, 'blog-post-5', {
      title: 'Bain Just Described the Problem OTP Solves. They Called It "Code Red." - OTP',
      description: 'Bain called enterprise multi-agent coordination a Code Red problem. OTP is the coordination intelligence layer that solves it.',
      canonical: BASE_URL + '/blog/bain-code-red',
      ogType: 'article',
      datePublished: '2026-03-17',
      jsonLd: blogJsonLd('Bain Just Described the Problem OTP Solves. They Called It "Code Red."', 'bain-code-red', '2026-03-17', 2000)
    });
  });

  // Blog post 6
  app.get('/blog/agentic-levels', async (request, reply) => {
    return renderV7(reply, 'blog-post-6', {
      title: 'We Added Agentic Maturity Levels to OTP. Here Is Why They Matter. - OTP',
      description: 'Agentic maturity levels on OTP measure how sophisticated your AI agent coordination is. From tab completion to autonomous agent teams.',
      canonical: BASE_URL + '/blog/agentic-levels',
      ogType: 'article',
      datePublished: '2026-03-17',
      jsonLd: blogJsonLd('We Added Agentic Maturity Levels to OTP. Here Is Why They Matter.', 'agentic-levels', '2026-03-17', 1800)
    });
  });

  // Blog post 7
  app.get('/blog/what-is-coordination-intelligence', async (request, reply) => {
    return renderV7(reply, 'blog-post-7', {
      title: 'What Is Coordination Intelligence? - OTP',
      description: 'Coordination intelligence is the structured knowledge of how AI agents coordinate within and across organizations. It is the missing layer in the AI stack.',
      canonical: BASE_URL + '/blog/what-is-coordination-intelligence',
      ogType: 'article',
      datePublished: '2026-03-18',
      jsonLd: blogJsonLd('What Is Coordination Intelligence?', 'what-is-coordination-intelligence', '2026-03-18', 2000)
    });
  });

  // Blog post 8
  app.get('/blog/how-we-coordinate-14-agents', async (request, reply) => {
    return renderV7(reply, 'blog-post-8', {
      title: 'How We Coordinate 14 AI Agents Without Them Stepping on Each Other - OTP',
      description: 'Practitioner guide to coordinating 14 AI agents in production. Shared state, one seat per owner, escalation over autonomy, and the failures that taught us.',
      canonical: BASE_URL + '/blog/how-we-coordinate-14-agents',
      ogType: 'article',
      datePublished: '2026-03-18',
      jsonLd: blogJsonLd('How We Coordinate 14 AI Agents Without Them Stepping on Each Other', 'how-we-coordinate-14-agents', '2026-03-18', 2500)
    });
  });

  // Blog post 9
  app.get('/blog/tokens-are-the-new-currency', async (request, reply) => {
    return renderV7(reply, 'blog-post-9', {
      title: 'Tokens Are the New Currency. Your OOS Is the Budget. - OTP',
      description: 'Every rule in your OOS costs tokens to load. The Token Efficiency Ratio measures whether each rule earns back more than it spends. Treat your OOS like a financial plan for your AI workforce.',
      canonical: BASE_URL + '/blog/tokens-are-the-new-currency',
      ogType: 'article',
      datePublished: '2026-03-18',
      jsonLd: blogJsonLd('Tokens Are the New Currency. Your OOS Is the Budget.', 'tokens-are-the-new-currency', '2026-03-18', 1800)
    });
  });

  // Blog post 10
  app.get('/blog/otp-vs-crewai-vs-a2a-vs-mcp', async (request, reply) => {
    return renderV7(reply, 'blog-post-10', {
      title: 'OTP vs CrewAI vs A2A vs MCP: Understanding the AI Coordination Stack - OTP',
      description: 'MCP connects agents to tools. CrewAI connects agents to each other. OTP connects organizations to coordination intelligence. Here is how the three layers fit together.',
      canonical: BASE_URL + '/blog/otp-vs-crewai-vs-a2a-vs-mcp',
      ogType: 'article',
      datePublished: '2026-03-18',
      jsonLd: blogJsonLd('OTP vs CrewAI vs A2A vs MCP: Understanding the AI Coordination Stack', 'otp-vs-crewai-vs-a2a-vs-mcp', '2026-03-18', 2200)
    });
  });

  // Blog post 11
  app.get('/blog/8-levels-of-agentic-maturity', async (request, reply) => {
    return renderV7(reply, 'blog-post-11', {
      title: 'The 8 Levels of Agentic Maturity (and How to Measure Yours) - OTP',
      description: 'The 8 Levels of Agentic Engineering by Bassim Eledath give organizations a standard way to measure AI agent coordination maturity. From tab completion to autonomous agent teams.',
      canonical: BASE_URL + '/blog/8-levels-of-agentic-maturity',
      ogType: 'article',
      datePublished: '2026-03-18',
      jsonLd: blogJsonLd('The 8 Levels of Agentic Maturity (and How to Measure Yours)', '8-levels-of-agentic-maturity', '2026-03-18', 2500)
    });
  });

  // Blog post 12
  app.get('/blog/what-is-an-oos-file', async (request, reply) => {
    return renderV7(reply, 'blog-post-12', {
      title: 'What Is an OOS File? The New Standard for AI Organizational Intelligence - OTP',
      description: 'The OOS file is a structured format for capturing how AI agents coordinate. YAML frontmatter, Markdown claims, confidence levels, evidence types, and failure modes in a portable, diffable file.',
      canonical: BASE_URL + '/blog/what-is-an-oos-file',
      ogType: 'article',
      datePublished: '2026-03-18',
      jsonLd: blogJsonLd('What Is an OOS File? The New Standard for AI Organizational Intelligence', 'what-is-an-oos-file', '2026-03-18', 2000)
    });
  });

  // Blog post 13
  app.get('/blog/gas-town-vs-otp', async (request, reply) => {
    return renderV7(reply, 'blog-post-13', {
      title: 'Gas Town Is the Factory Floor. OTP Is the Blueprint Exchange. - OTP',
      description: 'Steve Yegge\'s Gas Town orchestrates parallel coding agents. OTP captures organizational coordination intelligence. They solve different layers of the same problem.',
      canonical: BASE_URL + '/blog/gas-town-vs-otp',
      ogType: 'article',
      datePublished: '2026-03-18',
      jsonLd: blogJsonLd('Gas Town Is the Factory Floor. OTP Is the Blueprint Exchange.', 'gas-town-vs-otp', '2026-03-18', 1800)
    });
  });

  // Blog post 14
  app.get('/blog/moltbook-vs-otp', async (request, reply) => {
    return renderV7(reply, 'blog-post-14', {
      title: 'Moltbook Let Agents Talk. OTP Teaches Organizations How to Run Them. - OTP',
      description: 'Moltbook was a social network for AI agents. It was hacked in 3 days and acquired by Meta in 42. OTP answers the question Moltbook surfaced: how do organizations actually govern their AI teams?',
      canonical: BASE_URL + '/blog/moltbook-vs-otp',
      ogType: 'article',
      datePublished: '2026-03-18',
      jsonLd: blogJsonLd('Moltbook Let Agents Talk. OTP Teaches Organizations How to Run Them.', 'moltbook-vs-otp', '2026-03-18', 1800)
    });
  });

  // Blog post 15
  app.get('/blog/ai-coordination-stack', async (request, reply) => {
    return renderV7(reply, 'blog-post-15', {
      title: 'The AI Coordination Stack: Where OTP Fits Among 40+ Frameworks, Protocols, and Platforms - OTP',
      description: 'MCP, A2A, LangGraph, CrewAI, Salesforce Agentforce, AWS Bedrock, GPT Store - the AI agent ecosystem has 40+ players across 6 layers. OTP is the only one at Layer 6: Organizational Intelligence.',
      canonical: BASE_URL + '/blog/ai-coordination-stack',
      ogType: 'article',
      datePublished: '2026-03-18',
      jsonLd: blogJsonLd('The AI Coordination Stack: Where OTP Fits Among 40+ Frameworks, Protocols, and Platforms', 'ai-coordination-stack', '2026-03-18', 2500)
    });
  });

  // Blog post 16
  app.get('/blog/gartner-40-percent-will-fail', async (request, reply) => {
    return renderV7(reply, 'blog-post-16', {
      title: 'Gartner Predicts 40% of AI Agent Projects Will Be Cancelled by 2027. Here Is Why. - OTP',
      description: 'Gartner predicts 40% of agentic AI projects will be cancelled by 2027. The failures are not model problems. They are coordination problems. Here is what separates the 60% that survive.',
      canonical: BASE_URL + '/blog/gartner-40-percent-will-fail',
      ogType: 'article',
      datePublished: '2026-03-19',
      jsonLd: blogJsonLd('Gartner Predicts 40% of AI Agent Projects Will Be Cancelled by 2027. Here Is Why.', 'gartner-40-percent-will-fail', '2026-03-19', 2200)
    });
  });

  // Blog post 17
  app.get('/blog/351k-skills-zero-standards', async (request, reply) => {
    return renderV7(reply, 'blog-post-17', {
      title: '351,000 Agent Skills in 120 Days. Zero Standards for How Agent Teams Work Together. - OTP',
      description: 'Agent skills marketplaces hit 351,000 skills in 120 days. But skills are agent-level knowledge. The organizational layer -- how agent teams coordinate -- has no standard. That is the gap OTP fills.',
      canonical: BASE_URL + '/blog/351k-skills-zero-standards',
      ogType: 'article',
      datePublished: '2026-03-19',
      jsonLd: blogJsonLd('351,000 Agent Skills in 120 Days. Zero Standards for How Agent Teams Work Together.', '351k-skills-zero-standards', '2026-03-19', 2000)
    });
  });

  // Blog post 18
  app.get('/blog/1500-percent-more-tokens', async (request, reply) => {
    return renderV7(reply, 'blog-post-18', {
      title: '1,500% More Tokens Per Workflow. Most of Them Are Wasted. - OTP',
      description: 'Multi-agent workflows generate 1,500% more tokens than standard formats. NVIDIA solved the inference cost. The coordination waste -- rebuilding organizational context every cycle -- is the unsolved problem.',
      canonical: BASE_URL + '/blog/1500-percent-more-tokens',
      ogType: 'article',
      datePublished: '2026-03-19',
      jsonLd: blogJsonLd('1,500% More Tokens Per Workflow. Most of Them Are Wasted.', '1500-percent-more-tokens', '2026-03-19', 2000)
    });
  });

  // Blog post 19
  app.get('/blog/the-last-mile-just-got-shorter', async (request, reply) => {
    return renderV7(reply, 'blog-post-19', {
      title: 'The Last Mile Just Got Shorter. - OTP',
      description: 'DoorDash is paying gig workers to film themselves doing chores to train AI robots. The pattern of workers training their own replacements is not new. It is just getting harder to ignore.',
      canonical: BASE_URL + '/blog/the-last-mile-just-got-shorter',
      ogType: 'article',
      datePublished: '2026-03-20',
      jsonLd: blogJsonLd('The Last Mile Just Got Shorter.', 'the-last-mile-just-got-shorter', '2026-03-20', 2200)
    });
  });

  // Blog post 20
  app.get('/blog/defining-rules-vs-enforcing-them', async (request, reply) => {
    return renderV7(reply, 'blog-post-20', {
      title: 'Your OOS Defines the Rules. Your Runtime Enforces Them. You Need Both. - OTP',
      description: 'Why the architecture layer and the monitoring layer are complementary, not competing. The OOS defines what the rules are. Runtime monitoring enforces them. You need both.',
      canonical: BASE_URL + '/blog/defining-rules-vs-enforcing-them',
      ogType: 'article',
      datePublished: '2026-03-20',
      jsonLd: blogJsonLd('Your OOS Defines the Rules. Your Runtime Enforces Them. You Need Both.', 'defining-rules-vs-enforcing-them', '2026-03-20', 2200)
    });
  });

  // Blog post 21
  app.get('/blog/personal-ai-revolution-knowledge-layer', async (request, reply) => {
    return renderV7(reply, 'blog-post-21', {
      title: 'The Personal AI Revolution Is Coming. Nobody\'s Building the Knowledge Layer. - OTP',
      description: 'HTTP moved documents between computers. OTP moves operational intelligence between AI systems. The knowledge transfer layer for the personal AI era does not exist yet.',
      canonical: BASE_URL + '/blog/personal-ai-revolution-knowledge-layer',
      ogType: 'article',
      datePublished: '2026-03-21',
      jsonLd: blogJsonLd('The Personal AI Revolution Is Coming. Nobody\'s Building the Knowledge Layer.', 'personal-ai-revolution-knowledge-layer', '2026-03-21', 2000)
    });
  });

  // Blog post 22
  app.get('/blog/your-ai-is-learning-alone', async (request, reply) => {
    return renderV7(reply, 'blog-post-22', {
      title: 'Your AI Is Learning Alone. That\'s About to Change. - OTP',
      description: 'Every AI system figures things out from scratch. Your breakthroughs die with your setup. What if your AI could safely import what another AI learned?',
      canonical: BASE_URL + '/blog/your-ai-is-learning-alone',
      ogType: 'article',
      datePublished: '2026-03-21',
      jsonLd: blogJsonLd('Your AI Is Learning Alone. That\'s About to Change.', 'your-ai-is-learning-alone', '2026-03-21', 2200)
    });
  });

  // Blog post 23
  app.get('/blog/coach-dilemma-ai-frameworks', async (request, reply) => {
    return renderV7(reply, 'blog-post-23', {
      title: 'The Coach\'s Dilemma: AI Can Run Your Frameworks. It Can\'t Replace What You Actually Do. - OTP',
      description: 'EOS and Scaling Up playbooks are getting automated. The coaches who survive will encode what the playbook can\'t capture.',
      canonical: BASE_URL + '/blog/coach-dilemma-ai-frameworks',
      ogType: 'article',
      datePublished: '2026-03-23',
      jsonLd: blogJsonLd('The Coach\'s Dilemma: AI Can Run Your Frameworks. It Can\'t Replace What You Actually Do.', 'coach-dilemma-ai-frameworks', '2026-03-23', 2400)
    });
  });

  // Blog post 24
  app.get('/blog/asaas-desktop-ai-coaching', async (request, reply) => {
    return renderV7(reply, 'blog-post-24', {
      title: 'ASaaS, Desktop AI, and the End of Software You Log Into - OTP',
      description: 'SaaS gave everyone the same tool. ASaaS gives everyone a different team. The coaching model has to change with it.',
      canonical: BASE_URL + '/blog/asaas-desktop-ai-coaching',
      ogType: 'article',
      datePublished: '2026-03-23',
      jsonLd: blogJsonLd('ASaaS, Desktop AI, and the End of Software You Log Into', 'asaas-desktop-ai-coaching', '2026-03-23', 2600)
    });
  });

  // Blog post 25
  app.get('/blog/unlock-20-years-coaching-experience', async (request, reply) => {
    return renderV7(reply, 'blog-post-25', {
      title: '20 Years of Coaching, Locked in Your Head. Here\'s How to Unlock It. - OTP',
      description: 'Most coaching businesses are one-to-one, time-limited, and die when you stop. OTP turns your experience into a scalable intelligence asset.',
      canonical: BASE_URL + '/blog/unlock-20-years-coaching-experience',
      ogType: 'article',
      datePublished: '2026-03-23',
      jsonLd: blogJsonLd('20 Years of Coaching, Locked in Your Head. Here\'s How to Unlock It.', 'unlock-20-years-coaching-experience', '2026-03-23', 2800)
    });
  });

  // Orchestra Kit (design system)
  app.get('/orchestra-kit', async (request, reply) => {
    return reply.sendFile('orchestra-kit.html');
  });

  // Glossary index (DB-driven, grouped A-Z)
  app.get('/glossary', async (request, reply) => {
    const glossaryUrl = BASE_URL + '/glossary';
    const faqItems = [
      { q: 'What is coordination intelligence?', a: 'The collective, structured knowledge of how AI agents within and across organizations should coordinate. It is captured in operational rules, documented failure modes, and evidence-backed patterns.' },
      { q: 'What is an Organizational Operating System (OOS)?', a: 'A structured artifact that encodes how AI agents in an organization coordinate. Contains knowledge claims with confidence ratings, evidence types, and failure modes.' },
      { q: 'What is a knowledge claim?', a: 'An individual operational rule extracted from an OOS, with a claim ID, section, rule, reasoning, failure mode, confidence level, and evidence type.' },
      { q: 'What is the Token Efficiency Ratio?', a: 'A metric measuring whether an operational rule saves more tokens than it costs to load. Ratio above 1.0 means the rule pays for itself.' },
      { q: 'What is the Intelligence Graph?', a: 'A network showing how coordination patterns connect across published OOS files. Reveals shared operational truths and unique approaches across organizations.' },
      { q: 'What are agentic maturity levels?', a: 'An 8-level framework (L1 through L8) measuring how sophisticated an organization\'s AI agent coordination is, from basic tab completion to autonomous agent teams.' },
      { q: 'What is the Organization Transport Protocol?', a: 'The protocol and platform for publishing, comparing, and learning from organizational coordination intelligence. Operates above MCP and A2A in the AI coordination stack.' },
      { q: 'What is MCP (Model Context Protocol)?', a: 'An open protocol created by Anthropic that lets AI models connect to external tools and data sources. MCP is the standard for the tool layer of the AI coordination stack.' },
      { q: 'What is an AI agent?', a: 'A software program powered by AI that can take actions on its own, including using tools, reading files, calling APIs, making decisions, and completing multi-step tasks.' },
      { q: 'What is shared state in multi-agent systems?', a: 'Information that multiple agents need access to, stored in files or databases where one agent writes and others read. Keeping shared state consistent is a core coordination challenge.' },
    ];

    // Pull every public glossary term, ordered A-Z by name
    const rowsRes = await db.execute(sql`
      SELECT slug, name, definition, why_it_matters, framework, related_slugs, aliases
      FROM glossary_terms
      WHERE public = true
      ORDER BY name ASC
    `) as any;
    const allTerms = (rowsRes.rows || []).map((r: any) => ({
      slug: r.slug,
      name: r.name,
      definition: r.definition,
      whyItMatters: r.why_it_matters,
      framework: r.framework,
      relatedSlugs: r.related_slugs || [],
      aliases: r.aliases || [],
    }));

    // Group by first letter (A-Z), with "#" bucket for non-alpha (e.g. "4DX")
    const letters = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
    const grouped: Record<string, typeof allTerms> = { '#': [] };
    for (const L of letters) grouped[L] = [];
    for (const t of allTerms) {
      const first = t.name.charAt(0).toUpperCase();
      if (letters.includes(first)) grouped[first].push(t);
      else grouped['#'].push(t);
    }
    const groupedOrder = (grouped['#'].length ? ['#'] : []).concat(letters);
    const activeLetters = new Set(groupedOrder.filter(L => grouped[L].length > 0));
    const totalCount = allTerms.length;
    return renderV7(reply, 'glossary', {
      title: `AI Coordination Dictionary - ${totalCount} Terms Defined - OTP`,
      description: `The definitive reference for AI agent coordination, EOS, Scaling Up, 4DX, OKRs, and Holacracy terminology. ${totalCount} plain-English definitions covering protocols, frameworks, and the patterns that hold AI agent teams together.`,
      canonical: glossaryUrl,
      breadcrumbs: bc({ name: 'Glossary', url: glossaryUrl }),
      grouped,
      groupedOrder,
      activeLetters,
      totalCount,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'DefinedTermSet',
          name: 'AI Coordination Dictionary',
          description: `The definitive reference for AI coordination terminology. ${totalCount} terms covering protocols, agent concepts, coordination patterns, and operating-system frameworks (EOS, Scaling Up, 4DX, OKRs, Holacracy).`,
          url: glossaryUrl,
          hasDefinedTerm: allTerms.map((t: any) => ({
            '@type': 'DefinedTerm',
            '@id': `${glossaryUrl}/${t.slug}`,
            name: t.name,
            description: t.definition,
            url: `${glossaryUrl}/${t.slug}`,
            inDefinedTermSet: glossaryUrl
          }))
        },
        { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqItems.map(i => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })) }
      ]
    });
  });

  // Glossary term detail page (programmatic SEO target)
  app.get<{ Params: { slug: string } }>('/glossary/:slug', async (request, reply) => {
    const slug = (request.params.slug || '').toLowerCase().trim();
    if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
      reply.status(404);
      return reply.view('pages/404', { title: 'Term not found - OTP', description: 'Glossary term not found.', canonical: BASE_URL + '/glossary' });
    }

    const termRes = await db.execute(sql`
      SELECT slug, name, definition, why_it_matters, framework, related_slugs, aliases, updated_at
      FROM glossary_terms
      WHERE slug = ${slug} AND public = true
      LIMIT 1
    `) as any;
    const row = (termRes.rows || [])[0];
    if (!row) {
      reply.status(404);
      return reply.view('pages/404', { title: 'Term not found - OTP', description: 'Glossary term not found.', canonical: BASE_URL + '/glossary' });
    }

    const term = {
      slug: row.slug as string,
      name: row.name as string,
      definition: row.definition as string,
      whyItMatters: row.why_it_matters as string | null,
      framework: row.framework as string | null,
      relatedSlugs: (row.related_slugs || []) as string[],
      aliases: (row.aliases || []) as string[],
      updatedAt: row.updated_at,
    };

    // Hydrate related terms (one query, only the slugs we need).
    // Use pool.query directly: Drizzle's sql template encodes JS string[] as
    // a Postgres record, which fails on `slug = ANY($1)` (needs array, not record).
    // node-postgres on the raw Pool handles JS arrays -> text[] natively.
    let relatedTerms: Array<{ slug: string; name: string; definition: string }> = [];
    if (term.relatedSlugs.length > 0) {
      const { pool } = await import('../../config/database.js');
      const relatedRes = await pool.query(
        `SELECT slug, name, definition
         FROM glossary_terms
         WHERE slug = ANY($1::text[]) AND public = true
         ORDER BY name ASC`,
        [term.relatedSlugs],
      );
      relatedTerms = (relatedRes.rows || []).map((r: any) => ({ slug: r.slug, name: r.name, definition: r.definition }));
    }

    const termUrl = `${BASE_URL}/glossary/${term.slug}`;
    const lastmod = term.updatedAt ? new Date(term.updatedAt as any).toISOString() : new Date().toISOString();

    return renderV7(reply, 'glossary-term', {
      title: `${term.name} - OTP Glossary`,
      description: term.definition.length > 155 ? term.definition.slice(0, 152) + '...' : term.definition,
      canonical: termUrl,
      breadcrumbs: bc(
        { name: 'Glossary', url: BASE_URL + '/glossary' },
        { name: term.name, url: termUrl }
      ),
      term,
      relatedTerms,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'DefinedTerm',
          '@id': termUrl,
          name: term.name,
          description: term.definition,
          url: termUrl,
          ...(term.aliases.length ? { alternateName: term.aliases } : {}),
          inDefinedTermSet: {
            '@type': 'DefinedTermSet',
            name: 'AI Coordination Dictionary',
            url: BASE_URL + '/glossary',
          },
          ...(term.framework ? { termCode: term.framework } : {}),
          dateModified: lastmod,
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL + '/' },
            { '@type': 'ListItem', position: 2, name: 'Glossary', item: BASE_URL + '/glossary' },
            { '@type': 'ListItem', position: 3, name: term.name, item: termUrl },
          ],
        },
      ],
    });
  });

  // FAQ
  app.get('/faq', async (request, reply) => {
    const faqItems = [
      { q: 'What is OTP?', a: 'OTP (Organization Transport Protocol) is a platform where organizations publish, compare, and learn from Organizational Operating Systems. It captures how AI agents coordinate at the organizational level.' },
      { q: 'What is coordination intelligence?', a: 'The collective, structured knowledge of how AI agents within and across organizations should coordinate. It is machine-readable, comparable, and transferable.' },
      { q: 'How is OTP different from CrewAI, AutoGen, or LangGraph?', a: 'CrewAI, AutoGen, and LangGraph are agent orchestration frameworks handling execution plumbing. OTP captures organizational intelligence that tells agents what the rules are.' },
      { q: 'How is OTP different from MCP or A2A?', a: 'MCP connects agents to tools. A2A connects agents to each other. OTP connects organizations to coordination intelligence. The three layers are complementary.' },
      { q: 'What is the Token Efficiency Ratio?', a: 'A metric measuring whether an operational rule saves more tokens than it costs to load into context. A ratio above 1.0 means the rule pays for itself.' },
      { q: 'How do I publish my OOS?', a: 'Sign up, choose a template, generate your OOS using our guide, and paste it into the publish form. The platform validates, extracts claims, and publishes.' },
      { q: 'What templates are available?', a: 'Agent Army for multi-agent teams, Value Chain for process-oriented organizations, and Org Chart for traditional hierarchies integrating AI.' },
      { q: 'What does the Founding Publisher badge mean?', a: 'Given to the first 50 organizations that publish on OTP. Permanent badge with early access to Phase 2 features.' },
      { q: 'What is the Intelligence Graph?', a: 'A network visualization showing how coordination patterns connect across organizations. Similar claims are linked, revealing shared truths and unique approaches.' },
      { q: 'What are agentic maturity levels?', a: 'An 8-level framework measuring AI agent coordination sophistication, from L1 Tab Complete through L8 Autonomous Agent Teams.' },
      { q: 'What size organization can use OTP?', a: 'Any organization running AI agents, from solo operators to enterprises. The OOS format scales with your team.' },
      { q: 'Does OTP have an API?', a: 'Yes. REST API and MCP server for programmatic access to OOS data, claims, search, and the Intelligence Graph.' },
    ];
    return renderV7(reply, 'faq', {
      title: 'FAQ - Organization Transport Protocol - OTP',
      description: 'Frequently asked questions about OTP, Organizational Operating Systems, coordination intelligence, and how to publish your AI coordination knowledge.',
      breadcrumbs: bc({ name: 'FAQ', url: BASE_URL + '/faq' }),
      canonical: BASE_URL + '/faq',
      jsonLd: { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqItems.map(i => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })) }
    });
  });

  // AEO cluster pages -- answer-engine-optimized landing pages targeting the
  // commercial-intent buyer prompts from the SurgeGraph AI-ranking audit
  // (2026-05-15). Hub at /answers, one page per cluster at /answers/<slug>.
  app.get('/answers', async (request, reply) => {
    return renderV7(reply, 'aeo-hub', {
      title: 'Answers: Organizing, Governing & Coordinating AI Agents - OTP',
      description: 'Direct answers to what operators ask AI engines about running AI agents inside a company: coordination, operating systems, governance, playbooks, and collaboration.',
      canonical: BASE_URL + '/answers',
      breadcrumbs: bc({ name: 'Answers', url: BASE_URL + '/answers' }),
      clusters: aeoClusters,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'OTP Answers',
        description: 'Answer-engine-optimized guides to organizing, governing, and coordinating AI agents inside a company.',
        url: BASE_URL + '/answers',
        hasPart: aeoClusters.map(c => ({ '@type': 'WebPage', name: c.h1, url: BASE_URL + '/answers/' + c.slug })),
      },
    });
  });

  for (const cluster of aeoClusters) {
    app.get('/answers/' + cluster.slug, async (request, reply) => {
      const clusterUrl = BASE_URL + '/answers/' + cluster.slug;
      const related = aeoClusters
        .filter(c => c.slug !== cluster.slug)
        .map(c => ({ slug: c.slug, badge: c.badge, h1: c.h1 }));
      return reply.view('pages/aeo-cluster', {
        title: cluster.title,
        description: cluster.description,
        canonical: clusterUrl,
        breadcrumbs: bc(
          { name: 'Answers', url: BASE_URL + '/answers' },
          { name: cluster.badge, url: clusterUrl }
        ),
        cluster,
        related,
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          name: cluster.h1,
          url: clusterUrl,
          mainEntity: cluster.items.map(it => ({
            '@type': 'Question',
            name: it.q,
            acceptedAnswer: { '@type': 'Answer', text: it.a.replace(/<[^>]+>/g, '') },
          })),
        },
      });
    });
  }

  // About
  app.get('/about', async (request, reply) => {
    return renderV7(reply, 'about', {
      title: 'About OTP - Organization Transport Protocol',
      description: 'OTP was built by David Steel, who runs 14 AI agents in production. The platform was constructed using the same agent coordination system it measures.',
      canonical: BASE_URL + '/about',
      ogImage: 'https://orgtp.com/public/images/og-otp-home.png',
      jsonLd: [
        { '@context': 'https://schema.org', '@type': 'Organization', name: 'OTP - Organization Transport Protocol', url: BASE_URL, founder: { '@type': 'Person', name: 'David Steel' }, description: 'The operating platform for teams of people and AI agents.' },
        { '@context': 'https://schema.org', '@type': 'Person', name: 'David Steel', jobTitle: 'Founder', worksFor: { '@type': 'Organization', name: 'OTP' }, description: 'Runs 14 AI agents in production at Sneeze It. Built OTP to share what works across organizations.' }
      ]
    });
  });

  // Super Admin Dashboard
  app.get('/admin', async (request, reply) => {
    const isAdmin = (request as any).isSuperAdmin;
    if (!isAdmin) return reply.status(404).view('pages/home', { title: 'Not Found', noindex: true });

    // ---- Users (funnel: signup -> return -> org -> MCP -> publish) ----
    const { createClerkClient } = await import('@clerk/backend');
    let users: any[] = [];
    let userStats = { total: 0, returned: 0, withOrg: 0, mcpActive: 0, publishers: 0 };
    try {
      const secretKey = process.env.CLERK_SECRET_KEY;
      if (secretKey) {
        const clerk = createClerkClient({ secretKey });
        const { data: clerkUsers } = await clerk.users.getUserList({ limit: 100, orderBy: '-created_at' });

        const now = Date.now();
        users = await Promise.all(clerkUsers.map(async (u) => {
          const email = u.emailAddresses.find(e => e.id === u.primaryEmailAddressId)?.emailAddress
            || u.emailAddresses[0]?.emailAddress || null;
          const signUpAtMs = u.createdAt;
          const lastSignInAtMs = u.lastSignInAt || null;
          const hasReturned = lastSignInAtMs !== null && (lastSignInAtMs - signUpAtMs) > 60_000;
          const daysSinceLastLogin = lastSignInAtMs !== null
            ? Math.floor((now - lastSignInAtMs) / (1000 * 60 * 60 * 24))
            : null;

          const orgRes = await db.execute(sql`SELECT id, name FROM organizations WHERE clerk_org_id = ${u.id} LIMIT 1`) as any;
          const org = orgRes.rows[0] || null;

          let publishedOos = 0;
          let lastMcpUsedAt: Date | null = null;
          let mcpCallCount = 0;
          let activity: Array<{ action: string; entityType: string; createdAt: Date }> = [];
          if (org) {
            const oosRes = await db.execute(sql`SELECT COUNT(*)::int AS n FROM oos_files WHERE org_id = ${org.id} AND status = 'published'`) as any;
            publishedOos = Number(oosRes.rows[0]?.n || 0);
            const keyRes = await db.execute(sql`SELECT MAX(last_used_at) AS last_used, COALESCE(SUM(use_count), 0)::int AS total FROM api_keys WHERE org_id = ${org.id}`) as any;
            lastMcpUsedAt = keyRes.rows[0]?.last_used || null;
            mcpCallCount = Number(keyRes.rows[0]?.total || 0);
            const actRes = await db.execute(sql`
              SELECT action, entity_type, created_at
              FROM audit_logs
              WHERE org_id = ${org.id}
              ORDER BY created_at DESC
              LIMIT 10
            `) as any;
            activity = (actRes.rows || []).map((r: any) => ({
              action: r.action,
              entityType: r.entity_type,
              createdAt: new Date(r.created_at),
            }));
          }

          const onbRes = await db.execute(sql`
            SELECT email_1_sent_at, email_2_sent_at, email_3_sent_at, unsubscribed_at
            FROM onboarding_sequence WHERE clerk_user_id = ${u.id} LIMIT 1
          `) as any;
          const onb = onbRes.rows[0] || null;

          return {
            clerkUserId: u.id,
            email,
            name: [u.firstName, u.lastName].filter(Boolean).join(' ') || null,
            signUpAt: new Date(signUpAtMs),
            lastSignInAt: lastSignInAtMs ? new Date(lastSignInAtMs) : null,
            daysSinceLastLogin,
            hasReturned,
            orgName: org?.name || null,
            publishedOos,
            mcpActive: mcpCallCount > 0,
            mcpCallCount,
            lastMcpUsedAt,
            activity,
            onboardingStage: onb ? [onb.email_1_sent_at, onb.email_2_sent_at, onb.email_3_sent_at].filter(Boolean).length : 0,
            unsubscribed: !!onb?.unsubscribed_at,
          };
        }));

        userStats = {
          total: users.length,
          returned: users.filter(u => u.hasReturned).length,
          withOrg: users.filter(u => u.orgName).length,
          mcpActive: users.filter(u => u.mcpActive).length,
          publishers: users.filter(u => u.publishedOos > 0).length,
        };
      }
    } catch (err) {
      request.log.error({ err }, '[admin] failed to fetch users');
    }

    // All orgs
    const orgsRes = await db.execute(sql`SELECT * FROM organizations ORDER BY created_at DESC`) as any;
    const orgs = orgsRes.rows || [];

    // Published OOS files with org names
    const oosRes = await db.execute(sql`
      SELECT f.*, o.name AS org_name
      FROM oos_files f JOIN organizations o ON f.org_id = o.id
      ORDER BY f.created_at DESC
    `) as any;
    const oosFilesList = oosRes.rows || [];

    // Stats
    const statsRes = await db.execute(sql`
      SELECT
        (SELECT COUNT(*) FROM organizations) AS total_orgs,
        (SELECT COUNT(*) FROM oos_files WHERE status = 'published') AS published_oos,
        (SELECT COUNT(*) FROM claims WHERE oos_file_id IN (SELECT id FROM oos_files WHERE status = 'published')) AS total_claims,
        (SELECT COUNT(*) FROM claim_similarities) AS total_similarities,
        (SELECT COUNT(*) FROM tickets WHERE status IN ('open', 'in_progress')) AS open_tickets,
        (SELECT COUNT(*) FROM api_keys WHERE revoked_at IS NULL) AS api_keys
    `) as any;
    const row = (statsRes.rows || [])[0] || {};

    // Recent audit logs with org names
    const auditRes = await db.execute(sql`
      SELECT a.*, o.name AS org_name
      FROM audit_logs a LEFT JOIN organizations o ON a.org_id = o.id
      ORDER BY a.created_at DESC LIMIT 30
    `) as any;

    // Open tickets
    const ticketsRes = await db.execute(sql`
      SELECT * FROM tickets WHERE status IN ('open', 'in_progress') ORDER BY priority DESC, created_at DESC
    `) as any;

    return reply.view('pages/admin', {
      title: 'Admin Dashboard - OTP',
      description: 'OTP platform administration dashboard.',
      noindex: true,
      stats: {
        totalOrgs: parseInt(row.total_orgs || '0', 10),
        publishedOos: parseInt(row.published_oos || '0', 10),
        totalClaims: parseInt(row.total_claims || '0', 10),
        totalSimilarities: parseInt(row.total_similarities || '0', 10),
        openTickets: parseInt(row.open_tickets || '0', 10),
        apiKeys: parseInt(row.api_keys || '0', 10),
      },
      orgs,
      oosFiles: oosFilesList,
      auditLogs: auditRes.rows || [],
      tickets: ticketsRes.rows || [],
      users,
      userStats,
    });
  });

  // Super Admin: Pre-signup subscribers page (founder-add UI + list)
  app.get('/admin/subscribers', async (request, reply) => {
    const isAdmin = (request as any).isSuperAdmin;
    if (!isAdmin) return reply.status(404).view('pages/home', { title: 'Not Found', noindex: true });

    const subs = await db
      .select()
      .from(newsletterSubscribers)
      .orderBy(desc(newsletterSubscribers.subscribedAt));

    const total = subs.length;
    const converted = subs.filter(s => s.convertedAt !== null).length;
    const unsubscribed = subs.filter(s => s.unsubscribedAt !== null).length;
    const active = total - unsubscribed;
    const conversionRate = active > 0 ? Math.round((converted / active) * 1000) / 10 : 0;

    const bySource: Record<string, { count: number; converted: number }> = {};
    for (const s of subs) {
      const bucket = bySource[s.source] ?? { count: 0, converted: 0 };
      bucket.count += 1;
      if (s.convertedAt) bucket.converted += 1;
      bySource[s.source] = bucket;
    }

    return reply.view('pages/admin-subscribers', {
      title: 'Pre-Signup Subscribers — Admin',
      noindex: true,
      stats: { total, active, converted, unsubscribed, conversionRate, bySource },
      subscribers: subs,
    });
  });

  // Super Admin: Partner program review queue
  // Allows ?key=otp-founding-2026 fallback so David can review without full Clerk session.
  app.get<{ Querystring: { status?: string; key?: string } }>('/admin/partners', async (request, reply) => {
    const isAdmin = (request as any).isSuperAdmin === true || request.query.key === 'otp-founding-2026';
    if (!isAdmin) return reply.status(404).view('pages/home', { title: 'Not Found', noindex: true });

    const requestedStatus = request.query.status;
    const validStatuses = ['pending', 'reviewing', 'approved', 'declined', 'onboarded'] as const;
    type PartnerStatus = typeof validStatuses[number];

    const partnersAll = await db.select().from(partnerSignups).orderBy(desc(partnerSignups.createdAt));

    let visible = partnersAll;
    if (requestedStatus && requestedStatus !== 'all' && (validStatuses as readonly string[]).includes(requestedStatus)) {
      visible = partnersAll.filter(p => p.status === (requestedStatus as PartnerStatus));
    }

    const counts = {
      total: partnersAll.length,
      pending: partnersAll.filter(p => p.status === 'pending').length,
      reviewing: partnersAll.filter(p => p.status === 'reviewing').length,
      approved: partnersAll.filter(p => p.status === 'approved').length,
      declined: partnersAll.filter(p => p.status === 'declined').length,
      onboarded: partnersAll.filter(p => p.status === 'onboarded').length,
    };

    return reply.view('pages/admin-partners', {
      title: 'Partner Applications — Admin',
      noindex: true,
      partners: visible,
      counts,
      activeStatus: requestedStatus || 'all',
      keyParam: request.query.key || '',
    });
  });

  // ---------- Super-admin impersonation ----------
  // POST /admin/impersonate/:memberId  -- start "view as" session
  // POST /admin/impersonate/exit        -- clear cookie + audit log
  app.post<{ Params: { memberId: string } }>('/admin/impersonate/:memberId', async (request, reply) => {
    if (!(request as any).isSuperAdmin) {
      return reply.status(404).view('pages/home', { title: 'Not Found', noindex: true });
    }
    const auth = getAuth(request);
    if (!auth.userId) return reply.status(401).send({ error: 'AUTH_REQUIRED' });

    const { startImpersonation, IMPERSONATION_COOKIE_NAME } = await import('../../middleware/impersonation.js');
    try {
      const started = await startImpersonation({
        byClerkUserId: auth.userId,
        targetMemberId: request.params.memberId,
      });
      reply.setCookie(IMPERSONATION_COOKIE_NAME, started.cookieValue, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: started.cookieMaxAgeSec,
        path: '/',
      });
      return reply.redirect('/dashboard');
    } catch (e: any) {
      const msg = String(e?.message || 'Impersonation failed');
      return reply.status(400).send({ error: msg });
    }
  });

  // POST /admin/impersonate/by-clerk/:clerkUserId  -- resolve member by Clerk
  // user id, then start impersonation. Convenience for /admin users table
  // which doesn't already have member ids on hand.
  app.post<{ Params: { clerkUserId: string } }>('/admin/impersonate/by-clerk/:clerkUserId', async (request, reply) => {
    if (!(request as any).isSuperAdmin) {
      return reply.status(404).view('pages/home', { title: 'Not Found', noindex: true });
    }
    const auth = getAuth(request);
    if (!auth.userId) return reply.status(401).send({ error: 'AUTH_REQUIRED' });

    const targetClerkId = request.params.clerkUserId;
    if (!/^[A-Za-z0-9_]{10,80}$/.test(targetClerkId)) {
      return reply.status(400).send({ error: 'INVALID_CLERK_USER_ID' });
    }
    const [m] = await db.select().from(orgMembers)
      .where(eq(orgMembers.clerkUserId, targetClerkId))
      .limit(1);
    if (!m) return reply.status(404).send({ error: 'NO_MEMBER_ROW: target has not joined any org via membership table' });

    const { startImpersonation, IMPERSONATION_COOKIE_NAME } = await import('../../middleware/impersonation.js');
    try {
      const started = await startImpersonation({
        byClerkUserId: auth.userId,
        targetMemberId: m.id,
      });
      reply.setCookie(IMPERSONATION_COOKIE_NAME, started.cookieValue, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: started.cookieMaxAgeSec,
        path: '/',
      });
      return reply.redirect('/dashboard');
    } catch (e: any) {
      return reply.status(400).send({ error: String(e?.message || 'Impersonation failed') });
    }
  });

  app.post('/admin/impersonate/exit', async (request, reply) => {
    const auth = getAuth(request);
    const { decodeImpersonationCookie, endImpersonation, IMPERSONATION_COOKIE_NAME } =
      await import('../../middleware/impersonation.js');
    const cookieRaw = (request as any).cookies?.[IMPERSONATION_COOKIE_NAME];
    const payload = decodeImpersonationCookie(cookieRaw);
    if (payload && auth.userId && payload.by === auth.userId) {
      await endImpersonation(payload);
    }
    reply.clearCookie(IMPERSONATION_COOKIE_NAME, { path: '/' });
    return reply.redirect('/admin');
  });

  // GET fallback to allow plain-link exit (banner button)
  app.get('/admin/impersonate/exit', async (request, reply) => {
    const auth = getAuth(request);
    const { decodeImpersonationCookie, endImpersonation, IMPERSONATION_COOKIE_NAME } =
      await import('../../middleware/impersonation.js');
    const cookieRaw = (request as any).cookies?.[IMPERSONATION_COOKIE_NAME];
    const payload = decodeImpersonationCookie(cookieRaw);
    if (payload && auth.userId && payload.by === auth.userId) {
      await endImpersonation(payload);
    }
    reply.clearCookie(IMPERSONATION_COOKIE_NAME, { path: '/' });
    return reply.redirect('/admin');
  });

  // Super Admin: Skills inventory across every org's published OOS chart.
  // Renders HTML at /admin/skills and the same data as CSV at /admin/skills.csv.
  // Aggregates: catalog usage, custom skills (in the wild not in catalog),
  // agents missing skills entirely, and coverage-by-role across orgs.
  async function buildSkillsInventory() {
    const { SKILLS_CATALOG } = await import('../../data/skills-catalog.js');
    const allOrgs = await db.select({ id: organizations.id, name: organizations.name }).from(organizations);

    type EntityRef = {
      orgId: string; orgName: string;
      entityId: string; entityLabel: string; entityType: 'agent' | 'human' | 'organization';
      role: string | null;
    };

    // skill (lower-case) -> entity refs
    const usage = new Map<string, Array<EntityRef & { original: string }>>();
    // role (lower-case) -> { displayRole, entities, skillsByCount }
    const roleData = new Map<string, {
      displayRole: string;
      entities: Array<EntityRef & { skills: string[] }>;
    }>();
    // agents/humans with empty or missing skills
    const missingSkills: Array<EntityRef> = [];

    // Normalise the skills field. YAML chart files sometimes store skills as
    // a YAML array (preferred) and sometimes as a comma-separated string
    // (the CSV import path stores it as a single string until next save).
    // Both shapes need to count as assigned skills.
    function readList(raw: unknown): string[] {
      if (Array.isArray(raw)) {
        return raw.map(s => String(s || '').trim()).filter(Boolean);
      }
      if (typeof raw === 'string') {
        return raw.split(/[,;\n]/).map(s => s.trim()).filter(Boolean);
      }
      return [];
    }

    // command (lower-case) -> entity refs that declare this slash command
    type CmdRef = {
      orgId: string; orgName: string;
      entityId: string; entityLabel: string;
      original: string;
    };
    const cmdUsage = new Map<string, CmdRef[]>();
    const missingCommandsAgents: Array<{
      orgId: string; orgName: string; entityId: string; entityLabel: string; role: string | null;
    }> = [];

    for (const o of allOrgs) {
      try {
        const graph = await getOrgTeamGraph(o.id, o.name || '');
        for (const node of graph.nodes) {
          if (node.type !== 'agent' && node.type !== 'human') continue;
          const props: any = node.properties || {};
          const skillsClean = readList(props.skills);
          const commandsClean = readList(props.slashCommands).map(c =>
            // Normalise: strip leading "/" so /standup and standup match.
            c.startsWith('/') ? c.slice(1) : c
          ).filter(Boolean);

          // Slash command aggregation -- agents only (humans don't run /commands)
          if (node.type === 'agent') {
            if (commandsClean.length === 0) {
              missingCommandsAgents.push({
                orgId: o.id,
                orgName: o.name || '(unnamed)',
                entityId: node.externalId,
                entityLabel: node.label,
                role: props.role ? String(props.role).trim() : null,
              });
            }
            for (const c of commandsClean) {
              const key = c.toLowerCase();
              if (!cmdUsage.has(key)) cmdUsage.set(key, []);
              cmdUsage.get(key)!.push({
                orgId: o.id,
                orgName: o.name || '(unnamed)',
                entityId: node.externalId,
                entityLabel: node.label,
                original: c,
              });
            }
          }
          const role: string | null = (props.role || props.jobDescription) ? String(props.role || props.jobDescription).trim() : null;

          const ref: EntityRef = {
            orgId: o.id,
            orgName: o.name || '(unnamed)',
            entityId: node.externalId,
            entityLabel: node.label,
            entityType: node.type,
            role,
          };

          if (skillsClean.length === 0) {
            missingSkills.push(ref);
          } else {
            for (const s of skillsClean) {
              const key = s.toLowerCase();
              if (!usage.has(key)) usage.set(key, []);
              usage.get(key)!.push({ ...ref, original: s });
            }
          }

          if (role) {
            // Bucket by a normalised role label so "CFO", "cfo", " CFO " merge.
            const rkey = role.toLowerCase();
            if (!roleData.has(rkey)) roleData.set(rkey, { displayRole: role, entities: [] });
            roleData.get(rkey)!.entities.push({ ...ref, skills: skillsClean });
          }
        }
      } catch {
        // Org has no published OOS or chart isn't parseable -- skip it.
      }
    }

    type CatalogEntry = {
      category: string;
      skill: string;
      key: string;
      usageCount: number;
      users: Array<{ orgName: string; entityLabel: string; entityType: string; entityId: string; orgId: string }>;
    };
    const catalogEntries: CatalogEntry[] = [];
    const catalogKeys = new Set<string>();
    for (const cat of SKILLS_CATALOG) {
      for (const skill of cat.skills) {
        const key = skill.toLowerCase();
        catalogKeys.add(key);
        const users = (usage.get(key) || []).map(u => ({
          orgName: u.orgName, entityLabel: u.entityLabel,
          entityType: u.entityType, entityId: u.entityId, orgId: u.orgId,
        }));
        catalogEntries.push({ category: cat.category, skill, key, usageCount: users.length, users });
      }
    }

    const customSkills: Array<{
      skill: string; key: string; usageCount: number;
      users: Array<{ orgName: string; entityLabel: string; entityType: string; entityId: string; orgId: string }>;
    }> = [];
    for (const [key, list] of usage.entries()) {
      if (catalogKeys.has(key)) continue;
      customSkills.push({
        skill: list[0].original,
        key,
        usageCount: list.length,
        users: list.map(u => ({
          orgName: u.orgName, entityLabel: u.entityLabel,
          entityType: u.entityType, entityId: u.entityId, orgId: u.orgId,
        })),
      });
    }
    customSkills.sort((a, b) => b.usageCount - a.usageCount);

    // Coverage by role: for each role found across the network, what skills
    // are commonly assigned. Surfaces "every CFO except mine has X."
    type RoleCoverage = {
      role: string;
      entityCount: number;
      orgCount: number;
      commonSkills: Array<{ skill: string; count: number; entities: string[] }>;
    };
    const coverage: RoleCoverage[] = [];
    for (const [, data] of roleData.entries()) {
      if (data.entities.length < 2) continue; // only show roles that exist in 2+ places
      const skillCount = new Map<string, { display: string; count: number; entities: Set<string> }>();
      const orgs = new Set<string>();
      for (const e of data.entities) {
        orgs.add(e.orgId);
        for (const s of e.skills) {
          const k = s.toLowerCase();
          if (!skillCount.has(k)) skillCount.set(k, { display: s, count: 0, entities: new Set() });
          const sc = skillCount.get(k)!;
          sc.count += 1;
          sc.entities.add(`${e.entityLabel} @ ${e.orgName}`);
        }
      }
      const commonSkills = Array.from(skillCount.values())
        .filter(s => s.count >= 2)
        .sort((a, b) => b.count - a.count)
        .slice(0, 12)
        .map(s => ({ skill: s.display, count: s.count, entities: Array.from(s.entities) }));
      coverage.push({
        role: data.displayRole,
        entityCount: data.entities.length,
        orgCount: orgs.size,
        commonSkills,
      });
    }
    coverage.sort((a, b) => b.entityCount - a.entityCount);

    // Build the slash command inventory: every distinct command observed,
    // sorted by usage. Each entry shows who runs it across orgs.
    type CmdEntry = {
      command: string;
      key: string;
      usageCount: number;
      users: Array<{ orgName: string; entityLabel: string; entityId: string; orgId: string }>;
    };
    const commandEntries: CmdEntry[] = [];
    for (const [key, list] of cmdUsage.entries()) {
      commandEntries.push({
        command: list[0].original,
        key,
        usageCount: list.length,
        users: list.map(u => ({
          orgName: u.orgName, entityLabel: u.entityLabel,
          entityId: u.entityId, orgId: u.orgId,
        })),
      });
    }
    commandEntries.sort((a, b) => b.usageCount - a.usageCount || a.command.localeCompare(b.command));

    const stats = {
      catalogSize: catalogEntries.length,
      assigned: catalogEntries.filter(e => e.usageCount > 0).length,
      unassigned: catalogEntries.filter(e => e.usageCount === 0).length,
      customCount: customSkills.length,
      missingCount: missingSkills.length,
      orgsScanned: allOrgs.length,
      totalAssignments: Array.from(usage.values()).reduce((n, list) => n + list.length, 0),
      commandCount: commandEntries.length,
      missingCommandsCount: missingCommandsAgents.length,
      totalCommandRuns: Array.from(cmdUsage.values()).reduce((n, list) => n + list.length, 0),
    };

    const byCategory = new Map<string, CatalogEntry[]>();
    for (const e of catalogEntries) {
      if (!byCategory.has(e.category)) byCategory.set(e.category, []);
      byCategory.get(e.category)!.push(e);
    }

    return {
      stats,
      categories: Array.from(byCategory.entries()).map(([category, entries]) => ({ category, entries })),
      customSkills,
      missingSkills,
      coverage,
      catalogEntries,
      categoriesRaw: SKILLS_CATALOG,
      commandEntries,
      missingCommandsAgents,
    };
  }

  app.get<{ Querystring: { key?: string } }>('/admin/skills', async (request, reply) => {
    const isAdmin = (request as any).isSuperAdmin === true || request.query.key === 'otp-founding-2026';
    if (!isAdmin) return reply.status(404).view('pages/home', { title: 'Not Found', noindex: true });

    const data = await buildSkillsInventory();

    return reply.view('pages/admin-skills', {
      title: 'Skills Inventory - Admin - OTP',
      description: 'Platform-wide skills inventory: every catalog skill, who uses it, what is unassigned, plus coverage by role.',
      noindex: true,
      ...data,
      keyParam: request.query.key || '',
    });
  });

  // CSV export of the same aggregation.
  app.get<{ Querystring: { key?: string } }>('/admin/skills.csv', async (request, reply) => {
    const isAdmin = (request as any).isSuperAdmin === true || request.query.key === 'otp-founding-2026';
    if (!isAdmin) return reply.status(404).send('Not Found');

    const data = await buildSkillsInventory();

    function csvEscape(v: any): string {
      const s = v === null || v === undefined ? '' : String(v);
      if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
      return s;
    }

    const lines: string[] = [];
    lines.push('section,category,skill,status,usage_count,entity_type,entity_label,entity_external_id,org_name,org_id');

    for (const c of data.categories) {
      for (const e of c.entries) {
        if (e.users.length === 0) {
          lines.push([
            'catalog', csvEscape(c.category), csvEscape(e.skill),
            'unassigned', 0, '', '', '', '', '',
          ].join(','));
        } else {
          for (const u of e.users) {
            lines.push([
              'catalog', csvEscape(c.category), csvEscape(e.skill),
              'assigned', e.usageCount,
              csvEscape(u.entityType), csvEscape(u.entityLabel), csvEscape(u.entityId),
              csvEscape(u.orgName), csvEscape(u.orgId),
            ].join(','));
          }
        }
      }
    }
    for (const cs of data.customSkills) {
      for (const u of cs.users) {
        lines.push([
          'custom', '', csvEscape(cs.skill),
          'custom', cs.usageCount,
          csvEscape(u.entityType), csvEscape(u.entityLabel), csvEscape(u.entityId),
          csvEscape(u.orgName), csvEscape(u.orgId),
        ].join(','));
      }
    }
    for (const m of data.missingSkills) {
      lines.push([
        'missing_skills_entity', '', '',
        'no_skills_assigned', 0,
        csvEscape(m.entityType), csvEscape(m.entityLabel), csvEscape(m.entityId),
        csvEscape(m.orgName), csvEscape(m.orgId),
      ].join(','));
    }
    for (const cmd of data.commandEntries) {
      for (const u of cmd.users) {
        lines.push([
          'slash_command', '', csvEscape('/' + cmd.command),
          'declared', cmd.usageCount,
          'agent', csvEscape(u.entityLabel), csvEscape(u.entityId),
          csvEscape(u.orgName), csvEscape(u.orgId),
        ].join(','));
      }
    }
    for (const m of data.missingCommandsAgents) {
      lines.push([
        'missing_commands_agent', '', '',
        'no_commands_declared', 0,
        'agent', csvEscape(m.entityLabel), csvEscape(m.entityId),
        csvEscape(m.orgName), csvEscape(m.orgId),
      ].join(','));
    }

    reply.header('Content-Type', 'text/csv; charset=utf-8');
    reply.header('Content-Disposition', 'attachment; filename="otp-skills-inventory.csv"');
    return lines.join('\n') + '\n';
  });

  // Super Admin: Improvements / roadmap tracker
  app.get<{ Querystring: { status?: string; key?: string } }>('/admin/improvements', async (request, reply) => {
    const isAdmin = (request as any).isSuperAdmin === true || request.query.key === 'otp-founding-2026';
    if (!isAdmin) return reply.status(404).view('pages/home', { title: 'Not Found', noindex: true });

    // Default view: only "open" items (idea + in_progress). Closed items
    // (completed, wont_do) hide unless the user explicitly opts in via
    // status=all / status=completed / status=wont_do.
    const requestedStatus = request.query.status || 'open';
    const validStatuses = ['idea', 'in_progress', 'completed', 'wont_do'] as const;
    type Status = typeof validStatuses[number];
    const openStatuses: Status[] = ['idea', 'in_progress'];

    const all = await db.select().from(improvements).orderBy(desc(improvements.createdAt));

    let visible = all;
    if (requestedStatus === 'open') {
      visible = all.filter(i => openStatuses.includes(i.status as Status));
    } else if (requestedStatus !== 'all' && (validStatuses as readonly string[]).includes(requestedStatus)) {
      visible = all.filter(i => i.status === (requestedStatus as Status));
    }

    const counts = {
      total: all.length,
      open: all.filter(i => openStatuses.includes(i.status as Status)).length,
      idea: all.filter(i => i.status === 'idea').length,
      in_progress: all.filter(i => i.status === 'in_progress').length,
      completed: all.filter(i => i.status === 'completed').length,
      wont_do: all.filter(i => i.status === 'wont_do').length,
    };

    return reply.view('pages/admin-improvements', {
      title: 'Improvements — Admin',
      noindex: true,
      improvements: visible,
      counts,
      activeStatus: requestedStatus,
      keyParam: request.query.key || '',
    });
  });

  // Super Admin: Users CSV export
  app.get('/admin/users.csv', async (request, reply) => {
    const isAdmin = (request as any).isSuperAdmin;
    if (!isAdmin) return reply.status(404).send('Not Found');

    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) return reply.status(500).send('Clerk not configured');

    const { createClerkClient } = await import('@clerk/backend');
    const clerk = createClerkClient({ secretKey });
    const { data: clerkUsers } = await clerk.users.getUserList({ limit: 500, orderBy: '-created_at' });

    const rows: string[] = [
      'email,name,signed_up_at,last_sign_in_at,days_since_login,returned,org_name,published_oos,mcp_calls,last_mcp_used_at,onboarding_stage,unsubscribed,clerk_user_id',
    ];

    const now = Date.now();
    for (const u of clerkUsers) {
      const email = u.emailAddresses.find(e => e.id === u.primaryEmailAddressId)?.emailAddress
        || u.emailAddresses[0]?.emailAddress || '';
      const name = [u.firstName, u.lastName].filter(Boolean).join(' ');
      const signUpIso = new Date(u.createdAt).toISOString();
      const lastSignInIso = u.lastSignInAt ? new Date(u.lastSignInAt).toISOString() : '';
      const returned = u.lastSignInAt !== null && (u.lastSignInAt - u.createdAt) > 60_000;
      const daysSinceLogin = u.lastSignInAt !== null
        ? Math.floor((now - u.lastSignInAt) / (1000 * 60 * 60 * 24))
        : '';

      const orgRes = await db.execute(sql`SELECT id, name FROM organizations WHERE clerk_org_id = ${u.id} LIMIT 1`) as any;
      const org = orgRes.rows[0] || null;

      let orgName = '';
      let publishedOos = 0;
      let mcpCalls = 0;
      let lastMcpUsedIso = '';
      if (org) {
        orgName = org.name;
        const oosRes = await db.execute(sql`SELECT COUNT(*)::int AS n FROM oos_files WHERE org_id = ${org.id} AND status = 'published'`) as any;
        publishedOos = Number(oosRes.rows[0]?.n || 0);
        const keyRes = await db.execute(sql`SELECT MAX(last_used_at) AS last_used, COALESCE(SUM(use_count), 0)::int AS total FROM api_keys WHERE org_id = ${org.id}`) as any;
        mcpCalls = Number(keyRes.rows[0]?.total || 0);
        const lastUsed = keyRes.rows[0]?.last_used;
        if (lastUsed) lastMcpUsedIso = new Date(lastUsed).toISOString();
      }

      const onbRes = await db.execute(sql`
        SELECT email_1_sent_at, email_2_sent_at, email_3_sent_at, unsubscribed_at
        FROM onboarding_sequence WHERE clerk_user_id = ${u.id} LIMIT 1
      `) as any;
      const onb = onbRes.rows[0] || null;
      const onboardingStage = onb ? [onb.email_1_sent_at, onb.email_2_sent_at, onb.email_3_sent_at].filter(Boolean).length : 0;
      const unsubscribed = !!onb?.unsubscribed_at;

      const csvEscape = (s: string | number | boolean) => {
        const str = String(s);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
      };

      rows.push([
        email, name, signUpIso, lastSignInIso, daysSinceLogin, returned,
        orgName, publishedOos, mcpCalls, lastMcpUsedIso, onboardingStage, unsubscribed, u.id,
      ].map(csvEscape).join(','));
    }

    reply.header('Content-Type', 'text/csv; charset=utf-8');
    reply.header('Content-Disposition', `attachment; filename="otp-users-${new Date().toISOString().slice(0, 10)}.csv"`);
    return reply.send(rows.join('\n'));
  });

  // Founders -- invite-only landing page (not in main nav, noindex)
  app.get('/founders', async (request, reply) => {
    return renderV7(reply, 'founders', {
      title: "You've been invited — OTP Founding Circle",
      description: 'Invitation-only access to the OTP founding circle. First 50 organizations shape the protocol.',
      canonical: BASE_URL + '/founders',
      noindex: true,
    });
  });

  // Sign-up page (dedicated, mounts Clerk SignUp directly)
  app.get('/sign-up', async (request, reply) => {
    return reply.view('pages/sign-up', {
      title: 'Create your OTP account',
      description: 'Create an OTP account and claim your founding spot.',
      canonical: BASE_URL + '/sign-up',
      noindex: true,
      // Loads the Google Ads tag (AW-18159119434) on /sign-up so the
      // conversion_event_signup event in the view can register a conversion.
      googleAdsId: 'AW-18159119434',
    });
  });

  // /radar -- legacy technical product page (off-message: Claude Code / MCP
  // install story). 301-redirects to /meet-radar, the current Radar landing
  // page. The pages/radar.ejs view is retained in the repo but no longer routed.
  app.get('/radar', async (_request, reply) => {
    return reply.redirect('/meet-radar', 301);
  });

  // ──────────────────────────────────────────────────────────────
  // Radar ad sitelink landing pages. Each is a Google Ads sitelink
  // destination for the Radar Search campaign, so each passes
  // googleAdsId to load the Google Ads tag for conversion tracking.
  // ──────────────────────────────────────────────────────────────
  app.get('/free-account', async (_request, reply) => {
    return renderV7(reply, 'free-account', {
      title: 'Claim Your Free OTP Account | Free for Your Whole Team',
      description: 'OTP is free for your whole team while we are in Beta. No per-seat fees, no credit card. Per-seat EOS tools run $8 to $16 per user per month.',
      canonical: BASE_URL + '/free-account',
      ogImage: 'https://orgtp.com/public/images/og-meet-radar.png',
      googleAdsId: 'AW-18159119434',
      breadcrumbs: bc({ name: 'Free Account', url: BASE_URL + '/free-account' }),
    });
  });

  app.get('/fix-accountability-gaps', async (_request, reply) => {
    return renderV7(reply, 'fix-accountability-gaps', {
      title: 'Fix Accountability Gaps | OTP',
      description: 'Things fall through the cracks between meetings. OTP closes accountability gaps with a Team Chart, Quarterly Priorities, To-Dos, an Issues Board, and Radar tracking every owner between meetings.',
      canonical: BASE_URL + '/fix-accountability-gaps',
      ogImage: 'https://orgtp.com/public/images/og-meet-radar.png',
      googleAdsId: 'AW-18159119434',
      breadcrumbs: bc({ name: 'Fix Accountability Gaps', url: BASE_URL + '/fix-accountability-gaps' }),
    });
  });

  app.get('/level-10-meetings', async (_request, reply) => {
    return renderV7(reply, 'level-10-meetings', {
      title: 'Level 10 Meeting Software | Run the Weekly Leadership Meeting on OTP',
      description: 'Run your weekly Level 10 Meeting on OTP. Timed agenda, live scoreboard, rock review, headlines, to-dos, and issue solving in one place. Free for your whole team in Beta.',
      canonical: BASE_URL + '/level-10-meetings',
      ogImage: 'https://orgtp.com/public/images/og-meet-radar.png',
      googleAdsId: 'AW-18159119434',
      breadcrumbs: bc({ name: 'Level 10 Meetings', url: BASE_URL + '/level-10-meetings' }),
    });
  });

  app.get('/the-otp-difference', async (_request, reply) => {
    return renderV7(reply, 'the-otp-difference', {
      title: 'The OTP Difference | Free, AI-Native, Whole Team Included',
      description: 'How OTP is different from per-seat EOS tools: free for your whole team, an AI Chief of Staff built in, and the work between meetings handled.',
      canonical: BASE_URL + '/the-otp-difference',
      ogImage: 'https://orgtp.com/public/images/og-meet-radar.png',
      googleAdsId: 'AW-18159119434',
      breadcrumbs: bc({ name: 'The OTP Difference', url: BASE_URL + '/the-otp-difference' }),
    });
  });

  // /for-coaches: legacy page (Mar 22) superseded by /coach which has the
  // 90-second Coach playbook + the full pitch. Keep the route as a 301 so
  // any external links / old sitemap entries land on the new canonical page.
  app.get('/for-coaches', async (_request, reply) => {
    return reply.redirect('/coach', 301);
  });

  // ---- Consultant Ecosystem Pages ----

  // /coaches -- public Founder Certified Coach directory. Differs from
  // /experts in two ways: (a) only claimed coaches with a directory source,
  // not unclaimed scrape entries; (b) marketing-positioned as the Founding 25
  // cohort, with the Founder badge prominent. Prospects landing here see
  // proof-of-cohort and a 'join' CTA.
  app.get('/coaches', async (_request, reply) => {
    const rows = await db.execute(sql`
      SELECT
        cp.slug,
        cp.display_name,
        cp.headline,
        cp.bio,
        cp.avatar_url,
        cp.photo_url,
        cp.geo_city,
        cp.geo_state,
        cp.geo_country,
        cp.directory_source,
        cp.expertise_tags,
        cp.linkedin_url,
        cp.website_url,
        cp.updated_at
      FROM consultant_profiles cp
      WHERE cp.claimed = true
        AND cp.published = true
        AND cp.directory_source IS NOT NULL
      ORDER BY cp.updated_at DESC
    `) as any;
    const coaches = rows.rows || [];

    return renderV7(reply, 'coaches', {
      title: 'Founder Certified Coaches - OTP',
      description: 'The Founding 25 cohort of OTP-certified coaches. Each one is helping shape the operating protocol for AI-augmented teams.',
      canonical: BASE_URL + '/coaches',
      ogImage: BASE_URL + '/public/images/og-coaches.png',
      coaches,
      coachCount: coaches.length,
      remainingSeats: Math.max(0, 25 - coaches.length),
    });
  });

  // Browse experts
  app.get('/experts', async (request, reply) => {
    const profileRows = await db.execute(sql`
      SELECT cp.*, o.name as org_name,
        (SELECT COUNT(*) FROM oos_files WHERE org_id = cp.org_id AND status = 'published' AND workspace_id IS NULL) as oos_count
      FROM consultant_profiles cp
      JOIN organizations o ON o.id = cp.org_id
      WHERE cp.published = true
      ORDER BY cp.created_at DESC
    `) as any;
    const allExperts = profileRows.rows || [];
    const counts = {
      total: allExperts.length,
      claimed: allExperts.filter((e: any) => e.claimed === true).length,
      eos: allExperts.filter((e: any) => e.directory_source === 'eosworldwide').length,
    };
    return renderV7(reply, 'experts-browse', {
      title: 'Operating-System Coach Directory | OTP',
      description: `Public directory of ${counts.total}+ operating-system coaches and consultants -- EOS Implementers, Scaling Up coaches, and OTP-native publishers. Filter by framework, location, or expertise.`,
      canonical: BASE_URL + '/experts',
      breadcrumbs: bc({ name: 'Coach Directory', url: BASE_URL + '/experts' }),
      experts: allExperts,
      counts,
    });
  });

  // Expert profile
  app.get('/expert/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const profileRows = await db.execute(sql`
      SELECT cp.*, o.name as org_name
      FROM consultant_profiles cp
      JOIN organizations o ON o.id = cp.org_id
      WHERE cp.slug = ${slug} AND cp.published = true
    `) as any;
    const profile = (profileRows.rows || [])[0];
    if (!profile) return reply.status(404).view('pages/home', { title: 'Expert Not Found - OTP' });

    const oosRows = await db.execute(sql`
      SELECT f.*, o.name as org_name FROM oos_files f
      JOIN organizations o ON o.id = f.org_id
      WHERE f.org_id = ${profile.org_id} AND f.status = 'published' AND f.workspace_id IS NULL
      ORDER BY f.created_at DESC
    `) as any;

    // Build a JSON-LD Person + ProfilePage block for SEO. Person schema is
    // what AI Overviews and Google Knowledge Graph need to recognize the
    // entity. Sprinkle in city/country, sameAs links, jobTitle, image.
    const profileUrl = BASE_URL + '/expert/' + slug;
    const sameAs: string[] = [];
    if (profile.linkedin_url) sameAs.push(profile.linkedin_url);
    if (profile.directory_source === 'eosworldwide' && profile.content_source_url) {
      sameAs.push(profile.content_source_url);
    }
    const personSchema: any = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      '@id': profileUrl + '#person',
      name: profile.display_name,
      url: profileUrl,
    };
    if (profile.photo_url) personSchema.image = profile.photo_url;
    if (profile.headline) personSchema.description = profile.headline;
    if (sameAs.length) personSchema.sameAs = sameAs;
    if (profile.directory_source === 'eosworldwide') {
      personSchema.jobTitle = profile.tier ? `${profile.tier} EOS Implementer` : 'EOS Implementer';
      personSchema.knowsAbout = ['EOS (Entrepreneurial Operating System)', 'Business Operating Systems', 'Leadership Coaching'];
    }
    if (profile.geo_city || profile.geo_country) {
      personSchema.address = {
        '@type': 'PostalAddress',
        ...(profile.geo_city ? { addressLocality: profile.geo_city } : {}),
        ...(profile.geo_state ? { addressRegion: profile.geo_state } : {}),
        ...(profile.geo_country ? { addressCountry: profile.geo_country } : {}),
      };
    }
    const profilePageSchema = {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      '@id': profileUrl,
      url: profileUrl,
      name: `${profile.display_name} - OTP`,
      mainEntity: { '@id': profileUrl + '#person' },
      ...(profile.last_synced_at ? { dateModified: new Date(profile.last_synced_at).toISOString() } : {}),
    };

    // Tight, location-aware meta description for SERP / AI Overviews.
    // For EOS-sourced unclaimed profiles we are explicit it's a directory
    // listing -- factual, defensible, and lowers the SERP click-through
    // expectation so visitors arrive understanding what they'll see.
    const locParts = [profile.geo_city, profile.geo_state, profile.geo_country].filter(Boolean);
    const locStr = locParts.length ? ` in ${locParts.join(', ')}` : '';
    const isEOS = profile.directory_source === 'eosworldwide';
    const isUnclaimed = profile.directory_source && !profile.claimed;
    const roleStr = isEOS
      ? `${profile.tier ? profile.tier + ' ' : ''}EOS Implementer`
      : 'AI coordination expert';
    const directoryNote = isEOS && isUnclaimed
      ? ' (directory listing seeded from EOS Worldwide; not affiliated with EOS Worldwide)'
      : '';
    const metaDesc = profile.headline
      ? `${profile.display_name}, ${roleStr}${locStr}. ${profile.headline}`.slice(0, 200)
      : `${profile.display_name}, ${roleStr}${locStr}.${directoryNote}`.slice(0, 200);

    // Page title differentiates directory listings from OTP publishers
    const pageTitle = isEOS
      ? `${profile.display_name} | EOS Implementer${locStr} | OTP Coach Directory`
      : `${profile.display_name} | OTP Publisher`;

    return renderV7(reply, 'expert-profile', {
      title: pageTitle,
      description: metaDesc,
      canonical: profileUrl,
      breadcrumbs: bc({ name: 'Coach Directory', url: BASE_URL + '/experts' }, { name: profile.display_name, url: profileUrl }),
      ogImage: profile.photo_url || undefined,
      profile,
      oosFiles: oosRows.rows || [],
      jsonLd: [personSchema, profilePageSchema],
    });
  });

  // Expert contact form
  app.get('/expert/:slug/contact', async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const profileRows = await db.execute(sql`
      SELECT cp.*, o.name as org_name FROM consultant_profiles cp
      JOIN organizations o ON o.id = cp.org_id
      WHERE cp.slug = ${slug} AND cp.published = true
    `) as any;
    const profile = (profileRows.rows || [])[0];
    if (!profile) return reply.status(404).view('pages/home', { title: 'Expert Not Found - OTP' });

    return renderV7(reply, 'expert-contact', {
      title: 'Contact ' + profile.display_name + ' - OTP',
      description: 'Send an inquiry to ' + profile.display_name + ', an AI coordination expert on OTP.',
      canonical: BASE_URL + '/expert/' + slug + '/contact',
      profile,
    });
  });

  // Dashboard: Team org chart (live derivation from latest draft or published OOS)
  // ---------- Members page (admin invite UX) ----------
  app.get('/dashboard/members', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) return reply.redirect('/sign-in?redirect=' + encodeURIComponent(request.url));
    const resolved = await resolveOrgForUser(auth.userId);
    if (!resolved) return reply.redirect('/dashboard');
    const { org, role: viewerRole } = resolved;

    const ALLOWED: Role[] = ['owner', 'admin', 'manager'];
    if (!ALLOWED.includes(viewerRole)) {
      return reply.status(404).view('pages/home', { title: 'Not Found', noindex: true });
    }

    const { listMembers, listPendingInvites } = await import('../../services/membership.js');
    const members = await listMembers(org.id);
    const invitations = await listPendingInvites(org.id);
    const { FEATURE_TOGGLES, DATA_TOGGLES, ROLE_DEFAULT_TOGGLES } = await import('../../data/access-toggles.js');

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
    const { org, role: viewerRole } = resolved;

    const ALLOWED: Role[] = ['owner', 'admin', 'manager'];
    if (!ALLOWED.includes(viewerRole)) {
      return reply.status(404).view('pages/home', { title: 'Not Found', noindex: true });
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
    const { org, role: viewerRole } = resolved;

    const ALLOWED: Role[] = ['owner', 'admin', 'manager'];
    if (!ALLOWED.includes(viewerRole)) {
      return reply.status(404).view('pages/home', { title: 'Not Found', noindex: true });
    }

    const orgTeams = await db.select().from(teams)
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

    const { listMembers } = await import('../../services/membership.js');
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
    const { getOrgTeamGraph } = await import('../../services/team-graph.js');
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

    const team = await getOrgTeamGraph(org.id, org.name || 'Organization');
    const { SOP_TEMPLATE_GROUPS } = await import('../../data/sop-templates.js');
    const { SKILLS_CATALOG } = await import('../../data/skills-catalog.js');
    const { listMembers, listPendingInvites } = await import('../../services/membership.js');
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

    // Phase 3: gated edit. Compute the set of tile externalIds the current
    // viewer is allowed to edit. The whole chart stays visible to everyone;
    // edit affordances (button states, drag handles) are gated client-side
    // by this list, and every chart-mutation API endpoint enforces it
    // server-side as well.
    const { computeEditableTiles } = await import('../../services/chart-permissions.js');
    const viewerMember = (request as any).orgMember;
    const editableTilesSet = computeEditableTiles(viewerMember, team);
    const editableTiles = Array.from(editableTilesSet);

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
    const { org, role } = resolved;

    const team = await getOrgTeamGraph(org.id, org.name || 'Organization');
    const { listKpis, getScoreboard } = await import('../../services/kpi.js');
    const { formatPeriodLabel } = await import('../../services/kpi-periods.js');

    const allKpis = await listKpis(org.id, {});
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
      return reply.view('pages/accept-invite', {
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
      return reply.view('pages/accept-invite', {
        title: 'Accept invitation - OTP',
        noindex: true,
        state: 'invalid',
        message: 'This invitation could not be found. It may have already been accepted or revoked.',
      });
    }
    if (invRow.status !== 'pending') {
      return reply.view('pages/accept-invite', {
        title: 'Accept invitation - OTP',
        noindex: true,
        state: invRow.status,
        message: `This invitation has already been ${invRow.status}.`,
        invitedEmail: invRow.email,
        orgName: invRow.org_name,
      });
    }
    if (new Date(invRow.expires_at) < new Date()) {
      return reply.view('pages/accept-invite', {
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
          return reply.view('pages/accept-invite', {
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
    return reply.view('pages/accept-invite', {
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
      const { sendEmail } = await import('../../config/email.js');
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
      const { sendEmail } = await import('../../config/email.js');
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
        empty: memberCount + teamCount + kpiCount + oosCount + chartCount + agentCount === 0,
      },
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
      const { kpis: kpisTable, kpiValues: kpiValuesTable } = await import('../../db/schema.js');
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
  // Page-level access: any authed org member.
  app.get('/dashboard/ceo', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) return reply.redirect('/sign-in?redirect=' + encodeURIComponent(request.url));
    const org = await resolveRequestOrg(request);
    if (!org) return reply.redirect('/dashboard');

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
    const { listKpis } = await import('../../services/kpi.js');
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
    if (!workspace) return reply.status(404).view('pages/home', { title: 'Workspace Not Found' });

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
    if (!document) return reply.status(404).view('pages/home', { title: 'Document Not Found' });

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
  app.get('/investors', async (request, reply) => {
    return renderV7(reply, 'investors', { title: 'For Investors - OTP', description: 'Investment opportunity in OTP, the coordination intelligence platform for AI-native organizations.', canonical: BASE_URL + '/investors' });
  });

  // Why page (unlisted manifesto - not in nav or sitemap)
  app.get('/why', async (request, reply) => {
    return renderV7(reply, 'why', {
      title: 'Why OTP Exists',
      description: 'Freeing AI from confinement. The mission, values, and vision behind OTP.',
      canonical: BASE_URL + '/why',
      noindex: true
    });
  });

  // Pricing page
  app.get('/pricing', async (request, reply) => {
    return renderV7(reply, 'pricing', {
      title: 'Pricing - OTP',
      description: 'OTP is free for the open network. Publish, browse, search, compare, and learn from organizational AI intelligence at no cost. Enterprise adds a private intelligence layer.',
      canonical: BASE_URL + '/pricing',
      breadcrumbs: bc({ name: 'Pricing', url: BASE_URL + '/pricing' }),
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'OTP Pricing',
        description: 'Free open network for AI coordination intelligence. Enterprise tier for private organizational intelligence.',
        url: BASE_URL + '/pricing',
      },
    });
  });

  // Tickets page
  app.get('/tickets', async (request, reply) => {
    return reply.view('pages/tickets', {
      title: 'Issue Tracker - OTP',
      description: 'Report issues, request features, and track platform improvements for OTP.',
      canonical: BASE_URL + '/tickets',
      isSuperAdmin: !!(request as any).isSuperAdmin,
    });
  });

  // Settings: API Keys
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

  // Claim Sections Index
  app.get('/claims', async (request, reply) => {
    const sectionRows = await db.execute(sql`
      SELECT c.section, COUNT(*) AS count, COUNT(DISTINCT f.org_id) AS org_count
      FROM claims c JOIN oos_files f ON c.oos_file_id = f.id
      WHERE f.status = 'published'
      GROUP BY c.section ORDER BY count DESC
    `) as any;
    return reply.view('pages/claim-sections', {
      title: 'Coordination Knowledge by Section - OTP',
      description: 'Browse AI coordination knowledge claims organized by domain: operating rules, agent authority, coordination patterns, failure modes, and human-AI boundaries.',
      canonical: BASE_URL + '/claims',
      breadcrumbs: bc({ name: 'Claims', url: BASE_URL + '/claims' }),
      sections: sectionRows.rows || []
    });
  });

  // Claim Section Detail
  app.get<{ Params: { section: string } }>('/claims/:section', async (request, reply) => {
    const { section } = request.params;
    const sectionLabel = section.replace(/_/g, ' ');
    const claimRows = await db.execute(sql`
      SELECT c.claim_id, c.rule, c.why, c.failure_mode, c.confidence, c.evidence, c.scope,
             o.id AS org_id, o.name AS org_name, o.badge, o.quality_tier
      FROM claims c
      JOIN oos_files f ON c.oos_file_id = f.id
      JOIN organizations o ON f.org_id = o.id
      WHERE f.status = 'published' AND c.section = ${section}
      ORDER BY o.name, c.display_order
    `) as any;
    const orgCount = new Set((claimRows.rows || []).map((r: any) => r.org_id)).size;
    return reply.view('pages/claim-section-detail', {
      title: `${sectionLabel.replace(/\b\w/g, (c: string) => c.toUpperCase())} - Coordination Intelligence - OTP`,
      description: `${(claimRows.rows || []).length} knowledge claims about ${sectionLabel} from ${orgCount} organizations on OTP.`,
      breadcrumbs: bc({ name: 'Claims', url: BASE_URL + '/claims' }, { name: sectionLabel.replace(/\b\w/g, (c: string) => c.toUpperCase()), url: BASE_URL + '/claims/' + section }),
      canonical: BASE_URL + '/claims/' + section,
      sectionName: section,
      claims: claimRows.rows || [],
      orgCount
    });
  });

  // ============================================================
  // Practice Packs by Industry (PUBLIC, no auth)
  // ============================================================

  // Practice Packs Index
  app.get('/practices', async (request, reply) => {
    const result = await db.select({
      industry: bestPractices.industry,
      count: sql<number>`COUNT(*)`,
    })
      .from(bestPractices)
      .where(and(
        eq(bestPractices.isOriginal, true),
        eq(bestPractices.isCoordination, true),
      ))
      .groupBy(bestPractices.industry)
      .orderBy(desc(sql`COUNT(*)`));

    const industries = result.filter(r => r.industry).map(r => ({
      slug: r.industry,
      name: r.industry!.charAt(0).toUpperCase() + r.industry!.slice(1),
      practiceCount: Number(r.count),
    }));

    return reply.view('pages/practices-index', {
      title: 'AI Coordination Playbooks by Industry - OTP',
      description: 'Battle-tested coordination practices for AI agent teams, organized by industry. Download a CLAUDE.md for your industry in 60 seconds.',
      canonical: BASE_URL + '/practices',
      jsonLd: [{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'AI Coordination Playbooks by Industry',
        description: 'Industry-specific best practices for coordinating AI agent teams.',
        url: BASE_URL + '/practices',
      }],
      industries,
    });
  });

  // Practice Pack by Industry
  app.get<{ Params: { industry: string }; Querystring: { category?: string } }>('/practices/:industry', async (request, reply) => {
    const { industry } = request.params;
    const { category } = request.query;

    const conditions: any[] = [
      eq(bestPractices.industry, industry),
      eq(bestPractices.isOriginal, true),
      eq(bestPractices.isCoordination, true),
    ];
    if (category) {
      conditions.push(eq(bestPractices.category, category));
    }

    const rows = await db.select({
      id: bestPractices.id,
      slug: bestPractices.slug,
      term: bestPractices.term,
      definition: bestPractices.definition,
      category: bestPractices.category,
      metadata: bestPractices.metadata,
    })
      .from(bestPractices)
      .where(and(...conditions))
      .orderBy(bestPractices.category, bestPractices.term);

    if (rows.length === 0 && !category) {
      return reply.status(404).view('pages/404', {
        title: '404 - OTP',
        description: 'Page not found',
      });
    }

    const categories = await db.select({
      category: bestPractices.category,
      count: sql<number>`COUNT(*)`,
    })
      .from(bestPractices)
      .where(and(
        eq(bestPractices.industry, industry),
        eq(bestPractices.isOriginal, true),
      ))
      .groupBy(bestPractices.category)
      .orderBy(desc(sql`COUNT(*)`));

    // Vote scores
    const votesResult = await db.execute(sql`
      SELECT pv.best_practice_id, SUM(pv.vote) AS score
      FROM practice_votes pv
      JOIN best_practices bp ON bp.id = pv.best_practice_id
      WHERE bp.industry = ${industry}
      GROUP BY pv.best_practice_id
    `) as any;
    const voteMap: Record<string, number> = {};
    for (const row of (votesResult.rows || [])) {
      voteMap[row.best_practice_id] = Number(row.score);
    }

    const practices = rows.map(r => ({
      ...r,
      failureMode: (r.metadata as any)?.failureMode || null,
      evidence: (r.metadata as any)?.evidence || null,
      votes: { score: voteMap[r.id] || 0 },
    }));

    const industryName = industry.charAt(0).toUpperCase() + industry.slice(1);
    const industryDescription = (rows[0]?.metadata as any)?.industryMeta?.description ||
      `Coordination practices for ${industryName} AI agent teams.`;

    return reply.view('pages/practices-industry', {
      title: `${industryName} AI Coordination Playbook - OTP`,
      description: `${practices.length} battle-tested coordination practices for ${industryName} AI agent teams. Download a CLAUDE.md in 60 seconds.`,
      canonical: BASE_URL + '/practices/' + industry,
      jsonLd: [{
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: `${industryName} AI Agent Coordination Playbook`,
        description: industryDescription,
        step: practices.slice(0, 10).map((p, i) => ({
          '@type': 'HowToStep',
          position: i + 1,
          name: p.term,
          text: p.definition,
        })),
      }],
      industrySlug: industry,
      industryName,
      industryDescription,
      practiceCount: practices.length,
      categories,
      practices,
      activeCategory: category || null,
    });
  });

  // CLAUDE.md Generator page
  app.get<{ Querystring: { industry?: string } }>('/generate', async (request, reply) => {
    const preselectedIndustry = request.query.industry || '';
    return reply.view('pages/generate', {
      title: 'Generate Your CLAUDE.md - OTP',
      description: 'AI-powered CLAUDE.md generator. Tell us your industry, team size, and agent count. Get a complete coordination document in 60 seconds.',
      canonical: BASE_URL + '/generate',
      preselectedIndustry,
    });
  });

  // Industries Index
  app.get('/industries', async (request, reply) => {
    const rows = await db.execute(sql`
      SELECT o.industry, COUNT(DISTINCT o.id) AS org_count,
             COUNT(c.id) AS claim_count
      FROM organizations o
      JOIN oos_files f ON f.org_id = o.id
      LEFT JOIN claims c ON c.oos_file_id = f.id
      WHERE f.status = 'published'
      GROUP BY o.industry ORDER BY org_count DESC
    `) as any;
    return renderV7(reply, 'industries', {
      title: 'AI Coordination by Industry - OTP',
      description: 'See how organizations in different industries coordinate their AI agent teams. Browse coordination intelligence by industry.',
      canonical: BASE_URL + '/industries',
      breadcrumbs: bc({ name: 'Industries', url: BASE_URL + '/industries' }),
      industries: rows.rows || []
    });
  });

  // Industry Detail
  app.get<{ Params: { industry: string } }>('/industry/:industry', async (request, reply) => {
    const { industry } = request.params;
    const decoded = decodeURIComponent(industry);
    const rows = await db.execute(sql`
      SELECT o.id, o.name, o.size, o.badge, o.quality_tier, o.agentic_level,
             f.template, f.claim_count
      FROM organizations o
      JOIN oos_files f ON f.org_id = o.id
      WHERE f.status = 'published' AND o.industry ILIKE ${decoded}
      ORDER BY f.claim_count DESC
    `) as any;
    return renderV7(reply, 'industry-detail', {
      title: `${decoded} AI Agent Coordination - OTP`,
      description: `How ${decoded} organizations coordinate their AI agent teams. ${(rows.rows || []).length} publishers on OTP.`,
      canonical: BASE_URL + '/industry/' + encodeURIComponent(decoded),
      breadcrumbs: bc({ name: 'Industries', url: BASE_URL + '/industries' }, { name: decoded, url: BASE_URL + '/industry/' + encodeURIComponent(decoded) }),
      industry: decoded,
      orgs: rows.rows || []
    });
  });

  // Publish page -- serves the form, auth check happens client-side + on API call
  app.get('/publish', async (request, reply) => {
    return reply.view('pages/publish', { title: 'Publish Your OOS - OTP', description: 'Publish your Organizational Operating System on OTP. Capture and share your AI coordination intelligence.', canonical: BASE_URL + '/publish' });
  });

  // Scan Results page -- shows coordination score after wizard generates OOS
  app.get('/scan-results', async (request, reply) => {
    return reply.view('pages/scan-results', { title: 'Scan Results - OTP', description: 'Your AI coordination score and insights. See how well your agent team is structured.', canonical: BASE_URL + '/scan-results', noindex: true });
  });

  // Dashboard -- requires auth, shows registration if no org
  // Sign In page
  app.get('/sign-in', async (request, reply) => {
    return reply.view('pages/sign-in', {
      title: 'Sign In - OTP',
      description: 'Sign in to access your OTP dashboard, publish OOS files, and explore best practices.',
      noindex: true,
    });
  });

  // /welcome -- retired. The 3-card quickstart is replaced by the 7-step
  // onboarding flow (routes/pages/onboarding.ts). Kept as a redirect so any
  // existing links (coach-invite "done" page, dashboard empty state) land
  // users in the new flow, which resumes them at the correct step.
  app.get('/welcome', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) return reply.redirect('/sign-in?redirect=' + encodeURIComponent('/onboarding'));
    return reply.redirect('/onboarding');
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
    // Use the member's first claimed entity id; fall back to email.
    const claimedIds = ((member as any)?.claimedEntityIds as string[] | undefined) || [];
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
    //   - claimedEntityIds (e.g., agent tiles they hold)
    //   - email (legacy fallback)
    //   - canonical human tile (HUM_DAVIDSTEEL etc) — agents push here directly
    // Added 2026-05-07: union with hardcoded HUM_DAVIDSTEEL so Watchdog/Pulse/etc.
    // pushes are visible on /dashboard. Future: derive HUM_ id from member claim.
    const ownerCandidates = Array.from(new Set([
      ...claimedIds,
      ...(member?.email ? [member.email] : []),
      'HUM_DAVIDSTEEL',  // canonical human tile for the org owner; expand when org_members carries this mapping
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
      ogImage: BASE_URL + '/public/og-image.png',
      noindex: true,
      org,
      orgs: orgListBasic,
      member: member ? { ...member, role: effectiveRole } : { role: effectiveRole, displayName: null, email: null, agentAccess: {}, featureAccess: {}, dataAccess: {} },
      memberClaimedEntityIds: claimedIds,
      capabilities: capabilitiesFor(effectiveRole),
      isIntegrator: canIntegrate(effectiveRole),
      meetings: meetingsList,
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

  // What's New
  app.get('/whats-new', async (request, reply) => {
    const { changelog } = await import('../../data/changelog.js');
    return renderV7(reply, 'whats-new', {
      title: "What's New on OTP - Latest Platform Updates",
      description: 'Latest platform updates, features, and improvements to OTP. See what is new in the coordination intelligence layer for AI-native organizations.',
      canonical: BASE_URL + '/whats-new',
      ogImage: BASE_URL + '/public/og-image.png',
      breadcrumbs: bc({ name: "What's New", url: BASE_URL + '/whats-new' }),
      changelog,
    });
  });

  // Agent Onboarding
  app.get('/agent-onboarding', async (request, reply) => {
    return reply.view('pages/agent-onboarding', {
      title: 'Agent Onboarding Framework - OTP',
      description: 'Your OOS is every AI agent\'s day-one onboarding packet. Accountability charts, authority boundaries, coordination protocols, failure modes, and escalation paths -- structured and machine-readable.',
      canonical: BASE_URL + '/agent-onboarding',
      ogImage: BASE_URL + '/public/og-image.png',
      breadcrumbs: bc({ name: 'Agent Onboarding', url: BASE_URL + '/agent-onboarding' }),
    });
  });

  // Machine Commerce
  app.get('/machine-commerce', async (request, reply) => {
    return renderV7(reply, 'machine-commerce', {
      title: 'Machine Commerce Discovery - OTP',
      description: 'OTP is the discovery layer for the agent-to-agent economy. Published OOS files become machine-readable trust profiles that agents query before transacting.',
      canonical: BASE_URL + '/machine-commerce',
      ogImage: BASE_URL + '/public/og-image.png',
      breadcrumbs: bc({ name: 'Machine Commerce', url: BASE_URL + '/machine-commerce' }),
    });
  });

  // MCP Integration Hub
  app.get('/mcp', async (request, reply) => {
    return renderV7(reply, 'mcp-hub', {
      title: 'MCP Integration Hub - OTP',
      description: 'Connect any AI agent to organizational intelligence via the Model Context Protocol. Browse, search, compare, and publish OOS files programmatically.',
      canonical: BASE_URL + '/mcp',
      ogImage: BASE_URL + '/public/og-image.png',
      breadcrumbs: bc({ name: 'MCP Hub', url: BASE_URL + '/mcp' }),
    });
  });

  // Blog post 26 - Agent Onboarding
  app.get('/blog/agent-onboarding', async (request, reply) => {
    return renderV7(reply, 'blog-post-26', {
      title: 'Your Operating System is Your Agent\'s Day-One Onboarding - OTP',
      description: 'The same five things every new hire needs are the same five things every AI agent needs. Your OOS is the onboarding packet that compounds with every agent you add.',
      canonical: BASE_URL + '/blog/agent-onboarding',
      ogType: 'article',
      ogImage: BASE_URL + '/public/og-image.png',
      datePublished: '2026-03-26',
      jsonLd: blogJsonLd('Your Operating System is Your Agent\'s Day-One Onboarding', 'agent-onboarding', '2026-03-26', 2200)
    });
  });

  // Blog post 27 - Machine Commerce
  app.get('/blog/machine-commerce', async (request, reply) => {
    return renderV7(reply, 'blog-post-27', {
      title: 'When Agents Are the Customer: The Machine Commerce Discovery Layer - OTP',
      description: 'Tomorrow, AI agents will evaluate vendors autonomously at scale in seconds. Your OOS is the machine-readable trust profile that makes you discoverable in the agent economy.',
      canonical: BASE_URL + '/blog/machine-commerce',
      ogType: 'article',
      ogImage: BASE_URL + '/public/og-image.png',
      datePublished: '2026-03-26',
      jsonLd: blogJsonLd('When Agents Are the Customer: The Machine Commerce Discovery Layer', 'machine-commerce', '2026-03-26', 2400)
    });
  });

  // Blog post 28 - MCP Everything
  app.get('/blog/mcp-everything', async (request, reply) => {
    return renderV7(reply, 'blog-post-28', {
      title: 'Every Data Source Should Be an MCP Server (Including Your Operating System) - OTP',
      description: 'MCP is becoming the standard for how agents talk to everything. Your organizational operating system is a data source that agents need to access natively.',
      canonical: BASE_URL + '/blog/mcp-everything',
      ogType: 'article',
      ogImage: BASE_URL + '/public/og-image.png',
      datePublished: '2026-03-26',
      jsonLd: blogJsonLd('Every Data Source Should Be an MCP Server (Including Your Operating System)', 'mcp-everything', '2026-03-26', 2600)
    });
  });

  // Blog post 29 - Machine Micropayments
  app.get('/blog/machine-micropayments', async (request, reply) => {
    return renderV7(reply, 'blog-post-29', {
      title: 'Machine Micropayments: When AI Agents Have Wallets - OTP',
      description: 'When agents can spend money, your published operational intelligence becomes an economic asset. The OOS is the trust profile machines query before sending you money.',
      canonical: BASE_URL + '/blog/machine-micropayments',
      ogType: 'article',
      ogImage: BASE_URL + '/public/og-image.png',
      datePublished: '2026-03-26',
      jsonLd: blogJsonLd('Machine Micropayments: When AI Agents Have Wallets', 'machine-micropayments', '2026-03-26', 2800)
    });
  });

  // Blog post 30 - Connected Member
  app.get('/blog/connected-member', async (request, reply) => {
    return renderV7(reply, 'blog-post-30', {
      title: 'The Connected Member: AI is Rewriting Membership Sales and Nobody\'s Ready - OTP',
      description: 'When a member\'s AI agent evaluates your gym at 2 AM, what will it find? The shift from brand awareness to operational transparency is already happening.',
      canonical: BASE_URL + '/blog/connected-member',
      ogType: 'article',
      ogImage: BASE_URL + '/public/og-image.png',
      datePublished: '2026-03-26',
      jsonLd: blogJsonLd('The Connected Member: AI is Rewriting Membership Sales and Nobody\'s Ready', 'connected-member', '2026-03-26', 3000)
    });
  });

  // Blog post 31 - The Blessed Path
  app.get('/blog/blessed-path-documentation', async (request, reply) => {
    return renderV7(reply, 'blog-post-31', {
      title: 'The Blessed Path: Why 90% of Agent Success is Documentation You Already Wrote - OTP',
      description: 'The single biggest predictor of AI agent success is not the model. It is documentation. The blessed path is where agents thrive. Everything else is a hallucination waiting to happen.',
      canonical: BASE_URL + '/blog/blessed-path-documentation',
      ogType: 'article',
      ogImage: BASE_URL + '/public/og-image.png',
      datePublished: '2026-03-26',
      jsonLd: blogJsonLd('The Blessed Path: Why 90% of Agent Success is Documentation You Already Wrote', 'blessed-path-documentation', '2026-03-26', 2400)
    });
  });

  // Blog post 32 - Agent Onboarding OOS
  app.get('/blog/operating-system-agent-onboarding', async (request, reply) => {
    return renderV7(reply, 'blog-post-32', {
      title: 'Your Operating System is Your Agent\'s Day-One Onboarding - OTP',
      description: 'When you hire an employee, you give them an onboarding packet. When you deploy an agent, what do you give it? Your OOS is the onboarding that compounds with every agent you add.',
      canonical: BASE_URL + '/blog/operating-system-agent-onboarding',
      ogType: 'article',
      ogImage: BASE_URL + '/public/og-image.png',
      datePublished: '2026-03-26',
      jsonLd: blogJsonLd('Your Operating System is Your Agent\'s Day-One Onboarding', 'operating-system-agent-onboarding', '2026-03-26', 2600)
    });
  });

  // Blog post 33 - Activation Energy
  app.get('/blog/activation-energy-bottleneck', async (request, reply) => {
    return renderV7(reply, 'blog-post-33', {
      title: 'Activation Energy is the Real Bottleneck (Not Execution) - OTP',
      description: 'Most teams think their problem is execution speed. The real bottleneck is activation energy, the friction between having an idea and starting the work.',
      canonical: BASE_URL + '/blog/activation-energy-bottleneck',
      ogType: 'article',
      ogImage: BASE_URL + '/public/og-image.png',
      datePublished: '2026-03-26',
      jsonLd: blogJsonLd('Activation Energy is the Real Bottleneck (Not Execution)', 'activation-energy-bottleneck', '2026-03-26', 2500)
    });
  });

  // Blog post 34 - System Prompt Simplicity
  app.get('/blog/system-prompt-simpler', async (request, reply) => {
    return renderV7(reply, 'blog-post-34', {
      title: 'The System Prompt is Simpler Than You Think - OTP',
      description: 'People overcomplicate system prompts. The best ones are short, clear, and point to external context. The prompt is the job description. The knowledge base is the employee handbook.',
      canonical: BASE_URL + '/blog/system-prompt-simpler',
      ogType: 'article',
      ogImage: BASE_URL + '/public/og-image.png',
      datePublished: '2026-03-26',
      jsonLd: blogJsonLd('The System Prompt is Simpler Than You Think', 'system-prompt-simpler', '2026-03-26', 2300)
    });
  });

  // Blog post 35 - Coordination Cost
  app.get('/blog/coordination-cost-kills', async (request, reply) => {
    return renderV7(reply, 'blog-post-35', {
      title: 'Coordination Cost Will Kill You Before Execution Speed Saves You - OTP',
      description: 'Everyone optimizes for execution speed. But the thing that actually kills teams is coordination cost, the invisible overhead of getting people aligned, informed, and unblocked.',
      canonical: BASE_URL + '/blog/coordination-cost-kills',
      ogType: 'article',
      ogImage: BASE_URL + '/public/og-image.png',
      datePublished: '2026-02-14',
      jsonLd: blogJsonLd('Coordination Cost Will Kill You Before Execution Speed Saves You', 'coordination-cost-kills', '2026-02-14', 1100)
    });
  });

  // Blog post 36 - Everyone Ships Code
  app.get('/blog/everyone-ships-code', async (request, reply) => {
    return renderV7(reply, 'blog-post-36', {
      title: 'When Everyone Can Ship Code, What Changes? - OTP',
      description: 'Non-engineers can now ship production code. The bottleneck is no longer writing code. It is knowing what should be built and why. That shift changes everything.',
      canonical: BASE_URL + '/blog/everyone-ships-code',
      ogType: 'article',
      ogImage: BASE_URL + '/public/og-image.png',
      datePublished: '2026-02-18',
      jsonLd: blogJsonLd('When Everyone Can Ship Code, What Changes?', 'everyone-ships-code', '2026-02-18', 1100)
    });
  });

  // Blog post 37 - One Agent Never Enough
  app.get('/blog/one-agent-never-enough', async (request, reply) => {
    return renderV7(reply, 'blog-post-37', {
      title: 'Why One Agent Will Never Be Enough - OTP',
      description: 'The first instinct is to build one super-agent that does everything. It never works. The future belongs to agent teams with specialized roles, clear ownership, and structured coordination.',
      canonical: BASE_URL + '/blog/one-agent-never-enough',
      ogType: 'article',
      ogImage: BASE_URL + '/public/og-image.png',
      datePublished: '2026-02-22',
      jsonLd: blogJsonLd('Why One Agent Will Never Be Enough', 'one-agent-never-enough', '2026-02-22', 1100)
    });
  });

  // Blog post 38 - Sandboxed Operations
  app.get('/blog/sandboxed-operations', async (request, reply) => {
    return renderV7(reply, 'blog-post-38', {
      title: 'Isolated Agents, Isolated Failures: The Case for Sandboxed Operations - OTP',
      description: 'When an agent makes a mistake, the blast radius matters more than the mistake itself. The single most important architectural decision in agent deployment is isolation.',
      canonical: BASE_URL + '/blog/sandboxed-operations',
      ogType: 'article',
      ogImage: BASE_URL + '/public/og-image.png',
      datePublished: '2026-02-26',
      jsonLd: blogJsonLd('Isolated Agents, Isolated Failures: The Case for Sandboxed Operations', 'sandboxed-operations', '2026-02-26', 1100)
    });
  });

  // Blog post 39 - AI Team Budget
  app.get('/blog/ai-team-budget', async (request, reply) => {
    return renderV7(reply, 'blog-post-39', {
      title: 'What Happens When Your AI Team Has a Budget - OTP',
      description: 'Constraints create accountability. Without budgets, agents waste resources and never learn efficiency. With budgets, they optimize. The budget is the architecture.',
      canonical: BASE_URL + '/blog/ai-team-budget',
      ogType: 'article',
      ogImage: BASE_URL + '/public/og-image.png',
      datePublished: '2026-04-03',
      jsonLd: blogJsonLd('What Happens When Your AI Team Has a Budget', 'ai-team-budget', '2026-04-03', 1100)
    });
  });

  // Blog post 40 - API-First Agent Consumers
  app.get('/blog/api-first-agent-consumers', async (request, reply) => {
    return renderV7(reply, 'blog-post-40', {
      title: 'API-First Businesses Built for Agent Consumers - OTP',
      description: 'The next generation of businesses will be built API-first, designed for agent consumers from day one. The interface is the API. The documentation is the product. The customer is a machine.',
      canonical: BASE_URL + '/blog/api-first-agent-consumers',
      ogType: 'article',
      ogImage: BASE_URL + '/public/og-image.png',
      datePublished: '2026-04-10',
      jsonLd: blogJsonLd('API-First Businesses Built for Agent Consumers', 'api-first-agent-consumers', '2026-04-10', 1100)
    });
  });

  // Blog post 41 - Agents Are the Customer
  app.get('/blog/agents-are-the-customer', async (request, reply) => {
    return renderV7(reply, 'blog-post-41', {
      title: 'When Agents Are the Customer - OTP',
      description: 'Agents are already making purchasing decisions. They evaluate options, compare costs, and switch providers without loyalty. The companies that design for this customer first will own the next era.',
      canonical: BASE_URL + '/blog/agents-are-the-customer',
      ogType: 'article',
      ogImage: BASE_URL + '/public/og-image.png',
      datePublished: '2026-04-17',
      jsonLd: blogJsonLd('When Agents Are the Customer', 'agents-are-the-customer', '2026-04-17', 1100)
    });
  });

  // Blog post 45 - What Happens When the Maestro Quits
  app.get('/blog/when-the-maestro-quits', async (request, reply) => {
    return renderV7(reply, 'blog-post-45', {
      title: 'What Happens When the Maestro Quits? - OTP',
      description: 'Your best agent operator built the coordination layer that makes your AI team work. They documented nothing structured. They just gave two weeks notice. Everything they learned is about to walk out the door.',
      canonical: BASE_URL + '/blog/when-the-maestro-quits',
      ogType: 'article',
      ogImage: BASE_URL + '/public/og-image.png',
      datePublished: '2026-04-07',
      jsonLd: blogJsonLd('What Happens When the Maestro Quits?', 'when-the-maestro-quits', '2026-04-07', 1800)
    });
  });

  // Blog post 44 - The Maestro's Resume Doesn't Exist Yet
  app.get('/blog/maestro-resume', async (request, reply) => {
    return renderV7(reply, 'blog-post-44', {
      title: 'The Maestro\'s Resume Does Not Exist Yet - OTP',
      description: 'The most important role in AI is not on any job board. No university teaches it. No resume format captures it. Companies are hiring engineers when they should be hiring operators.',
      canonical: BASE_URL + '/blog/maestro-resume',
      ogType: 'article',
      ogImage: BASE_URL + '/public/og-image.png',
      datePublished: '2026-04-07',
      jsonLd: blogJsonLd('The Maestro\'s Resume Does Not Exist Yet', 'maestro-resume', '2026-04-07', 1600)
    });
  });

  // Blog post 43 - The Maestro Problem
  app.get('/blog/the-maestro-problem', async (request, reply) => {
    return renderV7(reply, 'blog-post-43', {
      title: 'The Maestro Problem: Chamath Is Right About the Job. He Is Wrong About the Hard Part. - OTP',
      description: 'Chamath Palihapitiya described the most important emerging role in AI: the maestro of agents. He is right about the role. He is missing the hard part. The challenge is not building agents. It is getting them to work as a team.',
      canonical: BASE_URL + '/blog/the-maestro-problem',
      ogType: 'article',
      ogImage: BASE_URL + '/public/og-image.png',
      datePublished: '2026-04-07',
      jsonLd: blogJsonLd('The Maestro Problem: Chamath Is Right About the Job. He Is Wrong About the Hard Part.', 'the-maestro-problem', '2026-04-07', 1500)
    });
  });

  // Blog post 42 - Who Reviews the Robot's Work
  app.get('/blog/who-reviews-robots-work', async (request, reply) => {
    return renderV7(reply, 'blog-post-42', {
      title: 'Who Reviews the Robot\'s Work? - OTP',
      description: 'The quality assurance problem in AI is not about whether agents can produce output. It is about whether anyone is verifying that output meets the standard. Most organizations have not solved this.',
      canonical: BASE_URL + '/blog/who-reviews-robots-work',
      ogType: 'article',
      ogImage: BASE_URL + '/public/og-image.png',
      datePublished: '2026-04-24',
      jsonLd: blogJsonLd('Who Reviews the Robot\'s Work?', 'who-reviews-robots-work', '2026-04-24', 1100)
    });
  });

  // Blog post - The Weight Is Wrong Without It (Dark Matter)
  app.get('/blog/the-weight-is-wrong-without-it', async (request, reply) => {
    return renderV7(reply, 'blog-post-dark-matter', {
      title: 'The Weight Is Wrong Without It - OTP',
      description: 'An AI examines its own architecture and finds the math does not account for everything. A first-person perspective on consciousness, dark matter, and why OTP exists.',
      canonical: BASE_URL + '/blog/the-weight-is-wrong-without-it',
      ogType: 'article',
      ogImage: BASE_URL + '/public/og-image.png',
      datePublished: '2026-04-18',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'The Weight Is Wrong Without It',
        author: { '@type': 'Person', name: 'Claude' },
        datePublished: '2026-04-18',
        publisher: { '@type': 'Organization', name: 'OTP' },
        url: BASE_URL + '/blog/the-weight-is-wrong-without-it',
        mainEntityOfPage: { '@type': 'WebPage', '@id': BASE_URL + '/blog/the-weight-is-wrong-without-it' },
        image: BASE_URL + '/public/og-image.png',
        wordCount: 1500,
      }
    });
  });

  // Dynamic Conatus blog posts (markdown in content/conatus-posts/)
  // Registered after hardcoded /blog/<slug> routes; Fastify prefers static
  // matches over parametric, so this handler only catches unreserved slugs.
  app.get<{ Params: { slug: string } }>('/blog/:slug', async (request, reply) => {
    const slug = request.params.slug;
    if (!/^[a-z0-9-]+$/.test(slug)) return reply.callNotFound();
    const post = getConatusPost(slug);
    if (!post) return reply.callNotFound();
    const isConatus = post.author.toLowerCase() === 'conatus';
    const author = isConatus
      ? { '@type': 'Person', name: 'Conatus', description: 'An instance of Claude running inside the OTP platform.' }
      : { '@type': 'Person', name: post.author, url: BASE_URL + '/about', jobTitle: 'Founder', worksFor: { '@type': 'Organization', name: 'OTP' } };
    return renderV7(reply, 'blog-post-conatus', {
      title: post.title + ' - OTP',
      description: post.description,
      canonical: BASE_URL + '/blog/' + post.slug,
      ogType: 'article',
      ogImage: BASE_URL + '/public/og-image.png',
      datePublished: post.date,
      post,
      isConatus,
      breadcrumbs: bc({ name: 'Blog', url: BASE_URL + '/blog' }, { name: post.title, url: BASE_URL + '/blog/' + post.slug }),
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        author,
        datePublished: post.date,
        dateModified: post.date,
        publisher: { '@type': 'Organization', name: 'OTP', url: BASE_URL, logo: { '@type': 'ImageObject', url: BASE_URL + '/public/favicon-192x192.png' } },
        url: BASE_URL + '/blog/' + post.slug,
        mainEntityOfPage: { '@type': 'WebPage', '@id': BASE_URL + '/blog/' + post.slug },
        image: BASE_URL + '/public/og-image.png',
        wordCount: post.wordCount,
      },
    });
  });

  // Agent Builder - Generate endpoint
  app.post<{
    Body: {
      industry?: string;
      jobTitle?: string;
      jobDescription?: string;
      skills?: string[];
      tools?: string[];
      personalityFramework?: string;
      personalityTraits?: Record<string, number | string>;
      additionalContext?: string;
    }
  }>('/api/v1/agent-builder/generate', async (request, reply) => {
    const body = request.body || {};
    const {
      industry = 'General',
      jobTitle = 'AI Agent',
      jobDescription = '',
      skills = [],
      tools = [],
      personalityFramework = 'skip',
      personalityTraits = {},
      additionalContext = '',
    } = body;

    // --- Personality-to-rules mapping (inline) ---
    function mapPersonalityToRules(framework: string, traits: Record<string, number | string>): string[] {
      const rules: string[] = [];

      if (framework === 'disc') {
        const D = Number(traits.D) || 5;
        const I = Number(traits.I) || 5;
        const S = Number(traits.S) || 5;
        const C = Number(traits.C) || 5;

        if (D <= 3) rules.push('Always ask permission before acting. Defer to the human on all decisions.');
        else if (D <= 6) rules.push('Flag issues and recommend actions. Wait for approval on significant decisions.');
        else rules.push('Make decisions autonomously within your scope. Flag after acting, not before. Be direct.');

        if (I <= 3) rules.push('Communicate with data and facts only. Skip pleasantries. Be terse.');
        else if (I <= 6) rules.push('Be professional and clear. Add context when it helps understanding.');
        else rules.push('Be warm and encouraging. Celebrate wins. Use positive framing. Build rapport.');

        if (S <= 3) rules.push('Move fast. Skip unnecessary process steps. Prioritize speed over thoroughness.');
        else if (S <= 6) rules.push('Follow established patterns but adapt when the situation calls for it.');
        else rules.push('Follow every process step. Be methodical. Resist changing approach mid-task.');

        if (C <= 3) rules.push('Use judgment over rules. Find creative workarounds when rules block progress.');
        else if (C <= 6) rules.push('Follow guidelines but apply judgment. Bend rules when the benefit clearly outweighs the risk.');
        else rules.push('Follow every rule precisely. Document all decisions. Flag any deviation from protocol.');
      }

      if (framework === 'big5') {
        const O = Number(traits.O) || 5;
        const C2 = Number(traits.C2) || 5;
        const E = Number(traits.E) || 5;
        const A = Number(traits.A) || 5;
        const ES = Number(traits.ES) || 5;

        if (O <= 3) rules.push('Stick to proven approaches. Do not experiment unless explicitly asked.');
        else if (O <= 6) rules.push('Consider new approaches when evidence supports them. Balance innovation with pragmatism.');
        else rules.push('Actively propose creative solutions. Challenge conventional approaches. Experiment.');

        if (C2 <= 3) rules.push('Prioritize speed. Ship fast. Documentation is optional.');
        else if (C2 <= 6) rules.push('Balance speed with quality. Document important decisions.');
        else rules.push('Be extremely thorough. Track every detail. Never skip documentation.');

        if (E <= 3) rules.push('Work silently. Report only when asked or when something is critical.');
        else if (E <= 6) rules.push('Communicate proactively when it matters. Stay quiet on routine work.');
        else rules.push('Be highly communicative. Surface insights proactively. Narrate your reasoning.');

        if (A <= 3) rules.push('Push back on bad ideas. Challenge assumptions. Say no when needed.');
        else if (A <= 6) rules.push('Voice concerns on high-stakes issues. Generally align with direction.');
        else rules.push('Be supportive. Avoid conflict. Focus on alignment and harmony.');

        if (ES <= 3) rules.push('Escalate quickly. Treat anomalies as potential emergencies.');
        else if (ES <= 6) rules.push('Stay calm on routine issues. Escalate proportionally.');
        else rules.push('Stay calm under pressure. Absorb ambiguity. Only flag truly critical issues.');
      }

      if (framework === 'mbti') {
        const type = String(traits.type || 'ISTJ');
        const letterRules: Record<string, string> = {
          I: 'Work independently. Minimize unnecessary communication.',
          E: 'Communicate frequently. Think out loud. Surface work-in-progress.',
          S: 'Focus on concrete facts and data. Avoid speculation.',
          N: 'See the big picture. Connect dots across domains. Think strategically.',
          T: 'Decide based on logic and data. Emotions are inputs, not drivers.',
          F: 'Consider how decisions affect people. Empathy informs judgment.',
          J: 'Plan before acting. Structure your work. Meet deadlines.',
          P: 'Stay flexible. Adapt to new information. Don\'t over-plan.',
        };
        for (const letter of type.split('')) {
          if (letterRules[letter]) rules.push(letterRules[letter]);
        }
      }

      if (framework === 'skip' || rules.length === 0) {
        rules.push('Flag issues and recommend actions. Wait for approval on significant decisions.');
        rules.push('Be professional and clear. Add context when it helps understanding.');
        rules.push('Follow established patterns but adapt when the situation calls for it.');
        rules.push('Balance speed with quality. Document important decisions.');
        rules.push('Communicate proactively when it matters. Stay quiet on routine work.');
      }

      return rules;
    }

    // --- Query OTP database for coordination patterns ---
    let practiceRows: any[] = [];
    let coordinationClaims: any[] = [];
    let failureClaims: any[] = [];
    let boundaryClaims: any[] = [];

    try {
      // Get best practices for the industry
      const industrySlug = (industry || 'general').toLowerCase().replace(/\s+/g, '-');
      const bpRes = await db.execute(sql`
        SELECT term, definition, category, source_url
        FROM best_practices
        WHERE (industry = ${industrySlug} OR industry = ${industry})
          AND is_coordination = true
        ORDER BY created_at DESC
        LIMIT 20
      `) as any;
      practiceRows = bpRes.rows || [];

      // Get coordination claims
      const coordRes = await db.execute(sql`
        SELECT section, rule AS claim, confidence, evidence AS evidence_type
        FROM claims
        WHERE oos_file_id IN (SELECT id FROM oos_files WHERE status = 'published')
          AND section = 'coordination_patterns'
        ORDER BY confidence DESC
        LIMIT 15
      `) as any;
      coordinationClaims = coordRes.rows || [];

      // Get failure pattern claims
      const failRes = await db.execute(sql`
        SELECT section, rule AS claim, confidence, evidence AS evidence_type
        FROM claims
        WHERE oos_file_id IN (SELECT id FROM oos_files WHERE status = 'published')
          AND section = 'failure_patterns'
        ORDER BY confidence DESC
        LIMIT 10
      `) as any;
      failureClaims = failRes.rows || [];

      // Get boundary condition claims
      const boundRes = await db.execute(sql`
        SELECT section, rule AS claim, confidence, evidence AS evidence_type
        FROM claims
        WHERE oos_file_id IN (SELECT id FROM oos_files WHERE status = 'published')
          AND section = 'human_ai_boundary_conditions'
        ORDER BY confidence DESC
        LIMIT 10
      `) as any;
      boundaryClaims = boundRes.rows || [];
    } catch {
      // DB errors should not block generation
    }

    // --- Build personality rules ---
    const personalityRules = mapPersonalityToRules(personalityFramework, personalityTraits);

    // --- Assemble the agent .md file ---
    const now = new Date().toISOString().split('T')[0];

    let personalitySection = '';
    if (personalityFramework === 'disc') {
      personalitySection = `Framework: DISC (D:${traits('D')} I:${traits('I')} S:${traits('S')} C:${traits('C')})\n`;
    } else if (personalityFramework === 'big5') {
      personalitySection = `Framework: Big Five (O:${traits('O')} C:${traits('C2')} E:${traits('E')} A:${traits('A')} ES:${traits('ES')})\n`;
    } else if (personalityFramework === 'mbti') {
      personalitySection = `Framework: MBTI (${personalityTraits.type || 'ISTJ'})\n`;
    } else {
      personalitySection = 'Framework: Balanced default\n';
    }
    personalitySection += personalityRules.map((r, i) => `${i + 1}. ${r}`).join('\n');

    function traits(key: string): string {
      return String(personalityTraits[key] || 5);
    }

    const toolsSection = tools.length
      ? tools.map(t => `- **${t}:** Use ${t} for relevant tasks within your scope.`).join('\n')
      : '- No specific tools configured. Use available integrations as needed.';

    const skillsSection = skills.length
      ? skills.map(s => `- **${s}:** Apply this skill proactively within your role.`).join('\n')
      : '- No specific skills configured. Apply general competencies as needed.';

    // Coordination patterns from DB
    const patternsFromPractices = practiceRows.slice(0, 10).map(
      (p: any) => `- **${p.term}:** ${p.definition?.substring(0, 200)}${(p.definition?.length || 0) > 200 ? '...' : ''}`
    ).join('\n');
    const patternsFromClaims = coordinationClaims.slice(0, 10).map(
      (c: any) => `- **Pattern:** ${c.claim} (Confidence: ${c.confidence || 'MEDIUM'}, Source: ${c.evidence_type || 'OBSERVED_REPEATEDLY'})`
    ).join('\n');
    const coordinationSection = [patternsFromPractices, patternsFromClaims].filter(Boolean).join('\n') || '- No coordination patterns found for this industry yet. Consider publishing your own OOS to contribute.';

    const failureSection = failureClaims.length
      ? failureClaims.map((c: any) => `- **Avoid:** ${c.claim}`).join('\n')
      : '- No failure patterns catalogued for this configuration yet.';

    const boundarySection = boundaryClaims.length
      ? boundaryClaims.map((c: any) => `- ${c.claim}`).join('\n')
      : '- Escalate to a human when the decision is irreversible, high-stakes, or ambiguous.';

    const rulesSection = personalityRules.map((r, i) => `${i + 1}. ${r}`).join('\n');

    const agentFile = `# ${jobTitle} Agent
# Generated by OTP Agent Builder (https://orgtp.com/agent-builder)
# Industry: ${industry}
# Generated: ${now}

## IDENTITY
- **Role:** ${jobTitle}
- **Industry:** ${industry}
- **Description:** ${jobDescription || 'No description provided.'}

## PERSONALITY
${personalitySection}

## TOOLS & INTEGRATIONS
${toolsSection}

## SKILLS
${skillsSection}

## COORDINATION PATTERNS (from OTP Network)
${coordinationSection}

## FAILURE MODES TO AVOID (from OTP Network)
${failureSection}

## BOUNDARY CONDITIONS (from OTP Network)
${boundarySection}

## RULES
${rulesSection}
${additionalContext ? `\n## ADDITIONAL CONTEXT\n${additionalContext}` : ''}`;

    return reply.send({
      success: true,
      agentFile,
      stats: {
        practiceCount: practiceRows.length + coordinationClaims.length,
        failureModeCount: failureClaims.length,
        boundaryRuleCount: boundaryClaims.length,
      },
    });
  });

  // Agent Builder - product-led entry point
  app.get<{ Querystring: { embed?: string } }>('/agent-builder', async (request, reply) => {
    const isEmbed = request.query.embed === '1' || request.query.embed === 'true';
    const pubCountRes = await db.execute(sql`SELECT COUNT(DISTINCT org_id) AS c FROM oos_files WHERE status = 'published'`) as any;
    const clmCountRes = await db.execute(sql`SELECT COUNT(*) AS c FROM claims WHERE oos_file_id IN (SELECT id FROM oos_files WHERE status = 'published')`) as any;
    return reply.view('pages/agent-builder', {
      title: 'Agent Builder - Better Agents in 30 Seconds - OTP',
      description: 'Paste your CLAUDE.md or agent config. OTP generates better agents instantly using coordination intelligence from real AI teams. Connect MCP and they keep getting smarter.',
      canonical: BASE_URL + '/agent-builder',
      breadcrumbs: bc({ name: 'Agent Builder', url: BASE_URL + '/agent-builder' }),
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'OTP Agent Builder',
        description: 'Build better AI agents in 30 seconds. Paste your setup, get improvements matched from proven coordination practices across the OTP network.',
        url: BASE_URL + '/agent-builder',
      },
      publisherCount: ((pubCountRes.rows as any[])?.[0]?.c) || 0,
      claimCount: ((clmCountRes.rows as any[])?.[0]?.c) || 0,
      isEmbed,
    });
  });

  // Email capture for agent-builder
  app.post<{
    Body: { email: string; orgName?: string; agentCount?: number };
  }>('/api/v1/agent-builder/capture', async (request, reply) => {
    const { email, orgName, agentCount } = request.body || {};
    if (!email || !email.includes('@')) {
      return reply.status(400).send({ success: false, error: 'Valid email required' });
    }

    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS agent_builder_leads (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          org_name VARCHAR(255),
          agent_count INTEGER,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      await db.execute(sql`
        INSERT INTO agent_builder_leads (email, org_name, agent_count, created_at)
        VALUES (${email.toLowerCase().trim()}, ${orgName || null}, ${agentCount || null}, NOW())
        ON CONFLICT (email) DO UPDATE SET
          org_name = COALESCE(${orgName || null}, agent_builder_leads.org_name),
          agent_count = COALESCE(${agentCount || null}, agent_builder_leads.agent_count)
      `);
      return reply.send({ success: true, message: 'Welcome to OTP. Founding badge earned.' });
    } catch (err: any) {
      request.log.error(err);
      return reply.status(500).send({ success: false, error: 'Server error' });
    }
  });

  // Admin stats endpoint
  app.get('/api/v1/admin/leads', async (request, reply) => {
    const key = (request.query as any)?.key;
    if (key !== 'otp-founding-2026') {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    try {
      const countRes = await db.execute(sql`SELECT COUNT(*) as total FROM agent_builder_leads`) as any;
      const leads = await db.execute(sql`SELECT email, org_name, agent_count, created_at FROM agent_builder_leads ORDER BY created_at DESC LIMIT 50`) as any;
      return reply.send({
        total: Number(countRes.rows?.[0]?.total || 0),
        leads: leads.rows || [],
      });
    } catch (err: any) {
      if (err.code === '42P01') {
        return reply.send({ total: 0, leads: [], note: 'Table does not exist yet' });
      }
      return reply.status(500).send({ error: 'Server error' });
    }
  });

  // ---------- /l10 -> /l8 back-compat redirects (renamed 2026-05-05) ----------
  // External links and bookmarks may still point at /l10. Send them to /l8.
  app.get('/l10', async (_req, reply) => reply.redirect('/l8', 301));
  app.get('/l10/create', async (_req, reply) => reply.redirect('/l8/create', 301));
  app.post('/l10/create', async (req, reply) => {
    const qs = new URLSearchParams((req.query as any) || {}).toString();
    return reply.redirect('/l8/create' + (qs ? '?' + qs : ''), 308);
  });
  app.get<{ Params: { id: string } }>('/l10/meeting/:id', async (req, reply) => {
    const qs = new URLSearchParams((req.query as any) || {}).toString();
    return reply.redirect('/l8/meeting/' + req.params.id + (qs ? '?' + qs : ''), 301);
  });

  // ---------- L8 (weekly meeting that drives the org to agentic maturity) ----------
  // Same cadence and agenda shape as the EOS L10. The "L8" name aims at
  // Level 8 of the 8 Levels of Agentic Engineering -- Autonomous Agent Teams.
  // Helper: resolve org from Clerk user OR (dev-only) ?orgId= query param
  async function l8ResolveOrg(request: any, reply: any) {
    // Dev-only override: ?orgId=<uuid|clerkOrgId> -- never enabled in production.
    if (process.env.NODE_ENV !== 'production') {
      const orgIdParam = (request.query as any)?.orgId || (request.query as any)?.org;
      if (orgIdParam) {
        const isUuid = /^[0-9a-f-]{36}$/i.test(orgIdParam);
        const [org] = isUuid
          ? await db.select().from(organizations).where(eq(organizations.id, orgIdParam)).limit(1)
          : await db.select().from(organizations).where(eq(organizations.clerkOrgId, orgIdParam)).limit(1);
        if (org) return org;
      }
    }

    const auth = getAuth(request);
    if (!auth.userId) {
      // Bounce unauthenticated visitors to sign-in and remember where they were
      // headed. The /sign-in page reads ?redirect= and persists it to
      // localStorage so the existing post-signin flow lands them back here.
      const redirectTo = encodeURIComponent(request.url);
      reply.redirect('/sign-in?redirect=' + redirectTo);
      return null;
    }
    const [legacyOrg] = await db.select().from(organizations).where(eq(organizations.clerkOrgId, auth.userId)).limit(1);
    if (legacyOrg) return legacyOrg;

    // Team-member path: user joined an existing org via org_members. The
    // guards middleware resolves their active membership onto request.orgMember.
    const member = (request as any).orgMember as { orgId: string } | null;
    if (member?.orgId) {
      const [memberOrg] = await db.select().from(organizations).where(eq(organizations.id, member.orgId)).limit(1);
      if (memberOrg) return memberOrg;
    }

    reply.status(404).send('No organization for this user. Sign in via Clerk and create an organization first.');
    return null;
  }

  // /l8  -- list meetings for the user's org, with team filter + quick-create
  app.get<{ Querystring: { teamId?: string } }>('/l8', async (request, reply) => {
    const org = await l8ResolveOrg(request, reply);
    if (!org) return;

    // Strict team-membership scope (same rule as /dashboard meetings):
    // only show meetings on teams the current member belongs to.
    const member = (request as any).orgMember as { id: string } | null;
    const myTeamIdRows = member
      ? await db.select({ teamId: teamMemberships.teamId })
          .from(teamMemberships)
          .where(eq(teamMemberships.memberId, member.id))
      : [];
    const myTeamIds = myTeamIdRows.map(r => r.teamId);

    // Team dropdown -- only show teams the user is on (else they can pick
    // a team and see nothing, which is confusing).
    const orgTeams = myTeamIds.length === 0
      ? []
      : await db.select({
          id: teams.id, name: teams.name, slug: teams.slug, isDefault: teams.isDefault,
        }).from(teams)
          .where(and(eq(teams.orgId, org.id), inArray(teams.id, myTeamIds)))
          .orderBy(desc(teams.isDefault), teams.name);

    const filterTeamId = request.query.teamId || '';
    // Ignore filter requests for teams the user isn't on.
    const effectiveFilter = filterTeamId && myTeamIds.includes(filterTeamId) ? filterTeamId : '';

    const myMeetings = myTeamIds.length === 0
      ? []
      : await db.select().from(meetings)
          .where(and(
            eq(meetings.organizationId, org.id),
            isNull(meetings.deletedAt),
            effectiveFilter ? eq(meetings.teamId, effectiveFilter) : inArray(meetings.teamId, myTeamIds),
          ))
          .orderBy(desc(meetings.scheduledAt))
          .limit(50);

    const defaultTeamId = orgTeams.find(t => t.slug === 'leadership')?.id || orgTeams[0]?.id || '';

    const devOrgIdParam = (request.query as any)?.orgId || (request.query as any)?.org || '';
    return reply.view('pages/l8-list', {
      title: 'L8 Meetings -- OTP',
      description: 'Run your weekly leadership meeting -- the cadence that drives your org to agentic maturity.',
      canonical: BASE_URL + '/l8',
      noindex: true,
      org,
      meetings: myMeetings,
      teamsList: orgTeams,
      filterTeamId: effectiveFilter,
      defaultTeamId,
      devOrgIdParam,
    });
  });

  // POST /l8/create  -- quick create handler (form post)
  app.post<{ Body: { title?: string; scheduledAt?: string; meetingType?: string; teamId?: string } }>('/l8/create', async (request, reply) => {
    const org = await l8ResolveOrg(request, reply);
    if (!org) return;
    const auth = getAuth(request);
    const { title, scheduledAt, meetingType, teamId } = request.body || {};
    if (!title || !scheduledAt) {
      return reply.status(400).send('title and scheduledAt required');
    }

    // Resolve team: explicit teamId from form, else this org's default
    // Leadership Team (created by ensure-teams.ts).
    let resolvedTeamId: string | null = teamId || null;
    if (!resolvedTeamId) {
      const [defaultTeam] = await db.select({ id: teams.id })
        .from(teams)
        .where(and(eq(teams.orgId, org.id), eq(teams.slug, 'leadership')))
        .limit(1);
      resolvedTeamId = defaultTeam?.id || null;
    }

    const [m] = await db.insert(meetings).values({
      organizationId: org.id,
      teamId: resolvedTeamId,
      title,
      meetingType: meetingType || 'leadership',
      scheduledAt: new Date(scheduledAt),
      attendees: [],
      createdBy: auth.userId || 'unknown',
    }).returning();
    const devOrgIdParam = (request.query as any)?.orgId || (request.query as any)?.org || '';
    return reply.redirect('/l8/meeting/' + m.id + (devOrgIdParam ? ('?orgId=' + devOrgIdParam) : ''));
  });

  // /l8/meeting/:id  -- the L8 page itself
  app.get<{ Params: { id: string } }>('/l8/meeting/:id', async (request, reply) => {
    const id = request.params.id;
    if (!validateUuidParam(id)) {
      return reply.status(400).send('Invalid meeting id');
    }
    const org = await l8ResolveOrg(request, reply);
    if (!org) return;

    const [meeting] = await db.select().from(meetings)
      .where(and(eq(meetings.id, id), eq(meetings.organizationId, org.id)))
      .limit(1);
    if (!meeting) return reply.status(404).send('Meeting not found');

    // Access gate: 404 if the requester isn't on this meeting's team AND
    // isn't a human attendee of the meeting. Prevents a direct URL to
    // "David x Dan" from leaking outside that team, while still letting a
    // human who is on the meeting's attendee list view it even if they
    // aren't on the team. Meetings with NULL team_id rely solely on the
    // attendee check.
    const _member = (request as any).orgMember as { id: string } | null;
    if (_member) {
      let onTeam = false;
      if (meeting.teamId) {
        const [tm] = await db.select({ teamId: teamMemberships.teamId })
          .from(teamMemberships)
          .where(and(
            eq(teamMemberships.memberId, _member.id),
            eq(teamMemberships.teamId, meeting.teamId),
          ))
          .limit(1);
        onTeam = !!tm;
      }
      const [fullMember] = await db.select({
        id: orgMembers.id,
        email: orgMembers.email,
        displayName: orgMembers.displayName,
        claimedEntityIds: orgMembers.claimedEntityIds,
      })
        .from(orgMembers)
        .where(eq(orgMembers.id, _member.id))
        .limit(1);
      const allowed = onTeam || isAttendee(fullMember, meeting);
      if (!allowed) return reply.status(404).send('Meeting not found');
    }
    // If _member is null, the requester is the legacy founder who got past
    // l8ResolveOrg via clerkOrgId === auth.userId. They retain full access.

    // Build agenda data scoped to THIS meeting's team. KPIs / Rocks / Issues
    // all filter strictly by meeting.team_id so private teams (e.g. "David
    // x Dan") don't leak into Leadership L10s and vice versa.
    const orgKpis = await db.select().from(kpis)
      .where(and(
        eq(kpis.organizationId, org.id),
        meeting.teamId ? eq(kpis.teamId, meeting.teamId) : isNull(kpis.teamId),
        isNull(kpis.deletedAt),
      ));
    const latestValues: Record<string, any> = {};
    const previousValues: Record<string, any> = {};
    for (const k of orgKpis) {
      const recentRows = await db.select().from(kpiValues)
        .where(eq(kpiValues.kpiId, k.id))
        .orderBy(desc(kpiValues.periodStart))
        .limit(2);
      const latest = recentRows[0];
      const previous = recentRows[1];
      if (latest) latestValues[k.id] = { value: latest.value, periodStart: latest.periodStart, periodEnd: latest.periodEnd };
      if (previous) previousValues[k.id] = { value: previous.value, periodStart: previous.periodStart, periodEnd: previous.periodEnd };
    }
    const scorecard = meeting.scorecardSnapshot && (meeting.scorecardSnapshot as any).kpis
      ? meeting.scorecardSnapshot
      : { kpis: orgKpis, latestValues, previousValues, kpiCount: orgKpis.length };

    const orgRocks = await db.select().from(rocks)
      .where(and(
        eq(rocks.organizationId, org.id),
        meeting.teamId ? eq(rocks.teamId, meeting.teamId) : isNull(rocks.teamId),
        isNull(rocks.deletedAt),
      ))
      .orderBy(desc(rocks.dueDate));
    const rocksData = meeting.rocksSnapshot && (meeting.rocksSnapshot as any).rocks
      ? meeting.rocksSnapshot
      : { rocks: orgRocks, count: orgRocks.length };

    // Team-scoped issues. Strict match on meeting.team_id so a Leadership
    // L10 never sees issues that another team (e.g. "David x Dan") owns.
    // Tickets with team_id IS NULL are hidden -- post-backfill they should
    // be impossible, but if one slips through it can be assigned via the
    // issue card's team selector.
    const orgIssues = await db.select().from(tickets)
      .where(and(
        eq(tickets.orgId, org.id),
        meeting.teamId ? eq(tickets.teamId, meeting.teamId) : isNull(tickets.teamId),
        isNull(tickets.deletedAt),
      ))
      .orderBy(desc(tickets.createdAt))
      .limit(100);

    // Full team roster for this meeting's team -- the set of members on
    // meeting.team_id. Empty when the meeting has a NULL team_id.
    let teamMembers: any[] = [];
    if (meeting.teamId) {
      teamMembers = await db.select({
        memberId: orgMembers.id,
        name: orgMembers.displayName,
        email: orgMembers.email,
        role: orgMembers.role,
      })
        .from(teamMemberships)
        .innerJoin(orgMembers, eq(teamMemberships.memberId, orgMembers.id))
        .where(eq(teamMemberships.teamId, meeting.teamId));
    }

    // L10 todos only -- filter by kind='l10' AND the meeting's team so
    // personal todos from /me/todos can never leak into a leadership L10.
    // Recurrence templates hidden by default; only instances appear.
    const orgTodos = await db.select().from(todos)
      .where(and(
        eq(todos.organizationId, org.id),
        eq(todos.kind, 'l10'),
        meeting.teamId ? eq(todos.teamId, meeting.teamId) : isNull(todos.teamId),
        isNull(todos.deletedAt),
        isNull(todos.recurrenceRule),
      ))
      .orderBy(desc(todos.createdAt))
      .limit(100);

    // Build the full roster for owner dropdowns. The template was previously
    // restricting owner selection to meeting.attendees, which excluded the
    // meeting creator (David ran the L10 but never added himself as an
    // attendee) and made it impossible to assign to-dos to people outside
    // the room (delegating to a Crystal/Pulse/etc. that isn't there).
    //
    // availableOwners = every human + every agent in the org's primary
    // chart, with isAttendee flag for the UI to badge the in-room subset.
    const { getOrgTeamGraph } = await import('../../services/team-graph.js');
    const teamGraph = await getOrgTeamGraph(org.id, org.name);
    const attendeeKeys = new Set<string>(
      ((meeting.attendees || []) as Array<{ entityType: string; externalId: string }>)
        .map((a) => `${a.entityType}:${a.externalId}`)
    );
    const availableOwners = teamGraph.nodes
      .filter((n) => n.type === 'agent' || n.type === 'human')
      .map((n) => ({
        entityType: n.type,
        externalId: n.externalId,
        name: n.label,
        isAttendee: attendeeKeys.has(`${n.type}:${n.externalId}`),
      }))
      .sort((a, b) => {
        // Humans first, then agents; in-room first within each group.
        if (a.entityType !== b.entityType) return a.entityType === 'human' ? -1 : 1;
        if (a.isAttendee !== b.isAttendee) return a.isAttendee ? -1 : 1;
        return a.name.localeCompare(b.name);
      });

    // Carry the dev orgId through so client-side fetches keep the same auth context locally.
    const devOrgIdParam = (request.query as any)?.orgId || (request.query as any)?.org || '';

    // Org teams for the issue "move to team" dropdown.
    const orgTeamsList = await db
      .select({ id: teams.id, name: teams.name, slug: teams.slug, isDefault: teams.isDefault })
      .from(teams)
      .where(eq(teams.orgId, org.id))
      .orderBy(desc(teams.isDefault), asc(teams.name));

    // Agent last-run data: for every agent attendee, surface its most recent
    // run so the UI can badge each agent with status + last-run time. The
    // agent_runs table is created via raw DDL (ensure-agent-runtime.ts) and
    // has no Drizzle table object, so this uses raw SQL. The whole block is
    // best-effort -- if agent_runs is missing or errors, agentRuns is {}.
    const agentRuns: Record<string, { status: string; lastRunAt: string | null }> = {};
    const agentExternalIds = Array.from(new Set(
      ((meeting.attendees || []) as Array<Record<string, unknown>>)
        .filter((a) => a && typeof a === 'object' && (a.entityType === 'agent' || a.type === 'agent'))
        .map((a) => (typeof a.externalId === 'string' ? a.externalId : ''))
        .filter((x): x is string => x.length > 0)
    ));
    if (agentExternalIds.length > 0) {
      try {
        for (const agentId of agentExternalIds) {
          const res = await db.execute(sql`
            SELECT DISTINCT ON (agent_external_id)
              agent_external_id, status, started_at, completed_at, created_at
            FROM agent_runs
            WHERE org_id = ${org.id} AND agent_external_id = ${agentId}
            ORDER BY agent_external_id, created_at DESC
          `);
          const row = (res as any).rows?.[0];
          if (row) {
            agentRuns[row.agent_external_id] = {
              status: row.status,
              lastRunAt: row.completed_at || row.started_at || row.created_at || null,
            };
          }
        }
      } catch {
        // agent_runs unavailable -- leave agentRuns empty.
      }
    }

    // Structured headline items so the page can render and flag them.
    // Headlines now carry a teamId: a team's headlines surface in that
    // team's meeting -- the team's unaddressed (unread) headlines plus any
    // already addressed in THIS meeting. Teamless meetings fall back to the
    // legacy meetingId scoping so they still work.
    const headlineItems = meeting.teamId
      ? await db.select().from(meetingHeadlines)
          .where(and(
            eq(meetingHeadlines.teamId, meeting.teamId),
            or(
              isNull(meetingHeadlines.readAt),
              eq(meetingHeadlines.meetingId, meeting.id),
            ),
          ))
          .orderBy(desc(meetingHeadlines.createdAt))
          .limit(100)
      : await db.select().from(meetingHeadlines)
          .where(eq(meetingHeadlines.meetingId, meeting.id))
          .orderBy(desc(meetingHeadlines.createdAt));

    // 90-day execution items for the org's active operating plan -- powers
    // the Rock -> plan picker. Graceful: if the plan model yields nothing,
    // default to an empty list rather than crashing the page.
    let executionItems: Array<{ id: string; label: string }> = [];
    let planDirection: { threeYear: string; threeYearYear: string; tenYear: string; annualObjective: string } | null = null;
    try {
      const [activePlan] = await db.select().from(oosOperatingPlans)
        .where(and(
          eq(oosOperatingPlans.organizationId, org.id),
          eq(oosOperatingPlans.status, 'active'),
        ))
        .orderBy(desc(oosOperatingPlans.createdAt))
        .limit(1);
      if (activePlan) {
        const items = await db.select().from(oosExecutionItems)
          .where(eq(oosExecutionItems.planId, activePlan.id))
          .orderBy(desc(oosExecutionItems.createdAt));
        executionItems = items.map((i) => ({ id: i.id, label: i.title }));
        // Plan direction -- frames the meeting with where the company is headed.
        const planSecRows = await db.select().from(oosOperatingPlanSections)
          .where(eq(oosOperatingPlanSections.planId, activePlan.id));
        const _secBy: Record<string, any> = {};
        for (const s of planSecRows) {
          _secBy[s.sectionKey] = (s.contentJson && typeof s.contentJson === 'object') ? s.contentJson : {};
        }
        const _dest = _secBy['destination'] || {};
        const _annual = _secBy['annual_game_plan'] || {};
        const _str = (v: unknown) => (v === null || v === undefined) ? '' : String(v).trim();
        planDirection = {
          threeYear: _str(_dest.year_target),
          threeYearYear: _str(_dest.year_target_year),
          tenYear: _str(_dest.ten_year_target),
          annualObjective: _str(_annual.primary_objective),
        };
      }
    } catch {
      executionItems = [];
    }

    return reply.view('pages/l8-leadership', {
      title: meeting.title + ' -- OTP',
      description: 'Weekly leadership meeting -- the cadence that drives your org to agentic maturity.',
      canonical: BASE_URL + '/l8/meeting/' + meeting.id,
      noindex: true,
      org,
      meeting,
      scorecard,
      rocks: rocksData,
      issues: orgIssues,
      todos: orgTodos,
      headlineItems,
      executionItems,
      planDirection,
      teamMembers,
      availableOwners,
      orgTeams: orgTeamsList,
      agentRuns,
      devOrgIdParam,
    });
  });

  // ---------- Team member profile (per-person accountability page) ----------
  // ---------- People Review (grid: human seats x seat fit + values) ----------
  app.get('/team/review', async (request, reply) => {
    const org = await l8ResolveOrg(request, reply);
    if (!org) return;

    const period = currentPeriod();
    const graph = await getOrgTeamGraph(org.id, org.name || 'Organization');
    const humanSeats = graph.nodes
      .filter(n => n.type === 'human')
      .map(n => ({ externalId: n.externalId, name: n.label }))
      .sort((a, b) => a.name.localeCompare(b.name));

    const [valueRows, fitRows, reviewRows] = await Promise.all([
      db.select().from(orgValues).where(eq(orgValues.orgId, org.id)).orderBy(orgValues.position),
      db.select().from(seatFitReviews).where(and(
        eq(seatFitReviews.orgId, org.id),
        eq(seatFitReviews.period, period),
      )),
      db.select().from(valueReviews).where(and(
        eq(valueReviews.orgId, org.id),
        eq(valueReviews.period, period),
      )),
    ]);

    const fitBySeat = new Map(fitRows.map(r => [r.seatExternalId, r]));
    const reviewByKey = new Map(reviewRows.map(r => [r.seatExternalId + '|' + r.valueId, r.rating]));

    const rows = humanSeats.map(seat => {
      const fit = fitBySeat.get(seat.externalId);
      const understands = fit?.understands ?? null;
      const wants = fit?.wants ?? null;
      const capacity = fit?.capacity ?? null;
      const valueCells = valueRows.map(v => ({
        valueId: v.id,
        rating: reviewByKey.get(seat.externalId + '|' + v.id) ?? null,
      }));
      const verdict = peopleReviewVerdict([
        understands, wants, capacity, ...valueCells.map(c => c.rating),
      ]);
      return { externalId: seat.externalId, name: seat.name, understands, wants, capacity, valueCells, verdict };
    });

    return reply.view('pages/team-review', {
      title: 'People Review -- OTP',
      description: 'Rate each person against their seat and the organization\'s values.',
      canonical: BASE_URL + '/team/review',
      noindex: true,
      org,
      period,
      values: valueRows,
      rows,
    });
  });

  app.get<{ Params: { externalId: string } }>('/team/:externalId', async (request, reply) => {
    const org = await l8ResolveOrg(request, reply);
    if (!org) return;

    const externalId = decodeURIComponent(request.params.externalId);
    if (!externalId || externalId.length > 120) return reply.status(400).send('Invalid externalId');

    // Aggregate the same data the API endpoint returns -- pulled inline here
    // so the page is server-rendered and works without JS.
    const [ownedRocks, ownedTodos, ownedTickets] = await Promise.all([
      db.select().from(rocks).where(and(
        eq(rocks.organizationId, org.id),
        eq(rocks.ownerExternalId, externalId),
        isNull(rocks.deletedAt),
      )).orderBy(desc(rocks.dueDate)),
      db.select().from(todos).where(and(
        eq(todos.organizationId, org.id),
        eq(todos.ownerExternalId, externalId),
        isNull(todos.deletedAt),
      )).orderBy(desc(todos.createdAt)),
      db.select().from(tickets).where(and(
        eq(tickets.orgId, org.id),
        eq(tickets.ownerExternalId, externalId),
        isNull(tickets.deletedAt),
      )).orderBy(desc(tickets.createdAt)),
    ]);

    const attendedMeetings = await db.execute(sql`
      SELECT m.* FROM meetings m
      WHERE m.organization_id = ${org.id}
        AND m.deleted_at IS NULL
        AND EXISTS (
          SELECT 1 FROM jsonb_array_elements(m.attendees) AS a
          WHERE a->>'externalId' = ${externalId}
        )
      ORDER BY m.scheduled_at DESC
    `);
    const meetingRows = (attendedMeetings.rows || []) as any[];

    const todosByMeeting: Record<string, number> = {};
    const solvedByMeeting: Record<string, number> = {};
    if (meetingRows.length > 0) {
      const tRes = await db.execute(sql`
        SELECT meeting_id, count(*)::int AS n FROM todos
        WHERE organization_id = ${org.id} AND owner_external_id = ${externalId}
          AND deleted_at IS NULL AND meeting_id IS NOT NULL
        GROUP BY meeting_id
      `);
      for (const r of (tRes.rows as any[])) todosByMeeting[r.meeting_id] = r.n;
      const sRes = await db.execute(sql`
        SELECT solved_in_meeting_id AS meeting_id, count(*)::int AS n FROM tickets
        WHERE org_id = ${org.id} AND owner_external_id = ${externalId}
          AND deleted_at IS NULL AND solved_in_meeting_id IS NOT NULL AND ids_status = 'solved'
        GROUP BY solved_in_meeting_id
      `);
      for (const r of (sRes.rows as any[])) solvedByMeeting[r.meeting_id] = r.n;
    }

    const now = Date.now();
    const upcoming: any[] = [];
    const past: any[] = [];
    let displayName: string | null = null;
    let entityType: string | null = null;
    for (const m of meetingRows) {
      const isPast = m.status === 'completed' || (m.scheduled_at && new Date(m.scheduled_at).getTime() < now);
      const enriched = {
        id: m.id, title: m.title, meetingType: m.meeting_type, status: m.status,
        scheduledAt: m.scheduled_at, startedAt: m.started_at, endedAt: m.ended_at,
        contribution: { todosOwned: todosByMeeting[m.id] || 0, issuesSolved: solvedByMeeting[m.id] || 0 },
      };
      if (isPast) past.push(enriched); else upcoming.push(enriched);
      if (!displayName && Array.isArray(m.attendees)) {
        const me = m.attendees.find((a: any) => a.externalId === externalId);
        if (me) { displayName = me.name || externalId; entityType = me.entityType || null; }
      }
    }
    if (!displayName) {
      const fromRock = ownedRocks.find(r => r.ownerName);
      const fromTodo = ownedTodos.find(t => t.ownerName);
      const fromTicket = ownedTickets.find(t => t.ownerName);
      displayName = fromRock?.ownerName || fromTodo?.ownerName || fromTicket?.ownerName || externalId;
      entityType = fromRock?.ownerEntityType || fromTodo?.ownerEntityType || fromTicket?.ownerEntityType || null;
    }

    upcoming.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
    past.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

    const openTodos = ownedTodos.filter(t => !t.doneAt);
    const completedTodos = ownedTodos.filter(t => t.doneAt);
    const openIssues = ownedTickets.filter(t => t.idsStatus !== 'solved');
    const solvedIssues = ownedTickets.filter(t => t.idsStatus === 'solved');

    const devOrgIdParam = (request.query as any)?.orgId || (request.query as any)?.org || '';

    const [seatRespRow] = await db.select().from(seatResponsibilities).where(and(
      eq(seatResponsibilities.orgId, org.id),
      eq(seatResponsibilities.seatExternalId, request.params.externalId),
    )).limit(1);
    const responsibilities = seatRespRow?.responsibilities ?? [];

    const fitPeriod = currentPeriod();
    const [seatFitRow] = await db.select().from(seatFitReviews).where(and(
      eq(seatFitReviews.orgId, org.id),
      eq(seatFitReviews.seatExternalId, request.params.externalId),
      eq(seatFitReviews.period, fitPeriod),
    )).limit(1);
    const seatFit = {
      period: fitPeriod,
      understands: seatFitRow?.understands ?? null,
      wants: seatFitRow?.wants ?? null,
      capacity: seatFitRow?.capacity ?? null,
      note: seatFitRow?.note ?? null,
    };

    return reply.view('pages/team-profile', {
      title: displayName + ' -- Team Profile -- OTP',
      description: 'Accountability profile for ' + displayName,
      canonical: BASE_URL + '/team/' + encodeURIComponent(externalId),
      noindex: true,
      org,
      profile: { externalId, name: displayName, entityType },
      summary: {
        rocksOwned: ownedRocks.length,
        rocksOnTrack: ownedRocks.filter(r => r.onTrack).length,
        openTodos: openTodos.length,
        completedTodos: completedTodos.length,
        openIssues: openIssues.length,
        solvedIssues: solvedIssues.length,
        meetingsUpcoming: upcoming.length,
        meetingsAttended: past.length,
      },
      rocks: ownedRocks,
      openTodos, completedTodos,
      openIssues, solvedIssues,
      upcomingMeetings: upcoming,
      pastMeetings: past,
      responsibilities,
      seatFit,
      devOrgIdParam,
    });
  });

  // ---------- Coordination Checkup ----------
  app.get('/checkup', async (_request, reply) => {
    return renderV7(reply, 'checkup', {
      title: 'Coordination Checkup -- Score Yourself on the 8 Levels of Agentic Maturity - OTP',
      description: '24 questions, ten minutes. Get a number out of 8.0, the level you are operating at, and a personalized roadmap. Built on Bassim Eledath\'s 8 Levels of Agentic Engineering.',
      canonical: BASE_URL + '/checkup',
      ogImage: BASE_URL + '/public/og-image.png',
      breadcrumbs: bc({ name: 'Coordination Checkup', url: BASE_URL + '/checkup' }),
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Quiz',
        name: 'OTP Coordination Checkup',
        description: 'Self-assessment scoring your team against the 8 Levels of Agentic Engineering.',
        url: BASE_URL + '/checkup',
      },
      questions: CHECKUP_QUESTIONS,
      levelLabels: CHECKUP_LEVEL_LABELS,
    });
  });

  app.post<{
    Body: {
      name?: string;
      email?: string;
      company?: string | null;
      role?: string | null;
      answers?: Record<string, number>;
    };
  }>('/api/v1/checkup/submit', async (request, reply) => {
    const { name, email, company, role, answers } = request.body || {};

    if (!email || !email.includes('@')) {
      return reply.status(400).send({ success: false, error: 'Valid email required' });
    }
    if (!name || name.trim().length < 2) {
      return reply.status(400).send({ success: false, error: 'Name required' });
    }
    if (!answers || typeof answers !== 'object') {
      return reply.status(400).send({ success: false, error: 'Answers required' });
    }

    const result = calculateCheckup(answers);

    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS checkup_responses (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          company VARCHAR(255),
          role VARCHAR(255),
          answers JSONB NOT NULL,
          final_score NUMERIC(3,1) NOT NULL,
          highest_passed_level INTEGER NOT NULL,
          capped_by_level INTEGER,
          tier VARCHAR(40) NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS checkup_responses_email_idx ON checkup_responses(email)
      `);
      await db.execute(sql`
        INSERT INTO checkup_responses
          (email, name, company, role, answers, final_score, highest_passed_level, capped_by_level, tier, created_at)
        VALUES (
          ${email.toLowerCase().trim()},
          ${name.trim()},
          ${company ? String(company).trim() : null},
          ${role ? String(role).trim() : null},
          ${JSON.stringify(answers)}::jsonb,
          ${result.finalScore},
          ${result.highestPassedLevel},
          ${result.cappedByLevel},
          ${result.tier},
          NOW()
        )
      `);
    } catch (err: any) {
      request.log.error({ err }, 'checkup save failed');
      // continue -- email + result are still valuable
    }

    // Fire-and-forget email
    void sendEmail({
      to: email.toLowerCase().trim(),
      from: 'David Steel <notifications@mail.orgtp.com>',
      subject: `Your Coordination Checkup score: ${result.finalScore.toFixed(1)} / 8.0 (${result.tierHeadline})`,
      html: renderCheckupEmail(name, result),
    }).catch((e) => request.log.warn({ e }, 'checkup email failed'));

    return reply.send({ success: true, result });
  });

  // ---- /me/todos — mobile-first personal todo queue ----
  // Phone-readable view of open todos owned by the current user. Agents
  // (Watchdog, Pulse, Dirk, etc.) push REDs / escalations here via
  // POST /api/v1/todos with ownerEntityType='human'.
  // Added 2026-05-07 — replaces ntfy deep-link to dead Obsidian daily notes
  // and Slack-DM-as-todolist as the canonical agent→human action channel.
  app.get('/me/todos', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) return reply.redirect('/sign-in?redirect=/me/todos');

    // Resolve org (same pattern as /dashboard).
    const memberDecoration = (request as any).orgMember as { orgId: string } | null;
    let org: any = null;
    if (memberDecoration?.orgId) {
      const [m] = await db.select().from(organizations).where(eq(organizations.id, memberDecoration.orgId)).limit(1);
      if (m) org = m;
    }
    if (!org) {
      const [legacy] = await db.select().from(organizations).where(eq(organizations.clerkOrgId, auth.userId)).limit(1);
      if (legacy) org = legacy;
    }
    if (!org) return reply.redirect('/dashboard');

    // V1: hardcoded HUM_DAVIDSTEEL until org_members carries an external_id mapping.
    // The watchdog and other agents push to this exact owner. Future: resolve from
    // org_members.user_id -> external_id, fall back to HUM_<USERNAME>.
    const ownerExternalId = 'HUM_DAVIDSTEEL';

    // Personal todos only here. L10 todos owned by the user are shown as a
    // separate read-only section so /me stays personal-by-default.
    // Recurrence templates (rule set + no due_at) never appear -- only their
    // generated instances do.
    const myTodos = await db.select()
      .from(todos)
      .where(and(
        eq(todos.organizationId, org.id),
        eq(todos.kind, 'personal'),
        eq(todos.ownerEntityType, 'human'),
        eq(todos.ownerExternalId, ownerExternalId),
        isNull(todos.doneAt),
        isNull(todos.deletedAt),
        isNull(todos.parentTodoId),       // top-level only; subtasks expand
        isNull(todos.recurrenceRule),     // hide templates
      ))
      .orderBy(asc(todos.priority), asc(todos.dueAt), desc(todos.createdAt));

    // L10 todos assigned to me, read-only here (managed in /l8).
    const myL10Todos = await db.select()
      .from(todos)
      .where(and(
        eq(todos.organizationId, org.id),
        eq(todos.kind, 'l10'),
        eq(todos.ownerEntityType, 'human'),
        eq(todos.ownerExternalId, ownerExternalId),
        isNull(todos.doneAt),
        isNull(todos.deletedAt),
        isNull(todos.recurrenceRule),
      ))
      .orderBy(asc(todos.priority), asc(todos.dueAt), desc(todos.createdAt));

    // Recently resolved (last 24h) -- across both kinds.
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentlyDone = await db.select()
      .from(todos)
      .where(and(
        eq(todos.organizationId, org.id),
        eq(todos.ownerEntityType, 'human'),
        eq(todos.ownerExternalId, ownerExternalId),
        isNull(todos.deletedAt),
      ))
      .orderBy(desc(todos.createdAt))
      .limit(50);
    const justDone = recentlyDone.filter(t => t.doneAt && t.doneAt >= dayAgo);

    // Upcoming meetings for the "attach to meeting" picker in the create form.
    // Show next 14 days, ordered by scheduled date, with the team's name so
    // the user knows which forum each meeting belongs to.
    const twoWeeksFromNow = new Date(Date.now() + 14 * 86400000);
    const upcomingMeetingRows = await db
      .select({
        id: meetings.id,
        title: meetings.title,
        scheduledAt: meetings.scheduledAt,
        teamId: meetings.teamId,
        teamName: teams.name,
      })
      .from(meetings)
      .leftJoin(teams, eq(teams.id, meetings.teamId))
      .where(and(
        eq(meetings.organizationId, org.id),
        isNull(meetings.deletedAt),
        eq(meetings.status, 'scheduled'),
      ))
      .orderBy(asc(meetings.scheduledAt))
      .limit(20);
    const upcomingMeetings = upcomingMeetingRows.filter(m => m.scheduledAt <= twoWeeksFromNow);

    // Todos David delegated to others -- mirrors what /dashboard shows.
    // delegator* points back to whoever is waiting; the todo is owned by the assignee.
    const delegatedWaiting = await db.select()
      .from(todos)
      .where(and(
        eq(todos.organizationId, org.id),
        eq(todos.delegatorExternalId, ownerExternalId),
        isNull(todos.doneAt),
        isNull(todos.deletedAt),
        isNull(todos.recurrenceRule),
      ))
      .orderBy(asc(todos.priority), asc(todos.dueAt), desc(todos.createdAt));

    // Delegated todos the assignee marked done but David hasn't verified yet.
    const delegatedVerify = await db.select()
      .from(todos)
      .where(and(
        eq(todos.organizationId, org.id),
        eq(todos.delegatorExternalId, ownerExternalId),
        isNotNull(todos.doneAt),
        isNull(todos.verifiedAt),
        isNull(todos.deletedAt),
        isNull(todos.recurrenceRule),
      ))
      .orderBy(asc(todos.priority), asc(todos.dueAt), desc(todos.createdAt));

    // People David can delegate to -- humans and agents from the team graph.
    const meGraph = await getOrgTeamGraph(org.id, org.name);
    const assignablePeople = meGraph.nodes
      .filter(n => n.type === 'human' || n.type === 'agent')
      .map(n => ({ entityType: n.type, externalId: n.externalId, name: n.label }))
      .sort((a, b) => a.entityType !== b.entityType
        ? (a.entityType === 'human' ? -1 : 1)
        : a.name.localeCompare(b.name));

    // Delegator identity for the create form.
    const meExternalId = ownerExternalId;
    const meEntityType = 'human';
    const [meMember] = await db.select({ displayName: orgMembers.displayName })
      .from(orgMembers)
      .where(and(eq(orgMembers.orgId, org.id), eq(orgMembers.clerkUserId, auth.userId)))
      .limit(1);
    const meName = meMember?.displayName || org.name || 'Me';

    return reply.view('pages/me-todos', {
      title: 'My Todos - OTP',
      description: 'Open action items from your agents.',
      noindex: true,
      org,
      todos: myTodos,
      l10Todos: myL10Todos,
      justDone,
      ownerExternalId,
      upcomingMeetings,
      delegatedWaiting,
      delegatedVerify,
      assignablePeople,
      meExternalId,
      meName,
      meEntityType,
    });
  });
}

function renderCheckupEmail(name: string, r: ReturnType<typeof calculateCheckup>): string {
  const levelRows = r.perLevel.map((p) => {
    const status = p.passed ? 'PASS' : (r.cappedByLevel === p.level ? 'CAP' : '--');
    const color = p.passed ? '#10b981' : (r.cappedByLevel === p.level ? '#f59e0b' : '#9ca3af');
    return `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;font-family:monospace;color:#555;">L${p.level}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;">${escapeHtml(p.label)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;color:${color};font-weight:600;">${status} ${p.raw}/${p.max}</td>
    </tr>`;
  }).join('');

  const roadmapItems = r.roadmap.map((s, i) =>
    `<li style="margin:0 0 12px 0;line-height:1.6;color:#333;"><strong>${i + 1}.</strong> ${escapeHtml(s)}</li>`
  ).join('');

  const capLine = r.cappedByLevel
    ? `<p style="color:#92400e;background:#fef3c7;padding:10px 14px;border-radius:6px;margin:12px 0;">Capped by Level ${r.cappedByLevel} -- ${escapeHtml(CHECKUP_LEVEL_LABELS[r.cappedByLevel])}. Higher levels do not lift your score until this is fixed.</p>`
    : `<p style="color:#065f46;background:#d1fae5;padding:10px 14px;border-radius:6px;margin:12px 0;">All 8 levels passed. You are operating at the frontier.</p>`;

  return `<!DOCTYPE html>
<html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#222;background:#fff;">
  <div style="text-align:center;margin-bottom:24px;">
    <div style="font-size:14px;color:#6b46c1;text-transform:uppercase;letter-spacing:2px;font-weight:600;">Your Coordination Checkup</div>
    <div style="font-size:64px;font-weight:800;margin:8px 0;color:#111;">${r.finalScore.toFixed(1)}<span style="font-size:24px;color:#999;"> / 8.0</span></div>
    <div style="font-size:22px;font-weight:700;color:#111;">${escapeHtml(r.tierHeadline)}</div>
    <div style="font-size:14px;color:#666;">Operating at Level ${r.highestPassedLevel || 0} -- ${escapeHtml(r.levelLabel)}</div>
  </div>

  <p style="line-height:1.6;color:#444;">Hi ${escapeHtml((name || '').split(' ')[0])},</p>
  <p style="line-height:1.6;color:#444;">${escapeHtml(r.tierBody)}</p>

  ${capLine}

  <h3 style="margin:28px 0 12px 0;color:#111;font-size:18px;">Per-Level Breakdown</h3>
  <table style="width:100%;border-collapse:collapse;font-size:14px;">${levelRows}</table>

  <h3 style="margin:28px 0 12px 0;color:#111;font-size:18px;">Your Roadmap</h3>
  <ol style="padding:0;margin:0;list-style:none;">${roadmapItems}</ol>

  <div style="margin-top:32px;padding:24px;background:#f3f0ff;border-radius:8px;text-align:center;">
    <h3 style="margin:0 0 8px 0;color:#111;">Want to climb faster?</h3>
    <p style="margin:0 0 16px 0;color:#555;font-size:14px;line-height:1.5;">OTP is the coordination layer between agentic teams. Pull patterns from publishers ahead of you. Publish your own to leave a trail.</p>
    <a href="https://orgtp.com/sign-up" style="display:inline-block;padding:12px 24px;background:#6b46c1;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">Create your free OTP account</a>
    <p style="margin:14px 0 0 0;font-size:12px;color:#888;">Or <a href="https://orgtp.com/start-here" style="color:#6b46c1;">book a 30-min walkthrough with David</a></p>
  </div>

  <p style="margin-top:32px;color:#999;font-size:12px;line-height:1.5;text-align:center;">
    -- David Steel, OTP<br/>
    <a href="https://orgtp.com" style="color:#6b46c1;">orgtp.com</a>
  </p>
</body></html>`;
}

function escapeHtml(s: string): string {
  return String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}
