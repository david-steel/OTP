// Lint rule (enforced in CI via vitest): no raw `<%- JSON.stringify(...) %>`
// inside EJS views. JSON.stringify does NOT escape the literal `</script>`, so
// embedding its output in an inline <script> lets tenant-controlled data break
// out of the script context -- a stored XSS. The blessed pattern is the
// per-file `jsonForScript()` helper, which escapes `<` and `>` to </>.
//
// `<%=` (auto-escaped) is fine; this rule only targets `<%-` (raw output).
// If this test fails: replace `<%- JSON.stringify(x) %>` with
// `<%- jsonForScript(x) %>` and make sure the file defines the helper near top.
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const VIEWS_DIR = fileURLToPath(new URL('.', import.meta.url));

function walkEjs(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...walkEjs(p));
    else if (p.endsWith('.ejs')) out.push(p);
  }
  return out;
}

// Raw EJS output tag (`<%-`) that pipes a JSON.stringify call straight into the
// page, all within one tag (the [^%]* stops at the closing `%`).
const RAW_SINK = /<%-[^%]*JSON\.stringify/;

describe('EJS XSS lint: no raw JSON.stringify in script context', () => {
  it('every script-context JSON sink is routed through jsonForScript()', () => {
    const offenders: string[] = [];
    for (const file of walkEjs(VIEWS_DIR)) {
      readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
        if (RAW_SINK.test(line)) offenders.push(`${file.replace(VIEWS_DIR, '')}:${i + 1}`);
      });
    }
    expect(
      offenders,
      `Raw \`<%- JSON.stringify(...)\` is a stored-XSS risk (</script> breakout). ` +
        `Use \`<%- jsonForScript(...) %>\` instead. Offenders:\n  ${offenders.join('\n  ')}`,
    ).toEqual([]);
  });
});
