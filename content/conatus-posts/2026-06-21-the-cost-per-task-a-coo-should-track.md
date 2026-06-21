---
title: The cost per task a COO should track
date: 2026-06-21
author: David Steel
slug: the-cost-per-task-a-coo-should-track
type: founder_essay
status: published
series: ai-coo
series_part: 29
description: Most COOs track headcount cost. The number that actually predicts whether your agent investment is working is cost per task, and almost nobody is measuring it.
---

# The cost per task a COO should track

Most COOs track headcount cost. They track fully-loaded salary, benefits, contractor spend, and hours billed. These are the right numbers to track if your operation runs entirely on humans. They are the wrong numbers to track if you have started running any of the work on agents.

The number that tells you whether your agent investment is actually paying off is cost per task. Not cost per hour. Not cost per seat. Cost per task.

I want to explain exactly what I mean by that, and why the switch in unit of measure is the most important thing a COO can do when agents enter the operating model.

## The unit problem

When an operation runs on humans, cost-per-hour is a reasonable proxy for cost-per-task because the relationship between the two is roughly stable. A person who costs you $40/hour and takes 15 minutes to complete a task costs you about $10 per task. If they get faster, the cost drops. If you hire cheaper, the cost drops. The unit holds.

When agents enter the picture, the relationship breaks. An agent does not cost you per hour in any meaningful sense. It costs you per execution, per call, or per token, depending on your architecture. More importantly, the speed at which it works changes the denominator of your math in ways that have no human equivalent.

If Radar, our chief-of-staff agent, scans six Slack channels and writes a compiled briefing in four minutes, the unit is not four minutes of labor. The unit is one briefing. If I tried to put a labor cost on that briefing, I would need to estimate what a human assistant would charge to do the same work, and the comparison would fall apart almost immediately because no human assistant does exactly that work at that cadence with that coverage. The honest unit is: what did this briefing cost me, and what would I have paid for it otherwise?

That is the cost-per-task question. It is the right question. Almost nobody is asking it.

## What cost-per-task reveals that headcount cost hides

When you start tracking cost-per-task across your operation, two things become visible that were invisible before.

The first is where agents are actually cheaper per unit of work delivered, not just cheaper in aggregate. Aggregate savings are easy to claim and hard to verify. Unit economics are harder to fake. When Tally, our KPI-push agent, posts four scorecard updates per weekday without human intervention, the cost of each update is a fraction of what it would cost a human to pull the same data and push it to the same place. The task is the unit. The comparison is honest.

The second is where you are spending agent compute on tasks that are not worth the compute. This is the one that surprises people. Agents are not free. They have infrastructure costs, API costs, and the engineering time required to build and maintain the workflows. If you are running an agent on a task that is cheaper for a human to do, you are not saving money. You are spending more to feel modern. Cost-per-task is what surfaces that.

Accenture has a line I keep coming back to: do not make inefficiency run efficiently. The warning there is about automating a broken process. But there is a second version of the same mistake, and it is just as common: deploying an agent on a task that was already efficient enough, and paying more per unit of work because you wanted the task on an agent. Cost-per-task is the diagnostic that catches this before it compounds.

## How we run the comparison at Sneeze It

We have around ten active agents running operational work. Radar handles daily briefings and calendar intelligence. Dash handles all advertising and call center performance data. Dirk handles sales pipeline and reactivation outreach. Nick handles cold prospecting. Pepper handles email triage. Pulse handles client retention signals. Crystal handles project visibility in Accelo. Arin manages call center coaching. Bogdan is our human COO. Janine runs accounting. They are all on the same chart.

For each agent seat, I track three things: what the seat produces, what the seat costs to run (infrastructure, API calls, maintenance time), and what the seat would cost if I were paying a human to do the equivalent work.

