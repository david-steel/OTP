import type { PIIScanResult, PIIFlag, VulnerabilityType, VulnerabilitySeverity } from '../shared/types.js';

// Full vulnerability scanner -- catches secrets, PII, financial data, infrastructure details
// Errs on the side of over-flagging (TR-02 from Red Team Audit)

interface VulnPattern {
  type: VulnerabilityType;
  severity: VulnerabilitySeverity;
  category: PIIFlag['category'];
  regex: RegExp;
  suggestion: string;
}

const PATTERNS: VulnPattern[] = [
  // ── CREDENTIALS (critical) ──
  {
    type: 'api_key',
    severity: 'critical',
    category: 'credentials',
    regex: /(?:sk|pk|api|token|key|secret|auth)[-_]?(?:live|test|prod|dev)?[-_]?[a-zA-Z0-9]{20,}/gi,
    suggestion: 'Remove API key. Replace with "[API_KEY]" or "[REDACTED]"',
  },
  {
    type: 'api_key',
    severity: 'critical',
    category: 'credentials',
    regex: /(?:ANTHROPIC|OPENAI|STRIPE|SENDGRID|TWILIO|AWS|GCP|AZURE|SLACK|GITHUB)[-_](?:API[-_]?KEY|SECRET|TOKEN)\s*[:=]\s*\S+/gi,
    suggestion: 'Remove service API key. Replace with "[SERVICE_API_KEY]"',
  },
  {
    type: 'password',
    severity: 'critical',
    category: 'credentials',
    regex: /(?:password|passwd|pwd)\s*[:=]\s*["']?[^\s"']{4,}["']?/gi,
    suggestion: 'Remove password. Never include passwords in system prompts.',
  },
  {
    type: 'database_url',
    severity: 'critical',
    category: 'credentials',
    regex: /(?:postgres|mysql|mongodb|redis|amqp):\/\/[^\s]+/gi,
    suggestion: 'Remove database connection string. Replace with "[DATABASE_URL]"',
  },
  {
    type: 'url',
    severity: 'critical',
    category: 'credentials',
    regex: /https?:\/\/[^\s]+[?&](?:token|key|auth|secret|password|api_key|access_token)=[^\s&]+/gi,
    suggestion: 'Remove URL with authentication tokens',
  },

  // ── FINANCIAL (high) ──
  {
    type: 'credit_card',
    severity: 'critical',
    category: 'financial',
    regex: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/g,
    suggestion: 'Remove credit card number immediately.',
  },
  {
    type: 'bank_account',
    severity: 'critical',
    category: 'financial',
    regex: /(?:routing|aba|account)\s*(?:number|#|no\.?)?\s*[:=]?\s*\d{8,17}/gi,
    suggestion: 'Remove bank account/routing number. Replace with "[BANK_ACCOUNT]"',
  },
  {
    type: 'ssn',
    severity: 'critical',
    category: 'personal',
    regex: /\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/g,
    suggestion: 'Remove Social Security Number immediately.',
    // Note: validated with context check below to reduce false positives
  },
  {
    type: 'revenue',
    severity: 'high',
    category: 'financial',
    regex: /(?:revenue|mrr|arr|gross|net\s+income|profit|ebitda|run\s*rate|burn\s*rate)\s*(?:is|of|at|[:=])?\s*\$[\d,]+(?:\.\d{2})?(?:\s*(?:\/mo|\/month|\/yr|\/year|k|m|million|billion))?/gi,
    suggestion: 'Remove revenue figures. Replace with "[REVENUE_FIGURE]" or relative terms.',
  },
  {
    type: 'revenue',
    severity: 'high',
    category: 'financial',
    regex: /\$\d{1,3}(?:,\d{3})+(?:\.\d{2})?\s*(?:\/mo|\/month|\/yr|\/year|per\s+month|per\s+year|monthly|annually|recurring)/gi,
    suggestion: 'Remove specific dollar amounts with billing periods. Use relative terms.',
  },
  {
    type: 'pricing',
    severity: 'medium',
    category: 'financial',
    regex: /\$\d{1,3}(?:,\d{3})*(?:\.\d{2})?\/(?:mo|month|yr|year|hr|hour)/gi,
    suggestion: 'Remove specific pricing. Use relative terms like "premium tier" or "base rate".',
  },
  {
    type: 'pricing',
    severity: 'medium',
    category: 'financial',
    regex: /(?:billable|hourly)\s*(?:rate|fee)\s*(?:of|at|is|[:=])?\s*\$\d+/gi,
    suggestion: 'Remove billable rate. Replace with "[BILLABLE_RATE]".',
  },
  {
    type: 'salary',
    severity: 'high',
    category: 'financial',
    regex: /(?:salary|compensation|pay|wage|bonus)\s*(?:of|at|is|[:=])?\s*\$[\d,]+/gi,
    suggestion: 'Remove salary/compensation data. Replace with "[COMPENSATION]".',
  },

  // ── PERSONAL INFORMATION (high) ──
  {
    type: 'email',
    severity: 'high',
    category: 'personal',
    regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    suggestion: 'Remove or replace with "[EMAIL]" or use role-based addresses.',
  },
  {
    type: 'phone',
    severity: 'high',
    category: 'personal',
    regex: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
    suggestion: 'Remove or replace with "[PHONE]".',
  },
  {
    type: 'employee_info',
    severity: 'high',
    category: 'personal',
    regex: /(?:slack\s*(?:user\s*)?id|user\s*id)\s*[:=]\s*[A-Z0-9]{8,}/gi,
    suggestion: 'Remove Slack/user IDs. Replace with "[USER_ID]" or role titles.',
  },

  // ── INFRASTRUCTURE (medium-high) ──
  {
    type: 'ip_address',
    severity: 'medium',
    category: 'infrastructure',
    regex: /\b(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3})\b/g,
    suggestion: 'Remove internal IP address. Replace with "[INTERNAL_IP]".',
  },
  {
    type: 'private_path',
    severity: 'medium',
    category: 'infrastructure',
    regex: /(?:\/(?:Users|home|root)\/[a-zA-Z0-9._-]+(?:\/[a-zA-Z0-9._-]+){2,})/g,
    suggestion: 'Remove private file paths. Replace with relative paths or "[FILE_PATH]".',
  },
  {
    type: 'account_id',
    severity: 'medium',
    category: 'infrastructure',
    regex: /(?:sheet\s*id|spreadsheet|doc(?:ument)?\s*id)\s*[:=`(]\s*[a-zA-Z0-9_-]{20,}/gi,
    suggestion: 'Remove document/sheet IDs. Replace with "[DOC_ID]".',
  },
  {
    type: 'account_id',
    severity: 'medium',
    category: 'infrastructure',
    regex: /(?:MCC|account)\s*[:=`]?\s*\d{3}[-.]?\d{3}[-.]?\d{4}/gi,
    suggestion: 'Remove account identifiers. Replace with "[ACCOUNT_ID]".',
  },

  // ── BUSINESS INTELLIGENCE (medium) ──
  {
    type: 'client_data',
    severity: 'medium',
    category: 'business',
    regex: /(?:client|customer)\s+(?:list|roster|names?)\s*[:=]/gi,
    suggestion: 'Remove client lists. Use anonymized references or "[CLIENT]".',
  },
  {
    type: 'competitive_intel',
    severity: 'low',
    category: 'business',
    regex: /(?:competitor|competing)\s+(?:agency|company|firm)\s*[:=]?\s*\w+/gi,
    suggestion: 'Consider removing competitor references to protect strategic intel.',
  },
];

