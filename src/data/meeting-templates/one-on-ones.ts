import type { MeetingTemplate } from './_types.js';

export const ONE_ON_ONE_TEMPLATES: MeetingTemplate[] = [
  {
    slug: 'weekly-one-on-one-meeting',
    title: 'Weekly Manager 1:1 Template',
    shortName: 'Weekly Manager 1:1',
    description:
      'A weekly manager 1:1 template with a ready agenda, check-in flow, and the best one on one meeting questions to build trust, unblock work, and grow your direct report.',
    category: 'one-on-ones',
    methodology: 'General',
    minutes: 30,
    cadence: 'Weekly',
    participants: 'Manager and direct report (2 people)',
    keywords: [
      'one on one meeting template',
      'weekly 1:1 template',
      '1:1 agenda',
      'manager one on one questions',
      'weekly check in template',
      'direct report meeting',
      'one on one questions',
      'employee 1:1 agenda',
    ],
    steps: [
      {
        name: 'Personal check-in',
        minutes: 5,
        text: 'Open with a human question. Ask how they are doing outside of work and listen before steering into tasks.',
      },
      {
        name: 'Their topics first',
        minutes: 10,
        text: 'Let the report drive. Ask what is on their mind, what is blocking them, and what they want help with this week.',
      },
      {
        name: 'Your topics and priorities',
        minutes: 7,
        text: 'Share context, align on the top priorities for the week, and clarify any shifting expectations.',
      },
      {
        name: 'Growth and feedback',
        minutes: 5,
        text: 'Give one piece of specific feedback and ask for feedback in return. Touch on a development goal.',
      },
      {
        name: 'Action items',
        minutes: 3,
        text: 'Recap commitments, name owners and dates, and confirm what each of you will do before the next 1:1.',
      },
    ],
    bodyHtml:
      '<p>The <strong>weekly manager 1:1 template</strong> gives you a repeatable structure for the single most important recurring meeting a manager runs. Done well, a 1:1 builds trust, surfaces problems early, and turns a direct report into someone who grows fast and stays engaged.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run this every week with each direct report. Thirty focused minutes beats a sprawling hour once a month. Weekly cadence keeps small issues small and means feedback lands while it still matters.</p>' +
      '<h2>Who attends</h2>' +
      '<p>Just the manager and the direct report. This is their meeting, not yours. Protect it from cancellation, and never let it become a status update you could have read in a tool.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Start human, then hand the agenda to your report and let them go first. Listen more than you talk. Save your own topics and priorities for the middle, give one clear piece of feedback near the end, and close by writing down who owns what. <em>The report should leave feeling heard, not managed.</em></p>' +
      '<h2>Questions to ask</h2>' +
      '<ul>' +
      '<li><strong>What is on your mind this week?</strong> Let them set the agenda before you do.</li>' +
      '<li><strong>What is blocking you, and how can I help remove it?</strong></li>' +
      '<li><strong>What did you accomplish that you are proud of?</strong></li>' +
      '<li><strong>Where do you feel stuck or unclear on priorities?</strong></li>' +
      '<li><strong>What feedback do you have for me or the team?</strong></li>' +
      '<li><strong>What is one thing you want to learn or grow in right now?</strong></li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Turning the 1:1 into a status report instead of a conversation.</li>' +
      '<li>Talking the whole time and leaving no space for their topics.</li>' +
      '<li>Cancelling when you get busy, which signals the meeting does not matter.</li>' +
      '<li>Never writing down action items, so the same issues resurface next week.</li>' +
      '</ul>' +
      '<p>Ready to make your 1:1s consistent? <a href="/l8">Run it in OrgTP</a> and keep every agenda, action item, and growth note in one place.</p>',
    downloadMarkdown:
      '# Weekly Manager 1:1 Template\n\n' +
      'Purpose: A focused weekly conversation between a manager and a direct report to build trust, unblock work, give feedback, and support growth.\n\n' +
      '- Duration: 30 minutes\n' +
      '- Cadence: Weekly\n' +
      '- Participants: Manager and direct report\n\n' +
      '## Agenda\n\n' +
      '- [ ] Personal check-in (5 min)\n' +
      '- [ ] Their topics first (10 min)\n' +
      '- [ ] Your topics and priorities (7 min)\n' +
      '- [ ] Growth and feedback (5 min)\n' +
      '- [ ] Action items (3 min)\n\n' +
      '## Questions to ask\n\n' +
      '- What is on your mind this week?\n' +
      '- What is blocking you, and how can I help remove it?\n' +
      '- What did you accomplish that you are proud of?\n' +
      '- Where do you feel stuck or unclear on priorities?\n' +
      '- What feedback do you have for me or the team?\n' +
      '- What is one thing you want to learn or grow in right now?\n\n' +
      '## Action items\n\n' +
      '- Owner: __________  Action: __________  Due: __________\n' +
      '- Owner: __________  Action: __________  Due: __________\n' +
      '- Owner: __________  Action: __________  Due: __________\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/weekly-one-on-one-meeting\n',
    guideHtml: `<h2>The Ultimate Weekly Manager 1:1 Meeting Template &amp; Guide</h2>
<p>The weekly 1:1 is the single most important meeting a manager runs. It is the foundation of team trust, the early warning system for operational bottlenecks, and the primary vehicle for employee engagement and retention. Yet, many managers treat 1:1s as optional status updates, reschedule them constantly, or run them without any structured agenda.</p>
<p>When 1:1s are disorganized or treated as low-priority, direct reports feel undervalued, communication breaks down, and minor issues quickly escalate into major operational crises.</p>
<p>This comprehensive guide provides a battle-tested Weekly Manager 1:1 Template and a step-by-step agenda to help you run highly efficient, trust-building, and action-oriented 1:1 meetings.</p>
<h2>What is a Weekly Manager 1:1 Meeting?</h2>
<p>A Weekly Manager 1:1 is a dedicated, 30-minute meeting between a manager and their direct report.</p>
<p>The primary objective of the meeting is to build a strong professional relationship, align on weekly priorities, and proactively resolve any roadblocks. Unlike team meetings, the weekly 1:1 is <strong>the direct report's meeting</strong> - they own the agenda, and the manager's role is to listen, coach, and support.</p>
<h3>The Core Objectives of the Weekly 1:1:</h3>
<ul>
<li>Build Trust &amp; Rapport: Create a safe space for open, honest communication and mutual feedback.</li>
<li>Align on Priorities: Ensure the direct report is focused on the highest-impact tasks for the week.</li>
<li>Remove Roadblocks: Proactively identify and resolve operational, technical, or cross-functional bottlenecks.</li>
<li>Support Professional Growth: Discuss career aspirations, skill development, and learning opportunities.</li>
<li>Maintain Accountability: Review commitments and action items from the previous week.</li>
</ul>
<h2>The Standard 30-Minute Weekly 1:1 Agenda</h2>
<p>To maximize efficiency and ensure the direct report's priorities are addressed first, we recommend a strict time-boxed 30-minute agenda:</p>
<table class="td-guide-table">
<thead><tr><th>Time</th><th>Agenda Item</th><th>Owner</th><th>Objective</th></tr></thead>
<tbody>
<tr><td><strong>00:00 - 00:05</strong></td><td><strong>Personal Check-In</strong></td><td>Both</td><td>Break the ice, build rapport, and check in on overall energy, stress levels, and well-being.</td></tr>
<tr><td><strong>00:05 - 00:15</strong></td><td><strong>Their Topics First</strong></td><td>Direct Report</td><td>The direct report shares their updates, questions, challenges, and ideas. The manager listens and takes notes.</td></tr>
<tr><td><strong>00:15 - 00:22</strong></td><td><strong>Your Topics &amp; Priorities</strong></td><td>Manager</td><td>The manager shares critical updates, aligns on weekly priorities, and provides feedback.</td></tr>
<tr><td><strong>00:22 - 00:27</strong></td><td><strong>Growth &amp; Feedback</strong></td><td>Both</td><td>Discuss long-term goals, skill development, or exchange constructive feedback.</td></tr>
<tr><td><strong>00:27 - 00:30</strong></td><td><strong>Action Items &amp; Close</strong></td><td>Both</td><td>Recap new commitments, assign owners, and confirm the date for the next meeting.</td></tr>
</tbody>
</table>
<h2>Best Practices for Managers</h2>
<h3>1. Never Cancel or Reschedule</h3>
<p>Rescheduling or canceling a 1:1 sends a clear, damaging message to your direct report: <em>"Everything else on my plate is more important than you."</em> Treat the weekly 1:1 as a sacred, unmovable block on your calendar. If you absolutely must reschedule due to an emergency, do it immediately and put a new time on the calendar for the same week.</p>
<h3>2. Follow the 90/10 Rule of Listening</h3>
<p>During the first 15 minutes of the meeting, the manager should do <strong>10% of the talking and 90% of the listening</strong>. Resist the urge to jump in with immediate solutions or take over the conversation. Ask open-ended questions and let your direct report fully explain their thoughts and challenges.</p>
<h3>3. Document Commitments and Action Items</h3>
<p>A great 1:1 should always result in concrete action items. Keep a shared, running document where both parties can add agenda items during the week and document commitments made during the meeting. Reviewing last week's action items at the start of the next meeting builds a powerful culture of accountability.</p>
<h2>Frequently Asked Questions (FAQs)</h2>
<h3>How long should a weekly 1:1 meeting be?</h3>
<p>We recommend a strict <strong>30-minute</strong> time-box for weekly 1:1s. This duration is long enough to cover priorities and roadblocks without creating meeting fatigue. For senior leaders or complex roles, a <strong>45 to 60-minute</strong> biweekly session may be more appropriate.</p>
<h3>What is the difference between a 1:1 and a status update?</h3>
<p>A status update is a tactical review of project timelines and task lists. A weekly 1:1 is a relationship-building and coaching session focused on the employee's well-being, priorities, roadblocks, and professional development.</p>
<h3>How do you handle a direct report who has nothing to discuss?</h3>
<p>If a direct report says they have nothing on their agenda, do not cancel the meeting. Use this as an opportunity to ask deep, strategic questions: <em>“What is the most frustrating part of your workflow right now?”</em> or <em>“If you could change one thing about our team dynamics, what would it be?”</em></p>
<h3>Should 1:1 meetings be documented?</h3>
<p>Yes. Managers and direct reports should maintain a shared, private document to track agenda items, document key decisions, and list weekly action items. This document serves as a valuable record for quarterly performance reviews and career planning.</p>`,
    faq: [
      {
            "q": "How long should a weekly 1:1 meeting be?",
            "a": "We recommend a strict 30-minute time-box for weekly 1:1s. This duration is long enough to cover priorities and roadblocks without creating meeting fatigue. For senior leaders or complex roles, a 45 to 60-minute biweekly session may be more appropriate."
      },
      {
            "q": "What is the difference between a 1:1 and a status update?",
            "a": "A status update is a tactical review of project timelines and task lists. A weekly 1:1 is a relationship-building and coaching session focused on the employee's well-being, priorities, roadblocks, and professional development."
      },
      {
            "q": "How do you handle a direct report who has nothing to discuss?",
            "a": "If a direct report says they have nothing on their agenda, do not cancel the meeting. Use this as an opportunity to ask deep, strategic questions: \"What is the most frustrating part of your workflow right now?\" or \"If you could change one thing about our team dynamics, what would it be?\""
      },
      {
            "q": "Should 1:1 meetings be documented?",
            "a": "Yes. Managers and direct reports should maintain a shared, private document to track agenda items, document key decisions, and list weekly action items. This document serves as a valuable record for quarterly performance reviews and career planning."
      }
],
  },
  {
    slug: 'skip-level-one-on-one',
    title: 'Skip-Level 1:1 Template',
    shortName: 'Skip-Level 1:1',
    description:
      'A skip-level 1:1 template with the agenda and skip level meeting questions senior leaders use to hear unfiltered feedback, spot risks, and build trust two levels down.',
    category: 'one-on-ones',
    methodology: 'General',
    minutes: 45,
    cadence: 'Quarterly',
    participants: "Senior leader and a direct report's report (2 people)",
    keywords: [
      'skip level meeting template',
      'skip level meeting questions',
      'skip level 1:1',
      'skip level one on one',
      'senior leader meeting agenda',
      'leadership skip level',
      'skip level questions to ask',
      'manager skip level meeting',
    ],
    steps: [
      {
        name: 'Set context and intent',
        minutes: 5,
        text: 'Explain why you meet skip-level, that it is not about evaluating their manager, and that candor is welcome and safe.',
      },
      {
        name: 'Their experience and engagement',
        minutes: 12,
        text: 'Ask what energizes them, what frustrates them, and how they feel about their work and the team right now.',
      },
      {
        name: 'Team health and obstacles',
        minutes: 12,
        text: 'Probe for friction, unclear priorities, and risks leadership may not see from where they sit.',
      },
      {
        name: 'Ideas and the bigger picture',
        minutes: 10,
        text: 'Invite suggestions about strategy, process, and what the company should start, stop, or keep doing.',
      },
      {
        name: 'Close and follow-up',
        minutes: 6,
        text: 'Thank them, agree on what you will act on or pass along anonymously, and commit to closing the loop.',
      },
    ],
    bodyHtml:
      '<p>The <strong>skip-level 1:1 template</strong> helps a senior leader meet with employees two levels down to hear what rarely travels up the chain. Used well, skip-levels surface blind spots, build trust across layers, and give leadership a direct read on team health.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run skip-levels on a light, predictable cadence, often quarterly, so they feel normal rather than ominous. They are also valuable during reorgs, after major changes, or when a leader wants ground truth on morale.</p>' +
      '<h2>Who attends</h2>' +
      '<p>A senior leader and an employee who reports to one of their direct reports. The employee\'s own manager is not in the room. That separation is the point, so be explicit that this is not a performance review of anyone.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Open by naming the intent and setting psychological safety, because most people arrive guarded. Ask open questions and resist defending the status quo. <em>Your job is to listen and learn, not to explain.</em> Be careful with what you act on directly versus what you pass to their manager, and never repeat anything in a way that exposes the source.</p>' +
      '<h2>Questions to ask</h2>' +
      '<ul>' +
      '<li><strong>What is working well on the team right now?</strong></li>' +
      '<li><strong>What is the most frustrating part of your week?</strong></li>' +
      '<li><strong>If you were running things, what would you change first?</strong></li>' +
      '<li><strong>What does leadership not see that we should?</strong></li>' +
      '<li><strong>Do you have what you need to do your best work?</strong></li>' +
      '<li><strong>What would make you consider leaving, and what keeps you here?</strong></li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Letting it feel like a manager-bashing session or an evaluation.</li>' +
      '<li>Getting defensive when you hear something uncomfortable.</li>' +
      '<li>Acting on a comment in a way that exposes who said it.</li>' +
      '<li>Gathering feedback and then never closing the loop.</li>' +
      '</ul>' +
      '<p>Want to track themes across skip-levels over time? <a href="/l8">Run it in OrgTP</a> and turn scattered signals into clear leadership action.</p>',
    downloadMarkdown:
      '# Skip-Level 1:1 Template\n\n' +
      'Purpose: A candid conversation between a senior leader and an employee two levels down to surface team health, risks, and ideas that rarely travel up the chain.\n\n' +
      '- Duration: 45 minutes\n' +
      '- Cadence: Quarterly\n' +
      "- Participants: Senior leader and a direct report's report\n\n" +
      '## Agenda\n\n' +
      '- [ ] Set context and intent (5 min)\n' +
      '- [ ] Their experience and engagement (12 min)\n' +
      '- [ ] Team health and obstacles (12 min)\n' +
      '- [ ] Ideas and the bigger picture (10 min)\n' +
      '- [ ] Close and follow-up (6 min)\n\n' +
      '## Questions to ask\n\n' +
      '- What is working well on the team right now?\n' +
      '- What is the most frustrating part of your week?\n' +
      '- If you were running things, what would you change first?\n' +
      '- What does leadership not see that we should?\n' +
      '- Do you have what you need to do your best work?\n' +
      '- What would make you consider leaving, and what keeps you here?\n\n' +
      '## Action items\n\n' +
      '- Owner: __________  Action: __________  Due: __________\n' +
      '- Owner: __________  Action: __________  Due: __________\n' +
      '- Owner: __________  Action: __________  Due: __________\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/skip-level-one-on-one\n',
  },
  {
    slug: 'quarterly-career-conversation',
    title: 'Quarterly Career Conversation Template',
    shortName: 'Quarterly Career Conversation',
    description:
      'A quarterly career conversation template with the agenda and growth questions managers use to talk aspirations, skills, and next steps separate from day-to-day work.',
    category: 'one-on-ones',
    methodology: 'General',
    minutes: 45,
    cadence: 'Quarterly',
    participants: 'Manager and direct report (2 people)',
    keywords: [
      'career conversation template',
      'career development meeting',
      'career growth questions',
      'quarterly career check in',
      'employee development plan',
      'career path discussion',
      'manager career questions',
      'professional development meeting',
    ],
    steps: [
      {
        name: 'Frame the conversation',
        minutes: 5,
        text: 'Make clear this is about their growth, not this week\'s tasks, and that there is no wrong answer.',
      },
      {
        name: 'Aspirations and direction',
        minutes: 12,
        text: 'Explore where they want to go, what energizes them, and what a great next role would look like.',
      },
      {
        name: 'Strengths and skill gaps',
        minutes: 12,
        text: 'Name the strengths they should lean into and the skills or experiences they need to develop next.',
      },
      {
        name: 'Opportunities and support',
        minutes: 10,
        text: 'Identify projects, mentors, or stretch assignments and agree on how you will support the path.',
      },
      {
        name: 'Next steps',
        minutes: 6,
        text: 'Capture one or two concrete development actions with owners and a date to revisit progress.',
      },
    ],
    bodyHtml:
      '<p>The <strong>quarterly career conversation template</strong> carves out dedicated time to talk about an employee\'s growth, not their current task list. Most 1:1s get consumed by the urgent, so this is the meeting where the important finally gets attention.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run a deliberate career conversation about once a quarter, separate from your weekly 1:1 and ideally decoupled from performance reviews and compensation so the talk stays honest and forward-looking.</p>' +
      '<h2>Who attends</h2>' +
      '<p>The manager and the direct report. Come prepared with genuine observations about their strengths, and ask the report to think ahead of time about where they want to grow.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Frame it clearly so they do not brace for an evaluation. Spend most of the time on their aspirations and the skills that will get them there, then translate the conversation into one or two real opportunities. <em>End with a small concrete commitment, not a vague promise to revisit someday.</em></p>' +
      '<h2>Questions to ask</h2>' +
      '<ul>' +
      '<li><strong>Where do you want to be in two to three years?</strong></li>' +
      '<li><strong>What kind of work makes you lose track of time?</strong></li>' +
      '<li><strong>Which of your strengths feel underused right now?</strong></li>' +
      '<li><strong>What skill, if you grew it, would change the most?</strong></li>' +
      '<li><strong>What experience or project would stretch you well?</strong></li>' +
      '<li><strong>How can I best support your growth from here?</strong></li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Folding it into a normal 1:1 so the urgent crowds out the important.</li>' +
      '<li>Projecting your own ambitions onto their path.</li>' +
      '<li>Talking growth but never creating a real opportunity.</li>' +
      '<li>Leaving with no follow-up and forgetting the whole thing by next quarter.</li>' +
      '</ul>' +
      '<p>Keep development on track between quarters. <a href="/l8">Run it in OrgTP</a> and revisit every growth goal without losing the thread.</p>',
    downloadMarkdown:
      '# Quarterly Career Conversation Template\n\n' +
      'Purpose: A dedicated quarterly conversation focused on a direct report\'s aspirations, strengths, skill gaps, and next development steps, separate from day-to-day work.\n\n' +
      '- Duration: 45 minutes\n' +
      '- Cadence: Quarterly\n' +
      '- Participants: Manager and direct report\n\n' +
      '## Agenda\n\n' +
      '- [ ] Frame the conversation (5 min)\n' +
      '- [ ] Aspirations and direction (12 min)\n' +
      '- [ ] Strengths and skill gaps (12 min)\n' +
      '- [ ] Opportunities and support (10 min)\n' +
      '- [ ] Next steps (6 min)\n\n' +
      '## Questions to ask\n\n' +
      '- Where do you want to be in two to three years?\n' +
      '- What kind of work makes you lose track of time?\n' +
      '- Which of your strengths feel underused right now?\n' +
      '- What skill, if you grew it, would change the most?\n' +
      '- What experience or project would stretch you well?\n' +
      '- How can I best support your growth from here?\n\n' +
      '## Action items\n\n' +
      '- Owner: __________  Action: __________  Due: __________\n' +
      '- Owner: __________  Action: __________  Due: __________\n' +
      '- Owner: __________  Action: __________  Due: __________\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/quarterly-career-conversation\n',
  },
  {
    slug: 'performance-review-meeting',
    title: 'Performance Review Meeting Template',
    shortName: 'Performance Review Meeting',
    description:
      'A performance review template with the agenda and review questions managers use to discuss results, give balanced feedback, and set goals in a fair, two-way meeting.',
    category: 'one-on-ones',
    methodology: 'General',
    minutes: 60,
    cadence: 'Quarterly',
    participants: 'Manager and employee (2 people)',
    keywords: [
      'performance review template',
      'performance review meeting',
      'performance review questions',
      'employee review agenda',
      'performance evaluation template',
      'annual review meeting',
      'review feedback questions',
      'performance appraisal template',
    ],
    steps: [
      {
        name: 'Set the tone',
        minutes: 5,
        text: 'Open warmly, explain the structure, and frame the review as a two-way conversation, not a verdict.',
      },
      {
        name: 'Self-assessment first',
        minutes: 12,
        text: 'Ask the employee to reflect on the period before you share your view so they feel heard, not judged.',
      },
      {
        name: 'Results against goals',
        minutes: 15,
        text: 'Walk through outcomes versus expectations with specific examples, celebrating wins and naming gaps.',
      },
      {
        name: 'Strengths and development areas',
        minutes: 13,
        text: 'Give balanced, specific feedback and discuss the one or two areas with the biggest growth payoff.',
      },
      {
        name: 'Goals for next period',
        minutes: 10,
        text: 'Agree on clear, measurable goals and the support needed to hit them.',
      },
      {
        name: 'Close and questions',
        minutes: 5,
        text: 'Invite their reflections, confirm next steps, and make sure they leave clear and motivated.',
      },
    ],
    bodyHtml:
      '<p>The <strong>performance review template</strong> turns a high-stakes meeting into a fair, structured, two-way conversation. A good review reflects on real results, gives balanced feedback, and sets clear goals, all without surprises.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Use it for formal review cycles, typically quarterly, semi-annual, or annual. The review should summarize feedback you have already been giving all along, never deliver it for the first time.</p>' +
      '<h2>Who attends</h2>' +
      '<p>The manager and the employee. Prepare with specific examples and the employee\'s self-assessment in hand. Make the focus the work and outcomes, not personality.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Set a calm tone and ask for their self-assessment first, which surfaces alignment and lowers defensiveness. Review results against agreed goals using concrete examples, then balance strengths with one or two real development areas. <em>Finish by co-creating next-period goals so they leave clear and motivated rather than rated and dismissed.</em></p>' +
      '<h2>Questions to ask</h2>' +
      '<ul>' +
      '<li><strong>Looking back, what are you most proud of?</strong></li>' +
      '<li><strong>Where did you fall short of your own expectations?</strong></li>' +
      '<li><strong>Which goals felt realistic, and which did not?</strong></li>' +
      '<li><strong>What would help you do even better next period?</strong></li>' +
      '<li><strong>Where do you want to focus your growth?</strong></li>' +
      '<li><strong>What can I do differently to support you?</strong></li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Springing feedback that should have come months earlier.</li>' +
      '<li>Recency bias, judging the whole period by the last few weeks.</li>' +
      '<li>Drowning real feedback in vague praise or a single rating.</li>' +
      '<li>Talking the entire time and skipping their self-assessment.</li>' +
      '</ul>' +
      '<p>Make reviews reflect the whole period, not the last week. <a href="/l8">Run it in OrgTP</a> and keep feedback and goals connected all year.</p>',
    downloadMarkdown:
      '# Performance Review Meeting Template\n\n' +
      'Purpose: A fair, structured, two-way review of results against goals with balanced feedback and clear goals for the next period, with no surprises.\n\n' +
      '- Duration: 60 minutes\n' +
      '- Cadence: Quarterly (or semi-annual / annual)\n' +
      '- Participants: Manager and employee\n\n' +
      '## Agenda\n\n' +
      '- [ ] Set the tone (5 min)\n' +
      '- [ ] Self-assessment first (12 min)\n' +
      '- [ ] Results against goals (15 min)\n' +
      '- [ ] Strengths and development areas (13 min)\n' +
      '- [ ] Goals for next period (10 min)\n' +
      '- [ ] Close and questions (5 min)\n\n' +
      '## Questions to ask\n\n' +
      '- Looking back, what are you most proud of?\n' +
      '- Where did you fall short of your own expectations?\n' +
      '- Which goals felt realistic, and which did not?\n' +
      '- What would help you do even better next period?\n' +
      '- Where do you want to focus your growth?\n' +
      '- What can I do differently to support you?\n\n' +
      '## Action items\n\n' +
      '- Owner: __________  Action: __________  Due: __________\n' +
      '- Owner: __________  Action: __________  Due: __________\n' +
      '- Owner: __________  Action: __________  Due: __________\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/performance-review-meeting\n',
  },
  {
    slug: 'stay-interview-meeting',
    title: 'Stay Interview Template',
    shortName: 'Stay Interview',
    description:
      'A stay interview template with the agenda and stay interview questions managers use to learn what keeps great people, surface risks, and boost retention before they leave.',
    category: 'one-on-ones',
    methodology: 'General',
    minutes: 30,
    cadence: 'As needed',
    participants: 'Manager and valued employee (2 people)',
    keywords: [
      'stay interview template',
      'stay interview questions',
      'employee retention meeting',
      'retention interview',
      'what keeps you here questions',
      'stay conversation template',
      'reduce employee turnover',
      'retention questions to ask',
    ],
    steps: [
      {
        name: 'Set intent and safety',
        minutes: 4,
        text: 'Tell them plainly that you value them and want to understand what keeps them engaged and what might not.',
      },
      {
        name: 'What keeps them here',
        minutes: 9,
        text: 'Explore what they enjoy, what makes a great day, and what would make them sad to lose.',
      },
      {
        name: 'What might push them away',
        minutes: 9,
        text: 'Ask honestly what frustrates them and what could tempt them to look elsewhere.',
      },
      {
        name: 'What would make it better',
        minutes: 5,
        text: 'Invite specific changes you could make to their role, growth, or environment.',
      },
      {
        name: 'Commit and follow-up',
        minutes: 3,
        text: 'Name one or two things you will act on and set a time to revisit, so the conversation builds trust.',
      },
    ],
    bodyHtml:
      '<p>The <strong>stay interview template</strong> helps you learn why your best people stay, and what might make them leave, while you can still do something about it. Unlike an exit interview, a stay interview is a retention tool used before anyone has one foot out the door.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run stay interviews with high performers and key people you cannot afford to lose, on a light cadence or whenever you sense disengagement. They are most valuable when nothing is obviously wrong, which is exactly when most managers forget to ask.</p>' +
      '<h2>Who attends</h2>' +
      '<p>The manager and a valued employee. Keep it informal and one-on-one. The tone should signal genuine care, not a survey or a save-the-deal scramble after a resignation.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Open by saying clearly that you value them and want to understand their experience. Ask about what keeps them, then about what might push them away, and listen without getting defensive. <em>The fastest way to lose someone is to ask these questions and then change nothing.</em> Close by committing to one or two real actions.</p>' +
      '<h2>Questions to ask</h2>' +
      '<ul>' +
      '<li><strong>What keeps you working here?</strong></li>' +
      '<li><strong>What does a great day at work look like for you?</strong></li>' +
      '<li><strong>What would make you consider leaving?</strong></li>' +
      '<li><strong>What frustrates you that we could fix?</strong></li>' +
      '<li><strong>Do you feel your work is recognized and valued?</strong></li>' +
      '<li><strong>What is one change that would make this a better place for you?</strong></li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Only running a stay interview after someone resigns, when it is too late.</li>' +
      '<li>Getting defensive when you hear hard truths.</li>' +
      '<li>Asking the questions and then changing nothing.</li>' +
      '<li>Treating it as a formality instead of a real conversation.</li>' +
      '</ul>' +
      '<p>Keep your best people before they start looking. <a href="/l8">Run it in OrgTP</a> and turn what you learn into action you actually follow through on.</p>',
    downloadMarkdown:
      '# Stay Interview Template\n\n' +
      'Purpose: A proactive retention conversation to learn what keeps a valued employee engaged and what might cause them to leave, while you can still act on it.\n\n' +
      '- Duration: 30 minutes\n' +
      '- Cadence: As needed (high performers and key roles)\n' +
      '- Participants: Manager and valued employee\n\n' +
      '## Agenda\n\n' +
      '- [ ] Set intent and safety (4 min)\n' +
      '- [ ] What keeps them here (9 min)\n' +
      '- [ ] What might push them away (9 min)\n' +
      '- [ ] What would make it better (5 min)\n' +
      '- [ ] Commit and follow-up (3 min)\n\n' +
      '## Questions to ask\n\n' +
      '- What keeps you working here?\n' +
      '- What does a great day at work look like for you?\n' +
      '- What would make you consider leaving?\n' +
      '- What frustrates you that we could fix?\n' +
      '- Do you feel your work is recognized and valued?\n' +
      '- What is one change that would make this a better place for you?\n\n' +
      '## Action items\n\n' +
      '- Owner: __________  Action: __________  Due: __________\n' +
      '- Owner: __________  Action: __________  Due: __________\n' +
      '- Owner: __________  Action: __________  Due: __________\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/stay-interview-meeting\n',
  },
  {
    slug: 'exit-interview-meeting',
    title: 'Exit Interview Template',
    shortName: 'Exit Interview',
    description:
      'An exit interview template with the agenda and exit interview questions to learn why people leave, capture honest feedback, and turn turnover into real improvement.',
    category: 'one-on-ones',
    methodology: 'General',
    minutes: 45,
    cadence: 'As needed',
    participants: 'Departing employee and a neutral interviewer (2 people)',
    keywords: [
      'exit interview template',
      'exit interview questions',
      'offboarding meeting',
      'employee departure interview',
      'why employees leave questions',
      'exit conversation template',
      'turnover feedback',
      'departing employee questions',
    ],
    steps: [
      {
        name: 'Set context and confidentiality',
        minutes: 5,
        text: 'Thank them, explain how feedback will be used, and clarify what stays confidential to invite candor.',
      },
      {
        name: 'Why they are leaving',
        minutes: 12,
        text: 'Understand the real reasons behind the decision, not just the polite headline.',
      },
      {
        name: 'Experience and culture',
        minutes: 12,
        text: 'Explore what worked, what did not, and how they experienced their manager, team, and the culture.',
      },
      {
        name: 'Advice and improvements',
        minutes: 10,
        text: 'Ask what the company should change and what they would tell a future person in their role.',
      },
      {
        name: 'Close on good terms',
        minutes: 6,
        text: 'Wrap warmly, confirm logistics, and leave the door open for a strong alumni relationship.',
      },
    ],
    bodyHtml:
      '<p>The <strong>exit interview template</strong> turns a departure into honest, usable feedback. When someone leaves they often share what they never felt safe to say before, and a well-run exit interview captures that signal and feeds it back into how you lead.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Run it during the offboarding window, ideally a few days before the person\'s last day so the conversation is reflective rather than rushed. Use the same core questions every time so you can spot patterns across departures.</p>' +
      '<h2>Who attends</h2>' +
      '<p>The departing employee and a neutral interviewer, usually someone from HR or a leader who was not their direct manager. Neutrality matters because people are far more candid when their soon-to-be-former boss is not in the room.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Open with genuine thanks and be clear about confidentiality. Ask why they are really leaving, then move into their experience of the role, manager, and culture. <em>Listen for patterns, not just this one story, and never get defensive.</em> Close warmly so they leave as an advocate, not a critic.</p>' +
      '<h2>Questions to ask</h2>' +
      '<ul>' +
      '<li><strong>What is the real reason you decided to leave?</strong></li>' +
      '<li><strong>When did you first start thinking about leaving, and why?</strong></li>' +
      '<li><strong>What did you enjoy most, and least, about working here?</strong></li>' +
      '<li><strong>How would you describe the culture to a friend?</strong></li>' +
      '<li><strong>What should we change for the person who fills your role?</strong></li>' +
      '<li><strong>Is there anything that could have made you stay?</strong></li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Letting the person\'s own manager run the interview.</li>' +
      '<li>Getting defensive instead of listening for patterns.</li>' +
      '<li>Collecting feedback that no one ever reviews or acts on.</li>' +
      '<li>Ending on a sour note and burning an alumni relationship.</li>' +
      '</ul>' +
      '<p>Turn every departure into a lesson. <a href="/l8">Run it in OrgTP</a> and track exit themes so the same reasons stop repeating.</p>',
    downloadMarkdown:
      '# Exit Interview Template\n\n' +
      'Purpose: A candid offboarding conversation to understand why an employee is leaving, capture honest feedback, and identify changes that reduce future turnover.\n\n' +
      '- Duration: 45 minutes\n' +
      '- Cadence: As needed (during offboarding)\n' +
      '- Participants: Departing employee and a neutral interviewer\n\n' +
      '## Agenda\n\n' +
      '- [ ] Set context and confidentiality (5 min)\n' +
      '- [ ] Why they are leaving (12 min)\n' +
      '- [ ] Experience and culture (12 min)\n' +
      '- [ ] Advice and improvements (10 min)\n' +
      '- [ ] Close on good terms (6 min)\n\n' +
      '## Questions to ask\n\n' +
      '- What is the real reason you decided to leave?\n' +
      '- When did you first start thinking about leaving, and why?\n' +
      '- What did you enjoy most, and least, about working here?\n' +
      '- How would you describe the culture to a friend?\n' +
      '- What should we change for the person who fills your role?\n' +
      '- Is there anything that could have made you stay?\n\n' +
      '## Action items\n\n' +
      '- Owner: __________  Action: __________  Due: __________\n' +
      '- Owner: __________  Action: __________  Due: __________\n' +
      '- Owner: __________  Action: __________  Due: __________\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/exit-interview-meeting\n',
  },
  {
    slug: '30-60-90-day-check-in',
    title: '30-60-90 Day Onboarding Check-in Template',
    shortName: '30-60-90 Day Check-in',
    description:
      'A 30 60 90 day plan template with onboarding check-in questions managers use to set new hires up, track ramp progress, and catch problems early in their first 90 days.',
    category: 'one-on-ones',
    methodology: 'General',
    minutes: 30,
    cadence: 'At 30, 60, and 90 days',
    participants: 'Manager and new hire (2 people)',
    keywords: [
      '30 60 90 day plan template',
      'onboarding check in template',
      'new hire one on one',
      'new employee 30 60 90 plan',
      'onboarding meeting questions',
      'first 90 days plan',
      'new hire check in',
      'onboarding 1:1 agenda',
    ],
    steps: [
      {
        name: 'How they are settling in',
        minutes: 6,
        text: 'Check on the human experience first: do they feel welcome, supported, and clear on what is expected?',
      },
      {
        name: 'Progress against the plan',
        minutes: 9,
        text: 'Review milestones for this stage (learning at 30, contributing at 60, owning at 90) and celebrate wins.',
      },
      {
        name: 'Gaps and blockers',
        minutes: 8,
        text: 'Surface anything unclear, missing tools or access, and where they need more context or help.',
      },
      {
        name: 'Feedback both ways',
        minutes: 4,
        text: 'Share early feedback and ask how onboarding is going from their side so you can improve it.',
      },
      {
        name: 'Set goals for the next stage',
        minutes: 3,
        text: 'Align on the focus and milestones for the next 30 days and confirm support.',
      },
    ],
    bodyHtml:
      '<p>The <strong>30-60-90 day plan template</strong> gives a new hire a clear ramp and gives you three structured checkpoints to make sure onboarding is working. The first 90 days set the tone for the whole tenure, so these check-ins are some of the highest-leverage 1:1s you will run.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Hold a dedicated check-in at roughly the 30, 60, and 90 day marks, on top of your normal weekly 1:1s. Each one has a theme: learning by day 30, contributing by day 60, and owning by day 90.</p>' +
      '<h2>Who attends</h2>' +
      '<p>The manager and the new hire. Come with the milestones you set at the start so the conversation is concrete. The goal is to catch friction early, while it is cheap to fix.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Start with how they are settling in as a person, then review progress against the stage milestones. Dig into anything unclear, missing access, or unmet needs. <em>Ask for feedback on the onboarding itself, because new hires see your gaps with fresh eyes.</em> Close by setting the focus for the next stretch.</p>' +
      '<h2>Questions to ask</h2>' +
      '<ul>' +
      '<li><strong>How are you feeling about the role so far?</strong></li>' +
      '<li><strong>Is anything unclear about your goals or expectations?</strong></li>' +
      '<li><strong>Do you have the tools, access, and context you need?</strong></li>' +
      '<li><strong>What has gone better or worse than you expected?</strong></li>' +
      '<li><strong>Where could the onboarding have served you better?</strong></li>' +
      '<li><strong>What do you want to focus on over the next 30 days?</strong></li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Skipping structured check-ins and assuming silence means all is well.</li>' +
      '<li>Setting vague goals so there is nothing concrete to check against.</li>' +
      '<li>Talking at the new hire instead of asking how onboarding feels.</li>' +
      '<li>Expecting full ownership at day 30 instead of letting the ramp build.</li>' +
      '</ul>' +
      '<p>Give every new hire a strong start. <a href="/l8">Run it in OrgTP</a> and keep their 30-60-90 milestones visible from day one.</p>',
    downloadMarkdown:
      '# 30-60-90 Day Onboarding Check-in Template\n\n' +
      'Purpose: A structured check-in at the 30, 60, and 90 day marks to ramp a new hire, track progress, surface blockers, and catch onboarding problems early.\n\n' +
      '- Duration: 30 minutes\n' +
      '- Cadence: At 30, 60, and 90 days\n' +
      '- Participants: Manager and new hire\n\n' +
      '## Agenda\n\n' +
      '- [ ] How they are settling in (6 min)\n' +
      '- [ ] Progress against the plan (9 min)\n' +
      '- [ ] Gaps and blockers (8 min)\n' +
      '- [ ] Feedback both ways (4 min)\n' +
      '- [ ] Set goals for the next stage (3 min)\n\n' +
      '## Questions to ask\n\n' +
      '- How are you feeling about the role so far?\n' +
      '- Is anything unclear about your goals or expectations?\n' +
      '- Do you have the tools, access, and context you need?\n' +
      '- What has gone better or worse than you expected?\n' +
      '- Where could the onboarding have served you better?\n' +
      '- What do you want to focus on over the next 30 days?\n\n' +
      '## Action items\n\n' +
      '- Owner: __________  Action: __________  Due: __________\n' +
      '- Owner: __________  Action: __________  Due: __________\n' +
      '- Owner: __________  Action: __________  Due: __________\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/30-60-90-day-check-in\n',
  },
  {
    slug: 'mentor-mentee-meeting',
    title: 'Mentor / Mentee Session Template',
    shortName: 'Mentor / Mentee Session',
    description:
      'A mentor mentee meeting template with the agenda and mentoring questions to set goals, share lessons, work through challenges, and make every mentorship session count.',
    category: 'one-on-ones',
    methodology: 'General',
    minutes: 45,
    cadence: 'Monthly',
    participants: 'Mentor and mentee (2 people)',
    keywords: [
      'mentor mentee meeting template',
      'mentoring session agenda',
      'mentorship questions',
      'mentor meeting questions',
      'mentee meeting template',
      'mentoring program agenda',
      'how to run a mentoring session',
      'mentor 1:1 template',
    ],
    steps: [
      {
        name: 'Reconnect and recap',
        minutes: 6,
        text: 'Catch up briefly and review action items or commitments from the last session.',
      },
      {
        name: 'Mentee sets the agenda',
        minutes: 12,
        text: 'The mentee names what they want help with today: a decision, a skill, a challenge, or a goal.',
      },
      {
        name: 'Explore and share experience',
        minutes: 15,
        text: 'Ask questions, share relevant lessons and stories, and help the mentee think it through rather than just telling them the answer.',
      },
      {
        name: 'Decide next steps',
        minutes: 8,
        text: 'Help the mentee choose one or two concrete actions they will take before next time.',
      },
      {
        name: 'Reflect and schedule',
        minutes: 4,
        text: 'Ask what was most useful, confirm the next session, and note what to revisit.',
      },
    ],
    bodyHtml:
      '<p>The <strong>mentor mentee meeting template</strong> keeps mentorship from drifting into pleasant but aimless chats. A structured session respects both people\'s time and ensures the mentee leaves with real progress, not just encouragement.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Use it for recurring mentoring sessions, often monthly, whether inside a formal program or an informal relationship. The mentee should own the agenda and come prepared with what they want to work on.</p>' +
      '<h2>Who attends</h2>' +
      '<p>The mentor and the mentee. The relationship works best when the mentor guides rather than directs, and the mentee drives the agenda and owns the follow-through between sessions.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Reconnect briefly and recap last time\'s commitments, then let the mentee set today\'s focus. Explore through questions and share relevant experience, but resist simply handing over answers. <em>The best mentors help the mentee reach their own conclusion.</em> Close by agreeing on one or two concrete next steps.</p>' +
      '<h2>Questions to ask</h2>' +
      '<ul>' +
      '<li><strong>What do you most want to get out of today?</strong></li>' +
      '<li><strong>What have you tried so far, and how did it go?</strong></li>' +
      '<li><strong>What is really holding you back here?</strong></li>' +
      '<li><strong>What would you do if you knew you could not fail?</strong></li>' +
      '<li><strong>What is the smallest next step you could take?</strong></li>' +
      '<li><strong>What was most useful from this session?</strong></li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Letting the session become a directionless catch-up.</li>' +
      '<li>The mentor doing all the talking and giving instant answers.</li>' +
      '<li>The mentee showing up without a clear topic or any prep.</li>' +
      '<li>Ending without concrete next steps, so nothing changes between sessions.</li>' +
      '</ul>' +
      '<p>Make every mentoring session count. <a href="/l8">Run it in OrgTP</a> and keep goals, lessons, and next steps in one shared thread.</p>',
    downloadMarkdown:
      '# Mentor / Mentee Session Template\n\n' +
      'Purpose: A focused mentoring session where the mentee sets the agenda, the mentor shares experience and asks good questions, and both agree on concrete next steps.\n\n' +
      '- Duration: 45 minutes\n' +
      '- Cadence: Monthly\n' +
      '- Participants: Mentor and mentee\n\n' +
      '## Agenda\n\n' +
      '- [ ] Reconnect and recap (6 min)\n' +
      '- [ ] Mentee sets the agenda (12 min)\n' +
      '- [ ] Explore and share experience (15 min)\n' +
      '- [ ] Decide next steps (8 min)\n' +
      '- [ ] Reflect and schedule (4 min)\n\n' +
      '## Questions to ask\n\n' +
      '- What do you most want to get out of today?\n' +
      '- What have you tried so far, and how did it go?\n' +
      '- What is really holding you back here?\n' +
      '- What would you do if you knew you could not fail?\n' +
      '- What is the smallest next step you could take?\n' +
      '- What was most useful from this session?\n\n' +
      '## Action items\n\n' +
      '- Owner: __________  Action: __________  Due: __________\n' +
      '- Owner: __________  Action: __________  Due: __________\n' +
      '- Owner: __________  Action: __________  Due: __________\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/mentor-mentee-meeting\n',
    guideHtml: `<h2>The Ultimate Mentor &amp; Mentee Meeting Template &amp; Agenda Guide</h2>
<p>Mentorship is one of the most powerful drivers of professional growth and career advancement. Yet, many mentorship relationships fail to reach their full potential because the sessions lack structure. Without a clear framework, meetings can easily devolve into pleasant but aimless catch-ups that fail to drive real progress or accountability.</p>
<p>To build a high-impact mentorship relationship, both mentors and mentees need a structured, action-oriented approach to their conversations.</p>
<p>This comprehensive guide provides a battle-tested <strong>Mentor &amp; Mentee Meeting Template</strong> and a step-by-step agenda to help you run focused, productive, and inspiring mentorship sessions.</p>

<h2>What is a Mentor &amp; Mentee Meeting?</h2>
<p>A Mentor / Mentee Meeting is a structured, 45-minute session designed to facilitate professional development, skill-building, and strategic career planning.</p>
<p>The primary objective of the meeting is to help the mentee navigate specific professional challenges, explore career opportunities, and commit to concrete growth actions. Rather than a top-down lecture, a great mentorship session is a collaborative, reflective dialogue driven by the mentee's goals and curiosity.</p>
<h3>The Core Objectives of the Session:</h3>
<ul>
<li><strong>Review Progress:</strong> Check in on action items and commitments made during the previous session.</li>
<li><strong>Address Current Challenges:</strong> Deep-dive into a specific decision, skill, or obstacle the mentee is currently facing.</li>
<li><strong>Share Experience &amp; Insights:</strong> Exchange stories, lessons learned, and strategic perspectives.</li>
<li><strong>Define Actionable Next Steps:</strong> Ensure the mentee leaves with 1-2 concrete actions to execute before the next meeting.</li>
<li><strong>Maintain Momentum:</strong> Establish a consistent, predictable rhythm for ongoing development.</li>
</ul>

<h2>The Standard 45-Minute Mentorship Agenda</h2>
<p>To keep your conversations focused and respect both parties' schedules, we recommend a strict <strong>time-boxed 45-minute agenda</strong>:</p>
<table class="td-guide-table">
<thead><tr><th>Time</th><th>Agenda Item</th><th>Objective</th></tr></thead>
<tbody>
<tr><td><strong>00:00 - 00:06</strong></td><td><strong>Reconnect &amp; Recap</strong></td><td>Catch up briefly, rebuild rapport, and review the action items or commitments from your last session.</td></tr>
<tr><td><strong>00:06 - 00:18</strong></td><td><strong>Mentee Sets the Agenda</strong></td><td>The mentee introduces the primary topic or challenge they want help with today (e.g., a decision, skill, or goal).</td></tr>
<tr><td><strong>00:18 - 00:33</strong></td><td><strong>Explore &amp; Share Experience</strong></td><td>Ask diagnostic questions, share relevant stories or lessons, and brainstorm potential solutions together.</td></tr>
<tr><td><strong>00:33 - 00:41</strong></td><td><strong>Decide Next Steps</strong></td><td>Help the mentee choose one or two concrete, realistic actions to take before the next scheduled session.</td></tr>
<tr><td><strong>00:41 - 00:45</strong></td><td><strong>Reflect &amp; Schedule</strong></td><td>Briefly reflect on the value of today's session, confirm the date for the next meeting, and officially close.</td></tr>
</tbody>
</table>

<h2>Key Discussion Prompts for Mentors and Mentees</h2>
<p>To drive deep, meaningful conversations, move away from generic status updates and use these targeted discussion prompts:</p>
<h3>For the Mentee to Ask (To Drive the Conversation):</h3>
<ul>
<li><em>"I am currently facing [Challenge]. How have you handled similar situations in your career?"</em></li>
<li><em>"What are the 2-3 skills you think are most critical for someone in my role to develop over the next year?"</em></li>
<li><em>"How do you balance short-term operational demands with long-term strategic career planning?"</em></li>
</ul>
<h3>For the Mentor to Ask (To Facilitate Reflection):</h3>
<ul>
<li><em>"What is the real bottleneck holding you back from your primary goal right now?"</em></li>
<li><em>"If you could only accomplish one major milestone next month, what would deliver the highest impact?"</em></li>
<li><em>"What is one area where you feel you are playing it too safe in your current role?"</em></li>
</ul>

<h2>Best Practices for a High-Impact Mentorship Relationship</h2>
<h3>1. The Mentee Must Drive the Relationship</h3>
<p>The single most important rule of mentorship is that <strong>the mentee owns the agenda</strong>. The mentee is responsible for scheduling the meetings, preparing the discussion topics in advance, and following up on action items. The mentor is there to guide, support, and share experience - not to manage the mentee's career.</p>
<h3>2. Focus on Growth, Not Just Status Updates</h3>
<p>Do not waste valuable session time giving a chronological list of everything you did last week. Instead, focus the conversation on <strong>strategic growth areas, leadership development, and problem-solving</strong>. Use the recap phase to report on outcomes, then spend the rest of the time looking forward.</p>
<h3>3. Commit to Absolute Confidentiality</h3>
<p>For a mentorship relationship to succeed, there must be complete trust. Both parties must commit to absolute confidentiality regarding everything discussed during the sessions. This psychological safety allows for honest reflection, vulnerability, and genuine breakthrough moments.</p>

<h2>Frequently Asked Questions (FAQs)</h2>
<h3>How often should mentors and mentees meet?</h3>
<p>We recommend meeting <strong>monthly</strong> for a structured, 45-minute session. This frequency provides enough time for the mentee to make meaningful progress on their action items between meetings while respecting the mentor's busy schedule.</p>
<h3>What is the main role of a mentor?</h3>
<p>A mentor's role is to act as a trusted advisor, sounding board, and guide. Rather than telling the mentee exactly what to do, a great mentor asks powerful questions, shares relevant personal experiences, and helps the mentee discover their own solutions.</p>
<h3>How should a mentee prepare for a mentorship meeting?</h3>
<p>A mentee should prepare by updating their progress on previous action items, identifying 1-2 specific challenges or strategic questions they want to discuss, and sending a brief agenda to the mentor at least 24 hours in advance.</p>
<h3>What makes a mentorship relationship successful?</h3>
<p>A successful mentorship relationship is built on mutual respect, clear expectations, active listening, absolute confidentiality, and a commitment to action. The relationship thrives when the mentee is proactive and the mentor is generous with their insights.</p>`,
    // FAQPage JSON-LD source. Keep verbatim with the visible FAQ in guideHtml above.
    faq: [
      {
        q: 'How often should mentors and mentees meet?',
        a: 'We recommend meeting monthly for a structured, 45-minute session. This frequency provides enough time for the mentee to make meaningful progress on their action items between meetings while respecting the mentor\'s busy schedule.',
      },
      {
        q: 'What is the main role of a mentor?',
        a: 'A mentor\'s role is to act as a trusted advisor, sounding board, and guide. Rather than telling the mentee exactly what to do, a great mentor asks powerful questions, shares relevant personal experiences, and helps the mentee discover their own solutions.',
      },
      {
        q: 'How should a mentee prepare for a mentorship meeting?',
        a: 'A mentee should prepare by updating their progress on previous action items, identifying 1-2 specific challenges or strategic questions they want to discuss, and sending a brief agenda to the mentor at least 24 hours in advance.',
      },
      {
        q: 'What makes a mentorship relationship successful?',
        a: 'A successful mentorship relationship is built on mutual respect, clear expectations, active listening, absolute confidentiality, and a commitment to action. The relationship thrives when the mentee is proactive and the mentor is generous with their insights.',
      },
    ],
  },
  {
    slug: 'feedback-coaching-one-on-one',
    title: 'Feedback & Coaching 1:1 Template',
    shortName: 'Feedback & Coaching 1:1',
    description:
      'A feedback and coaching 1:1 template with the agenda and coaching questions managers use to give clear feedback, coach toward solutions, and drive real behavior change.',
    category: 'one-on-ones',
    methodology: 'General',
    minutes: 30,
    cadence: 'As needed',
    participants: 'Manager and direct report (2 people)',
    keywords: [
      'feedback meeting template',
      'coaching 1:1 template',
      'coaching questions for managers',
      'giving feedback template',
      'employee coaching session',
      'feedback conversation agenda',
      'how to give feedback',
      'coaching conversation questions',
    ],
    steps: [
      {
        name: 'Set the purpose',
        minutes: 4,
        text: 'Name what you want to talk about and that the goal is to help them succeed, not to scold.',
      },
      {
        name: 'Share specific feedback',
        minutes: 8,
        text: 'Describe the behavior and its impact with a concrete example, then pause and let them respond.',
      },
      {
        name: 'Hear their perspective',
        minutes: 7,
        text: 'Ask how they see it. There is often context you are missing, and listening builds buy-in.',
      },
      {
        name: 'Coach toward solutions',
        minutes: 8,
        text: 'Shift from telling to asking. Help them generate options and decide what they will change.',
      },
      {
        name: 'Agree and support',
        minutes: 3,
        text: 'Confirm the commitment, offer your support, and agree how you will check in on progress.',
      },
    ],
    bodyHtml:
      '<p>The <strong>feedback and coaching 1:1 template</strong> helps you deliver feedback that actually changes behavior. The difference between feedback that lands and feedback that wounds is structure, specifics, and a genuine shift from telling to coaching.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Use it whenever you need to address a specific behavior or coach someone through a challenge, ideally close to the event so the example is fresh. Small, timely feedback conversations prevent the need for big, painful ones later.</p>' +
      '<h2>Who attends</h2>' +
      '<p>The manager and the direct report, in private. Come with a specific example and a clear sense of the impact. Lead with the intent to help them grow, which sets the tone for everything that follows.</p>' +
      '<h2>How to run it</h2>' +
      '<p>State the purpose, then give specific feedback by describing the behavior and its impact rather than labeling the person. Pause and genuinely hear their side. <em>Then switch from telling to asking, coaching them to their own solution so they own the change.</em> Close by confirming the commitment and your support.</p>' +
      '<h2>Questions to ask</h2>' +
      '<ul>' +
      '<li><strong>How do you see this situation?</strong></li>' +
      '<li><strong>What do you think led to this outcome?</strong></li>' +
      '<li><strong>What would you do differently next time?</strong></li>' +
      '<li><strong>What options do you see for handling it?</strong></li>' +
      '<li><strong>What support do you need from me?</strong></li>' +
      '<li><strong>How will we know it is working?</strong></li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Giving vague feedback with no specific example or impact.</li>' +
      '<li>Attacking the person instead of describing the behavior.</li>' +
      '<li>Lecturing the whole time instead of coaching to a solution.</li>' +
      '<li>Saving up feedback for a review instead of addressing it in the moment.</li>' +
      '</ul>' +
      '<p>Make feedback a habit, not an event. <a href="/l8">Run it in OrgTP</a> and follow through on every coaching commitment.</p>',
    downloadMarkdown:
      '# Feedback & Coaching 1:1 Template\n\n' +
      'Purpose: A focused conversation to deliver specific feedback, hear the other side, and coach a direct report toward their own solution and a real behavior change.\n\n' +
      '- Duration: 30 minutes\n' +
      '- Cadence: As needed\n' +
      '- Participants: Manager and direct report\n\n' +
      '## Agenda\n\n' +
      '- [ ] Set the purpose (4 min)\n' +
      '- [ ] Share specific feedback (8 min)\n' +
      '- [ ] Hear their perspective (7 min)\n' +
      '- [ ] Coach toward solutions (8 min)\n' +
      '- [ ] Agree and support (3 min)\n\n' +
      '## Questions to ask\n\n' +
      '- How do you see this situation?\n' +
      '- What do you think led to this outcome?\n' +
      '- What would you do differently next time?\n' +
      '- What options do you see for handling it?\n' +
      '- What support do you need from me?\n' +
      '- How will we know it is working?\n\n' +
      '## Action items\n\n' +
      '- Owner: __________  Action: __________  Due: __________\n' +
      '- Owner: __________  Action: __________  Due: __________\n' +
      '- Owner: __________  Action: __________  Due: __________\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/feedback-coaching-one-on-one\n',
  },
  {
    slug: 'goal-setting-one-on-one',
    title: 'Goal-Setting 1:1 Template',
    shortName: 'Goal-Setting 1:1',
    description:
      'A goal-setting 1:1 template with the agenda and goal-setting questions managers use to set clear, measurable goals, align on priorities, and commit to a plan together.',
    category: 'one-on-ones',
    methodology: 'General',
    minutes: 45,
    cadence: 'Quarterly',
    participants: 'Manager and direct report (2 people)',
    keywords: [
      'goal setting meeting template',
      'goal setting 1:1',
      'goal setting questions',
      'employee goal setting template',
      'smart goals meeting',
      'quarterly goal setting',
      'priorities alignment meeting',
      'objective setting agenda',
    ],
    steps: [
      {
        name: 'Review the last period',
        minutes: 8,
        text: 'Look back at prior goals: what was hit, what slipped, and what those results tell you.',
      },
      {
        name: 'Connect to the bigger picture',
        minutes: 8,
        text: 'Share team and company priorities so their goals ladder up to something that matters.',
      },
      {
        name: 'Draft the goals together',
        minutes: 15,
        text: 'Co-create a short list of clear, measurable goals. Fewer, sharper goals beat a long wish list.',
      },
      {
        name: 'Pressure-test and prioritize',
        minutes: 9,
        text: 'Check that goals are realistic, name the top priority, and identify likely obstacles.',
      },
      {
        name: 'Commit and define success',
        minutes: 5,
        text: 'Confirm owners, deadlines, and how you will measure and review progress.',
      },
    ],
    bodyHtml:
      '<p>The <strong>goal-setting 1:1 template</strong> turns vague intentions into clear, measurable goals that an employee actually owns. Goals set together, and tied to the bigger picture, drive far more than goals handed down or invented in isolation.</p>' +
      '<h2>When to use it</h2>' +
      '<p>Use it at the start of each goal cycle, commonly quarterly, or when priorities shift enough to warrant a reset. Pair it with a regular review rhythm so goals stay alive instead of being forgotten the day after they are written.</p>' +
      '<h2>Who attends</h2>' +
      '<p>The manager and the direct report. The manager brings the team and company context, the report brings their ideas and ownership, and together you shape goals that are both ambitious and realistic.</p>' +
      '<h2>How to run it</h2>' +
      '<p>Start by reviewing the last period honestly, then connect new goals to team and company priorities. Co-create a short list of measurable goals rather than dictating them. <em>Pressure-test for realism and force a top priority, because everything important means nothing is.</em> Close by defining how you will measure success.</p>' +
      '<h2>Questions to ask</h2>' +
      '<ul>' +
      '<li><strong>What did we learn from last period\'s goals?</strong></li>' +
      '<li><strong>How does this goal connect to the team\'s priorities?</strong></li>' +
      '<li><strong>How will we know this goal is achieved?</strong></li>' +
      '<li><strong>If you could only hit one, which matters most?</strong></li>' +
      '<li><strong>What might get in the way, and how do we plan for it?</strong></li>' +
      '<li><strong>What support do you need to make this happen?</strong></li>' +
      '</ul>' +
      '<h2>Common mistakes</h2>' +
      '<ul>' +
      '<li>Setting goals that cannot be measured, so no one can tell if they are met.</li>' +
      '<li>Dictating goals instead of co-creating them, which kills ownership.</li>' +
      '<li>Setting too many goals so nothing gets real focus.</li>' +
      '<li>Writing goals once and never reviewing them again.</li>' +
      '</ul>' +
      '<p>Set goals that actually get done. <a href="/l8">Run it in OrgTP</a> and keep every goal visible and reviewed all quarter.</p>',
    downloadMarkdown:
      '# Goal-Setting 1:1 Template\n\n' +
      'Purpose: A working session to review the last period, connect to bigger priorities, and co-create clear, measurable goals a direct report owns and commits to.\n\n' +
      '- Duration: 45 minutes\n' +
      '- Cadence: Quarterly\n' +
      '- Participants: Manager and direct report\n\n' +
      '## Agenda\n\n' +
      '- [ ] Review the last period (8 min)\n' +
      '- [ ] Connect to the bigger picture (8 min)\n' +
      '- [ ] Draft the goals together (15 min)\n' +
      '- [ ] Pressure-test and prioritize (9 min)\n' +
      '- [ ] Commit and define success (5 min)\n\n' +
      '## Questions to ask\n\n' +
      '- What did we learn from last period\'s goals?\n' +
      '- How does this goal connect to the team\'s priorities?\n' +
      '- How will we know this goal is achieved?\n' +
      '- If you could only hit one, which matters most?\n' +
      '- What might get in the way, and how do we plan for it?\n' +
      '- What support do you need to make this happen?\n\n' +
      '## Action items\n\n' +
      '- Owner: __________  Action: __________  Due: __________\n' +
      '- Owner: __________  Action: __________  Due: __________\n' +
      '- Owner: __________  Action: __________  Due: __________\n\n' +
      'Free template from OrgTP. Adapt or run it live at orgtp.com/templates/goal-setting-one-on-one\n',
  },
];
