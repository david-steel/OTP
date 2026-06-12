// V2MOM and OGSM meeting templates for the /templates library.
// AUTHORED content. bodyHtml renders via <%- %>. Byte-stable: no Date.now,
// no randomness. See _types.ts for the shared contract.

import type { MeetingTemplate } from './_types.js';

export const V2MOM_OGSM_TEMPLATES: MeetingTemplate[] = [
  {
    slug: 'v2mom-creation-workshop',
    title: 'V2MOM Creation Workshop Template',
    shortName: 'V2MOM Creation Workshop',
    description:
      'Use this V2MOM template to build a Vision, Values, Methods, Obstacles, and Measures plan from scratch and align your team around one page of clear direction.',
    category: 'v2mom-ogsm',
    methodology: 'V2MOM / OGSM',
    minutes: 180,
    cadence: 'Annually',
    participants: 'Leadership team and key contributors (5-12 people)',
    keywords: [
      'v2mom template',
      'v2mom workshop agenda',
      'v2mom creation template',
      'salesforce v2mom',
      'vision values methods obstacles measures',
      'v2mom planning meeting',
      'team alignment workshop template',
      'one page plan template',
    ],
    steps: [
      { name: 'Frame the V2MOM', minutes: 20, text: 'Explain the five elements and the scope of this V2MOM: the whole company, a team, or an individual. Agree the time horizon it covers.' },
      { name: 'Vision', minutes: 30, text: 'Draft a short, vivid statement of what you want to achieve. Keep it to a sentence or two that anyone could repeat.' },
      { name: 'Values', minutes: 30, text: 'List the principles and beliefs that guide how you pursue the vision, ranked so trade-offs are clear when priorities collide.' },
      { name: 'Methods', minutes: 40, text: 'Define the prioritized actions and steps you will take to reach the vision. Order them so the most important work comes first.' },
      { name: 'Obstacles', minutes: 30, text: 'Name the challenges, risks, and issues that could block the methods, and note who owns mitigating each one.' },
      { name: 'Measures', minutes: 30, text: 'Set the measurable results that prove the vision is being achieved. Confirm each is numeric, time-bound, and owned.' },
    ],
    bodyHtml:
      '<p>The <strong>V2MOM</strong> is a one-page alignment framework built around five elements: Vision, Values, Methods, Obstacles, and Measures. Originally developed at Salesforce by Marc Benioff, it forces a team to answer what it wants, why, how, what stands in the way, and how success will be measured. This <em>V2MOM template</em> walks all five in a single working session.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run this workshop when you are creating a V2MOM for the first time, starting a new fiscal year, launching a new team, or resetting after a major strategy shift. It is the foundational session that every later V2MOM review and check-in builds on.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Keep the room to the leadership team plus the key contributors who will own methods and measures. Five to twelve people is the sweet spot. Larger groups slow the ranking work that makes a V2MOM useful, so cascade team-level V2MOMs in follow-up sessions.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Frame the five elements first so everyone shares the vocabulary, then work them in order. Draft a vision anyone can repeat, rank the values so trade-offs are settled in advance, and prioritize the methods rather than listing everything. Name the obstacles honestly, since unspoken risks are the ones that derail the plan. Close on measures that are numeric and owned. The power of the V2MOM is the ranking: when methods and values are ordered, day-to-day decisions get easier.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Rank values and methods rather than leaving them as flat lists. The order is where the alignment lives.</li>' +
      '<li>Keep the vision to one or two sentences anyone in the company could repeat.</li>' +
      '<li>Insist on honesty in the obstacles section. A V2MOM with no obstacles is not finished.</li>' +
      '<li>Write measures as numbers with owners, not aspirations.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Listing methods without ranking them, so everything feels equally urgent.</li>' +
      '<li>Writing a vague vision that no one can recall a week later.</li>' +
      '<li>Skipping obstacles to keep the mood positive, which hides real risk.</li>' +
      '<li>Setting measures with no number or no owner, so progress cannot be tracked.</li>' +
      '</ul>' +
      '<p>Ready to put your V2MOM to work? <a href="/l8">Run it in OrgTP</a> and keep your vision, methods, and measures visible to the whole team every week.</p>',
    downloadMarkdown:
      '# V2MOM Creation Workshop Template\n\n' +
      'Purpose: Build a complete V2MOM (Vision, Values, Methods, Obstacles, Measures) from scratch and align the team around one page of clear, ranked direction.\n\n' +
      '- Duration: 180 minutes\n' +
      '- Cadence: Annually (or at major resets)\n' +
      '- Participants: Leadership team and key contributors (5-12 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Frame the V2MOM and set scope (20 min)\n' +
      '- [ ] Vision: what you want to achieve (30 min)\n' +
      '- [ ] Values: ranked guiding principles (30 min)\n' +
      '- [ ] Methods: prioritized actions (40 min)\n' +
      '- [ ] Obstacles: risks and owners (30 min)\n' +
      '- [ ] Measures: numeric, time-bound results (30 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Rank values and methods; the order is the alignment.\n' +
      '- Keep the vision to one or two repeatable sentences.\n' +
      '- Require honesty in the obstacles section.\n' +
      '- Write measures as numbers with owners.\n\n' +
      '## Notes\n\n' +
      'Vision:\n\n' +
      'Values:\n\n' +
      'Methods:\n\n' +
      'Obstacles:\n\n' +
      'Measures:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/v2mom-creation-workshop\n',
  },
  {
    slug: 'v2mom-alignment-meeting',
    title: 'V2MOM Alignment Meeting Template',
    shortName: 'V2MOM Alignment Meeting',
    description:
      'Use this V2MOM alignment template to roll a finished V2MOM out to the team, confirm shared understanding, and connect every method and measure to an owner.',
    category: 'v2mom-ogsm',
    methodology: 'V2MOM / OGSM',
    minutes: 90,
    cadence: 'As needed',
    participants: 'Team and method owners (5-15 people)',
    keywords: [
      'v2mom alignment template',
      'v2mom meeting agenda',
      'v2mom rollout meeting',
      'salesforce v2mom',
      'team alignment meeting template',
      'v2mom cascade meeting',
      'vision values methods obstacles measures',
    ],
    steps: [
      { name: 'Why this V2MOM exists', minutes: 10, text: 'Open with the purpose of the V2MOM and how it connects to the wider company direction so the room shares context.' },
      { name: 'Walk the vision and values', minutes: 15, text: 'Present the vision and ranked values, then check that the team can restate them in their own words.' },
      { name: 'Walk the methods', minutes: 25, text: 'Review each prioritized method, confirm it is understood, and surface any reactions or gaps from the people who will execute.' },
      { name: 'Confirm obstacles', minutes: 15, text: 'Discuss the named obstacles, add any the team sees that leadership missed, and agree mitigation owners.' },
      { name: 'Confirm measures and owners', minutes: 15, text: 'Walk each measure, assign a single owner, and confirm how and when progress will be reported.' },
      { name: 'Questions and commitment', minutes: 10, text: 'Open the floor for questions, resolve confusion, and secure explicit commitment from each owner before closing.' },
    ],
    bodyHtml:
      '<p>The <strong>V2MOM alignment meeting</strong> is where a finished V2MOM stops being a leadership document and becomes a shared plan. Writing the V2MOM creates clarity at the top; this meeting spreads that clarity to everyone who has to act on it. This <em>V2MOM template</em> focuses on understanding and ownership, not editing.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run it right after a V2MOM is created or significantly updated. Use it to roll the plan out to a team, onboard new members into an existing V2MOM, or re-anchor a group that has drifted from the agreed direction.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Bring the team that will execute the V2MOM plus the owners of its methods and measures. Five to fifteen people works well. This is a working alignment session, so keep it to people who will actually act on the plan rather than a broad audience.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Start with why the V2MOM exists, then walk the vision and ranked values and check that the team can restate them. Move through the methods in priority order, inviting reactions from the people who will execute, since their input surfaces gaps leadership missed. Confirm the obstacles, add any new ones, and assign mitigation owners. Close by walking each measure, naming a single owner, and securing explicit commitment. The goal is a room that leaves with one shared picture.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Have the team restate the vision in their own words to test real understanding.</li>' +
      '<li>Invite the executors to challenge the methods now, not after work begins.</li>' +
      '<li>Assign a single owner per method and measure before anyone leaves.</li>' +
      '<li>Treat this as alignment, not a rewrite. Capture edits separately.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Presenting the V2MOM and assuming silence means understanding.</li>' +
      '<li>Skipping the executors input, so blind spots stay hidden.</li>' +
      '<li>Leaving methods and measures without clearly named owners.</li>' +
      '<li>Letting the meeting drift into rewriting the whole plan.</li>' +
      '</ul>' +
      '<p>Make alignment stick after the meeting. <a href="/l8">Run it in OrgTP</a> and keep the V2MOM, owners, and measures visible to everyone who acts on them.</p>',
    downloadMarkdown:
      '# V2MOM Alignment Meeting Template\n\n' +
      'Purpose: Roll a finished V2MOM out to the team, confirm shared understanding of the vision and methods, and connect every method and measure to an owner.\n\n' +
      '- Duration: 90 minutes\n' +
      '- Cadence: As needed (after creation or major updates)\n' +
      '- Participants: Team and method owners (5-15 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Why this V2MOM exists (10 min)\n' +
      '- [ ] Walk the vision and ranked values (15 min)\n' +
      '- [ ] Walk the prioritized methods (25 min)\n' +
      '- [ ] Confirm obstacles and mitigation owners (15 min)\n' +
      '- [ ] Confirm measures and owners (15 min)\n' +
      '- [ ] Questions and commitment (10 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Have the team restate the vision in their own words.\n' +
      '- Invite executors to challenge methods now, not later.\n' +
      '- Assign a single owner per method and measure.\n' +
      '- Keep it alignment, not a rewrite.\n\n' +
      '## Notes\n\n' +
      'Understanding checks:\n\n' +
      'New obstacles raised:\n\n' +
      'Method and measure owners:\n\n' +
      'Commitments:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/v2mom-alignment-meeting\n',
  },
  {
    slug: 'v2mom-quarterly-review',
    title: 'V2MOM Quarterly Review Template',
    shortName: 'V2MOM Quarterly Review',
    description:
      'Use this V2MOM quarterly review template to score measures, reassess methods and obstacles, and adjust the plan so your V2MOM stays alive across the year.',
    category: 'v2mom-ogsm',
    methodology: 'V2MOM / OGSM',
    minutes: 90,
    cadence: 'Quarterly',
    participants: 'Leadership team and method owners (5-12 people)',
    keywords: [
      'v2mom quarterly review template',
      'v2mom review meeting agenda',
      'v2mom progress review',
      'salesforce v2mom',
      'quarterly alignment review template',
      'v2mom measures review',
      'vision values methods obstacles measures',
    ],
    steps: [
      { name: 'Vision and values recap', minutes: 10, text: 'Restate the vision and ranked values to re-anchor the review before judging progress against them.' },
      { name: 'Score the measures', minutes: 25, text: 'Walk each measure, update the current number, and mark it on track, at risk, or off track against target.' },
      { name: 'Reassess the methods', minutes: 20, text: 'Review whether the prioritized methods are working, reorder them if priorities have shifted, and retire any that no longer serve the vision.' },
      { name: 'Revisit obstacles', minutes: 15, text: 'Check which obstacles materialized, which were cleared, and which new ones have appeared this quarter.' },
      { name: 'Adjust the plan', minutes: 15, text: 'Make explicit changes to methods, measures, and owners so the V2MOM reflects current reality.' },
      { name: 'Confirm next-quarter focus', minutes: 5, text: 'Agree the top priorities and check-in cadence for the coming quarter and confirm owners.' },
    ],
    bodyHtml:
      '<p>The <strong>V2MOM quarterly review</strong> keeps a V2MOM from becoming a document people wrote once and forgot. A V2MOM is meant to be living: vision and values stay stable, but methods, obstacles, and measures evolve as the quarter teaches you what is real. This <em>V2MOM template</em> structures that honest reassessment.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run it once a quarter, after the prior quarter is closed and the numbers behind your measures are trustworthy. It pairs with a lighter weekly or monthly check-in: the quarterly review is where you actually adjust the plan, not just report on it.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Bring the leadership team plus the owners of methods and measures, five to twelve people. These are the people who can speak to what moved, what stalled, and what needs to change. Keep it to people empowered to adjust the plan.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Re-anchor on the stable vision and values, then score every measure against target with a real number. Reassess the methods next: a method that is not moving a measure should be reordered or retired, not carried forward out of habit. Revisit obstacles to see which materialized and which are new. Then make the adjustments explicit, updating methods, measures, and owners. Close on a clear focus for the next quarter so the review produces a refreshed plan, not just a status recap.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Keep vision and values stable; this review changes methods and measures, not direction.</li>' +
      '<li>Demand a number for every measure rather than a narrative of effort.</li>' +
      '<li>Retire methods that are not moving a measure instead of accumulating them.</li>' +
      '<li>Capture every adjustment with an owner so the plan stays current.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Treating the review as a status meeting with no changes to the plan.</li>' +
      '<li>Rewriting the vision every quarter, which destroys continuity.</li>' +
      '<li>Carrying dead methods forward because removing them feels like failure.</li>' +
      '<li>Updating measures but never adjusting owners or cadence.</li>' +
      '</ul>' +
      '<p>Keep your V2MOM living all year. <a href="/l8">Run it in OrgTP</a> and track measures, methods, and owners quarter over quarter.</p>',
    downloadMarkdown:
      '# V2MOM Quarterly Review Template\n\n' +
      'Purpose: Score the measures, reassess methods and obstacles, and make explicit adjustments so the V2MOM stays a living plan across the year.\n\n' +
      '- Duration: 90 minutes\n' +
      '- Cadence: Quarterly\n' +
      '- Participants: Leadership team and method owners (5-12 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Vision and values recap (10 min)\n' +
      '- [ ] Score the measures against target (25 min)\n' +
      '- [ ] Reassess and reorder the methods (20 min)\n' +
      '- [ ] Revisit obstacles, old and new (15 min)\n' +
      '- [ ] Adjust the plan with owners (15 min)\n' +
      '- [ ] Confirm next-quarter focus (5 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Keep vision and values stable; change methods and measures.\n' +
      '- Require a number for every measure.\n' +
      '- Retire methods that are not moving a measure.\n' +
      '- Capture every adjustment with an owner.\n\n' +
      '## Notes\n\n' +
      'Measure scores:\n\n' +
      'Method changes:\n\n' +
      'Obstacles, old and new:\n\n' +
      'Next-quarter focus and owners:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/v2mom-quarterly-review\n',
  },
  {
    slug: 'v2mom-one-on-one',
    title: 'V2MOM 1:1 Alignment Check-in Template',
    shortName: 'V2MOM 1:1 Alignment Check-in',
    description:
      'Use this V2MOM 1:1 template to align a manager and a direct report on personal methods and measures, surface obstacles, and connect individual work to the vision.',
    category: 'v2mom-ogsm',
    methodology: 'V2MOM / OGSM',
    minutes: 30,
    cadence: 'Biweekly',
    participants: 'Manager and direct report (2 people)',
    keywords: [
      'v2mom 1:1 template',
      'v2mom one on one agenda',
      'v2mom check-in template',
      'salesforce v2mom',
      'individual v2mom meeting',
      'manager one on one template',
      'personal v2mom alignment',
    ],
    steps: [
      { name: 'Connect to the vision', minutes: 5, text: 'Briefly reconnect the report individual V2MOM to the team and company vision so the conversation stays anchored.' },
      { name: 'Progress on personal measures', minutes: 10, text: 'Walk each personal measure, update the number, and discuss what is driving the result.' },
      { name: 'Methods working and not working', minutes: 7, text: 'Talk through which methods are paying off and which should be dropped or changed.' },
      { name: 'Obstacles and support needed', minutes: 5, text: 'Surface anything blocking progress and agree how the manager can help clear it.' },
      { name: 'Commitments before next check-in', minutes: 3, text: 'Confirm the most important actions for the report before the next session and any follow-up the manager owns.' },
    ],
    bodyHtml:
      '<p>The <strong>V2MOM 1:1 alignment check-in</strong> brings the V2MOM framework down to the individual level. When a person writes their own V2MOM, this short recurring meeting keeps their vision, methods, and measures connected to the team plan and to the support they need to deliver. This <em>V2MOM template</em> is built for a focused two-person conversation.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run it on a regular cadence, often biweekly, between a manager and a direct report who maintains a personal V2MOM. It works best as a protected, recurring slot rather than an occasional catch-up, so progress and obstacles surface early.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Just two people: the manager and the direct report. This is a private working session, not a status report for a wider audience. The intimacy is what makes the obstacles conversation honest.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Open by reconnecting the individual V2MOM to the team vision so the check-in stays purposeful. Move to personal measures and update the numbers, then talk candidly about which methods are working and which should change. Spend real time on obstacles and the support the manager can offer, since clearing blockers is the manager core job here. Close with a small set of committed actions and any follow-up the manager owns. Short, frequent, and honest beats long and occasional.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Keep it short and frequent rather than long and rare.</li>' +
      '<li>Lead with measures and numbers, not a general how-are-things chat.</li>' +
      '<li>Make obstacles safe to raise so real blockers actually surface.</li>' +
      '<li>End with the report committed actions and the manager follow-ups.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Letting the check-in drift into status with no link to the V2MOM.</li>' +
      '<li>Skipping the measures so progress stays vague.</li>' +
      '<li>Hearing obstacles but never helping clear them.</li>' +
      '<li>Ending without clear commitments on either side.</li>' +
      '</ul>' +
      '<p>Keep individual plans connected to the bigger picture. <a href="/l8">Run it in OrgTP</a> and keep personal measures, methods, and obstacles visible between check-ins.</p>',
    downloadMarkdown:
      '# V2MOM 1:1 Alignment Check-in Template\n\n' +
      'Purpose: Align a manager and a direct report on personal methods and measures, surface obstacles, and connect individual work back to the team vision.\n\n' +
      '- Duration: 30 minutes\n' +
      '- Cadence: Biweekly\n' +
      '- Participants: Manager and direct report (2 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Connect the individual V2MOM to the vision (5 min)\n' +
      '- [ ] Progress on personal measures (10 min)\n' +
      '- [ ] Methods working and not working (7 min)\n' +
      '- [ ] Obstacles and support needed (5 min)\n' +
      '- [ ] Commitments before next check-in (3 min)\n\n' +
      '## Questions\n\n' +
      '- Which measure moved the most, and why?\n' +
      '- Which method should we drop or change?\n' +
      '- What is blocking you that I can clear?\n' +
      '- What is the single most important thing before we meet again?\n\n' +
      '## Notes\n\n' +
      'Measure updates:\n\n' +
      'Method changes:\n\n' +
      'Obstacles and support:\n\n' +
      'Commitments:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/v2mom-one-on-one\n',
  },
  {
    slug: 'v2mom-annual-planning',
    title: 'V2MOM Annual Planning Template',
    shortName: 'V2MOM Annual Planning',
    description:
      'Use this V2MOM annual planning template to review the year, refresh vision and values, rebuild methods and measures, and set the V2MOM for the year ahead.',
    category: 'v2mom-ogsm',
    methodology: 'V2MOM / OGSM',
    minutes: 240,
    cadence: 'Annually',
    participants: 'Leadership team and key contributors (6-15 people)',
    keywords: [
      'v2mom annual planning template',
      'annual v2mom meeting agenda',
      'yearly v2mom template',
      'salesforce v2mom',
      'v2mom planning session',
      'vision values methods obstacles measures',
      'annual alignment planning template',
    ],
    steps: [
      { name: 'Year in review against the V2MOM', minutes: 40, text: 'Score last year measures, review which methods worked, and capture the lessons that should shape the new V2MOM.' },
      { name: 'Refresh the vision', minutes: 30, text: 'Reconnect with the long-term vision and decide whether it still fits the world the company now operates in.' },
      { name: 'Reaffirm or reorder values', minutes: 30, text: 'Confirm the guiding values and re-rank them if the priorities that govern trade-offs have shifted.' },
      { name: 'Rebuild the methods', minutes: 50, text: 'Define the prioritized methods for the year ahead, ordered so the most important work leads.' },
      { name: 'Name the obstacles', minutes: 40, text: 'Surface the biggest risks and issues likely to block the methods, with an owner for each mitigation.' },
      { name: 'Set the measures', minutes: 50, text: 'Set the measurable results that will define success for the year, each numeric, time-bound, and owned.' },
    ],
    bodyHtml:
      '<p><strong>V2MOM annual planning</strong> sets the alignment that governs the whole year. Unlike a quarterly review, which adjusts an existing plan, this session rebuilds the V2MOM from a clear-eyed look back: vision and values are reaffirmed or refreshed, while methods, obstacles, and measures are largely rewritten for the year ahead. This <em>V2MOM template</em> runs that full rebuild.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run it once a year, late in the current year or at the very start of the new one, so the organization enters the year aligned. It is the anchor of the V2MOM rhythm, with quarterly reviews and lighter check-ins executing the legs of the plan it produces.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Include the leadership team and the key contributors who will own methods and measures, six to fifteen people. The group should be wide enough to commit the organization yet small enough to make the ranking decisions a V2MOM depends on. Cascade team-level V2MOMs afterward.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Begin with an honest year in review scored against last year measures, since lessons should shape the new plan. Refresh the vision and reaffirm or reorder the values, keeping that layer relatively stable. Then do the heavier work: rebuild the prioritized methods, name the obstacles with owners, and set numeric measures for the year. The ranking is the point. When methods and values are ordered, the thousands of small decisions made over the year get easier and more consistent.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Ground the year in an honest review before drafting anything new.</li>' +
      '<li>Keep vision and values relatively stable; rebuild methods and measures.</li>' +
      '<li>Rank methods so the most important work clearly leads.</li>' +
      '<li>Set measures as numbers with owners and dates.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Skipping the honest review and repeating last year misses.</li>' +
      '<li>Rewriting the vision so heavily that continuity is lost.</li>' +
      '<li>Listing methods without ranking, so focus dissolves by spring.</li>' +
      '<li>Setting measures with no owner, so nobody is accountable for results.</li>' +
      '</ul>' +
      '<p>Set the year on one aligned page. <a href="/l8">Run it in OrgTP</a> and connect your annual V2MOM to quarterly reviews and weekly execution.</p>',
    downloadMarkdown:
      '# V2MOM Annual Planning Template\n\n' +
      'Purpose: Review the year, refresh vision and values, rebuild prioritized methods and obstacles, and set numeric measures for the year ahead.\n\n' +
      '- Duration: 240 minutes\n' +
      '- Cadence: Annually\n' +
      '- Participants: Leadership team and key contributors (6-15 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Year in review against the V2MOM (40 min)\n' +
      '- [ ] Refresh the vision (30 min)\n' +
      '- [ ] Reaffirm or reorder values (30 min)\n' +
      '- [ ] Rebuild the prioritized methods (50 min)\n' +
      '- [ ] Name the obstacles and owners (40 min)\n' +
      '- [ ] Set the measures (50 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Ground the year in an honest review first.\n' +
      '- Keep vision and values relatively stable.\n' +
      '- Rank methods so the top work leads.\n' +
      '- Set measures as numbers with owners and dates.\n\n' +
      '## Notes\n\n' +
      'Year in review:\n\n' +
      'Vision and values:\n\n' +
      'Methods:\n\n' +
      'Obstacles:\n\n' +
      'Measures and owners:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/v2mom-annual-planning\n',
  },
  {
    slug: 'ogsm-planning-session',
    title: 'OGSM Planning Session Template',
    shortName: 'OGSM Planning Session',
    description:
      'Use this OGSM template to build a one page strategic plan: a clear objective, measurable goals, focused strategies, and the measures that track each strategy.',
    category: 'v2mom-ogsm',
    methodology: 'V2MOM / OGSM',
    minutes: 180,
    cadence: 'Annually',
    participants: 'Leadership team and key contributors (5-12 people)',
    keywords: [
      'ogsm template',
      'ogsm planning session',
      'ogsm meeting agenda',
      'one page strategic plan meeting',
      'objectives goals strategies measures',
      'ogsm strategy template',
      'ogsm planning template',
      'strategic planning on a page',
    ],
    steps: [
      { name: 'Frame the OGSM', minutes: 20, text: 'Explain the four elements and the scope of the plan, and agree the time horizon the OGSM will cover.' },
      { name: 'Objective', minutes: 25, text: 'Write a single qualitative objective: a clear statement of what you aim to achieve, expressed in plain language.' },
      { name: 'Goals', minutes: 35, text: 'Define a small set of measurable goals that quantify the objective so success is unambiguous.' },
      { name: 'Strategies', minutes: 45, text: 'Choose the few strategies that describe how you will reach the goals, deciding what you will and will not do.' },
      { name: 'Measures', minutes: 35, text: 'Attach measures and dashboards to each strategy so progress can be tracked, with owners named.' },
      { name: 'One-page check and owners', minutes: 20, text: 'Confirm the whole plan fits on one page, assign owners across goals and strategies, and agree the review cadence.' },
    ],
    bodyHtml:
      '<p>The <strong>OGSM</strong> framework, short for Objectives, Goals, Strategies, and Measures, turns strategy into a single page. With roots in mid-century planning practice and long use across large consumer companies, OGSM connects a qualitative objective to measurable goals, then to the strategies that achieve them and the measures that track each one. This <em>OGSM template</em> walks all four elements in one session.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run this when you are building an OGSM for the first time, planning a new fiscal year, or replacing a sprawling strategy deck with a single page everyone can hold. It is the foundational session that later OGSM reviews and check-ins track against.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Keep the room to the leadership team plus the contributors who will own goals and strategies, five to twelve people. A one-page plan demands real choices about what not to do, and those choices need the people empowered to make them in the room.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Frame the four elements, then work them in order. Write one clear objective, then translate it into a handful of measurable goals so success is not a matter of opinion. Choose strategies deliberately, treating the decision about what not to do as seriously as what to pursue. Attach measures to each strategy so progress is visible, and confirm the plan genuinely fits one page. The discipline of the single page is what keeps an OGSM focused where longer plans sprawl.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Keep the objective to one clear sentence everyone can repeat.</li>' +
      '<li>Make goals measurable so there is no debate about whether they were hit.</li>' +
      '<li>Limit strategies to a focused few. A long strategy list is not a strategy.</li>' +
      '<li>Tie a measure to every strategy so nothing is left untracked.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Confusing the objective with the goals, blurring direction and metric.</li>' +
      '<li>Choosing so many strategies that focus disappears.</li>' +
      '<li>Setting goals with no clear measure, so progress is guesswork.</li>' +
      '<li>Letting the plan spill past one page, which defeats the framework.</li>' +
      '</ul>' +
      '<p>Get your strategy onto one page. <a href="/l8">Run it in OrgTP</a> and keep your objective, goals, strategies, and measures aligned and visible every week.</p>',
    downloadMarkdown:
      '# OGSM Planning Session Template\n\n' +
      'Purpose: Build a one page strategic plan with a clear objective, measurable goals, a focused set of strategies, and the measures that track each strategy.\n\n' +
      '- Duration: 180 minutes\n' +
      '- Cadence: Annually (or at major resets)\n' +
      '- Participants: Leadership team and key contributors (5-12 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Frame the OGSM and set scope (20 min)\n' +
      '- [ ] Objective: one clear statement (25 min)\n' +
      '- [ ] Goals: measurable targets (35 min)\n' +
      '- [ ] Strategies: the focused few (45 min)\n' +
      '- [ ] Measures and dashboards per strategy (35 min)\n' +
      '- [ ] One-page check and owners (20 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Keep the objective to one repeatable sentence.\n' +
      '- Make goals measurable, not aspirational.\n' +
      '- Limit strategies to a focused few.\n' +
      '- Tie a measure to every strategy.\n\n' +
      '## Notes\n\n' +
      'Objective:\n\n' +
      'Goals:\n\n' +
      'Strategies:\n\n' +
      'Measures and owners:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/ogsm-planning-session\n',
  },
  {
    slug: 'ogsm-quarterly-review',
    title: 'OGSM Quarterly Review Template',
    shortName: 'OGSM Quarterly Review',
    description:
      'Use this OGSM quarterly review template to score goals against target, test whether strategies are working, read the measures, and adjust the one page plan.',
    category: 'v2mom-ogsm',
    methodology: 'V2MOM / OGSM',
    minutes: 90,
    cadence: 'Quarterly',
    participants: 'Leadership team and strategy owners (5-12 people)',
    keywords: [
      'ogsm quarterly review template',
      'ogsm review meeting agenda',
      'ogsm progress review',
      'one page strategic plan meeting',
      'objectives goals strategies measures',
      'quarterly strategy review template',
      'ogsm measures review',
    ],
    steps: [
      { name: 'Objective recap', minutes: 10, text: 'Restate the objective to re-anchor the review before judging progress against the goals and strategies.' },
      { name: 'Score the goals', minutes: 25, text: 'Walk each measurable goal, update the current number, and mark it on track, at risk, or off track against target.' },
      { name: 'Test the strategies', minutes: 20, text: 'Assess whether each strategy is actually moving its goals, and decide which to continue, change, or drop.' },
      { name: 'Read the measures', minutes: 15, text: 'Review the dashboards and measures behind the strategies to separate genuine progress from activity.' },
      { name: 'Adjust the plan', minutes: 15, text: 'Make explicit changes to goals, strategies, measures, and owners so the one-page plan reflects reality.' },
      { name: 'Next-quarter focus', minutes: 5, text: 'Confirm the priorities and check-in cadence for the coming quarter and reconfirm owners.' },
    ],
    bodyHtml:
      '<p>The <strong>OGSM quarterly review</strong> keeps a one-page plan honest. The objective stays fixed, but goals get scored, strategies get tested against whether they are actually working, and measures separate real progress from motion. This <em>OGSM template</em> structures that quarterly reckoning so the plan adapts without losing its shape.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run it once a quarter, after the prior quarter is closed and the numbers behind your goals are reliable. It pairs with a lighter monthly check-in: the quarterly review is where the strategies are genuinely reassessed, not just reported on.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Bring the leadership team plus the owners of goals and strategies, five to twelve people. These are the people who can say what moved a goal, what a strategy actually produced, and what should change. Keep it to those empowered to adjust the plan.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Re-anchor on the objective, then score each goal against target with a real number. Test the strategies next, which is the heart of an OGSM review: a strategy that is not moving its goals should be changed or dropped, not defended. Read the measures behind the strategies to tell genuine progress from busywork. Make adjustments explicit, updating goals, strategies, measures, and owners, then set a clear focus for the next quarter. The output is a refreshed one-page plan, not a status deck.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Keep the objective fixed; this review changes goals, strategies, and measures.</li>' +
      '<li>Demand a number for every goal rather than a story of effort.</li>' +
      '<li>Judge each strategy by whether it moved a goal, not by how busy it was.</li>' +
      '<li>Capture every adjustment with an owner so the page stays current.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Reviewing progress but never changing a strategy that is not working.</li>' +
      '<li>Rewriting the objective each quarter and losing continuity.</li>' +
      '<li>Confusing strategy activity with goal movement.</li>' +
      '<li>Updating goals but leaving owners and cadence untouched.</li>' +
      '</ul>' +
      '<p>Keep your one-page plan adapting all year. <a href="/l8">Run it in OrgTP</a> and track goals, strategies, and measures quarter over quarter.</p>',
    downloadMarkdown:
      '# OGSM Quarterly Review Template\n\n' +
      'Purpose: Score goals against target, test whether each strategy is working, read the measures, and adjust the one page plan with clear owners.\n\n' +
      '- Duration: 90 minutes\n' +
      '- Cadence: Quarterly\n' +
      '- Participants: Leadership team and strategy owners (5-12 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Objective recap (10 min)\n' +
      '- [ ] Score the goals against target (25 min)\n' +
      '- [ ] Test the strategies (20 min)\n' +
      '- [ ] Read the measures and dashboards (15 min)\n' +
      '- [ ] Adjust the plan with owners (15 min)\n' +
      '- [ ] Next-quarter focus (5 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Keep the objective fixed; change goals and strategies.\n' +
      '- Require a number for every goal.\n' +
      '- Judge strategies by goal movement, not activity.\n' +
      '- Capture every adjustment with an owner.\n\n' +
      '## Notes\n\n' +
      'Goal scores:\n\n' +
      'Strategy changes:\n\n' +
      'Measure read:\n\n' +
      'Next-quarter focus and owners:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/ogsm-quarterly-review\n',
  },
  {
    slug: 'ogsm-cascade-meeting',
    title: 'OGSM Cascade Meeting Template',
    shortName: 'OGSM Cascade Meeting',
    description:
      'Use this OGSM cascade template to translate the company one page plan into aligned team OGSMs so every team objective ladders up to the corporate objective.',
    category: 'v2mom-ogsm',
    methodology: 'V2MOM / OGSM',
    minutes: 120,
    cadence: 'As needed',
    participants: 'Team leads and their managers (4-10 people)',
    keywords: [
      'ogsm cascade template',
      'ogsm cascade meeting agenda',
      'ogsm alignment meeting',
      'one page strategic plan meeting',
      'objectives goals strategies measures',
      'team ogsm template',
      'strategy cascade meeting template',
    ],
    steps: [
      { name: 'Present the parent OGSM', minutes: 20, text: 'Walk the company or division OGSM so every team lead understands the objective, goals, and strategies they must support.' },
      { name: 'Identify the team contribution', minutes: 20, text: 'For each team, clarify which corporate goals and strategies it most directly influences.' },
      { name: 'Draft team objectives and goals', minutes: 30, text: 'Each team drafts an objective and measurable goals that ladder up to the parent plan.' },
      { name: 'Draft team strategies and measures', minutes: 30, text: 'Teams choose the strategies they will run and the measures that track them, checking for conflicts across teams.' },
      { name: 'Check vertical and horizontal alignment', minutes: 15, text: 'Confirm each team OGSM rolls up to the parent and that teams are not working at cross purposes.' },
      { name: 'Confirm owners and review cadence', minutes: 5, text: 'Assign owners for each team goal and strategy and set how cascaded OGSMs will be reviewed.' },
    ],
    bodyHtml:
      '<p>The <strong>OGSM cascade meeting</strong> is how a single one-page plan becomes the operating plan for every team. A company OGSM only creates alignment if each team builds its own OGSM that ladders up to it. This <em>OGSM template</em> structures that translation so team objectives connect cleanly to the corporate objective.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run a cascade after the parent OGSM is set, at the start of a planning cycle, or whenever the corporate plan changes enough to require teams to realign. It is the bridge between leadership strategy and team execution.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Bring the team leads who will own cascaded OGSMs plus the manager who holds the parent plan, four to ten people. The manager keeps the cascade anchored to the parent objective while leads shape plans their teams can actually run.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Start by presenting the parent OGSM so every lead understands what they are supporting. Have each team identify which corporate goals and strategies it most directly influences, then draft a team objective and measurable goals that ladder up. Teams choose their own strategies and measures, after which you check alignment in two directions: vertically, that each team OGSM rolls up to the parent, and horizontally, that teams are not pulling against each other. Close with owners and a review cadence so the cascade stays connected.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Make sure every team goal traces to a parent goal or strategy.</li>' +
      '<li>Let teams own their strategies rather than dictating them from above.</li>' +
      '<li>Check horizontal alignment so teams are not working at cross purposes.</li>' +
      '<li>Keep each team OGSM to one page, like the parent.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Cascading goals that do not actually ladder up to the parent objective.</li>' +
      '<li>Dictating team strategies, which kills ownership.</li>' +
      '<li>Checking vertical alignment but ignoring conflicts between teams.</li>' +
      '<li>Producing team plans with no owners or review rhythm.</li>' +
      '</ul>' +
      '<p>Connect every team to the corporate plan. <a href="/l8">Run it in OrgTP</a> and keep cascaded OGSMs aligned vertically and horizontally across the org.</p>',
    downloadMarkdown:
      '# OGSM Cascade Meeting Template\n\n' +
      'Purpose: Translate the company one page plan into aligned team OGSMs so every team objective and goal ladders up to the corporate objective.\n\n' +
      '- Duration: 120 minutes\n' +
      '- Cadence: As needed (after the parent OGSM is set)\n' +
      '- Participants: Team leads and their managers (4-10 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Present the parent OGSM (20 min)\n' +
      '- [ ] Identify each team contribution (20 min)\n' +
      '- [ ] Draft team objectives and goals (30 min)\n' +
      '- [ ] Draft team strategies and measures (30 min)\n' +
      '- [ ] Check vertical and horizontal alignment (15 min)\n' +
      '- [ ] Confirm owners and review cadence (5 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Make every team goal trace to a parent goal or strategy.\n' +
      '- Let teams own their strategies.\n' +
      '- Check horizontal alignment across teams.\n' +
      '- Keep each team OGSM to one page.\n\n' +
      '## Notes\n\n' +
      'Parent OGSM recap:\n\n' +
      'Team objectives and goals:\n\n' +
      'Team strategies and measures:\n\n' +
      'Alignment checks and owners:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/ogsm-cascade-meeting\n',
  },
  {
    slug: 'ogsm-monthly-checkin',
    title: 'OGSM Monthly Check-in Template',
    shortName: 'OGSM Monthly Check-in',
    description:
      'Use this OGSM monthly check-in template to update goal measures, flag strategies off pace, clear blockers, and keep the one page plan on track between reviews.',
    category: 'v2mom-ogsm',
    methodology: 'V2MOM / OGSM',
    minutes: 45,
    cadence: 'Monthly',
    participants: 'Strategy owners and team (4-10 people)',
    keywords: [
      'ogsm monthly check-in template',
      'ogsm check-in meeting agenda',
      'ogsm progress tracking template',
      'one page strategic plan meeting',
      'objectives goals strategies measures',
      'monthly strategy review template',
      'ogsm status meeting',
    ],
    steps: [
      { name: 'Wins and momentum', minutes: 5, text: 'Each owner shares one concrete win since the last check-in to open the meeting on progress.' },
      { name: 'Goal measure updates', minutes: 15, text: 'Walk each goal, update the current measure, and compare actual pace against the expected trajectory.' },
      { name: 'Strategy status', minutes: 12, text: 'Mark each strategy on, ahead, or behind pace and note any that need attention before the next review.' },
      { name: 'Blockers and help needed', minutes: 8, text: 'Surface anything slowing a strategy and decide who clears it, by when.' },
      { name: 'Commitments for the month', minutes: 5, text: 'Each owner names the single most important action that moves a goal before the next check-in.' },
    ],
    bodyHtml:
      '<p>The <strong>OGSM monthly check-in</strong> is the cadence that keeps a one-page plan from drifting between quarterly reviews. It is short and measure-driven: the point is not to relitigate strategy but to update where each goal stands and clear whatever is in the way. This <em>OGSM template</em> keeps the plan alive month to month.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run it monthly between OGSM quarterly reviews. It works best on a fixed day so it becomes a reliable ritual rather than a meeting people negotiate around. Some teams fold it into an existing monthly operations review, but it deserves a protected slot.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Keep it tight: the owners of goals and strategies plus the people directly working them, four to ten people. This is a working session focused on movement and blockers, not a status broadcast for a wide stakeholder audience.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Open with a quick win to build momentum, then go straight to the measures. For each goal, update the current number and say plainly whether you are on, ahead, or behind pace. Mark each strategy the same way and flag the ones that need attention. Surface blockers and assign someone to clear each, then close with a single committed action per owner. Keep it short. The discipline of a fast monthly beat is what keeps the quarterly review from delivering surprises.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Protect the time box. If a topic needs real debate, take it offline.</li>' +
      '<li>Require a number for every goal, not a narrative of activity.</li>' +
      '<li>Flag a strategy falling behind early rather than waiting for the quarter.</li>' +
      '<li>Close every blocker with an owner and a date.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Letting the check-in become a long status meeting with no decisions.</li>' +
      '<li>Reporting activity instead of movement on the goal measures.</li>' +
      '<li>Ignoring a strategy off pace until the quarterly review.</li>' +
      '<li>Naming blockers but never assigning who resolves them.</li>' +
      '</ul>' +
      '<p>Keep the plan moving between reviews. <a href="/l8">Run it in OrgTP</a> so goal measures, strategy status, and blockers stay live every month.</p>',
    downloadMarkdown:
      '# OGSM Monthly Check-in Template\n\n' +
      'Purpose: Update goal measures, flag strategies off pace, clear blockers, and keep the one page plan on track between quarterly reviews.\n\n' +
      '- Duration: 45 minutes\n' +
      '- Cadence: Monthly\n' +
      '- Participants: Strategy owners and team (4-10 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Wins and momentum (5 min)\n' +
      '- [ ] Goal measure updates with current numbers (15 min)\n' +
      '- [ ] Strategy status: on, ahead, behind (12 min)\n' +
      '- [ ] Blockers and help needed (8 min)\n' +
      '- [ ] Commitments for the month (5 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Protect the time box; take debates offline.\n' +
      '- Require a number for every goal.\n' +
      '- Flag a strategy off pace early.\n' +
      '- Close every blocker with an owner and a date.\n\n' +
      '## Notes\n\n' +
      'Goal measure updates:\n\n' +
      'Strategy status:\n\n' +
      'Blockers and owners:\n\n' +
      'Monthly commitments:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/ogsm-monthly-checkin\n',
  },
  {
    slug: 'ogsm-annual-planning',
    title: 'OGSM Annual Strategic Planning Template',
    shortName: 'OGSM Annual Strategic Planning',
    description:
      'Use this OGSM annual planning template to review the year, refresh the objective, set measurable goals, choose strategies, and build the one page plan ahead.',
    category: 'v2mom-ogsm',
    methodology: 'V2MOM / OGSM',
    minutes: 240,
    cadence: 'Annually',
    participants: 'Leadership team and key contributors (6-15 people)',
    keywords: [
      'ogsm annual planning template',
      'annual ogsm meeting agenda',
      'yearly ogsm template',
      'one page strategic plan meeting',
      'objectives goals strategies measures',
      'annual strategy planning template',
      'ogsm planning session',
    ],
    steps: [
      { name: 'Year in review against the OGSM', minutes: 35, text: 'Score last year goals, review which strategies worked, and capture the lessons that should shape the new OGSM.' },
      { name: 'Refresh the objective', minutes: 30, text: 'Reconnect with the long-term direction and refine the qualitative objective for the year ahead.' },
      { name: 'Market and capability assessment', minutes: 35, text: 'Assess the external market and internal capabilities so the goals and strategies are grounded in reality.' },
      { name: 'Set the goals', minutes: 45, text: 'Define a focused set of measurable goals that quantify the objective for the coming year.' },
      { name: 'Choose the strategies', minutes: 50, text: 'Select the few strategies that will achieve the goals, deciding deliberately what you will not do.' },
      { name: 'Set measures and owners', minutes: 45, text: 'Attach measures and dashboards to each strategy, assign owners, and confirm the plan fits one page.' },
    ],
    bodyHtml:
      '<p><strong>OGSM annual planning</strong> builds the one-page plan that governs the year. It is broader than a quarterly review, which adjusts an existing plan, and more concrete than a vision statement. The output is a single objective, a focused set of measurable goals, the strategies that achieve them, and the measures that track each. This <em>OGSM template</em> runs that full build.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run it once a year, late in the current year or at the very start of the new one, so the organization enters the year aligned on one page. It is the anchor of the OGSM rhythm, with quarterly reviews and monthly check-ins executing the plan it produces.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Include the leadership team and the key contributors who will own goals and strategies, six to fifteen people. A one-page plan demands real choices about focus, so the group must be wide enough to commit the organization yet small enough to decide. Cascade team OGSMs afterward.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Begin with an honest year in review scored against last year goals. Refresh the objective, then assess market and capabilities so ambition stays grounded. Set a focused set of measurable goals, then choose strategies deliberately, treating the decision about what not to do as seriously as what to pursue. Attach measures and owners to each strategy and confirm the plan genuinely fits one page. The single-page discipline is what keeps the year focused where longer plans sprawl and stall.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Ground the year in an honest review before drafting the new plan.</li>' +
      '<li>Keep the objective to one clear sentence for the year.</li>' +
      '<li>Choose a focused few strategies and name what you will not do.</li>' +
      '<li>Tie a measure and an owner to every strategy.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Skipping the honest review and repeating last year misses.</li>' +
      '<li>Setting so many goals and strategies that the page stops being focused.</li>' +
      '<li>Choosing strategies with no measure, so progress is guesswork.</li>' +
      '<li>Building a plan with no owners or operating rhythm to keep it alive.</li>' +
      '</ul>' +
      '<p>Set the year on one focused page. <a href="/l8">Run it in OrgTP</a> and connect your annual OGSM to quarterly reviews and monthly check-ins.</p>',
    downloadMarkdown:
      '# OGSM Annual Strategic Planning Template\n\n' +
      'Purpose: Review the year, refresh the objective, set measurable goals, choose a focused set of strategies, and build the one page plan for the year ahead.\n\n' +
      '- Duration: 240 minutes\n' +
      '- Cadence: Annually\n' +
      '- Participants: Leadership team and key contributors (6-15 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Year in review against the OGSM (35 min)\n' +
      '- [ ] Refresh the objective (30 min)\n' +
      '- [ ] Market and capability assessment (35 min)\n' +
      '- [ ] Set the goals (45 min)\n' +
      '- [ ] Choose the strategies (50 min)\n' +
      '- [ ] Set measures and owners (45 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Ground the year in an honest review first.\n' +
      '- Keep the objective to one clear sentence.\n' +
      '- Choose a focused few strategies; name what you will not do.\n' +
      '- Tie a measure and an owner to every strategy.\n\n' +
      '## Notes\n\n' +
      'Year in review:\n\n' +
      'Objective:\n\n' +
      'Goals:\n\n' +
      'Strategies:\n\n' +
      'Measures and owners:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/ogsm-annual-planning\n',
  },
];
