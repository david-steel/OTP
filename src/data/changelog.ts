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
<li><strong>Five Founder/CEO templates seeded:</strong> daily inbox triage, weekly L10, monthly stakeholder update, founder-led discovery call, quarterly Rocks-setting. Click "+ From template..." in the SOP section, pick one, edit to your voice, save. Sixty seconds to a working operating cadence.</li>
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
