// Walk ~/.claude/commands/, extract command name + description, map to agent,
// inject as `slash_commands` field on each agent in v20 raw_content. Sync
// frontmatter.
//
// Agent mapping is by filename prefix (dirk-* -> AGT_DIRK, radar-* -> AGT_RADAR,
// etc.) plus hardcoded overrides for orchestration commands. Commands that map
// to agents not on the chart (Crafter, Aio, Listener, Mike, Scout, Scribe,
// Sweep, Conatus) are skipped silently.

import pg from 'pg';
import * as YAML from 'yaml';
import fs from 'fs';
import path from 'path';

const url = process.env.DATABASE_URL!;
const orgId = process.env.SNEEZE_ORG_ID!;
const COMMANDS_DIR = '/Users/dsteel/.claude/commands';

interface SlashCommand { command: string; description: string; }

// Hardcoded mapping. Anything not listed maps via prefix rules in mapAgent().
const HARDCODED: Record<string, string> = {
  // Dan orchestrates strategic + agent management
  'agent-review': 'AGT_DAN',
  'l10dan': 'AGT_DAN',
  'good-morning': 'AGT_DAN',
  'good-night': 'AGT_DAN',
  'closeday': 'AGT_DAN',
  // Radar runs the morning rhythm + briefing orchestration
  'briefing': 'AGT_RADAR',
  'standup': 'AGT_RADAR',
  'l10prep': 'AGT_RADAR',
  'schedule': 'AGT_RADAR',
  'context': 'AGT_RADAR',
  'org-chart': 'AGT_RADAR',
  'bogdan-ops': 'AGT_RADAR',
  // Pepper owns inbox
  'inbox': 'AGT_PEPPER',
  // Dash absorbed Jeff fb analysis
  'fb-analysis': 'AGT_DASH',
  // Dirk aliases
  'prospect': 'AGT_DIRK',
  // Crystal / project-management commands routed to Crystal
  'coach-report': 'AGT_DASH',
  // Top-level agent invocations (when filename = agent name)
  'dirk': 'AGT_DIRK',
  'pulse': 'AGT_PULSE',
  'steve': 'AGT_STEVE',
  'tally': 'AGT_TALLY',
  'arin': 'AGT_ARINDARCAN',
  'bassim': 'AGT_BASSIM',
  'jeff': 'AGT_JEFF',
  // Not on chart yet (Aio, Crafter, Listener, Mike, Scout, Scribe, Sweep,
  // Conatus heartbeat, Tony scan, Voice-dist, etc.) -- skipped
};

function mapAgent(name: string): string | null {
  if (HARDCODED[name]) return HARDCODED[name];
  if (name.startsWith('dirk-')) return 'AGT_DIRK';
  if (name.startsWith('radar-')) return 'AGT_RADAR';
  if (name.startsWith('neil-') || name === 'learn') return 'AGT_NEIL';
  return null; // skip
}

