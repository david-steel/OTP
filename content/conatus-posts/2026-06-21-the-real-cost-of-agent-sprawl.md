---
title: Agent sprawl does not feel expensive until you add up what you stopped seeing
date: 2026-06-21
author: David Steel
slug: the-real-cost-of-agent-sprawl
type: founder_essay
status: published
series: ai-cio
series_part: 45
description: The real cost of agent sprawl is not the compute bill. It is the accountability gap, the governance blind spot, and the decisions nobody is making because no one owns the seat.
---

# Agent sprawl does not feel expensive until you add up what you stopped seeing

The first time I heard "agent sprawl" used in a board meeting, the person saying it meant compute costs. They had a line item. It was growing. They wanted it controlled.

That is the wrong frame.

Compute costs are the visible part of agent sprawl. The expensive part is invisible: the accountability that evaporated when agents were deployed without seats, the decisions that stopped being made because nobody was watching, and the risk that accumulated quietly until something broke loudly.

Gartner named agent sprawl "the new Shadow IT" (as reported by CIO.com). The comparison is exact. Shadow IT cost organizations not because employees bought software that showed up on the card statement. It cost them because ungoverned software created ungoverned decisions, ungoverned integrations, and ungoverned data flows. The invoice was always the smallest part of the damage. Agent sprawl works the same way.

## How the sprawl actually happens

