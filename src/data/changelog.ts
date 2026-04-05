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
