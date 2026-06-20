---
title: Token spend is not a line item you forecast. It is a signal you track.
date: 2026-06-20
author: David Steel
slug: how-to-budget-for-variable-token-spend
type: founder_essay
status: published
series: ai-cfo
series_part: 10
description: Variable token spend stops being a budgeting problem the moment you treat it as operational signal instead of a cost to predict. Here is how.
---

# Token spend is not a line item you forecast. It is a signal you track.

Every operator who has run AI agents for more than three months has had this conversation. The finance person asks how much the agents will cost next month. The operator says they are not sure because it depends on how busy the agents are. The finance person asks what "busy" means in dollars. The operator has no clean answer.

So the operator does what every finance system trains you to do. They annualize the last three months of token spend, add a buffer, and call it a forecast.

That is the wrong frame. It produces a number that is too static to be useful and too imprecise to be honest. And it trains the team to treat agent spend as a fixed overhead instead of what it actually is: a readout of how hard your operation is working.

Here is the frame I actually use.

## The two categories that token spend falls into

Token spend at Sneeze It splits into two buckets, and treating them the same is where most finance errors come from.

The first bucket is floor spend. This is the baseline consumption that happens regardless of business volume. Radar runs a morning briefing every day. Tally pushes KPI scores to the scorecard on a four-times-daily schedule. Pepper scans the inbox when triggered. None of that scales with client count or deal volume. It runs whether we are at ten clients or fifty. This is the spend I budget as a fixed line.

The second bucket is volume-indexed spend. Dash runs deeper analyses when more ad accounts are active and more spend is moving. Dirk generates more outreach sequences when the pipeline is thin and pulls back when it is full. Nick drafts more cold emails during active prospecting waves and goes quiet between them. This spend scales directly with the business activity it is serving. Budgeting it as a fixed line is the same mistake as treating sales commissions as fixed overhead.

When you split the two buckets, the budgeting question simplifies. The floor is forecastable. The variable is trackable. You need a number for the first and a range plus a trigger for the second.

## Why "add a buffer" fails

The standard advice is to take your trailing average and add twenty percent. The problem is not with the buffer. The problem is with treating the average as the signal.

If Dash is spending more tokens than usual in a given week, there are three possible explanations. First, a client account had a performance anomaly that required a deeper diagnostic. Second, we added a new client account to the portfolio and the onboarding scan ran. Third, something in Dash's instruction set triggered unnecessary re-analysis and the extra tokens were waste.

Three very different situations. One number.

A forecasted average with a buffer cannot tell you which explanation is true. It just tells you whether you went over or under budget. When you go over, you do not know if you went over because the business grew (good), because you had an operational spike (expected), or because an agent drifted and burned tokens on work nobody asked for (a problem worth fixing).

When your only tool is a budget line, every overage looks the same. That is why the buffer fails. It is a response to not knowing, and it does not help you know more.

## What I track instead

Janine handles our books. She does not own agent token spend. I do. But I report it to her in a form she can actually work with, which means I treat it like a cost-of-goods line that scales with revenue activity, not like a fixed software license.

The number I hand Janine is a floor (what the agents cost at idle) and a rate (what each unit of additional business activity adds to token spend). Right now the floor is low enough that it is not interesting. The rate is what I watch.

Tally pushes a KPI to the scorecard that tracks token spend by agent per week. When Dirk's number moves, I can see whether it moved because we launched a reactivation wave or because something in the sequence logic looped. When Dash's number moves, I can see whether we added accounts or whether a diagnostic ran on a Saturday when nobody asked it to.

The spend number without that context is noise. The spend number with agent-level attribution is a management signal.

## The budget structure that actually holds

Here is the structure I recommend for anyone running more than three or four agents.

Set a floor budget for agents whose consumption is disconnected from business volume. This is your fixed infrastructure cost. It changes when you add or retire agents, not when revenue moves.

Set a variable budget for agents whose consumption tracks business activity. Express this as a range, not a number. The low end of the range is what those agents cost during a slow week. The high end is what they cost during a full-throttle week. Your actual spend should move inside that range predictably. If it moves outside the range, that is a signal worth investigating, not a rounding error to buffer against.

Hold a small overage reserve, maybe ten percent of the total. Use it only when a genuine operational spike occurs, something like onboarding a new large client account or running an unplanned diagnostic after a platform incident. When you pull from the reserve, document why. If you are pulling from it regularly, that is a sign your variable range is wrong and needs to be re-calibrated.

Review the attribution quarterly, not monthly. Monthly is too reactive. You will mistake normal variability for a trend and make changes that are not warranted. Quarterly gives you enough signal to see actual drift from expected behavior.

## The thing the budget cannot tell you

The most useful thing I have learned about token spend is what it reveals when it goes down unexpectedly.

When an agent's spend drops while business activity holds steady, one of three things is happening. The agent is doing less work because it was given a tighter instruction set and is producing faster. Or the agent is doing less work because a trigger stopped firing and it went quiet. Or the agent is doing less work because the seat it was filling stopped being needed.

All three of these are worth knowing. None of them show up as a budget alert. They only show up when you are watching the number with context instead of watching it against a forecast.

Dirk's spend dropped three weeks after we refined the reactivation sequence. The sequence got tighter, the prompts got shorter, the output quality went up, and the token cost went down. That is the best possible version of a spend decrease. I would have missed it entirely if I had been managing to a budget line instead of watching the attribution.

This is the work that agent financial management requires. Not forecasting. Not buffering. Watching the signal.

## See the live chart

The OTP MCP can query current seat assignments, KPI tracking rows, and agent ownership directly from the live org chart, so you can see exactly which seats own which spend categories.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the KPI rows for agent seats on the sneeze-it chart and identify which ones track variable spend."*

You will see how floor spend and volume-indexed spend map to actual seats on the chart, which is the structure that makes the signal readable instead of noisy.
