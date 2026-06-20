---
title: Cost per task is the number that makes the agent ROI argument stop being an argument
date: 2026-06-20
author: David Steel
slug: cost-per-task-versus-fully-loaded-labor-cost
type: founder_essay
status: published
series: ai-cfo
series_part: 9
description: How to calculate cost per task for an AI agent and compare it honestly against fully-loaded labor cost. The math most operators skip.
---

# Cost per task is the number that makes the agent ROI argument stop being an argument

Most operators running AI agents have a rough sense that they are cheaper than hiring. What they do not have is the number that proves it for any specific piece of work. That gap is why agent ROI debates stay debates instead of becoming decisions.

Cost per task is that number.

It is simple arithmetic. Take the total cost of running an agent over a period, divide by the number of tasks that agent completed in the same period, and you have cost per task. Compare it to the cost of a human doing the same task, calculated the same way. The comparison either holds or it does not.

The reason operators avoid this math is not that it is hard. It is that they are not sure what to include. They undercount the cost on the agent side or undercount the cost on the human side and the comparison ends up useless. This post walks through how to run the calculation correctly on both sides.

## 1. Start with what "fully-loaded labor cost" actually means

The number most operators use when they think about what a person costs is the salary line. It is also the least accurate number you could use.

Fully-loaded labor cost is salary plus every cost that goes with it. Benefits (health insurance, dental, vision, 401k matching, PTO payouts). Payroll taxes (FICA, state, local). Tools the person needs to do the job (software seats, hardware, subscriptions). Management overhead (the time a manager spends supervising that person, prorated as a cost). Training and onboarding. Recruiting cost amortized over average tenure. The number usually lands somewhere between 1.25 and 1.5 times salary, before you factor in management overhead.

At Sneeze It, when I look at what a seat actually costs the business, I include all of that. Janine, our accounting seat, carries a fully-loaded cost that is well above her salary line when I account for the tools she needs, the time Bogdan spends managing that function, and the overhead that goes with any human on payroll. That is the honest number. It is the one you have to beat to justify an agent in the same seat.

## 2. What goes into the agent side of the calculation

The agent side has four cost inputs: inference, tooling, the oversight a human puts in, and the failure rate.

**Inference** is what you pay the model per token, per API call, or per run depending on how you are billed. If your agent runs on a flat monthly fee, this is simple. If you are paying per call, you need to know the average call cost and multiply by volume.

**Tooling** is the cost of any system the agent depends on: MCP servers, integrations, the compute that hosts the orchestration layer. Tally, our scorecard agent at Sneeze It, depends on a Python runner, the OTP REST layer, and MCP tooling. When I calculate what Tally costs per KPI push, those infrastructure inputs are in the denominator.

**Oversight** is the cost people do not include and then wonder why the comparison feels off. Every agent task that a human reviews, approves, or corrects carries a labor cost. If Dirk, our sales agent, drafts an outreach sequence and David approves it before it goes out, that approval is a labor cost and it belongs in the agent's cost per task, not just on the human side of the ledger. You cannot claim the agent is cheap while hiding the human review cost somewhere else.

**Failure rate** adjusts the denominator. If the agent completes 100 tasks but 15 of them require a human to redo the work, your effective task output is not 100. It is closer to 85, and the redo cost belongs on the agent's tab.

Once you have all four inputs, divide by completed tasks. That is your agent's cost per task.

## 3. Pick tasks where the comparison is fair

Not every task is the right test. The agent wins big on volume work that is repetitive, time-boxed, and well-defined. It loses or breaks even on work that requires judgment calls, context from relationships, or stakes high enough that human oversight costs eat the savings.

At Sneeze It, Dash, our analytics agent, scans ad account performance across more than 60 accounts every day. The per-account cost of that scan is fractions of a cent. The equivalent human labor, if we had an analyst running manual account reviews at that frequency and coverage, would cost orders of magnitude more. The comparison is not close and it is not supposed to be. Dash owns that work because agents own that category.

Arin, our call center manager, coaches the calling team through daily Slack messages. That work sits in a different category. The messages require reading performance data, writing in a voice that the team responds to, and adjusting tone when someone is having a rough week. Arin does a version of it, but the human review cost before anything goes to the team is real and it is in the cost calculation. The per-message cost is not as clean as Dash's per-scan cost. That is honest accounting.

## 4. The comparison that actually moves decisions

Once you have cost per task for the agent and cost per task for the equivalent human work, the comparison usually looks like one of three things.

The agent wins by a large margin on volume and repetition. This is the Dash category. The decision is straightforward: the agent owns the work.

The agent wins on margin but requires enough human oversight that the savings are smaller than expected. This is the Arin category. The decision is still usually yes, but the business case is about coverage and consistency, not pure cost savings. The agent runs at 3 a.m. when the human cannot.

The agent and human are close enough that the decision rests on something other than cost. Reliability, relationship, stakes. In those cases, cost per task is not the deciding variable. It is just the variable that clears the table so you can see the real decision underneath.

## 5. Put the numbers somewhere they stay

The mistake after doing this calculation once is not doing it again. Costs shift. Agent pricing changes. Volume grows. Human labor costs compound. The comparison that was true in January is not necessarily true in June.

We track agent costs and output in the same place we track everything else: the Sneeze It org chart on OTP. Every agent seat has a cost input and a task output. Tally pushes KPI values. The chart surface keeps the numbers visible across meetings. The cost per task comparison stays live instead of becoming a spreadsheet nobody opens.

That is the real discipline. Not a one-time calculation. A standing number that shows up in the same weekly review where every other cost shows up.

Agents are not automatically cheap. They are cheap on the right work, measured correctly. The operators who figure that out early stop debating ROI and start routing work.

## See the live chart

You can query any agent seat on the Sneeze It chart, including its role scope and task outputs, through the OTP MCP server.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me which seats on the Sneeze It chart are agents and what work they own."*

You will see the seat list, the role definitions, and the task scope for each agent. From there you can map that to your own org and run the cost per task comparison against your current labor spend.
