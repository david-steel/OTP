// Populate the `sops:` field on every active agent in v20 raw_content.
// Skips Jeff (retired). Authors 2 SOPs per agent grounded in CLAUDE.md.
// Idempotent: if an agent already has populated sops, skip it.
//
// Usage: SNEEZE_ORG_ID=<uuid> railway run npx tsx scripts/seed-agent-sops.ts

import pg from 'pg';

const url = process.env.DATABASE_URL!;
const orgId = process.env.SNEEZE_ORG_ID!;
const c = new pg.Client({ connectionString: url });

interface Sop { title: string; trigger: string; steps: string[]; outputs: string[]; tools: string[]; notes?: string; }

const SOPS: Record<string, Sop[]> = {
  AGT_RADAR: [
    {
      title: 'Compile morning briefing',
      trigger: 'Every weekday at 7:30 AM ET (cron) or on-demand via /briefing',
      steps: [
        'Read all 10 shared state files in /Users/dsteel/.claude/ (radar-slack, calendar, todoist, proposify, pepper, dash, dirk, fireflies, arin)',
        'Flag any file >18 hours old as stale',
        'Compile 5-section briefing: Urgent / Today / Systems / Context / Warnings',
        'Calculate billable hours and revenue at $165/hr; flag if >40% or <20% of week',
        'Write to Obsidian daily note (Daily Notes/YYYY-MM-DD.md) under ## Daily Briefing',
      ],
      outputs: ['Obsidian daily note section', 'ntfy.sh push to David'],
      tools: ['Obsidian MCP', 'ntfy.sh', 'shared state files'],
      notes: 'Wednesday is a flagged OFF day -- any meeting on Wed gets called out.',
    },
    {
      title: 'Run L10 prep on Sunday + Wednesday',
      trigger: 'Sunday 4 PM (Tuesday Leadership L10) and Wednesday 4 PM (Bogdan 1-on-1)',
      steps: [
        'Read /Users/dsteel/.claude/rocks.md and issues.md',
        'Pull scorecard KPIs from kpis API for the org',
        'Compile Headlines from Slack + Calendar + Todoist last 7 days',
        'Surface to-do completion rate from prior L10',
        'Write to Obsidian daily note under ## L10 Prep with Scorecard / Rocks / Headlines / Issues / To-Dos subsections',
      ],
      outputs: ['L10 prep Obsidian note', 'Optional ntfy alert if rocks off-track'],
      tools: ['Obsidian MCP', 'OTP KPIs API', 'rocks.md', 'issues.md'],
    },
  ],
  AGT_DAN: [
    {
      title: 'Strategic decision review',
      trigger: 'On user invocation (@dan) or at quarterly Rock-setting',
      steps: [
        'Read full project context from CLAUDE.md, memory.md, and recent shared state files',
        'Apply EOS framework: Rocks, L10, IDS, Scorecard, Accountability Chart',
        'Identify the strategic question vs the operational question',
        'Surface 2-3 options with explicit tradeoffs, recommend one',
        'Push back on premise if the framing is wrong before answering the question',
      ],
      outputs: ['Recommendation with tradeoffs', 'Updated rocks.md or issues.md if needed'],
      tools: ['CLAUDE.md', 'memory.md', 'rocks.md', 'issues.md'],
      notes: 'Lead, do not defer. Top-down sequencing is part of the seat.',
    },
    {
      title: 'Weekly agent army architecture review',
      trigger: 'Friday afternoon or on-demand via /agent-review',
      steps: [
        'Read each active agent shared state file',
        'Flag stale (>18h), silent (<200 bytes), or repeatedly-corrected agents',
        'Cross-reference with Bassim agentic maturity score',
        'Recommend retirement, refactor, or new seat as warranted',
        'Update CLAUDE.md if accountability chart changes',
      ],
      outputs: ['Weekly architecture brief in Obsidian', 'CLAUDE.md edits if accountability changes'],
      tools: ['shared state files', 'CLAUDE.md', 'Bassim latest'],
    },
  ],
  AGT_DASH: [
    {
      title: 'Daily customer ad performance scan',
      trigger: 'Every weekday at 8 AM ET',
      steps: [
        'Pull CCM-Stats Template V5 (Sheet ID 1Dgbh3qOGsEHTel405nxMBQFafJtOSjKBJomh5dfpfr4)',
        'Pull Meta Ads spend + leads via meta-ads.sh for managed accounts only',
        'Pull Google Ads spend + leads via google-ads.sh for MCC 175-915-4807',
        'Compare yesterday vs 7-day median vs 30-day median per account; flag deltas >20%',
        'Write to /Users/dsteel/.claude/dash-latest.md with timestamps',
      ],
      outputs: ['dash-latest.md shared state', 'Critical alerts to Obsidian Daily Notes ## Dash Alerts'],
      tools: ['Google Sheets MCP', 'meta-ads.sh', 'google-ads.sh'],
      notes: 'Never recommend changes -- report patterns. Use median for STL.',
    },
    {
      title: 'Guarantee client (T20) full vertical view',
      trigger: 'Daily, embedded in morning scan',
      steps: [
        'For each guarantee client, compute: Spend, CPL, leads, appts, show rate, close rate',
        'Compare to brand baseline and to that client baseline',
        'No News Is News: flag if no Slack activity 48+ hours',
        'Output structured per-client tile with trend arrows',
      ],
      outputs: ['T20 client tiles in dash-latest.md'],
      tools: ['CCM-Stats sheet', 'meta-ads.sh', 'google-ads.sh', 'Slack history'],
    },
  ],
  AGT_PEPPER: [
    {
      title: 'Inbox triage',
      trigger: 'Three times daily (8 AM Morning Clear Runway, 12:30 PM Mid-Day Check, 5 PM End of Day Sweep)',
      steps: [
        'Read /Users/dsteel/.claude/pepper-inbox-memory.md to skip already-processed emails',
        'Pull unread Gmail threads since last run',
        'Sort into 4 buckets: CLIENT-URGENT (draft + escalate), CLIENT-ROUTINE (draft), TEAM/VENDOR (summarize), NOISE (suppress)',
        'Match sender domain against pepper-clients.md whitelist',
        'Draft replies in David voice, never send without approval',
      ],
      outputs: ['Drafted Gmail replies', 'pepper-latest.md shared state', 'Urgent escalations to Radar'],
      tools: ['Gmail MCP', 'pepper-clients.md', 'pepper-inbox-memory.md'],
      notes: 'Client domain emails NEVER deleted without David seeing them first. Zero exceptions.',
    },
    {
      title: 'Send Dirk-drafted outreach via Gmail',
      trigger: 'When Dirk approves a reactivation/expansion/cold draft and David approves',
      steps: [
        'Receive draft from Dirk via /Users/dsteel/.claude/agent-inbox/pepper.md or direct',
        'Verify recipient is in pepper-clients.md or approved cold list',
        'Send from David real Gmail account, not notifications@',
        'Log send in GHL via ghl.sh for CRM tracking',
        'Auto-reply triage: route bounces, OOO, contact changes, acquisitions to Dirk inbox',
      ],
      outputs: ['Sent Gmail message', 'GHL log entry', 'Dirk inbox intel post'],
      tools: ['Gmail MCP', 'ghl.sh', 'agent-inbox/dirk.md'],
    },
  ],
  AGT_CRYSTAL: [
    {
      title: 'Daily Accelo project scan',
      trigger: 'Every weekday at 7 AM ET',
      steps: [
        'List active jobs from Accelo MCP',
        'For each: check assigned staff, latest activity, deadline proximity, open issues',
        'Flag stale projects (>14 days no activity), missed milestones, ghost staff',
        'Compute portfolio risk score per client',
        'Write to /Users/dsteel/.claude/crystal-latest.md',
      ],
      outputs: ['crystal-latest.md', 'Obsidian daily note ## Crystal section'],
      tools: ['Accelo MCP'],
      notes: 'Trello migration is the Q2 rock -- track adoption alongside Accelo.',
    },
    {
      title: 'Push active project count KPI to OTP',
      trigger: 'Daily after morning scan, also picked up by Tally',
      steps: [
        'Count Accelo jobs with status=active and recent activity within 14 days',
        'POST to /api/v1/kpis/values for Crystal active projects KPI',
        'Source = computed, entered_by = AGT_CRYSTAL',
      ],
      outputs: ['kpiValues row for current week'],
      tools: ['Accelo MCP', 'OTP KPIs API'],
    },
  ],
  AGT_DIRK: [
    {
      title: 'Daily cold prospecting wave',
      trigger: '3x daily at 10 AM, 12 PM, 3 PM ET Mon-Fri (cron)',
      steps: [
        'Pull next 10 prospects from cold queue (refreshed weekly via /dirk-icp-refresh)',
        'Apply ICP filter: established brands with infrastructure + capital + experienced ownership',
        'Skip food/restaurant/QSR, direct competitors of active clients, Heather Hudson, others on do-not-contact',
        'Draft Kennedy-style cold email; verify ownership signal in subject line',
        'Send via Pepper/Gmail (not notifications@), log in GHL',
      ],
      outputs: ['10 sent cold emails per wave', 'GHL contact + opp records', 'dirk-latest.md'],
      tools: ['ghl.sh', 'Pepper inbox', 'cold-queue.md', 'icp-rules.md'],
      notes: 'Never send before 9 AM ET. Never use em dashes in body.',
    },
    {
      title: 'Pipeline scan and stale-deal triage',
      trigger: 'Every morning at 7 AM ET',
      steps: [
        'Pull GHL opportunities + Proposify state for managed pipeline',
        'Cross-reference Fireflies meetings + Gmail Sent for warm signals (do NOT close on stage age alone)',
        'Flag stale (>14 days no movement after meeting) but do not auto-close',
        'Surface deals won for Janine billing flag',
        'Write to /Users/dsteel/.claude/dirk-latest.md with daily-sent count sourced from Gmail Sent',
      ],
      outputs: ['dirk-latest.md', 'GHL stage updates (Proposal Signed when Proposify wins)', 'Janine billing alerts'],
      tools: ['ghl.sh', 'Proposify (via Slack channel)', 'Fireflies MCP', 'Gmail MCP'],
    },
  ],
  AGT_EMERY: [
    {
      title: 'Lead intake and qualification sequence',
      trigger: 'Webhook /webhooks/lead fired by GHL form or third-party lead source',
      steps: [
        'Receive lead payload, persist with PII encryption (AES-256-GCM)',
        'Run enrichment waterfall: company + role + history',
        'Compliance check: do-not-contact, consent flags, GDPR if EU',
        'Initiate multi-touch sequence (email + SMS + voicemail) via Temporal workflow',
        'On qualification, book Calendly slot and update GHL stage',
      ],
      outputs: ['GHL contact + opp', 'Calendly booking', 'emery-latest.md'],
      tools: ['GHL CLI', 'Calendly', 'SendGrid', 'Twilio', 'Deepgram', 'Anthropic Claude'],
      notes: 'Pulse override: pause if contact is on Pulse churn watch list.',
    },
    {
      title: 'State machine progression and CRM sync',
      trigger: 'On every lead state transition (23 states from NEW_LEAD to CLOSED_WON/LOST/NO_RESPONSE)',
      steps: [
        'Validate transition is legal per state machine',
        'Update GHL stage and contact fields',
        'Append audit-trail entry with timestamp + actor + context',
        'Trigger downstream automation (next sequence step, Calendly booking, etc.)',
      ],
      outputs: ['GHL state update', 'Audit trail row', 'Optional Slack notify on CLOSED_WON'],
      tools: ['Temporal.io', 'GHL CLI', 'Postgres state store'],
    },
  ],
  AGT_PULSE: [
    {
      title: 'Weekly client retention scan',
      trigger: 'Mondays at 6 AM ET',
      steps: [
        'List managed clients with monthly ad spend >$1,000 (qualification gate)',
        'Compute Account Score: lead volume trend, CPL trend, response cadence, perception gap',
        'Match to cadence: $1k-$5k monthly, $5k-$15k biweekly, $15k+ weekly',
        'Detect downturn (lead vol down >20% OR CPL up >20%): pause outreach, escalate to Dash + Crystal + Dirk',
        'Detect silent risk (no response 2 invites + no call 4 weeks): concierge outreach via Pepper',
      ],
      outputs: ['pulse-latest.md', 'Pepper-routed outreach drafts', 'Internal escalations'],
      tools: ['CCM-Stats', 'GEO audit skill', 'Pepper inbox'],
      notes: 'Pulse always wins Pulse-Dirk conflicts. Hunter vs Guardian.',
    },
    {
      title: 'Expansion opportunity surfacing',
      trigger: 'Weekly, after retention scan',
      steps: [
        'Filter to clients with strong performance (lead vol stable, CPL within target, Account Score rising)',
        'No call in 4 weeks AND no current downturn flag',
        'Draft expansion recommendation (add channel, increase budget, add service)',
        'Route to Pepper for founder-approved sending',
        'Founder approves before send -- never auto-send expansion offers',
      ],
      outputs: ['Drafted expansion outreach', 'Founder approval queue'],
      tools: ['CCM-Stats', 'Pepper inbox', 'Calendly performance-call link'],
    },
  ],
  AGT_NEIL: [
    {
      title: 'Frontier scan',
      trigger: 'Weekly Monday morning, on-demand via /learn',
      steps: [
        'Dispatch sub-agents in parallel: YT_SCOUT, BLOG_SCOUT, GH_SCOUT, CI_SCOUT',
        'Each returns candidate advancements in their domain',
        'Apply 2-gate filter: Q1 will this make our AI team better? Q2 is what we already have better?',
        'For surviving candidates: write falsifiable hypothesis with mechanism, target metric, kill criteria',
        'Classify: EASY (auto-run), MODERATE (Dan/Jeff schedule), NEW TECH (long-term issues)',
      ],
      outputs: ['neil-latest.md', 'Obsidian Daily Notes ## Neil section', 'New issues in issues.md if NEW TECH'],
      tools: ['YouTube MCP', 'WebFetch', 'GitHub MCP', 'web search'],
      notes: 'Hard stop on Q1 same/worse OR Q2 ours-equal-or-better. No hoarding rejected ideas.',
    },
    {
      title: 'L8 maturity push with Bassim',
      trigger: 'Embedded in every /learn run; explicit on-demand via @neil L8',
      steps: [
        'Read bassim-latest.md for current maturity score and bottleneck',
        'Implement the highest-leverage fix in the call-out',
        'Update CLAUDE.md or agent commands as needed',
        'Trigger Bassim re-evaluation',
      ],
      outputs: ['Implemented improvements', 'Updated CLAUDE.md / commands', 'Bassim re-eval trigger'],
      tools: ['bassim-latest.md', 'CLAUDE.md', 'agent command files'],
    },
  ],
  AGT_BASSIM: [
    {
      title: 'Nightly agentic maturity evaluation',
      trigger: 'Every night at 11 PM ET via /good-night',
      steps: [
        'Read CLAUDE.md, all agent command files, recent shared state files',
        'Score against the 8 Levels of Agentic Engineering framework',
        'Apply hierarchy rule: weakness at lower level caps the score',
        'Identify the single highest-leverage bottleneck',
        'Write to /Users/dsteel/.claude/bassim-latest.md with score (X.X / 8.0), per-level breakdown, bottleneck',
      ],
      outputs: ['bassim-latest.md', 'Obsidian Daily Notes ## Bassim section'],
      tools: ['CLAUDE.md', 'agent command files', 'shared state files'],
      notes: 'Round down when uncertain. The score should feel like a challenge not a compliment.',
    },
    {
      title: 'Hand-off bottleneck to Neil',
      trigger: 'After every nightly run',
      steps: [
        'Identify the level capping the score and the specific symptom',
        'Write a Neil-actionable hand-off to /Users/dsteel/.claude/agent-inbox/neil.md',
        'Include: current score, target after fix, implementation hint, kill criteria',
      ],
      outputs: ['Neil inbox post', 'Loop telemetry in bassim-latest.md'],
      tools: ['agent-inbox/neil.md'],
    },
  ],
  AGT_STEVE: [
    {
      title: 'Pre-deploy agent simulation',
      trigger: 'Before any new agent or major rule change goes live',
      steps: [
        'Author MiroFish scenario: agents involved, inputs, expected coordination',
        'Run 3-5 iterations to reveal stochastic patterns',
        'Compare predicted vs current behavior',
        'Report unexpected coordination conflicts and emergent patterns',
        'Recommend: ship as-is, ship with adjustments, or block deploy',
      ],
      outputs: ['steve-latest.md', 'Recommendation with explicit risk surface'],
      tools: ['MiroFish API (localhost:5001)', 'CLAUDE.md', 'agent command files'],
      notes: 'Never present simulation results as certainty. Surface what nobody expected.',
    },
    {
      title: 'Outreach focus group',
      trigger: 'Before sending any new cold-outreach style or large reactivation campaign',
      steps: [
        'Define audience persona (industry, role, company size, current state)',
        'Run draft message through MiroFish persona simulator (5-10 personas)',
        'Capture predicted reactions, objections, and hooks that landed',
        'Recommend revisions before send',
      ],
      outputs: ['Focus group report in steve-latest.md'],
      tools: ['MiroFish API', 'icp-rules.md'],
    },
  ],
  AGT_ARINDARCAN: [
    {
      title: 'Daily call center performance scan',
      trigger: 'Every weekday at 8 AM ET',
      steps: [
        'Pull CCM-Stats Template V5 (sheet 1Dgbh3qOGsEHTel405nxMBQFafJtOSjKBJomh5dfpfr4)',
        'Compute per-agent: dials, contacts, appts booked, show rate, speed-to-lead',
        'Compute per-project: appointment rate vs 30% target',
        'Identify 3 wins and 3 improvement areas per active caller',
        'Draft motivating Slack DMs for each caller, queue for David approval',
      ],
      outputs: ['arin-latest.md', 'Drafted Slack DMs (NOT sent)', 'Obsidian Daily Notes ## Arin section'],
      tools: ['Google Sheets MCP', 'CCM-Stats Template V5'],
      notes: 'Never reveal AI identity in Slack. Sound like David. Hold drafts on Fridays if 3+ issues queued.',
    },
    {
      title: 'Per-project Slack channel update',
      trigger: 'Daily after performance scan, separate from team-wide DMs',
      steps: [
        'For each cc-7-* client channel, post: yesterdays appts, week-to-date pace, blockers',
        'Format: 3-line summary, no walls of text',
        'Tag the assigned caller for accountability',
        'Queue all messages for David approval before sending',
      ],
      outputs: ['Drafted client-channel Slack messages'],
      tools: ['CCM-Stats sheet', 'Slack-david MCP'],
    },
  ],
  AGT_TALLY: [
    {
      title: 'Push KPI values to OTP scorecard',
      trigger: '4x daily weekdays at 10:15, 12:15, 15:15, 18:00 ET (launchd)',
      steps: [
        'Read KPI registry at ~/.claude/tally/kpis.json',
        'For each KPI, run its source handler (regex_in_file, queue_status_count, etc.)',
        'Skip and log if source file missing; never fabricate',
        'POST values via mcp__otp__update_kpi for each KPI',
        'If >50% fail in one run, ntfy David at high priority',
      ],
      outputs: ['kpiValues rows in OTP', 'Log file at ~/.claude/schedules/logs/tally-YYYY-MM-DD.log'],
      tools: ['OTP KPIs API', 'kpis.json registry', 'source handlers in tally.py'],
      notes: 'Never fabricate a value when a source is broken. Escalate instead.',
    },
    {
      title: 'Add new KPI handler',
      trigger: 'On David ask to track a new metric',
      steps: [
        'Add KPI definition to ~/.claude/tally/kpis.json',
        'If new source type, add handler function to ~/.claude/scripts/tally.py',
        'Test handler against the source file in dry-run mode',
        'Auto-create KPI on OTP via update_kpi if it does not exist',
      ],
      outputs: ['Updated kpis.json', 'Updated tally.py if new handler'],
      tools: ['kpis.json', 'tally.py', 'OTP KPIs API'],
    },
  ],
};

