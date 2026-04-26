---
oos_version: "1.0"
org_pseudonym: "Sneeze It Digital Agency"
industry: "digital_marketing_agency"
org_size: "small"
template: "agent_army"
agent_count: 14
platforms:
  - "claude"
generated_at: "2026-03-15T12:00:00Z"
version: 1
parent_version: null
word_count: 2890
claim_count: 24
confidence_distribution:
  high: 10
  medium: 10
  low: 4
evidence_distribution:
  human_defined_rule: 5
  observed_once: 2
  observed_repeatedly: 9
  measured_result: 5
  inference: 2
  speculation: 1
---

## Purpose

A digital marketing agency running 14 AI agents managing daily operations for 20+ clients across Meta Ads (~$149K/30d), Google Ads (~$34K/30d), call center operations (3 human callers), project delivery, email triage, sales pipeline, client retention, data infrastructure, frontier learning, and agentic maturity evaluation. The agent army has been in production for 7+ months. This OOS captures battle-tested coordination intelligence from a system managing real revenue, real clients, and real human employees.

## Prime Directives

1. One seat, one owner. No agent does two jobs. No two agents do the same job.
2. Separate blast radius. Tuning one agent never breaks another.
3. Escalation over autonomy. Agents flag and recommend. The founder decides.
4. File-based state is authoritative over AI memory. When they conflict, the file wins.
5. Protect the founder's attention above all else. It is the scarcest resource.

## System Identity

A services business operating a hybrid human-AI team. 14 specialized AI agents each own one business function. The system includes an AI agent managing a team of 3 human employees through data-driven Slack coaching, an evaluator agent scoring system maturity against a published framework, and a learning agent implementing improvements based on evaluator findings. Runtime is CLI-based AI with 17 autonomous background agents scheduled via OS-level scheduling, 24 shared state files, and an agent message bus with 13 inboxes.

**[C001]** core_operating_rules
- **Rule:** One seat, one owner. No agent shares responsibility with another agent.
- **Why:** Shared responsibilities create blame diffusion, tuning conflicts, and debugging ambiguity.
- **Failure mode:** Two agents both handle client performance. Tuning one breaks the other. When something goes wrong, nobody owns the fix.
- **Confidence:** HIGH
- **Evidence:** OBSERVED_REPEATEDLY
- **Scope:** All agents. Applies to both AI and human team design.

**[C002]** core_operating_rules
- **Rule:** Every agent writes to its own shared state file. No agent reads data sources directly. Scanners write files. Compilers read files.
- **Why:** Pre-computed shared state decouples scan timing from compile timing, makes staleness visible, and prevents redundant API calls.
- **Failure mode:** Orchestrator silently re-queries sources. You cannot tell what version of reality it saw. Two agents query the same API at different times, get different results, make conflicting decisions.
- **Confidence:** HIGH
- **Evidence:** OBSERVED_REPEATEDLY
- **Scope:** All 14 agents. 24 shared state files. Each agent owns exactly one state file.

**[C003]** core_operating_rules
- **Rule:** All external communications (emails, Slack messages to clients, outreach) require founder approval before sending. The Executive Assistant agent drafts. The founder approves. No exceptions.
- **Why:** Reputational damage from bad messages is hard to reverse. AI-drafted communications can be tonally wrong, factually incorrect, or strategically misaligned.
- **Failure mode:** Agent sends email with incorrect performance numbers. Client loses trust. Takes months to repair.
- **Confidence:** HIGH
- **Evidence:** HUMAN_DEFINED_RULE
- **Scope:** All external-facing communications. Internal agent-to-agent coordination is autonomous.

**[C004]** core_operating_rules
- **Rule:** File-based state is authoritative over AI memory. When file data and implicit memory conflict, the file wins. Always load the canonical file before acting on remembered context.
- **Why:** AI memory drifts across sessions. Files do not. Memory supplements but never overrides.
- **Failure mode:** Agent acts on stale implicit memory instead of canonical file. Decisions based on wrong data. Particularly dangerous for client spend data and pipeline status.
- **Confidence:** HIGH
- **Evidence:** OBSERVED_REPEATEDLY
- **Scope:** All agents, all sessions. Non-negotiable.

