/**
 * One-off import: parse /Users/dsteel/CLAUDE.md into entities.agents and
 * entities.humans, then create a new draft OOS for the "Sneeze It" org
 * (clerkOrgId user_3CgTpExyG1730EwxutGzeZnjfO3). The new draft becomes the
 * latest version and is what /dashboard/team renders.
 *
 * Idempotent-ish: rerunning replaces the existing draft if one exists, else
 * inserts a new one at max(version)+1.
 *
 * Usage: railway run -- npx tsx scripts/import-claude-md.ts [--dry-run]
 *
 * After the run, /dashboard/team should render the parsed agent army + human
 * team. Edits via the team chart will mutate this draft.
 */

import { readFileSync } from 'fs';
import { stringify as stringifyYAML, parse as parseYAML } from 'yaml';
import { db } from '../src/config/database.js';
import { oosFiles, organizations } from '../src/db/schema.js';
import { eq, desc } from 'drizzle-orm';

const CLAUDE_MD_PATH = '/Users/dsteel/CLAUDE.md';
const SNEEZE_CLERK_ID = 'user_3CgTpExyG1730EwxutGzeZnjfO3';
const DRY_RUN = process.argv.includes('--dry-run');

// ---- helpers ----

function slugId(name: string, prefix: string): string {
  return prefix + '_' + name.replace(/[^A-Z0-9]/gi, '').toUpperCase();
}

function unbold(s: string): string {
  return s.replace(/\*\*/g, '').trim();
}

function parseListLike(s: string): string[] {
  // "Slack, Google Calendar, Todoist" -> array
  return s.split(/[,]/).map(p => p.trim()).filter(Boolean);
}

interface AgentDef {
  id: string;
  name: string;
  role: string;
  color?: string;
  status?: string;
  mission?: string;
  authority_level?: string;
  platform?: string;
  tools?: string[];
  owns?: string;
  does_not_own?: string;
  escalates_to?: string;
  invoke?: string;
}

interface HumanDef {
  id: string;
  name: string;
  role?: string;
  slack_id?: string;
  authority_level?: string;
  override_authority?: string[];
  receives_escalations_from?: string[];
}

// ---- parser ----