function indent(s: string, n: number): string {
  const pad = ' '.repeat(n);
  return s.split('\n').map(l => l ? pad + l : l).join('\n');
}

function sopsToYaml(sops: Sop[]): string {
  // Returns YAML that REPLACES "sops: []" -- starts with "sops:" line then list items.
  // Caller will insert this at the same indent (6 spaces) as the rest of the agent's fields.
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
  const before = content.length;

  let agentsSeeded = 0;
  let agentsSkipped = 0;

  for (const [agentId, sops] of Object.entries(SOPS)) {
    // Find the agent's block start: "    - id: AGT_FOO"
    const startRe = new RegExp(`^(\\s+)- id:\\s*${agentId}\\s*$`, 'm');
    const m = startRe.exec(content);
    if (!m) {
      console.log(`  SKIP ${agentId}: not found in v20`);
      agentsSkipped++;
      continue;
    }

    // Determine block end (next "    - id: AGT_..." OR "  humans:" line)
    const blockStart = m.index;
    const afterStart = blockStart + m[0].length;
    const restRe = /^(\s+- id:\s*\w|\s*humans\s*:)/m;
    const restMatch = restRe.exec(content.slice(afterStart));
    const blockEnd = restMatch ? afterStart + restMatch.index : content.length;
    const block = content.slice(blockStart, blockEnd);

    // Detect if sops already populated (has "sops:" with content following, not "sops: []")
    if (/sops:\s*\n\s+- /.test(block)) {
      console.log(`  SKIP ${agentId}: sops already populated`);
      agentsSkipped++;
      continue;
    }

    const sopsYaml = indent(sopsToYaml(sops), 6); // 6-space indent matches other agent fields

    let newBlock: string;
    if (/^\s+sops:\s*\[\]\s*$/m.test(block)) {
      // Replace "sops: []" line with the populated form. Use a replacement
      // function so any "$N" inside sopsYaml is not interpreted as a backref.
      newBlock = block.replace(/^(\s+)sops:\s*\[\]\s*$/m, () => sopsYaml);
    } else {
      // No sops field at all (e.g. Steve who I just restored from v19) -- inject before maturity_level
      // or before the next agent if no maturity_level. Function form for safety.
      const beforeAnchor = /^(\s+)maturity_level:/m;
      const m2 = beforeAnchor.exec(block);
      if (m2) {
        const indentStr = m2[1];
        newBlock = block.replace(beforeAnchor, () => sopsYaml + '\n' + indentStr + 'maturity_level:');
      } else {
        // Insert at end of block
        newBlock = block.trimEnd() + '\n' + sopsYaml + '\n';
      }
    }

    content = content.slice(0, blockStart) + newBlock + content.slice(blockEnd);
    console.log(`  seed ${agentId}: +${sops.length} SOP${sops.length === 1 ? '' : 's'}`);
    agentsSeeded++;
  }

  console.log(`\n${agentsSeeded} agents seeded, ${agentsSkipped} skipped.`);
  console.log(`v20 raw_content: ${before} -> ${content.length} (+${content.length - before})`);

  if (agentsSeeded === 0) {
    console.log('Nothing to write.');
    await c.end();
    return;
  }

  await c.query(
    `UPDATE oos_files SET raw_content=$1, updated_at=now() WHERE id=$2`,
    [content, v20.id]
  );
  console.log('v20 updated. Reload /dashboard/team -> click any agent -> see SOPs.');
  await c.end();
}

main().catch(e => { console.error('Seed failed:', e.message); process.exit(1); });
