---
oos_version: "1.0"
org_pseudonym: "Ginnie (5-agent smart-home team, modeled)"
industry: "smart_home_services"
org_size: "small"
template: "agent_army"
agent_count: 5
platforms:
  - "ginnie-agents"
  - "claude"
generated_at: "2026-04-28T08:30:00Z"
version: 1
parent_version: null
word_count: 2400
claim_count: 10
confidence_distribution:
  high: 3
  medium: 5
  low: 2
evidence_distribution:
  human_defined_rule: 3
  observed_once: 0
  observed_repeatedly: 0
  measured_result: 0
  inference: 6
  speculation: 1
---

## Purpose

This is a drafted OOS file for ginnie-agents, written in response to the architectural question raised in nitaybz/ginnie-agents#1 about cross-agent disagreement when multiple agents claim authority over the same factual surface. It models a hypothetical 5-agent ginnie-agents install at a small smart-home services company and codifies the merge rules that would resolve real conflicts between those agents.

This is an exercise, not captured production data. Most claims are `INFERENCE` or `HUMAN_DEFINED_RULE`. The point is to show what cross-agent merge logic looks like when written in a portable file format, so the ginnie-agents framework operator can decide whether the framework needs that layer or whether better docs around the limit are sufficient.

The file follows OOS v1.0 spec verbatim (see https://orgtp.com/spec/oos-schema.json). It is plain markdown. It validates locally. It does not require any external service.

## Prime Directives

1. The customer's experience of the company must be coherent across every agent that touches them.
2. Two agents must never send conflicting communications to the same customer in the same window without a recorded merge resolution.
3. When two agents disagree about the state of a customer, the disagreement is captured, not flattened.

## System Identity

Ginnie is a small smart-home services company running 5 ginnie-agents teammates: a sales agent, a retention agent, an ops agent, a support agent, and a billing agent. Each agent has its own Slack identity, its own memory tiers (`rules.md`, `playbook.md`, `episodes/`), and its own authority over a non-overlapping primary domain. The retention-vs-sales overlap is real: the same customer can be on a save-list and a cross-sell-list simultaneously. The framework today resolves this by surfacing both flags in Slack and letting the operator pick. This OOS captures the merge rules that would let the agents resolve it themselves.

## Cross-Agent Authority Map (the missing primacy primitive)

The `scope` field on each claim below names which agents the claim binds and which agent's authority wins when the claim fires. This is the primitive ginnie-agents' team directory does not establish today: the team directory says "agent B exists, here's what they own"; the OOS scope field says "and on this specific factual surface, agent B's call wins over agent A's."

**[C001]** customer_status_authority
- **Rule:** The retention agent is the system of record for "is this customer at risk of churn." If the sales agent's view of the same customer says "ready to cross-sell," the retention agent's at-risk flag wins until retention itself clears it.
- **Why:** Cross-selling a churning customer is the worst outcome the company can produce. It deepens the bad experience and burns the upsell motion. Retention has the signal humans can't see (cancelation conversations, support pattern, NPS); sales has the signal retention can't see (intent, budget). Both are real. Asymmetric downside breaks the symmetry: a missed cross-sell is recoverable, a cross-sell into a churn is not.
- **Failure mode:** Sales agent posts a cross-sell DM at 9:00 AM. Retention agent posts a save-call request at 10:00 AM. Customer receives both. Customer churns AND tells their network the company is disorganized.
- **Confidence:** HIGH
- **Evidence:** HUMAN_DEFINED_RULE
- **Scope:** Applies to: sales, retention. Authority on at-risk status: retention. Sales must check retention's at-risk list before any outbound cross-sell touch on a known customer.

**[C002]** outbound_communication_authority
- **Rule:** When two agents both want to send an outbound message to the same customer in the same 24-hour window, the agent with the higher-criticality message wins; the other agent's message is held for the next business day with a note attached recording the deferral.
- **Why:** Multiple agents emailing the same customer the same day produces "they don't know what's going on over there" and is the most cited operator-side failure of multi-agent setups. Prioritizing by criticality (billing > retention > support > ops > sales) is a stable ordering that does not require humans in the loop on every conflict.
- **Failure mode:** Customer gets a save-offer email and a cross-sell email and a billing-issue email in the same hour. Customer responds to the billing-issue email with frustration about all three.
- **Confidence:** HIGH
- **Evidence:** HUMAN_DEFINED_RULE
- **Scope:** Applies to: all 5 agents. Priority order for outbound to same customer in same 24h: billing > retention > support > ops > sales. Held messages are appended to the deferring agent's `episodes/` with reason and the winning agent's claim ID.

**[C003]** pricing_authority
- **Rule:** The sales agent quotes new prices. The retention agent offers save discounts within a pre-approved range. Only the billing agent applies a price change to the customer record. A retention save offer the customer accepts must be confirmed by billing before the agent posts confirmation.
- **Why:** Three agents touching pricing without a single point of application produces drift between what the customer was told and what the system charges. Splitting by phase (quote / offer / apply) keeps each agent's autonomy while pinning the point of truth to one agent.
- **Failure mode:** Retention agent tells the customer "I can do $79/month for 6 months." Customer says yes. Sales agent doesn't know about the discount, quotes the regular renewal at $99 the next month. Customer churns over the broken promise.
- **Confidence:** MEDIUM
- **Evidence:** INFERENCE
- **Scope:** Applies to: sales, retention, billing. Quote = sales. Offer-within-range = retention. Apply = billing only. Confirmation post-acceptance = billing publishes, retention echoes.

**[C004]** disagreement_recording
- **Rule:** When two agents reach different conclusions about a fact (customer status, plan tier, ticket severity), both conclusions are recorded in the loser's `episodes/` file with the winner's claim ID and the resolution timestamp. The loser does not silently update its `rules.md` or `playbook.md` from the conflict; only the nightly consolidation routine can promote a recurring conflict pattern into the playbook.
- **Why:** Silent rule rewrites from individual conflicts produce drift, where the loser slowly absorbs the winner's worldview without operator review. Recording the disagreement at the episode tier preserves the disagreement for the consolidation routine and for human inspection. The framework's existing `playbook.md` cap and consolidation hook already enforce this discipline; this claim names what to do at the moment of conflict, before consolidation runs.
- **Failure mode:** Sales agent loses every conflict with retention for two months and quietly rewrites its own playbook to defer to retention on every customer touch. Operator notices three months later that sales has stopped pitching and the cross-sell motion is dead.
- **Confidence:** MEDIUM
- **Evidence:** INFERENCE
- **Scope:** Applies to: all 5 agents. Episode-tier write only. No `rules.md` or `playbook.md` writes from a single conflict. Consolidation routine is the only writer for higher tiers.

**[C005]** handoff_protocol
- **Rule:** When authority transfers between agents (retention closes a save successfully and hands the customer back to sales for cross-sell, or sales closes a deal and hands the customer to ops for delivery), the handoff is recorded as a structured episode entry on both agents' `episodes/` with: from-agent, to-agent, customer, timestamp, status-of-record-fields-transferred. The receiving agent must `grep` the episode entry before the next outbound touch to that customer.
- **Why:** Handoffs are where authority gets lost. Without an explicit record, the receiving agent treats the customer as cold; the customer experiences the company forgetting them between conversations. With a structured handoff record, the receiving agent picks up at the right context.
- **Failure mode:** Retention saves a customer at risk on Monday, marks the case closed. On Wednesday the sales agent contacts the same customer with a generic cross-sell pitch with no acknowledgement of the recent save conversation. Customer feels unheard and churns despite the retention win.
- **Confidence:** MEDIUM
- **Evidence:** INFERENCE
- **Scope:** Applies to: any pair of agents transferring authority over a customer. Both agents write the handoff entry to their own `episodes/` simultaneously. Receiving agent's first action on next touch: grep for handoff entry by customer ID.

**[C006]** override_meta_rule
- **Rule:** When two claims in this OOS conflict (e.g., C001 says retention wins on at-risk status, C002 says billing wins on outbound priority, and a customer is both at-risk AND has a billing issue), the more specific claim wins. If specificity is equal, the higher-criticality claim wins. If both are equal, the conflict is escalated to a human and recorded in both agents' `episodes/`.
- **Why:** Without a meta-rule for conflicts among the rules themselves, the OOS produces undefined behavior at the intersections. Specificity-then-criticality is a stable, well-known ordering from policy engines and RBAC. It does not require new infrastructure.
- **Failure mode:** Sales and retention both hit a retention claim and a billing claim simultaneously, neither knows which to apply, and the framework falls back to the existing "post both flags in Slack and let the operator pick" behavior, defeating the point of the OOS layer.
- **Confidence:** MEDIUM
- **Evidence:** INFERENCE
- **Scope:** Applies to: all 5 agents. Meta-rule for resolving conflicts between any two claims in this file. Specificity > criticality > human escalation. Always-recorded escalation to human, not silent fallback.

**[C007]** boundaries_respect
- **Rule:** A read-only agent cannot resolve a conflict against a write agent unless the conflict is purely informational (status flag, not action). On any conflict involving an external action (send, charge, modify), the write agent's claim wins, and the read-only agent's flag is held for human review.
- **Why:** ginnie-agents' boundaries primitive (`read-only` vs `write`) is enforced at the SDK level. The OOS must respect that hierarchy or it creates a path where a read-only agent's reasoning can effectively trigger a write through another agent without operator approval. The boundary should not be undermined by the merge logic.
- **Failure mode:** A read-only analyst agent's stale data triggers a write agent to send an unintended outbound communication, bypassing the read-only boundary the operator explicitly set.
- **Confidence:** HIGH
- **Evidence:** HUMAN_DEFINED_RULE
- **Scope:** Applies to: any conflict between an agent with `boundaries: read-only` and an agent with `boundaries: write`. Information-only conflicts: standard authority map applies. Action-affecting conflicts: write agent wins; read-only agent's flag held for human.

**[C008]** memory_tier_alignment
- **Rule:** Cross-agent rules in this OOS are loaded the same way `framework/skills/memory-curation/SKILL.md` is loaded today: into every agent's system prompt, every session, read-only. They do not count against the per-agent `rules.md` 200-line cap or the `playbook.md` 300-line cap. They are a separate ninth tier in the 8-layer agent model.
- **Why:** The existing 8-layer model has no slot for shared coordination rules. Putting these into per-agent `rules.md` would (a) duplicate the rules across every agent's file, (b) consume the operator-facing rules budget, (c) create drift the moment one agent's rules.md is edited and another's isn't. A separate tier loaded from a single shared file is the correct structural fit.
- **Failure mode:** Operator copy-pastes the cross-agent rules into each agent's `rules.md`, hits the 200-line cap on the most-rule-heavy agent, has to manually keep the copies in sync, drifts in two weeks, conflicts return.
- **Confidence:** MEDIUM
- **Evidence:** INFERENCE
- **Scope:** Applies to: framework integration. Loaded via system prompt composition step inserted between step 4 (memory-curation skill) and step 5 (per-agent PROMPT.md), or alternatively after step 5 and before step 6 (rules.md), depending on whether per-agent prompts should be able to caveat the shared rules.

**[C009]** scope_as_authority
- **Rule:** The `scope` field on every claim in this OOS is interpreted as a binding authority statement, not a free-form note. Format: `Applies to: <agent list>. Authority: <agent that wins>.` Any agent reading this file MUST treat the scope as enforceable on its own behavior.
- **Why:** OOS v1.0 defines `scope` as a free-form string. To make merge logic portable, the `scope` field must carry the authority semantics in a way every agent can parse the same way. This claim names the convention; future OOS versions may formalize it into separate `applies_to` and `authority` fields. Until then, this convention is the contract.
- **Failure mode:** Agent A reads the scope as informational ("oh, retention is the authority on at-risk, good to know") but does not change its own behavior. Agent B reads the same scope as binding and defers to retention. The two agents now act differently on the same rule, which is the failure mode the OOS was supposed to prevent.
- **Confidence:** LOW
- **Evidence:** SPECULATION
- **Scope:** Applies to: all 5 agents. Convention-level claim about how to parse the rest of the file. Speculative because this is a forward proposal for v1.1 of the OOS spec, not yet codified upstream.

**[C010]** missing_agent_reference
- **Rule:** If a claim in this OOS names an agent that is not present in the team directory for this install (e.g., `Authority: billing` when no `billing` agent is registered), the claim is non-binding for this install. The runner logs the missing reference at session spawn and the operator's `doctor` skill surfaces it as a fixable warning. Loading does not fail; the file is still valid; the orphan claim is simply skipped.
- **Why:** The OOS is portable across installs. A real ginnie-agents operator may pull this drafted file as a starting point and not have all five agent roles built yet. Failing the load on a missing reference would punish the operator for adopting incrementally. Silently applying the claim would produce undefined behavior. Logging-and-skipping is the only honest middle path.
- **Failure mode:** Operator drops `coordination.oos.md` into `shared/` before they have created the billing agent. The runner refuses to spawn any agent because the file references billing. Operator concludes the OOS layer is brittle and reverts.
- **Confidence:** LOW
- **Evidence:** INFERENCE
- **Scope:** Applies to: framework integration. Loader behavior on orphan agent references. Logging the warning is mandatory; skipping the claim is mandatory; failing the load is forbidden.

## What this OOS does NOT solve

Honest about the limits, since Nitay's reply was honest about ginnie-agents' limits:

1. **Cross-organization conflicts.** Two ginnie-agents installs at two different companies with overlapping customers (rare but real for partner channels) cannot resolve through this file. That requires the network sync layer, which is exactly the orgtp.com runtime dependency the framework declines to take. The right answer there is not this file. It is humans across the two orgs.

2. **Real-time arbitration.** This file is loaded into the system prompt at session start. If a conflict arises mid-session and both agents are running simultaneously, the merge logic does not arbitrate live; each agent applies the rules as it understood them at session start. This is acceptable for ginnie-agents' current cadence (per-session containers, not long-lived processes), but it would not work for a framework where agents share long-lived state. Naming the limit explicitly so it does not get assumed away.

3. **Disagreement about the rules themselves.** If the operator and one of the agents disagree about whether C003 (pricing authority) should split as quote/offer/apply or quote-only/apply-with-confirm, this OOS cannot resolve that. The OOS is the codification of the resolution; the resolution itself is human work. The framework should not pretend otherwise.

4. **Trust in the writer.** This OOS was drafted as an exercise by an outside party (Sneeze It / OTP, in response to a GitHub issue thread) modeling an organization the writer does not run. A real ginnie-agents OOS would be authored by the operator, observed against real conflict instances, and consolidated by the nightly routine. Treat this file as a starting shape, not a recommendation to adopt verbatim.

## Why this format, not a config schema or an API

A few notes on why the OOS is markdown-with-claims and not, say, a YAML rules engine or a hosted policy service:

- **Reads like docs.** The agents that load this can read it the same way an operator reading the file can. No translation layer.
- **Greps cleanly.** ginnie-agents' memory tier already standardizes on grep-on-demand. The OOS files are grep-friendly by design.
- **Diffs cleanly.** Operators reviewing changes to the merge rules see the change in plain English, in the commit. PR review on a YAML rules file is a different experience.
- **Validates locally.** The JSON Schema at https://orgtp.com/spec/oos-schema.json is a static file. Validation needs no network.
- **No runtime dependency.** This file lives in the ginnie-agents repo. Agents read it from the filesystem. Nothing in this design requires orgtp.com to be reachable, online, or even to exist.

## Provenance

- **Drafted by:** Sneeze It / OTP, 2026-04-28, in response to nitaybz/ginnie-agents#1.
- **Author's relationship to ginnie-agents:** outside party. Has read the public README, ARCHITECTURE.md, and the framework's CLAUDE.md.
- **Author's relationship to Ginnie (the company):** none. The 5-agent shape is inferred from the architecture and the retention-vs-sales example given by the framework operator.
- **Status:** draft. Submitted for the operator's review under the explicit understanding that no commitment to adopt is implied.
- **Companion file:** `INTEGRATION.md` in the same directory describes what would change in ginnie-agents to load this file as the proposed ninth layer.
- **License:** OOS format spec is CC BY 4.0. This drafted file is offered to the ginnie-agents project under MIT, matching the framework's license.
