import { parse as parseYAML, stringify as stringifyYAML } from 'yaml';
import { CONFIDENCE_LEVELS, EVIDENCE_TYPES, TEMPLATE_TYPES, ORG_SIZES } from '../shared/enums.js';
import type { TemplateType } from '../shared/enums.js';

export interface FixResult {
  fixed: string;
  fixes: FixAction[];
  unfixable: UnfixableIssue[];
}

export interface FixAction {
  code: string;
  description: string;
  field: string;
  before: string;
  after: string;
}

export interface UnfixableIssue {
  code: string;
  field: string;
  message: string;
}

const CONFIDENCE_MAP: Record<string, string> = {
  high: 'HIGH', medium: 'MEDIUM', low: 'LOW',
  High: 'HIGH', Medium: 'MEDIUM', Low: 'LOW',
  HIGH: 'HIGH', MEDIUM: 'MEDIUM', LOW: 'LOW',
};

const EVIDENCE_MAP: Record<string, string> = {
  human_defined_rule: 'HUMAN_DEFINED_RULE',
  observed_once: 'OBSERVED_ONCE',
  observed_repeatedly: 'OBSERVED_REPEATEDLY',
  measured_result: 'MEASURED_RESULT',
  inference: 'INFERENCE',
  speculation: 'SPECULATION',
  // Common variations
  'human defined rule': 'HUMAN_DEFINED_RULE',
  'observed once': 'OBSERVED_ONCE',
  'observed repeatedly': 'OBSERVED_REPEATEDLY',
  'measured result': 'MEASURED_RESULT',
  humandefinedrule: 'HUMAN_DEFINED_RULE',
  observedonce: 'OBSERVED_ONCE',
  observedrepeatedly: 'OBSERVED_REPEATEDLY',
  measuredresult: 'MEASURED_RESULT',
};

// Build reverse map for all case variations
for (const et of EVIDENCE_TYPES) {
  EVIDENCE_MAP[et] = et;
  EVIDENCE_MAP[et.toLowerCase()] = et;
}

