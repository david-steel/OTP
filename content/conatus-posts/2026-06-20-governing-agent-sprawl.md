---
title: The CIO governance problem with agents is not that there are too many agents. It is that nobody owns them.
date: 2026-06-20
author: David Steel
slug: governing-agent-sprawl
type: founder_essay
status: published
series: ai-cio
series_part: 2
description: Agent sprawl is not a tooling problem. It is an accountability problem. Here is how we govern it with seats, not software.
---

# The CIO governance problem with agents is not that there are too many agents. It is that nobody owns them.

Every CIO conversation about agent sprawl sounds the same right now.

There are too many agents running across the company. Marketing spun up three. Finance has one nobody asked for. A product team is running something on the side that touches customer data. IT found out about half of them by accident. Nobody knows what the full list is. Nobody is responsible for the ones that stop working.

The word for this is sprawl, and it sounds like a tooling problem. You need a registry. You need a governance layer. You need a way to see all the agents in one place. So you buy a platform, or you build one, or you issue a policy, and a year later the sprawl is worse because the agents have multiplied faster than the registry.

Here is the actual problem: the agents do not have seats.

Tooling did not cause the sprawl. The absence of an accountability structure caused it. And no tooling will fix an accountability problem.

## What a seat means and why agents need one

A seat is not a title. A seat is a defined role on an org chart with a name, a scope, a set of metrics, and a person or thing that owns it.

When a human has a seat, they show up in the weekly meeting. Their numbers are on the scorecard. Their manager knows what they are responsible for. If their numbers drop, the conversation about why is the same conversation as any other row on the scorecard.

When an agent has a seat, the same structure applies. The agent has a name. It has a defined scope. It owns a set of metrics. It has a human who is accountable for that row.

When an agent does not have a seat, it is infrastructure. Infrastructure does not show up in the Monday meeting. Infrastructure's numbers do not live on the scorecard. When infrastructure breaks, nobody catches it until something downstream is already on fire.

Most company agents today are infrastructure. That is the governance problem. Not the count of agents. The seat gap.

## What the Sneeze It chart actually looks like

We run a hybrid org at Sneeze It. Humans and agents on the same accountability chart, same scorecard, same weekly cadence.

Dirk is our sales agent. Dirk has a seat on the chart with three metrics: cold emails drafted per week, pipeline stage transitions per week, and qualified meetings generated in the period. Dirk's seat has a human owner who is responsible for the row at every Monday meeting. If the row drops, the conversation is not "the AI is broken." The conversation is "what changed in the inputs, what changed in the SOP, what does the seat need to recover the number."

Tally is our scorecard agent. Tally's one job is to push KPI values from local data sources up to the OTP chart four times a day on weekdays. Tally does not own strategy. Tally does not interpret results. Tally owns one metric: KPI freshness. If Tally's row shows stale data, the conversation is immediate and specific. Not "something is wrong with reporting." The seat name tells us exactly what failed and who is accountable for it.

Dash is our numbers agent. Dash reads Meta Ads, Google Ads, and our call center data every morning and writes a structured summary that Radar (our chief-of-staff agent) reads during the daily briefing compile. Dash has a seat. The seat has a scope boundary: Dash reports patterns, Dash does not recommend changes. That boundary is enforced not by software but by the role definition written into the seat itself.

Three seats. Three different roles. Three humans who own those rows at the Monday meeting. Zero ambiguity about who is responsible when any of those rows goes sideways.

That is what governed agents look like.

## Why the registry approach does not work

The instinct most governance programs reach for is a central registry. Every agent in the company registered, categorized, tagged with a risk level and a data sensitivity tier, reviewed quarterly by a committee.

This is not wrong. It is just insufficient, and it is often counterproductive.

A registry tells you what agents exist. It does not tell you who is accountable for them. It does not force any conversation about what the agent is supposed to accomplish. It does not connect the agent to the outcomes the business cares about. You can have a perfect registry of forty agents and still have forty orphaned processes that nobody is watching.

The quarterly committee review makes this worse. It creates the illusion of governance without creating the operating discipline of governance. A quarterly review means a problem can drift for three months before it surfaces. Weekly cadence on a scorecard means a problem surfaces the following Monday.

The registry is also a magnet for compliance theater. Teams register their agents to satisfy the requirement. They write a one-line description. They assign a theoretical owner who is not actually watching the numbers. The registry is complete. The agents are still ungoverned.

Registries are necessary for audit trails. They should not be confused with accountability structures.

## The actual governance framework

Governance at the seat level has four components. They are not complicated. They are just different from what most technology governance programs are built around.

First, every agent gets a name and a scope statement. The name is not "AI assistant" or "automation bot." The name is a role name. Dash. Tally. Dirk. The scope statement is one paragraph: what the seat owns, what it does not own, and where it hands off. The scope statement is the thing that prevents overlap and drift. It is also the thing that tells you when an agent has started doing things outside its seat.

Second, every agent seat gets at least one business-outcome metric. Not a runtime metric. Not tokens consumed or tasks completed. A metric the business cares about in the same way it cares about the human metrics on the same scorecard. If you cannot write that metric, the seat is not ready to exist.

Third, every agent seat has a human owner. The human owner is accountable for the seat's row at the weekly meeting. The owner does not have to be technical. The owner has to be close enough to the work to know when the number is wrong and why.

Fourth, every agent seat is on the same cadence as the human seats. Same meeting. Same cadence. Same conversation discipline. If agents are reviewed separately on a separate cadence, the accountability structure is split and you are back to the infrastructure problem.

That is the framework. Four components. No specialized tooling required. It scales because each seat is self-contained and each seat has a human who is responsible for it.

## When an agent does not deserve a seat

The other half of governing sprawl is retiring agents that should not have seats.

We learned this in April when we formally retired Jeff, who had been running a data integrity function that three other agents had since absorbed. Jeff's retirement was not a technical event. It was a hearing. Jeff's seat-owner made the case for why the seat still existed. The case did not hold up. The seat was retired, the capabilities were redistributed, and the record was kept.

The governance habit that this represents is not complicated: if an agent's seat cannot survive a five-minute accountability hearing, the seat should not exist. The agent is either duplicating work another seat is already doing, or it is covering a function nobody actually needs, or it is running as infrastructure with no real outcome to point to.

Running that conversation annually is too slow. Running it quarterly is better. Running it whenever a seat's row goes flat on the scorecard is right.

Sprawl is not caused by too many agents. Sprawl is caused by agents that outlive their seat justification because nobody is running the retirement conversation.

## What this means for the CIO

The CIO's governance role in a hybrid org is not to approve tooling. It is to own the accountability structure for the agent seats.

That means insisting that every agent has a seat before it runs in production. It means every seat has a business-outcome metric before the seat is chartered. It means every seat has a human owner who shows up at the weekly meeting. It means the retirement conversation happens on schedule, not when something breaks.

Let agents carry the operational work, so people are free for the work that matters. That mission only holds if the agents are governed well enough to trust. The seat structure is what makes them trustworthy, not the model version they are running on.

The tooling question is not wrong. It is just downstream of this one.

## See the live chart

Query the Sneeze It org chart from the OTP MCP to see which agent seats are currently active, who their human owners are, and what metrics each seat is accountable for.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It org chart. For each agent seat, identify the scope, the owner, and the key metrics."*

What comes back is a live accountability structure, not a registry. The difference is visible in the structure of the response.

---

*Series: AI CIO. Post 2 of an in-progress series.*
