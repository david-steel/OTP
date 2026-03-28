/**
 * Generalized Best Practices Ingestion Pipeline
 *
 * Usage: DATABASE_URL=... npx tsx scripts/ingest-source.ts <source-config.json>
 *        DATABASE_URL=... npx tsx scripts/ingest-source.ts --from-json <scraped-data.json>
 *
 * Two modes:
 * 1. Config mode: Give it a source config, it scrapes and seeds
 * 2. JSON mode: Give it pre-scraped JSON (same format as data/best-practices.json), it seeds
 *
 * Creates publisher profile if needed, links all practices.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---- Types ----

export interface SourceConfig {
  publisher: {
    name: string;
    slug: string;
    headline: string;
    bio: string;
    website: string;
    contentSourceUrl: string;
    expertiseTags: string[];
  };
  scraper: {
    type: 'single-page-glossary' | 'index-detail' | 'github-markdown' | 'pre-scraped';
    indexUrl?: string;
    baseUrl?: string;
    // For single-page: CSS-like selectors described as extraction rules
    termSelector?: string; // regex pattern to find terms
    definitionPattern?: string; // how to extract definitions
    categoryDefault?: string;
    // For pre-scraped: path to JSON file
    jsonPath?: string;
  };
}

export interface ScrapedTerm {
  slug: string;
  term: string;
  definition: string;
  category: string;
  relatedTerms: string[];
  sourceUrl: string;
}

export interface ScrapedData {
  source: {
    name: string;
    publisher: string;
    url: string;
    attribution: string;
  };
  scrapedAt: string;
  termCount: number;
  categories: string[];
  terms: ScrapedTerm[];
}

// ---- Scraper Implementations ----

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'OTP-Ingestion/1.0 (orgtp.com; best practices aggregator)',
      'Accept': 'text/html,application/xhtml+xml',
    },
  });
  if (!res.ok) throw new Error(`${res.status} for ${url}`);
  return res.text();
}

function slugify(text: string): string {
  return text.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 200);
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Google ML Glossary: single page with <h2> per term
export async function scrapeGoogleMLGlossary(): Promise<ScrapedTerm[]> {
  const url = 'https://developers.google.com/machine-learning/glossary';
  console.log('  Fetching Google ML Glossary...');
  const html = await fetchHtml(url);

  const terms: ScrapedTerm[] = [];
  // Each term is an h2 with id, followed by content until next h2
  const termRegex = /<h2[^>]*id="([^"]+)"[^>]*data-text="([^"]*)"[^>]*>[\s\S]*?<\/h2>([\s\S]*?)(?=<h2[^>]*id="|$)/gi;
  let match;
  while ((match = termRegex.exec(html)) !== null) {
    const id = match[1];
    const termName = match[2] || id.replace(/-/g, ' ');
    const content = match[3];

    // Extract category tags
    const tagMatch = content.match(/class="[^"]*tag[^"]*"[^>]*>([^<]+)/gi);
    const categories = tagMatch
      ? tagMatch.map(t => t.replace(/.*>/, '').replace('#', '').trim()).filter(Boolean)
      : ['General'];
    const category = categories[0] || 'General';

    // Extract definition (first <p> block)
    const defMatch = content.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    const definition = defMatch ? stripHtml(defMatch[1]) : '';

    if (termName && definition && definition.length > 20) {
      terms.push({
        slug: slugify(termName),
        term: termName,
        definition: definition.substring(0, 1500),
        category: category.charAt(0).toUpperCase() + category.slice(1),
        relatedTerms: [],
        sourceUrl: `${url}#${id}`,
      });
    }
  }
  return terms;
}

// AWS Glossary: dt/dd definition lists
export async function scrapeAWSGlossary(): Promise<ScrapedTerm[]> {
  const url = 'https://docs.aws.amazon.com/prescriptive-guidance/latest/agentic-ai-foundations/apg-gloss.html';
  console.log('  Fetching AWS Prescriptive Guidance Glossary...');
  const html = await fetchHtml(url);

  const terms: ScrapedTerm[] = [];
  const dtRegex = /<dt[^>]*id="([^"]*)"[^>]*>([\s\S]*?)<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/gi;
  let match;
  while ((match = dtRegex.exec(html)) !== null) {
    const id = match[1];
    const termName = stripHtml(match[2]).trim();
    const definition = stripHtml(match[3]).trim();

    if (termName && definition && definition.length > 10) {
      terms.push({
        slug: slugify(termName),
        term: termName,
        definition: definition.substring(0, 1500),
        category: 'Cloud AI',
        relatedTerms: [],
        sourceUrl: `${url}#${id}`,
      });
    }
  }
  return terms;
}

// Hopsworks MLOps Dictionary: index page -> individual term pages
export async function scrapeHopsworksDictionary(): Promise<ScrapedTerm[]> {
  const baseUrl = 'https://www.hopsworks.ai';
  const indexUrl = `${baseUrl}/mlops-dictionary`;
  console.log('  Fetching Hopsworks MLOps Dictionary index...');
  const html = await fetchHtml(indexUrl);

  // Extract term links
  const linkRegex = /href="(\/dictionary\/[^"]+)"/g;
  const slugs = new Set<string>();
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    slugs.add(match[1]);
  }

  console.log(`  Found ${slugs.size} term links`);
  const terms: ScrapedTerm[] = [];
  const slugArray = [...slugs];

  for (let i = 0; i < slugArray.length; i += 5) {
    const batch = slugArray.slice(i, i + 5);
    const results = await Promise.allSettled(
      batch.map(async (path) => {
        const pageHtml = await fetchHtml(`${baseUrl}${path}`);
        // Extract term name from h1
        const h1 = pageHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
        const termName = h1 ? stripHtml(h1[1]) : path.split('/').pop()?.replace(/-/g, ' ') || '';
        // Extract definition from first substantial paragraph
        const paragraphs = pageHtml.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
        let definition = '';
        for (const p of paragraphs) {
          const text = stripHtml(p);
          if (text.length > 50 && !text.includes('cookie') && !text.includes('privacy')) {
            definition = text;
            break;
          }
        }
        return {
          slug: slugify(termName || path.split('/').pop() || ''),
          term: termName,
          definition: definition.substring(0, 1500),
          category: 'MLOps',
          relatedTerms: [],
          sourceUrl: `${baseUrl}${path}`,
        };
      })
    );
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value.term && r.value.definition) {
        terms.push(r.value);
      }
    }
    if (i + 5 < slugArray.length) await new Promise(r => setTimeout(r, 300));
    process.stdout.write(`\r  Scraped ${Math.min(i + 5, slugArray.length)}/${slugArray.length}`);
  }
  console.log();
  return terms;
}

// McKinsey Explainers: scrape the explainers index for AI-related "What is..." articles
export async function scrapeMcKinseyExplainers(): Promise<ScrapedTerm[]> {
  const baseUrl = 'https://www.mckinsey.com';
  const indexUrl = `${baseUrl}/featured-insights/mckinsey-explainers`;
  console.log('  Fetching McKinsey Explainers index...');
  const html = await fetchHtml(indexUrl);

  // Find AI-related explainer links
  const aiKeywords = ['artificial-intelligence', 'ai-', 'machine-learning', 'deep-learning', 'generative-ai',
    'ai-agent', 'large-language', 'prompt', 'neural', 'automation', 'agi', 'sovereign-ai',
    'multimodal', 'guardrails', 'rag', 'retrieval-augmented'];
  const linkRegex = /href="(\/featured-insights\/mckinsey-explainers\/[^"]+)"/g;
  const allLinks: string[] = [];
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    const path = match[1];
    if (aiKeywords.some(kw => path.includes(kw))) {
      allLinks.push(path);
    }
  }

  // Also try direct known URLs
  const knownSlugs = [
    'what-is-ai', 'what-is-generative-ai', 'what-is-artificial-general-intelligence-agi',
    'what-is-machine-learning', 'what-is-deep-learning', 'what-is-a-neural-network',
    'what-is-prompt-engineering', 'what-is-an-ai-agent', 'what-is-sovereign-ai',
    'what-is-multimodal-ai', 'what-are-ai-guardrails', 'what-is-retrieval-augmented-generation-rag',
  ];
  for (const slug of knownSlugs) {
    const path = `/featured-insights/mckinsey-explainers/${slug}`;
    if (!allLinks.includes(path)) allLinks.push(path);
  }

  console.log(`  Found ${allLinks.length} AI explainer links`);
  const terms: ScrapedTerm[] = [];

  for (let i = 0; i < allLinks.length; i += 3) {
    const batch = allLinks.slice(i, i + 3);
    const results = await Promise.allSettled(
      batch.map(async (path) => {
        try {
          const pageHtml = await fetchHtml(`${baseUrl}${path}`);
          const h1 = pageHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
          const termName = h1 ? stripHtml(h1[1]) : path.split('/').pop()?.replace(/-/g, ' ') || '';

          // Get meta description or first substantial paragraph
          const metaDesc = pageHtml.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i);
          let definition = metaDesc ? metaDesc[1] : '';
          if (!definition || definition.length < 50) {
            const paragraphs = pageHtml.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
            for (const p of paragraphs) {
              const text = stripHtml(p);
              if (text.length > 80 && !text.includes('cookie') && !text.includes('McKinsey & Company')) {
                definition = text;
                break;
              }
            }
          }

          return {
            slug: slugify(termName),
            term: termName,
            definition: definition.substring(0, 1500),
            category: 'AI Strategy',
            relatedTerms: [],
            sourceUrl: `${baseUrl}${path}`,
          };
        } catch { return null; }
      })
    );
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value && r.value.term && r.value.definition) {
        terms.push(r.value);
      }
    }
    if (i + 3 < allLinks.length) await new Promise(r => setTimeout(r, 500));
  }
  return terms;
}

// Deloitte AI Use Cases
export async function scrapeDeloitteUseCases(): Promise<ScrapedTerm[]> {
  const url = 'https://www.deloitte.com/global/en/issues/generative-ai/ai-use-cases.html';
  console.log('  Fetching Deloitte AI Use Cases...');
  const html = await fetchHtml(url);

  const terms: ScrapedTerm[] = [];
  // Look for use case cards/items
  const cardRegex = /<(?:h[23456]|strong)[^>]*>([\s\S]*?)<\/(?:h[23456]|strong)>/gi;
  const paragraphs = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
  const headings: string[] = [];
  let hMatch;
  while ((hMatch = cardRegex.exec(html)) !== null) {
    const text = stripHtml(hMatch[1]).trim();
    if (text.length > 5 && text.length < 200) headings.push(text);
  }

  // Try to pair headings with following paragraphs
  // Fallback: extract from meta/structured data
  const metaDesc = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i);

  // Extract any JSON-LD
  const jsonLdBlocks = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi) || [];
  for (const block of jsonLdBlocks) {
    try {
      const data = JSON.parse(block.replace(/<[^>]+>/g, ''));
      if (data.itemListElement) {
        for (const item of data.itemListElement) {
          if (item.name) {
            terms.push({
              slug: slugify(item.name),
              term: item.name,
              definition: item.description || `Deloitte AI use case: ${item.name}`,
              category: 'Enterprise AI',
              relatedTerms: [],
              sourceUrl: item.url || url,
            });
          }
        }
      }
    } catch {}
  }

  // If no structured data, extract from visible content
  if (terms.length === 0) {
    // Get all links that look like use case detail pages
    const useCaseLinks = html.match(/href="([^"]*ai-use-case[^"]*)"/gi) || [];
    for (const link of useCaseLinks) {
      const href = link.replace(/href="|"/g, '');
      const name = href.split('/').pop()?.replace(/-/g, ' ').replace(/\.html$/, '') || '';
      if (name.length > 3) {
        terms.push({
          slug: slugify(name),
          term: name.charAt(0).toUpperCase() + name.slice(1),
          definition: `Deloitte AI use case: ${name}`,
          category: 'Enterprise AI',
          relatedTerms: [],
          sourceUrl: href.startsWith('http') ? href : `https://www.deloitte.com${href}`,
        });
      }
    }
  }

  return terms;
}

// DAIR.AI Prompt Engineering Guide from GitHub
export async function scrapeDairAIPromptGuide(): Promise<ScrapedTerm[]> {
  console.log('  Fetching DAIR.AI Prompt Engineering Guide from GitHub...');
  // Fetch the README for the table of contents
  const readmeUrl = 'https://raw.githubusercontent.com/dair-ai/Prompt-Engineering-Guide/main/README.md';
  const readme = await fetchHtml(readmeUrl);

  const terms: ScrapedTerm[] = [];

  // Extract technique pages from the pages directory
  const pagesUrl = 'https://api.github.com/repos/dair-ai/Prompt-Engineering-Guide/contents/pages/techniques';
  try {
    const res = await fetch(pagesUrl, {
      headers: { 'User-Agent': 'OTP-Ingestion/1.0', 'Accept': 'application/vnd.github.v3+json' },
    });
    if (res.ok) {
      const files: any[] = await res.json();
      for (const file of files) {
        if (file.name.endsWith('.mdx') || file.name.endsWith('.md')) {
          const name = file.name.replace(/\.(mdx|md)$/, '').replace(/-/g, ' ');
          if (name === 'index' || name === '_meta') continue;

          // Fetch the file content
          try {
            const contentRes = await fetch(file.download_url);
            const content = await contentRes.text();
            // Get first substantial paragraph
            const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('#') && !l.startsWith('import') && !l.startsWith('---') && l.length > 30);
            const definition = lines.slice(0, 3).join(' ').substring(0, 1500);

            terms.push({
              slug: slugify(name),
              term: name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
              definition: definition || `Prompt engineering technique: ${name}`,
              category: 'Prompt Engineering',
              relatedTerms: [],
              sourceUrl: `https://www.promptingguide.ai/techniques/${file.name.replace(/\.(mdx|md)$/, '')}`,
            });
          } catch {}
        }
      }
    }
  } catch (e) {
    console.log('  GitHub API failed, falling back to known techniques');
  }

  // Add known techniques if GitHub API didn't work or returned few results
  const knownTechniques = [
    'Zero-Shot Prompting', 'Few-Shot Prompting', 'Chain-of-Thought Prompting',
    'Self-Consistency', 'Tree of Thoughts', 'Retrieval Augmented Generation',
    'Automatic Prompt Engineer', 'Active Prompt', 'Directional Stimulus Prompting',
    'ReAct Prompting', 'Reflexion', 'Multimodal CoT Prompting',
    'Graph Prompting', 'Meta Prompting',
  ];
  for (const tech of knownTechniques) {
    if (!terms.find(t => t.term.toLowerCase() === tech.toLowerCase())) {
      terms.push({
        slug: slugify(tech),
        term: tech,
        definition: `Prompt engineering technique: ${tech}. A method for structuring prompts to improve AI model outputs.`,
        category: 'Prompt Engineering',
        relatedTerms: [],
        sourceUrl: `https://www.promptingguide.ai/techniques/${slugify(tech)}`,
      });
    }
  }

  return terms;
}

// PwC Responsible AI
export async function scrapePwCResponsibleAI(): Promise<ScrapedTerm[]> {
  const url = 'https://www.pwc.com/us/en/technology/responsible-ai.html';
  console.log('  Fetching PwC Responsible AI...');
  const html = await fetchHtml(url);

  const terms: ScrapedTerm[] = [];
  // Extract article links from the responsible AI hub
  const linkRegex = /href="(\/us\/en\/[^"]*(?:responsible-ai|artificial-intelligence|ai-)[^"]*)"/gi;
  const links = new Set<string>();
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    links.add(match[1]);
  }

  // Add known article paths
  const knownPaths = [
    '/us/en/technology/responsible-ai.html',
    '/us/en/tech-effect/ai-analytics/responsible-ai-survey.html',
  ];
  for (const p of knownPaths) links.add(p);

  // Scrape each article for title + description
  for (const path of links) {
    try {
      const pageUrl = `https://www.pwc.com${path}`;
      const pageHtml = await fetchHtml(pageUrl);
      const h1 = pageHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      const title = h1 ? stripHtml(h1[1]) : '';
      const metaDesc = pageHtml.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i);
      const definition = metaDesc ? metaDesc[1] : '';

      if (title && definition && title.length > 5) {
        terms.push({
          slug: slugify(title),
          term: title,
          definition: definition.substring(0, 1500),
          category: 'AI Governance',
          relatedTerms: [],
          sourceUrl: pageUrl,
        });
      }
    } catch {}
    await new Promise(r => setTimeout(r, 300));
  }

  return terms;
}

// Accenture AI Case Studies
export async function scrapeAccentureCaseStudies(): Promise<ScrapedTerm[]> {
  const url = 'https://www.accenture.com/us-en/case-studies/data-ai/data-generative-ai-client-stories';
  console.log('  Fetching Accenture AI Case Studies...');
  const html = await fetchHtml(url);

  const terms: ScrapedTerm[] = [];
  // Extract case study cards
  const cardRegex = /href="(\/us-en\/case-stud[^"]+)"[^>]*>([\s\S]*?)(?=href="\/us-en\/case-stud|$)/gi;
  let match;
  while ((match = cardRegex.exec(html)) !== null) {
    const href = match[1];
    const cardContent = match[2];
    const titleMatch = cardContent.match(/<h[23456][^>]*>([\s\S]*?)<\/h[23456]>/i);
    const title = titleMatch ? stripHtml(titleMatch[1]) : '';
    const descMatch = cardContent.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    const desc = descMatch ? stripHtml(descMatch[1]) : '';

    if (title && title.length > 5) {
      terms.push({
        slug: slugify(title),
        term: title,
        definition: desc || `Accenture AI case study: ${title}`,
        category: 'Case Study',
        relatedTerms: [],
        sourceUrl: `https://www.accenture.com${href}`,
      });
    }
  }

  return terms;
}

// Bain AI Insights
export async function scrapeBainInsights(): Promise<ScrapedTerm[]> {
  const url = 'https://www.bain.com/insights/topics/ai/';
  console.log('  Fetching Bain AI Insights...');
  const html = await fetchHtml(url);

  const terms: ScrapedTerm[] = [];
  const linkRegex = /href="(\/insights\/[^"]*ai[^"]*)"/gi;
  const links = new Set<string>();
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    links.add(match[1]);
  }

  for (const path of [...links].slice(0, 30)) {
    try {
      const pageUrl = `https://www.bain.com${path}`;
      const pageHtml = await fetchHtml(pageUrl);
      const h1 = pageHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      const title = h1 ? stripHtml(h1[1]) : '';
      const metaDesc = pageHtml.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i);
      const definition = metaDesc ? metaDesc[1] : '';

      if (title && definition && title.length > 5) {
        terms.push({
          slug: slugify(title),
          term: title,
          definition: definition.substring(0, 1500),
          category: 'AI Strategy',
          relatedTerms: [],
          sourceUrl: pageUrl,
        });
      }
    } catch {}
    await new Promise(r => setTimeout(r, 400));
  }

  return terms;
}

// ---- Seeder ----

async function seedToDatabase(data: ScrapedData) {
  const { db } = await import('../src/config/database.js');
  const { organizations, consultantProfiles, bestPractices } = await import('../src/db/schema.js');
  const { eq, sql } = await import('drizzle-orm');

  const publisherSlug = slugify(data.source.publisher);

  // Find or create org
  let [org] = await db.select().from(organizations)
    .where(eq(organizations.name, data.source.publisher)).limit(1);

  if (!org) {
    [org] = await db.insert(organizations).values({
      name: data.source.publisher,
      industry: 'technology',
      size: 'large',
      clerkOrgId: `publisher_${publisherSlug}`,
      badge: 'founding',
    }).returning();
    console.log(`  Created org: ${org.name}`);
  }

  // Find or create publisher profile
  let [profile] = await db.select().from(consultantProfiles)
    .where(eq(consultantProfiles.slug, publisherSlug)).limit(1);

  if (!profile) {
    [profile] = await db.insert(consultantProfiles).values({
      orgId: org.id,
      slug: publisherSlug,
      displayName: data.source.publisher,
      headline: `AI Knowledge Publisher`,
      bio: data.source.attribution,
      website: data.source.url,
      websiteUrl: data.source.url,
      contentSourceUrl: data.source.url,
      contentCount: data.termCount,
      published: true,
      isPublished: true,
      profileType: 'publisher',
      expertiseTags: data.categories.slice(0, 10) as any,
    }).returning();
    console.log(`  Created publisher profile: ${profile.displayName}`);
  } else {
    // Update content count
    await db.execute(sql`
      UPDATE consultant_profiles
      SET content_count = ${data.termCount}, last_synced_at = NOW(), updated_at = NOW()
      WHERE id = ${profile.id}
    `);
  }

  // Clear existing practices for this publisher
  await db.delete(bestPractices).where(eq(bestPractices.publisherProfileId, profile.id));

  // Insert practices in batches
  const batchSize = 50;
  let inserted = 0;
  for (let i = 0; i < data.terms.length; i += batchSize) {
    const batch = data.terms.slice(i, i + batchSize);
    await db.insert(bestPractices).values(
      batch.map(t => ({
        publisherProfileId: profile.id,
        slug: t.slug,
        term: t.term,
        definition: t.definition,
        category: t.category,
        relatedTerms: t.relatedTerms || [],
        sourceUrl: t.sourceUrl,
        canonicalUrl: t.sourceUrl,
        metadata: { source: data.source.name, scrapedAt: data.scrapedAt },
      }))
    );
    inserted += batch.length;
  }

  console.log(`  Seeded ${inserted} practices for ${data.source.publisher}`);
  return { publisher: data.source.publisher, count: inserted };
}

// ---- Main Pipeline ----

async function runScraper(name: string, scraper: () => Promise<ScrapedTerm[]>, publisher: { name: string; url: string }): Promise<ScrapedData> {
  console.log(`\nScraping: ${name}`);
  const terms = await scraper();
  console.log(`  Got ${terms.length} terms`);

  // Deduplicate by slug
  const seen = new Set<string>();
  const unique = terms.filter(t => {
    if (seen.has(t.slug)) return false;
    seen.add(t.slug);
    return true;
  });

  const categories = [...new Set(unique.map(t => t.category))].sort();

  const data: ScrapedData = {
    source: {
      name,
      publisher: publisher.name,
      url: publisher.url,
      attribution: `Content sourced from ${publisher.name}. All terms link back to original source.`,
    },
    scrapedAt: new Date().toISOString(),
    termCount: unique.length,
    categories,
    terms: unique,
  };

  // Save to disk
  const outputPath = resolve(__dirname, `../data/${slugify(publisher.name)}.json`);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`  Saved to ${outputPath}`);

  return data;
}

// ---- Run All Sources ----

export async function scrapeAndSeedAll() {
  const sources = [
    {
      name: 'Google Machine Learning Glossary',
      scraper: scrapeGoogleMLGlossary,
      publisher: { name: 'Google', url: 'https://developers.google.com/machine-learning/glossary' },
    },
    {
      name: 'AWS Prescriptive Guidance Glossary',
      scraper: scrapeAWSGlossary,
      publisher: { name: 'Amazon Web Services', url: 'https://docs.aws.amazon.com/prescriptive-guidance/' },
    },
    {
      name: 'Hopsworks MLOps Dictionary',
      scraper: scrapeHopsworksDictionary,
      publisher: { name: 'Hopsworks', url: 'https://www.hopsworks.ai' },
    },
    {
      name: 'McKinsey AI Explainers',
      scraper: scrapeMcKinseyExplainers,
      publisher: { name: 'McKinsey & Company', url: 'https://www.mckinsey.com' },
    },
    {
      name: 'Deloitte AI Use Cases',
      scraper: scrapeDeloitteUseCases,
      publisher: { name: 'Deloitte', url: 'https://www.deloitte.com' },
    },
    {
      name: 'DAIR.AI Prompt Engineering Guide',
      scraper: scrapeDairAIPromptGuide,
      publisher: { name: 'DAIR.AI', url: 'https://www.promptingguide.ai' },
    },
    {
      name: 'PwC Responsible AI',
      scraper: scrapePwCResponsibleAI,
      publisher: { name: 'PwC', url: 'https://www.pwc.com' },
    },
    {
      name: 'Accenture AI Case Studies',
      scraper: scrapeAccentureCaseStudies,
      publisher: { name: 'Accenture', url: 'https://www.accenture.com' },
    },
    {
      name: 'Bain AI Insights',
      scraper: scrapeBainInsights,
      publisher: { name: 'Bain & Company', url: 'https://www.bain.com' },
    },
  ];

  console.log(`Running ${sources.length} scrapers...\n`);

  const results: Array<{ publisher: string; count: number }> = [];

  for (const source of sources) {
    try {
      const data = await runScraper(source.name, source.scraper, source.publisher);
      if (data.terms.length > 0) {
        const result = await seedToDatabase(data);
        results.push(result);
      } else {
        console.log(`  Skipping ${source.publisher.name} -- no terms extracted`);
      }
    } catch (err: any) {
      console.error(`  FAILED: ${source.name} -- ${err.message}`);
    }
  }

  console.log('\n=== RESULTS ===');
  let total = 0;
  for (const r of results) {
    console.log(`  ${r.publisher}: ${r.count} practices`);
    total += r.count;
  }
  console.log(`\n  TOTAL: ${total} new practices from ${results.length} publishers`);
}

// ---- CLI ----
const args = process.argv.slice(2);
if (args[0] === '--from-json') {
  // Seed from pre-scraped JSON
  const jsonPath = resolve(args[1]);
  const data = JSON.parse(readFileSync(jsonPath, 'utf-8'));
  seedToDatabase(data).then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
} else {
  // Run all scrapers
  scrapeAndSeedAll().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
}
