import type { MeetingTemplate } from './_types.js';

export const SCALING_UP_TEMPLATES: MeetingTemplate[] = [
  {
    slug: 'scaling-up-daily-huddle',
    title: 'Daily Huddle Template',
    shortName: 'Daily Huddle',
    description:
      'Free daily huddle template and agenda based on the Scaling Up (Rockefeller Habits) model. Run a fast 15-minute daily standup that surfaces stucks and keeps the team aligned.',
    category: 'scaling-up',
    methodology: 'Scaling Up',
    minutes: 15,
    cadence: 'Daily',
    participants: 'Whole team or department (5-12 people, standing)',
    keywords: [
      'daily huddle template',
      'daily huddle agenda',
      'scaling up daily huddle',
      'rockefeller habits meeting agenda',
      'daily standup template',
      'scaling up meeting rhythm',
      '15 minute huddle',
      'team huddle agenda',
    ],
    steps: [
      {
        name: "What's up",
        minutes: 5,
        text: 'Each person shares one thing they are working on in the next 24 hours. Keep it to a single sentence so the round stays fast.',
      },
      {
        name: 'Daily metrics',
        minutes: 5,
        text: 'Review the one or two numbers the team watches every day (sales, leads, output, queue depth). Read the number, not a story.',
      },
      {
        name: 'Where are you stuck',
        minutes: 5,
        text: 'Each person names a constraint or stuck. Capture it for offline resolution. Do not solve problems in the huddle, just surface them.',
      },
    ],
    bodyHtml: `<p>The daily huddle is the heartbeat of the Scaling Up meeting rhythm. It is a fast, standing, 15-minute check-in that keeps everyone moving in the same direction and surfaces problems while they are still small. This daily huddle template is based on the <strong>Scaling Up (Rockefeller Habits)</strong> model created by Verne Harnish.</p>
<h2>When to use it</h2>
<p>Run it every working day at the same time, ideally early. The huddle is not a status report or a project meeting. It exists to align the next 24 hours, spot daily metrics drifting off track, and uncover stucks before they cost a week. If your team feels out of sync or surprises keep landing late, the daily huddle is the first habit to install.</p>
<h2>Who attends</h2>
<p>The whole team or a single department, typically five to twelve people. Everyone stands so the meeting stays short. Larger companies cascade huddles: the leadership team huddles, then each leader huddles with their own group.</p>
<h2>How to run it</h2>
<p>Start on time whether or not everyone is present, and end in fifteen minutes. Move through three quick rounds: what each person is focused on, the daily numbers the team tracks, and where anyone is stuck. The facilitator keeps the pace brisk and writes down stucks for resolution after the huddle. The discipline is consistency. The same time, the same format, every day, builds a rhythm the team can rely on.</p>
<h2>Facilitator tips</h2>
<ul>
<li>Stand up. Sitting invites sprawl and the meeting will balloon past fifteen minutes.</li>
<li>Park every problem. The huddle surfaces stucks, it does not solve them.</li>
<li>Use a visible timer so the team feels the cadence.</li>
<li>Rotate who leads the huddle to build shared ownership.</li>
</ul>
<h2>Common mistakes</h2>
<ul>
<li>Letting it become a status meeting where people narrate their whole day.</li>
<li>Solving problems live, which blows the timebox and bores the rest of the team.</li>
<li>Skipping the metrics so drift goes unnoticed for days.</li>
<li>Cancelling it when things get busy, which is exactly when alignment matters most.</li>
</ul>
<p>Ready to make the daily huddle a habit your team actually keeps? <a href="/l8">Run it in OrgTP</a> and let the rhythm run itself.</p>`,
    downloadMarkdown: `# Daily Huddle Template

Purpose: A fast 15-minute daily standup that aligns the next 24 hours, checks daily metrics, and surfaces stucks early. Based on the Scaling Up (Rockefeller Habits) model.

Duration: 15 min | Cadence: Daily | Participants: Whole team or department (5-12 people, standing)

## Agenda
- [ ] (5 min) What's up - each person shares one focus for the next 24 hours
- [ ] (5 min) Daily metrics - read the one or two numbers the team watches
- [ ] (5 min) Where are you stuck - surface constraints, capture for offline fix

## Facilitator tips
- Stand up to keep it short
- Park problems, do not solve them live
- Use a visible timer
- Start on time, end in 15 minutes

## Notes
Stucks to resolve after huddle:
-
-

Metrics today:
-

Follow-ups:
-

Free template from OrgTP. Adapt or run it live at orgtp.com/templates/scaling-up-daily-huddle`,
  },
  {
    slug: 'scaling-up-weekly-meeting',
    title: 'Weekly Staff Meeting Template',
    shortName: 'Weekly Staff Meeting',
    description:
      'Free weekly staff meeting template and agenda based on the Scaling Up (Rockefeller Habits) model. Review priorities, customer and employee data, and tackle one big issue.',
    category: 'scaling-up',
    methodology: 'Scaling Up',
    minutes: 75,
    cadence: 'Weekly',
    participants: 'Leadership team or department (5-10 people)',
    keywords: [
      'weekly staff meeting template',
      'weekly meeting agenda',
      'scaling up weekly meeting',
      'rockefeller habits meeting agenda',
      'scaling up meeting rhythm',
      'weekly team meeting template',
      'leadership weekly meeting',
      'collective intelligence meeting',
    ],
    steps: [
      {
        name: 'Good news',
        minutes: 5,
        text: 'Each person shares one personal and one business good-news item to start on a positive note and build the team.',
      },
      {
        name: 'The numbers',
        minutes: 10,
        text: 'Review the weekly scorecard and key metrics. Note what is on and off track without diving into solutions yet.',
      },
      {
        name: 'Customer and employee feedback',
        minutes: 10,
        text: 'Share themes from customer and employee conversations this week to keep the team close to the market.',
      },
      {
        name: 'Priorities and a-ha',
        minutes: 15,
        text: 'Check progress on quarterly priorities and rocks. Capture any a-ha insights worth acting on.',
      },
      {
        name: 'Collective intelligence: one issue',
        minutes: 30,
        text: 'Spend the bulk of the meeting on a single rock-level issue, applying the full brainpower of the team to solve it.',
      },
      {
        name: 'Closing round / who-what-when',
        minutes: 5,
        text: 'Each person states their key takeaway and any commitments. Confirm who is doing what by when.',
      },
    ],
    bodyHtml: `<p>The weekly staff meeting is where a team applies its collective intelligence to the issues that actually matter. Unlike the daily huddle, this is the meeting where you slow down and solve. This weekly meeting template is based on the <strong>Scaling Up (Rockefeller Habits)</strong> model from Verne Harnish.</p>
<h2>When to use it</h2>
<p>Hold it once a week, same day and time, for 60 to 90 minutes. It is the rhythm layer above the daily huddle and below the monthly management meeting. Use it to keep quarterly priorities on track, stay close to customer and employee feedback, and put the whole team on one meaningful problem each week.</p>
<h2>Who attends</h2>
<p>The leadership team or a single department, usually five to ten people. Everyone in the room should own a number or a priority so the discussion stays accountable.</p>
<h2>How to run it</h2>
<p>Open with good news to set the tone and connect as people. Then move through the numbers, customer and employee feedback, and a quick check on quarterly priorities. The heart of the meeting is one issue: pick a single rock-level problem and give it real time with the team's full brainpower. Close with a round where each person names their key takeaway and confirms who is doing what by when. The agenda flows from quick alignment into deep problem-solving and back out to commitments.</p>
<h2>Facilitator tips</h2>
<ul>
<li>Protect the one-issue block. It is the reason the meeting exists.</li>
<li>Keep the numbers segment to reporting, not debating.</li>
<li>Always end with who-what-when so decisions turn into action.</li>
<li>Start with good news even on hard weeks. It changes the energy.</li>
</ul>
<h2>Common mistakes</h2>
<ul>
<li>Spreading time thin across ten small topics instead of solving one big one.</li>
<li>Turning the numbers review into the whole meeting.</li>
<li>Letting it run long because there is no hard stop.</li>
<li>Leaving without clear owners and dates on every decision.</li>
</ul>
<p>Want every weekly meeting to end with real decisions and clear owners? <a href="/l8">Run it in OrgTP</a> and keep your team's rhythm tight.</p>`,
    downloadMarkdown: `# Weekly Staff Meeting Template

Purpose: A focused weekly meeting that reviews the numbers, stays close to customer and employee feedback, and applies the team's collective intelligence to one big issue. Based on the Scaling Up (Rockefeller Habits) model.

Duration: 75 min | Cadence: Weekly | Participants: Leadership team or department (5-10 people)

## Agenda
- [ ] (5 min) Good news - one personal, one business
- [ ] (10 min) The numbers - weekly scorecard, on and off track
- [ ] (10 min) Customer and employee feedback - themes from the week
- [ ] (15 min) Priorities and a-ha - progress on quarterly rocks
- [ ] (30 min) Collective intelligence - solve one rock-level issue
- [ ] (5 min) Closing round - takeaways and who-what-when

## Facilitator tips
- Protect the one-issue block
- Keep the numbers review to reporting, not debating
- End with who-what-when on every decision
- Open with good news even on hard weeks

## Notes
One issue this week:
-

Decisions (who / what / when):
-

Off-track numbers to watch:
-

Free template from OrgTP. Adapt or run it live at orgtp.com/templates/scaling-up-weekly-meeting`,
  },
  {
    slug: 'scaling-up-monthly-meeting',
    title: 'Monthly Management Meeting Template',
    shortName: 'Monthly Management Meeting',
    description:
      'Free monthly management meeting template and agenda based on the Scaling Up (Rockefeller Habits) model. Use a half-day to learn, review trends, and coach managers.',
    category: 'scaling-up',
    methodology: 'Scaling Up',
    minutes: 240,
    cadence: 'Monthly',
    participants: 'Extended management team (8-20 people)',
    keywords: [
      'monthly management meeting template',
      'monthly meeting agenda',
      'scaling up monthly meeting',
      'rockefeller habits meeting agenda',
      'management team meeting',
      'scaling up meeting rhythm',
      'monthly leadership meeting',
      'management learning meeting',
    ],
    steps: [
      {
        name: 'Opening and wins',
        minutes: 15,
        text: 'Welcome the extended team and review the biggest wins of the month to reinforce progress and culture.',
      },
      {
        name: 'Monthly financials and trends',
        minutes: 45,
        text: 'Walk through the P&L, cash, and key trends for the month. Compare to plan and discuss what the numbers reveal.',
      },
      {
        name: 'Priorities and rock review',
        minutes: 45,
        text: 'Review progress on quarterly priorities across teams. Surface what is at risk and reallocate help where needed.',
      },
      {
        name: 'Management learning / development',
        minutes: 60,
        text: 'Dedicate a block to teaching and skill-building so managers grow. This is the development purpose of the monthly meeting.',
      },
      {
        name: 'Cross-functional issues',
        minutes: 60,
        text: 'Work the issues that span departments and cannot be solved by a single team in a weekly meeting.',
      },
      {
        name: 'Wrap-up and commitments',
        minutes: 15,
        text: 'Summarize decisions, confirm owners and dates, and capture takeaways from the learning block.',
      },
    ],
    bodyHtml: `<p>The monthly management meeting is where leadership steps back from the weekly grind to review trends, develop managers, and solve the cross-functional issues that no single team can fix. It is part review, part classroom. This monthly management meeting template is based on the <strong>Scaling Up (Rockefeller Habits)</strong> model by Verne Harnish.</p>
<h2>When to use it</h2>
<p>Run it once a month, typically as a half-day session. Use it when you need more depth than the weekly meeting allows: full financial trends, quarterly priorities across the whole management layer, and deliberate time to teach and grow your managers. It is also the right venue for thorny issues that cross department lines.</p>
<h2>Who attends</h2>
<p>The extended management team, often eight to twenty people, including the leaders who run weekly meetings with their own groups. This wider room is what makes cross-functional problem-solving possible.</p>
<h2>How to run it</h2>
<p>Open with wins, then go deep on the month's financials and trends compared to plan. Review quarterly priorities across teams and flag anything at risk. The distinctive element is a real learning block: set aside an hour to teach a skill or develop the management muscle of the room. Then work the cross-functional issues that have been waiting for this larger audience, and close by confirming decisions, owners, and dates. The flow moves from review to development to resolution.</p>
<h2>Facilitator tips</h2>
<ul>
<li>Guard the learning block. Development is a stated purpose, not a nice-to-have.</li>
<li>Bring real financial trends, not just a single month's snapshot.</li>
<li>Use the wider room to solve issues that span departments.</li>
<li>Send pre-reading so the meeting is for discussion, not data dumps.</li>
</ul>
<h2>Common mistakes</h2>
<ul>
<li>Cutting the learning block when the agenda runs long.</li>
<li>Treating it as a longer weekly meeting instead of a step up in altitude.</li>
<li>Reviewing one month in isolation with no trend context.</li>
<li>Inviting the same small group and missing cross-functional perspective.</li>
</ul>
<p>Want a monthly meeting that develops managers and clears cross-team issues? <a href="/l8">Run it in OrgTP</a> and keep your rhythm intact.</p>`,
    downloadMarkdown: `# Monthly Management Meeting Template

Purpose: A half-day monthly session for the extended management team to review financial trends, check quarterly priorities, develop managers, and solve cross-functional issues. Based on the Scaling Up (Rockefeller Habits) model.

Duration: 240 min | Cadence: Monthly | Participants: Extended management team (8-20 people)

## Agenda
- [ ] (15 min) Opening and wins
- [ ] (45 min) Monthly financials and trends vs plan
- [ ] (45 min) Priorities and rock review across teams
- [ ] (60 min) Management learning / development block
- [ ] (60 min) Cross-functional issues
- [ ] (15 min) Wrap-up and commitments

## Facilitator tips
- Guard the learning block
- Bring trends, not a single-month snapshot
- Use the wider room for cross-department issues
- Send pre-reading ahead of time

## Notes
Learning topic this month:
-

Cross-functional issues solved:
-

Decisions (who / what / when):
-

Free template from OrgTP. Adapt or run it live at orgtp.com/templates/scaling-up-monthly-meeting`,
  },
  {
    slug: 'scaling-up-quarterly-planning',
    title: 'Quarterly Planning Meeting Template',
    shortName: 'Quarterly Planning Meeting',
    description:
      'Free quarterly planning meeting template and agenda based on the Scaling Up (Rockefeller Habits) model. Set the next quarter theme, priorities, and individual rocks in one day.',
    category: 'scaling-up',
    methodology: 'Scaling Up',
    minutes: 480,
    cadence: 'Quarterly',
    participants: 'Leadership team (5-12 people), full day offsite',
    keywords: [
      'quarterly planning meeting template',
      'quarterly planning agenda',
      'scaling up quarterly planning',
      'rockefeller habits meeting agenda',
      'quarterly priorities template',
      'company rocks template',
      'scaling up meeting rhythm',
      'leadership offsite agenda',
    ],
    steps: [
      {
        name: 'Check-in and prior quarter review',
        minutes: 60,
        text: 'Reconnect as a team and grade last quarter: which priorities were hit, which were missed, and why.',
      },
      {
        name: 'SWOT and trends',
        minutes: 60,
        text: 'Review strengths, weaknesses, opportunities, and threats, plus market and competitor trends shaping the quarter.',
      },
      {
        name: 'One-page strategic plan refresh',
        minutes: 60,
        text: 'Revisit the relevant rows of the One-Page Strategic Plan to ground the quarter in the longer-term direction.',
      },
      {
        name: 'Set the quarterly theme',
        minutes: 45,
        text: 'Define a single rallying theme for the quarter with a clear critical number and a way to celebrate.',
      },
      {
        name: 'Company priorities (rocks)',
        minutes: 90,
        text: 'Agree on three to five company priorities for the quarter. Make each measurable with a clear owner.',
      },
      {
        name: 'Individual priorities and KPIs',
        minutes: 90,
        text: 'Each leader sets their own quarterly priorities and the KPIs they will be accountable for.',
      },
      {
        name: 'Cascade and commitments',
        minutes: 75,
        text: 'Plan how priorities and the theme cascade to teams. Confirm communication, owners, and dates.',
      },
    ],
    bodyHtml: `<p>The quarterly planning meeting resets the company's focus for the next ninety days. It is the most important rhythm in Scaling Up because quarters are short enough to stay urgent and long enough to make real progress. This quarterly planning meeting template is based on the <strong>Scaling Up (Rockefeller Habits)</strong> model created by Verne Harnish.</p>
<h2>When to use it</h2>
<p>Run it once a quarter, ideally as a full day offsite away from daily interruptions. Use it to grade the quarter that is ending, refresh strategy against trends, set a single quarterly theme, and lock three to five company priorities plus individual priorities for each leader.</p>
<h2>Who attends</h2>
<p>The leadership team, typically five to twelve people. Going offsite signals that this day matters and protects the team from the pull of operational firefighting.</p>
<h2>How to run it</h2>
<p>Start by reconnecting and honestly grading the prior quarter. Move into a SWOT and trends discussion, then refresh the parts of the One-Page Strategic Plan that anchor the quarter. From there, set a rallying theme with a critical number, agree on company priorities, and have each leader define their own priorities and KPIs. Close by planning the cascade: how the theme and priorities reach every team. The day flows from reflection to strategy to commitment.</p>
<h2>Facilitator tips</h2>
<ul>
<li>Go offsite. The change of setting changes the thinking.</li>
<li>Grade last quarter honestly before setting the next one.</li>
<li>Cap company priorities at three to five so focus is real.</li>
<li>Make every priority measurable with one accountable owner.</li>
</ul>
<h2>Common mistakes</h2>
<ul>
<li>Setting ten priorities, which means none of them is truly a priority.</li>
<li>Skipping the honest review of the quarter that just ended.</li>
<li>Leaving without a plan to cascade priorities to the rest of the company.</li>
<li>Writing vague rocks that cannot be graded green or red.</li>
</ul>
<p>Ready to lock a quarter your whole company can rally behind? <a href="/l8">Run it in OrgTP</a> and keep every priority visible.</p>`,
    downloadMarkdown: `# Quarterly Planning Meeting Template

Purpose: A full-day offsite to grade the prior quarter, refresh strategy, set a quarterly theme, and lock three to five company priorities plus individual priorities and KPIs. Based on the Scaling Up (Rockefeller Habits) model.

Duration: 480 min | Cadence: Quarterly | Participants: Leadership team (5-12 people), full day offsite

## Agenda
- [ ] (60 min) Check-in and prior quarter review (grade the rocks)
- [ ] (60 min) SWOT and trends
- [ ] (60 min) One-Page Strategic Plan refresh
- [ ] (45 min) Set the quarterly theme and critical number
- [ ] (90 min) Company priorities (3-5 rocks)
- [ ] (90 min) Individual priorities and KPIs
- [ ] (75 min) Cascade plan and commitments

## Facilitator tips
- Go offsite to change the thinking
- Grade last quarter honestly first
- Cap company priorities at 3-5
- Make every priority measurable with one owner

## Notes
Quarterly theme:
-

Company priorities (rocks):
-

Cascade plan:
-

Free template from OrgTP. Adapt or run it live at orgtp.com/templates/scaling-up-quarterly-planning`,
  },
  {
    slug: 'scaling-up-annual-planning',
    title: 'Annual Strategic Planning Template',
    shortName: 'Annual Strategic Planning',
    description:
      'Free annual strategic planning template and agenda based on the Scaling Up (Rockefeller Habits) model. Set the year theme, annual priorities, and refresh the full strategy over two days.',
    category: 'scaling-up',
    methodology: 'Scaling Up',
    minutes: 960,
    cadence: 'Annually',
    participants: 'Leadership team (5-15 people), two-day offsite',
    keywords: [
      'annual strategic planning template',
      'annual planning meeting agenda',
      'scaling up annual planning',
      'rockefeller habits meeting agenda',
      'annual priorities template',
      'strategic planning offsite',
      'scaling up meeting rhythm',
      'one page strategic plan template',
    ],
    steps: [
      {
        name: 'Year in review',
        minutes: 90,
        text: 'Reflect on the past year: wins, misses, lessons, and how actual results compared to the annual plan.',
      },
      {
        name: 'Core values, purpose, BHAG',
        minutes: 90,
        text: 'Revisit core values, core purpose, and the Big Hairy Audacious Goal to confirm the long-term foundation.',
      },
      {
        name: 'Market, SWOT, and trends',
        minutes: 120,
        text: 'Analyze the market, run a SWOT, and study competitor and industry trends shaping the year ahead.',
      },
      {
        name: 'Three-year picture and targets',
        minutes: 120,
        text: 'Paint the three-year picture and set the financial and non-financial targets that define success.',
      },
      {
        name: 'Annual theme and critical number',
        minutes: 90,
        text: 'Set a single annual theme with a critical number, scoreboard, and celebration to rally the company.',
      },
      {
        name: 'Annual priorities',
        minutes: 150,
        text: 'Agree on three to five company priorities for the year, each measurable with a clear owner.',
      },
      {
        name: 'One-Page Strategic Plan finalize',
        minutes: 150,
        text: 'Update the full One-Page Strategic Plan so every row aligns from values through to this year priorities.',
      },
      {
        name: 'Q1 priorities and cascade',
        minutes: 150,
        text: 'Translate the annual plan into first-quarter priorities and a clear plan to cascade it across the company.',
      },
    ],
    bodyHtml: `<p>Annual strategic planning is the highest-altitude meeting in the Scaling Up rhythm. Over two days the leadership team revisits the foundation of the business, studies the market, and commits to a theme and priorities for the year ahead. This annual strategic planning template is based on the <strong>Scaling Up (Rockefeller Habits)</strong> model from Verne Harnish.</p>
<h2>When to use it</h2>
<p>Run it once a year, usually as a two-day offsite, before the new fiscal or calendar year begins. Use it when you need to step fully out of operations to review the year, refresh long-term strategy, and set the annual theme, targets, and priorities that everything else in the year will ladder up to.</p>
<h2>Who attends</h2>
<p>The leadership team, typically five to fifteen people. Two days offsite gives the room the space to think long-term, debate honestly, and reach real alignment rather than a rushed list.</p>
<h2>How to run it</h2>
<p>Open with an honest year in review, then return to the foundation: core values, purpose, and the long-term goal. Study the market and trends, paint the three-year picture, and set this year's targets. From there, define an annual theme with a critical number, agree on three to five annual priorities, and finalize the full One-Page Strategic Plan so every row aligns. Close the second day by translating the year into first-quarter priorities and a cascade plan. The two days move from reflection to strategy to a concrete first quarter.</p>
<h2>Facilitator tips</h2>
<ul>
<li>Block two full days offsite and protect them.</li>
<li>Anchor the year in core values and purpose before setting goals.</li>
<li>End with Q1 priorities so the plan has immediate traction.</li>
<li>Finalize the One-Page Strategic Plan in the room, not afterward.</li>
</ul>
<h2>Common mistakes</h2>
<ul>
<li>Compressing it into a single rushed day with no room to think.</li>
<li>Setting an annual theme but never building the scoreboard or celebration.</li>
<li>Leaving without translating the year into a concrete first quarter.</li>
<li>Producing a binder no one reads instead of a living one-page plan.</li>
</ul>
<p>Ready to set a year your whole company can execute? <a href="/l8">Run it in OrgTP</a> and keep the plan on one page and in front of everyone.</p>`,
    downloadMarkdown: `# Annual Strategic Planning Template

Purpose: A two-day offsite to review the year, refresh core values and long-term strategy, set the annual theme and targets, lock annual priorities, finalize the One-Page Strategic Plan, and translate it into Q1. Based on the Scaling Up (Rockefeller Habits) model.

Duration: 960 min | Cadence: Annually | Participants: Leadership team (5-15 people), two-day offsite

## Agenda
- [ ] (90 min) Year in review
- [ ] (90 min) Core values, purpose, BHAG
- [ ] (120 min) Market, SWOT, and trends
- [ ] (120 min) Three-year picture and targets
- [ ] (90 min) Annual theme and critical number
- [ ] (150 min) Annual priorities (3-5 rocks)
- [ ] (150 min) One-Page Strategic Plan finalize
- [ ] (150 min) Q1 priorities and cascade

## Facilitator tips
- Block two full days offsite
- Anchor the year in values and purpose first
- End with Q1 priorities for traction
- Finalize the one-page plan in the room

## Notes
Annual theme:
-

Annual priorities:
-

Q1 priorities:
-

Free template from OrgTP. Adapt or run it live at orgtp.com/templates/scaling-up-annual-planning`,
  },
  {
    slug: 'one-page-strategic-plan-session',
    title: 'One-Page Strategic Plan (OPSP) Working Session Template',
    shortName: 'One-Page Strategic Plan Session',
    description:
      'Free one page strategic plan template and agenda based on the Scaling Up (Rockefeller Habits) model. Build the OPSP row by row, from core values to quarterly priorities.',
    category: 'scaling-up',
    methodology: 'Scaling Up',
    minutes: 180,
    cadence: 'As needed',
    participants: 'Leadership team (4-10 people)',
    keywords: [
      'one page strategic plan template',
      'opsp template',
      'one page strategic plan session',
      'rockefeller habits meeting agenda',
      'scaling up strategic plan',
      'strategic planning template',
      'scaling up meeting rhythm',
      'opsp working session',
    ],
    steps: [
      {
        name: 'Orientation to the OPSP',
        minutes: 20,
        text: 'Walk the team through the structure of the One-Page Strategic Plan so everyone understands how the rows connect.',
      },
      {
        name: 'Core values and purpose',
        minutes: 30,
        text: 'Confirm or draft core values and the core purpose that anchor the left side of the plan.',
      },
      {
        name: 'Targets: 10-25 year and 3-5 year',
        minutes: 30,
        text: 'Set the long-range BHAG and the three-to-five-year targets that define mid-term success.',
      },
      {
        name: 'One-year goals and key initiatives',
        minutes: 40,
        text: 'Define this year goals, the critical number, and the key initiatives that will move them.',
      },
      {
        name: 'Quarterly priorities and theme',
        minutes: 40,
        text: 'Translate the year into the current quarter priorities, theme, and critical number.',
      },
      {
        name: 'Accountabilities and review',
        minutes: 20,
        text: 'Assign owners across the plan and review the full page for alignment top to bottom.',
      },
    ],
    bodyHtml: `<p>The One-Page Strategic Plan, or OPSP, captures a company's entire strategy on a single page, from core values all the way down to this quarter's priorities. This working session builds it row by row with the leadership team. The OPSP working session template is based on the <strong>Scaling Up (Rockefeller Habits)</strong> model created by Verne Harnish.</p>
<h2>When to use it</h2>
<p>Use it whenever you need to create the OPSP for the first time or do a focused rebuild outside of annual planning. It also works as a deep-dive when the team senses the plan has drifted and the rows no longer line up. The goal is a single coherent page everyone can see and act on.</p>
<h2>Who attends</h2>
<p>The leadership team, usually four to ten people. A small, senior room keeps the debate honest and the page tight rather than a committee-written compromise.</p>
<h2>How to run it</h2>
<p>Start by orienting the team to how the OPSP is structured so the conversation has a shared map. Then work left to right and top to bottom: core values and purpose, the long-range and mid-range targets, this year's goals and key initiatives, and finally the current quarter's priorities and theme. Finish by assigning owners and reading the whole page top to bottom to make sure every row supports the one above it. The session flows from foundation to near-term execution on a single canvas.</p>
<h2>Facilitator tips</h2>
<ul>
<li>Keep it to one page. The constraint is the value.</li>
<li>Work top to bottom so each row aligns with the one above it.</li>
<li>Use draft language and refine, rather than stalling on perfect wording.</li>
<li>Assign an owner to every row before you leave.</li>
</ul>
<h2>Common mistakes</h2>
<ul>
<li>Letting the plan spill onto multiple pages and lose its punch.</li>
<li>Filling rows that contradict each other because no one read top to bottom.</li>
<li>Debating wording for an hour instead of drafting and moving on.</li>
<li>Building the page and then never putting it in front of the team again.</li>
</ul>
<p>Ready to get your whole strategy on one page your team actually uses? <a href="/l8">Run it in OrgTP</a> and keep the plan alive.</p>`,
    downloadMarkdown: `# One-Page Strategic Plan (OPSP) Working Session Template

Purpose: A focused working session to build the One-Page Strategic Plan row by row, from core values and long-range targets down to this quarter's priorities. Based on the Scaling Up (Rockefeller Habits) model.

Duration: 180 min | Cadence: As needed | Participants: Leadership team (4-10 people)

## Agenda
- [ ] (20 min) Orientation to the OPSP structure
- [ ] (30 min) Core values and purpose
- [ ] (30 min) Targets: 10-25 year BHAG and 3-5 year
- [ ] (40 min) One-year goals and key initiatives
- [ ] (40 min) Quarterly priorities and theme
- [ ] (20 min) Accountabilities and full-page review

## Facilitator tips
- Keep it to one page
- Work top to bottom so rows align
- Draft and refine, do not stall on wording
- Assign an owner to every row

## Notes
Core values:
-

One-year goals:
-

This quarter priorities:
-

Free template from OrgTP. Adapt or run it live at orgtp.com/templates/one-page-strategic-plan-session`,
  },
  {
    slug: 'cash-power-of-one-meeting',
    title: 'Cash / Power of One Meeting Template',
    shortName: 'Cash / Power of One Meeting',
    description:
      'Free cash and Power of One meeting template and agenda based on the Scaling Up (Rockefeller Habits) model. Improve your Cash Conversion Cycle and test the seven levers of cash.',
    category: 'scaling-up',
    methodology: 'Scaling Up',
    minutes: 90,
    cadence: 'Monthly',
    participants: 'Finance lead and leadership team (3-8 people)',
    keywords: [
      'cash flow meeting template',
      'power of one template',
      'cash conversion cycle template',
      'rockefeller habits meeting agenda',
      'scaling up cash meeting',
      'seven levers of cash',
      'scaling up meeting rhythm',
      'cash flow meeting agenda',
    ],
    steps: [
      {
        name: 'Cash position review',
        minutes: 15,
        text: 'Review current cash on hand, the cash trend, and any near-term cash risks or large commitments.',
      },
      {
        name: 'Cash Conversion Cycle',
        minutes: 20,
        text: 'Walk through the Cash Conversion Cycle: how long it takes a dollar spent to come back as cash collected.',
      },
      {
        name: 'Power of One levers',
        minutes: 25,
        text: 'Test the seven levers of cash (price, volume, COGS, overhead, receivables, payables, inventory) one percentage point at a time to see the cash impact.',
      },
      {
        name: 'Bottlenecks and opportunities',
        minutes: 20,
        text: 'Identify the biggest bottleneck in the cycle and the lever with the most upside this quarter.',
      },
      {
        name: 'Actions and owners',
        minutes: 10,
        text: 'Commit to specific cash-improvement actions with owners and dates, and decide what to track next month.',
      },
    ],
    bodyHtml: `<p>The cash meeting puts the leadership team's attention on the single resource a growing company runs out of first: cash. Using the Power of One model, the team tests how small changes to seven levers move cash, then attacks the biggest bottleneck. This cash and Power of One meeting template is based on the <strong>Scaling Up (Rockefeller Habits)</strong> model by Verne Harnish.</p>
<h2>When to use it</h2>
<p>Run it monthly, or more often when cash is tight or growth is fast. Growth consumes cash, so the faster you scale the more this meeting matters. Use it to understand your Cash Conversion Cycle, find where cash gets stuck, and decide which lever to pull this quarter.</p>
<h2>Who attends</h2>
<p>The finance lead plus a small slice of the leadership team, usually three to eight people. Keep it tight and include the people who can actually move price, costs, receivables, or inventory.</p>
<h2>How to run it</h2>
<p>Begin with the current cash position and trend. Walk the Cash Conversion Cycle to see how long a dollar takes to return as collected cash. Then run the Power of One: change each of the seven levers by a single percentage point or one day and watch the cash effect. From there, name the biggest bottleneck and the lever with the most upside, and commit to specific actions with owners and dates. The meeting flows from understanding the cycle to choosing where to act.</p>
<h2>Facilitator tips</h2>
<ul>
<li>Model one lever at a time so the team sees each effect clearly.</li>
<li>Focus on the Cash Conversion Cycle, not just the bank balance.</li>
<li>Pick one or two levers to act on rather than chasing all seven.</li>
<li>Track the same metrics each month to see real movement.</li>
</ul>
<h2>Common mistakes</h2>
<ul>
<li>Watching only the bank balance and ignoring the cycle behind it.</li>
<li>Trying to pull all seven levers at once and moving none of them.</li>
<li>Leaving without an owner on any cash action.</li>
<li>Skipping the meeting in good times, then scrambling when cash gets tight.</li>
</ul>
<p>Ready to stop guessing about cash and start pulling the right levers? <a href="/l8">Run it in OrgTP</a> and keep cash in the team's line of sight.</p>`,
    downloadMarkdown: `# Cash / Power of One Meeting Template

Purpose: A monthly meeting to understand the Cash Conversion Cycle, test the seven levers of cash with the Power of One, and act on the biggest cash opportunity. Based on the Scaling Up (Rockefeller Habits) model.

Duration: 90 min | Cadence: Monthly | Participants: Finance lead and leadership team (3-8 people)

## Agenda
- [ ] (15 min) Cash position review - cash on hand, trend, risks
- [ ] (20 min) Cash Conversion Cycle walkthrough
- [ ] (25 min) Power of One - test the seven levers one point at a time
- [ ] (20 min) Bottlenecks and opportunities
- [ ] (10 min) Actions and owners

## Facilitator tips
- Model one lever at a time
- Focus on the cycle, not just the bank balance
- Pick one or two levers to act on
- Track the same metrics each month

## Notes
Cash Conversion Cycle (days):
-

Biggest bottleneck:
-

Cash actions (who / what / when):
-

Free template from OrgTP. Adapt or run it live at orgtp.com/templates/cash-power-of-one-meeting`,
    guideHtml: `<h2>The Ultimate Cash &amp; Power of One Meeting Template &amp; Agenda Guide</h2>
<p>In business, profit is an opinion, but cash is a fact. Many growing companies find themselves highly profitable on paper while simultaneously struggling with cash flow bottlenecks. To build a resilient, scalable business, leadership teams must move beyond standard profit and loss (P&amp;L) statements and actively manage their cash operating cycle. That is where the <strong>Power of One</strong> framework comes in.</p>
<p>The Power of One is a strategic financial exercise that demonstrates how small, incremental changes across seven key operational levers can have a massive, compounding impact on your company's cash flow and overall valuation.</p>
<p>This comprehensive guide provides a battle-tested <strong>Power of One Meeting Template</strong> and a step-by-step agenda to help your leadership team analyze cash flow, model growth scenarios, and unlock hidden capital.</p>

<h2>What is a Cash &amp; Power of One Meeting?</h2>
<p>A Cash / Power of One Meeting is a strategic, 90-minute financial review held monthly or quarterly.</p>
<p>The primary objective of the meeting is to evaluate the company's cash position, analyze the cash conversion cycle, and run scenario modeling using the <strong>7 Financial Levers</strong>. Rather than focusing on complex accounting rules, this meeting is designed to help non-financial leaders understand how their daily operational decisions directly impact the company's bank account.</p>
<h3>The Core Objectives of the Meeting:</h3>
<ul>
<li><strong>Review Cash Runway:</strong> Understand the company's current cash position, net burn rate, and runway.</li>
<li><strong>Analyze the Cash Conversion Cycle:</strong> Measure the time it takes for a dollar spent on inventory or resources to return to the bank account as revenue.</li>
<li><strong>Model the 7 Levers:</strong> Run scenario analyses to see how 1% or 1-day adjustments impact cash flow.</li>
<li><strong>Commit to Cash Initiatives:</strong> Agree on specific operational changes to optimize cash flow over the next 30 to 90 days.</li>
</ul>

<h2>The Standard 90-Minute Cash &amp; Power of One Agenda</h2>
<p>To cover historical cash performance, run scenario modeling, and agree on operational changes, we recommend a structured <strong>90-minute time-boxed agenda</strong>:</p>
<table class="td-guide-table">
<thead><tr><th>Time</th><th>Agenda Item</th><th>Objective</th></tr></thead>
<tbody>
<tr><td><strong>00:00 - 00:15</strong></td><td><strong>Cash Position &amp; Runway Review</strong></td><td>Review current cash balances, accounts receivable (A/R) aging, accounts payable (A/P) aging, and net cash flow.</td></tr>
<tr><td><strong>00:15 - 00:45</strong></td><td><strong>The 7 Financial Levers Analysis</strong></td><td>Go through each of the 7 operational levers. Identify which levers are currently underperforming or creating bottlenecks.</td></tr>
<tr><td><strong>00:45 - 01:15</strong></td><td><strong>Scenario Modeling (The Power of One)</strong></td><td>Run live scenario modeling. Calculate the cash impact of making a 1% or 1-day improvement across each of the 7 levers.</td></tr>
<tr><td><strong>01:15 - 01:30</strong></td><td><strong>Action Items &amp; Cash Commitments</strong></td><td>Agree on 1-2 specific cash-optimization initiatives for the upcoming month, assign owners, and close the meeting.</td></tr>
</tbody>
</table>

<h2>The 7 Financial Levers of the Power of One</h2>
<p>To unlock hidden cash in your business, your leadership team must analyze and optimize these seven operational levers:</p>
<ol>
<li><strong>Price:</strong> Can you increase your prices by 1%? A 1% price increase flows directly to the bottom line with zero added cost.</li>
<li><strong>Volume:</strong> Can you sell 1% more units or secure 1% more transactions at your current price point?</li>
<li><strong>Cost of Goods Sold (COGS):</strong> Can you reduce your direct costs (materials, direct labor, software licensing) by 1%?</li>
<li><strong>Operating Expenses (OpEx):</strong> Can you reduce your indirect overhead costs (rent, administrative software, travel) by 1%?</li>
<li><strong>Accounts Receivable (A/R) Days:</strong> Can you collect payments from your customers 1 day faster?</li>
<li><strong>Inventory / Work-in-Progress (WIP) Days:</strong> Can you reduce the time your inventory or service delivery sits in progress by 1 day?</li>
<li><strong>Accounts Payable (A/P) Days:</strong> Can you negotiate with your vendors to pay them 1 day later without incurring penalties?</li>
</ol>

<h2>Best Practices for a High-Impact Cash Review</h2>
<h3>1. Focus on Small, Compounding Changes</h3>
<p>Do not try to find a single, massive 20% cost-cutting measure. The magic of the Power of One is in the compounding effect of small changes. A 1% increase in price, combined with a 1% reduction in COGS and a 1-day reduction in A/R days, can easily increase a company's cash flow by 10% to 30% without disrupting operations.</p>
<h3>2. Involve Cross-Functional Leaders</h3>
<p>Cash flow is not just the CFO's job. Every department head controls at least one of the 7 levers. Sales leaders control Price and Volume; operations leaders control COGS and Inventory; HR and marketing leaders control OpEx; customer success leaders often influence A/R days. Involving all leaders builds shared financial accountability.</p>
<h3>3. Model Scenarios Live</h3>
<p>Use a spreadsheet or financial modeling tool to run scenarios live during the meeting. Showing your sales leader exactly how much cash is unlocked by a 1% price increase - or showing your operations leader the cash cost of holding excess inventory - makes the financial reality of the business tangible and actionable.</p>

<h2>Frequently Asked Questions (FAQs)</h2>
<h3>What is the "Power of One" in business?</h3>
<p>The Power of One is a financial management framework that shows how making small, 1% or 1-day improvements across seven key operational levers (Price, Volume, COGS, OpEx, A/R, Inventory, and A/P) can dramatically increase a company's cash flow and valuation.</p>
<h3>How often should you run a Cash / Power of One meeting?</h3>
<p>We recommend running a dedicated Cash / Power of One meeting <strong>monthly</strong> for companies experiencing rapid growth, tight cash flow, or significant inventory cycles. For stable, cash-rich companies, a <strong>quarterly</strong> strategic review is sufficient.</p>
<h3>What are the 7 financial levers of cash flow?</h3>
<p>The 7 financial levers are: Price, Volume, Cost of Goods Sold (COGS), Operating Expenses (OpEx), Accounts Receivable (A/R) Days, Inventory/WIP Days, and Accounts Payable (A/P) Days.</p>
<h3>How does the Power of One differ from a standard budget review?</h3>
<p>A standard budget review compares actual expenses against forecasted budgets to control spending. The Power of One is a strategic, forward-looking exercise focused on optimizing the cash conversion cycle and modeling the compounding impact of operational changes on cash flow.</p>`,
    // FAQPage JSON-LD source. Keep verbatim with the visible FAQ in guideHtml above.
    faq: [
      {
        q: 'What is the "Power of One" in business?',
        a: 'The Power of One is a financial management framework that shows how making small, 1% or 1-day improvements across seven key operational levers (Price, Volume, COGS, OpEx, A/R, Inventory, and A/P) can dramatically increase a company\'s cash flow and valuation.',
      },
      {
        q: 'How often should you run a Cash / Power of One meeting?',
        a: 'We recommend running a dedicated Cash / Power of One meeting monthly for companies experiencing rapid growth, tight cash flow, or significant inventory cycles. For stable, cash-rich companies, a quarterly strategic review is sufficient.',
      },
      {
        q: 'What are the 7 financial levers of cash flow?',
        a: 'The 7 financial levers are: Price, Volume, Cost of Goods Sold (COGS), Operating Expenses (OpEx), Accounts Receivable (A/R) Days, Inventory/WIP Days, and Accounts Payable (A/P) Days.',
      },
      {
        q: 'How does the Power of One differ from a standard budget review?',
        a: 'A standard budget review compares actual expenses against forecasted budgets to control spending. The Power of One is a strategic, forward-looking exercise focused on optimizing the cash conversion cycle and modeling the compounding impact of operational changes on cash flow.',
      },
    ],
  },
  {
    slug: 'quarterly-theme-rollout-meeting',
    title: 'Quarterly Theme Rollout Meeting Template',
    shortName: 'Quarterly Theme Rollout Meeting',
    description:
      'Free quarterly theme rollout meeting template and agenda based on the Scaling Up (Rockefeller Habits) model. Launch the new theme, scoreboard, and celebration to the whole company.',
    category: 'scaling-up',
    methodology: 'Scaling Up',
    minutes: 60,
    cadence: 'Quarterly',
    participants: 'Whole company (all hands)',
    keywords: [
      'quarterly theme template',
      'theme rollout meeting agenda',
      'scaling up quarterly theme',
      'rockefeller habits meeting agenda',
      'company all hands template',
      'quarterly priorities rollout',
      'scaling up meeting rhythm',
      'critical number scoreboard',
    ],
    steps: [
      {
        name: 'Celebrate last quarter',
        minutes: 10,
        text: 'Recognize wins and celebrate whether the prior quarter theme and critical number were hit.',
      },
      {
        name: 'Why this theme',
        minutes: 10,
        text: 'Explain the context behind the new quarterly theme so the company understands the why, not just the what.',
      },
      {
        name: 'The theme and critical number',
        minutes: 15,
        text: 'Reveal the quarterly theme and the single critical number that defines success for everyone.',
      },
      {
        name: 'Scoreboard and how we track it',
        minutes: 10,
        text: 'Show the scoreboard, where it lives, and how progress will be visible to the whole company every week.',
      },
      {
        name: 'The reward and celebration',
        minutes: 10,
        text: 'Announce how the team will celebrate when the critical number is hit, making the goal tangible and fun.',
      },
      {
        name: 'Q&A and rally',
        minutes: 5,
        text: 'Answer questions, confirm everyone knows their part, and end on energy that rallies the company.',
      },
    ],
    bodyHtml: `<p>The quarterly theme rollout turns a leadership team's quarterly priorities into something the whole company can rally around. A great theme makes a dry critical number memorable, visible, and even fun. This quarterly theme rollout meeting template is based on the <strong>Scaling Up (Rockefeller Habits)</strong> model from Verne Harnish.</p>
<h2>When to use it</h2>
<p>Run it at the start of each quarter, right after leadership sets the theme in quarterly planning. It is an all-hands moment designed to launch the theme, the critical number, the scoreboard, and the celebration so everyone, not just leaders, knows what winning looks like for the next ninety days.</p>
<h2>Who attends</h2>
<p>The whole company. This is one of the few meetings where everyone belongs in the room, because the theme only works if every person can see how they contribute to the critical number.</p>
<h2>How to run it</h2>
<p>Open by celebrating the quarter that just ended and whether the last theme was hit. Explain why this new theme matters, then reveal the theme and the single critical number that defines success. Show the scoreboard and exactly how progress will stay visible week to week, and announce how the team will celebrate when the number is reached. Close with questions and a genuine rally. The meeting flows from celebration to clarity to energy.</p>
<h2>Facilitator tips</h2>
<ul>
<li>Make the theme vivid and memorable, not a corporate slogan.</li>
<li>Tie the theme to one clear critical number everyone can see.</li>
<li>Put the scoreboard somewhere people pass every day.</li>
<li>Pre-commit to the celebration so the reward feels real.</li>
</ul>
<h2>Common mistakes</h2>
<ul>
<li>Announcing a theme with no scoreboard, so it fades within a week.</li>
<li>Picking a number so abstract that frontline staff cannot influence it.</li>
<li>Skipping the celebration, which drains the theme of its energy.</li>
<li>Treating it as a leadership message rather than a true all-hands rally.</li>
</ul>
<p>Ready to launch a quarter the whole company can rally behind? <a href="/l8">Run it in OrgTP</a> and keep the scoreboard in front of everyone.</p>`,
    downloadMarkdown: `# Quarterly Theme Rollout Meeting Template

Purpose: An all-hands meeting to launch the new quarterly theme, critical number, scoreboard, and celebration so the whole company knows what winning looks like. Based on the Scaling Up (Rockefeller Habits) model.

Duration: 60 min | Cadence: Quarterly | Participants: Whole company (all hands)

## Agenda
- [ ] (10 min) Celebrate last quarter
- [ ] (10 min) Why this theme - the context
- [ ] (15 min) The theme and critical number
- [ ] (10 min) Scoreboard and how we track it
- [ ] (10 min) The reward and celebration
- [ ] (5 min) Q&A and rally

## Facilitator tips
- Make the theme vivid and memorable
- Tie it to one clear critical number
- Put the scoreboard where people see it daily
- Pre-commit to the celebration

## Notes
This quarter theme:
-

Critical number:
-

Celebration when we hit it:
-

Free template from OrgTP. Adapt or run it live at orgtp.com/templates/quarterly-theme-rollout-meeting`,
  },
];
