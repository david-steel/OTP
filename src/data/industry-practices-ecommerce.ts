/**
 * E-Commerce Coordination Playbook
 * Original OTP content -- coordination patterns for online retail teams
 * running AI agent teams across inventory, fulfillment, pricing, and CX.
 */

export interface IndustryPractice {
  term: string;
  definition: string;
  category: string;
  failureMode: string;
  evidence: 'HUMAN_DEFINED_RULE' | 'OBSERVED_REPEATEDLY' | 'MEASURED_RESULT';
}

export const ECOMMERCE_PRACTICES: IndustryPractice[] = [
  // ---- Inventory Coordination ----
  {
    term: 'Single Source of Inventory Truth',
    definition: 'One agent owns the inventory count. The website, marketplace listings, warehouse system, and POS all read from this agent\'s state. Never let two systems independently track the same SKU\'s quantity. The inventory agent reconciles all sources into one number.',
    category: 'Inventory',
    failureMode: 'Shopify shows 5 units, Amazon shows 3, the warehouse has 2. A customer orders on Shopify. The inventory agent tries to fulfill but the warehouse is empty. The order is cancelled, the customer leaves a 1-star review, and the marketplace listing stays up selling phantom stock.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Low Stock Cascade Alert',
    definition: 'When inventory for a SKU drops below the reorder threshold, the inventory agent triggers a cascade: notify the purchasing agent to reorder, tell the pricing agent to consider raising price or pausing ads, and tell the marketplace agent to reduce quantity buffers. One signal, three coordinated responses.',
    category: 'Inventory',
    failureMode: 'A bestseller drops to 4 units. The ad agent keeps spending $200/day driving traffic. All 4 sell in an hour. The listing goes out of stock. The ad spend for the remaining 23 hours of the day drives traffic to a sold-out page. $180 wasted.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Dead Stock Detection',
    definition: 'The inventory agent flags SKUs with zero sales in 60+ days, cross-referenced with current ad spend and page views. Dead stock with ad spend is an active money burn. Dead stock with page views is a conversion problem. Dead stock with neither is a candidate for liquidation or removal.',
    category: 'Inventory',
    failureMode: '200 SKUs sit in the warehouse for 6 months. Storage fees accumulate. Nobody runs the report because nobody owns dead stock detection. When someone finally looks, $15K in storage fees have eaten the margin on those products.',
    evidence: 'MEASURED_RESULT',
  },

  // ---- Order Fulfillment ----
  {
    term: 'Fulfillment SLA Monitoring',
    definition: 'The fulfillment agent tracks every order from payment to shipment against the promised SLA (same-day, next-day, 3-5 business days). Orders approaching SLA breach get escalated with the specific blocker: warehouse delay, carrier issue, payment hold, or inventory mismatch.',
    category: 'Fulfillment',
    failureMode: 'A "next day delivery" order sits in the warehouse for 3 days because the picker could not find the item. The customer contacts support. Support has no visibility into warehouse status. The customer gets a generic "we\'re looking into it" response and files a chargeback.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Split Shipment Coordination',
    definition: 'When an order contains items from multiple warehouses or with different availability dates, the fulfillment agent decides: ship partial now and partial later, or hold and ship complete. The decision follows rules based on customer tier, item value, and shipping cost. The customer agent communicates the decision proactively.',
    category: 'Fulfillment',
    failureMode: 'An order with 3 items ships in 3 separate packages because each item was in a different warehouse. The customer pays one shipping fee but receives 3 deliveries on 3 different days. They contact support confused. Shipping cost triples.',
    evidence: 'HUMAN_DEFINED_RULE',
  },
  {
    term: 'Return-to-Inventory Speed',
    definition: 'The returns agent tracks returned items from receipt to restocked status. Target: returned items back in sellable inventory within 24 hours of warehouse receipt. Items sitting in returns limbo are invisible to the inventory agent and cannot be sold.',
    category: 'Fulfillment',
    failureMode: 'Returns pile up in the inspection queue. 50 units of a popular item are "in transit" in the returns system but physically sitting on a shelf. The inventory agent shows them as unavailable. The purchasing agent reorders unnecessarily.',
    evidence: 'MEASURED_RESULT',
  },

  // ---- Pricing & Promotions ----
  {
    term: 'Promotion Coordination Lock',
    definition: 'Before the pricing agent activates any promotion (discount, BOGO, free shipping threshold), it checks with the inventory agent (do we have enough stock?), the margin agent (does the promotion stay above floor margin?), and the marketplace agent (does this violate any channel pricing rules?). All three must clear before activation.',
    category: 'Pricing',
    failureMode: 'A 40% off promotion goes live on the website. The marketplace agent does not know. Amazon\'s price parity bot detects the lower price and suspends the listing. The bestseller disappears from Amazon for 3 days during peak season.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Dynamic Pricing Guardrails',
    definition: 'The pricing agent can adjust prices within guardrails: never below floor margin, never more than 20% change in 24 hours, never below MAP (minimum advertised price) if set by the brand. Changes outside guardrails require human approval. The audit agent logs every price change with the reason.',
    category: 'Pricing',
    failureMode: 'The pricing agent detects a competitor price drop and matches it. The new price is below cost. The product sells 500 units at a loss before anyone notices. The pricing agent had no floor to prevent this.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Margin-Aware Ad Spend',
    definition: 'The advertising agent checks product margin before setting ad budgets. High-margin products get higher ad-to-revenue ratios. Products below 20% margin get reduced spend or no spend. The pricing agent and the ad agent share a live margin feed so ad decisions reflect current pricing.',
    category: 'Pricing',
    failureMode: 'The ad agent spends $50/day on a product with $3 margin. ROAS looks great (8x) but the actual profit per sale is negative after ad cost. Nobody connects ad spend to product margin. The store grows revenue while losing money.',
    evidence: 'MEASURED_RESULT',
  },

  // ---- Customer Experience ----
  {
    term: 'Customer History Unification',
    definition: 'The support agent has access to the complete customer timeline: orders, returns, support tickets, reviews, loyalty points, lifetime value. When a customer contacts support, the agent sees everything in one view. No asking "what was your order number?" when the system already knows.',
    category: 'Customer Experience',
    failureMode: 'A VIP customer (50+ orders, $8K lifetime value) contacts support about a defective item. The support agent treats them like a first-time buyer and offers a standard return process. The customer feels unrecognized and switches to a competitor.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Review Response Coordination',
    definition: 'The reputation agent monitors reviews across all channels (website, Amazon, Google). Negative reviews (3 stars or below) trigger an immediate alert to the support agent with customer order history. The support agent drafts a response within 4 hours. The response addresses the specific issue, not a generic template.',
    category: 'Customer Experience',
    failureMode: 'A 1-star review sits unanswered for 2 weeks on Amazon. It mentions a specific defect. 200 potential buyers see the review with no response. Conversion rate on that listing drops 15%.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Proactive Shipping Notification',
    definition: 'The customer agent monitors carrier tracking data and proactively notifies customers of delays before they ask. "Your order is running 1 day behind schedule. New estimated delivery: Thursday." Proactive communication reduces "where is my order?" tickets by 60%.',
    category: 'Customer Experience',
    failureMode: 'A carrier delay affects 200 orders. Nobody notifies the customers. 80 of them contact support over 3 days. Each ticket costs $5 to handle. The support queue backs up. Response times spike to 48 hours. More customers complain about slow support.',
    evidence: 'MEASURED_RESULT',
  },

  // ---- Marketplace Management ----
  {
    term: 'Channel-Specific Listing Agent',
    definition: 'Each marketplace (Amazon, Walmart, eBay, Shopify) gets its own listing agent that understands that channel\'s rules, SEO patterns, image requirements, and compliance needs. A generic "push to all channels" approach violates platform-specific requirements.',
    category: 'Marketplace',
    failureMode: 'The same product description is pushed to Amazon and Walmart. Amazon suppresses the listing because the title exceeds 200 characters. Walmart flags it because the description contains promotional language ("best seller!"). Both listings go inactive.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Channel Profitability Tracking',
    definition: 'The marketplace agent tracks true profitability per channel after fees, shipping, returns, and ad spend. A product that looks profitable on Shopify (no fees) may be unprofitable on Amazon (15% referral fee + FBA). The pricing agent uses channel-specific margins to set channel-specific prices.',
    category: 'Marketplace',
    failureMode: 'A product sells well on Amazon. The team scales ad spend. After accounting for referral fees, FBA fees, and PPC costs, the product loses $2 per unit. Nobody ran the channel-specific P&L. Revenue grows, profit shrinks.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Cross-Channel Inventory Buffer',
    definition: 'The marketplace agent reserves inventory buffers per channel based on velocity. Amazon gets a 20-unit buffer because FBA restocking takes 7 days. Shopify gets a 5-unit buffer because fulfillment is same-day. The inventory agent enforces these buffers to prevent overselling on any single channel.',
    category: 'Marketplace',
    failureMode: 'Amazon FBA stock runs out. Restocking takes 10 days. During those 10 days, the listing ranking drops, the PPC campaigns pause, and the organic position is lost. It takes 6 weeks to recover the previous ranking.',
    evidence: 'OBSERVED_REPEATEDLY',
  },

  // ---- Analytics & Optimization ----
  {
    term: 'Conversion Funnel Ownership',
    definition: 'The analytics agent owns the full conversion funnel: traffic source, landing page, product page, cart, checkout, confirmation. Each stage has an owner agent (ad agent owns traffic, listing agent owns product page, checkout agent owns cart-to-purchase). The analytics agent identifies where the funnel leaks and routes the insight to the right owner.',
    category: 'Analytics',
    failureMode: 'Cart abandonment is 78%. The ad team thinks it is a traffic quality problem. The product team thinks it is a pricing problem. The checkout team thinks it is a UX problem. Nobody owns the full funnel, so nobody diagnoses the actual bottleneck: a surprise shipping fee at checkout.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Cohort-Based Customer Analysis',
    definition: 'The analytics agent segments customers by acquisition cohort (month + source) and tracks lifetime value, repeat purchase rate, and average order value over time. This reveals which acquisition channels bring loyal customers vs one-time buyers. The ad agent uses this to shift budget toward high-LTV channels.',
    category: 'Analytics',
    failureMode: 'The ad agent optimizes for lowest CPA. Customers from TikTok cost $8 each but buy once and never return. Customers from email cost $15 but have 4x lifetime value. The store acquires cheap customers who do not come back.',
    evidence: 'MEASURED_RESULT',
  },

  // ---- Catalog Management ----
  {
    term: 'Product Data Enrichment Pipeline',
    definition: 'New products enter through a structured pipeline: basic data (title, price, SKU) first, then the enrichment agent adds descriptions, images, attributes, and SEO keywords. The listing agent cannot publish until the enrichment pipeline is complete. This prevents half-finished listings from going live.',
    category: 'Catalog',
    failureMode: 'A batch of 50 new products is uploaded with just titles and prices. The listing agent pushes them live immediately. 50 products appear on the site with no images, no descriptions, and no search keywords. They are invisible to search and look unprofessional to anyone who finds them.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Seasonal Catalog Coordination',
    definition: 'The catalog agent maintains a seasonal calendar: when to surface holiday collections, when to suppress out-of-season items, when to pre-stage upcoming seasonal products. The ad agent, the email agent, and the merchandising agent all read from this calendar so seasonal transitions are coordinated, not ad hoc.',
    category: 'Catalog',
    failureMode: 'It is December 27. The homepage still features Christmas gift guides. The email agent sends a "last minute gift ideas" campaign. The ad agent is still running holiday keywords. Nobody coordinated the seasonal transition. The store looks stale and out of touch.',
    evidence: 'OBSERVED_REPEATEDLY',
  },

  // ---- Operations ----
  {
    term: 'Daily Health Dashboard',
    definition: 'The operations agent compiles a daily health report: orders (placed, shipped, pending), revenue vs target, top-selling and worst-selling SKUs, support ticket volume, return rate, ad spend vs ROAS. Every agent contributes its metrics to one view. The founder reads one report, not eight.',
    category: 'Operations',
    failureMode: 'Each agent sends its own report. The ad agent reports great ROAS. The support agent reports high ticket volume. Nobody connects that the high-ROAS product is also the one generating 60% of support tickets due to a quality issue.',
    evidence: 'HUMAN_DEFINED_RULE',
  },
  {
    term: 'Peak Season Coordination Protocol',
    definition: 'Before peak periods (Black Friday, Prime Day, holiday season), the operations agent runs a readiness check: inventory levels sufficient, warehouse capacity confirmed, support staffing scaled, ad budgets pre-approved, promotion calendar locked. The check happens 14 days before peak, not the day before.',
    category: 'Operations',
    failureMode: 'Black Friday hits. The bestseller sells out in 2 hours because nobody pre-stocked based on the ad budget. The support team is understaffed because nobody projected ticket volume from the promotion. The warehouse is backed up because nobody scheduled extra shifts.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
];

export const ECOMMERCE_INDUSTRY_META = {
  slug: 'ecommerce',
  name: 'E-Commerce',
  description: 'Coordination practices for online retail teams running AI agent teams across inventory management, order fulfillment, pricing, marketplace operations, and customer experience. Built for the speed and complexity of multi-channel e-commerce.',
  practiceCount: ECOMMERCE_PRACTICES.length,
  icon: 'shopping-cart',
};
