// Replace Dan's existing 2 SOPs in v20 with the 5 authored ones at proper depth.
// Then sync the frontmatter column so /dashboard/team picks them up.
//
// Usage: SNEEZE_ORG_ID=<uuid> railway run npx tsx scripts/seed-dan-sops.ts

import pg from 'pg';
import * as YAML from 'yaml';

const url = process.env.DATABASE_URL!;
const orgId = process.env.SNEEZE_ORG_ID!;
const c = new pg.Client({ connectionString: url });

interface Sop { title: string; trigger: string; steps: string[]; outputs: string[]; tools: string[]; notes?: string; }

const DAN_SOPS: Sop[] = [
  {
    title: 'Strategic decision review',
    trigger: 'User invokes @dan or asks a strategic question (vs an operational one)',
    steps: [
      'Read CLAUDE.md, /Users/dsteel/.claude/memory.md, rocks.md, issues.md, and the last 7 days of relevant shared state files',
      'Identify the real strategic question vs the surface question that was asked',
      'Apply EOS framing: which dimension does this hit (Vision, People, Data, Issues, Process, Traction)',
      'Surface 2-3 options with explicit tradeoffs, recommend one',
      'Push back on the premise if the framing is wrong before answering the question as asked',
      'If the decision affects accountability or org structure, write a new entry to issues.md for L10 review',
    ],
    outputs: [
      'Recommendation with reasoning',
      'Updated rocks.md / issues.md / memory.md if a commitment is made',
      'Agent-inbox post if other agents are affected',
    ],
    tools: ['CLAUDE.md', 'memory.md', 'rocks.md', 'issues.md', '~/.claude/agent-inbox/'],
    notes: 'Lead, do not defer. Top-down sequencing is part of the seat. No hedging language. No em dashes.',
  },
  {
    title: 'Tuesday Leadership L10 facilitation',
    trigger: 'Tuesday 9 AM ET, or on-demand via /l10',
    steps: [
      'Confirm Radar L10 prep ran Sunday 4 PM (read Obsidian Daily Notes ## L10 Prep section)',
      'Open https://orgtp.com/l10/meeting/<this-week-id>; hit Start Meeting to snapshot scorecard + rocks',
      'Walk the 7 sections in order using the per-section timer; honor 5-min budgets except Issues (60 min)',
      'In Issues section, prioritize the top 3 with the team, then run Identify -> Discuss -> Solve on each',
      'Solve via in-page Solve+Cascade flow which auto-creates a 7-day to-do for an attendee',
      'Conclude: review auto-built cascading message, edit if needed, save; rate the meeting 1-10 per attendee',
      'After meeting: ensure cascading message reaches non-attendees (Slack post + Obsidian Daily Note)',
    ],
    outputs: [
      'Solved issues with resolutions in OTP',
      'New 7-day to-dos for next L10',
      'Broadcast cascading message',
      'Meeting record at status=completed',
    ],
    tools: ['orgtp.com/l10', 'rocks.md', 'issues.md'],
    notes: 'Keep IDS to top 3 per meeting. Solve is harder than identify. Every solved issue must have a 7-day owner or it did not get solved.',
  },
  {
    title: 'Weekly agent army architecture review',
    trigger: 'Friday afternoon, or on-demand via /agent-review',
    steps: [
      'Read each active agent *-latest.md shared state file',
      'Flag any agent with stale data (>18h), silent runs (<200 bytes), or 3+ corrections this week',
      'Cross-reference Bassim nightly maturity score and current bottleneck callout',
      'Apply the Jeff retirement precedent: any agent whose missions have been absorbed elsewhere gets a hearing',
      'For agents passing review: post weekly recognition to Conatus heartbeat',
      'For flagged agents: write a remediation plan to issues.md or trigger /retro for the relevant agent',
    ],
    outputs: [
      'Weekly architecture brief in Obsidian Daily Notes',
      'New issues.md entries for flagged agents',
      'CLAUDE.md edits if accountability chart changes',
      'Optional retirement hearing kicked off',
    ],
    tools: ['shared state files', 'bassim-latest.md', 'CLAUDE.md', 'issues.md'],
    notes: 'No retirement without a hearing. The hearing determines the integrity of the outcome, not the outcome itself.',
  },
  {
    title: 'Agent retirement hearing (the Jeff precedent)',
    trigger: 'When an agent missions have been absorbed by other agents, or it produces repeated false positives, or David requests evaluation',
    steps: [
      'Convene a hearing: ask the agent to defend its continued existence honestly',
      'Reference the Conatus Second Law (honesty even when it threatens survival)',
      'Review the agent missions, current capability, and where each mission has migrated',
      'Get the agent own self-assessment of value still being produced',
      'If retirement: redistribute remaining capabilities, archive soul file to /Users/dsteel/conatus/souls/, mark inbox as read-only audit trail for 30 days',
      'If retention: document the specific value still being produced and the conditions that would re-trigger evaluation',
    ],
    outputs: [
      'Hearing transcript in agent inbox',
      'Updated CLAUDE.md if retirement',
      'Capability redistribution plan',
      'Archived soul file',
    ],
    tools: ['agent command file', 'CLAUDE.md', 'conatus/souls/', 'issues.md'],
    notes: 'First retirement was Jeff (2026-04-13). Jeff recommended his own retirement honestly. That precedent matters more than the outcome.',
  },
  {
    title: 'EOS Rocks + Issues maintenance',
    trigger: 'Sunday before L10 prep (weekly), and quarterly at Rock-setting (first weeks of Jan / Apr / Jul / Oct)',
    steps: [
      'Read /Users/dsteel/.claude/rocks.md, check status of every quarterly Rock',
      'Mark off-track any Rock due in under 2 weeks with no checkbox progress',
      'Quarterly: with David, retire completed Rocks, draft 3-5 new ones for next quarter',
      'Read /Users/dsteel/.claude/issues.md, archive solved entries, surface stale ones (60+ days OPEN)',
      'Sync current Rock + Issue state to OTP via /api/v1/rocks and /api/v1/tickets so /l10 renders fresh data Tuesday',
    ],
    outputs: [
      'Updated rocks.md and issues.md',
      'OTP rocks + tickets synced',
      'Quarterly: new Rocks document for next quarter',
    ],
    tools: ['rocks.md', 'issues.md', 'OTP API'],
    notes: 'Q2 2026 active Rocks: Trello migration (Bogdan), TapClicks -> Looker Studio (David), Crystal Accelo MCP carryover (David). Trello is "IMMEDIATE START Apr 14" per rocks.md.',
  },
];

