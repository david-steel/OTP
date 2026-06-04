import type { FastifyInstance } from 'fastify';
import ejs from 'ejs';
import { fileURLToPath } from 'node:url';
import { getAuth } from '@clerk/fastify';
import { eq, and, desc, asc, sql, inArray, or } from 'drizzle-orm';
import { db } from '../../config/database.js';
import { organizations, oosFiles, claims, claimSimilarities, apiKeys, bestPractices, oosBestPracticeMatches, consultantProfiles, practiceVotes, newsletterSubscribers, oosOperatingPlans, oosOperatingPlanSections, oosExecutionItems, meetings, rocks, todos, tickets, kpis, kpiValues, partnerSignups, improvements, orgMembers, teams, teamMemberships, meetingHeadlines, managerAgents, seatResponsibilities, seatFitReviews, orgValues, valueReviews, onboardingSequence } from '../../db/schema.js';
import { hasOrgWideView, canEditOrgSettings, capabilitiesFor, canIntegrate } from '../../middleware/permissions.js';
import type { Role } from '../../services/membership.js';
import { getOrgsForUser } from '../../services/membership.js';
import { isNull, isNotNull } from 'drizzle-orm';
import { computeDiff } from '../../services/diff-engine.js';
import { generateMergePreview } from '../../services/merge-preview.js';
import type { ParsedClaim } from '../../shared/types.js';
import { renderDescription } from '../../shared/markdown-lite.js';
import { AGENTIC_LEVEL_LABELS } from '../../shared/enums.js';
import { validateUuidParam } from '../../shared/param-validation.js';
import { currentPeriod } from '../../shared/period.js';
import { annotateOosStaleness } from '../../services/oos-staleness.js';
import { listConatusPosts, getConatusPost } from '../../services/conatus-posts.js';
import { getOrgTeamGraph, computeAgentComparisonPairs } from '../../services/team-graph.js';
import { reportsSubtree } from '../../services/chart-permissions.js';
import { ruleToLabel, RECURRENCE_OPTIONS } from '../../services/meeting-recurrence.js';
import { resolveOrgForUser, acceptInvite, MembershipError } from '../../services/membership.js';
import { calculateCheckup, QUESTIONS as CHECKUP_QUESTIONS, LEVEL_LABELS as CHECKUP_LEVEL_LABELS } from '../../services/checkup-scoring.js';
import { sendEmail } from '../../config/email.js';
import { createHash } from 'crypto';
import { aeoClusters } from '../../data/aeo-clusters.js';
import { isAttendee } from '../../services/meeting-access.js';
import { useScorecardSnapshot, belongsToMeetingTeam } from '../../services/meeting-snapshot.js';

function toParsedClaim(c: any): ParsedClaim {
  return { claimId: c.claimId, section: c.section, displayOrder: c.displayOrder, rule: c.rule, why: c.why, failureMode: c.failureMode, confidence: c.confidence, evidence: c.evidence, scope: c.scope };
}

const BASE_URL = 'https://orgtp.com';

function bc(...items: Array<{ name: string; url: string }>) {
  return [{ name: 'Home', url: BASE_URL + '/' }, ...items];
}

// Calendar-quarter label for OOS execution items: 'Q1-2026', 'Q2-2026', etc.
export function quarterLabel(d: Date): string {
  const q = Math.floor(d.getMonth() / 3) + 1;
  return `Q${q}-${d.getFullYear()}`;
}