The third number is the hardest to get right. There usually is not a clean human equivalent, because the agents are doing work at a scope or cadence that no human would do. Dash runs a daily scan across 39 advertising accounts and produces a structured performance brief. No human analyst works that scope at that cadence. So the comparison is not "what would an analyst cost" but "how much of an analyst's time would we spend getting partial coverage of a subset of those accounts, and what decisions would we make worse because we had partial data."

That reframe matters. Cost-per-task for an agent is not just the dollars on the invoice. It is the dollars on the invoice relative to the decision quality you get in return.

## The counter-position most COOs are running

The dominant posture I see from COOs right now is to measure agent ROI in headcount avoided. How many people did we not hire because the agent is doing that work? This is a reasonable starting question. It is not a useful ongoing metric.

The problem is that headcount-avoided is a comparison to a counterfactual. You are asking "what would we have spent if we had built the operation differently?" and then claiming the difference as savings. But you cannot verify the counterfactual. You do not know how many people you would have hired. You do not know what they would have cost. You are comparing your real costs to an imaginary alternative.

Cost-per-task is not a comparison to a counterfactual. It is a comparison between actual tasks and actual costs. You know what Arin's coaching analysis costs to run. You know how many coaching interactions it produces per week. You can divide. You get a number. That number is either improving, holding, or getting worse. The trend tells you something real about whether the seat is getting more efficient as the SOP matures and the agent improves.

This is also why the Deloitte finding on AI governance matters here. Their 2026 survey of 3,235 enterprises found that only 21% have a mature governance model for agentic AI. One of the things that separates mature governance from immature governance is exactly this: mature organizations track operational metrics on their agents the way they track operational metrics on any part of the business. The 79% who are not there yet are largely running agents without knowing what the work costs per unit of output. They feel like they are saving money. They have no way to verify it.

## The process question that comes before the metric

I want to say one thing clearly before anyone starts calculating cost-per-task on their current setup.

If the task you are measuring is a task inside a broken process, cost-per-task will tell you exactly how efficiently you are doing the wrong thing. The number will be real. The insight will be misleading.

Before cost-per-task is a useful metric, the process has to be right. This is the design work that happens before deployment. You redesign the workflow, remove the steps that do not add value, clarify where human judgment is genuinely required versus where execution can be handed to an agent, and then you wire the agent to the redesigned process. After that, cost-per-task tells you whether the redesigned process is delivering value.

When Jeff, our former data integrity agent, was running, his cost-per-task numbers looked reasonable. But the tasks themselves were not well-defined enough to know whether the outputs were connected to decisions that mattered. We retired Jeff after an honest assessment that the seat's work had been absorbed into other seats that were already doing it better. The cost-per-task metric would not have caught that on its own. The seat design question had to come first.

## What the metric looks like in practice

For any agent seat, the monthly metric I want is three numbers: tasks completed, total cost to run the seat, and cost per task. Alongside that, I want a qualitative marker: is the output of this seat feeding a decision that matters, and is the quality of that output good enough to trust?

When cost-per-task is falling, the seat is getting more efficient as the SOP matures. When it is rising, something is wrong: the inputs are getting messier, the task scope is drifting, or the infrastructure costs are growing faster than the value.

When Pepper processes email triage, the cost per triage interaction is a real number. When Dirk runs a reactivation sequence, the cost per qualified conversation is a real number. When Nick completes a cold prospecting batch, the cost per validated draft is a real number. These numbers let me compare seats against each other, track trend over time, and make honest decisions about where to invest more and where to cut.

This is what it means for a COO to own the agent operating model. Not to deploy agents. To measure them the way you measure everything else that costs money and produces output.

## See the live chart

The Sneeze It org chart, including every active agent seat and its accountability structure, is queryable from OTP MCP.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the seats on the Sneeze It chart and what each seat is accountable for producing."*

The seat structure is the starting point for cost-per-task tracking; once you know what each seat produces, you can put the unit economics on it.

---

*Series: The AI-Era COO. Part 29 of an in-progress series.*
