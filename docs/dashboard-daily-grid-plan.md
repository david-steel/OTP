# Plan: Regrid the Daily dashboard into a full-width tile layout

**Status:** Draft for approval (2026-06-05)
**Surface:** `src/views/pages/dashboard-daily.ejs` (the "Daily")
**Why now:** David flagged the Daily is too tall — a single `max-w-6xl` column of
stacked full-width sections you scroll forever. Ninety's operating view uses the
full frame in thirds (some tiles merged) and reads far cleaner. We want the same
*information architecture* (glanceable, full-width, tiled), rendered in OTP's own
design language — not a Ninety look-alike.

This plan is the **frame** that three earlier asks fold into:
- #1 Meetings: today + an "Upcoming" disclosure → becomes the Meeting tile.
- #2 Next Action / To-Dos confusion → fixed inside the Rocks and To-Dos tiles.
- (#3 meeting types and #4 the cadence "?" already shipped on the L8 list.)

---

## Current state

- Container: `<div class="max-w-6xl mx-auto px-4 py-8">`, one column.
- Stacked `<section class="... mb-6/mb-8">` cards, top to bottom:
  Meeting → **Next Actions** (standalone hero) → Headlines → Rocks (My Quarterly
  Priorities) → KPIs (Scorecard) → To-Dos → Issues.
- The Meeting section already has an upcoming/past `details` split, but it sits in
  the tall stack so it still eats vertical space.
- "Next Actions" is a non-EOS GTD hero added 2026-05-25; visually it duplicates
  the To-Dos card (the core of David's #2 complaint).

## Goal

A full-width responsive **12-column tile grid**. Everything important visible
without scrolling on a laptop. Each card is self-contained; some span a third,
some two-thirds, the header spans full. Mobile collapses to a single column in a
deliberate priority order.

Density is fine here: `DESIGN.md` allows expressive whitespace on marketing pages
but **restraint/density on app surfaces**. The Daily is an app surface. We keep
OTP's palette, the orgy section icons, and card styling — just lay them out wide.

---

## Proposed layout (desktop ≥ lg)

Container becomes `max-w-screen-2xl` (near full-bleed, with gutters), grid
`grid grid-cols-12 gap-5`.

```
┌───────────────────────────────────────────────────────────────┐
│ Greeting + date + (API nudge banner)                full width │
├───────────────────────────┬───────────────────────────────────┤
│ TODAY                      │ SCORECARD (KPIs)                   │
│  • today's meeting + Start │  weekly grid needs the width       │
│  • Upcoming (N) ▾          │  span 8                            │
│  span 4                    │                                    │
├───────────────────────────┼───────────────────────────────────┤
│ TO-DOS (color-coded)       │ QUARTERLY PRIORITIES (Rocks)       │
│  overdue=red, soon=amber   │  each rock shows "Next: ___" inline│
│  span 4                    │  span 8                            │
├───────────────────────────┴───────────────┬───────────────────┤
│ ISSUES (IDS)                  span 8       │ HEADLINES  span 4  │
└────────────────────────────────────────────┴───────────────────┘
```

Spans are a starting point, not gospel — see Open Questions.

### How #1 folds in (Meeting tile = "Today")
- Show **today's** meeting(s) prominently with a Start/Open button.
- Everything else behind **"Upcoming (N) ▾"** (reuse the existing `details`
  disclosure already in the section). Past behind its own sub-disclosure.
- Result: the tile is short by default, expands on demand.

### How #2 folds in (kill the Next Actions duplicate)
- Remove the standalone **Next Actions** hero section.
- Surface the next action **inline on each Rock** in the Rocks tile: a small
  "Next: <action>" line under the rock (data already exists: `rock.nextAction`).
  Same for Issues that carry a next action.
- **Color-code To-Dos** by state in the To-Dos tile: overdue = red, due ≤2 days =
  amber, done = muted/strike. That gives the at-a-glance signal the Next Actions
  hero was groping for, without a second list.
- Net: one to-do list, and each rock owns its own next step. Less duplication,
  more EOS-clean.

---

## Responsive behavior

- **lg+ (≥1024px):** 12-col grid as above.
- **md (768–1023px):** 2-col — pair tiles (Today + To-Dos in one column,
  Scorecard + Rocks stack in the other), or simpler: everything spans 6.
- **sm (<768px):** single column, priority order:
  1. Today (meeting) 2. To-Dos 3. Rocks 4. Scorecard 5. Issues 6. Headlines.
  (What you act on first goes first; the scorecard is wide so it drops below the
  fold on phones anyway.)

---

## Build approach (low-risk, incremental)

The page is 2107 lines; we are **rearranging containers, not rewriting cards**.

1. **Extract each section into a partial** (`partials/daily/meeting.ejs`,
   `…/scorecard.ejs`, `…/rocks.ejs`, `…/todos.ejs`, `…/issues.ejs`,
   `…/headlines.ejs`). Pure cut/paste, no logic change. Lets us verify nothing
   broke before touching layout, and shrinks the monster file.
2. **Wrap them in the grid** with span classes. Tailwind only; mirror class
   combos already in the file so JIT purge keeps them (per the known purge
   gotcha — copy working combos, don't invent).
3. **Fold in #1/#2** (meeting collapse, remove Next Actions hero, inline Next on
   rocks, color-code todos).
4. Screenshot-verify at lg / md / sm before ship (Playwright viewport emulation;
   headless Chrome min-width caveat noted in memory).

Each step is independently shippable.

---

## Trademark / brand notes

- Keep EOS®/Level 10® genericized or attributed in any new visible copy
  ("Quarterly Priorities," "Weekly Leadership Meeting").
- Use OTP palette + existing orgy section icons; this is a layout change, not a
  reskin. No dark mode (David reads dark as "AI-generated").

---

## Effort

| Step | CC+gstack |
|------|-----------|
| Extract sections to partials | ~20 min |
| Grid wrap + spans + responsive | ~30 min |
| #1 meeting collapse + #2 todos/next-action | ~30 min |
| Screenshot QA at 3 breakpoints | ~15 min |

Roughly a focused session, shippable in pieces.

---

## Open questions for David (taste calls)

1. **Tile priority / spans** — is "Today + Scorecard" the right top row, or do you
   want Rocks up top? What's the first thing you want your eye to hit?
2. **Scorecard width** — the weekly KPI grid is wide. Span 8 (two-thirds) or full
   width on its own row?
3. **Next Actions** — confirm: remove the hero entirely and inline "Next:" on each
   rock? Or keep a slim "Today's focus" strip at the very top?
4. **Density** — comfortable cards (current padding) or tighter to fit more above
   the fold?
5. **Scope of the regrid** — Daily only for now, or also bring the same tile
   treatment to the live meeting-runner page (`l8-leadership.ejs`) as a follow-up?