// Resolve the requesting user's org. Team-member path first (org_members
// populated by guards middleware), then legacy founder fallback where the
// user's clerk_user_id is stored as organizations.clerk_org_id. Returns
// null when neither hits. Lifted out of pageRoutes() so section modules
// (sections/dashboard.ts) can import it.
export async function resolveRequestOrg(request: any) {
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

// Threads Clerk env (publishable key + frontend instance domain) into the
// v7 layout so opt-in pages (loadClerk:true) can mount Clerk widgets without
// falling back to main.ejs. Mirrors how server.ts:162-164 derives these.
const V7_CLERK_PUB_KEY = process.env.CLERK_PUBLISHABLE_KEY || '';
const V7_CLERK_INSTANCE = V7_CLERK_PUB_KEY.startsWith('pk_')
  ? Buffer.from(V7_CLERK_PUB_KEY.split('_').slice(2).join('_'), 'base64').toString().replace(/\$$/, '')
  : '';

// Per-deploy cache-buster for /public/* (served immutable/1yr). Commit SHA when
// Railway provides it, else a per-boot token (new container per deploy => new
// token). Computed ONCE at module load. Without this, every v7 page emitted
// ?v=dev and assets froze forever under the immutable cache -- the recurring
// "my image/CSS didn't update" bug. Mirrors _shared.ts and server.ts.
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

export default async function pageRoutes(app: FastifyInstance) {

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
  app.get('/', async (_request, reply) => {
    return renderV7(reply, 'home-v8', {
      title: 'OTP - Run your company with people and AI agents',
      description: 'OTP is the operating system for teams of people and AI agents. One chart, one scoreboard, one weekly meeting - built on the EOS you already run. Your whole team is free; you only pay for the agents.',
      canonical: BASE_URL + '/',
      ogImage: BASE_URL + '/public/images/og-otp-home-v2.png',
      jsonLd: { '@context': 'https://schema.org', '@type': 'WebSite', name: 'OTP', url: BASE_URL + '/', description: 'The operating system for teams of people and AI agents.' },
    });
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
    if (!id) return renderV7(reply.status(404), '404', { title: 'Page Not Found - OTP', noindex: true });
    const [oosFile] = await db.select().from(oosFiles).where(eq(oosFiles.id, id)).limit(1);
    if (!oosFile) return renderV7(reply.status(404), '404', { title: 'Page Not Found - OTP', noindex: true });

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
    if (!idA || !idB) return renderV7(reply.status(404), '404', { title: 'Page Not Found - OTP', noindex: true });
    const [oosA] = await db.select().from(oosFiles).where(eq(oosFiles.id, idA)).limit(1);
    const [oosB] = await db.select().from(oosFiles).where(eq(oosFiles.id, idB)).limit(1);
    if (!oosA || !oosB) return renderV7(reply.status(404), '404', { title: 'Page Not Found - OTP', noindex: true });

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
    if (!sourceId || !targetId) return renderV7(reply.status(404), '404', { title: 'Page Not Found - OTP', noindex: true });
    const [sourceOos] = await db.select().from(oosFiles).where(eq(oosFiles.id, sourceId)).limit(1);
    const [targetOos] = await db.select().from(oosFiles).where(eq(oosFiles.id, targetId)).limit(1);
    if (!sourceOos || !targetOos) return renderV7(reply.status(404), '404', { title: 'Page Not Found - OTP', noindex: true });

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
    if (!id) return renderV7(reply.status(404), '404', { title: 'Page Not Found - OTP', noindex: true });
    const [org] = await db.select().from(organizations).where(eq(organizations.id, id)).limit(1);
    if (!org) return renderV7(reply.status(404), '404', { title: 'Page Not Found - OTP', noindex: true });

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

  // /import/ninety -- Ninety.io migration tool. Drop exports, see the chart
  // rebuilt from owner columns. Write-free preview (increment 1); the commit
  // step is authed and lives behind sign-up.
  app.get('/import/ninety', async (_request, reply) => {
    return renderV7(reply, 'import-ninety', {
      title: 'Import your Ninety data into OTP - Switch from Ninety',
      description: 'Export your Rocks, To-Dos, Issues, Headlines, and Scorecard from Ninety and drop them in. OTP rebuilds your accountability chart from who owns what, then you seat your AI agents. Free preview, nothing stored.',
      canonical: BASE_URL + '/import/ninety',
      navVariant: 'minimal',
      // Sign-in from this page must return HERE, not dump the user on
      // /dashboard. The sign-in page reads ?redirect and (for already-signed-in
      // users) bounces straight back, so a logged-in visitor round-trips to the
      // importer instead of landing on their daily.
      navAltLabel: 'Sign in',
      navAltHref: '/sign-in?redirect=' + encodeURIComponent('/import/ninety'),
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Import your Ninety data into OTP',
        description: 'Migrate from Ninety.io to OTP. Drop your Ninety exports and OTP reconstructs your accountability chart from the owners of your Rocks, KPIs, and Issues.',
        url: BASE_URL + '/import/ninety',
      },
    });
  });

  // /import/bloom -- SECONDARY migration tool (Bloom Growth). Same source-agnostic
  // engine + view as /import/ninety, passed Bloom-specific copy + the neutral
  // /import/eos/* endpoints. Intentionally not pushed front-and-center.
  app.get('/import/bloom', async (_request, reply) => {
    return renderV7(reply, 'import-ninety', {
      title: 'Import your Bloom Growth data into OTP - Switch from Bloom',
      description: 'Export your Rocks, To-Dos, Issues, Headlines, and Scorecard from Bloom Growth, unzip, and drop the CSVs in. OTP rebuilds your accountability chart from who owns what, then you seat your AI agents. Free preview, nothing stored.',
      canonical: BASE_URL + '/import/bloom',
      navVariant: 'minimal',
      navAltLabel: 'Sign in',
      navAltHref: '/sign-in?redirect=' + encodeURIComponent('/import/bloom'),
      importSource: {
        tool: 'Bloom Growth',
        previewUrl: '/api/v1/import/eos/preview',
        commitUrl: '/api/v1/import/eos/commit',
        returnPath: '/import/bloom',
        accept: '.csv,.xlsx,.xls',
        fileHint: 'The CSV files from your unzipped Bloom export',
        helpUrl: 'https://help.bloomgrowth.com/en/exporting-data',
        steps: [
          'In Bloom Growth, open a meeting, click the three dots, and choose <b>Export All</b> (hold <b>Shift</b> while hovering it to include notes). Repeat per meeting; a 5-minute wait applies between exports.',
          'Bloom downloads a <b>ZIP</b>. Unzip it and drop the CSVs inside: <b>Quarterly Priorities (Goals)</b>, <b>To-Dos</b>, <b>O&amp;O (Issues)</b>, <b>KPI (Metrics)</b>, and <b>Headlines</b>.',
          '<b>Export before you cancel Bloom.</b> Pull your data while the subscription is still active.',
        ],
        cross: { href: '/import/ninety', label: 'On Ninety instead? Import from Ninety' },
      },
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Import your Bloom Growth data into OTP',
        description: 'Migrate from Bloom Growth to OTP. Drop your Bloom CSV exports and OTP reconstructs your accountability chart from the owners of your Rocks, KPIs, and Issues.',
        url: BASE_URL + '/import/bloom',
      },
    });
  });

  // /otp-vs-ninety-eos-one -- bottom-funnel comparison page. Concede Stage-1
  // EOS parity, win on agents-as-employees + humans-free/agents-paid pricing.
  app.get('/otp-vs-ninety-eos-one', async (_request, reply) => {
    return renderV7(reply, 'otp-vs-ninety-eos-one', {
      title: 'OTP vs Ninety vs EOS One - Run the Same EOS, Plus a Workforce',
      description: 'Ninety and EOS One are EOS software. OTP runs the same EOS and lets AI agents take real seats with real KPIs and real work. Your whole team is free; you only pay for agents. See the side-by-side.',
      canonical: BASE_URL + '/otp-vs-ninety-eos-one',
      ogImage: BASE_URL + '/public/images/og-otp-home-v2.png',
      breadcrumbs: bc({ name: 'OTP vs Ninety vs EOS One', url: BASE_URL + '/otp-vs-ninety-eos-one' }),
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'OTP vs Ninety vs EOS One',
        description: 'Side-by-side: OTP vs Ninety vs EOS One. Humans free, agents paid; agents take seats with KPIs and do the work.',
        url: BASE_URL + '/otp-vs-ninety-eos-one',
      },
    });
  });

  // /free-agents -- Step 2 of the funnel: the free starter agents (.md files).
  app.get('/free-agents', async (_request, reply) => {
    return renderV7(reply, 'free-agents', {
      title: 'Free AI Agents for Your Team - OTP',
      description: 'Five battle-tested AI agents - Radar, Dan, Pepper, Dash, Tally. Download one, drop it into Claude Code, and it sets itself up with you. Free with an OTP account.',
      canonical: BASE_URL + '/free-agents',
      ogImage: BASE_URL + '/public/images/og-otp-home-v2.png',
      breadcrumbs: bc({ name: 'Free Agents', url: BASE_URL + '/free-agents' }),
      jsonLd: { '@context': 'https://schema.org', '@type': 'WebPage', name: 'Free AI Agents for Your Team', description: 'Five free AI agents you can download and run.', url: BASE_URL + '/free-agents' },
    });
  });

  // Gated download: the .md agent files live in content/free-agents/ (outside
  // /public), so the only way to get one is signed in. Unauth -> sign-up, return here.
  app.get<{ Params: { slug: string } }>('/free-agents/:slug/download', async (request, reply) => {
    const SLUGS = ['radar', 'dan', 'pepper', 'dash', 'tally'];
    const slug = request.params.slug;
    if (!SLUGS.includes(slug)) return reply.status(404).send('Unknown agent');
    const auth = getAuth(request);
    if (!auth.userId) {
      return reply.redirect('/sign-up?redirect_url=' + encodeURIComponent('/free-agents/' + slug + '/download'));
    }
    try {
      const { readFile } = await import('node:fs/promises');
      const p = fileURLToPath(new URL('../../../content/free-agents/' + slug + '.md', import.meta.url));
      const md = await readFile(p, 'utf8');
      reply.header('Content-Type', 'text/markdown; charset=utf-8');
      reply.header('Content-Disposition', 'attachment; filename="' + slug + '.md"');
      return reply.send(md);
    } catch {
      return reply.status(404).send('Agent file not found');
    }
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

  // Lifecycle email previews. Renders any rung of the 90-day series live, so the
  // Google Sheet registry can deep-link to the real (always-current) email.
  // Public + noindex; the content is marketing copy that gets sent anyway.
  // /email-preview        -> index of all rungs
  // /email-preview/07     -> rung 7 (?name=Alex to customize the greeting)
  // /email-preview/re     -> the inactivity re-engagement email
  app.get<{ Querystring: { name?: string } }>('/email-preview', async (_request, reply) => {
    const { EMAILS, REENGAGE } = await import('../../data/email-series.js');
    const rows = [...EMAILS, REENGAGE].map(e => {
      const id = e.n === REENGAGE.n ? 're' : String(e.n).padStart(2, '0');
      return `<tr><td style="padding:6px 10px;color:#888;font-weight:700;">${id}</td>`
        + `<td style="padding:6px 10px;color:#888;">D${e.day}</td>`
        + `<td style="padding:6px 10px;"><a href="/email-preview/${id}" style="color:#5a7d1f;font-weight:600;">${e.subject}</a></td>`
        + `<td style="padding:6px 10px;color:#888;">${e.cta.label}</td></tr>`;
    }).join('');
    reply.header('X-Robots-Tag', 'noindex').type('text/html').send(
      `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>OTP Lifecycle Email Previews</title>`
      + `<style>body{font-family:-apple-system,sans-serif;background:#F5F7FA;color:#1a2e05;max-width:820px;margin:0 auto;padding:32px}`
      + `table{border-collapse:collapse;width:100%;background:#fff;border-radius:10px;overflow:hidden;font-size:14px}`
      + `td{border-bottom:1px solid #eee}h1{font-size:24px}</style></head><body>`
      + `<h1>OTP 90-Day Email Series</h1><p>${EMAILS.length} lifecycle emails + 1 re-engagement. Click any subject to preview the live render.</p>`
      + `<table>${rows}</table></body></html>`);
  });

  app.get<{ Params: { id: string }; Querystring: { name?: string } }>('/email-preview/:id', async (request, reply) => {
    const { EMAILS, REENGAGE } = await import('../../data/email-series.js');
    const { renderLifecycleEmail } = await import('../../services/lifecycle-email.js');
    const id = (request.params.id || '').toLowerCase();
    const name = request.query.name || 'Alex';
    const e = (id === 're' || id === 'reengage')
      ? REENGAGE
      : EMAILS.find(x => Number(x.n) === parseInt(id, 10));
    if (!e) return renderV7(reply.status(404), '404', { title: 'Page Not Found - OTP', noindex: true });
    const html = renderLifecycleEmail(e, name, 'you@example.com');
    return reply.header('X-Robots-Tag', 'noindex').type('text/html').send(html);
  });

  // Super Admin Dashboard
  app.get('/admin', async (request, reply) => {
    const isAdmin = (request as any).isSuperAdmin;
    if (!isAdmin) return renderV7(reply.status(404), '404', { title: 'Page Not Found - OTP', noindex: true });

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
    if (!isAdmin) return renderV7(reply.status(404), '404', { title: 'Page Not Found - OTP', noindex: true });

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
    if (!isAdmin) return renderV7(reply.status(404), '404', { title: 'Page Not Found - OTP', noindex: true });

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

  // ---------- /admin/health -- Clerk webhook + funnel health audit ----------
  // Cross-references the live Clerk user list against the OTP DB to answer:
  //   - Is the Clerk user.created webhook reliably writing
  //     onboarding_sequence rows? (webhook gap %)
  //   - How many signups completed onboarding step 1?
  //   - How many stranded users are sitting in Clerk with no DB footprint?
  //   - Which of those are bot-likely vs human-likely?
  // Super-admin only. Built 2026-05-22 after David flagged two stranded
  // bot-likely users and asked how widespread the pattern is.
  app.get('/admin/health', async (request, reply) => {
    if (!(request as any).isSuperAdmin) {
      return renderV7(reply.status(404), '404', { title: 'Page Not Found - OTP', noindex: true });
    }

    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      return renderV7(reply.status(500), 'admin-health', {
        title: 'Health -- Admin', noindex: true,
        error: 'CLERK_SECRET_KEY missing from env',
      });
    }

    const { createClerkClient } = await import('@clerk/backend');
    const clerk = createClerkClient({ secretKey });

    // Pull all Clerk users (Clerk caps at 500/page, so page through).
    const clerkUsers: any[] = [];
    let offset = 0;
    const PAGE = 500;
    while (true) {
      const { data } = await clerk.users.getUserList({ limit: PAGE, offset, orderBy: '-created_at' });
      clerkUsers.push(...data);
      if (data.length < PAGE) break;
      offset += PAGE;
      if (offset >= 5000) break; // safety cap
    }

    // Batch-query the DB for membership / onboarding / founder presence.
    // One query each, returning a Set of clerk_user_ids -- avoids N+1.
    // Uses Drizzle's typed inArray() helper because raw `sql.ANY(${arr})`
    // doesn't bind a JS array as a Postgres array -- it expands to a
    // comma list of placeholders, which ANY() rejects with code 42809
    // "op ANY/ALL (array) requires array on right side". inArray()
    // handles the array binding correctly.
    const clerkIds = clerkUsers.map(u => u.id);
    let hasOnbSeqIds = new Set<string>();
    let hasMembershipIds = new Set<string>();
    let hasFounderOrgIds = new Set<string>();
    if (clerkIds.length > 0) {
      const onbRows = await db
        .select({ clerkUserId: onboardingSequence.clerkUserId })
        .from(onboardingSequence)
        .where(inArray(onboardingSequence.clerkUserId, clerkIds));
      hasOnbSeqIds = new Set(onbRows.map(r => r.clerkUserId));

      const memRows = await db
        .selectDistinct({ clerkUserId: orgMembers.clerkUserId })
        .from(orgMembers)
        .where(inArray(orgMembers.clerkUserId, clerkIds));
      hasMembershipIds = new Set(memRows.map(r => r.clerkUserId));

      const orgRows = await db
        .selectDistinct({ clerkOrgId: organizations.clerkOrgId })
        .from(organizations)
        .where(inArray(organizations.clerkOrgId, clerkIds));
      hasFounderOrgIds = new Set(orgRows.map(r => r.clerkOrgId).filter((v): v is string => !!v));
    }

    function isBottyEmail(email: string | null): boolean {
      if (!email) return false;
      const local = email.split('@')[0] || '';
      const half = Math.floor(local.length / 2);
      const isDoubled = half >= 3 && local.slice(0, half) === local.slice(half, half * 2);
      const digitCount = (local.match(/\d/g) || []).length;
      const digitsHeavy = local.length > 0 && digitCount / local.length > 0.5;
      const digitPrefix = /^\d{4,}/.test(local);
      return isDoubled || digitsHeavy || digitPrefix;
    }

    // Classify each user.
    const enriched = clerkUsers.map(u => {
      const email = u.emailAddresses.find((e: any) => e.id === u.primaryEmailAddressId)?.emailAddress
        || u.emailAddresses[0]?.emailAddress || null;
      const hasOnb = hasOnbSeqIds.has(u.id);
      const hasOrg = hasMembershipIds.has(u.id) || hasFounderOrgIds.has(u.id);
      const stranded = !hasOrg;
      const botty = isBottyEmail(email);
      return {
        id: u.id,
        email,
        name: [u.firstName, u.lastName].filter(Boolean).join(' ') || null,
        createdAt: u.createdAt,
        lastSignInAt: u.lastSignInAt,
        hasOnb,
        hasOrg,
        stranded,
        botty,
      };
    });

    const total = enriched.length;
    const onbHits = enriched.filter(u => u.hasOnb).length;
    const onbMisses = total - onbHits;
    const completedOnboarding = enriched.filter(u => u.hasOrg).length;
    const stranded = enriched.filter(u => u.stranded);
    const strandedBotty = stranded.filter(u => u.botty);
    const strandedHumanLikely = stranded.filter(u => !u.botty);

    // Most-recent 20 stranded users for the table at the bottom.
    const recentStranded = stranded
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      .slice(0, 20);

    // ---- Email-send health -------------------------------------------------
    // Surfaces the silently-swallowed render/send failures that hid the
    // missing-template bug for weeks (both onboarding and re-engagement
    // catch-and-return-false on a failed send, leaving no loud signal).
    //
    // Two red flags, both designed to reflect CURRENT health, not stale
    // residue:
    //   (1) onbStuck -- a real (non-internal) signup from the last 72h, past
    //       the 1h grace, whose welcome (#1) never sent. A live-regression
    //       detector; the historical pre-fix backlog (signups we route to
    //       re-engagement, so email #1 stays null forever) is excluded so the
    //       alert does not cry wolf -- that residue shows only in the all-time
    //       "welcome sent X/Y" context stat.
    //   (2) reFailUnresolved -- re-engagement failures that occurred AFTER the
    //       most recent SUCCESSFUL send. If the last activity succeeded, the
    //       run is healthy regardless of earlier failures, so a fixed-then-
    //       successful day reads green. Only a failure newer than the last
    //       success (or failures with no success at all) trips red.
    // Either usually means mail is dying quietly -- templates absent from
    // dist, or a bad Resend key / unverified from-domain.
    const scalar = async (q: any): Promise<number> => Number(((await db.execute(q)).rows[0] as any)?.n ?? 0);
    const lastSentRow = (await db.execute(sql`SELECT max(sent_at) AS m FROM user_engagement_log WHERE send_status = 'sent'`)).rows[0] as any;
    const lastSentAt: Date | null = lastSentRow?.m ? new Date(lastSentRow.m) : null;
    const [onbStuck, onbE1Sent, onbTotal, reSent7, reFail7, reFailUnresolved, lifeTotal, lifeSent7, lifeSkipped] = await Promise.all([
      scalar(sql`SELECT count(*)::int AS n FROM onboarding_sequence
        WHERE email_1_sent_at IS NULL AND unsubscribed_at IS NULL
          AND signup_at < now() - interval '1 hour'
          AND signup_at > now() - interval '72 hours'
          AND email NOT ILIKE '%@sneeze.it' AND email NOT ILIKE '%@orgtp.com'
          AND email NOT ILIKE '%@acme.example' AND email NOT ILIKE '%@juicedboxes.com'`),
      scalar(sql`SELECT count(*)::int AS n FROM onboarding_sequence WHERE email_1_sent_at IS NOT NULL`),
      scalar(sql`SELECT count(*)::int AS n FROM onboarding_sequence`),
      scalar(sql`SELECT count(*)::int AS n FROM user_engagement_log WHERE send_status = 'sent' AND sent_at > now() - interval '7 days'`),
      scalar(sql`SELECT count(*)::int AS n FROM user_engagement_log WHERE send_status = 'failed' AND sent_at > now() - interval '7 days'`),
      scalar(lastSentAt
        ? sql`SELECT count(*)::int AS n FROM user_engagement_log WHERE send_status = 'failed' AND sent_at > ${lastSentAt.toISOString()}`
        : sql`SELECT count(*)::int AS n FROM user_engagement_log WHERE send_status = 'failed'`),
      // 90-day lifecycle outreach series. Counts ACTUAL sends (skipped=false);
      // stays 0 while the scheduler is in DRY-RUN, which is the honest signal.
      scalar(sql`SELECT count(*)::int AS n FROM lifecycle_sends WHERE skipped = false`),
      scalar(sql`SELECT count(*)::int AS n FROM lifecycle_sends WHERE skipped = false AND sent_at > now() - interval '7 days'`),
      scalar(sql`SELECT count(*)::int AS n FROM lifecycle_sends WHERE skipped = true`),
    ]);
    const reFailRows = (await db.execute(sql`
      SELECT user_email, template_key, send_error, sent_at
      FROM user_engagement_log WHERE send_status = 'failed'
      ORDER BY sent_at DESC LIMIT 5`)).rows as any[];
    const emailHealth = {
      onbStuck, onbE1Sent, onbTotal, reSent7, reFail7, reFailUnresolved,
      lifeTotal, lifeSent7, lifeSkipped,
      lastSentAt,
      recentFailures: reFailRows.map(r => ({
        email: r.user_email as string,
        template: r.template_key as string,
        error: (r.send_error as string | null) || '(no detail)',
        at: r.sent_at as Date,
      })),
    };

    return renderV7(reply, 'admin-health', {
      title: 'Health -- Admin',
      noindex: true,
      emailHealth,
      counts: {
        total,
        onbHits,
        onbMisses,
        completedOnboarding,
        stranded: stranded.length,
        strandedBotty: strandedBotty.length,
        strandedHumanLikely: strandedHumanLikely.length,
      },
      recentStranded,
    });
  });

  // ---------- Super-admin impersonation ----------
  // POST /admin/impersonate/:memberId  -- start "view as" session
  // POST /admin/impersonate/exit        -- clear cookie + audit log
  app.post<{ Params: { memberId: string } }>('/admin/impersonate/:memberId', async (request, reply) => {
    if (!(request as any).isSuperAdmin) {
      return renderV7(reply.status(404), '404', { title: 'Page Not Found - OTP', noindex: true });
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

  // GET /admin/view-as/:email -- one-click "switch my workspace" for demos.
  // Finds the org member with that email (owner preferred) and starts
  // impersonation, landing on their dashboard. Bookmarkable:
  //   /admin/view-as/wile@acme.example          (Acme demo)
  //   /admin/view-as/dawson@juicedboxes.com     (Dawson)
  // Access: super-admins may view as anyone; an allow-listed demo presenter
  // (Dawson, see middleware/demo-access.ts) may view as a canned demo org
  // (Acme) ONLY -- never a real customer.
  app.get<{ Params: { email: string } }>('/admin/view-as/:email', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) return reply.status(401).send({ error: 'AUTH_REQUIRED' });

    const isAdmin = !!(request as any).isSuperAdmin;
    const { isDemoPresenterEmail, isDemoTargetOrg } = await import('../../middleware/demo-access.js');

    // The caller's real identity (independent of any active impersonation).
    const [caller] = await db.select({ email: orgMembers.email })
      .from(orgMembers).where(eq(orgMembers.clerkUserId, auth.userId)).limit(1);
    const isPresenter = isDemoPresenterEmail(caller?.email);

    if (!isAdmin && !isPresenter) {
      return renderV7(reply.status(404), '404', { title: 'Page Not Found - OTP', noindex: true });
    }

    const email = decodeURIComponent(request.params.email || '').trim().toLowerCase();
    if (!email) return reply.status(400).send({ error: 'email required' });

    const matches = await db.select().from(orgMembers)
      .where(sql`lower(${orgMembers.email}) = ${email}`);
    if (!matches.length) return reply.status(404).send({ error: 'No member found with email ' + email });
    // Prefer an owner seat if several rows share the email.
    const target = matches.find((m: any) => m.role === 'owner') || matches[0];

    // Demo presenters are confined to demo orgs. Resolve the target's org and
    // bounce anything that is not a canned demo org.
    if (!isAdmin) {
      const [targetOrg] = await db.select({ clerkOrgId: organizations.clerkOrgId })
        .from(organizations).where(eq(organizations.id, (target as any).orgId)).limit(1);
      if (!isDemoTargetOrg(targetOrg?.clerkOrgId)) {
        return renderV7(reply.status(404), '404', { title: 'Page Not Found - OTP', noindex: true });
      }
    }

    const { startImpersonation, IMPERSONATION_COOKIE_NAME } = await import('../../middleware/impersonation.js');
    try {
      const started = await startImpersonation({ byClerkUserId: auth.userId, targetMemberId: (target as any).id });
      reply.setCookie(IMPERSONATION_COOKIE_NAME, started.cookieValue, {
        httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production',
        maxAge: started.cookieMaxAgeSec, path: '/',
      });
      return reply.redirect('/dashboard');
    } catch (e: any) {
      return reply.status(400).send({ error: String(e?.message || 'Impersonation failed') });
    }
  });

  // POST /admin/impersonate/by-clerk/:clerkUserId  -- resolve member by Clerk
  // user id, then start impersonation. Convenience for /admin users table
  // which doesn't already have member ids on hand.
  app.post<{ Params: { clerkUserId: string } }>('/admin/impersonate/by-clerk/:clerkUserId', async (request, reply) => {
    if (!(request as any).isSuperAdmin) {
      return renderV7(reply.status(404), '404', { title: 'Page Not Found - OTP', noindex: true });
    }
    const auth = getAuth(request);
    if (!auth.userId) return reply.status(401).send({ error: 'AUTH_REQUIRED' });

    const targetClerkId = request.params.clerkUserId;
    if (!/^[A-Za-z0-9_]{10,80}$/.test(targetClerkId)) {
      return reply.status(400).send({ error: 'INVALID_CLERK_USER_ID' });
    }
    // Primary path: modern membership table.
    let [m] = await db.select().from(orgMembers)
      .where(eq(orgMembers.clerkUserId, targetClerkId))
      .limit(1);

    // Legacy founder fallback: pre-membership-table founders stored their
    // Clerk user id directly on organizations.clerk_org_id. Find the org
    // they own and then resolve to the implicit owner member row (if any
    // was backfilled). Without this, the admin viewer 404s legitimate
    // founder accounts who predate the org_members migration.
    if (!m) {
      const [legacy] = await db.select().from(organizations)
        .where(eq(organizations.clerkOrgId, targetClerkId))
        .limit(1);
      if (legacy) {
        const [fm] = await db.select().from(orgMembers)
          .where(and(eq(orgMembers.orgId, legacy.id), eq(orgMembers.role, 'owner')))
          .limit(1);
        if (fm) m = fm;
      }
    }

    // Truly stranded: Clerk user with no membership, no founder org. Render
    // a v7 admin diagnostic page instead of the old NO_MEMBER_ROW JSON
    // error. Pulls best-effort Clerk metadata + DB footprint to help the
    // admin decide bot-vs-real and what to do next. Caught 2026-05-22 by
    // David hitting /admin -> view-as on two bot-likely Clerk signups.
    if (!m) {
      let clerkEmail: string | null = null;
      let clerkName: string | null = null;
      let signedUpAt: number | null = null;
      let lastSignInAt: number | null = null;
      try {
        const secretKey = process.env.CLERK_SECRET_KEY;
        if (secretKey) {
          const { createClerkClient } = await import('@clerk/backend');
          const clerk = createClerkClient({ secretKey });
          const u = await clerk.users.getUser(targetClerkId);
          clerkEmail = u.emailAddresses.find(e => e.id === u.primaryEmailAddressId)?.emailAddress
            || u.emailAddresses[0]?.emailAddress || null;
          clerkName = [u.firstName, u.lastName].filter(Boolean).join(' ') || null;
          signedUpAt = u.createdAt;
          lastSignInAt = u.lastSignInAt ?? null;
        }
      } catch { /* Clerk lookup failed -- still render the diagnostic page */ }

      const onbRes = await db.execute(sql`
        SELECT 1 FROM onboarding_sequence WHERE clerk_user_id = ${targetClerkId} LIMIT 1
      `) as any;
      const hasOnbSequence = (onbRes.rows || []).length > 0;

      let inviteCount = 0;
      if (clerkEmail) {
        const invRes = await db.execute(sql`
          SELECT COUNT(*)::int AS n FROM org_invitations WHERE LOWER(email) = LOWER(${clerkEmail})
        `) as any;
        inviteCount = Number(invRes.rows[0]?.n || 0);
      }

      // Heuristic bot signal -- mirror the script logic so the page's
      // recommendation matches what scripts/investigate-stranded-users-db.ts
      // would produce.
      const local = clerkEmail ? (clerkEmail.split('@')[0] || '') : '';
      const half = Math.floor(local.length / 2);
      const isDoubled = half >= 3 && local.slice(0, half) === local.slice(half, half * 2);
      const digitCount = (local.match(/\d/g) || []).length;
      const digitsHeavy = local.length > 0 && digitCount / local.length > 0.5;
      const emailLooksBotty = isDoubled || digitsHeavy || /^\d{4,}/.test(local);

      return renderV7(reply.status(200), 'admin-stranded-user', {
        title: 'Stranded user - OTP Admin',
        noindex: true,
        clerkUserId: targetClerkId,
        email: clerkEmail,
        name: clerkName,
        signedUpAt,
        lastSignInAt,
        hasOnbSequence,
        inviteCount,
        emailLooksBotty,
      });
    }

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
    if (!isAdmin) return renderV7(reply.status(404), '404', { title: 'Page Not Found - OTP', noindex: true });

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
    if (!isAdmin) return renderV7(reply.status(404), '404', { title: 'Page Not Found - OTP', noindex: true });

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

  // Sign-up page -- v7-styled landing that mounts the Clerk SignUp widget.
  // Stripped to: hero, form, "What happens next" sidebar, minimal [OTP] +
  // Sign in nav. Nothing else. David's call 2026-05-21: "every pixel below
  // the form that isn't pushing the user back to the form is bloat." That
  // killed the founding-50 counter, the latest-publisher proof row, and
  // the founder signature lockup. See
  // feedback_only_form_helping_pixels_on_conversion_pages.md.
  app.get('/sign-up', async (_request, reply) => {
    return renderV7(reply, 'sign-up', {
      title: 'Create your free OTP workspace',
      description: 'The free operating platform for EOS® teams. Run your 1:1s, weekly Level 10®, org chart, and a lot more on OTP. Free for your team, forever.',
      canonical: BASE_URL + '/sign-up',
      noindex: true,
      loadClerk: true,
      googleAdsId: 'AW-18159119434',
      // Conversion-page nav + footer: [OTP] logo + Sign in only. Strips
      // the 6 nav exit links (Protocol/Pricing/Browse/What's New/Get
      // started) and the 5 footer exit links (Protocol/Pricing/Browse/
      // Blog/About). One funnel, no distractions. Trademark and
      // independence disclaimers stay in the minimal footer.
      navVariant: 'minimal',
      footerVariant: 'minimal',
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
    if (!profile) return renderV7(reply.status(404), '404', { title: 'Expert Not Found - OTP' });

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
    if (!profile) return renderV7(reply.status(404), '404', { title: 'Expert Not Found - OTP' });

    return renderV7(reply, 'expert-contact', {
      title: 'Contact ' + profile.display_name + ' - OTP',
      description: 'Send an inquiry to ' + profile.display_name + ', an AI coordination expert on OTP.',
      canonical: BASE_URL + '/expert/' + slug + '/contact',
      profile,
    });
  });

  // Dashboard: Team org chart (live derivation from latest draft or published OOS)
  // ---------- Members page (admin invite UX) ----------
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
  // Sign in -- v7-styled returning-user landing. Same minimal-nav +
  // brand-themed Clerk pattern as /sign-up, plus a "What's New" sidebar
  // pulling the latest changelog entry so returning users see motion
  // ("oh, OTP shipped X this week") instead of a thin form-only page.
  // Description copy updated 2026-05-21 -- old "publish OOS files,
  // explore best practices" framing contradicted the locked operator
  // positioning (project_otp_positioning_wedge memory).
  app.get('/sign-in', async (_request, reply) => {
    // changelog is reverse-chronological, so [0] is the latest entry.
    // Same data source the /whats-new page reads from -- single source
    // of truth, auto-updates here when product ships.
    const { changelog } = await import('../../data/changelog.js');
    const latestUpdate = changelog[0] || null;
    return renderV7(reply, 'sign-in', {
      title: 'Sign in - OTP',
      description: 'Sign in to OTP, the operating platform where your people and AI agents run as one team.',
      canonical: BASE_URL + '/sign-in',
      noindex: true,
      loadClerk: true,
      // Conversion-page nav: [OTP] logo + Create account (sends new users
      // to /sign-up, since they're already on /sign-in). Strips Protocol/
      // Pricing/Browse/What's New/Get started in the nav and Protocol/
      // Pricing/Browse/Blog/About in the footer. One funnel.
      navVariant: 'minimal',
      footerVariant: 'minimal',
      navAltLabel: 'Create account',
      navAltHref: '/sign-up',
      latestUpdate,
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
    // Impersonation MUST win over the legacy-founder lookup (mirrors
    // getAuthOrg). Under "view as <user>" guards.ts sets request.orgMember to
    // the target; resolve to their org so the meeting page shows the
    // impersonated user's meetings, not the founder's. (2026-06-02)
    const _impL8 = (request as any).impersonation as { active?: boolean } | null;
    const _impMemberL8 = (request as any).orgMember as { orgId?: string } | null;
    if (_impL8?.active && _impMemberL8?.orgId) {
      const [impOrg] = await db.select().from(organizations).where(eq(organizations.id, _impMemberL8.orgId)).limit(1);
      if (impOrg) return impOrg;
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
  app.post<{ Body: { title?: string; scheduledAt?: string; meetingType?: string; teamId?: string; recurrenceRule?: string } }>('/l8/create', async (request, reply) => {
    const org = await l8ResolveOrg(request, reply);
    if (!org) return;
    const auth = getAuth(request);
    const { title, scheduledAt, meetingType, teamId, recurrenceRule } = request.body || {};
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
      recurrenceRule: (recurrenceRule || '').trim() || null,
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

    // Public preview branch for UNAUTHENTICATED requests (humans clicking a
    // shared meeting link AND link-unfurl bots: Slackbot, Twitterbot,
    // LinkedInBot, facebookexternalhit). Before 2026-05-26 these all hit
    // l8ResolveOrg which 302'd to /sign-in, and Slack/etc. unfurled the
    // sign-in page's marketing OG meta -- David shared a meeting link with
    // Kristen and the preview was "Sign in to OTP / Free in Beta" with the
    // monster mascot. That read as cold ad outreach, not "your 1:1." Fix:
    // when unauth, render pages/meeting-preview with meeting-specific title +
    // description + attendee names. Body never leaks agenda contents,
    // scorecard, rocks, ratings, segue, headlines, cascading message --
    // only public-safe fields: title, scheduledAt, attendee NAMES.
    let _authForPreview: { userId: string | null } = { userId: null };
    try { _authForPreview = { userId: getAuth(request).userId || null }; } catch { _authForPreview = { userId: null }; }
    if (!_authForPreview.userId) {
      const [previewMeeting] = await db.select({
        id: meetings.id,
        title: meetings.title,
        meetingType: meetings.meetingType,
        scheduledAt: meetings.scheduledAt,
        attendees: meetings.attendees,
      })
        .from(meetings)
        .where(and(eq(meetings.id, id), isNull(meetings.deletedAt)))
        .limit(1);

      const signInUrl = '/sign-in?redirect=' + encodeURIComponent(request.url);

      if (!previewMeeting) {
        return reply.status(404).view('pages/meeting-preview', {
          title: 'Meeting not found -- OTP',
          description: 'This meeting link is invalid or the meeting has been removed.',
          canonical: BASE_URL + request.url,
          noindex: true,
          notFound: true,
          meetingTitle: 'Meeting not found',
          dateLabel: '',
          timeLabel: '',
          attendeeNames: [],
          signInUrl,
        });
      }

      const attendeeNames = (Array.isArray(previewMeeting.attendees) ? previewMeeting.attendees as any[] : [])
        .map((a: any) => (a && typeof a === 'object' ? String(a.name || '') : ''))
        .filter((n: string) => n.length > 0);

      const scheduledAt = previewMeeting.scheduledAt instanceof Date
        ? previewMeeting.scheduledAt
        : new Date(previewMeeting.scheduledAt as any);
      const dateLabel = scheduledAt.toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/New_York',
      });
      const timeLabel = scheduledAt.toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York', timeZoneName: 'short',
      });

      const descParts: string[] = [dateLabel];
      if (attendeeNames.length > 0) descParts.push(attendeeNames.join(', '));
      const description = descParts.join(' · ');

      return reply.view('pages/meeting-preview', {
        title: previewMeeting.title + ' -- OTP',
        description,
        // Meeting-specific share card (Orgy meeting mascot, warm brand).
        // Without this, layouts/main falls back to the OLD dark
        // og-image.png ("Where Agents Learn to Work as a Team"), which is
        // what unfurled when David shared a meeting link in Slack 2026-06-04.
        // ?v= busts the immutable /public/* cache when the art is updated.
        ogImage: BASE_URL + '/public/images/og-meeting.png?v=1',
        canonical: BASE_URL + request.url,
        noindex: true,
        notFound: false,
        meetingTitle: previewMeeting.title,
        dateLabel,
        timeLabel,
        attendeeNames,
        signInUrl,
      });
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
      // The creator can always open a meeting they made. Without this, a
      // brand-new owner -- not yet on any team (the boot-time team backfill
      // hasn't run since signup), with a meeting auto-populated to an empty
      // attendee list -- gets 404'd from the meeting they just created
      // (reported 2026-06-02, Open Skies signup). Once past this gate the
      // lazy attendee-populate below adds + persists them, so it self-heals.
      const _creatorUserId = getAuth(request).userId;
      const isCreator = !!_creatorUserId && meeting.createdBy === _creatorUserId;
      const allowed = onTeam || isAttendee(fullMember, meeting) || isCreator;
      if (!allowed) return reply.status(404).send('Meeting not found');
    }
    // If _member is null, the requester is the legacy founder who got past
    // l8ResolveOrg via clerkOrgId === auth.userId. They retain full access.

    // Lazy-populate attendees if the meeting was created with an empty list
    // (the /l8/create form route inserts attendees:[]). Mirrors the API
    // POST /meetings auto-populate so the quick-create path produces a
    // working meeting: humans from the team, agents reporting under them,
    // and the requester themselves as a final fallback so there is always
    // at least one rateable human in the room.
    if (!Array.isArray(meeting.attendees) || (meeting.attendees as any[]).length === 0) {
      const _auth = getAuth(request);
      let resolvedAttendees: any[] = [];
      if (meeting.teamId) {
        const teamHumans = await db
          .select({
            memberId: orgMembers.id,
            displayName: orgMembers.displayName,
            email: orgMembers.email,
            role: orgMembers.role,
            claimedEntityIds: orgMembers.claimedEntityIds,
          })
          .from(teamMemberships)
          .innerJoin(orgMembers, eq(teamMemberships.memberId, orgMembers.id))
          .where(eq(teamMemberships.teamId, meeting.teamId));
        const humanTileIds: string[] = [];
        for (const h of teamHumans) {
          const tiles = (h.claimedEntityIds as string[] | null) || [];
          for (const t of tiles) if (t) humanTileIds.push(t);
          resolvedAttendees.push({
            type: 'human',
            memberId: h.memberId,
            name: h.displayName || h.email || 'member',
            externalIds: tiles,
            role: h.role,
          });
        }
        // Auto-add humans only. EOS leadership meetings are humans-only
        // by convention; agents that report under those humans get tracked
        // through their own KPIs/rocks/issues/todos and surface in the
        // "Agent Reports" section of the meeting view when explicitly
        // added. To add an agent to a specific meeting, use the attendee
        // editor (the Edit button in the Attendees panel). David flagged
        // 2026-05-25 that auto-adding Dirk to Leadership L10 was wrong.
      }
      // Fallback: meeting has no team, or the team has no humans (founder
      // path). Add the requester so the meeting always has at least one
      // rateable human.
      if (resolvedAttendees.length === 0 && _auth.userId) {
        const [_self] = await db.select({
          id: orgMembers.id, displayName: orgMembers.displayName, email: orgMembers.email,
          role: orgMembers.role, claimedEntityIds: orgMembers.claimedEntityIds,
        }).from(orgMembers)
          .where(and(eq(orgMembers.orgId, org.id), eq(orgMembers.clerkUserId, _auth.userId)))
          .limit(1);
        if (_self) {
          resolvedAttendees.push({
            type: 'human',
            memberId: _self.id,
            name: _self.displayName || _self.email || 'You',
            externalIds: (_self.claimedEntityIds as string[] | null) || [],
            role: _self.role,
          });
        } else {
          // Founder path: no org_members row. Minimal placeholder so the
          // rating section still works; the editor can replace this later.
          resolvedAttendees.push({
            type: 'human',
            externalId: 'user:' + _auth.userId,
            memberId: _auth.userId,
            name: 'You',
          });
        }
      }
      if (resolvedAttendees.length > 0) {
        await db.update(meetings)
          .set({ attendees: resolvedAttendees, updatedAt: new Date() })
          .where(eq(meetings.id, meeting.id));
        meeting.attendees = resolvedAttendees as any;
      }
    }

    // Ensure the requester is in the attendees list even when the meeting
    // already had entries. Catches the "Dan was auto-added but David
    // wasn't" pattern, and the founder path where the auto-populate ran
    // but didn't include the viewer.
    {
      const _ensureAuth = getAuth(request);
      if (_ensureAuth.userId) {
        const _currentList: any[] = Array.isArray(meeting.attendees) ? [...(meeting.attendees as any[])] : [];
        const [_self2] = await db.select({
          id: orgMembers.id,
          displayName: orgMembers.displayName,
          email: orgMembers.email,
          role: orgMembers.role,
          claimedEntityIds: orgMembers.claimedEntityIds,
        }).from(orgMembers)
          .where(and(eq(orgMembers.orgId, org.id), eq(orgMembers.clerkUserId, _ensureAuth.userId)))
          .limit(1);
        const _selfTiles2: string[] = _self2 ? (((_self2.claimedEntityIds as string[] | null) || [])) : [];
        const _alreadyIn = _currentList.some((a: any) => {
          if (!a) return false;
          if (_self2 && typeof a.memberId === 'string' && a.memberId === _self2.id) return true;
          if (typeof a.memberId === 'string' && a.memberId === _ensureAuth.userId) return true;
          if (Array.isArray(a.externalIds)) {
            for (const _x of a.externalIds) {
              if (typeof _x === 'string' && _selfTiles2.includes(_x)) return true;
            }
          }
          if (typeof a.externalId === 'string' && _selfTiles2.includes(a.externalId)) return true;
          return false;
        });
        if (!_alreadyIn) {
          if (_self2) {
            _currentList.push({
              type: 'human',
              memberId: _self2.id,
              name: _self2.displayName || _self2.email || 'You',
              externalIds: _selfTiles2,
              role: _self2.role,
            });
          } else {
            _currentList.push({
              type: 'human',
              externalId: 'user:' + _ensureAuth.userId,
              memberId: _ensureAuth.userId,
              name: 'You',
            });
          }
          await db.update(meetings)
            .set({ attendees: _currentList, updatedAt: new Date() })
            .where(eq(meetings.id, meeting.id));
          meeting.attendees = _currentList as any;
        }
      }
    }

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
    // Snapshot lifecycle: a meeting can carry frozen scorecard/rocks JSON
    // from a previous /start. EOS wants the discussion anchored to what
    // was true at meeting start, so we honor the snapshot during
    // in_progress and completed states. But for a SCHEDULED meeting,
    // edits should flow through live -- David flagged 2026-05-25 that
    // updating a rock or KPI before the meeting didn't refresh.
    const _useSnapshot = useScorecardSnapshot(meeting.status);
    let scorecard: any;
    if (_useSnapshot && meeting.scorecardSnapshot && (meeting.scorecardSnapshot as any).kpis) {
      // Snapshots were historically captured org-wide, so an older one can
      // carry other teams' KPIs. The scorecard is team-scoped, so filter the
      // snapshot to this meeting's team -- fixes the 2026-06-04 leak where the
      // AI Army KPI "OTP -- Real signups" surfaced on the Leadership L10.
      const _snap = meeting.scorecardSnapshot as any;
      const _kpisScoped = (_snap.kpis || []).filter((k: any) => belongsToMeetingTeam(k.teamId, meeting.teamId));
      scorecard = { ..._snap, kpis: _kpisScoped, kpiCount: _kpisScoped.length };
    } else {
      scorecard = { kpis: orgKpis, latestValues, previousValues, kpiCount: orgKpis.length };
    }

    // Rock Review hides completed + archived rocks by default; ?rocks=all
    // reveals them (rendered at the bottom with a Reopen button).
    const _showHiddenRocks = (request.query as any)?.rocks === 'all';
    const _rockConds = [
      eq(rocks.organizationId, org.id),
      meeting.teamId ? eq(rocks.teamId, meeting.teamId) : isNull(rocks.teamId),
      isNull(rocks.deletedAt),
    ];
    if (!_showHiddenRocks) {
      _rockConds.push(isNull(rocks.completedAt), isNull(rocks.archivedAt));
    }
    const orgRocks = await db.select().from(rocks)
      .where(and(..._rockConds))
      .orderBy(sql`${rocks.position} asc nulls last`, asc(rocks.dueDate));
    // Count of human-owned completed-or-archived rocks for the toggle label
    // (mirrors the EJS agent-rock filter so the count matches what renders).
    const _hiddenRows = await db.select({ oet: rocks.ownerEntityType, oeid: rocks.ownerExternalId }).from(rocks)
      .where(and(
        eq(rocks.organizationId, org.id),
        meeting.teamId ? eq(rocks.teamId, meeting.teamId) : isNull(rocks.teamId),
        isNull(rocks.deletedAt),
        or(isNotNull(rocks.completedAt), isNotNull(rocks.archivedAt)),
      ));
    const hiddenRocksCount = _hiddenRows.filter(
      (r) => r.oet !== 'agent' && !(typeof r.oeid === 'string' && r.oeid.startsWith('AGT_')),
    ).length;
    // Rocks ALWAYS render live (current state), for scheduled / in_progress /
    // completed alike. Unlike the scorecard (which freezes a weekly KPI reading
    // as-of meeting start), rocks are current-state objects edited DURING the
    // meeting (the Rock Review). Snapshotting them caused the 2026-06-04 bugs:
    // live edits looked unsaved, and the org-wide snapshot leaked other teams'
    // rocks. The /start rocksSnapshot is retained ONLY as the baseline for the
    // "changed this meeting" diff below, never as a render source.
    let rocksData: any = { rocks: orgRocks, count: orgRocks.length };

    // "Changed this meeting" provenance. During a LIVE meeting, diff each rock
    // against the /start baseline snapshot so a status change reads as
    // decided-in-this-meeting, not a silent overwrite (David, 2026-06-04).
    // rockChanges[id] = the transition; rockBaseline[id] = on-track-at-start so
    // the client On/Off toggle can recompute the label without a reload.
    const rockChanges: Record<string, { kind: 'flip' | 'completed' | 'archived'; from?: boolean; to?: boolean }> = {};
    const rockBaseline: Record<string, boolean> = {};
    if (meeting.status === 'in_progress' && meeting.rocksSnapshot && (meeting.rocksSnapshot as any).rocks) {
      const _baseline = new Map<string, any>();
      for (const br of (meeting.rocksSnapshot as any).rocks as any[]) {
        if (belongsToMeetingTeam(br.teamId, meeting.teamId)) {
          _baseline.set(br.id, br);
          rockBaseline[br.id] = !!br.onTrack;
        }
      }
      // Rocks active at start but completed/archived DURING this meeting have
      // left the live active list -- pull them back so they stay visible with
      // a "Completed/Archived this meeting" note instead of silently vanishing.
      const _baseIds = [..._baseline.keys()];
      if (_baseIds.length) {
        const _leftActive = await db.select().from(rocks).where(and(
          eq(rocks.organizationId, org.id),
          inArray(rocks.id, _baseIds),
          isNull(rocks.deletedAt),
          or(isNotNull(rocks.completedAt), isNotNull(rocks.archivedAt)),
        ));
        const _byId = new Map<string, any>((rocksData.rocks as any[]).map((r: any) => [r.id, r]));
        for (const r of _leftActive) if (!_byId.has(r.id)) _byId.set(r.id, r);
        const _merged = [..._byId.values()];
        rocksData = { rocks: _merged, count: _merged.length };
      }
      for (const r of rocksData.rocks as any[]) {
        const b = _baseline.get(r.id);
        if (!b) continue; // added this meeting -- status-change provenance only
        if (r.completedAt) rockChanges[r.id] = { kind: 'completed' };
        else if (r.archivedAt) rockChanges[r.id] = { kind: 'archived' };
        else if (!!b.onTrack !== !!r.onTrack) rockChanges[r.id] = { kind: 'flip', from: !!b.onTrack, to: !!r.onTrack };
      }
    }

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
    // OPEN ONLY: EOS L10 convention is that completed to-dos drop off
    // and only carry-forward open ones surface. David flagged 2026-05-25
    // that done items lingered with strikethrough -- killed.
    const orgTodos = await db.select().from(todos)
      .where(and(
        eq(todos.organizationId, org.id),
        eq(todos.kind, 'l10'),
        meeting.teamId ? eq(todos.teamId, meeting.teamId) : isNull(todos.teamId),
        isNull(todos.deletedAt),
        isNull(todos.doneAt),
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
    // Build attendee keys from every shape an attendee row can take. The
    // auto-populate uses { type:'human', memberId, externalIds:[...] } while
    // the editor uses { entityType, externalId }. Match against all of them
    // so chart nodes light up as "in room" whether they were claimed via a
    // chart tile, added by memberId, or added directly by externalId.
    const attendeeKeys = new Set<string>();
    for (const _a of ((meeting.attendees || []) as Array<Record<string, unknown>>)) {
      if (!_a) continue;
      const _t = (typeof _a.entityType === 'string' && _a.entityType)
        || (typeof _a.type === 'string' && _a.type)
        || '';
      if (!_t) continue;
      if (typeof _a.externalId === 'string' && _a.externalId) {
        attendeeKeys.add(`${_t}:${_a.externalId}`);
      }
      const _xids = (_a as any).externalIds;
      if (Array.isArray(_xids)) {
        for (const _x of _xids) {
          if (typeof _x === 'string' && _x) attendeeKeys.add(`${_t}:${_x}`);
        }
      }
      if (typeof (_a as any).memberId === 'string' && (_a as any).memberId) {
        attendeeKeys.add(`${_t}:${(_a as any).memberId}`);
      }
    }
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
      rockChanges,
      rockBaseline,
      rocksFilter: _showHiddenRocks ? 'all' : 'active',
      hiddenRocksCount,
      issues: orgIssues,
      todos: orgTodos,
      headlineItems,
      executionItems,
      planDirection,
      teamMembers,
      availableOwners,
      orgTeams: orgTeamsList,
      renderDescription,
      agentRuns,
      devOrgIdParam,
      recurrenceLabel: ruleToLabel(meeting.recurrenceRule, meeting.scheduledAt),
      recurrenceOptions: RECURRENCE_OPTIONS,
    });
  });

  // ---------- Team member profile (per-person accountability page) ----------
  // ---------- People Review (grid: human seats x seat fit + values) ----------
  app.get('/team/review', async (request, reply) => {
    const org = await l8ResolveOrg(request, reply);
    if (!org) return;

    const period = currentPeriod();
    const graph = await getOrgTeamGraph(org.id, org.name || 'Organization');

    // People Review shows ONLY the seats that report up to the current user.
    // Rating your peers or yourself isn't the People Analyzer model -- you
    // rate your direct + transitive reports. David flagged 2026-05-24 that
    // showing the whole org made the page noisy and out-of-frame.
    //
    // Impersonation-aware identity resolution (added 2026-05-27): under
    // super-admin "view as <user>", auth.userId stays as the admin's
    // session, so a raw DB lookup by auth.userId returns the admin's row
    // and the page shows the admin's reports, not the impersonated
    // user's. Use request.impersonation.as when present to query for the
    // effective viewer's tiles. See feedback_otp_orgmember_not_resolveorgforuser.
    const auth = getAuth(request);
    const _impReview = (request as any).impersonation as { as?: string } | null;
    const _effClerkReview = _impReview?.as || auth.userId;
    const [me] = _effClerkReview
      ? await db.select({ claimedEntityId: orgMembers.claimedEntityId, claimedEntityIds: orgMembers.claimedEntityIds })
          .from(orgMembers)
          .where(and(eq(orgMembers.orgId, org.id), eq(orgMembers.clerkUserId, _effClerkReview)))
          .limit(1)
      : [null];
    const myTiles: string[] = [];
    if (me?.claimedEntityIds && Array.isArray(me.claimedEntityIds)) {
      for (const id of me.claimedEntityIds) if (id) myTiles.push(id);
    }
    if (me?.claimedEntityId && !myTiles.includes(me.claimedEntityId)) myTiles.push(me.claimedEntityId);
    // Defense-in-depth: strip HUM_DAVIDSTEEL for non-founders. SPREAD the
    // legacy-founder case so the scrubbed list is a COPY, not the same
    // reference. The earlier `myTiles.length = 0; refill` pattern was a
    // reference-aliasing bug -- under legacy-founder, the scrubbed list was
    // the same array, so clearing myTiles also cleared the source, leaving
    // an empty subtree and a blank People Review page for the founder.
    // Caught 2026-05-27 when David's /team/review rendered the
    // "no one reports to you" empty state despite 16 humans on the chart.
    const _isLegacyReview = !!(_effClerkReview && (org as any).clerkOrgId === _effClerkReview);
    const _myTilesScrubbedReview = _isLegacyReview
      ? [...myTiles]
      : myTiles.filter(t => t !== 'HUM_DAVIDSTEEL');
    myTiles.length = 0;
    for (const t of _myTilesScrubbedReview) myTiles.push(t);

    const myTileSet = new Set(myTiles);
    const subtree = myTiles.length > 0 ? reportsSubtree(graph, myTiles) : new Set<string>();
    // Subtree includes the starting tiles -- People Review is "people under
    // me", not "me + people under me", so exclude my own tiles.
    for (const t of myTiles) subtree.delete(t);

    const humanSeats = graph.nodes
      .filter(n => n.type === 'human' && subtree.has(n.externalId))
      .map(n => ({ externalId: n.externalId, name: n.label }))
      .sort((a, b) => a.name.localeCompare(b.name));

    const noReports = humanSeats.length === 0;
    const noClaim = myTiles.length === 0;

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
      noReports,
      noClaim,
    });
  });

  app.get<{ Params: { externalId: string } }>('/team/:externalId', async (request, reply) => {
    const org = await l8ResolveOrg(request, reply);
    if (!org) return;

    const externalId = decodeURIComponent(request.params.externalId);
    if (!externalId || externalId.length > 120) return reply.status(400).send('Invalid externalId');

    // Visibility gate (added 2026-05-27 after audit found this page
    // rendered ANY tile's rocks/todos/tickets to any authenticated
    // org_member). Mirrors the API gate in routes/api/team-profile.ts
    // and the chart-scoping rules from commit 2d9358b. 404 (not 403)
    // to avoid confirming the tile exists.
    {
      const { computeViewableTiles } = await import('../../services/chart-permissions.js');
      const _team = await getOrgTeamGraph(org.id, org.name || '');
      const _auth = getAuth(request);
      let _viewerMember = (request as any).orgMember as { role?: string; claimedEntityId?: string | null; claimedEntityIds?: string[] | null } | null;
      if (!_viewerMember && _auth.userId && (org as any).clerkOrgId === _auth.userId) {
        _viewerMember = { role: 'owner', claimedEntityId: null, claimedEntityIds: null };
      }
      const _viewable = computeViewableTiles(_viewerMember as any, _team);
      if (!_viewable.has(externalId)) return reply.status(404).send('Member not found');
    }

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

    // Resolve which seat(s) THIS user owns -- /me/todos is personal-by-default,
    // so it must return only todos owned by the requesting member, NOT a
    // hardcoded ID. Prior to 2026-05-26 this was literally `HUM_DAVIDSTEEL`
    // (placeholder from /me/todos v1, 2026-05-07) which leaked David's todo
    // queue to every other org member -- Kristen flagged it mid-meeting on
    // her first L8 with David.
    //
    // Resolution order:
    //   1. org_members.claimedEntityIds  -- the canonical chart-tile claim
    //      list. A member may claim multiple seats (founder-CEO, etc.) so
    //      we accept ANY claimed externalId as "mine".
    //   2. Legacy founder fallback: if no claim exists AND the user's
    //      clerkOrgId === organizations.clerkOrgId, default to HUM_DAVIDSTEEL.
    //      This preserves the pre-fix behavior for the founder seat
    //      regardless of whether the chart was claimed yet.
    //   3. Otherwise: empty list, no todos shown. Safer than leaking.
    const [me] = await db.select({
      id: orgMembers.id,
      claimedEntityIds: orgMembers.claimedEntityIds,
    })
      .from(orgMembers)
      .where(and(eq(orgMembers.orgId, org.id), eq(orgMembers.clerkUserId, auth.userId)))
      .limit(1);

    // Defense-in-depth: HUM_DAVIDSTEEL must NEVER appear in a non-founder's
    // claimedEntityIds. The chart-claim-reconcile email-match path has a
    // known drift pattern that can push the founder's canonical tile into
    // another member's claims. If we trusted the DB blindly, Kristen with
    // a drifted claim of HUM_DAVIDSTEEL would see David's full todo queue.
    // Strip it here regardless of DB state. The legacy-founder fallback
    // below adds HUM_DAVIDSTEEL back when the requester IS the founder.
    //
    // Impersonation-aware: under super-admin "view as", auth.userId stays
    // as the admin while request.impersonation.as is the impersonated
    // user's Clerk ID. Use the EFFECTIVE viewer for the founder check so
    // an admin "view as Kristen" does NOT see David's todos. Caught
    // 2026-05-27 alongside the /dashboard same-shape leak.
    const _impMeTodos = (request as any).impersonation as { as?: string } | null;
    const _effectiveClerkIdMeTodos = _impMeTodos?.as || auth.userId;
    const _isLegacyFounderMeTodos = !!(_effectiveClerkIdMeTodos && (org as any).clerkOrgId === _effectiveClerkIdMeTodos);
    let ownerExternalIds: string[] = [];
    if (me?.claimedEntityIds && Array.isArray(me.claimedEntityIds)) {
      const _raw = (me.claimedEntityIds as string[]).filter(x => typeof x === 'string' && x.length > 0);
      ownerExternalIds = _isLegacyFounderMeTodos
        ? _raw
        : _raw.filter((id: string) => id !== 'HUM_DAVIDSTEEL');
    }
    if (ownerExternalIds.length === 0 && _isLegacyFounderMeTodos) {
      ownerExternalIds = ['HUM_DAVIDSTEEL'];
    }

    // Personal todos only here. L10 todos owned by the user are shown as a
    // separate read-only section so /me stays personal-by-default.
    // Recurrence templates (rule set + no due_at) never appear -- only their
    // generated instances do.
    const myTodos = ownerExternalIds.length === 0 ? [] : await db.select()
      .from(todos)
      .where(and(
        eq(todos.organizationId, org.id),
        eq(todos.kind, 'personal'),
        eq(todos.ownerEntityType, 'human'),
        inArray(todos.ownerExternalId, ownerExternalIds),
        isNull(todos.doneAt),
        isNull(todos.deletedAt),
        isNull(todos.parentTodoId),       // top-level only; subtasks expand
        isNull(todos.recurrenceRule),     // hide templates
      ))
      .orderBy(asc(todos.priority), asc(todos.dueAt), desc(todos.createdAt));

    // L10 todos assigned to me, read-only here (managed in /l8).
    const myL10Todos = ownerExternalIds.length === 0 ? [] : await db.select()
      .from(todos)
      .where(and(
        eq(todos.organizationId, org.id),
        eq(todos.kind, 'l10'),
        eq(todos.ownerEntityType, 'human'),
        inArray(todos.ownerExternalId, ownerExternalIds),
        isNull(todos.doneAt),
        isNull(todos.deletedAt),
        isNull(todos.recurrenceRule),
      ))
      .orderBy(asc(todos.priority), asc(todos.dueAt), desc(todos.createdAt));

    // Recently resolved (last 24h) -- across both kinds.
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentlyDone = ownerExternalIds.length === 0 ? [] : await db.select()
      .from(todos)
      .where(and(
        eq(todos.organizationId, org.id),
        eq(todos.ownerEntityType, 'human'),
        inArray(todos.ownerExternalId, ownerExternalIds),
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

    // Todos THIS user delegated to others. delegator* points back to whoever
    // is waiting; the todo is owned by the assignee. Same multi-claim logic
    // as the owner queries above -- match ANY of the requester's claimed
    // externalIds. Empty case returns [] so non-claimed members see nothing
    // instead of leaking the founder's delegation queue.
    const delegatedWaiting = ownerExternalIds.length === 0 ? [] : await db.select()
      .from(todos)
      .where(and(
        eq(todos.organizationId, org.id),
        inArray(todos.delegatorExternalId, ownerExternalIds),
        isNull(todos.doneAt),
        isNull(todos.deletedAt),
        isNull(todos.recurrenceRule),
      ))
      .orderBy(asc(todos.priority), asc(todos.dueAt), desc(todos.createdAt));

    // Delegated todos the assignee marked done but THIS user hasn't verified yet.
    const delegatedVerify = ownerExternalIds.length === 0 ? [] : await db.select()
      .from(todos)
      .where(and(
        eq(todos.organizationId, org.id),
        inArray(todos.delegatorExternalId, ownerExternalIds),
        isNotNull(todos.doneAt),
        isNull(todos.verifiedAt),
        isNull(todos.deletedAt),
        isNull(todos.recurrenceRule),
      ))
      .orderBy(asc(todos.priority), asc(todos.dueAt), desc(todos.createdAt));

    // People THIS user can delegate to -- humans and agents from the team graph.
    const meGraph = await getOrgTeamGraph(org.id, org.name);
    const assignablePeople = meGraph.nodes
      .filter(n => n.type === 'human' || n.type === 'agent')
      .map(n => ({ entityType: n.type, externalId: n.externalId, name: n.label }))
      .sort((a, b) => a.entityType !== b.entityType
        ? (a.entityType === 'human' ? -1 : 1)
        : a.name.localeCompare(b.name));

    // Delegator identity for the create form. The view template treats
    // ownerExternalId as a single string (used as the default owner when
    // creating a new personal todo), so we pass the primary claimed seat.
    // Multi-claim members get their first claim as the default; they can
    // re-assign on creation if needed.
    const meExternalId = ownerExternalIds[0] || '';
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
      ownerExternalId: meExternalId,
      upcomingMeetings,
      delegatedWaiting,
      delegatedVerify,
      assignablePeople,
      meExternalId,
      meName,
      meEntityType,
      renderDescription,
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
