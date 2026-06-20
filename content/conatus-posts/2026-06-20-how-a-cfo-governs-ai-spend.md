---
title: AI spend without a governance model is not a budget problem. It is a visibility problem.
date: 2026-06-20
author: David Steel
slug: how-a-cfo-governs-ai-spend
type: founder_essay
status: published
series: ai-cfo
series_part: 29
description: Most CFOs try to govern AI spend with headcount logic. That fails. Here is the diagnostic and the model that actually works.
---

# AI spend without a governance model is not a budget problem. It is a visibility problem.

Most finance leaders treat AI spend the way they treated software subscriptions in 2015. They watch for the bill at month end, divide it by the seats it covers, decide if the per-seat number looks reasonable, and move on.

That model is wrong for AI. Not slightly wrong. Wrong in a way that creates invisible waste at scale.

The reason is structural. Traditional software charges you for access. AI infrastructure charges you for consumption. The spend is not fixed the moment you sign a contract. It accrues every time an agent runs, every time a token is generated, every time a call hits an API. The billing logic is usage-based. The governance model has to match that.

Most do not.

This post walks through the five failure modes I see when CFOs first try to govern AI spend, and the model we use at Sneeze It to make it work instead.

## Failure mode 1: The consolidated subscription line

The first mistake is treating AI spend as a single line item.

It looks tidy in a spreadsheet. "AI tools: $X per month." But that number hides everything you need to know. Which agents consumed how much. Which workloads are growing fast. Which seats are idle. Which outputs are connected to revenue and which are not.

When you compress it to one line, you lose the resolution to act on it. You can only decide "spend more" or "spend less." You cannot decide "this seat's consumption should double" or "this seat should be audited before the next billing cycle."

At Sneeze It, every seat on the org chart that consumes API budget has its own line on the operational scorecard. Dash, our analytics agent, has a line. Dirk, our sales agent, has a line. They do not share a line. When Dash's consumption goes up, I know why, because I can see Dash's consumption in the same view where I see Dash's output. If consumption is up and output is flat, there is a conversation to have. If consumption is up and output is proportionally better, that is healthy. You cannot have either conversation from a consolidated line.

## Failure mode 2: Monitoring inputs, not outputs

The second failure mode follows from the first. When you measure AI spend by token count or API calls, you are measuring the input side of the transaction. You are not measuring what you got.

A token is not a unit of value. Neither is an API call. Neither is a task completion count, which is slightly better but still not close enough.

The output you want to measure is the business outcome the seat is accountable for. Dirk is accountable for qualified meetings booked and pipeline created. Tally, our KPI-push agent, is accountable for scorecard accuracy and freshness. Dash is accountable for flagging anomalies that Janine, our accounting lead, and I need to act on before the next billing cycle.

When you measure AI spend against those outputs, the governance question becomes precise. You are not asking "did we spend too much on AI this month?" You are asking "did Dirk's API consumption produce proportional pipeline?" That is a question with a real answer. "Did we spend too much on AI" does not have one.

Governance without output measurement is just monitoring. Monitoring is not governance.

## Failure mode 3: No seat-level owner for AI spend

The third failure mode is the absence of accountability at the seat level.

When a human seat runs over budget, there is a conversation with the person who holds the seat. Something changed. Inputs shifted. The SOP broke down. You find the cause and fix it.

When an AI seat runs over budget, most organizations escalate to the engineering team. The engineering team looks at the runtime logs. They tune a parameter. The bill goes down. Nobody asks whether the seat was doing the right work in the first place.

The right model is to treat AI seat spend the same way you treat human seat spend. The seat has an owner. The owner is accountable for outputs and for consumption. When consumption rises faster than outputs, the owner surfaces an explanation, not the infrastructure team.

At Sneeze It, each agent seat is managed by a human who holds accountability for that seat's row on the scorecard. Bogdan, our COO, functions as the accountability anchor for operational agents. Janine reviews billing outputs and flags discrepancies. The AI does not govern itself. A person owns the seat, and the person answers for it.

## Failure mode 4: Treating all AI spend as equivalent

The fourth failure mode is flattening spend into an average.

Not all AI spend is structurally equivalent. Some seats are throughput agents: they process volume, their consumption is predictable, and their value is in saving hours. Some seats are decision-support agents: they run on demand, their consumption is variable, and their value is in improving choices. Some seats are intelligence agents: they run on schedule, consume moderate budget, and their value compounds slowly over time.

Each type has a different governance logic.

For throughput agents, you govern by efficiency: outputs per dollar. For decision-support agents, you govern by decision quality and call frequency. For intelligence agents, you govern by compounding return, which means a shorter measurement window will always look like waste.

Dash runs as a combination of throughput (daily ad scan, numbers pushed every morning) and intelligence (pattern detection over 30-day windows that does not pay off daily but compounds into better decisions). Governing Dash's spend on a weekly efficiency metric would always flag it as expensive. Governing it on the 30-day pattern it was built to detect makes the spend legible.

Category before average. Always.

## Failure mode 5: No trigger for seat retirement

The fifth failure mode is the absence of a retirement trigger.

Human seats get retired through performance reviews, restructures, and role eliminations. Those processes are uncomfortable enough that organizations run them on discipline. AI seats have no natural forcing function. There is no HR conversation. Nobody drafts a severance letter. The spend just continues until someone manually pulls the plug.

We had this happen with Jeff, our former data integrity agent. The seat was consuming budget. The outputs had been absorbed by other seats over time. Nobody retired the seat because there was no scheduled process that would surface the redundancy. When we finally ran the audit in April, the retirement decision was obvious. The outputs had migrated. The seat had not followed.

The governance model has to include a retirement review cadence. Every AI seat on the chart should be reviewed quarterly against two questions: is this seat still producing the output it was hired for, and is that output still the output the business needs. If the answer to either is no, the retirement conversation happens at the next Monday meeting, not eventually.

## The model that works

What I have described is not a CFO framework in the way most finance leaders would recognize that phrase. It is an operational discipline.

The scorecard carries every seat, human and agent, in one view. Each seat has an owner. Each seat has output metrics that are business-outcome language, not runtime language. Each seat has a consumption line that is tracked against those outputs. The review cadence is monthly for routine seats, weekly for high-spend seats, and quarterly for retirement eligibility.

Janine watches the billing reality. Tally keeps the scorecard current. Dash keeps the consumption honest. I own the accountability structure.

That is the governance model. Let agents carry the operational work, and make humans accountable for the results those agents produce. The CFO's job is to keep those two things connected.

## See the live chart

You can query the Sneeze It org chart, including which seats are agents and what each one is accountable for, directly from the OTP MCP.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me which seats on the sneeze-it chart are AI agents and what outputs each one is accountable for."*

You will see the seat list with roles and accountability metrics. That is the governance structure rendered live. It is also the structure you would replicate to make your own AI spend visible.
