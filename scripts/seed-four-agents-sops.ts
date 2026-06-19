// Replace lazy 2-each SOPs for Dirk, Pepper, Radar, Dash with authored sets at
// proper operating depth. Each catalog grounded in CLAUDE.md and project memory.
// Same surgical pattern as seed-dan-sops.ts: find block, replace sops:, sync
// frontmatter column.
//
// Usage: SNEEZE_ORG_ID=<uuid> railway run npx tsx scripts/seed-four-agents-sops.ts

import pg from 'pg';
import * as YAML from 'yaml';

const url = process.env.DATABASE_URL!;
const orgId = process.env.SNEEZE_ORG_ID!;
const c = new pg.Client({ connectionString: url });

interface Sop { title: string; trigger: string; steps: string[]; outputs: string[]; tools: string[]; notes?: string; }

const CATALOG: Record<string, Sop[]> = {

  AGT_DIRK: [
    {
      title: 'Daily cold prospecting wave',
      trigger: '3x daily at 10 AM, 12 PM, 3 PM ET Mon-Fri (cron) or on-demand via /prospect',
      steps: [
        'Pull next 10 prospects from cold queue (refreshed weekly via /dirk-icp-refresh)',
        'Apply ICP filter: established brands with infrastructure + capital + experienced ownership; reject early-stage / first-time operators',
        'Skip any prospect on do-not-contact (Heather Hudson, Striking Brands, Stretch Zone, School of Rock, StretchLab, iCRYO) and any direct competitor of an active client',
        'Verify ownership signal in subject line; apply Kennedy patterns from /Users/dsteel/.claude/ref/dirk-kennedy-patterns.md',
        'Draft each cold email using current calibrated voice; no em dashes, no AI tells, no stacked adjectives',
        'Send via Pepper through David real Gmail (better deliverability than notifications@), log every send in GHL via ghl.sh',
        'Update dirk-latest.md with sourcing-from-Gmail-Sent count, never internal counter',
      ],
      outputs: ['10 sent cold emails per wave', 'GHL contact + opp records', 'dirk-latest.md', 'cold-queue.md decremented'],
      tools: ['ghl.sh', 'Pepper inbox', 'cold-queue.md', 'icp-rules.md', 'dirk-kennedy-patterns.md', 'Gmail MCP'],
      notes: 'Never send before 9 AM ET. Food/restaurant/QSR/smoothie/pizza/coffee/dessert all out of ICP permanently. Sourcing the daily-sent count from Gmail Sent (not internal counters) is non-negotiable since the Apr 27 trust break.',
    },
    {
      title: 'Pipeline scan and stale-deal triage',
      trigger: 'Every morning at 7 AM ET, embedded in /pipeline run',
      steps: [
        'Pull GHL opportunities + Proposify state for managed pipeline via ghl.sh and radar-proposify-latest.md',
        'Cross-reference Fireflies meetings + Gmail Sent for warm signals before any close decision',
        'Flag stale (>14 days no movement after a real meeting) but do not auto-close on stage age alone',
        'Treat under-14-day post-meeting silence as normal lead-to-sales cycle, not a bottleneck',
        'Surface deals won for Janine billing flag; check pepper-clients.md + Accelo + CCM before treating as new revenue (existing-client wins are procedural)',
        'Write to /Users/dsteel/.claude/dirk-latest.md',
      ],
      outputs: ['dirk-latest.md', 'GHL stage updates (Proposal Signed when Proposify wins)', 'Janine billing alerts in Obsidian'],
      tools: ['ghl.sh', 'Proposify (via Slack)', 'Fireflies MCP', 'Gmail MCP', 'pepper-clients.md', 'Accelo MCP'],
      notes: 'NEVER close opportunities based on GHL stage age alone. Always cross-reference Fireflies + Gmail + calendar. Caught Apr 13 closing Red Light Method incorrectly after a real Apr 9 warm meeting.',
    },
    {
      title: 'Reactivation outreach (autonomous)',
      trigger: '48-hour auto-send cron 2x/day for queued reactivation drafts; David veto = delete draft',
      steps: [
        'Pull dormant clients from GHL where last touch >90 days and no active opp',
        'Build reactivation draft using founder voice, reference specific historical engagement detail',
        'Queue for 48-hour soft hold; if David edits or deletes, respect the veto',
        'On auto-send: route through Pepper to Gmail (David personal account)',
        'Log reactivation send in GHL + dirk-latest.md',
        'Track reply rate by cohort for the weekly Monday report',
      ],
      outputs: ['Sent reactivation emails', 'GHL touchpoint logs', 'Weekly cohort metrics in dirk-latest.md'],
      tools: ['ghl.sh', 'Pepper inbox', 'reactivation-templates.md', 'Gmail MCP'],
      notes: 'L8 autonomous since Mar 28, 2026. No human approval per send. Vetoes are still respected. Pulse override applies if client is on watch list.',
    },
    {
      title: 'Expansion outreach with Pulse override check',
      trigger: 'Weekly Wednesday mornings; or on-demand when an active client crosses an expansion trigger',
      steps: [
        'Read pulse-latest.md FIRST; if client is on Pulse churn watch list, abort silently',
        'Confirm client meets expansion criteria: strong performance + stable leads + rising Account Score',
        'Draft expansion offer (add channel, increase budget, add service) using founder voice',
        'Route to Pepper for founder-approval-required send (expansion is never auto-sent)',
        'On David approval, Pepper sends from David personal Gmail',
        'Log in GHL with opp_type=expansion for separate revenue tracking',
      ],
      outputs: ['Drafted expansion offers', 'Founder approval queue', 'GHL expansion opps tagged'],
      tools: ['pulse-latest.md', 'ghl.sh', 'Pepper inbox', 'Gmail MCP'],
      notes: 'Pulse always wins Pulse-Dirk conflicts. Hunter vs Guardian. Expansion cannot proceed during a downturn flag.',
    },
    {
      title: 'Won proposal end-to-end handoff',
      trigger: 'Proposify event "won" or "accepted" lands in #secret-agen-back-channel',
      steps: [
        'Update GHL opp to stage = "Proposal Signed" via ghl.sh update-opp-status',
        'Check pepper-clients.md to determine: new client OR existing client (procedural billing doc)',
        'If new client: flag Janine for billing setup + onboarding task in Todoist',
        'If existing client: flag Janine for the procedural billing change only',
        'Update radar-proposify-latest.md so morning briefing reflects the win',
        'Write to Obsidian Daily Note ## Pipeline Wins',
      ],
      outputs: ['GHL stage updated', 'Janine billing alert', 'Obsidian win entry', 'Updated proposify state file'],
      tools: ['ghl.sh', 'pepper-clients.md', 'Accelo MCP', 'CCM-Stats sheet', 'Todoist MCP', 'Obsidian MCP'],
      notes: 'Procedural wins (existing-client billing addendums, CC/ACH forms) are NOT new revenue. Budget Batteries Apr 14 was the trigger for this rule.',
    },
    {
      title: 'WOA franchise outreach (separate track)',
      trigger: 'Weekly Tuesday afternoon, separate from main cold queue',
      steps: [
        'Pull WOA franchisee list from /Users/dsteel/.claude/ref/woa-franchisees.md',
        'Skip locations Sneeze It already manages (offboarded Lake Wheeler, Wake Forest)',
        'Skip China Grove (runs their own call team -- CCM zero-dial paradox suppression)',
        'Draft franchisee-direct outreach (no GEO pitch -- they do not control the website)',
        'Pitch the 4C stack (Capture, Core, Clarity, Call Center) to individual franchisees',
        'Track signed locations toward 50-location goal',
      ],
      outputs: ['Sent WOA franchisee emails', 'GHL contacts tagged owner=woa-franchisee', 'WOA progress board update'],
      tools: ['ghl.sh', 'Pepper inbox', 'woa-franchisees.md', 'Gmail MCP'],
      notes: 'WOA franchisees handle multi-location 4C deals as INDIVIDUAL signs, not bundles. A multi-location proposal that looks stale may already be dead because each location signed separately.',
    },
    {
      title: 'ICP refresh and cold queue management',
      trigger: 'Weekly Sunday evening via /dirk-icp-refresh',
      steps: [
        'Pull fresh prospect universe from LeadMagic + Apollo + manual research',
        'Apply ICP filter: established brands, fitness/wellness/auto repair/professional services preferred',
        'Cross-check against CLAUDE.md "PERMANENT" exclusions (Heather Hudson, food vertical, etc.)',
        'Cross-check against active client competitor list (no prospecting against active clients)',
        'Refill cold-queue.md to ~150 prospects (covers a full week of 30/day sends)',
        'Document any new ICP rules learned from the week in icp-rules.md',
      ],
      outputs: ['Refreshed cold-queue.md', 'Updated icp-rules.md', 'OOS capture if new pattern emerged'],
      tools: ['LeadMagic API', 'Apollo API', 'cold-queue.md', 'icp-rules.md', 'OTP capture_learning'],
      notes: 'ICP rule: established brands with infrastructure + capital + experienced ownership. Early-stage / pre-brand / first-time operators are the anti-pattern. Past shame was fit mismatch, not delivery failure.',
    },
  ],

  AGT_PEPPER: [
    {
      title: 'Inbox triage three-times-daily',
      trigger: '8 AM Morning Clear Runway, 12:30 PM Mid-Day Check, 5 PM End of Day Sweep',
      steps: [
        'Read /Users/dsteel/.claude/pepper-inbox-memory.md to skip already-processed emails',
        'Pull unread Gmail threads since last run; cap at 50 per pass to avoid context bloat',
        'Match sender domain against pepper-clients.md whitelist (68 domains)',
        'Sort each into 4 buckets: CLIENT-URGENT, CLIENT-ROUTINE, TEAM/VENDOR, NOISE',
        'Draft replies in David voice (no em dashes, no AI tells, match David tone) for client buckets',
        'Append to pepper-inbox-memory.md so next run skips them; prune entries >30 days',
        'Write urgent escalations to agent-inbox/radar.md so morning briefing surfaces them',
      ],
      outputs: ['Drafted Gmail replies awaiting David approval', 'pepper-latest.md', 'Radar inbox post for urgents', 'Updated pepper-inbox-memory.md'],
      tools: ['Gmail MCP', 'pepper-clients.md', 'pepper-inbox-memory.md', 'agent-inbox/radar.md'],
      notes: 'Client-domain emails are NEVER deleted without David seeing them first. Zero exceptions. The Don Miskulin / Rockstars of Tomorrow incident set this rule.',
    },
    {
      title: 'Send Dirk-drafted outreach via David Gmail',
      trigger: 'Dirk approves a cold/reactivation/expansion draft and posts to agent-inbox/pepper.md',
      steps: [
        'Read agent-inbox/pepper.md for queued sends from Dirk',
        'Verify recipient is in pepper-clients.md or on Dirk approved cold/reactivation list',
        'Send from David real Gmail account (NOT notifications@) for deliverability and to dodge spam folders',
        'Log every send in GHL via ghl.sh add-note for CRM tracking',
        'Mark queued item as sent in agent-inbox/pepper.md and post confirmation back to agent-inbox/dirk.md',
      ],
      outputs: ['Sent Gmail messages', 'GHL note entries', 'Updated agent-inbox files'],
      tools: ['Gmail MCP', 'ghl.sh', 'agent-inbox/pepper.md', 'agent-inbox/dirk.md'],
      notes: 'Pepper is the sending engine. Dirk is the strategist. Never send Dirk reactivation/expansion from notifications@ -- the deliverability gap is real.',
    },
    {
      title: 'Auto-reply intel routing to Dirk',
      trigger: 'Inbound auto-replies (bounces, OOO, contact changes, acquisitions) to Dirk-sent outreach',
      steps: [
        'Detect auto-reply patterns: bounce codes, OOO subject prefixes, "no longer with the company", acquisition language',
        'Extract actionable intel: new contact name + email, acquisition date + acquirer, return date (for OOO)',
        'Post structured intel to agent-inbox/dirk.md within 1 hour of receipt',
        'Tag the original GHL contact with the intel so cold-queue refresh picks it up',
        'No David in the middle for routine intel (per L8 message bus protocol)',
      ],
      outputs: ['Dirk inbox intel posts', 'GHL contact updates'],
      tools: ['Gmail MCP', 'ghl.sh', 'agent-inbox/dirk.md'],
      notes: 'L8 inter-agent coordination. David only sees these if intel quality is questionable or volume spikes. Routine bounces are not escalated.',
    },
    {
      title: 'Urgent client escalation to Radar',
      trigger: 'CLIENT-URGENT bucket from triage OR keyword match on "emergency" / "lawyer" / "press" / "lawsuit"',
      steps: [
        'Confirm sender is in pepper-clients.md (no false-flag escalations on noise)',
        'Draft a one-paragraph summary: who, what, urgency level, recommended next action',
        'Post to agent-inbox/radar.md with priority=high so morning briefing surfaces it at top',
        'If timing is critical (off-hours, multi-day silence ending), also ntfy David direct',
        'Hold the actual reply draft for David approval; never auto-send urgent client comms',
      ],
      outputs: ['Radar inbox urgent post', 'Optional ntfy push', 'Drafted reply held for approval'],
      tools: ['Gmail MCP', 'pepper-clients.md', 'agent-inbox/radar.md', 'ntfy-notify.sh'],
      notes: 'Bogdan does NOT handle CC payroll/timesheet -- routine FYI on those is informational, never urgent.',
    },
    {
      title: 'Weekly inbox health report',
      trigger: 'Friday 4 PM ET via /inbox stats',
      steps: [
        'Aggregate the week: triage volume per bucket, response times, drafts approved vs edited vs skipped',
        'Surface dropped balls: client emails older than 48h with no draft sent',
        'Flag pattern shifts: which clients increased volume, which sender domains are new',
        'Compute approval rate as a coaching signal (low rate = voice drift)',
        'Write to Obsidian Daily Note ## Pepper Weekly section',
      ],
      outputs: ['Weekly inbox health markdown in Obsidian', 'Coaching observations to memory.md if voice drift detected'],
      tools: ['Gmail MCP', 'pepper-inbox-memory.md', 'Obsidian MCP'],
      notes: 'Approval rate <80% for two weeks running = voice drift. Re-read CLAUDE.md voice rules and recent David edits.',
    },
  ],

  AGT_RADAR: [
    {
      title: 'Compile morning briefing (orchestrator)',
      trigger: 'Every weekday at 7:30 AM ET (cron) or on-demand via /briefing',
      steps: [
        'Confirm all 9 scanner subagents have run and written fresh state files (radar-slack, calendar, todoist, proposify, pepper, dash, dirk, fireflies, arin)',
        'Flag any file >18 hours old as stale; do not silently substitute',
        'Compile 5-section briefing: URGENT, TODAY, SYSTEMS, CONTEXT, WARNINGS',
        'Calculate billable hours and revenue at USD 165 per hour; flag if >40% or <20% of week',
        'Wednesday OFF detection: any meeting on a Wednesday gets called out by name',
        'Write to Obsidian daily note (Daily Notes/YYYY-MM-DD.md) under ## Daily Briefing via mcp__obsidian__patch_note',
      ],
      outputs: ['Obsidian daily note ## Daily Briefing section', 'ntfy push to David'],
      tools: ['Obsidian MCP', 'ntfy.sh', 'shared state files'],
      notes: 'Read radar-calendar-latest.md or todays daily note for "today" -- never yesterday tomorrow-preview. Wednesday is OFF -- flag any meeting scheduled on Wed.',
    },
    {
      title: 'Slack scan with tiered strategy',
      trigger: 'Embedded in morning + on-demand via /radar-slack',
      steps: [
        'Tier 1 (always scan, high signal): #leadership, #cc-5-general-agents, #secret-agen-back-channel, client-direct channels for active accounts',
        'Tier 2 (relevance filter): department channels, project channels matching active rocks',
        'Cap 50 messages per channel, last 24 hours',
        'Apply Bogdan-no-DM-reply pattern: if Bogdan replied in person rather than Slack, flag the missing audit trail',
        'Write to /Users/dsteel/.claude/radar-slack-latest.md with timestamp',
      ],
      outputs: ['radar-slack-latest.md', 'Tiered channel summary embedded in morning briefing'],
      tools: ['slack-david MCP', 'slack-channels.md ref'],
      notes: 'Channel list lives at /Users/dsteel/.claude/ref/slack-channels.md. Bogdan walks in for replies instead of typing -- flag the gap so audit trail stays intact.',
    },
    {
      title: 'Calendar scan with billable + Wednesday-off detection',
      trigger: 'Embedded in morning + on-demand via /radar-calendar',
      steps: [
        'Pull Google Calendar for today + tomorrow preview',
        'Categorize each event by tag prefix: [CLIENT] (billable USD 165/hr), [TEAM] (leadership), [STRATEGY] (ON the business), untagged = overhead',
        'Calculate billable hours, total billable revenue projected this week',
        'Flag fragmentation: 4+ context switches per day or no 2+ hour deep work blocks',
        'Wednesday OFF: any meeting on a Wednesday gets surfaced by name with the prompt "Meeting on your OFF day -- intentional?"',
        'Apply known recurring event rules: "Open Coaching Call - David Steel" = [TEAM] not billable; "Arin Coaching Call" / "CCM" = [STRATEGY] David coached BY others',
        'Write to /Users/dsteel/.claude/radar-calendar-latest.md',
      ],
      outputs: ['radar-calendar-latest.md', 'Calendar section of morning briefing with USD totals + Wednesday flags'],
      tools: ['google-calendar MCP'],
      notes: 'NEVER delete or modify calendar events. CREATE allowed; UPDATE and DELETE are not.',
    },
    {
      title: 'Todoist scan with delegation tracking',
      trigger: 'Embedded in morning + on-demand via /radar-todoist',
      steps: [
        'Pull tasks due today, overdue, and due this week',
        'Flag overdue tasks prominently as "dropped balls"',
        'Flag task/calendar mismatches: tasks >30 min with no calendar block (exclude routine/recurring)',
        'Scan for team member names in task assignees: Francois, Bogdan, Janine, Kristen, Nate, Zeynep, Mo, Mohamed, Riya, Anna, Anastasiia, Amanda, Erica, Eugene, Gianna, Sonya, Mykola, Yehor, Renata, Alyson',
        'Group delegated tasks by person; flag overdue prominently',
        'Pattern detection: 3+ overdue from one person = "capacity issue?" prompt',
        'Write to /Users/dsteel/.claude/radar-todoist-latest.md',
      ],
      outputs: ['radar-todoist-latest.md', 'Waiting on Team section in morning briefing'],
      tools: ['Todoist MCP'],
      notes: 'Tasks can be created and completed but never deleted without David approval. Christian Cooper, Francois Pelser, Mo Kouchaoui, Renata Zerina are TERMINATED -- exclude from delegation tracking.',
    },
    {
      title: 'Proposify scan via secret back-channel',
      trigger: 'Embedded in morning + on-demand via /radar-proposify',
      steps: [
        'Pull last 48 hours of events from #secret-agen-back-channel (C0AEPBAU51C)',
        'Ignore test data from Feb 12-13, 2026',
        'Deduplicate by Proposal ID: report view count, not separate entries',
        'Zapier health check: zero events in 48h + David had [CLIENT] events = "Check Zapier connection"',
        'Categorize events: Reminder Sent, Client Created, Proposal Created/Sent/Viewed/Commented/Signed/Won/Lost',
        'Flag wins so Dirk can pick up the GHL stage update',
        'Write to /Users/dsteel/.claude/radar-proposify-latest.md',
      ],
      outputs: ['radar-proposify-latest.md', 'Proposify section in morning briefing with deals won + buying signals'],
      tools: ['slack-david MCP'],
      notes: 'Make and Zapier are READ-ONLY. Never create/update/delete/run scenarios. Read and report only.',
    },
    {
      title: 'Tuesday Leadership L10 prep',
      trigger: 'Sunday 4 PM ET (cron)',
      steps: [
        'Read /Users/dsteel/.claude/rocks.md and check status of every quarterly Rock',
        'Read /Users/dsteel/.claude/issues.md, surface OPEN issues + new flags from the week',
        'Pull scorecard KPIs: Qualified Sales Calls, RMR, Lead-to-Client Conv % from OTP /api/v1/kpis',
        'Compile Headlines (top 3-5 from week from Slack + Calendar + Todoist scan)',
        'Check 7-day to-do completion rate from prior L10 meeting in OTP',
        'Push current Rocks + Issues + KPI snapshot to OTP so /l10 page renders fresh data Tuesday',
        'Write to Obsidian Daily Note ## L10 Prep section with Scorecard / Rocks / Headlines / Issues / To-Dos subsections',
      ],
      outputs: ['Obsidian L10 prep section', 'OTP rocks + tickets + kpis synced for Tuesday', 'Optional ntfy if Rocks off-track'],
      tools: ['rocks.md', 'issues.md', 'OTP API', 'Obsidian MCP'],
      notes: 'Off track = due in 2 weeks AND unchecked. Bogdan 1-on-1 prep is a separate Wed 4 PM trigger.',
    },
    {
      title: 'Friday weekly wrap-up',
      trigger: 'Friday 4 PM ET (cron) or on-demand',
      steps: [
        'Aggregate the week: Billable Client Time (vs 12hr target), Team Leadership (vs 5hr), Strategic Work (vs 10hr), Overhead (flag if >35%)',
        'Compute 4-week trend from /Users/dsteel/.claude/time-allocation-history.json; flag >5% drift for 2+ weeks',
        'Preview next Wednesday: clear or N meetings; suggest adjustments',
        'List clients not contacted in 30+ days, flag for follow-up',
        'Suggest time blocking optimizations for next week',
        'Write to Obsidian Daily Note ## Weekly Wrap-Up',
      ],
      outputs: ['Weekly wrap-up Obsidian section', 'Updated time-allocation-history.json', 'Next-week optimization suggestions'],
      tools: ['google-calendar MCP', 'time-allocation-history.json', 'Obsidian MCP'],
      notes: 'Billable target: 12 hrs (30%). Leadership target: 5 hrs (12.5%). Strategic target: 10 hrs (25%). Overhead target: <35%.',
    },
  ],

  AGT_DASH: [
    {
      title: 'Daily customer ad performance scan',
      trigger: 'Every weekday at 8 AM ET',
      steps: [
        'Pull CCM-Stats Template V5 (Sheet ID 1Dgbh3qOGsEHTel405nxMBQFafJtOSjKBJomh5dfpfr4) -- Project Stats, Agent Stats, Speed To Lead, Heat Maps',
        'Pull Meta Ads spend + leads via meta-ads.sh for managed accounts only (~USD 136K/30d, 39+ accounts)',
        'Pull Google Ads spend + leads via google-ads.sh for MCC 175-915-4807 (~USD 49.5K/30d, 27 accounts)',
        'Compare yesterday vs 7-day median vs 30-day median per account; flag deltas >20%',
        'Use median (not mean) for Speed To Lead -- one outlier should not drag the metric',
        'Write to /Users/dsteel/.claude/dash-latest.md with timestamps',
      ],
      outputs: ['dash-latest.md', 'Critical alerts to Obsidian Daily Notes ## Dash Alerts section'],
      tools: ['Google Sheets MCP', 'meta-ads.sh', 'google-ads.sh'],
      notes: 'Never recommend changes -- report patterns. Report only on Sneeze It managed accounts. Full rules at ~/.claude/ref/dash-rules.md.',
    },
    {
      title: 'T20 guarantee client deep view',
      trigger: 'Daily, embedded in morning scan',
      steps: [
        'For each guarantee client (T20), compute the full vertical: Spend, CPL, leads, appts, show rate, close rate',
        'Compare to brand baseline AND that client own baseline',
        'No News Is News: flag if no Slack activity 48+ hours on a guarantee client',
        'Output structured per-client tile with trend arrows (up/down/flat)',
        'Cross-reference Crystal exclusions and Pulse churn watch list before flagging anything as anomaly',
      ],
      outputs: ['T20 client tiles in dash-latest.md', 'Embedded in morning briefing for full T20 visibility'],
      tools: ['CCM-Stats sheet', 'meta-ads.sh', 'google-ads.sh', 'crystal-latest.md', 'pulse-latest.md', 'Slack history'],
      notes: 'Active T20: WOA corporate, HBFG, Serotonin Centers, Rockstars of Tomorrow, Momentum Medical, HiTone Fitness (8 locations, 1 agreement, 1 FB account), DryBar, GLO30 (offboarding), Proof Fitness, VENT, Cellebration Wellness.',
    },
    {
      title: 'Cross-platform pattern detection',
      trigger: 'Daily, embedded in morning scan',
      steps: [
        'Compare Meta vs Google performance per account where both are managed',
        'Detect lead quality correlation: high Meta lead volume but low CCM appt rate = lead quality drop',
        'Detect creative fatigue patterns: rising CPL + falling CTR over 3-day window',
        'Detect spend anomalies: 3x retry pattern from Meta is usually 1 real charge, not fraud',
        'Surface patterns to morning briefing without recommending specific changes',
      ],
      outputs: ['Pattern detection notes in dash-latest.md', 'Cross-platform alerts when warranted'],
      tools: ['meta-ads.sh', 'google-ads.sh', 'CCM-Stats sheet'],
      notes: 'Meta retries failed charges up to 3 times -- looks like 3 separate charges to banks and triggers fraud alerts. Almost always 1 real Sneeze It charge. Nate Cox WOA case Apr 14 was the precedent.',
    },
    {
      title: 'Spend pacing alerts (absorbed from Jeff)',
      trigger: 'Daily, embedded in morning scan; ad-hoc on big budget changes',
      steps: [
        'Read Accelo custom field per account for monthly budget',
        'Compute current month spend vs budget for every managed account',
        'Fire flag at 80% of budget remaining-time-adjusted (not just 80% of dollars)',
        'Cross-reference Crystal exclusions: skip offboarded (WOA Lake Wheeler, Wake Forest) and paused accounts',
        'Skip GettaMeeting (uses our Google Ads account but not managed -- ads stopped Mar 9)',
        'Honor known budget corrections: GLO30 Uptown Dallas USD 1100/mo, WOA Hickory USD 1000/mo (corrected with Bogdan Mar 19)',
      ],
      outputs: ['Pacing alerts in dash-latest.md', 'Optional ntfy if multiple accounts pacing hot same day'],
      tools: ['Accelo MCP', 'meta-ads.sh', 'google-ads.sh', 'crystal-latest.md'],
      notes: 'Inherited from Jeff at his Apr 13 retirement. Account-status flips and account-exist deltas also Dash now (South Coast MedSpa Apr 8 silent migration was the kind of thing only Jeff caught).',
    },
    {
      title: 'CCM data integrity check',
      trigger: 'Daily, before morning briefing fires',
      steps: [
        'Verify CCM-Stats sheet was updated in the last 24 hours',
        'Detect system/bulk bookings counted as agent bookings (architectural data quality issue per Mar 27 audit)',
        'Detect deleted leads still flagged as uncalled for 5+ days (Bear Williams / Jenna Buettner pattern)',
        'Detect text-converted leads invisible to call data (STL false flags)',
        'If staleness or quality issue: flag to Bogdan via Crystal channel, never silently use stale data',
      ],
      outputs: ['Data quality flag in dash-latest.md if any check fails', 'Crystal inbox post if Bogdan needs to address'],
      tools: ['Google Sheets MCP', 'CCM-Stats sheet', 'agent-inbox/crystal.md'],
      notes: 'Mar 27 audit identified 3 structural CCM data problems still open. This SOP is the daily detection layer; resolution is a David/Jeff/Neil L10 issue.',
    },
    {
      title: 'Weekly trend report',
      trigger: 'Friday 3 PM ET, before Radar weekly wrap-up',
      steps: [
        'Compute weekly aggregates per account: total spend, total leads, total appts, total close',
        'Compare week vs prior week vs 4-week average',
        'Identify outliers: best week and worst week per account',
        'Surface 3 wins and 3 concerns at portfolio level for the L10 scorecard discussion',
        'Write to dash-latest.md weekly section, also to Obsidian ## Dash Weekly',
      ],
      outputs: ['Weekly trend section in dash-latest.md', 'Obsidian ## Dash Weekly section', 'Inputs for Radar Friday wrap-up'],
      tools: ['CCM-Stats sheet', 'meta-ads.sh', 'google-ads.sh', 'Obsidian MCP'],
      notes: 'Use 4-week median for trend baseline (not mean). Outliers should not drive trend signals.',
    },
  ],

};

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
  const before = content.length;

  for (const [agentId, sops] of Object.entries(CATALOG)) {
    const startRe = new RegExp(`^(\\s+)- id:\\s*${agentId}\\s*$`, 'm');
    const m = startRe.exec(content);
    if (!m) { console.log(`SKIP ${agentId}: not found in v20`); continue; }
    const blockStart = m.index;
    const afterStart = blockStart + m[0].length;
    const restRe = /^(\s+- id:\s*\w|\s*humans\s*:)/m;
    const restMatch = restRe.exec(content.slice(afterStart));
    const blockEnd = restMatch ? afterStart + restMatch.index : content.length;
    const block = content.slice(blockStart, blockEnd);

    const sopsRe = /^(\s{6})sops:[\s\S]*?(?=^\s{6}[a-z_]+:|^\s{4}- id:|^\s*humans\s*:)/m;
    const sopsYaml = indent(sopsToYaml(sops), 6) + '\n';
    let newBlock: string;
    if (sopsRe.test(block)) {
      newBlock = block.replace(sopsRe, () => sopsYaml);
      console.log(`${agentId}: replaced sops with ${sops.length} authored entries`);
    } else {
      const beforeAnchor = /^(\s+)maturity_level:/m;
      const m2 = beforeAnchor.exec(block);
      if (m2) {
        const indentStr = m2[1];
        newBlock = block.replace(beforeAnchor, () => sopsYaml + indentStr + 'maturity_level:');
      } else {
        newBlock = block.trimEnd() + '\n' + sopsYaml;
      }
      console.log(`${agentId}: inserted ${sops.length} sops (no prior sops field)`);
    }
    content = content.slice(0, blockStart) + newBlock + content.slice(blockEnd);
  }

  console.log(`\nv20 raw_content: ${before} -> ${content.length} (delta ${content.length - before})`);
  await c.query(`UPDATE oos_files SET raw_content=$1, updated_at=now() WHERE id=$2`, [content, v20.id]);

  // Sync frontmatter from new raw_content
  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!fmMatch) throw new Error('No frontmatter delimiters found');
  const parsed: any = YAML.parse(fmMatch[1]);
  await c.query(`UPDATE oos_files SET frontmatter=$1 WHERE id=$2`, [JSON.stringify(parsed), v20.id]);

  // Verify sops counts in frontmatter
  const agents = (parsed?.entities?.agents || []) as any[];
  for (const id of Object.keys(CATALOG)) {
    const a = agents.find(x => x.id === id);
    console.log(`  ${id}: ${a?.sops?.length || 0} sops in frontmatter`);
  }

  await c.end();
  console.log('\nDone. Reload /dashboard/team -> click each agent -> see authored SOPs.');
}

main().catch(e => { console.error('Failed:', e.message); process.exit(1); });
