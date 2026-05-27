# OTP Single-Tenant Audit — 2026-05-27

**Owner:** David Steel
**Trigger:** Kristen's first L10 (2026-05-26) surfaced 4 distinct leaks of the
same shape (single-tenant assumption never swept). This audit greps for
every recurrence of that pattern so the next external user doesn't catch
the next one live.

**Method:** Five greps + targeted reads. Cross-referenced against yesterday's
4 commits to find what still bleeds.

---

## P0 — Direct data leak to invited org members

### 1. `/dashboard` STILL hardcodes `HUM_DAVIDSTEEL` (same bug as /me/todos)

- **File:** `src/routes/pages/sections/dashboard.ts:2032-2036`
- **Code:**
  ```ts
  const ownerCandidates = Array.from(new Set([
    ...claimedIds,
    ...(member?.email ? [member.email] : []),
    'HUM_DAVIDSTEEL',  // canonical human tile for the org owner;
                       // expand when org_members carries this mapping
  ].filter(Boolean) as string[]));
  ```
- **What an external user sees:** Kristen on `/dashboard` gets her own todos
  UNIONED with David's todos. Every Watchdog/Pulse/Dash alert pushed to
  HUM_DAVIDSTEEL shows up in her dashboard list.
- **Fix:** Same pattern as the `/me/todos` fix in commit `c92154b`. Resolve
  the requester's claimed seats from `org_members.claimedEntityIds`; only
  fall back to `'HUM_DAVIDSTEEL'` when `clerkOrgId === auth.userId` (legacy
  founder). Otherwise no founder-id union.
