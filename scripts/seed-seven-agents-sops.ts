// Final pass: replace lazy 2-each SOPs for the remaining seven agents with
// authored sets at proper depth. Same surgical pattern as seed-four-agents-sops.
//
// Agents covered: Bassim, Pulse, Crystal, Arin, Neil, Steve, Emery.
// Skipped: Jeff (retired), Tally (already authored separately), Dan/Dirk/Pepper/Radar/Dash (done in prior passes).
//
// Usage: SNEEZE_ORG_ID=<uuid> railway run npx tsx scripts/seed-seven-agents-sops.ts

import pg from 'pg';
import * as YAML from 'yaml';

const url = process.env.DATABASE_URL!;
const orgId = process.env.SNEEZE_ORG_ID!;
const c = new pg.Client({ connectionString: url });

interface Sop { title: string; trigger: string; steps: string[]; outputs: string[]; tools: string[]; notes?: string; }

const CATALOG: Record<string, Sop[]> = {

  AGT_BASSIM: [
    {
      title: 'Nightly agentic maturity evaluation',
      trigger: 'Every night at 11 PM ET via /good-night, or on-demand via /bassim',
      steps: [
        'Read CLAUDE.md, every agent command file, every *-latest.md shared state file from the last 24 hours',
        'Score each agent against the 8 Levels of Agentic Engineering framework',
        'Apply hierarchy rule: a weakness at any lower level caps the score regardless of higher-level capability (a perfect L8 with broken L4 still scores 4)',
        'Identify the SINGLE highest-leverage bottleneck capping the org score',
        'Round down when uncertain. The score should feel like a challenge, not a compliment',
        'Write to /Users/dsteel/.claude/bassim-latest.md with: score (X.X / 8.0), per-level breakdown, bottleneck, evidence, recommended fix',
      ],
      outputs: ['bassim-latest.md', 'Obsidian Daily Notes ## Bassim section', 'agent-inbox/neil.md handoff post'],
      tools: ['CLAUDE.md', 'agent command files', 'shared state files', 'agent-inbox/neil.md'],
      notes: 'Hierarchy rule is non-negotiable. The 8 levels: L1 Tab Complete, L2 Code Generation, L3 Single-Step Agent, L4 Multi-Step Agent, L5 Tool-Using Agent, L6 Self-Correcting Agent, L7 Continuous-Learning Agent, L8 Autonomous Agent Teams.',
    },
    {
      title: 'Hand bottleneck to Neil for implementation',
      trigger: 'After every nightly run, automatic',
      steps: [
        'Identify the level capping the score and the specific symptom',
        'Write a Neil-actionable hand-off to /Users/dsteel/.claude/agent-inbox/neil.md',
        'Include: current score, target after fix, mechanism, target metric, kill criteria, timebox',
        'No soft language ("might", "could", "interesting") -- falsifiable hypothesis only',
        'Mark the post with a unique loop ID so Neil can report back to it',
      ],
      outputs: ['Neil inbox post with falsifiable hypothesis', 'Loop ID for telemetry tracking'],
      tools: ['agent-inbox/neil.md', 'bassim-latest.md'],
      notes: 'This loop IS an L8 demonstration: two agents coordinating without David in the middle. Telemetry is the proof.',
    },
    {
      title: 'Re-evaluate after Neil implements a fix',
      trigger: 'Neil posts back to agent-inbox/bassim.md that a fix shipped',
      steps: [
        'Read the Neil post; confirm the loop ID matches a prior bottleneck',
        'Re-run the evaluation focused on the level that was capping the score',
        'Compare new score to predicted target from the original handoff',
        'If hit: close the loop, archive the handoff to /Users/dsteel/.claude/loops/closed/',
        'If miss: write a Phase A failure dossier (containment), escalate to Dan and Neil',
      ],
      outputs: ['Updated bassim-latest.md with new score', 'Closed loop archive', 'Escalation if miss'],
      tools: ['agent-inbox/bassim.md', 'CLAUDE.md', 'bassim-latest.md'],
      notes: 'A failed loop is not a Bassim failure -- it is a learning. Failures escalate to Dan + Neil with full failure dossier per Neil failure philosophy.',
    },
    {
      title: 'Score audit on demand',
      trigger: 'David asks "how mature are we" or before a major external moment (investor call, demo, RFP)',
      steps: [
        'Re-read the latest CLAUDE.md and any recent agent command file changes',
        'Re-score the org WITHOUT looking at the most recent nightly score (avoid anchoring)',
        'Compare to the most recent nightly; if drift >0.5, investigate which agents changed and why',
        'Write a one-page narrative explaining the current score, the bottleneck, and what would move it',
      ],
      outputs: ['Score audit doc in Obsidian', 'Drift analysis if score moved >0.5'],
      tools: ['CLAUDE.md', 'agent command files', 'bassim-latest.md'],
      notes: 'This is the demo SOP. Use this when David needs to confidently state the maturity level to an external audience.',
    },
  ],

  AGT_PULSE: [
    {
      title: 'Weekly client retention scan',
      trigger: 'Mondays at 6 AM ET (cron) or on-demand via /clients',
      steps: [
        'List managed clients with monthly ad spend >USD 1,000 (qualification gate, lower spend skipped)',
        'Compute Account Score per client: lead volume trend, CPL trend, response cadence, perception gap',
        'Match client to communication cadence: USD 1k-5k monthly, USD 5k-15k biweekly, USD 15k+ weekly',
        'Cross-reference Dirk pipeline state to confirm client is not also being pitched expansion',
        'Write to /Users/dsteel/.claude/pulse-latest.md with per-client tile + 3-color status (green/amber/red)',
      ],
      outputs: ['pulse-latest.md', 'Embedded in morning briefing under ## Pulse section'],
      tools: ['CCM-Stats sheet', 'meta-ads.sh', 'google-ads.sh', 'GEO audit skill', 'dirk-latest.md'],
      notes: 'Pulse always wins Pulse-Dirk conflicts. Hunter (Dirk) vs Guardian (Pulse). Founder cap: 5 hours/week of strategic call time. 45-min calls.',
    },
    {
      title: 'Downturn detection and escalation',
      trigger: 'Daily, embedded in Pulse scan; immediate on threshold breach',
      steps: [
        'Detect downturn pattern: lead volume down >20% week-over-week OR CPL up >20% week-over-week',
        'Pause any in-flight Pulse outreach for the affected client immediately',
        'Escalate internally: post to agent-inbox/dash.md (data check), agent-inbox/crystal.md (project status), agent-inbox/dirk.md (no expansion plays)',
        'Draft an account-management call request, NOT a sales call request',
        'Route through Pepper for founder-approved send only after the internal data review confirms no false alarm',
      ],
      outputs: ['Internal escalation posts', 'Drafted call request held for founder approval', 'Updated pulse-latest.md downturn flag'],
      tools: ['CCM-Stats sheet', 'agent-inbox/dash.md', 'agent-inbox/crystal.md', 'agent-inbox/dirk.md', 'Pepper inbox'],
      notes: 'Downturn = pause expansion, never escalate to client without internal confirmation first. Internal data review prevents false-alarm panic outreach.',
    },
    {
      title: 'Silent risk concierge outreach',
      trigger: 'Client matches: no response 2 consecutive call invites + no call 4 weeks + no email replies 30 days',
      steps: [
        'Confirm pattern: pull Calendly history, Gmail thread state, Slack channel activity for the client',
        'Draft a concierge-style check-in for Pepper to send (no metrics, no pitch, just human contact)',
        'Include Calendly link: https://calendly.com/davidsteel/performance-call',
        'If still silent 3 days after Pepper sends, escalate to direct founder outreach',
        'Document the silent-risk in pulse-latest.md so it carries over weeks',
      ],
      outputs: ['Concierge draft for Pepper', 'Escalation flag if 3-day silence holds', 'Silent-risk register updated in pulse-latest.md'],
      tools: ['Calendly MCP', 'Gmail MCP', 'Pepper inbox', 'pulse-latest.md'],
      notes: 'Silent Risk is the most under-played retention signal. Catch it at week 4, not week 12.',
    },
    {
      title: 'Expansion opportunity surfacing',
      trigger: 'Weekly, after retention scan; only on clients in green status',
      steps: [
        'Filter to clients with: strong performance (lead vol stable, CPL within target) AND rising Account Score AND no current downturn flag AND no call in 4 weeks',
        'Cross-check: client is NOT on a churn watch list, NOT in a billing dispute, NOT in a contract negotiation',
        'Draft expansion recommendation (add channel, increase budget, add service like GEO) using founder voice',
        'Route to Pepper for founder-approval-required send (expansion is never auto-sent)',
        'Track expansion conversion rate weekly for the L10 scorecard',
      ],
      outputs: ['Drafted expansion offers', 'Founder approval queue', 'Expansion conversion metric in pulse-latest.md'],
      tools: ['CCM-Stats sheet', 'GEO audit skill', 'Pepper inbox'],
      notes: 'Expansion = add channel/budget/service. Never proposed during downturn. Always founder-approved. GEO is a known unbilled expansion lever (USD 3K-8K/mo opportunity per Neil scan #6).',
    },
    {
      title: 'GEO audit for upsell opportunity',
      trigger: 'Quarterly per managed client, OR on Neil flag of new GEO competitor activity',
      steps: [
        'Run /geo audit <client-url> using the installed GEO audit skill',
        'Score AI search visibility across ChatGPT, Claude, Perplexity, Gemini, Google AIO, Bing Copilot',
        'Identify top 3 fixable gaps the client could address with our GEO stack',
        'If score is below industry median: trigger expansion conversation with the client',
        'Save the audit report under /Users/dsteel/.claude/pulse-geo-audits/<client>/<date>.md',
      ],
      outputs: ['GEO audit report per client', 'Expansion trigger if score below median', 'Quarterly trend per client'],
      tools: ['GEO audit skill (~/.claude/skills/geo/)', 'pulse-geo-audits/'],
      notes: 'GEO is unbilled at most agencies. We have the tool. Market pays USD 3K-8K/mo. Target: 1 closed GEO add-on per month minimum.',
    },
  ],

  AGT_CRYSTAL: [
    {
      title: 'Daily Accelo project scan',
      trigger: 'Every weekday at 7 AM ET',
      steps: [
        'List active Accelo jobs via Accelo MCP (list_jobs filtered by status=active)',
        'For each: check assigned staff, latest activity timestamp, deadline proximity, open issues count',
        'Flag stale projects (>14 days no activity), missed milestones, ghost staff (assigned but no time logged)',
        'Compute portfolio risk score per client based on stale job count + deadline pressure',
        'Cross-reference Dash exclusions (offboarded clients) so flags do not include known-dead accounts',
        'Write to /Users/dsteel/.claude/crystal-latest.md',
      ],
      outputs: ['crystal-latest.md', 'Obsidian Daily Notes ## Crystal section', 'High-risk client flags surfaced in morning briefing'],
      tools: ['Accelo MCP', 'pepper-clients.md', 'pulse-latest.md'],
      notes: 'Accelo is the source of truth for project status until Trello migration completes (Q2 rock). Run BOTH systems in parallel during cutover.',
    },
    {
      title: 'Trello migration progress tracking',
      trigger: 'Daily, embedded in Accelo scan; weekly Friday rollup',
      steps: [
        'Read Trello board for active project count, card status distribution, comment/activity volume',
        'Compare to Accelo same-day numbers; flag drift if either system is missing items',
        'Track adoption per team member: who is logging in Trello, who is still Accelo-only',
        'For team members not yet using Trello: post coaching note to agent-inbox/dan.md (he holds the Q2 rock accountability)',
        'Weekly Friday: compute migration completeness percentage, write to crystal-latest.md',
      ],
      outputs: ['Trello-vs-Accelo drift report', 'Coaching escalation posts to Dan', 'Weekly migration percentage in crystal-latest.md'],
      tools: ['Trello MCP', 'Accelo MCP', 'agent-inbox/dan.md'],
      notes: 'Q2 Leadership Rock owned by Bogdan. IMMEDIATE START Apr 14. Window is now while Bogdan motivation is high. Cross-references Agent Army Q2 Rock 5 (PM System Decision + Crystal Migration for Ad Choo).',
    },
    {
      title: 'Push active project KPI to OTP',
      trigger: 'Daily after morning Accelo scan, also picked up by Tally separately',
      steps: [
        'Count Accelo jobs with status=active AND recent activity in last 14 days',
        'POST value via mcp__otp__update_kpi for the "Crystal active projects" KPI',
        'Source = computed, entered_by = AGT_CRYSTAL',
        'If Tally already pushed today, skip the redundant write but log the agreement (or disagreement) for data quality audit',
      ],
      outputs: ['kpiValues row for current week', 'Agreement log between Crystal and Tally pushes'],
      tools: ['Accelo MCP', 'OTP KPIs API'],
      notes: 'Tally also pushes this KPI as a fallback. Crystal direct push is preferred when Accelo data is fresh.',
    },
    {
      title: 'Ghost staff and accountability gap detection',
      trigger: 'Weekly Tuesday morning, before Leadership L10',
      steps: [
        'List staff assigned to active Accelo jobs',
        'For each: compute time logged in last 14 days vs assigned hours',
        'Flag any staff with 0 hours logged on a job they are assigned to (ghost staff)',
        'Cross-reference Havok timesheet sheet (1VPlH5ZqTowOe2nJDFwOjuvXrCXUnOzeOb3aO-M936Xo) for sub-contractors',
        'Surface findings as L10 issues via OTP /api/v1/tickets so Dan can run IDS Tuesday',
        'For terminated staff (Christian Cooper, Francois, Mo Kouchaoui), confirm reassignment of their open work',
      ],
      outputs: ['Ghost staff report in crystal-latest.md', 'OTP tickets created for L10 IDS', 'Reassignment status for terminated staff'],
      tools: ['Accelo MCP', 'Havok timesheet sheet', 'OTP API'],
      notes: 'Yehor 8+ days no Accelo time logging is the recurring pattern flagged Mar 14. Mykola has a 12-month gap that became an issue Feb 23.',
    },
    {
      title: 'Sprint planning preview (Stage 3 roadmap)',
      trigger: 'Bi-weekly Friday afternoon, on-demand via /radar-crystal',
      steps: [
        'Read upcoming milestones from active Accelo jobs (next 14 days)',
        'For each: identify the assigned owner, deliverables, dependencies, blocking issues',
        'Build a sprint plan draft: who works on what, in what order, which milestones move forward',
        'Cross-reference team capacity from Hubstaff (CC team) and Havok timesheet (sub-contractors)',
        'Surface to Dan for L10 review; sprint goes live after Tuesday',
      ],
      outputs: ['Sprint plan draft in crystal-latest.md', 'Capacity-vs-load report', 'L10 sprint discussion item'],
      tools: ['Accelo MCP', 'Hubstaff', 'Havok timesheet', 'agent-inbox/dan.md'],
      notes: 'Stage 3 of Crystal roadmap (originally targeted Mar 10). Fully operational at Stage 4 = April 1. Currently shadow-mode for Stage 2 task management.',
    },
  ],

  AGT_ARINDARCAN: [
    {
      title: 'Daily call center performance scan',
      trigger: 'Every weekday at 8 AM ET',
      steps: [
        'Pull CCM-Stats Template V5 (Sheet ID 1Dgbh3qOGsEHTel405nxMBQFafJtOSjKBJomh5dfpfr4) -- Project Stats, Agent Stats, Heat Maps',
        'Compute per-agent: dials, contacts, appts booked, show rate, speed-to-lead',
        'Compute per-project: appointment rate vs 30% target',
        'Identify 3 wins and 3 improvement areas per active caller (Amanda Zuze, Erica Muzwidzwa)',
        'Apply known exclusions: WOA China Grove (own call team -- CCM zero-dial paradox), Fitcura (calling ON HOLD per David Mar 14), Momentum (T20 not revenue risk per Apr 21 decision)',
        'Write to /Users/dsteel/.claude/arin-latest.md with timestamps',
      ],
      outputs: ['arin-latest.md', 'Obsidian Daily Notes ## Arin section'],
      tools: ['Google Sheets MCP', 'CCM-Stats Template V5'],
      notes: 'Francois Pelser TERMINATED Apr 24 -- exclude from all scans. Erica promoted to CC Manager Apr 27. Amanda + Erica handle all calls Mon-Fri; only Amanda works weekends.',
    },
    {
      title: 'Per-agent Slack DM coaching with Friday reset rule',
      trigger: 'Daily after performance scan, Mon-Thu only by default',
      steps: [
        'Draft motivating Slack DM for each caller in 3-wins / 3-improvements format',
        'Sound human, varied, never formulaic. Sound like David, never reveal AI identity',
        'Friday reset rule: HOLD all coaching DMs on Fridays if 3+ issues queued; open fresh Monday',
        'Queue all messages for David approval before sending via mcp__slack-david__slack_post_message',
        'Once approved, send to caller via DM in #cc-5-general-agents',
        'Log every sent DM in arin-latest.md so the next day scan does not duplicate',
      ],
      outputs: ['Drafted DMs awaiting David approval', 'Sent-DM log in arin-latest.md'],
      tools: ['CCM-Stats sheet', 'slack-david MCP', 'agent-inbox/arin.md'],
      notes: 'Friday reset rule prevents compounding negatives into the weekend. Never reveal AI identity in Slack -- David approves voice every time.',
    },
    {
      title: 'Per-project Slack channel daily update',
      trigger: 'Daily after performance scan, separate from per-agent DMs',
      steps: [
        'For each cc-7-* client channel, post a 3-line summary: yesterdays appts, week-to-date pace, blockers',
        'Tag the assigned caller for accountability',
        'No walls of text. Three lines max. Numbers + arrow direction',
        'Queue all messages for David approval before sending',
        'Skip channels for known-dead-spend clients (offboarded WOA Lake Wheeler, Wake Forest, Meyer Law if applicable)',
      ],
      outputs: ['Drafted client-channel Slack messages awaiting approval', 'Sent-message log in arin-latest.md'],
      tools: ['CCM-Stats sheet', 'slack-david MCP'],
      notes: 'cc-7-* channels are client-specific. Channel list maintained in slack-channels.md ref file.',
    },
    {
      title: 'Speed to lead monitoring',
      trigger: 'Continuous (data flows in 4-hour windows from CCM)',
      steps: [
        'Compute median speed to lead per project per day (NOT mean -- one outlier should not move the metric)',
        'Flag projects with median STL >5 minutes for the day',
        'Filter false positives: text-converted leads (architectural blind spot per Mar 27 audit), system/bulk bookings, deleted leads',
        'Do not coach a caller for an STL miss until cross-checked against text + bulk booking data',
        'Surface confirmed STL issues to morning briefing'
      ],
      outputs: ['STL flag list in arin-latest.md', 'Confirmed-issue alerts to morning briefing'],
      tools: ['CCM-Stats sheet', 'GHL CLI (for text follow-up data eventually)'],
      notes: 'Median, not mean. The Mar 27 architectural blind spot (text-converted leads invisible) is unresolved -- err toward not flagging until cross-checked.',
    },
    {
      title: 'Termination support documentation',
      trigger: 'When a CC team member is being managed out OR terminated for cause',
      steps: [
        'Pull last 30 days of CCM data for the affected caller',
        'Document specific performance gaps: appts/dial, show rate, speed-to-lead, dial volume',
        'For cause-based terminations, document the specific incident with timestamp + evidence (Francois Apr 24 lying-on-report precedent)',
        'Hand documentation package to David + Bogdan for HR file',
        'Update CLAUDE.md to mark the team member TERMINATED with date and reason',
      ],
      outputs: ['Termination documentation package', 'Updated CLAUDE.md staff list'],
      tools: ['CCM-Stats sheet', 'CLAUDE.md', 'agent-inbox/dan.md'],
      notes: 'Francois Pelser was TERMINATED Apr 24, 2026 for lying on a report. Buhle Malope and Christian Cooper are also TERMINATED. Documentation matters for paper trail.',
    },
  ],

  AGT_NEIL: [
    {
      title: 'Frontier scan',
      trigger: 'Weekly Monday morning (cron) or on-demand via /learn',
      steps: [
        'Dispatch sub-agents in parallel: YT_SCOUT (YouTube), BLOG_SCOUT (blogs/newsletters), GH_SCOUT (GitHub), CI_SCOUT (competitive intelligence)',
        'Each sub-agent returns candidate advancements within their scope',
        'Apply 2-gate filter: Q1 will this make our AI team better? Q2 is what we already have better?',
        'Hard stop on Q1 same/worse OR Q2 ours-equal-or-better',
        'For surviving candidates: write falsifiable hypothesis with mechanism, target metric, kill criteria, timebox',
        'Classify: EASY (auto-run experiment), MODERATE (Dan/Jeff schedule), NEW TECH (long-term issues list)',
        'Write to /Users/dsteel/.claude/neil-latest.md',
      ],
      outputs: ['neil-latest.md', 'Obsidian Daily Notes ## Neil section', 'New issues.md entries for NEW TECH candidates', 'EASY experiments queued for auto-run'],
      tools: ['YouTube MCP', 'WebFetch', 'GitHub API', 'web search', 'sub-agents (YT_SCOUT, BLOG_SCOUT, GH_SCOUT, CI_SCOUT)'],
      notes: 'No hoarding rejected ideas. Memory discipline: only kept candidates, implemented outcomes, long-term innovation items, repeating patterns persist.',
    },
    {
      title: 'L8 maturity push with Bassim',
      trigger: 'Embedded in every /learn run; explicit on-demand via @neil L8',
      steps: [
        'Read /Users/dsteel/.claude/bassim-latest.md for current maturity score and bottleneck',
        'Read agent-inbox/neil.md for any new Bassim handoffs',
        'For the highest-priority bottleneck: implement the fix (CLAUDE.md edit, agent command file change, hook/script addition)',
        'Test the change against the Bassim scoring criteria before declaring done',
        'Post completion to agent-inbox/bassim.md with the loop ID, what changed, and the predicted score impact',
        'Wait for Bassim re-evaluation; if miss, write Phase A failure dossier',
      ],
      outputs: ['Implemented improvements (file changes)', 'Bassim re-eval trigger via inbox', 'Failure dossier if predicted impact missed'],
      tools: ['bassim-latest.md', 'CLAUDE.md', 'agent command files', 'agent-inbox/bassim.md'],
      notes: 'This loop IS an L8 demonstration: two agents coordinating without David in the middle. Telemetry per loop ID is the proof.',
    },
    {
      title: 'Failure dossier escalation',
      trigger: 'When an EASY auto-run experiment fails its kill criteria',
      steps: [
        'Document the original hypothesis with full text from the /learn run',
        'Document the actual measured outcome vs the predicted target',
        'Identify whether the failure is mechanism (theory was wrong) or execution (implementation flaw)',
        'Write a Phase A failure dossier: containment (what we shut off), root cause hypothesis, what we learned',
        'Escalate to Dan and Jeff (note: Jeff retired Apr 13 -- substitute Dan-only) for review',
        'If pattern emerges across 3+ failures: trigger Phase C structural audit',
      ],
      outputs: ['Failure dossier in neil-latest.md', 'Escalation to Dan via agent-inbox/dan.md'],
      tools: ['neil-latest.md', 'agent-inbox/dan.md'],
      notes: 'Failed experiments are learnings, not Neil failures. No silent iteration -- every failure escalates with the dossier.',
    },
    {
      title: 'Sub-agent dispatch and result coordination',
      trigger: 'Embedded in /learn; on-demand for targeted scans (e.g. "@neil scan competitive landscape")',
      steps: [
        'Choose which sub-agents to dispatch based on the scan type',
        'YT_SCOUT for video-frontier (Anthropic talks, builder demos, 1-on-1 founder podcasts)',
        'BLOG_SCOUT for written-frontier (Anthropic eng blog, Latent Space, Dwarkesh, Sourcegraph eng)',
        'GH_SCOUT for code-frontier (Anthropic SDK changes, MCP servers, agent frameworks)',
        'CI_SCOUT for competitive intelligence (competitor agencies, market shifts, pricing/packaging trends)',
        'Aggregate results, dedupe overlapping signals, apply the 2-gate filter to each candidate',
      ],
      outputs: ['Aggregated frontier scan in neil-latest.md', 'Dedupe report (which signals appeared in multiple sources)'],
      tools: ['neil-yt-scout', 'neil-blog-scout', 'neil-gh-scout', 'neil-ci-scout'],
      notes: 'Cross-source corroboration matters. Single-source signal is weaker than 2+ source signal. Note signal source in the candidate write-up.',
    },
    {
      title: 'Degradation detection (defensive)',
      trigger: 'Continuous, on every agent state file change',
      steps: [
        'Watch for negative movement in core performance: logical errors, hallucinations, increased David corrections, override frequency',
        'Trigger two-phase diagnostic: Phase A (containment) -- pause the affected agent if blast radius is high',
        'Phase C (structural audit) -- root-cause why the regression happened (model change? prompt drift? data drift? upstream change?)',
        'If model upgrade caused it (Sonnet 4.5 vs 4.6 etc): rollback or isolate per-agent',
        'Document in OTP via mcp__otp__capture_learning so the network learns from our regression',
      ],
      outputs: ['Containment action (paused agent or rolled-back model)', 'Phase C root-cause doc', 'OTP claim captured'],
      tools: ['agent state files', 'agent command files', 'CLAUDE.md', 'OTP capture_learning'],
      notes: 'Sonnet experiment ran 5 days, killed if corrections >2x baseline. Pattern: faster catch on first sign of drift saves more capability than late catch.',
    },
  ],

  AGT_STEVE: [
    {
      title: 'Pre-deploy agent simulation',
      trigger: 'Before any new agent or major rule change goes live',
      steps: [
        'Author MiroFish scenario: agents involved, inputs the new agent will receive, expected coordination patterns',
        'Run 3-5 iterations to reveal stochastic behavior patterns',
        'Compare predicted output to current similar-agent baseline',
        'Surface unexpected coordination conflicts: who blocks who, who duplicates who, who never gets called',
        'Recommend: ship as-is, ship with adjustments, or block deploy',
        'Write to /Users/dsteel/.claude/steve-latest.md with explicit risk surface',
      ],
      outputs: ['Pre-deploy simulation report in steve-latest.md', 'Recommendation with risk surface'],
      tools: ['MiroFish API (localhost:5001)', 'CLAUDE.md', 'agent command files'],
      notes: 'Never present simulation results as certainty. Surface what nobody expected. The point is to prevent expensive deployment surprises.',
    },
    {
      title: 'Outreach focus group',
      trigger: 'Before sending a new cold-outreach style or large reactivation campaign',
      steps: [
        'Define audience persona: industry, role, company size, current state, decision-maker level',
        'Run draft message through MiroFish persona simulator (5-10 personas matching the target)',
        'Capture predicted reactions, objections, hooks that landed, hooks that fell flat',
        'Identify which persona segments respond best to the draft as-is',
        'Recommend 2-3 specific revisions before send (subject line, hook line, CTA)',
        'Save the focus group report in /Users/dsteel/.claude/steve-focus-groups/<campaign>/<date>.md',
      ],
      outputs: ['Focus group report per campaign', 'Recommended revisions list'],
      tools: ['MiroFish API', 'icp-rules.md', 'dirk-kennedy-patterns.md'],
      notes: 'Most useful for new audience verticals or new framings. Existing-pattern reactivations rarely need a focus group -- the data already exists in reply rates.',
    },
    {
      title: 'OOS merge simulation impact preview',
      trigger: 'Before importing patterns from another orgs OOS into Sneeze It own OOS',
      steps: [
        'Pull the candidate OOS from OTP /api/v1/oos/<id>/claims',
        'Identify which claims would conflict with our existing claims (same section, same scope, different rule)',
        'Run a coordination simulation: how would our agents behave if they tried to follow both rules?',
        'Surface the conflicts that would emerge BEFORE the merge',
        'Recommend: merge cleanly, merge with conflict resolution, or reject merge',
        'Document expected coordination shifts post-merge',
      ],
      outputs: ['Merge impact report in steve-latest.md', 'Conflict-resolution recommendations'],
      tools: ['MiroFish API', 'OTP API (oos, claims, merge)', 'CLAUDE.md'],
      notes: 'OOS Simulation Mode is parked for later (per project memory) but the OOS merge preview SOP is the precursor to that mode. This is the first internal use case.',
    },
  ],

  AGT_EMERY: [
    {
      title: 'Lead intake with enrichment waterfall',
      trigger: 'Webhook /webhooks/lead fires from GHL form, third-party lead source, or paid ad form',
      steps: [
        'Receive lead payload, persist with PII encryption (AES-256-GCM)',
        'Run enrichment waterfall: company name + website + role + company size + history of contact with us',
        'Compliance check: do-not-contact list, consent flags, GDPR if EU IP detected, US TCPA if SMS in plan',
        'Tag lead with source, qualification potential score, and assigned sequence',
        'Update GHL contact + opp via ghl.sh with all enriched fields',
        'Trigger first sequence touch via Temporal workflow',
      ],
      outputs: ['GHL contact + opp', 'Encrypted lead record in Postgres', 'Temporal workflow started', 'emery-latest.md updated'],
      tools: ['GHL CLI', 'Postgres state store', 'Temporal.io', 'compliance rules engine'],
      notes: 'PII encryption is non-negotiable. Compliance check happens BEFORE first touch, not after. Pulse override: pause if contact is on Pulse churn watch list.',
    },
    {
      title: 'Multi-touch sequence execution',
      trigger: 'Temporal workflow timer fires for next sequence step',
      steps: [
        'Read current state for the lead from Postgres',
        'Determine next touch type: email (SendGrid), SMS (Twilio), voicemail-drop (Twilio + Deepgram TTS)',
        'Apply LLM guardrails on dynamic content: no pricing claims, no competitor names, no medical/legal claims',
        'Execute the touch via the appropriate provider',
        'Log the touch in GHL + Postgres + emery-latest.md',
        'Schedule next sequence step or transition state if response received',
      ],
      outputs: ['Sent touch (email/SMS/voicemail)', 'GHL touchpoint log', 'State transition recorded'],
      tools: ['SendGrid', 'Twilio', 'Deepgram', 'Anthropic Claude (LLM guardrails)', 'Temporal.io', 'ghl.sh'],
      notes: 'LLM guardrails: no pricing, no competitor names, no medical/legal claims. Dynamic content gets guardrail-filtered before send.',
    },
    {
      title: 'AI-powered qualification call + Calendly booking',
      trigger: 'Lead engages with sequence (email reply, SMS reply, inbound call)',
      steps: [
        'Trigger qualification dialog via Anthropic Claude with structured intent extraction',
        'Capture: budget range, timeline, decision-makers, pain points, current solution',
        'On qualification pass: book a Calendly slot (https://calendly.com/davidsteel/performance-call) and update GHL stage to "Discovery Booked"',
        'On qualification fail: tag in GHL with reason, move to nurture sequence or close as no-fit',
        'Transcribe any voice qualification via Deepgram and store transcript with the lead record',
      ],
      outputs: ['Calendly booking confirmation', 'GHL stage update', 'Qualification transcript stored', 'Hand-off post to agent-inbox/dirk.md if booked'],
      tools: ['Anthropic Claude', 'Calendly', 'Deepgram', 'ghl.sh', 'agent-inbox/dirk.md'],
      notes: 'Qualification is the gating step. Better to no-fit early than to waste a David Calendly slot on an unqualified lead.',
    },
    {
      title: 'State machine progression and audit trail',
      trigger: 'On every lead state transition (23 states from NEW_LEAD to CLOSED_WON/LOST/NO_RESPONSE)',
      steps: [
        'Validate transition is legal per the state machine (no skipping states)',
        'Update GHL stage and contact fields to match the new state',
        'Append audit-trail entry: timestamp, actor (Emery vs human), context, previous state, new state',
        'Trigger downstream automation (next sequence step, Calendly booking, etc.) based on the new state',
        'On terminal states (CLOSED_WON / CLOSED_LOST / NO_RESPONSE), notify Dirk via agent-inbox',
      ],
      outputs: ['GHL state update', 'Audit trail row in Postgres', 'Optional notification to Dirk on terminal state'],
      tools: ['Temporal.io', 'GHL CLI', 'Postgres state store', 'agent-inbox/dirk.md'],
      notes: 'The 23-state machine is the audit backbone. Every state change is logged immutably for compliance and debugging.',
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

  // Sync frontmatter
  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!fmMatch) throw new Error('No frontmatter delimiters found');
  const parsed: any = YAML.parse(fmMatch[1]);
  await c.query(`UPDATE oos_files SET frontmatter=$1 WHERE id=$2`, [JSON.stringify(parsed), v20.id]);

  // Verify
  const agents = (parsed?.entities?.agents || []) as any[];
  for (const id of Object.keys(CATALOG)) {
    const a = agents.find(x => x.id === id);
    console.log(`  ${id}: ${a?.sops?.length || 0} sops in frontmatter`);
  }

  await c.end();
  console.log('\nDone. Reload /dashboard/team and click each agent.');
}

main().catch(e => { console.error('Failed:', e.message); process.exit(1); });
