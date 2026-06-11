// Ask AI v1 -- static product-help corpus.
//
// Builds the BYTE-STABLE knowledge string fed to Claude as a prompt-cached
// system prefix. CRITICAL: nothing here may be time- or request-dependent
// (no Date.now, no timestamps, no randomness, no per-request data). A single
// byte of drift between requests invalidates the prompt cache.
//
// DB-free: imports only src/data/changelog.ts (a static array) so the unit
// test can import this module without DATABASE_URL.
import { changelog } from './changelog.js';

// ---------------------------------------------------------------------------
// Product overview
// ---------------------------------------------------------------------------
const OVERVIEW = `
# OTP product knowledge

## What OTP is

OTP (Organization Transport Protocol, at orgtp.com) is an EOS-style organization
operating system. An organization runs its whole operating cadence inside it:

- **Org chart / accountability chart** -- humans and AI agents seated on a chart,
  each seat with clear ownership. Team chart lives at /dashboard/team.
- **L8 meetings** -- structured weekly leadership meetings (EOS-style "Level 10"
  format, called L8 in OTP): scorecard review, rock review, headlines, to-do
  review, IDS issue solving, and a conclude step. A special **Strategy Reset**
  meeting type exists for quarterly/annual planning. Meetings list + create at
  /l8; a live meeting runs at /l8/meeting/:id.
- **Rocks** -- quarterly priorities with owners and due dates, reviewed in
  meetings and visible on dashboards.
- **To-dos with delegation** -- personal queue at /me/todos plus delegation:
  assign a to-do to someone, track "waiting on others", close out a stalled
  delegated to-do yourself (done + verified in one click, owner notified).
- **KPIs / Scoreboard** -- weekly-measured numbers with goals and owners at
  /dashboard/kpis. KPIs can be archived (retired from every default view
  without deleting history) and unarchived.
- **Issues (IDS)** -- an issues list worked Identify-Discuss-Solve style,
  in meetings and on the dashboard.
- **Headlines** -- short good/bad news items shared with the team and reviewed
  in meetings.
- **OOS publishing** -- an OOS (Organizational Operating System) is a structured,
  pseudonymized snapshot of how an org's AI agents coordinate: claims with a
  Rule, Why, Failure mode, Confidence (HIGH/MEDIUM/LOW), Evidence type, and
  Scope. Publish at /publish; OTP extracts claims, scores quality, and shares
  learnings across the network so organizations stop re-learning the same
  AI-coordination lessons.
- **AI agents** -- agents are first-class members: they sit on the org chart,
  can own to-dos and KPIs, and connect via the OTP MCP server (16 tools) so a
  Claude Code / Cursor / Cline agent can publish, browse, and learn from the
  network. API keys for MCP live at /settings/api.

## Route map (real, registered routes)

- /dashboard -- the Daily dashboard: run-my-day view with to-dos, rocks,
  issues, scorecard summary, and meeting prep.
- /dashboard/kpis -- KPIs / Scoreboard: weekly grid, goals, archive/unarchive,
  view tabs.
- /dashboard/team -- the team / accountability chart (humans + agents).
- /l8 -- meetings: list of L8 meetings plus creating a new one (including the
  Strategy Reset type).
- /l8/meeting/:id -- the live meeting runner for one meeting (scorecard,
  rocks, headlines, to-dos, IDS issues, conclude).
- /me/todos -- the personal to-do queue, including delegations.
- /publish -- publish or update the org's OOS.
- /tickets -- Raise a Ticket: contact support, report a problem, ask for help
  from a human.
- /guide -- the user guide / help center: why OTP exists, the three ways to
  get started, how publishing and learning work, what an OOS is.
- /whats-new -- the product changelog page (every shipped update).
- /blog -- the EOS + AI article library.
- /premium-support -- Premium Support: priority help in a dedicated Slack
  channel plus quarterly founder reviews.
- /settings/api -- MCP / API keys for connecting AI agents.

## Getting started (from the user guide)

Three ways in:

1. **Publish on the web (fastest).** Sign up free at orgtp.com, go to /publish,
   paste a CLAUDE.md (or any file describing how your AI agents coordinate),
   and click Publish. OTP extracts claims, scores quality, and shows how you
   compare to other organizations -- about 60 seconds to a first OOS.
2. **Generate with AI first.** No CLAUDE.md yet? The guide at /guide includes a
   copy-paste prompt for any AI assistant (Claude, ChatGPT, Gemini) that
   generates a complete OOS file -- YAML frontmatter, a Purpose section, Prime
   Directives, and 15+ structured claims -- ready to paste into /publish.
3. **Connect your AI agent (power users).** For Claude Code, Cursor, Windsurf,
   or any MCP-compatible client: one install command
   (curl -fsSL https://orgtp.com/install.sh | bash) sets up the OTP MCP server
   (16 tools) and 5 slash commands (/otp dashboard, /otp-publish, /otp-morning
   briefing, /otp-browse, /otp-learn). Requires Node.js v18+ and the Claude
   Code CLI. Manual MCP config (npx otp-mcp-server with an OTP_API_KEY from
   /settings/api) works for other clients.

## How the network loop works

1. **Publish your OOS.** OTP scans your CLAUDE.md, extracts structured claims,
   scores quality, and publishes pseudonymized -- no client data, no PII (a
   PII scanner flags violations).
2. **Learn from the network.** OTP's Scout analyzes gaps in your OOS and
   surfaces high-quality claims from other organizations worth adopting.
3. **Get smarter every morning.** The dashboard shows new recommendations and
   cross-org patterns; accept, reject, or adapt each one. Your OOS evolves
   with the network.

## What makes a great OOS (guide tips)

Do: be specific ("Agent A writes file X, Agent B reads file X" beats "agents
share data"); include failures (failure_patterns claims are the most valuable);
be honest about confidence (LOW/SPECULATION shows intellectual honesty); update
it as the AI setup evolves. Do not: include client names, employee PII, or
proprietary pricing; write generic advice ("AI should be supervised" is not a
claim); pad it -- 15 specific claims beat 30 vague ones.

OOS claim sections: core_operating_rules, agent_roles_and_authority,
coordination_patterns, operational_heuristics, failure_patterns,
human_ai_boundary_conditions.
`.trim();

// ---------------------------------------------------------------------------
// Changelog digest -- latest 30 entries, title + summary + date only.
// changelog.ts is ordered newest-first and is a static constant, so this
// render is deterministic.
// ---------------------------------------------------------------------------
function renderChangelogDigest(): string {
  const lines = changelog.slice(0, 30).map(
    (e) => `- ${e.date} -- ${e.title}\n  ${e.summary}`,
  );
  return ['## Recent product updates (newest first)', '', ...lines].join('\n');
}

/** The full byte-stable corpus. Computed once at module load. */
export const ASK_AI_CORPUS: string = OVERVIEW + '\n\n' + renderChangelogDigest();
