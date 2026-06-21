---
title: Agent ROI is not what you think it is, and measuring it wrong is why most agent projects get canceled
date: 2026-06-21
author: David Steel
slug: how-a-ceo-measures-the-roi-of-the-agent-workforce
type: founder_essay
status: published
series: ai-ceo
series_part: 48
description: The CEO's framework for measuring whether an agent workforce is actually paying off, with a worked example from Sneeze It's 10-agent fleet.
---

# Agent ROI is not what you think it is, and measuring it wrong is why most agent projects get canceled

Most agent projects die at the ROI question.

Not because the agents are not working. Because the people measuring them are using the wrong math.

According to Gartner, as reported by CIO.com, over 40% of agentic AI projects are expected to be canceled by end of 2027, killed by escalating costs, unclear value, and inadequate risk controls. That cancellation rate is not an indictment of agents. It is an indictment of how organizations are measuring them. When you measure the wrong thing, you get the wrong answer, and the project dies.

The CEO's job is to measure agent ROI the right way. This post shows you the framework and walks through how I apply it at Sneeze It, where I run ten agents on one accountability chart.

## Why the obvious ROI calculation fails

The obvious calculation goes like this. I pay for an AI subscription. The agent handles some tasks. I compare the cost of the subscription to what a human would cost to do those tasks. If the subscription is cheaper, the agent wins.

That calculation is wrong in two ways.

First, it misunderstands what an agent replaces. A human doing routine coordination work is also doing other things: catching edge cases, building relationships, using judgment when the situation does not fit the SOP. When you replace that human with an agent, you do not get a cheaper human. You get a machine that handles the predictable work perfectly and needs active supervision for everything else. The ROI math has to include the cost of that supervision, or it lies.

Second, it measures the agent as an expense category instead of as a seat on the org chart. An expense category gets measured against what it costs. A seat on the org chart gets measured against what it produces. The difference is not semantic. It is the difference between asking "is this agent worth what I pay for it?" and "is this seat delivering the output I need it to deliver?" The first question leads to cancellation. The second question leads to management.

The right framework measures agents as seats. What is the seat supposed to produce? Is it producing that? What is the gap costing the business?

## The three numbers that actually matter

For every agent seat at Sneeze It, I track three numbers. Not runtime metrics. Not infrastructure costs. Three business-outcome numbers.

**Output volume.** How much work is the seat producing per week, measured in the unit that matters to the business? For Tally, our scorecard agent, output volume is KPI pushes per day. For Nick, our cold prospecting agent, it is qualified emails drafted per day (target: 30). For Dash, our analytics agent, it is client account audits completed per day. The number is specific to the seat. The discipline is the same.

**Output quality.** Of the output produced, what fraction meets the standard we would accept from a human in that seat? For Nick, quality is defined as: email went to a named individual, not a generic address, and passed email validation. A drafted email that fails the quality gate does not count toward the output target. For Arin, our call center manager, quality is whether the coaching message she drafted was approved without revision. Unapproved drafts are not bad agents; they are feedback signals. Track them.

**Business impact.** What happened downstream as a result of the output? For Nick, the downstream impact is qualified meetings booked. For Dirk, our sales agent, it is pipeline created and deals advanced. For Pulse, our retention agent, it is client retention rate and flagged churn risks. Business impact is the number that connects the agent's seat to the P&L. It is also the hardest number to attribute cleanly, which is why most operators skip it. Do not skip it. An agent whose output volume and quality look good but whose downstream business impact is flat is telling you something important about whether the seat is in the right place in the org.

These three numbers, tracked weekly for every seat on the chart, are how I know within one week whether an agent is working. Not within one quarter. Within one week.

## A worked example: Sneeze It's agent fleet

Let me show you what this looks like with real seats.

**Radar (chief of staff).** Output volume: one compiled daily briefing per day, seven days a week. Output quality: briefing covers all nine data sources; anything stale is flagged. Business impact: the harder metric. What I measure is my own response time to urgent items. When Radar is running well, I know about client escalations before I see my calendar. When Radar drifts, I learn about them in the meeting. The ROI of this seat is not the cost of the briefing software. It is the cost of missed escalations I no longer pay.

**Nick (cold prospecting).** Output volume: 30 qualified emails drafted per day, targeting health and wellness businesses. Output quality: 100% to named individuals, 0% to generic addresses, all passed bounce-gate validation. Business impact: qualified meetings booked from cold outreach. This seat runs against a clear counterfactual. I can measure what it costs to source, hire, train, and manage a human SDR, and I can compare that to what Nick costs to operate. The math is not ambiguous. What I watch for is drift: when Nick's quality rate falls below standard (too many generic addresses, or emails that fail the ICP test), the business impact number will lag it by about two weeks. I correct at quality, not at business impact. Correcting at business impact is correcting too late.

