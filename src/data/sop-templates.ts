// SOP templates seeded for the team chart's "Insert from template" picker.
// Opinionated, role-specific, ready to drop in and tweak.
//
// Each template is a SOP shape: title, trigger, steps, outputs, tools, notes.
// Loaded by /dashboard/team and exposed to the client as window.__sopTemplates.

export interface SOPTemplate {
  id: string;          // stable template id (insertion gives the SOP a fresh runtime id)
  title: string;
  trigger?: string;
  steps?: string[];
  outputs?: string[];
  tools?: string[];
  notes?: string;
}

export interface SOPTemplateGroup {
  role: string;        // display label, e.g. "Founder / CEO"
  roleId: string;      // slug, e.g. "founder_ceo"
  description: string;
  templates: SOPTemplate[];
}

export const SOP_TEMPLATE_GROUPS: SOPTemplateGroup[] = [
  {
    role: 'Founder / CEO',
    roleId: 'founder_ceo',
    description: 'Operating cadences for a founder running a small-to-mid team. EOS-flavored, builder-biased.',
    templates: [
      {
        id: 'founder_daily_inbox',
        title: 'Daily inbox triage',
        trigger: 'Every weekday at 8 AM and again at 12:30 PM and 5 PM',
        steps: [
          'Mark obvious spam and newsletters, archive in one batch',
          'Identify any email from a domain on the active client whitelist as CLIENT',
          'Tag CLIENT-URGENT (financial, escalation, legal, complaint) vs CLIENT-ROUTINE (reply needed but not urgent)',
          'Draft replies for CLIENT-ROUTINE in your own voice; keep CLIENT-URGENT for human attention',
          'Sweep team and vendor email separately; summarize action items',
          'Set the next sweep window before closing the inbox',
        ],
        outputs: [
          'Drafted replies queued for approval',
          'Daily inbox health summary (counts, oldest unanswered, urgent flags)',
          'Slack alert for any CLIENT-URGENT older than 30 minutes',
        ],
        tools: ['Gmail', 'Slack', 'Todoist'],
        notes: 'No reply, ever, is also an answer. If a thread has gone dormant for 14+ days, drop it from the triage queue and move on.',
      },
      {
        id: 'founder_weekly_l10',
        title: 'Weekly Leadership L8',
        trigger: 'Same day and time each week (default Tuesday 9 AM, 90 minutes)',
        steps: [
          '5 min: Segue. One personal best and one professional best from the past week, each member',
          '5 min: Scorecard. Green / yellow / red on each weekly metric. Anything red drops into the Issues list',
          '5 min: Rock review. On track / off track per Rock owner; off track drops into Issues',
          '5 min: Customer and employee headlines. One-line wins or warnings only',
          '5 min: To-do review. Completed / not completed from last L8. Not completed becomes new accountability',
          '60 min: IDS. Identify, Discuss, Solve the top three Issues. Stop at solution and assigned owner',
          '5 min: Conclude. Recap to-dos, cascading messages, rate the meeting 1 to 10 with one-sentence why',
        ],
        outputs: [
          'Updated Scorecard with notes',
          'Updated Rocks with status and blockers',
          'New Issues solved or scheduled',
          'To-dos with single owners and seven-day default deadlines',
          'Cascading messages distributed to the relevant teams',
        ],
        tools: ['Scorecard sheet', 'Issues list', 'Rocks tracker'],
        notes: 'If the meeting routinely runs past 90 minutes, the team is bringing too few items pre-IDS or trying to solve in the wrong room. Cut the agenda before extending the meeting.',
      },
      {
        id: 'founder_monthly_stakeholder_update',
        title: 'Monthly stakeholder update',
        trigger: 'First Monday of each month',
        steps: [
          'Pull last month revenue, gross margin, cash on hand, runway in months',
          'Pull active customer count, new logos, churn, expansion',
          'Pull top three wins (deals, hires, ships) and top three risks (churn, hires-not-made, slipped Rocks)',
          'Write three short paragraphs: where we are, what we shipped, what is next',
          'Add one paragraph titled "Where I am stuck or wrong" naming a real ask',
          'Send to investors and board with the numbers snapshot attached',
        ],
        outputs: [
          'Stakeholder update email',
          'Numbers snapshot (one-page PDF)',
          'Calendar invites for any follow-up calls requested in replies',
        ],
        tools: ['QuickBooks or other accounting', 'CRM', 'Email'],
        notes: 'The "where I am stuck" paragraph is the load-bearing one. Updates without it train your stakeholders to skim. Updates with it train them to engage.',
      },
      {
        id: 'founder_qualified_discovery_call',
        title: 'Founder-led qualified discovery call',
        trigger: 'New booked discovery call from inbound or outbound, founder is on it',
        steps: [
          'Five minutes before the call: re-read the prospect profile, last touch, and their team page if on OTP',
          'Open with: "Tell me about your team and what you are actually trying to build"',
          'Listen for: team size, current toolstack, pain (specific incidents not generic complaints), budget signals',
          'Avoid pitching in the first twenty minutes',
          'Probe: "Walk me through the last time this broke"',
          'Qualify three things: buying authority, budget cycle, real deadline',
          'Close with: "Based on what you have told me, here is what I think would actually help" -- concrete not abstract',
          'Book the next step on the call before hanging up, or close the loop honestly',
        ],
        outputs: [
          'Qualification notes in the CRM',
          'Disposition: pursue, nurture, drop',
          'Next step booked or follow-up scheduled',
        ],
        tools: ['CRM', 'Calendly', 'Notes'],
        notes: 'If the prospect cannot describe a recent specific incident the product would have prevented, they are not in pain yet. Move them to nurture, not to a proposal.',
      },
      {
        id: 'founder_quarterly_review',
        title: 'Quarterly review and Rocks-setting',
        trigger: 'Last week of each quarter, before the new quarter starts',
        steps: [
          'Review last quarter Rocks: completed, partial, dropped. Be honest, not generous',
          'Review the Scorecard quarterly trend: which metrics improved, which slid, which were ignored',
          'Pull customer interview notes from the quarter',
          'Identify three to five themes from the interviews -- not the loudest, the most repeated',
          'Set three to five Rocks for next quarter, one per leadership team member',
          'Each Rock gets owner, definition of done, ninety-day plan with weekly checkpoints',
          'Update the accountability chart for any role changes coming next quarter',
          'Send a short Rocks-and-themes doc to the rest of the team before quarter starts',
        ],
        outputs: [
          'Quarterly report (one doc)',
          'New Rocks list with owners and definition of done',
          'Updated accountability chart if anything moved',
          'Team-wide Rocks announcement',
        ],
        tools: ['EOS toolkit', 'Customer interview notes', 'Scorecard'],
        notes: 'A Rock with a vague definition of done is a Rock that will be late and partially blamed on someone else. Spend the time on the DoD; the work plan is easier.',
      },
    ],
  },

  {
    role: 'Outbound Sales Lead',
    roleId: 'outbound_sales',
    description: 'Operating cadences for the person running outbound. Pipeline-first, evidence-led, no spray-and-pray.',
    templates: [
      {
        id: 'outbound_daily_prospecting',
        title: 'Daily prospecting block',
        trigger: 'Every weekday, 90-minute focused block, same time each morning',
        steps: [
          'Open the active ICP list. If there is no live list, you are not prospecting today, you are listing first',
          'Pull 20 net-new accounts that match the ICP filter exactly: industry, headcount, signals, geography',
          'For each, identify two named contacts (decision-maker + technical buyer) and verify the email via LeadMagic or equivalent',
          'Personalize the first line of each email: a specific signal, not a flattery line',
          'Send all 20 in one batch using the approved cold sequence',
          'Log every send in the CRM with disposition and signal source',
          'Skip anyone on the kill list (competitors, clients, prior bounces)',
        ],
        outputs: [
          '20 verified contacts touched',
          'CRM activity logged with signal source per contact',
          'Replies and bounces routed to the next-step queue',
        ],
        tools: ['CRM', 'LeadMagic', 'Email sender', 'Kill list'],
        notes: 'A 25 percent open rate with 2 percent reply on bad personalization beats a 50 percent open rate on generic templates because the replies come from the right people. Quality of the first line is the multiplier.',
      },
      {
        id: 'outbound_qualified_response',
        title: 'Qualified-response triage',
        trigger: 'Whenever a prospect replies positively to a cold sequence',
        steps: [
          'Within 30 minutes (or first business hour): reply with two booking slots, no more, no less',
          'Re-open the contact record and add: company stage, current toolstack, the signal that triggered outreach',
          'Send a one-sentence pre-call note: "Before we meet, here is the specific thing I think we can help with."',
          'If they ask for pricing before booking, send the range and book the call. Do not negotiate before discovery',
          'If they push to email-only, give them the deck and one specific offer; do not run a discovery in writing',
          'Log expected ACV and decision timeline before the call',
        ],
        outputs: [
          'Booked discovery call with prep notes',
          'Disposition + ACV estimate in CRM',
          'Pre-call summary delivered to the founder or AE if escalating',
        ],
        tools: ['CRM', 'Calendly', 'Email'],
        notes: 'The replies you do not move on within an hour become the replies you lose to a competitor who did. Speed beats polish on the response.',
      },
      {
        id: 'outbound_weekly_pipeline_review',
        title: 'Weekly pipeline review',
        trigger: 'Every Monday morning, 30 minutes, before any new outreach starts',
        steps: [
          'Pull every open opportunity into a single view, sorted by close-date and stage',
          'For each opp: ask "what is the next concrete action AND who owns it AND when is it due"',
          'Mark dead any opp where the answer to that question is no clear next step or the next step is two weeks out without a reason',
          'Move stalled opps (no activity in 14 days, despite warm signal) to nurture',
          'Flag opps where the buying-process language has changed (procurement, legal, security review) -- these need a different motion',
          'Identify the three opps most likely to close this week and the three most at risk',
          'Send a one-paragraph Monday update naming those six',
        ],
        outputs: [
          'Cleaned pipeline view',
          'Three-and-three update sent',
          'Dead opps closed-lost with reason coded for win/loss analysis',
        ],
        tools: ['CRM', 'Pipeline dashboard'],
        notes: 'The pipeline always lies in one direction: too generous on close-date and ACV. Be the one who keeps it honest.',
      },
      {
        id: 'outbound_handoff_to_close',
        title: 'Handoff to closing motion',
        trigger: 'Discovery call complete and prospect is qualified',
        steps: [
          'Within 24 hours: send a written summary of what they said is broken, what they want, and what success looks like',
          'Confirm the four boxes: budget exists, authority to sign is in the room, real need is documented, timeline is defined',
          'If any of the four is missing, do not advance to proposal -- run a second discovery instead',
          'Loop in the founder or AE only after the four are confirmed',
          'Schedule the proposal review meeting before the proposal is drafted',
          'Send the proposal 24 hours before the meeting so they read it cold',
        ],
        outputs: [
          'Written discovery summary',
          'Qualification scorecard filled in',
          'Proposal review meeting booked',
        ],
        tools: ['CRM', 'Proposal tool', 'Calendar'],
        notes: 'Sending a proposal without a scheduled review meeting is the polite way to lose the deal. The meeting forces the read.',
      },
      {
        id: 'outbound_win_loss_review',
        title: 'Monthly win/loss review',
        trigger: 'Last Friday of each month, 60 minutes',
        steps: [
          'Pull every won and every lost opp from the past 30 days',
          'For each, write one sentence on why we won or lost. Real reason, not the reason in the CRM',
          'Group losses into three buckets: timing, fit, execution',
          'For execution losses, identify the specific motion that failed (response speed, discovery depth, proposal format, follow-up cadence)',
          'For wins, identify the one thing that made it easy. Patterns across multiple wins become the template',
          'Update the cold sequence and the qualification scorecard from what you learned this month',
        ],
        outputs: [
          'Win/loss summary doc',
          'Updated cold sequence',
          'Updated qualification scorecard',
        ],
        tools: ['CRM', 'Notes', 'Sequence editor'],
        notes: 'Most teams skip win/loss because the conversations are uncomfortable. The teams that do it consistently are the ones whose pipeline gets sharper instead of louder.',
      },
    ],
  },

  {
    role: 'Customer Success Manager',
    roleId: 'customer_success',
    description: 'Cadences for the person who keeps existing customers using and expanding. Retention-first, expansion-always but never during a downturn.',
    templates: [
      {
        id: 'cs_account_health_review',
        title: 'Daily account-health scan',
        trigger: 'Every weekday morning, 20 minutes',
        steps: [
          'Open the account-health dashboard',
          'Filter to accounts with health score change > 10 points in the past 7 days, in either direction',
          'For each red-trending account: log the change, identify the proximate cause (usage drop, ticket spike, quiet period), pick one outreach action',
          'For each green-trending account: log the change, queue an expansion-readiness check for the next monthly review',
          'Update the watch list -- promote rising-risk accounts in, demote stable accounts out',
          'Slack-summary the watch list to the team channel by 10 AM',
        ],
        outputs: [
          'Updated watch list',
          'One outreach action per red-trending account',
          'Daily summary posted to the team channel',
        ],
        tools: ['Account health dashboard', 'CRM', 'Slack'],
        notes: 'The accounts that churn never give you a clear week of warning. They give you three weeks of small signals. The daily scan is what catches them while they are still fixable.',
      },
      {
        id: 'cs_quarterly_business_review',
        title: 'Quarterly business review (QBR)',
        trigger: 'Once per quarter per top-tier account, scheduled 30 days in advance',
        steps: [
          'Pull the customer\'s actual usage data, support tickets, NPS, and any recorded sentiment from the past 90 days',
          'Build the deck: 3 slides on outcomes delivered (concrete numbers, not opinions), 2 slides on what is at risk, 2 slides on what we are recommending next',
          'Pre-share the deck 24 hours in advance so the customer reads it cold',
          'On the call: spend 70 percent of the time on outcomes and risks, 30 percent on roadmap',
          'End every QBR with one explicit ask and one explicit commitment from each side',
          'Send a written recap within 4 hours: ask, commitment, next QBR date',
        ],
        outputs: [
          'QBR deck',
          'Written recap with ask + commitment',
          'Next QBR scheduled before the call ends',
        ],
        tools: ['Slides', 'Usage analytics', 'CRM'],
        notes: 'A QBR with no explicit ask is a status report. A QBR with no explicit commitment is a stall. Both are the patterns of churn six months out.',
      },
      {
        id: 'cs_expansion_readiness_check',
        title: 'Expansion readiness check',
        trigger: 'Account health green for 60+ days AND active usage above the expansion threshold',
        steps: [
          'Confirm three signals: usage growth > 20 percent quarter over quarter, low ticket volume, positive NPS in last survey',
          'If any of the three is missing, queue this account for re-check in 30 days, do not pitch expansion',
          'If all three present: identify the specific feature, seat, or add-on most aligned with their growth pattern',
          'Frame the expansion offer as a continuation of what is already working, not a separate sale',
          'Hand off to the AE with usage receipts and a recommended ACV uplift',
          'Tag the account as "expansion-active" in the CRM until the deal is open',
        ],
        outputs: [
          'Expansion brief with usage receipts',
          'Recommended add-on or seat plan',
          'AE handoff scheduled within 7 days',
        ],
        tools: ['Usage analytics', 'CRM'],
        notes: 'Expansion that lands cleanly is expansion the customer was already trying to figure out. Your job is to surface it, not to convince.',
      },
      {
        id: 'cs_silent_account_outreach',
        title: 'Silent-account outreach',
        trigger: 'No customer-initiated activity in 21+ days for any tier-1 or tier-2 account',
        steps: [
          'Confirm "silent" -- no logins, no replies, no support tickets',
          'Send a short, specific message: name a recent feature change you think they will care about, ask one question, no pitch',
          'If no response in 5 days: send the same message via a different channel (email -> Slack, or vice versa)',
          'If no response in 10 days: escalate to founder or exec sponsor for a brief check-in note',
          'If no response in 14 days: log as "silent risk" and add to the next QBR agenda whether they confirm or not',
          'Never assume silent equals fine. Silent equals a question you have not asked yet',
        ],
        outputs: [
          'Outreach logged in CRM with channel and timing',
          'Silent-risk flag if no response by day 14',
          'Founder check-in if exec escalation is triggered',
        ],
        tools: ['Email', 'Slack', 'CRM'],
        notes: 'The customers who stop using you politely are the ones most likely to churn. Loud unhappiness is a relationship; silence is an exit in progress.',
      },
      {
        id: 'cs_offboarding',
        title: 'Customer offboarding (when it happens)',
        trigger: 'Customer announces they are not renewing',
        steps: [
          'Acknowledge within 4 hours. No fight, no defense -- just confirm the timeline',
          'Schedule a 30-minute exit interview. Frame it as learning, not as save-attempt',
          'During the call: ask three things -- what worked, what did not, what would have changed your decision',
          'After the call: write down the answer to "what would have changed your decision" verbatim. That sentence belongs in the next product review',
          'Hand them a clean export of their data with no friction',
          'Keep the relationship warm. Last impressions become referrals 18 months later more often than you think',
        ],
        outputs: [
          'Exit interview notes',
          'One verbatim "would have changed our decision" insight',
          'Clean data export delivered',
        ],
        tools: ['CRM', 'Data export', 'Calendar'],
        notes: 'A clean offboarding produces more referrals than a clumsy retention. The customer who left you well will recommend you to the next person in their network. The customer you fought to keep will not.',
      },
    ],
  },

  {
    role: 'Marketing / Content Lead',
    roleId: 'marketing_content',
    description: 'Cadences for the person running content + distribution. Operator-first, no thought-leader posturing, evidence-led.',
    templates: [
      {
        id: 'marketing_weekly_content_planning',
        title: 'Weekly content planning',
        trigger: 'Every Monday, 60 minutes, before drafting any new content',
        steps: [
          'Pull last week\'s content performance: what got read, what got shared, what landed flat',
          'Identify the one specific thing that performed best -- not the most-read, the most-aligned-with-the-business-goal',
          'Pick three topics for the week: one operator story, one industry take, one product or build update',
          'Each topic gets a single sentence brief: who is this for, what action do we want them to take, what specific evidence will the post carry',
          'Assign each piece to a single owner with a Friday deadline',
          'Skip any topic where you cannot name the specific evidence yet -- evidence-less takes are how the brand drifts',
        ],
        outputs: [
          'Three briefed content pieces with owners and deadlines',
          'Last-week performance summary',
          'Brand calendar updated',
        ],
        tools: ['Analytics', 'Brand calendar', 'CMS'],
        notes: 'A piece of content without a specific operator-evidence anchor reads like an article anyone else could have written. Evidence is the thing that makes it ours.',
      },
      {
        id: 'marketing_distribution_check',
        title: 'Daily distribution check',
        trigger: 'Once a day, 15 minutes',
        steps: [
          'Open every channel where we are publishing: LinkedIn, X, Reddit, our blog, the newsletter list',
          'For each: confirm the scheduled post fired and is rendering correctly',
          'Pull engagement on the previous day\'s post -- comments, replies, DMs, shares',
          'Reply to every comment within 24 hours of posting; the second-best time is now',
          'Identify any signal that suggests the topic is hotter than expected -- promote that one across more channels',
          'If a post is flat (engagement < 50 percent of the channel\'s 30-day median), do not panic. One flat post is a sample size of one',
        ],
        outputs: [
          'All scheduled posts confirmed',
          'Comments replied to within 24 hours',
          'One-line note on which post outperformed expectations',
        ],
        tools: ['Channel-specific dashboards', 'Scheduler'],
        notes: 'Most content fails because nobody managed the comment thread for the first 24 hours. The post is the start of the conversation, not the conversation itself.',
      },
      {
        id: 'marketing_monthly_seo_check',
        title: 'Monthly SEO + GEO health check',
        trigger: 'First Tuesday of the month, 90 minutes',
        steps: [
          'Pull rankings for our top 25 target queries from Search Console',
          'Identify any query with a 5+ position drop in the past 30 days',
          'For each drop: open the page, the SERP, and the most-recent click-through. Diagnose: content stale, competitor improvement, intent shift, or technical issue',
          'Pull AI-search visibility (ChatGPT, Perplexity, Gemini) for the same 25 queries -- citations, mentions, full quotes',
          'Identify any query where we used to be cited and are not anymore. AI visibility decays faster than SEO',
          'Queue specific edits for the most impactful drops; assign each to an owner',
        ],
        outputs: [
          'SEO drop list with diagnoses',
          'GEO citation drop list',
          'Edit queue with owners',
        ],
        tools: ['Search Console', 'Rank tracker', 'AI search visibility tool'],
        notes: 'GEO is the one most teams are not measuring yet. The AI assistants will cite you for a quarter, then quietly stop. Catch the stop early.',
      },
      {
        id: 'marketing_brand_voice_audit',
        title: 'Quarterly brand-voice audit',
        trigger: 'Last week of each quarter',
        steps: [
          'Pull every piece of content published in the quarter, across all channels',
          'For each: ask "does this sound like us, or could it have been written by a generic AI"',
          'Flag every piece that fails. Do not fix them retroactively -- learn from them',
          'Look for patterns in the failures: where did we drift toward generic, where did we hold the voice',
          'Update the voice guide with one new specific rule that would have caught the drift earlier',
          'Re-share the updated voice guide with everyone who writes',
        ],
        outputs: [
          'Voice-drift list with specific examples',
          'One concrete new rule added to the voice guide',
          'Team distribution',
        ],
        tools: ['Content archive', 'Voice guide'],
        notes: 'Voice guides go stale because the failure modes evolve. Update the guide from real failures from your own team, not from theoretical best practices.',
      },
      {
        id: 'marketing_one_user_one_story',
        title: 'Monthly customer story',
        trigger: 'Once a month, end-of-month',
        steps: [
          'Pick one customer who got a real result in the past 30 days',
          'Schedule a 20-minute interview. Three questions: what was the problem before, what did you do with us, what is different now',
          'Quote them verbatim wherever possible. Operators quote operators',
          'Wrap their words in just enough context to make the quote land for someone who does not know them',
          'Get explicit approval before publishing. Yes-via-Slack is approval; tacit-no-objection is not',
          'Attribute by name and title unless they specifically ask for anonymity',
        ],
        outputs: [
          'One published customer story per month',
          'Approved quote with attribution',
          'Story added to the case-study library',
        ],
        tools: ['Calendar', 'Recorder', 'CMS'],
        notes: 'Twelve specific customer stories per year do more for trust than 100 generic posts. The specifics are what convert; the volume is what burns out.',
      },
    ],
  },
];

export function getTemplatesByRoleId(roleId: string): SOPTemplate[] {
  const group = SOP_TEMPLATE_GROUPS.find(g => g.roleId === roleId);
  return group ? group.templates : [];
}
