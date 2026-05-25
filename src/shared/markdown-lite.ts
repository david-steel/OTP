/**
 * Minimal, opinionated markdown → safe HTML for the in-app description
 * fields (to-dos, issues, etc.). Supports only three patterns, on
 * purpose:
 *
 *   **bold**          -> <strong>bold</strong>
 *   *italic*          -> <em>italic</em>
 *   [label](url)      -> <a href="url" target="_blank" rel="noopener noreferrer">label</a>
 *
 * Everything else is HTML-escaped. Newlines render as <br>. URLs are
 * gated to http/https/mailto so a malicious description cannot inject
 * javascript: or data: links. This is much smaller than a real
 * markdown engine and gives us bold / italic / link without pulling
 * in a library or a contenteditable editor.
 *
 * The matching toolbar lives in src/views/partials/rich-description-editor.ejs
 * -- if you change the syntax here, update the toolbar's wrappers too.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const SAFE_URL = /^(https?:|mailto:)/i;

export function renderDescription(input: string | null | undefined): string {
  if (!input) return '';
  // 1) Escape the whole string first so user-provided HTML stays inert.
  let out = escapeHtml(String(input));

  // 2) Links: [label](url). Done first so the [ ] ( ) inside the link
  //    cannot accidentally trigger the bold/italic passes below.
  out = out.replace(/\[([^\]\n]+)\]\(([^)\s]+)\)/g, (_m, label: string, url: string) => {
    if (!SAFE_URL.test(url)) return label; // unsafe scheme -- drop the link, keep the label
    // url is already escaped from step 1, so " and < are safe in the attribute.
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  });

  // 3) Bold: **text**. Must run before single-asterisk italic so the
  //    inner asterisks don't get eaten by the italic pass.
  out = out.replace(/\*\*([^\s*][^*]*?)\*\*/g, '<strong>$1</strong>');

  // 4) Italic: *text*. Avoid matching the asterisks left over from
  //    inside a **bold** run by requiring a non-asterisk on both sides.
  out = out.replace(/(^|[^*])\*([^\s*][^*]*?)\*(?!\*)/g, '$1<em>$2</em>');

  // 5) Preserve line breaks the way users wrote them.
  out = out.replace(/\n/g, '<br>');

  return out;
}
