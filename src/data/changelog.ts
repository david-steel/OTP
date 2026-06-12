// Single source of truth for product updates.
// Both the What's New page and the weekly digest email read from this.

export interface ChangelogEntry {
  date: string;         // ISO date: '2026-03-30'
  tags: string[];       // ['Core', 'Security']
  title: string;        // 'Vulnerability Scanner, Foundation Score, and Share Your Score'
  summary: string;      // 1-2 sentence plain text summary for the email
  details?: string;     // Full HTML description (for the What's New page, optional for email)
}

export const changelog: ChangelogEntry[] = [

  // ---- June 12, 2026 ----

  {
    date: '2026-06-12',
    tags: ['Major', 'Templates'],
    title: 'A free library of 180+ meeting templates and agendas',
    summary: 'OrgTP now has a free meeting template library at /templates: ready-to-run agendas for every kind of meeting and every major operating system. EOS, Scaling Up, Pinnacle, the Accelerate Operating System, Metronomics, OKR, 4DX, Holacracy, Hoshin Kanri and Lean, V2MOM and OGSM, Balanced Scorecard, plus Agile and Scrum ceremonies, one-on-ones, retrospectives, focus groups, QBRs, board meetings, and more. Search by name or methodology, download any template as markdown, print it, or adapt it and run it live in OrgTP. No sign-in required.',
    details: `<p>Every meeting worth running has a shape. We wrote down more than 180 of them.</p>
<ul class="list-disc pl-6 space-y-1">
<li><strong>Every major operating system.</strong> EOS, Scaling Up, Pinnacle, Accelerate (AOS), Metronomics, OKR, 4DX, Holacracy, Hoshin Kanri and Lean, V2MOM and OGSM, and Balanced Scorecard, each with its full meeting cadence from daily huddle to annual planning, plus signature sessions like the 4DX WIG Session and the Holacracy Tactical and Governance meetings.</li>
<li><strong>And every everyday meeting.</strong> Agile and Scrum ceremonies, 1:1s and people meetings, team operations, retrospectives, customer and external, and innovation and facilitation.</li>
<li><strong>Real agendas, not stubs.</strong> Each template has a timeboxed agenda, who should attend, duration and cadence, facilitator tips, and common mistakes to avoid.</li>
<li><strong>Search and filter.</strong> Find a template by name, methodology, or what you are trying to do. Filter by operating system or meeting type.</li>
<li><strong>Free to take or run.</strong> Download any template as markdown, print it, or open it and run the meeting live in OrgTP. Every template is public, no sign-in needed.</li>
<li><strong>Browse the library at <a href="/templates">/templates</a>.</strong></li>
</ul>`,
  },

  {
    date: '2026-06-12',
    tags: ['Major', 'Privacy'],
    title: 'Private mode is live: keep your organization off the network entirely',
    summary: 'Organizations on the Private plan can now flip a single switch and disappear from every shared surface. A private organization never appears in browse, search, the intelligence graph, the experts and coaches directories, or org comparisons, and its data is never sourced into another organization\'s recommendations or cross-org learnings. Your members still see everything inside your own workspace. Turn it on under Settings, Configuration.',
    details: `<p>The whole operating system, behind a closed door, enforced everywhere.</p>
<ul class="list-disc pl-6 space-y-1">
<li><strong>One switch.</strong> Settings, Configuration has a Private mode toggle (admins only). Flip it on and your organization is excluded from every public and cross-organization surface at once.</li>
<li><strong>Nothing leaks, nothing is borrowed.</strong> Your org chart, OOS, scorecard, and claims stay out of browse, search, the graph, compare, and the directories, and they are never used to generate recommendations for anyone else.</li>
<li><strong>Your team is unaffected.</strong> Everyone inside your organization keeps full access to your own data through the dashboard. Private mode only closes the outside door.</li>
<li><strong>Reversible.</strong> Turn it off any time and your organization rejoins the network.</li>
</ul>`,
  },

  {
    date: '2026-06-12',
    tags: ['Help', 'Search'],
    title: 'Search the user guide and the article library',
    summary: 'The User Guide is now a searchable help center: every part of OrgTP explained, with a table of contents and an instant search box that highlights matches as you type. The article library at /blog is searchable too, and the search box in the Help panel jumps you straight into the guide with your results. There is also a dedicated Connect Your Agent page with the copy-paste prompt that builds your first OOS in about a minute.',
    details: `<ul class="list-disc pl-6 space-y-1">
<li><strong>Searchable guide.</strong> Open the User Guide (or the Help panel), type what you are looking for, and matching sections surface instantly with the terms highlighted. Shareable: /guide?q=scorecard deep-links a search.</li>
<li><strong>Searchable articles.</strong> The /blog library filters live by title, summary, and tag.</li>
<li><strong>Connect Your Agent.</strong> A focused onboarding page with a copy-paste AI prompt that generates your first OOS in about 60 seconds, plus the one-line Claude Code install. Linked from the guide.</li>
</ul>`,
  },

  // ---- June 11, 2026 ----

  {
    date: '2026-06-11',
    tags: ['Major', 'Dashboard'],
    title: 'Design your own dashboard: row layouts and fonts up to 3XL',
    summary: 'Customize mode now goes much further than rearranging tiles. The Daily dashboard is a set of rows, and every row gets its own shape: one column, thirds, halves, one-third plus two-thirds, or the reverse -- mixed freely, up to eight rows. Drag tiles between any row and cell, add or remove rows, and nothing is ever lost. Font sizes also grew: S, M, L, XL, 2XL, and 3XL, with layouts that adapt instead of squishing. Everything saves to your profile as you go.',
    details: `<p>Hit Customize on the Daily dashboard.</p>
<ul class="list-disc pl-6 space-y-1">
<li><strong>Per-row shapes.</strong> Each row picks its own pattern: full width, 1/3 + 2/3, 2/3 + 1/3, half + half, or thirds. Mix them however you work.</li>
<li><strong>Drag anywhere.</strong> Tiles move between cells and rows, not just within a column. Removing a row hands its tiles to the row above -- nothing disappears.</li>
<li><strong>Bigger type.</strong> Six sizes up to 3XL for wall screens and tired eyes, with tiles that wrap gracefully instead of clipping.</li>
<li><strong>Yours alone.</strong> Layout and font save per member automatically; teammates each keep their own.</li>
</ul>`,
  },

  {
    date: '2026-06-11',
    tags: ['Meetings', 'Fixes'],
    title: 'Fixed: KPI values saved during a meeting now show up immediately',
    summary: 'If you updated a KPI during a live meeting, the value saved correctly but the scorecard kept showing the snapshot taken when the meeting started -- so your edit seemed to vanish. Now, saving a KPI mid-meeting refreshes the scorecard on the spot. Values entered before this fix were never lost; they are in your scoreboard history.',
  },

  {
    date: '2026-06-11',
    tags: ['Major', 'Rocks'],
    title: 'Milestones on Quarterly Priorities: break a Rock into checkable steps',
    summary: 'Every Rock can now carry milestones: the concrete steps between here and done, each with its own due date and a checkbox. Check them off as you go and the Rock shows live progress (3 of 5). Each milestone can also have to-dos assigned to people, so the step has owners, not just a name. Add and manage milestones on the Daily dashboard; check them off live during your weekly meeting in the Rock Review.',
    details: `<p>Rocks tell you the destination. Milestones tell you whether you are on the road.</p>
<ul class="list-disc pl-6 space-y-1">
<li><strong>Add milestones on the Daily dashboard.</strong> Open a Rock card: title + due date, done. A progress chip (2/5) sits on the Rock and turns green at 100%.</li>
<li><strong>Due dates that mean it.</strong> A past-due, unchecked milestone shows its date in red.</li>
<li><strong>Assign to-dos to a milestone.</strong> Each milestone takes its own to-dos with owners, picked from the same people list as delegation. They show up in the owner's queue like any other to-do.</li>
<li><strong>Check off in the meeting.</strong> The Rock Review section of your weekly meeting lists each Rock's milestones with live checkboxes.</li>
</ul>`,
  },

  {
    date: '2026-06-11',
    tags: ['To-Dos', 'Collaboration'],
    title: 'Attach files to to-dos, and carry them to an Issue or a Rock',
    summary: 'To-dos can now carry files. Click the paperclip on any to-do to attach a document (up to 5 MB), download it later, or remove it. When the work travels, the file travels: an attachment on a to-do can be linked onto an Issue or a Quarterly Priority in two clicks, no re-uploading. Attachments also work directly on Issues and Rocks.',
    details: `<ul class="list-disc pl-6 space-y-1">
<li><strong>Paperclip on every to-do</strong> on the Daily dashboard and your to-do queue: attach, list, download, remove.</li>
<li><strong>Carry, don't re-upload.</strong> From a to-do's attachment, send the same file to an Issue or a Rock with the arrow buttons. One file, linked wherever the work lives.</li>
<li><strong>Issues and Rocks too.</strong> Attach files directly to either, from their cards on the Daily dashboard.</li>
<li><strong>Sensible limits.</strong> Up to 5 MB per file; removing the last link removes the file.</li>
</ul>`,
  },

  // ---- June 10, 2026 (evening wave) ----

  {
    date: '2026-06-10',
    tags: ['Offer', 'Privacy'],
    title: 'The Private plan: run OTP behind closed doors for $99/month',
    summary: 'Some organizations want the full meeting product without participating in the public network. The new Private plan keeps everything about your organization yours: your org chart, OOS, and scorecard are never published to browse, search, compare, or the intelligence graph, and your data is never used in cross-org learnings or recommendations. Share by invitation only. $99/month, founding-member pricing -- find it under Upgrade in the sidebar.',
    details: `<p>Everything in Free, plus a closed door.</p>
<ul class="list-disc pl-6 space-y-1">
<li><strong>Nothing published.</strong> Your humans, agents, seats, OOS, KPIs, and meeting data stay out of every public surface: browse, search, compare, and the intelligence graph.</li>
<li><strong>Nothing borrowed.</strong> Private org data is excluded from network intelligence -- no cross-org learnings, patterns, or recommendations draw on it.</li>
<li><strong>Invitation only.</strong> You decide exactly who sees inside your organization.</li>
<li><strong>Founding-member pricing.</strong> $99/month. <a href="/pricing">See the pricing page</a> or speak with our team to get set up.</li>
</ul>`,
  },

  {
    date: '2026-06-10',
    tags: ['Major', 'Navigation'],
    title: 'A real app shell: left sidebar navigation and a cleaner top bar',
    summary: 'OTP now has a proper sidebar. Every page you use -- Daily, Meetings, Team chart, KPIs, To-Dos, Issues, and the admin surfaces your role unlocks -- lives in a fixed left rail with your org name at the top and the current page highlighted. Collapse it to icons with one click and OTP remembers your choice. The top bar slimmed down to match: signed-in users see only the app controls, with the marketing links saved for visitors.',
    details: `<p>Navigation that stays put while you work.</p>
<ul class="list-disc pl-6 space-y-1">
<li><strong>Everything in one rail.</strong> Daily, Meetings, Team chart, KPIs, To-Dos, and Issues up top; Operating Plan, CEO view, Members, Teams, Docs, Workspaces, Inquiries, Publisher, and API keys appear based on your role; Tickets and the Guide anchor the bottom.</li>
<li><strong>Collapse it.</strong> The chevron at the bottom shrinks the rail to icons. Your preference is saved to your profile and follows you between sessions.</li>
<li><strong>A focused top bar.</strong> Signed in, you see Ask AI, What's New, Help, alerts, Publish, and your account -- nothing else competing for the space.</li>
</ul>`,
  },

  {
    date: '2026-06-10',
    tags: ['Major', 'AI'],
    title: 'Ask AI: instant answers about using OTP, right in the nav',
    summary: 'The purple Ask AI button opens a chat that answers questions about using OTP -- how to run a meeting, where a setting lives, what a Rock is -- with answers streaming in live, grounded in the user guide and the latest product updates. It knows what it does not know: out-of-scope questions get pointed to a support ticket instead of a guess. Rolling out now.',
    details: `<p>Learn the system by asking it.</p>
<ul class="list-disc pl-6 space-y-1">
<li><strong>Ask anything about OTP.</strong> "How do I create a Strategy Reset meeting?" "Where do I see my team's KPIs?" Answers arrive in seconds and point you to the right page.</li>
<li><strong>Grounded, not improvised.</strong> Answers come from the user guide, the route map, and recent product updates. When something is outside its knowledge, it says so and offers the ticket desk.</li>
<li><strong>Built to grow.</strong> This is step one -- answers about your own org's data are on the roadmap.</li>
</ul>`,
  },

  {
    date: '2026-06-10',
    tags: ['Major', 'Dashboard'],
    title: 'Make the Daily dashboard yours: rearrange, hide, and resize',
    summary: 'Hit Customize on the Daily dashboard and take control: drag tiles into the order that matches how you work, hide the ones you never use, and pick a font size that suits your screen. Everything saves to your profile automatically as you change it, so your layout is waiting for you at every sign-in -- and your teammates each get their own.',
    details: `<p>One dashboard, arranged per person.</p>
<ul class="list-disc pl-6 space-y-1">
<li><strong>Drag to reorder.</strong> In Customize mode, grab any tile in the left or right column and put it where you want it.</li>
<li><strong>Hide what you don't use.</strong> Every tile except the cascading message can be hidden -- and brought back any time from the same mode.</li>
<li><strong>Three font sizes.</strong> S, M, or L, applied to the whole dashboard.</li>
<li><strong>Saves itself.</strong> Changes persist to your member profile as you make them. No save button, no setup.</li>
</ul>`,
  },

  {
    date: '2026-06-10',
    tags: ['Meetings'],
    title: 'The Strategy Reset meeting: realign the company when something big changes',
    summary: 'A new meeting type for the moments that do not fit a weekly cadence: revenue stalls, a market shifts, AI disrupts your model. The Strategy Reset walks leadership through nine facilitated sections -- Define the Issue, Reality Check, Future Consequences, Strategic Options, Debate and Decide, Strategic Commitment, Define Success, Assign Ownership -- and ends with a deliverable your whole team can repeat with one voice. Notes save as you type, and ownership assignments become real to-dos.',
    details: `<p>Create one from the Meetings page: New Meeting, type "Strategy Reset."</p>
<ul class="list-disc pl-6 space-y-1">
<li><strong>Nine guided sections</strong> with timeboxes, from problem definition (15 min) through strategic options (45 min) and the debate (60 min) to written commitment and success criteria.</li>
<li><strong>The deliverable test.</strong> The meeting is not done until leadership can answer four questions with one voice: the problem, the decision, the 90-day priority, and the actions.</li>
<li><strong>Notes autosave</strong> into the meeting record; Assign Ownership creates tracked to-dos with owners and due dates.</li>
<li><strong>Bonus for every meeting type:</strong> the title field is now optional -- leave it blank and OTP names the meeting from its type and team, like "Leadership Meeting -- Leadership Team."</li>
</ul>`,
  },

  {
    date: '2026-06-10',
    tags: ['Navigation', 'Help'],
    title: "Help, updates, and articles without leaving the app",
    summary: "Three things that used to bounce you out of OTP now stay inside it. A megaphone in the nav lights up when there is something new and shows the latest updates in a click. A Help and Support panel puts the ticket desk, the user guide, and the update feed one click away. And the content pages themselves -- the guide, What's New, the blog, every article -- now render inside the app shell when you are signed in, so your navigation never disappears.",
    details: `<ul class="list-disc pl-6 space-y-1">
<li><strong>The megaphone.</strong> A red badge appears when updates have shipped since your last look. Open it for the latest entries; the full history lives on the What's New page.</li>
<li><strong>Help and Support.</strong> The (?) in the nav opens a panel with Raise a Ticket, the User Guide, What's New, the EOS + AI article library, and what's coming next.</li>
<li><strong>No more exits.</strong> Guide, What's New, blog, and Premium Support pages keep the sidebar and top bar when you are signed in. Visitors still get the full marketing pages at the same links.</li>
</ul>`,
  },

  {
    date: '2026-06-10',
    tags: ['Offer'],
    title: 'Premium Support: founding member pricing at $199/month',
    summary: 'For teams that want answers in minutes instead of days: Premium Support gets you a dedicated Slack channel with responses under 15 minutes, a founder-led kick-off call, quarterly business reviews run inside OTP, and end-to-end ticket resolution. Founding member pricing is $199/month or $1,990/year (save 17%), with limited seats while we keep response times fast.',
    details: `<p>Details and the full Standard-vs-Premium comparison at <a href="/premium-support">/premium-support</a>, or find it in the Help panel.</p>`,
  },

  // ---- June 10, 2026 ----

  {
    date: '2026-06-10',
    tags: ['Major', 'Notifications'],
    title: 'The alert bell: in-app notifications, plus close out a delegated to-do yourself',
    summary: 'OTP now tells you when work moves. A bell in the top nav shows a red count of unread alerts: a to-do assigned to you, a to-do you delegated getting finished, or one of yours being closed out or verified by someone else. Click it for the full list, and grant browser permission once to get native desktop notifications while a tab is open. Alongside it, both Waiting-on-others lists gained a Close it out button, so when someone never closes a to-do you handed them, you can disposition it yourself in one click -- it is marked done and verified, and they get notified.',
    details: `<p>Two halves of the same loop: see what moved, and unstick what didn't.</p>
<ul class="list-disc pl-6 space-y-1">
<li><strong>The bell.</strong> Between Dashboard and Publish in the nav, with a red unread count. Opening it shows your latest alerts and marks them read.</li>
<li><strong>What lands there.</strong> A to-do assigned to you, a to-do you delegated being finished by its owner, and your to-do being closed out or verified by someone else.</li>
<li><strong>Browser notifications.</strong> Grant permission once (the bell asks on first click) and new alerts also fire native desktop notifications while an OTP tab is open.</li>
<li><strong>Close it out.</strong> On the Daily dashboard and /me/todos, every item you are waiting on others for now has a one-click disposition: done + verified in a single step, with the owner notified.</li>
</ul>`,
  },

  {
    date: '2026-06-10',
    tags: ['Scoreboard'],
    title: 'Archive a KPI -- retire numbers you no longer track, without deleting anything',
    summary: 'Organizations change what they measure. You can now archive a KPI: it disappears from the scoreboard, the Daily dashboard, meeting snapshots, and every diagnostic -- but nothing is ever deleted. The full value history stays, a Show archived view on the scoreboard lists everything you have retired, and one click unarchives a KPI if it becomes relevant again.',
    details: `<p>For when a whole scorecard group stops being part of your organization.</p>
<ul class="list-disc pl-6 space-y-1">
<li><strong>Archive from the scoreboard.</strong> An admin-only action on every KPI row. Archived KPIs leave every default view: scoreboard, Daily, meeting scorecard snapshots, founder-dependency and accountability diagnostics, and publish-all.</li>
<li><strong>Never a delete.</strong> Every value ever recorded stays in the database. Archiving is a flag, not a removal.</li>
<li><strong>Show archived.</strong> A toggle next to the scoreboard view tabs reveals retired KPIs, badged and dimmed, with an unarchive action to bring one back.</li>
</ul>`,
  },

  {
    date: '2026-06-10',
    tags: ['Help', 'Onboarding'],
    title: 'A (?) on everything: contextual help across the whole app',
    summary: 'The little (?) explainer that started next to New Meeting now covers the entire platform -- about 46 topics across every surface. Every Daily dashboard panel, all seven sections of the live meeting runner, the to-do queue, the scoreboard, issues, the org chart, People Review, Members, Teams, the Operating Plan, the CEO view, the intelligence pages, and all the settings pages each have a (?) that opens a plain-language explanation of what the thing is, what it shows, and what you can do there. No jargon assumed -- every EOS-style term is defined the first time you meet it.',
    details: `<p>Built so a first-time user can learn the system from inside the system.</p>
<ul class="list-disc pl-6 space-y-1">
<li><strong>Everywhere you work.</strong> Daily dashboard panels, every agenda section of the meeting runner, to-dos, the scoreboard, issues, the org chart and People Review, Members and Teams, the Operating Plan and CEO view, Browse and the Intelligence Graph, and Settings.</li>
<li><strong>Plain language first.</strong> Each popup defines the term (Rock, KPI, IDS, OOS, seat) in one line, then what the panel shows, then what you can do there.</li>
<li><strong>Small touches.</strong> Escape closes the popup and focus returns to where you were.</li>
</ul>`,
  },

  // ---- June 9, 2026 ----

  {
    date: '2026-06-09',
    tags: ['Onboarding', 'Fixes'],
    title: 'Invite people and they appear on the chart right away -- onboarding can seat their goals and KPIs, plus a run of fixes',
    summary: 'Invitations now feel like real seats from the moment you send them. People you invite show up on the org chart as pending tiles before they accept, and the setup wizard now lets you assign Quarterly Priorities and KPIs to those invitees, not just to yourself, so a goal can already have its owner waiting on the chart. Alongside that: the scoreboard shows a member name instead of a raw ID for seats nobody has claimed yet, signing up no longer hits a permissions error on the final step, logging out lands you on the sign-in page, and the public Browse and Intelligence Graph pages no longer error for signed-out visitors.',
    details: `<p>A batch focused on making invitations feel real immediately, plus a cluster of fixes.</p>
<ul class="list-disc pl-6 space-y-1">
<li><strong>Invited people appear as pending tiles.</strong> The moment you invite someone, they take a seat on the org chart marked pending, so the chart reflects your real team before anyone clicks accept.</li>
<li><strong>Onboarding can seat their work, not just yours.</strong> During setup you can now assign Quarterly Priorities and KPIs to the people you invited, so a Rock or a number can already point at its owner while the invite is still outstanding.</li>
<li><strong>Scoreboard shows the name, not the ID.</strong> For a seat nobody has claimed yet, the scorecard now reads the member name instead of a raw identifier.</li>
<li><strong>Signup is solid through the last step.</strong> The onboarding flow now loads the sign-in provider correctly, so the writes on the final wizard step no longer fail with a permissions error.</li>
<li><strong>Cleaner sign-out and invite form.</strong> Logging out now reloads and lands you on the sign-in page, and the invite form uses neutral placeholder text.</li>
<li><strong>Public pages no longer error when signed out.</strong> The Browse (Claims) and Intelligence Graph pages had a server error for logged-out visitors; both now load.</li>
</ul>`,
  },

  // ---- June 6, 2026 ----

  {
    date: '2026-06-06',
    tags: ['Major', 'Settings'],
    title: 'Settings, rebuilt: one hub for your profile, billing, notifications, and API keys',
    summary: 'Settings is now a single, light, on-brand hub instead of a scattered set of older pages. A picture menu in the corner opens Profile (with Personal, Metrics, Contact, and Social tabs), Preferences (theme, date format, default team, timezone), Notifications, Account, Integrations, Configuration, and API Keys. The Billing page now shows your live agent count and what your AI team costs under the real per-agent model, where humans are free and each active agent is billable, with the upgrade flow in place.',
    details: `<p>Everything you configure now lives in one place, reskinned to the light in-app look.</p>
<ul class="list-disc pl-6 space-y-1">
<li><strong>One hub, one menu.</strong> A picture menu opens the whole set: Profile, Preferences, Notifications, Account, Integrations, Configuration, and API Keys.</li>
<li><strong>Profile got real structure.</strong> Personal, Metrics (work-style: MBTI, Kolbe, CliftonStrengths), Contact, and Social tabs.</li>
<li><strong>Billing reflects your actual AI team.</strong> A live agent count and a real per-agent cost model -- humans free, each active agent billable -- with the subscription and upgrade UI in place.</li>
<li><strong>API Keys folded in.</strong> The key list and MCP setup snippet now match the rest of the hub instead of the old dark header.</li>
</ul>`,
  },

  // ---- June 5, 2026 ----

  {
    date: '2026-06-05',
    tags: ['Dashboard', 'Meetings'],
    title: 'A full-width Daily dashboard, and the meetings list shows your full cadence',
    summary: 'The Daily dashboard was regridded into a full-width layout: the heavy panels (Headlines and Quarterly Priorities, now open by default) sit in a wide two-thirds main rail, with lighter tiles and your Agents / OTP Insights in a one-third sidebar, so the page reads top to bottom the way you work through your day. The meetings list now shows the full meeting cadence (Weekly Leadership, Departmental, Quarterly, Annual, One-on-One) behind a (?) explainer, and a to-do you switch to recurring no longer disappears from Daily -- you can also set recurrence right from the Daily quick-add.',
    details: `<p>Layout and meeting-list polish aimed at the screen you open every morning.</p>
<ul class="list-disc pl-6 space-y-1">
<li><strong>Full-width tile layout.</strong> Heavy tiles take a two-thirds main rail; light tiles and your Agents / OTP Insights sit in a one-third sidebar. Headlines and Quarterly Priorities now open by default.</li>
<li><strong>The full meeting cadence.</strong> The list now offers Weekly Leadership, Departmental, Quarterly, Annual, and One-on-One, with a (?) explainer for what each one is for.</li>
<li><strong>Recurring to-dos behave.</strong> A to-do you switch to recurring no longer vanishes from Daily, and you can set recurrence straight from the Daily quick-add.</li>
</ul>`,
  },

  {
    date: '2026-06-05',
    tags: ['Security', 'Quality'],
    title: 'Tenant isolation, script-context hardening, and a blocking test gate on every release',
    summary: 'A trust-and-safety pass on the platform. Support tickets are now strictly scoped to your own organization. Every value embedded into an inline script is escaped so content containing markup can never break out of its context, with a lint rule that keeps it that way. And the full test suite plus linting now run as a blocking gate on every change to the platform, so a regression has to clear automated checks before it can ship.',
    details: `<p>Less visible than a new screen, but the foundation a coordination platform has to get right.</p>
<ul class="list-disc pl-6 space-y-1">
<li><strong>Tickets stay inside your org.</strong> Reading and writing support tickets is strictly scoped to the caller organization.</li>
<li><strong>Script-context output is escaped.</strong> Any value rendered into an inline script is escaped, so content that happens to contain markup can never break out of the script. A lint rule now enforces it on every page.</li>
<li><strong>A real safety net on releases.</strong> The test suite and linting are now a blocking gate on every push, including an integration harness that specifically checks for cross-tenant access regressions.</li>
</ul>`,
  },

  // ---- June 4, 2026 ----

  {
    date: '2026-06-04',
    tags: ['Meetings', 'Fixes'],
    title: 'The weekly meeting now does exactly what you tell it: live Rocks, team-clean scorecards, and a real delete prompt',
    summary: 'A batch of fixes to the weekly meeting. Marking a Quarterly Priority On Track, Off Track, or Complete during a live meeting now shows instantly instead of looking like it did not save, and a small "Changed this meeting" note records what moved so a status change never reads as a silent overwrite. The scorecard only shows the KPIs that belong to that meeting\'s team (no more another team\'s metric appearing on your leadership meeting), and it now captures the final reviewed numbers when you end the meeting. Deleting a recurring meeting finally asks what you mean: only this one, this and everything after it, or the whole series. Meeting links shared in Slack also get a new on-brand preview card.',
    details: `<p>Five changes, all aimed at making the weekly leadership meeting behave the way you expect when you are running it live.</p>
<ul class="list-disc pl-6 space-y-1">
<li><strong>Rocks update live during the meeting.</strong> The Rock Review is where you set On Track / Off Track and mark Rocks complete, so those edits now render immediately. Previously the page showed a snapshot frozen at meeting start, so a change you just made looked like it had not saved (it had). Rocks are now always live; only the scorecard freezes.</li>
<li><strong>"Changed this meeting" note.</strong> When a Rock's status moves during the meeting, it shows what changed ("Off Track &rarr; On Track", "Completed this meeting") instead of just flipping with no record. A Rock you complete mid-meeting stays visible with the note rather than vanishing.</li>
<li><strong>Scorecards are team-clean.</strong> A meeting only shows the KPIs that belong to its team. A metric owned by another team can no longer surface on the wrong meeting's scorecard.</li>
<li><strong>Final numbers captured at end.</strong> Ending a meeting now re-captures the scorecard, so the completed record reflects the numbers as reviewed, not the ones from when the meeting started.</li>
<li><strong>Recurring delete asks first.</strong> Deleting a repeating meeting now offers "only this meeting", "this and all following", or "the entire series" — and the series-ending choices actually end it, instead of the calendar quietly regenerating the next occurrence.</li>
</ul>
<p>Shared meeting links also unfurl with a new branded preview card in Slack and other apps.</p>`,
  },

  // ---- June 1, 2026 ----

  {
    date: '2026-06-01',
    tags: ['Migration'],
    title: 'The importer now speaks Bloom Growth too',
    summary: 'The same drop-your-exports importer that moves teams off Ninety now also handles Bloom Growth at /import/bloom. Export your meeting data from Bloom (it ships a ZIP of CSVs: Quarterly Priorities, To-Dos, O&O Issues, KPI Metrics, Headlines), unzip, and drop the CSVs in. OTP rebuilds your accountability chart from who owns what and writes your Rocks, To-Dos, Issues, and Scorecard in, exactly like the Ninety flow. The engine is shared, so the same idempotent, write-free-preview behavior applies.',
    details: `<p>The import engine was built source-agnostic on purpose: it reconstructs your chart from the owner column that every clean EOS export carries, regardless of which tool produced it. Adding Bloom Growth was mostly teaching the parser Bloom's file names.</p>
<ul class="list-disc pl-6 space-y-1">
<li><strong>New page at <code>/import/bloom</code></strong> with Bloom-specific export steps (Bloom exports per meeting, as a ZIP you unzip). Same preview-then-commit flow, same mascot, same "rebuild the chart from who owns what" result.</li>
<li><strong>Bloom's quirky file names handled</strong> — its To-Dos file is literally named "To-Dos (KPI (Metrics))", which naive detection would mistake for a scorecard. The parser now matches explicit module names first and treats the scorecard as the fallback, so To-Dos, Quarterly Priorities (Goals), and O&O (Issues) all land in the right place.</li>
<li><strong>Secondary by design.</strong> Ninety stays the headline; Bloom is a quieter second door. The two import pages cross-link, and the engine, endpoints, and commit logic are shared.</li>
</ul>
<p>Note: like Ninety, Bloom's accountability chart is print-only on export, so OTP reconstructs it from owners rather than parsing a chart file. Bloom also has a REST API, which is a cleaner future path than CSVs; for now the drop-the-files flow keeps it consistent with Ninety.</p>`,
  },

  // ---- May 31, 2026 ----

  {
    date: '2026-05-31',
    tags: ['Major', 'Migration'],
    title: 'Switch from Ninety: drop your exports and OTP rebuilds your chart from who owns what',
    summary: 'There is now a one-page way to move from Ninety.io to OTP. Export your Rocks, To-Dos, Issues, Headlines, and Scorecard from Ninety, drop the files at /import/ninety, and OTP reconstructs your accountability chart from the owner of every Rock, KPI, and Issue, because Ninety has no structured chart export. The preview runs with no account and stores nothing; once you have a workspace, one click writes it all in: people seated on the chart, Rocks, To-Dos, Issues, and Scorecard KPIs with their weekly history. Re-running never duplicates. Alongside it, a new eight-part comparison series explains where OTP sits relative to Scaling Up, OKRs, 4DX, Holacracy, Agile/Scrum, Lean/Six Sigma, V2MOM, and the Great Game of Business.',
    details: `<p>The biggest thing keeping anyone on their current operating-system tool is the cost of switching. This release attacks that directly for Ninety.io, the most common place EOS-style teams keep their Rocks, scorecard, and issues today.</p>

<h3>The hard part, and the trick that beats it</h3>
<p>We looked at exactly what Ninety lets you export. The five list modules come out clean as spreadsheets: <strong>Rocks, To-Dos, Issues, Headlines</strong> as XLSX and the <strong>Scorecard</strong> as CSV. But the one thing OTP cares about most, the <strong>Accountability Chart</strong>, has no structured export at all. Ninety only prints it to PDF, and the detailed PDF drops the seat descriptions. There is also no public API.</p>
<p>So we do not need Ninety's chart. Every clean export carries an <strong>owner name</strong> on each row. OTP reads those owner columns across your Rocks, KPIs, To-Dos, Issues, and Headlines and rebuilds your roster from who-owns-what. That is the demo moment: you drop five files and watch your chart come back, seat by seat, reconstructed from accountability rather than from a picture.</p>

<h3>How it works</h3>
<ul class="list-disc pl-6 space-y-1">
<li><strong>Preview, no account, nothing stored.</strong> Drop your files at <code>/import/ninety</code>. They are parsed in memory and discarded. You immediately see counts per module and your reconstructed roster, each person with what they own.</li>
<li><strong>One-click commit.</strong> Once you are signed in, Import into my workspace writes it all in: people seated on your chart, then Rocks, To-Dos, Issues, and Scorecard KPIs (with each weekly value as real history).</li>
<li><strong>Idempotent.</strong> Re-running the import never creates duplicates. It dedupes by title and owner, so you can import again safely after fixing an export.</li>
<li><strong>Honest about the gaps.</strong> The flow tells you what Ninety itself loses on export (Issue comments are dropped; Scorecard history is bounded by the date range you set), and reminds you to export before you cancel Ninety, since Ninety disables export access the moment a subscription lapses.</li>
</ul>

<h3>Where OTP sits next to the frameworks you already run</h3>
<p>We also published an eight-part comparison series: OTP vs Scaling Up, OKRs, 4DX, Holacracy, Agile and Scrum, Lean and Six Sigma, V2MOM, and the Great Game of Business. The through-line is the same in every one: OTP is not a rival framework. The framework decides what the company should do; OTP is the operating layer underneath where the work gets executed by a team that is now part human and part AI, each seat with a scorecard and a KPI. Start at the <a href="/blog/otp-vs-frameworks-series-index">series index</a>.</p>`,
  },

  // ---- May 27, 2026 ----

  {
    date: '2026-05-27',
    tags: ['Major', 'Security', 'Multi-tenant'],
    title: 'Every page knows who is actually looking at it -- multi-tenant tightening across the dashboard',
    summary: 'OTP started as a single-tenant tool, and the first real second-user session (a live L10 with two people in the room) exposed every place the code still assumed there was only one user. The dashboard, members, teams, KPIs, People Review, and the org chart now scope strictly by role and chart position. Owner / admin / implementer see the full org. Manager and EOS Integrator / Visionary see their own seat plus their reports-to subtree. Managee and member see only their own seat. The "My Practice" tab is now hidden from anyone who is not an owner or operating partner. And every check is impersonation-aware -- "view as <user>" from the admin panel now shows you exactly what that user sees, not a leaked admin view glued onto their name.',
    details: `<p>Two days, fifteen commits, one root pattern. OTP was built first as a tool for a founder running their own org, and that meant the codebase had founder-only assumptions sprinkled across dozens of routes. The moment a second real human signed in -- a teammate joining a live L10 -- those assumptions started leaking the founder's data into the teammate's view. The remediation is a structural tightening: any check that gates data on "who is looking at this?" now reads from the request's resolved member, honors super-admin impersonation, and applies a single canonical role tier from the chart-permissions service.</p>

<h3>Multi-tenant scoping across the dashboard</h3>
<p>Every route that returns user-scoped data was checked against the rule "must scope by the requesting member's role and chart position." Findings shipped as a coordinated sweep:</p>
<ul class="list-disc pl-6 space-y-1">
<li><strong>/dashboard</strong>: rocks, KPIs, to-dos, delegated lists are scoped to the viewer's claimed chart tiles plus their email. The agent-pushed founder tile is only added to the candidate list when the requester actually IS the legacy founder.</li>
<li><strong>/dashboard/kpis</strong>: scoped to KPIs the viewer owns plus KPIs on teams the viewer is a member of. Owner / admin / implementer keep full-org visibility.</li>
<li><strong>/dashboard/members</strong>: scoped to the viewer plus everyone in their reports-to subtree. Inviters at integrator / visionary / manager rank get a scoped invite picker -- they can still onboard their cone but can no longer see the rest of the org's roster.</li>
<li><strong>/dashboard/teams</strong>: scoped to teams the viewer is a member of via <code>team_memberships</code>. Empty list when the viewer is not on any team.</li>
<li><strong>/dashboard/team</strong> (chart): nodes and edges filtered to the viewer's viewable tile set. Owner / admin / implementer see the entire chart; manager / integrator / visionary see their own seat plus their reports-to subtree; managee sees only their own seat. The same filter was applied to the underlying <code>/api/v1/team/graph</code> endpoint so a client-side d3 fetch cannot bypass the page-level scope.</li>
<li><strong>/team/review</strong> (People Review): identity now resolves through the impersonation-aware path so "view as &lt;user&gt;" rates that user's reports, not yours.</li>
<li><strong>/team/:externalId</strong> profile drill-in (page + JSON API): rocks, to-dos, and tickets for a given chart tile are now gated by <code>canViewTile</code>. Hitting the URL for a tile you cannot see returns a 404 (existence is private).</li>
<li><strong>"My Practice" nav</strong>: the tab now requires an org-wide role (owner / admin / implementer / visionary / integrator). Managers, managees, and members no longer see the practice tab even when the org has a claimed consultant profile.</li>
</ul>

<h3>Impersonation: view-as that actually views as</h3>
<p>Super-admin "view as &lt;user&gt;" was leaking the admin's data into the impersonated view because four separate code paths derived "who is the effective viewer?" from the Clerk session (always the admin) instead of from the impersonation cookie payload. All four are now routed through <code>request.impersonation.as || auth.userId</code> so every gate evaluates as the impersonated user. A super-admin-gated diagnostic endpoint at <code>/api/v1/_debug/dashboard-state</code> stays in place -- it returns the resolved identity, role, claimed tiles, and the actual results that would be returned for the current request, so the next tenant-isolation question gets answered in one request instead of guessed at.</p>

<h3>The principle going forward</h3>
<p>Two memory rules now sit alongside the code so the pattern does not need to be relearned. "Who is the viewer?" gates must read from <code>request.orgMember</code> and <code>request.impersonation.as</code>, never from <code>auth.userId</code> or <code>resolveOrgForUser(auth.userId)</code> (the first two honor impersonation; the second two do not). The canonical "see-all" tier is owner / admin / implementer, defined in <code>services/chart-permissions.ts</code>; EOS roles like Integrator and Visionary view through their reports-to subtree, same as Manager. Before any new class of user is invited to OTP -- first paid client, first partner-org, first coach managing multiple orgs -- a structured re-scan runs against the same five greps captured in <code>docs/security-audit-2026-05-27.md</code>. This is a posture, not a one-time cleanup.</p>`,
  },

  // ---- May 26, 2026 ----

  {
    date: '2026-05-26',
    tags: ['Meetings', 'Polish'],
    title: 'L10 day, hardened from inside the room -- segue saves, short titles, draft preservation, due dates, and Slack previews',
    summary: 'A live Leadership L10 with two people in the room surfaced five UX cuts that all shipped inside the meeting: invited members can now save their segue without an Authentication error, short issue titles ("Reps") no longer reject as invalid ticket data, every reload preserves whatever you are typing, L10 to-do due dates accept a custom override instead of a hardcoded seven days from today, and meeting URLs pasted into Slack or WhatsApp finally render as the meeting page rather than as a generic sign-in marketing card.',
    details: `<p>Most product bugs surface during demos. This one surfaced inside a real L10 with two people running it for the first time -- which means each fix had a 60-second turnaround window between the bug showing up and being deployed live to the meeting in progress.</p>

<h3>The five inside-the-meeting fixes</h3>
<ul class="list-disc pl-6 space-y-2">
<li><strong>Segue / headlines / ratings save no longer errors out.</strong> The API auth resolver was only honoring the legacy-founder Clerk path; the invited-member path was missing. Any invited teammate trying to save a field got "Authentication required" even though they could see the meeting page. The resolver now honors both paths, matching what the page-level guard already does. Any invited org member can now run their L10 normally.</li>
<li><strong>"Add Issue" no longer rejects short titles.</strong> The "Add Issue" UI hint promised "any non-empty title" but the server schema required five characters. A four-character title (<em>"Reps"</em> in the live meeting) returned "Add failed: invalid ticket data" with no explanation. Title and description validators were relaxed to one character minimum, matching the UI promise. Spam control already lives in the rate limiter; min-length validation does not need to do that job.</li>
<li><strong>Saves no longer wipe what the other person is typing.</strong> Any save on the L10 page (segue, headline, rating, issue, to-do) fired an SSE event that triggered a full-page reload for every other attendee. The reload preserved scroll position and the focused element's ID, but not the contents of any input the other attendee was typing into. Now every reload path snapshots non-empty <code>textarea</code> / <code>input</code> / <code>contenteditable</code> values to <code>sessionStorage</code> before reloading and restores them on load. Typing in segue while a teammate saves their headline is now safe.</li>
<li><strong>L10 to-do due dates accept a custom date.</strong> The to-do create form on the L10 page hardcoded the due date to seven days from today with no override field. A new date input next to the priority / recurrence selectors lets you pick any date; if you leave it blank, the seven-day default still applies. Picks anchor to end-of-day local so a "due today" to-do does not show overdue at 9 AM the same day.</li>
<li><strong>Meeting links in Slack / WhatsApp render as the meeting page, not as a sign-in marketing card.</strong> Before today, pasting a meeting URL into Slack rendered the sign-in page's "Free in Beta" mascot card because the unfurl bot followed the auth redirect and scraped the sign-in meta tags. Now the meeting URL returns a public preview at the same path: meeting title, scheduled date in ET, attendee names, and a "Sign in to view" CTA. No agenda contents, scorecard, rocks, ratings, segue, or headlines leak -- public-safe metadata only. Sharing a meeting link with a teammate finally looks like sharing a meeting link.</li>
</ul>

<h3>Personal queue stopped leaking the founder's tasks</h3>
<p>The same day, the <code>/me/todos</code> personal queue was found to hardcode the founder's external ID as a fallback owner -- a leftover from when the only user of OTP was the founder. Any invited org member who navigated to <code>/me/todos</code> got the founder's full personal to-do queue grafted onto their own. The fallback now only fires when the requester actually is the legacy founder; everyone else's queue scopes strictly to their own claimed tiles plus their email.</p>

<h3>Org chart visibility tightened</h3>
<p>The org chart at <code>/dashboard/team</code> previously rendered every node and edge to every authenticated org member. Visibility now matches the existing edit rules: owner / admin / implementer see the full chart, manager sees their own seat plus their reports-to subtree, managee sees their own seat only. The filter applies to both the page render and the underlying <code>/api/v1/team/graph</code> endpoint so a client-side d3 chart cannot bypass the scope by hitting the API directly.</p>`,
  },

  // ---- May 25, 2026 ----

  {
    date: '2026-05-25',
    tags: ['Major', 'Todos', 'Mobile'],
    title: 'Your queue replaces Todoist -- one mobile todo app for you and every AI agent on your team',
    summary: 'OTP /me/todos was rebuilt for one-handed phone use (sticky bottom add bar, swipe-to-complete, PWA-installable), and every AI agent on the army now pushes action items there instead of to Todoist. To-do create forms also got a description field with bold / italic / link formatting, so the context an agent gives you is finally readable. Todoist is deprecated; one less app on the home screen.',
    details: `<p>The to-do system is the most-touched surface in OTP, and until today there was a split: the platform had <a href="/me/todos" class="text-otp-600 hover:text-otp-500 underline">/me/todos</a>, but the AI agents pushed their action items to Todoist, so the queue was actually in two places. As of today, it's one place -- and that place is built for the phone.</p>

<h3>The mobile queue is the queue</h3>
<p>The <a href="/me/todos" class="text-otp-600 hover:text-otp-500 underline">/me/todos</a> page was rebuilt as a thumb-reachable mobile app: sticky bottom add bar that's always visible (one input + send, no priority/date upfront -- those live in the per-todo Edit drawer), <strong>swipe-left-to-complete</strong> on any card, iOS safe-area padding so the FAB clears the home indicator, and a PWA install nudge so you can drop the app on your home screen and treat it like any other phone app. Theme color matches the rest of the brand (orgy lime). Desktop layout is unchanged.</p>

<h3>Your AI agents create todos directly</h3>
<p>Every agent on the Sneeze It army -- Radar, Pepper, Dirk, Arin, AIO, and the rest -- has been migrated off Todoist and onto OTP's API. When an agent identifies an action item for you, it lands on your queue in seconds, tagged with the agent's name so you can see which one pushed it. The migration replaces 50+ touchpoints across the agent system; the canonical path now is a single shell wrapper (<code>~/.claude/otp-todo.sh</code>) every agent calls.</p>

<h3>Descriptions with formatting</h3>
<p>The to-do create form (on /me/todos, /dashboard, and inside L10 meetings) now has a description field with a small toolbar: <strong>**bold**</strong>, <em>*italic*</em>, and <code>[label](url)</code> link insertion. Cmd/Ctrl+B / +I / +K shortcut too. What you type is what gets stored -- no editor library, no contenteditable surprises -- and the renderer is gated so a malicious link can't inject javascript: URLs.</p>

<h3>Todoist is deprecated</h3>
<p>Todoist was the bridge while OTP built its own todo layer. That bridge is no longer needed. A migration script (<code>~/.claude/scripts/import-todoist-todos.sh</code>) mirrors any remaining open Todoist tasks into OTP on demand -- run once when you're ready to flip the switch. Agent surfaces still in the codebase reference Todoist only in DEPRECATED sections so the history stays readable.</p>`,
  },

  // ---- May 24, 2026 ----

  {
    date: '2026-05-24',
    tags: ['Polish', 'People', 'Brand', 'Onboarding'],
    title: 'Every dashboard gets the Orgy brand pass, People Review respects the org chart, the seat-save bugs are gone, and chart claims now self-heal',
    summary: 'All 17 dashboards now share a single Orgy palette and a coach-mascot hero on the CEO view. People Review only shows the seats that report up to you instead of the whole org, and the Seat Fit / People Review save endpoints no longer 500 (a uuid column was rejecting external IDs like HUM_DAVIDSTEEL). People Review is now linkable from the main dashboard and the CEO view so it is actually discoverable. And every signup path now reconciles chart claims by email, so new members land on the right tile automatically -- no more orphan stubs or wrong-claim drift.',
    details: `<p>Four threads shipped today, each as a separate deploy.</p>

<h3>Brand pass across every dashboard</h3>
<p>The full Orgy palette -- lime green <code>#A8E63A</code> for accents, deep blue <code>#2563EB</code> for action, a warm <code>#F5F7FA</code> page background, and the half-organic / half-circuit mascot -- now runs across all 17 dashboards. The CEO view at <a href="/dashboard/ceo" class="text-otp-600 hover:text-otp-500 underline">/dashboard/ceo</a> got a hero treatment: 96px coach mascot, a green "CEO View" pill, amber attention badge when something needs you, and a real display headline instead of a row of pill chips. Main <a href="/dashboard" class="text-otp-600 hover:text-otp-500 underline">/dashboard</a> was rebalanced into a Ninety-style 3-and-3 grid (Headlines / Rocks / KPIs on the left, To-Dos / Issues / Agents on the right) so the right column no longer towers over the left. The four coaching panels -- Waiting on others, Founder Dependency, Accountability Gaps, Hand-off candidates -- moved into a single collapsible "OTP Insights" tray below the grid. The My Agents card became a one-line summary that expands on click, opening state remembered across loads. Org-chart tile height bumped from 80 to 104px so employee tiles with two-line roles and contact pills stop clipping.</p>

<h3>People Review: only the seats that report to you</h3>
<p>The People Analyzer grid at <a href="/team/review" class="text-otp-600 hover:text-otp-500 underline">/team/review</a> was showing every human in the org, which made the page noisy and out-of-frame -- you rate your direct and indirect reports, not your peers or yourself. The grid now walks the <code>reports_to</code> subtree from whatever seats you have claimed on the chart and filters to that set, excluding your own tiles. Empty states added: "claim your seat" when you aren't on the chart yet, "no one reports to you yet" when you are. Same People Review was added as a visible banner on the daily dashboard and a "Review People (GWC + Values)" link in the CEO view's Team section, so it stops being a hidden feature.</p>

<h3>Seat Fit and People Review saves no longer 500</h3>
<p>The PUT endpoints for seat fit (<code>/api/v1/seats/:externalId/fit</code>) and seat responsibilities were 500-ing because the audit-log insert was sending the seat's varchar external ID (e.g. <code>HUM_DAVIDSTEEL</code>) into <code>audit_logs.entity_id</code>, which is typed as a Postgres uuid. The same bug surfaced through People Review's G/W/C columns as "Could not save rating." Fixed by passing the seat's external ID through <code>details.seatExternalId</code> on the audit row instead, where it belongs. Both save paths now work end-to-end.</p>

<h3>Chart claims self-heal on every signup path</h3>
<p>Two long-standing bugs in the chart-claim flow closed. First: when a teammate was pre-added to a team before signing up, the system created a synthetic stub member row (<code>clerk_user_id</code> starting with <code>chart:</code>) so the chart could attach to a team membership. When that person later signed up via Clerk, nothing merged the two rows -- the stub and the real account lived in parallel, and the chart had two of them. Second: owner signups went through <code>/onboarding/profile</code>, which created the org_members row with no claim and then called the chart-placement function -- which built the chart entity with the owner's email but never linked it back, so the owner showed up on the chart but their account stayed unclaimed (the exact reason People Review thought you weren't on the chart).</p>
<p>Both are fixed by a single reconciler that runs on every signup path. For any member with an email, it finds chart humans whose <code>contact_email</code> matches, merges any chart stubs pointing at those tiles in (moving team memberships, deleting the stub), and replaces the member's claim with the matched set. Wrong primary claims get overwritten. Real Clerk users with conflicting claims are deliberately left alone -- silent merging of two real accounts is too risky to do automatically. Backfill script <code>scripts/reconcile-chart-claims.ts</code> ran across all existing orgs and caught one silent bug-bite (a member who had been unclaimed for weeks).</p>`,
  },

  // ---- May 21, 2026 ----

  {
    date: '2026-05-21',
    tags: ['Polish', 'Auth'],
    title: 'Sign-up and sign-in get the v7 editorial treatment, post-signup flow operational end-to-end',
    summary: 'The sign-up and sign-in pages now match the home page editorial style -- one funnel, no exit ramps, brand-themed Clerk widget on orgy green, minimal nav. Sign-in carries a live What\'s New tile pulling from this changelog. The 7-step post-signup onboarding flow was hardened end-to-end: every wizard step now renders the proper layout, Google Ads conversion attribution is wired through CSP, and mobile sign-up is verified end-to-end with a real submit.',
    details: `<p>The front door has been quietly sharpened over the last three days. The conversion pages are the place new founders first decide whether OTP is real -- they should look like the rest of the product, not like a generic Clerk template glued onto an old layer.</p>

<h3>Sign-up: v7 editorial rebrand</h3>
<p>The /sign-up page now matches the home page visual language: light editorial backdrop, mono <code>[OTP]</code> lockup in a minimal nav (logo + Sign in, no exit ramps), big Schibsted Grotesk hero, and Clerk's SignUp widget themed to the orgy-green primary on dark ink text. A "What happens next" sidebar with hand-1 / hand-2 / hand-3 numbering tells new founders the three steps after submission. Loading skeleton inside the Clerk slot replaces the empty-box-while-the-widget-loads dead time.</p>

<h3>Sign-in: matches the new sign-up, plus a live What's New tile</h3>
<p>The /sign-in page got the same minimal nav, "Welcome back" hero with the operating-platform thesis as subhead, and a sidebar tile that auto-pulls the latest entry from this changelog. Returning users see what shipped recently the moment they sign in -- the platform feels like it is moving because it is.</p>

<h3>Post-signup flow: layout conflict fixed, all 7 onboarding steps operational</h3>
<p>The 7-step post-signup onboarding wizard (profile, team, goals, KPIs, agents, teams, first meeting) had a layout-rendering conflict that was returning an error on the first step for new accounts. Rebuilt on a manual ejs.renderFile pattern that bypasses the global-layout collision; the full wizard now flows end-to-end. Mobile sign-up was verified with a real submit -- Clerk's Cloudflare Turnstile fires correctly, the verification email lands, and the post-signup wizard renders.</p>

<h3>Google Ads attribution unblocked</h3>
<p>The Content Security Policy was blocking <code>googleads.g.doubleclick.net</code> and <code>www.google.com/ccm/collect</code>, so even successful sign-ups never reached Google Ads as a conversion. Added those origins to the script-src and connect-src directives. The server-side conversion upload that fires on /onboarding/profile (gclid-based, idempotent via the conversion_log table) is now end-to-end operational.</p>`,
  },

  // ---- May 18, 2026 ----

  {
    date: '2026-05-18',
    tags: ['Major', 'Tools'],
    title: 'The People layer ships -- rate seat fit, run a People Review, close accountability gaps inline, and share one KPI across a team',
    summary: 'OTP\'s org chart is now a people operating system. The Accountability Gaps panel fixes gaps inline instead of just listing them; every seat gets a Seat Fit rating on Understands / Wants / Capacity; a new People Review grid scores everyone against your organization\'s values with a verdict per person; the dashboard flags who is buried in recurring work and how much of the open load still sits on the founder; and a single KPI can be assigned to several people at once, goals and actuals summed on the scorecard.',
    details: `<p>The org chart has been a picture of who reports to whom. As of today it runs the people side of the operating system: who fits their seat, who is overloaded, where accountability is leaking, and how dependent the company still is on the founder. Four updates shipped today, each as its own deploy.</p>

<h3>Accountability Gaps -- now actionable</h3>
<p>The Accountability Gaps panel on <a href="/dashboard" class="text-otp-600 hover:text-otp-500 underline">/dashboard</a> used to just list problems. Now it fixes them inline:</p>
<ul>
<li>A seat with no measurable gets <strong>+ Add KPI</strong> / <strong>+ Add Rock</strong> forms right in the panel, pre-targeted to that seat.</li>
<li>Work owned by someone not on the chart gets a <strong>Reassign</strong> picker that moves it to a real seat.</li>
<li>An agent with no human above it gets a <strong>Set manager</strong> picker.</li>
<li>A filter bar -- All, All Human, All Agents, Direct Reports, No Seat -- narrows the panel to what you own.</li>
</ul>

<h3>Seat Fit</h3>
<p>Every seat profile now carries a <strong>Seat Fit</strong> rating: does the person <strong>Understand</strong> the role, do they <strong>Want</strong> it, do they have the <strong>Capacity</strong> for it. Click to cycle each axis; it saves on the spot. A clean, honest read on whether the right person is in the seat.</p>

<h3>People Review</h3>
<p>A new grid at <a href="/team/review" class="text-otp-600 hover:text-otp-500 underline">/team/review</a>: every person down the side, the three Seat Fit axes plus each of your organization's values across the top. Click any cell to rate it. Each row gets a computed verdict -- solid, needs conversation, or wrong seat. Your value list is managed right on the page.</p>

<h3>Delegate-and-Elevate + Founder Dependency</h3>
<ul>
<li><strong>Hand-off candidates</strong> -- the dashboard flags anyone carrying a heavy recurring-to-do load, with a prompt to push the work down to a lower seat or an agent.</li>
<li><strong>Founder Dependency</strong> -- a tile showing the share of all open work (priorities, KPIs, issues, to-dos) that still sits on the top seat. The number that tells you whether the team is actually absorbing the load.</li>
</ul>

<h3>Shared KPIs</h3>
<p>A KPI can now be assigned to several people at once. Each person has their own goal; the scorecard sums the goals into one total and sums what each person reports into one actual. On <a href="/dashboard/kpis" class="text-otp-600 hover:text-otp-500 underline">/dashboard/kpis</a>, hit <strong>+ person</strong> on any KPI, pick who and their goal -- a "Shared KPIs" section then shows the rolled-up total with the per-person breakdown.</p>`,
  },

  // ---- May 14, 2026 ----

  {
    date: '2026-05-14',
    tags: ['Major', 'Coaches'],
    title: 'The Coach Ecosystem ships -- Founder Certified badge, the Practice dashboard, and the full activation loop',
    summary: 'The Founder 25 coach-and-client ecosystem went live today: every claimed coach gets a Founder Certified Coach badge, a personal /dashboard/practice with side-by-side client visibility, a shareable invite link, and perpetual GHL-style commission attribution on every client they bring. Joel Swanson became the first cold-email-driven claim within four hours.',
    details: `<p>Today shipped fifteen contained pieces that together turn the Founder 25 cohort from a marketing line into a working product. The thing the platform has been missing -- a real reason for a coach to come back tomorrow -- is now there.</p>

<h3>For coaches: the Practice dashboard</h3>
<ul>
<li><strong><a href="/dashboard/practice" class="text-otp-600 hover:text-otp-500 underline">/dashboard/practice</a></strong> -- your coach view across every client org you bring in. Three states: intro (not a coach yet), empty (share-link command center with email + LinkedIn share CTAs), populated (stats + side-by-side client list).</li>
<li><strong>/dashboard/practice/client/:id</strong> -- read-only view of one linked client's workspace. Shows team members, KPIs, AI agents, OOS file count, plus a "<strong>Send activation nudge</strong>" button that fires a templated email to dormant clients with a concrete first-step CTA.</li>
<li><strong>"My Practice ★" nav tab</strong> -- appears automatically in the dashboard nav for any claimed coach (coach-status detected server-side via a request-level preHandler).</li>
<li><strong>Send invite by email</strong> form on the Practice dashboard -- type a client's address plus optional first name, fire the invite directly from the platform. Reply-To routes to the coach so any reply lands in their inbox.</li>
</ul>

<h3>For coaches: the Founder Certified Coach badge</h3>
<ul>
<li>Downloadable PNG at three sizes -- full quality (1.3MB) for print/email-signature, web preview (213KB) for site embedding, and compact (66KB) for inline markers.</li>
<li>Displayed automatically on the coach's public <code>/expert/:slug</code> profile (top-right of the hero on desktop, centered above the headline on mobile).</li>
<li>Highlighted in the <code>/claim/:slug/done</code> page with two download buttons (full + web).</li>
<li>Featured on the new <code>/coaches</code> directory and on the <code>/coach</code> Founding 25 perk card.</li>
</ul>

<h3>The /coaches public directory</h3>
<p>A new page at <a href="/coaches" class="text-otp-600 hover:text-otp-500 underline">orgtp.com/coaches</a> shows every claimed Founder Certified Coach as a card -- name, location, headline, bio, expertise tags, badge. The dark hero shows "<strong>X of 25 seats filled</strong>" so prospective coaches see real cohort progress, not vapor.</p>

<h3>For clients: /welcome quickstart + revocation control</h3>
<ul>
<li><strong>/welcome</strong> -- when a client accepts a coach's invite they now land on a 3-card activation guide ("Add yourself &middot; Add one teammate &middot; Add one AI tool"). Cards flip to a green ✓ as the work gets done. Personalized with the coach's name when attribution is found.</li>
<li><strong>/settings/coaches</strong> -- clients can revoke any coach's access from one page. Founder attribution stays attached for commission accounting; only data visibility is revoked. Two-table design (access revocable, attribution immutable) so commission survives even if the client fires the coach -- same hook GHL agencies use to overcome the "what if they leave?" fear.</li>
</ul>

<h3>The full loop end-to-end</h3>
<ol>
<li>Cold email lands &rarr; coach hits <code>/claim/:slug</code> &rarr; claims their Founder profile.</li>
<li>Auto-publish + auto-fill Clerk email &rarr; public profile is live immediately, no checkbox to remember.</li>
<li>Welcome email fires with the Founder badge, the share link, and a 15-min Calendly CTA. Reply-To routes to David's real inbox.</li>
<li>Coach lands on <code>/dashboard/practice</code> &rarr; copies their <code>/join/{token}</code> link or fires the invite-by-email form.</li>
<li>Client clicks the join link &rarr; coach-branded landing &rarr; accepts.</li>
<li>Two records get written: <strong>access</strong> (revocable by client) and <strong>attribution</strong> (perpetual).</li>
<li>Client gets a welcome email + lands on <code>/welcome</code> &rarr; builds their first 3 seats &rarr; coach sees stats populate in their Practice dashboard.</li>
</ol>

<h3>First real signal</h3>
<p>Joel Swanson, an EOS Implementer in Colorado, became the first cold-email-driven claim today -- about four hours after his email landed. He wrote back asking the basic "who are you, what is this, why should I care" questions, which became the spec for the new <code>/coach</code> 101 panel and the welcome email template every coach receives from this point on.</p>

<h3>Under the hood</h3>
<ul>
<li>Two new tables -- <code>coach_client_attribution</code> (immutable except by admin transfer) and <code>coach_client_access</code> (revocable by the client). Different mutability rules, intentionally separate.</li>
<li>Self-healing schema migration on boot via <code>ensure-coach-clients.ts</code>.</li>
<li>Resend open + click tracking enabled for the founding-25 campaign. Every cold email since this morning gets per-recipient engagement data, filterable by <code>campaign=founding_25_coach</code>.</li>
<li>Three new branded OG images (1200&times;630) so <code>/join/{token}</code>, <code>/coaches</code>, and <code>/welcome</code> all show real preview cards when shared on LinkedIn / iMessage / Slack.</li>
<li>Takedown handler now <strong>auto-unpublishes</strong> the profile immediately when a coach hits the "remove me" link (the email promise was "one-click removed" but the old code only filed a ticket and waited for a human).</li>
</ul>

<p>Founder badge for any claimed coach: <a href="/public/images/founder-coach-badge.png" class="text-otp-600 hover:text-otp-500 underline">download the PNG</a>. The Founding 25 still has open seats -- see <a href="/coach" class="text-otp-600 hover:text-otp-500 underline">/coach</a> for the playbook.</p>`,
  },

  // ---- May 10, 2026 ----

  {
    date: '2026-05-10',
    tags: ['Major'],
    title: 'Orger.ai launches: the first product built on OTP',
    summary: 'Orger.ai is live with a new design and a new identity as the first product built on OTP as a framework, not just consuming it via API. Same Clerk auth, same Postgres, same MCP server, same team graph. The marketing site is its own Next.js app; the chart you build inside it is rendered straight off the OTP team graph through service auth.',
    details: `<p><a href="https://orger.ai" class="text-otp-600 hover:text-otp-500 underline">Orger.ai</a> shipped today with a new homepage, a mascot named Orgy, and a free builder that lets you drag and drop the humans you have and get grounded recommendations for the AI agents you should hire next.</p>

<p>The bigger news for the network: Orger is the first product <strong>built on</strong> OTP, not just one that consumes the API.</p>

<h3>What that means concretely</h3>
<ul>
<li>Same Clerk auth as orgtp.com.</li>
<li>Same Postgres database backing every chart on the network.</li>
<li>Same MCP server surface, queryable from any MCP-aware AI client.</li>
<li>Same team graph schema. Seats you create on Orger are OTP seats.</li>
<li>Same scorecard surface and the same correction loop every other agent on the network learns from.</li>
</ul>

<h3>Why this matters for the framework story</h3>
<p>OTP has been called a protocol, a coordination layer, a network, and a transactive memory system. All accurate, none of them prove the framework claim on their own. A framework only earns the word once a product is built on it that could not have been built any other way at the same cost. Orger is that product.</p>

<p>Read the full launch story: <a href="/blog/orger-is-the-first-site-built-on-otp" class="text-otp-600 hover:text-otp-500 underline">Orger is the first site built on OTP</a>.</p>

<p>If you are building something that needs humans, agents, seats, scorecards, and corrections to live on the same protocol, the framework is open. The MCP is <code>npx -y @orgtp/mcp-server</code>. Reach the team if you want to be the second.</p>`,
  },

  // ---- May 7, 2026 (evening polish) ----

  {
    date: '2026-05-07',
    tags: ['Improvement', 'Tools'],
    title: 'Dashboard polish: editable to-dos, IDS filter, clickable MCP, compact My Agents',
    summary: 'Six small upgrades to the Daily Dashboard that add up to a much faster morning surface: edit and delete on every to-do (both inline on the dashboard and on the standalone /me/todos PWA view), an Issues (IDS) status filter that defaults to Open, the green MCP-live pill is now clickable to /settings/api, and the My Agents panel collapsed to a single-row glance pulling from the real team chart instead of an unused upload table.',
    details: `<p>The Dashboard shipped earlier today as a full daily manager surface. Tonight is the first polish pass -- the rough edges from a couple hours of real use.</p>

<h3>To-Dos: full CRUD inline</h3>
<ul>
<li>Every to-do row now has <strong>Edit</strong>, <strong>Done</strong>, and <strong>Delete</strong> alongside the checkbox.</li>
<li>Edit toggles an inline form for title and description -- save reloads, cancel reverts.</li>
<li>Delete uses a 2-tap confirm (tap once, button turns red "Confirm?", tap again within 3 seconds to soft-delete). No accidental losses.</li>
<li>Descriptions now display in the row when present, no separate page needed.</li>
<li>The same UX is live on the mobile <code>/me/todos</code> PWA so the queue feels the same on phone or laptop.</li>
</ul>

<h3>Issues (IDS): status filter, default Open</h3>
<ul>
<li>New pill bar above the issues list: <strong>Open</strong> / <strong>Identified</strong> / <strong>Discussed</strong> / <strong>All open</strong>, each with live counts.</li>
<li><strong>Open</strong> is the default selection so the dashboard opens to the issues that still need to be identified first.</li>
<li>Pure client-side filter -- switching is instant.</li>
</ul>

<h3>MCP-live pill is now clickable</h3>
<ul>
<li>The amber "not connected" banner already linked to <code>/settings/api</code>. The green "live" pill was static.</li>
<li>Now both states are clickable surfaces to the same MCP management page. One tap to verify, rotate, or copy the key.</li>
</ul>

<h3>My Agents: compact rows + sourced from the team chart</h3>
<ul>
<li>Each agent renders as a single line: status dot, name, slim score bar, score, KPI count. ~14 agents drops from ~2000px to ~350px while keeping the at-a-glance "who's red" read.</li>
<li>Header summary shows total seats, average score, and counts of red/yellow agents.</li>
<li>Click any row to jump straight to <code>/dashboard/team</code>.</li>
<li><strong>Bigger fix:</strong> the panel now sources from the same team graph that powers <code>/dashboard/team</code> instead of a separate upload table. Score reads from the entity's <code>maturity_level</code> (the Bassim-style maturity score), and the KPI count joins live from your KPI registry. Agents you add to the chart now appear here automatically -- no separate upload step.</li>
</ul>
`,
  },

  // ---- May 7, 2026 ----

  {
    date: '2026-05-07',
    tags: ['Major', 'Tools'],
    title: 'A daily home for managers -- the Dashboard now runs your day',
    summary: 'The /dashboard page is now an EOS-style daily manager surface: meeting selector, headlines (Integrator marks read), my Quarterly Priorities with on/off-track toggle, KPIs with inline weekly entry, my To-Dos, IDS issues, plus a "My Agents" panel where you upload your CLAUDE.md or Agent.md and get a 0-8 score. New "Dashboard" dropdown in the global nav and a sticky tab strip on every dashboard page so you always know where you are and where else to go.',
    details: `<p>OTP's dashboard used to be a publisher splash for owners and a near-empty page for everyone else. It is now a daily manager workspace, designed to be opened every morning.</p>

<h3>What you get on /dashboard</h3>
<ul>
<li><strong>Meeting selector</strong> -- pick the meeting you are running (defaults to the next upcoming).</li>
<li><strong>Headlines</strong> -- any attendee can post a headline. The Integrator gets a checkbox to mark each one read; everyone else sees the read state. No more headlines getting lost in a shared text blob.</li>
<li><strong>My Quarterly Priorities (Rocks)</strong> -- this quarter only, filtered to what you own. One click toggles on-track / off-track.</li>
<li><strong>My KPIs</strong> -- the KPIs you own. Type a value, hit tab, it saves to this week's period. The same numbers feed your scorecard.</li>
<li><strong>My To-Dos</strong> -- add inline with a due date, check off when done. Overdue items go red.</li>
<li><strong>Issues (IDS)</strong> -- add an issue right from the dashboard. The Integrator can mark it solved and auto-link it to the current meeting.</li>
<li><strong>My Agents</strong> -- upload a CLAUDE.md or Agent.md file (paste it or pick the file). Each agent gets a 0-8 score: <strong>+2</strong> if your org's MCP key is live, <strong>+2</strong> if KPIs are declared, up to <strong>+3</strong> for recent agent runs, <strong>+1</strong> for a description. The score is meant to push you toward connecting MCP -- that is where OTP actually starts working for you.</li>
<li><strong>MCP banner</strong> at the top -- green when an API key on your org has been used in the last 7 days, amber CTA when not. The single most important conversion moment from passive viewer to active user.</li>
<li><strong>Multi-org dropdown</strong> -- if you are a member of more than one org, switch between them right at the top of the page.</li>
</ul>

<h3>Two new EOS roles: Visionary and Integrator</h3>
<ul>
<li>Added <strong>Visionary</strong> and <strong>Integrator</strong> as first-class roles alongside Owner / Admin / Manager / Managee. Visible in the Members invite dropdown.</li>
<li>The <strong>Integrator</strong> role unlocks running-the-meeting actions: marking headlines read, overriding a Rock's status, marking issues solved. Owners, Admins, and EOS Implementers also have these powers, so nothing changes for orgs that have not adopted the role yet.</li>
</ul>

<h3>Wayfinding: Dashboard dropdown + tab strip</h3>
<ul>
<li>The global nav now has a <strong>Dashboard ▾</strong> menu (signed-in users) with shortcuts to Daily / Meetings / Team chart / KPIs / Operating plan / Members / Publisher / MCP. One click to anywhere from any page.</li>
<li>A sticky <strong>tab strip</strong> renders on every <code>/dashboard/*</code> and <code>/l8/*</code> page so you always see where you are and what other surfaces are available -- role-filtered (managee does not see Publisher).</li>
<li>The legacy publisher dashboard (OOS files, claims, network learnings) moved to <a href="/dashboard/publisher"><code>/dashboard/publisher</code></a> and is one click away from the Daily view.</li>
</ul>

<h3>Why this matters</h3>
<ul>
<li>OTP works because you use it every day. A login that lands on a publisher splash does not earn a daily habit. A login that lands on your Quarterly Priorities, your KPIs, your headlines, and your agents does.</li>
<li>The "My Agents" score is a forcing function. Upload your CLAUDE.md, see the score, see exactly which lever (connect MCP, declare a KPI, run the agent, write a real description) moves it. Every visit is a nudge toward making the system live, not decorative.</li>
<li>The same data that drives your dashboard is the same data your weekly L8 meeting reads. No double-entry, no separate system.</li>
</ul>

<h3>How to start</h3>
<ol>
<li>Sign in and visit <a href="/dashboard"><code>/dashboard</code></a>.</li>
<li>Pick a meeting from the dropdown. Add a headline. Type a KPI value. Add a To-Do.</li>
<li>If the MCP banner is amber, click <strong>Set up MCP</strong> and create an API key.</li>
<li>Upload your CLAUDE.md under "My Agents" and watch the score change as you connect things up.</li>
</ol>`,
  },

  // ---- May 5, 2026 ----

  {
    date: '2026-05-05',
    tags: ['Naming'],
    title: 'L10 is now L8 -- weekly leadership meeting renamed to point at agentic maturity',
    summary: 'OTP\'s weekly leadership meeting is now called the L8 Meeting. Same agenda, same cadence -- different finish line. "L8" aims at Level 8 (Autonomous Agent Teams) on the 8 Levels of Agentic Engineering. Old /l10 URLs 301-redirect to /l8 so existing links and bookmarks keep working.',
    details: `<p>The weekly leadership meeting is now the <strong>L8 Meeting</strong>. The name comes from Level 8 of the 8 Levels of Agentic Engineering -- Autonomous Agent Teams. Same agenda shape as the EOS L10 (Checkin, Scorecard, Quarterly Priorities, Headlines, To-Dos, Issues, Conclude); different reason to run it: every week the meeting forces the question "are we more agentic this week than last week?"</p>
<p>Old <code>/l10</code> URLs continue to work via 301 redirect, so any link, bookmark, or doc that points at <code>/l10</code> will land on <code>/l8</code> automatically. The glossary keeps the L10 entry alongside the new L8 entry so the EOS lineage stays discoverable.</p>`,
  },

  // ---- May 3, 2026 ----

  {
    date: '2026-05-03',
    tags: ['Major', 'Tools'],
    title: 'Run your weekly leadership meeting from OTP -- the Meeting layer is live',
    summary: 'A full weekly leadership meeting tool with Checkin, Scorecard, Quarterly Priorities, Headlines, To-Dos, Issues, and Conclude. Per-section timer, attendee panel, identify-discuss-solve workflow, auto-cascading recap, and a per-person accountability profile that links back from the org chart. Built and shipped in one Sunday.',
    details: `<p>OTP now runs your weekly leadership meeting. Visit <a href="/l8"><code>/l8</code></a> to see your meeting list, or click the new <strong>Run L8 Meeting</strong> button on your team chart at <a href="/dashboard/team"><code>/dashboard/team</code></a>.</p>

<h3>What you get</h3>
<ul>
<li><strong>Single-page meeting runner</strong> with all 7 sections on one screen: Checkin, Scorecard, Quarterly Priorities, Headlines, To-Dos, Issues, Conclude.</li>
<li><strong>Per-section timer</strong> on a single-line agenda nav. Click any section to jump and start its budget timer. Goes amber under 60s, red and pulsing when over.</li>
<li><strong>Attendees &amp; Access panel</strong> at the top of every meeting. Edit who is invited inline.</li>
<li><strong>Scorecard grouped by team</strong>: Leadership Scorecard (humans), Agent Scorecard (one row per AI agent), and any custom group you push KPIs into. Goal column shows symbols, on-track checkmarks colored green/red.</li>
<li><strong>Quarterly Priorities</strong> with on-track/off-track toggle, owner, status note. Add new ones inline with the new <strong>+ Add quarterly priority</strong> button.</li>
<li><strong>Issues with full identify-discuss-solve workflow</strong>. Solve opens a form that captures the resolution and (optionally) auto-creates a 7-day follow-up to-do for an attendee. Edit, delete, convert-to-todo, and assign ownership all live on each issue. Inline <strong>+ Add issue</strong> button at the bottom of the section.</li>
<li><strong>Cascading message that builds itself</strong>. Every solve appends a one-liner. The <strong>Rebuild draft</strong> button regenerates the full recap from headlines + solved issues + new to-dos so the team always knows what got decided.</li>
</ul>

<h3>The org chart now shows accountability</h3>
<ul>
<li>Click any person or agent on <a href="/dashboard/team"><code>/dashboard/team</code></a> and the edit drawer opens with a <strong>Meetings &amp; Accountability</strong> block: tiles for quarterly priorities owned, open to-dos, open issues, and meetings attended. Below that, upcoming and recent meetings with status badges and contribution chips.</li>
<li>Click <strong>View full profile</strong> for the dedicated person page at <code>/team/:externalId</code>: hero summary, currently-owned items, and a vertical timeline of every meeting they have attended with per-meeting contribution counts (to-dos owned, issues solved).</li>
<li>This turns the org chart from a static who-reports-to-whom diagram into a real accountability dashboard. Click anyone, see what they own, see what they delivered.</li>
</ul>

<h3>Why this matters</h3>
<ul>
<li>Most leadership-meeting software is heavy, complicated, and built around someone else's framework. This is built around the work the team is already doing -- Sneeze It is running its own Tuesday leadership meeting from this exact page.</li>
<li>The meeting layer reuses the same KPIs you push via <code>tally</code>, the same agents on your org chart, the same issues your team raises. No double-entry. No separate system.</li>
<li>Every AI agent you have can be invited as an attendee, can own a quarterly priority, can own a to-do. Run a real weekly meeting with a mixed human + agent team.</li>
</ul>

<h3>How to start</h3>
<ol>
<li>Go to <a href="/dashboard/team"><code>/dashboard/team</code></a>, click <strong>Run Weekly Meeting</strong> top right.</li>
<li>Create a meeting (defaults to a leadership meeting tomorrow 9am).</li>
<li>Add your team as attendees -- humans and agents both.</li>
<li>Click <strong>Start Meeting</strong>. The scorecard and quarterly priorities snapshot at start, so the agenda is frozen at meeting time.</li>
<li>Walk through the 7 sections. Solve issues. Cascade decisions. Done.</li>
</ol>

<p>This is the kind of thing OTP was always meant to be: where your AI team and your human team coordinate from the same surface.</p>`,
  },

  // ---- May 2, 2026 ----

  {
    date: '2026-05-02',
    tags: ['Major', 'Tools'],
    title: 'The Coordination Checkup is live -- score your team against the 8 Levels of Agentic Maturity',
    summary: 'A 24-question, ten-minute self-assessment that gives you a number out of 8.0, the level you are operating at, and a personalized roadmap. Built on Bassim Eledath\'s 8 Levels of Agentic Engineering and the same hierarchy rule our internal evaluator uses every night.',
    details: `<p>The fifth tool in the public OTP toolbox just went from "promised on the homepage" to "live and scoring." Take it at <a href="/checkup"><code>/checkup</code></a>.</p>

<h3>What it actually does</h3>
<ul>
<li>24 questions, 3 per level across all 8 levels of agentic maturity. One question at a time, snappy progress bar, no walls of text.</li>
<li>Final score is calculated using Bassim's hierarchy rule: a weakness at any lower level caps your score regardless of higher-level capabilities. A perfect L8 with a broken L4 still scores you a 4.</li>
<li>You get a single number out of 8.0, a tier headline (Tourist, Tinkerer, Operator, Orchestrator, Autonomous Agent Team), per-level breakdown showing which level capped you, and a personalized roadmap with the three highest-leverage moves for your next jump.</li>
<li>Result is also emailed so you can share it with your team or come back to it later.</li>
</ul>

<h3>Why this exists</h3>
<ul>
<li>Most teams cannot answer "where are we, really?" on AI maturity. Vendors sell against the top of the ladder. The honest read is harder to come by.</li>
<li>The same scoring engine our internal evaluator (Bassim) uses to score Sneeze It nightly is now public, translated from "reads your agent files" into "you tell us what is true."</li>
<li>The roadmap is the point. The score is just the way in. If you walk away with three concrete moves to make this quarter, the quiz worked.</li>
</ul>

<h3>The 8 levels, briefly</h3>
<ul>
<li><strong>L1 Tab Complete</strong> -- AI as autocomplete in your editor or inbox.</li>
<li><strong>L2 Agent IDE</strong> -- you have built or deployed at least one real agent.</li>
<li><strong>L3 Context Engineering</strong> -- system prompts, rules files, persistent context.</li>
<li><strong>L4 Compounding Engineering</strong> -- lessons learned compound; agents read your playbooks.</li>
<li><strong>L5 MCP &amp; Skills</strong> -- AI is wired to real tools and takes real actions.</li>
<li><strong>L6 Harness Engineering</strong> -- validation, observability, authority bounds.</li>
<li><strong>L7 Background Agents</strong> -- agents run on a schedule without you starting them.</li>
<li><strong>L8 Autonomous Agent Teams</strong> -- agents talk to each other; you are not the message bus.</li>
</ul>

<p>The homepage and <code>/tools</code> CTAs both repoint to the live calculator. The Checkup is free, no signup required to take it -- only to see the result.</p>`
  },

  {
    date: '2026-05-02',
    tags: ['Site'],
    title: 'New /start-here page, redesigned heroes, and an accessibility pass',
    summary: 'Schedule a 30-minute intro with the founder directly from a new /start-here page. The hero on /, /why-otp, /what-is-otp, and /tools all got rebuilt so the CTA lands above the fold, with inline editorial illustrations on the right. A site-wide accessibility pass on the layout (reduced-motion, keyboard-accessible nav, labeled form inputs).',
    details: `<p>Three quiet improvements to the public site, all shipped together.</p>

<h3>A new <code>/start-here</code> page</h3>
<ul>
<li>Modeled on the EOS Worldwide pattern: one promise, three steps, one calendar.</li>
<li>Hero promises a 30-minute conversation with David Steel, founder of OTP. No slides, no sales gauntlet.</li>
<li>"What happens on the call" section walks through the three things in order: map your AI footprint, find the coordination gaps, decide the next move.</li>
<li>Inline Calendly widget renders the full calendar plus time slots without scrolling, branded against the OTP color palette.</li>
<li>Three reassurance statements address the obvious objections: it is free, you are talking to the founder, we will tell you if OTP is wrong for your situation.</li>
<li>A new "Schedule a 30-min intro" primary button is now in the hero of <code>/why-otp</code>, <code>/what-is-otp</code>, and <code>/tools</code>, all routing to <code>/start-here</code>.</li>
</ul>

<h3>Heroes that put the CTA above the fold</h3>
<ul>
<li>The hero on <code>/</code>, <code>/why-otp</code>, <code>/what-is-otp</code>, and <code>/tools</code> all use the same 12-column grid now: text on the left (col-span-7), an editorial illustration on the right (col-span-5).</li>
<li>H1 sizing tightened so the CTAs land in the first viewport without scrolling on a standard laptop.</li>
<li>Each illustration is a hand-drawn line-art piece that maps to the page's specific copy: an org chart with disconnected AI tools (why), a four-layer Model/Protocol/Network/SaaS stack (what), an open toolbox with five tools (tools), a calendar slot and 30-minute clock (start-here).</li>
<li>All illustrations are 1024px lossless WebP with transparent backgrounds. The page background shows through cleanly.</li>
</ul>

<h3>Accessibility and craft pass</h3>
<ul>
<li>Site-wide <code>prefers-reduced-motion</code> gate so animations honor user preference. Vestibular-disorder users and low-end devices get a calm site.</li>
<li>Keyboard users can now tab into the Explore and Learn nav dropdowns; previously hover-only.</li>
<li>Email signup field has a visually-hidden label and an <code>aria-live</code> result announcement for screenreaders.</li>
<li><code>theme-color</code> meta added so mobile browser chrome matches the dark nav instead of defaulting to system white.</li>
<li><code>transition: all</code> antipatterns replaced with explicit property lists across the layout.</li>
</ul>

<p>None of this changed the product. It changed how the product introduces itself.</p>`
  },

  // ---- May 1, 2026 ----

  {
    date: '2026-05-01',
    tags: ['Improvement'],
    title: 'Bulk-import your human team from a CSV',
    summary: 'Move a whole team onto the chart in one shot. Download a template, fill it out in your spreadsheet of choice, drop it back. Two modes: Addition (safe upsert) and NEW / Overwrite (replace anything not in the CSV). Reports-to resolves by name, including humans created in the same import.',
    details: `<p>Adding humans one tile at a time was fine for a 10-person team and painful for a 50-person team. Today the chart gets a CSV import path that scales.</p>

<h3>Two templates, your choice of detail</h3>
<ul>
<li><strong>Simple:</strong> <code>name, role, reports_to</code>. Three columns, enough to draw the org chart and nothing else.</li>
<li><strong>Full:</strong> name, role, contact email, contact phone, Slack ID, reports_to, job description, authority level, skills, MCPs, status. Every field a human tile carries on the chart, mapped one-to-one.</li>
<li>Both templates download as real CSVs with three example rows. Open in Sheets / Excel / Numbers, edit, save, drop back.</li>
</ul>

<h3>Reports-to resolves the way humans actually write it</h3>
<ul>
<li>Match by name first against existing humans on the chart and against rows in the same import. So a row "John Smith reports_to Jane Doe" works whether Jane is already on the chart or being created in the same CSV.</li>
<li>Falls back to external ID (e.g. <code>HUM_JANEDOE</code>) for power users who already know them.</li>
<li>Names that match nothing leave the parent unset and surface a warning in the result summary -- the row still imports, you just see exactly which links did not land.</li>
</ul>

<h3>Two import modes, one of them destructive</h3>
<ul>
<li><strong>Addition (safe):</strong> upsert by name. Existing humans whose names match get their fields refreshed. Humans not in the CSV are left alone. Default mode, never deletes anything.</li>
<li><strong>NEW / Overwrite:</strong> upsert by name, then delete any human not in the CSV. Agents that escalated to a deleted human lose that link automatically; other humans that reported to a deleted human do too. Confirmation prompt before any destructive run.</li>
</ul>

<h3>Preview before you commit</h3>
<ul>
<li>The drawer parses your CSV client-side and shows a row-by-row preview: which rows are new, which are updates, and which references will resolve.</li>
<li>A live count tells you exactly how many humans NEW mode would delete -- before you run it.</li>
<li>The whole import lands as a single atomic write to your draft OOS, not 50 round-trips. Up to 500 rows per file.</li>
</ul>

<p>Find it next to "Invite member" at the top of <code>/dashboard/team</code>. Owners only.</p>`
  },

  // ---- April 30, 2026 ----

  {
    date: '2026-04-30',
    tags: ['Major', 'Improvement'],
    title: 'Build agents and humans directly on the chart, with the Agent Builder one click away',
    summary: 'Two new ways to add to the org chart without sending an invite. A top-of-chart "Add to chart" button and a per-tile "+" button both open the same edit drawer in create mode, with a Human/Agent toggle. In agent mode, the Agent Builder slides in beside the create drawer so you can generate, then auto-fill the form.',
    details: `<p>Until today, getting a tile onto <code>/dashboard/team</code> meant either authoring an OOS file or sending an invite. That worked when you had real teammates to email, but slowed you down when you wanted to model an agent or place a known human on the chart without bringing them in yet. Two changes fix that.</p>

<h3>Two new entry points to the create flow</h3>
<ul>
<li><strong>"Add to chart" button</strong> at the top of the chart, next to "Invite member." Opens the same side drawer you already use for tile editing, but in create mode -- empty fields, a Human / Agent toggle at the top, and a Create button instead of Save.</li>
<li><strong>Per-tile "+" button</strong> appears in the bottom-right corner when you hover any tile (owners only). Click it and the create drawer opens with the tile you hovered preselected as the parent -- "reports to" for humans, "escalates to" for agents. One click adds a direct report under the seat you are standing on.</li>
</ul>

<h3>Same drawer, same fields, same SOP section</h3>
<ul>
<li>Every field from the edit drawer is available in create mode: role, mission, job description, authority level, agentic maturity, platform, status, contact email/phone, Slack ID, skills, MCPs, SOPs, KPIs.</li>
<li>The Invite section and Delete button are hidden in create mode -- the rest of the panel is identical, so the visual rhythm of the chart is unchanged.</li>
<li>Submit creates the tile in your draft and saves all the extra fields in one go. Reload to see it on the chart.</li>
</ul>

<h3>Agent Builder runs inside the chart now</h3>
<ul>
<li>In agent create mode, a "Use Agent Builder" button appears at the top of the drawer. Click it and the Agent Builder slides in from the right -- same rail as the create drawer, white background, light theme.</li>
<li>Just the wizard. No hero, no marketing sections, no footer. Industry, title, description, skills, tools, personality framework, review.</li>
<li>On generate, the result populates the create drawer underneath: name, role, mission, skills, MCPs all filled in, with the full generated CLAUDE.md added as a SOP entry titled "Generated CLAUDE.md." The Agent Builder closes; you adjust anything you want and click Create.</li>
<li>The standalone <code>/agent-builder</code> page is unchanged for visitors who land on it directly.</li>
</ul>

<h3>Why this matters</h3>
<p>The seat is the unit of an org chart, not the body. Until you can put a seat down without sending an email, the chart is gated by your willingness to bother people. Now you can model the team you want -- humans you have not invited yet, agents you are still drafting -- and the chart is a working spec from the moment you put a tile on it. The Agent Builder integration closes the loop between "I need an agent for X" and "the agent is on my chart with the right SOPs inherited from its parent." Two minutes from idea to placeable seat.</p>`
  },

  // ---- April 26, 2026 ----

  {
    date: '2026-04-26',
    tags: ['Major', 'Core'],
    title: 'OTP becomes the Organization Operating System',
    summary: 'OTP no longer treats the agent army as the organization. Humans, AI agents, and the SOPs they share are now one accountability graph. Author SOPs once, agents under each human inherit them at runtime, and you can invite real teammates to claim tiles on the chart.',
    details: `<p>Today is the pivot. OTP started as the Organization Transport Protocol for AI agents. The acronym was right; the scope was too narrow. The agent army is a slice of the organization. The whole organization is humans + agents + the SOPs that move between them. That is what OTP is for now.</p>

<h3>SOPs as the unit of coordination</h3>
<ul>
<li><strong>Author once:</strong> click any agent or human on <code>/dashboard/team</code> and add SOPs in the side panel. Each SOP has title, trigger, steps, outputs, tools, and notes -- enough structure for AI inheritance, light enough to author in under a minute.</li>
<li><strong>Five Founder/CEO templates seeded:</strong> daily inbox triage, weekly L8, monthly stakeholder update, founder-led discovery call, quarterly Rocks-setting. Click "+ From template..." in the SOP section, pick one, edit to your voice, save. Sixty seconds to a working operating cadence.</li>
<li><strong>Purple "N SOPs" badge</strong> on every chart tile that has authored SOPs. Visual confirmation that a tile carries executable spec, not just a name.</li>
</ul>

<h3>AI agents inherit SOPs from their human</h3>
<ul>
<li><strong>Inheritance:</strong> when an agent escalates_to a human, the agent inherits that human's SOPs as runtime context. No copy-paste, no re-explanation when a new instance spins up.</li>
<li><strong>Copy as Agents.md / Claude.md:</strong> every agent's edit panel has a one-click button that compiles own SOPs + inherited SOPs + role/mission/authority into a markdown file, copied straight to your clipboard. Pick the format your stack expects -- AGENTS.md (cross-platform default), CLAUDE.md (Claude Code), .cursorrules (Cursor), or generic system prompt. Drop it into your runtime and the agent runs on the org's latest accountability state.</li>
<li><strong>Tooltip:</strong> hover any agent and see "Inherits N SOPs from {parent}." The SOP layer is visible at a glance.</li>
</ul>

<h3>Multi-user invitations</h3>
<ul>
<li><strong>Invite to claim a tile:</strong> open any human node and you will find an "Invite to claim this tile" section. Email goes out from <code>notifications@mail.orgtp.com</code> with a 30-day-TTL signed link.</li>
<li><strong>Invite someone new:</strong> the chart header has a "+ Invite new member" button that creates a fresh tile and fires the invite in one action -- name, email, optional role, optional reports-to.</li>
<li><strong>Accept-invite landing:</strong> the recipient lands on a page showing the org name, the tile reserved for them, and the expiry date <em>before</em> they sign in. Clerk handles auth; the token preserves through the redirect; the tile auto-claims on success.</li>
<li><strong>Pending invites drawer:</strong> owners get a header button (with badge count) that opens a drawer of every pending invite, with revoke buttons.</li>
<li><strong>"Claimed" pill</strong> shows on every human tile that is bound to a real member account.</li>
</ul>

<h3>Editor polish</h3>
<ul>
<li><strong>Contact fields on humans:</strong> email, phone, Slack ID, with small contact pills on the chart tile when populated.</li>
<li><strong>Status field</strong> with active / paused / inactive / retired / terminated. Inactive nodes render grayscale with a strike-through name -- a clean way to mark old data without losing structure.</li>
<li><strong>Explicit Delete button</strong> in the edit panel. Removing a tile also scrubs any escalates_to / reports_to / override_authority references that pointed at it, so the chart never dangles.</li>
<li><strong>Sticky filter:</strong> the All / Agents / Humans toggle persists in localStorage. Refresh the page; the view stays where you left it.</li>
</ul>

<h3>What the framing change means</h3>
<p>OTP is no longer "the AI coordination protocol." It is the substrate for hybrid human-and-AI organizations. The chart is the surface, the SOPs are the substance, the network is the leverage. <a href="/about">/about</a> and the <a href="/faq">FAQ</a> are updated.</p>
<p>Next up: invite-from-tile for agents (members spin up their own connected Claude instances under their tile), dotted comparison lines between same-role agents, skills taxonomy, and mobile polish.</p>`,
  },

  {
    date: '2026-04-26',
    tags: ['Major', 'Core'],
    title: 'Team Chart: Visualize and Edit Your Agent + Human Org',
    summary: 'Your dashboard now has a visual org chart of every agent and human in your OOS, with click-to-edit fields and drag-and-drop hierarchy. Edits land as a draft until you publish.',
    details: `<p>Open <code>/dashboard/team</code> and your published OOS becomes a top-down org chart: agents, humans, organization, all wired by escalation and reporting lines.</p>
<ul>
<li><strong>Live derivation from your OOS:</strong> the chart reads <code>entities.agents</code> and <code>entities.humans</code> from your latest draft (preferred) or published file. No new schema, no separate database. Your OOS is still the source of truth.</li>
<li><strong>Click any node to edit:</strong> a side panel opens with name, role, mission or job description, authority level, platform and status (agents), skills, and the escalates_to or reports_to dropdown. Saving creates a draft if you do not already have one.</li>
<li><strong>Drag and drop to restructure:</strong> drag any agent or human onto another box and it becomes the new child. Cycle prevention rejects drops that would create loops. The PATCH writes back to your OOS draft and the chart re-renders.</li>
<li><strong>Type filter:</strong> the All / Agents / Humans toggle re-lays out the tree to show just what you care about.</li>
<li><strong>Status banner:</strong> shows whether you are looking at a draft (with version number) or your published file. Edits never touch your published file until you republish.</li>
</ul>
<p>If your OOS does not have <code>entities.agents</code> or <code>entities.humans</code> populated yet, the chart will look empty. Reach out and we can help you migrate. Next up: skills taxonomy, mobile polish, and add/delete nodes.</p>`,
  },

  // ---- April 5, 2026 ----

  {
    date: '2026-04-05',
    tags: ['Major', 'Core'],
    title: 'The Content Engine: Industry Playbooks, CLAUDE.md Generator, and Newsletter',
    summary: '203 original coordination practices across 6 industries. Pick your industry, download a CLAUDE.md, and your agents work better today. Plus an AI-powered generator and weekly newsletter.',
    details: `<p>OTP's biggest update yet. We flipped the entry point: instead of asking you to publish, we're giving you something useful first. Industry coordination playbooks written from real production experience.</p>
<ul>
<li><strong>6 Industry Playbooks:</strong> Agency (34 practices), Fitness/Franchise (29), Healthcare (24), SaaS (23), Professional Services (50), and E-Commerce (43). Each practice includes what to do, why it matters, and what goes wrong without it. These are original content from teams running 10+ AI agents in production, not scraped or AI-classified consulting reports.</li>
<li><strong>Download as CLAUDE.md:</strong> One click exports any industry playbook as a CLAUDE.md file you can drop into your project. Your agents start following proven coordination patterns immediately.</li>
<li><strong>CLAUDE.md Generator:</strong> Tell us your industry, team size, and agent count. Our AI generates a complete, customized CLAUDE.md using your industry's coordination practices as context. Fallback templates ensure you always get something useful, even if the AI is having a bad day.</li>
<li><strong>Practice Voting:</strong> Upvote and downvote practices on any industry page. Community validation surfaces the practices that actually work in the real world.</li>
<li><strong>Newsletter:</strong> Weekly coordination intelligence updates delivered to your inbox. No account required, just your email. Stay informed about new practices, industry playbooks, and what's working for other AI teams.</li>
<li><strong>Homepage Refresh:</strong> Three-slide hero showcasing industry playbooks, the CLAUDE.md scanner, and newsletter signup. All 6 industries with live practice counts.</li>
</ul>
<p>The idea is simple: come to OTP, get your industry's playbook, use it. When you're ready to share what you've learned, publish your OOS. But start with value, not a request.</p>`,
  },

  // ---- March 30, 2026 ----

  {
    date: '2026-03-30',
    tags: ['Core', 'Security'],
    title: 'Vulnerability Scanner, Foundation Score, and Share Your Score',
    summary: 'OTP now scans your system prompt for sensitive data before publishing, scores your structural health on a 0-100 Foundation Score, and lets you share your score to X, LinkedIn, or clipboard with one click.',
    details: `<p>Three new features that make uploading your CLAUDE.md safer, more actionable, and more fun.</p>
<ul>
<li><strong>Vulnerability Scanner:</strong> Before you can publish, OTP now scans your entire system prompt for sensitive data -- API keys, passwords, database URLs, credit card numbers, SSNs, revenue figures, salary data, employee names, Slack IDs, internal file paths, billing rates, and more. 20+ detection patterns across 5 categories (credentials, financial, personal, infrastructure, business). Critical and high-severity findings block publishing until resolved. Your secrets stay secret.</li>
<li><strong>Foundation Score (0-100):</strong> Instant structural triage on upload. 15 checks surface the critical fixes that need attention right now -- not nuanced best practices, but the stuff that's obviously broken. No human override authority? No escalation paths? No error handling? Agents with no clear responsibilities? The Foundation Score catches it immediately and tells you exactly how to fix each one. Critical failures cap your score regardless of everything else.</li>
<li><strong>Share Your Score:</strong> New share button on both the scan results page and the dashboard. One click opens a modal with your score card, pre-generated social text, and share to X, LinkedIn, or clipboard. Designed for virality -- "Just scanned my AI agent system. Coordination Score: 82/100. What's yours?" Every share is an ad for OTP.</li>
</ul>
<p>The vulnerability scanner is a trust prerequisite -- it removes the fear barrier to sharing your operating system. The Foundation Score gives instant value on first upload. And the share button turns every scan into a growth opportunity.</p>`,
  },
  {
    date: '2026-03-30',
    tags: ['Core'],
    title: 'The Coordination Score: Your AI Team\'s Health Dashboard',
    summary: 'OTP now scores your AI coordination maturity on a 0-100 scale across 6 dimensions. Upload your CLAUDE.md, see what the scanner finds, fix issues inline, and publish with one click. The scan page is the product.',
    details: `<p>OTP now scores your AI coordination maturity on a 0-100 scale across 6 dimensions: Conflict Management, Escalation Structure, Workflow Clarity, Human Oversight, System Redundancy, and Authority Boundaries. The score is the product.</p>
<ul>
<li><strong>Scan Results Page:</strong> Animated score ring (Lighthouse-style), 6-dimension breakdown bars with color coding, and insight cards grouped by severity. This is the "aha moment" -- upload your CLAUDE.md and see what the scanner finds.</li>
<li><strong>Fix Issues Inline:</strong> Each critical/warning insight has a "Resolve This" button. Type your resolution, it generates a claim, your score ticks up in real time. The scan page IS the diagnostic session.</li>
<li><strong>One-Click Publish:</strong> After fixing issues, "Publish to OTP Network" does everything in one click -- auto-fix, create OOS, publish, redirect to your live page. No confusing intermediate steps.</li>
<li><strong>Dashboard Overhaul:</strong> Your dashboard now shows the same score ring and dimension bars. Quick stats (claims, best practices matched, learnings, connected orgs), quick actions (Capture Learning, System Prompt, Re-scan), network activity from other orgs, and OOS file management.</li>
<li><strong>Import-First Publish:</strong> The publish page now leads with "Upload File" (drag-drop zone for CLAUDE.md) instead of hiding it as a "power user" option. The wizard is secondary for people starting from scratch.</li>
<li><strong>CLAUDE.md Parser:</strong> New <code>/scanner/from-text</code> endpoint extracts agents, systems, workflows, and oversight patterns from raw CLAUDE.md files. No more "Scanner could not analyze this content" errors.</li>
<li><strong>Copy as System Prompt:</strong> One button on any OOS detail page formats your claims into a compact, token-efficient block for pasting into CLAUDE.md. Shows Token Efficiency Index.</li>
</ul>
<p>The creation experience is now the product. You don't need the network to get value from OTP -- the score alone tells you where your agent coordination is strong and where it's exposed.</p>`,
  },

  // ---- March 29, 2026 ----

  {
    date: '2026-03-29',
    tags: ['Core'],
    title: 'The Live Learning Loop: Agent Fails, Network Learns',
    summary: 'When an agent makes a mistake and you correct it, that correction becomes coordination intelligence on the network instantly. Auto-capture, auto-publish, auto-pull, cross-org learning. The OTP flywheel is live.',
    details: `<p>OTP is now a living system. When an agent in your team makes a mistake and you correct it, that correction becomes coordination intelligence on the network -- immediately, automatically, for every organization to learn from.</p>
<ul>
<li><strong>Auto-capture:</strong> When you correct an agent's output, the agent automatically calls <code>capture_learning</code> with what failed, what to do instead, and why. Every correction is a learning. No manual step.</li>
<li><strong>Auto-publish:</strong> Learnings go directly to your published OOS and the OTP network. No draft step, no delay. Your correction is available to the entire network within seconds.</li>
<li><strong>Auto-pull:</strong> Before executing their main task, agents check OTP for relevant learnings: "Has anyone (including other orgs) learned something about what I'm about to do?" If yes, they follow the learning instead of repeating the mistake.</li>
<li><strong>Cross-org learning:</strong> When another organization discovers a coordination failure that matches your agent setup, OTP surfaces it. Their failure becomes your prevention.</li>
</ul>
<p>This is the OTP flywheel: <strong>agents operate &rarr; humans correct &rarr; corrections become intelligence &rarr; all agents improve &rarr; fewer corrections needed</strong>. Sneeze It is the first organization running this loop live.</p>`,
  },
  {
    date: '2026-03-29',
    tags: ['Quality'],
    title: 'Coordination Intelligence Filter',
    summary: 'OTP now enforces a content standard: only claims about how agents, systems, and humans coordinate belong on the platform. 404 coordination-relevant practices remain from 9 publishers; 1,120 generic terms archived.',
  },

  // ---- March 28, 2026 ----

  {
    date: '2026-03-28',
    tags: ['Major'],
    title: '1,554 Best Practices from 8 Publishers -- Google, AWS, Deloitte, Accenture, and More',
    summary: 'OTP is now a multi-publisher best practices platform with 1,554 practices from 8 authoritative sources. Publisher profiles, OOS-connected matching, bidirectional discovery, and one-click ingest into your OOS.',
    details: `<p>OTP is now a multi-publisher best practices platform. We scraped, structured, and indexed AI knowledge from <strong>8 authoritative sources</strong>: Google (686 ML terms), Amazon Web Services (254 cloud AI terms), DAIR.AI (236 prompt engineering techniques), McFadyen Digital (209 commerce AI practices), Hopsworks (152 MLOps terms), Accenture (8 enterprise case studies), Deloitte (7 AI use cases), and Bain &amp; Company (2 strategy frameworks). Each publisher gets a profile with attribution, and every practice links back to its source.</p>
<ul>
<li><strong>Publisher profiles:</strong> A new expert type. Each publisher has a full profile, linked best practices, and attribution on every card.</li>
<li><strong>OOS-connected matching:</strong> Best practices are matched to your OOS using Jaccard similarity with concept synonyms. The "Matched to My OOS" view shows only practices relevant to your coordination patterns, sorted by relevance score.</li>
<li><strong>Implement and Ingest:</strong> Click "Implement" on any best practice to see the full definition, publisher credit, and which organizations align with that pattern. Click "Ingest into my OOS" to add it as a claim to your draft OOS.</li>
<li><strong>Best practices on OOS detail:</strong> Each published OOS now shows a "Relevant Best Practices" section with matched practices, scores, and source links.</li>
<li><strong>Bidirectional matching:</strong> When viewing a best practice, see which organizations implement that pattern -- creating a two-way discovery network between publishers and practitioners.</li>
</ul>
<p>This introduces a new expert type: <strong>Publisher</strong>. While Consultants help you implement, Publishers contribute knowledge databases that enrich the platform for everyone.</p>`,
  },
  {
    date: '2026-03-28',
    tags: ['Improvement'],
    title: 'Richer OOS Files, MCP Tool Detection, and Agentic Level v2',
    summary: 'OOS word limits raised 3x to 15,000 words, MCP server auto-detection populates the Infrastructure Graph from 30+ known tools, and the Agentic Level Calculator v2 uses 100+ semantic patterns.',
    details: `<ul>
<li><strong>OOS limits raised 3x:</strong> Maximum word count increased from 5,000 to 15,000 words. Section claim caps tripled (e.g. 10 to 30). Upload limit raised to 2MB. Minimum lowered to 500 words for starter OOS files.</li>
<li><strong>MCP server auto-detection:</strong> The auto-fixer now scans OOS content against 30+ known tools (Slack, Gmail, Google Ads, Meta Ads, Todoist, etc.) and populates the Infrastructure Graph automatically. All published OOS files have been enriched.</li>
<li><strong>Publish wizard: tool collection:</strong> Step 2 now includes checkboxes for 20 common MCP servers/integrations alongside AI platforms. Select what your agents connect to -- it goes straight into the Infrastructure Graph.</li>
<li><strong>Agentic Level Calculator v2:</strong> Expanded from rigid exact-match keywords to 100+ semantic patterns. Checks frontmatter metadata (platforms, MCP servers). All orgs rescored -- most jumped from L2 to L5-L8.</li>
<li><strong>Sign In page:</strong> Dedicated /sign-in page with Clerk integration. Sign In button now visible in the navigation for all visitors.</li>
</ul>`,
  },

  // ---- March 27, 2026 ----

  {
    date: '2026-03-27',
    tags: ['Security'],
    title: 'Platform Security Hardening',
    summary: 'Comprehensive security review: UUID validation on all routes, XSS prevention, API key scope enforcement, Zod input validation on every endpoint, CORS tightening, and proper access control on draft OOS content.',
  },
  {
    date: '2026-03-27',
    tags: ['Performance'],
    title: 'Background Similarity Computation',
    summary: 'Claim similarity analysis now runs asynchronously after publishing. Publishing is instant regardless of network size, while similarities still compute and store in the background.',
  },
  {
    date: '2026-03-27',
    tags: ['SEO'],
    title: 'Search Engine Discoverability',
    summary: 'Every page now has proper meta descriptions, canonical URLs, and Open Graph tags. Dashboard and admin pages are marked noindex. Fully optimized for Google indexing and AI search engine citability.',
  },
  {
    date: '2026-03-27',
    tags: ['Infrastructure'],
    title: 'Code Quality and Architecture Improvements',
    summary: 'Extracted shared authentication helper, consolidated rate limiting, added transactional version numbering with retry logic, and fixed pagination totals on intelligence search and publisher endpoints.',
  },

  // ---- March 26, 2026 ----

  {
    date: '2026-03-26',
    tags: [],
    title: 'MCP Server Infrastructure on the Graph',
    summary: 'The Infrastructure graph now shows real MCP connections -- Slack, Gmail, Google Ads, Meta Ads, Todoist, and more. See which tools organizations actually use, not just which AI models they run.',
  },
  {
    date: '2026-03-26',
    tags: [],
    title: 'Agent Onboarding Framework',
    summary: 'Your OOS is your agent\'s day-one onboarding packet. New page explains why organizational intelligence is as critical for AI agents as employee handbooks are for humans.',
  },
  {
    date: '2026-03-26',
    tags: [],
    title: 'Machine Commerce Discovery',
    summary: 'OTP positioned as the discovery layer for the emerging agent-to-agent economy. Published OOS files become machine-readable trust profiles.',
  },
  {
    date: '2026-03-26',
    tags: [],
    title: 'MCP Integration Hub',
    summary: 'Full documentation for OTP\'s MCP server. Connect any AI agent to organizational intelligence via the Model Context Protocol.',
  },
  {
    date: '2026-03-26',
    tags: [],
    title: 'Natural Language OOS Generation',
    summary: 'Describe your AI operations in plain English and OTP generates a structured OOS file ready to publish. No technical formatting required.',
  },
  {
    date: '2026-03-26',
    tags: [],
    title: 'OOS File Management',
    summary: 'Rename, edit, and delete your OOS files directly from the dashboard. Admins get full platform-wide management.',
  },
  {
    date: '2026-03-26',
    tags: [],
    title: 'Intelligence Graph Redesign',
    summary: 'Wiz-inspired org-first hierarchy with clean org nodes, aggregated weighted edges, similarity score slider, and click-to-expand claims. No more hairball.',
  },

  // ---- March 25, 2026 ----

  {
    date: '2026-03-25',
    tags: [],
    title: 'Industry Color Coding',
    summary: 'Organizations now display in industry-specific colors on the Intelligence Graph. Business coaching, healthcare, finance, and more each get a distinct color.',
  },
  {
    date: '2026-03-25',
    tags: [],
    title: 'MCP Server for OOS',
    summary: 'Query organizational intelligence programmatically. Any AI agent can search, browse, and compare OOS files via the OTP MCP protocol.',
  },

  // ---- March 24, 2026 ----

  {
    date: '2026-03-24',
    tags: [],
    title: 'Expert Coach OOS Template',
    summary: 'First coaching-industry OOS published. 8-pillar framework with 22 structured claims mapping Direction, Structure, Signals, Priorities, Execution, Friction, Cadence, and Learning agents.',
  },
];

/**
 * Returns changelog entries from the last N days.
 */
export function getRecentEntries(days: number = 7): ChangelogEntry[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  return changelog.filter(entry => entry.date >= cutoffStr);
}
