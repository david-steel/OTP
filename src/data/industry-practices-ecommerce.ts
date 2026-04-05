/**
 * E-Commerce Coordination Playbook
 * Original OTP content -- coordination practices for AI agent teams
 * managing e-commerce operations.
 *
 * Covers: inventory, order fulfillment, customer service, pricing/promotions,
 * returns, marketplace management, and catalog management.
 *
 * These are real coordination practices, not scraped content.
 */

import { IndustryPractice } from './industry-practices-agency.js';

export const ECOMMERCE_PRACTICES: IndustryPractice[] = [
  // ---- Inventory Coordination ----
  {
    term: 'Single Source of Inventory Truth',
    definition: 'One agent owns the inventory count. The website, marketplace listings, warehouse system, and POS all read from this agent\'s state. Never let two systems independently track the same SKU\'s quantity. The inventory agent reconciles all sources hourly and resolves discrepancies by querying the warehouse management system as the physical ground truth.',
    category: 'Inventory',
    failureMode: 'Shopify shows 5 units, Amazon shows 3, the warehouse has 2. A customer orders on Shopify. The inventory agent tries to fulfill but the warehouse is empty. The order is cancelled, the customer leaves a 1-star review, and the marketplace listing stays up selling phantom stock.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Low Stock Cascade Alert',
    definition: 'When inventory for a SKU drops below the reorder threshold, the inventory agent triggers a cascade: notify the purchasing agent to reorder, tell the pricing agent to consider raising price or pausing ads, and tell the marketplace agent to reduce quantity buffers on slower channels. One signal, three coordinated responses. The reorder threshold is set per SKU based on lead time and sales velocity, not a flat number.',
    category: 'Inventory',
    failureMode: 'A bestseller drops to 4 units. The ad agent keeps spending $200/day driving traffic. All 4 sell in an hour. The listing goes out of stock. The ad spend for the remaining 23 hours of the day drives traffic to a sold-out page. $180 wasted, plus the organic ranking penalty for going out of stock.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Dead Stock Detection and Liquidation Routing',
    definition: 'The inventory agent flags SKUs with zero sales in 60+ days, cross-referenced with current ad spend, page views, and storage costs. Dead stock with ad spend is an active money burn. Dead stock with page views is a conversion problem. Dead stock with neither is a candidate for liquidation, bundling, or removal. The agent categorizes each dead SKU and routes to the appropriate agent for action.',
    category: 'Inventory',
    failureMode: '200 SKUs sit in the warehouse for 6 months. Storage fees accumulate at $0.75/unit/month. Nobody runs the report because nobody owns dead stock detection. When someone finally looks, $15K in storage fees have eaten the margin on those products entirely.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Pre-Order and Backorder Inventory Coordination',
    definition: 'When a product is available for pre-order, the inventory agent tracks committed units separately from available units. The marketplace agent displays accurate availability dates. The fulfillment agent queues pre-orders for priority fulfillment when stock arrives. The customer communication agent sends shipping updates as the expected date approaches. Pre-order customers have the highest expectations and the lowest tolerance for silence.',
    category: 'Inventory',
    failureMode: 'A product launches with 500 pre-orders. Stock arrives 2 weeks late. Nobody updates the pre-order customers. 200 of them contact support asking "where is my order?" The support queue is overwhelmed. 50 customers cancel. The product launch that should have been a win becomes a customer service crisis.',
    evidence: 'OBSERVED_REPEATEDLY',
  },

  // ---- Order Fulfillment ----
  {
    term: 'Fulfillment SLA Monitoring with Blocker Identification',
    definition: 'The fulfillment agent tracks every order from payment to shipment against the promised SLA (same-day, next-day, 3-5 business days). Orders approaching SLA breach get escalated with the specific blocker: warehouse delay, carrier issue, payment hold, inventory mismatch, or address verification failure. The escalation includes a recommended resolution, not just a flag.',
    category: 'Fulfillment',
    failureMode: 'A "next day delivery" order sits in the warehouse for 3 days because the picker could not find the item (it was in the wrong bin). The customer contacts support. Support has no visibility into warehouse status. The customer gets a generic "we are looking into it" response and files a chargeback.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Split Shipment Decision Engine',
    definition: 'When an order contains items from multiple warehouses or with different availability dates, the fulfillment agent decides: ship partial now and partial later, or hold and ship complete. The decision follows rules based on customer tier (VIP gets faster partial), item value (high-value items ship immediately), and incremental shipping cost (split only if cost delta is under $X). The customer agent communicates the decision proactively before the first package ships.',
    category: 'Fulfillment',
    failureMode: 'An order with 3 items ships in 3 separate packages because each item was in a different warehouse. The customer pays one shipping fee but receives 3 deliveries on 3 different days. They contact support confused about why they got "part of their order." Shipping cost triples and the customer experience is fragmented.',
    evidence: 'HUMAN_DEFINED_RULE',
  },
  {
    term: 'Return-to-Inventory Speed Tracking',
    definition: 'The returns agent tracks returned items from warehouse receipt to restocked status. Target: returned items back in sellable inventory within 24 hours of receiving. Items sitting in returns limbo are invisible to the inventory agent and cannot be sold. The returns agent reports daily: items received, items inspected, items restocked, items rejected, average processing time.',
    category: 'Fulfillment',
    failureMode: 'Returns pile up in the inspection queue. 50 units of a popular item are "in transit" in the returns system but physically sitting on a shelf. The inventory agent shows them as unavailable. The purchasing agent reorders unnecessarily. The company pays for new stock while saleable returns sit unprocessed.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Carrier Performance Scorecard',
    definition: 'The fulfillment agent tracks carrier performance by: on-time delivery rate, damage rate, cost per package by zone, and customer complaint rate. When a carrier\'s on-time rate drops below 90% for 2 consecutive weeks, the fulfillment agent shifts volume to the next-best carrier for affected routes. Carrier selection is data-driven, not contract-driven.',
    category: 'Fulfillment',
    failureMode: 'The company uses one carrier for everything because they signed a volume discount contract. That carrier\'s performance degrades in Q4 due to holiday volume. 30% of packages arrive late. Customer complaints spike. The company cannot switch carriers mid-season because nobody tracked performance or maintained alternatives.',
    evidence: 'MEASURED_RESULT',
  },

  // ---- Pricing & Promotions ----
  {
    term: 'Promotion Coordination Lock',
    definition: 'Before the pricing agent activates any promotion (discount, BOGO, free shipping threshold), it checks with the inventory agent (do we have enough stock to support the expected demand?), the margin agent (does the promotion stay above floor margin?), and the marketplace agent (does this violate any channel pricing rules or MAP policies?). All three must clear before activation.',
    category: 'Pricing',
    failureMode: 'A 40% off promotion goes live on the website. The marketplace agent does not know. Amazon\'s price parity algorithm detects the lower price and suppresses the Buy Box. The bestseller disappears from Amazon for 3 days during peak season. Revenue loss exceeds the promotion\'s intended benefit.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Dynamic Pricing Guardrails',
    definition: 'The pricing agent can adjust prices within guardrails: never below floor margin (cost + minimum margin), never more than 20% change in 24 hours (prevents customer shock), never below MAP (minimum advertised price) if set by the brand, and never above a ceiling that triggers "price gouging" flags on marketplaces. Changes outside guardrails require human approval. The audit agent logs every price change with the trigger reason.',
    category: 'Pricing',
    failureMode: 'The pricing agent detects a competitor price drop and auto-matches it. The new price is below cost. The product sells 500 units at a $3/unit loss before anyone notices. $1,500 in direct losses, plus the pricing agent has now anchored the market expectation at the lower price.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Margin-Aware Ad Spend Allocation',
    definition: 'The advertising agent checks product margin before setting ad budgets. High-margin products (40%+) get aggressive ad-to-revenue ratios. Products below 20% margin get reduced spend or no spend. Products with negative margin after ad cost are paused immediately. The pricing agent and the ad agent share a live margin feed so ad decisions always reflect current pricing, not last week\'s pricing.',
    category: 'Pricing',
    failureMode: 'The ad agent spends $50/day on a product with $3 margin per unit. ROAS looks great (8x) but the actual profit per sale is negative after ad cost. Nobody connects ad spend to product margin because they are tracked in different systems. The store grows revenue while losing money on every sale.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Coupon Stacking and Abuse Detection',
    definition: 'The pricing agent monitors for coupon abuse patterns: same customer using multiple single-use codes via different accounts, coupon codes shared on deal sites that were intended for a specific audience, and stacking of promotions that were not designed to combine. When abuse is detected, the agent can disable the code, flag the order for review, or adjust the discount engine\'s stacking rules. A single leaked coupon code can cost $50K in a day.',
    category: 'Pricing',
    failureMode: 'A 30% off code intended for email subscribers leaks to a deal-sharing site. 2,000 orders come in using the code. Average margin drops below zero. The team discovers the leak 6 hours later. By then, $40K in below-cost orders have been placed and partially fulfilled.',
    evidence: 'OBSERVED_REPEATEDLY',
  },

  // ---- Customer Experience ----
  {
    term: 'Customer History Unification Across Channels',
    definition: 'The support agent has access to the complete customer timeline: orders across all channels, returns, support tickets, reviews, loyalty points, and lifetime value. When a customer contacts support, the agent sees everything in one view. No asking "what was your order number?" when the system already knows. VIP customers (top 10% by LTV) are flagged for priority routing.',
    category: 'Customer Experience',
    failureMode: 'A VIP customer (50+ orders, $8K lifetime value) contacts support about a defective item. The support agent treats them like a first-time buyer and offers a standard return process with a restocking fee. The customer feels unrecognized after years of loyalty and switches to a competitor.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Review Response Coordination with Product Quality',
    definition: 'The reputation agent monitors reviews across all channels (website, Amazon, Google, Trustpilot). Negative reviews (3 stars or below) trigger an immediate alert to the support agent with customer order history. The support agent drafts a personalized response within 4 hours. When 5+ reviews mention the same defect, the reputation agent alerts the product quality agent to investigate the batch or supplier.',
    category: 'Customer Experience',
    failureMode: 'A 1-star review sits unanswered for 2 weeks on Amazon. It mentions a specific product defect. 15 more reviews mention the same defect. 200 potential buyers see the negative reviews with no response. Conversion rate on that listing drops 15%. Meanwhile, the defective batch continues to ship because nobody connected the reviews to the quality issue.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Proactive Shipping Delay Notification',
    definition: 'The customer communication agent monitors carrier tracking data and proactively notifies customers of delays before they ask. "Your order is running 1 day behind schedule. New estimated delivery: Thursday." The notification includes the reason if known (weather, carrier volume) and a direct support link. Proactive communication reduces "where is my order?" tickets by 60% and dramatically reduces chargeback rates.',
    category: 'Customer Experience',
    failureMode: 'A carrier delay affects 200 orders. Nobody notifies the customers. 80 of them contact support over 3 days. Each ticket costs $5 to handle. The support queue backs up. Response times spike to 48 hours for all tickets, not just the delayed orders. More customers file chargebacks because they cannot reach anyone.',
    evidence: 'MEASURED_RESULT',
  },

  // ---- Marketplace Management ----
  {
    term: 'Channel-Specific Listing Compliance',
    definition: 'Each marketplace (Amazon, Walmart, eBay, TikTok Shop, Shopify) has its own listing rules: title length, image requirements, prohibited terms, category taxonomy. The marketplace agent maintains channel-specific templates and validates every listing against that channel\'s requirements before publishing. A generic "push to all channels" approach violates platform-specific requirements and gets listings suppressed.',
    category: 'Marketplace',
    failureMode: 'The same product description is pushed to Amazon and Walmart identically. Amazon suppresses the listing because the title exceeds 200 characters. Walmart flags it because the description contains promotional language ("best seller!"). Both listings go inactive. Revenue drops to zero on two channels simultaneously.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Channel Profitability Tracking After All Fees',
    definition: 'The marketplace analytics agent tracks true profitability per channel after all costs: referral fees, fulfillment fees, storage fees, return costs, advertising costs, and payment processing. A product that looks profitable on Shopify (minimal fees) may be unprofitable on Amazon (15% referral fee + FBA costs + PPC). Channel-specific pricing is set based on channel-specific margins, not a universal price.',
    category: 'Marketplace',
    failureMode: 'A product sells well on Amazon. The team scales ad spend because ROAS looks good. After accounting for referral fees, FBA fees, storage, and PPC costs, the product loses $2 per unit. Nobody ran the channel-specific P&L. Revenue grows while profit shrinks. The more they sell on Amazon, the more money they lose.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Cross-Channel Inventory Buffer Management',
    definition: 'The marketplace agent reserves inventory buffers per channel based on sales velocity and restocking time. Amazon FBA gets a 20-unit buffer because restocking takes 7-14 days. Shopify gets a 5-unit buffer because fulfillment is same-day from the warehouse. The inventory agent enforces these buffers to prevent overselling on any single channel while maximizing total availability.',
    category: 'Marketplace',
    failureMode: 'Amazon FBA stock runs out. Restocking takes 10 days. During those 10 days, the listing ranking drops, PPC campaigns auto-pause, the organic position is lost to competitors, and the Buy Box disappears. It takes 6 weeks to recover the previous ranking. A 10-day stockout costs 6 weeks of revenue.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Marketplace Policy Change Monitoring',
    definition: 'The compliance agent monitors each marketplace for policy changes, fee structure updates, and new requirements. When Amazon changes its category approval process, or Walmart updates its listing quality score criteria, the agent alerts the relevant team with: what changed, which listings are affected, deadline for compliance, and recommended action. Policy changes that go unnoticed result in listing suspensions.',
    category: 'Marketplace',
    failureMode: 'Amazon updates its image requirements for a product category. The seller\'s listings have non-compliant images. 3 weeks later, 50 listings are suppressed simultaneously. The team scrambles to reshoot product photos. 2 weeks of zero sales on those listings during a peak period.',
    evidence: 'OBSERVED_REPEATEDLY',
  },

  // ---- Returns & Post-Purchase ----
  {
    term: 'Return Reason Analysis Feeding Product Decisions',
    definition: 'The returns agent categorizes every return by reason: defective, wrong size, not as described, changed mind, better price elsewhere. Monthly, the analytics agent reports return rates by product and reason to the product team. If "not as described" exceeds 10% for a product, the listing agent must update photos and descriptions. If "wrong size" exceeds 15%, the sizing guide needs revision. Returns are product intelligence, not just logistics.',
    category: 'Returns',
    failureMode: 'A clothing item has a 35% return rate. The team assumes returns are normal for apparel. 60% of the returns say "wrong size." The sizing chart is wrong. After 6 months and 2,000 returns, someone finally checks the chart. It listed EU sizes in the US size column. $80K in shipping and restocking costs could have been avoided by fixing a chart in month one.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Refund-Before-Return for Low-Value Items',
    definition: 'For items where the return shipping cost exceeds the product value (typically under $15), the returns agent auto-approves a refund without requiring the physical return. The customer keeps the item. The cost of processing the return ($8-12 in shipping + labor) exceeds the value recovered. The decision threshold is set by the finance agent and reviewed monthly. Customer goodwill from instant refunds drives repeat purchases.',
    category: 'Returns',
    failureMode: 'A customer wants to return a $7 item. The company pays $8 in return shipping, $3 in processing labor, and receives a $7 item back (now used, often unsellable). Net cost: $4 loss. If they had just refunded and said "keep it," the cost would have been $7 and the customer would have been delighted.',
    evidence: 'MEASURED_RESULT',
  },

  // ---- Catalog Management ----
  {
    term: 'Product Data Enrichment Pipeline',
    definition: 'New products enter through a structured pipeline: basic data (title, price, SKU) first, then the enrichment agent adds descriptions, bullet points, images, attributes, SEO keywords, and marketplace-specific fields. The listing agent cannot publish until the enrichment pipeline is complete and the quality agent validates all required fields. This prevents half-finished listings from going live.',
    category: 'Catalog',
    failureMode: 'A batch of 50 new products is uploaded with just titles and prices. The listing agent pushes them live immediately. 50 products appear on the site with no images, no descriptions, and no search keywords. They are invisible to search and look unprofessional to anyone who finds them. Conversion rate on these listings is near zero.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Seasonal Catalog Coordination Calendar',
    definition: 'The catalog agent maintains a seasonal calendar: when to surface holiday collections, when to suppress out-of-season items, when to pre-stage upcoming seasonal products, and when to transition between seasons. The ad agent, the email agent, the merchandising agent, and the homepage agent all read from this calendar so seasonal transitions are coordinated across every customer touchpoint simultaneously.',
    category: 'Catalog',
    failureMode: 'It is December 27. The homepage still features Christmas gift guides. The email agent sends a "last minute gift ideas" campaign. The ad agent is still running holiday keywords. Nobody coordinated the seasonal transition. The store looks stale and behind. Customers who visit on December 28 get the impression nobody is running the store.',
    evidence: 'OBSERVED_REPEATEDLY',
  },

  // ---- Analytics & Operations ----
  {
    term: 'Conversion Funnel Ownership with Stage Routing',
    definition: 'The analytics agent owns the full conversion funnel: traffic source, landing page, product page, cart, checkout, confirmation. Each stage has an owner agent (ad agent owns traffic quality, listing agent owns product page conversion, checkout agent owns cart-to-purchase). When the funnel leaks at a specific stage, the analytics agent routes the insight to the right owner with data, not a vague "conversion is down."',
    category: 'Analytics',
    failureMode: 'Cart abandonment is 78%. The ad team thinks it is a traffic quality problem. The product team thinks it is a pricing problem. The checkout team thinks it is a UX problem. Nobody owns the full funnel, so nobody diagnoses the actual bottleneck: a surprise $12 shipping fee revealed at the last checkout step.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Cohort-Based Customer Lifetime Value Tracking',
    definition: 'The analytics agent segments customers by acquisition cohort (month + source) and tracks lifetime value, repeat purchase rate, and average order value over 30/60/90/180 days. This reveals which acquisition channels bring loyal customers vs one-time buyers. The ad agent uses this to shift budget toward high-LTV channels, not just lowest-CPA channels.',
    category: 'Analytics',
    failureMode: 'The ad agent optimizes for lowest CPA. Customers from TikTok cost $8 each but buy once and never return (LTV: $25). Customers from email cost $15 but return 4 times (LTV: $180). The store acquires cheap customers who never come back while underspending on the channel that builds a real business.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Peak Season Readiness Protocol',
    definition: 'Before peak periods (Black Friday, Prime Day, holiday season), the operations agent runs a readiness check 14 days out: inventory levels sufficient for projected demand, warehouse capacity confirmed, support staffing scaled, ad budgets pre-approved, promotion calendar locked, website load-tested, carrier capacity reserved. Each agent reports its readiness status. The operations agent identifies gaps while there is still time to fill them.',
    category: 'Analytics',
    failureMode: 'Black Friday hits. The bestseller sells out in 2 hours because nobody pre-stocked based on the ad budget\'s projected traffic. The support team is understaffed because nobody projected ticket volume from the promotion. The warehouse is backed up because nobody scheduled extra shifts. The website slows to 8-second load times because nobody load-tested. Every failure was preventable with a 14-day head start.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Daily Operations Health Dashboard',
    definition: 'The operations agent compiles a daily health report: orders (placed, shipped, pending, late), revenue vs daily/monthly target, top-selling and worst-selling SKUs, support ticket volume and response time, return rate trend, ad spend vs ROAS by channel, and inventory alerts. Every agent contributes its metrics to one view. The founder reads one report that connects the dots between departments.',
    category: 'Analytics',
    failureMode: 'Each agent sends its own report. The ad agent reports great ROAS. The support agent reports high ticket volume. Nobody connects that the high-ROAS product is also generating 60% of support tickets due to a quality defect. The company scales ad spend on a product that is destroying customer trust.',
    evidence: 'HUMAN_DEFINED_RULE',
  },
];

export const ECOMMERCE_INDUSTRY_META = {
  slug: 'ecommerce',
  name: 'E-Commerce',
  description: 'Coordination practices for AI agent teams managing e-commerce operations -- inventory management, order fulfillment, pricing and promotions, marketplace management, customer experience, returns, and catalog coordination. Built for the speed and multi-channel complexity of online retail.',
  practiceCount: ECOMMERCE_PRACTICES.length,
  icon: 'shopping-cart',
};
