// Metronomics meeting templates for the /templates library.
// AUTHORED content. bodyHtml renders via <%- %>. Byte-stable: no Date.now,
// no randomness. See _types.ts for the shared contract.
//
// Based on the Metronomics growth system by Shannon Susko, author of
// Metronomics and The 3HAG WAY. OrgTP is not affiliated with or endorsed
// by Shannon Susko or Metronome United.

import type { MeetingTemplate } from './_types.js';

export const METRONOMICS_TEMPLATES: MeetingTemplate[] = [
  {
    slug: 'metronomics-daily-huddle',
    title: 'Metronomics Daily Huddle Template',
    shortName: 'Metronomics Daily Huddle',
    description:
      'Use this Metronomics daily huddle template to sync the team in 15 minutes, surface stucks, and keep the coaching rhythm moving toward your 3HAG every day.',
    category: 'metronomics',
    methodology: 'Metronomics',
    minutes: 15,
    cadence: 'Daily',
    participants: 'Team or pod (3-12 people)',
    keywords: [
      'metronomics daily huddle template',
      'metronomics meeting',
      'daily huddle agenda',
      'shannon susko meeting rhythm',
      'metronomics daily huddle agenda',
      'daily standup template',
      'team huddle template',
      'metronomics rhythm meeting',
    ],
    steps: [
      { name: 'On the rocks', minutes: 4, text: 'Each person shares one quick update on their daily progress and what they are focused on right now.' },
      { name: 'Daily metric or number', minutes: 4, text: 'Review the one or two numbers the team watches daily so everyone sees the same reality at the same time.' },
      { name: 'Stucks and help', minutes: 5, text: 'Name anything blocking progress and decide who helps clear it, taking the detail offline after the huddle.' },
      { name: 'Cascading messages', minutes: 2, text: 'Share any message that needs to move up or down the rhythm so nothing important gets lost between teams.' },
    ],
    bodyHtml:
      '<p>The <strong>Metronomics daily huddle</strong> is the fastest beat in the coaching rhythm. Based on the Metronomics system by Shannon Susko, it gives a team a quick, standing sync to share progress, look at the daily number, and surface stucks before they become blockers. Fifteen minutes, same time, every day.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run this every working day at a fixed time. It is the daily layer that keeps weekly, monthly, and quarterly commitments alive between bigger meetings. Teams new to a rhythm often start here because the daily huddle builds the discipline the rest of the system depends on.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Keep it to a single team or pod of three to twelve people who work toward shared outcomes. Larger groups should run their own huddles and cascade messages up and down. This is a working sync, not a status broadcast for spectators.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Stand up if you can, since posture protects the timebox. Move fast through quick progress updates, glance at the daily number so everyone shares one view of reality, then spend the bulk of the time naming stucks and assigning help. Capture any cascading message that needs to travel between teams, and end on time. The huddle exists to unblock, not to solve, so push real problem solving to a follow-up.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Protect the 15-minute box. The clock is the discipline.</li>' +
      '<li>Surface stucks, then take the fix offline with just the people involved.</li>' +
      '<li>Keep the daily number visible so the sync is grounded in data.</li>' +
      '<li>Run it at the same time daily so it becomes a reliable beat.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Letting the huddle drift into long problem solving the whole team sits through.</li>' +
      '<li>Skipping it on busy days, which quietly breaks the rhythm.</li>' +
      '<li>Reporting activity instead of naming what is actually stuck.</li>' +
      '<li>Forgetting to cascade messages, so teams fall out of sync.</li>' +
      '</ul>' +
      '<p>Build the daily beat your rhythm depends on. <a href="/l8">Run it in OrgTP</a> and keep daily numbers, stucks, and cascading messages in one place.</p>',
    downloadMarkdown:
      '# Metronomics Daily Huddle Template\n\n' +
      'Purpose: Sync the team in 15 minutes each day, review the daily number, surface stucks, and keep the Metronomics coaching rhythm moving toward the 3HAG.\n\n' +
      '- Duration: 15 minutes\n' +
      '- Cadence: Daily\n' +
      '- Participants: Team or pod (3-12 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] On the rocks: quick progress updates (4 min)\n' +
      '- [ ] Daily metric or number (4 min)\n' +
      '- [ ] Stucks and help needed (5 min)\n' +
      '- [ ] Cascading messages (2 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Protect the 15-minute box.\n' +
      '- Surface stucks, then take the fix offline.\n' +
      '- Keep the daily number visible.\n' +
      '- Run it at the same time every day.\n\n' +
      '## Notes\n\n' +
      'Progress updates:\n\n' +
      'Daily number:\n\n' +
      'Stucks and owners:\n\n' +
      'Cascading messages:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/metronomics-daily-huddle\n',
  },
  {
    slug: 'metronomics-weekly-adjust-meeting',
    title: 'Metronomics Weekly Adjust Meeting Template',
    shortName: 'Metronomics Weekly Adjust Meeting',
    description:
      'Use this Metronomics weekly adjust meeting template to review weekly metrics, work the stuck list, and adjust execution to keep quarterly priorities on pace.',
    category: 'metronomics',
    methodology: 'Metronomics',
    minutes: 90,
    cadence: 'Weekly',
    participants: 'Leadership or functional team (5-10 people)',
    keywords: [
      'metronomics weekly adjust meeting template',
      'metronomics meeting',
      'weekly adjust meeting agenda',
      'shannon susko meeting rhythm',
      'metronomics weekly meeting template',
      'weekly team meeting agenda',
      'metronomics rhythm meeting',
      'weekly leadership meeting template',
    ],
    steps: [
      { name: 'Good news', minutes: 5, text: 'Open with a quick round of personal and business good news to start positive and reconnect the team.' },
      { name: 'Weekly metrics and scoreboard', minutes: 15, text: 'Walk the weekly numbers and KPIs against target, flagging anything off track as a topic for the stuck list.' },
      { name: 'Quarterly priorities and rocks', minutes: 15, text: 'Check each quarterly priority on or off track and confirm owners are clear on the next move.' },
      { name: 'Customer and employee feedback', minutes: 10, text: 'Share key signals from customers and the team that should shape decisions this week.' },
      { name: 'Build the stuck list', minutes: 5, text: 'List the issues and stucks raised so far, then prioritize the few worth solving in this meeting.' },
      { name: 'Work the stucks', minutes: 35, text: 'Take the top stucks one at a time, identify the real issue, discuss, and decide a concrete action and owner.' },
      { name: 'Cascading messages and close', minutes: 5, text: 'Agree what cascades to the rest of the company and rate the meeting to keep improving the rhythm.' },
    ],
    bodyHtml:
      '<p>The <strong>Metronomics weekly adjust meeting</strong> is the engine of the coaching rhythm. Based on the Metronomics system by Shannon Susko, it gives the team a focused weekly block to read the scoreboard, check quarterly priorities, and work the stuck list so execution adjusts before small problems compound.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run it every week on a fixed day and time. It sits between the daily huddle and the monthly meeting, turning the week into a chance to course-correct rather than just report. Most leadership teams treat this as the one meeting they never cancel.</p>' +
      '<h2>Who attends</h2>' +
      '<p>The leadership team or a functional team of five to ten people who own metrics and priorities. Everyone in the room should be able to both raise a stuck and help solve one. Keep it tight so the working portion stays fast.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Start with good news to set the tone, then move quickly through the weekly scoreboard and quarterly priorities, marking each on or off track. Surface customer and team feedback, then build a stuck list from everything flagged. Spend the largest block working those stucks: name the real issue, discuss it honestly, and leave each with a decided action and owner. Close by agreeing what cascades to the company and rating the meeting so the rhythm keeps sharpening.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Keep the reporting portion fast so most time goes to solving stucks.</li>' +
      '<li>Get to the real issue before debating solutions.</li>' +
      '<li>Close every stuck with a clear action and a single owner.</li>' +
      '<li>End with a quick meeting rating so the rhythm improves over time.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Spending the whole meeting reporting and never working the stucks.</li>' +
      '<li>Treating symptoms instead of digging to the underlying issue.</li>' +
      '<li>Leaving stucks open with no owner or deadline.</li>' +
      '<li>Skipping the weekly meeting when the calendar gets full.</li>' +
      '</ul>' +
      '<p>Make the weekly adjust the beat that keeps you on pace. <a href="/l8">Run it in OrgTP</a> and keep your scoreboard, priorities, and stuck list live every week.</p>',
    downloadMarkdown:
      '# Metronomics Weekly Adjust Meeting Template\n\n' +
      'Purpose: Review weekly metrics and priorities, build and work the stuck list, and adjust execution so quarterly priorities and the 3HAG stay on pace.\n\n' +
      '- Duration: 90 minutes\n' +
      '- Cadence: Weekly\n' +
      '- Participants: Leadership or functional team (5-10 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Good news (5 min)\n' +
      '- [ ] Weekly metrics and scoreboard (15 min)\n' +
      '- [ ] Quarterly priorities and rocks (15 min)\n' +
      '- [ ] Customer and employee feedback (10 min)\n' +
      '- [ ] Build the stuck list (5 min)\n' +
      '- [ ] Work the stucks: issue, discuss, decide (35 min)\n' +
      '- [ ] Cascading messages and meeting rating (5 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Keep reporting fast so most time goes to stucks.\n' +
      '- Get to the real issue before debating solutions.\n' +
      '- Close every stuck with an action and an owner.\n' +
      '- End with a quick meeting rating.\n\n' +
      '## Notes\n\n' +
      'Scoreboard and off-track items:\n\n' +
      'Priority status:\n\n' +
      'Stucks worked and decisions:\n\n' +
      'Cascading messages:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/metronomics-weekly-adjust-meeting\n',
  },
  {
    slug: 'metronomics-monthly-meeting',
    title: 'Metronomics Monthly Meeting Template',
    shortName: 'Metronomics Monthly Meeting',
    description:
      'Use this Metronomics monthly meeting template to step back from the weekly grind, review monthly trends, develop the team, and realign on quarterly priorities.',
    category: 'metronomics',
    methodology: 'Metronomics',
    minutes: 180,
    cadence: 'Monthly',
    participants: 'Leadership team (5-12 people)',
    keywords: [
      'metronomics monthly meeting template',
      'metronomics meeting',
      'monthly meeting agenda',
      'shannon susko meeting rhythm',
      'metronomics monthly review template',
      'monthly leadership meeting agenda',
      'metronomics rhythm meeting',
      'monthly business review template',
    ],
    steps: [
      { name: 'Open and connect', minutes: 15, text: 'Reconnect as a team, recap the month at a glance, and set the focus for the deeper conversations ahead.' },
      { name: 'Monthly metrics and trends', minutes: 30, text: 'Review the month against plan, looking at trends rather than single weeks to see where the business is really heading.' },
      { name: 'Quarterly priority progress', minutes: 30, text: 'Assess progress on quarterly priorities at the month mark and decide whether any need a course correction.' },
      { name: 'Team development and learning', minutes: 40, text: 'Invest in the team with coaching, skill building, or a deeper discussion on a topic that strengthens execution.' },
      { name: 'Work a strategic stuck', minutes: 45, text: 'Take one larger issue that needs more than a weekly meeting and work it fully to a decision and plan.' },
      { name: 'Commitments and cascade', minutes: 20, text: 'Confirm decisions, owners, and what cascades to the wider team, then rate the meeting.' },
    ],
    bodyHtml:
      '<p>The <strong>Metronomics monthly meeting</strong> is the step back the weekly rhythm cannot provide. Based on the Metronomics system by Shannon Susko, it gives the leadership team a longer block to read monthly trends, develop people, and work a strategic stuck that needs more room than a weekly meeting allows.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run it once a month, ideally early in the month once the prior month is closed. It bridges the weekly adjust meetings and the quarterly planning session, keeping the team learning and realigning between the fast weekly beat and the bigger quarterly reset.</p>' +
      '<h2>Who attends</h2>' +
      '<p>The leadership team, five to twelve people who own functions and priorities. Because part of the meeting is team development, this is also where leaders grow together, so protect the learning block from being crowded out by operational fires.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Open by reconnecting and recapping the month, then study trends rather than isolated weeks so direction is clear. Check quarterly priorities at the halfway or month mark and adjust where needed. Spend real time on team development, since the monthly meeting is one of the few places that investment fits. Then take one strategic stuck and work it fully to a decision. Close by confirming commitments, cascading messages, and rating the meeting so the rhythm keeps improving.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Look at trends across weeks, not a single week in isolation.</li>' +
      '<li>Protect the team development block from operational creep.</li>' +
      '<li>Use the longer format to fully resolve one strategic stuck.</li>' +
      '<li>Confirm what cascades so the wider team stays aligned.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Turning the monthly meeting into a longer version of the weekly one.</li>' +
      '<li>Skipping team development whenever the month feels busy.</li>' +
      '<li>Reviewing the month with no decisions or course corrections.</li>' +
      '<li>Leaving without confirming what cascades to the broader team.</li>' +
      '</ul>' +
      '<p>Give your team the monthly step back that keeps the quarter on track. <a href="/l8">Run it in OrgTP</a> and keep monthly trends, priorities, and decisions connected.</p>',
    downloadMarkdown:
      '# Metronomics Monthly Meeting Template\n\n' +
      'Purpose: Step back from the weekly grind to review monthly trends, develop the team, work a strategic stuck, and realign on quarterly priorities and the 3HAG.\n\n' +
      '- Duration: 180 minutes\n' +
      '- Cadence: Monthly\n' +
      '- Participants: Leadership team (5-12 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Open and connect (15 min)\n' +
      '- [ ] Monthly metrics and trends (30 min)\n' +
      '- [ ] Quarterly priority progress (30 min)\n' +
      '- [ ] Team development and learning (40 min)\n' +
      '- [ ] Work a strategic stuck (45 min)\n' +
      '- [ ] Commitments and cascade (20 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Look at trends across weeks, not a single week.\n' +
      '- Protect the team development block.\n' +
      '- Fully resolve one strategic stuck.\n' +
      '- Confirm what cascades to the wider team.\n\n' +
      '## Notes\n\n' +
      'Monthly trends:\n\n' +
      'Quarterly priority status:\n\n' +
      'Team development takeaways:\n\n' +
      'Strategic stuck decision and owners:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/metronomics-monthly-meeting\n',
  },
  {
    slug: 'metronomics-quarterly-planning',
    title: 'Metronomics Quarterly Planning Template',
    shortName: 'Metronomics Quarterly Planning',
    description:
      'Use this Metronomics quarterly planning template to review the quarter, reset the team scoreboard, and set the next quarter of priorities tied to your 3HAG.',
    category: 'metronomics',
    methodology: 'Metronomics',
    minutes: 480,
    cadence: 'Quarterly',
    participants: 'Leadership team (5-12 people)',
    keywords: [
      'metronomics quarterly planning template',
      'metronomics meeting',
      'quarterly planning agenda',
      'shannon susko meeting rhythm',
      'metronomics quarterly meeting template',
      '3hag template',
      'quarterly priorities planning',
      'metronomics rhythm meeting',
    ],
    steps: [
      { name: 'Quarter in review', minutes: 60, text: 'Score the prior quarter priorities, review the numbers, and pull out the lessons that should shape the next quarter.' },
      { name: 'Revisit 3HAG and annual plan', minutes: 60, text: 'Reconnect the quarter to the 3HAG and the annual plan so new priorities move the longer game forward.' },
      { name: 'Update the team scoreboard', minutes: 60, text: 'Refresh the key metrics and the team scoreboard so everyone tracks the right numbers for the coming quarter.' },
      { name: 'Set quarterly priorities', minutes: 90, text: 'Choose the few quarterly priorities that matter most, define what done looks like, and assign a single owner each.' },
      { name: 'Functional plans and dependencies', minutes: 90, text: 'Each function builds its plan to support the priorities, surfacing dependencies and resourcing conflicts.' },
      { name: 'Commit, cascade, and close', minutes: 60, text: 'Lock the priorities, agree how they cascade to the company, and confirm the weekly rhythm that will execute them.' },
    ],
    bodyHtml:
      '<p><strong>Metronomics quarterly planning</strong> is the reset that keeps the whole rhythm honest. Based on the Metronomics system by Shannon Susko, it gives the leadership team a full day to score the last quarter, reconnect to the 3HAG, refresh the team scoreboard, and set the handful of priorities that define the next ninety days.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run it every quarter, ideally in the week or two before the new quarter begins so owners start clean. It is the anchor session that the daily, weekly, and monthly meetings then execute. Skipping a quarter is how a rhythm quietly loses its direction.</p>' +
      '<h2>Who attends</h2>' +
      '<p>The leadership team, five to twelve people who will own quarterly priorities and build functional plans. A skilled facilitator, sometimes an external coach, helps the most senior leader participate as a thinker rather than spend the day running the room.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Begin with an honest quarter in review, scoring priorities and reading the numbers. Reconnect to the 3HAG and annual plan so the new quarter serves the longer game, then refresh the team scoreboard. Set a small number of quarterly priorities with clear definitions of done and single owners. Let each function build a supporting plan and surface dependencies, then lock the set, agree the cascade, and confirm the weekly rhythm that will carry it. A quarter with no operating cadence drifts within weeks.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Score last quarter honestly before setting anything new.</li>' +
      '<li>Tie every priority back to the 3HAG and annual plan.</li>' +
      '<li>Keep priorities few enough that the team can name them.</li>' +
      '<li>Confirm the weekly rhythm that will actually execute the plan.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Setting priorities that have no line back to the 3HAG.</li>' +
      '<li>Choosing so many priorities that focus dissolves.</li>' +
      '<li>Skipping the honest review and repeating the same misses.</li>' +
      '<li>Planning the quarter but never locking the rhythm to run it.</li>' +
      '</ul>' +
      '<p>Set a quarter the team can actually execute. <a href="/l8">Run it in OrgTP</a> and connect quarterly priorities to your scoreboard and weekly cadence.</p>',
    downloadMarkdown:
      '# Metronomics Quarterly Planning Template\n\n' +
      'Purpose: Review the quarter, reconnect to the 3HAG, reset the team scoreboard, and set a focused set of quarterly priorities with owners and a weekly rhythm.\n\n' +
      '- Duration: 480 minutes (full day)\n' +
      '- Cadence: Quarterly\n' +
      '- Participants: Leadership team (5-12 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Quarter in review and scoring (60 min)\n' +
      '- [ ] Revisit 3HAG and annual plan (60 min)\n' +
      '- [ ] Update the team scoreboard (60 min)\n' +
      '- [ ] Set quarterly priorities with owners (90 min)\n' +
      '- [ ] Functional plans and dependencies (90 min)\n' +
      '- [ ] Commit, cascade, and confirm rhythm (60 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Score last quarter honestly first.\n' +
      '- Tie every priority back to the 3HAG.\n' +
      '- Keep priorities few enough to name.\n' +
      '- Confirm the weekly rhythm to execute.\n\n' +
      '## Notes\n\n' +
      'Quarter scoring and lessons:\n\n' +
      'Updated scoreboard:\n\n' +
      'Quarterly priorities and owners:\n\n' +
      'Cascade and rhythm:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/metronomics-quarterly-planning\n',
  },
  {
    slug: 'metronomics-annual-planning',
    title: 'Metronomics Annual Planning Template',
    shortName: 'Metronomics Annual Planning',
    description:
      'Use this Metronomics annual planning template to review the year, refresh the 3HAG, set annual priorities, and build the rhythm that drives the year ahead.',
    category: 'metronomics',
    methodology: 'Metronomics',
    minutes: 960,
    cadence: 'Annually',
    participants: 'Leadership team (5-12 people)',
    keywords: [
      'metronomics annual planning template',
      'metronomics meeting',
      'annual planning agenda',
      'shannon susko meeting rhythm',
      'metronomics annual meeting template',
      '3hag template',
      'annual priorities planning',
      'metronomics rhythm meeting',
    ],
    steps: [
      { name: 'Year in review', minutes: 90, text: 'Review the year against the annual plan and the 3HAG, naming what worked, what slipped, and the lessons to carry forward.' },
      { name: 'Refresh the 3HAG', minutes: 120, text: 'Update the 3-Year Highly Achievable Goal with current data so the destination stays sharp and believable.' },
      { name: 'Core strategy and competitive position', minutes: 120, text: 'Pressure-test the core strategy, customer, and competitive position that the year must advance.' },
      { name: 'Set annual priorities and themes', minutes: 120, text: 'Define a small set of annual priorities and the theme that organizes the year, each with a measurable target.' },
      { name: 'Cascade to first quarter', minutes: 90, text: 'Translate the annual plan into the first quarter of priorities and sketch the rough shape of the rest.' },
      { name: 'Scoreboard, owners, and rhythm', minutes: 60, text: 'Set the annual scoreboard, assign owners, and lock the coaching rhythm that will run the year.' },
    ],
    bodyHtml:
      '<p><strong>Metronomics annual planning</strong> sets the destination for the year and the first leg of the route. Based on the Metronomics system by Shannon Susko, it gives the leadership team two focused days to review the year, refresh the 3HAG, set annual priorities, and lock the rhythm that will carry the plan into daily execution.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run it once a year, late in the current year or right at the start of the new one, so the team enters the year aligned. It pairs with quarterly planning: the annual session sets direction and the 3HAG, and each quarter executes a leg of it.</p>' +
      '<h2>Who attends</h2>' +
      '<p>The leadership team, five to twelve people who will own annual priorities and shape strategy. The group should be wide enough to commit the organization yet small enough to make real decisions. Cascade the detail to teams afterward rather than crowding the room.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Start with an honest year in review against the annual plan and the 3HAG. Refresh the 3HAG with current data so the destination stays both ambitious and achievable, then pressure-test the core strategy and competitive position. Set a focused set of annual priorities and a theme, cascade them into a concrete first quarter, and finish by building the annual scoreboard, assigning owners, and locking the coaching rhythm. An annual plan with no rhythm dissolves by spring.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Ground the year in an honest review before looking ahead.</li>' +
      '<li>Keep the 3HAG both highly achievable and genuinely stretching.</li>' +
      '<li>Cascade annual priorities into a concrete first quarter.</li>' +
      '<li>Lock the rhythm that keeps the plan alive all year.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Setting annual priorities with no path into quarterly execution.</li>' +
      '<li>Leaving the 3HAG stale instead of refreshing it with real data.</li>' +
      '<li>Producing a plan that lives in a deck and never in the work.</li>' +
      '<li>Defining no rhythm, so the plan is forgotten within a quarter.</li>' +
      '</ul>' +
      '<p>Turn the year ahead into a plan you can run. <a href="/l8">Run it in OrgTP</a> and connect your 3HAG to annual priorities and weekly execution.</p>',
    downloadMarkdown:
      '# Metronomics Annual Planning Template\n\n' +
      'Purpose: Review the year, refresh the 3HAG, set a focused set of annual priorities and a theme, and lock the coaching rhythm that drives the year ahead.\n\n' +
      '- Duration: 960 minutes (two-day session)\n' +
      '- Cadence: Annually\n' +
      '- Participants: Leadership team (5-12 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Year in review (90 min)\n' +
      '- [ ] Refresh the 3HAG (120 min)\n' +
      '- [ ] Core strategy and competitive position (120 min)\n' +
      '- [ ] Set annual priorities and theme (120 min)\n' +
      '- [ ] Cascade to first quarter (90 min)\n' +
      '- [ ] Scoreboard, owners, and rhythm (60 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Ground the year in an honest review first.\n' +
      '- Keep the 3HAG achievable yet stretching.\n' +
      '- Cascade annual priorities into Q1.\n' +
      '- Lock the rhythm that runs the year.\n\n' +
      '## Notes\n\n' +
      'Year in review:\n\n' +
      'Refreshed 3HAG:\n\n' +
      'Annual priorities and theme:\n\n' +
      'Scoreboard, owners, and rhythm:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/metronomics-annual-planning\n',
  },
  {
    slug: 'metronomics-3hag-session',
    title: 'Metronomics 3HAG Session Template',
    shortName: 'Metronomics 3HAG Session',
    description:
      'Use this 3HAG template to build a 3-Year Highly Achievable Goal with confidence, mapping the path, key moves, and metrics that make the future feel achievable.',
    category: 'metronomics',
    methodology: 'Metronomics',
    minutes: 240,
    cadence: 'Annually',
    participants: 'Leadership team (5-10 people)',
    keywords: [
      '3hag template',
      'metronomics meeting',
      '3 year highly achievable goal template',
      'shannon susko meeting rhythm',
      'metronomics 3hag session agenda',
      '3hag way template',
      'three year goal planning',
      'metronomics strategy session',
    ],
    steps: [
      { name: 'Why the 3HAG', minutes: 20, text: 'Align on the purpose of the session and why a 3-Year Highly Achievable Goal beats a vague long-term vision.' },
      { name: 'Current reality and core', minutes: 40, text: 'Ground the team in the current numbers, core customer, and core strengths the 3HAG must build on.' },
      { name: 'Paint the 3-year picture', minutes: 60, text: 'Describe the company three years out in vivid, specific terms: revenue, customers, capabilities, and feel.' },
      { name: 'Set the 3HAG metrics', minutes: 50, text: 'Define the few measurable targets, including the key financial number, that make the 3HAG concrete and trackable.' },
      { name: 'Map the key moves', minutes: 50, text: 'Identify the handful of strategic moves and capabilities required to make the goal genuinely achievable.' },
      { name: 'Build confidence and commit', minutes: 20, text: 'Test the team confidence in the 3HAG, adjust until it is believable, and commit to it as the shared destination.' },
    ],
    bodyHtml:
      '<p>A <strong>Metronomics 3HAG session</strong> builds the 3-Year Highly Achievable Goal at the heart of the system. Based on The 3HAG WAY by Shannon Susko, it replaces a fuzzy long-term vision with a specific, believable picture of the company three years out, backed by metrics and the key moves that make it achievable.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run a full 3HAG session when you first build the goal, then refresh it inside annual planning each year. Revisit it sooner if the market shifts hard or the company changes shape through a funding round, acquisition, or pivot. The 3HAG is a living target, not a one-time exercise.</p>' +
      '<h2>Who attends</h2>' +
      '<p>The leadership team, five to ten people who can both shape the strategy and commit to it. The 3HAG only works when the people who will execute it believe it, so this is not a goal to set in isolation and hand down.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Start by aligning on why a highly achievable goal beats a vague aspiration, then ground the team in current reality and core strengths. Paint the three-year picture in vivid, specific terms, then attach the few metrics that make it concrete, including the key financial number. Map the strategic moves and capabilities required, then test confidence openly. If the team does not believe it, adjust until they do. A 3HAG nobody believes is just a slogan.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Make the picture specific enough that anyone could describe it.</li>' +
      '<li>Anchor the 3HAG in a key financial metric, not just a narrative.</li>' +
      '<li>Keep tuning until the team genuinely believes it is achievable.</li>' +
      '<li>Tie the goal to a few key moves, not a long strategy list.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Setting a goal so big the team quietly stops believing it.</li>' +
      '<li>Describing the future in vague terms with no measurable targets.</li>' +
      '<li>Skipping the confidence check, so commitment is shallow.</li>' +
      '<li>Treating the 3HAG as fixed and never refreshing it with data.</li>' +
      '</ul>' +
      '<p>Build a future the team actually believes in. <a href="/l8">Run it in OrgTP</a> and keep your 3HAG, metrics, and key moves connected to the work.</p>',
    downloadMarkdown:
      '# Metronomics 3HAG Session Template\n\n' +
      'Purpose: Build a 3-Year Highly Achievable Goal with team confidence, defining the three-year picture, key metrics, and the strategic moves that make it achievable.\n\n' +
      '- Duration: 240 minutes\n' +
      '- Cadence: Annually (or at major inflection points)\n' +
      '- Participants: Leadership team (5-10 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Why the 3HAG (20 min)\n' +
      '- [ ] Current reality and core (40 min)\n' +
      '- [ ] Paint the 3-year picture (60 min)\n' +
      '- [ ] Set the 3HAG metrics (50 min)\n' +
      '- [ ] Map the key moves (50 min)\n' +
      '- [ ] Build confidence and commit (20 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Make the picture specific enough to describe.\n' +
      '- Anchor the 3HAG in a key financial metric.\n' +
      '- Tune until the team believes it is achievable.\n' +
      '- Tie the goal to a few key moves.\n\n' +
      '## Notes\n\n' +
      'Current reality:\n\n' +
      '3-year picture:\n\n' +
      '3HAG metrics:\n\n' +
      'Key moves and confidence:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/metronomics-3hag-session\n',
  },
  {
    slug: 'metronomics-team-health-meeting',
    title: 'Metronomics Team Health Meeting Template',
    shortName: 'Metronomics Team Health Meeting',
    description:
      'Use this Metronomics team health meeting template to build trust, surface tension, and strengthen the team system so execution and the coaching rhythm hold.',
    category: 'metronomics',
    methodology: 'Metronomics',
    minutes: 120,
    cadence: 'Monthly',
    participants: 'Leadership team (5-10 people)',
    keywords: [
      'metronomics team health meeting template',
      'metronomics meeting',
      'team health meeting agenda',
      'shannon susko meeting rhythm',
      'metronomics team health template',
      'leadership team building agenda',
      'team trust meeting template',
      'metronomics rhythm meeting',
    ],
    steps: [
      { name: 'Check-in and connect', minutes: 15, text: 'Each person shares a personal and professional update to deepen trust beyond day-to-day work.' },
      { name: 'Team health pulse', minutes: 25, text: 'Score the team on trust, conflict, commitment, and accountability, then discuss where the honest gaps are.' },
      { name: 'Surface the tension', minutes: 30, text: 'Name the unspoken issues and frustrations in the room and work through them with productive conflict.' },
      { name: 'Strengthen the system', minutes: 30, text: 'Agree concrete changes to behaviors, norms, or structure that make the team healthier and more effective.' },
      { name: 'Feedback round', minutes: 15, text: 'Give and receive direct, caring feedback so each person knows one strength and one thing to work on.' },
      { name: 'Commitments and close', minutes: 5, text: 'Confirm the commitments each person is making and how the team will hold each other to them.' },
    ],
    bodyHtml:
      '<p>The <strong>Metronomics team health meeting</strong> works on the team itself, not just the numbers. Based on the Metronomics system by Shannon Susko, it treats team health as a core system alongside strategy and execution, giving leaders a dedicated space to build trust, surface tension, and strengthen how they work together.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run it monthly, or fold a focused version into your monthly meeting. Use a standalone session when trust is fraying, a new leader has joined, conflict is being avoided, or the team is heading into a hard stretch where alignment matters most.</p>' +
      '<h2>Who attends</h2>' +
      '<p>The leadership team, five to ten people who depend on each other to execute. This is a candid working session, so keep it to the actual team rather than a wider audience. Psychological safety drops fast when observers are in the room.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Open with a real check-in so people connect as humans first. Take an honest pulse on trust, conflict, commitment, and accountability, then surface the tension that usually goes unspoken and work through it with healthy conflict. Turn the conversation into concrete changes to behaviors and norms, then run a feedback round so each person leaves with one strength and one growth area. Close by confirming commitments and how the team will hold each other accountable.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Create real safety so people raise the hard things.</li>' +
      '<li>Treat productive conflict as healthy, not something to smooth over.</li>' +
      '<li>Turn the conversation into concrete behavior changes.</li>' +
      '<li>Make feedback specific, balanced, and caring.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Keeping it polite and surfacing none of the real tension.</li>' +
      '<li>Treating team health as soft and skipping it under pressure.</li>' +
      '<li>Talking about issues without committing to any change.</li>' +
      '<li>Giving vague feedback that no one can act on.</li>' +
      '</ul>' +
      '<p>Invest in the team that has to execute the plan. <a href="/l8">Run it in OrgTP</a> and keep team health commitments visible alongside your priorities.</p>',
    downloadMarkdown:
      '# Metronomics Team Health Meeting Template\n\n' +
      'Purpose: Build trust, surface and work through tension, and strengthen the team system so the team can execute the strategy and hold the coaching rhythm.\n\n' +
      '- Duration: 120 minutes\n' +
      '- Cadence: Monthly\n' +
      '- Participants: Leadership team (5-10 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Check-in and connect (15 min)\n' +
      '- [ ] Team health pulse: trust, conflict, commitment, accountability (25 min)\n' +
      '- [ ] Surface the tension (30 min)\n' +
      '- [ ] Strengthen the system (30 min)\n' +
      '- [ ] Feedback round (15 min)\n' +
      '- [ ] Commitments and close (5 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Create real safety so people raise hard things.\n' +
      '- Treat productive conflict as healthy.\n' +
      '- Turn the conversation into behavior changes.\n' +
      '- Make feedback specific and caring.\n\n' +
      '## Notes\n\n' +
      'Team health pulse:\n\n' +
      'Tensions surfaced:\n\n' +
      'System changes agreed:\n\n' +
      'Commitments:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/metronomics-team-health-meeting\n',
  },
  {
    slug: 'metronomics-strategy-session',
    title: 'Metronomics Strategy Session Template',
    shortName: 'Metronomics Strategy Session',
    description:
      'Use this Metronomics strategy session template to sharpen your core customer, competitive position, and key moves so strategy and the 3HAG stay aligned.',
    category: 'metronomics',
    methodology: 'Metronomics',
    minutes: 300,
    cadence: 'Quarterly',
    participants: 'Leadership team (5-10 people)',
    keywords: [
      'metronomics strategy session template',
      'metronomics meeting',
      'strategy session agenda',
      'shannon susko meeting rhythm',
      'metronomics strategy meeting template',
      '3hag template',
      'competitive strategy workshop',
      'metronomics rhythm meeting',
    ],
    steps: [
      { name: 'Strategy and 3HAG context', minutes: 30, text: 'Reconnect the session to the 3HAG and the current strategy so the conversation stays anchored to the destination.' },
      { name: 'Core customer and core', minutes: 45, text: 'Sharpen the definition of the core customer and the core of the business everything else builds around.' },
      { name: 'Competitive landscape map', minutes: 60, text: 'Map competitors and the attributes customers value, finding the differentiated position only you can own.' },
      { name: 'Differentiators and key moves', minutes: 60, text: 'Define the few differentiators and strategic moves that win the chosen position over the next few years.' },
      { name: 'Pressure-test the strategy', minutes: 60, text: 'Stress-test the strategy against competitor responses, market shifts, and your own capability to deliver it.' },
      { name: 'Decisions and cascade', minutes: 45, text: 'Lock the strategic decisions, assign owners, and agree how they cascade into priorities and the scoreboard.' },
    ],
    bodyHtml:
      '<p>The <strong>Metronomics strategy session</strong> sharpens the thinking that drives every priority. Based on the Metronomics system by Shannon Susko, it gives the leadership team focused time to clarify the core customer, map the competitive landscape, and choose the differentiated position and key moves that make the 3HAG winnable.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run a dedicated strategy session as part of annual planning and revisit it quarterly when the market is moving fast. Use it whenever the team can no longer clearly explain why a customer should choose them, or when competitors have shifted the ground under the current plan.</p>' +
      '<h2>Who attends</h2>' +
      '<p>The leadership team, five to ten people who can shape and commit to strategy. Bring people close to customers and the competitive reality, not just the planners. A strategy set without frontline input tends to look clean on a slide and fail in the market.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Anchor on the 3HAG and current strategy, then sharpen the core customer and the core of the business. Map the competitive landscape against the attributes customers actually value to find the position only you can own. Define the few differentiators and key moves that win it, then pressure-test the whole strategy against likely competitor responses and your real capability to deliver. Close by locking decisions, assigning owners, and cascading them into priorities and the scoreboard so strategy becomes execution.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Define the core customer precisely before debating tactics.</li>' +
      '<li>Map competitors on attributes customers actually value.</li>' +
      '<li>Pick a differentiated position you can genuinely own.</li>' +
      '<li>Cascade strategy into priorities so it does not stay theoretical.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Debating tactics before agreeing who the core customer is.</li>' +
      '<li>Choosing a position every competitor already claims.</li>' +
      '<li>Setting strategy that never connects to quarterly priorities.</li>' +
      '<li>Skipping the pressure-test, so weaknesses surface in the market.</li>' +
      '</ul>' +
      '<p>Turn strategy into moves the team can run. <a href="/l8">Run it in OrgTP</a> and connect your core customer, key moves, and priorities in one place.</p>',
    downloadMarkdown:
      '# Metronomics Strategy Session Template\n\n' +
      'Purpose: Sharpen the core customer and competitive position, choose differentiators and key moves, and cascade strategy into priorities aligned to the 3HAG.\n\n' +
      '- Duration: 300 minutes\n' +
      '- Cadence: Quarterly (and within annual planning)\n' +
      '- Participants: Leadership team (5-10 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Strategy and 3HAG context (30 min)\n' +
      '- [ ] Core customer and core (45 min)\n' +
      '- [ ] Competitive landscape map (60 min)\n' +
      '- [ ] Differentiators and key moves (60 min)\n' +
      '- [ ] Pressure-test the strategy (60 min)\n' +
      '- [ ] Decisions and cascade (45 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Define the core customer precisely first.\n' +
      '- Map competitors on attributes customers value.\n' +
      '- Pick a position you can genuinely own.\n' +
      '- Cascade strategy into priorities.\n\n' +
      '## Notes\n\n' +
      'Core customer:\n\n' +
      'Competitive position:\n\n' +
      'Differentiators and key moves:\n\n' +
      'Decisions and owners:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/metronomics-strategy-session\n',
  },
  {
    slug: 'metronomics-cash-meeting',
    title: 'Metronomics Cash / Profit Meeting Template',
    shortName: 'Metronomics Cash / Profit Meeting',
    description:
      'Use this Metronomics cash and profit meeting template to review cash flow, improve your cash conversion cycle, and protect the fuel behind your 3HAG.',
    category: 'metronomics',
    methodology: 'Metronomics',
    minutes: 60,
    cadence: 'Monthly',
    participants: 'CEO, finance lead, and key leaders (3-8 people)',
    keywords: [
      'metronomics cash meeting template',
      'metronomics meeting',
      'cash flow meeting agenda',
      'shannon susko meeting rhythm',
      'metronomics cash and profit template',
      'cash conversion cycle meeting',
      'profit review meeting template',
      'metronomics rhythm meeting',
    ],
    steps: [
      { name: 'Cash position and runway', minutes: 10, text: 'Review current cash, the trend since last month, and the runway it represents at the current burn or build.' },
      { name: 'Profit and margin review', minutes: 15, text: 'Walk profit and margin against plan, calling out variance and the drivers behind it.' },
      { name: 'Cash conversion cycle', minutes: 15, text: 'Review the cash conversion cycle: receivables, payables, and inventory, and find the days you can free up.' },
      { name: 'Cash improvement levers', minutes: 15, text: 'Pick the one or two highest-impact levers to improve cash and profit, and decide concrete actions.' },
      { name: 'Owners and next checkpoint', minutes: 5, text: 'Assign owners to each action and confirm the metric and date you will check against next month.' },
    ],
    bodyHtml:
      '<p>The <strong>Metronomics cash and profit meeting</strong> protects the fuel behind the plan. Based on the Metronomics system by Shannon Susko, it gives leaders a focused monthly look at cash, profit, and the cash conversion cycle so growth is funded by the business rather than constantly chasing outside money.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run it monthly once the prior month is closed and the numbers are reliable. Tighten the cadence to weekly during a cash crunch, a fast growth phase that strains working capital, or any period where runway is short enough to demand close attention.</p>' +
      '<h2>Who attends</h2>' +
      '<p>The CEO, the finance lead, and the few leaders whose decisions move cash, three to eight people. Keep it small and numerate. This is a working financial session, so everyone present should be comfortable reading the statements and acting on them.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Start with cash position and runway so the stakes are clear, then review profit and margin against plan and explain the variance. Work the cash conversion cycle next, since freeing days from receivables, payables, and inventory often unlocks more cash than chasing revenue. Choose one or two high-impact levers, decide concrete actions, and assign owners. Close by confirming the metric and date you will check next month so improvement is tracked, not just discussed.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Lead with cash and runway so the stakes are clear up front.</li>' +
      '<li>Work the cash conversion cycle, not just the income statement.</li>' +
      '<li>Pick one or two high-impact levers rather than many small ones.</li>' +
      '<li>Close every action with an owner and a checkpoint date.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Watching profit while ignoring the cash conversion cycle.</li>' +
      '<li>Reviewing the numbers without deciding any improvement action.</li>' +
      '<li>Only looking at cash once a crisis is already underway.</li>' +
      '<li>Spreading effort across many levers instead of the few that matter.</li>' +
      '</ul>' +
      '<p>Keep the fuel behind your growth strong. <a href="/l8">Run it in OrgTP</a> and track cash, margin, and improvement actions month over month.</p>',
    downloadMarkdown:
      '# Metronomics Cash / Profit Meeting Template\n\n' +
      'Purpose: Review cash position, profit, and the cash conversion cycle, choose the highest-impact improvement levers, and protect the fuel behind the 3HAG.\n\n' +
      '- Duration: 60 minutes\n' +
      '- Cadence: Monthly (weekly during a cash crunch)\n' +
      '- Participants: CEO, finance lead, and key leaders (3-8 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Cash position and runway (10 min)\n' +
      '- [ ] Profit and margin review (15 min)\n' +
      '- [ ] Cash conversion cycle (15 min)\n' +
      '- [ ] Cash improvement levers (15 min)\n' +
      '- [ ] Owners and next checkpoint (5 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Lead with cash and runway.\n' +
      '- Work the cash conversion cycle, not just profit.\n' +
      '- Pick one or two high-impact levers.\n' +
      '- Close every action with an owner and a date.\n\n' +
      '## Notes\n\n' +
      'Cash and runway:\n\n' +
      'Profit and margin variance:\n\n' +
      'Cash conversion cycle:\n\n' +
      'Improvement levers and owners:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/metronomics-cash-meeting\n',
  },
  {
    slug: 'metronomics-kpi-review',
    title: 'Metronomics KPI / Scoreboard Review Template',
    shortName: 'Metronomics KPI / Scoreboard Review',
    description:
      'Use this Metronomics KPI and scoreboard review template to keep your team scoreboard honest, read leading indicators, and act before lagging numbers move.',
    category: 'metronomics',
    methodology: 'Metronomics',
    minutes: 45,
    cadence: 'Weekly',
    participants: 'Team and metric owners (4-10 people)',
    keywords: [
      'metronomics kpi review template',
      'metronomics meeting',
      'scoreboard review agenda',
      'shannon susko meeting rhythm',
      'metronomics scoreboard review template',
      'kpi review meeting template',
      'leading indicator review',
      'metronomics rhythm meeting',
    ],
    steps: [
      { name: 'Scoreboard at a glance', minutes: 5, text: 'Open with the full team scoreboard so everyone sees green, yellow, and red status in one view.' },
      { name: 'Leading indicators', minutes: 15, text: 'Focus on leading indicators that predict results, since they give the team time to act before lagging numbers move.' },
      { name: 'Off-track metrics', minutes: 15, text: 'Take each red or trending-wrong metric, name the likely driver, and decide a corrective action and owner.' },
      { name: 'Metric health check', minutes: 5, text: 'Confirm each KPI still measures the right thing and retire or replace any that no longer drive behavior.' },
      { name: 'Actions and cascade', minutes: 5, text: 'Confirm the actions, owners, and what cascades to the wider team before next week.' },
    ],
    bodyHtml:
      '<p>The <strong>Metronomics KPI and scoreboard review</strong> keeps the team honest about the numbers. Based on the Metronomics system by Shannon Susko, it gives a focused session to read the team scoreboard, watch the leading indicators that predict results, and act on anything off track before lagging numbers confirm the problem too late.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run it weekly, either as a standalone review or as the metrics block inside your weekly adjust meeting. The point is a regular, disciplined look at the scoreboard so trends are caught early rather than discovered at the end of a quarter.</p>' +
      '<h2>Who attends</h2>' +
      '<p>The team and the people who own metrics, four to ten people. Every red number on the scoreboard should have someone in the room who owns it and can speak to the driver behind it. Owners without data, or data without owners, both weaken the review.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Open with the whole scoreboard so status is visible at a glance, then spend real time on leading indicators, because they buy the team time to act. Work each off-track metric to a likely driver and a corrective action with an owner. Periodically check that each KPI still drives the right behavior and retire any that have gone stale. Close by confirming actions and what cascades to the wider team, keeping the review short and decision-focused.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Spend the most time on leading indicators, not just lagging results.</li>' +
      '<li>Give every red metric an owner who knows the driver.</li>' +
      '<li>Retire KPIs that no longer change anyone behavior.</li>' +
      '<li>End with corrective actions, not just a status review.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Watching only lagging numbers, so the team reacts too late.</li>' +
      '<li>Reviewing a scoreboard nobody owns metric by metric.</li>' +
      '<li>Tracking vanity KPIs that look good but drive nothing.</li>' +
      '<li>Reading the numbers without deciding any action.</li>' +
      '</ul>' +
      '<p>Keep your scoreboard honest and early. <a href="/l8">Run it in OrgTP</a> and track leading indicators, owners, and actions in one live view.</p>',
    downloadMarkdown:
      '# Metronomics KPI / Scoreboard Review Template\n\n' +
      'Purpose: Keep the team scoreboard honest, focus on leading indicators, and act on off-track metrics before lagging numbers confirm a problem too late.\n\n' +
      '- Duration: 45 minutes\n' +
      '- Cadence: Weekly\n' +
      '- Participants: Team and metric owners (4-10 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Scoreboard at a glance (5 min)\n' +
      '- [ ] Leading indicators (15 min)\n' +
      '- [ ] Off-track metrics and drivers (15 min)\n' +
      '- [ ] Metric health check (5 min)\n' +
      '- [ ] Actions and cascade (5 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Spend the most time on leading indicators.\n' +
      '- Give every red metric an owner.\n' +
      '- Retire KPIs that drive no behavior.\n' +
      '- End with corrective actions.\n\n' +
      '## Notes\n\n' +
      'Scoreboard status:\n\n' +
      'Leading indicators:\n\n' +
      'Off-track metrics and drivers:\n\n' +
      'Actions and owners:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/metronomics-kpi-review\n',
  },
  {
    slug: 'metronomics-90-day-sprint',
    title: 'Metronomics 90-Day Sprint Planning Template',
    shortName: 'Metronomics 90-Day Sprint Planning',
    description:
      'Use this Metronomics 90-day sprint planning template to turn quarterly priorities into a focused sprint with weekly milestones, owners, and a clear finish.',
    category: 'metronomics',
    methodology: 'Metronomics',
    minutes: 120,
    cadence: 'Quarterly',
    participants: 'Team and priority owners (4-10 people)',
    keywords: [
      'metronomics 90 day sprint planning template',
      'metronomics meeting',
      '90 day sprint agenda',
      'shannon susko meeting rhythm',
      'metronomics sprint planning template',
      'quarterly sprint planning',
      '90 day plan template',
      'metronomics rhythm meeting',
    ],
    steps: [
      { name: 'Quarterly priorities recap', minutes: 15, text: 'Restate the quarterly priorities this 90-day sprint must deliver so the team shares one clear target.' },
      { name: 'Define the sprint outcome', minutes: 20, text: 'Write a sharp definition of what done looks like at day 90 so success is unambiguous.' },
      { name: 'Map weekly milestones', minutes: 30, text: 'Break the 90 days into weekly milestones so progress is visible and the sprint stays on pace.' },
      { name: 'Assign owners and resources', minutes: 20, text: 'Give each milestone a single owner and confirm the people and resources required to hit it.' },
      { name: 'Surface risks and dependencies', minutes: 20, text: 'Name the risks and dependencies that could derail the sprint and decide how each is handled.' },
      { name: 'Confirm rhythm and check-ins', minutes: 15, text: 'Agree the weekly check-in that tracks the sprint and the metric that signals on or off pace.' },
    ],
    bodyHtml:
      '<p>The <strong>Metronomics 90-day sprint planning</strong> meeting turns quarterly priorities into a focused, executable sprint. Based on the Metronomics system by Shannon Susko, it converts a few quarterly commitments into weekly milestones, owners, and a clear finish so the next ninety days have a plan rather than just a goal.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run it right after quarterly planning, once priorities are set, to build the execution plan that delivers them. Use it again mid-quarter if a priority needs replanning because reality shifted. It is the bridge between setting the quarter and running it week to week.</p>' +
      '<h2>Who attends</h2>' +
      '<p>The team and priority owners who will execute the sprint, four to ten people. Keep it to the people doing the work and the leaders accountable for the outcome. This is a planning session for the doers, not a status review for stakeholders.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Recap the quarterly priorities the sprint must deliver, then write a sharp definition of done for day 90. Break the ninety days into weekly milestones so progress stays visible and pace is easy to read. Give each milestone a single owner, confirm the resources required, and surface the risks and dependencies that could derail it. Close by locking the weekly check-in and the metric that signals on or off pace. A sprint without milestones is just a hope with a deadline.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Write a definition of done sharp enough to be unarguable.</li>' +
      '<li>Break the quarter into weekly milestones, not one big finish.</li>' +
      '<li>Give every milestone a single accountable owner.</li>' +
      '<li>Lock the weekly check-in that keeps the sprint on pace.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Setting a 90-day goal with no weekly milestones to track it.</li>' +
      '<li>Leaving the definition of done vague, so the finish is debatable.</li>' +
      '<li>Ignoring dependencies that stall the sprint mid-quarter.</li>' +
      '<li>Planning the sprint but never running the weekly check-in.</li>' +
      '</ul>' +
      '<p>Turn the quarter into a sprint the team can run. <a href="/l8">Run it in OrgTP</a> and keep milestones, owners, and check-ins on one shared board.</p>',
    downloadMarkdown:
      '# Metronomics 90-Day Sprint Planning Template\n\n' +
      'Purpose: Turn quarterly priorities into a focused 90-day sprint with a sharp definition of done, weekly milestones, owners, and a weekly check-in rhythm.\n\n' +
      '- Duration: 120 minutes\n' +
      '- Cadence: Quarterly (at the start of each sprint)\n' +
      '- Participants: Team and priority owners (4-10 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Quarterly priorities recap (15 min)\n' +
      '- [ ] Define the sprint outcome (20 min)\n' +
      '- [ ] Map weekly milestones (30 min)\n' +
      '- [ ] Assign owners and resources (20 min)\n' +
      '- [ ] Surface risks and dependencies (20 min)\n' +
      '- [ ] Confirm rhythm and check-ins (15 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Write a definition of done sharp enough to be unarguable.\n' +
      '- Break the quarter into weekly milestones.\n' +
      '- Give every milestone a single owner.\n' +
      '- Lock the weekly check-in.\n\n' +
      '## Notes\n\n' +
      'Sprint outcome / definition of done:\n\n' +
      'Weekly milestones:\n\n' +
      'Owners and resources:\n\n' +
      'Risks, dependencies, and check-in rhythm:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/metronomics-90-day-sprint\n',
  },
  {
    slug: 'metronomics-compounding-growth-review',
    title: 'Metronomics Compounding Growth Review Template',
    shortName: 'Metronomics Compounding Growth Review',
    description:
      'Use this Metronomics compounding growth review template to assess how the coaching rhythm is compounding, find the next system upgrade, and protect momentum.',
    category: 'metronomics',
    methodology: 'Metronomics',
    minutes: 90,
    cadence: 'Quarterly',
    participants: 'Leadership team and coach (4-10 people)',
    keywords: [
      'metronomics compounding growth review template',
      'metronomics meeting',
      'compounding growth review agenda',
      'shannon susko meeting rhythm',
      'metronomics growth review template',
      'coaching rhythm review',
      'business operating system review',
      'metronomics rhythm meeting',
    ],
    steps: [
      { name: 'Growth trajectory review', minutes: 20, text: 'Look at the multi-quarter trajectory of revenue, profit, and team to see whether growth is genuinely compounding.' },
      { name: 'Rhythm health check', minutes: 20, text: 'Assess how well the daily, weekly, monthly, and quarterly meetings are running and where the rhythm is slipping.' },
      { name: 'System scorecard', minutes: 20, text: 'Rate the strategy, execution, cash, and team health systems to find the one limiting compounding the most.' },
      { name: 'Pick the next upgrade', minutes: 20, text: 'Choose the single highest-leverage improvement to the system and define what better looks like.' },
      { name: 'Commit and protect momentum', minutes: 10, text: 'Assign the upgrade an owner, set the checkpoint, and agree how the team protects the rhythm that creates momentum.' },
    ],
    bodyHtml:
      '<p>The <strong>Metronomics compounding growth review</strong> looks at the system itself, not just this quarter. Based on the Metronomics system by Shannon Susko, it steps back to ask whether growth is truly compounding, how healthy the coaching rhythm is, and what single upgrade would most strengthen the operating system going forward.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run it quarterly, often alongside quarterly planning, or twice a year as a deeper system check. Use it whenever growth has plateaued, the rhythm feels mechanical instead of energizing, or the team senses the operating system needs to level up to support the next stage.</p>' +
      '<h2>Who attends</h2>' +
      '<p>The leadership team and, where you have one, the coach who helps run the rhythm, four to ten people. This is a candid look at how the company operates, so keep it to the people who shape the system and can commit to improving it.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Open by reviewing the multi-quarter trajectory so you can see whether results are compounding rather than just holding. Check the health of the meeting rhythm across every cadence, then score the strategy, execution, cash, and team health systems to find the real constraint. Pick the single highest-leverage upgrade, define what better looks like, and assign it an owner with a checkpoint. Close by agreeing how the team protects the rhythm, since momentum is fragile and compounds only when the system is run consistently.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Read the multi-quarter trend, not a single quarter, to judge compounding.</li>' +
      '<li>Score every system honestly to find the real constraint.</li>' +
      '<li>Choose one high-leverage upgrade rather than many small fixes.</li>' +
      '<li>Treat protecting the rhythm as the source of momentum.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Judging growth on one quarter instead of the compounding trend.</li>' +
      '<li>Tweaking many systems at once and improving none of them.</li>' +
      '<li>Letting the rhythm go mechanical and lose its energy.</li>' +
      '<li>Naming an upgrade with no owner or checkpoint to drive it.</li>' +
      '</ul>' +
      '<p>Make your operating system compound. <a href="/l8">Run it in OrgTP</a> and keep your rhythm, system scores, and next upgrade visible quarter over quarter.</p>',
    downloadMarkdown:
      '# Metronomics Compounding Growth Review Template\n\n' +
      'Purpose: Assess whether growth is compounding, check the health of the coaching rhythm, score the systems, and choose the next high-leverage upgrade.\n\n' +
      '- Duration: 90 minutes\n' +
      '- Cadence: Quarterly (or twice a year)\n' +
      '- Participants: Leadership team and coach (4-10 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Growth trajectory review (20 min)\n' +
      '- [ ] Rhythm health check (20 min)\n' +
      '- [ ] System scorecard (20 min)\n' +
      '- [ ] Pick the next upgrade (20 min)\n' +
      '- [ ] Commit and protect momentum (10 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Read the multi-quarter trend, not a single quarter.\n' +
      '- Score every system honestly.\n' +
      '- Choose one high-leverage upgrade.\n' +
      '- Protect the rhythm that creates momentum.\n\n' +
      '## Notes\n\n' +
      'Growth trajectory:\n\n' +
      'Rhythm health:\n\n' +
      'System scores:\n\n' +
      'Next upgrade and owner:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/metronomics-compounding-growth-review\n',
  },
];