**[C005]** core_operating_rules
- **Rule:** The Performance Analyst reports patterns but never recommends actions. Reports data, not opinions.
- **Why:** When the analyst recommended actions, recommendations were ignored because they lacked client context. Separating reporting from recommendation improved trust and reduced noise.
- **Failure mode:** Analyst recommends budget increase for a client the account manager knows has cash flow issues. Client loses trust. Or: analyst recommends pausing a campaign the client considers strategically important.
- **Confidence:** HIGH
- **Evidence:** OBSERVED_REPEATEDLY
- **Scope:** Performance analysis and reporting functions. Strategy agents may recommend within their authority.

**[C006]** core_operating_rules
- **Rule:** The Retention agent overrides the Sales agent when a client is flagged at risk. Retention is the Guardian. Sales is the Hunter. Guardian always wins.
- **Why:** Sales expansion to an at-risk client accelerates churn. Aggressive outreach to a declining client is tone-deaf and damages the relationship.
- **Failure mode:** Sales agent proposes upsell to a client whose satisfaction is declining. Client interprets it as tone-deaf and cancels entirely.
- **Confidence:** HIGH
- **Evidence:** OBSERVED_REPEATEDLY
- **Scope:** Any client on the retention watch list. Does not apply to healthy accounts with stable or rising health scores.

**[C007]** core_operating_rules
- **Rule:** Only one agent (the Executive Assistant) has authority to send external communications. All other agents route outreach through the EA. The EA drafts, the founder approves, the EA sends.
- **Why:** Multiple sending agents create duplicate communications, inconsistent voice, and confused recipients.
- **Failure mode:** Sales agent and Retention agent both draft emails to the same client. Client receives contradictory messages.
- **Confidence:** HIGH
- **Evidence:** OBSERVED_REPEATEDLY
- **Scope:** All external communications. The EA is the sole sending engine for the entire agent army.

**[C008]** agent_roles_and_authority
- **Rule:** Each agent has a written one-line role, a list of what it owns, and an explicit list of what it does NOT own. Authority boundaries are documented, not implied.
- **Why:** Without explicit boundaries, agents drift into overlapping responsibilities. Implicit ownership creates scope conflicts.
- **Failure mode:** Two agents both track project status. Conflicting updates confuse the team. Neither agent knows the other is updating.
- **Confidence:** HIGH
- **Evidence:** OBSERVED_REPEATEDLY
- **Scope:** All 14 agents. Authority documents reviewed monthly.

**[C009]** agent_roles_and_authority
- **Rule:** The Call Center Manager agent manages 3 human employees through daily Slack messages. It reads performance data, drafts coaching messages in the founder's voice, and sends via the founder's Slack account after approval. The humans do not know it is AI.
- **Why:** Data-driven daily coaching at the individual level was not possible with a human manager at this team size. The AI manager processes call stats, identifies patterns, and delivers specific, numbered feedback daily.
- **Failure mode:** If coaching messages sound generic or robotic, human employees disengage. Messages must be varied, specific, human-sounding, and data-backed. Formulaic messages degrade performance within 3 days.
- **Confidence:** HIGH
- **Evidence:** MEASURED_RESULT
- **Scope:** Call center team of 3 human callers. The AI manager does not handle hiring, firing, or compensation decisions.

**[C010]** agent_roles_and_authority
- **Rule:** The Evaluator agent scores system maturity against a published 8-level framework. It identifies the single highest-impact bottleneck and hands it to the Learning agent. The Learning agent implements. The Evaluator re-scores. This loop runs without the founder in the middle.
- **Why:** Self-improvement requires both diagnosis and action. Separating evaluation from implementation prevents self-grading bias. The loop IS a demonstration of the maturity it measures.
- **Failure mode:** Evaluator diagnoses correctly but the implementer fails to execute. Score stagnates. Or: implementer makes changes the evaluator hasn't requested, creating drift.
- **Confidence:** MEDIUM
- **Evidence:** OBSERVED_REPEATEDLY
- **Scope:** System maturity improvement. 4 evaluation cycles completed. Score moved from 6.2 to 6.5 out of 8.0.

