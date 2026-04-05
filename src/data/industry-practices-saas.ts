/**
 * SaaS Company Coordination Playbook
 * Original OTP content -- coordination practices for AI agent teams
 * managing SaaS companies.
 *
 * Covers: product development, customer success, billing/subscription,
 * support ticketing, deployment pipelines, feature flagging, and onboarding.
 *
 * These are real coordination practices, not scraped content.
 */

import { IndustryPractice } from './industry-practices-agency.js';

export const SAAS_PRACTICES: IndustryPractice[] = [
  // ---- Deployment & Release ----
  {
    term: 'Deploy Agent Coordinates Rollback with Support Agent',
    definition: 'When the deploy agent rolls out a new version, it notifies the support agent with: what changed, which customers are affected, and known issues. If error rates spike post-deploy, the deploy agent initiates rollback and the support agent switches to a canned response template acknowledging the issue. Both agents must agree on the rollback trigger threshold before every deploy.',
    category: 'Deployment',
    failureMode: 'A deploy goes out at 2 PM. Error rates double. The deploy agent auto-rolls back at 2:15 PM. But the support agent has already sent 30 "we are investigating" replies with no context. When the rollback completes, the support agent keeps sending the old template. Customers get conflicting messages.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Feature Flag Lifecycle Ownership',
    definition: 'Every feature flag has an owning agent and an expiry date. The product agent creates flags with a maximum lifespan (default: 90 days). The cleanup agent audits all flags weekly. Flags past their expiry trigger an alert to the product agent: remove the flag and make the feature permanent, or extend with justification. Feature flags are technical debt with a timer.',
    category: 'Deployment',
    failureMode: 'The codebase has 347 feature flags. 200 of them are for features shipped 8+ months ago. Nobody knows which are safe to remove. New developers are afraid to touch them. The testing matrix is exponentially complex. A junior dev accidentally toggles an ancient flag in production and breaks billing for 10% of customers.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Staged Rollout with Automatic Canary Analysis',
    definition: 'The deploy agent rolls changes to 5% of traffic first. The monitoring agent watches error rates, latency, and key business metrics (signups, checkouts, API calls) for 15 minutes. If metrics stay within 2 standard deviations of baseline, the deploy agent proceeds to 25%, then 100%. If any metric breaches the threshold, the deploy agent halts and pages the on-call engineer. No human manually watches dashboards during deploys.',
    category: 'Deployment',
    failureMode: 'A deploy goes to 100% immediately. A subtle bug causes checkout failures for customers on a specific plan tier. It takes 45 minutes to detect because overall error rates only increased 3%. But 100% of Enterprise checkout attempts failed. A canary on 5% of traffic would have caught it in 2 minutes with zero customer impact.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Database Migration Coordination Protocol',
    definition: 'Before any schema migration, the deploy agent notifies: the performance agent (expected query impact), the backup agent (take a snapshot), the support agent (potential maintenance window), and the billing agent (pause retry logic during migration). Migrations that affect billing tables require the billing agent to verify data integrity post-migration before any charges process.',
    category: 'Deployment',
    failureMode: 'A migration adds an index to a 500M row table. It locks writes for 8 minutes. During that window, 200 subscription renewals fail silently. The billing agent retries them an hour later, but 15 customers were double-charged because the retry logic did not check for partial writes. The migration itself worked perfectly. The coordination failure caused the outage.',
    evidence: 'OBSERVED_REPEATEDLY',
  },

  // ---- Customer Success ----
  {
    term: 'Product Usage Health Score with Early Warning',
    definition: 'The customer success agent computes a health score for every account based on: login frequency trend, feature adoption breadth, support ticket sentiment, billing status, and API call volume. The score updates daily. When a score drops 20+ points in a 7-day window, the CS agent alerts the account manager with specific declining metrics. Churn does not happen overnight. It leaks over 30-60 days of declining engagement.',
    category: 'Customer Success',
    failureMode: 'An Enterprise customer stops using the advanced reporting feature they specifically asked for. Login frequency drops 50% over 3 weeks. Nobody notices because they are still paying. 60 days later, they send a cancellation email. The CSM calls in a panic. The customer says "we made the decision 6 weeks ago." The $48K/year account is gone.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Expansion Signal Detection',
    definition: 'The customer success agent monitors usage patterns that indicate expansion readiness: hitting seat limits, exceeding API rate limits, requesting features in a higher tier, inviting users who are rejected (seat cap). When these signals cluster for an account, the CS agent notifies the sales agent with the specific signals. Expansion conversations based on data convert 3x better than cold upsell pitches.',
    category: 'Customer Success',
    failureMode: 'A customer hits their 50-seat limit. 12 invitations fail. They email support asking for "a few more seats." Support replies with the upgrade pricing page. The customer wanted 5 seats, not a tier upgrade. A sales-aware CS agent would have offered a seat expansion at the current tier price. Instead, the customer sees a 60% price increase and starts evaluating competitors.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Renewal Risk Flagging 90 Days Out',
    definition: 'The billing agent identifies every account with a renewal date in the next 90 days. The CS agent evaluates each one against the health score, support ticket history, and engagement trend. Accounts with declining health get a proactive outreach plan: executive check-in at 90 days, value review at 60 days, renewal conversation at 30 days. Renewals are not administrative events. They are sales events that happen to existing customers.',
    category: 'Customer Success',
    failureMode: 'An annual contract renewal comes up in 2 weeks. The CSM reaches out for the first time in 3 months. The customer says "actually, we have been meaning to talk to you about some issues." There is no time to fix anything. The customer downgrades or churns. A 90-day runway would have surfaced the issues early enough to address them.',
    evidence: 'OBSERVED_REPEATEDLY',
  },

  // ---- Billing & Subscription ----
  {
    term: 'Billing Event Coordination with Product State',
    definition: 'The billing agent must verify product state before processing any charge: Is the account active? Is the feature being billed for actually provisioned? Has the plan changed since the last invoice? The product agent and billing agent synchronize state daily. Charging for features a customer does not have access to is the fastest way to generate support tickets and chargebacks.',
    category: 'Billing',
    failureMode: 'A customer downgrades from Enterprise to Pro on the 15th. The billing agent charges the Enterprise rate on the 1st because the plan change did not propagate. The customer disputes the charge. The support agent issues a refund. But the billing agent charges Enterprise again next month because the root cause (sync failure) was never fixed.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Dunning Sequence with Product Access Coordination',
    definition: 'When a payment fails, the billing agent owns a multi-step dunning sequence: Day 0 retry + email, Day 3 retry + urgent email, Day 7 final notice with grace period warning, Day 14 downgrade to free tier. The product agent must coordinate: features are not removed until the billing agent confirms the grace period has expired. No customer should lose access to their data because of a credit card expiry.',
    category: 'Billing',
    failureMode: 'A payment fails on a Tuesday. The billing agent sends emails. But the product agent independently revokes access on Wednesday because it detected an unpaid invoice. The customer was mid-presentation using the product. Their screen goes blank in front of their team. They had every intention of updating their card. Now they are humiliated and furious.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Usage-Based Billing Reconciliation',
    definition: 'For usage-based pricing (API calls, storage, compute), the metering agent and billing agent must reconcile daily. The metering agent reports raw usage. The billing agent applies pricing tiers, committed minimums, and overage rates. Discrepancies greater than 5% trigger an alert before any invoice is generated. Customers on usage-based plans check their bills carefully.',
    category: 'Billing',
    failureMode: 'The metering agent counts 1.2M API calls. The billing agent calculates based on 1.4M due to a timezone mismatch in the aggregation window. The customer is overcharged $800. They catch it because they track their own usage. One billing error on a usage-based plan erodes all trust in the billing system permanently.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Plan Change Proration Transparency',
    definition: 'When a customer changes plans mid-cycle, the billing agent must calculate the proration, show the math to the customer before charging, and coordinate with the product agent to activate/deactivate features at the exact moment the billing change takes effect. The support agent must have access to the proration calculation to answer "why was I charged this amount?"',
    category: 'Billing',
    failureMode: 'A customer upgrades from $49/mo to $99/mo on day 15. They expect to pay ~$50 for the remaining half-month. The billing agent charges $99 for the full next month plus a $50 proration they did not expect. The customer contacts support. The support agent cannot explain the math because they cannot see the billing agent\'s calculation. Three agents, zero coordination.',
    evidence: 'OBSERVED_REPEATEDLY',
  },

  // ---- Support ----
  {
    term: 'Ticket Routing with Product Context',
    definition: 'The support triage agent routes tickets based on: customer plan tier (Enterprise gets priority queue), feature area (billing tickets go to billing-trained agents), customer health score (at-risk accounts get senior agents), and current incident status (if there is a known outage, auto-tag related tickets). The triage agent reads from the product agent, billing agent, and CS agent before routing.',
    category: 'Support',
    failureMode: 'An Enterprise customer with $200K ARR submits a critical ticket. It enters the general queue. A junior support agent picks it up and sends a templated response. The customer\'s CTO emails the CEO directly. The ticket sat in a queue for 4 hours because the triage agent did not know the customer\'s tier or health score.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Known Issue Deflection at Ticket Creation',
    definition: 'The support agent maintains a list of currently known issues with workarounds. When a new ticket matches a known issue pattern (keyword match + affected feature + timeframe), the agent auto-responds with the workaround and links to the status page. It still creates the ticket for tracking but saves the customer a round-trip. Known issue deflection should handle 15-30% of incoming volume during incidents.',
    category: 'Support',
    failureMode: 'A deploy introduces a bug in the CSV export feature. 80 customers file tickets. 80 support agents manually investigate. 80 responses are sent individually. Each takes 15 minutes. 20 hours of support time for a bug that could have been deflected with a single known-issue notice posted in the first 10 minutes.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Support Ticket to Product Feedback Loop',
    definition: 'The analytics agent categorizes every support ticket by feature area and request type (bug, confusion, feature request, billing). Monthly, it reports the top 10 feature areas by ticket volume to the product agent. Feature areas generating 3x their baseline ticket volume get flagged as UX problems, not support problems. The fix is in the product, not in more support agents.',
    category: 'Support',
    failureMode: 'The "integrations" feature area generates 200 tickets per month. Support hires two more agents to handle volume. Nobody tells the product team that the integration setup flow has a 40% failure rate. The product team thinks integrations are fine because they only look at completion metrics, not support ticket volume.',
    evidence: 'MEASURED_RESULT',
  },

  // ---- Onboarding ----
  {
    term: 'Time-to-Value Tracking with Milestone Gates',
    definition: 'The onboarding agent tracks each new customer through activation milestones: account created, first feature used, first integration connected, first team member invited, first value-delivering action (report generated, workflow automated, etc.). Time-to-first-value is the single most predictive metric for long-term retention. Customers who do not reach value within 14 days have 3x higher churn at 90 days.',
    category: 'Onboarding',
    failureMode: 'A customer signs up for a $149/month plan. They log in once, look around, get confused, and never come back. The onboarding email sequence fires on schedule ("Day 3: Set up your first workflow!") but the customer is not reading them. 30 days later, they cancel. The product worked fine. The onboarding failed to get them to value.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Onboarding Handoff from Sales to CS',
    definition: 'When a deal closes, the sales agent creates a structured handoff document: what the customer bought, what problems they want to solve, what was promised during the sales process, and any custom commitments. The CS agent reviews the handoff before the kickoff call. The customer should never say "that is not what we were told during the demo." Sales promises must be visible to CS.',
    category: 'Onboarding',
    failureMode: 'Sales promises "full API access" during the demo. The customer\'s plan does not include API access. CS discovers this during the kickoff call when the customer asks about API documentation. CS either honors a promise they cannot afford or breaks trust on day one. Either outcome is bad.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Self-Serve vs. High-Touch Onboarding Router',
    definition: 'The onboarding agent determines the onboarding track based on: deal size (>$500/mo gets high-touch), use case complexity (integrations required = high-touch), and customer technical sophistication (API-first companies = self-serve). The routing happens at deal close. High-touch customers get a dedicated CSM and kickoff call. Self-serve customers get an in-app guided tour and email sequence. Misrouting wastes CSM time or loses complex customers.',
    category: 'Onboarding',
    failureMode: 'A $2K/month Enterprise customer is routed to the self-serve onboarding flow because nobody configured the routing threshold. They get a generic welcome email and an in-app tooltip tour. The buyer who signed a $24K annual contract feels like a number. They escalate to their sales rep. "Is this really how you treat Enterprise customers?"',
    evidence: 'HUMAN_DEFINED_RULE',
  },

  // ---- Product Development ----
  {
    term: 'Feature Request Aggregation Across Agents',
    definition: 'Feature requests arrive from 4 channels: support tickets, CS conversations, sales objections, and user feedback widgets. Each channel has its own agent. The product agent aggregates requests weekly, deduplicates, and ranks by: revenue weight (how much ARR is asking for this), frequency, and strategic alignment. No feature is prioritized based on a single channel\'s data.',
    category: 'Product',
    failureMode: 'The sales agent lobbies hard for Feature X because 3 prospects asked for it. The product team builds it. Post-launch, nobody uses it. Meanwhile, the support agent has been logging 50 tickets/month about Feature Y which would have retained 10 churning accounts worth $120K ARR. The loudest channel won. The most valuable signal was ignored.',
    evidence: 'MEASURED_RESULT',
  },
  {
    term: 'Incident Severity Classification with Coordinated Response',
    definition: 'The monitoring agent classifies incidents: SEV1 (full outage, all customers), SEV2 (partial outage, subset of customers), SEV3 (degraded performance), SEV4 (cosmetic or edge case). Each severity level triggers a different multi-agent response. SEV1: status page update within 5 minutes, support switches to incident mode, CS proactively contacts Enterprise accounts, billing pauses retry logic. SEV4: ticket created, no external communication.',
    category: 'Product',
    failureMode: 'A database failover causes 15 minutes of read-only mode. The monitoring agent fires an alert but nobody classifies it. Support starts getting tickets but does not know the scope. The status page still shows "all systems operational." Enterprise customers discover the issue from their own monitoring and call their CSMs. The response is reactive, uncoordinated, and slow.',
    evidence: 'HUMAN_DEFINED_RULE',
  },
  {
    term: 'Deprecation Coordination Across Customer-Facing Agents',
    definition: 'When the product team deprecates a feature or API version, the product agent must notify: the CS agent (which customers use this feature), the support agent (prepare for confused tickets), the documentation agent (update docs), and the billing agent (adjust pricing if the feature was a paid add-on). Deprecation is not a product decision. It is a multi-agent coordination event.',
    category: 'Product',
    failureMode: 'The product team deprecates API v1 with 90 days notice in the changelog. The CS agent is never told. 3 Enterprise customers rely on v1 for critical integrations. They discover the deprecation when their integration breaks. "We would have migrated if someone told us" is the universal customer response to surprise deprecations.',
    evidence: 'OBSERVED_REPEATEDLY',
  },

  // ---- Security & Compliance ----
  {
    term: 'Security Event Triage with Customer Impact Assessment',
    definition: 'When the security agent detects a potential breach or vulnerability, it must coordinate with: the product agent (scope of affected systems), the CS agent (which customers are on affected systems), the legal agent (notification requirements by jurisdiction), and the communication agent (customer notification drafts). Security incidents are not just engineering problems. They are customer trust events.',
    category: 'Security',
    failureMode: 'A vulnerability is discovered in the file upload feature. The security team patches it in 4 hours. But nobody tells customers that their uploaded files may have been exposed. A customer discovers the vulnerability independently and reports it publicly. The company is now doing crisis communications for a vulnerability they already fixed, because they skipped the coordination step.',
    evidence: 'HUMAN_DEFINED_RULE',
  },
  {
    term: 'SOC 2 Evidence Collection as Agent Responsibility',
    definition: 'The compliance agent continuously collects SOC 2 evidence: access reviews, change management logs, incident response records, encryption verification. Instead of an annual scramble to gather evidence, each agent contributes its evidence as part of normal operations. The deploy agent logs every deployment. The access agent logs every permission change. Compliance is a byproduct of coordinated operations, not a separate project.',
    category: 'Security',
    failureMode: 'SOC 2 audit is in 30 days. The compliance team asks engineering for 12 months of deployment logs. Engineering has 9 months. The other 3 months were on a system that was decommissioned. Nobody exported the logs. The auditor flags a gap. The company either delays the audit or receives a qualified opinion. All because evidence collection was not built into the daily workflow.',
    evidence: 'OBSERVED_REPEATEDLY',
  },
  {
    term: 'Customer Data Deletion Coordination',
    definition: 'When a customer requests data deletion (GDPR right to erasure, account closure), the data agent must coordinate across every system that holds customer data: production database, backups, analytics warehouse, email marketing, support ticket history, billing records (with legal retention requirements). Each system\'s agent confirms deletion. The compliance agent verifies completeness before confirming to the customer.',
    category: 'Security',
    failureMode: 'A customer requests data deletion. The production database is wiped. But their name and email remain in the analytics warehouse, the email marketing tool, and 3 support ticket transcripts. A GDPR audit discovers the incomplete deletion. The fine for non-compliance starts at 20M euros or 4% of global annual revenue.',
    evidence: 'HUMAN_DEFINED_RULE',
  },
];

export const SAAS_INDUSTRY_META = {
  slug: 'saas',
  name: 'SaaS Company',
  description: 'Coordination practices for AI agent teams managing SaaS companies -- deployment pipelines, customer success, subscription billing, support operations, onboarding, product development, and security compliance. Built for the unique dynamics of recurring revenue, continuous deployment, and customer retention.',
  practiceCount: SAAS_PRACTICES.length,
  icon: 'cloud',
};
