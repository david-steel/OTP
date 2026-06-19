# Portfolio — design + roadmap

**Status:** v1 shipped (behind the `portfolio` Labs flag, off by default). v2.0 building. v2.1 (BYOK + enterprise tier) scoped, partially blocked on a pricing decision.

A **Portfolio** is an OTP organization composed of other organizations — for PE firms, coaches, franchisors, and multi-org operators. It is itself a row in `organizations` (`kind='portfolio'`, `isPrivate=true`, synthetic `clerkOrgId`), so it reuses org-scoped machinery (members, KPIs, meetings) for free.

## Decisions locked
- **Name:** Portfolio.
- **Roll-up control:** top-down with a member private flag (`kpis.rollup_excluded`). Parent can pull any member KPI; a member can block specific KPIs.
- **Super-members (people):** must already belong to a member org.
- **Portfolio = an org row** (not a separate table).
- **Existing-org onboarding (v2):** default **Model A** — create a parent Portfolio *above* an existing org and keep that org as a normal member (it keeps running its own ops). **Model B** (promote-in-place, flip `kind`) offered for pure holdcos.
- **Attach flows (v2):** both — super-admin forced link (`/admin`), and invite → consent (portfolio invites an org; that org's owner accepts; `portfolio_members.status` `pending → active | declined`).
- **Presets (v2):** portfolio-level presets inherited by member orgs, **overridable by default**, with an optional per-group **lock** (`portfolioPresets.locked`) for PE-style enforcement. Sidebar preset is live; `settings` group wired but inert until an org settings store exists.

## Shipped / building

### v1.0 (shipped)
Schema (`organizations.kind`, `kpis.rollup_excluded`, `portfolio_members`, `portfolio_metric_sources`, boot self-heal); weighted super-metric aggregator (respects `rollup_excluded`, validates every source belongs to a linked member org); portfolio service + API (create/link/metric/recompute/meeting/detail, membership-gated); org switcher (validated active-org cookie in `getAuthOrg`/guards, "Switch company" account menu); pages `/portfolio` + `/portfolio/:id`; portfolio-context sidebar (amber-on-ink recolor + badge + scoped nav). Polish: aggregator skip-logging, detail-page loop guard, idempotent creation.

### v2.0 (building)
- **Existing-org onboarding:** `createPortfolioAboveOrg`, `promoteOrgToPortfolio` + a super-admin Portfolios panel in `/admin` (create-above / promote / force link-unlink / list).
- **Invite + consent:** `portfolio-invites` service + API; "Pending invitations" surface on `/portfolio` with Accept/Decline.
- **Presets:** `portfolio-presets` resolver (parent lookup, lock-aware merge), editor on the portfolio detail page, and a fail-safe `server.ts` preHandler change so member orgs render the inherited sidebar.

> Note — linking an **org** transfers no data and changes no ownership; the portfolio only aggregates, and the member controls roll-up via the private flag. Attaching a **person** is the separate super-member roster (must belong to a member org). This should be stated in the member-facing UI to keep trust.

## v2.1 (SHIPPED — inert until activated) — Enterprise tier + BYOK AI key

**Built and shipped.** Enterprise tier flag is live (flips on portfolio create / enabling the `portfolio` Labs feature; idempotent, one-way). BYOK is fully built and security-reviewed (SHIP-READY) but **dormant until you provision the encryption secret** — until then, all AI features keep using the platform key exactly as before.

### Activation (one step, by David)
Set a 32-byte master key in Railway, then redeploy:
```
# generate once:
openssl rand -hex 32          # or: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# add to Railway env (production service):
AI_KEYS_ENCRYPTION_KEY=<the 64-hex value>
```
Rotating this value makes previously-stored customer keys undecryptable (they silently fall back to the platform key, no crash) — customers would re-enter their keys. Treat it as a long-lived secret, backed up separately from the DB.

Once set: an owner/admin sets their key at **Settings → Company (Bring your own AI key)** for a normal org, or while switched into a **Portfolio** for a portfolio-wide key. Resolution order: member-org key → parent-portfolio key → platform default.

### Original scope notes

### Enterprise pricing — SHIPPED (test-mode; activate with live keys)
Plan: **$10/agent-seat/mo with a 25-seat floor** (= $250/mo base), +$10/mo per additional seat, **+$199/mo optional support**, BYOK required, data never used to train/teach. Source of truth: `src/shared/enterprise-pricing.ts`.

Built end-to-end and security-reviewed (SHIP-READY): find-or-create Stripe Price objects (stable `lookup_key`s), self-serve **Stripe Checkout (subscription mode)** from Settings→Billing, subscription webhooks reconciling the `subscriptions` table + `organizations.plan_tier`, seat-quantity sync on agent add/remove, owner/admin gating, an Enterprise card on `/pricing`. **No silent charges** — the Portfolio toggle sets the *tier*; an actual charge requires the owner to complete Checkout + enter a card.

**Activation (David), all gated behind `STRIPE_BILLING_LIVE`:**
```
# Stripe keys (test first; sk_test_… = no real money):
STRIPE_SECRET_KEY=sk_test_…           # or sk_live_… when going live
STRIPE_WEBHOOK_SECRET=whsec_…         # from the Stripe webhook endpoint config
STRIPE_BILLING_LIVE=true              # gates the whole enterprise flow on
APP_BASE_URL=https://orgtp.com        # Checkout redirect base
```
Point a Stripe webhook at `POST https://orgtp.com/webhooks/stripe` for: `checkout.session.completed`, `customer.subscription.created/updated/deleted`, `invoice.payment_failed`. Test the full flow in Stripe **test mode** (test card 4242…) before swapping to `sk_live_…`. Until `STRIPE_BILLING_LIVE=true`, every money endpoint returns 503 (inert).

Follow-ups (not blockers): wire `org_entitlements.planTier` (today `organizations.plan_tier` is the authoritative gate); the scaffolded auto-recharge cron is still unwired.

### BYOK (bring-your-own AI key)
Customer supplies their own Anthropic/OpenAI (or other) API key at the **org or Portfolio level**; all OTP AI features use that key, so their AI data stays in their account — moving data-handling responsibility/security to them.
- **Storage:** encrypted at rest, never logged, masked in UI, server-side use only.
- **Resolution order:** portfolio key → member-org key → OTP default.
- **Key level:** both org-level and portfolio-level supported (portfolio key applies to all members unless a member sets its own).
- Implementation seam + encryption approach being mapped by a research pass before build.

## Open decisions for David
1. Enterprise price + packaging (gates billing wiring).
2. Admin onboarding: Model A default only, or expose both Model A + Promote buttons? (Currently building both.)
3. BYOK default level when both a portfolio key and a member key exist (current plan: member key wins for that member; portfolio key is the fallback).