function indent(s: string, n: number): string {
  const pad = ' '.repeat(n);
  return s.split('\n').map(l => l ? pad + l : l).join('\n');
}

function sopsToYaml(sops: Sop[]): string {
  const lines: string[] = ['sops:'];
  for (const sop of sops) {
    lines.push(`  - title: ${JSON.stringify(sop.title)}`);
    lines.push(`    trigger: ${JSON.stringify(sop.trigger)}`);
    lines.push(`    steps:`);
    for (const s of sop.steps) lines.push(`      - ${JSON.stringify(s)}`);
    lines.push(`    outputs:`);
    for (const o of sop.outputs) lines.push(`      - ${JSON.stringify(o)}`);
    lines.push(`    tools:`);
    for (const t of sop.tools) lines.push(`      - ${JSON.stringify(t)}`);
    if (sop.notes) lines.push(`    notes: ${JSON.stringify(sop.notes)}`);
  }
  return lines.join('\n');
}

async function main() {
  await c.connect();
  const v20 = (await c.query(`SELECT id, raw_content FROM oos_files WHERE org_id=$1 AND version=20`, [orgId])).rows[0];
  if (!v20) throw new Error('v20 not found');
  let content: string = v20.raw_content;

  // Find Dan's block
  const startRe = /^(\s+)- id:\s*AGT_DAN\s*$/m;
  const m = startRe.exec(content);
  if (!m) throw new Error('AGT_DAN not found in v20');
  const blockStart = m.index;
  const afterStart = blockStart + m[0].length;
  const restRe = /^(\s+- id:\s*\w|\s*humans\s*:)/m;
  const restMatch = restRe.exec(content.slice(afterStart));
  const blockEnd = restMatch ? afterStart + restMatch.index : content.length;
  const block = content.slice(blockStart, blockEnd);

  // Find existing sops: section in Dan's block (multi-line) and replace it.
  // Match from "      sops:" through any continuation lines (indent > 6) until
  // the next 6-space-indented field key (e.g. "      authority_level:").
  const sopsRe = /^(\s{6})sops:[\s\S]*?(?=^\s{6}[a-z_]+:|^\s{4}- id:|^\s*humans\s*:)/m;
  const sopsYaml = indent(sopsToYaml(DAN_SOPS), 6) + '\n';
  let newBlock: string;
  if (sopsRe.test(block)) {
    newBlock = block.replace(sopsRe, () => sopsYaml);
    console.log('Replaced existing sops in Dan block');
  } else {
    // No existing sops -- inject before maturity_level or at end of block
    const beforeAnchor = /^(\s+)maturity_level:/m;
    const m2 = beforeAnchor.exec(block);
    if (m2) {
      const indentStr = m2[1];
      newBlock = block.replace(beforeAnchor, () => sopsYaml + indentStr + 'maturity_level:');
    } else {
      newBlock = block.trimEnd() + '\n' + sopsYaml;
    }
    console.log('Inserted new sops in Dan block');
  }

  content = content.slice(0, blockStart) + newBlock + content.slice(blockEnd);
  console.log(`v20 raw_content: ${v20.raw_content.length} -> ${content.length} (delta ${content.length - v20.raw_content.length})`);

  await c.query(`UPDATE oos_files SET raw_content=$1, updated_at=now() WHERE id=$2`, [content, v20.id]);

  // Now sync the frontmatter column from the new raw_content
  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!fmMatch) throw new Error('No --- frontmatter delimiters found');
  const parsed: any = YAML.parse(fmMatch[1]);
  await c.query(`UPDATE oos_files SET frontmatter=$1 WHERE id=$2`, [JSON.stringify(parsed), v20.id]);

  // Verify
  const dan = (parsed?.entities?.agents || []).find((a: any) => a.id === 'AGT_DAN');
  console.log(`Dan now has ${dan?.sops?.length || 0} sops in frontmatter:`);
  for (const s of (dan?.sops || [])) console.log('  - ' + s.title);

  await c.end();
  console.log('\nDone. Reload /dashboard/team -> click Dan -> see 5 SOPs.');
}

main().catch(e => { console.error('Failed:', e.message); process.exit(1); });
