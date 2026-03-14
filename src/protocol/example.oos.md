---
oos_version: "1.0"
org_pseudonym: "Acme Digital Agency"
industry: "digital_marketing_agency"
org_size: "small"
template: "agent_army"
agent_count: 8
platforms:
  - "claude"
  - "custom"
generated_at: "2026-03-14T12:00:00Z"
version: 1
parent_version: null
word_count: 2100
claim_count: 14
confidence_distribution:
  high: 5
  medium: 6
  low: 3
evidence_distribution:
  human_defined_rule: 3
  observed_once: 2
  observed_repeatedly: 4
  measured_result: 3
  inference: 1
  speculation: 1
---

## Purpose

Acme Digital Agency runs an 8-agent AI team managing client advertising, project delivery, email operations, and internal reporting. The team coordinates through pre-computed shared state files and explicit authority boundaries. This OOS captures the coordination intelligence earned over 6 months of production operation.

## Prime Directives

1. Client data integrity above all other priorities.
2. No agent sends external communications without human approval.
3. Every agent writes to shared state; no agent reads data sources directly.

## System Identity

A digital marketing agency operating an AI agent team for client campaign management, project tracking, email triage, and performance reporting. The agent team augments a human team of 10, handling operational overhead so humans focus on strategy and client relationships.

**[C001]** core_operating_rules
- **Rule:** Every agent writes to a shared state file. No agent reads data sources directly.
- **Why:** Direct data source access creates race conditions and inconsistent views across agents.
- **Failure mode:** Two agents read the same data source at different times, get different results, make conflicting decisions. Observed when the reporting agent and the campaign agent both queried Meta Ads API simultaneously.
- **Confidence:** HIGH
- **Evidence:** MEASURED_RESULT
- **Scope:** All agents in the system. Does not apply to the initial data collection job that populates shared state.

**[C002]** core_operating_rules
- **Rule:** Only one agent has authority to send external communications (emails, messages).
- **Why:** Multiple agents sending emails creates duplicate communications and confused clients.
- **Failure mode:** Two agents both draft and attempt to send a client update email. Client receives contradictory information.
- **Confidence:** HIGH
- **Evidence:** OBSERVED_REPEATEDLY
- **Scope:** All external-facing communications. Internal agent-to-agent messaging is unrestricted.

**[C003]** core_operating_rules
- **Rule:** The analytics agent reports patterns but never recommends actions.
- **Why:** When the analytics agent recommended actions, the recommendations were ignored because they lacked client context. Separating reporting from recommendation improved trust.
- **Failure mode:** Analytics agent recommends a budget increase. The account manager has context about client cash flow issues that makes the recommendation harmful. Client loses trust.
- **Confidence:** HIGH
- **Evidence:** OBSERVED_REPEATEDLY
- **Scope:** Analytics and reporting functions. Strategy agents may recommend within their authority.

**[C004]** core_operating_rules
- **Rule:** The retention agent overrides the sales agent when a client is flagged at risk.
- **Why:** Sales expansion to an at-risk client accelerates churn. Retention must take priority over revenue growth when client health is declining.
- **Failure mode:** Sales agent proposes an upsell to a client whose satisfaction score is declining. Client interprets the upsell as tone-deaf and cancels.
- **Confidence:** HIGH
- **Evidence:** OBSERVED_ONCE
- **Scope:** Applies when client health score drops below threshold. Does not apply to healthy accounts.

**[C005]** core_operating_rules
- **Rule:** All agent output is logged to an audit trail before any action is taken.
- **Why:** Without audit trails, diagnosing agent errors requires guessing. With them, every decision can be traced.
- **Failure mode:** An agent makes an error. Without logs, the team spends hours debugging. With logs, the root cause is found in minutes.
- **Confidence:** HIGH
- **Evidence:** MEASURED_RESULT
- **Scope:** All agents, all actions. No exceptions.

**[C006]** agent_roles_and_authority
- **Rule:** Each agent has a written one-line role statement and a list of actions it is authorized to take.
- **Why:** Without explicit authority boundaries, agents drift into overlapping responsibilities.
- **Failure mode:** Two agents both attempt to update the same project status. Conflicting updates confuse the team.
- **Confidence:** MEDIUM
- **Evidence:** OBSERVED_REPEATEDLY
- **Scope:** All agents. Authority documents reviewed monthly.

**[C007]** agent_roles_and_authority
- **Rule:** No agent modifies another agent's shared state file.
- **Why:** Shared state files are single-writer. If multiple agents write to the same file, data races corrupt state.
- **Failure mode:** The project agent and the billing agent both write to the client status file. One overwrites the other's update.
- **Confidence:** HIGH
- **Evidence:** MEASURED_RESULT
- **Scope:** All shared state files. Agents may read any shared state but only write to their own.

