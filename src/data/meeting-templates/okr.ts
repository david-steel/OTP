// OKR (Objectives and Key Results) meeting templates for the /templates library.
// AUTHORED content. bodyHtml renders via <%- %>. Byte-stable: no Date.now,
// no randomness. See _types.ts for the shared contract.

import type { MeetingTemplate } from './_types.js';

export const OKR_TEMPLATES: MeetingTemplate[] = [
  {
    slug: 'okr-kickoff-meeting',
    title: 'OKR Kickoff Meeting Template',
    shortName: 'OKR Kickoff Meeting',
    description:
      'Use this OKR kickoff template to introduce objectives and key results to a team, set expectations, align on the cycle, and build shared buy-in from day one.',
    category: 'okr',
    methodology: 'OKR',
    minutes: 75,
    cadence: 'Per cycle',
    participants: 'Team leads and contributors (5-15 people)',
    keywords: [
      'OKR kickoff template',
      'OKR kickoff meeting agenda',
      'OKR template',
      'objectives and key results meeting',
      'OKR introduction meeting',
      'OKR onboarding agenda',
      'okr planning agenda',
      'OKR program launch',
    ],
    steps: [
      { name: 'Why OKRs and why now', minutes: 15, text: 'Explain the purpose of adopting OKRs, the problem they solve, and how the cycle connects to company strategy.' },
      { name: 'How the framework works', minutes: 15, text: 'Walk through objectives, key results, scoring from 0.0 to 1.0, and the difference between a result and a task.' },
      { name: 'Cadence and roles', minutes: 15, text: 'Lay out the full cycle: drafting, alignment, weekly check-ins, mid-cycle review, and final grading, plus who owns what.' },
      { name: 'Examples and anti-patterns', minutes: 15, text: 'Show strong example OKRs alongside common mistakes so the team can pattern-match good from bad.' },
      { name: 'Questions and commitments', minutes: 15, text: 'Open the floor for questions, address concerns honestly, and confirm what each person will draft before the next session.' },
    ],
    bodyHtml:
      '<p>The <strong>OKR kickoff meeting</strong> is where a team adopts objectives and key results as a working habit rather than a buzzword. It sets shared language, expectations, and rhythm before a single objective is written. A clear kickoff prevents months of confusion about what an OKR even is.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run this when introducing OKRs for the first time, onboarding a new team into an existing program, or restarting after a stalled rollout. It works best a week or two before the drafting workshop so people arrive with context rather than learning the framework and writing goals in the same hour.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Include everyone who will own or contribute to an objective, typically team leads and their contributors, five to fifteen people. A sponsor who can speak to why the company is investing in OKRs adds credibility and answers the inevitable skepticism in the room.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Start with why, since OKRs introduced without a reason feel like overhead. Teach the framework plainly: objectives are qualitative and inspiring, key results are measurable and scored from 0.0 to 1.0. Lay out the full cycle and the cadence of meetings so nobody is surprised later. Show real examples next to anti-patterns, then close with questions and a concrete commitment from each person about what they will draft. Leave the room with energy, not just information.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Lead with the problem OKRs solve, not the mechanics.</li>' +
      '<li>Use one strong example and one weak one so the contrast lands.</li>' +
      '<li>Name the full meeting cadence up front so the rhythm feels intentional.</li>' +
      '<li>Invite skepticism openly; unspoken doubt undermines adoption.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Teaching the framework with no connection to strategy.</li>' +
      '<li>Skipping examples, so the team writes vague objectives later.</li>' +
      '<li>Hiding the time commitment, which breeds resentment mid-cycle.</li>' +
      '<li>Ending without a concrete first step for each person.</li>' +
      '</ul>' +
      '<p>Launch your OKR program with momentum. <a href="/l8">Run it in OrgTP</a> and keep objectives, key results, and owners visible from the first day.</p>',
    downloadMarkdown:
      '# OKR Kickoff Meeting Template\n\n' +
      'Purpose: Introduce objectives and key results to a team, teach the framework and cadence, and build shared buy-in before drafting begins.\n\n' +
      '- Duration: 75 minutes\n' +
      '- Cadence: Per cycle (at program or team launch)\n' +
      '- Participants: Team leads and contributors (5-15 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Why OKRs and why now (15 min)\n' +
      '- [ ] How the framework works, scoring 0.0 to 1.0 (15 min)\n' +
      '- [ ] Cadence and roles across the cycle (15 min)\n' +
      '- [ ] Examples and anti-patterns (15 min)\n' +
      '- [ ] Questions and commitments (15 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Lead with the problem OKRs solve, not the mechanics.\n' +
      '- Use one strong example and one weak one.\n' +
      '- Name the full meeting cadence up front.\n' +
      '- Invite skepticism openly.\n\n' +
      '## Notes\n\n' +
      'Why now:\n\n' +
      'Cadence and roles:\n\n' +
      'Open questions:\n\n' +
      'First-step commitments:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/okr-kickoff-meeting\n',
  },
  {
    slug: 'okr-drafting-workshop',
    title: 'OKR Drafting Workshop Template',
    shortName: 'OKR Drafting Workshop',
    description:
      'Use this OKR drafting workshop template to write objectives and measurable key results together, pressure-test them for quality, and leave with a draft set.',
    category: 'okr',
    methodology: 'OKR',
    minutes: 120,
    cadence: 'Per cycle',
    participants: 'Team and objective owners (4-10 people)',
    keywords: [
      'OKR drafting workshop template',
      'OKR writing workshop agenda',
      'OKR template',
      'how to write OKRs',
      'okr planning agenda',
      'objectives and key results meeting',
      'OKR workshop facilitation',
      'key results writing session',
    ],
    steps: [
      { name: 'Strategic context recap', minutes: 15, text: 'Restate the strategy and the outcomes this cycle must serve so every draft objective ties back to direction.' },
      { name: 'Silent objective brainstorm', minutes: 20, text: 'Each person drafts candidate objectives independently to avoid groupthink and surface the widest range of ideas.' },
      { name: 'Cluster and select objectives', minutes: 25, text: 'Share, group, and debate the candidate objectives, then narrow to a focused set of three to five.' },
      { name: 'Draft key results', minutes: 30, text: 'Attach two to four measurable key results to each objective, confirming each is numeric, time-bound, and ownable.' },
      { name: 'Quality pressure-test', minutes: 20, text: 'Challenge every key result: is it a result or a task, is it ambitious yet achievable, and how will it be scored 0.0 to 1.0.' },
      { name: 'Assign owners and next steps', minutes: 10, text: 'Confirm a single owner per objective and agree what gets refined before the alignment meeting.' },
    ],
    bodyHtml:
      '<p>The <strong>OKR drafting workshop</strong> is the hands-on session where a team actually writes its objectives and key results. It is messier than planning and more creative than a check-in. The aim is a strong draft set, not a finished one, ready to be aligned and refined.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run this near the start of each cycle, after the kickoff has set context but before objectives are locked. It pairs well with a follow-up alignment meeting: draft here, then reconcile across teams. Use it any time goals feel vague and the team needs to rebuild them from scratch.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Keep it to the people who will own and execute the objectives, four to ten works best. A larger room slows drafting and dilutes ownership. Everyone present should be ready to write, not just react, so this is a working session rather than a review.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Ground the room in strategy first, then brainstorm objectives silently so the loudest voice does not set the agenda. Cluster and narrow to a focused set, then do the harder work of attaching measurable key results. Pressure-test every key result against one question: is this a result or just an activity. Close by assigning a single owner per objective and naming what needs refining before alignment. A good draft is specific enough to debate and rough enough to change.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Brainstorm objectives silently first to beat groupthink.</li>' +
      '<li>Insist key results are numbers, not activities.</li>' +
      '<li>Cap the set at three to five objectives before drafting results.</li>' +
      '<li>Leave the draft open; refinement comes at alignment.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Writing key results that are really just task lists.</li>' +
      '<li>Letting the most senior voice anchor every objective.</li>' +
      '<li>Polishing too early instead of producing a workable draft.</li>' +
      '<li>Drafting objectives with no measurable way to score them.</li>' +
      '</ul>' +
      '<p>Turn a blank page into a real draft. <a href="/l8">Run it in OrgTP</a> and keep your objectives and key results editable as you refine them.</p>',
    downloadMarkdown:
      '# OKR Drafting Workshop Template\n\n' +
      'Purpose: Write objectives and measurable key results together, pressure-test them for quality, and leave with a focused draft set ready for alignment.\n\n' +
      '- Duration: 120 minutes\n' +
      '- Cadence: Per cycle (early in the cycle)\n' +
      '- Participants: Team and objective owners (4-10 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Strategic context recap (15 min)\n' +
      '- [ ] Silent objective brainstorm (20 min)\n' +
      '- [ ] Cluster and select 3 to 5 objectives (25 min)\n' +
      '- [ ] Draft 2 to 4 key results per objective (30 min)\n' +
      '- [ ] Quality pressure-test and scoring check (20 min)\n' +
      '- [ ] Assign owners and next steps (10 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Brainstorm objectives silently first.\n' +
      '- Insist key results are numbers, not activities.\n' +
      '- Cap the set at 3 to 5 objectives.\n' +
      '- Leave the draft open for refinement.\n\n' +
      '## Notes\n\n' +
      'Candidate objectives:\n\n' +
      'Selected objectives:\n\n' +
      'Key results:\n\n' +
      'Owners and refinements:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/okr-drafting-workshop\n',
  },
  {
    slug: 'okr-alignment-meeting',
    title: 'OKR Alignment Meeting Template',
    shortName: 'OKR Alignment Meeting',
    description:
      'Use this OKR alignment template to reconcile objectives across teams, resolve conflicts and dependencies, and confirm every team pulls in the same direction.',
    category: 'okr',
    methodology: 'OKR',
    minutes: 90,
    cadence: 'Per cycle',
    participants: 'Team leads and cross-functional owners (6-15 people)',
    keywords: [
      'OKR alignment template',
      'OKR alignment meeting agenda',
      'OKR template',
      'cross team OKR alignment',
      'objectives and key results meeting',
      'OKR dependencies meeting',
      'okr planning agenda',
      'team alignment meeting agenda',
    ],
    steps: [
      { name: 'Company objectives recap', minutes: 15, text: 'Restate the top-level company objectives so every team OKR is judged against the same shared direction.' },
      { name: 'Teams present draft OKRs', minutes: 25, text: 'Each team walks its draft objectives and key results so the wider group can see the full picture at once.' },
      { name: 'Surface dependencies and conflicts', minutes: 25, text: 'Map where one team depends on another and where two teams have conflicting or duplicated goals.' },
      { name: 'Resolve and renegotiate', minutes: 20, text: 'Work through each conflict and dependency, renegotiating scope or sequencing until teams genuinely agree.' },
      { name: 'Confirm alignment and owners', minutes: 5, text: 'Confirm the reconciled set, name owners for shared dependencies, and lock the OKRs for the cycle.' },
    ],
    bodyHtml:
      '<p>The <strong>OKR alignment meeting</strong> is where individual teams stop optimizing in isolation and start pulling together. Drafting produces good team-level OKRs; alignment makes sure they add up to the company goal instead of quietly working against each other.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run this after teams have drafted their OKRs but before the cycle is locked. It is essential whenever multiple teams share goals, depend on each other, or compete for the same resources. Skip it and you discover the conflicts mid-cycle, when they are far more expensive to fix.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Bring the team leads and cross-functional owners who can speak for and commit their teams, six to fifteen people. Each attendee needs the authority to renegotiate scope on the spot, otherwise alignment becomes a round of note-taking followed by another meeting.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Anchor on the company objectives so every team is measured against the same direction. Have each team present its draft, then deliberately hunt for dependencies and conflicts rather than hoping they surface. Work through them in the room: renegotiate scope, resequence work, and resolve duplication until teams truly agree, not just nod. Close by confirming the reconciled set and naming owners for every shared dependency. Real alignment is uncomfortable, because it forces trade-offs into the open.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Keep the company objectives visible as the reference point throughout.</li>' +
      '<li>Actively hunt for dependencies; do not wait for them to surface.</li>' +
      '<li>Resolve conflicts live, not in a follow-up that never happens.</li>' +
      '<li>Assign a named owner to every cross-team dependency.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Letting teams present in isolation with no reconciliation.</li>' +
      '<li>Ignoring dependencies until they break mid-cycle.</li>' +
      '<li>Inviting people who cannot commit their teams to changes.</li>' +
      '<li>Declaring alignment when teams have only stopped arguing.</li>' +
      '</ul>' +
      '<p>Make sure every team rows in the same direction. <a href="/l8">Run it in OrgTP</a> and keep cross-team objectives and dependencies aligned all cycle.</p>',
    downloadMarkdown:
      '# OKR Alignment Meeting Template\n\n' +
      'Purpose: Reconcile draft objectives across teams, resolve dependencies and conflicts, and confirm every team pulls toward the same company goal.\n\n' +
      '- Duration: 90 minutes\n' +
      '- Cadence: Per cycle (after drafting, before lock)\n' +
      '- Participants: Team leads and cross-functional owners (6-15 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Company objectives recap (15 min)\n' +
      '- [ ] Teams present draft OKRs (25 min)\n' +
      '- [ ] Surface dependencies and conflicts (25 min)\n' +
      '- [ ] Resolve and renegotiate (20 min)\n' +
      '- [ ] Confirm alignment and owners (5 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Keep company objectives visible throughout.\n' +
      '- Actively hunt for dependencies.\n' +
      '- Resolve conflicts live, not in a follow-up.\n' +
      '- Assign an owner to every cross-team dependency.\n\n' +
      '## Notes\n\n' +
      'Dependencies:\n\n' +
      'Conflicts and resolutions:\n\n' +
      'Reconciled OKRs:\n\n' +
      'Dependency owners:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/okr-alignment-meeting\n',
  },
  {
    slug: 'okr-cascade-session',
    title: 'OKR Cascade Session Template',
    shortName: 'OKR Cascade Session',
    description:
      'Use this OKR cascade template to translate company objectives into team and individual key results, so every level connects to the goals above it.',
    category: 'okr',
    methodology: 'OKR',
    minutes: 90,
    cadence: 'Per cycle',
    participants: 'Managers and team leads (4-12 people)',
    keywords: [
      'OKR cascade',
      'OKR cascade session template',
      'OKR template',
      'cascading OKRs agenda',
      'objectives and key results meeting',
      'top down OKR alignment',
      'okr planning agenda',
      'team OKR cascade meeting',
    ],
    steps: [
      { name: 'Review parent objectives', minutes: 15, text: 'Walk the company or department objectives this level must support, confirming everyone reads them the same way.' },
      { name: 'Map contribution', minutes: 20, text: 'Discuss how this team uniquely contributes to each parent objective and where it owns the most leverage.' },
      { name: 'Draft team objectives', minutes: 25, text: 'Translate the contribution into team-level objectives that ladder up clearly to the parent goals.' },
      { name: 'Define team key results', minutes: 20, text: 'Attach measurable key results that, if achieved, demonstrably move the parent objective.' },
      { name: 'Check the ladder and owners', minutes: 10, text: 'Trace each team key result back up to a parent objective, fix orphans, and assign owners.' },
    ],
    bodyHtml:
      '<p>An <strong>OKR cascade session</strong> connects the levels of an organization so a frontline team can see exactly how its work moves the company goal. Done well, cascading is about contribution, not copy-paste: each level translates the goal above into something it genuinely owns.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run a cascade after company-level OKRs are set, working down one layer at a time, department to team to individual. It is most valuable in organizations large enough that the link between top goals and daily work has gone fuzzy. Smaller teams may cascade in a single session.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Bring the managers and team leads who own the layer being cascaded, four to twelve people. They need a firm grasp of the parent objectives and the authority to commit their teams. Cascading without that authority just produces aspirations nobody owns.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Start by making sure everyone reads the parent objectives the same way. Then discuss contribution: how does this team uniquely move those goals, and where is its leverage greatest. Draft team objectives that ladder up clearly, attach key results that demonstrably move the parent goal, and finish by tracing each one back up the chain. Any key result that cannot be traced to a parent objective is an orphan and needs a parent or a cut. Cascading is translation, not duplication.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Cascade contribution, not the literal parent wording.</li>' +
      '<li>Trace every team key result up to a parent objective.</li>' +
      '<li>Cut or reparent any orphaned goal before you finish.</li>' +
      '<li>Go one layer at a time so the ladder stays clean.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Copying the parent objective verbatim instead of translating it.</li>' +
      '<li>Creating team goals that connect to nothing above them.</li>' +
      '<li>Cascading so rigidly that local ownership disappears.</li>' +
      '<li>Skipping the trace-up check, so orphans slip through.</li>' +
      '</ul>' +
      '<p>Connect every level to the goal above it. <a href="/l8">Run it in OrgTP</a> and keep your objectives laddered from company to team in one view.</p>',
    downloadMarkdown:
      '# OKR Cascade Session Template\n\n' +
      'Purpose: Translate company objectives into team and individual key results so every level ladders up clearly to the goals above it.\n\n' +
      '- Duration: 90 minutes\n' +
      '- Cadence: Per cycle (after company OKRs are set)\n' +
      '- Participants: Managers and team leads (4-12 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Review parent objectives (15 min)\n' +
      '- [ ] Map this team contribution (20 min)\n' +
      '- [ ] Draft team objectives that ladder up (25 min)\n' +
      '- [ ] Define measurable team key results (20 min)\n' +
      '- [ ] Check the ladder and assign owners (10 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Cascade contribution, not literal parent wording.\n' +
      '- Trace every key result up to a parent objective.\n' +
      '- Cut or reparent any orphaned goal.\n' +
      '- Go one layer at a time.\n\n' +
      '## Notes\n\n' +
      'Parent objectives:\n\n' +
      'Team contribution:\n\n' +
      'Team objectives and key results:\n\n' +
      'Owners:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/okr-cascade-session\n',
  },
  {
    slug: 'okr-weekly-checkin',
    title: 'OKR Weekly Check-in Meeting Template',
    shortName: 'OKR Weekly Check-in Meeting',
    description:
      'Use this OKR weekly check-in template to update key result metrics, refresh confidence, clear blockers, and keep the team on pace between planning sessions.',
    category: 'okr',
    methodology: 'OKR',
    minutes: 25,
    cadence: 'Weekly',
    participants: 'Team and objective owners (3-8 people)',
    keywords: [
      'OKR check in meeting',
      'OKR weekly check-in template',
      'OKR template',
      'weekly OKR meeting agenda',
      'objectives and key results meeting',
      'OKR progress tracking',
      'okr planning agenda',
      'key results check-in agenda',
    ],
    steps: [
      { name: 'Wins since last week', minutes: 4, text: 'Each owner names one concrete win to open on momentum rather than problems.' },
      { name: 'Metric updates', minutes: 8, text: 'Update the current number on each key result and state plainly whether it is on, ahead of, or behind pace.' },
      { name: 'Confidence refresh', minutes: 5, text: 'Re-rate confidence on each objective and note any change from last week so risk surfaces early.' },
      { name: 'Blockers and help', minutes: 5, text: 'Surface what is slowing a key result and assign someone to clear each blocker by a date.' },
      { name: 'This week commitments', minutes: 3, text: 'Each owner names the single most important action that moves a key result before the next check-in.' },
    ],
    bodyHtml:
      '<p>The <strong>OKR weekly check-in</strong> is the short, metric-driven heartbeat that keeps objectives from quietly drifting. It is not a status broadcast; it is a working session to update where each key result stands and remove whatever is in the way before the week moves on.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run this every week between the larger planning and review sessions. A fixed day and time turns it into a reliable ritual instead of a meeting people negotiate around. It can live inside an existing weekly sync, but the OKR portion deserves its own protected, timeboxed slot.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Keep it tight: the objective owners and the people directly working the key results, three to eight people. A small room keeps the pace fast and the conversation honest. Stakeholders who only want a status update can read the numbers afterward instead of slowing the meeting.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Open with a quick win to build momentum, then go straight to the numbers. For each key result, update the current value and say whether you are on, ahead, or behind pace, no narratives. Refresh confidence so falling signals surface while there is still time to act. Name the blockers and assign an owner and date to each. Close with one committed action per person so the week has a clear next step.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Protect the timebox; push any real debate offline.</li>' +
      '<li>Require a number for every key result, not a story.</li>' +
      '<li>Treat a confidence drop as a prompt to act, not a failure to punish.</li>' +
      '<li>Close every blocker with an owner and a date.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Letting the check-in sprawl into a long status meeting.</li>' +
      '<li>Reporting activity instead of movement on the metric.</li>' +
      '<li>Ignoring falling confidence until the cycle is lost.</li>' +
      '<li>Naming blockers but never assigning who resolves them.</li>' +
      '</ul>' +
      '<p>Keep your objectives on pace every week. <a href="/l8">Run it in OrgTP</a> so progress, confidence, and blockers stay live between sessions.</p>',
    downloadMarkdown:
      '# OKR Weekly Check-in Meeting Template\n\n' +
      'Purpose: Update key result metrics, refresh confidence, clear blockers, and keep the team on pace between OKR planning and review sessions.\n\n' +
      '- Duration: 25 minutes\n' +
      '- Cadence: Weekly\n' +
      '- Participants: Team and objective owners (3-8 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Wins since last week (4 min)\n' +
      '- [ ] Metric updates on each key result (8 min)\n' +
      '- [ ] Confidence refresh (5 min)\n' +
      '- [ ] Blockers and help needed (5 min)\n' +
      '- [ ] This week commitments (3 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Protect the timebox; push debate offline.\n' +
      '- Require a number for every key result.\n' +
      '- Treat a confidence drop as a prompt to act.\n' +
      '- Close every blocker with an owner and a date.\n\n' +
      '## Notes\n\n' +
      'Metric updates:\n\n' +
      'Confidence changes:\n\n' +
      'Blockers and owners:\n\n' +
      'Weekly commitments:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/okr-weekly-checkin\n',
  },
  {
    slug: 'okr-mid-quarter-review',
    title: 'OKR Mid-Quarter Review Template',
    shortName: 'OKR Mid-Quarter Review',
    description:
      'Use this OKR mid-quarter review template to assess progress at the halfway point, recalibrate at-risk objectives, and refocus the team for the second half.',
    category: 'okr',
    methodology: 'OKR',
    minutes: 60,
    cadence: 'Mid-quarter',
    participants: 'Objective owners and team leads (4-10 people)',
    keywords: [
      'OKR mid-quarter review template',
      'OKR midpoint review agenda',
      'OKR template',
      'OKR check in meeting',
      'objectives and key results meeting',
      'OKR recalibration meeting',
      'okr planning agenda',
      'mid cycle OKR review',
    ],
    steps: [
      { name: 'Halfway scorecard', minutes: 15, text: 'Review each objective at its midpoint, scoring expected progress so far against where it should be by now.' },
      { name: 'On-track vs at-risk', minutes: 15, text: 'Sort objectives into on-track, at-risk, and off-track, and discuss the drivers behind each bucket.' },
      { name: 'Recalibrate at-risk OKRs', minutes: 20, text: 'For at-risk objectives, decide whether to double down, adjust scope, or formally retire a key result that no longer fits.' },
      { name: 'Reallocate focus', minutes: 7, text: 'Shift attention and resources toward the objectives that still matter most for the rest of the cycle.' },
      { name: 'Confirm second-half plan', minutes: 3, text: 'Agree the adjusted set, owners, and what the weekly check-ins should watch most closely.' },
    ],
    bodyHtml:
      '<p>The <strong>OKR mid-quarter review</strong> is the honest checkpoint at the halfway mark. It is the moment to admit which objectives are quietly slipping and to act while there is still time, rather than discovering the misses at final grading when nothing can change.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run this roughly at the midpoint of each cycle, between the weekly check-ins. It is heavier than a weekly update but lighter than full grading. Use it whenever the team needs to step back from week-to-week movement and ask whether the cycle is genuinely on course.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Bring the objective owners and the team leads who can make real calls about scope and focus, four to ten people. The room needs the authority to adjust or retire a key result, since the whole point of the meeting is to recalibrate rather than just observe.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Score every objective against where it should be by the halfway mark, then sort honestly into on-track, at-risk, and off-track. Spend the bulk of the time on the at-risk group: decide whether to double down, trim scope, or retire a key result that no longer makes sense. Reallocate focus toward what still matters, and confirm an adjusted second-half plan with owners. A mid-quarter review that changes nothing was just a status meeting in disguise.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Score against expected pace, not against zero.</li>' +
      '<li>Be willing to retire a key result that reality has overtaken.</li>' +
      '<li>Spend the most time on the at-risk objectives, not the safe ones.</li>' +
      '<li>Leave with a concrete second-half plan, not just a status.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Treating the midpoint as a status update with no decisions.</li>' +
      '<li>Refusing to adjust objectives that are clearly broken.</li>' +
      '<li>Spending the meeting on the objectives that are already fine.</li>' +
      '<li>Ending without reallocating focus for the second half.</li>' +
      '</ul>' +
      '<p>Catch the slippage while you can still act. <a href="/l8">Run it in OrgTP</a> and keep at-risk objectives and recalibrations visible to the team.</p>',
    downloadMarkdown:
      '# OKR Mid-Quarter Review Template\n\n' +
      'Purpose: Assess progress at the halfway point, recalibrate at-risk objectives, and refocus the team and resources for the second half of the cycle.\n\n' +
      '- Duration: 60 minutes\n' +
      '- Cadence: Mid-quarter (cycle midpoint)\n' +
      '- Participants: Objective owners and team leads (4-10 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Halfway scorecard against expected pace (15 min)\n' +
      '- [ ] Sort on-track, at-risk, off-track (15 min)\n' +
      '- [ ] Recalibrate at-risk OKRs (20 min)\n' +
      '- [ ] Reallocate focus and resources (7 min)\n' +
      '- [ ] Confirm second-half plan (3 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Score against expected pace, not against zero.\n' +
      '- Retire a key result reality has overtaken.\n' +
      '- Spend the most time on at-risk objectives.\n' +
      '- Leave with a concrete second-half plan.\n\n' +
      '## Notes\n\n' +
      'Halfway scores:\n\n' +
      'At-risk objectives:\n\n' +
      'Recalibrations:\n\n' +
      'Second-half plan and owners:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/okr-mid-quarter-review\n',
  },
  {
    slug: 'okr-monthly-review',
    title: 'OKR Monthly Review Template',
    shortName: 'OKR Monthly Review',
    description:
      'Use this OKR monthly review template to step back from weekly tracking, assess trajectory across objectives, surface themes, and adjust focus for the month ahead.',
    category: 'okr',
    methodology: 'OKR',
    minutes: 60,
    cadence: 'Monthly',
    participants: 'Objective owners and leadership (5-12 people)',
    keywords: [
      'OKR monthly review template',
      'monthly OKR meeting agenda',
      'OKR template',
      'OKR check in meeting',
      'objectives and key results meeting',
      'OKR trajectory review',
      'okr planning agenda',
      'monthly goal review meeting',
    ],
    steps: [
      { name: 'Month in numbers', minutes: 15, text: 'Review the movement on each key result over the month and compare actual trajectory against the planned curve.' },
      { name: 'Themes and patterns', minutes: 15, text: 'Step up from individual metrics to discuss the patterns: what is consistently moving, what is consistently stuck, and why.' },
      { name: 'Decisions and adjustments', minutes: 20, text: 'Decide where to invest more, where to pull back, and whether any objective needs its scope or owner revisited.' },
      { name: 'Cross-team signals', minutes: 7, text: 'Share what other teams should know: dependencies, risks, and opportunities that emerged this month.' },
      { name: 'Focus for next month', minutes: 3, text: 'Agree the few things that matter most for the coming month and confirm owners.' },
    ],
    bodyHtml:
      '<p>The <strong>OKR monthly review</strong> sits between the fast weekly check-in and the heavier quarterly grading. It is the altitude where trajectory becomes visible: a single week can mislead, but a month of movement tells the real story of whether an objective is on track.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run this once a month for teams or programs on quarterly cycles, or as the primary review rhythm for teams running longer annual OKRs. It is especially useful when weekly check-ins feel too granular to see the trend and quarterly grading feels too far away to course-correct.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Bring the objective owners plus the leadership who can make resourcing and focus decisions, five to twelve people. The monthly cadence makes this a natural place for cross-team signals, so include people who can speak to dependencies beyond their own objectives.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Open with a month of numbers so the trajectory, not a single data point, drives the conversation. Then climb to themes: what keeps moving, what keeps stalling, and what that pattern means. Use the bulk of the time for real decisions about where to invest and pull back. Share cross-team signals so the wider organization benefits, and close with a short list of what matters most next month. A monthly review earns its length only if it produces decisions a weekly check-in could not.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Look at the month-long trend, not the latest single week.</li>' +
      '<li>Rise from metrics to themes before deciding anything.</li>' +
      '<li>Make this the place for resourcing and focus calls.</li>' +
      '<li>Capture cross-team signals so the whole org benefits.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Repeating the weekly check-in at greater length with no new depth.</li>' +
      '<li>Reacting to a single week instead of the monthly trend.</li>' +
      '<li>Reviewing numbers without making any focus decisions.</li>' +
      '<li>Keeping insights local when other teams needed them.</li>' +
      '</ul>' +
      '<p>See the trajectory before it is too late to change it. <a href="/l8">Run it in OrgTP</a> and keep monthly trends, themes, and decisions in one place.</p>',
    downloadMarkdown:
      '# OKR Monthly Review Template\n\n' +
      'Purpose: Step back from weekly tracking to assess trajectory across objectives, surface themes, make focus decisions, and set priorities for the month ahead.\n\n' +
      '- Duration: 60 minutes\n' +
      '- Cadence: Monthly\n' +
      '- Participants: Objective owners and leadership (5-12 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Month in numbers vs planned curve (15 min)\n' +
      '- [ ] Themes and patterns (15 min)\n' +
      '- [ ] Decisions and adjustments (20 min)\n' +
      '- [ ] Cross-team signals (7 min)\n' +
      '- [ ] Focus for next month (3 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Look at the month-long trend, not one week.\n' +
      '- Rise from metrics to themes before deciding.\n' +
      '- Make this the place for resourcing calls.\n' +
      '- Capture cross-team signals.\n\n' +
      '## Notes\n\n' +
      'Trajectory by objective:\n\n' +
      'Themes:\n\n' +
      'Decisions and adjustments:\n\n' +
      'Next-month focus and owners:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/okr-monthly-review\n',
  },
  {
    slug: 'okr-grading-session',
    title: 'OKR Grading and Scoring Session Template',
    shortName: 'OKR Grading and Scoring Session',
    description:
      'Use this OKR grading template to score each key result from 0.0 to 1.0 at the end of a cycle, discuss what drove the result, and capture lessons for the next set.',
    category: 'okr',
    methodology: 'OKR',
    minutes: 75,
    cadence: 'End of cycle',
    participants: 'Objective owners and team leads (4-10 people)',
    keywords: [
      'OKR grading',
      'OKR scoring session template',
      'OKR template',
      'OKR grading 0.0 to 1.0',
      'objectives and key results meeting',
      'end of quarter OKR scoring',
      'okr planning agenda',
      'OKR results review meeting',
    ],
    steps: [
      { name: 'Grading ground rules', minutes: 10, text: 'Reaffirm the 0.0 to 1.0 scale, that 0.7 on a stretch goal is a healthy result, and that the score is data, not a verdict.' },
      { name: 'Score each key result', minutes: 25, text: 'Walk every key result and assign a score from 0.0 to 1.0 based on the final metric against the target.' },
      { name: 'Roll up to objective scores', minutes: 10, text: 'Average or weight the key results to produce a score for each objective and a clear read on the cycle.' },
      { name: 'Discuss what drove results', minutes: 20, text: 'For both high and low scores, dig into the actual drivers rather than rationalizing or celebrating at the surface.' },
      { name: 'Capture lessons forward', minutes: 10, text: 'Record the lessons that should shape the next cycle, including which goals were mis-scoped or mis-measured.' },
    ],
    bodyHtml:
      '<p>The <strong>OKR grading and scoring session</strong> closes a cycle with an honest number on every key result. Scoring on a 0.0 to 1.0 scale turns a quarter of effort into a clear read on what was achieved, and it only works when the room treats the score as data rather than a personal grade.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run this at the end of each cycle, once the final metrics are in. It typically precedes the retrospective: grade first to establish what happened, then reflect on why. Keep it separate from planning the next set so scoring stays honest and is not bent to make the next cycle look easier.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Bring the objective owners and team leads, four to ten people. Everyone should arrive with final numbers, not estimates. The tone matters as much as the math: if low scores are punished, future OKRs get sandbagged and the whole system loses its honesty.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Reset the ground rules first, especially that a 0.7 on a genuine stretch goal is a good outcome, not a failure. Score each key result from 0.0 to 1.0 against its target, then roll those up into objective scores. Spend real time on the drivers behind both the wins and the misses, since the explanation is more valuable than the number. Close by capturing the lessons, including which goals were mis-scoped, so the next cycle is sharper. Grading is a learning tool, not a performance review.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Score against the target, with 0.7 on a stretch goal counted as healthy.</li>' +
      '<li>Separate the score from individual performance evaluation.</li>' +
      '<li>Dig into drivers for high scores too, not just the misses.</li>' +
      '<li>Capture mis-scoped goals as lessons for the next set.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Treating anything below 1.0 as a failure, which kills ambition.</li>' +
      '<li>Scoring without explaining what actually drove the result.</li>' +
      '<li>Using grades as a performance verdict, so future goals get sandbagged.</li>' +
      '<li>Grading and replanning in the same breath, bending the scores.</li>' +
      '</ul>' +
      '<p>Close the cycle with honest numbers. <a href="/l8">Run it in OrgTP</a> and keep your key result scores and lessons in one place cycle over cycle.</p>',
    downloadMarkdown:
      '# OKR Grading and Scoring Session Template\n\n' +
      'Purpose: Score each key result from 0.0 to 1.0 at the end of the cycle, discuss what drove the results, and capture lessons that sharpen the next set.\n\n' +
      '- Duration: 75 minutes\n' +
      '- Cadence: End of cycle (after final metrics are in)\n' +
      '- Participants: Objective owners and team leads (4-10 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Grading ground rules and the 0.0 to 1.0 scale (10 min)\n' +
      '- [ ] Score each key result 0.0 to 1.0 (25 min)\n' +
      '- [ ] Roll up to objective scores (10 min)\n' +
      '- [ ] Discuss what drove results (20 min)\n' +
      '- [ ] Capture lessons forward (10 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Count 0.7 on a stretch goal as healthy.\n' +
      '- Separate the score from performance evaluation.\n' +
      '- Dig into drivers for high scores too.\n' +
      '- Capture mis-scoped goals as lessons.\n\n' +
      '## Notes\n\n' +
      'Key result scores:\n\n' +
      'Objective scores:\n\n' +
      'What drove the results:\n\n' +
      'Lessons forward:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/okr-grading-session\n',
  },
  {
    slug: 'okr-quarterly-retrospective',
    title: 'OKR Quarterly Retrospective Template',
    shortName: 'OKR Quarterly Retrospective',
    description:
      'Use this OKR retrospective template to reflect on the cycle, examine what helped and hurt OKR execution, and improve how the team sets and runs goals next time.',
    category: 'okr',
    methodology: 'OKR',
    minutes: 75,
    cadence: 'Quarterly',
    participants: 'Team and objective owners (4-12 people)',
    keywords: [
      'OKR retrospective template',
      'OKR quarterly retrospective agenda',
      'OKR template',
      'OKR retro meeting',
      'objectives and key results meeting',
      'OKR process improvement',
      'okr planning agenda',
      'quarterly retrospective meeting',
    ],
    steps: [
      { name: 'Set the frame', minutes: 10, text: 'Recap the cycle scores at a high level and remind the room this is about the process of running OKRs, not regrading them.' },
      { name: 'What helped', minutes: 15, text: 'Surface the practices, rituals, and decisions that genuinely helped the team set and hit goals this cycle.' },
      { name: 'What hurt', minutes: 15, text: 'Name honestly what got in the way: poorly written goals, missed check-ins, shifting priorities, or unclear ownership.' },
      { name: 'Patterns over cycles', minutes: 15, text: 'Compare to prior cycles to spot recurring strengths and recurring problems worth addressing structurally.' },
      { name: 'Process improvements', minutes: 15, text: 'Agree a small set of changes to how the team writes, tracks, and grades OKRs, with an owner for each.' },
      { name: 'Commit and close', minutes: 5, text: 'Confirm the improvements that carry into the next cycle and how the team will hold itself to them.' },
    ],
    bodyHtml:
      '<p>The <strong>OKR quarterly retrospective</strong> turns a finished cycle into a better next one. Grading asks what the team achieved; the retrospective asks how the team worked, and whether the way it sets and runs OKRs is itself improving over time.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run this at the end of each cycle, right after grading and before planning the next set. Grading establishes the results, the retrospective examines the process, and planning applies the lessons. Holding all three close together keeps the learning loop tight and the improvements fresh.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Bring the team and objective owners who lived the cycle, four to twelve people. Psychological safety is essential: people must be able to name what went wrong without fear, or the retrospective becomes a polite list of things that were basically fine.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Frame the session as process improvement, not a regrade. Surface what helped, then name what hurt with genuine honesty. The real value comes from comparing across cycles: a problem that shows up every quarter is structural and deserves a structural fix. Agree a small, owned set of changes to how the team writes, tracks, and grades OKRs, and confirm how it will hold to them. Two or three real improvements beat a long list nobody acts on.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Keep the focus on process, not on regrading results.</li>' +
      '<li>Build enough safety that the hard truths actually surface.</li>' +
      '<li>Look across cycles to catch recurring, structural problems.</li>' +
      '<li>Limit yourself to a few owned improvements that will stick.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Re-litigating scores instead of examining the process.</li>' +
      '<li>Staying surface-level so the real problems never come up.</li>' +
      '<li>Listing twenty improvements and acting on none.</li>' +
      '<li>Ignoring patterns that repeat cycle after cycle.</li>' +
      '</ul>' +
      '<p>Make every cycle better than the last. <a href="/l8">Run it in OrgTP</a> and carry your OKR process improvements straight into the next cycle.</p>',
    downloadMarkdown:
      '# OKR Quarterly Retrospective Template\n\n' +
      'Purpose: Reflect on the cycle, examine what helped and hurt OKR execution, spot patterns across cycles, and improve how the team sets and runs goals.\n\n' +
      '- Duration: 75 minutes\n' +
      '- Cadence: Quarterly (after grading, before planning)\n' +
      '- Participants: Team and objective owners (4-12 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Set the frame: process, not regrading (10 min)\n' +
      '- [ ] What helped (15 min)\n' +
      '- [ ] What hurt (15 min)\n' +
      '- [ ] Patterns over cycles (15 min)\n' +
      '- [ ] Process improvements with owners (15 min)\n' +
      '- [ ] Commit and close (5 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Keep the focus on process, not regrading.\n' +
      '- Build enough safety for hard truths.\n' +
      '- Look across cycles for structural problems.\n' +
      '- Limit yourself to a few owned improvements.\n\n' +
      '## Notes\n\n' +
      'What helped:\n\n' +
      'What hurt:\n\n' +
      'Patterns over cycles:\n\n' +
      'Process improvements and owners:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/okr-quarterly-retrospective\n',
  },
  {
    slug: 'okr-one-on-one',
    title: 'OKR 1:1 Check-in Template',
    shortName: 'OKR 1:1 Check-in',
    description:
      'Use this OKR 1:1 template for a focused manager and report conversation on individual objectives, progress, blockers, and the support needed to hit key results.',
    category: 'okr',
    methodology: 'OKR',
    minutes: 30,
    cadence: 'Biweekly',
    participants: 'Manager and direct report (2 people)',
    keywords: [
      'OKR 1:1 template',
      'OKR one on one agenda',
      'OKR template',
      'OKR check in meeting',
      'objectives and key results meeting',
      'manager OKR conversation',
      'okr planning agenda',
      'individual OKR review',
    ],
    steps: [
      { name: 'Open and connect', minutes: 5, text: 'Start human: a quick check on how the report is doing before turning to the objectives.' },
      { name: 'Progress on key results', minutes: 10, text: 'Walk the report individual key results, updating each metric and noting what is on or behind pace.' },
      { name: 'Blockers and support', minutes: 8, text: 'Identify what is in the way and what the manager can do to remove it, decide, or provide cover.' },
      { name: 'Alignment and priorities', minutes: 5, text: 'Confirm the report is focused on the right key results and that priorities still match the team objectives.' },
      { name: 'Commitments and follow-up', minutes: 2, text: 'Agree the next concrete steps for both people and confirm anything to revisit next time.' },
    ],
    bodyHtml:
      '<p>The <strong>OKR 1:1 check-in</strong> brings objectives and key results into the regular manager and report conversation. It keeps individual goals from drifting and gives the report a dedicated moment to ask for the support that actually moves a key result, rather than struggling quietly between cycles.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Fold this into an existing 1:1, typically weekly or biweekly. It does not replace team check-ins; it complements them by going deeper on one person individual objectives and the specific help they need. Use it whenever a report owns key results that deserve focused, private attention.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Just the manager and the direct report. The value is in the privacy: a report will often raise a struggling key result or a real blocker one-on-one that they would not surface in a group. Keep it a genuine conversation, not a status interrogation.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Open human before opening the spreadsheet, since a tense report gives you filtered answers. Walk their key results and update each honestly, then spend the core of the time on blockers and support, the part a manager is uniquely positioned to help with. Confirm they are focused on the right things and that priorities still match the team objectives. Close with clear commitments on both sides. The best OKR 1:1s feel like help, not inspection.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Connect as a person before reviewing numbers.</li>' +
      '<li>Treat blockers as your problem to help solve, not theirs to confess.</li>' +
      '<li>Check that effort matches the highest-priority key results.</li>' +
      '<li>Leave with commitments on both sides, not just the report side.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Running it as a status interrogation instead of a conversation.</li>' +
      '<li>Skipping support, so the report carries blockers alone.</li>' +
      '<li>Never checking that priorities still match the team objectives.</li>' +
      '<li>Ending with no commitment from the manager.</li>' +
      '</ul>' +
      '<p>Make goals part of every 1:1. <a href="/l8">Run it in OrgTP</a> and keep each report objectives, progress, and blockers in one shared view.</p>',
    downloadMarkdown:
      '# OKR 1:1 Check-in Template\n\n' +
      'Purpose: Hold a focused manager and report conversation on individual objectives, progress, blockers, and the support needed to hit key results.\n\n' +
      '- Duration: 30 minutes\n' +
      '- Cadence: Biweekly (or inside an existing 1:1)\n' +
      '- Participants: Manager and direct report (2 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Open and connect (5 min)\n' +
      '- [ ] Progress on individual key results (10 min)\n' +
      '- [ ] Blockers and support (8 min)\n' +
      '- [ ] Alignment and priorities (5 min)\n' +
      '- [ ] Commitments and follow-up (2 min)\n\n' +
      '## Questions\n\n' +
      '- How are you doing this week, beyond the OKRs?\n' +
      '- Which key result is most at risk, and why?\n' +
      '- What is blocking you that I can help remove?\n' +
      '- Are you focused on the highest-priority key results?\n' +
      '- What will each of us commit to before next time?\n\n' +
      '## Notes\n\n' +
      'Progress:\n\n' +
      'Blockers and support:\n\n' +
      'Commitments:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/okr-one-on-one\n',
  },
  {
    slug: 'okr-confidence-review',
    title: 'OKR Confidence Review Template',
    shortName: 'OKR Confidence Review',
    description:
      'Use this OKR confidence review template to rate confidence on each objective, read the health signal across the team, and act on at-risk goals before they slip.',
    category: 'okr',
    methodology: 'OKR',
    minutes: 30,
    cadence: 'Biweekly',
    participants: 'Objective owners and team leads (4-10 people)',
    keywords: [
      'OKR confidence review template',
      'OKR confidence check agenda',
      'OKR template',
      'OKR health signal',
      'objectives and key results meeting',
      'OKR confidence rating',
      'okr planning agenda',
      'OKR risk review meeting',
    ],
    steps: [
      { name: 'Confidence vote', minutes: 8, text: 'Each owner rates confidence on every objective, often on a simple scale such as red, amber, green or 1 to 10.' },
      { name: 'Read the signal', minutes: 7, text: 'Look across the votes for the health signal: which objectives are slipping, which are steady, and where confidence dropped since last time.' },
      { name: 'Diagnose the movers', minutes: 10, text: 'For any objective whose confidence fell, dig into why, separating a real problem from a temporary wobble.' },
      { name: 'Decide actions', minutes: 5, text: 'Agree what to do about the low-confidence objectives: add support, adjust scope, or escalate.' },
    ],
    bodyHtml:
      '<p>The <strong>OKR confidence review</strong> treats confidence as a leading indicator. Metrics tell you where a key result is now; confidence tells you where the owner believes it is heading. A falling confidence signal often warns of trouble weeks before the numbers do, which makes it one of the most useful health checks in the cycle.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run this on a regular beat, often biweekly, either on its own or attached to a check-in. It is most valuable in longer or higher-stakes cycles where catching a slip early is worth far more than discovering it at grading. Use it any time the team needs an honest early-warning read.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Bring the objective owners and the team leads who can act on a low signal, four to ten people. Owners must feel safe lowering their own confidence; if a drop is treated as an admission of failure, everyone reports green and the signal becomes worthless.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Have each owner rate confidence on every objective using a simple, consistent scale. Read the pattern across the team, paying closest attention to anything that fell since last time, since the change matters more than the absolute level. Diagnose the movers honestly, separating a genuine problem from a temporary wobble, then decide concrete actions for the low-confidence objectives. The whole point is to act on the signal early, while there is still time to change the outcome.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Use one consistent confidence scale so trends are comparable.</li>' +
      '<li>Watch the change in confidence, not just the current level.</li>' +
      '<li>Make it safe to lower a rating, or every signal turns green.</li>' +
      '<li>Always end with an action on the low-confidence objectives.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Punishing low confidence, so owners stop reporting it honestly.</li>' +
      '<li>Collecting the ratings but never acting on the signal.</li>' +
      '<li>Watching absolute levels while ignoring the drops.</li>' +
      '<li>Switching scales so the trend becomes meaningless.</li>' +
      '</ul>' +
      '<p>Catch the slip before the metric does. <a href="/l8">Run it in OrgTP</a> and keep confidence signals visible across every objective.</p>',
    downloadMarkdown:
      '# OKR Confidence Review Template\n\n' +
      'Purpose: Rate confidence on each objective, read the health signal across the team, and act on at-risk goals before the metrics slip.\n\n' +
      '- Duration: 30 minutes\n' +
      '- Cadence: Biweekly (or attached to a check-in)\n' +
      '- Participants: Objective owners and team leads (4-10 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Confidence vote on each objective (8 min)\n' +
      '- [ ] Read the signal and the changes (7 min)\n' +
      '- [ ] Diagnose the movers (10 min)\n' +
      '- [ ] Decide actions on low-confidence OKRs (5 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Use one consistent confidence scale.\n' +
      '- Watch the change, not just the level.\n' +
      '- Make it safe to lower a rating.\n' +
      '- Always end with an action.\n\n' +
      '## Notes\n\n' +
      'Confidence ratings:\n\n' +
      'Notable changes:\n\n' +
      'Diagnoses:\n\n' +
      'Actions and owners:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/okr-confidence-review\n',
  },
  {
    slug: 'okr-annual-planning',
    title: 'OKR Annual Planning Template',
    shortName: 'OKR Annual Planning',
    description:
      'Use this OKR annual planning template to set company-level annual objectives, define yearly key results, and create the frame that quarterly OKRs cascade from.',
    category: 'okr',
    methodology: 'OKR',
    minutes: 180,
    cadence: 'Annually',
    participants: 'Leadership team and key contributors (6-15 people)',
    keywords: [
      'OKR annual planning template',
      'annual OKR planning agenda',
      'OKR template',
      'company OKR planning',
      'objectives and key results meeting',
      'yearly OKR setting',
      'okr planning agenda',
      'annual objectives and key results',
    ],
    steps: [
      { name: 'Year in review', minutes: 25, text: 'Review last year annual OKRs, score the outcomes, and pull the lessons that should shape this year goals.' },
      { name: 'Strategy and direction', minutes: 30, text: 'Reconnect with vision and the strategic direction so annual objectives serve the bigger picture, not just the year.' },
      { name: 'Draft annual objectives', minutes: 40, text: 'Set a small number of ambitious company-level objectives that define what winning the year looks like.' },
      { name: 'Define annual key results', minutes: 45, text: 'Attach measurable yearly key results to each objective, confirming each is quantifiable and owned at the leadership level.' },
      { name: 'Plan the quarterly frame', minutes: 25, text: 'Sketch how the annual OKRs break into quarterly themes so teams have a frame to cascade from.' },
      { name: 'Owners, rhythm, and commit', minutes: 15, text: 'Assign an executive owner to each objective, confirm the review rhythm for the year, and commit the set.' },
    ],
    bodyHtml:
      '<p><strong>OKR annual planning</strong> sets the company-level objectives and key results that anchor the entire year. It is broader and more ambitious than a quarterly set: annual OKRs define what winning the year means, and every quarter cascades from that frame rather than starting from a blank page.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run this once a year, late in the current year or at the very start of the new one, so the company enters the year aligned. It pairs with quarterly OKR planning: the annual session sets direction and yearly key results, and each quarter executes and refines a portion of it.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Include the leadership team and key contributors who will own company-level objectives, six to fifteen people. The group must be senior enough to commit the organization and small enough to make real decisions. Detailed team and individual OKRs are cascaded afterward, not crowded into this room.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Begin with an honest review of last year OKRs, scoring the outcomes so lessons carry forward. Reconnect with strategy, then draft a small set of ambitious annual objectives and attach measurable yearly key results owned at the leadership level. Sketch how those break into quarterly themes so teams have something concrete to cascade from. Close by assigning executive owners and locking the review rhythm. An annual OKR set with no operating cadence quietly dissolves long before the year ends.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Score last year before drafting this year, so lessons transfer.</li>' +
      '<li>Keep annual objectives few and genuinely ambitious.</li>' +
      '<li>Write yearly key results as numbers owned at leadership level.</li>' +
      '<li>Leave a quarterly frame so teams can cascade cleanly.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Setting annual objectives with no path down to quarters.</li>' +
      '<li>Writing yearly key results that are tasks, not measures.</li>' +
      '<li>Skipping the prior-year review and repeating the same misses.</li>' +
      '<li>Locking the set with no review rhythm to keep it alive.</li>' +
      '</ul>' +
      '<p>Frame the whole year with clear objectives. <a href="/l8">Run it in OrgTP</a> and connect annual OKRs to quarterly themes and weekly execution.</p>',
    downloadMarkdown:
      '# OKR Annual Planning Template\n\n' +
      'Purpose: Set company-level annual objectives, define measurable yearly key results, and create the frame that quarterly OKRs cascade from.\n\n' +
      '- Duration: 180 minutes\n' +
      '- Cadence: Annually\n' +
      '- Participants: Leadership team and key contributors (6-15 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Year in review and scoring (25 min)\n' +
      '- [ ] Strategy and direction (30 min)\n' +
      '- [ ] Draft annual objectives (40 min)\n' +
      '- [ ] Define annual key results (45 min)\n' +
      '- [ ] Plan the quarterly frame (25 min)\n' +
      '- [ ] Owners, rhythm, and commit (15 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Score last year before drafting this year.\n' +
      '- Keep annual objectives few and ambitious.\n' +
      '- Write yearly key results as numbers.\n' +
      '- Leave a quarterly frame for cascading.\n\n' +
      '## Notes\n\n' +
      'Year in review:\n\n' +
      'Annual objectives:\n\n' +
      'Annual key results:\n\n' +
      'Quarterly frame, owners, and rhythm:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/okr-annual-planning\n',
  },
];
