/**
 * agent-markdown.ts -- the XSS chokepoint for rendering agent run output.
 *
 * Agent run output is AI-generated markdown (headings, fenced code, lists,
 * links, tables). The /processes hub used to dump it as raw monospace source;
 * we now render it to HTML so it reads like a document. Because the source is
 * model-generated (untrusted), EVERY render passes through a STRICT
 * sanitize-html allowlist before it can reach innerHTML in the browser.
 *
 * renderAgentMarkdown(md) = sanitizeHtml( marked.parse(md) ) with:
 *   - a tiny tag allowlist (prose + code + tables, nothing interactive),
 *   - only http/https/mailto hrefs on <a>, forced rel=noopener target=_blank,
 *   - ALL event-handler / style / script / class attributes stripped.
 *
 * Pure-ish: imports marked + sanitize-html, no DB, no I/O. Safe to import from
 * the API route layer and to unit-test in isolation.
 */
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

// The ONLY tags an agent's output may render as. Everything else (script,
// img, iframe, style, form, input, svg, ...) is dropped by sanitize-html.
const ALLOWED_TAGS = [
  'h1', 'h2', 'h3', 'h4',
  'p', 'ul', 'ol', 'li',
  'pre', 'code',
  'strong', 'em', 'blockquote',
  'a', 'br', 'hr',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
];

const SANITIZE_OPTS: sanitizeHtml.IOptions = {
  allowedTags: ALLOWED_TAGS,
  // <a> may carry only href + the safe link attrs we force on below; nothing
  // else (no onclick, no style, no class). rel/target are allowlisted so the
  // transformTags step's rel=noopener + target=_blank survive sanitization.
  allowedAttributes: { a: ['href', 'rel', 'target'] },
  // Hrefs limited to safe navigational schemes. javascript:, data:, vbscript:
  // and friends are not in the list, so sanitize-html strips the attribute.
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: { a: ['http', 'https', 'mailto'] },
  // Relative links (e.g. href="/foo") are fine and stay.
  allowProtocolRelative: false,
  // Force safe link behavior on every surviving <a>.
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer', target: '_blank' }),
  },
  // Drop, rather than escape, the contents of disallowed tags like <script>.
  disallowedTagsMode: 'discard',
};

/**
 * Render agent-generated markdown to a safe HTML string. Empty / non-string
 * input returns ''. The returned HTML is sanitized and safe to assign to
 * innerHTML on the client.
 */
export function renderAgentMarkdown(md: string): string {
  if (typeof md !== 'string' || md.trim() === '') return '';
  // marked is configured for synchronous parsing; async:false guarantees a
  // string return (not a Promise) so the type and the sanitize step line up.
  const rawHtml = marked.parse(md, { async: false }) as string;
  return sanitizeHtml(rawHtml, SANITIZE_OPTS);
}
