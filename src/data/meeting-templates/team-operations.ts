import type { MeetingTemplate } from './_types.js';

export const TEAM_OPERATIONS_TEMPLATES: MeetingTemplate[] = [
  {
    slug: 'all-hands-meeting',
    title: 'All-Hands / Town Hall Meeting Template',
    shortName: 'All-Hands Meeting',
    description:
      'Free all hands meeting template and town hall agenda. Share company updates, celebrate wins, answer questions, and align the whole team in one room.',
    category: 'team-ops',
    methodology: 'General',
    minutes: 60,
    cadence: 'Monthly',
    participants: 'Entire company (everyone)',
    keywords: [
      'all hands meeting agenda',
      'all hands meeting template',
      'town hall meeting agenda',
      'company all hands template',
      'all hands meeting format',
      'town hall meeting template',
      'company update meeting',
      'team meeting agenda',
    ],
    steps: [
      {
        name: 'Welcome and intro',
        minutes: 5,
        text: 'Open the meeting, recognize new hires, and remind everyone of the agenda and norms.',
      },
      {
        name: 'Company performance and progress',
        minutes: 15,
        text: 'Walk through results against goals, key metrics, and progress on company priorities.',
      },
      {
        name: 'Wins and recognition',
        minutes: 10,
        text: 'Celebrate team and individual wins, customer stories, and milestones reached.',
      },
      {
        name: 'Strategic update',
        minutes: 10,
        text: 'Share what is changing, why it matters, and what the team should focus on next.',
      },
      {
        name: 'Open Q&A',
        minutes: 15,
        text: 'Take live and pre-submitted questions. Answer honestly or commit to follow up.',
      },
      {
        name: 'Close and next steps',
        minutes: 5,
        text: 'Recap key messages, name the single most important takeaway, and confirm the next all-hands date.',
      },
    ],
    bodyHtml: `<p>An all-hands meeting (also called a town hall) brings the entire company together to share progress, celebrate wins, and answer questions in the open. Run well, it builds trust and keeps everyone pointed at the same goals. This all-hands meeting template gives you a repeatable agenda that respects people's time and still leaves room for real conversation.</p>
<h2>When to use it</h2>
<p>Use this format on a regular cadence, usually monthly or quarterly, and for big moments such as a strategy shift, a major launch, or a leadership change. It is the right venue when the whole company needs the same context at the same time, told in the same voice.</p>
<h2>Who attends</h2>
<p>Everyone in the company attends. A few leaders present, but the meeting belongs to the whole team. Assign one facilitator to keep time and one person to capture questions that need follow-up.</p>
<h2>How to run it</h2>
<p>Open with a quick welcome and a clear agenda. Move into company performance against goals, then make space to celebrate wins so recognition is not an afterthought. Share the strategic update plainly, including what is changing and why. Reserve a real block for open Q&A, take questions you collected in advance, and close by naming the single most important takeaway people should carry out of the room.</p>
<h2>Facilitator tips</h2>
<ul>
<li><strong>Collect questions in advance</strong> so quiet team members get heard, not just the loudest voices.</li>
<li><strong>Lead with the metric that matters most</strong> and tie every update back to a shared goal.</li>
<li><strong>Record it</strong> for anyone in a different timezone or out that day.</li>
<li><strong>End on time</strong>. Respecting the clock is how you keep attendance high.</li>
</ul>
<h2>Common mistakes</h2>
<ul>
<li>Turning the meeting into a one-way slide deck with no time for questions.</li>
<li>Hiding bad news. Teams trust leaders who name hard truths early.</li>
<li>Skipping recognition, which makes the meeting feel like a status report.</li>
<li>Letting the agenda balloon until the meeting runs long and people tune out.</li>
</ul>
<p>Ready to run a tighter all-hands? <a href="/l8">Run it in OrgTP</a> and keep your agenda, wins, and follow-up questions in one place.</p>`,
    downloadMarkdown: `# All-Hands / Town Hall Meeting Template

**Purpose:** Bring the whole company together to share progress, celebrate wins, and answer questions in the open.

- **Duration:** 60 minutes
- **Cadence:** Monthly
- **Participants:** Entire company (everyone)

## Agenda
- [ ] Welcome and intro (5 min)
- [ ] Company performance and progress (15 min)
- [ ] Wins and recognition (10 min)
- [ ] Strategic update (10 min)
- [ ] Open Q&A (15 min)
- [ ] Close and next steps (5 min)

## Facilitator tips
- Collect questions in advance so quiet team members get heard.
- Lead with the metric that matters most and tie updates to a shared goal.
- Record it for anyone remote or out that day.
- End on time to keep attendance high.

## Notes / Action items
-
-
-

---
Free template from OrgTP. Adapt or run it live at orgtp.com/templates/all-hands-meeting`,
  },
  {
    slug: 'weekly-team-sync',
    title: 'Weekly Team Sync Template',
    shortName: 'Weekly Team Sync',
    description:
      'Free weekly team sync template and team meeting agenda. Align priorities, surface blockers, review progress, and set the week in 30 focused minutes.',
    category: 'team-ops',
    methodology: 'General',
    minutes: 30,
    cadence: 'Weekly',
    participants: 'Single team (3-10 people)',
    keywords: [
      'weekly team sync template',
      'team sync template',
      'weekly team meeting agenda',
      'team sync agenda',
      'weekly sync meeting',
      'team meeting template',
      'weekly check in meeting',
      'recurring team meeting agenda',
    ],
    steps: [
      {
        name: 'Quick check-in',
        minutes: 3,
        text: 'Each person shares a one-word or one-line read on how the week is going.',
      },
      {
        name: 'Priorities for the week',
        minutes: 7,
        text: 'Confirm the top priorities and make sure everyone knows what matters most.',
      },
      {
        name: 'Progress and updates',
        minutes: 10,
        text: 'Round-robin on what moved since last week, kept short and outcome-focused.',
      },
      {
        name: 'Blockers and help needed',
        minutes: 7,
        text: 'Surface anything stuck and assign an owner to unblock it after the meeting.',
      },
      {
        name: 'Action items and close',
        minutes: 3,
        text: 'Recap who owns what by when, and confirm the next sync.',
      },
    ],
    bodyHtml: `<p>A weekly team sync keeps a single team aligned without eating the whole calendar. It is a short, recurring meeting to confirm priorities, share progress, and clear blockers before they grow. This weekly team sync template gives you a tight agenda you can run in 30 minutes and actually look forward to.</p>
<h2>When to use it</h2>
<p>Use it every week for any team that works toward shared outcomes. It is the connective tissue between daily standups and bigger monthly reviews. If your team only meets when something breaks, this is the cadence that keeps small issues from becoming big ones.</p>
<h2>Who attends</h2>
<p>One team, usually three to ten people, plus the team lead who facilitates. Keep it to the people doing the work so the conversation stays specific and fast.</p>
<h2>How to run it</h2>
<p>Start with a fast check-in so everyone is present, then confirm the week's priorities so the team knows where to spend energy. Run a brief round of progress updates, keeping each one focused on outcomes rather than activity. Spend real time on blockers and assign an owner for each one. Close by recapping action items with names and dates so nothing falls through the cracks.</p>
<h2>Facilitator tips</h2>
<ul>
<li><strong>Protect the time box</strong>. A 30-minute sync that runs long teaches people to dread it.</li>
<li><strong>Park deep dives</strong>. If two people need to solve something, take it offline.</li>
<li><strong>Make blockers the priority</strong>, not status. Status can live in a doc.</li>
<li><strong>End with owners and dates</strong> every single time.</li>
</ul>
<h2>Common mistakes</h2>
<ul>
<li>Letting updates turn into long status reports nobody needs live.</li>
<li>Solving complex problems with the whole team watching instead of taking it offline.</li>
<li>Skipping the blockers section because the meeting ran out of time.</li>
<li>Never writing down action items, so the same issues resurface next week.</li>
</ul>
<p>Want your priorities and blockers tracked between syncs? <a href="/l8">Run it in OrgTP</a>.</p>`,
    downloadMarkdown: `# Weekly Team Sync Template

**Purpose:** Keep one team aligned on priorities, progress, and blockers in a tight weekly meeting.

- **Duration:** 30 minutes
- **Cadence:** Weekly
- **Participants:** Single team (3-10 people)

## Agenda
- [ ] Quick check-in (3 min)
- [ ] Priorities for the week (7 min)
- [ ] Progress and updates (10 min)
- [ ] Blockers and help needed (7 min)
- [ ] Action items and close (3 min)

## Facilitator tips
- Protect the time box. A sync that runs long teaches people to dread it.
- Park deep dives and take two-person problems offline.
- Make blockers the priority, not status.
- End with owners and dates every time.

## Notes / Action items
-
-
-

---
Free template from OrgTP. Adapt or run it live at orgtp.com/templates/weekly-team-sync`,
  },
  {
    slug: 'cross-functional-sync',
    title: 'Cross-Functional Sync Template',
    shortName: 'Cross-Functional Sync',
    description:
      'Free cross-functional sync template and meeting agenda. Align teams that depend on each other, resolve handoffs, and unblock shared work fast.',
    category: 'team-ops',
    methodology: 'General',
    minutes: 45,
    cadence: 'Biweekly',
    participants: 'Representatives from 2-5 teams',
    keywords: [
      'cross functional sync template',
      'cross functional meeting agenda',
      'cross team meeting template',
      'cross functional alignment meeting',
      'inter team sync agenda',
      'cross functional collaboration meeting',
      'team dependency meeting',
      'cross functional sync agenda',
    ],
    steps: [
      {
        name: 'Context and goal',
        minutes: 5,
        text: 'Restate the shared objective and why these teams are in the room together.',
      },
      {
        name: 'Updates by team',
        minutes: 12,
        text: 'Each team shares progress that affects the others, kept to dependencies only.',
      },
      {
        name: 'Dependencies and handoffs',
        minutes: 13,
        text: 'Map what each team needs from another, confirm timing, and name owners.',
      },
      {
        name: 'Risks and conflicts',
        minutes: 10,
        text: 'Surface competing priorities or timeline clashes and decide how to resolve them.',
      },
      {
        name: 'Decisions and action items',
        minutes: 5,
        text: 'Lock decisions, assign cross-team owners, and confirm the next checkpoint.',
      },
    ],
    bodyHtml: `<p>A cross-functional sync aligns teams that depend on each other but do not share a manager. Engineering, design, marketing, and operations all move faster when their handoffs are explicit. This cross-functional sync template gives you a focused agenda for surfacing dependencies, resolving conflicts, and keeping shared work on track.</p>
<h2>When to use it</h2>
<p>Use it when two or more teams contribute to the same outcome, such as a launch, a migration, or a quarterly initiative. It is most valuable when work keeps stalling at the seams between teams, where no single person owns the whole flow.</p>
<h2>Who attends</h2>
<p>One or two representatives from each contributing team, ideally the people who own the handoffs. Keep the group small enough to make decisions. A neutral facilitator helps when teams have competing priorities.</p>
<h2>How to run it</h2>
<p>Open by restating the shared goal so everyone remembers why they are together. Have each team share only the updates that affect the others. Spend the core of the meeting mapping dependencies and handoffs, naming who needs what by when. Surface risks and conflicting priorities openly, then close by locking decisions and assigning cross-team owners so action survives the meeting.</p>
<h2>Facilitator tips</h2>
<ul>
<li><strong>Keep updates dependency-focused</strong>. Internal team detail belongs in each team's own sync.</li>
<li><strong>Make handoffs explicit</strong> with an owner, a deliverable, and a date.</li>
<li><strong>Name conflicts out loud</strong> instead of letting them simmer between teams.</li>
<li><strong>Rotate facilitation</strong> so no single team owns the narrative.</li>
</ul>
<h2>Common mistakes</h2>
<ul>
<li>Letting each team give a full internal status update that others do not need.</li>
<li>Leaving handoffs vague, so each team assumes the other will move first.</li>
<li>Avoiding hard conversations about competing priorities until a deadline slips.</li>
<li>Ending without clear cross-team owners, so decisions evaporate.</li>
</ul>
<p>Keep your shared dependencies visible across teams. <a href="/l8">Run it in OrgTP</a>.</p>`,
    downloadMarkdown: `# Cross-Functional Sync Template

**Purpose:** Align teams that depend on each other, resolve handoffs, and unblock shared work.

- **Duration:** 45 minutes
- **Cadence:** Biweekly
- **Participants:** Representatives from 2-5 teams

## Agenda
- [ ] Context and goal (5 min)
- [ ] Updates by team (12 min)
- [ ] Dependencies and handoffs (13 min)
- [ ] Risks and conflicts (10 min)
- [ ] Decisions and action items (5 min)

## Facilitator tips
- Keep updates dependency-focused, not full internal status.
- Make handoffs explicit with an owner, a deliverable, and a date.
- Name conflicts out loud instead of letting them simmer.
- Rotate facilitation so no single team owns the narrative.

## Notes / Action items
-
-
-

---
Free template from OrgTP. Adapt or run it live at orgtp.com/templates/cross-functional-sync`,
  },
  {
    slug: 'status-update-meeting',
    title: 'Status Update Meeting Template',
    shortName: 'Status Update Meeting',
    description:
      'Free status update meeting template and agenda. Review progress, flag risks, and confirm next steps on a project or initiative without wasting time.',
    category: 'team-ops',
    methodology: 'General',
    minutes: 30,
    cadence: 'Weekly',
    participants: 'Project team and key stakeholders',
    keywords: [
      'status update meeting template',
      'status meeting agenda',
      'project status meeting template',
      'status update agenda',
      'progress update meeting',
      'project status update template',
      'weekly status meeting agenda',
      'status report meeting',
    ],
    steps: [
      {
        name: 'Objective recap',
        minutes: 3,
        text: 'Restate the goal and the timeline so progress is measured against something concrete.',
      },
      {
        name: 'Progress since last update',
        minutes: 10,
        text: 'Review what is done, in progress, and not started against the plan.',
      },
      {
        name: 'Risks and blockers',
        minutes: 8,
        text: 'Flag anything threatening scope, timeline, or budget and decide how to respond.',
      },
      {
        name: 'Decisions needed',
        minutes: 6,
        text: 'Raise any decisions the team or stakeholders must make to keep moving.',
      },
      {
        name: 'Next steps and owners',
        minutes: 3,
        text: 'Confirm action items, owners, and the date of the next update.',
      },
    ],
    bodyHtml: `<p>A status update meeting keeps a project or initiative honest. It is a focused checkpoint to compare progress against the plan, flag risks early, and make the decisions that keep work moving. This status update meeting template helps you run it in 30 minutes instead of letting it sprawl into a recurring time sink.</p>
<h2>When to use it</h2>
<p>Use it for any project with a deadline, a budget, or stakeholders who need visibility. It works for software releases, marketing campaigns, operational rollouts, and anything else where progress and risk need a regular pulse. Skip it when a written update would do the same job.</p>
<h2>Who attends</h2>
<p>The project team plus the stakeholders who need the information or must make decisions. Keep the room tight. People who only need to be informed can read the recap instead of attending live.</p>
<h2>How to run it</h2>
<p>Start by restating the objective and timeline so progress has a yardstick. Walk through what is done, in progress, and not started against the plan, keeping it factual. Spend real time on risks and blockers, deciding how to respond rather than just noting them. Raise any decisions that need stakeholder input, then close with clear next steps, owners, and the date of the next update.</p>
<h2>Facilitator tips</h2>
<ul>
<li><strong>Send the data in advance</strong> so the meeting is for decisions, not reading slides aloud.</li>
<li><strong>Use a simple red, yellow, green</strong> health signal so status is scannable.</li>
<li><strong>Focus on risk and decisions</strong>, the two things a live meeting is actually good for.</li>
<li><strong>Capture decisions</strong>, not just discussion, so they are not relitigated next week.</li>
</ul>
<h2>Common mistakes</h2>
<ul>
<li>Reading a status report out loud that everyone could have read faster on their own.</li>
<li>Glossing over risks to keep the update positive, then being surprised later.</li>
<li>Inviting people who only need to be informed, not consulted.</li>
<li>Ending without owners, so progress stalls until the next meeting.</li>
</ul>
<p>Track project status and risks in one place. <a href="/l8">Run it in OrgTP</a>.</p>`,
    downloadMarkdown: `# Status Update Meeting Template

**Purpose:** Review progress, flag risks, and confirm next steps on a project without wasting time.

- **Duration:** 30 minutes
- **Cadence:** Weekly
- **Participants:** Project team and key stakeholders

## Agenda
- [ ] Objective recap (3 min)
- [ ] Progress since last update (10 min)
- [ ] Risks and blockers (8 min)
- [ ] Decisions needed (6 min)
- [ ] Next steps and owners (3 min)

## Facilitator tips
- Send the data in advance so the meeting is for decisions.
- Use a simple red, yellow, green health signal.
- Focus on risk and decisions, not reading status aloud.
- Capture decisions so they are not relitigated next week.

## Notes / Action items
-
-
-

---
Free template from OrgTP. Adapt or run it live at orgtp.com/templates/status-update-meeting`,
  },
  {
    slug: 'decision-making-meeting',
    title: 'Decision-Making Meeting (DACI) Template',
    shortName: 'Decision-Making Meeting',
    description:
      'Free decision making meeting template using DACI. Assign Driver, Approver, Contributors, and Informed roles to make a clear call and move on.',
    category: 'team-ops',
    methodology: 'General',
    minutes: 45,
    cadence: 'As needed',
    participants: 'Decision Driver, Approver, and Contributors (3-8 people)',
    keywords: [
      'decision making meeting template',
      'DACI template',
      'DACI framework meeting',
      'decision meeting agenda',
      'decision making framework',
      'group decision meeting template',
      'decision meeting template',
      'DACI decision making',
    ],
    steps: [
      {
        name: 'Frame the decision',
        minutes: 5,
        text: 'State the decision to be made, the deadline, and what is in and out of scope.',
      },
      {
        name: 'Assign DACI roles',
        minutes: 5,
        text: 'Confirm the Driver, the single Approver, the Contributors, and who must be Informed.',
      },
      {
        name: 'Present options and context',
        minutes: 12,
        text: 'The Driver lays out the options, trade-offs, data, and a recommendation.',
      },
      {
        name: 'Contributor input',
        minutes: 13,
        text: 'Contributors weigh in with expertise and concerns. Discuss trade-offs openly.',
      },
      {
        name: 'Approver decides',
        minutes: 7,
        text: 'The Approver makes the call. Capture the decision and the reasoning.',
      },
      {
        name: 'Communicate and act',
        minutes: 3,
        text: 'Confirm how the Informed group will hear about it and assign follow-up owners.',
      },
    ],
    bodyHtml: `<p>A decision-making meeting exists to make one clear call, not to discuss forever. The DACI framework keeps it accountable by naming who does what: the <strong>Driver</strong> who runs the process, the <strong>Approver</strong> who makes the final call, the <strong>Contributors</strong> who provide input, and the <strong>Informed</strong> who hear the outcome. This decision making meeting template puts DACI to work so a group can decide and move on.</p>
<h2>When to use it</h2>
<p>Use it for decisions that are important enough to need input but cannot be made by consensus. It shines when a team keeps revisiting the same choice, when ownership of a call is unclear, or when stakeholders feel left out of decisions that affect them.</p>
<h2>Who attends</h2>
<p>The Driver, the single Approver, and the Contributors whose expertise the decision needs, usually three to eight people. The Informed do not attend; they receive the outcome afterward. One Approver is essential. Two approvers means no decision.</p>
<h2>How to run it</h2>
<p>Frame the decision and its deadline first, then confirm the DACI roles so everyone knows their job. The Driver presents the options, trade-offs, and a recommendation grounded in data. Contributors offer input and raise concerns, debating trade-offs in the open. The Approver then makes the call and the team captures both the decision and the reasoning. Finish by confirming how the Informed group will hear about it.</p>
<h2>Facilitator tips</h2>
<ul>
<li><strong>Name one Approver</strong>. Shared accountability for a decision usually means none.</li>
<li><strong>Separate input from the decision</strong> so Contributors advise but do not vote.</li>
<li><strong>Write down the reasoning</strong>, not just the choice, so it holds up later.</li>
<li><strong>Set a deadline</strong> and decide by it even with imperfect information.</li>
</ul>
<h2>Common mistakes</h2>
<ul>
<li>Treating a decision meeting as a consensus exercise where everyone must agree.</li>
<li>Leaving the Approver role ambiguous, so no one actually decides.</li>
<li>Skipping the recommendation, forcing the group to start from a blank page.</li>
<li>Forgetting to tell the Informed group, so the decision surprises them later.</li>
</ul>
<p>Make decisions stick and keep the reasoning on record. <a href="/l8">Run it in OrgTP</a>.</p>`,
    downloadMarkdown: `# Decision-Making Meeting (DACI) Template

**Purpose:** Make one clear decision using DACI roles, then communicate it and move on.

- **Duration:** 45 minutes
- **Cadence:** As needed
- **Participants:** Decision Driver, Approver, and Contributors (3-8 people)

**DACI roles:** Driver (runs the process), Approver (makes the final call), Contributors (provide input), Informed (hear the outcome).

## Agenda
- [ ] Frame the decision (5 min)
- [ ] Assign DACI roles: Driver, Approver, Contributors, Informed (5 min)
- [ ] Present options and context (12 min)
- [ ] Contributor input (13 min)
- [ ] Approver decides (7 min)
- [ ] Communicate and act (3 min)

## Facilitator tips
- Name one Approver. Shared accountability usually means none.
- Separate input from the decision. Contributors advise, they do not vote.
- Write down the reasoning, not just the choice.
- Set a deadline and decide by it even with imperfect information.

## Notes / Action items
-
-
-

---
Free template from OrgTP. Adapt or run it live at orgtp.com/templates/decision-making-meeting`,
  },
  {
    slug: 'brainstorming-session',
    title: 'Brainstorming Session Template',
    shortName: 'Brainstorming Session',
    description:
      'Free brainstorming session template and agenda. Generate ideas, build on each other, then converge on the best options without groupthink killing them.',
    category: 'team-ops',
    methodology: 'General',
    minutes: 60,
    cadence: 'As needed',
    participants: 'Cross-section of contributors (4-10 people)',
    keywords: [
      'brainstorming session template',
      'brainstorming meeting agenda',
      'brainstorm session template',
      'ideation session template',
      'brainstorming session agenda',
      'idea generation meeting',
      'group brainstorming template',
      'creative brainstorming session',
    ],
    steps: [
      {
        name: 'Frame the challenge',
        minutes: 8,
        text: 'State the problem as a clear question and confirm the constraints and goal.',
      },
      {
        name: 'Silent idea generation',
        minutes: 10,
        text: 'Everyone writes ideas independently first to avoid anchoring on the first voice.',
      },
      {
        name: 'Share and build',
        minutes: 17,
        text: 'Round-robin share ideas, building on each other with no criticism yet.',
      },
      {
        name: 'Cluster and discuss',
        minutes: 12,
        text: 'Group similar ideas, discuss the most promising, and explore trade-offs.',
      },
      {
        name: 'Converge and vote',
        minutes: 10,
        text: 'Dot-vote to shortlist the strongest ideas worth pursuing.',
      },
      {
        name: 'Next steps',
        minutes: 3,
        text: 'Assign owners to explore the top ideas and set a follow-up date.',
      },
    ],
    bodyHtml: `<p>A brainstorming session is for generating more and better ideas than any one person would alone, then narrowing to the strongest. The trick is keeping divergent thinking separate from judgment so good ideas are not killed before they breathe. This brainstorming session template structures both the generate and the converge phases so you leave with a real shortlist.</p>
<h2>When to use it</h2>
<p>Use it when you face an open problem with many possible answers: a new product direction, a campaign concept, a process redesign, or a name. It is the wrong tool for a decision that is already mostly made or for a problem with one correct answer.</p>
<h2>Who attends</h2>
<p>A diverse cross-section of four to ten people. Mix functions and seniority so you get range. A facilitator who does not contribute ideas keeps the energy up and the loudest voice from dominating.</p>
<h2>How to run it</h2>
<p>Frame the challenge as a single clear question and name the constraints. Start with silent, independent idea generation so people do not anchor on the first thing said. Then share round-robin and build on each other with no criticism allowed in this phase. Cluster similar ideas, discuss the most promising, and only then converge by dot-voting to a shortlist. Close by assigning owners to explore the top ideas further.</p>
<h2>Facilitator tips</h2>
<ul>
<li><strong>Separate divergence from convergence</strong>. Generate first, judge later, never both at once.</li>
<li><strong>Start silent</strong> so introverts and juniors contribute before the room anchors.</li>
<li><strong>Ban "yes, but"</strong> during generation. Use "yes, and" to build.</li>
<li><strong>End with owners</strong>, or the ideas die in the notes file.</li>
</ul>
<h2>Common mistakes</h2>
<ul>
<li>Critiquing ideas as they appear, which shuts down the flow fast.</li>
<li>Letting the highest-paid person speak first and anchor everyone else.</li>
<li>Generating a huge list and never converging on what to actually do.</li>
<li>Walking out with energy but no owners, so nothing happens next.</li>
</ul>
<p>Capture ideas and turn the shortlist into owned next steps. <a href="/l8">Run it in OrgTP</a>.</p>`,
    downloadMarkdown: `# Brainstorming Session Template

**Purpose:** Generate ideas, build on each other, then converge on the strongest options.

- **Duration:** 60 minutes
- **Cadence:** As needed
- **Participants:** Cross-section of contributors (4-10 people)

## Agenda
- [ ] Frame the challenge (8 min)
- [ ] Silent idea generation (10 min)
- [ ] Share and build (17 min)
- [ ] Cluster and discuss (12 min)
- [ ] Converge and vote (10 min)
- [ ] Next steps (3 min)

## Facilitator tips
- Separate divergence from convergence. Generate first, judge later.
- Start silent so introverts and juniors contribute before the room anchors.
- Ban "yes, but" during generation. Use "yes, and" to build.
- End with owners, or the ideas die in the notes file.

## Notes / Action items
-
-
-

---
Free template from OrgTP. Adapt or run it live at orgtp.com/templates/brainstorming-session`,
  },
  {
    slug: 'problem-solving-meeting',
    title: 'Problem-Solving Meeting (IDS) Template',
    shortName: 'Problem-Solving Meeting',
    description:
      'Free problem solving meeting template using IDS: Identify, Discuss, Solve. Get to the root issue and leave with a real solution, not just a vent session.',
    category: 'team-ops',
    methodology: 'General',
    minutes: 60,
    cadence: 'As needed',
    participants: 'People close to the problem (3-8 people)',
    keywords: [
      'problem solving meeting template',
      'IDS template',
      'identify discuss solve',
      'problem solving meeting agenda',
      'IDS meeting framework',
      'issue solving meeting template',
      'root cause meeting agenda',
      'problem solving session template',
    ],
    steps: [
      {
        name: 'List and prioritize issues',
        minutes: 8,
        text: 'Surface the issues on the table and rank them so you tackle the most important first.',
      },
      {
        name: 'Identify the real problem',
        minutes: 12,
        text: 'Dig past symptoms to the root cause. Define the problem before discussing solutions.',
      },
      {
        name: 'Discuss',
        minutes: 22,
        text: 'Share perspectives, data, and options. Stay on the issue and resist jumping to the fix.',
      },
      {
        name: 'Solve',
        minutes: 13,
        text: 'Agree on a solution, assign a single owner, and define what done looks like.',
      },
      {
        name: 'Confirm and close',
        minutes: 5,
        text: 'Restate the decision and owner, then move to the next prioritized issue or end.',
      },
    ],
    bodyHtml: `<p>A problem-solving meeting is where teams actually fix things instead of going in circles. The IDS method keeps it disciplined: <strong>Identify</strong> the root problem, <strong>Discuss</strong> it fully, then <strong>Solve</strong> it with a clear owner. This problem solving meeting template applies IDS so you leave with a decision and an action, not just a shared sense that something is wrong.</p>
<h2>When to use it</h2>
<p>Use it whenever a recurring issue, a broken process, or a conflict needs resolution. It is built for the moments when a team keeps complaining about the same thing without ever fixing it. If the problem is simple and obvious, just assign it; save IDS for the knots.</p>
<h2>Who attends</h2>
<p>The people closest to the problem, usually three to eight. You need the ones with context and the one who can commit to a fix. Keep stakeholders who only want to observe out of the room so the discussion stays candid.</p>
<h2>How to run it</h2>
<p>List the issues and prioritize so you start with what matters most. Spend real effort on Identify, digging past the symptom to the root cause, because solving the wrong problem wastes everyone's time. Then Discuss openly with data and perspective, resisting the urge to jump to a fix. Finally Solve: agree on an action, assign a single owner, and define what done looks like. Confirm the decision out loud before moving to the next issue.</p>
<h2>Facilitator tips</h2>
<ul>
<li><strong>Spend most energy on Identify</strong>. The wrong problem perfectly solved helps no one.</li>
<li><strong>Hold the line on Discuss</strong>. Do not let the team leap to solutions too early.</li>
<li><strong>Assign one owner per solve</strong>, never a committee.</li>
<li><strong>Solve fewer issues fully</strong> rather than touching many superficially.</li>
</ul>
<h2>Common mistakes</h2>
<ul>
<li>Jumping straight to solutions before the real problem is identified.</li>
<li>Treating symptoms instead of root causes, so the issue keeps coming back.</li>
<li>Discussing endlessly without ever committing to a solve and an owner.</li>
<li>Trying to fix every issue in one meeting and resolving none of them well.</li>
</ul>
<p>Track issues from identify to solved with clear owners. <a href="/l8">Run it in OrgTP</a>.</p>`,
    downloadMarkdown: `# Problem-Solving Meeting (IDS) Template

**Purpose:** Get to the root problem and leave with a real solution using Identify, Discuss, Solve.

- **Duration:** 60 minutes
- **Cadence:** As needed
- **Participants:** People close to the problem (3-8 people)

**IDS method:** Identify the root problem, Discuss it fully, Solve it with a clear owner.

## Agenda
- [ ] List and prioritize issues (8 min)
- [ ] Identify the real problem (12 min)
- [ ] Discuss (22 min)
- [ ] Solve (13 min)
- [ ] Confirm and close (5 min)

## Facilitator tips
- Spend most energy on Identify. The wrong problem solved helps no one.
- Hold the line on Discuss. Do not leap to solutions too early.
- Assign one owner per solve, never a committee.
- Solve fewer issues fully rather than touching many superficially.

## Notes / Action items
-
-
-

---
Free template from OrgTP. Adapt or run it live at orgtp.com/templates/problem-solving-meeting`,
  },
  {
    slug: 'async-standup-meeting',
    title: 'Async / Remote Standup Template',
    shortName: 'Async Standup',
    description:
      'Free async standup template and remote standup agenda. Replace the daily live meeting with a written update that keeps distributed teams aligned.',
    category: 'team-ops',
    methodology: 'General',
    minutes: 10,
    cadence: 'Daily',
    participants: 'Distributed or remote team (any size)',
    keywords: [
      'async standup template',
      'remote standup template',
      'async daily standup',
      'written standup template',
      'asynchronous standup agenda',
      'remote team standup',
      'distributed team standup',
      'async standup format',
    ],
    steps: [
      {
        name: 'What I shipped',
        minutes: 3,
        text: 'Each person posts what they completed since the last update, outcome-focused.',
      },
      {
        name: 'What I am working on',
        minutes: 3,
        text: 'Share today\'s focus so the team knows where everyone is pointed.',
      },
      {
        name: 'Blockers and help needed',
        minutes: 2,
        text: 'Call out anything stuck and tag the person who can unblock it.',
      },
      {
        name: 'Async follow-ups',
        minutes: 2,
        text: 'Teammates reply in thread to unblock, answer, or coordinate without a live call.',
      },
    ],
    bodyHtml: `<p>An async standup replaces the daily live huddle with a short written update each person posts on their own schedule. For distributed teams across timezones, it preserves alignment without forcing everyone into the same fifteen minutes. This async standup template gives you a clean format and the norms that make written updates actually get read.</p>
<h2>When to use it</h2>
<p>Use it for remote or distributed teams, especially across timezones, and for anyone who guards focus time. It is ideal when a live standup keeps getting scheduled at a bad hour for someone or when the meeting has quietly become a status performance rather than a coordination tool.</p>
<h2>Who attends</h2>
<p>There is no live meeting to attend. The whole team participates by posting a written update in a shared channel or tool, then replying in thread where coordination is needed. It scales to teams of any size better than a live standup does.</p>
<h2>How to run it</h2>
<p>Set a daily deadline by which everyone posts. Each update covers what shipped, what they are working on today, and any blockers, tagging whoever can help. The power is in the threaded follow-ups: teammates respond to unblock, answer, or coordinate without a call. A lead skims the channel once and steps in only where something is stuck.</p>
<h2>Facilitator tips</h2>
<ul>
<li><strong>Set a clear daily deadline</strong> so updates arrive in a predictable window.</li>
<li><strong>Keep the format short</strong> and consistent so it is fast to write and scan.</li>
<li><strong>Reward replies</strong>. The thread, not the post, is where coordination happens.</li>
<li><strong>Lead by reading</strong>. If leaders ignore the channel, the team will too.</li>
</ul>
<h2>Common mistakes</h2>
<ul>
<li>Writing a long activity log instead of a short, outcome-focused update.</li>
<li>Posting blockers with no tag, so nobody knows it is their job to help.</li>
<li>Letting updates pile up unread, which makes the whole ritual pointless.</li>
<li>Recreating a live meeting on top of the async one, doubling the overhead.</li>
</ul>
<p>Keep async updates and blockers organized for the whole team. <a href="/l8">Run it in OrgTP</a>.</p>`,
    downloadMarkdown: `# Async / Remote Standup Template

**Purpose:** Replace the daily live standup with a written update that keeps distributed teams aligned.

- **Duration:** 10 minutes (written, async)
- **Cadence:** Daily
- **Participants:** Distributed or remote team (any size)

## Agenda
- [ ] What I shipped (3 min)
- [ ] What I am working on (3 min)
- [ ] Blockers and help needed (2 min)
- [ ] Async follow-ups in thread (2 min)

## Facilitator tips
- Set a clear daily deadline so updates arrive in a predictable window.
- Keep the format short and consistent so it is fast to write and scan.
- Reward replies. The thread is where coordination happens.
- Lead by reading. If leaders ignore the channel, the team will too.

## Notes / Action items
-
-
-

---
Free template from OrgTP. Adapt or run it live at orgtp.com/templates/async-standup-meeting`,
  },
  {
    slug: 'operations-review-meeting',
    title: 'Operations Review Meeting Template',
    shortName: 'Operations Review',
    description:
      'Free operations review template and agenda. Review KPIs, processes, and exceptions on a regular cadence to keep the business running on track.',
    category: 'team-ops',
    methodology: 'General',
    minutes: 60,
    cadence: 'Monthly',
    participants: 'Operations leads and functional owners (5-12 people)',
    keywords: [
      'operations review agenda',
      'operations review template',
      'operations review meeting',
      'ops review meeting template',
      'business operations review',
      'operational review agenda',
      'monthly operations review',
      'operations meeting template',
    ],
    steps: [
      {
        name: 'KPI scorecard review',
        minutes: 15,
        text: 'Walk the operating metrics against targets and flag anything off track.',
      },
      {
        name: 'Process performance',
        minutes: 12,
        text: 'Review how core processes performed, including cycle time, quality, and throughput.',
      },
      {
        name: 'Exceptions and incidents',
        minutes: 13,
        text: 'Examine the outliers, incidents, and misses, and what caused them.',
      },
      {
        name: 'Improvement actions',
        minutes: 15,
        text: 'Decide what to change, assign owners, and set targets for the next period.',
      },
      {
        name: 'Close and follow-ups',
        minutes: 5,
        text: 'Confirm action items, owners, and dates, and review last period\'s commitments.',
      },
    ],
    bodyHtml: `<p>An operations review is the regular checkpoint where a team looks at how the business is actually running. It pairs hard numbers with the processes behind them so leaders can spot drift early and decide what to fix. This operations review template gives you an agenda that balances the scorecard with the why behind it, and ends in concrete improvement actions.</p>
<h2>When to use it</h2>
<p>Use it on a steady cadence, usually monthly, for any team that owns operating metrics: support, fulfillment, manufacturing, finance ops, or a whole business unit. It is the meeting that keeps performance from quietly sliding while everyone is busy with day-to-day work.</p>
<h2>Who attends</h2>
<p>Operations leads and the functional owners accountable for the metrics, usually five to twelve people. Each owner should be able to speak to their own numbers and own the actions that come out of the review.</p>
<h2>How to run it</h2>
<p>Open with the KPI scorecard against targets, flagging what is off track without dwelling on what is green. Move into process performance to understand the drivers behind the numbers, then examine exceptions and incidents to learn from the outliers. Spend the back half on improvement actions: decide what to change, assign owners, and set targets. Close by reviewing whether last period's commitments were actually delivered.</p>
<h2>Facilitator tips</h2>
<ul>
<li><strong>Anchor on targets</strong>, not raw numbers, so off-track items stand out.</li>
<li><strong>Spend time on red, skim green</strong>. Healthy metrics do not need debate.</li>
<li><strong>Tie every miss to an action</strong> with an owner and a date.</li>
<li><strong>Review last period's actions first</strong> so commitments mean something.</li>
</ul>
<h2>Common mistakes</h2>
<ul>
<li>Reviewing every metric equally instead of focusing on what is off track.</li>
<li>Explaining numbers without committing to any change.</li>
<li>Never checking whether previous improvement actions were delivered.</li>
<li>Letting the meeting become a blame session instead of a learning one.</li>
</ul>
<p>Keep your scorecard, exceptions, and improvement actions in one place. <a href="/l8">Run it in OrgTP</a>.</p>`,
    downloadMarkdown: `# Operations Review Meeting Template

**Purpose:** Review KPIs, processes, and exceptions on a regular cadence to keep the business on track.

- **Duration:** 60 minutes
- **Cadence:** Monthly
- **Participants:** Operations leads and functional owners (5-12 people)

## Agenda
- [ ] KPI scorecard review (15 min)
- [ ] Process performance (12 min)
- [ ] Exceptions and incidents (13 min)
- [ ] Improvement actions (15 min)
- [ ] Close and follow-ups (5 min)

## Facilitator tips
- Anchor on targets, not raw numbers, so off-track items stand out.
- Spend time on red, skim green.
- Tie every miss to an action with an owner and a date.
- Review last period's actions first so commitments mean something.

## Notes / Action items
-
-
-

---
Free template from OrgTP. Adapt or run it live at orgtp.com/templates/operations-review-meeting`,
  },
  {
    slug: 'leadership-offsite',
    title: 'Leadership Offsite Template',
    shortName: 'Leadership Offsite',
    description:
      'Free leadership offsite template and agenda. Step back from daily work to align on strategy, priorities, and team health over a full or multi-day session.',
    category: 'team-ops',
    methodology: 'General',
    minutes: 480,
    cadence: 'Quarterly',
    participants: 'Leadership team (4-12 people)',
    keywords: [
      'leadership offsite agenda',
      'leadership offsite template',
      'executive offsite agenda',
      'leadership retreat template',
      'strategy offsite agenda',
      'leadership offsite planning',
      'team offsite template',
      'executive retreat agenda',
    ],
    steps: [
      {
        name: 'Open and connect',
        minutes: 45,
        text: 'Set intentions for the day, reconnect as humans, and agree on norms.',
      },
      {
        name: 'Look back: review and learn',
        minutes: 75,
        text: 'Honestly assess the last period: what worked, what did not, and why.',
      },
      {
        name: 'State of the business',
        minutes: 90,
        text: 'Review the market, the numbers, customers, and the team to ground the day in reality.',
      },
      {
        name: 'Strategy and priorities',
        minutes: 120,
        text: 'Debate and align on the few priorities that matter most for the next period.',
      },
      {
        name: 'Team and culture health',
        minutes: 60,
        text: 'Discuss how the team is working together and address any tension directly.',
      },
      {
        name: 'Commitments and ownership',
        minutes: 60,
        text: 'Turn strategy into specific commitments with named owners and deadlines.',
      },
      {
        name: 'Close and accountability plan',
        minutes: 30,
        text: 'Agree how progress will be tracked and when the team will check in next.',
      },
    ],
    bodyHtml: `<p>A leadership offsite is the rare block of time when leaders step out of the daily grind to think about the business instead of just running it. Done well, it resets strategy, surfaces hard conversations, and rebuilds trust at the top. This leadership offsite template gives you a full-day structure that moves from reflection to strategy to real commitments.</p>
<h2>When to use it</h2>
<p>Use it quarterly or at major inflection points: a new fiscal year, a pivot, rapid growth, or after a rough stretch that needs a reset. It is worth the cost when the leadership team needs to align on direction, work through tension, or make decisions too big for a regular meeting.</p>
<h2>Who attends</h2>
<p>The leadership team, usually four to twelve people. Keep it to the people who own strategy and outcomes. An outside facilitator is often worth it so the most senior person can participate fully rather than run the room.</p>
<h2>How to run it</h2>
<p>Open by reconnecting as people and agreeing on norms, since trust unlocks honesty. Look back honestly at the last period before looking forward. Ground the day in the real state of the business: market, numbers, customers, team. Spend the largest block debating and aligning on the few priorities that matter most. Make space for team and culture health, then convert everything into specific commitments with owners. Close by agreeing how progress will be tracked so the offsite does not evaporate on Monday.</p>
<h2>Facilitator tips</h2>
<ul>
<li><strong>Use an outside facilitator</strong> so leaders participate instead of managing the room.</li>
<li><strong>Look back before looking forward</strong>. Honest reflection earns the right to set strategy.</li>
<li><strong>Protect the hard conversations</strong>. Avoided tension follows you home.</li>
<li><strong>End with owned commitments</strong> and a tracking plan, not just good feelings.</li>
</ul>
<h2>Common mistakes</h2>
<ul>
<li>Cramming so much content there is no room for real discussion.</li>
<li>Letting it become a status update marathon instead of a strategy session.</li>
<li>Avoiding the team-health conversation that everyone knows is needed.</li>
<li>Leaving with inspiration but no commitments, owners, or accountability plan.</li>
</ul>
<p>Turn offsite strategy into tracked priorities and commitments. <a href="/l8">Run it in OrgTP</a>.</p>`,
    downloadMarkdown: `# Leadership Offsite Template

**Purpose:** Step back from daily work to align on strategy, priorities, and team health.

- **Duration:** 480 minutes (full day)
- **Cadence:** Quarterly
- **Participants:** Leadership team (4-12 people)

## Agenda
- [ ] Open and connect (45 min)
- [ ] Look back: review and learn (75 min)
- [ ] State of the business (90 min)
- [ ] Strategy and priorities (120 min)
- [ ] Team and culture health (60 min)
- [ ] Commitments and ownership (60 min)
- [ ] Close and accountability plan (30 min)

## Facilitator tips
- Use an outside facilitator so leaders participate instead of managing the room.
- Look back before looking forward.
- Protect the hard conversations. Avoided tension follows you home.
- End with owned commitments and a tracking plan, not just good feelings.

## Notes / Action items
-
-
-

---
Free template from OrgTP. Adapt or run it live at orgtp.com/templates/leadership-offsite`,
  },
];
