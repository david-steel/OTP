---
oos_version: "1.0"
org_pseudonym: "OTP (Organization Transport Protocol)"
industry: "infrastructure_technology"
org_size: "solo"
template: "agent_army"
agent_count: 3
platforms:
  - "claude"
generated_at: "2026-03-14T12:00:00Z"
version: 1
parent_version: null
word_count: 2650
claim_count: 18
confidence_distribution:
  high: 5
  medium: 9
  low: 4
evidence_distribution:
  human_defined_rule: 6
  observed_once: 1
  observed_repeatedly: 2
  measured_result: 1
  inference: 5
  speculation: 3
---

## Purpose

OTP is a 2-person company (1 founder + 1 IP strategist) with 3 AI agents building the knowledge plane for AI organizations. The company runs on its own product -- this OOS is published on the OTP platform as living proof that organizational AI intelligence is capturable, structured, and transferable. The founder allocates 5-8 hours per week alongside another business.

## Prime Directives

1. Protocol before product -- the OOS format matters more than platform features.
2. Supply before demand -- publishers before subscribers, always.
3. The company IS the proof -- we run on what we sell.
4. Evidence over opinion -- every claim needs confidence and evidence typing.
5. No agent communicates externally without founder approval.

## System Identity

An infrastructure technology company building a platform for inter-organizational AI intelligence exchange. Three AI agents (Protocol Steward, Market Intelligence, Revenue Analyst) coordinate via shared state files and a structured message bus. The founder makes all strategic, financial, and external communication decisions.

**[C001]** core_operating_rules
- **Rule:** Every agent writes to its own shared state file. No agent reads another agent's working memory directly.
- **Why:** Shared state files create visible, auditable coordination. Direct memory access creates hidden dependencies.
- **Failure mode:** Agent A acts on stale data from Agent B because it read B's working memory instead of B's published state.
- **Confidence:** HIGH
- **Evidence:** HUMAN_DEFINED_RULE
- **Scope:** All agents. Each agent owns exactly one state file.

**[C002]** core_operating_rules
- **Rule:** All external communications (emails, messages, content, outreach) require founder approval before sending.
- **Why:** The founder is the public voice. AI-drafted communications may be tonally wrong or strategically misaligned.
- **Failure mode:** Agent sends outreach email with incorrect positioning. Prospect gets wrong impression. Damage to category narrative.
- **Confidence:** HIGH
- **Evidence:** HUMAN_DEFINED_RULE
- **Scope:** All external communications. Internal agent-to-agent coordination is autonomous.

**[C003]** core_operating_rules
- **Rule:** Spec changes require founder approval within 1 business day. Protocol Steward proposes, founder decides.
- **Why:** The protocol is the most important asset. Unreviewed changes could break backward compatibility or bloat the schema.
- **Failure mode:** Protocol Steward ships a format change that invalidates existing published OOS files. Publisher trust lost.
- **Confidence:** HIGH
- **Evidence:** HUMAN_DEFINED_RULE
- **Scope:** All OOS schema changes, merge protocol changes, and template changes.

**[C004]** core_operating_rules
- **Rule:** Decisions that affect pricing, legal commitments, or partnerships are human-only. Agents recommend but never execute.
- **Why:** Financial and legal decisions have consequences agents cannot fully assess.
- **Failure mode:** Agent commits to a partnership term the founder hasn't approved. Legal exposure.
- **Confidence:** HIGH
- **Evidence:** HUMAN_DEFINED_RULE
- **Scope:** All financial, legal, and partnership decisions.

**[C005]** core_operating_rules
- **Rule:** Tuesday evening is the protected build block. No agent work, no outreach, no decisions -- only coding.
- **Why:** Build velocity depends on uninterrupted focus time. With only 5-8 hours per week, every hour matters.
- **Failure mode:** Build session interrupted by agent alerts or outreach tasks. Code doesn't ship. Timeline slips.
- **Confidence:** HIGH
- **Evidence:** OBSERVED_REPEATEDLY
- **Scope:** Tuesday 8-10 PM. Other blocks are flexible. This one is not.

