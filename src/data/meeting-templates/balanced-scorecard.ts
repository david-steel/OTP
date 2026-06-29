// Balanced Scorecard and strategy-review meeting templates for the /templates library.
// AUTHORED content. bodyHtml renders via <%- %>. Byte-stable: no Date.now,
// no randomness. See _types.ts for the shared contract.

import type { MeetingTemplate } from './_types.js';

export const BALANCED_SCORECARD_TEMPLATES: MeetingTemplate[] = [
  {
    slug: 'balanced-scorecard-quarterly-review',
    title: 'Balanced Scorecard Quarterly Strategy Review Template',
    shortName: 'Balanced Scorecard Quarterly Strategy Review',
    description:
      'Use this balanced scorecard quarterly review template to walk all four perspectives, score strategic KPIs, review initiatives, and reset priorities for the quarter.',
    category: 'balanced-scorecard',
    methodology: 'Balanced Scorecard',
    minutes: 120,
    cadence: 'Quarterly',
    participants: 'Leadership team and perspective owners (6-12 people)',
    keywords: [
      'balanced scorecard quarterly review template',
      'balanced scorecard review template',
      'strategy review meeting agenda',
      'kaplan norton scorecard',
      'four perspectives review template',
      'quarterly strategy review template',
      'balanced scorecard KPI review',
      'strategy execution review agenda',
    ],
    steps: [
      { name: 'Strategy and theme recap', minutes: 10, text: 'Restate the strategic destination and the themes the scorecard is built to advance so every measure stays anchored to direction.' },
      { name: 'Financial perspective', minutes: 20, text: 'Review the financial measures: revenue, margin, cash, and cost against target, and discuss the story behind any variance.' },
      { name: 'Customer perspective', minutes: 20, text: 'Walk customer measures such as retention, satisfaction, share, and acquisition, comparing actual results to the targets set.' },
      { name: 'Internal process perspective', minutes: 20, text: 'Review the operational measures that drive customer and financial outcomes, flagging processes that are off pace.' },
      { name: 'Learning and growth perspective', minutes: 15, text: 'Examine the people, capability, and culture measures that underpin every other perspective over the long term.' },
      { name: 'Strategic initiatives review', minutes: 20, text: 'Assess the initiatives funding the strategy, update status, and decide which to accelerate, hold, or stop.' },
      { name: 'Decisions and next-quarter focus', minutes: 15, text: 'Confirm decisions, assign owners, and agree the few measures and initiatives that get the most attention next quarter.' },
    ],
    bodyHtml:
      '<p>The <strong>balanced scorecard quarterly strategy review</strong> is where a leadership team checks whether strategy is actually being executed. The balanced scorecard, developed by Robert Kaplan and David Norton, organizes strategy across four perspectives: financial, customer, internal process, and learning and growth. This meeting walks all four in order so cause and effect stay visible.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run this once a quarter, after the period closes and the numbers are trustworthy. It is the primary forum for reviewing scorecard performance, testing the strategy map assumptions, and deciding where to redirect attention before the next quarter begins.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Bring the leadership team plus the owners of each perspective and major initiative. Six to twelve people keeps the discussion strategic. Everyone presenting should bring measures against target and a view on why, not a narration of dashboards.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Open by reconnecting to the strategy and its themes, then move through the four perspectives in sequence from financial down to learning and growth, since the lower perspectives explain the higher ones. For each measure, compare actual to target and discuss the cause rather than the symptom. Review the strategic initiatives that fund the plan, then close by deciding where to focus next quarter. The goal is a small set of decisions, not a tour of every metric.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Walk the perspectives in order so the cause-and-effect logic stays intact.</li>' +
      '<li>Discuss variance against target, not raw numbers in isolation.</li>' +
      '<li>Tie every off-track measure to an initiative or a decision.</li>' +
      '<li>Leave with a focused set of priorities, not a longer to-do list.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Treating the scorecard as a reporting ritual with no decisions.</li>' +
      '<li>Drowning in lagging financial measures and skipping learning and growth.</li>' +
      '<li>Reviewing measures without revisiting the initiatives meant to move them.</li>' +
      '<li>Leaving without owners for the few things that matter most.</li>' +
      '</ul>' +
      '<p>Make your quarterly strategy review count. <a href="/l8">Run it in OrgTP</a> and keep all four perspectives, KPIs, and initiatives visible quarter over quarter.</p>',
    downloadMarkdown:
      '# Balanced Scorecard Quarterly Strategy Review Template\n\n' +
      'Purpose: Walk the four balanced scorecard perspectives, score strategic KPIs against target, review initiatives, and reset priorities for the coming quarter.\n\n' +
      '- Duration: 120 minutes\n' +
      '- Cadence: Quarterly\n' +
      '- Participants: Leadership team and perspective owners (6-12 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Strategy and theme recap (10 min)\n' +
      '- [ ] Financial perspective review (20 min)\n' +
      '- [ ] Customer perspective review (20 min)\n' +
      '- [ ] Internal process perspective review (20 min)\n' +
      '- [ ] Learning and growth perspective review (15 min)\n' +
      '- [ ] Strategic initiatives review (20 min)\n' +
      '- [ ] Decisions and next-quarter focus (15 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Walk the perspectives in order to keep cause and effect intact.\n' +
      '- Discuss variance against target, not raw numbers.\n' +
      '- Tie every off-track measure to an initiative or decision.\n' +
      '- Leave with a focused set of priorities.\n\n' +
      '## Notes / Decisions\n\n' +
      'Financial perspective:\n\n' +
      'Customer perspective:\n\n' +
      'Internal process perspective:\n\n' +
      'Learning and growth perspective:\n\n' +
      'Initiatives and next-quarter focus:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/balanced-scorecard-quarterly-review\n',
    guideHtml: `<h2>The Ultimate Balanced Scorecard Quarterly Strategy Review Guide</h2>
<p>Setting a corporate strategy is only half the battle - the real challenge lies in execution. Without a structured, recurring mechanism to review progress, even the most brilliant strategic plans end up as forgotten documents. That is why the <strong>Balanced Scorecard Quarterly Strategy Review</strong> is the cornerstone of high-performing organizations.</p>
<p>By evaluating your business across four distinct perspectives - Financial, Customer, Internal Processes, and Learning &amp; Growth - this framework ensures your leadership team maintains a holistic, balanced view of organizational health.</p>
<p>This comprehensive guide provides a battle-tested <strong>Balanced Scorecard Quarterly Review Template</strong> and a step-by-step agenda to help your leadership team track performance, analyze variances, and drive strategic alignment.</p>

<h2>What is a Balanced Scorecard Quarterly Strategy Review?</h2>
<p>A Balanced Scorecard Quarterly Strategy Review is a strategic, 120-minute meeting held at the end of each quarter.</p>
<p>The primary objective of the meeting is to evaluate the company's performance against its strategic objectives, analyze key performance indicators (KPIs), and review the status of strategic initiatives. Unlike tactical monthly reviews, the quarterly review is designed to assess <strong>macro-level strategy execution and long-term organizational alignment</strong>.</p>
<h3>The Four Perspectives of the Balanced Scorecard:</h3>
<ul>
<li><strong>Financial Perspective:</strong> How do we look to our shareholders? (e.g., revenue growth, profit margins, cash flow).</li>
<li><strong>Customer Perspective:</strong> How do our customers see us? (e.g., customer retention, Net Promoter Score, acquisition cost).</li>
<li><strong>Internal Business Processes Perspective:</strong> What must we excel at? (e.g., operational efficiency, quality metrics, cycle times).</li>
<li><strong>Learning &amp; Growth Perspective:</strong> How can we continue to improve and create value? (e.g., employee retention, skill development, technology adoption).</li>
</ul>

<h2>The Standard 120-Minute Quarterly Strategy Review Agenda</h2>
<p>To cover all four perspectives, analyze variances, and align on strategic initiatives without rushing, we recommend a structured <strong>120-minute time-boxed agenda</strong>:</p>
<table class="td-guide-table">
<thead><tr><th>Time</th><th>Agenda Item</th><th>Objective</th></tr></thead>
<tbody>
<tr><td><strong>00:00 - 00:10</strong></td><td><strong>Executive Summary &amp; Context</strong></td><td>Welcome the team, review the agenda, and re-align on the overarching corporate vision and annual goals.</td></tr>
<tr><td><strong>00:10 - 00:30</strong></td><td><strong>Financial Perspective Review</strong></td><td>Review financial KPIs, analyze revenue and margin variances, and discuss financial health.</td></tr>
<tr><td><strong>00:30 - 00:50</strong></td><td><strong>Customer Perspective Review</strong></td><td>Evaluate customer satisfaction, retention metrics, and market share trends.</td></tr>
<tr><td><strong>00:50 - 01:10</strong></td><td><strong>Internal Processes Review</strong></td><td>Review operational efficiency, quality metrics, and key process bottlenecks.</td></tr>
<tr><td><strong>01:10 - 01:30</strong></td><td><strong>Learning &amp; Growth Review</strong></td><td>Assess employee engagement, training progress, and organizational capability development.</td></tr>
<tr><td><strong>01:30 - 01:50</strong></td><td><strong>Strategic Initiatives Triage</strong></td><td>Review the status of major strategic projects. Identify off-track initiatives and reallocate resources.</td></tr>
<tr><td><strong>01:50 - 02:00</strong></td><td><strong>Action Items &amp; Wrap-Up</strong></td><td>Summarize key decisions, assign owners to new action items, and officially close the meeting.</td></tr>
</tbody>
</table>

<h2>Best Practices for a High-Impact Strategy Review</h2>
<h3>1. Focus on the "Why" Behind the Data</h3>
<p>Do not let the meeting become a boring reading of charts. If a metric is green, celebrate briefly and move on. If a metric is red or yellow, focus the discussion on <strong>variance analysis</strong>: <em>Why did we miss the target? What operational bottlenecks caused this variance? What is our concrete plan to get back on track?</em></p>
<h3>2. Maintain a Balanced View</h3>
<p>It is common for leadership teams to spend 80% of their time discussing financial metrics. However, financial results are lagging indicators - they tell you what happened in the past. To predict future success, you must spend equal time discussing leading indicators in the Customer, Internal Process, and Learning &amp; Growth perspectives.</p>
<h3>3. Link Initiatives to Objectives</h3>
<p>Every strategic initiative (project) on your scorecard must be directly linked to a strategic objective. If you are spending time and budget on a project that does not directly move the needle on one of your scorecard objectives, question why that project exists.</p>

<h2>Frequently Asked Questions (FAQs)</h2>
<h3>What is a Balanced Scorecard?</h3>
<p>A Balanced Scorecard is a strategic management performance metric used to identify, improve, and control a business's various functions and resulting outcomes. It measures performance across four perspectives: Financial, Customer, Internal Processes, and Learning &amp; Growth.</p>
<h3>How often should you run a Balanced Scorecard review?</h3>
<p>We recommend running a comprehensive Balanced Scorecard review <strong>quarterly</strong> for strategic alignment and initiative planning. Additionally, teams should run a lighter, 60-minute <strong>monthly</strong> review to track key metrics and spot off-track trends early.</p>
<h3>What is the difference between a KPI and a Balanced Scorecard?</h3>
<p>A KPI (Key Performance Indicator) is a single metric used to measure performance. A Balanced Scorecard is a comprehensive strategic management framework that organizes KPIs into four balanced perspectives to ensure they align with the company's long-term strategy.</p>
<h3>Who should attend the Quarterly Strategy Review?</h3>
<p>The quarterly review should be attended by the executive leadership team, departmental heads, and the owners of the strategic objectives and initiatives represented on the scorecard.</p>`,
    // FAQPage JSON-LD source. Keep verbatim with the visible FAQ in guideHtml above.
    faq: [
      {
        q: 'What is a Balanced Scorecard?',
        a: 'A Balanced Scorecard is a strategic management performance metric used to identify, improve, and control a business\'s various functions and resulting outcomes. It measures performance across four perspectives: Financial, Customer, Internal Processes, and Learning & Growth.',
      },
      {
        q: 'How often should you run a Balanced Scorecard review?',
        a: 'We recommend running a comprehensive Balanced Scorecard review quarterly for strategic alignment and initiative planning. Additionally, teams should run a lighter, 60-minute monthly review to track key metrics and spot off-track trends early.',
      },
      {
        q: 'What is the difference between a KPI and a Balanced Scorecard?',
        a: 'A KPI (Key Performance Indicator) is a single metric used to measure performance. A Balanced Scorecard is a comprehensive strategic management framework that organizes KPIs into four balanced perspectives to ensure they align with the company\'s long-term strategy.',
      },
      {
        q: 'Who should attend the Quarterly Strategy Review?',
        a: 'The quarterly review should be attended by the executive leadership team, departmental heads, and the owners of the strategic objectives and initiatives represented on the scorecard.',
      },
    ],
  },
  {
    slug: 'balanced-scorecard-monthly-review',
    title: 'Balanced Scorecard Monthly Review Template',
    shortName: 'Balanced Scorecard Monthly Review',
    description:
      'Use this balanced scorecard monthly review template to track KPIs across the four perspectives, flag off-track measures early, and keep strategy on pace.',
    category: 'balanced-scorecard',
    methodology: 'Balanced Scorecard',
    minutes: 60,
    cadence: 'Monthly',
    participants: 'Leadership team and KPI owners (5-10 people)',
    keywords: [
      'balanced scorecard monthly review template',
      'monthly scorecard meeting agenda',
      'balanced scorecard KPI review',
      'kaplan norton scorecard',
      'monthly strategy review template',
      'four perspectives scorecard template',
      'strategy review meeting agenda',
    ],
    steps: [
      { name: 'Scorecard snapshot', minutes: 5, text: 'Open with a one-page view of the scorecard, highlighting which measures are green, yellow, and red this month.' },
      { name: 'Financial measures', minutes: 12, text: 'Review the financial KPIs against monthly target and the year-to-date trend, flagging any drift early.' },
      { name: 'Customer measures', minutes: 12, text: 'Walk the customer KPIs, comparing actual to target and noting any change in trajectory from last month.' },
      { name: 'Internal process measures', minutes: 12, text: 'Review operational KPIs that drive downstream results, calling out processes that are slipping.' },
      { name: 'Learning and growth measures', minutes: 8, text: 'Check the people and capability KPIs that sustain the rest of the scorecard over time.' },
      { name: 'Off-track measures and actions', minutes: 11, text: 'For every red or trending-red measure, agree an owner and a corrective action before the next month.' },
    ],
    bodyHtml:
      '<p>The <strong>balanced scorecard monthly review</strong> is the lighter, faster cousin of the quarterly strategy review. It keeps the four perspectives in front of the leadership team every month so problems surface while there is still time to act, rather than waiting a full quarter to discover the strategy has drifted.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run it monthly, soon after the month closes, between the deeper quarterly reviews. The balanced scorecard, created by Kaplan and Norton, links measures across four perspectives, and a monthly cadence keeps those links alive instead of letting them go stale between quarters.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Keep it to the leadership team and the people who own the key KPIs, five to ten people. This is a working check-in, not a stakeholder presentation, so the room should be people who can act on what the numbers show.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Start with a snapshot so everyone sees the red, yellow, and green status at a glance, then move quickly through the four perspectives. The point is not to relive every measure but to spot what changed and what is trending wrong. Spend the real time at the end on off-track measures, assigning an owner and a corrective action to each. A monthly review that ends without actions is just a status report.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Lead with status colors so attention goes straight to what is off track.</li>' +
      '<li>Keep on-track measures brief and spend time where it is needed.</li>' +
      '<li>Watch the trend, not just this month, so slow slides get caught.</li>' +
      '<li>Close every red measure with an owner and a corrective action.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Reading every measure aloud and running out of time for decisions.</li>' +
      '<li>Reacting to a single bad month instead of reading the trend.</li>' +
      '<li>Focusing only on financials and ignoring the leading perspectives.</li>' +
      '<li>Noting red measures but never assigning corrective action.</li>' +
      '</ul>' +
      '<p>Keep strategy on pace every month. <a href="/l8">Run it in OrgTP</a> and let the scorecard status, trends, and owners stay live between reviews.</p>',
    downloadMarkdown:
      '# Balanced Scorecard Monthly Review Template\n\n' +
      'Purpose: Track KPIs across the four perspectives each month, catch off-track measures early, and assign corrective actions to keep strategy on pace.\n\n' +
      '- Duration: 60 minutes\n' +
      '- Cadence: Monthly\n' +
      '- Participants: Leadership team and KPI owners (5-10 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Scorecard snapshot, red / yellow / green (5 min)\n' +
      '- [ ] Financial measures (12 min)\n' +
      '- [ ] Customer measures (12 min)\n' +
      '- [ ] Internal process measures (12 min)\n' +
      '- [ ] Learning and growth measures (8 min)\n' +
      '- [ ] Off-track measures and corrective actions (11 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Lead with status colors so attention goes to what is off track.\n' +
      '- Keep on-track measures brief.\n' +
      '- Watch the trend, not just this month.\n' +
      '- Close every red measure with an owner and an action.\n\n' +
      '## Notes / Decisions\n\n' +
      'Financial measures:\n\n' +
      'Customer measures:\n\n' +
      'Internal process measures:\n\n' +
      'Learning and growth measures:\n\n' +
      'Off-track measures, owners, and actions:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/balanced-scorecard-monthly-review\n',
    guideHtml: `<h2>The Ultimate Balanced Scorecard Monthly Review Template &amp; Guide</h2>
<p>While quarterly strategy reviews are essential for high-level alignment and initiative planning, ninety days is too long to wait to spot operational drift. To ensure your strategy is executed successfully, your leadership team needs a monthly operational checkpoint. That is where the Balanced Scorecard Monthly Review comes in.</p>
<p>The monthly review is a fast-paced, operational meeting designed to track key performance indicators (KPIs), identify off-track measures, and assign immediate corrective actions before minor variances turn into major strategic failures.</p>
<p>This comprehensive guide provides a battle-tested Balanced Scorecard Monthly Review Template and a step-by-step agenda to help your team maintain operational momentum and keep your strategy on track.</p>
<h2>What is a Balanced Scorecard Monthly Review?</h2>
<p>A Balanced Scorecard Monthly Review is a structured, 60-minute operational meeting held mid-quarter.</p>
<p>Unlike the quarterly review - which focuses on long-term initiatives and strategic pivots - the monthly review is strictly focused on KPI tracking and variance management. It uses the four classic perspectives of the Balanced Scorecard (Financial, Customer, Internal Process, and Learning &amp; Growth) to evaluate the company's current operational health.</p>
<h3>The Core Objectives of the Monthly Review:</h3>
<ul>
<li>Track KPI Trends: Review the Red/Yellow/Green status of every measure on your scorecard.</li>
<li>Spot Early Warning Signs: Identify lagging indicators and operational bottlenecks before they impact quarterly results.</li>
<li>Assign Corrective Actions: Create short-term, 30-day action plans to get off-track measures back to Green.</li>
<li>Maintain Accountability: Ensure every KPI owner is actively monitoring and managing their assigned metrics.</li>
</ul>
<h2>The Standard 60-Minute Monthly Review Agenda</h2>
<p>To keep the meeting highly operational and prevent it from devolving into a long-term strategic debate, we recommend a strict time-boxed 60-minute agenda:</p>
<table class="td-guide-table">
<thead><tr><th>Time</th><th>Agenda Item</th><th>Objective</th></tr></thead>
<tbody>
<tr><td><strong>00:00 - 00:05</strong></td><td><strong>Scorecard Snapshot</strong></td><td>Quickly review the overall scorecard health. Note the percentage of measures currently sitting at Green, Yellow, and Red.</td></tr>
<tr><td><strong>00:05 - 00:17</strong></td><td><strong>Financial Measures Review</strong></td><td>Review monthly financial KPIs (e.g., cash flow, revenue vs. budget, gross margin).</td></tr>
<tr><td><strong>00:17 - 00:29</strong></td><td><strong>Customer Measures Review</strong></td><td>Evaluate customer satisfaction, support ticket volume, and monthly retention rates.</td></tr>
<tr><td><strong>00:29 - 00:41</strong></td><td><strong>Internal Process Measures Review</strong></td><td>Review operational efficiency, product quality, and delivery cycle times.</td></tr>
<tr><td><strong>00:41 - 00:49</strong></td><td><strong>Learning &amp; Growth Measures Review</strong></td><td>Check in on employee retention, training completion rates, and key hiring pipelines.</td></tr>
<tr><td><strong>00:49 - 01:00</strong></td><td><strong>Off-Track Triage &amp; Actions</strong></td><td>Focus 100% of the remaining time on Red or trending-Red measures. Assign clear owners and 30-day corrective actions.</td></tr>
</tbody>
</table>
<h2>The Red, Yellow, Green (RYG) Status Framework</h2>
<p>To run an efficient monthly review, your scorecard must use a clear, objective RYG status framework to categorize performance:</p>
<ul>
<li><strong>Green (On Track):</strong> The metric is meeting or exceeding the monthly target. No action required.</li>
<li><strong>Yellow (At Risk):</strong> The metric is slightly below target but within an acceptable variance threshold (typically within 5-10%). This requires close monitoring and potential minor adjustments.</li>
<li><strong>Red (Off Track):</strong> The metric is significantly below target and outside the acceptable variance threshold. This requires immediate triage, a root-cause analysis, and a formal corrective action plan.</li>
</ul>
<h2>Best Practices for an Efficient Monthly Review</h2>
<h3>1. Pre-Populate the Scorecard</h3>
<p>Never waste meeting time entering data or updating charts. Every KPI owner must update their metrics and assign their RYG statuses at least 24 hours before the meeting. The meeting should start with a fully populated, color-coded scorecard.</p>
<h3>2. Triage by Exception</h3>
<p>Do not spend time discussing Green metrics. If a metric is Green, the owner simply says "Green" and you move to the next item. Focus 90% of your discussion and energy on the Red and Yellow metrics that require active problem-solving and resource allocation.</p>
<h3>3. Keep Corrective Actions Under 30 Days</h3>
<p>The action items generated during a monthly review should not be massive, multi-month projects. Instead, they should be short-term, tactical interventions designed to get a specific metric back on track within the next 30 days (e.g., "Run a targeted email campaign to clear excess inventory" or "Reallocate two support reps to clear the ticket backlog").</p>
<h2>Frequently Asked Questions (FAQs)</h2>
<h3>What is the difference between a monthly and quarterly Balanced Scorecard review?</h3>
<p>A monthly review is operational and tactical, focusing on tracking monthly KPIs, spotting variances, and assigning short-term (30-day) corrective actions. A quarterly review is strategic, focusing on long-term initiatives, budget allocations, and potential pivots in the overall business strategy.</p>
<h3>How do you define variance thresholds for RYG status?</h3>
<p>Variance thresholds should be defined objectively for each metric. For example, if your monthly sales target is $100,000, Green might be $100,000+, Yellow might be $90,000 to $99,999 (within 10%), and Red would be anything below $90,000.</p>
<h3>Who owns the KPIs on a Balanced Scorecard?</h3>
<p>Every single KPI on your scorecard must have a single, named owner (typically a departmental leader or manager). If a KPI is owned by "the team" or "the department," accountability is diluted and the metric is highly likely to slip.</p>
<h3>What happens if a metric stays Red for multiple months?</h3>
<p>If a metric remains Red for two or more consecutive months despite corrective actions, it indicates a systemic issue. This should be escalated to a deep-dive problem-solving session (such as an IDS meeting) or flagged as a major topic for the upcoming Quarterly Strategy Review.</p>`,
    faq: [
      {
            "q": "What is the difference between a monthly and quarterly Balanced Scorecard review?",
            "a": "A monthly review is operational and tactical, focusing on tracking monthly KPIs, spotting variances, and assigning short-term (30-day) corrective actions. A quarterly review is strategic, focusing on long-term initiatives, budget allocations, and potential pivots in the overall business strategy."
      },
      {
            "q": "How do you define variance thresholds for RYG status?",
            "a": "Variance thresholds should be defined objectively for each metric. For example, if your monthly sales target is $100,000, Green might be $100,000+, Yellow might be $90,000 to $99,999 (within 10%), and Red would be anything below $90,000."
      },
      {
            "q": "Who owns the KPIs on a Balanced Scorecard?",
            "a": "Every single KPI on your scorecard must have a single, named owner (typically a departmental leader or manager). If a KPI is owned by \"the team\" or \"the department,\" accountability is diluted and the metric is highly likely to slip."
      },
      {
            "q": "What happens if a metric stays Red for multiple months?",
            "a": "If a metric remains Red for two or more consecutive months despite corrective actions, it indicates a systemic issue. This should be escalated to a deep-dive problem-solving session (such as an IDS meeting) or flagged as a major topic for the upcoming Quarterly Strategy Review."
      }
],
  },
  {
    slug: 'strategy-map-workshop',
    title: 'Strategy Map Workshop Template',
    shortName: 'Strategy Map Workshop',
    description:
      'Use this strategy map workshop template to link objectives across the four balanced scorecard perspectives into a clear cause-and-effect map of your strategy.',
    category: 'balanced-scorecard',
    methodology: 'Balanced Scorecard',
    minutes: 180,
    cadence: 'Annually',
    participants: 'Leadership team and strategy owners (6-12 people)',
    keywords: [
      'strategy map workshop',
      'strategy map template',
      'balanced scorecard strategy map',
      'kaplan norton strategy map',
      'strategy mapping workshop agenda',
      'four perspectives strategy map',
      'strategy map facilitation guide',
    ],
    steps: [
      { name: 'Frame the strategy', minutes: 20, text: 'Restate the vision and the core value proposition so the map has a clear strategy to express, not a list of activities.' },
      { name: 'Financial objectives', minutes: 25, text: 'Define the top financial objectives the strategy must deliver, such as growth and productivity outcomes.' },
      { name: 'Customer objectives', minutes: 30, text: 'Articulate the customer objectives and value proposition that produce the financial results.' },
      { name: 'Internal process objectives', minutes: 35, text: 'Identify the handful of internal processes the company must excel at to deliver the customer promise.' },
      { name: 'Learning and growth objectives', minutes: 25, text: 'Define the people, systems, and culture objectives that enable the critical internal processes.' },
      { name: 'Draw the cause-and-effect links', minutes: 30, text: 'Connect objectives bottom-up with cause-and-effect arrows and pressure-test whether each link actually holds.' },
      { name: 'Validate and assign owners', minutes: 15, text: 'Review the full map for coherence, trim weak objectives, and assign an owner to each strategic objective.' },
    ],
    bodyHtml:
      '<p>A <strong>strategy map workshop</strong> produces the visual backbone of a balanced scorecard. The strategy map, introduced by Kaplan and Norton, is a one-page diagram that links objectives across the four perspectives with cause-and-effect arrows, showing how learning and growth fuels internal processes, which deliver the customer promise, which produces financial results.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run this workshop when you are building a scorecard for the first time, after a significant strategy shift, or during annual planning when the existing map no longer reflects reality. The map should be built before the measures, because measures without a map are just a dashboard.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Bring the leadership team and the owners who will be accountable for strategic objectives, six to twelve people. The room needs people who understand customers, operations, and capabilities, since the map only works if the cause-and-effect logic survives scrutiny from every angle.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Start by framing the strategy and value proposition so the map expresses a choice, not a wish list. Define objectives perspective by perspective, working from financial down to learning and growth, then connect them bottom-up with cause-and-effect arrows. The critical move is testing each link: does this internal process really drive that customer outcome? Trim objectives that do not connect, validate the whole map for coherence, and assign an owner to each one before leaving.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Build the map from a real strategic choice, not a generic objective list.</li>' +
      '<li>Keep objectives few per perspective so the map stays readable.</li>' +
      '<li>Test every cause-and-effect link out loud rather than assuming it.</li>' +
      '<li>Assign an owner to each objective before the workshop ends.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Listing dozens of objectives so the map becomes unreadable.</li>' +
      '<li>Drawing links that look logical but have no real evidence.</li>' +
      '<li>Skipping the value proposition, so the map lacks a clear strategy.</li>' +
      '<li>Building the map and never connecting it to measures and initiatives.</li>' +
      '</ul>' +
      '<p>Give your scorecard a backbone. <a href="/l8">Run it in OrgTP</a> and keep your strategy map, objectives, and owners connected to the work.</p>',
    downloadMarkdown:
      '# Strategy Map Workshop Template\n\n' +
      'Purpose: Link strategic objectives across the four balanced scorecard perspectives into a coherent cause-and-effect map of how the strategy creates value.\n\n' +
      '- Duration: 180 minutes\n' +
      '- Cadence: Annually (or after a major strategy shift)\n' +
      '- Participants: Leadership team and strategy owners (6-12 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Frame the strategy and value proposition (20 min)\n' +
      '- [ ] Financial objectives (25 min)\n' +
      '- [ ] Customer objectives (30 min)\n' +
      '- [ ] Internal process objectives (35 min)\n' +
      '- [ ] Learning and growth objectives (25 min)\n' +
      '- [ ] Draw the cause-and-effect links (30 min)\n' +
      '- [ ] Validate and assign owners (15 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Build the map from a real strategic choice.\n' +
      '- Keep objectives few per perspective.\n' +
      '- Test every cause-and-effect link out loud.\n' +
      '- Assign an owner to each objective.\n\n' +
      '## Notes / Decisions\n\n' +
      'Financial objectives:\n\n' +
      'Customer objectives:\n\n' +
      'Internal process objectives:\n\n' +
      'Learning and growth objectives:\n\n' +
      'Cause-and-effect links and owners:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/strategy-map-workshop\n',
  },
  {
    slug: 'bsc-kpi-review',
    title: 'Balanced Scorecard KPI Review Template',
    shortName: 'Balanced Scorecard KPI Review',
    description:
      'Use this balanced scorecard KPI review template to validate measures and targets across all four perspectives and keep your scorecard metrics meaningful.',
    category: 'balanced-scorecard',
    methodology: 'Balanced Scorecard',
    minutes: 90,
    cadence: 'Quarterly',
    participants: 'KPI owners and strategy team (5-10 people)',
    keywords: [
      'balanced scorecard KPI review',
      'scorecard KPI review template',
      'KPI review meeting agenda',
      'balanced scorecard metrics template',
      'kaplan norton scorecard',
      'strategic KPI review template',
      'four perspectives KPI review',
    ],
    steps: [
      { name: 'Purpose and scope', minutes: 10, text: 'Clarify that this review checks the measures themselves, not performance, so the conversation stays on metric quality.' },
      { name: 'Financial KPIs', minutes: 15, text: 'Examine each financial measure: is it still the right indicator, is the target right, and is the data reliable?' },
      { name: 'Customer KPIs', minutes: 15, text: 'Review customer measures for relevance and integrity, retiring vanity metrics and confirming targets reflect strategy.' },
      { name: 'Internal process KPIs', minutes: 15, text: 'Check process measures, ensuring each is a genuine leading indicator rather than an easy-to-collect number.' },
      { name: 'Learning and growth KPIs', minutes: 15, text: 'Validate people and capability measures, which are often the weakest and most neglected on the scorecard.' },
      { name: 'Gaps, retirements, and additions', minutes: 20, text: 'Decide which measures to keep, retire, or add, and confirm owners and data sources for every measure that stays.' },
    ],
    bodyHtml:
      '<p>A <strong>balanced scorecard KPI review</strong> is a periodic audit of the measures themselves, not of performance against them. Over time scorecards accumulate stale metrics, vanity numbers, and targets that no longer reflect strategy. This review keeps the scorecard honest so the data the leadership team relies on stays meaningful.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run this quarterly or at least twice a year, separate from your performance reviews. It pairs well with a strategy refresh: when objectives change, the measures that prove them often need to change too. The balanced scorecard, from Kaplan and Norton, is only as good as the measures chosen for each perspective.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Bring the KPI owners and the strategy or analytics people who maintain the data, five to ten people. This is a craft session about measurement quality, so include whoever actually pulls and reports the numbers, not just the executives who read them.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Set the frame clearly: this is about whether each measure is the right one, not whether the team hit it. Work through the four perspectives, asking three questions of every KPI: is it still the right indicator of the objective, is the target calibrated, and is the data reliable. Retire vanity metrics without mercy and pay extra attention to learning and growth, which teams chronically under-measure. Close by confirming the final measure set, its owners, and its data sources.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Keep the conversation on metric quality, not on hitting targets.</li>' +
      '<li>Demand that each KPI ties clearly to a strategic objective.</li>' +
      '<li>Retire vanity measures rather than carrying them forever.</li>' +
      '<li>Confirm a data source and owner for every measure that stays.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Measuring what is easy to collect instead of what matters.</li>' +
      '<li>Never retiring measures, so the scorecard bloats over time.</li>' +
      '<li>Letting targets go stale as the strategy moves on.</li>' +
      '<li>Ignoring data integrity until a number is publicly wrong.</li>' +
      '</ul>' +
      '<p>Keep your scorecard measures sharp. <a href="/l8">Run it in OrgTP</a> and keep KPIs, targets, owners, and sources documented in one place.</p>',
    downloadMarkdown:
      '# Balanced Scorecard KPI Review Template\n\n' +
      'Purpose: Audit the measures and targets across all four perspectives, retire vanity metrics, and confirm owners and data sources so the scorecard stays meaningful.\n\n' +
      '- Duration: 90 minutes\n' +
      '- Cadence: Quarterly (or twice a year)\n' +
      '- Participants: KPI owners and strategy team (5-10 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Purpose and scope, metric quality not performance (10 min)\n' +
      '- [ ] Financial KPIs (15 min)\n' +
      '- [ ] Customer KPIs (15 min)\n' +
      '- [ ] Internal process KPIs (15 min)\n' +
      '- [ ] Learning and growth KPIs (15 min)\n' +
      '- [ ] Gaps, retirements, and additions (20 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Keep the conversation on metric quality, not targets.\n' +
      '- Require each KPI to tie to a strategic objective.\n' +
      '- Retire vanity measures rather than carrying them forever.\n' +
      '- Confirm a data source and owner for every measure that stays.\n\n' +
      '## Notes / Decisions\n\n' +
      'Financial KPIs:\n\n' +
      'Customer KPIs:\n\n' +
      'Internal process KPIs:\n\n' +
      'Learning and growth KPIs:\n\n' +
      'Retirements, additions, owners, and sources:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/bsc-kpi-review\n',
  },
  {
    slug: 'bsc-annual-planning',
    title: 'Balanced Scorecard Annual Planning Template',
    shortName: 'Balanced Scorecard Annual Planning',
    description:
      'Use this balanced scorecard annual planning template to refresh the strategy map, set annual targets across four perspectives, and fund the right initiatives.',
    category: 'balanced-scorecard',
    methodology: 'Balanced Scorecard',
    minutes: 240,
    cadence: 'Annually',
    participants: 'Leadership team and perspective owners (6-15 people)',
    keywords: [
      'balanced scorecard annual planning template',
      'balanced scorecard planning template',
      'annual strategy review template',
      'kaplan norton scorecard',
      'strategy map and scorecard workshop',
      'annual scorecard target setting',
      'balanced scorecard initiatives template',
    ],
    steps: [
      { name: 'Year in review by perspective', minutes: 40, text: 'Review last year results across all four perspectives, capturing what worked, what missed, and the lessons to carry forward.' },
      { name: 'Refresh the strategy map', minutes: 45, text: 'Revisit the strategy map, confirming or adjusting objectives and cause-and-effect links to match the current strategy.' },
      { name: 'Set annual targets', minutes: 50, text: 'Set the coming year targets for each measure, balancing ambition with realism across all four perspectives.' },
      { name: 'Prioritize strategic initiatives', minutes: 45, text: 'Decide which initiatives will fund the strategy, ranking them by impact on the objectives they support.' },
      { name: 'Resource and fund initiatives', minutes: 35, text: 'Allocate budget and people to the chosen initiatives and resolve trade-offs where requests exceed capacity.' },
      { name: 'Owners, cadence, and commitment', minutes: 25, text: 'Assign owners to objectives and initiatives and lock the review cadence that keeps the scorecard alive all year.' },
    ],
    bodyHtml:
      '<p><strong>Balanced scorecard annual planning</strong> resets the whole scorecard for the year ahead. It is broader than a quarterly review: the strategy map is refreshed, annual targets are set across all four perspectives, and the initiatives that fund the strategy are chosen and resourced. The balanced scorecard, from Kaplan and Norton, turns this into one connected plan rather than four separate ones.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run this once a year, late in the current year or at the start of the new one, so the organization enters the year with a fresh, funded scorecard. It is the anchor session that the quarterly reviews then execute against, leg by leg.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Include the leadership team and the owners of each perspective and major initiative, six to fifteen people. The group must be senior enough to set targets and allocate resources, and broad enough that the whole scorecard is represented in the room.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Begin with an honest review of the past year across all four perspectives, then refresh the strategy map so this year objectives reflect reality. Set annual targets that are ambitious but believable, then choose the strategic initiatives that will move those targets and rank them by impact. The hard part is resourcing: initiatives almost always exceed capacity, so make the trade-offs explicit. Finish by assigning owners and locking the review cadence, because an annual scorecard with no operating rhythm quietly dissolves.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Ground the year in an honest review before setting new targets.</li>' +
      '<li>Refresh the strategy map first so targets follow objectives.</li>' +
      '<li>Fund a focused set of initiatives rather than starving many.</li>' +
      '<li>Lock the quarterly review cadence before anyone leaves.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Setting targets without refreshing the underlying strategy map.</li>' +
      '<li>Approving every initiative and under-resourcing all of them.</li>' +
      '<li>Building a scorecard that lives in a deck, not in the work.</li>' +
      '<li>Defining no review rhythm, so the plan is forgotten by spring.</li>' +
      '</ul>' +
      '<p>Set the year on one connected scorecard. <a href="/l8">Run it in OrgTP</a> and link your strategy map, targets, and initiatives to weekly execution.</p>',
    downloadMarkdown:
      '# Balanced Scorecard Annual Planning Template\n\n' +
      'Purpose: Refresh the strategy map, set annual targets across all four perspectives, choose and fund strategic initiatives, and lock the review cadence for the year.\n\n' +
      '- Duration: 240 minutes\n' +
      '- Cadence: Annually\n' +
      '- Participants: Leadership team and perspective owners (6-15 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Year in review by perspective (40 min)\n' +
      '- [ ] Refresh the strategy map (45 min)\n' +
      '- [ ] Set annual targets across four perspectives (50 min)\n' +
      '- [ ] Prioritize strategic initiatives (45 min)\n' +
      '- [ ] Resource and fund initiatives (35 min)\n' +
      '- [ ] Owners, cadence, and commitment (25 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Ground the year in an honest review first.\n' +
      '- Refresh the strategy map before setting targets.\n' +
      '- Fund a focused set of initiatives.\n' +
      '- Lock the quarterly review cadence before leaving.\n\n' +
      '## Notes / Decisions\n\n' +
      'Year in review:\n\n' +
      'Strategy map changes:\n\n' +
      'Annual targets:\n\n' +
      'Funded initiatives:\n\n' +
      'Owners and review cadence:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/bsc-annual-planning\n',
  },
  {
    slug: 'strategic-initiative-review',
    title: 'Strategic Initiative Review Template',
    shortName: 'Strategic Initiative Review',
    description:
      'Use this strategic initiative review template to track the projects funding your strategy, assess progress and risk, and decide what to accelerate or stop.',
    category: 'balanced-scorecard',
    methodology: 'Balanced Scorecard',
    minutes: 75,
    cadence: 'Monthly',
    participants: 'Initiative owners and leadership team (5-12 people)',
    keywords: [
      'strategic initiative review template',
      'initiative review meeting agenda',
      'strategic initiatives tracking template',
      'balanced scorecard initiatives template',
      'strategy execution review agenda',
      'initiative portfolio review template',
      'project portfolio strategy review',
    ],
    steps: [
      { name: 'Portfolio snapshot', minutes: 10, text: 'Open with a status view of every strategic initiative: on track, at risk, or off track, against milestones and budget.' },
      { name: 'On-track initiatives confirmation', minutes: 10, text: 'Quickly confirm initiatives that are healthy so the meeting can spend its time where attention is needed.' },
      { name: 'At-risk initiative deep dives', minutes: 25, text: 'Dig into the at-risk and off-track initiatives, understanding root cause and the help required to recover.' },
      { name: 'Resource and dependency check', minutes: 12, text: 'Review resourcing and cross-initiative dependencies, surfacing conflicts that could stall delivery.' },
      { name: 'Accelerate, hold, or stop decisions', minutes: 13, text: 'Make explicit decisions to accelerate, hold, or stop initiatives based on impact on strategic objectives.' },
      { name: 'Actions and owners', minutes: 5, text: 'Confirm corrective actions, owners, and dates, and note any escalations for the next leadership review.' },
    ],
    bodyHtml:
      '<p>A <strong>strategic initiative review</strong> keeps the projects that fund your strategy honest. In the balanced scorecard model, initiatives are the action programs that move the measures; if they drift, the whole strategy stalls. This review tracks the initiative portfolio and forces clear decisions about what to accelerate, hold, or stop.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run it monthly between the deeper scorecard reviews, so initiatives get attention while there is still time to correct course. It complements the strategy review: the strategy review asks whether the measures are moving, and the initiative review asks whether the work meant to move them is actually on track.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Bring the initiative owners and the leadership members who can reallocate resources, five to twelve people. Owners must be present to speak to status and risk honestly, and decision-makers must be present so accelerate-or-stop calls actually get made.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Open with a portfolio snapshot so everyone sees status at a glance, then move past the healthy initiatives quickly. Spend the bulk of the meeting on the at-risk and off-track ones, digging into root cause and the specific help each needs. Check resourcing and dependencies, since the most common killer is two initiatives quietly fighting for the same people. Close with explicit accelerate, hold, or stop decisions and a short list of owned actions. Choosing to stop a failing initiative is a win, not a failure.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Spend time on at-risk initiatives, not the ones already healthy.</li>' +
      '<li>Push for root cause rather than a status color and a shrug.</li>' +
      '<li>Make stopping an initiative a respectable, explicit decision.</li>' +
      '<li>Surface resource conflicts before they silently stall delivery.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Giving equal airtime to every initiative regardless of risk.</li>' +
      '<li>Letting zombie initiatives drift on without a kill decision.</li>' +
      '<li>Reviewing status without checking resources and dependencies.</li>' +
      '<li>Ending with updates but no owned corrective actions.</li>' +
      '</ul>' +
      '<p>Keep your initiative portfolio moving. <a href="/l8">Run it in OrgTP</a> and link initiatives, owners, and decisions to the strategic measures they serve.</p>',
    downloadMarkdown:
      '# Strategic Initiative Review Template\n\n' +
      'Purpose: Track the initiatives funding your strategy, deep-dive the ones at risk, and make explicit accelerate, hold, or stop decisions with clear owners.\n\n' +
      '- Duration: 75 minutes\n' +
      '- Cadence: Monthly\n' +
      '- Participants: Initiative owners and leadership team (5-12 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Portfolio snapshot, on track / at risk / off track (10 min)\n' +
      '- [ ] On-track initiatives confirmation (10 min)\n' +
      '- [ ] At-risk initiative deep dives (25 min)\n' +
      '- [ ] Resource and dependency check (12 min)\n' +
      '- [ ] Accelerate, hold, or stop decisions (13 min)\n' +
      '- [ ] Actions and owners (5 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Spend time on at-risk initiatives, not healthy ones.\n' +
      '- Push for root cause, not a status color.\n' +
      '- Make stopping an initiative a respectable decision.\n' +
      '- Surface resource conflicts before they stall delivery.\n\n' +
      '## Notes / Decisions\n\n' +
      'Portfolio status:\n\n' +
      'At-risk deep dives:\n\n' +
      'Resource and dependency issues:\n\n' +
      'Accelerate / hold / stop decisions:\n\n' +
      'Actions and owners:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/strategic-initiative-review\n',
  },
  {
    slug: 'monthly-operating-review',
    title: 'Monthly Operating Review Template',
    shortName: 'Monthly Operating Review',
    description:
      'Use this monthly operating review template to review performance against plan, walk department results, surface risks, and align on actions for the month ahead.',
    category: 'balanced-scorecard',
    methodology: 'Balanced Scorecard',
    minutes: 90,
    cadence: 'Monthly',
    participants: 'Leadership team and department heads (6-15 people)',
    keywords: [
      'monthly operating review',
      'monthly operating review template',
      'monthly operating review agenda',
      'operations review meeting template',
      'monthly business review template',
      'MOR meeting agenda',
      'monthly performance review meeting',
    ],
    steps: [
      { name: 'Executive summary', minutes: 10, text: 'Open with a one-page view of the month: headline results against plan, the biggest win, and the biggest concern.' },
      { name: 'Financial performance', minutes: 20, text: 'Review revenue, margin, cash, and budget variance against plan and prior month, with the story behind the numbers.' },
      { name: 'Department performance', minutes: 30, text: 'Each department head reports key metrics against plan, focusing on variance and what is being done about it.' },
      { name: 'Risks and issues', minutes: 15, text: 'Surface operational risks and open issues, prioritizing the few that genuinely threaten the plan.' },
      { name: 'Cross-functional alignment', minutes: 10, text: 'Resolve dependencies and hand-offs that span departments so the month ahead runs without collisions.' },
      { name: 'Actions for the month ahead', minutes: 5, text: 'Confirm the priority actions, owners, and dates that come out of the review.' },
    ],
    bodyHtml:
      '<p>The <strong>monthly operating review</strong>, or MOR, is the disciplined monthly check on how the business is running against plan. It sits between the high-altitude quarterly strategy review and the weekly business review, giving leadership a steady rhythm to catch operational drift and keep departments aligned.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run it every month, soon after the financials close, so the numbers are trustworthy. It is the standing forum for reviewing performance against plan, reconciling departmental results, and resolving the cross-functional issues that quietly accumulate when no one looks at the whole business together.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Bring the leadership team and department heads, six to fifteen people. Everyone reporting should arrive with metrics against plan and a clear view of variance. This is an operating meeting for people accountable for results, not a broad informational update.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Lead with a tight executive summary so the room shares context fast, then review financial performance against plan and prior month. Move into department reports, keeping each focused on variance and the action being taken rather than a full narration. Surface the few risks that actually threaten the plan, resolve cross-functional dependencies in the room, and close with a short list of owned actions for the month ahead. The discipline is in staying on variance and decisions, not reciting every metric.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Keep department reports on variance against plan, not raw status.</li>' +
      '<li>Time-box each department so one area cannot dominate the hour.</li>' +
      '<li>Resolve cross-functional dependencies in the room, not afterward.</li>' +
      '<li>End with a short list of owned actions, not a long recap.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Letting the review become a parade of status with no decisions.</li>' +
      '<li>Spending the whole meeting on finance and skipping operations.</li>' +
      '<li>Ignoring cross-functional issues until they become fires.</li>' +
      '<li>Leaving without clear owners for the actions that came up.</li>' +
      '</ul>' +
      '<p>Bring rhythm to your operations. <a href="/l8">Run it in OrgTP</a> and keep results against plan, risks, and actions visible month over month.</p>',
    downloadMarkdown:
      '# Monthly Operating Review Template\n\n' +
      'Purpose: Review performance against plan, walk department results, surface the risks that matter, and align on owned actions for the month ahead.\n\n' +
      '- Duration: 90 minutes\n' +
      '- Cadence: Monthly\n' +
      '- Participants: Leadership team and department heads (6-15 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Executive summary (10 min)\n' +
      '- [ ] Financial performance vs plan (20 min)\n' +
      '- [ ] Department performance reports (30 min)\n' +
      '- [ ] Risks and issues (15 min)\n' +
      '- [ ] Cross-functional alignment (10 min)\n' +
      '- [ ] Actions for the month ahead (5 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Keep department reports on variance, not raw status.\n' +
      '- Time-box each department so one area cannot dominate.\n' +
      '- Resolve cross-functional dependencies in the room.\n' +
      '- End with a short list of owned actions.\n\n' +
      '## Notes / Decisions\n\n' +
      'Financial performance:\n\n' +
      'Department results:\n\n' +
      'Risks and issues:\n\n' +
      'Actions and owners:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/monthly-operating-review\n',
  },
  {
    slug: 'weekly-business-review',
    title: 'Weekly Business Review (WBR) Template',
    shortName: 'Weekly Business Review (WBR)',
    description:
      'Use this weekly business review template, inspired by the Amazon WBR, to walk a metrics deck, read trends and anomalies, and drive fast operational decisions.',
    category: 'balanced-scorecard',
    methodology: 'Balanced Scorecard',
    minutes: 60,
    cadence: 'Weekly',
    participants: 'Operating team and metric owners (5-15 people)',
    keywords: [
      'weekly business review template',
      'WBR meeting agenda',
      'Amazon weekly business review template',
      'weekly metrics review meeting',
      'weekly business review deck',
      'operational metrics review template',
      'weekly operating review agenda',
    ],
    steps: [
      { name: 'Top-line metrics', minutes: 10, text: 'Open the metrics deck with the headline numbers for the week, read against trend, target, and the same week last year.' },
      { name: 'Customer and demand metrics', minutes: 12, text: 'Walk the customer-facing and demand metrics, noting week-over-week movement and any anomalies worth explaining.' },
      { name: 'Operational and supply metrics', minutes: 12, text: 'Review the operational metrics that drive delivery, calling out variances and their likely causes.' },
      { name: 'Anomaly deep dives', minutes: 15, text: 'Pause on the most significant anomalies and ask why, drilling into root cause rather than restating the chart.' },
      { name: 'Actions and owners', minutes: 8, text: 'Capture corrective actions for each anomaly with an owner and a date so the deck drives change, not just awareness.' },
      { name: 'Carryover and follow-ups', minutes: 3, text: 'Confirm follow-ups from prior weeks are closed and roll forward anything still open.' },
    ],
    bodyHtml:
      '<p>The <strong>weekly business review</strong>, or WBR, is a fast, data-dense operating meeting popularized by Amazon. The team walks a consistent metrics deck every week, reading each chart against trend and target, and stops to drill into anomalies. The discipline of the same deck every week is what makes patterns and problems jump out.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run it weekly on a fixed day so it becomes a reliable operating rhythm. It is the tactical layer beneath your monthly operating review and quarterly strategy review: the WBR catches week-to-week anomalies fast, while the slower meetings handle structural and strategic questions.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Bring the operating team and the owners of the metrics on the deck, five to fifteen people. Everyone should be able to speak to their charts and explain anomalies on the spot. The deck owner curates the metrics; the room reads and reacts to them together.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Walk the metrics deck in a consistent order every week, reading each chart against trend, target, and the prior year rather than just stating this week number. Move quickly through the metrics that are behaving and stop hard on the anomalies, asking why until you reach a real cause. Capture a corrective action with an owner for each anomaly, then confirm prior follow-ups are closed. The power of the WBR comes from repetition and the habit of explaining variance, not from a polished narrative.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Use the same deck and order every week so anomalies stand out.</li>' +
      '<li>Read every chart against trend and target, not as a single number.</li>' +
      '<li>Drill anomalies to root cause instead of restating the chart.</li>' +
      '<li>Close each anomaly with an owner and a date, then check it next week.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Changing the deck every week so trends never become visible.</li>' +
      '<li>Narrating charts instead of explaining why a number moved.</li>' +
      '<li>Spending equal time on healthy metrics and real anomalies.</li>' +
      '<li>Raising anomalies but never assigning corrective action.</li>' +
      '</ul>' +
      '<p>Build a sharper weekly rhythm. <a href="/l8">Run it in OrgTP</a> and keep your metrics deck, anomalies, and follow-up actions live week over week.</p>',
    downloadMarkdown:
      '# Weekly Business Review (WBR) Template\n\n' +
      'Purpose: Walk a consistent metrics deck each week, read every chart against trend and target, drill into anomalies, and assign corrective actions fast.\n\n' +
      '- Duration: 60 minutes\n' +
      '- Cadence: Weekly\n' +
      '- Participants: Operating team and metric owners (5-15 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Top-line metrics vs trend and target (10 min)\n' +
      '- [ ] Customer and demand metrics (12 min)\n' +
      '- [ ] Operational and supply metrics (12 min)\n' +
      '- [ ] Anomaly deep dives, drill to root cause (15 min)\n' +
      '- [ ] Actions and owners (8 min)\n' +
      '- [ ] Carryover and follow-ups (3 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Use the same deck and order every week.\n' +
      '- Read every chart against trend and target.\n' +
      '- Drill anomalies to root cause.\n' +
      '- Close each anomaly with an owner and a date.\n\n' +
      '## Notes / Decisions\n\n' +
      'Top-line metrics:\n\n' +
      'Anomalies and root causes:\n\n' +
      'Actions and owners:\n\n' +
      'Open follow-ups:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/weekly-business-review\n',
  },
  {
    slug: 'quarterly-strategy-review',
    title: 'Quarterly Strategy Review Template',
    shortName: 'Quarterly Strategy Review',
    description:
      'Use this quarterly strategy review template to test strategic assumptions, review progress on goals, adapt the plan, and align leadership for the next quarter.',
    category: 'balanced-scorecard',
    methodology: 'Balanced Scorecard',
    minutes: 120,
    cadence: 'Quarterly',
    participants: 'Leadership team and strategy owners (6-12 people)',
    keywords: [
      'quarterly strategy review template',
      'strategy review meeting agenda',
      'quarterly strategy review agenda',
      'strategy review meeting template',
      'quarterly strategic review template',
      'strategy execution review',
      'leadership strategy review meeting',
    ],
    steps: [
      { name: 'Strategy recap and theme', minutes: 15, text: 'Restate the strategy and the priorities for the year so the review stays anchored to the chosen direction.' },
      { name: 'Progress against strategic goals', minutes: 25, text: 'Review each strategic goal against target, discussing what drove the result and whether the trajectory holds.' },
      { name: 'Test strategic assumptions', minutes: 25, text: 'Revisit the assumptions underneath the strategy and ask whether the market and the business still support them.' },
      { name: 'Adapt the plan', minutes: 25, text: 'Decide what to change: which goals to push, which to drop, and where the strategy needs to bend to new information.' },
      { name: 'Resourcing and trade-offs', minutes: 15, text: 'Reallocate attention and resources to match the adapted plan, making trade-offs explicit.' },
      { name: 'Next-quarter priorities and owners', minutes: 15, text: 'Confirm the few priorities for the coming quarter, assign owners, and agree how progress will be tracked.' },
    ],
    bodyHtml:
      '<p>A <strong>quarterly strategy review</strong> is the leadership team stepping back from execution to ask whether the strategy is still right and still working. Unlike a backward-looking results review, it is forward-looking: the point is to test assumptions, adapt the plan, and realign before the next quarter rather than discovering drift at year end.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run it once a quarter, after the period closes, as the strategic counterpart to your operating reviews. Where the monthly operating review and weekly business review ask whether the business is running well, the quarterly strategy review asks whether it is running toward the right destination.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Bring the leadership team and the owners of the strategic goals, six to twelve people. The room should be senior enough to change the plan and small enough to actually decide. Detailed execution belongs in other meetings; this one is about direction.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Open by restating the strategy so everyone shares context, then review progress on the strategic goals. The heart of the meeting is testing assumptions: the world the strategy was built for shifts, and a good review surfaces where reality has diverged from the plan. Decide what to adapt, reallocate resources to match, and close with a focused set of priorities and owners for the next quarter. The deliverable is a deliberately adjusted strategy, not just a progress report.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Spend real time testing assumptions, not just reading results.</li>' +
      '<li>Make adapting the plan a normal act, not an admission of failure.</li>' +
      '<li>Reallocate resources to match the adapted strategy explicitly.</li>' +
      '<li>Leave with a focused set of priorities and clear owners.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Reviewing progress but never questioning the strategy itself.</li>' +
      '<li>Treating the original plan as fixed when the world has moved.</li>' +
      '<li>Adapting goals on paper without moving any resources.</li>' +
      '<li>Ending with broad intentions instead of owned priorities.</li>' +
      '</ul>' +
      '<p>Keep your strategy adaptive. <a href="/l8">Run it in OrgTP</a> and connect goals, assumptions, and next-quarter priorities across the year.</p>',
    downloadMarkdown:
      '# Quarterly Strategy Review Template\n\n' +
      'Purpose: Review progress on strategic goals, test the assumptions underneath the strategy, adapt the plan, and align leadership on next-quarter priorities.\n\n' +
      '- Duration: 120 minutes\n' +
      '- Cadence: Quarterly\n' +
      '- Participants: Leadership team and strategy owners (6-12 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Strategy recap and theme (15 min)\n' +
      '- [ ] Progress against strategic goals (25 min)\n' +
      '- [ ] Test strategic assumptions (25 min)\n' +
      '- [ ] Adapt the plan (25 min)\n' +
      '- [ ] Resourcing and trade-offs (15 min)\n' +
      '- [ ] Next-quarter priorities and owners (15 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Spend real time testing assumptions, not just reading results.\n' +
      '- Make adapting the plan a normal act.\n' +
      '- Reallocate resources to match the adapted strategy.\n' +
      '- Leave with a focused set of priorities and owners.\n\n' +
      '## Notes / Decisions\n\n' +
      'Progress against goals:\n\n' +
      'Assumptions tested:\n\n' +
      'Plan changes:\n\n' +
      'Next-quarter priorities and owners:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/quarterly-strategy-review\n',
  },
  {
    slug: 'annual-operating-plan-review',
    title: 'Annual Operating Plan Review Template',
    shortName: 'Annual Operating Plan Review',
    description:
      'Use this annual operating plan review template to turn strategy into a costed yearly plan, set targets and budgets by function, and commit owners for the year.',
    category: 'balanced-scorecard',
    methodology: 'Balanced Scorecard',
    minutes: 180,
    cadence: 'Annually',
    participants: 'Leadership team, finance, and function heads (6-15 people)',
    keywords: [
      'annual operating plan review template',
      'annual operating plan template',
      'AOP review meeting agenda',
      'operating plan meeting template',
      'annual plan and budget review',
      'yearly operating plan template',
      'operating plan review agenda',
    ],
    steps: [
      { name: 'Strategy to plan bridge', minutes: 20, text: 'Connect the annual operating plan to the strategy so every target and budget line traces back to a strategic goal.' },
      { name: 'Functional targets and plans', minutes: 45, text: 'Each function presents its targets, key initiatives, and the operating plan it commits to for the year.' },
      { name: 'Budget and headcount review', minutes: 40, text: 'Review proposed budgets and headcount against the total available, reconciling requests with the plan.' },
      { name: 'Cross-functional dependencies', minutes: 25, text: 'Map dependencies across functions and resolve the hand-offs and sequencing that could break the plan.' },
      { name: 'Risks and contingencies', minutes: 25, text: 'Identify the biggest risks to the plan and define the contingencies and trigger points for each.' },
      { name: 'Commit, own, and set cadence', minutes: 25, text: 'Approve the plan, confirm an owner for every target, and lock the review cadence that tracks it through the year.' },
    ],
    bodyHtml:
      '<p>An <strong>annual operating plan review</strong> turns strategy into the costed, committed plan that runs the year. Where the strategy review decides direction, the operating plan review decides the targets, budgets, headcount, and initiatives each function will own. It is the bridge from intent to executable commitment.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run it in the quarter before the fiscal year begins, after strategy and annual goals are set, so the operating plan funds the plan rather than constraining it. Use the same structure for a major mid-year reforecast when conditions change enough to reopen the plan.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Bring the leadership team, finance, and the function heads who will own targets and budgets, six to fifteen people. Everyone presenting should arrive with targets tied to strategy and budgets tied to outcomes, not just a larger ask than last year.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Start by bridging strategy to plan so every target traces to a strategic goal. Let each function present its targets, initiatives, and budget, then reconcile the total against what is actually available. The hard work is in dependencies and trade-offs: functions plan in silos, and the review exists to surface where their plans collide. Stress-test the biggest risks, define contingencies, then commit the plan with named owners and a tracking cadence. A plan with no owners and no review rhythm is a forecast, not a commitment.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Make every target and budget line trace back to strategy.</li>' +
      '<li>Reconcile the total plan against capacity before approving it.</li>' +
      '<li>Surface cross-functional dependencies before they break delivery.</li>' +
      '<li>Commit the plan with named owners and a review cadence.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Building the plan bottom-up with no link to strategy.</li>' +
      '<li>Approving functional plans that quietly exceed total capacity.</li>' +
      '<li>Ignoring cross-functional dependencies until they bite mid-year.</li>' +
      '<li>Committing a plan with no owners and no tracking cadence.</li>' +
      '</ul>' +
      '<p>Turn strategy into a plan you can run. <a href="/l8">Run it in OrgTP</a> and keep targets, budgets, owners, and dependencies connected all year.</p>',
    downloadMarkdown:
      '# Annual Operating Plan Review Template\n\n' +
      'Purpose: Turn strategy into a costed annual plan, set targets and budgets by function, resolve dependencies, and commit owners and a tracking cadence for the year.\n\n' +
      '- Duration: 180 minutes\n' +
      '- Cadence: Annually (plus major reforecasts)\n' +
      '- Participants: Leadership team, finance, and function heads (6-15 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Strategy to plan bridge (20 min)\n' +
      '- [ ] Functional targets and plans (45 min)\n' +
      '- [ ] Budget and headcount review (40 min)\n' +
      '- [ ] Cross-functional dependencies (25 min)\n' +
      '- [ ] Risks and contingencies (25 min)\n' +
      '- [ ] Commit, own, and set cadence (25 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Make every target and budget line trace back to strategy.\n' +
      '- Reconcile the total plan against capacity before approving.\n' +
      '- Surface cross-functional dependencies early.\n' +
      '- Commit the plan with named owners and a cadence.\n\n' +
      '## Notes / Decisions\n\n' +
      'Functional targets and plans:\n\n' +
      'Budget and headcount:\n\n' +
      'Dependencies and risks:\n\n' +
      'Owners and review cadence:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/annual-operating-plan-review\n',
  },
  {
    slug: 'strategy-execution-review',
    title: 'Strategy Execution Review Template',
    shortName: 'Strategy Execution Review',
    description:
      'Use this strategy execution review template to close the gap between plan and delivery, track strategic goals and initiatives, and unblock what is stalling.',
    category: 'balanced-scorecard',
    methodology: 'Balanced Scorecard',
    minutes: 90,
    cadence: 'Monthly',
    participants: 'Leadership team and goal owners (5-12 people)',
    keywords: [
      'strategy execution review template',
      'strategy execution meeting agenda',
      'strategy execution review',
      'strategy execution tracking template',
      'execution review meeting template',
      'strategic goal review agenda',
      'closing the strategy execution gap',
    ],
    steps: [
      { name: 'Strategic goal scorecard', minutes: 15, text: 'Review every strategic goal against target with a clear on-track, at-risk, or off-track status, no narration.' },
      { name: 'Initiative progress', minutes: 20, text: 'Walk the initiatives driving each goal, updating milestones and flagging slippage against the committed timeline.' },
      { name: 'Execution blockers', minutes: 25, text: 'Surface what is actually stalling execution: decisions, resources, dependencies, and conflicting priorities.' },
      { name: 'Unblock and decide', minutes: 15, text: 'Make the decisions needed to clear blockers in the room, escalating only what truly cannot be resolved here.' },
      { name: 'Realign priorities', minutes: 10, text: 'Confirm where attention should concentrate before the next review so execution stays focused.' },
      { name: 'Commitments and owners', minutes: 5, text: 'Capture each commitment with an owner and a date so the review produces movement, not just visibility.' },
    ],
    bodyHtml:
      '<p>A <strong>strategy execution review</strong> exists to close the gap between a good plan and actual delivery. Most strategies do not fail in the planning room; they fail in execution, quietly, as priorities compete and blockers go unaddressed. This review keeps strategic goals and initiatives in front of leadership and forces the unblocking decisions that keep execution moving.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run it monthly between quarterly strategy reviews. The strategy review decides what the strategy is and adapts it; the execution review makes sure the agreed strategy is actually being delivered and clears whatever is in the way. It is the connective tissue between planning and results.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Bring the leadership team and the owners of strategic goals and initiatives, five to twelve people. The room must include the people who can make decisions and reallocate resources, because the whole value of the meeting is unblocking, and unblocking requires authority in the room.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Start with a clean scorecard of strategic goals so status is unambiguous, then update initiative progress against committed milestones. Spend the core of the meeting on blockers: name what is actually stalling execution, whether a pending decision, a resource conflict, or a dependency, and make the call to clear it right there. Realign priorities for the period ahead and close with owned commitments. The measure of a good execution review is how many blockers leave the room resolved.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Keep status crisp so time goes to blockers, not narration.</li>' +
      '<li>Name the real blocker, whether a decision, resource, or dependency.</li>' +
      '<li>Make unblocking decisions in the room rather than deferring them.</li>' +
      '<li>Escalate only what genuinely cannot be resolved by the group.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Reviewing status endlessly without addressing what is stuck.</li>' +
      '<li>Surfacing blockers but deferring every decision to clear them.</li>' +
      '<li>Letting competing priorities go unresolved meeting after meeting.</li>' +
      '<li>Ending with visibility but no owned commitments to act.</li>' +
      '</ul>' +
      '<p>Close your execution gap. <a href="/l8">Run it in OrgTP</a> and keep strategic goals, initiatives, blockers, and commitments visible every month.</p>',
    downloadMarkdown:
      '# Strategy Execution Review Template\n\n' +
      'Purpose: Close the gap between plan and delivery by tracking strategic goals and initiatives, surfacing blockers, and making the decisions to clear them.\n\n' +
      '- Duration: 90 minutes\n' +
      '- Cadence: Monthly\n' +
      '- Participants: Leadership team and goal owners (5-12 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Strategic goal scorecard, on track / at risk / off track (15 min)\n' +
      '- [ ] Initiative progress against milestones (20 min)\n' +
      '- [ ] Execution blockers (25 min)\n' +
      '- [ ] Unblock and decide (15 min)\n' +
      '- [ ] Realign priorities (10 min)\n' +
      '- [ ] Commitments and owners (5 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Keep status crisp so time goes to blockers.\n' +
      '- Name the real blocker: decision, resource, or dependency.\n' +
      '- Make unblocking decisions in the room.\n' +
      '- Escalate only what cannot be resolved by the group.\n\n' +
      '## Notes / Decisions\n\n' +
      'Goal scorecard:\n\n' +
      'Initiative progress:\n\n' +
      'Blockers and decisions:\n\n' +
      'Commitments and owners:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/strategy-execution-review\n',
  },
];
