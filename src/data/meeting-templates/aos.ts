// Accelerate Operating System (AOS) meeting templates for the /templates library.
// AUTHORED content. bodyHtml renders via <%- %>. Byte-stable: no Date.now,
// no randomness. See _types.ts for the shared contract.
//
// These agendas are based on the Accelerate Operating System (AOS) model, a
// quarterly-rhythm business operating system. They are independent
// interpretations of a generic operating rhythm and carry no affiliation or
// endorsement claim.

import type { MeetingTemplate } from './_types.js';

export const AOS_TEMPLATES: MeetingTemplate[] = [
  {
    slug: 'aos-annual-strategy',
    title: 'AOS Annual Strategy Meeting Template',
    shortName: 'AOS Annual Strategy Meeting',
    description:
      'Use this AOS annual strategy meeting template to set yearly direction, define annual priorities, refresh the scorecard, and cascade goals into quarters.',
    category: 'aos',
    methodology: 'Accelerate (AOS)',
    minutes: 480,
    cadence: 'Annually',
    participants: 'Leadership team and key contributors (6-15 people)',
    keywords: [
      'accelerate operating system',
      'AOS meeting template',
      'AOS annual strategy meeting template',
      'annual strategy meeting agenda',
      'annual planning meeting template',
      'yearly operating rhythm agenda',
      'annual priorities meeting',
      'leadership annual strategy template',
    ],
    steps: [
      { name: 'Year in review', minutes: 60, text: 'Review the past year against annual priorities and the scorecard. Name what was achieved, what slipped, and the lessons to carry forward.' },
      { name: 'Vision and long-term picture', minutes: 60, text: 'Reconnect with the long-term vision and the multi-year picture the annual plan must move the business toward.' },
      { name: 'Market and capability assessment', minutes: 75, text: 'Assess the external market and internal capabilities so the annual priorities are grounded in reality rather than optimism.' },
      { name: 'Set annual priorities', minutes: 90, text: 'Define a small set of annual priorities and the themes that organize the year, keeping the list short enough for the team to name from memory.' },
      { name: 'Refresh the annual scorecard', minutes: 75, text: 'Agree the handful of measurable numbers that show whether the business is on track across the year ahead.' },
      { name: 'Cascade to quarterly priorities', minutes: 60, text: 'Break annual priorities into a concrete first quarter and outline the rough shape of the remaining quarters, then assign owners.' },
    ],
    bodyHtml:
      '<p>The <strong>AOS annual strategy meeting</strong> sets the destination for the year and the first leg of the route. Based on the Accelerate Operating System (AOS) model, it sits at the top of a quarterly operating rhythm, turning a long-term vision into a short list of annual priorities, a refreshed scorecard, and the quarterly work that delivers them.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run this once a year, late in the current year or at the very start of the new one, so the team enters the year aligned. It anchors the rest of the rhythm: the annual session sets direction, and each quarter executes a leg of it.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Include the leadership team and the key contributors who will own annual priorities, usually six to fifteen people. The group should be wide enough to commit the organization yet small enough to make real decisions. Cascade the detail to teams afterward rather than crowding the room.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Begin with an honest year in review against last year priorities and the scorecard. Reconnect with vision, assess market and capabilities, then set a focused set of annual priorities and the numbers that will track them. Cascade those into a concrete first quarter with named owners before anyone leaves. <em>Note: this agenda is an independent interpretation of the AOS quarterly-rhythm model and is not affiliated with or endorsed by any provider.</em></p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Ground the year in an honest review before looking ahead.</li>' +
      '<li>Keep annual priorities few enough that the team can name them.</li>' +
      '<li>Tie every annual priority to a measurable scorecard number.</li>' +
      '<li>Cascade to quarterly priorities so the plan becomes executable.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Setting lofty annual goals with no quarterly execution path.</li>' +
      '<li>Skipping the honest review and repeating last year mistakes.</li>' +
      '<li>Producing a plan that lives in a deck and never in the work.</li>' +
      '<li>Defining no scorecard, so progress cannot be measured through the year.</li>' +
      '</ul>' +
      '<p>Turn the year ahead into a plan you can run. <a href="/l8">Run it in OrgTP</a> and connect annual priorities to quarterly and weekly execution, with OrgTP adapting to whatever cadence your team keeps.</p>',
    downloadMarkdown:
      '# AOS Annual Strategy Meeting Template\n\n' +
      'Purpose: Set yearly direction based on the Accelerate Operating System (AOS) model, define a short list of annual priorities, refresh the scorecard, and cascade goals into quarters with owners.\n\n' +
      '- Duration: 480 minutes (full day)\n' +
      '- Cadence: Annually\n' +
      '- Participants: Leadership team and key contributors (6-15 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Year in review against priorities and scorecard (60 min)\n' +
      '- [ ] Vision and long-term picture (60 min)\n' +
      '- [ ] Market and capability assessment (75 min)\n' +
      '- [ ] Set annual priorities (90 min)\n' +
      '- [ ] Refresh the annual scorecard (75 min)\n' +
      '- [ ] Cascade to quarterly priorities and owners (60 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Ground the year in an honest review first.\n' +
      '- Keep annual priorities few enough to name.\n' +
      '- Tie every priority to a measurable scorecard number.\n' +
      '- Cascade to quarterly priorities for execution.\n\n' +
      '## Notes\n\n' +
      'Year in review:\n\n' +
      'Annual priorities:\n\n' +
      'Scorecard:\n\n' +
      'Quarterly priorities and owners:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/aos-annual-strategy\n',
  },
  {
    slug: 'aos-quarterly-planning',
    title: 'AOS Quarterly Planning Meeting Template',
    shortName: 'AOS Quarterly Planning Meeting',
    description:
      'Use this AOS quarterly planning meeting template to review the quarter, reset priorities, refresh the scorecard, and commit the team to a focused 90-day plan.',
    category: 'aos',
    methodology: 'Accelerate (AOS)',
    minutes: 240,
    cadence: 'Quarterly',
    participants: 'Leadership team (5-12 people)',
    keywords: [
      'accelerate operating system',
      'AOS meeting template',
      'AOS quarterly planning meeting template',
      'quarterly planning meeting agenda',
      'quarterly priorities meeting template',
      'quarterly reset agenda',
      '90-day planning meeting',
      'quarterly operating rhythm template',
    ],
    steps: [
      { name: 'Check-in and prior quarter review', minutes: 30, text: 'Open with a brief check-in, then review last quarter priorities and scorecard to mark what was completed and what carries over.' },
      { name: 'Annual direction recap', minutes: 25, text: 'Restate the annual priorities so the quarter ahead stays anchored to the yearly plan rather than drifting into pet projects.' },
      { name: 'Issues list review', minutes: 40, text: 'Surface the open issues blocking progress, then discuss and resolve the most important ones so they do not pollute the new quarter.' },
      { name: 'Set quarterly priorities', minutes: 60, text: 'Define a small set of quarterly priorities, each clear, measurable, and owned by a single person, that move the annual plan forward.' },
      { name: 'Refresh the scorecard', minutes: 40, text: 'Confirm the weekly numbers that will signal whether the quarter is on track and set targets for each.' },
      { name: 'Commit and confirm rhythm', minutes: 45, text: 'Confirm owners, capture next steps, and agree the weekly and monthly cadence that keeps the quarter on pace.' },
    ],
    bodyHtml:
      '<p>The <strong>AOS quarterly planning meeting</strong> is where a focused 90-day plan gets decided. Based on the Accelerate Operating System (AOS) model, it closes the prior quarter honestly, clears the issues list, and sets a small set of quarterly priorities tied to the annual direction.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run it at the start of every quarter, ideally in the week before the new quarter begins so owners start clean. It is the hinge of the operating rhythm, translating annual priorities into the next 90 days of work.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Keep the room to the leadership team, five to twelve people who can both shape and commit to the plan. Larger groups slow decisions and dilute ownership, so cascade detailed team priorities in follow-up sessions rather than the main planning meeting.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Start with a quick check-in and an honest review of last quarter against priorities and the scorecard. Recap the annual direction, work the issues list so blockers are resolved, then set quarterly priorities with one owner each. Refresh the scorecard and close by confirming the weekly cadence. <em>Note: this agenda is an independent interpretation of the AOS quarterly-rhythm model and is not affiliated with or endorsed by any provider.</em></p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Cap quarterly priorities at a handful so focus survives contact with the quarter.</li>' +
      '<li>Resolve the biggest issues before setting new priorities.</li>' +
      '<li>Give every priority a single accountable owner.</li>' +
      '<li>Tie each priority back to an annual priority before it earns a slot.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Setting too many priorities so attention fragments and nothing moves.</li>' +
      '<li>Skipping the prior-quarter review and repeating the same misses.</li>' +
      '<li>Leaving issues unresolved so they drag into the new quarter.</li>' +
      '<li>Ending without owners, so priorities have no clear home.</li>' +
      '</ul>' +
      '<p>Make your next quarter count. <a href="/l8">Run it in OrgTP</a> and keep priorities, scorecard, and issues visible week to week, with OrgTP adapting to your cadence.</p>',
    downloadMarkdown:
      '# AOS Quarterly Planning Meeting Template\n\n' +
      'Purpose: Review the quarter using the Accelerate Operating System (AOS) model, clear the issues list, set a focused set of quarterly priorities and scorecard targets, and commit the team to a 90-day plan.\n\n' +
      '- Duration: 240 minutes\n' +
      '- Cadence: Quarterly\n' +
      '- Participants: Leadership team (5-12 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Check-in and prior quarter review (30 min)\n' +
      '- [ ] Annual direction recap (25 min)\n' +
      '- [ ] Issues list review and resolution (40 min)\n' +
      '- [ ] Set quarterly priorities (60 min)\n' +
      '- [ ] Refresh the scorecard and targets (40 min)\n' +
      '- [ ] Commit, owners, and confirm rhythm (45 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Cap quarterly priorities at a handful.\n' +
      '- Resolve the biggest issues before setting priorities.\n' +
      '- Give every priority a single accountable owner.\n' +
      '- Tie each priority back to an annual priority.\n\n' +
      '## Notes\n\n' +
      'Prior quarter review:\n\n' +
      'Quarterly priorities:\n\n' +
      'Scorecard targets:\n\n' +
      'Owners and rhythm:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/aos-quarterly-planning\n',
  },
  {
    slug: 'aos-monthly-business-review',
    title: 'AOS Monthly Business Review Template',
    shortName: 'AOS Monthly Business Review',
    description:
      'Use this AOS monthly business review template to check quarterly priorities, review the scorecard month to date, resolve issues, and keep the quarter on pace.',
    category: 'aos',
    methodology: 'Accelerate (AOS)',
    minutes: 90,
    cadence: 'Monthly',
    participants: 'Leadership team (5-10 people)',
    keywords: [
      'accelerate operating system',
      'AOS meeting template',
      'AOS monthly business review template',
      'monthly business review agenda',
      'monthly review meeting template',
      'monthly priorities check-in agenda',
      'monthly scorecard review',
      'monthly operating rhythm template',
    ],
    steps: [
      { name: 'Check-in and wins', minutes: 10, text: 'Quick personal and business check-in, then a short round of the most important wins since the last monthly review.' },
      { name: 'Scorecard month to date', minutes: 20, text: 'Walk the scorecard for the month, comparing each number against its target and flagging any that are off track.' },
      { name: 'Quarterly priorities status', minutes: 20, text: 'Mark each quarterly priority on track or off track and have owners explain anything at risk with enough lead time to act.' },
      { name: 'Issues list review', minutes: 25, text: 'Prioritize the open issues, then discuss and resolve the most important ones, capturing decisions and owners.' },
      { name: 'Course corrections and actions', minutes: 10, text: 'Agree the adjustments needed to keep the quarter on pace and assign concrete next steps with owners.' },
      { name: 'Wrap and cascade', minutes: 5, text: 'Recap decisions, confirm who communicates what to their teams, and rate the meeting briefly to improve it next time.' },
    ],
    bodyHtml:
      '<p>The <strong>AOS monthly business review</strong> is the mid-quarter checkpoint that keeps a 90-day plan from drifting. Based on the Accelerate Operating System (AOS) model, it reviews the scorecard and quarterly priorities, works the issues list, and makes the course corrections a quarter needs to stay on pace.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run it once a month between quarterly planning sessions, on a fixed day so it becomes a reliable ritual. It sits between the fast weekly meeting and the deeper quarterly reset, giving leaders a monthly altitude check.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Keep it to the leadership team, five to ten people who own quarterly priorities and scorecard numbers. This is a working session for the people accountable for the quarter, not a broadcast for stakeholders.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Open with a fast check-in and wins, then move to the scorecard month to date and the status of each quarterly priority. Spend the real time on the issues list, resolving the few that matter most, then agree course corrections and owners. <em>Note: this agenda is an independent interpretation of the AOS quarterly-rhythm model and is not affiliated with or endorsed by any provider.</em></p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Demand a number for every scorecard line, not a narrative.</li>' +
      '<li>Treat an off-track priority as a prompt to act, not to explain it away.</li>' +
      '<li>Spend the bulk of the meeting resolving issues, not reporting status.</li>' +
      '<li>Close every issue with a decision and an owner.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Letting the review become a status meeting with no decisions.</li>' +
      '<li>Reviewing the scorecard without acting on the red numbers.</li>' +
      '<li>Naming issues but never resolving them.</li>' +
      '<li>Skipping course corrections until the quarter is already lost.</li>' +
      '</ul>' +
      '<p>Keep the quarter on track. <a href="/l8">Run it in OrgTP</a> and keep the scorecard, priorities, and issues live between reviews, with OrgTP adapting to your cadence.</p>',
    downloadMarkdown:
      '# AOS Monthly Business Review Template\n\n' +
      'Purpose: Check quarterly priorities and the scorecard month to date using the Accelerate Operating System (AOS) model, resolve the most important issues, and make the course corrections that keep the quarter on pace.\n\n' +
      '- Duration: 90 minutes\n' +
      '- Cadence: Monthly\n' +
      '- Participants: Leadership team (5-10 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Check-in and wins (10 min)\n' +
      '- [ ] Scorecard month to date vs targets (20 min)\n' +
      '- [ ] Quarterly priorities status (20 min)\n' +
      '- [ ] Issues list review and resolution (25 min)\n' +
      '- [ ] Course corrections and actions (10 min)\n' +
      '- [ ] Wrap and cascade (5 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Require a number for every scorecard line.\n' +
      '- Treat an off-track priority as a prompt to act.\n' +
      '- Spend the bulk of the meeting resolving issues.\n' +
      '- Close every issue with a decision and an owner.\n\n' +
      '## Notes\n\n' +
      'Scorecard status:\n\n' +
      'Priorities at risk:\n\n' +
      'Issues resolved:\n\n' +
      'Course corrections and owners:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/aos-monthly-business-review\n',
  },
  {
    slug: 'aos-weekly-team-meeting',
    title: 'AOS Weekly Team Meeting Template',
    shortName: 'AOS Weekly Team Meeting',
    description:
      'Use this AOS weekly team meeting template to review the scorecard, check priorities, and work the issues list so the team solves the right problems each week.',
    category: 'aos',
    methodology: 'Accelerate (AOS)',
    minutes: 90,
    cadence: 'Weekly',
    participants: 'Team or leadership team (3-10 people)',
    keywords: [
      'accelerate operating system',
      'AOS meeting template',
      'AOS weekly team meeting template',
      'weekly team meeting agenda',
      'weekly meeting template',
      'weekly scorecard review agenda',
      'weekly issues meeting',
      'weekly operating rhythm template',
    ],
    steps: [
      { name: 'Check-in and good news', minutes: 5, text: 'A quick round of personal and business good news to open the meeting on a human note and build momentum.' },
      { name: 'Scorecard review', minutes: 10, text: 'Walk each scorecard number against target. Anything off track becomes an issue for the list rather than a discussion now.' },
      { name: 'Priorities check', minutes: 10, text: 'Each owner reports their quarterly priorities as on track or off track. Off-track items drop to the issues list.' },
      { name: 'Action items and updates', minutes: 10, text: 'Review last week action items, mark them done or not, and clear short updates that need no discussion.' },
      { name: 'Issues list: identify, discuss, solve', minutes: 50, text: 'Spend the heart of the meeting prioritizing the issues list and solving the top issues one at a time, capturing actions.' },
      { name: 'Wrap and rating', minutes: 5, text: 'Recap new action items and owners, confirm what cascades to teams, and rate the meeting to keep it sharp.' },
    ],
    bodyHtml:
      '<p>The <strong>AOS weekly team meeting</strong> is the heartbeat of the operating rhythm. Based on the Accelerate Operating System (AOS) model, it follows a fixed structure: a fast scan of the scorecard and priorities to find what is off track, then the bulk of the time spent solving the issues that surface.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run it the same day and time every week so it becomes a dependable ritual rather than a meeting people negotiate around. It keeps the quarter moving between monthly reviews and quarterly resets.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Keep it to the team that shares a scorecard, three to ten people who own numbers and priorities. A tight room keeps the pace fast and the problem-solving honest. Stakeholders who only need updates can read the notes instead.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Open with good news, then move fast through the scorecard, priorities, and action items, turning anything off track into an issue rather than debating it in the moment. Protect the largest block for the issues list: identify the real problem, discuss it, and solve it for good. <em>Note: this agenda is an independent interpretation of the AOS quarterly-rhythm model and is not affiliated with or endorsed by any provider.</em></p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Keep the reporting segments fast so the issues list gets the time.</li>' +
      '<li>Move off-track items to issues instead of solving them mid-report.</li>' +
      '<li>Solve issues at the root, not the symptom, even if it takes the whole block.</li>' +
      '<li>Close every issue with an action, an owner, and a date.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Letting the reporting segments swell and starving the issues list.</li>' +
      '<li>Reporting activity instead of movement on the actual numbers.</li>' +
      '<li>Solving symptoms each week so the same issue returns.</li>' +
      '<li>Ending without clear action items and owners.</li>' +
      '</ul>' +
      '<p>Make the weekly meeting earn its slot. <a href="/l8">Run it in OrgTP</a> and keep the scorecard, priorities, and issues live week to week, with OrgTP adapting to your cadence.</p>',
    downloadMarkdown:
      '# AOS Weekly Team Meeting Template\n\n' +
      'Purpose: Review the scorecard and priorities using the Accelerate Operating System (AOS) model, then spend most of the meeting working the issues list so the team solves the right problems at the root.\n\n' +
      '- Duration: 90 minutes\n' +
      '- Cadence: Weekly\n' +
      '- Participants: Team or leadership team (3-10 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Check-in and good news (5 min)\n' +
      '- [ ] Scorecard review vs targets (10 min)\n' +
      '- [ ] Priorities check, on or off track (10 min)\n' +
      '- [ ] Action items and short updates (10 min)\n' +
      '- [ ] Issues list: identify, discuss, solve (50 min)\n' +
      '- [ ] Wrap, owners, and rating (5 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Keep reporting segments fast so issues get the time.\n' +
      '- Move off-track items to issues, do not solve mid-report.\n' +
      '- Solve issues at the root, not the symptom.\n' +
      '- Close every issue with an action, owner, and date.\n\n' +
      '## Notes\n\n' +
      'Scorecard flags:\n\n' +
      'Priorities off track:\n\n' +
      'Issues solved:\n\n' +
      'Action items and owners:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/aos-weekly-team-meeting\n',
  },
  {
    slug: 'aos-daily-huddle',
    title: 'AOS Daily Huddle Template',
    shortName: 'AOS Daily Huddle',
    description:
      'Use this AOS daily huddle template to run a short standing meeting that shares quick metrics, surfaces stuck points, and clears blockers in fifteen minutes.',
    category: 'aos',
    methodology: 'Accelerate (AOS)',
    minutes: 15,
    cadence: 'Daily',
    participants: 'Team members (3-12 people)',
    keywords: [
      'accelerate operating system',
      'AOS meeting template',
      'AOS daily huddle template',
      'daily huddle agenda',
      'daily standup meeting template',
      'daily huddle template',
      'team huddle agenda',
      'daily operating rhythm template',
    ],
    steps: [
      { name: 'Quick metrics', minutes: 3, text: 'Share the one or two daily numbers the team watches so everyone starts the day with the same picture of where things stand.' },
      { name: 'Today priorities', minutes: 5, text: 'Each person names the single most important thing they will move today, keeping it to one line not a status report.' },
      { name: 'Stuck points and blockers', minutes: 5, text: 'Anyone who is stuck names the blocker in a sentence. The huddle decides who helps, then takes the detail offline.' },
      { name: 'Quick wrap', minutes: 2, text: 'Confirm any handoffs and who is connecting after the huddle, then end on time so the standing meeting stays short.' },
    ],
    bodyHtml:
      '<p>The <strong>AOS daily huddle</strong> is a short standing meeting that keeps a team in sync without eating the day. Based on the Accelerate Operating System (AOS) model, it shares a couple of quick metrics, names today priorities, and surfaces blockers so help arrives the same morning rather than days later.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run it every working day at the same time, ideally early, so the team aligns before the day fills up. It works best for teams moving fast on shared work where small misalignments would otherwise compound over a week.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Keep it to the working team, three to twelve people, standing if you can so the meeting stays brief. Anyone with a clear, repeating reason to align belongs; everyone else can read the notes.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Share the quick metrics, then go around for one-line priorities and any stuck points. The huddle is for surfacing blockers, not solving them: decide who helps, then take the detail offline so the meeting ends on time. <em>Note: this agenda is an independent interpretation of the AOS quarterly-rhythm model and is not affiliated with or endorsed by any provider.</em></p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Keep it standing and time-boxed so it never creeps past fifteen minutes.</li>' +
      '<li>Limit each person to one priority and one blocker.</li>' +
      '<li>Surface blockers in the huddle, solve them after it.</li>' +
      '<li>Hold the same time every day so it becomes automatic.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Letting the huddle balloon into a full status meeting.</li>' +
      '<li>Solving blockers in the room and dragging everyone in.</li>' +
      '<li>Turning quick updates into long narratives.</li>' +
      '<li>Skipping days so the rhythm never sets.</li>' +
      '</ul>' +
      '<p>Keep the team aligned without the meeting tax. <a href="/l8">Run it in OrgTP</a> and keep daily metrics and blockers visible, with OrgTP adapting to your cadence.</p>',
    downloadMarkdown:
      '# AOS Daily Huddle Template\n\n' +
      'Purpose: Run a short standing meeting based on the Accelerate Operating System (AOS) model that shares quick metrics, names today priorities, and surfaces blockers so help arrives the same day.\n\n' +
      '- Duration: 15 minutes\n' +
      '- Cadence: Daily\n' +
      '- Participants: Team members (3-12 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Quick metrics (3 min)\n' +
      '- [ ] Today priorities, one line each (5 min)\n' +
      '- [ ] Stuck points and blockers (5 min)\n' +
      '- [ ] Quick wrap and handoffs (2 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Keep it standing and time-boxed.\n' +
      '- Limit each person to one priority and one blocker.\n' +
      '- Surface blockers in the huddle, solve them after.\n' +
      '- Hold the same time every day.\n\n' +
      '## Notes\n\n' +
      'Metrics:\n\n' +
      'Priorities:\n\n' +
      'Blockers and who helps:\n\n' +
      'Handoffs:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/aos-daily-huddle\n',
  },
  {
    slug: 'aos-leadership-meeting',
    title: 'AOS Leadership Team Meeting Template',
    shortName: 'AOS Leadership Team Meeting',
    description:
      'Use this AOS leadership team meeting template to align senior leaders on the scorecard, quarterly priorities, and the issues that only leadership can resolve.',
    category: 'aos',
    methodology: 'Accelerate (AOS)',
    minutes: 90,
    cadence: 'Weekly',
    participants: 'Senior leadership team (4-9 people)',
    keywords: [
      'accelerate operating system',
      'AOS meeting template',
      'AOS leadership team meeting template',
      'leadership team meeting agenda',
      'leadership meeting template',
      'executive team meeting agenda',
      'leadership issues meeting',
      'leadership operating rhythm template',
    ],
    steps: [
      { name: 'Check-in and segue', minutes: 5, text: 'A brief personal and business check-in to transition leaders out of their day and into the team conversation.' },
      { name: 'Scorecard review', minutes: 10, text: 'Walk the leadership scorecard against target. Off-track numbers become issues rather than discussion in this segment.' },
      { name: 'Quarterly priorities check', minutes: 10, text: 'Each leader reports their quarterly priorities as on track or off track. Off-track items drop to the issues list.' },
      { name: 'Customer and team headlines', minutes: 5, text: 'Share a few short headlines about customers and employees that the team should know, dropping any that need discussion to issues.' },
      { name: 'Issues list: identify, discuss, solve', minutes: 50, text: 'Spend the core of the meeting prioritizing and solving the company-level issues only leadership can resolve.' },
      { name: 'Wrap, cascade, and rating', minutes: 10, text: 'Recap action items and owners, confirm what cascades to the rest of the company, and rate the meeting.' },
    ],
    bodyHtml:
      '<p>The <strong>AOS leadership team meeting</strong> is the senior version of the weekly rhythm. Based on the Accelerate Operating System (AOS) model, it keeps leaders aligned on the company scorecard and quarterly priorities, then spends most of its time solving the cross-functional issues only leadership can resolve.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run it weekly, same day and time, as the anchor meeting for the senior team. It is where company-level problems get worked, distinct from the departmental weekly meetings that handle issues closer to the front line.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Keep it to the senior leadership team, four to nine people who own a function and a slice of the company scorecard. The room should be small enough for candid debate and the authority to actually decide.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Open with a quick check-in, then move fast through the scorecard, priorities, and headlines, sending anything off track or needing discussion to the issues list. Protect the large block for solving those issues at the root, then confirm what cascades to the rest of the company. <em>Note: this agenda is an independent interpretation of the AOS quarterly-rhythm model and is not affiliated with or endorsed by any provider.</em></p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Keep the reporting segments brief so the issues list gets the time.</li>' +
      '<li>Route off-track items to issues rather than debating them mid-report.</li>' +
      '<li>Solve company-level issues at the root, not the symptom.</li>' +
      '<li>Decide what cascades so the rest of the company stays aligned.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Spending the meeting reporting instead of solving.</li>' +
      '<li>Working departmental issues that belong one level down.</li>' +
      '<li>Solving symptoms so the same company issue keeps returning.</li>' +
      '<li>Forgetting to cascade decisions to the wider team.</li>' +
      '</ul>' +
      '<p>Run a leadership meeting that decides. <a href="/l8">Run it in OrgTP</a> and keep the scorecard, priorities, and issues live for the senior team, with OrgTP adapting to your cadence.</p>',
    downloadMarkdown:
      '# AOS Leadership Team Meeting Template\n\n' +
      'Purpose: Align senior leaders using the Accelerate Operating System (AOS) model on the company scorecard and quarterly priorities, then solve the cross-functional issues only leadership can resolve.\n\n' +
      '- Duration: 90 minutes\n' +
      '- Cadence: Weekly\n' +
      '- Participants: Senior leadership team (4-9 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Check-in and segue (5 min)\n' +
      '- [ ] Scorecard review vs targets (10 min)\n' +
      '- [ ] Quarterly priorities check (10 min)\n' +
      '- [ ] Customer and team headlines (5 min)\n' +
      '- [ ] Issues list: identify, discuss, solve (50 min)\n' +
      '- [ ] Wrap, cascade, and rating (10 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Keep reporting segments brief so issues get the time.\n' +
      '- Route off-track items to issues, not mid-report debate.\n' +
      '- Solve company-level issues at the root.\n' +
      '- Decide what cascades to the rest of the company.\n\n' +
      '## Notes\n\n' +
      'Scorecard flags:\n\n' +
      'Priorities off track:\n\n' +
      'Issues solved:\n\n' +
      'Action items, owners, and cascade:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/aos-leadership-meeting\n',
  },
  {
    slug: 'aos-scorecard-review',
    title: 'AOS Scorecard Review Template',
    shortName: 'AOS Scorecard Review',
    description:
      'Use this AOS scorecard review template to walk weekly numbers against targets, spot off-track metrics early, and turn red numbers into owned issues to solve.',
    category: 'aos',
    methodology: 'Accelerate (AOS)',
    minutes: 30,
    cadence: 'Weekly',
    participants: 'Team and metric owners (3-8 people)',
    keywords: [
      'accelerate operating system',
      'AOS meeting template',
      'AOS scorecard review template',
      'scorecard review meeting agenda',
      'weekly scorecard review template',
      'business scorecard meeting',
      'metrics review agenda',
      'KPI scorecard review template',
    ],
    steps: [
      { name: 'Confirm the numbers are in', minutes: 5, text: 'Check that every scorecard line has a current number and a target so the review works from data, not memory.' },
      { name: 'Walk each metric vs target', minutes: 12, text: 'Go line by line, reading the actual against target and marking each on track or off track without debating yet.' },
      { name: 'Flag and discuss off-track metrics', minutes: 8, text: 'For each off-track number, take a quick read on why and decide whether it needs an issue, an owner, and a deadline.' },
      { name: 'Convert red numbers to issues', minutes: 3, text: 'Log every metric that needs action as an issue with an owner so it is solved rather than re-noticed next week.' },
      { name: 'Confirm owners and next read', minutes: 2, text: 'Confirm who owns each new issue and when the metric will be read again to check the trend is moving.' },
    ],
    bodyHtml:
      '<p>The <strong>AOS scorecard review</strong> is a short, metric-driven meeting that keeps a small set of numbers honest. Based on the Accelerate Operating System (AOS) model, it walks each weekly metric against its target, flags what is off track early, and converts red numbers into owned issues before they become a bad quarter.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run it weekly, either as a standalone review or as the scorecard segment inside your weekly team meeting. The value comes from reading the same numbers on the same day every week so a downward trend shows up after one or two reads, not at quarter end.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Keep it tight: the metric owners and the people who can act on the numbers, three to eight people. This is a working review, not a dashboard presentation for an audience.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Confirm every line has a current number, then walk the scorecard reading actual against target and marking on or off track without debating in the moment. For the red numbers, take a fast read on why and convert each into an issue with an owner and a deadline. <em>Note: this agenda is an independent interpretation of the AOS quarterly-rhythm model and is not affiliated with or endorsed by any provider.</em></p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Require a number and a target for every line before the review starts.</li>' +
      '<li>Mark on or off track fast; save the why for the off-track items.</li>' +
      '<li>Treat a single red week as an early signal, not a crisis.</li>' +
      '<li>Convert every red number into an owned issue, not just a note.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Debating every line and blowing the time box.</li>' +
      '<li>Reading numbers without ever acting on the red ones.</li>' +
      '<li>Letting lines have no target so on or off track is meaningless.</li>' +
      '<li>Flagging issues with no owner, so nothing changes.</li>' +
      '</ul>' +
      '<p>Catch problems while they are small. <a href="/l8">Run it in OrgTP</a> and keep your scorecard, targets, and issues connected week to week, with OrgTP adapting to your cadence.</p>',
    downloadMarkdown:
      '# AOS Scorecard Review Template\n\n' +
      'Purpose: Walk weekly numbers against targets using the Accelerate Operating System (AOS) model, spot off-track metrics early, and convert red numbers into owned issues to solve.\n\n' +
      '- Duration: 30 minutes\n' +
      '- Cadence: Weekly\n' +
      '- Participants: Team and metric owners (3-8 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Confirm every line has a number and target (5 min)\n' +
      '- [ ] Walk each metric vs target (12 min)\n' +
      '- [ ] Flag and discuss off-track metrics (8 min)\n' +
      '- [ ] Convert red numbers to issues (3 min)\n' +
      '- [ ] Confirm owners and next read (2 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Require a number and target for every line.\n' +
      '- Mark on or off track fast; save why for the reds.\n' +
      '- Treat a single red week as an early signal.\n' +
      '- Convert every red number into an owned issue.\n\n' +
      '## Notes\n\n' +
      'Off-track metrics:\n\n' +
      'Likely causes:\n\n' +
      'New issues and owners:\n\n' +
      'Next read date:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/aos-scorecard-review\n',
  },
  {
    slug: 'aos-priorities-review',
    title: 'AOS Quarterly Priorities Review Template',
    shortName: 'AOS Quarterly Priorities Review',
    description:
      'Use this AOS quarterly priorities review template to check each priority on or off track, unblock at-risk owners, and keep the 90-day plan moving with intent.',
    category: 'aos',
    methodology: 'Accelerate (AOS)',
    minutes: 45,
    cadence: 'Monthly',
    participants: 'Leadership team and priority owners (4-10 people)',
    keywords: [
      'accelerate operating system',
      'AOS meeting template',
      'AOS quarterly priorities review template',
      'quarterly priorities review agenda',
      'priorities review meeting template',
      'priorities check-in agenda',
      '90-day priorities review',
      'quarterly goals review template',
    ],
    steps: [
      { name: 'Recap the quarter direction', minutes: 5, text: 'Restate the quarterly priorities and how far through the quarter the team is so the review keeps a sense of pace.' },
      { name: 'On track or off track round', minutes: 15, text: 'Each owner reports their priorities as on track or off track in a single word before any discussion, to keep the round honest and fast.' },
      { name: 'Dig into at-risk priorities', minutes: 15, text: 'For the off-track priorities, owners explain what is in the way and the group decides what unblocks each one.' },
      { name: 'Reset or re-resource as needed', minutes: 7, text: 'Decide whether any priority needs more help, a reset milestone, or, rarely, to be dropped so the rest can finish.' },
      { name: 'Confirm actions and owners', minutes: 3, text: 'Capture the concrete actions that move at-risk priorities and confirm who owns each, by when.' },
    ],
    bodyHtml:
      '<p>The <strong>AOS quarterly priorities review</strong> is a focused check on whether the 90-day plan is actually getting done. Based on the Accelerate Operating System (AOS) model, it has owners declare each priority on or off track, then spends its time unblocking the ones at risk while there is still runway to finish.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run it monthly within the quarter, or more often near quarter end when priorities are coming due. It pairs with the scorecard review: the scorecard watches the numbers, this review watches the commitments.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Keep it to the leadership team and the priority owners, four to ten people. The room needs the people accountable for the work and the authority to reallocate help when something is stuck.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Recap the quarter direction and pace, then run a fast on-or-off-track round so the picture is honest before discussion. Spend the bulk of the time on the at-risk priorities, deciding what unblocks each and whether anything needs more help or a reset. <em>Note: this agenda is an independent interpretation of the AOS quarterly-rhythm model and is not affiliated with or endorsed by any provider.</em></p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Run the on-or-off-track round before any discussion to keep it honest.</li>' +
      '<li>Spend the time on at-risk priorities, not the ones already on track.</li>' +
      '<li>Decide help and resets early enough that they still matter.</li>' +
      '<li>Close every at-risk priority with a concrete action and owner.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Letting owners narrate progress instead of declaring on or off track.</li>' +
      '<li>Spending time on on-track priorities while at-risk ones stall.</li>' +
      '<li>Noticing a priority is stuck but never reallocating help.</li>' +
      '<li>Ending with discussion but no concrete actions.</li>' +
      '</ul>' +
      '<p>Keep your priorities from drifting. <a href="/l8">Run it in OrgTP</a> and keep priorities, owners, and the actions that unblock them visible, with OrgTP adapting to your cadence.</p>',
    downloadMarkdown:
      '# AOS Quarterly Priorities Review Template\n\n' +
      'Purpose: Check each priority on or off track using the Accelerate Operating System (AOS) model, unblock at-risk owners, and keep the 90-day plan moving with intent.\n\n' +
      '- Duration: 45 minutes\n' +
      '- Cadence: Monthly (more often near quarter end)\n' +
      '- Participants: Leadership team and priority owners (4-10 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Recap the quarter direction and pace (5 min)\n' +
      '- [ ] On track or off track round (15 min)\n' +
      '- [ ] Dig into at-risk priorities (15 min)\n' +
      '- [ ] Reset or re-resource as needed (7 min)\n' +
      '- [ ] Confirm actions and owners (3 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Run the on-or-off-track round before discussion.\n' +
      '- Spend the time on at-risk priorities only.\n' +
      '- Decide help and resets early enough to matter.\n' +
      '- Close every at-risk priority with an action and owner.\n\n' +
      '## Notes\n\n' +
      'Off-track priorities:\n\n' +
      'Blockers:\n\n' +
      'Resets or added help:\n\n' +
      'Actions and owners:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/aos-priorities-review\n',
  },
  {
    slug: 'aos-issues-resolution',
    title: 'AOS Issues Resolution Meeting Template',
    shortName: 'AOS Issues Resolution Meeting',
    description:
      'Use this AOS issues resolution meeting template to prioritize the issues list, get to the root of each problem, and solve the few that matter most with owners.',
    category: 'aos',
    methodology: 'Accelerate (AOS)',
    minutes: 60,
    cadence: 'As needed',
    participants: 'Team or leadership team (4-10 people)',
    keywords: [
      'accelerate operating system',
      'AOS meeting template',
      'AOS issues resolution meeting template',
      'issues resolution meeting agenda',
      'issues list meeting template',
      'problem solving meeting agenda',
      'issue solving meeting template',
      'root cause meeting template',
    ],
    steps: [
      { name: 'Build and review the issues list', minutes: 10, text: 'Collect open issues into one visible list and add anything new, so the team is working from a complete picture.' },
      { name: 'Prioritize the top issues', minutes: 10, text: 'Rank the list by impact and urgency and pick the few worth solving today rather than trying to touch every item.' },
      { name: 'Identify the real problem', minutes: 15, text: 'For each top issue, dig past the symptom to the underlying problem so the solution holds rather than recurring.' },
      { name: 'Discuss and decide the solution', minutes: 15, text: 'Debate openly, then converge on a clear decision for each issue rather than leaving it as an unresolved discussion.' },
      { name: 'Assign actions and owners', minutes: 7, text: 'Translate each solved issue into a concrete action with a single owner and a deadline so the fix actually happens.' },
      { name: 'Confirm what is solved and parked', minutes: 3, text: 'Recap which issues are solved, which are parked with a reason, and what carries to the next meeting.' },
    ],
    bodyHtml:
      '<p>The <strong>AOS issues resolution meeting</strong> exists to actually solve problems, not just discuss them. Based on the Accelerate Operating System (AOS) model, it prioritizes the issues list, gets to the root of the few that matter most, and turns each into a decision with an owner so the same problem does not return next week.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run it whenever the issues list has grown faster than your regular meetings can clear it, or when a cluster of related problems needs dedicated time. Many teams use it as a focused working session between weekly meetings.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Bring the people who can actually decide and act on the issues, four to ten of them. Include enough cross-functional perspective to find the real problem, but keep it small enough to reach decisions.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Build the issues list, prioritize ruthlessly, and resist the urge to touch every item. For each top issue, identify the real problem beneath the symptom, discuss it openly, and land on a decision with an owner and a deadline. Solving three issues for good beats discussing ten. <em>Note: this agenda is an independent interpretation of the AOS quarterly-rhythm model and is not affiliated with or endorsed by any provider.</em></p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Prioritize hard and solve the top few completely.</li>' +
      '<li>Push past the symptom to the underlying problem every time.</li>' +
      '<li>Drive each issue to a decision, not an open-ended discussion.</li>' +
      '<li>Close every solved issue with an owner and a deadline.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Trying to touch every issue and solving none of them.</li>' +
      '<li>Treating symptoms so the same issue returns next week.</li>' +
      '<li>Discussing endlessly without ever deciding.</li>' +
      '<li>Solving an issue but assigning no owner to act.</li>' +
      '</ul>' +
      '<p>Turn your issues list into resolved problems. <a href="/l8">Run it in OrgTP</a> and keep issues, decisions, and owners in one trusted place, with OrgTP adapting to your cadence.</p>',
    downloadMarkdown:
      '# AOS Issues Resolution Meeting Template\n\n' +
      'Purpose: Prioritize the issues list using the Accelerate Operating System (AOS) model, get to the root of each problem, and solve the few that matter most with clear owners.\n\n' +
      '- Duration: 60 minutes\n' +
      '- Cadence: As needed\n' +
      '- Participants: Team or leadership team (4-10 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Build and review the issues list (10 min)\n' +
      '- [ ] Prioritize the top issues (10 min)\n' +
      '- [ ] Identify the real problem (15 min)\n' +
      '- [ ] Discuss and decide the solution (15 min)\n' +
      '- [ ] Assign actions and owners (7 min)\n' +
      '- [ ] Confirm what is solved and parked (3 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Prioritize hard and solve the top few completely.\n' +
      '- Push past the symptom to the real problem.\n' +
      '- Drive each issue to a decision.\n' +
      '- Close every solved issue with an owner and deadline.\n\n' +
      '## Notes\n\n' +
      'Top issues:\n\n' +
      'Root problems:\n\n' +
      'Decisions:\n\n' +
      'Actions, owners, and parked items:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/aos-issues-resolution\n',
  },
  {
    slug: 'aos-90-day-planning',
    title: 'AOS 90-Day Planning Session Template',
    shortName: 'AOS 90-Day Planning Session',
    description:
      'Use this AOS 90-day planning session template to translate annual direction into a focused set of quarterly priorities, scorecard targets, and owned next steps.',
    category: 'aos',
    methodology: 'Accelerate (AOS)',
    minutes: 180,
    cadence: 'Quarterly',
    participants: 'Leadership team (5-12 people)',
    keywords: [
      'accelerate operating system',
      'AOS meeting template',
      'AOS 90-day planning session template',
      '90-day planning session agenda',
      '90 day plan meeting template',
      'quarterly sprint planning agenda',
      '90-day priorities planning',
      'quarterly planning session template',
    ],
    steps: [
      { name: 'Ground in annual direction', minutes: 20, text: 'Restate the annual priorities and themes so the 90-day plan extends the year rather than starting a new and unrelated agenda.' },
      { name: 'Review the last 90 days', minutes: 30, text: 'Assess the prior 90 days against priorities and the scorecard, capturing what worked, what slipped, and what carries over.' },
      { name: 'Surface candidate priorities', minutes: 35, text: 'Collect candidate priorities from across the team into one visible list, tied to the annual direction and current reality.' },
      { name: 'Choose the few that matter', minutes: 45, text: 'Debate and narrow to a small set of quarterly priorities the team can realistically finish in 90 days, each with one owner.' },
      { name: 'Set scorecard targets', minutes: 30, text: 'Confirm the weekly numbers and targets that will signal whether the 90 days are on track.' },
      { name: 'Sequence first steps and rhythm', minutes: 20, text: 'Define the first concrete steps for each priority and confirm the weekly cadence that keeps the 90 days moving.' },
    ],
    bodyHtml:
      '<p>The <strong>AOS 90-day planning session</strong> turns a year of intent into the next 90 days of focused work. Based on the Accelerate Operating System (AOS) model, it grounds the team in annual direction, reviews the last quarter honestly, and lands on a short set of quarterly priorities the team can actually finish.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run it at the start of each quarter. It is a deeper, working version of quarterly planning, useful when the team wants real time to debate trade-offs and sequence the first steps rather than just listing priorities.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Keep it to the leadership team, five to twelve people who shape and commit to the plan. Cascade the detailed team-level priorities afterward so the main session stays focused on the few that matter most.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Ground everyone in annual direction, review the last 90 days against priorities and the scorecard, then surface candidates into one list. Narrow hard to a set the team can finish in 90 days, give each an owner, set scorecard targets, and sequence the first steps. The discipline is choosing few. <em>Note: this agenda is an independent interpretation of the AOS quarterly-rhythm model and is not affiliated with or endorsed by any provider.</em></p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Anchor every candidate priority to the annual direction.</li>' +
      '<li>Choose a set the team can realistically finish in 90 days.</li>' +
      '<li>Give each priority a single accountable owner.</li>' +
      '<li>Sequence the first concrete steps before leaving the room.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Overloading the quarter so nothing actually finishes.</li>' +
      '<li>Setting priorities with no link to the annual plan.</li>' +
      '<li>Skipping the review of the last 90 days and repeating misses.</li>' +
      '<li>Leaving without owners, targets, or first steps.</li>' +
      '</ul>' +
      '<p>Make the next 90 days count. <a href="/l8">Run it in OrgTP</a> and connect annual direction to quarterly priorities and weekly execution, with OrgTP adapting to your cadence.</p>',
    downloadMarkdown:
      '# AOS 90-Day Planning Session Template\n\n' +
      'Purpose: Translate annual direction into a focused set of quarterly priorities using the Accelerate Operating System (AOS) model, with scorecard targets, owners, and sequenced first steps.\n\n' +
      '- Duration: 180 minutes\n' +
      '- Cadence: Quarterly\n' +
      '- Participants: Leadership team (5-12 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Ground in annual direction (20 min)\n' +
      '- [ ] Review the last 90 days vs priorities and scorecard (30 min)\n' +
      '- [ ] Surface candidate priorities (35 min)\n' +
      '- [ ] Choose the few that matter, with owners (45 min)\n' +
      '- [ ] Set scorecard targets (30 min)\n' +
      '- [ ] Sequence first steps and confirm rhythm (20 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Anchor every candidate priority to annual direction.\n' +
      '- Choose a set the team can finish in 90 days.\n' +
      '- Give each priority a single accountable owner.\n' +
      '- Sequence the first concrete steps before leaving.\n\n' +
      '## Notes\n\n' +
      'Last 90 days review:\n\n' +
      'Quarterly priorities:\n\n' +
      'Scorecard targets:\n\n' +
      'Owners and first steps:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/aos-90-day-planning\n',
  },
  {
    slug: 'aos-quarterly-retrospective',
    title: 'AOS Quarterly Retrospective Template',
    shortName: 'AOS Quarterly Retrospective',
    description:
      'Use this AOS quarterly retrospective template to review the past quarter, score priorities and the scorecard, and capture honest lessons for the next cycle.',
    category: 'aos',
    methodology: 'Accelerate (AOS)',
    minutes: 75,
    cadence: 'Quarterly',
    participants: 'Leadership team (5-12 people)',
    keywords: [
      'accelerate operating system',
      'AOS meeting template',
      'AOS quarterly retrospective template',
      'quarterly retrospective meeting agenda',
      'quarterly retro template',
      'quarter review retrospective agenda',
      'quarterly lessons learned meeting',
      'quarterly reflection meeting template',
    ],
    steps: [
      { name: 'Set the tone and ground rules', minutes: 5, text: 'Open with the purpose of an honest look back and the ground rule that the retro is about learning, not blame.' },
      { name: 'Score priorities and scorecard', minutes: 20, text: 'Score each quarterly priority done or not done and review how the scorecard moved across the quarter against targets.' },
      { name: 'What went well', minutes: 15, text: 'Capture what worked and why, including practices and decisions worth repeating in the next quarter.' },
      { name: 'What to improve', minutes: 20, text: 'Name honestly what slipped or fell short and dig into the underlying causes rather than the surface symptoms.' },
      { name: 'Lessons and changes to make', minutes: 10, text: 'Translate the discussion into a few concrete changes to how the team operates next quarter, each with an owner.' },
      { name: 'Carry-forward and close', minutes: 5, text: 'Confirm which items carry into next quarter planning and recap the lessons the team is committing to apply.' },
    ],
    bodyHtml:
      '<p>The <strong>AOS quarterly retrospective</strong> is the honest look back that makes the next quarter better. Based on the Accelerate Operating System (AOS) model, it scores priorities and the scorecard, separates what went well from what to improve, and turns the lessons into concrete changes for the next cycle.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run it at the end of each quarter, ideally just before quarterly planning so the lessons feed straight into the next set of priorities. Pairing the retro with planning keeps reflection from becoming a ritual no one acts on.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Keep it to the leadership team, five to twelve people who lived the quarter and will shape the next one. A psychologically safe room is essential, since a retro that punishes honesty stops surfacing the truth.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Set a learning-not-blame tone, score the priorities and scorecard plainly, then separate what went well from what to improve. Dig into causes rather than symptoms, and convert the discussion into a few concrete operating changes with owners and carry-forward items for planning. <em>Note: this agenda is an independent interpretation of the AOS quarterly-rhythm model and is not affiliated with or endorsed by any provider.</em></p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Set a learning-not-blame tone before anyone speaks.</li>' +
      '<li>Score priorities plainly as done or not done.</li>' +
      '<li>Dig into causes, not just the surface symptoms.</li>' +
      '<li>End with a few owned changes, not a long wish list.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Turning the retro into blame so honesty disappears.</li>' +
      '<li>Listing what went wrong without finding the causes.</li>' +
      '<li>Generating lessons that no one is assigned to apply.</li>' +
      '<li>Holding the retro disconnected from the next planning session.</li>' +
      '</ul>' +
      '<p>Make every quarter teach the next one. <a href="/l8">Run it in OrgTP</a> and carry lessons, changes, and carry-forward items straight into planning, with OrgTP adapting to your cadence.</p>',
    downloadMarkdown:
      '# AOS Quarterly Retrospective Template\n\n' +
      'Purpose: Review the past quarter using the Accelerate Operating System (AOS) model, score priorities and the scorecard, and capture honest lessons and owned changes for the next cycle.\n\n' +
      '- Duration: 75 minutes\n' +
      '- Cadence: Quarterly\n' +
      '- Participants: Leadership team (5-12 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Set the tone and ground rules (5 min)\n' +
      '- [ ] Score priorities and scorecard (20 min)\n' +
      '- [ ] What went well (15 min)\n' +
      '- [ ] What to improve and why (20 min)\n' +
      '- [ ] Lessons and changes to make (10 min)\n' +
      '- [ ] Carry-forward and close (5 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Set a learning-not-blame tone first.\n' +
      '- Score priorities plainly as done or not done.\n' +
      '- Dig into causes, not surface symptoms.\n' +
      '- End with a few owned changes, not a wish list.\n\n' +
      '## Notes\n\n' +
      'Priority and scorecard scores:\n\n' +
      'What went well:\n\n' +
      'What to improve:\n\n' +
      'Lessons, changes, and carry-forward:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/aos-quarterly-retrospective\n',
  },
];