function readDescription(filePath: string): string {
  const raw = fs.readFileSync(filePath, 'utf8');
  // Strip frontmatter if present
  let body = raw;
  if (body.startsWith('---')) {
    const close = body.indexOf('\n---', 4);
    if (close > 0) body = body.slice(close + 4).replace(/^\r?\n/, '');
  }
  // Take first non-empty paragraph, cap to ~180 chars
  const para = body.split(/\r?\n\r?\n/).map(p => p.trim()).find(p => p.length > 0) || '';
  let desc = para.replace(/^#+\s*/, '').replace(/\s+/g, ' ').trim();
  if (desc.length > 180) desc = desc.slice(0, 177) + '...';
  return desc;
}

function indent(s: string, n: number): string {
  const pad = ' '.repeat(n);
  return s.split('\n').map(l => l ? pad + l : l).join('\n');
}

function commandsToYaml(cmds: SlashCommand[]): string {
  const lines: string[] = ['slash_commands:'];
  for (const c of cmds) {
    lines.push(`  - command: ${JSON.stringify('/' + c.command)}`);
    lines.push(`    description: ${JSON.stringify(c.description)}`);
  }
  return lines.join('\n');
}

async function main() {
  // 1. Build per-agent command catalog
  const byAgent: Record<string, SlashCommand[]> = {};
  const files = fs.readdirSync(COMMANDS_DIR).filter(f => f.endsWith('.md') && f !== 'CLAUDE.md');
  let totalMapped = 0;
  let totalSkipped = 0;
  for (const f of files) {
    const name = f.replace(/\.md$/, '');
    const agentId = mapAgent(name);
    if (!agentId) { totalSkipped++; continue; }
    const desc = readDescription(path.join(COMMANDS_DIR, f));
    if (!byAgent[agentId]) byAgent[agentId] = [];
    byAgent[agentId].push({ command: name, description: desc });
    totalMapped++;
  }
  console.log(`Mapped ${totalMapped} commands across ${Object.keys(byAgent).length} agents (${totalSkipped} skipped).`);
  for (const [agentId, cmds] of Object.entries(byAgent)) {
    cmds.sort((a, b) => a.command.localeCompare(b.command));
    console.log(`  ${agentId}: ${cmds.length} commands`);
  }

  // 2. Inject into v20 raw_content
  const c = new pg.Client({ connectionString: url });
  await c.connect();
  const v20 = (await c.query(`SELECT id, raw_content FROM oos_files WHERE org_id=$1 AND version=20`, [orgId])).rows[0];
  if (!v20) throw new Error('v20 not found');
  let content: string = v20.raw_content;
  const before = content.length;

  for (const [agentId, cmds] of Object.entries(byAgent)) {
    const startRe = new RegExp(`^(\\s+)- id:\\s*${agentId}\\s*$`, 'm');
    const m = startRe.exec(content);
    if (!m) { console.log(`SKIP ${agentId}: not found in v20`); continue; }
    const blockStart = m.index;
    const afterStart = blockStart + m[0].length;
    const restRe = /^(\s+- id:\s*\w|\s*humans\s*:)/m;
    const restMatch = restRe.exec(content.slice(afterStart));
    const blockEnd = restMatch ? afterStart + restMatch.index : content.length;
    const block = content.slice(blockStart, blockEnd);

    const cmdsYaml = indent(commandsToYaml(cmds), 6) + '\n';

    // Replace existing slash_commands block if present (multi-line, ends at next 6-space field key)
    const slashRe = /^(\s{6})slash_commands:[\s\S]*?(?=^\s{6}[a-z_]+:|^\s{4}- id:|^\s*humans\s*:)/m;
    let newBlock: string;
    if (slashRe.test(block)) {
      newBlock = block.replace(slashRe, () => cmdsYaml);
      console.log(`  ${agentId}: replaced slash_commands (${cmds.length} commands)`);
    } else {
      // Insert right before maturity_level if present, else end of block
      const beforeAnchor = /^(\s+)maturity_level:/m;
      const m2 = beforeAnchor.exec(block);
      if (m2) {
        const indentStr = m2[1];
        newBlock = block.replace(beforeAnchor, () => cmdsYaml + indentStr + 'maturity_level:');
      } else {
        newBlock = block.trimEnd() + '\n' + cmdsYaml;
      }
      console.log(`  ${agentId}: inserted slash_commands (${cmds.length} commands)`);
    }
    content = content.slice(0, blockStart) + newBlock + content.slice(blockEnd);
  }

  console.log(`\nv20 raw_content: ${before} -> ${content.length} (delta ${content.length - before})`);
  await c.query(`UPDATE oos_files SET raw_content=$1, updated_at=now() WHERE id=$2`, [content, v20.id]);

  // 3. Sync frontmatter
  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!fmMatch) throw new Error('No frontmatter delimiters found');
  const parsed: any = YAML.parse(fmMatch[1]);
  await c.query(`UPDATE oos_files SET frontmatter=$1 WHERE id=$2`, [JSON.stringify(parsed), v20.id]);

  // Verify
  const agents = (parsed?.entities?.agents || []) as any[];
  console.log('\nslash_commands count per agent in frontmatter:');
  for (const id of Object.keys(byAgent)) {
    const a = agents.find(x => x.id === id);
    console.log(`  ${id}: ${Array.isArray(a?.slash_commands) ? a.slash_commands.length : 0}`);
  }

  await c.end();
  console.log('\nData done. Next: code changes to render in drawer.');
}
main().catch(e => { console.error(e.message); process.exit(1); });
