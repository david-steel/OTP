// 4DX (The 4 Disciplines of Execution) meeting templates for the /templates library.
// AUTHORED content. bodyHtml renders via <%- %>. Byte-stable: no Date.now,
// no randomness. See _types.ts for the shared contract.
//
// Based on The 4 Disciplines of Execution by Chris McChesney, Sean Covey, and
// Jim Huling (FranklinCovey). Not affiliated with or endorsed by FranklinCovey.

import type { MeetingTemplate } from './_types.js';

export const FOUR_DX_TEMPLATES: MeetingTemplate[] = [
  {
    slug: '4dx-wig-session',
    title: '4DX WIG Session Template',
    shortName: '4DX WIG Session',
    description:
      'Use this 4DX WIG session template to run the weekly cadence of accountability: report on commitments, review the scoreboard, and make new lead measure commitments.',
    category: '4dx',
    methodology: '4DX',
    minutes: 25,
    cadence: 'Weekly (same time every week)',
    participants: 'Team and team leader (3-12 people)',
    keywords: [
      'WIG session template',
      '4dx meeting agenda',
      '4 disciplines of execution meeting',
      'cadence of accountability',
      'lead measures meeting',
      'WIG session agenda',
      'weekly accountability meeting template',
      'wildly important goal meeting',
    ],
    steps: [
      { name: 'Report on last week commitments', minutes: 8, text: 'Each person reports whether they kept the commitment they made last week and the impact it had on the lead measure.' },
      { name: 'Review the scoreboard', minutes: 7, text: 'Walk the compelling scoreboard, comparing lead and lag measures to target so the team sees plainly if it is winning or losing.' },
      { name: 'Clear the path and make new commitments', minutes: 10, text: 'Each person names one or two specific commitments for the coming week that will move a lead measure, and the team clears blockers.' },
    ],
    bodyHtml:
      '<p>The <strong>WIG session</strong> is the engine of 4DX. It is the short, weekly meeting where the team holds itself accountable for moving the Wildly Important Goal. It is not a status meeting and not a planning meeting. Its only job is to keep the team accountable to the commitments that drive the lead measures, week after week.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run the WIG session every week at the same day and time, without exception. Predictability is what makes the cadence of accountability work. Hold it whether the week was great or terrible, because the discipline of showing up is what compounds results over a quarter.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Only the people who own commitments on the WIG. Keep it to the team and its leader, three to twelve people. This is a working accountability session, not a broadcast, so guests and observers dilute the focus and slow the pace.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Follow the standard three-part flow and resist drift. First, every person reports on the commitment they made last week and whether it moved the lead measure. Second, review the scoreboard so the team sees at a glance whether it is winning. Third, make new commitments for the week ahead, each one specific, within the person control, and aimed at a lead measure. Keep the whole meeting under thirty minutes by parking off-WIG topics for another time.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Start and end on time every week so the cadence stays sacred.</li>' +
      '<li>Hold the line on the WIG. Whirlwind topics go to a separate meeting.</li>' +
      '<li>Require commitments that are specific and finishable in one week.</li>' +
      '<li>Let the team make its own commitments rather than assigning them.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Letting the session swell into a general status or whirlwind meeting.</li>' +
      '<li>Accepting vague commitments that no one can verify next week.</li>' +
      '<li>Skipping the scoreboard, so the team loses sight of winning or losing.</li>' +
      '<li>Moving the meeting time, which quietly breaks the cadence.</li>' +
      '</ul>' +
      '<p>Keep your team accountable to the goal that matters most. <a href="/l8">Run it in OrgTP</a> and keep commitments, lead measures, and the scoreboard visible every week.</p>',
    downloadMarkdown:
      '# 4DX WIG Session Template\n\n' +
      'Purpose: Run the weekly cadence of accountability for your Wildly Important Goal. Report on last week commitments, review the scoreboard, and make new lead measure commitments.\n\n' +
      '- Duration: 25 minutes\n' +
      '- Cadence: Weekly, same time every week\n' +
      '- Participants: Team and team leader (3-12 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Report on last week commitments and impact (8 min)\n' +
      '- [ ] Review the compelling scoreboard, lead and lag (7 min)\n' +
      '- [ ] Clear the path and make new commitments (10 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Start and end on time every single week.\n' +
      '- Hold the line on the WIG; park whirlwind topics.\n' +
      '- Require specific commitments finishable in one week.\n' +
      '- Let the team make its own commitments.\n\n' +
      '## Notes\n\n' +
      'Commitments kept:\n\n' +
      'Scoreboard status:\n\n' +
      'New commitments:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/4dx-wig-session\n',
  },
  {
    slug: '4dx-wig-planning-session',
    title: '4DX WIG Planning Session Template',
    shortName: '4DX WIG Planning Session',
    description:
      'Use this 4DX WIG planning session template to choose one Wildly Important Goal, define a clear from-to-by, and select the lead measures that will drive it.',
    category: '4dx',
    methodology: '4DX',
    minutes: 120,
    cadence: 'Quarterly',
    participants: 'Team and team leader (4-12 people)',
    keywords: [
      'WIG planning session template',
      '4dx meeting agenda',
      'wildly important goal planning',
      '4 disciplines of execution meeting',
      'lead measures meeting',
      'WIG planning template',
      'focus on the wildly important',
      'team goal setting meeting',
    ],
    steps: [
      { name: 'Recap strategy and the whirlwind', minutes: 15, text: 'Restate the organizational direction and acknowledge the day-job whirlwind the WIG must survive, so the goal is realistic and aligned.' },
      { name: 'Identify candidate WIGs', minutes: 25, text: 'Brainstorm the few battles that would make the biggest difference, focusing on impact rather than covering everything.' },
      { name: 'Choose one WIG and write from-to-by', minutes: 25, text: 'Select a single Wildly Important Goal and write it as from X to Y by when, with a measurable lag measure and deadline.' },
      { name: 'Identify lead measures', minutes: 30, text: 'Define the predictive, influenceable lead measures the team can act on each week to drive the lag measure.' },
      { name: 'Pressure-test and confirm', minutes: 15, text: 'Stress-test the WIG and lead measures for clarity, ownership, and whether weekly action on the leads will truly move the lag.' },
      { name: 'Plan the scoreboard and cadence', minutes: 10, text: 'Agree how the scoreboard will look and set the weekly WIG session day and time before anyone leaves.' },
    ],
    bodyHtml:
      '<p>The <strong>WIG planning session</strong> is where Discipline 1, focus on the Wildly Important, and Discipline 2, act on lead measures, get decided. The team narrows from many possible goals to a single Wildly Important Goal and picks the few lead measures that will actually drive it. Everything in 4DX flows from the decisions made here.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run this at the start of a planning cycle, usually quarterly, or whenever the team is launching a fresh WIG. It is also the right session to reset after a goal is achieved or after a strategy shift changes what the most important battle should be.</p>' +
      '<h2>Who attends</h2>' +
      '<p>The team that will execute the WIG plus its leader, four to twelve people. The people who will own the lead measures must be in the room, because commitment to a goal they helped set is far stronger than compliance with one handed down.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Ground the team in strategy and the reality of the whirlwind, then brainstorm candidate WIGs by impact, not coverage. Choose exactly one and write it in the from X to Y by when form so the finish line is unmistakable. Identify lead measures that are both predictive of the goal and influenceable by the team, then pressure-test the whole set. Close by sketching the scoreboard and locking the weekly cadence, so the plan walks straight into execution.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Insist on one WIG. Two competing WIGs usually means neither gets done.</li>' +
      '<li>Write the goal as from X to Y by when, never as a vague aspiration.</li>' +
      '<li>Test each lead measure: is it predictive and can the team influence it?</li>' +
      '<li>Leave with the weekly WIG session already on the calendar.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Choosing several WIGs, which scatters the team and the whirlwind wins.</li>' +
      '<li>Picking lag measures and calling them lead measures.</li>' +
      '<li>Writing a goal with no clear finish line or deadline.</li>' +
      '<li>Ending without a scoreboard plan or a locked weekly cadence.</li>' +
      '</ul>' +
      '<p>Set a goal the team can actually win. <a href="/l8">Run it in OrgTP</a> and keep the WIG, lead measures, and cadence connected from day one.</p>',
    downloadMarkdown:
      '# 4DX WIG Planning Session Template\n\n' +
      'Purpose: Choose one Wildly Important Goal, write it as a clear from-to-by, and select the predictive lead measures the team will act on each week.\n\n' +
      '- Duration: 120 minutes\n' +
      '- Cadence: Quarterly (or at the launch of a new WIG)\n' +
      '- Participants: Team and team leader (4-12 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Recap strategy and the whirlwind (15 min)\n' +
      '- [ ] Identify candidate WIGs by impact (25 min)\n' +
      '- [ ] Choose one WIG and write from-to-by (25 min)\n' +
      '- [ ] Identify predictive, influenceable lead measures (30 min)\n' +
      '- [ ] Pressure-test and confirm (15 min)\n' +
      '- [ ] Plan the scoreboard and lock the cadence (10 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Insist on a single WIG.\n' +
      '- Write the goal as from X to Y by when.\n' +
      '- Test each lead measure for predictiveness and influence.\n' +
      '- Lock the weekly WIG session before leaving.\n\n' +
      '## Notes\n\n' +
      'Chosen WIG (from X to Y by when):\n\n' +
      'Lead measures:\n\n' +
      'Scoreboard plan:\n\n' +
      'Weekly cadence (day and time):\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/4dx-wig-planning-session\n',
  },
  {
    slug: '4dx-scoreboard-review',
    title: '4DX Scoreboard Review Template',
    shortName: '4DX Scoreboard Review',
    description:
      'Use this 4DX scoreboard review template to keep a compelling scoreboard honest: update lead and lag measures, confirm clarity, and verify the team can see it winning.',
    category: '4dx',
    methodology: '4DX',
    minutes: 30,
    cadence: 'Weekly',
    participants: 'Team and WIG owner (3-10 people)',
    keywords: [
      '4dx scoreboard review template',
      'compelling scoreboard template',
      'lead and lag measures',
      '4 disciplines of execution meeting',
      'cadence of accountability',
      'scoreboard review agenda',
      'keep a compelling scoreboard',
    ],
    steps: [
      { name: 'Update lag measure', minutes: 7, text: 'Post the current lag measure against target so the team sees whether the Wildly Important Goal is on pace.' },
      { name: 'Update lead measures', minutes: 8, text: 'Update each lead measure for the week and compare actual activity against the weekly target that drives the lag.' },
      { name: 'Read the scoreboard out loud', minutes: 8, text: 'State plainly whether the team is winning or losing on each measure, since a scoreboard only works if everyone reads it the same way.' },
      { name: 'Fix gaps and ownership', minutes: 7, text: 'Repair any stale, confusing, or unowned data so the scoreboard stays a player-built, trusted source of truth.' },
    ],
    bodyHtml:
      '<p>The <strong>4DX scoreboard review</strong> protects Discipline 3, keep a compelling scoreboard. A scoreboard only changes behavior if it is current, simple, and tells the team at a glance whether it is winning. This short review keeps the lead and lag measures honest so the weekly WIG session can run on data people trust.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run this weekly, often just before or as part of the WIG session, to refresh the numbers. Use it also whenever the scoreboard has gone stale, become cluttered, or stopped being something the team actually looks at, which is the moment it has stopped working.</p>' +
      '<h2>Who attends</h2>' +
      '<p>The team and the WIG owner, three to ten people. A players-scoreboard belongs to the people doing the work, so the team that owns the measures should also own keeping the board current rather than handing that to an outside scorekeeper.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Update the lag measure first so the team sees the destination, then update each lead measure against its weekly target. Read the scoreboard out loud and state plainly whether the team is winning or losing, because ambiguity kills a scoreboard fast. Finish by fixing anything stale or confusing and confirming who keeps each number current. The goal is a board a player can read in five seconds and instantly know the score.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Keep it simple. If it takes more than five seconds to read, simplify it.</li>' +
      '<li>Show both lead and lag so the team sees cause and result.</li>' +
      '<li>Let the team build and own the scoreboard, not a manager alone.</li>' +
      '<li>Make winning and losing obvious at a single glance.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Building a scoreboard so detailed only the analyst understands it.</li>' +
      '<li>Tracking only the lag measure, so the team cannot act on it weekly.</li>' +
      '<li>Letting the board go stale until no one trusts or reads it.</li>' +
      '<li>Making it a management dashboard rather than a players-scoreboard.</li>' +
      '</ul>' +
      '<p>Give your team a scoreboard it wants to win. <a href="/l8">Run it in OrgTP</a> and keep lead and lag measures live and visible every week.</p>',
    downloadMarkdown:
      '# 4DX Scoreboard Review Template\n\n' +
      'Purpose: Keep a compelling scoreboard current and trusted. Update lead and lag measures, confirm clarity, and verify the team can see at a glance if it is winning.\n\n' +
      '- Duration: 30 minutes\n' +
      '- Cadence: Weekly\n' +
      '- Participants: Team and WIG owner (3-10 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Update the lag measure against target (7 min)\n' +
      '- [ ] Update each lead measure for the week (8 min)\n' +
      '- [ ] Read the scoreboard out loud: winning or losing (8 min)\n' +
      '- [ ] Fix gaps and confirm ownership (7 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Keep it readable in five seconds.\n' +
      '- Show both lead and lag measures.\n' +
      '- Let the team build and own the board.\n' +
      '- Make winning and losing obvious at a glance.\n\n' +
      '## Notes\n\n' +
      'Lag measure status:\n\n' +
      'Lead measure status:\n\n' +
      'Winning or losing:\n\n' +
      'Gaps and owners:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/4dx-scoreboard-review\n',
  },
  {
    slug: '4dx-lead-measure-workshop',
    title: '4DX Lead Measure Workshop Template',
    shortName: '4DX Lead Measure Workshop',
    description:
      'Use this 4DX lead measure workshop template to identify predictive, influenceable lead measures that drive your Wildly Important Goal and to set weekly targets.',
    category: '4dx',
    methodology: '4DX',
    minutes: 90,
    cadence: 'As needed',
    participants: 'Team and team leader (4-10 people)',
    keywords: [
      'lead measures meeting',
      '4dx lead measure workshop template',
      'act on lead measures',
      '4 disciplines of execution meeting',
      'predictive lead measure template',
      'lead measure workshop agenda',
      'wildly important goal meeting',
    ],
    steps: [
      { name: 'Restate the WIG and lag measure', minutes: 10, text: 'Confirm the Wildly Important Goal and its lag measure so every lead measure is judged against what it must move.' },
      { name: 'Brainstorm candidate lead measures', minutes: 25, text: 'Generate a wide list of activities the team could do weekly that might drive the lag measure.' },
      { name: 'Test for predictive and influenceable', minutes: 25, text: 'Filter candidates to those that are both predictive of the goal and within the team direct control to influence.' },
      { name: 'Choose two or three lead measures', minutes: 15, text: 'Narrow to the smallest set of high-leverage lead measures the team can realistically track and act on each week.' },
      { name: 'Set weekly targets and owners', minutes: 15, text: 'Define a concrete weekly target for each lead measure and confirm who owns acting on it.' },
    ],
    bodyHtml:
      '<p>The <strong>4DX lead measure workshop</strong> exists to nail Discipline 2, act on lead measures. Lag measures tell you whether you achieved the goal, but only after the fact. Lead measures are the few activities that predict the goal and that the team can directly influence each week. Choosing the right ones is the difference between a team that drives results and one that just watches them.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run this right after choosing a WIG, or whenever existing lead measures are not moving the lag measure as expected. It is a focused working session, used on demand rather than on a fixed schedule, to get the team acting on the right leverage points.</p>' +
      '<h2>Who attends</h2>' +
      '<p>The team that will execute the WIG plus its leader, four to ten people. The people closest to the work usually have the sharpest instinct for which activities actually move the goal, so their voices matter most in choosing the measures.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Start by restating the WIG and its lag measure so every candidate is judged against the right target. Brainstorm widely, then apply the two-part test: a real lead measure is both predictive of the goal and influenceable by the team. Narrow to two or three, because more than that fragments weekly focus. Finish by setting a concrete weekly target for each and naming who owns acting on it, so the leads are ready to drive the next WIG session.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Apply both tests to every candidate: predictive and influenceable.</li>' +
      '<li>Favor activities the team controls over outcomes it only hopes for.</li>' +
      '<li>Limit the team to two or three lead measures, not a long list.</li>' +
      '<li>Give each lead measure a number, so the weekly target is unambiguous.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Choosing lag measures dressed up as lead measures.</li>' +
      '<li>Picking activities the team cannot actually influence.</li>' +
      '<li>Tracking too many lead measures, so weekly action scatters.</li>' +
      '<li>Leaving without a numeric weekly target and a clear owner.</li>' +
      '</ul>' +
      '<p>Find the levers that actually move your goal. <a href="/l8">Run it in OrgTP</a> and keep your lead measures, targets, and owners visible week to week.</p>',
    downloadMarkdown:
      '# 4DX Lead Measure Workshop Template\n\n' +
      'Purpose: Identify the few lead measures that are predictive of your Wildly Important Goal and influenceable by the team, then set weekly targets and owners.\n\n' +
      '- Duration: 90 minutes\n' +
      '- Cadence: As needed\n' +
      '- Participants: Team and team leader (4-10 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Restate the WIG and lag measure (10 min)\n' +
      '- [ ] Brainstorm candidate lead measures (25 min)\n' +
      '- [ ] Test for predictive and influenceable (25 min)\n' +
      '- [ ] Choose two or three lead measures (15 min)\n' +
      '- [ ] Set weekly targets and owners (15 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Apply both tests: predictive and influenceable.\n' +
      '- Favor activities the team controls.\n' +
      '- Limit to two or three lead measures.\n' +
      '- Give each lead measure a numeric weekly target.\n\n' +
      '## Notes\n\n' +
      'WIG and lag measure:\n\n' +
      'Chosen lead measures:\n\n' +
      'Weekly targets:\n\n' +
      'Owners:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/4dx-lead-measure-workshop\n',
  },
  {
    slug: '4dx-quarterly-wig-review',
    title: '4DX Quarterly WIG Review Template',
    shortName: '4DX Quarterly WIG Review',
    description:
      'Use this 4DX quarterly WIG review template to assess your Wildly Important Goal against its lag measure, capture lessons, and decide whether to renew or set a new WIG.',
    category: '4dx',
    methodology: '4DX',
    minutes: 90,
    cadence: 'Quarterly',
    participants: 'Team and team leader (4-12 people)',
    keywords: [
      '4dx quarterly WIG review template',
      'wildly important goal review',
      '4 disciplines of execution meeting',
      'lead measures meeting',
      'quarterly WIG review agenda',
      'cadence of accountability',
      'WIG retrospective template',
    ],
    steps: [
      { name: 'Score the WIG against the lag measure', minutes: 20, text: 'Compare the final lag measure to the from-to-by target and state plainly whether the WIG was achieved.' },
      { name: 'Review lead measure performance', minutes: 20, text: 'Examine how consistently the team hit weekly lead measure targets and how that tracked against the lag result.' },
      { name: 'Capture lessons and patterns', minutes: 20, text: 'Discuss what drove the result, including the strength of the cadence, the scoreboard, and the commitment quality.' },
      { name: 'Decide renew, replace, or retire', minutes: 20, text: 'Decide whether to keep the WIG, set a sharper one, or retire it because the battle is won.' },
      { name: 'Reset cadence and scoreboard', minutes: 10, text: 'Confirm the WIG session cadence and refresh the scoreboard for the quarter ahead before anyone leaves.' },
    ],
    bodyHtml:
      '<p>The <strong>4DX quarterly WIG review</strong> closes one cycle of execution and opens the next. It asks the hard question directly: did we move the lag measure, and did our lead measures and cadence actually drive it? The review turns a quarter of weekly WIG sessions into lessons that make the next quarter sharper.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run this at the end of each quarter or whenever a WIG reaches its deadline. It pairs naturally with the WIG planning session: the review judges the cycle that is ending, and planning sets the one beginning. Hold it before momentum from the quarter fades.</p>' +
      '<h2>Who attends</h2>' +
      '<p>The team that executed the WIG plus its leader, four to twelve people. The people who lived the cadence have the clearest view of what worked and what slipped, so their honest read matters more than a polished summary from the top.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Score the WIG bluntly against its from-to-by target, then look at whether the team actually hit its weekly lead measures and how closely that tracked the lag result. Spend real time on lessons, including whether the cadence held, whether the scoreboard stayed compelling, and whether commitments were specific enough. Then decide: renew the WIG, replace it with a sharper one, or retire it as won. Close by resetting the cadence and scoreboard so the next quarter starts clean.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Score the lag measure honestly before discussing why.</li>' +
      '<li>Connect lead measure consistency to the lag result, not just effort.</li>' +
      '<li>Treat a missed WIG as data about the system, not blame for people.</li>' +
      '<li>Leave with a clear decision and a reset cadence.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Celebrating activity while quietly missing the lag measure.</li>' +
      '<li>Skipping the link between lead measure discipline and the result.</li>' +
      '<li>Reviewing the quarter but never deciding what happens next.</li>' +
      '<li>Letting the cadence lapse in the gap between cycles.</li>' +
      '</ul>' +
      '<p>Turn a quarter of execution into a sharper next one. <a href="/l8">Run it in OrgTP</a> and carry lessons, decisions, and cadence straight into your next WIG.</p>',
    downloadMarkdown:
      '# 4DX Quarterly WIG Review Template\n\n' +
      'Purpose: Assess the Wildly Important Goal against its lag measure, review lead measure discipline, capture lessons, and decide whether to renew, replace, or retire the WIG.\n\n' +
      '- Duration: 90 minutes\n' +
      '- Cadence: Quarterly\n' +
      '- Participants: Team and team leader (4-12 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Score the WIG against the lag measure (20 min)\n' +
      '- [ ] Review lead measure performance (20 min)\n' +
      '- [ ] Capture lessons and patterns (20 min)\n' +
      '- [ ] Decide renew, replace, or retire (20 min)\n' +
      '- [ ] Reset cadence and scoreboard (10 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Score the lag measure honestly first.\n' +
      '- Connect lead measure consistency to the result.\n' +
      '- Treat a missed WIG as system data, not blame.\n' +
      '- Leave with a clear decision and reset cadence.\n\n' +
      '## Notes\n\n' +
      'WIG score vs lag measure:\n\n' +
      'Lead measure performance:\n\n' +
      'Lessons:\n\n' +
      'Decision and next cadence:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/4dx-quarterly-wig-review\n',
  },
  {
    slug: '4dx-kickoff-meeting',
    title: '4DX Launch Kickoff Meeting Template',
    shortName: '4DX Launch Kickoff Meeting',
    description:
      'Use this 4DX launch kickoff template to introduce the 4 Disciplines of Execution, reveal the WIG and scoreboard, and start the cadence of accountability with the team.',
    category: '4dx',
    methodology: '4DX',
    minutes: 90,
    cadence: 'As needed',
    participants: 'Full team and team leader (5-20 people)',
    keywords: [
      '4dx kickoff meeting template',
      '4 disciplines of execution meeting',
      '4dx launch agenda',
      'WIG launch meeting',
      'cadence of accountability',
      'lead measures meeting',
      'execution kickoff template',
    ],
    steps: [
      { name: 'Why this WIG matters', minutes: 15, text: 'Open with the case for change: why this Wildly Important Goal matters now and what winning it makes possible.' },
      { name: 'Teach the four disciplines', minutes: 20, text: 'Walk the team through focus on the WIG, act on lead measures, keep a compelling scoreboard, and the cadence of accountability.' },
      { name: 'Reveal the WIG and lead measures', minutes: 20, text: 'Present the WIG as from X to Y by when and the lead measures the team will act on each week.' },
      { name: 'Unveil the scoreboard', minutes: 15, text: 'Show the players-scoreboard and confirm the team can read winning or losing at a glance.' },
      { name: 'Establish the cadence and first commitments', minutes: 15, text: 'Set the weekly WIG session day and time and have the team make its first commitments to start the engagement.' },
      { name: 'Questions and engagement', minutes: 5, text: 'Answer questions and confirm everyone understands their role in moving the goal.' },
    ],
    bodyHtml:
      '<p>The <strong>4DX launch kickoff meeting</strong> is where execution begins. It introduces the team to the four disciplines, reveals the Wildly Important Goal and lead measures, unveils the scoreboard, and starts the cadence of accountability. A strong launch turns a strategy on paper into a team that knows the game and wants to win it.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Hold the kickoff at the start of a 4DX implementation or the launch of a new WIG, after the WIG and lead measures have been chosen in planning. It is the moment to move from leadership decisions to whole-team engagement, so run it once the plan is solid enough to commit to.</p>' +
      '<h2>Who attends</h2>' +
      '<p>The full team that will execute the WIG plus its leader, five to twenty people. Unlike the weekly WIG session, the kickoff is meant to be inclusive, because engagement starts when everyone understands the goal, the rules, and their part in the result.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Open with why the WIG matters, since people commit to goals they believe in. Teach the four disciplines plainly so the team understands the system it is about to run. Reveal the WIG in from-to-by form and the lead measures, then unveil the scoreboard and confirm it reads in seconds. Lock the weekly cadence and have the team make its first commitments in the room, so the engagement starts immediately rather than next week.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Lead with purpose, not mechanics, so the team buys in first.</li>' +
      '<li>Keep the teaching simple. The disciplines should feel doable, not academic.</li>' +
      '<li>Make the first commitments real and made by the team, not assigned.</li>' +
      '<li>Lock the weekly WIG session time before the room empties.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Announcing the WIG without making the case for why it matters.</li>' +
      '<li>Overloading the launch with theory instead of starting the cadence.</li>' +
      '<li>Showing a scoreboard the team had no hand in shaping.</li>' +
      '<li>Ending without first commitments or a locked weekly session.</li>' +
      '</ul>' +
      '<p>Launch your WIG with a team that is bought in. <a href="/l8">Run it in OrgTP</a> and keep the goal, lead measures, scoreboard, and cadence in one place from launch day.</p>',
    downloadMarkdown:
      '# 4DX Launch Kickoff Meeting Template\n\n' +
      'Purpose: Introduce the 4 Disciplines of Execution, reveal the WIG and lead measures, unveil the scoreboard, and start the cadence of accountability with the full team.\n\n' +
      '- Duration: 90 minutes\n' +
      '- Cadence: As needed (at 4DX or WIG launch)\n' +
      '- Participants: Full team and team leader (5-20 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Why this WIG matters (15 min)\n' +
      '- [ ] Teach the four disciplines (20 min)\n' +
      '- [ ] Reveal the WIG and lead measures (20 min)\n' +
      '- [ ] Unveil the scoreboard (15 min)\n' +
      '- [ ] Establish cadence and first commitments (15 min)\n' +
      '- [ ] Questions and engagement (5 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Lead with purpose, not mechanics.\n' +
      '- Keep the teaching simple and doable.\n' +
      '- Make first commitments real and team-made.\n' +
      '- Lock the weekly WIG session time.\n\n' +
      '## Notes\n\n' +
      'The WIG (from X to Y by when):\n\n' +
      'Lead measures:\n\n' +
      'First commitments:\n\n' +
      'Weekly cadence (day and time):\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/4dx-kickoff-meeting\n',
  },
  {
    slug: '4dx-cadence-of-accountability',
    title: '4DX Cadence of Accountability Meeting Template',
    shortName: '4DX Cadence of Accountability Meeting',
    description:
      'Use this 4DX cadence of accountability template to run the weekly rhythm that drives the WIG: account for commitments, review the scoreboard, and commit again.',
    category: '4dx',
    methodology: '4DX',
    minutes: 25,
    cadence: 'Weekly (same time every week)',
    participants: 'Team and team leader (3-12 people)',
    keywords: [
      'cadence of accountability',
      '4dx meeting agenda',
      '4 disciplines of execution meeting',
      'WIG session template',
      'lead measures meeting',
      'cadence of accountability template',
      'weekly accountability meeting',
    ],
    steps: [
      { name: 'Account for last week commitments', minutes: 8, text: 'Each person accounts for the commitment they made last week and its effect on the lead measure, with no excuses culture.' },
      { name: 'Review the scoreboard', minutes: 7, text: 'Check lead and lag measures on the compelling scoreboard so the team knows whether it is winning the WIG.' },
      { name: 'Make new commitments', minutes: 10, text: 'Each person commits to one or two high-leverage actions for the coming week and the team helps clear blockers.' },
    ],
    bodyHtml:
      '<p>The <strong>cadence of accountability</strong> is Discipline 4, the rhythm that holds the other three together. It is a recurring weekly meeting where the team accounts to one another for moving the lead measures. Without this cadence, even a great WIG and a clear scoreboard fade under the daily whirlwind. The cadence is what makes execution stick.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run it every week at a fixed time for as long as the WIG is active. Consistency is the whole point: the same day, the same time, the same simple format. The power comes not from any single meeting but from the unbroken rhythm of them over a quarter.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Only the team members who own commitments on the WIG, plus the leader, three to twelve people. This is a peer accountability session. The team accounts to each other, not just up to a manager, which is what gives the cadence its energy.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Keep the format identical every week so it becomes second nature. Each person accounts for last week commitment and its impact, the team reviews the scoreboard to confirm winning or losing, and then each person makes a new commitment for the week ahead. Keep it short and protect it from whirlwind topics. The discipline is in the repetition, so never let the meeting sprawl or slip.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Run the exact same format every week so it becomes a habit.</li>' +
      '<li>Hold people accountable with respect, not blame, when they miss.</li>' +
      '<li>Keep commitments high-leverage and within each person control.</li>' +
      '<li>Protect the cadence from the whirlwind that always wants in.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Skipping weeks, which breaks the rhythm that makes it work.</li>' +
      '<li>Letting it become a top-down status report instead of peer accountability.</li>' +
      '<li>Allowing whirlwind issues to crowd out the WIG.</li>' +
      '<li>Tolerating missed commitments with no honest accounting.</li>' +
      '</ul>' +
      '<p>Build the rhythm that makes goals stick. <a href="/l8">Run it in OrgTP</a> and keep commitments, the scoreboard, and accountability live every week.</p>',
    downloadMarkdown:
      '# 4DX Cadence of Accountability Meeting Template\n\n' +
      'Purpose: Run the weekly rhythm that drives the WIG. Account for last week commitments, review the scoreboard, and make new high-leverage commitments.\n\n' +
      '- Duration: 25 minutes\n' +
      '- Cadence: Weekly, same time every week\n' +
      '- Participants: Team and team leader (3-12 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Account for last week commitments (8 min)\n' +
      '- [ ] Review the scoreboard, lead and lag (7 min)\n' +
      '- [ ] Make new commitments and clear blockers (10 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Run the exact same format every week.\n' +
      '- Hold accountability with respect, not blame.\n' +
      '- Keep commitments high-leverage and controllable.\n' +
      '- Protect the cadence from the whirlwind.\n\n' +
      '## Notes\n\n' +
      'Commitments accounted for:\n\n' +
      'Scoreboard status:\n\n' +
      'New commitments:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/4dx-cadence-of-accountability\n',
  },
  {
    slug: '4dx-team-commitments-meeting',
    title: '4DX Team Commitments Meeting Template',
    shortName: '4DX Team Commitments Meeting',
    description:
      'Use this 4DX team commitments template to make and account for weekly commitments that move lead measures, clear blockers, and keep the WIG on pace.',
    category: '4dx',
    methodology: '4DX',
    minutes: 30,
    cadence: 'Weekly',
    participants: 'Team and team leader (3-12 people)',
    keywords: [
      '4dx team commitments template',
      'weekly commitments meeting',
      '4 disciplines of execution meeting',
      'lead measures meeting',
      'cadence of accountability',
      'team commitments agenda',
      'WIG commitments template',
    ],
    steps: [
      { name: 'Account for last week commitments', minutes: 8, text: 'Each person reports whether the commitment they made was kept and how it affected the lead measure.' },
      { name: 'Scoreboard check', minutes: 6, text: 'Glance at the scoreboard to ground new commitments in whether the team is currently winning or losing.' },
      { name: 'Surface blockers and help needed', minutes: 6, text: 'Name anything blocking lead measure progress and decide who clears it, so commitments are not made into a wall.' },
      { name: 'Make new weekly commitments', minutes: 8, text: 'Each person commits to one or two specific actions that will most move a lead measure this week.' },
      { name: 'Confirm and close', minutes: 2, text: 'Read the commitments back so every person leaves clear on exactly what they owe by next week.' },
    ],
    bodyHtml:
      '<p>The <strong>4DX team commitments meeting</strong> puts the weekly commitment loop at the center. Commitments are the lever of the cadence of accountability: each week every person promises a specific action that will move a lead measure, then accounts for it the following week. This meeting makes those commitments deliberate rather than an afterthought.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run it weekly as part of or alongside the WIG session, especially when a team is new to 4DX and the discipline of making sharp commitments is still forming. It is also useful when commitments have grown vague and the team needs to reset the quality of what it promises.</p>' +
      '<h2>Who attends</h2>' +
      '<p>The team members who own lead measure work plus the leader, three to twelve people. Everyone present makes a commitment, because the strength of the cadence comes from each person owning a personal, specific promise rather than a shared and diffuse one.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Account for last week commitments first, then glance at the scoreboard so new commitments are grounded in reality. Surface blockers and assign who clears them, so people are not committing into a wall. Then make new commitments, each one specific, high-leverage, and within the person own control. Close by reading the commitments back so no one leaves unsure of what they owe. The quality of these commitments is what makes or breaks the week.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Push for specific commitments, not general intentions to try harder.</li>' +
      '<li>Make sure each commitment clearly targets a lead measure.</li>' +
      '<li>Clear blockers in the meeting so commitments are achievable.</li>' +
      '<li>Read commitments back so everyone leaves with the same picture.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Accepting vague commitments no one can hold the next week.</li>' +
      '<li>Making commitments that do not actually move a lead measure.</li>' +
      '<li>Ignoring blockers, so people commit to work they cannot finish.</li>' +
      '<li>Leaving without confirming who owes what by when.</li>' +
      '</ul>' +
      '<p>Make commitments that actually move the goal. <a href="/l8">Run it in OrgTP</a> and keep weekly commitments, lead measures, and accountability connected.</p>',
    downloadMarkdown:
      '# 4DX Team Commitments Meeting Template\n\n' +
      'Purpose: Make and account for sharp weekly commitments that move lead measures, clear blockers, and keep the Wildly Important Goal on pace.\n\n' +
      '- Duration: 30 minutes\n' +
      '- Cadence: Weekly\n' +
      '- Participants: Team and team leader (3-12 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Account for last week commitments (8 min)\n' +
      '- [ ] Scoreboard check (6 min)\n' +
      '- [ ] Surface blockers and help needed (6 min)\n' +
      '- [ ] Make new weekly commitments (8 min)\n' +
      '- [ ] Confirm and close (2 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Push for specific commitments, not intentions.\n' +
      '- Ensure each commitment targets a lead measure.\n' +
      '- Clear blockers so commitments are achievable.\n' +
      '- Read commitments back before closing.\n\n' +
      '## Notes\n\n' +
      'Commitments accounted for:\n\n' +
      'Scoreboard status:\n\n' +
      'Blockers and owners:\n\n' +
      'New commitments:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/4dx-team-commitments-meeting\n',
  },
  {
    slug: '4dx-monthly-review',
    title: '4DX Monthly Review Template',
    shortName: '4DX Monthly Review',
    description:
      'Use this 4DX monthly review template to step back from the weekly cadence, assess WIG trajectory, check lead measure discipline, and adjust before the quarter ends.',
    category: '4dx',
    methodology: '4DX',
    minutes: 60,
    cadence: 'Monthly',
    participants: 'Team and team leader (4-12 people)',
    keywords: [
      '4dx monthly review template',
      'wildly important goal review',
      '4 disciplines of execution meeting',
      'lead measures meeting',
      'monthly WIG review agenda',
      'cadence of accountability',
      'WIG progress review template',
    ],
    steps: [
      { name: 'WIG trajectory check', minutes: 15, text: 'Look at the lag measure trend across the month and judge whether the WIG is on pace to hit its from-to-by target.' },
      { name: 'Lead measure consistency', minutes: 15, text: 'Assess how reliably the team hit weekly lead measure targets and where consistency slipped.' },
      { name: 'Cadence and scoreboard health', minutes: 15, text: 'Review whether the weekly WIG session held every week and whether the scoreboard stayed current and compelling.' },
      { name: 'Adjust and recommit', minutes: 15, text: 'Decide any adjustments to lead measures, targets, or process and recommit to the cadence for the month ahead.' },
    ],
    bodyHtml:
      '<p>The <strong>4DX monthly review</strong> is the mid-altitude check between the weekly WIG session and the quarterly review. It steps back far enough to see the trend without losing the discipline of the cadence. The goal is to catch drift early, while there is still a month or two left to course-correct before the quarter closes.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run it once a month during an active WIG cycle, in addition to the weekly cadence. It is most valuable mid-quarter, when a string of weekly sessions has produced a trend worth reading but there is still time to adjust the approach and recover the goal.</p>' +
      '<h2>Who attends</h2>' +
      '<p>The team executing the WIG plus its leader, four to twelve people. The same people who run the weekly cadence should attend, since they hold the context to judge whether the month moved the goal and whether the process is holding up.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Open with the lag measure trend across the month so the team sees trajectory, not just a single week. Examine lead measure consistency, because a strong month of weekly targets should predict a healthy lag, and a gap between them is a signal. Check the health of the cadence and scoreboard themselves, then decide any adjustments and recommit to the rhythm. The point is a small course-correction now rather than a painful surprise at quarter end.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Read the trend across weeks, not just the latest number.</li>' +
      '<li>Compare lead measure consistency against the lag result.</li>' +
      '<li>Audit the cadence and scoreboard themselves, not only the metrics.</li>' +
      '<li>Make adjustments small and specific, then recommit to the rhythm.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Turning the monthly review into a second, longer status meeting.</li>' +
      '<li>Reacting to one weak week instead of reading the trend.</li>' +
      '<li>Ignoring whether the cadence and scoreboard are actually healthy.</li>' +
      '<li>Spotting drift but never adjusting before the quarter ends.</li>' +
      '</ul>' +
      '<p>Catch drift before it costs you the quarter. <a href="/l8">Run it in OrgTP</a> and keep WIG trends, lead measures, and cadence health visible month to month.</p>',
    downloadMarkdown:
      '# 4DX Monthly Review Template\n\n' +
      'Purpose: Step back from the weekly cadence to read the WIG trajectory, check lead measure consistency, audit cadence and scoreboard health, and adjust mid-quarter.\n\n' +
      '- Duration: 60 minutes\n' +
      '- Cadence: Monthly\n' +
      '- Participants: Team and team leader (4-12 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] WIG trajectory check against the lag measure (15 min)\n' +
      '- [ ] Lead measure consistency (15 min)\n' +
      '- [ ] Cadence and scoreboard health (15 min)\n' +
      '- [ ] Adjust and recommit (15 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Read the trend across weeks, not one number.\n' +
      '- Compare lead measure consistency to the lag result.\n' +
      '- Audit the cadence and scoreboard themselves.\n' +
      '- Keep adjustments small and recommit to the rhythm.\n\n' +
      '## Notes\n\n' +
      'WIG trajectory:\n\n' +
      'Lead measure consistency:\n\n' +
      'Cadence and scoreboard health:\n\n' +
      'Adjustments:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/4dx-monthly-review\n',
  },
  {
    slug: '4dx-wig-workshop',
    title: '4DX Wildly Important Goal Workshop Template',
    shortName: '4DX Wildly Important Goal Workshop',
    description:
      'Use this 4DX WIG workshop template to escape the whirlwind, choose the one Wildly Important Goal that matters most, and write it as a clear measurable from-to-by.',
    category: '4dx',
    methodology: '4DX',
    minutes: 90,
    cadence: 'As needed',
    participants: 'Team and team leader (4-12 people)',
    keywords: [
      'wildly important goal workshop',
      'WIG workshop template',
      'focus on the wildly important',
      '4 disciplines of execution meeting',
      '4dx meeting agenda',
      'WIG selection template',
      'goal setting workshop agenda',
    ],
    steps: [
      { name: 'Name the whirlwind', minutes: 15, text: 'List the day-job demands that consume the team energy, so the WIG is chosen with eyes open about what competes for attention.' },
      { name: 'Brainstorm what matters most', minutes: 20, text: 'Generate the goals that would make the biggest difference if achieved, ignoring what is merely urgent.' },
      { name: 'Narrow to candidate WIGs', minutes: 20, text: 'Apply the test of greatest impact and filter the list down to a short slate of candidate WIGs.' },
      { name: 'Choose the one WIG', minutes: 20, text: 'Decide on a single Wildly Important Goal, accepting that focus means saying no to good options.' },
      { name: 'Write the from-to-by', minutes: 15, text: 'Phrase the WIG as from X to Y by when, with a measurable lag measure and a firm deadline.' },
    ],
    bodyHtml:
      '<p>The <strong>Wildly Important Goal workshop</strong> is dedicated to Discipline 1: focus on the Wildly Important. Most teams fail at execution not from lack of effort but from too many goals. This workshop forces the hard, narrowing decision down to the single goal that matters most and writes it so clearly that everyone knows exactly what winning looks like.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run it whenever a team needs to choose or sharpen its WIG, often as the first step of a 4DX launch or at the start of a new cycle. It is also the right session when a team is busy but adrift, working hard on many things while moving nothing that truly matters.</p>' +
      '<h2>Who attends</h2>' +
      '<p>The team that will pursue the goal plus its leader, four to twelve people. Including the team in the choice builds the ownership that the cadence later depends on. A WIG chosen with the team is committed to; a WIG announced to the team is merely complied with.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Start by naming the whirlwind out loud, because the WIG must survive the day job. Brainstorm what would matter most if achieved, then narrow ruthlessly using the test of greatest impact. Make the hard choice of one goal, accepting that focus means saying no to genuinely good options. Finish by writing the WIG as from X to Y by when, with a measurable lag and a real deadline, so there is no ambiguity about the finish line.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Force the decision to a single WIG, even when it is uncomfortable.</li>' +
      '<li>Separate what is wildly important from what is merely urgent.</li>' +
      '<li>Always land on a from X to Y by when with a measurable lag.</li>' +
      '<li>Let the team help choose, so ownership is real from the start.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Refusing to narrow, so the team leaves with several priorities.</li>' +
      '<li>Confusing urgent whirlwind items with the wildly important.</li>' +
      '<li>Writing a fuzzy goal with no measure or deadline.</li>' +
      '<li>Choosing the WIG in isolation, which starves later ownership.</li>' +
      '</ul>' +
      '<p>Pick the one goal that changes everything. <a href="/l8">Run it in OrgTP</a> and carry your WIG into lead measures, a scoreboard, and a weekly cadence.</p>',
    downloadMarkdown:
      '# 4DX Wildly Important Goal Workshop Template\n\n' +
      'Purpose: Escape the whirlwind, choose the single Wildly Important Goal that matters most, and write it as a clear, measurable from-to-by with a firm deadline.\n\n' +
      '- Duration: 90 minutes\n' +
      '- Cadence: As needed\n' +
      '- Participants: Team and team leader (4-12 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Name the whirlwind (15 min)\n' +
      '- [ ] Brainstorm what matters most (20 min)\n' +
      '- [ ] Narrow to candidate WIGs by impact (20 min)\n' +
      '- [ ] Choose the one WIG (20 min)\n' +
      '- [ ] Write the from-to-by (15 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Force the decision to a single WIG.\n' +
      '- Separate wildly important from merely urgent.\n' +
      '- Land on a from X to Y by when with a measurable lag.\n' +
      '- Let the team help choose for real ownership.\n\n' +
      '## Notes\n\n' +
      'The whirlwind:\n\n' +
      'Candidate WIGs:\n\n' +
      'Chosen WIG (from X to Y by when):\n\n' +
      'Lag measure and deadline:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/4dx-wig-workshop\n',
  },
];
