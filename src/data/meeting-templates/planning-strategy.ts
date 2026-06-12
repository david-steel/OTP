// Planning and strategy meeting templates for the /templates library.
// AUTHORED content. bodyHtml renders via <%- %>. Byte-stable: no Date.now,
// no randomness. See _types.ts for the shared contract.

import type { MeetingTemplate } from './_types.js';

export const PLANNING_STRATEGY_TEMPLATES: MeetingTemplate[] = [
  {
    slug: 'okr-planning-meeting',
    title: 'OKR Planning Meeting Template',
    shortName: 'OKR Planning Meeting',
    description:
      'Use this OKR planning template to set quarterly objectives and measurable key results, align teams, and turn strategy into focused, accountable outcomes.',
    category: 'planning',
    methodology: 'OKR',
    minutes: 120,
    cadence: 'Quarterly',
    participants: 'Leadership team and team leads (5-12 people)',
    keywords: [
      'OKR planning template',
      'OKR planning meeting agenda',
      'quarterly OKR template',
      'objectives and key results template',
      'OKR setting meeting',
      'team alignment meeting agenda',
      'goal setting meeting template',
      'OKR workshop agenda',
    ],
    steps: [
      { name: 'Context and mission recap', minutes: 15, text: 'Restate company mission, annual goals, and the strategic theme for the upcoming quarter so every objective ties back to direction.' },
      { name: 'Review last quarter OKRs', minutes: 20, text: 'Score each prior objective 0.0 to 1.0, discuss what drove the result, and capture lessons that should shape the new cycle.' },
      { name: 'Draft objectives', minutes: 25, text: 'Propose 3 to 5 qualitative objectives for the quarter. Pressure-test each for ambition, clarity, and alignment to the annual plan.' },
      { name: 'Define key results', minutes: 30, text: 'Attach 2 to 4 measurable key results to each objective. Confirm each is quantifiable, time-bound, and owned by a named person.' },
      { name: 'Assign owners and dependencies', minutes: 15, text: 'Confirm a single owner per objective, map cross-team dependencies, and flag any resourcing conflicts.' },
      { name: 'Commit and confidence check', minutes: 15, text: 'Run a confidence vote on each key result, finalize the set, and agree the check-in cadence for the quarter.' },
    ],
    bodyHtml:
      '<p>The <strong>OKR planning meeting</strong> is where a quarter of focus gets decided. It turns broad strategy into a small set of objectives and the measurable key results that prove progress. Done well, this meeting replaces a dozen scattered priorities with three or four that everyone can name.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run this template at the start of every quarter, ideally one to two weeks before the new quarter begins so owners can start clean. Use it whenever you are introducing OKRs for the first time, resetting after a strategy shift, or aligning multiple teams around shared outcomes.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Keep the room to the leadership team plus the team leads who will own objectives. Five to twelve people is the sweet spot. Larger groups slow scoring and dilute ownership, so cascade detailed team OKRs in follow-up sessions rather than the main planning meeting.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Open by reconnecting to mission and the annual plan, then score last quarter honestly before drafting anything new. Draft objectives first as plain-language statements of intent, then attach key results that are numeric and unambiguous. Assign one owner per objective, surface dependencies, and close with a confidence vote so the team commits with eyes open rather than nodding along.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Cap the set at three to five objectives. More than that is a wish list, not a plan.</li>' +
      '<li>Write key results as numbers, not activities. <em>Ship the feature</em> is a task; <em>lift activation to 40 percent</em> is a result.</li>' +
      '<li>Score last quarter before drafting the new one so lessons carry forward.</li>' +
      '<li>Push back on any objective without a single accountable owner.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Confusing key results with task lists, which makes the quarter feel busy but not directional.</li>' +
      '<li>Setting too many objectives so attention fragments and nothing moves.</li>' +
      '<li>Skipping the prior-quarter review, which repeats the same misses.</li>' +
      '<li>Leaving the room without a confidence check, so weak buy-in surfaces too late.</li>' +
      '</ul>' +
      '<p>Ready to put this into practice? <a href="/l8">Run it in OrgTP</a> and keep your objectives, key results, and owners visible every week.</p>',
    downloadMarkdown:
      '# OKR Planning Meeting Template\n\n' +
      'Purpose: Set 3 to 5 quarterly objectives with measurable key results, assign clear owners, and align teams on a focused plan for the quarter.\n\n' +
      '- Duration: 120 minutes\n' +
      '- Cadence: Quarterly\n' +
      '- Participants: Leadership team and team leads (5-12 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Context and mission recap (15 min)\n' +
      '- [ ] Review last quarter OKRs and score 0.0 to 1.0 (20 min)\n' +
      '- [ ] Draft 3 to 5 objectives (25 min)\n' +
      '- [ ] Define 2 to 4 key results per objective (30 min)\n' +
      '- [ ] Assign owners and map dependencies (15 min)\n' +
      '- [ ] Commit and run confidence check (15 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Cap the set at 3 to 5 objectives.\n' +
      '- Write key results as numbers, not activities.\n' +
      '- Score last quarter before drafting the new one.\n' +
      '- Require a single accountable owner per objective.\n\n' +
      '## Notes / Decisions\n\n' +
      'Objectives:\n\n' +
      'Key results:\n\n' +
      'Owners:\n\n' +
      'Confidence check:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/okr-planning-meeting\n',
  },
  {
    slug: 'okr-check-in-meeting',
    title: 'OKR Weekly Check-in Template',
    shortName: 'OKR Weekly Check-in',
    description:
      'Use this OKR check-in template to track key result progress weekly, update confidence levels, surface blockers, and keep quarterly objectives on pace.',
    category: 'planning',
    methodology: 'OKR',
    minutes: 30,
    cadence: 'Weekly',
    participants: 'Team and objective owners (3-8 people)',
    keywords: [
      'OKR check-in template',
      'weekly OKR meeting agenda',
      'OKR progress tracking template',
      'OKR review meeting',
      'key results check-in agenda',
      'OKR confidence check template',
      'weekly goal review meeting',
    ],
    steps: [
      { name: 'Quick wins and momentum', minutes: 5, text: 'Each owner shares one concrete win since the last check-in to anchor the meeting in progress.' },
      { name: 'Key result progress update', minutes: 10, text: 'Walk each key result, update the current metric, and compare actual pace against the expected trajectory for the quarter.' },
      { name: 'Confidence rating refresh', minutes: 5, text: 'Re-rate confidence on each objective using a simple high, medium, or low signal and note any change from last week.' },
      { name: 'Blockers and help needed', minutes: 7, text: 'Surface anything slowing a key result and decide who unblocks it, by when.' },
      { name: 'Commitments for the week', minutes: 3, text: 'Each owner names the single most important action that moves a key result before the next check-in.' },
    ],
    bodyHtml:
      '<p>The <strong>OKR weekly check-in</strong> is the heartbeat that keeps quarterly objectives from drifting. It is short, focused, and metric-driven. The goal is not to relive the quarter but to update where each key result stands and clear whatever is in the way.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run this every week between OKR planning sessions. It works best on a fixed day and time so it becomes a reliable ritual rather than a meeting people negotiate around. Some teams fold it into an existing weekly sync, but it deserves its own protected slot.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Keep it tight: the objective owners and the people directly working the key results. Three to eight people keeps the pace fast. This is a working session, not a status broadcast for stakeholders.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Start with a fast win to build momentum, then move straight to the numbers. For each key result, update the current value and say plainly whether you are on, ahead, or behind pace. Refresh confidence, name the blockers, and assign someone to clear each one. End with a single committed action per owner so the week has a clear next step.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Protect the 30-minute box. If a topic needs debate, take it offline.</li>' +
      '<li>Demand a number for every key result, not a narrative.</li>' +
      '<li>Treat a confidence drop as a signal to act, not a confession to punish.</li>' +
      '<li>Close every blocker with an owner and a date.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Letting the check-in become a long status meeting with no decisions.</li>' +
      '<li>Reporting activity instead of movement on the actual metric.</li>' +
      '<li>Ignoring falling confidence until the quarter is already lost.</li>' +
      '<li>Naming blockers but never assigning who resolves them.</li>' +
      '</ul>' +
      '<p>Want this to run itself every week? <a href="/l8">Run it in OrgTP</a> so progress, confidence, and blockers stay live between sessions.</p>',
    downloadMarkdown:
      '# OKR Weekly Check-in Template\n\n' +
      'Purpose: Track key result progress each week, refresh confidence levels, clear blockers, and keep quarterly objectives on pace.\n\n' +
      '- Duration: 30 minutes\n' +
      '- Cadence: Weekly\n' +
      '- Participants: Team and objective owners (3-8 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Quick wins and momentum (5 min)\n' +
      '- [ ] Key result progress update with current metrics (10 min)\n' +
      '- [ ] Confidence rating refresh (5 min)\n' +
      '- [ ] Blockers and help needed (7 min)\n' +
      '- [ ] Commitments for the week (3 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Protect the 30-minute box; take debates offline.\n' +
      '- Require a number for every key result.\n' +
      '- Treat a confidence drop as a signal to act.\n' +
      '- Close every blocker with an owner and a date.\n\n' +
      '## Notes / Decisions\n\n' +
      'Key result updates:\n\n' +
      'Confidence changes:\n\n' +
      'Blockers and owners:\n\n' +
      'Weekly commitments:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/okr-check-in-meeting\n',
  },
  {
    slug: 'quarterly-business-review',
    title: 'Quarterly Business Review (QBR) Template',
    shortName: 'Quarterly Business Review (QBR)',
    description:
      'Use this QBR agenda template to review quarterly performance against goals, analyze metrics, surface risks, and set priorities for the next quarter.',
    category: 'planning',
    methodology: 'General',
    minutes: 90,
    cadence: 'Quarterly',
    participants: 'Leadership team and department heads (5-15 people)',
    keywords: [
      'QBR agenda template',
      'quarterly business review template',
      'QBR meeting agenda',
      'quarterly review meeting template',
      'business review meeting agenda',
      'quarterly performance review template',
      'QBR deck template',
    ],
    steps: [
      { name: 'Executive summary', minutes: 10, text: 'Open with a one-slide view of the quarter: headline results, the single biggest win, and the single biggest miss.' },
      { name: 'Results vs goals', minutes: 20, text: 'Walk each strategic goal and KPI against target, calling out variance and the story behind the numbers.' },
      { name: 'Financial and operational review', minutes: 15, text: 'Review revenue, margin, pipeline, and key operating metrics against plan and prior quarter.' },
      { name: 'Wins, misses, and root causes', minutes: 15, text: 'Discuss what drove the wins and dig into the root cause of any miss rather than just the symptom.' },
      { name: 'Risks and opportunities', minutes: 15, text: 'Surface emerging risks and the few opportunities worth resourcing in the coming quarter.' },
      { name: 'Next-quarter priorities', minutes: 15, text: 'Agree the top priorities and owners for the next quarter and confirm how progress will be measured.' },
    ],
    bodyHtml:
      '<p>The <strong>quarterly business review</strong>, or QBR, is the disciplined pause where a company checks results against intent. It zooms out from the weekly noise to ask one question: did we make the progress we said we would, and what does that mean for the next ninety days?</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run a QBR within the first two weeks of each new quarter, once the prior quarter is fully closed and the numbers are trustworthy. It is also the right forum to reset priorities after a major market shift or a significant change in the plan.</p>' +
      '<h2>Who attends</h2>' +
      '<p>The leadership team plus department heads who own a number. Five to fifteen people is typical. Anyone presenting should bring data, not opinions, and be ready to explain variance rather than narrate slides.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Lead with a tight executive summary so everyone shares context fast. Move through results against goals, then the financial and operational picture, always comparing to target and prior quarter. Spend real time on root causes, not symptoms, then turn forward: name the risks worth watching, the opportunities worth funding, and the handful of priorities that will define the next quarter. Close with owners and measures so the review produces commitments, not just a recap.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Cap the backward-looking portion at half the meeting. The value is in what happens next.</li>' +
      '<li>Insist on variance against target, not raw numbers in isolation.</li>' +
      '<li>Drive every miss to a root cause before moving on.</li>' +
      '<li>Leave with three to five priorities, not fifteen.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Turning the QBR into a slide parade with no decisions.</li>' +
      '<li>Celebrating wins while glossing over misses.</li>' +
      '<li>Reviewing the past without setting clear next-quarter priorities.</li>' +
      '<li>Letting presenters narrate data instead of explaining variance.</li>' +
      '</ul>' +
      '<p>Make your next quarterly review count. <a href="/l8">Run it in OrgTP</a> and keep goals, metrics, and priorities connected quarter over quarter.</p>',
    downloadMarkdown:
      '# Quarterly Business Review (QBR) Template\n\n' +
      'Purpose: Review the past quarter against goals, analyze financial and operational metrics, surface risks, and set clear priorities for the next quarter.\n\n' +
      '- Duration: 90 minutes\n' +
      '- Cadence: Quarterly\n' +
      '- Participants: Leadership team and department heads (5-15 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Executive summary (10 min)\n' +
      '- [ ] Results vs goals and KPIs (20 min)\n' +
      '- [ ] Financial and operational review (15 min)\n' +
      '- [ ] Wins, misses, and root causes (15 min)\n' +
      '- [ ] Risks and opportunities (15 min)\n' +
      '- [ ] Next-quarter priorities and owners (15 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Cap the backward-looking portion at half the meeting.\n' +
      '- Insist on variance against target, not raw numbers.\n' +
      '- Drive every miss to a root cause.\n' +
      '- Leave with 3 to 5 priorities, not 15.\n\n' +
      '## Notes / Decisions\n\n' +
      'Results vs goals:\n\n' +
      'Root causes:\n\n' +
      'Risks and opportunities:\n\n' +
      'Next-quarter priorities and owners:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/quarterly-business-review\n',
  },
  {
    slug: 'board-meeting',
    title: 'Board Meeting Template',
    shortName: 'Board Meeting',
    description:
      'Use this board meeting agenda template to run an efficient governance session: review performance, approve decisions, discuss strategy, and assign actions.',
    category: 'planning',
    methodology: 'General',
    minutes: 150,
    cadence: 'Quarterly',
    participants: 'Board members, CEO, and invited executives (5-12 people)',
    keywords: [
      'board meeting agenda',
      'board meeting template',
      'board meeting agenda template',
      'board of directors meeting agenda',
      'governance meeting template',
      'startup board meeting agenda',
      'board deck template',
    ],
    steps: [
      { name: 'Call to order and approvals', minutes: 10, text: 'Confirm quorum, approve the prior meeting minutes, and adopt the agenda for the session.' },
      { name: 'CEO update', minutes: 25, text: 'CEO presents company performance, headline metrics, and the most important developments since the last meeting.' },
      { name: 'Financial review', minutes: 25, text: 'Review the financial statements, cash position, runway, and budget variance against plan.' },
      { name: 'Strategic discussion', minutes: 45, text: 'Focus deep discussion on one or two strategic topics where the board can genuinely add value.' },
      { name: 'Formal resolutions and votes', minutes: 20, text: 'Present any items requiring board approval, discuss, and record formal votes.' },
      { name: 'Executive session and actions', minutes: 25, text: 'Hold a closed executive session as needed, then confirm action items, owners, and the next meeting date.' },
    ],
    bodyHtml:
      '<p>A <strong>board meeting</strong> is a governance session, not a status update. The board exists to oversee, advise, and approve, so the agenda should protect time for real strategic discussion rather than spending the whole session reading numbers aloud.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Most companies hold a formal board meeting quarterly, with shorter interim calls as needed. Use this template for any scheduled governance session where the board reviews performance, votes on resolutions, and weighs in on direction.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Board members and the CEO are core. Invite executives to present their areas, then excuse them so the board can deliberate. Plan for a short executive session at the end, with management out of the room, for candid governance conversation.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Send the board deck several days ahead so the meeting is for discussion, not first reads. Open with formal approvals, then a crisp CEO update and financial review. Reserve the largest block for one or two strategic topics where the board can add value. Handle formal resolutions with clear votes, hold an executive session if needed, and close by confirming actions and the next date. Keep minutes throughout, since the record matters legally.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Distribute the deck in advance so the room can discuss, not read.</li>' +
      '<li>Protect the strategic block from being eaten by status updates.</li>' +
      '<li>Frame each decision item clearly so votes are clean and recorded.</li>' +
      '<li>Always capture formal minutes and resolutions for the record.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Spending the whole meeting on backward-looking reporting.</li>' +
      '<li>Surprising the board with material news that should have been pre-briefed.</li>' +
      '<li>Skipping the executive session, where the most candid input often happens.</li>' +
      '<li>Ending without recorded resolutions, owners, or a next date.</li>' +
      '</ul>' +
      '<p>Bring structure to your next governance session. <a href="/l8">Run it in OrgTP</a> and keep board materials, decisions, and action items in one trusted place.</p>',
    downloadMarkdown:
      '# Board Meeting Template\n\n' +
      'Purpose: Run an efficient governance session that reviews performance, approves resolutions, focuses board attention on strategy, and records clear actions.\n\n' +
      '- Duration: 150 minutes\n' +
      '- Cadence: Quarterly\n' +
      '- Participants: Board members, CEO, and invited executives (5-12 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Call to order, quorum, and approvals (10 min)\n' +
      '- [ ] CEO update and key metrics (25 min)\n' +
      '- [ ] Financial review, cash, and runway (25 min)\n' +
      '- [ ] Strategic discussion on 1 to 2 topics (45 min)\n' +
      '- [ ] Formal resolutions and votes (20 min)\n' +
      '- [ ] Executive session and action items (25 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Distribute the board deck in advance.\n' +
      '- Protect the strategic block from status creep.\n' +
      '- Frame each decision item clearly for a clean vote.\n' +
      '- Capture formal minutes and resolutions.\n\n' +
      '## Notes / Decisions\n\n' +
      'Approvals and minutes:\n\n' +
      'Strategic discussion:\n\n' +
      'Resolutions and votes:\n\n' +
      'Action items and next meeting date:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/board-meeting\n',
  },
  {
    slug: 'strategic-planning-offsite',
    title: 'Strategic Planning Offsite Template',
    shortName: 'Strategic Planning Offsite',
    description:
      'Use this strategic planning offsite agenda to align leadership on vision, evaluate the landscape, set priorities, and leave with an owned strategic plan.',
    category: 'planning',
    methodology: 'General',
    minutes: 480,
    cadence: 'Annually',
    participants: 'Leadership team (5-12 people)',
    keywords: [
      'strategic planning offsite agenda',
      'strategic planning offsite template',
      'leadership offsite agenda',
      'strategy offsite template',
      'planning retreat agenda',
      'executive offsite template',
      'strategic planning meeting template',
    ],
    steps: [
      { name: 'Opening and context', minutes: 45, text: 'Align on the purpose of the offsite, set ground rules, and review the current state of the business honestly.' },
      { name: 'Vision and mission revisit', minutes: 60, text: 'Reconnect with the long-term vision and mission, and decide whether they still fit the world the company operates in.' },
      { name: 'External landscape review', minutes: 75, text: 'Examine market trends, competitors, customers, and the forces that could reshape the next few years.' },
      { name: 'Strategic options and debate', minutes: 90, text: 'Generate and pressure-test strategic options, debating trade-offs openly before narrowing to a direction.' },
      { name: 'Priorities and resource allocation', minutes: 90, text: 'Translate the chosen direction into a small set of priorities and decide how people and budget get allocated.' },
      { name: 'Ownership and rollout plan', minutes: 60, text: 'Assign owners, define milestones, and agree how the plan will be communicated and tracked after the offsite.' },
    ],
    bodyHtml:
      '<p>A <strong>strategic planning offsite</strong> is the rare block of time when leaders step out of execution and decide where the company is actually going. The agenda below covers a full day, but it scales cleanly to a half day by trimming the landscape and options blocks.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run an offsite annually as the anchor of your planning rhythm, or whenever a major inflection point demands a reset: a new market, a funding round, a leadership change, or a strategy that has stopped working. The point is uninterrupted time away from daily fires.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Keep it to the leadership team, five to twelve people who can both shape and commit to the plan. A skilled facilitator, sometimes external, helps the most senior person participate as a thinker rather than spend the day running the room.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Start by grounding everyone in an honest current state, then revisit vision and mission before scanning the external landscape. Generate strategic options and debate the trade-offs out loud, since unspoken disagreement is what kills plans later. Narrow to a direction, translate it into a short list of priorities with real resource decisions, and finish by assigning owners and a rollout plan. A strategy nobody owns is just a nice document.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Protect thinking time. Resist the urge to fill every minute with slides.</li>' +
      '<li>Force the hard trade-offs into the open rather than letting them simmer.</li>' +
      '<li>Convert conclusions into owned priorities before anyone leaves.</li>' +
      '<li>Plan the rollout, since the team back home was not in the room.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Filling the day with presentations and leaving no time to decide.</li>' +
      '<li>Avoiding real disagreement, so the plan lacks genuine commitment.</li>' +
      '<li>Producing a vision with no priorities or owners attached.</li>' +
      '<li>Never communicating the outcome, so momentum dies on Monday.</li>' +
      '</ul>' +
      '<p>Turn your offsite into action. <a href="/l8">Run it in OrgTP</a> and carry priorities, owners, and milestones straight into your weekly cadence.</p>',
    downloadMarkdown:
      '# Strategic Planning Offsite Template\n\n' +
      'Purpose: Give leadership uninterrupted time to revisit vision, read the landscape, debate strategic options, and leave with owned priorities and a rollout plan.\n\n' +
      '- Duration: 480 minutes (full day; trim to a half day as needed)\n' +
      '- Cadence: Annually (or at major inflection points)\n' +
      '- Participants: Leadership team (5-12 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Opening, ground rules, and current state (45 min)\n' +
      '- [ ] Vision and mission revisit (60 min)\n' +
      '- [ ] External landscape review (75 min)\n' +
      '- [ ] Strategic options and debate (90 min)\n' +
      '- [ ] Priorities and resource allocation (90 min)\n' +
      '- [ ] Ownership and rollout plan (60 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Protect thinking time over slide time.\n' +
      '- Force the hard trade-offs into the open.\n' +
      '- Convert conclusions into owned priorities before leaving.\n' +
      '- Plan the rollout for the team that was not in the room.\n\n' +
      '## Notes / Decisions\n\n' +
      'Current state:\n\n' +
      'Strategic direction:\n\n' +
      'Priorities and resource allocation:\n\n' +
      'Owners, milestones, and rollout:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/strategic-planning-offsite\n',
  },
  {
    slug: 'swot-analysis-workshop',
    title: 'SWOT Analysis Workshop Template',
    shortName: 'SWOT Analysis Workshop',
    description:
      'Use this SWOT workshop template to map strengths, weaknesses, opportunities, and threats, then turn the analysis into prioritized strategic actions.',
    category: 'planning',
    methodology: 'General',
    minutes: 90,
    cadence: 'As needed',
    participants: 'Cross-functional team (5-10 people)',
    keywords: [
      'SWOT workshop template',
      'SWOT analysis template',
      'SWOT analysis workshop agenda',
      'SWOT meeting template',
      'strengths weaknesses opportunities threats template',
      'strategic analysis workshop',
      'SWOT facilitation guide',
    ],
    steps: [
      { name: 'Frame the question', minutes: 10, text: 'Define exactly what the SWOT is about: the whole company, a product, a market, or a decision. A fuzzy scope produces a fuzzy SWOT.' },
      { name: 'Strengths', minutes: 15, text: 'Brainstorm internal advantages: what the team does well, unique assets, and durable capabilities.' },
      { name: 'Weaknesses', minutes: 15, text: 'Name internal gaps honestly: where the team is behind, under-resourced, or exposed.' },
      { name: 'Opportunities', minutes: 15, text: 'Identify external openings: market trends, unmet needs, and shifts the team could exploit.' },
      { name: 'Threats', minutes: 15, text: 'Surface external risks: competitors, market changes, and forces outside the team control.' },
      { name: 'Prioritize and convert to actions', minutes: 20, text: 'Cluster the strongest items, cross-link them, and turn the top few into concrete strategic actions with owners.' },
    ],
    bodyHtml:
      '<p>A <strong>SWOT analysis workshop</strong> gives a team a fast, shared map of where it stands. Strengths and weaknesses look inward; opportunities and threats look outward. The value is not the four-box grid itself but the decisions it drives once the quadrants are full.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run a SWOT when you are entering a planning cycle, evaluating a new product or market, responding to a competitive shift, or onboarding a team into a shared view of reality. It is a flexible, on-demand tool rather than a fixed-cadence ritual.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Pull together a cross-functional group of five to ten people so the analysis sees the business from multiple angles. A homogeneous room produces a one-sided SWOT. Include people close to customers, operations, and the numbers.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Begin by framing the exact question, because a SWOT of everything is a SWOT of nothing. Work the four quadrants in turn, keeping internal and external factors clearly separated. Insist on honesty in the weaknesses box, where teams tend to soften. Then do the part most groups skip: prioritize the strongest items, cross-link them, and convert the top few into concrete actions with owners. That final move is what turns a poster into a plan.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Lock the scope before brainstorming so contributions stay relevant.</li>' +
      '<li>Keep internal factors out of the external boxes and vice versa.</li>' +
      '<li>Create real safety so the weaknesses quadrant is honest.</li>' +
      '<li>Never end on the grid. End on prioritized actions.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Building a long, unprioritized list that no one ever uses.</li>' +
      '<li>Confusing internal weaknesses with external threats.</li>' +
      '<li>Softening weaknesses to protect feelings, which hides real risk.</li>' +
      '<li>Stopping at the grid instead of turning it into action.</li>' +
      '</ul>' +
      '<p>Make your SWOT lead somewhere. <a href="/l8">Run it in OrgTP</a> and convert the analysis into tracked priorities and owners.</p>',
    downloadMarkdown:
      '# SWOT Analysis Workshop Template\n\n' +
      'Purpose: Map strengths, weaknesses, opportunities, and threats with a cross-functional team, then convert the strongest insights into prioritized actions.\n\n' +
      '- Duration: 90 minutes\n' +
      '- Cadence: As needed\n' +
      '- Participants: Cross-functional team (5-10 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Frame the question and lock scope (10 min)\n' +
      '- [ ] Strengths, internal advantages (15 min)\n' +
      '- [ ] Weaknesses, internal gaps (15 min)\n' +
      '- [ ] Opportunities, external openings (15 min)\n' +
      '- [ ] Threats, external risks (15 min)\n' +
      '- [ ] Prioritize and convert to actions (20 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Lock the scope before brainstorming.\n' +
      '- Keep internal and external factors in the right boxes.\n' +
      '- Create safety so weaknesses are honest.\n' +
      '- End on prioritized actions, not the grid.\n\n' +
      '## Notes / Decisions\n\n' +
      'Strengths:\n\n' +
      'Weaknesses:\n\n' +
      'Opportunities:\n\n' +
      'Threats:\n\n' +
      'Prioritized actions and owners:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/swot-analysis-workshop\n',
  },
  {
    slug: 'roadmap-planning-meeting',
    title: 'Product Roadmap Planning Template',
    shortName: 'Product Roadmap Planning',
    description:
      'Use this product roadmap planning template to align on goals, prioritize initiatives, sequence releases, and build a roadmap the whole team can commit to.',
    category: 'planning',
    methodology: 'General',
    minutes: 120,
    cadence: 'Quarterly',
    participants: 'Product, engineering, and design leads (5-12 people)',
    keywords: [
      'product roadmap planning template',
      'roadmap planning meeting agenda',
      'product roadmap template',
      'roadmap planning session',
      'product planning meeting template',
      'roadmap prioritization template',
      'release planning agenda',
    ],
    steps: [
      { name: 'Goals and themes recap', minutes: 15, text: 'Restate product strategy and the outcomes the roadmap must serve so prioritization stays anchored to goals.' },
      { name: 'Review current state', minutes: 15, text: 'Assess what shipped last cycle, what slipped, and the current state of the backlog and tech debt.' },
      { name: 'Surface candidate initiatives', minutes: 20, text: 'Collect candidate initiatives from product, engineering, design, and customer feedback into one visible list.' },
      { name: 'Prioritize against impact and effort', minutes: 30, text: 'Score initiatives on impact and effort, factoring in dependencies and confidence, then rank them.' },
      { name: 'Sequence into the roadmap', minutes: 25, text: 'Place the top initiatives into now, next, and later horizons with realistic capacity assumptions.' },
      { name: 'Confirm owners and risks', minutes: 15, text: 'Assign an owner per initiative, flag the biggest delivery risks, and agree how the roadmap will be reviewed.' },
    ],
    bodyHtml:
      '<p>A <strong>product roadmap planning</strong> meeting turns a pile of ideas into a sequenced, committed plan. It is where strategy meets capacity, and where the team agrees not just what to build but in what order and why.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run roadmap planning each quarter to set the next cycle, with lighter mid-cycle adjustments as reality shifts. Use it whenever priorities have drifted, a major opportunity has appeared, or the team can no longer explain why it is working on what it is working on.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Bring product, engineering, and design leads together, five to twelve people who can speak to value, feasibility, and effort. Roadmaps built by product alone tend to underestimate effort, while engineering-only roadmaps can lose the customer thread. The cross-functional room is the point.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Anchor on goals and themes first, then ground the team in current state so capacity assumptions are honest. Surface candidate initiatives into one visible list, score them on impact and effort, and rank them openly. Sequence the winners into now, next, and later horizons rather than overcommitting the near term. Close with an owner per initiative and a clear-eyed look at the biggest delivery risks. A roadmap without owners is a wish list.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Tie every initiative back to a product goal before it earns a slot.</li>' +
      '<li>Get engineering effort estimates in the room, not after.</li>' +
      '<li>Use horizons like now, next, and later instead of false precision on dates.</li>' +
      '<li>Leave deliberate slack for the unexpected work that always arrives.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Overcommitting the near term and missing every date.</li>' +
      '<li>Prioritizing by loudest voice instead of impact and effort.</li>' +
      '<li>Building the roadmap without engineering, so estimates are fiction.</li>' +
      '<li>Treating the roadmap as fixed and never revisiting it.</li>' +
      '</ul>' +
      '<p>Build a roadmap the team will actually follow. <a href="/l8">Run it in OrgTP</a> and keep initiatives, owners, and horizons aligned to your goals.</p>',
    downloadMarkdown:
      '# Product Roadmap Planning Template\n\n' +
      'Purpose: Align product, engineering, and design on goals, prioritize initiatives by impact and effort, and sequence a roadmap the team can commit to.\n\n' +
      '- Duration: 120 minutes\n' +
      '- Cadence: Quarterly\n' +
      '- Participants: Product, engineering, and design leads (5-12 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Goals and themes recap (15 min)\n' +
      '- [ ] Review current state and backlog (15 min)\n' +
      '- [ ] Surface candidate initiatives (20 min)\n' +
      '- [ ] Prioritize against impact and effort (30 min)\n' +
      '- [ ] Sequence into now, next, later (25 min)\n' +
      '- [ ] Confirm owners and risks (15 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Tie every initiative back to a product goal.\n' +
      '- Get engineering effort estimates in the room.\n' +
      '- Use horizons instead of false date precision.\n' +
      '- Leave slack for unexpected work.\n\n' +
      '## Notes / Decisions\n\n' +
      'Goals and themes:\n\n' +
      'Prioritized initiatives:\n\n' +
      'Roadmap sequence (now / next / later):\n\n' +
      'Owners and risks:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/roadmap-planning-meeting\n',
  },
  {
    slug: 'budget-planning-meeting',
    title: 'Annual Budget Planning Template',
    shortName: 'Annual Budget Planning',
    description:
      'Use this annual budget planning template to set revenue targets, allocate spend across departments, model scenarios, and approve a budget tied to strategy.',
    category: 'planning',
    methodology: 'General',
    minutes: 180,
    cadence: 'Annually',
    participants: 'Finance lead, department heads, and leadership (6-15 people)',
    keywords: [
      'annual budget planning template',
      'budget planning meeting agenda',
      'budget planning template',
      'annual budget meeting template',
      'departmental budget planning',
      'financial planning meeting agenda',
      'budget approval meeting template',
    ],
    steps: [
      { name: 'Strategy and assumptions', minutes: 20, text: 'Connect the budget to next year strategy and agree the core assumptions: growth rate, headcount plan, and macro outlook.' },
      { name: 'Revenue targets', minutes: 30, text: 'Set top-line revenue targets by line of business and stress-test them against pipeline and historical conversion.' },
      { name: 'Departmental requests', minutes: 45, text: 'Each department presents its proposed budget and headcount, tied to the outcomes it will deliver.' },
      { name: 'Trade-offs and allocation', minutes: 40, text: 'Reconcile total requests against available funds and make explicit trade-off decisions across departments.' },
      { name: 'Scenario modeling', minutes: 25, text: 'Model a base, upside, and downside case, and define the triggers that would shift spend between them.' },
      { name: 'Approval and accountability', minutes: 20, text: 'Approve the budget, confirm owners for each line, and set the cadence for tracking against plan.' },
    ],
    bodyHtml:
      '<p>An <strong>annual budget planning</strong> meeting decides how a company spends the year. Done well, the budget is strategy expressed in dollars: every meaningful allocation traces back to a goal, and every department understands the outcomes it owes for its funding.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run this in the quarter before your fiscal year begins, after strategy is set so the budget can fund the plan rather than constrain it. Use the same template for major mid-year reforecasts when conditions change enough to reopen allocations.</p>' +
      '<h2>Who attends</h2>' +
      '<p>The finance lead facilitates, with department heads presenting their requests and leadership making the final trade-offs. Six to fifteen people is typical. Everyone presenting should arrive with numbers tied to outcomes, not just a bigger ask than last year.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Start with strategy and shared assumptions so debates are about priorities, not basic facts. Set revenue targets, then let departments present requests linked to the results they will deliver. The real work is the trade-off block: requests almost always exceed available funds, so leadership must choose explicitly rather than spreading cuts thinly. Model base, upside, and downside scenarios, then approve the budget with named owners and a tracking cadence. A budget nobody revisits drifts within a quarter.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Lock the shared assumptions before any number is debated.</li>' +
      '<li>Require each request to tie spend to a measurable outcome.</li>' +
      '<li>Make trade-offs explicit rather than cutting everyone evenly.</li>' +
      '<li>Always model a downside case and its trigger points.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Building the budget bottom-up with no connection to strategy.</li>' +
      '<li>Approving every request and quietly blowing past the total.</li>' +
      '<li>Planning a single scenario with no downside readiness.</li>' +
      '<li>Setting the budget and never tracking actuals against it.</li>' +
      '</ul>' +
      '<p>Make the budget a living plan. <a href="/l8">Run it in OrgTP</a> and keep allocations, owners, and outcomes connected all year.</p>',
    downloadMarkdown:
      '# Annual Budget Planning Template\n\n' +
      'Purpose: Set revenue targets, allocate spend across departments against strategy, model scenarios, and approve a budget with clear owners and accountability.\n\n' +
      '- Duration: 180 minutes\n' +
      '- Cadence: Annually (plus major reforecasts)\n' +
      '- Participants: Finance lead, department heads, and leadership (6-15 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Strategy and shared assumptions (20 min)\n' +
      '- [ ] Revenue targets by line of business (30 min)\n' +
      '- [ ] Departmental requests and headcount (45 min)\n' +
      '- [ ] Trade-offs and allocation (40 min)\n' +
      '- [ ] Scenario modeling: base, upside, downside (25 min)\n' +
      '- [ ] Approval and accountability (20 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Lock shared assumptions before debating numbers.\n' +
      '- Tie every request to a measurable outcome.\n' +
      '- Make trade-offs explicit, not even cuts.\n' +
      '- Always model a downside case and its triggers.\n\n' +
      '## Notes / Decisions\n\n' +
      'Assumptions:\n\n' +
      'Revenue targets:\n\n' +
      'Allocation and trade-offs:\n\n' +
      'Scenarios, owners, and approval:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/budget-planning-meeting\n',
  },
  {
    slug: 'project-kickoff-meeting',
    title: 'Project Kickoff Meeting Template',
    shortName: 'Project Kickoff Meeting',
    description:
      'Use this project kickoff template to align the team on goals, scope, roles, timeline, and risks so a new project starts with shared understanding and momentum.',
    category: 'planning',
    methodology: 'General',
    minutes: 60,
    cadence: 'As needed',
    participants: 'Project team and key stakeholders (4-12 people)',
    keywords: [
      'project kickoff template',
      'project kickoff meeting agenda',
      'kickoff meeting template',
      'project kickoff agenda template',
      'new project kickoff',
      'project launch meeting template',
      'kickoff meeting checklist',
    ],
    steps: [
      { name: 'Introductions and purpose', minutes: 10, text: 'Introduce the team, clarify why the project exists, and connect it to the larger goal it serves.' },
      { name: 'Goals and success criteria', minutes: 10, text: 'Define what success looks like in concrete, measurable terms so the team shares one definition of done.' },
      { name: 'Scope and out of scope', minutes: 10, text: 'Agree what is in scope and, just as important, what is explicitly out of scope to prevent creep.' },
      { name: 'Roles and responsibilities', minutes: 10, text: 'Clarify who owns what, who decides, and who needs to be consulted or informed.' },
      { name: 'Timeline and milestones', minutes: 10, text: 'Walk the high-level timeline, key milestones, and the first concrete deliverables.' },
      { name: 'Risks, dependencies, and next steps', minutes: 10, text: 'Surface early risks and dependencies, then confirm immediate next steps and the meeting cadence.' },
    ],
    bodyHtml:
      '<p>A <strong>project kickoff meeting</strong> sets the trajectory for everything that follows. A strong kickoff gives the team a shared definition of success, a clear scope, and named owners. A weak one leaves people guessing, and that confusion compounds for the life of the project.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Hold a kickoff at the start of any project significant enough to involve multiple people or span more than a couple of weeks. It is the moment to convert a vague mandate into a shared plan before work begins, not after misalignment surfaces.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Bring the core project team plus the key stakeholders who define success or control resources. Four to twelve people works well. If a critical decision-maker cannot attend, get their input first, because realigning later is far more expensive than waiting a day.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Open with purpose so everyone knows why the project matters, then nail down measurable success criteria. Define scope and, crucially, what is out of scope, since unspoken assumptions become scope creep. Clarify roles so ownership is unambiguous, walk the timeline and first deliverables, and close by surfacing early risks and confirming next steps. The aim is to leave the room with one shared picture, not six private ones.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Write success criteria the whole team would measure the same way.</li>' +
      '<li>State what is out of scope as clearly as what is in.</li>' +
      '<li>Name a single owner for each major workstream.</li>' +
      '<li>End with concrete next steps and a follow-up cadence.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Diving into tasks before agreeing what success even means.</li>' +
      '<li>Leaving scope vague, which invites endless additions.</li>' +
      '<li>Fuzzy ownership, so important work falls between people.</li>' +
      '<li>Ignoring risks at the start, then being surprised by them later.</li>' +
      '</ul>' +
      '<p>Give your next project a clean start. <a href="/l8">Run it in OrgTP</a> and keep goals, roles, and milestones visible from day one.</p>',
    downloadMarkdown:
      '# Project Kickoff Meeting Template\n\n' +
      'Purpose: Align the team and stakeholders on goals, scope, roles, timeline, and risks so a new project starts with shared understanding and momentum.\n\n' +
      '- Duration: 60 minutes\n' +
      '- Cadence: As needed (at project start)\n' +
      '- Participants: Project team and key stakeholders (4-12 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Introductions and purpose (10 min)\n' +
      '- [ ] Goals and success criteria (10 min)\n' +
      '- [ ] Scope and out of scope (10 min)\n' +
      '- [ ] Roles and responsibilities (10 min)\n' +
      '- [ ] Timeline and milestones (10 min)\n' +
      '- [ ] Risks, dependencies, and next steps (10 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Write success criteria everyone measures the same way.\n' +
      '- State what is out of scope as clearly as what is in.\n' +
      '- Name a single owner for each workstream.\n' +
      '- End with concrete next steps and a cadence.\n\n' +
      '## Notes / Decisions\n\n' +
      'Goals and success criteria:\n\n' +
      'Scope and out of scope:\n\n' +
      'Roles and responsibilities:\n\n' +
      'Timeline, risks, and next steps:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/project-kickoff-meeting\n',
  },
  {
    slug: 'annual-strategic-planning',
    title: 'Annual Strategic Planning Template',
    shortName: 'Annual Strategic Planning',
    description:
      'Use this annual strategic planning template to review the year, refresh vision, set annual goals and themes, and cascade priorities into an executable plan.',
    category: 'planning',
    methodology: 'General',
    minutes: 240,
    cadence: 'Annually',
    participants: 'Leadership team and key contributors (6-15 people)',
    keywords: [
      'annual strategic planning template',
      'annual planning meeting agenda',
      'yearly strategic planning template',
      'annual goal setting meeting',
      'strategic planning agenda template',
      'annual planning session',
      'year ahead planning template',
    ],
    steps: [
      { name: 'Year in review', minutes: 30, text: 'Review the past year against goals: what was achieved, what slipped, and the lessons worth carrying forward.' },
      { name: 'Vision and three-year picture', minutes: 30, text: 'Reconnect with the long-term vision and sketch the three-year picture the annual plan must move toward.' },
      { name: 'Market and capability assessment', minutes: 40, text: 'Assess the external market and internal capabilities to ground annual goals in reality.' },
      { name: 'Set annual goals and themes', minutes: 50, text: 'Define a small set of annual goals and the strategic themes that organize the year ahead.' },
      { name: 'Cascade to quarterly priorities', minutes: 50, text: 'Break annual goals into the first quarter of priorities and outline the rough shape of the remaining quarters.' },
      { name: 'Owners, metrics, and rhythm', minutes: 40, text: 'Assign owners and metrics to each annual goal and confirm the planning rhythm that will keep the year on track.' },
    ],
    bodyHtml:
      '<p><strong>Annual strategic planning</strong> sets the destination for the year and the first leg of the route. It is broader than a quarterly plan and more concrete than a vision document. The output is a small set of annual goals, organizing themes, and the quarterly priorities that turn them into work.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run this once a year, late in the current year or at the very start of the new one, so the team enters the year aligned. It pairs naturally with quarterly planning: the annual session sets direction, and each quarter executes a leg of it.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Include the leadership team and key contributors who will own annual goals, six to fifteen people. The group should be wide enough to commit the organization yet small enough to make real decisions. Cascade the detail to teams afterward rather than crowding the room.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Begin with an honest year in review, then reconnect with vision and the three-year picture so annual goals point somewhere. Assess market and capabilities to keep ambition grounded, then set a focused set of annual goals and themes. Cascade those into a concrete first quarter and a rough shape for the rest of the year. Close by assigning owners and metrics and confirming the planning rhythm, because an annual plan with no operating cadence quietly dissolves by spring.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Ground the year in an honest review before looking ahead.</li>' +
      '<li>Keep annual goals few enough that the team can name them.</li>' +
      '<li>Cascade to quarterly priorities so the plan becomes executable.</li>' +
      '<li>Lock the operating rhythm that keeps the plan alive all year.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Setting lofty annual goals with no quarterly execution path.</li>' +
      '<li>Skipping the honest review and repeating last year mistakes.</li>' +
      '<li>Producing a plan that lives in a deck and never in the work.</li>' +
      '<li>Defining no rhythm, so the plan is forgotten within a quarter.</li>' +
      '</ul>' +
      '<p>Turn the year ahead into a plan you can run. <a href="/l8">Run it in OrgTP</a> and connect annual goals to quarterly priorities and weekly execution.</p>',
    downloadMarkdown:
      '# Annual Strategic Planning Template\n\n' +
      'Purpose: Review the year, refresh vision, set a focused set of annual goals and themes, and cascade them into executable quarterly priorities with owners.\n\n' +
      '- Duration: 240 minutes\n' +
      '- Cadence: Annually\n' +
      '- Participants: Leadership team and key contributors (6-15 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Year in review (30 min)\n' +
      '- [ ] Vision and three-year picture (30 min)\n' +
      '- [ ] Market and capability assessment (40 min)\n' +
      '- [ ] Set annual goals and themes (50 min)\n' +
      '- [ ] Cascade to quarterly priorities (50 min)\n' +
      '- [ ] Owners, metrics, and rhythm (40 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Ground the year in an honest review first.\n' +
      '- Keep annual goals few enough to name.\n' +
      '- Cascade to quarterly priorities for execution.\n' +
      '- Lock the operating rhythm that keeps the plan alive.\n\n' +
      '## Notes / Decisions\n\n' +
      'Year in review:\n\n' +
      'Annual goals and themes:\n\n' +
      'Quarterly priorities:\n\n' +
      'Owners, metrics, and rhythm:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/annual-strategic-planning\n',
  },
];
