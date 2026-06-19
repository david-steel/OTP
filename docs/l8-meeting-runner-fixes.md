# OTP L8 Meeting-Runner Fixes — Build Handoff

**Origin:** 2026-06-01, first live OTP-run David+Dan L10. David rated it 6/10. The meeting-runner must be flawless before any client uses it ("no room for error / we can't lose here"). Spec also lives as an OTP ticket on the Dan L10 team (065d1d4b).

**How to run #6:** fresh session, `/build using docs/l8-meeting-runner-fixes.md`. Read PRODUCT.md + DESIGN.md before UI. Verify: `npx tsc --noEmit`, boot `npx tsx watch --env-file=.env`, exercise the flow. Deploy is MANUAL: commit ONLY the files you changed (working tree has unrelated uncommitted changes — never `git add -A`), `git push origin main`, `gh workflow run deploy.yml --ref main`, `gh run watch <id> --exit-status`.

---

## THE REAL STORY: one crash impersonated six bugs

The whole "nothing works" report traced to a **duplicate `const FOCUS_KEY`** in the l8-leadership.ejs inline script (l.1186 sessionStorage focused-attendee + l.1364 localStorage focus-mode) = `Uncaught SyntaxError` at parse time. The ENTIRE page script never executed, so NO handlers attached — Start, End, Segue-save, timer, focus, scorecard-edit all dead with zero surfaced errors. Fixed in commit d63cd98 (renamed to `FOCUS_MODE_KEY`). David confirmed start/save work after deploy.

### DONE + deployed
- **FOCUS_KEY crash** (d63cd98) — the real root cause. Confirmed fixed in browser.
- **Start/End error handling** (bbddcf9) — buttons now alert on failure instead of silent no-op. Keep.
- **Founder auth hardening** in checkMeetingEdit (bbddcf9) — legacy founder (org.clerkOrgId === Clerk userId) can always edit own org's meeting. Was NOT the bug (debug-auth proved David's session resolved perfectly: founder + owner role + on team + attendee), but correct hardening (API gate now agrees with the page resolver). Keep.
- **Ticket scoping** (dd3bd83) — page IDS (pages.ts:3219) was ALWAYS team-scoped; the leak was only the API. `GET /tickets` ignored the `teamId` param → returned org-wide. Fixed: now filters by teamId (`teamId=none/null` → IS NULL).
- **mobile-web-app-capable meta** (0b5929c) — cleared a console deprecation warning.
- Temporary `/meetings/:id/debug-auth` diagnostic added then removed (9ebaef2) — gone from prod.

### RESOLVED BY THE CRASH FIX — re-test, do NOT rebuild
All already built; dead only because the script didn't run (verified by reading):
- **Timer / focus** — `chips = Array.from(querySelectorAll('.agenda-chip'))` is safe; handlers (~1354-1411) just never attached.
- **Segue save** — handler ~1470-1513 exists; mechanism verified via API on 6/1 (check-in persisted + read back clean).
- **Manual scorecard entry** — ALREADY BUILT: l8-leadership.ejs:478-492 (click-to-edit KPI cell, `data-kpi-input`, Save/Cancel) + JS handler ~1703.
- **Agenda order + Customer/Employee Headlines** — ALREADY CORRECT: chips l.316-322 in exact EOS order; the "Customer & Employee Headlines" section exists at l.608 (`id="headlines"`, header l.609). "Skipped" was a navigation symptom of the dead script.
→ Click-test each once in a live meeting. Expected: all work. Rebuild nothing unless a click-test actually fails.

---

## THE ONE GENUINELY UNBUILT FEATURE

**Item 6 — Manual rock numbering** (owner sets display order for the Rock Review). Schema change → clean session. Exact edits (anchors verified 6/1):

1. **src/db/schema.ts** rocks table — after `nextActionSetAt: timestamp('next_action_set_at'),`, before `createdBy`: add `position: integer('position'),` (`integer` already imported, l.6).
2. **src/db/ensure-kpis-rocks-team.ts** — append to the `DDL` array (after the `rocks_team_idx` CREATE INDEX): a `DO $$ BEGIN ALTER TABLE "rocks" ADD COLUMN "position" integer; EXCEPTION WHEN duplicate_column THEN null; END $$;` block. Already wired into boot; idempotent; safe.
3. **src/routes/api/rocks.ts**:
   - l.2 import: `import { eq, and, desc, asc, sql, isNull } from 'drizzle-orm';` (add asc, sql)
   - `updateRockSchema` (l.30): add `position: z.number().int().nullable().optional(),`
   - PUT handler (after the `nextAction` block ~l.176): add `if (d.position !== undefined) updates.position = d.position;`
   - GET /rocks list `.orderBy(desc(rocks.dueDate))`: → `.orderBy(sql\`${rocks.position} asc nulls last\`, asc(rocks.dueDate))`
4. **src/routes/pages/pages.ts** orgRocks query (l.3209 `.orderBy(desc(rocks.dueDate))`): same change (`asc`+`sql` already imported l.5). Align meetings.ts:184 (buildRocksSnapshot) too for consistency.
5. **UI** in l8-leadership.ejs rocks section (~l.517): add a small number input per rock card; on save `PUT /rocks/:id { position: N }` then `reloadKeep()`. Mirror the existing rock "move-to-team" handler (~l.1671). A number input is enough — drag-drop NOT required.

Sort semantics: numbered rocks first (position asc), un-numbered after (nulls last) by soonest due date.

Verify: `npx tsc --noEmit`; set positions via API + GET the meeting to confirm order; then click-test the UI.

---

## Lesson (memory: feedback_dead_page_means_parse_error_check_console_first)
When every control is dead with no surfaced errors, it's a parse-time SyntaxError — get the browser console FIRST. Don't deploy a fix on a hypothesis. (Cost 2 wasted deploys chasing an auth theory the server never had.)