function parseAgents(md: string): AgentDef[] {
  const agents: AgentDef[] = [];

  // Section bounds: from "## THE AGENT ARMY" through "## QUICK REFERENCE" or
  // "### PLANNED AGENTS" (whichever comes first).
  const start = md.indexOf('## THE AGENT ARMY');
  if (start === -1) return agents;
  const after = md.slice(start);
  const stopIdx = (() => {
    const a = after.indexOf('### PLANNED AGENTS');
    const b = after.indexOf('## QUICK REFERENCE');
    const c = after.indexOf('## ARCHITECTURE PRINCIPLES');
    const candidates = [a, b, c].filter(x => x > 0);
    return candidates.length ? Math.min(...candidates) : after.length;
  })();
  const section = after.slice(0, stopIdx);

  // Walk heading boundaries explicitly. The previous regex relied on \Z which
  // JS treats as literal Z, causing the last block (STEVE) to be skipped.
  const headingRe = /^### ([A-Z][A-Z &\-]*[A-Z])\s*[-—]\s*(.+)$/gm;
  const headings: Array<{ index: number; name: string; subtitle: string; lineEnd: number }> = [];
  let h: RegExpExecArray | null;
  while ((h = headingRe.exec(section)) !== null) {
    const lineEnd = section.indexOf('\n', h.index);
    headings.push({
      index: h.index,
      name: h[1].trim(),
      subtitle: unbold(h[2]),
      lineEnd: lineEnd === -1 ? section.length : lineEnd,
    });
  }

  for (let hi = 0; hi < headings.length; hi++) {
    const head = headings[hi];
    const bodyEnd = hi + 1 < headings.length ? headings[hi + 1].index : section.length;
    const rawName = head.name;
    const subtitle = head.subtitle;
    const body = section.slice(head.lineEnd + 1, bodyEnd);

    // Skip retired headings that explicitly say RETIRED in the title (Jeff)
    const isRetired = /retired/i.test(subtitle);
    if (isRetired && !/jeff/i.test(rawName)) {
      // Skip non-Jeff retired entries; Jeff stays as data with status=retired
    }

    const name = rawName.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    const id = slugId(rawName, 'AGT');

    const fieldRe = /^-\s+\*\*([^:*]+):\*\*\s+([\s\S]*?)(?=\n-\s+\*\*|\n##|\Z)/gm;
    const fields: Record<string, string> = {};
    let f: RegExpExecArray | null;
    while ((f = fieldRe.exec(body)) !== null) {
      const key = f[1].trim().toLowerCase();
      const val = f[2].replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
      fields[key] = val;
    }

    const a: AgentDef = {
      id,
      name,
      role: fields['role'] || subtitle,
    };
    if (fields['color']) a.color = fields['color'];
    if (fields['status']) a.status = fields['status'].split(/\.|--/)[0].trim().toLowerCase();
    if (fields['personality']) a.mission = fields['personality'];
    if (fields['mission'] && !a.mission) a.mission = fields['mission'];
    if (fields['tools']) a.tools = parseListLike(fields['tools']);
    if (fields['owns']) a.owns = fields['owns'];
    if (fields['does not own']) a.does_not_own = fields['does not own'];
    if (fields['invoke']) a.invoke = fields['invoke'];

    a.platform = 'claude-code';
    if (!a.status) a.status = isRetired ? 'retired' : 'active';

    agents.push(a);
  }

  // Wire escalation: scanner agents -> Radar; strategic + revenue -> David
  const directToFounder = new Set(['Radar', 'Dan', 'Neil', 'Dirk', 'Emery']);
  for (const a of agents) {
    if (a.status === 'retired') continue;
    if (directToFounder.has(a.name)) {
      a.escalates_to = 'HUM_DAVIDSTEEL';
    } else {
      a.escalates_to = 'AGT_RADAR';
    }
  }

  return agents;
}

function parseHumans(md: string): HumanDef[] {
  const humans: HumanDef[] = [];
  const start = md.indexOf('## KEY PEOPLE');
  if (start === -1) return humans;
  const after = md.slice(start);
  const stop = (() => {
    const a = after.indexOf('## EXTERNAL COMMITMENTS');
    const b = after.indexOf('## ACTIVE CLIENTS');
    const c = after.indexOf('## TOOLS &');
    const candidates = [a, b, c].filter(x => x > 0);
    return candidates.length ? Math.min(...candidates) : after.length;
  })();
  const section = after.slice(0, stop);

  const lineRe = /^- (.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = lineRe.exec(section)) !== null) {
    const raw = m[1].trim();
    // Strikethrough = terminated/resigned, skip
    if (raw.startsWith('~~') && raw.includes('~~')) continue;

    // "David Steel (CEO): U1JEPUK47"
    // "Bogdan Tabaka (COO): UPYU28Y3U"
    // "Erica Muzwidzwa (Setter): TBD"
    const lineMatch = /^([^:(]+?)(?:\(([^)]+)\))?:\s*([A-Z0-9]+)/.exec(raw);
    if (!lineMatch) continue;

    const name = lineMatch[1].trim();
    const role = (lineMatch[2] || '').trim();
    const slackId = lineMatch[3].trim();

    if (!name || slackId === 'TBD') {
      // include even TBD slack ids -- they're real people
    }

    const id = slugId(name, 'HUM');
    const h: HumanDef = { id, name, slack_id: slackId !== 'TBD' ? slackId : undefined };
    if (role) h.role = role;

    if (/CEO|founder/i.test(role) || name === 'David Steel') {
      h.authority_level = 'full';
      h.override_authority = ['ALL'];
    } else if (/COO/i.test(role)) {
      h.authority_level = 'executive';
    } else {
      h.authority_level = 'operator';
    }

    humans.push(h);
  }

  // Wire escalations into David
  const david = humans.find(h => h.name === 'David Steel');
  if (david) {
    david.receives_escalations_from = ['AGT_RADAR', 'AGT_DAN', 'AGT_NEIL', 'AGT_DIRK', 'AGT_EMERY'];
  }

  return humans;
}

