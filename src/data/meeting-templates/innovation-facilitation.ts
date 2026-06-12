import type { MeetingTemplate } from './_types.js';

export const INNOVATION_TEMPLATES: MeetingTemplate[] = [
  {
    slug: 'focus-group-session',
    title: 'Focus Group Session Template',
    shortName: 'Focus Group Session',
    description:
      'Free focus group template with a moderator guide, focus group questions, and a timeboxed agenda to run a moderated session and capture honest qualitative feedback.',
    category: 'innovation',
    methodology: 'General',
    minutes: 90,
    cadence: 'As needed',
    participants: 'One moderator, one notetaker, and 6-10 screened participants',
    keywords: [
      'focus group template',
      'focus group questions',
      'focus group moderator guide',
      'focus group agenda',
      'qualitative research template',
      'moderated focus group',
      'customer feedback session',
      'focus group discussion guide',
    ],
    steps: [
      {
        name: 'Welcome and ground rules',
        minutes: 10,
        text: 'Greet participants, explain the purpose, confirm recording consent, and set ground rules: no wrong answers, one voice at a time, honesty over politeness.',
      },
      {
        name: 'Warm-up round',
        minutes: 10,
        text: 'Quick introductions and an easy opening question so every voice is in the room before the harder topics begin.',
      },
      {
        name: 'Core discussion',
        minutes: 40,
        text: 'Work through the prepared question set from broad to specific. Probe with "tell me more" and "why" rather than leading. Let silence do the work.',
      },
      {
        name: 'Concept or stimulus reaction',
        minutes: 15,
        text: 'Show the product, concept, ad, or prototype. Capture first reactions, then structured pros and cons. Watch faces, not just words.',
      },
      {
        name: 'Prioritization and wrap-up',
        minutes: 10,
        text: 'Ask the group to rank what matters most, surface anything unsaid, thank participants, and explain next steps.',
      },
      {
        name: 'Moderator debrief',
        minutes: 5,
        text: 'Moderator and notetaker capture top themes, surprises, and standout quotes immediately while memory is fresh.',
      },
    ],
    bodyHtml:
      '<p>A focus group is a moderated group conversation that surfaces the <em>why</em> behind customer behavior. This focus group template gives you a moderator guide, a question set, and a timeboxed flow so you can run a session that produces honest qualitative signal instead of polite noise.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run a focus group when you need depth, not breadth. It is the right tool for testing a new concept, pressure-testing messaging, understanding a buying decision, or exploring a problem space before you commit to a survey. If you already know the question and just need numbers, use a survey instead. A focus group earns its keep when you do not yet know what to measure.</p>' +
      '<h2>Who attends</h2>' +
      '<p>You need one moderator, one dedicated notetaker, and six to ten screened participants who fit a single segment. Do not mix segments in one session, and do not invite people who report to each other. Screen for the behavior you care about, not just demographics.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Open by setting ground rules and getting consent to record. Warm the room with an easy question so quiet people speak early. Move from broad to specific, and resist the urge to fill silence yourself. The best insight usually arrives after an awkward pause. Probe with neutral follow-ups, protect dissenting voices from groupthink, and debrief with your notetaker the moment the session ends.</p>' +
      '<h2>Questions to ask</h2>' +
      '<ul>' +
      '<li><strong>Walk me through the last time you faced this problem.</strong> What were you trying to get done?</li>' +
      '<li><strong>What did you try, and where did it fall short?</strong></li>' +
      '<li><strong>If you could wave a wand and fix one thing, what would it be?</strong></li>' +
      '<li><strong>What is your honest first reaction to this?</strong> Tell me more about that.</li>' +
      '<li><strong>What would have to be true for you to actually use this?</strong></li>' +
      '<li><strong>What almost stopped you, or what still gives you pause?</strong></li>' +
      '<li><strong>Is there anything I should have asked you but did not?</strong></li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Asking leading questions that telegraph the answer you want.</li>' +
      '<li>Letting one loud participant set the tone for the whole group.</li>' +
      '<li>Mixing segments so themes blur together and nothing is clear.</li>' +
      '<li>Treating opinions as facts instead of probing for the behavior underneath.</li>' +
      '<li>Skipping the debrief and losing the sharpest takeaways within the hour.</li>' +
      '</ul>' +
      '<p>Ready to run a tighter session? <a href="/l8">Run it in OrgTP</a> and keep your notes, themes, and follow-ups in one place.</p>',
    downloadMarkdown:
      '# Focus Group Session Template\n\n' +
      'Purpose: Run a moderated focus group that surfaces honest qualitative feedback and the reasoning behind customer behavior.\n\n' +
      'Duration: 90 minutes\n' +
      'Cadence: As needed\n' +
      'Participants: One moderator, one notetaker, and 6-10 screened participants\n\n' +
      '## Agenda\n' +
      '- [ ] Welcome and ground rules (10 min) - consent, purpose, one voice at a time\n' +
      '- [ ] Warm-up round (10 min) - easy opening question, every voice in the room\n' +
      '- [ ] Core discussion (40 min) - broad to specific, probe with why\n' +
      '- [ ] Concept or stimulus reaction (15 min) - show it, capture first reactions\n' +
      '- [ ] Prioritization and wrap-up (10 min) - rank, surface the unsaid, next steps\n' +
      '- [ ] Moderator debrief (5 min) - themes, surprises, standout quotes\n\n' +
      '## Questions\n' +
      '- Walk me through the last time you faced this problem.\n' +
      '- What did you try, and where did it fall short?\n' +
      '- If you could fix one thing, what would it be?\n' +
      '- What is your honest first reaction to this?\n' +
      '- What would have to be true for you to use this?\n' +
      '- What almost stopped you, or what still gives you pause?\n' +
      '- Is there anything I should have asked you but did not?\n\n' +
      '## Notes\n' +
      '- Top themes: ______________________________________________\n' +
      '- Surprises: ________________________________________________\n' +
      '- Standout quotes: __________________________________________\n' +
      '- Follow-ups: _______________________________________________\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/focus-group-session\n',
  },
  {
    slug: 'design-sprint-meeting',
    title: 'Design Sprint Template',
    shortName: 'Design Sprint',
    description:
      'Free design sprint template with a five-day design sprint agenda covering map, sketch, decide, prototype, and test to solve a big problem and validate it fast.',
    category: 'innovation',
    methodology: 'Design Thinking',
    minutes: 480,
    cadence: 'As needed',
    participants: 'A facilitator, a decider, and a cross-functional team of 5-7',
    keywords: [
      'design sprint template',
      'design sprint agenda',
      'five day design sprint',
      'design sprint facilitation',
      'product design sprint',
      'rapid prototyping workshop',
      'design thinking sprint',
      'sprint week schedule',
    ],
    steps: [
      {
        name: 'Day 1 - Map',
        minutes: 480,
        text: 'Set a long-term goal, list sprint questions, map the problem end to end, interview experts, and choose a single target to focus the week on.',
      },
      {
        name: 'Day 2 - Sketch',
        minutes: 480,
        text: 'Review existing solutions for inspiration, then have each person work alone together to sketch detailed, competing solutions on paper.',
      },
      {
        name: 'Day 3 - Decide',
        minutes: 480,
        text: 'Critique every sketch, vote on the strongest ideas, let the decider make the call, and storyboard the winning concept step by step.',
      },
      {
        name: 'Day 4 - Prototype',
        minutes: 480,
        text: 'Build a realistic facade prototype that looks real enough to test. Assign maker, stitcher, writer, and asset-collector roles to move fast.',
      },
      {
        name: 'Day 5 - Test',
        minutes: 480,
        text: 'Run five one-on-one interviews with target customers, watch them use the prototype, capture patterns, and decide what to do next.',
      },
    ],
    bodyHtml:
      '<p>A design sprint is a structured five-day process for answering critical business questions through design, prototyping, and testing with real customers. This design sprint template lays out the full week so a cross-functional team can go from a fuzzy problem to a tested, validated solution without months of debate.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Use a design sprint when the stakes are high, time is short, or the team is stuck. It shines for new product directions, risky features, and decisions where opinions are loud but evidence is thin. A sprint replaces "let us build it and see" with "let us test it Friday." If the problem is small or already well understood, a sprint is overkill.</p>' +
      '<h2>Who attends</h2>' +
      '<p>You need a facilitator to run the week, a decider with real authority to make the call, and a small cross-functional team of five to seven. Bring design, engineering, marketing, and someone who talks to customers. Everyone clears their calendar. A part-time sprinter is a missing sprinter.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Each day has one job. Monday you map the problem and pick a target. Tuesday everyone sketches competing solutions alone. Wednesday you critique, vote, and storyboard the winner. Thursday you build a realistic facade prototype, not real software. Friday you put it in front of five target customers and watch what actually happens. The whole point is to learn before you build.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Protect the schedule ruthlessly. The five-day arc only works if every day finishes its job.</li>' +
      '<li>Default to "work alone together" so you get diverse ideas instead of groupthink.</li>' +
      '<li>Make the decider decide. Sprints die when the team tries to reach consensus.</li>' +
      '<li>Recruit the five Friday testers early in the week, not on Thursday night.</li>' +
      '<li>Build only what you must to test the riskiest assumption. A prototype is a question, not a product.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Treating it as a brainstorm instead of a decision-making process with a deadline.</li>' +
      '<li>Inviting too many people or letting attendees drift in and out.</li>' +
      '<li>Over-building the prototype until it eats Friday testing time.</li>' +
      '<li>Skipping real customer interviews and substituting internal opinions.</li>' +
      '<li>Ending Friday with no clear decision about what happens next.</li>' +
      '</ul>' +
      '<p>Want a home for your sprint map, decisions, and test notes? <a href="/l8">Run it in OrgTP</a>.</p>',
    downloadMarkdown:
      '# Design Sprint Template\n\n' +
      'Purpose: Run a five-day design sprint to solve a high-stakes problem and validate a solution with real customers before building it.\n\n' +
      'Duration: 5 days (about 480 minutes per day)\n' +
      'Cadence: As needed\n' +
      'Participants: A facilitator, a decider, and a cross-functional team of 5-7\n\n' +
      '## Phases\n' +
      '- [ ] Day 1 - Map (full day) - set the goal, map the problem, ask experts, pick a target\n' +
      '- [ ] Day 2 - Sketch (full day) - gather inspiration, then sketch competing solutions alone\n' +
      '- [ ] Day 3 - Decide (full day) - critique, vote, decider chooses, storyboard the winner\n' +
      '- [ ] Day 4 - Prototype (full day) - build a realistic facade, assign maker and stitcher roles\n' +
      '- [ ] Day 5 - Test (full day) - five customer interviews, watch, capture patterns, decide next steps\n\n' +
      '## Tips\n' +
      '- Protect the schedule; each day must finish its job.\n' +
      '- Work alone together to avoid groupthink.\n' +
      '- Make the decider decide; do not chase consensus.\n' +
      '- Recruit the five Friday testers early.\n' +
      '- Build only enough to test the riskiest assumption.\n\n' +
      '## Notes\n' +
      '- Sprint goal: ______________________________________________\n' +
      '- Target chosen: ____________________________________________\n' +
      '- Winning concept: __________________________________________\n' +
      '- Friday findings: __________________________________________\n' +
      '- Decision and next steps: __________________________________\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/design-sprint-meeting\n',
  },
  {
    slug: 'design-critique-meeting',
    title: 'Design Critique Template',
    shortName: 'Design Critique',
    description:
      'Free design critique template with a structured agenda and feedback framework to run a design critique that improves the work without bruising the designer.',
    category: 'innovation',
    methodology: 'Design Thinking',
    minutes: 60,
    cadence: 'Weekly',
    participants: 'A facilitator, the presenting designer, and 3-8 reviewers',
    keywords: [
      'design critique template',
      'design critique agenda',
      'design review meeting',
      'design feedback framework',
      'product design critique',
      'ux critique session',
      'creative review meeting',
      'critique ground rules',
    ],
    steps: [
      {
        name: 'Frame the critique',
        minutes: 5,
        text: 'Facilitator restates the ground rules: critique the work, not the person, and aim feedback at the stated goal. Confirm the round is feedback, not a decision meeting.',
      },
      {
        name: 'Designer sets context',
        minutes: 10,
        text: 'The presenting designer states the problem, the audience, the constraints, and exactly what kind of feedback they need right now.',
      },
      {
        name: 'Silent review',
        minutes: 5,
        text: 'Reviewers study the work quietly and jot individual notes before anyone speaks, so first opinions do not anchor the room.',
      },
      {
        name: 'Structured feedback rounds',
        minutes: 25,
        text: 'Go reviewer by reviewer. Each frames feedback against the goal, names what works and why, then raises concerns as questions rather than commands.',
      },
      {
        name: 'Designer responds',
        minutes: 10,
        text: 'The designer reflects back what they heard, asks clarifying questions, and notes which threads they will pursue. No obligation to agree on the spot.',
      },
      {
        name: 'Capture and assign',
        minutes: 5,
        text: 'Record the agreed action items, owners, and open questions so the critique turns into changes rather than vibes.',
      },
    ],
    bodyHtml:
      '<p>A design critique is a focused session where a team reviews work in progress against its goal and gives the designer feedback they can actually use. This design critique template provides ground rules, a feedback framework, and a timeboxed flow so the conversation improves the work instead of bruising the maker.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run a critique while the work is still changeable, not after it ships. It fits weekly design reviews, milestone check-ins, and any moment a designer wants more eyes before committing. Keep it separate from approval meetings. A critique is about making the work better, not deciding whether it passes.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Invite a facilitator to hold the structure, the designer presenting, and three to eight reviewers who understand the problem. Mix disciplines for range, but keep the group small enough that everyone speaks. A critique with twenty silent observers is a presentation, not a critique.</p>' +
      '<h2>How to run it</h2>' +
      '<p>The facilitator frames the rules, then the designer sets context and names the feedback they need. Give reviewers a few silent minutes to form opinions so the loudest voice does not anchor everyone. Go round by round, anchoring every comment to the goal, naming strengths first, and raising concerns as questions. The designer reflects back what they heard, and you close by capturing concrete action items with owners.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Make the designer state what feedback they want; unsolicited redesigns help no one.</li>' +
      '<li>Anchor every comment to the goal, not personal taste.</li>' +
      '<li>Use silent review first so opinions are independent.</li>' +
      '<li>Phrase concerns as questions: "what happens if a new user lands here?"</li>' +
      '<li>Protect the designer from a pile-on; route through the facilitator.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Critiquing the person instead of the work.</li>' +
      '<li>Giving solutions before understanding the constraints.</li>' +
      '<li>Letting the highest-paid opinion override the stated goal.</li>' +
      '<li>Confusing critique with approval and blocking progress.</li>' +
      '<li>Ending with vague vibes and no captured action items.</li>' +
      '</ul>' +
      '<p>Keep your critiques structured and your action items tracked. <a href="/l8">Run it in OrgTP</a>.</p>',
    downloadMarkdown:
      '# Design Critique Template\n\n' +
      'Purpose: Run a structured design critique that improves work in progress against its goal without bruising the designer.\n\n' +
      'Duration: 60 minutes\n' +
      'Cadence: Weekly\n' +
      'Participants: A facilitator, the presenting designer, and 3-8 reviewers\n\n' +
      '## Agenda\n' +
      '- [ ] Frame the critique (5 min) - rules, critique the work not the person\n' +
      '- [ ] Designer sets context (10 min) - problem, audience, constraints, feedback wanted\n' +
      '- [ ] Silent review (5 min) - individual notes before anyone speaks\n' +
      '- [ ] Structured feedback rounds (25 min) - anchor to the goal, strengths then questions\n' +
      '- [ ] Designer responds (10 min) - reflect back, clarify, choose threads\n' +
      '- [ ] Capture and assign (5 min) - action items, owners, open questions\n\n' +
      '## Tips\n' +
      '- Make the designer state the feedback they want.\n' +
      '- Anchor every comment to the goal, not taste.\n' +
      '- Use silent review so opinions stay independent.\n' +
      '- Phrase concerns as questions.\n' +
      '- Protect the designer from a pile-on.\n\n' +
      '## Notes\n' +
      '- Stated goal: ______________________________________________\n' +
      '- What works: _______________________________________________\n' +
      '- Open concerns: ____________________________________________\n' +
      '- Action items and owners: __________________________________\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/design-critique-meeting\n',
  },
  {
    slug: 'workshop-facilitation-template',
    title: 'Workshop Facilitation Template',
    shortName: 'Workshop Facilitation',
    description:
      'Free workshop facilitation guide with a reusable agenda and framework to plan, open, run, and close any workshop so a group leaves with real decisions.',
    category: 'innovation',
    methodology: 'General',
    minutes: 120,
    cadence: 'As needed',
    participants: 'A facilitator, an optional co-facilitator, and 5-20 participants',
    keywords: [
      'workshop facilitation guide',
      'workshop facilitation template',
      'workshop agenda template',
      'facilitation framework',
      'how to run a workshop',
      'group facilitation techniques',
      'workshop planning template',
      'meeting facilitation guide',
    ],
    steps: [
      {
        name: 'Open and set the frame',
        minutes: 15,
        text: 'State the single outcome the workshop must produce, the agenda, and the working agreements. Run a quick check-in so everyone arrives present.',
      },
      {
        name: 'Diverge - generate options',
        minutes: 30,
        text: 'Open the problem wide. Use silent individual ideation, small-group work, or round-robin so quantity and range come before judgment.',
      },
      {
        name: 'Cluster and discuss',
        minutes: 25,
        text: 'Group similar ideas, surface tensions, and let the group make sense of what is on the wall. Keep airtime balanced across voices.',
      },
      {
        name: 'Converge - decide',
        minutes: 25,
        text: 'Narrow to the strongest options with dot voting or a simple decision rule. Name the decision and who owns it.',
      },
      {
        name: 'Action planning',
        minutes: 15,
        text: 'Turn the decision into concrete next steps with owners and dates. Vague intentions die in the parking lot.',
      },
      {
        name: 'Close and check-out',
        minutes: 10,
        text: 'Recap decisions and owners, confirm next steps, and run a fast check-out to capture energy and loose ends.',
      },
    ],
    bodyHtml:
      '<p>Facilitation is the craft of helping a group think and decide together. This workshop facilitation guide gives you a reusable diverge-and-converge framework so you can plan, open, run, and close any working session and have the room leave with real decisions instead of a wall of sticky notes.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Use this framework whenever a group needs to solve a problem, align on direction, or generate and choose options together. It fits strategy offsites, kickoff sessions, retrospectives, planning workshops, and cross-team problem-solving. If one person already has the answer and just needs to inform people, send a memo. A workshop is for thinking that has to happen together.</p>' +
      '<h2>Who attends</h2>' +
      '<p>You need a facilitator who stays neutral on content, an optional co-facilitator for larger groups, and the five to twenty people who own the problem and the follow-through. Invite the people with the information and the people who will do the work. Skip the spectators.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Every good workshop follows the same arc: open by naming the one outcome and the agreements, diverge to generate options widely, cluster to make sense of them, then converge to a decision. Always finish with action planning so the decision becomes owned next steps, and close with a short check-out. Hold the structure, stay neutral on content, and watch the clock so the room reaches a decision.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Define one outcome before you build the agenda; everything serves it.</li>' +
      '<li>Separate diverge from converge so you do not judge ideas before you have enough of them.</li>' +
      '<li>Stay neutral on content; your job is the process, not the answer.</li>' +
      '<li>Balance airtime with silent ideation and round-robins so quiet voices count.</li>' +
      '<li>Park off-topic items visibly so the room trusts you to return to them.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Running a workshop with no defined outcome, so the room wanders.</li>' +
      '<li>Letting the loudest or most senior person dominate.</li>' +
      '<li>Diverging and converging at the same time and killing good ideas early.</li>' +
      '<li>Ending without owners and dates, so nothing happens afterward.</li>' +
      '<li>The facilitator arguing for their own answer instead of holding the process.</li>' +
      '</ul>' +
      '<p>Plan the agenda, run the room, and track the action items in one place. <a href="/l8">Run it in OrgTP</a>.</p>',
    downloadMarkdown:
      '# Workshop Facilitation Template\n\n' +
      'Purpose: Plan, open, run, and close any workshop using a diverge-and-converge framework so the group leaves with real decisions.\n\n' +
      'Duration: 120 minutes\n' +
      'Cadence: As needed\n' +
      'Participants: A facilitator, an optional co-facilitator, and 5-20 participants\n\n' +
      '## Agenda\n' +
      '- [ ] Open and set the frame (15 min) - one outcome, agenda, working agreements, check-in\n' +
      '- [ ] Diverge - generate options (30 min) - silent ideation, small groups, round-robin\n' +
      '- [ ] Cluster and discuss (25 min) - group ideas, surface tensions, balance airtime\n' +
      '- [ ] Converge - decide (25 min) - dot vote or decision rule, name the decision and owner\n' +
      '- [ ] Action planning (15 min) - next steps with owners and dates\n' +
      '- [ ] Close and check-out (10 min) - recap, confirm, capture loose ends\n\n' +
      '## Tips\n' +
      '- Define one outcome before building the agenda.\n' +
      '- Separate diverge from converge.\n' +
      '- Stay neutral on content; own the process.\n' +
      '- Balance airtime so quiet voices count.\n' +
      '- Park off-topic items visibly.\n\n' +
      '## Notes\n' +
      '- Workshop outcome: _________________________________________\n' +
      '- Decision made: ____________________________________________\n' +
      '- Action items and owners: __________________________________\n' +
      '- Parking lot: ______________________________________________\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/workshop-facilitation-template\n',
  },
  {
    slug: 'hackathon-kickoff-meeting',
    title: 'Hackathon Kickoff Template',
    shortName: 'Hackathon Kickoff',
    description:
      'Free hackathon kickoff template with an agenda for rules, team formation, and pitches so your hackathon starts fast and teams ship a demo by the deadline.',
    category: 'innovation',
    methodology: 'General',
    minutes: 90,
    cadence: 'As needed',
    participants: 'Organizers, judges, mentors, and all hackathon participants',
    keywords: [
      'hackathon kickoff template',
      'hackathon agenda',
      'hackathon planning template',
      'hackathon rules template',
      'team formation hackathon',
      'hackathon kickoff meeting',
      'internal hackathon guide',
      'hackathon judging criteria',
    ],
    steps: [
      {
        name: 'Welcome and theme',
        minutes: 10,
        text: 'Organizers welcome everyone, announce the theme or challenge, and explain why this hackathon matters and what success looks like.',
      },
      {
        name: 'Rules and logistics',
        minutes: 15,
        text: 'Cover the schedule, deadlines, what counts as in scope, allowed tools and data, code of conduct, and where to get help.',
      },
      {
        name: 'Judging criteria',
        minutes: 10,
        text: 'Walk through exactly how projects are scored: impact, feasibility, originality, and demo quality. Teams build toward what is rewarded.',
      },
      {
        name: 'Idea pitches',
        minutes: 20,
        text: 'Anyone with an idea gets sixty seconds to pitch it. Capture each idea on a board so people can rally around the ones they like.',
      },
      {
        name: 'Team formation',
        minutes: 20,
        text: 'Participants self-organize into balanced teams. Help orphaned people find a home and make sure each team has the skills to ship.',
      },
      {
        name: 'Logistics and go',
        minutes: 15,
        text: 'Confirm submission format, demo time slots, mentor availability, and the final deadline. Then set the teams loose.',
      },
    ],
    bodyHtml:
      '<p>A hackathon kickoff sets the rules, forms the teams, and points everyone at the same finish line before a single line of code is written. This hackathon kickoff template gives you an agenda for the opening session so your event starts fast and every team has a real shot at shipping a demo by the deadline.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run this kickoff at the start of any hackathon, internal innovation day, or time-boxed build sprint. It works for a one-day internal event or a weekend-long open hackathon. The kickoff is the highest-leverage hour of the whole event. Get it right and teams spend the rest of the time building instead of wandering.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Everyone attends the kickoff: organizers running the show, judges who can answer scoring questions, mentors offering help during the event, and every participant. This is the one moment the whole room is together, so use it to align before people scatter into teams.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Open with the theme and why it matters, then get the boring-but-critical logistics out of the way: schedule, scope, tools, and conduct. Show the judging criteria explicitly so teams build toward what is rewarded. Run rapid idea pitches, let teams self-organize around the ideas they love, and close by confirming the submission format and deadline. Then get out of the way and let people build.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Publish judging criteria up front; teams optimize for whatever you measure.</li>' +
      '<li>Timebox idea pitches hard so the room keeps moving.</li>' +
      '<li>Help orphaned participants find a team; nobody should hack alone by accident.</li>' +
      '<li>Encourage scope cuts early. A small demo that works beats a big one that does not.</li>' +
      '<li>Make mentor availability and help channels obvious before teams disperse.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Skipping the rules so teams argue about scope mid-event.</li>' +
      '<li>Hiding the judging criteria until demo day.</li>' +
      '<li>Letting team formation drag and burning build time.</li>' +
      '<li>Allowing teams to over-scope so nothing is demoable at the deadline.</li>' +
      '<li>Forgetting to confirm the submission format and demo logistics.</li>' +
      '</ul>' +
      '<p>Run the kickoff, track teams, and capture every demo in one place. <a href="/l8">Run it in OrgTP</a>.</p>',
    downloadMarkdown:
      '# Hackathon Kickoff Template\n\n' +
      'Purpose: Open a hackathon with rules, judging criteria, idea pitches, and team formation so every team can ship a demo by the deadline.\n\n' +
      'Duration: 90 minutes\n' +
      'Cadence: As needed\n' +
      'Participants: Organizers, judges, mentors, and all hackathon participants\n\n' +
      '## Agenda\n' +
      '- [ ] Welcome and theme (10 min) - challenge, why it matters, what success looks like\n' +
      '- [ ] Rules and logistics (15 min) - schedule, scope, tools, conduct, help\n' +
      '- [ ] Judging criteria (10 min) - impact, feasibility, originality, demo quality\n' +
      '- [ ] Idea pitches (20 min) - 60 seconds each, capture on a board\n' +
      '- [ ] Team formation (20 min) - self-organize into balanced teams\n' +
      '- [ ] Logistics and go (15 min) - submission format, demo slots, deadline\n\n' +
      '## Tips\n' +
      '- Publish judging criteria up front.\n' +
      '- Timebox idea pitches hard.\n' +
      '- Help orphaned participants find a team.\n' +
      '- Encourage scope cuts early.\n' +
      '- Make mentor and help channels obvious.\n\n' +
      '## Notes\n' +
      '- Theme or challenge: _______________________________________\n' +
      '- Judging criteria: _________________________________________\n' +
      '- Teams and ideas: __________________________________________\n' +
      '- Submission deadline: ______________________________________\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/hackathon-kickoff-meeting\n',
  },
  {
    slug: 'user-research-session',
    title: 'User Research Session Template',
    shortName: 'User Research Session',
    description:
      'Free user research template with a usability testing script and moderator guide to run a usability session, watch real users, and capture honest behavior.',
    category: 'innovation',
    methodology: 'General',
    minutes: 60,
    cadence: 'As needed',
    participants: 'One moderator, one notetaker, and one participant per session',
    keywords: [
      'user research template',
      'usability testing script',
      'user research session',
      'usability test moderator guide',
      'ux research interview',
      'user interview template',
      'task based usability test',
      'user testing questions',
    ],
    steps: [
      {
        name: 'Intro and consent',
        minutes: 5,
        text: 'Welcome the participant, explain you are testing the product not them, get recording consent, and ask them to think aloud throughout.',
      },
      {
        name: 'Background questions',
        minutes: 10,
        text: 'Ask a few warm-up questions about how they currently handle the task so you understand their context before they touch anything.',
      },
      {
        name: 'Task-based testing',
        minutes: 30,
        text: 'Give realistic tasks one at a time. Stay quiet and watch. Resist helping. Capture where they hesitate, click wrong, or get stuck.',
      },
      {
        name: 'Post-task questions',
        minutes: 10,
        text: 'Probe what they expected, where it felt confusing, and what they would change. Anchor every question to what you just watched.',
      },
      {
        name: 'Debrief notes',
        minutes: 5,
        text: 'Moderator and notetaker capture top usability issues, severity, and standout quotes while the session is fresh.',
      },
    ],
    bodyHtml:
      '<p>User research watches real people use your product so you learn what actually happens, not what people say happens. This user research template gives you a usability testing script and a moderator guide so a single one-on-one session produces honest behavioral signal you can act on.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run usability sessions whenever you have a prototype, a flow, or a live product you want to improve. It is the right tool for finding where users get stuck, validating a redesign, or checking whether a new feature is discoverable. Use it before you ship, then again after, because watching five users will teach you more than a hundred guesses.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Each session has one moderator who guides and stays mostly quiet, one notetaker who captures behavior and quotes, and one participant who fits your target user. Test one person at a time so nobody performs for the group. Five sessions per round usually surfaces the majority of serious issues.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Open by making clear you are testing the product, not the person, and ask them to think aloud. Warm up with context questions, then give realistic tasks one at a time and go quiet. The hardest discipline is not helping when they struggle. Their struggle is the data. Probe afterward against what you saw, then debrief immediately to capture issues and severity.</p>' +
      '<h2>Questions to ask</h2>' +
      '<ul>' +
      '<li><strong>How do you handle this today?</strong> Walk me through your current process.</li>' +
      '<li><strong>What would you do first to accomplish this task?</strong> (then stay silent)</li>' +
      '<li><strong>What are you thinking right now?</strong> (when they pause or hesitate)</li>' +
      '<li><strong>What did you expect to happen when you clicked that?</strong></li>' +
      '<li><strong>On a scale where this is easy or hard, how did that feel, and why?</strong></li>' +
      '<li><strong>If you could change one thing about this, what would it be?</strong></li>' +
      '<li><strong>Was anything confusing or surprising that you did not mention?</strong></li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Leading the user to the answer instead of watching them find it.</li>' +
      '<li>Jumping in to help the moment they struggle and erasing the insight.</li>' +
      '<li>Asking what they would do instead of giving them a task to do.</li>' +
      '<li>Testing with people who do not match the real target user.</li>' +
      '<li>Trusting opinions over observed behavior when the two disagree.</li>' +
      '</ul>' +
      '<p>Keep your tasks, findings, and severity ratings together across rounds. <a href="/l8">Run it in OrgTP</a>.</p>',
    downloadMarkdown:
      '# User Research Session Template\n\n' +
      'Purpose: Run a one-on-one usability session, watch a real user complete tasks, and capture honest behavior and usability issues.\n\n' +
      'Duration: 60 minutes\n' +
      'Cadence: As needed\n' +
      'Participants: One moderator, one notetaker, and one participant per session\n\n' +
      '## Agenda\n' +
      '- [ ] Intro and consent (5 min) - testing the product not you, think aloud\n' +
      '- [ ] Background questions (10 min) - how they handle the task today\n' +
      '- [ ] Task-based testing (30 min) - realistic tasks, watch, do not help\n' +
      '- [ ] Post-task questions (10 min) - expectations, confusion, changes\n' +
      '- [ ] Debrief notes (5 min) - issues, severity, standout quotes\n\n' +
      '## Questions\n' +
      '- How do you handle this today?\n' +
      '- What would you do first to accomplish this task?\n' +
      '- What are you thinking right now?\n' +
      '- What did you expect to happen when you clicked that?\n' +
      '- How did that feel, easy or hard, and why?\n' +
      '- If you could change one thing, what would it be?\n' +
      '- Was anything confusing or surprising you did not mention?\n\n' +
      '## Notes\n' +
      '- Tasks tested: _____________________________________________\n' +
      '- Where they got stuck: _____________________________________\n' +
      '- Top usability issues and severity: ________________________\n' +
      '- Standout quotes: __________________________________________\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/user-research-session\n',
  },
  {
    slug: 'lean-coffee-session',
    title: 'Lean Coffee Session Template',
    shortName: 'Lean Coffee Session',
    description:
      'Free lean coffee template explaining the lean coffee format with a simple agendaless structure to build, vote, and discuss topics the group actually cares about.',
    category: 'innovation',
    methodology: 'General',
    minutes: 60,
    cadence: 'Weekly',
    participants: 'A light facilitator and 3-10 participants',
    keywords: [
      'lean coffee template',
      'lean coffee format',
      'lean coffee agenda',
      'agendaless meeting format',
      'democratic meeting structure',
      'lean coffee facilitation',
      'topic voting meeting',
      'structured but agendaless meeting',
    ],
    steps: [
      {
        name: 'Set up the board',
        minutes: 5,
        text: 'Draw three columns: To Discuss, Discussing, and Discussed. Explain the format quickly so newcomers know how voting and timeboxing work.',
      },
      {
        name: 'Brainstorm topics',
        minutes: 8,
        text: 'Everyone writes topics they want to discuss on cards, one idea each, and places them in the To Discuss column. No discussion yet.',
      },
      {
        name: 'Dot vote',
        minutes: 5,
        text: 'Each person gets two or three votes to place on the topics they most want to cover. Tally and order the column by votes.',
      },
      {
        name: 'Timeboxed discussion',
        minutes: 37,
        text: 'Move the top topic to Discussing and talk for five minutes. At time, thumbs vote to continue or move on. Repeat down the list.',
      },
      {
        name: 'Wrap and capture',
        minutes: 5,
        text: 'Capture any decisions, action items, and topics that did not get covered so they can carry to next time.',
      },
    ],
    bodyHtml:
      '<p>Lean coffee is a structured but agendaless meeting where the group builds the agenda live, votes on what matters, and discusses topics in timeboxes. This lean coffee template explains the format so you can run a democratic session where people only talk about what they actually care about.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Use lean coffee when you want conversation without a rigid agenda: team retrospectives, open office hours, community meetups, skip-level discussions, or any recurring sync that tends to drift. It works because the people in the room decide what is worth their time, so engagement stays high and nobody sits through topics they do not care about.</p>' +
      '<h2>Who attends</h2>' +
      '<p>You need a light facilitator who keeps the board and the timer moving, and three to ten participants. It scales down to a small team and up to a meetup, but past ten people the discussion gets crowded, so split into parallel tables if the group is large.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Set up three columns: To Discuss, Discussing, and Discussed. Everyone writes topics, then dot-votes to prioritize. Move the top topic to Discussing and talk for a fixed timebox, usually five minutes. When time is up, a quick thumbs vote decides whether to keep going or move on. Work down the list until time runs out, then capture decisions and carry-over topics. The structure does the facilitation for you.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Keep the timebox short; the vote-to-continue keeps good topics alive.</li>' +
      '<li>Stay light. The format facilitates itself, so resist over-managing.</li>' +
      '<li>Use a visible timer so the timebox is obvious to everyone.</li>' +
      '<li>Capture action items as they appear; do not rely on memory.</li>' +
      '<li>Honor the votes even when your favorite topic loses.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Letting a topic run forever and skipping the continue vote.</li>' +
      '<li>The facilitator steering the agenda instead of letting votes decide.</li>' +
      '<li>Skipping the timer so one topic eats the whole hour.</li>' +
      '<li>Forgetting to capture decisions and action items.</li>' +
      '<li>Running it with too many people so few get to speak.</li>' +
      '</ul>' +
      '<p>Build the board, run the timeboxes, and capture the carry-overs in one place. <a href="/l8">Run it in OrgTP</a>.</p>',
    downloadMarkdown:
      '# Lean Coffee Session Template\n\n' +
      'Purpose: Run a structured but agendaless meeting where the group builds the agenda, votes, and discusses topics it actually cares about.\n\n' +
      'Duration: 60 minutes\n' +
      'Cadence: Weekly\n' +
      'Participants: A light facilitator and 3-10 participants\n\n' +
      '## Agenda\n' +
      '- [ ] Set up the board (5 min) - To Discuss, Discussing, Discussed columns\n' +
      '- [ ] Brainstorm topics (8 min) - one topic per card, no discussion yet\n' +
      '- [ ] Dot vote (5 min) - 2-3 votes each, order by votes\n' +
      '- [ ] Timeboxed discussion (37 min) - 5 min per topic, thumbs vote to continue\n' +
      '- [ ] Wrap and capture (5 min) - decisions, action items, carry-over topics\n\n' +
      '## Tips\n' +
      '- Keep the timebox short; let the continue vote extend it.\n' +
      '- Stay light; the format facilitates itself.\n' +
      '- Use a visible timer.\n' +
      '- Capture action items as they appear.\n' +
      '- Honor the votes.\n\n' +
      '## Notes\n' +
      '- Top topics discussed: _____________________________________\n' +
      '- Decisions: ________________________________________________\n' +
      '- Action items: _____________________________________________\n' +
      '- Carry-over topics: ________________________________________\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/lean-coffee-session\n',
  },
];
