import type { MeetingTemplate } from './_types.js';

export const AGILE_SCRUM_TEMPLATES: MeetingTemplate[] = [
  {
    slug: 'daily-standup-meeting',
    title: 'Daily Standup Template',
    shortName: 'Daily Standup',
    description:
      'A free daily standup template and agenda for the Daily Scrum. Run a focused 15-minute sync covering yesterday, today, and blockers to keep your sprint on track.',
    category: 'agile',
    methodology: 'Agile / Scrum',
    minutes: 15,
    cadence: 'Daily',
    participants: 'Development team, Scrum Master, optional Product Owner (3-9 people)',
    keywords: [
      'daily standup template',
      'daily scrum agenda',
      'daily standup agenda',
      'scrum standup template',
      'agile standup meeting',
      'three questions standup',
      'daily standup checklist',
      'agile ceremony templates',
    ],
    steps: [
      {
        name: 'Sync the board',
        minutes: 2,
        text: 'Open the sprint board so everyone is looking at the same work in progress before talking.',
      },
      {
        name: 'Yesterday',
        minutes: 4,
        text: 'Each person shares what they completed since the last standup that moves the sprint goal forward.',
      },
      {
        name: 'Today',
        minutes: 4,
        text: 'Each person states what they plan to finish today and which board item they will pull next.',
      },
      {
        name: 'Blockers',
        minutes: 3,
        text: 'Surface anything slowing progress. Name the blocker and the owner, do not solve it in the meeting.',
      },
      {
        name: 'Park and adjourn',
        minutes: 2,
        text: 'Schedule follow-up huddles for deep dives, confirm the day plan, and close on time.',
      },
    ],
    bodyHtml: `<p>The <strong>daily standup template</strong> gives your team a tight, repeatable script for the Daily Scrum. The goal is not status reporting to a manager. It is a fast planning sync where the people doing the work re-plan the next day together and surface anything in their way.</p>
<h2>When to use it</h2>
<p>Run this every working day at the same time and place during an active sprint. Fifteen minutes is the hard ceiling. If the conversation needs more time, that is a signal to park the topic and take it offline with only the people involved.</p>
<h2>Who attends</h2>
<p>The development team owns the standup. The Scrum Master facilitates and protects the timebox. The Product Owner can attend to listen but should not turn the meeting into a review. Keep the group to the team actually doing the sprint work.</p>
<h2>How to run it</h2>
<p>Start by looking at the board so the conversation is anchored to real work, not memory. Then move person by person or item by item through what was finished, what is planned today, and what is blocked. Keep answers short and focused on the sprint goal. The moment a discussion goes deep, the facilitator parks it for a follow-up huddle right after.</p>
<h2>Facilitator tips</h2>
<ul>
<li><strong>Stand up or stay on camera</strong> to keep energy high and the meeting short.</li>
<li><strong>Walk the board, not the people</strong> once your team matures, so the work drives the talk.</li>
<li><strong>Capture blockers in writing</strong> with a clear owner before anyone leaves.</li>
<li><strong>End on time, every time</strong> to build trust in the timebox.</li>
</ul>
<h2>Common mistakes</h2>
<ul>
<li>Turning the standup into a manager status update instead of a team re-plan.</li>
<li>Solving problems live and blowing past fifteen minutes.</li>
<li>Letting the same person dominate while quieter teammates stay silent.</li>
<li>Skipping the board so updates drift into vague generalities.</li>
</ul>
<p>Ready to make your standups effortless? <a href="/l8">Run it in OrgTP</a> to keep the agenda, blockers, and follow-ups in one shared place.</p>`,
    downloadMarkdown: `# Daily Standup Template

A fast, focused Daily Scrum to re-plan the day and surface blockers. The goal is team coordination, not a status report.

- **Duration:** 15 minutes
- **Cadence:** Daily
- **Participants:** Development team, Scrum Master, optional Product Owner

## Agenda
- [ ] Sync the board (2 min) - open the sprint board so everyone sees the same work
- [ ] Yesterday (4 min) - what each person completed toward the sprint goal
- [ ] Today (4 min) - what each person will finish and pull next
- [ ] Blockers (3 min) - name each blocker and its owner, do not solve live
- [ ] Park and adjourn (2 min) - schedule follow-up huddles, confirm the plan, close

## Facilitator tips
- Keep it to 15 minutes, no exceptions.
- Walk the board, not the people, as the team matures.
- Write down every blocker with an owner.
- Park deep dives for a follow-up huddle.

## Notes
- Blockers raised:
- Owners assigned:
- Follow-up huddles:

---
Free template from OrgTP. Adapt or run it live at orgtp.com/templates/daily-standup-meeting`,
  },
  {
    slug: 'sprint-planning-meeting',
    title: 'Sprint Planning Template',
    shortName: 'Sprint Planning',
    description:
      'A free sprint planning template and agenda. Set the sprint goal, confirm team capacity, select backlog items, and break work into tasks the team can commit to.',
    category: 'agile',
    methodology: 'Agile / Scrum',
    minutes: 120,
    cadence: 'Every sprint (1-4 weeks)',
    participants: 'Product Owner, Scrum Master, development team (3-9 people)',
    keywords: [
      'sprint planning template',
      'sprint planning agenda',
      'scrum sprint planning',
      'sprint goal template',
      'sprint backlog planning',
      'agile sprint planning checklist',
      'capacity planning scrum',
      'agile ceremony templates',
    ],
    steps: [
      {
        name: 'Confirm capacity',
        minutes: 15,
        text: 'Review team availability, holidays, and time off to set a realistic capacity for the sprint.',
      },
      {
        name: 'Set the sprint goal',
        minutes: 20,
        text: 'The Product Owner proposes a single, clear sprint goal the team can rally behind.',
      },
      {
        name: 'Review the top backlog',
        minutes: 25,
        text: 'Walk the highest-priority refined backlog items, confirm acceptance criteria, and resolve open questions.',
      },
      {
        name: 'Select backlog items',
        minutes: 25,
        text: 'The team pulls items that fit capacity and serve the sprint goal, forming the sprint backlog.',
      },
      {
        name: 'Break work into tasks',
        minutes: 25,
        text: 'Decompose selected items into tasks or subtasks and surface dependencies and risks.',
      },
      {
        name: 'Confirm the commitment',
        minutes: 10,
        text: 'Restate the sprint goal and backlog, confirm the team forecast, and agree it is achievable.',
      },
    ],
    bodyHtml: `<p>The <strong>sprint planning template</strong> turns a backlog into a focused plan the team can commit to. A good plan answers two questions: what can we deliver this sprint, and how will we get the work done. This agenda walks both halves in order so the team leaves with a clear sprint goal and a realistic forecast.</p>
<h2>When to use it</h2>
<p>Run sprint planning at the start of every sprint, before any new work begins. Budget roughly two hours for a two-week sprint and scale up or down with sprint length. Going in, the backlog should already be refined so planning is selection, not discovery.</p>
<h2>Who attends</h2>
<p>The Product Owner brings priorities and the proposed goal. The Scrum Master facilitates and guards the timebox. The development team forecasts the work and owns the commitment. Everyone who will do the work should be in the room.</p>
<h2>How to run it</h2>
<p>Start with capacity so the plan is grounded in real availability. Next, lock a single sprint goal that gives the work meaning. Walk the top of the refined backlog, confirm acceptance criteria, and clear open questions. Then let the team pull items that fit capacity and serve the goal. Decompose those items into tasks, surface dependencies, and close by restating the goal and confirming the team believes the forecast is achievable.</p>
<h2>Facilitator tips</h2>
<ul>
<li><strong>Protect one sprint goal</strong> so the sprint has a clear theme, not a grab bag.</li>
<li><strong>Let the team pull work</strong> rather than having a manager assign it.</li>
<li><strong>Use real capacity</strong> that accounts for time off, meetings, and support load.</li>
<li><strong>Refine before you plan</strong> so this session is fast and decisive.</li>
</ul>
<h2>Common mistakes</h2>
<ul>
<li>Overcommitting because capacity ignored meetings, support, and time off.</li>
<li>Planning unrefined items so the meeting turns into discovery and runs long.</li>
<li>Skipping the sprint goal and ending with a disconnected list of tasks.</li>
<li>Letting the Product Owner dictate the forecast instead of the team.</li>
</ul>
<p>Want planning that sticks? <a href="/l8">Run it in OrgTP</a> to keep the sprint goal, backlog, and commitment visible to the whole team.</p>`,
    downloadMarkdown: `# Sprint Planning Template

Turn a refined backlog into a committed sprint plan. Set the goal, confirm capacity, select items, and break work into tasks.

- **Duration:** 120 minutes (scale to sprint length)
- **Cadence:** Every sprint (1-4 weeks)
- **Participants:** Product Owner, Scrum Master, development team

## Agenda
- [ ] Confirm capacity (15 min) - availability, time off, realistic capacity
- [ ] Set the sprint goal (20 min) - one clear goal the team can rally behind
- [ ] Review the top backlog (25 min) - confirm acceptance criteria, clear questions
- [ ] Select backlog items (25 min) - pull items that fit capacity and the goal
- [ ] Break work into tasks (25 min) - decompose, surface dependencies and risks
- [ ] Confirm the commitment (10 min) - restate goal, confirm forecast is achievable

## Facilitator tips
- Protect a single sprint goal.
- Let the team pull work, do not assign it.
- Use real capacity that accounts for meetings and support.
- Refine the backlog before planning so selection is fast.

## Notes
- Sprint goal:
- Capacity for the sprint:
- Selected backlog items:
- Open risks and dependencies:

---
Free template from OrgTP. Adapt or run it live at orgtp.com/templates/sprint-planning-meeting`,
  },
  {
    slug: 'sprint-review-meeting',
    title: 'Sprint Review Template',
    shortName: 'Sprint Review',
    description:
      'A free sprint review template and demo agenda. Show the increment to stakeholders, gather feedback, review the goal, and adapt the backlog for the next sprint.',
    category: 'agile',
    methodology: 'Agile / Scrum',
    minutes: 60,
    cadence: 'End of every sprint',
    participants: 'Scrum team plus stakeholders and customers (open invite)',
    keywords: [
      'sprint review template',
      'sprint review agenda',
      'sprint demo template',
      'sprint review checklist',
      'scrum demo agenda',
      'increment review meeting',
      'stakeholder demo template',
      'agile ceremony templates',
    ],
    steps: [
      {
        name: 'Frame the sprint goal',
        minutes: 5,
        text: 'Restate the sprint goal and what the team set out to deliver so the demo has context.',
      },
      {
        name: 'Demo the increment',
        minutes: 25,
        text: 'Walk through completed, done work live. Show working software, not slides or screenshots.',
      },
      {
        name: 'Review done vs not done',
        minutes: 10,
        text: 'Be honest about what met the definition of done and what carried over, and why.',
      },
      {
        name: 'Gather feedback',
        minutes: 15,
        text: 'Invite stakeholders to react, ask questions, and surface new needs or changing priorities.',
      },
      {
        name: 'Adapt the backlog',
        minutes: 5,
        text: 'Capture feedback as backlog candidates and note shifts in direction for refinement.',
      },
    ],
    bodyHtml: `<p>The <strong>sprint review template</strong> is your structure for showing real, finished work to the people who care about it and adapting the plan based on what you learn. The review is a working session, not a one-way presentation. Stakeholder feedback is the whole point.</p>
<h2>When to use it</h2>
<p>Run the sprint review at the end of every sprint, before the retrospective. Keep it informal and demo-driven. About an hour works for a two-week sprint. Show working software live rather than walking a deck of screenshots.</p>
<h2>Who attends</h2>
<p>The full Scrum team attends, and the Product Owner invites stakeholders, customers, and anyone whose input shapes the product. A wide audience makes the feedback richer and keeps everyone aligned on direction.</p>
<h2>How to run it</h2>
<p>Open by restating the sprint goal so the demo has context. Then show the increment live, focusing on work that genuinely meets the definition of done. Be candid about what carried over and why. Open the floor for reactions, questions, and new needs, treating that conversation as the most valuable part of the meeting. Close by capturing feedback as backlog candidates and noting any shift in priorities for the next refinement.</p>
<h2>Facilitator tips</h2>
<ul>
<li><strong>Demo working software</strong> rather than slides about working software.</li>
<li><strong>Only show done work</strong> so the increment reflects real, releasable value.</li>
<li><strong>Make space for honest feedback</strong>, including the uncomfortable kind.</li>
<li><strong>Capture inputs live</strong> as backlog items so nothing gets lost.</li>
</ul>
<h2>Common mistakes</h2>
<ul>
<li>Treating the review as a status report instead of a feedback session.</li>
<li>Demoing half-finished work that does not meet the definition of done.</li>
<li>Inviting no real stakeholders, so the feedback loop is empty.</li>
<li>Skipping capture, so good feedback never reaches the backlog.</li>
</ul>
<p>Want demos that drive decisions? <a href="/l8">Run it in OrgTP</a> to capture stakeholder feedback straight into your backlog.</p>`,
    downloadMarkdown: `# Sprint Review Template

Show the increment to stakeholders, gather feedback, and adapt the backlog. A working session, not a presentation.

- **Duration:** 60 minutes (scale to sprint length)
- **Cadence:** End of every sprint
- **Participants:** Scrum team plus stakeholders and customers

## Agenda
- [ ] Frame the sprint goal (5 min) - restate what the team set out to deliver
- [ ] Demo the increment (25 min) - show working software live, not slides
- [ ] Review done vs not done (10 min) - be honest about carryover and why
- [ ] Gather feedback (15 min) - invite reactions, questions, and new needs
- [ ] Adapt the backlog (5 min) - capture feedback and shifts in direction

## Facilitator tips
- Demo working software, not slides.
- Only show work that meets the definition of done.
- Make space for honest, even uncomfortable feedback.
- Capture inputs live as backlog candidates.

## Notes
- Sprint goal reviewed:
- Items demoed:
- Stakeholder feedback:
- New backlog candidates:

---
Free template from OrgTP. Adapt or run it live at orgtp.com/templates/sprint-review-meeting`,
    guideHtml: `<h2>The Ultimate Sprint Review Template &amp; Meeting Agenda Guide</h2>
<p>A successful Sprint Review is more than just a demo - it is a collaborative session where the Scrum Team and stakeholders align on what was built, gather feedback, and adapt the product backlog for the upcoming sprint.</p>
<p>If your Sprint Reviews feel like a dry, one-way presentation or a stressful "sign-off" meeting, your team is missing out on the core value of agile feedback loops.</p>
<p>This comprehensive guide provides a battle-tested <strong>Sprint Review Template</strong> and a step-by-step <strong>Sprint Review Meeting Agenda</strong> to help your team showcase their hard work, build trust with stakeholders, and drive continuous product improvement.</p>

<h2>What is a Sprint Review?</h2>
<p>The Sprint Review is an informal meeting held at the end of each sprint. It is one of the four formal events in the Scrum framework. The primary objective is to inspect the increment of work completed during the sprint and adapt the Product Backlog if necessary.</p>
<h3>Sprint Review vs. Sprint Retrospective: What&rsquo;s the Difference?</h3>
<p>It is common to confuse these two end-of-sprint events, but they serve entirely different purposes:</p>
<ul>
<li><strong>Sprint Review:</strong> Focuses on <strong>WHAT</strong> the team built. It is a product-focused meeting where stakeholders are present to review the product increment and provide feedback.</li>
<li><strong>Sprint Retrospective:</strong> Focuses on <strong>HOW</strong> the team built it. It is an internal team meeting focused on process improvement, collaboration, and tools.</li>
</ul>

<h2>The Standard 1-Hour Sprint Review Meeting Agenda</h2>
<p>To keep your team focused and respect your stakeholders' time, we recommend a strict <strong>time-boxed 60-minute agenda</strong>. Below is the exact agenda structure included in our downloadable template:</p>
<table class="td-guide-table">
<thead><tr><th>Time</th><th>Agenda Item</th><th>Owner</th><th>Objective</th></tr></thead>
<tbody>
<tr><td><strong>00:00 - 00:05</strong></td><td><strong>Welcome &amp; Context Setting</strong></td><td>Product Owner</td><td>Welcome stakeholders, state the Sprint Goal, and outline which product backlog items were "Done" and which were "Not Done."</td></tr>
<tr><td><strong>00:05 - 00:15</strong></td><td><strong>The Product Demo (The Increment)</strong></td><td>Developers / Team</td><td>Demonstrate the working software or completed deliverables. Focus on value and user experience, not just lines of code.</td></tr>
<tr><td><strong>00:15 - 00:35</strong></td><td><strong>Stakeholder Feedback &amp; Discussion</strong></td><td>Facilitator / PO</td><td>Open the floor for questions, gather feedback on the demoed features, and discuss real-world usability.</td></tr>
<tr><td><strong>00:35 - 00:50</strong></td><td><strong>Market &amp; Backlog Review</strong></td><td>Product Owner</td><td>Review the current state of the Product Backlog, discuss release dates, and analyze any market or budget changes.</td></tr>
<tr><td><strong>00:50 - 01:00</strong></td><td><strong>Next Steps &amp; Wrap-Up</strong></td><td>Scrum Master</td><td>Summarize key feedback, outline tentative goals for the next sprint, and officially close the meeting.</td></tr>
</tbody>
</table>

<h2>Key Roles in a Sprint Review</h2>
<p>For a Sprint Review to run smoothly, every participant must understand their role:</p>
<ul>
<li><strong>The Product Owner (PO):</strong> Explains what backlog items have been completed (and which haven't), manages stakeholder expectations, and leads the discussion on how the feedback impacts the future product roadmap.</li>
<li><strong>The Scrum Team (Developers):</strong> Demonstrates the working increment, explains what went well during the sprint, discusses any technical obstacles they overcame, and answers technical questions.</li>
<li><strong>The Scrum Master:</strong> Facilitates the meeting, ensures the event remains time-boxed, and helps the team maintain an informal, collaborative atmosphere.</li>
<li><strong>Stakeholders:</strong> Provide honest, constructive feedback on the product increment, share market insights, and align on upcoming priorities.</li>
</ul>

<h2>Best Practices for an Effective Sprint Review</h2>
<p>To move your Sprint Reviews from "boring status updates" to "high-value collaboration sessions," implement these three best practices:</p>
<h3>1. Focus on Value, Not Just Features</h3>
<p>Don't just list the technical tasks your team completed. Instead, explain <strong>why</strong> those tasks matter to the user. Frame your demo around user stories: <em>"We built this feature so that our customers can complete their checkout process in under 30 seconds."</em></p>
<h3>2. Keep It Informal</h3>
<p>The Sprint Review is not a formal presentation or a high-stakes slide deck review. It should be an informal, hands-on session. Encourage stakeholders to interact with the working software themselves during the meeting if possible.</p>
<h3>3. Embrace "Negative" Feedback</h3>
<p>If stakeholders point out flaws or suggest changes, view it as a win. Finding out that a feature doesn't meet user needs during a Sprint Review is infinitely better than finding out after it has been deployed to production. Capture this feedback and use it to refine your Product Backlog.</p>

<h2>Frequently Asked Questions (FAQs)</h2>
<h3>Who should attend the Sprint Review?</h3>
<p>The Sprint Review should be attended by the Product Owner, the Scrum Master, the Developers, and key stakeholders (such as customers, business sponsors, sales teams, or internal users).</p>
<h3>What happens to unfinished work at the end of a sprint?</h3>
<p>Any product backlog items that do not meet the team's "Definition of Done" are not demonstrated during the Sprint Review. They are moved back to the Product Backlog, where the Product Owner re-prioritizes them for future sprints.</p>
<h3>How long should a Sprint Review be?</h3>
<p>As a general rule of thumb, the Sprint Review should be time-boxed to a maximum of <strong>1 hour for every week of sprint duration</strong> (e.g., a 2-hour review for a 2-week sprint).</p>
<h3>Can we run a Sprint Review without a working demo?</h3>
<p>While a working software demo is the ideal way to show progress, some sprints may focus on research, architecture, or design. In these cases, the team should present their findings, wireframes, or architectural decisions to gather stakeholder feedback.</p>`,
    // FAQPage JSON-LD source. Keep verbatim with the visible FAQ in guideHtml above.
    faq: [
      {
        q: 'Who should attend the Sprint Review?',
        a: 'The Sprint Review should be attended by the Product Owner, the Scrum Master, the Developers, and key stakeholders (such as customers, business sponsors, sales teams, or internal users).',
      },
      {
        q: 'What happens to unfinished work at the end of a sprint?',
        a: 'Any product backlog items that do not meet the team\'s "Definition of Done" are not demonstrated during the Sprint Review. They are moved back to the Product Backlog, where the Product Owner re-prioritizes them for future sprints.',
      },
      {
        q: 'How long should a Sprint Review be?',
        a: 'As a general rule of thumb, the Sprint Review should be time-boxed to a maximum of 1 hour for every week of sprint duration (e.g., a 2-hour review for a 2-week sprint).',
      },
      {
        q: 'Can we run a Sprint Review without a working demo?',
        a: 'While a working software demo is the ideal way to show progress, some sprints may focus on research, architecture, or design. In these cases, the team should present their findings, wireframes, or architectural decisions to gather stakeholder feedback.',
      },
    ],
  },
  {
    slug: 'sprint-retrospective-meeting',
    title: 'Sprint Retrospective Template',
    shortName: 'Sprint Retrospective',
    description:
      'A free sprint retrospective template and agenda. Reflect on what went well, what to improve, and commit to one or two concrete actions for the next sprint.',
    category: 'agile',
    methodology: 'Agile / Scrum',
    minutes: 75,
    cadence: 'End of every sprint',
    participants: 'Scrum team only: development team and Scrum Master (3-9 people)',
    keywords: [
      'sprint retrospective template',
      'scrum retrospective template',
      'sprint retro agenda',
      'agile retrospective template',
      'retrospective checklist',
      'start stop continue retro',
      'team improvement meeting',
      'agile ceremony templates',
    ],
    steps: [
      {
        name: 'Set the stage',
        minutes: 10,
        text: 'Open with a quick check-in and restate the prime directive so the room feels safe to be candid.',
      },
      {
        name: 'Gather data',
        minutes: 20,
        text: 'Collect what happened this sprint: what went well, what was hard, and notable events.',
      },
      {
        name: 'Generate insights',
        minutes: 20,
        text: 'Group themes and dig into root causes behind the patterns, not just the symptoms.',
      },
      {
        name: 'Decide actions',
        minutes: 15,
        text: 'Commit to one or two specific, owned improvements the team will try next sprint.',
      },
      {
        name: 'Close the retro',
        minutes: 10,
        text: 'Confirm action owners, review the prior sprint actions, and capture a quick pulse on the session.',
      },
    ],
    bodyHtml: `<p>The <strong>sprint retrospective template</strong> gives your team a safe, structured hour to inspect how it works and commit to getting better. The retrospective is where continuous improvement actually happens, so the output is not a list of complaints. It is one or two concrete actions the team owns.</p>
<h2>When to use it</h2>
<p>Run the retrospective at the end of every sprint, after the review and before the next planning. Roughly 75 minutes fits a two-week sprint. Keep it consistent so the team builds the habit of reflecting and adjusting every cycle.</p>
<h2>Who attends</h2>
<p>This one is for the Scrum team only: the development team and the Scrum Master. Keeping outsiders and managers out is what makes candor possible. The Product Owner attends only if the team explicitly invites them.</p>
<h2>How to run it</h2>
<p>Set the stage with a light check-in and a reminder that everyone did their best with what they knew. Gather data on what went well and what was hard. Move from data to insight by grouping themes and asking why the patterns happened. Then narrow to one or two improvements the team will actually try, each with an owner. Close by confirming those owners and reviewing whether last sprint's actions stuck.</p>
<h2>Facilitator tips</h2>
<ul>
<li><strong>Vary the format</strong> across sprints so the retro never goes stale.</li>
<li><strong>Limit actions to one or two</strong> so they actually get done.</li>
<li><strong>Review prior actions first</strong> to keep accountability real.</li>
<li><strong>Protect psychological safety</strong> so people raise hard truths.</li>
</ul>
<h2>Common mistakes</h2>
<ul>
<li>Generating a long action list that no one ever completes.</li>
<li>Letting it become a blame session instead of a learning session.</li>
<li>Skipping the retro when the sprint was busy, breaking the improvement loop.</li>
<li>Never revisiting past actions, so the same issues recur.</li>
</ul>
<p>Want improvements that stick? <a href="/l8">Run it in OrgTP</a> to track retro actions across sprints and close the loop.</p>`,
    downloadMarkdown: `# Sprint Retrospective Template

Inspect how the team works and commit to one or two concrete improvements. Continuous improvement, not a complaint list.

- **Duration:** 75 minutes (scale to sprint length)
- **Cadence:** End of every sprint
- **Participants:** Scrum team only (development team and Scrum Master)

## Agenda
- [ ] Set the stage (10 min) - check-in and prime directive for psychological safety
- [ ] Gather data (20 min) - what went well, what was hard, notable events
- [ ] Generate insights (20 min) - group themes and find root causes
- [ ] Decide actions (15 min) - commit to one or two owned improvements
- [ ] Close the retro (10 min) - confirm owners, review prior actions, take a pulse

## Facilitator tips
- Vary the format so the retro stays fresh.
- Limit actions to one or two so they get done.
- Review prior actions first for accountability.
- Protect psychological safety.

## Notes
- What went well:
- What to improve:
- Actions and owners:
- Prior actions status:

---
Free template from OrgTP. Adapt or run it live at orgtp.com/templates/sprint-retrospective-meeting`,
  },
  {
    slug: 'backlog-refinement-meeting',
    title: 'Backlog Refinement Template',
    shortName: 'Backlog Refinement',
    description:
      'A free backlog refinement template and grooming agenda. Clarify, split, and estimate upcoming backlog items so they are ready for the next sprint planning.',
    category: 'agile',
    methodology: 'Agile / Scrum',
    minutes: 60,
    cadence: 'Weekly or once per sprint',
    participants: 'Product Owner, Scrum Master, development team (3-9 people)',
    keywords: [
      'backlog refinement template',
      'backlog grooming agenda',
      'product backlog refinement',
      'story refinement template',
      'backlog grooming checklist',
      'definition of ready',
      'story estimation meeting',
      'agile ceremony templates',
    ],
    steps: [
      {
        name: 'Review priorities',
        minutes: 10,
        text: 'The Product Owner walks the top of the backlog and confirms the order of upcoming work.',
      },
      {
        name: 'Clarify items',
        minutes: 15,
        text: 'Discuss each top item, answer questions, and sharpen the user story and acceptance criteria.',
      },
      {
        name: 'Split large items',
        minutes: 15,
        text: 'Break oversized stories into smaller, independently valuable slices that fit a sprint.',
      },
      {
        name: 'Estimate effort',
        minutes: 15,
        text: 'Size the refined items together using story points or another relative estimate.',
      },
      {
        name: 'Confirm readiness',
        minutes: 5,
        text: 'Check items against the definition of ready and flag any that still need work.',
      },
    ],
    bodyHtml: `<p>The <strong>backlog refinement template</strong> keeps a healthy pipeline of work that is clear, sized, and ready to plan. Refinement, sometimes called grooming, is the ongoing housekeeping that makes sprint planning fast. The goal is a top of the backlog that is well understood and small enough to commit to.</p>
<h2>When to use it</h2>
<p>Run refinement on a steady cadence, often once a week or once per sprint, between planning sessions. About an hour keeps it from eating the team's focus. Spend it on items coming up in the next sprint or two, not the distant backlog.</p>
<h2>Who attends</h2>
<p>The Product Owner brings priorities and context. The development team asks questions, splits stories, and estimates. The Scrum Master facilitates and protects the timebox. The whole team participates so the estimates and shared understanding are real.</p>
<h2>How to run it</h2>
<p>Start with the Product Owner confirming priority order. Work down the top of the backlog, clarifying each item until the story and acceptance criteria are clear. Split anything too large into smaller slices that each deliver value. Estimate the refined items together, then check them against your definition of ready and flag any that still need work before planning.</p>
<h2>Facilitator tips</h2>
<ul>
<li><strong>Refine just enough</strong> ahead, usually one or two sprints, not the whole backlog.</li>
<li><strong>Keep items small</strong> so each can be finished inside a sprint.</li>
<li><strong>Estimate as a team</strong> so the number reflects shared understanding.</li>
<li><strong>Use a definition of ready</strong> as the bar for entering planning.</li>
</ul>
<h2>Common mistakes</h2>
<ul>
<li>Skipping refinement, so sprint planning turns into discovery and runs long.</li>
<li>Refining too far ahead and wasting effort on work that changes.</li>
<li>Leaving stories too large to finish in one sprint.</li>
<li>Letting the Product Owner estimate alone instead of the team.</li>
</ul>
<p>Want a backlog that is always ready? <a href="/l8">Run it in OrgTP</a> to keep refined items, estimates, and readiness in one place.</p>`,
    downloadMarkdown: `# Backlog Refinement Template

Clarify, split, and estimate upcoming backlog items so they are ready for planning. Ongoing housekeeping that makes planning fast.

- **Duration:** 60 minutes
- **Cadence:** Weekly or once per sprint
- **Participants:** Product Owner, Scrum Master, development team

## Agenda
- [ ] Review priorities (10 min) - confirm the order of upcoming work
- [ ] Clarify items (15 min) - sharpen user stories and acceptance criteria
- [ ] Split large items (15 min) - break oversized stories into smaller slices
- [ ] Estimate effort (15 min) - size refined items as a team
- [ ] Confirm readiness (5 min) - check against the definition of ready

## Facilitator tips
- Refine just one or two sprints ahead, not the whole backlog.
- Keep items small enough to finish in a sprint.
- Estimate as a team for shared understanding.
- Use a definition of ready as the entry bar.

## Notes
- Items clarified:
- Items split:
- Estimates:
- Items still not ready:

---
Free template from OrgTP. Adapt or run it live at orgtp.com/templates/backlog-refinement-meeting`,
  },
  {
    slug: 'scrum-of-scrums-meeting',
    title: 'Scrum of Scrums Template',
    shortName: 'Scrum of Scrums',
    description:
      'A free scrum of scrums template and agenda. Coordinate multiple Scrum teams, surface cross-team dependencies, and clear shared blockers to stay aligned.',
    category: 'agile',
    methodology: 'Agile / Scrum',
    minutes: 30,
    cadence: '2-3 times per week',
    participants: 'One representative per Scrum team plus a facilitator (5-9 people)',
    keywords: [
      'scrum of scrums template',
      'scrum of scrums agenda',
      'cross team coordination scrum',
      'scaling scrum meeting',
      'multi team standup',
      'dependency management agile',
      'scrum of scrums checklist',
      'agile ceremony templates',
    ],
    steps: [
      {
        name: 'Team progress round',
        minutes: 10,
        text: 'Each team rep shares what their team finished and what they will deliver before the next sync.',
      },
      {
        name: 'Surface dependencies',
        minutes: 8,
        text: 'Reps name work that depends on another team and confirm the handoffs and timing.',
      },
      {
        name: 'Raise shared blockers',
        minutes: 7,
        text: 'Identify impediments that cross team boundaries and need coordination to resolve.',
      },
      {
        name: 'Assign cross-team actions',
        minutes: 5,
        text: 'Agree who owns each dependency and blocker, with a due date, before adjourning.',
      },
    ],
    bodyHtml: `<p>The <strong>scrum of scrums template</strong> scales Scrum coordination across multiple teams working toward a shared outcome. Think of it as a standup for team representatives. The focus is not individual tasks but the seams between teams: dependencies, integration points, and blockers that no single team can clear alone.</p>
<h2>When to use it</h2>
<p>Use it when two or more Scrum teams build a connected product or program. Run it a few times a week rather than daily, since cross-team issues move slower than individual work. Keep it to about thirty minutes and focused on coordination.</p>
<h2>Who attends</h2>
<p>Send one representative per team, often the Scrum Master or a senior engineer who knows the dependencies. A facilitator keeps the meeting moving. Reps must be empowered to speak for their team and commit to actions.</p>
<h2>How to run it</h2>
<p>Open with a quick progress round so every team knows where the others stand. Then spend the bulk of the time on the seams: each rep names work that depends on another team and confirms handoffs and timing. Surface blockers that cross boundaries, then assign a clear owner and due date to every dependency and impediment before closing.</p>
<h2>Facilitator tips</h2>
<ul>
<li><strong>Focus on the seams</strong> between teams, not the work inside each team.</li>
<li><strong>Empower the reps</strong> so they can commit on behalf of their team.</li>
<li><strong>Track dependencies visibly</strong> so nothing falls between teams.</li>
<li><strong>Escalate fast</strong> when a blocker needs leadership attention.</li>
</ul>
<h2>Common mistakes</h2>
<ul>
<li>Rehashing each team's internal standup instead of cross-team issues.</li>
<li>Sending reps who cannot commit, so decisions stall.</li>
<li>Surfacing dependencies but never assigning owners or dates.</li>
<li>Running it daily when the cadence does not justify it.</li>
</ul>
<p>Coordinating many teams? <a href="/l8">Run it in OrgTP</a> to track cross-team dependencies and blockers in one shared view.</p>`,
    downloadMarkdown: `# Scrum of Scrums Template

Coordinate multiple Scrum teams. Focus on the seams between teams: dependencies, integration, and shared blockers.

- **Duration:** 30 minutes
- **Cadence:** 2-3 times per week
- **Participants:** One representative per Scrum team plus a facilitator

## Agenda
- [ ] Team progress round (10 min) - what each team finished and will deliver next
- [ ] Surface dependencies (8 min) - name cross-team work and confirm handoffs
- [ ] Raise shared blockers (7 min) - impediments that cross team boundaries
- [ ] Assign cross-team actions (5 min) - owner and due date for each item

## Facilitator tips
- Focus on the seams between teams, not internal work.
- Send reps empowered to commit for their team.
- Track dependencies visibly.
- Escalate blockers fast when leadership is needed.

## Notes
- Team progress:
- Dependencies identified:
- Shared blockers:
- Owners and due dates:

---
Free template from OrgTP. Adapt or run it live at orgtp.com/templates/scrum-of-scrums-meeting`,
  },
  {
    slug: 'pi-planning-meeting',
    title: 'PI Planning Template',
    shortName: 'PI Planning',
    description:
      'A free PI planning template and agenda for scaled agile. Align teams on a program increment, set objectives, map dependencies, and commit with confidence.',
    category: 'agile',
    methodology: 'Agile / Scrum',
    minutes: 480,
    cadence: 'Quarterly (per program increment)',
    participants: 'All teams in the program, product management, and leadership (20-100+ people)',
    keywords: [
      'pi planning template',
      'pi planning agenda',
      'program increment planning',
      'scaled agile planning',
      'pi planning checklist',
      'big room planning',
      'agile release train planning',
      'agile ceremony templates',
    ],
    steps: [
      {
        name: 'Business context and vision',
        minutes: 60,
        text: 'Leadership shares the business context, product vision, and priorities for the increment.',
      },
      {
        name: 'Architecture and planning briefing',
        minutes: 30,
        text: 'Architecture and process leads outline technical direction, standards, and planning ground rules.',
      },
      {
        name: 'Team breakout planning',
        minutes: 180,
        text: 'Each team drafts iteration plans and objectives for the increment based on capacity and priorities.',
      },
      {
        name: 'Draft plan review',
        minutes: 60,
        text: 'Teams present draft plans, surface cross-team dependencies, and flag risks for the group.',
      },
      {
        name: 'Manage risks (ROAM)',
        minutes: 60,
        text: 'Review program risks and resolve, own, accept, or mitigate each one openly with the room.',
      },
      {
        name: 'Confidence vote and commit',
        minutes: 30,
        text: 'Teams finalize objectives, take a confidence vote, and commit to the increment plan.',
      },
    ],
    bodyHtml: `<p>The <strong>PI planning template</strong> structures a large, cross-team planning event where every team in a program aligns on a shared plan for the next increment. This is big-room planning: many teams in one place, or one virtual room, building a coordinated forecast for the weeks ahead. The output is a set of team objectives, a dependency map, and a shared commitment.</p>
<h2>When to use it</h2>
<p>Use it when a program of several teams needs to plan a multi-sprint increment together, typically once a quarter. It is a significant investment, often a day or two, so it suits programs where cross-team alignment is the bottleneck. This pattern comes from scaled agile frameworks, which are independent of OrgTP.</p>
<h2>Who attends</h2>
<p>Everyone who plans the increment attends: all teams, product management, architects, and leadership. The breadth is intentional. Decisions and dependencies get resolved in the room because the right people are present.</p>
<h2>How to run it</h2>
<p>Open with business context and vision so teams understand the why. Brief the room on architecture direction and planning rules. Then give teams a long breakout block to draft iteration plans and objectives against their capacity. Bring everyone back to review draft plans, surface dependencies, and name risks. Work the risks openly, deciding to resolve, own, accept, or mitigate each. Close with finalized objectives, a confidence vote, and a shared commitment.</p>
<h2>Facilitator tips</h2>
<ul>
<li><strong>Prepare relentlessly</strong> since a big event with no prep wastes everyone's time.</li>
<li><strong>Make dependencies visible</strong> on a shared board the whole room can see.</li>
<li><strong>Run an honest confidence vote</strong> and address low votes before committing.</li>
<li><strong>Timebox breakouts</strong> hard so the plenary reviews stay on schedule.</li>
</ul>
<h2>Common mistakes</h2>
<ul>
<li>Skipping preparation, so the event becomes chaotic and unproductive.</li>
<li>Hiding dependencies until they become delivery blockers.</li>
<li>Forcing commitment despite a low confidence vote.</li>
<li>Treating it as a status meeting rather than a planning event.</li>
</ul>
<p>Aligning a whole program? <a href="/l8">Run it in OrgTP</a> to keep objectives, dependencies, and risks in one shared plan.</p>`,
    downloadMarkdown: `# PI Planning Template

Big-room planning for a program of teams. Align on a program increment, set objectives, map dependencies, and commit. (PI planning is a scaled agile pattern, independent of OrgTP.)

- **Duration:** 480 minutes (often spread across 1-2 days)
- **Cadence:** Quarterly (per program increment)
- **Participants:** All program teams, product management, architects, leadership

## Agenda
- [ ] Business context and vision (60 min) - priorities for the increment
- [ ] Architecture and planning briefing (30 min) - direction and ground rules
- [ ] Team breakout planning (180 min) - draft iteration plans and objectives
- [ ] Draft plan review (60 min) - present plans, surface dependencies and risks
- [ ] Manage risks / ROAM (60 min) - resolve, own, accept, or mitigate each risk
- [ ] Confidence vote and commit (30 min) - finalize objectives and commit

## Facilitator tips
- Prepare relentlessly before the event.
- Make dependencies visible on a shared board.
- Run an honest confidence vote and address low votes.
- Timebox breakouts hard.

## Notes
- Program objectives:
- Cross-team dependencies:
- Risks (ROAM):
- Confidence vote result:

---
Free template from OrgTP. Adapt or run it live at orgtp.com/templates/pi-planning-meeting`,
  },
  {
    slug: 'release-planning-meeting',
    title: 'Release Planning Template',
    shortName: 'Release Planning',
    description:
      'A free release planning template and agenda. Define the release goal, scope the feature set, map milestones and risks, and align on a realistic timeline.',
    category: 'agile',
    methodology: 'Agile / Scrum',
    minutes: 120,
    cadence: 'Per release',
    participants: 'Product Owner, Scrum Master, development team, key stakeholders (5-12 people)',
    keywords: [
      'release planning template',
      'release planning agenda',
      'agile release plan',
      'release roadmap meeting',
      'release planning checklist',
      'feature scope planning',
      'release milestone planning',
      'agile ceremony templates',
    ],
    steps: [
      {
        name: 'Define the release goal',
        minutes: 20,
        text: 'Agree on the objective and the value this release delivers to customers and the business.',
      },
      {
        name: 'Scope the feature set',
        minutes: 30,
        text: 'Select the backlog items and features that belong in the release and rank by priority.',
      },
      {
        name: 'Map to sprints and milestones',
        minutes: 30,
        text: 'Lay the scope across upcoming sprints, set key milestones, and check it against capacity.',
      },
      {
        name: 'Identify risks and dependencies',
        minutes: 20,
        text: 'Surface technical, resource, and external dependencies that could threaten the timeline.',
      },
      {
        name: 'Confirm the plan',
        minutes: 20,
        text: 'Align on scope, dates, and definition of done for the release, and agree on what is out.',
      },
    ],
    bodyHtml: `<p>The <strong>release planning template</strong> bridges the gap between a single sprint and a long-term roadmap. It answers a practical question: what will we ship in this release, and roughly when. The plan is a forecast, not a contract, and it adapts as the team learns, but it gives stakeholders a clear, shared picture of scope and timing.</p>
<h2>When to use it</h2>
<p>Run it whenever you plan a release that spans multiple sprints, often at the start of a release cycle or quarter. Revisit it when scope, priorities, or timelines shift materially. About two hours is enough to set direction without overplanning details that will change.</p>
<h2>Who attends</h2>
<p>The Product Owner owns scope and priorities. The development team forecasts feasibility and effort. The Scrum Master facilitates. Pull in key stakeholders whose input or approval shapes the release so commitments are realistic and shared.</p>
<h2>How to run it</h2>
<p>Begin with the release goal so every scope decision has a clear test. Select and rank the features that belong in the release. Lay that scope across upcoming sprints, set milestones, and sanity-check it against real capacity. Surface risks and dependencies that could threaten the timeline. Close by confirming scope, dates, and the definition of done, and be explicit about what is out of scope.</p>
<h2>Facilitator tips</h2>
<ul>
<li><strong>Anchor on the release goal</strong> so scope debates have a clear test.</li>
<li><strong>Plan for adaptation</strong> and treat dates as a forecast, not a promise.</li>
<li><strong>Name what is out</strong> of scope as clearly as what is in.</li>
<li><strong>Pressure-test against capacity</strong> before anyone commits to a date.</li>
</ul>
<h2>Common mistakes</h2>
<ul>
<li>Overstuffing the release so the timeline is unrealistic from day one.</li>
<li>Treating the plan as fixed and refusing to adapt as you learn.</li>
<li>Ignoring dependencies that surface late and derail the date.</li>
<li>Leaving the definition of done for the release vague.</li>
</ul>
<p>Planning a release? <a href="/l8">Run it in OrgTP</a> to keep the goal, scope, milestones, and risks aligned across the team.</p>`,
    downloadMarkdown: `# Release Planning Template

Bridge a single sprint and the roadmap. Define the release goal, scope the features, map milestones, and align on a realistic timeline.

- **Duration:** 120 minutes
- **Cadence:** Per release
- **Participants:** Product Owner, Scrum Master, development team, key stakeholders

## Agenda
- [ ] Define the release goal (20 min) - objective and value of the release
- [ ] Scope the feature set (30 min) - select and rank features for the release
- [ ] Map to sprints and milestones (30 min) - lay scope across sprints, check capacity
- [ ] Identify risks and dependencies (20 min) - what could threaten the timeline
- [ ] Confirm the plan (20 min) - scope, dates, definition of done, what is out

## Facilitator tips
- Anchor on the release goal for scope debates.
- Treat dates as a forecast, not a promise.
- Name what is out of scope as clearly as what is in.
- Pressure-test against real capacity.

## Notes
- Release goal:
- In-scope features:
- Out of scope:
- Milestones, risks, and dependencies:

---
Free template from OrgTP. Adapt or run it live at orgtp.com/templates/release-planning-meeting`,
  },
  {
    slug: 'sprint-kickoff-meeting',
    title: 'Sprint Kickoff Template',
    shortName: 'Sprint Kickoff',
    description:
      'A free sprint kickoff template and agenda. Align the team on the sprint goal, confirm the plan, clarify ownership, and start the sprint with shared momentum.',
    category: 'agile',
    methodology: 'Agile / Scrum',
    minutes: 30,
    cadence: 'Start of every sprint',
    participants: 'Development team, Scrum Master, Product Owner (3-9 people)',
    keywords: [
      'sprint kickoff template',
      'sprint kickoff agenda',
      'sprint start meeting',
      'sprint launch checklist',
      'scrum kickoff template',
      'sprint goal alignment',
      'sprint kickoff checklist',
      'agile ceremony templates',
    ],
    steps: [
      {
        name: 'Restate the sprint goal',
        minutes: 5,
        text: 'Re-anchor the team on the single sprint goal set during planning and why it matters.',
      },
      {
        name: 'Walk the sprint backlog',
        minutes: 10,
        text: 'Review the committed items, confirm acceptance criteria, and make sure nothing is unclear.',
      },
      {
        name: 'Confirm ownership and first moves',
        minutes: 8,
        text: 'Clarify who is starting on what and which items the team will pull first.',
      },
      {
        name: 'Flag early risks',
        minutes: 5,
        text: 'Name dependencies or unknowns that could slow the sprint so they are visible from day one.',
      },
      {
        name: 'Commit and launch',
        minutes: 2,
        text: 'Confirm the team is aligned, energized, and ready, then officially start the sprint.',
      },
    ],
    bodyHtml: `<p>The <strong>sprint kickoff template</strong> gives the team a short, energizing start to a new sprint. Where sprint planning builds the plan, the kickoff makes sure everyone is genuinely aligned on it before work begins. It is a momentum-setting huddle: clear goal, clear first moves, and shared confidence that the plan holds together.</p>
<h2>When to use it</h2>
<p>Run a kickoff at the very start of a sprint, right after planning or first thing on day one. It works best for teams that want a clean launch separate from the detailed planning session. Keep it to about thirty minutes since the heavy lifting already happened in planning.</p>
<h2>Who attends</h2>
<p>The full Scrum team attends: the development team, the Scrum Master, and the Product Owner. Everyone who will contribute to the sprint should be present so the alignment and energy are real.</p>
<h2>How to run it</h2>
<p>Re-anchor the team on the sprint goal so the purpose is front and center. Walk the committed backlog quickly, confirming acceptance criteria and clearing any last confusion. Clarify who is picking up what and which items the team pulls first. Flag early risks and dependencies so they are visible from day one. Close by confirming the team is aligned and ready, then officially launch the sprint.</p>
<h2>Facilitator tips</h2>
<ul>
<li><strong>Keep it short</strong> since planning already did the deep work.</li>
<li><strong>Lead with the goal</strong> so momentum builds around a shared purpose.</li>
<li><strong>Confirm first moves</strong> so no one stares at the board wondering where to start.</li>
<li><strong>Surface unknowns early</strong> rather than letting them ambush the sprint.</li>
</ul>
<h2>Common mistakes</h2>
<ul>
<li>Repeating the entire planning session instead of aligning and launching.</li>
<li>Skipping the goal, so the sprint starts as a list of disconnected tasks.</li>
<li>Leaving first moves vague, so the first day starts slow.</li>
<li>Ignoring known risks until they stall the work mid-sprint.</li>
</ul>
<p>Want a clean sprint launch? <a href="/l8">Run it in OrgTP</a> to keep the goal, plan, and ownership aligned from day one.</p>`,
    downloadMarkdown: `# Sprint Kickoff Template

A short, energizing start to a new sprint. Align on the goal, confirm the plan and ownership, and launch with momentum.

- **Duration:** 30 minutes
- **Cadence:** Start of every sprint
- **Participants:** Development team, Scrum Master, Product Owner

## Agenda
- [ ] Restate the sprint goal (5 min) - re-anchor on the single goal and why it matters
- [ ] Walk the sprint backlog (10 min) - confirm committed items and acceptance criteria
- [ ] Confirm ownership and first moves (8 min) - who starts on what, pull first
- [ ] Flag early risks (5 min) - dependencies and unknowns visible from day one
- [ ] Commit and launch (2 min) - confirm alignment and start the sprint

## Facilitator tips
- Keep it short; planning did the deep work.
- Lead with the goal to build momentum.
- Confirm first moves so day one starts fast.
- Surface unknowns early.

## Notes
- Sprint goal:
- First items to pull:
- Ownership:
- Early risks:

---
Free template from OrgTP. Adapt or run it live at orgtp.com/templates/sprint-kickoff-meeting`,
  },
];
