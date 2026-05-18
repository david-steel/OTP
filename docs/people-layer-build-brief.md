# OTP People Layer — Build Brief (cold-start handoff)

> **You are a fresh Claude Code session.** David pasted a prompt pointing you here
> because the prior session cleared its context. This document is a complete
> handoff: it has everything to build the rest of the OTP People layer with
> **zero re-research**. Read it fully, then follow the workflow in §6.
> Last updated: 2026-05-18 (later the same day). 5A, 5B, 5C and Shared KPIs (5D)
> all SHIPPED -- see §5 and §9. Do NOT rebuild them.

---

## 1. What OTP is

OTP (orgtp.com) is an operating system for running a company on EOS-style
discipline — weekly leadership meeting, scorecard, quarterly priorities, issues,
to-dos, an accountability chart — **with AI agents as first-class seats next to
humans.** The agent layer is the differentiator; the EOS scaffolding is table
stakes.

- **Repo:** `/Users/dsteel/otp-platform`
- **Stack:** Fastify + TypeScript + Drizzle ORM + Postgres (Railway) + EJS views
- **Two products in one repo:** `src/` = OTP. `orger/` = a separate product (Orger).
  **You only touch `src/`.**
- **Owner:** David Steel, CEO of Sneeze It. He is the Visionary; OTP is his venture.

## 2. What is ALREADY built — do NOT rebuild any of this

A long session shipped 8 deploys today. Live on orgtp.com:

- **Meetings** (`/l8/meeting/:id`, `l8-leadership.ejs`): agenda, timer, delete,
  attendee picker (handles two stored attendee shapes), scorecard snapshot,
  cascade. `meetings` table.
