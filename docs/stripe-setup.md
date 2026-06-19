# Stripe hookup runbook (OTP)

Two billing paths share one Stripe customer per org. **Do everything in TEST mode
first, validate a real test transaction, then repeat the env values with live keys.**

All billing is gated: with no `STRIPE_SECRET_KEY` every money endpoint 503s, and
the subscription path also requires `BILLING_ENABLED=true`. Nothing can charge
until both are set.

## 1. Wallet / pay-per-use (already built — just turn on)

Funds an org's credit wallet via Stripe Checkout; a signed webhook credits the
wallet idempotently.

1. Stripe Dashboard (test mode) → Developers → API keys → copy the **secret key** (`sk_test_…`).
2. Developers → Webhooks → **Add endpoint** → URL `https://orgtp.com/webhooks/stripe`.
   Events: `checkout.session.completed`, `payment_intent.succeeded`,
   `customer.subscription.created`, `customer.subscription.updated`,
   `customer.subscription.deleted`. Copy the **Signing secret** (`whsec_…`).
3. Railway env (test values):
   - `STRIPE_SECRET_KEY=sk_test_…`
   - `STRIPE_WEBHOOK_SECRET=whsec_…`
   - `APP_BASE_URL=https://orgtp.com`
4. Validate: go to Settings → Billing → add wallet credit; pay with test card
   `4242 4242 4242 4242`; confirm the wallet balance increments (the webhook fired).

## 2. Per-agent subscription ($12/agent/mo, $16 if the agent uses API+MCP)

Quantity = agent count on the chart; humans are free.

1. Create the products/prices (uses the same secret key):
   ```
   STRIPE_SECRET_KEY=sk_test_… node scripts/stripe-provision.mjs
   ```
   It prints `STRIPE_PRICE_AGENT_BASIC=price_…` and `STRIPE_PRICE_AGENT_APIMCP=price_…`.
2. Railway env:
   - `STRIPE_PRICE_AGENT_BASIC=price_…`
   - `STRIPE_PRICE_AGENT_APIMCP=price_…`
   - `BILLING_ENABLED=true`   ← exposes the "Start subscription" button
3. Validate: Settings → Billing → **Start subscription** → checkout with the test
   card → confirm a row appears in the `subscriptions` table (status `active`,
   `agent_quantity` = your agent count). Manage/cancel via POST `/settings/billing/portal`.

## Going live

Repeat 1–2 with `sk_live_…` keys, a live webhook endpoint + its `whsec_…`, and
live `price_…` ids from `scripts/stripe-provision.mjs` run with the live key.

## Known follow-ups (not in this increment)

- **Quantity sync:** the subscription quantity is set at checkout from the current
  agent count; it does not auto-update when agents are added/removed later. Add a
  reconcile job (Stripe `subscriptions.update` with the new quantity) before live.
- **Auto-recharge cron** for the wallet (`chargeAutoRecharge` exists but isn't
  scheduled) needs its own test-mode pass (saved-card off_session + SCA declines).
- **Portal button** in `settings-billing.ejs` (route exists; UI button TBD).