// SSN context validator -- only flag if it looks like an actual SSN context
const SSN_CONTEXT = /(?:ssn|social\s*security|tax\s*id|ein|itin)/i;

// Names of real people -- detected via "Name: FirstName LastName" or "Person (FirstName LastName)"
const NAME_PATTERN = /(?:^|\n)\s*[-*]\s*\*\*(?:Name|Contact|Owner|Manager|Director|Lead)\*\*\s*[:=]\s*([A-Z][a-z]+ [A-Z][a-z]+)/gm;
const INLINE_NAME_PATTERN = /(?:(?:contact|manager|owner|lead|director|founder|ceo|coo|cto)\s*(?:is|[:=])\s*)([A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/gi;

// Common role titles that should NOT be flagged as names
const ROLE_ALLOWLIST = new Set([
  'ceo', 'cto', 'coo', 'cfo', 'cio', 'cmo', 'vp', 'director', 'manager',
  'lead', 'engineer', 'designer', 'analyst', 'coordinator', 'assistant',
  'founder', 'co-founder', 'partner', 'advisor', 'consultant',
  'the ceo', 'the cto', 'the ops lead', 'the founder',
  'david steel', // OTP demo content -- don't flag in examples
]);

export function scanForPII(text: string, location: string = 'content'): PIIScanResult {
  const flags: PIIFlag[] = [];

  // Run regex patterns
  for (const pattern of PATTERNS) {
    let match: RegExpExecArray | null;
    pattern.regex.lastIndex = 0;

    while ((match = pattern.regex.exec(text)) !== null) {
      const matchText = match[0];

      // SSN false positive reduction: only flag if SSN context exists nearby
      if (pattern.type === 'ssn') {
        const start = Math.max(0, match.index - 100);
        const end = Math.min(text.length, match.index + matchText.length + 100);
        const context = text.slice(start, end);
        if (!SSN_CONTEXT.test(context)) continue;
      }

      flags.push({
        type: pattern.type,
        severity: pattern.severity,
        category: pattern.category,
        text: redactForDisplay(matchText, pattern.type),
        location,
        confidence: pattern.severity === 'critical' ? 0.95 : 0.85,
        suggestion: pattern.suggestion,
      });
    }
  }

  // Detect named individuals
  const namePatterns = [NAME_PATTERN, INLINE_NAME_PATTERN];
  for (const np of namePatterns) {
    np.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = np.exec(text)) !== null) {
      const name = match[1]?.trim();
      if (name && !ROLE_ALLOWLIST.has(name.toLowerCase())) {
        flags.push({
          type: 'name',
          severity: 'high',
          category: 'personal',
          text: name,
          location,
          confidence: 0.8,
          suggestion: `Remove personal name. Replace with role title like "[TEAM_MEMBER]" or "[CONTACT_NAME]".`,
        });
      }
    }
  }

  const summary = buildSummary(flags);

  return { clean: flags.length === 0, flags, summary };
}

