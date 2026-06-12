# OTP Monetization Layer + SMART Rock Builder — Design Doc

Status: APPROVED (sequencing). Date: 2026-06-12. Owner: David.
Origin: office-hours strategy session.

## The one insight

Every revenue surface on the roadmap (AI-assist, add-on products, marketplace,
coach reselling, integrations) shares one dependency: a **metered-billing +
entitlements + wallet** system. Build that primitive once; all five plug in.
This is exactly what GoHighLevel does: one wallet ($ balance, auto-recharge),
a product-usage breakdown, a core subscription, add-on products, and a
marketplace, all on one billing rail.

Stripe does NOT bill the AI per call (charging a card $0.03 per request is
infeasible). **Stripe funds the wallet; the wallet meters the AI.**

## Decision: Hybrid sequencing

1. **Free SMART Rock builder now** — no billing, immediate product value,
   enriches the rocks model we already have. Ships this week.
2. **Wallet + entitlements + usage ledger next** — the platform primitive,
   built deliberately, not as a retrofit.
3. **AI-assist on the Rock builder third** — first metered paid feature,
   plugs into real metering, reuses the existing Ask AI / Claude infra.

Rejected: foundation-first (weeks before any visible value) and
vertical-slice-with-throwaway-paywall (learns less, code thrown away).

---

## Architecture: the billing primitive (3 layers)

### 1. Entitlements — "what is this org allowed to do?"
- New `org_entitlements` concept (table or a typed slice of `organizations`):
  `plan_tier` (free | private | premium | ...), `addons` (string[] of
  subscribed add-on keys), `feature_flags` (jsonb).
- Already have `is_private` and `preferences` jsonb; this generalizes the same
  idea. One helper `hasEntitlement(org, key)` gates every paid surface, mirroring
  the `isCrossOrgVisible` chokepoint pattern (one place, registry-documented).

### 2. Wallet — prepaid balance + ledger
- `org_wallets`: `org_id`, `balance_cents`, `auto_recharge_enabled`,
  `auto_recharge_amount_cents`, `auto_recharge_threshold_cents`,
  `stripe_customer_id`.
- `wallet_ledger`: append-only. `org_id`, `direction` (credit | debit),
  `amount_cents`, `reason` (topup | ai_usage | addon_charge | refund | promo),
  `metadata` jsonb (e.g. tokens in/out, model, feature), `created_at`,
  `balance_after_cents`. Never mutate; balance is derivable + cached on
  `org_wallets`.
- Stripe: a top-up creates a Checkout/PaymentIntent that credits the wallet on
  webhook. Auto-recharge fires a charge when balance < threshold. (Same Stripe
  account that will back Private / Premium subscriptions.)

### 3. Metering — debit on usage, fail closed
- Every billable AI call: estimate cost → **pre-check** `balance_cents >= est`
  (fail closed with a friendly "add credits" exactly like the Ask AI
  NOT_CONFIGURED pattern) → run → write a `wallet_ledger` debit from real token
  counts (input/output tokens × model rate × your markup) → update cached
  balance.
- Pricing model to PIN (the open question): markup multiple on raw Claude token
  cost (GHL-style "units"). e.g. raw $0.02 → wallet debit $0.06 (3x). This is
  the gross-margin lever and the one number to validate before building Phase 3.
- A `Billing` settings page mirrors GHL: wallet balance, Add balance,
  auto-recharge config, product/usage breakdown (AI, add-ons), payment method,
  invoices. Reuses the in-shell render + settings patterns already built.

---

## SMART Rock builder (Phase 1, free)

### Data model (extend the existing rock)
Add to the rock record (jsonb `smart` slice keeps it additive, no migration risk
beyond an ensure-column, mirroring `meetings.segment_notes`):
- `description` (the "Describe the Rock" long form)
- `smart`: `{ specific, measurable, attainable, relevant, time_framed }` (5 strings)
- `finish_line` (describe your finish line)
- `resources` (string[])
- `obstacles` (string[])
- Milestones already exist (`rock_milestones`: title, due_date, completed_at,
  sort_order) and map 1:1 to the form's First Step / Mid Steps / finish line.
  The form's "date completed" column = `completed_at`. Reuse as-is.

### UI
- A "Build SMART Rock" form on the rock card / a dedicated `/rocks/:id/smart`
  view: the form fields above, the 5 SMART checks as labeled inputs, milestone
  rows (reusing the milestone component), resources + obstacles as add-list
  inputs. Saves to the rock. Printable + the same download discipline as
  templates if useful.
- Free. No AI. Ships immediate value and deepens retention on a model that
  already exists.

---

## AI-assist (Phase 3, metered paid)

Reuses the Ask AI Claude infra (`src/routes/api/ask-ai.ts`, the corpus pattern,
adaptive thinking, prompt caching). New endpoints, each wallet-metered:
- **Draft from a sentence:** "By end of quarter, 20% close rate on qualified
  leads" → fills Describe, the 5 SMART fields, suggests milestones with dates,
  lists likely resources + obstacles. (The filled PDF example is the gold
  few-shot.)
- **Critique my Rock:** flags weak SMART criteria ("Measurable is vague — how
  will you verify?"), unrealistic dates, missing finish line.
- **Suggest milestones / resources / obstacles** as targeted helpers.
Each call: pre-check wallet, run, debit from real tokens, show the cost. Free
users see the buttons with an "add credits to use AI" upsell (GHL "Turn them
on" pattern).

---

## The full ecosystem (later phases, same rails)

- **Add-on products** (GHL "Ad Manager" pattern): subscribe to a feature for
  $/mo. Pure entitlements + a recurring Stripe charge → wallet/sub. The
  Premium Support and Private plans already shipped are the first two add-ons in
  spirit; formalize the framework.
- **Marketplace:** third parties list apps/integrations; OTP takes a cut.
  Needs the entitlements + billing rails (done by Phase 2) + a listing/dev
  surface + install/uninstall + revenue share. Biggest build; comes after the
  primitive proves out.
- **Coach reselling:** coaches already exist (`/settings/coaches`). Let a coach
  resell add-ons / services to their client orgs with a rev-share line on the
  wallet ledger. Layer on existing rails, not a new system.
- **Integrations:** MCP/API already exists; integrations become marketplace
  listings or add-ons.

---

## Sequencing summary

| Phase | What | Billing needed | Risk |
|---|---|---|---|
| 1 | Free SMART Rock builder | none | low |
| 2 | Wallet + entitlements + ledger + Billing page (Stripe-funded) | builds it | medium |
| 3 | AI-assist on Rock builder (metered) | uses Phase 2 | medium |
| 4 | Add-on products framework | uses Phase 2 | medium |
| 5 | Marketplace (listings, install, rev-share) | uses Phase 2+4 | high |
| 6 | Coach reselling (rev-share on rails) | uses Phase 2+4 | medium |

## The assignment (before Phase 3)

Pin the **wallet economics** with one real-world signal: ask Victor (first
paying customer) or one other active org a single question — "If OTP could draft
your quarterly Rock and flag weak goals for you, would you spend credits on it,
and does $X for ~N AI actions feel fair?" That one answer sets the markup
multiple (the gross-margin lever) and confirms the free/paid line before we
build metered billing. Phase 1 (free builder) needs no validation and can start
now.