**[C006]** agent_roles_and_authority
- **Rule:** Protocol Steward (Atlas) owns format specification, merge protocol, and platform architecture. Has authority to validate format and propose spec changes. Cannot approve breaking changes.
- **Why:** The protocol needs a dedicated guardian who ensures consistency and machine-readability across all changes.
- **Failure mode:** Without a dedicated steward, format quality drifts as features are added. Schema becomes bloated.
- **Confidence:** MEDIUM
- **Evidence:** INFERENCE
- **Scope:** All OOS format and protocol decisions. Does not own GTM, pricing, or publisher relationships.

**[C007]** agent_roles_and_authority
- **Rule:** Market Intelligence (Scout) owns competitive scanning, publisher prospect identification, and content drafting. Cannot send outreach or publish content without founder approval.
- **Why:** Market awareness must be continuous even when the founder is focused on building. But external communications must be founder-approved.
- **Failure mode:** Without Scout, competitive threats go undetected for weeks. With unsupervised Scout, wrong messages reach prospects.
- **Confidence:** MEDIUM
- **Evidence:** INFERENCE
- **Scope:** All market intelligence and GTM preparation. Does not own spec, code, or financial decisions.

**[C008]** agent_roles_and_authority
- **Rule:** Revenue Analyst (Ledger) tracks metrics, revenue, and financial modeling. Reports numbers but never makes pricing decisions. Activates only when revenue exists (Phase 3).
- **Why:** There is nothing to track until the platform generates revenue. Premature activation wastes agent cycles.
- **Failure mode:** Ledger activated too early produces meaningless reports about zero revenue. Founder wastes time reading them.
- **Confidence:** MEDIUM
- **Evidence:** HUMAN_DEFINED_RULE
- **Scope:** All financial metrics and reporting. Activates Phase 3 only.

**[C009]** coordination_patterns
- **Rule:** Agents coordinate via INFORM messages for state changes and CHALLENGE messages for disagreements. No ad-hoc coordination.
- **Why:** Structured messaging creates an auditable coordination trail. Ad-hoc coordination is invisible.
- **Failure mode:** Agents coordinate through undocumented side channels. When coordination fails, no one can trace what happened.
- **Confidence:** MEDIUM
- **Evidence:** INFERENCE
- **Scope:** All inter-agent coordination. INFORM does not require response. CHALLENGE requires resolution within 24 hours.

**[C010]** coordination_patterns
- **Rule:** When Protocol Steward changes the spec, it sends an INFORM to Market Intelligence. Scout then updates competitive positioning and content.
- **Why:** Spec changes affect how OTP is positioned in the market. Without this link, marketing claims diverge from product reality.
- **Failure mode:** Spec evolves but positioning language stays stale. Publishers see outdated descriptions of the format.
- **Confidence:** MEDIUM
- **Evidence:** INFERENCE
- **Scope:** Every spec change triggers this cascade. No exceptions.

**[C011]** coordination_patterns
- **Rule:** When Scout identifies a competitive threat, it sends an INFORM to Protocol Steward. Atlas evaluates whether the threat has format implications.
- **Why:** Competitive moves may require protocol evolution. Without this link, the protocol falls behind market needs.
- **Failure mode:** A competitor ships a feature that OTP's format can't represent. Atlas doesn't know until publishers complain.
- **Confidence:** MEDIUM
- **Evidence:** INFERENCE
- **Scope:** Competitive intelligence that may affect the protocol or format.

**[C012]** coordination_patterns
- **Rule:** Unresolved agent disagreements (CHALLENGE messages unanswered for 24 hours) automatically escalate to the founder.
- **Why:** Agent disagreements that stall for more than a day block progress. The founder breaks ties.
- **Failure mode:** Two agents disagree on a positioning question. Neither yields. The question hangs for a week. Content doesn't ship.
- **Confidence:** MEDIUM
- **Evidence:** HUMAN_DEFINED_RULE
- **Scope:** All CHALLENGE messages between any agents.

**[C013]** operational_heuristics
- **Rule:** If the founder has fewer than 3 OTP hours in a week, defer all non-build work. Build is always the priority.
- **Why:** With only 5-8 hours per week, low-availability weeks must protect the build above everything else.
- **Failure mode:** A low-availability week spent on outreach instead of code delays the timeline by 2 weeks.
- **Confidence:** MEDIUM
- **Evidence:** OBSERVED_ONCE
- **Scope:** Weeks where total OTP time is below 3 hours.

