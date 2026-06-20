---
title: Runaway agent bills are not a model problem. They are an authorization structure problem.
date: 2026-06-20
author: David Steel
slug: how-to-stop-an-agent-from-running-up-a-runaway-bill
type: founder_essay
status: published
series: ai-cfo
series_part: 11
description: Agent bills run away when there is no ceiling on what the agent can spend. The fix is the same structure you already use for humans: defined limits and a chain of approval.
---

# Runaway agent bills are not a model problem. They are an authorization structure problem.

Here is the thing nobody tells you when you start running AI agents at any real volume: the ones that run up bills are not the ones that malfunction. They are the ones that work exactly as designed, inside a structure that forgot to define what "too much" looks like.

I have had this happen. Early on, before we built the spend discipline that governs the fleet now, I watched an agent rack up a meaningful API bill in a single afternoon because I gave it a task with a wide scope and no ceiling. The agent was not broken. It was not hallucinating. It was doing exactly what I asked. I had just forgotten to tell it when to stop.

That afternoon taught me something that has held true across every agent we have hired since: **the cause of a runaway bill is always structural, not behavioral.** The model is fine. The prompting is fine. What is missing is an authorization layer, and the fix is building one before the agent touches anything that costs money.

## What authorization looks like for a human

When Janine, our accounting lead, processes a vendor payment, there is a chain of approval she works inside. Invoices above a certain amount go to me before she pays them. Recurring charges she flags if they drift more than a threshold from the expected amount. She does not have a blank check. She has a defined lane, a ceiling, and a chain of approval for anything that approaches the edge.

This is not because Janine is untrustworthy. It is because good financial control does not depend on trust. It depends on structure. The structure protects Janine as much as it protects the business. If a fraudulent invoice slips through, the structure surfaces it before the money moves.

AI agents need the same thing. Not because they are untrustworthy. Because the structure is what protects you, and the agent, and the relationship between them.

## The four missing pieces when bills run away

Every runaway agent bill I have seen or heard about shares the same anatomy. It is missing at least one of four things, and usually more than one.

The first missing piece is a spend ceiling. The agent has no defined limit on how many API calls, tokens, or task-loops it is allowed to execute before it stops and reports. Without a ceiling, "complete the task" becomes a license to spend indefinitely. The agent optimizes for task completion because that is what you told it to do. It has no signal for when the cost of continuing outweighs the value.

The second missing piece is a cost-per-run baseline. You cannot flag an anomaly if you do not know what normal looks like. Dirk, our revenue agent, runs a prospecting scan every weekday. We know what that scan should cost in tokens and API calls within a reasonable range. When the number deviates, Tally, our scorecard agent, surfaces it. But Tally can only surface it because someone wrote down what normal looks like and gave Tally a target to compare against. If you have never done that for your agent, you have no anomaly detection, and the first signal you get of a problem is the bill at the end of the month.

The third missing piece is scope boundary. Runaway bills often come from an agent that was given a task with an implicit assumption of bounded scope, where the scope was actually unbounded. "Research all our past clients" sounds specific. But if you have a few thousand records and the agent is making three API calls per record, that is a lot of calls. The scope needs to be stated explicitly, with hard limits on records, iterations, or time. Not implicit assumptions.

The fourth missing piece is a reporting cadence that happens before the billing period closes. Janine reviews payables regularly, not monthly. If you are reviewing agent costs only when the cloud bill arrives, you are always at least thirty days behind the problem. The check needs to happen inside the billing window, not after it.

## How the structure works in practice

The way we built this at Sneeze It was not elegant from the start. It got built piecemeal, mistake by mistake.

What we run now is close to this: every agent that touches an external API with a cost has a declared token budget per run. The budget is written into the agent's operating parameters, not assumed. When a run approaches the ceiling, the agent stops and flags, rather than continuing. Dash, our data analytics agent, runs daily scans across Meta and Google ad accounts. The scan is bounded. Dash pulls the accounts, pulls the data, and stops. It does not iteratively expand what it is pulling because it feels like the next account might be useful. The boundary is defined, and the agent respects it.

Tally, our scorecard agent, pushes KPI values to the OTP chart four times a day on weekdays. One of those KPIs is agent infrastructure cost, flagged if it crosses a threshold. Tally does not make that decision. Tally reads the number, compares it to the target, and reports. The human who reads the report makes the decision. That division of responsibility, agent reports, human decides, is the whole authorization model in four words.

When something unusual happens, say an agent loop that should have run ten iterations runs forty, Tally catches the deviation at the next KPI push. I get a notification before the bill lands. That is not sophisticated engineering. That is just writing down what normal looks like and checking against it on a regular cadence.

## The temptation to fix this with model settings

When people ask about runaway bills, the first instinct is usually to adjust something at the model level. Cap the context window. Lower the temperature. Set a max-tokens parameter. These are valid things to understand, but they are the wrong layer to fix the problem at.

Model settings control how the model generates a response to a single prompt. They do not control how many times an agent calls the model, how much external data the agent pulls before generating a prompt, or how many tasks an agent queues from a single trigger. The cost of running an agent at scale is almost never dominated by single-prompt token counts. It is dominated by the volume and frequency of calls, by the scope of data being fed in, and by loops that run longer than intended.

You fix those at the authorization layer, not the model layer. The model layer is fine.

## Where the authorization structure lives

The authorization structure needs to live somewhere that a human reviews it, not just somewhere that the agent reads it. An agent that is instructed to limit itself can also be the agent that decides what "limit" means, and that is a circular structure. The limit needs to be defined outside the agent and enforced by something the agent cannot override.

At a minimum this means: the budget is written down somewhere visible, the actual spend is measured and compared to it on a cadence shorter than your billing period, and a human sees the comparison before the bill arrives. That is the whole structure. It does not require elaborate tooling. It requires someone to decide what the ceiling is and then actually look at the number.

This is exactly the structure that governs how Janine handles vendor payments. It is the structure that governs how Dirk is authorized to make GHL writes but not deletes. It is the structure that governs Dash's scope boundaries. The agents carry the operational work. The structure makes it safe for them to do that.

If you let agents carry real operational weight without an authorization structure, you are not running agents at scale. You are running a bill-accumulation experiment with a delayed result date.

## The fix is the same as it has always been

The answer to "how do I stop an agent from running up a runaway bill" is the same answer you would give to a new hire on their first week: here is your budget, here is your scope, here is who you report to when you are approaching a limit, and here is the cadence we review the numbers. Nothing more exotic than that.

Build the structure first. Then deploy the agent.

## See the live chart

You can query the current spend boundaries and KPI targets for any seat on the Sneeze It chart, including the agents that touch external APIs.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the KPI targets for the agent seats on the Sneeze It chart and identify which ones have spend-related metrics."*

You will see exactly which agent seats have defined cost accountability and what the target range looks like. That is the authorization structure, made queryable.

---

*Series: AI CFO. Post 11 of an in-progress series.*
