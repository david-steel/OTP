import type { MeetingTemplate } from './_types.js';

export const RETROSPECTIVE_TEMPLATES: MeetingTemplate[] = [
  {
    slug: 'start-stop-continue-retrospective',
    title: 'Start, Stop, Continue Retrospective Template',
    shortName: 'Start, Stop, Continue Retrospective',
    description:
      'Free Start, Stop, Continue retrospective template with agenda, prompts, and timeboxes. Run a fast, action-focused team retro that turns reflection into real commitments.',
    category: 'retrospectives',
    methodology: 'General',
    minutes: 60,
    cadence: 'Per sprint or monthly',
    participants: 'The delivery team and facilitator (4-10 people)',
    keywords: [
      'start stop continue template',
      'start stop continue retrospective',
      'retrospective template',
      'team retro agenda',
      'sprint retrospective template',
      'agile retrospective',
      'retro prompts',
      'continuous improvement meeting',
    ],
    steps: [
      {
        name: 'Set the stage',
        minutes: 5,
        text: 'Welcome the team, restate the goal of the retro, and review the working agreements that keep the conversation safe and honest.',
      },
      {
        name: 'Gather data: Start',
        minutes: 12,
        text: 'Each person writes things the team should START doing. Group similar notes and read them aloud without debate.',
      },
      {
        name: 'Gather data: Stop',
        minutes: 12,
        text: 'Capture things the team should STOP doing because they waste time, add friction, or no longer serve the goal.',
      },
      {
        name: 'Gather data: Continue',
        minutes: 10,
        text: 'List what is working well and should CONTINUE so the team protects its strengths, not just fixes problems.',
      },
      {
        name: 'Generate insights and vote',
        minutes: 11,
        text: 'Discuss the highest-signal notes and dot-vote to find the two or three items worth acting on this cycle.',
      },
      {
        name: 'Decide actions and close',
        minutes: 10,
        text: 'Turn the top votes into owned action items with due dates, then do a one-word closing check around the room.',
      },
    ],
    bodyHtml: `<p>The <strong>Start, Stop, Continue retrospective</strong> is the fastest way to turn a team's reflection into concrete change. Instead of an open-ended "how did it go?" it forces three clear lanes: what to begin, what to end, and what to protect. That structure is why it remains one of the most-used retro formats for agile teams, project squads, and leadership groups alike.</p>
<h2>When to use it</h2>
<p>Reach for this <em>start stop continue template</em> at the end of a sprint, a project phase, or a month of work. It shines when a team is short on time but needs a meaningful review, or when newer teams want a retro format that is easy to understand on the first try.</p>
<h2>Who attends</h2>
<p>The whole delivery team plus a neutral facilitator. Keep it to roughly four to ten people so everyone gets airtime. Managers can join, but they should listen more than they steer so the team speaks freely.</p>
<h2>How to run it</h2>
<p>Open by restating the goal and the working agreements. Then move through the three lanes in order: Start, Stop, Continue. Give people quiet time to write before anyone speaks, so the loudest voice does not anchor the room. Cluster similar notes, read them out, and dot-vote to surface the two or three items that matter most. Finally, convert those into owned action items with due dates and close with a quick round of one-word reactions.</p>
<h2>Facilitator tips</h2>
<ul>
<li>Silent writing first, discussion second, so quieter teammates contribute equally.</li>
<li>Timebox every lane and use a visible timer to keep momentum.</li>
<li>Always end "Continue" on a win so the retro does not feel like a complaint session.</li>
<li>Assign an owner and a date to every action, or it will not happen.</li>
</ul>
<h2>Common mistakes</h2>
<ul>
<li>Letting the list grow long instead of voting down to a few real changes.</li>
<li>Skipping "Continue" and treating the retro as a problem dump.</li>
<li>Leaving actions ownerless, so nothing carries into the next cycle.</li>
<li>Allowing blame instead of focusing on systems and process.</li>
</ul>
<p>Ready to make your retros stick? <a href="/l8">Run it in OrgTP</a> to capture actions, assign owners, and track them automatically into your next meeting.</p>`,
    downloadMarkdown: `# Start, Stop, Continue Retrospective Template

**Purpose:** Run a fast, action-focused team retro by sorting reflections into what to start, stop, and continue, then committing to a few real changes.

- **Duration:** 60 minutes
- **Cadence:** Per sprint or monthly
- **Participants:** The delivery team and facilitator (4-10 people)

## Agenda
- [ ] Set the stage and review working agreements (5 min)
- [ ] Gather data: Start (12 min)
- [ ] Gather data: Stop (12 min)
- [ ] Gather data: Continue (10 min)
- [ ] Generate insights and dot-vote (11 min)
- [ ] Decide actions and close (10 min)

## Prompts
- Start: What should we begin doing that we are not doing today?
- Stop: What should we stop doing because it wastes time or adds friction?
- Continue: What is working well that we should protect and keep doing?
- Which two or three items are worth acting on this cycle?

## Action items
- [ ] Action: __________________  Owner: __________  Due: __________
- [ ] Action: __________________  Owner: __________  Due: __________
- [ ] Action: __________________  Owner: __________  Due: __________

---
Free template from OrgTP. Adapt or run it live at orgtp.com/templates/start-stop-continue-retrospective`,
    guideHtml: `<h2>The Ultimate Start, Stop, Continue Retrospective Template &amp; Guide</h2>
<p>Continuous improvement is the cornerstone of agile teams, but traditional retrospectives can easily devolve into aimless venting sessions or repetitive discussions. To drive real, actionable change, teams need a simple, action-oriented framework. That is where the <strong>Start, Stop, Continue</strong> retrospective comes in.</p>
<p>By focusing strictly on concrete actions - what to start doing, what to stop doing, and what to keep doing - this framework cuts through the noise and leaves your team with a clear, realistic action plan for the upcoming cycle.</p>
<p>This comprehensive guide provides a battle-tested <strong>Start, Stop, Continue Template</strong> and a step-by-step guide to running a high-impact retrospective that actually drives team progress.</p>

<h2>What is a Start, Stop, Continue Retrospective?</h2>
<p>The Start, Stop, Continue retrospective is a team reflection exercise designed to evaluate recent performance and identify specific behavioral or operational changes.</p>
<p>Unlike other retrospective formats that focus heavily on feelings or abstract concepts, this framework is strictly <strong>action-oriented</strong>. It forces the team to categorize their feedback into three distinct, actionable buckets:</p>
<ul>
<li><strong>Start:</strong> New ideas, processes, or tools that the team should introduce to improve performance, efficiency, or collaboration.</li>
<li><strong>Stop:</strong> Current behaviors, bottlenecks, or inefficient processes that are actively hurting the team and should be abandoned immediately.</li>
<li><strong>Continue:</strong> Successful practices, habits, or workflows that are delivering value and must be preserved and reinforced.</li>
</ul>

<h2>The Standard 60-Minute Retrospective Agenda</h2>
<p>To keep your team energized and ensure you leave the meeting with concrete action items, we recommend a strict <strong>time-boxed 60-minute agenda</strong>:</p>
<table class="td-guide-table">
<thead><tr><th>Time</th><th>Agenda Item</th><th>Objective</th></tr></thead>
<tbody>
<tr><td><strong>00:00 - 00:05</strong></td><td><strong>Set the Stage</strong></td><td>Welcome the team, outline the focus of the retrospective (e.g., the last sprint or month), and establish a safe, collaborative environment.</td></tr>
<tr><td><strong>00:05 - 00:15</strong></td><td><strong>Silent Brainstorming</strong></td><td>Team members work individually to write down their feedback and place them into the Start, Stop, and Continue buckets.</td></tr>
<tr><td><strong>00:15 - 00:30</strong></td><td><strong>Group &amp; Discuss</strong></td><td>Group similar ideas together, read them aloud, and discuss the feedback as a team to ensure mutual understanding.</td></tr>
<tr><td><strong>00:30 - 00:45</strong></td><td><strong>Prioritize (Dot Voting)</strong></td><td>Give team members 3-5 votes each to identify the most critical items in each bucket that require immediate action.</td></tr>
<tr><td><strong>00:45 - 00:55</strong></td><td><strong>Create Action Items</strong></td><td>Turn the top-voted items into concrete action items with a clear owner and a realistic deadline.</td></tr>
<tr><td><strong>00:55 - 01:00</strong></td><td><strong>Wrap-Up &amp; Close</strong></td><td>Thank the team, confirm where the action items will be tracked, and officially close the meeting.</td></tr>
</tbody>
</table>

<h2>Best Practices for a High-Impact Retrospective</h2>
<p>To get the most out of your Start, Stop, Continue exercise, implement these three essential best practices:</p>
<h3>1. Establish Psychological Safety First</h3>
<p>A retrospective only works if team members feel safe sharing honest feedback. Remind the team of the <strong>Retrospective Prime Directive</strong>: <em>Regardless of what we discover, we understand and truly believe that everyone did the best job they could, given what they knew at the time, their skills and abilities, the resources available, and the situation at hand.</em></p>
<h3>2. Focus on the "Stop" Bucket</h3>
<p>Teams are usually great at coming up with new things to "Start" doing, but they rarely discuss what they need to "Stop" doing. Overloading a team with new initiatives without removing old bottlenecks leads to burnout. Force the team to identify at least 2-3 operational habits they can realistically stop.</p>
<h3>3. Limit Your Action Items</h3>
<p>Do not try to solve every problem at once. A successful retrospective should result in no more than <strong>3 to 5 high-priority action items</strong> for the next cycle. If you try to implement 15 changes at once, your team will lose focus and accomplish none of them.</p>

<h2>Frequently Asked Questions (FAQs)</h2>
<h3>How often should you run a Start, Stop, Continue retrospective?</h3>
<p>This exercise is highly versatile and can be run at the end of every sprint (typically every 2 weeks), at the end of a major project milestone, or on a monthly basis to check in on team dynamics and operational health.</p>
<h3>Who should facilitate the retrospective?</h3>
<p>The retrospective is typically facilitated by the Scrum Master or Agile Project Manager. However, to keep things fresh and encourage shared ownership, you can rotate the facilitator role among different team members each cycle.</p>
<h3>What is the difference between Start, Stop, Continue and Glad, Sad, Mad?</h3>
<p>While Glad, Sad, Mad focuses heavily on the emotional state of the team during the last cycle, Start, Stop, Continue is strictly focused on operational actions and behavioral changes. Both are valuable, but Start, Stop, Continue is ideal when you need to drive immediate process improvements.</p>
<h3>How do you ensure retrospective action items are actually completed?</h3>
<p>Every action item must have a single owner and a clear deadline. Review the status of the previous retrospective's action items during the "Set the Stage" phase of your next meeting to maintain accountability and show the team that their feedback drives real change.</p>`,
    // FAQPage JSON-LD source. Keep verbatim with the visible FAQ in guideHtml above.
    faq: [
      {
        q: 'How often should you run a Start, Stop, Continue retrospective?',
        a: 'This exercise is highly versatile and can be run at the end of every sprint (typically every 2 weeks), at the end of a major project milestone, or on a monthly basis to check in on team dynamics and operational health.',
      },
      {
        q: 'Who should facilitate the retrospective?',
        a: 'The retrospective is typically facilitated by the Scrum Master or Agile Project Manager. However, to keep things fresh and encourage shared ownership, you can rotate the facilitator role among different team members each cycle.',
      },
      {
        q: 'What is the difference between Start, Stop, Continue and Glad, Sad, Mad?',
        a: 'While Glad, Sad, Mad focuses heavily on the emotional state of the team during the last cycle, Start, Stop, Continue is strictly focused on operational actions and behavioral changes. Both are valuable, but Start, Stop, Continue is ideal when you need to drive immediate process improvements.',
      },
      {
        q: 'How do you ensure retrospective action items are actually completed?',
        a: 'Every action item must have a single owner and a clear deadline. Review the status of the previous retrospective\'s action items during the "Set the Stage" phase of your next meeting to maintain accountability and show the team that their feedback drives real change.',
      },
    ],
  },
  {
    slug: 'sailboat-retrospective',
    title: 'Sailboat Retrospective Template',
    shortName: 'Sailboat Retrospective',
    description:
      'Free sailboat retrospective template with a visual metaphor, agenda, and prompts. Map your winds, anchors, rocks, and island to align the team and decide clear actions.',
    category: 'retrospectives',
    methodology: 'General',
    minutes: 75,
    cadence: 'Per sprint or project milestone',
    participants: 'The team and a facilitator (4-12 people)',
    keywords: [
      'sailboat retro',
      'sailboat retrospective template',
      'retrospective template',
      'agile retrospective',
      'sprint retro agenda',
      'visual retrospective',
      'winds and anchors retro',
      'team reflection meeting',
    ],
    steps: [
      {
        name: 'Set the stage',
        minutes: 8,
        text: 'Draw or display the sailboat and explain the metaphor: the boat is the team, sailing toward an island goal.',
      },
      {
        name: 'Gather data: Winds',
        minutes: 12,
        text: 'Capture the winds that push the team forward: helpful practices, tools, and people that build momentum.',
      },
      {
        name: 'Gather data: Anchors',
        minutes: 12,
        text: 'List the anchors that slow the team down: blockers, dependencies, and habits that drag on progress.',
      },
      {
        name: 'Gather data: Rocks and island',
        minutes: 13,
        text: 'Name the rocks (risks ahead) and the island (the goal) so the team sees both the destination and the dangers.',
      },
      {
        name: 'Generate insights',
        minutes: 15,
        text: 'Discuss the strongest themes, cluster related notes, and vote on which anchors and rocks to address first.',
      },
      {
        name: 'Decide actions and close',
        minutes: 15,
        text: 'Turn the top items into owned actions, then close with a quick check on how the crew is feeling.',
      },
    ],
    bodyHtml: `<p>The <strong>sailboat retrospective</strong> trades a plain list for a picture the whole team can rally around. A boat (your team) sails toward an island (your goal). Winds push it forward, anchors hold it back, and rocks lurk as risks ahead. That single image makes a <em>sailboat retro</em> feel approachable and surfaces insights a bullet list often misses.</p>
<h2>When to use it</h2>
<p>This sailboat retrospective template works well at the end of a sprint or a project milestone, especially when the team feels stuck and a fresh, visual format can unlock honest conversation. It is also a strong choice for teams new to retros who respond better to metaphor than to abstract questions.</p>
<h2>Who attends</h2>
<p>The delivery team and a facilitator, ideally four to twelve people. A visible drawing surface (whiteboard or shared canvas) is essential so everyone can place notes on the picture together.</p>
<h2>How to run it</h2>
<p>Start by drawing the sailboat, the island, the wind, the anchors, and the rocks, then explain what each represents. Give the team quiet time to add sticky notes to each zone. Walk the picture out loud, cluster similar notes, and dot-vote on the anchors and rocks worth tackling. Convert the top votes into owned actions with due dates, and close with a short feeling check so you know how the crew is doing.</p>
<h2>Facilitator tips</h2>
<ul>
<li>Set the island (the goal) clearly first, or the rest of the metaphor floats free.</li>
<li>Let people write silently before discussing so ideas are not anchored by the first speaker.</li>
<li>Spend most of the action time on anchors and rocks, since those are what you can change.</li>
<li>Photograph or save the canvas as a record of the team's thinking.</li>
</ul>
<h2>Common mistakes</h2>
<ul>
<li>Skipping the island, leaving the team with no goal to sail toward.</li>
<li>Cataloguing every note instead of voting down to a few real changes.</li>
<li>Treating winds as filler instead of practices worth protecting.</li>
<li>Ending without owners and dates on the chosen actions.</li>
</ul>
<p>Want your sailboat actions to actually move the team? <a href="/l8">Run it in OrgTP</a> to assign owners, set dates, and carry every commitment into your next meeting.</p>`,
    downloadMarkdown: `# Sailboat Retrospective Template

**Purpose:** Use the sailboat metaphor to map what drives the team forward, what holds it back, and the risks ahead, then commit to clear actions.

- **Duration:** 75 minutes
- **Cadence:** Per sprint or project milestone
- **Participants:** The team and a facilitator (4-12 people)

## Agenda
- [ ] Set the stage and draw the sailboat (8 min)
- [ ] Gather data: Winds (12 min)
- [ ] Gather data: Anchors (12 min)
- [ ] Gather data: Rocks and island (13 min)
- [ ] Generate insights and vote (15 min)
- [ ] Decide actions and close (15 min)

## Prompts
- Island: What goal are we sailing toward?
- Winds: What is pushing us forward and giving us momentum?
- Anchors: What is slowing us down or holding us back?
- Rocks: What risks lie ahead that could sink us?
- Which anchors and rocks should we address first?

## Action items
- [ ] Action: __________________  Owner: __________  Due: __________
- [ ] Action: __________________  Owner: __________  Due: __________
- [ ] Action: __________________  Owner: __________  Due: __________

---
Free template from OrgTP. Adapt or run it live at orgtp.com/templates/sailboat-retrospective`,
  },
  {
    slug: '4ls-retrospective',
    title: '4 Ls Retrospective Template',
    shortName: '4 Ls Retrospective',
    description:
      'Free 4 Ls retrospective template covering Liked, Learned, Lacked, and Longed for. Get a balanced team retro with agenda, prompts, and timeboxes that drives clear actions.',
    category: 'retrospectives',
    methodology: 'General',
    minutes: 60,
    cadence: 'Per sprint or project phase',
    participants: 'The team and a facilitator (4-10 people)',
    keywords: [
      '4 ls retrospective',
      '4 ls retro template',
      'liked learned lacked longed for',
      'retrospective template',
      'agile retrospective',
      'sprint retro agenda',
      'balanced retrospective',
      'team learning meeting',
    ],
    steps: [
      {
        name: 'Set the stage',
        minutes: 5,
        text: 'Welcome the team, frame the goal, and explain the four lenses: Liked, Learned, Lacked, and Longed for.',
      },
      {
        name: 'Gather data: Liked',
        minutes: 10,
        text: 'Capture what people genuinely enjoyed or appreciated about the work and the way the team operated.',
      },
      {
        name: 'Gather data: Learned',
        minutes: 10,
        text: 'List new knowledge, skills, or insights the team gained, including lessons from things that went wrong.',
      },
      {
        name: 'Gather data: Lacked',
        minutes: 10,
        text: 'Name what was missing: resources, clarity, time, or support that would have made the work better.',
      },
      {
        name: 'Gather data: Longed for',
        minutes: 10,
        text: 'Surface what people wished they had or hoped for, even if it felt out of reach this cycle.',
      },
      {
        name: 'Generate insights and decide actions',
        minutes: 15,
        text: 'Cluster themes, vote on what to act on, and turn the top items into owned actions before closing.',
      },
    ],
    bodyHtml: `<p>The <strong>4 Ls retrospective</strong> gives a team four balanced lenses to reflect through: Liked, Learned, Lacked, and Longed for. By pairing positive reflection (Liked, Learned) with honest gaps (Lacked, Longed for), this format keeps a retro from tipping into either cheerleading or complaint. That balance is why the <em>4 Ls retro template</em> works so well for teams that want growth and morale in the same meeting.</p>
<h2>When to use it</h2>
<p>Use the 4 Ls at the end of a sprint, a release, or a project phase, especially when the team has been through a steep learning curve and you want to bank the lessons. It is also a great pick when morale needs a lift but real problems still need to surface.</p>
<h2>Who attends</h2>
<p>The whole delivery team plus a neutral facilitator, roughly four to ten people. Keep the group small enough that every voice is heard across all four lenses.</p>
<h2>How to run it</h2>
<p>Frame the four lenses up front so people know what each one means. Give quiet writing time per lens, then read and cluster the notes together. The "Learned" lens often holds the richest material, so leave room to draw it out. Move into voting to find the few items worth acting on, and convert those into owned actions with due dates before you close.</p>
<h2>Facilitator tips</h2>
<ul>
<li>Define "Lacked" versus "Longed for" clearly, since teams often confuse the two.</li>
<li>Use silent writing first so no single voice frames the room.</li>
<li>Mine the "Learned" lens for reusable lessons worth sharing beyond the team.</li>
<li>Vote down to a few actions instead of trying to fix everything at once.</li>
</ul>
<h2>Common mistakes</h2>
<ul>
<li>Treating "Liked" as filler instead of practices worth protecting.</li>
<li>Letting "Lacked" and "Longed for" blur into one vague list.</li>
<li>Gathering rich data but never converting it into owned actions.</li>
<li>Rushing the discussion and skipping the insight step.</li>
</ul>
<p>Want the lessons to outlast the meeting? <a href="/l8">Run it in OrgTP</a> to capture every L, assign owners, and track actions into your next retro.</p>`,
    downloadMarkdown: `# 4 Ls Retrospective Template

**Purpose:** Reflect through four balanced lenses (Liked, Learned, Lacked, Longed for) to bank lessons, protect what works, and commit to clear actions.

- **Duration:** 60 minutes
- **Cadence:** Per sprint or project phase
- **Participants:** The team and a facilitator (4-10 people)

## Agenda
- [ ] Set the stage and frame the four lenses (5 min)
- [ ] Gather data: Liked (10 min)
- [ ] Gather data: Learned (10 min)
- [ ] Gather data: Lacked (10 min)
- [ ] Gather data: Longed for (10 min)
- [ ] Generate insights and decide actions (15 min)

## Prompts
- Liked: What did you enjoy or appreciate about this cycle?
- Learned: What new knowledge, skills, or insights did we gain?
- Lacked: What was missing that would have made the work better?
- Longed for: What did you wish we had or hope for, even if out of reach?
- Which items are worth acting on next cycle?

## Action items
- [ ] Action: __________________  Owner: __________  Due: __________
- [ ] Action: __________________  Owner: __________  Due: __________
- [ ] Action: __________________  Owner: __________  Due: __________

---
Free template from OrgTP. Adapt or run it live at orgtp.com/templates/4ls-retrospective`,
  },
  {
    slug: 'mad-sad-glad-retrospective',
    title: 'Mad, Sad, Glad Retrospective Template',
    shortName: 'Mad, Sad, Glad Retrospective',
    description:
      'Free Mad, Sad, Glad retrospective template with agenda and prompts. Use emotion as data to surface team friction and wins, then turn the strongest signals into clear actions.',
    category: 'retrospectives',
    methodology: 'General',
    minutes: 60,
    cadence: 'Per sprint or monthly',
    participants: 'The team and a facilitator (4-10 people)',
    keywords: [
      'mad sad glad retrospective',
      'mad sad glad template',
      'retrospective template',
      'agile retrospective',
      'emotions retro',
      'sprint retro agenda',
      'team morale meeting',
      'feelings retrospective',
    ],
    steps: [
      {
        name: 'Set the stage',
        minutes: 6,
        text: 'Welcome the team, restate the goal, and set a safe tone since this retro works with feelings as data.',
      },
      {
        name: 'Gather data: Mad',
        minutes: 12,
        text: 'Capture what frustrated or angered people: friction, blockers, and moments that drained energy.',
      },
      {
        name: 'Gather data: Sad',
        minutes: 12,
        text: 'List what disappointed the team: missed goals, unmet expectations, or things that fell short.',
      },
      {
        name: 'Gather data: Glad',
        minutes: 11,
        text: 'Surface what made people happy or proud: wins, good collaboration, and moments worth celebrating.',
      },
      {
        name: 'Generate insights',
        minutes: 9,
        text: 'Find the patterns behind the emotions, cluster related notes, and vote on what to address first.',
      },
      {
        name: 'Decide actions and close',
        minutes: 10,
        text: 'Turn the strongest signals into owned actions with due dates, then close with a brief check-out.',
      },
    ],
    bodyHtml: `<p>The <strong>Mad, Sad, Glad retrospective</strong> treats emotion as data. Instead of asking only what happened, it asks how the work felt: what made people mad, what made them sad, and what made them glad. Those feelings are early signals of friction and engagement that a metrics-only review will miss, which is why the <em>Mad, Sad, Glad template</em> is a favorite for teams that care about morale alongside delivery.</p>
<h2>When to use it</h2>
<p>Use this format after an intense sprint, a stressful release, or any cycle where tension or fatigue is in the air. It is especially valuable when you sense unspoken frustration and want a safe structure that gives people permission to name how they feel.</p>
<h2>Who attends</h2>
<p>The delivery team and a facilitator, roughly four to ten people. Psychological safety matters here, so keep managers in listening mode and make it clear that nothing shared will be held against anyone.</p>
<h2>How to run it</h2>
<p>Open by setting a safe, judgment-free tone. Move through Mad, Sad, and Glad in turn, giving people quiet time to write before sharing. The goal is not to vent and stop, but to look underneath each emotion for its cause. Cluster the notes, find the patterns, and vote on what to act on. End "Glad" on a genuine high, then convert the strongest signals into owned actions with due dates.</p>
<h2>Facilitator tips</h2>
<ul>
<li>Open with explicit safety: feelings are valid and will not be used against anyone.</li>
<li>Always dig from the emotion to its underlying cause before deciding actions.</li>
<li>End on "Glad" so the team leaves with energy, not just grievances.</li>
<li>Watch for one person dominating; protect quieter voices.</li>
</ul>
<h2>Common mistakes</h2>
<ul>
<li>Letting the retro become a venting session with no path to action.</li>
<li>Dismissing emotions instead of treating them as real signals.</li>
<li>Skipping the "why" and acting on surface complaints.</li>
<li>Leaving the chosen actions without owners or dates.</li>
</ul>
<p>Want emotion to lead to real change? <a href="/l8">Run it in OrgTP</a> to capture the signals, assign owners, and follow actions into your next meeting.</p>`,
    downloadMarkdown: `# Mad, Sad, Glad Retrospective Template

**Purpose:** Use emotion as data to surface friction and wins, dig to root causes, and turn the strongest signals into clear, owned actions.

- **Duration:** 60 minutes
- **Cadence:** Per sprint or monthly
- **Participants:** The team and a facilitator (4-10 people)

## Agenda
- [ ] Set the stage and set a safe tone (6 min)
- [ ] Gather data: Mad (12 min)
- [ ] Gather data: Sad (12 min)
- [ ] Gather data: Glad (11 min)
- [ ] Generate insights and vote (9 min)
- [ ] Decide actions and close (10 min)

## Prompts
- Mad: What frustrated or angered you this cycle?
- Sad: What disappointed you or fell short of expectations?
- Glad: What made you happy or proud and is worth celebrating?
- What is the underlying cause behind each strong emotion?
- Which signals should we act on first?

## Action items
- [ ] Action: __________________  Owner: __________  Due: __________
- [ ] Action: __________________  Owner: __________  Due: __________
- [ ] Action: __________________  Owner: __________  Due: __________

---
Free template from OrgTP. Adapt or run it live at orgtp.com/templates/mad-sad-glad-retrospective`,
  },
  {
    slug: 'pre-mortem-meeting',
    title: 'Pre-Mortem Meeting Template',
    shortName: 'Pre-Mortem Meeting',
    description:
      'Free pre-mortem meeting template with agenda and prompts. Imagine the project has already failed, surface hidden risks early, and turn them into preventive actions.',
    category: 'retrospectives',
    methodology: 'General',
    minutes: 75,
    cadence: 'As needed, before a project or launch',
    participants: 'The project team and stakeholders (5-12 people)',
    keywords: [
      'pre-mortem template',
      'premortem meeting template',
      'project risk meeting',
      'risk analysis template',
      'prospective hindsight',
      'project planning meeting',
      'failure analysis template',
      'launch readiness meeting',
    ],
    steps: [
      {
        name: 'Set the stage',
        minutes: 8,
        text: 'Frame the project and explain the exercise: assume it is months from now and the project has failed badly.',
      },
      {
        name: 'Imagine the failure',
        minutes: 10,
        text: 'Each person silently writes the story of how and why the project failed, in vivid, specific detail.',
      },
      {
        name: 'Gather the reasons',
        minutes: 17,
        text: 'Go around the room and collect every cause of failure without debate, building a full list of risks.',
      },
      {
        name: 'Cluster and prioritize',
        minutes: 15,
        text: 'Group related risks, then rank them by likelihood and impact to find the few that most threaten success.',
      },
      {
        name: 'Decide preventive actions',
        minutes: 15,
        text: 'For the top risks, agree on mitigations or early-warning signals, each with a clear owner and date.',
      },
      {
        name: 'Close',
        minutes: 10,
        text: 'Summarize the agreed mitigations, confirm owners, and decide how risks will be revisited as work proceeds.',
      },
    ],
    bodyHtml: `<p>A <strong>pre-mortem meeting</strong> flips the usual retrospective: instead of looking back at what went wrong, the team imagines a future where the project has already failed and works backward to explain why. This technique, sometimes called prospective hindsight, makes people far more willing to voice doubts they would otherwise keep quiet. A good <em>pre-mortem template</em> turns those doubts into preventive action before any damage is done.</p>
<h2>When to use it</h2>
<p>Run a pre-mortem at the start of a significant project, before a major launch, or ahead of any high-stakes decision where failure would be costly. It is most powerful when the team is confident and momentum is high, exactly when blind spots hide best.</p>
<h2>Who attends</h2>
<p>The core project team plus key stakeholders, roughly five to twelve people. Diversity of perspective matters: include people close to delivery, to the customer, and to the risks, so no single viewpoint dominates the failure story.</p>
<h2>How to run it</h2>
<p>Set the scene clearly: it is months from now and the project has failed badly. Give people quiet time to write the story of that failure in concrete detail. Collect every cause without debate first, so the list stays generous. Then cluster related risks and rank them by likelihood and impact. For the top few, agree on mitigations or early-warning signals, each with an owner and a date, and decide how you will revisit them as the work unfolds.</p>
<h2>Facilitator tips</h2>
<ul>
<li>Make the failure vivid and specific; "it failed" is too vague to learn from.</li>
<li>Collect all causes before any debate so people do not self-censor.</li>
<li>Rank by likelihood and impact so you act on the risks that matter.</li>
<li>Turn every top risk into an owned mitigation, not just a noted concern.</li>
</ul>
<h2>Common mistakes</h2>
<ul>
<li>Treating it as a pessimism session instead of structured risk discovery.</li>
<li>Listing risks but never assigning mitigations or owners.</li>
<li>Letting optimism shut down honest worry too early.</li>
<li>Never revisiting the risks once the project is underway.</li>
</ul>
<p>Want your risks tracked, not forgotten? <a href="/l8">Run it in OrgTP</a> to capture every mitigation, assign owners, and revisit them as the project moves.</p>`,
    downloadMarkdown: `# Pre-Mortem Meeting Template

**Purpose:** Imagine the project has already failed, work backward to surface hidden risks, and turn the most dangerous ones into owned preventive actions.

- **Duration:** 75 minutes
- **Cadence:** As needed, before a project or launch
- **Participants:** The project team and stakeholders (5-12 people)

## Agenda
- [ ] Set the stage and frame the exercise (8 min)
- [ ] Imagine the failure (silent writing) (10 min)
- [ ] Gather the reasons for failure (17 min)
- [ ] Cluster and prioritize risks (15 min)
- [ ] Decide preventive actions (15 min)
- [ ] Close and confirm owners (10 min)

## Prompts
- It is months from now and the project has failed badly. What happened?
- What were the specific causes of the failure?
- Which risks are most likely and most damaging?
- What mitigation or early-warning signal addresses each top risk?
- How and when will we revisit these risks?

## Action items
- [ ] Mitigation: __________________  Owner: __________  Due: __________
- [ ] Mitigation: __________________  Owner: __________  Due: __________
- [ ] Mitigation: __________________  Owner: __________  Due: __________

---
Free template from OrgTP. Adapt or run it live at orgtp.com/templates/pre-mortem-meeting`,
  },
  {
    slug: 'post-mortem-incident-review',
    title: 'Post-Mortem / Incident Review Template',
    shortName: 'Post-Mortem / Incident Review',
    description:
      'Free blameless post-mortem and incident review template with agenda and prompts. Build a clear timeline, find root causes, and ship preventive actions without blaming people.',
    category: 'retrospectives',
    methodology: 'General',
    minutes: 75,
    cadence: 'As needed, after an incident',
    participants: 'Responders, owners, and a facilitator (4-12 people)',
    keywords: [
      'post mortem template',
      'incident review template',
      'blameless incident review',
      'blameless postmortem',
      'root cause analysis template',
      'incident retrospective',
      'outage review meeting',
      'reliability review template',
    ],
    steps: [
      {
        name: 'Set the stage: blameless framing',
        minutes: 8,
        text: 'Open by stating the blameless rule: we examine systems and decisions, never assign personal blame.',
      },
      {
        name: 'Build the timeline',
        minutes: 18,
        text: 'Reconstruct what happened minute by minute: detection, response, escalation, and resolution, using facts.',
      },
      {
        name: 'Analyze impact',
        minutes: 10,
        text: 'Quantify the impact on customers, systems, and the business so the severity is shared and clear.',
      },
      {
        name: 'Find root causes',
        minutes: 17,
        text: 'Ask why repeatedly to move past symptoms to the contributing conditions and the true root causes.',
      },
      {
        name: 'Decide preventive actions',
        minutes: 12,
        text: 'Agree on fixes and safeguards that stop recurrence, each with a clear owner and a due date.',
      },
      {
        name: 'Close and document',
        minutes: 10,
        text: 'Recap actions, confirm owners, and agree how the written post-mortem will be shared for learning.',
      },
    ],
    bodyHtml: `<p>A <strong>post-mortem</strong>, also called an incident review, is how a team learns from an outage, defect, or failure without repeating it. The single most important rule is that it is <strong>blameless</strong>. People act rationally given the information and tools they had at the time, so a <em>blameless incident review</em> examines systems, decisions, and conditions, never individuals. When people fear blame, they hide facts, and the team learns nothing.</p>
<h2>When to use it</h2>
<p>Run a post-mortem after any significant incident: an outage, a data issue, a missed launch, or a near-miss worth learning from. The best reviews happen soon after resolution, while memory is fresh but the immediate fire is out.</p>
<h2>Who attends</h2>
<p>The people who detected, responded to, and own the affected systems, plus a neutral facilitator, roughly four to twelve people. Include those closest to the incident, and keep leadership in listening mode so the room stays honest.</p>
<h2>How to run it</h2>
<p>Begin by stating the blameless rule out loud and meaning it. Build a factual timeline of detection, response, and resolution before any analysis. Quantify the impact so severity is shared. Then dig for root causes by asking why repeatedly, moving past symptoms to the conditions that allowed the incident. Agree on preventive actions with owners and dates, and commit to writing and sharing the post-mortem so the whole organization learns, not just the room.</p>
<h2>Facilitator tips</h2>
<ul>
<li>State the blameless rule first and enforce it the moment blame creeps in.</li>
<li>Separate timeline from analysis; get the facts straight before asking why.</li>
<li>Push past the first cause; the real root is usually several whys deep.</li>
<li>Write it down and share widely so the lesson scales beyond attendees.</li>
</ul>
<h2>Common mistakes</h2>
<ul>
<li>Letting the review turn into finger-pointing, which kills honesty.</li>
<li>Stopping at human error instead of the system that allowed it.</li>
<li>Producing action items that never get owners, dates, or follow-up.</li>
<li>Filing the document where no one will ever read it.</li>
</ul>
<p>Want your incidents to drive real reliability gains? <a href="/l8">Run it in OrgTP</a> to capture the timeline, assign owners, and track every preventive action to done.</p>`,
    downloadMarkdown: `# Post-Mortem / Incident Review Template

**Purpose:** Run a blameless incident review that builds a factual timeline, finds true root causes, and ships preventive actions, examining systems not people.

- **Duration:** 75 minutes
- **Cadence:** As needed, after an incident
- **Participants:** Responders, owners, and a facilitator (4-12 people)

## Agenda
- [ ] Set the stage with blameless framing (8 min)
- [ ] Build the timeline of events (18 min)
- [ ] Analyze impact (10 min)
- [ ] Find root causes (5 whys) (17 min)
- [ ] Decide preventive actions (12 min)
- [ ] Close and document (10 min)

## Prompts
- What happened, minute by minute, from detection to resolution?
- What was the impact on customers, systems, and the business?
- Why did it happen, and why did that happen, until we reach the root cause?
- What systemic safeguard would prevent recurrence?
- How will we share this review so others learn from it?

## Action items
- [ ] Preventive action: __________________  Owner: __________  Due: __________
- [ ] Preventive action: __________________  Owner: __________  Due: __________
- [ ] Preventive action: __________________  Owner: __________  Due: __________

---
Free template from OrgTP. Adapt or run it live at orgtp.com/templates/post-mortem-incident-review`,
  },
  {
    slug: 'lean-coffee-retrospective',
    title: 'Lean Coffee Retrospective Template',
    shortName: 'Lean Coffee Retrospective',
    description:
      'Free Lean Coffee retrospective template with agenda and prompts. Run a structured, agendaless retro where the team builds the topic list, votes, and timeboxes each discussion.',
    category: 'retrospectives',
    methodology: 'General',
    minutes: 60,
    cadence: 'Per sprint or as needed',
    participants: 'The team and a facilitator (3-10 people)',
    keywords: [
      'lean coffee template',
      'lean coffee retrospective',
      'agendaless meeting template',
      'retrospective template',
      'democratic retro',
      'timeboxed discussion meeting',
      'team discussion format',
      'structured retro agenda',
    ],
    steps: [
      {
        name: 'Set the stage',
        minutes: 5,
        text: 'Explain the Lean Coffee format: the team builds the agenda live, votes on topics, and timeboxes each one.',
      },
      {
        name: 'Brainstorm topics',
        minutes: 8,
        text: 'Everyone writes discussion topics or questions on cards, one idea per card, with no debate yet.',
      },
      {
        name: 'Vote and order',
        minutes: 7,
        text: 'Dot-vote on the cards and sort the topics from most to least votes to set the running order.',
      },
      {
        name: 'Discuss in timeboxes',
        minutes: 30,
        text: 'Discuss the top topic for a short timebox, then thumb-vote to continue or move on to the next.',
      },
      {
        name: 'Capture actions and close',
        minutes: 10,
        text: 'Note any decisions or actions that emerged, assign owners and dates, and close with a quick check-out.',
      },
    ],
    bodyHtml: `<p><strong>Lean Coffee</strong> is a structured but agendaless retrospective. There is no pre-set list of topics; the team builds the agenda in the room, votes on what matters most, and discusses each item in a short timebox. The result is a <em>Lean Coffee retrospective</em> that spends time only on what the team actually cares about, with democratic ordering and no single person steering the conversation.</p>
<h2>When to use it</h2>
<p>Reach for this lean coffee template when you want a retro that adapts to the team's real concerns rather than a fixed format, or when previous retros have drifted off topic. It also works well for distributed teams and for groups where a few voices tend to dominate, because voting levels the field.</p>
<h2>Who attends</h2>
<p>The team and a facilitator, roughly three to ten people. A simple board with three columns (To Discuss, Discussing, Discussed) plus a timer is all the equipment you need, physical or virtual.</p>
<h2>How to run it</h2>
<p>Explain the format, then have everyone write topic cards, one idea each. Dot-vote and order the cards by votes. Pull the top card into "Discussing" and talk about it for a short timebox, often five minutes. When the timer ends, do a quick thumb-vote: thumbs up to extend, thumbs down to move on. Work down the list this way, capturing any actions that emerge with owners and dates, and close with a brief check-out.</p>
<h2>Facilitator tips</h2>
<ul>
<li>Keep the first timebox short; you can always extend by vote.</li>
<li>Use the thumb-vote rigorously so no topic overstays its welcome.</li>
<li>Capture actions as they emerge instead of waiting until the end.</li>
<li>Move the board columns visibly so progress feels real.</li>
</ul>
<h2>Common mistakes</h2>
<ul>
<li>Letting one topic run long and starving the rest of the list.</li>
<li>Skipping the vote and reverting to a leader-driven agenda.</li>
<li>Discussing freely but never writing down decisions or actions.</li>
<li>Setting timeboxes and then ignoring the timer.</li>
</ul>
<p>Want the topics that win to lead to action? <a href="/l8">Run it in OrgTP</a> to capture decisions, assign owners, and carry them into your next meeting.</p>`,
    downloadMarkdown: `# Lean Coffee Retrospective Template

**Purpose:** Run a structured, agendaless retro where the team builds the topic list, votes on priorities, and timeboxes each discussion to spend time only on what matters.

- **Duration:** 60 minutes
- **Cadence:** Per sprint or as needed
- **Participants:** The team and a facilitator (3-10 people)

## Agenda
- [ ] Set the stage and explain the format (5 min)
- [ ] Brainstorm topics on cards (8 min)
- [ ] Vote and order topics (7 min)
- [ ] Discuss in timeboxes with thumb-votes (30 min)
- [ ] Capture actions and close (10 min)

## Prompts
- What topics or questions do you want to discuss today?
- Which topics matter most? (dot-vote)
- Should we keep discussing this topic or move on? (thumb-vote)
- What decision or action came out of this topic?

## Action items
- [ ] Action: __________________  Owner: __________  Due: __________
- [ ] Action: __________________  Owner: __________  Due: __________
- [ ] Action: __________________  Owner: __________  Due: __________

---
Free template from OrgTP. Adapt or run it live at orgtp.com/templates/lean-coffee-retrospective`,
  },
  {
    slug: 'lessons-learned-meeting',
    title: 'Project Lessons-Learned Meeting Template',
    shortName: 'Project Lessons-Learned Meeting',
    description:
      'Free project lessons-learned meeting template with agenda and prompts. Capture what worked, what did not, and reusable lessons at project close so the next project starts smarter.',
    category: 'retrospectives',
    methodology: 'General',
    minutes: 90,
    cadence: 'At project close or major milestones',
    participants: 'The project team and key stakeholders (5-15 people)',
    keywords: [
      'lessons learned template',
      'lessons learned meeting',
      'project closeout meeting',
      'project retrospective template',
      'project review meeting',
      'knowledge capture meeting',
      'project debrief template',
      'continuous improvement meeting',
    ],
    steps: [
      {
        name: 'Set the stage',
        minutes: 8,
        text: 'Recap the project goals, scope, and outcomes so everyone reviews the work against the same baseline.',
      },
      {
        name: 'What went well',
        minutes: 18,
        text: 'Capture the practices, decisions, and conditions that drove success and are worth repeating next time.',
      },
      {
        name: 'What did not go well',
        minutes: 18,
        text: 'Honestly review what fell short: missed estimates, gaps, and friction, focusing on causes not people.',
      },
      {
        name: 'Extract reusable lessons',
        minutes: 20,
        text: 'Turn the discussion into clear, transferable lessons phrased so a future team could apply them directly.',
      },
      {
        name: 'Decide actions and ownership',
        minutes: 16,
        text: 'Decide which lessons become standards, templates, or process changes, each with an owner and a date.',
      },
      {
        name: 'Close and archive',
        minutes: 10,
        text: 'Agree where the lessons live so future projects can find them, then thank the team and close.',
      },
    ],
    bodyHtml: `<p>A <strong>project lessons-learned meeting</strong> is the formal close-out where a team captures what worked, what did not, and the reusable lessons that make the next project start smarter. Unlike a sprint retro that tunes an in-flight team, a <em>lessons learned template</em> looks across the whole project arc and turns hard-won experience into organizational knowledge instead of letting it walk out the door when the team disbands.</p>
<h2>When to use it</h2>
<p>Hold this meeting at project close, or at major milestones for long programs. It is most valuable when a project taught real lessons, good or painful, and when other teams stand to benefit from what you learned. Schedule it before people scatter to new work and memories fade.</p>
<h2>Who attends</h2>
<p>The core project team plus key stakeholders and, where useful, the customer or sponsor, roughly five to fifteen people. Include people from across the project's phases so the full story is in the room, not just one slice of it.</p>
<h2>How to run it</h2>
<p>Start by recapping goals, scope, and outcomes so everyone shares a baseline. Review what went well and what did not, keeping the focus on causes and conditions rather than individuals. The crucial step is extraction: phrase each insight as a transferable lesson a future team could actually apply. Decide which lessons become standards, templates, or process changes, assign owners and dates, and agree where the lessons will live so the next project can find them.</p>
<h2>Facilitator tips</h2>
<ul>
<li>Recap the project baseline first so reflection is grounded in facts.</li>
<li>Phrase lessons so a stranger to the project could apply them.</li>
<li>Keep "what did not go well" about systems and decisions, not blame.</li>
<li>Decide where lessons are stored, or they will never be reused.</li>
</ul>
<h2>Common mistakes</h2>
<ul>
<li>Holding it too late, after the team and the details have dispersed.</li>
<li>Capturing vague lessons no future team can act on.</li>
<li>Filing the document where no one will ever look again.</li>
<li>Listing improvements without owners to carry them forward.</li>
</ul>
<p>Want your lessons to outlive the project? <a href="/l8">Run it in OrgTP</a> to capture every lesson, assign owners, and make them findable for the next team.</p>`,
    downloadMarkdown: `# Project Lessons-Learned Meeting Template

**Purpose:** Capture what worked, what did not, and reusable lessons at project close, turning hard-won experience into organizational knowledge for the next team.

- **Duration:** 90 minutes
- **Cadence:** At project close or major milestones
- **Participants:** The project team and key stakeholders (5-15 people)

## Agenda
- [ ] Set the stage and recap the project (8 min)
- [ ] What went well (18 min)
- [ ] What did not go well (18 min)
- [ ] Extract reusable lessons (20 min)
- [ ] Decide actions and ownership (16 min)
- [ ] Close and archive (10 min)

## Prompts
- What did we set out to do, and what actually happened?
- What practices and decisions worked and should be repeated?
- What fell short, and what conditions caused it?
- What is the transferable lesson a future team could apply?
- Which lessons become standards, templates, or process changes, and where will they live?

## Action items
- [ ] Lesson / action: __________________  Owner: __________  Due: __________
- [ ] Lesson / action: __________________  Owner: __________  Due: __________
- [ ] Lesson / action: __________________  Owner: __________  Due: __________

---
Free template from OrgTP. Adapt or run it live at orgtp.com/templates/lessons-learned-meeting`,
  },
];