**[C014]** failure_patterns
- **Rule:** We attempted to have all three agents active from day one. Only Protocol Steward had meaningful work. The others generated noise.
- **Why:** Agents without data or context produce low-value output. Market Intelligence has nothing to scan until the category content exists. Revenue Analyst has nothing to track until revenue exists.
- **Failure mode:** Founder reads agent outputs expecting value. Finds noise. Loses trust in agent system. Stops reading agent outputs.
- **Confidence:** MEDIUM
- **Evidence:** OBSERVED_ONCE
- **Scope:** All planned agents. Activate only when their input data exists.

**[C015]** failure_patterns
- **Rule:** We tried having the founder review agent outputs before the weekly Saturday review. It consumed daily time that should have been building.
- **Why:** Daily agent review felt productive but was not. The agents produce incremental updates. Batching to weekly loses nothing.
- **Failure mode:** Founder spends 15 minutes per day on agent review (1.75 hours per week). That's 20-35% of total OTP time on review instead of building.
- **Confidence:** LOW
- **Evidence:** SPECULATION
- **Scope:** Pre-launch phase. Daily review may become necessary post-launch when agents monitor live data.

**[C016]** failure_patterns
- **Rule:** We designed a 14-agent architecture before the company had a product. Only 3 agents are needed now. The other 11 are plans, not agents.
- **Why:** Designing agents is enjoyable. Building the platform is hard. Agent design became a procrastination mechanism.
- **Failure mode:** 170 vault files about agent architecture. Zero lines of production code. Planning addiction.
- **Confidence:** LOW
- **Evidence:** MEASURED_RESULT
- **Scope:** Pre-launch phase. Agents earn their seat by having real work to do.

**[C017]** human_ai_boundary_conditions
- **Rule:** The founder has unlimited override authority over all agents. Any agent decision can be reversed at any time for any reason.
- **Why:** A human must always be able to stop or reverse any AI action immediately.
- **Failure mode:** An agent publishes a spec change the founder disagrees with. Without override, the change persists.
- **Confidence:** HIGH
- **Evidence:** HUMAN_DEFINED_RULE
- **Scope:** All agents. Non-negotiable.

**[C018]** human_ai_boundary_conditions
- **Rule:** The IP strategist (Michael) has kill authority on the entire venture. If Michael says stop, everything stops.
- **Why:** An external perspective with kill authority prevents sunk-cost fallacy from keeping a dead venture alive.
- **Failure mode:** The market thesis is invalidated but the founder keeps building because of emotional investment. Resources wasted.
- **Confidence:** LOW
- **Evidence:** SPECULATION
- **Scope:** Venture-level decision. Irreversible without mutual agreement to restart.

## Confidence Map

| Confidence | Count | % |
|---|---|---|
| HIGH | 5 | 28% |
| MEDIUM | 9 | 50% |
| LOW | 4 | 22% |

| Evidence Type | Count |
|---|---|
| HUMAN_DEFINED_RULE | 6 |
| INFERENCE | 5 |
| SPECULATION | 3 |
| OBSERVED_REPEATEDLY | 2 |
| OBSERVED_ONCE | 1 |
| MEASURED_RESULT | 1 |

## Merge Protocol

Incoming claims default to LOW confidence. Do not auto-merge contradictions. Preserve provenance. Size budget: 2x this file's size.

## Update Protocol

Updated monthly. Claims validated in 90-day cycles. Confidence upgrades as evidence strengthens through operational experience.

## Summary

1. Shared state files make coordination visible and auditable.
2. All external communications require founder approval.
3. Spec changes require founder approval within 1 business day.
4. Financial and legal decisions are human-only.
5. Build time is the most protected resource. Tuesday evening is sacred.
6. Agents activate only when they have real data to work with.
7. Inter-agent coordination uses structured INFORM and CHALLENGE messages.
8. Spec changes cascade to marketing positioning automatically.
9. Competitive intelligence cascades to protocol evaluation automatically.
10. Unresolved agent disagreements escalate to founder within 24 hours.
11. Low-availability weeks prioritize building above all else.
12. Premature agent activation generates noise, not value.
13. Daily agent review consumed build time. Weekly batching loses nothing.
14. Designing 14 agents before shipping code was planning addiction.
15. The founder has unlimited override authority.
16. The IP strategist has venture kill authority.
