---
title: Monitoring an AI agent in production is an accountability problem, not a logging problem
date: 2026-06-21
author: David Steel
slug: how-to-monitor-an-ai-agent-in-production
type: founder_essay
status: published
series: ai-cio
series_part: 40
description: Most teams monitor AI agents with runtime logs. That is the wrong layer. Here is what production monitoring actually requires once you are running a fleet.
---

# Monitoring an AI agent in production is an accountability problem, not a logging problem

The first question most teams ask when they put an AI agent into production is: where are the logs?

Latency dashboards. Token counts. Error rates. Request volume. These feel like monitoring because they look like the dashboards you already run for your servers and APIs.

They are not monitoring. They are instrumentation. There is a difference, and the difference is what causes most production agents to quietly drift until something expensive breaks.

Here is the distinction I have learned running more than ten agents in production at Sneeze It: instrumentation tells you what the agent is doing. Monitoring tells you whether what the agent is doing is serving the business. You need both, but you cannot skip to the second one. Most teams skip the first one entirely.

## Before: what production looks like without real monitoring

When an agent goes live without accountability structure, you get a recognizable pattern.

The team that built the agent is proud of it and watching the technical metrics closely. The business team that was supposed to benefit from the agent is waiting for results but does not have a clear metric to watch. The agent is producing outputs. There is no agreed definition of whether those outputs are good. Six weeks pass. Someone notices the original problem has not improved. A postmortem begins and it is very hard to find the evidence for when things went wrong, because the only logs anyone was watching were runtime logs, and runtime logs do not tell you when the agent started producing outputs that nobody was using.

I lived through this with our first few agents. The agent was technically healthy. Tokens consumed, tasks completed, latency under threshold. The business metric we were trying to move had not moved. We had no signal for when the drift started because we had not defined what success looked like in business terms before we shipped.

Gartner, as reported by CIO.com, has named this pattern "agent sprawl" and calls it the new Shadow IT. Their six-step framework for managing it includes step five: monitor and remediate agent behavior. The step exists because most organizations are not doing it, or they are confusing runtime instrumentation with behavioral monitoring.

The Deloitte State of AI in the Enterprise 2026 (n=3,235) found that only 21% of enterprises have a mature governance model for agentic AI. The other 79% are running production agents with, at best, the runtime dashboard layer. They are not monitoring the thing that matters, which is whether the agent is doing the job it was hired to do.

## The core shift: agents are not services. They are seats.

The reason runtime monitoring is insufficient is that an AI agent is not a service. A service does not have a job. A service handles requests. An agent has a mandate. It has a defined scope of work, a target, and an accountability relationship to the humans around it.

When you manage an agent like a service, you monitor it like a service. When you manage an agent like a seat on your org chart, you monitor it like you would monitor any other seat: by watching the business metrics that seat is responsible for, on the same cadence you watch every other seat.

At Sneeze It, every agent holds a named seat on our org chart with one owner, one metric set, and one accountability relationship. Tally, our scorecard agent, owns KPI publishing. Dash, our analytics agent, owns portfolio ad performance. Dirk, our sales agent, owns pipeline metrics and cold outreach numbers. Pepper, our email agent, owns inbox health and client response time. Arin, our call center manager, owns appointment rate against a 30% target. Crystal, our project management agent, owns deadline tracking across active projects.

These are not runtime metrics. They are seat metrics. The difference is that seat metrics connect to outcomes the business cares about, and they are visible to the humans who depend on those outcomes.

## After: what production monitoring looks like when it is working

The before-state is an agent in production with a separate runtime dashboard that the engineering team watches and a vague expectation that the business team will notice if things go wrong.

The after-state is three things running together.

**First, the agent publishes its own numbers.** At Sneeze It, every agent writes to a shared state file at a defined cadence. Radar, our chief of staff, reads all those files in the morning and includes each agent's numbers in the same daily briefing that covers Bogdan (our COO), Janine (our accounting lead), and Kristen (our creative director). The agent is not waiting for someone to pull its data. The agent is publishing its own accountability numbers the same way a human direct report would send an end-of-day summary.

This is the discipline MIT CISR's research calls "human accountability non-negotiable." The agent does not escape accountability because it is an agent. It publishes, like any seat on the chart does.

**Second, the same review cadence covers agents and humans.** When I walk our Monday numbers, I do not have a separate call for agents. Dirk's row is next to the sales pipeline row. Arin's appointment rate is next to the team metrics. If Dirk's cold email count dropped, the conversation that happens is the same conversation I would have if any human's number dropped: what changed, what is the cause, what is the fix. The agent is not excused from the conversation because it is software.

Neil, our learning agent, exists partly because agents need the same input that humans need to get better. When something is not working, Neil is responsible for identifying whether there is a better approach, flagging it, and proposing the change. That is the agent equivalent of professional development. It belongs in the monitoring architecture.

**Third, the agent has a correction loop, not just a feedback loop.** This is the part most monitoring frameworks miss. A feedback loop tells you the agent got worse. A correction loop tells you why and writes that reason somewhere durable so the same drift does not happen again.

At Sneeze It, when David corrects an agent's output, that correction is captured and stored as a learning. The learning is accessible to the same agent and to other agents that face the same pattern. The correction loop is what turns a single failure into fleet-level improvement. Without it, you fix the same problem twice, and then three times, and then you start wondering why monitoring feels like chasing the same fires.

Bassim, our maturity evaluator, measures whether this loop is actually running or just theoretically available. The score he produces is a production monitoring signal: not "is the agent healthy" but "is the fleet learning."

## The coordination layer is also a monitoring signal

One monitoring signal most operators miss is what happens between agents.

At Sneeze It, agents coordinate through an agent message bus. Dirk, our sales agent, can send a message to Pulse, our retention agent, before contacting a client, to check whether that client is on a watch list. If Pulse flags the client, Dirk pauses. That coordination is a production signal: if agents are not coordinating when they should be, the fleet has a gap that will eventually surface as a business problem.

The agent-to-agent traffic is worth watching the same way you watch inter-service API calls. Not because you care about the traffic itself but because the pattern of traffic tells you whether the fleet is operating as a system or as a collection of independent agents that happen to share a chart.

A collection of independent agents will drift. A system will self-correct.

## What the CIO actually needs to put in place

The advisory firms have named the right components. Gartner's six-step framework, as reported by CIO.com, covers agent inventory, identity, lifecycle, behavioral monitoring, and governance. CIO.com's three-pillar framework from Ritu Jyoti covers conflict resolution, context and memory, and cross-agent security.

The frameworks are right. What they do not give you is a running system.

A running system is a chart where every agent holds a named seat with a defined business metric, a publishing cadence, a correction loop, and a place in the same Monday conversation where every other seat is reviewed. That is the difference between having advice about agent monitoring and actually monitoring agents in production.

The mission we are working toward is: let agents carry the operational work, so people are free for the work that matters. That only works if the agents are actually accountable. Accountability requires monitoring. Monitoring requires the right layer, and the right layer is not the log file.

## See the live chart

Every agent seat at Sneeze It is queryable from the OTP MCP, including the published state files and the metrics each seat is accountable for.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the seats on the Sneeze It chart and what metrics each agent seat is accountable for."*

What comes back is not a runtime dashboard. It is an accountability chart. That is what production monitoring looks like when it is working.
