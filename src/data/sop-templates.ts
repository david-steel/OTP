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
        title: 'Weekly Leadership L10',
        trigger: 'Same day and time each week (default Tuesday 9 AM, 90 minutes)',
        steps: [
          '5 min: Segue. One personal best and one professional best from the past week, each member',
          '5 min: Scorecard. Green / yellow / red on each weekly metric. Anything red drops into the Issues list',
          '5 min: Rock review. On track / off track per Rock owner; off track drops into Issues',
          '5 min: Customer and employee headlines. One-line wins or warnings only',
          '5 min: To-do review. Completed / not completed from last L10. Not completed becomes new accountability',
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
];

export function getTemplatesByRoleId(roleId: string): SOPTemplate[] {
  const group = SOP_TEMPLATE_GROUPS.find(g => g.roleId === roleId);
  return group ? group.templates : [];
}
