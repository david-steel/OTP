import { readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import yaml from 'yaml';
import { marked } from 'marked';

const POSTS_DIR = join(process.cwd(), 'content', 'conatus-posts');
const FILENAME_RE = /^(\d{4}-\d{2}-\d{2})-([a-z0-9-]+)\.md$/;
const SLUG_RE = /^[a-z0-9-]+$/;

export interface ConatusPostMeta {
  slug: string;
  title: string;
  date: string;
  author: string;
  type: string;
  filename: string;
  description: string;
}

export interface ConatusPost extends ConatusPostMeta {
  html: string;
  wordCount: number;
  faq: { question: string; answer: string }[];
}

function splitFrontmatter(raw: string): { data: Record<string, unknown>; body: string } {
  const normalized = raw.replace(/^\uFEFF/, '');
  if (!/^---\r?\n/.test(normalized)) return { data: {}, body: normalized };
  const afterOpen = normalized.replace(/^---\r?\n/, '');
  const closeIdx = afterOpen.search(/\r?\n---\r?\n/);
  if (closeIdx === -1) return { data: {}, body: normalized };
  const fmRaw = afterOpen.slice(0, closeIdx);
  const rest = afterOpen.slice(closeIdx).replace(/^\r?\n---\r?\n/, '');
  let data: Record<string, unknown> = {};
  try { data = (yaml.parse(fmRaw) as Record<string, unknown>) || {}; } catch { data = {}; }
  return { data, body: rest };
}

function firstParagraph(body: string): string {
  const trimmed = body.trim();
  const para = trimmed.split(/\r?\n\s*\r?\n/, 1)[0] || '';
  const plain = para
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[(.+?)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  return plain.length > 200 ? plain.slice(0, 197).trimEnd() + '...' : plain;
}

function extractLeadingH1(body: string): { title: string | null; rest: string } {
  const m = /^\s*#\s+(.+?)\s*\r?\n/.exec(body);
  if (!m) return { title: null, rest: body };
  return { title: m[1].trim(), rest: body.slice(m[0].length).replace(/^\r?\n/, '') };
}

function stripMd(s: string): string {
  return s
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[(.+?)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

// Extract a FAQ section ("## Frequently asked questions" / "## FAQ") into
// {question, answer} pairs for FAQPage JSON-LD. Questions are bold lines that
// end in "?" or H3 headings; the answer is the prose until the next question or
// the end of the section (next H2). Returns [] when there is no FAQ section.
function extractFaq(body: string): { question: string; answer: string }[] {
  const lines = body.split(/\r?\n/);
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^##\s+(frequently asked questions|faqs?)\b/i.test(lines[i].trim())) { start = i + 1; break; }
  }
  if (start === -1) return [];
  let end = lines.length;
  for (let i = start; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i].trim())) { end = i; break; }
  }
  const faqs: { question: string; answer: string }[] = [];
  let q: string | null = null;
  let a: string[] = [];
  const flush = () => {
    if (q) {
      const ans = stripMd(a.join(' '));
      if (ans) faqs.push({ question: stripMd(q), answer: ans });
    }
    q = null; a = [];
  };
  for (let i = start; i < end; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const mH3 = /^###\s+(.+?)\s*$/.exec(line);
    const mBold = /^\*\*(.+?)\*\*:?\s*$/.exec(line);
    const isBoldQ = mBold && /\?\s*$/.test(mBold[1]);
    if (mH3 || isBoldQ) {
      flush();
      q = (mH3 ? mH3[1] : mBold![1]).trim();
    } else if (q) {
      a.push(line);
    }
  }
  flush();
  return faqs;
}

function readPostFile(filename: string): { meta: ConatusPostMeta; body: string } | null {
  const m = FILENAME_RE.exec(filename);
  if (!m) return null;
  const fileDate = m[1];
  const fileSlug = m[2];
  const full = join(POSTS_DIR, filename);
  let raw: string;
  try { raw = readFileSync(full, 'utf8'); } catch { return null; }
  const { data, body: rawBody } = splitFrontmatter(raw);
  // Draft gate: a post with `status: draft` in frontmatter is hidden from both
  // the index and direct /blog/:slug access until the status is flipped to
  // published. Lets us commit finished drafts to the live posts dir for review
  // without exposing them. Any other status (or none) renders as before.
  if (String(data.status || '').trim().toLowerCase() === 'draft') return null;
  const fmSlug = String(data.slug || '').trim();
  const slug = (fmSlug && SLUG_RE.test(fmSlug)) ? fmSlug : fileSlug;
  if (!SLUG_RE.test(slug)) return null;
  const { title: bodyTitle, rest: body } = extractLeadingH1(rawBody);
  const title = String(data.title || bodyTitle || slug);
  const meta: ConatusPostMeta = {
    slug,
    title,
    date: String(data.date || fileDate),
    author: String(data.author || 'conatus'),
    type: String(data.type || 'essay'),
    filename,
    description: firstParagraph(body),
  };
  return { meta, body };
}

function scanDir(): string[] {
  if (!existsSync(POSTS_DIR)) return [];
  try { return readdirSync(POSTS_DIR).filter(f => FILENAME_RE.test(f)); } catch { return []; }
}

export function listConatusPosts(): ConatusPostMeta[] {
  const posts: ConatusPostMeta[] = [];
  for (const f of scanDir()) {
    const p = readPostFile(f);
    if (p) posts.push(p.meta);
  }
  posts.sort((a, b) => b.date.localeCompare(a.date));
  return posts;
}

export function getConatusPost(slug: string): ConatusPost | null {
  if (!SLUG_RE.test(slug)) return null;
  for (const f of scanDir()) {
    const p = readPostFile(f);
    if (p && p.meta.slug === slug) {
      const html = marked.parse(p.body, { async: false }) as string;
      const wordCount = p.body.split(/\s+/).filter(Boolean).length;
      return { ...p.meta, html, wordCount, faq: extractFaq(p.body) };
    }
  }
  return null;
}