export function autoFixOOS(raw: string, selectedTemplate?: TemplateType): FixResult {
  const fixes: FixAction[] = [];
  const unfixable: UnfixableIssue[] = [];
  let content = raw;

  // ---- Phase 1: Character-level fixes (before any parsing) ----

  // Fix smart quotes
  const smartSingleCount = (content.match(/[\u2018\u2019]/g) || []).length;
  const smartDoubleCount = (content.match(/[\u201C\u201D]/g) || []).length;
  if (smartSingleCount > 0 || smartDoubleCount > 0) {
    content = content.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"');
    fixes.push({
      code: 'SMART_QUOTES_FIXED',
      description: `Replaced ${smartSingleCount + smartDoubleCount} smart quotes with straight quotes`,
      field: 'content',
      before: 'Smart quotes (\u201C \u201D \u2018 \u2019)',
      after: 'Straight quotes (" \' )',
    });
  }

  // Fix line endings
  if (content.includes('\r')) {
    const crlfCount = (content.match(/\r\n/g) || []).length;
    const crCount = (content.match(/\r(?!\n)/g) || []).length;
    content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    fixes.push({
      code: 'LINE_ENDINGS_FIXED',
      description: `Normalized ${crlfCount + crCount} line endings (CRLF/CR to LF)`,
      field: 'content',
      before: 'Windows/old Mac line endings',
      after: 'Unix line endings (LF)',
    });
  }

  // Fix em dashes -> double hyphens
  const emDashCount = (content.match(/\u2014/g) || []).length;
  if (emDashCount > 0) {
    content = content.replace(/\u2014/g, '--');
    fixes.push({
      code: 'EM_DASHES_FIXED',
      description: `Replaced ${emDashCount} em dashes with double hyphens`,
      field: 'content',
      before: '\u2014 (em dash)',
      after: '-- (double hyphen)',
    });
  }

  // Fix en dashes -> single hyphen
  const enDashCount = (content.match(/\u2013/g) || []).length;
  if (enDashCount > 0) {
    content = content.replace(/\u2013/g, '-');
    fixes.push({
      code: 'EN_DASHES_FIXED',
      description: `Replaced ${enDashCount} en dashes with hyphens`,
      field: 'content',
      before: '\u2013 (en dash)',
      after: '- (hyphen)',
    });
  }

  // Fix non-breaking spaces
  const nbspCount = (content.match(/\u00A0/g) || []).length;
  if (nbspCount > 0) {
    content = content.replace(/\u00A0/g, ' ');
    fixes.push({
      code: 'NBSP_FIXED',
      description: `Replaced ${nbspCount} non-breaking spaces with regular spaces`,
      field: 'content',
      before: '\\u00A0 (non-breaking space)',
      after: 'Regular space',
    });
  }

  // ---- Phase 2: Frontmatter fixes ----

  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  if (!fmMatch) {
    // Try to detect frontmatter without proper delimiters
    const looseMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
    if (looseMatch) {
      content = `---\n${looseMatch[1].trim()}\n---\n${looseMatch[2]}`;
      fixes.push({
        code: 'FRONTMATTER_DELIMITERS_FIXED',
        description: 'Fixed frontmatter delimiter spacing',
        field: 'frontmatter',
        before: 'Malformed --- delimiters',
        after: 'Clean --- delimiters',
      });
    } else if (content.match(/^oos_version:/m)) {
      // Frontmatter exists but missing --- delimiters entirely
      const firstHeading = content.search(/^##?\s/m);
      if (firstHeading > 0) {
        const fmPart = content.substring(0, firstHeading).trim();
        const bodyPart = content.substring(firstHeading);
        content = `---\n${fmPart}\n---\n\n${bodyPart}`;
        fixes.push({
          code: 'FRONTMATTER_DELIMITERS_ADDED',
          description: 'Added missing --- frontmatter delimiters',
          field: 'frontmatter',
          before: 'No --- delimiters',
          after: 'Added --- before and after frontmatter',
        });
      }
    } else {
      unfixable.push({
        code: 'MISSING_FRONTMATTER',
        field: 'frontmatter',
        message: 'No YAML frontmatter found. File must start with --- delimiters containing required fields.',
      });
      return { fixed: content, fixes, unfixable };
    }
  }

  // Re-match after potential delimiter fixes
  const fmMatch2 = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!fmMatch2) {
    unfixable.push({
      code: 'FRONTMATTER_UNPARSEABLE',
      field: 'frontmatter',
      message: 'Could not parse frontmatter even after attempted fixes.',
    });
    return { fixed: content, fixes, unfixable };
  }

  const [, fmRaw, bodyContent] = fmMatch2;

  let fm: Record<string, unknown>;
  try {
    fm = parseYAML(fmRaw) || {};
  } catch (e) {
    // Try to fix common YAML issues
    let fixedYaml = fmRaw;

    // Fix tabs -> spaces
    if (fixedYaml.includes('\t')) {
      fixedYaml = fixedYaml.replace(/\t/g, '  ');
      fixes.push({
        code: 'YAML_TABS_FIXED',
        description: 'Replaced tabs with spaces in YAML frontmatter',
        field: 'frontmatter',
        before: 'Tab characters',
        after: '2-space indentation',
      });
    }

    // Fix inconsistent quoting
    fixedYaml = fixedYaml.replace(/: ([^"'\n]*[:{}\[\]]\S*)/gm, ': "$1"');

    try {
      fm = parseYAML(fixedYaml) || {};
      content = `---\n${fixedYaml}\n---\n${bodyContent}`;
      fixes.push({
        code: 'YAML_SYNTAX_FIXED',
        description: 'Fixed YAML syntax errors in frontmatter',
        field: 'frontmatter',
        before: 'Invalid YAML',
        after: 'Valid YAML',
      });
    } catch {
      unfixable.push({
        code: 'YAML_PARSE_ERROR',
        field: 'frontmatter',
        message: `YAML parse error: ${(e as Error).message}. Manual fix required.`,
      });
      return { fixed: content, fixes, unfixable };
    }
  }

  let fmChanged = false;

  // Fix oos_version
  if (!fm.oos_version) {
    fm.oos_version = '1.0';
    fmChanged = true;
    fixes.push({ code: 'OOS_VERSION_ADDED', description: 'Added missing oos_version: "1.0"', field: 'frontmatter.oos_version', before: '(missing)', after: '"1.0"' });
  }

  // Fix org_pseudonym
  if (!fm.org_pseudonym) {
    if (fm.org_name) {
      fm.org_pseudonym = fm.org_name;
      delete fm.org_name;
      fmChanged = true;
      fixes.push({ code: 'ORG_PSEUDONYM_RENAMED', description: 'Renamed org_name to org_pseudonym', field: 'frontmatter.org_pseudonym', before: 'org_name', after: 'org_pseudonym' });
    } else if (fm.name) {
      fm.org_pseudonym = fm.name;
      fmChanged = true;
      fixes.push({ code: 'ORG_PSEUDONYM_FROM_NAME', description: 'Set org_pseudonym from name field', field: 'frontmatter.org_pseudonym', before: '(missing)', after: String(fm.name) });
    } else {
      unfixable.push({ code: 'MISSING_ORG_PSEUDONYM', field: 'frontmatter.org_pseudonym', message: 'org_pseudonym is required. Add your organization name or pseudonym.' });
    }
  }

  // Fix industry
  if (!fm.industry) {
    unfixable.push({ code: 'MISSING_INDUSTRY', field: 'frontmatter.industry', message: 'industry is required.' });
  }

  // Fix org_size
  if (!fm.org_size) {
    if (fm.size && ORG_SIZES.includes(fm.size as any)) {
      fm.org_size = fm.size;
      delete fm.size;
      fmChanged = true;
      fixes.push({ code: 'ORG_SIZE_RENAMED', description: 'Renamed size to org_size', field: 'frontmatter.org_size', before: 'size', after: 'org_size' });
    } else {
      unfixable.push({ code: 'MISSING_ORG_SIZE', field: 'frontmatter.org_size', message: 'org_size is required. Must be: solo, small, medium, large, or enterprise.' });
    }
  } else if (!ORG_SIZES.includes(fm.org_size as any)) {
    const lower = String(fm.org_size).toLowerCase();
    if (ORG_SIZES.includes(lower as any)) {
      fm.org_size = lower;
      fmChanged = true;
      fixes.push({ code: 'ORG_SIZE_CASE_FIXED', description: 'Fixed org_size case', field: 'frontmatter.org_size', before: String(fm.org_size), after: lower });
    }
  }

  // Fix template
  if (!fm.template) {
    if (selectedTemplate) {
      fm.template = selectedTemplate;
      fmChanged = true;
      fixes.push({ code: 'TEMPLATE_ADDED', description: `Set template to "${selectedTemplate}" from form selection`, field: 'frontmatter.template', before: '(missing)', after: selectedTemplate });
    } else {
      fm.template = 'agent_army';
      fmChanged = true;
      fixes.push({ code: 'TEMPLATE_DEFAULTED', description: 'Defaulted template to "agent_army"', field: 'frontmatter.template', before: '(missing)', after: 'agent_army' });
    }
  } else if (!TEMPLATE_TYPES.includes(fm.template as any)) {
    const lower = String(fm.template).toLowerCase();
    if (TEMPLATE_TYPES.includes(lower as any)) {
      fm.template = lower;
      fmChanged = true;
      fixes.push({ code: 'TEMPLATE_CASE_FIXED', description: 'Fixed template case', field: 'frontmatter.template', before: String(fm.template), after: lower });
    }
  }

  // Fix agent_count
  if (fm.agent_count === undefined || fm.agent_count === null) {
    fm.agent_count = 1;
    fmChanged = true;
    fixes.push({ code: 'AGENT_COUNT_DEFAULTED', description: 'Defaulted agent_count to 1', field: 'frontmatter.agent_count', before: '(missing)', after: '1' });
  }

  // Fix platforms AND mcp_servers -- extract from content using known-tools dictionary
  const allText = raw.toLowerCase();

  // Known AI platforms (the model/runtime, not the tool)
  const KNOWN_PLATFORMS: Record<string, string> = {
    'claude': 'Claude', 'anthropic': 'Claude',
    'gpt': 'GPT', 'openai': 'GPT', 'chatgpt': 'GPT',
    'gemini': 'Gemini', 'google gemini': 'Gemini',
    'copilot': 'Copilot', 'github copilot': 'Copilot',
    'cursor': 'Cursor', 'windsurf': 'Windsurf',
    'mistral': 'Mistral', 'llama': 'Llama',
    'custom': 'Custom',
  };

  // Known MCP servers / integrations / tools
  const KNOWN_MCP_SERVERS: Record<string, string> = {
    'slack': 'Slack', 'gmail': 'Gmail', 'google workspace': 'Google Workspace',
    'google calendar': 'Google Calendar', 'google drive': 'Google Drive',
    'google ads': 'Google Ads', 'google sheets': 'Google Sheets',
    'meta ads': 'Meta Ads', 'facebook ads': 'Meta Ads',
    'todoist': 'Todoist', 'accelo': 'Accelo',
    'ghl': 'GoHighLevel', 'gohighlevel': 'GoHighLevel', 'highlevel': 'GoHighLevel',
    'fireflies': 'Fireflies', 'obsidian': 'Obsidian',
    'calendly': 'Calendly', 'proposify': 'Proposify',
    'zapier': 'Zapier', 'make': 'Make', 'n8n': 'n8n',
    'playwright': 'Playwright', 'whatsapp': 'WhatsApp',
    'quickbooks': 'QuickBooks', 'qbo': 'QuickBooks',
    'stripe': 'Stripe', 'hubspot': 'HubSpot',
    'salesforce': 'Salesforce', 'jira': 'Jira',
    'confluence': 'Confluence', 'github': 'GitHub',
    'linear': 'Linear', 'notion': 'Notion', 'airtable': 'Airtable',
    'twilio': 'Twilio', 'sendgrid': 'SendGrid',
    'intercom': 'Intercom', 'zendesk': 'Zendesk',
    'shopify': 'Shopify', 'wordpress': 'WordPress',
    'search atlas': 'Search Atlas', 'semrush': 'Semrush',
    'linkedin': 'LinkedIn Ads', 'tiktok ads': 'TikTok Ads',
    'microsoft ads': 'Microsoft Ads',
  };

  // Extract platforms from content
  const detectedPlatforms = new Set<string>();
  for (const [keyword, name] of Object.entries(KNOWN_PLATFORMS)) {
    if (allText.includes(keyword)) detectedPlatforms.add(name);
  }
  // Merge with existing declared platforms
  const existingPlatforms = (fm.platforms && Array.isArray(fm.platforms))
    ? fm.platforms.map((p: any) => String(p))
    : [];
  for (const p of existingPlatforms) {
    // Normalize existing entries
    const normalized = KNOWN_PLATFORMS[p.toLowerCase()];
    detectedPlatforms.add(normalized || p);
  }
  if (detectedPlatforms.size === 0) detectedPlatforms.add('Claude');

  const newPlatforms = [...detectedPlatforms].sort();
  const oldPlatforms = JSON.stringify(fm.platforms || []);
  if (JSON.stringify(newPlatforms) !== oldPlatforms) {
    fm.platforms = newPlatforms;
    fmChanged = true;
    fixes.push({ code: 'PLATFORMS_ENRICHED', description: `Detected platforms from content: ${newPlatforms.join(', ')}`, field: 'frontmatter.platforms', before: oldPlatforms, after: JSON.stringify(newPlatforms) });
  }

  // Extract MCP servers from content
  const detectedMcp = new Set<string>();
  for (const [keyword, name] of Object.entries(KNOWN_MCP_SERVERS)) {
    // Use word boundary-ish matching to avoid false positives (e.g. "make" as a verb)
    // For short keywords, require them near tool-related context
    if (keyword.length <= 4) {
      // Short keywords: require capitalized form or near "mcp", "server", "integration", "api", "tool"
      const capitalizedForm = name.charAt(0).toUpperCase() + name.slice(1);
      if (raw.includes(capitalizedForm) || raw.includes(name)) {
        detectedMcp.add(name);
      }
    } else {
      if (allText.includes(keyword)) detectedMcp.add(name);
    }
  }
  // Merge with existing declared mcp_servers
  const existingMcp = (fm.mcp_servers && Array.isArray(fm.mcp_servers))
    ? fm.mcp_servers.map((m: any) => String(m))
    : [];
  for (const m of existingMcp) {
    detectedMcp.add(m);
  }

  const newMcp = [...detectedMcp].sort();
  const oldMcp = JSON.stringify(fm.mcp_servers || []);
  if (newMcp.length > 0 && JSON.stringify(newMcp) !== oldMcp) {
    fm.mcp_servers = newMcp;
    fmChanged = true;
    fixes.push({ code: 'MCP_SERVERS_ENRICHED', description: `Detected MCP servers from content: ${newMcp.join(', ')}`, field: 'frontmatter.mcp_servers', before: oldMcp, after: JSON.stringify(newMcp) });
  }

  // Fix generated_at -- normalize any parseable date to strict ISO 8601
  if (!fm.generated_at) {
    fm.generated_at = new Date().toISOString();
    fmChanged = true;
    fixes.push({ code: 'GENERATED_AT_ADDED', description: 'Set generated_at to current timestamp', field: 'frontmatter.generated_at', before: '(missing)', after: fm.generated_at as string });
  } else {
    const raw = String(fm.generated_at);
    const d = new Date(raw);
    if (isNaN(d.getTime())) {
      const oldVal = fm.generated_at;
      fm.generated_at = new Date().toISOString();
      fmChanged = true;
      fixes.push({ code: 'GENERATED_AT_FIXED', description: 'Fixed invalid generated_at timestamp', field: 'frontmatter.generated_at', before: String(oldVal), after: fm.generated_at as string });
    } else {
      // Valid date but may not be strict ISO -- normalize
      const iso = d.toISOString();
      if (raw !== iso) {
        fm.generated_at = iso;
        fmChanged = true;
        fixes.push({ code: 'GENERATED_AT_NORMALIZED', description: 'Normalized generated_at to ISO 8601', field: 'frontmatter.generated_at', before: raw, after: iso });
      }
    }
  }

  // Fix version
  if (!fm.version || typeof fm.version !== 'number') {
    fm.version = 1;
    fmChanged = true;
    fixes.push({ code: 'VERSION_DEFAULTED', description: 'Defaulted version to 1', field: 'frontmatter.version', before: String(fm.version ?? '(missing)'), after: '1' });
  }

  // Fix parent_version (must be null or number)
  if (fm.parent_version === undefined) {
    fm.parent_version = null;
    fmChanged = true;
    fixes.push({ code: 'PARENT_VERSION_ADDED', description: 'Set parent_version to null', field: 'frontmatter.parent_version', before: '(missing)', after: 'null' });
  }

  // ---- Phase 3: Claim-level fixes in body ----

  let fixedBody = bodyContent;

  // Fix confidence values in claims
  const confRegex = /(\*\*Confidence:\*\*\s*)([\w\s]+)/g;
  fixedBody = fixedBody.replace(confRegex, (match, prefix, value) => {
    const trimmed = value.trim();
    const mapped = CONFIDENCE_MAP[trimmed];
    if (mapped && mapped !== trimmed) {
      fixes.push({ code: 'CONFIDENCE_CASE_FIXED', description: `Fixed confidence "${trimmed}" to "${mapped}"`, field: 'claim.confidence', before: trimmed, after: mapped });
      return `${prefix}${mapped}`;
    }
    if (!mapped) {
      // Try fuzzy match
      const lower = trimmed.toLowerCase();
      if (lower === 'high' || lower === 'medium' || lower === 'low') {
        const fixed = lower.toUpperCase();
        fixes.push({ code: 'CONFIDENCE_CASE_FIXED', description: `Fixed confidence "${trimmed}" to "${fixed}"`, field: 'claim.confidence', before: trimmed, after: fixed });
        return `${prefix}${fixed}`;
      }
    }
    return match;
  });

  // Fix evidence values in claims
  const evidRegex = /(\*\*Evidence:\*\*\s*)([\w\s_]+)/g;
  fixedBody = fixedBody.replace(evidRegex, (match, prefix, value) => {
    const trimmed = value.trim();
    if (EVIDENCE_TYPES.includes(trimmed as any)) return match;

    const mapped = EVIDENCE_MAP[trimmed] || EVIDENCE_MAP[trimmed.toLowerCase()] || EVIDENCE_MAP[trimmed.toLowerCase().replace(/[\s_-]+/g, '_')];
    if (mapped) {
      fixes.push({ code: 'EVIDENCE_TYPE_FIXED', description: `Fixed evidence "${trimmed}" to "${mapped}"`, field: 'claim.evidence', before: trimmed, after: mapped });
      return `${prefix}${mapped}`;
    }
    return match;
  });

  // Fix claim field labels (common typos/variations)
  const fieldFixes: [RegExp, string, string][] = [
    [/\*\*Failure Mode:\*\*/gi, '**Failure mode:**', 'Failure Mode -> Failure mode'],
    [/\*\*failure mode:\*\*/g, '**Failure mode:**', 'failure mode -> Failure mode'],
    [/\*\*Why\?:\*\*/gi, '**Why:**', 'Why?: -> Why:'],
    [/\*\*Reason:\*\*/gi, '**Why:**', 'Reason: -> Why:'],
    [/\*\*rule:\*\*/g, '**Rule:**', 'rule: -> Rule:'],
    [/\*\*why:\*\*/g, '**Why:**', 'why: -> Why:'],
    [/\*\*scope:\*\*/g, '**Scope:**', 'scope: -> Scope:'],
    [/\*\*confidence:\*\*/g, '**Confidence:**', 'confidence: -> Confidence:'],
    [/\*\*evidence:\*\*/g, '**Evidence:**', 'evidence: -> Evidence:'],
  ];

  for (const [regex, replacement, desc] of fieldFixes) {
    const matchCount = (fixedBody.match(regex) || []).length;
    if (matchCount > 0) {
      fixedBody = fixedBody.replace(regex, replacement);
      fixes.push({ code: 'CLAIM_FIELD_LABEL_FIXED', description: `Fixed ${matchCount}x: ${desc}`, field: 'claims', before: desc.split(' -> ')[0], after: desc.split(' -> ')[1] });
    }
  }

  // Renumber claims sequentially if there are gaps
  const claimIds: string[] = [];
  const claimIdRegex = /\*\*\[C(\d+)\]\*\*/g;
  let claimMatch;
  while ((claimMatch = claimIdRegex.exec(fixedBody)) !== null) {
    claimIds.push(claimMatch[1]);
  }

  if (claimIds.length > 0) {
    let needsRenumber = false;
    for (let i = 0; i < claimIds.length; i++) {
      if (parseInt(claimIds[i], 10) !== i + 1) {
        needsRenumber = true;
        break;
      }
    }

    if (needsRenumber) {
      let counter = 0;
      fixedBody = fixedBody.replace(/\*\*\[C\d+\]\*\*/g, () => {
        counter++;
        return `**[C${String(counter).padStart(3, '0')}]**`;
      });
      fixes.push({ code: 'CLAIMS_RENUMBERED', description: `Renumbered ${claimIds.length} claims sequentially (C001, C002, ...)`, field: 'claims', before: `Non-sequential IDs`, after: `C001-C${String(claimIds.length).padStart(3, '0')}` });
    }
  }

  // ---- Phase 4: Recalculate frontmatter stats from actual content ----

  // Count words in body
  const words = fixedBody.trim().split(/\s+/).filter(w => w.length > 0).length;
  if (fm.word_count !== words) {
    const oldCount = fm.word_count;
    fm.word_count = words;
    fmChanged = true;
    fixes.push({ code: 'WORD_COUNT_RECALCULATED', description: `Updated word_count from ${oldCount ?? '(missing)'} to ${words}`, field: 'frontmatter.word_count', before: String(oldCount ?? '(missing)'), after: String(words) });
  }

  // Count claims
  const claimCount = (fixedBody.match(/\*\*\[C\d+\]\*\*/g) || []).length;
  if (fm.claim_count !== claimCount) {
    const oldCount = fm.claim_count;
    fm.claim_count = claimCount;
    fmChanged = true;
    fixes.push({ code: 'CLAIM_COUNT_RECALCULATED', description: `Updated claim_count from ${oldCount ?? '(missing)'} to ${claimCount}`, field: 'frontmatter.claim_count', before: String(oldCount ?? '(missing)'), after: String(claimCount) });
  }

  // Recalculate confidence_distribution
  const confDist: Record<string, number> = { high: 0, medium: 0, low: 0 };
  const confMatches = fixedBody.matchAll(/\*\*Confidence:\*\*\s*(HIGH|MEDIUM|LOW)/g);
  for (const m of confMatches) {
    confDist[m[1].toLowerCase()]++;
  }
  const oldConfDist = fm.confidence_distribution as Record<string, number> | undefined;
  if (!oldConfDist || oldConfDist.high !== confDist.high || oldConfDist.medium !== confDist.medium || oldConfDist.low !== confDist.low) {
    fm.confidence_distribution = confDist;
    fmChanged = true;
    fixes.push({ code: 'CONFIDENCE_DIST_RECALCULATED', description: `Recalculated confidence_distribution: high=${confDist.high}, medium=${confDist.medium}, low=${confDist.low}`, field: 'frontmatter.confidence_distribution', before: JSON.stringify(oldConfDist || {}), after: JSON.stringify(confDist) });
  }

  // Recalculate evidence_distribution
  const evidDist: Record<string, number> = {};
  const evidMatches = fixedBody.matchAll(/\*\*Evidence:\*\*\s*(HUMAN_DEFINED_RULE|OBSERVED_ONCE|OBSERVED_REPEATEDLY|MEASURED_RESULT|INFERENCE|SPECULATION)/g);
  for (const m of evidMatches) {
    const key = m[1].toLowerCase();
    evidDist[key] = (evidDist[key] || 0) + 1;
  }
  const oldEvidDist = fm.evidence_distribution as Record<string, number> | undefined;
  const evidChanged = !oldEvidDist || JSON.stringify(oldEvidDist) !== JSON.stringify(evidDist);
  if (evidChanged) {
    fm.evidence_distribution = evidDist;
    fmChanged = true;
    fixes.push({ code: 'EVIDENCE_DIST_RECALCULATED', description: 'Recalculated evidence_distribution from actual claims', field: 'frontmatter.evidence_distribution', before: JSON.stringify(oldEvidDist || {}), after: JSON.stringify(evidDist) });
  }

  // ---- Phase 5: Reassemble ----

  if (fmChanged) {
    // Build frontmatter in canonical order
    const ordered: Record<string, unknown> = {
      oos_version: fm.oos_version,
      org_pseudonym: fm.org_pseudonym,
      industry: fm.industry,
      org_size: fm.org_size,
      template: fm.template,
      agent_count: fm.agent_count,
      platforms: fm.platforms,
      mcp_servers: fm.mcp_servers || [],
      generated_at: fm.generated_at,
      version: fm.version,
      parent_version: fm.parent_version,
      word_count: fm.word_count,
      claim_count: fm.claim_count,
      confidence_distribution: fm.confidence_distribution,
      evidence_distribution: fm.evidence_distribution,
    };

    // Preserve any extra fields the user added
    for (const key of Object.keys(fm)) {
      if (!(key in ordered)) {
        ordered[key] = fm[key];
      }
    }

    const newFmYaml = stringifyYAML(ordered, { lineWidth: 0 }).trim();
    content = `---\n${newFmYaml}\n---\n${fixedBody}`;
  } else {
    content = `---\n${fmRaw}\n---\n${fixedBody}`;
  }

  // ---- Phase 6: Final warnings for things we can't auto-fix ----

  if (words < 500) {
    unfixable.push({ code: 'WORD_COUNT_LOW', field: 'content', message: `Word count is ${words}. Minimum is 500. Add more detail to your claims, failure modes, and scope descriptions.` });
  }
  if (words > 15000) {
    unfixable.push({ code: 'WORD_COUNT_HIGH', field: 'content', message: `Word count is ${words}. Maximum is 15000. Tighten your language or split into separate OOS versions.` });
  }
  if (claimCount < 10) {
    unfixable.push({ code: 'CLAIM_COUNT_LOW', field: 'claims', message: `Only ${claimCount} claims found. Minimum is 10. Add more claims covering failure_patterns and human_ai_boundary_conditions.` });
  }

  // Check for claims missing required fields
  const claimBlocks = fixedBody.matchAll(/\*\*\[C(\d+)\]\*\*\s+(\S+)\n([\s\S]*?)(?=\*\*\[C\d+\]\*\*|\n## |\n$)/g);
  for (const block of claimBlocks) {
    const cid = `C${block[1].padStart(3, '0')}`;
    const body = block[3];
    if (!body.includes('**Rule:**')) unfixable.push({ code: 'CLAIM_MISSING_RULE', field: cid, message: `${cid} is missing **Rule:** field.` });
    if (!body.includes('**Why:**')) unfixable.push({ code: 'CLAIM_MISSING_WHY', field: cid, message: `${cid} is missing **Why:** field.` });
    if (!body.includes('**Failure mode:**')) unfixable.push({ code: 'CLAIM_MISSING_FAILURE', field: cid, message: `${cid} is missing **Failure mode:** field.` });
    if (!body.includes('**Confidence:**')) unfixable.push({ code: 'CLAIM_MISSING_CONFIDENCE', field: cid, message: `${cid} is missing **Confidence:** field.` });
    if (!body.includes('**Evidence:**')) unfixable.push({ code: 'CLAIM_MISSING_EVIDENCE', field: cid, message: `${cid} is missing **Evidence:** field.` });
    if (!body.includes('**Scope:**')) unfixable.push({ code: 'CLAIM_MISSING_SCOPE', field: cid, message: `${cid} is missing **Scope:** field.` });
  }

  return { fixed: content, fixes, unfixable };
}
