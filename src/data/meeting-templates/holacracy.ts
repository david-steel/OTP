// Holacracy meeting templates for the /templates library.
// AUTHORED content. bodyHtml renders via <%- %>. Byte-stable: no Date.now,
// no randomness. See _types.ts for the shared contract.
//
// Based on Holacracy (Brian Robertson / HolacracyOne). OrgTP is not
// affiliated with or endorsed by HolacracyOne.

import type { MeetingTemplate } from './_types.js';

export const HOLACRACY_TEMPLATES: MeetingTemplate[] = [
  {
    slug: 'holacracy-tactical-meeting',
    title: 'Holacracy Tactical Meeting Template',
    shortName: 'Holacracy Tactical Meeting',
    description:
      'Use this Holacracy tactical meeting template to review checklists and metrics, process project updates, triage tensions, and drive next actions in a circle.',
    category: 'holacracy',
    methodology: 'Holacracy',
    minutes: 60,
    cadence: 'Weekly',
    participants: 'Circle members and core roles (4-12 people)',
    keywords: [
      'holacracy tactical meeting',
      'holacracy tactical meeting template',
      'holacracy meeting format',
      'tactical meeting agenda',
      'self management meeting',
      'circle meeting template',
      'holacracy triage agenda',
      'agile operations meeting template',
    ],
    steps: [
      { name: 'Check-in Round', minutes: 5, text: 'Each participant calls out what has their attention so the room can be present. No discussion or cross-talk during the round.' },
      { name: 'Checklist Review', minutes: 5, text: 'The facilitator reads recurring actions and each role responds check or no-check. Capture data only; defer any discussion to triage.' },
      { name: 'Metrics Review', minutes: 5, text: 'Each role with a metric reports its current number so the circle sees real-time operational reality without commentary.' },
      { name: 'Project Updates', minutes: 10, text: 'The facilitator asks each role for updates since last meeting. Roles answer new or no update; questions are saved for triage.' },
      { name: 'Agenda Building and Triage', minutes: 30, text: 'Capture one-word agenda items, then process each tension into a next-action or project. The agenda item owner drives; everyone else helps them get what they need.' },
      { name: 'Closing Round', minutes: 5, text: 'Each participant shares a brief reflection on the meeting. No response or discussion; the round simply closes the space.' },
    ],
    bodyHtml:
      '<p>The <strong>Holacracy tactical meeting</strong> is the operational heartbeat of a circle. It exists to get work moving: surface the tensions blocking progress, convert each one into a clear next-action or project, and keep operational data visible. It is fast, structured, and deliberately stripped of long discussion.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run a tactical meeting weekly for each circle that does ongoing operational work. It is the place to clear day-to-day blockers, request things from other roles, and report progress. Use the governance meeting instead when the friction is about how roles or policies are defined rather than getting work done.</p>' +
      '<h2>Who attends</h2>' +
      '<p>All members filling roles in the circle attend, typically four to twelve people. A <em>facilitator</em> runs the process and protects the format, and a <em>secretary</em> captures next-actions, projects, and notes. These are roles for the meeting, not seniority; anyone trained can hold them.</p>' +
      '<h2>How to run it</h2>' +
      '<p>The meeting moves through fixed rounds. It opens with a check-in round where each person speaks once and is not interrupted, which clears mental noise before work begins. Checklist and metrics reviews surface operational reality as raw data, not conversation. Project updates are equally crisp. The bulk of the time is triage: the circle builds a one-word agenda live, then works each item one at a time. For every item the facilitator asks the owner what they need, and the rest of the circle helps them get to a concrete next-action or project. A closing round ends the meeting with each person reflecting briefly. The discipline is the point: capture data fast, save discussion for the owner who raised it.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Hold the rounds. During check-in and closing, one voice at a time with no cross-talk.</li>' +
      '<li>Drive every agenda item to a captured next-action or project, not a vague agreement.</li>' +
      '<li>Keep asking the item owner, <em>what do you need?</em> The circle serves their tension.</li>' +
      '<li>Park anything that is really a role or policy question and route it to governance.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Letting checklist and metrics reviews drift into discussion instead of pure data.</li>' +
      '<li>Solving tensions for the whole room rather than for the person who raised them.</li>' +
      '<li>Trying to change role definitions in tactical, which belongs in governance.</li>' +
      '<li>Skipping the closing round, which is where the meeting actually lands.</li>' +
      '</ul>' +
      '<p>Want this to run cleanly every week? <a href="/l8">Run it in OrgTP</a> and keep your circle checklists, metrics, and next-actions visible between meetings.</p>',
    downloadMarkdown:
      '# Holacracy Tactical Meeting Template\n\n' +
      'Purpose: Review checklists and metrics, process project updates, and triage each tension into a clear next-action or project so circle work keeps moving.\n\n' +
      '- Duration: 60 minutes\n' +
      '- Cadence: Weekly\n' +
      '- Participants: Circle members and core roles (4-12 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Check-in Round, what has your attention (5 min)\n' +
      '- [ ] Checklist Review, check or no-check per role (5 min)\n' +
      '- [ ] Metrics Review, current numbers (5 min)\n' +
      '- [ ] Project Updates, new or no update (10 min)\n' +
      '- [ ] Agenda Building and Triage, one item at a time (30 min)\n' +
      '- [ ] Closing Round, brief reflections (5 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Hold the rounds; one voice at a time, no cross-talk.\n' +
      '- Drive every item to a captured next-action or project.\n' +
      '- Keep asking the item owner what they need.\n' +
      '- Route role or policy questions to governance.\n\n' +
      '## Notes\n\n' +
      'Checklist and metrics:\n\n' +
      'Project updates:\n\n' +
      'Next-actions and owners:\n\n' +
      'Projects captured:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/holacracy-tactical-meeting\n',
  },
  {
    slug: 'holacracy-governance-meeting',
    title: 'Holacracy Governance Meeting Template',
    shortName: 'Holacracy Governance Meeting',
    description:
      'Use this Holacracy governance meeting template to evolve roles and policies through integrative decision making, processing each proposal one tension at a time.',
    category: 'holacracy',
    methodology: 'Holacracy',
    minutes: 90,
    cadence: 'Monthly',
    participants: 'Circle members and core roles (4-12 people)',
    keywords: [
      'holacracy governance meeting template',
      'holacracy governance meeting',
      'integrative decision making',
      'governance meeting agenda',
      'self management meeting',
      'role and policy meeting',
      'holacracy meeting format',
      'circle governance template',
    ],
    steps: [
      { name: 'Check-in Round', minutes: 5, text: 'Each participant calls out what has their attention to become present. No discussion or cross-talk.' },
      { name: 'Administrative Concerns', minutes: 5, text: 'Cover logistics: time available, scheduling, and any housekeeping so they do not interrupt the work to come.' },
      { name: 'Agenda Building', minutes: 10, text: 'Each participant adds tensions as one-word or short agenda items. No discussion yet; the facilitator simply builds the list.' },
      { name: 'Integrative Decision-Making', minutes: 60, text: 'Process each agenda item in turn through the full IDM cycle: present proposal, clarifying questions, reaction round, amend and clarify, objection round, then integration.' },
      { name: 'Closing Round', minutes: 10, text: 'Each participant shares a brief reflection on the meeting. No response or discussion.' },
    ],
    bodyHtml:
      '<p>The <strong>Holacracy governance meeting</strong> is where a circle evolves itself. It is the only place roles, accountabilities, domains, and policies are formally created, changed, or removed. The engine that makes this safe is integrative decision-making, a process designed to let any single person move a proposal forward unless there is a real, surfaced objection.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run governance on a regular cadence, often monthly, and call an extra session when structural tension builds up. Use it whenever the friction is about how the circle is organized: an unclear accountability, a role doing too much, a missing role, or a policy that needs to constrain how work happens. Operational blockers belong in the tactical meeting instead.</p>' +
      '<h2>Who attends</h2>' +
      '<p>All members filling roles in the circle attend, usually four to twelve people. A <em>facilitator</em> runs integrative decision-making strictly by the process, and a <em>secretary</em> records the adopted governance into the circle record. The facilitator protects the steps; their job is process integrity, not the outcome.</p>' +
      '<h2>How to run it</h2>' +
      '<p>After the check-in round and quick administrative concerns, the circle builds an agenda of tensions without debate. Then each item runs through the integrative decision-making cycle one at a time. The proposer presents a proposal to resolve their tension. Clarifying questions surface understanding, not opinions. A reaction round lets each person respond in turn, after which the proposer may amend and clarify. Then the objection round tests whether the proposal would cause harm or move the circle backward; only valid objections stop it. Surfaced objections are integrated into an amended proposal that resolves the original tension without creating new harm. A closing round ends the meeting. The format feels rigid at first, and that rigidity is what keeps power with the process rather than the loudest voice.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Keep clarifying questions and reactions strictly separate; do not let one bleed into the other.</li>' +
      '<li>Test each objection against the validity criteria rather than accepting it as a preference.</li>' +
      '<li>Anchor every proposal in a real tension the proposer is experiencing.</li>' +
      '<li>Protect the round structure so quieter voices get equal airtime.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Slipping into open debate instead of the structured rounds.</li>' +
      '<li>Treating personal preferences as objections, which stalls good proposals.</li>' +
      '<li>Designing perfect governance up front rather than evolving it tension by tension.</li>' +
      '<li>Using governance to solve operational work that belongs in tactical.</li>' +
      '</ul>' +
      '<p>Ready to evolve your roles cleanly? <a href="/l8">Run it in OrgTP</a> and keep your circle structure, accountabilities, and policies in one living record.</p>',
    downloadMarkdown:
      '# Holacracy Governance Meeting Template\n\n' +
      'Purpose: Evolve roles, accountabilities, and policies through integrative decision making, processing each tension one proposal at a time.\n\n' +
      '- Duration: 90 minutes\n' +
      '- Cadence: Monthly (plus extra sessions as tension builds)\n' +
      '- Participants: Circle members and core roles (4-12 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Check-in Round, what has your attention (5 min)\n' +
      '- [ ] Administrative Concerns, logistics and time (5 min)\n' +
      '- [ ] Agenda Building, add tensions as items (10 min)\n' +
      '- [ ] Integrative Decision-Making per item (60 min)\n' +
      '    - [ ] Present proposal\n' +
      '    - [ ] Clarifying questions\n' +
      '    - [ ] Reaction round\n' +
      '    - [ ] Amend and clarify\n' +
      '    - [ ] Objection round\n' +
      '    - [ ] Integration\n' +
      '- [ ] Closing Round, brief reflections (10 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Keep clarifying questions and reactions strictly separate.\n' +
      '- Test each objection against the validity criteria.\n' +
      '- Anchor every proposal in a real tension.\n' +
      '- Protect the round structure for equal airtime.\n\n' +
      '## Notes\n\n' +
      'Tensions raised:\n\n' +
      'Proposals and amendments:\n\n' +
      'Objections integrated:\n\n' +
      'Adopted governance:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/holacracy-governance-meeting\n',
  },
  {
    slug: 'holacracy-strategy-meeting',
    title: 'Holacracy Strategy Meeting Template',
    shortName: 'Holacracy Strategy Meeting',
    description:
      'Use this Holacracy strategy meeting template to set simple guiding strategies for a circle, giving roles a rule of thumb to prioritize and self-direct work.',
    category: 'holacracy',
    methodology: 'Holacracy',
    minutes: 90,
    cadence: 'Quarterly',
    participants: 'Circle members and core roles (4-12 people)',
    keywords: [
      'holacracy strategy meeting template',
      'holacracy strategy meeting',
      'circle strategy meeting',
      'self management strategy session',
      'holacracy meeting format',
      'guiding strategy template',
      'strategy retrospective agenda',
      'self management meeting',
    ],
    steps: [
      { name: 'Check-in Round', minutes: 5, text: 'Each participant shares what has their attention to become present. No cross-talk.' },
      { name: 'Orientation and Context', minutes: 15, text: 'Review the circle purpose, current reality, and the broader context so strategy is grounded in where the circle actually stands.' },
      { name: 'Retrospective Reflection', minutes: 20, text: 'Reflect on what is working, what is creating tension, and the patterns the circle keeps running into.' },
      { name: 'Generate Guiding Strategies', minutes: 25, text: 'Surface candidate strategies as simple emphasis statements, often in the form prioritize X even over Y, that help roles make trade-offs.' },
      { name: 'Test and Adopt', minutes: 20, text: 'Pressure-test each candidate strategy for clarity and usefulness, then adopt a small set the circle will actually use to self-direct.' },
      { name: 'Closing Round', minutes: 5, text: 'Each participant shares a brief reflection on the session. No response or discussion.' },
    ],
    bodyHtml:
      '<p>The <strong>Holacracy strategy meeting</strong> gives a circle a shared rule of thumb for making trade-offs. In self-organizing teams nobody hands out priorities, so a guiding strategy, usually phrased as <em>prioritize X even over Y</em>, lets each role decide for itself what to emphasize without waiting for a manager.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run a strategy meeting roughly quarterly, or whenever the circle keeps facing the same kind of trade-off and resolving it inconsistently. It pairs naturally with the rhythm of governance and tactical: strategy sets emphasis, governance sets structure, and tactical executes.</p>' +
      '<h2>Who attends</h2>' +
      '<p>All members filling roles in the circle attend, typically four to twelve people. A <em>facilitator</em> guides the reflection and keeps strategies simple, and a <em>secretary</em> records the adopted strategies so every role can refer back to them between sessions.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Open with a check-in round, then ground everyone in the circle purpose and current reality before looking forward. A retrospective reflection surfaces what is working and what keeps generating tension, which is where useful strategies come from. The circle then generates candidate guiding strategies as simple emphasis statements rather than detailed plans, because the goal is a heuristic each role can apply in the moment. Test the candidates for clarity, adopt a small set, and close with a round. A good strategy is short enough to remember and sharp enough to settle a real trade-off; a long strategy nobody can recall is worse than none.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Keep strategies to a memorable phrase, ideally prioritize X even over Y.</li>' +
      '<li>Ground the session in a real retrospective, not abstract aspiration.</li>' +
      '<li>Adopt only a few strategies; a long list cannot guide decisions.</li>' +
      '<li>Make sure each strategy actually resolves a trade-off roles face.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Writing detailed plans instead of simple guiding emphases.</li>' +
      '<li>Adopting so many strategies that none of them guide anything.</li>' +
      '<li>Producing strategies that sound nice but settle no real trade-off.</li>' +
      '<li>Never revisiting strategy as the circle context shifts.</li>' +
      '</ul>' +
      '<p>Give your circle a clear emphasis to self-direct by. <a href="/l8">Run it in OrgTP</a> and keep your guiding strategies visible to every role.</p>',
    downloadMarkdown:
      '# Holacracy Strategy Meeting Template\n\n' +
      'Purpose: Set a small set of simple guiding strategies that help every role in a circle make trade-offs and self-direct without waiting for a manager.\n\n' +
      '- Duration: 90 minutes\n' +
      '- Cadence: Quarterly\n' +
      '- Participants: Circle members and core roles (4-12 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Check-in Round, what has your attention (5 min)\n' +
      '- [ ] Orientation and context, purpose and reality (15 min)\n' +
      '- [ ] Retrospective reflection, tensions and patterns (20 min)\n' +
      '- [ ] Generate guiding strategies, prioritize X even over Y (25 min)\n' +
      '- [ ] Test and adopt a small set (20 min)\n' +
      '- [ ] Closing Round, brief reflections (5 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Keep each strategy to a memorable phrase.\n' +
      '- Ground the session in a real retrospective.\n' +
      '- Adopt only a few strategies.\n' +
      '- Make sure each strategy settles a real trade-off.\n\n' +
      '## Notes\n\n' +
      'Current reality:\n\n' +
      'Retrospective patterns:\n\n' +
      'Candidate strategies:\n\n' +
      'Adopted guiding strategies:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/holacracy-strategy-meeting\n',
  },
  {
    slug: 'holacracy-role-review',
    title: 'Holacracy Role Review Template',
    shortName: 'Holacracy Role Review',
    description:
      'Use this Holacracy role review template to examine a role purpose, accountabilities, and domains, surface tensions, and prepare clean proposals for governance.',
    category: 'holacracy',
    methodology: 'Holacracy',
    minutes: 45,
    cadence: 'As needed',
    participants: 'Role filler, circle lead, and relevant roles (2-6 people)',
    keywords: [
      'holacracy role review template',
      'holacracy role review',
      'role accountabilities review',
      'self management role clarity',
      'holacracy meeting format',
      'role definition meeting',
      'circle role review agenda',
      'self management meeting',
    ],
    steps: [
      { name: 'Check-in Round', minutes: 5, text: 'Each participant shares what has their attention to become present. No cross-talk.' },
      { name: 'Read the Role As-Is', minutes: 5, text: 'Read the role purpose, accountabilities, and any domains aloud exactly as written so everyone shares the same current definition.' },
      { name: 'Surface Tensions', minutes: 15, text: 'The role filler and related roles name where the definition is unclear, missing, overlapping, or no longer matches reality.' },
      { name: 'Clarify Purpose and Accountabilities', minutes: 12, text: 'Discuss what the role should own, what ongoing accountabilities express that, and which domains it may need exclusive control over.' },
      { name: 'Draft Proposals for Governance', minutes: 5, text: 'Capture clear proposed changes to take into a governance meeting, since role definitions are only formally changed there.' },
      { name: 'Closing Round', minutes: 3, text: 'Each participant shares a brief reflection. No response or discussion.' },
    ],
    bodyHtml:
      '<p>The <strong>Holacracy role review</strong> is a focused working session to get clear on a single role before formal governance. Roles in Holacracy are defined by a purpose, a set of accountabilities, and sometimes domains. Over time those drift from reality, and this review surfaces the gaps so the eventual governance proposal is clean.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Use a role review when a role feels overloaded, fuzzy, or out of date, when work keeps falling between two roles, or when someone new is taking over a role and wants to understand exactly what it owns. It is a preparation step; the actual changes are adopted later in a governance meeting.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Keep it small: the person filling the role, the circle lead if relevant, and any roles whose work overlaps. Two to six people is plenty. A tight group means the conversation stays concrete and grounded in real tension rather than abstract org design.</p>' +
      '<h2>How to run it</h2>' +
      '<p>After a brief check-in, read the role exactly as it is currently written so nobody argues from memory. The heart of the session is surfacing tensions: where the purpose is vague, where accountabilities are missing or duplicated, where a domain is contested. Talk through what the role should genuinely own and how that maps to accountabilities and domains. Then draft concrete proposals to carry into governance, because in Holacracy a facilitated session may explore a role but only a governance meeting can formally change it. Close with a short round. The output is clarity plus ready-to-process proposals, not a unilateral redefinition.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Read the role as written before discussing it; do not work from assumptions.</li>' +
      '<li>Anchor every change in a real tension someone is experiencing.</li>' +
      '<li>Distinguish accountabilities, the ongoing activities, from domains, the exclusive control.</li>' +
      '<li>Leave with proposals for governance, not informal handshake agreements.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Trying to formally change the role here instead of in governance.</li>' +
      '<li>Packing one role with accountabilities that belong in several.</li>' +
      '<li>Confusing a domain with an accountability and blurring control.</li>' +
      '<li>Redesigning the role around imagined needs rather than felt tension.</li>' +
      '</ul>' +
      '<p>Get a role crystal clear before governance. <a href="/l8">Run it in OrgTP</a> and keep each role purpose, accountabilities, and domains visible to the circle.</p>',
    downloadMarkdown:
      '# Holacracy Role Review Template\n\n' +
      'Purpose: Examine a single role purpose, accountabilities, and domains, surface tensions, and prepare clean proposals to adopt in a governance meeting.\n\n' +
      '- Duration: 45 minutes\n' +
      '- Cadence: As needed\n' +
      '- Participants: Role filler, circle lead, and relevant roles (2-6 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Check-in Round, what has your attention (5 min)\n' +
      '- [ ] Read the role as-is, purpose and accountabilities (5 min)\n' +
      '- [ ] Surface tensions, gaps and overlaps (15 min)\n' +
      '- [ ] Clarify purpose, accountabilities, and domains (12 min)\n' +
      '- [ ] Draft proposals for governance (5 min)\n' +
      '- [ ] Closing Round, brief reflections (3 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Read the role as written before discussing it.\n' +
      '- Anchor every change in a real tension.\n' +
      '- Distinguish accountabilities from domains.\n' +
      '- Leave with proposals for governance, not handshakes.\n\n' +
      '## Notes\n\n' +
      'Role as-is:\n\n' +
      'Tensions surfaced:\n\n' +
      'Proposed accountabilities and domains:\n\n' +
      'Proposals for governance:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/holacracy-role-review\n',
  },
  {
    slug: 'holacracy-circle-lead-sync',
    title: 'Holacracy Circle Lead Sync Template',
    shortName: 'Holacracy Circle Lead Sync',
    description:
      'Use this Holacracy circle lead sync template to align lead links across circles on priorities, resourcing, and strategy without overriding circle autonomy.',
    category: 'holacracy',
    methodology: 'Holacracy',
    minutes: 45,
    cadence: 'Biweekly',
    participants: 'Circle leads and lead links (3-8 people)',
    keywords: [
      'holacracy circle lead sync template',
      'holacracy circle lead sync',
      'lead link meeting',
      'circle lead coordination',
      'self management meeting',
      'holacracy meeting format',
      'cross circle alignment',
      'holacracy leadership sync',
    ],
    steps: [
      { name: 'Check-in Round', minutes: 5, text: 'Each circle lead shares what has their attention across their circle. No cross-talk.' },
      { name: 'Circle Health Snapshot', minutes: 10, text: 'Each lead gives a brief read on their circle: momentum, key metrics, and any structural or staffing tension building.' },
      { name: 'Priority and Resource Alignment', minutes: 15, text: 'Align on shared priorities and how people, budget, and attention are allocated across circles for the period ahead.' },
      { name: 'Cross-Circle Tensions', minutes: 10, text: 'Surface tensions that span circles and decide where each one is best processed, in governance, tactical, or directly between roles.' },
      { name: 'Commitments and Routing', minutes: 5, text: 'Confirm who carries each tension or action back into their circle and the next sync.' },
    ],
    bodyHtml:
      '<p>The <strong>Holacracy circle lead sync</strong> connects the people holding the lead link role across circles. The lead link helps a circle express its purpose, allocates roles, and sets priorities for the circle. When several circles share resources and direction, their leads need a regular forum to align, without reaching into each other circles and overriding their autonomy.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run this sync biweekly, or at whatever cadence keeps interdependent circles coordinated. It is most useful when circles compete for the same people or budget, when priorities need to be balanced across the organization, or when a tension keeps bouncing between circles with no clear home.</p>' +
      '<h2>Who attends</h2>' +
      '<p>The circle leads, or lead links, of the circles that need to coordinate, usually three to eight people. A <em>facilitator</em> keeps the sync on its rounds and a <em>secretary</em> captures commitments. This is a coordination forum, not a management layer; decisions about a circle still belong inside that circle.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Open with a check-in, then each lead gives a quick health snapshot of their circle so the group shares context. The core of the meeting is priority and resource alignment: deciding together how shared people and attention are allocated for the period ahead. Then surface cross-circle tensions and, crucially, route each one to where it belongs rather than solving it informally here. A tension about role structure goes to a governance meeting; an operational blocker goes to tactical. Close by confirming who carries what back into their circle. The sync coordinates and routes; it does not govern circles from above.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Coordinate across circles without making decisions that belong inside one.</li>' +
      '<li>Route each cross-circle tension to governance, tactical, or direct conversation.</li>' +
      '<li>Keep the health snapshots brief; this is alignment, not status theater.</li>' +
      '<li>End with explicit ownership of who carries each tension home.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Turning the sync into a management meeting that overrides circle autonomy.</li>' +
      '<li>Solving structural tensions informally instead of routing them to governance.</li>' +
      '<li>Letting health snapshots sprawl into long status updates.</li>' +
      '<li>Leaving without clear ownership of cross-circle actions.</li>' +
      '</ul>' +
      '<p>Keep your circles aligned without a hierarchy. <a href="/l8">Run it in OrgTP</a> and keep cross-circle priorities, resourcing, and tensions in one shared view.</p>',
    downloadMarkdown:
      '# Holacracy Circle Lead Sync Template\n\n' +
      'Purpose: Align circle leads on shared priorities, resourcing, and cross-circle tensions, and route each tension to its proper home without overriding circle autonomy.\n\n' +
      '- Duration: 45 minutes\n' +
      '- Cadence: Biweekly\n' +
      '- Participants: Circle leads and lead links (3-8 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Check-in Round, what has your attention (5 min)\n' +
      '- [ ] Circle health snapshot per lead (10 min)\n' +
      '- [ ] Priority and resource alignment (15 min)\n' +
      '- [ ] Cross-circle tensions and routing (10 min)\n' +
      '- [ ] Commitments and routing (5 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Coordinate across circles without overriding any one.\n' +
      '- Route each tension to governance, tactical, or direct talk.\n' +
      '- Keep health snapshots brief.\n' +
      '- End with explicit ownership of each action.\n\n' +
      '## Notes\n\n' +
      'Circle health:\n\n' +
      'Priority and resource decisions:\n\n' +
      'Cross-circle tensions and routing:\n\n' +
      'Commitments:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/holacracy-circle-lead-sync\n',
  },
  {
    slug: 'holacracy-onboarding-meeting',
    title: 'Holacracy Onboarding Meeting Template',
    shortName: 'Holacracy Onboarding Meeting',
    description:
      'Use this Holacracy onboarding meeting template to orient a new member to roles, circles, meeting formats, and tension processing so they contribute quickly.',
    category: 'holacracy',
    methodology: 'Holacracy',
    minutes: 60,
    cadence: 'As needed',
    participants: 'New member, circle lead, and a Holacracy coach (2-4 people)',
    keywords: [
      'holacracy onboarding meeting template',
      'holacracy onboarding meeting',
      'self management onboarding',
      'holacracy new member orientation',
      'holacracy meeting format',
      'roles and circles onboarding',
      'tension processing introduction',
      'self management meeting',
    ],
    steps: [
      { name: 'Check-in and Welcome', minutes: 5, text: 'Welcome the new member, share what has each person attention, and set the purpose of the session.' },
      { name: 'Roles vs People', minutes: 10, text: 'Explain that work is organized around roles, not job titles, and that one person may fill several roles across circles.' },
      { name: 'Circles and Structure', minutes: 10, text: 'Walk the circle structure, where the new member roles sit, and how circles nest and connect.' },
      { name: 'Meeting Formats', minutes: 15, text: 'Explain the tactical and governance meetings, the round-based format, and the facilitator and secretary roles.' },
      { name: 'Processing Tensions', minutes: 15, text: 'Show how to sense a tension and where to take it: tactical for operational blockers, governance for role and policy change.' },
      { name: 'Questions and First Actions', minutes: 5, text: 'Answer open questions and agree the member first roles, first meetings to attend, and where to find the governance record.' },
    ],
    bodyHtml:
      '<p>The <strong>Holacracy onboarding meeting</strong> helps a new member make sense of a way of working that looks unfamiliar at first. Instead of a boss handing out tasks, work lives in clearly defined roles inside circles, and tensions get processed through structured meetings. A short, deliberate orientation turns that strangeness into confidence.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run this whenever someone joins a Holacracy-practicing organization or when an existing employee moves into a circle for the first time. It is also worth repeating in lighter form when a team first adopts the practice and everyone is, in effect, a new member at once.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Keep it small and personal: the new member, their circle lead, and ideally a Holacracy coach or experienced practitioner who can answer process questions. Two to four people lets the session stay conversational and tailored to the roles this person will actually hold.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Start by separating roles from people, the single most important mental shift: a person is not their job title, they energize one or more roles. Walk the circle structure so the member sees where their roles sit and how circles connect. Then explain the meeting formats, the tactical and governance meetings and their round-based rhythm, including the facilitator and secretary roles anyone may hold. The most practical part is processing tensions: teach the member to notice a gap between what is and what could be, and to route it to tactical for operational blockers or governance for structural change. Close with their first roles, the meetings to attend, and where the live governance record lives. The aim is a member who can sense and channel a tension on day one.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Lead with roles versus people; it unlocks everything else.</li>' +
      '<li>Use the member real roles as examples, not abstract org charts.</li>' +
      '<li>Make tension processing concrete: where does this specific frustration go?</li>' +
      '<li>Point to the governance record so they can self-serve answers later.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Dumping the entire constitution on someone in one sitting.</li>' +
      '<li>Explaining theory without tying it to the member real roles.</li>' +
      '<li>Skipping how to actually process a tension, the day-one skill.</li>' +
      '<li>Leaving the member unsure which meetings to attend first.</li>' +
      '</ul>' +
      '<p>Give new members a confident start. <a href="/l8">Run it in OrgTP</a> and keep roles, circles, and the governance record visible from day one.</p>',
    downloadMarkdown:
      '# Holacracy Onboarding Meeting Template\n\n' +
      'Purpose: Orient a new member to roles, circles, meeting formats, and tension processing so they can sense and channel tensions and contribute quickly.\n\n' +
      '- Duration: 60 minutes\n' +
      '- Cadence: As needed (at member onboarding)\n' +
      '- Participants: New member, circle lead, and a Holacracy coach (2-4 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Check-in and welcome (5 min)\n' +
      '- [ ] Roles vs people, work lives in roles (10 min)\n' +
      '- [ ] Circles and structure (10 min)\n' +
      '- [ ] Meeting formats, tactical and governance (15 min)\n' +
      '- [ ] Processing tensions, where each one goes (15 min)\n' +
      '- [ ] Questions and first actions (5 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Lead with roles versus people.\n' +
      '- Use the member real roles as examples.\n' +
      '- Make tension processing concrete.\n' +
      '- Point to the live governance record.\n\n' +
      '## Notes\n\n' +
      'Member roles:\n\n' +
      'Circles to join:\n\n' +
      'First meetings to attend:\n\n' +
      'Open questions:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/holacracy-onboarding-meeting\n',
  },
  {
    slug: 'holacracy-triage-session',
    title: 'Holacracy Triage Session Template',
    shortName: 'Holacracy Triage Session',
    description:
      'Use this Holacracy triage session template to process a backlog of operational tensions fast, converting each into a clear next-action or project with an owner.',
    category: 'holacracy',
    methodology: 'Holacracy',
    minutes: 30,
    cadence: 'Weekly',
    participants: 'Circle members and core roles (3-10 people)',
    keywords: [
      'holacracy triage session template',
      'holacracy triage session',
      'tension triage meeting',
      'self management meeting',
      'holacracy meeting format',
      'next action processing',
      'operational tension triage',
      'circle triage agenda',
    ],
    steps: [
      { name: 'Check-in Round', minutes: 3, text: 'Each participant calls out what has their attention so the room is present. No cross-talk.' },
      { name: 'Build the Agenda', minutes: 5, text: 'Each participant adds tensions as one-word or short items. No discussion yet; just build the list to triage.' },
      { name: 'Triage Each Item', minutes: 18, text: 'Process items one at a time. For each, ask the owner what they need, then capture a next-action, a project, or a request to another role.' },
      { name: 'Confirm Captures', minutes: 2, text: 'The secretary reads back the captured next-actions, projects, and requests so nothing is lost.' },
      { name: 'Closing Round', minutes: 2, text: 'Each participant shares a brief reflection. No response or discussion.' },
    ],
    bodyHtml:
      '<p>The <strong>Holacracy triage session</strong> is a stripped-down working meeting whose only job is to clear tensions fast. It mirrors the triage portion of a tactical meeting but drops the checklist and metrics rounds, making it ideal for a circle that needs to process a backlog of operational items without a full agenda.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Use a triage session when operational tensions are piling up between regular meetings, when a circle is moving fast and needs frequent short syncs, or when you want a focused block purely for converting blockers into actions. It complements the weekly tactical rather than replacing it.</p>' +
      '<h2>Who attends</h2>' +
      '<p>The circle members holding the relevant roles, usually three to ten people. A <em>facilitator</em> drives the triage and protects the format, and a <em>secretary</em> captures every next-action, project, and request so the work is not lost when the meeting ends.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Open with a quick check-in, then build a one-word agenda with no discussion. The work is the triage itself: take items one at a time, and for each one ask the person who raised it what they actually need. The output is always concrete, a next-action they will do, a project to track, or a request to another role. The rest of the circle exists to help that owner get unblocked, not to debate the topic broadly. Have the secretary read back the captures so nothing slips, then close with a short round. Speed comes from discipline: one item, one owner, one clear output, then move on.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Serve the item owner; the circle helps them, it does not hijack the topic.</li>' +
      '<li>Force a concrete output for every item: next-action, project, or request.</li>' +
      '<li>Keep agenda building free of discussion so triage stays fast.</li>' +
      '<li>Read back the captures before closing so nothing is dropped.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Letting an item sprawl into open debate instead of serving the owner.</li>' +
      '<li>Ending an item with a vague agreement and no captured action.</li>' +
      '<li>Sneaking role or policy changes into triage instead of governance.</li>' +
      '<li>Forgetting to record requests made to other roles.</li>' +
      '</ul>' +
      '<p>Clear your tension backlog without the overhead. <a href="/l8">Run it in OrgTP</a> and keep every next-action, project, and request captured and visible.</p>',
    downloadMarkdown:
      '# Holacracy Triage Session Template\n\n' +
      'Purpose: Process a backlog of operational tensions quickly, converting each into a clear next-action, project, or request to another role with an owner.\n\n' +
      '- Duration: 30 minutes\n' +
      '- Cadence: Weekly\n' +
      '- Participants: Circle members and core roles (3-10 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Check-in Round, what has your attention (3 min)\n' +
      '- [ ] Build the agenda, one-word items (5 min)\n' +
      '- [ ] Triage each item, one at a time (18 min)\n' +
      '- [ ] Confirm captures, read-back (2 min)\n' +
      '- [ ] Closing Round, brief reflections (2 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Serve the item owner; the circle helps, it does not hijack.\n' +
      '- Force a concrete output for every item.\n' +
      '- Keep agenda building free of discussion.\n' +
      '- Read back the captures before closing.\n\n' +
      '## Notes\n\n' +
      'Tensions raised:\n\n' +
      'Next-actions and owners:\n\n' +
      'Projects captured:\n\n' +
      'Requests to other roles:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/holacracy-triage-session\n',
  },
  {
    slug: 'holacracy-cross-circle-sync',
    title: 'Holacracy Cross-Circle Sync Template',
    shortName: 'Holacracy Cross-Circle Sync',
    description:
      'Use this Holacracy cross-circle sync template to align linked circles through their reps, surface shared tensions, and route each to the right meeting.',
    category: 'holacracy',
    methodology: 'Holacracy',
    minutes: 45,
    cadence: 'Biweekly',
    participants: 'Rep links and lead links from linked circles (4-10 people)',
    keywords: [
      'holacracy cross-circle sync template',
      'holacracy cross circle sync',
      'rep link meeting',
      'cross circle coordination',
      'self management meeting',
      'holacracy meeting format',
      'circle linking template',
      'inter circle alignment',
    ],
    steps: [
      { name: 'Check-in Round', minutes: 5, text: 'Each rep and lead shares what has their attention from their circle. No cross-talk.' },
      { name: 'Circle Updates', minutes: 10, text: 'Each circle gives a short update through its rep link: recent changes, key work in flight, and anything that affects linked circles.' },
      { name: 'Shared Tensions', minutes: 15, text: 'Surface tensions that cross circle boundaries, such as handoffs, dependencies, and overlapping accountabilities.' },
      { name: 'Route and Decide', minutes: 10, text: 'For each tension, decide where it belongs: governance for structure, tactical for operations, or a direct role-to-role request.' },
      { name: 'Commitments and Closing', minutes: 5, text: 'Confirm who carries each tension back to which circle, then a brief closing round.' },
    ],
    bodyHtml:
      '<p>The <strong>Holacracy cross-circle sync</strong> keeps linked circles coordinated through the people who connect them. In Holacracy a circle connects to its broader circle through two roles: the lead link, who carries direction in, and the rep link, who carries the inner circle voice out. This sync gives those connecting roles a regular space to align the work that spans boundaries.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run this biweekly, or as often as interdependent circles need, when handoffs between circles are frequent, when dependencies keep causing friction, or when overlapping accountabilities create confusion about who owns what. It is for coordination between circles, distinct from the lead sync, which aligns leads on resourcing and priorities.</p>' +
      '<h2>Who attends</h2>' +
      '<p>The rep links and lead links of the circles that need to coordinate, typically four to ten people, so both directions of each link are represented. A <em>facilitator</em> holds the rounds and a <em>secretary</em> records commitments and where each tension was routed.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Open with a check-in, then each circle gives a short update through its rep link so the group shares context on what is changing and what is in flight. The core is shared tensions: the friction that lives between circles rather than inside one, like a handoff that keeps breaking or two circles claiming the same accountability. The key discipline is routing. Rather than solving these informally, decide deliberately where each tension belongs, a governance meeting for structural change, a tactical meeting for an operational fix, or a direct request between two roles. Confirm who carries each item home and close with a round. The sync exists to surface and route, not to govern circles from outside.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Make sure both link directions are present so each circle has a voice.</li>' +
      '<li>Focus only on tensions that genuinely cross circle boundaries.</li>' +
      '<li>Route every tension rather than resolving structure informally here.</li>' +
      '<li>End with explicit ownership of who carries each item back.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Solving cross-circle structure here instead of routing it to governance.</li>' +
      '<li>Pulling internal circle business into a cross-circle forum.</li>' +
      '<li>Leaving with shared tensions that have no clear owner.</li>' +
      '<li>Letting circle updates balloon into long status reports.</li>' +
      '</ul>' +
      '<p>Keep linked circles moving together. <a href="/l8">Run it in OrgTP</a> and keep cross-circle dependencies, tensions, and routing in one shared view.</p>',
    downloadMarkdown:
      '# Holacracy Cross-Circle Sync Template\n\n' +
      'Purpose: Align linked circles through their rep and lead links, surface tensions that cross circle boundaries, and route each one to its proper meeting.\n\n' +
      '- Duration: 45 minutes\n' +
      '- Cadence: Biweekly\n' +
      '- Participants: Rep links and lead links from linked circles (4-10 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Check-in Round, what has your attention (5 min)\n' +
      '- [ ] Circle updates through rep links (10 min)\n' +
      '- [ ] Shared tensions, handoffs and dependencies (15 min)\n' +
      '- [ ] Route and decide per tension (10 min)\n' +
      '- [ ] Commitments and closing (5 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Make sure both link directions are present.\n' +
      '- Focus only on tensions that cross boundaries.\n' +
      '- Route every tension rather than resolving informally.\n' +
      '- End with explicit ownership of each item.\n\n' +
      '## Notes\n\n' +
      'Circle updates:\n\n' +
      'Shared tensions:\n\n' +
      'Routing decisions:\n\n' +
      'Commitments:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/holacracy-cross-circle-sync\n',
  },
  {
    slug: 'holacracy-idm-practice',
    title: 'Holacracy Integrative Decision-Making Practice Template',
    shortName: 'Holacracy Integrative Decision-Making Practice',
    description:
      'Use this integrative decision making practice template to drill the full IDM cycle, from proposal to objection to integration, so a circle masters governance.',
    category: 'holacracy',
    methodology: 'Holacracy',
    minutes: 75,
    cadence: 'As needed',
    participants: 'Circle members learning the process (4-12 people)',
    keywords: [
      'integrative decision making',
      'integrative decision making template',
      'holacracy idm practice',
      'objection round practice',
      'self management meeting',
      'holacracy meeting format',
      'governance process training',
      'consent decision making drill',
    ],
    steps: [
      { name: 'Check-in and Frame', minutes: 5, text: 'Open with a check-in and frame the session as practice. Pick a low-stakes or sample tension to process safely.' },
      { name: 'Present Proposal', minutes: 10, text: 'The proposer states their tension and a proposal to resolve it. The proposal need not be perfect; it just needs to address the tension.' },
      { name: 'Clarifying Questions', minutes: 10, text: 'Anyone may ask questions to understand the proposal. These are for understanding only, not reactions or opinions in disguise.' },
      { name: 'Reaction Round', minutes: 15, text: 'Each person reacts in turn, one at a time. No cross-talk and no response from the proposer; reactions are simply heard.' },
      { name: 'Amend and Clarify', minutes: 10, text: 'The proposer may amend the proposal based on reactions, or restate the original tension. They stay in control of their proposal.' },
      { name: 'Objection Round and Integration', minutes: 20, text: 'Test for objections, the reasons the proposal would cause harm or move the circle backward. Integrate any valid objection into an amended proposal that resolves the tension without new harm, then adopt.' },
      { name: 'Closing Round', minutes: 5, text: 'Each participant reflects on the practice and what they learned about the process.' },
    ],
    bodyHtml:
      '<p>The <strong>integrative decision-making</strong> practice session exists to build muscle memory for the heart of Holacracy governance. Integrative decision-making, or IDM, is the structured process that lets a circle adopt a proposal as long as no one has a valid objection. It feels mechanical until you have run it a few times, which is exactly what this drill is for.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run this when a team is new to Holacracy, when governance meetings keep collapsing into open debate, or when members confuse personal preferences with valid objections. It is a learning forum on a sample or low-stakes tension, not a live governance meeting, so people can practice the steps without real consequences riding on the outcome.</p>' +
      '<h2>Who attends</h2>' +
      '<p>The circle members who want to get fluent in the process, four to twelve people. A <em>facilitator</em> is essential here; their whole job is to hold the steps firmly and coach the group when it drifts. A <em>secretary</em> can capture the practice proposal to make the drill realistic.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Frame the session clearly as practice so people relax into learning. Walk the full cycle deliberately. A proposer presents a proposal tied to a tension. Clarifying questions build understanding, and the facilitator should stop any that are reactions in disguise. The reaction round gives each person one turn with no cross-talk, which is where most groups struggle and the most learning happens. The proposer then amends or holds. The objection round is the crux: an objection is only valid if the proposal would cause harm or move the circle backward, not merely because someone prefers another path. Valid objections get integrated into an amended proposal that still resolves the original tension. Close with a round on what people learned. Slow, explicit reps here make real governance meetings fast later.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>Hold each step firmly; the value is in the discipline, not the speed.</li>' +
      '<li>Catch clarifying questions that are really reactions and redirect them.</li>' +
      '<li>Coach the objection test out loud: harm or moving backward, not preference.</li>' +
      '<li>Use a safe, sample tension so people focus on the process, not the stakes.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Letting the reaction round become a back-and-forth debate.</li>' +
      '<li>Accepting preferences as objections, which blocks workable proposals.</li>' +
      '<li>Chasing a perfect proposal instead of one that resolves the tension.</li>' +
      '<li>Rushing the steps and losing the very discipline the drill teaches.</li>' +
      '</ul>' +
      '<p>Build real fluency before it counts. <a href="/l8">Run it in OrgTP</a> and practice the full integrative decision-making cycle with your circle.</p>',
    downloadMarkdown:
      '# Holacracy Integrative Decision-Making Practice Template\n\n' +
      'Purpose: Drill the full integrative decision-making cycle, from proposal to reaction to objection to integration, so a circle masters Holacracy governance.\n\n' +
      '- Duration: 75 minutes\n' +
      '- Cadence: As needed (training)\n' +
      '- Participants: Circle members learning the process (4-12 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Check-in and frame as practice (5 min)\n' +
      '- [ ] Present proposal tied to a tension (10 min)\n' +
      '- [ ] Clarifying questions, understanding only (10 min)\n' +
      '- [ ] Reaction round, one at a time (15 min)\n' +
      '- [ ] Amend and clarify (10 min)\n' +
      '- [ ] Objection round and integration (20 min)\n' +
      '- [ ] Closing Round, what we learned (5 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- Hold each step firmly.\n' +
      '- Catch clarifying questions that are really reactions.\n' +
      '- Coach the objection test: harm or backward, not preference.\n' +
      '- Use a safe, sample tension.\n\n' +
      '## Notes\n\n' +
      'Practice tension:\n\n' +
      'Reactions heard:\n\n' +
      'Objections and integration:\n\n' +
      'Lessons learned:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/holacracy-idm-practice\n',
  },
  {
    slug: 'holacracy-checkin-closing-round',
    title: 'Holacracy Check-in and Closing Round Template',
    shortName: 'Holacracy Check-in and Closing Round',
    description:
      'Use this Holacracy check-in and closing round template to open and close any meeting with structured one-at-a-time rounds that build presence and reflection.',
    category: 'holacracy',
    methodology: 'Holacracy',
    minutes: 15,
    cadence: 'As needed',
    participants: 'Any meeting participants (3-15 people)',
    keywords: [
      'holacracy check-in round',
      'holacracy closing round template',
      'meeting check-in round',
      'self management meeting',
      'holacracy meeting format',
      'opening and closing rounds',
      'meeting presence ritual',
      'round based facilitation',
    ],
    steps: [
      { name: 'Set the Round Format', minutes: 2, text: 'The facilitator explains the rule: one person speaks at a time, no cross-talk, no responses. Everyone simply listens.' },
      { name: 'Check-in Round', minutes: 6, text: 'Going around, each person names what has their attention right now so they can set it aside and be present for the work.' },
      { name: 'Transition to Work', minutes: 1, text: 'The facilitator closes the check-in and signals the shift into the working portion of the meeting.' },
      { name: 'Closing Round', minutes: 5, text: 'At the end of the meeting, each person shares a brief reflection on the meeting itself. No response or discussion follows.' },
      { name: 'Adjourn', minutes: 1, text: 'The facilitator confirms next steps were captured by the secretary and formally closes the meeting.' },
    ],
    bodyHtml:
      '<p>The <strong>Holacracy check-in and closing round</strong> are the bookends that frame every well-run circle meeting. They are not small talk. The check-in round helps each person name and set aside whatever is occupying them so they can be fully present, and the closing round gives the meeting a clean, reflective end. The defining rule is simple: one voice at a time, no cross-talk, no responses.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Use these rounds to open and close any meeting, whether or not the rest of it is strictly Holacratic. Every tactical and governance meeting begins and ends this way, but the practice transfers cleanly to project syncs, retrospectives, and team meetings of any kind that benefit from presence and a tidy close.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Everyone in the meeting takes part, three to fifteen people. A <em>facilitator</em> explains the format and holds the no-cross-talk rule, which is the entire discipline. A <em>secretary</em> is not required for the rounds themselves but captures any actions from the body of the meeting.</p>' +
      '<h2>How to run it</h2>' +
      '<p>The mechanics are deliberately plain. The facilitator states the rule first, because the instinct to respond is strong and breaking it dissolves the whole effect. In the check-in, go around the room and let each person say what has their attention, work or personal, without anyone reacting. That act of naming distractions is what frees people to focus. The meeting then moves into its work. At the end, the closing round goes around once more, with each person reflecting briefly on how the meeting went. Again, no one responds. The power is in the structure: equal airtime, no debate, and a moment of genuine presence at both ends. Protecting the no-response rule is the facilitator single most important job.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li>State the no-cross-talk, no-response rule before the first round.</li>' +
      '<li>Let silence sit; do not rush people through their turn.</li>' +
      '<li>Model it yourself by not reacting to anyone check-in or closing.</li>' +
      '<li>Keep it brief; rounds lose power when they sprawl.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Letting people respond to each other, which turns rounds into discussion.</li>' +
      '<li>Skipping the check-in to save time and starting work distracted.</li>' +
      '<li>Dropping the closing round, so the meeting just trails off.</li>' +
      '<li>Treating the rounds as a formality rather than a presence practice.</li>' +
      '</ul>' +
      '<p>Frame every meeting with presence. <a href="/l8">Run it in OrgTP</a> and bring structured check-in and closing rounds to all your circle meetings.</p>',
    downloadMarkdown:
      '# Holacracy Check-in and Closing Round Template\n\n' +
      'Purpose: Open and close any meeting with structured one-at-a-time rounds that build presence at the start and a clean, reflective end, with no cross-talk.\n\n' +
      '- Duration: 15 minutes\n' +
      '- Cadence: As needed (every meeting)\n' +
      '- Participants: Any meeting participants (3-15 people)\n\n' +
      '## Agenda\n\n' +
      '- [ ] Set the round format, no cross-talk (2 min)\n' +
      '- [ ] Check-in Round, what has your attention (6 min)\n' +
      '- [ ] Transition to work (1 min)\n' +
      '- [ ] Closing Round, brief reflections (5 min)\n' +
      '- [ ] Adjourn and confirm captures (1 min)\n\n' +
      '## Facilitator tips\n\n' +
      '- State the no-cross-talk, no-response rule first.\n' +
      '- Let silence sit; do not rush turns.\n' +
      '- Model it by not reacting.\n' +
      '- Keep rounds brief.\n\n' +
      '## Notes\n\n' +
      'Check-in themes:\n\n' +
      'Closing reflections:\n\n' +
      'Captured actions:\n\n' +
      'Next meeting:\n\n' +
      '---\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/holacracy-checkin-closing-round\n',
  },
];
