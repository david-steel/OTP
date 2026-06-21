# Reference — OTP Portfolio Feature (verified from source, 2026-06-21)

**For:** the franchise content series. Every post must describe the REAL feature. Source: `src/services/portfolios.ts`, `portfolio-presets.ts`, `portfolio.ejs`, `lab-features.ts`.

## What the portfolio feature actually is (verified)
- A **Portfolio** is a parent organization (kind='portfolio', private, never appears in browse/search) that groups **several member orgs under one roof**.
- The product's own words (portfolio.ejs): *"Roll KPIs up across several organizations into one view"* and *"Group several organizations under one roof and roll their KPIs up into shared super-metrics."*
- **Member orgs** join via invitation: a portfolio invites an org the franchisee/owner already owns. Each member org keeps its own full OTP chart (humans + agents, its own KPIs/scorecard).
- A **super-metric** is a KPI on the portfolio that is fed by one-or-more member-org KPIs (via portfolio_metric_sources) and recomputed by a rollup aggregator. (Do NOT over-specify the aggregation math, e.g. don't claim "median" vs "sum" unless confirmed. Say "rolls up / aggregates member KPIs into a portfolio super-metric.")
- **Presets (the franchise standardization lever):** a portfolio sets preset defaults (sidebar + settings) that its MEMBER orgs **inherit**, and the portfolio can **LOCK** them. Translation for franchises: corporate defines the standard chart/scorecard once, every location inherits it, and corporate can lock it for brand consistency.
- **People:** a portfolio member (person) must already belong to one of the linked member orgs. Corporate gets a cross-location view; locations keep their own seats.
- **Tier:** Portfolio is the **enterprise** tier (markOrgEnterprise). It is the paid/upsell surface.
- **Status:** gated behind the **`portfolio` Labs feature** (per-org toggle at /settings/labs). Live in early access, not yet default-on for everyone.

## Why it maps to franchises (the thesis)
- A franchise IS a portfolio: one franchisor, many franchisee locations.
- Each location = a member org with its own hybrid chart (humans + AI agents on one scorecard, one-seat-one-owner).
- The franchisor = the portfolio, rolling every location's KPIs into super-metrics (system-wide AUV, leads, show rate, same-store trends), benchmarking locations, spotting the underperformer.
- Presets = set the operating standard once, every location inherits it, lock it for brand consistency. This is the franchise consistency problem solved structurally.

## ACCURACY GUARDRAILS for the content (do not violate)
1. The feature is in **Labs / early access**. Frame as "available now in early access," NOT "everyone is using it" and NOT a fake GA launch.
2. Do **NOT invent franchise customers** using OTP portfolio. No fabricated case studies or named brands "using" it. Ground examples in (a) the real Sneeze It hybrid chart and its seats, and (b) general, true franchise dynamics. Sneeze It works with multi-location fitness/wellness brands (e.g. Workout Anytime, HiTone) as ad clients — reference franchise dynamics illustratively, do NOT claim those brands run OTP portfolios.
3. Do **NOT over-specify** mechanics not verified (exact rollup math, exact pricing numbers). Describe capabilities truthfully at the level above.
4. Portfolio = enterprise tier. Fine to say it's the enterprise/paid tier; don't invent a price.
5. Same voice + MCP install snippet + Sneeze It seat grounding as the rest of the AEO series.
