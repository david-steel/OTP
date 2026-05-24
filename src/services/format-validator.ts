import type { ParseResult, ValidationResult, ValidationError, ValidationWarning } from '../shared/types.js';
import type { TemplateType } from '../shared/enums.js';
import {
  UNIVERSAL_SECTIONS,
  AGENT_ARMY_SECTIONS,
  VALUE_CHAIN_SECTIONS,
  ORG_CHART_SECTIONS,
  CLAIM_SECTIONS,
  SECTION_CLAIM_LIMITS,
} from '../shared/validation.js';

const PROSE_ONLY_SECTIONS = [
  'purpose',
  'prime_directives',
  'system_identity',
  'confidence_map',
  'merge_protocol',
  'update_protocol',
  'summary',
];

function getRequiredSections(template: TemplateType): readonly string[] {
  const universal = [...UNIVERSAL_SECTIONS];
  switch (template) {
    case 'agent_army':
      return [...universal, ...AGENT_ARMY_SECTIONS];
    case 'value_chain':
      return [...universal, ...VALUE_CHAIN_SECTIONS];
    case 'org_chart':
      return [...universal, ...ORG_CHART_SECTIONS];
  }
}

export function validateOOS(parsed: ParseResult, template: TemplateType): ValidationResult {
  const errors: ValidationError[] = [...parsed.errors];
  const warnings: ValidationWarning[] = [];

  // 1. Word count range
  if (parsed.wordCount < 500) {
    errors.push({
      code: 'WORD_COUNT_BELOW_MINIMUM',
      field: 'wordCount',
      message: `Word count is ${parsed.wordCount}. Minimum is 500.`,
      value: parsed.wordCount,
      expected: 500,
    });
  }
  if (parsed.wordCount > 15000) {
    errors.push({
      code: 'WORD_COUNT_ABOVE_MAXIMUM',
      field: 'wordCount',
      message: `Word count is ${parsed.wordCount}. Maximum is 15000.`,
      value: parsed.wordCount,
      expected: 15000,
    });
  }

  // 2. Minimum claim count
  // OOS v1.1 (2026-05-24): floor lowered from 10 -> 3 so solo operators
  // and compact teams can publish real artifacts without padding. The
  // 10-claim "network norm" survives as a non-blocking warning below,
  // because under ~10 the confidence/evidence distributions still don't
  // have much statistical signal -- but a 3-claim OOS with sharp,
  // honestly-rated rules is more valuable than a padded 10.
  if (parsed.claims.length < 3) {
    errors.push({
      code: 'CLAIM_COUNT_BELOW_MINIMUM',
      field: 'claimCount',
      message: `Only ${parsed.claims.length} claim${parsed.claims.length === 1 ? '' : 's'} found. The protocol minimum is 3 -- enough for the confidence/evidence patterns to show. Add at least ${3 - parsed.claims.length} more before publishing.`,
      value: parsed.claims.length,
      expected: 3,
    });
  } else if (parsed.claims.length < 10) {
    warnings.push({
      code: 'CLAIM_COUNT_BELOW_NETWORK_NORM',
      field: 'claimCount',
      message: `Only ${parsed.claims.length} claims found. That's fine for a compact OOS. The network norm is 10+ if you want richer confidence and evidence distributions.`,
    });
  }

  // 3. Unique claim IDs
  const claimIds = parsed.claims.map(c => c.claimId);
  const duplicateIds = claimIds.filter((id, i) => claimIds.indexOf(id) !== i);
  if (duplicateIds.length > 0) {
    errors.push({
      code: 'DUPLICATE_CLAIM_IDS',
      field: 'claims',
      message: `Duplicate claim IDs found: ${[...new Set(duplicateIds)].join(', ')}`,
      value: duplicateIds,
    });
  }

  // 4. Section claim counts within limits
  const sectionCounts: Record<string, number> = {};
  for (const claim of parsed.claims) {
    sectionCounts[claim.section] = (sectionCounts[claim.section] || 0) + 1;
  }

  for (const [section, count] of Object.entries(sectionCounts)) {
    const limit = SECTION_CLAIM_LIMITS[section];
    if (limit && count > limit) {
      errors.push({
        code: 'SECTION_CLAIM_LIMIT_EXCEEDED',
        field: `section.${section}`,
        message: `Section "${section}" has ${count} claims. Maximum is ${limit}.`,
        value: count,
        expected: limit,
      });
    }

    // Check claims in prose-only sections
    if (PROSE_ONLY_SECTIONS.includes(section)) {
      errors.push({
        code: 'CLAIMS_IN_PROSE_SECTION',
        field: `section.${section}`,
        message: `Section "${section}" is prose-only but contains ${count} claim(s).`,
        value: count,
        expected: 0,
      });
    }
  }

  // 5. Warnings for empty claim sections
  const claimSections = CLAIM_SECTIONS as readonly string[];
  for (const section of claimSections) {
    if (!sectionCounts[section] || sectionCounts[section] === 0) {
      // Only warn for sections relevant to this template
      const required = getRequiredSections(template);
      if (required.includes(section)) {
        warnings.push({
          code: 'EMPTY_CLAIM_SECTION',
          field: `section.${section}`,
          message: `Section "${section}" has 0 claims. Consider adding operational intelligence here.`,
        });
      }
    }
  }

  // 6. Failure patterns warning
  if (!sectionCounts['failure_patterns'] || sectionCounts['failure_patterns'] === 0) {
    warnings.push({
      code: 'NO_FAILURE_PATTERNS',
      field: 'section.failure_patterns',
      message: 'No failure patterns documented. Organizations that share failure modes are rated higher and attract more subscribers.',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