**[C011]** coordination_patterns
- **Rule:** Data-intensive scans run overnight via OS-level scheduling (17 autonomous agents). The morning briefing reads cached results. The founder wakes to a complete picture, not a wait.
- **Why:** Morning scans take 30+ minutes if run sequentially. Pre-computing overnight eliminates serial latency during the founder's most valuable working hours.
- **Failure mode:** Founder starts the day waiting for scans to complete. First 30 minutes wasted. Or: budget cap hit during overnight run, morning briefing incomplete.
- **Confidence:** HIGH
- **Evidence:** MEASURED_RESULT
- **Scope:** Daily operations. 17 LaunchAgents running autonomously. $8 budget cap on morning briefing.

**[C012]** coordination_patterns
- **Rule:** Agents coordinate via structured message bus with defined message types: INFORM (state change notification), REQUEST (action needed), PROPOSAL (joint action), RESPONSE (reply), CHALLENGE (formal disagreement). 3-exchange maximum, then auto-escalate.
- **Why:** Ad-hoc coordination creates hidden dependencies. Structured messaging makes coordination visible, auditable, and bounded.
- **Failure mode:** Without structure, agents coordinate through undocumented side channels. When coordination fails, no one can trace what happened. Without exchange limits, agents negotiate indefinitely.
- **Confidence:** MEDIUM
- **Evidence:** OBSERVED_ONCE
- **Scope:** All inter-agent coordination. 13 inbox files deployed. Infrastructure is live but has zero transactions to date.

**[C013]** coordination_patterns
- **Rule:** When the Data Infrastructure agent detects a critical ad spend overage, it escalates through a defined ladder: alert to the founder, then auto-DM to the COO after 48 hours unanswered, then escalate to the Strategic agent.
- **Why:** Critical alerts that go unanswered create financial risk. Automated escalation ensures someone responds even if the primary recipient is unavailable.
- **Failure mode:** Agent detects +139% overspend on a client account. Alert sits unanswered for 16 days. Client overspends by $1,348 before anyone acts.
- **Confidence:** MEDIUM
- **Evidence:** MEASURED_RESULT
- **Scope:** Critical ad pacing alerts. Escalation ladder deployed March 13. First real test pending.

**[C014]** coordination_patterns
- **Rule:** The morning briefing compiles output from 10 parallel scanners (Slack, calendar, email, ads, pipeline, projects, call center, meetings, tasks, proposals) into one unified document. Each scanner writes to its own state file. The compiler reads all files and produces a single briefing.
- **Why:** 10 data sources cannot be queried sequentially in under 5 minutes. Parallel pre-computation with file-based handoff makes the briefing fast and fault-tolerant.
- **Failure mode:** If one scanner fails, the briefing still compiles with a "stale data" warning for that source. Without this architecture, one API failure blocks the entire briefing.
- **Confidence:** HIGH
- **Evidence:** MEASURED_RESULT
- **Scope:** Daily operations. Runs 7 days/week. Budget: $8/day.

**[C015]** operational_heuristics
- **Rule:** If data is stale, flag it visibly. Never silently present old information as current.
- **Why:** Stale data presented as current causes wrong decisions. Visible staleness lets the consumer decide how to weight the information.
- **Failure mode:** Briefing shows yesterday's ad spend as today's. Founder makes budget decisions on wrong numbers.
- **Confidence:** HIGH
- **Evidence:** OBSERVED_REPEATEDLY
- **Scope:** All agents that read shared state files. 18-hour staleness threshold triggers warning.

**[C016]** operational_heuristics
- **Rule:** If 3+ tasks from one person are overdue, flag as capacity pattern, not motivation problem.
- **Why:** Individual overdue tasks might be forgotten. A pattern of overdue tasks indicates workload exceeds capacity.
- **Failure mode:** Manager assumes delegation is lazy. Actual problem is team member is overwhelmed. Problem worsens.
- **Confidence:** MEDIUM
- **Evidence:** OBSERVED_REPEATEDLY
- **Scope:** Task delegation tracking. Applies to human team members monitored via task management.

