---
name: OTP
description: Coordination intelligence layer for AI-native organizations. The Departure Board.
colors:
  signal: "#ffab1d"
  signal-hot: "#ff8a12"
  signal-deep: "#b06c08"
  ink: "#17130d"
  ink-raised: "#221d14"
  ink-high: "#2c2618"
  paper: "#f7f2e6"
  paper-raised: "#efe7d3"
  paper-sink: "#e7dcc2"
  on-ink: "#f4ecda"
  muted-ink: "#a99c7f"
  on-paper: "#221c11"
  muted-paper: "#6f6450"
  steel: "#8b94a2"
  line-ink: "#f4ecda1f"
  line-paper: "#221c1124"
typography:
  display:
    fontFamily: "Archivo, sans-serif"
    fontSize: "clamp(2.9rem, 7.6vw, 6.4rem)"
    fontWeight: 900
    lineHeight: 0.93
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Archivo, sans-serif"
    fontSize: "clamp(2.2rem, 4.6vw, 3.8rem)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Archivo, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "normal"
  label:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.22em"
rounded:
  sm: "3px"
  md: "7px"
  lg: "12px"
spacing:
  sm: "12px"
  md: "24px"
  lg: "48px"
  section: "112px"
components:
  button-primary:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "14px 28px"
    typography: "{typography.title}"
  button-primary-hover:
    backgroundColor: "{colors.signal-hot}"
  button-ghost:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
    rounded: "{rounded.md}"
    padding: "14px 28px"
  org-tile:
    backgroundColor: "{colors.ink-high}"
    textColor: "{colors.on-ink}"
    rounded: "{rounded.md}"
    padding: "11px 12px"
  track-card:
    backgroundColor: "{colors.ink-raised}"
    textColor: "{colors.on-ink}"
    rounded: "{rounded.lg}"
    padding: "28px"
  eyebrow-label:
    textColor: "{colors.muted-ink}"
    typography: "{typography.label}"
---

# Design System: OTP

## 1. Overview

**Creative North Star: "The Departure Board"**

OTP is the Organization Transport Protocol, and the design takes that word
literally. The system looks like transit signage: signal amber burning on warm
ink, monospaced protocol labels, type set large enough to read at a glance,
every element sitting in a clear slot. A departure board does not decorate. It
tells you exactly where things are and where they are going, with total
confidence, in one look. That is the job here. The visitor should feel what
PRODUCT.md calls for: "I can finally see the whole system, and this is under
control."

The personality is founder-direct and structural. Headlines are enormous and
declarative, set in a heavy grotesk, because the founder has a position and
states it. Labels and data are monospaced, because OTP is a protocol and the
mono is meaningful, not a dev-tool affectation. Color is committed: amber is not
a 10% accent sprinkled for flavor, it carries whole surfaces and always points
at the one thing that matters. Neutrals are warm, never cold, never pure black
or white. The light sections read as paper, the dark sections as ink.

This system explicitly rejects two things named in PRODUCT.md. It is not
**cheerful startup pastel**: no soft gradients, no friendly blobs, no rounded
cuteness, no mascot warmth. It is not **enterprise software grey**: no joyless
corporate chrome, no cold neutrals, no point-of-view-free neutrality. Warmth
comes from honesty and the founder's voice. Seriousness comes from structure and
restraint. The two hold each other up.

**Key Characteristics:**
- Committed color: signal amber owns surfaces, never decorates.
- Warm ink and warm paper. No cold grey, no `#000`, no `#fff`.
- Heavy editorial display type at dramatic scale, against monospaced protocol labels.
- Flat surfaces, full borders, tonal layering. Depth is structural, not glassy.
- Every seat, label, and number sits in a legible slot. Signage logic.

## 2. Colors

A two-temperature world: warm ink and warm paper as the stage, one signal amber as the voice.

### Primary

- **Signal Amber** (`#ffab1d`): The voice of the system. It marks the single
  most important thing in any view: the primary CTA, the live indicator, the
  human seat on a chart, the one emphasized word in a headline. On committed
  sections (the install block) it floods the entire surface. Carried in
  `oklch(0.80 0.16 70)`.
- **Signal Hot** (`#ff8a12`): The deeper amber used only for the hover state of
  primary buttons. Never a resting color.
- **Signal Deep** (`#b06c08`): Amber dark enough to pass AA as text and borders
  on paper surfaces, where bright `#ffab1d` would fail contrast.

### Secondary

- **Steel** (`#8b94a2`): A single cool, desaturated grey-blue used semantically,
  not decoratively. Its only job is to mark AI-agent seats on the org chart, so
  the eye separates them from amber-marked human seats. It never appears as a UI
  accent. Amber is for humans and for action; steel is for agents.