- **Scorecard:** KPI rows with **Previous + Latest** columns, "as of" dates,
  inline-editable values (each edit writes a NEW dated `kpi_values` row),
  **stale-KPI flag** (latest value older than the KPI's cadence).
- **Quarterly Priorities (Rocks):** `rocks` table; team picker on the add form;
  `rocks.planSectionId` + `rocks.executionItemId` columns exist (link to the
  operating plan) and the add form has a 90-day execution-item picker.
- **To-dos:** `todos` table; delegation + verification (delegator* columns,
  `verified`), recurrence, `dueAtHistory`. Delegation UI on `/dashboard` and
  `/me/todos`.
- **Issues:** `tickets` table, IDS workflow, team-scoped. "Flag as issue" buttons
  on headline items and scorecard KPI rows.
- **Headlines:** `meeting_headlines` table — **carries `teamId`** (a team's
  headlines surface in any of that team's meetings); `meetingId` is nullable;
  "Addressed" click-off marks `readAt`; the dashboard excludes addressed ones.
- **Teams:** `teams` + `team_memberships`; a **team filter** on `/dashboard`
  (`?teamId=`) scoping meetings/rocks/kpis/todos/issues.
- **The chart:** `getOrgTeamGraph()` in `src/services/team-graph.ts` builds
  nodes (`human` / `agent` / `organization`) + edges (`reports_to`,
  `escalates_to`, `overrides`, `part_of`) from OOS-file YAML frontmatter.
- **People layer Phase 1 (shipped):**
  - `seat_responsibilities` table + `GET/PUT /api/v1/seats/:externalId/responsibilities`
    + responsibilities editor on `team-profile.ejs`.
  - **Accountability Gaps panel** on `/dashboard` — a read-only report computed
    in the `/dashboard` route as `accountabilityGaps = { seatsNoMeasurable[],
    orphanedWork[], agentsNoHuman[] }`. **This panel is what Phase "1.5" below
    upgrades.**
  - Headline "Addressed" two-way sync.

## 3. Hard constraints — non-negotiable

1. **Trademark safety.** EOS Worldwide trademarks the vocabulary. Use generic
   names in all product copy / identifiers:
   | Concept | DO NOT use | USE |
   |---|---|---|
   | Fit on role | GWC, Get-Want-Capacity | **Seat Fit** — axes: Understands / Wants / Capacity |
   | Fit review | People Analyzer | **People Review** |
   | Org values | (Core Values is borderline) | **Values** |
   | Org chart | Accountability Chart | **team chart** |
   The codebase already does this (Operating Plan not V/TO, Quarterly Priorities
   not Rocks-in-UI, Weekly Leadership Meeting not L10).
2. **The connectivity rule.** Every meeting entity routes through `teamId`,
   bidirectionally: add it to a team → it shows in that team's meeting; it's in
   the meeting → it's on the team members' dashboards. Do not break this.
3. **No em dashes in user-facing copy.** Use `--` or rewrite.

## 4. Codebase facts — so you don't re-discover them

- **Schema:** `src/db/schema.ts`. A new table ALSO needs an idempotent
  `src/db/ensure-<x>.ts` (boot-time self-heal DDL — `DO $$ ... EXCEPTION WHEN
  duplicate_* THEN null; END $$;` pattern) **wired into `src/server.ts`** (grep
  `ensureMeetingHeadlinesTable` for the wiring pattern). Drizzle migrate is NOT
  used — the ensure-files are the migration mechanism.
- **`src/routes/pages/pages.ts` is 5000+ lines. NEVER read it whole** — grep to
  locate a handler, read only a narrow range. Subagents context-thrash and FAIL
  on whole-file reads of it. Key handlers: `GET /dashboard` (~3904),
  `GET /l8/meeting/:id` (~5158), `GET /team/:externalId` (~5540),
  `GET /me/todos` (~5664).
- **API routes:** `src/routes/api/*.ts`, each `export default async function
  xRoutes(app)`, registered in `src/server.ts` via
  `app.register(import('./routes/api/x.js'), { prefix: '/api/v1' })`.
- **Views:** `src/views/pages/*.ejs`. In any `<script>`, inject server values
  with `<%- JSON.stringify(x) %>` — NOT `'<%= x %>'`. A value with an
  apostrophe (e.g. a name) breaks the whole script otherwise. This bit us today.
- `l8-leadership.ejs` and `dashboard-daily.ejs` each have an `api()` fetch
  helper + `errMsg()`. `team-profile.ejs` had no JS — it's fine to add a small
  vanilla `fetch` IIFE.
- **Chart edits:** `PATCH /api/v1/team/entity` with body
  `{ type:'human'|'agent', externalId, patch:{ name?, role?, reports_to?, ... } }`.
  Writes the OOS YAML's latest draft, which the chart + pickers read live.
- **Owner/assignee pickers** (`availableOwners` on the meeting, `assignablePeople`
  on the dashboard) are built from `getOrgTeamGraph().nodes`. Value format
  `entityType:externalId:name`.
- **Verify:** `npx tsc --noEmit -p tsconfig.json` (0 errors) ·
  `npm run build` (0 errors) · EJS compile check:
  `node -e "require('ejs').compile(require('fs').readFileSync('src/views/pages/X.ejs','utf8'))"`.
- **Deploy:** `gh workflow run deploy.yml --ref main`, then
  `gh run watch <id> --exit-status`. Branch is `main`. Repo `david-steel/OTP`.
  Merging to main does NOT auto-deploy — the workflow_dispatch is required.
- **Bugs caught by reviewing diffs this session** (review every diff yourself):
  apostrophe-in-JS-string; a `Date` serialized to a 54-char string blowing a
  Zod `.max(40)`; an endpoint over-scoped to `meetingId` after data went
  team-scoped. Read the diff, do not trust subagent self-reports blindly.

## 5. THE BUILD — SHIPPED 2026-05-18

All three pieces (5A, 5B, 5C) shipped, each as its own deploy, plus a fourth
(5D, Shared KPIs) added after. Do NOT rebuild any of this. The original spec is
kept below for reference; each section has an **As built** note recording what
actually shipped and any decisions made.

### 5A. Accountability Gaps — make it actionable + filterable  [SHIPPED `fe90fa8`]

The `/dashboard` "Accountability Gaps" panel is read-only today. Upgrade it.

**Inline fixes** (per gap type, a button in the panel):
- *Seat with no measurable* → "+ Add KPI" / "+ Add Rock" — opens a small inline
  create form (or links to the create flow) pre-targeted to that seat as owner.
- *Work with no seat* → "Reassign" — a picker of real chart seats; PUT the
  rock/kpi/ticket's owner to the chosen seat.
- *Agent with no human above* → "Set manager" — pick a human seat, then
  `PATCH /api/v1/team/entity { type:'agent', externalId, patch:{ reports_to } }`.

**Filter** on the panel: `All · All Human · All Agents · Direct Reports · No Seat`.
- All Human / All Agents → gaps for human vs agent seats.
- Direct Reports → gaps for seats whose `reports_to` is the viewer's claimed seat.
- No Seat → the orphaned-work items (owners not on the chart).
- **CONFIRM with David what "No Seat" means** — prior session read it as orphaned
  owners; he may mean org members with no tile claimed.

> **As built (`fe90fa8`):** "No Seat" = orphaned-work owners (David's call).
> "+ Add KPI / + Add Rock" are inline create forms in the panel. Reassign and
> Set manager work as spec'd. KPI owner-reassignment also needed the KPI update
> schema + `updateKpi` service extended to accept `ownerEntityType` /
> `ownerExternalId` (rocks and tickets already supported it).

### 5B. People layer Phase 2 — Seat Fit + Values + People Review  [SHIPPED `5bed378`]

**Seat Fit** — periodic rating of a person against their seat.
- New table `seat_fit_reviews`: `id`, `orgId`, `seatExternalId` varchar(120),
  `period` varchar(20) (e.g. `'2026-Q2'`), `understands` / `wants` / `capacity`
  (pgEnum `seat_fit_rating` = `['yes','partial','no']`), `note` text,
  `ratedBy` varchar(255), `createdAt`, `updatedAt`. Unique
  `(orgId, seatExternalId, period)`. + `ensure-seat-fit.ts`, wire into server.ts.
- API: `GET/PUT /api/v1/seats/:externalId/fit` (mirror the existing
  `seats.ts` responsibilities routes — that file is your template).
- Surface: a Seat Fit block on `team-profile.ejs`; also feeds the grid below.

**Values** — the org's values + rating people on them.
- `org_values`: `id`, `orgId`, `name` varchar(120), `description` text,
  `position` int, `createdAt`. (The org's value list — ties conceptually to the
  operating plan's `foundation` section.)
- `value_reviews`: `id`, `orgId`, `seatExternalId`, `valueId` (FK org_values),
  `period` varchar(20), `rating` (reuse `seat_fit_rating` enum), `note`,
  `ratedBy`, `createdAt`. Unique `(orgId, seatExternalId, valueId, period)`.
- `ensure-values.ts`, wired into server.ts. API to CRUD values + write reviews.

**People Review grid** — a new page (route `GET /team/review`, view
`team-review.ejs`). A grid: each human seat (row) × each Value + the 3 Seat-Fit
axes (columns), showing the rating cells. A computed verdict per person:
solid / needs-conversation / wrong-seat. Editable inline (writes the review rows).

> **As built (`5bed378`):** One combined `ensure-people-review.ts` (enum + 3
> tables, ordered DDL) instead of separate ensure files. Seat Fit routes live in
> `seats.ts`; values + value-reviews in a new `values.ts`. The `/team/review`
> grid is humans-only, click-to-cycle cells, no-reload edits; values are managed
> inline on that page. Verdict: any `no` → wrong seat; all `yes` → solid; else →
> needs conversation; all unrated → not reviewed. Period keying via the shared
> `src/shared/period.ts` `currentPeriod()` helper ("Q2-2026"). Linked from the
> team chart toolbar.

### 5C. People layer Phase 3 — Delegate-and-Elevate + Founder-Dependency  [SHIPPED `7abe64c`]

**Delegate-and-Elevate** — computed, no new table. From `todos`: find recurring
to-dos (`recurrenceRule` set) one owner has held a long time, or owners carrying
a heavy recurring load. Surface a "hand-off candidates" panel on `/dashboard`
suggesting a lower seat or an agent to take it. Use `dueAtHistory` + `createdAt`.

**Founder-Dependency metric** — computed. The org's top human seat = the human
chart node with no `reports_to` (the CEO seat). Compute the % of open issues +
owned items (rocks/kpis/todos) whose owner is that top seat. Surface as a
dashboard tile and trend it over time (consider auto-feeding it as a KPI so the
Previous/Latest machinery tracks the trend). This is the number that proves the
agent army is absorbing operator load — David cares about it specifically.

> **As built (`7abe64c`):** Both panels computed inline in the `/dashboard`
> route, each in its own try/catch. Hand-off candidate = owner with ≥3 recurring
> to-do templates OR one held ≥90 days. Founder-Dependency = % of open work
> (rocks + KPIs + open issues + open to-dos) owned by the top human seat(s),
> healthy/high at a 50% threshold. NOT auto-fed as a KPI (a write on every
> dashboard GET would spam `kpi_values`) -- dashboard tile only.

### 5D. Shared KPIs — assign one KPI to several people  [SHIPPED `7c9bd5f`]

Added after 5C on David's request. Assign an existing KPI to additional people,
each with their own goal; the scorecard sums the goals and the actuals.
**Model:** `kpis.shared_group_id` (nullable) links per-person member KPI rows. A
KPI still has exactly one owner and one goal; "shared" is just a group key.
`kpi_values`, value entry, the formula engine, Tally and the MCP were
deliberately NOT touched -- every existing path still sees each member as an
ordinary KPI.
- `ensure-kpi-shared-group.ts` adds the column. `assignKpiToOwner()` +
  `unshareKpi()` in `kpi.ts`. `POST /api/v1/kpis/:id/assign` and `/unshare`.
- The `/dashboard/kpis` route computes per-group rollups; `dashboard-kpis.ejs`
  has a "Shared KPIs" section (summed goal + summed latest + per-person
  breakdown), a "+ person" control on every KPI row, and an assign panel.
- **v1 scope:** the rollup is the Shared KPIs summary section. The main
  scoreboard grid still lists each member KPI as its own flat row -- a
  fully-nested parent/child grid inside the grid itself is the v2 polish.

## 6. Build workflow (this is what worked all session)

Wave-based, fresh subagent per task:
1. **Wave 1 — schema:** one task — all new tables in `schema.ts` + the
   `ensure-*.ts` files + `server.ts` wiring. Verify typecheck.
2. **Wave 2 — API + routes (parallel):** one task per file — new API route
   files; `pages.ts` route changes. Each subagent: reads its file(s) fresh,
   follows existing patterns, runs typecheck, touches 1-3 files max.
3. **Wave 3 — views (parallel):** one task per `.ejs` file.
4. **Verify:** typecheck + `npm run build` + EJS compile each changed view.
5. **Review the diff yourself** (`git diff`) for real bugs — see §4.
6. **Commit** (only the files in the plan; end the message with the
   `Co-Authored-By` line) and **deploy** (§4), watch the run to green.
7. Present a tight plan to David before executing each piece; he approves fast.

## 7. Future backlog — captured so it is not lost

Not in this build, but spec'd as the road to the north star:
- **Process component** — documented core processes per org, handed to agents to
  execute. The last missing EOS leg after the People layer. OTP's killer angle.
- Rocks genuinely *generated from* the 1-Year Plan / 90-day execution window
  (the link columns exist; the generation flow does not).
- Quarterly + Annual session agendas (only the weekly meeting exists).
- Coach cockpit depth: per-client adoption curve, cross-practice benchmarking,
  session mode, per-client agent configuration.
- Visionary: idea parking lot separate from Issues; 3-Year-Picture live gap;
  relationship portfolio.
- Shared KPIs v2: render the rollup as nested parent/child rows inside the main
  scorecard grid (5D v1 shows it as a separate summary section).

## 8. North star

Keep building until the honest answer to *"what else would the Integrator,
Visionary, and Implementer want from this system?"* is: **"Nothing structural —
it is a complete operating system, ready for AI agents to take seats alongside
people."** Not before. Track toward it; do not declare it early.

## 9. State of the repo right now

All work through 2026-05-18 is committed and deployed. Latest `main` commits:
`fe90fa8` (5A), `5bed378` (5B), `7abe64c` (5C), `7c9bd5f` (5D Shared KPIs) --
all four deploys green. The working tree still shows unrelated pre-existing
uncommitted churn (`.env.example`, `CLAUDE.md`, `public/*.css`, migration meta,
loose `scripts/*.ts`) — that is NOT build work; do not commit it. Commit only
the files you change. (This brief itself is now version-controlled.)

Handler line numbers in §4 have shifted as `pages.ts` grew — always grep, never
trust the numbers.
