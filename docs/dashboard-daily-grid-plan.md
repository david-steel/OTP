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

## Layout — APPROVED (David, 2026-06-05)

**Decision:** span follows content volume. **Text-heavy tiles (To-Dos, IDS, plus
Scorecard and Rocks) span two-thirds; low-text tiles (Upcoming Meeting,
Headlines) span one-third.**

That yields four heavy tiles and two light ones — which don't pair evenly into
12-col rows. To honor the rule with no awkward empty gaps, use a **2/3 main rail
+ 1/3 sidebar**: heavy cards stack down the wide rail, light cards in the narrow
sidebar. Same thirds feel, full width, no holes.

Container becomes `max-w-screen-2xl`, grid `grid grid-cols-12 gap-5`.

```
┌───────────────────────────────────────────────────────────────┐
│ Greeting + date + (API nudge banner)                full width │
├───────────────────────────────────────────┬───────────────────┤
│ SCORECARD (KPIs)              2/3 (span 8)  │ TODAY      1/3 (4) │
│  weekly grid needs the width                │  today's meeting  │
├─────────────────────────────────────────────┤  + Start          │
│ QUARTERLY PRIORITIES (Rocks)  2/3 (span 8)  │  Upcoming (N) ▾   │
│  each rock shows "Next: ___" inline          ├───────────────────┤
├─────────────────────────────────────────────┤ HEADLINES  1/3 (4)│
│ TO-DOS (color-coded)          2/3 (span 8)  │                   │
│  overdue=red, soon=amber                     │                   │
├─────────────────────────────────────────────┤                   │
│ ISSUES / IDS                  2/3 (span 8)  │                   │
└─────────────────────────────────────────────┴───────────────────┘
```

Mechanically: a `col-span-8` main `<div>` holding Scorecard → Rocks → To-Dos →
IDS, beside a `col-span-4` sidebar holding Today → Headlines. The sidebar can be
`sticky top-...` so Today/meeting stays in view while you scroll the heavy rail.

If during build the sidebar looks too empty next to four tall cards, the fallback
is to let To-Dos and IDS go full-width (span 12) at the bottom — but we try the
rail+sidebar first.

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

## Decisions / open questions

1. **Layout & spans** — DECIDED 2026-06-05: heavy = 2/3, light = 1/3, via a 2/3
   main rail + 1/3 sidebar (see Layout above).
2. **Scorecard width** — DECIDED: 2/3 (heavy). Lives top of the main rail.
3. **Next Actions** — DECIDED earlier: remove the standalone hero, inline "Next:"
   on each rock; color-code To-Dos by state. (Confirm still good.)
4. **Density** — open: comfortable cards (current padding) or tighter to fit more
   above the fold? Default: keep current padding.
5. **Scope** — open: Daily only for now, or also bring tiles to the live
   meeting-runner page (`l8-leadership.ejs`) later? Default: Daily only first.