**Arin (call center manager).** Output volume: daily performance Slack drafts for the calling team, individualized per agent. Output quality: approval rate without revision. Business impact: call center appointment rate vs. 30% target. This seat is a clean ROI case because the counterfactual is concrete. I had a human call center manager before Arin. I know what that cost. I know what the appointment rate was. Arin runs daily instead of intermittently. The coaching is more consistent. The appointment rate is the business outcome the seat is accountable for, not the cost of the Slack messages.

**Crystal (project manager).** Output volume: active project status reports per week. Output quality: reports flag stale projects, missed milestones, and resource gaps without being prompted. Business impact: delivery risk caught before client impact. The ROI here is the avoided cost of a missed deadline, not the cost of the report. This is the hardest measurement conversation to have because avoided costs are invisible. What I track is the ratio of delivery risks Crystal flags before they become client issues vs. after. The direction of that ratio tells me whether the seat is working.

## What to do when the ROI math does not close

Sometimes it does not close. The agent is producing output. The quality is acceptable. The downstream business impact is flat or unmeasurable. This happens, and it tells you one of three things.

The seat is in the wrong place in the org. If Nick books meetings but no one follows up in 24 hours, Nick's ROI calculation will never close, because the value leaks at the next seat. The problem is not Nick. The problem is the system Nick is feeding.

The seat's business impact metric is too far downstream. Some seats produce output that converts to business impact over a long lag. A retention agent whose work pays off in a 12-month renewal cycle looks like a zero-ROI seat for the first 11 months. Do not cancel the seat. Shorten the attribution lag by adding an intermediate metric closer to the output. For Pulse, the intermediate metric is churn risk flags that were acted on, not just whether clients renewed.

The seat was never clearly defined. This is the most common cause of failed ROI math, and it is the CEO's fault, not the agent's. If you could not write the seat description before you built the agent, the agent will produce output that nobody knows how to value. The fix is not better measurement. It is going back and defining the seat.

MIT CISR's research on enterprise AI maturity makes this visible at scale. Stage 4 firms, the ones who have reached what CISR calls "AI future ready," post 13.9 percentage points above industry average on growth and 9.9 percentage points above on profit. The difference between Stage 1 and Stage 4 is not which models they use. It is whether AI is managed as an operating discipline with clear roles and accountability. Measurement is what converts an agent experiment into an operating discipline.

## The ROI number I actually report

At Sneeze It, the number I report to myself every Monday is not a cost-savings figure. It is output per human-equivalent hour.

Every week, I can calculate how many hours a human team would have needed to produce what my agent fleet produced. I do that calculation for each seat: the Radar briefings, the Nick prospecting batch, the Arin coaching drafts, the Crystal status reports, the Tally KPI pushes, the Dash account audits. I add them up. I compare that to the number of hours my human team (Bogdan, Janine, Kristen, and the rest) actually spent on operations that week.

The ratio tells me whether my operating leverage is moving in the right direction. When it goes up, agents are carrying more of the operational load and my humans are doing more of the judgment work. When it goes down, something has drifted and I need to find where.

This is the mission I signed up for: let agents carry the operational work, so people are free for the work that matters. The ROI measurement is how I know whether the mission is succeeding, not as a pitch but as a fact.

Deloitte's 2026 State of AI survey (n=3,235) found that only 21% of enterprises have a mature governance model for agentic AI. The 79% without one are the same organizations that will cancel their agent projects by 2027. The difference between the two groups is not the quality of their agents. It is whether they have a system for measuring, governing, and managing those agents the way they manage the rest of the business.

The CEO who measures agent ROI the right way keeps the agents. The CEO who measures it wrong cancels them. The agents are the same. The measurement is what changes.

## See the live chart

You can query the current seat metrics and accountability structure for Sneeze It's agent fleet directly through the OTP MCP, including which seats are currently above or below their output targets.

In Claude Desktop or Cursor or any MCP client, add this block:

```
"otp": {
  "command": "npx",
  "args": ["-y", "@orgtp/mcp-server"]
}
```

Restart the client. Then ask: *"Use OTP to show me the seats on the Sneeze It org chart and the KPI each seat is accountable for."*

You will see the same one-seat-one-owner structure described in this post, with the business-outcome metric attached to each seat. That is what ROI measurement looks like when it is embedded in the operating system, not bolted on after the fact.