// ---- main ----

async function main() {
  console.log('Reading', CLAUDE_MD_PATH);
  const md = readFileSync(CLAUDE_MD_PATH, 'utf8');

  const agents = parseAgents(md);
  const humans = parseHumans(md);

  console.log(`Parsed ${agents.length} agents, ${humans.length} humans.\n`);
  console.log('Agents:', agents.map(a => `${a.id}(${a.name})`).join(', '));
  console.log('Humans:', humans.map(h => `${h.id}(${h.name})`).join(', '));

  if (DRY_RUN) {
    console.log('\n--dry-run -- printing entities YAML and exiting:\n');
    console.log(stringifyYAML({ entities: { agents, humans } }, { lineWidth: 0 }));
    process.exit(0);
  }

  const [org] = await db.select().from(organizations).where(eq(organizations.clerkOrgId, SNEEZE_CLERK_ID));
  if (!org) throw new Error(`Org with clerkOrgId=${SNEEZE_CLERK_ID} not found`);
  console.log(`\nOrg: ${org.name} (id=${org.id})`);

  const allFiles = await db.select().from(oosFiles).where(eq(oosFiles.orgId, org.id)).orderBy(desc(oosFiles.version));
  const latest = allFiles[0];
  if (!latest) throw new Error('No prior OOS to clone from');
  const existingDraft = allFiles.find(f => f.status === 'draft');

  // Source rawContent: clone latest. Replace its frontmatter with one that
  // includes our parsed entities. Keep the body so claims are preserved.
  const fmSplit = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const m = latest.rawContent.match(fmSplit);
  if (!m) throw new Error('Latest OOS has no frontmatter -- cannot patch');
  const oldFm = parseYAML(m[1]) || {};
  const body = m[2];

  const newFm: any = { ...(oldFm as any) };
  newFm.entities = { agents, humans };
  newFm.agent_count = agents.length;
  newFm.org_pseudonym = org.name;
  newFm.generated_at = new Date().toISOString();

  const fmYaml = stringifyYAML(newFm, { lineWidth: 0, defaultStringType: 'PLAIN' as any }).trimEnd();
  const newRaw = `---\n${fmYaml}\n---\n${body}`;

  if (existingDraft) {
    console.log(`Updating existing draft v${existingDraft.version} (${existingDraft.id})`);
    await db.update(oosFiles).set({
      rawContent: newRaw,
      frontmatter: newFm,
      updatedAt: new Date(),
    }).where(eq(oosFiles.id, existingDraft.id));
    console.log(`  done. /dashboard/team will pick up v${existingDraft.version}.`);
  } else {
    const nextVersion = (latest.version || 0) + 1;
    console.log(`Creating new draft v${nextVersion} from v${latest.version}`);
    const [created] = await db.insert(oosFiles).values({
      orgId: org.id,
      name: latest.name,
      template: latest.template,
      version: nextVersion,
      status: 'draft',
      visibilityDefault: latest.visibilityDefault,
      wordCount: latest.wordCount,
      claimCount: latest.claimCount,
      rawContent: newRaw,
      frontmatter: newFm as any,
      confidenceDistribution: latest.confidenceDistribution as any,
      evidenceDistribution: latest.evidenceDistribution as any,
      sourceDocumentId: latest.sourceDocumentId,
      workspaceId: latest.workspaceId,
    }).returning();
    console.log(`  done. id=${created.id}.  /dashboard/team will pick up v${nextVersion}.`);
  }

  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
