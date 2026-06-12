// XSS-CHOKEPOINT tests for renderAgentMarkdown. Agent run output is
// AI-generated markdown rendered to innerHTML, so the security cases (script,
// img onerror, javascript: hrefs, inline onclick/style) are load-bearing: a
// regression here is a stored-XSS hole. The render cases prove the prose
// actually becomes readable HTML.
import { describe, it, expect } from 'vitest';
import { renderAgentMarkdown } from './agent-markdown.js';

describe('renderAgentMarkdown -- markdown rendering', () => {
  it('renders headings to h1-h4', () => {
    const html = renderAgentMarkdown('# One\n\n## Two\n\n### Three\n\n#### Four');
    expect(html).toContain('<h1>One</h1>');
    expect(html).toContain('<h2>Two</h2>');
    expect(html).toContain('<h3>Three</h3>');
    expect(html).toContain('<h4>Four</h4>');
  });

  it('renders unordered lists to ul/li', () => {
    const html = renderAgentMarkdown('- alpha\n- beta');
    expect(html).toContain('<ul>');
    expect(html).toContain('<li>alpha</li>');
    expect(html).toContain('<li>beta</li>');
  });

  it('renders ordered lists to ol/li', () => {
    const html = renderAgentMarkdown('1. first\n2. second');
    expect(html).toContain('<ol>');
    expect(html).toContain('<li>first</li>');
    expect(html).toContain('<li>second</li>');
  });

  it('renders inline code to <code>', () => {
    const html = renderAgentMarkdown('use the `runAgent` helper');
    expect(html).toContain('<code>runAgent</code>');
  });

  it('renders fenced code blocks to pre/code', () => {
    const html = renderAgentMarkdown('```\nconst x = 1;\n```');
    expect(html).toContain('<pre>');
    expect(html).toContain('<code>');
    expect(html).toContain('const x = 1;');
  });

  it('renders bold and italic to strong/em', () => {
    const html = renderAgentMarkdown('**bold** and *italic*');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('<em>italic</em>');
  });

  it('renders blockquotes, horizontal rules, and tables', () => {
    const html = renderAgentMarkdown('> quoted\n\n---\n\n| A | B |\n| - | - |\n| 1 | 2 |');
    expect(html).toContain('<blockquote>');
    expect(html).toContain('<hr');
    expect(html).toContain('<table>');
    expect(html).toContain('<th>A</th>');
    expect(html).toContain('<td>1</td>');
  });

  it('renders links, forcing http(s) only with rel=noopener + target=_blank', () => {
    const html = renderAgentMarkdown('[OTP](https://orgtp.com)');
    expect(html).toContain('href="https://orgtp.com"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('target="_blank"');
  });

  it('round-trips a normal multi-paragraph SOP output to readable HTML', () => {
    const md = [
      '# Daily inbox triage',
      '',
      'Reviewed **12 emails**. Two need a reply.',
      '',
      '## Drafts',
      '',
      '1. Reply to Acme about the proposal',
      '2. Ask Janine for the invoice',
      '',
      'Done.',
    ].join('\n');
    const html = renderAgentMarkdown(md);
    expect(html).toContain('<h1>Daily inbox triage</h1>');
    expect(html).toContain('<h2>Drafts</h2>');
    expect(html).toContain('<strong>12 emails</strong>');
    expect(html).toContain('<ol>');
    expect(html).toContain('<li>Reply to Acme about the proposal</li>');
    expect(html).toMatch(/<p>Done\.<\/p>/);
  });
});

describe('renderAgentMarkdown -- empty / non-string input', () => {
  it('returns "" for empty string', () => {
    expect(renderAgentMarkdown('')).toBe('');
  });
  it('returns "" for whitespace-only string', () => {
    expect(renderAgentMarkdown('   \n  ')).toBe('');
  });
  it('returns "" for non-string input', () => {
    // @ts-expect-error -- deliberately exercising the runtime guard
    expect(renderAgentMarkdown(null)).toBe('');
    // @ts-expect-error
    expect(renderAgentMarkdown(undefined)).toBe('');
    // @ts-expect-error
    expect(renderAgentMarkdown(42)).toBe('');
    // @ts-expect-error
    expect(renderAgentMarkdown({ title: 'x' })).toBe('');
  });
});

describe('renderAgentMarkdown -- XSS allowlist (load-bearing)', () => {
  it('strips <script> tags entirely', () => {
    const html = renderAgentMarkdown('<script>alert(1)</script># Hi');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('alert(1)');
  });

  it('strips <img onerror=...> (img not allowed at all)', () => {
    const html = renderAgentMarkdown('<img src=x onerror="alert(1)">');
    expect(html).not.toContain('<img');
    expect(html).not.toContain('onerror');
    expect(html).not.toContain('alert(1)');
  });

  it('drops javascript: hrefs', () => {
    const html = renderAgentMarkdown('[click](javascript:alert(1))');
    expect(html).not.toContain('javascript:');
    expect(html).not.toContain('alert(1)');
  });

  it('drops data: hrefs', () => {
    const html = renderAgentMarkdown('[x](data:text/html,<script>alert(1)</script>)');
    expect(html).not.toContain('data:text/html');
  });

  it('strips inline onclick handlers', () => {
    const html = renderAgentMarkdown('<a href="https://orgtp.com" onclick="steal()">x</a>');
    expect(html).not.toContain('onclick');
    expect(html).not.toContain('steal()');
  });

  it('strips inline style attributes', () => {
    const html = renderAgentMarkdown('<p style="position:fixed;top:0">x</p>');
    expect(html).not.toContain('style=');
    expect(html).not.toContain('position:fixed');
  });

  it('strips <iframe> and other interactive tags', () => {
    const html = renderAgentMarkdown('<iframe src="https://evil.test"></iframe>');
    expect(html).not.toContain('<iframe');
  });
});