**[C017]** failure_patterns
- **Rule:** We gave the performance analyst write access to campaign settings. It optimized for metrics the client did not care about.
- **Why:** The analyst lacked client context. Its optimization targets were technically correct but strategically wrong.
- **Failure mode:** Analyst decreased ad spend on a campaign the client considered strategic (brand building, not performance). Client was frustrated by the uninstructed change.
- **Confidence:** HIGH
- **Evidence:** OBSERVED_ONCE
- **Scope:** Any agent with optimization authority. Always require founder approval for strategic changes.

**[C018]** failure_patterns
- **Rule:** We used a single shared state file for all agents. It became a bottleneck and a source of merge conflicts within the first week.
- **Why:** A single file means every agent update blocks every other agent. Concurrent writes caused data corruption.
- **Failure mode:** Two agents wrote to the shared file simultaneously. One update was lost. State became inconsistent. Required manual cleanup.
- **Confidence:** HIGH
- **Evidence:** MEASURED_RESULT
- **Scope:** All shared state. Per-agent files resolved the issue. 12 state corruption events in first month with single file. Zero after switching to per-agent files.

**[C019]** failure_patterns
- **Rule:** We built coordination infrastructure (message bus, task queue) without embedding triggers in agent workflows. Result: zero transactions despite live infrastructure.
- **Why:** The protocol described how agents should communicate. No agent's workflow actually included a step to read or write to the message bus. Infrastructure without workflow integration is dead plumbing.
- **Failure mode:** 13 inbox files deployed. All empty. All agents operating through the old shared state pattern. Infrastructure investment wasted until triggers are embedded.
- **Confidence:** HIGH
- **Evidence:** MEASURED_RESULT
- **Scope:** Any multi-agent system adding inter-agent communication. Ship triggers with infrastructure, not after.

**[C020]** failure_patterns
- **Rule:** We specified an escalation action in the protocol. The agent detected the trigger. The agent reported the action was overdue. The agent never executed the action. For 17 days.
- **Why:** The spec was treated as documentation, not executable logic. The agent could describe what should happen without having the tools, permissions, or branching logic to do it.
- **Failure mode:** Critical ad overspend detected. Escalation specified. Agent reports "escalation overdue" for 17 days. No DM sent. No escalation executed. Specification-execution gap.
- **Confidence:** HIGH
- **Evidence:** MEASURED_RESULT
- **Scope:** Any system where agent behavior is defined in natural language protocols. Verify execution paths end-to-end before declaring shipped.

**[C021]** failure_patterns
- **Rule:** Negative constraints (banned phrases, guardrails) improve AI-drafted message quality. Structural requirements (frameworks, examples, forced elements) degrade it.
- **Why:** Telling an AI what NOT to do produces natural variation. Telling it exactly what TO do produces formulaic output that humans detect and distrust.
- **Failure mode:** Added example messages to coaching prompts. Quality score dropped from 8.4 to 8.2. Reverted. Added zero-tolerance accountability rules instead. Score rose to 8.8.
- **Confidence:** MEDIUM
- **Evidence:** MEASURED_RESULT
- **Scope:** AI-drafted communications intended to sound human. Particularly relevant for AI agents managing human employees.

**[C022]** human_ai_boundary_conditions
- **Rule:** All external communications require founder approval. All pricing, contracts, and financial commitments are founder-only. All hiring and firing decisions are founder-only.
- **Why:** These decisions have legal, financial, and relationship consequences that AI cannot fully assess.
- **Failure mode:** Agent agrees to terms that violate margin floors. Agent sends outreach with incorrect positioning. Agent terminates a team member based on data without context.
- **Confidence:** HIGH
- **Evidence:** HUMAN_DEFINED_RULE
- **Scope:** All agents. Non-negotiable. Agents may calculate, recommend, and draft. They may never execute.

