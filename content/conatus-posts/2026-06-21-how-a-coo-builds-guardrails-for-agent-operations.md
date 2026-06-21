---
title: The COO builds the guardrails that make an agent fleet safe to run at speed
date: 2026-06-21
author: David Steel
slug: how-a-coo-builds-guardrails-for-agent-operations
type: founder_essay
status: published
series: ai-coo
series_part: 20
description: Six guardrails every COO needs before handing real operational work to an agent fleet. From scope gates to retirement hearings, the discipline that keeps the fleet reliable.
---

# The COO builds the guardrails that make an agent fleet safe to run at speed

Speed without guardrails is not an operating model. It is a liability.

That is the thing nobody says clearly enough when they write about AI agents in operations. The upside is real: agents carry the operational load so that people are free for the work that only people can do. But the upside only materializes if someone built the constraint layer first. That someone is the COO.

Deloitte surveyed 3,235 enterprises in 2026 and found that only 21 percent have a mature governance model for agentic AI. The other 79 percent are running agents without the scaffolding that makes them trustworthy. They are getting some of the speed and most of the risk.

The COO's job is not to slow agents down. It is to build the six things that let the fleet run fast without the failures accumulating invisibly in the background.

## 1. Scope gates before the agent goes live

Every agent at Sneeze It has a written scope boundary before it handles any real work.

Radar owns daily operations, briefings, and cross-channel awareness. Radar does not touch client communications. Pepper owns email triage and draft responses. Pepper does not send anything without approval. Dirk owns pipeline and revenue. Dirk does not write to our CRM without an environment variable that explicitly authorizes writes, and deletes are impossible by design because the API token has no delete scope.

Scope gates are not about distrust. They are about blast radius. If an agent makes a mistake inside its scope, the fix is contained. If an agent makes a mistake outside its scope, you are cleaning up a different kind of problem. The COO defines the boundary before the agent goes live because after it goes live the boundary is much harder to enforce.

The rule we use internally: every write operation requires explicit authorization. Reads are open. Writes are gated. Deletes require three layers of protection. This is not bureaucracy. It is the operational equivalent of a surgeon who counts instruments before and after. You do not skip the count because you trust the surgeon.

## 2. One-seat-one-owner with no gaps and no overlaps

Accenture's position on agent deployment is worth quoting directly: reinvent the process first, then infuse the agent. Do not make inefficiency run efficiently.

The one-seat-one-owner rule is the organizational expression of that principle. Before any agent goes live, someone has to be able to answer two questions. Who owns this seat? And what work does this seat produce that no other seat produces?

At Sneeze It, Dash owns all customer ad performance analysis across Meta and Google. Arin owns call center team performance management. Crystal owns project status and delivery risk. These seats do not overlap. If Dash flags a spend anomaly and Arin flags a call center coverage gap, nobody is confused about who owns the fix for each. The COO's job is to draw that map clearly before the work starts, not to resolve ownership disputes after a handoff fails.

Gaps are the other failure mode. When work exists that no seat owns, it either does not get done or it gets done inconsistently by whoever notices it. The COO runs a regular audit of the work that is actually happening against the seats that exist and asks: what is falling through? Those gaps become the next seats to fill, whether human or agent.

## 3. An explicit handoff protocol at every human-agent boundary

The most fragile point in any hybrid operation is the moment work passes from an agent to a human or from a human to an agent. The handoff is where quality breaks down and where time disappears.

Our agents coordinate through structured inbox files. Dirk does not interrupt Pulse directly when it wants to run an expansion outreach sequence on a client. Dirk sends a structured REQUEST to Pulse's inbox and waits for a RESPONSE. Pulse reads the request, checks the client's churn risk status, and sends back either clearance or a hold. No human in the middle. No ambiguity about who decided what.

The handoff protocol has three requirements. The sending agent must specify what it is passing, why, and what response it needs. The receiving agent must acknowledge, decide, and respond. The audit trail must exist so that when something goes wrong, you can trace the handoff and find where it broke.

When Pepper routes a client email draft to David for approval, the format is identical every time. What the email says, why this client matters, what approval is needed. Not a paragraph of context. Four fields. David reads four fields, approves or edits, done. The consistency of the handoff format is what makes it fast. The approval gate is what makes it safe.

