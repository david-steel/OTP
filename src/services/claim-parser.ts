import { parse as parseYAML } from 'yaml';
import { oosFrontmatterSchema, claimSchema } from '../shared/validation.js';
import type { OOSFrontmatter, ParsedClaim, ParseResult, ValidationError } from '../shared/types.js';
import type { TemplateType } from '../shared/enums.js';

const FRONTMATTER_REGEX = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
const CLAIM_BLOCK_REGEX = /\*\*\[C(\d+)\]\*\*\s+(\S+)\n([\s\S]*?)(?=\*\*\[C\d+\]\*\*|\n## |\n$)/g;
const FIELD_REGEX = {
  rule: /\*\*Rule:\*\*\s*([\s\S]*?)(?=\n-\s*\*\*|$)/,
  why: /\*\*Why:\*\*\s*([\s\S]*?)(?=\n-\s*\*\*|$)/,
  failureMode: /\*\*Failure mode:\*\*\s*([\s\S]*?)(?=\n-\s*\*\*|$)/,
  confidence: /\*\*Confidence:\*\*\s*(HIGH|MEDIUM|LOW)/,
  evidence: /\*\*Evidence:\*\*\s*(HUMAN_DEFINED_RULE|OBSERVED_ONCE|OBSERVED_REPEATEDLY|MEASURED_RESULT|INFERENCE|SPECULATION)/,
  scope: /\*\*Scope:\*\*\s*([\s\S]*?)(?=\n-\s*\*\*|\n\*\*\[|$)/,
};

export function parseOOS(markdown: string, template: TemplateType): ParseResult {
  const errors: ValidationError[] = [];

  // Split frontmatter from content
  const fmMatch = markdown.match(FRONTMATTER_REGEX);
  if (!fmMatch) {
    return {
      frontmatter: {} as OOSFrontmatter,
      claims: [],
      wordCount: 0,
      errors: [{
        code: 'MISSING_FRONTMATTER',
        field: 'frontmatter',
        message: 'OOS file must start with YAML frontmatter between --- delimiters',
      }],
    };
  }

  const [, fmRaw, content] = fmMatch;

  // Parse frontmatter
  let frontmatter: OOSFrontmatter;
  try {
    const parsed = parseYAML(fmRaw);
    const result = oosFrontmatterSchema.safeParse(parsed);
    if (!result.success) {
      for (const issue of result.error.issues) {
        errors.push({
          code: 'FRONTMATTER_INVALID',
          field: issue.path.join('.'),
          message: issue.message,
          value: undefined,
          expected: undefined,
        });
      }
      frontmatter = parsed as OOSFrontmatter;
    } else {
      frontmatter = result.data;
    }
  } catch (e) {
    return {
      frontmatter: {} as OOSFrontmatter,
      claims: [],
      wordCount: 0,
      errors: [{
        code: 'FRONTMATTER_PARSE_ERROR',
        field: 'frontmatter',
        message: `Failed to parse YAML frontmatter: ${(e as Error).message}`,
      }],
    };
  }

  // Calculate word count (content only)
  const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;

  // Parse claims
  const claims: ParsedClaim[] = [];
  let match: RegExpExecArray | null;
  let order = 0;

  // Reset regex lastIndex
  CLAIM_BLOCK_REGEX.lastIndex = 0;

  while ((match = CLAIM_BLOCK_REGEX.exec(content)) !== null) {
    const claimNum = match[1];
    const section = match[2].trim();
    const body = match[3];

    const claimId = `C${claimNum.padStart(3, '0')}`;

    const rule = body.match(FIELD_REGEX.rule)?.[1]?.trim() || '';
    const why = body.match(FIELD_REGEX.why)?.[1]?.trim() || '';
    const failureMode = body.match(FIELD_REGEX.failureMode)?.[1]?.trim() || '';
    const confidence = body.match(FIELD_REGEX.confidence)?.[1] || '';
    const evidence = body.match(FIELD_REGEX.evidence)?.[1] || '';
    const scope = body.match(FIELD_REGEX.scope)?.[1]?.trim() || '';

    // Calculate token cost: ~1 token per 4 characters of loaded content
    const claimText = [rule, why, failureMode, scope, section, claimId].join(' ');
    const tokenCost = Math.ceil(claimText.length / 4);

    const claim: ParsedClaim = {
      claimId,
      section,
      displayOrder: order++,
      rule,
      why,
      failureMode,
      confidence: confidence as ParsedClaim['confidence'],
      evidence: evidence as ParsedClaim['evidence'],
      scope,
      tokenCost,
    };

    // Validate individual claim
    const claimResult = claimSchema.safeParse(claim);
    if (!claimResult.success) {
      for (const issue of claimResult.error.issues) {
        errors.push({
          code: 'CLAIM_INVALID',
          field: `${claimId}.${issue.path.join('.')}`,
          message: `Claim ${claimId}: ${issue.message}`,
          value: undefined,
        });
      }
    }

    claims.push(claim);
  }

  return { frontmatter, claims, wordCount, errors };
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}