**[C008]** coordination_patterns
- **Rule:** Agents coordinate through shared state files, not direct messaging.
- **Why:** Direct messaging creates hidden dependencies. Shared state makes coordination visible and auditable.
- **Failure mode:** Agent A sends a direct message to Agent B that is not logged. When Agent B fails, the team cannot determine why because the triggering message is invisible.
- **Confidence:** MEDIUM
- **Evidence:** INFERENCE
- **Scope:** Production coordination. Development and testing may use direct messaging.

**[C009]** coordination_patterns
- **Rule:** Cross-agent workflows use a publish-subscribe pattern through shared state.
- **Why:** Pub/sub through files decouples agents. Any agent can consume any shared state without the publishing agent knowing.
- **Failure mode:** Tightly coupled agents create cascading failures. When one agent goes down, all dependent agents fail.
- **Confidence:** MEDIUM
- **Evidence:** OBSERVED_REPEATEDLY
- **Scope:** All multi-agent workflows. Single-agent tasks do not require pub/sub.

**[C010]** operational_heuristics
- **Rule:** If an agent encounters an error it cannot resolve, it logs the error and stops. It does not retry automatically.
- **Why:** Automatic retries on unresolvable errors create noise and mask the root cause.
- **Failure mode:** An agent retries a failed API call 100 times, consuming rate limits and generating 100 error logs, obscuring the actual problem.
- **Confidence:** MEDIUM
- **Evidence:** OBSERVED_ONCE
- **Scope:** All agents. Temporary network errors may be retried once with backoff.

**[C011]** failure_patterns
- **Rule:** We tried giving the analytics agent write access to campaign settings. It optimized for metrics the client did not care about.
- **Why:** The analytics agent lacked client context. Its optimization targets were technically correct but strategically wrong.
- **Failure mode:** Analytics agent decreases ad spend on a campaign the client considers strategic (brand building, not performance). Client is frustrated.
- **Confidence:** HIGH
- **Evidence:** OBSERVED_ONCE
- **Scope:** Any agent with optimization authority. Always require human approval for strategic changes.

**[C012]** failure_patterns
- **Rule:** We tried using a single shared state file for all agents. It became a bottleneck and a source of merge conflicts.
- **Why:** A single file means every agent update blocks every other agent. With per-agent files, updates are independent.
- **Failure mode:** Two agents update the shared file simultaneously. One update is lost. State becomes inconsistent.
- **Confidence:** HIGH
- **Evidence:** MEASURED_RESULT
- **Scope:** All shared state. Per-agent files resolved the issue.

**[C013]** human_ai_boundary_conditions
- **Rule:** All external communications require human approval before sending.
- **Why:** AI-generated communications can be tonally inappropriate, factually incorrect, or strategically misaligned. Human review is the safety net.
- **Failure mode:** An agent sends an email to a client with incorrect performance numbers. Client loses trust. Damage takes months to repair.
- **Confidence:** HIGH
- **Evidence:** HUMAN_DEFINED_RULE
- **Scope:** All external communications. Internal logging and status updates are autonomous.

**[C014]** human_ai_boundary_conditions
- **Rule:** Pricing changes, contract modifications, and financial commitments require human decision-making.
- **Why:** Financial decisions have legal and relationship implications that AI agents cannot fully assess.
- **Failure mode:** An agent applies a discount to retain a client. The discount violates margin floors. The retained client becomes unprofitable.
- **Confidence:** LOW
- **Evidence:** SPECULATION
- **Scope:** All financial decisions. Agents may calculate and recommend but never execute.

## Confidence Map

| Confidence | Count | % |
|---|---|---|
| HIGH | 5 | 36% |
| MEDIUM | 6 | 43% |
| LOW | 3 | 21% |

| Evidence Type | Count |
|---|---|
| MEASURED_RESULT | 3 |
| OBSERVED_REPEATEDLY | 4 |
| OBSERVED_ONCE | 2 |
| HUMAN_DEFINED_RULE | 3 |
| INFERENCE | 1 |
| SPECULATION | 1 |

## Merge Protocol

When merging intelligence from another organization's OOS:
- Incoming claims default to LOW confidence until validated locally.
- Do not auto-merge contradictions. Flag for human review.
- Preserve provenance (source org, date, original evidence type).
- Size budget: merged file must not exceed 2x this file's current size.

## Update Protocol

- Claims not referenced or validated in 90 days are flagged as STALE.
- Each publish creates a new version. Previous versions preserved.
- Confidence may be upgraded when evidence strengthens or downgraded when conditions change.

## Summary

1. Pre-computed shared state eliminates race conditions between agents.
2. Single-writer pattern prevents state corruption.
3. Separating reporting from recommendation builds trust.
4. Retention overrides sales when client health declines.
5. External communications always require human approval.
6. Financial decisions are human-only.
7. Audit trails on every action enable fast debugging.
8. Per-agent shared state files outperform single shared file.
9. Pub/sub through files decouples agents and prevents cascading failures.
10. Agents that encounter unresolvable errors stop rather than retry endlessly.
11. Optimization authority without client context produces strategically wrong results.
12. Explicit authority boundaries prevent agent role drift and overlap.
