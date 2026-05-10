# Design System — Orger

**Version:** 1.0 (initial system)
**Date:** 2026-05-10
**Created by:** `/design-consultation` skill
**Source mockups:** `/Users/dsteel/.gstack/projects/dsteel/designs/orger-system-20260510/`
**Reference images:** `/Users/dsteel/otp-platform/orger/public/images/mockup-*.png`

---

## Product Context

- **What this is:** Free AI-aware org chart builder. Drag-drop canvas where humans and AI agents live on the same surface. Click any seat for grounded agent recommendations from real OOS data, then grounded skill recommendations from the best-practices library.
- **Who it's for:** Solo founders + SMB owners (1-20 humans) primary. EOS / Vistage / YPO / Scaling Up coaches secondary (used as a teaching artifact with their clients).
- **Space/industry:** Sits between three categories — org chart tools (Lattice, Pingboard), AI agent platforms (Anthropic, Jules, Crew), EOS/operations tools (Ninety, Bloom Growth). Nobody else combines all three.
- **Project type:** Marketing site (orger.ai) + web app (chart canvas, recommendations, share links).
- **Domain:** orger.ai
- **Backend:** Shares Clerk auth + Postgres + MCP server with OTP (`otp-platform/`).

---

## Brand Voice

**Aesthetic brief:** Jules meets Shrek. Clean modern AI product structure (Jules) + playful ogre/onion-layer spirit in copy and accents (Shrek-inspired, NOT Shrek IP).

**Voice traits:**
- Confident, technical, unintimidated by complexity
- Earned irreverence in microcopy (not forced jokes)
- "Layers" as the verbal motif (orgs have layers, ogres have layers, onions have layers)
- Never apologetic, never marketing-speak, never enterprise-cosplay
- Empty states have personality. Footer is serious.

**Microcopy examples:**
- Empty seats: "+ Recommend an agent" / "Pick a human"
- Empty chart state: "Even ogres need a team."
- Loading: "Peeling the layers..."
- 404: "This seat doesn't exist. Yet."
- Success toast: "Saved. Shrub approves."
- Sign-up CTA: "Build your chart" (never "Get started" / "Sign up free")