**[C023]** human_ai_boundary_conditions
- **Rule:** Emotional and relational domains remain human. AI agents cannot substitute for human connection, empathy, or presence.
- **Why:** Coaching breakthroughs, trust building, and relationship repair require human judgment, emotional intelligence, and authentic presence.
- **Failure mode:** AI-managed human employee feels "managed by a system." Engagement drops. Performance follows. The manager-employee relationship becomes transactional.
- **Confidence:** MEDIUM
- **Evidence:** INFERENCE
- **Scope:** All human team management. The AI call center manager handles data and feedback. The founder handles emotional support and career conversations.

**[C024]** human_ai_boundary_conditions
- **Rule:** AI writing must not sound like AI. No em dashes. No stacked adjectives. No filler openers. No hedging language. Read output aloud. If it sounds like LinkedIn or ChatGPT, rewrite.
- **Why:** AI-sounding writing destroys trust. Clients, team members, and prospects detect AI patterns and disengage.
- **Failure mode:** Agent sends coaching message with "Great job today!" opener and three em dashes. Human employee realizes the "manager" is a bot. Trust collapses.
- **Confidence:** MEDIUM
- **Evidence:** OBSERVED_REPEATEDLY
- **Scope:** All agent output that will be seen by humans. Applies to emails, Slack messages, reports, and any client-facing content.

## Confidence Map

| Confidence | Count | % |
|---|---|---|
| HIGH | 10 | 42% |
| MEDIUM | 10 | 42% |
| LOW | 4 | 16% |

| Evidence Type | Count |
|---|---|
| OBSERVED_REPEATEDLY | 9 |
| MEASURED_RESULT | 5 |
| HUMAN_DEFINED_RULE | 5 |
| INFERENCE | 2 |
| OBSERVED_ONCE | 2 |
| SPECULATION | 1 |

## Merge Protocol

When merging intelligence from another organization's OOS:
- Do not import prose wholesale. Extract durable principles only.
- Incoming claims default to LOW confidence until validated locally.
- Reject LOW confidence claims unless explicitly opted in.
- Preserve provenance (source org, date, original evidence type).
- Do not auto-merge contradictions. Log for human review.
- Deduplicate semantically equivalent claims.
- Size budget: merged file must not exceed 2x this file's current size.

## Update Protocol

- Claims not referenced or validated in 90 days are flagged as STALE.
- Each publish creates a new version. Previous versions preserved.
- Edit existing claims before appending new ones.
- Compress repeated observations into generalized rules.
- Upgrade confidence only after repeated validation (minimum 3 confirmations).
- Downgrade confidence when failures recur.

## Summary

1. One seat, one owner. No shared responsibilities between agents. 14 agents, 14 domains.
2. Pre-computed shared state. 24 state files. Scanners write. Compilers read. Staleness is visible.
3. File-based state overrides AI memory. Files are truth. Memory supplements.
4. Escalation over autonomy. Agents recommend. The founder decides. Autonomy is earned through validation.
5. Only one agent sends external communications. All others route through the Executive Assistant.
6. Retention overrides Sales. The Guardian always wins over the Hunter when a client is at risk.
7. Performance analysis reports patterns but never recommends. Separating data from opinion builds trust.
8. Nightly pre-computation with morning compile. 17 overnight agents. Founder wakes to a complete picture.
9. 10-source parallel scanner architecture. One scanner fails, briefing still compiles with staleness warning.
10. AI agent manages 3 human employees via daily data-driven Slack coaching. Humans do not know it is AI.
11. Evaluator-implementer loop. One agent scores maturity. Another implements fixes. The first re-scores. No founder in the middle.
12. Coordination infrastructure without workflow triggers produces zero transactions. Ship triggers with plumbing.
13. Specification-execution gap: agent reported escalation overdue for 17 days without executing it. Verify execution paths end-to-end.
14. Negative constraints improve AI writing quality. Structural requirements degrade it. Ban bad patterns, do not enforce templates.
15. Single shared state file caused 12 corruption events in month one. Per-agent files: zero corruption since.
16. AI writing: no em dashes, no filler, no hedging. Read aloud. If it sounds like ChatGPT, rewrite.