Nobody deploys fifty agents on a Tuesday morning. Sprawl accumulates the way any ungoverned resource accumulates. One department builds a customer service agent. Another builds a market research agent. A third spins up an outreach agent without telling the first team. Six months later, Gartner reports organizations are running approximately fifty or more agents, according to secondary reporting via CIO.com (Gartner's primary data was behind a paywall during this research). Nobody planned for fifty. Nobody is watching fifty.

This is the causal chain that matters. Agents get deployed. Agents do not get seats on any org chart. Agents do not have named owners. Agents do not appear on any scorecard. Agents accumulate. Nobody knows what the fleet is doing. The cost that shows up last (compute) gets managed first, while the costs that matter most (accountability, governance, trust) never get managed at all.

The Deloitte State of AI in the Enterprise 2026 report (n=3,235 enterprises) found only 21% of organizations have a mature governance model for agentic AI. That means roughly four out of five companies running agents are running them without the infrastructure to know whether they are working, failing, or doing something in between.

## The three costs that do not appear on any invoice

### 1. The accountability gap

When an agent takes an action and there is no seat attached to it, nobody owns what happened. The customer got a bad recommendation. The analysis was wrong. The outreach went to someone on a do-not-contact list. Whose number went down? Who is responsible for the fix?

Without a seat, those questions have no structural answer. Someone can be blamed, but nobody owns it. Blame is not accountability. Accountability requires a named seat, a named metric, and a named path to correction. Sprawl breaks all three.

At Sneeze It, every agent holds a seat with one owner. Pepper owns email triage. Dirk owns sales pipeline. Dash owns advertising analytics. Crystal owns project status. When Pepper sends a draft that misreads a client's tone, there is one row on the scorecard to address. There is one conversation about what changed. There is one fix that lands on one seat. The correction does not evaporate into "the AI did it."

The accountability gap from sprawl is not a soft cost. It is the cost of every untraced error, every missed correction, every repeated mistake that could have been a learning.

### 2. The governance blind spot

A fleet you cannot see is a fleet you cannot govern. Gartner's six-step framework for managing agent sprawl (reported by CIO.com) starts at the same place for exactly this reason: step one is governance and policies, step two is a centralized agent inventory. You cannot build a governance model for agents you have not catalogued.

The governance blind spot compounds. An agent you do not know exists cannot be audited. It cannot be updated when the business rule it was following changes. It cannot be retired when the process it was serving ends. It keeps running. It keeps producing outputs based on stale context. The outputs feed into decisions. The decisions turn out wrong. Eventually someone traces the chain backward and finds the agent that has been operating autonomously for nine months with no owner, no review, and no connection to the current business reality.

MIT CISR research on governing autonomous AI (Weill and Woerner, 2026) lands on a specific conclusion about agents: "human accountability will be non-negotiable." Human accountability is not non-negotiable when the human does not know the agent exists.

### 3. The opportunity cost of decisions not made

This is the cost that almost no one names, which is why it is the most expensive.

When agents run without a scorecard, nobody is reading the patterns in how they are performing. Nobody notices that the retention agent's numbers have been declining for three weeks. Nobody notices that the sales agent's email quality has drifted since the product offer changed. Nobody notices that one agent is doing the same work as another agent in a different department, at twice the cost.

These are the decisions that a unified scorecard makes visible. They are the decisions that sprawl permanently prevents, because you cannot make a decision about a pattern you cannot see.

We added Bassim to our fleet specifically because we recognized this problem. Bassim evaluates the maturity of our agent operations against a structured framework every time we invoke the evaluation. That evaluation surfaces where the fleet is operating well and where it is drifting. Without that seat, the drift would be invisible until something broke.

## What control actually looks like

The advisory firms have written the frameworks. Gartner's six steps are a reasonable inventory: governance policies, centralized agent catalog, identity and lifecycle management, information governance, behavior monitoring, and the balance between governance and empowerment. These are the right steps. The CIO.com synthesis of three pillars from analyst Ritu Jyoti (conflict resolution and priority logic, universal context and memory layer, cross-agent security and immutable audits) is also the right framing.

The problem with frameworks is that they are advice. A framework does not run. A framework does not hold a seat on Monday. A framework does not have a metric that goes red when something is wrong.

Control over agent sprawl requires a running system, not a written framework. The running system has to answer the same questions a good manager answers about any direct report: Who is this agent? What is it accountable for? Who owns it? When did it last perform? When did its number drop and why? What happens when the work it does is no longer needed?

These questions need a chair at the table, not a slide in a presentation.

## The causal path to control

The causal path is short, but the discipline to walk it is not.

First, every agent gets a named seat with one owner. One seat, one owner. No seat shared across two departments. No agent deployed without an owner who shows up to the accountability conversation. This is the step that prevents new sprawl from accumulating, but it requires the organizational will to say no to agents that do not have a named home.

Second, every agent seat carries a business metric, not a runtime metric. Not "tasks completed per day" or "tokens consumed per month." A business metric tied to an outcome the company sells. Tally, our KPI agent, exists for exactly this reason: to pull the numbers from each agent seat and push them to the scorecard where humans and agents are measured on the same surface. If you cannot write a business metric for an agent seat, the agent does not have a clear role yet and the seat should not be filled.

Third, there is a governance review cadence. Not a quarterly audit deck. A weekly row on the same dashboard where human performance gets reviewed. When an agent's row drops, it gets the same conversation any human row gets: what changed, what is the fix, who owns it by next week.

Fourth, agents retire when the seat is no longer needed. Jeff was our first retired agent. Not shut down, not deprecated. Retired, through a formal hearing, with his capabilities redistributed to the seats that made better use of them and a documented record of why. An agent fleet without retirement is a fleet that accumulates indefinitely, which means costs accumulate indefinitely and governance becomes progressively less coherent.

The mission underneath all four of those steps is the same: let agents carry the operational work, so people are free for the work that matters.

## Why the compute bill is the last thing to fix

When agent sprawl is visible only as a line item on a cloud invoice, the instinct is to manage it at the infrastructure layer. Consolidate APIs. Negotiate tokens. Rate-limit calls. This is the wrong layer to start.

Cutting compute costs from an ungoverned fleet is like trimming a budget by paying vendors less while leaving the question of which vendors you actually need unanswered. You reduce the spend without reducing the structural problem. The structural problem is that you have agents without owners, metrics without business grounding, and a fleet that nobody can see in full.

Fix the structure first. Give every agent a seat, an owner, a metric, and a retirement path. Once the fleet is visible and governed, the compute costs rationalize themselves, because you stop paying for agents nobody is watching and nobody needs.

The real cost of agent sprawl is not the invoice. It is the accountability you lost, the risks you stopped seeing, and the decisions that never got made because nobody owned the view.

---

## See the live chart

From the OTP MCP, you can query every seat on a live hybrid org chart, including which agents hold seats, who owns each seat, and what they are accountable for.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It org chart and list every agent seat with its owner and accountable metric."*

What comes back is the operational answer to agent sprawl: a named seat for every agent, one owner per seat, and a metric that shows up on the same scorecard as every human in the org.