### Neutral

- **Ink** (`#17130d`): The primary dark surface. A warm near-black, tinted
  toward the brand hue. Hero, dark sections, nav, footer.
- **Ink Raised** (`#221d14`) and **Ink High** (`#2c2618`): Two warmer steps up
  from Ink. Depth on dark surfaces is built by stacking these tonal steps, not
  by shadow. Cards sit on Ink Raised; chart tiles on Ink High.
- **Paper** (`#f7f2e6`): The primary light surface. A warm bone, never white.
  The "show your work" sections (frustrations, how it works, proof, toolbox).
- **Paper Raised** (`#efe7d3`) and **Paper Sink** (`#e7dcc2`): Tonal steps for
  layering and section alternation on light surfaces.
- **On Ink** (`#f4ecda`) / **Muted Ink** (`#a99c7f`): Text on dark. Primary copy
  and a warm muted tone for secondary copy.
- **On Paper** (`#221c11`) / **Muted Paper** (`#6f6450`): Text on light. Same
  two-step idea.
- **Line Ink** (`#f4ecda1f`) / **Line Paper** (`#221c1124`): The hairline border
  colors. Borders, not shadows, define structure here.

### Named Rules

**The Signal Rule.** Amber always points at something: an action, a live state,
a human, the one word that carries the sentence. If amber is not pointing at
something, it does not belong on the surface. It is committed, not sprinkled.

**The Warm Neutral Rule.** `#000` and `#fff` are forbidden. Every neutral is
tinted warm toward the amber hue. Cold grey is the enterprise-grey
anti-reference and is prohibited.

**The Two-Temperature Rule.** Sections alternate ink and paper. There is no
third surface temperature. Amber is the only thing allowed to break the
alternation, and only by flooding a whole section on purpose.

## 3. Typography

**Display Font:** Archivo (with `sans-serif` fallback)
**Body Font:** Inter (with `sans-serif` fallback)
**Label / Mono Font:** JetBrains Mono (with `monospace` fallback)

**Character:** A heavy editorial grotesk for the founder's declarations, a clean
neutral sans for readable body copy, and a true monospace for every protocol
label and number. Editorial plus technical: a magazine that is also a spec.

### Hierarchy

- **Display** (Archivo 900, `clamp(2.9rem, 7.6vw, 6.4rem)`, line-height 0.93,
  tracking -0.03em): Hero and final-CTA headlines only. Set so large it crosses
  column lines. The headline is the page.
- **Headline** (Archivo 800-900, `clamp(2.2rem, 4.6vw, 3.8rem)`, line-height
  0.98): Section headlines.
- **Title** (Archivo 800, ~1.5rem, line-height 1.1): Card titles, track names,
  pillar words.
- **Body** (Inter 400-500, 15-16px, line-height 1.65-1.7): Paragraph copy.
  Capped at 65-75ch line length.
- **Label** (JetBrains Mono 500, 11px, tracking 0.22em, uppercase): Eyebrows,
  protocol labels, KPI readouts, data, the `[OTP]` wordmark. Often preceded by a
  7px amber tick square.

### Named Rules

**The Mono Label Rule.** Every eyebrow, label, KPI, and data readout is set in
JetBrains Mono. This is meaningful: OTP is a literal protocol, and the mono says
so. It is never a decorative dev-tool gesture.

**The Scale Jump Rule.** The step from Display to Body is dramatic, three times
or more. Flat type scales are forbidden. Hierarchy is built by committing to the
jump: make big things much bigger and small things smaller.

**The Solid Emphasis Rule.** A word is emphasized by switching it to solid
Signal Amber, or by weight. Never by a gradient. Gradient text is forbidden.

## 4. Elevation

This system is flat by default. Depth is structural: a full 1px hairline border
(`line-ink` / `line-paper`) plus tonal layering (Ink to Ink Raised to Ink High).
Shadows are rare and reserved. Exactly one real shadow exists, a deep soft
ambient drop used only under panels that genuinely float above the page (the
hero chart panel, the install card). Hover states use a small upward translate,
so motion, not a shadow, signals lift.

### Shadow Vocabulary

- **Floating Panel** (`box-shadow: 0 40px 90px -30px rgba(0,0,0,0.8)`): The only
  resting shadow. Hero chart panel and install card. Signals "this object floats
  above the page."
- **Hover Lift**: No shadow. `transform: translateY(-2px to -4px)` on an
  ease-out-quart curve. The card rising is the feedback.

### Named Rules

