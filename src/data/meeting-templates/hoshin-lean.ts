// Hoshin Kanri and Lean meeting templates for the /templates library.
// AUTHORED content. bodyHtml renders via <%- %>. Byte-stable: no Date.now,
// no randomness. See _types.ts for the shared contract.

import type { MeetingTemplate } from './_types.js';

export const HOSHIN_LEAN_TEMPLATES: MeetingTemplate[] = [
  {
    slug: 'hoshin-annual-planning',
    title: 'Hoshin Kanri Annual Planning Template',
    shortName: 'Hoshin Kanri Annual Planning',
    description:
      'Use this Hoshin Kanri template to set breakthrough objectives, cascade strategy through catchball, and turn a few vital priorities into an annual deployment plan.',
    category: 'hoshin',
    methodology: 'Hoshin Kanri / Lean',
    minutes: 240,
    cadence: 'Annually',
    participants: 'Leadership team and value-stream owners (6-15 people)',
    keywords: [
      'hoshin kanri template',
      'hoshin kanri annual planning',
      'policy deployment template',
      'strategy deployment meeting agenda',
      'breakthrough objectives template',
      'hoshin planning session',
      'lean strategy deployment template',
      'true north planning agenda',
    ],
    steps: [
      { name: 'Reflect on true north', minutes: 30, text: 'Reconnect with the organization true north and long-term vision, and review how last year breakthrough objectives moved the business toward it.' },
      { name: 'Scan the current condition', minutes: 35, text: 'Assess the market, customer needs, and internal performance to ground the new plan in an honest grasp of the current condition.' },
      { name: 'Select breakthrough objectives', minutes: 50, text: 'Choose three to five breakthrough objectives for the year. Resist a long list; Hoshin works because it forces focus on the vital few.' },
      { name: 'Define annual improvement priorities', minutes: 45, text: 'Translate each breakthrough objective into annual improvement priorities with measurable targets to improve.' },
      { name: 'Catchball with owners', minutes: 50, text: 'Open catchball so owners pressure-test the targets, raise constraints, and shape the means rather than just receive orders.' },
      { name: 'Confirm owners and review rhythm', minutes: 30, text: 'Assign a single owner per priority and agree the monthly and quarterly review rhythm that will keep the plan alive.' },
    ],
    bodyHtml:
      '<p><strong>Hoshin Kanri annual planning</strong> is the Lean discipline of choosing a few vital breakthrough objectives and deploying them through every level of the organization. Born in the Toyota Production System and often called policy deployment, it replaces a sprawling strategy deck with a focused plan that everyone can connect to their daily work.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run this once a year, ahead of the new fiscal cycle, so the organization enters the year aligned on the same handful of priorities. It is also the right reset when a major shift in the market or true north forces the leadership team to rechoose what matters most.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Include the leadership team plus the value-stream owners who will deploy the plan downward through catchball. Six to fifteen people keeps the room able to decide while still wide enough to commit the organization. Detailed team-level alignment happens later in cascaded catchball sessions.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Begin by reflecting on true north and grasping the current condition honestly, because Lean planning starts with facts, not ambition. Select only three to five breakthrough objectives and translate each into annual improvement priorities with real targets to improve. Then open catchball: owners challenge the targets and shape the means, so the plan is co-authored rather than handed down. Close by confirming one owner per priority and the review rhythm that turns the plan into a living system instead of a poster.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Hold the line on the vital few. More than five breakthrough objectives is a wish list, not a Hoshin.</li>' +
      '<li>Anchor every target with a measurable improvement, not a vague aspiration.</li>' +
      '<li>Treat catchball as real negotiation, not a rubber stamp on a finished plan.</li>' +
      '<li>Decide the monthly review cadence before anyone leaves the room.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Choosing too many objectives, so focus dissolves and nothing breaks through.</li>' +
      '<li>Skipping the current-condition grasp and planning on assumptions.</li>' +
      '<li>Treating deployment as one-way orders instead of two-way catchball.</li>' +
      '<li>Setting the plan and never building the review rhythm to sustain it.</li>' +
      '</ul>' +
      '<p>Deploy your strategy with discipline. <a href="/l8">Run it in OrgTP</a> and keep breakthrough objectives, priorities, and owners visible all year.</p>',
    downloadMarkdown:
      '# Hoshin Kanri Annual Planning Template\n\n' +
      'Purpose: Select 3 to 5 breakthrough objectives, translate them into annual improvement priorities, and deploy them through catchball into an owned annual plan.\n\n' +
      '- Duration: 240 minutes\n' +
      '- Cadence: Annually\n' +
      '- Participants: Leadership team and value-stream owners (6-15 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Reflect on true north and last year results (30 min)\n' +
      '- [ ] Scan the current condition (35 min)\n' +
      '- [ ] Select 3 to 5 breakthrough objectives (50 min)\n' +
      '- [ ] Define annual improvement priorities and targets (45 min)\n' +
      '- [ ] Catchball with owners (50 min)\n' +
      '- [ ] Confirm owners and review rhythm (30 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Hold the line on the vital few; cap at 5 objectives.\n' +
      '- Anchor every target with a measurable improvement.\n' +
      '- Treat catchball as real negotiation, not a rubber stamp.\n' +
      '- Decide the monthly review cadence before leaving.\n\n' +
      '## Notes\n\n' +
      'Breakthrough objectives:\n\n' +
      'Annual improvement priorities:\n\n' +
      'Targets to improve:\n\n' +
      'Owners and review rhythm:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/hoshin-annual-planning\n',
    guideHtml: `<h2>The Ultimate Hoshin Kanri Annual Planning Template &amp; Guide</h2>
<p>In Lean management, Hoshin Kanri (also known as Policy Deployment) is the premier framework for strategic planning and execution. Originating in Japan and popularized by companies like Toyota and Hewlett-Packard, Hoshin Kanri translates to "direction setting" or "compass needle." It is designed to align an entire organization's daily operations with its long-term strategic vision.</p>
<p>If your company struggles with strategic misalignment, has too many competing priorities, or fails to execute its annual plans, implementing Hoshin Kanri will bring absolute focus and discipline to your organization.</p>
<p>This comprehensive guide provides a battle-tested Hoshin Annual Planning Template and a step-by-step agenda to help your leadership team select breakthrough objectives, deploy them through "catchball," and build a robust execution roadmap.</p>
<h2>What is Hoshin Kanri Annual Planning?</h2>
<p>Hoshin Kanri Annual Planning is a highly collaborative, 4-hour strategic workshop held by the executive leadership team.</p>
<p>The primary objective of the session is to select <strong>no more than 3 to 5 vital breakthrough objectives</strong> for the upcoming year and deploy them throughout the organization. Unlike traditional top-down planning, Hoshin Kanri relies on a two-way negotiation process called <strong>catchball</strong> to ensure targets are realistic, resources are aligned, and ownership is established at every level.</p>
<h3>The Core Pillars of Hoshin Annual Planning:</h3>
<ul>
<li>Reflect on True North: Re-align on the company's long-term vision, mission, and core values.</li>
<li>Scan Current Conditions: Analyze performance data, market shifts, and operational capabilities.</li>
<li>Select Breakthrough Objectives: Focus on 3-5 vital, game-changing goals for the year.</li>
<li>Deploy via Catchball: Engage in two-way dialogue with department heads to co-author targets and tactics.</li>
<li>Establish Review Cadence: Set up monthly and quarterly reviews to track progress and prevent strategy drift.</li>
</ul>
<h2>The Standard 4-Hour Hoshin Annual Planning Agenda</h2>
<p>To build a focused, aligned annual plan without getting bogged down in tactical details, we recommend a structured 240-minute time-boxed agenda:</p>
<table class="td-guide-table">
<thead><tr><th>Time</th><th>Agenda Item</th><th>Objective</th></tr></thead>
<tbody>
<tr><td><strong>00:00 - 00:30</strong></td><td><strong>Reflect on True North</strong></td><td>Re-align on the long-term vision and review the past year's performance and lessons learned.</td></tr>
<tr><td><strong>00:30 - 01:10</strong></td><td><strong>Scan Current Conditions</strong></td><td>Analyze current operational data, market trends, and organizational capabilities.</td></tr>
<tr><td><strong>01:10 - 02:00</strong></td><td><strong>Select Breakthrough Objectives</strong></td><td>Brainstorm and select the 3-5 vital breakthrough objectives for the upcoming year.</td></tr>
<tr><td><strong>02:00 - 02:50</strong></td><td><strong>Define Annual Priorities</strong></td><td>Break down each breakthrough objective into specific annual improvement priorities with measurable targets.</td></tr>
<tr><td><strong>02:50 - 03:40</strong></td><td><strong>The Catchball Process</strong></td><td>Conduct initial catchball discussions to align resources, challenge targets, and shape implementation means.</td></tr>
<tr><td><strong>03:40 - 04:00</strong></td><td><strong>Confirm Owners &amp; Review Rhythm</strong></td><td>Assign executive owners to each priority, confirm the monthly review cadence, and close the session.</td></tr>
</tbody>
</table>
<h2>The Power of the "Catchball" Process</h2>
<p>A unique and critical component of Hoshin Kanri is <strong>catchball</strong>. In traditional planning, executives hand down targets to managers, who then hand them down to teams. This often leads to unrealistic goals, lack of ownership, and operational failure.</p>
<p>In Hoshin Kanri, the strategic ball is "thrown" back and forth between levels of the organization:</p>
<ol>
<li>Leadership proposes a strategic objective and target.</li>
<li>Department heads analyze the objective, assess their capacity, and throw the ball back with proposed tactics, resource requirements, and adjusted targets.</li>
<li>This iterative dialogue continues until both levels agree on a realistic, fully resourced plan. This co-authoring process builds deep ownership and alignment.</li>
</ol>
<h2>Best Practices for Hoshin Annual Planning</h2>
<h3>1. Focus on the Vital Few, Ignore the Useful Many</h3>
<p>The biggest failure in strategic planning is trying to do too much. If you have 15 priorities, you have none. Hoshin Kanri forces you to focus strictly on the <strong>3 to 5 breakthrough objectives</strong> that will fundamentally transform your business. Everything else is operational noise.</p>
<h3>2. Separate Strategy from Daily Operations</h3>
<p>Breakthrough objectives are designed to close significant performance gaps or capture major market opportunities - they are not "business as usual." Ensure your annual plan clearly distinguishes between strategic breakthrough initiatives and daily operational KPIs.</p>
<h3>3. Establish a Strict Review Cadence</h3>
<p>An annual plan is useless without execution tracking. Before ending your planning session, schedule your monthly Hoshin reviews for the entire year. Consistency in tracking is what separates successful execution from strategic failure.</p>
<h2>Frequently Asked Questions (FAQs)</h2>
<h3>What does Hoshin Kanri mean?</h3>
<p>Hoshin Kanri is a Japanese strategic planning methodology that translates to "direction setting" or "policy deployment." It aligns an organization’s daily activities with its long-term strategic goals.</p>
<h3>What is "catchball" in Hoshin Kanri?</h3>
<p>Catchball is a collaborative, two-way negotiation process between different levels of an organization. It ensures that strategic goals, targets, and resource allocations are co-authored and agreed upon, rather than handed down from the top.</p>
<h3>How many breakthrough objectives should a company have?</h3>
<p>A company should focus on no more than 3 to 5 vital breakthrough objectives per year. Attempting to execute more than 5 strategic initiatives dilutes focus and resources, leading to poor execution.</p>
<h3>What is the difference between Hoshin Kanri and OKRs?</h3>
<p>While both focus on goal alignment, Hoshin Kanri is a comprehensive, top-down strategic deployment system that uses tools like the X-matrix and catchball to align long-term breakthroughs with annual priorities. OKRs are typically more bottom-up, tactical, and run on shorter (quarterly) cycles.</p>`,
    faq: [
      {
            "q": "What does Hoshin Kanri mean?",
            "a": "Hoshin Kanri is a Japanese strategic planning methodology that translates to \"direction setting\" or \"policy deployment.\" It aligns an organization’s daily activities with its long-term strategic goals."
      },
      {
            "q": "What is \"catchball\" in Hoshin Kanri?",
            "a": "Catchball is a collaborative, two-way negotiation process between different levels of an organization. It ensures that strategic goals, targets, and resource allocations are co-authored and agreed upon, rather than handed down from the top."
      },
      {
            "q": "How many breakthrough objectives should a company have?",
            "a": "A company should focus on no more than 3 to 5 vital breakthrough objectives per year. Attempting to execute more than 5 strategic initiatives dilutes focus and resources, leading to poor execution."
      },
      {
            "q": "What is the difference between Hoshin Kanri and OKRs?",
            "a": "While both focus on goal alignment, Hoshin Kanri is a comprehensive, top-down strategic deployment system that uses tools like the X-matrix and catchball to align long-term breakthroughs with annual priorities. OKRs are typically more bottom-up, tactical, and run on shorter (quarterly) cycles."
      }
],
  },
  {
    slug: 'hoshin-catchball-session',
    title: 'Hoshin Catchball Session Template',
    shortName: 'Hoshin Catchball Session',
    description:
      'Use this catchball process template to cascade Hoshin objectives between levels, negotiate targets and means, and build genuine ownership before deployment.',
    category: 'hoshin',
    methodology: 'Hoshin Kanri / Lean',
    minutes: 90,
    cadence: 'As needed',
    participants: 'A level and the level below it (4-10 people)',
    keywords: [
      'catchball process',
      'catchball meeting template',
      'hoshin catchball session',
      'policy deployment catchball',
      'strategy cascade meeting agenda',
      'nemawashi alignment template',
      'hoshin deployment template',
    ],
    steps: [
      { name: 'Share the parent objective', minutes: 15, text: 'The leader presents the objective being cascaded, the target to improve, and the why behind it so context travels with the goal.' },
      { name: 'Clarify and question', minutes: 15, text: 'The receiving level asks questions until the intent is fully understood. Ambiguity caught here saves months of misdeployment.' },
      { name: 'Propose the means', minutes: 25, text: 'The receiving level proposes how it would achieve the target, surfacing the activities, resources, and constraints involved.' },
      { name: 'Negotiate targets and resources', minutes: 20, text: 'Both levels negotiate the target, timeline, and resources back and forth until they reach a commitment both can stand behind.' },
      { name: 'Confirm the agreement', minutes: 15, text: 'Lock the agreed objective, owner, target, and supporting means, and capture what gets cascaded to the next level down.' },
    ],
    bodyHtml:
      '<p>The <strong>catchball session</strong> is the engine of Hoshin Kanri deployment. Named for the back-and-forth of tossing a ball, catchball is the disciplined negotiation through which an objective passes between levels until both the giver and receiver own it. It is how Lean organizations avoid the trap of strategy that is announced from the top but never truly accepted below.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run catchball each time a Hoshin objective cascades to a new level, from leadership to value-stream owners, then from owners to teams. Use it whenever a goal is being handed down and you need genuine commitment rather than reluctant compliance. It pairs naturally with the broader practice of nemawashi, building agreement before decisions are finalized.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Keep it to the two adjacent levels: the leader passing the objective down and the people who will deliver it. Four to ten participants keeps the dialogue real. The point is a focused negotiation, not a broadcast to a large audience.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Start by sharing the parent objective with its target and rationale, then invite hard questions until intent is clear. The receiving level proposes the means, surfacing what it would actually take, and both sides negotiate targets, timeline, and resources until they reach a commitment neither party is privately resisting. Close by confirming the agreement and noting what cascades further down. The ball keeps moving until ownership is real at every level.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Give the receiving level room to challenge the target, not just accept it.</li>' +
      '<li>Pass the why with the what, since means proposed without context miss the mark.</li>' +
      '<li>Keep negotiating until commitment is genuine, not polite.</li>' +
      '<li>Capture exactly what cascades to the next level so the chain stays unbroken.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Treating catchball as a one-way handoff, which produces compliance not ownership.</li>' +
      '<li>Rushing past questions, so misunderstandings deploy downward at scale.</li>' +
      '<li>Refusing to adjust the target, which signals the negotiation was never real.</li>' +
      '<li>Leaving without a clear, owned agreement to cascade further.</li>' +
      '</ul>' +
      '<p>Make deployment a real negotiation. <a href="/l8">Run it in OrgTP</a> and keep every cascaded objective, target, and owner connected through the chain.</p>',
    downloadMarkdown:
      '# Hoshin Catchball Session Template\n\n' +
      'Purpose: Cascade a Hoshin objective between two levels, negotiate targets and means through back-and-forth catchball, and reach a commitment both levels own.\n\n' +
      '- Duration: 90 minutes\n' +
      '- Cadence: As needed (each deployment cascade)\n' +
      '- Participants: A level and the level below it (4-10 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Share the parent objective and the why (15 min)\n' +
      '- [ ] Clarify and question until intent is clear (15 min)\n' +
      '- [ ] Receiving level proposes the means (25 min)\n' +
      '- [ ] Negotiate targets, timeline, and resources (20 min)\n' +
      '- [ ] Confirm the agreement and what cascades down (15 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Give the receiving level room to challenge the target.\n' +
      '- Pass the why with the what.\n' +
      '- Keep negotiating until commitment is genuine.\n' +
      '- Capture exactly what cascades to the next level.\n\n' +
      '## Notes\n\n' +
      'Parent objective and target:\n\n' +
      'Proposed means:\n\n' +
      'Negotiated commitment:\n\n' +
      'What cascades down:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/hoshin-catchball-session\n',
  },
  {
    slug: 'hoshin-x-matrix-review',
    title: 'Hoshin X-Matrix Review Template',
    shortName: 'Hoshin X-Matrix Review',
    description:
      'Use this X-matrix template to connect breakthrough objectives, annual priorities, improvement targets, and owners on one page and verify the links hold.',
    category: 'hoshin',
    methodology: 'Hoshin Kanri / Lean',
    minutes: 90,
    cadence: 'Quarterly',
    participants: 'Leadership team and priority owners (5-12 people)',
    keywords: [
      'x-matrix template',
      'hoshin x-matrix review',
      'x matrix hoshin kanri',
      'policy deployment matrix template',
      'strategy deployment matrix agenda',
      'hoshin matrix meeting',
      'breakthrough objectives matrix',
    ],
    steps: [
      { name: 'Orient to the X-matrix', minutes: 10, text: 'Walk the four quadrants of the X-matrix: long-term breakthroughs, annual priorities, improvement targets, and the metrics and owners that tie them together.' },
      { name: 'Verify breakthrough to annual links', minutes: 20, text: 'Confirm each annual priority genuinely advances a breakthrough objective, marking the correlation strength in the matrix.' },
      { name: 'Check priorities to targets', minutes: 20, text: 'Verify that each improvement target maps to a priority and that the targets are measurable and sufficient to move it.' },
      { name: 'Confirm targets to owners', minutes: 15, text: 'Ensure every target has a single accountable owner and that no owner is overloaded across the matrix.' },
      { name: 'Find gaps and overloads', minutes: 15, text: 'Scan for orphaned priorities, unsupported breakthroughs, and resource overloads revealed by the correlation marks.' },
      { name: 'Agree adjustments', minutes: 10, text: 'Decide the changes needed to make the matrix coherent and assign who updates the deployment plan.' },
    ],
    bodyHtml:
      '<p>The <strong>X-matrix review</strong> puts an entire Hoshin Kanri plan on a single page and pressure-tests whether its parts actually connect. The X-matrix is the signature tool of policy deployment: long-term breakthroughs, annual priorities, improvement targets, and owners occupy the four arms, and correlation marks show how each links to the next. Reviewing it keeps strategy honest.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Review the X-matrix when the annual plan is first built and again each quarter to confirm the links still hold as conditions change. It is also valuable whenever a new priority is proposed mid-year, since the matrix immediately shows what it would displace or strain.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Bring the leadership team and the owners of the annual priorities and targets, five to twelve people. These are the people who can confirm whether a stated correlation is real and whether the targets are achievable with the resources on hand.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Orient everyone to the four quadrants, then work the correlations in turn. Verify that each annual priority advances a breakthrough, that each improvement target maps to a priority and is measurable, and that every target has one owner who is not overloaded. The matrix earns its keep by exposing gaps: an orphaned priority, a breakthrough nothing supports, or an owner stretched across too many marks. Close by agreeing the adjustments and assigning who updates the plan.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Read the matrix as a chain. A weak link anywhere undermines the whole plan.</li>' +
      '<li>Question every correlation mark; an unsupported link is a hidden risk.</li>' +
      '<li>Watch for owners carrying too many targets to deliver any of them.</li>' +
      '<li>Treat orphaned priorities as a signal to cut or connect, never to ignore.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Building a beautiful matrix nobody revisits once the year begins.</li>' +
      '<li>Marking correlations that look tidy but do not hold in reality.</li>' +
      '<li>Letting priorities exist with no measurable target beneath them.</li>' +
      '<li>Overloading a single owner until the plan quietly stalls.</li>' +
      '</ul>' +
      '<p>Keep your strategy connected on one page. <a href="/l8">Run it in OrgTP</a> and keep breakthroughs, priorities, targets, and owners linked and visible.</p>',
    downloadMarkdown:
      '# Hoshin X-Matrix Review Template\n\n' +
      'Purpose: Verify the links across the X-matrix so breakthrough objectives, annual priorities, improvement targets, and owners form one coherent deployment plan.\n\n' +
      '- Duration: 90 minutes\n' +
      '- Cadence: Quarterly (plus at plan build)\n' +
      '- Participants: Leadership team and priority owners (5-12 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Orient to the four X-matrix quadrants (10 min)\n' +
      '- [ ] Verify breakthrough to annual priority links (20 min)\n' +
      '- [ ] Check priorities to improvement targets (20 min)\n' +
      '- [ ] Confirm targets to owners (15 min)\n' +
      '- [ ] Find gaps, orphans, and overloads (15 min)\n' +
      '- [ ] Agree adjustments and updates (10 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Read the matrix as a chain; a weak link breaks the plan.\n' +
      '- Question every correlation mark.\n' +
      '- Watch for owners carrying too many targets.\n' +
      '- Cut or connect orphaned priorities, never ignore them.\n\n' +
      '## Notes\n\n' +
      'Weak or missing links:\n\n' +
      'Orphaned priorities:\n\n' +
      'Overloaded owners:\n\n' +
      'Adjustments and who updates the plan:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/hoshin-x-matrix-review\n',
    guideHtml: `<h2>The Ultimate Hoshin X-Matrix Review Template &amp; Guide</h2>
<p>In the Hoshin Kanri (Policy Deployment) framework, the <strong>X-Matrix</strong> is the ultimate visual tool for strategic alignment. It is a single-page document that maps out the complete connection between your long-term breakthroughs, annual priorities, improvement targets, and key owners.</p>
<p>However, an X-Matrix is not a static document to be filled out once a year and filed away. To ensure your strategy remains honest, realistic, and fully aligned, your leadership team must run a structured <strong>Hoshin X-Matrix Review</strong>.</p>
<p>This comprehensive guide provides a battle-tested Hoshin X-Matrix Review Template and a step-by-step workshop agenda to help your team pressure-test your strategic plan, expose operational gaps, and maintain absolute alignment.</p>
<h2>What is a Hoshin X-Matrix Review?</h2>
<p>A Hoshin X-Matrix Review is a strategic, 90-minute workshop held quarterly.</p>
<p>The primary objective of the session is to validate the integrity of your strategic plan. By analyzing the correlation marks on the X-Matrix, the leadership team pressure-tests whether your annual priorities genuinely support your long-term breakthroughs, whether your improvement targets are measurable, and whether your resources are balanced or overloaded.</p>
<h3>The Four Quadrants of the X-Matrix:</h3>
<ul>
<li><strong>South (Long-Term Breakthroughs):</strong> What are our 3-5 year strategic goals?</li>
<li><strong>West (Annual Priorities):</strong> What must we accomplish this year to advance those breakthroughs?</li>
<li><strong>North (Improvement Targets):</strong> How will we measure success? (KPIs and metrics).</li>
<li><strong>East (Owners &amp; Resources):</strong> Who is responsible for driving each priority?</li>
</ul>
<h2>The Standard 90-Minute X-Matrix Review Agenda</h2>
<p>To systematically analyze all four quadrants and verify the integrity of your strategic plan, we recommend a structured 90-minute agenda:</p>
<table class="td-guide-table">
<thead><tr><th>Time</th><th>Agenda Item</th><th>Objective</th></tr></thead>
<tbody>
<tr><td><strong>00:00 - 00:10</strong></td><td><strong>Orient to the X-Matrix</strong></td><td>Welcome the team, review the four quadrants, and establish the focus of today's alignment check.</td></tr>
<tr><td><strong>00:10 - 00:30</strong></td><td><strong>Verify Breakthrough-to-Annual Links</strong></td><td>Analyze the correlation marks between long-term breakthroughs and annual priorities. Ensure every breakthrough is supported.</td></tr>
<tr><td><strong>00:30 - 00:50</strong></td><td><strong>Check Priorities-to-Targets Links</strong></td><td>Verify that every annual priority has a corresponding, measurable improvement target. Expose any unmeasured priorities.</td></tr>
<tr><td><strong>00:50 - 01:10</strong></td><td><strong>Analyze Resource &amp; Ownership Balance</strong></td><td>Review the East quadrant. Ensure ownership is balanced and no single leader or department is overloaded.</td></tr>
<tr><td><strong>01:10 - 01:25</strong></td><td><strong>Triage Gaps &amp; Adjust Plan</strong></td><td>Address any strategic gaps, orphaned priorities, or resource bottlenecks uncovered during the review.</td></tr>
<tr><td><strong>01:25 - 01:30</strong></td><td><strong>Confirm Commitments &amp; Close</strong></td><td>Re-affirm ownership, document any adjustments to the matrix, and officially close the session.</td></tr>
</tbody>
</table>
<h2>How to Expose Strategic Gaps Using the X-Matrix</h2>
<p>The true power of the X-Matrix lies in its ability to expose strategic dishonesty and operational gaps through its visual correlation marks:</p>
<h3>1. Orphaned Priorities (The "Why" Gap)</h3>
<p>Look at your annual priorities (West). If you find a priority that does not have a correlation mark linking it to a long-term breakthrough (South), ask: <em>Why are we spending time and resources on this priority if it doesn't advance our long-term strategy?</em></p>
<h3>2. Unsupported Breakthroughs (The "How" Gap)</h3>
<p>Look at your long-term breakthroughs (South). If you find a breakthrough that has no correlation marks linking it to an annual priority (West), you have a strategic gap. You are claiming a long-term goal but have planned no concrete actions this year to achieve it.</p>
<h3>3. Overloaded Owners (The "Who" Gap)</h3>
<p>Look at the East quadrant. If you see a single leader's name correlated with 8 different annual priorities and 10 different targets, they are overloaded. The X-Matrix visually exposes resource bottlenecks before they lead to execution failure and burnout.</p>
<h2>Best Practices for the X-Matrix Review</h2>
<h3>1. Keep It on a Single Page</h3>
<p>The core discipline of the X-Matrix is that it must fit on a single sheet of paper (typically printed on large A3 or ledger paper). This constraint forces your leadership team to be concise, eliminate strategic fluff, and focus strictly on the vital few priorities.</p>
<h3>2. Use Strong vs. Weak Correlation Marks</h3>
<p>Use distinct symbols to represent the strength of the links between quadrants (e.g., a solid circle for a primary/strong correlation, and an open circle for a secondary/weak correlation). This prevents teams from claiming that "everything connects to everything" and forces honest strategic prioritization.</p>
<h3>3. Run the Review Quarterly</h3>
<p>While you track metrics monthly on a Bowling Chart, you should review the structural integrity of the X-Matrix quarterly. This cadence allows you to adjust to major market shifts or resource constraints without disrupting your annual planning rhythm.</p>
<h2>Frequently Asked Questions (FAQs)</h2>
<h3>What is a Hoshin X-Matrix?</h3>
<p>A Hoshin X-Matrix is a single-page strategic planning document that visually connects long-term breakthroughs, annual priorities, improvement targets, and key owners using correlation marks in a grid.</p>
<h3>What are correlation marks in an X-Matrix?</h3>
<p>Correlation marks are visual symbols (such as solid or open circles) placed in the corners of the matrix to show the strength of the relationship between different quadrants (e.g., how strongly an annual priority supports a long-term breakthrough).</p>
<h3>How do you identify an overloaded owner on the X-Matrix?</h3>
<p>Scan the East quadrant (Owners). If a single individual's column has correlation marks linking them to an excessive number of priorities or targets, they are a resource bottleneck and tasks should be reallocated.</p>
<h3>How often should the X-Matrix be reviewed?</h3>
<p>While metrics are tracked monthly, the structural alignment and resource balance of the X-Matrix should be formally reviewed by the leadership team quarterly.</p>`,
    faq: [
      {
            "q": "What is a Hoshin X-Matrix?",
            "a": "A Hoshin X-Matrix is a single-page strategic planning document that visually connects long-term breakthroughs, annual priorities, improvement targets, and key owners using correlation marks in a grid."
      },
      {
            "q": "What are correlation marks in an X-Matrix?",
            "a": "Correlation marks are visual symbols (such as solid or open circles) placed in the corners of the matrix to show the strength of the relationship between different quadrants (e.g., how strongly an annual priority supports a long-term breakthrough)."
      },
      {
            "q": "How do you identify an overloaded owner on the X-Matrix?",
            "a": "Scan the East quadrant (Owners). If a single individual's column has correlation marks linking them to an excessive number of priorities or targets, they are a resource bottleneck and tasks should be reallocated."
      },
      {
            "q": "How often should the X-Matrix be reviewed?",
            "a": "While metrics are tracked monthly, the structural alignment and resource balance of the X-Matrix should be formally reviewed by the leadership team quarterly."
      }
],
  },
  {
    slug: 'hoshin-monthly-review',
    title: 'Hoshin Monthly Review Template',
    shortName: 'Hoshin Monthly Review',
    description:
      'Use this Hoshin monthly review template and bowling chart to track improvement targets against plan, run countermeasures on red items, and keep deployment on pace.',
    category: 'hoshin',
    methodology: 'Hoshin Kanri / Lean',
    minutes: 60,
    cadence: 'Monthly',
    participants: 'Priority owners and their leader (4-10 people)',
    keywords: [
      'hoshin monthly review',
      'bowling chart template',
      'hoshin review meeting agenda',
      'policy deployment review',
      'improvement target tracking template',
      'countermeasure review meeting',
      'hoshin progress review',
    ],
    steps: [
      { name: 'Read the bowling chart', minutes: 10, text: 'Walk the bowling chart, comparing each improvement target actual against its planned monthly value and flagging red, yellow, and green status.' },
      { name: 'Green and yellow updates', minutes: 10, text: 'Owners of on-pace targets give brief updates so the meeting spends its real time where it is needed.' },
      { name: 'Red item root cause', minutes: 20, text: 'For each red target, the owner explains the gap between actual and plan and the root cause behind it.' },
      { name: 'Countermeasures', minutes: 15, text: 'Agree countermeasures for the red items, with an owner and a date, to close the gap to plan.' },
      { name: 'Confirm actions and escalations', minutes: 5, text: 'Lock the countermeasure actions and escalate anything the team cannot resolve at this level.' },
    ],
    bodyHtml:
      '<p>The <strong>Hoshin monthly review</strong> is the cadence that keeps strategy deployment from drifting between annual planning and year end. Its centerpiece is the bowling chart, a simple grid showing each improvement target plan versus actual month by month. The chart makes status visible at a glance and focuses the meeting on the gaps that matter.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run this every month against the annual Hoshin plan. It sits between the daily management huddles that handle the work and the quarterly reviews that adjust the plan itself. The monthly rhythm is where countermeasures are launched early enough to still change the year.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Bring the priority owners and the leader they report to, four to ten people. This is a working review, not a broadcast, so keep it to those who own targets or can authorize countermeasures and resources.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Open by reading the bowling chart so everyone sees plan versus actual in one view. Move quickly through green and yellow targets, then spend the real time on the red ones. For each red item, the owner explains the gap and its root cause, and the team agrees a countermeasure with an owner and a date. The discipline is to treat a missed plan as a problem to solve, not a number to explain away. Close by confirming actions and escalating anything beyond the team to resolve.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Spend most of the meeting on red items, not on celebrating green.</li>' +
      '<li>Demand a root cause for every miss, not a narrative of effort.</li>' +
      '<li>Close every red item with a countermeasure, an owner, and a date.</li>' +
      '<li>Escalate fast when a gap exceeds what the team can fix alone.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Reviewing activity instead of actual progress against the bowling chart.</li>' +
      '<li>Explaining away red items rather than launching countermeasures.</li>' +
      '<li>Spending the meeting on green targets that need no attention.</li>' +
      '<li>Leaving without owners and dates, so the same reds return next month.</li>' +
      '</ul>' +
      '<p>Keep deployment on pace every month. <a href="/l8">Run it in OrgTP</a> and keep targets, status, and countermeasures live between reviews.</p>',
    downloadMarkdown:
      '# Hoshin Monthly Review Template\n\n' +
      'Purpose: Track improvement targets against the bowling chart each month, run root cause and countermeasures on red items, and keep Hoshin deployment on pace.\n\n' +
      '- Duration: 60 minutes\n' +
      '- Cadence: Monthly\n' +
      '- Participants: Priority owners and their leader (4-10 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Read the bowling chart, plan vs actual (10 min)\n' +
      '- [ ] Green and yellow updates (10 min)\n' +
      '- [ ] Red item root cause (20 min)\n' +
      '- [ ] Agree countermeasures with owners and dates (15 min)\n' +
      '- [ ] Confirm actions and escalations (5 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Spend most of the meeting on red items.\n' +
      '- Demand a root cause for every miss.\n' +
      '- Close every red item with a countermeasure, owner, and date.\n' +
      '- Escalate fast when a gap is beyond the team.\n\n' +
      '## Notes\n\n' +
      'Bowling chart status:\n\n' +
      'Red items and root causes:\n\n' +
      'Countermeasures, owners, and dates:\n\n' +
      'Escalations:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/hoshin-monthly-review\n',
    guideHtml: `<h2>The Ultimate Hoshin Kanri Monthly Review Template &amp; Guide</h2>
<p>In the Hoshin Kanri (Policy Deployment) framework, the annual plan is only the starting point. The true engine of strategic execution is the <strong>Hoshin Monthly Review</strong>. Without a disciplined monthly cadence to track progress, analyze variances, and adjust tactics, even the most brilliant annual plans will drift and fail.</p>
<p>The monthly review is the operational heartbeat that keeps your breakthrough objectives top-of-mind and ensures your daily activities remain aligned with your strategic direction.</p>
<p>This comprehensive guide provides a battle-tested Hoshin Monthly Review Template and a step-by-step agenda to help your leadership team track performance, read bowling charts, and maintain strategic momentum.</p>
<h2>What is a Hoshin Monthly Review?</h2>
<p>A Hoshin Monthly Review is a structured, 60-minute meeting where priority owners and leadership inspect progress against annual strategic targets.</p>
<p>Unlike weekly tactical syncs, the monthly Hoshin review is strictly focused on <strong>strategic execution, variance analysis, and countermeasure deployment</strong>. It uses visual tracking tools - specifically the Hoshin Bowling Chart - to quickly identify which strategic priorities are on track and which require immediate intervention.</p>
<h3>The Core Objectives of the Monthly Review:</h3>
<ul>
<li>Track Strategic Progress: Review actual performance against monthly targets for every strategic priority.</li>
<li>Analyze Variances: Identify the root causes of any missed targets or lagging indicators.</li>
<li>Deploy Countermeasures: Agree on immediate, actionable steps to get off-track priorities back to Green.</li>
<li>Maintain Accountability: Ensure every strategic priority has a clear owner who is actively driving execution.</li>
</ul>
<h2>The Standard 60-Minute Hoshin Monthly Review Agenda</h2>
<p>To keep the meeting highly focused on strategic problem-solving and variance management, we recommend a strict time-boxed 60-minute agenda:</p>
<table class="td-guide-table">
<thead><tr><th>Time</th><th>Agenda Item</th><th>Objective</th></tr></thead>
<tbody>
<tr><td><strong>00:00 - 00:05</strong></td><td><strong>Scorecard &amp; Bowling Chart Snapshot</strong></td><td>Quickly review the overall health of the Hoshin plan. Note the percentage of targets currently sitting at Green, Yellow, and Red.</td></tr>
<tr><td><strong>00:05 - 00:20</strong></td><td><strong>Review Green &amp; On-Track Priorities</strong></td><td>Priority owners provide brief, high-level updates on Green priorities. Celebrate wins and confirm next milestones.</td></tr>
<tr><td><strong>00:20 - 00:50</strong></td><td><strong>Red/Yellow Variance Triage</strong></td><td>Focus 50% of the meeting on off-track priorities. Owners present root-cause analyses and proposed countermeasures.</td></tr>
<tr><td><strong>00:50 - 00:55</strong></td><td><strong>Confirm Actions &amp; Escalations</strong></td><td>Summarize new countermeasures, assign owners, and document any resource escalations.</td></tr>
<tr><td><strong>00:55 - 01:00</strong></td><td><strong>Meeting Evaluation &amp; Close</strong></td><td>Briefly rate the meeting's efficiency and confirm the date for the next review.</td></tr>
</tbody>
</table>
<h2>How to Read a Hoshin Bowling Chart</h2>
<p>The primary visual tool used during the Hoshin Monthly Review is the <strong>Bowling Chart</strong> (so named because the grid of numbers resembles a bowling scorecard).</p>
<p>A standard Bowling Chart tracks:</p>
<ul>
<li><strong>Strategic Objective / Priority:</strong> The high-level goal being tracked.</li>
<li><strong>Metric / KPI:</strong> How success is measured.</li>
<li><strong>Target vs. Actual:</strong> The planned target for each month of the year, compared against the actual result achieved.</li>
<li><strong>RYG Status:</strong> Visual color-coding (Red/Yellow/Green) representing performance against the target.</li>
</ul>
<p>During the review, the team scans the Bowling Chart to identify "Red" cells. A Red cell is an immediate trigger for a root-cause analysis (often documented on an A3 report) and a countermeasure.</p>
<h2>Best Practices for an Effective Hoshin Review</h2>
<h3>1. Pre-Populate the Bowling Chart</h3>
<p>Never waste meeting time looking up metrics or updating spreadsheets. Every priority owner must update their actual results and color-code their Bowling Chart cells at least 24 hours before the meeting starts.</p>
<h3>2. Focus on the Process, Not the Person</h3>
<p>When a strategic priority is Red, the purpose of the meeting is not to assign blame or punish the owner. Instead, focus the team's collective intelligence on <strong>solving the process bottleneck</strong> that caused the miss. Encourage transparency and psychological safety.</p>
<h3>3. Countermeasures Must Be Actionable</h3>
<p>A countermeasure is not a vague promise to "try harder." It must be a specific, actionable task with a single owner and a clear deadline (e.g., "Reallocate $5,000 from marketing budget to support sales training by Friday").</p>
<h2>Frequently Asked Questions (FAQs)</h2>
<h3>What is a Hoshin Bowling Chart?</h3>
<p>A Bowling Chart is a visual tracking tool used in Hoshin Kanri to compare monthly actual results against planned strategic targets across the fiscal year, using Red/Yellow/Green color-coding to highlight variances.</p>
<h3>What is the difference between a Hoshin monthly review and a weekly tactical meeting?</h3>
<p>A weekly tactical meeting focuses on day-to-day operations, task lists, and immediate fires. A Hoshin monthly review is strictly strategic, focusing on tracking progress against annual breakthrough objectives and deploying countermeasures for off-track priorities.</p>
<h3>What is a countermeasure in Hoshin Kanri?</h3>
<p>A countermeasure is an immediate, actionable step taken to address a missed target or operational variance, designed to get an off-track strategic priority back to Green within the next 30 days.</p>
<h3>Who should facilitate the Hoshin Monthly Review?</h3>
<p>The review is typically facilitated by the Chief of Staff, a Lean/Continuous Improvement leader, or the Integrator, with active participation from the entire executive leadership team.</p>`,
    faq: [
      {
            "q": "What is a Hoshin Bowling Chart?",
            "a": "A Bowling Chart is a visual tracking tool used in Hoshin Kanri to compare monthly actual results against planned strategic targets across the fiscal year, using Red/Yellow/Green color-coding to highlight variances."
      },
      {
            "q": "What is the difference between a Hoshin monthly review and a weekly tactical meeting?",
            "a": "A weekly tactical meeting focuses on day-to-day operations, task lists, and immediate fires. A Hoshin monthly review is strictly strategic, focusing on tracking progress against annual breakthrough objectives and deploying countermeasures for off-track priorities."
      },
      {
            "q": "What is a countermeasure in Hoshin Kanri?",
            "a": "A countermeasure is an immediate, actionable step taken to address a missed target or operational variance, designed to get an off-track strategic priority back to Green within the next 30 days."
      },
      {
            "q": "Who should facilitate the Hoshin Monthly Review?",
            "a": "The review is typically facilitated by the Chief of Staff, a Lean/Continuous Improvement leader, or the Integrator, with active participation from the entire executive leadership team."
      }
],
  },
  {
    slug: 'gemba-walk',
    title: 'Gemba Walk Template',
    shortName: 'Gemba Walk',
    description:
      'Use this gemba walk checklist to observe work where it happens, ask respectful questions, see real problems firsthand, and capture improvement opportunities.',
    category: 'hoshin',
    methodology: 'Hoshin Kanri / Lean',
    minutes: 45,
    cadence: 'Weekly',
    participants: 'Leader plus the team doing the work (2-6 people)',
    keywords: [
      'gemba walk checklist',
      'gemba walk template',
      'gemba walk agenda',
      'go and see template',
      'lean gemba walk',
      'shop floor walk template',
      'gemba observation guide',
    ],
    steps: [
      { name: 'Set the purpose', minutes: 5, text: 'Decide the theme of the walk: a process, a value stream, safety, flow, or a standard, so the observation has focus.' },
      { name: 'Go and see the work', minutes: 15, text: 'Walk to where the work actually happens and watch the process run, following the flow rather than waiting for reports.' },
      { name: 'Ask respectful questions', minutes: 10, text: 'Ask the people doing the work open questions about how the process works and where it breaks down, with humility and curiosity.' },
      { name: 'Observe against the standard', minutes: 10, text: 'Compare what you see against the standard work and look for gaps, waste, and conditions that make the job harder than it should be.' },
      { name: 'Capture and thank', minutes: 5, text: 'Note the opportunities observed, thank the team for their time, and confirm what you will follow up on without fixing on the spot.' },
    ],
    bodyHtml:
      '<p>A <strong>gemba walk</strong> is the Lean practice of going to where the work is actually done to see reality firsthand. Gemba means the real place, and the principle behind it, go and see, is central to the Toyota Production System: leaders learn more from observing the process and respecting the people in it than from any report or dashboard.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Make gemba walks a regular rhythm, often weekly, rather than a reaction to a crisis. Use one whenever you need to understand a process directly, validate that standard work is being followed, or simply stay connected to how value is created. A focused walk runs thirty to sixty minutes.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Keep the group small, two to six people, centered on the leader and the team doing the work. The walk is about observing and learning from the people closest to the process, so a large entourage gets in the way and changes the behavior you came to see.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Set a clear purpose so the walk observes one theme well rather than everything poorly. Go to the actual place and watch the process run, following the flow of work. Ask the people doing it respectful, open questions and listen more than you speak. Compare what you see against the standard, noting waste and friction without jumping in to fix it. Capture the opportunities, thank the team, and follow up later. The gemba walk builds understanding; it is not the place to issue corrections on the spot.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Go to see and learn, not to inspect or assign blame.</li>' +
      '<li>Ask questions rather than hand down answers in the moment.</li>' +
      '<li>Follow the flow of the work, not the org chart.</li>' +
      '<li>Respect the people; they know the process better than you do.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Turning the walk into an audit, which makes the team perform rather than work.</li>' +
      '<li>Fixing problems on the spot instead of understanding root cause first.</li>' +
      '<li>Talking more than observing, so you miss what the work reveals.</li>' +
      '<li>Walking with no purpose, producing scattered notes and no insight.</li>' +
      '</ul>' +
      '<p>See the work where it happens. <a href="/l8">Run it in OrgTP</a> and turn gemba observations into tracked improvement opportunities.</p>',
    downloadMarkdown:
      '# Gemba Walk Template\n\n' +
      'Purpose: Go and see the work where it happens, ask respectful questions, observe against the standard, and capture improvement opportunities firsthand.\n\n' +
      '- Duration: 45 minutes (30 to 60 minutes typical)\n' +
      '- Cadence: Weekly\n' +
      '- Participants: Leader plus the team doing the work (2-6 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Set the purpose and theme of the walk (5 min)\n' +
      '- [ ] Go and see the work run (15 min)\n' +
      '- [ ] Ask respectful, open questions (10 min)\n' +
      '- [ ] Observe against the standard (10 min)\n' +
      '- [ ] Capture opportunities and thank the team (5 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Go to see and learn, not to inspect or blame.\n' +
      '- Ask questions rather than hand down answers.\n' +
      '- Follow the flow of the work, not the org chart.\n' +
      '- Respect the people; they know the process best.\n\n' +
      '## Notes\n\n' +
      'Purpose of the walk:\n\n' +
      'What was observed:\n\n' +
      'Gaps and waste:\n\n' +
      'Follow-up opportunities:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/gemba-walk\n',
  },
  {
    slug: 'kaizen-event',
    title: 'Kaizen Event Template',
    shortName: 'Kaizen Event',
    description:
      'Use this kaizen event agenda to run a focused rapid improvement workshop, map the current state, redesign the process, and implement change within a few days.',
    category: 'hoshin',
    methodology: 'Hoshin Kanri / Lean',
    minutes: 2400,
    cadence: 'As needed',
    participants: 'Cross-functional improvement team and process operators (5-10 people)',
    keywords: [
      'kaizen event agenda',
      'kaizen event template',
      'rapid improvement workshop template',
      'kaizen blitz agenda',
      'lean improvement event template',
      'process improvement workshop',
      'kaizen week schedule',
    ],
    steps: [
      { name: 'Charter and current state', minutes: 360, text: 'Confirm the scope, goal, and boundaries of the event, then map the current state of the process by observing it directly.' },
      { name: 'Analyze waste and root cause', minutes: 360, text: 'Identify the waste and bottlenecks in the current state and dig into the root causes behind the biggest problems.' },
      { name: 'Design the future state', minutes: 360, text: 'Design an improved future-state process, testing ideas against the goal and the realities operators raise.' },
      { name: 'Implement and pilot', minutes: 720, text: 'Make the changes during the event itself: adjust layout, standard work, and flow, then pilot the new process live.' },
      { name: 'Standardize the new process', minutes: 240, text: 'Document the new standard work, train the team, and build the visual controls that hold the gains.' },
      { name: 'Report out and sustain plan', minutes: 360, text: 'Present results to leadership, confirm the metrics improved, and assign the follow-up actions that sustain the change.' },
    ],
    bodyHtml:
      '<p>A <strong>kaizen event</strong>, sometimes called a rapid improvement workshop or kaizen blitz, is a focused, time-boxed effort to transform a specific process. Drawn from the Lean tradition of continuous improvement, it gathers a cross-functional team for several consecutive days to map, redesign, and actually implement a better way of working before anyone goes back to their day job.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run a kaizen event when a process has a clear, contained problem worth solving fast and benefits from dedicated, full-time focus. Events typically run three to five days. They suit bottlenecks, quality issues, or flow problems where incremental tweaks have not been enough and the team needs concentrated time to break through.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Build a cross-functional team of five to ten people, including the operators who actually run the process. Their firsthand knowledge is essential, and their involvement is what makes the new standard stick. A sponsor from leadership should charter the event and attend the final report-out.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Open with a clear charter and a current-state map built by observing the real process. Analyze the waste and root causes, then design a future state the team believes in. The defining feature of a kaizen event is that implementation happens during the event, not after: the team changes the process, pilots it live, and standardizes the new way with documented standard work and visual controls. Close with a report-out to leadership and a sustain plan, because gains that are not held quietly erode.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Charter a tight scope; a kaizen event solves one process, not everything.</li>' +
      '<li>Implement inside the event, not as a list of actions for later.</li>' +
      '<li>Keep the operators central; they make the change real and durable.</li>' +
      '<li>Standardize and build visual controls so the gains hold.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Scoping the event so broadly the team cannot finish anything.</li>' +
      '<li>Leaving with a plan instead of an implemented, piloted change.</li>' +
      '<li>Excluding the operators, so the new process is rejected later.</li>' +
      '<li>Skipping the sustain plan, so the process drifts back within weeks.</li>' +
      '</ul>' +
      '<p>Run a rapid improvement that actually sticks. <a href="/l8">Run it in OrgTP</a> and keep the charter, future state, and sustain actions tracked.</p>',
    downloadMarkdown:
      '# Kaizen Event Template\n\n' +
      'Purpose: Run a focused multi-day rapid improvement event that maps the current state, redesigns the process, implements the change live, and standardizes the gains.\n\n' +
      '- Duration: Multi-day event (3 to 5 days; about 2400 minutes of working time)\n' +
      '- Cadence: As needed\n' +
      '- Participants: Cross-functional improvement team and process operators (5-10 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Charter and current-state map (Day 1)\n' +
      '- [ ] Analyze waste and root cause (Day 1 to 2)\n' +
      '- [ ] Design the future state (Day 2 to 3)\n' +
      '- [ ] Implement and pilot the new process (Day 3 to 4)\n' +
      '- [ ] Standardize the new standard work (Day 4)\n' +
      '- [ ] Report out and confirm sustain plan (Day 5)\n\n' +
      '## Facilitator tips\n\n' +
      '- Charter a tight scope; solve one process.\n' +
      '- Implement inside the event, not as a later list.\n' +
      '- Keep the operators central to the redesign.\n' +
      '- Standardize and build visual controls to hold gains.\n\n' +
      '## Notes\n\n' +
      'Charter and goal:\n\n' +
      'Current-state waste and root causes:\n\n' +
      'Future-state design:\n\n' +
      'Results and sustain actions:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/kaizen-event\n',
  },
  {
    slug: 'a3-problem-solving-review',
    title: 'A3 Problem-Solving Review Template',
    shortName: 'A3 Problem-Solving Review',
    description:
      'Use this A3 problem solving template to review a one-page report through PDCA: background, current state, root cause, countermeasures, and follow-up actions.',
    category: 'hoshin',
    methodology: 'Hoshin Kanri / Lean',
    minutes: 60,
    cadence: 'As needed',
    participants: 'A3 owner, coach, and stakeholders (3-8 people)',
    keywords: [
      'a3 problem solving template',
      'a3 report review template',
      'a3 thinking meeting agenda',
      'lean a3 template',
      'toyota a3 problem solving',
      'a3 root cause review',
      'a3 coaching session',
    ],
    steps: [
      { name: 'Background and problem statement', minutes: 10, text: 'The owner presents the background, the business context, and a clear statement of the problem the A3 addresses.' },
      { name: 'Current condition and goal', minutes: 10, text: 'Review the current condition with data and the measurable goal or target condition the A3 aims to reach.' },
      { name: 'Root cause analysis', minutes: 15, text: 'Walk the analysis: the five whys or other technique that traces the problem to its root cause rather than symptoms.' },
      { name: 'Countermeasures', minutes: 10, text: 'Review the proposed countermeasures and confirm each addresses a root cause and is feasible.' },
      { name: 'Plan, check, and follow-up', minutes: 10, text: 'Confirm the implementation plan, how results will be checked, and the follow-up actions to verify the problem is solved.' },
      { name: 'Coaching and questions', minutes: 5, text: 'The coach asks questions to deepen the owner thinking rather than supply answers, strengthening the A3 logic.' },
    ],
    bodyHtml:
      '<p>An <strong>A3 problem-solving review</strong> walks a team through a single sheet of paper that tells the whole story of a problem and its solution. Named for the paper size, the A3 is a cornerstone of Lean thinking: it forces clear, structured reasoning through the plan-do-check-act cycle and turns problem-solving into a teachable discipline rather than a scramble.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Use an A3 review for any problem important enough to warrant rigorous root cause thinking, from a quality defect to a missed Hoshin target. The review happens as the A3 develops and again when results come in. It doubles as a coaching tool, since the questions a reviewer asks teach the owner how to think.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Keep it small: the A3 owner, a coach or mentor, and the few stakeholders who understand the problem or own part of the solution. Three to eight people is plenty. The owner drives the A3; everyone else sharpens it through questions.</p>' +
      '<h2>How to run it</h2>' +
      '<p>The owner walks the A3 in order: background and problem statement, current condition with data, the goal, and the root cause analysis. Spend real time on root cause, since countermeasures aimed at symptoms always fail. Review the countermeasures, the implementation plan, and how results will be checked and followed up. Throughout, the coach asks questions rather than giving answers, because the value of A3 is the thinking it develops, not just the document it produces.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Keep the whole story on one page; force clarity over volume.</li>' +
      '<li>Push the analysis to a true root cause, not the first plausible cause.</li>' +
      '<li>Coach with questions so the owner builds the reasoning.</li>' +
      '<li>Confirm how results get checked, since an A3 is not done at implementation.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Jumping to countermeasures before the root cause is understood.</li>' +
      '<li>Treating the A3 as paperwork rather than a thinking process.</li>' +
      '<li>The coach supplying answers, which short-circuits the learning.</li>' +
      '<li>Skipping the check step, so no one verifies the problem was solved.</li>' +
      '</ul>' +
      '<p>Build problem-solving as a discipline. <a href="/l8">Run it in OrgTP</a> and keep each A3 problem, root cause, and countermeasure tracked to closure.</p>',
    downloadMarkdown:
      '# A3 Problem-Solving Review Template\n\n' +
      'Purpose: Review a one-page A3 through the PDCA cycle, from background and root cause to countermeasures and follow-up, while coaching the owner thinking.\n\n' +
      '- Duration: 60 minutes\n' +
      '- Cadence: As needed\n' +
      '- Participants: A3 owner, coach, and stakeholders (3-8 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Background and problem statement (10 min)\n' +
      '- [ ] Current condition and goal (10 min)\n' +
      '- [ ] Root cause analysis, five whys (15 min)\n' +
      '- [ ] Countermeasures (10 min)\n' +
      '- [ ] Plan, check, and follow-up (10 min)\n' +
      '- [ ] Coaching questions (5 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Keep the whole story on one page.\n' +
      '- Push to a true root cause, not the first cause.\n' +
      '- Coach with questions so the owner builds the reasoning.\n' +
      '- Confirm how results get checked.\n\n' +
      '## Notes\n\n' +
      'Problem statement:\n\n' +
      'Root cause:\n\n' +
      'Countermeasures:\n\n' +
      'Check and follow-up actions:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/a3-problem-solving-review\n',
    guideHtml: `<h2>The Ultimate A3 Problem-Solving Review Template &amp; Guide</h2>
<p>In Lean manufacturing and continuous improvement frameworks (pioneered by Toyota), the A3 process is the gold standard for structured problem-solving. The name comes from the international A3 paper size - because the core philosophy of the framework is that the complete story of a problem, its analysis, and its solution must fit on a single sheet of paper.</p>
<p>If your team struggles with disorganized problem-solving, jumps to conclusions without analyzing data, or fails to document lessons learned, implementing the A3 process will transform your operational discipline.</p>
<p>This comprehensive guide provides a battle-tested A3 Problem-Solving Template and a step-by-step review agenda to help your team analyze root causes, implement countermeasures, and foster a culture of continuous learning.</p>
<h2>What is an A3 Problem-Solving Review?</h2>
<p>An A3 Problem-Solving Review is a structured, 60-minute collaborative session where a problem owner presents their A3 report to a coach, leadership team, or key stakeholders.</p>
<p>Rather than a formal presentation, the A3 review is a <strong>coaching and alignment session</strong>. It follows the classic Plan-Do-Check-Act (PDCA) cycle to ensure the team is solving the right problem, using data-driven analysis, and implementing sustainable countermeasures.</p>
<h3>The Six Key Sections of an A3 Report:</h3>
<ol>
<li><strong>Background &amp; Problem Statement:</strong> Define the business context and clearly state the problem and its impact.</li>
<li><strong>Current Condition &amp; Goal:</strong> Document the current state with data and set a specific, measurable target.</li>
<li><strong>Root Cause Analysis:</strong> Use tools like the "Five Whys" or Fishbone diagrams to identify the underlying cause.</li>
<li><strong>Countermeasures:</strong> Propose and validate solutions that directly address the root cause.</li>
<li><strong>Plan, Check, &amp; Follow-Up:</strong> Detail the implementation timeline, how results will be measured, and follow-up actions.</li>
<li><strong>Coaching &amp; Questions:</strong> Document feedback and lessons learned during the review session.</li>
</ol>
<h2>The Standard 60-Minute A3 Review Agenda</h2>
<p>To ensure a rigorous, data-driven discussion that focuses on coaching and root-cause thinking, we recommend a structured 60-minute agenda:</p>
<table class="td-guide-table">
<thead><tr><th>Time</th><th>Agenda Item</th><th>Objective</th></tr></thead>
<tbody>
<tr><td><strong>00:00 - 00:10</strong></td><td><strong>Background &amp; Problem Statement</strong></td><td>The owner presents the business context and defines the specific problem being addressed.</td></tr>
<tr><td><strong>00:10 - 00:20</strong></td><td><strong>Current Condition &amp; Goal</strong></td><td>Review the data representing the current state and align on the measurable target.</td></tr>
<tr><td><strong>00:20 - 00:35</strong></td><td><strong>Root Cause Analysis</strong></td><td>Deep-dive into the analysis (e.g., Five Whys). Verify that the analysis is based on facts, not assumptions.</td></tr>
<tr><td><strong>00:35 - 00:45</strong></td><td><strong>Countermeasures Evaluation</strong></td><td>Review the proposed solutions and verify that they directly address the identified root causes.</td></tr>
<tr><td><strong>00:45 - 00:55</strong></td><td><strong>Implementation &amp; Check Plan</strong></td><td>Review the action plan, timeline, and the mechanism for measuring results (the "Check" phase of PDCA).</td></tr>
<tr><td><strong>00:55 - 01:00</strong></td><td><strong>Coaching Feedback &amp; Close</strong></td><td>The coach or stakeholders provide feedback, document lessons learned, and approve the next steps.</td></tr>
</tbody>
</table>
<h2>Best Practices for the A3 Process</h2>
<h3>1. Go to the Gemba (The Real Place)</h3>
<p>An A3 report cannot be written from an office or a conference room. The owner must go to the "Gemba" - the actual place where the work is done - to observe the process, gather data, and talk to the people executing the work. Facts on an A3 must be verified firsthand.</p>
<h3>2. Spend 80% of the Effort on Planning</h3>
<p>In the PDCA cycle, the "Plan" phase consists of the first four sections of the A3 (Background, Current Condition, Goal, and Root Cause Analysis). High-performing teams spend 80% of their time and effort on these sections. If you define the problem correctly and find the true root cause, the countermeasures are usually obvious.</p>
<h3>3. Use Visuals Over Text</h3>
<p>An effective A3 report uses charts, graphs, process maps, and diagrams instead of dense blocks of text. Anyone in the organization should be able to look at the A3 and understand the complete story of the problem and solution in under 5 minutes.</p>
<h2>Frequently Asked Questions (FAQs)</h2>
<h3>What is an A3 in Lean problem-solving?</h3>
<p>An A3 is a structured problem-solving tool and report format pioneered by Toyota. It fits the complete story of a problem, its analysis, countermeasures, and follow-up plan on a single sheet of A3-sized paper, following the Plan-Do-Check-Act (PDCA) cycle.</p>
<h3>What does Gemba mean in Lean?</h3>
<p>Gemba is a Japanese term meaning "the real place." In business and Lean manufacturing, it refers to the place where value is created (e.g., the factory floor, the customer support desk, or the software development environment) where problems should be observed firsthand.</p>
<h3>How does the PDCA cycle map to an A3?</h3>
<p>The PDCA (Plan-Do-Check-Act) cycle maps perfectly to the A3: Sections 1-4 represent "Plan" (defining the problem and root cause), Section 5 represents "Do" (implementing countermeasures) and "Check" (measuring results), and Section 6 represents "Act" (standardizing the solution and sharing lessons).</p>
<h3>Who should write and review an A3?</h3>
<p>The A3 is written by the individual closest to the problem (the owner) and reviewed in a collaborative session with a coach (manager or Lean specialist) and key stakeholders who are impacted by the process.</p>`,
    faq: [
      {
            "q": "What is an A3 in Lean problem-solving?",
            "a": "An A3 is a structured problem-solving tool and report format pioneered by Toyota. It fits the complete story of a problem, its analysis, countermeasures, and follow-up plan on a single sheet of A3-sized paper, following the Plan-Do-Check-Act (PDCA) cycle."
      },
      {
            "q": "What does Gemba mean in Lean?",
            "a": "Gemba is a Japanese term meaning \"the real place.\" In business and Lean manufacturing, it refers to the place where value is created (e.g., the factory floor, the customer support desk, or the software development environment) where problems should be observed firsthand."
      },
      {
            "q": "How does the PDCA cycle map to an A3?",
            "a": "The PDCA (Plan-Do-Check-Act) cycle maps perfectly to the A3: Sections 1-4 represent \"Plan\" (defining the problem and root cause), Section 5 represents \"Do\" (implementing countermeasures) and \"Check\" (measuring results), and Section 6 represents \"Act\" (standardizing the solution and sharing lessons)."
      },
      {
            "q": "Who should write and review an A3?",
            "a": "The A3 is written by the individual closest to the problem (the owner) and reviewed in a collaborative session with a coach (manager or Lean specialist) and key stakeholders who are impacted by the process."
      }
],
  },
  {
    slug: 'lean-daily-huddle',
    title: 'Lean Daily Management Huddle Template',
    shortName: 'Lean Daily Management Huddle',
    description:
      'Use this lean daily huddle template to run a fast standing meeting at the board, review yesterday against plan, surface issues, and align the team for the day.',
    category: 'hoshin',
    methodology: 'Hoshin Kanri / Lean',
    minutes: 15,
    cadence: 'Daily',
    participants: 'Team and team lead at the board (4-12 people)',
    keywords: [
      'lean daily huddle template',
      'daily management huddle agenda',
      'lean daily meeting template',
      'tiered huddle template',
      'visual management board meeting',
      'daily standup lean template',
      'shop floor huddle agenda',
    ],
    steps: [
      { name: 'Safety and people check', minutes: 2, text: 'Open at the board with any safety items and a quick check that the team has who and what it needs for the day.' },
      { name: 'Yesterday vs plan', minutes: 4, text: 'Review yesterday key metrics against plan on the visual board, marking what hit and what missed.' },
      { name: 'Today plan and constraints', minutes: 4, text: 'Confirm today plan and surface any constraints, shortages, or risks that could stop the team from hitting it.' },
      { name: 'Issues and quick wins', minutes: 3, text: 'Raise new issues; resolve the quick ones on the spot and park the rest on the board for follow-up.' },
      { name: 'Escalate and assign', minutes: 2, text: 'Escalate anything the team cannot solve to the next tier and confirm who owns each parked item.' },
    ],
    bodyHtml:
      '<p>The <strong>lean daily management huddle</strong> is a short, standing meeting held at a visual board where a team aligns for the day. Rooted in Lean daily management and the tiered huddle systems of the Toyota Production System, it keeps performance visible, surfaces problems early, and connects frontline work to the broader plan, all in ten to fifteen minutes.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run it every working day, at the same time and the same board, so it becomes an unshakeable habit. In larger organizations these huddles tier upward: frontline teams huddle first, then leads carry escalations to a higher-tier huddle, so issues travel to where they can be solved within the day.</p>' +
      '<h2>Who attends</h2>' +
      '<p>The full team plus the team lead, gathered at the board, four to twelve people. Everyone stands to keep it fast. This is the team own meeting to run the day, not a status report for absent managers.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Open with safety and a quick people check, then review yesterday against plan using the visual board so status is seen, not described. Confirm today plan and surface constraints before they bite. Raise issues, solve the quick ones immediately, and park the rest with an owner. Anything the team cannot resolve gets escalated to the next tier. The whole point is speed and visibility: a daily rhythm that catches problems while they are still small.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Keep it standing and keep it to fifteen minutes, every day.</li>' +
      '<li>Let the visual board carry the data so talk stays short.</li>' +
      '<li>Solve quick issues live; park deeper ones rather than debating them.</li>' +
      '<li>Escalate cleanly to the next tier when the team cannot resolve an issue.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Letting the huddle sprawl into a sit-down problem-solving meeting.</li>' +
      '<li>Reporting status the board already shows instead of acting on it.</li>' +
      '<li>Raising issues with no owner, so they linger on the board for weeks.</li>' +
      '<li>Failing to escalate, so frontline problems never reach a fix.</li>' +
      '</ul>' +
      '<p>Run a tight daily rhythm. <a href="/l8">Run it in OrgTP</a> and keep the board, issues, and escalations visible across every tier.</p>',
    downloadMarkdown:
      '# Lean Daily Management Huddle Template\n\n' +
      'Purpose: Run a fast standing huddle at the visual board to review yesterday against plan, confirm today plan, surface issues, and escalate what the team cannot solve.\n\n' +
      '- Duration: 15 minutes (10 to 15 minutes)\n' +
      '- Cadence: Daily\n' +
      '- Participants: Team and team lead at the board (4-12 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Safety and people check (2 min)\n' +
      '- [ ] Yesterday vs plan on the board (4 min)\n' +
      '- [ ] Today plan and constraints (4 min)\n' +
      '- [ ] Issues and quick wins (3 min)\n' +
      '- [ ] Escalate and assign owners (2 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Keep it standing and under 15 minutes.\n' +
      '- Let the visual board carry the data.\n' +
      '- Solve quick issues live; park the deeper ones.\n' +
      '- Escalate cleanly to the next tier.\n\n' +
      '## Notes\n\n' +
      'Yesterday vs plan:\n\n' +
      'Today constraints:\n\n' +
      'Parked issues and owners:\n\n' +
      'Escalations:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/lean-daily-huddle\n',
  },
  {
    slug: 'hansei-reflection-meeting',
    title: 'Hansei Reflection Meeting Template',
    shortName: 'Hansei Reflection Meeting',
    description:
      'Use this hansei reflection template to look back honestly on a project or cycle, acknowledge shortcomings, draw lessons, and commit to concrete improvements.',
    category: 'hoshin',
    methodology: 'Hoshin Kanri / Lean',
    minutes: 60,
    cadence: 'As needed',
    participants: 'Project or cycle team (4-10 people)',
    keywords: [
      'hansei reflection template',
      'hansei meeting agenda',
      'lean reflection meeting template',
      'project reflection template',
      'continuous improvement reflection',
      'lessons learned hansei',
      'toyota hansei template',
    ],
    steps: [
      { name: 'Frame the reflection', minutes: 5, text: 'Set the scope and the spirit of hansei: honest reflection aimed at learning and improvement, never at assigning blame.' },
      { name: 'Revisit goals and outcomes', minutes: 10, text: 'Compare what the team set out to achieve against what actually happened, with the facts on the table.' },
      { name: 'Acknowledge shortcomings', minutes: 20, text: 'Name the gaps and shortcomings honestly, even where results were good, because hansei looks for what could have been better.' },
      { name: 'Draw out lessons', minutes: 15, text: 'Identify the underlying lessons and the changes in process or behavior they imply.' },
      { name: 'Commit to improvements', minutes: 10, text: 'Convert the most important lessons into concrete commitments for the next cycle, with owners.' },
    ],
    bodyHtml:
      '<p>A <strong>hansei reflection meeting</strong> is a structured, honest look back at a project or cycle. Hansei is a Japanese concept central to the Lean and Toyota culture: it means sincere self-reflection, acknowledging shortcomings openly even when results were good, and committing to improve. It is the cultural counterpart to continuous improvement, the moment a team turns experience into learning.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Hold a hansei at the close of a project, a quarter, or any significant effort worth learning from. Unlike a celebration, hansei deliberately surfaces what fell short, so it is most valuable precisely when things went well and the temptation is to move on without reflecting.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Include the team that lived the work, four to ten people. Psychological safety matters more here than anywhere: people must be able to name shortcomings, including their own, without fear. A leader who models self-reflection first sets the tone for an honest room.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Frame the spirit of hansei clearly: this is reflection for learning, not a search for someone to blame. Revisit goals against outcomes with the facts visible, then spend the core of the meeting acknowledging shortcomings honestly, even on a successful effort. Draw out the underlying lessons and the changes they imply, then commit the most important ones to the next cycle with owners. The discipline is to leave with genuine learning, not a polished story.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Set the tone that hansei is about learning, never blame.</li>' +
      '<li>Reflect honestly even when results were strong; that is the point.</li>' +
      '<li>Have the leader name their own shortcomings first.</li>' +
      '<li>Convert lessons into owned commitments, not just discussion.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Turning reflection into blame, which shuts down honesty instantly.</li>' +
      '<li>Skipping hansei when things went well, missing the easiest lessons.</li>' +
      '<li>Staying surface-level instead of acknowledging real shortcomings.</li>' +
      '<li>Reflecting without committing to any concrete improvement.</li>' +
      '</ul>' +
      '<p>Turn experience into improvement. <a href="/l8">Run it in OrgTP</a> and carry each hansei lesson and commitment into the next cycle.</p>',
    downloadMarkdown:
      '# Hansei Reflection Meeting Template\n\n' +
      'Purpose: Reflect honestly on a project or cycle, acknowledge shortcomings even when results were good, draw out the lessons, and commit to concrete improvements.\n\n' +
      '- Duration: 60 minutes\n' +
      '- Cadence: As needed (project or cycle close)\n' +
      '- Participants: Project or cycle team (4-10 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Frame the reflection and its spirit (5 min)\n' +
      '- [ ] Revisit goals and outcomes (10 min)\n' +
      '- [ ] Acknowledge shortcomings honestly (20 min)\n' +
      '- [ ] Draw out the lessons (15 min)\n' +
      '- [ ] Commit to improvements with owners (10 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Set the tone: learning, never blame.\n' +
      '- Reflect honestly even when results were strong.\n' +
      '- Have the leader name their own shortcomings first.\n' +
      '- Convert lessons into owned commitments.\n\n' +
      '## Notes\n\n' +
      'Goals vs outcomes:\n\n' +
      'Shortcomings acknowledged:\n\n' +
      'Lessons:\n\n' +
      'Commitments and owners:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/hansei-reflection-meeting\n',
  },
  {
    slug: 'pdca-review-meeting',
    title: 'PDCA Review Meeting Template',
    shortName: 'PDCA Review Meeting',
    description:
      'Use this PDCA meeting template to run a plan-do-check-act cycle: confirm the plan, review what was done, check results against target, and act on the learning.',
    category: 'hoshin',
    methodology: 'Hoshin Kanri / Lean',
    minutes: 60,
    cadence: 'Biweekly',
    participants: 'Improvement team and process owner (4-8 people)',
    keywords: [
      'pdca meeting template',
      'pdca review meeting agenda',
      'plan do check act template',
      'deming cycle meeting template',
      'continuous improvement cycle meeting',
      'pdca cycle review',
      'lean pdca template',
    ],
    steps: [
      { name: 'Recap the plan', minutes: 10, text: 'Restate the hypothesis, the target, and the plan set in the last cycle so the check is against an explicit prediction.' },
      { name: 'Review what was done', minutes: 10, text: 'Walk what was actually done versus planned, noting where execution differed and why.' },
      { name: 'Check results against target', minutes: 15, text: 'Compare actual results to the target with data, and judge whether the change moved the metric as predicted.' },
      { name: 'Analyze the gap', minutes: 10, text: 'Where results missed, analyze whether the plan, the execution, or the hypothesis itself was wrong.' },
      { name: 'Act: adopt, adjust, abandon', minutes: 10, text: 'Decide whether to standardize the change, adjust and run another cycle, or abandon the approach.' },
      { name: 'Set the next cycle', minutes: 5, text: 'Define the plan for the next PDCA cycle, with the new hypothesis, target, and owner.' },
    ],
    bodyHtml:
      '<p>A <strong>PDCA review meeting</strong> runs a team through one turn of the plan-do-check-act cycle, the engine of continuous improvement at the heart of Lean and the Toyota Production System. Also known as the Deming cycle, PDCA treats every improvement as an experiment: you plan a change, do it, check the result against what you predicted, and act on what you learned.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Use this whenever a team is running structured improvement cycles, often every week or two. PDCA suits process improvements, experiments, and any change where you want to learn deliberately rather than guess. The cadence matters less than the discipline of closing each loop before opening the next.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Keep it to the improvement team and the owner of the process being changed, four to eight people. These are the people who set the plan, did the work, and can judge the results honestly. A coach often joins to keep the thinking rigorous.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Recap the plan first, including the hypothesis and target, so the check is against an explicit prediction rather than a vague hope. Review what was actually done versus planned, then check results against target with data. Where there is a gap, analyze whether the plan, the execution, or the hypothesis was at fault. Then act: standardize a change that worked, adjust and rerun, or abandon an approach that did not. Close by defining the next cycle, because PDCA is a loop, not a one-time event.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Make the prediction explicit in the plan so check has meaning.</li>' +
      '<li>Check against data, not impressions of whether it felt better.</li>' +
      '<li>When results miss, separate a bad plan from bad execution.</li>' +
      '<li>Always close the loop by acting and setting the next cycle.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Planning and doing but never genuinely checking the result.</li>' +
      '<li>Checking against a target nobody made explicit up front.</li>' +
      '<li>Acting without learning, so the same cycle repeats.</li>' +
      '<li>Treating PDCA as a single pass instead of a continuous loop.</li>' +
      '</ul>' +
      '<p>Make improvement a deliberate loop. <a href="/l8">Run it in OrgTP</a> and keep each PDCA hypothesis, result, and next cycle connected.</p>',
    downloadMarkdown:
      '# PDCA Review Meeting Template\n\n' +
      'Purpose: Run one turn of the plan-do-check-act cycle by recapping the plan, reviewing what was done, checking results against target, and acting on the learning.\n\n' +
      '- Duration: 60 minutes\n' +
      '- Cadence: Biweekly\n' +
      '- Participants: Improvement team and process owner (4-8 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Recap the plan, hypothesis, and target (10 min)\n' +
      '- [ ] Review what was done vs planned (10 min)\n' +
      '- [ ] Check results against target with data (15 min)\n' +
      '- [ ] Analyze the gap (10 min)\n' +
      '- [ ] Act: adopt, adjust, or abandon (10 min)\n' +
      '- [ ] Set the next cycle (5 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Make the prediction explicit so check has meaning.\n' +
      '- Check against data, not impressions.\n' +
      '- Separate a bad plan from bad execution.\n' +
      '- Always close the loop and set the next cycle.\n\n' +
      '## Notes\n\n' +
      'Plan and hypothesis:\n\n' +
      'Results vs target:\n\n' +
      'Gap analysis:\n\n' +
      'Decision and next cycle:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/pdca-review-meeting\n',
  },
  {
    slug: 'value-stream-mapping-workshop',
    title: 'Value Stream Mapping Workshop Template',
    shortName: 'Value Stream Mapping Workshop',
    description:
      'Use this value stream mapping workshop template to map the current state, calculate flow and lead time, design a future state, and plan the path between them.',
    category: 'hoshin',
    methodology: 'Hoshin Kanri / Lean',
    minutes: 240,
    cadence: 'As needed',
    participants: 'Cross-functional value-stream team (5-10 people)',
    keywords: [
      'value stream mapping workshop',
      'value stream mapping template',
      'vsm workshop agenda',
      'current state map template',
      'future state map template',
      'lean value stream template',
      'process flow mapping workshop',
    ],
    steps: [
      { name: 'Scope the value stream', minutes: 20, text: 'Pick one product family or service and define the start and end points of the value stream to be mapped.' },
      { name: 'Map the current state', minutes: 70, text: 'Walk the process and map the current state: steps, information flows, inventory, and the data for each step.' },
      { name: 'Calculate flow metrics', minutes: 30, text: 'Calculate lead time, process time, and the ratio between them to expose how much of the stream is waiting versus working.' },
      { name: 'Identify waste and constraints', minutes: 40, text: 'Mark the waste, delays, and constraints across the current-state map, focusing on what blocks flow.' },
      { name: 'Design the future state', minutes: 60, text: 'Design a future-state map that improves flow, reduces lead time, and removes the biggest sources of waste.' },
      { name: 'Build the transition plan', minutes: 20, text: 'Break the gap between current and future state into a sequenced plan of kaizen actions with owners.' },
    ],
    bodyHtml:
      '<p>A <strong>value stream mapping workshop</strong> makes the entire flow of a product or service visible, from request to delivery, so a team can see where value is created and where it stalls. Value stream mapping is a foundational Lean tool: by mapping the current state, calculating flow, and designing a future state, a team turns a vague sense that work is slow into a precise, shared picture of why.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run a value stream mapping workshop when lead times are too long, handoffs are messy, or a process spans many functions and nobody owns the whole. It is the right starting point before a series of kaizen events, because the future-state map tells you which improvements matter most and in what order.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Assemble a cross-functional team of five to ten people who together touch the whole value stream, including the people who do each step. No single function can map an end-to-end flow accurately, and the people closest to the work catch the realities a diagram from a conference room would miss.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Scope one value stream so the map stays manageable, then build the current state by walking the actual process, not from memory. Calculate lead time against process time to expose how much of the stream is pure waiting. Mark the waste and constraints, then design a future state that improves flow and removes the biggest delays. Finish by turning the gap between current and future into a sequenced transition plan of kaizen actions with owners. The map is only valuable if it drives change.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Map the real current state by walking it, not the idealized version.</li>' +
      '<li>Capture lead time and process time; the gap is where the waste hides.</li>' +
      '<li>Keep the future state ambitious but achievable within a planning horizon.</li>' +
      '<li>End with a sequenced action plan, not just two pretty maps.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Mapping how the process should work instead of how it actually does.</li>' +
      '<li>Scoping the value stream so broadly the map becomes unreadable.</li>' +
      '<li>Producing a future-state map with no plan to reach it.</li>' +
      '<li>Mapping without the people who actually run each step.</li>' +
      '</ul>' +
      '<p>See the whole flow and fix it. <a href="/l8">Run it in OrgTP</a> and turn the current-state and future-state maps into a tracked improvement plan.</p>',
    downloadMarkdown:
      '# Value Stream Mapping Workshop Template\n\n' +
      'Purpose: Map the current state of a value stream, calculate flow and lead time, design an improved future state, and plan the kaizen actions to get there.\n\n' +
      '- Duration: 240 minutes\n' +
      '- Cadence: As needed\n' +
      '- Participants: Cross-functional value-stream team (5-10 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Scope one value stream (20 min)\n' +
      '- [ ] Map the current state (70 min)\n' +
      '- [ ] Calculate lead time and process time (30 min)\n' +
      '- [ ] Identify waste and constraints (40 min)\n' +
      '- [ ] Design the future state (60 min)\n' +
      '- [ ] Build the transition plan (20 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Map the real current state by walking it.\n' +
      '- Capture lead time vs process time; the gap is the waste.\n' +
      '- Keep the future state ambitious but achievable.\n' +
      '- End with a sequenced action plan, not just two maps.\n\n' +
      '## Notes\n\n' +
      'Current-state observations:\n\n' +
      'Lead time and process time:\n\n' +
      'Future-state design:\n\n' +
      'Transition plan and owners:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/value-stream-mapping-workshop\n',
  },
  {
    slug: 'hoshin-quarterly-review',
    title: 'Hoshin Quarterly Review Template',
    shortName: 'Hoshin Quarterly Review',
    description:
      'Use this Hoshin quarterly review template to assess breakthrough objectives, review countermeasures, adjust the deployment plan, and realign owners for next quarter.',
    category: 'hoshin',
    methodology: 'Hoshin Kanri / Lean',
    minutes: 120,
    cadence: 'Quarterly',
    participants: 'Leadership team and priority owners (6-15 people)',
    keywords: [
      'hoshin quarterly review',
      'hoshin kanri quarterly review template',
      'policy deployment quarterly review',
      'strategy deployment review agenda',
      'quarterly hoshin meeting',
      'breakthrough objective review template',
      'hoshin reflection and adjust meeting',
    ],
    steps: [
      { name: 'Reconnect to true north', minutes: 10, text: 'Restate the breakthrough objectives and true north so the quarter review judges progress against the real destination.' },
      { name: 'Review breakthrough progress', minutes: 30, text: 'Assess each breakthrough objective and its annual targets against the quarter result, using the bowling chart trend.' },
      { name: 'Countermeasure effectiveness', minutes: 25, text: 'Review whether the countermeasures launched in monthly reviews actually closed the gaps, and which need to change.' },
      { name: 'Reflect and learn', minutes: 20, text: 'Run a hansei-style reflection on what the quarter taught the team about the plan and the process of deploying it.' },
      { name: 'Adjust the deployment plan', minutes: 25, text: 'Adjust targets, priorities, and resource allocation for the coming quarter based on what the data and reflection revealed.' },
      { name: 'Realign owners and rhythm', minutes: 10, text: 'Confirm owners for the adjusted plan and the monthly review rhythm for the next quarter.' },
    ],
    bodyHtml:
      '<p>The <strong>Hoshin quarterly review</strong> is the reflection-and-adjust checkpoint of strategy deployment. Where the monthly review keeps targets on pace, the quarterly review steps back to ask harder questions: are the breakthrough objectives still right, are the countermeasures working, and what is the year teaching us? It is where the plan-do-check-act cycle operates at the level of the whole Hoshin plan.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run this at the end of each quarter, building on the bowling chart trends from the monthly reviews. It is the moment to adjust the deployment plan with intention rather than letting it drift, and to feed the lessons of one quarter into the discipline of the next.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Bring the leadership team and the owners of the annual priorities, six to fifteen people. These are the people who can judge progress honestly, evaluate countermeasures, and authorize the changes in targets or resources that a real adjustment requires.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Reconnect to true north and the breakthrough objectives, then review progress against each one using the quarter trend rather than a single month. Examine whether the countermeasures launched along the way actually worked, and run an honest hansei-style reflection on what the quarter revealed about both the plan and the way it is being deployed. Use those insights to adjust targets, priorities, and resources for the coming quarter, then realign owners and confirm the monthly rhythm. The review closes one loop and opens the next.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Judge progress on the quarter trend, not a single month spike or dip.</li>' +
      '<li>Evaluate countermeasures honestly; keep what worked, change what did not.</li>' +
      '<li>Make space for real reflection, not just a status recap.</li>' +
      '<li>Adjust the plan deliberately rather than letting it quietly drift.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Reviewing numbers without adjusting the plan they reveal as wrong.</li>' +
      '<li>Declaring countermeasures successful without checking they closed the gap.</li>' +
      '<li>Skipping reflection, so the same deployment mistakes repeat.</li>' +
      '<li>Adjusting targets but never realigning owners or rhythm.</li>' +
      '</ul>' +
      '<p>Reflect, adjust, and keep deploying. <a href="/l8">Run it in OrgTP</a> and keep breakthrough objectives, countermeasures, and owners aligned quarter over quarter.</p>',
    downloadMarkdown:
      '# Hoshin Quarterly Review Template\n\n' +
      'Purpose: Assess breakthrough objectives against the quarter, evaluate countermeasures, reflect on what was learned, and adjust the deployment plan for next quarter.\n\n' +
      '- Duration: 120 minutes\n' +
      '- Cadence: Quarterly\n' +
      '- Participants: Leadership team and priority owners (6-15 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Reconnect to true north and breakthroughs (10 min)\n' +
      '- [ ] Review breakthrough progress on the trend (30 min)\n' +
      '- [ ] Countermeasure effectiveness (25 min)\n' +
      '- [ ] Reflect and learn, hansei style (20 min)\n' +
      '- [ ] Adjust the deployment plan (25 min)\n' +
      '- [ ] Realign owners and rhythm (10 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Judge progress on the quarter trend, not one month.\n' +
      '- Evaluate countermeasures honestly.\n' +
      '- Make space for real reflection.\n' +
      '- Adjust the plan deliberately, not by drift.\n\n' +
      '## Notes\n\n' +
      'Breakthrough progress:\n\n' +
      'Countermeasure effectiveness:\n\n' +
      'Lessons learned:\n\n' +
      'Plan adjustments, owners, and rhythm:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/hoshin-quarterly-review\n',
  },
];
