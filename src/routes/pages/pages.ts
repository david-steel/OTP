import type { FastifyInstance } from 'fastify';
import { getAuth } from '@clerk/fastify';
import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../../config/database.js';
import { organizations, oosFiles, claims, claimSimilarities, apiKeys } from '../../db/schema.js';
import { isNull } from 'drizzle-orm';
import { computeDiff } from '../../services/diff-engine.js';
import { generateMergePreview } from '../../services/merge-preview.js';
import type { ParsedClaim } from '../../shared/types.js';
import { AGENTIC_LEVEL_LABELS } from '../../shared/enums.js';

function toParsedClaim(c: any): ParsedClaim {
  return { claimId: c.claimId, section: c.section, displayOrder: c.displayOrder, rule: c.rule, why: c.why, failureMode: c.failureMode, confidence: c.confidence, evidence: c.evidence, scope: c.scope };
}

const BASE_URL = 'https://orgtp.com';

export default async function pageRoutes(app: FastifyInstance) {

  // Homepage
  app.get('/', async (request, reply) => {
    const pubCountRes = await db.execute(sql`SELECT COUNT(DISTINCT org_id) AS c FROM oos_files WHERE status = 'published'`) as any;
    const clmCountRes = await db.execute(sql`SELECT COUNT(*) AS c FROM claims WHERE oos_file_id IN (SELECT id FROM oos_files WHERE status = 'published')`) as any;
    return reply.view('pages/home', {
      title: 'OTP - Where Agents Learn to Work as a Team',
      description: 'OTP is the coordination intelligence layer for AI-native organizations. Publish, compare, and learn from Organizational Operating Systems.',
      canonical: BASE_URL + '/',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'OTP - Organization Transport Protocol',
          url: BASE_URL,
          logo: BASE_URL + '/public/favicon-192x192.png',
          description: 'The coordination intelligence layer for AI-native organizations. Where agents learn to work as a team.',
          sameAs: []
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'OTP',
          url: BASE_URL,
          potentialAction: {
            '@type': 'SearchAction',
            target: { '@type': 'EntryPoint', urlTemplate: BASE_URL + '/search?q={search_term_string}' },
            'query-input': 'required name=search_term_string'
          }
        }
      ],
      publisherCount: ((pubCountRes.rows as any[])?.[0]?.c) || 0,
      claimCount: ((clmCountRes.rows as any[])?.[0]?.c) || 0,
      templateCount: 3,
    });
  });

  // Browse
  app.get('/browse', async (request, reply) => {
    const rows = await db.execute(sql`
      SELECT f.id, f.template, f.version, f.claim_count, f.word_count,
             f.confidence_distribution, f.evidence_distribution, f.published_at,
             o.id AS org_id, o.name AS org_name, o.industry, o.size, o.badge, o.quality_tier, o.agentic_level
      FROM oos_files f JOIN organizations o ON f.org_id = o.id
      WHERE f.status = 'published'
      ORDER BY f.published_at DESC NULLS LAST
      LIMIT 50
    `);
    return reply.view('pages/browse', { title: 'Browse Intelligence - OTP', description: 'Browse published Organizational Operating Systems. See how organizations coordinate their AI agent teams.', canonical: BASE_URL + '/browse', oosFiles: rows.rows || [] });
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

      return reply.view('pages/search', { title: q ? `"${q}" - Search - OTP` : 'Search - OTP', description: 'Search knowledge claims across published Organizational Operating Systems on OTP.', canonical: BASE_URL + '/search', q, confidence, evidence, template, industry, results, pagination });
    }
  );

  // OOS Detail
  app.get<{ Params: { id: string } }>('/oos/:id', async (request, reply) => {
    const { id } = request.params;
    const [oosFile] = await db.select().from(oosFiles).where(eq(oosFiles.id, id)).limit(1);
    if (!oosFile) return reply.status(404).view('pages/home', { title: 'Not Found' });

    const [org] = await db.select().from(organizations).where(eq(organizations.id, oosFile.orgId)).limit(1);
    const claimRows = await db.select().from(claims).where(eq(claims.oosFileId, id)).orderBy(claims.displayOrder);

    const orgData = org ? { ...org, agenticLabel: org.agenticLevel ? AGENTIC_LEVEL_LABELS[org.agenticLevel] || '' : '' } : {};
    return reply.view('pages/oos-detail', { title: `${org?.name || 'OOS'} - OTP`, description: `View the Organizational Operating System published by ${org?.name || 'this organization'} on OTP. ${oosFile.claimCount} coordination claims.`, canonical: BASE_URL + '/oos/' + id, oosFile, org: orgData, claims: claimRows });
  });

  // Compare
  app.get<{ Params: { idA: string; idB: string } }>('/compare/:idA/:idB', async (request, reply) => {
    const { idA, idB } = request.params;
    const [oosA] = await db.select().from(oosFiles).where(eq(oosFiles.id, idA)).limit(1);
    const [oosB] = await db.select().from(oosFiles).where(eq(oosFiles.id, idB)).limit(1);
    if (!oosA || !oosB) return reply.status(404).view('pages/home', { title: 'Not Found' });

    const [orgA] = await db.select().from(organizations).where(eq(organizations.id, oosA.orgId)).limit(1);
    const [orgB] = await db.select().from(organizations).where(eq(organizations.id, oosB.orgId)).limit(1);

    const claimsA = (await db.select().from(claims).where(eq(claims.oosFileId, idA)).orderBy(claims.displayOrder)).map(toParsedClaim);
    const claimsB = (await db.select().from(claims).where(eq(claims.oosFileId, idB)).orderBy(claims.displayOrder)).map(toParsedClaim);

    const diff = computeDiff(
      { id: idA, orgName: orgA?.name || 'A', claims: claimsA },
      { id: idB, orgName: orgB?.name || 'B', claims: claimsB }
    );

    return reply.view('pages/compare', { title: 'Compare - OTP', diff });
  });

  // Merge Preview
  app.get<{ Params: { sourceId: string; targetId: string } }>('/merge/:sourceId/:targetId', async (request, reply) => {
    const { sourceId, targetId } = request.params;
    const [sourceOos] = await db.select().from(oosFiles).where(eq(oosFiles.id, sourceId)).limit(1);
    const [targetOos] = await db.select().from(oosFiles).where(eq(oosFiles.id, targetId)).limit(1);
    if (!sourceOos || !targetOos) return reply.status(404).view('pages/home', { title: 'Not Found' });

    const [sourceOrg] = await db.select().from(organizations).where(eq(organizations.id, sourceOos.orgId)).limit(1);
    const [targetOrg] = await db.select().from(organizations).where(eq(organizations.id, targetOos.orgId)).limit(1);

    const sourceClaims = (await db.select().from(claims).where(eq(claims.oosFileId, sourceId)).orderBy(claims.displayOrder)).map(toParsedClaim);
    const targetClaims = (await db.select().from(claims).where(eq(claims.oosFileId, targetId)).orderBy(claims.displayOrder)).map(toParsedClaim);

    const preview = generateMergePreview(
      { id: sourceId, name: sourceOrg?.name || 'Source', wordCount: sourceOos.wordCount, entities: (sourceOos.frontmatter as any)?.entities || null, claims: sourceClaims },
      { id: targetId, name: targetOrg?.name || 'Target', wordCount: targetOos.wordCount, entities: (targetOos.frontmatter as any)?.entities || null, claims: targetClaims }
    );

    return reply.view('pages/merge-preview', { title: 'Merge Preview - OTP', preview });
  });

  // Org Profile
  app.get<{ Params: { id: string } }>('/org/:id', async (request, reply) => {
    const { id } = request.params;
    const [org] = await db.select().from(organizations).where(eq(organizations.id, id)).limit(1);
    if (!org) return reply.status(404).view('pages/home', { title: 'Not Found' });

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
    return reply.view('pages/graph', { title: 'Intelligence Graph - OTP', description: 'Explore the Intelligence Graph showing how AI coordination patterns connect across organizations.', canonical: BASE_URL + '/graph' });
  });

  // Guide page
  app.get('/guide', async (request, reply) => {
    return reply.view('pages/guide', { title: 'How to Generate Your OOS - OTP', description: 'Step-by-step guide to generating and publishing your Organizational Operating System on OTP.', canonical: BASE_URL + '/guide' });
  });

  // Blog index
  app.get('/blog', async (request, reply) => {
    return reply.view('pages/blog', { title: 'Blog - OTP', description: 'Building in public. Lessons from running 14 AI agents in production at a digital agency.', canonical: BASE_URL + '/blog' });
  });

  // Blog post 1
  app.get('/blog/why-we-built-otp', async (request, reply) => {
    return reply.view('pages/blog-post-1', {
      title: 'The Hard Problem in AI Isn\'t Intelligence. It\'s Coordination. - OTP',
      description: 'The hard problem in AI is not building one good agent. It is getting twelve of them to coordinate without stepping on each other. Why we built OTP.',
      canonical: BASE_URL + '/blog/why-we-built-otp',
      ogType: 'article',
      jsonLd: { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: 'The Hard Problem in AI Isn\'t Intelligence. It\'s Coordination.', author: { '@type': 'Person', name: 'David Steel' }, datePublished: '2026-03-01', publisher: { '@type': 'Organization', name: 'OTP', url: BASE_URL }, url: BASE_URL + '/blog/why-we-built-otp' }
    });
  });

  // Blog post 2
  app.get('/blog/what-is-an-oos', async (request, reply) => {
    return reply.view('pages/blog-post-2', {
      title: 'What Is an Organizational Operating System? - OTP',
      description: 'An Organizational Operating System captures how your AI agents coordinate. Learn the structure, claims, confidence ratings, and evidence model.',
      canonical: BASE_URL + '/blog/what-is-an-oos',
      ogType: 'article',
      jsonLd: { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: 'What Is an Organizational Operating System?', author: { '@type': 'Person', name: 'David Steel' }, datePublished: '2026-03-01', publisher: { '@type': 'Organization', name: 'OTP', url: BASE_URL }, url: BASE_URL + '/blog/what-is-an-oos' }
    });
  });

  // Blog post 3
  app.get('/blog/built-in-48-hours', async (request, reply) => {
    return reply.view('pages/blog-post-3', {
      title: 'We Built This Platform in 48 Hours. With the System It\'s Designed to Measure. - OTP',
      description: 'How we built the OTP platform in 48 hours using the same AI agent coordination system the platform is designed to measure.',
      canonical: BASE_URL + '/blog/built-in-48-hours',
      ogType: 'article',
      jsonLd: { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: 'We Built This Platform in 48 Hours. With the System It\'s Designed to Measure.', author: { '@type': 'Person', name: 'David Steel' }, datePublished: '2026-03-15', publisher: { '@type': 'Organization', name: 'OTP', url: BASE_URL }, url: BASE_URL + '/blog/built-in-48-hours' }
    });
  });

  // Blog post 4
  app.get('/blog/nvidia-made-the-case', async (request, reply) => {
    return reply.view('pages/blog-post-4', {
      title: 'Jensen Huang Just Made the Case for OTP. He Didn\'t Know It. - OTP',
      description: 'Jensen Huang told the world every company needs an agent strategy. OTP is the coordination layer that makes multi-agent strategy work.',
      canonical: BASE_URL + '/blog/nvidia-made-the-case',
      ogType: 'article',
      jsonLd: { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: 'Jensen Huang Just Made the Case for OTP. He Didn\'t Know It.', author: { '@type': 'Person', name: 'David Steel' }, datePublished: '2026-03-17', publisher: { '@type': 'Organization', name: 'OTP', url: BASE_URL }, url: BASE_URL + '/blog/nvidia-made-the-case' }
    });
  });

  // Blog post 5
  app.get('/blog/bain-code-red', async (request, reply) => {
    return reply.view('pages/blog-post-5', {
      title: 'Bain Just Described the Problem OTP Solves. They Called It "Code Red." - OTP',
      description: 'Bain called enterprise multi-agent coordination a Code Red problem. OTP is the coordination intelligence layer that solves it.',
      canonical: BASE_URL + '/blog/bain-code-red',
      ogType: 'article',
      jsonLd: { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: 'Bain Just Described the Problem OTP Solves. They Called It "Code Red."', author: { '@type': 'Person', name: 'David Steel' }, datePublished: '2026-03-17', publisher: { '@type': 'Organization', name: 'OTP', url: BASE_URL }, url: BASE_URL + '/blog/bain-code-red' }
    });
  });

  // Blog post 6
  app.get('/blog/agentic-levels', async (request, reply) => {
    return reply.view('pages/blog-post-6', {
      title: 'We Added Agentic Maturity Levels to OTP. Here Is Why They Matter. - OTP',
      description: 'Agentic maturity levels on OTP measure how sophisticated your AI agent coordination is. From tab completion to autonomous agent teams.',
      canonical: BASE_URL + '/blog/agentic-levels',
      ogType: 'article',
      jsonLd: { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: 'We Added Agentic Maturity Levels to OTP. Here Is Why They Matter.', author: { '@type': 'Person', name: 'David Steel' }, datePublished: '2026-03-17', publisher: { '@type': 'Organization', name: 'OTP', url: BASE_URL }, url: BASE_URL + '/blog/agentic-levels' }
    });
  });

  // Investors page
  app.get('/investors', async (request, reply) => {
    return reply.view('pages/investors', { title: 'For Investors - OTP', description: 'Investment opportunity in OTP, the coordination intelligence platform for AI-native organizations.', canonical: BASE_URL + '/investors' });
  });

  // Tickets page
  app.get('/tickets', async (request, reply) => {
    return reply.view('pages/tickets', { title: 'Issue Tracker - OTP', description: 'Report issues, request features, and track platform improvements for OTP.', canonical: BASE_URL + '/tickets' });
  });

  // Settings: API Keys
  app.get('/settings/api', async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) {
      return reply.view('pages/settings-api', { title: 'API Keys - OTP', authState: 'unauthenticated', keys: [] });
    }

    const [org] = await db.select().from(organizations).where(eq(organizations.clerkOrgId, auth.userId)).limit(1);
    if (!org) {
      return reply.view('pages/settings-api', { title: 'API Keys - OTP', authState: 'no_org', keys: [] });
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

    return reply.view('pages/settings-api', { title: 'API Keys - OTP', authState: 'authenticated', keys });
  });

  // Publish page -- serves the form, auth check happens client-side + on API call
  app.get('/publish', async (request, reply) => {
    return reply.view('pages/publish', { title: 'Publish Your OOS - OTP', description: 'Publish your Organizational Operating System on OTP. Capture and share your AI coordination intelligence.', canonical: BASE_URL + '/publish' });
  });

  // Dashboard -- requires auth, shows registration if no org
  app.get('/dashboard', async (request, reply) => {
    const auth = getAuth(request);

    if (!auth.userId) {
      // Not signed in -- show prompt to sign in (handled client-side by Clerk JS)
      return reply.view('pages/dashboard', {
        title: 'Dashboard - OTP',
        authState: 'unauthenticated',
        dashboard: {
          profile: { name: '', industry: '', size: '', badge: null, qualityTier: null },
          stats: { publishedFiles: 0, totalClaims: 0, connectedOrgs: 0, views30d: 0 },
          oosFiles: [],
          updateHistory: [],
        },
      });
    }

    // Check if user has an org
    const [org] = await db.select()
      .from(organizations)
      .where(eq(organizations.clerkOrgId, auth.userId))
      .limit(1);

    if (!org) {
      // Signed in but no org -- show registration form
      return reply.view('pages/register', {
        title: 'Complete Your Profile - OTP',
      });
    }

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

    return reply.view('pages/dashboard', {
      title: 'Dashboard - OTP',
      authState: 'authenticated',
      dashboard: {
        profile: { name: org.name, industry: org.industry, size: org.size, badge: org.badge, qualityTier: org.qualityTier, agenticLevel: org.agenticLevel, agenticLabel: org.agenticLevel ? AGENTIC_LEVEL_LABELS[org.agenticLevel] || '' : '' },
        stats: {
          publishedFiles: orgOosFiles.filter(f => f.status === 'published').length,
          totalClaims,
          connectedOrgs: parseInt((connections.rows as any)?.[0]?.connected_orgs || '0', 10),
          views30d: 0,
        },
        oosFiles: orgOosFiles,
        updateHistory: orgOosFiles,
      },
    });
  });
}