- **Effort:** ~10 min (literal copy of yesterday's pattern).
- **Severity:** P0 — active leak.

### 2. `/api/v1/team/:externalId/profile` returns ANY tile's data

- **File:** `src/routes/api/team-profile.ts:14-40`
- **Code:** Returns rocks/todos/tickets where `ownerExternalId === <param>`.
  Only auth gate is `getAuthOrg` (must be in the org). No `canViewTile`
  check.
- **What an external user sees:** Kristen can hit
  `/api/v1/team/HUM_DAVIDSTEEL/profile` directly and get a full data dump
  of David's accountability profile — open rocks, all todos including
  done ones, all issues. Org-chart view-scoping (deployed in
  `2d9358b`) does NOT protect this endpoint.
- **Fix:** Gate with `canViewTile` from `services/chart-permissions.ts`.
  If the requesting member can't view this tile, 403/404.
- **Effort:** ~15 min.
- **Severity:** P0 — direct URL leak. Same shape as the chart scoping bug.

### 3. `/team/:externalId` PAGE renders the same leaked data

- **File:** `src/routes/pages/pages.ts:3432-3457`
- **Code:** Server-side renders rocks/todos/tickets for any externalId
  param. Same query shape as #2, same missing gate.
- **What an external user sees:** Same as #2 but via the HTML page. Kristen
  navigates to `/team/HUM_DAVIDSTEEL` and sees David's accountability
  profile rendered.
- **Fix:** Same as #2 — gate with `canViewTile`. Return 404 if not viewable.
- **Effort:** ~10 min (do at the same time as #2).
- **Severity:** P0 — direct URL leak.

---

## P1 — Authorization gaps & resolver drift

### 4. Resolver drift still exists in `src/routes/api/team.ts`

- **Files using `clerkOrgId === auth.userId` (legacy founder shortcut):**
  `team.ts`, `meetings.ts`, `pages.ts`
- `meetings.ts` was fixed yesterday (commit `4f3511e`).
- `pages.ts` partially fixed (specific routes), some still use the shortcut.
- **`team.ts` is the one I'm flagging** — needs verification that its API
  write gates also honor `org_members`, not just legacy founders. If they
  don't, invited managers/managees can't edit anything they should be able
  to.
- **Effort:** ~30 min to audit each call site + apply the org_members
  fallback pattern.
- **Severity:** P1 — blocks invited-member writes (mirrors Kristen's segue
  bug pre-fix).

### 5. `/api/v1/team/members` enumerates every member

- **File:** `src/routes/api/team.ts:629`
- **What it returns:** Every org member row — emails, names, roles, claim
  state. Anyone in the org can list everyone.
- **Risk level:** Lower than #1-3 (no rocks/todos contents leak), but
  confirms the surface. Sneeze It teammates seeing each other's emails is
  probably fine; future customers may not want their seat-fit ratings or
  termination history visible to peers.
- **Fix:** Decide scope. Options: open (current), org-wide for managers+
  only, team-bounded for non-managers.
- **Effort:** ~20 min once scope decided.
- **Severity:** P1 by configurability, not by current leak.

### 6. Sibling chart surfaces still serve unfiltered graph

- **Files:** `team-review` (pages.ts:3350), `me-todos` delegation picker
  (pages.ts:3822), `l8-leadership` owner picker (pages.ts:3180),
  `/graph` (pages.ts:282).
- **What an external user sees:** When Kristen creates an L10 todo, the
  "assign to" dropdown lists every human + every agent in the entire org
  — including agents she shouldn't even know exist per yesterday's chart
  scoping rules.
- **Fix:** Filter each `availableOwners` / `assignablePeople` /
  `teamGraph.nodes` list through `computeViewableTiles`.
- **Effort:** ~20 min per surface × 4 surfaces = ~1.5 hr total.
- **Severity:** P1 — undermines the org-chart scoping fix from yesterday.
  If Kristen can pick "any agent" as a delegate she also knows that agent
  exists.

---

## P2 — UI/API contract mismatches (resolved 2026-05-27)

These haven't fired live yet (no one's tried them with short input). Each is
a latent "Add failed: invalid X data" mid-meeting waiting to happen.
Reviewed and triaged 2026-05-27:

| File:line | Field | Schema | UI surface | Decision |
|---|---|---|---|---|
| `api/inquiries.ts:16` | `subject` | `min(2)` | Server-built (pricing.ejs:279 builds "[Paid plan inquiry] X - Y") | **Leave** — never reaches via UI |
| `api/inquiries.ts:17` | `message` | `min(10)` | `expert-contact.ejs` textarea, `required` only | **Relaxed → min(1)** |
| `api/source-documents.ts:12` | `content` | `min(10)` | No user-facing create form found | **Leave** — admin/API-only path |
| `api/meetings.ts:26` | meeting `title` | `min(3)` | `l8-list.ejs` form, `required` only | **Relaxed → min(1)** |
| `api/meetings.ts:37` | update `title` | `min(3)` | In-place title editor on L8 page | **Relaxed → min(1)** (match create) |
| `api/workspaces.ts:11` | workspace `name` | `min(2)` | `dashboard-workspaces.ejs`, `required` only | **Relaxed → min(1)** |
| `api/consultants.ts:10` | `displayName` | `min(2)` | No CREATE form (display-only profile pages) | **Leave** — profile field, not a form |

**Net shipped:** 3 real schema relaxations (inquiries.message, meetings.title
create + update, workspaces.name). The other 3 are correctly strict
(server-built, no UI, profile field). Audit doc over-flagged on initial
scan — corrected here. Shipped 2026-05-27 in commit `<TBD>`.

**Severity:** P2 — latent mid-meeting fires (now closed).

---

## P3 — Placeholder comments (resolved 2026-05-27)

Re-triaged 2026-05-27:

- `dashboard.ts:2031` (`Future: derive HUM_ id from member claim`) — **STALE.**
  The code was fixed this morning in commit `874f7fd`. Comment was updated
  to reflect new reality (founder-only fallback documented).
- `starter-chart.ts:175-181` — **NOT a placeholder.** This is historical
  context explaining why the email/name dedupe logic exists (caught the
  HUM_DAVIDSTEEL_1 duplicate bug 2026-05-24). The comment correctly
  documents an active bug fix. **Leave.**
- `chart-claim-reconcile.ts:24-28, 148-153` — **NOT a placeholder.** Same
  shape: documents the Bogdan/David Clerk-row chart drift the file was
  written to fix. Historical context, not a debt note. **Leave.**

**Net shipped:** 1 comment update in dashboard.ts. The other 2 were
audit doc misreads — they document real fixes, not future work.

**Severity:** P3 — code documentation hygiene (now accurate).

---

## Meta-finding: the pattern itself

Every P0 above is the SAME bug: code written under "the only user is the
founder" assumption that became false the moment Kristen joined. The fixes
follow the same template:

1. Resolve `request.orgMember` (the invited-member path).
2. Fall back to legacy-founder ONLY when `clerkOrgId === auth.userId`.
3. Filter data by `claimedEntityIds` OR `canViewTile` OR `computeViewableTiles`.

This template is now canonical. Anywhere a route still says "founder only"
or "everyone in the org" is a candidate for the next leak.

---

## Recommended order if shipping today

If David ships ALL of P0 today (the three direct leaks), ~35 min of work:

1. `c[NEXT]` — `/dashboard` HUM_DAVIDSTEEL union → multi-claim resolution
2. `c[NEXT]` — `/api/v1/team/:externalId/profile` + page route → `canViewTile` gate

P1 (sibling chart surfaces + resolver drift in team.ts) ~ next session, ~2 hr.

P2 (UI/API mismatches) — sweep at next L10 prep.

P3 — clean up after P0/P1 stabilize.

---

## How to run this audit again later

The five greps live at the top of this file's git history. When the next
new class of user is about to be invited (first paid client, first partner-
org, first coach managing multiple orgs), re-run:

```bash
# 1. Hardcoded IDs
grep -rn "HUM_[A-Z]" src/ | grep -v test

# 2. Placeholder comments naming future revisits
grep -rnE "// (V1|v1)[:\.]|placeholder|hardcode|until org_members" src/

# 3. Cross-tenant queries (no owner/team scope)
grep -rnE "from\(\s*(todos|rocks|tickets|kpis)\s*\)" src/routes/

# 4. Resolver drift
grep -rln "clerkOrgId === auth.userId" src/

# 5. UI/API contract checks
grep -rnE "\.min\([2-9]\)|\.min\(10\)" src/routes/api/
```

Each grep produces a short list. Each list item gets the same triage:
who sees what, what they shouldn't see, fix template, effort.

---

_Generated 2026-05-27 08:50 ET by Dan (Strategic Co-Founder) at David's
request after Kristen's first L10 surfaced 4 single-tenant leaks. Method
documented above so future audits don't re-discover._
