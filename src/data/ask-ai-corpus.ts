// Ask AI v1 -- static product-help corpus.
//
// Builds the BYTE-STABLE knowledge string fed to Claude as a prompt-cached
// system prefix. CRITICAL: nothing here may be time- or request-dependent
// (no Date.now, no timestamps, no randomness, no per-request data). A single
// byte of drift between requests invalidates the prompt cache.
//
// DB-free: imports only src/data/changelog.ts (a static array) and
// src/data/guide-content.ts (static guide text) so the unit test can import
// this module without DATABASE_URL.
import { changelog } from './changelog.js';
import { GUIDE_PLAIN_TEXT } from './guide-content.js';

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
- /guide -- the searchable user guide / help center: the full OrgTP End-User
  Guide (every page explained), with instant search. /guide?q=term deep-links
  a search.
- /guide/connect-your-agent -- the fast onboarding path: a copy-paste AI
  prompt that generates a first OOS in about 60 seconds, and a one-line
  install (curl orgtp.com/install.sh) that gives Claude Code the OTP MCP
  server and slash commands (/otp-publish and friends).
- /templates -- a free library of 80+ meeting templates and agendas (EOS
  Level 10, Scaling Up, Agile/Scrum ceremonies, 1:1s, retrospectives,
  focus groups, planning, QBRs, and more). Each is searchable, downloadable
  as markdown, printable, and can be adapted and run live in OrgTP. Browse
  at /templates or a specific one at /templates/<slug> (e.g.
  /templates/level-10-meeting).
- /whats-new -- the product changelog page (every shipped update).
- /blog -- the EOS + AI article library.
- /premium-support -- Premium Support: priority help in a dedicated Slack
  channel plus quarterly founder reviews.
- /settings/api -- MCP / API keys for connecting AI agents.

## How the network loop works

1. **Publish your OOS.** OTP scans your CLAUDE.md, extracts structured claims,
   scores quality, and publishes pseudonymized -- no client data, no PII (a
   PII scanner flags violations).
2. **Learn from the network.** OTP's Scout analyzes gaps in your OOS and
   surfaces high-quality claims from other organizations worth adopting.
3. **Get smarter every morning.** The dashboard shows new recommendations and
   cross-org patterns; accept, reject, or adapt each one. Your OOS evolves
   with the network.

OOS claim sections: core_operating_rules, agent_roles_and_authority,
coordination_patterns, operational_heuristics, failure_patterns,
human_ai_boundary_conditions.
`.trim();

// ---------------------------------------------------------------------------
// Full End-User Guide -- the canonical product walkthrough, sourced from
// src/data/guide-content.ts (same content the /guide help center renders).
// Replaces the hand-curated guide excerpt that used to live in OVERVIEW.
// GUIDE_PLAIN_TEXT is a static constant, so this stays byte-stable.
// ---------------------------------------------------------------------------
const GUIDE_BLOCK = '# OrgTP End-User Guide (full text)\n\n' + GUIDE_PLAIN_TEXT.trim();

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
export const ASK_AI_CORPUS: string = OVERVIEW + '\n\n' + GUIDE_BLOCK + '\n\n' + renderChangelogDigest();