**The Flat-By-Default Rule.** Surfaces are flat at rest. Structure is drawn with
a full border and tonal steps, never with a shadow. If a surface needs a shadow
to feel separated, the border or the tonal step is missing.

**The No-Glass Rule.** Glassmorphism, decorative `backdrop-filter` blur, and
glass cards are forbidden. Panels are solid.

## 5. Components

### Buttons

- **Shape:** Lightly squared corners (7px radius, `rounded.md`). Not pill, not sharp.
- **Primary:** Signal Amber background, Ink text, Archivo 800. Padding 14px 28px.
  The committed action. There is one primary button per view.
- **Hover / Focus:** Background shifts to Signal Hot (`#ff8a12`) and the button
  lifts `translateY(-2px)` on an ease-out-quart curve, 180ms. Focus shows a
  visible ring.
- **Ghost:** Transparent on Ink, 1px `line-ink` border, On Ink text, Archivo
  700. Hover shifts the border to Signal Amber. The secondary, never-competing action.

### Cards / Containers

- **Corner Style:** 12px radius (`rounded.lg`) for content cards and panels.
- **Background:** Ink Raised on dark sections, white-paper tones on light sections.
- **Border:** Full 1px `line-ink` / `line-paper` hairline. Always full, never partial.
- **Shadow Strategy:** None at rest (see Elevation). Hover lifts `translateY(-4px)`
  and the border shifts toward Signal Amber.
- **Internal Padding:** 28px (`lg`-ish) for track cards.

### Org Tile (signature component)

The defining OTP component: a seat on the org chart, used in the hero and on the
team chart. Ink High background, full 1px `line-ink` border, 7px radius. The top
row carries an 8px square swatch (Signal Amber for a human seat, Steel for an
agent seat) and a monospace uppercase tag (`HUMAN` / `AGENT`). Then the name in
Archivo 800, the role in Muted Ink. An optional KPI pill (monospace, amber,
bordered) shows a live number. **The marker is the swatch and the tag, never a
colored side stripe.**

### Eyebrow Label

A monospace uppercase label (11px, tracking 0.22em) preceded by a 7px solid
Signal Amber tick square. Opens every section. The protocol's section marker.

### Index Row

For lists that would otherwise become an identical card grid (the toolbox). A
full-width row: a large outlined numeral, a title plus one-line description, a
monospace action link. Separated by top hairline borders, hover tints the row.
Editorial, not gridded.

### Navigation

Fixed Ink bar, 60px tall, full-width `line-ink` bottom border. The wordmark is
`[OTP]` in JetBrains Mono bold, Signal Amber, with the full name in a tiny
muted mono label beside it. Links are Inter medium, On Ink, hover to Signal
Amber. The Publish action is a primary amber button. No dropdown chrome at rest.

## 6. Do's and Don'ts

### Do:

- **Do** keep Signal Amber (`#ffab1d`) pointed at something: an action, a live
  state, a human seat, one emphasized word. Let it carry whole surfaces when the
  section is a committed moment.
- **Do** tint every neutral warm. Ink is `#17130d`, paper is `#f7f2e6`.
- **Do** set headlines enormous in Archivo 900 and let them cross column lines.
- **Do** set every label, KPI, and readout in JetBrains Mono. The mono is the protocol.
- **Do** draw structure with full 1px borders and tonal steps (Ink to Ink Raised
  to Ink High), flat at rest.
- **Do** mark org-chart seats with a swatch plus a monospace `HUMAN` / `AGENT` tag.
- **Do** hold WCAG 2.2 AA: use Signal Deep (`#b06c08`) for amber text on paper,
  keep visible focus rings, honor `prefers-reduced-motion`.

### Don't:

- **Don't** drift into **cheerful startup pastel**: no soft gradients, no
  friendly blobs, no rounded cuteness, no mascot warmth, no pastel fills.
- **Don't** drift into **enterprise software grey**: no cold neutrals, no
  joyless corporate chrome, no point-of-view-free layouts.
- **Don't** use `border-left` or `border-right` greater than 1px as a colored
  accent stripe on tiles, cards, or callouts. Use a full border and a swatch.
- **Don't** use gradient text (`background-clip: text`). Emphasize with solid
  Signal Amber or with weight.
- **Don't** use glassmorphism or decorative `backdrop-filter` blur. Panels are solid.
- **Don't** build the hero-metric template (big number, small label, supporting
  stats, gradient accent) or endless identical icon-heading-text card grids. Use
  the Index Row instead.
- **Don't** use `#000` or `#fff` anywhere.
- **Don't** use em dashes in copy. Use commas, colons, periods, or parentheses.
