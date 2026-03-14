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
  if (parsed.wordCount < 1800) {
    errors.push({
      code: 'WORD_COUNT_BELOW_MINIMUM',
      field: 'wordCount',
      message: `Word count is ${parsed.wordCount}. Minimum is 1800.`,
      value: parsed.wordCount,
      expected: 1800,
    });
  }
  if (parsed.wordCount > 3000) {
    errors.push({
      code: 'WORD_COUNT_ABOVE_MAXIMUM',
      field: 'wordCount',
      message: `Word count is ${parsed.wordCount}. Maximum is 3000.`,
      value: parsed.wordCount,
      expected: 3000,
    });
  }

  // 2. Minimum claim count
  if (parsed.claims.length < 10) {
    errors.push({
      code: 'CLAIM_COUNT_BELOW_MINIMUM',
      field: 'claimCount',
      message: `Only ${parsed.claims.length} claims found. Minimum is 10.`,
      value: parsed.claims.length,
      expected: 10,
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
