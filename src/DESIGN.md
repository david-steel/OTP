# OTP Design Spec (`src/`)

The one bar every OTP app page is built and polished to. Read this before any visual or UI change in `src/`. (Orger has its own separate spec at `orger/DESIGN.md` — do not mix them.)

This spec exists because our capability is ahead of our polish. Competitors like success.co win on presentation, not product. "Clean" is not talent, it is restraint applied consistently. The rules below are how we get clean.

---

## 1. Philosophy

- **Light, warm, editorial.** Never a dark default. Dark UI reads as "AI generated" and is off-brand.
- **Restraint is the product.** Neutral chrome, color only where it carries meaning, one clear action per screen, generous whitespace.
- **One repeated component beats ten clever ones.** Coherence comes from sameness, not variety.
- **Don't make me think.** Each screen has exactly one obvious primary action and an unmistakable hierarchy.

## 2. Color (tokens already in `tailwind.config.js` + `src/styles/input.css`)

Use the tokens. Do not hand-pick hex values in pages.

| Role | Token / value | Use for |
|------|---------------|---------|
| Page background | `--orgy-bg` `#F5F7FA` | the warm light app background (never white app bg, never gray-100 cold) |
| Surface | white cards on the warm bg | cards, panels, rows |
| Ink (primary text) | `#14271a` family / `text-[var(--ink)]` | headings, primary text |
| Ink soft / mute | `--ink-soft` / `--ink-mute` | body and secondary/meta text |
| Brand green | `orgy` `#A8E63A`, `deep #8BC42A`, `on-light #5a7d1f`, `tint rgba(168,230,58,.08)` | brand accents, Ollie, positive emphasis, subtle tints |
| Primary action | `orgy-blue` `#2563EB` (`deep #1d4ed8`, `soft #E6F0FF`) | the ONE primary button per screen, links |
| On-track | `#16a34a` on `#dcfce7` | status pills, scorecard heatmap |
| Off-track | `#dc2626` on `#fee2e2` | status pills, overdue, heatmap |
| Watch / warn | `#d97706` on `#fef3c7` | watch status, medium priority |

**Hard rules:**
- **Never `#000` or `#fff` or cold grays** (gray-400/500 etc.). Use the ink and warm-neutral tokens.
- **Color = meaning.** If a color is not communicating status, brand, or the primary action, remove it. Chrome stays neutral.
- One accent per surface. Do not put green, blue, and orange buttons on the same screen competing.

## 3. Typography

- **Inter** everywhere (already the body font). System-ui fallback.
- Scale (weight / size): Page title 800 / 24px. Section title 700 / 18px. Card or row title 600 / 15px. Body 400 / 14-15px. Meta 400 / 12-13px in `--ink-mute`.
- Headings are heavy and dark; secondary text is muted gray, never another color. Hierarchy comes from weight + muting, not from color.

## 4. Spacing & layout

- **4px base unit.** Use multiples (4, 8, 12, 16, 24, 32).
- **Generous whitespace.** Rows and cards breathe. When unsure, add space.
- **Separate with soft dividers, not boxes.** A 1px `--line-soft` rule between rows beats a heavy border or a card-per-row.
- Content max width ~1000-1100px in a centered column; tables right-align numbers, left-align text.
- **Rounding:** cards/inputs/buttons `rounded-lg`–`rounded-xl`, pills fully round. Be consistent per element type.
- **Shadows:** subtle only (`shadow-sm`). No drop-shadow drama.

## 5. The Row component (use this everywhere lists appear)

Rocks, to-dos, issues, headlines, KPIs, signups — all the same shape:

```
[avatar]  Title (600/15, ink)              [status pill]  [meta: date/owner, muted]  [⋯ overflow]
          optional one-line description (muted)
```

Same paddings, same divider, same overflow menu placement on every list. This single rule is the biggest "feels like one product" lever.

## 6. Buttons

- **One primary per screen:** solid `orgy-blue`, white text, `rounded-lg`. Top-right of the content area or the obvious next step.
- **Secondary:** quiet ghost / outline in ink. **Tertiary:** plain text link in `orgy-blue`.
- **Destructive:** off-track red, and only on confirm.
- Never two primary-weight buttons side by side.

## 7. Status pills & heatmap

- Pills: status color text on the matching soft tint, fully rounded, 12px, 600. (`on-track` green, `off-track` red, `watch` amber.)
- Scorecard/heatmap cells use the **soft** tints, never the saturated status color as a fill — muted reads calm and scans faster.

## 8. Empty states

Friendly, never a blank panel: a single line icon, one plain sentence, one primary CTA. Example voice: "No meetings yet. Start your first L10." Plain and human, not clever.

## 9. Cards

White surface, 1px `--line-soft` border, `rounded-xl`, `shadow-sm`, internal padding 16-24px. Group related content; do not wrap every row in its own card.

## 10. Don'ts (the fast checklist)

- ✗ `#000` / `#fff` / cold grays ✗ dark-mode default
- ✗ color used for decoration ✗ more than one primary action
- ✗ heavy borders / a card around every row ✗ inconsistent rounding or spacing
- ✗ a new bespoke list layout when the Row component fits

## 11. Applying it

When building or polishing a page, check: warm bg, one primary action, the Row component for any list, the type scale, soft dividers, status tokens for any status, a friendly empty state, and zero decorative color. If a screen fails one of these, it is not done.
