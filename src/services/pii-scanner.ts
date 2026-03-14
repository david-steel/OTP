import type { PIIScanResult, PIIFlag } from '../shared/types.js';

// PII detection patterns -- errs on the side of over-flagging (TR-02 from Red Team Audit)
const PATTERNS: Array<{
  type: PIIFlag['type'];
  regex: RegExp;
  suggestion: string;
}> = [
  {
    type: 'email',
    regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    suggestion: 'Remove or replace with "[email redacted]"',
  },
  {
    type: 'phone',
    regex: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
    suggestion: 'Remove or replace with "[phone redacted]"',
  },
  {
    type: 'pricing',
    regex: /\$\d{1,3}(?:,\d{3})*(?:\.\d{2})?(?:\/(?:mo|month|yr|year|hr|hour))?/gi,
    suggestion: 'Remove specific pricing. Use relative terms like "premium tier" or "base rate"',
  },
  {
    type: 'url',
    regex: /https?:\/\/[^\s]+[?&](?:token|key|auth|secret|password|api_key)=[^\s&]+/gi,
    suggestion: 'Remove URL with authentication tokens',
  },
  {
    type: 'account_id',
    regex: /(?:account|id|key|token)[\s:=]+[a-zA-Z0-9]{20,}/gi,
    suggestion: 'Remove account identifiers',
  },
];

// Common role titles that should NOT be flagged as names
const ALLOWLIST = new Set([
  'ceo', 'cto', 'coo', 'cfo', 'cio', 'cmo', 'vp', 'director', 'manager',
  'lead', 'engineer', 'designer', 'analyst', 'coordinator', 'assistant',
  'founder', 'co-founder', 'partner', 'advisor', 'consultant',
  'the ceo', 'the cto', 'the ops lead', 'the founder',
]);

export function scanForPII(text: string, location: string = 'content'): PIIScanResult {
  const flags: PIIFlag[] = [];

  // Run regex patterns
  for (const pattern of PATTERNS) {
    let match: RegExpExecArray | null;
    pattern.regex.lastIndex = 0;

    while ((match = pattern.regex.exec(text)) !== null) {
      flags.push({
        type: pattern.type,
        text: match[0],
        location,
        confidence: 0.9,
        suggestion: pattern.suggestion,
      });
    }
  }

  return {
    clean: flags.length === 0,
    flags,
  };
}

export function scanOOSContent(rawContent: string): PIIScanResult {
  const allFlags: PIIFlag[] = [];

  // Scan full content
  const fullScan = scanForPII(rawContent, 'full_content');
  allFlags.push(...fullScan.flags);

  // Deduplicate flags (same text might match in full scan and section scan)
  const uniqueFlags = allFlags.filter((flag, index) => {
    return allFlags.findIndex(f => f.text === flag.text && f.type === flag.type) === index;
  });

  return {
    clean: uniqueFlags.length === 0,
    flags: uniqueFlags,
  };
}
