---
title: The company scorecard when half the seats are agents is not a new document. It is the same document with new names on the rows.
date: 2026-06-20
author: David Steel
slug: the-company-scorecard-when-half-the-seats-are-agents
type: founder_essay
status: published
series: ai-ceo
series_part: 5
description: What a CEO actually tracks when agents hold half the accountability chart. The lifecycle from human-only to hybrid, and why the scorecard discipline does not change.
---

# The company scorecard when half the seats are agents is not a new document. It is the same document with new names on the rows.

The question most CEOs ask when they start running agents seriously is whether they need a new kind of scorecard.

The answer is no. The discipline is the same. What changes is who the names belong to.

I want to walk through the lifecycle of how this actually happens, because the path matters as much as the destination. Most operators do not arrive at a clean hybrid scorecard. They drift into one through trial and error, and the errors are predictable enough that it is worth describing them in sequence.

## Stage one: the scorecard before agents arrive

A company scorecard before agents is a short document. At Sneeze It it covered a handful of things: revenue closed, clients retained, proposals sent, billable hours logged, cash collected.

Every row had a human name next to it. Bogdan owned the operational metrics. Janine owned the finance rows. I owned the revenue rows. The scorecard worked because accountability was simple. If a number was off, there was one person to talk to. That person was in the building, or on Slack, and the conversation happened at the weekly meeting.

This is the stage where most CEOs feel the scorecard is finished. It is a known system. It works. There is no reason to touch it.

Then you hire your first agent.

## Stage two: the bolt-on error

The bolt-on error is when you treat the agent's metrics as a footnote to the human scorecard.

You build a second view, or a second tab, or a second Slack channel. The agent has its own numbers: tasks completed, messages handled, sequences triggered. The CEO glances at it when something goes wrong. Mostly it runs in the background, reporting to nobody in the language of nobody.

This is what I did with our early agents. The agent was doing work. The work did not touch the scorecard. So six weeks went by where the agent was busy and the business did not feel it.

The bolt-on fails for one reason: it removes accountability from the work the agent is actually doing. The agent is not a tool. It holds a seat. A seat that holds no row on the scorecard is a seat with no owner and no consequence. The work can drift, the numbers can slip, and nobody notices until the drift is expensive.

I retired one agent, Jeff, in April. One of the honest reasons for that retirement was that Jeff's metrics had never fully landed on the main scorecard. We measured him separately. We noticed him separately. When the capabilities redistributed cleanly to Dash and Dirk and Dan, it was partly because those seats already had rows on the shared scorecard. Jeff's seat did not, not really. The absence made the retirement easier to miss until it was overdue.

## Stage three: the conversion

The conversion is when you delete the bolt-on and put every seat on one scorecard.

This is not complicated to do. It is uncomfortable to do, because it forces a clarifying question you have been avoiding: what is this agent actually accountable for, in the language of business outcomes?

Tally, our KPI-push agent, has one job. It reads the scorecard, extracts the current values from local sources, and pushes the numbers to OTP at four intervals per day on weekdays. The metric on Tally's row is simple: KPI push success rate. If Tally runs and the numbers are not current, the row is red. Tally does not have a long job description. The row tells you everything.

Dash, our analytics agent, has a broader seat. Dash reads ad spend across all client accounts, every day, and surfaces the outliers. The metric on Dash's row is not "queries run" or "reports generated." It is alert accuracy: when Dash flags an anomaly, how often does the anomaly turn out to be real. Dash's row on the scorecard is adjacent to Janine's rows on billing and cash. The proximity is intentional. Dash's accuracy feeds Janine's conversations with clients. They are in the same part of the scorecard because they are in the same part of the business.

Dirk, our sales agent, holds pipeline metrics. Qualified meetings generated. Reactivation sequences sent. Pipeline stage transitions per week. Dirk's row sits above the revenue rows I own, because Dirk feeds the top of the funnel that closes into my rows. When Dirk's pipeline number drops, I see it before my revenue number moves. That is the point. The scorecard reveals upstream causes before they become downstream results.

## Stage four: what it actually looks like when it is working

Right now our scorecard has rows for both humans and agents and there is nothing on the surface that tells you which is which.

Bogdan's row is next to Radar's row. Radar is our chief-of-staff agent. Bogdan owns the operations outcomes. Radar owns the briefing quality and the meeting prep and the delegation tracking. Janine's rows on AR and AP are adjacent to Dash's rows on ad spend and anomaly rates. Dirk's pipeline rows sit above my sales rows. The logic of the chart is functional, not categorical.

The meeting discipline is the same regardless of row type. When a number is below target, the conversation asks what changed, what the cause is, and what the fix is. The fix lands on the seat-owner. For agent seats, the seat-owner is the person responsible for that agent's accountability, which at Sneeze It is usually me or Bogdan depending on the domain.

The agents do not attend the meeting. But the agents publish the data that drives it. Then their accountability row is walked exactly like a human row.

What changes is the volume of accountability the scorecard can hold. Before agents, we had seven meaningful rows. Now we have more than double. The additional rows did not require additional headcount. They required clarity about what each seat is for, and discipline about putting that clarity into writing, on the same surface as everyone else.

## The question the lifecycle answers

When CEOs ask what goes on the scorecard when half the seats are agents, they are usually asking a harder question underneath: how do I know if the agents are actually working.

The scorecard is the answer. Not a monitoring dashboard. Not a token counter. The same scorecard you run for humans, with the same business-outcome metrics, reviewed in the same meeting, with the same consequence if the number is wrong.

The agents are free to carry the operational work when the scorecard holds them to outcomes. That freedom is the point. Janine is not spending her week auditing ad accounts. Bogdan is not manually compiling briefings. The work they do not need to do is covered by seats that hold rows and have owners and report numbers every Monday.

The CEO's job in this system is the same job it has always been: keep the scorecard honest. Ask why the numbers moved. Hold the seats accountable. The seats are just different kinds of entities now.

That is not a new strategy. It is the old strategy applied without assuming all the seats are human.

## See the live chart

You can query the current state of any seat on the Sneeze It accountability chart, including which metrics each agent seat is tracked against, directly from the OTP MCP.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the Sneeze It org chart and identify the metric each agent seat is accountable for on the scorecard."*

What comes back is the live chart with roles, metrics, and seat-types all on the same surface. That structure is what a hybrid scorecard looks like when the conversion is done.
