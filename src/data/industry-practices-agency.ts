/**
 * Agency Coordination Playbook
 * Original OTP content -- battle-tested patterns from running a 25-agent AI team
 * at a digital marketing agency (Sneeze It).
 *
 * These are real coordination practices, not scraped content.
 * Each practice has been validated in production with 12+ months of operation.
 */

export interface IndustryPractice {
  term: string;
  definition: string;
  category: string;
  failureMode: string;
  evidence: 'HUMAN_DEFINED_RULE' | 'OBSERVED_REPEATEDLY' | 'MEASURED_RESULT';
}

export const AGENCY_PRACTICES: IndustryPractice[] = [
  // ---- Ownership & Boundaries ----
  {
    term: 'One Seat, One Owner',
    definition: 'Every agent has exactly one job. No agent does two jobs. No two agents do the same job. This prevents overlap, blame diffusion, and the "who owns this?" problem that kills multi-agent teams.',
    category: 'Ownership',
    failureMode: 'Two agents both think they own client communication. One sends a follow-up email while the other schedules a call. Client gets confused, trust drops. Or: nobody owns it because "that is the other agent\'s job."',
    evidence: 'HUMAN_DEFINED_RULE',
  },
  {
    term: 'Separate Blast Radius',
    definition: 'Tuning one agent must never break another. Each agent reads its own config, writes to its own state file, and has its own error handling. Changes to Agent A should have zero side effects on Agent B.',
    category: 'Ownership',
    failureMode: 'You update the sales agent\'s prompt and suddenly the project manager stops including budget context in reports. Shared state or shared prompts created invisible coupling.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Color-Code Your Agents',
    definition: 'Assign each agent a unique color. Use it in dashboards, Slack messages, reports, and status files. When David sees olive green, he knows it is Radar (Chief of Staff). Gold means Dirk (Sales). This is how 25 agents stay visually distinguishable.',
    category: 'Ownership',
    failureMode: 'All agent outputs look the same. You cannot tell which agent produced a report at a glance. Debugging takes 3x longer because you are mentally mapping names to roles every time.',
    evidence: 'HUMAN_DEFINED_RULE',
  },

  // ---- Communication Patterns ----
  {
    term: 'Pre-Computed Shared State',
    definition: 'Every data source writes to its own file. Orchestrators read files, never scan sources directly. Slack writes to slack-latest.md. Calendar writes to calendar-latest.md. The morning briefing reads all files. This prevents N agents from hitting the same API N times.',
    category: 'Communication',
    failureMode: 'Five agents all query the Slack API independently. Rate limits hit. Data is inconsistent because each agent queried at a different time. One agent sees a message the others missed.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Staleness Detection on Shared State',
    definition: 'Every shared state file includes a timestamp. If the file is more than 18 hours old, flag it as stale in the briefing. Stale data is worse than missing data because people act on it with false confidence.',
    category: 'Communication',
    failureMode: 'The calendar scanner failed silently 2 days ago. The briefing keeps reporting "no meetings today" because it reads the stale file. David misses a client call.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Agent Message Bus',
    definition: 'Direct agent-to-agent communication via structured inbox files. Each agent has an inbox at a known path. Messages are typed: REQUEST, INFORM, PROPOSAL, RESPONSE, CHALLENGE. No human in the loop for inter-agent coordination.',
    category: 'Communication',
    failureMode: 'Every agent-to-agent handoff requires David to be in the middle. The sales agent finds a churn risk but cannot tell the retention agent directly. It sits in a report until David reads it 3 days later. The client has already left.',
    evidence: 'HUMAN_DEFINED_RULE',
  },
  {
    term: 'Slack Tiered Scanning',
    definition: 'Not all Slack channels are equally important. Tier 1 channels (high-signal) are always scanned. Tier 2 channels are scanned with relevance filtering. Tier 3 channels are never scanned. This prevents the briefing from drowning in noise.',
    category: 'Communication',
    failureMode: 'The morning briefing includes 200 Slack messages from 40 channels. Most are irrelevant. David stops reading briefings because the signal-to-noise ratio is too low.',
    evidence: 'OBSERVED_REPEATEDLY',
  },

  // ---- Escalation & Control ----
  {
    term: 'Escalation Over Autonomy',
    definition: 'By default, agents flag and recommend. The human decides. Only grant autonomy for specific, well-defined operations after the agent has proven reliability. Start every agent in "shadow mode" (read-only, report-only) before giving it write access.',
    category: 'Escalation',
    failureMode: 'A new sales agent sends 50 cold emails with a pricing error. No human reviewed them. The mistake is discovered when prospects reply with confusion. Brand damage is done.',
    evidence: 'HUMAN_DEFINED_RULE',
  },
  {
    term: 'Escalation Ladder with Teeth',
    definition: 'Escalations must have deadlines and auto-actions. 24 hours: alert. 48 hours: direct message. 72 hours: warning with proposed action. Beyond 72 hours: auto-escalate to leadership with a specific recommendation. No more infinite "stalled" loops.',
    category: 'Escalation',
    failureMode: 'An overspend alert fires. Nobody responds. The alert fires again the next day. And the next. After 2 weeks, someone notices the client burned through their monthly budget in 10 days.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Shadow Mode Before Live Mode',
    definition: 'Every new agent starts in read-only mode. It scans, analyzes, and reports, but cannot take actions. After 2-4 weeks of validated shadow mode output, the human promotes it to live mode with write access. Earn trust through demonstrated accuracy.',
    category: 'Escalation',
    failureMode: 'A new project manager agent is deployed with full Accelo write access on day one. It creates duplicate tasks, assigns work to the wrong people, and marks projects complete that are not. Cleanup takes longer than the agent was supposed to save.',
    evidence: 'HUMAN_DEFINED_RULE',
  },
  {
    term: 'Founder Override Authority',
    definition: 'The founder (or designated human) has final override on every agent decision. This is not a check on competence. It is a safety valve for context that agents cannot see: relationships, politics, timing, reputation. Document which decisions require human override vs which are fully autonomous.',
    category: 'Escalation',
    failureMode: 'The sales agent sends a reactivation email to a former client who left on bad terms. The agent does not know the relationship history. The email reopens a wound and generates a complaint.',
    evidence: 'OBSERVED_REPEATEDLY',
  },

  // ---- Data & Analytics ----
  {
    term: 'Single Source of Truth for Client Data',
    definition: 'One agent owns each data domain. The performance analyst owns all ad performance data (Meta + Google). The project manager owns all project status data (Accelo). No two agents independently query the same data source for the same purpose.',
    category: 'Data',
    failureMode: 'The sales agent and the retention agent both pull client spend data independently. They use different date ranges. Their reports contradict each other. The founder does not know which number is right.',
    evidence: 'HUMAN_DEFINED_RULE',
  },
  {
    term: 'Median Over Average for Client Metrics',
    definition: 'When reporting aggregate client metrics (cost per lead, appointment rates, etc.), use median instead of average. One outlier client spending 10x the others will skew the average and hide real performance patterns.',
    category: 'Data',
    failureMode: 'The portfolio "average CPL" is $45, which looks fine. But the median is $28, and one client at $180 CPL is dragging the average up. The expensive client\'s problem is invisible in the aggregate.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Alert on Deviation, Not Absolutes',
    definition: 'Pacing alerts should fire when spend deviates from budget by a percentage threshold (e.g., +30% overspend), not when spend crosses a dollar amount. A $100 overspend on a $500/month account is a crisis. A $100 overspend on a $50,000/month account is noise.',
    category: 'Data',
    failureMode: 'Every small account triggers alerts constantly because the dollar thresholds are set for large accounts. Alert fatigue sets in. When a real overspend happens on a large account, nobody notices because alerts are ignored.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Cross-Reference Before Alerting',
    definition: 'Before an agent fires an alert about a client issue, it must check at least 2 other data sources to confirm. The ad pacing agent checks project status (is the account offboarding?) and the exclusion list (is this account paused?) before alerting on overspend.',
    category: 'Data',
    failureMode: 'The pacing agent fires an overspend alert for a client that is offboarding next week. The team wastes 30 minutes investigating a non-issue. This happens 3 times a week. Trust in alerts erodes.',
    evidence: 'OBSERVED_REPEATEDLY',
  },

  // ---- Client Management ----
  {
    term: 'Guarantee Client Vertical View',
    definition: 'High-value clients (top 20% by spend) get a full cross-platform view in every daily briefing. Not just "Meta is up 5%" but Meta + Google + Call Center + Project Status in one block. The founder should never have to ask "how is [big client] doing?"',
    category: 'Client Management',
    failureMode: 'A guarantee client\'s Google Ads are performing well but their call center conversion dropped 40%. The ad performance report looks green. The call center report is on a different page. Nobody connects the dots for 2 weeks.',
    evidence: 'HUMAN_DEFINED_RULE',
  },
  {
    term: 'No News Is News for Top Clients',
    definition: 'If a top client has had zero internal communication (no Slack messages, no emails, no calls) for 48+ hours, flag it in the briefing. Silence from a high-value client is a signal, not the absence of one.',
    category: 'Client Management',
    failureMode: 'A $15K/month client has gone silent for 10 days. Everyone assumes someone else is handling it. The client is actually evaluating competitors. By the time someone notices, the RFP is out.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Retention Agent Overrides Sales Agent',
    definition: 'When a client is on the retention watch list (churn risk), all sales expansion plays for that client are automatically paused. The retention agent is the Guardian. The sales agent is the Hunter. Guardians always outrank Hunters on existing clients.',
    category: 'Client Management',
    failureMode: 'The sales agent sends an upsell proposal to a client who is unhappy with current performance and considering leaving. The client feels tone-deaf and accelerates their departure.',
    evidence: 'HUMAN_DEFINED_RULE',
  },
  {
    term: 'Churn Risk Detection Before Human Flags It',
    definition: 'The retention agent monitors leading indicators: declining engagement, fewer calls, slower email responses, budget reduction requests, team turnover at the client. By the time a human says "I think we might lose this client," the agent should have flagged it 2 weeks ago.',
    category: 'Client Management',
    failureMode: 'The agency finds out a client is leaving when they get the cancellation email. All the warning signs were there: no calls for 6 weeks, emails taking 5 days to reply, budget questions. Nobody was watching the pattern.',
    evidence: 'HUMAN_DEFINED_RULE',
  },

  // ---- Operations & Rhythm ----
  {
    term: 'Morning Briefing Protocol',
    definition: 'One daily briefing compiles all agent outputs into 5 sections: URGENT, TODAY, SYSTEMS (every agent reports), CONTEXT, WARNINGS. Every agent writes to its shared state file. The briefing reads all files and compiles. The founder reads one document, not 10.',
    category: 'Operations',
    failureMode: 'Each agent sends its own report at different times. The founder reads 8 separate updates, tries to mentally compile them, misses a conflict between the calendar and the task list. A client meeting overlaps with an internal deadline nobody caught.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Wednesday OFF Rule',
    definition: 'Protect one day per week with zero meetings. Agents flag any meeting scheduled on the protected day. This is not about productivity. It is about preventing the founder from becoming a full-time meeting attendee who happens to also run a company.',
    category: 'Operations',
    failureMode: 'Every day has meetings. Deep work happens at 9pm. Strategy work happens on weekends. The founder burns out in 6 months. The business stalls because the person who makes decisions never has time to think.',
    evidence: 'HUMAN_DEFINED_RULE',
  },
  {
    term: 'Billable Time Tracking at Agent Level',
    definition: 'The calendar agent categorizes every event as CLIENT (billable at $165/hr), TEAM (leadership), STRATEGY (business development), or OVERHEAD. Weekly reports show billable utilization. Flag when billable drops below 20% (underperforming) or exceeds 40% (no time for strategy).',
    category: 'Operations',
    failureMode: 'The founder is 60% billable and proud of it. Revenue looks good. But zero time went into sales, strategy, or agent improvement for 3 months. The pipeline is empty. When current clients churn, there is nothing to replace them.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Delegation Tracking with Overdue Flagging',
    definition: 'Every task assigned to a team member is tracked. Overdue tasks are flagged prominently in the daily briefing, grouped by person. 3+ overdue items from one person triggers a "capacity issue?" flag. This is not micromanagement. It is making dropped balls visible before they become client problems.',
    category: 'Operations',
    failureMode: 'A designer has 7 overdue tasks. Nobody knows because the tasks are scattered across Todoist, Slack, and Accelo. A client deliverable is 2 weeks late. The founder finds out when the client complains.',
    evidence: 'OBSERVED_REPEATEDLY',
  },

  // ---- Sales & Pipeline ----
  {
    term: 'Autonomous Cold Outreach with Kill List',
    definition: 'The sales agent sends cold outreach on a daily drumbeat (e.g., 20-30 emails/day across all audiences). But it maintains a kill list: companies that are direct competitors of active clients, companies with existing relationships, companies explicitly rejected. The kill list is checked before every send.',
    category: 'Sales',
    failureMode: 'The sales agent sends a prospecting email to a competitor of your biggest client. The client finds out and questions your loyalty. Or: the agent emails someone the founder knows personally who already declined.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Pipeline Data Hygiene as Agent Responsibility',
    definition: 'The sales agent autonomously cleans CRM data daily: updates deal stages from Proposify status, corrects deal values, closes dead opportunities, removes duplicates. No human approval needed for data cleanup. The CRM is always current.',
    category: 'Sales',
    failureMode: 'The CRM shows $200K in pipeline. Half of it is dead deals nobody closed out. The founder makes hiring decisions based on a pipeline that does not exist. Actual pipeline is $80K.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Proposal Won Triggers Billing Chain',
    definition: 'When a proposal is signed (Proposify fires "won"), the sales agent immediately: updates the CRM opportunity to "Proposal Signed," flags accounting for billing setup, updates shared state, and logs to the daily note. One event triggers a chain, not a human remembering 4 steps.',
    category: 'Sales',
    failureMode: 'A proposal is signed on Friday. The sales agent updates the CRM. But nobody tells accounting. The client starts work on Monday. Three weeks later, the first invoice goes out late. The client is annoyed.',
    evidence: 'OBSERVED_REPEATEDLY',
  },

  // ---- Call Center Coordination ----
  {
    term: 'Call Center Manager as Agent, Not Human',
    definition: 'An AI agent manages the calling team via Slack: daily performance feedback, speed-to-lead monitoring, appointment rate tracking. Messages sound human, never formulaic. All messages require founder approval before sending. The agent replaces a $4K/month human manager.',
    category: 'Call Center',
    failureMode: 'The human call center manager leaves. Nobody monitors daily performance for 3 weeks while you hire a replacement. Speed to lead doubles. Appointment rates drop 15%. You lose $20K in potential revenue.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Speed to Lead as Pacing Metric',
    definition: 'Track how fast new leads get their first call attempt. Target: under 5 minutes for web form leads. The call center agent monitors this in real time and flags violations by caller name. Speed to lead has 10x the impact on conversion rate of any other call center metric.',
    category: 'Call Center',
    failureMode: 'A new lead comes in at 10:02 AM. The first call attempt happens at 2:15 PM. By then, the lead has talked to 3 competitors. Your close rate on this lead drops from 30% to 5%.',
    evidence: 'MEASURED_RESULT',
  },

  // ---- Learning & Improvement ----
  {
    term: 'Every Correction Is a Learning',
    definition: 'When the founder corrects an agent\'s output, that correction must be captured as a structured learning (what failed, what to do instead, why) before the agent continues. Corrections that never reach the learning system are wasted lessons. The system gets smarter only if corrections are recorded.',
    category: 'Learning',
    failureMode: 'The founder corrects the same mistake 5 times across 5 sessions. Each session starts fresh. The agent has no memory of being corrected. The founder gets frustrated and stops trusting agents.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Nightly Maturity Evaluation',
    definition: 'An evaluator agent scores the entire agent team nightly against a maturity framework (e.g., 8 Levels of Agentic Engineering). The score should feel like a challenge, not a compliment. Weaknesses at lower levels cap the score regardless of higher-level capabilities.',
    category: 'Learning',
    failureMode: 'The team adds advanced features (agent-to-agent messaging, autonomous outreach) while basic reliability (data accuracy, consistent formatting) is still broken. The foundation crumbles under the weight of complexity.',
    evidence: 'HUMAN_DEFINED_RULE',
  },
  {
    term: 'Frontier Scanner with Quality Gate',
    definition: 'A dedicated learning agent scans for new tools, frameworks, and techniques weekly. But every candidate must pass two gates: "Will this make our team better?" and "Is what we already have better?" Only "better than current" survives. No hoarding interesting links.',
    category: 'Learning',
    failureMode: 'The team adopts 3 new frameworks in a month because they looked promising. None are properly integrated. The existing tools were fine. Six weeks of work is wasted on horizontal moves disguised as improvements.',
    evidence: 'OBSERVED_REPEATEDLY',
  },

  // ---- Architecture Principles ----
  {
    term: 'Earn Complexity',
    definition: 'Validate the current agent stack before adding new agents or tools. Every new agent must justify its existence with a specific job that no existing agent can do. "It would be cool to have an agent for X" is not justification.',
    category: 'Architecture',
    failureMode: 'The team has 30 agents. 8 of them have overlapping responsibilities. 5 of them run but nobody reads their output. The maintenance burden exceeds the value. Debugging takes hours because nobody knows which agent is responsible for what.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Data Before Design',
    definition: 'Collect data about a blind spot for at least 2 weeks before designing a solution. The sales agent ran in shadow mode (reporting only) for 4 weeks before getting write access. This prevents building elaborate solutions for problems that do not exist.',
    category: 'Architecture',
    failureMode: 'You build an elaborate lead scoring system. After launch, you discover that 90% of leads come through one channel and a simple FIFO queue would have worked. Two weeks of build time wasted.',
    evidence: 'HUMAN_DEFINED_RULE',
  },
  {
    term: 'File-Based State Is Authoritative',
    definition: 'When file-based state (shared state files, config files) and agent memory conflict, the file wins. Agents must load canonical files before acting on remembered context. Memory supplements. It never overrides.',
    category: 'Architecture',
    failureMode: 'An agent remembers that Client X is on a $5K/month plan. But the config file was updated to $8K/month last week. The agent reports inaccurate revenue numbers for 2 weeks until someone notices.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
];

export const AGENCY_INDUSTRY_META = {
  slug: 'agency',
  name: 'Digital Marketing Agency',
  description: 'Coordination practices for agencies running AI agent teams that manage client advertising, call centers, project delivery, and sales pipelines. Battle-tested patterns from a 25-agent production deployment.',
  practiceCount: AGENCY_PRACTICES.length,
  icon: 'briefcase',
};
