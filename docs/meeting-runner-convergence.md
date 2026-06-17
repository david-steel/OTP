# Meeting runner convergence — plan + regression contract

**Decision (2026-06-17, David):** converge to ONE structure-driven meeting runner.
Each section type is ONE rich component (`partials/meeting/<type>.ejs`) used
identically in built-in (L8/L10) and custom-format meetings; built-in meetings
become canonical seeded `MeetingSection[]`. Every meeting fix then lands once,
everywhere.

Gating note that reorders the work: the **built-in L8/L10 meeting is NOT behind
the `meeting_formats` lab flag** — it is live for every org. Only the custom
format feature is gated. Therefore the convergence is sequenced so the live
`l8-leadership.ejs` is the LAST thing touched, after the shared partials are
proven byte-identical inside the gated custom runner.

## Current state (verified against code, 2026-06-17)
- Section vocabulary + reference binding + snapshot-on-create: shared + correct
  (`src/shared/meeting-sections.ts`).
- Built-in runner: `/l8/meeting/:id` → `src/views/pages/l8-leadership.ejs`
  (3,444 lines; sections inline 388–1143; ~1213–3444 is document-level
  event-delegated JS). Section blocks:
  - segue 388–445, scorecard 448–571, rocks 574–764, headlines 767–817,
    todos 820–877, ids 880–1053, conclude 1080–1143.
  - **Hazard:** these blocks reference vars declared ABOVE line 388 in the
    template body (`normalizedAttendees`, `humanAttendees`, `savedRatings`,
    `_rockChanges`, `_rockMs`, …) that are NOT render locals. EJS includes do
    not inherit parent-scope vars → any extracted partial needs an explicit
    props contract or it 500s at runtime (compile-clean but undefined-at-render).
- Custom runner: `/l8/run/:id` → `src/views/pages/meeting-run.ejs` (8KB): renders
  data-linked sections as facilitator-note + deep-link + generic notes box
  (no embedded live components).

## Sequence (revised — live template last)
- **Inc 0 (this doc)** — regression contract. DONE.
- **Inc 1** — author shared `partials/meeting/<type>.ejs` + a `meetingSectionProps`
  helper that resolves each section's data from render locals. Built additively;
  does NOT modify `l8-leadership.ejs` yet.
- **Inc 2** — gated custom runner renders the shared partials with live data
  (route resolves scorecard/rocks/issues/todos; partials embed, not link).
  Prove the full behavior here, behind the flag.
- **Inc 3** — unify persistence (built-in meeting state vs custom `runState`).
- **Inc 4** — seed built-in L8/L10 as canonical `MeetingSection[]` (+ unit test
  == today's agendas).
- **Inc 5** — cutover: point built-in L8/L10 at the shared partials, retire the
  monolith orchestration, collapse `/l8/meeting` vs `/l8/run` into one path.
  THIS is the only step that changes the live meeting; done once, proven.
- **Inc 6** — cleanup, docs, tests.
- **Out of first pass:** `strategy-reset-meeting.ejs` (72KB), `onboarding-meeting.ejs`
  converge after L8/L10 prove the pattern.

## Regression contract — behaviors that MUST hold after every step
Pass/fail gate. Each behavior is currently provided by `l8-leadership.ejs`
markup + its document-delegated JS handlers; the shared partials + runner must
preserve all of them. (Verify on a real meeting behind the flag — authed pages
can't be auto-rendered offline.)

### Per section type
- **segue** — per-attendee check-in capture; "checkins done" count; saves.
- **scorecard** — live KPIs vs goal; previous-value display; editable KPI value
  (event-delegated, persists); off-track → flag-to-issue. **KPI snapshot:
  mid-meeting saves must re-snapshot while in_progress (the 2026-06-04/06-11 fix
  — do not regress the frozen-snapshot behavior).**
- **rocks** — live rocks on-track/off-track; add quarterly priority; "changed
  this meeting" provenance; SMART brief read-only; milestone + assigned to-dos.
- **headlines** — add headline (delegated, `#add-headline` inside `#headlines`);
  mark headline addressed; headlines notes textarea persists.
- **todos** — to-dos filtered to this meeting; done/not-done; capture new;
  carry-to-issue / carry-to-rock; attachments carry.
- **ids (issues)** — add issue; identify/discuss/solve actions; solve appends to
  cascading message.
- **conclude** — per-attendee ratings incl. **absent** toggle (absent saves
  correctly — 2026-06-?? fix); rating average; save-ratings; cascading message
  (save / rebuild-from-meeting / cascade-to-team).

### Cross-cutting
- Per-section timer + **shared timer sync** (whole room sees one clock).
- Agenda rail nav (`.agenda-chip[data-section=...]`), `goToSection`.
- Meeting lock (future-dated occurrence renders read-only).
- Stepper mode (Labs `meetings_broken_out`): one section at a time.
- In-meeting tools open as iframe overlay; What's-New megaphone.
- Recurrence roll-forward of titles.

### How to verify each increment
1. `node -e "ejs.compile(...)"` on every touched template (catches parse errors).
2. `npx tsc --noEmit` (catches route/type breakage).
3. Behind the flag on prod, David runs a real custom meeting and walks every
   section against the list above. Built-in meeting is only re-pointed at the
   shared partials in Inc 5, after the partials are proven here.
