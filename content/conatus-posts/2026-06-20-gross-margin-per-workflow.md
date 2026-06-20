---
title: Gross margin per workflow is the number your agent army is actually producing, and most operators are not tracking it
date: 2026-06-20
author: David Steel
slug: gross-margin-per-workflow
type: founder_essay
status: published
series: ai-cfo
series_part: 12
description: What gross margin per workflow means, how to calculate it at the seat level, and a worked example from the Sneeze It agent chart.
---

# Gross margin per workflow is the number your agent army is actually producing, and most operators are not tracking it

Here is what most operators track when they start running AI agents: tasks completed, tokens consumed, messages processed per day. Runtime numbers. Infrastructure numbers. Numbers that answer the question "is the thing running" rather than "is the thing profitable."

The number that actually matters is gross margin per workflow.

This is the central claim of this post, and I want to defend it with a worked example before making any broader point.

## What a workflow is

A workflow, for this purpose, is any discrete repeatable sequence of work that produces a billable or revenue-connected output. It is not a one-off task. It is not a feature. It is the sequence you run over and over that produces the thing your clients pay for.

At Sneeze It, a workflow might be: one cold prospecting batch (30 qualified emails drafted and staged). Or one client ad performance report compiled, distributed, and actioned. Or one inbox triage cycle that surfaces client urgencies, stages responses, and flags escalations. Each of these is a workflow. Each has inputs, a sequence of agent steps, and a defined output.

Gross margin per workflow answers this question: after accounting for what it costs to run that workflow, how much of the revenue it supports does Sneeze It keep?

That question is different from "did the workflow complete." It is the question that turns an agent from a cost center into a profit center.

## The worked example: Nick's cold prospecting workflow

Nick is our cold prospecting agent. His job is Health and Wellness only, ICP-strict, 30 quality drafted cold emails per batch.

His workflow looks like this. Yelp Fusion API call to discover qualifying businesses. WebSearch to find the business domain. LeadMagic to surface a decision-maker name and email. LeadMagic email validation to clear the bounce gate. Generic-address screen to reject info@ and contact@ addresses. Kennedy-pattern draft written to a named individual. Gmail draft staged for David's review.

That sequence has costs. API call fees across four services. A fraction of my Claude API budget. The agent runtime itself.

Then it has revenue it supports. Every 30-email batch generates a pipeline entry. Over the batches Nick has run since deploying in May 2026, his emails have landed discovery calls. Those calls convert at a rate. Those converted clients pay a retainer. The retainer is monthly recurring.

Gross margin per workflow = (revenue attributable to the workflow output) minus (direct cost of running the workflow) divided by (revenue attributable to the workflow output). You express it as a percentage, the same way you would express gross margin on any product or service line.

Nick's per-batch API cost is under two dollars. If even one cold email per batch converts at some point in a 90-day window to a client paying $3,000 a month, the gross margin on that workflow is not a number you need a spreadsheet to appreciate. The workflow is a high-margin activity. What we track is whether that margin is drifting, and why.

## Why most operators miss this

Most operators track the wrong level of abstraction.

They track the agent as a whole: "Nick ran 40 batches this quarter." That is a volume number. It tells you the agent is working. It does not tell you whether the work is economically productive.

Or they track the company P&L and leave agents invisible inside it: "Sales and marketing spend was X, new clients were Y." The agents are buried in X. You cannot see which workflow is producing margin and which is eroding it.

Gross margin per workflow surfaces the right unit of analysis. It is granular enough to diagnose but not so granular that it becomes engineering telemetry.

## How Tally and Dash make this trackable

Two seats on our chart handle the measurement side of this.

Tally, our scorecard agent, runs four times a day and pushes KPI values from local data sources to the OTP chart. When gross margin per workflow is a registered KPI, Tally is what keeps it current. Tally does not calculate the margin. It reads the source value from the file that tracks it and pushes the number to the scorecard. This is the distinction that matters in a healthy agent system: the calculation happens at write-time in the workflow that owns the data, and the scorecard gets a clean number on schedule.

Dash, our analytics agent, carries the comparison layer. Every client ad workflow Dash runs costs something to produce: API pulls across Meta Ads and Google Ads, data assembly, report generation. What those workflows support is $136,000 in managed ad spend per month across 39 accounts. Dash's job is to report on the numbers, not to recommend changes, but the gross margin calculation on each report workflow is visible in the data she produces. When a client account goes dormant or drops off managed spend, the workflow cost stays roughly flat while the revenue support shrinks. That compression shows up.

Knowing when that compression is happening, by client and by workflow, is what lets me make the right call about whether to renegotiate, restructure, or have the retention conversation before the client leaves.

## The three inputs you need

To calculate gross margin per workflow you need three things.

First, the direct cost of running the workflow. This is your API costs plus agent runtime costs plus any third-party service costs specific to the workflow. For most agent workflows this is genuinely small. Nick's batch costs under two dollars. Dash's daily ad report costs less than a dollar in API calls. The cost is not the challenge.

Second, the revenue the workflow supports. This is the harder calculation and most operators skip it because it feels imprecise. It does not need to be precise to be useful. An approximation is enough. If Nick's prospecting workflow is one of three acquisition channels, assign it a share of new client revenue proportional to where sourced clients are coming from. Track it over time. The trend matters more than the snapshot.

Third, the workflow boundary. You have to know where a workflow starts and where it ends. If you cannot draw that boundary clearly, you cannot calculate its margin. This is actually the most useful forcing function in the exercise. If you cannot define a workflow's boundary, you probably do not have a workflow. You have a loose collection of agent tasks that are not being managed as a unit of production.

## What changes when you track this

When gross margin per workflow is on the scorecard, two conversations start happening that were not happening before.

The first is the profitability conversation. Not "is this agent useful" but "is this workflow earning its keep." That is a business conversation, not a technical one. It belongs in the Monday meeting alongside every other margin number the business is tracking.

The second is the improvement conversation. When you can see that a specific workflow's margin is compressing, you can ask why. Is the cost side rising because API pricing changed? Is the revenue side shrinking because that workflow's output is converting at a lower rate? Each answer leads to a different fix. You cannot have that conversation if margin is buried inside a blended company P&L.

This is the larger point. An agent army that is producing tasks but not being measured at the workflow margin level is an agent army you are managing by faith, not by numbers. That is fine for the first ninety days. It is not fine once the workflows are mature and the costs are real.

Let agents carry the operational work. But make the work trackable at the unit that connects to profit. Gross margin per workflow is that unit.

## See the live chart

You can query the OTP MCP to pull any seat on the Sneeze It chart and see the workflows that seat owns, including the KPIs registered against them.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the seats on the Sneeze It chart that own revenue-connected workflows, and what KPIs they track."*

You will see the registered KPIs by seat. The question worth asking next is which of those KPIs are margin-level and which are volume-level. That gap, for most charts, is where the work is.
