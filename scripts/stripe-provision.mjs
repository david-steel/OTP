// scripts/stripe-provision.mjs
//
// One-time: create the OTP per-agent subscription Product + Prices in Stripe.
// Run with your TEST key FIRST, copy the printed price IDs into Railway env,
// validate end-to-end in test mode, then repeat with the live key.
//
//   STRIPE_SECRET_KEY=sk_test_xxx node scripts/stripe-provision.mjs
//
// The key prefix decides the mode: sk_test_ -> test products, sk_live_ -> live.
import Stripe from 'stripe';

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error('Set STRIPE_SECRET_KEY first (use an sk_test_ key before sk_live_).');
  process.exit(1);
}
const mode = key.startsWith('sk_live_') ? 'LIVE' : 'TEST';
const stripe = new Stripe(key);

const product = await stripe.products.create({
  name: 'OTP agent seat',
  description: 'Per-AI-agent monthly seat on the OTP org chart. Humans are free.',
});

const basic = await stripe.prices.create({
  product: product.id,
  currency: 'usd',
  unit_amount: 1200, // $12 / agent / month
  recurring: { interval: 'month' },
  nickname: 'Agent seat - Basic ($12/agent/mo)',
});

const apimcp = await stripe.prices.create({
  product: product.id,
  currency: 'usd',
  unit_amount: 1600, // $16 / agent / month (agent uses API + MCP)
  recurring: { interval: 'month' },
  nickname: 'Agent seat - API+MCP ($16/agent/mo)',
});

console.log(`\n[${mode}] Created Stripe product + prices.\n`);
console.log('Product:', product.id);
console.log('\nSet these two as Railway env vars:\n');
console.log('  STRIPE_PRICE_AGENT_BASIC=' + basic.id);
console.log('  STRIPE_PRICE_AGENT_APIMCP=' + apimcp.id);
console.log('\nThen set BILLING_ENABLED=true (test mode) to expose the subscribe button.\n');