export function scanOOSContent(rawContent: string): PIIScanResult {
  const allFlags: PIIFlag[] = [];

  // Scan full content
  const fullScan = scanForPII(rawContent, 'full_content');
  allFlags.push(...fullScan.flags);

  // Deduplicate flags (same text might match multiple patterns)
  const uniqueFlags = allFlags.filter((flag, index) => {
    return allFlags.findIndex(f => f.text === flag.text && f.type === flag.type) === index;
  });

  const summary = buildSummary(uniqueFlags);

  return { clean: uniqueFlags.length === 0, flags: uniqueFlags, summary };
}

// Redact sensitive values for display (don't show full CC#, keys, etc.)
function redactForDisplay(text: string, type: VulnerabilityType): string {
  if (type === 'credit_card') {
    return text.slice(0, 4) + ' **** **** ' + text.slice(-4);
  }
  if (type === 'ssn') {
    return '***-**-' + text.slice(-4);
  }
  if (type === 'api_key' || type === 'password' || type === 'database_url') {
    if (text.length > 12) return text.slice(0, 8) + '...[REDACTED]';
  }
  if (type === 'bank_account') {
    return text.replace(/\d(?=\d{4})/g, '*');
  }
  // For everything else, show as-is (emails, phones are less sensitive in display)
  return text;
}

function buildSummary(flags: PIIFlag[]): PIIScanResult['summary'] {
  return {
    critical: flags.filter(f => f.severity === 'critical').length,
    high: flags.filter(f => f.severity === 'high').length,
    medium: flags.filter(f => f.severity === 'medium').length,
    low: flags.filter(f => f.severity === 'low').length,
    total: flags.length,
  };
}