**Anti-patterns (banned from copy):**
- "Built for X" / "Designed for Y"
- "Trusted by Fortune 500"
- "Revolutionize your..."
- "AI-powered" as a self-description (let users call it that)
- "Agentic" (overused)
- Em dashes (David's standing rule across all Sneeze It content)

---

## Aesthetic Direction

- **Direction:** Playful-Technical Maximalism
- **Decoration level:** Intentional → Expressive on hero/empty states, restrained on app surfaces
- **Mood:** Dark, alive, slightly playful. A serious AI tool that isn't afraid to have a face.
- **Reference sites:**
  - [jules.google.com](https://jules.google/) — structural anchor (dark colorful background, mascot, dotted grid, product alive in hero)
  - [linear.app](https://linear.app/) — restraint counterpoint (dark mode discipline, monospace credibility)
  - [granola.ai](https://granola.ai/) — warmth counterpoint (mascot energy, friendly but grown-up)
  - [excalidraw.com](https://excalidraw.com/) — chart-as-hero precedent (the canvas IS the marketing)

**EUREKA insight (from Phase 2 research):**
> Org charts are visual artifacts. Every competitor (Lattice, Pingboard, Built) hides the chart behind a feature grid and "Get a demo" CTA. The chart IS the share-worthy artifact people post to LinkedIn. So the chart should BE the hero — alive, drag-droppable, editable on the homepage like Excalidraw. Don't show a screenshot of the chart. Show THE chart.

---

## Color System — The Swamp Palette

Dark mode primary. Light mode supported (later phase).

### Core Tokens

```css
:root {
  /* Backgrounds */
  --color-bg-deep: #0F1B14;      /* Deep Swamp — page background */
  --color-bg-surface: #1A2B20;   /* Moss Surface — cards, panels */
  --color-bg-elevated: #243832;  /* Raised — modals, dropdowns */

  /* Brand */
  --color-brand: #5C8A3C;        /* Swamp Green — primary CTAs, agent nodes */
  --color-brand-hover: #6FA346;  /* Hover state */

  /* Pop / Live */
  --color-pop: #A6E22E;          /* Lime Pop — live indicators, success, primary button bg */
  --color-pop-text: #0F1B14;     /* Text on lime — always deep swamp */

  /* Human / Warmth */
  --color-warm: #FFB454;         /* Onion Amber — human nodes, warm contrast */
  --color-warm-soft: #F4C97A;    /* Lighter amber for hover/highlights */

  /* Destructive */
  --color-danger: #E94B6A;       /* Pepper Pink — error/destructive ONLY (sparingly) */

  /* Text */
  --color-text-primary: #F4F1EA;   /* Cream — primary text on dark */
  --color-text-secondary: #B8C4BB; /* Muted moss for secondary */
  --color-text-tertiary: #7A9482;  /* Faint moss for tertiary */

  /* Neutrals (gradients of moss) */
  --color-neutral-100: #F4F1EA;  /* Cream */
  --color-neutral-200: #D4D8D2;
  --color-neutral-300: #B8C4BB;
  --color-neutral-400: #7A9482;
  --color-neutral-500: #3A5544;
  --color-neutral-600: #243832;
  --color-neutral-700: #1F2D24;
  --color-neutral-800: #1A2B20;
  --color-neutral-900: #0F1B14;

  /* Borders */
  --color-border-subtle: #243832;   /* On surface */
  --color-border-medium: #3A5544;   /* Cards, inputs */
  --color-border-strong: #5C8A3C;   /* Focus, active */
}
```

### Semantic Use

| Use | Token |
|---|---|
| Page background | `--color-bg-deep` |
| Card / panel | `--color-bg-surface` |
| Modal / dropdown | `--color-bg-elevated` |
| Primary CTA button | `--color-pop` bg, `--color-pop-text` text |
| Secondary CTA | `--color-bg-surface` bg, `--color-text-primary` text, `--color-border-medium` border |
| Agent node (chart) | `--color-brand` bg, `--color-pop` "live" pulse dot |
| Human node (chart) | `--color-warm` bg, avatar circle |
| Empty seat (chart) | dashed `--color-border-medium`, `--color-text-tertiary` text |
| Connection lines (chart) | `--color-neutral-500` with 50% opacity |
| Recommendation badge | `--color-bg-elevated` bg, `--color-text-primary` text, `--color-pop` icon |
| Success | `--color-pop` |
| Error | `--color-danger` |
| Warning | `--color-warm` |
| Info | `--color-brand` |

### Anti-Slop Rules

**NEVER use:**
- Purple/violet gradients (every AI product does this — instant slop)
- AI-blue (the Anthropic / OpenAI palette — generic)
- Pure black `#000000` (we have a green-tinted dark)
- Pure white `#FFFFFF` (we have cream)
- Gradient buttons as primary CTAs (lime is flat and confident)
- Color combos that fail WCAG AA on `--color-bg-deep`

---

## Typography

### Font Stack

```css
:root {
  --font-display: "Cabinet Grotesk", "General Sans", -apple-system, BlinkMacSystemFont, sans-serif;
  --font-body: "General Sans", "Söhne", -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: "Geist Mono", "JetBrains Mono", ui-monospace, "SF Mono", monospace;
}
```

### Loading

Use [Fontshare](https://www.fontshare.com/) for Cabinet Grotesk + General Sans (free, no API key needed). Geist Mono via [Vercel CDN](https://vercel.com/font) or self-host.

```html
<link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700,800&f[]=general-sans@300,400,500,600&display=swap" rel="stylesheet">
```

### Roles

| Role | Font | Weight | Use |
|---|---|---|---|
| Hero / page title | Cabinet Grotesk | 800 (Black) | Marketing pages only. Wide, confident. |
| Section heading | Cabinet Grotesk | 700 (Bold) | Marketing + app section headers |
| Subheading | General Sans | 600 (Semibold) | Card titles, modal headers |
| Body | General Sans | 400 (Regular) | All paragraph text |
| Body emphasis | General Sans | 500 (Medium) | Inline emphasis, button labels |
| Microcopy / labels | General Sans | 400 (Regular) | Form labels, hints, captions |
| Data / chart node labels | Geist Mono | 400 (Regular) | Chart node names, IDs, technical UI |
| Numbers in tables | Geist Mono | 400 with `font-variant-numeric: tabular-nums` | Always use tabular-nums on numeric data |
| Code | Geist Mono | 400 (Regular) | Inline + block code |

### Type Scale (rem)

```css
--text-xs:   0.75rem;   /* 12px — captions, microcopy */
--text-sm:   0.875rem;  /* 14px — secondary, labels */
--text-base: 1rem;      /* 16px — body */
--text-lg:   1.125rem;  /* 18px — body emphasis */
--text-xl:   1.25rem;   /* 20px — card title */
--text-2xl:  1.5rem;    /* 24px — section heading */
--text-3xl:  1.875rem;  /* 30px — page heading (app) */
--text-4xl:  2.25rem;   /* 36px — h1 (app pages) */
--text-5xl:  3rem;      /* 48px — hero subhead */
--text-6xl:  4rem;      /* 64px — hero headline (mobile) */
--text-7xl:  5rem;      /* 80px — hero headline (desktop) */
--text-8xl:  6rem;      /* 96px — hero headline (large desktop) */
```

### Line Heights

```css
--leading-tight:  1.1;   /* Hero headlines, display */
--leading-snug:   1.25;  /* Section headings */
--leading-normal: 1.5;   /* Body, default */
--leading-relaxed: 1.625; /* Long-form content */
```

### Banned Fonts

Inter, Roboto, Arial, Helvetica, Open Sans, Lato, Montserrat, Poppins, Comic Sans, Papyrus, Trajan, Raleway, Clash Display.

If a developer or AI tool defaults to Inter/Roboto, override.

---

## Spacing

```css
--space-2xs: 0.125rem;  /* 2px  — hairline gaps */
--space-xs:  0.25rem;   /* 4px  — base unit */
--space-sm:  0.5rem;    /* 8px  — tight padding */
--space-md:  1rem;      /* 16px — standard padding */
--space-lg:  1.5rem;    /* 24px — card padding */
--space-xl:  2rem;      /* 32px — section gap */
--space-2xl: 3rem;      /* 48px — major section gap */
--space-3xl: 4rem;      /* 64px — page section gap */
--space-4xl: 6rem;      /* 96px — hero vertical padding */
--space-5xl: 8rem;      /* 128px — landing page sections */
```

**Density:** Comfortable, not compact. Generous breathing room on marketing pages, tighter on app surfaces (chart canvas, dashboards).

---

## Border Radius

```css
--radius-sm:   4px;   /* Tight elements: badges, tags */
--radius-md:   8px;   /* Default: nodes, buttons, inputs */
--radius-lg:   12px;  /* Cards, panels */
--radius-xl:   16px;  /* Modals, large containers */
--radius-2xl:  24px;  /* Hero cards, feature cards */
--radius-full: 9999px; /* Pills, avatars, circular buttons */
```

**Hierarchy rule:** Smaller radius for technical/data UI (chart nodes, inputs at 8px). Larger radius for marketing/expressive UI (feature cards, hero containers at 16-24px). Never mix wildly different radii in the same component.

---

## Layout

- **Approach:** Hybrid. Strict 12-column grid for chart canvas (alignment matters when you're moving org boxes around). Creative-editorial for marketing pages (asymmetry allowed, hero can break grid).
- **Max content width:** `1200px` for marketing pages. `1440px` for app/chart canvas (more room for charts).
- **Page padding:** `--space-md` mobile, `--space-2xl` desktop.
- **Grid gap:** `--space-lg` default.

### Breakpoints

```css
--bp-sm:  640px;   /* Tablet portrait */
--bp-md:  768px;   /* Tablet landscape */
--bp-lg:  1024px;  /* Desktop */
--bp-xl:  1280px;  /* Large desktop */
--bp-2xl: 1536px;  /* Extra large */
```

### Backgrounds

**Dotted grid pattern** (signature element, used on hero + chart canvas):

```css
.dotted-grid {
  background-image: radial-gradient(
    circle,
    var(--color-neutral-500) 1px,
    transparent 1px
  );
  background-size: 24px 24px;
  background-position: 0 0;
  opacity: 0.4;
}
```

---

## Motion

- **Approach:** Intentional → Expressive on chart canvas (nodes spring into place, lines draw on, tooltips bounce in slightly). Functional everywhere else (snappy, no decoration).

### Easing

```css
--ease-out:    cubic-bezier(0.16, 1, 0.3, 1);     /* Default — UI enters */
--ease-in:     cubic-bezier(0.4, 0, 1, 1);        /* UI exits */
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);    /* Position/size moves */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* Playful — chart nodes, mascot */
```

### Duration

```css
--duration-instant: 50ms;
--duration-fast:    150ms;
--duration-base:    250ms;
--duration-slow:    400ms;
--duration-slower:  700ms;
```

### Specific Animations

- **Chart node enter:** `transform: scale(0.8) → scale(1)` over `400ms` with `--ease-spring`
- **Connection line draw:** stroke-dashoffset animation over `600ms` with `--ease-out`
- **Live pulse dot:** `scale(1) → scale(1.3) → scale(1)` infinite over `2s`
- **Tooltip:** `opacity 0 → 1, translateY 4px → 0` over `150ms` with `--ease-out`
- **Modal:** backdrop fade `200ms`, modal scale + fade `250ms` with `--ease-out`
- **Page transitions:** none on marketing (instant). Subtle on app (fade only, `150ms`).

---

## The Mascot — "Shrub"

**Identity:** A small, friendly, original ogre-coded creature. Visible onion-layer rings on body suggest layers (the verbal motif made visual). Big curious cream eyes with bright lime pupils. Two tiny horns. Pixel-art rendering style mixed with smooth gradients (Jules-style).

**Color:** Body in `--color-brand` to `--color-neutral-500` gradient. Eyes cream. Pupils `--color-pop`. Horns slightly darker moss.

**Personality:** Curious, helpful, never sarcastic. Treats the user's org chart like a precious pet.

**Where Shrub appears:**

| Context | Size | Behavior |
|---|---|---|
| Homepage hero (variant A) | 80px corner cameo | Static, small, watching |
| 404 page | 240px center | Holding a broken org chart node |
| Empty state (no chart yet) | 160px center | Holding a glowing first node |
| Loading state | 64px inline | Idle bobbing animation |
| Success toast | 24px inline | Thumbs up |
| Nav bar (variant B reference) | 32px next to wordmark | Always there, tiny |

**Where Shrub does NOT appear:**
- Chart canvas itself (would clutter)
- Modal headers (too distracting)
- Form labels / settings pages (too much personality for utility surfaces)
- Footer (serious zone)

**IP safety:** Shrub is an ORIGINAL character. NO Shrek references in copy. NO Mike Myers Scottish accent in voice. NO "swamp" puns that lift Shrek-specific lines. The aesthetic is ogre-coded — green skin, swamp dwelling, layered body — but the character, name, and personality are independent. If anyone asks "is that Shrek?" the answer is "no, that's Shrub."

---

## Component Patterns

### Chart Nodes

**Human node:**
```
Background: --color-warm
Text: --color-bg-deep (dark on amber for contrast)
Border-radius: --radius-md (8px)
Padding: --space-sm --space-md
Avatar: 32px circle, top-left
Label: --font-mono, --text-sm
```

**AI agent node:**
```
Background: --color-brand
Text: --color-text-primary
Border-radius: --radius-md
Bot icon: 16px, top-left
Live pulse dot: --color-pop, 8px circle, top-right, animated
Label: --font-mono, --text-sm
```

**Empty seat:**
```
Background: transparent
Border: 2px dashed --color-border-medium
Border-radius: --radius-md
Text: --color-text-tertiary
Hover: border becomes --color-pop, text becomes --color-text-secondary
Label: "+ Recommend an agent" or "+ Add human"
```

### Buttons

**Primary (lime):**
```
Background: --color-pop
Text: --color-pop-text (deep swamp)
Border-radius: --radius-md
Padding: --space-sm --space-lg
Font: --font-body 500 weight
Hover: brightness(1.1)
Active: scale(0.98)
```

**Secondary (ghost):**
```
Background: transparent
Text: --color-text-primary
Border: 1px solid --color-border-medium
Border-radius: --radius-md
Hover: background --color-bg-surface
```

**Tertiary (text link):**
```
Background: none
Text: --color-text-secondary
Underline on hover, --color-pop accent
```

### Cards

```
Background: --color-bg-surface
Border: 1px solid --color-border-subtle
Border-radius: --radius-lg
Padding: --space-lg
Hover (if interactive): border becomes --color-border-medium
```

### Recommendation Badges

The "12 orgs your size built this" pattern — appears next to empty seats:

```
Background: --color-bg-elevated
Text: --color-text-primary
Border-radius: --radius-md
Padding: --space-sm --space-md
Icon: lime "users" icon
Font: --font-body --text-sm
Tail: small triangle pointing to the seat
```

---

## Page Templates

Three templates, three variants, three jobs:

### 1. Homepage (`orger.ai/`) — Variant A

**Reference:** `orger/public/images/mockup-homepage.png`

**Structure:**
- Slim nav: `Orger` wordmark + `Login`
- Hero: centered headline + subhead + dual CTAs (lime + ghost)
- Chart canvas: live, draggable, fills lower half of viewport
- Shrub: 80px corner cameo, bottom-right
- Below fold: "How it works" 3-step + trust band + footer

**Goal:** Conversion-first. Visitor experiences the product before deciding to sign up.

### 2. Product Page (`orger.ai/product`) — Variant B

**Reference:** `orger/public/images/mockup-product-page.png`

**Structure:**
- Same nav with Shrub mini-icon
- Split hero (45/55): copy left, chart card right
- Feature pills under CTAs: "Recommend agents", "Map skills", "Public share"
- Trust band ("Trusted by builders at...")
- Below: feature deep-dives in alternating asymmetric layouts

**Goal:** Premium credibility. Detailed product walkthrough for evaluators.

### 3. Empty States + 404 — Variant C

**Reference:** `orger/public/images/mockup-empty-state.png`

**Structure:**
- Big Shrub center, holding something relevant
- Floating pixel-art decorations (cog, chat bubble, onion, sparkle)
- Single line of copy with personality
- Single CTA

**Goal:** Earned personality moments. Shrub gets screen time without overwhelming the hero.

**Used for:**
- 404 page
- First-time empty chart
- "No agents recommended yet"
- Loading skeleton (smaller Shrub)
- Maintenance mode

---

## Accessibility

- All text on `--color-bg-deep` must pass WCAG AA (4.5:1) — `--color-text-primary` cream on swamp passes at 13.2:1
- All text on `--color-pop` lime button bg must use `--color-pop-text` (deep swamp) — passes 12.8:1
- Focus rings: 2px `--color-pop` outline with 2px offset, never removed
- Reduce motion: respect `prefers-reduced-motion` — disable spring animations, keep functional transitions
- Chart nodes: minimum 44x44px touch target on mobile
- Mascot: always has `alt=""` (decorative)
- All icons paired with text or `aria-label`

---

## Decisions Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-05-10 | Initial design system created | `/design-consultation` — based on Jules-meets-Shrek brief, swamp palette, chart-as-hero EUREKA, hybrid variant approach |
| 2026-05-10 | Mascot named "Shrub" | Original ogre-coded character with onion rings. Distinct from Shrek IP. Pixel-art rendering. |
| 2026-05-10 | Cabinet Grotesk + General Sans + Geist Mono locked | Wide geometric display avoids Inter/Roboto sterility. Mono on data signals technical credibility. All free via Fontshare/Vercel. |
| 2026-05-10 | Swamp palette over AI purple/blue | Color is a recall hook. Linear owns black+yellow. Notion owns warm cream. Nobody owns swamp green in AI tools. Free brand differentiation + plays the Shrek wink without IP risk. |
| 2026-05-10 | Chart-as-hero on homepage (variant A) | EUREKA: every competitor hides the chart behind a feature grid. Org charts are visual artifacts. Excalidraw/tldraw proved chart-as-hero converts. |
| 2026-05-10 | Hybrid variant approach (A + B + C) | Each variant does one job well. A = homepage conversion. B = `/product` credibility. C = empty states personality. |

---

## Source Mockups

Approved AI-generated mockups live at:
- `/Users/dsteel/.gstack/projects/dsteel/designs/orger-system-20260510/`
  - `variant-A-chart-hero.png` — homepage reference
  - `variant-B-split-hero.png` — `/product` reference
  - `variant-C-mascot-forward.png` — empty states + 404 reference
  - `approved.json` — decision record

Copies in repo for build reference:
- `orger/public/images/mockup-homepage.png`
- `orger/public/images/mockup-product-page.png`
- `orger/public/images/mockup-empty-state.png`

When implementing, build to MATCH these mockups closely. They are the visual contract.
