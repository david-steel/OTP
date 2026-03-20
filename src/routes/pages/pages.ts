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

function bc(...items: Array<{ name: string; url: string }>) {
  return [{ name: 'Home', url: BASE_URL + '/' }, ...items];
}

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
          founder: { '@type': 'Person', name: 'David Steel', url: BASE_URL + '/about', jobTitle: 'Founder' },
          foundingDate: '2026-03',
          sameAs: ['https://www.linkedin.com/company/orgtp', 'https://x.com/OTP_OOS']
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
    return reply.view('pages/browse', { title: 'Browse Intelligence - OTP', description: 'Browse published Organizational Operating Systems. See how organizations coordinate their AI agent teams.', canonical: BASE_URL + '/browse', breadcrumbs: bc({ name: 'Browse', url: BASE_URL + '/browse' }), jsonLd: { '@context': 'https://schema.org', '@type': 'DataCatalog', name: 'OTP Intelligence Catalog', description: 'Published Organizational Operating Systems with coordination intelligence.', url: BASE_URL + '/browse' }, oosFiles: rows.rows || [] });
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

      return reply.view('pages/search', { title: q ? `"${q}" - Search - OTP` : 'Search - OTP', description: 'Search knowledge claims across published Organizational Operating Systems on OTP.', canonical: BASE_URL + '/search', breadcrumbs: bc({ name: 'Search', url: BASE_URL + '/search' }), q, confidence, evidence, template, industry, results, pagination });
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
    return reply.view('pages/graph', { title: 'Intelligence Graph - OTP', description: 'Explore the Intelligence Graph showing how AI coordination patterns connect across organizations.', canonical: BASE_URL + '/graph', breadcrumbs: bc({ name: 'Graph', url: BASE_URL + '/graph' }) });
  });

  // Guide page
  app.get('/guide', async (request, reply) => {
    return reply.view('pages/guide', { title: 'How to Generate Your OOS - OTP', description: 'Step-by-step guide to generating and publishing your Organizational Operating System on OTP.', canonical: BASE_URL + '/guide', breadcrumbs: bc({ name: 'Guide', url: BASE_URL + '/guide' }) });
  });

  // Blog index
  app.get('/blog', async (request, reply) => {
    return reply.view('pages/blog', { title: 'Blog - OTP', description: 'Building in public. Lessons from running 14 AI agents in production at a digital agency.', canonical: BASE_URL + '/blog', breadcrumbs: bc({ name: 'Blog', url: BASE_URL + '/blog' }), jsonLd: { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'OTP Blog', description: 'Building in public. Lessons from running 14 AI agents in production.', url: BASE_URL + '/blog' } });
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
    return reply.view('pages/blog-post-1', {
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
    return reply.view('pages/blog-post-2', {
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
    return reply.view('pages/blog-post-3', {
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
    return reply.view('pages/blog-post-4', {
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
    return reply.view('pages/blog-post-5', {
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
    return reply.view('pages/blog-post-6', {
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
    return reply.view('pages/blog-post-7', {
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
    return reply.view('pages/blog-post-8', {
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
    return reply.view('pages/blog-post-9', {
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
    return reply.view('pages/blog-post-10', {
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
    return reply.view('pages/blog-post-11', {
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
    return reply.view('pages/blog-post-12', {
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
    return reply.view('pages/blog-post-13', {
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
    return reply.view('pages/blog-post-14', {
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
    return reply.view('pages/blog-post-15', {
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
    return reply.view('pages/blog-post-16', {
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
    return reply.view('pages/blog-post-17', {
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
    return reply.view('pages/blog-post-18', {
      title: '1,500% More Tokens Per Workflow. Most of Them Are Wasted. - OTP',
      description: 'Multi-agent workflows generate 1,500% more tokens than standard formats. NVIDIA solved the inference cost. The coordination waste -- rebuilding organizational context every cycle -- is the unsolved problem.',
      canonical: BASE_URL + '/blog/1500-percent-more-tokens',
      ogType: 'article',
      datePublished: '2026-03-19',
      jsonLd: blogJsonLd('1,500% More Tokens Per Workflow. Most of Them Are Wasted.', '1500-percent-more-tokens', '2026-03-19', 2000)
    });
  });

  // Orchestra Kit (design system)
  app.get('/orchestra-kit', async (request, reply) => {
    return reply.sendFile('orchestra-kit.html');
  });

  // Glossary
  app.get('/glossary', async (request, reply) => {
    const faqItems = [
      { q: 'What is coordination intelligence?', a: 'The collective, structured knowledge of how AI agents within and across organizations should coordinate. It is captured in operational rules, documented failure modes, and evidence-backed patterns.' },
      { q: 'What is an Organizational Operating System (OOS)?', a: 'A structured artifact that encodes how AI agents in an organization coordinate. Contains knowledge claims with confidence ratings, evidence types, and failure modes.' },
      { q: 'What is a knowledge claim?', a: 'An individual operational rule extracted from an OOS, with a claim ID, section, rule, reasoning, failure mode, confidence level, and evidence type.' },
      { q: 'What is the Token Efficiency Ratio?', a: 'A metric measuring whether an operational rule saves more tokens than it costs to load. Ratio above 1.0 means the rule pays for itself.' },
      { q: 'What is the Intelligence Graph?', a: 'A network showing how coordination patterns connect across published OOS files. Reveals shared operational truths and unique approaches across organizations.' },
      { q: 'What are agentic maturity levels?', a: 'An 8-level framework (L1 through L8) measuring how sophisticated an organization\'s AI agent coordination is, from basic tab completion to autonomous agent teams.' },
      { q: 'What is the Organization Transport Protocol?', a: 'The protocol and platform for publishing, comparing, and learning from organizational coordination intelligence. Operates above MCP and A2A in the AI coordination stack.' },
    ];
    return reply.view('pages/glossary', {
      title: 'Glossary - Coordination Intelligence Terms - OTP',
      description: 'Definitions for coordination intelligence, Organizational Operating Systems, knowledge claims, agentic maturity levels, token efficiency, and the AI coordination stack.',
      canonical: BASE_URL + '/glossary',
      breadcrumbs: bc({ name: 'Glossary', url: BASE_URL + '/glossary' }),
      jsonLd: [
        { '@context': 'https://schema.org', '@type': 'DefinedTermSet', name: 'OTP Glossary', description: 'Terms and definitions for the Organization Transport Protocol and coordination intelligence.', url: BASE_URL + '/glossary' },
        { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqItems.map(i => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })) }
      ]
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
    return reply.view('pages/faq', {
      title: 'FAQ - Organization Transport Protocol - OTP',
      description: 'Frequently asked questions about OTP, Organizational Operating Systems, coordination intelligence, and how to publish your AI coordination knowledge.',
      breadcrumbs: bc({ name: 'FAQ', url: BASE_URL + '/faq' }),
      canonical: BASE_URL + '/faq',
      jsonLd: { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqItems.map(i => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })) }
    });
  });

  // About
  app.get('/about', async (request, reply) => {
    return reply.view('pages/about', {
      title: 'About OTP - Organization Transport Protocol',
      description: 'OTP was built by David Steel, who runs 14 AI agents in production. The platform was constructed using the same agent coordination system it measures.',
      breadcrumbs: bc({ name: 'About', url: BASE_URL + '/about' }),
      canonical: BASE_URL + '/about',
      jsonLd: [
        { '@context': 'https://schema.org', '@type': 'Organization', name: 'OTP - Organization Transport Protocol', url: BASE_URL, founder: { '@type': 'Person', name: 'David Steel' }, description: 'The coordination intelligence layer for AI-native organizations.' },
        { '@context': 'https://schema.org', '@type': 'Person', name: 'David Steel', jobTitle: 'Founder', worksFor: { '@type': 'Organization', name: 'OTP' }, description: 'Runs 14 AI agents in production at Sneeze It. Built OTP to capture and share coordination intelligence.' }
      ]
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
    return reply.view('pages/industries', {
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
    return reply.view('pages/industry-detail', {
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