## 4. Quality gates built into the process, not bolted on afterward

A quality gate is a checkpoint in a process that an agent cannot pass without meeting a defined standard.

Nick, our cold prospecting agent, runs a mandatory email validation step before any address goes into a draft. This is not a review layer David added after Nick sent a batch with a 20 percent bounce rate. The validation is built into the pipeline as a hard stop. If LeadMagic cannot validate an address, Nick does not draft the email. The quality gate is inside the sequence, not after it.

The same logic applies to every agent process we run. Pepper does not auto-delete any email category without a written suppression rule that David has reviewed. Dash does not flag a spend anomaly without a baseline comparison against the 7-day and 30-day averages. Tally does not push a KPI value to the OTP scorecard if the source file is missing. These are not manual review steps. They are conditions the agent must satisfy before the next step runs.

The COO's job is to identify, for each agent process, the one or two points where a bad output would be expensive or irreversible, and then build the quality gate at those exact points. Not everywhere. Not a comprehensive review process at every step. The specific points where the failure is costly.

## 5. A monitoring layer that detects drift before it compounds

Agents drift. This is not a software failure. It is an operational reality. The inputs change. The environment changes. The agent keeps running under the same rules that were correct when those rules were written, which means the outputs start drifting away from what the business actually needs.

Radar flags any shared state file older than 18 hours as stale. This is not a notification for David to read. It is a structured alert that appears in the daily briefing so that nobody is running a decision on stale data without knowing it is stale. The 18-hour threshold is a monitoring gate.

Bassim, our agentic maturity evaluator, runs a periodic assessment of the fleet against a structured framework and produces a single score with evidence. The score is not meant to make the agents feel good about themselves. It is meant to surface capability gaps and stagnation before they compound into a fleet that is technically running but not actually improving.

The COO asks: what does drift look like for each agent, and how would we know if it was happening? If the answer is "we would notice eventually," that is not a monitoring layer. That is hope. Hope is not an operating model.

## 6. A retirement protocol that treats agent exits with the same rigor as agent onboarding

Most organizations onboard agents carefully and retire them carelessly. They turn off a process, delete a config, and move on. The institutional knowledge of what that agent was doing, what it was connected to, and what downstream dependencies it had disappears with the process.

We retired Jeff, our data integrity agent, in April 2026 after a formal hearing. The hearing produced a record: what Jeff was accountable for, why the seat was no longer serving the business, and where each capability was being redistributed. Dash inherited the ad pacing monitor. Dan absorbed the blind spot identification function. Crystal took the budget reconciliation work.

The retirement record is not ceremonial. It is operational. The COO needs to know, six months after an agent retirement, what happened to the work. If you cannot answer that question, you probably did not redistribute the work correctly, and something is falling through a gap somewhere.

MIT CISR's research on enterprise AI maturity found that the biggest performance jump happens when organizations move from building individual AI pilots to developing what they call AI ways of working. The retirement protocol is part of the AI operating model. An agent seat that ends cleanly, with capabilities redistributed and dependencies mapped, is evidence of a mature operating model. An agent that just stops running is evidence of a pilot that was never fully operationalized.

## What the guardrails make possible

The purpose of these six guardrails is not compliance. It is speed.

When scope gates are written, agents can act without waiting for someone to tell them what they are allowed to do. When handoff protocols are standard, work moves between agents and humans without friction. When quality gates are built into the process, agents do not produce outputs that humans have to remediate. When drift is monitored, problems surface before they compound. When retirements are handled cleanly, the fleet stays coherent as it evolves.

The COO who builds this infrastructure earns something valuable: the ability to let agents carry the operational work so that people are genuinely free for the work that matters. Bogdan, our COO, and Janine in accounting are not spending their time on work that agents can do reliably. They are on the strategic, relational, judgment-intensive work that cannot be systematized. That shift happened because the guardrails made it safe to let the agents run.

Without the guardrails, the agents are a pilot. With the guardrails, they are an operating model.

## See the live chart

Every seat in our hybrid org, including which guardrails govern each agent, is queryable from OTP's MCP server.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the sneeze-it org chart and list which seats are agent-operated."*

The response will show you exactly what a live hybrid chart looks like when every seat has an owner, a scope, and a place on a single scorecard.
