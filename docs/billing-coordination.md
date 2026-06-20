# Billing is a serialized zone

**Why this exists:** On 2026-06-19 multiple Claude Code sessions built billing in
parallel. Git auto-merged the text but the combined code failed to compile (a red
prod deploy) and one session's `git stash` silently reverted another's in-flight
edit. Billing touches money, so we serialize it: **one session edits billing at a
time.**

## Rule
Before editing ANY billing-sensitive file below, **acquire the billing lock**.
If it's held by another session, do NOT edit — wait or coordinate. Release the
lock only after your change is **merged to `main`**.

```bash
scripts/billing-lock.sh status                 # is anyone holding it?
scripts/billing-lock.sh acquire "enterprise checkout fix"   # claim it
# ... do the billing work, open PR, merge ...
scripts/billing-lock.sh release                # hand it back
```

The lock is a `mkdir`-atomic directory (`.billing-lock/`, gitignored) shared
across sessions on this checkout. `acquire` fails loudly if held (it is the real
mutex). `release` is advisory: it removes the lock and prints who held it — so
run `status` first and don't release a fresh lock that isn't yours. `release`
also clears a stale lock when the owner is clearly gone.

## Billing-sensitive files (acquire the lock before touching any of these)
- `src/routes/api/billing.ts` — wallet top-up + **the Stripe webhook** (single switch for all `customer.subscription.*` / checkout / invoice events)
- `src/routes/api/enterprise.ts` — enterprise checkout / status / cancel
- `src/routes/api/org-ai-keys.ts` — BYOK key management
- `src/routes/pages/sections/dashboard.ts` — `/settings/billing` page + the **standard per-agent checkout** + agent-cost estimate
- `src/services/enterprise-billing.ts` — Prices, checkout, `recordSubscriptionFromStripe`, `syncEnterpriseSeats`, `desiredSeatQuantity`, `seatItemId`
- `src/services/billing-reconcile.ts` — hourly seat-quantity reconcile job
- `src/services/token-metering.ts` — platform-key 2× wallet metering helper
- `src/services/wallet.ts` — `debitWallet` / `creditWallet` / ledger
- `src/services/stripe.ts` — Stripe client, customer, checkout, webhook verify
- `src/shared/enterprise-pricing.ts`, `src/shared/standard-pricing.ts`, `src/shared/ai-pricing.ts` — pricing source of truth
- `src/db/ensure-subscriptions.ts`, `src/db/ensure-ai-keys.ts`, `src/db/ensure-wallets.ts` — billing schema self-heal
- The billing tables in `src/db/schema.ts` (`subscriptions`, `orgWallets`, `walletLedger`, `orgAiKeys`, `organizations.plan_tier`/`stripeCustomerId`) — if you add a column here for billing, hold the lock
- The AI call sites where token metering is wired: `src/routes/api/ask-ai.ts`, `src/routes/api/rock-ai.ts`, `src/routes/api/meetings.ts`, `src/services/agent-runtime.ts` — when changing the **metering** in them

## How the billing layer fits together (so you don't re-collide)
- **Two plans, one `subscriptions` row per org**, discriminated by `subscriptions.plan_kind` (`enterprise` | `standard_agent`). Enterprise = $10/seat, 25-seat floor, lookup_key Prices. Standard = $16/agent, env-var Prices.
- **One webhook** (`billing.ts`) → `recordSubscriptionFromStripe` is the single writer of the `subscriptions` row + `plan_tier` (only enterprise subs touch `plan_tier`). Do not add a second `customer.subscription.*` branch.
- **Seat quantity** comes from one place: `desiredSeatQuantity(orgId, planKind)`; both `syncEnterpriseSeats` (on agent change) and the reconcile job use it.
- **Mutual exclusion**: an org can't run both plans (both checkouts refuse if the other is active).
- **Token metering**: platform-key usage debits the wallet at 2× via `token-metering.ts`; BYOK never charged. Off behind `WALLET_METERING_ENABLED`.
- Activation env: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_BILLING_LIVE`, `BILLING_ENABLED`, `STRIPE_PRICE_AGENT_*`, `WALLET_METERING_ENABLED`, `AI_KEYS_ENCRYPTION_KEY`, `APP_BASE_URL`. See `docs/portfolio-v2.md`.
