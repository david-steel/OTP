---
title: When execution is near-free, the constraint moves entirely to strategy
date: 2026-06-20
author: David Steel
slug: setting-strategy-when-execution-is-near-free
type: founder_essay
status: published
series: ai-ceo
series_part: 4
description: AI agents make execution cheap. That shifts the CEO's whole job. Here is how strategy changes when cost-per-decision drops toward zero.
---

# When execution is near-free, the constraint moves entirely to strategy

The honest answer to "how does a CEO set strategy when execution is near-free" is that most CEOs do not change how they set strategy at all. They get agents. Execution speeds up. The inbox shrinks. Then they fill the freed time with more operational work, because operational work is familiar and familiar feels productive.

That is the wrong move. And I say this having made it.

The premise of the question is worth sitting with for a minute. Execution used to be expensive in three ways: dollars, hours, and coordination. You had to hire people to do the work. Those people consumed management hours. Getting them to move together required meetings and follow-up and friction. All of that cost placed a natural governor on how many ideas a CEO could pursue at once.

When agents eat the execution cost, the governor comes off. That is not automatically good. A CEO with unlimited execution capacity and no improved decision-making just moves faster in whatever direction they were already pointed, including the wrong one.

So the central question shifts. It used to be "can we afford to try this?" Now it is "should we try this at all?"

That is a strategy question, not an execution question. And it requires a different set of decision habits.

## The decision tree I actually run

When I catch myself about to spin up a new initiative, I run through a short decision tree before I touch the org chart or assign any agent to it. It has four gates, in this order. If something fails a gate, it stops there.

**Gate one: is this the right problem?**

The cheapest agent-powered initiative is still a waste of time if it solves the wrong problem. Before anything else, I check whether the problem is connected to a constraint that is actually limiting the business.

At Sneeze It, our constraint for the first several months of running agents was not execution speed. Our constraint was sales clarity. We did not have a clean definition of which clients we wanted to take on and which we did not. Dirk, our sales agent, is excellent at moving pipeline. But Dirk moving pipeline faster on the wrong ICP just accelerated mistakes. I had to solve the definition problem before Dirk's execution speed became an asset instead of an accelerant for the wrong thing.

The question I ask: if this initiative succeeds, does it move the number that is currently holding everything else back? If the answer is no, or "I'm not sure," stop here.

**Gate two: does this initiative produce a learnable signal?**

A lot of ideas that pass gate one fail here. They are directionally correct but unfalsifiable. They cannot tell you, within a reasonable timeframe, whether they are working.

Agents can test quickly. Nick, our cold prospecting agent, sends 30 emails a day and produces a legible signal within two weeks: reply rate, meeting book rate, what the conversations are about when they do book. That signal feeds the next strategic decision about the offer, the audience, the positioning.

Compare that to an initiative like "we should build brand." Brand matters. But "we should build brand" does not produce a signal within two weeks. Running it through gate two does not kill it. It forces you to ask: what is the measurable intermediate outcome I will check in week two? If you cannot answer that, the initiative is not ready to assign.

**Gate three: does the right seat exist to own this?**

Near-free execution still requires direction. Agents do not self-assign. Humans do not self-coordinate. Every initiative needs a seat that is accountable for the outcome and a seat that is accountable for making the decision when something unexpected happens.

When I look at the Sneeze It chart, I can see this in real time. Tally pushes KPI values to the scorecard four times a day. Dash scans thirty-nine ad accounts and writes the analysis to a shared state file every morning. Neither of them decides what to do with what they find. That decision belongs to a human seat. If I want an initiative to move, there has to be a seat on the chart that has both the access to direct it and the authority to act on the result.

If the initiative requires a seat that does not exist, I either create the seat first or park the initiative. Agents without clear seat ownership drift. It is the same reason a project with no PM drifts. Execution being cheap does not change that.

**Gate four: what does this trade against?**

This is the gate most CEOs skip, and it is the most important one.

Near-free execution creates an illusion that you can pursue everything in parallel without tradeoff. You cannot. Even when agents do the work, they require attention at decision points. The CEO's attention is still the scarce resource. It has not been automated.

Every initiative I approve takes some fraction of my weekly attention to review signal, make calls when the agent hits an edge case, and update the direction if the strategy needs to change. That fraction is small compared to the old world. It is not zero.

So the question is: what am I giving up by adding this? What already-running initiative gets less attention? What decision that currently gets made in two days now gets made in four, because I added something to my review queue?

If I cannot name what this trade costs, I do not approve it. The discipline of naming the trade is how you avoid a portfolio of half-driven initiatives, which is the failure mode that becomes possible once execution gets cheap.

## What changes in the weekly cadence

Running this decision tree has changed my Monday meeting more than any specific agent deployment has.

Before agents, Monday was operational. We talked about what was happening, who was blocked, what needed to move. The conversation was thick with execution status.

Now Radar compiles execution status before the meeting. Arin posts call center numbers. Dash surfaces ad performance anomalies. Crystal tracks delivery risks. By the time I sit down Monday morning, the operational layer has already been processed. The questions that remain are not "what is happening" but "given what is happening, what should we do next?"

That is a strategy conversation. It is also a harder conversation. Execution status has a right answer. Strategic direction requires judgment, and judgment is not cheap just because the agents make implementation cheap.

The paradox of near-free execution is that it demands better strategy, not less strategy. The margin for strategic error shrinks because you can now move so fast. A bad strategic call used to take months to fully manifest because execution was slow enough to give you time to catch it. Now a bad call can play out in two weeks, because the agents move quickly. The same speed that makes execution cheap makes mistakes faster.

So the CEO's job does not get easier. The job changes. Less time watching execution, more time earning the right to direct it. The four gates are the mechanism I use to earn that right before I aim the machine.

## See the live chart

You can query every active seat on the Sneeze It org chart, including which seats own which initiatives and what signal each is producing, using the OTP MCP.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the seat accountability structure at sneeze-it and which seats are responsible for execution vs. strategic decision-making."*

The response maps the chart the way the four-gate decision tree does, and it shows you where human judgment sits relative to agent execution.
