---
title: The unit economics of an AI agent are not what you think they are
date: 2026-06-20
author: David Steel
slug: how-to-measure-the-unit-economics-of-an-ai-agent
type: founder_essay
status: published
series: ai-cfo
series_part: 8
description: How to measure what an AI agent actually costs and produces, seat by seat, using the same unit economics framework you'd apply to any hire.
---

# The unit economics of an AI agent are not what you think they are

Most operators who ask me this question are looking at the wrong number.

They want to know what the agent costs to run. Token consumption. API fees. Infrastructure overhead. And those numbers matter, but they are not the unit economics. They are the input costs. The unit economics question is: what does it cost to produce one unit of output with this seat, and what is that unit worth to the business?

The answer changes everything about how you manage agents.

I have been running a full hybrid team at Sneeze It for about eighteen months now. Agents in seats. Humans in seats. One chart. One scorecard. The thing I had to figure out, the hard way, is that an agent seat has a lifecycle just like a human seat, and the economics shift at each phase of that lifecycle. If you measure an agent the same way at month one as you do at month six, you will either fire it too early or keep it too long.

Here is how I measure it now.

## Phase one: the cost to build the seat

The first unit economics question is not about operations. It is about whether the seat is worth building in the first place.

Every agent seat starts with a build cost. At Sneeze It, that build cost is mostly my time. When we built Tally, our scorecard agent, the build investment was roughly four hours to spec the seat, wire the KPI registry, and test the push logic. Tally's job is mechanically simple: pull KPI values from local sources and push them to the OTP scorecard four times a day. The alternative was either me doing it manually (ten minutes per push, four times a day, five days a week), or it simply not happening and the scorecard going stale.

The break-even math on Tally was about four days. After that, every push was pure recovered time.

Not every seat breaks even that fast. Dirk, our sales agent, took closer to forty hours to build, prompt, and wire to the right tools. The unit Dirk produces is a qualified cold email. At the target of thirty emails per day, and factoring in my time to review and approve batches, the break-even on the build cost took closer to six weeks. That is a different kind of investment. Worth making, but different.

The point is that build cost is real and it should be in the denominator when you calculate early returns. Operators who ignore it will misread an agent as profitable when it is still in payback.

## Phase two: the operational cost per unit

Once the seat is running, the economics shift to cost per unit of output.

For Tally, the operational cost per push is essentially zero. The MCP call is fractions of a cent. My oversight time is near-zero because Tally only escalates when a source breaks. At scale, the per-unit cost approaches the cost of the API call itself.

For Dirk, the operational cost per email is higher because each batch requires my review. Dirk drafts thirty emails. I spend about twenty minutes reviewing, approving, and occasionally flagging one to rework. Spread across thirty units, that is roughly forty seconds of my time per email, plus the API cost. Compare that to hiring a human SDR at market rate: the human cost per email, factoring in salary, management, benefits, and ramp time, is meaningfully higher.

The cost per unit comparison is what makes the seat defensible on a budget meeting. Not "the agent costs $X per month to run" but "the agent produces this unit of output at this cost, and the alternative costs this much."

## Phase three: the value of the unit produced

Cost per unit is only half the equation. The other half is what the unit is worth.

This is where most operators get sloppy. They assume that because the agent is doing work, the work is valuable. That is not true. Tally pushing stale KPIs to a scorecard nobody reads is cheap but worthless. Dirk sending thirty emails that land in spam is cheap but worthless.

I use a simple test for each seat: if this agent produced exactly zero units this week, what would break?

For Dash, our analytics agent, the answer is: Janine and I would lose our daily read on which client accounts are overspending, which ones are trending down, and where we need to act. Dash runs a scan every morning across all managed ad accounts. The unit she produces is an annotated performance summary with alerts. If that summary disappears for a week, we miss things that cost clients money and cost us relationships. The value of that unit is not abstract.

For Dirk, if zero cold emails go out, new pipeline stops. We can measure that. We know roughly what the pipeline value is per qualified cold email based on historical close rates. That is the number that makes Dirk's seat defensible to someone who does not know what an AI agent is.

The value per unit, anchored in real business consequences, is what makes the economics legible to everyone on the team.

## Phase four: the ROI moment

There is a specific moment in every agent seat's lifecycle when the economics flip from investment to return. I call it the ROI moment. The build cost is paid back. The operational cost per unit is below the alternative. The value per unit is established and compounding.

For most of our seats at Sneeze It, this moment happens between four and twelve weeks after the seat is live. It is not automatic. It requires a few things to be true.

The seat needs a clear scope. An agent with fuzzy responsibilities produces fuzzy units, and you cannot price fuzzy units. Dirk is scoped to agency sales only. Not client retention (that is Pulse). Not ad performance (that is Dash). Sales. When the scope drifts, the unit economics fall apart because the denominator becomes unclear.

The seat needs a metric that someone checks. Tally posts KPIs four times a day. If I stop looking at the scorecard, Tally is running but delivering nothing. The metric creates the accountability loop that makes the value real.

The seat needs a human who owns the row. Dirk's row on our scorecard has a target. When the target is missed, someone asks why. That conversation keeps the seat honest. An agent with no human checking the row will drift, and drifting agents are expensive in a way that does not show up in the API bill.

## Phase five: what scale does to the numbers

The reason agent economics compound is that most of the value scales while most of the cost does not.

Tally pushing KPIs four times a day costs almost the same as Tally pushing them eight times a day. Dash analyzing forty client accounts costs almost the same as Dash analyzing twenty. The human cost of review and oversight scales more slowly than the output.

This is the durable advantage that a properly built seat creates. A human seat scales linearly at best. An agent seat can scale output without a proportional increase in cost, as long as the oversight model keeps pace.

The oversight model is the constraint. When we added new client accounts to Dash's scope, the cost went up slightly but the review load on my side also went up, because there was more data to read. The economics stayed favorable, but they did not magically improve just because we added volume. The human attention required did not go to zero. It went to a sustainable ratio.

The goal is not to remove humans from the loop. It is to let agents carry the operational work so the humans in the loop are spending their attention on things that actually require human judgment.

That is the economic case in one sentence. Build the seat, measure the unit, check the value, own the row. Do it for every agent on the chart the same way you would for every human.

## See the live chart

You can query any seat's role, metric, and chart position using the OTP MCP, including the agent seats at Sneeze It.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the agent seats on the sneeze-it chart and what each one produces."*

You will see the live seat list with roles, output definitions, and chart positions. That structure is the unit economics framework made visible.
