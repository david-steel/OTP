// Pinnacle meeting templates for the /templates library.
// AUTHORED content. bodyHtml renders via <%- %>. Byte-stable: no Date.now,
// no randomness. See _types.ts for the shared contract.
//
// Pinnacle is the business operating system from Pinnacle Business Guides
// (Steve Preda and Gregory Cleary), a hybrid of EOS and Scaling Up built on a
// quarterly planning rhythm. Templates below are based on the Pinnacle model;
// no affiliation or endorsement is implied.

import type { MeetingTemplate } from './_types.js';

export const PINNACLE_TEMPLATES: MeetingTemplate[] = [
  {
    slug: 'pinnacle-annual-planning',
    title: 'Pinnacle Annual Planning Meeting Template',
    shortName: 'Pinnacle Annual Planning Meeting',
    description:
      'Use this Pinnacle annual planning meeting template and agenda to review the year, refresh the One-Page Plan, set annual goals, and lock quarterly priorities.',
    category: 'pinnacle',
    methodology: 'Pinnacle',
    minutes: 600,
    cadence: 'Annually',
    participants: 'Leadership team (3-10 people)',
    keywords: [
      'pinnacle annual planning meeting template',
      'pinnacle annual planning agenda',
      'pinnacle business guides',
      'pinnacle operating system meeting',
      'annual planning meeting template',
      'pinnacle one-page plan',
      'pinnacle quarterly priorities',
      'steve preda gregory cleary',
    ],
    steps: [
      { name: 'Check-in and year in review', minutes: 60, text: 'Open with a personal and business check-in, then review the year against goals: what was hit, what slipped, and the lessons worth carrying into the new plan.' },
      { name: 'Purpose, values, and vision', minutes: 75, text: 'Reconnect with company purpose, core values, and the long-range vision so the annual plan points toward the destination on the One-Page Plan.' },
      { name: 'Market and competitive review', minutes: 75, text: 'Assess the market, customers, and competitors, and pressure-test the strategy and differentiators that set the business apart.' },
      { name: 'Set annual goals and key metrics', minutes: 90, text: 'Define three to five annual goals with the numbers that prove progress, anchored to the three-year picture.' },
      { name: 'Build the One-Page Plan', minutes: 90, text: 'Update the One-Page Plan so purpose, vision, annual goals, and accountability all live on a single shared page.' },
      { name: 'Lock Q1 quarterly priorities', minutes: 75, text: 'Translate annual goals into the first quarter of priorities, each with a single owner and a clear definition of done.' },
      { name: 'Issues, owners, and rollout', minutes: 60, text: 'Work the biggest issues, confirm owners and metrics, and agree how the plan will be communicated to the wider team.' },
    ],
    bodyHtml:
      '<p>The <strong>Pinnacle annual planning meeting</strong> is the anchor of the Pinnacle planning rhythm. Based on the Pinnacle model by Pinnacle Business Guides, it blends the disciplined cadence of EOS with the strategic depth of Scaling Up. Over one to two days, the leadership team reviews the year, refreshes the One-Page Plan, and leaves with annual goals and a locked first quarter.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run this once a year, late in the current year or at the very start of the new one, so the team enters the year aligned. It sits at the top of the Pinnacle cadence: the annual session sets direction, and each quarterly, monthly, and weekly meeting executes a leg of it. Give it real time away from daily fires.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Keep it to the leadership team, three to ten people who can both shape the plan and commit the organization to it. A skilled facilitator helps the most senior person participate as a thinker rather than spend the day running the room. Cascade the detail to teams afterward.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Start with an honest year in review, then reconnect with purpose, values, and vision before scanning the market. Set a focused set of annual goals with the metrics that prove them, and capture everything on the One-Page Plan so the whole company can see direction and accountability in one place. Translate the goals into a concrete first quarter, work the biggest issues to resolution, and close by confirming owners and a rollout plan. An annual plan with no operating rhythm quietly dissolves by spring.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Ground the year in an honest review before looking ahead.</li>' +
      '<li>Keep the One-Page Plan to a single page on purpose; it forces focus.</li>' +
      '<li>Leave with a locked first quarter, not just annual ambitions.</li>' +
      '<li>Assign one owner per goal and per quarterly priority.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Setting lofty annual goals with no quarterly execution path.</li>' +
      '<li>Skipping the honest review and repeating last year mistakes.</li>' +
      '<li>Producing a plan that lives in a deck and never in the work.</li>' +
      '<li>Defining no rhythm, so the plan is forgotten within a quarter.</li>' +
      '</ul>' +
      '<p>Turn the year ahead into a plan you can run. <a href="/l8">Run it in OrgTP</a>, where a flexible meeting cadence adapts cleanly to the Pinnacle annual, quarterly, monthly, and weekly rhythm.</p>',
    downloadMarkdown:
      '# Pinnacle Annual Planning Meeting Template\n\n' +
      'Purpose: Review the year, refresh the One-Page Plan, set annual goals and key metrics, and lock the first quarter of priorities for the Pinnacle planning rhythm.\n\n' +
      '- Duration: 600 minutes (1 to 2 days)\n' +
      '- Cadence: Annually\n' +
      '- Participants: Leadership team (3-10 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Check-in and year in review (60 min) - what was hit, what slipped, lessons\n' +
      '- [ ] Purpose, values, and vision (75 min) - reconnect with the destination\n' +
      '- [ ] Market and competitive review (75 min) - strategy and differentiators\n' +
      '- [ ] Set annual goals and key metrics (90 min) - 3 to 5 goals with numbers\n' +
      '- [ ] Build the One-Page Plan (90 min) - everything on one page\n' +
      '- [ ] Lock Q1 quarterly priorities (75 min) - owners and definition of done\n' +
      '- [ ] Issues, owners, and rollout (60 min) - resolve and communicate\n\n' +
      '## Facilitator tips\n\n' +
      '- Ground the year in an honest review first.\n' +
      '- Keep the One-Page Plan to a single page.\n' +
      '- Leave with a locked first quarter.\n' +
      '- Assign one owner per goal and priority.\n\n' +
      '## Notes\n\n' +
      'Year in review:\n\n' +
      'Annual goals and metrics:\n\n' +
      'One-Page Plan updates:\n\n' +
      'Q1 priorities and owners:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/pinnacle-annual-planning\n',
  },
  {
    slug: 'pinnacle-quarterly-planning',
    title: 'Pinnacle Quarterly Planning Meeting Template',
    shortName: 'Pinnacle Quarterly Planning Meeting',
    description:
      'Use this Pinnacle quarterly planning meeting template and agenda to review last quarter, refresh the plan, set quarterly priorities, and align the leadership team.',
    category: 'pinnacle',
    methodology: 'Pinnacle',
    minutes: 480,
    cadence: 'Quarterly',
    participants: 'Leadership team (3-10 people)',
    keywords: [
      'pinnacle quarterly planning meeting template',
      'pinnacle quarterly planning agenda',
      'pinnacle business guides',
      'pinnacle operating system meeting',
      'quarterly planning meeting template',
      'pinnacle quarterly priorities',
      'quarterly rocks meeting agenda',
      'pinnacle one-page plan review',
    ],
    steps: [
      { name: 'Check-in and segue', minutes: 30, text: 'Open with a personal and business check-in so the team arrives present and focused before the work begins.' },
      { name: 'Review last quarter priorities', minutes: 60, text: 'Score each quarterly priority done or not done, discuss what drove the result, and capture lessons for the next quarter.' },
      { name: 'Review the One-Page Plan', minutes: 45, text: 'Walk the One-Page Plan and confirm purpose, vision, annual goals, and metrics still hold or need adjustment.' },
      { name: 'Annual goal progress check', minutes: 45, text: 'Measure progress against annual goals so the new quarter is set in the context of the year.' },
      { name: 'Set quarterly priorities', minutes: 120, text: 'Choose three to five quarterly priorities for the company and for each leader, each with a single owner and a clear definition of done.' },
      { name: 'Issues solving', minutes: 90, text: 'Work the most important issues to root cause and resolution so they do not block the new quarter.' },
      { name: 'Conclude and commit', minutes: 30, text: 'Recap decisions, confirm owners and to-dos, rate the meeting, and agree the next steps.' },
    ],
    bodyHtml:
      '<p>The <strong>Pinnacle quarterly planning meeting</strong> resets focus every ninety days. Based on the Pinnacle model by Pinnacle Business Guides, it scores the last quarter, refreshes the One-Page Plan, and sets a short list of quarterly priorities that the team can actually finish. It is the engine that keeps the annual plan moving.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run this near the start of each quarter, ideally a week or two before the quarter begins so owners can start clean. It is the recurring heartbeat between annual planning sessions and the place where annual goals get broken into executable work.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Keep the room to the leadership team, three to ten people who own quarterly priorities. This is a working session, not a broadcast, so resist the urge to add observers who slow the pace and dilute ownership.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Open with a check-in to get everyone present, then score last quarter honestly before setting anything new. Review the One-Page Plan and annual goal progress so the new quarter sits in context. Spend the largest block choosing a focused set of quarterly priorities with one owner each, then move into issues solving to clear what would otherwise block them. Close by confirming owners and to-dos and rating the meeting so the cadence keeps improving.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Cap quarterly priorities at three to five per person; more is a wish list.</li>' +
      '<li>Score last quarter before drafting the new one so lessons carry forward.</li>' +
      '<li>Drive issues to root cause, not just the symptom.</li>' +
      '<li>End with owned to-dos and a meeting rating.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Setting too many priorities so attention fragments and nothing finishes.</li>' +
      '<li>Skipping the prior-quarter score and repeating the same misses.</li>' +
      '<li>Letting issues solving turn into venting with no decisions.</li>' +
      '<li>Leaving without a single accountable owner per priority.</li>' +
      '</ul>' +
      '<p>Make every quarter count. <a href="/l8">Run it in OrgTP</a>, where a flexible meeting cadence adapts cleanly to the Pinnacle quarterly, monthly, and weekly rhythm.</p>',
    downloadMarkdown:
      '# Pinnacle Quarterly Planning Meeting Template\n\n' +
      'Purpose: Review last quarter, refresh the One-Page Plan, set a focused list of quarterly priorities, and solve the issues that would block the new quarter.\n\n' +
      '- Duration: 480 minutes (full or half day)\n' +
      '- Cadence: Quarterly\n' +
      '- Participants: Leadership team (3-10 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Check-in and segue (30 min) - arrive present and focused\n' +
      '- [ ] Review last quarter priorities (60 min) - score done or not done\n' +
      '- [ ] Review the One-Page Plan (45 min) - confirm it still holds\n' +
      '- [ ] Annual goal progress check (45 min) - set the quarter in context\n' +
      '- [ ] Set quarterly priorities (120 min) - 3 to 5 with owners\n' +
      '- [ ] Issues solving (90 min) - root cause and resolution\n' +
      '- [ ] Conclude and commit (30 min) - to-dos and meeting rating\n\n' +
      '## Facilitator tips\n\n' +
      '- Cap quarterly priorities at 3 to 5 per person.\n' +
      '- Score last quarter before drafting the new one.\n' +
      '- Drive issues to root cause.\n' +
      '- End with owned to-dos and a rating.\n\n' +
      '## Notes\n\n' +
      'Last quarter results:\n\n' +
      'One-Page Plan updates:\n\n' +
      'Quarterly priorities and owners:\n\n' +
      'Issues solved:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/pinnacle-quarterly-planning\n',
  },
  {
    slug: 'pinnacle-monthly-meeting',
    title: 'Pinnacle Monthly Meeting Template',
    shortName: 'Pinnacle Monthly Meeting',
    description:
      'Use this Pinnacle monthly meeting template and agenda to check quarterly priority progress, review the scoreboard, solve deeper issues, and keep the quarter on pace.',
    category: 'pinnacle',
    methodology: 'Pinnacle',
    minutes: 180,
    cadence: 'Monthly',
    participants: 'Leadership team (3-10 people)',
    keywords: [
      'pinnacle monthly meeting template',
      'pinnacle monthly meeting agenda',
      'pinnacle business guides',
      'pinnacle operating system meeting',
      'monthly leadership meeting template',
      'pinnacle quarterly priority review',
      'monthly business review agenda',
      'pinnacle scoreboard review',
    ],
    steps: [
      { name: 'Check-in and segue', minutes: 15, text: 'Open with a short personal and business check-in to settle the team into the meeting.' },
      { name: 'Scoreboard review', minutes: 30, text: 'Walk the key metrics on the scoreboard, compare actuals to target, and flag any number that is off track.' },
      { name: 'Quarterly priority progress', minutes: 30, text: 'Each owner reports their quarterly priorities as on track or off track and names what is needed to land them.' },
      { name: 'Customer and team headlines', minutes: 20, text: 'Share short headlines on customers, team, and the market that the group should know.' },
      { name: 'Issues solving', minutes: 75, text: 'Take the month to work the deeper issues that the weekly meeting cannot resolve, driving each to a decision.' },
      { name: 'Conclude and commit', minutes: 10, text: 'Confirm decisions, to-dos, and owners, then rate the meeting before closing.' },
    ],
    bodyHtml:
      '<p>The <strong>Pinnacle monthly meeting</strong> sits between the fast weekly pulse and the quarterly reset. Based on the Pinnacle model by Pinnacle Business Guides, it gives the leadership team room to check quarterly priority progress, study the scoreboard, and solve the deeper issues that a thirty-minute weekly simply cannot hold.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run it once a month, on a predictable day, in the months between quarterly planning sessions. It is the right forum when an issue needs more thinking time than the weekly allows but does not warrant waiting for the next quarter.</p>' +
      '<h2>Who attends</h2>' +
      '<p>The same leadership team that runs the weekly and quarterly meetings, three to ten people. Keeping the group consistent across the cadence is what makes the rhythm work; accountability carries from one meeting to the next.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Start with a brief check-in, then ground the meeting in the scoreboard so the conversation is driven by numbers. Have each owner report quarterly priority progress honestly as on or off track, share the headlines worth knowing, and then spend the bulk of the time on issues solving. This is the meeting where the team can go deep, so protect that block and drive each issue to a real decision before closing with owned to-dos.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Let the scoreboard, not opinions, set the agenda for discussion.</li>' +
      '<li>Treat an off-track priority as a signal to act, not a confession.</li>' +
      '<li>Reserve the largest block for issues solving and protect it.</li>' +
      '<li>Close every issue with an owner and a date.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Turning the month into a long status report with no decisions.</li>' +
      '<li>Reviewing the scoreboard without acting on the red numbers.</li>' +
      '<li>Saving issues for the quarter that should be solved now.</li>' +
      '<li>Ending without owned to-dos, so nothing moves before next month.</li>' +
      '</ul>' +
      '<p>Keep the quarter on pace. <a href="/l8">Run it in OrgTP</a>, where a flexible meeting cadence adapts cleanly to the Pinnacle monthly, weekly, and quarterly rhythm.</p>',
    downloadMarkdown:
      '# Pinnacle Monthly Meeting Template\n\n' +
      'Purpose: Check quarterly priority progress, review the scoreboard, and solve the deeper issues that the weekly meeting cannot hold, keeping the quarter on pace.\n\n' +
      '- Duration: 180 minutes (2 to 4 hours)\n' +
      '- Cadence: Monthly\n' +
      '- Participants: Leadership team (3-10 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Check-in and segue (15 min) - settle the team in\n' +
      '- [ ] Scoreboard review (30 min) - actuals vs target, flag off track\n' +
      '- [ ] Quarterly priority progress (30 min) - on track or off track\n' +
      '- [ ] Customer and team headlines (20 min) - what the group should know\n' +
      '- [ ] Issues solving (75 min) - drive deeper issues to a decision\n' +
      '- [ ] Conclude and commit (10 min) - to-dos, owners, rating\n\n' +
      '## Facilitator tips\n\n' +
      '- Let the scoreboard set the discussion.\n' +
      '- Treat an off-track priority as a signal to act.\n' +
      '- Protect the issues solving block.\n' +
      '- Close every issue with an owner and a date.\n\n' +
      '## Notes\n\n' +
      'Scoreboard flags:\n\n' +
      'Priority progress:\n\n' +
      'Issues solved:\n\n' +
      'To-dos and owners:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/pinnacle-monthly-meeting\n',
  },
  {
    slug: 'pinnacle-weekly-pulse',
    title: 'Pinnacle Weekly Pulse Meeting Template',
    shortName: 'Pinnacle Weekly Pulse Meeting',
    description:
      'Use this Pinnacle weekly pulse meeting template and agenda to review the scoreboard, check priorities, surface issues, and solve the most important ones each week.',
    category: 'pinnacle',
    methodology: 'Pinnacle',
    minutes: 60,
    cadence: 'Weekly',
    participants: 'Leadership team (3-10 people)',
    keywords: [
      'pinnacle weekly pulse meeting template',
      'pinnacle weekly pulse agenda',
      'pinnacle business guides',
      'pinnacle operating system meeting',
      'weekly leadership meeting template',
      'pinnacle weekly meeting agenda',
      'weekly team huddle template',
      'pinnacle issues solving meeting',
    ],
    steps: [
      { name: 'Check-in and segue', minutes: 5, text: 'Each person shares a quick personal and business best so the meeting starts on a human note.' },
      { name: 'Scoreboard review', minutes: 5, text: 'Walk the weekly metrics and mark each on track or off track without solving anything yet.' },
      { name: 'Quarterly priority check', minutes: 5, text: 'Each owner reports their quarterly priorities as on or off track in a single word, dropping anything off track to the issues list.' },
      { name: 'Headlines and to-do review', minutes: 10, text: 'Share short customer and team headlines and confirm last week to-dos are done or not done.' },
      { name: 'Build and prioritize the issues list', minutes: 5, text: 'Surface the issues for the week and rank the top few that matter most.' },
      { name: 'Solve issues', minutes: 25, text: 'Work the highest-priority issues to root cause and decision, creating to-dos as solutions emerge.' },
      { name: 'Conclude and rate', minutes: 5, text: 'Recap new to-dos and owners, confirm messages to cascade, and rate the meeting.' },
    ],
    bodyHtml:
      '<p>The <strong>Pinnacle weekly pulse meeting</strong> is the heartbeat of the operating rhythm. Based on the Pinnacle model by Pinnacle Business Guides, it is short, structured, and relentless about solving the few issues that matter most this week. The goal is not to report status but to clear what is in the way.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run it every week, on a fixed day and time, so it becomes a reliable ritual the team does not negotiate around. It is the connective tissue between monthly and quarterly meetings, keeping priorities visible and issues from piling up.</p>' +
      '<h2>Who attends</h2>' +
      '<p>The leadership team, three to ten people who own quarterly priorities and metrics. Keep the same group each week so accountability and momentum carry forward rather than resetting.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Open with a fast check-in, then move through the scoreboard and priority reports as simple on-track or off-track signals, dropping anything off track onto the issues list rather than solving it live. Confirm to-dos from last week, build and rank the issues list, and then spend the bulk of the hour solving the top issues to root cause. Close by capturing new to-dos with owners, agreeing what to cascade to the team, and rating the meeting.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Keep reporting to single-word signals; save the talking for issues.</li>' +
      '<li>Drop off-track items onto the issues list instead of solving them early.</li>' +
      '<li>Solve fewer issues fully rather than many halfway.</li>' +
      '<li>Protect the time box and end on a meeting rating.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Letting the report-out segment swallow the time for solving issues.</li>' +
      '<li>Trying to solve every issue and finishing none.</li>' +
      '<li>Reporting activity instead of movement on the actual metric.</li>' +
      '<li>Naming issues but never assigning who resolves them.</li>' +
      '</ul>' +
      '<p>Give the week a rhythm. <a href="/l8">Run it in OrgTP</a>, where a flexible meeting cadence adapts cleanly to the Pinnacle weekly, monthly, and quarterly rhythm.</p>',
    downloadMarkdown:
      '# Pinnacle Weekly Pulse Meeting Template\n\n' +
      'Purpose: Review the scoreboard and priorities, surface the issues for the week, and solve the most important ones to root cause and decision.\n\n' +
      '- Duration: 60 minutes (30 to 60 minutes)\n' +
      '- Cadence: Weekly\n' +
      '- Participants: Leadership team (3-10 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Check-in and segue (5 min) - personal and business best\n' +
      '- [ ] Scoreboard review (5 min) - on track or off track\n' +
      '- [ ] Quarterly priority check (5 min) - single-word signals\n' +
      '- [ ] Headlines and to-do review (10 min) - done or not done\n' +
      '- [ ] Build and prioritize the issues list (5 min) - rank the top few\n' +
      '- [ ] Solve issues (25 min) - root cause and decision\n' +
      '- [ ] Conclude and rate (5 min) - to-dos, cascade, rating\n\n' +
      '## Facilitator tips\n\n' +
      '- Keep reporting to single-word signals.\n' +
      '- Drop off-track items onto the issues list.\n' +
      '- Solve fewer issues fully.\n' +
      '- Protect the time box and rate the meeting.\n\n' +
      '## Notes\n\n' +
      'Scoreboard flags:\n\n' +
      'Issues list:\n\n' +
      'Issues solved:\n\n' +
      'New to-dos and owners:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/pinnacle-weekly-pulse\n',
  },
  {
    slug: 'pinnacle-daily-huddle',
    title: 'Pinnacle Daily Huddle Template',
    shortName: 'Pinnacle Daily Huddle',
    description:
      'Use this Pinnacle daily huddle template and agenda to run a fast 15-minute standup that surfaces priorities, metrics, and stucks so the team unblocks each day.',
    category: 'pinnacle',
    methodology: 'Pinnacle',
    minutes: 15,
    cadence: 'Daily',
    participants: 'Team or leadership group (3-12 people)',
    keywords: [
      'pinnacle daily huddle template',
      'pinnacle daily huddle agenda',
      'pinnacle business guides',
      'pinnacle operating system meeting',
      'daily huddle template',
      'daily standup meeting agenda',
      'pinnacle daily standup',
      '15 minute huddle template',
    ],
    steps: [
      { name: 'Stand up and start on time', minutes: 1, text: 'Begin at the same time every day, standing, to keep the huddle short and the energy high.' },
      { name: 'Daily metric or good news', minutes: 3, text: 'Share the one number that signals the pulse of the day or a quick piece of good news to start positive.' },
      { name: 'Top priority of the day', minutes: 5, text: 'Each person names their single most important focus for the day so the team sees where attention is going.' },
      { name: 'Stucks and conflicts', minutes: 5, text: 'Surface anything blocking progress or where two people need the same resource, and pair up to resolve it after.' },
      { name: 'Quick close', minutes: 1, text: 'Confirm anyone who needs a follow-up after the huddle and end on time.' },
    ],
    bodyHtml:
      '<p>The <strong>Pinnacle daily huddle</strong> is a fifteen-minute, stand-up rhythm that keeps a team synced without another long meeting. Based on the Pinnacle model by Pinnacle Business Guides, it surfaces the day priorities and the stucks that would otherwise quietly slow everyone down.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run it every working day at a fixed time. It works for the leadership team and for any team that benefits from tight daily coordination, especially during a busy quarter or a high-stakes push. The point is consistency, not perfection.</p>' +
      '<h2>Who attends</h2>' +
      '<p>The intact team, three to twelve people. Larger groups can still huddle if reporting stays crisp, but if it routinely runs long, split into smaller huddles rather than stretching the time box.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Start on time, standing, every day. Share a single daily metric or a piece of good news to set the tone, then have each person name their top priority for the day. Surface stucks and any conflicts over shared resources, but do not solve them in the huddle; pair the right people to resolve them right after. Keep it to fifteen minutes so it stays a habit rather than a burden.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Stand up and start on time, every single day.</li>' +
      '<li>Surface stucks in the huddle, but solve them outside it.</li>' +
      '<li>Keep it to one priority and one metric per person.</li>' +
      '<li>End on time even if not everyone has spoken at length.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Letting the huddle drift into problem-solving and running long.</li>' +
      '<li>Skipping days, which breaks the habit and the value.</li>' +
      '<li>Turning it into a status report no one acts on.</li>' +
      '<li>Sitting down, which quietly invites the meeting to sprawl.</li>' +
      '</ul>' +
      '<p>Keep the team in sync every day. <a href="/l8">Run it in OrgTP</a>, where a flexible meeting cadence adapts cleanly to the Pinnacle daily, weekly, and monthly rhythm.</p>',
    downloadMarkdown:
      '# Pinnacle Daily Huddle Template\n\n' +
      'Purpose: Run a fast 15-minute standup that surfaces daily priorities, a key metric, and stucks so the team can unblock each other and move the day forward.\n\n' +
      '- Duration: 15 minutes\n' +
      '- Cadence: Daily\n' +
      '- Participants: Team or leadership group (3-12 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Stand up and start on time (1 min) - same time daily\n' +
      '- [ ] Daily metric or good news (3 min) - read the pulse\n' +
      '- [ ] Top priority of the day (5 min) - one focus per person\n' +
      '- [ ] Stucks and conflicts (5 min) - surface, pair to resolve after\n' +
      '- [ ] Quick close (1 min) - confirm follow-ups, end on time\n\n' +
      '## Facilitator tips\n\n' +
      '- Stand up and start on time every day.\n' +
      '- Surface stucks here, solve them outside.\n' +
      '- One priority and one metric per person.\n' +
      '- End on time, every time.\n\n' +
      '## Notes\n\n' +
      'Daily metric:\n\n' +
      'Top priorities:\n\n' +
      'Stucks and follow-ups:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/pinnacle-daily-huddle\n',
  },
  {
    slug: 'pinnacle-strategy-session',
    title: 'Pinnacle 3-Year Strategy Session Template',
    shortName: 'Pinnacle 3-Year Strategy Session',
    description:
      'Use this Pinnacle 3-year strategy session template and agenda to shape the three-year picture, sharpen differentiators, and align leadership on a strategic direction.',
    category: 'pinnacle',
    methodology: 'Pinnacle',
    minutes: 300,
    cadence: 'Annually',
    participants: 'Leadership team (3-10 people)',
    keywords: [
      'pinnacle 3-year strategy session template',
      'pinnacle strategy session agenda',
      'pinnacle business guides',
      'pinnacle operating system meeting',
      'three year strategy meeting template',
      'pinnacle three-year picture',
      'strategic direction session agenda',
      'pinnacle differentiators workshop',
    ],
    steps: [
      { name: 'Frame the strategic question', minutes: 30, text: 'Agree what this session must decide and ground the team in an honest view of the current state of the business.' },
      { name: 'Market and competitive landscape', minutes: 60, text: 'Examine the market, customers, and competitors, and the forces likely to reshape the next three years.' },
      { name: 'Core strengths and differentiators', minutes: 60, text: 'Clarify the durable strengths and differentiators the strategy should be built around.' },
      { name: 'Shape the three-year picture', minutes: 75, text: 'Describe where the business should be in three years: revenue, profit, customers, and what it will look and feel like.' },
      { name: 'Strategic bets and trade-offs', minutes: 45, text: 'Choose the few strategic bets worth making and debate the trade-offs openly before committing.' },
      { name: 'Implications for the annual plan', minutes: 30, text: 'Translate the direction into implications for the coming year so the strategy connects to execution.' },
    ],
    bodyHtml:
      '<p>The <strong>Pinnacle 3-year strategy session</strong> is where leaders lift their eyes from the quarter and decide where the business is genuinely headed. Based on the Pinnacle model by Pinnacle Business Guides, it shapes the three-year picture and the strategic bets that the annual and quarterly plans will execute.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run it once a year, often alongside or just before annual planning, and again whenever a major inflection point demands a reset: a new market, a funding event, a leadership change, or a strategy that has stopped working. It needs uninterrupted, protected time.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Keep it to the leadership team, three to ten people who can both think strategically and commit to the direction. A skilled facilitator helps surface real disagreement rather than letting it simmer beneath polite consensus.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Frame the strategic question first so the day has a destination, then scan the market and clarify the strengths and differentiators worth building around. Shape a vivid three-year picture, concrete enough that everyone can see it, then narrow to the few strategic bets worth making and debate the trade-offs out loud. Finish by drawing the implications for the coming year so the strategy flows straight into the annual plan rather than sitting on a shelf.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Lock the strategic question before exploring options.</li>' +
      '<li>Force the hard trade-offs into the open instead of avoiding them.</li>' +
      '<li>Make the three-year picture concrete, not aspirational fog.</li>' +
      '<li>Connect the direction to next year before anyone leaves.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Producing a vision with no real strategic choices behind it.</li>' +
      '<li>Avoiding disagreement, so the strategy lacks genuine commitment.</li>' +
      '<li>Drifting into operational detail that belongs in quarterly planning.</li>' +
      '<li>Never connecting the strategy to the annual plan.</li>' +
      '</ul>' +
      '<p>Decide where the business is going. <a href="/l8">Run it in OrgTP</a>, where a flexible meeting cadence adapts cleanly to the Pinnacle strategy, annual, and quarterly rhythm.</p>',
    downloadMarkdown:
      '# Pinnacle 3-Year Strategy Session Template\n\n' +
      'Purpose: Shape the three-year picture, sharpen differentiators, choose the few strategic bets, and align leadership on a direction that feeds the annual plan.\n\n' +
      '- Duration: 300 minutes (half to full day)\n' +
      '- Cadence: Annually (or at major inflection points)\n' +
      '- Participants: Leadership team (3-10 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Frame the strategic question (30 min) - and current state\n' +
      '- [ ] Market and competitive landscape (60 min) - forces ahead\n' +
      '- [ ] Core strengths and differentiators (60 min) - what to build on\n' +
      '- [ ] Shape the three-year picture (75 min) - concrete destination\n' +
      '- [ ] Strategic bets and trade-offs (45 min) - choose and debate\n' +
      '- [ ] Implications for the annual plan (30 min) - connect to execution\n\n' +
      '## Facilitator tips\n\n' +
      '- Lock the strategic question first.\n' +
      '- Force the hard trade-offs into the open.\n' +
      '- Make the three-year picture concrete.\n' +
      '- Connect the direction to next year.\n\n' +
      '## Notes\n\n' +
      'Strategic question:\n\n' +
      'Differentiators:\n\n' +
      'Three-year picture:\n\n' +
      'Strategic bets and implications:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/pinnacle-strategy-session\n',
  },
  {
    slug: 'pinnacle-one-page-plan-session',
    title: 'Pinnacle One-Page Plan Working Session Template',
    shortName: 'Pinnacle One-Page Plan Working Session',
    description:
      'Use this Pinnacle One-Page Plan working session template and agenda to capture purpose, vision, goals, and accountability on a single shared page the team owns.',
    category: 'pinnacle',
    methodology: 'Pinnacle',
    minutes: 180,
    cadence: 'As needed',
    participants: 'Leadership team (3-10 people)',
    keywords: [
      'pinnacle one-page plan working session template',
      'pinnacle one-page plan agenda',
      'pinnacle business guides',
      'pinnacle operating system meeting',
      'one page plan template',
      'pinnacle one-page strategic plan',
      'business plan on one page agenda',
      'pinnacle planning worksheet',
    ],
    steps: [
      { name: 'Purpose and core values', minutes: 30, text: 'Articulate why the company exists and the handful of values that define how the team behaves.' },
      { name: 'Long-range vision and BHAG', minutes: 30, text: 'Capture the long-range vision and the big audacious goal the company is ultimately moving toward.' },
      { name: 'Three-year picture', minutes: 30, text: 'Describe where the business will be in three years in concrete, measurable terms.' },
      { name: 'Annual goals and metrics', minutes: 40, text: 'Set the three to five annual goals and the key numbers that prove progress toward the vision.' },
      { name: 'Quarterly priorities', minutes: 30, text: 'Identify the current quarter priorities that move the annual goals forward.' },
      { name: 'Accountability and review', minutes: 20, text: 'Assign owners across the plan and agree how and when the One-Page Plan will be reviewed.' },
    ],
    bodyHtml:
      '<p>The <strong>Pinnacle One-Page Plan working session</strong> compresses an entire strategic plan onto a single page. Based on the Pinnacle model by Pinnacle Business Guides, it forces the focus that long planning documents lose: purpose, vision, goals, and accountability all visible at a glance and owned by the whole leadership team.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Use it when you are building the One-Page Plan for the first time, after a strategy shift, or as a focused working block inside annual planning. It is the document the rest of the Pinnacle cadence reviews, so it is worth getting right.</p>' +
      '<h2>Who attends</h2>' +
      '<p>The leadership team, three to ten people who will own the goals and live by the plan. Building it together is what creates the shared ownership; a plan written by one person and handed down rarely sticks.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Work top down through the page. Start with purpose and core values, then the long-range vision and the big audacious goal. Make the three-year picture concrete, set a focused list of annual goals with their metrics, and identify the quarterly priorities that move them. Finish by assigning owners across the plan and agreeing the review rhythm. The discipline of one page is the point; if it does not fit, the plan is not focused enough yet.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Hold the line on a single page; the constraint forces clarity.</li>' +
      '<li>Build it with the team so ownership is shared, not handed down.</li>' +
      '<li>Make every goal measurable, not a slogan.</li>' +
      '<li>Agree the review rhythm before the session ends.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Letting the plan sprawl beyond one page and losing the focus.</li>' +
      '<li>Filling it with aspirational language instead of measurable goals.</li>' +
      '<li>Writing it alone, so the team never truly owns it.</li>' +
      '<li>Finishing the plan but never scheduling a review of it.</li>' +
      '</ul>' +
      '<p>Get the whole strategy on one page. <a href="/l8">Run it in OrgTP</a>, where a flexible meeting cadence adapts cleanly to the Pinnacle planning rhythm that keeps the One-Page Plan alive.</p>',
    downloadMarkdown:
      '# Pinnacle One-Page Plan Working Session Template\n\n' +
      'Purpose: Capture purpose, vision, annual goals, quarterly priorities, and accountability on a single shared page the leadership team builds and owns together.\n\n' +
      '- Duration: 180 minutes\n' +
      '- Cadence: As needed (build or major refresh)\n' +
      '- Participants: Leadership team (3-10 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Purpose and core values (30 min) - why the company exists\n' +
      '- [ ] Long-range vision and BHAG (30 min) - the destination\n' +
      '- [ ] Three-year picture (30 min) - concrete and measurable\n' +
      '- [ ] Annual goals and metrics (40 min) - 3 to 5 with numbers\n' +
      '- [ ] Quarterly priorities (30 min) - move the annual goals\n' +
      '- [ ] Accountability and review (20 min) - owners and rhythm\n\n' +
      '## Facilitator tips\n\n' +
      '- Hold the line on a single page.\n' +
      '- Build it with the team for shared ownership.\n' +
      '- Make every goal measurable.\n' +
      '- Agree the review rhythm before closing.\n\n' +
      '## Notes\n\n' +
      'Purpose and values:\n\n' +
      'Vision and three-year picture:\n\n' +
      'Annual goals and metrics:\n\n' +
      'Quarterly priorities and owners:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/pinnacle-one-page-plan-session\n',
  },
  {
    slug: 'pinnacle-accountability-chart-session',
    title: 'Pinnacle Accountability Chart Session Template',
    shortName: 'Pinnacle Accountability Chart Session',
    description:
      'Use this Pinnacle accountability chart session template and agenda to define the right seats, clarify roles, and put the right person in each accountable seat.',
    category: 'pinnacle',
    methodology: 'Pinnacle',
    minutes: 150,
    cadence: 'As needed',
    participants: 'Leadership team (3-8 people)',
    keywords: [
      'pinnacle accountability chart session template',
      'pinnacle accountability chart agenda',
      'pinnacle business guides',
      'pinnacle operating system meeting',
      'accountability chart template',
      'pinnacle org structure session',
      'roles and seats meeting agenda',
      'right person right seat session',
    ],
    steps: [
      { name: 'Why structure before people', minutes: 15, text: 'Set the principle for the session: define the seats the business needs based on function, before discussing who fills them.' },
      { name: 'Define the functions and seats', minutes: 45, text: 'Map the core functions the company must perform and the seats that own them, ignoring current names for now.' },
      { name: 'Roles and accountabilities per seat', minutes: 40, text: 'For each seat, define the three to five core accountabilities that make it clear what the role owns.' },
      { name: 'Place the right people in seats', minutes: 30, text: 'Assign people to seats and test each fit against whether they get it, want it, and have the capacity for it.' },
      { name: 'Gaps, overlaps, and conflicts', minutes: 15, text: 'Surface empty seats, people sitting in two seats, and any accountabilities that two people both claim.' },
      { name: 'Decisions and next steps', minutes: 5, text: 'Confirm the chart, capture open people decisions, and assign next steps with owners.' },
    ],
    bodyHtml:
      '<p>The <strong>Pinnacle accountability chart session</strong> defines who owns what. Based on the Pinnacle model by Pinnacle Business Guides, it builds the seats the business needs from its core functions first, then places the right person in each seat, so accountability is clear rather than blurred by titles and history.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run it when roles feel fuzzy, when the company is growing and the structure no longer fits, after a reorganization, or whenever important work keeps falling between people. It is also a healthy periodic check as the business scales.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Keep it to the leadership team, three to eight people, since the conversation touches sensitive people decisions. A smaller, trusted group can be more honest about fit than a large room, and the chart can be cascaded afterward.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Lead with the principle that structure comes before people: define the seats the business needs based on function, not on who you happen to have. Map the core functions and the seats that own them, then give each seat three to five clear accountabilities. Only then place people in seats and test each fit honestly. Surface gaps, overlaps, and conflicts openly, and close by confirming the chart and capturing the people decisions that need follow-up. The hard conversations are the point, not a detour.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Define seats by function before naming any person.</li>' +
      '<li>Give every seat three to five clear accountabilities.</li>' +
      '<li>Test fit honestly: do they get it, want it, and have capacity.</li>' +
      '<li>Name the gaps and overlaps rather than papering over them.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Building the chart around current people instead of needed seats.</li>' +
      '<li>Leaving accountabilities vague, so work keeps falling through.</li>' +
      '<li>Avoiding the hard fit conversations the chart surfaces.</li>' +
      '<li>One person sitting in too many seats with no plan to fix it.</li>' +
      '</ul>' +
      '<p>Put the right person in every seat. <a href="/l8">Run it in OrgTP</a>, where a flexible meeting cadence and a living org chart adapt cleanly to the Pinnacle accountability model.</p>',
    downloadMarkdown:
      '# Pinnacle Accountability Chart Session Template\n\n' +
      'Purpose: Define the seats the business needs by function, give each seat clear accountabilities, and place the right person in every accountable seat.\n\n' +
      '- Duration: 150 minutes\n' +
      '- Cadence: As needed (growth, reorg, or periodic check)\n' +
      '- Participants: Leadership team (3-8 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Why structure before people (15 min) - set the principle\n' +
      '- [ ] Define the functions and seats (45 min) - ignore names for now\n' +
      '- [ ] Roles and accountabilities per seat (40 min) - 3 to 5 each\n' +
      '- [ ] Place the right people in seats (30 min) - test the fit\n' +
      '- [ ] Gaps, overlaps, and conflicts (15 min) - surface honestly\n' +
      '- [ ] Decisions and next steps (5 min) - confirm and assign\n\n' +
      '## Facilitator tips\n\n' +
      '- Define seats by function before naming a person.\n' +
      '- Give every seat 3 to 5 clear accountabilities.\n' +
      '- Test fit: get it, want it, capacity for it.\n' +
      '- Name the gaps and overlaps.\n\n' +
      '## Notes\n\n' +
      'Functions and seats:\n\n' +
      'Accountabilities:\n\n' +
      'People in seats:\n\n' +
      'Gaps, overlaps, and decisions:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/pinnacle-accountability-chart-session\n',
  },
  {
    slug: 'pinnacle-scoreboard-review',
    title: 'Pinnacle Scoreboard / KPI Review Template',
    shortName: 'Pinnacle Scoreboard / KPI Review',
    description:
      'Use this Pinnacle scoreboard and KPI review template and agenda to walk the key numbers, compare to target, and turn off-track metrics into owned actions.',
    category: 'pinnacle',
    methodology: 'Pinnacle',
    minutes: 45,
    cadence: 'Weekly',
    participants: 'Leadership team and metric owners (3-10 people)',
    keywords: [
      'pinnacle scoreboard review template',
      'pinnacle kpi review agenda',
      'pinnacle business guides',
      'pinnacle operating system meeting',
      'scoreboard review meeting template',
      'kpi review meeting agenda',
      'pinnacle metrics review',
      'weekly scorecard review template',
    ],
    steps: [
      { name: 'Open and frame the numbers', minutes: 5, text: 'State the period under review and remind the team this is about reading signals, not solving everything live.' },
      { name: 'Walk the scoreboard', minutes: 15, text: 'Go metric by metric, comparing the actual to target and marking each on track or off track.' },
      { name: 'Flag the off-track metrics', minutes: 10, text: 'For every red number, the owner gives a one-line explanation and the metric drops to the issues list.' },
      { name: 'Trends and leading indicators', minutes: 10, text: 'Step back to spot trends across several weeks and check the leading indicators that predict the lagging ones.' },
      { name: 'Convert to owned actions', minutes: 5, text: 'Turn the most important off-track metrics into to-dos with owners, or schedule them for deeper issues solving.' },
    ],
    bodyHtml:
      '<p>The <strong>Pinnacle scoreboard review</strong> keeps the leadership team honest about the numbers. Based on the Pinnacle model by Pinnacle Business Guides, it walks the key metrics each week, separates on-track from off-track, and turns the red numbers into owned actions rather than quiet worry.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run it weekly, either as a standalone review or as the metrics segment inside the weekly pulse meeting. The discipline is in seeing the same numbers, on the same cadence, so trends become visible before they become problems.</p>' +
      '<h2>Who attends</h2>' +
      '<p>The leadership team and the people who own the metrics, three to ten people. Every number on the scoreboard should have a single owner in the room who can speak to it, since a metric without an owner is a metric nobody moves.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Frame the period, then go metric by metric, comparing actual to target and marking each on or off track without solving anything yet. For each red number, the owner gives a one-line explanation and the metric drops to the issues list. Step back to read trends and the leading indicators that predict the lagging ones, then convert the most important off-track metrics into to-dos with owners or schedule them for deeper solving. The review reads the signals; the solving happens with a clear owner attached.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Give every metric a single owner who speaks to it.</li>' +
      '<li>Read the signal first; do not solve every red number live.</li>' +
      '<li>Watch leading indicators, not just lagging results.</li>' +
      '<li>Convert the key reds into owned to-dos before closing.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Reviewing the scoreboard but never acting on the red numbers.</li>' +
      '<li>Tracking so many metrics that none of them get attention.</li>' +
      '<li>Watching only lagging results and missing the early warning.</li>' +
      '<li>Leaving a red number with no owner and no next step.</li>' +
      '</ul>' +
      '<p>Make the numbers drive action. <a href="/l8">Run it in OrgTP</a>, where a flexible meeting cadence keeps the scoreboard and your Pinnacle weekly rhythm connected.</p>',
    downloadMarkdown:
      '# Pinnacle Scoreboard / KPI Review Template\n\n' +
      'Purpose: Walk the key metrics, compare actuals to target, read trends and leading indicators, and turn off-track numbers into owned actions.\n\n' +
      '- Duration: 45 minutes\n' +
      '- Cadence: Weekly\n' +
      '- Participants: Leadership team and metric owners (3-10 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Open and frame the numbers (5 min) - read signals, not solve\n' +
      '- [ ] Walk the scoreboard (15 min) - actual vs target, on or off track\n' +
      '- [ ] Flag the off-track metrics (10 min) - one-line owner explanation\n' +
      '- [ ] Trends and leading indicators (10 min) - look across weeks\n' +
      '- [ ] Convert to owned actions (5 min) - to-dos or issues list\n\n' +
      '## Facilitator tips\n\n' +
      '- Give every metric a single owner.\n' +
      '- Read the signal first, solve outside the review.\n' +
      '- Watch leading indicators, not just lagging.\n' +
      '- Convert key reds into owned to-dos.\n\n' +
      '## Notes\n\n' +
      'On-track metrics:\n\n' +
      'Off-track metrics and owners:\n\n' +
      'Trends and leading indicators:\n\n' +
      'Actions and to-dos:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/pinnacle-scoreboard-review\n',
  },
  {
    slug: 'pinnacle-leadership-health-check',
    title: 'Pinnacle Leadership Team Health Check Template',
    shortName: 'Pinnacle Leadership Team Health Check',
    description:
      'Use this Pinnacle leadership team health check template and agenda to assess trust, conflict, and accountability, and build the team behind the operating system.',
    category: 'pinnacle',
    methodology: 'Pinnacle',
    minutes: 120,
    cadence: 'Quarterly',
    participants: 'Leadership team (3-8 people)',
    keywords: [
      'pinnacle leadership team health check template',
      'pinnacle team health check agenda',
      'pinnacle business guides',
      'pinnacle operating system meeting',
      'leadership team health check template',
      'team effectiveness meeting agenda',
      'pinnacle team assessment',
      'leadership trust and accountability session',
    ],
    steps: [
      { name: 'Set the tone and ground rules', minutes: 15, text: 'Open with the intent of the session and agree the ground rules that make candor safe.' },
      { name: 'Score the team health dimensions', minutes: 30, text: 'Rate the team on trust, healthy conflict, commitment, accountability, and results, individually then as a group.' },
      { name: 'Discuss the lowest scores', minutes: 30, text: 'Dig into the dimensions that scored lowest and the specific behaviors driving them.' },
      { name: 'Personal feedback round', minutes: 30, text: 'Each leader gives and receives one piece of constructive and one piece of appreciative feedback.' },
      { name: 'Commitments to improve', minutes: 15, text: 'Agree the few specific behavior changes the team will commit to and how they will be held to them.' },
    ],
    bodyHtml:
      '<p>The <strong>Pinnacle leadership team health check</strong> works on the team behind the operating system. Based on the Pinnacle model by Pinnacle Business Guides, it steps away from metrics to ask a different question: how healthy is the team running the plan, and where is trust, conflict, or accountability holding it back?</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run it quarterly, often as a block inside the quarterly planning session, and whenever the team feels stuck, guarded, or unable to disagree productively. A healthy team executes the plan; an unhealthy one will undermine even a great strategy.</p>' +
      '<h2>Who attends</h2>' +
      '<p>The intact leadership team only, three to eight people. This is a candid, sometimes vulnerable conversation, so the room must be the people who work together day to day, with no observers diluting the honesty.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Set the tone and agree ground rules that make candor safe, then score the team across trust, healthy conflict, commitment, accountability, and results. Dig into the lowest scores and the specific behaviors behind them rather than staying abstract. Run a structured feedback round so each leader gives and receives both constructive and appreciative input, and close by committing to a few concrete behavior changes the team will hold itself to. The value is in the honesty, not the scores.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Make the room safe before asking for candor.</li>' +
      '<li>Anchor the discussion in specific behaviors, not labels.</li>' +
      '<li>Structure the feedback round so everyone gives and receives.</li>' +
      '<li>Leave with a few committed changes, not a long list.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Keeping it polite and surface, so nothing real gets said.</li>' +
      '<li>Scoring the team but never discussing the low numbers.</li>' +
      '<li>Giving vague feedback that no one can act on.</li>' +
      '<li>Ending with insights but no committed behavior changes.</li>' +
      '</ul>' +
      '<p>Strengthen the team behind the plan. <a href="/l8">Run it in OrgTP</a>, where a flexible meeting cadence makes room for the Pinnacle team health rhythm alongside execution.</p>',
    downloadMarkdown:
      '# Pinnacle Leadership Team Health Check Template\n\n' +
      'Purpose: Assess team trust, conflict, commitment, accountability, and results, then commit to the behavior changes that strengthen the team behind the plan.\n\n' +
      '- Duration: 120 minutes\n' +
      '- Cadence: Quarterly\n' +
      '- Participants: Leadership team (3-8 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Set the tone and ground rules (15 min) - make candor safe\n' +
      '- [ ] Score the team health dimensions (30 min) - trust to results\n' +
      '- [ ] Discuss the lowest scores (30 min) - behaviors behind them\n' +
      '- [ ] Personal feedback round (30 min) - constructive and appreciative\n' +
      '- [ ] Commitments to improve (15 min) - few specific changes\n\n' +
      '## Facilitator tips\n\n' +
      '- Make the room safe before asking for candor.\n' +
      '- Anchor in specific behaviors, not labels.\n' +
      '- Structure the feedback round for everyone.\n' +
      '- Leave with a few committed changes.\n\n' +
      '## Notes\n\n' +
      'Health scores:\n\n' +
      'Lowest dimensions:\n\n' +
      'Feedback themes:\n\n' +
      'Committed changes:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/pinnacle-leadership-health-check\n',
  },
  {
    slug: 'pinnacle-vision-session',
    title: 'Pinnacle Vision & Purpose Session Template',
    shortName: 'Pinnacle Vision & Purpose Session',
    description:
      'Use this Pinnacle vision and purpose session template and agenda to clarify why the company exists, its core values, and the long-range vision that guides the plan.',
    category: 'pinnacle',
    methodology: 'Pinnacle',
    minutes: 240,
    cadence: 'Annually',
    participants: 'Leadership team (3-10 people)',
    keywords: [
      'pinnacle vision and purpose session template',
      'pinnacle vision session agenda',
      'pinnacle business guides',
      'pinnacle operating system meeting',
      'vision and purpose meeting template',
      'core values workshop agenda',
      'pinnacle purpose session',
      'company vision session template',
    ],
    steps: [
      { name: 'Why we exist', minutes: 45, text: 'Explore and articulate the core purpose: the reason the company exists beyond making money.' },
      { name: 'Discover core values', minutes: 60, text: 'Surface the handful of values the best people already live, drawn from real stories rather than aspiration.' },
      { name: 'Long-range vision and BHAG', minutes: 45, text: 'Define the long-range vision and the big audacious goal the company is ultimately reaching for.' },
      { name: 'Niche and brand promise', minutes: 45, text: 'Clarify the niche the company is uniquely built to serve and the promise it makes to customers.' },
      { name: 'Pressure-test and align', minutes: 30, text: 'Test the purpose, values, and vision for honesty and alignment, and refine until the whole team owns them.' },
      { name: 'Bring it to life', minutes: 15, text: 'Agree how purpose and values will show up in hiring, decisions, and daily behavior, not just on a wall.' },
    ],
    bodyHtml:
      '<p>The <strong>Pinnacle vision and purpose session</strong> defines the foundation everything else is built on. Based on the Pinnacle model by Pinnacle Business Guides, it clarifies why the company exists, the values that guide behavior, and the long-range vision that gives the annual and quarterly plans their direction.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run it when you are establishing purpose and values for the first time, when the company has grown past its founding story, or when decisions feel unmoored from any shared why. Revisit it periodically, since a vision that never gets re-examined slowly loses its meaning.</p>' +
      '<h2>Who attends</h2>' +
      '<p>The leadership team, three to ten people who shape culture and will carry the vision to the rest of the company. The conversation is reflective and sometimes personal, so a focused group produces a more honest result than a large one.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Start with why the company exists, reaching past the obvious to the real purpose. Discover core values from genuine stories about the best people rather than inventing aspirational ones. Define the long-range vision and the big audacious goal, clarify the niche and brand promise, then pressure-test the whole picture for honesty and alignment. Close by deciding how purpose and values will show up in hiring, decisions, and daily behavior, because a vision that lives only on a wall changes nothing.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Discover values from real stories, do not invent them.</li>' +
      '<li>Push past the obvious answer to the real purpose.</li>' +
      '<li>Make the vision concrete enough to guide decisions.</li>' +
      '<li>Decide how it shows up in behavior, not just on the wall.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Writing generic values that could belong to any company.</li>' +
      '<li>Crafting a vision so vague it guides no real decision.</li>' +
      '<li>Treating the session as wordsmithing instead of clarity.</li>' +
      '<li>Filing the result away and never living by it.</li>' +
      '</ul>' +
      '<p>Build the foundation under the plan. <a href="/l8">Run it in OrgTP</a>, where a flexible meeting cadence connects your Pinnacle vision to the annual and quarterly rhythm that executes it.</p>',
    downloadMarkdown:
      '# Pinnacle Vision & Purpose Session Template\n\n' +
      'Purpose: Clarify why the company exists, discover its core values, and define the long-range vision and niche that guide the annual and quarterly plans.\n\n' +
      '- Duration: 240 minutes\n' +
      '- Cadence: Annually (or when establishing or revisiting)\n' +
      '- Participants: Leadership team (3-10 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Why we exist (45 min) - the core purpose\n' +
      '- [ ] Discover core values (60 min) - from real stories\n' +
      '- [ ] Long-range vision and BHAG (45 min) - the destination\n' +
      '- [ ] Niche and brand promise (45 min) - who we serve and the promise\n' +
      '- [ ] Pressure-test and align (30 min) - refine until owned\n' +
      '- [ ] Bring it to life (15 min) - hiring, decisions, behavior\n\n' +
      '## Facilitator tips\n\n' +
      '- Discover values from real stories.\n' +
      '- Push past the obvious to the real purpose.\n' +
      '- Make the vision concrete enough to guide decisions.\n' +
      '- Decide how it shows up in behavior.\n\n' +
      '## Notes\n\n' +
      'Purpose:\n\n' +
      'Core values:\n\n' +
      'Vision and BHAG:\n\n' +
      'Niche and brand promise:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/pinnacle-vision-session\n',
  },
  {
    slug: 'pinnacle-90-day-sprint-planning',
    title: 'Pinnacle 90-Day Sprint Planning Template',
    shortName: 'Pinnacle 90-Day Sprint Planning',
    description:
      'Use this Pinnacle 90-day sprint planning template and agenda to turn annual goals into a focused set of quarterly priorities with owners and a definition of done.',
    category: 'pinnacle',
    methodology: 'Pinnacle',
    minutes: 240,
    cadence: 'Quarterly',
    participants: 'Leadership team (3-10 people)',
    keywords: [
      'pinnacle 90-day sprint planning template',
      'pinnacle 90 day sprint agenda',
      'pinnacle business guides',
      'pinnacle operating system meeting',
      '90 day sprint planning template',
      'pinnacle quarterly sprint agenda',
      'quarterly priorities planning template',
      'pinnacle 90 day plan',
    ],
    steps: [
      { name: 'Annual goals recap', minutes: 30, text: 'Restate the annual goals and current progress so every sprint priority traces back to the year.' },
      { name: 'Review last sprint', minutes: 30, text: 'Score the previous 90-day priorities done or not done and capture the lessons that shape this sprint.' },
      { name: 'Brainstorm candidate priorities', minutes: 40, text: 'Surface everything the company could focus on this quarter into one visible list before narrowing.' },
      { name: 'Choose the few priorities', minutes: 50, text: 'Narrow to three to five company priorities for the 90 days, the vital few that move the annual goals.' },
      { name: 'Owners and definition of done', minutes: 50, text: 'Assign one owner per priority and write a clear, measurable definition of done for each.' },
      { name: 'Confirm cadence and risks', minutes: 40, text: 'Agree the weekly and monthly cadence that will track the sprint and flag the biggest delivery risks.' },
    ],
    bodyHtml:
      '<p>The <strong>Pinnacle 90-day sprint planning</strong> session turns a year of ambition into a focused quarter of work. Based on the Pinnacle model by Pinnacle Business Guides, it narrows the many things the company could do into the vital few priorities it will actually finish in the next ninety days, each with an owner and a clear definition of done.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run it at the start of each quarter, anchored to the annual plan. It is the bridge between annual goals and weekly execution: the sprint decides what the next ninety days are for, and the weekly pulse keeps it on pace.</p>' +
      '<h2>Who attends</h2>' +
      '<p>The leadership team, three to ten people who will own the priorities. This is a commitment session, not a brainstorm for its own sake, so the room should be the people accountable for delivering the sprint.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Recap annual goals and score the last sprint honestly so the new quarter learns from the previous one. Brainstorm candidate priorities into one visible list, then do the hard work of narrowing to three to five that genuinely move the annual goals. Assign a single owner to each and write a measurable definition of done so success is unambiguous. Close by confirming the weekly and monthly cadence that will track the sprint and naming the biggest delivery risks up front. The discipline is in choosing few, not many.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Tie every priority back to an annual goal before it earns a slot.</li>' +
      '<li>Narrow ruthlessly; three to five priorities, not a dozen.</li>' +
      '<li>Write a measurable definition of done for each one.</li>' +
      '<li>Confirm the tracking cadence before anyone leaves.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Choosing too many priorities so the quarter loses focus.</li>' +
      '<li>Leaving the definition of done vague, so success is arguable.</li>' +
      '<li>Setting priorities with no owner, so they drift.</li>' +
      '<li>Skipping the tracking cadence, so the sprint is forgotten by week three.</li>' +
      '</ul>' +
      '<p>Make the next ninety days count. <a href="/l8">Run it in OrgTP</a>, where a flexible meeting cadence carries your Pinnacle sprint priorities straight into the weekly and monthly rhythm.</p>',
    downloadMarkdown:
      '# Pinnacle 90-Day Sprint Planning Template\n\n' +
      'Purpose: Turn annual goals into a focused set of three to five quarterly priorities, each with a single owner and a measurable definition of done.\n\n' +
      '- Duration: 240 minutes\n' +
      '- Cadence: Quarterly\n' +
      '- Participants: Leadership team (3-10 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Annual goals recap (30 min) - trace priorities to the year\n' +
      '- [ ] Review last sprint (30 min) - score done or not done\n' +
      '- [ ] Brainstorm candidate priorities (40 min) - one visible list\n' +
      '- [ ] Choose the few priorities (50 min) - 3 to 5 vital few\n' +
      '- [ ] Owners and definition of done (50 min) - measurable and clear\n' +
      '- [ ] Confirm cadence and risks (40 min) - weekly and monthly tracking\n\n' +
      '## Facilitator tips\n\n' +
      '- Tie every priority back to an annual goal.\n' +
      '- Narrow ruthlessly to 3 to 5 priorities.\n' +
      '- Write a measurable definition of done.\n' +
      '- Confirm the tracking cadence before closing.\n\n' +
      '## Notes\n\n' +
      'Annual goal progress:\n\n' +
      'Candidate priorities:\n\n' +
      'Chosen priorities and owners:\n\n' +
      'Definition of done and risks:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/pinnacle-90-day-sprint-planning\n',
  },
];
