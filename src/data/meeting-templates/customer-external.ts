import type { MeetingTemplate } from './_types.js';

export const CUSTOMER_EXTERNAL_TEMPLATES: MeetingTemplate[] = [
  {
    slug: 'sales-pipeline-review',
    title: 'Sales Pipeline Review Template',
    shortName: 'Sales Pipeline Review',
    description:
      'A sales pipeline review template to inspect deals by stage, surface stuck opportunities, sharpen forecasts, and assign clear next steps your reps will actually run.',
    category: 'customer',
    methodology: 'General',
    minutes: 45,
    cadence: 'Weekly',
    participants: 'Sales manager and account executives (3-10 people)',
    keywords: [
      'sales pipeline review template',
      'pipeline review meeting agenda',
      'sales forecast meeting',
      'deal review template',
      'sales pipeline meeting',
      'weekly sales meeting agenda',
      'pipeline inspection',
      'sales forecasting template',
    ],
    steps: [
      { name: 'Number check', minutes: 5, text: 'Compare current pipeline coverage against quota and quarter-to-date attainment. Read the headline number out loud.' },
      { name: 'Forecast call', minutes: 10, text: 'Each rep commits, best-case, and pipeline. Flag any deal that moved categories since last week and why.' },
      { name: 'Stage-by-stage inspection', minutes: 15, text: 'Walk deals by stage. Pressure-test exit criteria, next steps, and close dates. Kill or downgrade deals with no recent activity.' },
      { name: 'Stuck and slipping deals', minutes: 8, text: 'Isolate deals that slipped or stalled. Decide one concrete action and owner for each.' },
      { name: 'Coaching and next steps', minutes: 7, text: 'Manager assigns coaching focus, confirms commitments, and logs action items in the CRM before close.' },
    ],
    bodyHtml:
      '<p>A <strong>sales pipeline review</strong> is a recurring working session where a sales manager and reps inspect open deals, test the forecast, and decide what moves each opportunity forward. Run well, it replaces wishful happy-ear forecasting with evidence and accountability.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run a pipeline review weekly during an active selling quarter. Hold it on the same day and time so reps arrive with their CRM already updated. Smaller teams may move to biweekly, but never let two weeks pass without inspecting slipping deals.</p>' +
      '<h2>Who attends</h2>' +
      '<p>The sales manager facilitates. Account executives or reps own their deals and speak to them directly. Keep it to the people who carry a number. Invite sales ops only when a data or process question needs resolving.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Open with the headline coverage number so everyone shares reality. Move to each rep\'s forecast call, then inspect deals stage by stage. Pressure-test the next step and close date on every deal: if a rep cannot name the buyer\'s next action, the date is fiction. Spend the back half on stuck and slipping deals, because those are where the meeting earns its time. Close by confirming one owner and one action per deal at risk.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li><strong>Require updated CRM data before the call</strong> so the meeting is for decisions, not data entry.</li>' +
      '<li><strong>Ask for the buyer\'s next step</strong>, not the rep\'s next step. Buyer action is the real signal.</li>' +
      '<li><strong>Coach in private, inspect in public.</strong> Use the room for deal logic, not personal performance.</li>' +
      '<li><strong>End every deal with an owner and a date.</strong> No orphan action items.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Letting the meeting drift into a status read-out instead of a decision forum.</li>' +
      '<li>Reviewing every deal at equal depth instead of focusing on at-risk and high-value ones.</li>' +
      '<li>Accepting close dates with no supporting buyer activity.</li>' +
      '<li>Skipping the kill decision, so dead deals inflate the forecast for months.</li>' +
      '</ul>' +
      '<p>Want this to run itself every week with owners, dates, and rollover items tracked automatically? <a href="/l8">Run it in OrgTP</a>.</p>',
    downloadMarkdown: `# Sales Pipeline Review Template

Inspect open deals by stage, test the forecast, surface stuck opportunities, and assign clear next steps. A pipeline review turns optimistic guessing into evidence-based forecasting.

**Duration:** 45 minutes
**Cadence:** Weekly
**Participants:** Sales manager and account executives (3-10 people)

## Agenda

- [ ] Number check (5 min) - pipeline coverage vs quota and quarter-to-date attainment
- [ ] Forecast call (10 min) - commit, best-case, pipeline per rep; flag category moves
- [ ] Stage-by-stage inspection (15 min) - test exit criteria, next steps, close dates; kill stale deals
- [ ] Stuck and slipping deals (8 min) - one action and owner per at-risk deal
- [ ] Coaching and next steps (7 min) - confirm commitments, log actions in CRM

## Tips

- Require updated CRM data before the meeting so time goes to decisions
- Ask for the buyer's next step, not the rep's next step
- Coach in private, inspect deal logic in public
- End every at-risk deal with an owner and a date
- Make the kill decision so dead deals stop inflating the forecast

## Notes / Next steps

- Deals to advance: ______________________________
- Deals to kill or downgrade: ____________________
- Coaching focus this week: ______________________
- Owner / action / date: _________________________

---
Free template from OrgTP. Adapt or run it live at orgtp.com/templates/sales-pipeline-review`,
  },
  {
    slug: 'customer-discovery-interview',
    title: 'Customer Discovery Interview Template',
    shortName: 'Customer Discovery Interview',
    description:
      'A customer discovery interview template with proven questions to uncover real problems, jobs to be done, and buying triggers without leading the witness or pitching too soon.',
    category: 'customer',
    methodology: 'General',
    minutes: 30,
    cadence: 'As needed',
    participants: 'Interviewer plus one note-taker and one customer or prospect',
    keywords: [
      'customer discovery interview questions',
      'customer discovery template',
      'customer interview script',
      'user interview template',
      'jobs to be done interview',
      'problem discovery questions',
      'customer research interview',
      'mom test questions',
    ],
    steps: [
      { name: 'Frame and consent', minutes: 3, text: 'Explain you are learning, not selling. Ask permission to record and take notes. Set a relaxed, curious tone.' },
      { name: 'Background and context', minutes: 5, text: 'Understand their role, team, and how the relevant work happens today. Anchor in real recent events.' },
      { name: 'Problem exploration', minutes: 12, text: 'Dig into the most recent time they faced the problem. Ask what they did, what it cost, and what they tried.' },
      { name: 'Workarounds and triggers', minutes: 6, text: 'Surface current workarounds, what would trigger a change, and who else is involved in the decision.' },
      { name: 'Wrap and referral', minutes: 4, text: 'Confirm what you heard, ask what you missed, and request an intro to one more person worth talking to.' },
    ],
    bodyHtml:
      '<p>A <strong>customer discovery interview</strong> is a structured conversation to learn how a customer experiences a problem before you build or pitch a solution. The goal is truth, not validation. The best discovery interviews feel like the interviewer is genuinely curious and never once mentions their product.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run discovery interviews before committing to a new product, feature, or market. Use them when you are unsure who the customer really is, what they value, or whether the problem is painful enough to pay for. Aim for several conversations, not one, so patterns emerge.</p>' +
      '<h2>Who attends</h2>' +
      '<p>One interviewer leads and one note-taker captures verbatim quotes. Keep the customer or prospect outnumbered by no more than one, so they feel heard rather than interrogated. Founders and product leads should sit in directly early on.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Open by making it clear you are learning, not selling. Anchor every question in the past and the specific: ask what they actually did last time, not what they would hypothetically do. Follow emotion and effort, because that is where real problems live. Resist the urge to pitch or to fix the problem in the room. Close by asking what you failed to ask and who else you should meet.</p>' +
      '<h2>Questions to ask</h2>' +
      '<ul>' +
      '<li>Walk me through the last time you ran into this problem. What happened?</li>' +
      '<li>What did you do about it? What did you try before that?</li>' +
      '<li>How much time or money did that cost you, roughly?</li>' +
      '<li>What is the hardest part of doing this today?</li>' +
      '<li>What would have to be true for you to change how you handle this?</li>' +
      '<li>Who else is affected by this, and who would weigh in on a fix?</li>' +
      '<li>Is there anything I should have asked but did not?</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Pitching your idea, which trains the customer to be polite instead of honest.</li>' +
      '<li>Asking hypothetical questions like would you buy this instead of digging into past behavior.</li>' +
      '<li>Leading the witness with questions that signal the answer you want.</li>' +
      '<li>Running one interview and treating it as proof rather than a single data point.</li>' +
      '</ul>' +
      '<p>Capture every interview, tag the patterns, and turn quotes into decisions. <a href="/l8">Run it in OrgTP</a>.</p>',
    downloadMarkdown: `# Customer Discovery Interview Template

Learn how a customer experiences a problem before you build or pitch. The goal is truth, not validation. Anchor questions in past behavior and never pitch in the room.

**Duration:** 30 minutes
**Cadence:** As needed
**Participants:** Interviewer plus one note-taker and one customer or prospect

## Agenda

- [ ] Frame and consent (3 min) - explain you are learning, not selling; ask to record
- [ ] Background and context (5 min) - role, team, how the work happens today
- [ ] Problem exploration (12 min) - last time the problem happened, what it cost
- [ ] Workarounds and triggers (6 min) - current fixes, what would trigger change, who decides
- [ ] Wrap and referral (4 min) - confirm, ask what you missed, request an intro

## Questions

- Walk me through the last time you ran into this problem. What happened?
- What did you do about it? What did you try before that?
- How much time or money did that cost you, roughly?
- What is the hardest part of doing this today?
- What would have to be true for you to change how you handle this?
- Who else is affected, and who would weigh in on a fix?
- Is there anything I should have asked but did not?

## Notes / Next steps

- Verbatim quotes: ______________________________
- Problem severity (1-5): ________________________
- Buying trigger observed: _______________________
- Referral / next interview: _____________________

---
Free template from OrgTP. Adapt or run it live at orgtp.com/templates/customer-discovery-interview`,
  },
  {
    slug: 'customer-success-qbr',
    title: 'Customer Success QBR Template',
    shortName: 'Customer Success QBR',
    description:
      'A customer success QBR template to review outcomes against goals, prove ROI, surface risks early, and align on the next-quarter plan that drives renewal and expansion.',
    category: 'customer',
    methodology: 'General',
    minutes: 60,
    cadence: 'Quarterly',
    participants: 'Customer success manager, account exec, and customer stakeholders (4-8 people)',
    keywords: [
      'QBR template',
      'quarterly business review template',
      'customer success QBR agenda',
      'customer business review',
      'qbr meeting agenda',
      'account review template',
      'customer health review',
      'renewal planning meeting',
    ],
    steps: [
      { name: 'Welcome and goals recap', minutes: 8, text: 'Reconnect on the goals set last quarter. Restate why the customer bought and what success looks like to them.' },
      { name: 'Results and ROI', minutes: 15, text: 'Present outcomes against those goals with real usage and impact data. Tie results to the customer\'s business metrics.' },
      { name: 'Wins and challenges', minutes: 12, text: 'Celebrate what worked, then name friction honestly. Invite the customer to share their own view candidly.' },
      { name: 'Roadmap and opportunities', minutes: 12, text: 'Preview relevant roadmap items and surface adoption or expansion opportunities that map to their goals.' },
      { name: 'Next-quarter plan', minutes: 10, text: 'Agree on goals, owners, and milestones for the coming quarter. Confirm the renewal timeline.' },
      { name: 'Action items and close', minutes: 3, text: 'Read back commitments on both sides with owners and dates. Schedule the next touchpoint.' },
    ],
    bodyHtml:
      '<p>A <strong>customer success QBR</strong>, or quarterly business review, is a strategic check-in where you and the customer review outcomes against goals, prove value delivered, and align on the plan for the next quarter. A strong QBR is about the customer\'s business, not a feature tour.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run a QBR quarterly for strategic and high-value accounts. Schedule it well ahead of renewal so risks surface with time to act. Lighter accounts may warrant a shorter semi-annual review, but never skip the conversation that ties your product to their results.</p>' +
      '<h2>Who attends</h2>' +
      '<p>The customer success manager leads, often with the account executive for commercial topics. On the customer side, include both the day-to-day champion and an economic buyer or executive sponsor who can speak to business priorities and budget.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Open by restating the customer\'s goals so the entire meeting hangs on their definition of success. Present results against those goals with real data, not vanity metrics. Be honest about challenges, since hiding friction erodes trust faster than naming it. Use the roadmap to connect future value to their priorities, then co-build the next-quarter plan. End with mutual commitments and a confirmed renewal timeline.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li><strong>Lead with their goals, not your features.</strong> The QBR is their meeting.</li>' +
      '<li><strong>Bring data the customer cannot pull themselves</strong> so the session is worth their time.</li>' +
      '<li><strong>Get the economic buyer in the room.</strong> Renewals stall when only the champion attends.</li>' +
      '<li><strong>Name risks early.</strong> A surprise at renewal is a failure of every prior QBR.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Turning the QBR into a one-way status deck with no dialogue.</li>' +
      '<li>Showing usage numbers without connecting them to the customer\'s outcomes.</li>' +
      '<li>Avoiding hard topics so problems compound until the renewal conversation.</li>' +
      '<li>Leaving without a written next-quarter plan and owners on both sides.</li>' +
      '</ul>' +
      '<p>Keep goals, outcomes, and action items tracked across every quarter automatically. <a href="/l8">Run it in OrgTP</a>.</p>',
    downloadMarkdown: `# Customer Success QBR Template

A quarterly business review to confirm outcomes against goals, prove ROI, surface risk early, and align on the next-quarter plan that drives renewal and expansion.

**Duration:** 60 minutes
**Cadence:** Quarterly
**Participants:** Customer success manager, account exec, and customer stakeholders (4-8 people)

## Agenda

- [ ] Welcome and goals recap (8 min) - reconnect on last quarter's goals and success criteria
- [ ] Results and ROI (15 min) - outcomes vs goals, tied to the customer's business metrics
- [ ] Wins and challenges (12 min) - celebrate wins, name friction honestly
- [ ] Roadmap and opportunities (12 min) - relevant roadmap, adoption and expansion fit
- [ ] Next-quarter plan (10 min) - goals, owners, milestones, renewal timeline
- [ ] Action items and close (3 min) - read back commitments with owners and dates

## Tips

- Lead with the customer's goals, not your features
- Bring data the customer cannot pull themselves
- Get the economic buyer in the room, not just the champion
- Name risks early; a surprise at renewal is a QBR failure

## Notes / Next steps

- Outcomes vs goals: ____________________________
- Open risks: ___________________________________
- Expansion opportunities: ______________________
- Next-quarter goals / owners: __________________
- Renewal date: _________________________________

---
Free template from OrgTP. Adapt or run it live at orgtp.com/templates/customer-success-qbr`,
  },
  {
    slug: 'win-loss-review-meeting',
    title: 'Win / Loss Review Template',
    shortName: 'Win / Loss Review',
    description:
      'A win loss analysis template to debrief closed deals, learn why buyers chose you or a competitor, and turn the patterns into sharper messaging, product, and sales plays.',
    category: 'customer',
    methodology: 'General',
    minutes: 45,
    cadence: 'Monthly',
    participants: 'Sales, marketing, and product leaders (3-8 people)',
    keywords: [
      'win loss analysis template',
      'win loss review meeting',
      'deal debrief template',
      'closed deal review',
      'win loss interview questions',
      'sales loss analysis',
      'competitive win loss',
      'deal retrospective template',
    ],
    steps: [
      { name: 'Set the sample', minutes: 5, text: 'Pick the closed deals to review this cycle. Balance wins and losses so the lessons are not one-sided.' },
      { name: 'Win patterns', minutes: 12, text: 'Walk recent wins. Capture why the buyer chose you, what nearly killed the deal, and what accelerated it.' },
      { name: 'Loss patterns', minutes: 12, text: 'Walk recent losses. Separate price, product, timing, and process reasons. Be honest about self-inflicted losses.' },
      { name: 'Competitive signal', minutes: 8, text: 'Compare who you won and lost against. Note competitor moves, pricing, and the stories buyers told.' },
      { name: 'Decisions and owners', minutes: 8, text: 'Translate patterns into concrete changes to messaging, product, or sales process with owners and dates.' },
    ],
    bodyHtml:
      '<p>A <strong>win / loss review</strong> is a recurring debrief where sales, marketing, and product study why deals closed the way they did. The point is not to relitigate individual deals, but to find the patterns that quietly decide your win rate.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run a win / loss review monthly once you have enough closed deals to see patterns. In lower-volume enterprise sales, move to quarterly but interview buyers directly. The discipline matters more than the frequency: a review that never changes anything is theater.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Bring sales leadership, product marketing, and a product representative. Sales knows what happened in the room, marketing owns the message, and product owns the gaps. Keep the group small enough to make decisions, not just observations.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Start by choosing a balanced sample of wins and losses so you do not only study failure. Separate the reasons into price, product, timing, and process, because the fix for each is different. Be ruthlessly honest about self-inflicted losses, since those are the ones you can actually control. Look across deals for the recurring story buyers tell, then convert that into specific changes with owners. A pattern with no decision is wasted insight.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li><strong>Use the buyer\'s words, not the rep\'s rationalization.</strong> Interview the buyer when you can.</li>' +
      '<li><strong>Separate controllable from uncontrollable losses</strong> so effort goes where it changes the score.</li>' +
      '<li><strong>Look for patterns across deals</strong>, not lessons from a single dramatic one.</li>' +
      '<li><strong>Assign an owner to every pattern</strong>, or nothing improves.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Only reviewing losses, which breeds defensiveness and misses why you win.</li>' +
      '<li>Accepting price as the loss reason when the real cause is value or process.</li>' +
      '<li>Blaming the rep instead of the system that let the deal slip.</li>' +
      '<li>Generating insight without committing to a single change.</li>' +
      '</ul>' +
      '<p>Track patterns and the changes they drive across every cycle. <a href="/l8">Run it in OrgTP</a>.</p>',
    downloadMarkdown: `# Win / Loss Review Template

Debrief closed deals to learn why buyers chose you or a competitor, then turn the patterns into sharper messaging, product, and sales plays. Study wins and losses together.

**Duration:** 45 minutes
**Cadence:** Monthly
**Participants:** Sales, marketing, and product leaders (3-8 people)

## Agenda

- [ ] Set the sample (5 min) - pick a balanced set of recent wins and losses
- [ ] Win patterns (12 min) - why buyers chose you, what nearly killed each deal
- [ ] Loss patterns (12 min) - separate price, product, timing, process reasons
- [ ] Competitive signal (8 min) - who you won and lost against, competitor moves
- [ ] Decisions and owners (8 min) - changes to messaging, product, process with owners

## Tips

- Use the buyer's words, not the rep's rationalization
- Separate controllable from uncontrollable losses
- Look for patterns across deals, not one dramatic one
- Assign an owner to every pattern or nothing improves

## Notes / Next steps

- Win drivers seen: _____________________________
- Loss drivers seen: ____________________________
- Competitive notes: ____________________________
- Changes to make / owners: _____________________

---
Free template from OrgTP. Adapt or run it live at orgtp.com/templates/win-loss-review-meeting`,
  },
  {
    slug: 'customer-advisory-board-meeting',
    title: 'Customer Advisory Board Template',
    shortName: 'Customer Advisory Board Meeting',
    description:
      'A customer advisory board template to gather strategic input from top customers, pressure-test the roadmap, and deepen relationships without turning the session into a sales pitch.',
    category: 'customer',
    methodology: 'General',
    minutes: 120,
    cadence: 'Quarterly',
    participants: 'Executive sponsor, product leaders, and 6-12 senior customers',
    keywords: [
      'customer advisory board template',
      'CAB meeting agenda',
      'customer advisory board agenda',
      'advisory board template',
      'voice of customer meeting',
      'strategic customer council',
      'roadmap feedback session',
      'customer council agenda',
    ],
    steps: [
      { name: 'Welcome and ground rules', minutes: 15, text: 'Set the tone: this is their forum for candid strategic input, not a sales meeting. Introduce members and intent.' },
      { name: 'Market and vision context', minutes: 20, text: 'Share where the market is heading and your vision in brief. Keep it short so the room can react, not just listen.' },
      { name: 'Roadmap pressure-test', minutes: 35, text: 'Walk key roadmap themes and ask members to challenge priorities, gaps, and assumptions against their own reality.' },
      { name: 'Deep-dive discussion', minutes: 30, text: 'Facilitate open discussion on one or two strategic themes. Capture verbatim insight and points of disagreement.' },
      { name: 'Synthesis and commitments', minutes: 15, text: 'Reflect back what you heard, name what you will act on, and be clear about what you will not, and why.' },
      { name: 'Thanks and next steps', minutes: 5, text: 'Thank members, confirm the next session, and explain how their input feeds back into decisions.' },
    ],
    bodyHtml:
      '<p>A <strong>customer advisory board</strong>, or CAB, is a curated forum where a small group of senior customers give strategic input on direction, roadmap, and market. Done right, it is the highest-signal voice-of-customer channel you have. Done wrong, it becomes a thinly disguised pitch that members quietly stop attending.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Convene a CAB once or twice a year, or quarterly for fast-moving products. Use it for strategic questions, not feature requests, which belong in normal product channels. Reserve it for the customers whose judgment and standing make their input worth structuring a forum around.</p>' +
      '<h2>Who attends</h2>' +
      '<p>An executive sponsor hosts to signal that leadership is listening. Product and strategy leaders attend to absorb input and answer hard questions. On the customer side, invite six to twelve senior practitioners or executives who represent your most important segments and will speak candidly.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Set the ground rules first: this is their forum for honest strategic input. Give just enough market and vision context to react to, then get out of the way. Spend the bulk of the time letting members pressure-test the roadmap and debate strategic themes with each other, not just with you. Capture disagreement, because consensus is rarely the interesting signal. Close by stating clearly what you will act on and what you will not.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li><strong>Talk less than the customers do.</strong> Aim for them speaking most of the meeting.</li>' +
      '<li><strong>Never sell.</strong> The moment it feels like a pitch, the candor disappears.</li>' +
      '<li><strong>Let members debate each other.</strong> Peer-to-peer disagreement is gold.</li>' +
      '<li><strong>Close the loop after the meeting</strong> so members see their input changed something.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Filling the agenda with presentations and leaving no room for the customers to talk.</li>' +
      '<li>Inviting the wrong people, such as friendly but junior contacts who will not challenge you.</li>' +
      '<li>Treating it as a sales or upsell opportunity and burning the relationship.</li>' +
      '<li>Gathering input and never reporting back what you did with it.</li>' +
      '</ul>' +
      '<p>Capture every theme and close the loop with members between sessions. <a href="/l8">Run it in OrgTP</a>.</p>',
    downloadMarkdown: `# Customer Advisory Board Template

Gather strategic input from your most important customers, pressure-test the roadmap, and deepen relationships. Their forum, not your pitch. Let members talk more than you do.

**Duration:** 120 minutes
**Cadence:** Quarterly
**Participants:** Executive sponsor, product leaders, and 6-12 senior customers

## Agenda

- [ ] Welcome and ground rules (15 min) - candid input, not a sales meeting; intros
- [ ] Market and vision context (20 min) - brief direction so the room can react
- [ ] Roadmap pressure-test (35 min) - members challenge priorities, gaps, assumptions
- [ ] Deep-dive discussion (30 min) - open debate on one or two strategic themes
- [ ] Synthesis and commitments (15 min) - what you will act on and what you will not
- [ ] Thanks and next steps (5 min) - confirm next session and feedback loop

## Tips

- Talk less than the customers do
- Never sell; the moment it feels like a pitch, candor disappears
- Let members debate each other, not just you
- Close the loop after so members see their input mattered

## Notes / Next steps

- Strategic themes raised: _______________________
- Points of disagreement: ________________________
- Will act on: __________________________________
- Will not act on (and why): _____________________
- Follow-up owner: ______________________________

---
Free template from OrgTP. Adapt or run it live at orgtp.com/templates/customer-advisory-board-meeting`,
  },
  {
    slug: 'investor-update-meeting',
    title: 'Investor Update Template',
    shortName: 'Investor Update Meeting',
    description:
      'An investor update template to keep your board and investors informed with metrics, wins, lowlights, and clear asks, building trust and turning investors into useful allies.',
    category: 'customer',
    methodology: 'General',
    minutes: 45,
    cadence: 'Monthly',
    participants: 'Founder or CEO, leadership, and investors or board members (3-8 people)',
    keywords: [
      'investor update template',
      'board meeting agenda template',
      'investor update email',
      'monthly investor update',
      'startup board meeting agenda',
      'investor reporting template',
      'board deck template',
      'investor metrics update',
    ],
    steps: [
      { name: 'Headline and TLDR', minutes: 5, text: 'Open with the single most important thing this period in two sentences, then your top metric versus plan.' },
      { name: 'Key metrics', minutes: 10, text: 'Walk core metrics against plan and prior period: revenue, growth, burn, runway, and the one or two that define this stage.' },
      { name: 'Wins and progress', minutes: 8, text: 'Highlight real wins on product, customers, hiring, and pipeline. Be specific, not promotional.' },
      { name: 'Lowlights and risks', minutes: 10, text: 'Name what went wrong and what worries you. Candor here is what builds long-term investor trust.' },
      { name: 'Asks and help needed', minutes: 8, text: 'Make specific, actionable asks: intros, hires, advice. Vague asks get vague help.' },
      { name: 'Discussion and next steps', minutes: 4, text: 'Open the floor, capture commitments, and confirm what you will report next period.' },
    ],
    bodyHtml:
      '<p>An <strong>investor update</strong> is a regular, structured report that keeps your investors and board informed on metrics, progress, problems, and where you need help. The best updates are honest, numbers-first, and end with specific asks, because investors help most when they know exactly what you need.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Send a written investor update monthly and hold a live board meeting quarterly. Consistency matters more than polish: investors trust founders who show up the same way every month, in good periods and bad. Never go dark when the news is hard, since silence reads as worse than the truth.</p>' +
      '<h2>Who attends</h2>' +
      '<p>The founder or CEO leads. Bring relevant leaders to own their function in a live board setting. Your audience is investors and board members who can offer capital, connections, and counsel, so treat their attention as a resource to deploy, not just inform.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Open with a two-sentence headline so a busy reader gets the gist instantly. Lead with metrics against plan, because numbers anchor the conversation in reality. Share wins, but spend real time on lowlights and risks, since hiding them only delays the reckoning and erodes trust. End with specific asks. The whole point of having investors is the help, and they cannot give it if you do not ask precisely.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li><strong>Send the written update before any live meeting</strong> so the room can discuss, not read.</li>' +
      '<li><strong>Lead with the number that matters most</strong> at your stage and show it against plan.</li>' +
      '<li><strong>Be candid about lowlights.</strong> Trust compounds; spin destroys it.</li>' +
      '<li><strong>Make your asks specific.</strong> Name the person, role, or decision you need help with.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Going dark when results are bad, which alarms investors more than the results would.</li>' +
      '<li>Burying metrics under narrative so no one can see how the business is actually doing.</li>' +
      '<li>Only sharing wins, which trains investors to distrust your reporting.</li>' +
      '<li>Ending with no asks and wasting the most valuable thing in the room.</li>' +
      '</ul>' +
      '<p>Keep metrics, lowlights, and asks consistent and tracked across every period. <a href="/l8">Run it in OrgTP</a>.</p>',
    downloadMarkdown: `# Investor Update Template

Keep investors and the board informed with metrics, wins, lowlights, and clear asks. Honest, numbers-first, and ending with specific requests turns investors into useful allies.

**Duration:** 45 minutes
**Cadence:** Monthly
**Participants:** Founder or CEO, leadership, and investors or board members (3-8 people)

## Agenda

- [ ] Headline and TLDR (5 min) - the single most important thing, plus top metric vs plan
- [ ] Key metrics (10 min) - revenue, growth, burn, runway vs plan and prior period
- [ ] Wins and progress (8 min) - product, customers, hiring, pipeline; be specific
- [ ] Lowlights and risks (10 min) - what went wrong and what worries you
- [ ] Asks and help needed (8 min) - intros, hires, advice; make them specific
- [ ] Discussion and next steps (4 min) - capture commitments, confirm next report

## Tips

- Send the written update before any live meeting
- Lead with the number that matters most at your stage
- Be candid about lowlights; trust compounds, spin destroys it
- Make asks specific: name the person, role, or decision

## Notes / Next steps

- Headline: _____________________________________
- Metrics vs plan: ______________________________
- Top risks: ____________________________________
- Asks / owners: ________________________________

---
Free template from OrgTP. Adapt or run it live at orgtp.com/templates/investor-update-meeting`,
  },
  {
    slug: 'discovery-demo-call',
    title: 'Discovery / Demo Call Template',
    shortName: 'Discovery / Demo Call',
    description:
      'A discovery and demo call template with a proven talk track to qualify the buyer, uncover pain, and tailor a demo to their problem instead of dumping every feature.',
    category: 'customer',
    methodology: 'General',
    minutes: 45,
    cadence: 'As needed',
    participants: 'Account executive, optional sales engineer, and prospect stakeholders',
    keywords: [
      'discovery call template',
      'sales demo script',
      'discovery and demo call agenda',
      'sales discovery questions',
      'demo call talk track',
      'qualification call template',
      'sales discovery framework',
      'product demo agenda',
    ],
    steps: [
      { name: 'Open and agenda', minutes: 4, text: 'Build rapport, confirm time, and set a two-way agenda: a few questions first, then a demo tailored to their answers.' },
      { name: 'Discovery questions', minutes: 15, text: 'Uncover current state, pain, impact, decision process, and timeline before showing anything. Earn the right to demo.' },
      { name: 'Tailored demo', minutes: 15, text: 'Show only the few capabilities that solve the pain they named. Narrate the outcome, not the feature list.' },
      { name: 'Handle questions', minutes: 6, text: 'Answer objections directly. Surface concerns now rather than letting them harden after the call.' },
      { name: 'Next steps and close', minutes: 5, text: 'Confirm fit, agree on a concrete next step with a date, and identify who else needs to be involved.' },
    ],
    bodyHtml:
      '<p>A <strong>discovery and demo call</strong> is the working first conversation where a seller qualifies the buyer, uncovers their real problem, and shows only the part of the product that solves it. The best ones feel like a focused diagnosis, not a feature firehose. Discover first, demo second, always.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run this whenever a qualified prospect is ready to evaluate. For complex deals you may split discovery and demo into two calls, but never demo cold: a demo with no discovery is a guess dressed up as a presentation. Reserve deep demos for buyers who have shown real pain and intent.</p>' +
      '<h2>Who attends</h2>' +
      '<p>The account executive leads discovery and next steps. A sales engineer can drive the technical demo for complex products. On the buyer side, push to include both the user who feels the pain and someone who can speak to the decision process and budget.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Open by setting a two-way agenda so the buyer knows questions come before the demo. Spend real time in discovery, uncovering current state, pain, impact, decision process, and timeline. Then tailor the demo to exactly what they told you, showing two or three capabilities that map to their pain. Narrate outcomes, not clicks. Handle objections in the room, and never end without a concrete, dated next step.</p>' +
      '<h2>Questions to ask</h2>' +
      '<ul>' +
      '<li>What prompted you to take this call now?</li>' +
      '<li>How are you handling this today, and where does it break down?</li>' +
      '<li>What is the impact of leaving it the way it is?</li>' +
      '<li>Who else is affected, and who is involved in a decision like this?</li>' +
      '<li>If this works, what does success look like in six months?</li>' +
      '<li>What is your timeline, and what would get in the way of acting on it?</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Demoing before discovery, so the buyer sees features that solve no problem of theirs.</li>' +
      '<li>Showing every capability instead of the two or three that matter to them.</li>' +
      '<li>Talking past objections rather than surfacing and addressing them.</li>' +
      '<li>Ending with maybe a follow-up instead of a specific dated next step.</li>' +
      '</ul>' +
      '<p>Capture discovery answers and next steps so nothing slips between calls. <a href="/l8">Run it in OrgTP</a>.</p>',
    downloadMarkdown: `# Discovery / Demo Call Template

Qualify the buyer, uncover real pain, and tailor the demo to their problem instead of dumping every feature. Discover first, demo second, always. End with a dated next step.

**Duration:** 45 minutes
**Cadence:** As needed
**Participants:** Account executive, optional sales engineer, and prospect stakeholders

## Agenda

- [ ] Open and agenda (4 min) - rapport, confirm time, set a two-way agenda
- [ ] Discovery questions (15 min) - current state, pain, impact, decision process, timeline
- [ ] Tailored demo (15 min) - two or three capabilities that solve their pain
- [ ] Handle questions (6 min) - surface and address objections now
- [ ] Next steps and close (5 min) - confirm fit, agree a dated next step, identify stakeholders

## Questions

- What prompted you to take this call now?
- How are you handling this today, and where does it break down?
- What is the impact of leaving it the way it is?
- Who else is affected, and who is involved in a decision?
- If this works, what does success look like in six months?
- What is your timeline, and what would get in the way?

## Notes / Next steps

- Pain uncovered: _______________________________
- Decision process / stakeholders: _______________
- Timeline: _____________________________________
- Next step / date: _____________________________

---
Free template from OrgTP. Adapt or run it live at orgtp.com/templates/discovery-demo-call`,
  },
  {
    slug: 'account-planning-meeting',
    title: 'Account Planning Template',
    shortName: 'Account Planning Meeting',
    description:
      'An account planning template to map key accounts, find white space, build relationships with decision-makers, and set a growth plan that protects and expands revenue.',
    category: 'customer',
    methodology: 'General',
    minutes: 60,
    cadence: 'Quarterly',
    participants: 'Account team: AE, customer success, and sales leadership (3-6 people)',
    keywords: [
      'account planning template',
      'strategic account plan',
      'key account planning meeting',
      'account growth plan template',
      'account mapping template',
      'white space analysis',
      'account strategy session',
      'territory planning template',
    ],
    steps: [
      { name: 'Account snapshot', minutes: 8, text: 'Recap the account: current revenue, products in use, health, renewal date, and recent wins or risks.' },
      { name: 'Relationship map', minutes: 12, text: 'Map decision-makers, champions, blockers, and gaps. Identify relationships you need to build or repair.' },
      { name: 'White space analysis', minutes: 12, text: 'Identify untapped products, teams, or use cases. Where could you expand if you earned the right?' },
      { name: 'Risks and threats', minutes: 8, text: 'Name renewal risk, competitive threats, and single points of failure in the relationship.' },
      { name: 'Growth plan', minutes: 15, text: 'Set specific expansion and retention goals with plays, owners, and timelines tied to the account\'s priorities.' },
      { name: 'Action items', minutes: 5, text: 'Confirm the top three moves for the next quarter with owners and dates. Schedule the next review.' },
    ],
    bodyHtml:
      '<p>An <strong>account planning</strong> session is where the account team steps back from day-to-day execution to build a deliberate plan for protecting and growing a key account. It turns a reactive relationship into a strategy with named plays, owners, and goals.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run account planning quarterly for your most strategic and highest-potential accounts. New strategic logos warrant a plan within the first ninety days. Do not spread it across every account: reserve the depth for the accounts where focused effort meaningfully changes revenue.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Bring the full account team: the account executive who owns growth, the customer success manager who owns the relationship and adoption, and sales leadership to challenge the plan and unlock resources. For the largest accounts, loop in an executive sponsor who can open doors.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Start with an honest account snapshot so the plan rests on reality, not optimism. Map the relationships next, because deals are won and lost on people, and gaps in the map are gaps in the plan. Find the white space where you could expand, then name the risks that could shrink the account. Convert all of it into a growth plan with specific plays, owners, and dates. Close by committing to the top three moves for the quarter.</p>' +
      '<h2>Facilitator tips</h2>' +
      '<ul>' +
      '<li><strong>Be honest in the snapshot.</strong> A plan built on wishful health is worthless.</li>' +
      '<li><strong>Map blockers, not just champions.</strong> Knowing your opposition is half the plan.</li>' +
      '<li><strong>Tie every expansion play to the account\'s priorities</strong>, not your quota.</li>' +
      '<li><strong>Limit the quarter to three real moves.</strong> A plan with twenty actions has none.</li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Confusing a plan with a forecast; the plan is the actions, not the number.</li>' +
      '<li>Mapping only the friendly contacts and missing blockers and decision-makers.</li>' +
      '<li>Listing expansion ideas with no owner, date, or connection to the buyer\'s goals.</li>' +
      '<li>Writing the plan once and never revisiting it as the account changes.</li>' +
      '</ul>' +
      '<p>Keep the relationship map, white space, and plays live across every quarter. <a href="/l8">Run it in OrgTP</a>.</p>',
    downloadMarkdown: `# Account Planning Template

Map a key account, find white space, build relationships with decision-makers, and set a growth plan that protects and expands revenue. Strategy with named plays, owners, and goals.

**Duration:** 60 minutes
**Cadence:** Quarterly
**Participants:** Account team: AE, customer success, and sales leadership (3-6 people)

## Agenda

- [ ] Account snapshot (8 min) - revenue, products in use, health, renewal date, recent wins
- [ ] Relationship map (12 min) - decision-makers, champions, blockers, gaps to close
- [ ] White space analysis (12 min) - untapped products, teams, and use cases
- [ ] Risks and threats (8 min) - renewal risk, competition, single points of failure
- [ ] Growth plan (15 min) - expansion and retention plays with owners and timelines
- [ ] Action items (5 min) - top three moves for the quarter with owners and dates

## Tips

- Be honest in the snapshot; wishful health makes the plan worthless
- Map blockers, not just champions
- Tie every expansion play to the account's priorities, not your quota
- Limit the quarter to three real moves

## Notes / Next steps

- Health and renewal date: ______________________
- Relationship gaps to close: ____________________
- White space to pursue: _________________________
- Top three moves / owners: _____________________

---
Free template from OrgTP. Adapt or run it live at orgtp.com/templates/account-planning-meeting`,
  },
];
