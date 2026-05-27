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

## P2 — UI/API contract mismatches (same shape as yesterday's tickets bug)

These haven't fired live yet (no one's tried them with short input). Each is
a latent "Add failed: invalid X data" mid-meeting waiting to happen.

| File:line | Field | Schema | UI promise (check) |
|---|---|---|---|
| `api/inquiries.ts:16` | `subject` | `min(2)` | likely placeholder; verify form |
| `api/inquiries.ts:17` | `message` | `min(10)` | verify form copy |
| `api/source-documents.ts:12` | `content` | `min(10)` | doc-import surface |
| `api/meetings.ts:26` | meeting `title` | `min(3)` | UI accepts any non-empty? |
| `api/workspaces.ts:11` | workspace `name` | `min(2)` | UI lets you type "X"? |
| `api/consultants.ts:10` | `displayName` | `min(2)` | partner signup form |

**Fix pattern:** For each row, open the EJS form, see if the UI hint matches
the schema. If UI promises less, relax schema to match (rate limiter is the
spam control, not min-char rules — same logic as the tickets fix in
commit `4f3511e`).

**Effort:** ~5 min per row to verify + relax. ~30 min total.

**Severity:** P2 — latent mid-meeting fires.

---

## P3 — Placeholder comments still naming a future revisit

Each is a debt note David wrote to himself that's still outstanding.

- `dashboard.ts:2031`: "Future: derive HUM_ id from member claim" — same as P0 #1.
- `starter-chart.ts:180`: HUM_DAVIDSTEEL backfill logic, single-tenant assumption.
- `chart-claim-reconcile.ts:28,153`: Bogdan/David Clerk-row reconciliation specifically.

**Fix:** Once #1 is fixed, these become low-priority cleanup. Mark resolved
when the canonical "derive HUM_id from claim" pattern lands.

**Severity:** P3 — code smell, not active leak.

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
