---
title: The metrics on your finance scorecard are wrong if agents are doing any of the work
date: 2026-06-20
author: David Steel
slug: metrics-for-an-ai-era-finance-scorecard
type: founder_essay
status: published
series: ai-cfo
series_part: 15
description: Which metrics belong on a finance scorecard when agents handle the operational work. A decision-tree for sorting lagging from leading and human from agent.
---

# The metrics on your finance scorecard are wrong if agents are doing any of the work

Most finance scorecards were built to measure people doing things manually.

That is not an insult. It is just the historical context. Days payable outstanding. Days receivable outstanding. Cash collected this week. These are good numbers. They still belong on the scorecard. But if you have agents doing any of the operational finance work, and the scorecard looks identical to what it looked like two years ago, you have a measurement gap.

The gap is not about the numbers being bad. The gap is that the numbers are only measuring outputs, and in an AI-era finance operation you need to also measure the pipeline that produces those outputs. That pipeline now includes seats filled by agents, not just humans.

The fix is a decision tree. Walk each number on your scorecard through four questions, and you will know exactly which metrics to keep, which to add, and which to retire.

## First branch: is this metric measuring an outcome or an activity?

The scorecard should lead with outcomes. Outcomes are the things the business cares about regardless of who or what produced them. Cash collected is an outcome. Days receivable outstanding is an outcome. Whether Janine ran the AR report or an agent generated it, the business needs the receivable cleared.

Activities are useful for diagnostics, not for the weekly scorecard. If the activity number drops, you want to know. But you want to know because it explains an outcome number, not because the activity is the thing you are managing to.

When I look at Janine's rows on our scorecard, they are outcome rows. How many days outstanding on receivables. How much cash collected against the target. What the overdue balance is. These do not change just because we have agents in the operation. They stay, because they are measuring whether the business is financially healthy, not how we got there.

If your scorecard is full of activity rows for things agents now do automatically, those rows need to move to a monitoring layer, not the scorecard. The scorecard is for the numbers the business is accountable to. The monitoring layer is for the numbers that explain why those accountability numbers moved.

## Second branch: which seat owns this number?

Once you know the metric is an outcome, the next question is who is accountable for it.

In a pure-human operation, this question has an obvious answer. Janine owns the receivables. Bogdan owns cash flow against the operating plan. The scorecard reflects that.

In a hybrid operation, the answer gets more precise. The outcome is still owned by a human. But the operational pipeline that produces the outcome now runs through agent seats, and those seats need their own rows that explain the human's outcome row.

Tally, our scorecard agent, pushes KPI values from our live data sources to the chart four times a day on weekdays. Tally does not own the outcome. Bogdan does. But if Tally's push fails, Bogdan's row goes stale, and we lose the ability to have an honest Monday conversation about the number. So Tally has a row on the operational monitoring layer: last successful push, error rate, data freshness timestamp. When that row is red, someone investigates before the Monday meeting, not during it.

The question "which seat owns this number" also surfaces a problem common in early AI-era finance operations. Ownership gets fuzzy when agents are involved. Nobody said explicitly whether the agent or the human is accountable for the number moving. The decision tree forces the answer. If the human is accountable, the human's row is on the scorecard and the agent's row is a supporting input. If no human is accountable for the number, that is the real problem.

## Third branch: is this a lagging number or a leading number?

The finance scorecard has always had both, but most scorecards are weighted heavily toward lagging. Cash collected this week is what happened. Days receivable outstanding is how long you have been waiting for something to happen.

In an AI-era operation, the mix shifts. You can afford more leading numbers because agents can generate them cheaply. The data pipeline is faster. You do not need to wait until the end of the quarter to see a leading signal.

Dirk, our sales agent, has rows on the scorecard that are finance-relevant even though Dirk is not a finance seat. Pipeline value moving through stages is a leading number for revenue. Proposals sent minus proposals stagnant for 14-plus days is a leading number for the revenue line Janine will eventually collect against. These numbers belong on the finance scorecard, not just the sales scorecard, because they are the earliest signal of whether the cash that Janine is going to collect in 45 days is on track or not.

The leading-versus-lagging question does not replace the outcome question. You still need to measure the outcome. You add the leading number because it gives you time to act before the outcome is already history.

A finance scorecard that has only lagging numbers is a rearview mirror. A finance scorecard that has only leading numbers is optimism with spreadsheets. The decision tree here is: for every lagging outcome you keep, add at least one leading number that gives you a 30-to-60-day view of that outcome.

## Fourth branch: can this number self-report, or does it require a human to assemble it?

This is the branch that most directly changes with AI agents in the operation.

In a manual finance operation, most numbers require a human to assemble them. Someone pulls the AR aging report. Someone reconciles the pipeline value in the CRM against the invoices sent in the accounting system. Someone computes the collection rate by hand. This is real work. It is also work that consumes time that could go somewhere else.

When agents handle the assembly, the metric can self-report. Dash, our analytics agent, does not require a human to compute the spend numbers for every client account. Tally does not require Janine to manually enter KPI values on the chart. The numbers arrive on the scorecard because the agents write them there.

This changes what belongs on the scorecard. You can afford more numbers, because the cost of generating them has dropped. But more numbers is not better numbers. The decision tree question is not "can the agent generate this?" The question is "does this number change how we would run the week if it moved?"

If the answer is yes, the number belongs on the scorecard. If the answer is "we would look into it but probably not do anything differently," it belongs on the monitoring layer. The metric produces accountability, not curiosity.

## What the scorecard looks like after the decision tree

When you run every number through these four branches, the scorecard that comes out does not look radically different from a good pre-AI finance scorecard. The outcome rows stay. The ownership is cleaner because the agent seats are named. The leading-to-lagging ratio shifts, often from roughly 20/80 to something closer to 40/60. The self-reporting numbers replace the manually-assembled ones.

What you gain is not more numbers. You gain earlier signals, cleaner accountability, and a scorecard that reflects the actual operation rather than the operation as it existed before agents were in it.

The mission underneath this is simple. Agents carry the assembly work so that Janine and Bogdan and the rest of the finance operation are free to focus on the decisions the numbers are pointing to. The scorecard makes that visible every Monday. It is not a dashboard for the sake of a dashboard. It is the accountability surface that makes the hybrid operation work like an operation.

## See the live chart

You can query which seats on the Sneeze It chart have active KPI rows and which metrics they track, including which are agent-owned versus human-owned.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me all KPIs on the sneeze-it chart and which seats own them."*

You will see which rows are human seats, which are agent seats, and how the scorecard is structured across both. That structure is the decision tree in practice, not in theory.

---

*Series: AI CFO. Post 15 of an in-progress series.*
