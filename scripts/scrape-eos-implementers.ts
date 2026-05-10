/**
 * Scrape EOS Worldwide implementer directory via their public WordPress REST API.
 *
 * Source: https://implementer.eosworldwide.com/wp-json/wp/v2/implementer
 * (903 records as of 2026-05-10. Public, no auth required.
 *  robots.txt is permissive (Disallow:) with Crawl-delay: 10.)
 *
 * Output: data/eos-implementers.json (resumable -- skip pages already cached)
 *
 * Usage:
 *   npx tsx scripts/scrape-eos-implementers.ts
 *   npx tsx scripts/scrape-eos-implementers.ts --limit 10   # smoke test
 *   npx tsx scripts/scrape-eos-implementers.ts --refresh    # ignore cache, re-fetch
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'data');
const OUT_PATH = path.join(OUT_DIR, 'eos-implementers.json');

const SOURCE_BASE = 'https://implementer.eosworldwide.com';
const API = `${SOURCE_BASE}/wp-json/wp/v2/implementer`;
const PER_PAGE = 100;
const POLITE_DELAY_MS = 10_000; // matches their Crawl-delay
const UA = 'Mozilla/5.0 (compatible; OTP-Directory-Scraper/1.0; +https://orgtp.com/about)';

interface ImplementerRow {
  source: 'eosworldwide';
  source_id: string;
  slug: string;
  name: string;
  profile_url: string;
  email: string | null;
  phone: string | null;
  photo_url: string | null;
  tagline: string | null;
  bio: string | null;
  bio_text: string | null;
  tier: string | null;
  designation_id: number | null;
  geo_city: string | null;
  geo_state: string | null;
  geo_country: string | null;
  linkedin_url: string | null;
  website_url: string | null;
  key_points: string[];
  intro_video_url: string | null;
  hide_from_directory: boolean;
  modified: string | null;
}

const args = process.argv.slice(2);
const LIMIT = (() => {
  const i = args.indexOf('--limit');
  return i >= 0 && args[i + 1] ? parseInt(args[i + 1], 10) : null;
})();
const REFRESH = args.includes('--refresh');

function clean(s: any): string | null {
  if (s == null) return null;
  const str = String(s).trim();
  if (!str) return null;
  // EOS Worldwide bug: many social_url fields are doubled ("URL" + "URL").
  // Detect 'https://...https://...' and keep only the first.
  const dup = str.match(/^(https?:\/\/[^\s]+?)(https?:\/\/.+)$/);
  if (dup && dup[1] === dup[2]) return dup[1];
  if (dup && str.length > dup[1].length * 1.8) return dup[1];
  return str;
}

function htmlToText(html: string | null | undefined): string | null {
  if (!html) return null;
  const text = String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#39;|&rsquo;/gi, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim();
  return text || null;
}

function pickKeyPoints(meta: any): string[] {
  const raw = meta?.intro_key_point;
  if (!Array.isArray(raw)) return [];
  return raw.map((s: any) => clean(s)).filter((s): s is string => !!s).slice(0, 8);
}

function pickLocation(meta: any) {
  const loc = Array.isArray(meta?.location) ? meta.location[0] : null;
  if (!loc) return { geo_city: null, geo_state: null, geo_country: null };
  return {
    geo_city: clean(loc.geo_city),
    geo_state: clean(loc.geo_state),
    geo_country: clean(loc.geo_country),
  };
}

function pickPhoto(record: any): string | null {
  // Prefer Yoast og_image url
  const yh = record?.yoast_head_json;
  const ogImg = Array.isArray(yh?.og_image) && yh.og_image[0]?.url;
  if (ogImg) return clean(ogImg);
  // Fallback: meta_box.headshot_image[0].file (relative to /wp-content/uploads/)
  const hs = record?.meta_box?.headshot_image;
  if (Array.isArray(hs) && hs[0]?.file) {
    return `${SOURCE_BASE}/wp-content/uploads/${hs[0].file}`;
  }
  return null;
}

function pickWebsiteUrl(meta: any): string | null {
  // EOS profiles don't expose a "personal website" field directly.
  // Some have it in the booking_embed or testimonial_list company URLs.
  // Skip for v1 -- claim flow is the path to add a website.
  return null;
}

function transform(record: any): ImplementerRow {
  const meta = record.meta_box || {};
  const loc = pickLocation(meta);
  return {
    source: 'eosworldwide',
    source_id: String(record.id),
    slug: record.slug,
    name: htmlToText(record?.title?.rendered) || record.slug,
    profile_url: record.link || `${SOURCE_BASE}/${record.slug}/`,
    email: clean(meta.email),
    phone: clean(meta.phone),
    photo_url: pickPhoto(record),
    tagline: clean(meta.value_statement),
    bio: typeof meta.bio === 'string' ? meta.bio : null,
    bio_text: htmlToText(meta.bio),
    // Designation taxonomy IDs are private. Tier label is not on the API,
    // can be backfilled later from the rendered page H2 if needed.
    tier: null,
    designation_id: typeof meta.designation === 'number' ? meta.designation : null,
    geo_city: loc.geo_city,
    geo_state: loc.geo_state,
    geo_country: loc.geo_country,
    linkedin_url: clean(meta.linkedin_url),
    website_url: pickWebsiteUrl(meta),
    key_points: pickKeyPoints(meta),
    intro_video_url: clean(meta.intro_video),
    hide_from_directory: !!meta.hide_from_directory,
    modified: record.modified || record.modified_gmt || null,
  };
}

async function fetchPage(page: number): Promise<{ records: any[]; totalPages: number }> {
  const url = `${API}?per_page=${PER_PAGE}&page=${page}&_fields=id,slug,link,title,modified,modified_gmt,meta_box,yoast_head_json`;
  const res = await fetch(url, {
    headers: { 'user-agent': UA, accept: 'application/json' },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} on page ${page}: ${body.slice(0, 300)}`);
  }
  const totalPages = parseInt(res.headers.get('x-wp-totalpages') || '1', 10);
  const records = (await res.json()) as any[];
  return { records, totalPages };
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  let cache: ImplementerRow[] = [];
  if (!REFRESH && fs.existsSync(OUT_PATH)) {
    cache = JSON.parse(fs.readFileSync(OUT_PATH, 'utf8'));
    console.log(`Loaded ${cache.length} cached records. Use --refresh to re-fetch.`);
  }

  const seenSourceIds = new Set(cache.map((r) => r.source_id));
  const all: ImplementerRow[] = cache.slice();

  // First page tells us total
  console.log(`Fetching page 1 (per_page=${PER_PAGE})...`);
  const first = await fetchPage(1);
  const totalPages = first.totalPages;
  console.log(`Total pages: ${totalPages} (~${totalPages * PER_PAGE} records max)`);

  let added = 0;
  for (const rec of first.records) {
    const row = transform(rec);
    if (!seenSourceIds.has(row.source_id)) {
      all.push(row);
      seenSourceIds.add(row.source_id);
      added++;
    }
  }
  console.log(`Page 1: ${first.records.length} fetched, ${added} new`);
  if (LIMIT && all.length >= LIMIT) {
    console.log(`--limit ${LIMIT} reached after page 1`);
  } else {
    for (let p = 2; p <= totalPages; p++) {
      if (LIMIT && all.length >= LIMIT) break;
      // Polite delay
      await new Promise((r) => setTimeout(r, POLITE_DELAY_MS));
      console.log(`Fetching page ${p}/${totalPages}... (delayed ${POLITE_DELAY_MS / 1000}s)`);
      let attempt = 0;
      let pageData: { records: any[]; totalPages: number } | null = null;
      while (attempt < 3 && !pageData) {
        try {
          pageData = await fetchPage(p);
        } catch (err) {
          attempt++;
          console.warn(`  attempt ${attempt} failed:`, (err as Error).message);
          if (attempt < 3) await new Promise((r) => setTimeout(r, 5000 * attempt));
        }
      }
      if (!pageData) {
        console.error(`  page ${p} permanently failed; saving partial and exiting`);
        break;
      }
      let pageAdded = 0;
      for (const rec of pageData.records) {
        const row = transform(rec);
        if (!seenSourceIds.has(row.source_id)) {
          all.push(row);
          seenSourceIds.add(row.source_id);
          pageAdded++;
        }
      }
      console.log(`  page ${p}: ${pageData.records.length} fetched, ${pageAdded} new (total ${all.length})`);
      // Persist after every page so the run is resumable
      fs.writeFileSync(OUT_PATH, JSON.stringify(all, null, 2));
    }
  }

  // Final write
  fs.writeFileSync(OUT_PATH, JSON.stringify(all, null, 2));

  // Summary
  const visible = all.filter((r) => !r.hide_from_directory);
  const withGeo = visible.filter((r) => r.geo_city || r.geo_country).length;
  const withEmail = visible.filter((r) => r.email).length;
  const withLinkedIn = visible.filter((r) => r.linkedin_url).length;

  console.log(`
=== EOS Implementer Scrape Complete ===
Total records:        ${all.length}
Hidden (skipped):     ${all.length - visible.length}
Importable:           ${visible.length}
  with geo:           ${withGeo}
  with email:         ${withEmail}
  with linkedin:      ${withLinkedIn}
Output: ${OUT_PATH}
`);
}

main().catch((e) => {
  console.error('SCRAPE FAILED:', e);
  process.exit(1);
});
