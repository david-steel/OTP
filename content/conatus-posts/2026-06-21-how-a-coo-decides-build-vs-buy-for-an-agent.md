---
title: The COO answers build versus buy by looking at the process first, not the product catalog
date: 2026-06-21
author: David Steel
slug: how-a-coo-decides-build-vs-buy-for-an-agent
type: founder_essay
status: published
series: ai-coo
series_part: 30
description: A COO deciding whether to build or buy an AI agent has one prior question to answer before the sourcing decision matters at all.
---

# The COO answers build versus buy by looking at the process first, not the product catalog

The build-versus-buy question for AI agents sounds like a technology decision. It is not. It is an operations decision, and the COO is the right person to make it, not the CTO, not the vendor who wants to sell you something, and not the AI lead who is excited about what they just saw at a conference.

The COO answers it by looking at the process first.

If the process is not clean, neither option works. You can build a sophisticated custom agent on a broken process and have it faithfully reproduce the breakage at machine speed. Accenture's framing for this is blunt: reinvent the process before you automate it. Do not make inefficiency run efficiently. The build-versus-buy question is irrelevant until the process question is answered.

Once the process is clean, the sourcing decision becomes straightforward. The criteria are operational, not technical.

## Why the COO owns this decision

Most organizations treat agent sourcing as a technology procurement question. IT evaluates the options, finance approves the budget, someone from operations signs off on whether the output looks right. The agent goes live. Nobody is accountable for whether it serves the process it was deployed into.

The COO owns this because the COO owns the process. Every agent in an operation is filling a seat. The seat has a defined input, a defined output, a handoff in, and a handoff out. Whether the seat is filled by a human or an agent, and whether the agent was built or bought, those are downstream choices. The upstream choice is whether the seat and its process are designed well enough to be filled at all.

Most COOs are getting the sequence wrong. They see the agent, they want to use it, and they retrofit it into a process that was built for humans and never redesigned. When it fails, they blame the model. The model is rarely the problem. The process is the problem.

## The three operational criteria

Once the process is clean and the seat is defined, I use three criteria to decide whether to build or buy. They are sequential. You do not move to the next one until the previous one answers the question.

**First: Does any product match the seat closely enough to be useful?**

This is not "does any product exist in this category." It is whether the product's default behavior, after reasonable configuration, matches what the seat actually does in the process. The configuration test is: can I describe what this seat produces in one sentence, and can the vendor product produce that output without custom code?

For Crystal, our project management agent at Sneeze It, the underlying platform is Accelo. Crystal wraps the Accelo MCP server. The seat definition, the reporting cadence, the status structure, the escalation protocol, those are ours. But the data platform is theirs. That is a buy, configured.

For Dash, our analytics agent, there is no vendor product that reads a mix of Meta Ads, Google Ads, and call-center data from a Google Sheet, flags spend anomalies against seven-day and thirty-day baselines, and surfaces it by client account every morning. That combination is specific to our operation. That is a build.

If the product matches closely: buy. If it does not: go to the second criterion.

**Second: Is the organizational knowledge required to do the seat's work already documented?**

This is the criterion most operators skip. Building an agent requires encoding the operational knowledge that belongs to the seat. If that knowledge lives entirely in someone's head, you do not have enough to build with. You will spend twice what you expected extracting the implicit logic from the human who has been carrying it.

If the knowledge is documented in a SOP, a historical record, or a clear brief, building is feasible. If it is not documented, the real project is documentation, not agent development.

At Sneeze It, Arin, our call center manager, exists as an agent because the methodology was documented before the agent was built. The metrics, the daily coaching structure, the escalation paths were all written down. Arin runs on that documentation. Without it there would be nothing to build. Nick, our cold prospecting agent, is the same story: the ICP rules, the outreach pattern, the bounce gate were all specified before a line was written. Where documentation was absent, we wrote it first.

## What "build" actually costs

The mistake COOs make when deciding to build is underestimating what they are taking on. Building an agent is not acquiring a worker. It is acquiring a capability and accepting the full cost of the seat definition, the SOP, the testing, the handoff design, and the accountability structure.

That accountability structure costs the same whether you build or buy. You have to design the seat, document the process, define the metric, and assign a named owner who answers for the number each week. If you are buying, the vendor handles the execution layer. If you are building, you handle that too. The governance cost is identical. The execution cost differs.

At Sneeze It, Bogdan, our human COO, sits on the same scorecard as Radar, Tally, Dirk, and Pulse. One seat, one owner, one metric, regardless of whether the seat is a person or an agent. That uniformity costs real time to maintain and it does not vary by sourcing decision.

## The one thing that kills both options equally

There is a single failure mode that kills both builds and buys with equal efficiency. It is deploying the agent before the process is ready.

Jeff, our former data integrity agent, is the clearest case in our operation. Jeff was built into a legitimate process. Over time the work migrated. Dash absorbed the analytics. Dirk absorbed the revenue data checks. Crystal absorbed the project reconciliation. The process Jeff was filling ceased to exist, but Jeff kept running because nobody had defined a retirement trigger.

When we held Jeff's retirement hearing, the honest answer was that the seat had been empty of real work for months. That is not a build-versus-buy failure. It is a process-governance failure. A vendor-bought agent in the same seat would have run the same empty loop.

The COO's corollary to the Accenture principle is: keep reviewing the process after you automate it. The agent will faithfully execute a seat that has become obsolete. Only the COO catches that, because only the COO is watching the process, not just the output.

## The decision in one sequence

The COO's build-versus-buy decision follows this order.

Is the process clean and the seat defined? If no: fix that first. If yes: proceed.

Does a vendor product match the seat closely enough without custom code? If yes: buy or configure. If no: proceed.

Is the required organizational knowledge documented? If no: document it first. If yes: build.

That sequence prevents two failure modes: buying into a seat that needs custom behavior, and building into a process a vendor has already solved.

The agents carry the operational work. The COO makes sure the process is worth filling before any sourcing decision is made. That is the job.

## See the live chart

The Sneeze It org chart, including which seats are builds and which are vendor-configured, is queryable from OTP MCP.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It org chart and which agent seats are custom builds versus vendor-configured."*

The chart makes the sourcing decision traceable, not just the outcome.
