/**
 * Scraper for AI Best Practices for Commerce glossary
 * Source: McFadyen Digital (ai-best-practices-dev.mcfadyen-digital.workers.dev)
 *
 * Extracts structured data from JSON-LD DefinedTerm blocks on each glossary page.
 * Attribution preserved -- every term links back to the original source.
 *
 * NOTE: This is for a collaboration demo between David and the database creator.
 * All content is attributed and links drive traffic back to McFadyen Digital.
 */

import { writeFileSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'https://ai-best-practices-dev.mcfadyen-digital.workers.dev';
const OUTPUT_FILE = resolve(__dirname, '../data/best-practices.json');

interface BestPractice {
  slug: string;
  term: string;
  definition: string;
  category: string;
  relatedTerms: string[];
  sourceUrl: string;
  canonicalUrl: string;
  lastUpdated: string | null;
  scrapedAt: string;
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} for ${url}`);
  return res.text();
}

function extractAllSlugs(html: string): string[] {
  const slugs = new Set<string>();
  // Match /glossary/slug patterns in links, JSON-LD, and React data
  const regex = /\/glossary\/([a-z0-9][a-z0-9-]*[a-z0-9])/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    slugs.add(match[1]);
  }
  return [...slugs].sort();
}

function extractJsonLdDefinedTerm(html: string): any | null {
  // Find the DefinedTerm JSON-LD block
  const regex = /"@type"\s*:\s*"DefinedTerm"[^}]*"name"\s*:\s*"([^"]+)"[^}]*"description"\s*:\s*"((?:[^"\\]|\\.)*)"/;
  const match = regex.exec(html);
  if (!match) return null;

  // Also try to extract full JSON-LD block
  const jsonLdBlocks = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([^<]+)<\/script>/g) || [];
  for (const block of jsonLdBlocks) {
    const jsonStr = block.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
    try {
      const data = JSON.parse(jsonStr);
      if (data['@type'] === 'DefinedTerm') return data;
    } catch {}
  }
  return null;
}

function extractCategory(html: string): string {
  // Category is in a span with specific styling: background rgba(224,0,0,0.1), color #7A0000
  const catMatch = html.match(/"children"\s*:\s*"([^"]+)"\s*}\s*]\s*}\s*]\s*,\s*\["\$"\s*,\s*"h1"/);
  if (catMatch) return catMatch[1];

  // Fallback: look for category tag in React data
  const reactCatMatch = html.match(/"background":"rgba\(224,0,0,0\.1\)"[^}]*"children":"([^"]+)"/);
  if (reactCatMatch) return reactCatMatch[1];

  // Fallback: look in rendered HTML
  const htmlCatMatch = html.match(/style="[^"]*background:\s*rgba\(224,0,0,0\.1\)[^"]*"[^>]*>([^<]+)/);
  if (htmlCatMatch) return htmlCatMatch[1].trim();

  return 'General';
}

function extractLastUpdated(html: string): string | null {
  const match = html.match(/Last updated:\s*[",]*\s*([A-Z][a-z]+ \d{1,2},\s*\d{4})/);
  return match ? match[1] : null;
}

function stripHtmlTags(html: string): string {
  return html
    .replace(/\\u003c/g, '<')
    .replace(/\\u003e/g, '>')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function extractTermFromPage(html: string, slug: string): BestPractice {
  const jsonLd = extractJsonLdDefinedTerm(html);
  const category = extractCategory(html);
  const lastUpdated = extractLastUpdated(html);

  let term = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  let definition = '';
  let relatedTerms: string[] = [];
  let canonicalUrl = `https://ai-best-practices.com/glossary/${slug}`;

  if (jsonLd) {
    term = jsonLd.name || term;
    definition = stripHtmlTags(jsonLd.description || '');
    relatedTerms = Array.isArray(jsonLd.sameAs) ? jsonLd.sameAs : [];
    canonicalUrl = jsonLd.url || canonicalUrl;
  }

  // If JSON-LD extraction failed, try extracting from React SSR data
  if (!definition) {
    const descMatch = html.match(/"dangerouslySetInnerHTML"\s*:\s*\{"__html"\s*:\s*"((?:[^"\\]|\\.)*)"\s*}/);
    if (descMatch) {
      definition = stripHtmlTags(descMatch[1]);
    }
  }

  // Extract h1 as fallback term name
  if (!jsonLd) {
    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (h1Match) term = h1Match[1].trim();
  }

  return {
    slug,
    term,
    definition: definition || `AI best practice: ${term}`,
    category,
    relatedTerms,
    sourceUrl: `${BASE_URL}/glossary/${slug}`,
    canonicalUrl,
    lastUpdated,
    scrapedAt: new Date().toISOString(),
  };
}

async function scrapeAll() {
  console.log('Step 1: Fetching glossary index to discover all slugs...');
  const indexHtml = await fetchHtml(`${BASE_URL}/glossary`);
  const slugs = extractAllSlugs(indexHtml);
  console.log(`Found ${slugs.length} glossary terms\n`);

  const results: BestPractice[] = [];
  const errors: string[] = [];
  const batchSize = 10;

  for (let i = 0; i < slugs.length; i += batchSize) {
    const batch = slugs.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map(async (slug) => {
        const html = await fetchHtml(`${BASE_URL}/glossary/${slug}`);
        return extractTermFromPage(html, slug);
      })
    );

    for (let j = 0; j < batchResults.length; j++) {
      const result = batchResults[j];
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        errors.push(`${batch[j]}: ${result.reason}`);
      }
    }

    const done = Math.min(i + batchSize, slugs.length);
    const pct = Math.round((done / slugs.length) * 100);
    process.stdout.write(`\r  Scraped ${done}/${slugs.length} (${pct}%)`);

    // Polite delay between batches
    if (i + batchSize < slugs.length) {
      await new Promise(r => setTimeout(r, 300));
    }
  }

  console.log('\n');

  // Write output
  mkdirSync(dirname(OUTPUT_FILE), { recursive: true });

  const output = {
    source: {
      name: 'AI Best Practices for Commerce',
      publisher: 'McFadyen Digital',
      publisherUrl: 'https://mcfadyen.com',
      siteUrl: 'https://ai-best-practices.com',
      devUrl: BASE_URL,
      book: 'https://www.amazon.com/Best-Practices-Commerce-Artificial-Intelligence-ebook/dp/B0GF8N65SP',
      attribution: 'Content sourced from McFadyen Digital. All terms link back to original source to drive traffic.',
    },
    scrapedAt: new Date().toISOString(),
    termCount: results.length,
    categories: [...new Set(results.map(r => r.category))].sort(),
    terms: results.sort((a, b) => a.term.localeCompare(b.term)),
  };

  writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`Saved ${results.length} terms to ${OUTPUT_FILE}`);

  if (errors.length > 0) {
    console.log(`\nErrors (${errors.length}):`);
    errors.forEach(e => console.log(`  - ${e}`));
  }

  // Stats
  const categories: Record<string, number> = {};
  const withDefinition = results.filter(r => r.definition.length > 50).length;
  const withRelated = results.filter(r => r.relatedTerms.length > 0).length;

  for (const r of results) {
    categories[r.category] = (categories[r.category] || 0) + 1;
  }

  console.log(`\nStats:`);
  console.log(`  Terms with definitions: ${withDefinition}/${results.length}`);
  console.log(`  Terms with related terms: ${withRelated}/${results.length}`);
  console.log(`\nCategories:`);
  for (const [cat, count] of Object.entries(categories).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${count}`);
  }
}

scrapeAll().catch(console.error);
